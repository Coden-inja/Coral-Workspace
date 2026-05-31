import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.dependencies import get_schema_cache
from app.routers import health, query

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Semantic Engine V1 — loading Coral schema...")
    try:
        cache = get_schema_cache()
        logger.info(
            "Schema cache ready: %d tables, %d functions",
            len(cache.tables),
            len(cache.functions),
        )
    except Exception:
        logger.warning("Schema loading failed — running without schema cache")
    yield


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["health"])
app.include_router(query.router, prefix="/query", tags=["query"])
