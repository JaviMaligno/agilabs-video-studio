// Act I: fit it, repaint around it, or turn it over. See PieceInspector.state.ts.
import React from 'react';
import { interpolate } from 'remotion';
import { C, GRADIENT, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import { tx, type Lang } from '../types.ts';
import type { AnimProps } from './types.ts';
import { frameState, hoverOffset, type PIProps, type PIState } from './PieceInspector.state.ts';
import { MovingPicture, type Topic } from './Pictures.tsx';
import { OK, WARN } from './palette.ts';
import { Bubble, Chip, Glove, Piece, Puzzle, QuestionCard, QuoteLine, Stamp, Strip, Window, holeCentre, type Face } from './Pieces.tsx';

export { frameState };
export type { PIProps };

const MOVE_TITLE = 'Moving house';
const CLASH_FACE = (lines: string[]): Face => ({ tone: 'indigo', lines, textScale: 1.05 });
const TELL_FACE: Face = { tone: 'warn', lines: ['Bruno,', 'copy', 'this…'], mono: true, textScale: 1.1 };
const TELL_BACK: Face = { tone: 'blank', lines: ['Bruno,', 'copy this', 'exactly…'], textScale: 1.05 };

/** Single-puzzle layout (hook, repaint, quote). */
const ONE = (() => {
  const size = 600;
  const header = 64;
  const pad = 18;
  const winW = size + 2 * pad;
  const winX = (1080 - winW) / 2;
  const winY = 356;
  return { size, header, winW, winX, winY, winH: header + 2 * pad + size, px: winX + pad, py: winY + header + pad };
})();

/** Three slots in a row (levels, meters). */
const SLOT = { size: 270, y: 380, xs: [60, 405, 750] } as const;
const slotCentre = (i: number) => SLOT.xs[i] + SLOT.size / 2;

const Root: React.FC<{ children: React.ReactNode; shake?: number }> = ({ children }) => <div style={{ position: 'absolute', inset: 0, fontFamily, color: C.text }}>{children}</div>;

/** The house-move chat: user bubble, window, puzzle, the contradiction piece and the brush. */
const MoveScene: React.FC<{ p: AnimProps & PIProps; s: PIState }> = ({ p, s }) => {
  const h = holeCentre(ONE.px, ONE.py, ONE.size);
  const seat = s.seat.progress;
  const piece = (
    <Piece
      id="clash"
      cx={h.x + (1 - seat) * h.cell * 0.15}
      cy={h.y + hoverOffset(seat, s.hover) * h.cell}
      cell={h.cell}
      rot={interpolate(seat, [0, 1], [-10, 0])}
      scale={interpolate(seat, [0, 1], [1.75, 1])}
      face={CLASH_FACE(p.clash ?? [])}
      glow={s.glow.opacity}
      flash={s.flash}
    />
  );
  const r = s.repaint.progress;
  return (
    <>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <g transform={`translate(${s.shake} 0)`}>
          <Window x={ONE.winX} y={ONE.winY} w={ONE.winW} h={ONE.winH} header={ONE.header} title={p.title ? tx(p.title, p.lang) : MOVE_TITLE} />
          <Puzzle id="mv" x={ONE.px} y={ONE.py} size={ONE.size} picture={<MovingPicture id="mvp" repaint={r} />} />
          {piece}
          {s.brush.opacity > 0 && <Glove x={ONE.px + 40 + r * (ONE.size - 80)} y={ONE.py + 300 + 260 * 0.95} size={0.95} rot={8} brush opacity={s.brush.opacity} />}
        </g>
      </svg>
      {p.user && <Bubble x={60} y={262} w={960} user segs={[{ text: tx(p.user, p.lang) }]} fontSize={40} opacity={s.user.opacity} />}
    </>
  );
};

const Tally: React.FC<{ value: string; label: string; st: PIState['tally']; y: number }> = ({ value, label, st, y }) => (
  <div style={{ position: 'absolute', left: 0, width: 1080, top: y, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 26, opacity: st.opacity, transform: `scale(${interpolate(st.pop, [0, 1], [0.6, 1])})` }}>
    <div style={{ fontSize: 124, fontWeight: 800, lineHeight: 1, color: WARN.text, letterSpacing: '-0.04em', whiteSpace: 'nowrap' }}>{value}</div>
    <div style={{ fontSize: 44, fontWeight: 700, lineHeight: 1.15, color: C.text, maxWidth: 420 }}>{label}</div>
  </div>
);

/** The part-1 wall: 24 conversations, every stray piece hammered in. */
const WALL = (() => {
  const cols = 6;
  const gap = 16;
  const cell = (960 - (cols - 1) * gap) / cols;
  const top = 340;
  return { cols, gap, cell, top, at: (i: number) => ({ x: 60 + (i % cols) * (cell + gap), y: top + Math.floor(i / cols) * (cell + gap) }), h: 4 * cell + 3 * gap };
})();
const WALL_TOPICS: Topic[] = ['garden', 'run', 'camera', 'bread', 'move', 'bill', 'school', 'japan'];
const LIFTED = 8;
const LIFT_FACE: Face = { tone: 'warn', lines: ['## v2.4.0', '- fix: parser', '- feat: yaml'], mono: true, textScale: 0.95 };

const Bin: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill="none" stroke={alpha(C.muted, 0.7)} strokeWidth={6} strokeLinecap="round">
    <path d="M-50 -40 h100" />
    <path d="M-18 -40 v-12 h36 v12" />
    <path d="M-40 -40 l8 100 h64 l8 -100" />
    <path d="M-14 -20 v60 M14 -20 v60" />
  </g>
);

