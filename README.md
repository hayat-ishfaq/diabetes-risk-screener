# Calibrated Diabetes Risk Screener

A production-grade, full-stack clinical machine learning application designed to assess diabetes risk using calibrated probabilities from a 100,000-patient dataset.

---

## 🌟 Key Features

- **Leakage-Safe ML Pipeline**: Scikit-Learn `Pipeline` with `ColumnTransformer` (StandardScaler for numerical features, OneHotEncoder for categorical features) and `RandomForestClassifier`.
- **28 Multi-Domain Raw Biomarkers**:
  - **Demographics (3)**: `age`, `gender`, `ethnicity`
  - **Socioeconomic (3)**: `education_level`, `income_level`, `employment_status`
  - **Lifestyle (6)**: `smoking_status`, `alcohol_consumption_per_week`, `physical_activity_minutes_per_week`, `diet_score`, `sleep_hours_per_day`, `screen_time_hours_per_day`
  - **Medical History (3)**: `family_history_diabetes`, `hypertension_history`, `cardiovascular_history`
  - **Anthropometric & Vitals (5)**: `bmi`, `waist_to_hip_ratio`, `systolic_bp`, `diastolic_bp`, `heart_rate`
  - **Laboratory/Glycaemic (8)**: `cholesterol_total`, `hdl_cholesterol`, `ldl_cholesterol`, `triglycerides`, `glucose_fasting`, `glucose_postprandial`, `insulin_level`, `hba1c`
- **High Predictive Accuracy**: Baseline Random Forest model achieves **91.98% Accuracy** and **92.84% F1-Score**.
- **Local Flask REST API**: Exposes `/health` and `/predict` endpoints with strict 28-feature schema validation and CORS support.
- **Modern Angular 22 Frontend**: Standalone component architecture with reactive form validation, risk categorization, dual probability gauges, and reverse proxy routing.
- **CI/CD Automation**: GitHub Actions workflow testing backend structure and validating frontend production builds.

---

## 📁 Repository Structure

```text
diabetes_ml_project/
├── .github/
│   └── workflows/
│       └── ci.yml
├── backend/
│   ├── models/
│   │   └── model_bundle.joblib
│   ├── tests/
│   │   ├── test_api.py
│   │   └── test_structure.py
│   ├── app.py
│   ├── export_bundle.py
│   ├── make_payload.py
│   ├── requirements.txt
│   ├── test_payload.json
│   └── test_pipeline.py
├── data/
│   ├── diabetes_dataset.csv
│   ├── sample_inputs.csv
│   ├── test_diabetes.csv
│   └── train_diabetes.csv
├── docs/
│   ├── environment.txt
│   └── inventory.txt
├── frontend/
│   ├── src/
│   ├── angular.json
│   ├── package.json
│   └── proxy.conf.json
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Python**: 3.12+
- **Node.js**: 22+ (or Node 24)
- **npm**: 10+

### 2. Backend Setup
```bash
# Activate virtual environment
python -m venv .venv
# Windows:
.\.venv\Scripts\Activate.ps1
# Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Start the Flask API
python backend/app.py
```
Backend runs at `http://127.0.0.1:5000`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```
Frontend runs at `http://localhost:4200` with reverse proxy routing to the backend.

### 4. Running Automated Tests
```bash
# Backend tests
pytest backend/tests

# Frontend build check
cd frontend && npm run build
```

---

## ⚖️ Disclaimer

This application provides estimated risk predictions for informational and demonstration purposes only. It does not constitute clinical diagnosis or medical advice. Please consult a licensed medical professional for personal healthcare assessments.
