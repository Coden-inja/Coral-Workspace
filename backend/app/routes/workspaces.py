from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.workspace_schema import WorkspaceRequest
from app.services.workspace_service import (
    create_workspace,
    get_workspaces
)
from app.security import get_current_user
from app.models.user import User
router = APIRouter(
    prefix="/api"
)

@router.post("/workspaces")
def create_workspace_route(
    data: WorkspaceRequest,
    db: Session = Depends(get_db)
):
    return create_workspace(
        db,
        data.name,
        data.owner_id
    )

@router.get("/workspaces")
def get_workspaces_route(
    db: Session = Depends(get_db)
):
    return get_workspaces(db)

@router.post("/workspaces")
def create_workspace_route(
    data: WorkspaceRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    return create_workspace(
        db,
        data.name,
        current_user.id
    )