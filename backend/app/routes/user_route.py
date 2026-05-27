from fastapi import APIRouter
from pydantic import BaseModel

from app.services.user_service import create_user

router = APIRouter()

class SignUpRequest(BaseModel):
    email: str
    password: str

@router.post("/signup")
def signup(data: SignUpRequest):
    
    response = create_user(data.email, data.password)

    return response