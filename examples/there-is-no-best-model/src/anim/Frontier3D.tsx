import React from 'react';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import {
  RANGE,
  frameState,
  project,
  staircase,
  toWorld,
  type Camera,
  type FrontierProps,
  type FrontierState,
} from './Frontier3D.state.ts';
import { stageOf } from './Stage.tsx';

export { frameState };
export type { FrontierProps };

// The video's chart colours: teal = survives, slate = dominated, rose = fails the gate.
const TEAL = '#2dd4bf';
const SLATE = '#64748b';
const ROSE = '#fb7185';
const W = 936;
const H = 1000;
const CX = 468;
const CY = 470;

const mixHex = (a: string, b: string, p: number) => {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const q = Math.min(1, Math.max(0, p));
  const ch = (s: number) => Math.round(((pa >> s) & 255) * (1 - q) + ((pb >> s) & 255) * q);
  return `#${((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, '0')}`;
};

type V3 = [number, number, number];
const P = (v: V3, cam: Camera) => project(v, cam, CX, CY);
const line = (a: V3, b: V3, cam: Camera) => {
  const p = P(a, cam);
  const q = P(b, cam);
  return { x1: p.x, y1: p.y, x2: q.x, y2: q.y };
};

const GRID = [-0.5, 0, 0.5];

