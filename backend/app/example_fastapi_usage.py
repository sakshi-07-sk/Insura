"""Example FastAPI Integration for Member 2 (Backend Engineer).

Demonstrates how Member 2 can integrate the ML module into FastAPI routes
with zero code duplication, automatic schema validation, and instant inference.
"""

from typing import Any, Dict, List
from fastapi import FastAPI, HTTPException
from ml.predict import get_model_info, load_model, score_claim, score_claims
from ml.schemas import (
    BatchClaimInput,
    BatchRiskScoreResponse,
    ClaimInput,
    ModelInfoResponse,
    RiskScoreResponse,
)

app = FastAPI(
    title="Insurance Claim Fraud Risk Scoring API",
    description="Real-time claim risk scoring decision support service powered by scikit-learn on LinuxONE.",
    version="1.0.0",
)


@app.on_event("startup")
def startup_event():
    """Preloads and caches the serialized model pipeline into memory upon server startup."""
    try:
        load_model()
        print("[INFO] Risk model pipeline and metadata successfully preloaded.")
    except Exception as e:
        print(f"[ERROR] Failed to preload model pipeline: {e}")


@app.get("/api/v1/model-info", response_model=Dict if False else Any)
def model_info():
    """Returns the active model metadata, version, threshold policy, and required features."""
    try:
        return get_model_info()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/score-claim", response_model=RiskScoreResponse)
def score_single_claim_endpoint(payload: ClaimInput):
    """Scores a single incoming claim and returns calibrated risk score, category, and explanation."""
    try:
        result = score_claim(payload.features)
        return result
    except ValueError as val_err:
        raise HTTPException(status_code=422, detail=str(val_err))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")


@app.post("/api/v1/score-claims-batch", response_model=BatchRiskScoreResponse)
def score_claims_batch_endpoint(payload: BatchClaimInput):
    """Scores a batch of claims and provides aggregate risk tier breakdown."""
    try:
        claims_list = [c.features for c in payload.claims]
        result = score_claims(claims_list)
        return result
    except ValueError as val_err:
        raise HTTPException(status_code=422, detail=str(val_err))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch inference error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    print("[INFO] Starting example FastAPI server on http://localhost:8000...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
