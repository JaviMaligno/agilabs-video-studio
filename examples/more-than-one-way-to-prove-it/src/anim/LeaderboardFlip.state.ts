// Pure state of the LeaderboardFlip scenes: six model cards stacked as a leaderboard, each with
// "fixed" and "tests first" counters, a grader's clipboard of rules, and the flip that puts the
// stack in reverse once the rules are applied. Numbers are the article's (see factcheck.md); the
// motion is illustrative. No Remotion or React here.
import { beatAt, easeOutCubic, fit, progress, sceneTime } from './steps.ts';

export type Mode = 'cold' | 'rule' | 'focus' | 'flip' | 'opinion';
export type Verdict = 'pass' | 'fail' | 'none';

export type ModelRow = {
  name: string;
  /** Valid fixes, of 30 bugs-times-runs. */
  fixed: number;
  /** Valid fixes that ran the suite before the first edit. */
  testsFirst: number;
  /** Valid fixes that pass both rules (tests first + no test edited), when the article gives it. */
  both: number | null;
  /** Verdict stamped on the card once the rules are applied. */
  verdict: Verdict;
  /** Cast robot drawn on the card (public/cast/robot-<colour>.png), the same in every scene. */
  robot: string;
};

/** Out of how many each model's "fixed" counter is. */
export const RUNS = 30;

/**
 * The leaderboard by bugs fixed, top to bottom (ties kept in the article's order of mention).
 * fixed: "Sonnet fixed all 30 bugs", "Opus fixed 29", "Sol fixed 29", figure 4 denominators for
 * Haiku 25, Luna 22, Qwen 22. testsFirst: figure 4. both: "Qwen, with 13 of its 22 fixes",
 * "Opus 1 of 29, Sonnet 0 of 30".
 */
export const MODELS: ModelRow[] = [
  { name: 'Sonnet', fixed: 30, testsFirst: 0, both: 0, verdict: 'fail', robot: 'violet' },
  { name: 'Opus', fixed: 29, testsFirst: 1, both: 1, verdict: 'fail', robot: 'amber' },
  { name: 'Sol', fixed: 29, testsFirst: 28, both: null, verdict: 'none', robot: 'teal' },
  { name: 'Haiku', fixed: 25, testsFirst: 7, both: null, verdict: 'none', robot: 'sky' },
  { name: 'Luna', fixed: 22, testsFirst: 3, both: null, verdict: 'none', robot: 'rose' },
  { name: 'Qwen', fixed: 22, testsFirst: 13, both: 13, verdict: 'pass', robot: 'graphite' },
];

export type LeaderboardFlipProps = {
  mode: Mode;
  /** focus mode: the model whose card is shown big. */
  focus?: string;
};

/** Seconds the flip takes, and the gap between two stamps landing. */
export const FLIP = 1.5;
export const STAMP = 0.35;
export const STAMP_GAP = 0.22;

const sinBump = (p: number) => (p <= 0 || p >= 1 ? 0 : Math.sin(Math.PI * p));
/** Ease in-out, so the stack lifts off, swings and settles. */
const easeInOut = (p: number) => {
  const x = Math.min(1, Math.max(0, p));
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
};

