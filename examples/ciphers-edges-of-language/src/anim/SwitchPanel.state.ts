// Pure state of the SwitchPanel scene: the article's closing image as toggle switches.
// Beat 0: "Understand" (on) and "Reply in code" (off); the prompt "reply in the same code" drops
// in and flips the second one on. Beat 1: the panel makes room and a third switch, "Engage",
// enters FIRST in the row, off, with what flips it off (Claude's refusal, the filter on GPT-5).
// No Remotion or React here.
import { beatAt, clamp01, easeOutCubic, fit, progress, sceneTime } from './steps.ts';

export type SwitchProps = Record<string, unknown>;

export type SwitchState = {
  understand: { appear: number; on: number; number: number };
  reply: { appear: number; on: number; number: number };
  prompt: { drop: number; opacity: number };
  /** 0 = two switches centred; 1 = three switches, Engage on top. */
  reveal: number;
  engage: { appear: number; on: number; tags: number; pulse: number };
  /** Renumbering: 0 shows Understand = 1, Reply = 2; 1 shows Engage = 1, Understand = 2, Reply = 3. */
  renumber: number;
};

export function frameState(_props: SwitchProps, t0: number, beats: number[], dur: number): SwitchState {
  const t = sceneTime(t0, dur);
  const b0 = beatAt(beats, 0);
  const raw1 = beats[1] !== undefined && Number.isFinite(beats[1]) ? beats[1] : b0 + 3.4;
  const b1 = fit(raw1, 1.8, dur);
  const dropAt = fit(b0 + 1.0, 1.0, Math.max(0.01, b1 - 0.2));
  const drop = easeOutCubic(progress(t, dropAt, 0.55));
  const flip = easeOutCubic(progress(t, dropAt + 0.55, 0.3));
  const reveal = easeOutCubic(progress(t, b1, 0.7));
  return {
    understand: { appear: easeOutCubic(progress(t, b0 - 0.2, 0.4)), on: easeOutCubic(progress(t, b0 + 0.25, 0.3)), number: 1 },
    reply: { appear: easeOutCubic(progress(t, b0, 0.4)), on: flip, number: 2 },
    prompt: { drop, opacity: clamp01(1 - progress(t, dropAt + 0.95, 0.4)) * (drop > 0 ? 1 : 0) },
    reveal,
    engage: {
      appear: easeOutCubic(progress(t, b1 + 0.25, 0.5)),
      on: 0,
      tags: easeOutCubic(progress(t, b1 + 0.8, 0.4)),
      pulse: clamp01(1 - Math.abs(t - (b1 + 1.3)) / 0.4),
    },
    renumber: easeOutCubic(progress(t, b1 + 0.5, 0.4)),
  };
}
