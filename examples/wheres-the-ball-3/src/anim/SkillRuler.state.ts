// Pure state of the SkillRuler scenes: how much of the network's skill ten numbers and a tree
// recover. Each ruler runs from "plain average" (0 %) to "the 60 kB net" (100 %); the span
// between them is shaded, "what the net adds"; the "10 numbers + a tree" bar fills to its share.
// - football: one ruler, the bar fills to 92% (scene 7);
// - basketball: a second ruler under it, the bar overshoots the right tick to 112% (scene 8).
// Figures exactly as the article writes them. No Remotion or React here.
import { beatAt, easeOutCubic, fit, progress, sceneTime } from './steps.ts';
import { markAt } from './PitchPlayback.state.ts';

export type RulerMode = 'football' | 'basketball';
export type SkillRulerProps = { mode: RulerMode; marks?: number[]; layout?: string };

export const RULERS = [
  { sport: 'Football', share: 0.92, text: '92%' },
  { sport: 'Basketball', share: 1.12, text: '112%' },
] as const;

/** Seconds the bar takes to fill. */
export const FILL_SECONDS = 1.2;

export function frameState(p: SkillRulerProps, time: number, beats: number[], dur: number) {
  const t = sceneTime(time, dur);
  const d = Number.isFinite(dur) && dur > 0 ? dur : 1;
  const b0 = beatAt(beats, 0);
  const m0 = fit(markAt(p.marks, 0, b0 + 0.6), 0.6, d);
  const m1 = fit(markAt(p.marks, 1, m0 + 1.5), FILL_SECONDS, d);
  const m2 = fit(markAt(p.marks, 2, m1 + 1.5), 0.6, d);
  const m3 = fit(markAt(p.marks, 3, m2 + 0.7), 0.6, d);
  const foot = p.mode === 'football';

  const rulers = RULERS.map((r, i) => {
    if (i === 0) {
      // Football: on screen in both scenes; it plays out in its own scene and is finished after.
      const appear = foot ? progress(t, 0.1, 0.5) : 1;
      const label = foot ? progress(t, m0 - 0.1, 0.4) : 1;
      const fill = foot ? easeOutCubic(progress(t, m1, FILL_SECONDS)) : 1;
      const span = foot ? progress(t, m2 - 0.1, 0.4) : 0;
      const base = foot ? progress(t, m3 - 0.1, 0.4) : 0;
      return { ...r, appear, label, fill, value: Math.round(92 * fill), span, base, small: 0 };
    }
    const appear = foot ? 0 : easeOutCubic(progress(t, 0.1, 0.5));
    const fill = foot ? 0 : easeOutCubic(progress(t, fit(markAt(p.marks, 1, b0 + 2) - 0.3, FILL_SECONDS, d), FILL_SECONDS));
    return { ...r, appear, label: appear, fill, value: Math.round(112 * fill), span: 0, base: 0, small: foot ? 0 : progress(t, fit(markAt(p.marks, 1, b0 + 2) + 0.9, 0.4, d), 0.4) };
  });
  return { rulers };
}
