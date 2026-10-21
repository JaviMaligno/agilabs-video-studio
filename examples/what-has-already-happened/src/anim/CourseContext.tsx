import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { gradientText } from './Stage.tsx';
import { ADVICE, CAL, STATUS_ROWS, VIDEOS, frameState, type ContextState, type CourseContextProps } from './CourseContext.state.ts';

export { frameState };
export type { CourseContextProps };

// Same frame as the plan board (PlanBoard.state.ts G): a top row at y 392 and the board box under it.
const BOX = { x: 44, w: 992 } as const;
const kicker: React.CSSProperties = { fontSize: 30, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted };
const panel: React.CSSProperties = { position: 'absolute', left: BOX.x, width: BOX.w, borderRadius: 26, background: alpha(C.bg1, 0.95), border: `2px solid ${alpha(C.muted, 0.22)}`, boxSizing: 'border-box' };

const Course: React.FC<{ s: ContextState['course'] }> = ({ s }) => {
  if (s.opacity <= 0) return null;
  const shown = Math.round(s.tiles * VIDEOS);
  const cells = Array.from({ length: 35 }, (_, i) => i + 1);
  const studio = (d: number) => (CAL.studio as readonly number[]).indexOf(d);
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: s.opacity }}>
      {/* The course: 68 videos, one tile each. */}
      <div style={{ ...panel, top: 392, height: 392, padding: '24px 40px', opacity: s.card, transform: `translateY(${(1 - s.card) * 40}px)` }}>
        <div style={kicker}>a university course</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 22, marginTop: 4, opacity: s.number }}>
          <span style={{ ...gradientText, fontSize: 132, fontWeight: 800, lineHeight: 1.05 }}>{s.count}</span>
          <span style={{ fontSize: 56, fontWeight: 800 }}>videos</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(17, 44px)', gap: 8, marginTop: 14 }}>
          {Array.from({ length: VIDEOS }, (_, i) => (
            <div key={i} style={{ width: 44, height: 30, borderRadius: 6, border: `2px solid ${alpha(C.accentText, 0.75)}`, background: alpha(C.accent, 0.18), opacity: i < shown ? 1 : 0, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width={12} height={12} viewBox="0 0 12 12">
                <path d="M3 1.5 L10 6 L3 10.5 Z" fill={alpha(C.accentText, 0.9)} />
              </svg>
            </div>
          ))}
        </div>
      </div>

      {/* The calendar: today, and four studio days weeks ahead. */}
      <div style={{ ...panel, top: 808, height: 360, padding: '20px 40px', opacity: s.calendar, transform: `translateY(${(1 - s.calendar) * 40}px)` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={kicker}>the calendar</div>
          <div style={{ fontSize: 36, fontWeight: 800, opacity: s.label, whiteSpace: 'nowrap' }}>
            studio: <span style={{ color: C.warm }}>4 days</span>
            <span style={{ opacity: s.weeks }}>
              , <span style={{ color: C.warm }}>weeks ahead</span>
            </span>
          </div>
        </div>
        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', columnGap: 10, rowGap: 8, marginTop: 44 }}>
          {cells.map((d) => {
            const k = studio(d);
            const lit = k >= 0 ? s.studio[k] : 0;
            const today = d === CAL.today;
            return (
              <div
                key={d}
                style={{
                  height: 40,
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                  fontWeight: 800,
                  color: lit > 0.5 ? C.bg0 : today ? C.text : alpha(C.muted, 0.8),
                  background: lit > 0 ? alpha(C.warm, lit) : 'transparent',
                  border: today ? `4px solid ${C.accentText}` : '4px solid transparent',
                  boxSizing: 'border-box',
                  transform: lit > 0 && lit < 1 ? `scale(${1.25 - 0.25 * lit})` : 'none',
                  visibility: d > CAL.days ? 'hidden' : 'visible',
                }}
              >
                {d}
              </div>
            );
          })}
          {/* "today" tag over its day. */}
          <div style={{ position: 'absolute', left: `${((CAL.today - 1) % 7) * (100 / 7)}%`, top: -4, transform: 'translate(-6px, -100%)', fontSize: 24, fontWeight: 800, color: C.accentText, whiteSpace: 'nowrap' }}>
            today
          </div>
        </div>
      </div>
    </div>
  );
};

const Header: React.FC<{ o: number }> = ({ o }) =>
  o <= 0 ? null : (
    <div
      style={{
        position: 'absolute',
        left: BOX.x,
        top: 406,
        width: BOX.w,
        height: 112,
        borderRadius: 18,
        border: `3px solid ${alpha(C.muted, 0.4)}`,
        background: alpha(C.bg1, 0.9),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 38,
        fontWeight: 800,
        fontFamily,
        opacity: o,
        whiteSpace: 'nowrap',
      }}
    >
      68 videos · studio: 4 days, <span style={{ color: C.warm, marginLeft: 10 }}>weeks ahead</span>
    </div>
  );

/** A small agent face, the speaker of the bubbles. */
const AgentFace: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" style={{ flex: 'none' }}>
    <rect x={5} y={10} width={38} height={30} rx={9} fill={C.card} stroke={C.accentText} strokeWidth={3.5} />
    <line x1={24} y1={3} x2={24} y2={10} stroke={C.accentText} strokeWidth={3.5} strokeLinecap="round" />
    <circle cx={24} cy={3.5} r={3} fill={C.accentText} />
    <circle cx={17} cy={24} r={3.6} fill={C.text} />
    <circle cx={31} cy={24} r={3.6} fill={C.text} />
    <path d="M17 32 Q24 36 31 32" fill="none" stroke={C.text} strokeWidth={3} strokeLinecap="round" />
  </svg>
);

const Agents: React.FC<{ s: ContextState['agents'] }> = ({ s }) => {
  if (s.opacity <= 0) return null;
  const tops = [646, 850];
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: s.opacity }}>
      <div style={{ ...panel, top: 560, height: 560 }} />
      <div style={{ position: 'absolute', left: 84, top: 584, display: 'flex', alignItems: 'center', gap: 14, opacity: s.kicker }}>
        <div style={kicker}>my coding agents, planning it</div>
      </div>
      {ADVICE.map((txt, i) => {
        const o = s.bubbles[i];
        if (o <= 0) return null;
        return (
          <div key={i} style={{ position: 'absolute', left: 84, top: tops[i], width: 912, display: 'flex', alignItems: 'flex-start', gap: 20, opacity: o, transform: `translateY(${(1 - o) * 24}px)` }}>
            <AgentFace size={78} />
            <div
              style={{
                position: 'relative',
                flex: 1,
                padding: '18px 28px',
                borderRadius: 26,
                borderTopLeftRadius: 6,
                border: `4px solid ${s.doubt > 0.5 ? alpha(C.muted, 0.55) : C.accentText}`,
                background: alpha(C.card, 0.97),
                fontSize: 40,
                fontWeight: 800,
                lineHeight: 1.22,
                color: alpha(C.text, 1 - 0.5 * s.doubt),
              }}
            >
              “{txt}”
            </div>
          </div>
        );
      })}
      {s.stamp > 0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 1010, display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              padding: '6px 30px',
              border: `6px solid ${C.muted}`,
              borderRadius: 16,
              background: alpha(C.bg0, 0.9),
              color: C.muted,
              fontSize: 54,
              fontWeight: 800,
              letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
              opacity: Math.min(1, s.stamp * 1.4),
              transform: `rotate(-4deg) scale(${1.6 - 0.6 * s.stamp})`,
            }}
          >
            didn’t hold up
          </div>
        </div>
      )}
    </div>
  );
};

