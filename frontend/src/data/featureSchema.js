/**
 * Official ML Feature Schema Definition
 * Synchronized directly with Member 1's trained model metadata (backend/models/metadata.json)
 * and Member 2's FastAPI Pydantic schema (backend/app/schemas.py:ClaimModelFeatures).
 * 
 * 28 Total Features:
 * - 6 Numeric Features
 * - 22 Categorical Features
 * 
 * Protected attributes excluded for anti-bias compliance:
 * - Sex, MaritalStatus, PolicyNumber, RepNumber
 */

export const FEATURE_GROUPS = [
  {
    id: 'vehicle_policyholder',
    title: '1. Vehicle & Policyholder Profile',
    description: 'Driver rating, vehicle valuation tier, and policyholder demographic band',
    features: [
      'Make',
      'VehicleCategory',
      'VehiclePrice',
      'Age',
      'AgeOfPolicyHolder',
      'AgeOfVehicle',
      'DriverRating',
      'NumberOfCars',
      'Deductible'
    ]
  },
  {
    id: 'policy_coverage',
    title: '2. Policy & Channel Information',
    description: 'Coverage tier, sales agent channel, and tenure indicators',
    features: [
      'PolicyType',
      'BasePolicy',
      'AgentType',
      'Days_Policy_Accident',
      'Days_Policy_Claim'
    ]
  },
  {
    id: 'incident_circumstances',
    title: '3. Incident Circumstances',
    description: 'Time, location, fault determination, and environmental factors',
    features: [
      'Year',
      'Month',
      'WeekOfMonth',
      'DayOfWeek',
      'AccidentArea',
      'Fault'
    ]
  },
  {
    id: 'reporting_history',
    title: '4. Claim Filing & Prior Claim History',
    description: 'Filing timeline, police documentation, witness testimony, and prior frequency',
    features: [
      'MonthClaimed',
      'WeekOfMonthClaimed',
      'DayOfWeekClaimed',
      'PoliceReportFiled',
      'WitnessPresent',
      'PastNumberOfClaims',
      'NumberOfSuppliments',
      'AddressChange_Claim'
    ]
  }
];

