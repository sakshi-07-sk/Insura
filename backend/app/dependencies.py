"""
FastAPI Dependencies for Database Sessions and Access Control.
"""

from typing import Optional
from fastapi import Header, HTTPException, Security, status
from fastapi.security import APIKeyHeader
from backend.app.config import settings
from backend.app.db.database import get_db

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


def verify_reviewer_auth(
    api_key: Optional[str] = Security(api_key_header),
    x_reviewer_id: Optional[str] = Header(None, alias="X-Reviewer-Id"),
) -> str:
    """
    Enforce reviewer authorization when REQUIRE_AUTH is enabled.
    In development/prototype mode, permits requests with documentation disclaimer.
    """
    if settings.REQUIRE_AUTH:
        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing authentication credentials. Header 'X-API-Key' is required.",
            )
        if api_key != settings.API_KEY:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid reviewer authorization key.",
            )

    return x_reviewer_id or "reviewer"
