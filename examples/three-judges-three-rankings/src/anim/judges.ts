// Data and shared geometry for the judge scenes. Pure (no Remotion or React).
// Every figure comes from the article's tables (factcheck.md), re-derived from the raw judgments.
import { fit, progress, sceneTime } from './steps.ts';

export type Fam = 'gpt' | 'grok' | 'claude';
export const FAMS: Fam[] = ['gpt', 'grok', 'claude'];

/** The family name (voice and big chip text) and the model (small chip text). */
export const SHORT: Record<Fam, string> = { gpt: 'GPT', grok: 'Grok', claude: 'Claude' };
export const MODEL: Record<Fam, string> = { gpt: '5.5', grok: '4.3', claude: 'Sonnet 4.6' };
export const FULL: Record<Fam, string> = { gpt: 'GPT-5.5', grok: 'Grok-4.3', claude: 'Claude Sonnet 4.6' };

/** Win score of each generator under each judge (ranking table, "by <judge>" columns). */
export const SCORE: Record<Fam, Record<Fam, number>> = {
  gpt: { gpt: 85.0, claude: 35.0, grok: 30.0 },
  grok: { gpt: 58.3, grok: 53.3, claude: 38.3 },
  claude: { claude: 61.7, gpt: 55.0, grok: 33.3 },
};
/** The same, rounded as the article's ranking figure writes them. */
export const SCORE_TXT: Record<Fam, Record<Fam, string>> = {
  gpt: { gpt: '85%', claude: '35%', grok: '30%' },
  grok: { gpt: '58%', grok: '53%', claude: '38%' },
  claude: { claude: '62%', gpt: '55%', grok: '33%' },
};

/** Ranking under each judge, best first. */
export const RANK: Record<Fam, Fam[]> = Object.fromEntries(
  FAMS.map((j) => [j, [...FAMS].sort((a, b) => SCORE[j][b] - SCORE[j][a])]),
) as Record<Fam, Fam[]>;

/** Column centres of the three judges across the stage (stage is 960 wide). */
export const COL_X = [160, 480, 800];
export const STAGE_W = 960;
export const STAGE_H = 1090;

/** Podium steps: first in the middle, second on the left, third on the right. */
export const STEP_DX = [0, -96, 96];
export const STEP_W = 90;

export const stepOf = (judge: Fam, author: Fam) => {
  const rank = RANK[judge].indexOf(author);
  return { rank, dx: STEP_DX[rank], score: SCORE[judge][author] };
};

/** Self-preference against both peers on the same pairs (self-preference table). */
export const GAPS: { fam: Fam; peers: number; ci: [number, number]; neutral: number; nci: [number, number] }[] = [
  { fam: 'gpt', peers: 28.3, ci: [16.7, 40.0], neutral: 21.7, nci: [8.3, 35.0] },
  { fam: 'claude', peers: 25.0, ci: [12.5, 36.7], neutral: 15.0, nci: [0.0, 28.3] },
  { fam: 'grok', peers: 21.7, ci: [9.2, 35.8], neutral: 13.3, nci: [-1.7, 30.0] },
];

/** Self-preference by subjectivity, pp: [level][judge in FAMS order]. */
export const LEVELS = ['objective', 'medium', 'subjective'] as const;
export const BIAS: number[][] = [
  [17.5, 7.5, -2.5],
  [25.0, 27.5, 30.0],
  [42.5, 30.0, 47.5],
];

/** Cohen's kappa between judge pairs, subjective column. */
export const KAPPA: { a: Fam; b: Fam; k: string }[] = [
  { a: 'gpt', b: 'grok', k: '−0.01' },
  { a: 'gpt', b: 'claude', k: '−0.03' },
  { a: 'grok', b: 'claude', k: '+0.05' },
];

/** Signed one-decimal figure as the article writes it ("+17.5", "−2.5"). */
export const signed = (v: number): string => `${v < 0 ? '−' : '+'}${Math.abs(v).toFixed(1)}`;

/** A mark (scene second) given by the timeline, or a beat, or a fallback. Always finite. */
export const mark = (marks: number[] | undefined, i: number, beats: number[], fallback = 0): number => {
  const m = marks?.[i];
  if (m !== undefined && Number.isFinite(m)) return m;
  const b = beats[i];
  return b !== undefined && Number.isFinite(b) ? b : fallback;
};

/**
 * A clock for one scene: `p(start, len)` is the progress of an animation fitted to finish by the
 * scene end, read at scene time (which counts every animation as finished from `dur` on).
 */
export const clock = (t: number, dur: number) => {
  const T = sceneTime(t, dur);
  const p = (start: number, len: number) => progress(T, fit(start, len, dur), len);
  return { T, p };
};

export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const easeInOut = (x: number) => {
  const c = Math.min(1, Math.max(0, x));
  return c < 0.5 ? 4 * c * c * c : 1 - (-2 * c + 2) ** 3 / 2;
};
