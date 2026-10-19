// Pure state of the SnapshotDeck scenes (adapted from the first video, examples/sport-from-motion):
// - laya: the hook clip as eight snapshot cards dealt in order in front of the LAYA chip, which
//   reads the order; then shuffled (the chip dims) and the points each reader loses.
// - company: two tables of chips. ACCURACY: Laya slides in among the five frontier models, the
//   classifier alone far ahead. READS THE ORDER: Laya hops down to sit with Opus and the classifier.
// Illustrative visuals; numbers on screen come from the article. No Remotion or React here.
import { beatAt, clamp01, easeOutCubic, fit, progress, sceneTime } from './steps.ts';

export type DeckMode = 'laya' | 'company';
export type DeckProps = { mode: DeckMode };

export const CARDS = 8;
/** Clip seconds of the eight snapshots, 0.5 s apart. */
export const SNAP_AT = Array.from({ length: CARDS }, (_, k) => 1.0 + 0.5 * k);
/** Card shown in each slot after the shuffle (0-based): the first video's "5, 2, 8, 1…". */
export const PERM = [4, 1, 7, 0, 6, 2, 5, 3];

/** Accuracy points lost when the snapshots are shuffled (article). */
export const ROWS = [
  { name: 'Laya', drop: 8, text: '−8 points', kind: 'laya' },
  { name: 'Opus 5.5', drop: 10, text: '−10', kind: 'opus' },
  { name: 'Classifier', drop: 12, text: '−12', kind: 'classifier' },
] as const;

/** Frontier chips in the ACCURACY table, in slot order; slot 4 is where Laya slides in. */
export const FRONTIER = ['GPT-5.6 Sol', 'GPT-5.6 Terra', 'Claude Opus 5.5', 'Claude Sonnet 5', null, 'Gemini 3.1 Pro'] as const;
export const LAYA_SLOT = 4;
export const OPUS_SLOT = 2;

export function frameState(p: DeckProps, time: number, beats: number[], dur: number) {
  const t = sceneTime(time, dur);
  const d = Number.isFinite(dur) && dur > 0 ? dur : 1;
  const mode = p.mode;
  const b0 = beatAt(beats, 0);
  const has1 = beats[1] !== undefined && Number.isFinite(beats[1]);
  const b1 = has1 ? beats[1] : b0 + 0.45 * (d - b0);
  const lineEnd = Math.max(b1 + 0.8, d - 0.8);
  const len1 = Math.max(0.8, lineEnd - b1);

  // ---- laya ----
  const laya = mode === 'laya';
  const deal = (k: number) => (laya ? easeOutCubic(progress(t, fit(0.05 + k * 0.07, 0.45, d), 0.45)) : 0);
  // Shuffle on "shuffled" (the first word of the second line): gather, then re-deal permuted.
  const sh = fit(b1 - 0.05, 1.0, d);
  const gather = laya ? easeOutCubic(progress(t, sh, 0.4)) : 0;
  const spread = laya ? easeOutCubic(progress(t, sh + 0.45, 0.5)) : 0;
  const cards = Array.from({ length: CARDS }, (_, k) => ({
    k,
    snapAt: SNAP_AT[k],
    deal: deal(k),
    from: k,
    to: PERM.indexOf(k),
    move: spread,
    gather: gather > 0 && spread < 1 ? gather * (1 - spread) : 0,
    opacity: deal(k),
  }));
  const arrow = {
    draw: laya ? easeOutCubic(progress(t, fit(0.05 + CARDS * 0.07 + 0.15, 0.6, d), 0.6)) : 0,
    broken: laya ? progress(t, sh + 0.45, 0.5) : 0,
    opacity: laya ? 1 - 0.85 * gather * (1 - spread) : 0,
  };
  // The LAYA chip glows while it reads the order, dims once shuffled.
  const chip = {
    opacity: laya ? progress(t, fit(0.3, 0.3, d), 0.3) : 0,
    glow: laya ? progress(t, fit(b0 + 0.6, 0.5, d), 0.5) * (1 - progress(t, sh + 0.2, 0.5)) : 0,
    dim: laya ? progress(t, sh + 0.2, 0.5) : 0,
    epochs: laya ? progress(t, fit(b0 + 0.3, 0.3, d), 0.3) : 0,
  };
  const rowAt = [b1 + 0.38 * len1, b1 + 0.72 * len1, b1 + 0.82 * len1];
  const rows = ROWS.map((r, i) => {
    const at = fit(rowAt[i] - 0.25, 0.8, d);
    return {
      name: r.name,
      kind: r.kind,
      opacity: laya ? progress(t, fit((i === 0 ? b1 + 0.15 : rowAt[i] - 0.35), 0.3, d), 0.3) : 0,
      grow: laya ? easeOutCubic(progress(t, at, 0.8)) : 0,
    };
  });
  const rowsTitle = laya ? progress(t, fit(b1 + 0.1, 0.3, d), 0.3) : 0;
  const foot = laya ? progress(t, fit(lineEnd - 0.4, 0.4, d), 0.4) : 0;

  // ---- company ----
  const comp = mode === 'company';
  const lenA = Math.max(0.8, b1 - 0.35 - b0);
  const frontier = FRONTIER.map((name, i) => ({
    name: name ?? '',
    slot: i,
    opacity: comp && name ? progress(t, fit(0.05 + i * 0.06, 0.3, d), 0.3) : 0,
    /** "≈ 0" on the four that do not lose accuracy when shuffled. */
    zero: comp && name && i !== OPUS_SLOT ? progress(t, fit(b1 + 0.7 * len1, 0.3, d), 0.3) : 0,
    /** Opus moves down to the order table on the second line. */
    down: comp && i === OPUS_SLOT ? easeOutCubic(progress(t, fit(b1 + 0.05, 0.6, d), 0.6)) : 0,
  }));
  const slide = comp ? easeOutCubic(progress(t, fit(b0 + 0.35 * lenA, 0.7, d), 0.7)) : 0;
  const hop = comp ? clamp01(progress(t, fit(b1 + 0.38 * len1, 0.7, d), 0.7)) : 0;
  const company = {
    accTitle: comp ? progress(t, fit(0.05, 0.3, d), 0.3) : 0,
    classifier: comp ? progress(t, fit(b0 + 0.75 * lenA, 0.35, d), 0.35) : 0,
    classifierDown: comp ? easeOutCubic(progress(t, fit(b1 + 0.15, 0.6, d), 0.6)) : 0,
    orderTitle: comp ? progress(t, fit(b1 - 0.1, 0.3, d), 0.3) : 0,
    /** Laya: slides into the frontier table, then hops (an arc) down to the order table. */
    laya: { slide, hop: easeOutCubic(hop), arc: Math.sin(Math.PI * hop), number: 1 - hop, opacity: comp ? progress(t, fit(b0 + 0.35 * lenA, 0.2, d), 0.2) : 0 },
    seats: comp ? progress(t, fit(b1 - 0.1, 0.3, d), 0.3) : 0,
    glow: comp ? progress(t, fit(b1 + 0.38 * len1 + 0.6, 0.4, d), 0.4) : 0,
  };

  return { mode, cards, arrow, chip, rows, rowsTitle, foot, frontier, company };
}
