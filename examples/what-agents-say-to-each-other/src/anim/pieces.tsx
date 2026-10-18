// Drawing pieces shared by SessionPanes and RegistryShelf: terminal panes, the pipe between them,
// message pills and cards, and package boxes. Brand tokens only (brand.ts), Inter + system mono.
import React from 'react';
import { C, GRADIENT, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';

export const MONO = "ui-monospace, Menlo, 'SF Mono', monospace";
const clamp01 = (x: number) => (Number.isFinite(x) ? Math.min(1, Math.max(0, x)) : 0);

// ---------------------------------------------------------------- glyphs

export const Tick: React.FC<{ size: number; color?: string; stroke?: number }> = ({ size, color = C.ok, stroke }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block', flex: 'none' }}>
    <path d="M4 12.5 L9.5 18 L20 6.5" fill="none" stroke={color} strokeWidth={stroke ?? 3.4} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Flag: React.FC<{ size: number; color?: string }> = ({ size, color = C.flag }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block', flex: 'none' }}>
    <path d="M6 3 V21" stroke={color} strokeWidth={2.6} strokeLinecap="round" />
    <path d="M6.5 4 H19 L16 8.5 L19 13 H6.5 Z" fill={color} />
  </svg>
);

export const Question: React.FC<{ size: number; color?: string }> = ({ size, color = C.accentText }) => (
  <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily, fontWeight: 800, fontSize: size * 0.9, color, lineHeight: 1 }}>
    ?
  </div>
);

export const GlyphIcon: React.FC<{ glyph: 'tick' | 'flag' | 'none' | 'q'; size: number; color?: string }> = ({ glyph, size, color }) =>
  glyph === 'tick' ? <Tick size={size} color={color} /> : glyph === 'flag' ? <Flag size={size} color={color} /> : glyph === 'q' ? <Question size={size} color={color} /> : null;

// ---------------------------------------------------------------- panes

/** A few lines of illustrative work, drawn as grey bars so no real text can leak onto a pane. */
const BARS = [0.62, 0.38, 0.8, 0.5, 0.7, 0.3, 0.56];

export const Pane: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  t: number;
  label?: string;
  num?: number;
  warm?: boolean;
  lines?: React.ReactNode;
  bars?: number;
  opacity?: number;
  border?: string;
  seed?: number;
  children?: React.ReactNode;
}> = ({ x, y, w, h, t, label, num, warm, lines, bars = 3, opacity = 1, border, seed = 0, children }) => {
  const blink = Math.floor((t + seed * 0.37) * 2.2) % 2 === 0;
  const cursor = warm ? C.warm : C.accentText;
  const head = 34;
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
      {/* Title bar: three dots, and a role label or a pane number. */}
      <div style={{ height: head, display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 14, borderBottom: `1px solid ${C.line}`, background: alpha(C.card, 0.7) }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: 5, background: alpha(C.muted, 0.35) }} />
        ))}
        {num !== undefined && (
          <div style={{ marginLeft: 10, fontFamily, fontSize: 26, fontWeight: 800, color: warm ? C.warm : C.muted }}>{num}</div>
        )}
        {label && <div style={{ marginLeft: 10, fontFamily, fontSize: 24, fontWeight: 600, color: C.muted, letterSpacing: '0.02em' }}>{label}</div>}
      </div>
      <div style={{ padding: '12px 18px', fontFamily: MONO, fontSize: 26, color: C.muted, lineHeight: 1.45 }}>
        {lines ??
          Array.from({ length: bars }, (_, i) => (
            <div key={i} style={{ height: 12, margin: '10px 0 14px', width: `${BARS[(i + seed) % BARS.length] * 100}%`, borderRadius: 6, background: alpha(C.muted, 0.18) }} />
          ))}
        <div style={{ width: 14, height: 26, background: cursor, opacity: blink ? 0.95 : 0.15, marginTop: 4 }} />
      </div>
      {children}
    </div>
  );
};

// ---------------------------------------------------------------- the pipe

