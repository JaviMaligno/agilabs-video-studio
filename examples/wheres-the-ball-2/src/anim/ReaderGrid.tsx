import React from 'react';
import { C, GRADIENT, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { CHANCE, frameState, type GridProps } from './ReaderGrid.state.ts';
import { Tick } from './pitchParts.tsx';
import { gradientText, stageOf } from './Stage.tsx';

export { frameState };
export type { GridProps };

// Layout in stage pixels (vertical stage: 960 x 1090).
const BAND_H = 120;
const HEAD_Y = 128;
const ROW_Y = [188, 556];
const LABEL_H = 52;
const CELL_H = 304;
const GAP = 30;
const BOTTOM_Y = 916;
const ICON = { w: 160, h: 108 };
const PAD = 20;

const ROW_LABELS = ['Trained for this task', 'Frontier AI · zero-shot'];
const HEADERS = ['TV pixels', 'Player tracks'];

/** A broadcast frame with the ball painted out: pitch stripes, a few players, a "?" where it was. */
const PixelsIcon: React.FC<{ w: number; h: number }> = ({ w, h }) => (
  <svg width={w} height={h} viewBox="0 0 130 88" style={{ display: 'block' }}>
    <rect x={1.5} y={1.5} width={127} height={85} rx={10} fill={C.bg1} stroke={alpha(C.muted, 0.7)} strokeWidth={3} />
    {[0, 1, 2, 3, 4].map((i) => (
      <rect key={i} x={4 + i * 25} y={4} width={12} height={80} fill={alpha(C.card, 0.9)} />
    ))}
    <path d="M30 4 L18 84 M100 4 L112 84" stroke={alpha(C.muted, 0.35)} strokeWidth={2} />
    {[
      [30, 50],
      [48, 34],
      [60, 60],
      [84, 44],
      [96, 66],
    ].map(([x, y], i) => (
      <g key={i}>
        <circle cx={x} cy={y - 7} r={3.4} fill={i % 2 ? C.text : C.accentText} />
        <rect x={x - 3} y={y - 4} width={6} height={11} rx={2} fill={i % 2 ? C.text : C.accentText} />
      </g>
    ))}
    <circle cx={74} cy={24} r={11} fill={C.bg0} stroke={C.accentText} strokeWidth={2.5} />
    <text x={74} y={29.5} textAnchor="middle" fontSize={16} fontWeight={800} fill={C.accentText} fontFamily="Inter, sans-serif">
      ?
    </text>
  </svg>
);

/** Player tracks: dots with one-second trails, no pixels. */
const TracksIcon: React.FC<{ w: number; h: number }> = ({ w, h }) => (
  <svg width={w} height={h} viewBox="0 0 130 88" style={{ display: 'block' }}>
    <rect x={1.5} y={1.5} width={127} height={85} rx={10} fill={C.bg0} stroke={alpha(C.muted, 0.7)} strokeWidth={3} />
    {[
      [22, 62, 40, 48],
      [34, 30, 52, 30],
      [58, 70, 70, 56],
      [70, 22, 90, 28],
      [86, 64, 104, 54],
      [100, 38, 116, 34],
    ].map(([x0, y0, x1, y1], i) => (
      <g key={i}>
        <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={alpha(i % 2 ? C.text : C.accentText, 0.45)} strokeWidth={3} strokeLinecap="round" />
        <circle cx={x1} cy={y1} r={5} fill={i % 2 ? C.text : C.accentText} />
      </g>
    ))}
  </svg>
);

export const ReaderGrid: React.FC<AnimProps & GridProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const S = stageOf(p.vertical);
  const W = S.w;
  const cellW = (W - GAP) / 2;
  const colX = [0, cellW + GAP];
  const meterW = cellW - 2 * PAD;

  return (
    <div style={{ position: 'absolute', left: S.side, top: S.top, width: W, height: S.h, fontFamily, color: C.text }}>
      {/* Band: axis titles, then the question, then "the information is there". */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: W,
          height: BAND_H,
          borderRadius: 22,
          background: alpha(C.card, 0.8),
          border: `2px solid ${alpha(C.muted, 0.18)}`,
        }}
      >
        <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 46, fontWeight: 800, letterSpacing: '0.04em', whiteSpace: 'nowrap', opacity: Math.max(s.band.whoReads, s.band.whatRead) }}>
          <span>WHO READS</span>
          {/* Unfolds from zero width, so "WHO READS" slides left rather than jumping. */}
          <span style={{ display: 'inline-block', overflow: 'hidden', maxWidth: 520 * s.band.grow, opacity: s.band.grow }}>
            <span style={{ color: C.muted, margin: '0 22px' }}>×</span>
            WHAT GETS READ
          </span>
        </div>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 0 }}>
          <div style={{ opacity: s.band.q1, fontSize: 34, fontWeight: 600, color: C.muted }}>Hard cases · ball far from the centre</div>
          <div style={{ opacity: s.band.q2, fontSize: 52, fontWeight: 800, lineHeight: 1.15 }}>Beats pointing at the middle?</div>
        </div>
        {s.band.info > 0 && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, opacity: s.band.info, fontSize: 54, fontWeight: 800 }}>
            The information is there
            <Tick size={58} color={C.accentText} draw={s.band.info} />
          </div>
        )}
      </div>

      {/* Column headers. */}
      {HEADERS.map((h, c) => (
        <div
          key={h}
          style={{
            position: 'absolute',
            left: colX[c],
            top: HEAD_Y,
            width: cellW,
            display: 'flex',
            justifyContent: 'center',
            opacity: s.headers[c].opacity * (1 - 0.5 * s.verdict.input),
            transform: `translateY(${(1 - s.headers[c].opacity) * 16}px)`,
          }}
        >
          {/* In the verdict the input is struck out: it barely matters. */}
          <span style={{ position: 'relative', fontSize: 46, fontWeight: 800, color: s.verdict.input > 0 ? C.muted : C.text }}>
            {h}
            {s.verdict.strike > 0 && (
              <span style={{ position: 'absolute', left: -8, top: '54%', height: 6, borderRadius: 3, width: `calc(${s.verdict.strike * 100}% + 16px)`, background: C.text }} />
            )}
          </span>
        </div>
      ))}

      {/* Rows: label strip + two cells. */}
      {[0, 1].map((r) => {
        const row = s.rows[r];
        const dim = r === 1 ? 1 - s.verdict.dim : 1;
        return (
          <div key={r} style={{ position: 'absolute', left: 0, top: ROW_Y[r], width: W, height: LABEL_H + CELL_H, opacity: row.opacity * dim }}>
            <div
              style={{
                position: 'absolute',
                left: 4,
                top: 0,
                height: LABEL_H,
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                fontSize: 42,
                fontWeight: 800,
                color: r === 0 ? C.accentText : C.muted,
              }}
            >
              <span style={{ width: 16, height: 16, borderRadius: 8, background: r === 0 ? GRADIENT : C.muted, display: 'inline-block' }} />
              <span style={row.lit > 0.5 ? gradientText : undefined}>{ROW_LABELS[r]}</span>
            </div>
            {s.cells
              .filter((c) => c.row === r)
              .map((c) => {
                const lit = r === 0 ? s.verdict.training : 0;
                const ring = r === 0 && c.col === 1 ? s.verdict.info * (1 - s.verdict.training) : 0;
                const figSize = c.text.length > 4 ? 66 : r === 1 && c.col === 0 ? 82 : 92;
                return (
                  <div
                    key={c.col}
                    style={{
                      position: 'absolute',
                      left: colX[c.col],
                      top: LABEL_H,
                      width: cellW,
                      height: CELL_H,
                      borderRadius: 22,
                      background: alpha(C.card, 0.9),
                      border: `${2 + 2 * Math.max(lit, ring)}px solid ${lit > 0 || ring > 0 ? alpha(C.accentText, 0.35 + 0.6 * Math.max(lit, ring)) : alpha(C.muted, 0.22)}`,
                      boxShadow: lit > 0 || ring > 0 ? `0 0 ${50 * Math.max(lit, ring)}px ${alpha(C.accent, 0.55 * Math.max(lit, ring))}` : undefined,
                    }}
                  >
                    {/* Who reads it. */}
                    <div
                      style={{
                        position: 'absolute',
                        left: PAD,
                        top: 16,
                        padding: '3px 14px',
                        borderRadius: 999,
                        border: `2px solid ${r === 0 ? alpha(C.accentText, 0.6) : alpha(C.muted, 0.5)}`,
                        background: r === 0 ? alpha(C.accent, 0.18) : alpha(C.bg0, 0.6),
                        fontSize: 28,
                        fontWeight: 700,
                        color: r === 0 ? C.text : C.muted,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {c.chip}
                    </div>
                    {c.check > 0 && (
                      <div
                        style={{
                          position: 'absolute',
                          right: 14,
                          top: 12,
                          width: 50,
                          height: 50,
                          borderRadius: 25,
                          background: GRADIENT,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transform: `scale(${0.6 + 0.4 * c.check})`,
                          opacity: c.check,
                        }}
                      >
                        <Tick size={34} draw={c.check} color={C.text} stroke={3.8} />
                      </div>
                    )}
                    {/* What it reads. */}
                    <div style={{ position: 'absolute', left: PAD, top: 70, opacity: c.icon }}>
                      {c.col === 0 ? <PixelsIcon w={ICON.w} h={ICON.h} /> : <TracksIcon w={ICON.w} h={ICON.h} />}
                    </div>
                    {/* The figure (and the coin beside 53%). */}
                    <div
                      style={{
                        position: 'absolute',
                        left: PAD + ICON.w + 12,
                        right: 14,
                        top: 70,
                        height: ICON.h,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: 14,
                        opacity: c.figure,
                      }}
                    >
                      <span
                        style={{
                          fontSize: figSize,
                          fontWeight: 800,
                          letterSpacing: '-0.03em',
                          lineHeight: 1,
                          fontVariantNumeric: 'tabular-nums',
                          whiteSpace: 'nowrap',
                          ...(r === 0 ? gradientText : { color: C.text }),
                        }}
                      >
                        {c.text}
                      </span>
                      {r === 1 && c.col === 0 && s.coin.opacity > 0 && (
                        <div
                          style={{
                            width: 56,
                            height: 56,
                            flex: 'none',
                            borderRadius: 28,
                            opacity: s.coin.opacity,
                            transform: `scaleX(${Math.max(0.06, Math.abs(Math.cos(s.coin.turns * Math.PI)))})`,
                            background: `radial-gradient(circle at 35% 30%, ${C.text}, ${C.muted})`,
                            border: `4px solid ${alpha(C.text, 0.6)}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 30,
                            fontWeight: 800,
                            color: C.bg0,
                          }}
                        >
                          {Math.cos(s.coin.turns * Math.PI) >= 0 ? 'H' : 'T'}
                        </div>
                      )}
                    </div>
                    {/* The meter, with its dashed coin-flip line. */}
                    <div style={{ position: 'absolute', left: PAD, top: 192, width: meterW, height: 90, opacity: c.meter }}>
                      <div style={{ position: 'absolute', left: (meterW * CHANCE) / 100, top: 0, transform: 'translateX(-50%)', fontSize: 28, fontWeight: 600, color: C.muted, whiteSpace: 'nowrap' }}>
                        coin flip
                      </div>
                      <div style={{ position: 'absolute', left: 0, top: 44, width: meterW, height: 30, borderRadius: 15, background: alpha(C.muted, 0.18), overflow: 'hidden' }}>
                        <div
                          style={{
                            width: (meterW * c.value * c.fill) / 100,
                            height: '100%',
                            borderRadius: 15,
                            background: r === 0 ? GRADIENT : alpha(C.text, 0.6),
                          }}
                        />
                      </div>
                      <svg width={10} height={50} style={{ position: 'absolute', left: (meterW * CHANCE) / 100 - 5, top: 34 }}>
                        <line x1={5} y1={0} x2={5} y2={50} stroke={C.text} strokeWidth={4} strokeDasharray="7 5" />
                      </svg>
                    </div>
                  </div>
                );
              })}
          </div>
        );
      })}

      {/* "below chance": right end of the frontier row's label strip, over the tracks cell. */}
      {s.below.opacity > 0 && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: ROW_Y[1] + (LABEL_H - 46) / 2,
            opacity: s.below.opacity * (1 - s.verdict.dim),
            padding: '4px 18px',
            borderRadius: 12,
            background: C.text,
            color: C.bg0,
            fontSize: 32,
            fontWeight: 800,
            whiteSpace: 'nowrap',
            transform: `scale(${1.2 - 0.2 * s.below.opacity})`,
          }}
        >
          below chance
        </div>
      )}

      {/* Footnotes. */}
      <div style={{ position: 'absolute', left: 0, top: BOTTOM_Y + 20, width: W, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        {s.notes[0].opacity > 0 && (
          <div style={{ opacity: s.notes[0].opacity, padding: '6px 22px', borderRadius: 14, background: alpha(C.card, 0.95), border: `2px solid ${alpha(C.muted, 0.35)}`, fontSize: 32, fontWeight: 700 }}>
            Tracks = ground truth · a ceiling
          </div>
        )}
        {s.notes[1].opacity > 0 && (
          <div
            style={{
              opacity: s.notes[1].opacity,
              maxWidth: W,
              padding: '6px 22px',
              borderRadius: 14,
              background: alpha(C.card, 0.95),
              border: `2px solid ${alpha(C.muted, 0.35)}`,
              fontSize: 32,
              fontWeight: 600,
              textAlign: 'center',
              lineHeight: 1.25,
              color: C.text,
              textWrap: 'balance',
            }}
          >
            Easy, centred balls: frontier more precise
            <br />
            <span style={{ color: C.muted }}>0.147 vs 0.195–0.210 median error</span>
          </div>
        )}
      </div>

      {/* The verdict, in the footnotes' place. */}
      <div style={{ position: 'absolute', left: 0, top: BOTTOM_Y, width: W, height: S.h - BOTTOM_Y, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
        <div style={{ opacity: s.verdict.training, transform: `scale(${1.25 - 0.25 * s.verdict.training})`, fontSize: 68, fontWeight: 800, lineHeight: 1.1 }}>
          <span style={gradientText}>Training</span> matters.
        </div>
        <div style={{ opacity: s.verdict.input, transform: `scale(${1.25 - 0.25 * s.verdict.input})`, fontSize: 68, fontWeight: 800, lineHeight: 1.1 }}>
          The input <span style={gradientText}>barely</span> does.
        </div>
      </div>
    </div>
  );
};
