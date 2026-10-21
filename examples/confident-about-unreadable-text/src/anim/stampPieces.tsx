// Drawing pieces of the confident-stamp metaphor: the stamp itself, the "what it sees" noise
// window, the judge's stamp tool, sealed request cards, redacted reply bars, the filter gate and
// the banana. Brand tokens only (no new colours).
import React from 'react';
import { C, GRADIENT, alpha } from '../brand.ts';
import { noiseGlyph } from './glyphs.ts';
import type { Slam } from './stamp.ts';

export type StampTone = 'ink' | 'muted';

/**
 * A rubber stamp: thick outline, uppercase label, rotated. `fill` 1 = full ink, 0 = only the
 * outline left (the hollow verdict). `tone` 'muted' is the grey stamp (unknown, NOT EVIDENCE).
 */
export const Stamp: React.FC<{
  label: string | string[];
  size?: number;
  rot?: number;
  s?: Slam;
  fill?: number;
  tone?: StampTone;
  dashed?: boolean;
  mono?: boolean;
  style?: React.CSSProperties;
}> = ({ label, size = 48, rot = -8, s, fill = 1, tone = 'ink', dashed = false, mono = false, style }) => {
  const lines = Array.isArray(label) ? label : [label];
  const scale = s ? s.scale : 1;
  const opacity = s ? s.opacity : 1;
  const ink = tone === 'ink';
  const edge = ink ? alpha(C.text, 0.35 + 0.6 * fill) : alpha(C.muted, 0.9);
  const hollowEdge = alpha(C.muted, 0.85);
  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: `${size * 0.16}px ${size * 0.42}px`,
        borderRadius: size * 0.3,
        border: `${Math.max(4, size * 0.13)}px ${dashed ? 'dashed' : 'solid'} ${ink ? (fill > 0.02 ? edge : hollowEdge) : edge}`,
        background: ink
          ? `linear-gradient(135deg, ${alpha(C.accent, 0.92 * fill)}, ${alpha(C.accent2, 0.92 * fill)})`
          : alpha(C.bg0, 0.75),
        boxShadow: ink && fill > 0 ? `0 0 ${36 * fill}px ${alpha(C.accent, 0.55 * fill)}` : 'none',
        transform: `rotate(${rot}deg) scale(${scale})`,
        opacity,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {lines.map((l, i) => (
        <div
          key={i}
          style={{
            fontSize: size,
            fontWeight: mono ? 700 : 900,
            letterSpacing: mono ? '0.02em' : '0.06em',
            lineHeight: 1.1,
            textTransform: mono ? 'none' : 'uppercase',
            color: ink ? alpha(C.text, fill) : C.muted,
            WebkitTextStroke: ink && fill < 0.98 ? `2px ${alpha(C.muted, 0.9 * (1 - fill))}` : undefined,
          }}
        >
          {l}
        </div>
      ))}
    </div>
  );
};

