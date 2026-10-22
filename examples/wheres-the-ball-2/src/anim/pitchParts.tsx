// Drawing pieces shared by the pitch scenes (from part 1): markings, the pulsing "?", the frontier
// AI crosshair markers, a scene chip, a tick. Brand tokens only.
import React from 'react';
import { C, GRADIENT, alpha } from '../brand.ts';
import { gradientText } from './Stage.tsx';

/** Pitch markings in metres (105 x 68), drawn inside an SVG whose viewBox is in metres. */
export const Markings: React.FC<{ sw: number; opacity?: number }> = ({ sw, opacity = 1 }) => {
  const line = { fill: 'none', stroke: alpha(C.muted, 0.42), strokeWidth: sw } as const;
  return (
    <g opacity={opacity}>
      {Array.from({ length: 15 }, (_, i) => (
        <rect key={i} x={i * 7} y={0} width={7} height={68} fill={i % 2 ? alpha(C.card, 0.55) : 'transparent'} />
      ))}
      <rect x={0} y={0} width={105} height={68} {...line} />
      <line x1={52.5} y1={0} x2={52.5} y2={68} {...line} />
      <circle cx={52.5} cy={34} r={9.15} {...line} />
      <circle cx={52.5} cy={34} r={0.5} fill={alpha(C.muted, 0.42)} />
      {[0, 105].map((gx) => {
        const dir = gx === 0 ? 1 : -1;
        const box = (depth: number, half: number) => <rect x={gx === 0 ? 0 : 105 - depth} y={34 - half} width={depth} height={2 * half} {...line} />;
        return (
          <g key={gx}>
            {box(16.5, 20.16)}
            {box(5.5, 9.16)}
            <circle cx={gx + dir * 11} cy={34} r={0.45} fill={alpha(C.muted, 0.42)} />
            <rect x={gx === 0 ? -2 : 105} y={30.34} width={2} height={7.32} fill="none" stroke={alpha(C.text, 0.6)} strokeWidth={sw} />
          </g>
        );
      })}
    </g>
  );
};

/** The series' pulsing "?" marker, `size` px across, centred on its position. */
export const QMark: React.FC<{ x: number; y: number; size: number; pulse: number; opacity: number; scale?: number }> = ({ x, y, size, pulse, opacity, scale = 1 }) =>
  opacity > 0 ? (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${scale * (1 + 0.08 * pulse)})`,
        opacity,
        width: size,
        height: size,
        borderRadius: size / 2,
        background: alpha(C.bg0, 0.78),
        border: `${Math.max(4, size * 0.04)}px solid ${C.accentText}`,
        boxShadow: `0 0 ${30 + 40 * pulse}px ${alpha(C.accent, 0.4 + 0.4 * pulse)}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span style={{ fontSize: size * 0.76, fontWeight: 800, lineHeight: 1, ...gradientText }}>?</span>
    </div>
  ) : null;

/** A frontier AI guess: grey crosshair with its name above (part 1's marker). */
export const GuessMarker: React.FC<{ x: number; y: number; label: string; opacity: number; size?: number; labelSide?: 'up' | 'left' | 'right' }> = ({
  x,
  y,
  label,
  opacity,
  size = 72,
  labelSide = 'up',
}) =>
  opacity > 0 ? (
    <div style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)', opacity, width: size, height: size }}>
      <div
        style={{
          position: 'absolute',
          ...(labelSide === 'up'
            ? { bottom: size * 0.66, left: '50%', transform: 'translateX(-50%)' }
            : labelSide === 'left'
              ? { right: size * 0.62, bottom: size * 0.55 }
              : { left: size * 0.62, top: size * 0.55 }),
          padding: '4px 14px',
          borderRadius: 12,
          background: alpha(C.bg0, 0.88),
          border: `2px solid ${alpha(C.muted, 0.55)}`,
          fontSize: 34,
          fontWeight: 700,
          color: C.muted,
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </div>
      <svg width={size} height={size} viewBox="-36 -36 72 72">
        <circle r={26} fill={alpha(C.muted, 0.14)} stroke={C.muted} strokeWidth={5} />
        <line x1={-34} y1={0} x2={-14} y2={0} stroke={C.muted} strokeWidth={5} />
        <line x1={14} y1={0} x2={34} y2={0} stroke={C.muted} strokeWidth={5} />
        <line x1={0} y1={-34} x2={0} y2={-14} stroke={C.muted} strokeWidth={5} />
        <line x1={0} y1={14} x2={0} y2={34} stroke={C.muted} strokeWidth={5} />
      </svg>
    </div>
  ) : null;

/** The scene chip: a pill with a gradient dot, as in part 1. */
export const Chip: React.FC<{ text: string; opacity: number; size?: number; style?: React.CSSProperties }> = ({ text, opacity, size = 44, style }) =>
  opacity > 0 ? (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size * 0.4,
        padding: `${size * 0.3}px ${size * 0.68}px`,
        borderRadius: 999,
        background: alpha(C.card, 0.92),
        border: `2px solid ${alpha(C.accentText, 0.45)}`,
        fontSize: size,
        fontWeight: 700,
        color: C.text,
        whiteSpace: 'nowrap',
        opacity,
        ...style,
      }}
    >
      <span style={{ width: size * 0.4, height: size * 0.4, borderRadius: size, background: GRADIENT, display: 'inline-block', flex: 'none' }} />
      {text}
    </div>
  ) : null;

/** A check mark drawn along its path (`draw` 0..1). */
export const Tick: React.FC<{ size: number; draw?: number; color?: string; stroke?: number }> = ({ size, draw = 1, color = C.text, stroke = 3.4 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block', flex: 'none' }}>
    <path
      d="M4 12.5 L9.5 18 L20 6.5"
      fill="none"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={1 - Math.min(1, Math.max(0, draw))}
    />
  </svg>
);

/** A cross mark (failure), muted. */
export const Cross: React.FC<{ size: number; color?: string; stroke?: number }> = ({ size, color = C.muted, stroke = 3.2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block', flex: 'none' }}>
    <path d="M6 6 L18 18 M18 6 L6 18" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" />
  </svg>
);
