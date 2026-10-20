# Calibrated Diabetes Risk Screener

A production-grade, full-stack clinical machine learning application designed to assess type-2 diabetes risk using calibrated probabilities from a 100,000-patient dataset.

[![Full-stack CI](https://github.com/hayat-ishfaq/diabetes-risk-screener/actions/workflows/ci.yml/badge.svg)](https://github.com/hayat-ishfaq/diabetes-risk-screener/actions/workflows/ci.yml)
[![Pages Deployment](https://github.com/hayat-ishfaq/diabetes-risk-screener/actions/workflows/pages.yml/badge.svg)](https://github.com/hayat-ishfaq/diabetes-risk-screener/actions/workflows/pages.yml)

---

## 📌 1. Project Title & Problem Statement

### Title
**Calibrated Diabetes Risk Screener — Clinical ML Pipeline & Full-Stack Deployment**

### Clinical Problem Statement
Diabetes mellitus represents a global chronic health crisis characterized by prolonged hyperglycaemia. Early identification of at-risk individuals enables preventive interventions, reducing long-term microvascular and macrovascular complications.

Traditional risk scoring models often rely on subjective self-reporting or uncalibrated risk approximations. This project develops an end-to-end, leakage-free clinical screening pipeline trained on a large-scale, heterogeneous cohort of **100,000 patient records** (`diagnosed_diabetes` ground truth). 

To ensure clinical integrity, the screener strictly accepts **28 raw clinical and biological biomarkers** while aggressively excluding downstream derivative target leaks (such as synthetic `diabetes_risk_score` and `diabetes_stage`).

---

## 🔬 2. Model Provenance & Performance

### Preprocessing & Feature Architecture
The pipeline utilizes Scikit-Learn's `ColumnTransformer` embedded within a unified `Pipeline` to prevent train-test data leakage:
- **Numerical Scaling (22 features)**: Standardized via `StandardScaler`.
- **Categorical Encoding (6 features)**: Transformed via `OneHotEncoder(handle_unknown='ignore', sparse_output=False)` across `gender`, `ethnicity`, `education_level`, `income_level`, `employment_status`, and `smoking_status`.
- **Predictive Estimator**: `RandomForestClassifier(n_estimators=100, random_state=42)`.

### Input Feature Domains (28 Raw Biomarkers)
1. **Demographics (3)**: `age`, `gender`, `ethnicity`
2. **Socioeconomic (3)**: `education_level`, `income_level`, `employment_status`
3. **Lifestyle (6)**: `smoking_status`, `alcohol_consumption_per_week`, `physical_activity_minutes_per_week`, `diet_score`, `sleep_hours_per_day`, `screen_time_hours_per_day`
4. **Medical History (3)**: `family_history_diabetes`, `hypertension_history`, `cardiovascular_history`
5. **Anthropometric & Vitals (5)**: `bmi`, `waist_to_hip_ratio`, `systolic_bp`, `diastolic_bp`, `heart_rate`
6. **Laboratory/Glycaemic (8)**: `cholesterol_total`, `hdl_cholesterol`, `ldl_cholesterol`, `triglycerides`, `glucose_fasting`, `glucose_postprandial`, `insulin_level`, `hba1c`

### Benchmark Evaluation (20,000 Held-Out Patients)
The model was evaluated against an 80/20 stratified split (`test_diabetes.csv`):

| Evaluation Metric | Baseline Logistic Regression | Primary Random Forest Pipeline | Absolute Improvement |
| :--- | :---: | :---: | :---: |
| **Accuracy** | 86.09% | **91.93%** (Benchmark: 91.98%) | **+5.84%** |
| **F1-Score** | 88.54% | **92.80%** (Benchmark: 92.84%) | **+4.26%** |
| **Precision** | 87.21% | **99.88%** | **+12.67%** |
| **Recall** | 89.92% | **86.65%** | -3.27% |
| **ROC-AUC** | 0.9124 | **0.9406** | **+0.0282** |

### McNemar's Statistical Significance Test
To determine whether the performance disparity between the linear baseline and the non-linear Random Forest ensemble was statistically significant rather than an artifact of random sampling, **McNemar's Test** (with Edwards' continuity correction) was conducted on the paired 20,000 test predictions:

- **Contingency Matrix**:
  - Both Models Correct ($n_{00}$): **16,838**
  - LR Correct / RF Incorrect ($n_{01}$): **380**
  - RF Correct / LR Incorrect ($n_{10}$): **1,548**
  - Both Models Incorrect ($n_{11}$): **1,234**
- **Test Statistic ($\chi^2$)**: **706.37** (Degrees of Freedom = 1)
- **$p$-value**: **$p < 0.0001$ ($p \approx 0.000$)**

**Conclusion**: The null hypothesis of marginal homogeneity is decisively rejected. The Random Forest model demonstrates statistically superior diagnostic discrimination across the biomarker space.

---

## 🏗️ 3. Architecture & Deployment Boundary

```
+-----------------------------------------------------------------------------------+
|                              DEPLOYMENT BOUNDARY                                  |
|                                                                                   |
|  [ LOCAL FULL-STACK ENVIRONMENT ]                  [ STATIC DEMO (PAGES) ]        |
|                                                                                   |
|  +------------------------+                        +---------------------------+  |
|  |     Angular UI         |                        |   Static Frontend Demo    |  |
|  | (http://localhost:4200)|                        | (GitHub Pages Deployed)   |  |
|  +-----------+------------+                        +-------------+-------------+  |
|              | Reverse Proxy (/api)                              |                |
|              v                                                   | (Client Only)  |
|  +------------------------+                                      |                |
|  |   Flask REST API       |<-------------------------------------+                |
|  | (http://127.0.0.1:5000)|  (Optional remote CORS endpoint)                      |
|  +-----------+------------+                                                       |
|              | joblib.load                                                        |
|              v                                                                    |
|  +------------------------+                                                       |
|  |  model_bundle.joblib   |                                                       |
|  +------------------------+                                                       |
+-----------------------------------------------------------------------------------+
```

### Deployment Separation
1. **Local Production / Inference Tier**:
   - **Backend**: Flask REST API (`backend/app.py`) listening on `http://127.0.0.1:5000`. Exposes `/health` (system diagnostics) and `/predict` (28-feature schema validation, calibrated probability scoring, clinical disclaimer).
   - **Interactive Frontend**: Angular standalone architecture running at `http://localhost:4200` with reverse proxy (`proxy.conf.json`) redirecting `/api/*` to the Flask backend.
2. **Static Demonstration Tier**:
   - **GitHub Pages**: Static exported web client deployed via `.github/workflows/pages.yml`. Serves client-side demonstration assets at `https://hayat-ishfaq.github.io/diabetes-risk-screener/`. When hosted without an accessible backend, the client transparently reports connection status while preserving UI and form profiling capabilities.

---

## ⚙️ 4. Prerequisites & Environment Setup

### System Prerequisites
- **Python**: 3.12+ (or 3.13+)
- **Node.js**: v22+ or v24+
- **npm**: v10+ or v11+
- **Git**: 2.40+

### Clone Repository
```bash
git clone https://github.com/hayat-ishfaq/diabetes-risk-screener.git
cd diabetes-risk-screener
```

### Python Virtual Environment Setup
```bash
# Create virtual environment
python -m venv .venv

# Activate on Windows (PowerShell):
.\.venv\Scripts\Activate.ps1

# Activate on Linux/macOS:
source .venv/bin/activate

# Install locked dependencies
pip install -r backend/requirements.txt
```

### Frontend Dependencies Setup
```bash
cd frontend
npm install
cd ..
```

---

## 💻 5. Local Execution Commands (Terminals 1, 2, and 3)

To run the complete full-stack application and verification suite locally, open three separate terminal windows:

### Terminal 1: Backend Flask REST API
```bash
# Windows
.\.venv\Scripts\Activate.ps1
python backend/app.py

# Linux/macOS
source .venv/bin/activate
python backend/app.py
```
> Server starts at `http://127.0.0.1:5000` with endpoints `GET /health` and `POST /predict`.

### Terminal 2: Frontend Angular Client
```bash
# Option A: Development server with proxy config
cd frontend
npm start

# Option B: Production build server (if Vite encounters hash paths)
.\.venv\Scripts\python frontend/serve_proxy.py
```
> Client runs at `http://localhost:4200` with reverse proxy routing `/api` requests to `http://127.0.0.1:5000`.

### Terminal 3: Automated Test & Verification Suite
```bash
# 1. Run all backend automated tests (unit, schema, and API tests)
python -m pytest -v backend/tests

# 2. Verify direct model pipeline inference
python backend/test_pipeline.py

# 3. Test API health endpoint via cURL
curl -s http://127.0.0.1:5000/health

# 4. Test API inference with sample payload via cURL
curl -s -X POST http://127.0.0.1:5000/predict -H "Content-Type: application/json" -d @backend/test_payload.json

# 5. Verify frontend production compilation
cd frontend && npm run build
```

---

## 📸 6. Screenshot Evidence Directory (`docs/`)

All screenshot artifacts are saved in the [`docs/`](file:///c:/Users/M.Hayat/OneDrive/Desktop/University/Semester#7/DevOps/Lab/Lab#1/diabetes_ml_project/diabetes_ml_project/docs) directory:

1. **Local UI Prediction Result**:  
   [`docs/screenshot_local_ui_prediction.png`](file:///c:/Users/M.Hayat/OneDrive/Desktop/University/Semester#7/DevOps/Lab/Lab#1/diabetes_ml_project/diabetes_ml_project/docs/screenshot_local_ui_prediction.png)  
   *Displays the active Angular UI with `Backend: Online (v1.0)` status, all 28 patient biomarkers loaded, and the calibrated prediction card showing 29% Diabetes Risk vs 71% Normal, risk badges, and the clinical disclaimer.*

2. **Passing GitHub Actions CI Run**:  
   [`docs/screenshot_github_actions_ci.png`](file:///c:/Users/M.Hayat/OneDrive/Desktop/University/Semester#7/DevOps/Lab/Lab#1/diabetes_ml_project/diabetes_ml_project/docs/screenshot_github_actions_ci.png) & [`docs/screenshot_github_actions_ci_run_detail.png`](file:///c:/Users/M.Hayat/OneDrive/Desktop/University/Semester#7/DevOps/Lab/Lab#1/diabetes_ml_project/diabetes_ml_project/docs/screenshot_github_actions_ci_run_detail.png)  
   *Displays passing GitHub Actions workflow runs (`Full-stack CI #2: Success`), validating both Backend CI (structure/pytest) and Frontend CI (Angular build artifact generation).*

3. **Live GitHub Pages Site**:  
   [`docs/screenshot_github_pages_site.png`](file:///c:/Users/M.Hayat/OneDrive/Desktop/University/Semester#7/DevOps/Lab/Lab#1/diabetes_ml_project/diabetes_ml_project/docs/screenshot_github_pages_site.png)  
   *Documents the live GitHub Pages endpoint (`https://hayat-ishfaq.github.io/diabetes-risk-screener/`), reflecting the deployment boundary between local Flask inference and static demonstration hosting.*

---

## ✅ 7. Verification Checklist: 15 Lab Stages

| Stage | Description | Key Deliverables & Artifacts | Status |
| :---: | :--- | :--- | :---: |
| **1** | **Developer Environment Setup** | Python, Node.js, npm, git tooling captured in `docs/environment.txt` | **VERIFIED** |
| **2** | **Project Inventory & Dataset Intake** | 100,000-record dataset recorded in `docs/inventory.txt` | **VERIFIED** |
| **3** | **Data Leakage Analysis** | Exclusion of synthetic leaks (`diabetes_risk_score`, `diabetes_stage`) | **VERIFIED** |
| **4** | **Data Partitioning** | 80/20 train/test split: `train_diabetes.csv` & `test_diabetes.csv` | **VERIFIED** |
| **5** | **Preprocessing Pipeline** | `ColumnTransformer` (StandardScaler + OneHotEncoder) in `export_bundle.py` | **VERIFIED** |
| **6** | **Model Training & Comparison** | Random Forest (100 estimators) vs Logistic Regression baseline | **VERIFIED** |
| **7** | **Statistical Significance Testing** | McNemar's Test ($\chi^2 = 706.37$, $p < 0.0001$) confirming superiority | **VERIFIED** |
| **8** | **Model Packaging & Serialization** | Single bundle: `backend/models/model_bundle.joblib` | **VERIFIED** |
| **9** | **Direct Local Inference Test** | Standalone verification script: `backend/test_pipeline.py` (PASS) | **VERIFIED** |
| **10** | **Backend REST API Implementation** | Flask API with `/health` and `/predict` in `backend/app.py` | **VERIFIED** |
| **11** | **Automated Backend Test Suite** | Pytest suite: `test_api.py` and `test_structure.py` (5/5 PASS) | **VERIFIED** |
| **12** | **Frontend UI Development** | Angular 22 standalone application with 28 reactive input controls | **VERIFIED** |
| **13** | **Full-Stack Execution & Proxy** | Reverse proxy integration (`proxy.conf.json` / `serve_proxy.py`) | **VERIFIED** |
| **14** | **CI/CD Pipeline Automation** | GitHub Actions workflow: `.github/workflows/ci.yml` (PASS) | **VERIFIED** |
| **15** | **Deployment & Documentation** | Pages workflow (`pages.yml`), `docs/` screenshots, updated `README.md` | **VERIFIED** |

---

## ⚖️ 8. Clinical Disclaimer

> **IMPORTANT MEDICAL NOTICE**:  
> This software is an experimental machine learning application developed solely for academic, research, and technical demonstration purposes. It does not provide clinical diagnoses, medical evaluations, or treatment recommendations. The output probabilities should never substitute for evaluation by a qualified medical professional. If you have concerns about diabetes or metabolic health, please consult a licensed healthcare practitioner.
