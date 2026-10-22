import React from 'react';
import { C, GRADIENT, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { frameState, type HoleTestProps } from './HoleTest.state.ts';
import { BOX, VIEW_FULL, VIEW_MINI, type Box, type Pt } from './pitch.ts';
import { Arrow, Ball, Marker, PitchFrame, Players, Tag, toPx } from './pieces.tsx';

export { frameState };
export type { HoleTestProps };

const perimeter = (pts: Pt[]) => pts.reduce((a, q, i) => a + Math.hypot(pts[(i + 1) % pts.length].x - q.x, pts[(i + 1) % pts.length].y - q.y), 0);

/** The ring polygon, drawn `draw` of its length. */
const RingLines: React.FC<{ pts: Pt[]; draw: number; w: number }> = ({ pts, draw, w }) => {
  if (draw <= 0) return null;
  const len = perimeter(pts);
  return (
    <polygon
      points={pts.map((q) => `${q.x},${q.y}`).join(' ')}
      fill="none"
      stroke={C.accentText}
      strokeWidth={w}
      strokeLinejoin="round"
      strokeDasharray={`${len * draw} ${len}`}
      opacity={0.85}
    />
  );
};

/** A soft shaded hole. */
const Hole: React.FC<{ x: number; y: number; r: number; opacity: number }> = ({ x, y, r, opacity }) =>
  opacity > 0 ? (
    <g opacity={opacity}>
      <circle cx={x} cy={y} r={r} fill={alpha(C.accent, 0.22)} />
      <circle cx={x} cy={y} r={r} fill="none" stroke={alpha(C.accentText, 0.6)} strokeWidth={r * 0.03} strokeDasharray={`${r * 0.15} ${r * 0.1}`} />
    </g>
  ) : null;

const Mark: React.FC<{ ok: boolean; pop: number }> = ({ ok, pop }) =>
  pop > 0 ? (
    <div
      style={{
        width: 96,
        height: 96,
        borderRadius: 48,
        background: ok ? GRADIENT : alpha(C.bg0, 0.9),
        border: ok ? 'none' : `5px solid ${C.muted}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 60,
        fontWeight: 800,
        color: ok ? C.text : C.muted,
        opacity: pop,
        transform: `scale(${1.6 - 0.6 * pop})`,
        boxShadow: ok ? `0 0 40px ${alpha(C.accent, 0.6)}` : 'none',
      }}
    >
      {ok ? '✓' : '✗'}
    </div>
  ) : null;

/** The topology test (see HoleTest.state.ts). */
export const HoleTest: React.FC<AnimProps & HoleTestProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);

  if (s.mode === 'contrast') {
    const L = s.left;
    const R = s.right;
    const lpx = toPx(VIEW_MINI, BOX.miniL)(L.hole);
    const rpx = toPx(VIEW_MINI, BOX.miniR)(R.ball);
    const side = (box: Box, focus: number, label: string, svg: React.ReactNode, mark: React.ReactNode, tag: string) => (
      <div style={{ opacity: L.appear * (0.45 + 0.55 * Math.max(focus, 0.4)) }}>
        <PitchFrame box={box} view={VIEW_MINI} mini glow={focus} svg={svg} html={<div style={{ position: 'absolute', left: 16, top: 14 }}><Tag text={label} opacity={1} accent={focus > 0.5} size={36} /></div>} />
        {mark}
        <div style={{ position: 'absolute', left: box.left, width: box.w, top: box.top + box.h + 20, textAlign: 'center', fontSize: 44, fontWeight: 800, color: focus > 0.5 ? C.text : C.muted }}>{tag}</div>
      </div>
    );
    return (
      <div style={{ position: 'absolute', inset: 0, fontFamily, color: C.text }}>
        {side(
          BOX.miniL,
          L.focus,
          'shape',
          <>
            <Hole x={L.hole.x} y={L.hole.y} r={L.hole.r} opacity={1 - 0.5 * L.no} />
            <RingLines pts={L.ring} draw={1} w={0.3} />
            <Players players={L.players} r={1.1} />
          </>,
          <div style={{ position: 'absolute', left: BOX.miniL.left + lpx.x - 48, top: BOX.miniL.top + lpx.y - 48 }}>
            <Mark ok={false} pop={L.no} />
          </div>,
          "the crowd's shape",
        )}
        {side(
          BOX.miniR,
          R.focus,
          'movement',
          <>
            {R.players.map((q, i) => (
              <Arrow key={i} x0={q.x} y0={q.y} x1={q.x + q.vx * 0.75 * R.arrows} y1={q.y + q.vy * 0.75 * R.arrows} opacity={R.arrows * 0.85} w={0.32} />
            ))}
            <Players players={R.players} r={1.1} />
            <Ball x={R.ball.x} y={R.ball.y} opacity={1} r={0.75} />
            <Marker x={R.marker.x} y={R.marker.y} opacity={R.marker.opacity} r={1.25} />
          </>,
          <div style={{ position: 'absolute', left: BOX.miniR.left + rpx.x + 40, top: BOX.miniR.top + rpx.y - 150 }}>
            <Mark ok pop={R.yes} />
          </div>,
          "where it's moving",
        )}
      </div>
    );
  }

  const px = toPx(VIEW_FULL, BOX.full);
  const hc = px(s.holeC);
  const svg = (
    <>
      <Hole x={s.holeC.x} y={s.holeC.y} r={s.holeC.r} opacity={s.hole} />
      <RingLines pts={s.ringPts} draw={s.lines} w={0.4} />
      <Players players={s.players} />
    </>
  );
  const html = (
    <>
      {s.hole > 0 && (
        <div style={{ position: 'absolute', left: hc.x, top: hc.y + s.holeC.r * 13.7 + 70, transform: 'translateX(-50%)', opacity: s.hole }}>
          <Tag text="the biggest hole" opacity={1} accent size={40} />
        </div>
      )}
      {s.ballQ > 0 && (
        <div
          style={{
            position: 'absolute',
            left: hc.x,
            top: hc.y,
            transform: `translate(-50%, -50%) translateY(${(1 - s.ballQ) * -120}px)`,
            opacity: s.ballQ,
            padding: '10px 24px',
            borderRadius: 999,
            background: alpha(C.bg0, 0.85),
            border: `4px solid ${C.accentText}`,
            fontSize: 48,
            fontWeight: 800,
            color: C.text,
            whiteSpace: 'nowrap',
            boxShadow: `0 0 30px ${alpha(C.accent, 0.5)}`,
          }}
        >
          ball?
        </div>
      )}
      {s.dim > 0 && <div style={{ position: 'absolute', inset: 0, background: C.bg0, opacity: s.dim }} />}
    </>
  );
  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily, color: C.text }}>
      <PitchFrame box={BOX.full} view={VIEW_FULL} svg={svg} html={html} />
      {s.card > 0 && (
        <div
          style={{
            position: 'absolute',
            left: 90,
            width: 900,
            top: 905,
            padding: '30px 40px 34px',
            borderRadius: 24,
            background: alpha(C.card, 0.97),
            border: `3px solid ${alpha(C.accentText, 0.6)}`,
            boxShadow: `0 20px 60px ${alpha(C.bg0, 0.7)}`,
            opacity: s.card,
            transform: `translateY(${(1 - s.card) * 40}px) rotate(${-1.5 * s.card}deg)`,
          }}
        >
          {/* The pin. */}
          <div style={{ position: 'absolute', left: '50%', top: -18, width: 36, height: 36, marginLeft: -18, borderRadius: 18, background: GRADIENT, boxShadow: `0 4px 12px ${alpha(C.bg0, 0.8)}` }} />
          <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.accentText, marginBottom: 12 }}>My rule · set before the run</div>
          <div style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.15 }}>
            Topology only counts if it{' '}
            <span style={{ position: 'relative', whiteSpace: 'nowrap' }}>
              beats geometry.
              <span style={{ position: 'absolute', left: 0, bottom: -4, height: 8, width: `${s.underline * 100}%`, borderRadius: 4, background: GRADIENT }} />
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
