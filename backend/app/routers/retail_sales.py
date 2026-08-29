from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from app.database import get_db
from app.models.models import RetailSaleModel

class RetailSaleOut(BaseModel):
    id: int
    medicine_name: str
    qty: int
    price: float
    sale_date: str
    status: str
    class Config:
        orm_mode = True
        from_attributes = True

class RetailSaleIn(BaseModel):
    medicine_name: str
    qty: int = 1
    price: float = 0
    sale_date: str = ""
    status: str = "Completed"

router = APIRouter(prefix="/api/retail-sales", tags=["Retail Sales"])

@router.get("", response_model=List[RetailSaleOut])
def get_sales(db: Session = Depends(get_db)):
    return db.query(RetailSaleModel).order_by(RetailSaleModel.id.desc()).all()

@router.post("", response_model=RetailSaleOut, status_code=status.HTTP_201_CREATED)
def create_sale(data: RetailSaleIn, db: Session = Depends(get_db)):
    sale = RetailSaleModel(**data.dict())
    db.add(sale)
    db.commit()
    db.refresh(sale)
    return sale

@router.delete("/{sale_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sale(sale_id: int, db: Session = Depends(get_db)):
    sale = db.query(RetailSaleModel).filter(RetailSaleModel.id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    db.delete(sale)
    db.commit()
    return None
