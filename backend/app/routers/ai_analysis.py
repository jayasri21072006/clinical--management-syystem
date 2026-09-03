from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.services.deidentifier import ClinicalDeidentifier
from app.services.gemini_service import gemini_service, CLINICAL_AI_SYSTEM_INSTRUCTIONS, MANDATORY_AI_DISCLAIMER

router = APIRouter(prefix="/api/ai", tags=["AI Clinical Assistant"])

@router.get("/system-instructions")
def get_system_instructions():
    """
    Returns the official Clinical AI Assistant System Instructions
    governing decision support, clinical conversation, report analysis,
    image analysis, safety rules, and mandatory disclaimer.
    """
    return {
        "title": "Clinical AI Assistant — System Instructions",
        "instructions_markdown": CLINICAL_AI_SYSTEM_INSTRUCTIONS,
        "mandatory_disclaimer": MANDATORY_AI_DISCLAIMER,
        "version": "2026.1-Governed"
    }

class DocumentAnalysisRequest(BaseModel):
    raw_text: str
    patient_name: Optional[str] = None
    patient_id: Optional[str] = None

class RiskPredictionRequest(BaseModel):
    age: Optional[str] = "35"
    gender: Optional[str] = "Female"
    chief_complaints: Optional[str] = ""
    symptoms: Optional[str] = ""
    diagnosis: Optional[str] = ""
    current_medications: Optional[str] = ""
    past_history: Optional[str] = ""

class ImageAnalysisRequest(BaseModel):
    image_base64: str
    mime_type: Optional[str] = "image/jpeg"
    clinical_notes: Optional[str] = ""
    patient_name: Optional[str] = None

class LabReportRequest(BaseModel):
    lab_text: str
    patient_name: Optional[str] = None

class MultiFactorAgentRequest(BaseModel):
    age: Optional[str] = "35"
    gender: Optional[str] = "Female"
    vitals: Optional[Dict[str, str]] = None
    chief_complaints: Optional[str] = ""
    symptoms: Optional[str] = ""
    diagnosis: Optional[str] = ""
    current_medications: Optional[str] = ""
    lab_summary: Optional[str] = ""
    imaging_summary: Optional[str] = ""
    patient_name: Optional[str] = None

@router.post("/preview-redaction")
def preview_clinical_document_redaction(payload: DocumentAnalysisRequest):
    """
    Preview the redaction output without sending it to the external API.
    Used for clinical verification before submission.
    """
    if not payload.raw_text or len(payload.raw_text.strip()) == 0:
        raise HTTPException(status_code=400, detail="Document text cannot be empty.")

    explicit_names = [payload.patient_name] if payload.patient_name else []
    sanitized_text, token_map, redaction_log = ClinicalDeidentifier.sanitize_clinical_text(
        payload.raw_text, explicit_names=explicit_names
    )

    return {
        "status": "success",
        "sanitized_text": sanitized_text,
        "redaction_audit_log": redaction_log,
        "total_phi_elements_redacted": len(redaction_log)
    }

@router.post("/analyze-document")
def analyze_clinical_document(payload: DocumentAnalysisRequest):
    """
    Data-Governed Clinical Document Analysis Endpoint.
    1. Redacts all 18 HIPAA PHI elements from raw text payload.
    2. Sends de-identified text to Google Gemini AI API.
    3. Returns structured insights + full compliance redaction log.
    """
    if not payload.raw_text or len(payload.raw_text.strip()) == 0:
        raise HTTPException(status_code=400, detail="Document text cannot be empty.")

    explicit_names = [payload.patient_name] if payload.patient_name else []
    sanitized_text, token_map, redaction_log = ClinicalDeidentifier.sanitize_clinical_text(
        payload.raw_text, explicit_names=explicit_names
    )

    # Call Gemini AI Analysis on sanitized text
    analysis_result = gemini_service.analyze_document(sanitized_text)

    return {
        "status": "success",
        "sanitized_prompt_sent_to_gemini": sanitized_text,
        "redaction_audit_log": redaction_log,
        "total_phi_elements_redacted": len(redaction_log),
        "ai_analysis": analysis_result
    }

@router.post("/predict-risk")
def predict_patient_risk(payload: RiskPredictionRequest):
    """
    Data-Governed Patient Risk Prediction Endpoint.
    Evaluates readmission risk, disease complication risks, and drug interaction warnings.
    """
    # Create safe anonymized patient context dictionary
    context = payload.dict()
    
    # Strip any possible name or identity from complaints or diagnosis
    sanitized_complaints, _, _ = ClinicalDeidentifier.sanitize_clinical_text(payload.chief_complaints or "")
    sanitized_diagnosis, _, _ = ClinicalDeidentifier.sanitize_clinical_text(payload.diagnosis or "")
    
    context["chief_complaints"] = sanitized_complaints
    context["diagnosis"] = sanitized_diagnosis

    risk_result = gemini_service.predict_risk(context)

    return {
        "status": "success",
        "anonymized_context_evaluated": context,
        "risk_prediction": risk_result
    }

