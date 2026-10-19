"""
Automated API tests for the Flask backend.

Test Suite:
1. GET '/health' returns 200 OK and feature count = 28.
2. POST '/predict' with 'backend/test_payload.json' returns 200 OK and contains 'prediction' and 'probabilities'.
3. POST '/predict' missing a required key returns 400 Bad Request.
4. POST '/predict' with invalid non-JSON data returns 400 Bad Request.
"""

import os
import json
import pytest
from backend.app import app


@pytest.fixture
def client():
    """Create Flask test client in testing mode."""
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


@pytest.fixture
def valid_payload():
    """Load valid test payload from backend/test_payload.json."""
    payload_path = os.path.join("backend", "test_payload.json")
    if not os.path.exists(payload_path):
        payload_path = os.path.join(os.path.dirname(__file__), "..", "test_payload.json")
    with open(payload_path, "r", encoding="utf-8") as f:
        return json.load(f)


def test_health_endpoint(client):
    """Test 1: GET '/health' returns 200 OK and feature count = 28."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.get_json()
    assert data is not None
    assert data.get("status") == "ok"
    assert data.get("feature_count") == 28
    assert data.get("task") == "classification"


def test_predict_success(client, valid_payload):
    """Test 2: POST '/predict' with 'backend/test_payload.json' returns 200 OK and contains 'prediction' and 'probabilities'."""
    response = client.post("/predict", json=valid_payload)
    assert response.status_code == 200
    data = response.get_json()
    assert data is not None
    assert "prediction" in data
    assert "probabilities" in data
    assert data["prediction"] in [0, 1]
    assert len(data["probabilities"]) == 2
    assert isinstance(data["probabilities"][0], float)
    assert isinstance(data["probabilities"][1], float)


def test_predict_missing_key(client, valid_payload):
    """Test 3: POST '/predict' missing a required key returns 400 Bad Request."""
    bad_payload = valid_payload.copy()
    bad_payload.pop("age", None)
    response = client.post("/predict", json=bad_payload)
    assert response.status_code == 400
    data = response.get_json()
    assert data is not None
    assert "error" in data


def test_predict_invalid_non_json(client):
    """Test 4: POST '/predict' with invalid non-JSON data returns 400 Bad Request."""
    response = client.post(
        "/predict",
        data="plain text instead of json",
        content_type="text/plain"
    )
    assert response.status_code == 400
    data = response.get_json()
    assert data is not None
    assert "error" in data
