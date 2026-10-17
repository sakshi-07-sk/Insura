# Real-Time Insurance Claim Risk Scoring Backend

**IBM Z Datathon 2026**  
**Track:** Real-Time Insurance Claim Risk Scoring: Faster Payouts for Genuine Customers, Earlier Detection of Fraud  
**Role:** Member 2 — Backend & API Engineering  
**Target Deployment Environment:** IBM LinuxONE (`s390x`) & Containerized Cloud Ingress

---

## 1. Executive Summary & Architecture

This repository hosts the backend service and REST API for the **Real-Time Insurance Claim Risk Scoring Platform**. The backend coordinates between:
1. **Member 1 (ML Engineer):** Consumes the standardized machine learning inference module (`ml/predict.py`) and model artifacts (`ml/artifacts/model.joblib`).
2. **Member 3 (Frontend Engineer):** Serves clean, documented REST endpoints and CORS headers to the React adjuster dashboard.
3. **Member 4 (DevOps Engineer):** Packaged as a multi-architecture container compatible with IBM LinuxONE (`s390x`) architecture.

```
+-------------------------------------------------------------------------------+
|                       React Web Frontend (Member 3)                           |
|       [Adjuster Dashboard]  <--->  [Claims Triage]  <--->  [SIU Escalation]   |
+---------------------------------------+---------------------------------------+
                                        |  REST API / JSON (CORS Enabled)
                                        v
+-------------------------------------------------------------------------------+
|                   FastAPI Backend Application (Member 2)                      |
|                                                                               |
|  [Input Validation] ---> [Scoring Service] ---> [Claim Service] ---> [Auth]  |
|         |                        |                     |                      |
|         v                        v                     v                      |
|  (Pydantic Schemas)      (ml.predict Interface)   (SQLAlchemy ORM)            |
+----------------------------------+---------------------+----------------------+
                                   |                     |
                  +----------------+                     +----------------+
                  |                                                       |
                  v                                                       v
+------------------------------------+               +------------------------------------+
|  ML Inference Engine (Member 1)    |               | Persistent Database Layer          |
|  - ml/predict.py                   |               | - Development: SQLite (claims.db)  |
|  - Artifacts: model.joblib         |               | - Production: PostgreSQL           |
|  - Risk Calibration & Preprocessor |               | - Parameterized ORM Transactions   |
+------------------------------------+               +------------------------------------+
```

---

## 2. Technology Stack & LinuxONE Compatibility

- **Runtime:** Python 3.11 / 3.12 (compatible with `s390x` LinuxONE architecture).
- **Web Framework:** FastAPI `0.111.0` with Starlette.
- **ASGI Server:** Uvicorn with pure-Python fallbacks for cross-architecture portability.
- **Schema Validation:** Pydantic v2 with strict type coercion and forbidden extra fields.
- **ORM / Persistence:** SQLAlchemy 2.0 with connection pooling and parameterized queries.
- **Database Engine:** SQLite (local zero-dependency fallback) & PostgreSQL (enterprise LinuxONE target).
- **Test Suite:** pytest with in-memory SQLite isolation.
- **Containerization:** Multi-arch Dockerfile based on official `python:3.11-slim`.

---

## 3. Directory Layout

```
.
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # Application lifecycle, CORS, exception handlers
│   │   ├── config.py            # Environment-driven settings with pydantic-settings
│   │   ├── schemas.py           # Strict request/response models & OpenAPI metadata
│   │   ├── dependencies.py      # DB session injection & reviewer authentication
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── health.py        # /health, /ready, /model-info
│   │   │   ├── claims.py        # /claims/score, /claims, /claims/{id}
│   │   │   └── reviews.py       # /claims/{id}/review, /dashboard/stats
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── scoring_service.py # Risk scoring calculation & policy thresholds
│   │   │   └── claim_service.py   # Claim persistence, pagination, aggregation
│   │   └── db/
│   │       ├── __init__.py
│   │       ├── database.py      # Engine, SessionLocal, auto table creation
│   │       └── models.py        # SQLAlchemy ClaimRecord model
│   ├── tests/
│   │   ├── conftest.py          # Isolated in-memory DB & TestClient fixtures
│   │   ├── test_health.py       # Liveness and readiness test suite
│   │   ├── test_scoring.py      # Real-time scoring and validation test suite
│   │   ├── test_claims.py       # Claim creation and query test suite
│   │   └── test_reviews.py      # Human workflow and analytics test suite
│   ├── seed_demo.py             # Synthetic claim seeder for presentations
│   ├── requirements.txt         # Tested compatible dependencies
│   ├── Dockerfile               # Multi-arch LinuxONE & x86 container image
│   └── .env.example             # Safe environment variable template
├── ml/
│   ├── __init__.py
│   └── predict.py               # Member 1 ML inference contract & baseline
├── pytest.ini                   # Pytest configuration
├── .gitignore                   # Git exclusion rules
└── README_BACKEND.md            # Complete engineering manual & API contract
```

