import React from 'react';
import { interpolate } from 'remotion';
import { C, GRADIENT, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { frameState, EPOCHS, type Curves, type MarkerState, type MonitorProps, type TraceState } from './LossMonitor.state.ts';
import { tileOf, toView, viewOf, viewSize, type ClipSet } from './DotStage.state.ts';
import { mix } from './fields.tsx';
import { gradientText } from './Stage.tsx';
import clips from '../data/clips.json';
import curves from '../data/laya-curves.json';

export { frameState };
export type { MonitorProps };

const CLIPS = clips as unknown as ClipSet;
const DATA = curves as unknown as Curves;
const HOOK = CLIPS.hook;

const SPORTS = ['American football', 'Basketball', 'Handball', 'Soccer'];

// ---------------------------------------------------------------------------------------------
// Pieces

/** The hook clip as glowing dots in a w x h box: grey on the line, teal once its run learns. */
const Dots: React.FC<{ playT: number; w: number; h: number; lit: number; dot: number; id: string; dim?: number; frame?: string }> = ({
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

const traceColour = (tr: TraceState) => {
  if (tr.warm > 0) return C.warm;
  const base = mix(C.muted, C.ok, tr.lit);
  return tr.rose > 0 ? mix(C.muted, C.flat, tr.rose) : base;
};

const seriesOf = (tr: TraceState, cell?: number[]): number[] => (tr.series === 'cell' ? (cell ?? []) : DATA[tr.series]);

/** Monitor strip: chance line, traces drawn up to their epoch, markers and the cut. */
const Strip: React.FC<{
  w: number;
  h: number;
  xMax: number;
  yMin: number;
  yMax: number;
  traces: TraceState[];
  cellTrace?: number[];
  markers?: MarkerState[];
  cut?: { epoch: number; opacity: number; text: string };
  power?: number;
  mini?: boolean;
  id: string;
  border?: string;
  chanceLabel?: boolean;
  axisLabel?: boolean;
}> = ({ w, h, xMax, yMin, yMax, traces, cellTrace, markers = [], cut, power = 1, mini = false, id, border, chanceLabel = true, axisLabel = true }) => {
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
            <line x1={X(cut.epoch)} y1={padT - 30} x2={X(cut.epoch)} y2={h - padB + 6} stroke={C.text} strokeWidth={4} />
          </g>
        )}
        {markers.map((m, i) =>
          m.opacity > 0 ? (
            <line key={`m${i}`} x1={X(m.epoch)} y1={padT - 30} x2={X(m.epoch)} y2={h - padB + 6} stroke={tone[m.tone]} strokeWidth={3} strokeDasharray="8 8" opacity={m.opacity * 0.8} />
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
                  strokeDasharray={tr.dashed > 0.5 ? (mini ? '6 5' : '16 12') : undefined}
                />
                {drawing && <circle cx={head[0]} cy={head[1]} r={mini ? 4.5 : 11} fill={C.text} />}
              </g>
            );
          })}
        </g>
        {chanceLabel && !mini && (
          <text x={w - padR} y={Y(chance) - 14} textAnchor="end" fill={C.muted} fontSize={32} fontWeight={700} fontFamily={fontFamily}>
            chance
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
          <text x={X(cut.epoch) + 14} y={padT - 26} fill={C.text} fontSize={36} fontWeight={800} fontFamily={fontFamily} opacity={cut.opacity}>
            {cut.text}
          </text>
        )}
        {!mini && axisLabel && (
          <text x={padL} y={h - 18} fill={alpha(C.muted, 0.8)} fontSize={28} fontWeight={600} fontFamily={fontFamily}>
            epoch →
          </text>
        )}
      </svg>
      {power < 1 && <div style={{ position: 'absolute', inset: 0, background: alpha(C.bg0, 1 - power) }} />}
    </div>
  );
};

/** The four options Laya scores, one pill each; their glow follows the trace. */
const Pills: React.FC<{ glow: number[]; top: number }> = ({ glow, top }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, top, display: 'flex', justifyContent: 'center', gap: 14 }}>
    {SPORTS.map((s, i) => {
      const g = Math.max(0, Math.min(1, glow[i] ?? 0));
      return (
        <div
          key={s}
          style={{
            padding: '10px 18px',
            borderRadius: 999,
            fontSize: 28,
            fontWeight: 800,
            whiteSpace: 'nowrap',
            color: mix(C.muted, C.text, g),
            background: alpha(C.card, 0.95),
            border: `3px solid ${alpha(C.accentText, 0.15 + 0.75 * g)}`,
            boxShadow: `0 0 ${36 * g}px ${alpha(C.accent, 0.55 * g)}`,
          }}
        >
          {s}
        </div>
      );
    })}
  </div>
);

