import React from 'react';
import { C, GRADIENT, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import { METER_MAX, type MeterState } from './motion.ts';

/** Meter bar width and where its ticks sit. */
const BAR_W = 800;
const tickX = (v: number) => (v / METER_MAX) * BAR_W;

/** Colour of the value: indigo when near free, rose past one half (exploited), white in between. */
const valueColor = (needle: number) => (needle * METER_MAX >= 0.6 ? C.roseText : needle * METER_MAX <= 0.06 ? C.accentText : C.text);

/**
 * The cost meter HUD at the top of the stage: the value as the article writes it, a bar with
 * ticks `0 · free` and `1 · random`, and a needle allowed past 1.
 */
export const MeterHud: React.FC<{ s: MeterState; top: number; centerX?: number }> = ({ s, top, centerX = 540 }) => {
  if (s.opacity <= 0) return null;
  const left = centerX - BAR_W / 2;
  const color = valueColor(s.needle);
  const nx = s.needle * BAR_W;
  return (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        width: BAR_W,
        height: 190,
        fontFamily,
        opacity: s.opacity,
        transform: `translateY(${(s.drop - 1) * 60}px)`,
      }}
    >
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 104, display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 26 }}>
        <span style={{ fontSize: 40, fontWeight: 600, color: C.muted, letterSpacing: '0.02em' }}>cost</span>
        <span style={{ position: 'relative', fontSize: 100, fontWeight: 800, lineHeight: 1, color, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', minWidth: 280 }}>
          {s.rolling ? (
            <>
              <span style={{ position: 'absolute', left: 0, top: 0, opacity: s.old }}>{s.oldText}</span>
              {s.digits.map((dg, i) => (
                <span
                  key={i}
                  style={{
                    display: 'inline-block',
                    opacity: dg.appear,
                    transform: `translateY(${(1 - dg.appear) * -46}px)`,
                    filter: dg.appear < 1 ? `blur(${(1 - dg.appear) * 6}px)` : undefined,
                  }}
                >
                  {dg.ch}
                </span>
              ))}
            </>
          ) : (
            s.text
          )}
        </span>
      </div>
      {/* Bar */}
      <div style={{ position: 'absolute', left: 0, top: 124, width: BAR_W, height: 14, borderRadius: 7, background: alpha(C.muted, 0.22) }} />
      <div style={{ position: 'absolute', left: 0, top: 124, width: Math.max(14, nx), height: 14, borderRadius: 7, background: s.needle * METER_MAX > 0.6 ? `linear-gradient(90deg, ${C.accent}, ${C.rose})` : GRADIENT }} />
      {[0, 1].map((v) => (
        <div key={v} style={{ position: 'absolute', left: tickX(v) - 2, top: 112, width: 4, height: 38, borderRadius: 2, background: alpha(C.text, 0.7) }} />
      ))}
      {/* Needle */}
      <div style={{ position: 'absolute', left: nx - 13, top: 117, width: 26, height: 28, borderRadius: 14, background: C.text, boxShadow: `0 0 18px ${alpha(color, 0.9)}` }} />
      <div style={{ position: 'absolute', left: tickX(0) - 6, top: 152, fontSize: 32, fontWeight: 600, color: C.muted, whiteSpace: 'nowrap' }}>0 · free</div>
      <div style={{ position: 'absolute', left: tickX(1) - 110, width: 220, textAlign: 'center', top: 152, fontSize: 32, fontWeight: 600, color: C.muted, whiteSpace: 'nowrap' }}>
        1 · random
      </div>
    </div>
  );
};

/** The corner chip naming the model on screen. */
export const ModelChip: React.FC<{ text: string; top: number; opacity: number; slide: number }> = ({ text, top, opacity, slide }) => {
  if (opacity <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top, display: 'flex', justifyContent: 'center', opacity: opacity * (1 - slide), transform: `translateX(${slide * 400}px)` }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          padding: '14px 30px',
          borderRadius: 999,
          background: alpha(C.card, 0.92),
          border: `2px solid ${alpha(text === 'truth' ? C.muted : C.roseText, 0.5)}`,
          fontFamily,
          fontSize: 42,
          fontWeight: 700,
          color: C.text,
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ width: 18, height: 18, borderRadius: 9, background: text === 'truth' ? C.text : C.rose, display: 'inline-block' }} />
        {text}
      </div>
    </div>
  );
};
