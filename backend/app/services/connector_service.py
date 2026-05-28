from sqlalchemy.orm import Session
from app.models.connector_model import Connector

def create_connector(
    db: Session,
    workspace_id: int,
    connector_type: str,
    credentials: str
):
    connector = Connector(
        workspace_id=workspace_id,
        type=connector_type,
        credentials_encrypted=credentials
    )
    db.add(connector)
    db.commit()
    db.refresh(connector)
    return {
        "message": f"{connector_type} connected"
    }