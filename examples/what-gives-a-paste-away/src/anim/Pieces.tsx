// Drawing kit shared by PieceInspector and RepairFork: the jigsaw of a conversation (from the
// part-1 video), a loose piece with a face and a back, the glove, chat bubbles, cards and stamps.
import React from 'react';
import { interpolate } from 'remotion';
import { C, GRADIENT, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import { N, cellOf, edgesOf, piecePath, type Edges } from './Jigsaw.ts';
import { Picture, type Topic } from './Pictures.tsx';
import { OK, WARN } from './palette.ts';

export const MONO = "ui-monospace, Menlo, 'SF Mono', monospace";
/** The cell every conversation's hole sits in. */
export const HOLE = { r: 1, c: 2 } as const;
export const HOLE_EDGES = edgesOf(HOLE.r, HOLE.c);

/** Centre of the hole of a puzzle of side `size` at (x, y). */
export const holeCentre = (x: number, y: number, size: number) => {
  const c = cellOf(x, y, size, HOLE.r, HOLE.c);
  return { x: c.x + c.w / 2, y: c.y + c.h / 2, cell: c.w };
};

/** A jigsaw with its picture, every piece outlined, and the hole recessed. */
export const Puzzle: React.FC<{ id: string; x: number; y: number; size: number; topic?: Topic; picture?: React.ReactNode; frame?: string; opacity?: number }> = ({
  id,
  x,
  y,
  size,
  topic = 'garden',
  picture,
  frame,
  opacity = 1,
}) => {
  const hc = cellOf(x, y, size, HOLE.r, HOLE.c);
  const hole = piecePath(hc.x, hc.y, hc.w, hc.h, HOLE_EDGES);
  const cells: string[] = [];
  for (let r = 0; r < N; r++)
    for (let c = 0; c < N; c++) {
      if (r === HOLE.r && c === HOLE.c) continue;
      const cc = cellOf(x, y, size, r, c);
      cells.push(piecePath(cc.x, cc.y, cc.w, cc.h, edgesOf(r, c)));
    }
  const sw = Math.max(0.8, size / 300);
  return (
    <g opacity={opacity}>
      <defs>
        <clipPath id={`${id}-pic`}>
          <path d={`M${x},${y} h${size} v${size} h${-size} Z ${hole}`} clipRule="evenodd" fillRule="evenodd" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-pic)`}>
        <g transform={`translate(${x} ${y}) scale(${size / 100})`}>{picture ?? <Picture topic={topic} id={`${id}-p`} />}</g>
      </g>
      <path d={hole} fill={alpha(C.bg0, 0.92)} />
      <path d={hole} fill="none" stroke={alpha(C.text, 0.35)} strokeWidth={sw} strokeDasharray={`${size / 60} ${size / 90}`} />
      <path d={cells.join(' ')} fill="none" stroke={alpha(C.bg0, 0.7)} strokeWidth={sw * 1.6} />
      <path d={cells.join(' ')} fill="none" stroke={alpha(C.text, 0.2)} strokeWidth={sw * 0.6} />
      {frame && <rect x={x - sw * 2} y={y - sw * 2} width={size + sw * 4} height={size + sw * 4} rx={size * 0.04} fill="none" stroke={frame} strokeWidth={sw * 2.6} />}
    </g>
  );
};

/** Chat-window chrome around a puzzle. */
export const Window: React.FC<{ x: number; y: number; w: number; h: number; header: number; title: string; opacity?: number }> = ({ x, y, w, h, header, title, opacity = 1 }) => (
  <g opacity={opacity}>
    <rect x={x} y={y} width={w} height={h} rx={22} fill={C.card} stroke={alpha(C.text, 0.12)} strokeWidth={2} />
    <path d={`M${x} ${y + header} h${w}`} stroke={alpha(C.text, 0.1)} strokeWidth={2} />
    {[0, 1, 2].map((i) => (
      <circle key={i} cx={x + 30 + i * 26} cy={y + header / 2} r={8} fill={alpha(C.muted, 0.35)} />
    ))}
    <text x={x + w / 2} y={y + header / 2 + header * 0.18} textAnchor="middle" fontFamily={fontFamily} fontWeight={600} fontSize={header * 0.5} fill={C.text}>
      {title}
    </text>
  </g>
);

export type Tone = 'warn' | 'indigo' | 'ok' | 'blank';
const TONES: Record<Tone, { a: string; b: string; ink: string }> = {
  warn: { a: WARN.text, b: WARN.base, ink: alpha(C.bg0, 0.8) },
  ok: { a: OK.text, b: OK.base, ink: alpha(C.bg0, 0.8) },
  // "Same box": the conversation's own indigo family.
  indigo: { a: C.accentText, b: C.accent, ink: C.text },
  blank: { a: WARN.deep, b: alpha(WARN.deep, 0.85), ink: C.text },
};

export type Face = { tone: Tone; lines?: string[]; topic?: Topic; mono?: boolean; textScale?: number };

export type PieceProps = {
  id: string;
  /** Centre of the piece's cell and the cell side. */
  cx: number;
  cy: number;
  cell: number;
  rot?: number;
  scale?: number;
  /** cos of the turn: 1 face up, -1 back showing; |flip| squashes the width. */
  flip?: number;
  face: Face;
  back?: Face;
  /** Torn right edge (a paste cut off mid-sentence). */
  torn?: boolean;
  /** 0..1 coloured halo; `glowTone` picks its colour. */
  glow?: number;
  glowTone?: Tone;
  flash?: number;
  opacity?: number;
  edges?: Edges;
};

/** A loose piece: face (picture or text) when flip > 0, its back when flip < 0. */
export const Piece: React.FC<PieceProps> = ({ id, cx, cy, cell, rot = 0, scale = 1, flip = 1, face, back, torn, glow = 0, glowTone = 'warn', flash = 0, opacity = 1, edges = HOLE_EDGES }) => {
  const x = cx - cell / 2;
  const y = cy - cell / 2;
  const d = piecePath(x, y, cell, cell, edges);
  const showBack = flip < 0;
  const f = showBack ? (back ?? { tone: 'blank' as Tone }) : face;
  const tone = TONES[f.tone];
  const k = cell * 0.27;
  // Torn: a zigzag through the right knob.
  const zig = Array.from({ length: 9 }, (_, i) => `${x + cell * 0.86 + (i % 2 ? cell * 0.07 : 0)},${y - k + (i * (cell + 2 * k)) / 8}`).join(' ');
  const tornClip = `${x - k},${y - k} ${zig} ${x - k},${y + cell + k}`;
  const g = TONES[glowTone].b;
  const fs = cell * 0.13 * (f.textScale ?? 1);
  const lines = f.lines ?? [];
  return (
    <g
      transform={`translate(${cx} ${cy}) rotate(${rot}) scale(${scale * Math.max(0.04, Math.abs(flip))} ${scale}) translate(${-cx} ${-cy})`}
      opacity={opacity}
      style={{ filter: glow > 0 ? `drop-shadow(0 0 ${cell * 0.16 * glow}px ${alpha(g, 0.95 * glow)}) drop-shadow(0 0 ${cell * 0.05 * glow}px ${alpha(g, glow)})` : `drop-shadow(0 ${cell * 0.04}px ${cell * 0.06}px rgba(0,0,0,0.55))` }}
    >
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={tone.a} />
          <stop offset="1" stopColor={tone.b} />
        </linearGradient>
        <clipPath id={`${id}-c`}>
          <path d={d} />
        </clipPath>
        <clipPath id={`${id}-t`}>
          <polygon points={torn ? tornClip : `${x - k},${y - k} ${x + cell + k},${y - k} ${x + cell + k},${y + cell + k} ${x - k},${y + cell + k}`} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-t)`}>
        <path d={d} fill={`url(#${id}-g)`} stroke={alpha(C.bg0, 0.55)} strokeWidth={cell / 70} />
        {f.topic && (
          <g clipPath={`url(#${id}-c)`}>
            <g transform={`translate(${x} ${y}) scale(${cell / 100})`}>
              <Picture topic={f.topic} id={`${id}-pic`} />
            </g>
          </g>
        )}
        <g clipPath={`url(#${id}-c)`}>
          {lines.map((s, i) => (
            <text
              key={i}
              x={cx}
              y={cy + (i - (lines.length - 1) / 2) * fs * 1.22 + fs * 0.36}
              textAnchor="middle"
              fontFamily={f.mono ? MONO : fontFamily}
              fontStyle={showBack ? 'italic' : 'normal'}
              fontSize={fs}
              fontWeight={showBack ? 600 : 800}
              fill={tone.ink}
            >
              {s}
            </text>
          ))}
        </g>
        {flash > 0 && <path d={d} fill={alpha('#ffffff', 0.6 * flash)} />}
      </g>
      {torn && <polyline points={zig} fill="none" stroke={alpha(C.text, 0.9)} strokeWidth={cell / 45} />}
    </g>
  );
};

