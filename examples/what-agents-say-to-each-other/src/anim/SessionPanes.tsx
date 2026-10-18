import React from 'react';
import { C, GRADIENT, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { Stage, gradientText } from './Stage.tsx';
import {
  CARDS,
  DEFECT,
  HEADER_H,
  PANE,
  PIPE_X,
  THREAD,
  W,
  frameState,
  paneMid,
  paneTop,
  type PanesProps,
  type PanesState,
} from './SessionPanes.state.ts';
import { Courier, Flag, GlyphIcon, MsgCard, Pane, Pill, Pipe, Tick } from './pieces.tsx';

export { frameState };
export type { PanesProps };

const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const PW = PANE.x1 - PANE.x0;

// ---------------------------------------------------------------- Act I

type Swarm = Extract<PanesState, { view: 'swarm' }>;

const SwarmView: React.FC<{ s: Swarm; t: number }> = ({ s, t }) => {
  const taps = [0, 1, 2, 3].map(paneMid);
  return (
    <>
      <Pipe x={PIPE_X} y0={paneMid(0)} y1={paneMid(3)} taps={taps} tapTo={PANE.x0} glow={0.6} />
      {[0, 1, 2, 3].map((i) => (
        <Pane key={i} x={PANE.x0} y={paneTop(i)} w={PW} h={PANE.h} t={t} seed={i} bars={4} opacity={s.title.length ? 0.85 : 0.6} />
      ))}
      {/* The swarm, clipped to the stage. */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: 1090, overflow: 'hidden' }}>
        {s.bubbles.map((b, k) => {
          const face = b.flip > 0 ? 'tell' : b.ask && b.glyphQ > 0.5 ? 'ask' : 'plain';
          return (
            <Pill
              key={k}
              x={b.x}
              y={b.y}
              face={face}
              glyph={b.flag ? 'flag' : 'tick'}
              flip={b.flip > 0 ? b.flip : undefined}
              opacity={b.opacity}
              scale={b.ask ? 1 + 0.25 * b.emphasis + 0.1 * b.glyphQ : 1}
              streak={b.streak}
              glow={b.ask ? Math.max(b.emphasis, s.title.length ? b.glyphQ * 0.6 : 0) : 0}
            />
          );
        })}
      </div>
      {s.flash > 0 && <div style={{ position: 'absolute', inset: 0, background: alpha(C.text, 0.07 * s.flash) }} />}
      {/* Hook title, drawn from the first frame. */}
      {s.title.length > 0 && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 330,
            padding: '34px 40px',
            background: alpha(C.bg0, 0.82),
            borderRadius: 28,
            border: `2px solid ${alpha(C.accent, 0.4)}`,
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            columnGap: 22,
            rowGap: 4,
            fontFamily,
            fontSize: 84,
            fontWeight: 800,
            lineHeight: 1.12,
            letterSpacing: '-0.02em',
          }}
        >
          {s.title.map((w, i) => (
            <span
              key={i}
              style={{
                color: w.key && s.titleKey > 0.5 ? undefined : C.text,
                ...(w.key && s.titleKey > 0.5 ? gradientText : {}),
                opacity: 0.5 + 0.5 * w.lit,
              }}
            >
              {w.text}
            </span>
          ))}
        </div>
      )}
      {/* Header: message counter and chips. */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: HEADER_H, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, opacity: s.counterAppear }}>
          <span style={{ fontSize: 88, fontWeight: 800, letterSpacing: '-0.03em', ...gradientText }}>{s.counter}</span>
          <span style={{ fontSize: 36, fontWeight: 600, color: C.muted }}>messages</span>
        </div>
        {s.chipAppear > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 22px',
              borderRadius: 40,
              border: `3px solid ${C.accentText}`,
              background: alpha(C.bg0, 0.9),
              transform: `scale(${0.6 + 0.4 * s.chipAppear})`,
              opacity: s.chipAppear,
            }}
          >
            <span style={{ fontSize: 40, fontWeight: 800, color: C.accentText }}>?</span>
            <span style={{ fontSize: 34, fontWeight: 600, color: C.muted }}>delegation</span>
            <span style={{ fontSize: 52, fontWeight: 800, color: C.text }}>8.9 %</span>
          </div>
        )}
        {s.tellChip > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 22px',
              borderRadius: 40,
              background: GRADIENT,
              transform: `scale(${0.6 + 0.4 * s.tellChip})`,
              opacity: s.tellChip,
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 22, background: alpha(C.bg0, 0.85), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Tick size={30} />
            </div>
            <div style={{ width: 44, height: 44, borderRadius: 22, background: alpha(C.bg0, 0.85), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Flag size={30} />
            </div>
            <span style={{ fontSize: 36, fontWeight: 700, color: C.text }}>is the work correct?</span>
          </div>
        )}
      </div>
    </>
  );
};

