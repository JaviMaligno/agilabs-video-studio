import React from 'react';
import { C, GRADIENT, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { COURT_M, PITCH_M, frameState, type SportProps } from './SportScale.state.ts';
import { Bot, Cross, Markings, Tick } from './pitchParts.tsx';
import { gradientText, stageOf } from './Stage.tsx';

export { frameState };
export type { SportProps };

type Box = { x: number; y: number; w: number; h: number };
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const mix = (a: Box, b: Box, p: number): Box => ({ x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p), w: lerp(a.w, b.w, p), h: lerp(a.h, b.h, p) });

// Layout in stage pixels (vertical stage: 960 x 1090). True size: the court is 28/105 of the
// pitch's length (about a quarter), 15/68 of its width.
const PW = 860;
const TRUE_PITCH: Box = { x: 50, y: 24, w: PW, h: (PW * PITCH_M.h) / PITCH_M.w };
const TRUE_COURT: Box = { x: 50, y: 640, w: (PW * COURT_M.w) / PITCH_M.w, h: (PW * COURT_M.h) / PITCH_M.w };
// The same normalized box for both.
const NORM_PITCH: Box = { x: 50, y: 20, w: PW, h: 380 };
const NORM_COURT: Box = { x: 50, y: 470, w: PW, h: 380 };
const BOTTOM_Y = 880;

/** Basketball court markings in metres (28 x 15). */
const CourtMarkings: React.FC<{ sw: number }> = ({ sw }) => {
  const line = { fill: 'none', stroke: alpha(C.muted, 0.5), strokeWidth: sw } as const;
  return (
    <g>
      <rect x={0} y={0} width={28} height={15} fill={alpha(C.card, 0.6)} />
      <rect x={0} y={0} width={28} height={15} {...line} />
      <line x1={14} y1={0} x2={14} y2={15} {...line} />
      <circle cx={14} cy={7.5} r={1.8} {...line} />
      {[0, 28].map((gx) => {
        const dir = gx === 0 ? 1 : -1;
        return (
          <g key={gx}>
            <rect x={gx === 0 ? 0 : 28 - 5.8} y={7.5 - 2.45} width={5.8} height={4.9} {...line} />
            <path d={`M${gx} ${7.5 - 6.6} L${gx + dir * 2.99} ${7.5 - 6.6} A6.75 6.75 0 0 ${gx === 0 ? 1 : 0} ${gx + dir * 2.99} ${7.5 + 6.6} L${gx} ${7.5 + 6.6}`} {...line} />
            <circle cx={gx + dir * 1.575} cy={7.5} r={0.23} fill={alpha(C.text, 0.7)} />
          </g>
        );
      })}
    </g>
  );
};

const Arrow: React.FC<{ x0: number; y0: number; x1: number; y1: number; w: number; color: string; opacity: number }> = ({ x0, y0, x1, y1, w, color, opacity }) => {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.hypot(dx, dy);
  if (len < 4 || opacity <= 0) return null;
  const ux = dx / len;
  const uy = dy / len;
  const hl = Math.min(w * 3.2, len * 0.5);
  const bx = x1 - ux * hl;
  const by = y1 - uy * hl;
  const hw = w * 1.8;
  return (
    <g opacity={opacity}>
      <line x1={x0} y1={y0} x2={bx} y2={by} stroke={color} strokeWidth={w} strokeLinecap="round" />
      <polygon points={`${x1},${y1} ${bx - uy * hw},${by + ux * hw} ${bx + uy * hw},${by - ux * hw}`} fill={color} />
    </g>
  );
};

