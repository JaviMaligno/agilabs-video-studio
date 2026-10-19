// Pure state of the DotStage scenes: real tracking clips replayed as glowing dots on a dark
// stage ("lights out"), with context layers (field lines, ball, kit colours) that fade in and
// out. Two layouts: one big stage with the hook clip, or a 2x2 grid with one clip per sport.
// Visuals are illustrative, chosen for impact; numbers on screen come from the article.
// No Remotion or React here.
import type { Label } from '../types.ts';
import { frameState as counterState } from './Counter.state.ts';
import { beatAt, clamp01, easeOutCubic, fit, progress, sceneTime } from './steps.ts';

export type Clip = {
  sport: string;
  /** Field length and width in metres (x along the length). */
  field: [number, number];
  hz: number;
  /** +1 / -1 per player. */
  team: number[];
  /** Per frame: flat [x0, y0, x1, y1, ...] in metres. */
  frames: number[][];
  ball: (null | number[])[];
  note?: string;
};
export type ClipSet = { hook: Clip; grid: Clip[] };

export type DotMode = 'quiz' | 'question' | 'reveal' | 'strip' | 'specialist' | 'guesses' | 'favourite' | 'totext';

export type DotProps = {
  mode: DotMode;
  /**
   * Video second this scene starts at, injected by timeline.ts: every clip plays on one clock
   * across scenes, so consecutive scenes pick up the play where the previous one left it.
   */
  clock?: number;
};

export const STAGE_MODES: DotMode[] = ['quiz', 'question', 'reveal', 'totext'];
export const layoutOf = (mode: DotMode): 'stage' | 'grid' => (STAGE_MODES.includes(mode) ? 'stage' : 'grid');

/** On-screen sport names (tile labels), in grid order. */
export const SPORT_LABEL: Record<string, Label> = {
  american_football: { en: 'American football', es: 'Fútbol americano' },
  basketball: { en: 'Basketball', es: 'Baloncesto' },
  handball: { en: 'Handball', es: 'Balonmano' },
  soccer: { en: 'Soccer', es: 'Fútbol' },
};

/** The five frontier models, named as in the article. */
export const MODELS = ['GPT-5.6 Sol', 'GPT-5.6 Terra', 'Claude Opus 5.5', 'Claude Sonnet 5', 'Gemini 3.1 Pro'] as const;

/**
 * Illustrative guesses dropped on the grid tiles (scene "guesses"), one per tile in grid order.
 * Article: models fall back on American football or soccer; none recognises handball.
 */
export const GUESSES = [
  { model: 'Sol', guess: 'american_football', hit: true },
  { model: 'Gemini', guess: 'american_football', hit: false },
  { model: 'Sonnet', guess: 'soccer', hit: false },
  { model: 'Terra', guess: 'american_football', hit: false },
] as const;

/** Favourite sports, exactly as the article gives them (scene "favourite"). */
export const FAVOURITES = [
  { model: 'GPT-5.6 Sol', sport: 'american_football', share: '62%' },
  { model: 'Gemini 3.1 Pro', sport: 'american_football', share: '66%' },
  { model: 'Claude Sonnet 5', sport: 'soccer', share: '64%' },
] as const;

/** Per-model reveal answers (scene "reveal"): three said American football. */
export const REVEAL_WRONG = 3;

/** Seconds of trail behind each dot, and how many ghost samples draw it. */
export const TRAIL = { seconds: 0.6, samples: 5 };
/**
 * Grid header items wait until the scene has blended in (the transition takes 0.6 s), so two
 * scenes' headers never show on top of each other.
 */
const HEADER_IN = 0.6;
/** Fade at the clip loop point, in seconds. */
const WRAP = 0.35;

const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const fin = (x: number, d = 0) => (Number.isFinite(x) ? x : d);

export const clipSeconds = (c: Clip): number => Math.max(0.1, (c.frames.length - 1) / c.hz);

