import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, GRADIENT, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { gradientText } from './Stage.tsx';
import {
  BLOCKS,
  DOUBLE_ROWS,
  GRID,
  HEAD,
  LOWER,
  PASSES,
  FLIP_COLS,
  SINGLE_ROW,
  TEXT,
  ZONE_H,
  centerX,
  frameState,
  type BoxState,
  type ClosedBoxProps,
  type RowState,
} from './ClosedBox.state.ts';

export { frameState };
export type { ClosedBoxProps };

const MONO = "ui-monospace, Menlo, 'SF Mono', monospace";
const abs = (left: number, top: number, extra: React.CSSProperties = {}): React.CSSProperties => ({ position: 'absolute', left, top, ...extra });
const kicker: React.CSSProperties = { fontSize: 26, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted, whiteSpace: 'nowrap' };
const rise = (p: number, d = 24): React.CSSProperties => ({ opacity: Math.min(1, p * 1.2), transform: `translateY(${(1 - p) * d}px)` });

type Geo = { header: number; top: number; h: number; zone: number };

// ---------------------------------------------------------------- glyphs

const Chip: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size * 1.3} height={size} viewBox="0 0 52 40" style={{ display: 'block' }}>
    {[8, 18, 28].map((y) => (
      <React.Fragment key={y}>
        <rect x={0} y={y} width={7} height={4} rx={1} fill={C.accentText} />
        <rect x={45} y={y} width={7} height={4} rx={1} fill={C.accentText} />
      </React.Fragment>
    ))}
    <rect x={6} y={2} width={40} height={36} rx={6} fill={C.accent} stroke={C.accentText} strokeWidth={2} />
    <text x={26} y={26} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={15} fill={C.text}>
      LM
    </text>
  </svg>
);

const Tree: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={{ display: 'block' }}>
    <rect x={18} y={24} width={4} height={14} rx={1} fill={C.muted} />
    <circle cx={20} cy={15} r={11} fill={alpha(C.accent2, 0.85)} stroke={C.accentText} strokeWidth={2} />
    <circle cx={12} cy={22} r={7} fill={alpha(C.accent2, 0.85)} stroke={C.accentText} strokeWidth={2} />
    <circle cx={28} cy={22} r={7} fill={alpha(C.accent2, 0.85)} stroke={C.accentText} strokeWidth={2} />
  </svg>
);

const Die: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={{ display: 'block', flex: 'none' }}>
    <rect x={3} y={3} width={34} height={34} rx={8} fill="none" stroke={color} strokeWidth={3.5} />
    {[
      [12, 12],
      [28, 12],
      [20, 20],
      [12, 28],
      [28, 28],
    ].map(([x, y]) => (
      <circle key={`${x}-${y}`} cx={x} cy={y} r={3.4} fill={color} />
    ))}
  </svg>
);

const Wrench: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={{ display: 'block', flex: 'none' }}>
    <path d="M27 5 a9 9 0 0 0 -8 12 L6 30 a3.5 3.5 0 0 0 5 5 L24 22 a9 9 0 0 0 12 -8 l-6 4 -5 -2 -1 -5 z" fill="none" stroke={color} strokeWidth={3.2} strokeLinejoin="round" />
  </svg>
);

const Lock: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block' }}>
    <rect x={4} y={10.5} width={16} height={11} rx={2.5} fill={color} />
    <path d="M8 10.5 V7.5 a4 4 0 0 1 8 0 V10.5" fill="none" stroke={color} strokeWidth={2.4} />
  </svg>
);

const Magnifier: React.FC<{ x: number; y: number; opacity: number }> = ({ x, y, opacity }) =>
  opacity <= 0 ? null : (
    <svg width={160} height={160} viewBox="0 0 160 160" style={abs(x - 56, y - 72, { opacity, zIndex: 4, overflow: 'visible' })}>
      <circle cx={56} cy={56} r={38} fill={alpha(C.warm, 0.1)} stroke={C.warm} strokeWidth={8} />
      <line x1={84} y1={84} x2={116} y2={116} stroke={C.warm} strokeWidth={13} strokeLinecap="round" />
    </svg>
  );

const Stamp: React.FC<{ text: string; pop: number; color: string; size: number; rotate?: number; style?: React.CSSProperties }> = ({ text, pop, color, size, rotate = -6, style }) =>
  pop <= 0 ? null : (
    <div
      style={{
        padding: '6px 22px',
        border: `6px solid ${color}`,
        borderRadius: 14,
        color,
        background: alpha(C.bg0, 0.9),
        fontSize: size,
        fontWeight: 800,
        letterSpacing: '0.06em',
        whiteSpace: 'nowrap',
        lineHeight: 1.1,
        opacity: Math.min(1, pop * 1.4),
        transform: `rotate(${rotate}deg) scale(${1.8 - 0.8 * pop})`,
        ...style,
      }}
    >
      {text}
    </div>
  );

// ---------------------------------------------------------------- the pipeline

