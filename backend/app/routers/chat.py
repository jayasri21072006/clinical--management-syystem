from fastapi import APIRouter
from app.schemas.schemas import ChatMessageRequest, ChatMessageResponse

router = APIRouter(prefix="/api/chat", tags=["Support Chat"])

@router.post("", response_model=ChatMessageResponse)
def handle_chat_message(payload: ChatMessageRequest):
    msg = payload.message.lower()
    if "patient" in msg:
        reply = "You can manage patient records under the 'Patients' tab or click 'Add Patient' to register new cases."
    elif "appointment" in msg or "book" in msg:
        reply = "Appointments can be scheduled in the 'Appointments' page or using the quick action button on your Dashboard."
    elif "medicine" in msg or "inventory" in msg or "stock" in msg:
        reply = "Medical Inventory tracks remedy stock levels, dilutions, and low stock warnings. Check the 'Medical Inventory' section."
    elif "physician" in msg or "doctor" in msg:
        reply = "You can review doctor profiles and consultation hours under the 'Physician' tab."
    else:
        reply = f"Thank you for contacting Clinical Support. We received your message: '{payload.message}'. How else can we assist your practice today?"
    
    return ChatMessageResponse(reply=reply)
