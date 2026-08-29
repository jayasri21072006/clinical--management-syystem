from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import distinct
from typing import List, Optional
from pydantic import BaseModel
from app.database import get_db
from app.models.models import PurchaseOrderModel

class PurchaseOrderOut(BaseModel):
    id: int
    order_id: str
    vendor: str
    date: str
    items: int
    total: str
    status: str
    class Config:
        orm_mode = True
        from_attributes = True

class PurchaseOrderIn(BaseModel):
    vendor: str
    date: str = ""
    items: int = 0
    total: str = "₹0"
    status: str = "Pending Approval"

router = APIRouter(prefix="/api/purchase-orders", tags=["Purchase Orders"])

@router.get("/filters")
def get_order_filters(db: Session = Depends(get_db)):
    """Return distinct filter values that actually exist in the database."""
    statuses = [r[0] for r in db.query(distinct(PurchaseOrderModel.status)).all() if r[0]]
    vendors = [r[0] for r in db.query(distinct(PurchaseOrderModel.vendor)).all() if r[0]]
    return {"statuses": sorted(statuses), "vendors": sorted(vendors)}

@router.get("", response_model=List[PurchaseOrderOut])
def get_orders(
    search: Optional[str] = Query(None, description="Search by order ID or vendor"),
    order_status: Optional[str] = Query(None, alias="status", description="Filter by status"),
    vendor: Optional[str] = Query(None, description="Filter by vendor"),
    db: Session = Depends(get_db),
):
    query = db.query(PurchaseOrderModel)

    if order_status:
        query = query.filter(PurchaseOrderModel.status == order_status)
    if vendor:
        query = query.filter(PurchaseOrderModel.vendor == vendor)
    if search:
        term = f"%{search}%"
        query = query.filter(
            PurchaseOrderModel.order_id.ilike(term)
            | PurchaseOrderModel.vendor.ilike(term)
        )

    return query.order_by(PurchaseOrderModel.id.asc()).all()

@router.post("", response_model=PurchaseOrderOut, status_code=status.HTTP_201_CREATED)
def create_order(data: PurchaseOrderIn, db: Session = Depends(get_db)):
    count = db.query(PurchaseOrderModel).count() + 1
    oid = f"PO-2026-{count:03d}"
    order = PurchaseOrderModel(order_id=oid, vendor=data.vendor, date=data.date, items=data.items, total=data.total, status=data.status)
    db.add(order)
    db.commit()
    db.refresh(order)
    return order

@router.patch("/{order_id}", response_model=PurchaseOrderOut)
def update_order(order_id: int, data: PurchaseOrderIn, db: Session = Depends(get_db)):
    order = db.query(PurchaseOrderModel).filter(PurchaseOrderModel.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.vendor = data.vendor
    order.date = data.date
    order.items = data.items
    order.total = data.total
    order.status = data.status
    db.commit()
    db.refresh(order)
    return order
