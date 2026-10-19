import React from 'react';
import { interpolate } from 'remotion';
import { C, GRADIENT, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { frameState, EPOCHS, type Curves, type MarkerState, type MonitorProps, type TraceState } from './LossMonitor.state.ts';
import { tileOf, toView, viewOf, viewSize, type ClipSet } from './DotStage.state.ts';
import { DEMO } from './LayaStage.state.ts';
import { mix } from './fields.tsx';
import { gradientText } from './Stage.tsx';
import clips from '../data/clips.json';
import curves from '../data/laya-curves.json';

export { frameState };
export type { MonitorProps };

const CLIPS = clips as unknown as ClipSet;
const DATA = curves as unknown as Curves;
const HOOK = CLIPS.hook;

// ---------------------------------------------------------------------------------------------
// Pieces

/** The hook clip as glowing dots in a w x h box: grey on the line, teal once its run learns. */
export const Dots: React.FC<{ playT: number; w: number; h: number; lit: number; dot: number; id: string; dim?: number; frame?: string }> = ({
  playT,
  w,
  h,
  lit,
  dot,
  id,
  dim = 1,
  frame,
}) => {
  const tile = tileOf(HOOK, playT);
  const view = viewOf(HOOK, 'stage');
  const vs = viewSize(view);
  const scale = Math.min(w / vs.w, h / vs.h);
  const ox = (w - vs.w * scale) / 2;
  const oy = (h - vs.h * scale) / 2;
  const P = (x: number, y: number) => {
    const q = toView(view, HOOK.field, x, y);
    return { x: ox + q.u * scale, y: oy + q.v * scale };
  };
  const fill = mix(C.muted, C.ok, lit);
  return (
    <div style={{ position: 'relative', width: w, height: h, borderRadius: 16, overflow: 'hidden', background: alpha(C.bg1, 0.92), boxShadow: `0 0 0 2px ${frame ?? alpha(C.muted, 0.16 + 0.3 * lit)}` }}>
      <svg width={w} height={h} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id={`glow-${id}`}>
            <stop offset="0%" stopColor={lit > 0.5 ? C.ok : C.muted} stopOpacity={0.5} />
            <stop offset="100%" stopColor={lit > 0.5 ? C.ok : C.muted} stopOpacity={0} />
          </radialGradient>
        </defs>
        <g opacity={tile.opacity * dim}>
          {tile.dots.map((q, i) =>
            q.trail.map((g, k) => {
              const p = P(g.x, g.y);
              return <circle key={`t${i}-${k}`} cx={p.x} cy={p.y} r={dot * (0.78 - k * 0.11)} fill={fill} opacity={0.3 * (1 - k / q.trail.length)} />;
            }),
          )}
          {tile.dots.map((q, i) => {
            const p = P(q.x, q.y);
            return <circle key={`g${i}`} cx={p.x} cy={p.y} r={dot * 2.6} fill={`url(#glow-${id})`} />;
          })}
          {tile.dots.map((q, i) => {
            const p = P(q.x, q.y);
            return <circle key={`d${i}`} cx={p.x} cy={p.y} r={dot} fill={fill} stroke={C.bg0} strokeWidth={dot * 0.12} />;
          })}
        </g>
      </svg>
    </div>
  );
};

const traceColour = (tr: StripTrace) => {
  if (tr.warm > 0) return C.warm;
  const base = mix(C.muted, C.ok, tr.lit);
  return tr.rose > 0 ? mix(C.muted, C.flat, tr.rose) : base;
};

/** A trace as the strip draws it: the wall's mini traces, the article's curves or the demo. */
export type StripTrace = Omit<TraceState, 'series' | 'dashed'> & { series: TraceState['series'] | 'DEMO'; dashed?: number };

const seriesOf = (tr: StripTrace, cell?: number[]): number[] => (tr.series === 'cell' ? (cell ?? []) : tr.series === 'DEMO' ? DEMO : DATA[tr.series]);

/** Monitor strip: the dashed guessing line, traces drawn up to their epoch, markers and the cut. */
export const Strip: React.FC<{
  w: number;
  h: number;
  xMax: number;
  yMin: number;
  yMax: number;
  traces: StripTrace[];
  cellTrace?: number[];
  markers?: MarkerState[];
  cut?: { epoch: number; opacity: number; text: string };
  power?: number;
  mini?: boolean;
  id: string;
  border?: string;
  chanceLabel?: boolean;
  /** 0..1: the "guessing" label lights up (said in the legend). */
  chanceGlow?: number;
  axisLabel?: boolean;
}> = ({ w, h, xMax, yMin, yMax, traces, cellTrace, markers = [], cut, power = 1, mini = false, id, border, chanceLabel = true, chanceGlow = 0, axisLabel = true }) => {
  const padL = mini ? 6 : 18;
  const padR = mini ? 6 : 18;
  const padT = mini ? 8 : 70;
  const padB = mini ? 8 : 64;
  const X = (e: number) => padL + ((e - 1) / Math.max(1, xMax - 1)) * (w - padL - padR);
  const Y = (v: number) => padT + ((yMax - Math.min(yMax, Math.max(yMin, v))) / (yMax - yMin)) * (h - padT - padB);
  const chance = DATA.chance;
  const tone = { ok: C.ok, flat: C.flat, warm: C.warm, muted: C.muted } as const;
  return (
    <div style={{ position: 'relative', width: w, height: h, borderRadius: mini ? 12 : 20, overflow: 'hidden', background: '#07070b', boxShadow: `0 0 0 2px ${border ?? alpha(C.muted, 0.22)}` }}>
      <svg width={w} height={h} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <filter id={`bloom-${id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={mini ? 2 : 5} result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id={`clip-${id}`}>
            <rect x={0} y={0} width={w} height={h} />
          </clipPath>
        </defs>
        {/* Monitor grid. */}
        {!mini &&
          Array.from({ length: Math.floor(xMax / 4) + 1 }, (_, i) => i * 4).filter((e) => e >= 1 && e <= xMax).map((e) => (
            <line key={`gx${e}`} x1={X(e)} y1={padT - 20} x2={X(e)} y2={h - padB} stroke={alpha(C.muted, 0.08)} strokeWidth={2} />
          ))}
        {/* Chance line. */}
        <line x1={0} y1={Y(chance)} x2={w} y2={Y(chance)} stroke={alpha(C.muted, 0.7)} strokeWidth={mini ? 2 : 3} strokeDasharray={mini ? '5 5' : '12 10'} />
        {cut && cut.opacity > 0 && (
          <g opacity={cut.opacity}>
            <line x1={X(cut.epoch)} y1={padT - 4} x2={X(cut.epoch)} y2={h - padB + 6} stroke={C.text} strokeWidth={4} />
          </g>
        )}
        {markers.map((m, i) =>
          m.opacity > 0 ? (
            <line key={`m${i}`} x1={X(m.epoch)} y1={padT - 4} x2={X(m.epoch)} y2={h - padB + 6} stroke={tone[m.tone]} strokeWidth={3} strokeDasharray="8 8" opacity={m.opacity * 0.8} />
          ) : null,
        )}
        <g clipPath={`url(#clip-${id})`}>
          {traces.map((tr, i) => {
            const vals = seriesOf(tr, cellTrace);
            if (tr.upto < 1 || !vals.length || tr.opacity <= 0) return null;
            const n = Math.min(vals.length, Math.floor(tr.upto));
            const pts: [number, number][] = [];
            for (let e = 1; e <= n; e++) pts.push([X(e), Y(vals[e - 1])]);
            const frac = tr.upto - n;
            if (frac > 0 && n < vals.length && n >= 1) {
              const v = vals[n - 1] + (vals[n] - vals[n - 1]) * frac;
              pts.push([X(n + frac), Y(v)]);
            }
            if (pts.length === 1) pts.push([pts[0][0] + 1, pts[0][1]]);
            const col = traceColour(tr);
            const head = pts[pts.length - 1];
            const drawing = tr.upto < EPOCHS - 0.01;
            return (
              <g key={i} opacity={tr.opacity} filter={`url(#bloom-${id})`}>
                <polyline
                  points={pts.map((q) => q.join(',')).join(' ')}
                  fill="none"
                  stroke={col}
                  strokeWidth={mini ? 3.5 : 7}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeDasharray={(tr.dashed ?? 0) > 0.5 ? (mini ? '6 5' : '16 12') : undefined}
                />
                {drawing && <circle cx={head[0]} cy={head[1]} r={mini ? 4.5 : 11} fill={C.text} />}
              </g>
            );
          })}
        </g>
        {chanceLabel && !mini && (
          <text x={w - padR} y={Y(chance) - 16} textAnchor="end" fill={mix(C.muted, C.text, chanceGlow)} fontSize={34 + 12 * chanceGlow} fontWeight={800} fontFamily={fontFamily}>
            guessing
          </text>
        )}
        {markers.map((m, i) =>
          m.opacity > 0 && m.text ? (
            <text
              key={`mt${i}`}
              x={Math.min(w - 20, Math.max(20, X(m.epoch)))}
              y={h - padB + 48}
              textAnchor={X(m.epoch) > w - 120 ? 'end' : X(m.epoch) < 120 ? 'start' : 'middle'}
              fill={tone[m.tone]}
              fontSize={m.text.length > 4 ? 34 : 46}
              fontWeight={800}
              fontFamily={fontFamily}
              opacity={m.opacity}
            >
              {m.text}
            </text>
          ) : null,
        )}
        {cut && cut.opacity > 0 && cut.text && (
          <text x={X(cut.epoch) + 14} y={padT - 14} fill={C.text} fontSize={36} fontWeight={800} fontFamily={fontFamily} opacity={cut.opacity}>
            {cut.text}
          </text>
        )}
        {!mini && axisLabel && (
          <text x={padL} y={h - 18} fill={alpha(C.muted, 0.8)} fontSize={28} fontWeight={600} fontFamily={fontFamily}>
            epochs →
          </text>
        )}
      </svg>
      {power < 1 && <div style={{ position: 'absolute', inset: 0, background: alpha(C.bg0, 1 - power) }} />}
    </div>
  );
};

export const Stamp: React.FC<{ text: string; colour: string; pop: number; size?: number; angle?: number }> = ({ text, colour, pop, size = 34, angle = -4 }) => (
  <div
    style={{
      display: 'inline-block',
      padding: '6px 16px',
      border: `4px solid ${colour}`,
      borderRadius: 12,
      color: colour,
      background: alpha(C.bg0, 0.75),
      fontSize: size,
      fontWeight: 800,
      letterSpacing: '0.03em',
      textTransform: 'uppercase',
      whiteSpace: 'pre',
      textAlign: 'center',
      lineHeight: 1.1,
      opacity: pop,
      transform: `rotate(${angle}deg) scale(${interpolate(pop, [0, 1], [1.7, 1])})`,
    }}
  >
    {text}
  </div>
);

// ---------------------------------------------------------------------------------------------

/**
 * Clip time of wall cell i: staggered so the 15 stages are not in lockstep, but every cell stays
 * inside one pass of the 9.9 s clip for the whole scene (~8.9 s, max offset 0.54 s), so none fades
 * out at its loop point on the climax frame.
 */
const wallPhase = (sceneT: number, i: number): number => 0.05 + ((i * 7) % 15) * 0.035 + Math.max(0, sceneT);

/** One die face (1..6) as pips on a rounded square. */
export const Die: React.FC<{ face: number; size: number; colour?: string }> = ({ face, size, colour = C.text }) => {
  const P: Record<number, [number, number][]> = {
    1: [[0.5, 0.5]],
    2: [[0.27, 0.27], [0.73, 0.73]],
    3: [[0.25, 0.25], [0.5, 0.5], [0.75, 0.75]],
    4: [[0.27, 0.27], [0.73, 0.27], [0.27, 0.73], [0.73, 0.73]],
    5: [[0.25, 0.25], [0.75, 0.25], [0.5, 0.5], [0.25, 0.75], [0.75, 0.75]],
    6: [[0.27, 0.22], [0.73, 0.22], [0.27, 0.5], [0.73, 0.5], [0.27, 0.78], [0.73, 0.78]],
  };
  const pips = P[Math.min(6, Math.max(1, Math.round(face)))] ?? P[1];
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: 'block' }}>
      <rect x={4} y={4} width={92} height={92} rx={20} fill={C.card} stroke={colour} strokeWidth={6} />
      {pips.map(([x, y], i) => (
        <circle key={i} cx={x * 100} cy={y * 100} r={9} fill={colour} />
      ))}
    </svg>
  );
};

