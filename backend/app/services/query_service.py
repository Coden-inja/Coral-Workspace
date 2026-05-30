import subprocess

from sqlalchemy.orm import Session

from app.models.query_model import Query


def create_query(
    db: Session,
    workspace_id: int,
    query_text: str
):

    coral_command = f'''
        ./tools/coral/coral sql
        "
            SELECT
            title,
            state,
            created_at
            FROM github.pulls
            LIMIT 5
        "
    '''

    result = subprocess.run(
        coral_command,
        shell=True,
        capture_output=True,
        text=True
    )

    coral_output = result.stdout

    query = Query(
        workspace_id=workspace_id,
        query_text=query_text,
        generated_sql="GitHub PR Query"
    )

    db.add(query)

    db.commit()

    db.refresh(query)

    return {
        "query": query.query_text,
        "coral_response": coral_output
    }