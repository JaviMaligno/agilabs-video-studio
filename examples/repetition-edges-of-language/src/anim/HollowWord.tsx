import React from 'react';
import { C, alpha } from '../brand.ts';
import { Stage, gradientText } from './Stage.tsx';
import type { AnimProps } from './types.ts';
import { frameState, type HollowWordProps } from './HollowWord.state.ts';

export const HollowWord: React.FC<AnimProps & HollowWordProps> = ({ t, beats, dur, vertical, ...p }) => {
  const s = frameState(p, t, beats, dur);
  const word = p.word ?? 'table';
  return (
    <Stage vertical={vertical} fill style={{ overflow: 'hidden' }}>
      {s.copies.map((c, i) =>
        c.opacity <= 0.001 ? null : (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: c.y,
              transform: 'translateY(-50%)',
              textAlign: 'center',
              fontSize: c.size,
              fontWeight: 800,
              letterSpacing: `${c.spacing}em`,
              lineHeight: 1,
              color: alpha(C.text, c.fill),
              WebkitTextStroke: `${2.5 + 1.5 * (1 - c.fill)}px ${alpha(C.text, 0.35 + 0.6 * (1 - c.fill) * (1 - c.blur / 10))}`,
              filter: c.blur > 0.05 ? `blur(${c.blur}px)` : undefined,
              opacity: c.opacity * (1 - (0.45 * c.blur) / 8),
            }}
          >
            {word}
          </div>
        ),
      )}
      {/* The counter, top right of the stage. */}
      <div style={{ position: 'absolute', top: 10, right: 6, display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontSize: 96, fontWeight: 800, lineHeight: 1, ...gradientText }}>×{s.counter}</span>
      </div>
    </Stage>
  );
};
