from __future__ import annotations

import os
import tempfile
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from pydantic import BaseModel, Field

from .classifier import classify
from .duplicates import find_duplicates
from .voice import LANGUAGES, transcribe_audio

app = FastAPI(
    title="SafeHer ML Service",
    version="1.0.0",
    description="BiLSTM classification, TF-IDF duplicate detection, and voice reporting.",
)




def verify_service_key(request: Request):
    expected = os.getenv("ML_SERVICE_API_KEY", "")
    if expected and request.headers.get("x-ml-service-key") != expected:
        raise HTTPException(status_code=401, detail="Invalid ML service credential")

class ClassifyRequest(BaseModel):
    text: str = Field(min_length=3, max_length=20000)


class DuplicateDocument(BaseModel):
    id: str
    text: str


class DuplicateRequest(BaseModel):
    query: str = Field(min_length=3, max_length=20000)
    documents: list[DuplicateDocument] = []
    threshold: float = Field(default=0.72, ge=0.0, le=1.0)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "safeher-ml",
        "voice_languages": len(LANGUAGES),
    }


@app.get("/languages")
def languages():
    return {
        "languages": [
            {
                "name": name,
                "whisper_code": config["whisper"],
                "indictrans2_code": config["indic"],
            }
            for name, config in LANGUAGES.items()
        ]
    }


@app.post("/classify")
def classify_endpoint(payload: ClassifyRequest, request: Request):
    verify_service_key(request)
    return classify(payload.text)


@app.post("/duplicates")
def duplicate_endpoint(payload: DuplicateRequest, request: Request):
    verify_service_key(request)
    return find_duplicates(
        payload.query,
        [doc.model_dump() for doc in payload.documents],
        payload.threshold,
    )


@app.post("/voice/transcribe")
async def transcribe_endpoint(
    request: Request,
    file: UploadFile = File(...),
    language: str = Form(...),
    translate_to_english: bool = Form(True),
):
    verify_service_key(request)
    suffix = Path(file.filename or "voice.webm").suffix or ".webm"
    max_bytes = int(os.getenv("VOICE_MAX_BYTES", str(25 * 1024 * 1024)))
    data = await file.read()
    if len(data) > max_bytes:
        raise HTTPException(status_code=413, detail="Audio file exceeds configured size limit")

    temp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(data)
            temp_path = Path(tmp.name)
        return transcribe_audio(temp_path, language, translate_to_english)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Voice pipeline unavailable: {exc}") from exc
    finally:
        if temp_path and temp_path.exists():
            temp_path.unlink(missing_ok=True)
