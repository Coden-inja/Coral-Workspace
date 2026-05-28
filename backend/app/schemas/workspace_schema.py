from pydantic import BaseModel

class WorkspaceRequest(BaseModel):
    name: str