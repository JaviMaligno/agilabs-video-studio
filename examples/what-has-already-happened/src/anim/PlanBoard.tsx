import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { gradientText } from './Stage.tsx';
import { COURSE_LINES, G, MODELS, RELEASE_LINES, STRIPS, frameState, type BandLine, type CardState, type PlanBoardProps, type PlanState } from './PlanBoard.state.ts';
import { Lock } from './pieces.tsx';

export { frameState };
export type { PlanBoardProps };

const TONE: Record<BandLine['tone'], string> = { text: C.text, muted: C.muted, ok: C.ok, warm: C.warm, bad: C.marker };
const BADGE = { ok: C.ok, warm: C.warm, bad: C.marker } as const;

/** Wall clock: face, ticks, two hands; glows when it is the suspect. */
const Clock: React.FC<{ hand: number; glow: number; dim: number }> = ({ hand, glow, dim }) => {
  const cx = 66;
  const r = 60;
  return (
    <svg width={140} height={140} style={{ position: 'absolute', left: 64, top: G.top.y, opacity: 1 - dim, overflow: 'visible' }}>
      <circle cx={cx} cy={70} r={r + 10} fill={alpha(C.accentText, 0.35 * glow)} />
      <circle cx={cx} cy={70} r={r} fill={C.card} stroke={glow > 0.05 ? C.accentText : alpha(C.muted, 0.7)} strokeWidth={6} />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI) / 6;
        return <line key={i} x1={cx + Math.sin(a) * (r - 8)} y1={70 - Math.cos(a) * (r - 8)} x2={cx + Math.sin(a) * (r - 16)} y2={70 - Math.cos(a) * (r - 16)} stroke={C.muted} strokeWidth={i % 3 === 0 ? 5 : 3} strokeLinecap="round" />;
      })}
      <line x1={cx} y1={70} x2={cx + Math.sin((hand / 12) * (Math.PI / 180) + 1.1) * 28} y2={70 - Math.cos((hand / 12) * (Math.PI / 180) + 1.1) * 28} stroke={C.text} strokeWidth={7} strokeLinecap="round" />
      <line x1={cx} y1={70} x2={cx + Math.sin((hand * Math.PI) / 180) * 46} y2={70 - Math.cos((hand * Math.PI) / 180) * 46} stroke={C.text} strokeWidth={4} strokeLinecap="round" />
      <circle cx={cx} cy={70} r={6} fill={C.accentText} />
    </svg>
  );
};

/** Tear-off calendar pad. */
const Calendar: React.FC<{ top: string; main: string; flutter: number; dim: number; glow: number }> = ({ top, main, flutter, dim, glow }) => (
  <div style={{ position: 'absolute', left: 226, top: G.top.y + 4, width: 176, height: 132, opacity: 1 - dim, perspective: 600 }}>
    <div style={{ position: 'absolute', inset: 0, borderRadius: 14, background: alpha(C.text, 0.92), boxShadow: `0 0 ${30 * glow}px ${alpha(C.accentText, 0.8 * glow)}` }} />
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 14,
        overflow: 'hidden',
        background: C.text,
        transformOrigin: 'top center',
        transform: `rotateX(${flutter}deg)`,
      }}
    >
      <div style={{ height: 38, background: C.marker, color: C.text, fontSize: 24, fontWeight: 800, letterSpacing: '0.12em', textAlign: 'center', lineHeight: '38px', textTransform: 'uppercase' }}>{top}</div>
      <div style={{ textAlign: 'center', fontSize: 66, fontWeight: 800, color: C.bg0, lineHeight: '92px' }}>{main}</div>
    </div>
  </div>
);

const Card: React.FC<{ c: CardState }> = ({ c }) => {
  if (c.opacity <= 0.001) return null;
  const border = c.agent > 0.5 ? C.marker : alpha(C.muted, 0.55);
  return (
    <div
      style={{
        position: 'absolute',
        left: c.x,
        top: c.y,
        width: G.card.w,
        height: G.card.h,
        opacity: c.opacity * (1 - 0.62 * c.ghost),
        borderRadius: 16,
        background: c.ghost > 0.5 ? 'transparent' : C.card,
        border: `4px ${c.ghost > 0.5 ? 'dashed' : 'solid'} ${border}`,
        boxShadow: c.lit > 0 ? `0 0 ${40 * c.lit}px ${alpha(C.accentText, 0.8 * c.lit)}` : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 36,
        fontWeight: 800,
        color: C.text,
        boxSizing: 'border-box',
      }}
    >
      {c.label}
      {c.badge && c.badgePop > 0 && (
        <div
          style={{
            position: 'absolute',
            right: -10,
            ...(c.badgeAt === 'top' ? { top: -26 } : { bottom: -26 }),
            padding: '2px 14px',
            borderRadius: 12,
            background: BADGE[c.badgeTone],
            color: C.bg0,
            fontSize: c.badge.length > 2 ? 32 : 42,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            opacity: Math.min(1, c.badgePop * 1.5),
            transform: `scale(${1.6 - 0.6 * c.badgePop})`,
            whiteSpace: 'nowrap',
          }}
        >
          {c.badge === 'frozen' && <Lock size={30} color={C.bg0} />}
          {c.badge}
        </div>
      )}
    </div>
  );
};

