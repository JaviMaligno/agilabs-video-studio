import React from 'react';
import { C, GRADIENT, alpha } from '../brand.ts';
import type { AnimProps } from './types.ts';
import { frameState, type ContrastQuoteProps } from './ContrastQuote.state.ts';
import { Stage, gradientText } from './Stage.tsx';
import { MaskLine, ProbeCard } from './HiddenInstruction.tsx';
import { greyOf } from './perception.ts';
import { SETTINGS } from '../settings.ts';
import { HookBats } from './Halloween.tsx';

export { frameState };
export type { ContrastQuoteProps };

const LAYERS = ['least significant bit', 'alpha channel'];

export const ContrastQuote: React.FC<AnimProps & ContrastQuoteProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const g = greyOf(s.ratio);
  const steg = p.mode === 'steg';
  return (
    <Stage vertical={p.vertical} fill>
      {steg &&
        LAYERS.map((name, k) => (
          <div
            key={name}
            style={{
              position: 'absolute',
              left: 30,
              top: 40 + k * 170,
              width: 900,
              height: 290,
              transform: `translateX(${(1 - s.layers) * -700}px) scale(0.9)`,
              borderRadius: 16,
              overflow: 'hidden',
              background: C.card,
              border: `2px solid ${alpha(C.muted, 0.4)}`,
              opacity: s.layers * s.layers * 0.8,
              filter: 'grayscale(1)',
            }}
          >
            <MaskLine mask="hidden" top={68} fill={C.muted} />
            <div style={{ position: 'absolute', left: 20, top: 16, fontSize: 28, fontWeight: 700, color: C.muted }}>{name}</div>
          </div>
        ))}
      {!steg && <ProbeCard y={40} hiddenGrey={g} style={{ opacity: s.card, transform: `translateY(${(1 - s.card) * 40}px)` }} />}
      {!steg && (
        <div style={{ position: 'absolute', left: 30, width: 900, top: 350, display: 'flex', justifyContent: 'flex-end', opacity: s.card }}>
          <div style={{ fontSize: 30, fontWeight: 700, color: C.muted }}>
            the hidden spell, <span style={{ color: C.accentText }}>{s.breath > 0.12 ? 'showing itself' : 'invisible'}</span>
          </div>
        </div>
      )}
      <div
        style={{
          position: 'absolute',
          left: 30,
          width: 900,
          top: steg ? 600 : 560,
          fontSize: steg ? 76 : 104,
          fontWeight: 800,
          lineHeight: 1.15,
          letterSpacing: '-0.02em',
        }}
      >
        {s.words.map((w, i) => {
          const emph = !steg && w.startsWith('contrast');
          return (
            <React.Fragment key={i}>
              {i > 0 ? ' ' : null}
              <span
                style={{
                  display: 'inline-block',
                  position: 'relative',
                  opacity: s.shown[i] * (steg && i > 2 ? 1 - 0.45 * s.strike : 1),
                  transform: `translateY(${(1 - s.shown[i]) * 18}px)`,
                  color: steg && i > 2 ? C.muted : C.text,
                  ...(emph && s.emphasis > 0 ? gradientText : {}),
                }}
              >
                {w}
                {emph && (
                  <span style={{ position: 'absolute', left: 0, bottom: -4, height: 10, borderRadius: 5, width: `${s.emphasis * 100}%`, background: GRADIENT }} />
                )}
              </span>
            </React.Fragment>
          );
        })}
      </div>
      {/* Halloween: the hook's bats come back across the gap under the card, as a bookend. */}
      {SETTINGS.halloween && !steg && (
        <HookBats
          t={p.t}
          flock={[
            { t0: 0.6, y: 430, size: 96 },
            { t0: 1.0, y: 500, size: 76 },
            { t0: 1.3, y: 455, size: 64 },
          ]}
        />
      )}
    </Stage>
  );
};
