// Pure state of the memory map: the robot holding the red slip, and five tiles, one per memory:
// TRAINING, DESK, SUMMARY, NOTEBOOK, FORM, each a one-word name over a drawing of how it fails.
// - all (default): everything on screen from frame 0 (the first-second rule, if it opens a video;
//   also the closing callback); the slip glows and the tiles hold a soft glow.
// - reveal (scene 3): the empty frames of the map draw in on the first beat; each tile is drawn as
//   it is named (marks 0-4) with a pulse, then stays on at the hold glow; the title comes in on
//   mark 5. Marks: [training, desk, summary, notebook, form, title].
// No Remotion or React here.
import { beatOr, blinkAt, bump, ease, loopTime, mark, pickMode } from './memory.ts';
import { clamp01, sceneTime } from './steps.ts';

export const MAP_MODES = ['all', 'reveal'] as const;
export type MapMode = (typeof MAP_MODES)[number];
export type MemoryMapProps = { mode?: MapMode; marks?: number[] };

/** The five tiles, in the order the script names them. */
export const TILES = [
  { kind: 'training', label: 'TRAINING' },
  { kind: 'desk', label: 'DESK' },
  { kind: 'summary', label: 'SUMMARY' },
  { kind: 'notebook', label: 'NOTEBOOK' },
  { kind: 'form', label: 'FORM' },
] as const;
export type TileKind = (typeof TILES)[number]['kind'];

/** The map's title, shown once every tile is on. */
export const MAP_TITLE = 'How an AI agent forgets';
/** How strongly the tiles glow once they are on. */
export const HOLD = 0.6;
/** Length of a tile's pulse when it is named, in seconds. */
const PULSE = 0.9;
/** Fade-in of a tile, in seconds. */
const IN = 0.35;

export type MapState = {
  /** The empty tile frames (dashed outlines) drawing in, 0..1. */
  frames: number;
  /** Per tile: how far it is drawn in, 0..1. */
  opacity: number[];
  /** Per tile: the emphasis (glow and a slight scale), 0..1. */
  emphasis: number[];
  /** Per tile: a small idle float, in px. */
  float: number[];
  title: number;
  robot: { bob: number; blink: number };
  slip: { glow: number };
};

export function frameState(props: MemoryMapProps, t: number, beats: number[], dur: number): MapState {
  const mode = pickMode(props.mode, MAP_MODES);
  const T = sceneTime(Number.isFinite(t) ? t : 0, dur);
  const tm = loopTime(t, dur);
  const m = props.marks;
  const idle = {
    float: TILES.map((_, i) => 4 * Math.sin(tm * 1.6 + i * 1.7)),
    robot: { bob: Math.sin(tm * 2.4), blink: blinkAt(tm, 2.6) },
    slip: { glow: 0.45 + 0.35 * Math.sin(tm * 3) },
  };

  if (mode === 'all') {
    return { frames: 1, opacity: TILES.map(() => 1), emphasis: TILES.map(() => HOLD), title: 1, ...idle };
  }

  // reveal: each tile on its own mark, never before the previous one.
  const b0 = beatOr(beats, 0, 0);
  const b1 = beatOr(beats, 1, b0 + 6);
  const at: number[] = [];
  TILES.forEach((_, i) => {
    const prev = at[i - 1];
    const fb = prev === undefined ? b1 + 1.4 : prev + 0.8;
    at.push(prev === undefined ? mark(m, i, fb) : Math.max(prev, mark(m, i, fb)));
  });
  const last = at[TILES.length - 1];
  const titleAt = Math.max(last + 0.4, mark(m, TILES.length, last + 1.2));
  return {
    frames: ease(T, b0 + 0.3, 1.2),
    opacity: at.map((a) => ease(T, a - 0.15, IN)),
    emphasis: at.map((a) => (T < a - 0.15 ? 0 : clamp01(Math.max(bump(T, a - 0.15, PULSE), HOLD * ease(T, a + PULSE / 2 - 0.15, 0.3))))),
    title: ease(T, titleAt - 0.1, 0.5),
    ...idle,
  };
}
