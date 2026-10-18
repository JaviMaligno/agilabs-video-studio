// Pure state of the SnapshotDeck scenes: the hook clip as eight snapshot cards (about 0.5 s
// apart, like the article's contact sheet), dealt in order, then shuffled; then the verdict per
// model on how much accuracy each loses when the snapshots are shuffled.
// Illustrative visuals; numbers on screen come from the article. No Remotion or React here.
import { beatAt, easeOutCubic, fit, progress, sceneTime } from './steps.ts';

export type DeckMode = 'shuffle' | 'verdict' | 'hedge';
export type DeckProps = { mode: DeckMode };

export const CARDS = 8;
/** Clip seconds of the eight snapshots, 0.5 s apart. */
export const SNAP_AT = Array.from({ length: CARDS }, (_, k) => 1.0 + 0.5 * k);
/** Card shown in each slot after the shuffle (0-based): the article's "5, 2, 8, 1…". */
export const PERM = [4, 1, 7, 0, 6, 2, 5, 3];

/**
 * Accuracy points lost when the snapshots are shuffled (article): Opus 10, MiniRocket 12; the
 * other four "sit around zero" (no clear drop, drawn as a dot at zero).
 */
export const ROWS = [
  { name: 'Claude Opus 5.5', drop: 10, text: '−10 points', kind: 'opus' },
  { name: 'GPT-5.6 Sol', drop: 0, text: '', kind: 'other' },
  { name: 'GPT-5.6 Terra', drop: 0, text: '', kind: 'other' },
  { name: 'Claude Sonnet 5', drop: 0, text: '', kind: 'other' },
  { name: 'Gemini 3.1 Pro', drop: 0, text: '', kind: 'other' },
  { name: 'Classifier', drop: 12, text: '−12 points', kind: 'classifier' },
] as const;

export function frameState(p: DeckProps, time: number, beats: number[], dur: number) {
  const t = sceneTime(time, dur);
  const d = Number.isFinite(dur) && dur > 0 ? dur : 1;
  const mode = p.mode;
  const b0 = beatAt(beats, 0);
  const has1 = beats[1] !== undefined && Number.isFinite(beats[1]);
  const b1 = has1 ? beats[1] : b0 + 2.2;
  const lineEnd = Math.max(b0 + 0.8, d - 0.8);

  // Deal (shuffle scene only): cards fly in from below, one after another.
  const deal = (k: number) => (mode === 'shuffle' ? easeOutCubic(progress(t, fit(0.05 + k * 0.07, 0.45, d), 0.45)) : 1);
  // Shuffle as "shuffled" is spoken (end of the first line): gather, then re-deal permuted.
  const sh = fit(Math.max(b0 + 0.9, b0 + 0.62 * (b1 - 0.35 - b0)), 1.0, d);
  const gather = mode === 'shuffle' ? easeOutCubic(progress(t, sh, 0.4)) : 1;
  const spread = mode === 'shuffle' ? easeOutCubic(progress(t, sh + 0.45, 0.5)) : 1;
  const shuffled = mode === 'shuffle' ? progress(t, sh + 0.45, 0.5) : 1;

  // Slot of each card: in order (card k in slot k) before; slot PERM.indexOf(k) after.
  const cards = Array.from({ length: CARDS }, (_, k) => {
    const from = k;
    const to = PERM.indexOf(k);
    // During the shuffle every card passes through the deck point (slot -1).
    const inDeck = gather > 0 && spread < 1;
    return {
      k,
      snapAt: SNAP_AT[k],
      deal: deal(k),
      from,
      to,
      /** 0 = at its ordered slot, 1 = at its shuffled slot; `gather` pulls it to the deck point. */
      move: spread,
      gather: inDeck ? gather * (1 - spread) : 0,
      opacity: deal(k),
    };
  });

  // Motion arrow through the cards in their order 1 -> 8: straight when ordered, a broken
  // tangle once shuffled.
  const arrow = {
    draw: mode === 'shuffle' ? easeOutCubic(progress(t, fit(0.05 + CARDS * 0.07 + 0.2, 0.6, d), 0.6)) : 1,
    broken: shuffled,
    opacity: mode === 'shuffle' ? 1 - 0.85 * gather * (1 - spread) : mode === 'verdict' ? 0.35 : 0.25,
  };

  // Big labels under the deck (shuffle scene).
  const labels = {
    ordered: mode === 'shuffle' ? progress(t, fit(0.5, 0.3, d), 0.3) * (1 - progress(t, sh, 0.3)) : 0,
    shuffled: mode === 'shuffle' ? progress(t, sh + 0.6, 0.3) : 0,
    matters: mode === 'shuffle' ? progress(t, fit(b1 + 0.1, 0.4, d), 0.4) : 0,
  };

  // Verdict rows.
  const rows = ROWS.map((r, i) => {
    const appear = mode === 'shuffle' ? 0 : mode === 'verdict' ? progress(t, fit(b0 + 0.05 + i * 0.08, 0.3, d), 0.3) : 1;
    let grow = 0;
    if (r.kind === 'opus') grow = mode === 'verdict' ? easeOutCubic(progress(t, fit(b0 + 0.3 * (lineEnd - b0), 0.8, d), 0.8)) : mode === 'hedge' ? 1 : 0;
    if (r.kind === 'classifier') grow = mode === 'verdict' ? easeOutCubic(progress(t, fit(b0 + 0.68 * (lineEnd - b0), 0.8, d), 0.8)) : mode === 'hedge' ? 1 : 0;
    const rowOpacity = r.kind === 'classifier' ? (mode === 'verdict' ? progress(t, fit(b0 + 0.62 * (lineEnd - b0), 0.3, d), 0.3) : appear) : appear;
    return {
      name: r.name,
      kind: r.kind,
      drop: r.drop,
      text: r.text,
      opacity: rowOpacity,
      grow,
      /** Accent glow on the one model that lost accuracy. */
      glow: r.kind === 'opus' ? grow : 0,
      /** "no evidence" note and the soft "?" (hedge scene), for the four others. */
      note: r.kind === 'other' ? (mode === 'hedge' ? progress(t, fit(b0 + 0.2 + (i - 1) * 0.12, 0.3, d), 0.3) : 0) : 0,
      doubt: r.kind === 'other' ? (mode === 'hedge' ? easeOutCubic(progress(t, fit(b1 + 0.15 + (i - 1) * 0.15, 0.4, d), 0.4)) : 0) : 0,
      /** Opus and the classifier step back while the hedge is about the other four. */
      dim: mode === 'hedge' && r.kind !== 'other' ? 0.45 : 0,
    };
  });

  return {
    mode,
    cards,
    arrow,
    labels,
    rows,
    rowsTitle: mode === 'shuffle' ? 0 : mode === 'verdict' ? progress(t, fit(b0, 0.3, d), 0.3) : 1,
    /** Deck point the cards gather at during the shuffle, as a fraction of the grid box. */
    deck: { x: 0.5, y: 0.5 },
  };
}
