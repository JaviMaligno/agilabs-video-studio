// Pure state of the self-preference bars: how much more often each judge picks its own answer than
// its peers do on the same pairs, with 95 % CI whiskers; then the baseline restricted to the judge
// with no stake in the pair. Stage pixels (960 x 1090). No Remotion or React here.
import { easeOutCubic } from './steps.ts';
import { GAPS, clock, easeInOut, lerp, mark, signed, type Fam } from './judges.ts';

export type GapMode = 'peers' | 'neutral';
export type GapBarsProps = { mode: GapMode; marks?: number[] };

/** Axis: x of 0 pp and pixels per pp. */
export const X0 = 150;
export const PX = 16.5;
export const xOf = (v: number) => X0 + v * PX;
export const ROW_Y = [360, 580, 800];

export type RowS = { fam: Fam; y: number; grow: number; value: number; lo: number; hi: number; text: string; ci: string; ghost: number; ghostValue: number; mute: number; query: number; ciDraw: number };

export function frameState(props: GapBarsProps, t: number, beats: number[], dur: number) {
  const { p } = clock(t, dur);
  const m = (i: number, fb = 0) => mark(props.marks, i, beats, fb);
  const neutral = props.mode === 'neutral';
  const shrink = neutral ? easeInOut(p(m(0, 1.2), 0.9)) : 0;
  const rows: RowS[] = GAPS.map((g, i) => {
    const grow = neutral ? 1 : easeOutCubic(p(0.35 + i * 0.4, 0.7));
    const value = lerp(g.peers, g.neutral, shrink) * grow;
    const showNeutral = shrink > 0.5;
    const mute = neutral && g.fam === 'grok' ? easeOutCubic(p(m(1, 2.2), 0.4)) : 0;
    return {
      fam: g.fam,
      y: ROW_Y[i],
      grow,
      value,
      lo: lerp(g.ci[0], g.nci[0], shrink),
      hi: lerp(g.ci[1], g.nci[1], shrink),
      text: `${signed(showNeutral ? g.neutral : g.peers)} pp`,
      ci: showNeutral ? `[${signed(g.nci[0])}, ${signed(g.nci[1])}]` : `[${signed(g.ci[0])}, ${signed(g.ci[1])}]`,
      ghost: shrink,
      ghostValue: g.peers,
      mute,
      query: mute,
      ciDraw: neutral ? 1 : easeOutCubic(p(0.75 + i * 0.4, 0.4)),
    };
  });
  return {
    axis: neutral ? 1 : easeOutCubic(p(0.05, 0.4)),
    titlePeers: neutral ? 1 - easeOutCubic(p(m(0, 1.2) - 0.3, 0.4)) : easeOutCubic(p(0.05, 0.4)),
    titleNeutral: neutral ? easeOutCubic(p(m(0, 1.2) - 0.1, 0.4)) : 0,
    /** The 20-30 pp band behind the bars, on "twenty to thirty". */
    band: neutral ? 1 - shrink : easeOutCubic(p(m(0, 2.2), 0.4)),
    rows,
  };
}
