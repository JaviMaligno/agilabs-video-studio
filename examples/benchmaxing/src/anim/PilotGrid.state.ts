// Pure state of the pilot's grid: the article's first figure redrawn, 4 rows x 2 models. It
// assembles empty ("five cases per model"), fills with the article's labels, brackets the tie,
// and closes as one small probe (no verdict stamps). No Remotion or React.
import { machine, type ModeDef } from './tracks.ts';

export const GRID_MODES = ['empty', 'filled', 'probe'] as const;
export type GridMode = (typeof GRID_MODES)[number];
export type PilotGridProps = { mode: GridMode; marks?: number[] };

export type Verdict = 'Incomplete' | 'Guarantee fails' | 'Covered';
/** The article's first figure: row label, case code, and the label for Opus 5 and Fable 5. */
export const ROWS: { label: string; code: string; cells: [Verdict, Verdict] }[] = [
  { label: 'Double charge', code: 'D1', cells: ['Incomplete', 'Incomplete'] },
  { label: 'Paused workers', code: 'D2/D2b', cells: ['Guarantee fails', 'Guarantee fails'] },
  { label: 'Permissions', code: 'D3', cells: ['Covered', 'Covered'] },
  { label: 'Mix and cost', code: 'D4', cells: ['Covered', 'Covered'] },
];
export const MODELS = ['Opus 5', 'Fable 5'] as const;
export const GRID_TXT = {
  kicker: 'a small pilot',
  five: 'five cases per model',
  runs: 'one valid run per model and case · synthetic · exploratory',
  tie: 'tie',
  foot: '“Covered” does not mean perfection or general performance.',
  probe: 'a probe',
  probeSub: 'five cases · one run each · exploratory',
} as const;

const INIT = { grid: 0, rows: 0, five: 0, runs: 0, c1: 0, c2: 0, c3: 0, c4: 0, tie: 0, foot: 0, dimGrid: 0, probe: 0 };
export type GridField = keyof typeof INIT;

const on = (at: number | ['m' | 'b', number, number?], len = 0.45) => ({ to: 1, at, len });

const DEFS: [GridMode, ModeDef<GridField>][] = [
  // "So I ran a small pilot. Five cases per model." marks: pilot, five.
  ['empty', { set: { grid: on(0.1, 0.5), rows: { to: 1, at: ['m', 0, -0.2], len: 0.9, ease: 'linear' }, five: on(['m', 1, -0.05], 0.4), runs: on(['m', 1, 0.3], 0.45) } }],
  // "On permissions and data analysis, they tied." marks: permissions, data, tied.
  [
    'filled',
    {
      set: {
        c1: on(0.2, 0.4),
        c2: on(0.55, 0.4),
        c3: on(['m', 0, -0.1], 0.4),
        c4: on(['m', 1, -0.1], 0.4),
        tie: on(['m', 2, -0.05], 0.35),
        foot: on(['m', 2, 0.35], 0.4),
      },
    },
  ],
  // "Five cases are a probe, not an answer." marks: probe. Reported neutrally: the grid steps back
  // and a calm card names what it was, a probe; no stamp.
  ['probe', { set: { dimGrid: on(['m', 0, -0.35], 0.45), probe: on(['m', 0, -0.1], 0.5) } }],
];

export const GRID = machine(INIT, DEFS);
export type GridState = Record<GridField, number>;

export function frameState(props: PilotGridProps, t: number, beats: number[], dur: number): GridState {
  const mode = GRID_MODES.includes(props.mode) ? props.mode : 'empty';
  return GRID.at(mode, t, beats, dur, props.marks);
}
