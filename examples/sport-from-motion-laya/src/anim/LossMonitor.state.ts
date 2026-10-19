// Pure state of the LossMonitor scenes (script v2.0, scenes 16-18): fine-tuning drawn as a heart
// monitor. Each mini monitor is a stage of glowing dots over a strip with the training loss traced
// epoch by epoch and a dashed "guessing" line. A run that learns nothing stays flat; a run that
// learns breaks below the line and its dots light up in teal.
// - wall: fifteen runs that differ only in the random seed (rows marked by die faces);
// - coin: one run pulled out and flipped between its two possible outcomes.
// Illustrative visuals, chosen for impact; the numbers on screen come from the article.
// No Remotion or React here.
import { beatAt, clamp01, easeOutCubic, fit, progress, sceneTime } from './steps.ts';

export type MonitorMode = 'wall' | 'coin';

export type MonitorProps = {
  mode: MonitorMode;
  /** Video second the scene starts at (timeline.ts), so the dots keep one clock across scenes. */
  clock?: number;
  /**
   * Scene seconds of spoken words the picture lands on (timeline.ts resolves them from the TTS
   * word timestamps). wall: "random", "learned", "never".
   */
  marks?: number[];
};

export type WallCell = { seed: number; split: number; learned: boolean; trace: number[] };
export type Curves = {
  CONTROL: number[];
  TAKEOFF: number[];
  LATE: number[];
  FLAT: number[];
  chance: number;
  wall: WallCell[][];
};

export const EPOCHS = 32;
/** A mini trace "left chance" once its running-minimum calibration CE goes below this. */
export const BREAK_CE = 1.3;

const fin = (x: number, d = 0) => (Number.isFinite(x) ? x : d);

/** Piecewise-linear value through (time, value) knots, held flat outside them. */
export function knots(t: number, ks: [number, number][]): number {
  if (!ks.length) return 0;
  if (!(t > ks[0][0])) return ks[0][1];
  for (let i = 1; i < ks.length; i++) {
    const [t0, v0] = ks[i - 1];
    const [t1, v1] = ks[i];
    if (t <= t1) return t1 > t0 ? v0 + ((v1 - v0) * (t - t0)) / (t1 - t0) : v1;
  }
  return ks[ks.length - 1][1];
}

/** First epoch (1-based) at which a mini trace goes below BREAK_CE, or null. */
export const breakEpoch = (trace: number[]): number | null => {
  const i = trace.findIndex((v) => v < BREAK_CE);
  return i < 0 ? null : i + 1;
};

export type TraceState = {
  series: 'CONTROL' | 'TAKEOFF' | 'LATE' | 'FLAT' | 'cell';
  /** Drawn up to this epoch (1..32; below 1 nothing is drawn). */
  upto: number;
  /** 0 = grey (still on the line), 1 = teal (it broke away). */
  lit: number;
  /** 0..1 turn to rose (a flatline that never left). */
  rose: number;
  /** Amber control trace. */
  warm: number;
  opacity: number;
  dashed: number;
};

export type MarkerState = { epoch: number; text: string; opacity: number; tone: 'ok' | 'flat' | 'warm' | 'muted' };

const litAfter = (upto: number, brk: number | null) => (brk === null ? 0 : clamp01((upto - brk) / 1.5));

