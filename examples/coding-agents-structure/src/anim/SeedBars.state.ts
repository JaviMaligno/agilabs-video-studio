// Pure state of the seed bars: horizontal bars of pass rates, each with its three per-seed runs
// as dots (passes of 19 tasks) and the range in small type, an optional dashed reference line
// ("alone 30 %"), a model chip, and a muted note or a tag under the bars. No Remotion or React.
import { clamp01, easeOutCubic, progress, sceneTime, stepTimes } from './steps.ts';

export type SeedBar = { label: string; value: number; display: string; range: string; seeds: number[]; tone?: 'flag' | 'accent'; at?: number };
export type SeedBarsProps = {
  model: string;
  bars: SeedBar[];
  /** Scale top in percent (default 45). */
  max?: number;
  /** Tasks per seed (default 19). */
  of?: number;
  reference?: { value: number; label: string };
  note?: string;
  tag?: string;
  /** Scene seconds: bar i appears at marks[i]; marks[bars.length] lands the tag. Negative = no mark. */
  marks?: number[];
  /** Scene second the reference line appears. */
  refMark?: number;
};

const GROW = 0.6;

export function frameState(p: SeedBarsProps, time: number, beats: number[], dur: number) {
  const t = sceneTime(time, dur);
  const max = p.max && p.max > 0 ? p.max : 45;
  const of = p.of && p.of > 0 ? p.of : 19;
  const marks = p.marks ?? [];
  const ok = (x: number | undefined): x is number => x !== undefined && Number.isFinite(x) && x >= 0;
  const ats = p.bars.map((b, i) => (b.at !== undefined ? b.at : ok(marks[i]) ? marks[i] : undefined));
  const starts = stepTimes(p.bars.length, beats.length ? [beats[0] + 0.3] : [], ats, GROW, dur);
  const lastStart = starts.length ? Math.max(...starts) : 0;
  const tagAt = ok(marks[p.bars.length]) ? marks[p.bars.length] : lastStart + GROW;
  const refAt = ok(p.refMark) ? p.refMark : 0.1;
  return {
    chip: easeOutCubic(progress(t, 0, 0.35)),
    bars: p.bars.map((b, i) => {
      const grow = easeOutCubic(progress(t, starts[i], GROW));
      return {
        label: b.label,
        display: b.display,
        range: b.range,
        tone: b.tone ?? null,
        /** Bar length as a share of the track. */
        width: clamp01(b.value / max) * grow,
        appear: clamp01(progress(t, starts[i] - 0.1, 0.3)),
        grow,
        dots: b.seeds.map((k, j) => ({ x: clamp01(k / of / (max / 100)), opacity: clamp01(progress(t, starts[i] + GROW * 0.6 + j * 0.08, 0.25)) })),
      };
    }),
    reference: p.reference ? { x: clamp01(p.reference.value / max), label: p.reference.label, opacity: clamp01(progress(t, refAt, 0.4)) } : null,
    note: p.note ? { text: p.note, opacity: clamp01(progress(t, lastStart + GROW + 0.3, 0.4)) } : null,
    tag: p.tag ? { text: p.tag, pop: easeOutCubic(progress(t, tagAt, 0.35)) } : null,
  };
}
