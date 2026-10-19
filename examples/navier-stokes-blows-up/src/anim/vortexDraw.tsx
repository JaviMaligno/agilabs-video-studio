// SVG drawing of the vortex threads, shared by VortexCore, SwarmToVortex and ContinuumBreak.
import React from 'react';
import threadsJson from '../data/threads.json';
import { C, alpha } from '../brand.ts';
import { project, threadPoint, type Camera, type P3, type Threads } from './vortex.ts';

export const THREADS = threadsJson as unknown as Threads;

/** Axial threads are cut at this height (outer radius = 1), so the core stays on the stage. */
export const ZCAP = 1.32;
const CHUNKS = 7;

type Opts = {
  cam: Camera;
  coil: number;
  glow: number;
  axial: number;
  /** 0..1: threads turn into a dashed, muted ghost. */
  dashed?: number;
  /** Flow phase 0..1 for the tracer dots; null = no tracers. */
  flow?: number | null;
  /** Multiplies every opacity (scene fades). */
  opacity?: number;
  /** Draw the axis and the dividing plane. */
  guides?: number;
  idPrefix: string;
};

/** Projected thread, cut where it leaves the stage. */
export function projectThread(thread: P3[], cam: Camera, coil: number, zcap = ZCAP) {
  const out: { x: number; y: number; depth: number }[] = [];
  for (let i = 0; i < thread.length; i++) {
    if (Math.abs(thread[i][2]) > zcap) break;
    out.push(project(threadPoint(thread, i, coil), cam));
  }
  return out;
}

const pathOf = (pts: { x: number; y: number }[]) =>
  pts.length < 2 ? '' : 'M' + pts.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join('L');

function Family({ list, color, width, base, o }: { list: P3[][]; color: string; width: number; base: number; o: Opts }) {
  const dashed = o.dashed ?? 0;
  const op = (o.opacity ?? 1) * o.glow * base;
  if (op <= 0.003) return null;
  const nodes: React.ReactNode[] = [];
  list.forEach((thread, ti) => {
    const pts = projectThread(thread, o.cam, o.coil);
    if (pts.length < 2) return;
    const step = Math.max(2, Math.ceil(pts.length / CHUNKS));
    for (let a = 0; a < pts.length - 1; a += step) {
      const seg = pts.slice(a, Math.min(pts.length, a + step + 1));
      const depth = seg.reduce((s, p) => s + p.depth, 0) / seg.length;
      // Front of the vortex brighter, back dimmer.
      const shade = 0.55 + 0.45 * Math.max(-1, Math.min(1, depth * 1.4));
      const d = pathOf(seg);
      if (dashed < 1) {
        nodes.push(<path key={`${ti}-${a}`} d={d} stroke={color} strokeWidth={width} strokeOpacity={op * shade * (1 - dashed)} fill="none" strokeLinecap="round" />);
      }
      if (dashed > 0) {
        nodes.push(
          <path key={`${ti}-${a}-d`} d={d} stroke={C.muted} strokeWidth={width * 0.85} strokeOpacity={op * shade * 0.75 * dashed} fill="none" strokeDasharray="7 11" strokeLinecap="round" />,
        );
      }
    }
    if (o.flow !== null && o.flow !== undefined && dashed < 1) {
      for (const k of [0, 0.5]) {
        const f = (o.flow + k + ti * 0.137) % 1;
        const p = pts[Math.min(pts.length - 1, Math.floor(f * (pts.length - 1)))];
        nodes.push(<circle key={`${ti}-t${k}`} cx={p.x} cy={p.y} r={width * 1.9} fill={C.text} fillOpacity={op * 0.85 * (1 - dashed)} />);
      }
    }
  });
  return <g>{nodes}</g>;
}

/** The vortex: indigo threads spiralling in, violet threads leaving along the axis. */
export const VortexThreads: React.FC<Opts> = (o) => {
  const guides = (o.guides ?? 1) * (o.opacity ?? 1);
  const lr = Math.sqrt(Math.max(1e-4, o.cam.tau));
  const ring = Array.from({ length: 73 }, (_, i) => project([1.06 * Math.cos((i / 72) * 2 * Math.PI), 1.06 * Math.sin((i / 72) * 2 * Math.PI), 0], o.cam));
  const top = project([0, 0, ZCAP], o.cam);
  const bottom = project([0, 0, -ZCAP], o.cam);
  void lr;
  return (
    <g>
      <defs>
        <filter id={`${o.idPrefix}-glow`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>
      {guides > 0 && (
        <g>
          <line x1={top.x} y1={top.y} x2={bottom.x} y2={bottom.y} stroke={C.muted} strokeOpacity={0.4 * guides} strokeWidth={2} strokeDasharray="4 8" />
          <path d={pathOf(ring)} stroke={C.muted} strokeOpacity={0.3 * guides} strokeWidth={2} fill="none" />
        </g>
      )}
      {/* Soft glow under the lines. */}
      <g filter={`url(#${o.idPrefix}-glow)`} opacity={0.6}>
        <Family list={THREADS.swirl} color={C.accent} width={5} base={0.8} o={{ ...o, flow: null }} />
        <Family list={THREADS.axial} color={C.accent2} width={5} base={0.8 * o.axial} o={{ ...o, flow: null }} />
      </g>
      <Family list={THREADS.swirl} color={C.accentText} width={2.6} base={1} o={o} />
      <Family list={THREADS.axial} color={C.accent2} width={2.4} base={o.axial} o={o} />
    </g>
  );
};

/** Concentric oscillating pulses converging on the core: the smooth push. */
export const Pulses: React.FC<{ cam: Camera; opacity: number; phase: number; id: string }> = ({ cam, opacity, phase, id }) => {
  if (opacity <= 0.003) return null;
  const rings = [0, 0.25, 0.5, 0.75].map((k) => {
    const f = (phase * 0.45 + k) % 1;
    const r = 1.42 - 0.95 * f;
    const pts = Array.from({ length: 97 }, (_, i) => {
      const a = (i / 96) * 2 * Math.PI;
      const rr = r * (1 + 0.05 * Math.sin(8 * a + phase * 5));
      return project([rr * Math.cos(a), rr * Math.sin(a), 0], { ...cam, angle: 0, tau: 1 });
    });
    const o = opacity * Math.sin(Math.PI * f) * 0.6;
    return { d: pathOf(pts), o, k };
  });
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-pg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={C.accent} />
          <stop offset="1" stopColor={C.accent2} />
        </linearGradient>
      </defs>
      {rings.map((r) => (
        <path key={r.k} d={r.d} stroke={`url(#${id}-pg)`} strokeWidth={5} strokeOpacity={r.o} fill="none" style={{ filter: `drop-shadow(0 0 10px ${alpha(C.accent, 0.8)})` }} />
      ))}
    </g>
  );
};
