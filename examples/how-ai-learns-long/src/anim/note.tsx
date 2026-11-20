// Drawings of the "two roads" and "the prompt" scenes (TwoRoads, BriefingNote): the note (the
// prompt), the policy line with its "30" that gets struck for "14", the binder, the open book with a
// pen, doors, signs, the shop assistant, shoe boxes and product cards, and generic app panels.
// SVG in frame pixels, brand tokens only. Shared drawings of other scenes live in office.tsx/chat.tsx.
import React from 'react';
import { C, alpha } from '../brand.ts';
import { edge, glow } from './office.tsx';

const cl = (x: number) => (Number.isFinite(x) ? Math.min(1, Math.max(0, x)) : 0);

/** Rough advance of Inter bold characters, in em, for laying out a strike over one word. */
const ADV: Record<string, number> = { ' ': 0.27, ':': 0.29, ',': 0.27, '.': 0.27, i: 0.28, l: 0.28, t: 0.37, r: 0.42, f: 0.38, j: 0.28, I: 0.3, m: 0.9, w: 0.82, W: 1.0, M: 0.92 };
export const textW = (s: string, size: number): number => {
  let w = 0;
  for (const ch of s) w += ADV[ch] ?? (/[0-9]/.test(ch) ? 0.62 : /[A-Z]/.test(ch) ? 0.68 : 0.58);
  return w * size;
};

/** "Returns: 30 days, unworn, in the box" with the "30" struck (rose) and "14" handwritten (amber). */
export const PolicyText: React.FC<{
  x: number;
  y: number;
  size: number;
  /** One line, or two ("Returns: 30 days," / "unworn, in the box"). */
  lines?: 1 | 2;
  strike?: number;
  write?: number;
  fill?: string;
  opacity?: number;
  /** "middle" centres each line on x. */
  anchor?: 'start' | 'middle';
  /** Only "Returns: 30 days". */
  short?: boolean;
}> = ({ x, y, size, lines = 1, strike = 0, write = 0, fill = C.bg0, opacity = 1, anchor = 'start', short = false }) => {
  if (opacity <= 0) return null;
  const pre = 'Returns: ';
  const num = '30';
  const post1 = short ? ' days' : lines === 2 ? ' days,' : ' days, unworn, in the box';
  const line1W = textW(pre + num + post1, size);
  const x0 = anchor === 'middle' ? x - line1W / 2 : x;
  const nx = x0 + textW(pre, size);
  const nw = textW(num, size);
  const s = cl(strike);
  const wr = cl(write);
  const line2 = 'unworn, in the box';
  return (
    <g opacity={cl(opacity)}>
      <text x={x0} y={y} fontSize={size} fontWeight={800} fill={fill}>
        {pre}
        <tspan fill={s > 0.5 ? alpha(C.marker, 0.9) : fill}>{num}</tspan>
        {post1}
      </text>
      {lines === 2 && !short && (
        <text x={anchor === 'middle' ? x - textW(line2, size) / 2 : x} y={y + size * 1.25} fontSize={size} fontWeight={800} fill={fill}>
          {line2}
        </text>
      )}
      {s > 0 && (
        <line x1={nx - size * 0.08} y1={y - size * 0.32} x2={nx - size * 0.08 + (nw + size * 0.16) * s} y2={y - size * 0.32} stroke={C.marker} strokeWidth={size * 0.13} strokeLinecap="round" />
      )}
      {wr > 0 && (
        <g transform={`translate(${nx + nw / 2} ${y - size * 1.02}) rotate(-6)`}>
          <text x={0} y={0} textAnchor="middle" fontSize={size * 1.05} fontWeight={800} fontStyle="italic" fill={C.warm} stroke={alpha(C.bg0, 0.55)} strokeWidth={size * 0.05} paintOrder="stroke" opacity={Math.min(1, wr * 2)}>
            {'14'.slice(0, Math.max(1, Math.ceil(2 * wr)))}
          </text>
          {/* the pen stroke underneath the new number */}
          <path d={`M ${-size * 0.6} ${size * 0.2} q ${size * 0.6} ${size * 0.16} ${size * 1.2 * wr} 0`} fill="none" stroke={C.warm} strokeWidth={size * 0.07} strokeLinecap="round" />
        </g>
      )}
    </g>
  );
};