export function frameState(p: MonitorProps, time: number, beats: number[], dur: number, data: Curves) {
  const t = sceneTime(time, dur);
  const d = Number.isFinite(dur) && dur > 0 ? dur : 1;
  const raw = fin(time);
  const playT = Math.max(0, fin(p.clock ?? 0) + Math.min(Math.max(raw, 0), d));
  const mode = p.mode;
  const b0 = beatAt(beats, 0);
  const has = (i: number) => beats[i] !== undefined && Number.isFinite(beats[i]);
  const b1 = has(1) ? beats[1] : b0 + 0.45 * (d - b0);
  // End of the scene's last line (the scene tail is 0.8 s).
  const lineEnd = Math.max(b0 + 0.8, d - 0.8);
  const mark = (i: number, frac: number) => {
    const m = p.marks?.[i];
    return m !== undefined && Number.isFinite(m) ? m : b0 + frac * (lineEnd - b0);
  };

  let cells: { seed: number; split: number; learned: boolean; upto: number; lit: number; rose: number; opacity: number }[] = [];
  /** The die ("random seed"): how far its roll is and the face it shows. */
  let die = { opacity: 0, roll: 0, face: 1 };
  /** Row markers (die faces), one per seed. */
  let rows = [0, 0, 0];
  let coin = { angle: 0, opacity: 0, settle: 0 };
  let quote = { words: 0, opacity: 0, foot: 0 };
  let tally = { learned: 0, total: 0, opacity: 0 };

  if (mode === 'wall') {
    // "Same data, same recipe; only the random seed changed.": a die rolls in ("random seed") and
    // the wall of fifteen mini monitors fills, all on the guessing line. "Some runs learned.": the
    // runs play out, nine break away (teal), the tally counts them. "Others never left the flat
    // line.": the other six turn rose. Seed 2's one learner breaks late, last of the nine.
    const randomAt = mark(0, 0.45);
    const learnedAt = Math.max(b1 + 0.3, mark(1, 0.72));
    const neverAt = Math.max(learnedAt + 0.4, mark(2, 0.85));
    const roll = easeOutCubic(progress(t, fit(randomAt - 0.35, 0.9, d), 0.9));
    die = { opacity: progress(t, fit(randomAt - 0.35, 0.25, d), 0.25), roll, face: roll < 1 ? 1 + (Math.floor(roll * 7) % 6) : 3 };
    const drawEnd = learnedAt + 0.2;
    cells = data.wall.flat().map((c, i) => {
      const late = c.seed === 2 && c.learned;
      const appear = fit(b0 + 0.6 + c.seed * 0.25 + (c.split - 1) * 0.06, 0.25, d);
      const upto = knots(t, [
        [appear, 1],
        [Math.max(appear + 0.3, b1 - 0.1), 8],
        [Math.max(appear + 0.6, drawEnd), late ? 28 : EPOCHS],
        [Math.max(appear + 0.9, late ? drawEnd + 0.45 : drawEnd), EPOCHS],
      ]);
      const brk = breakEpoch(c.trace);
      return {
        seed: c.seed,
        split: c.split,
        learned: c.learned,
        upto,
        // A learner that only breaks at the very end (seed 2) still lights once its trace is complete.
        lit: c.learned ? litAfter(upto, Math.min(brk ?? EPOCHS, EPOCHS - 1.5)) : 0,
        rose: c.learned ? 0 : progress(t, fit(neverAt - 0.1 + (i % 5) * 0.04, 0.3, d), 0.3),
        opacity: progress(t, appear, 0.25),
      };
    });
    const learned = cells.filter((c) => c.lit >= 0.5).length;
    tally = { learned, total: cells.length, opacity: progress(t, fit(learnedAt - 0.1, 0.25, d), 0.25) };
    rows = [0, 1, 2].map((r) => progress(t, fit(b0 + 0.6 + r * 0.25, 0.25, d), 0.25));
  }

  if (mode === 'coin') {
    // One run pulled out and flipped like a coin between its two faces; it ends on its edge
    // while the sentence writes itself underneath.
    const flipEnd = Math.max(b0 + 1.2, lineEnd - 0.1);
    // Hold a face, flip, hold the other... three flips, then it tips onto its edge.
    const turns = 3;
    const seg = Math.max(0.5, (flipEnd - 0.7) / (turns + 0.6));
    let angle = 0;
    for (let k = 0; k < turns; k++) angle += 180 * easeOutCubic(progress(t, 0.1 + seg * (k + 0.6), 0.3));
    const settle = easeOutCubic(progress(t, 0.1 + seg * (turns + 0.6), 0.6));
    coin = { angle: angle + 72 * settle, opacity: progress(t, 0, 0.2), settle };
    quote = {
      words: clamp01((t - b0) / Math.max(0.6, lineEnd - b0)),
      opacity: progress(t, fit(b0 - 0.05, 0.2, d), 0.2),
      foot: progress(t, fit(lineEnd - 1.0, 0.4, d), 0.4),
    };
  }

  return { mode, playT, cells, die, rows, tally, coin, quote };
}
