// VersionLadder: the four versions of the certificate, three refuted and the fourth signed, with
// the refutation tally ending at 3 and a footnote held to the end. Pure: no Remotion or React.
import { clamp01, easeOutCubic, progress, sceneTime } from './steps.ts';

export const ROWS = [
  { v: 'v1', ok: false, text: 'sampled inside' },
  { v: 'v2', ok: false, text: 'ε at the tangency' },
  { v: 'v3', ok: false, text: 'trusted a float library' },
  { v: 'v4', ok: true, text: 'the one I would sign' },
] as const;
export const V4_DETAIL = 'zero tolerances · zero exclusions · no floating-point fact assumed';
export const FOOTNOTE = "the paper's v2 proves the main theorem another way; this certificate still holds, but no longer carries it";

export type LadderProps = { cue?: Record<string, number>; blend?: boolean };

const E = (t: number, s: number, l: number) => easeOutCubic(progress(t, s, l));

export function frameState(p: LadderProps, time: number, beats: number[], dur: number) {
  const t = sceneTime(time, dur);
  const b0 = Number.isFinite(beats[0]) ? beats[0] : 0;
  const cue = (k: string, f: number) => (p.cue?.[k] !== undefined && Number.isFinite(p.cue[k]) ? p.cue[k] : f);
  const v3 = 0.15 + 0.3 * 2;
  const v4 = cue('v4', b0 + 1.8);
  return {
    rows: ROWS.map((r, i) => ({ ...r, pop: E(t, i < 3 ? 0.15 + 0.3 * i : v4, 0.35), glow: r.ok ? E(t, v4 + 0.3, 0.5) : 0 })),
    tally: { value: t >= v3 + 0.1 ? 3 : 2, appear: 1, pulse: clamp01(Math.sin(Math.PI * progress(t, v3 + 0.1, 0.6))) },
    detail: E(t, v4 + 0.5, 0.45),
    footnote: E(t, v4 + 1.3, 0.5),
  };
}
