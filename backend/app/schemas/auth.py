"""Auth schemas."""
from pydantic import BaseModel, field_validator


class SignUpRequest(BaseModel):
    email: str
    name: str
    password: str

    @field_validator("email")
    @classmethod
    def email_not_empty(cls, v: str) -> str:
        if not v or not v.strip() or "@" not in v:
            raise ValueError("Invalid email")
        return v.strip().lower()


class SignInRequest(BaseModel):
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def email_not_empty(cls, v: str) -> str:
        if not v or not v.strip() or "@" not in v:
            raise ValueError("Invalid email")
        return v.strip().lower()


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    email: str
    name: str | None
