// Drawing pieces shared by PinnedNote and MemoryWall: the note card, the file tree, threads,
// stamps and small icons. Brand tokens only.
import React from 'react';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import { TREE } from './memory.ts';

export const MONO = "ui-monospace, Menlo, 'SF Mono', monospace";
export const clamp01 = (x: number) => (Number.isFinite(x) ? Math.min(1, Math.max(0, x)) : 0);

const hex = (h: string) => {
  const m = /^rgb\((\d+),(\d+),(\d+)\)$/.exec(h.replace(/\s/g, ''));
  if (m) return [+m[1], +m[2], +m[3]];
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
/** Blend two colours (#rrggbb or rgb(...)), always made from the brand tokens. */
export const mixHex = (a: string, b: string, p: number) => {
  const x = hex(a);
  const y = hex(b);
  const q = clamp01(p);
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * q)).join(',')})`;
};
/** Edge colour of a memory: 0 teal (true), 1 rose (stale). */
export const edgeColour = (edge: number) => mixHex(C.ok, C.flag, edge);
/** Derived greys (mixes of brand tokens, no new colours): a neutral note edge, a light grey. */
export const NEUTRAL = mixHex(C.line, C.muted, 0.18);
export const LIGHT = mixHex(C.muted, C.text, 0.5);
export const RAISED = mixHex(C.card, C.muted, 0.25);

// ---------------------------------------------------------------- note card

export const Pin: React.FC<{ x: number; y: number; s?: number; on?: number }> = ({ x, y, s = 1, on = 1 }) => (
  <div
    style={{
      position: 'absolute',
      left: x - 17 * s,
      top: y - 17 * s,
      width: 34 * s,
      height: 34 * s,
      borderRadius: '50%',
      background: `radial-gradient(circle at 35% 30%, ${C.accentText}, ${C.accent} 60%, ${C.accent2})`,
      boxShadow: `0 ${6 * s}px ${14 * s}px ${alpha(C.bg0, 0.8)}`,
      transform: `scale(${0.4 + 0.6 * clamp01(on)})`,
      opacity: clamp01(on * 3),
    }}
  />
);

/** A paper-ish card: faint ruled lines drawn in code, a coloured edge. */
export const noteSurface = (border: string, width = 5, glow = 0): React.CSSProperties => ({
  background: `repeating-linear-gradient(180deg, transparent 0 46px, ${alpha(C.muted, 0.07)} 46px 48px), ${C.card}`,
  border: `${width}px solid ${border}`,
  borderRadius: 18,
  boxShadow: `0 18px 40px ${alpha(C.bg0, 0.7)}${glow > 0 ? `, 0 0 ${50 * glow}px ${border.startsWith('rgb') ? border.replace('rgb(', 'rgba(').replace(')', `,${0.45 * glow})`) : alpha(border, 0.45 * glow)}` : ''}`,
});

export const Pill: React.FC<{ children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties; filled?: boolean }> = ({
  children,
  color = C.muted,
  size = 30,
  style,
  filled,
}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: size * 0.35,
      padding: `${size * 0.28}px ${size * 0.6}px`,
      borderRadius: size,
      border: `3px solid ${color}`,
      background: filled ? alpha(color.startsWith('#') ? color : C.muted, 0.16) : alpha(C.bg0, 0.85),
      color,
      fontFamily,
      fontWeight: 700,
      fontSize: size,
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    {children}
  </div>
);

/** A rubber stamp: uppercase, rotated, landing from a little larger. */
export const Stamp: React.FC<{ text: string | string[]; color: string; on: number; x: number; y: number; rot?: number; size?: number; style?: React.CSSProperties }> = ({
  text,
  color,
  on,
  x,
  y,
  rot = -5,
  size = 50,
  style,
}) => {
  const p = clamp01(on);
  if (p <= 0) return null;
  const lines = Array.isArray(text) ? text : [text];
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${1.5 - 0.5 * p})`,
        opacity: Math.min(1, p * 1.6),
        border: `${Math.max(4, size * 0.11)}px solid ${color}`,
        borderRadius: 12,
        padding: `${size * 0.16}px ${size * 0.4}px`,
        color,
        background: alpha(C.bg0, 0.88),
        fontFamily,
        fontWeight: 800,
        fontSize: size,
        letterSpacing: size * 0.04,
        lineHeight: 1.1,
        textAlign: 'center',
        whiteSpace: 'nowrap',
        boxShadow: `0 10px 30px ${alpha(C.bg0, 0.7)}`,
        ...style,
      }}
    >
      {lines.map((l) => (
        <div key={l}>{l}</div>
      ))}
    </div>
  );
};

