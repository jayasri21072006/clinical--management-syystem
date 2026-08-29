from pydantic import BaseModel
from typing import Optional, List

class PatientCreate(BaseModel):
    name: str
    age: Optional[str] = ""
    gender: str = "Female"
    phone: str = ""
    email: Optional[str] = ""

class PatientResponse(BaseModel):
    id: str
    name: str
    age: Optional[str] = ""
    gender: str
    phone: str
    email: Optional[str] = ""
    status: str

    class Config:
        orm_mode = True
        from_attributes = True

class AppointmentCreate(BaseModel):
    time: str
    patient: str
    doctor: str = "Dr. Ramesh"
    status: str = "Confirmed"
    type: str = "Consultation"
    date_group: str = "today"

class AppointmentResponse(BaseModel):
    id: int
    time: str
    patient: str
    doctor: str
    status: str
    type: str
    date_group: str

    class Config:
        orm_mode = True
        from_attributes = True

class InventoryCreate(BaseModel):
    name: str
    category: str = "Dilution"
    stock: int = 10
    unit: str = "Bottles"
    expiry: str = "2028-12"
    status: str = "In Stock"

class InventoryResponse(BaseModel):
    id: str
    name: str
    category: str
    stock: int
    unit: str
    expiry: str
    status: str

    class Config:
        orm_mode = True
        from_attributes = True

class PhysicianCreate(BaseModel):
    name: str
    qual: str
    exp: str
    patients: int = 0
    status: str = "Active"

class PhysicianResponse(BaseModel):
    id: int
    name: str
    qual: str
    exp: str
    patients: int
    status: str

    class Config:
        orm_mode = True
        from_attributes = True

class DashboardStatsResponse(BaseModel):
    totalPatients: int
    todayAppointmentsCount: int
    inventoryItemsCount: int
    monthlyRevenue: str
    revenueData: List[dict]
    appointmentData: List[dict]
    todayAppointments: List[dict]
    recentActivity: List[dict]
    lowStockAlerts: List[dict]

class ChatMessageRequest(BaseModel):
    message: str

class ChatMessageResponse(BaseModel):
    reply: str
