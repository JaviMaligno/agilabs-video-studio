// Pure state of the CostCard scene (added 2026-10-21): cost per run of the three models, as bars
// against Opus, with Sonnet lit and tagged "trade-off" once the TOOLS.md note is back in the
// picture. Prices exactly as the article's table (measured cost per episode): $1.62 · $0.97 ·
// $0.21; "60% of Opus's cost" is the article's own figure for Sonnet. No Remotion or React here.
import { beatAt, easeOutCubic, fit, progress, sceneTime } from './steps.ts';

/** Seconds after the line's start at which each step lands, matched to the voiced words. */
export type CostCues = { sonnet?: number; tag?: number; share?: number };
export type CostCardProps = { cues?: CostCues };

export const COSTS = [
  { name: 'Opus 5', price: '$1.62', usd: 1.62 },
  { name: 'Sonnet 5', price: '$0.97', usd: 0.97 },
  { name: 'Haiku 4.5', price: '$0.21', usd: 0.21 },
] as const;

/** Index of the highlighted model (Sonnet). */
export const PICK = 1;

export function frameState(p: CostCardProps, time: number, beats: number[], dur: number) {
  const t = sceneTime(time, dur);
  const b0 = beatAt(beats, 0);
  const cues = { sonnet: 1.1, tag: 2.0, share: 2.95, ...(p.cues ?? {}) };
  const E = (start: number, len: number) => easeOutCubic(progress(t, fit(start, len, dur), len));
  const max = COSTS[0].usd;
  const pick = E(b0 + cues.sonnet, 0.4);
  return {
    card: E(0, 0.35),
    note: E(0.1, 0.35),
    rows: COSTS.map((m, i) => ({
      name: m.name,
      price: m.price,
      appear: E(0.1 + 0.12 * i, 0.3),
      grow: E(0.25 + 0.15 * i, 0.7),
      /** Bar length at full growth, as a share of Opus's. */
      fill: m.usd / max,
      lit: i === PICK ? pick : 0,
      dim: i === PICK ? 0 : pick,
    })),
    pick,
    tag: E(b0 + cues.tag, 0.35),
    share: E(b0 + cues.share, 0.4),
  };
}

export type CostState = ReturnType<typeof frameState>;
