from fastapi import FastAPI

from app.database import engine
from app.models.user import User
from app.routes.user_route import router as user_router

Base = User.metadata

Base.create_all(bind=engine)

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Database connected"}

app.include_router(user_router)