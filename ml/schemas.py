"""Validation schemas for Insurance Claim Risk Scoring inputs and outputs.

Defines Pydantic models for single and batch claim scoring, threshold configurations,
and API response structures compatible with FastAPI.
"""

from enum import Enum
from typing import Any, Dict, List, Optional
import math
from pydantic import BaseModel, Field, field_validator, model_validator


class RiskCategory(str, Enum):
    """Enumeration of triage risk categories."""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class ClaimInput(BaseModel):
    """Raw claim record input for risk scoring.

    Accepts key-value feature pairs corresponding to the model's feature schema.
    Validates against empty payloads, NaN/infinity numbers, and null inputs.
    """
    features: Dict[str, Any] = Field(
        ...,
        description="Dictionary of claim feature names and their corresponding values.",
        json_schema_extra={
            "example": {
                "Month": "Dec",
                "WeekOfMonth": 5,
                "DayOfWeek": "Wednesday",
                "Make": "Honda",
                "AccidentArea": "Urban",
                "DayOfWeekClaimed": "Tuesday",
                "MonthClaimed": "Jan",
                "WeekOfMonthClaimed": 1,
                "Age": 21,
                "Fault": "Policy Holder",
                "PolicyType": "Sport - Liability",
                "VehicleCategory": "Sport",
                "VehiclePrice": "more than 69000",
                "Deductible": 400,
                "DriverRating": 1,
                "Days_Policy_Accident": "more than 30",
                "Days_Policy_Claim": "more than 30",
                "PastNumberOfClaims": "none",
                "AgeOfVehicle": "3 years",
                "AgeOfPolicyHolder": "21 to 25",
                "PoliceReportFiled": "No",
                "WitnessPresent": "No",
                "AgentType": "External",
                "NumberOfSuppliments": "none",
                "AddressChange_Claim": "under 6 months",
                "NumberOfCars": "1 vehicle",
                "Year": 1994,
                "BasePolicy": "Liability",
            }
        },
    )

    @field_validator("features")
    @classmethod
    def validate_features_non_empty(cls, v: Dict[str, Any]) -> Dict[str, Any]:
        if not v or len(v) == 0:
            raise ValueError("Claim features dictionary cannot be empty.")
        for key, val in v.items():
            if val is None:
                raise ValueError(f"Feature '{key}' cannot be None / null.")
            if isinstance(val, (float, int)):
                if math.isnan(val) or math.isinf(val):
                    raise ValueError(f"Feature '{key}' has invalid numerical value (NaN or Infinity).")
        return v


class BatchClaimInput(BaseModel):
    """Batch input for multiple claims."""
    claims: List[ClaimInput] = Field(..., min_length=1, description="List of claim records to score.")


class RiskFactor(BaseModel):
    """Description of a single contributing risk factor."""
    feature: str = Field(..., description="Name of the feature.")
    value: Any = Field(..., description="Value provided in the claim.")
    contribution_direction: str = Field(
        ..., description="'INCREASES_RISK', 'DECREASES_RISK', or 'NEUTRAL'."
    )
    importance_weight: float = Field(..., description="Relative model importance weight.")
    description: str = Field(..., description="Human-readable explanation of risk influence.")


class RiskScoreResponse(BaseModel):
    """Standardized response contract for claim risk scoring."""
    risk_score: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="Calibrated fraud risk score from 0.0 to 100.0.",
    )
    fraud_probability: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Estimated probability of fraud from 0.0 to 1.0.",
    )
    risk_category: RiskCategory = Field(
        ...,
        description="Assigned risk tier: LOW, MEDIUM, or HIGH.",
    )
    model_version: str = Field(..., description="Version of the trained model.")
    threshold_used: float = Field(
        ..., description="Decision threshold applied for HIGH risk classification."
    )
    requires_human_review: bool = Field(
        ...,
        description="True if score meets or exceeds high-risk threshold requiring fraud investigator triage.",
    )
    explanation: str = Field(
        ...,
        description="Honest summary explanation of risk score and recommended workflow action.",
    )
    top_risk_factors: Optional[List[RiskFactor]] = Field(
        default=None,
        description="Top contributing features influencing the score.",
    )


class BatchRiskScoreResponse(BaseModel):
    """Batch response containing scores for all input claims."""
    total_claims: int
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
    results: List[RiskScoreResponse]


class ModelInfoResponse(BaseModel):
    """Metadata response describing the active model artifact."""
    model_version: str
    model_type: str
    training_timestamp: str
    selected_threshold: float
    threshold_policy: Dict[str, Any]
    feature_count: int
    required_features: List[str]
    excluded_columns: List[str]
    package_versions: Dict[str, str]
