from abc import ABC, abstractmethod


class ModelProvider(ABC):

    @abstractmethod
    async def generate_query(self, question: str) -> list[str]:
        ...

    @abstractmethod
    async def interpret(
        self, evidence: list[dict], question: str
    ) -> str:
        ...

    @abstractmethod
    async def stream_interpret(
        self, evidence: list[dict], question: str
    ):
        ...

    @abstractmethod
    async def generate_text(self, system: str, user: str) -> str:
        ...

    @abstractmethod
    async def ping(self) -> bool:
        ...
