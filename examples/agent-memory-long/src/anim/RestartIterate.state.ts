// Pure state of restart vs iterate (rows 17-18): two lanes, each a robot at a bench with a
// half-built thing and a few loose pages (the messy desk).
// - line 0: the attempt goes badly (a crack across both half-built things); on "clear" the top
//   lane's robot sweeps the free end of its bench (the pages go over the edge, the broom stops past
//   them); on "keep" the bottom lane's robot
//   patches its thing (a block goes in, the crack closes).
// - line 1: bars "keep going 86%" and "start over 69%" with "share of tasks solved"; the patched
//   thing gets its last block and a tick; the messy pages of the bottom lane pulse (they did no
//   harm); on "throwing" the broom sweeps back along the whole bench and the top lane's half-built
//   thing vanishes as it passes.
// Marks: [attempt, clear, keep, keeping, messy, throwing].
// No Remotion or React here.
import { beatOr, blinkAt, bump, ease, loopTime, mark } from './memory.ts';
import { progress, sceneTime } from './steps.ts';

export type RestartIterateProps = { marks?: number[] };

export const SWEEP_LABEL = 'start over';
export const PATCH_LABEL = 'keep going';
/** Share of tasks solved (source: iterate 86 %, restart-fresh 69 %). */
export const BARS = [
  { label: PATCH_LABEL, value: 0.86, display: '86%' },
  { label: SWEEP_LABEL, value: 0.69, display: '69%' },
] as const;
export const BARS_CAPTION = 'share of tasks solved';
/** Where the half-built thing sits along the bench (0 = left end, 1 = right end); the pages lie past BROOM_FROM. */
export const THING_AT = 0.28;
export const BROOM_FROM = 0.52;
/** Blocks in a finished thing, and how many are built when the scene opens. */
export const SLOTS = 5;
export const BUILT = 3;

export type RestartIterateState = {
  lanes: number;
  crack: { sweep: number; patch: number };
  lit: { sweep: number; patch: number };
  /** The broom: shown, and where it is along the bench (0..1). */
  broom: { opacity: number; pos: number };
  /** Pages swept off the top bench (0..1); the top lane's thing vanishing (0..1). */
  swept: number;
  gone: number;
  /** Blocks in the bottom lane's thing (BUILT..SLOTS, fraction = the block landing), and its tick. */
  blocks: number;
  tick: number;
  messy: number;
  bars: { opacity: number; grow: number[]; caption: number };
  blink: number;
};

export function frameState(props: RestartIterateProps, t: number, beats: number[], dur: number): RestartIterateState {
  const T = sceneTime(Number.isFinite(t) ? t : 0, dur);
  const tm = loopTime(t, dur);
  const m = props.marks;
  const b0 = beatOr(beats, 0, 0);
  const b1 = beatOr(beats, 1, b0 + 8.5);
  const attempt = mark(m, 0, b0 + 3.4);
  const clear = Math.max(attempt + 0.3, mark(m, 1, b0 + 5.4));
  const keep = Math.max(clear + 0.8, mark(m, 2, b0 + 7.4));
  const keeping = mark(m, 3, b1 + 1.4);
  const messy = Math.max(keeping + 0.8, mark(m, 4, b1 + 3.8));
  const throwing = Math.max(messy + 0.6, mark(m, 5, b1 + 5.4));
  const pass1 = progress(T, clear, 1.6);
  const PASS2 = 1.4;
  const pass2 = progress(T, throwing - 0.2, PASS2);
  const second = T >= throwing - 0.2;
  const sweeping = (T >= clear && T < clear + 1.8) || (second && pass2 < 1);
  // The broom reaches the thing when 1 - pass2 = THING_AT.
  const crossAt = throwing - 0.2 + PASS2 * (1 - THING_AT);
  return {
    lanes: ease(T, b0 - 0.3, 0.4),
    crack: { sweep: ease(T, attempt - 0.1, 0.5), patch: ease(T, attempt - 0.1, 0.5) * (1 - ease(T, keep + 0.4, 0.5)) },
    lit: { sweep: ease(T, clear - 0.2, 0.4), patch: ease(T, keep - 0.2, 0.4) },
    broom: { opacity: sweeping ? 1 : 0.85, pos: second ? 1 - pass2 : BROOM_FROM + (1 - BROOM_FROM) * pass1 },
    swept: pass1,
    gone: ease(T, crossAt - 0.1, 0.5),
    blocks: BUILT + progress(T, keep, 0.7) + progress(T, keeping + 0.6, 0.7),
    tick: ease(T, keeping + 1.5, 0.35),
    messy: bump(T, messy - 0.2, 1.4),
    bars: {
      opacity: ease(T, keeping - 0.4, 0.4),
      grow: [ease(T, keeping - 0.2, 1.0), ease(T, keeping + 0.4, 1.0)],
      caption: ease(T, keeping, 0.5),
    },
    blink: blinkAt(tm, 2.4),
  };
}
