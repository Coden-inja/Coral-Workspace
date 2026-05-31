from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

# --- INLINE PYDANTIC MODELS TO PREVENT IMPORT CRASHES ---
class PlanRequest(BaseModel):
    query: str

class PlanResponse(BaseModel):
    candidate_tables: List[str]
    candidate_functions: List[str]
    required_filters: List[str]
    prompt_context: str

class SQLRequest(BaseModel):
    query: str

class SQLResponse(BaseModel):
    sql: str
    tables_used: List[str]
    required_filters: List[str]
    warnings: List[str]

class QueryRequest(BaseModel):
    query: str
    workspace_id: Optional[str] = None

class QueryExecuteResponse(BaseModel):
    success: bool
    data: Any
    interpretation: Optional[str] = None
# --------------------------------------------------------

from app.dependencies import get_coral_client, get_model_provider, get_schema_cache
from app.planner.planner import QueryPlanner
from app.providers.base import ModelProvider
from app.clients.base import CoralClient
from app.schema.schema_cache import SchemaCache
from app.services.query_executor import QueryExecutor

router = APIRouter()


@router.post("/plan", response_model=PlanResponse)
async def plan(
    body: PlanRequest,
    schema_cache: SchemaCache = Depends(get_schema_cache),
):
    planner = QueryPlanner(schema_cache=schema_cache)
    plan_result = planner.create_plan(question=body.query)
    return PlanResponse(
        candidate_tables=plan_result.candidate_tables,
        candidate_functions=plan_result.candidate_functions,
        required_filters=plan_result.required_filters,
        prompt_context=plan_result.prompt_context,
    )


@router.post("/sql", response_model=SQLResponse)
async def generate_sql(
    body: SQLRequest,
    schema_cache: SchemaCache = Depends(get_schema_cache),
):
    planner = QueryPlanner(schema_cache=schema_cache)
    result = planner.generate_sql(question=body.query)
    return SQLResponse(
        sql=result.sql,
        tables_used=result.tables_used,
        required_filters=result.required_filters,
        warnings=result.warnings,
    )


@router.post("", response_model=QueryExecuteResponse)
async def query(
    body: QueryRequest,
    schema_cache: SchemaCache = Depends(get_schema_cache),
    coral: CoralClient = Depends(get_coral_client),
    model: ModelProvider = Depends(get_model_provider),
):
    executor = QueryExecutor(
        schema_cache=schema_cache,
        coral_client=coral,
        model_provider=model,
    )
    return await executor.execute(question=body.query)


@router.post("/stream")
async def query_stream(
    body: QueryRequest,
    model: ModelProvider = Depends(get_model_provider),
    coral: CoralClient = Depends(get_coral_client),
):
    from fastapi.responses import StreamingResponse

    coral_queries = await model.generate_query(body.query)
    evidence = []
    for cq in coral_queries:
        result = await coral.execute(cq, body.workspace_id)
        evidence.append({"source": "coral", "data": result})

    async def event_stream():
        async for token in model.stream_interpret(evidence, body.query):
            yield f"data: {token}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")
