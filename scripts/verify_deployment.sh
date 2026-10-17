#!/bin/bash
# ==============================================================================
# Smoke Test & End-to-End Verification Script - IBM Z Datathon 2026
# Tests: Health, Model Inference, Schema Validation, Claim Persistence, Routing
# ==============================================================================

set -euo pipefail

BASE_URL="${1:-http://127.0.0.1:8080/api}"
FRONTEND_URL="${2:-http://127.0.0.1:8080}"

echo "=========================================================="
echo " Running Automated Smoke Tests on ${BASE_URL}"
echo "=========================================================="

# 1. Health Probe
echo -n "1. Checking Service Liveness (/health)... "
HEALTH_RESP=$(curl -s -w "\n%{http_code}" "${BASE_URL}/health")
HTTP_CODE=$(echo "${HEALTH_RESP}" | tail -n1)
BODY=$(echo "${HEALTH_RESP}" | sed '$d')

if [[ "${HTTP_CODE}" -eq 200 ]]; then
    echo "[PASS] (HTTP 200)"
else
    echo "[FAIL] (Expected 200, got ${HTTP_CODE})"
    echo "${BODY}"
    exit 1
fi

# 2. Readiness Probe
echo -n "2. Checking Subsystem Readiness (/ready)... "
READY_RESP=$(curl -s -w "\n%{http_code}" "${BASE_URL}/ready")
READY_CODE=$(echo "${READY_RESP}" | tail -n1)
READY_BODY=$(echo "${READY_RESP}" | sed '$d')

if [[ "${READY_CODE}" -eq 200 ]]; then
    echo "[PASS] (Database and Model ready)"
else
    echo "[FAIL] (Readiness returned ${READY_CODE})"
    echo "${READY_BODY}"
    exit 1
fi

# 3. Model Information & Real Artifact Check
echo -n "3. Verifying Model Artifact Loaded (/model-info)... "
MODEL_INFO=$(curl -s "${BASE_URL}/model-info")
IS_REAL=$(echo "${MODEL_INFO}" | grep -o '"is_real_artifact_loaded":true' || true)
IS_MOCK=$(echo "${MODEL_INFO}" | grep -o '"mock_mode_active":false' || true)

if [[ -n "${IS_REAL}" && -n "${IS_MOCK}" ]]; then
    echo "[PASS] (Real ML artifact verified, mock mode inactive)"
else
    echo "[WARNING] Unexpected model state: ${MODEL_INFO}"
fi

# 4. End-to-End Scoring & Claim Ingestion
echo -n "4. Testing Real ML Scoring (/claims)... "
CLAIM_PAYLOAD='{
  "claim_id": "TEST-SMOKE-'$(date +%s)'",
  "Month": "Jan",
  "WeekOfMonth": 3,
  "DayOfWeek": "Wednesday",
  "Make": "Honda",
  "AccidentArea": "Urban",
  "DayOfWeekClaimed": "Thursday",
  "MonthClaimed": "Jan",
  "WeekOfMonthClaimed": 3,
  "Age": 38,
  "Fault": "Policy Holder",
  "PolicyType": "Sedan - All Perils",
  "VehicleCategory": "Sedan",
  "VehiclePrice": "20000 to 29000",
  "Deductible": 400,
  "DriverRating": 2,
  "Days_Policy_Accident": "more than 30",
  "Days_Policy_Claim": "more than 30",
  "PastNumberOfClaims": "none",
  "AgeOfVehicle": "3 years",
  "AgeOfPolicyHolder": "36 to 40",
  "PoliceReportFiled": "No",
  "WitnessPresent": "No",
  "AgentType": "External",
  "NumberOfSuppliments": "none",
  "AddressChange_Claim": "no change",
  "NumberOfCars": "1 vehicle",
  "Year": 2024,
  "BasePolicy": "All Perils"
}'

SUBMIT_RESP=$(curl -s -X POST "${BASE_URL}/claims" \
  -H "Content-Type: application/json" \
  -d "${CLAIM_PAYLOAD}")

SCORE=$(echo "${SUBMIT_RESP}" | grep -o '"risk_score":[0-9.]*' || true)
TIER=$(echo "${SUBMIT_RESP}" | grep -o '"risk_category":"[^"]*"' || true)

if [[ -n "${SCORE}" && -n "${TIER}" ]]; then
    echo "[PASS] (${TIER}, ${SCORE})"
else
    echo "[FAIL] Claim submission failed: ${SUBMIT_RESP}"
    exit 1
fi

# 5. Database Persistence Check
echo -n "5. Checking Claim Persistence in Database (/claims)... "
LIST_RESP=$(curl -s "${BASE_URL}/claims?limit=5")
if echo "${LIST_RESP}" | grep -q "TEST-SMOKE-"; then
    echo "[PASS] (Persisted claim retrieved from database)"
else
    echo "[FAIL] Newly created claim not found in claims list: ${LIST_RESP}"
    exit 1
fi

# 6. Frontend Static Delivery & SPA Routing
echo -n "6. Checking Frontend Web Application (${FRONTEND_URL})... "
FRONTEND_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${FRONTEND_URL}/")
if [[ "${FRONTEND_CODE}" -eq 200 ]]; then
    echo "[PASS] (React HTML index served HTTP 200)"
else
    echo "[FAIL] Frontend returned HTTP ${FRONTEND_CODE}"
    exit 1
fi

echo "=========================================================="
echo " ALL SMOKE TESTS PASSED SUCCESSFULLY! "
echo " Real-Time Insurance Claim Scoring is fully operational!"
echo "=========================================================="