---

## 4. API Contract for Member 3 (Frontend Engineer)

Base URL: `http://localhost:8000` (or LinuxONE ingress host).  
Interactive Swagger Docs: `http://localhost:8000/docs`  
ReDoc Reference: `http://localhost:8000/redoc`

### Concept Disambiguation
To avoid operational confusion in the UI, four related concepts must remain separate:
1. **Fraud Probability (`fraud_probability`):** Float from `0.0000` to `1.0000` reflecting raw ML model statistical confidence.
2. **Risk Score (`risk_score`):** Scaled numerical metric from `0.0` to `100.0`.
3. **Risk Category (`risk_category`):** Tiered risk classification (`LOW`, `MEDIUM`, `HIGH`) calculated by threshold rules.
4. **Review Status (`review_status`):** Operational human adjuster workflow state (`PENDING_REVIEW`, `UNDER_REVIEW`, `CLEARED`, `ESCALATED`).

> **Ethical & Legal Safeguard:**  
> The backend never automatically rejects a claim or blocks payouts solely based on an ML score. Scores serve purely to triage and expedite genuine claims while routing elevated-risk claims for prioritized human adjuster inspection.

### Endpoint Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Liveness health check |
| `GET` | `/ready` | Readiness check (database & ML model availability) |
| `GET` | `/model-info` | ML metadata, feature schema, and threshold bounds |
| `POST` | `/claims/score` | Primary real-time risk-scoring endpoint |
| `POST` | `/claims` | Create, score, and persist a new claim |
| `GET` | `/claims` | Paginated claim list with filters (`risk_category`, `review_status`) |
| `GET` | `/claims/{claim_id}` | Retrieve individual claim, score, and review notes |
| `PATCH` | `/claims/{claim_id}/review` | Update adjuster review status (`CLEARED`, `ESCALATED`, etc.) |
| `GET` | `/dashboard/stats` | Aggregated operational KPI metrics for widgets |

---

### Detailed Endpoint Specifications

#### 1. Real-Time Risk Scoring
- **`POST /claims/score`**
- **Request Body:**
```json
{
  "claim_id": "CLM-2026-9041",
  "features": {
    "policy_holder_age": 42,
    "months_as_customer": 36,
    "policy_annual_premium": 1150.0,
    "policy_deductable": 500.0,
    "incident_type": "Multi-vehicle Collision",
    "collision_type": "Rear Collision",
    "incident_severity": "Minor Damage",
    "authorities_contacted": "Police",
    "incident_hour_of_the_day": 14,
    "number_of_vehicles_involved": 2,
    "bodily_injuries": 0,
    "witnesses": 2,
    "police_report_available": "YES",
    "total_claim_amount": 18500.0,
    "injury_claim": 2000.0,
    "property_claim": 3500.0,
    "vehicle_claim": 13000.0,
    "auto_make": "Toyota",
    "auto_year": 2020
  },
  "notes": "Submitted online by policyholder.",
  "persist": true
}
```

- **Response (200 OK):**
```json
{
  "claim_id": "CLM-2026-9041",
  "fraud_probability": 0.05,
  "risk_score": 5.0,
  "risk_category": "LOW",
  "model_version": "1.0.0",
  "requires_human_review": false,
  "status": "PENDING_REVIEW",
  "message": "Low model-estimated risk. Eligible for expedited processing.",
  "disclaimer": "NOTICE: Risk score and fraud probability are statistical indicators generated by machine learning models to prioritize human review. They do not constitute legal proof of fraud, and claims must never be automatically denied solely on the basis of this score.",
  "timestamp": "2026-10-17T09:15:00"
}
```

#### 2. Update Claim Review Status
- **`PATCH /claims/{claim_id}/review`**
- **Request Body:**
```json
{
  "review_status": "CLEARED",
  "reviewer_id": "adjuster_marcus",
  "review_notes": "Repair estimate matches accident report. Fast-track payout issued."
}
```
- **Allowed `review_status` values:** `PENDING_REVIEW`, `UNDER_REVIEW`, `CLEARED`, `ESCALATED`.
- **Protection:** Model predictions (`fraud_probability`, `risk_score`, `model_version`) cannot be altered by review requests.

