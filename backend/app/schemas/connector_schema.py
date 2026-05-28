from pydantic import BaseModel

class ConnectorRequest(BaseModel):
    workspace_id: int
    credentials: str