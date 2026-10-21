"""Dashboard aggregation endpoint."""

import json

from fastapi import APIRouter

from app.database import query, row_to_dict
from app.schemas import DashboardResponse

router = APIRouter(tags=["dashboard"])


def _parse_json_list(value) -> list:
    """Cycle symptoms are stored as a JSON string; the API returns a list."""
    if isinstance(value, list):
        return value
    if value in (None, ""):
        return []
    try:
        parsed = json.loads(value)
    except (json.JSONDecodeError, TypeError):
        return []
    return parsed if isinstance(parsed, list) else []


def _screening_summary(row) -> dict:
    """Map a screening_events row onto the shape the dashboard UI expects."""
    data = row_to_dict(row)
    return {
        "id": data.get("id"),
        "kind": data.get("kind") or "anemia",
        "method": data.get("method") or "",
        "status": data.get("status") or "",
        "created_at": data.get("created_at") or "",
    }

WELCOME = (
    "Welcome back. Here is a gentle overview of your saved health information. "
    "Nothing on this screen is a diagnosis."
)

NEXT_STEPS = [
    "Log your most recent period start date in the cycle tracker.",
    "Read about iron-rich foods and anemia in the education library.",
    "When you are ready, explore the image-assisted anemia screening center.",
]

SHORTCUTS = [
    {
        "key": "cycle-tracking",
        "label": "Cycle tracking",
        "description": "Log period dates, flow, and symptoms.",
        "href": "/cycle-tracking",
        "coming_soon": True,
    },
    {
        "key": "anemia-screening",
        "label": "Anemia screening",
        "description": "Image-assisted screening for inner lower-eyelid and fingernail photos.",
        "href": "/screening/anemia",
        "coming_soon": True,
    },
    {
        "key": "health-education",
        "label": "Health education",
        "description": "Articles on anemia, menstrual health, PCOS, and preventive care.",
        "href": "/education",
        "coming_soon": False,
    },
    {
        "key": "reports",
        "label": "Reports & history",
        "description": "Your saved records and printable summaries.",
        "href": "/reports",
        "coming_soon": True,
    },
]

_FEATURED_ARTICLE_IDS = ["anemia-iron-deficiency", "iron-rich-foods", "when-to-seek-care"]


@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard():
    latest = query(
        "SELECT * FROM cycle_entries ORDER BY started_at DESC, created_at DESC LIMIT 1"
    )
    cycle_overview = None
    if latest:
        entry = row_to_dict(latest[0])
        cycle_overview = {
            "last_period_start": entry["started_at"],
            "last_flow": entry["flow"],
            "symptoms": _parse_json_list(entry.get("symptoms")),
            "note": "Cycle length estimates require at least two recorded periods.",
        }

    screenings = query(
        "SELECT * FROM screening_events ORDER BY created_at DESC LIMIT 5"
    )

    return DashboardResponse(
        welcome=WELCOME,
        shortcuts=SHORTCUTS,
        recent_activity=[],
        cycle_overview=cycle_overview,
        screening_history=[_screening_summary(r) for r in screenings],
        featured_education=[
            {"id": aid, "href": f"/education/{aid}"} for aid in _FEATURED_ARTICLE_IDS
        ],
        next_steps=NEXT_STEPS,
    )