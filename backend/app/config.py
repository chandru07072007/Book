import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "BookBridge API"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-bookbridge-jwt-key-2026-very-secure")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    CORS_ORIGINS: str = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://localhost:5174",
    )
    
    # MongoDB Connection URI (defaults to local MongoDB)
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "bookbridge_db")

    # Supabase Configuration
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://sdgszspdgrtbrsvqlzgh.supabase.co")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "sb_publishable_MbwSw_gZIXI-DkkjIOr0CQ_f_G-WGyX")

    class Config:
        case_sensitive = True

settings = Settings()
