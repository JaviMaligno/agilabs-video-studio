// ChainTradeoff: where the square root comes from, on the blackboard.
// `chain`: "√ ?", the simpler-world twin (Weil's heavy toolbox, Stepanov's pencil), a derivative
// bouncing off a whole number, Alpöge's chain drawn link by link (each link packs the box more),
// then the chain becomes the m axis: a falling cost (∝ x/m), a rising one (∝ m), their sum, and
// the minimum at m = √x. `credit`: the violet robot holds the card "chain length √x".
// Pure numbers (no Remotion or React), checked by test/ChainTradeoff.test.ts.
import { clamp01, easeOutCubic, progress, sceneTime } from './steps.ts';

export type ChainTradeoffProps = {
  mode: 'chain' | 'credit' | string;
  /** Scene seconds of the words the steps land on (TTS word timings); missing ones fall back to offsets. */
  cues?: Partial<Record<string, number>>;
};

export const LINKS = 9;

/** The trade-off: what a short chain loses (X/m) and what every link costs (A·m). */
export const X = 24.3;
export const A = 1.2;
export const M_MIN = 0.9;
export const M_MAX = 10.4;
export const V_MAX = 18;
export const loses = (m: number): number => X / Math.max(1e-6, m);
export const costs = (m: number): number => A * m;
export const total = (m: number): number => loses(m) + costs(m);
/** Where the two meet, and where their sum is smallest: m = √(X/A). */
export const M_BEST = Math.sqrt(X / A);

export function frameState(p: ChainTradeoffProps, time: number, beats: number[], dur: number) {
  const t = sceneTime(time, dur);
  const n = p.mode === 'credit' ? 2 : 11;
  const B: number[] = [];
  for (let i = 0; i < n; i++) {
    const b = beats[i];
    B.push(Math.max(i > 0 ? B[i - 1] : 0, b !== undefined && Number.isFinite(b) ? b : i > 0 ? B[i - 1] : 0));
  }
  const cue = (name: string, fallback: number): number => {
    const c = p.cues?.[name];
    return c !== undefined && Number.isFinite(c) ? c : fallback;
  };
  const ambient = Number.isFinite(time) ? Math.min(Math.max(0, time), 1e6) : 0;

  if (p.mode === 'credit') {
    return {
      ambient,
      chain: 0 as const,
      robot: easeOutCubic(progress(t, 0, 0.6)),
      card: progress(t, cue('suggestion', B[0] + 1.2) - 0.1, 0.5),
      creditLabel: progress(t, cue('credited', B[0] + 4.2) - 0.2, 0.5),
      quote: progress(t, B[1] + 0.2, 0.5),
      author: progress(t, B[1] + 0.6, 0.5),
    };
  }

  const linkStart = cue('again', B[5] + 1.3) - 0.1;
  const linkEnd = Math.max(linkStart + 1, cue('divisible', B[5] + 4.2));
  const gap = (linkEnd - linkStart) / (LINKS - 1);
  const links = Array.from({ length: LINKS }, (_, i) => easeOutCubic(progress(t, i === 0 ? B[4] + 0.3 : linkStart + (i - 1) * gap, 0.4)));
  const banner = progress(t, B[10] + 0.2, 0.6);

  return {
    ambient,
    chain: 1 as const,
    /** The opening question mark over the root. */
    question: clamp01(1 - progress(t, B[1], 0.6)),
    curve: progress(t, B[1] + 0.2, 1.0),
    stepanov: progress(t, cue('1969', B[1] + 1.9) - 0.1, 0.5),
    simpler: progress(t, cue('simpler', B[1] + 3.7) - 0.1, 0.4),
    twin: progress(t, cue('twin', B[1] + 4.8) - 0.1, 0.4),
    world: progress(t, cue('world', B[2] + 0.8) - 0.2, 0.4),
    weil: progress(t, cue('1940s', B[2] + 2.5) - 0.2, 0.5),
    /** The history panel (curve, toolbox, pencil) clears for the derivative. */
    history: clamp01(1 - progress(t, B[3] + 1.1, 0.5)),
    seven: progress(t, B[3] + 1.2, 0.5),
    /** 0..1 over the derivative's flight: in, hit the 7, thrown back and down. */
    deriv: progress(t, Math.max(B[3] + 1.5, cue('whole', B[3] + 3.5) - 0.45 * 2.2), 2.2),
    noDeriv: progress(t, cue('whole', B[3] + 3.5) - 0.2, 0.4),
    derivPanel: clamp01(1 - progress(t, B[4] + 0.3, 0.4)),
    chainLabel: progress(t, B[4] + 0.1, 0.5),
    links,
    moreDivisible: progress(t, cue('divisible', B[5] + 4.2) - 0.3, 0.4),
    /** The box icons over the links give way to the graph. */
    icons: clamp01(1 - progress(t, B[6], 0.5)),
    axes: progress(t, B[6] + 0.1, 0.6),
    fall: progress(t, B[6] + 0.4, 1.4),
    fallLabel: progress(t, B[6] + 1.0, 0.4),
    rise: progress(t, B[7] + 0.3, 1.2),
    riseLabel: progress(t, B[7] + 0.9, 0.4),
    total: progress(t, B[8] + 0.1, 1.8),
    /** The two cost labels dim once the total is drawn. */
    costLabels: clamp01(1 - 0.6 * progress(t, B[8] + 0.4, 0.5)),
    blunt: clamp01(progress(t, cue('blunt', B[8] + 1.7) - 0.3, 0.4) * (1 - banner)),
    pile: clamp01(progress(t, cue('long', B[8] + 2.6) - 0.2, 0.4) * (1 - banner)),
    best: progress(t, cue('meet', B[9] + 1.6) - 0.3, 0.5),
    root: progress(t, cue('root', B[9] + 2.7) - 0.3, 0.5),
    banner,
  };
}