/** The policy card on its own (the shop's card): two lines on a cream card with a shoe logo. */
export const PolicyCard: React.FC<{ x: number; y: number; w: number; opacity?: number; strike?: number; write?: number; glowA?: number; rot?: number }> = ({
  x,
  y,
  w,
  opacity = 1,
  strike = 0,
  write = 0,
  glowA = 0,
  rot = 0,
}) => {
  if (opacity <= 0) return null;
  const h = w * 0.36;
  const size = w * 0.078;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={cl(opacity)} style={glow(C.warm, glowA)}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={w * 0.03} fill={C.text} stroke={alpha(C.warm, 0.9)} strokeWidth={5} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h * 0.12} rx={w * 0.03} fill={C.warm} />
      <ShoeBoxLogo x={-w / 2 + w * 0.1} y={h * 0.05} s={w / 600} />
      <PolicyText x={-w / 2 + w * 0.2} y={-h / 2 + h * 0.52} size={size} lines={2} strike={strike} write={write} />
    </g>
  );
};

/** The shop's logo: a little shoe box with a shoe on the lid. Centred on (x, y), about 80·s wide. */
export const ShoeBoxLogo: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-40} y={-14} width={80} height={44} rx={5} fill={alpha(C.warm, 0.85)} stroke={alpha(C.bg0, 0.6)} strokeWidth={3} />
    <rect x={-44} y={-24} width={88} height={14} rx={4} fill={C.warm} stroke={alpha(C.bg0, 0.6)} strokeWidth={3} />
    <Shoe x={0} y={10} w={50} color={C.bg0} />
  </g>
);

/** A sneaker silhouette centred on (x, y), `w` wide. */
export const Shoe: React.FC<{ x: number; y: number; w: number; color?: string; sole?: string }> = ({ x, y, w, color = C.accent, sole = C.text }) => {
  const s = w / 100;
  return (
    <g transform={`translate(${x - 50 * s} ${y - 22 * s}) scale(${s})`}>
      <path d="M 4 30 C 4 18 10 8 22 6 L 34 4 C 40 14 52 18 62 20 C 78 23 92 26 96 34 L 96 38 L 4 38 Z" fill={color} />
      <rect x={2} y={36} width={96} height={8} rx={4} fill={sole} />
      <path d="M 30 12 L 40 18 M 36 9 L 46 15" stroke={alpha(C.text, 0.7)} strokeWidth={3} strokeLinecap="round" />
    </g>
  );
};

/** The note (the prompt): a pinned paper sheet with rows of text; (x, y) is its top-left corner. */
export type NoteRow = { text: string; size: number; color?: string; opacity?: number; lit?: number; policy?: boolean; short?: boolean; bars?: boolean };