const Scene: React.FC<{ s: FrontierState }> = ({ s }) => {
  const cam = s.camera;
  const walls = 1 - s.tilt;
  const yf = toWorld(0, RANGE.latency[0], s.floor)[1];
  // Box edges: floor square, top square, verticals. Edges that collapse in the top view fade out.
  const floorSq: V3[] = [[-1, -1, -1], [1, -1, -1], [1, -1, 1], [-1, -1, 1]];
  const topSq: V3[] = floorSq.map(([x, , z]) => [x, 1, z]);
  const edges: { a: V3; b: V3; o: number }[] = [
    ...floorSq.map((a, i) => ({ a, b: floorSq[(i + 1) % 4], o: 0.5 })),
    ...topSq.map((a, i) => ({ a, b: topSq[(i + 1) % 4], o: 0.28 * walls })),
    ...floorSq.map((a, i) => ({ a, b: topSq[i], o: 0.28 * walls })),
  ];
  // Faint grid on the floor and the two back walls (x = +1, z = +1 for the yaws used here).
  const grid: { a: V3; b: V3; o: number }[] = [];
  for (const g of GRID) {
    grid.push({ a: [g, -1, -1], b: [g, -1, 1], o: 0.14 }, { a: [-1, -1, g], b: [1, -1, g], o: 0.14 });
    grid.push({ a: [-1, g, 1], b: [1, g, 1], o: 0.12 * walls }, { a: [g, -1, 1], b: [g, 1, 1], o: 0.12 * walls });
    grid.push({ a: [1, g, -1], b: [1, g, 1], o: 0.12 * walls }, { a: [1, -1, g], b: [1, 1, g], o: 0.12 * walls });
  }
  // Axes, drawn brighter with arrowheads: cost and latency from the cheap-and-fast corner, quality
  // up the leftmost (back) vertical edge so it stays clear of the cloud.
  const O: V3 = [-1, -1, -1];
  const axes: { from: V3; to: V3; label: string; o: number }[] = [
    { from: O, to: [1, -1, -1], label: 'cost', o: 1 },
    { from: O, to: [-1, -1, 1], label: 'latency', o: 1 },
    { from: [-1, -1, 1], to: [-1, 1, 1], label: 'quality', o: walls },
  ];
  const centre = P([0, -0.4, 0], cam);

  const pts = s.points
    .map((p) => {
      const world: V3 = [p.world[0], p.world[1] - 0.55 * p.drop, p.world[2]];
      return { ...p, pr: P(world, cam), base: P([world[0], -1, world[2]], cam) };
    })
    .sort((a, b) => b.pr.depth - a.pr.depth);

  const plane: V3[] = floorSq.map(([x, , z]) => [x, yf, z]);
  const planePts = plane.map((v) => P(v, cam)).map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const planeLabel = P([1, yf, -1], cam);

  const stair = staircase().map(([c, l]) => P(toWorld(c, l, RANGE.quality[0]), cam));
  const stairD = stair.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const stairLen = stair.reduce((acc, p, i) => (i ? acc + Math.hypot(p.x - stair[i - 1].x, p.y - stair[i - 1].y) : 0), 0);
  // Dominated region in the top view: everything above and right of the staircase.
  const corner = P([1, -1, 1], cam);
  const regionD = stair.length ? `${stairD} L${corner.x.toFixed(1)},${corner.y.toFixed(1)} Z` : '';

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', fontFamily }}>
      <defs>
        <marker id="f3d-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill={alpha(C.text, 0.85)} />
        </marker>
      </defs>
      {grid.map((g, i) => (g.o > 0.005 ? <line key={`g${i}`} {...line(g.a, g.b, cam)} stroke={alpha(C.text, g.o)} strokeWidth={2} /> : null))}
      {edges.map((e, i) => (e.o > 0.005 ? <line key={`e${i}`} {...line(e.a, e.b, cam)} stroke={alpha(C.muted, e.o)} strokeWidth={2.5} /> : null))}
      {axes.map((a) =>
        a.o > 0.01 ? <line key={a.label} {...line(a.from, a.to, cam)} stroke={alpha(C.text, 0.85 * a.o)} strokeWidth={4} markerEnd="url(#f3d-arrow)" /> : null,
      )}

      {/* The dominated region and the staircase, once the camera looks straight down. */}
      {s.draw > 0 && regionD ? <path d={regionD} fill={alpha(SLATE, 0.18 * s.draw)} /> : null}

      {/* Stems to the floor, under everything else. */}
      {pts.map((p) =>
        p.appear > 0 ? (
          <line key={`s${p.name}`} x1={p.pr.x} y1={p.pr.y} x2={p.base.x} y2={p.base.y} stroke={alpha(C.muted, 0.35 * p.appear * (1 - p.drop) * walls)} strokeWidth={2} strokeDasharray="4 5" />
        ) : null,
      )}
      {pts.map((p) =>
        p.appear > 0 ? <circle key={`b${p.name}`} cx={p.base.x} cy={p.base.y} r={4 * p.base.scale} fill={alpha(C.muted, 0.35 * p.appear * (1 - p.drop) * walls)} /> : null,
      )}

      {/* Points below the floor plane, then the plane, then the rest (each group back to front). */}
      {pts.filter((p) => p.world[1] < yf - 1e-6 && s.opacity > 0).map((p) => <Dot key={p.name} p={p} />)}
      {s.opacity > 0.005 ? (
        <>
          <polygon points={planePts} fill={alpha(ROSE, 0.22 * s.opacity)} stroke={alpha(ROSE, 0.85 * s.opacity)} strokeWidth={3} />
          <text x={planeLabel.x - 12} y={planeLabel.y + 46} fontSize={38} fontWeight={800} textAnchor="end" fill={alpha(ROSE, s.opacity)}>
            ≥ 80%
          </text>
        </>
      ) : null}
      {/* Points above the floor stand on it: a solid drop-line to the plane and a foot mark there. */}
      {s.opacity > 0.005
        ? pts
            .filter((p) => p.world[1] >= yf - 1e-6 && p.appear > 0)
            .map((p) => {
              const foot = P([p.world[0], yf, p.world[2]], cam);
              return (
                <g key={`f${p.name}`} opacity={s.opacity}>
                  <ellipse cx={foot.x} cy={foot.y} rx={16 * foot.scale} ry={6 * foot.scale} fill={alpha(C.bg0, 0.55)} stroke={alpha(ROSE, 0.9)} strokeWidth={2.5} />
                  <line x1={p.pr.x} y1={p.pr.y} x2={foot.x} y2={foot.y} stroke={alpha(C.text, 0.85)} strokeWidth={3.5} />
                </g>
              );
            })
        : null}
      {pts.filter((p) => !(p.world[1] < yf - 1e-6 && s.opacity > 0)).map((p) => <Dot key={p.name} p={p} />)}
      {/* Top view: the cheap-and-fast corner is where the better options sit. */}
      {s.draw > 0 ? (
        <text x={P([-1, -1, -1], cam).x + 18} y={P([-1, -1, -1], cam).y - 18} fontSize={34} fontWeight={800} fill={alpha('#5eead4', s.draw)}>
          ↙ better
        </text>
      ) : null}

      {s.draw > 0 ? (
        <path d={stairD} fill="none" stroke={TEAL} strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={`${stairLen} ${stairLen}`} strokeDashoffset={stairLen * (1 - s.draw)} style={{ filter: `drop-shadow(0 0 10px ${alpha(TEAL, 0.6)})` }} />
      ) : null}

      {axes.map((a) => {
        if (a.o < 0.01) return null;
        const mid = P([(a.from[0] + a.to[0]) / 2, (a.from[1] + a.to[1]) / 2, (a.from[2] + a.to[2]) / 2], cam);
        const po = P(a.from, cam);
        // Push the label away from the box centre, perpendicular to its axis on screen.
        const end = P(a.to, cam);
        let nx = -(end.y - po.y);
        let ny = end.x - po.x;
        const len = Math.hypot(nx, ny) || 1;
        nx /= len;
        ny /= len;
        if ((mid.x - centre.x) * nx + (mid.y - centre.y) * ny < 0) {
          nx = -nx;
          ny = -ny;
        }
        const off = 46;
        const x = mid.x + nx * off;
        const y = mid.y + ny * off;
        let ang = (Math.atan2(end.y - po.y, end.x - po.x) * 180) / Math.PI;
        if (ang > 90) ang -= 180;
        if (ang < -90) ang += 180;
        return (
          <text key={`l${a.label}`} x={x} y={y} fontSize={42} fontWeight={800} fill={alpha(C.text, a.o)} textAnchor="middle" dominantBaseline="middle" transform={`rotate(${ang.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})`}>
            {a.label}
          </text>
        );
      })}
    </svg>
  );
};

