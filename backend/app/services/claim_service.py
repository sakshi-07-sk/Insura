"""
Claim Management and Lifecycle Service.

Orchestrates database operations, claim creation, pagination, review updates,
and dashboard metric aggregations.
"""

from datetime import datetime
import math
import uuid
import logging
from typing import Any, Dict, List, Optional
from sqlalchemy import func, desc
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from backend.app.db.models import ClaimRecord
from backend.app.schemas import (
    RiskCategory,
    ReviewStatus,
    ClaimDetailResponse,
    ClaimListResponse,
    DashboardStatsResponse,
)
from backend.app.services.scoring_service import score_features

logger = logging.getLogger("insurance_api.claim_service")


def generate_claim_id() -> str:
    """Generate human-readable unique claim reference."""
    short_uuid = uuid.uuid4().hex[:8].upper()
    year = datetime.utcnow().year
    return f"CLM-{year}-{short_uuid}"


def create_and_score_claim(
    db: Session,
    features: Dict[str, Any],
    claim_id: Optional[str] = None,
    external_reference: Optional[str] = None,
    notes: Optional[str] = None,
    persist: bool = True,
) -> Dict[str, Any]:
    """Score claim features and persist record if requested."""
    final_claim_id = claim_id.strip() if claim_id and claim_id.strip() else generate_claim_id()

    # Check for duplicate claim_id if persisting
    if persist:
        existing = db.query(ClaimRecord).filter(ClaimRecord.claim_id == final_claim_id).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Claim with identifier '{final_claim_id}' already exists.",
            )

    score_data = score_features(features)

    record_dict = {
        "claim_id": final_claim_id,
        "external_reference": external_reference,
        "features": features,
        "fraud_probability": score_data["fraud_probability"],
        "risk_score": score_data["risk_score"],
        "risk_category": score_data["risk_category"].value,
        "model_version": score_data["model_version"],
        "review_status": ReviewStatus.PENDING_REVIEW.value,
        "review_notes": notes,
        "reviewed_by": None,
        "reviewed_at": None,
    }

    if persist:
        claim_record = ClaimRecord(**record_dict)
        db.add(claim_record)
        db.commit()
        db.refresh(claim_record)
        logger.info("Persisted new claim: %s with score: %s", final_claim_id, score_data["risk_score"])
        return claim_record.to_dict()

    record_dict["created_at"] = datetime.utcnow().isoformat()
    record_dict["updated_at"] = datetime.utcnow().isoformat()
    return record_dict


def get_claim_by_id(db: Session, claim_id: str) -> ClaimRecord:
    """Retrieve a single claim record by its unique identifier."""
    claim = db.query(ClaimRecord).filter(ClaimRecord.claim_id == claim_id).first()
    if not claim:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Claim '{claim_id}' was not found in the records.",
        )
    return claim


def list_claims(
    db: Session,
    risk_category: Optional[RiskCategory] = None,
    review_status: Optional[ReviewStatus] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    page: int = 1,
    page_size: int = 20,
) -> ClaimListResponse:
    """Return filtered and paginated claim records."""
    query = db.query(ClaimRecord)

    if risk_category:
        query = query.filter(ClaimRecord.risk_category == risk_category.value)
    if review_status:
        query = query.filter(ClaimRecord.review_status == review_status.value)
    if date_from:
        query = query.filter(ClaimRecord.created_at >= date_from)
    if date_to:
        query = query.filter(ClaimRecord.created_at <= date_to)

    total_records = query.count()
    total_pages = math.ceil(total_records / page_size) if total_records > 0 else 1

    records = (
        query.order_by(desc(ClaimRecord.created_at))
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    claims_list = [
        ClaimDetailResponse(
            claim_id=r.claim_id,
            external_reference=r.external_reference,
            features=r.features,
            fraud_probability=r.fraud_probability,
            risk_score=r.risk_score,
            risk_category=RiskCategory(r.risk_category),
            model_version=r.model_version,
            review_status=ReviewStatus(r.review_status),
            review_notes=r.review_notes,
            reviewed_by=r.reviewed_by,
            reviewed_at=r.reviewed_at,
            created_at=r.created_at,
            updated_at=r.updated_at,
        )
        for r in records
    ]

    return ClaimListResponse(
        total=total_records,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        claims=claims_list,
    )


def update_claim_review(
    db: Session,
    claim_id: str,
    new_status: ReviewStatus,
    reviewer_id: str,
    review_notes: Optional[str] = None,
) -> ClaimRecord:
    """
    Update human investigation review status.
    Protected: Model scores and version cannot be altered by review actions.
    """
    claim = get_claim_by_id(db, claim_id)

    claim.review_status = new_status.value
    claim.reviewed_by = reviewer_id
    claim.reviewed_at = datetime.utcnow()
    if review_notes:
        claim.review_notes = review_notes

    db.commit()
    db.refresh(claim)
    logger.info("Updated review status of claim %s to %s by %s", claim_id, new_status.value, reviewer_id)
    return claim


def compute_dashboard_stats(db: Session) -> DashboardStatsResponse:
    """Compute aggregate counts and metrics directly from stored claims."""
    total_claims = db.query(func.count(ClaimRecord.id)).scalar() or 0

    # Risk category counts
    risk_counts = {
        RiskCategory.LOW.value: 0,
        RiskCategory.MEDIUM.value: 0,
        RiskCategory.HIGH.value: 0,
    }
    risk_results = (
        db.query(ClaimRecord.risk_category, func.count(ClaimRecord.id))
        .group_by(ClaimRecord.risk_category)
        .all()
    )
    for cat, count in risk_results:
        if cat in risk_counts:
            risk_counts[cat] = count

    # Review status counts
    status_counts = {
        ReviewStatus.PENDING_REVIEW.value: 0,
        ReviewStatus.UNDER_REVIEW.value: 0,
        ReviewStatus.CLEARED.value: 0,
        ReviewStatus.ESCALATED.value: 0,
    }
    status_results = (
        db.query(ClaimRecord.review_status, func.count(ClaimRecord.id))
        .group_by(ClaimRecord.review_status)
        .all()
    )
    for stat_val, count in status_results:
        if stat_val in status_counts:
            status_counts[stat_val] = count

    # Claims awaiting review (Pending + Under review)
    awaiting = (
        status_counts[ReviewStatus.PENDING_REVIEW.value]
        + status_counts[ReviewStatus.UNDER_REVIEW.value]
    )
    cleared = status_counts[ReviewStatus.CLEARED.value]
    escalated = status_counts[ReviewStatus.ESCALATED.value]

    avg_score = db.query(func.avg(ClaimRecord.risk_score)).scalar()
    avg_score_clean = round(float(avg_score), 2) if avg_score is not None else 0.0

    return DashboardStatsResponse(
        total_claims=total_claims,
        risk_category_counts=risk_counts,
        review_status_counts=status_counts,
        claims_awaiting_review=awaiting,
        cleared_claims=cleared,
        escalated_claims=escalated,
        average_risk_score=avg_score_clean,
    )
