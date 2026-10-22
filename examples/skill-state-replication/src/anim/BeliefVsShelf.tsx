import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, GRADIENT, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { Stamp } from './pieces.tsx';
import { CELLS, RANK, RANK_FROM, frameState, type BeliefVsShelfProps, type Cell } from './BeliefVsShelf.state.ts';

export { frameState };
export type { BeliefVsShelfProps };

const B = { x0: 75, w: 170, gap: 20, beliefY: 590, realY: 850, h: 130 } as const;
const cx = (i: number) => B.x0 + i * (B.w + B.gap);
const caps: React.CSSProperties = { fontSize: 26, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', whiteSpace: 'nowrap' };
const TONE = { plain: C.text, warm: C.warm, ok: C.ok } as const;

const CellBox: React.FC<{ c: Cell; i: number; y: number; belief: boolean; hideLot?: boolean }> = ({ c, i, y, belief, hideLot }) => {
  const tone = TONE[c.tone];
  return (
    <div
      style={{
        position: 'absolute',
        left: cx(i),
        top: y,
        width: B.w,
        height: B.h,
        borderRadius: 16,
        background: belief ? C.card : alpha(C.bg1, 0.9),
        border: `3px solid ${c.tone !== 'plain' ? tone : belief ? alpha(C.accentText, 0.6) : alpha(C.muted, 0.45)}`,
        boxShadow: c.flash > 0 ? `0 0 ${36 * c.flash}px ${alpha(tone, 0.8 * c.flash)}` : 'none',
      }}
    >
      <div style={{ position: 'absolute', left: 14, top: 8, fontSize: 24, fontWeight: 700, color: C.muted }}>shelf {c.shelf}</div>
      {!hideLot && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 46, textAlign: 'center', fontSize: 36, fontWeight: 800, color: c.lot ? tone : alpha(C.muted, 0.6) }}>{c.lot || 'empty'}</div>
      )}
      {c.note && c.noteOp > 0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 92, textAlign: 'center', fontSize: 21, fontWeight: 700, color: C.warm, opacity: c.noteOp, whiteSpace: 'nowrap' }}>{c.note}</div>
      )}
    </div>
  );
};

