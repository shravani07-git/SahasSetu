# SafeHer — Defensible Interview Claims

## Strong claims you can explain from the code

### Privacy-first reporting
Sensitive complaint fields (`location`, `description`, `perpetratorInfo`, `witnesses`, `previousIncidents`, and resolution text) are encrypted individually with AES-256-GCM before MongoDB storage. A key derived from the master key is used for field encryption, each value gets a random IV, and the field name is authenticated as AAD.

### Encrypted evidence vault
Every evidence file receives a fresh random 256-bit file key. The evidence is encrypted with AES-256-GCM. The per-file key is then encrypted using the application's master key.

### Cryptographically verifiable evidence timestamping
Before encryption, the server calculates a SHA-256 hash of the original evidence. It creates a timestamp receipt signed with HMAC-SHA-256 and links it to the previous receipt hash for the case. The download path recomputes the plaintext hash and verifies the signed receipt before releasing new evidence files.

Recommended wording: **“tamper-evident evidence receipts and cryptographically verifiable timestamps.”**

### BiLSTM classification
The Python service contains a multi-output BiLSTM model: tokenization/vocabulary → Embedding → Bidirectional LSTM → masked max pooling/dense layers → harassment-type and severity softmax heads.

The training script creates a held-out test set and saves type/severity accuracy and macro-F1 metrics. Do not quote `89%` until that value has actually been reproduced on your dataset.

### Duplicate detection
The FastAPI `/duplicates` endpoint creates TF-IDF unigram/bigram vectors and computes cosine similarity between the current complaint and existing complaints. It returns matches above a configurable threshold. The feature is advisory and never blocks submission.

### Voice-first reporting
The FastAPI service accepts audio, transcribes it with faster-whisper and, for selected Indic languages, can translate the transcript to English using IndicTrans2. The UI exposes the 22 scheduled Indian-language choices.

### Encrypted counseling records
Counselor notes are encrypted at the field level before database storage and decrypted only after the authenticated/authorized API fetches the session.

## Avoid these overclaims

Do not say:
- “The system is unhackable.”
- “Evidence is legally tamper-proof.”
- “We achieved 89%” unless `metrics.json` from your real held-out test set says so.
- “True end-to-end encryption” for the current server-side evidence architecture.
- “Completely untraceable anonymous complaints.”

## Strong resume wording after the ML model is actually trained

- Built a privacy-focused reporting platform with controlled anonymous workflows, field-level AES-256-GCM encryption, encrypted evidence storage, and cryptographically verifiable evidence receipts.
- Developed a multi-output BiLSTM pipeline for harassment-type and severity classification; achieved **X% type accuracy / Y% severity accuracy** on a held-out test set.
- Implemented TF-IDF cosine-similarity duplicate detection and exposed ML capabilities through a FastAPI microservice integrated with the Next.js application.
- Added voice-first reporting across 22 scheduled Indian-language options using faster-whisper transcription and IndicTrans2 translation, with encrypted counseling notes and support workflows.
