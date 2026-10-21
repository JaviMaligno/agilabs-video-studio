// Pure state of case 1, the word detector. One phase per narration beat:
//   0 two agent panes: "wait, I'm in that file" -> "go ahead"; a net /wait|hold|go ahead/ is cast
//     over a feed of messages
//   1 the net hauls in 19 chips, 5 get a "closed" tick; the gauge reads closed 5 / 19, inside the
//     "agents don't finish" arc
//   2 recount: a magnifier sweeps the chips, 16 grey out, 3 stay; the gauge's lid lifts, the
//     magnet is plucked and the needle swings to 3 / 3
//   3 two of the greyed chips zoom up: mentions, not requests
// Chip texts are illustrative paraphrases (the corpus is private). No Remotion or React here.
import { clamp01, progress, sceneTime } from './steps.ts';
import { ease, fillBeats, lerp, window01 } from './gauge.ts';

export type WordNetProps = Record<string, never> | { [k: string]: unknown };

/** [before, keyword, after] */
export const CHIPS: [string, string, string][] = [
  ['', 'wait', ", I'm in auth"],
  ['will ', 'wait', ' for CI'],
  ['', 'go ahead', ', merged'],
  ['', 'hold', ' on: in db.py'],
  ['on ', 'hold', ' till Mon'],
  ['said ', 'go ahead', ''],
  ['', 'wait', ' for tests?'],
  ["I'll ", 'hold', ' off'],
  ['', 'wait', ', in api.ts'],
  ['no need to ', 'wait', ''],
  ['', 'hold', ' the version'],
  ['', 'go ahead', ' = ok?'],
  ['', 'wait', 'ing on lint'],
  ['', 'hold', ': flaky test'],
  ['', 'go ahead', ' next'],
  ["can't ", 'wait', '!'],
  ['', 'wait', ', typo'],
  ['', 'hold', ' for review'],
  ['', 'go ahead', ' with it'],
];
/** The three real wait requests (all closed) and the two other ticked chips. */
export const REAL = [0, 3, 8] as const;
export const CLOSED = [0, 3, 7, 8, 14] as const;

/** Gauge readings: share of sequences that closed. */
export const BEFORE = 5 / 19;
export const AFTER = 1;

export type WordNetState = {
  tag: number;
  panes: number;
  ask: { fly: number; opacity: number };
  reply: { fly: number; opacity: number };
  net: number;
  feed: { offset: number; opacity: number };
  chips: { pop: number; tick: number; grey: number; keep: number }[];
  count: number;
  /** Magnifier position along the chips (index, fractional) and its opacity. */
  lens: { at: number; opacity: number };
  falsePos: number;
  gauge: { opacity: number; value: number; lift: number; magnetOut: number; after: number };
  mentions: { pop: number; scrim: number }[];
};

export function frameState(_props: WordNetProps, t0: number, beats: number[], dur: number): WordNetState {
  const t = sceneTime(t0, dur);
  const b = fillBeats(beats, [3.9, 3.4, 3.2, 3.0], dur);

  const chips = CHIPS.map((_, i) => {
    const real = (REAL as readonly number[]).includes(i);
    const closed = (CLOSED as readonly number[]).includes(i);
    const sweep = b[2] + 0.15 + i * 0.06;
    return {
      pop: ease(t, b[1] - 0.1 + i * 0.045, 0.3),
      tick: closed ? ease(t, b[1] + 1.25 + (CLOSED as readonly number[]).indexOf(i) * 0.1, 0.25) * (real ? 1 : 1 - ease(t, sweep, 0.25)) : 0,
      grey: real ? 0 : ease(t, sweep, 0.25),
      keep: real ? ease(t, sweep, 0.3) : 0,
    };
  });

  const lift = window01(t, b[2] + 1.25, b[2] + 2.5, 0.35);
  const magnetOut = ease(t, b[2] + 1.55, 0.5);
  const swing = ease(t, b[2] + 1.8, 0.7);

  return {
    tag: ease(t, -0.2, 0.4),
    panes: ease(t, b[0] - 0.2, 0.4) * lerp(1, 0, ease(t, b[1] - 0.2, 0.35)),
    ask: { fly: ease(t, b[0] + 0.35, 0.8), opacity: ease(t, b[0] + 0.2, 0.2) },
    reply: { fly: ease(t, b[0] + 1.5, 0.7), opacity: ease(t, b[0] + 1.4, 0.2) },
    net: ease(t, b[0] + 2.2, 0.5) * (1 - ease(t, b[1] + 0.2, 0.4)),
    feed: { offset: Math.min(Math.max(t - b[0], 0), 8) * 70, opacity: ease(t, b[0] + 2.0, 0.5) * (1 - ease(t, b[1] - 0.1, 0.4)) },
    chips,
    count: ease(t, b[1] + 0.6, 0.3),
    lens: { at: clamp01(progress(t, b[2] + 0.15, 19 * 0.06)) * 18, opacity: window01(t, b[2], b[2] + 1.4, 0.2) },
    falsePos: ease(t, b[2] + 1.3, 0.35),
    gauge: {
      opacity: ease(t, b[1] + 0.3, 0.4),
      value: lerp(BEFORE, AFTER, swing),
      lift,
      magnetOut,
      after: t >= b[2] + 2.0 ? 1 : 0,
    },
    mentions: [0, 1].map((i) => ({ pop: ease(t, b[3] + 0.1 + i * 0.5, 0.4), scrim: ease(t, b[3], 0.3) })),
  };
}
