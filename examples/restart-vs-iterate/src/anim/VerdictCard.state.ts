// Pure state of the verdict card (script scenes 17-19): one full-frame card whose three lines land
// one per narration line (beats), with a stamp on the first. Same look as the verdict card of
// sport-from-motion-laya, so the series reads consistently. No Remotion or React here.
import { beatAt, easeOutCubic, fit, progress, sceneTime } from './steps.ts';

export type VerdictProps = { marks?: number[] };

export function frameState(props: VerdictProps, tIn: number, beats: number[], dur: number) {
  const t = sceneTime(tIn, dur);
  const d = Number.isFinite(dur) && dur > 0 ? dur : 4;
  const at = (i: number, fb: number) => {
    const v = props.marks?.[i];
    return fit(v !== undefined && Number.isFinite(v) ? v : fb, 0.4, d);
  };
  const b0 = beatAt(beats, 0);
  // Line 1 lands on "keep" (mark 0), lines 2 and 3 on their own narration lines.
  const r0 = at(0, b0 + 1.0);
  const r1 = fit(beats[1] !== undefined && Number.isFinite(beats[1]) ? beats[1] : r0 + 1.5, 0.4, d);
  const r2 = fit(beats[2] !== undefined && Number.isFinite(beats[2]) ? beats[2] : r1 + 1.5, 0.4, d);
  return {
    card: easeOutCubic(progress(t, 0.05, 0.4)),
    rows: [r0, r1, r2].map((r) => easeOutCubic(progress(t, r - 0.15, 0.35))),
    stamp: easeOutCubic(progress(t, r0 + 0.1, 0.3)),
    // The regime line lands on "these tasks" (mark 1), so the card is not empty while the voice sets it up.
    sub: progress(t, Math.min(at(1, b0 + 0.9), r0) - 0.1, 0.35),
  };
}
