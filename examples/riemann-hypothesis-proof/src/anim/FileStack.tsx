import React from 'react';
import { staticFile } from 'remotion';
import { C, GRADIENT, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { Canvas } from './Canvas.tsx';
import { gradientText } from './Stage.tsx';
import { COLS, ROWS, frameState, tileLanded, type FileStackProps } from './FileStack.state.ts';

export { frameState };
export type { FileStackProps };

// Vertical frame pixels (1080x1920). The stack hangs from the top of the stage.
const TILE = { w: 44, h: 26, gap: 6 };
const STACK = { x: 540 - (COLS * (TILE.w + TILE.gap) - TILE.gap) / 2, top: 262, h: ROWS * (TILE.h + TILE.gap) - TILE.gap };
const TOTAL = COLS * ROWS;

/** Deterministic 0..1 per tile, for the order tiles land within a row and their line lengths. */
const hash = (n: number): number => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// Landing order: bottom row first, shuffled within each row.
const ORDER: { col: number; row: number; k: number }[] = (() => {
  const out: { col: number; row: number; k: number }[] = [];
  for (let r = ROWS - 1; r >= 0; r--) {
    const cols = Array.from({ length: COLS }, (_, c) => c).sort((a, b) => hash(r * 31 + a) - hash(r * 31 + b));
    cols.forEach((c) => out.push({ col: c, row: r, k: out.length }));
  }
  return out;
})();

const Chip: React.FC<{ top: number; opacity: number; children: React.ReactNode; strong?: boolean }> = ({ top, opacity, children, strong }) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      right: 0,
      top,
      display: 'flex',
      justifyContent: 'center',
      opacity,
      transform: `translateY(${(1 - opacity) * 16}px)`,
      fontFamily,
    }}
  >
    <div
      style={{
        padding: strong ? '14px 34px' : '12px 28px',
        borderRadius: 20,
        background: C.card,
        border: `2px solid ${alpha(strong ? C.accent2 : C.accent, strong ? 0.7 : 0.35)}`,
        fontSize: strong ? 54 : 38,
        fontWeight: strong ? 800 : 600,
        color: C.text,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </div>
  </div>
);

/** The stack of Lean files: piled up, counted, scanned by the checker, read by nobody. */
export const FileStack: React.FC<AnimProps & FileStackProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const scanY = STACK.top + s.scan * STACK.h;
  const done = s.scan >= 1;
  return (
    <>
      <Canvas vertical={p.vertical} design="vertical">
        <defs>
          <linearGradient id="fs-scan" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={C.accentText} stopOpacity="0" />
            <stop offset="0.7" stopColor={C.accentText} stopOpacity="0.35" />
            <stop offset="1" stopColor={C.text} stopOpacity="0.95" />
          </linearGradient>
        </defs>
        <g transform={`translate(540 ${STACK.top}) scale(${s.zoom}) translate(-540 ${-STACK.top})`}>
          {ORDER.map(({ col, row, k }) => {
            const landed = tileLanded(k, TOTAL, s.T);
            if (landed <= 0) return null;
            const x = STACK.x + col * (TILE.w + TILE.gap);
            const y = STACK.top + row * (TILE.h + TILE.gap);
            const checked = done || (s.scanOn > 0 && y + TILE.h / 2 < scanY);
            // Tiles fade in below the badge: nothing falls across it.
            const drop = (1 - landed) * -260;
            return (
              <g key={k} transform={`translate(${x} ${y + drop})`} opacity={Math.min(1, landed * 3, Math.max(0, (STACK.top + (y + drop - STACK.top) * s.zoom - 240) / 60))}>
                <rect
                  width={TILE.w}
                  height={TILE.h}
                  rx={5}
                  fill={checked ? alpha(C.accentText, 0.62) : alpha(C.accent, 0.3)}
                  stroke={checked ? alpha(C.text, 0.8) : alpha(C.accentText, 0.55)}
                  strokeWidth={1.5}
                />
                <rect x={7} y={8} width={12 + hash(k) * 20} height={3} rx={1.5} fill={alpha(C.text, checked ? 0.95 : 0.55)} />
                <rect x={7} y={15} width={8 + hash(k + 500) * 16} height={3} rx={1.5} fill={alpha(C.text, checked ? 0.7 : 0.35)} />
              </g>
            );
          })}
          {s.scanOn > 0 && (
            <g>
              <rect x={STACK.x - 16} y={scanY - 70} width={COLS * (TILE.w + TILE.gap) - TILE.gap + 32} height={70} fill="url(#fs-scan)" />
              <rect x={STACK.x - 24} y={scanY - 3} width={COLS * (TILE.w + TILE.gap) - TILE.gap + 48} height={6} rx={3} fill={C.text} />
            </g>
          )}
        </g>
        {/* Cold open: the hook drawn, a gravestone for mathematics in front of the growing stack. */}
        {p.mode === 'loom' && (
          <g transform={`translate(540 ${600 + 4 * Math.sin(s.T * 1.3)}) rotate(${-3 + 0.6 * Math.sin(s.T * 0.9)})`}>
            <ellipse cx={0} cy={0} rx={150} ry={16} fill={alpha('#000000', 0.5)} />
            <image href={staticFile('cast/tombstone.png')} x={-148} y={-350} width={296} height={350} />
          </g>
        )}
      </Canvas>
      {p.vertical && (
        <>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 918, textAlign: 'center', opacity: s.appear, fontFamily }}>
            <div style={{ fontSize: 132, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', ...gradientText }}>{s.text}</div>
            <div style={{ marginTop: 8, fontSize: 42, fontWeight: 600, color: C.muted }}>Lean files</div>
          </div>
          <Chip top={1124} opacity={s.checked}>
            <span style={{ color: C.accentText, fontWeight: 800 }}>✓</span> checked by machine · about a day
          </Chip>
          <Chip top={1212} opacity={s.read} strong>
            read by: <span style={{ backgroundImage: GRADIENT, backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent', WebkitTextFillColor: 'transparent' }}>0</span>
          </Chip>
        </>
      )}
    </>
  );
};