const Status: React.FC<{ s: ContextState['status'] }> = ({ s }) => {
  if (s.opacity <= 0 || s.card <= 0) return null;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ ...panel, top: 560, height: 560, padding: '26px 44px', opacity: s.card, transform: `translateY(${(1 - s.card) * 40}px)` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={kicker}>the status file</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: C.muted }}>kept by the agent</div>
        </div>
        <div style={{ marginTop: 22, borderRadius: 16, border: `2px solid ${alpha(C.muted, 0.3)}`, overflow: 'hidden' }}>
          {STATUS_ROWS.map((r, i) => {
            const taken = i < 2;
            const lit = i === 0 ? s.highlight : 0;
            const ghost = taken ? s.ghost : 0;
            return (
              <div
                key={r.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  height: 96,
                  padding: '0 32px',
                  borderTop: i ? `2px solid ${alpha(C.muted, 0.22)}` : 'none',
                  background: lit > 0 ? alpha(C.warm, 0.18 * lit) : 'transparent',
                  boxShadow: lit > 0 ? `inset 0 0 0 4px ${alpha(C.warm, lit * (1 - 0.6 * ghost))}` : 'none',
                  opacity: s.rows[i] * (1 - 0.55 * ghost),
                  transform: `translateX(${(1 - s.rows[i]) * 40}px)`,
                  fontSize: 44,
                  fontWeight: 800,
                }}
              >
                <span style={{ color: taken ? C.text : C.muted }}>{r.label}</span>
                <span style={{ fontSize: 56, color: lit > 0.5 ? C.warm : C.text }}>{r.value}</span>
              </div>
            );
          })}
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 520, fontSize: 36, fontWeight: 800, color: C.warm, textAlign: 'center', opacity: s.note, transform: `translateY(${(1 - s.note) * 14}px)` }}>
          the studio was still weeks away
        </div>
      </div>
      {s.stamp > 0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 954, display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              padding: '6px 34px',
              border: `8px solid ${C.marker}`,
              borderRadius: 20,
              background: alpha(C.bg0, 0.88),
              color: C.marker,
              fontSize: 70,
              whiteSpace: 'nowrap',
              fontWeight: 800,
              lineHeight: 1.04,
              textAlign: 'center',
              letterSpacing: '0.02em',
              opacity: Math.min(1, s.stamp * 1.4),
              transform: `rotate(-3deg) scale(${1.8 - 0.8 * s.stamp})`,
            }}
          >
            NOTHING RECORDED
          </div>
        </div>
      )}
    </div>
  );
};

export const CourseContext: React.FC<AnimProps & CourseContextProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  return (
    <AbsoluteFill style={{ fontFamily, color: C.text }}>
      <Course s={s.course} />
      <Header o={s.header.opacity} />
      <Agents s={s.agents} />
      <Status s={s.status} />
    </AbsoluteFill>
  );
};
