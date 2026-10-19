// Pure state of the harness drop (scene 8): the surfaces of the article's third figure float
// loose, then dock one after another onto one wide "Harness" slab with a thinner "Model" slab
// under it, and one agent dot runs through every surface and down into the slab. Tile names and
// slab labels are the figure's own (see factcheck.md); no product names.
// No Remotion or React here.
import { beatAt, clamp01, easeOutCubic, fit, progress, sceneTime } from './steps.ts';

export type HarnessProps = {
  /** Read by Video.tsx: cross-blend from the previous scene instead of dipping through black. */
  blend?: boolean;
  /** Scene seconds of "Terminal", "app", "phone" and "harness" (TTS word timings). */
  cues?: number[];
};

export const W = 960;
export const TILES = ['Terminal', 'IDE', 'Desktop app', 'Web · mobile', 'Tickets', 'Schedules · events'] as const;
export const TILE = { w: 290, h: 150 } as const;
/** Docked: two rows of three on the slab. */
export const dockedAt = (i: number) => ({ x: 20 + (i % 3) * 315, y: 250 + Math.floor(i / 3) * 172 });
/** Loose: scattered over the stage, tilted. */
export const LOOSE = [
  { x: 40, y: 130, rot: -7 },
  { x: 610, y: 100, rot: 6 },
  { x: 330, y: 320, rot: -3 },
  { x: 640, y: 470, rot: 8 },
  { x: 20, y: 560, rot: 5 },
  { x: 350, y: 730, rot: -6 },
] as const;
export const SLAB = { harness: { x: 0, y: 610, w: 960, h: 250 }, model: { x: 0, y: 878, w: 960, h: 80 } } as const;
export const LABELS = ['permissions', 'tools', 'inputs', 'outputs', 'context and memory', 'escalation to a human'] as const;
/** Which tiles the first line names, in order: terminal, app, phone. */
export const NAMED = [0, 2, 3] as const;
/** The agent dot's path through the docked tiles, then down into the slab. */
export const DOT_PATH = [0, 1, 2, 5, 4, 3] as const;

const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

export function frameState(p: HarnessProps, time: number, beats: number[], dur: number) {
  const t = sceneTime(time, dur);
  const clockT = Number.isFinite(time) ? Math.max(0, Math.min(time, Number.isFinite(dur) ? dur : time)) : 0;
  const b0 = beatAt(beats, 0);
  const b1 = beats.length > 1 ? beatAt(beats, 1) : b0 + 1.6;
  const S0 = Math.max(0.6, b1 - 0.35 - b0);
  const P = (start: number, len: number) => progress(t, fit(start, len, dur), len);
  const E = (start: number, len: number) => easeOutCubic(P(start, len));

  const slab = E(b1, 0.45);
  const model = E(b1 + 0.15, 0.45);
  const tiles = TILES.map((label, i) => {
    const appear = E(b0 + 0.06 * i, 0.4);
    const named = NAMED.indexOf(i as 0 | 2 | 3);
    const cue = p.cues?.[named];
    const callAt = cue !== undefined && Number.isFinite(cue) ? cue : b0 + (0.05 + 0.33 * named) * S0;
    const call = named >= 0 ? E(callAt - 0.05, 0.25) : 0;
    const dock = E(b1 + 0.2 + 0.11 * i, 0.5);
    const L = LOOSE[i];
    const D = dockedAt(i);
    // Loose tiles drift a little until they dock.
    const drift = (1 - dock) * 8;
    const x = lerp(L.x, D.x, dock) + drift * Math.sin(clockT * 1.3 + i);
    const y = lerp(L.y, D.y, dock) + drift * Math.cos(clockT * 1.1 + i * 2);
    return { label, x, y, rot: L.rot * (1 - dock), appear, call, dock };
  });
  const header = E(b1 + 0.3, 0.4);
  const labels = LABELS.map((_, i) => E(b1 + 0.5 + 0.12 * i, 0.35));
  // The agent dot: after the last tile docks, through every tile, then into the slab.
  const dotStart = b1 + 0.2 + 0.11 * 5 + 0.45;
  const dotLen = 1.3;
  const dp = P(dotStart, dotLen);
  const legs = DOT_PATH.length; // tile-to-tile legs plus the drop into the slab
  const pos = dp * legs;
  const leg = Math.min(legs - 1, Math.floor(pos));
  const f = clamp01(pos - leg);
  const centre = (i: number) => ({ x: dockedAt(i).x + TILE.w / 2, y: dockedAt(i).y + TILE.h / 2 });
  const a = centre(DOT_PATH[leg]);
  const b = leg + 1 < DOT_PATH.length ? centre(DOT_PATH[leg + 1]) : { x: W / 2, y: SLAB.harness.y + 4 };
  const dot = {
    x: lerp(a.x, b.x, easeOutCubic(f)),
    y: lerp(a.y, b.y, easeOutCubic(f)),
    appear: dp > 0 ? clamp01(dp * 8) : 0,
    visited: DOT_PATH.map((_, j) => (dp > 0 && pos >= j ? 1 : 0)),
  };
  const glow = E(dotStart + dotLen - 0.1, 0.4);
  return { tiles, slab, model, header, labels, dot, glow };
}

export type HarnessState = ReturnType<typeof frameState>;
