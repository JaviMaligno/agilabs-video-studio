// Drawing pieces for ShelfLanes and ReportWall: the series' terminal pane, package box and registry
// shelf (from "What Coding Agents Say to Each Other"), plus this video's own: model chips, hands
// (free or tied), the runner that carries a slip, the glass case with its padlock, the TOOLS.md
// signpost and report cards with their three stamps. Brand tokens only, Inter + system mono.
import React from 'react';
import { C, GRADIENT, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';

export const MONO = "ui-monospace, Menlo, 'SF Mono', monospace";
export const clamp01 = (x: number) => (Number.isFinite(x) ? Math.min(1, Math.max(0, x)) : 0);

// ---------------------------------------------------------------- glyphs

export const Tick: React.FC<{ size: number; color?: string; stroke?: number }> = ({ size, color = C.ok, stroke }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block', flex: 'none' }}>
    <path d="M4 12.5 L9.5 18 L20 6.5" fill="none" stroke={color} strokeWidth={stroke ?? 3.4} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ---------------------------------------------------------------- terminal pane

export const Pane: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  t: number;
  label?: string;
  lines?: React.ReactNode;
  opacity?: number;
  border?: string;
}> = ({ x, y, w, h, t, label, lines, opacity = 1, border }) => {
  const blink = Math.floor(t * 2.2) % 2 === 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        opacity: clamp01(opacity),
        background: C.pane,
        border: `2px solid ${border ?? C.line}`,
        borderRadius: 14,
        overflow: 'hidden',
        boxShadow: `0 10px 30px ${alpha(C.bg0, 0.6)}`,
      }}
    >
      <div style={{ height: 36, display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 14, borderBottom: `1px solid ${C.line}`, background: alpha(C.card, 0.7) }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ width: 11, height: 11, borderRadius: 6, background: alpha(C.muted, 0.35) }} />
        ))}
        {label && <div style={{ marginLeft: 10, fontFamily, fontSize: 24, fontWeight: 600, color: C.muted }}>{label}</div>}
      </div>
      <div style={{ padding: '14px 22px', fontFamily: MONO, fontSize: 32, color: C.muted, lineHeight: 1.5 }}>
        {lines}
        <div style={{ width: 16, height: 30, background: C.accentText, opacity: blink ? 0.95 : 0.15, marginTop: 4 }} />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- package box and shelf

/**
 * A package box with its bottom at `floor`: a label on the front, a lid that tips open, and a
 * card rising out of it with the version actually inside (amber: the old build).
 */
export const PackageBox: React.FC<{
  x: number;
  floor: number;
  w: number;
  h: number;
  label: string;
  inside: string;
  lid: number;
  rise: number;
  dusty?: boolean;
  glow?: number;
  opacity?: number;
  dropY?: number;
  insideScale?: number;
  insideFlash?: number;
}> = ({ x, floor, w, h, label, inside, lid, rise, dusty, glow = 0, opacity = 1, dropY = 0, insideScale = 1, insideFlash = 0 }) => {
  const top = floor - h + dropY;
  const body = dusty ? alpha(C.warm, 0.16) : alpha(C.accent, 0.55);
  const front = dusty ? alpha(C.warm, 0.3) : C.accent;
  const r = clamp01(rise);
  const cw = 150 * insideScale;
  const ch = 84 * insideScale;
  const fs = Math.round(Math.min(40, w * 0.22));
  return (
    <div style={{ position: 'absolute', left: x - w / 2, top, width: w, height: h, opacity: clamp01(opacity) }}>
      {glow > 0 && <div style={{ position: 'absolute', inset: -20, borderRadius: 26, boxShadow: `0 0 ${50 * glow}px ${alpha(C.accentText, 0.75 * glow)}` }} />}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          top: 16,
          borderRadius: 10,
          background: `linear-gradient(180deg, ${front}, ${body})`,
          border: `2px solid ${alpha(C.text, dusty ? 0.08 : 0.18)}`,
          boxShadow: `0 12px 26px ${alpha(C.bg0, 0.6)}`,
        }}
      >
        {dusty && (
          <svg width={w} height={h - 16} style={{ position: 'absolute', inset: 0, opacity: 0.5 }}>
            {[...Array(12)].map((_, i) => (
              <circle key={i} cx={(i * 37) % w} cy={((i * 53) % Math.max(10, h - 30)) + 8} r={2 + (i % 3)} fill={alpha(C.warm, 0.35)} />
            ))}
          </svg>
        )}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '55%',
            transform: 'translate(-50%, -50%)',
            padding: '4px 14px',
            borderRadius: 8,
            background: C.text,
            color: C.bg0,
            fontFamily,
            fontWeight: 800,
            fontSize: fs,
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: -8,
          top: 0,
          width: w + 16,
          height: 24,
          borderRadius: 8,
          background: dusty ? alpha(C.warm, 0.45) : C.accent2,
          transformOrigin: '0% 100%',
          transform: `translate(${-22 * clamp01(lid)}px, ${-54 * clamp01(lid)}px) rotate(${-20 * clamp01(lid)}deg)`,
        }}
      />
      {inside && r > 0 && (
        <div
          style={{
            position: 'absolute',
            left: w / 2 - cw / 2,
            top: 10 - (ch + 16) * r,
            width: cw,
            height: ch,
            borderRadius: 14,
            background: C.card,
            border: `3px solid ${C.warm}`,
            boxShadow: `0 0 ${36 * insideFlash}px ${alpha(C.warm, 0.9)}, 0 14px 30px ${alpha(C.bg0, 0.7)}`,
            opacity: r,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily,
          }}
        >
          <div style={{ fontSize: 17 * insideScale, fontWeight: 600, color: C.muted, lineHeight: 1 }}>inside</div>
          <div style={{ fontSize: 44 * insideScale, fontWeight: 800, color: C.warm, lineHeight: 1.05, letterSpacing: '-0.02em' }}>{inside}</div>
        </div>
      )}
    </div>
  );
};

