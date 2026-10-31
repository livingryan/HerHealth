"""Tests for cycle-entry CRUD and validation."""

from datetime import date, timedelta


def test_create_and_list_cycle_entry(client):
    payload = {
        "started_at": "2024-01-01",
        "ended_at": "2024-01-05",
        "flow": "medium",
        "symptoms": ["cramps", "fatigue"],
        "notes": "Heavier on day two.",
    }
    response = client.post("/api/cycle-entries", json=payload)
    assert response.status_code == 201, response.text
    entry = response.json()
    assert entry["id"] == 1
    assert entry["flow"] == "medium"
    assert entry["symptoms"] == ["cramps", "fatigue"]

    response = client.get("/api/cycle-entries")
    assert response.status_code == 200
    entries = response.json()["entries"]
    assert len(entries) == 1
    assert entries[0]["id"] == 1


def test_cycle_entry_end_before_start_rejected(client):
    payload = {
        "started_at": "2024-01-05",
        "ended_at": "2024-01-01",
        "flow": "light",
    }
    response = client.post("/api/cycle-entries", json=payload)
    assert response.status_code in (400, 422), response.text


def test_cycle_entry_invalid_flow_rejected(client):
    payload = {"started_at": "2024-01-01", "flow": "extreme"}
    response = client.post("/api/cycle-entries", json=payload)
    assert response.status_code in (400, 422), response.text


def test_update_and_delete_cycle_entry(client):
    create = client.post(
        "/api/cycle-entries",
        json={"started_at": "2024-02-01", "flow": "heavy"},
    )
    entry_id = create.json()["id"]

    update = client.put(
        f"/api/cycle-entries/{entry_id}",
        json={"flow": "light", "notes": "Updated note"},
    )
    assert update.status_code == 200, update.text
    assert update.json()["flow"] == "light"
    assert update.json()["notes"] == "Updated note"

    missing = client.put("/api/cycle-entries/99999", json={"flow": "light"})
    assert missing.status_code == 404

    delete = client.delete(f"/api/cycle-entries/{entry_id}")
    assert delete.status_code == 204

    gone = client.delete(f"/api/cycle-entries/{entry_id}")
    assert gone.status_code == 404