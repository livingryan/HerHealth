"""Pydantic schemas for request/response validation."""

from datetime import date
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "HerHealth AI"
    version: str = "0.1.0"
    model_available: bool = False


class DashboardShortcut(BaseModel):
    key: str
    label: str
    description: str
    href: str
    coming_soon: bool = False


class DashboardResponse(BaseModel):
    welcome: str
    shortcuts: List[DashboardShortcut]
    recent_activity: List[dict] = []
    cycle_overview: Optional[dict] = None
    screening_history: List[dict] = []
    featured_education: List[dict] = []
    next_steps: List[str]


# --- Cycle entries -----------------------------------------------------------

class CycleEntryBase(BaseModel):
    started_at: date
    ended_at: Optional[date] = None
    flow: str = Field(default="medium", pattern="^(light|medium|heavy)$")
    symptoms: List[str] = Field(default_factory=list)
    notes: Optional[str] = None

    @field_validator("ended_at")
    @classmethod
    def _end_not_before_start(cls, v: Optional[date], info) -> Optional[date]:
        if v is not None and "started_at" in info.data and v < info.data["started_at"]:
            raise ValueError("Ended at cannot be before started at")
        return v


class CycleEntryCreate(CycleEntryBase):
    pass


class CycleEntryUpdate(BaseModel):
    started_at: Optional[date] = None
    ended_at: Optional[date] = None
    flow: Optional[str] = Field(default=None, pattern="^(light|medium|heavy)$")
    symptoms: Optional[List[str]] = None
    notes: Optional[str] = None


class CycleEntry(CycleEntryBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: str
    updated_at: str


class CycleEntriesResponse(BaseModel):
    entries: List[CycleEntry]


# --- Education ---------------------------------------------------------------

class EducationArticle(BaseModel):
    id: str
    title: str
    category: str
    excerpt: str
    read_time_minutes: int


class EducationArticleDetail(EducationArticle):
    content: str
    references: List[str]


# --- Screenings --------------------------------------------------------------

class ScreeningUploadResponse(BaseModel):
    status: str = "model_unavailable"
    message: str
    screening_id: int
    image_filename: str
    stored_temporarily: bool = True
    note: str


class ScreeningEvent(BaseModel):
    id: int
    kind: str
    method: str
    status: str
    image_filename: Optional[str]
    created_at: str


# --- Questionnaires ----------------------------------------------------------

class QuestionnaireRequest(BaseModel):
    category: str
    responses: dict
    summary: str = ""


class QuestionnaireResponse(BaseModel):
    category: str
    summary: str
    responses: dict
    recommendation: str
    disclaimer: str