/** Positions at clip second `tc` (clamped), interpolated between frames. */
export function samplePlayers(c: Clip, tc: number): { x: number; y: number }[] {
  const n = c.frames.length;
  const f = Math.min(n - 1, Math.max(0, fin(tc) * c.hz));
  const i = Math.floor(f);
  const j = Math.min(n - 1, i + 1);
  const k = f - i;
  const a = c.frames[i];
  const b = c.frames[j];
  return Array.from({ length: a.length / 2 }, (_, q) => ({ x: lerp(a[2 * q], b[2 * q], k), y: lerp(a[2 * q + 1], b[2 * q + 1], k) }));
}

export function sampleBall(c: Clip, tc: number): { x: number; y: number } | null {
  const n = c.ball.length;
  const f = Math.min(n - 1, Math.max(0, fin(tc) * c.hz));
  const i = Math.floor(f);
  const j = Math.min(n - 1, i + 1);
  const a = c.ball[i];
  const b = c.ball[j] ?? a;
  if (!a || !b) return null;
  const k = f - i;
  return { x: lerp(a[0], b[0], k), y: lerp(a[1], b[1], k) };
}

/**
 * What part of the field a tile shows, in field metres. `rot`: drawn rotated a quarter turn
 * (the hook's half court, basket at the top).
 */
export type View = { x0: number; x1: number; y0: number; y1: number; rot: boolean };

export function viewOf(c: Clip, layout: 'stage' | 'grid'): View {
  const [L, W] = c.field;
  if (layout === 'stage') {
    // The half court the hook play stays in, a little margin around it.
    const xs = c.frames.flatMap((f) => f.filter((_, i) => i % 2 === 0));
    const right = xs.reduce((s, x) => s + x, 0) / Math.max(1, xs.length) > L / 2;
    return right ? { x0: L / 2 - 0.6, x1: L + 0.9, y0: -0.9, y1: W + 0.9, rot: true } : { x0: -0.9, x1: L / 2 + 0.6, y0: -0.9, y1: W + 0.9, rot: true };
  }
  if (c.sport === 'american_football') {
    // A 50 m stretch of the field around the play (the whole 110 m would make the dots specks).
    const xs = c.frames.flatMap((f) => f.filter((_, i) => i % 2 === 0));
    const mid = xs.reduce((s, x) => s + x, 0) / Math.max(1, xs.length);
    const half = 27;
    const x0 = Math.min(L - 2 * half, Math.max(0, mid - half));
    return { x0, x1: x0 + 2 * half, y0: -1, y1: W + 1, rot: false };
  }
  return { x0: -1.5, x1: L + 1.5, y0: -1.5, y1: W + 1.5, rot: false };
}

/** Field metres -> view coordinates (u right, v down), before scaling to pixels. */
export const toView = (v: View, field: [number, number], x: number, y: number) =>
  v.rot ? { u: y - v.y0, v: v.x1 - x } : { u: x - v.x0, v: y - v.y0 };
export const viewSize = (v: View) => (v.rot ? { w: v.y1 - v.y0, h: v.x1 - v.x0 } : { w: v.x1 - v.x0, h: v.y1 - v.y0 });

type TileState = {
  sport: string;
  /** Loop fade of the dots, 0..1. */
  opacity: number;
  dots: { x: number; y: number; team: number; trail: { x: number; y: number }[] }[];
  ball: { x: number; y: number; opacity: number } | null;
  /** Context layers, 0..1. */
  lines: number;
  colour: number;
  /** Dots lit in the accent colour (the classifier recognised the tile), 0..1. */
  highlight: number;
  /** Scanner line position across the tile (0..1) and its visibility. */
  scan: { at: number; opacity: number };
  /** Sport label under the tile. */
  label: { opacity: number; pop: number };
  /** A frontier model's guess dropped on the tile. */
  guess: { model: string; sport: string; hit: boolean; drop: number; opacity: number; mark: number } | null;
  /** Rubber stamps of a favourite sport, in the order they land. */
  stamps: { sport: string; pop: number; opacity: number; angle: number; dx: number; dy: number }[];
};

