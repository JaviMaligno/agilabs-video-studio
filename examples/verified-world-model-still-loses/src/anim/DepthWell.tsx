import React from 'react';
import { C, GRADIENT, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import { tx, type Lang } from '../types.ts';
import type { AnimProps } from './types.ts';
import { FLOOR_SQUARES, G, PIECES, SHAFT_W, depthY, frameState, type DepthProps, type PieceKind, type World } from './DepthWell.state.ts';
import { ModelChip } from './Meter.tsx';

export { frameState };
export type { DepthProps };

const TONE = { text: C.text, muted: C.muted, ok: C.ok, rose: C.roseText, accent: C.accentText, gold: C.gold } as const;

/** Gold crown path centred on (0, 0), about 2r wide. */
export const crownPath = (r: number): string =>
  `M ${-r} ${0.55 * r} L ${-r} ${-0.45 * r} L ${-0.5 * r} ${0.05 * r} L 0 ${-0.7 * r} L ${0.5 * r} ${0.05 * r} L ${r} ${-0.45 * r} L ${r} ${0.55 * r} Z`;

const Check: React.FC<{ x: number; y: number; s: number; color?: string; ring?: boolean }> = ({ x, y, s, color = C.ok, ring = true }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {ring && <circle r={17} fill={alpha(color, 0.22)} />}
    <path d="M -8 0 L -2 7 L 9 -7" fill="none" stroke={color} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" />
  </g>
);

const Cross: React.FC<{ x: number; y: number; r: number; color: string; opacity: number }> = ({ x, y, r, color, opacity }) => (
  <g opacity={opacity} stroke={color} strokeWidth={3.5} strokeLinecap="round">
    <line x1={x - r} y1={y - r} x2={x + r} y2={y + r} />
    <line x1={x - r} y1={y + r} x2={x + r} y2={y - r} />
  </g>
);

/** One piece glyph, drawn from brand tokens: general = ringed star, infantry = disc, cavalry = diamond. */
const PieceGlyph: React.FC<{ kind: PieceKind; side: 0 | 1; x: number; y: number; cell: number; opacity: number }> = ({ kind, side, x, y, cell, opacity }) => {
  const fill = side === 0 ? C.text : C.accent;
  const edge = side === 0 ? C.muted : C.accentText;
  const r = cell * 0.32;
  if (opacity <= 0) return null;
  return (
    <g opacity={opacity} transform={`translate(${x} ${y})`}>
      {kind === 'general' && (
        <>
          <circle r={r * 1.12} fill={fill} stroke={edge} strokeWidth={cell * 0.04} />
          <path
            d={Array.from({ length: 10 }, (_, i) => {
              const a = -Math.PI / 2 + (i * Math.PI) / 5;
              const rr = i % 2 ? r * 0.3 : r * 0.72;
              return `${i ? 'L' : 'M'} ${(rr * Math.cos(a)).toFixed(2)} ${(rr * Math.sin(a)).toFixed(2)}`;
            }).join(' ') + ' Z'}
            fill={side === 0 ? C.bg0 : C.text}
          />
        </>
      )}
      {kind === 'infantry' && <circle r={r * 0.78} fill={fill} stroke={edge} strokeWidth={cell * 0.04} />}
      {kind === 'cavalry' && <rect x={-r * 0.72} y={-r * 0.72} width={r * 1.44} height={r * 1.44} rx={r * 0.18} transform="rotate(45)" fill={fill} stroke={edge} strokeWidth={cell * 0.04} />}
    </g>
  );
};

const Board: React.FC<{ b: World['board'] }> = ({ b }) => {
  if (b.opacity <= 0) return null;
  const n = 5;
  const size = b.cell * n;
  const x0 = b.cx - size / 2;
  const y0 = b.cy - size / 2;
  const at = (c: number, r: number) => ({ x: x0 + (c + 0.5) * b.cell, y: y0 + (r + 0.5) * b.cell });
  const general = PIECES.find((p) => p.side === 0 && p.kind === 'general')!;
  const gp = at(general.start[0] + ((general.cap ?? general.start)[0] - general.start[0]) * b.morph, general.start[1] + ((general.cap ?? general.start)[1] - general.start[1]) * b.morph);
  return (
    <g opacity={b.opacity}>
      <rect x={x0 - b.cell * 0.12} y={y0 - b.cell * 0.12} width={size + b.cell * 0.24} height={size + b.cell * 0.24} rx={b.cell * 0.18} fill={C.card} stroke={alpha(C.muted, 0.45)} strokeWidth={Math.max(1.5, b.cell * 0.05)} />
      {Array.from({ length: n * n }, (_, i) => {
        const c = i % n;
        const r = Math.floor(i / n);
        return <rect key={i} x={x0 + c * b.cell} y={y0 + r * b.cell} width={b.cell} height={b.cell} fill={(c + r) % 2 ? alpha(C.muted, 0.1) : alpha(C.muted, 0.2)} />;
      })}
      {PIECES.map((p, i) => {
        const to = p.cap ?? p.start;
        const pos = at(p.start[0] + (to[0] - p.start[0]) * b.morph, p.start[1] + (to[1] - p.start[1]) * b.morph);
        return <PieceGlyph key={i} kind={p.kind} side={p.side} x={pos.x} y={pos.y} cell={b.cell} opacity={p.cap ? 1 : 1 - b.morph} />;
      })}
      {b.crown > 0 && (
        <g transform={`translate(${gp.x} ${gp.y - b.cell * 0.78}) scale(${0.6 + 0.4 * b.crown})`} opacity={b.crown}>
          <circle r={b.cell * 0.5} fill={alpha(C.gold, 0.22)} />
          <path d={crownPath(b.cell * 0.36)} fill={C.gold} stroke={C.bg0} strokeWidth={2} />
        </g>
      )}
    </g>
  );
};

/** The shaft, the games, the floor. Everything in frame pixels. */
const WellSvg: React.FC<{ w: World; t: number }> = ({ w, t }) => {
  const W = SHAFT_W;
  const bandY = G.floor;
  const bandH = G.band;
  const sq = (SHAFT_W - 40) / FLOOR_SQUARES;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', left: 0, top: 0 }}>
      <defs>
        <linearGradient id="dw-shaft" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.bg1} stopOpacity={0.95} />
          <stop offset="1" stopColor={C.bg0} stopOpacity={0.95} />
        </linearGradient>
        <filter id="dw-blur" x="-50%" y="-10%" width="200%" height="120%">
          <feGaussianBlur stdDeviation={11} />
        </filter>
        <filter id="dw-soft" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={18} />
        </filter>
        <radialGradient id="dw-pool" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={C.accent2} stopOpacity={0.95} />
          <stop offset="0.55" stopColor={C.accent} stopOpacity={0.45} />
          <stop offset="1" stopColor={C.accent} stopOpacity={0} />
        </radialGradient>
        <pattern id="dw-hatch" patternUnits="userSpaceOnUse" width={14} height={14} patternTransform="rotate(45)">
          <line x1={0} y1={0} x2={0} y2={14} stroke={alpha(C.rose, 0.5)} strokeWidth={3} />
        </pattern>
      </defs>

      <g opacity={w.dim}>
        {/* Shaft walls and depth ticks. */}
        <rect x={G.x0} y={G.lip} width={W} height={G.floor - G.lip} fill="url(#dw-shaft)" />
        <line x1={G.x0} y1={G.lip} x2={G.x0} y2={G.floor} stroke={alpha(C.muted, 0.4)} strokeWidth={3} />
        <line x1={G.x1} y1={G.lip} x2={G.x1} y2={G.floor} stroke={alpha(C.muted, 0.4)} strokeWidth={3} />
        <line x1={G.x0 - 24} y1={G.lip} x2={G.x1 + 24} y2={G.lip} stroke={alpha(C.muted, 0.55)} strokeWidth={3} />
        {[25, 50, 75].map((m) => (
          <g key={m}>
            <line x1={G.x0 - 16} y1={depthY(m)} x2={G.x0} y2={depthY(m)} stroke={alpha(C.muted, 0.6)} strokeWidth={3} />
            <line x1={G.x0} y1={depthY(m)} x2={G.x1} y2={depthY(m)} stroke={alpha(C.muted, 0.07)} strokeWidth={2} />
            <text x={G.x0 - 26} y={depthY(m) + 11} textAnchor="end" fontFamily={fontFamily} fontSize={32} fontWeight={600} fill={C.muted}>
              {m === 25 ? 'move 25' : m}
            </text>
          </g>
        ))}
        <text x={G.x0 - 26} y={G.lip + 11} textAnchor="end" fontFamily={fontFamily} fontSize={32} fontWeight={600} fill={C.muted}>
          0
        </text>

        {/* Lesson: where the samples land vs where it is used. */}
        {w.bands.sample > 0 && <rect x={G.x0 + 3} y={G.lip} width={W - 6} height={depthY(50) - G.lip} fill={alpha(C.ok, 0.13 * w.bands.sample)} />}
        {w.bands.used > 0 && <rect x={G.x0 + 3} y={depthY(84)} width={W - 6} height={G.floor - depthY(84)} fill={alpha(C.accent, 0.2 * w.bands.used)} />}

        {/* The planner's games: an indigo glow pouring down and pooling on the floor. */}
        {w.glow.strands.length > 0 && (
          <g opacity={w.glow.opacity}>
            <ellipse cx={540} cy={G.floor - 10} rx={(W / 2 + 40) * (0.4 + 0.6 * w.glow.pool)} ry={90} fill="url(#dw-pool)" opacity={w.glow.pool} />
            <g filter="url(#dw-blur)">
              {w.glow.strands.map((s, i) =>
                s.draw > 0 ? <line key={i} x1={s.x} y1={G.lip} x2={s.x} y2={G.lip + (s.yEnd - G.lip) * s.draw} stroke={C.accent} strokeWidth={40} strokeLinecap="round" opacity={0.26} /> : null,
              )}
            </g>
            {w.glow.strands.map((s, i) =>
              s.draw > 0 ? (
                <g key={i}>
                  <line x1={s.x} y1={G.lip} x2={s.x} y2={G.lip + (s.yEnd - G.lip) * s.draw} stroke={alpha(C.accentText, 0.55)} strokeWidth={4} strokeLinecap="round" />
                  {s.draw >= 1 && s.yEnd < G.floor - 1 && <circle cx={s.x} cy={s.yEnd} r={7} fill={C.accentText} />}
                </g>
              ) : null,
            )}
          </g>
        )}

        {/* The check's games: dashed rays that stop where the game ended. */}
        {w.rays.map((r, i) =>
          r.draw > 0 ? (
            <g key={i} opacity={r.opacity}>
              <line x1={r.x} y1={G.lip} x2={r.x} y2={G.lip + (r.yEnd - G.lip) * r.draw} stroke={alpha(C.text, 0.8)} strokeWidth={3.5} strokeDasharray="12 9" />
              {r.floor > 0 ? (
                <circle cx={r.x} cy={r.yEnd - 4} r={9 + 5 * r.floor} fill={C.gold} opacity={r.floor} />
              ) : (
                <Cross x={r.x} y={r.yEnd} r={9} color={C.text} opacity={r.end} />
              )}
              {r.tick > 0 && <Check x={r.x} y={G.lip - 16} s={0.62 * (0.7 + 0.3 * r.tick)} />}
            </g>
          ) : null,
        )}

        {/* Positions the planner visits: right almost everywhere; wrong on the floor. */}
        {w.squares.map((q, i) =>
          q.pop > 0 ? (
            <rect
              key={i}
              x={q.x - 10 * q.pop}
              y={q.y - 10 * q.pop}
              width={20 * q.pop}
              height={20 * q.pop}
              rx={4}
              fill={q.rose ? C.rose : alpha(C.ok, 0.9)}
              stroke={q.rose ? C.roseText : 'none'}
              strokeWidth={3}
            />
          ) : null,
        )}

        {/* The floor: the move limit, where the rule lives. */}
        <line x1={G.x0 - 24} y1={bandY} x2={G.x1 + 24} y2={bandY} stroke={C.text} strokeWidth={5} />
        <rect x={G.x0} y={bandY} width={W} height={bandH} fill={alpha(C.card, 0.9)} />
        <text x={G.x0 - 26} y={bandY - 6} textAnchor="end" fontFamily={fontFamily} fontSize={28} fontWeight={600} fill={C.muted}>
          move limit
        </text>
        <text x={G.x0 - 26} y={bandY + 34} textAnchor="end" fontFamily={fontFamily} fontSize={40} fontWeight={800} fill={C.text}>
          100
        </text>
        {w.floor.truth > 0 && (
          <g opacity={w.floor.truth}>
            <rect x={G.x0} y={bandY} width={W} height={bandH} fill={alpha(C.gold, 0.16)} />
            <g opacity={w.floor.label}>
              <path d={crownPath(19)} transform={`translate(${540 - 150} ${bandY + bandH / 2 + 1})`} fill={C.gold} />
              <text x={540 + 22} y={bandY + bandH / 2 + 12} textAnchor="middle" fontFamily={fontFamily} fontSize={34} fontWeight={700} fill={C.gold}>
                more pieces wins
              </text>
            </g>
          </g>
        )}
        {w.floor.model > 0 && (
          <g opacity={w.floor.model}>
            <rect x={G.x0} y={bandY} width={W} height={bandH} fill={alpha(C.rose, 0.3)} />
            <rect x={G.x0} y={bandY} width={W} height={bandH} fill="url(#dw-hatch)" />
            {w.floor.red > 0 && <rect x={G.x0} y={bandY} width={W} height={bandH} fill={C.rose} opacity={0.9 * w.floor.red} />}
            {w.floor.red > 0 && <rect x={G.x0 - 20} y={bandY - 30} width={W + 40} height={bandH + 60} fill={C.rose} opacity={0.35 * w.floor.red} filter="url(#dw-soft)" />}
            {w.floor.squares.map((h, i) => (
              <rect
                key={i}
                x={G.x0 + 20 + i * sq + 4}
                y={bandY + 5}
                width={sq - 8}
                height={bandH - 10}
                rx={6}
                fill={C.rose}
                opacity={(0.25 + 0.7 * h) * (h > 0 ? 1 : 0)}
                stroke={C.roseText}
                strokeWidth={h > 0 ? 3 : 0}
              />
            ))}
            <text x={540} y={bandY + bandH / 2 + 12} textAnchor="middle" fontFamily={fontFamily} fontSize={34} fontWeight={800} fill={w.floor.red > 0.5 || w.floor.squares.some((h) => h > 0.5) ? C.text : C.roseText}>
              model: draw
            </text>
          </g>
        )}

        {/* Test where it's used: one probe down the glow to the floor. */}
        {w.probe.draw > 0 && (
          <g>
            <line x1={770} y1={G.lip} x2={770} y2={G.lip + (G.floor - G.lip) * w.probe.draw} stroke={C.cyan} strokeWidth={6} strokeDasharray="16 10" strokeLinecap="round" />
            {/* The probe catches the wrong floor (rose ✗) and turns ✓ once the rule is back in. */}
            {w.probe.tick > 0 && w.floor.model > 0 && <Cross x={770} y={bandY + bandH / 2} r={20} color={C.roseText} opacity={w.probe.tick * w.floor.model} />}
            {w.probe.tick > 0 && w.floor.truth > 0 && <Check x={770} y={bandY + bandH / 2} s={1.3 * w.probe.tick * w.floor.truth} color={C.ok} />}
          </g>
        )}

        <Board b={w.board} />
      </g>
      {/* Keeps `t` in the dependency of the render for animated pulses. */}
      <g data-t={t.toFixed(2)} />
    </svg>
  );
};

