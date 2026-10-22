import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { gradientText } from './Stage.tsx';
import { MONO, Mark, Stamp } from './pieces.tsx';
import { CODE } from './CodeDegrader.state.ts';
import { BUDGET, CAVEATS, HELPS, SMALL_TURNS, frameState, type Run, type TurnBudgetProps } from './TurnBudget.state.ts';

export { frameState };
export type { TurnBudgetProps };

const CLEAN = alpha(C.accentText, 0.85);
const HATCH = `repeating-linear-gradient(135deg, ${C.warm} 0 7px, ${alpha(C.warm, 0.55)} 7px 12px)`;

/** 40 slots; filled ones in the run's colour; empty ones glow teal when `glow` > 0. */
const Track: React.FC<{ x: number; y: number; w: number; h: number; run: Run; dirty?: boolean; glow?: number; wall?: { pop: number; hit: number }; count?: string }> = ({
  x,
  y,
  w,
  h,
  run,
  dirty,
  glow = 0,
  wall,
  count,
}) => {
  const pitch = w / BUDGET;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, opacity: run.opacity }}>
      {Array.from({ length: BUDGET }, (_, i) => {
        const f = Math.min(1, Math.max(0, run.slots - i));
        return (
          <div key={i} style={{ position: 'absolute', left: i * pitch, top: 0, width: pitch - Math.max(2, pitch * 0.18), height: h, borderRadius: Math.min(6, pitch / 3), background: f < 1 && glow > 0 ? alpha(C.ok, 0.12 + 0.45 * glow) : alpha(C.muted, 0.14) }}>
            {f > 0 && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${f * 100}%`, borderRadius: 'inherit', background: dirty ? HATCH : CLEAN }} />}
          </div>
        );
      })}
      {wall && wall.pop > 0 && (
        <div
          style={{
            position: 'absolute',
            left: w + 4,
            top: -16,
            width: 14,
            height: h + 32,
            borderRadius: 7,
            background: C.marker,
            boxShadow: `0 0 ${30 * wall.hit}px ${alpha(C.marker, 0.9 * wall.hit)}`,
            opacity: Math.min(1, wall.pop * 1.4),
            transform: `scaleY(${0.3 + 0.7 * wall.pop})`,
          }}
        />
      )}
      {count && (
        <div style={{ position: 'absolute', left: w + 34, top: 0, height: h, display: 'flex', alignItems: 'center', gap: 8, fontSize: Math.max(34, h * 0.7), fontWeight: 800, color: C.text }}>
          {count}
          {run.tick > 0 && (
            <span style={{ opacity: run.tick }}>
              <Mark size={Math.max(34, h * 0.6)} color={C.ok} />
            </span>
          )}
        </div>
      )}
    </div>
  );
};

const Kicker: React.FC<{ top: number; left?: number; children: React.ReactNode; color?: string }> = ({ top, left = 60, children, color = C.muted }) => (
  <div style={{ position: 'absolute', left, top, fontSize: 30, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color }}>{children}</div>
);
const RowLabel: React.FC<{ top: number; children: React.ReactNode; color?: string }> = ({ top, children, color = C.text }) => (
  <div style={{ position: 'absolute', left: 60, top, fontSize: 32, fontWeight: 700, color }}>{children}</div>
);

const TR = { x: 60, w: 800, h: 62 };
const READ_LINES = CODE.map((l) => l.dirty).filter(Boolean);

export const TurnBudget: React.FC<AnimProps & TurnBudgetProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const mode = p.mode;

  if (mode === 'track') {
    return (
      <AbsoluteFill style={{ fontFamily, color: C.text }}>
        <div style={{ position: 'absolute', left: 60, top: 440, width: 960, height: 330, borderRadius: 22, background: C.card, border: `3px solid ${alpha(C.muted, 0.35)}`, overflow: 'hidden', opacity: s.file.opacity, boxSizing: 'border-box' }}>
          <Kicker top={18} left={28} color={C.warm}>
            the open file, unreadable
          </Kicker>
          {READ_LINES.map((l, i) => {
            const done = Math.min(1, Math.max(0, s.file.row - i));
            const on = s.file.row > i && s.file.row < i + 1;
            return (
              <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: 76 + i * 60, height: 60 }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${done * 100}%`, background: alpha(C.warm, on ? 0.22 : 0.1) }} />
                <div style={{ position: 'absolute', left: 30, top: 0, lineHeight: '60px', fontFamily: MONO, fontSize: 34, color: C.warm, whiteSpace: 'pre' }}>{l}</div>
              </div>
            );
          })}
        </div>
        <div style={{ opacity: s.readRun.opacity }}>
          <Kicker top={830} color={C.text}>
            turns used
          </Kicker>
        </div>
        <Track x={TR.x} y={890} w={TR.w} h={80} run={s.readRun} dirty wall={s.wall} />
        <div style={{ position: 'absolute', left: 560, width: 460, top: 1010, textAlign: 'right', opacity: s.wall.pop }}>
          <div style={{ fontSize: 96, fontWeight: 800, color: C.marker, lineHeight: 1 }}>40</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: C.text, marginTop: 6 }}>turns per run</div>
        </div>
      </AbsoluteFill>
    );
  }

  if (mode === 'verdict') {
    const v = s.verdict;
    const ROW = 168;
    return (
      <AbsoluteFill style={{ fontFamily, color: C.text }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 430, display: 'flex', justifyContent: 'center', opacity: Math.min(1, v.pop * 1.4), transform: `scale(${1.5 - 0.5 * v.pop})` }}>
          <div style={{ fontSize: 92, fontWeight: 800, letterSpacing: '0.02em', ...gradientText }}>Only sometimes.</div>
        </div>
        {/* the checklist: what helps, item by item */}
        <div
          style={{
            position: 'absolute',
            left: 60,
            width: 960,
            top: 590,
            height: 610,
            borderRadius: 26,
            background: C.card,
            border: `3px solid ${alpha(C.muted, 0.35)}`,
            boxSizing: 'border-box',
            opacity: v.list,
            transform: `translateY(${(1 - v.list) * 30}px)`,
          }}
        >
          <Kicker top={30} left={40} color={C.accentText}>
            what helps an agent
          </Kicker>
          {HELPS.map((h, i) => {
            const a = v.items[i];
            const color = h.sure ? C.ok : C.muted;
            return (
              <div key={h.title} style={{ position: 'absolute', left: 40, right: 40, top: 100 + i * ROW, height: ROW - 16, display: 'flex', alignItems: 'center', gap: 30, opacity: a, transform: `translateX(${(1 - a) * -40}px)` }}>
                <div style={{ width: 92, height: 92, flex: 'none', borderRadius: 20, border: `5px solid ${color}`, background: alpha(color, 0.14), display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}>
                  {h.sure ? <Mark size={64} color={color} /> : <div style={{ fontSize: 76, fontWeight: 800, color, lineHeight: 1, marginTop: -8 }}>~</div>}
                </div>
                <div>
                  <div style={{ fontSize: 58, fontWeight: 800, lineHeight: 1.1, color: h.sure ? C.text : C.muted }}>{h.title}</div>
                  <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.25, color: C.muted, marginTop: 8 }}>{h.sub}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ position: 'absolute', left: 60, width: 960, top: 1236, display: 'flex', justifyContent: 'center', gap: 18 }}>
          {CAVEATS.map((c, i) => (
            <div key={c} style={{ padding: '8px 20px', borderRadius: 26, border: `3px solid ${alpha(C.muted, 0.7)}`, color: C.muted, fontSize: 30, fontWeight: 700, whiteSpace: 'nowrap', opacity: v.caveats[i] }}>
              {c}
            </div>
          ))}
        </div>
      </AbsoluteFill>
    );
  }

  // small, large, margin: the two libraries stacked.
  const sm = s.small;
  const lg = s.large;
  const smallTop = 440;
  const largeTop = 820;
  return (
    <AbsoluteFill style={{ fontFamily, color: C.text }}>
      <div style={{ position: 'absolute', inset: 0, opacity: sm.opacity * (1 - 0.6 * sm.dim) }}>
        <Kicker top={smallTop} color={C.ok}>
          small library · strong model
        </Kicker>
        <RowLabel top={smallTop + 52}>clean</RowLabel>
        <Track x={TR.x} y={smallTop + 98} w={TR.w} h={TR.h} run={sm.clean} wall={s.wall} count={sm.clean.slots > 0.05 ? String(Math.round(sm.clean.slots)) : undefined} glow={s.glow} />
        <RowLabel top={smallTop + 178} color={C.warm}>
          degraded
        </RowLabel>
        <Track x={TR.x} y={smallTop + 224} w={TR.w} h={TR.h} run={sm.dirty} dirty wall={s.wall} count={sm.dirty.slots > 0.05 ? String(Math.round(sm.dirty.slots)) : undefined} glow={s.glow} />
        {/* the margin: the empty rest of the track */}
        <div style={{ position: 'absolute', left: TR.x + (TR.w * SMALL_TURNS) / BUDGET + 4, top: smallTop + 300, width: (TR.w * (BUDGET - SMALL_TURNS)) / BUDGET - 8, height: 60, opacity: sm.margin }}>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 6, height: 18, borderLeft: `4px solid ${C.ok}`, borderRight: `4px solid ${C.ok}`, borderBottom: `4px solid ${C.ok}` }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: 26, textAlign: 'center', fontSize: 36, fontWeight: 800, color: C.ok }}>margin</div>
        </div>
      </div>
      <div style={{ position: 'absolute', inset: 0, opacity: lg.opacity }}>
        <Kicker top={largeTop} color={C.marker}>
          large library
        </Kicker>
        <RowLabel top={largeTop + 52}>clean</RowLabel>
        <Track x={TR.x} y={largeTop + 98} w={TR.w} h={TR.h} run={lg.clean} wall={s.wall} count={lg.clean.slots > 0.05 ? String(Math.round(lg.clean.slots)) : undefined} glow={s.glow} />
        <RowLabel top={largeTop + 178} color={C.warm}>
          degraded
        </RowLabel>
        <Track x={TR.x} y={largeTop + 224} w={TR.w} h={TR.h} run={lg.dirty} dirty wall={s.wall} count={lg.dirty.slots > 0.05 ? String(Math.round(lg.dirty.slots)) : undefined} />
        <Stamp text="out of turns" color={C.marker} pop={lg.stamp * (1 - s.quote.pop)} style={{ left: 330, top: largeTop + 320 }} />
      </div>
      {s.quote.pop > 0 && (
        <div style={{ position: 'absolute', left: 60, width: 960, top: largeTop + 330, display: 'flex', justifyContent: 'center', opacity: s.quote.pop, transform: `translateY(${(1 - s.quote.pop) * 24}px)` }}>
          <div style={{ fontSize: 70, fontWeight: 800, letterSpacing: '-0.01em', ...gradientText }}>How much margin is left?</div>
        </div>
      )}
      {/* the wall's figure */}
      <div style={{ position: 'absolute', left: TR.x + TR.w - 40, top: smallTop - 4, width: 80, textAlign: 'center', fontSize: 30, fontWeight: 800, color: C.marker, opacity: s.wall.pop }}>40</div>
    </AbsoluteFill>
  );
};

