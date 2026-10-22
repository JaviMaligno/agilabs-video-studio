// Pure state of the accuracy part: score against the horizon (10 → 200 steps).
// Mode `claude` (line 8): on Claude Haiku 4.5 both arms stay at the top (1.00 and 0.99 at T=200,
// part 1's table), then the model chip swaps to Gemini 3 Flash and the setup tag lands.
// Mode `gemini` (line 9): the notepad flat at 1.000 over 75 episodes; the transcript dips to 0.913;
// the paper's transcript, dashed, to 0.74. The Gemini series replays part 2's figure (its points
// read off the plot); only the labelled end values are quoted figures. No Remotion or React here.
import { easeOutCubic, progress, sceneTime } from './steps.ts';

export type HorizonMode = 'claude' | 'gemini';
export type HorizonLinesProps = { mode: HorizonMode; marks?: number[] };

export const HORIZONS = [10, 25, 50, 100, 200] as const;
export const Y_MIN = 0.7;
export const Y_MAX = 1.0;

export type Series = { id: string; values: number[]; label: string; tone: 'ok' | 'warm'; dashed?: boolean };

/** Claude Haiku 4.5, part 1: both arms at the top; labelled at T=200 (1.00 / 0.99). */
export const CLAUDE: Series[] = [
  { id: 'note', values: [1, 1, 1, 1, 1], label: 'notepad 1.00', tone: 'ok' },
  { id: 'tr', values: [0.99, 0.99, 0.99, 0.99, 0.99], label: 'transcript 0.99', tone: 'warm' },
];
/** Gemini 3 Flash, part 2's figure. */
export const GEMINI: Series[] = [
  { id: 'note', values: [1, 1, 1, 1, 1], label: 'notepad 1.000', tone: 'ok' },
  { id: 'tr', values: [0.999, 0.961, 0.942, 0.966, 0.913], label: 'transcript 0.913', tone: 'warm' },
  { id: 'paper', values: [0.906, 0.926, 0.886, 0.846, 0.74], label: 'paper: 0.74', tone: 'warm', dashed: true },
];

export type HorizonState = {
  chart: number;
  chip: { swap: number };
  series: { id: string; draw: number; label: number; opacity: number }[];
  /** Which data set the lines show. */
  data: 'claude' | 'gemini';
  episodes: number;
  setup: number;
  hedge: number;
};

const e = (t: number, s: number, l: number) => easeOutCubic(progress(t, s, l));
const mk = (marks: number[] | undefined, i: number, fallback: number) => {
  const m = marks?.[i];
  return m !== undefined && Number.isFinite(m) ? m : fallback;
};

/** y in [0, 1] from the top of the plot for a score. */
export const yOf = (v: number): number => (Y_MAX - Math.min(Y_MAX, Math.max(Y_MIN, v))) / (Y_MAX - Y_MIN);

export function frameState(props: HorizonLinesProps, t: number, beats: number[], dur: number): HorizonState {
  const mode: HorizonMode = props.mode === 'gemini' ? 'gemini' : 'claude';
  const T = sceneTime(Number.isFinite(t) ? t : 0, dur);
  const m = props.marks;
  const b0 = beats[0] !== undefined && Number.isFinite(beats[0]) ? beats[0] : 0;
  const b1 = beats[1] !== undefined && Number.isFinite(beats[1]) ? beats[1] : b0 + 3;
  if (mode === 'claude') {
    const claude = mk(m, 0, b0 + 0.2);
    const neither = mk(m, 1, b0 + 1.4);
    const gem = mk(m, 2, b0 + 3.8);
    const setup = mk(m, 3, b0 + 4.8);
    const fade = e(T, gem - 0.2, 0.4);
    return {
      chart: e(T, 0, 0.4),
      chip: { swap: e(T, gem - 0.1, 0.45) },
      series: CLAUDE.map((s, i) => ({ id: s.id, draw: progress(T, claude + i * 0.25, 0.9), label: e(T, neither + i * 0.2, 0.35), opacity: 1 - fade })),
      data: 'claude',
      episodes: 0,
      setup: e(T, setup - 0.2, 0.4),
      hedge: 0,
    };
  }
  const never = mk(m, 0, b0 + 0.5);
  const tr = mk(m, 1, b1 + 0.2);
  const slipped = mk(m, 2, b1 + 0.8);
  const paper = mk(m, 3, b1 + 2.0);
  const draws = [progress(T, never - 0.3, 0.8), progress(T, Math.min(tr, slipped - 0.4), 1.1), progress(T, paper - 0.3, 0.9)];
  const labels = [e(T, never + 0.5, 0.35), e(T, slipped + 0.5, 0.35), e(T, paper + 0.4, 0.35)];
  return {
    chart: 1,
    chip: { swap: 1 },
    series: GEMINI.map((s, i) => ({ id: s.id, draw: draws[i], label: labels[i], opacity: 1 })),
    data: 'gemini',
    episodes: e(T, never + 0.8, 0.4),
    setup: 1,
    hedge: e(T, paper + 0.6, 0.4),
  };
}
