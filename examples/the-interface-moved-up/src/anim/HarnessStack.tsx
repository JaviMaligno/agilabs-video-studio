import React from 'react';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { Stage } from './Stage.tsx';
import { LABELS, SLAB, TILE, W, frameState, type HarnessProps } from './HarnessStack.state.ts';

export { frameState };
export type { HarnessProps };

const st = { fill: 'none', stroke: C.text, strokeWidth: 4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

/** Generic surface icons (no product marks), centred on (0, 0), ~56 px. */
const Icon: React.FC<{ i: number }> = ({ i }) => {
  switch (i) {
    case 0: // terminal
      return (
        <g {...st}>
          <rect x={-30} y={-22} width={60} height={44} rx={8} />
          <path d="M -18 -8 L -8 0 L -18 8 M -2 10 L 14 10" />
        </g>
      );
    case 1: // IDE
      return (
        <g {...st}>
          <path d="M -12 -18 L -28 0 L -12 18 M 12 -18 L 28 0 L 12 18 M 5 -22 L -5 22" />
        </g>
      );
    case 2: // desktop app
      return (
        <g {...st}>
          <rect x={-30} y={-22} width={60} height={40} rx={6} />
          <path d="M -10 26 L 10 26 M 0 18 L 0 26 M -30 -12 L 30 -12" />
        </g>
      );
    case 3: // web · mobile
      return (
        <g {...st}>
          <rect x={-16} y={-26} width={32} height={52} rx={7} />
          <path d="M -5 19 L 5 19" />
        </g>
      );
    case 4: // tickets
      return (
        <g {...st}>
          <path d="M -30 -16 L 30 -16 L 30 -6 A 6 6 0 0 0 30 6 L 30 16 L -30 16 L -30 6 A 6 6 0 0 0 -30 -6 Z" />
          <path d="M -12 -16 L -12 16" strokeDasharray="4 5" />
        </g>
      );
    default: // schedules · events
      return (
        <g {...st}>
          <circle r={24} />
          <path d="M 0 -13 L 0 0 L 10 7" />
        </g>
      );
  }
};

export const HarnessStack: React.FC<AnimProps & HarnessProps> = ({ t, beats, dur, vertical, ...props }) => {
  const s = frameState(props, t, beats, dur);
  const H = SLAB.harness;
  const M = SLAB.model;
  const rows = [
    [0, 1, 2, 3],
    [4, 5],
  ];
  const chipW = (label: string) => label.length * 15.5 + 44;
  return (
    <Stage vertical={vertical} fill>
      <svg width={W} height={1090} viewBox={`0 0 ${W} 1090`} style={{ position: 'absolute', left: 0, top: 0, fontFamily }}>
        <defs>
          <linearGradient id="hsGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={C.accent} />
            <stop offset="1" stopColor={C.accent2} />
          </linearGradient>
        </defs>
        {/* Model slab, then the harness slab on it. */}
        <g opacity={s.model} transform={`translate(0 ${(1 - s.model) * 60})`}>
          <rect {...M} rx={18} fill={C.card} stroke={C.line} strokeWidth={3} />
          <text x={W / 2} y={M.y + 52} fontSize={36} fontWeight={700} fill={C.muted} textAnchor="middle">
            Model
          </text>
        </g>
        <g opacity={s.slab} transform={`translate(0 ${(1 - s.slab) * 80})`}>
          <rect x={H.x - 10} y={H.y - 10} width={H.w + 20} height={H.h + 20} rx={34} fill="none" stroke={C.accentText} strokeWidth={14} opacity={0.12 + 0.3 * s.glow} />
          <rect {...H} rx={26} fill={alpha(C.accent, 0.18 + 0.12 * s.glow)} stroke="url(#hsGrad)" strokeWidth={5} />
          <text x={W / 2} y={H.y + 68} fontSize={56} fontWeight={800} fill="url(#hsGrad)" textAnchor="middle">
            Harness
          </text>
          {rows.map((row, r) => {
            const total = row.reduce((a, i) => a + chipW(LABELS[i]), 0) + (row.length - 1) * 16;
            let x = (W - total) / 2;
            return row.map((i) => {
              const w = chipW(LABELS[i]);
              const cx = x;
              x += w + 16;
              const v = s.labels[i];
              return (
                <g key={i} opacity={v} transform={`translate(${cx} ${H.y + 102 + r * 66 + (1 - v) * 12})`}>
                  <rect x={0} y={0} width={w} height={52} rx={26} fill={C.card} stroke={alpha(C.accentText, 0.6)} strokeWidth={3} />
                  <text x={w / 2} y={35} fontSize={28} fontWeight={600} fill={C.text} textAnchor="middle">
                    {LABELS[i]}
                  </text>
                </g>
              );
            });
          })}
        </g>
        {/* Header over the docked surfaces, as in the article's figure. */}
        <text x={20} y={222} fontSize={28} fontWeight={700} fill={C.muted} opacity={s.header} letterSpacing="0.06em">
          SURFACES · a choice of view
        </text>
        {/* Surfaces */}
        {s.tiles.map((tile, i) => {
          if (tile.appear <= 0) return null;
          const lit = Math.max(tile.call, s.dot.visited[[0, 1, 2, 5, 4, 3].indexOf(i)] ?? 0);
          const sc = (0.8 + 0.2 * tile.appear) * (1 + 0.06 * tile.call * (1 - tile.dock));
          return (
            <g
              key={i}
              opacity={tile.appear}
              transform={`translate(${tile.x + TILE.w / 2} ${tile.y + TILE.h / 2}) rotate(${tile.rot}) scale(${sc}) translate(${-TILE.w / 2} ${-TILE.h / 2})`}
            >
              <rect x={0} y={0} width={TILE.w} height={TILE.h} rx={20} fill={C.card} stroke={lit > 0.5 ? 'url(#hsGrad)' : C.line} strokeWidth={lit > 0.5 ? 5 : 3} />
              <g transform={`translate(${TILE.w / 2} 52)`}>
                <Icon i={i} />
              </g>
              <text x={TILE.w / 2} y={122} fontSize={30} fontWeight={700} fill={C.text} textAnchor="middle">
                {tile.label}
              </text>
            </g>
          );
        })}
        {/* One agent, through every surface and into the harness. */}
        {s.dot.appear > 0 && (
          <g transform={`translate(${s.dot.x} ${s.dot.y})`} opacity={s.dot.appear * (1 - s.glow)}>
            <circle r={34} fill={C.accent2} opacity={0.3} />
            <circle r={16} fill="url(#hsGrad)" stroke={C.text} strokeWidth={3} />
          </g>
        )}
      </svg>
    </Stage>
  );
};
