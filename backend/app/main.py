from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base, SessionLocal
from app.models.models import (
    PatientModel, AppointmentModel, InventoryModel, PhysicianModel,
    PurchaseOrderModel, CaseSummaryModel, LocationModel, RetailSaleModel,
    ReportModel, ModuleModel
)
from app.routers import (
    patients, appointments, inventory, physicians, dashboard, chat,
    purchase_orders, case_summaries, locations, retail_sales, reports, modules,
    ai_analysis, audit
)
from sqlalchemy import text
import os

# Create all tables
Base.metadata.create_all(bind=engine)

# Safe auto-migration for appointments date column
try:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE appointments ADD COLUMN date TEXT"))
        conn.commit()
except Exception:
    pass

app = FastAPI(
    title="Clinical Management System API",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Seed database with initial data
def seed_database():
    db = SessionLocal()
    try:
        # Patients
        if db.query(PatientModel).count() == 0:
            db.add_all([
                PatientModel(name="Ananya Sharma", age="28", gender="Female", phone="9840112345", email="ananya@gmail.com", status="Active"),
                PatientModel(name="Rajesh Verma", age="45", gender="Male", phone="9840223456", email="rajesh.v@yahoo.com", status="Active"),
                PatientModel(name="Priya Patel", age="34", gender="Female", phone="9840334567", email="priya.p@outlook.com", status="Active"),
                PatientModel(name="Karan Malhotra", age="52", gender="Male", phone="9840445678", email="karan.m@gmail.com", status="Inactive"),
                PatientModel(name="Meera Iyer", age="22", gender="Female", phone="9840556789", email="meera.i@gmail.com", status="Active"),
                PatientModel(name="Suresh Kumar", age="61", gender="Male", phone="9840667890", email="suresh.k@hotmail.com", status="Active"),
                PatientModel(name="Deepika Sen", age="39", gender="Female", phone="9840778901", email="deepika.s@gmail.com", status="Active"),
                PatientModel(name="Arjun Reddy", age="29", gender="Male", phone="9840889012", email="arjun.r@gmail.com", status="Inactive"),
                PatientModel(name="Kavita Nair", age="41", gender="Female", phone="9840990123", email="kavita.n@gmail.com", status="Active"),
                PatientModel(name="Vikram Joshi", age="36", gender="Male", phone="9840101234", email="vikram.j@yahoo.com", status="Active"),
            ])

        # Appointments
        if db.query(AppointmentModel).count() == 0:
            db.add_all([
                AppointmentModel(time="09:00 AM", patient="Ananya Sharma", doctor="Dr. Ramesh Kumar", status="Confirmed", type="Follow-up", date_group="today"),
                AppointmentModel(time="10:30 AM", patient="Rajesh Verma", doctor="Dr. Sunita Sharma", status="In Progress", type="Consultation", date_group="today"),
                AppointmentModel(time="11:45 AM", patient="Priya Patel", doctor="Dr. Ramesh Kumar", status="Pending", type="First Visit", date_group="today"),
                AppointmentModel(time="02:15 PM", patient="Meera Iyer", doctor="Dr. Sunita Sharma", status="Confirmed", type="Follow-up", date_group="today"),
                AppointmentModel(time="04:00 PM", patient="Deepika Sen", doctor="Dr. Ramesh Kumar", status="Completed", type="Review", date_group="today"),
                AppointmentModel(time="Tomorrow 10:00 AM", patient="Suresh Kumar", doctor="Dr. Ramesh Kumar", status="Confirmed", type="Review", date_group="upcoming"),
                AppointmentModel(time="Tomorrow 11:30 AM", patient="Vikram Joshi", doctor="Dr. Sunita Sharma", status="Pending", type="Consultation", date_group="upcoming"),
                AppointmentModel(time="Tomorrow 03:00 PM", patient="Kavita Nair", doctor="Dr. Ramesh Kumar", status="Confirmed", type="First Visit", date_group="upcoming"),
            ])

        # Inventory
        if db.query(InventoryModel).count() == 0:
            db.add_all([
                InventoryModel(item_id="INV-001", name="Arnica Montana 30C", category="Dilution", stock=45, unit="Bottles", expiry="2028-05", status="In Stock"),
                InventoryModel(item_id="INV-002", name="Belladonna 200C", category="Dilution", stock=3, unit="Bottles", expiry="2027-11", status="Low Stock"),
                InventoryModel(item_id="INV-003", name="Nux Vomica 30C", category="Dilution", stock=5, unit="Bottles", expiry="2028-01", status="Low Stock"),
                InventoryModel(item_id="INV-004", name="Calendula Mother Tincture", category="Mother Tincture", stock=28, unit="Bottles", expiry="2029-03", status="In Stock"),
                InventoryModel(item_id="INV-005", name="Calcarea Phos 6X", category="Biochemic", stock=60, unit="Packs", expiry="2028-09", status="In Stock"),
                InventoryModel(item_id="INV-006", name="Pulsatilla 1M", category="Dilution", stock=2, unit="Bottles", expiry="2026-12", status="Low Stock"),
            ])

        # Physicians
        if db.query(PhysicianModel).count() == 0:
            db.add_all([
                PhysicianModel(name="Dr. Ramesh Kumar", qual="BHMS, MD (Homeopathy)", exp="14 years exp", patients=840, status="Active"),
                PhysicianModel(name="Dr. Sunita Sharma", qual="BHMS, Reg #48291", exp="8 years exp", patients=420, status="Active"),
            ])

        # Purchase Orders
        if db.query(PurchaseOrderModel).count() == 0:
            db.add_all([
                PurchaseOrderModel(order_id="PO-2026-001", vendor="SBL Homeopathy Pvt Ltd", date="2026-07-22", items=12, total="₹24,500", status="Delivered"),
                PurchaseOrderModel(order_id="PO-2026-002", vendor="Dr. Reckeweg & Co", date="2026-07-25", items=8, total="₹18,200", status="In Transit"),
                PurchaseOrderModel(order_id="PO-2026-003", vendor="Schwabe India", date="2026-07-27", items=15, total="₹32,000", status="Pending Approval"),
                PurchaseOrderModel(order_id="PO-2026-004", vendor="Bakson Drugs & Pharmaceuticals", date="2026-07-28", items=6, total="₹9,400", status="In Transit"),
                PurchaseOrderModel(order_id="PO-2026-005", vendor="B Jain Pharmaceuticals", date="2026-07-29", items=20, total="₹41,500", status="Pending Approval"),
                PurchaseOrderModel(order_id="PO-2026-006", vendor="SBL Homeopathy Pvt Ltd", date="2026-07-30", items=4, total="₹6,800", status="Cancelled"),
            ])

        # Case Summaries
        if db.query(CaseSummaryModel).count() == 0:
            db.add_all([
                CaseSummaryModel(
                    patient_name="Priya Sharma", patient_id_ref="1",
                    age="28", gender="Female", last_visit="2026-07-20",
                    chief_complaints="Chronic migraine with aura for 6 months, aggravated by bright light and stress. Associated with mild nausea and sleep disturbance.",
                    symptoms="Throbbing Headache,Photophobia,Nausea,Insomnia",
                    diagnosis="Psora-Psora Miasmatic background. Constitutional remedy indicated based on thermals (chilly) and mental state (anxiety with restlessness).",
                    prescription="1. Belladonna 200C - 4 pills, twice daily before meals (7 days)\n2. Natrum Muriaticum 30C - 4 pills at bedtime (14 days)\n3. Biochemic Combination #12 - 2 tablets thrice daily",
                    case_status="Active Case"
                ),
            ])

        # Locations
        if db.query(LocationModel).count() == 0:
            db.add_all([
                LocationModel(name="Main Branch - Sage Green Wellness", address="102 Green Park Ave, Block B, Indiranagar", city="Bengaluru", phone="+91 98401 23456", status="Main Clinic"),
                LocationModel(name="North Branch - Sage Green Wellness", address="45 Health Square, Yelahanka", city="Bengaluru", phone="+91 98402 34567", status="Branch"),
            ])

        # Retail Sales
        if db.query(RetailSaleModel).count() == 0:
            db.add_all([
                RetailSaleModel(medicine_name="Arnica Montana 30C (30ml)", qty=2, price=150, sale_date="2026-07-29", status="Completed"),
                RetailSaleModel(medicine_name="Calendula Ointment 25g", qty=1, price=90, sale_date="2026-07-29", status="Completed"),
                RetailSaleModel(medicine_name="Biochemic Combination #12", qty=1, price=120, sale_date="2026-07-29", status="Completed"),
            ])

        # Reports
        if db.query(ReportModel).count() == 0:
            db.add_all([
                ReportModel(title="Monthly Revenue Analysis", category="Finance", generated="2026-07-27"),
                ReportModel(title="Patient Attendance & Demographics", category="Clinical", generated="2026-07-26"),
                ReportModel(title="Prescription & Remedy Usage Stats", category="Pharmacy", generated="2026-07-25"),
                ReportModel(title="Inventory Turnaround & Expiry Risk", category="Pharmacy", generated="2026-07-20"),
            ])

        # Modules
        if db.query(ModuleModel).count() == 0:
            db.add_all([
                ModuleModel(title="Repertory Engine", desc="Kent, Boericke & Synthesis homeopathic repertory database with search.", icon_name="BookOpen", status="Active"),
                ModuleModel(title="Materia Medica", desc="Comprehensive guide to remedies, keynotes, symptoms, and modalities.", icon_name="Stethoscope", status="Active"),
                ModuleModel(title="Potency Calculator", desc="AI-assisted potency and dosage recommendation engine.", icon_name="Cpu", status="Beta"),
                ModuleModel(title="Analytics & Audits", desc="Clinical performance metrics, patient retention & outcome tracking.", icon_name="FileSpreadsheet", status="Active"),
                ModuleModel(title="Teleconsultation", desc="Integrated video calls, digital prescriptions & online payment.", icon_name="ShieldCheck", status="Active"),
                ModuleModel(title="Certificates & Forms", desc="Medical leave certificates, fitness forms, consent form templates.", icon_name="Award", status="Active"),
            ])

        db.commit()
    finally:
        db.close()

seed_database()

# Include ALL routers
app.include_router(patients.router)
app.include_router(appointments.router)
app.include_router(inventory.router)
app.include_router(physicians.router)
app.include_router(dashboard.router)
app.include_router(chat.router)
app.include_router(purchase_orders.router)
app.include_router(case_summaries.router)
app.include_router(locations.router)
app.include_router(retail_sales.router)
app.include_router(reports.router)
app.include_router(modules.router)
app.include_router(ai_analysis.router)
app.include_router(audit.router)

@app.get("/")
def home():
    return {
        "message": "Clinical Management System Backend is Running 🚀",
        "docs": "/docs"
    }