const WallScene: React.FC<{ p: AnimProps & PIProps; s: PIState }> = ({ p, s }) => {
  const a = s.wall.appear;
  const lifted = WALL.at(LIFTED);
  const lc = holeCentre(lifted.x, lifted.y, WALL.cell);
  const lp = s.lift.progress;
  const target = { x: 540, y: 640 };
  return (
    <>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <g transform={`translate(${s.shake} 0)`}>
          {Array.from({ length: 24 }, (_, i) => {
            const at = WALL.at(i);
            const k = Math.min(1, Math.max(0, a * 1.7 - (i / 24) * 0.7));
            const hc = holeCentre(at.x, at.y, WALL.cell);
            return (
              <g key={i} opacity={k * (1 - s.wall.dim)}>
                <Puzzle id={`w${i}`} x={at.x} y={at.y} size={WALL.cell} topic={WALL_TOPICS[Math.floor(i / 3) % 8]} frame={alpha([C.accentText, C.accent2, C.muted][i % 3], 0.9)} />
                {(i !== LIFTED || p.mode === 'recap') && <Piece id={`wp${i}`} cx={hc.x} cy={hc.y - (1 - k) * 30} cell={hc.cell} face={{ tone: 'warn' }} />}
              </g>
            );
          })}
          {p.mode === 'recap' && (
            <g opacity={s.stamp.opacity}>
              <Bin x={540} y={1150} s={1.3} />
            </g>
          )}
          {p.mode === 'lift' && (
            <>
              <circle cx={target.x} cy={target.y} r={250 * lp} fill={alpha(C.accent, 0.12 * lp)} />
              <Piece
                id="lifted"
                cx={interpolate(lp, [0, 1], [lc.x, target.x])}
                cy={interpolate(lp, [0, 1], [lc.y, target.y])}
                cell={lc.cell}
                scale={interpolate(lp, [0, 1], [1, 260 / lc.cell])}
                rot={interpolate(lp, [0, 1], [0, -6])}
                flip={s.lift.flip}
                face={LIFT_FACE}
                back={{ tone: 'blank' }}
              />
            </>
          )}
        </g>
      </svg>
      {p.strip && <Strip text={tx(p.strip, p.lang)} top={256} opacity={p.mode === 'lift' ? 1 - s.wall.dim : s.strip.opacity} />}
      {p.mode === 'recap' && p.stamp && <Stamp value={p.stamp.value} label={p.stamp.label ? tx(p.stamp.label, p.lang) : undefined} x={0} y={1010} w={1080} pop={s.stamp.pop} size={110} />}
      {p.mode === 'lift' && p.tag && (
        <div style={{ position: 'absolute', top: 960, left: 90, width: 900, textAlign: 'center', opacity: s.lift.tag }}>
          <span style={{ display: 'inline-block', padding: '16px 30px', borderRadius: 16, border: `3px solid ${alpha(C.text, 0.4)}`, background: alpha(C.bg0, 0.85), fontSize: 46, fontWeight: 700, color: C.text }}>
            {tx(p.tag, p.lang)}
          </span>
        </div>
      )}
    </>
  );
};

