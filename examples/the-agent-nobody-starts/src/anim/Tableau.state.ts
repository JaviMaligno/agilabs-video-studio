// Tableau: an illustrated scene built from generated drawings and short chips placed on the stage.
// Each item appears on a narration beat (or at a scene second) with a pop, a slide or a stamp, and may
// leave on a later beat. The whole picture drifts in slowly so the stage is never frozen.
// Pure state: no Remotion or React, tested with `node --test`.
import { clamp01, easeOutCubic, fit, progress, sceneTime } from './steps.ts';
import type { Label } from '../types.ts';

export type TableauItem = {
  /** Image under public/ (transparent PNG). Either src or text. */
  src?: string;
  /** Short chip text. */
  text?: Label;
  /** Centre, as a fraction of the stage (0..1). */
  x: number;
  y: number;
  /** Width as a fraction of the stage width (images), or font size in px (chips, default 52). */
  w?: number;
  size?: number;
  /** Beat index it appears on (default: the scene start); `sec` pins it to a scene second. */
  at?: number;
  sec?: number;
  /** Extra delay after its beat, in seconds. */
  delay?: number;
  /** Beat index on which it leaves; `outSec` pins it to a scene second. */
  out?: number;
  outSec?: number;
  /** How it enters. */
  kind?: 'static' | 'pop' | 'slide' | 'fade' | 'stamp' | 'shake';
  /** Chip colour. */
  tone?: 'plain' | 'ok' | 'bad' | 'accent' | 'night';
  /** Rotation in degrees (stamps). */
  rot?: number;
};

export type TableauProps = { items: TableauItem[]; drift?: number };

export type ItemFrame = { opacity: number; scale: number; dx: number; dy: number; rot: number };
export type TableauFrame = { zoom: number; items: ItemFrame[] };

const IN = 0.45;
const OUT = 0.35;

const startOf = (at: number | undefined, sec: number | undefined, beats: number[], delay = 0): number => {
  if (sec !== undefined && Number.isFinite(sec)) return sec + delay;
  if (at !== undefined) {
    const b = beats[at];
    if (b !== undefined && Number.isFinite(b)) return b + delay;
    // a missing beat: after the last one we know, so it still shows before the scene ends
    const last = beats.length ? beats[beats.length - 1] : 0;
    return (Number.isFinite(last) ? last : 0) + 0.6 * (at - beats.length + 1) + delay;
  }
  return delay;
};

export const frameState = (props: TableauProps, t: number, beats: number[], dur: number): TableauFrame => {
  const T = sceneTime(t, dur);
  const items = (props.items ?? []).map((it): ItemFrame => {
    const s = fit(startOf(it.at, it.sec, beats, it.delay ?? 0), IN, dur);
    const p = progress(T, s, IN);
    const e = easeOutCubic(p);
    let leave = 0;
    if (it.out !== undefined || it.outSec !== undefined) {
      const o = startOf(it.out, it.outSec, beats);
      // leaving never happens at the scene end: the last frame keeps what is on screen
      leave = o < dur - OUT ? progress(T >= Number.MAX_SAFE_INTEGER ? dur : T, o, OUT) : 0;
    }
    const kind = it.kind ?? 'pop';
    const base = { opacity: (kind === 'static' ? 1 : clamp01(p * 2.2)) * (1 - leave), scale: 1, dx: 0, dy: 0, rot: it.rot ?? 0 };
    if (kind === 'pop') base.scale = 0.7 + 0.3 * e + 0.06 * Math.sin(Math.PI * p);
    if (kind === 'slide') base.dy = (1 - e) * 120;
    if (kind === 'stamp') base.scale = 1 + 0.9 * (1 - e);
    if (kind === 'shake' && T < 1e6) {
      const k = clamp01(1 - (T - s - IN) / 1.2) * (T > s + IN ? 1 : 0);
      base.dx = Math.sin(T * 40) * 7 * k;
    }
    if (!Number.isFinite(base.dx)) base.dx = 0;
    return base;
  });
  const drift = props.drift ?? 0.04;
  const z = Number.isFinite(dur) && dur > 0 ? clamp01((T >= Number.MAX_SAFE_INTEGER ? dur : Math.max(0, T)) / dur) : 1;
  return { zoom: 1 + drift * z, items };
};
