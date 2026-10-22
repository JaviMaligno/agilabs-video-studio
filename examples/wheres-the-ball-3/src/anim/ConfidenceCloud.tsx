import React from 'react';
import { C, GRADIENT, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { frameState, type CloudProps } from './ConfidenceCloud.state.ts';
import { BOX, VIEW_FULL, VIEW_MINI, type Box, type PlayData, type Pt } from './pitch.ts';
import { Arrow, Ball, Cloud, Marker, MissLine, PitchFrame, Players, Stamp, Tag, gradientText, toPx } from './pieces.tsx';
import { CREDIT } from './PitchPlayback.tsx';
import play from '../data/play.json';

export { frameState };
export type { CloudProps };

const DATA = play as unknown as PlayData;
type S = ReturnType<typeof frameState>;

/** The calibration staircase: five bins, most confident to least, error climbing. */
const Staircase: React.FC<{ s: S }> = ({ s }) => {
  const left = 120;
  const top = 560;
  const W = 860;
  const H = 520;
  const bw = 118;
  const gap = (W - 5 * bw) / 6;
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, opacity: s.axes }}>
      {/* corr tag, top right. */}
      <div style={{ position: 'absolute', right: 70, top: 440, display: 'flex', alignItems: 'baseline', gap: 18, opacity: s.corr, transform: `scale(${1.25 - 0.25 * s.corr})`, transformOrigin: '100% 50%' }}>
        <span style={{ fontSize: 76, fontWeight: 800, ...gradientText }}>corr +0.20</span>
        <span style={{ fontSize: 44, fontWeight: 700, color: C.muted, opacity: s.weak }}>weak</span>
      </div>
      <div style={{ position: 'absolute', left: 70, top: 452, fontSize: 38, fontWeight: 700, color: C.muted }}>actual error ↑</div>
      {/* Axis. */}
      <div style={{ position: 'absolute', left: left - 10, top: top + H, width: W + 10, height: 4, borderRadius: 2, background: alpha(C.muted, 0.6) }} />
      {s.steps.map((b, i) => {
        const h = (H - 150) * b.share * b.grow;
        const x = left + gap + i * (bw + gap);
        const r = 14 + 44 * b.cloud;
        return (
          <React.Fragment key={i}>
            <div
              style={{
                position: 'absolute',
                left: x,
                top: top + H - h,
                width: bw,
                height: h,
                borderRadius: '14px 14px 4px 4px',
                background: i === 4 ? GRADIENT : alpha(C.accentText, 0.35 + 0.12 * i),
                boxShadow: i === 4 ? `0 0 40px ${alpha(C.accent, 0.5)}` : 'none',
              }}
            />
            {/* The cloud it declares: wider for the less confident bins. */}
            <svg
              width={2 * r + 8}
              height={2 * r + 8}
              viewBox={`${-r - 4} ${-r - 4} ${2 * r + 8} ${2 * r + 8}`}
              style={{ position: 'absolute', left: x + bw / 2 - r - 4, top: top + H - h - 2 * r - 20, opacity: b.grow }}
            >
              <Cloud x={0} y={0} r={r} opacity={1} bright={0.4} seed={i} />
            </svg>
          </React.Fragment>
        );
      })}
      <div style={{ position: 'absolute', left, width: W, top: top + H + 22, display: 'flex', justifyContent: 'space-between', fontSize: 38, fontWeight: 700, color: C.text }}>
        <span>most confident</span>
        <span style={{ color: C.muted }}>→</span>
        <span>least confident</span>
      </div>
    </div>
  );
};

/** One stylised mini-pitch of the tangled / loose pair. */
const Mini: React.FC<{
  box: Box;
  label: string;
  side: S['left'] | S['right'];
  miss?: number;
  sure?: number;
}> = ({ box, label, side, miss = 0, sure = 0 }) => {
  const px = toPx(VIEW_MINI, box);
  const ball = side.ball;
  const m = side.marker;
  const c = side.cloud;
  const svg = (
    <>
      {side.players.map((q, i) => (
        <Arrow key={i} x0={q.x} y0={q.y} x1={q.x + q.vx * 0.75 * side.arrows} y1={q.y + q.vy * 0.75 * side.arrows} opacity={side.arrows * 0.85} w={0.32} />
      ))}
      <Players players={side.players} r={1.1} />
      <Cloud x={c.x} y={c.y} r={c.r} opacity={c.opacity} bright={c.bright} seed={3} />
      <MissLine from={m} to={ball} draw={miss} w={0.32} />
      <Ball x={ball.x} y={ball.y} opacity={ball.opacity} r={0.75} />
      <Marker x={m.x} y={m.y} opacity={m.opacity} r={1.25} />
    </>
  );
  const sureAt: Pt = px({ x: c.x, y: c.y + c.r + 1.4 });
  return (
    <div style={{ opacity: 0.35 + 0.65 * side.active }}>
      <PitchFrame
        box={box}
        view={VIEW_MINI}
        mini
        svg={svg}
        glow={side.active >= 1 ? 1 : 0}
        html={
          <>
            <div style={{ position: 'absolute', left: 16, top: 14 }}>
              <Tag text={label} opacity={1} accent size={38} />
            </div>
            {sure > 0 && (
              <div style={{ position: 'absolute', left: Math.min(box.w - 210, Math.max(10, sureAt.x - 100)), top: sureAt.y, opacity: sure }}>
                <Tag text="very sure" opacity={1} accent size={34} />
              </div>
            )}
          </>
        }
      />
    </div>
  );
};

