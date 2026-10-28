import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { Chip, Clock, Pause, Tick, clamp01 } from './pieces.tsx';
import { RACE_TXT, STOPS, frameState, type WorkerRaceProps } from './WorkerRace.state.ts';

export { frameState };
export type { WorkerRaceProps };

const LINE = { x: 150, top: 590, bottom: 1215 } as const;
const STOP_Y = [630, 805, 980, 1155];
const toneOf = (t: string) => (t === 'ok' ? C.ok : t === 'warm' ? C.warm : C.text);

export const WorkerRace: React.FC<AnimProps & WorkerRaceProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const stops = [s.st1, s.st2, s.st3, s.st4];
  const effects = [0, s.e1, 0, s.e2];
  const len = LINE.bottom - LINE.top;
  return (
    <AbsoluteFill style={{ fontFamily, color: C.text }}>
      {/* the rule */}
      <div
        style={{
          position: 'absolute',
          left: 70,
          width: 940,
          top: 244,
          height: 128,
          borderRadius: 20,
          background: C.card,
          border: `4px solid ${C.marker}`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: s.rule,
          transform: `translateY(${(1 - s.rule) * -30}px)`,
        }}
      >
        <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.marker }}>{RACE_TXT.kicker}</div>
        <div style={{ fontSize: 42, fontWeight: 800, marginTop: 4 }}>{RACE_TXT.rule}</div>
      </div>

      {/* what most models proposed */}
      <div style={{ position: 'absolute', left: 70, width: 940, top: 420, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, opacity: s.prop, transform: `translateY(${(1 - s.prop) * 20}px)` }}>
        {RACE_TXT.models.map((m) => (
          <Chip key={m} text={m} size={30} />
        ))}
        <div style={{ fontSize: 44, fontWeight: 800, color: C.muted }}>→</div>
        <div style={{ opacity: clamp01(s.clock * 1.5), transform: `scale(${1.5 - 0.5 * s.clock})` }}>
          <Clock size={64} color={C.accentText} turn={0.2} />
        </div>
        <div style={{ fontSize: 36, fontWeight: 800, opacity: s.clock }}>{RACE_TXT.check}</div>
      </div>

      {/* the time line */}
      <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
        {s.line > 0.01 && <line x1={LINE.x} y1={LINE.top} x2={LINE.x} y2={LINE.top + len * s.line} stroke={alpha(C.muted, 0.8)} strokeWidth={6} strokeLinecap="round" />}
        {s.line > 0.98 && <path d={`M ${LINE.x - 14} ${LINE.bottom - 4} L ${LINE.x} ${LINE.bottom + 20} L ${LINE.x + 14} ${LINE.bottom - 4}`} fill={alpha(C.muted, 0.8)} />}
        {STOP_Y.map((y, i) => (
          <circle key={i} cx={LINE.x} cy={y} r={18 + 6 * stops[i]} fill={stops[i] > 0.5 ? toneOf(STOPS[i].tone) : C.bg1} stroke={alpha(C.muted, 0.8)} strokeWidth={4} opacity={clamp01((s.line * len - (y - LINE.top) + 20) / 40)} />
        ))}
      </svg>
      {STOPS.map((st, i) => {
        const o = stops[i];
        // Worker A greys out while it is paused, and comes back when it resumes.
        const paused = i === 0 ? s.pause * (1 - s.st4) : 0;
        return (
          <div key={st.label} style={{ position: 'absolute', left: LINE.x + 50, top: STOP_Y[i] - 30, display: 'flex', alignItems: 'center', gap: 16, opacity: o * (1 - 0.5 * paused), transform: `translateX(${(1 - o) * 30}px)` }}>
            <div style={{ fontSize: 42, fontWeight: 800, color: toneOf(st.tone) }}>{st.label}</div>
            {i === 0 && <div style={{ opacity: o }}><Tick size={44} color={C.ok} /></div>}
            {i === 0 && <div style={{ opacity: s.pause, transform: `scale(${1.5 - 0.5 * s.pause})` }}><Pause size={44} color={C.warm} /></div>}
          </div>
        );
      })}
      {STOPS.map((st, i) =>
        'effect' in st && effects[i] > 0 ? (
          <div key={`e${i}`} style={{ position: 'absolute', left: 150 + 50, top: STOP_Y[i] + 30, opacity: effects[i], transform: `scale(${1.3 - 0.3 * effects[i]})`, transformOrigin: 'left center' }}>
            <div style={{ padding: '6px 22px', borderRadius: 12, border: `4px solid ${toneOf(st.tone)}`, color: toneOf(st.tone), background: alpha(toneOf(st.tone), 0.12), fontSize: 36, fontWeight: 800 }}>{st.effect}</div>
          </div>
        ) : null,
      )}
      {/* the clock check sits on worker A */}
      {s.clock > 0 && (
        <div style={{ position: 'absolute', left: 820, top: STOP_Y[0] - 46, opacity: s.clock * (1 - 0.5 * s.pause) }}>
          <Clock size={84} color={C.accentText} turn={0.2} />
        </div>
      )}
      {s.quote > 0 && (
        <div style={{ position: 'absolute', right: 70, top: STOP_Y[3] + 26, textAlign: 'right', opacity: s.quote, transform: `translateY(${(1 - s.quote) * 16}px)` }}>
          <div style={{ fontSize: 40, fontWeight: 700, fontStyle: 'italic', color: C.warm }}>{RACE_TXT.quote}</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: C.muted, marginTop: 4 }}>— {RACE_TXT.who}</div>
        </div>
      )}
    </AbsoluteFill>
  );
};
