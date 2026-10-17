"""
Pydantic Request and Response Schemas.

Enforces strict input validation, separates claim metadata from ML model features,
and provides OpenAPI documentation examples for Member 3 (Frontend).
"""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, ConfigDict, field_validator


class RiskCategory(str, Enum):
    """Categorized risk evaluation based on model fraud probability."""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class ReviewStatus(str, Enum):
    """Lifecycle status for human investigation and claim payout review."""
    PENDING_REVIEW = "PENDING_REVIEW"
    UNDER_REVIEW = "UNDER_REVIEW"
    CLEARED = "CLEARED"
    ESCALATED = "ESCALATED"


RISK_DISCLAIMER = (
    "NOTICE: Risk score and fraud probability are statistical indicators generated "
    "by machine learning models to prioritize human review. They do not constitute legal proof "
    "of fraud, and claims must never be automatically denied solely on the basis of this score."
)


class ClaimModelFeatures(BaseModel):
    """
    Exact feature set validated and required by the ML inference engine,
    derived directly from Member 1's confirmed model metadata.
    """
    model_config = ConfigDict(extra="forbid")

    Month: str = Field(..., description="Month of incident", examples=["Dec"])
    WeekOfMonth: int = Field(..., ge=1, le=5, description="Week of month of incident", examples=[5])
    DayOfWeek: str = Field(..., description="Day of week of incident", examples=["Wednesday"])
    Make: str = Field(..., description="Vehicle manufacturer", examples=["Honda"])
    AccidentArea: str = Field(..., description="Accident location environment (Urban/Rural)", examples=["Urban"])
    DayOfWeekClaimed: str = Field(..., description="Day of week claim was filed", examples=["Tuesday"])
    MonthClaimed: str = Field(..., description="Month claim was filed", examples=["Jan"])
    WeekOfMonthClaimed: int = Field(..., ge=1, le=5, description="Week of month claim was filed", examples=[1])
    Age: float = Field(..., ge=0.0, le=120.0, description="Age of driver", examples=[21.0])
    Fault: str = Field(..., description="Determined accident fault (Policy Holder / Third Party)", examples=["Policy Holder"])
    PolicyType: str = Field(..., description="Full policy type descriptor", examples=["Sport - Liability"])
    VehicleCategory: str = Field(..., description="Category of vehicle", examples=["Sport"])
    VehiclePrice: str = Field(..., description="Vehicle valuation band", examples=["more than 69000"])
    Deductible: int = Field(..., ge=0, description="Deductible tier amount", examples=[400])
    DriverRating: int = Field(..., ge=1, le=4, description="Driver risk rating category (1-4)", examples=[1])
    Days_Policy_Accident: str = Field(..., description="Days policy was active before accident", examples=["more than 30"])
    Days_Policy_Claim: str = Field(..., description="Days between policy inception and claim", examples=["more than 30"])
    PastNumberOfClaims: str = Field(..., description="Prior claim frequency", examples=["none"])
    AgeOfVehicle: str = Field(..., description="Vehicle age category", examples=["3 years"])
    AgeOfPolicyHolder: str = Field(..., description="Age bracket of policyholder", examples=["21 to 25"])
    PoliceReportFiled: str = Field(..., description="Whether police report was filed (Yes/No)", examples=["No"])
    WitnessPresent: str = Field(..., description="Whether witnesses were present (Yes/No)", examples=["No"])
    AgentType: str = Field(..., description="Agent channel type (External/Internal)", examples=["External"])
    NumberOfSuppliments: str = Field(..., description="Supplemental claims submitted", examples=["none"])
    AddressChange_Claim: str = Field(..., description="Address change timeframe before claim", examples=["under 6 months"])
    NumberOfCars: str = Field(..., description="Number of cars insured under policy", examples=["1 vehicle"])
    Year: int = Field(..., ge=1970, le=2030, description="Calendar year of incident", examples=[1994])
    BasePolicy: str = Field(..., description="Base policy coverage type (Liability/Collision/All Perils)", examples=["Liability"])


class ClaimScoreRequest(BaseModel):
    """Request payload for scoring an insurance claim."""
    claim_id: Optional[str] = Field(None, description="Optional external or existing claim identifier", examples=["CLM-2026-9041"])
    features: ClaimModelFeatures = Field(..., description="Exact model features for risk evaluation")
    notes: Optional[str] = Field(None, description="Optional claim or reviewer notes (not sent to ML model)", examples=["First-party collision claim submitted online."])
    persist: bool = Field(True, description="Whether to persist the scored claim to the database")