const Title: React.FC<{ top: number; opacity: number; children: React.ReactNode; size?: number }> = ({ top, opacity, children, size = 58 }) => (
  <div style={{ position: 'absolute', left: 50, right: 50, top, textAlign: 'center', fontSize: size, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.12, opacity }}>
    {children}
  </div>
);

const Stamp: React.FC<{ text: string; colour: string; pop: number; size?: number; angle?: number }> = ({ text, colour, pop, size = 34, angle = -4 }) => (
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

/** Layout of the single-stage scenes (official, control): header, stage, pills, monitor. */
/**
 * Clip time of wall cell i: staggered so the 15 stages are not in lockstep, but every cell stays
 * inside one pass of the 9.9 s clip for the whole scene (~6 s), so none fades out at its loop
 * point on the climax frame (an earlier 0.37 s/cell stagger always had one cell mid-fade).
 */
const wallPhase = (sceneT: number, i: number): number => 0.4 + ((i * 7) % 15) * 0.19 + Math.max(0, sceneT);

const MON = { titleTop: 252, tileTop: 350, tileH: 380, pillsTop: 756, stripTop: 836, stripH: 456 } as const;

export const LossMonitor: React.FC<AnimProps & MonitorProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur, DATA);
  const base: React.CSSProperties = { position: 'absolute', inset: 0, fontFamily, color: C.text };

  if (p.mode === 'seeds3') {
    const colW = 296;
    const gap = 36;
    const left = (1080 - 3 * colW - 2 * gap) / 2;
    return (
      <div style={base}>
        <Title top={256} opacity={s.heads.hook ?? 1} size={74}>
          Same model.
          <br />
          Same dots. Same recipe.
        </Title>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 440, textAlign: 'center', fontSize: 54, fontWeight: 800, opacity: s.heads.sub ?? 0, ...gradientText }}>
          Only the seed changed
        </div>
        {s.columns.map((c, i) => {
          const x = left + i * (colW + gap);
          const tr: TraceState = { series: 'cell', upto: c.upto, lit: c.lit, rose: c.rose, warm: 0, opacity: 1, dashed: 0 };
          const learned = c.rose === 0 && c.lit > 0;
          return (
            <div key={i} style={{ position: 'absolute', left: x, top: 540, width: colW }}>
              <div style={{ textAlign: 'center', fontSize: 40, fontWeight: 800, color: C.muted, marginBottom: 12 }}>seed {c.seed}</div>
              <Dots playT={s.playT} w={colW} h={320} lit={c.lit} dot={13} id={`s${i}`} />
              <div style={{ height: 14 }} />
              <Strip w={colW} h={250} xMax={EPOCHS} yMin={0.9} yMax={1.47} traces={[tr]} cellTrace={DATA.wall[c.seed][0].trace} mini id={`ss${i}`} border={c.rose > 0 ? alpha(C.flat, 0.6 * c.rose) : c.lit > 0 ? alpha(C.ok, 0.6 * c.lit) : undefined} />
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', marginTop: 24, height: 104 }}>
                {c.stamp > 0 && (
                  <Stamp text={learned ? 'learned' : 'stayed at\nchance'} colour={learned ? C.ok : C.flat} pop={c.stamp} size={learned ? 38 : 32} angle={i === 1 ? 3 : -4} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (p.mode === 'official' || p.mode === 'control') {
    const tagPop = s.chips.tag ?? 0;
    return (
      <div style={base}>
        {p.mode === 'official' && (
          <Title top={MON.titleTop} opacity={s.heads.official ?? 0}>
            The official recipe
          </Title>
        )}
        {p.mode === 'control' && (
          <>
            <Title top={MON.titleTop} opacity={(s.heads.control ?? 0) * (1 - (s.heads.slow ?? 0))}>
              Control: a tag gives it away
            </Title>
            <Title top={MON.titleTop} opacity={s.heads.slow ?? 0}>
              The dots: slower to start
            </Title>
          </>
        )}
        <div style={{ position: 'absolute', left: 60, top: MON.tileTop }}>
          <Dots playT={s.playT} w={960} h={MON.tileH} lit={s.dotsLit} dot={15} id="mon" />
          {/* LAYA chip in the corner of the stage. */}
          <div style={{ position: 'absolute', left: 18, top: 16, padding: '6px 16px', borderRadius: 12, background: alpha(C.bg0, 0.85), border: `2px solid ${alpha(C.accentText, 0.6)}`, fontSize: 30, fontWeight: 800 }}>
            LAYA
          </div>
          {p.mode === 'control' && tagPop > 0 && (
            <>
              <div style={{ position: 'absolute', right: 26, top: 22, transform: `rotate(6deg) scale(${interpolate(tagPop, [0, 1], [2.2, 1])})`, opacity: tagPop }}>
                <div style={{ padding: '10px 22px', borderRadius: 14, background: C.warm, color: C.bg0, fontSize: 46, fontWeight: 800, fontFamily: 'monospace', boxShadow: `0 10px 30px ${alpha(C.bg0, 0.7)}` }}>tag: Q7</div>
              </div>
              <div style={{ position: 'absolute', right: 26, top: 120, opacity: s.chips.legend ?? 0, fontSize: 34, fontWeight: 700, color: C.warm, whiteSpace: 'nowrap' }}>
                Q7 = soccer
              </div>
            </>
          )}
        </div>
        <Pills glow={s.pills} top={MON.pillsTop} />
        <div style={{ position: 'absolute', left: 60, top: MON.stripTop }}>
          <Strip w={960} h={MON.stripH} xMax={s.xMax} yMin={-0.05} yMax={2.1} traces={s.traces} markers={s.markers} cut={s.cut} power={s.power} id="mon" axisLabel={p.mode === 'official'} />
          {p.mode === 'official' && (s.chips.result ?? 0) > 0 && (
            <div
              style={{
                position: 'absolute',
                left: 300,
                top: 150,
                opacity: s.chips.result,
                transform: `scale(${interpolate(s.chips.result ?? 0, [0, 1], [1.4, 1])})`,
                display: 'flex',
                alignItems: 'baseline',
                gap: 18,
              }}
            >
              <span style={{ fontSize: 150, fontWeight: 800, color: C.text, letterSpacing: '-0.03em' }}>23%</span>
              <span style={{ fontSize: 34, fontWeight: 700, color: C.muted, whiteSpace: 'nowrap' }}>on 400 clips</span>
            </div>
          )}
          {p.mode === 'control' && (
            <div style={{ position: 'absolute', left: 30, top: 22, display: 'flex', gap: 28, fontSize: 30, fontWeight: 700 }}>
              <span style={{ color: C.warm, opacity: s.traces[0]?.opacity ?? 1 }}>● tag control</span>
              <span style={{ color: mix(C.muted, C.ok, s.traces[1]?.lit ?? 0) }}>● the dots</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (p.mode === 'curves') {
    const end = DATA.TAKEOFF[EPOCHS - 1];
    return (
      <div style={base}>
        <Title top={260} opacity={s.heads.curves ?? 0}>
          Loss on the dots, 32 epochs
        </Title>
        <div style={{ position: 'absolute', left: 60, top: 370 }}>
          <Strip w={960} h={780} xMax={EPOCHS} yMin={-0.05} yMax={1.75} traces={s.traces} markers={s.markers} id="curves" />
          {(s.chips.end ?? 0) > 0 && (
            <div style={{ position: 'absolute', right: 34, top: 70 + ((1.75 - end) / 1.8) * (780 - 134) + 18, fontSize: 40, fontWeight: 800, color: C.ok, opacity: s.chips.end }}>
              {end.toFixed(2)}
            </div>
          )}
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 1176, display: 'flex', justifyContent: 'center', gap: 40, fontSize: 32, fontWeight: 700 }}>
          <span style={{ color: C.ok, opacity: s.markers[0]?.opacity ?? 0 }}>━ left chance</span>
          <span style={{ color: C.flat, opacity: s.markers[2]?.opacity ?? 0 }}>━ never left</span>
        </div>
      </div>
    );
  }

  if (p.mode === 'wall') {
    const labelW = 112;
    const gap = 10;
    const cw = (960 - labelW - 4 * gap) / 5;
    const tileH = 112;
    const stripH = 86;
    const rowH = tileH + 6 + stripH;
    const top0 = 420;
    const rowGap = 26;
    return (
      <div style={base}>
        <Title top={256} opacity={s.heads.wall ?? 0} size={54}>
          15 runs. Only the seed changed.
        </Title>
        {[1, 2, 3, 4, 5].map((k) => (
          <div key={k} style={{ position: 'absolute', top: top0 - 50, left: 60 + labelW + (k - 1) * (cw + gap), width: cw, textAlign: 'center', fontSize: 28, fontWeight: 700, color: C.muted, opacity: s.heads.wall ?? 0 }}>
            split {k}
          </div>
        ))}
        {[0, 1, 2].map((r) => (
          <div key={r} style={{ position: 'absolute', left: 60, top: top0 + r * (rowH + rowGap) + rowH / 2 - 22, width: labelW, fontSize: 32, fontWeight: 800, color: C.muted, opacity: s.heads.wall ?? 0 }}>
            seed {r}
          </div>
        ))}
        {s.cells.map((c, i) => {
          const r = c.seed;
          const k = c.split - 1;
          const x = 60 + labelW + k * (cw + gap);
          const y = top0 + r * (rowH + rowGap);
          const tr: TraceState = { series: 'cell', upto: c.upto, lit: c.lit, rose: c.rose, warm: 0, opacity: 1, dashed: 0 };
          const frame = c.rose > 0 ? alpha(C.flat, 0.25 + 0.55 * c.rose) : c.lit > 0 ? alpha(C.ok, 0.25 + 0.55 * c.lit) : undefined;
          return (
            <div key={i} style={{ position: 'absolute', left: x, top: y, width: cw, opacity: c.opacity }}>
              <Dots playT={wallPhase(s.playT - (p.clock ?? 0), i)} w={cw} h={tileH} lit={c.lit} dot={6} id={`w${i}`} frame={frame} />
              <div style={{ height: 6 }} />
              <Strip w={cw} h={stripH} xMax={EPOCHS} yMin={0.9} yMax={1.47} traces={[tr]} cellTrace={DATA.wall[r][k].trace} mini id={`ws${i}`} border={frame} />
            </div>
          );
        })}
        <div style={{ position: 'absolute', left: 0, right: 0, top: top0 + 3 * rowH + 2 * rowGap + 44, display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 40 }}>
          <div style={{ opacity: s.tally.opacity, display: 'flex', alignItems: 'baseline', gap: 14 }}>
            <span style={{ fontSize: 120, fontWeight: 800, color: C.ok, letterSpacing: '-0.03em' }}>{s.tally.learned} / 15</span>
            <span style={{ fontSize: 38, fontWeight: 700, color: C.ok }}>learned</span>
          </div>
          <div style={{ opacity: s.tally.flatOpacity, fontSize: 38, fontWeight: 700, color: C.flat, whiteSpace: 'nowrap' }}>{s.tally.flat} never did</div>
        </div>
      </div>
    );
  }

  // coin
  const faceW = 760;
  const faceH = 560;
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
        <Dots playT={s.playT} w={faceW - 40} h={250} lit={learned ? 1 : 0} dot={11} id={learned ? 'cf' : 'cb'} />
        <div style={{ height: 14 }} />
        <Strip w={faceW - 40} h={160} xMax={EPOCHS} yMin={-0.05} yMax={1.75} traces={[tr]} mini id={learned ? 'cfs' : 'cbs'} />
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
      <div style={{ position: 'absolute', left: (1080 - faceW) / 2, top: 262, width: faceW, height: faceH, perspective: 2200, opacity: s.coin.opacity }}>
        <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `rotateY(${s.coin.angle}deg)` }}>
          {face(true)}
          {face(false)}
        </div>
      </div>
      <div style={{ position: 'absolute', left: 70, right: 70, top: 880, textAlign: 'center', fontSize: 70, fontWeight: 800, lineHeight: 1.18, letterSpacing: '-0.02em', opacity: s.quote.opacity }}>
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
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1150, textAlign: 'center', fontSize: 32, fontWeight: 600, color: C.muted, opacity: s.quote.foot }}>
        With 3 seeds, the effect holds: same sign in each
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1210, height: 6, display: 'flex', justifyContent: 'center', opacity: s.quote.foot }}>
        <div style={{ width: 140, height: 6, borderRadius: 3, background: GRADIENT }} />
      </div>
    </div>
  );
};