const SLOT_TOPICS: (Topic | 'moving')[] = ['run', 'garden', 'moving'];

/** Three conversations, one kind of paste each. */
const Slots: React.FC<{ p: AnimProps & PIProps; s: PIState; y?: number }> = ({ p, s, y = SLOT.y }) => {
  const faces: Face[] = [{ tone: 'warn', topic: 'recipe' }, TELL_FACE, { tone: 'indigo', lines: ['Seville', '3 July'], textScale: 1.3 }];
  return (
    <g opacity={s.slots.appear}>
      {SLOT.xs.map((x, i) => {
        const h = holeCentre(x, y, SLOT.size);
        const d = s.slots.drops[i];
        const topic = SLOT_TOPICS[i];
        return (
          <g key={i} transform={`translate(0 ${(1 - s.slots.appear) * 30})`}>
            <Puzzle id={`sl${i}`} x={x} y={y} size={SLOT.size} topic={topic === 'moving' ? 'move' : topic} picture={topic === 'moving' ? <MovingPicture id="slm" repaint={0} /> : undefined} />
            <Piece
              id={`sp${i}`}
              cx={h.x}
              cy={h.y - (1 - d) * h.cell * 1.6}
              cell={h.cell}
              rot={(1 - d) * -12}
              opacity={Math.min(1, d * 4)}
              face={faces[i]}
              back={i === 1 ? TELL_BACK : undefined}
              torn={i === 1}
              flip={i === 1 ? s.slots.flip2 : 1}
              glow={i === 1 && s.slots.flip2 < 0 ? 0.8 : 0}
              glowTone="warn"
            />
          </g>
        );
      })}
    </g>
  );
};

const SlotLabels: React.FC<{ p: AnimProps & PIProps; s: PIState; y: number; colours?: string[] }> = ({ p, s, y, colours }) => (
  <>
    {(p.slots ?? ['', '', '']).map((l, i) => (
      <div key={i} style={{ position: 'absolute', top: y, left: SLOT.xs[i] - 20, width: SLOT.size + 40, textAlign: 'center', fontSize: 36, fontWeight: 700, lineHeight: 1.1, opacity: s.slots.labels[i], color: colours?.[i] ?? C.text }}>
        {tx(l, p.lang)}
      </div>
    ))}
  </>
);

const TornNote: React.FC<{ lines: string[]; x: number; y: number; w: number; opacity: number; glow?: number }> = ({ lines, x, y, w, opacity, glow = 0 }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      opacity,
      padding: '24px 70px 24px 34px',
      background: `linear-gradient(135deg, ${WARN.deep}, ${alpha(WARN.deep, 0.8)})`,
      clipPath: 'polygon(0 0, 100% 0, 94% 12%, 100% 25%, 94% 38%, 100% 50%, 94% 62%, 100% 75%, 94% 88%, 100% 100%, 0 100%)',
      color: C.text,
      fontSize: 44,
      fontWeight: 600,
      fontStyle: 'italic',
      lineHeight: 1.22,
      filter: glow > 0 ? `drop-shadow(0 0 ${24 * glow}px ${alpha(WARN.base, 0.8 * glow)})` : undefined,
    }}
  >
    {lines.map((l, i) => (
      <div key={i}>{l}</div>
    ))}
  </div>
);

