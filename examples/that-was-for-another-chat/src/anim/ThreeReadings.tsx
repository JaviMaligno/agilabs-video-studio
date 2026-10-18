import React from 'react';
import { interpolate } from 'remotion';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import { tx } from '../types.ts';
import type { AnimProps } from './types.ts';
import { frameState, type ReadingsProps } from './ThreeReadings.state.ts';
import { piecePath, type Edges } from './Jigsaw.ts';
import { WARN } from './palette.ts';
import { stageOf } from './Stage.tsx';

export { frameState };
export type { ReadingsProps };

const MONO = "ui-monospace, Menlo, 'SF Mono', monospace";
const SHAPE: Edges = [1, -1, 1, -1];
const SNIPPET = ["thread 'main'", 'panicked at', 'src/cfg.rs:42', 'called unwrap()', 'on a None'];

/** A loose piece centred on (cx, cy), cell side `w`. */
const Piece: React.FC<{ cx: number; cy: number; w: number; rot?: number; text?: boolean; opacity?: number }> = ({ cx, cy, w, rot = 0, text, opacity = 1 }) => {
  const d = piecePath(cx - w / 2, cy - w / 2, w, w, SHAPE);
  const fs = w * 0.12;
  return (
    <g transform={`rotate(${rot} ${cx} ${cy})`} opacity={opacity} style={{ filter: `drop-shadow(0 ${w * 0.04}px ${w * 0.06}px rgba(0,0,0,0.5))` }}>
      <defs>
        <clipPath id={`tr-${Math.round(cx)}-${Math.round(cy)}-${Math.round(w)}`}>
          <path d={d} />
        </clipPath>
        <linearGradient id="tr-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={WARN.text} />
          <stop offset="1" stopColor={WARN.base} />
        </linearGradient>
      </defs>
      <path d={d} fill="url(#tr-grad)" stroke={alpha(C.bg0, 0.5)} strokeWidth={Math.max(1, w / 90)} />
      {text && (
        <g clipPath={`url(#tr-${Math.round(cx)}-${Math.round(cy)}-${Math.round(w)})`}>
          {SNIPPET.map((s, i) => (
            <text key={i} x={cx - w * 0.47} y={cy - w * 0.42 + (i + 1) * fs * 1.3} fontFamily={MONO} fontWeight={700} fontSize={fs} fill={alpha(C.bg0, 0.78)}>
              {s}
            </text>
          ))}
        </g>
      )}
    </g>
  );
};

/** Slot icons, drawn centred on (0, 0) in a ~200 px box. */
const Bin: React.FC<{ c: string }> = ({ c }) => (
  <g fill="none" stroke={c} strokeWidth={9} strokeLinejoin="round" strokeLinecap="round">
    <path d="M-62,-48 h124" />
    <path d="M-22,-48 v-16 h44 v16" />
    <path d="M-50,-34 l8,104 h84 l8,-104" />
    <path d="M-16,-12 v60 M16,-12 v60" />
  </g>
);
const Pivot: React.FC<{ c: string }> = ({ c }) => (
  <g fill="none" stroke={c} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round">
    <path d="M-60,60 V0 a40,40 0 0 1 40,-40 H52" />
    <path d="M26,-68 L56,-40 L26,-12" />
  </g>
);
const Gap: React.FC<{ c: string }> = ({ c }) => (
  <g>
    <path d={piecePath(-60, -60, 120, 120, [0, 0, 0, 0])} fill="none" stroke={c} strokeWidth={8} strokeDasharray="16 10" />
    <path d={piecePath(-60, -60, 120, 120, [-1, 0, 0, 0])} fill="none" stroke={c} strokeWidth={8} />
  </g>
);
const ICONS = [Bin, Pivot, Gap];

