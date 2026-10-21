"""Anemia image-upload screening endpoint.

No inference is performed. The endpoint validates the upload, stores the image
under a safe generated filename, and returns an explicit "model unavailable"
status -- never a fabricated medical prediction.
"""

import shutil
import uuid
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from app.config import settings
from app.database import execute, execute_lastrowid, query, row_to_dict
from app.schemas import ScreeningEvent, ScreeningUploadResponse

router = APIRouter(tags=["screenings"])

UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads"


def _ensure_upload_dir() -> Path:
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    return UPLOAD_DIR


_VALID_METHODS = {"eye", "nail", "both"}


@router.post("/screenings/anemia/upload", response_model=ScreeningUploadResponse)
async def upload_anemia_screening(
    method: str = Form(...),
    file: UploadFile = File(...),
):
    """Accept one screening image and record that inference is unavailable.

    The image is stored under a randomized filename. Image bytes are never logged.
    """
    if method not in _VALID_METHODS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Method must be one of: eye, nail, both",
        )

    if not file.content_type or file.content_type not in settings.allowed_image_mime_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Unsupported file type. Upload a JPEG, PNG, or WebP image."
            ),
        )

    # Enforce size limit. UploadFile.size may be None in some servers; read and
    # cap the payload in that case.
    contents = await file.read()
    size = len(contents)
    if size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is empty.",
        )
    max_bytes = settings.max_upload_size_mb * 1024 * 1024
    if size > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds {settings.max_upload_size_mb} MB limit.",
        )

    suffix = Path(file.filename or "image").suffix.lower()
    safe_name = f"{uuid.uuid4().hex}{suffix if suffix in {'.jpg', '.jpeg', '.png', '.webp'} else '.jpg'}"
    dest = _ensure_upload_dir() / safe_name
    dest.write_bytes(contents)

    screening_id = execute_lastrowid(
        """
        INSERT INTO screening_events (kind, method, status, image_filename)
        VALUES ('anemia', ?, 'model_unavailable', ?)
        """,
        (method, safe_name),
    )

    return ScreeningUploadResponse(
        status="model_unavailable",
        message=(
            "Your image was received and validated. Real AI analysis is not yet "
            "available: no validated anemia model has been integrated, so this is "
            "not a screening result and not a diagnosis. A blood test is required "
            "to check for anemia."
        ),
        screening_id=screening_id,
        image_filename=safe_name,
        stored_temporarily=True,
        note=(
            "Images are kept in a local prototype folder only. They are not shared "
            "with third parties and are not used to train any model in this release."
        ),
    )


@router.get("/screenings", response_model=list[ScreeningEvent])
def list_screenings():
    rows = query(
        "SELECT * FROM screening_events ORDER BY created_at DESC LIMIT 50"
    )
    return [ScreeningEvent.model_validate(row_to_dict(r)) for r in rows]