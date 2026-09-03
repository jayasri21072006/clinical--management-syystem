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
    date: Optional[str] = None

class AppointmentResponse(BaseModel):
    id: int
    time: str
    patient: str
    doctor: str
    status: str
    type: str
    date_group: str
    date: Optional[str] = None

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
    image_base64: Optional[str] = None
    mime_type: Optional[str] = "image/jpeg"
    patient_name: Optional[str] = None
    session_id: Optional[str] = None   # For conversation context continuity

class ChatMessageResponse(BaseModel):
    reply: str
    sanitized_message: Optional[str] = None
    redaction_count: Optional[int] = 0
    model_used: Optional[str] = "Gemini 2.5 Flash"
    disclaimer: Optional[str] = "Clinical Decision Support Only. Validate with a licensed practitioner."
    injection_detected: Optional[bool] = False
    session_id: Optional[str] = None

class ChatPreviewRequest(BaseModel):
    message: str
    patient_name: Optional[str] = None

class ChatPreviewResponse(BaseModel):
    sanitized_text: str
    redaction_log: List[dict]
    pii_detected: bool
    pii_count: int
    injection_detected: bool
    injection_patterns_found: List[str] = []
    combination_risk: Optional[dict] = None
    safe_to_send: bool

class AuditLogEntry(BaseModel):
    request_id: str
    timestamp: str
    ip: str
    operation: str
    model_used: str
    pii_detected: bool
    pii_count: int
    pii_removed: bool
    injection_detected: bool
    injection_blocked: bool
    response_validation: str
    request_allowed: bool
    rate_limited: bool
    error: Optional[str] = None
    notes: Optional[str] = None
