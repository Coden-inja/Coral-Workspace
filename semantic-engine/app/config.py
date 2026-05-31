from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )

    app_name: str = "CoralTeams Semantic Engine"
    app_version: str = "0.1.0"
    debug: bool = False

    host: str = "0.0.0.0"
    port: int = 8001

    model_name: str = "qwen3:8b"
    ollama_host: str = "https://jarrod-unannulled-opposedly.ngrok-free.dev"

    coral_binary: str = "coral"
    coral_base_url: str = "http://localhost:5555"
    coral_api_key: str = ""

    log_level: str = "info"


settings = Settings()
