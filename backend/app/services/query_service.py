from sqlalchemy.orm import Session
from app.models.query_model import Query
import httpx

def create_query(
    db: Session,
    workspace_id: int,
    query_text: str
):
    generated_sql = "SELECT * FROM demo_table"

    coral_response = {
        "answer": "Deployment failed because CI pipeline timed out."
    }
    query = Query(
        workspace_id=workspace_id,
        query_text=query_text,
        generated_sql=generated_sql
    )
    db.add(query)
    db.commit()
    db.refresh(query)
    return {
        "query": query.query_text,
        "generated_sql": query.generated_sql,
        "coral_response": coral_response
    }