from pydantic import BaseModel
from typing import List, Dict, Any, Optional

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
    generated_sql: str
    query_results: List[Dict[str, Any]]
    answer: str
    confidence: float
    evidence: List[Dict[str, Any]]
    warnings: List[str]
