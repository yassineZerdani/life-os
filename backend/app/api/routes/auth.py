"""Auth API - signup, signin, me."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.schemas.auth import SignUpRequest, SignInRequest, TokenResponse, UserResponse
from app.services.auth_service import signup, signin, create_access_token

router = APIRouter()


@router.post("/signup", response_model=TokenResponse)
def signup_route(body: SignUpRequest, db: Session = Depends(get_db)):
    """Create account and return token."""
    if len(body.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    user = signup(db, body.email, body.name, body.password)
    if not user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return TokenResponse(access_token=create_access_token(user.id))


@router.post("/signin", response_model=TokenResponse)
def signin_route(body: SignInRequest, db: Session = Depends(get_db)):
    """Sign in and return token."""
    user = signin(db, body.email, body.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return TokenResponse(access_token=create_access_token(user.id))


@router.get("/me", response_model=UserResponse)
def me_route(user=Depends(get_current_user)):
    """Return current user."""
    return UserResponse(id=user.id, email=user.email, name=user.name)
