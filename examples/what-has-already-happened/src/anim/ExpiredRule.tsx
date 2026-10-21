import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, GRADIENT, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { Lock } from './pieces.tsx';
import { BARS, LANE, frameState, type ExpiredRuleProps } from './ExpiredRule.state.ts';

export { frameState };
export type { ExpiredRuleProps };

const SLOT = { x0: 60, step: 192, w: 172, top: 1010, h: 96 } as const;
const TRACK = { x: 80, w: 700 } as const;

export const ExpiredRule: React.FC<AnimProps & ExpiredRuleProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  return (
    <AbsoluteFill style={{ fontFamily, color: C.text }}>
      <div style={{ position: 'absolute', inset: 0, opacity: s.scene.opacity }}>
        {/* the rule and its hanging precondition */}
        <div style={{ position: 'absolute', left: 80, top: 420, width: 920, height: 106, borderRadius: 18, background: C.card, border: `3px solid ${alpha(C.muted, 0.5)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, fontWeight: 800, opacity: s.rule, transform: `translateY(${(1 - s.rule) * -30}px)` }}>
          <div style={{ position: 'absolute', left: 22, top: 22, width: 22, height: 22, borderRadius: 11, background: C.marker }} />
          intro last: it must match the rest
        </div>
        <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, opacity: s.pre.opacity }}>
          <line x1={540} y1={526} x2={540} y2={584} stroke={alpha(C.muted, 0.8)} strokeWidth={4} strokeDasharray="6 6" />
        </svg>
        <div style={{ position: 'absolute', left: 170, top: 584, width: 740, height: 80, borderRadius: 14, border: `3px dashed ${alpha(C.muted, 0.7)}`, background: alpha(C.bg1, 0.95), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38, fontWeight: 700, fontStyle: 'italic', color: alpha(C.text, 1 - 0.55 * s.pre.grey), opacity: s.pre.opacity, transform: `rotate(${2 * s.pre.opacity}deg)` }}>
          …while the rest can still change
          <div style={{ position: 'absolute', left: 60, top: 38, height: 5, width: 620 * s.pre.grey, background: alpha(C.muted, 0.9) }} />
        </div>
        {s.pre.stamp > 0 && (
          <div style={{ position: 'absolute', left: 640, top: 600, padding: '4px 18px', border: `7px solid ${C.marker}`, borderRadius: 14, color: C.marker, background: alpha(C.bg0, 0.9), fontSize: 58, fontWeight: 800, letterSpacing: '0.08em', opacity: Math.min(1, s.pre.stamp * 1.4), transform: `rotate(-9deg) scale(${1.9 - 0.9 * s.pre.stamp})` }}>
            EXPIRED
          </div>
        )}

        {/* calendar and the frozen scripts */}
        <div style={{ position: 'absolute', left: 90, top: 726, width: 250, height: 210, perspective: 700, opacity: s.calendar.opacity }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: 16, background: C.text, overflow: 'hidden', transformOrigin: 'top center', transform: `rotateX(${Math.sin(Math.PI * s.calendar.flip) * 80}deg)` }}>
            <div style={{ height: 50, background: C.marker, color: C.text, fontSize: 30, fontWeight: 800, textAlign: 'center', lineHeight: '50px', letterSpacing: '0.1em' }}>2026</div>
            <div style={{ textAlign: 'center', fontSize: 72, fontWeight: 800, color: C.bg0, lineHeight: '150px' }}>{s.calendar.month}</div>
          </div>
        </div>
        <div style={{ position: 'absolute', left: 420, top: 732, width: 560, height: 200, opacity: s.calendar.opacity }}>
          {[2, 1, 0].map((k) => (
            <div key={k} style={{ position: 'absolute', left: 20 * k, top: 14 * k, width: 480, height: 150, borderRadius: 14, background: k === 0 ? C.card : alpha(C.card, 0.7), border: `3px solid ${alpha(C.muted, 0.45)}` }} />
          ))}
          <div style={{ position: 'absolute', left: 34, top: 26, fontSize: 46, fontWeight: 800 }}>scripts</div>
          <div style={{ position: 'absolute', left: 34, top: 90, fontSize: 34, fontWeight: 800, color: C.ok, opacity: s.lock.pop }}>frozen since July</div>
          <div style={{ position: 'absolute', left: 380, top: 18, opacity: Math.min(1, s.lock.pop * 1.5), transform: `translateY(${(1 - s.lock.pop) * -60}px) scale(${1.4 - 0.4 * s.lock.pop})` }}>
            <Lock size={92} color={C.ok} />
          </div>
        </div>

        {/* the plan's lane: the intro goes to the end and stays there */}
        <div style={{ position: 'absolute', left: 64, top: SLOT.top - 44, fontSize: 26, fontWeight: 800, letterSpacing: '0.16em', color: C.muted }}>THE PLAN</div>
        {LANE.map((label, i) => {
          const l = s.lane[i];
          const intro = i === 0;
          return (
            <div
              key={label}
              style={{
                position: 'absolute',
                left: SLOT.x0 + l.slot * SLOT.step,
                top: SLOT.top - (intro ? 30 * Math.sin(Math.PI * Math.min(1, l.slot / 4)) : 0),
                width: SLOT.w,
                height: SLOT.h,
                borderRadius: 14,
                background: C.card,
                border: `4px solid ${intro && l.slot > 0.05 ? C.marker : alpha(C.muted, 0.5)}`,
                boxShadow: intro ? `0 0 ${40 * s.introStays}px ${alpha(C.marker, 0.9 * s.introStays)}` : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 32,
                fontWeight: 800,
                opacity: l.opacity,
                boxSizing: 'border-box',
                zIndex: intro ? 2 : 1,
              }}
            >
              {label}
            </div>
          );
        })}
      </div>

      {/* the bars: a better model defers it more, not less */}
      {s.bars.opacity > 0 && (
        <div style={{ position: 'absolute', inset: 0, opacity: s.bars.opacity }}>
          <div style={{ position: 'absolute', left: 80, right: 60, top: 420, fontSize: 36, fontWeight: 700, color: C.muted }}>
            defers it <span style={{ color: C.text, fontStyle: 'italic' }}>“because it depends on the rest”</span>
          </div>
          {['course', 'release'].map((g, gi) => (
            <div key={g} style={{ position: 'absolute', left: 80, top: 520 + gi * 340, fontSize: 30, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.accentText }}>
              {g}
            </div>
          ))}
          {BARS.map((b, i) => {
            const gi = b.group === 'course' ? 0 : 1;
            const top = 570 + gi * 340 + (b.opus ? 130 : 0);
            const grow = s.bars.grow[i];
            return (
              <div key={i} style={{ position: 'absolute', left: 0, top, width: 1080, height: 120 }}>
                <div style={{ position: 'absolute', left: TRACK.x, top: 0, fontSize: 34, fontWeight: 800, color: b.opus ? C.text : C.muted }}>{b.label}</div>
                <div style={{ position: 'absolute', left: TRACK.x, top: 52, width: TRACK.w, height: 50, borderRadius: 25, background: alpha(C.muted, 0.14) }} />
                <div style={{ position: 'absolute', left: TRACK.x, top: 52, width: (TRACK.w * b.value * grow) / 100, height: 50, borderRadius: 25, background: b.opus ? GRADIENT : alpha(C.muted, 0.55) }} />
                <div style={{ position: 'absolute', left: TRACK.x + TRACK.w + 24, top: 40, fontSize: 60, fontWeight: 800, color: b.opus ? C.text : C.muted, opacity: grow }}>{`${b.value}%`}</div>
              </div>
            );
          })}
        </div>
      )}
    </AbsoluteFill>
  );
};
