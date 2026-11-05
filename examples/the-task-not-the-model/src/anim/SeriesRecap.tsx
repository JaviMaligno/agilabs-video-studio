import React from 'react';
import { Img, staticFile } from 'remotion';
import { C, GRADIENT, alpha } from '../brand.ts';
import type { AnimProps } from './types.ts';
import { Stage, gradientText } from './Stage.tsx';
import { BENCH_CARDS, BENCH_RANKS, HELPERS, MODELS, TIMEOUT_INDEX, TXT, frameState, type SeriesRecapProps, type SeriesRecapState } from './SeriesRecap.state.ts';
import { clamp01 } from './steps.ts';

export { frameState };
export type { SeriesRecapProps };

// Story colours of the series (teal = right, amber = DeepSeek / time out, rose = the red marker).
// Taken from brand.ts when it defines them, with the series' values as fallback.
const B = C as unknown as Record<string, string | undefined>;
const OK = B.ok ?? '#2dd4bf';
const WARM = B.warm ?? '#fbbf24';
const ROSE = B.marker ?? B.rose ?? '#fb7185';

// Geometry in stage px (Stage fill box, 960 wide). Content stays within x 12..948 and y 44..1044,
// the vertical safe stage (frame y 280..1280).
const X0 = 12;
const W = 936;
const SLOT = W / 7;

const fadeUp = (o: number, dy = 24): React.CSSProperties => ({ opacity: clamp01(o), transform: `translateY(${(1 - clamp01(o)) * dy}px)` });
const pop = (o: number) => 1 + 0.25 * Math.sin(Math.PI * clamp01(o));
const abs = (left: number, top: number, extra: React.CSSProperties = {}): React.CSSProperties => ({ position: 'absolute', left, top, ...extra });

const Robot: React.FC<{ k: number; size: number; style?: React.CSSProperties }> = ({ k, size, style }) => {
  const m = MODELS[k];
  return (
    <Img
      src={staticFile(`cast/${m.robot}.png`)}
      style={{ width: size, height: size, objectFit: 'contain', filter: m.hue ? `hue-rotate(${m.hue}deg)` : undefined, ...style }}
    />
  );
};

const Draw: React.FC<{ name: string; w: number; h: number; style?: React.CSSProperties }> = ({ name, w, h, style }) => (
  <Img src={staticFile(`draw/${name}.png`)} style={{ width: w, height: h, objectFit: 'contain', ...style }} />
);

const Tick: React.FC<{ size: number; color: string; o: number }> = ({ size, color, o }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ opacity: clamp01(o), transform: `scale(${pop(o)})` }}>
    <path d="M4 12.5 L9.5 18 L20 6" fill="none" stroke={color} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={30} strokeDashoffset={30 * (1 - clamp01(o))} />
  </svg>
);

const StampBox: React.FC<{ text: string; color: string; o: number; size: number; rotate?: number }> = ({ text, color, o, size, rotate = -8 }) => (
  <div
    style={{
      display: 'inline-block',
      padding: `${size * 0.12}px ${size * 0.35}px`,
      border: `${Math.max(5, size * 0.08)}px solid ${color}`,
      borderRadius: size * 0.2,
      color,
      fontSize: size,
      fontWeight: 800,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      background: alpha(C.bg0, 0.75),
      opacity: clamp01(o * 1.6),
      transform: `rotate(${rotate}deg) scale(${1.6 - 0.6 * clamp01(o)})`,
      whiteSpace: 'nowrap',
    }}
  >
    {text}
  </div>
);

