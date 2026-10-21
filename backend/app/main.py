"""HerHealth AI FastAPI application."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db
from app.routers import cycle, dashboard, education, health, questionnaires, screenings


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="HerHealth AI",
    description=(
        "Women's health screening and wellness platform. Local prototype -- "
        "nothing here diagnoses any condition."
    ),
    version=settings.app_version,
    contact={"name": "HerHealth AI", "url": "https://example.com"},
    license_info={"name": "Private"},
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(education.router, prefix="/api")
app.include_router(cycle.router, prefix="/api")
app.include_router(screenings.router, prefix="/api")
app.include_router(questionnaires.router, prefix="/api")


@app.get("/api/root", include_in_schema=False)
async def root():
    return {"service": "HerHealth AI", "status": "ok", "docs": "/docs"}