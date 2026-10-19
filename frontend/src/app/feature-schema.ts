export interface FeatureOption {
  label: string;
  value: string | number;
}

export interface FeatureMetadata {
  name: string;
  label: string;
  kind: 'number' | 'select';
  group:
    | 'Demographics'
    | 'Socioeconomic'
    | 'Lifestyle'
    | 'Medical History'
    | 'Anthropometric & Vitals'
    | 'Laboratory/Glycaemic';
  required: boolean;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  options?: FeatureOption[];
  defaultValue: string | number;
  tooltip?: string;
}

export const FEATURE_GROUPS = [
  'Demographics',
  'Socioeconomic',
  'Lifestyle',
  'Medical History',
  'Anthropometric & Vitals',
  'Laboratory/Glycaemic'
] as const;

export const FEATURE_SCHEMA: FeatureMetadata[] = [
  // 1. Demographics (3)
  {
    name: 'age',
    label: 'Age',
    kind: 'number',
    group: 'Demographics',
    required: true,
    min: 18,
    max: 100,
    step: 1,
    unit: 'years',
    defaultValue: 50,
    tooltip: 'Patient age in completed years (18–100)'
  },
  {
    name: 'gender',
    label: 'Gender',
    kind: 'select',
    group: 'Demographics',
    required: true,
    options: [
      { label: 'Female', value: 'Female' },
      { label: 'Male', value: 'Male' },
      { label: 'Other', value: 'Other' }
    ],
    defaultValue: 'Female',
    tooltip: 'Self-reported gender identity'
  },
  {
    name: 'ethnicity',
    label: 'Ethnicity',
    kind: 'select',
    group: 'Demographics',
    required: true,
    options: [
      { label: 'White', value: 'White' },
      { label: 'Black', value: 'Black' },
      { label: 'Asian', value: 'Asian' },
      { label: 'Hispanic', value: 'Hispanic' },
      { label: 'Other', value: 'Other' }
    ],
    defaultValue: 'White',
    tooltip: 'Racial or ethnic background'
  },

  // 2. Socioeconomic (3)
  {
    name: 'education_level',
    label: 'Education Level',
    kind: 'select',
    group: 'Socioeconomic',
    required: true,
    options: [
      { label: 'No formal', value: 'No formal' },
      { label: 'Highschool', value: 'Highschool' },
      { label: 'Graduate', value: 'Graduate' },
      { label: 'Postgraduate', value: 'Postgraduate' }
    ],
    defaultValue: 'Graduate',
    tooltip: 'Highest educational milestone achieved'
  },
  {
    name: 'income_level',
    label: 'Income Level',
    kind: 'select',
    group: 'Socioeconomic',
    required: true,
    options: [
      { label: 'Low', value: 'Low' },
      { label: 'Lower-Middle', value: 'Lower-Middle' },
      { label: 'Middle', value: 'Middle' },
      { label: 'Upper-Middle', value: 'Upper-Middle' },
      { label: 'High', value: 'High' }
    ],
    defaultValue: 'Middle',
    tooltip: 'Annual household socioeconomic income bracket'
  },
  {
    name: 'employment_status',
    label: 'Employment Status',
    kind: 'select',
    group: 'Socioeconomic',
    required: true,
    options: [
      { label: 'Employed', value: 'Employed' },
      { label: 'Unemployed', value: 'Unemployed' },
      { label: 'Student', value: 'Student' },
      { label: 'Retired', value: 'Retired' }
    ],
    defaultValue: 'Employed',
    tooltip: 'Current occupational employment status'
  },

  // 3. Lifestyle (6)
  {
    name: 'smoking_status',
    label: 'Smoking Status',
    kind: 'select',
    group: 'Lifestyle',
    required: true,
    options: [
      { label: 'Never', value: 'Never' },
      { label: 'Former', value: 'Former' },
      { label: 'Current', value: 'Current' }
    ],
    defaultValue: 'Never',
    tooltip: 'Tobacco smoking history'
  },
  {
    name: 'alcohol_consumption_per_week',
    label: 'Alcohol Consumption',
    kind: 'number',
    group: 'Lifestyle',
    required: true,
    min: 0,
    max: 30,
    step: 1,
    unit: 'units/week',
    defaultValue: 2,
    tooltip: 'Average standard alcoholic drink units per week'
  },
  {
    name: 'physical_activity_minutes_per_week',
    label: 'Physical Activity',
    kind: 'number',
    group: 'Lifestyle',
    required: true,
    min: 0,
    max: 1000,
    step: 15,
    unit: 'min/week',
    defaultValue: 150,
    tooltip: 'Moderate to vigorous physical activity in minutes per week'
  },
  {
    name: 'diet_score',
    label: 'Diet Quality Score',
    kind: 'number',
    group: 'Lifestyle',
    required: true,
    min: 0,
    max: 10,
    step: 0.1,
    unit: 'points (0–10)',
    defaultValue: 6.0,
    tooltip: 'Composite nutritional score from 0 (poor) to 10 (ideal)'
  },
  {
    name: 'sleep_hours_per_day',
    label: 'Sleep Duration',
    kind: 'number',
    group: 'Lifestyle',
    required: true,
    min: 3,
    max: 14,
    step: 0.5,
    unit: 'hours/day',
    defaultValue: 7.0,
    tooltip: 'Average nocturnal sleep duration in hours'
  },
  {
    name: 'screen_time_hours_per_day',
    label: 'Daily Screen Time',
    kind: 'number',
    group: 'Lifestyle',
    required: true,
    min: 0,
    max: 20,
    step: 0.5,
    unit: 'hours/day',
    defaultValue: 4.0,
    tooltip: 'Sedentary screen hours per day (recreational & occupational)'
  },

  // 4. Medical History (3)
  {
    name: 'family_history_diabetes',
    label: 'Family History of Diabetes',
    kind: 'select',
    group: 'Medical History',
    required: true,
    options: [
      { label: 'No Family History', value: 0 },
      { label: 'Yes (First-degree relative)', value: 1 }
    ],
    defaultValue: 0,
    tooltip: 'Documented diagnosis in parents or siblings'
  },
  {
    name: 'hypertension_history',
    label: 'Hypertension History',
    kind: 'select',
    group: 'Medical History',
    required: true,
    options: [
      { label: 'No Prior Hypertension', value: 0 },
      { label: 'Diagnosed Hypertension', value: 1 }
    ],
    defaultValue: 0,
    tooltip: 'Prior clinical diagnosis or treatment for high blood pressure'
  },
  {
    name: 'cardiovascular_history',
    label: 'Cardiovascular History',
    kind: 'select',
    group: 'Medical History',
    required: true,
    options: [
      { label: 'No Cardiovascular Event', value: 0 },
      { label: 'Documented CVD History', value: 1 }
    ],
    defaultValue: 0,
    tooltip: 'Prior myocardial infarction, stroke, or CAD'
  },

  // 5. Anthropometric & Vitals (5)
  {
    name: 'bmi',
    label: 'Body Mass Index (BMI)',
    kind: 'number',
    group: 'Anthropometric & Vitals',
    required: true,
    min: 12.0,
    max: 60.0,
    step: 0.1,
    unit: 'kg/m²',
    defaultValue: 25.0,
    tooltip: 'Weight in kilograms divided by height in meters squared'
  },
  {
    name: 'waist_to_hip_ratio',
    label: 'Waist-to-Hip Ratio',
    kind: 'number',
    group: 'Anthropometric & Vitals',
    required: true,
    min: 0.5,
    max: 1.5,
    step: 0.01,
    unit: 'ratio',
    defaultValue: 0.85,
    tooltip: 'Circumferential waist-to-hip ratio marker of central adiposity'
  },
  {
    name: 'systolic_bp',
    label: 'Systolic Blood Pressure',
    kind: 'number',
    group: 'Anthropometric & Vitals',
    required: true,
    min: 70,
    max: 230,
    step: 1,
    unit: 'mmHg',
    defaultValue: 120,
    tooltip: 'Resting systolic arterial pressure'
  },
  {
    name: 'diastolic_bp',
    label: 'Diastolic Blood Pressure',
    kind: 'number',
    group: 'Anthropometric & Vitals',
    required: true,
    min: 40,
    max: 140,
    step: 1,
    unit: 'mmHg',
    defaultValue: 80,
    tooltip: 'Resting diastolic arterial pressure'
  },
  {
    name: 'heart_rate',
    label: 'Resting Heart Rate',
    kind: 'number',
    group: 'Anthropometric & Vitals',
    required: true,
    min: 40,
    max: 140,
    step: 1,
    unit: 'bpm',
    defaultValue: 72,
    tooltip: 'Resting cardiac pulse in beats per minute'
  },

  // 6. Laboratory/Glycaemic (8)
  {
    name: 'cholesterol_total',
    label: 'Total Cholesterol',
    kind: 'number',
    group: 'Laboratory/Glycaemic',
    required: true,
    min: 80,
    max: 400,
    step: 1,
    unit: 'mg/dL',
    defaultValue: 190,
    tooltip: 'Total serum cholesterol level'
  },
  {
    name: 'hdl_cholesterol',
    label: 'HDL Cholesterol',
    kind: 'number',
    group: 'Laboratory/Glycaemic',
    required: true,
    min: 15,
    max: 120,
    step: 1,
    unit: 'mg/dL',
    defaultValue: 55,
    tooltip: 'High-density lipoprotein cholesterol'
  },
  {
    name: 'ldl_cholesterol',
    label: 'LDL Cholesterol',
    kind: 'number',
    group: 'Laboratory/Glycaemic',
    required: true,
    min: 30,
    max: 300,
    step: 1,
    unit: 'mg/dL',
    defaultValue: 105,
    tooltip: 'Low-density lipoprotein cholesterol'
  },
  {
    name: 'triglycerides',
    label: 'Triglycerides',
    kind: 'number',
    group: 'Laboratory/Glycaemic',
    required: true,
    min: 30,
    max: 500,
    step: 1,
    unit: 'mg/dL',
    defaultValue: 130,
    tooltip: 'Serum triglyceride concentration'
  },
  {
    name: 'glucose_fasting',
    label: 'Fasting Blood Glucose',
    kind: 'number',
    group: 'Laboratory/Glycaemic',
    required: true,
    min: 50,
    max: 300,
    step: 1,
    unit: 'mg/dL',
    defaultValue: 95,
    tooltip: 'Plasma glucose level after an 8-hour fast'
  },
  {
    name: 'glucose_postprandial',
    label: 'Postprandial Glucose',
    kind: 'number',
    group: 'Laboratory/Glycaemic',
    required: true,
    min: 60,
    max: 400,
    step: 1,
    unit: 'mg/dL',
    defaultValue: 130,
    tooltip: 'Plasma glucose measured 2 hours following a glucose load / meal'
  },
  {
    name: 'insulin_level',
    label: 'Fasting Insulin',
    kind: 'number',
    group: 'Laboratory/Glycaemic',
    required: true,
    min: 1.0,
    max: 50.0,
    step: 0.1,
    unit: 'μU/mL',
    defaultValue: 8.5,
    tooltip: 'Serum insulin concentration'
  },
  {
    name: 'hba1c',
    label: 'Glycated Hemoglobin (HbA1c)',
    kind: 'number',
    group: 'Laboratory/Glycaemic',
    required: true,
    min: 3.5,
    max: 14.0,
    step: 0.1,
    unit: '%',
    defaultValue: 5.6,
    tooltip: 'Percentage of glycated hemoglobin reflecting 3-month glycaemia'
  }
];

export const SAMPLE_PATIENT_PAYLOAD: Record<string, string | number> = {
  age: 81,
  gender: 'Male',
  ethnicity: 'Black',
  education_level: 'Graduate',
  income_level: 'Low',
  employment_status: 'Retired',
  smoking_status: 'Never',
  alcohol_consumption_per_week: 0,
  physical_activity_minutes_per_week: 298,
  diet_score: 4.0,
  sleep_hours_per_day: 7.4,
  screen_time_hours_per_day: 2.2,
  family_history_diabetes: 0,
  hypertension_history: 1,
  cardiovascular_history: 0,
  bmi: 28.1,
  waist_to_hip_ratio: 0.94,
  systolic_bp: 138,
  diastolic_bp: 79,
  heart_rate: 65,
  cholesterol_total: 189,
  hdl_cholesterol: 50,
  ldl_cholesterol: 98,
  triglycerides: 145,
  glucose_fasting: 111,
  glucose_postprandial: 136,
  insulin_level: 7.89,
  hba1c: 6.01
};
