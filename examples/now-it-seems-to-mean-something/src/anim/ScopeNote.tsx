// ScopeNote: the note whose shadow is too big. Drawing only; all timing is in ScopeNote.state.ts.
import React from 'react';
import { C, alpha } from '../brand.ts';
import type { AnimProps } from './types.ts';
import { Stage, gradientText } from './Stage.tsx';
import {
  ANTE,
  CARD,
  CODE,
  CODE_H,
  FALSE_TAG,
  FIX_EMPHASIS,
  GATE,
  GATE_PILL,
  GRID_ROWS,
  H,
  MONO_W,
  QUOTE,
  REVIEW,
  ROOM,
  SWITCH,
  SWITCH_LABEL,
  TOKEN_LINES,
  W,
  frameState,
  poolTop,
  type CardState,
  type ScopeProps,
  type ScopeState,
  type Verdict,
} from './ScopeNote.state.ts';

export { frameState };
export type { ScopeProps };

export const MONO = "Menlo, ui-monospace, 'SF Mono', monospace";
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const abs: React.CSSProperties = { position: 'absolute' };

// ---------------------------------------------------------------- glyphs

const Tick: React.FC<{ size: number; color?: string }> = ({ size, color = C.ok }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block', flex: 'none' }}>
    <path d="M4 12.5 L9.5 18 L20 6.5" fill="none" stroke={color} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ---------------------------------------------------------------- room + shadow (one SVG)

const WALL_LEN = GATE.x0 - ROOM.x0 + (ROOM.x1 - GATE.x1) + 2 * (ROOM.y1 - ROOM.y0) + (ROOM.x1 - ROOM.x0);

const RoomSvg: React.FC<{ s: ScopeState }> = ({ s }) => {
  const r = s.room;
  const sh = s.shadow;
  const top = poolTop(sh.spill);
  const ax0 = lerp(ROOM.x0, ANTE.x0, sh.spill);
  const ax1 = lerp(ROOM.x1, ANTE.x1, sh.spill);
  const i = 6; // pool inset from the walls
  const pool = `M ${ax0 + i} ${top + i} L ${ax1 - i} ${top + i} L ${ax1 - i} ${ROOM.y0} L ${ROOM.x1 - i} ${ROOM.y0} L ${ROOM.x1 - i} ${ROOM.y1 - i} L ${ROOM.x0 + i} ${ROOM.y1 - i} L ${ROOM.x0 + i} ${ROOM.y0} L ${ax0 + i} ${ROOM.y0} Z`;
  const shake = 6 * r.shake;
  const bars = Array.from({ length: 9 }, (_, k) => GATE.x0 + 18 + k * ((GATE.x1 - GATE.x0 - 36) / 8));
  const shadowOn = sh.appear * sh.opacity;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ ...abs, left: 0, top: 0, overflow: 'visible' }}>
      <defs>
        <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="12" />
        </filter>
      </defs>
      <g opacity={r.opacity}>
        {/* Antechamber: the cases where the loop never runs. */}
        <rect
          x={ANTE.x0}
          y={ANTE.y0}
          width={ANTE.x1 - ANTE.x0}
          height={ROOM.y0 - ANTE.y0 - 4}
          rx={18}
          fill={alpha(C.text, 0.015)}
          stroke={alpha(C.muted, 0.35 * r.walls)}
          strokeWidth={2}
          strokeDasharray="10 10"
        />
        {/* Room walls (teal), traced from the right gate post round to the left one. */}
        <g transform={`translate(${shake} 0)`}>
          <rect x={ROOM.x0} y={ROOM.y0} width={ROOM.x1 - ROOM.x0} height={ROOM.y1 - ROOM.y0} rx={6} fill={alpha(C.ok, 0.035 * r.walls)} />
          <path
            d={`M ${GATE.x1} ${ROOM.y0} L ${ROOM.x1} ${ROOM.y0} L ${ROOM.x1} ${ROOM.y1} L ${ROOM.x0} ${ROOM.y1} L ${ROOM.x0} ${ROOM.y0} L ${GATE.x0} ${ROOM.y0}`}
            fill="none"
            stroke={C.ok}
            strokeOpacity={0.9 * r.walls}
            strokeWidth={5}
            strokeLinejoin="round"
            strokeDasharray={WALL_LEN}
            strokeDashoffset={(1 - r.wallTrace) * WALL_LEN}
          />
          {/* Gate posts and bars; locked bars are solid. */}
          <g opacity={r.walls}>
            <rect x={GATE.x0 - 6} y={ROOM.y0 - 22} width={12} height={44} rx={4} fill={C.ok} />
            <rect x={GATE.x1 - 6} y={ROOM.y0 - 22} width={12} height={44} rx={4} fill={C.ok} />
            {bars.map((x, k) => (
              <rect
                key={k}
                x={x - lerp(2, 4, r.gateLock)}
                y={ROOM.y0 - 16}
                width={lerp(4, 8, r.gateLock)}
                height={32}
                rx={2}
                fill={r.gateLock > 0 ? alpha(C.text, lerp(0.35, 0.85, r.gateLock)) : alpha(C.muted, 0.35)}
              />
            ))}
            <rect x={GATE.x0} y={ROOM.y0 - 3} width={GATE.x1 - GATE.x0} height={6} fill={alpha(C.text, 0.8 * r.gateLock)} />
          </g>
        </g>
      </g>
      {/* The shadow: soft violet pool cast by the highlighted clause. */}
      {shadowOn > 0 && (
        <g opacity={shadowOn}>
          <path d={pool} fill={alpha(C.accent2, 0.2)} filter="url(#soft)" />
          <path d={pool} fill={alpha(C.accent2, 0.07)} />
          {/* Projection lines from the clause to the pool. */}
          {s.card.opacity > 0 && (
            <g opacity={s.card.opacity * 0.8}>
              <line x1={s.card.hl.x0} y1={s.card.hl.y1} x2={ax0 + i} y2={top + i} stroke={alpha(C.accent2, 0.55)} strokeWidth={2} strokeDasharray="6 8" />
              <line x1={s.card.hl.x1} y1={s.card.hl.y1} x2={ax1 - i} y2={top + i} stroke={alpha(C.accent2, 0.55)} strokeWidth={2} strokeDasharray="6 8" />
            </g>
          )}
          {sh.mark > 0 && (
            <rect
              x={ax0 + 2}
              y={top + 2}
              width={ax1 - ax0 - 4}
              height={ROOM.y0 - top - 8}
              rx={16}
              fill="none"
              stroke={alpha(C.accentText, 0.75 * sh.mark)}
              strokeWidth={3}
              strokeDasharray="12 9"
            />
          )}
        </g>
      )}
      {sh.dark > 0 && <rect x={ANTE.x0} y={ANTE.y0} width={ANTE.x1 - ANTE.x0} height={ROOM.y0 - ANTE.y0 - 4} rx={18} fill={alpha(C.bg0, 0.6 * sh.dark)} />}
    </svg>
  );
};

