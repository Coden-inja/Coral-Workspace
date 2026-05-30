from sqlalchemy.orm import Session
from app.models.user import User
from app.security import (
    hash_password,
    verify_password,
    create_access_token
)

def register_user(
    db: Session,
    email: str,
    password: str
):
    existing_user = db.query(User).filter(
        User.email == email
    ).first()
    if existing_user:
        return {
            "error": "User already exists"
        }
    user = User(
        email=email,
        password_hash=hash_password(password)
    )

    db.add(user)
    db.commit()
    db.refresh(user)
    return {
        "message": "User registered"
    }

def login_user(
    db: Session,
    email: str,
    password: str
):
    user = db.query(User).filter(
        User.email == email
    ).first()
    if not user:
        return {
            "error": "Invalid credentials"
        }
    if not verify_password(
        password,
        user.password_hash
    ):
        return {
            "error": "Invalid credentials"
        }
    token = create_access_token({
        "sub": user.email
    })
    return {
        "access_token": token,
        "token_type": "bearer"
    }