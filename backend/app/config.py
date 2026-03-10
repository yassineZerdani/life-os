from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://lifeos:lifeos_secret@localhost:5432/gemini"
    jwt_secret: str = "change-me-in-production-use-env"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 7  # 7 days
    allowed_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    class Config:
        env_file = ".env"

    def get_allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]


settings = Settings()
