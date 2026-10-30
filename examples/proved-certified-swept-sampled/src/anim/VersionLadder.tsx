import React from 'react';
import { C, alpha } from '../brand.ts';
import type { AnimProps } from './types.ts';
import { Stage } from './Stage.tsx';
import { Tally } from './pieces.tsx';
import { FOOTNOTE, V4_DETAIL, frameState, type LadderProps } from './VersionLadder.state.ts';
import { Ghost, HALLOWEEN, HW, Tombstone, bump } from './halloween.tsx';
import { progress, sceneTime } from './steps.ts';

export { frameState };

type Row = ReturnType<typeof frameState>['rows'][number];

/** One version row (the original look): used for all four normally, for v4 in the graveyard. */
const RowView: React.FC<{ r: Row; detail: number }> = ({ r, detail }) => (
  <div
    style={{
      opacity: r.pop,
      transform: `translateX(${(1 - r.pop) * 60}px)`,
      display: 'flex',
      alignItems: 'center',
      gap: 26,
      padding: r.ok ? '26px 30px' : '18px 30px',
      borderRadius: 24,
      background: r.ok ? alpha(C.ok, 0.12) : alpha(C.bg1, 0.92),
      border: `${r.ok ? 4 : 2}px solid ${r.ok ? C.ok : alpha(C.rose, 0.55)}`,
      boxShadow: r.glow > 0 ? `0 0 ${50 * r.glow}px ${alpha(C.ok, 0.45)}` : undefined,
    }}
  >
    <div style={{ fontSize: r.ok ? 70 : 58, fontWeight: 900, width: 110, color: r.ok ? C.text : C.muted }}>{r.v}</div>
    <div style={{ fontSize: r.ok ? 70 : 56, fontWeight: 900, width: 64, color: r.ok ? C.ok : C.roseText }}>{r.ok ? '✓' : '✗'}</div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: r.ok ? 46 : 40, fontWeight: 800, color: r.ok ? C.text : alpha(C.text, 0.85) }}>{r.text}</div>
      {r.ok && <div style={{ fontSize: 28, fontWeight: 600, color: C.muted, opacity: detail, lineHeight: 1.25 }}>{V4_DETAIL}</div>}
    </div>
  </div>
);

/** Halloween: the three refuted versions as crooked headstones; a little ghost leaves each one. */
const Graveyard: React.FC<{ rows: Row[]; t: number }> = ({ rows, t }) => {
  const SW = 270;
  const SH = 290;
  const TOP = 150;
  const xs = [28, 345, 662];
  const tilts = [-4, 2.5, -1.5];
  return (
    <>
      <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} width={960} height={600}>
        <path d={`M -60 ${TOP + SH + 40} L -60 ${TOP + SH - 4} Q 240 ${TOP + SH - 22} 480 ${TOP + SH - 6} T 1020 ${TOP + SH - 8} L 1020 ${TOP + SH + 40} Z`} fill={HW.stone1} opacity={Math.max(rows[0].pop, 0)} />
        {rows.slice(0, 3).map((r, i) => {
          const land = 0.15 + 0.3 * i + 0.35;
          const g = progress(t, land + 0.1, 1.5);
          return <Ghost key={i} x={xs[i] + SW / 2 + (i === 2 ? -50 : 50) * g} y={TOP + 60 - 170 * g} size={64} opacity={0.9 * bump(g)} t={t} tilt={10 * g} look={1} />;
        })}
      </svg>
      {rows.slice(0, 3).map((r, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: xs[i],
            top: TOP,
            opacity: Math.min(1, r.pop * 2),
            transform: `translateY(${-(1 - r.pop) * 160}px) rotate(${tilts[i] * r.pop}deg)`,
            transformOrigin: 'bottom center',
          }}
        >
          <Tombstone w={SW} h={SH} version={r.v} epitaph={r.text} seed={i} t={t} />
        </div>
      ))}
    </>
  );
};

export const VersionLadder: React.FC<AnimProps & LadderProps> = ({ t, beats, dur, vertical, ...p }) => {
  const s = frameState(p, t, beats, dur);
  return (
    <Stage vertical={vertical} fill>
      <div style={{ position: 'absolute', inset: 0 }}>
        <Tally value={s.tally.value} appear={s.tally.appear} pulse={s.tally.pulse} />
        {HALLOWEEN ? (
          <>
            <Graveyard rows={s.rows} t={sceneTime(t, dur)} />
            <div style={{ position: 'absolute', left: 0, right: 0, top: 500 }}>
              <RowView r={s.rows[3]} detail={s.detail} />
            </div>
          </>
        ) : (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 110, display: 'flex', flexDirection: 'column', gap: 22 }}>
            {s.rows.map((r, i) => (
              <RowView key={i} r={r} detail={s.detail} />
            ))}
          </div>
        )}
        <div style={{ position: 'absolute', left: 10, right: 10, top: 820, fontSize: 31, fontWeight: 500, color: C.muted, lineHeight: 1.3, opacity: s.footnote, textAlign: 'center' }}>
          {FOOTNOTE}
        </div>
      </div>
    </Stage>
  );
};
