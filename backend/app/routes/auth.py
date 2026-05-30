from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from app.database import get_db
from app.schemas.auth_schema import (
    RegisterRequest,
    LoginRequest
)
from app.services.auth_service import (
    register_user,
    login_user
)
from app.security import get_current_user
from app.models.user import User
router = APIRouter(
    prefix="/api"
)

@router.post("/register")
def register(
    data: RegisterRequest,
    db: Session = Depends(get_db)
):
    return register_user(
        db,
        data.email,
        data.password
    )

@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    return login_user(
        db,
        form_data.username,
        form_data.password
    )

@router.get("/me")
def get_me(
    current_user: User = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "email": current_user.email
    }