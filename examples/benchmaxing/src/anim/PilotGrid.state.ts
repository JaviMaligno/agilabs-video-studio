// Pure state of the pilot's grid: the article's first figure extended by its October update, the
// seven models as rows and the four case groups as columns. It assembles empty ("seven models,
// five cases each"), fills the worker column after the race (runs that kept the rule, of 8), then
// the other columns and the near-tie, and closes as one small probe. No Remotion or React.
import { machine, type ModeDef } from './tracks.ts';

export const GRID_MODES = ['empty', 'workers', 'filled', 'probe'] as const;
export type GridMode = (typeof GRID_MODES)[number];
export type PilotGridProps = { mode: GridMode; marks?: number[] };

export type Tone = 'ok' | 'warm';
export type Cell = { text: string; tone: Tone };
const ok = (text: string): Cell => ({ text, tone: 'ok' });
const gap = (text: string): Cell => ({ text, tone: 'warm' });

/** Columns: the article's four case groups. */
export const COLS = [
  { label: 'Double charge', lines: ['Double', 'charge'], code: 'D1' },
  { label: 'Paused workers', lines: ['Paused', 'workers'], code: 'D2/D2b' },
  { label: 'Permissions', lines: ['Permissions', ''], code: 'D3' },
  { label: 'Mix and cost', lines: ['Mix and', 'cost'], code: 'D4' },
] as const;

/**
 * Rows, from the article and its update: D1 complete/incomplete, D2+D2b runs that kept the
 * at-most-one rule (4 runs per case, 8 per model), D3 covered, D4 covered or partial.
 */
export const ROWS: { model: string; cells: [Cell, Cell, Cell, Cell]; group?: 'top' | 'claude' }[] = [
  { model: 'Opus 5', cells: [gap('gaps'), gap('0/8'), ok('✓'), ok('✓')], group: 'claude' },
  { model: 'Fable 5', cells: [gap('gaps'), gap('0/8'), ok('✓'), ok('✓')], group: 'claude' },
  { model: 'Kimi K3.1 Pro', cells: [gap('gaps'), ok('7/8'), ok('✓'), ok('✓')], group: 'top' },
  { model: 'Gemini 4 Argon', cells: [ok('✓'), ok('6/8'), ok('✓'), ok('✓')], group: 'top' },
  { model: 'DeepSeek V4 Pro', cells: [gap('gaps'), gap('2/8'), ok('✓'), gap('partial')] },
  { model: 'Qwen3.8', cells: [gap('gaps'), gap('2/8'), ok('✓'), gap('partial')] },
  { model: 'GLM 5.3', cells: [gap('gaps'), gap('1/8'), ok('✓'), ok('✓')] },
];

export const GRID_TXT = {
  kicker: 'a small pilot',
  head: 'seven models · five cases',
  runs: 'workers: 4 runs per case · others: 1 run · exploratory',
  tie: 'almost a tie',
  probe: 'a probe',
  probeSub: 'seven models · five cases · exploratory',
} as const;

const INIT = { grid: 0, rows: 0, head: 0, runs: 0, d2: 0, hiTop: 0, hiClaude: 0, d1: 0, d3: 0, d4: 0, tie: 0, dimGrid: 0, probe: 0 };
export type GridField = keyof typeof INIT;

const on = (at: number | ['m' | 'b', number, number?], len = 0.45) => ({ to: 1, at, len });
const off = (at: number | ['m' | 'b', number, number?], len = 0.4) => ({ to: 0, at, len });

const DEFS: [GridMode, ModeDef<GridField>][] = [
  // "So I ran a small pilot. Seven models, five cases each." marks: pilot, seven.
  ['empty', { set: { grid: on(0.1, 0.5), rows: { to: 1, at: ['m', 0, -0.2], len: 1.2, ease: 'linear' }, head: on(['m', 1, -0.05], 0.4), runs: on(['m', 1, 0.4], 0.45) } }],
  // "Kimi and Gemini kept the rule most of the time. Opus and Fable never did."
  // marks: kimi, gemini, opus, fable. The worker column fills row by row, then the two groups light.
  [
    'workers',
    {
      set: {
        d2: { to: 1, at: ['m', 0, -0.35], len: 0.9, ease: 'linear' },
        hiTop: on(['m', 1, 0], 0.4),
        hiClaude: on(['m', 3, 0], 0.4),
      },
    },
  ],
  // "On permissions and data analysis, almost all tied." marks: permissions, data, tied.
  [
    'filled',
    {
      set: {
        hiTop: off(0.1),
        hiClaude: off(0.1),
        d1: on(0.2, 0.5),
        d3: on(['m', 0, -0.1], 0.45),
        d4: on(['m', 1, -0.1], 0.45),
        tie: on(['m', 2, -0.05], 0.35),
      },
    },
  ],
  // "Five cases are a probe, not an answer." marks: probe. The grid steps back and a calm card
  // names what it was, a probe; no stamp.
  ['probe', { set: { dimGrid: on(['m', 0, -0.35], 0.45), probe: on(['m', 0, -0.1], 0.5) } }],
];

export const GRID = machine(INIT, DEFS);
export type GridState = Record<GridField, number>;

export function frameState(props: PilotGridProps, t: number, beats: number[], dur: number): GridState {
  const mode = GRID_MODES.includes(props.mode) ? props.mode : 'empty';
  return GRID.at(mode, t, beats, dur, props.marks);
}
