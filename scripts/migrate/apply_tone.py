"""Add per-line tones and the `excited` default emotion to videos made from an older template.

Usage: python3 scripts/migrate/apply_tone.py <video_dir> [<video_dir> ...]
Copies the template's TTS scripts, adds `emotion` (and `colonsAsStops` when missing) to
video.config.mjs, and the `tone` field to src/types.ts and src/narrate.ts. Idempotent.
"""
import pathlib, shutil, sys, re
T = pathlib.Path(__file__).resolve().parents[2] / 'template'
for d in map(pathlib.Path, sys.argv[1:]):
    cfg = d/'video.config.mjs'; c = cfg.read_text()
    had_colons = 'colonsAsStops' in c
    for f in ['scripts/tts.ts', 'scripts/tts-engine.mjs']:
        shutil.copy(T/f, d/f)
    if "emotion:" not in c:
        add = "    emotion: 'excited', // default Cartesia emotion (EN); a line overrides it with its tone\n"
        if not had_colons:
            add += "    colonsAsStops: true, // voice a colon inside a line as a full stop\n"
        c = re.sub(r"(\n    speed: [0-9.]+,\n)", lambda m: m.group(1) + add, c, count=1)
        assert "emotion:" in c, cfg
        cfg.write_text(c)
    t = d/'src/types.ts'; s = t.read_text()
    if 'type Tone' not in s:
        old = "spoken?: Partial<Text> };"
        assert old in s, t
        s = s.replace(old, "spoken?: Partial<Text>; tone?: Tone };\n\n/** How one line is voiced when it departs from the config's default (Cartesia only). */\nexport type Tone = { emotion?: string; speed?: number };", 1)
        t.write_text(s)
    n = d/'src/narrate.ts'; s = n.read_text()
    if 'tone?: Tone' not in s:
        s = s.replace("type Text } from './types.ts';", "type Text, type Tone } from './types.ts';", 1)
        old = """export type Spec = { at: number; en: string; es: string; spoken?: Partial<Text> };
export const say = (at: number, en: string, es: string, spoken?: Partial<Text>): Spec =>
  spoken ? { at, en, es, spoken } : { at, en, es };"""
        assert old in s, n
        s = s.replace(old, """export type Spec = { at: number; en: string; es: string; spoken?: Partial<Text>; tone?: Tone };
export const say = (at: number, en: string, es: string, spoken?: Partial<Text>, tone?: Tone): Spec => ({
  at,
  en,
  es,
  ...(spoken ? { spoken } : {}),
  ...(tone ? { tone } : {}),
});""")
        old = "...(spec.spoken ? { spoken: spec.spoken } : {}) });"
        assert old in s, n
        s = s.replace(old, "...(spec.spoken ? { spoken: spec.spoken } : {}), ...(spec.tone ? { tone: spec.tone } : {}) });")
        assert 'type Tone }' in s, n
        n.write_text(s)
    print('ok', d, 'colons' if had_colons else 'no-colons')
