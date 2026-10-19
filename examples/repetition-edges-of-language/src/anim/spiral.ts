// Archimedean word spiral (illustrative of a degeneration loop): copies of one word placed along
// r = R·(θ/θmax)^tight, each sized by its radius so the spiral is self-similar, streaming inward
// from the rim and vanishing at the centre. Deterministic from t. No Remotion or React here.
import { clamp01 } from './steps.ts';

export type SpiralWord = { text: string; x: number; y: number; size: number; angle: number; opacity: number };

export type SpiralOpts = {
  /** The repeated texts, cycling along the spiral; each copy keeps its text as it travels. */
  words: string[];
  cx: number;
  cy: number;
  /** Outer radius in px. */
  R: number;
  turns?: number;
  /** Copies per turn. */
  perTurn?: number;
  /** Scene time in seconds (drives the inward flow). */
  t: number;
  /** Inward flow, radians per second. */
  speed?: number;
  /** 0..1: how much of the spiral has unwound from the rim so far. */
  grow?: number;
  /** 1 = Archimedean; > 1 winds tighter towards the centre. */
  tight?: number;
  /** Extra rotation of the whole spiral, radians. */
  rot?: number;
  /** Largest font size in px. */
  maxSize?: number;
};

const finite = (x: number, d = 0) => (Number.isFinite(x) ? x : d);

export const spiralWords = (o: SpiralOpts): SpiralWord[] => {
  const turns = o.turns ?? 3.2;
  const perTurn = Math.max(2, o.perTurn ?? 7);
  const tight = o.tight ?? 1;
  const speed = o.speed ?? 1.1;
  const grow = clamp01(o.grow ?? 1);
  const thMax = turns * 2 * Math.PI;
  const dTh = (2 * Math.PI) / perTurn;
  const count = Math.ceil(turns * perTurn);
  // Flow: everything moves inward by speed·t, wrapped to one spacing so copies recycle.
  const flow = ((finite(o.t) * speed) % dTh + dTh) % dTh;
  // Copies recycle when the flow wraps: slot k then shows what slot k-1 showed.
  const wraps = Math.floor(Math.max(0, Math.min(finite(o.t), 1e4)) * speed / dTh);
  const texts = o.words.length ? o.words : [''];
  const out: SpiralWord[] = [];
  for (let k = 0; k < count; k++) {
    const th = thMax - (k * dTh + flow);
    if (th <= 0.15) continue;
    const u = th / thMax;
    const r = o.R * u ** tight;
    const along = (thMax - th) / thMax;
    if (along > grow + 1e-9) continue;
    const a = th + (o.rot ?? 0);
    const text = texts[(((k - wraps) % texts.length) + texts.length) % texts.length];
    const len = Math.max(1, Array.from(text).length);
    const spacing = r * dTh;
    const size = Math.min(o.maxSize ?? 64, (0.9 * spacing) / (0.56 * len));
    const rim = clamp01((thMax - th) / (dTh * 0.9));
    const centre = clamp01((r - 10) / 45);
    out.push({
      text,
      x: finite(o.cx + r * Math.cos(a)),
      y: finite(o.cy + r * Math.sin(a)),
      size: Math.max(0, finite(size)),
      angle: finite(((a * 180) / Math.PI + 90) % 360),
      opacity: clamp01(rim * centre),
    });
  }
  return out;
};