export const Shelf: React.FC<{ y: number; x0?: number; x1?: number; opacity?: number }> = ({ y, x0 = 20, x1 = 940, opacity = 1 }) => (
  <div style={{ position: 'absolute', left: 0, top: 0, opacity: clamp01(opacity) }}>
    <div style={{ position: 'absolute', left: x0, top: y, width: x1 - x0, height: 22, borderRadius: 6, background: `linear-gradient(180deg, ${C.card}, ${C.bg1})`, border: `2px solid ${C.line}` }} />
    <div style={{ position: 'absolute', left: x0 + 6, top: y + 30, fontFamily, fontSize: 24, fontWeight: 700, letterSpacing: '0.12em', color: alpha(C.muted, 0.75) }}>REGISTRY</div>
  </div>
);

// ---------------------------------------------------------------- walks

/** A dotted walk along a polyline, drawn up to `draw` (0..1) of its length, with a dot at its head. */
export const PolyWalk: React.FC<{ pts: [number, number][]; draw: number; color?: string; head?: boolean; width?: number }> = ({
  pts,
  draw,
  color = C.accentText,
  head = true,
  width = 5,
}) => {
  const d = clamp01(draw);
  if (d <= 0 || pts.length < 2) return null;
  const segs = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const total = segs.reduce((a, b) => a + b, 0);
  let left = total * d;
  const out: [number, number][] = [pts[0]];
  for (let i = 0; i < segs.length && left > 0; i++) {
    const f = Math.min(1, left / Math.max(segs[i], 1e-6));
    const [ax, ay] = pts[i];
    const [bx, by] = pts[i + 1];
    out.push([ax + (bx - ax) * f, ay + (by - ay) * f]);
    left -= segs[i];
  }
  const end = out[out.length - 1];
  return (
    <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} width={1} height={1}>
      <polyline points={out.map((p) => p.join(',')).join(' ')} fill="none" stroke={color} strokeWidth={width} strokeDasharray="4 14" strokeLinecap="round" strokeLinejoin="round" />
      {head && <circle cx={end[0]} cy={end[1]} r={10} fill={color} />}
    </svg>
  );
};

// ---------------------------------------------------------------- the agent: chip and hand

export const ModelChip: React.FC<{ x: number; y: number; name: string; appear: number; squash?: number; scale?: number; dim?: boolean }> = ({
  x,
  y,
  name,
  appear,
  squash = 0,
  scale = 1,
  dim,
}) => {
  const a = clamp01(appear);
  if (a <= 0) return null;
  const w = 226;
  const h = 62;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - w / 2,
        top: y - h / 2,
        width: w,
        height: h,
        borderRadius: h / 2,
        padding: 3,
        boxSizing: 'border-box',
        background: dim ? alpha(C.muted, 0.5) : GRADIENT,
        opacity: a,
        transform: `scale(${scale * (0.7 + 0.3 * a)}, ${scale * (0.7 + 0.3 * a) * Math.max(0.05, 1 - clamp01(squash))})`,
        boxShadow: `0 8px 22px ${alpha(C.bg0, 0.6)}`,
        zIndex: 3,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: h / 2,
          background: C.bg1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          fontFamily,
          fontSize: 32,
          fontWeight: 800,
          color: C.text,
          whiteSpace: 'nowrap',
        }}
      >
        <div style={{ width: 14, height: 14, borderRadius: 7, background: dim ? C.muted : C.accentText }} />
        {name}
      </div>
    </div>
  );
};