export const NoteSheet: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  rows: NoteRow[];
  opacity?: number;
  lit?: number;
  rot?: number;
  strike?: number;
  write?: number;
  /** The highlight sweeping down as it is read, 0..1 (top to bottom); negative hides it. */
  read?: number;
  pin?: boolean;
  /** Clip the rows to the sheet. */
  clipId?: string;
  /** Extra vertical offset for the rows (content pushed down). */
  rowOffset?: number;
  children?: React.ReactNode;
}> = ({ x, y, w, h, rows, opacity = 1, lit = 0, rot = 0, strike = 0, write = 0, read = -1, pin = true, clipId, rowOffset = 0, children }) => {
  if (opacity <= 0) return null;
  const pad = Math.max(18, w * 0.05);
  let yy = y + pad * 1.4 + rowOffset;
  return (
    <g opacity={cl(opacity)} transform={rot ? `rotate(${rot} ${x + w / 2} ${y + h / 2})` : undefined}>
      <g style={glow(C.accentText, lit)}>
        <rect x={x} y={y} width={w} height={h} rx={10} fill={C.text} stroke={edge(0.4 + 0.6 * cl(lit))} strokeWidth={4} />
      </g>
      {/* ruled lines */}
      {clipId && (
        <defs>
          <clipPath id={clipId}>
            <rect x={x} y={y} width={w} height={h} rx={10} />
          </clipPath>
        </defs>
      )}
      <g clipPath={clipId ? `url(#${clipId})` : undefined}>
        {read >= 0 && read <= 1 && <rect x={x + 6} y={y + 10 + (h - 60) * read} width={w - 12} height={50} rx={8} fill={alpha(C.accentText, 0.28)} />}
        {rows.map((r, i) => {
          const top = yy;
          yy += r.size * 1.55;
          const op = cl(r.opacity ?? 1);
          if (op <= 0) return null;
          const l = cl(r.lit ?? 0);
          if (r.bars) {
            return <rect key={i} x={x + pad} y={top + r.size * 0.2} width={(w - 2 * pad) * (0.55 + 0.4 * (((i * 7) % 5) / 5))} height={r.size * 0.42} rx={r.size * 0.2} fill={alpha(C.muted, 0.6)} opacity={op} />;
          }
          return (
            <g key={i} opacity={op}>
              {l > 0 && <rect x={x + pad * 0.5} y={top - r.size * 0.12} width={w - pad} height={r.size * 1.32} rx={r.size * 0.3} fill={alpha(C.warm, 0.35 * l)} />}
              {r.policy ? (
                <PolicyText x={x + pad} y={top + r.size * 0.95} size={r.size} strike={strike} write={write} fill={r.color ?? C.bg0} short={r.short} />
              ) : (
                <text x={x + pad} y={top + r.size * 0.95} fontSize={r.size} fontWeight={r.color ? 800 : 700} fill={r.color ?? alpha(C.bg0, 0.85)}>
                  {r.text}
                </text>
              )}
            </g>
          );
        })}
        {children}
      </g>
      {pin && (
        <g>
          <circle cx={x + w / 2} cy={y + 4} r={13} fill={C.marker} stroke={alpha(C.bg0, 0.5)} strokeWidth={3} />
          <circle cx={x + w / 2 - 4} cy={y} r={4} fill={alpha(C.text, 0.7)} />
        </g>
      )}
    </g>
  );
};

/** A tag with a label in the accent: a rounded pill centred on (x, y). */
export const Tag: React.FC<{ x: number; y: number; text: string; size?: number; opacity?: number; color?: string; fill?: string }> = ({
  x,
  y,
  text,
  size = 34,
  opacity = 1,
  color = C.accentText,
  fill = C.card,
}) => {
  if (opacity <= 0) return null;
  const w = textW(text, size) + size * 1.2;
  const h = size * 1.6;
  return (
    <g opacity={cl(opacity)}>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={h / 2} fill={fill} stroke={color} strokeWidth={3} />
      <text x={x} y={y + size * 0.35} textAnchor="middle" fontSize={size} fontWeight={800} fill={color}>
        {text}
      </text>
    </g>
  );
};

