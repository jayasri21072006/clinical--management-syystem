from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import distinct
from typing import List, Optional
from app.database import get_db
from app.models.models import AppointmentModel
from app.schemas.schemas import AppointmentCreate, AppointmentResponse

router = APIRouter(prefix="/api/appointments", tags=["Appointments"])

@router.get("/filters")
def get_appointment_filters(db: Session = Depends(get_db)):
    """Return distinct filter values that actually exist in the database."""
    statuses = [r[0] for r in db.query(distinct(AppointmentModel.status)).all() if r[0]]
    types = [r[0] for r in db.query(distinct(AppointmentModel.type)).all() if r[0]]
    doctors = [r[0] for r in db.query(distinct(AppointmentModel.doctor)).all() if r[0]]
    date_groups = [r[0] for r in db.query(distinct(AppointmentModel.date_group)).all() if r[0]]
    return {
        "statuses": sorted(statuses),
        "types": sorted(types),
        "doctors": sorted(doctors),
        "date_groups": sorted(date_groups),
    }

@router.get("", response_model=List[AppointmentResponse])
def get_appointments(
    search: Optional[str] = Query(None, description="Search by patient or doctor name"),
    apt_status: Optional[str] = Query(None, alias="status", description="Filter by status"),
    apt_type: Optional[str] = Query(None, alias="type", description="Filter by type"),
    date_group: Optional[str] = Query(None, description="Filter by date_group"),
    db: Session = Depends(get_db),
):
    query = db.query(AppointmentModel)

    if apt_status:
        query = query.filter(AppointmentModel.status == apt_status)
    if apt_type:
        query = query.filter(AppointmentModel.type == apt_type)
    if date_group:
        query = query.filter(AppointmentModel.date_group == date_group)
    if search:
        term = f"%{search}%"
        query = query.filter(
            AppointmentModel.patient.ilike(term)
            | AppointmentModel.doctor.ilike(term)
        )

    appointments = query.order_by(AppointmentModel.id.asc()).all()
    return appointments

@router.post("", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
def create_appointment(apt_in: AppointmentCreate, db: Session = Depends(get_db)):
    new_apt = AppointmentModel(
        time=apt_in.time,
        patient=apt_in.patient,
        doctor=apt_in.doctor,
        status=apt_in.status,
        type=apt_in.type,
        date_group=apt_in.date_group
    )
    db.add(new_apt)
    db.commit()
    db.refresh(new_apt)
    return new_apt

@router.patch("/{appointment_id}", response_model=AppointmentResponse)
def update_appointment(appointment_id: int, apt_in: AppointmentCreate, db: Session = Depends(get_db)):
    apt = db.query(AppointmentModel).filter(AppointmentModel.id == appointment_id).first()
    if not apt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    apt.time = apt_in.time
    apt.patient = apt_in.patient
    apt.doctor = apt_in.doctor
    apt.status = apt_in.status
    apt.type = apt_in.type
    apt.date_group = apt_in.date_group
    db.commit()
    db.refresh(apt)
    return apt

@router.delete("/{appointment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_appointment(appointment_id: int, db: Session = Depends(get_db)):
    apt = db.query(AppointmentModel).filter(AppointmentModel.id == appointment_id).first()
    if not apt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    db.delete(apt)
    db.commit()
    return None
