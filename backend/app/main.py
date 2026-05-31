from fastapi import FastAPI
from app.database import engine
from app.database import Base
from app.models.user import User
from app.models.workspace import Workspace
from app.models.connector_model import Connector
from app.models.query_model import Query
from app.routes.auth import router as auth_router
from app.routes.workspaces import router as workspace_router
from app.routes.query import router as query_router
from app.routes.connector import router as connection_router

Base.metadata.create_all(
    bind=engine
)

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Essential for dynamic tunnels (ngrok/cloudflare) and Vercel frontend support
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(workspace_router)
app.include_router(query_router)
app.include_router(connection_router)

@app.get("/")
def home():
    return {
        "message": "Coral Backend Running"
    }

@app.get("/health")
def health():

    return {
        "status": "healthy"
    }