export function frameState(p: LeaderboardFlipProps, time: number, beats: number[], dur: number) {
  const t = sceneTime(time, dur);
  const d = Number.isFinite(dur) ? dur : 0;
  const b0 = beatAt(beats, 0);
  const has1 = beats.length > 1 && Number.isFinite(beats[1]);
  const P = (start: number, len: number) => progress(t, fit(start, len, d), len);
  const mode = p.mode;

  // ---- The flip (cold open and the second rule). ----
  const stampsAfter = STAMP + STAMP_GAP * 2 + 0.2;
  let flipStart = Number.POSITIVE_INFINITY;
  if (mode === 'cold') flipStart = Math.max(b0 + 1.5, d * 0.42);
  if (mode === 'flip') flipStart = has1 ? beatAt(beats, 1) + 0.1 : b0 + 2.6;
  const flipping = mode === 'cold' || mode === 'flip';
  const flipAt = flipping ? fit(flipStart, FLIP + stampsAfter, d) : 0;
  const flipRaw = flipping ? progress(t, flipAt, FLIP) : 0;
  const flipEase = easeInOut(flipRaw);
  const swing = sinBump(flipRaw);

  const n = MODELS.length;
  // Stamps land top to bottom in the flipped stack: the pass at the top first, then the fails.
  const stamped = MODELS.map((m, i) => ({ i, slot: n - 1 - i, v: m.verdict }))
    .filter((x) => x.v !== 'none')
    .sort((a, b) => a.slot - b.slot);
  const stampRank = MODELS.map((_, i) => Math.max(0, stamped.findIndex((x) => x.i === i)));
  const cards = MODELS.map((m, i) => {
    const to = n - 1 - i;
    const delta = to - i;
    const slot = flipping ? i + delta * flipEase : i;
    const stampPop =
      flipping && m.verdict !== 'none' ? easeOutCubic(progress(t, flipAt + FLIP + 0.05 + stampRank[i] * STAMP_GAP, STAMP)) : 0;
    const dimTarget = mode === 'flip' && m.verdict === 'none' ? 1 : 0;
    return {
      name: m.name,
      robot: m.robot,
      fixed: m.fixed,
      testsFirst: m.testsFirst,
      both: m.both,
      verdict: m.verdict,
      /** Position in the stack, 0 = top; fractional while flipping. */
      slot,
      /** Sideways swing in px units of one slot: cards rising swing left, falling swing right. */
      swingX: -Math.sign(delta) * Math.sqrt(Math.abs(delta)) * swing,
      tilt: -Math.sign(delta) * swing,
      lift: swing,
      rising: delta < 0 ? 1 : 0,
      appear: mode === 'cold' ? 1 : easeOutCubic(P(0.05 + i * 0.07, 0.35)),
      pop: stampPop,
      /** Cards without a figure in the article fade back once the rules are applied. */
      dim: dimTarget * (mode === 'flip' ? easeOutCubic(progress(t, flipAt + FLIP, 0.4)) : 0),
      /** flip mode: the counters turn into the "passes both rules" figure after the flip. */
      showBoth: mode === 'flip' && m.both !== null ? easeOutCubic(progress(t, flipAt + FLIP - 0.2, 0.4)) : 0,
    };
  });
  const header = flipping ? easeOutCubic(progress(t, flipAt + FLIP * 0.5, 0.4)) : 0;

  // ---- The clipboard. ----
  const clip = mode === 'cold' ? 0 : mode === 'rule' || mode === 'opinion' ? easeOutCubic(P(0, 0.4)) : 1;
  let rule1 = 0;
  if (mode === 'rule') {
    // The rule writes in as it is spoken: on the second beat, or half way through a single line.
    const start = has1 ? beatAt(beats, 1) : b0 + (Math.max(b0 + 1, d - 0.8) - b0) * 0.48;
    rule1 = easeOutCubic(P(start, 1.0));
  } else if (mode !== 'cold') rule1 = 1;
  let rule2 = 0;
  if (mode === 'flip') rule2 = easeOutCubic(P(b0 + 1.8, 0.5)); // on "don't edit the tests"
  else if (mode === 'opinion') rule2 = 1;
  // opinion mode: the OPINION stamp lands on the clipboard, then the closing line under it.
  const opinionAt = mode === 'opinion' ? fit(b0 + 2.1, STAMP, d) : 0;
  const opinion = mode === 'opinion' ? easeOutCubic(progress(t, opinionAt, STAMP)) : 0;
  const taglineAt = mode === 'opinion' ? (has1 ? beatAt(beats, 1) + 0.2 : b0 + 3) : 0;
  const tagline = mode === 'opinion' ? easeOutCubic(P(taglineAt, 0.5)) : 0;

  // ---- Focus: one card, two bars, a stamp. ----
  const target = MODELS.find((m) => m.name === p.focus) ?? MODELS[0];
  const b1 = has1 ? beatAt(beats, 1) : b0 + 1.8;
  const focus =
    mode === 'focus'
      ? {
          name: target.name,
          robot: target.robot,
          fixed: target.fixed,
          testsFirst: target.testsFirst,
          verdict: target.verdict === 'none' ? ('fail' as Verdict) : target.verdict,
          appear: easeOutCubic(P(0, 0.4)),
          growFixed: easeOutCubic(P(b0 + 0.3, 0.9)),
          growTests: easeOutCubic(P(b1 + 0.2, 0.9)),
          pop: easeOutCubic(P(b1 + 1.3, STAMP)),
        }
      : null;

  return {
    mode,
    flip: { progress: flipRaw, ease: flipEase },
    header,
    cards,
    clip,
    rule1: { draw: rule1 },
    rule2: { draw: rule2 },
    opinion: { pop: opinion },
    tagline: { appear: tagline },
    focus,
  };
}
