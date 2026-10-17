"""
Claim Ingestion, Real-Time Risk Scoring, and Query Endpoints.
"""

from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from backend.app.dependencies import get_db
from backend.app.schemas import (
    ClaimScoreRequest,
    ClaimScoreResponse,
    ClaimCreateRequest,
    ClaimDetailResponse,
    ClaimListResponse,
    RiskCategory,
    ReviewStatus,
)
from backend.app.services.claim_service import (
    create_and_score_claim,
    get_claim_by_id,
    list_claims,
)

router = APIRouter(prefix="/claims", tags=["Claims & Risk Scoring"])


@router.post(
    "/score",
    response_model=ClaimScoreResponse,
    status_code=status.HTTP_200_OK,
    summary="Score an Insurance Claim",
    description=(
        "Primary risk-scoring endpoint. Validates input features against the ML contract, "
        "calls Member 1's shared ML inference module, computes risk category and human-review "
        "recommendation, optionally persists the result, and returns standardized scoring data."
    ),
)
def score_claim_endpoint(
    payload: ClaimScoreRequest,
    db: Session = Depends(get_db),
) -> ClaimScoreResponse:
    """Execute risk scoring for submitted claim features."""
    features_dict = payload.features.model_dump()
    result = create_and_score_claim(
        db=db,
        features=features_dict,
        claim_id=payload.claim_id,
        notes=payload.notes,
        persist=payload.persist,
    )

    return ClaimScoreResponse(
        claim_id=result["claim_id"],
        fraud_probability=result["fraud_probability"],
        risk_score=result["risk_score"],
        risk_category=RiskCategory(result["risk_category"]),
        model_version=result["model_version"],
        requires_human_review=(result["risk_category"] in [RiskCategory.MEDIUM.value, RiskCategory.HIGH.value]),
        status=ReviewStatus(result["review_status"]),
        message=(
            "Elevated model-estimated risk. Priority human investigation recommended."
            if result["risk_category"] == RiskCategory.HIGH.value
            else "Moderate model-estimated risk. Standard human review recommended."
            if result["risk_category"] == RiskCategory.MEDIUM.value
            else "Low model-estimated risk. Eligible for expedited processing."
        ),
        timestamp=datetime.fromisoformat(result["created_at"]) if isinstance(result.get("created_at"), str) else datetime.utcnow(),
    )


@router.post(
    "",
    response_model=ClaimDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit Claim for Evaluation and Persistence",
    description="Validates claim payload, creates a persistent claim record, scores it, and returns complete claim details.",
)
def create_claim_endpoint(
    payload: ClaimCreateRequest,
    db: Session = Depends(get_db),
) -> ClaimDetailResponse:
    """Submit a claim for creation and immediate risk scoring."""
    features_dict = payload.features.model_dump()
    result = create_and_score_claim(
        db=db,
        features=features_dict,
        claim_id=payload.claim_id,
        external_reference=payload.external_reference,
        notes=payload.notes,
        persist=True,
    )

    return ClaimDetailResponse(
        claim_id=result["claim_id"],
        external_reference=result.get("external_reference"),
        features=result["features"],
        fraud_probability=result["fraud_probability"],
        risk_score=result["risk_score"],
        risk_category=RiskCategory(result["risk_category"]),
        model_version=result["model_version"],
        review_status=ReviewStatus(result["review_status"]),
        review_notes=result.get("review_notes"),
        reviewed_by=result.get("reviewed_by"),
        reviewed_at=result.get("reviewed_at"),
        created_at=datetime.fromisoformat(result["created_at"]) if isinstance(result.get("created_at"), str) else result.get("created_at"),
        updated_at=datetime.fromisoformat(result["updated_at"]) if isinstance(result.get("updated_at"), str) else result.get("updated_at"),
    )


@router.get(
    "",
    response_model=ClaimListResponse,
    summary="List Claims with Filters and Pagination",
    description="Retrieve paginated claims with optional filtering by risk category, review status, and creation date.",
)
def list_claims_endpoint(
    risk_category: Optional[RiskCategory] = Query(None, description="Filter by risk category tier (LOW, MEDIUM, HIGH)"),
    review_status: Optional[ReviewStatus] = Query(None, description="Filter by review status"),
    date_from: Optional[datetime] = Query(None, description="Filter claims created on or after this timestamp"),
    date_to: Optional[datetime] = Query(None, description="Filter claims created on or before this timestamp"),
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
) -> ClaimListResponse:
    """List claims with pagination and filter criteria."""
    return list_claims(
        db=db,
        risk_category=risk_category,
        review_status=review_status,
        date_from=date_from,
        date_to=date_to,
        page=page,
        page_size=page_size,
    )


@router.get(
    "/{claim_id}",
    response_model=ClaimDetailResponse,
    summary="Retrieve Single Claim Record",
    description="Fetch a single claim by claim identifier with its ML risk assessment and audit history.",
    responses={404: {"description": "Claim not found."}},
)
def get_claim_endpoint(
    claim_id: str,
    db: Session = Depends(get_db),
) -> ClaimDetailResponse:
    """Retrieve full details of an identified claim."""
    claim = get_claim_by_id(db, claim_id)
    return ClaimDetailResponse(
        claim_id=claim.claim_id,
        external_reference=claim.external_reference,
        features=claim.features,
        fraud_probability=claim.fraud_probability,
        risk_score=claim.risk_score,
        risk_category=RiskCategory(claim.risk_category),
        model_version=claim.model_version,
        review_status=ReviewStatus(claim.review_status),
        review_notes=claim.review_notes,
        reviewed_by=claim.reviewed_by,
        reviewed_at=claim.reviewed_at,
        created_at=claim.created_at,
        updated_at=claim.updated_at,
    )