const Block: React.FC<{ i: number; g: Geo; r: RowState; children?: React.ReactNode }> = ({ i, g, r, children }) => {
  const b = BLOCKS[i];
  const glow = i < 3 ? r.glow[i] : 0;
  const border = glow > 0 ? C.ok : r.glass > 0.5 ? C.accentText : alpha(C.muted, 0.55);
  return (
    <div
      style={abs(b.x, g.top, {
        width: b.w,
        height: g.h,
        borderRadius: 16,
        boxSizing: 'border-box',
        background: r.glass > 0 ? alpha(C.accentText, 0.06 + 0.04 * (1 - r.glass)) : C.card,
        border: `3px ${r.glass > 0.5 && i !== 3 ? 'dashed' : 'solid'} ${border}`,
        boxShadow: glow > 0 ? `0 0 ${36 * glow}px ${alpha(C.ok, 0.75 * glow)}` : 'none',
        overflow: i === 3 ? 'visible' : 'hidden',
      })}
    >
      {i !== 3 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 8, textAlign: 'center', fontSize: i === 0 ? 23 : 25, fontWeight: 800, color: glow > 0.5 ? C.ok : C.text, whiteSpace: 'nowrap', opacity: i === 4 ? 1 - Math.min(1, r.damper * 2) : 1 }}>{b.label}</div>
      )}
      {children}
    </div>
  );
};

const Cover: React.FC<{ i: number; g: Geo; cover: number }> = ({ i, g, cover }) => {
  if (cover <= 0) return null;
  const b = BLOCKS[i];
  return (
    <div
      style={abs(b.x, g.top, {
        width: b.w,
        height: g.h,
        borderRadius: 16,
        opacity: cover,
        background: `repeating-linear-gradient(135deg, ${alpha('#2a2a36', 1)} 0 14px, ${alpha('#22222c', 1)} 14px 28px)`,
        border: `3px solid ${alpha(C.muted, 0.45)}`,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        zIndex: 2,
      })}
    >
      <div style={{ fontSize: 25, fontWeight: 800, color: C.muted }}>{b.label}</div>
      <Lock size={34} color={alpha(C.muted, 0.9)} />
    </div>
  );
};

