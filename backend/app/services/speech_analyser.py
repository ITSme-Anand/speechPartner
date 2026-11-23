"""Speech Analyser service using Google Gemini."""

import json
import logging
import time

from google import genai
from google.genai import types
from google.genai.errors import ServerError

from app.config import get_settings
from app.models.schemas import SpeechAnalysisResponse
from app.prompts.speech_analyser_prompt import SPEECH_ANALYSER_SYSTEM_PROMPT

logger = logging.getLogger(__name__)

# Gemini models occasionally return 503 "high demand" during load spikes.
# Retry a couple of times, then fall back to a second model before giving up.
ATTEMPTS_PER_MODEL = 2
RETRY_BACKOFF_SECONDS = 3
FALLBACK_MODEL = "gemini-3.1-flash-lite"


def _call_gemini(client: genai.Client, model: str, transcript: str) -> str:
    """One Gemini call. Returns the raw text response."""
    response = client.models.generate_content(
        model=model,
        contents=[
            types.Content(
                role="user",
                parts=[types.Part(text=f"Analyze this spoken English transcript:\n\n{transcript}")],
            ),
        ],
        config=types.GenerateContentConfig(
            system_instruction=SPEECH_ANALYSER_SYSTEM_PROMPT,
            response_mime_type="application/json",
            temperature=0.2,
        ),
    )
    return response.text


def analyze_speech(transcript: str) -> SpeechAnalysisResponse:
    """Analyze a speech transcript for grammatical errors using Gemini.

    Retries transient server-side overload (503) a couple of times per
    model, then falls back to a second model before giving up entirely —
    a single Gemini load spike shouldn't fail the user's whole submission.

    Args:
        transcript: The full text transcript from STT.

    Returns:
        SpeechAnalysisResponse containing per-sentence analysis with
        opportunities, errors, and corrections.

    Raises:
        ValueError: If the LLM response cannot be parsed.
        Exception: If every model/attempt fails.
    """
    settings = get_settings()
    client = genai.Client(api_key=settings.GEMINI_API_KEY)

    models_to_try = [settings.GEMINI_MODEL, FALLBACK_MODEL]
    last_error: Exception | None = None

    for model in models_to_try:
        for attempt in range(1, ATTEMPTS_PER_MODEL + 1):
            logger.info(
                "Sending transcript to Gemini for analysis (model=%s, attempt=%d/%d, length=%d chars)",
                model,
                attempt,
                ATTEMPTS_PER_MODEL,
                len(transcript),
            )
            try:
                raw_text = _call_gemini(client, model, transcript)
                break
            except ServerError as e:
                last_error = e
                logger.warning(
                    "Gemini call failed (model=%s, attempt=%d/%d): %s",
                    model,
                    attempt,
                    ATTEMPTS_PER_MODEL,
                    e,
                )
                if attempt < ATTEMPTS_PER_MODEL:
                    time.sleep(RETRY_BACKOFF_SECONDS * attempt)
        else:
            # Inner loop exhausted without a `break` — move on to the next model.
            continue
        # Inner loop hit `break` — we have a response, stop trying models.
        break
    else:
        raise last_error if last_error else RuntimeError("Gemini analysis failed with no error captured")

    logger.info("Gemini response received (%d chars)", len(raw_text))

    # Parse the JSON response
    try:
        parsed = json.loads(raw_text)
    except json.JSONDecodeError as e:
        logger.error("Failed to parse Gemini response as JSON: %s", e)
        logger.debug("Raw response: %s", raw_text[:500])
        raise ValueError(f"LLM returned invalid JSON: {e}")

    # Validate against our Pydantic model
    try:
        result = SpeechAnalysisResponse(**parsed)
    except Exception as e:
        logger.error("Failed to validate Gemini response: %s", e)
        raise ValueError(f"LLM response does not match expected schema: {e}")

    logger.info(
        "Analysis complete: %d sentences, %d total errors",
        len(result.sentences),
        sum(len(s.errors) for s in result.sentences),
    )

    return result
