from __future__ import annotations

import re
from collections import Counter
from typing import Iterable

import torch
from torch import nn

TOKEN_RE = re.compile(r"[\w']+", flags=re.UNICODE)
PAD_TOKEN = "<PAD>"
UNK_TOKEN = "<UNK>"


def tokenize(text: str) -> list[str]:
    return TOKEN_RE.findall(text.lower())


def build_vocab(texts: Iterable[str], max_tokens: int = 30000, min_freq: int = 2) -> dict[str, int]:
    counter: Counter[str] = Counter()
    for text in texts:
        counter.update(tokenize(str(text)))

    vocab = {PAD_TOKEN: 0, UNK_TOKEN: 1}
    for token, count in counter.most_common(max_tokens - len(vocab)):
        if count < min_freq:
            break
        vocab[token] = len(vocab)
    return vocab


def encode_text(text: str, vocab: dict[str, int], max_len: int) -> list[int]:
    unk = vocab[UNK_TOKEN]
    ids = [vocab.get(token, unk) for token in tokenize(text)][:max_len]
    return ids + [vocab[PAD_TOKEN]] * (max_len - len(ids))


class HarassmentBiLSTM(nn.Module):
    def __init__(
        self,
        vocab_size: int,
        num_types: int,
        num_severities: int,
        embedding_dim: int = 128,
        hidden_dim: int = 96,
        dropout: float = 0.4,
    ):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embedding_dim, padding_idx=0)
        self.bilstm = nn.LSTM(
            embedding_dim,
            hidden_dim,
            batch_first=True,
            bidirectional=True,
        )
        self.shared = nn.Sequential(
            nn.Linear(hidden_dim * 2, 128),
            nn.ReLU(),
            nn.Dropout(dropout),
        )
        self.type_head = nn.Linear(128, num_types)
        self.severity_head = nn.Linear(128, num_severities)

    def forward(self, input_ids: torch.Tensor):
        mask = input_ids.ne(0)
        embedded = self.embedding(input_ids)
        sequence, _ = self.bilstm(embedded)

        # Mask padding before max pooling across the sequence.
        sequence = sequence.masked_fill(~mask.unsqueeze(-1), float("-inf"))
        pooled = sequence.max(dim=1).values
        pooled = torch.nan_to_num(pooled, neginf=0.0)

        shared = self.shared(pooled)
        return self.type_head(shared), self.severity_head(shared)
