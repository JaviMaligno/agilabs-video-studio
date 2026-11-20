// Drawing pieces of the shoe-shop world for ShopChat, FourDoors and FlatLine: the landscape-first
// canvas (scaled into the vertical stage for the 9:16 cut), the policy card, the doors, the price
// tag, the quiz buttons and the training banner. The book and its sticky note come from book.tsx.
// SVG in landscape frame pixels (1920x1080), brand tokens only.
import React from 'react';
import { C, alpha } from '../brand.ts';
import { Canvas } from './Canvas.tsx';
import { fitInto, stageBox } from './canvas.ts';
import { Badge, Crack, edge, glow } from './office.tsx';

const cl = (x: number) => (Number.isFinite(x) ? Math.min(1, Math.max(0, x)) : 0);

/** The policy, exactly as the script writes it. */
export const POLICY = 'Returns: 30 days, unworn, in the box';

/**
 * A full-frame canvas drawn in landscape pixels. In the vertical cut the landscape stage is fitted
 * (scaled, centred) into the vertical stage, so the 9:16 render never crashes or overflows.
 */
export const ShopCanvas: React.FC<{ vertical: boolean; children: React.ReactNode }> = ({ vertical, children }) =>
  vertical ? (
    <Canvas vertical design="both">
      <g transform={fitInto(stageBox(false), stageBox(true)).transform}>{children}</g>
    </Canvas>
  ) : (
    <Canvas vertical={false}>{children}</Canvas>
  );

/** A small shoebox (the shop's logo), centred on (x, y), `w` wide. */
export const Shoebox: React.FC<{ x: number; y: number; w: number }> = ({ x, y, w }) => {
  const h = w * 0.55;
  return (
    <g transform={`translate(${x - w / 2} ${y - h / 2})`}>
      <rect x={0} y={h * 0.28} width={w} height={h * 0.72} rx={w * 0.05} fill={C.warm} stroke={C.bg0} strokeWidth={2} />
      <rect x={-w * 0.05} y={0} width={w * 1.1} height={h * 0.32} rx={w * 0.05} fill={alpha(C.warm, 0.85)} stroke={C.bg0} strokeWidth={2} />
      {/* a shoe drawn on the side */}
      <path
        d={`M ${w * 0.2} ${h * 0.8} L ${w * 0.2} ${h * 0.5} L ${w * 0.4} ${h * 0.5} Q ${w * 0.5} ${h * 0.66} ${w * 0.78} ${h * 0.68} Q ${w * 0.84} ${h * 0.8} ${w * 0.78} ${h * 0.8} Z`}
        fill={C.bg0}
        opacity={0.75}
      />
    </g>
  );
};

/** The policy card: shoebox logo and the policy in two lines; `days` swaps "30" for another figure. */
export const PolicyCard: React.FC<{ x: number; y: number; w?: number; lit?: number; opacity?: number }> = ({ x, y, w = 420, lit = 0, opacity = 1 }) => {
  if (opacity <= 0) return null;
  const h = w * 0.36;
  const size = Math.min(32, w * 0.072);
  return (
    <g opacity={cl(opacity)} style={glow(C.ok, lit)}>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={16} fill={C.text} stroke={lit > 0.01 ? C.ok : alpha(C.warm, 0.9)} strokeWidth={4 + 3 * cl(lit)} />
      {/* the amber band along the top: the same card as in the other chapters (note.tsx, book.tsx) */}
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h * 0.12} rx={12} fill={C.warm} />
      <Shoebox x={x - w / 2 + w * 0.13} y={y} w={w * 0.16} />
      <text x={x - w / 2 + w * 0.26} y={y - size * 0.25} fontSize={size} fontWeight={800} fill={C.bg0}>
        Returns: 30 days,
      </text>
      <text x={x - w / 2 + w * 0.26} y={y + size * 1.0} fontSize={size} fontWeight={800} fill={C.bg0}>
        unworn, in the box
      </text>
    </g>
  );
};

/** The four doors' icons, shown once they are labelled. */
export type DoorIcon = 'note' | 'binder' | 'pen' | 'sheet';