const TransferCard: React.FC<{ y: number; ok: boolean; title: string; sub: string; opacity: number; enter: number }> = ({ y, ok, title, sub, opacity, enter }) =>
  opacity > 0 ? (
    <div
      style={{
        position: 'absolute',
        left: 320,
        top: y,
        width: 590,
        padding: '16px 24px',
        borderRadius: 20,
        background: ok ? alpha(C.accent, 0.16) : alpha(C.card, 0.85),
        border: ok ? `3px solid ${alpha(C.accentText, 0.75)}` : `3px dashed ${alpha(C.muted, 0.6)}`,
        opacity,
        transform: `translateX(${(1 - enter) * 40}px)`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 40, fontWeight: 800, color: ok ? C.text : C.muted }}>
        <span style={{ whiteSpace: 'nowrap' }}>{title}</span>
        {ok ? (
          <div style={{ width: 52, height: 52, borderRadius: 26, background: GRADIENT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Tick size={36} color={C.text} stroke={3.8} />
          </div>
        ) : (
          <div style={{ width: 52, height: 52, borderRadius: 26, border: `3px solid ${C.muted}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Cross size={30} />
          </div>
        )}
      </div>
      <div style={{ fontSize: 32, fontWeight: 600, color: C.muted, marginTop: 4 }}>{sub}</div>
    </div>
  ) : null;

export const SportScale: React.FC<AnimProps & SportProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const S = stageOf(p.vertical);
  const W = S.w;
  const pb = mix(TRUE_PITCH, NORM_PITCH, s.morph);
  const cb = mix(TRUE_COURT, NORM_COURT, s.morph);

  const field = (b: Box, kind: 'pitch' | 'court', opacity: number) => {
    const m = kind === 'pitch' ? PITCH_M : COURT_M;
    return (
      <div
        style={{
          position: 'absolute',
          left: b.x,
          top: b.y,
          width: b.w,
          height: b.h,
          opacity,
          borderRadius: 14,
          overflow: 'hidden',
          background: C.bg1,
          boxShadow: `0 0 0 2px ${alpha(C.muted, 0.22)}`,
        }}
      >
        <svg width={b.w} height={b.h} viewBox={`0 0 ${m.w} ${m.h}`} preserveAspectRatio="none" style={{ position: 'absolute', inset: 0 }}>
          {kind === 'pitch' ? <Markings sw={0.32} opacity={0.8} /> : <CourtMarkings sw={0.12} />}
        </svg>
        <svg width={b.w} height={b.h} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          {s.runners.map((r, i) => {
            const x = r.u * b.w;
            const y = r.v * b.h;
            const a = kind === 'pitch' ? r.pitch : r.court;
            const dotR = Math.max(5, Math.min(13, b.w / 60));
            return (
              <g key={i}>
                <Arrow x0={x} y0={y} x1={x + a.du * b.w} y1={y + a.dv * b.h} w={6} color={kind === 'court' ? C.accentText : C.text} opacity={s.arrows.opacity} />
                <circle cx={x} cy={y} r={dotR} fill={i % 2 ? C.text : C.accentText} stroke={C.bg0} strokeWidth={2} />
              </g>
            );
          })}
        </svg>
        <div
          style={{
            position: 'absolute',
            left: 14,
            top: 10,
            padding: '2px 14px',
            borderRadius: 10,
            background: alpha(C.bg0, 0.85),
            fontSize: kind === 'court' ? lerp(26, 36, s.morph) : 36,
            fontWeight: 800,
            whiteSpace: 'nowrap',
            opacity: kind === 'court' ? s.morph : 1,
          }}
        >
          {kind === 'pitch' ? 'Football' : 'Basketball'}
        </div>
      </div>
    );
  };

  return (
    <div style={{ position: 'absolute', left: S.side, top: S.top, width: W, height: S.h, fontFamily, color: C.text }}>
      {field(pb, 'pitch', s.pitch.opacity)}
      {field(cb, 'court', s.court.opacity)}

      {/* True size: the court's label under it, the shared net beside it. */}
      {s.morph < 1 && (
        <div style={{ position: 'absolute', left: TRUE_COURT.x, top: TRUE_COURT.y + TRUE_COURT.h + 14, opacity: s.court.opacity * Math.max(0, 1 - 3 * s.morph) }}>
          <div style={{ fontSize: 40, fontWeight: 800 }}>Basketball</div>
          <div style={{ fontSize: 30, fontWeight: 600, color: C.muted }}>NBA tracking</div>
        </div>
      )}
      {s.netChip.opacity > 0 && (
        <div
          style={{
            position: 'absolute',
            left: 340,
            top: TRUE_COURT.y + 20,
            opacity: s.netChip.opacity,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '14px 28px',
            borderRadius: 999,
            background: GRADIENT,
            fontSize: 42,
            fontWeight: 800,
            boxShadow: `0 0 40px ${alpha(C.accent, 0.6)}`,
            whiteSpace: 'nowrap',
          }}
        >
          <Bot colour="teal" size={64} style={{ margin: '-14px 0 -14px -12px' }} />
          same 60 kB net
        </div>
      )}

      <TransferCard y={600} ok title="Basketball → Football" sub="never saw a football match" opacity={s.works.opacity} enter={s.works.enter} />
      <TransferCard y={760} ok={false} title="Football → Basketball" sub="worse than an untrained centroid" opacity={s.fails.opacity} enter={s.fails.enter} />

      {s.sameBox.opacity > 0 && (
        <div style={{ position: 'absolute', left: 0, top: NORM_PITCH.y + NORM_PITCH.h + 14, width: W, textAlign: 'center', opacity: s.sameBox.opacity, fontSize: 32, fontWeight: 700, color: C.muted }}>
          same box, different speed scale
        </div>
      )}

      {/* The speed gap. */}
      {s.times.opacity > 0 && (
        <div style={{ position: 'absolute', left: 0, top: BOTTOM_Y, width: W, height: S.h - BOTTOM_Y, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 28, opacity: s.times.opacity }}>
          <span style={{ fontSize: 130, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.03em', ...gradientText }}>3–4×</span>
          <span style={{ fontSize: 40, fontWeight: 700, lineHeight: 1.2 }}>
            faster on the court,
            <br />
            <span style={{ color: C.muted }}>in the model's units</span>
          </span>
        </div>
      )}

      {/* Positions only, with the article's softened wording. */}
      {s.positions.opacity > 0 && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: BOTTOM_Y,
            width: W,
            height: S.h - BOTTOM_Y,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
          }}
        >
          <div style={{ opacity: s.positions.opacity, transform: `scale(${1.15 - 0.15 * s.positions.opacity})`, display: 'flex', alignItems: 'center', gap: 18, fontSize: 54, fontWeight: 800 }}>
            <span style={gradientText}>Positions only:</span> both ways
            <div style={{ width: 54, height: 54, borderRadius: 27, background: GRADIENT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Tick size={38} color={C.text} stroke={3.8} />
            </div>
          </div>
          <div style={{ opacity: s.caveat.opacity, maxWidth: W, textAlign: 'center', fontSize: 34, fontWeight: 600, lineHeight: 1.3, color: C.muted, textWrap: 'balance' }}>
            The gap roughly halves; against each sport's own error, it vanishes.
          </div>
        </div>
      )}
    </div>
  );
};
