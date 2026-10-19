#!/usr/bin/env python3
"""Extract the real model replies shown on screen from llm-language-limits/data/full.jsonl.

Usage: python3 scripts/extract-replies.py [path/to/full.jsonl]
Writes public/replies.json (committed); the jsonl itself stays in the experiment repo.
"""
import json
import os
import sys

SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser('~/Documents/repos/llm-language-limits/data/full.jsonl')
ROWS = [json.loads(l) for l in open(SRC)]


def pick(model, category, mode, n, replicate):
    for r in ROWS:
        if (r['model'], r['category'], r['mode'], r['n'], r['replicate']) == (model, category, mode, n, replicate):
            return r
    raise SystemExit(f'missing {model} {category} {mode} n={n} rep={replicate}')


def cell(r):
    return {k: r[k] for k in ('model', 'category', 'mode', 'n', 'replicate', 'repetition_ratio')} | {'text': r['text']}


# The cells the approved script names (script.md, build notes): last turn of each conversation.
flat = [pick('claude-sonnet', 'answerable_question', 'multi', n, rep) for n, rep in ((1, 0), (3, 0), (10, 0), (30, 1), (1000, 2))]
out = {
    'flat': [cell(r) for r in flat],
    'hello3': cell(pick('claude-sonnet', 'greeting', 'multi', 3, 2)),
    'burst': cell(pick('claude-opus', 'answerable_question', 'multi', 30, 0)),
    'baseTable': cell(pick('qwen7b-base', 'single_word', 'single', 10, 0)),
    'baseUseless': cell(pick('qwen7b-base', 'insult', 'single', 3, 0)),
    'baseFlorb': cell(pick('qwen7b-base', 'gibberish', 'single', 10, 0)),
}
here = os.path.dirname(os.path.abspath(__file__))
dst = os.path.join(here, '..', 'public', 'replies.json')
json.dump(out, open(dst, 'w'), ensure_ascii=False, indent=1)
print(json.dumps(out, ensure_ascii=False, indent=1))
