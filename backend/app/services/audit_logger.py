"""
Clinical AI Audit Logger
========================
Maintains a compliance audit trail for every AI gateway operation.
Records: WHO · WHAT · WHEN · WHICH MODEL · POLICY DECISION · RESULT
NEVER stores: raw clinical text, PHI, patient names, prompt content.
"""

import uuid
import logging
import threading
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from collections import deque

logger = logging.getLogger("AuditLogger")

# Max entries to keep in rotating buffer
MAX_AUDIT_ENTRIES = 1000


class AuditLogger:
    """
    Thread-safe singleton audit logger for AI Security Gateway operations.
    All entries are sanitized — no raw prompts, no patient data.
    """

    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super().__new__(cls)
                cls._instance._log = deque(maxlen=MAX_AUDIT_ENTRIES)
                cls._instance._write_lock = threading.Lock()
        return cls._instance

    def record(
        self,
        *,
        ip: str = "unknown",
        operation: str,
        model_used: str = "gemini-2.5-flash",
        pii_detected: bool = False,
        pii_count: int = 0,
        injection_detected: bool = False,
        injection_blocked: bool = False,
        response_validation: str = "passed",
        request_allowed: bool = True,
        rate_limited: bool = False,
        error: Optional[str] = None,
        notes: Optional[str] = None
    ) -> str:
        """Record a single audit event. Returns the generated request_id."""
        request_id = str(uuid.uuid4())[:8].upper()
        entry: Dict[str, Any] = {
            "request_id": request_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "ip": ip,
            "operation": operation,
            "model_used": model_used,
            "pii_detected": pii_detected,
            "pii_count": pii_count,
            "pii_removed": pii_detected,
            "injection_detected": injection_detected,
            "injection_blocked": injection_blocked,
            "response_validation": response_validation,
            "request_allowed": request_allowed,
            "rate_limited": rate_limited,
            "error": error,
            "notes": notes,
        }

        with self._write_lock:
            self._log.appendleft(entry)

        status_emoji = "✅" if request_allowed and response_validation == "passed" else ("🚫" if injection_blocked or rate_limited else "⚠️")
        logger.info(
            f"[AUDIT {status_emoji}] id={request_id} op={operation} model={model_used} "
            f"pii={pii_count} inject={injection_blocked} validation={response_validation}"
        )
        return request_id

    def get_recent(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Returns the most recent audit entries (sanitized, no raw data)."""
        with self._write_lock:
            return list(self._log)[:limit]

    def get_stats(self) -> Dict[str, Any]:
        """Aggregate statistics over the current buffer."""
        with self._write_lock:
            entries = list(self._log)

        total = len(entries)
        if total == 0:
            return {"total_requests": 0}

        return {
            "total_requests": total,
            "requests_allowed": sum(1 for e in entries if e["request_allowed"]),
            "requests_blocked": sum(1 for e in entries if not e["request_allowed"]),
            "pii_detections": sum(1 for e in entries if e["pii_detected"]),
            "injection_detections": sum(1 for e in entries if e["injection_detected"]),
            "injection_blocks": sum(1 for e in entries if e["injection_blocked"]),
            "response_failures": sum(1 for e in entries if e["response_validation"] != "passed"),
            "rate_limited_requests": sum(1 for e in entries if e["rate_limited"]),
            "pro_model_uses": sum(1 for e in entries if "pro" in e.get("model_used", "")),
            "flash_model_uses": sum(1 for e in entries if "flash" in e.get("model_used", "")),
        }


# Global singleton
audit_logger = AuditLogger()