class ClaimScoreResponse(BaseModel):
    """Response payload returned after risk scoring."""
    model_config = ConfigDict(protected_namespaces=())

    claim_id: str = Field(..., description="Unique claim identifier", examples=["CLM-2026-9041"])
    fraud_probability: float = Field(..., description="Model estimated probability of fraud [0.0 - 1.0]", examples=[0.785])
    risk_score: float = Field(..., description="Scaled risk score [0.0 - 100.0]", examples=[78.5])
    risk_category: RiskCategory = Field(..., description="Categorized risk tier (LOW, MEDIUM, HIGH)", examples=[RiskCategory.HIGH])
    model_version: str = Field(..., description="ML model version used for inference", examples=["1.0.0"])
    requires_human_review: bool = Field(..., description="Whether claim triggers mandatory human investigation", examples=[True])
    status: ReviewStatus = Field(..., description="Current review status", examples=[ReviewStatus.PENDING_REVIEW])
    message: str = Field(..., description="Operational triage guidance", examples=["Elevated model-estimated risk. Priority human investigation recommended."])
    disclaimer: str = Field(default=RISK_DISCLAIMER, description="Legal and ethical non-proof disclaimer")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Scoring timestamp (UTC)")


class ClaimCreateRequest(BaseModel):
    """Request payload for creating and scoring a claim."""
    claim_id: Optional[str] = Field(None, description="Optional custom unique claim ID. If omitted, one will be generated.", examples=["CLM-2026-1001"])
    external_reference: Optional[str] = Field(None, description="Reference ID from external policy/claims system", examples=["EXT-POL-88412"])
    features: ClaimModelFeatures = Field(..., description="Exact model features")
    notes: Optional[str] = Field(None, description="Initial submission notes")


class ClaimDetailResponse(BaseModel):
    """Complete claim representation including model assessment and review history."""
    model_config = ConfigDict(protected_namespaces=())

    claim_id: str
    external_reference: Optional[str] = None
    features: Dict[str, Any]
    fraud_probability: float
    risk_score: float
    risk_category: RiskCategory
    model_version: str
    review_status: ReviewStatus
    review_notes: Optional[str] = None
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class ClaimReviewUpdateRequest(BaseModel):
    """Review update payload. Protects model-generated fields from alteration."""
    model_config = ConfigDict(extra="forbid")

    review_status: ReviewStatus = Field(..., description="Target status: PENDING_REVIEW, UNDER_REVIEW, CLEARED, ESCALATED")
    reviewer_id: str = Field(..., min_length=2, max_length=100, description="Identifier of human reviewer or investigator", examples=["investigator_sarah"])
    review_notes: Optional[str] = Field(None, max_length=2000, description="Investigator notes and justification", examples=["Confirmed police accident report on file. Payout approved."])


class ClaimListResponse(BaseModel):
    """Paginated list of claims for dashboard viewing."""
    total: int
    page: int
    page_size: int
    total_pages: int
    claims: List[ClaimDetailResponse]


class DashboardStatsResponse(BaseModel):
    """Aggregated operational statistics for dashboard widgets."""
    total_claims: int
    risk_category_counts: Dict[str, int]
    review_status_counts: Dict[str, int]
    claims_awaiting_review: int
    cleared_claims: int
    escalated_claims: int
    average_risk_score: float


class HealthResponse(BaseModel):
    """Liveness probe response."""
    status: str = "ok"
    service: str = "insurance-claim-risk-scoring-api"
    version: str = "1.0.0"
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ReadinessResponse(BaseModel):
    """Readiness probe response verifying internal dependencies."""
    model_config = ConfigDict(protected_namespaces=())

    status: str
    database_ready: bool
    model_ready: bool
    mock_mode_active: bool
    model_version: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ModelInfoResponse(BaseModel):
    """Metadata response describing ML model configuration and readiness."""
    model_config = ConfigDict(protected_namespaces=())

    model_name: str
    model_version: str
    is_ready: bool
    is_real_artifact_loaded: bool
    mock_mode_active: bool
    expected_features: List[str]
    risk_thresholds: Dict[str, float]
