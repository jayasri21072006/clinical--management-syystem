from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
import re

from app.database import get_db
from app.models.models import PatientModel, CaseSummaryModel, AppointmentModel

router = APIRouter(prefix="/api/ai-risk", tags=["AI Patient Risk Prediction"])

class RiskBreakdown(BaseModel):
    age_factor: int
    symptom_severity: int
    appointment_compliance: int
    active_case_factor: int

class PatientRiskAssessment(BaseModel):
    patient_id: str
    patient_name: str
    age: str
    gender: str
    phone: str
    email: str
    status: str
    risk_score: int
    risk_level: str  # High, Moderate, Low
    risk_color: str  # hex color
    primary_factors: List[str]
    recommended_actions: List[str]
    chief_complaints: str
    symptoms: List[str]
    last_visit: str
    breakdown: RiskBreakdown

class RiskOverviewStats(BaseModel):
    total_analyzed: int
    high_risk_count: int
    moderate_risk_count: int
    low_risk_count: int
    avg_risk_score: float

HIGH_RISK_KEYWORDS = [
    "chest pain", "arrhythmia", "hypertension", "dyspnea", "stroke", "acute", 
    "hyperglycemia", "neuropathy", "substernal", "paroxysmal", "nocturnal",
    "uncontrolled diabetes", "cardiovascular"
]

MODERATE_RISK_KEYWORDS = [
    "migraine", "aura", "photophobia", "nausea", "wheezing", "asthma",
    "sciatica", "joint pain", "spondylitis", "stiffness", "pcos", "acne",
    "fatigue", "cough", "insomnia"
]

def calculate_patient_risk(patient: PatientModel, cases: List[CaseSummaryModel], appointments: List[AppointmentModel]) -> PatientRiskAssessment:
    # 1. Parse Age
    age_num = 30
    if patient.age:
        digits = re.findall(r'\d+', str(patient.age))
        if digits:
            age_num = int(digits[0])

    age_factor = 0
    primary_factors = []
    recommended_actions = []

    if age_num >= 60:
        age_factor = 28
        primary_factors.append(f"Senior Demographic ({age_num} yrs)")
    elif age_num >= 45:
        age_factor = 18
        primary_factors.append(f"Mature Demographic ({age_num} yrs)")
    elif age_num >= 30:
        age_factor = 10
    else:
        age_factor = 5

    # 2. Case Summaries & Symptoms Analysis
    patient_cases = [c for c in cases if c.patient_name.strip().lower() == patient.name.strip().lower() or c.patient_id_ref == str(patient.id)]
    
    symptom_severity = 0
    chief_complaints_text = ""
    symptoms_list = []
    last_visit = "N/A"
    active_case_factor = 0

    if patient_cases:
        latest_case = patient_cases[-1]
        chief_complaints_text = latest_case.chief_complaints or ""
        last_visit = latest_case.last_visit or "Recent"
        
        if latest_case.symptoms:
            symptoms_list = [s.strip() for s in latest_case.symptoms.split(",") if s.strip()]

        if latest_case.case_status == "Active Case":
            active_case_factor = 20
            primary_factors.append("Active Clinical Case")

        full_text = f"{latest_case.chief_complaints} {latest_case.symptoms} {latest_case.diagnosis}".lower()
        
        high_matches = [kw for kw in HIGH_RISK_KEYWORDS if kw in full_text]
        mod_matches = [kw for kw in MODERATE_RISK_KEYWORDS if kw in full_text]

        if high_matches:
            symptom_severity += min(45, 25 + len(high_matches) * 10)
            primary_factors.append(f"High Severity ({', '.join(high_matches[:2]).title()})")
        elif mod_matches:
            symptom_severity += min(30, 15 + len(mod_matches) * 5)
            primary_factors.append(f"Moderate Clinical Indicators ({', '.join(mod_matches[:2]).title()})")
        else:
            symptom_severity += 5
    else:
        symptom_severity = 5

    # 3. Appointment Patterns
    patient_appts = [a for a in appointments if a.patient.strip().lower() == patient.name.strip().lower()]
    appointment_compliance = 0
    if len(patient_appts) > 2:
        appointment_compliance = 12
        primary_factors.append("Frequent Monitoring Required")
    elif len(patient_appts) == 0:
        appointment_compliance = 8
        primary_factors.append("Pending Routine Audit")
    else:
        appointment_compliance = 5

    # Total Score Calculation (capped at 96%)
    raw_score = age_factor + symptom_severity + appointment_compliance + active_case_factor
    risk_score = min(96, max(12, raw_score))

    # Risk Level & Recommendations
    if risk_score >= 65:
        risk_level = "High"
        risk_color = "#dc2626" # Crimson Red
        recommended_actions.append("Schedule Immediate Priority Physician Review")
        recommended_actions.append("Audit Vital Signs & Cardiovascular Baseline")
        recommended_actions.append("Evaluate Remedy Dosage & Potency Adjustment")
    elif risk_score >= 40:
        risk_level = "Moderate"
        risk_color = "#d97706" # Warm Amber
        recommended_actions.append("Schedule Clinical Follow-up within 1–2 Weeks")
        recommended_actions.append("Monitor Symptom Progression & Remedy Response")
        recommended_actions.append("Review Miasmatic Remedy Sequence")
    else:
        risk_level = "Low"
        risk_color = "#059669" # Emerald Green
        recommended_actions.append("Maintain Routine Wellness & Preventive Care")
        recommended_actions.append("Continue Existing Prescribed Regimen")

    if not primary_factors:
        primary_factors = ["Standard Baseline Health Indicators"]

    return PatientRiskAssessment(
        patient_id=str(patient.id),
        patient_name=patient.name,
        age=patient.age or "N/A",
        gender=patient.gender or "Female",
        phone=patient.phone or "",
        email=patient.email or "",
        status=patient.status or "Active",
        risk_score=risk_score,
        risk_level=risk_level,
        risk_color=risk_color,
        primary_factors=primary_factors,
        recommended_actions=recommended_actions,
        chief_complaints=chief_complaints_text or "No active complaint logged",
        symptoms=symptoms_list if symptoms_list else ["General Baseline"],
        last_visit=last_visit,
        breakdown=RiskBreakdown(
            age_factor=age_factor,
            symptom_severity=symptom_severity,
            appointment_compliance=appointment_compliance,
            active_case_factor=active_case_factor
        )
    )