export const FEATURE_DEFINITIONS = {
  // Numeric Features
  Age: {
    label: 'Driver Age',
    type: 'number',
    required: true,
    min: 16,
    max: 120,
    step: 1,
    unit: 'years',
    defaultValue: 35,
    description: 'Age of driver involved in accident.'
  },
  Deductible: {
    label: 'Policy Deductible ($)',
    type: 'select',
    required: true,
    options: [300, 400, 500, 700],
    defaultValue: 400,
    description: 'Insurance policy deductible amount in USD.'
  },
  DriverRating: {
    label: 'Driver Safety Rating',
    type: 'select',
    required: true,
    options: [1, 2, 3, 4],
    defaultValue: 1,
    description: 'Assigned driver safety grade (1 = Lowest risk/Standard, 4 = High incident tier).'
  },
  WeekOfMonth: {
    label: 'Week of Month (Incident)',
    type: 'number',
    required: true,
    min: 1,
    max: 5,
    step: 1,
    defaultValue: 3,
    description: 'Calendar week of the month when the accident occurred (1-5).'
  },
  WeekOfMonthClaimed: {
    label: 'Week of Month (Claimed)',
    type: 'number',
    required: true,
    min: 1,
    max: 5,
    step: 1,
    defaultValue: 3,
    description: 'Calendar week of month when claim was filed (1-5).'
  },
  Year: {
    label: 'Incident Year',
    type: 'number',
    required: true,
    min: 1990,
    max: 2030,
    step: 1,
    defaultValue: 2026,
    description: 'Calendar year in which incident took place.'
  },

  // Categorical Features
  Month: {
    label: 'Incident Month',
    type: 'select',
    required: true,
    options: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    defaultValue: 'Oct',
    description: 'Month when accident occurred.'
  },
  DayOfWeek: {
    label: 'Incident Day of Week',
    type: 'select',
    required: true,
    options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    defaultValue: 'Wednesday',
    description: 'Day of week when accident occurred.'
  },
  Make: {
    label: 'Vehicle Make',
    type: 'select',
    required: true,
    options: [
      'Honda', 'Toyota', 'Ford', 'Mazda', 'Chevrolet', 'Pontiac', 
      'Accura', 'Dodge', 'Mercury', 'Nissan', 'VW', 'Saturn', 
      'Ferrari', 'BMW', 'Jaguar', 'Porche', 'Mercedes'
    ],
    defaultValue: 'Toyota',
    description: 'Manufacturer of the insured vehicle.'
  },
  AccidentArea: {
    label: 'Accident Area',
    type: 'select',
    required: true,
    options: ['Urban', 'Rural'],
    defaultValue: 'Urban',
    description: 'Location environment where incident happened.'
  },
  DayOfWeekClaimed: {
    label: 'Day of Week Claimed',
    type: 'select',
    required: true,
    options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    defaultValue: 'Thursday',
    description: 'Day of week when claim report was filed.'
  },
  MonthClaimed: {
    label: 'Month Claimed',
    type: 'select',
    required: true,
    options: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    defaultValue: 'Oct',
    description: 'Calendar month in which claim report was filed.'
  },
  Fault: {
    label: 'Accident Fault',
    type: 'select',
    required: true,
    options: ['Policy Holder', 'Third Party'],
    defaultValue: 'Policy Holder',
    description: 'Party determined to be at fault for collision.'
  },
  PolicyType: {
    label: 'Policy Coverage Descriptor',
    type: 'select',
    required: true,
    options: [
      'Sport - Liability', 'Sport - Collision', 'Sport - All Perils',
      'Sedan - Liability', 'Sedan - Collision', 'Sedan - All Perils',
      'Utility - Liability', 'Utility - Collision', 'Utility - All Perils'
    ],
    defaultValue: 'Sedan - Liability',
    description: 'Full insurance policy type classification.'
  },
  VehicleCategory: {
    label: 'Vehicle Category',
    type: 'select',
    required: true,
    options: ['Sport', 'Sedan', 'Utility'],
    defaultValue: 'Sedan',
    description: 'Category class of insured vehicle.'
  },
  VehiclePrice: {
    label: 'Vehicle Price Tier',
    type: 'select',
    required: true,
    options: [
      'less than 20000',
      '20000 to 29000',
      '30000 to 39000',
      '40000 to 59000',
      '60000 to 69000',
      'more than 69000'
    ],
    defaultValue: '20000 to 29000',
    description: 'Market value valuation band for the vehicle.'
  },
  Days_Policy_Accident: {
    label: 'Policy Active Days Before Accident',
    type: 'select',
    required: true,
    options: ['none', '1 to 7', '8 to 15', '15 to 30', 'more than 30'],
    defaultValue: 'more than 30',
    description: 'Elapsed duration between policy inception and the incident.'
  },
  Days_Policy_Claim: {
    label: 'Days Between Inception and Claim',
    type: 'select',
    required: true,
    options: ['8 to 15', '15 to 30', 'more than 30'],
    defaultValue: 'more than 30',
    description: 'Elapsed duration between policy inception and claim filing.'
  },
  PastNumberOfClaims: {
    label: 'Past Number of Claims',
    type: 'select',
    required: true,
    options: ['none', '1', '2 to 4', 'more than 4'],
    defaultValue: 'none',
    description: 'Prior claim history count for this policyholder.'
  },
  AgeOfVehicle: {
    label: 'Age of Vehicle',
    type: 'select',
    required: true,
    options: ['new', '2 years', '3 years', '4 years', '5 years', '6 years', '7 years', 'more than 7'],
    defaultValue: '3 years',
    description: 'Vehicle age at the time of incident.'
  },
  AgeOfPolicyHolder: {
    label: 'Age Bracket of Policyholder',
    type: 'select',
    required: true,
    options: [
      '16 to 17', '18 to 20', '21 to 25', '26 to 30',
      '31 to 35', '36 to 40', '41 to 50', '51 to 65', 'over 65'
    ],
    defaultValue: '31 to 35',
    description: 'Age demographic bracket of primary policyholder.'
  },
  PoliceReportFiled: {
    label: 'Official Police Report Filed',
    type: 'select',
    required: true,
    options: ['Yes', 'No'],
    defaultValue: 'No',
    description: 'Whether a formal police accident report was documented.'
  },
  WitnessPresent: {
    label: 'Witness Present',
    type: 'select',
    required: true,
    options: ['Yes', 'No'],
    defaultValue: 'No',
    description: 'Whether independent witnesses were present at the scene.'
  },
  AgentType: {
    label: 'Issuing Agent Channel',
    type: 'select',
    required: true,
    options: ['External', 'Internal'],
    defaultValue: 'External',
    description: 'Distribution channel of the insurance agent who originated the policy.'
  },
  NumberOfSuppliments: {
    label: 'Number of Supplements',
    type: 'select',
    required: true,
    options: ['none', '1 to 2', '3 to 5', 'more than 5'],
    defaultValue: 'none',
    description: 'Additional supplemental repair or injury claims filed for this incident.'
  },
  AddressChange_Claim: {
    label: 'Address Change Before Claim',
    type: 'select',
    required: true,
    options: ['no change', 'under 6 months', '1 year', '2 to 3 years', '4 to 8 years'],
    defaultValue: 'no change',
    description: 'Time elapsed since policyholder last updated residential address.'
  },
  NumberOfCars: {
    label: 'Number of Cars on Policy',
    type: 'select',
    required: true,
    options: ['1 vehicle', '2 vehicles', '3 to 4', '5 to 8', 'more than 8'],
    defaultValue: '1 vehicle',
    description: 'Total vehicles registered under this insurance policy.'
  },
  BasePolicy: {
    label: 'Base Policy Type',
    type: 'select',
    required: true,
    options: ['Liability', 'Collision', 'All Perils'],
    defaultValue: 'Liability',
    description: 'Underlying core insurance coverage type.'
  }
};

export const EXCLUDED_ETHICAL_FIELDS = [
  { field: 'Sex', reason: 'Excluded by Responsible AI policy to prevent gender discrimination in automated triage.' },
  { field: 'MaritalStatus', reason: 'Excluded to uphold non-bias compliance under Fair Insurance Lending & AI Governance.' },
  { field: 'PolicyNumber', reason: 'Excluded 100% unique identifier to prevent model overfitting / memorization.' },
  { field: 'RepNumber', reason: 'Internal adjuster representative code removed to prevent assignment bias.' }
];

export function getDefaultFormFeatures() {
  const defaults = {};
  for (const [key, meta] of Object.entries(FEATURE_DEFINITIONS)) {
    defaults[key] = meta.defaultValue;
  }
  return defaults;
}
