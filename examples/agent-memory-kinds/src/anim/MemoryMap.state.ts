// Pure state of the memory map, the cold open (scene 1): the robot holding the red slip in the
// middle, and four tiles around it, one per kind of memory on the job, each with its human name
// and how it fails. Everything is on screen at full legibility from frame 0 (the first-second
// rule); while the hook is spoken an emphasis sweeps across the tiles one after another, the last
// one peaking on "more", then all four hold the same soft glow from "places".
// Marks: [start of the sweep, its last peak ("more"), the hold ("places")].
// No Remotion or React here.
import { beatOr, blinkAt, bump, ease, loopTime, mark } from './memory.ts';
import { clamp01, sceneTime } from './steps.ts';

export type MemoryMapProps = { marks?: number[] };

/** The four tiles, in sweep order (reading order: top left, top right, bottom left, bottom right). */
export const TILES = [
  { kind: 'desk', label: 'THE DESK', fail: ['runs out of room'] },
  { kind: 'gist', label: 'THE GIST', fail: ['keeps the point,', 'not the words'] },
  { kind: 'notebook', label: 'THE NOTEBOOK', fail: ['only if you', 'know to look'] },
  { kind: 'form', label: 'THE FORM', fail: ['misremembers'] },
] as const;
export type TileKind = (typeof TILES)[number]['kind'];

/** How strongly the tiles glow once the sweep is over (all four alike). */
export const HOLD = 0.6;
/** Length of one tile's pulse, in seconds. */
const PULSE = 1;

export type MapState = {
  /** Per tile: always 1 (nothing is hidden at any frame). */
  opacity: number[];
  /** Per tile: the emphasis (glow and a slight scale), 0..1. */
  emphasis: number[];
  /** Per tile: a small idle float, in px. */
  float: number[];
  robot: { bob: number; blink: number };
  slip: { glow: number };
};

export function frameState(props: MemoryMapProps, t: number, beats: number[], dur: number): MapState {
  const T = sceneTime(Number.isFinite(t) ? t : 0, dur);
  const tm = loopTime(t, dur);
  const m = props.marks;
  const b0 = beatOr(beats, 0, 0);
  const start = mark(m, 0, b0 + 0.9);
  const peak = Math.max(start, mark(m, 1, b0 + 3.5));
  const hold = mark(m, 2, peak + 0.4);
  const held = HOLD * ease(T, hold - 0.1, 0.5);
  const emphasis = TILES.map((_, i) => {
    const at = start + ((peak - start) * i) / (TILES.length - 1);
    return clamp01(Math.max(bump(T, at - PULSE / 2, PULSE), held));
  });
  return {
    opacity: TILES.map(() => 1),
    emphasis,
    float: TILES.map((_, i) => 4 * Math.sin(tm * 1.6 + i * 1.7)),
    robot: { bob: Math.sin(tm * 2.4), blink: blinkAt(tm, 2.6) },
    slip: { glow: 0.45 + 0.35 * Math.sin(tm * 3) },
  };
}
