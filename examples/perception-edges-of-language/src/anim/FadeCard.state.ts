// Pure state of the FadeCard scenes: the study's white stimulus card with the sentence set large
// on two lines, every letter carrying its own ink grey; a log ruler of ink greys with a marker,
// and the row of readers whose transcription lines type, smudge or go blank. Illustrative of the
// article's thresholds; the greys follow the study's formula. No Remotion or React here.
//
// Two moments are built for the eye, because H.264 flattens greys 250-254 to white:
// - hook: every letter fades at once along a perceptual curve (most of the time in 0..235,
//   only the last stretch runs 235 → 254);
// - roster: a horizontal contrast ramp sweeps across the letters, the sentence appears from
//   invisible to black, breathes back to a left-dark / right-invisible gradient, and returns.
// Past the visible range (ladder → read) a small "stretched" glyph next to the readout fades on
// the ruler's log scale, so the change stays visible while the label keeps the real grey.
import { beatAt, clamp01, easeOutCubic, fit, progress, sceneTime } from './steps.ts';
import { HUMAN, R_MIN, READERS, SENTENCE, greyOf, logLerp, readQuality, rulerPos } from './perception.ts';

export type FadeMode = 'hook' | 'roster' | 'ladder' | 'machines' | 'floor' | 'read';

export type FadeCardProps = {
  mode: FadeMode;
  /** Story position at the scene start and end; consecutive scenes that meet blend (Video.tsx). */
  play?: [number, number];
};

const HOOK_IDS = new Set(['me', 'gpt4o', 'tess']);
/** Blend between consecutive FadeCard scenes (timing.ts SCENE_TRANSITION = 18 frames at 30 fps). */
export const BLEND_S = 0.6;
/** Hook composition: the card sits lower and larger (only three rows show), then glides up. */
export const HERO_DY = 190;
export const HERO_SCALE = 1.1;

/** The sentence on two lines (split after "dazi"), so it can be set large on the card. */
export const LINES: string[] = (() => {
  const cut = SENTENCE.indexOf(' ', Math.floor(SENTENCE.length / 2) - 2);
  return [SENTENCE.slice(0, cut), SENTENCE.slice(cut + 1)];
})();
const MAX_LEN = Math.max(...LINES.map((l) => l.length));

/** Every character of SENTENCE with its line, column and horizontal position (0..1) on the card. */
export const GLYPHS: { ch: string; line: number; col: number; x: number; idx: number }[] = (() => {
  const out: { ch: string; line: number; col: number; x: number; idx: number }[] = [];
  let idx = 0;
  LINES.forEach((text, line) => {
    text.split('').forEach((ch, col) => {
      // Lines are centred: monospace approximation of where the glyph sits across the text block.
      out.push({ ch, line, col, x: 0.5 + (col + 0.5 - text.length / 2) / MAX_LEN, idx: idx++ });
    });
    idx++; // the space the line break replaced
  });
  return out;
})();

/** Darkest grey the visible part of the fades uses before the last, H.264-flattened stretch. */
export const VISIBLE_MAX = 235;
/** Share of a fade spent in the visibly distinct range 0..VISIBLE_MAX. */
export const VISIBLE_SHARE = 0.85;

/**
 * Perceptual fade curve: s = 0 black, s = 1 the 254 floor. sRGB grey is close to perceptually
 * uniform, so a linear grey ramp reads as dark → mid → light; it reaches VISIBLE_MAX at
 * s = VISIBLE_SHARE and only the last stretch runs to 254.
 */
export const inkOf = (s: number): number => {
  const q = clamp01(s);
  if (q <= VISIBLE_SHARE) return (VISIBLE_MAX * q) / VISIBLE_SHARE;
  return VISIBLE_MAX + ((254 - VISIBLE_MAX) * (q - VISIBLE_SHARE)) / (1 - VISIBLE_SHARE);
};
/**
 * Ink of the stretched glyph for a position on the log ruler: visible (<= VISIBLE_MAX) until the
 * last ladder rung before the floor (0.006 sits at ~0.93), gone only at the 254 floor.
 */
