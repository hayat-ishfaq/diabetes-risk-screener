"""
Generate a test JSON payload for model inference.

Extracts the 28 raw feature values from data/sample_inputs.csv
using the feature order defined in backend/models/model_bundle.joblib,
handles any NaNs, and saves the output to backend/test_payload.json.
"""

import os
import json
import joblib
import pandas as pd


def make_payload():
    bundle_path = os.path.join("backend", "models", "model_bundle.joblib")
    sample_path = os.path.join("data", "sample_inputs.csv")
    payload_path = os.path.join("backend", "test_payload.json")

    print(f"[*] Loading model bundle from: {bundle_path}")
    bundle = joblib.load(bundle_path)
    features = bundle["features"]
    print(f"[*] Required features ({len(features)}): {features}")

    print(f"[*] Reading sample input from: {sample_path}")
    sample_df = pd.read_csv(sample_path)
    row = sample_df.iloc[0]

    payload = {}
    for feature in features:
        if feature in row:
            val = row[feature]
            if pd.isna(val):
                payload[feature] = None
            elif hasattr(val, "item"):
                payload[feature] = val.item()
            else:
                payload[feature] = val
        else:
            payload[feature] = None

    print(f"[*] Extracted payload with {len(payload)} keys.")
    assert len(payload) == 28, f"Expected 28 keys, got {len(payload)}"

    with open(payload_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)

    print(f"[+] Successfully wrote payload to: {payload_path}")
    return payload


if __name__ == "__main__":
    make_payload()