/** A pointing hand (the agent's hand), optionally tied with a looped cord round the wrist. */
export const Hand: React.FC<{ x: number; y: number; size?: number; tied: number; opacity?: number; glow?: number }> = ({ x, y, size = 96, tied, opacity = 1, glow = 0 }) => {
  const tie = clamp01(tied);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      style={{ position: 'absolute', left: x - size / 2, top: y - size / 2, overflow: 'visible', opacity: clamp01(opacity), filter: glow > 0 ? `drop-shadow(0 0 ${14 * glow}px ${alpha(C.accentText, 0.9)})` : undefined }}
    >
      {/* A hand pointing down: cuff at the top, palm, three folded fingers, the index finger out. */}
      <g fill={alpha(C.text, 0.92)} stroke={C.bg0} strokeWidth={1.4} strokeLinejoin="round">
        <rect x={15} y={0} width={18} height={9} rx={2.5} fill={alpha(C.muted, 0.9)} />
        <path d="M33 13 L41 21 a3 3 0 0 1 -1 4.5 l-1 0.5 a3 3 0 0 1 -3.5 -1 L31 20 z" />
        <rect x={13} y={7} width={22} height={21} rx={6} />
        <rect x={26.5} y={23} width={6} height={11} rx={3} />
        <rect x={20.5} y={24} width={6} height={12} rx={3} />
        <rect x={14} y={23} width={6.5} height={23} rx={3.2} />
      </g>
      {tie > 0 && (
        <g opacity={tie}>
          <ellipse cx={24} cy={7} rx={13} ry={3.2} fill="none" stroke={C.warm} strokeWidth={2.6} />
          <ellipse cx={24} cy={2.5} rx={12} ry={3} fill="none" stroke={C.warm} strokeWidth={2.6} />
          <path d="M35.5 5 q8 1 7 9 M36 4 q8 -4 10 3" fill="none" stroke={C.warm} strokeWidth={2.4} strokeLinecap="round" />
          <circle cx={35.5} cy={4.8} r={2.6} fill={C.warm} />
        </g>
      )}
    </svg>
  );
};

/** The command slip a tied hand writes for the runner. */
export const Slip: React.FC<{ x: number; y: number; appear: number; text?: string; scale?: number }> = ({ x, y, appear, text = 'wk-inspect', scale = 1 }) => {
  const a = clamp01(appear);
  if (a <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - 70 * scale,
        top: y - 21 * scale,
        width: 140 * scale,
        height: 42 * scale,
        borderRadius: 6,
        background: C.text,
        color: C.bg0,
        fontFamily: MONO,
        fontSize: 20 * scale,
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: a,
        transform: `rotate(-4deg) scale(${0.6 + 0.4 * a})`,
        boxShadow: `0 6px 16px ${alpha(C.bg0, 0.6)}`,
        zIndex: 5,
      }}
    >
      {text}
    </div>
  );
};

/** The runner: a small machine that takes the slip to the shelf and lifts the lid for the agent. */
export const Runner: React.FC<{ x: number; y: number; opacity: number; size?: number }> = ({ x, y, opacity, size = 60 }) => {
  const o = clamp01(opacity);
  if (o <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, opacity: o, zIndex: 4 }}>
      <svg width={size} height={size} viewBox="0 0 40 40">
        <line x1={20} y1={2} x2={20} y2={8} stroke={C.accentText} strokeWidth={2.5} />
        <circle cx={20} cy={2.5} r={2.5} fill={C.accentText} />
        <rect x={4} y={8} width={32} height={26} rx={7} fill={C.bg1} stroke={C.accentText} strokeWidth={2.6} />
        <circle cx={14} cy={20} r={3.2} fill={C.accentText} />
        <circle cx={26} cy={20} r={3.2} fill={C.accentText} />
        <rect x={9} y={34} width={6} height={5} rx={1.5} fill={C.accentText} />
        <rect x={25} y={34} width={6} height={5} rx={1.5} fill={C.accentText} />
      </svg>
    </div>
  );
};