/** A sign board on two posts, centred on (x, y) (the board's centre). */
export const Sign: React.FC<{ x: number; y: number; text: string; size?: number; opacity?: number; lit?: number; color?: string; arrow?: -1 | 0 | 1 }> = ({
  x,
  y,
  text,
  size = 36,
  opacity = 1,
  lit = 1,
  color = C.accentText,
  arrow = 0,
}) => {
  if (opacity <= 0) return null;
  const w = textW(text, size) + size * (arrow ? 2.4 : 1.4);
  const h = size * 1.8;
  const L = x - w / 2;
  const tip = size * 0.7;
  const d =
    arrow === -1
      ? `M ${L - tip} ${y} L ${L} ${y - h / 2} H ${L + w} V ${y + h / 2} H ${L} Z`
      : arrow === 1
        ? `M ${L} ${y - h / 2} H ${L + w} L ${L + w + tip} ${y} L ${L + w} ${y + h / 2} H ${L} Z`
        : `M ${L} ${y - h / 2} H ${L + w} V ${y + h / 2} H ${L} Z`;
  return (
    <g opacity={cl(opacity)} style={glow(color, 0.5 * cl(lit))}>
      <path d={d} fill={C.card} stroke={alpha(color, 0.35 + 0.65 * cl(lit))} strokeWidth={5} strokeLinejoin="round" />
      <text x={x + (arrow * size * 0.25)} y={y + size * 0.36} textAnchor="middle" fontSize={size} fontWeight={800} fill={alpha(C.text, 0.5 + 0.5 * cl(lit))}>
        {text}
      </text>
    </g>
  );
};

/** A closed door; (x, y) is its top-left corner. `glowA` lights it. */
export const Door: React.FC<{ x: number; y: number; w: number; h: number; glowA?: number; color?: string }> = ({ x, y, w, h, glowA = 0, color = C.accentText }) => {
  const g = cl(glowA);
  return (
    <g style={glow(color, g)}>
      <path d={`M ${x - 10} ${y + h} V ${y + w * 0.5} A ${w / 2 + 10} ${w / 2 + 10} 0 0 1 ${x + w + 10} ${y + w * 0.5} V ${y + h}`} fill={C.bg1} stroke={alpha(color, 0.4 + 0.6 * g)} strokeWidth={5} />
      <path d={`M ${x} ${y + h} V ${y + w * 0.5} A ${w / 2} ${w / 2} 0 0 1 ${x + w} ${y + w * 0.5} V ${y + h} Z`} fill={alpha(C.accent, 0.18 + 0.3 * g)} stroke={alpha(color, 0.5 + 0.5 * g)} strokeWidth={4} />
      <rect x={x + w * 0.16} y={y + h * 0.42} width={w * 0.68} height={h * 0.22} rx={6} fill="none" stroke={alpha(color, 0.35 + 0.4 * g)} strokeWidth={3} />
      <rect x={x + w * 0.16} y={y + h * 0.7} width={w * 0.68} height={h * 0.22} rx={6} fill="none" stroke={alpha(color, 0.35 + 0.4 * g)} strokeWidth={3} />
      <circle cx={x + w * 0.8} cy={y + h * 0.6} r={Math.max(5, w * 0.06)} fill={C.warm} />
    </g>
  );
};

/** A ring binder (the manual), front view; (x, y) top-left. Same look as the manual scenes (recipe.tsx). */
export const Binder: React.FC<{ x: number; y: number; w: number; h: number; opacity?: number; lit?: number }> = ({ x, y, w, h, opacity = 1, lit = 1 }) => {
  if (opacity <= 0) return null;
  const tabs = [C.ok, C.warm, C.accent2];
  const label = 'Manual';
  return (
    <g opacity={cl(opacity)}>
      {tabs.map((c, i) => (
        <rect key={i} x={x + w - 8} y={y + h * (0.18 + 0.22 * i)} width={w * 0.12} height={h * 0.14} rx={6} fill={alpha(c, 0.5 + 0.5 * cl(lit))} />
      ))}
      <rect x={x} y={y} width={w} height={h} rx={w * 0.06} fill={alpha(C.accent, 0.35 + 0.45 * cl(lit))} stroke={edge(lit)} strokeWidth={5} />
      <rect x={x} y={y} width={w * 0.16} height={h} rx={w * 0.05} fill={alpha(C.bg0, 0.35)} />
      {[0.22, 0.5, 0.78].map((f, i) => (
        <circle key={i} cx={x + w * 0.08} cy={y + h * f} r={w * 0.04} fill="none" stroke={alpha(C.text, 0.8)} strokeWidth={4} />
      ))}
      <rect x={x + w * 0.26} y={y + h * 0.2} width={w * 0.64} height={h * 0.2} rx={8} fill={alpha(C.text, 0.92)} />
      <text x={x + w * 0.58} y={y + h * 0.3 + w * 0.06} textAnchor="middle" fontSize={Math.min(w * 0.17, (w * 0.58) / (label.length * 0.57))} fontWeight={800} fill={C.bg0}>
        {label}
      </text>
    </g>
  );
};