export function tileOf(c: Clip, playT: number): Omit<TileState, 'lines' | 'colour' | 'highlight' | 'scan' | 'label' | 'guess' | 'stamps' | 'ball'> & { ballAt: { x: number; y: number } | null } {
  const D = clipSeconds(c);
  const p = Math.max(0, fin(playT));
  const tc = p % D;
  // Fade at the loop point; never on the very first pass, so the opening frame is lit.
  const fadeIn = p < D ? 1 : clamp01(tc / WRAP);
  const fadeOut = clamp01((D - tc) / WRAP);
  const now = samplePlayers(c, tc);
  const ghosts = Array.from({ length: TRAIL.samples }, (_, k) => tc - ((k + 1) * TRAIL.seconds) / TRAIL.samples).filter((g) => g >= 0);
  const back = ghosts.map((g) => samplePlayers(c, g));
  return {
    sport: c.sport,
    opacity: Math.min(fadeIn, fadeOut),
    dots: now.map((q, i) => ({ x: q.x, y: q.y, team: c.team[i] ?? 1, trail: back.map((b) => b[i]) })),
    ballAt: sampleBall(c, tc),
  };
}

const crossTimes = (b1: number, b2: number | undefined, n: number) => {
  // Ticks spread over a line: from its start to its end (the next beat minus the 0.35 s gap).
  const end = b2 !== undefined && Number.isFinite(b2) ? b2 - 0.35 : b1 + 1.8;
  const len = Math.max(0.6, end - b1);
  return Array.from({ length: n }, (_, i) => b1 + 0.15 + (len * (i + 0.6)) / (n + 0.4));
};

/**
 * Reveal: when the lights come back on. "Basketball." is the last word of the first line and
 * lasts ~0.85 s, and the line ends ~0.1 s after it, so its onset is ~1.3 s before the next beat
 * (b1 = line end + 0.35 gap). Firing at b1 - 1.35 lands the title and the court on the word
 * (a hair early), not half a second after it.
 */
const revealOn = (b0: number, b1: number, d: number): number => fit(Math.max(b0 + 0.6, b1 - 1.35), 0.7, d);

