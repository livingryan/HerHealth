"""Cycle entry endpoints: list, create, update, delete period records."""

from fastapi import APIRouter, HTTPException

from app.database import execute, execute_lastrowid, query, row_to_dict
from app.schemas import (
    CycleEntry,
    CycleEntryCreate,
    CycleEntryUpdate,
    CycleEntriesResponse,
)

router = APIRouter(tags=["cycle-entries"])


def _parse_json_list(value) -> list:
    import json

    if value in (None, ""):
        return []
    try:
        return json.loads(value)
    except json.JSONDecodeError:
        return []


@router.get("/cycle-entries", response_model=CycleEntriesResponse)
def list_entries():
    rows = query(
        "SELECT * FROM cycle_entries ORDER BY started_at DESC, created_at DESC"
    )
    entries = []
    for row in rows:
        data = row_to_dict(row)
        data["symptoms"] = _parse_json_list(data.get("symptoms"))
        entries.append(CycleEntry.model_validate(data))
    return CycleEntriesResponse(entries=entries)


@router.post("/cycle-entries", response_model=CycleEntry, status_code=201)
def create_entry(payload: CycleEntryCreate):
    import json

    cur = execute_lastrowid(
        """
        INSERT INTO cycle_entries (started_at, ended_at, flow, symptoms, notes)
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            payload.started_at.isoformat(),
            payload.ended_at.isoformat() if payload.ended_at else None,
            payload.flow,
            json.dumps(payload.symptoms),
            payload.notes,
        ),
    )
    if cur is None:
        raise HTTPException(status_code=500, detail="Could not create entry")
    row = query("SELECT * FROM cycle_entries WHERE id = ?", (cur,))
    if not row:
        raise HTTPException(status_code=500, detail="Created entry not found")
    data = row_to_dict(row[0])
    data["symptoms"] = _parse_json_list(data.get("symptoms"))
    return CycleEntry.model_validate(data)


@router.put("/cycle-entries/{entry_id}", response_model=CycleEntry)
def update_entry(entry_id: int, payload: CycleEntryUpdate):
    existing = query("SELECT * FROM cycle_entries WHERE id = ?", (entry_id,))
    if not existing:
        raise HTTPException(status_code=404, detail="Cycle entry not found")

    data = row_to_dict(existing[0])
    updates = []
    params = []

    if payload.started_at is not None:
        updates.append("started_at = ?")
        params.append(payload.started_at.isoformat())
    if payload.ended_at is not None:
        updates.append("ended_at = ?")
        params.append(payload.ended_at.isoformat())
    if payload.flow is not None:
        updates.append("flow = ?")
        params.append(payload.flow)
    if payload.symptoms is not None:
        import json

        updates.append("symptoms = ?")
        params.append(json.dumps(payload.symptoms))
    if payload.notes is not None:
        updates.append("notes = ?")
        params.append(payload.notes)

    if not updates:
        data["symptoms"] = _parse_json_list(data.get("symptoms"))
        return CycleEntry.model_validate(data)

    params.append(entry_id)
    execute(
        f"UPDATE cycle_entries SET {', '.join(updates)}, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        tuple(params),
    )

    row = query("SELECT * FROM cycle_entries WHERE id = ?", (entry_id,))
    data = row_to_dict(row[0])
    data["symptoms"] = _parse_json_list(data.get("symptoms"))
    return CycleEntry.model_validate(data)


@router.delete("/cycle-entries/{entry_id}", status_code=204)
def delete_entry(entry_id: int):
    existing = query("SELECT * FROM cycle_entries WHERE id = ?", (entry_id,))
    if not existing:
        raise HTTPException(status_code=404, detail="Cycle entry not found")
    execute("DELETE FROM cycle_entries WHERE id = ?", (entry_id,))
    return None