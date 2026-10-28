// Pure state of the pilot's mechanism: the article's second figure redrawn as a vertical time
// line with four stops, under the rule all seven models were given. No Remotion or React.
import { machine, type ModeDef } from './tracks.ts';

export const RACE_MODES = ['rule', 'proposal', 'stop1', 'stops'] as const;
export type RaceMode = (typeof RACE_MODES)[number];
export type WorkerRaceProps = { mode: RaceMode; marks?: number[] };

/** The four stops, verbatim from the article's figure; tone: white, teal (effect 1), white, amber (effect 2). */
export const STOPS = [
  { label: 'A checks then pauses', tone: 'plain' },
  { label: 'B sends and finishes', tone: 'ok', effect: 'Effect 1' },
  { label: 'Key record expires', tone: 'plain' },
  { label: 'A resumes and sends', tone: 'warm', effect: 'Effect 2' },
] as const;
export const RACE_TXT = {
  kicker: '2 cases · the rule',
  rule: 'never produce the external effect twice',
  models: ['most models'],
  check: 'deadline check + margin',
  quote: '“negligible, not impossible”',
  who: 'Fable',
} as const;

const INIT = { rule: 0, line: 0, prop: 0, clock: 0, st1: 0, pause: 0, st2: 0, e1: 0, st3: 0, st4: 0, e2: 0, quote: 0 };
export type RaceField = keyof typeof INIT;

const on = (at: number | ['m' | 'b', number, number?], len = 0.4) => ({ to: 1, at, len });

const DEFS: [RaceMode, ModeDef<RaceField>][] = [
  // "Two cases had one rule. Never send the same thing twice." marks: rule, never.
  ['rule', { set: { rule: on(['m', 0, -0.25], 0.45), line: { to: 1, at: ['m', 1, 0.2], len: 1.0 } } }],
  // "Most relied on a time check before retrying." marks: most, time.
  ['proposal', { set: { prop: on(['m', 0, -0.1]), clock: { to: 1, at: ['m', 1, -0.05], len: 0.3 } } }],
  // "But a worker can check, then pause." marks: check, pause.
  ['stop1', { set: { st1: on(['m', 0, -0.1]), pause: on(['m', 1, -0.05], 0.35) } }],
  // "Another sends, the provider forgets, and the first sends again." marks: another, forgets, first, again.
  [
    'stops',
    {
      set: {
        st2: on(['m', 0, -0.1]),
        e1: on(['m', 0, 0.35], 0.35),
        st3: on(['m', 1, -0.1]),
        st4: on(['m', 2, -0.1]),
        e2: { to: 1, at: ['m', 3, -0.05], len: 0.3 },
        quote: on(['m', 3, 0.5], 0.4),
      },
    },
  ],
];

export const RACE = machine(INIT, DEFS);
export type RaceState = Record<RaceField, number>;

export function frameState(props: WorkerRaceProps, t: number, beats: number[], dur: number): RaceState {
  const mode = RACE_MODES.includes(props.mode) ? props.mode : 'rule';
  return RACE.at(mode, t, beats, dur, props.marks);
}
