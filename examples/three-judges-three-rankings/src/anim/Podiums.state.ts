// Pure state of the three podiums built from the ranking table: one per judge, step heights =
// win score, crowns on the winners, then each judge's own card linked to where the other two
// placed it. Stage pixels (960 x 1090). No Remotion or React here.
import { easeOutCubic } from './steps.ts';
import { COL_X, FAMS, RANK, SCORE, SCORE_TXT, clock, mark, stepOf, type Fam } from './judges.ts';

export type PodiumMode = 'rank' | 'crowns' | 'self';
export type PodiumsProps = { mode: PodiumMode; marks?: number[] };

export const BASE_Y = 930;
export const K = 4.9;
export const CHIP_Y = 330;

export type StepS = { fam: Fam; x: number; h: number; text: string; rank: number };
export type ColumnS = {
  judge: Fam;
  x: number;
  chip: number;
  rise: number;
  tokens: number;
  values: number;
  crown: number;
  /** Own card glowing (self). */
  glow: number;
  /** Own value and the other two judges' values under the column (self). */
  self: number;
  steps: StepS[];
};
export type LinkS = { from: [number, number]; to: [number, number]; fam: Fam; draw: number };

/** Top centre of the token sitting on `author`'s step under `judge`. */
export const tokenAt = (ji: number, author: Fam): [number, number] => {
  const j = FAMS[ji];
  const st = stepOf(j, author);
  return [COL_X[ji] + st.dx, BASE_Y - st.score * K - 30];
};

/** The other judges' rounded values for `fam` ("58 / 55"), in FAMS order. */
export const othersText = (fam: Fam): string =>
  FAMS.filter((j) => j !== fam)
    .map((j) => SCORE_TXT[j][fam].replace('%', ''))
    .join(' / ');

export function frameState(props: PodiumsProps, t: number, beats: number[], dur: number) {
  const { p } = clock(t, dur);
  const m = (i: number, fb = 0) => mark(props.marks, i, beats, fb);
  const built = props.mode !== 'rank';
  const title = built ? 1 : easeOutCubic(p(0.05, 0.4));
  const columns: ColumnS[] = FAMS.map((j, i) => {
    const one = (start: number, len = 0.4) => (built ? 1 : easeOutCubic(p(start, len)));
    let crown = 0;
    if (props.mode === 'self') crown = 1;
    if (props.mode === 'crowns') crown = easeOutCubic(p(j === 'claude' ? m(1, 1.8) : m(0, 0.3) + i * 0.25, 0.4));
    const glow = props.mode === 'self' ? easeOutCubic(p(0.25 + i * 0.55, 0.4)) : 0;
    return {
      judge: j,
      x: COL_X[i],
      chip: one(0.1 + i * 0.12),
      rise: one(0.35 + i * 0.25, 0.7),
      tokens: one(0.75 + i * 0.25, 0.4),
      values: one(1.05 + i * 0.25),
      crown,
      glow,
      self: props.mode === 'self' ? easeOutCubic(p(0.45 + i * 0.55, 0.4)) : 0,
      steps: RANK[j].map((f) => {
        const st = stepOf(j, f);
        return { fam: f, x: COL_X[i] + st.dx, h: SCORE[j][f] * K, text: SCORE_TXT[j][f], rank: st.rank };
      }),
    };
  });
  const links: LinkS[] = [];
  if (props.mode === 'self') {
    FAMS.forEach((f, i) => {
      const from = tokenAt(i, f);
      FAMS.forEach((_, o) => {
        if (o === i) return;
        links.push({ from, to: tokenAt(o, f), fam: f, draw: easeOutCubic(p(0.45 + i * 0.55, 0.5)) });
      });
    });
  }
  return { title, columns, links, mode: props.mode };
}