/** A vertical pipe at x from y0 to y1 with taps into the panes at `taps` (y values). */
export const Pipe: React.FC<{ x: number; y0: number; y1: number; taps: number[]; tapTo: number; capped?: number; glow?: number; opacity?: number }> = ({
  x,
  y0,
  y1,
  taps,
  tapTo,
  capped = 0,
  glow = 0,
  opacity = 1,
}) => {
  const col = capped > 0.5 ? alpha(C.muted, 0.45) : C.accent;
  return (
    <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: clamp01(opacity) }} width={1} height={1}>
      {glow > 0 && <line x1={x} y1={y0} x2={x} y2={y1} stroke={C.accent2} strokeWidth={18} strokeLinecap="round" opacity={0.25 * glow} />}
      <line x1={x} y1={y0} x2={x} y2={y1} stroke={col} strokeWidth={6} strokeLinecap="round" strokeDasharray={capped > 0.5 ? '2 12' : undefined} />
      {taps.map((ty, i) => (
        <g key={i}>
          <line x1={x} y1={ty} x2={tapTo} y2={ty} stroke={col} strokeWidth={5} />
          {capped > 0 && (
            <g opacity={clamp01(capped)}>
              <rect x={tapTo - 16} y={ty - 15} width={12} height={30} rx={3} fill={alpha(C.muted, 0.8)} />
            </g>
          )}
        </g>
      ))}
    </svg>
  );
};

// ---------------------------------------------------------------- message pills and cards

