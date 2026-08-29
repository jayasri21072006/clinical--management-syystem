from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.models import PhysicianModel
from app.schemas.schemas import PhysicianCreate, PhysicianResponse

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