/** A small icon centred on (x, y), `s` wide. */
const DoorBadge: React.FC<{ x: number; y: number; s: number; icon: DoorIcon; opacity: number }> = ({ x, y, s, icon, opacity }) => {
  if (opacity <= 0) return null;
  return (
    <g opacity={cl(opacity)} transform={`translate(${x} ${y})`}>
      <circle r={s * 0.62} fill={C.bg1} stroke={alpha(C.accentText, 0.7)} strokeWidth={3} />
      {icon === 'note' && (
        <g transform="rotate(-6)">
          <rect x={-s * 0.32} y={-s * 0.3} width={s * 0.64} height={s * 0.6} rx={3} fill={C.warm} />
          {[0, 1, 2].map((i) => (
            <rect key={i} x={-s * 0.24} y={-s * 0.16 + i * s * 0.15} width={s * (i === 2 ? 0.3 : 0.48)} height={4} rx={2} fill={alpha(C.bg0, 0.6)} />
          ))}
        </g>
      )}
      {icon === 'binder' && (
        <g>
          <rect x={-s * 0.3} y={-s * 0.36} width={s * 0.6} height={s * 0.72} rx={5} fill={C.accent} />
          <rect x={-s * 0.12} y={-s * 0.24} width={s * 0.36} height={s * 0.14} rx={2} fill={C.text} />
          <rect x={-s * 0.3} y={-s * 0.36} width={s * 0.14} height={s * 0.72} fill={alpha(C.bg0, 0.3)} />
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={-s * 0.23} cy={-s * 0.22 + i * s * 0.22} r={3} fill={C.text} />
          ))}
          <rect x={s * 0.3} y={-s * 0.1} width={s * 0.1} height={s * 0.18} rx={2} fill={C.warm} />
        </g>
      )}
      {(icon === 'pen' || icon === 'sheet') && (
        <g>
          <rect x={-s * 0.34} y={-s * 0.24} width={s * 0.68} height={s * 0.5} rx={4} fill={C.accent} />
          <rect x={-s * 0.3} y={-s * 0.2} width={s * 0.6} height={s * 0.42} rx={2} fill={C.text} />
          <line x1={0} y1={-s * 0.2} x2={0} y2={s * 0.22} stroke={alpha(C.bg0, 0.4)} strokeWidth={2} />
          {icon === 'pen' ? (
            <path d={`M ${s * 0.36} ${-s * 0.42} L ${-s * 0.02} ${s * 0.04} L ${-s * 0.08} ${s * 0.14} L ${s * 0.04} ${s * 0.1} L ${s * 0.42} ${-s * 0.36} Z`} fill={C.marker} stroke={C.bg0} strokeWidth={1.5} />
          ) : (
            <rect x={-s * 0.4} y={-s * 0.32} width={s * 0.62} height={s * 0.5} rx={3} fill={alpha(C.accentText, 0.35)} stroke={C.accentText} strokeWidth={2.5} transform="rotate(-8)" />
          )}
        </g>
      )}
    </g>
  );
};

/** A price tag hanging from a string, its top at (x, y). */
export const PriceTag: React.FC<{ x: number; y: number; text: string; size?: number; p: number; swing?: number }> = ({ x, y, text, size = 34, p, swing = 0 }) => {
  const a = cl(p);
  if (a <= 0) return null;
  const w = text.length * size * 0.62 + size * 1.4;
  const h = size * 1.6;
  const drop = 40;
  return (
    <g opacity={Math.min(1, a * 1.4)} transform={`translate(${x} ${y}) rotate(${swing}) scale(${0.6 + 0.4 * a})`} style={glow(C.ok, 0.5 * a)}>
      <line x1={0} y1={0} x2={0} y2={drop} stroke={C.text} strokeWidth={3} />
      <path d={`M 0 ${drop} L ${w * 0.18} ${drop + h * 0.2} H ${w / 2} V ${drop + h * 1.2} H ${-w / 2} V ${drop + h * 0.2} H ${-w * 0.18} Z`} fill={C.ok} stroke={C.bg0} strokeWidth={2} />
      <circle cx={0} cy={drop + h * 0.22} r={5} fill={C.bg0} />
      <text x={0} y={drop + h * 0.86} textAnchor="middle" fontSize={size} fontWeight={800} fill={C.bg0}>
        {text}
      </text>
    </g>
  );
};

/**
 * A closed door standing on the floor: (x, floor) is the bottom centre. `open` swings the leaf
 * (a warm light spills out of the gap), `crack` draws a rose crack across the leaf, `lit` / `glowA`
 * light the frame.
 */