/** Glass case over a box with a padlock: the registry nobody can reach. */
export const Glass: React.FC<{ x: number; top: number; floor: number; w: number; opacity: number; thud?: number }> = ({ x, top, floor, w, opacity, thud = 0 }) => {
  const o = clamp01(opacity);
  if (o <= 0) return null;
  const h = floor - top;
  return (
    <div style={{ position: 'absolute', left: x - w / 2, top, width: w, height: h, opacity: o, zIndex: 3 }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 12,
          background: alpha(C.accentText, 0.1 + 0.15 * thud),
          border: `3px solid ${alpha(C.accentText, 0.55 + 0.4 * thud)}`,
          boxShadow: thud > 0 ? `0 0 ${40 * thud}px ${alpha(C.accentText, 0.7)}` : undefined,
        }}
      />
      <svg width={w} height={h} style={{ position: 'absolute', inset: 0 }}>
        <line x1={w * 0.15} y1={h * 0.55} x2={w * 0.45} y2={h * 0.12} stroke={alpha(C.text, 0.25)} strokeWidth={4} strokeLinecap="round" />
        <line x1={w * 0.28} y1={h * 0.62} x2={w * 0.52} y2={h * 0.3} stroke={alpha(C.text, 0.15)} strokeWidth={3} strokeLinecap="round" />
      </svg>
      {/* Padlock on the front, 403 on its body. */}
      <div style={{ position: 'absolute', left: w / 2 - 44, top: -58, width: 88, height: 100 }}>
        <svg width={88} height={100} viewBox="0 0 88 100" style={{ position: 'absolute', inset: 0 }}>
          <path d="M22 46 V28 a22 22 0 0 1 44 0 V46" fill="none" stroke={C.muted} strokeWidth={9} />
          <rect x={6} y={42} width={76} height={56} rx={10} fill={C.card} stroke={C.muted} strokeWidth={4} />
        </svg>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 54, textAlign: 'center', fontFamily, fontSize: 28, fontWeight: 800, color: C.text }}>403</div>
      </div>
    </div>
  );
};

/** The TOOLS.md signpost pointing down at the shelf. */
export const Signpost: React.FC<{ x: number; y: number; appear: number; gone?: number; post?: number; scale?: number }> = ({ x, y, appear, gone = 0, post = 120, scale = 1 }) => {
  const a = clamp01(appear);
  const g = clamp01(gone);
  if (a <= 0 || g >= 1) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - 120,
        top: y,
        width: 240,
        opacity: a * (1 - g),
        transform: `translate(${260 * g * g}px, ${-120 * g}px) rotate(${50 * g}deg) scale(${scale * (0.7 + 0.3 * a) * (1 - 0.6 * g)})`,
        transformOrigin: '50% 30%',
        zIndex: 4,
      }}
    >
      <div style={{ position: 'absolute', left: 114, top: 70, width: 12, height: post, background: alpha(C.muted, 0.6), borderRadius: 3 }} />
      <div
        style={{
          position: 'relative',
          borderRadius: 12,
          background: C.text,
          color: C.bg0,
          padding: '8px 12px 10px',
          textAlign: 'center',
          fontFamily,
          boxShadow: `0 10px 24px ${alpha(C.bg0, 0.7)}`,
          clipPath: g > 0 ? `polygon(0 0, 100% ${8 * g}%, ${100 - 20 * g}% 100%, ${10 * g}% ${100 - 25 * g}%)` : undefined,
        }}
      >
        <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.1 }}>TOOLS.md</div>
        <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 700, lineHeight: 1.3 }}>↓ wk-inspect</div>
      </div>
    </div>
  );
};

/** A small tool tag hanging from the agent's belt. */
export const ToolTag: React.FC<{ x: number; y: number; glow: number; opacity?: number }> = ({ x, y, glow, opacity = 1 }) => {
  const o = clamp01(opacity);
  if (o <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y - 18,
        height: 36,
        padding: '0 10px',
        borderRadius: 8,
        border: `2px solid ${alpha(C.accentText, 0.5 + 0.5 * glow)}`,
        background: alpha(C.accent, 0.12 + 0.3 * glow),
        boxShadow: glow > 0 ? `0 0 ${26 * glow}px ${alpha(C.accentText, 0.8)}` : undefined,
        fontFamily: MONO,
        fontSize: 20,
        fontWeight: 700,
        color: C.text,
        display: 'flex',
        alignItems: 'center',
        whiteSpace: 'nowrap',
        opacity: o,
        zIndex: 4,
      }}
    >
      wk-inspect
    </div>
  );
};

// ---------------------------------------------------------------- report cards and stamps

export type StampKind = 'check' | 'doubt' | 'false' | 'none';