// ---------------------------------------------------------------- icons

export const Tick: React.FC<{ size: number; color: string; draw?: number }> = ({ size, color, draw = 1 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block', flex: 'none', overflow: 'visible' }}>
    <path d="M4 12.5 L9.5 18 L20 6" fill="none" stroke={color} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${clamp01(draw)} 1`} />
  </svg>
);

export const Cross: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block', flex: 'none' }}>
    <path d="M6 6 L18 18 M18 6 L6 18" stroke={color} strokeWidth={3} strokeLinecap="round" />
  </svg>
);

export const Hourglass: React.FC<{ size: number; color: string; flow?: number }> = ({ size, color, flow = 0.5 }) => {
  const f = clamp01(flow);
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block', flex: 'none' }}>
      <path d="M6 3 H18 M6 21 H18" stroke={color} strokeWidth={2.4} strokeLinecap="round" />
      <path d="M7 3 C7 9 11 10 12 12 C13 14 17 15 17 21 H7 C7 15 11 14 12 12 C13 10 17 9 17 3 Z" fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      <path d={`M${9 + 3 * f} ${6 + 4 * f} H${15 - 3 * f} L12 11.5 Z`} fill={color} opacity={0.85} />
      <path d={`M12 ${20 - 4 * f} L${15.5} 20 H8.5 Z`} fill={color} opacity={0.85} />
    </svg>
  );
};

export const Clock: React.FC<{ size: number; color: string; angle: number }> = ({ size, color, angle }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block', flex: 'none' }}>
    <circle cx="12" cy="12" r="9.5" fill="none" stroke={color} strokeWidth={2.2} />
    <path d="M12 12 V7" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
    <path d={`M12 12 L${12 + 6.5 * Math.sin(angle)} ${12 - 6.5 * Math.cos(angle)}`} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </svg>
);

export const Pen: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block', flex: 'none' }}>
    <path d="M4 20 L5 15 L16 4 L20 8 L9 19 Z" fill={alpha(C.bg0, 0.6)} stroke={color} strokeWidth={2} strokeLinejoin="round" />
    <path d="M4 20 L5 15 L9 19 Z" fill={color} />
  </svg>
);

export const FolderIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size * 0.8} viewBox="0 0 30 24" style={{ display: 'block', flex: 'none' }}>
    <path d="M2 5 a2 2 0 0 1 2 -2 H11 L14 6 H26 a2 2 0 0 1 2 2 V20 a2 2 0 0 1 -2 2 H4 a2 2 0 0 1 -2 -2 Z" fill={alpha(C.accent, 0.18)} stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
  </svg>
);

// ---------------------------------------------------------------- threads

/**
 * A thread from (x0, y0) to (x1, y1). Taut: a straight line in the state colour. Slack: the end
 * drops and the line sags, in the muted colour. `draw` grows it from the note.
 */
export const threadPath = (x0: number, y0: number, x1: number, y1: number, slack: number) => {
  const s = clamp01(slack);
  const ex = x1 - 50 * s;
  const ey = y1 + 120 * s;
  const cx = (x0 + ex) / 2 + 20 * s;
  const cy = (y0 + ey) / 2 + 170 * s;
  return { d: `M ${x0} ${y0} Q ${cx} ${cy} ${ex} ${ey}`, ex, ey };
};

export const Thread: React.FC<{ x0: number; y0: number; x1: number; y1: number; draw: number; slack: number; color?: string; width?: number; knot?: boolean }> = ({
  x0,
  y0,
  x1,
  y1,
  draw,
  slack,
  color = C.ok,
  width = 5,
  knot = true,
}) => {
  const d = clamp01(draw);
  if (d <= 0) return null;
  const { d: path, ex, ey } = threadPath(x0, y0, x1, y1, slack);
  const col = mixHex(color, C.muted, clamp01(slack * 1.3));
  return (
    <g>
      <path d={path} fill="none" stroke={col} strokeWidth={width} strokeLinecap="round" pathLength={1} strokeDasharray={`${d} 1`} opacity={1 - 0.35 * clamp01(slack)} />
      {knot && d >= 1 && <circle cx={ex} cy={ey} r={width * 1.6} fill={slack > 0.5 ? C.bg1 : col} stroke={col} strokeWidth={3} />}
    </g>
  );
};

// ---------------------------------------------------------------- file tree

export const ROW_H = 52;
export const TREE_HEADER = 58;

/** Y of each row's centre inside a tree box at `top`, with collapsing rows (h in [0, 1]). */
export const rowCentres = (top: number, hs: number[], rowH = ROW_H) => {
  let y = top + TREE_HEADER;
  return hs.map((h) => {
    const c = y + (rowH * clamp01(h)) / 2;
    y += rowH * clamp01(h);
    return c;
  });
};

export const treeHeight = (hs: number[], rowH = ROW_H) => TREE_HEADER + hs.reduce((a, h) => a + rowH * clamp01(h), 0) + 16;

export type TreeRowView = { opacity: number; h: number; pulse?: number; scan?: number; miss?: number };

export const Tree: React.FC<{
  x: number;
  y: number;
  w: number;
  rows: TreeRowView[];
  font?: number;
  rowH?: number;
  jitter?: number;
  opacity?: number;
  label?: string;
}> = ({ x, y, w, rows, font = 29, rowH = ROW_H, jitter = 0, opacity = 1, label = 'repository' }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: treeHeight(rows.map((r) => r.h), rowH),
      borderRadius: 18,
      background: C.pane,
      border: `3px solid ${C.line}`,
      overflow: 'hidden',
      opacity: clamp01(opacity),
    }}
  >
    <div style={{ height: TREE_HEADER, display: 'flex', alignItems: 'center', paddingLeft: 24, borderBottom: `2px solid ${C.line}`, background: alpha(C.card, 0.8), fontFamily, fontSize: 26, fontWeight: 600, color: C.muted, letterSpacing: 1 }}>
      {label}
    </div>
    {TREE.map((r, i) => {
      const v = rows[i];
      if (!v || v.h <= 0.001) return null;
      const pulse = clamp01(v.pulse ?? 0);
      const scan = clamp01(v.scan ?? 0);
      const miss = clamp01(v.miss ?? 0);
      return (
        <div
          key={r.id}
          style={{
            height: rowH * clamp01(v.h),
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            paddingLeft: 24 + r.depth * 40,
            opacity: clamp01(v.opacity),
            transform: `translateX(${(r.depth > 0 ? 1 : 0) * jitter}px)`,
            background: scan > 0 ? alpha(C.accent, 0.22 * scan) : pulse > 0 ? alpha(C.ok, 0.16 * pulse) : undefined,
          }}
        >
          <div style={{ width: 16, height: 16, borderRadius: r.dir ? 3 : 8, background: r.dir ? alpha(C.muted, 0.6) : r.fresh ? C.accentText : alpha(C.muted, 0.35), flex: 'none' }} />
          <div style={{ fontFamily: MONO, fontSize: font, color: r.dir ? C.muted : r.old ? mixHex(C.text, C.ok, pulse) : C.text, whiteSpace: 'nowrap' }}>{r.text}</div>
          {r.fresh && (
            <div style={{ fontFamily, fontSize: 24, fontWeight: 700, color: C.accentText, border: `2px solid ${C.accentText}`, borderRadius: 14, padding: '2px 12px' }}>queue</div>
          )}
          {miss > 0 && (
            <div style={{ marginLeft: 'auto', marginRight: 26, opacity: miss }}>
              <Cross size={30} color={C.muted} />
            </div>
          )}
        </div>
      );
    })}
  </div>
);
