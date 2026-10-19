"""Build src/data/laya-curves.json for the LossMonitor scenes.

- CONTROL / TAKEOFF / LATE / FLAT: per-epoch training cross-entropy, copied verbatim from the
  article's figure script (personal-website, origin/blog/sport-from-motion-laya,
  scripts/blog/sport-from-motion-laya-figures.py), which took them from the Kaggle logs.
- wall: the 15 `motion` runs of the main configuration (seeds 0-2 x splits 0-4). Local Kaggle
  logs are truncated, so each mini trace is the running minimum of the per-epoch calibration
  cross-entropy (info.json `calib_curve`): an illustration of "left chance or not", not a plot.
  `learned` follows the article's seeds figure (9 teal, 6 rose).

Run: python3 scripts/extract-laya-curves.py <sport-from-motion repo> <figures.py>
"""
import ast
import json
import sys
from pathlib import Path

repo, figs = Path(sys.argv[1]), Path(sys.argv[2])
src = figs.read_text()
arrays = {}
for node in ast.parse(src).body:
    if isinstance(node, ast.Assign) and isinstance(node.targets[0], ast.Name) and node.targets[0].id in {'CONTROL', 'TAKEOFF', 'LATE', 'FLAT', 'GRID', 'EPOCH'}:
        # Plain literals and list arithmetic only (CONTROL is `[...] + [0.0] * 22`); no names or calls.
        arrays[node.targets[0].id] = eval(compile(ast.Expression(node.value), str(figs), 'eval'), {'__builtins__': {}})

wall = []
for s in range(3):
    row = []
    for f in range(5):
        info = json.loads((repo / f'runs/laya/es-s{s}/out/laya-ft-es-s{s}__motion__fold{f}.info.json').read_text())
        cur, trace = 9.0, []
        for e in info['calib_curve']:
            cur = min(cur, e['calib_ce'])
            trace.append(round(cur, 3))
        # Article seeds figure: seeds 0 and 1 learn in splits 1-4; seed 2 only in split 5.
        learned = (s < 2 and f < 4) or (s == 2 and f == 4)
        row.append({'seed': s, 'split': f + 1, 'learned': learned, 'trace': trace})
    wall.append(row)

out = {k: arrays[k] for k in ('CONTROL', 'TAKEOFF', 'LATE', 'FLAT')}
out['chance'] = 1.386
out['wall'] = wall
Path(__file__).resolve().parents[1].joinpath('src/data/laya-curves.json').write_text(json.dumps(out) + '\n')
print('learned', sum(c['learned'] for r in wall for c in r), 'of', sum(len(r) for r in wall))
