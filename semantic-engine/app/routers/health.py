from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.config import settings
from app.dependencies import get_coral_client
from app.clients.base import CoralClient

router = APIRouter()

# Inline Pydantic schema to fix the missing app.models import error permanently
class HealthResponse(BaseModel):
    status: str
    model: str
    coral: str

@router.get("/health", response_model=HealthResponse)
async def health(
    coral: CoralClient = Depends(get_coral_client),
):
    coral_status = "connected" if await coral.ping() else "disconnected"
    return HealthResponse(
        status="ok",
        model=f"ollama/{settings.model_name}",
        coral=coral_status,
    )
