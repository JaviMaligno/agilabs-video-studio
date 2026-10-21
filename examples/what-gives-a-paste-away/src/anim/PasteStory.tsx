// The story (added 2026-10-21): a paste meant for one chat lands in another, and the reply plays
// along. Drawn with the same kit as PieceInspector / RepairFork. See PasteStory.state.ts.
import React from 'react';
import { interpolate } from 'remotion';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import { tx } from '../types.ts';
import type { AnimProps } from './types.ts';
import { frameState, type PSProps } from './PasteStory.state.ts';
import { OK, WARN } from './palette.ts';
import { Bubble, Glove, Piece, Puzzle, Stamp, Window, holeCentre, type Face } from './Pieces.tsx';

export { frameState };
export type { PSProps };

/** Two chat windows side by side. */
const WIN = { w: 470, header: 54, pad: 18, y: 430, xs: [50, 560] } as const;
const PUZ = WIN.w - 2 * WIN.pad;
const WIN_H = WIN.header + 2 * WIN.pad + PUZ;
const px = (i: number) => WIN.xs[i] + WIN.pad;
const PY = WIN.y + WIN.header + WIN.pad;

/** The clipboard, top centre. */
const CLIP = { x: 540, y: 330, cell: 70 } as const;
/** Where the piece is lifted to once the story steps back. */
const LIFT = { x: 540, y: 650, cell: 230 } as const;

const PASTE_FACE: Face = { tone: 'warn', topic: 'recipe' };
const PASTE_BACK: Face = { tone: 'blank', lines: ['?'], textScale: 3.2 };

const Clipboard: React.FC<{ opacity: number }> = ({ opacity }) => (
  <g opacity={opacity}>
    <rect x={CLIP.x - 62} y={CLIP.y - 78} width={124} height={156} rx={14} fill={C.card} stroke={alpha(C.text, 0.55)} strokeWidth={5} />
    <rect x={CLIP.x - 30} y={CLIP.y - 92} width={60} height={28} rx={8} fill={alpha(C.muted, 0.9)} stroke={alpha(C.bg0, 0.6)} strokeWidth={3} />
  </g>
);

/** A point on the quadratic arc from the clipboard to the wrong chat's hole. */
const arc = (p: number, to: { x: number; y: number }) => {
  const c = { x: 860, y: 250 };
  const u = 1 - p;
  return { x: u * u * CLIP.x + 2 * u * p * c.x + p * p * to.x, y: u * u * CLIP.y + 2 * u * p * c.y + p * p * to.y };
};