const Pipeline: React.FC<{ r: RowState; g: Geo; clk: number; double: boolean }> = ({ r, g, clk, double }) => {
  const beltY = g.top + g.h + 12;
  const midY = g.top + g.h / 2;
  const headCx = centerX(3);
  const chipSize = double ? 44 : 52;
  const restY = g.top + (double ? 20 : 26);
  // The model chip: in the head, lifted out over it, then set aside (swap).
  const lifted = { x: headCx, y: g.top - 78 };
  const aside = { x: 250, y: 830 };
  const chipPos =
    r.aside > 0
      ? { x: lifted.x + (aside.x - lifted.x) * r.aside, y: lifted.y + (aside.y - lifted.y) * r.aside }
      : { x: headCx, y: restY + chipSize / 2 + (lifted.y - restY - chipSize / 2) * r.lift };
  const name = r.drop > 0.5 ? 'forest' : r.content === 'model' && r.lift < 0.5 ? 'model' : '';
  const steady = 1 - r.wobble;
  return (
    <>
      {/* conveyor belt */}
      <div
        style={abs(60, beltY, {
          width: 862,
          height: 10,
          borderRadius: 5,
          background: `repeating-linear-gradient(90deg, ${alpha(C.muted, 0.55)} 0 22px, ${alpha(C.muted, 0.15)} 22px 40px)`,
          backgroundPosition: `${(clk * 70) % 40}px 0`,
          opacity: r.opacity,
        })}
      />
      <div style={{ position: 'absolute', inset: 0, opacity: r.opacity }}>
        {/* arrows between blocks */}
        {BLOCKS.slice(0, 4).map((b, i) => (
          <svg key={b.id} width={18} height={30} viewBox="0 0 18 30" style={abs(b.x + b.w, midY - 15)}>
            <path d="M4 5 L13 15 L4 25" fill="none" stroke={alpha(C.muted, 0.8)} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ))}
        {/* documents */}
        <Block i={0} g={g} r={r}>
          {[0, 1, 2].map((k) => (
            <div key={k} style={abs(42 + k * 12, (double ? 44 : 50) + k * 8, { width: 46, height: double ? 50 : 60, borderRadius: 6, background: k === 2 ? C.text : alpha(C.text, 0.55 + 0.15 * k), border: `2px solid ${C.bg1}` })}>
              {k === 2 && [0, 1, 2].map((l) => <div key={l} style={abs(8, 12 + l * 11, { width: 30 - (l === 2 ? 10 : 0), height: 4, borderRadius: 2, background: alpha(C.bg0, 0.4) })} />)}
            </div>
          ))}
        </Block>
        {/* search: three tied documents, reordered on every pass (the fault) */}
        <Block i={1} g={g} r={r}>
          {[0, 1, 2].map((k) => {
            const tint = [C.accentText, C.accent2, C.ok][k];
            return (
              <div
                key={k}
                style={abs(16 + r.docSlots[k] * 38, double ? 48 : 56, {
                  width: 32,
                  height: double ? 42 : 50,
                  borderRadius: 5,
                  background: alpha(C.text, 0.85),
                  borderTop: `8px solid ${tint}`,
                  boxShadow: r.shuffle > 0 ? `0 0 ${14 * r.shuffle}px ${alpha(C.ok, 0.9 * r.shuffle)}` : 'none',
                })}
              />
            );
          })}
        </Block>
        {/* context */}
        <Block i={2} g={g} r={r}>
          {[0, 1, 2].map((l) => (
            <div key={l} style={abs(22, (double ? 52 : 60) + l * 16, { width: [104, 90, 64][l], height: 7, borderRadius: 4, background: alpha(C.muted, 0.55) })} />
          ))}
        </Block>
        <Cover i={1} g={g} cover={r.cover} />
        <Cover i={2} g={g} cover={r.cover} />
        {/* the head: a box with a lid */}
        <Block i={3} g={g} r={r}>
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: double ? 6 : 10, textAlign: 'center', fontSize: 26, fontWeight: 800, color: C.text }}>{name}</div>
        </Block>
        {r.drop > 0 && (
          <div style={abs(headCx - chipSize * 0.6, restY - 150 * (1 - r.drop) - 6, { opacity: Math.min(1, r.drop * 1.5), zIndex: 1 })}>
            <Tree size={chipSize * 1.2} />
          </div>
        )}
        {r.content === 'model' && (
          <div style={abs(chipPos.x - chipSize * 0.65, chipPos.y - chipSize / 2, { zIndex: 3, transform: `scale(${1 + 0.35 * r.aside})`, opacity: 1 - 0.35 * r.aside })}>
            <Chip size={chipSize} />
          </div>
        )}
        {r.aside > 0 && (
          <div style={abs(110, aside.y + 46, { width: 280, textAlign: 'center', fontSize: 28, fontWeight: 800, color: C.muted, opacity: r.aside })}>language model</div>
        )}
        <div
          style={abs(HEAD.x - 5, g.top - 16, {
            width: HEAD.w + 10,
            height: 18,
            borderRadius: 6,
            background: alpha(C.muted, 0.9),
            transformOrigin: '0% 100%',
            transform: `translateY(${-58 * r.lid}px) rotate(${-24 * r.lid}deg)`,
            zIndex: 2,
          })}
        />
        {/* label: wobbles between passes until a damper clamps it */}
        <Block i={4} g={g} r={r}>
          <div
            style={abs(18, double ? 50 : 58, {
              width: 104,
              height: double ? 46 : 52,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              fontWeight: 800,
              background: alpha(C.accent, 0.18),
              border: `3px solid ${r.wobble > 0.5 ? C.marker : alpha(C.accentText, 0.6 + 0.4 * steady)}`,
              boxSizing: 'border-box',
            })}
          >
            {r.labelText}
          </div>
        </Block>
        {r.damper > 0 && <Damper g={g} p={r.damper} scale={r.damperScale} />}
        {r.notCause > 0 && (
          <div style={abs(HEAD.x - 40, midY - 34, { width: HEAD.w + 80, display: 'flex', justifyContent: 'center', zIndex: 5 })}>
            <Stamp text={TEXT.notCause.toUpperCase()} pop={r.notCause} color={C.text} size={34} rotate={-8} />
          </div>
        )}
        {r.calledRandom > 0 && (
          <div style={abs(HEAD.x - 60, midY - 40, { width: 470, display: 'flex', justifyContent: 'center', zIndex: 6 })}>
            <Stamp text={TEXT.stamp2} pop={r.calledRandom} color={C.marker} size={52} rotate={-8} />
          </div>
        )}
      </div>
      <Magnifier {...r.magnifier} />
    </>
  );
};

/** The damper: a clamp bolted round the label block, with a vote tab and a temperature knob turned down. */
const Damper: React.FC<{ g: Geo; p: number; scale: number }> = ({ g, p, scale }) => {
  const b = BLOCKS[4];
  const pad = 9;
  return (
    <div
      style={abs(b.x - pad, g.top - pad, {
        width: b.w + 2 * pad,
        height: g.h + 2 * pad,
        borderRadius: 20,
        border: `7px solid ${C.marker}`,
        boxSizing: 'border-box',
        opacity: Math.min(1, p * 1.4),
        transform: `scale(${(1.35 - 0.35 * p) * scale})`,
        zIndex: 4,
      })}
    >
      <div style={abs(-7, -7, { width: b.w + 2 * pad, height: 34, borderRadius: '18px 18px 0 0', background: C.marker, color: C.bg0, fontSize: 19, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: '0.04em' })}>
        VOTE · TEMP ↓
      </div>
      <svg width={44} height={44} viewBox="0 0 44 44" style={abs(-34, g.h / 2 - 14)}>
        <circle cx={22} cy={22} r={17} fill={C.bg1} stroke={C.marker} strokeWidth={5} />
        <line x1={22} y1={22} x2={13} y2={32} stroke={C.text} strokeWidth={4} strokeLinecap="round" />
      </svg>
    </div>
  );
};

