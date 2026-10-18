"""
Database session management and engine initialization.
"""

import logging
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from backend.app.config import settings

logger = logging.getLogger("insurance_api.db")

connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DB_ECHO,
    connect_args=connect_args,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


_tables_initialized = False


def init_db() -> None:
    """Initialize database tables according to defined declarative models."""
    global _tables_initialized
    try:
        from backend.app.db.models import ClaimRecord, UserRecord  # noqa: F401
        from backend.app.services.auth_service import seed_initial_users
        Base.metadata.create_all(bind=engine)
        _tables_initialized = True
        logger.info("Database tables verified and initialized successfully.")

        # Seed initial demo accounts if empty
        with SessionLocal() as db:
            seed_initial_users(db)
            logger.info("Initial user accounts verified/seeded.")
    except Exception as exc:
        logger.error("Failed to initialize database tables: %s", exc)
        raise


def get_db() -> Generator[Session, None, None]:
    """Dependency that provides a transactional database session per request."""
    global _tables_initialized
    if not _tables_initialized:
        init_db()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
