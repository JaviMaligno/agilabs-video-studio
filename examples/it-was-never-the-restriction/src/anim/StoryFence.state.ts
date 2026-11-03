// Pure state of the StoryFence scene (added 2026-10-21: story), right after the hook. Where the
// video comes from, as a picture: my earlier article said a fenced-in agent (no shell, no network)
// needs more checking; it gets stamped "a guess", a reader asks me to measure it, and the question
// left on screen is whether the fenced-in agent's report is true. One step per narration line.
// No Remotion or React here.
import { beatAt, easeOutCubic, fit, progress, sceneTime } from './steps.ts';

/**
 * - `built`: the pen, the tied hand and both fence tags are up from the first frame (the cold
 *   open shows them, so the story scene does not build them again).
 * - `hook`: the cold open (2026-11-02). No article card or reader; the fenced-in agent is the
 *   picture from frame 0, and on the second hook line a report slides out with its "true?".
 */
export type StoryFenceProps = { built?: boolean; hook?: boolean };

/** Stage geometry (960 x 1090): article card on top, the fenced pen in the middle. */
export const SF = {
  card: { x: 60, y: 30, w: 840, h: 270 },
  pen: { cx: 480, top: 400, w: 520, h: 330 },
  posts: 12,
  bubble: { x: 40, y: 840, w: 880, h: 150 },
  report: { x: 480, y: 900 },
} as const;

const pulse = (t: number, start: number, len: number) => {
  const p = progress(t, start, len);
  return p <= 0 || p >= 1 ? 0 : Math.sin(Math.PI * p);
};

export function frameState(p: StoryFenceProps, time: number, beats: number[], dur: number) {
  const t = sceneTime(time, dur);
  const b0 = beatAt(beats, 0);
  const b = (i: number, fallback: number) => (beats.length > i && Number.isFinite(beats[i]) ? beats[i] : fallback);
  const b1 = b(1, b0 + 4);
  const b2 = b(2, b1 + 3.8);
  const P = (start: number, len: number) => progress(t, fit(start, len, dur), len);
  const E = (start: number, len: number) => easeOutCubic(P(start, len));
  const Pu = (start: number, len: number) => pulse(t, fit(start, len, dur), len);

  // Line 1: the earlier article and its sentence; the pen goes up round the agent's hand.
  const card = E(b0, 0.35);
  const sentence = E(b0 + 0.35, 0.35);
  const up = p.built || p.hook;
  const hand = up ? 1 : E(b0 + 0.5, 0.35);
  const fence = up ? 1 : P(b0 + 0.9, 1.1);
  const cord = up ? 1 : E(b0 + 1.9, 0.35);
  const noShell = up ? 1 : E(b0 + 2.2, 0.3);
  const noNet = up ? 1 : E(b0 + 2.5, 0.3);

  // Line 2: "a guess" stamped on the sentence; a reader's comment arrives.
  const guess = E(b1 + 0.6, 0.3);
  const bubble = E(b1 + 1.9, 0.4);

  // Line 3: the article and the comment step back; a report slides out of the pen and gets a "?".
  // In the hook (two lines) the report comes out on the second line instead.
  const bq = p.hook ? b(1, b0 + 3) : b2;
  const settle = E(bq, 0.45);
  const report = E(bq + 0.4, 0.4);
  const query = E(bq + 1.1, 0.35);
  const queryPulse = Pu(bq + 1.45, 0.7);

  // Each post of the pen rises in turn as `fence` runs.
  const posts = Array.from({ length: SF.posts }, (_, i) => easeOutCubic(Math.min(1, Math.max(0, fence * SF.posts - i * 0.8))));

  return {
    card: p.hook ? 0 : card * (1 - 0.65 * settle),
    sentence,
    guess: p.hook ? 0 : guess,
    hand,
    fence,
    posts,
    cord,
    noShell,
    noNet,
    bubble: p.hook ? 0 : bubble * (1 - settle),
    settle,
    report,
    query,
    queryPulse,
  };
}

export type StoryFenceState = ReturnType<typeof frameState>;