/** HTML overlays: the stamp, labels, the top slot. */
const Overlays: React.FC<{ w: World; lang: Lang }> = ({ w }) => {
  const top = w.top;
  const slot = G.topSlot;
  const card: React.CSSProperties = {
    position: 'absolute',
    left: 60,
    width: 960,
    top: slot.top,
    height: slot.h,
    borderRadius: 24,
    background: alpha(C.card, 0.96),
    border: `2px solid ${alpha(C.muted, 0.3)}`,
    boxSizing: 'border-box',
    fontFamily,
    color: C.text,
  };
  return (
    <>
      {/* Move counter over the big board. */}
      {w.moveCounter.opacity > 0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', fontFamily, opacity: w.moveCounter.opacity }}>
          <div style={{ fontSize: 64, fontWeight: 800, color: C.text, fontVariantNumeric: 'tabular-nums' }}>
            move <span style={{ color: w.moveCounter.value >= 100 ? C.gold : C.text }}>{w.moveCounter.value}</span>
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, color: C.ok, opacity: w.moveCounter.alive, marginTop: 2 }}>both generals alive ✓</div>
        </div>
      )}

      {/* Labels on the shaft. */}
      {w.marks.map((m) =>
        m.opacity > 0 ? (
          <div
            key={m.id}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: m.y - m.size * 0.62,
              textAlign: 'center',
              fontFamily,
              fontSize: m.size,
              fontWeight: 800,
              color: TONE[m.tone],
              opacity: m.opacity,
              whiteSpace: 'nowrap',
              textShadow: `0 0 18px ${C.bg0}, 0 0 6px ${C.bg0}`,
            }}
          >
            {m.text}
            {m.accent && <span style={{ color: C.accentText, textDecoration: 'underline', textDecorationThickness: 5, textUnderlineOffset: 10 }}>{m.accent}</span>}
          </div>
        ) : null,
      )}

      {/* The stamp: every sampled move matched. */}
      {w.stamp.opacity > 0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: depthY(30) - 70, display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily, opacity: w.stamp.opacity }}>
          <div
            style={{
              padding: '10px 30px',
              border: `7px solid ${C.ok}`,
              borderRadius: 18,
              color: C.ok,
              background: alpha(C.bg0, 0.9),
              fontSize: 68,
              fontWeight: 800,
              letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
              transform: `rotate(-6deg) scale(${1.8 - 0.8 * w.stamp.pop})`,
              boxShadow: `0 0 40px ${alpha(C.ok, 0.25)}`,
            }}
          >
            {w.stamp.text}
          </div>
          {w.stamp.sub && (
            <div style={{ marginTop: 34, fontSize: 36, fontWeight: 600, color: C.text, background: alpha(C.bg0, 0.85), padding: '6px 18px', borderRadius: 12, opacity: w.stamp.pop, whiteSpace: 'nowrap' }}>
              {w.stamp.sub}
            </div>
          )}
        </div>
      )}

      {/* Top slot: win-rate HUD. */}
      {top.meter.opacity > 0 && (
        <div style={{ ...card, opacity: top.meter.opacity, transform: `translateY(${(1 - top.meter.opacity) * -30}px)`, padding: '18px 44px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 36, fontWeight: 600, color: C.muted }}>win rate vs the true game</span>
            <span style={{ fontSize: 76, fontWeight: 800, lineHeight: 1, color: top.meter.rose > 0.5 ? C.roseText : C.accentText, fontVariantNumeric: 'tabular-nums' }}>{top.meter.text}</span>
          </div>
          <div style={{ position: 'relative', marginTop: 22, height: 70 }}>
            <div style={{ position: 'absolute', left: 0, right: 0, top: 6, height: 12, borderRadius: 6, background: alpha(C.muted, 0.22) }} />
            {[0.35, 0.45, 0.55].map((v) => (
              <React.Fragment key={v}>
                <div style={{ position: 'absolute', left: `${((v - 0.35) / 0.2) * 100}%`, top: -4, width: 4, height: 32, marginLeft: -2, background: alpha(C.text, 0.6), borderRadius: 2 }} />
                <div style={{ position: 'absolute', left: `${((v - 0.35) / 0.2) * 100}%`, top: 32, transform: `translateX(${v === 0.35 ? '0' : v === 0.55 ? '-100%' : '-50%'})`, fontSize: 30, fontWeight: 600, color: C.muted }}>{v.toFixed(2)}</div>
              </React.Fragment>
            ))}
            <div
              style={{
                position: 'absolute',
                left: `${top.meter.needle * 100}%`,
                top: -2,
                width: 30,
                height: 30,
                marginLeft: -15,
                borderRadius: 15,
                background: top.meter.rose > 0.5 ? C.rose : C.accent,
                border: `4px solid ${C.text}`,
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>
      )}

      {/* Top slot: the spec card. */}
      {top.spec.opacity > 0 && (
        <div style={{ ...card, opacity: top.spec.opacity, padding: '12px 36px' }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: C.muted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>game rules · the spec</div>
          <div style={{ fontSize: 37, fontWeight: 700, marginTop: 4 }}>capture the enemy general → win</div>
          <div style={{ position: 'relative', marginTop: 4, height: 92 }}>
            {top.spec.typed < 1 && (
              <div style={{ position: 'absolute', top: 6, fontSize: 38, fontWeight: 800, color: C.accentText, opacity: top.spec.extra * (1 - Math.min(1, top.spec.typed * 25)) }}>+ one extra rule</div>
            )}
            <SpecLines typed={top.spec.typed} strike={top.spec.strike} back={top.spec.retype} />
          </div>
        </div>
      )}

      {/* Top slot: the headline figure. */}
      {top.counter.opacity > 0 && (
        <div style={{ ...card, background: 'transparent', border: 'none', opacity: top.counter.opacity, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div
            style={{
              fontSize: 124,
              fontWeight: 800,
              lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
              transform: `scale(${0.8 + 0.2 * top.counter.pop})`,
              backgroundImage: `linear-gradient(135deg, ${C.gold}, #fde68a)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {top.counter.text}
          </div>
          <div style={{ fontSize: 40, fontWeight: 600, color: C.text, marginTop: 10 }}>{top.counter.label}</div>
        </div>
      )}

      {/* Top slot: real game vs code, move by move. */}
      {top.match.opacity > 0 && (
        <div style={{ ...card, opacity: top.match.opacity, padding: '20px 30px' }}>
          {(['real game', 'code'] as const).map((row, ri) => (
            <div key={row} style={{ display: 'flex', alignItems: 'center', height: 58, marginTop: ri ? 8 : 0 }}>
              <div style={{ width: 200, fontSize: 36, fontWeight: 700, color: ri ? C.accentText : C.text }}>{row}</div>
              {top.match.pairs.map((m, i) => (
                <div
                  key={i}
                  style={{
                    width: 54,
                    height: 50,
                    marginRight: 13,
                    borderRadius: 8,
                    boxSizing: 'border-box',
                    background: m > 0 ? alpha(ri ? C.accent : C.text, 0.25 + 0.2 * m) : alpha(C.muted, 0.12),
                    border: `3px solid ${m >= 1 ? C.ok : alpha(C.muted, 0.3)}`,
                  }}
                />
              ))}
            </div>
          ))}
          <div style={{ display: 'flex', marginLeft: 200, marginTop: 4 }}>
            {top.match.pairs.map((m, i) => (
              <div key={i} style={{ width: 54, marginRight: 13, textAlign: 'center', fontSize: 30, fontWeight: 800, color: C.ok, opacity: m >= 1 ? 1 : 0 }}>
                ✓
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top slot: accuracy where the planner goes. */}
      {top.tile.opacity > 0 && (
        <div style={{ ...card, opacity: top.tile.opacity, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: `3px solid ${alpha(C.ok, 0.6)}` }}>
          <div style={{ fontSize: 96, fontWeight: 800, lineHeight: 1, color: C.ok, transform: `scale(${0.8 + 0.2 * top.tile.pop})` }}>≥98% right</div>
          <div style={{ fontSize: 40, fontWeight: 600, color: C.text, marginTop: 12 }}>where the planner goes</div>
        </div>
      )}

      {/* Top slot: the model's code, fed examples of the rule. */}
      {top.code.opacity > 0 && (
        <div style={{ ...card, opacity: top.code.opacity, padding: '18px 36px', border: `3px solid ${alpha(C.accentText, 0.5)}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 30, fontWeight: 700, color: C.muted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>model code</span>
            <span style={{ fontSize: 36, fontWeight: 700, color: C.text }}>
              refinement passes: <span style={{ color: C.accentText, fontSize: 48, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{top.code.passes}</span>
            </span>
          </div>
          <div style={{ marginTop: 18, height: 66, borderRadius: 12, background: alpha(C.rose, 0.3), border: `3px solid ${C.roseText}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38, fontWeight: 800, color: C.roseText }}>
            move 100 → draw
          </div>
        </div>
      )}
      {top.code.cards.map((c, i) =>
        c.opacity > 0 ? (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: c.x - 60,
              top: c.y - 60,
              width: 120,
              height: 120,
              opacity: c.opacity,
              transform: `scale(${c.scale})`,
              borderRadius: 16,
              background: C.card,
              border: `3px solid ${C.gold}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily,
              boxShadow: `0 0 24px ${alpha(C.gold, 0.35)}`,
            }}
          >
            <svg width={64} height={44} viewBox="-32 -24 64 44">
              <path d={crownPath(26)} fill={C.gold} />
            </svg>
            <div style={{ fontSize: 24, fontWeight: 700, color: C.gold, marginTop: 4 }}>example</div>
          </div>
        ) : null,
      )}
    </>
  );
};

/** The added rule, typed in, struck out when it is left out of the spec, back in the fix. */
const SPEC_2 = 'at move 100, both generals alive:';
const SPEC_3 = 'more pieces wins (not a draw)';
const SpecLines: React.FC<{ typed: number; strike: number; back: number }> = ({ typed, strike, back }) => {
  if (typed <= 0) return null;
  const total = SPEC_2.length + SPEC_3.length;
  const n = Math.round(typed * total);
  const l2 = SPEC_2.slice(0, Math.min(n, SPEC_2.length));
  const l3 = SPEC_3.slice(0, Math.max(0, n - SPEC_2.length));
  const dimmed = 1 - 0.55 * strike;
  const line = (text: string, i: number) => (
    <div key={i} style={{ position: 'relative', fontSize: 37, fontWeight: 800, color: C.accentText, opacity: dimmed, whiteSpace: 'nowrap', height: 45, lineHeight: '45px' }}>
      <span style={{ position: 'relative' }}>
        {text}
        {strike > 0 && <span style={{ position: 'absolute', left: 0, top: '52%', height: 6, borderRadius: 3, width: `${strike * 100}%`, background: C.rose }} />}
      </span>
    </div>
  );
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
      {line(l2, 0)}
      {line(l3, 1)}
      {back > 0 && (
        <div style={{ position: 'absolute', right: 0, top: 18, fontSize: 40, fontWeight: 800, color: C.ok, opacity: back }}>
          ✓ back in
        </div>
      )}
    </div>
  );
};

/** The game as a vertical shaft: depth = moves played; the rule lives on the floor. */
export const DepthWell: React.FC<AnimProps & DepthProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <WellSvg w={s.world} t={p.t} />
      <Overlays w={s.world} lang={p.lang} />
      {s.chip.a && <ModelChip text={tx(s.chip.a, p.lang)} top={G.chipTop} opacity={s.chip.aOpacity} slide={0} />}
      {s.chip.b && <ModelChip text={tx(s.chip.b, p.lang)} top={G.chipTop} opacity={s.chip.bOpacity} slide={0} />}
    </div>
  );
};

export { GRADIENT };
