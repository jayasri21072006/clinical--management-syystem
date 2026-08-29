from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from app.database import get_db
from app.models.models import LocationModel

class LocationOut(BaseModel):
    id: int
    name: str
    address: str
    city: str
    phone: str
    status: str
    class Config:
        orm_mode = True
        from_attributes = True

class LocationIn(BaseModel):
    name: str
    address: str = ""
    city: str = ""
    phone: str = ""
    status: str = "Branch"

router = APIRouter(prefix="/api/locations", tags=["Locations"])

@router.get("", response_model=List[LocationOut])
def get_locations(db: Session = Depends(get_db)):
    return db.query(LocationModel).order_by(LocationModel.id.asc()).all()

@router.post("", response_model=LocationOut, status_code=status.HTTP_201_CREATED)
def create_location(data: LocationIn, db: Session = Depends(get_db)):
    loc = LocationModel(**data.dict())
    db.add(loc)
    db.commit()
    db.refresh(loc)
    return loc

@router.patch("/{loc_id}", response_model=LocationOut)
def update_location(loc_id: int, data: LocationIn, db: Session = Depends(get_db)):
    loc = db.query(LocationModel).filter(LocationModel.id == loc_id).first()
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found")
    for k, v in data.dict().items():
        setattr(loc, k, v)
    db.commit()
    db.refresh(loc)
    return loc
