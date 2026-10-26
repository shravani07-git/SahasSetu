# SafeHer

SafeHer is a privacy-focused workplace-harassment reporting, case-management and support platform. It combines complaint workflows, encrypted evidence, controlled anonymity, AI-assisted drafting, NGO/counseling support and optional ML-assisted reporting.

## Architecture

- **Web/full-stack:** Next.js 16, React 19, TypeScript
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT (`jose`) in HTTP-only cookies + bcrypt password hashing
- **Sensitive-data protection:** AES-256-GCM field-level encryption for complaint narrative/PII fields and counseling notes
- **Evidence protection:** per-file AES-256-GCM keys protected by a master key
- **Evidence integrity:** SHA-256 content hash + HMAC-SHA-256 timestamp receipt + receipt-chain link
- **Generative AI:** Google Gemini writing assistant
- **ML service:** Python FastAPI
  - BiLSTM harassment type/severity classifier
  - TF-IDF + cosine-similarity duplicate detection
  - faster-whisper voice transcription
  - IndicTrans2 Indic-to-English translation pipeline

## ML accuracy

The code includes a real BiLSTM training/evaluation pipeline, but **does not fabricate an accuracy value**. Train on an appropriate labeled dataset using `ml-service/train_bilstm.py`; real held-out metrics are written to `ml-service/artifacts/metrics.json`.

Only put a number such as `89% accuracy` on a resume if your own test output actually supports it.

## Local development

### 1. Configure environment

Copy `.env.example` to `.env.local` and replace the development placeholders. `ENCRYPTION_MASTER_KEY` must be exactly 64 hexadecimal characters.

### 2. Start MongoDB, Redis and ML service

```bash
docker compose -f docker-compose.dev.yml up -d
```

The ML service listens on `http://localhost:8000`.

### 3. Start Next.js

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Training the BiLSTM model

Prepare a CSV with:

```text
text,type_label,severity_label
```

Then:

```bash
cd ml-service
python train_bilstm.py --data data/your_dataset.csv --output artifacts
```

The service automatically loads `artifacts/harassment_bilstm.pt` and `artifacts/metadata.json`.

## Voice-first reporting

The reporting screen accepts an audio file and a selected Indian language. The FastAPI service uses faster-whisper for speech-to-text. It can then use AI4Bharat IndicTrans2 to translate Indic text to English before returning the draft to the Next.js form.

Model weights are not committed to this repository; they are downloaded/cached at runtime. IndicTrans2 model repositories may require accepting their Hugging Face access conditions.

## Security terminology

- Uploaded evidence is **encrypted at rest**, not true client-side end-to-end encryption.
- Evidence receipts are **tamper-evident / cryptographically verifiable**, not mathematically “tamper-proof.”
- Anonymous mode hides identity in the workflow, but the current account-backed design should be described as **controlled/pseudonymous reporting**, not irreversible anonymity from the entire backend.

See `docs/INTERVIEW_FEATURES.md` for defensible interview wording.
