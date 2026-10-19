"""
Export Model Bundle for Calibrated Diabetes Risk Screener.

Fits a leakage-safe scikit-learn Pipeline on train_diabetes.csv:
- ColumnTransformer: StandardScaler for numerical features, OneHotEncoder for categorical features
- Classifier: RandomForestClassifier
Saves the bundle to backend/models/model_bundle.joblib with keys:
- 'pipeline': fitted Pipeline
- 'features': exact list of 28 raw input feature names
- 'task': 'classification'
- 'model_version': '1.0'
"""

import os
import joblib
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, f1_score


def export_bundle():
    train_path = os.path.join("data", "train_diabetes.csv")
    test_path = os.path.join("data", "test_diabetes.csv")
    models_dir = os.path.join("backend", "models")
    bundle_path = os.path.join(models_dir, "model_bundle.joblib")
    sample_inputs_path = os.path.join("data", "sample_inputs.csv")

    os.makedirs(models_dir, exist_ok=True)

    print(f"[*] Loading training data from: {train_path}")
    train_df = pd.read_csv(train_path)

    # Exclude target and leakage features
    target_col = "diagnosed_diabetes"
    leakage_cols = ["diabetes_risk_score", "diabetes_stage"]
    raw_features = [
        col for col in train_df.columns
        if col not in [target_col] + leakage_cols
    ]

    print(f"[*] Identified {len(raw_features)} raw input features:")
    print(f"    {raw_features}")

    categorical_features = [
        "gender",
        "ethnicity",
        "education_level",
        "income_level",
        "employment_status",
        "smoking_status"
    ]
    numerical_features = [col for col in raw_features if col not in categorical_features]

    print(f"[*] Preprocessing layout: {len(numerical_features)} numerical, {len(categorical_features)} categorical")

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), numerical_features),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_features)
        ],
        remainder="drop"
    )

    pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("classifier", RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1))
    ])

    X_train = train_df[raw_features]
    y_train = train_df[target_col]

    print(f"[*] Fitting pipeline on {len(X_train)} training records...")
    pipeline.fit(X_train, y_train)
    print("[+] Pipeline fitting complete.")

    # Validate against test set if available
    if os.path.exists(test_path):
        print(f"[*] Evaluating on test set: {test_path}")
        test_df = pd.read_csv(test_path)
        X_test = test_df[raw_features]
        y_test = test_df[target_col]
        y_pred = pipeline.predict(X_test)
        acc = accuracy_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        print(f"[+] Test Evaluation -> Accuracy: {acc * 100:.2f}%, F1-Score: {f1 * 100:.2f}%")

        # Ensure sample_inputs.csv is generated from test_diabetes.csv
        if not os.path.exists(sample_inputs_path):
            print(f"[*] Creating sample inputs at: {sample_inputs_path}")
            sample = test_df.iloc[[0]].drop(columns=leakage_cols)
            sample.to_csv(sample_inputs_path, index=False)
            print("[+] sample_inputs.csv created.")

    # Package model bundle
    bundle = {
        "pipeline": pipeline,
        "features": raw_features,
        "task": "classification",
        "model_version": "1.0"
    }

    print(f"[*] Saving serialized bundle to: {bundle_path}")
    joblib.dump(bundle, bundle_path)
    print(f"[+] Bundle saved successfully ({os.path.getsize(bundle_path):,} bytes).")

    return bundle


if __name__ == "__main__":
    export_bundle()
