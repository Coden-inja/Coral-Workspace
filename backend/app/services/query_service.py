from sqlalchemy.orm import Session
from app.models.query_model import Query
import httpx
import os

SEMANTIC_ENGINE_URL = os.getenv("SEMANTIC_ENGINE_URL", "https://coral-workspace.onrender.com")

def create_query(
    db: Session,
    workspace_id: int,
    query_text: str
):
    # Remove the hardcoded mock and make a real call to the live Semantic Engine!
    url = f"{SEMANTIC_ENGINE_URL.rstrip('/')}/query"
    try:
        with httpx.Client(timeout=120.0) as client:
            response = client.post(
                url,
                json={"query": query_text, "workspace_id": str(workspace_id)}
            )
            
        if response.status_code == 200:
            result = response.json()
            generated_sql = result.get("generated_sql", "SELECT * FROM demo_table")
            coral_response = {
                "answer": result.get("answer", "No answer provided"),
                "confidence": result.get("confidence", 1.0),
                "query_results": result.get("query_results", []),
                "evidence": result.get("evidence", []),
                "warnings": result.get("warnings", [])
            }
        else:
            generated_sql = "-- Error calling semantic engine"
            coral_response = {
                "answer": f"Semantic engine returned status {response.status_code}: {response.text}",
                "confidence": 0.0
            }
    except Exception as e:
        generated_sql = "-- Exception calling semantic engine"
        coral_response = {
            "answer": f"Failed to connect to semantic engine: {str(e)}",
            "confidence": 0.0
        }

    # Save the query history to PostgreSQL
    query = Query(
        workspace_id=workspace_id,
        query_text=query_text,
        generated_sql=generated_sql
    )
    db.add(query)
    db.commit()
    db.refresh(query)
    
    return {
        "query_text": query.query_text,
        "generated_sql": query.generated_sql,
        "conversational_response": coral_response.get("answer", "No response synthesized."),
        "coral_response": coral_response
    }