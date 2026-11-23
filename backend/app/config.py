from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Supabase
    SUPABASE_URL: str
    SUPABASE_SERVICE_KEY: str
    SUPABASE_JWT_SECRET: str

    # Groq (Whisper STT + Drill Generator LLM)
    GROQ_API_KEY: str
    GROQ_STT_MODEL: str = "whisper-large-v3"
    # llama-3.3-70b-versatile was retired by Groq; gpt-oss-20b is the
    # current model confirmed to support response_format=json_object.
    GROQ_CHAT_MODEL: str = "openai/gpt-oss-20b"

    # Google Gemini (Speech Analyser)
    GEMINI_API_KEY: str
    # gemini-2.5-pro was retired for new API keys/projects; gemini-3.5-flash
    # is the current model confirmed to work with this key's quota tier.
    GEMINI_MODEL: str = "gemini-3.5-flash"

    # EMA scoring
    EMA_ALPHA: float = 0.4

    # Audio recording limits (seconds)
    MAX_NARRATION_DURATION_SECONDS: int = 300  # 5 minutes
    MAX_DRILL_DURATION_SECONDS: int = 120  # 2 minutes

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


@lru_cache()
def get_settings() -> Settings:
    return Settings()
