/**
 * Development-Only Mock Fixtures
 * 
 * STRICT COMPLIANCE RULES:
 * 1. Mock mode is DISABLED BY DEFAULT for production and integrated deployment.
 * 2. Whenever mock data is served, the UI must show an unmistakable "DEMO DATA ACTIVE" banner.
 * 3. Never claim synthetic records are genuine production database entries.
 * 4. Separate fixture file to keep production API code clean.
 */

export const MOCK_STATS = {
  total_claims: 4,
  risk_category_counts: {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 1
  },
  review_status_counts: {
    PENDING_REVIEW: 1,
    UNDER_REVIEW: 1,
    CLEARED: 1,
    ESCALATED: 1
  },
  claims_awaiting_review: 2,
  cleared_claims: 1,
  escalated_claims: 1,
  average_risk_score: 50.4
};

export const MOCK_CLAIMS = [
  {
    claim_id: 'CLM-2026-00101',
    external_reference: 'POL-TX-90112',
    fraud_probability: 0.086,
    risk_score: 8.6,
    risk_category: 'LOW',
    model_version: '1.0.0',
    review_status: 'CLEARED',
    review_notes: 'Trivial damage verified by dashcam. Fast-track payout issued.',
    reviewed_by: 'adjuster_elena',
    reviewed_at: '2026-10-17T09:30:00Z',
    created_at: '2026-10-17T09:00:00Z',
    updated_at: '2026-10-17T09:30:00Z',
    features: {
      Make: 'Toyota',
      VehicleCategory: 'Sedan',
      VehiclePrice: '20000 to 29000',
      Age: 42,
      AgeOfPolicyHolder: '41 to 50',
      AgeOfVehicle: '4 years',
      DriverRating: 1,
      NumberOfCars: '1 vehicle',
      Deductible: 500,
      PolicyType: 'Sedan - Liability',
      BasePolicy: 'Liability',
      AgentType: 'External',
      Days_Policy_Accident: 'more than 30',
      Days_Policy_Claim: 'more than 30',
      Year: 2026,
      Month: 'Jan',
      WeekOfMonth: 3,
      DayOfWeek: 'Wednesday',
      AccidentArea: 'Urban',
      Fault: 'Policy Holder',
      MonthClaimed: 'Jan',
      WeekOfMonthClaimed: 3,
      DayOfWeekClaimed: 'Thursday',
      PoliceReportFiled: 'No',
      WitnessPresent: 'No',
      PastNumberOfClaims: 'none',
      NumberOfSuppliments: 'none',
      AddressChange_Claim: 'no change'
    }
  },
  {
    claim_id: 'CLM-2026-00102',
    external_reference: 'POL-OH-33419',
    fraud_probability: 0.555,
    risk_score: 55.5,
    risk_category: 'MEDIUM',
    model_version: '1.0.0',
    review_status: 'UNDER_REVIEW',
    review_notes: 'Awaiting repair shop quote confirmation.',
    reviewed_by: 'adjuster_marcus',
    reviewed_at: '2026-10-17T09:45:00Z',
    created_at: '2026-10-17T09:10:00Z',
    updated_at: '2026-10-17T09:45:00Z',
    features: {
      Make: 'Honda',
      VehicleCategory: 'Sedan',
      VehiclePrice: '30000 to 39000',
      Age: 26,
      AgeOfPolicyHolder: '26 to 30',
      AgeOfVehicle: '3 years',
      DriverRating: 2,
      NumberOfCars: '1 vehicle',
      Deductible: 400,
      PolicyType: 'Sedan - Collision',
      BasePolicy: 'Collision',
      AgentType: 'External',
      Days_Policy_Accident: 'more than 30',
      Days_Policy_Claim: 'more than 30',
      Year: 2026,
      Month: 'Jul',
      WeekOfMonth: 2,
      DayOfWeek: 'Friday',
      AccidentArea: 'Urban',
      Fault: 'Policy Holder',
      MonthClaimed: 'Jul',
      WeekOfMonthClaimed: 3,
      DayOfWeekClaimed: 'Monday',
      PoliceReportFiled: 'Yes',
      WitnessPresent: 'Yes',
      PastNumberOfClaims: '1',
      NumberOfSuppliments: '1 to 2',
      AddressChange_Claim: '1 year'
    }
  },
  {
    claim_id: 'CLM-2026-00103',
    external_reference: 'POL-FL-77801',
    fraud_probability: 0.756,
    risk_score: 75.6,
    risk_category: 'HIGH',
    model_version: '1.0.0',
    review_status: 'ESCALATED',
    review_notes: 'Referred to Special Investigation Unit (SIU) due to anomalous risk factors.',
    reviewed_by: 'siu_lead_davis',
    reviewed_at: '2026-10-17T10:15:00Z',
    created_at: '2026-10-17T09:20:00Z',
    updated_at: '2026-10-17T10:15:00Z',
    features: {
      Make: 'Accura',
      VehicleCategory: 'Sport',
      VehiclePrice: 'more than 69000',
      Age: 22,
      AgeOfPolicyHolder: '21 to 25',
      AgeOfVehicle: 'new',
      DriverRating: 4,
      NumberOfCars: '1 vehicle',
      Deductible: 400,
      PolicyType: 'Sport - All Perils',
      BasePolicy: 'All Perils',
      AgentType: 'External',
      Days_Policy_Accident: '8 to 15',
      Days_Policy_Claim: '8 to 15',
      Year: 2026,
      Month: 'Dec',
      WeekOfMonth: 5,
      DayOfWeek: 'Saturday',
      AccidentArea: 'Rural',
      Fault: 'Policy Holder',
      MonthClaimed: 'Dec',
      WeekOfMonthClaimed: 5,
      DayOfWeekClaimed: 'Monday',
      PoliceReportFiled: 'No',
      WitnessPresent: 'No',
      PastNumberOfClaims: '2 to 4',
      NumberOfSuppliments: 'more than 5',
      AddressChange_Claim: 'under 6 months'
    }
  },
  {
    claim_id: 'CLM-2026-00104',
    external_reference: 'POL-NY-55610',
    fraud_probability: 0.620,
    risk_score: 62.0,
    risk_category: 'MEDIUM',
    model_version: '1.0.0',
    review_status: 'PENDING_REVIEW',
    review_notes: null,
    reviewed_by: null,
    reviewed_at: null,
    created_at: '2026-10-17T09:25:00Z',
    updated_at: '2026-10-17T09:25:00Z',
    features: {
      Make: 'Toyota',
      VehicleCategory: 'Sedan',
      VehiclePrice: '20000 to 29000',
      Age: 35,
      AgeOfPolicyHolder: '31 to 35',
      AgeOfVehicle: '5 years',
      DriverRating: 2,
      NumberOfCars: '1 vehicle',
      Deductible: 400,
      PolicyType: 'Sedan - Liability',
      BasePolicy: 'Liability',
      AgentType: 'Internal',
      Days_Policy_Accident: 'more than 30',
      Days_Policy_Claim: 'more than 30',
      Year: 2026,
      Month: 'Feb',
      WeekOfMonth: 1,
      DayOfWeek: 'Tuesday',
      AccidentArea: 'Urban',
      Fault: 'Third Party',
      MonthClaimed: 'Feb',
      WeekOfMonthClaimed: 1,
      DayOfWeekClaimed: 'Wednesday',
      PoliceReportFiled: 'Yes',
      WitnessPresent: 'No',
      PastNumberOfClaims: 'none',
      NumberOfSuppliments: 'none',
      AddressChange_Claim: 'no change'
    }
  }
];

export const MOCK_MODEL_INFO = {
  model_name: 'RandomForest',
  model_version: '1.0.0',
  is_ready: true,
  is_real_artifact_loaded: true,
  mock_mode_active: false,
  expected_features: [
    'Month', 'WeekOfMonth', 'DayOfWeek', 'Make', 'AccidentArea', 
    'DayOfWeekClaimed', 'MonthClaimed', 'WeekOfMonthClaimed', 'Age', 
    'Fault', 'PolicyType', 'VehicleCategory', 'VehiclePrice', 'Deductible', 
    'DriverRating', 'Days_Policy_Accident', 'Days_Policy_Claim', 
    'PastNumberOfClaims', 'AgeOfVehicle', 'AgeOfPolicyHolder', 
    'PoliceReportFiled', 'WitnessPresent', 'AgentType', 'NumberOfSuppliments', 
    'AddressChange_Claim', 'NumberOfCars', 'Year', 'BasePolicy'
  ],
  risk_thresholds: {
    low_threshold: 0.427,
    high_threshold: 0.61
  }
};
