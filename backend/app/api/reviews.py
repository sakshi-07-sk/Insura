"""
Human Investigation Review Workflow and Dashboard Metrics Endpoints.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from backend.app.dependencies import get_db, verify_reviewer_auth
from backend.app.schemas import (
    ClaimDetailResponse,
    ClaimReviewUpdateRequest,
    DashboardStatsResponse,
    RiskCategory,
    ReviewStatus,
)
from backend.app.services.claim_service import (
    update_claim_review,
    compute_dashboard_stats,
)

router = APIRouter(tags=["Investigation Workflow & Analytics"])


@router.patch(
    "/claims/{claim_id}/review",
    response_model=ClaimDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Update Claim Review Workflow Status",
    description=(
        "Allows authorized claims adjusters and fraud investigators to progress claims through "
        "investigation lifecycle: PENDING_REVIEW -> UNDER_REVIEW -> CLEARED / ESCALATED. "
        "Strictly prevents altering model-generated risk scores or version metadata."
    ),
    responses={
        401: {"description": "Missing authentication credentials when enforced."},
        403: {"description": "Unauthorized access key."},
        404: {"description": "Claim not found."},
    },
)
def update_claim_review_endpoint(
    claim_id: str,
    payload: ClaimReviewUpdateRequest,
    _auth: str = Depends(verify_reviewer_auth),
    db: Session = Depends(get_db),
) -> ClaimDetailResponse:
    """Update human review status and audit notes for an identified claim."""
    updated_claim = update_claim_review(
        db=db,
        claim_id=claim_id,
        new_status=payload.review_status,
        reviewer_id=payload.reviewer_id,
        review_notes=payload.review_notes,
    )

    return ClaimDetailResponse(
        claim_id=updated_claim.claim_id,
        external_reference=updated_claim.external_reference,
        features=updated_claim.features,
        fraud_probability=updated_claim.fraud_probability,
        risk_score=updated_claim.risk_score,
        risk_category=RiskCategory(updated_claim.risk_category),
        model_version=updated_claim.model_version,
        review_status=ReviewStatus(updated_claim.review_status),
        review_notes=updated_claim.review_notes,
        reviewed_by=updated_claim.reviewed_by,
        reviewed_at=updated_claim.reviewed_at,
        created_at=updated_claim.created_at,
        updated_at=updated_claim.updated_at,
    )


@router.get(
    "/dashboard/stats",
    response_model=DashboardStatsResponse,
    summary="Dashboard Operational Summary Statistics",
    description=(
        "Returns live aggregated counts calculated directly from persistent claim records: "
        "total claims, counts by risk category tier, review status counts, and average risk score."
    ),
)
def get_dashboard_statistics(
    db: Session = Depends(get_db),
) -> DashboardStatsResponse:
    """Compute and return operational dashboard metrics."""
    return compute_dashboard_stats(db)
