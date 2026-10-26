from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

MODEL_PATH = Path(os.getenv("BILSTM_MODEL_PATH", "/app/artifacts/harassment_bilstm.pt"))
METADATA_PATH = Path(os.getenv("BILSTM_METADATA_PATH", "/app/artifacts/metadata.json"))

_model = None
_metadata: dict[str, Any] | None = None
_load_error: str | None = None


def _load():
    global _model, _metadata, _load_error
    if _model is not None or _load_error is not None:
        return

    if not MODEL_PATH.exists() or not METADATA_PATH.exists():
        _load_error = (
            "BiLSTM model artifacts are not present. Train the model with "
            "train_bilstm.py and mount the artifacts directory."
        )
        return

    try:
        import torch
        from .bilstm_model import HarassmentBiLSTM

        _metadata = json.loads(METADATA_PATH.read_text(encoding="utf-8"))
        config = _metadata["model_config"]
        _model = HarassmentBiLSTM(
            vocab_size=len(_metadata["vocab"]),
            num_types=len(_metadata["type_labels"]),
            num_severities=len(_metadata["severity_labels"]),
            embedding_dim=int(config["embedding_dim"]),
            hidden_dim=int(config["hidden_dim"]),
            dropout=float(config["dropout"]),
        )
        state = torch.load(MODEL_PATH, map_location="cpu", weights_only=True)
        _model.load_state_dict(state)
        _model.eval()
    except Exception as exc:  # pragma: no cover - model/environment dependent
        _load_error = f"Unable to load BiLSTM model: {exc}"


def classify(text: str) -> dict[str, Any]:
    _load()
    if _model is None or _metadata is None:
        return {
            "model_available": False,
            "reason": _load_error or "Model unavailable",
            "harassment_type": None,
            "severity": None,
            "type_confidence": None,
            "severity_confidence": None,
            "model_version": None,
        }

    import torch
    from .bilstm_model import encode_text

    encoded = encode_text(text, _metadata["vocab"], int(_metadata["max_len"]))
    input_ids = torch.tensor([encoded], dtype=torch.long)

    with torch.no_grad():
        type_logits, severity_logits = _model(input_ids)
        type_probs = torch.softmax(type_logits, dim=1)[0]
        severity_probs = torch.softmax(severity_logits, dim=1)[0]

    type_index = int(torch.argmax(type_probs).item())
    severity_index = int(torch.argmax(severity_probs).item())

    return {
        "model_available": True,
        "harassment_type": _metadata["type_labels"][type_index],
        "severity": _metadata["severity_labels"][severity_index],
        "type_confidence": float(type_probs[type_index].item()),
        "severity_confidence": float(severity_probs[severity_index].item()),
        "model_version": _metadata.get("model_version", "bilstm-v1"),
        "metrics": _metadata.get("metrics"),
    }
