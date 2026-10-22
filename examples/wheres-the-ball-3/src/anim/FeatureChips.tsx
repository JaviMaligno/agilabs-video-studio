import React from 'react';
import { C, GRADIENT, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { frameState, type FeatureChipsProps } from './FeatureChips.state.ts';
import { BOX, VIEW_HALF, type PlayData } from './pitch.ts';
import { Arrow, Ball, Marker, PitchFrame, Players } from './pieces.tsx';
import { CREDIT } from './PitchPlayback.tsx';
import play from '../data/play.json';

export { frameState };
export type { FeatureChipsProps };

const DATA = play as unknown as PlayData;
const PANEL_TOP = BOX.half.top + BOX.half.h + 18;

/** The point each feature draws on the pitch (metres), brighter and larger when lit. */
const Glyphs: React.FC<{ s: ReturnType<typeof frameState> }> = ({ s }) => {
  const f = s.features;
  const on = Object.fromEntries(s.chips.map((c) => [c.id, c]));
  const g = (id: string, node: React.ReactNode) => {
    const c = on[id];
    if (!c || c.appear <= 0) return null;
    return (
      <g key={id} opacity={c.appear * (0.75 + 0.25 * c.lit)}>
        {node}
      </g>
    );
  };
  const k = (id: string) => 1 + 0.5 * (on[id]?.lit ?? 0);
  return (
    <>
      {g(
        'spread',
        f.spread.map((e, i) => (
          <ellipse key={i} cx={e.x} cy={e.y} rx={e.rx * 1.6} ry={e.ry * 1.6} fill="none" stroke={i === 0 ? C.accentText : C.text} strokeWidth={0.28} strokeDasharray="1.2 0.8" opacity={0.6} />
        )),
      )}
      {g('dense', <circle cx={f.dense.x} cy={f.dense.y} r={6} fill={alpha(C.accentText, 0.1)} stroke={C.accentText} strokeWidth={0.3} strokeDasharray="1 0.7" />)}
      {g(
        'closest',
        <>
          <line x1={f.pair[0].x} y1={f.pair[0].y} x2={f.pair[1].x} y2={f.pair[1].y} stroke={C.text} strokeWidth={0.4} />
          <circle cx={f.closest.x} cy={f.closest.y} r={0.7} fill={C.text} />
        </>,
      )}
      {g(
        'convergence',
        <rect x={f.convergence.x - 1.2} y={f.convergence.y - 1.2} width={2.4} height={2.4} transform={`rotate(45 ${f.convergence.x} ${f.convergence.y})`} fill="none" stroke={C.text} strokeWidth={0.4} />,
      )}
      {g('fastest', <circle cx={f.fastest.x} cy={f.fastest.y} r={2.7 * k('fastest')} fill="none" stroke={C.accentText} strokeWidth={0.5 * k('fastest')} />)}
      {g(
        'centre',
        <>
          <circle cx={f.centre.x} cy={f.centre.y} r={1.7 * k('centre')} fill={alpha(C.bg0, 0.6)} stroke={C.text} strokeWidth={0.45 * k('centre')} />
          <line x1={f.centre.x - 2.6 * k('centre')} y1={f.centre.y} x2={f.centre.x + 2.6 * k('centre')} y2={f.centre.y} stroke={C.text} strokeWidth={0.3} />
          <line x1={f.centre.x} y1={f.centre.y - 2.6 * k('centre')} x2={f.centre.x} y2={f.centre.y + 2.6 * k('centre')} stroke={C.text} strokeWidth={0.3} />
        </>,
      )}
      {g('weighted', <circle cx={f.weighted.x} cy={f.weighted.y} r={1.3} fill={C.accent} stroke={C.text} strokeWidth={0.3} />)}
    </>
  );
};

/** The hand-written features (see FeatureChips.state.ts). */
export const FeatureChips: React.FC<AnimProps & FeatureChipsProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur, DATA);
  const m = s.marker;
  const svg = (
    <>
      {s.mode === 'chips' && <Glyphs s={s} />}
      {m.opacity > 0 &&
        s.players.map((q, i) => (
          <line key={`r${i}`} x1={q.x} y1={q.y} x2={m.x} y2={m.y} stroke={C.accentText} strokeWidth={0.18 + 0.25 * q.bright} opacity={m.converge * (1 - m.land) * (0.25 + 0.5 * q.bright)} />
        ))}
      {s.arrows > 0 && s.players.map((q, i) => <Arrow key={`a${i}`} x0={q.x} y0={q.y} x1={q.ax} y1={q.ay} opacity={0.3 + 0.7 * q.bright} w={0.4 + 0.45 * q.bright} />)}
      <Players players={s.players.map((q) => ({ ...q, opacity: s.mode === 'importance' ? 0.55 + 0.45 * q.bright : 0.9 }))} />
      <Ball x={s.ball.x} y={s.ball.y} opacity={s.ball.opacity} glow={s.ball.glow} />
      <Marker x={m.x} y={m.y} opacity={m.opacity} />
    </>
  );
  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily, color: C.text }}>
      <PitchFrame box={BOX.half} view={VIEW_HALF} credit={CREDIT} svg={svg} />

      {s.mode === 'chips' && (
        <div style={{ position: 'absolute', left: 60, width: 960, top: PANEL_TOP, display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 18, rowGap: 10 }}>
          {s.chips.map((c) => (
            <div
              key={c.id}
              style={{
                height: 52,
                borderRadius: 999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 32,
                fontWeight: 700,
                whiteSpace: 'nowrap',
                color: c.lit > 0 ? C.text : c.id === 'more' ? C.muted : C.text,
                background: c.lit > 0 ? GRADIENT : alpha(C.card, 0.95),
                border: `2px solid ${alpha(C.accentText, 0.35 + 0.6 * c.lit)}`,
                boxShadow: c.lit > 0 ? `0 0 ${30 * c.lit}px ${alpha(C.accent, 0.6)}` : 'none',
                opacity: c.appear,
                transform: `translateY(${(1 - c.appear) * -60}px) rotate(${(1 - c.appear) * (c.id.length % 2 ? 8 : -8)}deg) scale(${1 + 0.05 * c.lit})`,
              }}
            >
              {c.label}
            </div>
          ))}
        </div>
      )}

      {s.mode === 'importance' && s.panel > 0 && (
        <div style={{ position: 'absolute', left: 60, width: 960, top: PANEL_TOP, opacity: s.panel }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: C.muted, marginBottom: 12 }}>error rise when shuffled</div>
          {s.bars.map((b, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 20, height: 58 }}>
              <div style={{ width: 400, fontSize: 34, fontWeight: 700, color: b.top ? C.text : C.muted, whiteSpace: 'nowrap', opacity: i === 2 ? 0.6 : 1 }}>{b.label}</div>
              <div style={{ position: 'relative', flex: 1, height: 36 }}>
                <div
                  style={{
                    width: `${Math.max(1.2, 100 * b.share) * b.grow}%`,
                    height: '100%',
                    borderRadius: 10,
                    background: b.top ? GRADIENT : alpha(C.muted, 0.6),
                    boxShadow: b.top ? `0 0 30px ${alpha(C.accent, 0.5)}` : 'none',
                  }}
                />
                {i === 2 && s.barely > 0 && (
                  <div style={{ position: 'absolute', left: 40, top: '50%', transform: 'translateY(-50%)', fontSize: 34, fontWeight: 700, fontStyle: 'italic', color: C.text, whiteSpace: 'nowrap', opacity: s.barely }}>
                    the elegant one barely helped
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