const LevelsScene: React.FC<{ p: AnimProps & PIProps; s: PIState }> = ({ p, s }) => {
  const panel = s.tells.panel;
  const note = p.note ?? [];
  return (
    <>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <g transform={`translate(0 0)`}>
          <Slots p={p} s={s} />
        </g>
      </svg>
      <SlotLabels p={p} s={s} y={SLOT.y + SLOT.size + 22} />
      {/* Beat 2: the back of the tell piece, and the four kinds of tell. */}
      <div style={{ position: 'absolute', inset: 0, opacity: 1 - panel }}>
        <div style={{ position: 'absolute', top: 744, left: 120, fontSize: 30, fontWeight: 700, color: WARN.text, opacity: s.tells.note, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {p.lang === 'es' ? 'el reverso' : 'on the back'}
        </div>
        <TornNote lines={note} x={120} y={788} w={840} opacity={s.tells.note} glow={s.tells.note} />
        {(p.tells ?? ['', '', '', '']).map((tl, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: 960 + i * 78,
              left: 140,
              display: 'flex',
              alignItems: 'center',
              gap: 22,
              fontSize: 38,
              fontWeight: 600,
              opacity: s.tells.appear[i],
              transform: `translateX(${(1 - s.tells.appear[i]) * -30}px)`,
            }}
          >
            <span style={{ width: 40, height: 40, borderRadius: 20, background: WARN.base, color: C.bg0, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 28, fontWeight: 800 }}>✓</span>
            <span>{tx(tl, p.lang)}</span>
          </div>
        ))}
      </div>
      {/* Beat 3: the contradiction, against what the user just said. */}
      <div style={{ position: 'absolute', inset: 0, opacity: panel }}>
        <div style={{ position: 'absolute', top: 752, left: 120, fontSize: 30, fontWeight: 700, color: C.muted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {p.lang === 'es' ? 'tú, hace un momento' : 'you, a moment ago'}
        </div>
        {p.user && <Bubble x={120} y={800} w={840} user segs={[{ text: tx(p.user, p.lang) }]} fontSize={44} opacity={s.user.opacity} align="left" />}
        <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
          <path d="M540 905 L540 1085" stroke={WARN.base} strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray={`${s.clashLine.draw} 1`} />
          <circle cx={540} cy={995} r={36 * s.clashLine.draw} fill={C.bg0} stroke={WARN.base} strokeWidth={6} />
          <text x={540} y={1011} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={46} fill={WARN.text} opacity={s.clashLine.draw}>
            ≠
          </text>
        </svg>
        <div style={{ position: 'absolute', top: 1100, left: 120, width: 840, display: 'flex', opacity: s.user.opacity }}>
          <div style={{ padding: '18px 32px', borderRadius: 20, background: `linear-gradient(135deg, ${C.accentText}, ${C.accent})`, fontSize: 44, fontWeight: 800, boxShadow: `0 0 ${30 * s.clashLine.draw}px ${alpha(WARN.base, 0.7)}`, border: `3px solid ${alpha(WARN.base, s.clashLine.draw)}` }}>
            {(p.clash ?? []).join(' ')}
          </div>
        </div>
        <div style={{ position: 'absolute', top: 1196, left: 120, fontSize: 30, fontWeight: 700, color: C.muted, letterSpacing: '0.06em', textTransform: 'uppercase', opacity: s.user.opacity }}>
          {p.lang === 'es' ? 'el pegado' : 'the paste'}
        </div>
      </div>
    </>
  );
};

const RuleScene: React.FC<{ p: AnimProps & PIProps; s: PIState }> = ({ p, s }) => {
  const r = s.rule;
  const cy = interpolate(r.rise, [0, 1], [880, 660]);
  return (
    <>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id="light" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor={alpha('#ffffff', 0.5)} />
            <stop offset="0.4" stopColor={alpha(C.accentText, 0.25)} />
            <stop offset="1" stopColor={alpha(C.accent, 0)} />
          </radialGradient>
        </defs>
        <circle cx={540} cy={560} r={330 * r.light} fill="url(#light)" />
        {[...Array(10)].map((_, i) => {
          const a = (i / 10) * Math.PI * 2;
          return <line key={i} x1={540 + Math.cos(a) * 170} y1={560 + Math.sin(a) * 170} x2={540 + Math.cos(a) * (170 + 110 * r.light)} y2={560 + Math.sin(a) * (170 + 110 * r.light)} stroke={alpha(C.text, 0.35 * r.light)} strokeWidth={6} strokeLinecap="round" />;
        })}
        <Piece id="rule" cx={540} cy={cy - 100 * r.light} cell={210} flip={r.flip} face={TELL_FACE} back={TELL_BACK} torn rot={interpolate(r.rise, [0, 1], [8, -4])} glow={r.light * 0.6} />
        <Glove x={540} y={cy + 190 - 100 * r.light} size={1.25} opacity={Math.min(1, r.rise * 3 + 0.4)} />
      </svg>
      {p.question && <QuestionCard text={tx(p.question, p.lang)} top={262} pop={s.card.pop} />}
      <div style={{ position: 'absolute', top: 470, left: 666, opacity: r.tag, transform: `rotate(6deg) scale(${interpolate(r.tag, [0, 1], [0.7, 1])})` }}>
        <div style={{ padding: '14px 26px', borderRadius: 18, background: C.text, color: C.bg0, fontSize: 42, fontWeight: 800, whiteSpace: 'nowrap' }}>{p.lang === 'es' ? '¿otra caja?' : 'another box?'}</div>
      </div>
      {p.sub && (
        <div style={{ position: 'absolute', top: 1110, left: 60, width: 960, textAlign: 'center', fontSize: 42, fontWeight: 600, color: C.muted, opacity: r.sub }}>
          {tx(p.sub, p.lang)}
        </div>
      )}
      {p.chip && <Chip text={tx(p.chip, p.lang)} top={1200} opacity={s.chip.opacity} />}
    </>
  );
};

const METER = { base: 1250, h: 400, max: 25, w: 150 } as const;

const MetersScene: React.FC<{ p: AnimProps & PIProps; s: PIState }> = ({ p, s }) => {
  const y = 372;
  const meters = p.meters ?? [
    { value: 0, display: '' },
    { value: 0, display: '' },
  ];
  const tops = meters.map((m, i) => METER.base - (m.value / METER.max) * METER.h * s.bars.grow[i]);
  return (
    <>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <g transform={`translate(${s.shake} 0)`}>
          <Slots p={p} s={s} y={y} />
          <line x1={60} y1={METER.base} x2={1020} y2={METER.base} stroke={alpha(C.text, 0.25)} strokeWidth={3} />
          {[0, 1, 2].map((i) => (
            <rect key={i} x={slotCentre(i) - METER.w / 2} y={METER.base - METER.h} width={METER.w} height={METER.h} rx={12} fill={alpha(C.card, 0.6)} stroke={alpha(C.text, 0.1)} strokeWidth={2} strokeDasharray="10 8" />
          ))}
          {meters.map((m, i) => (
            <rect key={i} x={slotCentre(i) - METER.w / 2} y={tops[i]} width={METER.w} height={METER.base - tops[i]} rx={12} fill={i === 1 ? OK.base : alpha(C.muted, 0.7)} />
          ))}
        </g>
      </svg>
      {p.question && <QuestionCard text={tx(p.question, p.lang)} top={250} pop={1} small />}
      <SlotLabels p={p} s={s} y={y + SLOT.size + 16} colours={[C.text, OK.text, WARN.text]} />
      {meters.map((m, i) => (
        <div key={i} style={{ position: 'absolute', top: tops[i] - 84, left: slotCentre(i) - 150, width: 300, textAlign: 'center', fontSize: 68, fontWeight: 800, letterSpacing: '-0.03em', color: i === 1 ? OK.text : C.text, opacity: Math.min(1, s.bars.grow[i] * 3) }}>
          {m.display}
        </div>
      ))}
      {p.ratio && (
        <div style={{ position: 'absolute', top: tops[1] - 176, left: slotCentre(1) - 220, width: 440, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16 }}>
          <span style={{ opacity: s.bars.ratio, transform: `scale(${interpolate(s.bars.ratio, [0, 1], [1.5, 1])})`, padding: '4px 20px', borderRadius: 14, background: alpha(OK.base, 0.18), border: `3px solid ${OK.base}`, fontSize: 50, fontWeight: 800, color: OK.text }}>{tx(p.ratio, p.lang)}</span>
          {p.p && <span style={{ opacity: s.bars.p, fontSize: 30, fontWeight: 600, color: C.muted, whiteSpace: 'nowrap' }}>{tx(p.p, p.lang)}</span>}
        </div>
      )}
      {p.stamp && <Stamp value={p.stamp.value} x={slotCentre(2) - 175} y={950} w={320} pop={s.stamp.pop} size={80} rot={-6} />}
    </>
  );
};

const VerdictScene: React.FC<{ p: AnimProps & PIProps; s: PIState }> = ({ p, s }) => {
  const v = p.verdict;
  const [a0, a1] = s.verdict.appear;
  const [s0, s1] = s.verdict.stamps;
  const col = (i: number) => (i === 0 ? 60 : 570);
  const W = 450;
  return (
    <>
      {[0, 1].map((i) => {
        const on = i === 0 ? a0 : a1;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: 380,
              left: col(i),
              width: W,
              height: 860,
              borderRadius: 28,
              background: C.card,
              border: i === 1 ? `4px solid ${alpha(C.accentText, a1)}` : `2px solid ${alpha(C.text, 0.12)}`,
              boxShadow: i === 1 ? `0 0 ${50 * a1}px ${alpha(C.accent, 0.5 * a1)}` : 'none',
              opacity: i === 0 ? on * (1 - 0.45 * a1) : on,
              transform: `translateY(${(1 - on) * 40}px)`,
            }}
          />
        );
      })}
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <g opacity={a0 * (1 - 0.45 * a1)}>
          <Piece id="v0" cx={col(0) + W / 2} cy={590} cell={190} face={CLASH_FACE(p.clash ?? [])} rot={-4} />
          <path d={`M${col(0) + 80} 700 l60 -40 l60 40 l60 -40 l60 40 l60 -40`} fill="none" stroke={WARN.base} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <g opacity={a1}>
          <Piece id="v1" cx={col(1) + W / 2} cy={590} cell={190} face={TELL_FACE} back={TELL_BACK} flip={-1} torn glow={0.9} rot={4} />
        </g>
      </svg>
      {v?.head && (
        <div style={{ position: 'absolute', top: 262, left: 60, width: 960, textAlign: 'center', fontSize: 50, fontWeight: 800, color: C.text, opacity: s.card.pop }}>
          {tx(v.head, p.lang)}
        </div>
      )}
      {v &&
        [v.no, v.yes].map((l, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: 800,
              left: col(i) + 20,
              width: W - 40,
              textAlign: 'center',
              fontSize: 52,
              fontWeight: 800,
              lineHeight: 1.1,
              opacity: i === 0 ? a0 * (1 - 0.45 * a1) : a1,
              ...(i === 1 ? { backgroundImage: `linear-gradient(135deg, ${C.accentText}, ${C.accent2})`, backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent', WebkitTextFillColor: 'transparent' } : { color: C.text }),
            }}
          >
            {tx(l, p.lang)}
          </div>
        ))}
      {[s0, s1].map((st, i) => (
        <div key={i} style={{ position: 'absolute', top: 1010, left: col(i), width: W, display: 'flex', justifyContent: 'center', opacity: Math.min(1, st * 2) * (i === 0 ? 1 - 0.45 * a1 : 1) }}>
          <div
            style={{
              width: 150,
              height: 150,
              borderRadius: 75,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: 100,
              fontWeight: 800,
              color: i === 0 ? WARN.text : C.text,
              border: i === 0 ? `8px solid ${WARN.base}` : 'none',
              background: i === 0 ? alpha(C.bg0, 0.6) : GRADIENT,
              transform: `scale(${interpolate(st, [0, 1], [1.8, 1])}) rotate(${i ? 0 : -8}deg)`,
            }}
          >
            {i === 0 ? '✗' : '✓'}
          </div>
        </div>
      ))}
    </>
  );
};