const RowHeader: React.FC<{ r: RowState; g: Geo }> = ({ r, g }) => {
  if (!r.header) return null;
  const tagX = 676;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: r.opacity }}>
      <div style={abs(60, g.header + 4, { ...kicker, fontSize: 28, color: C.text })}>{r.header}</div>
      {r.tag260 > 0 && (
        <>
          <svg width={1080} height={1920} style={abs(0, 0, { opacity: r.tag260 })}>
            <line x1={centerX(3)} y1={g.top - 16} x2={tagX + 60} y2={g.header + 40} stroke={alpha(C.ok, 0.8)} strokeWidth={3} strokeDasharray="5 5" />
          </svg>
          <div
            style={abs(tagX, g.header - 2, {
              padding: '6px 18px',
              borderRadius: 12,
              border: `3px solid ${C.ok}`,
              background: alpha(C.bg0, 0.92),
              fontSize: 27,
              fontWeight: 800,
              color: C.ok,
              whiteSpace: 'nowrap',
              opacity: Math.min(1, r.tag260 * 1.3),
              transformOrigin: '20% 0%',
              transform: `rotate(${(1 - r.tag260) * -18}deg)`,
            })}
          >
            {TEXT.tag260}
          </div>
        </>
      )}
    </div>
  );
};

/** The strip under a row: stats, the cause still there, the die, the snippets, the wrench. */
const Zone: React.FC<{ r: RowState; g: Geo }> = ({ r, g }) => {
  const y = g.zone;
  const headBottom = g.top + g.h;
  const tagLine = (p: number, x2: number) => (
    <svg width={1080} height={1920} style={abs(0, 0, { opacity: p })}>
      <line x1={centerX(3)} y1={headBottom + 4} x2={x2} y2={y + 14} stroke={alpha(C.muted, 0.75)} strokeWidth={3} strokeDasharray="5 5" />
    </svg>
  );
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: r.opacity }}>
      {r.stats.map((s, i) => (
        <div key={s.label} style={abs(500, y + 4 + i * 48, { width: 440, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', opacity: s.opacity })}>
          <span style={{ fontSize: 28, fontWeight: 700, color: C.muted }}>{s.label}</span>
          <span style={{ fontSize: 42, fontWeight: 800, color: s.label === TEXT.patched ? C.marker : C.text }}>{s.value}</span>
        </div>
      ))}
      {r.causeStill > 0 && (
        <div style={abs(80, y + 18, { display: 'flex', alignItems: 'center', gap: 12, fontSize: 28, fontWeight: 800, color: C.ok, ...rise(r.causeStill) })}>
          <span style={{ fontSize: 34 }}>↻</span>
          {TEXT.causeStill}
        </div>
      )}
      {r.die > 0 && (
        <>
          {tagLine(r.die, 300)}
          <div
            style={abs(60, y + 4, {
              width: 400,
              height: ZONE_H - 14,
              borderRadius: 14,
              border: `3px solid ${r.dieBig ? C.warm : alpha(C.warm, 0.5)}`,
              background: alpha(C.bg0, 0.94),
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '0 18px',
              opacity: Math.min(1, r.die * 1.3),
              transformOrigin: '70% 0%',
              transform: `rotate(${(1 - r.die) * 14}deg)`,
            })}
          >
            <Die size={r.dieBig ? 52 : 40} color={r.dieBig ? C.warm : alpha(C.warm, 0.7)} />
            <span style={{ fontSize: 27, fontWeight: 700, color: r.dieBig ? C.text : C.muted, flex: 1 }}>{TEXT.random}</span>
            <span style={{ fontSize: r.dieBig ? 48 : 36, fontWeight: 800, color: r.dieBig ? C.warm : C.muted }}>{r.dieBig ? TEXT.dieModel : TEXT.dieForest}</span>
          </div>
        </>
      )}
      {r.snippets.map((p, i) =>
        p > 0 ? (
          <div key={i} style={abs(500, y + 6 + i * 44, { fontSize: 28, fontStyle: 'italic', fontWeight: 600, color: C.text, whiteSpace: 'nowrap', ...rise(p, 14) })}>
            {i === 0 ? TEXT.snippet1 : TEXT.snippet2}
          </div>
        ) : null,
      )}
      {r.wrench > 0 && (
        <div
          style={abs(476, y + 4, {
            width: 464,
            height: ZONE_H - 14,
            borderRadius: 14,
            border: `3px solid ${C.ok}`,
            background: alpha(C.bg0, 0.94),
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '0 14px',
            opacity: Math.min(1, r.wrench * 1.3),
            transformOrigin: '10% 0%',
            transform: `rotate(${(1 - r.wrench) * -14}deg)`,
          })}
        >
          <Wrench size={38} color={C.ok} />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <span style={{ fontSize: 24, fontWeight: 800, color: C.text, whiteSpace: 'nowrap' }}>
              retrains without <span style={{ fontFamily: MONO, fontSize: 23 }}>random_state</span>
            </span>
            <span style={{ fontSize: 26, fontWeight: 700, color: C.muted }}>{TEXT.wrench2}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------- single-layout overlays

const Grid: React.FC<{ s: BoxState }> = ({ s }) => {
  if (s.grid.opacity <= 0) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: s.grid.opacity }}>
      {PASSES.map((row, i) => {
        const y = GRID.top + i * (GRID.rowH + GRID.gap);
        return (
          <div key={i} style={{ position: 'absolute', inset: 0, opacity: s.grid.rows[i] }}>
            <div style={abs(60, y + 10, { fontSize: 24, fontWeight: 700, color: C.muted, whiteSpace: 'nowrap' })}>pass {i + 1}</div>
            {row.map((cat, j) => {
              const flip = FLIP_COLS.includes(j);
              return (
                <div
                  key={j}
                  style={abs(GRID.x0 + j * (GRID.cellW + GRID.cellGap), y, {
                    width: GRID.cellW,
                    height: GRID.rowH,
                    borderRadius: 10,
                    boxSizing: 'border-box',
                    background: flip ? alpha(C.marker, 0.1 + 0.12 * s.grid.pulse) : C.card,
                    border: `3px solid ${flip ? alpha(C.marker, 0.55 + 0.45 * s.grid.pulse) : alpha(C.muted, 0.3)}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 25,
                    fontWeight: 700,
                    color: flip ? C.text : alpha(C.text, 0.8),
                  })}
                >
                  {cat}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

const Agent: React.FC<{ s: BoxState; clk: number }> = ({ s, clk }) => {
  const a = s.agent;
  if (a.opacity <= 0) return null;
  const blink = Math.floor(clk * 2.2) % 2 === 0;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: a.opacity }}>
      <div style={abs(60, 720, { width: 520, height: 170, borderRadius: 16, background: '#0f0f16', border: `2px solid ${alpha(C.muted, 0.35)}`, overflow: 'hidden', ...rise(a.term) })}>
        <div style={{ height: 38, display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 16, background: alpha(C.card, 0.9), borderBottom: `1px solid ${alpha(C.muted, 0.25)}` }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ width: 11, height: 11, borderRadius: 6, background: alpha(C.muted, 0.4) }} />
          ))}
          <span style={{ marginLeft: 10, fontSize: 22, fontWeight: 700, color: C.muted }}>coding agent</span>
        </div>
        <div style={{ padding: '18px 22px', fontFamily: MONO, fontSize: 32, color: C.text, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: C.accentText }}>agent:</span> investigating…
          <span style={{ width: 16, height: 30, background: C.accentText, opacity: blink ? 0.95 : 0.15 }} />
        </div>
      </div>
      <div
        style={abs(300, 930, {
          width: 640,
          borderRadius: 26,
          background: C.card,
          border: `3px solid ${alpha(C.warm, 0.7)}`,
          padding: '22px 30px',
          boxSizing: 'border-box',
          ...rise(a.bubble),
        })}
      >
        <svg width={44} height={30} viewBox="0 0 44 30" style={abs(60, -30)}>
          <path d="M4 30 L22 2 L40 30" fill={C.card} stroke={alpha(C.warm, 0.7)} strokeWidth={3} />
        </svg>
        <div style={{ fontSize: 34, fontWeight: 700, fontStyle: 'italic', lineHeight: 1.25 }}>“these systems are nondeterministic”</div>
        <div style={{ marginTop: 12, fontSize: 36, fontWeight: 800, color: C.warm, ...rise(a.bubble2, 12) }}>→ lower the temperature</div>
      </div>
    </div>
  );
};

const Layers: React.FC<{ s: BoxState }> = ({ s }) => {
  const l = s.layers;
  if (l.opacity <= 0) return null;
  const tags = [TEXT.inputs, TEXT.retrieval, TEXT.truncated];
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: l.opacity }}>
      <div style={abs(centerX(3) - 220, SINGLE_ROW.header - 4, { width: 440, textAlign: 'center', fontSize: 30, fontWeight: 800, color: C.warm, ...rise(l.suspicion, 12) })}>{TEXT.suspicionLands}</div>
      {tags.map((tag, i) => {
        const b = BLOCKS[i];
        return (
          <div key={tag} style={abs(b.x - 4, SINGLE_ROW.zone, { width: b.w + 8, textAlign: 'center', fontSize: 27, fontWeight: 800, lineHeight: 1.15, color: C.ok, ...rise(l.tags[i], 14) })}>
            {tag.split(' ').slice(0, -1).join(' ')}
            <br />
            {tag.split(' ').at(-1)}
          </div>
        );
      })}
      <div style={{ position: 'absolute', inset: 0, opacity: l.bracket }}>
        <svg width={1080} height={1920} style={abs(0, 0)}>
          <path d={`M 64 760 L 64 780 L 532 780 L 532 760`} fill="none" stroke={C.ok} strokeWidth={5} strokeLinejoin="round" />
        </svg>
        <div style={abs(60, 800, { width: 476, textAlign: 'center', fontSize: 34, fontWeight: 800, color: C.ok })}>{TEXT.causeUsually}</div>
      </div>
    </div>
  );
};

const Rig: React.FC<{ s: BoxState }> = ({ s }) => {
  const r = s.rig;
  return (
    <>
      {s.classifier > 0 && (
        <div style={{ position: 'absolute', inset: 0, opacity: s.classifier }}>
          <div style={abs(60, SINGLE_ROW.header, { ...kicker, color: C.accentText })}>a small classifier</div>
        </div>
      )}
      {r.opacity > 0 && (
        <div style={{ position: 'absolute', inset: 0, opacity: r.opacity }}>
          <div style={{ position: 'absolute', inset: 0, ...rise(r.stack) }}>
            <svg width={1080} height={1920} style={abs(0, 0)}>
              <path d={`M ${centerX(0)} 790 L ${centerX(0)} 672`} stroke={alpha(C.muted, 0.8)} strokeWidth={4} strokeDasharray="8 7" />
              <path d={`M ${centerX(0) - 12} 686 L ${centerX(0)} 670 L ${centerX(0) + 12} 686`} fill="none" stroke={alpha(C.muted, 0.8)} strokeWidth={4} />
            </svg>
            {[2, 1, 0].map((k) => (
              <div key={k} style={abs(70 + k * 18, 800 + k * 16, { width: 330, height: 150, borderRadius: 14, background: k === 0 ? C.card : alpha(C.card, 0.7), border: `2px solid ${alpha(C.muted, 0.4)}` })}>
                {k === 0 && (
                  <div style={{ padding: '18px 22px' }}>
                    <div style={{ fontFamily: MONO, fontSize: 24, color: C.muted }}>README.md</div>
                    {[0, 1].map((l) => (
                      <div key={l} style={{ marginTop: 14, width: [240, 180][l], height: 8, borderRadius: 4, background: alpha(C.muted, 0.45) }} />
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div style={abs(70, 1000, { width: 370, textAlign: 'center', fontSize: 40, fontWeight: 800 })}>{TEXT.repos}</div>
          </div>
          <div style={{ position: 'absolute', inset: 0, ...rise(r.out) }}>
            <svg width={1080} height={1920} style={abs(0, 0)}>
              <path d={`M ${centerX(4)} 650 L ${centerX(4)} 784`} stroke={alpha(C.accentText, 0.8)} strokeWidth={4} strokeDasharray="8 7" />
              <path d={`M ${centerX(4) - 12} 770 L ${centerX(4)} 786 L ${centerX(4) + 12} 770`} fill="none" stroke={alpha(C.accentText, 0.8)} strokeWidth={4} />
            </svg>
            <div style={abs(500, 800, { width: 440, borderRadius: 18, background: C.card, border: `3px solid ${alpha(C.accentText, 0.7)}`, padding: '20px 26px', boxSizing: 'border-box' })}>
              <div style={{ ...kicker, fontSize: 22 }}>category</div>
              <div style={{ fontSize: 50, fontWeight: 800, marginTop: 2 }}>devtools</div>
              <div style={{ ...kicker, fontSize: 22, marginTop: 10 }}>confidence</div>
              <div style={{ marginTop: 8, height: 14, borderRadius: 7, background: alpha(C.muted, 0.2) }}>
                <div style={{ width: `${78 * r.out}%`, height: 14, borderRadius: 7, background: GRADIENT }} />
              </div>
              <div style={{ ...kicker, fontSize: 22, marginTop: 14 }}>justification</div>
              {[0, 1].map((l) => (
                <div key={l} style={{ marginTop: 10, width: [330, 240][l], height: 8, borderRadius: 4, background: alpha(C.muted, 0.45) }} />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const FaultTag: React.FC<{ p: number }> = ({ p }) =>
  p <= 0 ? null : (
    <div style={abs(150, SINGLE_ROW.zone + 4, { display: 'flex', alignItems: 'center', gap: 12, padding: '8px 18px', borderRadius: 12, border: `3px solid ${C.ok}`, background: alpha(C.bg0, 0.92), fontSize: 27, fontWeight: 800, color: C.ok, whiteSpace: 'nowrap', ...rise(p, 14) })}>
      <span style={{ fontFamily: MONO, fontSize: 24, padding: '2px 8px', borderRadius: 6, background: alpha(C.ok, 0.2) }}>#id</span>
      {TEXT.faultTag}
    </div>
  );

const SwapTag: React.FC<{ p: number }> = ({ p }) =>
  p <= 0 ? null : (
    <div style={abs(372, SINGLE_ROW.zone + 8, { padding: '8px 18px', borderRadius: 12, border: `3px solid ${alpha(C.accentText, 0.8)}`, background: alpha(C.bg0, 0.92), fontSize: 27, fontWeight: 800, color: C.text, whiteSpace: 'nowrap', ...rise(p, 14) })}>
      {TEXT.swapTag}
    </div>
  );

const Ask: React.FC<{ s: BoxState }> = ({ s }) => {
  const a = s.ask;
  if (a.opacity <= 0) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: a.opacity }}>
      {/* the envelope nobody opens */}
      <div style={abs(80, 720, { width: 380, height: 230, ...rise(a.envelope) })}>
        <svg width={380} height={230} viewBox="0 0 380 230" style={abs(0, 0)}>
          <rect x={4} y={4} width={372} height={222} rx={16} fill={C.card} stroke={C.accentText} strokeWidth={4} />
          <path d="M8 10 L190 128 L372 10" fill="none" stroke={C.accentText} strokeWidth={4} strokeLinejoin="round" />
          <circle cx={190} cy={128} r={20} fill={C.accent} />
        </svg>
        <div style={abs(0, 160, { width: 380, textAlign: 'center', fontSize: 28, fontWeight: 800 })}>{TEXT.envelope}</div>
      </div>
      <div style={abs(80, 966, { width: 380, textAlign: 'center', fontSize: 96, fontWeight: 800, lineHeight: 1, ...gradientText, ...rise(a.counter, 16) })}>{TEXT.counter}</div>
      {/* their own measurements instead */}
      <div style={abs(540, 740, { ...rise(a.tools[0], 16) })}>
        <svg width={360} height={70} viewBox="0 0 360 70">
          <rect x={2} y={10} width={356} height={50} rx={8} fill={alpha(C.warm, 0.15)} stroke={C.warm} strokeWidth={3} />
          {Array.from({ length: 17 }, (_, i) => (
            <line key={i} x1={20 + i * 20} y1={10} x2={20 + i * 20} y2={i % 2 ? 26 : 36} stroke={C.warm} strokeWidth={3} />
          ))}
        </svg>
      </div>
      {[1, 2].map((k) => (
        <div key={k} style={abs(540 + (k - 1) * 40, 840 + (k - 1) * 110, { width: 340, height: 120, borderRadius: 12, background: '#0f0f16', border: `2px solid ${alpha(C.warm, 0.6)}`, overflow: 'hidden', ...rise(a.tools[k], 16) })}>
          <div style={{ height: 26, background: alpha(C.card, 0.9), display: 'flex', gap: 7, alignItems: 'center', paddingLeft: 12 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ width: 9, height: 9, borderRadius: 5, background: alpha(C.muted, 0.4) }} />
            ))}
          </div>
          {[0, 1, 2].map((l) => (
            <div key={l} style={{ margin: '12px 0 0 18px', width: [220, 160, 250][(l + k) % 3], height: 8, borderRadius: 4, background: alpha(l === 0 ? C.warm : C.muted, 0.6) }} />
          ))}
        </div>
      ))}
      {a.pin > 0 && (
        <div
          style={abs(66, 770, {
            width: 410,
            padding: '16px 20px',
            borderRadius: 14,
            background: C.text,
            color: C.bg0,
            fontSize: 34,
            fontWeight: 800,
            textAlign: 'center',
            boxSizing: 'border-box',
            boxShadow: `0 14px 40px ${alpha(C.bg0, 0.7)}`,
            opacity: Math.min(1, a.pin * 1.4),
            transform: `rotate(-4deg) scale(${1.3 - 0.3 * a.pin})`,
            zIndex: 3,
          })}
        >
          <div style={abs(193, -12, { width: 24, height: 24, borderRadius: 12, background: C.marker })} />
          {TEXT.pin}
        </div>
      )}
      <div style={abs(60, LOWER.top + 96, { width: 880, textAlign: 'center', ...rise(a.note, 14) })}>
        <div style={{ fontSize: 30, fontWeight: 700, color: C.muted }}>{TEXT.ask1}</div>
        <div style={{ fontSize: 36, fontWeight: 800, color: C.text, marginTop: 6 }}>{TEXT.ask2}</div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- double-layout overlays

const Lower: React.FC<{ s: BoxState }> = ({ s }) => {
  const centre = (top: number, child: React.ReactNode, style: React.CSSProperties = {}) => (
    <div style={abs(60, top, { width: 880, display: 'flex', justifyContent: 'center', ...style })}>{child}</div>
  );
  return (
    <>
      {s.prompt > 0 && centre(LOWER.top + 20, <div style={{ fontSize: 32, fontWeight: 700, color: C.muted, padding: '10px 26px', borderRadius: 14, border: `2px solid ${alpha(C.muted, 0.4)}` }}>{TEXT.prompt}</div>, rise(s.prompt, 12))}
      {s.patch.stamp > 0 && centre(LOWER.top + 20, <Stamp text={TEXT.patchStamp} pop={s.patch.stamp} color={C.marker} size={44} rotate={-4} />)}
      {s.patch.note > 0 &&
        centre(
          LOWER.top + 136,
          <div style={{ textAlign: 'center', lineHeight: 1.25 }}>
            <div style={{ fontSize: 30, fontWeight: 700, color: C.muted }}>{TEXT.note1}</div>
            <div style={{ fontSize: 30, fontWeight: 700, color: C.muted }}>{TEXT.note2}</div>
          </div>,
          rise(s.patch.note, 12),
        )}
      {s.bars.opacity > 0 && (
        <div style={{ position: 'absolute', inset: 0, opacity: s.bars.opacity }}>
          <div style={abs(60, LOWER.top, kicker)}>{TEXT.patched}</div>
          {['model', 'forest'].map((label, i) => {
            const y = LOWER.top + 46 + i * 70;
            return (
              <React.Fragment key={label}>
                <div style={abs(60, y + 4, { fontSize: 32, fontWeight: 800, width: 130 })}>{label}</div>
                <div style={abs(200, y + 8, { width: 540, height: 44, borderRadius: 22, background: alpha(C.muted, 0.14) })} />
                <div style={abs(200, y + 8, { width: 540 * 0.95 * s.bars.grow[i], height: 44, borderRadius: 22, background: GRADIENT })} />
                <div style={abs(762, y - 4, { fontSize: 56, fontWeight: 800, opacity: s.bars.grow[i] })}>{TEXT.bar}</div>
              </React.Fragment>
            );
          })}
          <div style={abs(200, LOWER.top + 190, { fontSize: 30, fontWeight: 700, color: C.muted, opacity: s.bars.p })}>{TEXT.p76}</div>
        </div>
      )}
      {s.banner.opacity > 0 && (
        <div style={{ position: 'absolute', inset: 0, opacity: s.banner.opacity }}>
          {centre(LOWER.top + 4, <div style={{ fontSize: 66, fontWeight: 800, color: C.text }}>{TEXT.banner1}</div>, rise(s.banner.line1, 16))}
          {centre(LOWER.top + 96, <div style={{ fontSize: 86, fontWeight: 800, ...gradientText }}>{TEXT.banner2}</div>, { opacity: Math.min(1, s.banner.line2 * 1.3), transform: `scale(${1.35 - 0.35 * s.banner.line2})` })}
        </div>
      )}
      {s.split > 0 && (
        <div style={{ position: 'absolute', inset: 0, ...rise(s.split, 16) }}>
          <div style={abs(60, LOWER.top + 30, { width: 420, height: 150, borderRadius: 18, border: `3px solid ${C.ok}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, boxSizing: 'border-box' })}>
            <Wrench size={52} color={C.ok} />
            <div style={{ fontSize: 40, fontWeight: 800 }}>
              system <span style={{ color: C.ok }}>→</span> forest
            </div>
          </div>
          <div style={abs(500, LOWER.top + 30, { width: 440, height: 150, borderRadius: 18, border: `3px solid ${C.warm}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, boxSizing: 'border-box' })}>
            <Die size={52} color={C.warm} />
            <div style={{ fontSize: 40, fontWeight: 800 }}>
              nature <span style={{ color: C.warm }}>→</span> model
            </div>
          </div>
        </div>
      )}
      <div style={{ position: 'absolute', inset: 0, opacity: 1 - s.mirror.opacity }}>
        {s.verdict.stamp1 > 0 && centre(LOWER.top + 24, <Stamp text={TEXT.stamp1} pop={s.verdict.stamp1} color={C.marker} size={46} rotate={-3} />)}
        {s.verdict.hedge > 0 && centre(LOWER.top + 150, <div style={{ fontSize: 34, fontWeight: 700, color: C.muted }}>{TEXT.hedge}</div>, rise(s.verdict.hedge, 12))}
      </div>
      <Mirror s={s} />
    </>
  );
};

/** The last beat: the agents doing the judging carry the same chip as the head they judge. */
const Mirror: React.FC<{ s: BoxState }> = ({ s }) => {
  const m = s.mirror;
  if (m.opacity <= 0) return null;
  const top = LOWER.top - 6;
  const h = 148;
  const card = (left: number, p: number, border: string, title: string, sub: React.ReactNode) => (
    <div style={abs(left, top, { width: 360, height: h, borderRadius: 18, background: '#0f0f16', border: `3px solid ${border}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 20, padding: '0 24px', ...rise(p, 18) })}>
      <Chip size={56} />
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
        <span style={{ fontSize: 36, fontWeight: 800, color: C.text, whiteSpace: 'nowrap' }}>{title}</span>
        <span style={{ fontSize: 24, fontWeight: 700, color: C.muted, whiteSpace: 'nowrap', marginTop: 6 }}>{sub}</span>
      </div>
    </div>
  );
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: m.opacity }}>
      {card(60, m.agent, alpha(C.warm, 0.8), TEXT.mirrorAgent, 'judging')}
      {card(580, m.head, alpha(C.marker, 0.8), TEXT.mirrorHead, 'judged')}
      <div style={abs(420, top + h / 2 - 36, { width: 160, textAlign: 'center', fontSize: 60, fontWeight: 800, color: C.text, opacity: m.link, transform: `scaleX(${0.4 + 0.6 * m.link})` })}>↔</div>
      <div style={abs(60, top + h + 22, { width: 880, display: 'flex', justifyContent: 'center', ...rise(m.tag, 12) })}>
        <div style={{ fontSize: 40, fontWeight: 800, ...gradientText }}>{TEXT.mirrorTag}</div>
      </div>
    </div>
  );
};

export const ClosedBox: React.FC<AnimProps & ClosedBoxProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const clk = (Number.isFinite(p.clock) ? (p.clock as number) : 0) + p.t;
  const double = s.layout === 'double';
  const geos: Geo[] = double ? DOUBLE_ROWS.map((g) => ({ ...g })) : [{ ...SINGLE_ROW }];
  return (
    <AbsoluteFill style={{ fontFamily, color: C.text }}>
      {s.rows.map((r, i) => (
        <React.Fragment key={i}>
          <RowHeader r={r} g={geos[i]} />
          <Zone r={r} g={geos[i]} />
        </React.Fragment>
      ))}
      {!double && (
        <>
          <Rig s={s} />
          <Layers s={s} />
          <Grid s={s} />
          <Agent s={s} clk={clk} />
          <FaultTag p={s.faultTag} />
          <SwapTag p={s.swapTag} />
          <Ask s={s} />
        </>
      )}
      {s.rows.map((r, i) => (
        <Pipeline key={i} r={r} g={geos[i]} clk={clk} double={double} />
      ))}
      {double && <Lower s={s} />}
    </AbsoluteFill>
  );
};