export const Door: React.FC<{
  x: number;
  floor: number;
  w: number;
  h: number;
  appear?: number;
  lit?: number;
  glowA?: number;
  open?: number;
  crack?: number;
  icon?: DoorIcon;
  iconOn?: number;
  /** Height of the icon on the leaf, as a fraction from its top. */
  iconY?: number;
  color?: string;
}> = ({ x, floor, w, h, appear = 1, lit = 0, glowA = 0, open = 0, crack = 0, icon, iconOn = 0, iconY = 0.25, color = C.accentText }) => {
  const a = cl(appear);
  if (a <= 0) return null;
  const L = x - w / 2;
  const T = floor - h;
  const f = 12;
  const inner = { x: L + f, y: T + f, w: w - 2 * f, h: h - f };
  const o = cl(open);
  const leafW = inner.w * (1 - 0.55 * o);
  const s = 0.4 + 0.6 * a;
  return (
    <g opacity={a} transform={`translate(${x} ${floor}) scale(${s}) translate(${-x} ${-floor})`}>
      <g style={glow(color, glowA)}>
        <rect x={L} y={T} width={w} height={h} rx={10} fill={C.bg1} stroke={alpha(color, 0.45 + 0.55 * cl(lit))} strokeWidth={6 + 3 * cl(lit)} />
      </g>
      {/* light through the gap as the door opens */}
      {o > 0 && <rect x={inner.x} y={inner.y} width={inner.w} height={inner.h} fill={alpha(C.warm, 0.25 + 0.5 * o)} />}
      {/* the leaf, hinged on the left */}
      <rect x={inner.x} y={inner.y} width={leafW} height={inner.h} rx={6} fill={C.card} stroke={alpha(color, 0.35 + 0.5 * cl(lit))} strokeWidth={3} />
      <rect x={inner.x + leafW * 0.14} y={inner.y + inner.h * 0.07} width={leafW * 0.72} height={inner.h * 0.36} rx={6} fill="none" stroke={alpha(C.muted, 0.35)} strokeWidth={3} />
      <rect x={inner.x + leafW * 0.14} y={inner.y + inner.h * 0.5} width={leafW * 0.72} height={inner.h * 0.42} rx={6} fill="none" stroke={alpha(C.muted, 0.35)} strokeWidth={3} />
      <circle cx={inner.x + leafW * 0.86} cy={inner.y + inner.h * 0.5} r={Math.max(7, w * 0.04)} fill={C.warm} />
      <Crack x={inner.x + leafW * 0.08} y={inner.y + inner.h * 0.04} w={leafW * 0.84} h={inner.h * 0.9} p={crack} />
      {icon && <DoorBadge x={inner.x + leafW / 2} y={inner.y + inner.h * iconY} s={Math.min(84, w * 0.5)} icon={icon} opacity={iconOn} />}
    </g>
  );
};

/** Where a door's knob is (for hanging a tag on it). */
export const doorKnob = (x: number, floor: number, w: number, h: number) => ({ x: x - w / 2 + 12 + (w - 24) * 0.86, y: floor - h + 12 + (h - 12) * 0.5 });

/** One quiz answer button: a rounded key with its letter and a glow level `lit`. */
export const AnswerButton: React.FC<{ x: number; y: number; w: number; h: number; letter: string; lit: number }> = ({ x, y, w, h, letter, lit }) => (
  <g style={glow(C.warm, 0.6 * cl(lit))}>
    <rect x={x} y={y} width={w} height={h} rx={h * 0.3} fill={alpha(C.warm, 0.1 + 0.55 * cl(lit))} stroke={alpha(C.warm, 0.4 + 0.6 * cl(lit))} strokeWidth={4} />
    <text x={x + h * 0.5} y={y + h * 0.66} textAnchor="middle" fontSize={h * 0.5} fontWeight={800} fill={C.text}>
      {letter}
    </text>
    <rect x={x + h} y={y + h * 0.42} width={(w - h * 1.3) * (0.3 + 0.7 * cl(lit))} height={h * 0.16} rx={h * 0.08} fill={alpha(C.text, 0.35 + 0.5 * cl(lit))} />
  </g>
);

/** A banner (rounded strip) with a progress fill and an optional tick badge. */
export const Banner: React.FC<{ x: number; y: number; w: number; h: number; fill: number; text: string; done: number; size?: number }> = ({ x, y, w, h, fill, text, done, size = 40 }) => {
  const d = cl(done);
  return (
    <g style={glow(C.ok, 0.7 * d)}>
      <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={C.card} stroke={d > 0.01 ? C.ok : alpha(C.accentText, 0.6)} strokeWidth={4} />
      <rect x={x + 6} y={y + 6} width={Math.max(0, (w - 12) * cl(fill))} height={h - 12} rx={(h - 12) / 2} fill={alpha(d > 0.5 ? C.ok : C.accent, 0.45 + 0.3 * d)} />
      <text x={x + w / 2 - (d > 0 ? h * 0.35 : 0)} y={y + h / 2 + size * 0.36} textAnchor="middle" fontSize={size} fontWeight={800} fill={C.text}>
        {text}
      </text>
      {d > 0 && <Badge x={x + w - h * 0.62} y={y + h / 2} r={h * 0.34} kind="tick" pop={d} />}
    </g>
  );
};

export { edge };
