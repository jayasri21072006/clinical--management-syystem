from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.models import PhysicianModel
from app.schemas.schemas import PhysicianCreate, PhysicianResponse, PhysicianUpdate

router = APIRouter(prefix="/api/physicians", tags=["Physicians"])

@router.get("", response_model=List[PhysicianResponse])
def get_physicians(db: Session = Depends(get_db)):
    return db.query(PhysicianModel).all()

@router.post("", response_model=PhysicianResponse, status_code=status.HTTP_201_CREATED)
def create_physician(doc_in: PhysicianCreate, db: Session = Depends(get_db)):
    new_doc = PhysicianModel(
        name=doc_in.name,
        qual=doc_in.qual,
        exp=doc_in.exp,
        patients=doc_in.patients,
        status=doc_in.status
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)
    return new_doc

@router.patch("/{physician_id}", response_model=PhysicianResponse)
@router.put("/{physician_id}", response_model=PhysicianResponse)
def update_physician(physician_id: int, doc_in: PhysicianUpdate, db: Session = Depends(get_db)):
    doc = db.query(PhysicianModel).filter(PhysicianModel.id == physician_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Physician not found")
    if doc_in.name is not None:
        doc.name = doc_in.name
    if doc_in.qual is not None:
        doc.qual = doc_in.qual
    if doc_in.exp is not None:
        doc.exp = doc_in.exp
    if doc_in.patients is not None:
        doc.patients = doc_in.patients
    if doc_in.status is not None:
        doc.status = doc_in.status
    db.commit()
    db.refresh(doc)
    return doc
