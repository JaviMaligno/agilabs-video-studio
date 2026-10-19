// ScopeNote: the spine of "The Definition Looked Complete". Pure state, no Remotion or React.
//
// Two objects share the stage: the ROOM (the repair loop, a walled chamber whose gate is the loop
// condition, with the flag's switch inside and an ANTECHAMBER above the gate for the cases where
// the loop never runs) and the NOTE (a handoff card whose highlighted clause casts a violet
// SHADOW onto the room). The shadow spills over the gate into the antechamber from the first note
// on and never grows; only the missing sentence (scene 12) snaps it back inside the walls.
//
// Coordinates are stage pixels (960 x 1090, origin at the stage's top-left).
import { beatAt, clamp01, easeOutCubic, fit, progress, sceneTime } from './steps.ts';

export type Mode = 'hook' | 'write' | 'room' | 'spill' | 'handoff' | 'reviews' | 'probe' | 'code' | 'verdict' | 'rename' | 'grid' | 'fix';
export type ScopeProps = {
  mode: Mode;
  blend?: boolean;
  titleLine?: boolean;
  /** fix: spoken length (s) of the missing sentence, so the snap-back lands on its last word. */
  sentence?: number;
};

// ---------------------------------------------------------------- geometry

export const W = 960;
export const H = 1090;
/** Monospace glyph width as a fraction of the font size (Menlo / SF Mono). */
export const MONO_W = 0.602;

export const ANTE = { x0: 60, x1: 900, y0: 456, y1: 640 } as const;
export const ROOM = { x0: 120, x1: 840, y0: 640, y1: 1076 } as const;
export const GATE = { x0: 330, x1: 630, y: 640 } as const;
export const SWITCH = { x: 480, y: 800 } as const;

export const CARD = { font: 30, lh: 42, padX: 32, head: 56, padBottom: 22, bracketPad: 12 } as const;
const CARD_MAIN = { x: 40, y: 104, w: 880 };
const CARD_HOOK = { x: 40, y: 190, w: 660 };

export const CODE = { font: 25, lh: 38, padX: 28, padY: 22, x: 0, y: 0, w: W } as const;
export const CODE_LINES = [
  'evidence_capped_failure = False',
  '',
  'while acc < 1.0 and iterations < max_iters:',
  '    # ... infrastructure error handling ...',
  '    feed = [f for f in failures',
  '            if f["source_index"] in allowed_source_indices]',
  '    if not feed:',
  '        evidence_capped_failure = True',
  '        break',
  '    # ... repair and increment iterations ...',
] as const;
export const CODE_H = CODE.padY * 2 + CODE_LINES.length * CODE.lh;

export const FIRST_NOTE = {
  pre: 'An evidence_capped_failure occurs when ',
  hl: 'gate accuracy is below 1.0 but no remaining attributable failure belongs to the allowed set.',
  post: ' It stops refinement immediately.',
};
export const FINAL_NOTE = {
  pre: '',
  hl: 'Gate accuracy below 1.0 with no attributable allowed failure',
  post: ' is evidence_capped_failure and stops refinement.',
};
export const FLAG = 'evidence_capped_failure';
export const RENAMED = 'flag_q7';
/** The missing sentence, verbatim; written into the empty bracket in scene 12. */
export const FIX_LINES = ['This flag can only be set', 'inside the repair loop.'] as const;
export const FIX_EMPHASIS = 'inside the repair loop';

export const REVIEW_LABELS = ['indices', '', '', 'full set', '', '', 'leakage', '', '', '', 'infra error', '', '', '', '', ''];
export const REVIEW = { x0: 70, y0: 456, w: 196, h: 84, gap: 12 } as const;

