# ==============================================================================
# Multi-Architecture Dockerfile for IBM LinuxONE (s390x) & x86_64
# Insurance Claim Risk Scoring Backend - IBM Z Datathon 2026
# ==============================================================================

FROM python:3.11-slim as runtime

# Prevent Python from writing .pyc files and enable unbuffered output
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    PORT=8000

# Install minimal OS dependencies for network health checks and building on s390x
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    gcc \
    g++ \
    build-essential \
    python3-dev \
    gfortran \
    libopenblas-dev \
    liblapack-dev \
    pkg-config \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Create dedicated non-root application user
RUN groupadd -r appuser && useradd -r -g appuser -d /app -s /sbin/nologin appuser

WORKDIR /app

# Install Python dependencies first for caching
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r /app/backend/requirements.txt

# Copy application code, ML inference module, and trained model artifacts
COPY backend/app /app/backend/app
COPY backend/models /app/backend/models
COPY ml /app/ml

# Create data directory for SQLite database persistence and set permissions
RUN mkdir -p /app/data /app/ml/artifacts && \
    chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port (binds to 0.0.0.0)
EXPOSE 8000

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Start Uvicorn ASGI server
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
