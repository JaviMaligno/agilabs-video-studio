import React from 'react';
import { C, GRADIENT, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { Stage, gradientText } from './Stage.tsx';
import { frameState, type CostCardProps } from './CostCard.state.ts';
import { ModelChip } from './pieces.tsx';

export { frameState };
export type { CostCardProps };

const ROW_Y = [430, 600, 770];
const TRACK = { x: 296, w: 446, h: 56 };
const mono = 'ui-monospace, SFMono-Regular, Menlo, monospace';

/** Cost per run of the three models; Sonnet's bar lights up and gets the "trade-off" tag. */
export const CostCard: React.FC<AnimProps & CostCardProps> = ({ t, beats, dur, vertical, ...props }) => {
  const s = frameState(props, t, beats, dur);
  return (
    <Stage vertical={vertical} fill>
      {/* The note that made the difference, carried over from the no-docs scene. */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 128, display: 'flex', justifyContent: 'center', opacity: s.note, transform: `translateY(${-12 * (1 - s.note)}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 26px', borderRadius: 18, border: `2px solid ${alpha(C.accentText, 0.7)}`, fontFamily, fontSize: 32, fontWeight: 600, color: C.muted }}>
          with the
          <span style={{ fontFamily: mono, fontWeight: 700, color: C.text }}>TOOLS.md</span>
          note
        </div>
      </div>
      {/* The card. */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 250,
          width: 960,
          height: 640,
          borderRadius: 32,
          background: C.card,
          border: `1px solid ${alpha('#ffffff', 0.08)}`,
          boxShadow: `0 24px 60px ${alpha(C.bg0, 0.6)}`,
          opacity: s.card,
          transform: `scale(${0.96 + 0.04 * s.card})`,
        }}
      >
        <div style={{ position: 'absolute', left: 0, right: 0, top: 44, textAlign: 'center', fontFamily, fontSize: 30, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.muted }}>
          cost per run
        </div>
      </div>
      {/* Sonnet's row, ringed once it is picked. */}
      {s.pick > 0 && (
        <div
          style={{
            position: 'absolute',
            left: 22,
            top: ROW_Y[1] - 68,
            width: 916,
            height: 136,
            borderRadius: 26,
            border: `3px solid ${alpha(C.accentText, 0.9)}`,
            background: alpha(C.accent, 0.1),
            boxShadow: `0 0 40px ${alpha(C.accent, 0.35)}`,
            opacity: s.pick,
            transform: `scale(${1.04 - 0.04 * s.pick})`,
          }}
        />
      )}
      {s.rows.map((r, i) => {
        const y = ROW_Y[i];
        const op = r.appear * (1 - 0.55 * r.dim);
        return (
          <React.Fragment key={r.name}>
            <div style={{ position: 'absolute', left: 0, top: 0, width: 960, height: 1090, opacity: op }}>
              {/* Track and bar. */}
              <div style={{ position: 'absolute', left: TRACK.x, top: y - TRACK.h / 2, width: TRACK.w, height: TRACK.h, borderRadius: TRACK.h / 3.5, background: C.bg1, border: `1px solid ${alpha('#ffffff', 0.07)}` }} />
              <div style={{ position: 'absolute', left: TRACK.x, top: y - TRACK.h / 2, width: TRACK.w * r.fill * r.grow, height: TRACK.h, borderRadius: TRACK.h / 3.5, background: alpha(C.muted, 0.42) }} />
              {r.lit > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    left: TRACK.x,
                    top: y - TRACK.h / 2,
                    width: TRACK.w * r.fill * r.grow,
                    height: TRACK.h,
                    borderRadius: TRACK.h / 3.5,
                    background: GRADIENT,
                    boxShadow: `0 0 36px ${alpha(C.accent, 0.5)}`,
                    opacity: r.lit,
                  }}
                />
              )}
              {/* Price. */}
              <div style={{ position: 'absolute', left: 760, width: 160, top: y - 32, textAlign: 'right', fontFamily, fontSize: 50, fontWeight: 800, lineHeight: 1.25, color: r.lit > 0.5 ? C.accentText : C.text, fontVariantNumeric: 'tabular-nums', opacity: r.grow }}>
                {r.price}
              </div>
            </div>
            <div style={{ opacity: 1 - 0.55 * r.dim }}>
              <ModelChip x={150} y={y} name={r.name} appear={r.appear} scale={0.9} dim={r.dim > 0.5} />
            </div>
          </React.Fragment>
        );
      })}
      {/* The tag, in the room Sonnet's bar leaves. */}
      {s.tag > 0 && (
        <div
          style={{
            position: 'absolute',
            left: TRACK.x + TRACK.w * s.rows[1].fill + 18,
            top: ROW_Y[1] - 26,
            height: 52,
            padding: '0 20px',
            borderRadius: 26,
            background: GRADIENT,
            display: 'flex',
            alignItems: 'center',
            fontFamily,
            fontSize: 28,
            fontWeight: 800,
            color: C.text,
            whiteSpace: 'nowrap',
            opacity: s.tag,
            transform: `scale(${1.4 - 0.4 * s.tag})`,
            boxShadow: `0 8px 22px ${alpha(C.bg0, 0.6)}`,
          }}
        >
          trade-off
        </div>
      )}
      {/* The share, under the card. */}
      {s.share > 0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 930, textAlign: 'center', fontFamily, opacity: s.share, transform: `translateY(${16 * (1 - s.share)}px)` }}>
          <span style={{ fontSize: 96, fontWeight: 800, letterSpacing: '-0.03em', ...gradientText }}>60%</span>
          <span style={{ fontSize: 44, fontWeight: 700, color: C.text }}> of Opus's cost</span>
        </div>
      )}
    </Stage>
  );
};
