"""Tests for anemia screening upload validation."""

import io


def test_upload_invalid_mime_rejected(client):
    files = {"file": ("bad.txt", io.BytesIO(b"not an image"), "text/plain")}
    data = {"method": "eye"}
    response = client.post(
        "/api/screenings/anemia/upload", data=data, files=files
    )
    assert response.status_code == 400, response.text


def test_upload_missing_method_rejected(client):
    files = {"file": ("image.png", io.BytesIO(b"\x89PNG\r\n"), "image/png")}
    response = client.post("/api/screenings/anemia/upload", files=files)
    assert response.status_code in (400, 422), response.text


def test_upload_valid_returns_model_unavailable(client):
    files = {"file": ("image.jpg", io.BytesIO(b"\xff\xd8\xfffake"), "image/jpeg")}
    data = {"method": "both"}
    response = client.post(
        "/api/screenings/anemia/upload", data=data, files=files
    )
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["status"] == "model_unavailable"
    assert "not yet available" in body["message"] or "not a diagnosis" in body["message"]
    assert "blood test" in body["note"].lower() or "blood test" in body["message"].lower()


def test_screenings_history(client):
    response = client.get("/api/screenings")
    assert response.status_code == 200
    assert isinstance(response.json(), list)