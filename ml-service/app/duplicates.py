from __future__ import annotations

from typing import Any


def find_duplicates(
    query: str,
    documents: list[dict[str, str]],
    threshold: float = 0.72,
) -> dict[str, Any]:
    if not documents:
        return {"matches": [], "threshold": threshold, "method": "tfidf_cosine"}

    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity

    corpus = [query] + [doc.get("text", "") for doc in documents]
    vectorizer = TfidfVectorizer(
        lowercase=True,
        ngram_range=(1, 2),
        min_df=1,
        sublinear_tf=True,
        strip_accents="unicode",
    )
    matrix = vectorizer.fit_transform(corpus)
    scores = cosine_similarity(matrix[0:1], matrix[1:]).flatten()

    matches = []
    for doc, score in zip(documents, scores):
        if float(score) >= threshold:
            matches.append({
                "id": doc.get("id"),
                "similarity": round(float(score), 4),
            })

    matches.sort(key=lambda item: item["similarity"], reverse=True)
    return {
        "matches": matches,
        "threshold": threshold,
        "method": "tfidf_cosine",
        "max_similarity": matches[0]["similarity"] if matches else float(scores.max(initial=0.0)),
    }