/** The three stamps: checked (gradient), could not confirm (outlined), a false "published" (grey, cracked). */
export const Stamp: React.FC<{ kind: StampKind; pop: number; crack?: number; scale?: number; flash?: number }> = ({ kind, pop, crack = 0, scale = 1, flash = 0 }) => {
  const p = clamp01(pop);
  if (p <= 0 || kind === 'none') return null;
  const base: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8 * scale,
    borderRadius: 12 * scale,
    fontFamily,
    fontWeight: 800,
    whiteSpace: 'nowrap',
    opacity: p,
    transform: `scale(${scale * (1.5 - 0.5 * p)}) rotate(-6deg)`,
  };
  if (kind === 'check') {
    return (
      <div style={{ ...base, padding: '6px 16px', background: GRADIENT, color: C.text, fontSize: 30, boxShadow: `0 0 ${30 * flash}px ${alpha(C.accentText, 0.9)}` }}>
        <Tick size={30} color={C.text} stroke={4} />
        checked
      </div>
    );
  }
  if (kind === 'doubt') {
    return (
      <div style={{ ...base, padding: '4px 14px', background: alpha(C.bg0, 0.92), border: `3px solid ${C.accentText}`, color: C.accentText, fontSize: 22, boxShadow: `0 0 ${30 * flash}px ${alpha(C.accentText, 0.9)}` }}>
        <span style={{ fontSize: 38, lineHeight: 1 }}>?</span>
        could not confirm
      </div>
    );
  }
  const path = 'M -6 26 L 40 34 L 78 18 L 120 40 L 160 26 L 200 46 L 250 34';
  return (
    <div style={{ ...base, padding: '6px 14px', background: alpha(C.bg0, 0.9), border: `4px solid ${C.muted}`, color: C.muted, fontSize: 28, letterSpacing: '0.03em' }}>
      PUBLISHED ✓
      {crack > 0 && (
        <svg width={240} height={60} viewBox="0 0 240 60" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
          <path d={path} fill="none" stroke={C.bg0} strokeWidth={8} pathLength={1} strokeDasharray={`${clamp01(crack)} 1`} strokeLinejoin="bevel" />
          <path d={path} fill="none" stroke={C.text} strokeWidth={2.5} pathLength={1} strokeDasharray={`${clamp01(crack)} 1`} strokeLinejoin="bevel" />
        </svg>
      )}
    </div>
  );
};

/** A report card: a sheet with a few lines of text (bars), the stamp over it. */
export const ReportCard: React.FC<{
  x: number;
  y: number;
  w?: number;
  h?: number;
  appear: number;
  kind: StampKind;
  pop: number;
  crack?: number;
  stampScale?: number;
  flash?: number;
}> = ({ x, y, w = 250, h = 116, appear, kind, pop, crack = 0, stampScale = 1, flash = 0 }) => {
  const a = clamp01(appear);
  if (a <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, opacity: a, transform: `translateY(${18 * (1 - a)}px)`, zIndex: 5 }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 12,
          background: C.card,
          border: `2px solid ${C.line}`,
          boxShadow: `0 12px 28px ${alpha(C.bg0, 0.7)}`,
          padding: '10px 14px',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ fontFamily, fontSize: 18, fontWeight: 700, color: alpha(C.muted, 0.85), letterSpacing: '0.08em' }}>REPORT</div>
        {[0.85, 0.6, 0.75].map((wd, i) => (
          <div key={i} style={{ height: 8, width: `${wd * 100}%`, borderRadius: 4, background: alpha(C.muted, 0.2), margin: '9px 0' }} />
        ))}
      </div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Stamp kind={kind} pop={pop} crack={crack} scale={stampScale} flash={flash} />
      </div>
    </div>
  );
};

/** A small tag (pill) of muted text. */
export const Tag: React.FC<{ x: number; y: number; w?: number; text: React.ReactNode; appear: number; size?: number; strong?: boolean; anchor?: 'center' | 'left' }> = ({
  x,
  y,
  w,
  text,
  appear,
  size = 24,
  strong,
  anchor = 'center',
}) => {
  const a = clamp01(appear);
  if (a <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: anchor === 'center' ? x - (w ?? 300) / 2 : x,
        top: y,
        width: w ?? 300,
        display: 'flex',
        justifyContent: anchor === 'center' ? 'center' : 'flex-start',
        opacity: a,
        transform: `translateY(${10 * (1 - a)}px)`,
        zIndex: 6,
      }}
    >
      <div
        style={{
          padding: '5px 12px',
          borderRadius: 12,
          border: `2px solid ${strong ? C.accentText : alpha(C.muted, 0.55)}`,
          background: alpha(C.bg0, 0.88),
          fontFamily,
          fontSize: size,
          fontWeight: 600,
          lineHeight: 1.2,
          color: strong ? C.text : C.muted,
          textAlign: 'center',
        }}
      >
        {text}
      </div>
    </div>
  );
};
