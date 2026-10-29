import React from 'react';
import { Img, staticFile } from 'remotion';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { PIECES, type PieceKind } from './DepthWell.state.ts';
import { CODE_LINES, TREE, frameState, type StoryGateProps } from './StoryGate.state.ts';

export { frameState };
export type { StoryGateProps };

// Frame-pixel layout (1080x1920), inside the vertical stage (y 236-1326).
const BOARD = { cx: 250, cy: 565, cell: 50 };
const CARD = { x: 575, y: 425, w: 430, h: 280 };
const GATE = { x: 610, y: 830, w: 360, h: 90 };
const TREE_TOP = 995;
const TREE_X = GATE.x + GATE.w / 2;
const LEVEL_Y = [TREE_TOP, TREE_TOP + 90, TREE_TOP + 180];
const SPREAD = [0, 120, 62];
/** Size of the planner robot drawn at the tree's root. */
const PLANNER = 120;

const nodeXY = (level: number, i: number, n: number) => ({ x: TREE_X + (i - (n - 1) / 2) * SPREAD[level], y: LEVEL_Y[level] });

/** Same glyphs as the shaft's board (DepthWell): general = ringed star, infantry = disc, cavalry = diamond. */
const Glyph: React.FC<{ kind: PieceKind; side: 0 | 1; x: number; y: number; cell: number }> = ({ kind, side, x, y, cell }) => {
  const fill = side === 0 ? C.text : C.accent;
  const edge = side === 0 ? C.muted : C.accentText;
  const r = cell * 0.32;
  return (
    <g transform={`translate(${x} ${y})`}>
      {kind === 'general' && (
        <>
          <circle r={r * 1.12} fill={fill} stroke={edge} strokeWidth={cell * 0.04} />
          <path
            d={
              Array.from({ length: 10 }, (_, i) => {
                const a = -Math.PI / 2 + (i * Math.PI) / 5;
                const rr = i % 2 ? r * 0.3 : r * 0.72;
                return `${i ? 'L' : 'M'} ${(rr * Math.cos(a)).toFixed(2)} ${(rr * Math.sin(a)).toFixed(2)}`;
              }).join(' ') + ' Z'
            }
            fill={side === 0 ? C.bg0 : C.text}
          />
        </>
      )}
      {kind === 'infantry' && <circle r={r * 0.78} fill={fill} stroke={edge} strokeWidth={cell * 0.04} />}
      {kind === 'cavalry' && (
        <rect x={-r * 0.72} y={-r * 0.72} width={r * 1.44} height={r * 1.44} rx={r * 0.18} transform="rotate(45)" fill={fill} stroke={edge} strokeWidth={cell * 0.04} />
      )}
    </g>
  );
};

const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; draw: number }> = ({ x1, y1, x2, y2, draw }) => {
  if (draw <= 0) return null;
  const x = x1 + (x2 - x1) * draw;
  const y = y1 + (y2 - y1) * draw;
  const a = Math.atan2(y2 - y1, x2 - x1);
  const h = (da: number) => `${x + 22 * Math.cos(a + Math.PI + da)},${y + 22 * Math.sin(a + Math.PI + da)}`;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x} y2={y} stroke={C.accentText} strokeWidth={6} strokeLinecap="round" />
      {draw >= 1 && <polygon points={`${x},${y} ${h(-0.45)} ${h(0.45)}`} fill={C.accentText} />}
    </g>
  );
};

