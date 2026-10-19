import React from 'react';
import { C, alpha } from '../brand.ts';
import { Stage, stageOf } from './Stage.tsx';
import type { AnimProps } from './types.ts';
import type { VortexProps } from './VortexCore.state.ts';
import { DOTS, cloudAt, dotSettle, frameState, rnd } from './SwarmToVortex.state.ts';
import { cameraOf } from './VortexCore.tsx';
import { THREADS, VortexThreads, projectThread } from './vortexDraw.tsx';
import { SWARM_LABEL } from './labels.tsx';

const ALL = [...THREADS.swirl, ...THREADS.axial];

export const SwarmToVortex: React.FC<AnimProps & VortexProps> = ({ t, beats, dur, vertical, clock, knots }) => {
  const s = frameState({ mode: 'swarm', clock, knots }, t, beats, dur);
  const { w, h } = stageOf(vertical);
  const v = s.vortex;
  const cam = cameraOf(v, w, h);
  const p = v.params;
  const projected = ALL.map((th) => projectThread(th, cam, p.coil));
  const dots = Array.from({ length: DOTS }, (_, i) => {
    const c = cloudAt(i, s.drift, w, h);
    const k = dotSettle(i, s.settle);
    const pts = projected[i % projected.length];
    if (k <= 0 || pts.length < 2) return { ...c, k: 0 };
    const f = (rnd(i, 5) + v.flow * 0.6) % 1;
    const q = pts[Math.floor(f * (pts.length - 1))];
    return { x: c.x + (q.x - c.x) * k, y: c.y + (q.y - c.y) * k, k };
  });
  const slot = Math.floor(s.drift * 7);
  const links: [number, number][] = [];
  if (s.links.opacity > 0) {
    for (let i = 0; i < DOTS - 1 && links.length < 60; i += 7) {
      if (rnd(i, slot) > 0.12) continue;
      const j = (i + 1 + Math.floor(rnd(i, slot + 9) * 40)) % DOTS;
      if (Math.hypot(dots[i].x - dots[j].x, dots[i].y - dots[j].y) < 170) links.push([i, j]);
    }
  }
  return (
    <Stage vertical={vertical} fill>
      <svg width={w} height={h} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <VortexThreads cam={cam} coil={p.coil} glow={p.glow} axial={p.axial} flow={null} opacity={s.threads.opacity} guides={s.threads.opacity} idPrefix="sw" />
        <g stroke={C.accentText} strokeWidth={2} strokeOpacity={0.55 * s.links.opacity}>
          {links.map(([i, j]) => (
            <line key={`${i}-${j}`} x1={dots[i].x} y1={dots[i].y} x2={dots[j].x} y2={dots[j].y} />
          ))}
        </g>
        <g>
          {dots.map((d, i) => (
            <circle
              key={i}
              cx={d.x}
              cy={d.y}
              r={3.4 - 1.2 * d.k}
              fill={i % 5 === 0 ? C.accent2 : i % 3 === 0 ? C.text : C.accentText}
              fillOpacity={(0.55 + 0.45 * Math.abs(Math.sin(s.drift * 3 + i))) * (1 - 0.45 * d.k * s.threads.opacity)}
            />
          ))}
        </g>
      </svg>
      <div style={{ position: 'absolute', left: 0, width: w, top: 8, display: 'flex', justifyContent: 'center', opacity: s.label.opacity }}>
        <div style={{ padding: '12px 30px', borderRadius: 20, background: alpha(C.bg0, 0.8), border: `2px solid ${alpha(C.accent, 0.55)}`, fontSize: 56, fontWeight: 800, color: C.text }}>
          {SWARM_LABEL}
        </div>
      </div>
    </Stage>
  );
};
