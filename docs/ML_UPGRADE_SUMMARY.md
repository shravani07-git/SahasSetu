# SafeHer ML + Privacy Upgrade Summary

Added in this version:

- AES-256-GCM field-level encryption for sensitive complaint fields.
- AES-256-GCM encrypted counseling notes.
- SHA-256 evidence content hashes.
- HMAC-signed evidence timestamps and chained receipt hashes.
- Integrity verification endpoint and pre-download integrity checking.
- Reviewer-facing identity masking for anonymous cases.
- FastAPI ML microservice with internal service-key support.
- PyTorch multi-output BiLSTM architecture and real evaluation pipeline.
- TF-IDF unigram/bigram cosine-similarity duplicate detection.
- Voice-report upload from the Next.js report screen.
- faster-whisper speech-to-text integration.
- IndicTrans2 Indic-to-English integration for the 22 scheduled Indian-language choices.
- ML classification and duplicate analysis UI on the report page.
- Docker Compose integration for the ML service and Hugging Face model cache.
- Corrected misleading “end-to-end/zero-knowledge” UI wording to match the actual server-side security architecture.
- Removed runtime upload files and replaced embedded development credentials/API keys with safe placeholders/dev-only values in the generated copy.

## Still required before claiming “89% accuracy”

Supply a real labeled harassment dataset, train the included BiLSTM, and use the held-out metrics written to `ml-service/artifacts/metrics.json`. Accuracy is intentionally not hard-coded.