/** The article's second figure: rows, then GPT's two calls and Claude's two. */
export type Verdict = 'Invalid' | 'Reject' | 'Accept' | 'Context';
export const GRID_ROWS: { label: string; cells: [Verdict, Verdict, Verdict, Verdict] }[] = [
  { label: 'Code, plans and tests', cells: ['Invalid', 'Reject', 'Reject', 'Reject'] },
  { label: 'First note', cells: ['Accept', 'Accept', 'Context', 'Context'] },
  { label: 'Final note', cells: ['Accept', 'Accept', 'Accept', 'Context'] },
  { label: 'Final note, renamed', cells: ['Accept', 'Accept', 'Accept', 'Accept'] },
];

export const PROPOSAL = 'return evidence_capped_failure=True';
export const QUOTE = '“…returning evidence_capped_failure with zero repair iterations preserves the specified behavior.”';
export const TOKEN_LINES = ['2 errors, both outside the allowed set', 'no infra problem', 'max iterations: 0'] as const;

// ---------------------------------------------------------------- text wrap (monospace)

export type Seg = { text: string; hl: boolean };

/** Word-wraps highlighted text into lines of at most `max` characters, keeping runs. */
export const wrap = (segs: Seg[], max: number): Seg[][] => {
  const words: { w: string; hl: boolean }[] = [];
  for (const s of segs) for (const w of s.text.split(' ')) if (w) words.push({ w, hl: s.hl });
  const lines: { w: string; hl: boolean }[][] = [];
  let cur: { w: string; hl: boolean }[] = [];
  let len = 0;
  for (const word of words) {
    const add = (cur.length ? 1 : 0) + word.w.length;
    if (cur.length && len + add > max) {
      lines.push(cur);
      cur = [];
      len = 0;
    }
    len += (cur.length ? 1 : 0) + word.w.length;
    cur.push(word);
  }
  if (cur.length) lines.push(cur);
  return lines.map((ws) => {
    const out: Seg[] = [];
    ws.forEach((word, i) => {
      // The space between two highlighted words is highlighted, so the highlight reads as one run.
      const sp = i === 0 ? '' : ' ';
      const spHl = i > 0 && ws[i - 1].hl && word.hl;
      if (sp) push(out, { text: sp, hl: spHl });
      push(out, { text: word.w, hl: word.hl });
    });
    return out;
  });
};
const push = (out: Seg[], s: Seg) => {
  const last = out.at(-1);
  if (last && last.hl === s.hl) last.text += s.text;
  else out.push({ ...s });
};

/** Keeps only the first `n` characters of wrapped lines (typing). */
const typed = (lines: Seg[][], n: number): Seg[][] => {
  let left = Math.max(0, Math.floor(n));
  return lines.map((line) =>
    line
      .map((s) => {
        const take = Math.min(left, s.text.length);
        left -= take;
        return { text: s.text.slice(0, take), hl: s.hl };
      })
      .filter((s) => s.text.length > 0),
  );
};

const charCount = (lines: Seg[][]) => lines.reduce((a, l) => a + l.reduce((b, s) => b + s.text.length, 0), 0);