export const PasteStory: React.FC<AnimProps & PSProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const hole = holeCentre(px(1), PY, PUZ);
  const f = s.fly.progress;
  const onArc = arc(f, hole);
  const l = s.lift.progress;
  const seated = f >= 1;
  const cx = seated ? interpolate(l, [0, 1], [hole.x, LIFT.x]) : onArc.x;
  const cy = seated ? interpolate(l, [0, 1], [hole.y, LIFT.y]) : onArc.y;
  const scale = seated ? interpolate(l, [0, 1], [1, LIFT.cell / hole.cell]) : interpolate(f, [0, 1], [CLIP.cell / hole.cell, 1]);
  const titles = p.titles ?? ['', ''];
  const under = p.under ?? ['', ''];
  const q = p.questions ?? ['', ''];
  const meantFor = { x: WIN.xs[0] + WIN.w / 2, y: WIN.y - 8 };
  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily, color: C.text }}>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <g opacity={s.windows.appear} transform={`translate(0 ${(1 - s.windows.appear) * 30})`}>
          {[0, 1].map((i) => (
            <g key={i}>
              <Window x={WIN.xs[i]} y={WIN.y} w={WIN.w} h={WIN_H} header={WIN.header} title={tx(titles[i], p.lang)} />
              <Puzzle id={`ps${i}`} x={px(i)} y={PY} size={PUZ} topic={i === 0 ? 'recipe' : 'bill'} />
            </g>
          ))}
          {/* The wrong chat lights amber once the piece is in. */}
          <rect x={WIN.xs[1] - 4} y={WIN.y - 4} width={WIN.w + 8} height={WIN_H + 8} rx={26} fill="none" stroke={WARN.base} strokeWidth={6} opacity={s.wrong.opacity} />
        </g>
        <Clipboard opacity={s.clip.appear} />
        {/* Meant for the recipe chat: a dashed hint from the clipboard. */}
        <path
          d={`M${CLIP.x - 70} ${CLIP.y + 10} Q ${meantFor.x + 40} ${CLIP.y - 10} ${meantFor.x} ${meantFor.y - 14}`}
          fill="none"
          stroke={alpha(C.muted, 0.8)}
          strokeWidth={5}
          strokeDasharray="12 12"
          strokeLinecap="round"
          opacity={s.labels.opacity[0]}
        />
        <rect x={0} y={0} width={1080} height={1920} fill={C.bg0} opacity={s.windows.dim} />
        {l > 0 && (
          <>
            <circle cx={LIFT.x} cy={LIFT.y} r={230 * l} fill={alpha(C.accent, 0.14 * l)} />
            <Glove x={LIFT.x} y={LIFT.y + 205} size={1.25} opacity={Math.min(1, l * 2)} />
          </>
        )}
        <Piece
          id="story"
          cx={cx}
          cy={cy}
          cell={hole.cell}
          scale={scale}
          rot={seated ? interpolate(l, [0, 1], [0, -5]) : interpolate(f, [0, 1], [-14, 0])}
          flip={s.lift.flip}
          face={PASTE_FACE}
          back={PASTE_BACK}
          glow={seated ? 0.35 + 0.5 * l : 0.6}
          flash={s.flash}
          opacity={s.clip.appear > 0 || seated ? 1 : 0}
        />
        {/* Take it back: an arrow from the lifted piece back to the clipboard. */}
        <path
          d={`M${LIFT.x + 150} ${LIFT.y - 40} Q ${LIFT.x + 290} ${CLIP.y + 40} ${CLIP.x + 90} ${CLIP.y}`}
          fill="none"
          stroke={C.accentText}
          strokeWidth={9}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={`${s.back.draw} 1`}
        />
        <path d={`M${CLIP.x + 90} ${CLIP.y} l26 -20 M${CLIP.x + 90} ${CLIP.y} l30 14`} stroke={C.accentText} strokeWidth={9} strokeLinecap="round" opacity={s.back.draw >= 0.98 ? 1 : 0} />
      </svg>
      {/* Labels under the two chats. */}
      {[0, 1].map((i) => (
        <div key={i} style={{ position: 'absolute', top: WIN.y + WIN_H + 18, left: WIN.xs[i], width: WIN.w, textAlign: 'center', fontSize: 36, fontWeight: 700, color: i === 0 ? C.muted : WARN.text, opacity: s.labels.opacity[i] }}>
          {tx(under[i], p.lang)}
        </div>
      ))}
      {p.purpose && (
        <div style={{ position: 'absolute', top: CLIP.y - 50, left: CLIP.x + 90, width: 300, display: 'flex', justifyContent: 'flex-start', opacity: s.clip.tag, transform: `rotate(6deg) scale(${interpolate(s.clip.tag, [0, 1], [0.7, 1])})` }}>
          <div style={{ padding: '12px 22px', borderRadius: 16, background: C.text, color: C.bg0, fontSize: 36, fontWeight: 800, whiteSpace: 'nowrap' }}>{tx(p.purpose, p.lang)}</div>
        </div>
      )}
      {/* The model's reply: it just answers. */}
      <Bubble x={60} y={1040} w={960} skeleton={3} fontSize={40} typed={s.bubble.typed} opacity={s.bubble.appear} />
      {p.reply && <Stamp value={tx(p.reply, p.lang)} x={520} y={1080} w={480} pop={s.bubble.stamp} size={62} rot={-6} />}
      {/* The two questions the video answers. */}
      {q.map((text, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: i === 0 ? 900 : 1100,
            left: 60,
            width: 960,
            display: 'flex',
            justifyContent: 'center',
            opacity: s.cards.pop[i],
            transform: `translateY(${(1 - s.cards.pop[i]) * 30}px) scale(${interpolate(s.cards.pop[i], [0, 1], [0.92, 1])})`,
          }}
        >
          <div
            style={{
              padding: '20px 36px',
              borderRadius: 24,
              background: C.card,
              border: `3px solid ${i === 0 ? OK.base : C.accentText}`,
              boxShadow: `0 0 36px ${alpha(i === 0 ? OK.base : C.accent, 0.3)}`,
              fontSize: 50,
              fontWeight: 800,
              lineHeight: 1.12,
              textAlign: 'center',
              letterSpacing: '-0.01em',
            }}
          >
            {tx(text, p.lang)}
          </div>
        </div>
      ))}
    </div>
  );
};
