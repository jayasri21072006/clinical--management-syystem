from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from datetime import datetime
from app.database import Base

class PatientModel(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False)
    age = Column(String, nullable=True, default="")
    gender = Column(String, nullable=False, default="Female")
    phone = Column(String, nullable=False, default="")
    email = Column(String, nullable=True, default="")
    status = Column(String, nullable=False, default="Active")
    created_at = Column(DateTime, default=datetime.utcnow)

class AppointmentModel(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    time = Column(String, nullable=False)
    patient = Column(String, nullable=False)
    doctor = Column(String, nullable=False)
    status = Column(String, nullable=False, default="Confirmed")
    type = Column(String, nullable=False, default="Consultation")
    date_group = Column(String, nullable=False, default="today")
    date = Column(String, nullable=True)

class InventoryModel(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    item_id = Column(String, nullable=False, unique=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    stock = Column(Integer, nullable=False, default=0)
    unit = Column(String, nullable=False, default="Bottles")
    expiry = Column(String, nullable=False)
    status = Column(String, nullable=False, default="In Stock")

class PhysicianModel(Base):
    __tablename__ = "physicians"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False)
    qual = Column(String, nullable=False)
    exp = Column(String, nullable=False)
    patients = Column(Integer, nullable=False, default=0)
    status = Column(String, nullable=False, default="Active")

class PurchaseOrderModel(Base):
    __tablename__ = "purchase_orders"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    order_id = Column(String, nullable=False, unique=True, index=True)
    vendor = Column(String, nullable=False)
    date = Column(String, nullable=False)
    items = Column(Integer, nullable=False, default=0)
    total = Column(String, nullable=False, default="₹0")
    status = Column(String, nullable=False, default="Pending Approval")

class CaseSummaryModel(Base):
    __tablename__ = "case_summaries"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    patient_name = Column(String, nullable=False)
    patient_id_ref = Column(String, nullable=False, default="1")
    age = Column(String, nullable=True, default="")
    gender = Column(String, nullable=False, default="Female")
    last_visit = Column(String, nullable=False, default="")
    chief_complaints = Column(Text, nullable=False, default="")
    symptoms = Column(String, nullable=False, default="")
    diagnosis = Column(Text, nullable=False, default="")
    prescription = Column(Text, nullable=False, default="")
    case_status = Column(String, nullable=False, default="Active Case")

class LocationModel(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False)
    address = Column(String, nullable=False)
    city = Column(String, nullable=False)
    phone = Column(String, nullable=False, default="")
    status = Column(String, nullable=False, default="Branch")

class RetailSaleModel(Base):
    __tablename__ = "retail_sales"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    medicine_name = Column(String, nullable=False)
    qty = Column(Integer, nullable=False, default=1)
    price = Column(Float, nullable=False, default=0)
    sale_date = Column(String, nullable=False, default="")
    status = Column(String, nullable=False, default="Completed")

class ReportModel(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String, nullable=False)
    category = Column(String, nullable=False)
    generated = Column(String, nullable=False)

class ModuleModel(Base):
    __tablename__ = "modules"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String, nullable=False)
    desc = Column(Text, nullable=False, default="")
    icon_name = Column(String, nullable=False, default="Boxes")
    status = Column(String, nullable=False, default="Active")