export const CHIP_SHARE = 0.95;
export const chipInkOf = (pos: number): number => {
  const q = clamp01(pos);
  if (q <= CHIP_SHARE) return (VISIBLE_MAX * q) / CHIP_SHARE;
  return VISIBLE_MAX + ((254 - VISIBLE_MAX) * (q - CHIP_SHARE)) / (1 - CHIP_SHARE);
};
/** Contrast ratio of an ink grey on the 255 card (inverse of greyOf, unrounded). */
export const ratioOfInk = (ink: number): number => Math.max(R_MIN, (255 - ink) / 255);

/** Width of the contrast ramp (fraction of the text block) in the roster sweep. */
export const RAMP = 0.6;
/** Fade amount of a glyph at x for a ramp whose dark edge is at c: black left of c, gone past c + RAMP. */
export const rampFade = (x: number, c: number): number => clamp01((x - c) / RAMP);
/** Ramp edge where every glyph is invisible (before the sweep) and where every glyph is black. */
export const C_HIDDEN = -RAMP - 0.02;
export const C_BLACK = 1.02;
/** Ramp edge of the held gradient: the left letters near black, the right ones invisible. */
export const C_GRADIENT = -0.05;

export const easeInOut = (p: number): number => {
  const q = clamp01(p);
  return q < 0.5 ? 4 * q * q * q : 1 - (-2 * q + 2) ** 3 / 2;
};
const easeSine = (p: number): number => (1 - Math.cos(Math.PI * clamp01(p))) / 2;

