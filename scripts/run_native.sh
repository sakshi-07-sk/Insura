#!/bin/bash
# ==============================================================================
# Native Deployment Alternative (Without Containers) - IBM Z Datathon 2026
# Runs FastAPI Backend natively with Uvicorn and serves prebuilt React bundle
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${PROJECT_ROOT}"

echo "=========================================================="
echo " Native Deployment on IBM LinuxONE (s390x)"
echo "=========================================================="

# 1. Python Virtual Environment Setup
VENV_DIR="${PROJECT_ROOT}/.venv"
if [[ ! -d "${VENV_DIR}" ]]; then
    echo "[INFO] Creating Python virtual environment in ${VENV_DIR}..."
    python3 -m venv "${VENV_DIR}"
fi

echo "[INFO] Activating virtual environment..."
source "${VENV_DIR}/bin/activate"

echo "[INFO] Installing backend dependencies..."
pip install --upgrade pip
pip install -r backend/requirements.txt

# 2. Check Model Artifact
if [[ ! -f "backend/models/risk_model.joblib" ]]; then
    echo "[ERROR] Model artifact backend/models/risk_model.joblib missing."
    exit 1
fi

# 3. Start Backend in Background
echo "[INFO] Starting FastAPI Uvicorn server on port 8000..."
export PYTHONPATH="${PROJECT_ROOT}"
export DATABASE_URL="sqlite:///${PROJECT_ROOT}/claims.db"
export ALLOW_MOCK_MODEL="false"
export CORS_ORIGINS="*"

nohup uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 > backend.log 2>&1 &
BACKEND_PID=$!
echo "[INFO] Backend started with PID ${BACKEND_PID}"

# 4. Serve Frontend
if [[ -d "${PROJECT_ROOT}/frontend/dist" ]]; then
    echo "[INFO] Serving built frontend from frontend/dist on port 8080..."
    cd "${PROJECT_ROOT}/frontend/dist"
    nohup python3 -m http.server 8080 > frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo "[INFO] Frontend server started with PID ${FRONTEND_PID}"
else
    echo "[WARNING] frontend/dist not found. Please build frontend with 'npm run build' or transfer the dist directory."
fi

echo "=========================================================="
echo " Native Services Launched!"
echo " Backend PID:  ${BACKEND_PID}"
echo " Frontend PID: ${FRONTEND_PID:-N/A}"
echo " Health Check: curl http://127.0.0.1:8000/health"
echo "=========================================================="
