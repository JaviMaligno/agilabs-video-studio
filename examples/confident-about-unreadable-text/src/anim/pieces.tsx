// Drawing pieces shared by the cipher scenes: the message card, glyph lines in fixed slots,
// the model chips and the glass wall. Brand tokens only.
import React from 'react';
import { Img, staticFile } from 'remotion';
import { C, GRADIENT, alpha } from '../brand.ts';
import type { Glyph } from './glyphs.ts';

/** Slot width of one glyph, as a fraction of the font size (a monospace look with Inter). */
export const SLOT = 0.6;

/** Text in fixed-width slots so glyphs can change without the line jumping. */
export const GlyphLine: React.FC<{
  glyphs: Glyph[];
  size: number;
  weight?: number;
  /** Colour for settled glyphs and for glyphs in transit. */
  color?: string;
  transit?: string;
  style?: React.CSSProperties;
}> = ({ glyphs, size, weight = 600, color = C.text, transit = C.accentText, style }) => (
  <div style={{ display: 'flex', whiteSpace: 'pre', fontSize: size, fontWeight: weight, lineHeight: 1.1, ...style }}>
    {glyphs.map((g, i) => (
      <span
        key={i}
        style={{
          display: 'inline-block',
          width: size * SLOT,
          textAlign: 'center',
          color: g.settle > 0 && g.settle < 1 ? transit : color,
        }}
      >
        {g.ch}
      </span>
    ))}
  </div>
);

/** The message card body. */
export const Card: React.FC<{ w: number; h: number; children: React.ReactNode; glow?: number; style?: React.CSSProperties }> = ({
  w,
  h,
  children,
  glow = 0,
  style,
}) => (
  <div
    style={{
      width: w,
      height: h,
      borderRadius: 28,
      background: C.card,
      border: `2px solid ${alpha(C.accentText, 0.35 + 0.5 * glow)}`,
      boxShadow: `0 24px 60px ${alpha('#000000', 0.45)}, 0 0 ${40 * glow}px ${alpha(C.accent, 0.6 * glow)}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      ...style,
    }}
  >
    {children}
  </div>
);

/** Five chips across the stage width. */
export const CHIP = { w: 172, h: 124, gap: 25 } as const;
export const chipX = (i: number) => i * (CHIP.w + CHIP.gap);
export const chipCx = (i: number) => chipX(i) + CHIP.w / 2;

export const Chip: React.FC<{
  x: number;
  y: number;
  label: readonly string[];
  lit?: number;
  dim?: number;
  muted?: boolean;
  w?: number;
  h?: number;
  size?: number;
  /** A cast drawing (path under public/) shown left of the label, e.g. a generic robot for a model. */
  icon?: string;
}> = ({ x, y, label, lit = 0, dim = 0, muted = false, w = CHIP.w, h = CHIP.h, size = 30, icon }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      borderRadius: 24,
      background: lit > 0 ? `linear-gradient(135deg, ${alpha(C.accent, 0.35 * lit)}, ${alpha(C.accent2, 0.35 * lit)}), ${C.card}` : C.card,
      border: `2px solid ${lit > 0 ? alpha(C.accentText, 0.4 + 0.6 * lit) : alpha(C.muted, muted ? 0.25 : 0.45)}`,
      boxShadow: lit > 0 ? `0 0 ${50 * lit}px ${alpha(C.accent, 0.55 * lit)}` : 'none',
      display: 'flex',
      flexDirection: icon ? 'row' : 'column',
      gap: icon ? 14 : 0,
      alignItems: 'center',
      justifyContent: 'center',
      opacity: 1 - 0.72 * dim,
      color: muted ? C.muted : C.text,
      fontSize: size,
      fontWeight: 700,
      lineHeight: 1.12,
      textAlign: 'center',
    }}
  >
    {icon && <Img src={staticFile(icon)} style={{ height: h - 10, width: h - 10, objectFit: 'contain', filter: muted ? 'saturate(0.7)' : undefined }} />}
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {label.map((l, i) => (
        <div key={i} style={{ whiteSpace: 'nowrap', fontWeight: i === 0 ? 700 : 600, color: i === 0 ? undefined : muted ? C.muted : alpha(C.text, 0.8) }}>
          {l}
        </div>
      ))}
    </div>
  </div>
);

/**
 * Glass wall standing on a line (its bottom), `height` px tall: a translucent pane with a bright
 * top edge and diagonal glare. `flash` brightens it on a hit.
 */
export const Wall: React.FC<{ x: number; bottom: number; w: number; height: number; flash?: number; opacity?: number }> = ({
  x,
  bottom,
  w,
  height,
  flash = 0,
  opacity = 1,
}) => {
  if (height <= 0.5) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: bottom - height,
        width: w,
        height,
        borderRadius: '14px 14px 4px 4px',
        background: `linear-gradient(180deg, ${alpha(C.accentText, 0.32 + 0.4 * flash)}, ${alpha(C.accent, 0.1 + 0.2 * flash)})`,
        border: `2px solid ${alpha(C.accentText, 0.55 + 0.45 * flash)}`,
        borderTop: `6px solid ${alpha(C.text, 0.75 + 0.25 * flash)}`,
        boxShadow: `0 0 ${30 + 70 * flash}px ${alpha(C.accent, 0.35 + 0.5 * flash)}, inset 0 0 40px ${alpha(C.accentText, 0.2)}`,
        overflow: 'hidden',
        opacity,
      }}
    >
      {[0.18, 0.42, 0.7].map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${p * 100}%`,
            top: -40,
            width: i === 1 ? 28 : 12,
            height: height + 80,
            background: alpha('#ffffff', 0.1 + 0.15 * flash),
            transform: 'rotate(24deg)',
          }}
        />
      ))}
    </div>
  );
};

/** Gradient pill with a short label (badges such as "turn 1"). */
export const Pill: React.FC<{ children: React.ReactNode; size?: number; style?: React.CSSProperties; outline?: boolean }> = ({
  children,
  size = 30,
  style,
  outline,
}) => (
  <div
    style={{
      padding: `${size * 0.28}px ${size * 0.6}px`,
      borderRadius: 999,
      background: outline ? alpha(C.bg0, 0.8) : GRADIENT,
      border: outline ? `2px solid ${alpha(C.accentText, 0.8)}` : 'none',
      color: C.text,
      fontSize: size,
      fontWeight: 700,
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    {children}
  </div>
);