/** Deterministic per-character noise in [0, 1). */
export const charNoise = (i: number, salt = 0): number => {
  const s = Math.sin((i + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return s - Math.floor(s);
};

/** A transcription line at a reading quality: characters fall out to '·' as quality drops. */
export const smudge = (text: string, quality: number, salt = 0): string => {
  const q = clamp01(quality);
  if (q >= 1) return text;
  return text
    .split('')
    .map((ch, i) => (ch === ' ' || charNoise(i, salt) < q ? ch : '·'))
    .join('');
};

export type ReaderState = {
  id: string;
  name: string;
  kind: 'me' | 'model' | 'ocr';
  appear: number;
  /** Characters typed so far. */
  chars: number;
  /** Reading quality: 1 clean, 0 blank. */
  quality: number;
  /** The text to show (typed and smudged). */
  text: string;
  /** Eye only: 1 open, 0 closed. */
  eye: number;
  highlight: number;
  dim: number;
  /** "5/5" tick. */
  five: number;
  /** Row slot (float): compact in the hook, the full roster order afterwards. */
  slot: number;
};

const HOOK_SLOT: Record<string, number> = { me: 0, gpt4o: 1, tess: 2 };

const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

/** Hook fade window: from the first line to just after "I can't see it." starts (~2.5-3 s). */
export const hookFade = (beats: number[]): { start: number; len: number } => {
  const b0 = beatAt(beats, 0);
  const b1 = beats.length > 1 ? beatAt(beats, 1) : b0 + 1.9;
  const start = b0 + 0.05;
  return { start, len: Math.min(3.0, Math.max(2.5, b1 + 0.75 - start)) };
};

/** Roster sweep: ramp edge over scene time (appear, breathe back to the gradient, return). */
export const rosterEdge = (t: number, dur: number): number => {
  const P = (start: number, len: number) => progress(t, fit(start, len, dur), len);
  const a = easeSine(P(BLEND_S, 1.7));
  const back = easeSine(P(BLEND_S + 1.75, 0.85));
  const ret = easeSine(P(BLEND_S + 2.85, 0.85));
  if (back <= 0) return lerp(C_HIDDEN, C_BLACK, a);
  if (ret <= 0) return lerp(C_BLACK, C_GRADIENT, back);
  return lerp(C_GRADIENT, C_BLACK, ret);
};

export function frameState(p: FadeCardProps, time: number, beats: number[], dur: number) {
  const t = sceneTime(time, dur);
  const b0 = beatAt(beats, 0);
  const lastBeat = beats.length ? beatAt(beats, beats.length - 1) : 0;
  // End of the last line (the scene lasts until it + 0.8 s).
  const end = Number.isFinite(dur) ? Math.max(lastBeat + 0.5, dur - 0.8) : lastBeat + 2;
  const P = (start: number, len: number) => progress(t, fit(start, len, dur), len);
  const L = SENTENCE.length;

  // --- The card: one uniform ratio, or (roster) a per-glyph ramp with dark edge `edge`.
  let ratio = 1;
  let edge: number | null = null;
  let rulerAppear = 1;
  let human = 0;
  let bracket = 0;
  let floorTag = 0;
  let markerRatio = 1;
  // The stretched glyph next to the readout (0 hidden, 1 shown).
  let chip = 0;

  // Per-reader overrides, filled per mode.
  const appear: Record<string, number> = {};
  const typed: Record<string, number> = {};
  let highlightIds = new Set<string>();
  let highlight = 0;
  let five = 0;
  // 0 = hook slots, 1 = roster order.
  let slotMix = 1;
  // 1 = hook composition (card lower and larger), 0 = the regular layout.
  let hero = 0;

  if (p.mode === 'hook') {
    // Every letter at once, black → gone, on the perceptual curve; the marker tracks the same ink.
    const { start, len } = hookFade(beats);
    const ink = inkOf(hookCurve(P(start, len)));
    ratio = ratioOfInk(ink);
    const b1 = beats.length > 1 ? beatAt(beats, 1) : b0 + 2.6;
    const b2 = beats.length > 2 ? beatAt(beats, 2) : b1 + 1.4;
    for (const r of READERS) appear[r.id] = HOOK_IDS.has(r.id) ? 1 : 0;
    // Two machines type the full string on the third line.
    typed.gpt4o = P(b2 + 0.15, 1.6);
    typed.tess = P(b2 + 0.35, 1.6);
    highlightIds = new Set(['gpt4o', 'tess']);
    highlight = easeOutCubic(P(b2, 0.4));
    slotMix = 0;
    hero = 1;
  } else if (p.mode === 'roster') {
    // Nothing moves while the hook is still blending out, so no row shows twice.
    slotMix = easeInOut(P(BLEND_S, 0.5));
    hero = 1 - slotMix;
    edge = rosterEdge(t, dur);
    const span = Math.max(1, end - b0);
    // Narration order: six models, two OCR engines, then me.
    const order = ['gpt54', 'luna', 'sol', 'terra', 'qwen', 'vision'];
    // New rows only once the compact hook rows have moved to their roster slots.
    const at = [0.15, 0.22, 0.29, 0.36, 0.43, 0.6];
    for (const r of READERS) appear[r.id] = 1;
    order.forEach((id, i) => {
      appear[id] = easeOutCubic(P(b0 + at[i] * span, 0.35));
      typed[id] = P(b0 + at[i] * span + 0.1, 0.7);
    });
    highlightIds = new Set(['me']);
    highlight = Math.sin(Math.PI * P(b0 + 0.82 * span, 0.7));
  } else if (p.mode === 'ladder') {
    // One continuous fade from full contrast to my threshold, log-eased.
    const f = easeInOut(P(b0 + 0.05, Math.max(0.5, end - b0 - 0.35)));
    ratio = logLerp(1, HUMAN, f);
    human = easeOutCubic(P(end - 0.45, 0.5));
    chip = easeOutCubic(P(b0 + 0.05, 0.4));
  } else if (p.mode === 'machines') {
    const f = easeInOut(P(b0 + 0.05, Math.max(0.5, end - b0 - 0.2)));
    ratio = logLerp(HUMAN, 0.006, f);
    human = 1;
    bracket = easeOutCubic(P(b0 + 0.55 * (end - b0), 0.6));
    chip = 1;
  } else if (p.mode === 'floor') {
    const f = easeInOut(P(b0 + 0.05, 1.0));
    ratio = logLerp(0.006, R_MIN, f);
    human = 1;
    bracket = 1;
    floorTag = easeOutCubic(P(b0 + 0.7, 0.5));
    chip = 1;
  } else {
    // read: hold at the floor; the two machines that still read light up with 5/5.
    ratio = R_MIN;
    human = 1;
    bracket = 1;
    floorTag = 1;
    chip = 1;
    highlightIds = new Set(['gpt4o', 'tess']);
    highlight = easeOutCubic(P(b0, 0.5));
    five = easeOutCubic(P(b0 + 0.6, 0.45));
  }

  // Ink of every glyph (unrounded): the roster ramp, else the card's uniform grey.
  const uniformInk = 255 - 255 * Math.min(1, Math.max(0, ratio));
  const glyphs = GLYPHS.map((g) => {
    const ink = edge === null ? uniformInk : inkOf(rampFade(g.x, edge));
    return { ch: g.ch, line: g.line, x: g.x, ink, grey: Math.round(ink) };
  });
  const inkAt = new Map(glyphs.map((g, i) => [GLYPHS[i].idx, g.ink]));
  // The marker reads the middle of the ramp in the roster sweep, else the card's uniform ink.
  markerRatio = edge === null ? ratio : ratioOfInk(inkOf(rampFade(0.5, edge)));

  const readers: ReaderState[] = READERS.map((r, idx) => {
    const a = appear[r.id] ?? 1;
    const isMe = r.id === 'me';
    let quality = readQuality(r, ratio);
    let chars = Math.round(clamp01(typed[r.id] ?? 1) * L);
    if (p.mode === 'hook' && !isMe && typed[r.id] === undefined) chars = 0;
    if (p.mode === 'hook' && !isMe) quality = 1;
    if (p.mode === 'roster' && !isMe) quality = 1;
    let text = smudge(SENTENCE.slice(0, chars), quality, r.id.length);
    if (isMe && edge !== null) {
      // The ramp: my line keeps the letters still dark enough for me (ratio above my threshold).
      const mine = SENTENCE.split('').map((ch, i) => (ch === ' ' || ratioOfInk(inkAt.get(i) ?? 255) > HUMAN ? ch : ' '));
      text = mine.join('');
      chars = L;
      quality = mine.filter((ch) => ch !== ' ').length / SENTENCE.replace(/ /g, '').length;
    }
    const eye = isMe ? clamp01(quality * 2.5) : 1;
    const hl = highlightIds.has(r.id) ? clamp01(highlight) : 0;
    const dim = p.mode === 'read' && !highlightIds.has(r.id) ? 0.55 * highlight : 0;
    return {
      id: r.id,
      name: r.name,
      kind: r.kind,
      appear: clamp01(a),
      chars,
      quality: clamp01(quality),
      text,
      eye: clamp01(eye),
      highlight: hl,
      dim: clamp01(dim),
      five: highlightIds.has(r.id) ? clamp01(five) : 0,
      slot: lerp(HOOK_SLOT[r.id] ?? idx, idx, slotMix),
    };
  });

  const markerPos = rulerPos(markerRatio);
  return {
    /** Uniform card ratio, or null when the card carries the roster's ramp. */
    cardRatio: edge === null ? ratio : null,
    cardGrey: greyOf(ratio),
    /** Every glyph with its own ink (rounded `grey` is what is drawn). */
    glyphs,
    /** Dark edge of the roster ramp, or null. */
    edge,
    rulerAppear,
    marker: { pos: markerPos, grey: greyOf(markerRatio), ratio: markerRatio },
    /**
     * The stretched glyph next to the readout: its ink follows the marker's position on the log
     * ruler, so the fade stays visible where the real greys (245-254) all encode as white.
     */
    chipOpacity: clamp01(chip),
    chipInk: Math.round(chipInkOf(markerPos)),
    human,
    humanPos: rulerPos(HUMAN),
    bracket,
    bracketTo: rulerPos(0.005),
    floorTag,
    readers,
    hero,
  };
}

/**
 * Hook curve: fade amount over the hook window. Half sine ease, half linear: a soft start and
 * end, yet ~80% of the window passes in the visible range (s <= VISIBLE_SHARE).
 */
export function hookCurve(p: number): number {
  const q = clamp01(p);
  return 0.5 * easeSine(q) + 0.5 * q;
}
