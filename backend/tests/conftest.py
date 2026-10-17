"""
Pytest Fixtures and Test Configuration.

Configures an isolated SQLite in-memory database and provides FastAPI TestClient
with synthetic test payloads.
"""

import os
import sys
from pathlib import Path

# Add project root directory to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from typing import Generator
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

# Force testing configuration
os.environ["ENVIRONMENT"] = "testing"
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["ALLOW_MOCK_MODEL"] = "true"
os.environ["REQUIRE_AUTH"] = "false"

from backend.app.config import settings
from backend.app.db.database import Base, get_db
from backend.app.main import app
from ml.predict import load_model

# Test in-memory database engine
test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(autouse=True)
def setup_test_db() -> Generator[None, None, None]:
    """Create fresh database tables for each test and load test model."""
    Base.metadata.create_all(bind=test_engine)
    load_model()
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def db_session() -> Generator[Session, None, None]:
    """Provide isolated transactional test session."""
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client(db_session: Session) -> Generator[TestClient, None, None]:
    """Provide TestClient with database session overridden."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def sample_valid_features() -> dict:
    """Standard synthetic claim features representing a genuine low-risk claim."""
    return {
        "Month": "Dec",
        "WeekOfMonth": 5,
        "DayOfWeek": "Wednesday",
        "Make": "Honda",
        "AccidentArea": "Urban",
        "DayOfWeekClaimed": "Tuesday",
        "MonthClaimed": "Jan",
        "WeekOfMonthClaimed": 1,
        "Age": 42.0,
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
        "AgeOfPolicyHolder": "41 to 50",
        "PoliceReportFiled": "No",
        "WitnessPresent": "No",
        "AgentType": "External",
        "NumberOfSuppliments": "none",
        "AddressChange_Claim": "under 6 months",
        "NumberOfCars": "1 vehicle",
        "Year": 1994,
        "BasePolicy": "Liability",
    }


@pytest.fixture
def sample_high_risk_features() -> dict:
    """Synthetic claim with indicators for elevated risk."""
    return {
        "Month": "Jul",
        "WeekOfMonth": 1,
        "DayOfWeek": "Saturday",
        "Make": "Honda",
        "AccidentArea": "Urban",
        "DayOfWeekClaimed": "Tuesday",
        "MonthClaimed": "Sep",
        "WeekOfMonthClaimed": 4,
        "Age": 0.0,
        "Fault": "Policy Holder",
        "PolicyType": "Sedan - All Perils",
        "VehicleCategory": "Sedan",
        "VehiclePrice": "more than 69000",
        "Deductible": 400,
        "DriverRating": 1,
        "Days_Policy_Accident": "more than 30",
        "Days_Policy_Claim": "more than 30",
        "PastNumberOfClaims": "none",
        "AgeOfVehicle": "new",
        "AgeOfPolicyHolder": "16 to 17",
        "PoliceReportFiled": "No",
        "WitnessPresent": "No",
        "AgentType": "External",
        "NumberOfSuppliments": "none",
        "AddressChange_Claim": "no change",
        "NumberOfCars": "1 vehicle",
        "Year": 1994,
        "BasePolicy": "All Perils",
    }