@router.get("/overview", response_model=RiskOverviewStats)
def get_risk_overview(db: Session = Depends(get_db)):
    patients = db.query(PatientModel).all()
    cases = db.query(CaseSummaryModel).all()
    appointments = db.query(AppointmentModel).all()

    assessments = [calculate_patient_risk(p, cases, appointments) for p in patients]

    high_count = sum(1 for a in assessments if a.risk_level == "High")
    mod_count = sum(1 for a in assessments if a.risk_level == "Moderate")
    low_count = sum(1 for a in assessments if a.risk_level == "Low")
    avg_score = round(sum(a.risk_score for a in assessments) / len(assessments), 1) if assessments else 0.0

    return RiskOverviewStats(
        total_analyzed=len(assessments),
        high_risk_count=high_count,
        moderate_risk_count=mod_count,
        low_risk_count=low_count,
        avg_risk_score=avg_score
    )

@router.get("/patients", response_model=List[PatientRiskAssessment])
def get_all_patient_risks(db: Session = Depends(get_db)):
    patients = db.query(PatientModel).order_by(PatientModel.id.asc()).all()
    cases = db.query(CaseSummaryModel).all()
    appointments = db.query(AppointmentModel).all()

    assessments = [calculate_patient_risk(p, cases, appointments) for p in patients]
    assessments.sort(key=lambda x: x.risk_score, reverse=True)
    return assessments

@router.get("/patients/{patient_id}", response_model=PatientRiskAssessment)
def get_single_patient_risk(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(PatientModel).filter(PatientModel.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    cases = db.query(CaseSummaryModel).all()
    appointments = db.query(AppointmentModel).all()
    return calculate_patient_risk(patient, cases, appointments)
