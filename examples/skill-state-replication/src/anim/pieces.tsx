import React from 'react';
import { C, alpha } from '../brand.ts';

/** A check mark or a cross. */
export const Mark: React.FC<{ size: number; color: string; cross?: boolean }> = ({ size, color, cross }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ flex: 'none' }}>
    {cross ? (
      <path d="M6 6 L18 18 M18 6 L6 18" stroke={color} strokeWidth={3.4} strokeLinecap="round" />
    ) : (
      <path d="M4.5 12.5 L10 18 L19.5 6.5" fill="none" stroke={color} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" />
    )}
  </svg>
);

/** A pen, nib at the bottom left (place its box so the nib touches the writing point). */
export const Pen: React.FC<{ size: number; color?: string }> = ({ size, color = C.text }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ flex: 'none' }}>
    <path d="M3 21 L5 15 L17 3 L21 7 L9 19 Z" fill={alpha(color, 0.92)} stroke={C.bg0} strokeWidth={1.2} strokeLinejoin="round" />
    <path d="M3 21 L5 15 L9 19 Z" fill={C.warm} />
  </svg>
);

/** A rubber stamp: bordered uppercase text that lands from big to its size. */
export const Stamp: React.FC<{
  text: string;
  pop: number;
  color: string;
  size: number;
  left: number;
  top: number;
  rotate?: number;
  gradient?: boolean;
  width?: number;
}> = ({ text, pop, color, size, left, top, rotate = -7, gradient, width }) => {
  if (pop <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        width,
        boxSizing: 'border-box',
        textAlign: 'center',
        padding: '6px 26px',
        border: `7px solid ${color}`,
        borderRadius: 16,
        color,
        background: alpha(C.bg0, 0.9),
        fontSize: size,
        fontWeight: 800,
        letterSpacing: '0.06em',
        lineHeight: 1.1,
        whiteSpace: 'nowrap',
        opacity: Math.min(1, pop * 1.4),
        transform: `rotate(${rotate}deg) scale(${1.8 - 0.8 * pop})`,
        boxShadow: gradient ? `0 0 40px ${alpha(C.accent, 0.5)}` : 'none',
      }}
    >
      {gradient ? (
        <span
          style={{
            backgroundImage: `linear-gradient(135deg, ${C.accentText}, ${C.accent2})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {text}
        </span>
      ) : (
        text
      )}
    </div>
  );
};

/** A small rounded label. */
export const Chip: React.FC<{ text: string; color?: string; size?: number; style?: React.CSSProperties }> = ({ text, color = C.accentText, size = 30, style }) => (
  <div
    style={{
      display: 'inline-block',
      padding: '8px 22px',
      borderRadius: 999,
      border: `3px solid ${alpha(color, 0.75)}`,
      background: alpha(color, 0.12),
      color,
      fontSize: size,
      fontWeight: 800,
      whiteSpace: 'nowrap',
      lineHeight: 1.15,
      ...style,
    }}
  >
    {text}
  </div>
);
