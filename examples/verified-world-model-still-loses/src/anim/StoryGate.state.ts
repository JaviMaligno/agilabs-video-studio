// Pure state of the story scene (added 2026-10-21): where the video comes from, in one picture.
// Beat 0: I was reproducing a published result: a small board game, an arrow "AI writes", and a
// code card that is the game's rules as a program ("world model"). Beat 1: below it, a check gate
// with a green tick, and a planner's search tree that grows out of it once the check passes.
// Beat 2: the question: does the tick mean "right"? A "?" lands on the tick and pulses.
// No Remotion or React here.
import { beatAt, easeOutCubic, fit, progress, sceneTime } from './steps.ts';

export type StoryGateProps = Record<string, never>;

/** The code card's lines: the three functions the article names. */
export const CODE_LINES = ['allowed moves', 'what happens', 'who wins'] as const;

/** Planner tree: nodes as (level, index-in-level) in a 1-3-6 fan, drawn top-down. */
export const TREE = [
  { level: 0, i: 0, n: 1 },
  { level: 1, i: 0, n: 3 },
  { level: 1, i: 1, n: 3 },
  { level: 1, i: 2, n: 3 },
  ...Array.from({ length: 6 }, (_, i) => ({ level: 2, i, n: 6 })),
] as const;

export function frameState(_p: StoryGateProps, t: number, beats: number[], dur: number) {
  const T = sceneTime(t, dur);
  const d = Number.isFinite(dur) ? Math.max(0, dur) : 1e6;
  const b0 = beatAt(beats, 0);
  const b1 = beats[1] !== undefined && Number.isFinite(beats[1]) ? beats[1] : b0 + 3;
  const b2 = beats[2] !== undefined && Number.isFinite(beats[2]) ? beats[2] : b1 + 2.5;
  const ease = (start: number, len: number) => easeOutCubic(progress(T, fit(start, len, d), len));

  // 2026-11-06 cold open: the board and chip are on screen from frame 0; the rulebook builds during
  // the hook. No check gate or "passed = right?" any more (the new script tells the test later);
  // the computer player's tree grows on beat 2 ("...for a computer player").
  const chip = 1;
  const board = 1;
  const arrow = ease(0.3, 0.5);
  const card = ease(0.6, 0.45);
  const lines = CODE_LINES.map((_, i) => ease(0.9 + i * 0.25, 0.35));
  const tag = ease(b1, 0.5);
  void b0;
  const down = ease(b2, 0.45);
  const gate = 0;
  const tick = 0;
  const tree = TREE.map((node) => ease(b2 + 0.4 + node.level * 0.3 + node.i * 0.04, 0.4));
  const plannerLabel = ease(b2 + 1.0, 0.4);
  const question = 0;
  const pulse = 0;

  return {
    chip: { opacity: chip },
    board: { opacity: board },
    arrow: { draw: arrow },
    card: { opacity: card, lines: lines.map((opacity) => ({ opacity })), tag: { opacity: tag } },
    down: { draw: down },
    gate: { opacity: gate, tick: { pop: tick } },
    tree: { nodes: tree.map((pop) => ({ pop })), label: { opacity: plannerLabel } },
    question: { pop: question, pulse },
  };
}

export type StoryGateState = ReturnType<typeof frameState>;
