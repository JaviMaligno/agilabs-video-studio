// Pure state of the StoryBench scene (added 2026-10-21: the story right after the hook). It tells
// where the hook's string comes from, as a picture of the situation:
// - beat 0: my test bench. A laptop sends a coded message card (a stack of them behind it) down
//   to an "AI model" chip; the card cycles through codes the model was never taught, and a "?"
//   bubble asks whether it can read them.
// - beat 1: the card settles on the hook's base64 string; a tag "one of my tests" and a small
//   copy of the hook's stamp land on it (the callback to the first scene).
// - beat 2: my AI grader appears below, its "what it sees" window shows noise, and it stamps the
//   reply GARBLED anyway. (Revised 2026-10-21: no "my post" / "published" card.)
// Illustrative, stylised visuals; no numbers. No Remotion or React here.
import { clamp01, easeOutCubic, fit, progress, sceneTime } from './steps.ts';
import { NO_SLAM, beatOr, slam, type Slam } from './stamp.ts';

export type StoryProps = Record<string, never> | { [k: string]: unknown };

/** Codes the card cycles through on beat 0 (keys of src/data/ciphers.json), then base64. */
export const STORY_CODES = ['rot13', 'morse', 'binary', 'reverse_all', 'cyrillic_homoglyph'] as const;
/** Seconds each code stays on the card while cycling. */
export const CYCLE = 0.55;

export type StoryState = {
  laptop: { appear: number; dim: number };
  card: { appear: number; drop: number; glow: number };
  /** Morph between two codes: indices into STORY_CODES, or -1 for base64. */
  code: { from: number; to: number; p: number };
  stack: { appear: number };
  chip: { appear: number; dim: number };
  bubble: { pop: number; pulse: number };
  tag: { pop: number };
  echo: Slam;
  grader: { appear: number; read: number; press: number };
  stamp: Slam;
};

export function frameState(_props: StoryProps, t0: number, beats: number[], dur: number): StoryState {
  const t = sceneTime(t0, dur);
  const b0 = beatOr(beats, 0, 0);
  const b1 = fit(beatOr(beats, 1, b0 + 4), 1.6, dur);
  const b2 = fit(beatOr(beats, 2, b1 + 2.6), 2.8, dur);

  // Cycling codes from just after the card lands until beat 1, then base64.
  const cycleStart = b0 + 0.75;
  const toB64 = Math.max(cycleStart, b1 - 0.1);
  let code: StoryState['code'];
  if (t < cycleStart) code = { from: 0, to: 0, p: 1 };
  else if (t >= toB64) {
    const k = Math.max(0, Math.min(STORY_CODES.length - 1, Math.floor((toB64 - cycleStart) / CYCLE)));
    code = { from: k, to: -1, p: clamp01(progress(t, toB64, 0.7)) };
  } else {
    const k = Math.floor((t - cycleStart) / CYCLE);
    const from = Math.min(STORY_CODES.length - 1, k);
    const to = Math.min(STORY_CODES.length - 1, k + 1);
    code = { from, to, p: clamp01(progress(t, cycleStart + k * CYCLE, CYCLE * 0.7)) };
  }

  const echoAt = fit(b1 + 0.9, 0.6, dur);
  const stampAt = fit(b2 + 1.2, 0.6, dur);
  const dimDown = easeOutCubic(progress(t, b2 - 0.1, 0.4));
  return {
    laptop: { appear: easeOutCubic(progress(t, 0, 0.35)), dim: dimDown },
    card: {
      appear: easeOutCubic(progress(t, 0.1, 0.3)),
      drop: easeOutCubic(progress(t, b0 + 0.15, 0.55)),
      glow: easeOutCubic(progress(t, b1 + 0.5, 0.4)) * (1 - 0.6 * dimDown),
    },
    code,
    stack: { appear: easeOutCubic(progress(t, b0 + 0.6, 0.4)) },
    chip: { appear: easeOutCubic(progress(t, 0.2, 0.4)), dim: dimDown },
    bubble: {
      pop: easeOutCubic(progress(t, b0 + 1.2, 0.35)) * (1 - easeOutCubic(progress(t, b1 + 0.3, 0.3))),
      pulse: 0.5 + 0.5 * Math.sin((Number.isFinite(t) ? t : 0) * 6),
    },
    tag: { pop: easeOutCubic(progress(t, b1 + 0.4, 0.35)) },
    echo: t >= echoAt ? slam(t, echoAt) : NO_SLAM,
    grader: {
      appear: easeOutCubic(progress(t, b2 - 0.1, 0.4)),
      read: clamp01(progress(t, b2 + 0.4, 0.4)),
      press: t >= stampAt - 0.15 && t < stampAt + 0.25 ? 1 : 0,
    },
    stamp: t >= stampAt ? slam(t, stampAt) : NO_SLAM,
  };
}
