import os

from dotenv import load_dotenv

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import declarative_base

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    POSTGRES_USER = os.getenv("POSTGRES_USER")
    POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD")
    POSTGRES_DB = os.getenv("POSTGRES_DB")
    POSTGRES_HOST = os.getenv("POSTGRES_HOST", "localhost")
    
    if POSTGRES_USER and POSTGRES_PASSWORD and POSTGRES_DB:
        DATABASE_URL = (
            f"postgresql://{POSTGRES_USER}:"
            f"{POSTGRES_PASSWORD}@"
            f"{POSTGRES_HOST}/"
            f"{POSTGRES_DB}"
        )
    else:
        # High-resilience fallback to local SQLite for zero-config demo ease
        DATABASE_URL = "sqlite:///./coral.db"

# SQLite requires check_same_thread=False for FastAPI multithreading
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