type DrawnPoint = FrontierState['points'][number] & { pr: { x: number; y: number; scale: number } };

const Dot: React.FC<{ p: DrawnPoint }> = ({ p }) => {
  if (p.appear <= 0) return null;
  const fade = 1 - p.drop;
  if (fade <= 0.01) return null;
  const r = 19 * p.pr.scale ** 0.8 * (0.4 + 0.6 * p.appear);
  const fill = p.red > 0 ? mixHex(mixHex(SLATE, TEAL, p.teal), ROSE, p.red) : mixHex(SLATE, TEAL, p.teal);
  const glow = Math.max(p.teal, p.red);
  const k = r * 0.9;
  return (
    <g opacity={p.appear * fade}>
      {glow > 0.05 ? <circle cx={p.pr.x} cy={p.pr.y} r={r * 1.7} fill={alpha(p.red > 0.5 ? ROSE : TEAL, 0.22 * glow)} /> : null}
      <circle cx={p.pr.x} cy={p.pr.y} r={r} fill={fill} stroke={alpha(C.text, 0.75)} strokeWidth={2.5} />
      {p.red > 0.01 ? (
        <g stroke={C.text} strokeWidth={5} strokeLinecap="round" opacity={p.red}>
          <line x1={p.pr.x - k * 0.55} y1={p.pr.y - k * 0.55} x2={p.pr.x + k * 0.55} y2={p.pr.y + k * 0.55} />
          <line x1={p.pr.x + k * 0.55} y1={p.pr.y - k * 0.55} x2={p.pr.x - k * 0.55} y2={p.pr.y + k * 0.55} />
        </g>
      ) : null}
    </g>
  );
};

export const Frontier3D: React.FC<AnimProps & FrontierProps> = ({ t, beats, dur, vertical, mode, at }) => {
  const s = frameState({ mode, at }, t, beats, dur);
  const st = stageOf(vertical);
  // Drawn on a 936x1000 board, scaled to the stage.
  const k = Math.min(st.w / W, st.h / H);
  return (
    <div style={{ position: 'absolute', top: st.top, left: st.side, width: st.w, height: st.h, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: (st.w - W * k) / 2, top: (st.h - H * k) / 2, width: W, height: H, transform: `scale(${k})`, transformOrigin: '0 0' }}>
        <Scene s={s} />
      </div>
    </div>
  );
};
