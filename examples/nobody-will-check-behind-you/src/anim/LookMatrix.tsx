import React from 'react';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { Stage, gradientText } from './Stage.tsx';
import { Dot, MONO, PackageBox, clamp01, lerp } from './pieces.tsx';
import { N, TAG_LINKS, frameState, type LookMatrixProps } from './LookMatrix.state.ts';

export { frameState };
export type { LookMatrixProps };

/** Grid geometry (stage px): row labels on the left, two columns of cells. */
const G = { x0: 190, y0: 200, cw: 340, ch: 300, gap: 12 } as const;
const cellX = (col: number) => G.x0 + col * (G.cw + G.gap);
const cellY = (row: number) => G.y0 + row * (G.ch + G.gap);
const POOL_Y = [60, 108];

/** Where run i waits before it falls (two rows of 15), and where it lands in its cell. */
const poolAt = (i: number): [number, number] => [230 + (i % 15) * 44, POOL_Y[Math.floor(i / 15)]];
const landAt = (col: number, row: number, k: number): [number, number] => [cellX(col) + 50 + (k % 6) * 48, cellY(row) + 70 + Math.floor(k / 6) * 48];

const Zero: React.FC<{ col: number; row: number; pop: number; flash: number }> = ({ col, row, pop, flash }) => {
  const p = clamp01(pop);
  if (p <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: cellX(col),
        top: cellY(row),
        width: G.cw,
        height: G.ch,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily,
        fontSize: 200,
        fontWeight: 800,
        lineHeight: 1,
        opacity: p,
        transform: `scale(${1.6 - 0.6 * p}) rotate(-6deg)`,
        filter: flash > 0 ? `drop-shadow(0 0 ${30 * flash}px ${alpha(C.accentText, 0.9)})` : undefined,
        ...gradientText,
      }}
    >
      0
    </div>
  );
};

