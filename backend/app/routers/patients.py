from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import distinct
from typing import List, Optional
from app.database import get_db
from app.models.models import PatientModel
from app.schemas.schemas import PatientCreate, PatientResponse

router = APIRouter(prefix="/api/patients", tags=["Patients"])

@router.get("/filters")
def get_patient_filters(db: Session = Depends(get_db)):
    """Return distinct filter values that actually exist in the database."""
    genders = [r[0] for r in db.query(distinct(PatientModel.gender)).all() if r[0]]
    statuses = [r[0] for r in db.query(distinct(PatientModel.status)).all() if r[0]]
    return {"genders": sorted(genders), "statuses": sorted(statuses)}

@router.get("", response_model=List[PatientResponse])
def get_patients(
    search: Optional[str] = Query(None, description="Search by name, phone, or ID"),
    gender: Optional[str] = Query(None, description="Filter by gender"),
    patient_status: Optional[str] = Query(None, alias="status", description="Filter by status"),
    db: Session = Depends(get_db),
):
    query = db.query(PatientModel)

    if gender:
        query = query.filter(PatientModel.gender == gender)
    if patient_status:
        query = query.filter(PatientModel.status == patient_status)
    if search:
        term = f"%{search}%"
        query = query.filter(
            PatientModel.name.ilike(term)
            | PatientModel.phone.ilike(term)
            | PatientModel.email.ilike(term)
        )

    patients = query.order_by(PatientModel.id.asc()).all()
    return [
        PatientResponse(
            id=str(p.id),
            name=p.name,
            age=p.age or "",
            gender=p.gender,
            phone=p.phone,
            email=p.email or "",
            status=p.status
        ) for p in patients
    ]

@router.post("", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
def create_patient(patient_in: PatientCreate, db: Session = Depends(get_db)):
    new_patient = PatientModel(
        name=patient_in.name,
        age=patient_in.age or "",
        gender=patient_in.gender,
        phone=patient_in.phone,
        email=patient_in.email or "",
        status="Active"
    )
    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)

    return PatientResponse(
        id=str(new_patient.id),
        name=new_patient.name,
        age=new_patient.age or "",
        gender=new_patient.gender,
        phone=new_patient.phone,
        email=new_patient.email or "",
        status=new_patient.status
    )

@router.patch("/{patient_id}", response_model=PatientResponse)
def update_patient(patient_id: int, patient_in: PatientCreate, db: Session = Depends(get_db)):
    patient = db.query(PatientModel).filter(PatientModel.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    patient.name = patient_in.name
    patient.age = patient_in.age or ""
    patient.gender = patient_in.gender
    patient.phone = patient_in.phone
    patient.email = patient_in.email or ""
    db.commit()
    db.refresh(patient)
    return PatientResponse(
        id=str(patient.id),
        name=patient.name,
        age=patient.age or "",
        gender=patient.gender,
        phone=patient.phone,
        email=patient.email or "",
        status=patient.status
    )

@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_patient(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(PatientModel).filter(PatientModel.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    db.delete(patient)
    db.commit()
    return None
