"""
Secure Clinical AI Chat Router
================================
Full gateway pipeline for every message:
  Rate Limit → Injection Check → De-identify → Model Route → Gemini → Response Validate → Audit Log

Extra endpoints:
  POST /api/chat/preview  — PHI check without calling Gemini (for Privacy Modal)
  GET  /api/chat/session  — Session context info
"""

import uuid
import threading
from collections import deque
from typing import Dict, Any, Optional
from fastapi import APIRouter, Request

from app.schemas.schemas import (
    ChatMessageRequest, ChatMessageResponse,
    ChatPreviewRequest, ChatPreviewResponse
)
from app.services.deidentifier import ClinicalDeidentifier
from app.services.gemini_service import gemini_service, MANDATORY_AI_DISCLAIMER
from app.services.ai_gateway import ai_gateway

router = APIRouter(prefix="/api/chat", tags=["Support Chat"])

# ─────────────────────────────────────────────────────────
# In-memory conversation session store
# Keyed by session_id → deque of last 10 (role, text) pairs
# Only de-identified text is stored — never raw patient data
# ─────────────────────────────────────────────────────────
_sessions: Dict[str, deque] = {}
_sessions_lock = threading.Lock()
MAX_SESSION_TURNS = 10


def _get_or_create_session(session_id: Optional[str]) -> tuple[str, deque]:
    """Returns (session_id, context_deque). Creates new session if needed."""
    with _sessions_lock:
        if not session_id or session_id not in _sessions:
            session_id = str(uuid.uuid4())[:12]
            _sessions[session_id] = deque(maxlen=MAX_SESSION_TURNS)
        return session_id, _sessions[session_id]


def _build_context_prompt(context: deque, current_message: str) -> str:
    """Builds a conversation-aware prompt from session history (de-identified only)."""
    if not context:
        return current_message
    history_lines = []
    for role, text in context:
        prefix = "Clinician" if role == "user" else "AI"
        history_lines.append(f"{prefix}: {text[:200]}")  # truncate for token efficiency
    history_str = "\n".join(history_lines[-6:])  # last 3 turns
    return f"[Conversation History (de-identified)]\n{history_str}\n\n[Current Query]\n{current_message}"


# ─────────────────────────────────────────────────────────
# POST /api/chat  — Main chat endpoint
# ─────────────────────────────────────────────────────────
@router.post("", response_model=ChatMessageResponse)
def handle_chat_message(payload: ChatMessageRequest, request: Request = None):
    """
    Secure Clinical AI Chat Endpoint — Full Gateway Pipeline:
    1. Rate limit check
    2. Prompt injection detection & sanitization
    3. Server-Side PHI De-identification
    4. AI model routing (Flash vs Pro)
    5. Gemini AI call (text or multimodal)
    6. Response PII scan & validation
    7. Audit log entry
    8. Conversation context update
    """
    raw_message = payload.message.strip() if payload.message else ""
    ip = ai_gateway.get_client_ip(request)

    if not raw_message and not payload.image_base64:
        return ChatMessageResponse(
            reply="Please enter a message or clinical question.",
            sanitized_message="",
            redaction_count=0,
            model_used="N/A"
        )

    # ── Gateway Pipeline ──────────────────────────────────────────────
    gateway_result = ai_gateway.process_request(
        text=raw_message,
        operation="clinical_chat",
        explicit_names=[payload.patient_name] if payload.patient_name else [],
        ip=ip,
        block_on_injection=False  # sanitize injection rather than hard-block in chat
    )

    sanitized_text = gateway_result["sanitized_text"]
    model = gateway_result["model"]
    redaction_log = gateway_result["redaction_log"]
    pii_detected = gateway_result["pii_detected"]
    pii_count = gateway_result["pii_count"]
    injection_detected = gateway_result["injection_detected"]

    # ── Session Context ───────────────────────────────────────────────
    session_id, context = _get_or_create_session(payload.session_id)
    context_prompt = _build_context_prompt(context, sanitized_text)

    # ── Gemini Call ───────────────────────────────────────────────────
    reply_text = gemini_service.generate_chat_reply(
        raw_message=raw_message,
        sanitized_text=context_prompt,
        image_base64=payload.image_base64,
        mime_type=payload.mime_type or "image/jpeg"
    )

    # ── Response Validation ───────────────────────────────────────────
    reply_text, validation_status = ai_gateway.validate_response(
        response_text=reply_text,
        operation="clinical_chat",
        ip=ip,
        model_used=model,
        pii_detected=pii_detected,
        pii_count=pii_count,
        injection_detected=injection_detected,
        injection_blocked=gateway_result["injection_blocked"],
    )

    # ── Update Session Context (store only de-identified text) ────────
    with _sessions_lock:
        context.append(("user", sanitized_text[:300]))
        context.append(("ai", reply_text[:300]))

    return ChatMessageResponse(
        reply=reply_text,
        sanitized_message=sanitized_text,
        redaction_count=pii_count,
        model_used=f"Gemini 2.5 {'Pro' if 'pro' in model else 'Flash'}",
        disclaimer=MANDATORY_AI_DISCLAIMER,
        injection_detected=injection_detected,
        session_id=session_id
    )


# ─────────────────────────────────────────────────────────
# POST /api/chat/preview  — Privacy check without Gemini call
# ─────────────────────────────────────────────────────────
@router.post("/preview", response_model=ChatPreviewResponse)
def preview_chat_message(payload: ChatPreviewRequest, request: Request = None):
    """
    Privacy Preview Endpoint — runs PII detection and injection check
    WITHOUT calling Gemini. Used by the frontend Privacy Modal to show
    the clinician exactly what would be sent to AI.
    """
    raw_message = payload.message.strip() if payload.message else ""
    if not raw_message:
        return ChatPreviewResponse(
            sanitized_text="",
            redaction_log=[],
            pii_detected=False,
            pii_count=0,
            injection_detected=False,
            injection_patterns_found=[],
            safe_to_send=True
        )

    # Injection check
    injection_detected, injection_matches = ai_gateway.detect_injection(raw_message)

    # De-identify
    explicit_names = [payload.patient_name] if payload.patient_name else []
    sanitized_text, _, redaction_log = ClinicalDeidentifier.sanitize_clinical_text(
        raw_message, explicit_names=explicit_names
    )

    return ChatPreviewResponse(
        sanitized_text=sanitized_text,
        redaction_log=redaction_log,
        pii_detected=len(redaction_log) > 0,
        pii_count=len(redaction_log),
        injection_detected=injection_detected,
        injection_patterns_found=[p[:40] for p in injection_matches],
        safe_to_send=True  # we sanitize rather than block, so it's always safe to send
    )