type Thread = Extract<PanesState, { view: 'thread' }>;

const THREAD_MSGS: { from: 'a' | 'b'; text: string; glyph: 'flag' | 'tick' }[] = [
  { from: 'a', text: 'master is red: 9 tests, from your d4e5f6a', glyph: 'flag' },
  { from: 'b', text: 'master is NOT broken: it was the venv…', glyph: 'tick' },
  { from: 'a', text: 'I RETRACT: master is NOT red, it was my venv', glyph: 'tick' },
  { from: 'b', text: 'I fell for the same thing…', glyph: 'tick' },
];

const ThreadView: React.FC<{ s: Thread; t: number }> = ({ s, t }) => {
  const aMid = THREAD.aTop + THREAD.h / 2;
  const bMid = THREAD.bTop + THREAD.h / 2;
  const mono = { fontSize: 30, lineHeight: 1.5 };
  return (
    <>
      <Pipe x={PIPE_X} y0={aMid} y1={bMid} taps={[aMid, bMid]} tapTo={PANE.x0} glow={0.5} opacity={s.panes} />
      <Pane
        x={PANE.x0}
        y={THREAD.aTop}
        w={PW}
        h={THREAD.h}
        t={t}
        opacity={s.panes}
        lines={
          <div style={mono}>
            <div>$ pytest</div>
            <div style={{ color: C.flag }}>✗ 9 failed</div>
          </div>
        }
      />
      <Pane
        x={PANE.x0}
        y={THREAD.bTop}
        w={PW}
        h={THREAD.h}
        t={t}
        seed={2}
        opacity={s.panes}
        lines={
          <div style={mono}>
            <div>$ pytest</div>
            <div style={{ color: C.ok }}>✓ passed</div>
          </div>
        }
      />
      {THREAD_MSGS.map((m, i) => {
        const a = s.msgs[i].appear;
        if (a <= 0) return null;
        const y = THREAD.slots[i];
        const fromY = m.from === 'a' ? THREAD.aTop + THREAD.h : THREAD.bTop;
        const yy = lerp(fromY, y, a);
        const glyph = i === 0 ? (s.retract > 0.5 ? 'tick' : 'flag') : m.glyph;
        const flipScale = i === 0 ? Math.abs(Math.cos(Math.PI * s.retract)) : 1;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: yy - THREAD.slotH / 2,
              height: THREAD.slotH,
              ...(m.from === 'a' ? { left: PANE.x0 } : { right: 0 }),
              maxWidth: 860,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '0 28px 0 16px',
              borderRadius: 26,
              background: GRADIENT,
              boxShadow: `0 12px 30px ${alpha(C.bg0, 0.6)}${i === 0 && s.retractFlash > 0 ? `, 0 0 ${40 * s.retractFlash}px ${alpha(C.ok, 0.9)}` : ''}`,
              opacity: a,
              fontFamily,
              fontSize: 33,
              fontWeight: 650,
              color: C.text,
              whiteSpace: 'nowrap',
              letterSpacing: '-0.01em',
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                background: alpha(C.bg0, 0.88),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: `scaleX(${Math.max(0.05, flipScale)})`,
                flex: 'none',
              }}
            >
              <GlyphIcon glyph={glyph} size={38} />
            </div>
            {m.text}
          </div>
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------- Act III

type Real = Extract<PanesState, { view: 'real' }>;

/** Overview layout: the four panes as greyed thumbnails in a 2x2 grid. */
const THUMB = { w: 400, h: 200, xs: [60, 500], ys: [150, 400] } as const;

const RealView: React.FC<{ s: Real; t: number }> = ({ s, t }) => {
  const o = s.overview;
  const rect = (i: number) => {
    const tx = THUMB.xs[i % 2];
    const ty = THUMB.ys[Math.floor(i / 2)];
    return { x: lerp(PANE.x0, tx, o), y: lerp(paneTop(i), ty, o), w: lerp(PW, THUMB.w, o), h: lerp(PANE.h, THUMB.h, o) };
  };
  const taps = [0, 1, 2, 3].map(paneMid);
  const reader = { x: 480, y: 800 };
  return (
    <>
      <Pipe x={PIPE_X} y0={paneMid(0)} y1={paneMid(3)} taps={taps} tapTo={PANE.x0} glow={0.6} opacity={s.panesIn * (1 - o)} />
      {[0, 1, 2, 3].map((i) => {
        const r = rect(i);
        return (
          <div key={i} style={{ filter: o > 0 ? `grayscale(${o}) brightness(${1 - 0.35 * o})` : undefined }}>
            <Pane x={r.x} y={r.y} w={r.w} h={r.h} t={t} num={i + 1} warm seed={i + 3} bars={3} opacity={s.panesIn} />
          </div>
        );
      })}
      {/* The defect pane 3 had filed against it, waiting in its inbox. */}
      {s.defect.appear > 0 && s.defect.crumble < 1 && o === 0 && (
        <Defect s={s} />
      )}
      {/* Cards: a courier pill runs along the pipe, then the card opens over the receiving pane. */}
      {s.cards.map((c) => {
        const def = CARDS[c.id];
        const y0 = paneMid(def.from);
        const y1 = paneMid(def.to);
        return (
          <React.Fragment key={c.id}>
            {c.travel > 0 && c.appear < 1 && <Courier x={PIPE_X} y={lerp(y0, y1, c.travel)} glyph={def.glyph} opacity={c.opacity} />}
            <MsgCard
              x={def.small ? 120 : 92}
              y={def.cy}
              w={def.small ? 820 : 868}
              main={def.main}
              sub={def.sub}
              glyph={def.glyph}
              from={`${def.from + 1} → ${def.to + 1}`}
              appear={c.appear}
              opacity={c.opacity}
              font={def.small ? 32 : 36}
              originX={0}
            />
          </React.Fragment>
        );
      })}
      {/* The reader: a faceless outline that sees all four transcripts at once. */}
      {s.reader > 0 && (
        <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: s.reader }} width={1} height={1}>
          {[0, 1, 2, 3].map((i) => {
            const r = rect(i);
            return (
              <line
                key={i}
                x1={reader.x}
                y1={reader.y - 40}
                x2={r.x + r.w / 2}
                y2={r.y + r.h}
                stroke={C.accentText}
                strokeWidth={3}
                strokeDasharray="3 10"
                strokeLinecap="round"
                opacity={0.8}
              />
            );
          })}
          <circle cx={reader.x} cy={reader.y} r={48} fill={C.bg0} stroke={C.accentText} strokeWidth={5} />
          <path d={`M ${reader.x - 100} ${reader.y + 170} Q ${reader.x - 100} ${reader.y + 66} ${reader.x} ${reader.y + 66} Q ${reader.x + 100} ${reader.y + 66} ${reader.x + 100} ${reader.y + 170} Z`} fill={C.bg0} stroke={C.accentText} strokeWidth={5} />
        </svg>
      )}
      {/* Header: tag and clock. */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: HEADER_H, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily }}>
        <div
          style={{
            opacity: s.tag,
            padding: '8px 18px',
            borderRadius: 30,
            border: `2px solid ${alpha(C.warm, 0.7)}`,
            color: C.warm,
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: '0.01em',
          }}
        >
          real work · verbatim, anonymised
        </div>
        <Clock ring={s.clock.ring} label={s.clock.label} big={s.clock.big} opacity={s.panesIn} />
      </div>
    </>
  );
};