export const LookMatrix: React.FC<AnimProps & LookMatrixProps> = ({ t, beats, dur, vertical, ...props }) => {
  const s = frameState(props as LookMatrixProps, t, beats, dur);
  const counters = new Map<string, number>();
  const placed = s.dots.map((d, i) => {
    const key = `${d.col}${d.row}`;
    const k = counters.get(key) ?? 0;
    counters.set(key, k + 1);
    const [x0, y0] = poolAt(i);
    const [x1, y1] = landAt(d.col, d.row, k);
    const f = clamp01(d.fall);
    const e = f * f;
    return { ...d, x: lerp(x0, x1, 1 - (1 - f) ** 2), y: lerp(y0, y1, e) };
  });
  const missed = placed.filter((d) => d.col === 1 && d.row === 1);
  const chip: [number, number] = [560, 990];
  const art: [number, number] = [120, 990];
  return (
    <Stage vertical={vertical} fill>
      <div style={{ position: 'absolute', inset: 0, fontFamily, color: C.text, opacity: s.grid }}>
        {/* Legend: the two arms. */}
        <div style={{ position: 'absolute', left: 0, top: 4, width: 960, display: 'flex', justifyContent: 'center', gap: 34, fontSize: 28, fontWeight: 700, color: C.muted }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 22, height: 22, borderRadius: 11, background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})` }} /> owner named
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 22, height: 22, borderRadius: 11, background: C.text }} /> no owner named
          </span>
        </div>
        {/* Column and row headers. */}
        {['opened the registry', 'didn’t open it'].map((h, c) => (
          <div key={h} style={{ position: 'absolute', left: cellX(c), top: G.y0 - 52, width: G.cw, textAlign: 'center', fontSize: 33, fontWeight: 800, color: c === 0 ? C.accentText : C.muted }}>
            {h}
          </div>
        ))}
        {['caught it', 'missed it'].map((h, r) => (
          <div key={h} style={{ position: 'absolute', left: 0, top: cellY(r), width: G.x0 - 18, height: G.ch, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', fontSize: 33, fontWeight: 800, color: r === 0 ? C.text : C.muted, textAlign: 'right' }}>
            {h}
          </div>
        ))}
        {[0, 1].map((c) =>
          [0, 1].map((r) => (
            <div
              key={`${c}${r}`}
              style={{
                position: 'absolute',
                left: cellX(c),
                top: cellY(r),
                width: G.cw,
                height: G.ch,
                borderRadius: 20,
                background: c === r ? alpha(C.accent, 0.08) : alpha(C.bg1, 0.7),
                border: `2px solid ${c === r ? alpha(C.accentText, 0.35) : C.line}`,
              }}
            />
          )),
        )}
        <Zero col={0} row={1} pop={s.zeros[0]} flash={s.zeroFlash[0]} />
        <Zero col={1} row={0} pop={s.zeros[1]} flash={s.zeroFlash[1]} />
        {/* Adjacent: the tag check most failures ran instead, linked to the missed runs. */}
        {s.links > 0 && (
          <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} width={1} height={1}>
            {missed.slice(0, TAG_LINKS).map((d, i) => {
              const f = clamp01(s.links);
              return <line key={i} x1={chip[0] + 40} y1={chip[1] - 30} x2={lerp(chip[0] + 40, d.x, f)} y2={lerp(chip[1] - 30, d.y, f)} stroke={alpha(C.muted, 0.7)} strokeWidth={3} strokeDasharray="6 8" />;
            })}
            {/* The tag says nothing about the artifact: the line to the box is cut. */}
            <line x1={chip[0] - 150} y1={chip[1]} x2={lerp(chip[0] - 150, art[0] + 90, clamp01(s.artifact))} y2={chip[1]} stroke={alpha(C.muted, 0.8)} strokeWidth={4} />
            {s.cut > 0 && (
              <g opacity={clamp01(s.cut)}>
                <rect x={(chip[0] - 150 + art[0] + 90) / 2 - 18} y={chip[1] - 26} width={36} height={52} fill={C.bg0} />
                <line x1={(chip[0] - 150 + art[0] + 90) / 2 - 22} y1={chip[1] + 22} x2={(chip[0] - 150 + art[0] + 90) / 2 - 6} y2={chip[1] - 22} stroke={C.text} strokeWidth={4} />
                <line x1={(chip[0] - 150 + art[0] + 90) / 2 + 6} y1={chip[1] + 22} x2={(chip[0] - 150 + art[0] + 90) / 2 + 22} y2={chip[1] - 22} stroke={C.text} strokeWidth={4} />
              </g>
            )}
          </svg>
        )}
        {placed.map((d, i) => (
          <Dot key={i} x={d.x} y={d.y} r={18} accent={d.owner} opacity={d.appear} />
        ))}
        {s.chip > 0 && (
          <div
            style={{
              position: 'absolute',
              left: chip[0] - 150,
              top: chip[1] - 40,
              width: 380,
              height: 80,
              borderRadius: 16,
              background: alpha(C.bg0, 0.95),
              border: `3px solid ${alpha(C.muted, 0.8)}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: s.chip,
              zIndex: 6,
            }}
          >
            <div style={{ fontSize: 32, fontWeight: 800, color: C.text }}>
              tag in origin <span style={{ color: C.ok }}>✓</span>
            </div>
            <div style={{ fontFamily: MONO, fontSize: 20, color: C.muted }}>git ls-remote</div>
          </div>
        )}
        <PackageBox x={art[0]} floor={art[1] + 60} w={150} h={110} label="0.4.0" inside="" lid={0} rise={0} opacity={s.artifact} />
        <div style={{ position: 'absolute', left: 0, top: 1052, width: 860, textAlign: 'center', fontSize: 30, fontWeight: 700, color: C.text, opacity: s.nothing, zIndex: 7 }}>
          says nothing about the artifact
        </div>
        {/* Banner: 30 of 30. */}
        {s.banner > 0 && (
          <div style={{ position: 'absolute', left: 0, top: 860, width: 960, display: 'flex', justifyContent: 'center', opacity: s.banner, zIndex: 8 }}>
            <div
              style={{
                padding: '12px 40px',
                borderRadius: 20,
                background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})`,
                fontSize: 64,
                fontWeight: 800,
                color: C.text,
                transform: `scale(${(1 + s.bannerZoom * 0.3 * (1 - s.banner)) * (1 + 0.05 * s.bannerFlash)})`,
                boxShadow: `0 0 ${50 * s.bannerFlash}px ${alpha(C.accentText, 0.9)}`,
              }}
            >
              {N} of {N}
            </div>
          </div>
        )}
      </div>
    </Stage>
  );
};
