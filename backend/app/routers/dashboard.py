from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import PatientModel, AppointmentModel, InventoryModel
from app.schemas.schemas import DashboardStatsResponse

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(db: Session = Depends(get_db)):
    patients_count = db.query(PatientModel).count()
    inventory_count = db.query(InventoryModel).count()
    
    today_apts = db.query(AppointmentModel).filter(AppointmentModel.date_group == "today").all()
    today_apts_count = len(today_apts)
    
    low_stock_items = db.query(InventoryModel).filter(InventoryModel.stock <= 5).all()
    
    revenue_data = [
        {"month": "Jan", "revenue": 4200}, {"month": "Feb", "revenue": 5100},
        {"month": "Mar", "revenue": 4800}, {"month": "Apr", "revenue": 6300},
        {"month": "May", "revenue": 5900}, {"month": "Jun", "revenue": 7200},
        {"month": "Jul", "revenue": 6800},
    ]

    appointment_data = [
        {"day": "Mon", "count": 12}, {"day": "Tue", "count": 19},
        {"day": "Wed", "count": 15}, {"day": "Thu", "count": 22},
        {"day": "Fri", "count": 18}, {"day": "Sat", "count": 8},
    ]

    today_list_fmt = [
        {
            "id": a.id,
            "name": a.patient,
            "time": a.time,
            "status": a.status.lower(),
            "color": "#4A7C5C" if a.status == "Confirmed" else "#E68A00"
        }
        for a in today_apts
    ]

    recent_activity = [
        {"icon": "UserPlus", "text": "<strong>Priya Sharma</strong> was added as a new patient", "time": "5 min ago"},
        {"icon": "FileText", "text": "Case summary updated for <strong>Rahul Verma</strong>", "time": "20 min ago"},
        {"icon": "CheckCircle2", "text": "Appointment with <strong>Anita Das</strong> completed", "time": "1 hr ago"},
        {"icon": "Pill", "text": "Inventory restocked: <strong>Arnica Montana 30C</strong>", "time": "2 hrs ago"},
        {"icon": "Activity", "text": "Monthly report generated for <strong>June 2026</strong>", "time": "3 hrs ago"},
    ]

    alerts_fmt = [
        {"name": item.name, "remaining": item.stock}
        for item in low_stock_items
    ]

    return DashboardStatsResponse(
        totalPatients=patients_count,
        todayAppointmentsCount=today_apts_count,
        inventoryItemsCount=inventory_count,
        monthlyRevenue="₹7.2L",
        revenueData=revenue_data,
        appointmentData=appointment_data,
        todayAppointments=today_list_fmt,
        recentActivity=recent_activity,
        lowStockAlerts=alerts_fmt
    )
