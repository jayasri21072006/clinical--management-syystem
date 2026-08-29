from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from app.database import get_db
from app.models.models import ModuleModel

class ModuleOut(BaseModel):
    id: int
    title: str
    desc: str
    icon_name: str
    status: str
    class Config:
        orm_mode = True
        from_attributes = True

router = APIRouter(prefix="/api/modules", tags=["Modules"])

@router.get("", response_model=List[ModuleOut])
def get_modules(db: Session = Depends(get_db)):
    return db.query(ModuleModel).order_by(ModuleModel.id.asc()).all()