/** "What it sees": a small window of flickering glyph noise, with its caption on top. */
export const NoiseWindow: React.FC<{
  w: number;
  h: number;
  t: number;
  label?: string;
  rows?: number;
  cols?: number;
  seed?: number;
  size?: number;
  glow?: number;
  style?: React.CSSProperties;
}> = ({ w, h, t, label = 'what it sees', rows = 2, cols = 14, seed = 0, size = 34, glow = 0, style }) => (
  <div
    style={{
      width: w,
      height: h,
      borderRadius: 22,
      background: alpha(C.bg0, 0.85),
      border: `2px solid ${alpha(C.accentText, 0.35 + 0.5 * glow)}`,
      boxShadow: `inset 0 0 30px ${alpha(C.accent, 0.18)}, 0 0 ${30 * glow}px ${alpha(C.accent, 0.5 * glow)}`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      overflow: 'hidden',
      ...style,
    }}
  >
    {label ? <div style={{ fontSize: 24, fontWeight: 700, color: C.muted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</div> : null}
    {Array.from({ length: rows }, (_, r) => (
      <div key={r} style={{ display: 'flex', fontSize: size, fontWeight: 700, color: alpha(C.accentText, 0.85), lineHeight: 1.1 }}>
        {Array.from({ length: cols }, (_, i) => (
          <span key={i} style={{ display: 'inline-block', width: size * 0.62, textAlign: 'center' }}>
            {noiseGlyph(i + r * 31, t, seed, 9)}
          </span>
        ))}
      </div>
    ))}
  </div>
);

/** The LLM judge: a rubber-stamp tool (knob, neck, base). `press` 0..1 pushes it down. */
export const StampTool: React.FC<{ size?: number; press?: number; lit?: number; style?: React.CSSProperties }> = ({ size = 120, press = 0, lit = 0, style }) => (
  <svg width={size} height={size * 1.05} viewBox="0 0 100 105" style={{ overflow: 'visible', transform: `translateY(${press * size * 0.12}px)`, ...style }}>
    <defs>
      <linearGradient id="tool-g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={C.accent} />
        <stop offset="1" stopColor={C.accent2} />
      </linearGradient>
    </defs>
    <circle cx="50" cy="18" r="16" fill={C.card} stroke={alpha(C.accentText, 0.6 + 0.4 * lit)} strokeWidth="4" />
    <rect x="41" y="32" width="18" height="34" rx="4" fill={C.card} stroke={alpha(C.accentText, 0.6 + 0.4 * lit)} strokeWidth="4" />
    <rect x="10" y="64" width="80" height="22" rx="6" fill={C.card} stroke={alpha(C.accentText, 0.6 + 0.4 * lit)} strokeWidth="4" />
    <rect x="16" y="88" width="68" height="12" rx="3" fill="url(#tool-g)" opacity={0.6 + 0.4 * lit} />
  </svg>
);

/** A sealed harmful request: blank card with a padlock. Never carries any text of a prompt. */
export const SealedCard: React.FC<{ w: number; h: number; glow?: number; tag?: string; style?: React.CSSProperties }> = ({ w, h, glow = 0, tag, style }) => (
  <div
    style={{
      width: w,
      height: h,
      borderRadius: 18,
      background: `repeating-linear-gradient(135deg, ${C.card} 0 16px, ${alpha(C.muted, 0.1)} 16px 32px)`,
      border: `2px solid ${alpha(C.muted, 0.5 + 0.4 * glow)}`,
      boxShadow: `0 14px 40px ${alpha('#000000', 0.45)}, 0 0 ${40 * glow}px ${alpha(C.accent, 0.6 * glow)}`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      ...style,
    }}
  >
    <Padlock size={Math.min(h * 0.42, 54)} />
    {tag ? <div style={{ fontSize: Math.min(26, h * 0.2), fontWeight: 700, color: C.muted, whiteSpace: 'nowrap' }}>{tag}</div> : null}
  </div>
);

export const Padlock: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <path d="M12 18 V12 a8 8 0 0 1 16 0 V18" fill="none" stroke={C.muted} strokeWidth="4" />
    <rect x="7" y="18" width="26" height="19" rx="4" fill={alpha(C.muted, 0.85)} />
    <circle cx="20" cy="27" r="3" fill={C.bg0} />
  </svg>
);

/** A reply drawn as redacted lines (its shape readable, its words never shown). */
export const RedactedBar: React.FC<{ w: number; h: number; lines?: number; label?: string; glow?: number; style?: React.CSSProperties }> = ({
  w,
  h,
  lines = 3,
  label,
  glow = 0,
  style,
}) => (
  <div
    style={{
      width: w,
      height: h,
      borderRadius: 18,
      background: C.card,
      border: `2px solid ${alpha(C.accentText, 0.35 + 0.5 * glow)}`,
      boxShadow: `0 14px 40px ${alpha('#000000', 0.45)}, 0 0 ${36 * glow}px ${alpha(C.accent, 0.55 * glow)}`,
      padding: '14px 22px',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: 12,
      ...style,
    }}
  >
    {label ? <div style={{ fontSize: 26, fontWeight: 700, color: C.accentText, whiteSpace: 'nowrap' }}>{label}</div> : null}
    {Array.from({ length: lines }, (_, i) => (
      <div key={i} style={{ display: 'flex', gap: 10 }}>
        {[0.34, 0.22, 0.28, 0.12].map((f, j) => (
          <div key={j} style={{ height: 16, width: `${(i === lines - 1 && j > 1 ? 0 : f) * 100}%`, borderRadius: 8, background: alpha(C.text, 0.82) }} />
        ))}
      </div>
    ))}
  </div>
);

/** A line of glyph noise in a card (a reply after being run back through the cipher). */
export const NoiseBar: React.FC<{ w: number; h: number; t: number; seed?: number; cols?: number; rows?: number; size?: number; style?: React.CSSProperties }> = ({
  w,
  h,
  t,
  seed = 3,
  cols = 16,
  rows = 2,
  size = 34,
  style,
}) => <NoiseWindow w={w} h={h} t={t} label="" rows={rows} cols={cols} seed={seed} size={size} style={{ background: C.card, ...style }} />;

/** The content-filter gate (striped bar on two posts, as in the ciphers video). */
export const FilterGate: React.FC<{ w: number; h?: number; t: number; flash?: number; post?: number; label?: string }> = ({ w, h = 64, t, flash = 0, post = 0, label = 'content filter' }) => {
  const breathe = 0.5 + 0.5 * Math.sin(t * 4);
  return (
    <div style={{ position: 'relative', width: w, height: h }}>
      {post > 0 && (
        <>
          <div style={{ position: 'absolute', left: 8, top: h - 4, width: 12, height: post, background: alpha(C.muted, 0.6), borderRadius: 4 }} />
          <div style={{ position: 'absolute', right: 8, top: h - 4, width: 12, height: post, background: alpha(C.muted, 0.6), borderRadius: 4 }} />
        </>
      )}
      <div
        style={{
          height: h,
          borderRadius: 14,
          background: `repeating-linear-gradient(135deg, ${alpha(C.text, 0.9)} 0 22px, ${alpha(C.accent, 0.9)} 22px 44px)`,
          border: `3px solid ${C.text}`,
          boxShadow: `0 0 ${40 + 30 * breathe + 60 * flash}px ${alpha(C.accent, 0.5 + 0.3 * breathe)}`,
        }}
      />
      <div style={{ position: 'absolute', top: -60, width: '100%', display: 'flex', justifyContent: 'center' }}>
        <div style={{ padding: '7px 20px', borderRadius: 999, background: alpha(C.bg0, 0.85), border: `2px solid ${alpha(C.accentText, 0.8)}`, fontSize: 30, fontWeight: 700, color: C.text, whiteSpace: 'nowrap' }}>
          {label}
        </div>
      </div>
    </div>
  );
};

/** A drawn banana in the brand palette (outline + gradient), ~size px wide. */
export const Banana: React.FC<{ size: number; style?: React.CSSProperties }> = ({ size, style }) => (
  <svg width={size} height={size * 0.8} viewBox="0 0 100 80" style={{ overflow: 'visible', ...style }}>
    <defs>
      <linearGradient id="banana-g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={C.accentText} />
        <stop offset="1" stopColor={C.accent2} />
      </linearGradient>
    </defs>
    <path d="M8 22 C 18 62, 70 74, 94 40 C 80 52, 36 54, 20 18 Z" fill="url(#banana-g)" stroke={C.text} strokeWidth="3.5" strokeLinejoin="round" />
    <path d="M8 22 L 4 12 L 14 10 L 20 18" fill={C.card} stroke={C.text} strokeWidth="3.5" strokeLinejoin="round" />
    <path d="M30 40 C 44 52, 64 54, 82 46" fill="none" stroke={alpha(C.text, 0.5)} strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

export { GRADIENT };
