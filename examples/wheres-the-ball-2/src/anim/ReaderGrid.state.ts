// Pure state of the ReaderGrid: the 2×2 of who reads (trained for this task / frontier AI
// zero-shot) × what gets read (TV pixels / player tracks), filled one cell at a time against the
// test "beats pointing at the middle?" (50 % = coin flip). Each mode shows every earlier mode
// finished, so consecutive scenes blend with no jump. Figures are the article's strings.
// No Remotion or React here.
import { beatAt, clamp01, easeOutCubic, fit, progress, sceneTime } from './steps.ts';

export const GRID_MODES = ['rows', 'columns', 'question', 'trained', 'frontier', 'astext', 'footnotes', 'verdict'] as const;
export type GridMode = (typeof GRID_MODES)[number];

export type GridProps = {
  mode: GridMode;
  /** Scene seconds of named steps (from the voiced words); defaults follow the beats. */
  cues?: Record<string, number>;
  blend?: boolean;
};

/** One cell: row 0 = trained, row 1 = frontier; col 0 = TV pixels, col 1 = player tracks. */
export type CellDef = { row: 0 | 1; col: 0 | 1; chip: string; value: number; display: string; mode: GridMode; cue: string };

/** The article's figures: "82% from the tracks, 74% from the pixels", "53% on pixels", "35–38%". */
export const CELLS: CellDef[] = [
  { row: 0, col: 0, chip: 'small vision net', value: 74, display: '74%', mode: 'trained', cue: 'pixels' },
  { row: 0, col: 1, chip: '60 kB net', value: 82, display: '82%', mode: 'trained', cue: 'tracks' },
  { row: 1, col: 0, chip: 'GPT · Opus', value: 53, display: '53%', mode: 'frontier', cue: 'pixels' },
  { row: 1, col: 1, chip: 'GPT · Opus · as text', value: 36.5, display: '35–38%', mode: 'astext', cue: 'tracks' },
];

export const FILL_SECONDS = 0.9;
/**
 * Consecutive grid scenes cross-blend for 0.6 s: anything that moves or swaps text starts after
 * that, or the outgoing and incoming copies would show at once, offset.
 */
export const AFTER_BLEND = 0.65;
const late = (x: number) => Math.max(AFTER_BLEND, x);
/** Where the dashed "coin flip" line sits on the meter. */
export const CHANCE = 50;

const at = (m: GridMode) => GRID_MODES.indexOf(m);

export function frameState(p: GridProps, time: number, beats: number[], dur: number) {
  const t = sceneTime(time, dur);
  const d = Number.isFinite(dur) && dur > 0 ? dur : 1;
  const m = at(p.mode);
  const b0 = beatAt(beats, 0);
  const bi = (i: number, fallback: number) => (beats[i] !== undefined && Number.isFinite(beats[i]) ? beats[i] : fallback);
  const cue = (name: string, fallback: number) => {
    const c = p.cues?.[name];
    return c !== undefined && Number.isFinite(c) ? c : fallback;
  };
  /** Progress of a step belonging to mode `mode`: 1 in later modes, animated in its own, 0 before. */
  const step = (mode: GridMode, start: number, len: number) => {
    const k = at(mode);
    if (m > k) return 1;
    if (m < k) return 0;
    return progress(t, fit(start, len, d), len);
  };

  // Axis titles in the band before the question takes it.
  const whoReads = step('rows', b0, 0.4);
  const whatRead = step('columns', late(b0), 0.4);
  const titleOut = step('question', b0 - 0.05, 0.3);

  const rows = [step('rows', cue('trained', b0 + 1.2), 0.45), step('rows', cue('frontier', b0 + 3), 0.45)];
  const headers = [step('columns', cue('pixels', b0 + 0.8), 0.45), step('columns', cue('tracks', b0 + 2), 0.45)];

  // The question arrives once the axis title has gone (no two texts crossing in the band).
  const q1 = step('question', late(b0 + 0.3), 0.35);
  const q2 = step('question', bi(1, b0 + 1.6), 0.4);
  const meters = [0, 1, 2, 3].map((i) => step('question', bi(1, b0 + 1.6) + 0.5 + i * 0.12, 0.4));

  // Row 0 lights as "the trained models did" is said.
  const trainedRow = step('trained', b0 + 0.1, 0.5);

  const cells = CELLS.map((c, i) => {
    const fallback = c.mode === 'trained' ? bi(1, b0 + 1.4) + (c.col === 1 ? 0 : 2) : c.mode === 'frontier' ? bi(1, b0 + 1.4) : b0 + 1.5;
    const fill = easeOutCubic(step(c.mode, cue(c.cue, fallback), FILL_SECONDS));
    const done = fill >= 1;
    return {
      row: c.row,
      col: c.col,
      chip: c.chip,
      outline: rows[c.row],
      icon: headers[c.col],
      meter: meters[i],
      fill,
      value: c.value,
      /** Counting up while it fills, then the article's exact string. */
      // A range ("35–38%") is never counted through: it fades in as written.
      text: done || c.display.includes('–') ? c.display : `${Math.round(c.value * fill)}%`,
      figure: fill > 0 ? (c.display.includes('–') ? fill : clamp01(fill * 3)) : 0,
      above: c.value > CHANCE,
      check: c.row === 0 ? step(c.mode, cue(c.cue, fallback) + FILL_SECONDS, 0.35) : 0,
    };
  });

  // The coin beside 53%: flips from "a coin flip" for 1.2 s, then rests.
  const coinStart = cue('coin', bi(1, b0) + 1.2);
  const coinShow = step('frontier', coinStart - 0.2, 0.3);
  const coinTurns = p.mode === 'frontier' ? Math.min(Math.max(0, t - coinStart), 1) * 2 : m > at('frontier') ? 2 : 0;
  // "below chance" tag on the frontier tracks cell.
  const below = step('astext', cue('below', b0 + 3), 0.4);

  // Footnotes, then the verdict takes their place.
  const verdictB1 = bi(1, b0 + 1.6);
  const verdictB2 = bi(2, verdictB1 + 1.6);
  const notesOut = p.mode === 'verdict' ? progress(t, fit(verdictB1 - 0.35, 0.35, d), 0.35) : 0;
  const notes = [step('footnotes', b0 + 0.2, 0.45) * (1 - notesOut), step('footnotes', cue('easy', b0 + 2.8), 0.45) * (1 - notesOut)];

  const qOut = step('verdict', late(b0 - 0.1) - 0.05, 0.3);
  const info = step('verdict', late(b0 + 0.25) + 0.3, 0.4);
  const training = easeOutCubic(step('verdict', verdictB1 + 0.05, 0.45));
  const input = easeOutCubic(step('verdict', verdictB2 + 0.05, 0.45));
  const strike = step('verdict', verdictB2 + 0.5, 0.35);

  return {
    band: { whoReads: whoReads * (1 - titleOut), whatRead: whatRead * (1 - titleOut), grow: whatRead, q1: q1 * (1 - qOut), q2: q2 * (1 - qOut), info },
    rows: rows.map((o, r) => ({ opacity: o, lit: r === 0 ? Math.max(trainedRow * (1 - training), training) : 0 })),
    headers: headers.map((o) => ({ opacity: o })),
    cells,
    coin: { opacity: coinShow, turns: coinTurns },
    below: { opacity: below },
    notes: notes.map((o) => ({ opacity: o })),
    verdict: {
      /** The cell that proves the information is there (trained · tracks) rings. */
      info,
      training,
      /** Frontier row dims as training is named. */
      dim: training * 0.55,
      input,
      strike,
    },
  };
}
