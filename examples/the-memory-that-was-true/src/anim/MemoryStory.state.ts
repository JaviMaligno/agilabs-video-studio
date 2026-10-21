// MemoryStory: the situation the article starts from, told before anything technical. My coding
// agent works on my blog in sessions and writes a note at the end of each one (its memory). While I
// prepare an article, one of those notes says how to schedule it, and I very nearly act on it.
// Three beats: the session writes a note into the memory stack; an article draft asks "how do I
// schedule it?" and the scheduling note is pulled out of the stack; a cursor heads for "create the
// workflow" and stops just short. Pure state: no Remotion or React, tested with `node --test`.
import { beatAt, fit, progress, sceneTime } from './steps.ts';
import { ease, lerp, pop } from './memory.ts';

export type MemoryStoryProps = Record<string, never>;

export type StoryFrame = {
  /** The coding-agent session window: appear, chat lines typed (0-1), "session ends" chip. */
  session: { appear: number; typed: number; ends: number };
  /** The memory stack (the agent's notes on the blog) and the new note flying into it. */
  stack: { appear: number; fly: number };
  /** The article draft and its question. */
  article: { appear: number; ask: number };
  /** The scheduling note pulled out of the stack (0 in the stack, 1 at full size), its underline. */
  pull: { draw: number; opacity: number; underline: number };
  /** "I very nearly acted on it": the action button, the cursor's travel, the "almost" chip. */
  act: { appear: number; travel: number; almost: number; dim: number };
};

export const frameState = (_props: MemoryStoryProps, t: number, beats: number[], dur: number): StoryFrame => {
  const T = sceneTime(t, dur);
  const b0 = beatAt(beats, 0);
  const b1 = beats.length > 1 ? beatAt(beats, 1) : b0 + 2.4;
  const b2 = beats.length > 2 ? beatAt(beats, 2) : b1 + 2.4;

  // Beat 0: the session, then its note goes into the memory stack ("at the end of each session").
  const sIn = fit(Math.max(0, b0 - 0.15), 0.5, dur);
  const endsAt = b0 + 0.62 * Math.max(0.6, b1 - b0);
  const session = {
    appear: ease(T, sIn, 0.5),
    typed: progress(T, fit(b0 + 0.3, 1.6, dur), 1.6),
    ends: pop(T, fit(endsAt, 0.35, dur)),
  };
  const stack = { appear: ease(T, fit(b0 + 0.6, 0.5, dur), 0.5), fly: ease(T, fit(endsAt + 0.25, 0.8, dur), 0.8) };

  // Beat 1: the article draft and its question; the scheduling note comes out of the stack.
  const article = { appear: ease(T, fit(b1 + 0.05, 0.5, dur), 0.5), ask: pop(T, fit(b1 + 0.8, 0.35, dur)) };
  const pullAt = b1 + 0.5 * Math.max(0.8, b2 - b1);
  const pullDraw = ease(T, fit(pullAt, 0.9, dur), 0.9);
  const pull = {
    draw: pullDraw,
    opacity: progress(T, fit(pullAt, 0.25, dur), 0.25),
    underline: ease(T, fit(pullAt + 0.9, 0.5, dur), 0.5),
  };

  // Beat 2: the action, the cursor heading for it, stopping just short.
  const act = {
    appear: ease(T, fit(b2, 0.4, dur), 0.4),
    travel: ease(T, fit(b2 + 0.15, 1.0, dur), 1.0),
    almost: pop(T, fit(b2 + 1.05, 0.35, dur)),
    // The rest of the picture steps back a little while the cursor hovers.
    dim: lerp(0, 1, ease(T, fit(b2, 0.5, dur), 0.5)),
  };
  return { session, stack, article, pull, act };
};