/** The three readings of a stray paste, as slots it can fall into. */
export const ThreeReadings: React.FC<AnimProps & ReadingsProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const st = stageOf(p.vertical);
  const colW = st.w / 3;
  const colX = (i: number) => st.side + colW * (i + 0.5);
  const pieceY = st.top + 190;
  const iconY = st.top + 600;
  const pw = 230;
  const win = Math.min(2, Math.max(0, Math.round(p.winner ?? 1)));
  const fromY = pieceY + pw * 0.55;
  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily, color: C.text }}>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        {[0, 1, 2].map((i) => {
          const d = s.branches.draw[i];
          const x1 = colX(i);
          const lit = i === win && p.mode === 'verdict';
          return (
            <path
              key={i}
              d={`M${540},${fromY} C ${540},${fromY + 120} ${x1},${iconY - 260} ${x1},${iconY - 130}`}
              fill="none"
              stroke={lit ? WARN.base : alpha(C.muted, 0.6 * (1 - s.slots[i].dim))}
              strokeWidth={lit ? 10 : 6}
              pathLength={1}
              strokeDasharray={`${d} 1`}
              strokeLinecap="round"
            />
          );
        })}
        {[0, 1, 2].map((i) => {
          const sl = s.slots[i];
          const Icon = ICONS[i];
          const lit = sl.lit;
          const col = i === win && p.mode === 'verdict' ? WARN.text : lit > 0.5 ? C.text : alpha(C.muted, 0.85);
          return (
            <g key={i} opacity={sl.appear * (1 - sl.dim)} transform={`translate(${colX(i)} ${iconY + (1 - sl.appear) * 60}) scale(${1 + 0.12 * lit})`}>
              <rect x={-130} y={-130} width={260} height={260} rx={28} fill={alpha(C.card, 0.95)} stroke={i === win && p.mode === 'verdict' ? WARN.base : alpha(C.text, 0.12 + 0.5 * lit)} strokeWidth={i === win && p.mode === 'verdict' ? 7 : 4} />
              <Icon c={col} />
            </g>
          );
        })}
        {/* The other conversations' pieces raining into the winning slot. */}
        {s.rain.map((r, i) => {
          if (r <= 0 || r >= 1) return null;
          const x0 = 540 + ((i * 97) % 300) - 150;
          const x = interpolate(r, [0, 1], [x0, colX(win)]);
          // Pieces enter inside the stage (never over the badge) and fade in as they fall.
          const y = interpolate(r, [0, 1], [st.top + 60, iconY]);
          return <Piece key={i} cx={x} cy={y} w={interpolate(r, [0, 1], [90, 40])} rot={(i * 37) % 40 - 20} opacity={Math.min(1, r / 0.18)} />;
        })}
        {s.piece.opacity > 0 && (
          <Piece
            cx={interpolate(s.piece.dy, [0, 1], [540, colX(win)])}
            cy={interpolate(s.piece.dy, [0, 1], [pieceY, iconY])}
            w={interpolate(s.piece.dy, [0, 1], [pw, 70])}
            rot={s.piece.rot}
            text={s.piece.dy < 0.5}
            opacity={s.piece.opacity * (s.piece.dy >= 1 ? 0 : 1)}
          />
        )}
      </svg>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: colX(i) - colW / 2,
            width: colW,
            top: iconY + 160,
            textAlign: 'center',
            opacity: s.slots[i].appear * (1 - s.slots[i].dim),
          }}
        >
          <div style={{ fontSize: 42, fontWeight: 700, lineHeight: 1.12, color: i === win && p.mode === 'verdict' ? WARN.text : C.text }}>{tx(p.slots[i], p.lang)}</div>
          {p.glosses && <div style={{ fontSize: 32, fontWeight: 500, marginTop: 8, color: C.muted }}>{tx(p.glosses[i], p.lang)}</div>}
        </div>
      ))}
      {p.mode === 'verdict' &&
        [0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: colX(i) - colW / 2,
              width: colW,
              top: iconY + 330,
              textAlign: 'center',
              opacity: s.countOpacity,
              fontSize: 96,
              fontWeight: 800,
              lineHeight: 1,
              color: i === win ? WARN.text : alpha(C.muted, 0.8),
            }}
          >
            {s.counts[i]}
          </div>
        ))}
      {p.stamp && s.stamp.opacity > 0 && (
        <div
          style={{
            position: 'absolute',
            left: colX(0) - 140, // rotated, it still clears the 60 px side margin
            top: iconY - 190,
            width: 350,
            opacity: s.stamp.opacity,
            transform: `rotate(-10deg) scale(${interpolate(s.stamp.pop, [0, 1], [2.2, 1])})`,
            padding: '12px 10px 16px',
            borderRadius: 18,
            border: `8px solid ${C.text}`,
            background: alpha(C.bg0, 0.86),
            textAlign: 'center',
            boxShadow: `0 0 40px ${alpha(C.bg0, 0.8)}`,
          }}
        >
          <div style={{ fontSize: 96, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.03em', whiteSpace: 'nowrap' }}>{p.stamp.value}</div>
          <div style={{ fontSize: 30, fontWeight: 700, marginTop: 6, color: C.text }}>{tx(p.stamp.label, p.lang)}</div>
        </div>
      )}
    </div>
  );
};
