from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from app.database import get_db
from app.schemas.query_schema import QueryRequest
from app.services.query_service import create_query

router = APIRouter(
    prefix="/api/query"
)

class RawQueryRequest(BaseModel):
    workspace_id: int
    sql_query: str

@router.post("/nl")
def query_nl(
    data: QueryRequest,
    db: Session = Depends(get_db)
):
    return create_query(
        db,
        data.workspace_id,
        data.query_text
    )

@router.post("/raw")
def query_raw(
    data: RawQueryRequest,
    db: Session = Depends(get_db)
):
    try:
        result = db.execute(text(data.sql_query))
        # Fetch all rows and convert mapping to a list of dicts
        rows = []
        if result.returns_rows:
            rows = [dict(row._mapping) for row in result]
        return {
            "status": "success",
            "sql": data.sql_query,
            "query_results": rows
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }