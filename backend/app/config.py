from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://lifeos:lifeos_secret@localhost:5432/gemini"
    jwt_secret: str = "change-me-in-production-use-env"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 7  # 7 days
    allowed_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    # Stripe — never hardcode keys; use env vars only
    stripe_secret_key: str = ""
    stripe_publishable_key: str = ""
    stripe_webhook_secret: str = ""
    stripe_client_id: str = ""  # For Connect/Treasury if enabled later
    stripe_treasury_enabled: bool = False

    class Config:
        env_file = ".env"

    def get_allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]

    def stripe_configured(self) -> bool:
        return bool(self.stripe_secret_key and self.stripe_publishable_key)

    def stripe_test_mode(self) -> bool:
        return self.stripe_secret_key.startswith("sk_test_") if self.stripe_secret_key else False


settings = Settings()
