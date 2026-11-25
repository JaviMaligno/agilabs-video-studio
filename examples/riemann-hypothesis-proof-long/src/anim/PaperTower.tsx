import React from 'react';
import { staticFile } from 'remotion';
import { C, alpha } from '../brand.ts';
import type { AnimProps } from './types.ts';
import { Canvas } from './Canvas.tsx';
import { fitInto, stageBox } from './canvas.ts';
import { QUESTION, QUOTE_BY, QUOTE_WORDS, TILES, frameState, type PaperTowerProps } from './PaperTower.state.ts';

export { frameState };
export type { PaperTowerProps };

// Landscape frame pixels (1920x1080). Stage: x 160..1760, y 140..830.
const FLOOR = 800;
const CAM = 380; // how far the world slides down when the camera tilts up
const TOWER = { x: 1200, s: 1.9 };
const TW = 319 * TOWER.s;
const TH = 1387 * TOWER.s;
const BIN = { x: 1600, s: 0.68 };
const BW = 420 * BIN.s;
const BH = 526 * BIN.s;
const PAPER = '#f6eedc';
const INK = '#3b3366';

const hash = (n: number): number => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const lerp = (a: number, b: number, k: number): number => a + (b - a) * k;

/** A loose sheet of paper, drawn. */
const Sheet: React.FC<{ x: number; y: number; r: number; s?: number; o?: number }> = ({ x, y, r, s = 1, o = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} opacity={o}>
    <rect x={-26} y={-18} width={52} height={36} rx={3} fill={PAPER} stroke={INK} strokeWidth={2.5} />
    <rect x={-17} y={-9} width={30} height={4} rx={2} fill={alpha('#6366f1', 0.7)} />
    <rect x={-17} y={1} width={20} height={4} rx={2} fill={alpha('#f59e0b', 0.8)} />
  </g>
);

