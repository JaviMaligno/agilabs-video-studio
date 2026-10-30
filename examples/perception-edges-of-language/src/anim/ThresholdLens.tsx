import React from 'react';
import { C, alpha } from '../brand.ts';
import type { AnimProps } from './types.ts';
import { COLS_N, CROP, ROWS_N, frameState, type ThresholdLensProps } from './ThresholdLens.state.ts';
import { Stage, gradientText } from './Stage.tsx';
import { StimulusCard, ChipIcon } from './FadeCard.tsx';
import { CARD } from './perception.ts';
import { SETTINGS } from '../settings.ts';
import { Spider } from './Halloween.tsx';
import { beatAt, easeOutCubic, progress } from './steps.ts';

export { frameState };
export type { ThresholdLensProps };

const rgb = (g: number) => `rgb(${g},${g},${g})`;

export const ThresholdLens: React.FC<AnimProps & ThresholdLensProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const ink = Math.round(254 * (1 - s.binarised));
  const gridW = COLS_N * s.cell;
  const gridH = ROWS_N * s.cell;
  const gap = s.cell > 20 ? 2 : 0;
  return (
    <Stage vertical={p.vertical} fill>
      <StimulusCard stops={[{ pos: 0, grey: ink }, { pos: 1, grey: ink }]} style={{ opacity: s.cardOpacity }} />
      {/* The crop's outline on the card, before the dive. */}
      <div
        style={{
          position: 'absolute',
          left: CROP.x - 6,
          top: CROP.y - 6,
          width: COLS_N * CROP.cell + 12,
          height: ROWS_N * CROP.cell + 12,
          border: `4px solid ${C.accentText}`,
          borderRadius: 6,
          opacity: s.header * (1 - s.zoom) * (1 - s.binarised),
        }}
      />
      {s.zoom > 0.01 && s.gridOpacity > 0 && (
        <div
          style={{
            position: 'absolute',
            left: s.x,
            top: s.y,
            width: gridW,
            height: gridH,
            background: alpha(C.muted, 0.35),
            boxShadow: `0 20px 70px ${alpha('#000000', 0.6)}`,
            outline: `3px solid ${alpha(C.accentText, 0.6)}`,
            opacity: s.gridOpacity,
          }}
        >
          {s.cells.map((c) => (
            <div
              key={`${c.r}-${c.c}`}
              style={{
                position: 'absolute',
                left: c.c * s.cell + gap / 2,
                top: c.r * s.cell + gap / 2,
                width: s.cell - gap,
                height: s.cell - gap,
                background: rgb(c.shown),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 17,
                fontWeight: 700,
                color: c.shown === 0 ? C.text : c.value < 255 ? '#3f3f52' : '#9a9aae',
                opacity: 1,
              }}
            >
              <span style={{ opacity: s.labels }}>{c.shown}</span>
            </div>
          ))}
          {s.sweepOn > 0 && (
            <div
              style={{
                position: 'absolute',
                left: s.sweep * gridW - 3,
                top: -18,
                width: 6,
                height: gridH + 36,
                background: C.accentText,
                boxShadow: `0 0 24px 6px ${alpha(C.accent, 0.7)}`,
                borderRadius: 3,
              }}
            />
          )}
        </div>
      )}
      <div
        style={{
          position: 'absolute',
          left: CARD.x,
          width: CARD.w,
          top: 1000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, opacity: s.header, fontSize: 32, fontWeight: 700 }}>
          <ChipIcon kind="ocr" size={40} />
          Tesseract <span style={{ color: C.muted, fontWeight: 600 }}>· arithmetic on pixel values</span>
        </div>
        <div style={{ opacity: s.rule, fontSize: 34, fontWeight: 800, transform: `translateY(${(1 - s.rule) * 12}px)` }}>
          <span>darker than its neighbours</span> <span style={gradientText}>→ black</span>
        </div>
      </div>
      {/* Halloween: once the card is back and crisp, a spider lets itself down under it. */}
      {SETTINGS.halloween && p.beats.length > 2 && (
        <Spider x={800} top={CARD.y + CARD.h} len={300} drop={easeOutCubic(progress(p.t, beatAt(p.beats, 2) + 0.7, 1.3))} t={p.t} size={64} />
      )}
    </Stage>
  );
};