/** The box's prediction as a cloud of guesses (see ConfidenceCloud.state.ts). */
export const ConfidenceCloud: React.FC<AnimProps & CloudProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur, DATA);
  const box = BOX.full;
  const px = toPx(VIEW_FULL, box);

  if (s.mode === 'calibration') return <div style={{ position: 'absolute', inset: 0, fontFamily, color: C.text }}><Staircase s={s} /></div>;

  if (s.minis) {
    const L = s.left;
    const R = s.right;
    const guessAt = toPx(VIEW_MINI, BOX.miniL)(L.ball);
    return (
      <div style={{ position: 'absolute', inset: 0, fontFamily, color: C.text }}>
        <Mini box={BOX.miniL} label="tangled" side={L} />
        <Mini box={BOX.miniR} label="loose" side={R} miss={R.miss} sure={R.sure} />
        {/* My guess, "hardest?", crossed out. */}
        {L.guess > 0 && (
          <div
            style={{
              position: 'absolute',
              left: BOX.miniL.left + guessAt.x - 150,
              top: BOX.miniL.top + guessAt.y + 70,
              width: 300,
              textAlign: 'center',
              opacity: L.guess,
            }}
          >
            <div style={{ display: 'inline-block', position: 'relative', padding: '10px 26px', borderRadius: 16, background: alpha(C.bg0, 0.92), border: `3px solid ${alpha(C.muted, 0.7)}`, fontSize: 48, fontWeight: 800, color: C.text }}>
              hardest?
              <div style={{ position: 'absolute', left: 12, top: '50%', height: 7, borderRadius: 4, width: `${(1 - 0) * L.cross * 92}%`, background: C.accentText }} />
            </div>
          </div>
        )}
        {R.more > 0 && (
          <div style={{ position: 'absolute', left: BOX.miniR.left, width: BOX.miniR.w, top: BOX.miniR.top + BOX.miniR.h + 20, display: 'flex', justifyContent: 'center' }}>
            <Tag text="≈ 20% more error" opacity={R.more} accent size={42} />
          </div>
        )}
        {s.gaugeOn > 0 && (
          <div style={{ position: 'absolute', left: 90, width: 900, top: 1100, opacity: s.gaugeOn, display: 'flex', flexDirection: 'column', gap: 26 }}>
            <div style={{ fontSize: 34, fontWeight: 700, color: C.muted }}>On loose balls:</div>
            {['error', 'confidence'].map((name, i) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                <div style={{ width: 340, fontSize: 46, fontWeight: 800, color: C.text, whiteSpace: 'nowrap' }}>
                  {name} <span style={{ color: C.accentText }}>↑</span>
                </div>
                <div style={{ flex: 1, height: 40, borderRadius: 12, background: C.card, border: `1px solid ${alpha('#ffffff', 0.08)}`, overflow: 'hidden' }}>
                  <div style={{ width: `${30 + 62 * s.gauges[i]}%`, height: '100%', borderRadius: 12, background: GRADIENT, boxShadow: `0 0 30px ${alpha(C.accent, 0.5)}` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Real play: hook and cloud.
  const c = s.cloud;
  const svg = (
    <>
      <Players players={s.players} />
      <Cloud x={c.x} y={c.y} r={c.r} opacity={c.opacity} bright={c.bright} />
      <Marker x={s.point.x} y={s.point.y} opacity={s.point.opacity} />
      <MissLine from={c} to={s.ball} draw={s.miss} />
      <Ball x={s.ball.x} y={s.ball.y} opacity={s.ball.opacity} glow={s.ball.glow} />
    </>
  );
  const tagAt = px({ x: c.x, y: c.y - c.r - 1.2 });
  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily, color: C.text }}>
      <PitchFrame
        box={box}
        view={VIEW_FULL}
        credit={CREDIT}
        svg={svg}
        html={
          s.sureTag > 0 ? (
            <div style={{ position: 'absolute', left: tagAt.x, top: tagAt.y, transform: 'translate(-50%, -100%)', opacity: s.sureTag }}>
              <Tag text="very sure" opacity={1} accent size={42} />
            </div>
          ) : null
        }
      />
      {s.stamp > 0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 290, display: 'flex', justifyContent: 'center' }}>
          <Stamp text="most sure · most wrong" pop={s.stamp} tone="accent" size={62} rotate={-4} />
        </div>
      )}
      {s.spreadTag > 0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: box.top + box.h + 18, display: 'flex', justifyContent: 'center' }}>
          <Tag text="one point → a spread of guesses" opacity={s.spreadTag} accent size={42} />
        </div>
      )}
    </div>
  );
};
