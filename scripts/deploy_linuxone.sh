#!/bin/bash
# ==============================================================================
# LinuxONE (s390x) Automated Deployment Script - IBM Z Datathon 2026
# Supports: Podman 5.x (native RHEL rootless), Podman Compose, or Docker
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${PROJECT_ROOT}"

echo "=========================================================="
echo " Starting ClaimGuard AI Deployment on IBM LinuxONE"
echo "=========================================================="
echo "Host Architecture: $(uname -m)"
echo "Current User:      $(whoami) (UID: $(id -u))"
echo "Working Directory: ${PROJECT_ROOT}"
echo "=========================================================="

# 1. Architecture sanity check
ARCH="$(uname -m)"
if [[ "${ARCH}" != "s390x" && "${ARCH}" != "x86_64" ]]; then
    echo "[WARNING] Unexpected architecture: ${ARCH}. Expected s390x or x86_64."
fi

# 2. Check model artifact
if [[ ! -f "backend/models/risk_model.joblib" ]]; then
    echo "[ERROR] Model artifact backend/models/risk_model.joblib not found!"
    echo "Please transfer Member 1's model artifact using SCP or train it before deploying:"
    echo "  python3 backend/training/train_model.py"
    exit 1
fi
echo "[OK] Model artifact found: $(ls -lh backend/models/risk_model.joblib | awk '{print $5, $9}')"

# 3. Determine Container Engine
CONTAINER_CMD=""
if command -v podman &>/dev/null; then
    CONTAINER_CMD="podman"
elif command -v docker &>/dev/null; then
    CONTAINER_CMD="docker"
else
    echo "[ERROR] Neither podman nor docker found on system."
    exit 1
fi
echo "[OK] Container runtime: ${CONTAINER_CMD} ($(${CONTAINER_CMD} --version))"

# 4. Check Compose support
if command -v podman-compose &>/dev/null; then
    COMPOSE_CMD="podman-compose"
elif ${CONTAINER_CMD} compose version &>/dev/null; then
    COMPOSE_CMD="${CONTAINER_CMD} compose"
else
    COMPOSE_CMD=""
fi

if [[ -n "${COMPOSE_CMD}" ]]; then
    echo "[INFO] Deploying via ${COMPOSE_CMD}..."
    ${COMPOSE_CMD} down 2>/dev/null || true
    ${COMPOSE_CMD} build
    ${COMPOSE_CMD} up -d
else
    echo "[INFO] Compose not installed. Using native rootless ${CONTAINER_CMD} commands..."
    
    # Create private network
    ${CONTAINER_CMD} network exists insura-net 2>/dev/null || ${CONTAINER_CMD} network create insura-net

    # Create persistent volume for SQLite database
    ${CONTAINER_CMD} volume exists claim_data 2>/dev/null || ${CONTAINER_CMD} volume create claim_data

    # Stop and remove existing containers
    ${CONTAINER_CMD} rm -f insura-backend insura-frontend 2>/dev/null || true

    # Build backend
    echo "--- Building Backend (s390x) ---"
    ${CONTAINER_CMD} build -t insura-backend:1.0.0 -f backend/Dockerfile .

    # Build frontend
    echo "--- Building Frontend (s390x) ---"
    ${CONTAINER_CMD} build -t insura-frontend:1.0.0 -f frontend/Dockerfile ./frontend

    # Run backend
    echo "--- Launching Backend Service ---"
    ${CONTAINER_CMD} run -d \
        --name insura-backend \
        --network-alias backend \
        --network-alias insura-backend \
        --network insura-net \
        --restart unless-stopped \
        -e APP_ENV=production \
        -e DATABASE_URL=sqlite:////app/data/claims.db \
        -e MODEL_ARTIFACT_PATH=backend/models/risk_model.joblib \
        -e MODEL_METADATA_PATH=backend/models/metadata.json \
        -e ALLOW_MOCK_MODEL=false \
        -e CORS_ORIGINS="*" \
        -v claim_data:/app/data:Z \
        insura-backend:1.0.0

    # Run frontend
    echo "--- Launching Frontend Service (Nginx) ---"
    ${CONTAINER_CMD} run -d \
        --name insura-frontend \
        --network-alias frontend \
        --network insura-net \
        --restart unless-stopped \
        -p 8080:80 \
        insura-frontend:1.0.0
fi

echo ""
echo "=========================================================="
echo " Verifying Service Readiness..."
echo "=========================================================="
for i in {1..30}; do
    if curl -s -f http://127.0.0.1:8080/api/health >/dev/null 2>&1 || curl -s -f http://127.0.0.1:8000/health >/dev/null 2>&1; then
        echo "[SUCCESS] Services are up and responding to health checks!"
        break
    fi
    echo -n "."
    sleep 2
done

echo ""
echo "=========================================================="
echo " Deployment Complete!"
echo "=========================================================="
echo "Frontend Dashboard: http://localhost:8080"
echo "API Documentation:  http://localhost:8080/docs"
echo "Health Endpoint:    http://localhost:8080/api/health"
echo "Model Info:         http://localhost:8080/api/model-info"
echo ""
echo "For remote access via SSH Port Forwarding from your local laptop:"
echo "  ssh -L 8080:127.0.0.1:8080 -i skysds.pem $(whoami)@<LINUXONE_HOST_IP>"
echo "=========================================================="
