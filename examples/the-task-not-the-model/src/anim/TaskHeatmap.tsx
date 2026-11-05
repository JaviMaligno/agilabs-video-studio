import React from 'react';
import { Img, staticFile } from 'remotion';
import { C, alpha } from '../brand.ts';
import type { AnimProps } from './types.ts';
import { frameState, HIGH, LOW, type TaskHeatmapProps } from './TaskHeatmap.state.ts';
import { Stage, stageOf } from './Stage.tsx';

export { frameState };
export type { TaskHeatmapProps };

const TOKENS = C as unknown as Record<string, string | undefined>;
const OK = TOKENS.ok ?? LOW;
const WARM = TOKENS.warm ?? HIGH;

/** Robot drawing per model short name (the cast mapping of the video). */
const ROBOT: Record<string, { src: string; filter?: string }> = {
  Gemini: { src: 'cast/robot-sky.png' },
  Opus: { src: 'cast/robot-violet.png' },
  Fable: { src: 'cast/robot-teal.png' },
  GLM: { src: 'cast/robot-graphite.png' },
  Kimi: { src: 'cast/robot-rose.png' },
  Qwen: { src: 'cast/robot-teal.png', filter: 'hue-rotate(70deg)' },
  DeepSeek: { src: 'cast/robot-amber.png' },
};

const LABEL_W = 318;
const BRACKET_W = 22;
const HEAD_H = 118;
const TAG_H = 84;
const GAP = 5;

/** 19 x 7 heatmap: rows fill top to bottom, then a light sweeps the rows: the task decides. */
export const TaskHeatmap: React.FC<AnimProps & TaskHeatmapProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const box = stageOf(p.vertical);
  const nRows = Math.max(1, s.rows.length);
  const nCols = Math.max(1, s.columns.length);
  const gridH = box.h - HEAD_H - TAG_H - 16;
  const rowH = (gridH - GAP * (nRows - 1)) / nRows;
  const cellW = (box.w - LABEL_W - BRACKET_W - GAP * nCols) / nCols;
  const labelSize = Math.max(18, Math.min(24, Math.floor(rowH * 0.56)));
  const numSize = Math.max(18, Math.min(24, Math.floor(rowH * 0.54)));
  const gridLeft = BRACKET_W + LABEL_W + GAP;

  return (
    <Stage vertical={p.vertical} fill>
      {/* Column headers: the robot and its short name. */}
      <div style={{ position: 'absolute', top: 0, left: gridLeft, height: HEAD_H, display: 'flex', gap: GAP, opacity: s.head }}>
        {s.columns.map((c, j) => {
          const r = ROBOT[c.name];
          return (
            <div key={j} style={{ width: cellW, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
              {r ? <Img src={staticFile(r.src)} style={{ height: 72, width: 72, objectFit: 'contain', filter: r.filter }} /> : null}
              <div
                style={{
                  fontSize: 19,
                  fontWeight: c.highlight ? 800 : 600,
                  color: c.highlight ? WARM : C.muted,
                  whiteSpace: 'nowrap',
                  letterSpacing: -0.3,
                }}
              >
                {c.name}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bracket along the left: drawn top to bottom on beat 1. */}
      <div
        style={{
          position: 'absolute',
          top: HEAD_H + 8,
          left: 4,
          width: 10,
          height: gridH * s.draw,
          borderLeft: `4px solid ${OK}`,
          borderTop: s.draw > 0 ? `4px solid ${OK}` : 'none',
          borderBottom: s.draw > 0.98 ? `4px solid ${OK}` : 'none',
          borderRadius: 4,
          boxShadow: s.draw > 0 ? `0 0 18px ${alpha(OK, 0.5)}` : 'none',
        }}
      />

      {/* Rows. */}
      {s.rows.map((r, i) => {
        const top = HEAD_H + 8 + i * (rowH + GAP);
        return (
          <div key={i} style={{ position: 'absolute', top, left: BRACKET_W, height: rowH, display: 'flex', alignItems: 'center', gap: GAP, opacity: r.opacity }}>
            <div
              style={{
                width: LABEL_W,
                fontSize: labelSize,
                fontWeight: 500,
                color: r.glow > 0.3 ? C.text : C.muted,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                paddingRight: 8,
                boxSizing: 'border-box',
              }}
            >
              {r.label}
            </div>
            {r.cells.map((c, j) => (
              <div
                key={j}
                style={{
                  width: cellW,
                  height: rowH,
                  borderRadius: 8,
                  background: c.colour,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: numSize,
                  fontWeight: 700,
                  fontVariantNumeric: 'tabular-nums',
                  color: c.fill > 0.45 ? C.bg0 : C.text,
                  boxShadow: r.glow > 0 ? `0 0 ${Math.round(22 * r.glow)}px ${alpha('#ffffff', 0.35 * r.glow)}` : 'none',
                  outline: r.glow > 0 ? `2px solid ${alpha('#ffffff', 0.5 * r.glow)}` : 'none',
                }}
              >
                {c.text}
              </div>
            ))}
          </div>
        );
      })}

      {/* "task ≫ model" */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          width: box.w,
          bottom: 0,
          height: TAG_H,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: s.appear,
          transform: `translateY(${(1 - s.appear) * 16}px)`,
        }}
      >
        <div style={{ fontSize: 58, fontWeight: 800, color: C.text, letterSpacing: -1 }}>
          <span style={{ color: OK }}>task</span> ≫ model
        </div>
      </div>
    </Stage>
  );
};