export const BeliefVsShelf: React.FC<AnimProps & BeliefVsShelfProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const r = s.rank;
  const i3 = CELLS.indexOf(3);
  const i6 = CELLS.indexOf(6);
  const i7 = CELLS.indexOf(7);
  const palX = cx(i7) + (cx(i3) - cx(i7)) * s.move;
  return (
    <AbsoluteFill style={{ fontFamily, color: C.text }}>
      {/* rank: the three arms at 200 steps */}
      {r.opacity > 0 && (
        <div style={{ position: 'absolute', inset: 0, opacity: r.opacity }}>
          <div style={{ ...caps, position: 'absolute', left: 75, top: 445, color: C.muted, opacity: r.header }}>200 steps · same setup as Gemini</div>
          {RANK.map((row, i) => {
            const g = r.bars[i];
            const hot = row.last ? r.hot : 0;
            const color = row.last ? C.warm : C.text;
            const w = (930 * (row.value - RANK_FROM) * g) / (1 - RANK_FROM);
            return (
              <div key={row.label} style={{ position: 'absolute', left: 75, top: 520 + i * 160, width: 930, height: 140, opacity: g > 0 ? 1 : 0 }}>
                <div style={{ position: 'absolute', left: 0, top: 0, fontSize: 40, fontWeight: 800, color: row.last ? (hot > 0.5 ? C.warm : C.text) : C.muted }}>{`${i + 1} · ${row.label}`}</div>
                <div style={{ position: 'absolute', right: 0, top: -8, fontSize: 60, fontWeight: 800, color, opacity: g, fontVariantNumeric: 'tabular-nums' }}>{row.text}</div>
                <div style={{ position: 'absolute', left: 0, top: 70, width: 930, height: 44, borderRadius: 12, background: alpha(C.muted, 0.12) }} />
                <div style={{ position: 'absolute', left: 0, top: 70, width: w, height: 44, borderRadius: 12, background: row.last ? (hot > 0.5 ? C.warm : alpha(C.muted, 0.6)) : i === 0 ? GRADIENT : alpha(C.muted, 0.6), boxShadow: hot > 0 ? `0 0 ${30 * hot}px ${alpha(C.warm, 0.6 * hot)}` : 'none' }} />
              </div>
            );
          })}
          <div style={{ position: 'absolute', left: 75, top: 1000, fontSize: 26, fontWeight: 600, color: C.muted, opacity: r.bars[2] }}>bars start at 0.90 · Claude Haiku 4.5</div>
          <Stamp text="LAST" pop={r.last} color={C.warm} size={70} left={640} top={1060} rotate={-8} />
        </div>
      )}

      {/* the replay: belief over reality */}
      {s.board.opacity > 0 && (
        <div style={{ position: 'absolute', inset: 0, opacity: s.board.opacity }}>
          <div style={{ position: 'absolute', left: 75, top: 432, fontSize: 60, fontWeight: 800, fontVariantNumeric: 'tabular-nums', opacity: s.step.opacity }}>step {s.step.value}</div>
          <div style={{ ...caps, position: 'absolute', right: 75, top: B.beliefY - 44, color: C.accentText }}>notepad · what it believes</div>
          <div style={{ ...caps, position: 'absolute', right: 75, top: B.realY - 44, color: C.muted }}>shelves · what is really there</div>
          {s.belief.map((c, i) => (
            <CellBox key={`b${c.shelf}`} c={c} i={i} y={B.beliefY} belief />
          ))}
          {s.reality.map((c, i) => (
            <CellBox key={`r${c.shelf}`} c={i === i3 && s.move > 0 ? { ...c, lot: '' } : c} i={i} y={B.realY} belief={false} hideLot={(i === i7 && s.move > 0) || (i === i3 && s.move > 0)} />
          ))}
          {/* the pallet that really moved, 7 → 3 */}
          {s.move > 0 && (
            <div style={{ position: 'absolute', left: palX, top: B.realY + 46 - Math.sin(Math.PI * Math.min(1, s.move)) * 70, width: B.w, textAlign: 'center', fontSize: 36, fontWeight: 800, color: C.text }}>SKU-K</div>
          )}
          {s.reality.map((_, i) =>
            (i === i7 && s.move > 0.5) || (i === i3 && s.move < 0.5 && s.move > 0) ? (
              <div key={`e${i}`} style={{ position: 'absolute', left: cx(i), top: B.realY + 46, width: B.w, textAlign: 'center', fontSize: 36, fontWeight: 800, color: alpha(C.muted, 0.6) }}>empty</div>
            ) : null,
          )}
          {/* match row */}
          {s.match.map((mt, i) => {
            const bad = mt.sym === '≠';
            return (
              <div key={`m${i}`} style={{ position: 'absolute', left: cx(i), top: B.beliefY + B.h + 4, width: B.w, textAlign: 'center', fontSize: 56, fontWeight: 800, color: bad ? C.marker : C.ok, opacity: 0.55 + 0.45 * mt.pulse, transform: `scale(${1 + 0.25 * mt.pulse})` }}>
                {mt.sym}
              </div>
            );
          })}
          {/* slip: the arcs */}
          <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
            {s.arcs.move > 0 && (
              <path
                d={`M ${cx(i7) + B.w / 2} ${B.realY + B.h + 6} C ${cx(i7) + B.w / 2} ${B.realY + B.h + 70}, ${cx(i3) + B.w / 2} ${B.realY + B.h + 70}, ${cx(i3) + B.w / 2} ${B.realY + B.h + 6}`}
                fill="none"
                stroke={C.ok}
                strokeWidth={6}
                pathLength={1}
                strokeDasharray={`${s.arcs.move} 1`}
                opacity={Math.min(1, s.arcs.move * 3)}
              />
            )}
            {s.arcs.copy > 0 && (
              <path
                d={`M ${cx(i6) + B.w / 2} ${B.beliefY - 4} C ${cx(i6) + B.w / 2} ${B.beliefY - 40}, ${cx(i3) + B.w / 2 + 40} ${B.beliefY - 40}, ${cx(i3) + B.w / 2 + 40} ${B.beliefY - 4}`}
                fill="none"
                stroke={C.warm}
                strokeWidth={6}
                strokeDasharray="10 8"
                opacity={Math.min(1, s.arcs.copy * 2)}
              />
            )}
          </svg>
          {/* banner */}
          <div style={{ position: 'absolute', left: 0, width: 1080, top: 1030, textAlign: 'center', fontSize: 48, fontWeight: 800, color: C.ok, opacity: s.banner.a, whiteSpace: 'nowrap' }}>{s.banner.textA}</div>
          <div style={{ position: 'absolute', left: 0, width: 1080, top: 1100, textAlign: 'center', fontSize: 48, fontWeight: 800, color: s.banner.textB.startsWith('ship') ? C.warm : C.marker, opacity: s.banner.b, whiteSpace: 'nowrap' }}>{s.banner.textB}</div>
          <Stamp text="ACTION REJECTED" pop={s.rejected} color={C.marker} size={50} left={190} width={700} top={1175} rotate={-4} />
          {/* check: the schema passes the wrong line */}
          {s.schema > 0 && (
            <div style={{ position: 'absolute', left: cx(i3) + 6, top: B.beliefY + 88, padding: '2px 12px', borderRadius: 10, background: C.ok, color: C.bg0, fontSize: 24, fontWeight: 800, opacity: s.schema, transform: `scale(${1.4 - 0.4 * s.schema})`, whiteSpace: 'nowrap' }}>schema ✓</div>
          )}
          {[0, 1].map((k) => {
            const a = s.tiles[k];
            if (a <= 0) return null;
            const haiku = k === 0;
            return (
              <div key={`t${k}`} style={{ position: 'absolute', left: k === 0 ? 75 : 565, top: 1030, width: 440, height: 240, borderRadius: 20, background: C.card, border: `3px solid ${haiku ? C.marker : alpha(C.muted, 0.5)}`, opacity: a, transform: `scale(${0.9 + 0.1 * a})`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <div style={{ ...caps, color: haiku ? C.text : C.muted }}>{haiku ? 'Haiku' : 'Gemini'}</div>
                <div style={{ fontSize: 96, fontWeight: 800, lineHeight: 1.05, color: haiku ? C.marker : C.muted, fontVariantNumeric: 'tabular-nums' }}>{haiku ? '17 / 24' : '0 / 75'}</div>
                <div style={{ fontSize: 26, fontWeight: 700, color: C.muted, textAlign: 'center', lineHeight: 1.2 }}>{haiku ? 'runs with a wrong patch · 200 steps' : 'episodes with a wrong patch'}</div>
              </div>
            );
          })}
        </div>
      )}
    </AbsoluteFill>
  );
};
