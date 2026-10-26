from __future__ import annotations

import os
from pathlib import Path
from typing import Any

WHISPER_MODEL = os.getenv("WHISPER_MODEL", "small")
WHISPER_DEVICE = os.getenv("WHISPER_DEVICE", "cpu")
WHISPER_COMPUTE_TYPE = os.getenv("WHISPER_COMPUTE_TYPE", "int8")
INDICTRANS_MODEL = os.getenv(
    "INDICTRANS_MODEL", "ai4bharat/indictrans2-indic-en-dist-200M"
)

_whisper = None
_translator: "IndicTranslator | None" = None

# 22 scheduled Indian languages. Whisper does not expose a dedicated code for
# every language, so unsupported ones use automatic language detection while
# IndicTrans2 still receives the user-selected FLORES/IndicTrans code.
LANGUAGES: dict[str, dict[str, str | None]] = {
    "assamese": {"whisper": "as", "indic": "asm_Beng"},
    "bengali": {"whisper": "bn", "indic": "ben_Beng"},
    "bodo": {"whisper": None, "indic": "brx_Deva"},
    "dogri": {"whisper": None, "indic": "doi_Deva"},
    "goan_konkani": {"whisper": None, "indic": "gom_Deva"},
    "gujarati": {"whisper": "gu", "indic": "guj_Gujr"},
    "hindi": {"whisper": "hi", "indic": "hin_Deva"},
    "kannada": {"whisper": "kn", "indic": "kan_Knda"},
    "kashmiri": {"whisper": None, "indic": "kas_Arab"},
    "maithili": {"whisper": None, "indic": "mai_Deva"},
    "malayalam": {"whisper": "ml", "indic": "mal_Mlym"},
    "manipuri": {"whisper": None, "indic": "mni_Beng"},
    "marathi": {"whisper": "mr", "indic": "mar_Deva"},
    "nepali": {"whisper": "ne", "indic": "npi_Deva"},
    "odia": {"whisper": None, "indic": "ory_Orya"},
    "punjabi": {"whisper": "pa", "indic": "pan_Guru"},
    "sanskrit": {"whisper": "sa", "indic": "san_Deva"},
    "santali": {"whisper": None, "indic": "sat_Olck"},
    "sindhi": {"whisper": "sd", "indic": "snd_Arab"},
    "tamil": {"whisper": "ta", "indic": "tam_Taml"},
    "telugu": {"whisper": "te", "indic": "tel_Telu"},
    "urdu": {"whisper": "ur", "indic": "urd_Arab"},
}


def get_whisper():
    global _whisper
    if _whisper is None:
        from faster_whisper import WhisperModel

        _whisper = WhisperModel(
            WHISPER_MODEL,
            device=WHISPER_DEVICE,
            compute_type=WHISPER_COMPUTE_TYPE,
        )
    return _whisper


class IndicTranslator:
    def __init__(self):
        import torch
        from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
        try:
            from IndicTransToolkit import IndicProcessor
        except ImportError:
            from IndicTransToolkit.processor import IndicProcessor

        self.torch = torch
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.tokenizer = AutoTokenizer.from_pretrained(
            INDICTRANS_MODEL, trust_remote_code=True
        )
        dtype = torch.float16 if self.device == "cuda" else torch.float32
        self.model = AutoModelForSeq2SeqLM.from_pretrained(
            INDICTRANS_MODEL,
            trust_remote_code=True,
            torch_dtype=dtype,
        ).to(self.device)
        self.model.eval()
        self.processor = IndicProcessor(inference=True)

    def to_english(self, text: str, src_lang: str) -> str:
        if not text.strip():
            return text

        batch = self.processor.preprocess_batch(
            [text], src_lang=src_lang, tgt_lang="eng_Latn"
        )
        inputs = self.tokenizer(
            batch,
            truncation=True,
            padding="longest",
            return_tensors="pt",
            return_attention_mask=True,
        ).to(self.device)

        with self.torch.no_grad():
            generated = self.model.generate(
                **inputs,
                use_cache=True,
                min_length=0,
                max_length=512,
                num_beams=5,
                num_return_sequences=1,
            )
        decoded = self.tokenizer.batch_decode(
            generated,
            skip_special_tokens=True,
            clean_up_tokenization_spaces=True,
        )
        return self.processor.postprocess_batch(decoded, lang="eng_Latn")[0]


def get_translator() -> IndicTranslator:
    global _translator
    if _translator is None:
        _translator = IndicTranslator()
    return _translator


def transcribe_audio(
    audio_path: Path,
    language_name: str,
    translate_to_english: bool = True,
) -> dict[str, Any]:
    language_name = language_name.lower().strip()
    if language_name not in LANGUAGES:
        raise ValueError(
            f"Unsupported language '{language_name}'. Choose one of the 22 configured Indian languages."
        )

    config = LANGUAGES[language_name]
    model = get_whisper()
    segments, info = model.transcribe(
        str(audio_path),
        language=config["whisper"],
        beam_size=5,
        vad_filter=True,
    )
    transcript = " ".join(segment.text.strip() for segment in segments).strip()

    english_text = transcript
    translation_used = False
    translation_error = None
    if translate_to_english and config["indic"] != "eng_Latn":
        try:
            english_text = get_translator().to_english(transcript, str(config["indic"]))
            translation_used = True
        except Exception as exc:  # dependency/model access may be unavailable
            translation_error = str(exc)

    return {
        "transcript": transcript,
        "english_text": english_text,
        "selected_language": language_name,
        "detected_language": getattr(info, "language", None),
        "language_probability": float(getattr(info, "language_probability", 0.0) or 0.0),
        "translation_used": translation_used,
        "translation_error": translation_error,
        "whisper_model": WHISPER_MODEL,
        "translation_model": INDICTRANS_MODEL if translate_to_english else None,
    }
