"""Exports the article's centred prime sum for the PrimeCurve scene: src/data/prime-curve.json.

Same computation as personal-website/scripts/figures/riemann-centred-prime-sum.py (the figure in
the article): r(y) = (G(y) - log 2pi) / sqrt(y), y from 10 to 1e7, band +-(2 + gamma - log 4pi).
Kept: 2,000 points on a log grid, each the value at that y (no smoothing), plus the exact
max/min over the full 60,000-point grid. Run: python3 scripts/prime-curve.py
"""
import json
import math
from pathlib import Path

import numpy as np

N = 10_000_000
GAMMA = 0.5772156649015329
BAND = 2 + GAMMA - math.log(4 * math.pi)

sieve = np.ones(N + 1, dtype=bool)
sieve[:2] = False
for p in range(2, int(N**0.5) + 1):
    if sieve[p]:
        sieve[p * p :: p] = False
lam = np.zeros(N + 1)
for p in np.nonzero(sieve)[0]:
    lp, q = math.log(p), int(p)
    while q <= N:
        lam[q] = lp
        q *= int(p)
n = np.arange(N + 1, dtype=np.float64)
n[0] = 1.0
psi, harm = np.cumsum(lam), np.cumsum(lam / n)

def r(ys):
    k = np.floor(ys).astype(int)
    G = ys * harm[k] - psi[k] - ys * (np.log(ys) - 1 - GAMMA)
    return (G - math.log(2 * math.pi)) / np.sqrt(ys)

full = np.unique(np.concatenate([np.arange(10, 2000), np.logspace(math.log10(2000), 7, 60000)]))
rf = r(full)
ys = np.logspace(1, 7, 2000)
out = {
    "band": round(BAND, 4),
    "max": round(float(rf.max()), 4),
    "min": round(float(rf.min()), 4),
    "argmax": float(full[rf.argmax()]),
    "points": [[round(math.log10(y), 5), round(float(v), 5)] for y, v in zip(ys, r(ys))],
}
Path("src/data/prime-curve.json").write_text(json.dumps(out, separators=(",", ":")))
print("band", out["band"], "max", out["max"], "min", out["min"], "argmax", out["argmax"])
