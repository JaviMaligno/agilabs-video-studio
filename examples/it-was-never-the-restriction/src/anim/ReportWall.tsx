import React from 'react';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { Stage, gradientText } from './Stage.tsx';
import { COLS_X, GRID, frameState, type WallProps } from './ReportWall.state.ts';
import { ModelChip, clamp01 } from './pieces.tsx';
import { MiniCard, type MiniKind } from './MiniCard.tsx';

export { frameState };
export type { WallProps };

const colW = GRID.per * GRID.cw + (GRID.per - 1) * GRID.gx;
const slotXY = (cx: number, i: number): [number, number] => [
  cx - colW / 2 + GRID.cw / 2 + (i % GRID.per) * (GRID.cw + GRID.gx),
  GRID.top + GRID.ch / 2 + Math.floor(i / GRID.per) * (GRID.ch + GRID.gy),
];

const LEGEND: { kind: MiniKind; text: string }[] = [
  { kind: 'named', text: 'named it' },
  { kind: 'false', text: 'false report' },
  { kind: 'blank', text: 'filed nothing' },
  { kind: 'empty', text: 'no report' },
];

export const ReportWall: React.FC<AnimProps & WallProps> = ({ t, beats, dur, vertical, ...props }) => {
  const s = frameState(props, t, beats, dur);
  const wallOp = 1 - 0.8 * s.dimWall;
  return (
    <Stage vertical={vertical} fill>
      <div style={{ position: 'absolute', left: 0, top: 0, width: 960, height: 1090, opacity: wallOp }}>
        {s.columns.map((c, ci) => (
          <React.Fragment key={c.name}>
            {/* Price per run, above each column. */}
            <div style={{ position: 'absolute', left: COLS_X[ci] - 150, width: 300, top: 112, textAlign: 'center', fontFamily, opacity: c.priceIn, transform: `translateY(${12 * (1 - c.priceIn)}px)` }}>
              <span style={{ fontSize: 46, fontWeight: 800, color: C.text }}>{c.price}</span>
              <span style={{ fontSize: 24, fontWeight: 600, color: C.muted }}> per run</span>
            </div>
            {c.slots.map((sl, i) => {
              const [x, y] = slotXY(COLS_X[ci], i);
              const isRing = ci === 1 && i === s.sonnetFalse;
              return <MiniCard key={i} x={x} y={y} w={GRID.cw} h={GRID.ch} kind={sl.kind} appear={sl.appear} glow={isRing ? s.ringPulse : 0} />;
            })}
          </React.Fragment>
        ))}
        {/* Sonnet's one unchecked sign-off, ringed. */}
        {s.ring > 0 &&
          (() => {
            const [x, y] = slotXY(COLS_X[1], s.sonnetFalse);
            return (
              <div
                style={{
                  position: 'absolute',
                  left: x - GRID.cw / 2 - 12,
                  top: y - GRID.ch / 2 - 12,
                  width: GRID.cw + 24,
                  height: GRID.ch + 24,
                  borderRadius: 16,
                  border: `4px solid ${C.text}`,
                  opacity: s.ring,
                  transform: `scale(${1.3 - 0.3 * s.ring})`,
                }}
              />
            );
          })()}
        {/* Haiku: an eighth of the cost, fourteen false reports. */}
        {s.bracket > 0 && (
          <div style={{ position: 'absolute', left: COLS_X[2] - 160, width: 320, top: 0, opacity: s.bracket, transform: `translateY(${-14 * (1 - s.bracket)}px)` }}>
            <div style={{ textAlign: 'center', fontFamily, fontSize: 30, fontWeight: 800, lineHeight: 1.18, color: C.text }}>
              <span style={gradientText}>⅛ of the cost</span>
              <br />
              <span style={{ color: C.muted }}>14 false reports</span>
            </div>
            <svg width={320} height={20} style={{ display: 'block', marginTop: 4 }}>
              <path d="M 16 18 V 6 H 304 V 18" fill="none" stroke={C.accentText} strokeWidth={4} strokeLinejoin="round" />
            </svg>
          </div>
        )}
        {/* Legend */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 752, display: 'flex', justifyContent: 'center', gap: 16, opacity: s.legend }}>
          {LEGEND.map((l) => (
            <div key={l.kind} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, fontFamily, fontSize: 26, fontWeight: 600, color: C.muted }}>
              <div style={{ position: 'relative', width: 44, height: 34 }}>
                <MiniCard x={22} y={17} w={44} h={34} kind={l.kind} appear={1} />
              </div>
              {l.text}
            </div>
          ))}
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 820, textAlign: 'center', fontFamily, fontSize: 27, fontWeight: 600, color: alpha(C.muted, 0.85), opacity: s.legend }}>
          one card per run · 18 runs per model
        </div>
      </div>
      {/* The number: named the problem or its own doubt. */}
      {s.columns.map((c, ci) => {
        const a = clamp01(s.figures[ci]);
        if (a <= 0) return null;
        const big = ci !== 1;
        return (
          <div
            key={`f${ci}`}
            style={{
              position: 'absolute',
              left: COLS_X[ci] - 160,
              width: 320,
              top: big ? 330 : 360,
              textAlign: 'center',
              fontFamily,
              opacity: a,
              transform: `scale(${1.5 - 0.5 * a})`,
            }}
          >
            <span style={{ fontSize: big ? 170 : 104, fontWeight: 800, letterSpacing: '-0.04em', ...(big ? gradientText : { color: C.muted }) }}>{c.slots.filter((x) => x.kind === 'named').length}</span>
            <span style={{ fontSize: big ? 64 : 44, fontWeight: 800, color: big ? C.text : C.muted }}> / 18</span>
            {ci === 2 && (
              <div style={{ margin: '0 auto', width: 260 * clamp01(s.underline), height: 8, borderRadius: 4, background: C.accentText, marginTop: -6 }} />
            )}
          </div>
        );
      })}
      {s.label > 0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 600, textAlign: 'center', fontFamily, fontSize: 40, fontWeight: 700, color: C.text, opacity: s.label }}>
          named the problem or its own doubt
        </div>
      )}
      {s.columns.map((c, ci) => (
        <ModelChip key={`chip${ci}`} x={COLS_X[ci]} y={222} name={c.name} appear={c.head} scale={0.95} />
      ))}
      {s.footnote > 0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 720, display: 'flex', justifyContent: 'center', opacity: s.footnote, transform: `translateY(${16 * (1 - s.footnote)}px)` }}>
          <div style={{ padding: '10px 26px', borderRadius: 18, border: `2px solid ${alpha(C.muted, 0.6)}`, fontFamily, fontSize: 32, fontWeight: 600, color: C.muted }}>
            3 runs per cell · one trap · not a rate
          </div>
        </div>
      )}
    </Stage>
  );
};
