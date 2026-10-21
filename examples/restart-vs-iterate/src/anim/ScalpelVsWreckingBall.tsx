import React from 'react';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { frameState, PIVOT, SPLIT, STRONG_CHIPS, STRONG_TICKS, WEAK_CHIPS, WEAK_TICKS, type SideState, type SplitProps } from './ScalpelVsWreckingBall.state.ts';
import { Dial, RestartButton, Scalpel, Stamp, Tower, WreckingBall } from './pieces.tsx';

export { frameState };

const base: React.CSSProperties = { position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, fontFamily, color: C.text };

const HALF = [
  { left: 60, w: 460 },
  { left: 560, w: 460 },
];

const ROWS = {
  strong: [
    { label: 'iterate', results: STRONG_CHIPS.iterate },
    { label: 'with the button', results: STRONG_CHIPS.button },
  ],
  weak: [
    { label: 'with the button', results: WEAK_CHIPS.button },
    { label: 'iterate', results: WEAK_CHIPS.iterate },
  ],
};

const Side: React.FC<{ k: 0 | 1; s: SideState }> = ({ k, s }) => {
  const g = k === 0 ? SPLIT.left : SPLIT.right;
  const half = HALF[k];
  const kinds = k === 0 ? STRONG_TICKS : WEAK_TICKS;
  const rows = k === 0 ? ROWS.strong : ROWS.weak;
  const total = kinds.length;
  const blockY = (idx: number) => SPLIT.base - (idx + 1) * (SPLIT.h + SPLIT.gap) + SPLIT.h / 2;
  // Ticks: one row of 7 (strong) or two rows of 17 (weak).
  const perRow = k === 0 ? 7 : 17;
  const tw = k === 0 ? 44 : 20;
  const th = k === 0 ? 22 : 16;
  const tg = k === 0 ? 12 : 5;
  const rowW = perRow * tw + (perRow - 1) * tg;
  const chipW = k === 0 ? 70 : 22;
  const chipG = k === 0 ? 16 : 6;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: s.presence }}>
      <div style={{ position: 'absolute', left: half.left, width: half.w, top: 380, textAlign: 'center', fontSize: 50, fontWeight: 800, letterSpacing: '0.05em', color: s.active ? C.accentText : C.text, opacity: s.header }}>
        {k === 0 ? 'STRONG' : 'WEAK'}
      </div>
      <div style={{ position: 'absolute', left: half.left, width: half.w, top: 440, textAlign: 'center', fontSize: 32, fontWeight: 600, color: C.muted, opacity: s.header }}>
        {k === 0 ? 'gpt-5.4' : 'gpt-5.4-mini'}
      </div>
      <Tower x={g.tower} base={SPLIT.base} w={SPLIT.w} h={SPLIT.h} gap={SPLIT.gap} blocks={s.blocks} opacity={s.header} />
      {s.scalpel.opacity > 0 && (
        <div style={{ position: 'absolute', left: g.tower + SPLIT.w / 2 - 10 - 30 * s.scalpel.slide, top: blockY(s.scalpel.idx) - 18, opacity: s.scalpel.opacity }}>
          <Scalpel size={90} colour={C.accentText} style={{ transform: 'scaleX(-1)' }} />
        </div>
      )}
      <RestartButton x={g.button} y={560} r={50} pop={s.button} />
      <Dial x={g.button} y={624} active={s.dial} opacity={s.dialPop} size={29} step={40} colours={[C.accentText, C.accentText, C.flat]} />
      {k === 1 && s.ball.opacity > 0 && <WreckingBall px={PIVOT.x} py={PIVOT.y} len={PIVOT.len} angle={s.ball.angle} r={PIVOT.r} opacity={s.ball.opacity * s.header} />}
      {/* Restart ticks */}
      {kinds.map((kind, i) => {
        const r = Math.floor(i / perRow);
        const c = i % perRow;
        const x = half.left + (half.w - rowW) / 2 + c * (tw + tg);
        const y = 808 + r * (th + 8);
        const pop = s.ticks[i] ?? 0;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: tw,
              height: th,
              borderRadius: th / 2,
              background: kind === 'f' ? C.accentText : C.flat,
              opacity: pop,
              transform: `translateY(${(1 - pop) * -30}px)`,
            }}
          />
        );
      })}
      <div style={{ position: 'absolute', left: half.left - 10, width: half.w + 20, top: 862, textAlign: 'center', fontSize: k === 0 ? 33 : 31, fontWeight: 800, whiteSpace: 'nowrap', opacity: s.count > 0 ? 1 : 0 }}>
        <span>
          {s.count} restart{s.count === 1 ? '' : 's'}
        </span>
        <span style={{ opacity: s.readout }}>
          {' · '}
          {k === 0 ? <span style={{ color: C.accentText }}>5 one file</span> : <span style={{ color: C.flat }}>23 everything</span>}
        </span>
      </div>
      {/* Feature chips */}
      {s.rows.map((row, ri) => {
        const spec = rows[ri];
        const y = 948 + ri * 122;
        const n = spec.results.length;
        const W = n * chipW + (n - 1) * chipG;
        const solved = spec.results.reduce((a, b) => a + b, 0);
        const shown = row.appear.some((a) => a > 0);
        if (!shown) return null;
        return (
          <React.Fragment key={ri}>
            <div style={{ position: 'absolute', left: half.left + (half.w - W) / 2, width: W, top: y, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', opacity: Math.max(...row.appear) }}>
              <span style={{ fontSize: 31, fontWeight: 700, color: C.muted, whiteSpace: 'nowrap' }}>{spec.label}</span>
              <span style={{ fontSize: 42, fontWeight: 800, color: solved > n / 2 ? C.ok : C.flat, opacity: row.score, whiteSpace: 'nowrap' }}>
                {solved}/{n}
              </span>
            </div>
            {spec.results.map((_, ci) => {
              const a = row.appear[ci];
              const ok = row.solved[ci];
              return (
                <div
                  key={ci}
                  style={{
                    position: 'absolute',
                    left: half.left + (half.w - W) / 2 + ci * (chipW + chipG),
                    top: y + 50,
                    width: chipW,
                    height: 48,
                    borderRadius: 10,
                    background: alpha(C.flat, 0.85),
                    opacity: a * (spec.results[ci] ? 1 : 1 - 0.5 * s.lost),
                    transform: `scale(${0.6 + 0.4 * a})`,
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ position: 'absolute', inset: 0, background: C.ok, opacity: ok }} />
                </div>
              );
            })}
          </React.Fragment>
        );
      })}
      {k === 1 && s.lost > 0 && (
        <div
          style={{
            position: 'absolute',
            left: half.left + 10,
            width: half.w - 20,
            top: 1180,
            height: 62,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            clipPath: `inset(0 ${(1 - s.lost) * 100}% 0 0)`,
          }}
        >
          <div style={{ padding: '4px 22px', borderRadius: 12, background: alpha(C.bg0, 0.88), boxShadow: `inset 0 0 0 4px ${C.flat}`, fontSize: 40, fontWeight: 800, color: C.flat, whiteSpace: 'nowrap' }}>already lost</div>
        </div>
      )}
      {s.stamp > 0 && (
        <div style={{ position: 'absolute', left: half.left, width: half.w, top: k === 0 ? 1180 : 1256, display: 'flex', justifyContent: 'center' }}>
          {k === 0 ? (
            <Stamp text="n = 4 · a hint" colour={C.warm} pop={s.stamp} size={38} dashed />
          ) : (
            <Stamp text="symptom, not cause" colour={C.text} pop={s.stamp} size={34} angle={-3} />
          )}
        </div>
      )}
    </div>
  );
};

export const ScalpelVsWreckingBall: React.FC<AnimProps & SplitProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  return (
    <div style={base}>
      <div style={{ position: 'absolute', left: 539, top: 390, width: 3, height: 900, background: alpha(C.muted, 0.25) }} />
      <Side k={0} s={s.sides[0]} />
      <Side k={1} s={s.sides[1]} />
    </div>
  );
};
