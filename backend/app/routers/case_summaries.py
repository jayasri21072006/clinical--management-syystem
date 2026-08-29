from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from app.database import get_db
from app.models.models import CaseSummaryModel

class CaseSummaryOut(BaseModel):
    id: int
    patient_name: str
    patient_id_ref: Optional[str] = "1"
    age: Optional[str] = ""
    gender: Optional[str] = "Female"
    last_visit: Optional[str] = ""
    chief_complaints: Optional[str] = ""
    symptoms: Optional[str] = ""
    diagnosis: Optional[str] = ""
    prescription: Optional[str] = ""
    case_status: Optional[str] = "Active Case"
    class Config:
        orm_mode = True
        from_attributes = True

class CaseSummaryIn(BaseModel):
    patient_name: str
    patient_id_ref: Optional[str] = "1"
    age: Optional[str] = ""
    gender: Optional[str] = "Female"
    last_visit: Optional[str] = ""
    chief_complaints: Optional[str] = ""
    symptoms: Optional[str] = ""
    diagnosis: Optional[str] = ""
    prescription: Optional[str] = ""
    case_status: Optional[str] = "Active Case"

router = APIRouter(prefix="/api/case-summaries", tags=["Case Summaries"])

@router.get("", response_model=List[CaseSummaryOut])
def get_cases(db: Session = Depends(get_db)):
    return db.query(CaseSummaryModel).order_by(CaseSummaryModel.id.asc()).all()

@router.post("", response_model=CaseSummaryOut, status_code=status.HTTP_201_CREATED)
def create_case(data: CaseSummaryIn, db: Session = Depends(get_db)):
    case = CaseSummaryModel(**data.dict())
    db.add(case)
    db.commit()
    db.refresh(case)
    return case

@router.patch("/{case_id}", response_model=CaseSummaryOut)
def update_case(case_id: int, data: CaseSummaryIn, db: Session = Depends(get_db)):
    case = db.query(CaseSummaryModel).filter(CaseSummaryModel.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    for k, v in data.dict().items():
        setattr(case, k, v)
    db.commit()
    db.refresh(case)
    return case