#### 3. Dashboard Statistics
- **`GET /dashboard/stats`**
- **Response (200 OK):**
```json
{
  "total_claims": 42,
  "risk_category_counts": {
    "LOW": 28,
    "MEDIUM": 9,
    "HIGH": 5
  },
  "review_status_counts": {
    "PENDING_REVIEW": 12,
    "UNDER_REVIEW": 6,
    "CLEARED": 20,
    "ESCALATED": 4
  },
  "claims_awaiting_review": 18,
  "cleared_claims": 20,
  "escalated_claims": 4,
  "average_risk_score": 28.4
}
```

#### 4. Paginated Claims List
- **`GET /claims?risk_category=HIGH&page=1&page_size=20`**
- **Query Parameters:**
  - `risk_category` (`LOW`, `MEDIUM`, `HIGH`)
  - `review_status` (`PENDING_REVIEW`, `UNDER_REVIEW`, `CLEARED`, `ESCALATED`)
  - `page` (integer, default 1)
  - `page_size` (integer, default 20)
- **Response Structure:** `{"total": 5, "page": 1, "page_size": 20, "total_pages": 1, "claims": [...]}`

---

## 5. Integration Guide for Member 1 (ML Engineer)

Member 1 owns model training, feature selection, and inference logic.

### Inference Interface Contract (`ml/predict.py`)
The backend imports and relies on the following standard functions:
```python
from ml.predict import score_claim, get_model_info, load_model, is_model_ready
```

### Steps to Deploy Real Trained Model
1. Train model using your training pipeline.
2. Save your scikit-learn / XGBoost pipeline object using `joblib`:
   ```python
   import joblib
   joblib.dump(pipeline, "ml/artifacts/model.joblib")
   ```
3. Ensure the serialized pipeline accepts a `pandas.DataFrame` or dictionary matching `EXPECTED_FEATURES` and implements either `.predict_proba()` or `.predict()`.
4. In `.env`, set:
   ```env
   MODEL_ARTIFACT_PATH=ml/artifacts/model.joblib
   ALLOW_MOCK_MODEL=false
   ```
5. On backend startup, `load_model()` automatically detects the artifact file and logs:
   `Successfully loaded ML model artifact from: ml/artifacts/model.joblib`.
6. If the model artifact is absent and `ALLOW_MOCK_MODEL=false`, `/ready` will return `503 Service Unavailable`, preventing fabricated scores.

---

## 6. LinuxONE Deployment Guide for Member 4 (DevOps)

The backend is pre-configured for IBM LinuxONE (`s390x`) architecture.

### Target Environment Verification
Run on the target host:
```bash
uname -m          # Confirms s390x
python3 --version # Python 3.11.x or 3.12.x
docker --version  # Docker Engine
```

### Building the Multi-Architecture Container
Run from repository root:
```bash
# Direct build on LinuxONE host
docker build -t insurance-risk-backend:latest -f backend/Dockerfile .

# OR cross-building from x86_64 using Docker buildx
docker buildx build --platform linux/s390x,linux/amd64 -t insurance-risk-backend:latest -f backend/Dockerfile .
```

### Running the Container on LinuxONE
```bash
docker run -d \
  --name insurance-backend \
  -p 8000:8000 \
  -e ENVIRONMENT=production \
  -e ALLOW_MOCK_MODEL=true \
  -e DATABASE_URL=sqlite:////app/data/claims.db \
  -e CORS_ORIGINS=http://your-frontend-domain.com \
  --restart unless-stopped \
  insurance-risk-backend:latest
```

### Container Health Checks
```bash
# Verify container liveness
docker exec insurance-backend curl -f http://localhost:8000/health

# Verify container readiness (DB + Model)
docker exec insurance-backend curl -f http://localhost:8000/ready
```

---

## 7. Local Development & Testing Instructions

### 1. Prerequisites
- Python 3.11 or 3.12 installed.
- Terminal in workspace root.

### 2. Setup Virtual Environment
```bash
# Windows PowerShell
python -m venv venv
.\venv\Scripts\Activate.ps1

# Linux / macOS
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install --upgrade pip
pip install -r backend/requirements.txt
```

### 4. Run Automated Test Suite
```bash
pytest -v
```
*All 19 test cases run in an isolated in-memory SQLite database in under 1 second.*

### 5. Seed Synthetic Presentation Claims
```bash
python backend/seed_demo.py
```

### 6. Start Development Server
```bash
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```
Open browser at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

## 8. Demo Scenarios & Curl Commands

