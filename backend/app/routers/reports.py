from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from app.database import get_db
from app.models.models import ReportModel

class ReportOut(BaseModel):
    id: int
    title: str
    category: str
    generated: str
    class Config:
        orm_mode = True
        from_attributes = True

router = APIRouter(prefix="/api/reports", tags=["Reports"])

@router.get("", response_model=List[ReportOut])
def get_reports(db: Session = Depends(get_db)):
    return db.query(ReportModel).order_by(ReportModel.id.asc()).all()
