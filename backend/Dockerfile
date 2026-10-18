# ==============================================================================
# Multi-Architecture Dockerfile for IBM LinuxONE (s390x) & x86_64
# Insurance Claim Risk Scoring Backend - IBM Z Datathon 2026
# Uses Ubuntu 24.04 LTS with native s390x Python 3.12 precompiled ML packages
# ==============================================================================

FROM ubuntu:24.04 as runtime

# Prevent interactive prompts and Python byte-compilation
ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    PORT=8000

# Install precompiled s390x binary packages directly from Ubuntu repositories
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    python3 \
    python3-pip \
    python3-numpy \
    python3-scipy \
    python3-pandas \
    python3-sklearn \
    python3-joblib \
    python3-fastapi \
    python3-uvicorn \
    python3-pydantic \
    python3-sqlalchemy \
    python3-dotenv \
    python3-matplotlib \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install pydantic-settings and test dependencies with ignore-installed
RUN pip install --no-cache-dir --break-system-packages --ignore-installed pydantic-settings httpx pytest

# Create dedicated non-root application user
RUN useradd -r -d /app -s /sbin/nologin appuser

WORKDIR /app

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

# Start Uvicorn ASGI server via python3 -m uvicorn
CMD ["python3", "-m", "uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
