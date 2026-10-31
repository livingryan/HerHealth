"""Questionnaire endpoints: PCOS-related symptoms and similar screeners.

Responses are summarized in plain language with an explicit non-diagnostic
disclaimer. Nothing here diagnoses PCOS or any other condition.
"""

from fastapi import APIRouter, HTTPException

from app.database import execute_lastrowid, query, row_to_dict
from app.schemas import QuestionnaireRequest, QuestionnaireResponse

router = APIRouter(tags=["questionnaires"])

_CATEGORIES = {"pcos", "menstrual-irregularities", "reproductive-health"}

_DISCLAIMER = (
    "This questionnaire is educational information only. It does not diagnose "
    "PCOS or any other condition, and it does not replace a clinical assessment."
)

_RECOMMENDATIONS = {
    "pcos": (
        "If your answers suggest irregular periods, excess hair or acne, or "
        "difficulty conceiving, consider discussing them with a clinician. "
        "PCOS is assessed through medical history, exams, and sometimes labs or "
        "ultrasound -- not by a questionnaire alone."
    ),
    "menstrual-irregularities": (
        "If your cycles are consistently outside your usual pattern, very heavy, "
        "or painful enough to disrupt daily life, a clinician can help identify "
        "possible causes and next steps."
    ),
    "reproductive-health": (
        "If you have concerns about your reproductive health, book a check-up and "
        "bring your notes. Preparing a symptom history makes the conversation more "
        "productive."
    ),
}


@router.post("/screenings/pcos/questionnaire", response_model=QuestionnaireResponse)
def submit_pcos_questionnaire(payload: QuestionnaireRequest):
    category = payload.category
    responses = payload.responses
    summary = payload.summary

    if category not in _CATEGORIES:
        raise HTTPException(status_code=400, detail="Unknown questionnaire category")

    if not isinstance(responses, dict) or not responses:
        raise HTTPException(status_code=400, detail="At least one response is required")

    execute_lastrowid(
        """
        INSERT INTO questionnaire_responses (category, responses, summary)
        VALUES (?, ?, ?)
        """,
        (category, __import__("json").dumps(responses), summary),
    )

    return QuestionnaireResponse(
        category=category,
        summary=summary or "Your responses have been recorded for your own reference.",
        responses=responses,
        recommendation=_RECOMMENDATIONS.get(category, _RECOMMENDATIONS["reproductive-health"]),
        disclaimer=_DISCLAIMER,
    )