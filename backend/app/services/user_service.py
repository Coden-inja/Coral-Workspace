from app.database import SessionLocal
from app.models.user import User

def create_user(email: str, password: str):
    db = SessionLocal()
    user = User(
        email = email,
        password = password
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    db.close()
    return {
        "message": "User created successfully",
        "email": user.email
    }