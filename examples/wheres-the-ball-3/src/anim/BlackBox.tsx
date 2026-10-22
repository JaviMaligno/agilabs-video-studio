import React from 'react';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { DRAWERS, STRIP, frameState, type BlackBoxProps } from './BlackBox.state.ts';
import { Ball, BoxGlyph, Cloud, Marker, MissLine, PitchFrame, Players, Stamp, Tag, toPx } from './pieces.tsx';

export { frameState };
export type { BlackBoxProps };

const STRIP_BOX = { left: 60, top: 930, w: 960, h: 336 };

/** A short arrow between two frame points (pixels). */
const Pointer: React.FC<{ x0: number; y0: number; x1: number; y1: number; draw: number }> = ({ x0, y0, x1, y1, draw }) => {
  if (draw <= 0) return null;
  const x = x0 + (x1 - x0) * draw;
  const y = y0 + (y1 - y0) * draw;
  const a = Math.atan2(y1 - y0, x1 - x0);
  const h = 22;
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
      <line x1={x0} y1={y0} x2={x} y2={y} stroke={C.accentText} strokeWidth={7} strokeLinecap="round" />
      {draw >= 1 && (
        <polygon
          points={`${x1},${y1} ${x1 - h * Math.cos(a - 0.45)},${y1 - h * Math.sin(a - 0.45)} ${x1 - h * Math.cos(a + 0.45)},${y1 - h * Math.sin(a + 0.45)}`}
          fill={C.accentText}
        />
      )}
    </svg>
  );
};

/** The 60 kB black box (see BlackBox.state.ts). */
export const BlackBox: React.FC<AnimProps & BlackBoxProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);

  if (s.mode === 'stamps') {
    const px = toPx(STRIP.view, STRIP_BOX);
    const cl = px(STRIP.cloud);
    return (
      <div style={{ position: 'absolute', inset: 0, fontFamily, color: C.text }}>
        {s.rows.map((r, i) => (
          <div
            key={r.label}
            style={{
              position: 'absolute',
              left: 60,
              width: 960,
              top: 448 + i * 150,
              height: 128,
              borderRadius: 20,
              background: alpha(r.focus > 0 ? C.accent : C.card, 0.18 + 0.2 * r.focus),
              border: `3px solid ${alpha(r.focus > 0 ? C.accentText : C.muted, 0.35 + 0.6 * r.focus)}`,
              boxShadow: r.focus > 0 ? `0 0 ${40 * r.focus}px ${alpha(C.accent, 0.5)}` : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 28,
              paddingLeft: 36,
              opacity: r.appear,
              transform: `translateX(${(1 - r.appear) * -60}px) scale(${1 + 0.025 * r.focus})`,
            }}
          >
            <span style={{ width: 54, height: 12, borderRadius: 99, background: alpha(C.text, 0.55), flex: 'none' }} />
            <span style={{ fontSize: 30, fontWeight: 800, color: C.accentText, width: 30 }}>{i + 1}</span>
            <span style={{ fontSize: 56, fontWeight: 800 }}>{DRAWERS[i]}</span>
            <div style={{ position: 'absolute', right: 34, top: '50%', transform: 'translateY(-50%)' }}>
              <Stamp text={r.stamp} pop={r.appear} tone={r.tone} size={50} rotate={-5} />
            </div>
          </div>
        ))}
        <PitchFrame
          box={STRIP_BOX}
          view={STRIP.view}
          mini
          opacity={s.strip.appear}
          svg={
            <>
              <Players players={STRIP.players} r={1.0} />
              <Cloud x={STRIP.cloud.x} y={STRIP.cloud.y} r={2.4} opacity={1} bright={1} seed={2} />
              <Marker x={STRIP.cloud.x} y={STRIP.cloud.y} opacity={1} r={0.9} />
              <MissLine from={STRIP.cloud} to={s.strip.ball} draw={s.strip.miss} w={0.3} />
              <Ball x={s.strip.ball.x} y={s.strip.ball.y} opacity={1} r={0.7} />
            </>
          }
          html={
            s.strip.sure > 0 ? (
              <div style={{ position: 'absolute', left: cl.x, top: cl.y + 52, transform: 'translateX(-50%)', opacity: s.strip.sure }}>
                <Tag text="very sure" opacity={1} accent size={34} />
              </div>
            ) : null
          }
        />
      </div>
    );
  }

  const b = s.box!;
  const h = b.w * 0.78;
  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily, color: C.text }}>
      <div style={{ position: 'absolute', left: b.x, top: b.y }}>
        <BoxGlyph w={b.w} face={b.face} drawers={b.drawers} labels={[...DRAWERS]} lit={b.lit} glow={b.glow} />
      </div>

      {/* Closed: what it gives, and what it doesn't. */}
      <Pointer x0={b.x + b.w * 0.3} y0={b.y + h + 6} x1={300} y1={968} draw={s.answer} />
      <Pointer x0={b.x + b.w * 0.7} y0={b.y + h + 6} x1={780} y1={968} draw={s.why} />
      {s.answer > 0 && (
        <div style={{ position: 'absolute', left: 90, top: 980, width: 420, opacity: s.answer, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <div style={{ fontSize: 50, fontWeight: 800 }}>answer</div>
          <div style={{ position: 'relative', width: 380, height: 200 }}>
            <PitchFrame
              box={{ left: 0, top: 0, w: 380, h: 200 }}
              view={{ x0: 0, x1: 38, y0: 0, y1: 20 }}
              mini
              glow={1}
              svg={
                <>
                  <Players players={[{ x: 9, y: 6, team: 0 }, { x: 14, y: 14, team: 1 }, { x: 25, y: 9, team: 0 }, { x: 30, y: 15, team: 1 }, { x: 19, y: 4, team: 1 }]} r={1.1} />
                  <Marker x={21} y={11} opacity={1} r={1.4} />
                </>
              }
            />
          </div>
        </div>
      )}
      {s.why > 0 && (
        <div style={{ position: 'absolute', left: 570, top: 980, width: 420, opacity: s.why, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <div style={{ fontSize: 50, fontWeight: 800, color: C.muted }}>why?</div>
          <div style={{ width: 380, height: 200, borderRadius: 18, border: `4px dashed ${alpha(C.muted, 0.6)}`, background: alpha(C.card, 0.4) }} />
        </div>
      )}
    </div>
  );
};
