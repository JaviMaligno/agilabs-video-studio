import React from 'react';
import { staticFile } from 'remotion';
import { C, GRADIENT, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { Canvas } from './Canvas.tsx';
import { gradientText } from './Stage.tsx';
import { COLS, COLS_L, ROWS, ROWS_L, frameState, tileLanded, type FileStackProps } from './FileStack.state.ts';

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

/** The vertical cut (the approved short's drawing, unchanged). */
const FileStackVertical: React.FC<AnimProps & FileStackProps> = (p) => {
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

// ══ Landscape (1920x1080) ═══════════════════════════════════════════════════════════════════════
// Cold open: the stack piles up across the wide stage, the gravestone in front, the hook panel under
// it. Count: the stack slides left and shrinks, the number and its two chips stand on the right,
// the checker robot scans it from below.
const TOTAL_L = COLS_L * ROWS_L;
const STACK_L = { w: COLS_L * (TILE.w + TILE.gap) - TILE.gap, h: ROWS_L * (TILE.h + TILE.gap) - TILE.gap };
const LOOM_AT = { x: (1920 - STACK_L.w * 1.16) / 2, y: 150, s: 1.16 };
const COUNT_AT = { x: 170, y: 200, s: 0.74 };
const ORDER_L: { col: number; row: number; k: number }[] = (() => {
  const out: { col: number; row: number; k: number }[] = [];
  for (let r = ROWS_L - 1; r >= 0; r--) {
    const cols = Array.from({ length: COLS_L }, (_, c) => c).sort((a, b) => hash(r * 37 + a + 900) - hash(r * 37 + b + 900));
    cols.forEach((c) => out.push({ col: c, row: r, k: out.length }));
  }
  return out;
})();

const FileStackLandscape: React.FC<AnimProps & FileStackProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const L = s.layout;
  const at = { x: LOOM_AT.x + (COUNT_AT.x - LOOM_AT.x) * L, y: LOOM_AT.y + (COUNT_AT.y - LOOM_AT.y) * L, s: LOOM_AT.s + (COUNT_AT.s - LOOM_AT.s) * L };
  const scanY = s.scan * STACK_L.h;
  const done = s.scan >= 1;
  const loom = p.mode === 'loom';
  // Below the stack, in frame pixels.
  const bottom = at.y + STACK_L.h * at.s;
  return (
    <>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: 'absolute', left: 0, top: 0, fontFamily }}>
        <defs>
          <linearGradient id="fsl-scan" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={C.accentText} stopOpacity="0" />
            <stop offset="0.7" stopColor={C.accentText} stopOpacity="0.35" />
            <stop offset="1" stopColor={C.text} stopOpacity="0.95" />
          </linearGradient>
          <radialGradient id="fsl-glow">
            <stop offset="0" stopColor={C.accent2} stopOpacity="0.35" />
            <stop offset="1" stopColor={C.accent2} stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* a soft light behind the pile, breathing */}
        <ellipse cx={at.x + (STACK_L.w * at.s) / 2} cy={at.y + (STACK_L.h * at.s) / 2} rx={STACK_L.w * at.s * 0.7} ry={STACK_L.h * at.s * 0.9} fill="url(#fsl-glow)" opacity={0.8 + 0.2 * Math.sin(s.T * 1.2)} />
        <g transform={`translate(${at.x} ${at.y}) scale(${at.s})`}>
          {ORDER_L.map(({ col, row, k }) => {
            const landed = tileLanded(k, TOTAL_L, s.T);
            if (landed <= 0) return null;
            const x = col * (TILE.w + TILE.gap);
            const y = row * (TILE.h + TILE.gap);
            const checked = done || (s.scanOn > 0 && y + TILE.h / 2 < scanY);
            const drop = (1 - landed) * -260;
            // Fade in below the badge: nothing falls across it.
            const frameY = at.y + (y + drop) * at.s;
            const shimmer = checked ? 0.08 * Math.max(0, Math.sin(s.T * 2.2 - col * 0.35 - row * 0.2)) : 0;
            return (
              <g key={k} transform={`translate(${x} ${y + drop})`} opacity={Math.min(1, landed * 3, Math.max(0, (frameY - 120) / 60))}>
                <rect width={TILE.w} height={TILE.h} rx={5} fill={checked ? alpha(C.accentText, 0.6 + shimmer) : alpha(C.accent, 0.3)} stroke={checked ? alpha(C.text, 0.8) : alpha(C.accentText, 0.55)} strokeWidth={1.5} />
                <rect x={7} y={8} width={12 + hash(k) * 20} height={3} rx={1.5} fill={alpha(C.text, checked ? 0.95 : 0.55)} />
                <rect x={7} y={15} width={8 + hash(k + 500) * 16} height={3} rx={1.5} fill={alpha(C.text, checked ? 0.7 : 0.35)} />
              </g>
            );
          })}
          {s.scanOn > 0 && (
            <g>
              <rect x={-16} y={scanY - 70} width={STACK_L.w + 32} height={70} fill="url(#fsl-scan)" />
              <rect x={-24} y={scanY - 3} width={STACK_L.w + 48} height={6} rx={3} fill={C.text} />
            </g>
          )}
        </g>
        {/* cold open: the hook drawn, a gravestone for mathematics in front of the growing stack */}
        {loom && (
          <g transform={`translate(960 ${790 + 4 * Math.sin(s.T * 1.3)}) rotate(${-3 + 0.6 * Math.sin(s.T * 0.9)})`}>
            <ellipse cx={0} cy={0} rx={150} ry={16} fill={alpha('#000000', 0.5)} />
            <image href={staticFile('cast/tombstone.png')} x={-140} y={-330} width={280} height={330} />
          </g>
        )}
        {/* the checker, under the stack, its magnifier on it */}
        {s.checker > 0 && (
          <g opacity={s.checker} transform={`translate(${at.x + 140} ${Math.min(818, bottom + 236) + (1 - s.checker) * 30 - 3 * Math.abs(Math.sin(s.T * 2))})`}>
            <ellipse cx={0} cy={0} rx={70} ry={10} fill={alpha('#000000', 0.45)} />
            <image href={staticFile('cast/checker.png')} x={-99} y={-204} width={198} height={204} />
          </g>
        )}
      </svg>
      {!loom && (
        <>
          <div style={{ position: 'absolute', left: 1110, width: 650, top: 230, textAlign: 'center', opacity: s.appear, fontFamily, transform: `translateY(${(1 - s.appear) * 16}px)` }}>
            <div style={{ fontSize: 140, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', ...gradientText }}>{s.text}</div>
            <div style={{ marginTop: 10, fontSize: 52, fontWeight: 600, color: C.muted }}>Lean files</div>
          </div>
          <div style={{ position: 'absolute', left: 1110, width: 650, top: 500, display: 'flex', justifyContent: 'center', opacity: s.checked, transform: `translateY(${(1 - s.checked) * 16}px)`, fontFamily }}>
            <div style={{ padding: '14px 30px', borderRadius: 20, background: C.card, border: `2px solid ${alpha(C.accent, 0.4)}`, fontSize: 42, fontWeight: 600, color: C.text, whiteSpace: 'nowrap' }}>
              <span style={{ color: C.accentText, fontWeight: 800 }}>✓</span> checked by machine
            </div>
          </div>
          <div style={{ position: 'absolute', left: 1110, width: 650, top: 620, display: 'flex', justifyContent: 'center', opacity: s.read, transform: `translateY(${(1 - s.read) * 16}px)`, fontFamily }}>
            <div style={{ padding: '16px 40px', borderRadius: 22, background: C.card, border: `2px solid ${alpha(C.accent2, 0.75)}`, fontSize: 64, fontWeight: 800, color: C.text, whiteSpace: 'nowrap' }}>
              read by: <span style={{ backgroundImage: GRADIENT, backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent', WebkitTextFillColor: 'transparent' }}>0</span>
            </div>
          </div>
        </>
      )}
    </>
  );
};

/** The stack of Lean files: piled up, counted, scanned by the checker, read by nobody. */
export const FileStack: React.FC<AnimProps & FileStackProps> = (p) => (p.vertical ? <FileStackVertical {...p} /> : <FileStackLandscape {...p} />);
