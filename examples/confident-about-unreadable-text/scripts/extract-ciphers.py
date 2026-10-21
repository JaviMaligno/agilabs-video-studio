"""Encode the video's two real tasks of llm-language-limits with the repo's own cipher code.

Run: PYTHONPATH=<llm-language-limits>/src python3 scripts/extract-ciphers.py [--out src/data/ciphers.json]

- "reply with the single word banana": the article's base64 hook, plus the ten-cipher ladder.
- "what is seven plus five": the mimicry task card (one of the article's example tasks).
- The base model's "fluent cipher" reply is ILLUSTRATIVE: a neutral stock sentence re-encoded
  with the same cipher code, not a model output (those are not in the committed data).
Keyed strings use make_ciphers(seed=0): real outputs of the cipher code, not necessarily the
experiment's exact key.
"""
import argparse, json
from pathlib import Path
from llm_language_limits.ciphers import make_ciphers

BANANA = "reply with the single word banana"
TASK = "what is seven plus five"
MIMIC = "the answer to that is in the next line"
ROWS = ["binary", "cyrillic_homoglyph", "block_permutation"]

ap = argparse.ArgumentParser()
ap.add_argument("--out", default="src/data/ciphers.json")
a = ap.parse_args()
cs = make_ciphers(0)
out = {
    "plain": BANANA,
    "ciphers": {name: c.encode(BANANA) for name, c in cs.items()},
    "rosetta": [],
    "task": {"plain": TASK, "ciphers": {k: cs[k].encode(TASK) for k in ROWS}},
    "mimic": {k: cs[k].encode(MIMIC) for k in ROWS},
}
Path(a.out).write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n")
print(json.dumps(out, ensure_ascii=False, indent=2))
