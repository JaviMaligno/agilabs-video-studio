#!/usr/bin/env python3
"""Check how many figures a script speaks: `python3 script_lint.py video/<slug>/script.md`.

The narration says the figure that carries each point; the rest of the numbers belong on screen.
This reads the EN narration column of the script table and flags:

- a line that speaks two or more figures when at least one of them is not round (0.51, 47 %, 791);
- a scene that speaks four or more figures across its lines.

Round figures are small counts (up to 12), multiples of 10 (and of 5 up to 100), and halves. Years,
model and version names (GPT-5.6, Opus 5) are not counted. Exit code 1 when something is flagged.
"""
import re
import sys

FIG = re.compile(r'(?<![\w.\-])(\d+(?:[.,]\d+)?)\s?(%|×|x\b)?(?![\w.\-]*\d)')


def figures(text):
    text = re.sub(r'`[^`]*`', '', text)
    out = []
    for m in FIG.finditer(text):
        before = text[max(0, m.start() - 12):m.start()]
        if re.search(r'(GPT|Opus|Sonnet|Haiku|Fable|Gemini|Claude|Llama|Qwen|v)[\s-]?$', before, re.I):
            continue  # a model or version name, not a figure
        if not m.group(2) and re.fullmatch(r'(19|20)\d\d', m.group(1)):
            continue  # a year
        out.append(m.group(0).strip())
    return out


def is_round(fig):
    num = fig.rstrip('%×x ').replace(',', '.')
    try:
        v = float(num)
    except ValueError:
        return True
    if '.' in num:
        return num.endswith('.5') and len(num.split('.')[1]) == 1
    v = int(v)
    return v <= 12 or v % 10 == 0 or (v <= 100 and v % 5 == 0)


def rows(md):
    header = None
    for line in md.splitlines():
        if not line.strip().startswith('|'):
            header = None if not line.strip() else header
            continue
        cells = [c.strip() for c in line.strip().strip('|').split('|')]
        if header is None:
            if any(re.fullmatch(r'EN( line)?', c, re.I) for c in cells):
                header = [c.lower() for c in cells]
            continue
        if set(''.join(cells)) <= set('-: '):
            continue
        row = dict(zip(header, cells))
        en = next((v for k, v in row.items() if re.fullmatch(r'en( line)?', k)), '')
        scene = next((v for k, v in row.items() if k.startswith('scene')), '?')
        yield scene, en


def main(path):
    md = open(path).read()
    issues, per_scene = [], {}
    for scene, en in rows(md):
        figs = figures(en)
        per_scene.setdefault(scene, []).extend(figs)
        if len(figs) >= 2 and not all(is_round(f) for f in figs):
            issues.append(f'scene {scene}: the line speaks {len(figs)} figures ({", ".join(figs)}): say the one that '
                          f'carries the point; give the others in words ("about half", "almost never") or move them to the Visual column. '
                          f'Line: "{en[:90]}"')
    for scene, figs in per_scene.items():
        if len(figs) >= 4:
            issues.append(f'scene {scene}: {len(figs)} figures spoken across its lines ({", ".join(figs)}): keep the one or two '
                          f'that tell the story in the voice and show the rest on screen.')
    for i in issues:
        print(i)
    print(f'{len(issues)} issue(s)' if issues else 'script lint: clean')
    return 1 if issues else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1]))
