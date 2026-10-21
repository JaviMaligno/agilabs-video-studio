// Pure state of the mechanism scene. One phase per narration beat:
//   0 compare     the three opened gauges; ghost needles fan out both ways ("random"), then snap
//                 to the real ones: every bug pushed the same way
//   1 confirm     a conveyor: a reading inside the expected arc gets DONE and goes to the shelf,
//                 its magnet still glowing faintly through the face
//   2 contradict  a reading outside the arc drops under the magnifier: lid up, magnet out, binned;
//                 more cycles, faster; the shelf fills with DONE gauges, magnets all on one side
//   3 verdict     freeze: "The instrument isn't biased. My stopping rule is."
//   4 audit       the magnifier walks the DONE shelf and lifts the first lid: a magnet
// Illustrative of the article's mechanism, not a replay of any run. No Remotion or React here.
import { clamp01, sceneTime } from './steps.ts';
import { ease, fillBeats, lerp, popScale, window01 } from './gauge.ts';

export type StoppingProps = Record<string, never> | { [k: string]: unknown };

export type Kind = 'confirm' | 'contradict';
/** The conveyor's items: [kind, beat it belongs to, offset from that beat, speed]. */
export const ITEMS: [Kind, number, number, number][] = [
  ['confirm', 1, 0.15, 1],
  ['contradict', 2, 0.05, 1],
  ['confirm', 2, 1.2, 0.7],
  ['contradict', 2, 1.7, 0.7],
  ['confirm', 2, 2.2, 0.7],
];
export const BELT = { x0: -130, x1: 300, y: 600, r: 78 } as const;
export const SHELF = { y: 245, r: 74, xs: [470, 650, 830] } as const;
export const STATION = { x: 640, y: 875, r: 78 } as const;
export const BIN = { x: 870, y: 1010 } as const;
/** Readings: inside the expected arc (confirming), outside it (contradicting), and the true one. */
export const CONFIRM_V = 0.17;
export const CONTRA_V = 0.64;
export const TRUE_V = 0.46;

export type Item = {
  kind: Kind;
  x: number;
  y: number;
  r: number;
  value: number;
  opacity: number;
  lift: number;
  magnetV: number;
  magnetOut: number;
  /** Magnet flight to the bin, 0..1 (contradict only). */
  binned: number;
  done: { scale: number; opacity: number };
  xray: number;
};

export type StoppingState = {
  compare: { opacity: number; ghosts: number; snap: number; arrows: number };
  stage: number;
  items: Item[];
  binCount: number;
  verdict: { scrim: number; line1: number; line2: number; underline: number };
  audit: { lens: number; x: number; lift: number; label: number };
};

const LENS = [3.2, 3.8, 3.6, 3.4, 4.2];

export function frameState(_props: StoppingProps, t0: number, beats: number[], dur: number): StoppingState {
  const t = sceneTime(t0, dur);
  const b = fillBeats(beats, LENS, dur);

  let slot = 0;
  let binCount = 0;
  const items: Item[] = ITEMS.map(([kind, beat, off, speed]) => {
    const s0 = b[beat] + off;
    const k = (x: number) => s0 + x * speed;
    const arrive = ease(t, k(0), 0.6 * speed);
    const settle = ease(t, k(0.45), 0.4 * speed);
    const base = { kind, r: BELT.r, xray: 0, binned: 0, magnetOut: 0, lift: 0, done: { scale: 0, opacity: 0 } };
    if (kind === 'confirm') {
      const mine = SHELF.xs[Math.min(slot++, SHELF.xs.length - 1)];
      const stamp = k(0.85);
      const move = ease(t, k(1.15), 0.6 * speed);
      return {
        ...base,
        x: lerp(lerp(BELT.x0, BELT.x1, arrive), mine, move),
        y: lerp(BELT.y, SHELF.y, move),
        r: lerp(BELT.r, SHELF.r, move),
        value: lerp(0.5, CONFIRM_V, settle),
        opacity: arrive,
        magnetV: 0.16,
        xray: ease(t, k(1.2), 0.5),
        done: { scale: popScale(t, stamp, 0.3), opacity: clamp01((t - stamp) / 0.1) },
      };
    }
    binCount += ease(t, k(1.9), 0.3) >= 1 ? 1 : 0;
    const drop = ease(t, k(0.85), 0.5 * speed);
    const lift = window01(t, k(1.25), k(2.25), 0.3 * speed);
    const out = ease(t, k(1.45), 0.4 * speed);
    return {
      ...base,
      x: lerp(lerp(BELT.x0, BELT.x1, arrive), STATION.x, drop),
      y: lerp(BELT.y, STATION.y, drop),
      value: lerp(lerp(0.5, CONTRA_V, settle), TRUE_V, ease(t, k(1.7), 0.5 * speed)),
      opacity: arrive * (1 - ease(t, k(2.4), 0.4 * speed)),
      lift,
      magnetV: 0.7,
      magnetOut: out,
      binned: ease(t, k(1.6), 0.5 * speed),
    };
  });

  const auditLens = ease(t, b[4] + 0.1, 0.4);
  const walk = ease(t, b[4] + 0.2, 1.4);
  return {
    compare: {
      opacity: ease(t, b[0] - 0.2, 0.4) * (1 - ease(t, b[1] - 0.25, 0.3)),
      ghosts: ease(t, b[0] + 0.2, 0.4) * (1 - ease(t, b[0] + 1.75, 0.3)),
      snap: ease(t, b[0] + 1.75, 0.4),
      arrows: ease(t, b[0] + 2.0, 0.3),
    },
    stage: ease(t, b[1] - 0.15, 0.4),
    items,
    binCount,
    verdict: {
      scrim: window01(t, b[3] - 0.1, b[4] - 0.1, 0.3),
      line1: window01(t, b[3], b[4] - 0.1, 0.35),
      line2: window01(t, b[3] + 1.3, b[4] - 0.1, 0.35),
      underline: ease(t, b[3] + 1.6, 0.4),
    },
    audit: {
      lens: auditLens,
      x: lerp(SHELF.xs[2] + 40, SHELF.xs[0], walk),
      lift: ease(t, b[4] + 1.5, 0.4),
      label: ease(t, b[4] + 0.3, 0.4),
    },
  };
}
