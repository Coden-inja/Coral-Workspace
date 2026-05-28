from pydantic import BaseModel

class QueryRequest(BaseModel):
    workspace_id: int
    query_text: str