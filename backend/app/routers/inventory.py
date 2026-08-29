from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.models import InventoryModel
from app.schemas.schemas import InventoryCreate, InventoryResponse

router = APIRouter(prefix="/api/inventory", tags=["Inventory"])

@router.get("", response_model=List[InventoryResponse])
def get_inventory(db: Session = Depends(get_db)):
    items = db.query(InventoryModel).order_by(InventoryModel.id.asc()).all()
    return [
        InventoryResponse(
            id=item.item_id,
            name=item.name,
            category=item.category,
            stock=item.stock,
            unit=item.unit,
            expiry=item.expiry,
            status=item.status
        ) for item in items
    ]

@router.post("", response_model=InventoryResponse, status_code=status.HTTP_201_CREATED)
def create_inventory(item_in: InventoryCreate, db: Session = Depends(get_db)):
    count = db.query(InventoryModel).count() + 1
    generated_id = f"INV-{count:03d}"
    
    new_item = InventoryModel(
        item_id=generated_id,
        name=item_in.name,
        category=item_in.category,
        stock=item_in.stock,
        unit=item_in.unit,
        expiry=item_in.expiry,
        status="Low Stock" if item_in.stock <= 5 else "In Stock"
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    
    return InventoryResponse(
        id=new_item.item_id,
        name=new_item.name,
        category=new_item.category,
        stock=new_item.stock,
        unit=new_item.unit,
        expiry=new_item.expiry,
        status=new_item.status
    )
