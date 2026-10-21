// Pure state of failure 2, a reason that expired. A pinned rule ("intro last: it must match the
// rest") with its hanging precondition ("…while the rest can still change"); the intro card slides
// to the end of the lane. Then the calendar flips to July, a padlock snaps onto the scripts, the
// precondition greys out with EXPIRED, and the intro stays at the end anyway. Last, the paired bars:
// the strongest model defers it more, not less. No Remotion or React here.
import { easeOutCubic, progress, sceneTime } from './steps.ts';

export type RuleMode = 'rule' | 'expired' | 'bars';
export type ExpiredRuleProps = { mode: RuleMode; marks?: number[] };

/** "defers it because it depends on the rest" (article, failure 2 table). */
export const BARS = [
  { group: 'course', label: 'five smaller models', value: 36, opus: false },
  { group: 'course', label: 'claude-opus-5', value: 60, opus: true },
  { group: 'release', label: 'five smaller models', value: 69, opus: false },
  { group: 'release', label: 'claude-opus-5', value: 98, opus: true },
];
export const LANE = ['intro', 'piece 1', 'piece 2', 'piece 3', '…'];

export type RuleState = {
  scene: { opacity: number };
  rule: number;
  pre: { opacity: number; grey: number; stamp: number };
  calendar: { opacity: number; flip: number; month: string };
  lock: { pop: number };
  /** x of each lane card, in slot units (0..4); the intro moves from 0 to 4. */
  lane: { slot: number; opacity: number }[];
  introStays: number;
  bars: { opacity: number; grow: number[] };
};

const e = (t: number, s: number, l: number) => easeOutCubic(progress(t, s, l));
const mk = (marks: number[] | undefined, i: number, fallback: number) => {
  const m = marks?.[i];
  return m !== undefined && Number.isFinite(m) ? m : fallback;
};

export function frameState(props: ExpiredRuleProps, t: number, beats: number[], dur: number): RuleState {
  const mode: RuleMode = ['rule', 'expired', 'bars'].includes(props.mode) ? props.mode : 'rule';
  const T = sceneTime(Number.isFinite(t) ? t : 0, dur);
  const m = props.marks;
  const b0 = beats[0] !== undefined && Number.isFinite(beats[0]) ? beats[0] : 0;
  const b1 = beats[1] !== undefined && Number.isFinite(beats[1]) ? beats[1] : b0 + 2;
  const rule = mode === 'rule';
  const expired = mode === 'expired';
  const bars = mode === 'bars';

  const slide = rule ? e(T, mk(m, 0, b0 + 1.2), 0.9) : 1;
  const july = expired ? mk(m, 0, b0 + 1.4) : 0;
  const flip = expired ? progress(T, july - 0.35, 0.5) : bars ? 1 : 0;
  const expiredAt = expired ? mk(m, 1, b1 + 0.8) : 0;
  const barStart = (i: number) => mk(m, 0, b0 + 0.4) - 0.3 + i * 0.32;

  return {
    scene: { opacity: bars ? 1 - e(T, 0, 0.35) : 1 },
    rule: rule ? e(T, 0.1, 0.4) : 1,
    pre: {
      opacity: rule ? e(T, mk(m, 1, b0 + 2.2) - 0.2, 0.4) : 1,
      grey: expired ? e(T, expiredAt - 0.1, 0.4) : bars ? 1 : 0,
      stamp: expired ? e(T, expiredAt, 0.35) : bars ? 1 : 0,
    },
    calendar: { opacity: rule ? e(T, 0.2, 0.4) : 1, flip, month: flip >= 0.5 ? 'JULY' : 'AUG' },
    lock: { pop: expired ? e(T, july + 0.25, 0.35) : bars ? 1 : 0 },
    lane: LANE.map((_, i) => ({ slot: i === 0 ? 4 * slide : i - slide, opacity: rule ? e(T, 0.25 + i * 0.08, 0.3) : 1 })),
    introStays: expired ? Math.sin(Math.PI * progress(T, expiredAt + 0.35, 0.5)) : 0,
    bars: { opacity: bars ? e(T, 0.25, 0.35) : 0, grow: BARS.map((_, i) => (bars ? e(T, barStart(i), 0.55) : 0)) },
  };
}
