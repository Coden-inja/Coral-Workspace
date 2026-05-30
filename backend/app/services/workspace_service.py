from sqlalchemy.orm import Session
from app.models.workspace import Workspace

def create_workspace(
    db: Session,
    name: str,
    owner_id: int
):
    workspace = Workspace(
        name=name,
        owner_id=owner_id
    )
    db.add(workspace)
    db.commit()
    db.refresh(workspace)
    return workspace

def get_workspaces(db: Session):
    return db.query(Workspace).all()