/** The seven robots in a row, each with its short name; `under` draws what goes below a name. */
const RobotRow: React.FC<{ s: SeriesRecapState; top: number; size: number; under: (k: number) => React.ReactNode }> = ({ s, top, size, under }) => (
  <>
    {MODELS.map((m, k) => {
      const r = s.row[k];
      if (!r) return null;
      const cx = X0 + SLOT * (k + 0.5);
      return (
        <div key={k} style={abs(cx - SLOT / 2 - 10, top, { width: SLOT + 20, display: 'flex', flexDirection: 'column', alignItems: 'center', ...fadeUp(r.appear, 30) })}>
          <Robot k={k} size={size} />
          <div style={{ fontSize: 30, fontWeight: 600, color: C.muted, letterSpacing: '-0.02em', whiteSpace: 'nowrap', marginTop: 4 }}>{m.name}</div>
          {under(k)}
        </div>
      );
    })}
  </>
);

// ── bench ──────────────────────────────────────────────────────────────────────────────────────
const BCARD = { y: 50, w: 296, h: 250, gap: 24 } as const;
const BOARD = { y: 360, h: 640 } as const;
const ROW_H = 190;
const BAR_X = 520;
const BAR_W = 380;

const Bench: React.FC<{ s: SeriesRecapState }> = ({ s }) => (
  <>
    {BENCH_CARDS.map((c, k) => {
      const st = s.cards[k];
      if (!st) return null;
      const left = X0 + k * (BCARD.w + BCARD.gap);
      return (
        <div
          key={k}
          style={abs(left, BCARD.y, {
            width: BCARD.w,
            height: BCARD.h,
            borderRadius: 18,
            background: C.text,
            color: C.bg0,
            boxSizing: 'border-box',
            padding: '24px 16px',
            boxShadow: `10px 12px 30px ${alpha(C.bg0, 0.5)}`,
            ...fadeUp(st.appear, 30),
          })}
        >
          <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '0.1em', color: alpha(C.bg0, 0.55) }}>{c.label}</div>
          <div style={{ marginTop: 26, fontSize: 30, fontWeight: 700, whiteSpace: 'nowrap', letterSpacing: '-0.02em' }}>{c.text}</div>
          {/* the score badge: a pill with a filling bar */}
          <div
            style={abs(16, BCARD.h - 76, {
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '6px 16px',
              borderRadius: 999,
              background: C.accent,
              color: C.text,
              fontSize: 30,
              fontWeight: 800,
              opacity: st.badge,
              transform: `scale(${pop(st.badge)})`,
              transformOrigin: 'left center',
            })}
          >
            {TXT.scorePill}
            <div style={{ width: 90, height: 14, borderRadius: 7, background: alpha(C.text, 0.3) }}>
              <div style={{ width: 90 * (0.55 + 0.15 * k) * clamp01(st.badge), height: 14, borderRadius: 7, background: C.text }} />
            </div>
          </div>
        </div>
      );
    })}

    {/* the ranking board */}
    <div style={abs(X0, BOARD.y, { width: W, height: BOARD.h, borderRadius: 24, background: alpha(C.card, 0.9), border: `3px solid ${alpha(C.accentText, 0.45)}`, boxSizing: 'border-box', ...fadeUp(s.board, 30) })}>
      {BENCH_RANKS.map((r, k) => {
        const st = s.ranks[k];
        if (!st) return null;
        const top = 40 + k * ROW_H;
        return (
          <div key={k} style={{ position: 'absolute', left: 0, top, width: W, height: ROW_H, ...fadeUp(st.appear, 20) }}>
            <div style={abs(36, 40, { width: 70, fontSize: 72, fontWeight: 800, color: k === 0 ? WARM : C.muted, textAlign: 'center' })}>{r.rank}</div>
            <Robot k={r.model} size={140} style={abs(120, 10)} />
            <div style={abs(275, 58, { fontSize: 40, fontWeight: 700, color: C.text, whiteSpace: 'nowrap' })}>{r.label}</div>
            <div style={abs(BAR_X, 70, { width: BAR_W * r.bar * clamp01(st.bar), height: 36, borderRadius: 18, background: k === 0 ? GRADIENT : alpha(C.muted, 0.55) })} />
          </div>
        );
      })}
    </div>
  </>
);