/** A small message pill: ASK (outlined, "?") or TELL (filled, tick or flag); plain before either. */
export const Pill: React.FC<{
  x: number;
  y: number;
  face: 'plain' | 'ask' | 'tell';
  glyph?: 'tick' | 'flag' | 'q' | 'none';
  scale?: number;
  opacity?: number;
  flip?: number;
  streak?: number;
  glow?: number;
}> = ({ x, y, face, glyph = 'none', scale = 1, opacity = 1, flip, streak = 0, glow = 0 }) => {
  const w = 104;
  const h = 56;
  // A flip turns the pill edge-on half way, then shows its TELL face.
  const fl = flip ?? (face === 'tell' ? 1 : 0);
  const sx = flip === undefined ? 1 : Math.abs(Math.cos(Math.PI * clamp01(fl)));
  const tellFace = flip === undefined ? face === 'tell' : fl > 0.5;
  const ask = face === 'ask';
  return (
    <div
      style={{
        position: 'absolute',
        left: x - w / 2,
        top: y - h / 2,
        width: w,
        height: h,
        opacity: clamp01(opacity),
        transform: `scale(${scale * Math.max(0.04, sx)}, ${scale})`,
        borderRadius: h / 2,
        background: tellFace ? GRADIENT : ask ? alpha(C.bg0, 0.9) : alpha(C.accent, 0.35),
        border: ask && !tellFace ? `3px solid ${C.accentText}` : `2px solid ${alpha(C.accentText, tellFace ? 0.0 : 0.45)}`,
        boxShadow: glow > 0 ? `0 0 ${30 * glow}px ${alpha(C.accentText, 0.8 * glow)}` : streak > 0 ? `0 0 0 transparent` : `0 6px 16px ${alpha(C.bg0, 0.5)}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        boxSizing: 'border-box',
        filter: streak > 0 ? `blur(${2.5 * streak}px)` : undefined,
      }}
    >
      {tellFace && glyph !== 'none' && glyph !== 'q' ? (
        <div style={{ width: 40, height: 40, borderRadius: 20, background: alpha(C.bg0, 0.85), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <GlyphIcon glyph={glyph} size={28} />
        </div>
      ) : ask ? (
        <Question size={40} />
      ) : (
        [0, 1, 2].map((i) => <div key={i} style={{ width: 9, height: 9, borderRadius: 5, background: alpha(C.text, 0.55) }} />)
      )}
    </div>
  );
};

/** A message card: glyph and "from → to" chip on the left, the line on the right. */
export const MsgCard: React.FC<{
  x: number;
  y: number;
  w: number;
  main: string;
  sub?: string;
  glyph: 'tick' | 'flag' | 'none';
  from?: string;
  appear: number;
  opacity?: number;
  font?: number;
  /** Anchor: 'center' puts y at the card centre, 'top' at its top. */
  anchor?: 'center' | 'top';
  dim?: number;
  originX?: number;
}> = ({ x, y, w, main, sub, glyph, from, appear, opacity = 1, font = 36, anchor = 'center', dim = 0, originX = 0 }) => {
  const a = clamp01(appear);
  if (a <= 0 || opacity <= 0) return null;
  const tell = glyph !== 'none';
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        transform: `translateY(${anchor === 'center' ? '-50%' : '0'}) scale(${0.6 + 0.4 * a})`,
        transformOrigin: `${originX}px 50%`,
        opacity: clamp01(opacity) * a * (1 - 0.6 * dim),
        background: tell ? `linear-gradient(135deg, ${alpha(C.accent, 0.96)}, ${alpha(C.accent2, 0.96)})` : alpha(C.card, 0.97),
        border: tell ? 'none' : `2px solid ${alpha(C.accentText, 0.6)}`,
        borderRadius: 22,
        padding: '18px 24px 20px 20px',
        boxSizing: 'border-box',
        boxShadow: `0 18px 44px ${alpha(C.bg0, 0.75)}`,
        display: 'flex',
        gap: 16,
        alignItems: 'flex-start',
        fontFamily,
        zIndex: 5,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 'none', paddingTop: 2 }}>
        {tell && (
          <div style={{ width: 52, height: 52, borderRadius: 26, background: alpha(C.bg0, 0.88), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GlyphIcon glyph={glyph} size={34} />
          </div>
        )}
        {from && <div style={{ fontSize: 24, fontWeight: 700, color: alpha(C.text, 0.75), whiteSpace: 'nowrap' }}>{from}</div>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: font, fontWeight: 650, lineHeight: 1.22, color: C.text, letterSpacing: '-0.01em' }}>{main}</div>
        {sub && <div style={{ fontSize: Math.round(font * 0.78), fontWeight: 500, lineHeight: 1.25, color: alpha(C.text, 0.78) }}>{sub}</div>}
      </div>
    </div>
  );
};

/** The pill that travels along the pipe before a card opens. */
export const Courier: React.FC<{ x: number; y: number; glyph: 'tick' | 'flag' | 'none'; opacity?: number }> = ({ x, y, glyph, opacity = 1 }) => (
  <div
    style={{
      position: 'absolute',
      left: x - 30,
      top: y - 22,
      width: 60,
      height: 44,
      borderRadius: 22,
      background: glyph === 'none' ? C.card : GRADIENT,
      border: glyph === 'none' ? `2px solid ${C.accentText}` : 'none',
      boxShadow: `0 0 26px ${alpha(C.accentText, 0.75)}`,
      opacity: clamp01(opacity),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 6,
    }}
  >
    {glyph !== 'none' ? <GlyphIcon glyph={glyph} size={26} color={C.text} /> : <div style={{ width: 24, height: 4, borderRadius: 2, background: C.accentText }} />}
  </div>
);

// ---------------------------------------------------------------- package boxes

/**
 * A package box sitting with its bottom at `floor`: a label on the front, a lid that tips open,
 * and its contents rising out of it on a card (the version actually inside).
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
  ghost?: boolean;
  stamp?: number;
}> = ({ x, floor, w, h, label, inside, lid, rise, dusty, glow = 0, opacity = 1, dropY = 0, ghost, stamp = 0 }) => {
  const top = floor - h + dropY;
  const body = dusty ? alpha(C.warm, 0.16) : alpha(C.accent, 0.55);
  const front = dusty ? alpha(C.warm, 0.3) : C.accent;
  const r = clamp01(rise);
  return (
    <div style={{ position: 'absolute', left: x - w / 2, top, width: w, height: h, opacity: clamp01(opacity) }}>
      {glow > 0 && <div style={{ position: 'absolute', inset: -24, borderRadius: 30, boxShadow: `0 0 ${60 * glow}px ${alpha(C.accentText, 0.75 * glow)}` }} />}
      {/* Body */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          top: 18,
          borderRadius: 10,
          background: ghost ? 'transparent' : `linear-gradient(180deg, ${front}, ${body})`,
          border: ghost ? `2px dashed ${alpha(C.muted, 0.5)}` : `2px solid ${alpha(C.text, dusty ? 0.08 : 0.18)}`,
          boxShadow: ghost ? undefined : `0 12px 26px ${alpha(C.bg0, 0.6)}`,
        }}
      >
        {dusty && (
          <svg width={w} height={h - 18} style={{ position: 'absolute', inset: 0, opacity: 0.5 }}>
            {[...Array(14)].map((_, i) => (
              <circle key={i} cx={(i * 37) % w} cy={((i * 53) % (h - 30)) + 8} r={2 + (i % 3)} fill={alpha(C.warm, 0.35)} />
            ))}
          </svg>
        )}
        {label && (
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '55%',
              transform: 'translate(-50%, -50%)',
              padding: '6px 18px',
              borderRadius: 8,
              background: ghost ? 'transparent' : C.text,
              color: C.bg0,
              fontFamily,
              fontWeight: 800,
              fontSize: 40,
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </div>
        )}
      </div>
      {/* Lid, hinged at the back-left corner. */}
      <div
        style={{
          position: 'absolute',
          left: -8,
          top: 0,
          width: w + 16,
          height: 26,
          borderRadius: 8,
          background: ghost ? 'transparent' : dusty ? alpha(C.warm, 0.45) : C.accent2,
          border: ghost ? `2px dashed ${alpha(C.muted, 0.5)}` : 'none',
          transformOrigin: '0% 100%',
          // Opening: the lid lifts off and tips back, so it reads as open, not as a stick.
          transform: `translate(${-26 * clamp01(lid)}px, ${-64 * clamp01(lid)}px) rotate(${-20 * clamp01(lid)}deg)`,
        }}
      />
      {/* Contents card rising out of the open box. */}
      {inside && r > 0 && (
        <div
          style={{
            position: 'absolute',
            left: w / 2 - 150,
            top: -20 - 230 * r,
            width: 300,
            height: 210,
            borderRadius: 16,
            background: C.card,
            border: `3px solid ${dusty ? C.warm : C.flag}`,
            boxShadow: `0 16px 40px ${alpha(C.bg0, 0.7)}`,
            opacity: r,
            padding: '14px 18px',
            boxSizing: 'border-box',
            fontFamily: MONO,
            fontSize: 22,
            color: alpha(C.muted, 0.8),
            overflow: 'hidden',
          }}
        >
          <div style={{ fontFamily, fontSize: 22, fontWeight: 600, color: C.muted, marginBottom: 8 }}>inside:</div>
          {[0.8, 0.55, 0.7].map((wd, i) => (
            <div key={i} style={{ height: 10, width: `${wd * 100}%`, borderRadius: 5, background: alpha(C.muted, 0.22), margin: '8px 0' }} />
          ))}
          <div
            style={{
              position: 'absolute',
              right: 16,
              bottom: 14,
              fontFamily,
              fontSize: 64,
              fontWeight: 800,
              color: C.flag,
              transform: `rotate(-8deg) scale(${0.7 + 0.3 * clamp01(stamp || r)})`,
              letterSpacing: '-0.02em',
            }}
          >
            {inside}
          </div>
        </div>
      )}
    </div>
  );
};

/** The registry shelf: a plank with a small label. */
export const Shelf: React.FC<{ y: number; x0?: number; x1?: number; opacity?: number }> = ({ y, x0 = 40, x1 = 920, opacity = 1 }) => (
  <div style={{ position: 'absolute', left: 0, top: 0, opacity: clamp01(opacity) }}>
    <div style={{ position: 'absolute', left: x0, top: y, width: x1 - x0, height: 22, borderRadius: 6, background: `linear-gradient(180deg, ${C.card}, ${C.bg1})`, border: `2px solid ${C.line}` }} />
    <div style={{ position: 'absolute', left: x0 + 6, top: y + 34, fontFamily, fontSize: 26, fontWeight: 700, letterSpacing: '0.12em', color: alpha(C.muted, 0.75) }}>
      REGISTRY
    </div>
  </div>
);

/** A dotted walk from a pane down to a box, drawn by `draw` (0..1). */
export const Walk: React.FC<{ x0: number; y0: number; x1: number; y1: number; draw: number; color?: string }> = ({ x0, y0, x1, y1, draw, color = C.accentText }) => {
  const d = clamp01(draw);
  if (d <= 0) return null;
  const xe = x0 + (x1 - x0) * d;
  const ye = y0 + (y1 - y0) * d;
  return (
    <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} width={1} height={1}>
      <line x1={x0} y1={y0} x2={xe} y2={ye} stroke={color} strokeWidth={5} strokeDasharray="4 14" strokeLinecap="round" />
      <circle cx={xe} cy={ye} r={9} fill={color} />
    </svg>
  );
};

/** A round badge with a tick (teal) or a flag (red), popping in with `pop`. */
export const Badge: React.FC<{ x: number; y: number; size: number; glyph: 'tick' | 'flag'; pop: number }> = ({ x, y, size, glyph, pop }) => {
  const p = clamp01(pop);
  if (p <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        borderRadius: size / 2,
        background: alpha(C.bg0, 0.92),
        border: `3px solid ${glyph === 'tick' ? C.ok : C.flag}`,
        transform: `scale(${0.4 + 0.6 * p})`,
        opacity: p,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 4,
      }}
    >
      <GlyphIcon glyph={glyph} size={size * 0.62} />
    </div>
  );
};
