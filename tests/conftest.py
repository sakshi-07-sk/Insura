"""Pytest fixtures and synthetic dataset generators for automated unit testing.

Enables fast, self-contained testing on x86 and LinuxONE environments without
requiring external dataset downloads.
"""

from typing import Dict, Any
import numpy as np
import pandas as pd
import pytest


@pytest.fixture
def synthetic_claims_df() -> pd.DataFrame:
    """Generates a reproducible synthetic dataframe matching the insurance claims schema."""
    np.random.seed(42)
    n = 200

    data = {
        "Month": np.random.choice(["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], size=n),
        "WeekOfMonth": np.random.randint(1, 6, size=n),
        "DayOfWeek": np.random.choice(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], size=n),
        "Make": np.random.choice(["Honda", "Toyota", "Ford", "Mazda", "Chevrolet"], size=n),
        "AccidentArea": np.random.choice(["Urban", "Rural"], size=n),
        "DayOfWeekClaimed": np.random.choice(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], size=n),
        "MonthClaimed": np.random.choice(["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], size=n),
        "WeekOfMonthClaimed": np.random.randint(1, 6, size=n),
        "Sex": np.random.choice(["Female", "Male"], size=n),
        "MaritalStatus": np.random.choice(["Single", "Married", "Divorced"], size=n),
        "Age": np.random.randint(18, 75, size=n),
        "Fault": np.random.choice(["Policy Holder", "Third Party"], size=n),
        "PolicyType": np.random.choice(["Sedan - Liability", "Sedan - Collision", "Sport - Collision"], size=n),
        "VehicleCategory": np.random.choice(["Sedan", "Sport", "Utility"], size=n),
        "VehiclePrice": np.random.choice(["20000 to 29000", "30000 to 39000", "more than 69000"], size=n),
        "PolicyNumber": np.arange(1001, 1001 + n),
        "RepNumber": np.random.randint(1, 17, size=n),
        "Deductible": np.random.choice([300, 400, 500, 700], size=n),
        "DriverRating": np.random.choice([1, 2, 3, 4], size=n),
        "Days_Policy_Accident": np.random.choice(["more than 30", "15 to 30", "none"], size=n),
        "Days_Policy_Claim": np.random.choice(["more than 30", "8 to 15", "15 to 30"], size=n),
        "PastNumberOfClaims": np.random.choice(["none", "1", "2 to 4", "more than 4"], size=n),
        "AgeOfVehicle": np.random.choice(["3 years", "5 years", "7 years", "more than 7"], size=n),
        "AgeOfPolicyHolder": np.random.choice(["21 to 25", "26 to 30", "31 to 35", "41 to 50"], size=n),
        "PoliceReportFiled": np.random.choice(["No", "Yes"], size=n),
        "WitnessPresent": np.random.choice(["No", "Yes"], size=n),
        "AgentType": np.random.choice(["External", "Internal"], size=n),
        "NumberOfSuppliments": np.random.choice(["none", "1 to 2", "more than 5"], size=n),
        "AddressChange_Claim": np.random.choice(["no change", "1 year", "under 6 months"], size=n),
        "NumberOfCars": np.random.choice(["1 vehicle", "2 vehicles", "3 to 4"], size=n),
        "Year": np.random.choice([1994, 1995, 1996], size=n),
        "BasePolicy": np.random.choice(["Liability", "Collision", "All Perils"], size=n),
        # 10% fraud rate
        "FraudFound_P": np.random.choice([0, 1], p=[0.90, 0.10], size=n),
    }

    # Inject domain anomalies for testing cleaning logic
    data["Age"][0] = 0
    data["MonthClaimed"][1] = "0"
    data["DayOfWeekClaimed"][1] = "0"

    return pd.DataFrame(data)


@pytest.fixture
def sample_valid_claim() -> Dict[str, Any]:
    """Provides a valid claim payload matching the model feature schema."""
    return {
        "Month": "Jan",
        "WeekOfMonth": 3,
        "DayOfWeek": "Monday",
        "Make": "Honda",
        "AccidentArea": "Urban",
        "DayOfWeekClaimed": "Tuesday",
        "MonthClaimed": "Jan",
        "WeekOfMonthClaimed": 4,
        "Age": 34,
        "Fault": "Policy Holder",
        "PolicyType": "Sedan - Collision",
        "VehicleCategory": "Sedan",
        "VehiclePrice": "20000 to 29000",
        "Deductible": 400,
        "DriverRating": 2,
        "Days_Policy_Accident": "more than 30",
        "Days_Policy_Claim": "more than 30",
        "PastNumberOfClaims": "none",
        "AgeOfVehicle": "5 years",
        "AgeOfPolicyHolder": "31 to 35",
        "PoliceReportFiled": "No",
        "WitnessPresent": "No",
        "AgentType": "External",
        "NumberOfSuppliments": "none",
        "AddressChange_Claim": "no change",
        "NumberOfCars": "1 vehicle",
        "Year": 1995,
        "BasePolicy": "Collision",
    }