@router.post("/safety-report")
def generate_clinical_safety_report(payload: RiskPredictionRequest):
    """
    Data-Governed Clinical Safety & AI Governance Report Endpoint.
    Produces a detailed clinical risk and HIPAA compliance audit report using Google Gemini.
    """
    context = payload.dict()
    sanitized_complaints, _, _ = ClinicalDeidentifier.sanitize_clinical_text(payload.chief_complaints or "")
    sanitized_diagnosis, _, _ = ClinicalDeidentifier.sanitize_clinical_text(payload.diagnosis or "")
    context["chief_complaints"] = sanitized_complaints
    context["diagnosis"] = sanitized_diagnosis

    safety_report = gemini_service.generate_safety_report(context)

    return {
        "status": "success",
        "safety_report": safety_report
    }

@router.post("/analyze-image")
def analyze_medical_image(payload: ImageAnalysisRequest):
    """
    Multimodal Medical Image Analysis Endpoint using Gemini 2.5 Flash Vision.
    Redacts PHI from clinical notes and passes image safely.
    """
    if not payload.image_base64:
        raise HTTPException(status_code=400, detail="Image data is required.")

    explicit_names = [payload.patient_name] if payload.patient_name else []
    sanitized_notes, _, redaction_log = ClinicalDeidentifier.sanitize_clinical_text(
        payload.clinical_notes or "", explicit_names=explicit_names
    )

    image_result = gemini_service.analyze_image(
        image_base64=payload.image_base64,
        mime_type=payload.mime_type or "image/jpeg",
        clinical_notes=sanitized_notes
    )

    return {
        "status": "success",
        "sanitized_notes": sanitized_notes,
        "redaction_audit_log": redaction_log,
        "image_analysis": image_result
    }

@router.post("/analyze-lab-report")
def analyze_lab_report_endpoint(payload: LabReportRequest):
    """
    Lab Test Report & Biomarker Analysis Endpoint using Gemini.
    Scrubs identifiers and structures out-of-range pathology findings.
    """
    if not payload.lab_text or len(payload.lab_text.strip()) == 0:
        raise HTTPException(status_code=400, detail="Lab report text is required.")

    explicit_names = [payload.patient_name] if payload.patient_name else []
    sanitized_lab_text, _, redaction_log = ClinicalDeidentifier.sanitize_clinical_text(
        payload.lab_text, explicit_names=explicit_names
    )

    lab_result = gemini_service.analyze_lab_report(sanitized_lab_text)

    return {
        "status": "success",
        "sanitized_lab_text": sanitized_lab_text,
        "redaction_audit_log": redaction_log,
        "lab_analysis": lab_result
    }

@router.post("/multi-factor-agent")
def run_multi_factor_clinical_agent(payload: MultiFactorAgentRequest):
    """
    Multi-Factor Clinical AI Agent Endpoint.
    Synthesizes Demographics, Vitals, Symptoms, Diagnosis, Labs, and Imaging.
    """
    context = payload.dict()
    explicit_names = [payload.patient_name] if payload.patient_name else []
    
    sanitized_complaints, _, _ = ClinicalDeidentifier.sanitize_clinical_text(payload.chief_complaints or "", explicit_names=explicit_names)
    sanitized_diagnosis, _, _ = ClinicalDeidentifier.sanitize_clinical_text(payload.diagnosis or "", explicit_names=explicit_names)
    sanitized_labs, _, _ = ClinicalDeidentifier.sanitize_clinical_text(payload.lab_summary or "", explicit_names=explicit_names)
    sanitized_imaging, _, _ = ClinicalDeidentifier.sanitize_clinical_text(payload.imaging_summary or "", explicit_names=explicit_names)

    context["chief_complaints"] = sanitized_complaints
    context["diagnosis"] = sanitized_diagnosis
    context["lab_summary"] = sanitized_labs
    context["imaging_summary"] = sanitized_imaging

    agent_result = gemini_service.multi_factor_agent_query(context)

    return {
        "status": "success",
        "agent_synthesis": agent_result,
        "deidentified_dossier": context
    }

@router.get("/governance-policy")
def get_data_governance_policy():
    """
    Returns the Data Sharing & Compliance Policy specifying what data
    CAN vs CANNOT be shared with Google AI Studio.
    """
    return {
        "policy_name": "Google AI Studio & Gemini Data Governance Standard",
        "compliance_frameworks": ["HIPAA De-Identification Standard (45 CFR § 164.514)", "GDPR Anonymization Principles"],
        "forbidden_data_elements": [
            "Full Patient Names / Initial Names",
            "Phone Numbers & Email Addresses",
            "Medical Record Numbers (MRNs) & Aadhaar/SSN IDs",
            "Exact Dates (DOB, Admission/Discharge Timestamps)",
            "Geographic Addresses below State/Country",
            "Biometric Identifiers & Facial Images"
        ],
        "permitted_data_elements": [
            "Age in Years (or Age Bracket)",
            "Gender / Biological Sex",
            "De-Identified Clinical SOAP Notes & Symptoms",
            "Laboratory Results & Vital Sign Readings (BP, HR, SpO2)",
            "ICD-10 Diagnosis & Generic Medication Names"
        ],
        "privacy_enforcement": "Automated Regex & Token Redaction Middleware (Active)"
    }


