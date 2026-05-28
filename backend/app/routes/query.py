from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.query_schema import QueryRequest
from app.services.query_service import create_query

router = APIRouter(
    prefix="/api/query"
)

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