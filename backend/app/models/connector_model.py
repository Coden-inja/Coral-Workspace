from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base

class Connector(Base):
    __tablename__ = "connectors"

    id = Column(Integer, primary_key=True, index=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id"), nullable=False)
    type = Column(String, nullable=False)
    credentials_encrypted = Column(String, nullable=True)
