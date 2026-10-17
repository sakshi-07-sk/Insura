"""
Health, Readiness, and Model Metadata Endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session

from backend.app.dependencies import get_db
from backend.app.schemas import HealthResponse, ReadinessResponse, ModelInfoResponse
from backend.app.services.scoring_service import get_ml_status, is_ml_ready

router = APIRouter(tags=["Health & Status"])


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Service Liveness Check",
    description="Returns standard operational health status indicating the API service is active.",
)
def get_health() -> HealthResponse:
    """Liveness probe for container orchestrators and monitoring tools."""
    return HealthResponse()


@router.get(
    "/ready",
    response_model=ReadinessResponse,
    summary="Service Readiness Probe",
    description=(
        "Checks operational readiness of internal dependencies: "
        "database connectivity and ML model availability."
    ),
    responses={
        200: {"description": "All dependencies healthy and ready for traffic."},
        503: {"description": "Service not ready (database unreachable or model unloaded)."},
    },
)
def get_readiness(db: Session = Depends(get_db)) -> ReadinessResponse:
    """Readiness probe verifying database and ML model readiness."""
    db_ready = False
    try:
        db.execute(text("SELECT 1"))
        db_ready = True
    except Exception:
        db_ready = False

    ml_info = get_ml_status()
    ml_ready = is_ml_ready()

    overall_ready = db_ready and ml_ready
    response_data = ReadinessResponse(
        status="ready" if overall_ready else "not_ready",
        database_ready=db_ready,
        model_ready=ml_ready,
        mock_mode_active=ml_info.get("mock_mode_active", False),
        model_version=ml_info.get("model_version", "unknown"),
    )

    if not overall_ready:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=response_data.model_dump(mode="json"),
        )

    return response_data


@router.get(
    "/model-info",
    response_model=ModelInfoResponse,
    summary="Model Metadata and Readiness",
    description=(
        "Exposes ML model version, expected feature attributes, "
        "threshold configurations, and artifact readiness without leaking secrets."
    ),
)
def get_model_information() -> ModelInfoResponse:
    """Model information endpoint."""
    info = get_ml_status()
    features_list = list(info.get("features", {}).get("feature_schema", {}).keys()) or info.get("expected_features", [])
    selected_th = float(info.get("selected_threshold", 0.54))

    return ModelInfoResponse(
        model_name=info.get("model_name") or info.get("model_type", "RandomForest"),
        model_version=info.get("model_version", "1.0.0"),
        is_ready=is_ml_ready(),
        is_real_artifact_loaded=is_ml_ready(),
        mock_mode_active=info.get("mock_mode_active", False),
        expected_features=features_list,
        risk_thresholds={
            "low_threshold": round(selected_th * 0.70, 4),
            "high_threshold": selected_th,
        },
    )