/** Where the video comes from: the published setup I was reproducing, and the check it trusts. */
export const StoryGate: React.FC<AnimProps & StoryGateProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const size = BOARD.cell * 5;
  const bx = BOARD.cx - size / 2;
  const by = BOARD.cy - size / 2;
  const q = s.question;
  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily, color: C.text }}>
      {/* Where it starts: a published result I was reproducing. */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 290, display: 'flex', justifyContent: 'center', opacity: s.chip.opacity, transform: `translateY(${(1 - s.chip.opacity) * 16}px)` }}>
        <div
          style={{
            padding: '14px 32px',
            borderRadius: 999,
            background: alpha(C.card, 0.92),
            border: `2px solid ${alpha(C.muted, 0.5)}`,
            fontSize: 40,
            fontWeight: 700,
            whiteSpace: 'nowrap',
          }}
        >
          reproducing a DeepMind result
        </div>
      </div>

      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', left: 0, top: 0 }}>
        {/* The game: a small board. */}
        <g opacity={s.board.opacity} transform={`translate(0 ${(1 - s.board.opacity) * 20})`}>
          <rect x={bx - 8} y={by - 8} width={size + 16} height={size + 16} rx={12} fill={C.card} stroke={alpha(C.muted, 0.45)} strokeWidth={2.5} />
          {Array.from({ length: 25 }, (_, i) => {
            const c = i % 5;
            const r = Math.floor(i / 5);
            return <rect key={i} x={bx + c * BOARD.cell} y={by + r * BOARD.cell} width={BOARD.cell} height={BOARD.cell} fill={(c + r) % 2 ? alpha(C.muted, 0.1) : alpha(C.muted, 0.2)} />;
          })}
          {PIECES.map((pc, i) => (
            <Glyph key={i} kind={pc.kind} side={pc.side} x={bx + (pc.start[0] + 0.5) * BOARD.cell} y={by + (pc.start[1] + 0.5) * BOARD.cell} cell={BOARD.cell} />
          ))}
        </g>

        {/* AI writes the rules as code. */}
        <Arrow x1={BOARD.cx + size / 2 + 24} y1={BOARD.cy} x2={CARD.x - 18} y2={BOARD.cy} draw={s.arrow.draw} />

        {/* Code card -> check gate. */}
        <Arrow x1={TREE_X} y1={CARD.y + CARD.h + 62} x2={TREE_X} y2={GATE.y - 8} draw={s.down.draw} />

        {/* The planner: a search tree that grows out of the checked code. */}
        {TREE.map((n, k) => {
          if (n.level === 0) return null;
          const parentLevel = n.level - 1;
          const parentN = parentLevel === 0 ? 1 : 3;
          const parentI = parentLevel === 0 ? 0 : Math.floor(n.i / 2);
          const a = nodeXY(parentLevel, parentI, parentN);
          const b = nodeXY(n.level, n.i, n.n);
          const pop = s.tree.nodes[k].pop;
          if (pop <= 0) return null;
          return <line key={`e${k}`} x1={a.x} y1={a.y} x2={a.x + (b.x - a.x) * pop} y2={a.y + (b.y - a.y) * pop} stroke={alpha(C.accentText, 0.6)} strokeWidth={4} strokeLinecap="round" />;
        })}
        {s.tree.nodes[0].pop > 0 && (
          <line x1={TREE_X} y1={GATE.y + GATE.h + 4} x2={TREE_X} y2={GATE.y + GATE.h + 4 + (TREE_TOP - GATE.y - GATE.h - 4) * s.tree.nodes[0].pop} stroke={alpha(C.accentText, 0.6)} strokeWidth={4} strokeLinecap="round" />
        )}
        {TREE.map((n, k) => {
          const pop = s.tree.nodes[k].pop;
          if (pop <= 0) return null;
          const { x, y } = nodeXY(n.level, n.i, n.n);
          return <circle key={`n${k}`} cx={x} cy={y} r={(n.level === 0 ? 17 : 13) * pop} fill={n.level === 0 ? C.accent2 : C.accent} stroke={C.accentText} strokeWidth={2.5} />;
        })}
      </svg>

      {/* The AI that writes the code, drawn (same robot as the setup diagram), above its label. */}
      <Img
        src={staticFile('cast/robots/robot-teal.png')}
        style={{ position: 'absolute', left: (BOARD.cx + size / 2 + CARD.x) / 2 - 48, top: BOARD.cy - 172, width: 96, height: 96, objectFit: 'contain', opacity: s.arrow.draw }}
      />
      {/* "AI writes" over the arrow. */}
      <div style={{ position: 'absolute', left: BOARD.cx + size / 2 + 4, width: CARD.x - (BOARD.cx + size / 2) - 4, top: BOARD.cy - 70, textAlign: 'center', fontSize: 34, fontWeight: 700, color: C.accentText, opacity: s.arrow.draw }}>
        AI writes
      </div>

      {/* The world model: the game's rules, as code. */}
      <div
        style={{
          position: 'absolute',
          left: CARD.x,
          top: CARD.y,
          width: CARD.w,
          height: CARD.h,
          borderRadius: 24,
          background: alpha(C.card, 0.97),
          border: `3px solid ${alpha(C.accentText, 0.55)}`,
          boxShadow: `0 16px 40px ${alpha(C.bg0, 0.6)}`,
          opacity: s.card.opacity,
          transform: `translateY(${(1 - s.card.opacity) * 24}px)`,
          padding: '26px 34px',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ fontSize: 44, fontWeight: 800, color: C.text, letterSpacing: '-0.01em' }}>world model</div>
        <div style={{ height: 3, background: alpha(C.muted, 0.25), margin: '16px 0 14px' }} />
        {CODE_LINES.map((l, i) => (
          <div key={l} style={{ fontSize: 36, fontWeight: 600, color: C.accentText, lineHeight: 1.4, opacity: s.card.lines[i].opacity }}>
            {l}
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', left: CARD.x - 20, width: CARD.w + 40, top: CARD.y + CARD.h + 12, textAlign: 'center', fontSize: 32, fontWeight: 600, color: C.muted, opacity: s.card.tag.opacity }}>
        the game&apos;s rules, as code
      </div>

      {/* The check the planner trusts. */}
      <div
        style={{
          position: 'absolute',
          left: GATE.x,
          top: GATE.y,
          width: GATE.w,
          height: GATE.h,
          borderRadius: 20,
          background: alpha(C.card, 0.97),
          border: `4px solid ${alpha(C.ok, 0.35 + 0.4 * s.gate.tick.pop)}`,
          opacity: s.gate.opacity,
          transform: `scale(${0.92 + 0.08 * s.gate.opacity})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 22px 0 34px',
          boxSizing: 'border-box',
        }}
      >
        <span style={{ fontSize: 46, fontWeight: 800 }}>check</span>
        <span
          style={{
            width: 62,
            height: 62,
            borderRadius: 31,
            background: alpha(C.ok, 0.22),
            color: C.ok,
            fontSize: 44,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: s.gate.tick.pop,
            transform: `scale(${0.6 + 0.4 * s.gate.tick.pop})`,
          }}
        >
          ✓
        </span>
      </div>
      {q.pop > 0 && (
        <div
          style={{
            position: 'absolute',
            left: GATE.x + GATE.w - 40,
            top: GATE.y - 44,
            width: 64,
            height: 64,
            borderRadius: 32,
            background: C.accent,
            color: C.text,
            fontSize: 46,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: q.pop,
            transform: `scale(${(0.5 + 0.5 * q.pop) * (1 + 0.1 * q.pulse)})`,
            boxShadow: `0 0 30px ${alpha(C.accent, 0.6)}`,
          }}
        >
          ?
        </div>
      )}
      {/* The planner, drawn (public/cast): a robot standing at the root of its search tree. */}
      {s.tree.nodes[0].pop > 0 && (
        <Img
          src={staticFile('cast/robots/robot-graphite.png')}
          style={{
            position: 'absolute',
            left: TREE_X - PLANNER - 34,
            top: TREE_TOP - PLANNER / 2 - 10,
            width: PLANNER,
            height: PLANNER,
            objectFit: 'contain',
            opacity: s.tree.nodes[0].pop,
            transform: `scale(${0.7 + 0.3 * s.tree.nodes[0].pop})`,
          }}
        />
      )}
      <div style={{ position: 'absolute', left: TREE_X - 200, width: 400, top: LEVEL_Y[2] + 34, textAlign: 'center', fontSize: 34, fontWeight: 700, color: C.accentText, opacity: s.tree.label.opacity }}>
        planner plays on it
      </div>

      {/* The question this video answers. */}
      {q.pop > 0 && (
        <div style={{ position: 'absolute', left: 70, width: 440, top: 880, opacity: q.pop, transform: `translateY(${(1 - q.pop) * 24}px)` }}>
          <div style={{ fontSize: 60, fontWeight: 800, color: C.ok, lineHeight: 1.1 }}>✓ passed</div>
          <div style={{ fontSize: 88, fontWeight: 800, lineHeight: 1.1, marginTop: 10, letterSpacing: '-0.02em' }}>
            = right<span style={{ color: C.accentText, display: 'inline-block', transform: `scale(${1 + 0.12 * q.pulse})` }}>?</span>
          </div>
        </div>
      )}
    </div>
  );
};