/** The book of what the model knows, open, centred on the spine top (x, y); `write` scribbles a line. */
export const OpenBook: React.FC<{ x: number; y: number; w: number; opacity?: number; lit?: number; write?: number }> = ({ x, y, w, opacity = 1, lit = 1, write = 0 }) => {
  if (opacity <= 0) return null;
  const h = w * 0.62;
  const half = w / 2;
  const wr = cl(write);
  return (
    <g opacity={cl(opacity)}>
      {/* cover */}
      <path d={`M ${x - half - 14} ${y + 10} L ${x - half - 14} ${y + h + 16} L ${x + half + 14} ${y + h + 16} L ${x + half + 14} ${y + 10} Z`} fill={C.accent} stroke={C.accentText} strokeWidth={4} />
      {/* pages */}
      <path d={`M ${x} ${y + 8} Q ${x - half * 0.5} ${y - 10} ${x - half} ${y} L ${x - half} ${y + h} Q ${x - half * 0.5} ${y + h - 10} ${x} ${y + h + 6} Z`} fill={alpha(C.text, 0.85 + 0.15 * cl(lit))} stroke={alpha(C.bg0, 0.4)} strokeWidth={2} />
      <path d={`M ${x} ${y + 8} Q ${x + half * 0.5} ${y - 10} ${x + half} ${y} L ${x + half} ${y + h} Q ${x + half * 0.5} ${y + h - 10} ${x} ${y + h + 6} Z`} fill={alpha(C.text, 0.85 + 0.15 * cl(lit))} stroke={alpha(C.bg0, 0.4)} strokeWidth={2} />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={`l${i}`} x={x - half + 18} y={y + 22 + i * h * 0.16} width={(half - 36) * (i === 4 ? 0.6 : 0.95)} height={7} rx={3} fill={alpha(C.muted, 0.7)} />
      ))}
      {[0, 1, 2].map((i) => (
        <rect key={`r${i}`} x={x + 18} y={y + 22 + i * h * 0.16} width={(half - 36) * 0.92} height={7} rx={3} fill={alpha(C.muted, 0.7)} />
      ))}
      {wr > 0 && (
        <path
          d={`M ${x + 20} ${y + 26 + 3 * h * 0.16} q 14 -14 28 0 t 28 0 t 28 0 t 28 0 t 28 0 M ${x + 20} ${y + 26 + 4 * h * 0.16} q 14 -14 28 0 t 28 0 t 28 0`}
          fill="none"
          stroke={C.accent}
          strokeWidth={6}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={`${wr} 1`}
        />
      )}
    </g>
  );
};

/** A pen, its tip at (x, y), leaning right. */
export const Pen: React.FC<{ x: number; y: number; len?: number; opacity?: number; rot?: number }> = ({ x, y, len = 180, opacity = 1, rot = -40 }) => {
  if (opacity <= 0) return null;
  const t = len * 0.09;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={cl(opacity)}>
      <path d={`M 0 0 L ${t * 1.6} ${-t / 2} L ${t * 1.6} ${t / 2} Z`} fill={C.bg0} stroke={C.text} strokeWidth={2} />
      <rect x={t * 1.6} y={-t / 2} width={len * 0.2} height={t} fill={C.muted} />
      <rect x={t * 1.6 + len * 0.2} y={-t * 0.6} width={len * 0.7} height={t * 1.2} rx={t * 0.3} fill={C.warm} stroke={alpha(C.bg0, 0.6)} strokeWidth={2} />
      <rect x={t * 1.6 + len * 0.45} y={-t * 0.75} width={len * 0.3} height={t * 0.35} rx={2} fill={C.text} />
    </g>
  );
};

