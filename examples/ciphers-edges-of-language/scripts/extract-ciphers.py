"""Encode one real task of llm-language-limits in all ten ciphers and write it as JSON.

Run: PYTHONPATH=<llm-language-limits>/src python3 scripts/extract-ciphers.py [--out src/data/ciphers.json]

Uses the repo's own `make_ciphers(seed=0)` and the task "name the capital of france" from
`oracle.py`'s task bank. The seed of the published runs was not checked, so the keyed strings
(random substitution, block permutation) are real outputs of the cipher code but not
necessarily the experiment's exact key: illustrative, as the video's fact-check says.
"""
import argparse, json
from pathlib import Path
from llm_language_limits.ciphers import make_ciphers

TASK = "name the capital of france"
# Rosetta-stone pairs: short words, encoded with the same keyed substitution.
PAIRS = ["the city", "of rome", "a capital"]

ap = argparse.ArgumentParser()
ap.add_argument("--out", default="src/data/ciphers.json")
a = ap.parse_args()
cs = make_ciphers(0)
out = {
    "plain": TASK,
    "ciphers": {name: c.encode(TASK) for name, c in cs.items()},
    "rosetta": [[p, cs["random_substitution"].encode(p)] for p in PAIRS],
}
Path(a.out).write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n")
print(json.dumps(out, ensure_ascii=False, indent=2))
