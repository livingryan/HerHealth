"""SQLite persistence layer.

Kept intentionally small and modular: all SQL lives here so PostgreSQL (or another
store) can be introduced later without touching route handlers.
"""

import json
import sqlite3
from pathlib import Path
from typing import List, Optional

from app.config import settings

DEFAULT_DB_DIR = Path(__file__).resolve().parent.parent / "data"


def _resolve_db_path() -> Path:
    """Resolve the SQLite file location from the configured database URL.

    Supports the ``sqlite:///relative/or/absolute/path.db`` form so tests can
    point the app at a throwaway database via the DATABASE_URL environment
    variable. PostgreSQL can replace this later because all SQL lives here.
    """
    url = settings.database_url
    if url.startswith("sqlite:///"):
        raw = url[len("sqlite:///"):]
    elif url == "sqlite://":
        raw = ":memory:"
    else:
        raw = url

    if raw == ":memory:":
        # A shared in-memory database would be lost between connections, so
        # fall back to a file inside the data directory.
        raw = str(DEFAULT_DB_DIR / "herhealth.db")

    path = Path(raw)
    if not path.is_absolute():
        path = DEFAULT_DB_DIR / path
    return path


DB_PATH = _resolve_db_path()
DB_PATH.parent.mkdir(parents=True, exist_ok=True)

SCHEMA = """
CREATE TABLE IF NOT EXISTS cycle_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    started_at DATE NOT NULL,
    ended_at DATE,
    flow TEXT NOT NULL DEFAULT 'medium',
    symptoms TEXT NOT NULL DEFAULT '[]',
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (flow IN ('light', 'medium', 'heavy')),
    CHECK (ended_at IS NULL OR ended_at >= started_at)
);

CREATE TABLE IF NOT EXISTS screening_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kind TEXT NOT NULL DEFAULT 'anemia',
    method TEXT NOT NULL,
    status TEXT NOT NULL,
    image_filename TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS questionnaire_responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    responses TEXT NOT NULL DEFAULT '{}',
    summary TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cycle_entries_started_at ON cycle_entries(started_at);
CREATE INDEX IF NOT EXISTS idx_screening_events_created_at ON screening_events(created_at);
"""


def get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db() -> None:
    """Create tables if they do not exist. Safe to run on every startup."""
    with get_conn() as conn:
        conn.executescript(SCHEMA)


def query(sql: str, parameters: tuple = ()) -> List[sqlite3.Row]:
    with get_conn() as conn:
        return conn.execute(sql, parameters).fetchall()


def execute(sql: str, parameters: tuple = ()) -> sqlite3.Cursor:
    with get_conn() as conn:
        cur = conn.execute(sql, parameters)
        conn.commit()
        return cur


def execute_lastrowid(sql: str, parameters: tuple = ()) -> Optional[int]:
    with get_conn() as conn:
        cur = conn.execute(sql, parameters)
        conn.commit()
        return cur.lastrowid


def row_to_dict(row: sqlite3.Row) -> dict:
    return {key: row[key] for key in row.keys()}