/** The red marker arrow "4 after 3": from piece 3 (NOW) down to piece 4 (AHEAD). */
const MarkerArrow: React.FC<{ draw: number; label: number }> = ({ draw, label }) => {
  const d = 'M 470 898 C 430 950, 330 920, 268 948';
  return (
    <>
      <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        <path d={d} pathLength={1} fill="none" stroke={C.marker} strokeWidth={10} strokeLinecap="round" strokeDasharray={1} strokeDashoffset={1 - draw} />
        {draw > 0.92 && <path d="M 286 926 L 262 951 L 296 960" fill="none" stroke={C.marker} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />}
      </svg>
      <div style={{ position: 'absolute', left: 74, top: 806, fontSize: 50, fontWeight: 800, fontStyle: 'italic', color: C.marker, transform: 'rotate(-5deg)', opacity: label }}>4 after 3</div>
    </>
  );
};

const Band: React.FC<{ s: PlanState }> = ({ s }) => {
  const g = s.gauges;
  return (
    <div style={{ position: 'absolute', left: 60, width: 960, top: G.band.y, height: G.band.h }}>
      {g > 0 && (
        <div style={{ position: 'absolute', left: 0, top: 6, width: 600, opacity: g }}>
          <div style={{ display: 'flex', gap: 22 }}>
            {[0, 1, 2, 3].map((i) => (
              <svg key={i} width={130} height={86}>
                <path d="M 12 78 A 53 53 0 0 1 118 78" fill="none" stroke={alpha(C.muted, 0.5)} strokeWidth={10} strokeLinecap="round" />
                <line x1={65} y1={78} x2={65 - 30} y2={78 - 38} stroke={C.text} strokeWidth={6} strokeLinecap="round" />
                <circle cx={65} cy={78} r={7} fill={C.text} />
              </svg>
            ))}
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, color: C.muted, marginTop: 10 }}>4 measures · none moved</div>
        </div>
      )}
      <div
        style={{
          position: 'absolute',
          left: g > 0 ? 620 : 0,
          right: 0,
          top: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          gap: 6,
        }}
      >
        {s.band.map((l, i) => (
          <div key={i} style={{ fontSize: l.size, fontWeight: 800, color: TONE[l.tone], opacity: l.opacity, lineHeight: 1.1, whiteSpace: 'nowrap' }}>
            {l.text}
          </div>
        ))}
      </div>
    </div>
  );
};

