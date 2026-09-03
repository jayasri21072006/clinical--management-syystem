"""
Audit Log Router
================
GET  /api/ai/audit-log  — Returns last N sanitized audit entries
GET  /api/ai/audit-stats — Returns aggregate security statistics
"""

from fastapi import APIRouter, Query
from app.services.audit_logger import audit_logger

router = APIRouter(prefix="/api/ai", tags=["AI Audit & Governance"])


@router.get("/audit-log")
def get_audit_log(limit: int = Query(default=100, le=500, ge=1)):
    """
    Returns the most recent AI security audit log entries.
    All entries are sanitized — no raw clinical text, no PHI, no patient data.
    Only metadata: WHO (IP) · WHAT (operation) · WHEN · WHICH MODEL · RESULT.
    """
    entries = audit_logger.get_recent(limit=limit)
    return {
        "status": "success",
        "total_entries": len(entries),
        "entries": entries,
        "compliance_note": "Audit log contains only metadata. No raw clinical text or PHI is stored."
    }


@router.get("/audit-stats")
def get_audit_stats():
    """
    Returns aggregate security statistics over the current audit buffer.
    Useful for the dashboard model-routing banner.
    """
    stats = audit_logger.get_stats()
    return {
        "status": "success",
        "stats": stats,
        "gateway_active": True,
        "models_active": ["gemini-2.5-flash", "gemini-2.5-pro"],
        "privacy_gateway": "Server-Side HIPAA De-Identification Active",
        "rate_limiting": "Active (60 req/hour per IP)"
    }
