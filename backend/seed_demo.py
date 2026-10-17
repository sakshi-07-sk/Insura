"""
Synthetic Claim Data Seeder for Development and Frontend Integration.

Seeds realistic low-risk, medium-risk, and elevated-risk insurance claims
to facilitate testing Member 3's React dashboard.
"""

import sys
from pathlib import Path
import pandas as pd

# Add project root directory to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.app.config import settings
from backend.app.db.database import SessionLocal, init_db
from backend.app.services.claim_service import create_and_score_claim, update_claim_review
from backend.app.schemas import ReviewStatus
from ml.predict import load_model, get_model_info


def seed_database() -> None:
    """Insert initial synthetic demo claims."""
    init_db()
    load_model()
    db = SessionLocal()

    raw_csv = PROJECT_ROOT / "data" / "raw" / "claims.csv"
    if not raw_csv.exists():
        print("[ERROR] Dataset not found. Please run 'python data/download_dataset.py' first.")
        return

    meta = get_model_info()
    cols = list(meta["features"]["feature_schema"].keys())
    df = pd.read_csv(raw_csv)

    # 1. Genuine low-risk claim
    low_row = df[df["FraudFound_P"] == 0].iloc[10][cols].to_dict()
    # 2. Borderline / Moderate claim
    med_row = df[df["FraudFound_P"] == 0].iloc[55][cols].to_dict()
    # 3. High-risk fraud-flagged claim
    high_row = df[df["FraudFound_P"] == 1].iloc[0][cols].to_dict()
    # 4. Another elevated-risk claim
    high_row_2 = df[df["FraudFound_P"] == 1].iloc[2][cols].to_dict()

    claims_data = [
        {
            "claim_id": "CLM-2026-00101",
            "external_reference": "POL-TX-90112",
            "notes": "Verified genuine parking incident.",
            "features": low_row,
            "status_update": ReviewStatus.CLEARED,
            "reviewer": "adjuster_elena",
            "review_notes": "Trivial damage verified by dashcam. Fast-track payout issued.",
        },
        {
            "claim_id": "CLM-2026-00102",
            "external_reference": "POL-OH-33419",
            "notes": "Rear-end collision during rush hour.",
            "features": med_row,
            "status_update": ReviewStatus.UNDER_REVIEW,
            "reviewer": "adjuster_marcus",
            "review_notes": "Awaiting repair shop quote confirmation.",
        },
        {
            "claim_id": "CLM-2026-00103",
            "external_reference": "POL-FL-77801",
            "notes": "Elevated risk flagged by model with multiple anomalies.",
            "features": high_row,
            "status_update": ReviewStatus.ESCALATED,
            "reviewer": "siu_lead_davis",
            "review_notes": "Referred to Special Investigation Unit (SIU) due to anomalous risk factors.",
        },
        {
            "claim_id": "CLM-2026-00104",
            "external_reference": "POL-NY-55610",
            "notes": "New claim submission pending adjuster triage.",
            "features": high_row_2,
            "status_update": ReviewStatus.PENDING_REVIEW,
            "reviewer": None,
            "review_notes": None,
        },
    ]

    try:
        for item in claims_data:
            claim_dict = create_and_score_claim(
                db=db,
                features=item["features"],
                claim_id=item["claim_id"],
                external_reference=item["external_reference"],
                notes=item["notes"],
                persist=True,
            )
            print(f"Created claim {claim_dict['claim_id']} - Category: {claim_dict['risk_category']} - Score: {claim_dict['risk_score']}")

            if item["status_update"]:
                update_claim_review(
                    db=db,
                    claim_id=item["claim_id"],
                    new_status=item["status_update"],
                    reviewer_id=item["reviewer"] or "system",
                    review_notes=item["review_notes"],
                )
                print(f"  -> Updated review status to {item['status_update'].value}")

        print("\nSeed completed successfully!")
    except Exception as exc:
        print(f"Seed encountered notice/error (already seeded or error): {exc}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