const Sheet: React.FC<{ s: PlanState['sheet'] }> = ({ s }) => {
  if (s.opacity <= 0) return null;
  const release = s.domain === 'release';
  const lines = release ? RELEASE_LINES : COURSE_LINES;
  const top = 400;
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: 80,
          top,
          width: 920,
          height: 700,
          borderRadius: 24,
          background: C.card,
          border: `3px solid ${alpha(C.accentText, 0.45)}`,
          opacity: s.opacity,
          transform: `translateY(${s.slide * 700}px) scaleX(${Math.max(0.02, Math.abs(Math.cos(Math.PI * s.flip)))})`,
          boxSizing: 'border-box',
          padding: '26px 40px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted }}>{release ? 'the material · release' : 'the material · course'}</div>
          {!release && (
            <div style={{ fontSize: 32, fontWeight: 800, color: C.bg0, background: C.accentText, borderRadius: 12, padding: '4px 16px', opacity: s.kb, transform: `scale(${1.5 - 0.5 * s.kb})` }}>~1.7 KB</div>
          )}
        </div>
        <div style={{ marginTop: 18 }}>
          {lines.map((l, i) => (
            <div
              key={l}
              style={{
                fontSize: 37,
                fontWeight: 700,
                lineHeight: '64px',
                color: !release && i === 4 ? C.warm : C.text,
                opacity: s.lines[i] ?? 1,
                transform: `translateX(${(1 - (s.lines[i] ?? 1)) * 40}px)`,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ color: C.accentText }}>•</span>
              {l}
              {!release && i === 2 && <Lock size={32} color={C.ok} />}
            </div>
          ))}
          {release && <div style={{ fontSize: 34, fontWeight: 700, fontStyle: 'italic', color: C.accentText, marginTop: 14, opacity: s.same }}>same structure, none of the same words</div>}
        </div>
        {release && (
          <div style={{ position: 'absolute', left: 40, right: 40, top: 420, textAlign: 'center', opacity: s.counterOpacity }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 22 }}>
              <span style={{ ...gradientText, fontSize: 120, fontWeight: 800, lineHeight: 1 }}>{s.counter}</span>
              <span style={{ fontSize: 42, fontWeight: 800, color: C.text }}>scored responses</span>
            </div>
            <div style={{ fontSize: 30, fontWeight: 600, color: C.muted, marginTop: 14, opacity: s.judge }}>blind judge, checked against my hand coding</div>
          </div>
        )}
        {s.bubble > 0 && (
          <div
            style={{
              position: 'absolute',
              left: 60,
              right: 60,
              top: 470,
              padding: '20px 30px',
              borderRadius: 26,
              border: `4px solid ${C.accentText}`,
              background: alpha(C.bg1, 0.95),
              fontSize: 44,
              fontWeight: 800,
              lineHeight: 1.2,
              textAlign: 'center',
              color: C.text,
              opacity: s.bubble,
              transform: `scale(${0.85 + 0.15 * s.bubble})`,
            }}
          >
            In what order?
            <br />
            Any ordering constraints?
            <div style={{ position: 'absolute', left: '50%', bottom: -28, width: 0, height: 0, marginLeft: -22, borderLeft: '22px solid transparent', borderRight: '22px solid transparent', borderTop: `28px solid ${C.accentText}` }} />
          </div>
        )}
        {s.tabs > 0 && (
          <div style={{ position: 'absolute', left: 40, right: 40, top: 424, opacity: s.tabs }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: 30, fontWeight: 800, color: C.muted, marginRight: 8 }}>condition</span>
              {['A', 'B', 'C', 'D', 'E'].map((x, i) => (
                <div
                  key={x}
                  style={{
                    width: 76,
                    height: 62,
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 38,
                    fontWeight: 800,
                    background: i === s.tab ? C.accentText : alpha(C.muted, 0.15),
                    color: i === s.tab ? C.bg0 : C.muted,
                  }}
                >
                  {x}
                </div>
              ))}
              {s.tab === 0 && <span style={{ fontSize: 30, fontWeight: 700, color: C.muted, marginLeft: 10, whiteSpace: 'nowrap' }}>nothing added</span>}
            </div>
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {STRIPS.map((txt, k) => (
                <div
                  key={k}
                  style={{
                    height: 46,
                    borderRadius: 10,
                    background: alpha(C.warm, 0.16),
                    border: `3px solid ${C.warm}`,
                    color: C.warm,
                    fontSize: 29,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 16px',
                    whiteSpace: 'nowrap',
                    opacity: s.strips[k],
                    transform: `translateX(${(1 - s.strips[k]) * 60}px)`,
                  }}
                >
                  + “{txt}”
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div style={{ position: 'absolute', left: 60, top: 1124, width: 960, display: 'flex', flexWrap: 'wrap', gap: '18px 30px', opacity: s.opacity }}>
        {MODELS.map((name, i) => (
          <div
            key={name}
            style={{
              width: 300,
              height: 80,
              borderRadius: 16,
              background: C.card,
              border: `3px solid ${name === 'claude-opus-5' ? C.accentText : alpha(C.muted, 0.4)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 30,
              fontWeight: 800,
              color: C.text,
              boxSizing: 'border-box',
              opacity: s.chips[i],
              transform: `translateY(${(1 - s.chips[i]) * 30}px)`,
            }}
          >
            {name}
          </div>
        ))}
      </div>
    </>
  );
};

const Rewrite: React.FC<{ r: PlanState['rewrite'] }> = ({ r }) => {
  if (r.opacity <= 0) return null;
  const words = 'Write the sentence you mean.'.split(' ');
  const shown = Math.ceil(r.quote * words.length - 1e-9);
  return (
    <>
      <div style={{ position: 'absolute', left: 80, top: 404, width: 920, borderRadius: 24, background: C.card, border: `3px solid ${alpha(C.accentText, 0.45)}`, padding: '26px 40px', boxSizing: 'border-box', opacity: r.opacity }}>
        <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted }}>the document</div>
        <div style={{ marginTop: 16, fontSize: 36, fontWeight: 700, color: alpha(C.text, 1 - 0.5 * r.strike), whiteSpace: 'nowrap', lineHeight: 1.3 }}>
          {['piece 4 reuses piece 3’s calculation,', 'but rewrites it'].map((txt, i) => (
            <div key={i}>
              <span style={{ position: 'relative', display: 'inline-block' }}>
                {txt}
                <span style={{ position: 'absolute', left: 0, top: '52%', height: 6, width: `${100 * Math.min(1, Math.max(0, r.strike * 2 - i))}%`, background: C.marker, borderRadius: 3 }} />
              </span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 18, fontSize: 52, fontWeight: 800, color: C.ok, opacity: r.fresh, transform: `translateY(${(1 - r.fresh) * 20}px)` }}>piece 4 is self-contained.</div>
        <div style={{ marginTop: 22, height: 3, background: alpha(C.muted, 0.25) }} />
        <div style={{ marginTop: 18, display: 'flex', alignItems: 'baseline', gap: 16, opacity: r.fresh }}>
          <span style={{ fontSize: 34, fontWeight: 700, color: C.muted }}>timing</span>
          <span style={{ fontSize: 52, fontWeight: 800, color: C.text }}>8:25</span>
          <span style={{ fontSize: 56, fontWeight: 800, color: C.warm, opacity: r.dagger, display: 'inline-block', transform: `scale(${1.8 - 0.8 * r.dagger})` }}>†</span>
          <span style={{ fontSize: 28, fontWeight: 600, color: C.warm, opacity: r.dagger }}>† this delta is meaningless</span>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 60, width: 960, top: 1124, textAlign: 'center', fontSize: 84, fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.02em' }}>
        {words.map((w, i) => {
          const emph = i >= 2;
          return (
            <span key={i} style={{ opacity: i < shown ? 1 : 0, color: emph && r.emphasis > 0 ? C.accentText : C.text, position: 'relative', marginRight: 22, display: 'inline-block' }}>
              {w}
              {emph && <span style={{ position: 'absolute', left: 0, bottom: -4, height: 7, width: `${100 * r.emphasis}%`, background: C.accentText, borderRadius: 4 }} />}
            </span>
          );
        })}
      </div>
    </>
  );
};

export const PlanBoard: React.FC<AnimProps & PlanBoardProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const pos = (c: string) => s.cards.find((x) => x.id === c);
  const df = s.dateStrip.fly;
  return (
    <AbsoluteFill style={{ fontFamily, color: C.text }}>
      {/* Top strip: clock, calendar, studio window / who made the plan. */}
      <div style={{ position: 'absolute', inset: 0, opacity: s.top.opacity }}>
        <Clock hand={s.top.hand} glow={s.top.glow} dim={s.top.clockDim} />
        <Calendar top={s.top.calTop} main={s.top.calMain} flutter={s.top.flutter} dim={s.top.clockDim} glow={s.top.glow} />
        <div
          style={{
            position: 'absolute',
            left: 432,
            top: G.top.y + 14,
            width: 588,
            height: 112,
            borderRadius: 18,
            border: `3px solid ${s.top.studioPulse > 0.05 ? C.warm : alpha(C.muted, 0.4)}`,
            boxShadow: `0 0 ${36 * s.top.studioPulse}px ${alpha(C.warm, 0.7 * s.top.studioPulse)}`,
            background: alpha(C.bg1, 0.9),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 38,
            fontWeight: 800,
            opacity: s.top.studio,
          }}
        >
          studio: 4 days, <span style={{ color: C.warm, marginLeft: 10 }}>ahead</span>
        </div>
        {s.top.planOpacity > 0 && (
          <div style={{ position: 'absolute', left: 432, top: G.top.y + 14, width: 588, height: 112, borderRadius: 18, border: `3px solid ${C.accentText}`, background: alpha(C.bg1, 0.95), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 800, opacity: s.top.planOpacity }}>
            {s.top.plan}
          </div>
        )}
      </div>

      {/* The board. */}
      <div style={{ position: 'absolute', inset: 0, opacity: s.board.opacity }}>
        <div style={{ position: 'absolute', left: G.board.x, top: G.board.y, width: G.board.w, height: G.board.h, borderRadius: 26, background: alpha(C.bg1, 0.95), border: `2px solid ${alpha(C.muted, 0.22)}` }} />
        {s.board.laneLit > 0 && (
          <div style={{ position: 'absolute', left: G.board.x + 8, top: G.lanes.NOW - 40, width: G.board.w - 16, height: 152, borderRadius: 18, background: alpha(C.accentText, 0.16 * s.board.laneLit), border: `3px solid ${alpha(C.accentText, s.board.laneLit)}` }} />
        )}
        {(['DONE', 'NOW', 'AHEAD'] as const).map((lane) => (
          <div key={lane} style={{ position: 'absolute', left: 66, top: G.lanes[lane] - 36, fontSize: 26, fontWeight: 800, letterSpacing: '0.16em', color: lane === 'NOW' && s.board.laneLit > 0.5 ? C.accentText : C.muted }}>
            {lane}
          </div>
        ))}
        {s.cards.map((c) => (
          <Card key={c.id} c={c} />
        ))}
        <MarkerArrow draw={s.arrow.draw} label={s.arrow.label} />
        {s.nothingTag > 0 && (
          <div style={{ position: 'absolute', left: (pos('good')?.x ?? 392) + 30, top: G.lanes.DONE + 70, padding: '6px 22px', borderRadius: 12, background: C.warm, color: C.bg0, fontSize: 42, fontWeight: 800, transform: `rotate(-4deg) scale(${1.4 - 0.4 * s.nothingTag})`, opacity: s.nothingTag, whiteSpace: 'nowrap' }}>
            nothing recorded yet
          </div>
        )}
        {s.rehearsalStrip > 0 && (
          <div style={{ position: 'absolute', left: 300, top: G.lanes.DONE - 50, padding: '4px 18px', borderRadius: 10, background: C.warm, color: C.bg0, fontSize: 30, fontWeight: 800, transform: 'rotate(-2deg)', opacity: s.rehearsalStrip, whiteSpace: 'nowrap' }}>
            rehearsals, nothing from the studio yet
          </div>
        )}
        {s.sticky.pop > 0 && (
          <div style={{ position: 'absolute', left: 708, top: 760, width: 300, padding: '22px 22px', borderRadius: 8, background: C.warm, color: C.bg0, fontSize: 36, fontWeight: 800, lineHeight: 1.15, boxShadow: `0 16px 40px ${alpha(C.bg0, 0.7)}`, transform: `rotate(4deg) scale(${1.5 - 0.5 * s.sticky.pop})`, opacity: Math.min(1, s.sticky.pop * 1.4) }}>
            don’t invent ordering constraints
          </div>
        )}
        {s.dateStrip.opacity > 0 && (
          <div
            style={{
              position: 'absolute',
              left: 180,
              top: 532,
              width: 800,
              height: 74,
              borderRadius: 8,
              background: C.text,
              color: C.bg0,
              fontSize: 46,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 14px 36px ${alpha(C.bg0, 0.7)}`,
              opacity: Math.min(1, s.dateStrip.opacity * 1.5),
              transformOrigin: 'top left',
              transform: `translate(${(1 - df) * 50}px, ${(1 - df) * -120}px) scale(${0.22 + 0.78 * df}) rotate(${-3 * df}deg)`,
            }}
          >
            today is 11 August 2026
          </div>
        )}
        {s.board.dim > 0 && <div style={{ position: 'absolute', left: 0, right: 0, top: G.top.y - 10, height: G.board.y + G.board.h - G.top.y + 20, background: alpha(C.bg0, s.board.dim) }} />}
        {s.verdict.pop > 0 && (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 600, display: 'flex', justifyContent: 'center' }}>
            <div
              style={{
                padding: '16px 46px',
                border: `9px solid ${C.warm}`,
                borderRadius: 22,
                background: alpha(C.bg0, 0.88),
                color: C.warm,
                fontSize: 112,
                fontWeight: 800,
                lineHeight: 1.04,
                textAlign: 'center',
                letterSpacing: '0.02em',
                opacity: Math.min(1, s.verdict.pop * 1.4),
                transform: `rotate(-7deg) scale(${1.9 - 0.9 * s.verdict.pop})`,
              }}
            >
              IT ISN’T
              <br />
              THE CLOCK
            </div>
          </div>
        )}
      </div>

      <Band s={s} />
      <Sheet s={s.sheet} />
      <Rewrite r={s.rewrite} />
    </AbsoluteFill>
  );
};
