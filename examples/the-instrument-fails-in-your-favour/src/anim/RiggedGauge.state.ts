// Pure state of the RiggedGauge scenes. Three modes, one phase per narration beat:
//   hook   0 one gauge idling, a crack runs across its glass on "broke"
//          1 the "what I expected" arc fades in, the needle is dragged into it and sticks; then
//            the gauge shrinks into a row of five cracked gauges, every needle in its own arc
//   setup  0 the gauge is wired to agent transcripts; tags "detector", "scorer", "answer key" pop
//          1 the gauge turns round: its back is code with no tests; stamp UNVERIFIED SOFTWARE TOO
//   close  0 the cracked gauge alone, "Measure it. Trust the measurement least."
//          1 the system around it: four boxes with checks; the gauge (eval harness) has none
// No Remotion or React here.
import { clamp01, progress, sceneTime } from './steps.ts';
import { ease, fillBeats, lerp, popScale } from './gauge.ts';

export type RiggedMode = 'hook' | 'setup' | 'close';
export type RiggedProps = { mode: RiggedMode };

/** Where the expected arc sits: low readings, the side every bug in this video pushed toward. */
export const EXPECTED = { from: 0.06, to: 0.3 } as const;
/** Needle positions of the five gauges in the hook row (all inside their arcs). */
export const ROW_VALUES = [0.16, 0.12, 0.18, 0.1, 0.2] as const;

export type GaugeState = {
  cx: number;
  cy: number;
  r: number;
  value: number;
  crack: number;
  expected: number;
  opacity: number;
};

export type RiggedState = {
  mode: RiggedMode;
  main: GaugeState;
  /** Hook row: the four extra gauges (the main one is the middle slot). */
  row: GaugeState[];
  /** Setup: tags 0..1 each, wires 0..1, transcripts 0..1. */
  tags: number[];
  wire: number;
  transcripts: number;
  /** Setup: 0 front, 1 back (turned round). */
  flip: number;
  stamp: { scale: number; opacity: number };
  /** Close: the quote (0..1 per line) and the system boxes 0..1 each, the empty slot 0..1. */
  quote: number[];
  boxes: number[];
  empty: number;
};

const LENS: Record<RiggedMode, number[]> = { hook: [3.0, 3.8], setup: [3.4, 3.8], close: [3.0, 2.8] };

export function frameState(props: RiggedProps, t0: number, beats: number[], dur: number): RiggedState {
  const mode = props.mode;
  const t = sceneTime(t0, dur);
  const b = fillBeats(beats, LENS[mode], dur);
  const end = Number.isFinite(dur) ? dur : 10;

  const base: RiggedState = {
    mode,
    main: { cx: 480, cy: 520, r: 300, value: 0.5, crack: 0, expected: 0, opacity: 1 },
    row: [],
    tags: [0, 0, 0],
    wire: 0,
    transcripts: 0,
    flip: 0,
    stamp: { scale: 0, opacity: 0 },
    quote: [0, 0],
    boxes: [0, 0, 0, 0],
    empty: 0,
  };

  if (mode === 'hook') {
    const appear = ease(t, -0.2, 0.5);
    // Idle wobble around the middle until the needle is dragged.
    const drag = ease(t, b[1] + 0.5, 0.9);
    const idle = 0.52 + 0.035 * Math.sin(Math.min(t, 50) * 2.4);
    const value = lerp(idle, 0.17, drag);
    // Lands on "broke" (~1.58 s into the line), not before it.
    const crack = progress(t, b[0] + 1.5, 0.3);
    const expected = ease(t, b[1] + 0.05, 0.4);
    // Pull back into the row.
    const shrink = ease(t, Math.min(b[1] + 1.7, end - 1.2), 0.8);
    const main: GaugeState = {
      cx: 480,
      cy: lerp(520, 540, shrink),
      r: lerp(300, 86, shrink),
      value,
      crack,
      expected,
      opacity: appear,
    };
    const slots = [96, 288, 672, 864];
    const row = slots.map((x, i) => {
      const inP = ease(t, Math.min(b[1] + 1.95 + 0.12 * i, end - 0.9), 0.55);
      return {
        cx: lerp(x + (x < 480 ? -520 : 520), x, inP),
        cy: 540,
        r: 86,
        value: ROW_VALUES[i < 2 ? i : i + 1],
        crack: 1,
        expected: 1,
        opacity: inP,
      };
    });
    return { ...base, main, row };
  }

  if (mode === 'setup') {
    const turn = ease(t, b[1] + 0.2, 0.7);
    const shift = ease(t, b[0] - 0.2, 0.5);
    const main: GaugeState = {
      cx: lerp(lerp(480, 600, shift), 480, turn),
      cy: 470,
      r: lerp(230, 250, turn),
      value: 0.17,
      crack: 0,
      expected: 1,
      opacity: 1,
    };
    const tags = [0, 1, 2].map((i) => ease(t, b[0] + 0.5 + 0.7 * i, 0.35) * (1 - turn));
    return {
      ...base,
      main,
      tags,
      wire: progress(t, b[0] + 0.1, 0.5) * (1 - turn),
      transcripts: ease(t, b[0] - 0.2, 0.45) * (1 - turn),
      flip: turn,
      stamp: { scale: popScale(t, b[1] + 1.55), opacity: clamp01((t - (b[1] + 1.55)) / 0.12) },
    };
  }

  // close
  const boxes = [0, 1, 2, 3].map((i) => ease(t, b[1] + 0.15 + 0.35 * i, 0.4));
  const main: GaugeState = {
    cx: 480,
    cy: lerp(640, 690, ease(t, b[1], 0.5)),
    r: lerp(210, 150, ease(t, b[1], 0.5)),
    value: 0.17,
    crack: 1,
    expected: 1,
    opacity: ease(t, -0.2, 0.5),
  };
  return {
    ...base,
    main,
    quote: [ease(t, b[0] - 0.1, 0.4), ease(t, b[0] + 1.0, 0.4)],
    boxes,
    // On "nothing" (~1.2 s into the line), so it reads before the cut, not during the fade.
    empty: ease(t, b[1] + 1.15, 0.35),
  };
}
