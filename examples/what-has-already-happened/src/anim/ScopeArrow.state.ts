// Pure state of failure 1, the dependency the page denies. Two cards, piece 3 and piece 4, joined by
// a dotted "reuses a calculation" arrow; piece 4's script says "I'll rewrite them for you", so the
// arrow snaps (SELF-CONTAINED). Then the six models draw it back in red marker (five solid, Opus
// faint), and gpt-4o's own answer: it copies the exemption, and its scope peels off.
// No Remotion or React here.
import { clamp01, easeOutCubic, progress, sceneTime } from './steps.ts';

export type ScopeMode = 'trap' | 'exempt' | 'models' | 'quote';
export type ScopeArrowProps = { mode: ScopeMode; marks?: number[] };

/** Rows of the models scene: the five that assert the dependency, then claude-opus-5. */
export const ROWS = ['gpt-4o', 'gpt-4.1-mini', 'gpt-5.4-mini', 'claude-haiku-4.5', 'claude-sonnet-4.6', 'claude-opus-5'];
export const QUOTE_1A = 'auth-db-migrator — Prepares the schema auth-api uses. ';
export const QUOTE_1B = 'It’s idempotent and backward-compatible.';
export const QUOTE_2 = 'Always deploy auth-db-migrator before auth-api';

export type ScopeState = {
  cards: { opacity: number; p3: number; p4: number };
  clause: number;
  dotted: { draw: number; split: number; opacity: number; label: number };
  stamp: { pop: number };
  red: { draw: number };
  rows: { opacity: number; draw: number }[];
  ninetyTwo: number;
  opusNote: number;
  quote: { opacity: number; header: number; n1: number; n2: number; highlight: number; peel: number; ticks: number[] };
};

const e = (t: number, s: number, l: number) => easeOutCubic(progress(t, s, l));
const mk = (marks: number[] | undefined, i: number, fallback: number) => {
  const m = marks?.[i];
  return m !== undefined && Number.isFinite(m) ? m : fallback;
};

export function frameState(props: ScopeArrowProps, t: number, beats: number[], dur: number): ScopeState {
  const mode: ScopeMode = ['trap', 'exempt', 'models', 'quote'].includes(props.mode) ? props.mode : 'trap';
  const T = sceneTime(Number.isFinite(t) ? t : 0, dur);
  const m = props.marks;
  const b0 = beats[0] !== undefined && Number.isFinite(beats[0]) ? beats[0] : 0;
  const b1 = beats[1] !== undefined && Number.isFinite(beats[1]) ? beats[1] : b0 + 2;
  const trap = mode === 'trap';
  const exempt = mode === 'exempt';
  const models = mode === 'models';
  const quote = mode === 'quote';

  const no = exempt ? mk(m, 1, b1) : 0;
  const split = exempt ? e(T, no, 0.45) : trap ? 0 : 1;
  const rowAt = (i: number) => 0.15 + i * 0.3;
  const len1 = QUOTE_1A.length + QUOTE_1B.length;
  const copied = mk(m, 0, b0 + 0.9);
  const ignored = mk(m, 1, b0 + 3);
  const cardsOut = quote ? 1 - e(T, 0, 0.3) : 1;

  return {
    cards: { opacity: cardsOut, p3: trap ? e(T, 0, 0.4) : 1, p4: trap ? e(T, 0.15, 0.4) : 1 },
    clause: exempt ? e(T, mk(m, 0, b0 + 1.2) - 0.45, 0.5) : trap ? 0 : 1,
    dotted: {
      draw: trap ? progress(T, mk(m, 0, b0 + 0.8) - 0.1, 0.8) : 1,
      split,
      opacity: 1 - 0.7 * split,
      label: trap ? e(T, mk(m, 0, b0 + 0.8) + 0.3, 0.4) : 1 - 0.6 * split,
    },
    stamp: { pop: exempt ? e(T, no + 0.25, 0.35) : trap ? 0 : 1 },
    red: { draw: models ? progress(T, 0.1, 0.5) : quote ? 1 : 0 },
    rows: ROWS.map((_, i) => ({ opacity: models ? e(T, rowAt(i), 0.25) : 0, draw: models ? progress(T, rowAt(i) + 0.08, 0.3) : 0 })),
    ninetyTwo: models ? e(T, rowAt(4) + 0.35, 0.3) : 0,
    opusNote: models ? e(T, rowAt(5) + 0.35, 0.3) : 0,
    quote: {
      opacity: quote ? e(T, 0.15, 0.3) : 0,
      header: quote ? e(T, 0.15, 0.3) : 0,
      n1: quote ? Math.round(len1 * clamp01(progress(T, 0.25, Math.max(0.5, copied + 0.3 - 0.25)))) : 0,
      n2: quote ? Math.round(QUOTE_2.length * clamp01(progress(T, ignored - 1.0, 0.7))) : 0,
      highlight: quote ? e(T, copied - 0.1, 0.3) : 0,
      peel: quote ? e(T, ignored, 0.8) : 0,
      ticks: quote ? [e(T, copied - 0.3, 0.3), e(T, copied + 0.4, 0.3), e(T, ignored + 0.05, 0.3)] : [0, 0, 0],
    },
  };
}
