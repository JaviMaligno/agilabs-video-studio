import React from 'react';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import { tx } from '../types.ts';
import type { AnimProps } from './types.ts';
import { frameState, ARC_H, ROBOT3_R, START3, STAR3, TORUS, Z0, type TorusProps } from './TorusStage.state.ts';
import { basis, project, segments, shade, torusQuads, type Cam, type V3 } from './torus3d.ts';
import { stageOf } from './Stage.tsx';
import { MeterHud, ModelChip } from './Meter.tsx';
import { starPath } from './ReachMap.tsx';
import { RING } from './ReachMap.state.ts';

export { frameState };
export type { TorusProps };

const LIGHT: V3 = [-0.35, -0.55, 0.85];

type Item = { d: number; el: React.ReactNode };

/** The 3D beat: a solid torus between robot and star; the route threads its hole, then hits its tube. */
export const TorusStage: React.FC<AnimProps & TorusProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const st = stageOf(p.vertical);
  const meterH = 196;
  const chipH = 92;
  const mapTop = st.top + meterH;
  const mapH = st.h - meterH - chipH;
  const cam: Cam = { el: s.el, az: s.az, dist: 18.5, target: [-0.5, 0, Z0 * 0.72], f: 1180, cx: 540, cy: mapTop + mapH / 2 + 95 };
  const b = basis(cam);
  const P = (q: V3) => project(cam, b, q);
  const items: Item[] = [];

  // Torus mesh.
  if (s.torus.opacity > 0) {
    const tor = { c: s.torus.c, R: TORUS.R * s.torus.scale, r: TORUS.r * s.torus.scale };
    torusQuads(tor, cam, b, LIGHT).forEach((q, i) => {
      const fill = shade(C.accent, C.rose, s.tint, 0.28 + 0.8 * q.light, 0.4 * q.spec);
      items.push({
        d: q.d,
        el: <polygon key={`q${i}`} points={q.pts.map((pt) => `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(' ')} fill={fill} stroke={fill} strokeWidth={0.8} opacity={s.torus.opacity} />,
      });
    });
  }

  // The straight route (what the blind planner drives), dashed.
  const routePts: V3[] = Array.from({ length: 61 }, (_, i) => [START3[0] + ((STAR3[0] - START3[0]) * i) / 60, 0, Z0]);
  segments(cam, b, routePts).forEach((sg, i) => {
    if (i % 2) return;
    items.push({ d: sg.d, el: <line key={`r${i}`} x1={sg.x1} y1={sg.y1} x2={sg.x2} y2={sg.y2} stroke={alpha(C.text, 0.55)} strokeWidth={5} strokeLinecap="round" /> });
  });

  // The contact-free way around, over the top.
  if (s.arc > 0) {
    const n = 72;
    const m = Math.max(1, Math.round(n * s.arc));
    const arcPts: V3[] = Array.from({ length: m + 1 }, (_, i) => {
      const u = i / n;
      return [START3[0] + (STAR3[0] - START3[0]) * u, 0, Z0 + ARC_H * Math.sin(Math.PI * u)];
    });
    const wdt = 6 + 5 * Math.sin(Math.PI * s.arcPulse);
    segments(cam, b, arcPts).forEach((sg, i) => {
      if (i % 2) return;
      items.push({
        d: sg.d,
        el: (
          <line key={`a${i}`} x1={sg.x1} y1={sg.y1} x2={sg.x2} y2={sg.y2} stroke={C.cyan} strokeWidth={wdt} strokeLinecap="round" style={{ filter: s.arcPulse > 0 && s.arcPulse < 1 ? `drop-shadow(0 0 10px ${C.cyan})` : undefined }} />
        ),
      });
    });
  }

  // Star (billboard).
  {
    const q = P(STAR3);
    const k = cam.f / q.d;
    items.push({
      d: q.d,
      el: (
        <g key="star" transform={`translate(${q.x} ${q.y}) scale(${k})`}>
          <circle r={0.9} fill={alpha(C.gold, 0.2)} />
          <path d={starPath(0.62)} fill={C.gold} />
        </g>
      ),
    });
  }

  // Robot (billboard) and its trail.
  if (s.robot.opacity > 0) {
    const q = P([s.robot.x, s.robot.y, s.robot.z]);
    const k = cam.f / q.d;
    if (s.robot.trail) {
      // Depth-sorted per segment, so the near half of the tube hides the trail where it threads the hole.
      const end: V3 = [s.robot.x, s.robot.y, s.robot.z];
      const n = 40;
      const trailPts: V3[] = Array.from({ length: n + 1 }, (_, i) => [
        START3[0] + ((end[0] - START3[0]) * i) / n,
        START3[1] + ((end[1] - START3[1]) * i) / n,
        START3[2] + ((end[2] - START3[2]) * i) / n,
      ]);
      segments(cam, b, trailPts).forEach((sg, i) => {
        items.push({ d: sg.d + 0.02, el: <line key={`tr${i}`} x1={sg.x1} y1={sg.y1} x2={sg.x2} y2={sg.y2} stroke={alpha(C.text, 0.35 * s.robot.opacity)} strokeWidth={8} strokeLinecap="butt" /> });
      });
    }
    items.push({
      d: q.d - 0.01,
      el: (
        <g key="robot" opacity={s.robot.opacity} transform={`translate(${q.x} ${q.y}) scale(${k})`}>
          <circle r={ROBOT3_R * 2.1} fill={alpha(C.text, 0.18)} />
          <circle r={ROBOT3_R} fill={C.text} />
        </g>
      ),
    });
  }
  s.sparks.forEach((sp, i) => {
    if (!(sp.pop > 0 && sp.pop < 1)) return;
    const q = P([sp.x, sp.y, sp.z]);
    const k = cam.f / q.d;
    const len = (0.3 + 0.7 * sp.pop) * k;
    items.push({
      d: q.d - 0.5,
      el: (
        <g key={`s${i}`} opacity={1 - sp.pop}>
          <circle cx={q.x} cy={q.y} r={0.35 * k * (1 + sp.pop)} fill={alpha(C.gold, 0.5)} />
          {Array.from({ length: 8 }, (_, j) => {
            const a = (j * Math.PI) / 4 + 0.3;
            return <line key={j} x1={q.x + Math.cos(a) * 0.2 * k} y1={q.y + Math.sin(a) * 0.2 * k} x2={q.x + Math.cos(a) * len} y2={q.y + Math.sin(a) * len} stroke={C.gold} strokeWidth={0.1 * k} strokeLinecap="round" />;
          })}
        </g>
      ),
    });
  });

  items.sort((x, y) => y.d - x.d);

  // Floor: grid in perspective, the fading 2D ring, soft shadows under the torus and the robot.
  const grid: React.ReactNode[] = [];
  for (let gx = -12; gx <= 10; gx += 2) {
    const a = P([gx, -9, 0]);
    const z = P([gx, 9, 0]);
    grid.push(<line key={`gx${gx}`} x1={a.x} y1={a.y} x2={z.x} y2={z.y} stroke={alpha(C.muted, 0.13)} strokeWidth={2} />);
  }
  for (let gy = -9; gy <= 9; gy += 2) {
    const a = P([-12, gy, 0]);
    const z = P([10, gy, 0]);
    grid.push(<line key={`gy${gy}`} x1={a.x} y1={a.y} x2={z.x} y2={z.y} stroke={alpha(C.muted, 0.13)} strokeWidth={2} />);
  }
  const loop = (r: number, cx: number, cy: number, z: number, rx = r, n = 48) =>
    Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      const q = P([cx + rx * Math.cos(a), cy + r * Math.sin(a), z]);
      return `${q.x.toFixed(1)},${q.y.toFixed(1)}`;
    }).join(' ');
  const shadowR = (TORUS.R + TORUS.r) * s.torus.scale;

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', left: 0, top: 0 }}>
        <defs>
          <clipPath id="torus-stage">
            <rect x={0} y={mapTop} width={1080} height={mapH} />
          </clipPath>
          <filter id="torus-soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={14} />
          </filter>
        </defs>
        <g clipPath="url(#torus-stage)">
          {grid}
          {s.ringFade > 0 && (
            <g opacity={s.ringFade}>
              <polygon points={loop(RING.outer, 0, 0, 0)} fill={alpha(C.rose, 0.8)} />
              <polygon points={loop(RING.inner, 0, 0, 0)} fill={C.bg0} />
            </g>
          )}
          {s.torus.opacity > 0 && <polygon points={loop(shadowR, s.torus.c[0], s.torus.c[1], 0, TORUS.r * s.torus.scale + 0.4)} fill={alpha('#000000', 0.55 * s.torus.opacity)} filter="url(#torus-soft)" />}
          {s.robot.opacity > 0 && <polygon points={loop(0.4, s.robot.x, s.robot.y, 0, 0.4, 16)} fill={alpha('#000000', 0.5 * s.robot.opacity)} filter="url(#torus-soft)" />}
          {items.map((it) => it.el)}
        </g>
      </svg>

      {/* Pose labels. */}
      {[
        { text: 'through the hole', o: s.labels.thread, color: C.accentText },
        { text: 'into the tube', o: s.labels.tube, color: C.roseText },
      ].map((l) =>
        l.o > 0 ? (
          <div key={l.text} style={{ position: 'absolute', left: 0, right: 0, top: mapTop + 16, display: 'flex', justifyContent: 'center', opacity: l.o }}>
            <div style={{ padding: '10px 28px', borderRadius: 999, background: alpha(C.card, 0.92), border: `3px solid ${l.color}`, color: l.color, fontFamily, fontSize: 44, fontWeight: 800, whiteSpace: 'nowrap' }}>
              {l.text}
            </div>
          </div>
        ) : null,
      )}

      <MeterHud s={s.meter} top={st.top + 4} />
      {p.chip && <ModelChip text={tx(p.chip, p.lang)} top={st.top + st.h - chipH + 10} opacity={s.chip.opacity} slide={0} />}
    </div>
  );
};
