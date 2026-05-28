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
from app.routes.connectors import router as connection_router

Base.metadata.create_all(
    bind=engine
)

app = FastAPI()
app.include_router(auth_router)
app.include_router(workspace_router)
app.include_router(query_router)
app.include_router(connection_router)

@app.get("/")
def home():
    return {
        "message": "Coral Backend Running"
    }