/**
 * A shop assistant (a generic person, cartoon style): (x, y) is the top of the head, about 430·s
 * tall to the waist. `read` tilts the head down to the note held at chest height.
 */
export const ShopAssistant: React.FC<{ x: number; y: number; s?: number; opacity?: number; blink?: number; read?: number }> = ({ x, y, s = 1, opacity = 1, blink = 0, read = 0 }) => {
  if (opacity <= 0) return null;
  const eye = 1 - 0.9 * cl(blink);
  const tilt = 6 * cl(read);
  const line = C.accentText;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={cl(opacity)}>
      {/* body: shirt and apron */}
      <path d="M -120 420 L -110 250 Q -100 200 -40 190 L 40 190 Q 100 200 110 250 L 120 420 Z" fill={C.card} stroke={line} strokeWidth={6} />
      <path d="M -62 230 L 62 230 L 74 420 L -74 420 Z" fill={alpha(C.ok, 0.75)} stroke={alpha(C.bg0, 0.4)} strokeWidth={3} />
      <path d="M -40 190 L 0 226 L 40 190" fill="none" stroke={line} strokeWidth={5} />
      <rect x={-34} y={300} width={68} height={40} rx={8} fill={alpha(C.bg0, 0.25)} />
      <circle cx={-40} cy={262} r={12} fill={C.text} stroke={alpha(C.bg0, 0.4)} strokeWidth={2} />
      {/* neck and head */}
      <rect x={-20} y={150} width={40} height={50} rx={10} fill={alpha(C.text, 0.85)} />
      <g transform={`rotate(${tilt} 0 150)`}>
        <ellipse cx={0} cy={80} rx={78} ry={88} fill={alpha(C.text, 0.92)} stroke={line} strokeWidth={6} />
        {/* hair */}
        <path d="M -80 70 Q -84 -10 -10 -12 Q 70 -14 82 60 Q 50 22 0 28 Q -40 30 -80 70 Z" fill={C.accent2} />
        <ellipse cx={-80} cy={92} rx={10} ry={18} fill={alpha(C.text, 0.85)} stroke={line} strokeWidth={4} />
        <ellipse cx={80} cy={92} rx={10} ry={18} fill={alpha(C.text, 0.85)} stroke={line} strokeWidth={4} />
        <ellipse cx={-28} cy={94 + 6 * cl(read)} rx={9} ry={11 * eye} fill={C.bg0} />
        <ellipse cx={28} cy={94 + 6 * cl(read)} rx={9} ry={11 * eye} fill={C.bg0} />
        <path d="M -20 130 Q 0 144 20 130" fill="none" stroke={C.bg0} strokeWidth={5} strokeLinecap="round" />
        <circle cx={-48} cy={120} r={10} fill={alpha(C.marker, 0.35)} />
        <circle cx={48} cy={120} r={10} fill={alpha(C.marker, 0.35)} />
      </g>
    </g>
  );
};

