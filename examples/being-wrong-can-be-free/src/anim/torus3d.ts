// Pseudo-3D for the TorusStage scene, no WebGL: a perspective camera, a solid torus sampled as a
// mesh of quads, painter-sorted and shaded by a fixed light. Pure numbers, no Remotion or React.

export type V3 = [number, number, number];

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
export const dot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const norm = (a: V3): V3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};

/** Orbit camera around `target`: elevation and azimuth in radians, `f` focal length in px. */
export type Cam = { el: number; az: number; dist: number; target: V3; f: number; cx: number; cy: number };

export type Basis = { pos: V3; fwd: V3; right: V3; up: V3 };

export function basis(c: Cam): Basis {
  const el = Math.min(Math.PI / 2 - 1e-3, Math.max(-Math.PI / 2 + 1e-3, c.el));
  const dir: V3 = [Math.cos(el) * Math.cos(c.az), Math.cos(el) * Math.sin(c.az), Math.sin(el)];
  const pos = add(c.target, mul(dir, c.dist));
  const fwd = norm(sub(c.target, pos));
  const right = norm(cross(fwd, [0, 0, 1]));
  const up = cross(right, fwd);
  return { pos, fwd, right, up };
}

/** Screen position (px) and depth along the view axis of a world point. */
export function project(c: Cam, b: Basis, p: V3): { x: number; y: number; d: number } {
  const r = sub(p, b.pos);
  const d = Math.max(0.05, dot(r, b.fwd));
  return { x: c.cx + (c.f * dot(r, b.right)) / d, y: c.cy - (c.f * dot(r, b.up)) / d, d };
}

/** A torus whose axis runs along x (the route), centred at `c`: major radius R, tube radius r. */
export type Torus = { c: V3; R: number; r: number };

export const torusPoint = (t: Torus, u: number, v: number): V3 => {
  const k = t.R + t.r * Math.cos(v);
  return [t.c[0] + t.r * Math.sin(v), t.c[1] + k * Math.cos(u), t.c[2] + k * Math.sin(u)];
};
export const torusNormal = (u: number, v: number): V3 => [Math.sin(v), Math.cos(v) * Math.cos(u), Math.cos(v) * Math.sin(u)];

export type Quad = { pts: { x: number; y: number }[]; d: number; light: number; spec: number };

/** Visible quads of the torus mesh, with Lambert light and a specular term, unsorted. */
export function torusQuads(t: Torus, c: Cam, b: Basis, light: V3, nu = 48, nv = 20): Quad[] {
  const L = norm(light);
  const out: Quad[] = [];
  for (let i = 0; i < nu; i++) {
    for (let j = 0; j < nv; j++) {
      const u0 = (i / nu) * Math.PI * 2;
      const u1 = ((i + 1) / nu) * Math.PI * 2;
      const v0 = (j / nv) * Math.PI * 2;
      const v1 = ((j + 1) / nv) * Math.PI * 2;
      const um = (u0 + u1) / 2;
      const vm = (v0 + v1) / 2;
      const mid = torusPoint(t, um, vm);
      const n = torusNormal(um, vm);
      const toCam = norm(sub(b.pos, mid));
      if (dot(n, toCam) < -0.05) continue;
      const corners = [torusPoint(t, u0, v0), torusPoint(t, u1, v0), torusPoint(t, u1, v1), torusPoint(t, u0, v1)];
      const pts = corners.map((q) => {
        const s = project(c, b, q);
        return { x: s.x, y: s.y };
      });
      const lam = Math.max(0, dot(n, L));
      const h = norm(add(L, toCam));
      const spec = Math.max(0, dot(n, h)) ** 28;
      out.push({ pts, d: project(c, b, mid).d, light: lam, spec });
    }
  }
  return out;
}

/** Points of a polyline in 3D, projected, with the depth of each segment's midpoint. */
export function segments(c: Cam, b: Basis, pts: V3[]): { x1: number; y1: number; x2: number; y2: number; d: number }[] {
  const out: { x1: number; y1: number; x2: number; y2: number; d: number }[] = [];
  for (let i = 1; i < pts.length; i++) {
    const a = project(c, b, pts[i - 1]);
    const z = project(c, b, pts[i]);
    const m = project(c, b, mul(add(pts[i - 1], pts[i]), 0.5));
    out.push({ x1: a.x, y1: a.y, x2: z.x, y2: z.y, d: m.d });
  }
  return out;
}

/** Mix two `#rrggbb` colours and scale the result by `k` (shading), as `rgb()`. */
export function shade(hexA: string, hexB: string, mix: number, k: number, spec = 0): string {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const a = p(hexA);
  const z = p(hexB);
  const m = Math.min(1, Math.max(0, mix));
  const ch = a.map((v, i) => Math.round(Math.min(255, (v + (z[i] - v) * m) * k + 255 * spec)));
  return `rgb(${ch[0]},${ch[1]},${ch[2]})`;
}
