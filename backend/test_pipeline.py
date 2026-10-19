"""
Verify direct local model inference using the trained pipeline bundle.

Loads backend/models/model_bundle.joblib and backend/test_payload.json,
reconstructs a 1-row pandas DataFrame using the saved feature order,
executes predict() and predict_proba(), and validates the output.
"""

import os
import json
import joblib
import pandas as pd


def test_pipeline():
    bundle_path = os.path.join("backend", "models", "model_bundle.joblib")
    payload_path = os.path.join("backend", "test_payload.json")

    print(f"[*] Loading model bundle from: {bundle_path}")
    assert os.path.exists(bundle_path), f"Bundle file missing: {bundle_path}"
    bundle = joblib.load(bundle_path)

    pipeline = bundle["pipeline"]
    features = bundle["features"]
    task = bundle.get("task", "classification")
    version = bundle.get("model_version", "1.0")

    print(f"[+] Loaded bundle metadata -> Task: {task}, Version: {version}, Features: {len(features)}")

    print(f"[*] Loading test payload from: {payload_path}")
    assert os.path.exists(payload_path), f"Payload file missing: {payload_path}"
    with open(payload_path, "r", encoding="utf-8") as f:
        payload = json.load(f)

    assert len(payload) == 28, f"Expected 28 payload keys, found {len(payload)}"

    # Convert payload to a 1-row pandas DataFrame using saved feature order
    df = pd.DataFrame([payload])[features]
    print(f"[+] Reconstructed 1-row DataFrame with shape: {df.shape}")

    # Direct model inference
    prediction = pipeline.predict(df)
    probabilities = pipeline.predict_proba(df)

    prob_negative = float(probabilities[0][0])
    prob_positive = float(probabilities[0][1])

    print("\n--- INFERENCE RESULTS ---")
    print(f"Binary Prediction (0=No Diabetes, 1=Diabetes): {int(prediction[0])}")
    print(f"Class Probabilities -> No Diabetes (0): {prob_negative:.4f} ({prob_negative * 100:.2f}%)")
    print(f"                    -> Diabetes (1):    {prob_positive:.4f} ({prob_positive * 100:.2f}%)")
    print("-------------------------\n")

    # Sanity checks
    assert len(prediction) == 1, "Expected single prediction output"
    assert prediction[0] in [0, 1], f"Invalid binary class: {prediction[0]}"
    assert 0.0 <= prob_negative <= 1.0, f"Invalid probability: {prob_negative}"
    assert 0.0 <= prob_positive <= 1.0, f"Invalid probability: {prob_positive}"
    assert abs((prob_negative + prob_positive) - 1.0) < 1e-5, "Probabilities do not sum to 1.0"

    print("PASS: local inference")


if __name__ == "__main__":
    test_pipeline()