/** A stack of shoe boxes standing on (x, y) (bottom-left), `n` boxes, the top one landing with `fall`. */
export const ShoeBox: React.FC<{ x: number; y: number; w: number; opacity?: number; tone?: number }> = ({ x, y, w, opacity = 1, tone = 0 }) => {
  if (opacity <= 0) return null;
  const h = w * 0.42;
  const colors = [C.warm, C.accent2, C.ok, C.accentText];
  const c = colors[Math.abs(Math.round(tone)) % colors.length];
  return (
    <g opacity={cl(opacity)}>
      <rect x={x} y={y - h} width={w} height={h} rx={6} fill={C.bg1} />
      <rect x={x} y={y - h} width={w} height={h} rx={6} fill={alpha(c, 0.55)} stroke={alpha(C.bg0, 0.6)} strokeWidth={3} />
      <rect x={x - 6} y={y - h - 2} width={w + 12} height={h * 0.28} rx={5} fill={alpha(c, 0.9)} stroke={alpha(C.bg0, 0.6)} strokeWidth={3} />
      <Shoe x={x + w / 2} y={y - h * 0.38} w={w * 0.42} color={alpha(C.bg0, 0.7)} sole={alpha(C.text, 0.8)} />
    </g>
  );
};

/** A product card (a shoe, a name bar, a price bar), centred on (x, y). */
export const ProductCard: React.FC<{ x: number; y: number; w: number; rot?: number; opacity?: number; tone?: number }> = ({ x, y, w, rot = 0, opacity = 1, tone = 0 }) => {
  if (opacity <= 0) return null;
  const h = w * 1.25;
  const colors = [C.accent, C.ok, C.warm, C.accent2, C.marker];
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={cl(opacity)}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={w * 0.08} fill={C.card} stroke={alpha(C.accentText, 0.6)} strokeWidth={Math.max(1.5, w * 0.03)} />
      <Shoe x={0} y={-h * 0.12} w={w * 0.72} color={colors[Math.abs(Math.round(tone)) % colors.length]} />
      <rect x={-w * 0.36} y={h * 0.16} width={w * 0.72} height={h * 0.07} rx={2} fill={alpha(C.muted, 0.75)} />
      <rect x={-w * 0.36} y={h * 0.3} width={w * 0.36} height={h * 0.08} rx={2} fill={alpha(C.ok, 0.85)} />
    </g>
  );
};

/** A generic app panel: a window with a title bar; (x, y) top-left. Content is drawn by the caller. */
export const AppPanel: React.FC<{ x: number; y: number; w: number; h: number; title: string; size?: number; opacity?: number; lit?: number; icon?: 'gear' | 'folder' | 'bot' }> = ({
  x,
  y,
  w,
  h,
  title,
  size = 38,
  opacity = 1,
  lit = 0,
  icon = 'gear',
}) => {
  if (opacity <= 0) return null;
  const head = size * 2;
  const ix = x + 26 + size * 0.5;
  const iy = y + head / 2;
  return (
    <g opacity={cl(opacity)}>
      <g style={glow(C.accentText, lit)}>
        <rect x={x} y={y} width={w} height={h} rx={24} fill={C.bg1} stroke={alpha(C.accentText, 0.5 + 0.5 * cl(lit))} strokeWidth={4} />
      </g>
      <path d={`M ${x} ${y + head} V ${y + 24} Q ${x} ${y} ${x + 24} ${y} H ${x + w - 24} Q ${x + w} ${y} ${x + w} ${y + 24} V ${y + head} Z`} fill={C.card} />
      <line x1={x} x2={x + w} y1={y + head} y2={y + head} stroke={alpha(C.accentText, 0.35)} strokeWidth={2} />
      {icon === 'gear' && (
        <g>
          <circle cx={ix} cy={iy} r={size * 0.42} fill="none" stroke={C.accentText} strokeWidth={size * 0.16} strokeDasharray={`${size * 0.2} ${size * 0.12}`} />
          <circle cx={ix} cy={iy} r={size * 0.18} fill={C.accentText} />
        </g>
      )}
      {icon === 'folder' && <path d={`M ${ix - size * 0.5} ${iy - size * 0.3} h ${size * 0.4} l ${size * 0.12} ${size * 0.12} h ${size * 0.48} v ${size * 0.55} h ${-size} Z`} fill={C.accentText} />}
      {icon === 'bot' && (
        <g>
          <rect x={ix - size * 0.45} y={iy - size * 0.32} width={size * 0.9} height={size * 0.7} rx={size * 0.18} fill={C.accentText} />
          <circle cx={ix - size * 0.18} cy={iy} r={size * 0.09} fill={C.bg0} />
          <circle cx={ix + size * 0.18} cy={iy} r={size * 0.09} fill={C.bg0} />
        </g>
      )}
      <text x={ix + size * 0.8} y={iy + size * 0.36} fontSize={size} fontWeight={800} fill={C.text}>
        {title}
      </text>
    </g>
  );
};

