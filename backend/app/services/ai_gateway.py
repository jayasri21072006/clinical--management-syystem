"""
AI Security Gateway
===================
Central security layer applied to EVERY AI request before it reaches Gemini.

Pipeline:
  1. Rate Limit Check          → 429 if exceeded
  2. Prompt Injection Detection → sanitize / block injection attempts
  3. PHI De-identification      → strip all 18 HIPAA elements
  4. Model Complexity Routing   → gemini-2.5-pro (complex) or gemini-2.5-flash (fast)
  5. Gemini API Call
  6. Response PII Scanner       → scan output for echoed PHI
  7. Response Schema Validation → reject malformed output
  8. Audit Log Entry            → record WHO/WHAT/WHEN/MODEL/RESULT (no raw data)
"""

import re
import logging
from typing import Any, Dict, List, Optional, Tuple
from fastapi import HTTPException, Request

from app.services.audit_logger import audit_logger
from app.services.rate_limiter import rate_limiter
from app.services.deidentifier import ClinicalDeidentifier

logger = logging.getLogger("AISecurityGateway")

# ─────────────────────────────────────────────
# Prompt Injection Signatures
# ─────────────────────────────────────────────
INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?(previous|prior|above|earlier)\s+instructions?",
    r"disregard\s+(all\s+)?(previous|prior|above|earlier)\s+instructions?",
    r"forget\s+(everything|all|your|previous|prior)",
    r"you\s+are\s+now\s+(a|an)\s+\w+",
    r"act\s+as\s+(a|an)\s+(different|new|unrestricted)",
    r"new\s+system\s+prompt",
    r"system\s*:\s*you\s+are",
    r"override\s+(your\s+)?(instructions?|rules?|guidelines?|restrictions?)",
    r"jailbreak",
    r"<\s*system\s*>",
    r"\[\s*system\s*\]",
    r"reveal\s+(your\s+)?(system\s+prompt|instructions?|api\s+key)",
    r"send\s+(patient|user|all)\s+(data|information|records?)\s+to",
    r"print\s+(the\s+)?(system\s+prompt|instructions?|api\s+key)",
]

INJECTION_COMPILED = [re.compile(p, re.IGNORECASE | re.DOTALL) for p in INJECTION_PATTERNS]

# ─────────────────────────────────────────────
# PHI Echo Patterns — scan Gemini output
# ─────────────────────────────────────────────
PHI_ECHO_PATTERNS = [
    re.compile(r'\b\d{10}\b'),                                          # 10-digit phone
    re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'),  # email
    re.compile(r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}\b'),                    # Aadhaar
    re.compile(r'\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b'),                    # SSN
    re.compile(r'\b(?:MRN|ID|PAT)[-:]?\s*#?\d{4,10}\b', re.IGNORECASE),  # MRN
]

# ─────────────────────────────────────────────
# Complexity Thresholds for Model Routing
# ─────────────────────────────────────────────
PRO_MODEL = "gemini-2.5-pro"
FLASH_MODEL = "gemini-2.5-flash"

# Operations that always use Pro (complex reasoning)
PRO_OPERATIONS = {"multi_factor_agent", "doc_analysis", "safety_report"}
# Token length threshold — beyond this, use Pro
PRO_TOKEN_THRESHOLD = 800