/** A soft outlined glove (no face): palm, four fingers, thumb and cuff. Fingertips at y = -70. */
export const Glove: React.FC<{ x: number; y: number; size?: number; rot?: number; opacity?: number; brush?: boolean; mirror?: boolean }> = ({
  x,
  y,
  size = 1,
  rot = 0,
  opacity = 1,
  brush,
  mirror,
}) => {
  const stroke = alpha(C.text, 0.9);
  const sw = 5;
  const fill = C.card;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${size * (mirror ? -1 : 1)} ${size})`} opacity={opacity}>
      {brush && (
        <g>
          <rect x={-8} y={-210} width={16} height={190} rx={6} fill={C.accent2} stroke={alpha(C.bg0, 0.6)} strokeWidth={3} />
          <rect x={-14} y={-232} width={28} height={30} rx={4} fill="#cbd5e1" />
          <path d="M-16 -232 Q 0 -290 16 -232 Z" fill={C.accentText} />
        </g>
      )}
      {[
        [-34, -58],
        [-12, -72],
        [10, -70],
        [32, -56],
      ].map(([fx, top], i) => (
        <rect key={i} x={fx - 10} y={top} width={20} height={-top + 10} rx={10} fill={fill} stroke={stroke} strokeWidth={sw} />
      ))}
      <rect x={-46} y={-14} width={92} height={84} rx={30} fill={fill} stroke={stroke} strokeWidth={sw} />
      <rect x={-78} y={4} width={52} height={22} rx={11} fill={fill} stroke={stroke} strokeWidth={sw} transform="rotate(-38 -50 15)" />
      <rect x={-50} y={62} width={100} height={30} rx={10} fill={alpha(C.accent, 0.85)} stroke={stroke} strokeWidth={sw} />
    </g>
  );
};

export type Seg = { text: string; warn?: boolean };

/** A chat bubble. `user` sits right in the accent; the model's sits left on a card. */
export const Bubble: React.FC<{
  x: number;
  y: number;
  w: number;
  user?: boolean;
  segs?: Seg[];
  /** Skeleton lines instead of words (a reply we only gesture at). */
  skeleton?: number;
  fontSize?: number;
  opacity?: number;
  /** 0..1 typing progress (characters revealed). */
  typed?: number;
  /** 0..1 amber glow on the warn segments. */
  glow?: number;
  align?: 'left' | 'right';
}> = ({ x, y, w, user, segs = [], skeleton = 0, fontSize = 34, opacity = 1, typed = 1, glow = 1, align }) => {
  const total = segs.reduce((a, s) => a + s.text.length, 0);
  let left = Math.round(total * Math.min(1, Math.max(0, typed)));
  const side = align ?? (user ? 'right' : 'left');
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, display: 'flex', justifyContent: side === 'right' ? 'flex-end' : 'flex-start', opacity, fontFamily }}>
      <div
        style={{
          maxWidth: w,
          padding: `${fontSize * 0.42}px ${fontSize * 0.7}px`,
          borderRadius: fontSize * 0.8,
          ...(side === 'right' ? { borderBottomRightRadius: 8 } : { borderBottomLeftRadius: 8 }),
          background: user ? GRADIENT : C.card,
          border: user ? 'none' : `2px solid ${alpha(C.text, 0.14)}`,
          color: C.text,
          fontSize,
          fontWeight: 600,
          lineHeight: 1.22,
        }}
      >
        {skeleton > 0
          ? Array.from({ length: skeleton }, (_, i) => (
              <div key={i} style={{ height: fontSize * 0.42, width: [w * 0.62, w * 0.5, w * 0.38][i % 3], margin: `${fontSize * 0.2}px 0`, borderRadius: 6, background: alpha(C.muted, 0.35 * Math.min(1, typed * 1.5)) }} />
            ))
          : segs.map((s, i) => {
              const shown = s.text.slice(0, Math.max(0, left));
              left -= s.text.length;
              if (!s.warn) return <span key={i}>{shown}</span>;
              return (
                <span
                  key={i}
                  style={{
                    color: interpolate(glow, [0, 1], [0, 1]) > 0.5 ? WARN.text : C.text,
                    background: alpha(WARN.base, 0.22 * glow),
                    borderRadius: 8,
                    padding: '0 4px',
                    textShadow: glow > 0 ? `0 0 ${18 * glow}px ${alpha(WARN.base, 0.9 * glow)}` : 'none',
                  }}
                >
                  {shown}
                </span>
              );
            })}
      </div>
    </div>
  );
};

/** A pill chip, centred on a given width. */
export const Chip: React.FC<{ text: string; top: number; opacity: number; left?: number; width?: number; fontSize?: number }> = ({ text, top, opacity, left = 0, width = 1080, fontSize = 34 }) => (
  <div style={{ position: 'absolute', top, left, width, display: 'flex', justifyContent: 'center', opacity, fontFamily }}>
    <div style={{ padding: '12px 28px', borderRadius: 999, background: alpha(C.card, 0.95), border: `2px solid ${alpha(C.text, 0.16)}`, fontSize, fontWeight: 600, color: C.muted, whiteSpace: 'nowrap' }}>
      {text}
    </div>
  </div>
);

/** The test, stated as a question, in a card across the top. `small` once it is only a reminder. */
export const QuestionCard: React.FC<{ text: string; top: number; pop: number; small?: boolean }> = ({ text, top, pop, small }) => (
  <div style={{ position: 'absolute', top, left: 60, width: 960, display: 'flex', justifyContent: 'center', opacity: pop, transform: `translateY(${(1 - pop) * -30}px) scale(${interpolate(pop, [0, 1], [0.92, 1])})`, fontFamily }}>
    <div
      style={{
        padding: small ? '14px 30px' : '26px 40px',
        borderRadius: 24,
        background: C.card,
        border: `3px solid ${C.accentText}`,
        boxShadow: `0 0 40px ${alpha(C.accent, 0.35)}`,
        fontSize: small ? 40 : 60,
        fontWeight: 800,
        lineHeight: 1.12,
        color: C.text,
        textAlign: 'center',
        letterSpacing: '-0.01em',
      }}
    >
      {text}
    </div>
  </div>
);

/** A small title strip ("Last time · part 1"). */
export const Strip: React.FC<{ text: string; top: number; opacity: number }> = ({ text, top, opacity }) => (
  <div style={{ position: 'absolute', top, left: 0, width: 1080, display: 'flex', justifyContent: 'center', opacity, fontFamily }}>
    <div style={{ padding: '10px 26px', borderRadius: 12, background: alpha(C.accent, 0.18), border: `2px solid ${alpha(C.accentText, 0.6)}`, color: C.accentText, fontSize: 36, fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
      {text}
    </div>
  </div>
);

/** A slammed stamp: big figure, label under it. */
export const Stamp: React.FC<{ value: string; label?: string; x: number; y: number; w: number; pop: number; tone?: 'warn' | 'ok' | 'accent'; size?: number; rot?: number }> = ({
  value,
  label,
  x,
  y,
  w,
  pop,
  tone = 'warn',
  size = 120,
  rot = -4,
}) => {
  const col = tone === 'warn' ? WARN.text : tone === 'ok' ? OK.text : C.accentText;
  const border = tone === 'warn' ? WARN.base : tone === 'ok' ? OK.base : C.accent;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, display: 'flex', justifyContent: 'center', opacity: Math.min(1, pop * 2.5), fontFamily }}>
      <div
        style={{
          transform: `rotate(${rot}deg) scale(${interpolate(pop, [0, 1], [1.8, 1])})`,
          padding: `${size * 0.1}px ${size * 0.28}px`,
          borderRadius: 18,
          border: `${Math.max(5, size / 18)}px solid ${border}`,
          background: alpha(C.bg0, 0.88),
          textAlign: 'center',
          boxShadow: `0 0 ${size / 3}px ${alpha(border, 0.45)}`,
        }}
      >
        <div style={{ fontSize: size, fontWeight: 800, lineHeight: 1, color: col, letterSpacing: '-0.03em', whiteSpace: 'nowrap' }}>{value}</div>
        {label && <div style={{ fontSize: size * 0.3, fontWeight: 700, marginTop: size * 0.08, color: C.text, whiteSpace: 'nowrap' }}>{label}</div>}
      </div>
    </div>
  );
};

/** Words of a quote fading in, emphasised ones in the accent with an underline (KeyQuote look). */
export const QuoteLine: React.FC<{ words: { text: string; opacity: number; emphasis: boolean }[]; emphasis: number; fontSize: number; color?: string }> = ({ words, emphasis, fontSize, color = C.text }) => (
  <div style={{ fontSize, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em', color, textAlign: 'center', fontFamily }}>
    {words.map((w, i) => (
      <React.Fragment key={i}>
        {i > 0 ? ' ' : null}
        <span
          style={{
            display: 'inline-block',
            position: 'relative',
            opacity: w.opacity,
            transform: `translateY(${interpolate(w.opacity, [0, 1], [14, 0])}px) scale(${interpolate(w.opacity, [0, 1], [1.06, 1])})`,
            ...(w.emphasis ? { backgroundImage: `linear-gradient(135deg, ${C.accentText}, ${C.accent2})`, backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent', WebkitTextFillColor: 'transparent' } : {}),
          }}
        >
          {w.text}
          {w.emphasis && <span style={{ position: 'absolute', left: 0, bottom: 2, height: 10, width: `${emphasis * 100}%`, borderRadius: 5, background: GRADIENT }} />}
        </span>
      </React.Fragment>
    ))}
  </div>
);