/** A shop counter seen from the front; (x, y) is the top-left of its top. */
export const ShopCounter: React.FC<{ x: number; y: number; w: number; h: number; opacity?: number }> = ({ x, y, w, h, opacity = 1 }) => {
  if (opacity <= 0) return null;
  return (
    <g opacity={cl(opacity)}>
      <rect x={x + 12} y={y + 20} width={w - 24} height={h - 20} rx={10} fill={C.bg1} stroke={alpha(C.accentText, 0.55)} strokeWidth={4} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={x + 40 + (i * (w - 80)) / 3} y={y + 46} width={(w - 80) / 3 - 20} height={h - 74} rx={8} fill="none" stroke={alpha(C.accentText, 0.25)} strokeWidth={3} />
      ))}
      <rect x={x} y={y} width={w} height={26} rx={9} fill={C.card} stroke={alpha(C.accentText, 0.8)} strokeWidth={5} />
    </g>
  );
};

/** An "OPEN" sign on a string; `flip` 0 shows CLOSED, 1 OPEN (it turns over in between). */
export const OpenSign: React.FC<{ x: number; y: number; w: number; flip: number; opacity?: number }> = ({ x, y, w, flip, opacity = 1 }) => {
  if (opacity <= 0) return null;
  const f = cl(flip);
  const sx = Math.abs(Math.cos(Math.PI * f));
  const open = f > 0.5;
  const h = w * 0.42;
  const size = w * 0.22;
  return (
    <g opacity={cl(opacity)}>
      <path d={`M ${x - w * 0.3} ${y} L ${x} ${y - h * 0.6} L ${x + w * 0.3} ${y}`} fill="none" stroke={alpha(C.muted, 0.7)} strokeWidth={3} />
      <circle cx={x} cy={y - h * 0.6} r={6} fill={C.muted} />
      <g transform={`translate(${x} ${y + h / 2}) scale(${Math.max(0.02, sx)} 1)`} style={glow(C.ok, open ? 0.5 : 0)}>
        <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={10} fill={open ? C.ok : C.card} stroke={open ? C.text : C.muted} strokeWidth={4} />
        <text x={0} y={size * 0.36} textAnchor="middle" fontSize={size} fontWeight={900} fill={open ? C.bg0 : C.muted} letterSpacing={2}>
          {open ? 'OPEN' : 'CLOSED'}
        </text>
      </g>
    </g>
  );
};

/** A sun rising over a line; `rise` 0..1. */
export const Sun: React.FC<{ x: number; y: number; r: number; rise: number }> = ({ x, y, r, rise }) => {
  const p = cl(rise);
  if (p <= 0) return null;
  const cy = y - r * 1.2 * p;
  return (
    <g opacity={p}>
      <circle cx={x} cy={cy} r={r} fill={C.warm} style={glow(C.warm, 0.7)} />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4;
        return <line key={i} x1={x + (r + 10) * Math.cos(a)} y1={cy + (r + 10) * Math.sin(a)} x2={x + (r + 26) * Math.cos(a)} y2={cy + (r + 26) * Math.sin(a)} stroke={C.warm} strokeWidth={6} strokeLinecap="round" />;
      })}
    </g>
  );
};