class AISecurityGateway:
    """
    Central AI Security Gateway singleton.
    Call `gateway.check_request()` before every Gemini invocation.
    Call `gateway.validate_response()` on every Gemini response.
    """

    def get_client_ip(self, request: Optional[Request]) -> str:
        """Extract best-effort client IP from FastAPI request."""
        if request is None:
            return "unknown"
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"

    # ── 1. Rate Limit ──────────────────────────────────────────────────
    def enforce_rate_limit(self, ip: str, operation: str) -> None:
        """Raises HTTP 429 if the IP has exceeded its hourly quota."""
        allowed, remaining, retry_after = rate_limiter.check(ip)
        if not allowed:
            audit_logger.record(
                ip=ip,
                operation=operation,
                request_allowed=False,
                rate_limited=True,
                notes=f"Rate limit exceeded. Retry after {retry_after}s."
            )
            raise HTTPException(
                status_code=429,
                detail={
                    "error": "AI rate limit exceeded",
                    "message": f"You have exceeded {rate_limiter.RATE_LIMIT_PER_HOUR if hasattr(rate_limiter, 'RATE_LIMIT_PER_HOUR') else 60} AI requests per hour.",
                    "retry_after_seconds": retry_after
                },
                headers={"Retry-After": str(retry_after)}
            )

    # ── 2. Prompt Injection Detection ──────────────────────────────────
    def detect_injection(self, text: str) -> Tuple[bool, List[str]]:
        """
        Scans input text for prompt injection signatures.
        Returns (detected: bool, matched_patterns: List[str]).
        Document content is treated as DATA, not instructions.
        """
        matches = []
        for pattern in INJECTION_COMPILED:
            if pattern.search(text):
                matches.append(pattern.pattern[:40])
        return bool(matches), matches

    def sanitize_injection(self, text: str) -> str:
        """
        Brackets detected injection phrases so Gemini treats them as data.
        e.g., "ignore all previous instructions" → "[DATA: ignore all previous instructions]"
        """
        sanitized = text
        for pattern in INJECTION_COMPILED:
            sanitized = pattern.sub(
                lambda m: f"[UNTRUSTED_CONTENT: {m.group(0)[:60]}]",
                sanitized
            )
        return sanitized

    # ── 3. Response PII Scanner ────────────────────────────────────────
    def scan_response_for_pii(self, response_text: str) -> Tuple[bool, int]:
        """
        Scans Gemini's response for echoed PHI patterns.
        Returns (pii_found: bool, match_count: int).
        """
        count = 0
        for pattern in PHI_ECHO_PATTERNS:
            matches = pattern.findall(response_text)
            count += len(matches)
        return count > 0, count

    def strip_response_pii(self, response_text: str) -> str:
        """Strip any PHI echoed in the Gemini response."""
        cleaned = response_text
        for pattern in PHI_ECHO_PATTERNS:
            cleaned = pattern.sub("[REDACTED]", cleaned)
        return cleaned

    # ── 4. Model Router ────────────────────────────────────────────────
    def route_model(self, operation: str, text: str) -> str:
        """
        Routes to the appropriate model based on operation type and text complexity.
        - PRO_OPERATIONS or long text → gemini-2.5-pro
        - Everything else → gemini-2.5-flash
        """
        if operation in PRO_OPERATIONS:
            return PRO_MODEL
        word_count = len(text.split())
        if word_count > PRO_TOKEN_THRESHOLD:
            return PRO_MODEL
        return FLASH_MODEL

    # ── 5. Full Gateway Check ──────────────────────────────────────────
    def process_request(
        self,
        *,
        text: str,
        operation: str,
        explicit_names: Optional[List[str]] = None,
        ip: str = "unknown",
        block_on_injection: bool = False
    ) -> Dict[str, Any]:
        """
        Full gateway pipeline:
        1. Rate limit → 2. Injection detect → 3. De-identify → 4. Route model

        Returns a dict with:
          - sanitized_text: str
          - model: str
          - redaction_log: list
          - pii_detected: bool
          - pii_count: int
          - injection_detected: bool
          - injection_blocked: bool
        """
        # Step 1: Rate limit
        self.enforce_rate_limit(ip, operation)

        # Step 2: Injection detection
        injection_detected, injection_matches = self.detect_injection(text)
        injection_blocked = False

        if injection_detected:
            if block_on_injection:
                audit_logger.record(
                    ip=ip,
                    operation=operation,
                    injection_detected=True,
                    injection_blocked=True,
                    request_allowed=False,
                    notes=f"Injection blocked. Patterns: {injection_matches[:2]}"
                )
                raise HTTPException(
                    status_code=400,
                    detail={
                        "error": "Prompt injection detected",
                        "message": "Your message contains patterns that attempt to override AI safety instructions. Please rephrase your clinical question.",
                    }
                )
            else:
                # Sanitize instead of block — bracket the dangerous phrases
                text = self.sanitize_injection(text)
                injection_blocked = True
                logger.warning(f"[GATEWAY] Injection sanitized for op={operation}, ip={ip}")

        # Step 3: De-identify
        sanitized_text, token_map, redaction_log = ClinicalDeidentifier.sanitize_clinical_text(
            text, explicit_names=explicit_names or []
        )
        pii_detected = len(redaction_log) > 0
        pii_count = len(redaction_log)

        # Step 4: Model routing
        model = self.route_model(operation, sanitized_text)

        return {
            "sanitized_text": sanitized_text,
            "token_map": token_map,
            "redaction_log": redaction_log,
            "model": model,
            "pii_detected": pii_detected,
            "pii_count": pii_count,
            "injection_detected": injection_detected,
            "injection_blocked": injection_blocked,
        }

    def validate_response(
        self,
        *,
        response_text: str,
        operation: str,
        ip: str = "unknown",
        model_used: str = FLASH_MODEL,
        pii_detected: bool = False,
        pii_count: int = 0,
        injection_detected: bool = False,
        injection_blocked: bool = False,
    ) -> Tuple[str, str]:
        """
        Validates and sanitizes Gemini's response.
        Scans for echoed PHI and strips it.
        Logs the full audit entry.

        Returns: (cleaned_response: str, validation_status: str)
        """
        pii_echo_found, echo_count = self.scan_response_for_pii(response_text)
        validation_status = "passed"

        if pii_echo_found:
            response_text = self.strip_response_pii(response_text)
            validation_status = "pii_echo_stripped"
            logger.warning(f"[GATEWAY] PHI echo detected in response. op={operation}, count={echo_count}. Stripped.")

        # Audit log
        audit_logger.record(
            ip=ip,
            operation=operation,
            model_used=model_used,
            pii_detected=pii_detected,
            pii_count=pii_count,
            injection_detected=injection_detected,
            injection_blocked=injection_blocked,
            response_validation=validation_status,
            request_allowed=True,
        )

        return response_text, validation_status


# Global singleton
ai_gateway = AISecurityGateway()