### Scenario A: Low-Risk Genuine Claim
```bash
curl -X POST "http://localhost:8000/claims/score" \
  -H "Content-Type: application/json" \
  -d '{
    "claim_id": "DEMO-LOW-001",
    "features": {
      "policy_holder_age": 48,
      "months_as_customer": 72,
      "policy_annual_premium": 980.0,
      "policy_deductable": 500.0,
      "incident_type": "Multi-vehicle Collision",
      "collision_type": "Rear Collision",
      "incident_severity": "Minor Damage",
      "authorities_contacted": "Police",
      "incident_hour_of_the_day": 15,
      "number_of_vehicles_involved": 2,
      "bodily_injuries": 0,
      "witnesses": 3,
      "police_report_available": "YES",
      "total_claim_amount": 9500.0,
      "injury_claim": 500.0,
      "property_claim": 1000.0,
      "vehicle_claim": 8000.0,
      "auto_make": "Honda",
      "auto_year": 2021
    },
    "notes": "Expedited customer claim",
    "persist": true
  }'
```
*Expected Result:* `risk_category: "LOW"`, `risk_score: < 30.0`, `requires_human_review: false`.

### Scenario B: Elevated-Risk Claim
```bash
curl -X POST "http://localhost:8000/claims/score" \
  -H "Content-Type: application/json" \
  -d '{
    "claim_id": "DEMO-HIGH-002",
    "features": {
      "policy_holder_age": 24,
      "months_as_customer": 1,
      "policy_annual_premium": 1300.0,
      "policy_deductable": 2000.0,
      "incident_type": "Single Vehicle Collision",
      "collision_type": "Front Collision",
      "incident_severity": "Total Loss",
      "authorities_contacted": "None",
      "incident_hour_of_the_day": 2,
      "number_of_vehicles_involved": 1,
      "bodily_injuries": 2,
      "witnesses": 0,
      "police_report_available": "NO",
      "total_claim_amount": 88000.0,
      "injury_claim": 22000.0,
      "property_claim": 18000.0,
      "vehicle_claim": 48000.0,
      "auto_make": "Audi",
      "auto_year": 2023
    },
    "notes": "High dollar total loss with no witnesses",
    "persist": true
  }'
```
*Expected Result:* `risk_category: "HIGH"`, `risk_score: >= 70.0`, `requires_human_review: true`.

### Scenario C: Feature Validation Failure
```bash
curl -X POST "http://localhost:8000/claims/score" \
  -H "Content-Type: application/json" \
  -d '{"features": {"policy_holder_age": 30}}'
```
*Expected Result:* HTTP `422 Unprocessable Entity` listing missing fields.

### Scenario D: Human Reviewer Audit Progression
```bash
curl -X PATCH "http://localhost:8000/claims/DEMO-HIGH-002/review" \
  -H "Content-Type: application/json" \
  -d '{
    "review_status": "UNDER_REVIEW",
    "reviewer_id": "siu_investigator_42",
    "review_notes": "Contacting tow yard and verifying police accident scene report."
  }'
```
*Expected Result:* HTTP `200 OK`, `review_status: "UNDER_REVIEW"`. Model scores remain strictly unchanged.

### Scenario E: Service Recovery & Persistence
Restart the backend server and fetch the claim:
```bash
curl "http://localhost:8000/claims/DEMO-HIGH-002"
```
*Expected Result:* HTTP `200 OK`, claim record and review history remain intact across server restarts.

### Scenario F: Retrieve Live Dashboard Analytics
```bash
curl "http://localhost:8000/dashboard/stats"
```
*Expected Result:* HTTP `200 OK` with counts calculated directly from persistent records.

---

## 9. Security & Production-Readiness Limitations

The following items are implemented in prototype form for the Datathon demo and must be completed prior to general enterprise production:

| Area | Prototype Status | Production Recommendation |
|---|---|---|
| **Authentication** | Optional API Key (`X-API-Key`) | Integrate with corporate IAM / OAuth2 (Keycloak, Okta, or LDAP). |
| **Database** | SQLite default with PostgreSQL support | Provision dedicated PostgreSQL 16 cluster with automated backups and read-replicas. |
| **Model Ingress** | Joblib file on local filesystem | Package model in versioned Model Registry (e.g., MLflow, S3/MinIO bucket). |
| **Transport Security** | HTTP on `0.0.0.0:8000` | Terminate HTTPS (TLS 1.3) at LinuxONE reverse proxy / NGINX ingress. |
| **Audit Logging** | Local logger (`INFO` level) | Export JSON structured logs to centralized SIEM (Splunk, Elastic, or IBM QRadar). |
| **Rate Limiting** | Handled by ASGI server | Deploy Redis-backed rate limiter on public claim submission routes. |
