import React from 'react';
import { C, alpha } from '../brand.ts';

export const MONO = 'Menlo, "SF Mono", ui-monospace, monospace';

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

/** The agent: a rounded head with two eyes and an antenna. */
export const AgentIcon: React.FC<{ size: number; color?: string }> = ({ size, color = C.accentText }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" style={{ flex: 'none' }}>
    <line x1={24} y1={4} x2={24} y2={11} stroke={color} strokeWidth={3} strokeLinecap="round" />
    <circle cx={24} cy={4} r={3} fill={color} />
    <rect x={7} y={11} width={34} height={28} rx={9} fill={alpha(color, 0.18)} stroke={color} strokeWidth={3} />
    <circle cx={18} cy={25} r={3.6} fill={color} />
    <circle cx={30} cy={25} r={3.6} fill={color} />
    <path d="M14 44 h20" stroke={color} strokeWidth={3} strokeLinecap="round" />
  </svg>
);

/** A person: head and shoulders. */
export const PersonIcon: React.FC<{ size: number; color?: string }> = ({ size, color = C.muted }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" style={{ flex: 'none' }}>
    <circle cx={24} cy={15} r={9} fill={alpha(color, 0.25)} stroke={color} strokeWidth={3} />
    <path d="M8 44 C8 32 15 27 24 27 C33 27 40 32 40 44" fill={alpha(color, 0.25)} stroke={color} strokeWidth={3} strokeLinejoin="round" />
  </svg>
);

/** A small bug (the planted fault). */
export const BugIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ flex: 'none' }}>
    <ellipse cx={12} cy={14} rx={5.5} ry={7} fill={color} />
    <circle cx={12} cy={6} r={3} fill={color} />
    <path d="M6.5 11 L2.5 9 M6.5 15 L2.5 15 M6.5 19 L3 21 M17.5 11 L21.5 9 M17.5 15 L21.5 15 M17.5 19 L21 21" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </svg>
);

/** A stamp: bordered uppercase word, popping in rotated. */
export const Stamp: React.FC<{ text: string; color: string; pop: number; size?: number; rotate?: number; style?: React.CSSProperties }> = ({
  text,
  color,
  pop,
  size = 58,
  rotate = -8,
  style,
}) =>
  pop <= 0 ? null : (
    <div
      style={{
        position: 'absolute',
        padding: '4px 20px',
        border: `7px solid ${color}`,
        borderRadius: 14,
        color,
        background: alpha(C.bg0, 0.92),
        fontSize: size,
        fontWeight: 800,
        letterSpacing: '0.07em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        lineHeight: 1.1,
        opacity: Math.min(1, pop * 1.4),
        transform: `rotate(${rotate}deg) scale(${1.8 - 0.8 * pop})`,
        ...style,
      }}
    >
      {text}
    </div>
  );
