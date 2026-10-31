"""Tests for questionnaire validation."""

def test_pcos_questionnaire_valid(client):
    payload = {
        "category": "pcos",
        "responses": {
            "irregular_periods": "often",
            "excess_hair": "sometimes",
            "difficulty_conceiving": "unsure",
        },
        "summary": "Irregular periods for several months.",
    }
    response = client.post("/api/screenings/pcos/questionnaire", json=payload)
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["disclaimer"]
    assert "does not diagnose" in body["disclaimer"]
    assert body["recommendation"]


def test_pcos_questionnaire_invalid_category(client):
    payload = {"category": "made-up", "responses": {"a": "b"}}
    response = client.post("/api/screenings/pcos/questionnaire", json=payload)
    assert response.status_code == 400


def test_pcos_questionnaire_empty_responses(client):
    payload = {"category": "pcos", "responses": {}}
    response = client.post("/api/screenings/pcos/questionnaire", json=payload)
    assert response.status_code == 400