import React from 'react';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { GAMES, frameState, type QuestionCardProps } from './QuestionCard.state.ts';
import { DepthWell } from './DepthWell.tsx';

export { frameState };
export type { QuestionCardProps };

const TONE = { ok: C.ok, rose: C.roseText } as const;

/** "Passed the check → good enough to plan with?", over the dimmed shaft, with a stamp slot. */
export const QuestionCard: React.FC<AnimProps & QuestionCardProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const st = s.stamp;
  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily, color: C.text }}>
      {/* The shaft behind, dimmed: the check that was passed (or, at the verdict, where it fails). */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.16 }}>
        <DepthWell {...p} mode="still" of={p.mode === 'verdict' ? 'mechanism' : 'gate'} chip={undefined} />
      </div>

      <div
        style={{
          position: 'absolute',
          left: 60,
          width: 960,
          top: 300,
          height: 560,
          borderRadius: 32,
          background: alpha(C.card, 0.97),
          border: `3px solid ${alpha(C.accentText, 0.55)}`,
          boxShadow: `0 20px 60px ${alpha(C.bg0, 0.7)}`,
          opacity: s.card,
          transform: `translateY(${(1 - s.card) * 40}px)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 54,
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            opacity: s.passed,
            transform: `scale(${0.85 + 0.15 * s.passed})`,
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            padding: '12px 34px',
            borderRadius: 999,
            border: `4px solid ${C.ok}`,
            color: C.ok,
            fontSize: 60,
            fontWeight: 800,
          }}
        >
          ✓ Passed the check
        </div>
        <div style={{ fontSize: 80, fontWeight: 800, color: C.accentText, lineHeight: 1, marginTop: 22, opacity: s.question }}>↓</div>
        <div
          style={{
            marginTop: 18,
            fontSize: 82,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            lineHeight: 1.08,
            textAlign: 'center',
            opacity: s.question,
            transform: `translateY(${(1 - s.question) * 20}px)`,
          }}
        >
          good enough
          <br />
          to plan with<span style={{ color: C.accentText, display: 'inline-block', transform: `scale(${1 + 0.12 * s.pulse})` }}>?</span>
        </div>
      </div>

      {/* The answer. */}
      {st.opacity > 0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 820, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: st.opacity }}>
          <div
            style={{
              padding: '10px 34px',
              border: `8px solid ${TONE[st.tone]}`,
              borderRadius: 20,
              color: TONE[st.tone],
              background: alpha(C.bg0, 0.94),
              fontSize: st.text.length > 4 ? 92 : 112,
              fontWeight: 800,
              letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
              lineHeight: 1.05,
              transform: `rotate(-6deg) scale(${1.8 - 0.8 * st.pop})`,
              boxShadow: `0 0 50px ${alpha(TONE[st.tone], 0.3)}`,
            }}
          >
            {st.text}
          </div>
          <div style={{ marginTop: 30, fontSize: 44, fontWeight: 700, color: C.text, opacity: st.pop }}>{st.sub}</div>
        </div>
      )}

      {/* The small, fully specified games: the check was enough there. */}
      {p.mode === 'yes' && (
        <div style={{ position: 'absolute', left: 140, width: 800, top: 1085, display: 'flex', justifyContent: 'space-between' }}>
          {GAMES.map((g, i) => (
            <div
              key={g}
              style={{
                width: 256,
                height: 150,
                borderRadius: 20,
                background: alpha(C.card, 0.96),
                border: `3px solid ${alpha(C.ok, 0.55)}`,
                opacity: s.chips[i],
                transform: `translateY(${(1 - s.chips[i]) * 30}px)`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxSizing: 'border-box',
              }}
            >
              <div style={{ fontSize: 40, fontWeight: 800 }}>{g}</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: C.ok }}>no gap ✓</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
