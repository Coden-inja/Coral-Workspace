from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base

class Query(Base):
    __tablename__ = "queries"

    id = Column(Integer, primary_key=True, index=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id"), nullable=False)
    query_text = Column(String, nullable=False)
    generated_sql = Column(String, nullable=True)
