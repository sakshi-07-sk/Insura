"""
SQLAlchemy ORM models for Insurance Claim Records.
"""

from datetime import datetime
from typing import Any, Dict
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON, func
from backend.app.db.database import Base


class ClaimRecord(Base):
    """Stores assessed insurance claims, ML scoring outputs, and human review status."""

    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    claim_id = Column(String(64), unique=True, index=True, nullable=False)
    external_reference = Column(String(100), index=True, nullable=True)
    features = Column(JSON, nullable=False)
    fraud_probability = Column(Float, nullable=False)
    risk_score = Column(Float, nullable=False)
    risk_category = Column(String(20), index=True, nullable=False)
    model_version = Column(String(50), nullable=False)
    review_status = Column(String(30), default="PENDING_REVIEW", index=True, nullable=False)
    review_notes = Column(Text, nullable=True)
    reviewed_by = Column(String(100), nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True, nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    def to_dict(self) -> Dict[str, Any]:
        """Convert ORM object to clean dictionary."""
        return {
            "claim_id": self.claim_id,
            "external_reference": self.external_reference,
            "features": self.features,
            "fraud_probability": self.fraud_probability,
            "risk_score": self.risk_score,
            "risk_category": self.risk_category,
            "model_version": self.model_version,
            "review_status": self.review_status,
            "review_notes": self.review_notes,
            "reviewed_by": self.reviewed_by,
            "reviewed_at": self.reviewed_at.isoformat() if self.reviewed_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