/** Wall layout under the question card (which ends at 360). */
const WALL = { dieTop: 382, top0: 482, labelW: 92, gap: 10, tileH: 104, stripH: 80, rowGap: 22 } as const;

export const LossMonitor: React.FC<AnimProps & MonitorProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur, DATA);
  const base: React.CSSProperties = { position: 'absolute', inset: 0, fontFamily, color: C.text };

  if (p.mode === 'wall') {
    const W = WALL;
    const cw = (960 - W.labelW - 4 * W.gap) / 5;
    const rowH = W.tileH + 6 + W.stripH;
    return (
      <div style={base}>
        {/* The die: "random seed". */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: W.dieTop, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24, opacity: s.die.opacity }}>
          <div style={{ transform: `translateX(${(1 - s.die.roll) * -260}px) rotate(${(1 - s.die.roll) * -540}deg)` }}>
            <Die face={s.die.face} size={74} colour={C.warm} />
          </div>
          <div style={{ fontSize: 50, fontWeight: 800, color: C.warm }}>random seed</div>
        </div>
        {[0, 1, 2].map((r) => (
          <div key={r} style={{ position: 'absolute', left: 60, top: W.top0 + r * (rowH + W.rowGap) + rowH / 2 - 34, width: W.labelW - 12, display: 'flex', justifyContent: 'center', opacity: s.rows[r] }}>
            <Die face={r + 1} size={68} colour={C.warm} />
          </div>
        ))}
        {s.cells.map((c, i) => {
          const r = c.seed;
          const k = c.split - 1;
          const x = 60 + W.labelW + k * (cw + W.gap);
          const y = W.top0 + r * (rowH + W.rowGap);
          const tr: TraceState = { series: 'cell', upto: c.upto, lit: c.lit, rose: c.rose, warm: 0, opacity: 1, dashed: 0 };
          const frame = c.rose > 0 ? alpha(C.flat, 0.25 + 0.55 * c.rose) : c.lit > 0 ? alpha(C.ok, 0.25 + 0.55 * c.lit) : undefined;
          return (
            <div key={i} style={{ position: 'absolute', left: x, top: y, width: cw, opacity: c.opacity }}>
              <Dots playT={wallPhase(s.playT - (p.clock ?? 0), i)} w={cw} h={W.tileH} lit={c.lit} dot={6} id={`w${i}`} frame={frame} />
              <div style={{ height: 6 }} />
              <Strip w={cw} h={W.stripH} xMax={EPOCHS} yMin={0.9} yMax={1.47} traces={[tr]} cellTrace={DATA.wall[r][k].trace} mini id={`ws${i}`} border={frame} />
            </div>
          );
        })}
        <div style={{ position: 'absolute', left: 0, right: 0, top: W.top0 + 3 * rowH + 2 * W.rowGap + 26, display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 18, opacity: s.tally.opacity }}>
          <span style={{ fontSize: 110, fontWeight: 800, color: C.ok, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>
            {s.tally.learned} / {s.tally.total}
          </span>
          <span style={{ fontSize: 50, fontWeight: 800, color: C.ok }}>learned</span>
        </div>
      </div>
    );
  }

  // coin
  const faceW = 760;
  const faceH = 500;
  const face = (learned: boolean) => {
    const tr: TraceState = { series: learned ? 'TAKEOFF' : 'FLAT', upto: EPOCHS, lit: learned ? 1 : 0, rose: learned ? 0 : 1, warm: 0, opacity: 1, dashed: 0 };
    const colour = learned ? C.ok : C.flat;
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          transform: learned ? undefined : 'rotateY(180deg)',
          borderRadius: 28,
          padding: 20,
          background: C.card,
          boxShadow: `0 0 0 4px ${alpha(colour, 0.7)}, 0 0 60px ${alpha(colour, 0.25)}`,
        }}
      >
        <Dots playT={s.playT} w={faceW - 40} h={220} lit={learned ? 1 : 0} dot={11} id={learned ? 'cf' : 'cb'} />
        <div style={{ height: 14 }} />
        <Strip w={faceW - 40} h={140} xMax={EPOCHS} yMin={-0.05} yMax={1.75} traces={[tr]} mini id={learned ? 'cfs' : 'cbs'} />
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
          <Stamp text={learned ? 'Laya learns to read movement' : 'Laya does not learn this'} colour={colour} pop={1} size={learned ? 30 : 32} angle={-2} />
        </div>
      </div>
    );
  };
  const words = 'One fine-tuning run is a sample, not a measurement.'.split(' ');
  const shown = Math.ceil(s.quote.words * words.length - 1e-9);
  return (
    <div style={base}>
      <div style={{ position: 'absolute', left: (1080 - faceW) / 2, top: 420, width: faceW, height: faceH, perspective: 3200, opacity: s.coin.opacity }}>
        <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `rotateY(${s.coin.angle}deg)` }}>
          {face(true)}
          {face(false)}
        </div>
      </div>
      <div style={{ position: 'absolute', left: 50, right: 50, top: 962, textAlign: 'center', fontSize: 66, fontWeight: 800, lineHeight: 1.14, letterSpacing: '-0.02em', opacity: s.quote.opacity }}>
        {words.map((w, i) => {
          const key = w.replace(/[^a-z]/gi, '').toLowerCase();
          const em = key === 'sample' || key === 'measurement';
          return (
            <span key={i} style={{ opacity: i < shown ? 1 : 0.12, ...(em ? gradientText : {}) }}>
              {w}
              {i < words.length - 1 ? ' ' : ''}
            </span>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1214, textAlign: 'center', fontSize: 34, fontWeight: 600, color: C.muted, opacity: s.quote.foot }}>
        With 3 seeds, the effect holds: same sign in each
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1270, height: 6, display: 'flex', justifyContent: 'center', opacity: s.quote.foot }}>
        <div style={{ width: 140, height: 6, borderRadius: 3, background: GRADIENT }} />
      </div>
    </div>
  );
};
