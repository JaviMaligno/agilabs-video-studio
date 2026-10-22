// Drawing pieces shared by ExamBridge, PilotGrid and WorkerRace: stamps, chips, a person, a tick,
// a clock, a pause sign. Brand tokens only, Inter.
import React from 'react';
import { C, GRADIENT, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';

export const clamp01 = (x: number) => (Number.isFinite(x) ? Math.min(1, Math.max(0, x)) : 0);

/** A rubber stamp centred on (x, y): it lands big and settles. */
export const Stamp: React.FC<{ x: number; y: number; text: React.ReactNode; color: string; pop: number; rotate?: number; size?: number; fill?: string }> = ({
  x,
  y,
  text,
  color,
  pop,
  rotate = -6,
  size = 52,
  fill,
}) =>
  pop <= 0 ? null : (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) rotate(${rotate}deg) scale(${1.7 - 0.7 * clamp01(pop)})`,
        opacity: clamp01(pop * 1.6),
        padding: `${Math.round(size * 0.1)}px ${Math.round(size * 0.4)}px`,
        border: `${Math.max(5, Math.round(size * 0.12))}px solid ${color}`,
        borderRadius: 16,
        color,
        background: fill ?? alpha(C.bg0, 0.92),
        fontFamily,
        fontSize: size,
        fontWeight: 800,
        letterSpacing: '0.04em',
        whiteSpace: 'nowrap',
        boxShadow: `0 12px 40px ${alpha(C.bg0, 0.7)}`,
        zIndex: 20,
      }}
    >
      {text}
    </div>
  );

/** A model or source chip: a pill, solid in the accent gradient or outlined. */
export const Chip: React.FC<{ text: string; size?: number; solid?: boolean; color?: string; style?: React.CSSProperties }> = ({ text, size = 30, solid = true, color, style }) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: `${Math.round(size * 0.22)}px ${Math.round(size * 0.6)}px`,
      borderRadius: 999,
      background: solid ? (color ?? GRADIENT) : alpha(C.bg1, 0.9),
      border: solid ? 'none' : `3px solid ${color ?? C.accentText}`,
      color: solid ? C.text : (color ?? C.accentText),
      fontFamily,
      fontSize: size,
      fontWeight: 800,
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    {text}
  </div>
);

/** A small person: head and shoulders. */
export const Person: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={{ display: 'block' }}>
    <circle cx={20} cy={13} r={8} fill={color} />
    <path d="M5 38 C5 26 35 26 35 38 Z" fill={color} />
  </svg>
);

export const Tick: React.FC<{ size: number; color?: string }> = ({ size, color = C.ok }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block', flex: 'none' }}>
    <path d="M4 12.5 L9.5 18 L20 6.5" fill="none" stroke={color} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** A clock face; `turn` is the hand's position in turns (0..1). */
export const Clock: React.FC<{ size: number; color: string; turn?: number; stopwatch?: boolean }> = ({ size, color, turn = 0.1, stopwatch }) => {
  const a = 2 * Math.PI * turn - Math.PI / 2;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" style={{ display: 'block', flex: 'none' }}>
      {stopwatch && <rect x={20} y={1} width={8} height={6} rx={2} fill={color} />}
      <circle cx={24} cy={27} r={18} fill={alpha(C.bg0, 0.9)} stroke={color} strokeWidth={4} />
      <line x1={24} y1={27} x2={24 + 13 * Math.cos(a)} y2={27 + 13 * Math.sin(a)} stroke={color} strokeWidth={3.6} strokeLinecap="round" />
      <circle cx={24} cy={27} r={2.6} fill={color} />
    </svg>
  );
};

export const Pause: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block', flex: 'none' }}>
    <rect x={5} y={4} width={5} height={16} rx={1.5} fill={color} />
    <rect x={14} y={4} width={5} height={16} rx={1.5} fill={color} />
  </svg>
);
