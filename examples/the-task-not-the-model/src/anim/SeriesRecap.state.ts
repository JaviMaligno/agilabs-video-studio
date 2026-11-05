// Pure state of the series recap (parts 1 and 2), one mode per scene of script.md:
// - bench:       three exam cards (maths, code, reasoning) get a score badge each; a ranking board of
//                 three robots (Opus 5, Fable 5, Gemini) with decreasing bars, no numbers.
// - podium/story: a robot rises onto a podium with a score climbing to a gold "#1", labelled "Opus 5",
//   with "Fable 5" on the lower left block; beside it, the same robot at a desk gets a "redo" sticky
//   note ("feels no better").
// - podium/name:  a crib sheet slides under the robot's arm; BENCHMAXING stamps across the stage;
//   then "win the exam ≠ do better work" appears under the stamp.
// - twins:        an exam card, its twin with new numbers ("same method"), seven robots with two
//                 ticks each and a "no drop" stamp.
// - agents:       a conductor hands folders to five helpers; seven robots, six "45/45", Qwen times out.
// - desks:        the tidy exam desk with its answer key (ticked) against the messy desk without one.
// Every number in the state is a progress in [0, 1]. No Remotion or React here.
import { clamp01, fit, progress, sceneTime, stepTimes } from './steps.ts';

export type SeriesRecapMode = 'bench' | 'podium' | 'twins' | 'agents' | 'desks';
export type SeriesRecapProps = {
  mode: SeriesRecapMode;
  /** For mode 'podium': the first scene ('story') or the second ('name'). Default 'story'. */
  variant?: 'story' | 'name';
};

/** The seven models, in on-screen order, with their robot (keep this mapping). */
export const MODELS = [
  { name: 'Gemini', robot: 'robot-sky', hue: 0 },
  { name: 'Opus', robot: 'robot-violet', hue: 0 },
  { name: 'Fable', robot: 'robot-teal', hue: 0 },
  { name: 'GLM', robot: 'robot-graphite', hue: 0 },
  { name: 'Kimi', robot: 'robot-rose', hue: 0 },
  { name: 'Qwen', robot: 'robot-teal', hue: 70 },
  { name: 'DeepSeek', robot: 'robot-amber', hue: 0 },
] as const;
/** Index of Qwen, the model whose agent team ran out of time. */
export const TIMEOUT_INDEX = 5;
export const HELPERS = 5;

/** On-screen text; the numbers are those of the articles. */
export const TXT = {
  one: '#1',
  redo: 'redo',
  face: 'feels no better',
  word: 'BENCHMAXING',
  exam: 'x² + 7x + 12 = 0',
  twin: 'x² + 9x + 20 = 0',
  same: 'same method',
  noDrop: 'no drop',
  score: '45/45 ✓',
  timeout: 'time out',
  examLabel: 'exam',
  key: 'answer key ✓',
  realLabel: 'real work',
  opus: 'Opus 5',
  fable: 'Fable 5',
  gemini: 'Gemini',
  scorePill: 'score',
  winExam: 'win the exam',
  neq: '≠',
  betterWork: 'do better work',
} as const;

/** The three exam cards of the 'bench' scene. */
export const BENCH_CARDS = [
  { label: 'MATHS', text: 'x² + 7x + 12 = 0' },
  { label: 'CODE', text: 'def sort(xs):' },
  { label: 'REASONING', text: 'A → B → ?' },
] as const;

/** The ranking board of the 'bench' scene: rank, robot index in MODELS, label, bar length (no scores). */
export const BENCH_RANKS = [
  { rank: '1', model: 1, label: TXT.opus, bar: 1 },
  { rank: '2', model: 2, label: TXT.fable, bar: 0.72 },
  { rank: '3', model: 0, label: TXT.gemini, bar: 0.48 },
] as const;

/** Steps (narration lines) per mode. */
export const STEPS: Record<SeriesRecapMode, number> = { bench: 2, podium: 2, twins: 3, agents: 2, desks: 3 };
/** Steps of the 'name' variant of 'podium' (crib sheet, stamp, the line under it). */
export const NAME_STEPS = 3;

/** Longest choreography of one step, in seconds: each step is fitted to finish by the scene end. */
const STEP_LEN = 1.6;
const ROBOT_STAGGER = 0.08;

