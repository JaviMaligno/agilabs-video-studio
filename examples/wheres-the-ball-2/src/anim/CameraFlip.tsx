import React from 'react';
import { C, GRADIENT, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { frameState, ON_PITCH, ON_SCREEN, type FlipProps } from './CameraFlip.state.ts';
import { Markings } from './pitchParts.tsx';
import { gradientText, stageOf } from './Stage.tsx';

export { frameState };
export type { FlipProps };

// Layout in stage pixels (vertical stage: 960 x 1090).
const PITCH_Y = 128;
const DIAL = { cx: 480, cy: 1040, r: 210 };

const angleOf = (v: number) => Math.PI * (1 - (Math.max(-1, Math.min(1, v)) + 1) / 2);
const polar = (v: number, r: number) => ({ x: DIAL.cx + r * Math.cos(angleOf(v)), y: DIAL.cy - r * Math.sin(angleOf(v)) });

const Pill: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      position: 'absolute',
      padding: '4px 16px',
      borderRadius: 12,
      background: alpha(C.bg0, 0.9),
      border: `2px solid ${alpha(C.muted, 0.5)}`,
      fontSize: 32,
      fontWeight: 700,
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    {children}
  </div>
);

export const CameraFlip: React.FC<AnimProps & FlipProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const S = stageOf(p.vertical);
  const W = S.w;
  const k = W / 105;
  const H = 68 * k;
  const px = (x: number) => x * k;
  const py = (y: number) => y * k;
  const cam = { x: px(s.cam.x - s.cam.w / 2), y: py(s.cam.y - s.cam.h / 2), w: s.cam.w * k, h: s.cam.h * k };
  const liftScale = 1 + 0.35 * s.cam.lift;
  const arc = (from: number, to: number) => {
    const a = polar(from, DIAL.r);
    const b = polar(to, DIAL.r);
    return `M${a.x} ${a.y} A${DIAL.r} ${DIAL.r} 0 0 1 ${b.x} ${b.y}`;
  };
  const tip = polar(s.dial.needle, DIAL.r - 26);
  const ghostTip = polar(ON_SCREEN.value, DIAL.r - 26);

  return (
    <div style={{ position: 'absolute', left: S.side, top: S.top, width: W, height: S.h, fontFamily, color: C.text }}>
      {/* The heuristic, and the stamp that calls it a trap. */}
      <div style={{ position: 'absolute', left: 0, top: 6, width: W, height: 100, display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: s.tag.opacity }}>
        <div style={{ position: 'relative', padding: '12px 30px', borderRadius: 18, border: `3px dashed ${alpha(C.text, 0.7)}`, background: alpha(C.card, 0.9), fontSize: 46, fontWeight: 800 }}>
          “The ball is near the players”
          {s.stamp.opacity > 0 && (
            <div
              style={{
                position: 'absolute',
                right: -18,
                bottom: -40,
                transform: `rotate(-6deg) scale(${1.5 - 0.5 * s.stamp.opacity})`,
                opacity: s.stamp.opacity,
                padding: '6px 22px',
                borderRadius: 14,
                background: GRADIENT,
                fontSize: 44,
                fontWeight: 800,
                boxShadow: `0 0 30px ${alpha(C.accent, 0.7)}`,
              }}
            >
              a trap
            </div>
          )}
        </div>
      </div>

      {/* Full pitch, scripted long pass. */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: PITCH_Y,
          width: W,
          height: H,
          borderRadius: 18,
          overflow: 'hidden',
          background: C.bg1,
          boxShadow: `0 0 0 2px ${alpha(C.muted, 0.18)}, 0 30px 80px ${alpha(C.accent, 0.12)}`,
        }}
      >
        <svg width={W} height={H} viewBox="0 0 105 68" style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <radialGradient id="cfBallGlow">
              <stop offset="0%" stopColor={C.accent2} stopOpacity={0.9} />
              <stop offset="100%" stopColor={C.accent2} stopOpacity={0} />
            </radialGradient>
          </defs>
          <Markings sw={0.32} />
          {s.players.map((q, i) => (
            <circle key={i} cx={q.x} cy={q.y} r={1.35} fill={q.team === 0 ? C.accentText : C.text} stroke={C.bg0} strokeWidth={0.3} />
          ))}
          {/* Players' centre: a dashed ring. */}
          {s.centroid.opacity > 0 && (
            <g opacity={s.centroid.opacity}>
              <circle cx={s.centroid.x} cy={s.centroid.y} r={4.2} fill={alpha(C.muted, 0.12)} stroke={C.text} strokeWidth={0.45} strokeDasharray="1.2 0.8" />
              <circle cx={s.centroid.x} cy={s.centroid.y} r={0.7} fill={C.text} />
            </g>
          )}
          {s.ball.opacity > 0 && (
            <g opacity={s.ball.opacity}>
              <circle cx={s.ball.x} cy={s.ball.y} r={4.5} fill="url(#cfBallGlow)" opacity={0.8} />
              <circle cx={s.ball.x} cy={s.ball.y} r={1.1} fill="#ffffff" />
            </g>
          )}
        </svg>

        {/* The TV frame chasing the ball; it lifts away when the reading moves to the pitch. */}
        {s.cam.opacity > 0 && (
          <div
            style={{
              position: 'absolute',
              left: cam.x,
              top: cam.y,
              width: cam.w,
              height: cam.h,
              opacity: s.cam.opacity,
              transform: `scale(${liftScale})`,
              borderRadius: 16,
              border: `5px solid ${C.text}`,
              boxShadow: `0 0 0 4000px ${alpha(C.bg0, 0.45 * s.cam.opacity)}`,
            }}
          >
            <div style={{ position: 'absolute', left: 10, top: -50, padding: '2px 14px', borderRadius: 10, background: C.text, color: C.bg0, fontSize: 30, fontWeight: 800, whiteSpace: 'nowrap' }}>
              TV frame
            </div>
          </div>
        )}

        {s.labels.opacity > 0 && (
          <>
            <Pill style={{ left: px(s.ball.x) - 26, top: py(s.ball.y), transform: 'translate(-100%, -50%)', opacity: s.labels.opacity, color: C.accentText, borderColor: alpha(C.accentText, 0.6) }}>
              ball at the edge
            </Pill>
            <Pill style={{ left: px(s.centroid.x), top: py(s.centroid.y) + 58, transform: 'translateX(-30%)', opacity: s.labels.opacity }}>players' centre</Pill>
          </>
        )}

        {/* The closing line over the dimmed pitch. */}
        {s.sign.line1 > 0 && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: alpha(C.bg0, s.sign.dim),
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <div style={{ opacity: s.sign.line1, fontSize: 52, fontWeight: 700, color: C.muted }}>Same statistic.</div>
            <div style={{ opacity: s.sign.line2, transform: `scale(${1.2 - 0.2 * s.sign.line2})`, fontSize: 64, fontWeight: 800, whiteSpace: 'nowrap' }}>
              The camera <span style={gradientText}>flips its sign.</span>
            </div>
          </div>
        )}
      </div>

      {/* The correlation dial: players' centre vs ball. */}
      {s.dial.opacity > 0 && (
        <div style={{ position: 'absolute', inset: 0, opacity: s.dial.opacity }}>
          <svg width={W} height={S.h} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
            <path d={arc(-1, 1)} fill="none" stroke={alpha(C.muted, 0.3)} strokeWidth={22} strokeLinecap="round" />
            <path d={arc(0, 1)} fill="none" stroke={alpha(C.accent, 0.35)} strokeWidth={22} strokeLinecap="round" />
            {[-1, -0.5, 0, 0.5, 1].map((v) => {
              const a = polar(v, DIAL.r - 22);
              const b = polar(v, DIAL.r + 22);
              return <line key={v} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={alpha(C.text, v === 0 ? 0.8 : 0.4)} strokeWidth={v === 0 ? 4 : 3} />;
            })}
            {s.dial.ghost > 0 && (
              <line x1={DIAL.cx} y1={DIAL.cy} x2={ghostTip.x} y2={ghostTip.y} stroke={alpha(C.muted, 0.6)} strokeWidth={8} strokeLinecap="round" strokeDasharray="14 10" />
            )}
            <line x1={DIAL.cx} y1={DIAL.cy} x2={tip.x} y2={tip.y} stroke={s.dial.ghost > 0.5 ? C.accentText : C.text} strokeWidth={10} strokeLinecap="round" />
            <circle cx={DIAL.cx} cy={DIAL.cy} r={16} fill={C.text} />
          </svg>
          <div style={{ position: 'absolute', left: DIAL.cx - DIAL.r - 60, top: DIAL.cy - 18, fontSize: 30, fontWeight: 700, color: C.muted }}>−1</div>
          <div style={{ position: 'absolute', left: DIAL.cx + DIAL.r + 30, top: DIAL.cy - 18, fontSize: 30, fontWeight: 700, color: C.muted }}>+1</div>
          <div style={{ position: 'absolute', left: DIAL.cx, top: DIAL.cy - DIAL.r - 74, transform: 'translateX(-50%)', fontSize: 30, fontWeight: 700, color: C.muted, whiteSpace: 'nowrap' }}>
            players' centre vs ball
          </div>
          {/* Reading on screen, left. */}
          <div style={{ position: 'absolute', left: 0, top: DIAL.cy - 190, width: 230, textAlign: 'right', opacity: s.dial.screen }}>
            <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1, color: s.dial.ghost > 0.5 ? C.muted : C.text, fontVariantNumeric: 'tabular-nums' }}>{ON_SCREEN.text}</div>
            <div style={{ fontSize: 36, fontWeight: 700, color: C.muted, marginTop: 6 }}>on screen</div>
          </div>
          {/* Reading on the pitch, right. */}
          <div style={{ position: 'absolute', right: 0, top: DIAL.cy - 190, width: 230, opacity: s.dial.pitch }}>
            <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1, fontVariantNumeric: 'tabular-nums', ...gradientText }}>{ON_PITCH.text}</div>
            <div style={{ fontSize: 36, fontWeight: 700, color: C.accentText, marginTop: 6 }}>on the pitch</div>
          </div>
        </div>
      )}
    </div>
  );
};
