# SafeHer ML Service

This FastAPI service adds three optional capabilities to the SafeHer Next.js application:

1. **BiLSTM harassment type + severity classification** (`POST /classify`).
2. **TF-IDF + cosine similarity duplicate detection** (`POST /duplicates`).
3. **Voice-first reporting** (`POST /voice/transcribe`) using faster-whisper for speech-to-text and IndicTrans2 for Indic-to-English translation.

## Accuracy claim

The repository does **not** hard-code or fabricate `89% accuracy`. Run `train_bilstm.py` on a real labeled dataset. The script saves held-out test metrics to `artifacts/metrics.json`. Only quote an accuracy number that appears there and that you can defend in an interview.

## Training data format

CSV columns:

```text
text,type_label,severity_label
```

Train:

```bash
python train_bilstm.py --data data/your_dataset.csv --output artifacts
```

## Run locally

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The first Whisper/IndicTrans2 request downloads model weights. IndicTrans2 Hugging Face models may require accepting the model repository conditions and authenticating with Hugging Face before download.

## 22-language design

The service exposes the 22 scheduled Indian-language choices. Where Whisper does not have a dedicated language token, it uses automatic detection; the chosen language is still supplied to IndicTrans2 for translation.
