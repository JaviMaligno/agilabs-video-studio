import React from 'react';
import { C, GRADIENT, alpha } from '../brand.ts';
import type { AnimProps } from './types.ts';
import { frameState, PROBE, type ProbeProps } from './TerminalProbe.state.ts';
import { Stage, gradientText } from './Stage.tsx';

export { frameState };
export type { ProbeProps };

const typed = (s: string, p: number) => s.slice(0, Math.round(s.length * p));

export const TerminalProbe: React.FC<AnimProps & ProbeProps> = ({ t, beats, dur, vertical, ...props }) => {
  const s = frameState(props, t, beats, dur);
  const lineStyle: React.CSSProperties = { fontSize: 46, fontWeight: 700, whiteSpace: 'pre', height: 64, display: 'flex', alignItems: 'center' };
  return (
    <Stage vertical={vertical} fill>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 120,
          width: 960,
          height: 560,
          borderRadius: 32,
          background: C.card,
          border: `2px solid ${alpha(C.accentText, 0.45)}`,
          boxShadow: `0 30px 80px ${alpha('#000000', 0.5)}`,
          opacity: s.card.appear,
          transform: `scale(${0.7 + 0.3 * s.card.appear})`,
          transformOrigin: 'center top',
          overflow: 'hidden',
        }}
      >
        <div style={{ height: 64, background: alpha(C.bg0, 0.6), display: 'flex', alignItems: 'center', gap: 14, padding: '0 26px' }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ width: 20, height: 20, borderRadius: 10, background: alpha(C.muted, 0.5) }} />
          ))}
          <div style={{ marginLeft: 20, fontSize: 28, fontWeight: 600, color: C.muted }}>terminal</div>
        </div>
        <div style={{ padding: '30px 44px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={lineStyle}>{typed(PROBE.cmd1, s.cmd1)}</div>
          <div style={lineStyle}>{typed(PROBE.cmd2, s.cmd2)}</div>
          <div style={{ position: 'relative', height: 200, marginTop: 20 }}>
            {/* The model's guess, ghost-typed. */}
            <div style={{ position: 'absolute', left: 0, top: 0, opacity: s.guess.appear * (1 - 0.6 * s.real.appear) }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: C.accentText, marginBottom: 6 }}>model's guess</div>
              <div style={{ ...lineStyle, color: alpha(C.accentText, 0.85), fontStyle: 'italic' }}>{typed(PROBE.out, s.guess.typed)}</div>
            </div>
            {/* The real output lands on it. */}
            <div style={{ position: 'absolute', left: 0, top: 94 + (1 - s.real.appear) * -40, opacity: s.real.appear }}>
              <div style={{ ...lineStyle }}>{PROBE.out}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: C.muted }}>real output</div>
            </div>
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 60,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                opacity: s.tick.appear,
                transform: `scale(${0.6 + 0.4 * s.tick.appear})`,
              }}
            >
              <span style={{ fontSize: 40, fontWeight: 800 }}>match</span>
              <span style={{ width: 84, height: 84, borderRadius: 42, background: GRADIENT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52, fontWeight: 900 }}>✓</span>
            </div>
          </div>
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 760,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 18,
          opacity: s.label.appear,
          transform: `scale(${1.25 - 0.25 * s.label.appear})`,
        }}
      >
        <div style={{ fontSize: 104, fontWeight: 900, letterSpacing: '0.02em', ...gradientText }}>WORLD MODEL</div>
        <div style={{ fontSize: 42, fontWeight: 600, color: C.muted, textAlign: 'center' }}>predicts what the environment returns</div>
      </div>
    </Stage>
  );
};