const QuoteScene: React.FC<{ p: AnimProps & PIProps; s: PIState }> = ({ p, s }) => {
  const rows = s.quote.rows;
  return (
    <>
      <MoveScene p={p} s={s} />
      {p.tally && <Tally value={p.tally.value} label={tx(p.tally.label, p.lang)} st={s.tally} y={1100} />}
      <div style={{ position: 'absolute', inset: 0, background: alpha(C.bg0, s.quote.dim) }} />
      <div style={{ position: 'absolute', top: 372, left: 0, width: 1080, textAlign: 'center', opacity: s.tells.note }}>
        <span style={{ padding: '10px 24px', borderRadius: 999, background: C.bg0, border: `2px solid ${alpha(C.text, 0.3)}`, fontSize: 34, fontWeight: 700, color: C.muted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {p.lang === 'es' ? 'mi lectura' : 'my reading'}
        </span>
      </div>
      <div style={{ position: 'absolute', left: 60, width: 960, top: 440, height: 860, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 70 }}>
        {rows[0] && <QuoteLine words={rows[0].words} emphasis={0} fontSize={70} color={C.muted} />}
        {rows[1] && <QuoteLine words={rows[1].words} emphasis={rows[1].emphasis} fontSize={92} />}
      </div>
    </>
  );
};

/** Act I: what makes the model turn the piece over. */
export const PieceInspector: React.FC<AnimProps & PIProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur, p.lang as Lang);
  switch (p.mode) {
    case 'hook':
    case 'repaint':
      return (
        <Root>
          <MoveScene p={p} s={s} />
          {p.mode === 'hook' && p.stamp && <Stamp value={p.stamp.value} label={p.stamp.label ? tx(p.stamp.label, p.lang) : undefined} x={0} y={1090} w={1080} pop={s.stamp.pop} size={104} />}
          {p.mode === 'repaint' && p.tally && <Tally value={p.tally.value} label={tx(p.tally.label, p.lang)} st={s.tally} y={1100} />}
        </Root>
      );
    case 'quote':
      return (
        <Root>
          <QuoteScene p={p} s={s} />
        </Root>
      );
    case 'recap':
    case 'lift':
      return (
        <Root>
          <WallScene p={p} s={s} />
        </Root>
      );
    case 'levels':
      return (
        <Root>
          <LevelsScene p={p} s={s} />
        </Root>
      );
    case 'rule':
      return (
        <Root>
          <RuleScene p={p} s={s} />
        </Root>
      );
    case 'meters':
      return (
        <Root>
          <MetersScene p={p} s={s} />
        </Root>
      );
    case 'verdict':
      return (
        <Root>
          <VerdictScene p={p} s={s} />
        </Root>
      );
  }
  return null;
};
