"""
FastAPI Application Entry Point.

Configures lifespan startup/shutdown, CORS middleware, global exception handlers,
and registers all API sub-routers.
"""

from contextlib import asynccontextmanager
import logging
from typing import AsyncGenerator
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

from backend.app.config import settings
from backend.app.db.database import init_db
from backend.app.api.health import router as health_router
from backend.app.api.claims import router as claims_router
from backend.app.api.reviews import router as reviews_router
from ml.predict import (
    load_model,
    ModelNotLoadedError,
    InvalidFeatureError,
    PredictionError,
)

# Configure application logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s [%(levelname)s] [%(name)s]: %(message)s",
)
logger = logging.getLogger("insurance_api")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Lifespan event handler managing database initialization and ML model loading."""
    logger.info("Initializing %s (Environment: %s)...", settings.APP_NAME, settings.ENVIRONMENT)

    # 1. Initialize database tables
    try:
        init_db()
        logger.info("Database initialized successfully.")
    except Exception as exc:
        logger.error("Failed to initialize database during startup: %s", exc)

    # 2. Load ML model artifact once at application startup
    try:
        loaded = load_model(
            artifact_path=settings.MODEL_ARTIFACT_PATH,
            allow_mock=settings.ALLOW_MOCK_MODEL,
        )
        if loaded:
            logger.info("ML inference subsystem ready.")
        else:
            logger.warning(
                "ML model artifact missing and mock mode disabled. Scoring endpoints will return 503 until model is supplied."
            )
    except Exception as exc:
        logger.error("Error during ML model initialization: %s", exc)

    yield

    logger.info("Shutting down %s...", settings.APP_NAME)


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "IBM Z Datathon 2026: Real-Time Insurance Claim Risk Scoring Platform.\n\n"
        "Connects frontend claim adjusters to machine-learning fraud detection models "
        "deployed on IBM LinuxONE (s390x) architecture.\n\n"
        "Key Capabilities:\n"
        "- Real-Time ML Risk Assessment (Fraud Probability & 0-100 Risk Score)\n"
        "- Human-in-the-Loop Review Workflow (Pending, Under Review, Cleared, Escalated)\n"
        "- Operational Claims & Fraud Analytics Dashboard\n"
        "- Resilient SQLite / PostgreSQL persistence\n"
    ),
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS Middleware for Frontend (React dashboard)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else [settings.CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handlers for safe, sanitized error responses
@app.exception_handler(InvalidFeatureError)
async def handle_invalid_feature_error(request: Request, exc: InvalidFeatureError) -> JSONResponse:
    logger.warning("Feature validation failure on %s: %s", request.url.path, exc)
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": str(exc), "error_type": "InvalidFeatureError"},
    )


@app.exception_handler(ModelNotLoadedError)
async def handle_model_not_loaded_error(request: Request, exc: ModelNotLoadedError) -> JSONResponse:
    logger.error("Model unavailable on %s: %s", request.url.path, exc)
    return JSONResponse(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        content={"detail": str(exc), "error_type": "ModelNotLoadedError"},
    )


@app.exception_handler(PredictionError)
async def handle_prediction_error(request: Request, exc: PredictionError) -> JSONResponse:
    logger.error("Prediction computation error on %s: %s", request.url.path, exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "ML inference engine failed to compute claim prediction.", "error_type": "PredictionError"},
    )


@app.exception_handler(RequestValidationError)
async def handle_request_validation_error(request: Request, exc: RequestValidationError) -> JSONResponse:
    logger.warning("Pydantic validation failure on %s: %s", request.url.path, exc.errors())
    # Format user-friendly validation error messages without leaking internal structures
    sanitized_errors = []
    for err in exc.errors():
        field = " -> ".join(str(loc) for loc in err.get("loc", []))
        sanitized_errors.append({"field": field, "message": err.get("msg", "Invalid value")})
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": sanitized_errors, "error_type": "ValidationError"},
    )


@app.exception_handler(StarletteHTTPException)
async def handle_starlette_http_exception(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )


@app.exception_handler(Exception)
async def handle_unhandled_exception(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled server exception on %s: %s", request.url.path, exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An internal server error occurred. Please contact the platform administrator.",
            "error_type": "InternalServerError",
        },
    )


# Register API Routers
app.include_router(health_router)
app.include_router(claims_router)
app.include_router(reviews_router)


@app.get("/", tags=["Root"])
def root_summary() -> dict:
    """API Root summary."""
    return {
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "online",
        "documentation": "/docs",
        "redoc": "/redoc",
    }
