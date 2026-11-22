// The proof as it exists: a stack of Lean files. It is still being piled up on the first frame
// (the cold open), then counted, scanned by the checker and left with nobody reading it.
// Pure numbers and strings (no Remotion or React), so `node --test` can check it.
import { beatAt, clamp01, easeOutCubic, progress, sceneTime } from './steps.ts';

export type FileStackProps = {
  /** `loom`: the cold open, only the stack growing. `count`: the number, the scan, "read by: 0". */
  mode: 'loom' | 'count';
  /** Video second this scene starts at, so the pile keeps growing across the two scenes. */
  clock?: number;
};

/** The figure as the article writes it ("Lean files: 175,187"). */
export const FILES = 175187;
export const FILES_TEXT = '175,187';

export const COLS = 14;
export const ROWS = 20;
/** Share of the stack already standing on the very first frame; the rest lands over GROW_SECONDS. */
export const BUILT_AT_START = 0.6;
export const GROW_SECONDS = 4.2;
const DROP_SECONDS = 0.5;

/** Close-up of the cold open; the count scene eases back to 1 to make room for the number. */
export const LOOM_ZOOM = 1.32;
/** The count scene holds the cold open's framing while the two scenes blend. */
const HOLD = 0.5;

const withCommas = (n: number): string => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/**
 * How far tile `k` of `total` (0 = first to land, bottom row first) has dropped at video second
 * `T`: 0 not yet released, 1 resting on the stack.
 */
export const tileLanded = (k: number, total: number, T: number): number => {
  const share = total > 0 ? k / total : 0;
  if (share < BUILT_AT_START) return 1;
  // Released a little before the video starts, so tiles are already in mid-air on frame 0.
  const release = ((share - BUILT_AT_START) / (1 - BUILT_AT_START)) * GROW_SECONDS - DROP_SECONDS * 0.6;
  return easeOutCubic(progress(Number.isFinite(T) ? T : 0, release, DROP_SECONDS));
};

export function frameState(p: FileStackProps, time: number, beats: number[], dur: number) {
  const t = sceneTime(time, dur);
  const clock = Number.isFinite(p.clock) ? (p.clock as number) : 0;
  // Ambient time keeps running after the scene's own animations have finished.
  const T = clock + (Number.isFinite(time) ? Math.max(0, time) : 0);
  const count = p.mode === 'count';
  const b0 = Math.max(HOLD, beatAt(beats, 0));
  const b1 = Math.max(b0, beatAt(beats, 1));
  const b2 = Math.max(b1, beatAt(beats, 2));
  // The number arrives with "published a proof", late in the first line.
  const numStart = beats.length > 1 ? Math.max(b0, b1 - 1.9) : b0 + 0.4;
  const counting = count ? easeOutCubic(progress(t, numStart, 1.1)) : 0;
  const scan = count ? progress(t, b1 + 0.1, 1.5) : 0;
  return {
    T,
    zoom: count ? LOOM_ZOOM + (1 - LOOM_ZOOM) * easeOutCubic(progress(t, HOLD, 0.8)) : LOOM_ZOOM,
    appear: count ? progress(t, numStart, 0.35) : 0,
    text: counting >= 1 ? FILES_TEXT : withCommas(FILES * counting),
    /** The checker's scan line, top to bottom of the stack. */
    scan: clamp01(scan),
    /** Scan line visibility: on while it sweeps, gone once it has passed. */
    scanOn: count && scan > 0 && scan < 1 ? 1 : 0,
    checked: count ? progress(t, b1 + 1.2, 0.4) : 0,
    read: count ? progress(t, b2 + 0.25, 0.4) : 0,
  };
}