export const PaperTower: React.FC<AnimProps & PaperTowerProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const T = s.T;
  const camY = s.tilt * CAM;
  const binMouth = { x: BIN.x, y: FLOOR - BH + 26 };
  // Tower pose: sways a little once standing, wobbles before falling, then tips into the bin.
  const k = s.topple;
  const sway = s.rise * 0.45 * Math.sin(T * 0.8) + s.wobble * 4.5 * Math.sin(T * 7.5);
  const baseX = lerp(TOWER.x, binMouth.x, k);
  const baseY = lerp(FLOOR, binMouth.y + 30, k);
  const towerTf = `translate(${baseX} ${baseY}) rotate(${sway + k * 84}) scale(${1 - 0.9 * k}) translate(${-TOWER.x} ${-FLOOR})`;
  const towerOpacity = 1 - s.gone;
  const vfit = p.vertical ? fitInto(stageBox(false), stageBox(true)).transform : undefined;
  const binDx = (1 - s.bin) * 520;

  return (
    <Canvas vertical={p.vertical}>
      <defs>
        <linearGradient id="pt-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={C.accentText} />
          <stop offset="1" stopColor={C.accent2} />
        </linearGradient>
        <linearGradient id="pt-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.accent} stopOpacity="0.16" />
          <stop offset="1" stopColor={C.accent} stopOpacity="0" />
        </linearGradient>
        <clipPath id="pt-above-floor">
          <rect x={-2000} y={-6000} width={6000} height={6000 + FLOOR + 2} />
        </clipPath>
      </defs>
      <g transform={vfit}>
        {/* The world: floor, tower, bin. It slides down when the camera tilts up. */}
        <g transform={`translate(0 ${camY})`}>
          <rect x={0} y={FLOOR} width={1920} height={420} fill="url(#pt-floor)" />
          <line x1={120} x2={1800} y1={FLOOR} y2={FLOOR} stroke={alpha(C.accentText, 0.45)} strokeWidth={3} strokeLinecap="round" />
          {/* Floor boards receding, so the empty floor reads as a place. */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
            const x = 160 + i * 200;
            return <line key={i} x1={x} y1={FLOOR} x2={960 + (x - 960) * 1.7} y2={FLOOR + 260} stroke={alpha(C.accentText, 0.1)} strokeWidth={2} />;
          })}
          {s.rise > 0 && towerOpacity > 0 && (
            <>
              <ellipse cx={baseX} cy={FLOOR + 6} rx={TW * 0.42 * s.rise * (1 - k)} ry={14} fill={alpha('#000000', 0.45)} />
              <g clipPath="url(#pt-above-floor)">
                <g transform={towerTf} opacity={towerOpacity}>
                  <image href={staticFile('cast/paper-tower.png')} x={TOWER.x - TW / 2} y={FLOOR - s.rise * TH} width={TW} height={TH} />
                </g>
              </g>
              {/* Loose sheets drifting off the standing tower. */}
              {k === 0 &&
                [0, 1, 2, 3, 4, 5].map((i) => {
                  const cyc = (T * 0.12 + hash(i)) % 1;
                  const side = i % 2 ? 1 : -1;
                  const y0 = FLOOR - s.rise * TH * (0.25 + 0.7 * hash(i + 9));
                  const x = TOWER.x + side * (TW * 0.35 + cyc * 260) + 30 * Math.sin(T * 1.3 + i);
                  const y = y0 + cyc * 420;
                  return <Sheet key={i} x={x} y={y} r={side * 40 * Math.sin(T * 1.1 + i * 2)} s={0.9} o={s.rise * Math.sin(Math.PI * cyc) * (1 - s.wobble)} />;
                })}
            </>
          )}
          {p.mode === 'slop' && (
            <g transform={`translate(${binDx} 0)`}>
              {/* Crumpled sheets bursting out of the bin when the tower lands. */}
              {s.burst > 0 &&
                s.burst < 1 &&
                [0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
                  const a = -Math.PI / 2 + (hash(i + 3) - 0.5) * 2.2;
                  const v = 380 + 260 * hash(i + 21);
                  const tt = s.burst * 1.3;
                  const x = binMouth.x + Math.cos(a) * v * tt;
                  const y = binMouth.y + Math.sin(a) * v * tt + 520 * tt * tt;
                  return <Sheet key={i} x={x} y={Math.min(y, FLOOR - 10)} r={tt * 400 * (hash(i) - 0.5)} s={0.8} o={1 - s.burst} />;
                })}
              <g transform={`translate(${BIN.x} ${FLOOR}) scale(${1 + 0.08 * s.thud} ${1 - 0.12 * s.thud}) rotate(${1.5 * Math.sin(T * 1.6)}) translate(${-BIN.x} ${-FLOOR})`}>
                <ellipse cx={BIN.x} cy={FLOOR + 4} rx={BW * 0.46} ry={12} fill={alpha('#000000', 0.45)} />
                <image href={staticFile('cast/waste-bin.png')} x={BIN.x - BW / 2} y={FLOOR - BH} width={BW} height={BH} />
              </g>
            </g>
          )}
        </g>

        {/* Line 1: the question over the empty floor. */}
        {s.question > 0 && (
          <text
            x={960}
            y={470 + 8 * Math.sin(T * 1.4) + (1 - s.question) * 30}
            textAnchor="middle"
            fontSize={108}
            fontWeight={800}
            fill={C.text}
            opacity={s.question}
            letterSpacing="-0.01em"
          >
            {QUESTION.slice(0, -1)}
            <tspan fill="url(#pt-grad)">?</tspan>
          </text>
        )}

        {/* The figure tiles, fixed on screen while the camera moves. */}
        {TILES.map((tile, i) => {
          const a = s.tiles[i];
          if (a <= 0) return null;
          const y = 172 + i * 196;
          return (
            <g key={i} transform={`translate(${160 - (1 - a) * 60} ${y + 2 * Math.sin(T * 1.2 + i)})`} opacity={a}>
              <rect width={700} height={168} rx={24} fill={alpha(C.card, 0.94)} stroke={alpha(C.accentText, 0.5)} strokeWidth={2.5} />
              <rect x={0} y={24} width={8} height={120} rx={4} fill="url(#pt-grad)" />
              <text x={42} y={86} fontSize={76} fontWeight={800} fill="url(#pt-grad)" letterSpacing="-0.01em">
                {tile.value}
              </text>
              <text x={44} y={140} fontSize={42} fontWeight={600} fill={C.muted}>
                {tile.label}
              </text>
            </g>
          );
        })}

        {/* Slop line 2: his words, lit as they are spoken. */}
        {s.quote > 0 && (
          <g opacity={s.quote} transform={`translate(${(1 - s.quote) * -30} 0)`}>
            <text x={150} y={268} fontSize={180} fontWeight={800} fill={alpha(C.accent2, 0.5)}>
              “
            </text>
            {[
              [0, 1],
              [2, 3],
              [4, 5],
            ].map((idx, row) => (
              <text key={row} x={180} y={350 + row * 118} fontSize={100} fontWeight={800} letterSpacing="-0.01em">
                {idx.map((w, j) => (
                  <tspan key={w} fill={w === 5 || w === 2 ? 'url(#pt-grad)' : C.text} opacity={0.25 + 0.75 * s.lit[w]}>
                    {(j ? ' ' : '') + QUOTE_WORDS[w].replace('“', '')}
                  </tspan>
                ))}
              </text>
            ))}
            <text x={184} y={722} fontSize={48} fontWeight={600} fill={C.muted} opacity={s.by}>
              — {QUOTE_BY}
            </text>
          </g>
        )}
      </g>
    </Canvas>
  );
};
