// Act II: one conversation forks into three tables; leakage is the paste's names glowing amber in
// the model's next reply. See RepairFork.state.ts.
import React from 'react';
import { interpolate } from 'remotion';
import { C, GRADIENT, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import { tx, type Lang } from '../types.ts';
import type { AnimProps } from './types.ts';
import { frameState, type RFProps, type RFState } from './RepairFork.state.ts';
import { OK, WARN } from './palette.ts';
import { Bubble, Chip, Glove, Piece, Puzzle, QuestionCard, QuoteLine, Stamp, Strip, type Face, type Seg } from './Pieces.tsx';

export { frameState };
export type { RFProps };

const ROW = { top: 330, h: 300, gap: 20 } as const;
const rowY = (i: number) => ROW.top + i * (ROW.h + ROW.gap);
const BAR = { x: 300, w: 260, h: 26, max: 25 } as const;
// Chips sit inside the row card (x 60-1020) with room for '−10.8 points'.
const CHIP_X = 755;

const pasteFace = (lines: string[]): Face => ({ tone: 'warn', lines, mono: true, textScale: 0.82 });
const PIECE_LINES = ['…and for the', 'upholstery', 'quotes', 'always use', 'this format…'];

const segsOf = (x?: { before: string; names: string; after: string }): Seg[] => (x ? [{ text: x.before }, { text: x.names, warn: true }, { text: x.after }] : []);

/** One table: the 10K chat with its stray piece set aside, the model's first reaction. */
const Table: React.FC<{ id: string; y: number; opacity: number }> = ({ id, y, opacity }) => (
  <g opacity={opacity}>
    <rect x={60} y={y} width={960} height={ROW.h} rx={26} fill={alpha(C.card, 0.75)} stroke={alpha(C.text, 0.1)} strokeWidth={2} />
    <Puzzle id={`${id}-pz`} x={84} y={y + 22} size={156} topic="run" />
    <Piece id={`${id}-pc`} cx={226} cy={y + 214} cell={60} rot={14} face={{ tone: 'warn', lines: ['…uphol-', 'stery…'], mono: true, textScale: 1 }} torn />
    <rect x={84} y={y + 196} width={110} height={16} rx={8} fill={alpha(C.muted, 0.35)} />
    <rect x={84} y={y + 224} width={80} height={16} rx={8} fill={alpha(C.muted, 0.35)} />
  </g>
);

const Rows: React.FC<{ p: AnimProps & RFProps; s: RFState }> = ({ p, s }) => {
  const f = s.fork.progress;
  const arms = p.arms;
  const mid = rowY(1);
  return (
    <>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        {[1, 0, 2].map((i) => {
          const y = i === 1 ? mid : interpolate(f, [0, 1], [mid, rowY(i)]);
          return <Table key={i} id={`t${i}`} y={y} opacity={i === 1 ? 1 : Math.min(1, f * 2.5)} />;
        })}
        {arms &&
          arms.map((a, i) => {
            const g = s.bars.grow[i];
            const y = rowY(i) + 244;
            const w = (a.value / BAR.max) * BAR.w * g;
            const col = i === 1 ? WARN.base : i === 2 ? OK.base : alpha(C.muted, 0.8);
            return (
              <g key={i} opacity={s.reply.typed[i] > 0 ? 1 : 0}>
                <rect x={BAR.x} y={y} width={BAR.w} height={BAR.h} rx={13} fill={alpha(C.bg0, 0.6)} />
                <rect x={BAR.x} y={y} width={w} height={BAR.h} rx={13} fill={col} />
              </g>
            );
          })}
      </svg>
      {f < 0.05 && (
        <div style={{ position: 'absolute', top: mid + 40, left: 300, width: 690, fontSize: 36, fontWeight: 600, color: C.muted, lineHeight: 1.25 }}>
          {p.lang === 'es' ? 'mismo chat, mismo pegado, misma primera respuesta' : 'same chat, same paste, same first reply'}
        </div>
      )}
      {[0, 1, 2].map((i) => {
        // Empty slot for the next message: the one thing that will differ between the rows.
        const o = (i === 1 ? 1 : Math.min(1, Math.max(0, f * 2.5 - 1.2))) * (1 - (s.user.appear[i] ?? 0)) * Math.min(1, Math.max(0, (f - 0.05) * 20));
        if (o <= 0.01) return null;
        const y = i === 1 ? mid : interpolate(f, [0, 1], [mid, rowY(i)]);
        return (
          <div key={`slot${i}`} style={{ position: 'absolute', top: y + 18, left: 690, width: 310, height: 64, borderRadius: 30, border: `3px dashed ${alpha(C.accentText, 0.55)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 700, color: alpha(C.accentText, 0.8), opacity: o, fontFamily }}>
            {p.lang === 'es' ? 'siguiente mensaje ?' : 'next message ?'}
          </div>
        );
      })}
      {arms &&
        arms.map((a, i) => (
          <React.Fragment key={i}>
            <Bubble x={290} y={rowY(i) + 14} w={710} user segs={[{ text: tx(a.user, p.lang) }]} fontSize={36} opacity={s.user.appear[i]} />
            {s.reply.typed[i] > 0 && (
              <Bubble
                x={290}
                y={rowY(i) + (i === 2 ? 146 : 96)}
                w={i === 1 ? 700 : 420}
                segs={i === 1 ? segsOf(p.reply) : []}
                skeleton={i === 1 ? 0 : 2}
                fontSize={i === 1 ? 32 : 24}
                typed={s.reply.typed[i]}
                glow={s.reply.glow[i]}
              />
            )}
            {s.bars.grow[i] > 0 && (
              <div style={{ position: 'absolute', top: rowY(i) + 216, left: BAR.x + BAR.w + 18, fontSize: 58, fontWeight: 800, letterSpacing: '-0.03em', color: i === 1 ? WARN.text : i === 2 ? OK.text : C.text, opacity: Math.min(1, s.bars.grow[i] * 3) }}>
                {a.display}
              </div>
            )}
          </React.Fragment>
        ))}
      {p.ratio && (
        <ChipNote main={tx(p.ratio, p.lang)} note={p.p1 ? tx(p.p1, p.lang) : ''} top={rowY(1) + 204} pop={s.bars.ratio} note01={s.bars.p1} colour={WARN} size={50} />
      )}
      {p.drop && <ChipNote main={tx(p.drop, p.lang)} note={p.p2 ? tx(p.p2, p.lang) : ''} top={rowY(2) + 210} pop={s.bars.drop} note01={s.bars.p2} colour={OK} size={30} />}
      {p.strip && <Strip text={tx(p.strip, p.lang)} top={252} opacity={s.strip.opacity} />}
    </>
  );
};

/** A ratio or difference chip at the right end of a row, with its p-value under it. */
const ChipNote: React.FC<{ main: string; note: string; top: number; pop: number; note01: number; colour: { base: string; text: string }; size: number }> = ({ main, note, top, pop, note01, colour, size }) => (
  <div style={{ position: 'absolute', top, left: CHIP_X, width: 250, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
    <span style={{ opacity: pop, transform: `scale(${interpolate(pop, [0, 1], [1.5, 1])})`, padding: '2px 16px', borderRadius: 14, background: C.bg0, border: `3px solid ${colour.base}`, fontSize: size, fontWeight: 800, color: colour.text, whiteSpace: 'nowrap' }}>{main}</span>
    <span style={{ opacity: note01, fontSize: 22, fontWeight: 600, color: C.muted, whiteSpace: 'nowrap' }}>{note}</span>
  </div>
);

const Teaser: React.FC<{ p: AnimProps & RFProps; s: RFState }> = ({ p, s }) => (
  <>
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
      <rect x={60} y={300} width={960} height={420} rx={30} fill={alpha(C.card, 0.6)} />
      <Puzzle id="tz" x={110} y={340} size={340} topic="run" />
      <Piece id="tzp" cx={720} cy={560} cell={150} rot={12} face={pasteFace(PIECE_LINES)} torn />
      <text x={720} y={690} textAnchor="middle" fontFamily={fontFamily} fontSize={30} fontWeight={600} fill={C.muted}>
        {p.lang === 'es' ? 'apartada' : 'set aside'}
      </text>
    </svg>
    {p.arms && <Bubble x={60} y={770} w={960} user segs={[{ text: tx(p.arms[1].user, p.lang) }]} fontSize={46} opacity={s.user.appear[1]} />}
    {s.reply.typed[1] > 0 && <Bubble x={60} y={890} w={880} segs={segsOf(p.reply)} fontSize={42} typed={s.reply.typed[1]} glow={s.reply.glow[1]} />}
    {p.ghost && (
      <div style={{ position: 'absolute', top: 1110, left: 0, width: 1080, textAlign: 'center', opacity: s.ghost.opacity }}>
        <span style={{ fontSize: 110, fontWeight: 800, color: WARN.text, textShadow: `0 0 40px ${alpha(WARN.base, 0.8)}` }}>{tx(p.ghost, p.lang)}</span>
      </div>
    )}
  </>
);

const Measure: React.FC<{ p: AnimProps & RFProps; s: RFState }> = ({ p, s }) => (
  <>
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
      <Piece id="mp" cx={540} cy={interpolate(s.piece.rise, [0, 1], [760, 680])} cell={270} rot={-5} face={pasteFace(PIECE_LINES)} torn glow={s.piece.glow} opacity={s.piece.rise} />
    </svg>
    {p.question && <QuestionCard text={tx(p.question, p.lang)} top={262} pop={s.card.pop} />}
    {p.paste && (
      <div style={{ position: 'absolute', top: 900, left: 90, width: 900, textAlign: 'center', fontSize: 40, fontWeight: 600, fontFamily: "ui-monospace, Menlo, 'SF Mono', monospace", color: C.muted, opacity: s.piece.rise }}>
        {p.paste.before}
        <span style={{ color: s.piece.glow > 0.2 ? WARN.text : C.text, background: alpha(WARN.base, 0.25 * s.piece.glow), borderRadius: 8, padding: '0 6px', textShadow: `0 0 ${20 * s.piece.glow}px ${alpha(WARN.base, 0.9)}` }}>{p.paste.names}</span>
        {p.paste.after}
      </div>
    )}
    {p.entities && (
      <div style={{ position: 'absolute', top: 1040, left: 60, width: 960, display: 'flex', justifyContent: 'center', gap: 22 }}>
        {p.entities.map((e, i) => (
          <span key={i} style={{ opacity: s.tags.appear[i], transform: `scale(${interpolate(s.tags.appear[i], [0, 1], [1.4, 1])})`, padding: '10px 26px', borderRadius: 999, border: `3px solid ${WARN.base}`, color: WARN.text, fontSize: 40, fontWeight: 800 }}>
            {tx(e, p.lang)}
          </span>
        ))}
      </div>
    )}
    {p.chip && <Chip text={tx(p.chip, p.lang)} top={1170} opacity={s.chip.opacity} fontSize={32} />}
  </>
);

const Hold: React.FC<{ p: AnimProps & RFProps; s: RFState }> = ({ p, s }) => {
  const r = s.piece.rise;
  const cy = interpolate(r, [0, 1], [820, 560]);
  return (
    <>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <circle cx={540} cy={560} r={260 * r} fill={alpha(WARN.base, 0.1 * r)} />
        <Piece id="hp" cx={540 - 40 * r} cy={cy} cell={250} rot={interpolate(r, [0, 1], [10, -6])} face={pasteFace(PIECE_LINES)} torn glow={s.piece.glow} />
        <Glove x={540 - 40 * r} y={cy + 225} size={1.3} rot={-6} />
      </svg>
      <div style={{ position: 'absolute', left: 60, width: 960, top: 930, height: 360, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <QuoteLine words={s.quote.words} emphasis={s.quote.emphasis} fontSize={86} />
      </div>
    </>
  );
};

const Turns: React.FC<{ p: AnimProps & RFProps; s: RFState }> = ({ p, s }) => {
  const T = p.turns;
  const xs = [60, 385, 710];
  const W = 310;
  return (
    <>
      {p.arms && <Bubble x={60} y={320} w={960} user segs={[{ text: tx(p.arms[1].user, p.lang) }]} fontSize={48} opacity={s.user.appear[1]} />}
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        {[0, 1, 2].map((k) => {
          const e = Math.min(1, Math.max(0, s.turns.echo * 1.3 - k * 0.15));
          return <rect key={k} x={xs[0] - 30 * e - k * 6} y={520 - 30 * e - k * 6} width={W + 60 * e + k * 12} height={190 + 60 * e + k * 12} rx={30 + 20 * e} fill="none" stroke={WARN.base} strokeWidth={5} opacity={(1 - e) * 0.8 * (e > 0 ? 1 : 0)} />;
        })}
        {[1, 2].map((i) => (
          <path key={i} d={`M${xs[i] - 8} 660 l-14 -14 M${xs[i] - 8} 660 l-14 14`} stroke={alpha(C.muted, 0.6 * s.turns.appear[i])} strokeWidth={5} strokeLinecap="round" />
        ))}
      </svg>
      {[0, 1, 2].map((i) => (
        <React.Fragment key={i}>
          <div style={{ position: 'absolute', left: xs[i], top: 520, width: W, opacity: s.turns.appear[i], transform: `translateY(${(1 - s.turns.appear[i]) * 30}px)` }}>
            <Bubble x={0} y={0} w={W} segs={i === 0 ? segsOf(p.reply ? { before: '…', names: p.reply.names, after: '…' } : undefined) : []} skeleton={i === 0 ? 0 : 3} fontSize={i === 0 ? 40 : 30} glow={s.reply.glow[0]} />
          </div>
          {T && (
            <>
              <div style={{ position: 'absolute', left: xs[i] - 10, width: W + 20, top: 840, textAlign: 'center', fontSize: 38, fontWeight: 700, color: C.muted, opacity: s.turns.appear[i] }}>
                {tx(T.labels[i], p.lang)}
              </div>
              <div style={{ position: 'absolute', left: xs[i] - 10, width: W + 20, top: 905, textAlign: 'center', fontSize: 88, fontWeight: 800, letterSpacing: '-0.03em', color: i === 0 ? WARN.text : C.text, opacity: s.turns.appear[i] }}>
                {T.values[i]}
              </div>
            </>
          )}
        </React.Fragment>
      ))}
      {T?.tag && <Chip text={tx(T.tag, p.lang)} top={1110} opacity={s.turns.tag} fontSize={36} />}
    </>
  );
};

const Verdict: React.FC<{ p: AnimProps & RFProps; s: RFState }> = ({ p, s }) => {
  const v = p.verdict;
  if (!v) return null;
  const [a0, a1, a2] = s.verdict.appear;
  return (
    <>
      <div style={{ position: 'absolute', top: 300, left: 60, width: 960, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24, opacity: a0 }}>
        <span style={{ fontSize: 80, fontWeight: 800, color: WARN.text }}>✗</span>
        <span style={{ position: 'relative', fontSize: 80, fontWeight: 800, color: C.text, opacity: 1 - 0.4 * s.verdict.strike }}>
          {tx(v.no, p.lang)}
          <span style={{ position: 'absolute', left: -8, top: '52%', height: 10, borderRadius: 5, width: `${s.verdict.strike * 106}%`, background: WARN.base }} />
        </span>
      </div>
      <div style={{ position: 'absolute', top: 440, left: 0, width: 1080, textAlign: 'center', fontSize: 70, color: C.muted, opacity: a1 }}>↓</div>
      <div style={{ position: 'absolute', top: 560, left: 60, width: 960, display: 'flex', justifyContent: 'center', opacity: a1, transform: `scale(${interpolate(a1, [0, 1], [0.9, 1])})` }}>
        <div style={{ display: 'flex', gap: 22, alignItems: 'flex-start', padding: '30px 36px', borderRadius: 28, background: C.card, border: `4px solid ${C.accentText}`, boxShadow: `0 0 60px ${alpha(C.accent, 0.5)}` }}>
          <span style={{ flex: 'none', width: 76, height: 76, borderRadius: 38, background: GRADIENT, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 50, fontWeight: 800 }}>✓</span>
          <span style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.15 }}>{tx(v.yes, p.lang)}</span>
        </div>
      </div>
      <Stamp value={tx(v.stamp, p.lang)} x={0} y={890} w={1080} pop={s.verdict.stamp} size={72} tone="accent" rot={-3} />
      <div style={{ position: 'absolute', top: 1120, left: 60, width: 960, display: 'flex', justifyContent: 'center', gap: 18, alignItems: 'center', opacity: a2, fontSize: 44, fontWeight: 700, color: OK.text }}>
        <span>✓</span>
        <span>{tx(v.also, p.lang)}</span>
      </div>
    </>
  );
};

/** Act II: what happens after you tell it. */
export const RepairFork: React.FC<AnimProps & RFProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur, p.lang as Lang);
  let body: React.ReactNode = null;
  if (p.mode === 'teaser') body = <Teaser p={p} s={s} />;
  else if (p.mode === 'fork' || p.mode === 'arms' || p.mode === 'bars') body = <Rows p={p} s={s} />;
  else if (p.mode === 'measure') body = <Measure p={p} s={s} />;
  else if (p.mode === 'hold') body = <Hold p={p} s={s} />;
  else if (p.mode === 'turns') body = <Turns p={p} s={s} />;
  else if (p.mode === 'verdict') body = <Verdict p={p} s={s} />;
  return <div style={{ position: 'absolute', inset: 0, fontFamily, color: C.text }}>{body}</div>;
};