const Defect: React.FC<{ s: Real }> = ({ s }) => {
  const d = s.defect;
  const cr = d.crumble;
  const pieces = 6;
  const base = (1 - 0.55 * d.dim) * d.appear;
  return (
    <>
      {d.arrow > 0 && (
        <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} width={1} height={1}>
          {/* A dotted hand-off towards a fifth session off screen, which snaps. */}
          <line
            x1={DEFECT.x + DEFECT.w}
            y1={DEFECT.y + DEFECT.h / 2}
            x2={DEFECT.x + DEFECT.w + 120 * d.arrow - (d.snap > 0 ? 0 : 0)}
            y2={DEFECT.y + DEFECT.h / 2 + 60 * d.arrow}
            stroke={C.flag}
            strokeWidth={4}
            strokeDasharray="4 10"
            opacity={(1 - d.snap) * 0.9}
          />
          {d.snap > 0 && (
            <g opacity={1 - cr}>
              <line x1={DEFECT.x + DEFECT.w + 40} y1={DEFECT.y + 30} x2={DEFECT.x + DEFECT.w + 70 + 20 * d.snap} y2={DEFECT.y + 70 + 30 * d.snap} stroke={C.flag} strokeWidth={4} strokeDasharray="4 10" />
            </g>
          )}
        </svg>
      )}
      {cr <= 0 ? (
        <div
          style={{
            position: 'absolute',
            left: DEFECT.x,
            top: DEFECT.y,
            width: DEFECT.w,
            height: DEFECT.h,
            borderRadius: 24,
            border: `3px solid ${C.flag}`,
            background: alpha(C.flag, 0.18),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            opacity: base,
            fontFamily,
            fontSize: 28,
            fontWeight: 700,
            color: C.text,
            transform: `scale(${0.5 + 0.5 * d.appear})`,
          }}
        >
          <Flag size={28} />
          defect
        </div>
      ) : (
        Array.from({ length: pieces }, (_, i) => {
          const dx = (i - pieces / 2) * 30 * cr;
          const dy = cr * cr * (140 + i * 25);
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: DEFECT.x + (i * DEFECT.w) / pieces + dx,
                top: DEFECT.y + dy,
                width: DEFECT.w / pieces - 4,
                height: DEFECT.h,
                borderRadius: 8,
                background: alpha(C.flag, 0.5),
                opacity: base * (1 - cr),
                transform: `rotate(${(i % 2 ? 1 : -1) * 50 * cr}deg)`,
              }}
            />
          );
        })
      )}
    </>
  );
};