export function frameState(p: DotProps, time: number, beats: number[], dur: number, data: ClipSet) {
  const t = sceneTime(time, dur);
  const d = Number.isFinite(dur) && dur > 0 ? dur : 1;
  const raw = fin(time);
  const playT = Math.max(0, fin(p.clock ?? 0) + Math.min(raw, d));
  const mode = p.mode;
  const layout = layoutOf(mode);
  const b0 = beatAt(beats, 0);
  const has = (i: number) => beats[i] !== undefined && Number.isFinite(beats[i]);
  const b1 = has(1) ? beats[1] : b0 + 1.6;
  const b2 = has(2) ? beats[2] : undefined;
  // Where the (single) line of a one-line scene ends: the scene tail is 0.8 s.
  const lineEnd = Math.max(b0 + 0.8, d - 0.8);

  const clips = layout === 'stage' ? [data.hook] : data.grid;
  const tiles: TileState[] = clips.map((c, i) => {
    const base = tileOf(c, playT);
    let lines = 0;
    let colour = 0;
    let ballOn = 0;
    let highlight = 0;
    let scan = { at: 0, opacity: 0 };
    let label = { opacity: 0, pop: 0 };
    let guess: TileState['guess'] = null;
    const stamps: TileState['stamps'] = [];

    if (mode === 'strip') {
      // Peel on "kept only": lines dissolve, the ball pops, the kits drain to grey.
      const peel = b0 + 0.55 * (lineEnd - b0) + i * 0.12;
      lines = 1 - progress(t, fit(peel, 0.6, d), 0.6);
      ballOn = 1 - progress(t, fit(peel + 0.35, 0.3, d), 0.3);
      colour = 1 - progress(t, fit(peel + 0.6, 0.7, d), 0.7);
    }
    if (mode === 'reveal') {
      // Lights back on as "Basketball" is spoken (the end of the first line).
      const on = revealOn(b0, b1, d);
      lines = easeOutCubic(progress(t, on, 0.7));
      ballOn = progress(t, on + 0.3, 0.3);
      colour = progress(t, on + 0.2, 0.8);
    }
    if (mode === 'specialist') {
      const s0 = fit(b0 + 0.2 + i * 0.4, 0.7, d);
      const sp = progress(t, s0, 0.7);
      scan = { at: easeOutCubic(sp), opacity: sp > 0 && sp < 1 ? 1 : 0 };
      highlight = progress(t, s0 + 0.35, 0.35);
      label = { opacity: progress(t, s0 + 0.45, 0.25), pop: easeOutCubic(progress(t, s0 + 0.45, 0.4)) };
    }
    if (mode === 'guesses' || mode === 'favourite') label = { opacity: mode === 'favourite' ? 0.55 : 1, pop: 1 };
    if (mode === 'guesses') {
      const g = GUESSES[i % GUESSES.length];
      const g0 = fit(b0 + 1.0 + i * 0.35, 0.5, d);
      const drop = easeOutCubic(progress(t, g0, 0.5));
      guess = { model: g.model, sport: g.guess, hit: g.hit, drop, opacity: progress(t, g0, 0.2), mark: progress(t, g0 + 0.5, 0.25) };
    }
    if (mode === 'favourite') {
      FAVOURITES.forEach((f, k) => {
        const s = fit(Math.max(HEADER_IN, b0 + 0.3) + k * 0.45 + i * 0.12, 0.3, d);
        const pop = progress(t, s, 0.25);
        stamps.push({ sport: f.sport, pop, opacity: pop, angle: [-8, -8, 7][k], dx: 0, dy: 0 });
      });
    }
    const { ballAt, ...rest } = base;
    return {
      ...rest,
      ball: ballAt ? { ...ballAt, opacity: ballOn } : null,
      lines,
      colour,
      highlight,
      scan,
      label,
      guess,
      stamps,
    };
  });

  // The big "?" behind the hook dots, pulsing; smaller in the "question" scene.
  const pulse = 0.5 + 0.5 * Math.sin((raw * 2 * Math.PI) / 1.2);
  let question = { opacity: 0, pulse, scale: 1 };
  if (mode === 'quiz') question = { opacity: 1, pulse, scale: 1 };
  if (mode === 'question') question = { opacity: progress(t, 0.1, 0.4), pulse, scale: 0.62 };
  if (mode === 'reveal') {
    const on = revealOn(b0, b1, d);
    question = { opacity: 1 - progress(t, on - 0.2, 0.4), pulse, scale: 0.62 };
  }

  // Scenes reached by a blend (question after the grid, strip after the hook) bring their header
  // in only after the outgoing scene's header has faded, so two headlines never stack.
  const headIn = progress(t, HEADER_IN, 0.3);

  // "No pitch, no ball, no kits": three pills crossed out one by one on the second line.
  const ticks = crossTimes(b1, b2, 3);
  const pills = ['pitch', 'ball', 'kits'].map((k, i) => ({
    key: k,
    opacity: mode === 'quiz' ? 1 : mode === 'question' ? headIn : mode === 'reveal' ? 1 - progress(t, revealOn(b0, b1, d), 0.4) : 0,
    cross: mode === 'question' || mode === 'reveal' ? 1 : mode === 'quiz' ? easeOutCubic(progress(t, fit(ticks[i], 0.3, d), 0.3)) : 0,
  }));

  // Reveal: the answer replaces the question, then three model answers that were wrong.
  const onAt = revealOn(b0, b1, d);
  const answer = mode === 'reveal' ? { opacity: progress(t, onAt, 0.3), pop: easeOutCubic(progress(t, onAt, 0.45)) } : { opacity: 0, pop: 0 };
  const wrong = Array.from({ length: REVEAL_WRONG }, (_, i) => {
    if (mode !== 'reveal') return { opacity: 0, cross: 0 };
    const a = fit(b1 + 0.2 + i * 0.25, 0.3, d);
    return { opacity: progress(t, a, 0.3), cross: progress(t, fit(b1 + 1.4 + i * 0.15, 0.3, d), 0.3) };
  });

  // Specialist: the headline 83 %, counted up as the line reaches it, chance level underneath.
  const counter =
    mode === 'specialist'
      ? (() => {
          const start = fit(b0 + 0.6 * (lineEnd - b0) - 0.3, 1.2, d);
          const cs = counterState({ value: 83, suffix: '%', label: 'classifier' }, t, [start], dur);
          return { text: cs.text, finalText: cs.finalText, appear: cs.appear, progress: cs.progress, chance: progress(t, start + 0.8, 0.4), title: progress(t, fit(Math.max(HEADER_IN, b0), 0.4, d), 0.4) };
        })()
      : null;

  // Guesses: five model chips, then the range they land in (chance .. 47 %).
  const chips = MODELS.map((m, i) => ({
    name: m,
    opacity: mode === 'guesses' ? progress(t, fit(Math.max(HEADER_IN, b0 + 0.1) + i * 0.12, 0.3, d), 0.3) : 0,
  }));
  const range = mode === 'guesses' ? { grow: easeOutCubic(progress(t, fit(b0 + 0.55 * (lineEnd - b0), 0.8, d), 0.8)), opacity: progress(t, fit(b0 + 0.45 * (lineEnd - b0), 0.3, d), 0.3) } : { grow: 0, opacity: 0 };

  // Favourite: the three favourites with their share of clips, one per stamp round.
  const favourites = FAVOURITES.map((f, k) => ({
    ...f,
    opacity: mode === 'favourite' ? progress(t, fit(Math.max(HEADER_IN, b0 + 0.3) + k * 0.45, 0.3, d), 0.3) : 0,
  }));

  // To text (Laya): the dots dissolve into columns of coordinates that scroll into the LAYA chip;
  // its four options appear under it, then the "same folds, same 400 clips" tag.
  const totext =
    mode === 'totext'
      ? {
          dim: 1 - 0.55 * progress(t, fit(b0 + 0.2, 0.8, d), 0.8),
          scroll: Math.max(0, t - b0 - 0.1),
          text: progress(t, fit(b0 + 0.1, 0.4, d), 0.4),
          chip: easeOutCubic(progress(t, fit(b0 + 0.55, 0.45, d), 0.45)),
          options: [0, 1, 2, 3].map((k) => progress(t, fit(b0 + 0.45 * (lineEnd - b0) + k * 0.12, 0.3, d), 0.3)),
          tag: progress(t, fit(b0 + 0.78 * (lineEnd - b0), 0.35, d), 0.35),
          head: progress(t, fit(HEADER_IN, 0.3, d), 0.3),
        }
      : null;

  return {
    layout,
    playT,
    totext,
    tiles,
    question,
    pills,
    headline: { opacity: mode === 'quiz' ? 1 : mode === 'question' ? headIn : mode === 'reveal' ? 1 - answer.opacity : 0 },
    /** Strip header: enters once the blend from the hook has faded the hook's headline out. */
    stripTitle: mode === 'strip' ? headIn : 0,
    answer,
    wrong,
    counter,
    chips,
    range,
    favourites,
    /** Favourite scene title. */
    favTitle: mode === 'favourite' ? progress(t, fit(HEADER_IN - 0.1, 0.3, d), 0.3) : 0,
  };
}
