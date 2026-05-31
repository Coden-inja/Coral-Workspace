from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.connector_schema import ConnectorRequest
from app.services.connector_service import create_connector

router = APIRouter(
    prefix="/api/connectors"
)

@router.post("/github")
def connect_github(
    data: ConnectorRequest,
    db: Session = Depends(get_db)
):

    return create_connector(
        db,
        data.workspace_id,
        "github",
        data.credentials
    )

@router.post("/slack")
def connect_slack(
    data: ConnectorRequest,
    db: Session = Depends(get_db)
):
    return create_connector(
        db,
        data.workspace_id,
        "slack",
        data.credentials
    )

@router.post("/figma")
def connect_figma(
    data: ConnectorRequest,
    db: Session = Depends(get_db)
):
    return create_connector(
        db,
        data.workspace_id,
        "figma",
        data.credentials
    )

@router.post("/notion")
def connect_notion(
    data: ConnectorRequest,
    db: Session = Depends(get_db)
):
    return create_connector(
        db,
        data.workspace_id,
        "notion",
        data.credentials
    )