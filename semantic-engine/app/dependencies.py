import logging

from app.config import settings
from app.providers.base import ModelProvider
from app.providers.ollama import OllamaProvider
from app.providers.openai_compat import OpenAICompatProvider
from app.clients.base import CoralClient
from app.clients.coral_client import CoralSubprocessClient
from app.schema.schema_cache import SchemaCache

logger = logging.getLogger(__name__)

_provider: ModelProvider | None = None
_coral: CoralClient | None = None
_schema_cache: SchemaCache | None = None


def get_model_provider() -> ModelProvider:
    global _provider
    if _provider is None:
        match settings.model_provider:
            case "ollama":
                _provider = OllamaProvider(
                    base_url=settings.model_base_url,
                    model=settings.model_name,
                )
            case "openai":
                _provider = OpenAICompatProvider(
                    base_url=settings.model_base_url,
                    model=settings.model_name,
                    api_key=settings.model_api_key,
                )
            case _:
                raise ValueError(f"Unknown model provider: {settings.model_provider}")
    return _provider


def get_coral_client() -> CoralClient:
    global _coral
    if _coral is None:
        _coral = CoralSubprocessClient(
            coral_binary=settings.coral_binary,
        )
    return _coral


def get_schema_cache() -> SchemaCache:
    global _schema_cache
    if _schema_cache is None:
        cache = SchemaCache.get_instance()
        cache.configure(coral_binary=settings.coral_binary)
        cache.load()
        _schema_cache = cache
    return _schema_cache
