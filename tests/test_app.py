import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "Chess Club" in data

def test_signup_and_unregister():
    # Use a unique email to avoid conflicts
    test_email = "pytestuser@mergington.edu"
    activity = "Chess Club"

    # Unregister if already present (ignore errors)
    client.post(f"/activities/{activity}/unregister", json={"email": test_email})

    # Sign up
    signup_resp = client.post(f"/activities/{activity}/signup?email={test_email}")
    assert signup_resp.status_code == 200
    assert f"Signed up {test_email}" in signup_resp.json()["message"]

    # Check participant is present
    activities = client.get("/activities").json()
    assert test_email in activities[activity]["participants"]

    # Unregister
    unregister_resp = client.post(f"/activities/{activity}/unregister", json={"email": test_email})
    assert unregister_resp.status_code == 200
    assert f"Removed {test_email}" in unregister_resp.json()["message"]

    # Check participant is removed
    activities = client.get("/activities").json()
    assert test_email not in activities[activity]["participants"]
