"""
Authentication and Role-Based User Management API Endpoints.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session

from backend.app.dependencies import get_db
from backend.app.db.models import UserRecord
from backend.app.schemas import (
    UserLoginRequest,
    UserSignupRequest,
    UserResponse,
    AuthResponse,
)
from backend.app.services.auth_service import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
)

router = APIRouter(prefix="/auth", tags=["Authentication & User Management"])


def get_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
) -> UserRecord:
    """Dependency that extracts and validates the bearer token from the Authorization header."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or malformed Authorization header.",
        )
    token = authorization.split("Bearer ", 1)[1].strip()
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token.",
        )
    user = db.query(UserRecord).filter(UserRecord.id == int(payload["sub"])).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found or deactivated.",
        )
    return user


@router.post("/login", response_model=AuthResponse, summary="Log in with email and password")
def login_endpoint(payload: UserLoginRequest, db: Session = Depends(get_db)) -> AuthResponse:
    """Authenticate user credentials and issue a signed JWT access token."""
    user = db.query(UserRecord).filter(UserRecord.email == payload.email.lower().strip()).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive. Contact the platform administrator.",
        )

    token = create_access_token(user.id, user.email, user.role)
    user_dict = user.to_dict()

    return AuthResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            id=user_dict["id"],
            email=user_dict["email"],
            full_name=user_dict["full_name"],
            role=user_dict["role"],
            is_active=user_dict["is_active"],
            created_at=user_dict["created_at"],
        ),
    )


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED, summary="Register a new account")
def signup_endpoint(payload: UserSignupRequest, db: Session = Depends(get_db)) -> AuthResponse:
    """Register a new user account with default role of claims_officer."""
    clean_email = payload.email.lower().strip()
    existing = db.query(UserRecord).filter(UserRecord.email == clean_email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists.",
        )

    # Allowed roles
    valid_roles = ["admin", "claims_officer", "investigator", "analyst"]
    role = payload.role if payload.role in valid_roles else "claims_officer"

    new_user = UserRecord(
        email=clean_email,
        full_name=payload.full_name.strip(),
        role=role,
        hashed_password=hash_password(payload.password),
        is_active=1,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(new_user.id, new_user.email, new_user.role)
    user_dict = new_user.to_dict()

    return AuthResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            id=user_dict["id"],
            email=user_dict["email"],
            full_name=user_dict["full_name"],
            role=user_dict["role"],
            is_active=user_dict["is_active"],
            created_at=user_dict["created_at"],
        ),
    )


@router.get("/me", response_model=UserResponse, summary="Get current authenticated user profile")
def me_endpoint(current_user: UserRecord = Depends(get_current_user)) -> UserResponse:
    """Retrieve profile and role information for currently signed-in user."""
    user_dict = current_user.to_dict()
    return UserResponse(
        id=user_dict["id"],
        email=user_dict["email"],
        full_name=user_dict["full_name"],
        role=user_dict["role"],
        is_active=user_dict["is_active"],
        created_at=user_dict["created_at"],
    )


@router.get("/users", response_model=List[UserResponse], summary="List all platform users (Admin)")
def list_users_endpoint(db: Session = Depends(get_db)) -> List[UserResponse]:
    """Retrieve all user accounts and their assigned roles for Admin governance."""
    users = db.query(UserRecord).order_by(UserRecord.id.asc()).all()
    result = []
    for u in users:
        d = u.to_dict()
        result.append(UserResponse(
            id=d["id"],
            email=d["email"],
            full_name=d["full_name"],
            role=d["role"],
            is_active=d["is_active"],
            created_at=d["created_at"],
        ))
    return result


@router.patch("/users/{user_id}/role", response_model=UserResponse, summary="Update user role (Admin)")
def update_user_role_endpoint(user_id: int, role: str, db: Session = Depends(get_db)) -> UserResponse:
    """Update assigned RBAC role for specified user."""
    valid_roles = ["admin", "claims_officer", "investigator", "analyst"]
    if role not in valid_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role. Must be one of: {valid_roles}",
        )
    user = db.query(UserRecord).filter(UserRecord.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    user.role = role
    db.commit()
    db.refresh(user)
    d = user.to_dict()
    return UserResponse(
        id=d["id"],
        email=d["email"],
        full_name=d["full_name"],
        role=d["role"],
        is_active=d["is_active"],
        created_at=d["created_at"],
    )