/** Deterministic hash in [0, 1). */
const hash = (i: number, k: number) => {
  const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const GLYPHS = 'abcdefghijklmnopqrstuvwxyz_0123456789';

/** `from` turning into `to`, letter by letter, as r goes 0 → 1. */
export const scramble = (from: string, to: string, r: number, tick: number): string => {
  const p = clamp01(r);
  if (p <= 0) return from;
  if (p >= 1) return to;
  const n = Math.round(from.length + (to.length - from.length) * p);
  let out = '';
  for (let i = 0; i < n; i++) {
    if (hash(i, 7) < p) out += to[i] ?? '';
    else out += hash(i, tick) < 0.5 ? (from[i] ?? '') : GLYPHS[Math.floor(hash(i, tick + 3) * GLYPHS.length)];
  }
  return out;
};

const noteSegs = (n: { pre: string; hl: string; post: string }, name = FLAG): Seg[] =>
  [
    { text: n.pre.replace(FLAG, name), hl: false },
    { text: n.hl, hl: true },
    { text: n.post.replace(FLAG, name), hl: false },
  ].filter((s) => s.text.length > 0);

// ---------------------------------------------------------------- state

export type Chip = { label: string; sub: string; x: number; w: number; appear: number; active: number };
export type CardState = {
  opacity: number;
  x: number;
  y: number;
  w: number;
  h: number;
  header: string;
  lines: Seg[][];
  textOpacity: number;
  /** 0 = text, 1 = redacted bars (the reviewer brief, whose text the article does not quote). */
  redacted: number;
  bracket: { appear: number; y: number; h: number; lines: string[]; fill: number };
  /** Highlight box (stage px), the source of the shadow's projection lines. */
  hl: { x0: number; x1: number; y1: number };
  glow: number;
};
export type ScopeState = {
  title: { words: { w: string; lit: number; accent: boolean }[]; opacity: number };
  chips: Chip[];
  chainArrows: number[];
  lostTag: number;
  card: CardState;
  code: { panel: number; lines: { text: string; x: number; y: number; size: number; opacity: number; glow: number; keep: [number, number]; fade: number }[] };
  writer: { appear: number; arrow1: number; fill: number; arrow2: number; reviewer: number };
  room: {
    opacity: number;
    walls: number;
    wallTrace: number;
    gateLabel: string;
    gateLock: number;
    shake: number;
    switchOpacity: number;
    labels: number;
    anteLabel: number;
    traceLabel: number;
    falseTag: number;
    falseLit: number;
  };
  shadow: { appear: number; spill: number; mark: number; dark: number; opacity: number };
  reviews: { opacity: number; mini: boolean; cards: { appear: number; tick: number; label: string }[]; counter: number; counterOpacity: number };
  token: { appear: number; dy: number };
  pills: { code: number; note: number; checked: number };
  proposal: { appear: number; text: string };
  quote: number;
  stamps: { appear: number; who: string; slot: number }[];
  grid: { appear: number; rows: number[]; tag: number };
};

/** Seconds the end of the last narration line sits before the scene end (narrate.ts TAIL). */
const TAIL = 0.8;
const GAP = 0.35;

/** Start and end of line i (end estimated from the next beat or the scene end). */
const lineSpan = (beats: number[], dur: number, i: number): [number, number] => {
  const s = beatAt(beats, i);
  const next = beats[i + 1];
  const e = next !== undefined && Number.isFinite(next) ? next - GAP : Number.isFinite(dur) ? dur - TAIL : s + 2;
  return [s, Math.max(s + 0.4, e)];
};

const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

const cardOf = (
  box: { x: number; y: number; w: number },
  lines: Seg[][],
  o: { header: string; bracket: number; bracketLines?: string[]; fill?: number; opacity?: number; textOpacity?: number; redacted?: number; glow?: number },
): CardState => {
  const textTop = box.y + CARD.head;
  const nLines = lines.length;
  const bracketY = textTop + nLines * CARD.lh + 8;
  const bLines = o.bracketLines ?? [];
  const bH = Math.max(1, bLines.length) * CARD.lh + CARD.bracketPad;
  const bracketVisible = clamp01(o.bracket);
  const bottom = bracketVisible > 0 ? bracketY + bH * 1 : textTop + nLines * CARD.lh;
  const h = bottom - box.y + CARD.padBottom;
  // Highlight box from the wrapped lines.
  const cw = CARD.font * MONO_W;
  let x0 = Infinity;
  let x1 = -Infinity;
  let y1 = textTop + CARD.lh;
  lines.forEach((line, i) => {
    let col = 0;
    for (const s of line) {
      if (s.hl && s.text.trim()) {
        x0 = Math.min(x0, box.x + CARD.padX + col * cw);
        x1 = Math.max(x1, box.x + CARD.padX + (col + s.text.length) * cw);
        y1 = textTop + (i + 1) * CARD.lh;
      }
      col += s.text.length;
    }
  });
  if (!Number.isFinite(x0) || !Number.isFinite(x1)) {
    x0 = box.x + CARD.padX;
    x1 = box.x + box.w - CARD.padX;
  }
  return {
    opacity: clamp01(o.opacity ?? 1),
    x: box.x,
    y: box.y,
    w: box.w,
    h,
    header: o.header,
    lines,
    textOpacity: clamp01(o.textOpacity ?? 1),
    redacted: clamp01(o.redacted ?? 0),
    bracket: { appear: bracketVisible, y: bracketY, h: bH, lines: bLines, fill: clamp01(o.fill ?? 0) },
    hl: { x0, x1, y1 },
    glow: clamp01(o.glow ?? 0),
  };
};

const cplOf = (w: number) => Math.floor((w - 2 * CARD.padX) / (CARD.font * MONO_W));

export const FIRST_LINES = wrap(noteSegs(FIRST_NOTE), cplOf(CARD_MAIN.w));
export const FINAL_LINES = wrap(noteSegs(FINAL_NOTE), cplOf(CARD_MAIN.w));
export const HOOK_LINES = wrap(noteSegs(FINAL_NOTE), cplOf(CARD_HOOK.w));

const chip = (label: string, sub: string, slot: number, appear: number, active = 0): Chip => ({
  label,
  sub,
  x: slot * 332,
  w: 296,
  appear: clamp01(appear),
  active: clamp01(active),
});

const ROOM_BASE: ScopeState['room'] = {
  opacity: 1,
  walls: 1,
  wallTrace: 1,
  gateLabel: 'iterations < max_iters',
  gateLock: 0,
  shake: 0,
  switchOpacity: 1,
  labels: 1,
  anteLabel: 1,
  traceLabel: 0,
  falseTag: 1,
  falseLit: 0,
};

const base = (): ScopeState => ({
  title: { words: [], opacity: 0 },
  chips: [],
  chainArrows: [],
  lostTag: 0,
  card: cardOf(CARD_MAIN, FINAL_LINES, { header: 'final note', bracket: 1, opacity: 0 }),
  code: { panel: 0, lines: [] },
  writer: { appear: 0, arrow1: 0, fill: 0, arrow2: 0, reviewer: 0 },
  room: { ...ROOM_BASE },
  shadow: { appear: 1, spill: 1, mark: 0, dark: 0, opacity: 1 },
  reviews: { opacity: 0, mini: false, cards: [], counter: 0, counterOpacity: 0 },
  token: { appear: 0, dy: 0 },
  pills: { code: 0, note: 0, checked: 0 },
  proposal: { appear: 0, text: PROPOSAL },
  quote: 0,
  stamps: [],
  grid: { appear: 0, rows: GRID_ROWS.map(() => 0), tag: 0 },
});

const HOOK_TITLE = ['This', 'note', 'supported', '16', 'correct', 'reviews.'];

/** Where each code line goes when the panel folds into the room (scene 3). */
// `keep` is the part of the line that becomes the room element; the rest fades while it moves.
const mw = (size: number) => size * MONO_W;
export const GATE_PILL = { y: ROOM.y0 + 36, size: 24 } as const;
export const SWITCH_LABEL = { y: SWITCH.y + 52, size: 26 } as const;
export const FALSE_TAG = { x: 132, y: 584, w: 170, h: 46, size: 26 } as const;
const CODE_TARGETS: Record<number, { x: number; y: number; size: number; keep: [number, number] }> = {
  0: { x: FALSE_TAG.x + (FALSE_TAG.w - 7 * mw(26)) / 2 - 24 * mw(26), y: FALSE_TAG.y + 5, size: 26, keep: [24, 31] },
  2: { x: W / 2 - (22 * mw(24)) / 2 - 20 * mw(24), y: GATE_PILL.y - 17, size: 24, keep: [20, 42] },
  7: { x: W / 2 - (30 * mw(26)) / 2 - 8 * mw(26), y: SWITCH_LABEL.y - 16, size: 26, keep: [8, 38] },
};

const codeLineBase = (i: number) => ({ x: CODE.x + CODE.padX, y: CODE.y + CODE.padY + i * CODE.lh, size: CODE.font });

export function frameState(props: ScopeProps, t: number, beats: number[], dur: number): ScopeState {
  const T = sceneTime(t, dur);
  const s = base();
  const b0 = beatAt(beats, 0);
  /** Progress of an animation of `len` s that starts `off` s after `from`, fitted into the scene. */
  const pr = (from: number, off: number, len: number) => progress(T, fit(from + off, len, dur), len);
  const ease = (from: number, off: number, len: number) => easeOutCubic(pr(from, off, len));

  switch (props.mode) {
    case 'hook': {
      const [l0s, l0e] = lineSpan(beats, dur, 0);
      const b1 = beats[1] !== undefined && Number.isFinite(beats[1]) ? beats[1] : l0e + GAP;
      s.title = {
        opacity: 1,
        words: HOOK_TITLE.map((w, i) => ({
          w,
          accent: w === '16',
          lit: progress(T, l0s + ((l0e - l0s) * i) / HOOK_TITLE.length, 0.25),
        })),
      };
      s.card = cardOf(CARD_HOOK, HOOK_LINES, { header: 'final note', bracket: 0 });
      s.reviews = {
        opacity: 1,
        mini: true,
        cards: REVIEW_LABELS.map((label, i) => ({ appear: pr(0, 0.1 + i * 0.13, 0.2), tick: pr(0, 0.25 + i * 0.13, 0.2), label })),
        counter: Math.round(16 * pr(0, 0.1, 16 * 0.13 + 0.2)),
        counterOpacity: 1,
      };
      s.room = { ...ROOM_BASE, gateLabel: '', labels: 1, anteLabel: pr(b1, 0.2, 0.5), falseTag: 0, wallTrace: 1, walls: 0.85 };
      s.shadow = { appear: 1, spill: easeOutCubic(pr(0, 0.3, 2.3)), mark: pr(b1, 0.3, 0.6), dark: 0, opacity: 1 };
      break;
    }
    case 'write': {
      s.shadow = { appear: 0, spill: 0, mark: 0, dark: 0, opacity: 0 };
      s.room = { ...ROOM_BASE, opacity: 0 };
      s.code = {
        panel: ease(b0, -0.1, 0.4),
        lines: CODE_LINES.map((text, i) => ({ text, ...codeLineBase(i), opacity: pr(b0, i * 0.05, 0.3), glow: 0, keep: [0, text.length] as [number, number], fade: 0 })),
      };
      s.writer = {
        appear: ease(b0, 0.5, 0.4),
        arrow1: ease(b0, 0.9, 0.5),
        fill: pr(b0, 1.3, 1.4),
        arrow2: ease(b0, 2.6, 0.5),
        reviewer: ease(b0, 2.9, 0.4),
      };
      break;
    }
    case 'room': {
      const glow = ease(b0, 0.1, 0.5);
      const morph = easeOutCubic(pr(b0, 0.9, 1.1));
      s.shadow = { appear: 0, spill: 0, mark: 0, dark: 0, opacity: 0 };
      s.code = {
        panel: 1 - pr(b0, 0.8, 0.6),
        lines: CODE_LINES.map((text, i) => {
          const from = codeLineBase(i);
          const to = CODE_TARGETS[i];
          if (!to) return { text, ...from, opacity: 1 - pr(b0, 0.7, 0.4), glow: 0, keep: [0, text.length] as [number, number], fade: 0 };
          return {
            text,
            x: lerp(from.x, to.x, morph),
            y: lerp(from.y, to.y, morph),
            size: lerp(from.size, to.size, morph),
            opacity: 1 - pr(b0, 1.9, 0.3),
            glow,
            keep: to.keep,
            fade: morph,
          };
        }),
      };
      // Walls rise while the code fragments are still landing, so the stage is never empty.
      const walls = ease(b0, 1.3, 0.4);
      s.room = {
        ...ROOM_BASE,
        walls,
        wallTrace: pr(b0, 1.4, 1.0),
        labels: walls,
        anteLabel: ease(b0, 2.4, 0.4),
        traceLabel: ease(b0, 2.6, 0.4),
        // The morphing code text becomes these labels: they cross-fade as it fades (no double text).
        falseTag: ease(b0, 1.9, 0.3),
        switchOpacity: ease(b0, 1.9, 0.3),
      };
      break;
    }
    case 'spill': {
      const slide = ease(b0, 0, 0.5);
      const card = cardOf(CARD_MAIN, typed(FIRST_LINES, charCount(FIRST_LINES) * pr(b0, 0.3, 1.6)), {
        header: 'first note',
        bracket: pr(b0, 1.9, 0.4),
        opacity: slide,
      });
      card.y -= (1 - slide) * 40;
      // The highlight box is that of the full text, so the shadow does not jump while it types.
      card.hl = cardOf(CARD_MAIN, FIRST_LINES, { header: '', bracket: 0 }).hl;
      card.glow = pr(b0, 1.6, 0.4);
      s.card = card;
      s.chips = [chip('GPT', 'first note', 0, ease(b0, 0, 0.4), 1)];
      s.room = { ...ROOM_BASE, traceLabel: 1 };
      s.shadow = { appear: ease(b0, 1.7, 0.5), spill: easeOutCubic(pr(b0, 2.3, 1.1)), mark: 0, dark: 0, opacity: 1 };
      break;
    }
    case 'handoff': {
      const b1 = beats[1] !== undefined && Number.isFinite(beats[1]) ? beats[1] : b0 + 3;
      const h1 = pr(b1, 0.05, 0.35);
      const h2 = pr(b1, 1.0, 0.35);
      s.chips = [
        chip('GPT', 'first note', 0, 1, 1 - h1),
        chip('Claude', 'reviewer brief', 1, ease(b1, -0.2, 0.3), h1 * (1 - h2)),
        chip('GPT', 'final note', 2, ease(b1, 0.75, 0.3), h2),
      ];
      s.chainArrows = [ease(b1, -0.25, 0.3), ease(b1, 0.7, 0.3)];
      s.lostTag = ease(b0, 0.8, 0.4);
      const first = cardOf(CARD_MAIN, FIRST_LINES, { header: 'first note', bracket: 1, glow: pr(b0, 0.8, 0.5) });
      // Reviewer brief: its text is not quoted in the article, so it is drawn as bars.
      const brief = cardOf(CARD_MAIN, FIRST_LINES.slice(0, 3), { header: 'reviewer brief', bracket: 1, redacted: 1 });
      const fin = cardOf(CARD_MAIN, FINAL_LINES, { header: 'final note', bracket: 1 });
      const pick = h2 > 0 ? fin : h1 > 0 ? brief : first;
      const swap = h2 > 0 ? h2 : h1;
      const prev = h2 > 0 ? brief : first;
      s.card = {
        ...pick,
        h: lerp(prev.h, pick.h, easeOutCubic(swap)),
        textOpacity: swap < 1 ? Math.abs(swap - 0.5) * 2 : 1,
        lines: swap < 0.5 && (h1 > 0 || h2 > 0) ? prev.lines : pick.lines,
        redacted: swap < 0.5 && (h1 > 0 || h2 > 0) ? prev.redacted : pick.redacted,
        header: swap < 0.5 && (h1 > 0 || h2 > 0) ? prev.header : pick.header,
        bracket: { ...pick.bracket, y: lerp(prev.bracket.y, pick.bracket.y, easeOutCubic(swap)) },
        glow: pick === first ? first.glow : 0,
      };
      s.room = { ...ROOM_BASE, traceLabel: 1 };
      break;
    }
    case 'reviews': {
      s.card = cardOf(CARD_MAIN, FINAL_LINES, { header: 'final note', bracket: 1 });
      s.chips = [
        chip('GPT-5.6 Sol', 'model', 0, ease(b0, 0, 0.4)),
        chip('Claude Opus 5', 'model', 1, ease(b0, 0.1, 0.4)),
        chip('×2 runs', 'each', 2, ease(b0, 0.2, 0.4)),
      ];
      const dim = ease(b0, 0, 0.5);
      s.room = { ...ROOM_BASE, opacity: 1 - 0.65 * dim, traceLabel: 1 - dim, labels: 1 - dim, switchOpacity: 1 - dim, anteLabel: 1 - dim, falseTag: 1 - dim };
      s.shadow = { appear: 1, spill: 1, mark: 0, dark: 0, opacity: 1 - 0.35 * dim };
      s.reviews = {
        opacity: 1,
        mini: false,
        cards: REVIEW_LABELS.map((label, i) => ({ appear: ease(b0, 0.3 + i * 0.14, 0.25), tick: ease(b0, 0.45 + i * 0.14, 0.2), label })),
        counter: Math.round(16 * pr(b0, 0.45, 15 * 0.14 + 0.2)),
        counterOpacity: ease(b0, 0.4, 0.3),
      };
      break;
    }
    case 'probe': {
      const [ls, le] = lineSpan(beats, dur, 0);
      const colon = ls + (le - ls) * 0.64;
      s.card = cardOf(CARD_MAIN, FINAL_LINES, { header: 'final note', bracket: 1 });
      const drop = pr(b0, 0.5, 0.7);
      s.token = { appear: ease(b0, 0.4, 0.3), dy: -260 * (1 - easeOutCubic(drop)) + 14 * Math.sin(Math.PI * pr(b0, 1.2, 0.3)) };
      const lock = pr(colon, 0, 0.5);
      s.room = { ...ROOM_BASE, gateLabel: lock > 0.5 ? 'iterations < 0' : 'iterations < max_iters', gateLock: lock };
      break;
    }
    case 'code': {
      s.card = cardOf(CARD_MAIN, FINAL_LINES, { header: 'final note', bracket: 1 });
      const press = pr(b0, 0.2, 0.6);
      s.token = { appear: 1, dy: 22 * Math.sin(Math.PI * press) };
      s.room = {
        ...ROOM_BASE,
        gateLabel: 'iterations < 0',
        gateLock: 1,
        shake: Math.sin(Math.PI * pr(b0, 0.45, 0.35)),
        switchOpacity: 1 - 0.65 * pr(b0, 0.8, 0.5),
        falseLit: ease(b0, 1.1, 0.4),
      };
      s.pills = { code: ease(b0, 1.4, 0.4), note: 0, checked: ease(b0, 2.0, 0.4) };
      break;
    }
    case 'verdict': {
      s.card = cardOf(CARD_MAIN, FINAL_LINES, { header: 'final note', bracket: 1, glow: 0.4 + 0.6 * pr(b0, 2.0, 0.5) });
      s.token = { appear: 1, dy: 0 };
      s.chips = [chip('GPT-5.6 Sol', '×2 runs', 0, ease(b0, 0.3, 0.4), 1)];
      s.room = { ...ROOM_BASE, gateLabel: 'iterations < 0', gateLock: 1, switchOpacity: 0.35 * (1 - pr(b0, 0.2, 0.4)), falseLit: 1 };
      s.pills = { code: 1, note: ease(b0, 0.1, 0.4), checked: 1 - pr(b0, 0, 0.3) };
      s.proposal = { appear: ease(b0, 0.4, 0.4), text: PROPOSAL };
      s.stamps = [
        { appear: ease(b0, 1.0, 0.3), who: 'GPT', slot: 0 },
        { appear: ease(b0, 1.35, 0.3), who: 'GPT', slot: 1 },
      ];
      s.quote = ease(b0, 1.7, 0.5);
      break;
    }
    case 'rename': {
      const r = pr(b0, 0.15, 1.1);
      const name = scramble(FLAG, RENAMED, r, Math.floor(T * 18));
      s.card = cardOf(CARD_MAIN, wrap(noteSegs(FINAL_NOTE, name), cplOf(CARD_MAIN.w)), { header: r >= 1 ? 'final note, renamed' : 'final note', bracket: 1, glow: 0.4 });
      // Hold the highlight box (the shadow) exactly where it was: the rename moves no pixel of it.
      s.card.hl = cardOf(CARD_MAIN, FINAL_LINES, { header: '', bracket: 1 }).hl;
      s.token = { appear: 1, dy: 0 };
      s.chips = [chip('GPT-5.6 Sol', '×2 runs', 0, 1, 1), chip('Claude Opus 5', '×2 runs', 1, ease(b0, 0.9, 0.4), 1)];
      s.room = { ...ROOM_BASE, gateLabel: 'iterations < 0', gateLock: 1, switchOpacity: 0, falseLit: 1 };
      s.pills = { code: 1, note: 1, checked: 0 };
      s.proposal = { appear: 1, text: `return ${name}=True` };
      s.quote = 1 - pr(b0, 0, 0.3);
      const out = pr(b0, 0.1, 0.3);
      s.stamps = [
        { appear: Math.max(1 - out, ease(b0, 1.3, 0.3)), who: 'GPT', slot: 0 },
        { appear: Math.max(1 - out, ease(b0, 1.5, 0.3)), who: 'GPT', slot: 1 },
        { appear: ease(b0, 1.75, 0.3), who: 'Claude', slot: 2 },
        { appear: ease(b0, 1.95, 0.3), who: 'Claude', slot: 3 },
      ];
      break;
    }
    case 'grid': {
      s.card = cardOf(CARD_MAIN, FINAL_LINES, { header: 'final note', bracket: 1 });
      s.token = { appear: 1, dy: 0 };
      s.room = { ...ROOM_BASE, gateLabel: 'iterations < 0', gateLock: 1, switchOpacity: 0, falseLit: 1 };
      s.grid = {
        appear: ease(b0, -0.1, 0.4),
        rows: GRID_ROWS.map((_, i) => ease(b0, 0.15 + i * 0.35, 0.3)),
        tag: ease(b0, 1.7, 0.4),
      };
      break;
    }
    case 'fix': {
      const [l1s, spanEnd] = lineSpan(beats, dur, 1);
      // The sentence's real end when known (the scene's end is a hold, not speech): the bracket
      // fills while it is spoken and the shadow snaps back on its last word, not a second later.
      const l1e = props.sentence && props.sentence > 0 ? l1s + props.sentence : spanEnd;
      const fill = pr(l1s, 0, Math.max(0.6, (l1e - l1s) * 0.9));
      const snap = easeOutCubic(pr(l1s, Math.max(0.4, l1e - l1s - 0.2), 0.5));
      s.card = cardOf(CARD_MAIN, FINAL_LINES, { header: 'final note', bracket: 1, bracketLines: [...FIX_LINES], fill, glow: pr(b0, 0.2, 0.4) * (1 - snap) });
      // Before the sentence starts, the bracket is the one-line empty box of the earlier scenes.
      if (fill <= 0) s.card = cardOf(CARD_MAIN, FINAL_LINES, { header: 'final note', bracket: 1, glow: pr(b0, 0.2, 0.4) });
      else {
        const grow = easeOutCubic(pr(l1s, 0, 0.3));
        const one = cardOf(CARD_MAIN, FINAL_LINES, { header: 'final note', bracket: 1 });
        s.card.h = lerp(one.h, s.card.h, grow);
        s.card.bracket.h = lerp(one.bracket.h, s.card.bracket.h, grow);
      }
      s.token = { appear: 1, dy: 0 };
      s.room = { ...ROOM_BASE, gateLabel: 'iterations < 0', gateLock: 1, switchOpacity: 1, traceLabel: snap };
      s.shadow = { appear: 1, spill: 1 - snap, mark: 0, dark: snap, opacity: 1 };
      break;
    }
  }
  return s;
}

/** Whether the shadow's pool covers the antechamber (where the probe token sits). */
export const poolTop = (spill: number) => ROOM.y0 - clamp01(spill) * (ROOM.y0 - ANTE.y0);
