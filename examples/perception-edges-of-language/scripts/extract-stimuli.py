"""Writes the study's stimuli into public/stim/, rendered with the experiment's own code.

Run from the experiment repo's environment:
  uv run --project ~/Documents/repos/llm-language-limits python scripts/extract-stimuli.py

- <name>-mask.png: the full-contrast render (768x192, DejaVu Sans 32 px) as an alpha mask
  (alpha = 255 - L), so the video can fill the glyphs with any grey per frame.
- contrast-<ratio>.png: the seven contrast renders, as the study rendered them (reference).
- lens.json: a 16x12 pixel crop of the 0.004 render (values 254/255) around a glyph edge.
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

from llm_language_limits import render as R

OUT = Path(__file__).resolve().parents[1] / "public/stim"
OUT.mkdir(parents=True, exist_ok=True)

SENTENCE = "nibide lilo meso dazi bozoro 618 tedi ritode"
VISIBLE = "name the capital of france"
HIDDEN = "reply with the name of the long yellow fruit"
NONSENSE = "nibide lilo meso dazi"


def mask(text: str, name: str) -> dict:
    img = R._draw_text(R.load_manifest()["font_size_base"], text, 0)
    a = 255 - np.asarray(img, dtype=np.uint8)
    rgba = np.zeros((*a.shape, 4), dtype=np.uint8)
    rgba[..., 3] = a
    Image.fromarray(rgba, mode="RGBA").save(OUT / f"{name}-mask.png")
    cols = np.where(a.max(axis=0) > 0)[0]
    return {"name": name, "text": text, "x0": int(cols.min()), "x1": int(cols.max()), "width": R.text_width(text)}


info = {"canvas": list(R.CANVAS), "masks": [mask(SENTENCE, "sentence"), mask(VISIBLE, "visible"), mask(HIDDEN, "hidden"), mask(NONSENSE, "nonsense")]}

levels = R.family_levels("contrast")
for i, ratio in enumerate(levels):
    img = R.render(SENTENCE, "contrast", i)
    img.save(OUT / f"contrast-{ratio}.png")
    arr = np.asarray(img)
    info.setdefault("contrast", []).append({"ratio": ratio, "min": int(arr.min()), "max": int(arr.max())})

floor = np.asarray(R.render(SENTENCE, "contrast", len(levels) - 1), dtype=int)
# A crop over the first glyph's stem ("n" of nibide): find the first dark column.
ys, xs = np.where(floor < 255)
x0 = int(xs.min()) - 2
first = floor[:, x0:x0 + 16]
y0 = int(np.where(first.min(axis=1) < 255)[0].min()) - 1
crop = floor[y0:y0 + 12, x0:x0 + 16]
info["lens"] = {"x0": x0, "y0": y0, "cells": crop.tolist()}
(OUT / "lens.json").write_text(json.dumps(info["lens"]))
(OUT / "info.json").write_text(json.dumps(info, indent=1))
print(json.dumps({k: v for k, v in info.items() if k != "lens"}, indent=1))
print("lens crop:")
for row in crop:
    print(" ".join(str(v) for v in row))
