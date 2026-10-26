"""Train the SafeHer multi-output PyTorch BiLSTM classifier.

Expected CSV columns:
    text,type_label,severity_label

The script reports metrics on a held-out test split and saves them alongside the
model. Do not put an accuracy value on a resume until it is reproduced on a
representative labeled dataset.
"""

from __future__ import annotations

import argparse
import json
import random
import sys
from pathlib import Path

import numpy as np
import pandas as pd
import torch
from sklearn.metrics import accuracy_score, classification_report, f1_score
from sklearn.model_selection import train_test_split
from torch import nn
from torch.utils.data import DataLoader, Dataset

sys.path.insert(0, str(Path(__file__).parent))
from app.bilstm_model import HarassmentBiLSTM, build_vocab, encode_text  # noqa: E402


class ComplaintDataset(Dataset):
    def __init__(self, texts, type_ids, severity_ids, vocab, max_len):
        self.texts = list(texts)
        self.type_ids = list(type_ids)
        self.severity_ids = list(severity_ids)
        self.vocab = vocab
        self.max_len = max_len

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        return (
            torch.tensor(encode_text(self.texts[idx], self.vocab, self.max_len), dtype=torch.long),
            torch.tensor(self.type_ids[idx], dtype=torch.long),
            torch.tensor(self.severity_ids[idx], dtype=torch.long),
        )


def evaluate(model, loader, device):
    model.eval()
    truth_type, truth_severity, pred_type, pred_severity = [], [], [], []
    with torch.no_grad():
        for x, yt, ys in loader:
            x = x.to(device)
            type_logits, severity_logits = model(x)
            truth_type.extend(yt.numpy().tolist())
            truth_severity.extend(ys.numpy().tolist())
            pred_type.extend(type_logits.argmax(dim=1).cpu().numpy().tolist())
            pred_severity.extend(severity_logits.argmax(dim=1).cpu().numpy().tolist())
    return truth_type, truth_severity, pred_type, pred_severity


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", required=True, help="CSV with text,type_label,severity_label")
    parser.add_argument("--output", default="artifacts")
    parser.add_argument("--epochs", type=int, default=12)
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--max-len", type=int, default=220)
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    random.seed(args.seed)
    np.random.seed(args.seed)
    torch.manual_seed(args.seed)

    df = pd.read_csv(args.data).dropna(subset=["text", "type_label", "severity_label"])
    if len(df) < 100:
        raise SystemExit("Use a meaningful labeled dataset; at least 100 rows are required by this script.")

    df["text"] = df["text"].astype(str)
    df["type_label"] = df["type_label"].astype(str)
    df["severity_label"] = df["severity_label"].astype(str)

    type_labels = sorted(df["type_label"].unique().tolist())
    severity_labels = sorted(df["severity_label"].unique().tolist())
    type_to_id = {label: i for i, label in enumerate(type_labels)}
    severity_to_id = {label: i for i, label in enumerate(severity_labels)}

    indices = np.arange(len(df))
    composite = df["type_label"] + "__" + df["severity_label"]
    stratify = composite if composite.value_counts().min() >= 2 else None
    train_idx, test_idx = train_test_split(
        indices,
        test_size=0.2,
        random_state=args.seed,
        stratify=stratify,
    )

    train_df = df.iloc[train_idx].reset_index(drop=True)
    test_df = df.iloc[test_idx].reset_index(drop=True)
    vocab = build_vocab(train_df["text"], max_tokens=30000, min_freq=2)

    def make_dataset(frame):
        return ComplaintDataset(
            frame["text"].tolist(),
            frame["type_label"].map(type_to_id).tolist(),
            frame["severity_label"].map(severity_to_id).tolist(),
            vocab,
            args.max_len,
        )

    train_loader = DataLoader(make_dataset(train_df), batch_size=args.batch_size, shuffle=True)
    test_loader = DataLoader(make_dataset(test_df), batch_size=args.batch_size, shuffle=False)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model_config = {"embedding_dim": 128, "hidden_dim": 96, "dropout": 0.4}
    model = HarassmentBiLSTM(
        len(vocab),
        len(type_labels),
        len(severity_labels),
        **model_config,
    ).to(device)

    optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
    criterion = nn.CrossEntropyLoss()

    best_loss = float("inf")
    best_state = None
    patience, stale_epochs = 3, 0

    for epoch in range(1, args.epochs + 1):
        model.train()
        running_loss = 0.0
        for x, yt, ys in train_loader:
            x, yt, ys = x.to(device), yt.to(device), ys.to(device)
            optimizer.zero_grad()
            type_logits, severity_logits = model(x)
            loss = criterion(type_logits, yt) + criterion(severity_logits, ys)
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            optimizer.step()
            running_loss += float(loss.item()) * x.size(0)

        epoch_loss = running_loss / max(len(train_loader.dataset), 1)
        print(f"epoch={epoch} train_loss={epoch_loss:.4f}")
        if epoch_loss < best_loss - 1e-4:
            best_loss = epoch_loss
            best_state = {k: v.detach().cpu().clone() for k, v in model.state_dict().items()}
            stale_epochs = 0
        else:
            stale_epochs += 1
            if stale_epochs >= patience:
                break

    if best_state is not None:
        model.load_state_dict(best_state)
    model.to(device)

    yt, ys, pt, ps = evaluate(model, test_loader, device)
    metrics = {
        "type_accuracy": float(accuracy_score(yt, pt)),
        "severity_accuracy": float(accuracy_score(ys, ps)),
        "type_macro_f1": float(f1_score(yt, pt, average="macro")),
        "severity_macro_f1": float(f1_score(ys, ps, average="macro")),
        "test_samples": int(len(test_df)),
    }

    output = Path(args.output)
    output.mkdir(parents=True, exist_ok=True)
    torch.save(model.cpu().state_dict(), output / "harassment_bilstm.pt")
    metadata = {
        "model_version": "pytorch-bilstm-v1",
        "type_labels": type_labels,
        "severity_labels": severity_labels,
        "vocab": vocab,
        "max_len": args.max_len,
        "model_config": model_config,
        "metrics": metrics,
    }
    (output / "metadata.json").write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    (output / "metrics.json").write_text(json.dumps(metrics, indent=2), encoding="utf-8")

    print(json.dumps(metrics, indent=2))
    print("\nType classification report:")
    print(classification_report(yt, pt, target_names=type_labels, zero_division=0))
    print("\nSeverity classification report:")
    print(classification_report(ys, ps, target_names=severity_labels, zero_division=0))


if __name__ == "__main__":
    main()
