"""
Flask REST API for Calibrated Diabetes Risk Screener.

Endpoints:
- GET /health: Health check reporting status, feature count (28), and task
- POST /predict: Accepts JSON payload with 28 features, validates schema, and returns
                 risk prediction, class probabilities, task, and medical disclaimer.
"""

import os
import joblib
import pandas as pd
from flask import Flask, request, jsonify

app = Flask(__name__)

# Load model bundle at startup
bundle_path = os.path.join(os.path.dirname(__file__), "models", "model_bundle.joblib")
if not os.path.exists(bundle_path):
    # Fallback path relative to root
    bundle_path = os.path.join("backend", "models", "model_bundle.joblib")

print(f"[*] Initializing Flask API; loading model bundle from: {bundle_path}")
bundle = joblib.load(bundle_path)

pipeline = bundle["pipeline"]
features = bundle["features"]
task = bundle.get("task", "classification")
model_version = bundle.get("model_version", "1.0")

print(f"[+] Model bundle loaded successfully ({len(features)} features, task='{task}', version='{model_version}')")


@app.after_request
def add_cors_headers(response):
    """Enable Cross-Origin Resource Sharing (CORS) for web clients."""
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response


@app.route("/", methods=["GET"])
def root():
    return jsonify({
        "service": "Calibrated Diabetes Risk Screener API",
        "health_endpoint": "/health",
        "predict_endpoint": "/predict"
    }), 200


@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint returning status, feature count, and task."""
    return jsonify({
        "status": "ok",
        "feature_count": len(features),
        "task": task,
        "model_version": model_version
    }), 200


@app.route("/predict", methods=["OPTIONS"])
def predict_options():
    """Handle CORS preflight requests."""
    return "", 204


@app.route("/predict", methods=["POST"])
def predict():
    """Predict diabetes risk from 28 input features."""
    if not request.is_json:
        return jsonify({"error": "Request body must be valid JSON"}), 400

    data = request.get_json(silent=True)
    if data is None or not isinstance(data, dict):
        return jsonify({"error": "JSON payload must be a key-value object containing the 28 required features"}), 400

    # Schema Validation: check for missing and unexpected extra features
    missing_features = [f for f in features if f not in data]
    extra_features = [k for k in data.keys() if k not in features]

    if missing_features or extra_features:
        details = {}
        if missing_features:
            details["missing_features"] = missing_features
        if extra_features:
            details["extra_features"] = extra_features
        return jsonify({
            "error": "Payload validation failed",
            "details": details
        }), 400

    try:
        # Construct 1-row DataFrame aligned strictly to expected feature order
        input_df = pd.DataFrame([data])[features]

        # Execute model pipeline
        prediction = int(pipeline.predict(input_df)[0])
        probabilities = [float(p) for p in pipeline.predict_proba(input_df)[0]]

        response_payload = {
            "prediction": prediction,
            "probabilities": probabilities,
            "task": task,
            "disclaimer": (
                "This tool provides an estimated diabetes risk for informational "
                "purposes only and does not constitute medical advice, diagnosis, "
                "or treatment. Please consult a qualified healthcare professional."
            )
        }
        return jsonify(response_payload), 200

    except Exception as e:
        return jsonify({"error": f"Inference execution failed: {str(e)}"}), 500


if __name__ == "__main__":
    print("[*] Starting Flask server on http://127.0.0.1:5000 ...")
    app.run(host="127.0.0.1", port=5000, debug=False)