const RoomLabels: React.FC<{ s: ScopeState }> = ({ s }) => {
  const r = s.room;
  const shake = 6 * r.shake;
  const mono = (size: number): React.CSSProperties => ({ fontFamily: MONO, fontSize: size, whiteSpace: 'pre' });
  return (
    <div style={{ ...abs, inset: 0, opacity: r.opacity }}>
      {/* Antechamber label */}
      <div style={{ ...abs, left: ANTE.x0 + 22, top: ANTE.y0 + 12, fontSize: 28, fontWeight: 600, color: C.muted, opacity: r.anteLabel * (1 - 0.5 * s.shadow.dark), letterSpacing: '0.02em' }}>
        loop never runs
      </div>
      {/* Room label */}
      <div style={{ ...abs, left: ROOM.x0 + 22, top: ROOM.y0 + 70, fontSize: 28, fontWeight: 600, color: C.ok, opacity: r.labels, letterSpacing: '0.02em' }}>
        repair loop
      </div>
      {/* Gate pill: the loop condition. */}
      {r.gateLabel && (
        <div
          style={{
            ...abs,
            left: 0,
            width: W,
            top: GATE_PILL.y - 24,
            display: 'flex',
            justifyContent: 'center',
            opacity: r.labels,
            transform: `translateX(${shake}px)`,
          }}
        >
          <div
            style={{
              ...mono(GATE_PILL.size),
              height: 48,
              padding: '0 18px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: 10,
              background: C.card,
              border: `2px solid ${r.gateLock > 0.5 ? alpha(C.text, 0.7) : alpha(C.ok, 0.7)}`,
              color: r.gateLock > 0.5 ? C.text : C.ok,
              fontWeight: r.gateLock > 0.5 ? 700 : 400,
            }}
          >
            {r.gateLabel}
          </div>
        </div>
      )}
      {/* The switch: the flag, which can only flip inside the walls. Never flips in this video. */}
      <div style={{ ...abs, left: 0, width: W, top: SWITCH.y - 30, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: r.switchOpacity * r.labels }}>
        <div style={{ width: 112, height: 60, borderRadius: 30, background: alpha(C.muted, 0.18), border: `3px solid ${alpha(C.ok, 0.8)}`, position: 'relative' }}>
          <div style={{ ...abs, left: 6, top: 6, width: 42, height: 42, borderRadius: 21, background: C.muted }} />
        </div>
      </div>
      <div style={{ ...abs, left: 0, width: W, top: SWITCH_LABEL.y - 16, textAlign: 'center', ...mono(SWITCH_LABEL.size), color: C.text, opacity: r.switchOpacity * r.labels }}>
        evidence_capped_failure = True
      </div>
      {/* Initial value at the door. */}
      <div
        style={{
          ...abs,
          left: FALSE_TAG.x,
          top: FALSE_TAG.y,
          width: FALSE_TAG.w,
          height: FALSE_TAG.h,
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...mono(FALSE_TAG.size),
          fontWeight: 700,
          color: r.falseLit > 0.5 ? C.ok : C.muted,
          background: r.falseLit > 0 ? alpha(C.ok, 0.16 * r.falseLit) : C.card,
          border: `2px solid ${r.falseLit > 0 ? alpha(C.ok, lerp(0.4, 1, r.falseLit)) : alpha(C.muted, 0.4)}`,
          boxShadow: r.falseLit > 0 ? `0 0 ${28 * r.falseLit}px ${alpha(C.ok, 0.5 * r.falseLit)}` : 'none',
          opacity: r.falseTag,
          transform: `scale(${1 + 0.12 * r.falseLit * (1 - r.falseLit) * 4})`,
        }}
      >
        = False
      </div>
      {/* Where the flag can be set. */}
      <div style={{ ...abs, left: 0, width: W, top: ROOM.y1 - 56, textAlign: 'center', fontSize: 26, fontWeight: 600, color: C.ok, opacity: r.traceLabel }}>
        where the flag can be set
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- the note card

const NoteCard: React.FC<{ c: CardState }> = ({ c }) => {
  if (c.opacity <= 0) return null;
  const cw = CARD.font * MONO_W;
  const textTop = CARD.head;
  const filled = c.bracket.lines.join(' ');
  const shown = Math.round(filled.length * c.bracket.fill);
  let left = shown;
  const emStart = filled.indexOf(FIX_EMPHASIS);
  let offset = 0;
  return (
    <div
      style={{
        ...abs,
        left: c.x,
        top: c.y,
        width: c.w,
        height: c.h,
        opacity: c.opacity,
        background: C.card,
        borderRadius: 18,
        border: `2px solid ${alpha(C.accentText, 0.28)}`,
        boxShadow: `0 18px 40px ${alpha(C.bg0, 0.7)}`,
        overflow: 'hidden',
        backgroundImage: `repeating-linear-gradient(180deg, transparent 0, transparent ${CARD.lh - 1}px, ${alpha(C.text, 0.035)} ${CARD.lh - 1}px, ${alpha(C.text, 0.035)} ${CARD.lh}px)`,
        backgroundPosition: `0 ${textTop}px`,
      }}
    >
      <div style={{ ...abs, left: CARD.padX, top: 16, fontSize: 24, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted }}>{c.header}</div>
      <div style={{ ...abs, left: CARD.padX, top: textTop, opacity: c.textOpacity }}>
        {c.lines.map((line, i) => (
          <div key={i} style={{ height: CARD.lh, display: 'flex', alignItems: 'center', fontFamily: MONO, fontSize: CARD.font, whiteSpace: 'pre', color: alpha(C.text, 0.92) }}>
            {c.redacted > 0.5
              ? // Reviewer brief: bars, with the clause still highlighted.
                line.map((sgm, k) => (
                  <span
                    key={k}
                    style={{
                      display: 'inline-block',
                      width: sgm.text.length * cw,
                      height: 16,
                      borderRadius: 8,
                      background: sgm.hl ? alpha(C.accent2, 0.75) : alpha(C.muted, 0.3),
                    }}
                  />
                ))
              : line.map((sgm, k) => (
                  <span
                    key={k}
                    style={
                      sgm.hl
                        ? {
                            background: alpha(C.accent2, 0.3 + 0.2 * c.glow),
                            boxShadow: c.glow > 0 ? `0 0 ${18 * c.glow}px ${alpha(C.accent2, 0.55 * c.glow)}` : undefined,
                            color: C.text,
                            borderRadius: 4,
                          }
                        : undefined
                    }
                  >
                    {sgm.text}
                  </span>
                ))}
          </div>
        ))}
      </div>
      {/* The empty bracket: where "inside the repair loop" should be. */}
      {c.bracket.appear > 0 && (
        <div
          style={{
            ...abs,
            left: CARD.padX - 10,
            top: c.bracket.y - c.y,
            width: c.w - 2 * CARD.padX + 20,
            height: c.bracket.h,
            borderRadius: 10,
            border: c.bracket.fill > 0 ? `3px solid ${C.accentText}` : `2px dashed ${alpha(C.muted, 0.5)}`,
            background: c.bracket.fill > 0 ? alpha(C.accent, 0.12) : 'transparent',
            opacity: c.bracket.appear,
            padding: `${CARD.bracketPad / 2}px 10px`,
            boxSizing: 'border-box',
          }}
        >
          {c.bracket.fill <= 0 ? (
            <div style={{ height: CARD.lh - 6, display: 'flex', alignItems: 'center', fontFamily: MONO, fontSize: CARD.font, color: alpha(C.muted, 0.55) }}>[ ]</div>
          ) : (
            c.bracket.lines.map((ln, li) => {
              const start = offset;
              offset += ln.length + 1;
              const take = Math.max(0, Math.min(ln.length, left));
              left -= take + 1;
              const text = ln.slice(0, take);
              // Split the visible text around the emphasis.
              const a = Math.max(0, Math.min(text.length, emStart - start));
              const b = Math.max(0, Math.min(text.length, emStart + FIX_EMPHASIS.length - start));
              return (
                <div key={li} style={{ height: CARD.lh, display: 'flex', alignItems: 'center', fontFamily: MONO, fontSize: CARD.font, whiteSpace: 'pre', color: C.text, fontWeight: 700 }}>
                  <span>{text.slice(0, a)}</span>
                  {b > a && (
                    <span style={{ ...gradientText, textDecoration: 'underline', textDecorationColor: C.accentText, textDecorationThickness: 3, textUnderlineOffset: 6 }}>
                      {text.slice(a, b)}
                    </span>
                  )}
                  <span>{text.slice(b)}</span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------- pieces

const ChipBox: React.FC<{ label: string; sub: string; x: number; y: number; w: number; h?: number; appear: number; active: number }> = ({ label, sub, x, y, w, h = 84, appear, active }) => (
  <div
    style={{
      ...abs,
      left: x,
      top: y,
      width: w,
      height: h,
      opacity: appear,
      transform: `translateY(${(1 - appear) * -12}px)`,
      borderRadius: 14,
      background: active > 0 ? alpha(C.accent, 0.1 + 0.12 * active) : C.card,
      border: `2px solid ${active > 0 ? alpha(C.accentText, 0.3 + 0.6 * active) : alpha(C.muted, 0.3)}`,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      lineHeight: 1.15,
    }}
  >
    <div style={{ fontSize: 30, fontWeight: 800, color: C.text }}>{label}</div>
    {sub && <div style={{ fontSize: 24, fontWeight: 500, color: C.muted }}>{sub}</div>}
  </div>
);

const Arrow: React.FC<{ x: number; y: number; draw: number; vertical?: boolean; len?: number }> = ({ x, y, draw, vertical, len = 36 }) => (
  <svg width={vertical ? 40 : len} height={vertical ? len : 40} style={{ ...abs, left: vertical ? x - 20 : x, top: vertical ? y : y - 20, opacity: draw, overflow: 'visible' }}>
    {vertical ? (
      <>
        <line x1={20} y1={0} x2={20} y2={len * draw - 4} stroke={C.accentText} strokeWidth={3} strokeDasharray="5 6" />
        <path d={`M 11 ${len * draw - 12} L 20 ${len * draw} L 29 ${len * draw - 12}`} fill="none" stroke={C.accentText} strokeWidth={3} strokeLinecap="round" />
      </>
    ) : (
      <>
        <line x1={0} y1={20} x2={len * draw - 4} y2={20} stroke={C.accentText} strokeWidth={3} />
        <path d={`M ${len * draw - 11} 11 L ${len * draw} 20 L ${len * draw - 11} 29`} fill="none" stroke={C.accentText} strokeWidth={3} strokeLinecap="round" />
      </>
    )}
  </svg>
);

const Pill: React.FC<{ x: number; y: number; w: number; text: React.ReactNode; color: string; appear: number; size?: number; strong?: boolean }> = ({ x, y, w, text, color, appear, size = 32, strong = true }) => (
  <div
    style={{
      ...abs,
      left: x,
      top: y,
      width: w,
      height: 64,
      borderRadius: 14,
      opacity: appear,
      transform: `scale(${0.85 + 0.15 * appear})`,
      background: alpha(color, strong ? 0.16 : 0.06),
      border: `3px solid ${alpha(color, strong ? 0.95 : 0.5)}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size,
      fontWeight: strong ? 800 : 500,
      color: strong ? color : C.text,
      whiteSpace: 'nowrap',
    }}
  >
    {text}
  </div>
);

const PROPOSAL_BOX = { x: 140, y: 712, w: 680, h: 68 } as const;
const STAMP = { y: 796, w: 150, h: 64, xs: [150, 316, 494, 660] } as const;
const PILLS_Y = 984;

const Stamp: React.FC<{ x: number; who: string; appear: number }> = ({ x, who, appear }) => (
  <div
    style={{
      ...abs,
      left: x,
      top: STAMP.y,
      width: STAMP.w,
      height: STAMP.h,
      opacity: appear,
      transform: `rotate(-7deg) scale(${lerp(1.7, 1, appear)})`,
      border: `4px solid ${C.flag}`,
      borderRadius: 10,
      background: alpha(C.flag, 0.12),
      color: C.flag,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      lineHeight: 1.05,
    }}
  >
    <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.9 }}>{who}</div>
    <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: '0.06em' }}>ACCEPT</div>
  </div>
);

const VERDICT_STYLE: Record<Verdict, { color: string; dashed?: boolean }> = {
  Invalid: { color: C.muted },
  Reject: { color: C.ok },
  Accept: { color: C.flag },
  Context: { color: C.text, dashed: true },
};

const GRID = { y0: 250, label: 290, cell: 150, cellH: 84, gap: 10, groupGap: 24, rowH: 116 } as const;
const cellX = (k: number) => GRID.label + k * (GRID.cell + GRID.gap) + (k >= 2 ? GRID.groupGap : 0);

const GridView: React.FC<{ g: ScopeState['grid'] }> = ({ g }) => {
  if (g.appear <= 0) return null;
  const head = (k0: number, label: string) => (
    <div style={{ ...abs, left: cellX(k0), width: 2 * GRID.cell + GRID.gap, top: GRID.y0, textAlign: 'center', fontSize: 30, fontWeight: 800, color: C.text }}>{label}</div>
  );
  return (
    <div style={{ ...abs, inset: 0, opacity: g.appear }}>
      <div style={{ ...abs, left: -60, right: -60, top: -40, bottom: -40, background: alpha(C.bg0, 0.97) }} />
      {head(0, 'GPT-5.6 Sol')}
      {head(2, 'Claude Opus 5')}
      {GRID_ROWS.map((row, i) => {
        const y = GRID.y0 + 70 + i * GRID.rowH;
        const a = g.rows[i];
        return (
          <div key={i} style={{ ...abs, left: 0, top: y, width: W, height: GRID.cellH, opacity: a, transform: `translateY(${(1 - a) * 16}px)` }}>
            <div style={{ ...abs, left: 0, top: 0, width: GRID.label - 20, height: GRID.cellH, display: 'flex', alignItems: 'center', fontSize: 28, fontWeight: 600, color: C.text, lineHeight: 1.15 }}>
              {row.label}
            </div>
            {row.cells.map((v, k) => {
              const st = VERDICT_STYLE[v];
              return (
                <div
                  key={k}
                  style={{
                    ...abs,
                    left: cellX(k),
                    top: 0,
                    width: GRID.cell,
                    height: GRID.cellH,
                    borderRadius: 10,
                    border: `3px ${st.dashed ? 'dashed' : 'solid'} ${alpha(st.color, st.dashed ? 0.55 : 0.9)}`,
                    background: v === 'Accept' ? alpha(C.flag, 0.1) : v === 'Reject' ? alpha(C.ok, 0.08) : C.card,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 28,
                    fontWeight: 800,
                    color: st.color,
                  }}
                >
                  {v}
                </div>
              );
            })}
            <div style={{ ...abs, left: 0, right: 0, top: GRID.cellH + 16, height: 1, background: alpha(C.muted, 0.18) }} />
          </div>
        );
      })}
      <div style={{ ...abs, left: 0, width: W, top: GRID.y0 + 70 + 4 * GRID.rowH + 24, textAlign: 'center', opacity: g.tag }}>
        <div style={{ fontSize: 40, fontWeight: 800, ...gradientText, display: 'inline-block' }}>1 case · 2 repetitions per model</div>
        <div style={{ fontSize: 24, color: C.muted, marginTop: 14 }}>Context = asks for additional information</div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- component

export const ScopeNote: React.FC<AnimProps & ScopeProps> = ({ t, beats, dur, vertical, mode, sentence }) => {
  const s = frameState({ mode, sentence }, t, beats, dur);
  return (
    <Stage vertical={vertical} fill>
      <div style={{ ...abs, left: 0, top: 0, width: W, height: H }}>
        {/* Code panel (scenes 2-3). */}
        {s.code.lines.length > 0 && (
          <>
            <div style={{ ...abs, left: CODE.x, top: CODE.y, width: CODE.w, height: CODE_H, borderRadius: 16, background: C.pane, border: `2px solid ${C.line}`, opacity: s.code.panel }} />
            {s.code.lines.map((ln, i) => {
              const [a, b] = ln.keep;
              const fadeOut = 1 - ln.fade;
              return (
                <div
                  key={i}
                  style={{
                    ...abs,
                    left: ln.x,
                    top: ln.y,
                    height: ln.size * 1.4,
                    display: 'flex',
                    alignItems: 'center',
                    fontFamily: MONO,
                    fontSize: ln.size,
                    whiteSpace: 'pre',
                    opacity: ln.opacity,
                    color: ln.text.trim().startsWith('#') ? alpha(C.muted, 0.8) : alpha(C.text, 0.85),
                  }}
                >
                  <span style={{ opacity: fadeOut }}>{ln.text.slice(0, a)}</span>
                  <span
                    style={{
                      color: ln.glow > 0 ? C.ok : undefined,
                      background: ln.glow > 0 ? alpha(C.ok, 0.14 * ln.glow) : undefined,
                      borderRadius: 4,
                    }}
                  >
                    {ln.text.slice(a, b)}
                  </span>
                  <span style={{ opacity: fadeOut }}>{ln.text.slice(b)}</span>
                </div>
              );
            })}
          </>
        )}

        {/* Writer flow (scene 2): GPT reads the code, writes a note for a reviewer. */}
        {s.writer.appear > 0 && (
          <>
            <ChipBox label="GPT" sub="" x={W / 2 - 110} y={CODE_H + 30} w={220} h={72} appear={s.writer.appear} active={1} />
            <Arrow x={W / 2} y={CODE_H + 108} vertical len={56} draw={s.writer.arrow1} />
            <div
              style={{
                ...abs,
                left: 200,
                top: CODE_H + 172,
                width: 560,
                height: 290,
                borderRadius: 16,
                background: C.card,
                border: `2px solid ${alpha(C.accentText, 0.28)}`,
                opacity: s.writer.arrow1,
              }}
            >
              <div style={{ ...abs, left: 26, top: 16, fontSize: 22, fontWeight: 700, letterSpacing: '0.12em', color: C.muted }}>NOTE</div>
              {[0.86, 0.7, 0.92, 0.55, 0.78].map((wd, k) => {
                const p = Math.min(1, Math.max(0, s.writer.fill * 5 - k));
                return <div key={k} style={{ ...abs, left: 26, top: 70 + k * 42, width: 508 * wd * p, height: 18, borderRadius: 8, background: alpha(C.muted, 0.35) }} />;
              })}
            </div>
            <Arrow x={W / 2} y={CODE_H + 470} vertical len={56} draw={s.writer.arrow2} />
            <ChipBox label="reviewer" sub="" x={W / 2 - 130} y={CODE_H + 534} w={260} h={72} appear={s.writer.reviewer} active={0} />
          </>
        )}

        {/* Room, shadow and token. */}
        {(s.room.opacity > 0 || s.shadow.appear > 0) && (s.code.lines.length === 0 || s.room.walls > 0) && (
          <>
            <RoomSvg s={s} />
            <RoomLabels s={s} />
          </>
        )}
        {s.token.appear > 0 && (
          <div
            style={{
              ...abs,
              left: 330,
              top: 474 + s.token.dy,
              width: 550,
              height: 140,
              borderRadius: 14,
              background: alpha(C.card, 0.95),
              border: `2px solid ${alpha(C.text, 0.55)}`,
              boxShadow: `0 12px 30px ${alpha(C.bg0, 0.6)}`,
              opacity: s.token.appear,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '0 22px',
              boxSizing: 'border-box',
              lineHeight: 1.3,
            }}
          >
            {TOKEN_LINES.map((ln, k) => (
              <div key={k} style={{ fontSize: 27, fontWeight: k === 2 ? 800 : 500, color: k === 2 ? C.text : alpha(C.text, 0.88), whiteSpace: 'nowrap' }}>
                {ln}
              </div>
            ))}
          </div>
        )}
        {/* The shadow lies over the token too: drawn again, faintly, on top of it. */}
        {s.token.appear > 0 && s.shadow.spill > 0 && (
          <div
            style={{
              ...abs,
              left: 330,
              top: 474 + s.token.dy,
              width: 550,
              height: 140,
              borderRadius: 14,
              background: alpha(C.accent2, 0.16 * s.shadow.spill * s.shadow.appear),
              opacity: s.token.appear,
            }}
          />
        )}

        <NoteCard c={s.card} />

        {/* Review cards: mini stack in the hook, a 4 x 4 block in scene 6. */}
        {s.reviews.cards.length > 0 &&
          (s.reviews.mini ? (
            <>
              {s.reviews.cards.map((c, i) => (
                <div
                  key={i}
                  style={{
                    ...abs,
                    left: 724 + (i % 4) * 50,
                    top: 192 + Math.floor(i / 4) * 50,
                    width: 44,
                    height: 44,
                    borderRadius: 8,
                    background: alpha(C.ok, 0.12),
                    border: `2px solid ${alpha(C.ok, 0.7)}`,
                    opacity: c.appear,
                    transform: `translateY(${(1 - c.appear) * -20}px)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div style={{ opacity: c.tick }}>
                    <Tick size={30} />
                  </div>
                </div>
              ))}
              <div style={{ ...abs, left: 720, width: 200, top: 392, textAlign: 'center', lineHeight: 1 }}>
                <span style={{ fontSize: 44, fontWeight: 900, ...gradientText }}>{s.reviews.counter}</span>
                <span style={{ fontSize: 22, fontWeight: 600, color: C.muted }}> / 16 ✓</span>
              </div>
            </>
          ) : (
            <>
              {s.reviews.cards.map((c, i) => (
                <div
                  key={i}
                  style={{
                    ...abs,
                    left: REVIEW.x0 + (i % 4) * (REVIEW.w + REVIEW.gap),
                    top: REVIEW.y0 + Math.floor(i / 4) * (REVIEW.h + REVIEW.gap),
                    width: REVIEW.w,
                    height: REVIEW.h,
                    borderRadius: 12,
                    background: alpha(C.card, 0.9),
                    border: `2px solid ${alpha(C.ok, 0.25 + 0.6 * c.tick)}`,
                    opacity: c.appear,
                    transform: `translateX(${(1 - c.appear) * 60}px)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 16px',
                    boxSizing: 'border-box',
                  }}
                >
                  <div style={{ fontSize: 24, fontWeight: 600, color: C.muted, whiteSpace: 'nowrap' }}>{c.label}</div>
                  <div style={{ opacity: c.tick, transform: `scale(${0.6 + 0.4 * c.tick})` }}>
                    <Tick size={40} />
                  </div>
                </div>
              ))}
              <div style={{ ...abs, left: 0, width: W, top: REVIEW.y0 + 4 * (REVIEW.h + REVIEW.gap) + 14, textAlign: 'center', opacity: s.reviews.counterOpacity }}>
                <span style={{ fontSize: 84, fontWeight: 900, ...gradientText }}>{s.reviews.counter} / 16</span>
              </div>
            </>
          ))}

        {/* Code vs note readings, proposal, stamps, GPT's reason. */}
        <Pill x={140} y={PILLS_Y} w={300} text="code → False" color={C.ok} appear={s.pills.code} />
        {s.pills.checked > 0 && (
          <div
            style={{
              ...abs,
              left: 454,
              top: PILLS_Y + 6,
              width: 372,
              height: 52,
              borderRadius: 26,
              border: `2px solid ${alpha(C.ok, 0.5)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              fontWeight: 600,
              color: C.text,
              whiteSpace: 'nowrap',
              opacity: s.pills.checked,
              gap: 8,
            }}
          >
            <Tick size={24} /> checked by running the function
          </div>
        )}
        <Pill x={520} y={PILLS_Y} w={300} text="note → True" color={C.accentText} appear={s.pills.note} />
        {s.proposal.appear > 0 && (
          <div
            style={{
              ...abs,
              left: PROPOSAL_BOX.x,
              top: PROPOSAL_BOX.y,
              width: PROPOSAL_BOX.w,
              height: PROPOSAL_BOX.h,
              borderRadius: 12,
              background: C.card,
              border: `2px solid ${alpha(C.text, 0.4)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: s.proposal.appear,
              transform: `translateY(${(1 - s.proposal.appear) * 20}px)`,
            }}
          >
            <span style={{ fontSize: 20, fontWeight: 700, color: C.muted, letterSpacing: '0.1em', marginRight: 14 }}>PROPOSAL</span>
            <span style={{ fontFamily: MONO, fontSize: 25, color: C.text, whiteSpace: 'pre' }}>{s.proposal.text}</span>
          </div>
        )}
        {s.stamps.map((st, k) => (st.appear > 0 ? <Stamp key={k} x={STAMP.xs[st.slot]} who={st.who} appear={st.appear} /> : null))}
        {s.quote > 0 && (
          <div style={{ ...abs, left: 150, width: 660, top: 874, opacity: s.quote, fontSize: 25, lineHeight: 1.3, fontStyle: 'italic', color: alpha(C.text, 0.9) }}>
            <span style={{ fontStyle: 'normal', fontWeight: 800, color: C.flag, marginRight: 10 }}>GPT:</span>
            {QUOTE}
          </div>
        )}

        {/* Top row: model chips, the handoff chain. */}
        {s.chips.map((c, k) => (
          <ChipBox key={k} label={c.label} sub={c.sub} x={c.x} y={0} w={c.w} appear={c.appear} active={c.active} />
        ))}
        {s.chainArrows.map((d, k) => (
          <Arrow key={k} x={(k + 1) * 332 - 34} y={42} len={34} draw={d} />
        ))}
        {s.lostTag > 0 && (
          <div
            style={{
              ...abs,
              left: 150,
              top: 70,
              padding: '4px 14px',
              borderRadius: 10,
              background: C.bg1,
              border: `2px solid ${alpha(C.accentText, 0.8)}`,
              fontSize: 22,
              fontWeight: 700,
              color: C.accentText,
              opacity: s.lostTag,
              whiteSpace: 'nowrap',
            }}
          >
            loop condition lost here
          </div>
        )}

        <GridView g={s.grid} />

        {/* Hook title, drawn from the first frame. */}
        {s.title.opacity > 0 && (
          <div style={{ ...abs, left: 0, top: 0, width: W, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: 18, fontSize: 66, fontWeight: 800, lineHeight: 1.12 }}>
            {s.title.words.map((w, k) => (
              <span key={k} style={w.accent ? { ...gradientText, opacity: 0.72 + 0.28 * w.lit } : { color: C.text, opacity: 0.72 + 0.28 * w.lit }}>
                {w.w}
              </span>
            ))}
          </div>
        )}
      </div>
    </Stage>
  );
};

