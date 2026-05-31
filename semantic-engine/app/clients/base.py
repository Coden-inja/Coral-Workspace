from abc import ABC, abstractmethod


class CoralClient(ABC):

    @abstractmethod
    async def execute(self, query: str, workspace_id: str) -> dict:
        ...

    @abstractmethod
    async def execute_sql(self, sql: str) -> list[dict]:
        ...

    @abstractmethod
    async def ping(self) -> bool:
        ...