const Clock: React.FC<{ ring: number; label: string; big: number; opacity: number }> = ({ ring, label, big, opacity }) => {
  const r = 30;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, opacity, transform: `scale(${1 + 0.25 * big})`, transformOrigin: '100% 50%' }}>
      <span style={{ fontSize: 40, fontWeight: 800, color: label === '~9 min' ? C.warm : C.text, letterSpacing: '-0.01em', minWidth: 10 }}>{label}</span>
      <svg width={76} height={76} viewBox="0 0 76 76">
        <circle cx={38} cy={38} r={r} fill="none" stroke={alpha(C.muted, 0.25)} strokeWidth={7} />
        <circle
          cx={38}
          cy={38}
          r={r}
          fill="none"
          stroke={C.warm}
          strokeWidth={7}
          strokeDasharray={`${c * Math.min(1, Math.max(0, ring))} ${c}`}
          strokeLinecap="round"
          transform="rotate(-90 38 38)"
        />
      </svg>
    </div>
  );
};

// ---------------------------------------------------------------- component

export const SessionPanes: React.FC<AnimProps & PanesProps> = ({ t, beats, dur, vertical, ...props }) => {
  const s = frameState(props, t, beats, dur);
  return (
    <Stage vertical={vertical} fill>
      {s.view === 'swarm' && <SwarmView s={s} t={t} />}
      {s.view === 'thread' && <ThreadView s={s} t={t} />}
      {s.view === 'real' && <RealView s={s} t={t} />}
    </Stage>
  );
};