// ── podium: story and name ──────────────────────────────────────────────────────────────────────
const BAR = { x: 30, y: 200, w: 56, h: 640 } as const;
const PODIUM = { x: 110, y: 640, w: 420, h: 260 } as const;
const HERO = { size: 240, x: 200, top: 400 } as const;
/** Fable on the lower left block of the podium (block spans stage x ~140..252, top ~753). */
const FABLE = { size: 140, x: 126, top: 625 } as const;

const Podium: React.FC<{ s: SeriesRecapState }> = ({ s }) => {
  const dimmed = 1 - 0.55 * s.dim;
  const gold = s.gold > 0.5;
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, opacity: dimmed }}>
        {/* the score bar and its gold #1 */}
        <div style={abs(BAR.x, BAR.y, { width: BAR.w, height: BAR.h, borderRadius: 14, background: alpha(C.muted, 0.16), opacity: s.base })}>
          <div style={{ position: 'absolute', left: 0, bottom: 0, width: BAR.w, height: BAR.h * clamp01(s.score), borderRadius: 14, background: GRADIENT }} />
        </div>
        <div
          style={abs(BAR.x + BAR.w / 2 - 44, BAR.y - 110, {
            width: 88,
            height: 88,
            borderRadius: 44,
            boxSizing: 'border-box',
            background: gold ? WARM : alpha(C.bg1, 0.95),
            border: `4px solid ${gold ? WARM : alpha(C.muted, 0.5)}`,
            boxShadow: `0 0 ${50 * s.gold}px ${alpha(WARM, 0.8 * s.gold)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 38,
            fontWeight: 800,
            color: gold ? C.bg0 : C.muted,
            opacity: s.base,
            transform: `scale(${pop(s.gold)})`,
          })}
        >
          {TXT.one}
        </div>

        {/* podium and the robot rising onto it */}
        <Draw name="podium" w={PODIUM.w} h={PODIUM.h} style={abs(PODIUM.x, PODIUM.y, { opacity: s.base })} />
        <div style={abs(HERO.x, HERO.top, { width: HERO.size, height: HERO.size, opacity: s.rise, transform: `translateY(${(1 - s.rise) * 160}px)` })}>
          <Robot k={1} size={HERO.size} />
        </div>
        {/* the label under the winner, on the gold block; Fable on the lower left block */}
        <div style={abs(252, 735, { width: 135, textAlign: 'center', fontSize: 34, fontWeight: 800, color: C.bg0, whiteSpace: 'nowrap', opacity: s.labels })}>{TXT.opus}</div>
        <div style={abs(FABLE.x, FABLE.top, { width: FABLE.size, height: FABLE.size, opacity: s.fable, transform: `translateY(${(1 - s.fable) * 80}px)` })}>
          <Robot k={2} size={FABLE.size} />
        </div>
        <div style={abs(FABLE.x + FABLE.size / 2 - 80, 850, { width: 160, textAlign: 'center', fontSize: 32, fontWeight: 700, color: OK, whiteSpace: 'nowrap', ...fadeUp(s.labels, 12) })}>
          {TXT.fable}
        </div>
        {/* name: the crib sheet slides in under the robot's arm */}
        {s.crib > 0 && (
          <Draw name="crib-sheet" w={150} h={150} style={abs(HERO.x + HERO.size - 90 + (1 - s.crib) * 420, HERO.top + 110, { opacity: s.crib, transform: `rotate(${-14 + 14 * s.crib}deg)` })} />
        )}

        {/* the same robot at a desk: a redo note, and how it feels */}
        <div style={abs(590, 470, { width: 350, height: 500, opacity: s.desk })}>
          <Draw name="desk-tidy" w={330} h={260} style={abs(10, 140)} />
          <Robot k={1} size={150} style={abs(-10, 70)} />
          <div
            style={abs(150, 30, {
              width: 160,
              padding: '14px 0',
              textAlign: 'center',
              background: ROSE,
              color: C.bg0,
              fontSize: 38,
              fontWeight: 800,
              borderRadius: 6,
              boxShadow: `6px 8px 0 ${alpha(C.bg0, 0.4)}`,
              opacity: s.redo,
              transform: `rotate(${6}deg) scale(${pop(s.redo)}) translateY(${(1 - s.redo) * -40}px)`,
            })}
          >
            {TXT.redo}
          </div>
          <div style={abs(0, 420, { width: 350, textAlign: 'center', fontSize: 34, fontWeight: 600, fontStyle: 'italic', color: C.muted, ...fadeUp(s.face, 16) })}>
            {TXT.face}
          </div>
        </div>
      </div>

      {/* name: the word stamps across the stage */}
      {s.stamp > 0 && (
        <div style={abs(0, 470, { width: 960, display: 'flex', justifyContent: 'center' })}>
          <div
            style={{
              padding: '18px 26px',
              borderRadius: 22,
              background: alpha(C.bg0, 0.82),
              border: `6px solid ${alpha(C.accent2, 0.9)}`,
              opacity: clamp01(s.stamp * 1.6),
              transform: `rotate(-7deg) scale(${1.08 - 0.08 * s.stamp})`,
            }}
          >
            <div style={{ fontSize: 104, fontWeight: 800, letterSpacing: '0.02em', lineHeight: 1.05, ...gradientText }}>{TXT.word}</div>
          </div>
        </div>
      )}
      {/* name: what the word means, under the stamp */}
      {s.line > 0 && (
        <div style={abs(0, 750, { width: 960, display: 'flex', justifyContent: 'center', ...fadeUp(s.line, 16) })}>
          <div style={{ padding: '12px 28px', borderRadius: 16, background: alpha(C.bg0, 0.85), fontSize: 40, fontWeight: 700, color: C.text, whiteSpace: 'nowrap' }}>
            {TXT.winExam} <span style={{ color: ROSE, fontWeight: 800 }}>{TXT.neq}</span> {TXT.betterWork}
          </div>
        </div>
      )}
    </>
  );
};

// ── twins ──────────────────────────────────────────────────────────────────────────────────────
const CARD = { y: 120, w: 440, h: 260 } as const;
const card1X = X0;
const card2X = X0 + W - CARD.w;

const ExamCard: React.FC<{ text: string; left: number; o: number; twin?: boolean }> = ({ text, left, o, twin }) => (
  <div
    style={abs(left, CARD.y, {
      width: CARD.w,
      height: CARD.h,
      borderRadius: 18,
      background: C.text,
      color: C.bg0,
      boxSizing: 'border-box',
      padding: '26px 28px',
      borderLeft: twin ? `8px solid ${C.accent}` : undefined,
      boxShadow: `10px 12px 30px ${alpha(C.bg0, 0.5)}`,
      opacity: clamp01(o * 1.5),
    })}
  >
    <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '0.14em', color: alpha(C.bg0, 0.55) }}>{twin ? 'TWIN' : 'EXAM'}</div>
    <div style={{ marginTop: 34, fontSize: 40, fontWeight: 700, whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>{text}</div>
    <div style={{ marginTop: 34, width: 220, height: 12, borderRadius: 6, background: alpha(C.muted, 0.6) }} />
  </div>
);

const Twins: React.FC<{ s: SeriesRecapState }> = ({ s }) => {
  const slide = card1X + (card2X - card1X) * s.card2;
  return (
    <>
      {s.card2 > 0 && <ExamCard text={TXT.twin} left={slide} o={s.card2} twin />}
      <div style={{ ...fadeUp(s.card1), position: 'absolute', inset: 0 }}>
        <ExamCard text={TXT.exam} left={card1X} o={1} />
      </div>
      {/* the link between the cards */}
      <svg width={960} height={600} style={abs(0, 0, { overflow: 'visible', opacity: s.same })}>
        <path
          d={`M ${card1X + CARD.w / 2} ${CARD.y + CARD.h + 8} Q 480 ${CARD.y + CARD.h + 120} ${card2X + CARD.w / 2} ${CARD.y + CARD.h + 8}`}
          fill="none"
          stroke={C.accentText}
          strokeWidth={5}
          strokeDasharray="14 10"
          strokeLinecap="round"
        />
      </svg>
      <div style={abs(0, CARD.y + CARD.h + 40, { width: 960, display: 'flex', justifyContent: 'center', ...fadeUp(s.same, 14) })}>
        <div style={{ padding: '10px 26px', borderRadius: 999, background: alpha(C.accent, 0.22), border: `3px solid ${C.accentText}`, color: C.text, fontSize: 36, fontWeight: 700 }}>
          {TXT.same}
        </div>
      </div>

      <RobotRow
        s={s}
        top={560}
        size={110}
        under={(k) => (
          <div style={{ display: 'flex', gap: 2, marginTop: 6 }}>
            <Tick size={44} color={OK} o={s.row[k]?.tick1 ?? 0} />
            <Tick size={44} color={OK} o={s.row[k]?.tick2 ?? 0} />
          </div>
        )}
      />
      <div style={abs(0, 880, { width: 960, display: 'flex', justifyContent: 'center' })}>{s.noDrop > 0 && <StampBox text={TXT.noDrop} color={OK} o={s.noDrop} size={72} />}</div>
    </>
  );
};

// ── agents ─────────────────────────────────────────────────────────────────────────────────────
const COND = { size: 190, x: 480 - 95, y: 60 } as const;
const HELP = { size: 100, y: 360 } as const;
const helperX = (k: number) => X0 + 70 + k * ((W - 140) / (HELPERS - 1));

const Agents: React.FC<{ s: SeriesRecapState }> = ({ s }) => (
  <>
    <Img src={staticFile('cast/robot-my-agent.png')} style={abs(COND.x, COND.y, { width: COND.size, height: COND.size, objectFit: 'contain', ...fadeUp(s.conductor) })} />
    {s.helpers.map((h, k) => {
      const hx = helperX(k);
      // The folder travels from the conductor's hands to the helper.
      const fx0 = 480;
      const fy0 = COND.y + COND.size * 0.7;
      const fx = fx0 + (hx - fx0) * h.folder;
      const fy = fy0 + (HELP.y - 40 - fy0) * h.folder - 60 * Math.sin(Math.PI * h.folder);
      return (
        <React.Fragment key={k}>
          <Img src={staticFile('cast/robot-my-agent.png')} style={abs(hx - HELP.size / 2, HELP.y, { width: HELP.size, height: HELP.size, objectFit: 'contain', filter: 'saturate(0.7)', ...fadeUp(h.appear, 20) })} />
          {h.folder > 0 && <Draw name="folder" w={64} h={64} style={abs(fx - 32, fy - 32, { opacity: clamp01(h.folder * 3) })} />}
        </React.Fragment>
      );
    })}

    <RobotRow
      s={s}
      top={600}
      size={110}
      under={(k) =>
        k === TIMEOUT_INDEX ? (
          <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Img src={staticFile('cast/stopwatch.png')} style={{ width: 72, height: 72, objectFit: 'contain', opacity: s.stopwatch, transform: `scale(${pop(s.stopwatch)}) rotate(${(1 - s.stopwatch) * -30}deg)` }} />
            <div style={{ fontSize: 30, fontWeight: 800, color: WARM, whiteSpace: 'nowrap', ...fadeUp(s.timeout, 12) }}>{TXT.timeout}</div>
          </div>
        ) : (
          <div style={{ marginTop: 10, fontSize: 30, fontWeight: 800, color: OK, whiteSpace: 'nowrap', opacity: s.row[k]?.result ?? 0, transform: `scale(${pop(s.row[k]?.result ?? 0)})` }}>
            {TXT.score}
          </div>
        )
      }
    />
  </>
);

// ── desks ──────────────────────────────────────────────────────────────────────────────────────
const PANEL = { y: 90, w: 450, h: 900 } as const;
const leftX = X0;
const rightX = X0 + W - PANEL.w;

const Panel: React.FC<{ left: number; o: number; label: string; accent: string; children: React.ReactNode }> = ({ left, o, label, accent, children }) => (
  <div
    style={abs(left, PANEL.y, {
      width: PANEL.w,
      height: PANEL.h,
      borderRadius: 24,
      background: alpha(C.card, 0.9),
      border: `3px solid ${alpha(accent, 0.55)}`,
      boxSizing: 'border-box',
      ...fadeUp(o, 30),
    })}
  >
    <div style={{ marginTop: 30, textAlign: 'center', fontSize: 44, fontWeight: 800, letterSpacing: '0.04em', color: accent }}>{label}</div>
    {children}
  </div>
);

const TaskCard: React.FC = () => (
  <div style={abs(40, 130, { width: 190, height: 150, borderRadius: 12, background: C.text, padding: '18px 18px', boxSizing: 'border-box', transform: 'rotate(-4deg)' })}>
    {[150, 120, 140, 90].map((w, i) => (
      <div key={i} style={{ width: w, height: 12, borderRadius: 6, background: alpha(C.muted, 0.8), marginBottom: 16 }} />
    ))}
  </div>
);

const Desks: React.FC<{ s: SeriesRecapState }> = ({ s }) => {
  const pulse = s.check > 0 && s.check < 1 ? pop(s.check) : 1;
  return (
    <>
      <Panel left={leftX} o={s.left} label={TXT.examLabel} accent={C.accentText}>
        <TaskCard />
        <Draw name="answer-key" w={170} h={170} style={abs(250, 120, { opacity: s.key, transform: `translateY(${(1 - s.key) * 30}px) rotate(5deg)` })} />
        <Draw name="desk-tidy" w={410} h={330} style={abs(20, 320)} />
        <div style={abs(0, 720, { width: PANEL.w, display: 'flex', justifyContent: 'center' })}>
          <div
            style={{
              padding: '12px 24px',
              borderRadius: 999,
              border: `3px solid ${OK}`,
              background: alpha(OK, 0.15),
              color: OK,
              fontSize: 36,
              fontWeight: 800,
              whiteSpace: 'nowrap',
              opacity: s.check,
              transform: `scale(${pulse})`,
              boxShadow: `0 0 ${40 * Math.sin(Math.PI * s.check)}px ${alpha(OK, 0.7)}`,
            }}
          >
            {TXT.key}
          </div>
        </div>
      </Panel>

      <Panel left={rightX} o={s.right} label={TXT.realLabel} accent={WARM}>
        <Draw name="desk-messy" w={410} h={420} style={abs(20, 150)} />
        <div style={abs(PANEL.w / 2 - 80, 620, { width: 160, height: 160 })}>
          <Draw name="answer-key" w={160} h={160} style={{ opacity: 0.4, filter: 'grayscale(1)' }} />
          <svg width={160} height={160} style={abs(0, 0, { overflow: 'visible' })}>
            <line x1={8} y1={152} x2={8 + 144 * s.strike} y2={152 - 144 * s.strike} stroke={ROSE} strokeWidth={12} strokeLinecap="round" opacity={s.strike > 0 ? 1 : 0} />
          </svg>
        </div>
      </Panel>
    </>
  );
};

/** Parts 1 and 2 of the series in five pictures: the benchmark exams, the podium, the twin questions, the agent teams, the two desks. */
export const SeriesRecap: React.FC<AnimProps & SeriesRecapProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  return (
    <Stage vertical={p.vertical} fill>
      {p.mode === 'bench' && <Bench s={s} />}
      {p.mode === 'podium' && <Podium s={s} />}
      {p.mode === 'twins' && <Twins s={s} />}
      {p.mode === 'agents' && <Agents s={s} />}
      {p.mode === 'desks' && <Desks s={s} />}
    </Stage>
  );
};
