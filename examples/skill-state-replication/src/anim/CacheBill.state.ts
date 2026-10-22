// Pure state of the cost part. Mode `bill` (line 6): prompt size at step 50 (notepad flat at 2,157
// characters, transcript at 16,437), tokens 7.5x cheaper; then the mechanism (the transcript's old
// lines never change, so they sit under a "cached" glow; the notepad changes every step, so the glow
// slides off it at each write) and the bill: only 1.4x. Mode `order` (line 7): the same notepad +
// transcript prompt stacked two ways; notepad first (the paper's template) costs 5.2x more,
// 869k against 168k effective input tokens per episode. Figures as the articles write them.
// No Remotion or React here.
import { easeOutCubic, progress, sceneTime } from './steps.ts';

export type BillMode = 'bill' | 'order';
export type CacheBillProps = { mode: BillMode; marks?: number[] };

export const SIZES = [
  { label: 'notepad', value: 2157, text: '2,157' },
  { label: 'transcript', value: 16437, text: '16,437' },
] as const;
export const RATIO = { tokens: '7.5x', bill: '1.4x', order: '5.2x' } as const;
export const ORDER = [
  { label: 'notepad first', note: "the paper's template", value: 869, text: '869k' },
  { label: 'notepad last', note: 'transcript cached', value: 168, text: '168k' },
] as const;

export type BillState = {
  sizes: { opacity: number; grow: number[] };
  mech: { opacity: number; scrollGlow: number; padGlow: number; write: number };
  tokens: number;
  bill: number;
  foot: number;
  order: { opacity: number; chip: number; stacks: number[]; glow: number[]; bars: number[]; ratio: number; tag: number };
  /** The bill part fades out as the order part comes in. */
  billOut: number;
};

const e = (t: number, s: number, l: number) => easeOutCubic(progress(t, s, l));
const mk = (marks: number[] | undefined, i: number, fallback: number) => {
  const m = marks?.[i];
  return m !== undefined && Number.isFinite(m) ? m : fallback;
};

/** The notepad's glow: builds up between writes, slides off at each write (period in seconds). */
export const WRITE_PERIOD = 1.3;
export const padGlowAt = (t: number, from: number): number => {
  if (t < from) return 0;
  const ph = ((t - from) % WRITE_PERIOD) / WRITE_PERIOD;
  return ph < 0.7 ? 0.45 * (ph / 0.7) : 0.45 * (1 - (ph - 0.7) / 0.3);
};

export function frameState(props: CacheBillProps, t: number, beats: number[], dur: number): BillState {
  const mode: BillMode = props.mode === 'order' ? 'order' : 'bill';
  const T = sceneTime(Number.isFinite(t) ? t : 0, dur);
  const m = props.marks;
  const b0 = beats[0] !== undefined && Number.isFinite(beats[0]) ? beats[0] : 0;
  const end = {
    sizes: { opacity: 1, grow: [1, 1] },
    mech: { opacity: 1, scrollGlow: 1, padGlow: 0, write: 1 },
    tokens: 1,
    bill: 1,
    foot: 1,
  };
  if (mode === 'bill') {
    const tok = mk(m, 0, b0 + 0.3);
    const seven = mk(m, 1, b0 + 1.0);
    const changing = mk(m, 2, b0 + 3.2);
    const caching = mk(m, 3, b0 + 4.3);
    const bill = mk(m, 4, b0 + 5.4);
    const one = mk(m, 5, b0 + 6.1);
    const glowOn = e(T, caching, 0.6);
    return {
      sizes: { opacity: e(T, tok - 0.4, 0.4), grow: [e(T, tok - 0.2, 0.5), e(T, tok, 1.0)] },
      mech: {
        opacity: e(T, changing - 0.3, 0.4),
        scrollGlow: glowOn,
        padGlow: T >= dur ? 0 : glowOn * padGlowAt(T, caching) / 0.45,
        write: T >= dur || T < changing ? 0 : ((T - changing) % WRITE_PERIOD) / WRITE_PERIOD,
      },
      tokens: e(T, seven - 0.1, 0.4),
      bill: e(T, Math.min(bill, one - 0.3), 0.5),
      foot: e(T, one + 0.2, 0.4),
      order: { opacity: 0, chip: 0, stacks: [0, 0], glow: [0, 0], bars: [0, 0], ratio: 0, tag: 0 },
      billOut: 0,
    };
  }
  const both = mk(m, 0, b0 + 0.2);
  const first = mk(m, 1, b0 + 1.4);
  const tmpl = mk(m, 2, b0 + 2.6);
  const five = mk(m, 3, b0 + 3.6);
  const out = e(T, 0, 0.45);
  return {
    ...end,
    mech: { ...end.mech, padGlow: 0 },
    billOut: out,
    order: {
      opacity: e(T, 0.2, 0.4),
      chip: e(T, both - 0.2, 0.4),
      stacks: [e(T, first - 0.3, 0.45), e(T, first + 0.3, 0.45)],
      glow: [e(T, tmpl, 0.5) * 0.12, e(T, tmpl, 0.5)],
      bars: [e(T, tmpl + 0.3, 0.7), e(T, tmpl + 0.6, 0.7)],
      ratio: e(T, five - 0.1, 0.35),
      tag: e(T, five + 0.8, 0.4),
    },
  };
}
