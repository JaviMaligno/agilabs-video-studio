// Pure state of the LossMonitor scenes: fine-tuning drawn as a heart monitor. Under a stage of
// glowing dots (the first video's hook clip) runs a strip with the training loss traced epoch by
// epoch and a dashed "chance" line. A run that learns nothing is a flatline; a run that learns
// "pulses": its trace breaks below the line and its dots light up in teal.
// Illustrative visuals, chosen for impact; the numbers on screen come from the article.
// No Remotion or React here.
import { beatAt, clamp01, easeOutCubic, fit, progress, sceneTime } from './steps.ts';

export type MonitorMode = 'seeds3' | 'official' | 'control' | 'curves' | 'wall' | 'coin';

export type MonitorProps = {
  mode: MonitorMode;
  /** Video second the scene starts at (timeline.ts), so the dots keep one clock across scenes. */
  clock?: number;
  /**
   * Scene seconds of spoken words the picture lands on (from the TTS word timestamps):
   * curves: "10", "22", "32"; wall: "9", "6"; seeds3: "seed".
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
/** Where the big curves leave the chance line, as the article's figure alt text gives them. */
export const BREAKS = { TAKEOFF: 10, LATE: 22 } as const;

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

const trace = (series: TraceState['series'], upto: number, extra: Partial<TraceState> = {}): TraceState => ({
  series,
  upto: Math.max(0, Math.min(EPOCHS, fin(upto))),
  lit: 0,
  rose: 0,
  warm: 0,
  opacity: 1,
  dashed: 0,
  ...extra,
});

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

  let xMax = EPOCHS;
  let traces: TraceState[] = [];
  let markers: MarkerState[] = [];
  /** Dark overlay on the monitor (switched off). */
  let power = 1;
  /** The cut at epoch 4 (official recipe). */
  let cut = { epoch: 4, opacity: 0, text: '4 epochs' };
  /** Sport pills: glow per pill and how much they pulse together (flatline = all equal). */
  let pills = [0.5, 0.5, 0.5, 0.5];
  let together = 0;
  let dotsLit = 0;
  const heads: Record<string, number> = {};
  const chips: Record<string, number> = {};
  let cells: { seed: number; split: number; learned: boolean; upto: number; lit: number; rose: number; opacity: number }[] = [];
  let columns: { seed: number; upto: number; lit: number; rose: number; stamp: number }[] = [];
  let coin = { angle: 0, opacity: 0, settle: 0 };
  let quote = { words: 0, opacity: 0, foot: 0 };
  let tally = { learned: 0, flat: 0, opacity: 0, flatOpacity: 0 };

  if (mode === 'seeds3') {
    // Three runs, split 1 of seeds 0, 1 and 2. Flat on the first line; the second line runs the
    // rest of training: two break away, the third stays on the line.
    const seedAt = mark(0, 0.5);
    const upto = knots(t, [
      [0, 3],
      [b1, 6],
      [Math.max(b1 + 0.4, seedAt), EPOCHS],
    ]);
    columns = [0, 1, 2].map((s) => {
      const tr = data.wall[s]?.[0]?.trace ?? [];
      const brk = breakEpoch(tr);
      return {
        seed: s,
        upto,
        lit: litAfter(upto, brk),
        rose: brk === null ? progress(t, Math.max(b1 + 0.4, seedAt), 0.4) : 0,
        stamp: easeOutCubic(progress(t, fit(Math.max(b1 + 0.4, seedAt) + 0.1 + s * 0.12, 0.35, d), 0.35)),
      };
    });
    heads.hook = 1;
    heads.sub = progress(t, fit(b1, 0.3, d), 0.3);
  }

  if (mode === 'official') {
    // Epochs 1-4 drawn on the first line, then the monitor is cut and goes dark; 23 %.
    xMax = 12;
    const cutAt = fit(Math.max(b0 + 1.2, b1 - 0.45), 0.4, d);
    const upto = knots(t, [
      [0, 0.6],
      [cutAt, 4],
    ]);
    traces = [trace('TAKEOFF', upto)];
    cut = { epoch: 4, opacity: progress(t, cutAt, 0.25), text: '4 epochs' };
    power = 1 - 0.55 * progress(t, cutAt + 0.15, 0.4);
    chips.result = easeOutCubic(progress(t, fit(cutAt + 0.3, 0.4, d), 0.4));
    // Every sport, the same score: the four pills pulse together.
    together = progress(t, fit(b1, 0.4, d), 0.4);
    const beat = 0.5 + 0.5 * Math.sin((raw * 2 * Math.PI) / 0.9);
    pills = [0, 1, 2, 3].map(() => 0.45 + 0.35 * together * beat);
    heads.official = progress(t, 0.15, 0.3);
  }

  if (mode === 'control') {
    // The tag sticker; the amber control falls fast, past the old cut at 4 (72 %), learned by 8,
    // at zero by 11. The grey dots trace stays on the line; on the second line the view pans on.
    const tagAt = fit(b0 + 0.15, 0.3, d);
    chips.tag = easeOutCubic(progress(t, tagAt, 0.35));
    chips.legend = progress(t, fit(tagAt + 0.45, 0.3, d), 0.3);
    const moreAt = Math.max(b0 + 1.6, b0 + 0.55 * (b1 - 0.35 - b0));
    const upto = knots(t, [
      [b0 + 0.3, 1],
      [moreAt - 0.2, 4.3],
      [moreAt + 0.3, 4.6],
      [Math.max(moreAt + 1.4, b1 - 0.5), 11],
    ]);
    const dotsUpto = knots(t, [
      [b0 + 0.3, 1],
      [Math.max(moreAt + 1.4, b1 - 0.5), 11],
      [Math.max(b1 + 1.2, lineEnd - 0.2), 18],
    ]);
    xMax = knots(t, [
      [b1, 12],
      [b1 + 1.0, 20],
    ]);
    const dim = 1 - 0.65 * progress(t, b1, 0.5);
    traces = [
      trace('CONTROL', upto, { warm: 1, opacity: dim }),
      trace('TAKEOFF', dotsUpto, { lit: 0.5 * clamp01((dotsUpto - 11) / 6) }),
    ];
    cut = { epoch: 4, opacity: 0.6 * progress(t, b0 + 0.3, 0.3) * dim, text: '' };
    // Marker labels leave before the view pans (they would crowd the narrower epochs).
    const gone = 1 - progress(t, b1 - 0.2, 0.3);
    markers = [
      { epoch: 4, text: '72% at 4 epochs', opacity: progress(t, fit(moreAt - 0.45, 0.3, d), 0.3) * gone, tone: 'warm' },
      { epoch: 8, text: '8: learned', opacity: clamp01((upto - 8) / 0.6) * gone, tone: 'warm' },
    ];
    // The tag gives the answer away: the soccer pill brightens as the control falls.
    const learn = clamp01((upto - 4) / 4);
    pills = [0.4 - 0.15 * learn, 0.4 - 0.15 * learn, 0.4 - 0.15 * learn, 0.4 + 0.6 * learn].map((x) => x * (0.5 + 0.5 * dim));
    heads.control = progress(t, 0.6, 0.3);
    heads.slow = progress(t, fit(b1 + 0.2, 0.3, d), 0.3);
  }

  if (mode === 'curves') {
    // Three runs drawn in turn; each lands on its spoken number.
    const m = [mark(0, 0.32), mark(1, 0.6), mark(2, 0.86)];
    const series = ['TAKEOFF', 'LATE', 'FLAT'] as const;
    const brk = [BREAKS.TAKEOFF, BREAKS.LATE, EPOCHS];
    traces = series.map((s, i) => {
      const start = Math.max(0, m[i] - (i === 0 ? 1.3 : 0.9));
      const upto = knots(t, [
        [start, 1],
        [m[i], brk[i]],
        [m[i] + (i === 2 ? 0.01 : 0.9), EPOCHS],
      ]);
      return trace(s, upto, {
        lit: s === 'FLAT' ? 0 : litAfter(upto, brk[i]),
        rose: s === 'FLAT' ? progress(t, m[i], 0.4) : 0,
        dashed: s === 'LATE' ? 1 : 0,
        opacity: i === 0 ? 1 : progress(t, start, 0.2),
      });
    });
    markers = [
      { epoch: 10, text: '10', opacity: progress(t, m[0] - 0.1, 0.25), tone: 'ok' },
      { epoch: 22, text: '22', opacity: progress(t, m[1] - 0.1, 0.25), tone: 'ok' },
      { epoch: 32, text: '32', opacity: progress(t, m[2] - 0.1, 0.25), tone: 'flat' },
    ];
    chips.end = progress(t, m[0] + 0.9, 0.3);
    heads.curves = progress(t, 0.15, 0.3);
  }

  if (mode === 'wall') {
    // Fifteen mini monitors, all flat, then the real outcome: 9 teal, 6 rose. Seed 2 split 5 (the late learner, epoch 32)
    // pulses only at the very end.
    const nineAt = mark(0, 0.62);
    const sixAt = mark(1, 0.85);
    const drawEnd = Math.max(b0 + 0.6, nineAt - 0.15);
    cells = data.wall.flat().map((c, i) => {
      const late = c.seed === 2 && c.learned;
      const upto = knots(t, [
        [b0 - 0.1 + (i % 5) * 0.04, 1],
        [drawEnd, late ? 28 : EPOCHS],
        // The late cell (seed 2, split 5) reaches epoch 32 and pulses on "nine", last of the
        // nine, so the tally never reads 9 while only 8 cells are teal.
        [late ? Math.max(drawEnd + 0.3, nineAt) : drawEnd, EPOCHS],
      ]);
      const brk = breakEpoch(c.trace);
      return {
        seed: c.seed,
        split: c.split,
        learned: c.learned,
        upto,
        lit: c.learned ? Math.max(litAfter(upto, brk), progress(t, late ? Math.max(drawEnd + 0.3, nineAt) - 0.1 : nineAt - 0.25 + (i % 5) * 0.03, 0.3)) : 0,
        rose: c.learned ? 0 : progress(t, fit(sixAt - 0.2 + (i % 5) * 0.03, 0.3, d), 0.3),
        opacity: progress(t, fit(0.05 + i * 0.02, 0.25, d), 0.25),
      };
    });
    const learned = data.wall.flat().filter((c) => c.learned).length;
    const flat = data.wall.flat().length - learned;
    tally = {
      learned: Math.round(learned * easeOutCubic(progress(t, fit(nineAt - 0.3, 0.55, d), 0.55))),
      flat,
      opacity: progress(t, fit(nineAt - 0.3, 0.25, d), 0.25),
      flatOpacity: progress(t, fit(sixAt - 0.1, 0.25, d), 0.25),
    };
    heads.wall = progress(t, 0.15, 0.3);
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
      foot: progress(t, fit(lineEnd - 0.2, 0.4, d), 0.4),
    };
  }

  // Dots light in teal while a pulsing trace is on screen (official / control stay grey).
  dotsLit = traces.length ? Math.max(0, ...traces.filter((x) => x.series !== 'CONTROL').map((x) => x.lit)) : 0;

  return { mode, playT, xMax, traces, markers, power, cut, pills, together, dotsLit, heads, chips, columns, cells, tally, coin, quote };
}