const blank = () => ({
  // bench
  cards: [] as { appear: number; badge: number }[],
  board: 0,
  ranks: [] as { appear: number; bar: number }[],
  // podium
  base: 0,
  rise: 0,
  score: 0,
  gold: 0,
  desk: 0,
  redo: 0,
  face: 0,
  crib: 0,
  stamp: 0,
  dim: 0,
  fable: 0,
  labels: 0,
  line: 0,
  // twins
  card1: 0,
  card2: 0,
  same: 0,
  noDrop: 0,
  // agents
  conductor: 0,
  helpers: [] as { appear: number; folder: number }[],
  stopwatch: 0,
  timeout: 0,
  // twins + agents: the row of seven
  row: [] as { appear: number; tick1: number; tick2: number; result: number }[],
  // desks
  left: 0,
  key: 0,
  check: 0,
  right: 0,
  strike: 0,
});
export type SeriesRecapState = ReturnType<typeof blank>;

/** Start of each step (narration line i reveals step i), fitted into the scene. */
export const stepStarts = (p: SeriesRecapProps, beats: number[], dur: number): number[] =>
  stepTimes(p.mode === 'podium' && p.variant === 'name' ? NAME_STEPS : (STEPS[p.mode] ?? 0), beats, [], STEP_LEN, dur);

export function frameState(p: SeriesRecapProps, time: number, beats: number[], dur: number): SeriesRecapState {
  const t = sceneTime(time, dur);
  const st = stepStarts(p, beats, dur);
  /** Progress of an animation `len` long that starts `off` seconds after step `i`. */
  const at = (i: number, off: number, len: number) => progress(t, fit((st[i] ?? 0) + off, len, dur), len);
  const s = blank();
  const row = (fields: (k: number, d: number) => Partial<SeriesRecapState['row'][number]>) =>
    MODELS.map((_, k) => ({ appear: 0, tick1: 0, tick2: 0, result: 0, ...fields(k, k * ROBOT_STAGGER) }));

  switch (p.mode) {
    case 'bench': {
      s.cards = BENCH_CARDS.map((_, k) => ({ appear: at(0, k * 0.15, 0.45), badge: at(0, 0.55 + k * 0.15, 0.35) }));
      s.board = at(1, 0, 0.4);
      s.ranks = BENCH_RANKS.map((_, k) => ({ appear: at(1, 0.2 + k * 0.15, 0.35), bar: at(1, 0.45 + k * 0.15, 0.5) }));
      break;
    }
    case 'podium': {
      if (p.variant === 'name') {
        // Carried over from the previous scene: the robot on its podium with the gold #1, the desk dimmed.
        s.base = 1;
        s.rise = 1;
        s.score = 1;
        s.gold = 1;
        s.desk = clamp01(1 - 0.6 * progress(t, 0, 0.5));
        s.redo = s.desk;
        s.face = s.desk;
        s.fable = 1;
        s.labels = 1;
        s.crib = at(0, 0, 0.7);
        s.stamp = at(1, 0, 0.45);
        s.dim = at(1, 0, 0.35);
        s.line = at(2, 0, 0.45);
      } else {
        s.base = at(0, 0, 0.4);
        s.rise = at(0, 0, 0.8);
        s.score = at(0, 0.2, 1.0);
        s.gold = at(0, 1.1, 0.4);
        s.fable = at(0, 0.3, 0.6);
        s.labels = at(0, 0.8, 0.4);
        s.desk = at(1, 0, 0.5);
        s.redo = at(1, 0.45, 0.4);
        s.face = at(1, 0.8, 0.45);
      }
      break;
    }
    case 'twins': {
      s.card1 = at(0, 0, 0.5);
      s.card2 = at(1, 0, 0.6);
      s.same = at(1, 0.5, 0.4);
      s.row = row((_, d) => ({ appear: at(2, d, 0.35), tick1: at(2, 0.35 + d, 0.25), tick2: at(2, 0.6 + d, 0.25) }));
      s.noDrop = at(2, 1.2, 0.4);
      break;
    }
    case 'agents': {
      s.conductor = at(0, 0, 0.45);
      s.helpers = Array.from({ length: HELPERS }, (_, k) => ({ appear: at(0, 0.2 + k * 0.08, 0.35), folder: at(0, 0.45 + k * 0.12, 0.5) }));
      s.row = row((k, d) => ({ appear: at(1, d, 0.35), result: k === TIMEOUT_INDEX ? 0 : at(1, 0.5 + d, 0.3) }));
      s.stopwatch = at(1, 0.9, 0.4);
      s.timeout = at(1, 1.15, 0.35);
      break;
    }
    case 'desks': {
      s.left = at(0, 0, 0.6);
      s.key = at(0, 0.35, 0.45);
      s.check = at(1, 0, 0.6);
      s.right = at(2, 0, 0.6);
      s.strike = at(2, 0.6, 0.4);
      break;
    }
  }
  return s;
}
