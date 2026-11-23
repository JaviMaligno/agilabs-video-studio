import React from 'react';
import { staticFile } from 'remotion';
import { C, alpha } from '../brand.ts';
import type { AnimProps } from './types.ts';
import { Canvas } from './Canvas.tsx';
import { designOf, fitInto, stageBox } from './canvas.ts';
import {
  BAND_TEXT,
  CURVE,
  FURTHEST,
  FURTHEST_TEXT,
  SMALL_AMP,
  TICKS,
  WAVES,
  frameState,
  louderWave,
  type PrimeCurveProps,
} from './PrimeCurve.state.ts';

export { frameState };
export type { PrimeCurveProps };

// Chalk palette on the slate.
const CHALK = '#eef2f7';
const AMBER = '#fbbf24';
const TEAL = '#5eead4';
const PINK = '#f9a8d4';
const RED = '#f87171';

// Landscape layout (1920x1080): plot inside the stage, captions band (y > 830) left free.
const X0 = 360;
const X1 = 1480;
const Y0 = 480;
const K = 3300; // px per unit of r
const AXIS_Y = 770;
const xOf = (lx: number) => X0 + ((lx - 1) / 6) * (X1 - X0);
const yOf = (r: number) => Y0 - r * K;
const BAND_TOP = yOf(CURVE.band);
const BAND_BOT = yOf(-CURVE.band);

const PTS = CURVE.points.map(([lx, r]) => [xOf(lx), yOf(r)] as const);

const curvePath = (draw: number): { d: string; tip: readonly [number, number] } => {
  const n = PTS.length;
  if (n === 0 || draw <= 0) return { d: '', tip: [X0, Y0] };
  const f = draw * (n - 1);
  const k = Math.floor(f);
  const parts: string[] = [];
  for (let i = 0; i <= Math.min(k, n - 1); i++) parts.push(`${i === 0 ? 'M' : 'L'}${PTS[i][0].toFixed(1)} ${PTS[i][1].toFixed(1)}`);
  let tip: readonly [number, number] = PTS[Math.min(k, n - 1)];
  if (k < n - 1) {
    const a = f - k;
    tip = [PTS[k][0] + (PTS[k + 1][0] - PTS[k][0]) * a, PTS[k][1] + (PTS[k + 1][1] - PTS[k][1]) * a];
    parts.push(`L${tip[0].toFixed(1)} ${tip[1].toFixed(1)}`);
  }
  return { d: parts.join(' '), tip };
};

const louderPath = (p: number): string => {
  if (p <= 0) return '';
  const end = 1 + 6 * p;
  const parts: string[] = [];
  for (let x = 1, i = 0; x <= end + 1e-9; x += 0.02, i++) parts.push(`${i === 0 ? 'M' : 'L'}${xOf(x).toFixed(1)} ${yOf(louderWave(x)).toFixed(1)}`);
  return parts.join(' ');
};

/** First x past 6 where the louder wave rises through the top of the band. */
const POKE_X = (() => {
  for (let x = 6; x <= 7; x += 0.002) if (louderWave(x) >= CURVE.band) return x;
  return 6.3;
})();
const PEAK = { x: xOf(6.5), y: yOf(louderWave(6.5)) };

const DUST = Array.from({ length: 14 }, (_, i) => {
  const h = (n: number) => {
    const v = Math.sin(n * 91.7 + 13.1) * 43758.5453;
    return v - Math.floor(v);
  };
  return { x: 180 + h(i) * 1560, y: 160 + h(i + 40) * 640, r: 1.5 + h(i + 80) * 2.5, s: 0.2 + h(i + 120) * 0.5, ph: h(i + 160) * 6.28 };
});

const Txt: React.FC<{
  x: number;
  y: number;
  size: number;
  opacity: number;
  fill?: string;
  weight?: number;
  anchor?: 'start' | 'middle' | 'end';
  children: React.ReactNode;
}> = ({ x, y, size, opacity, fill = CHALK, weight = 600, anchor = 'start', children }) =>
  opacity <= 0 ? null : (
    <text x={x} y={y} fontSize={size} fontWeight={weight} fill={fill} textAnchor={anchor} opacity={opacity} filter="url(#pc-chalk)">
      {children}
    </text>
  );

export const PrimeCurve: React.FC<AnimProps & PrimeCurveProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const { w, h } = designOf(p.vertical);
  const T = s.T;
  const curve = curvePath(s.draw);
  const fp = PTS[FURTHEST] ?? [X0, Y0];
  const curveOp = 1 - s.dim;
  const breathe = 0.5 + 0.5 * Math.sin(T * 1.6);

  const content = (
    <g>
      {/* Chalk dust drifting. */}
      {DUST.map((d, i) => (
        <circle key={i} cx={d.x + 18 * Math.sin(T * d.s + d.ph)} cy={d.y - ((T * 6 * d.s + d.ph * 20) % 60)} r={d.r} fill={CHALK} opacity={0.07} />
      ))}

      {/* Lines 1-2: one small wave per zero. */}
      {s.collapse < 1 && (
        <g>
          <line
            x1={300}
            y1={240 + (Y0 - 240) * s.collapse}
            x2={300}
            y2={720 + (Y0 - 720) * s.collapse}
            stroke={CHALK}
            strokeWidth={4}
            strokeLinecap="round"
            opacity={s.lineIn * 0.85}
            filter="url(#pc-chalk)"
          />
          {WAVES.map((wv, i) => {
            const a = s.waves[i].appear;
            const base = 290 + i * 95;
            const cy = base + (Y0 - base) * s.collapse;
            const dot = <circle key={`d${i}`} cx={300} cy={cy} r={11 + 2 * a} fill={AMBER} opacity={s.lineIn * (0.4 + 0.6 * a)} filter="url(#pc-chalk)" />;
            if (a <= 0) return dot;
            const small = SMALL_AMP * (0.75 + 0.1 * i);
            const amp = (wv.amp + (small - wv.amp) * s.calm) * (1 - s.collapse) * (0.92 + 0.08 * Math.sin(T * 1.2 + i));
            const pts: string[] = [];
            for (let x = 330; x <= 1700; x += 6) {
              pts.push(`${x === 330 ? 'M' : 'L'}${x} ${(cy + amp * Math.sin(((x - 330) / wv.len) * Math.PI * 2 - wv.speed * T)).toFixed(1)}`);
            }
            return (
              <g key={i}>
                {dot}
                <g opacity={a}>
                <path d={pts.join(' ')} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - a} fill="none" stroke={CHALK} strokeWidth={4} strokeLinecap="round" filter="url(#pc-chalk)" />
                {s.calm > 0 && (
                  <g opacity={s.calm * 0.45 * (1 - s.collapse)}>
                    <line x1={340} x2={1700} y1={cy - 24} y2={cy - 24} stroke={TEAL} strokeWidth={2} strokeDasharray="10 12" />
                    <line x1={340} x2={1700} y1={cy + 24} y2={cy + 24} stroke={TEAL} strokeWidth={2} strokeDasharray="10 12" />
                  </g>
                )}
                </g>
              </g>
            );
          })}
          <Txt x={300} y={790} size={40} anchor="middle" opacity={s.lineLabel} fill={AMBER}>
            the line
          </Txt>
        </g>
      )}
      <Txt x={960} y={200} size={56} weight={700} anchor="middle" opacity={s.head0}>
        why does a <tspan fill={TEAL}>ceiling</tspan> help?
      </Txt>
      <Txt x={960} y={200} size={56} weight={700} anchor="middle" opacity={s.head1}>
        each <tspan fill={AMBER}>zero</tspan> adds a wave
      </Txt>
      <Txt x={960} y={200} size={56} weight={700} anchor="middle" opacity={s.head2}>
        zeros on the line <tspan fill={AMBER}>→</tspan> small waves
      </Txt>

      {/* Lines 3-4: axes and the real curve. */}
      {s.axes > 0 && (
        <g filter="url(#pc-chalk)">
          <line x1={X0} y1={AXIS_Y} x2={X0} y2={AXIS_Y - (AXIS_Y - 220) * s.axes} stroke={CHALK} strokeWidth={4} strokeLinecap="round" />
          <line x1={X0} y1={AXIS_Y} x2={X0 + (X1 + 40 - X0) * s.axes} y2={AXIS_Y} stroke={CHALK} strokeWidth={4} strokeLinecap="round" />
          <line x1={X0} y1={Y0} x2={X0 + (X1 - X0) * s.axes} y2={Y0} stroke={CHALK} strokeWidth={2} strokeDasharray="8 14" opacity={0.45} />
          <text x={X0 - 20} y={Y0 + 14} fontSize={40} fontWeight={600} fill={CHALK} textAnchor="end" opacity={s.axes}>
            0
          </text>
        </g>
      )}
      {TICKS.map((tk, k) =>
        s.ticks[k].appear > 0 ? (
          <g key={tk.text} opacity={s.ticks[k].appear} filter="url(#pc-chalk)">
            <line x1={xOf(tk.at)} x2={xOf(tk.at)} y1={AXIS_Y - 14} y2={AXIS_Y + 14} stroke={CHALK} strokeWidth={4} strokeLinecap="round" />
            <text x={xOf(tk.at)} y={AXIS_Y + 56} fontSize={40} fontWeight={600} fill={CHALK} textAnchor="middle">
              {tk.text}
            </text>
          </g>
        ) : null,
      )}
      <Txt x={X0} y={196} size={44} opacity={s.primes}>
        primes: <tspan fill={AMBER}>2, 3, 5, 7, 11, 13, 17, 19, 23, 29, …</tspan>
      </Txt>
      {s.formula[0].appear > 0 && (
        <text x={X0} y={196} fontSize={44} fontWeight={600} fill={CHALK} filter="url(#pc-chalk)">
          <tspan opacity={s.formula[0].appear}>(primes counted </tspan>
          <tspan opacity={s.formula[1].appear}>− expected) </tspan>
          <tspan opacity={s.formula[2].appear} fill={AMBER}>
            ÷ √y
          </tspan>
        </text>
      )}

      {/* Lines 5-6: the band the hypothesis allows. */}
      {s.band > 0 && (
        <g>
          <rect
            x={X0}
            y={BAND_TOP}
            width={X1 - X0}
            height={BAND_BOT - BAND_TOP}
            fill={TEAL}
            opacity={s.band * (0.1 + 0.025 * breathe) * (1 - 0.7 * s.topOnly)}
          />
          <line x1={X0} x2={X1} y1={BAND_TOP} y2={BAND_TOP} stroke={TEAL} strokeWidth={3 + 2.5 * s.topOnly} opacity={s.band * (0.8 + 0.2 * s.topOnly)} filter="url(#pc-chalk)" />
          <line x1={X0} x2={X1} y1={BAND_BOT} y2={BAND_BOT} stroke={TEAL} strokeWidth={3} opacity={s.band * (0.8 - 0.68 * s.topOnly)} filter="url(#pc-chalk)" />
          {s.forever > 0 && (
            <g opacity={s.forever}>
              <line x1={X1} x2={X1 + 270 * s.forever} y1={BAND_TOP} y2={BAND_TOP} stroke={TEAL} strokeWidth={3 + 2.5 * s.topOnly} strokeDasharray="12 12" opacity={0.8} />
              <line x1={X1} x2={X1 + 270 * s.forever} y1={BAND_BOT} y2={BAND_BOT} stroke={TEAL} strokeWidth={3} strokeDasharray="12 12" opacity={0.8 - 0.68 * s.topOnly} />
            </g>
          )}
        </g>
      )}
      <Txt x={X0 + 24} y={BAND_TOP - 18} size={42} opacity={s.bandLabel * (1 - 0.6 * s.dim)}>
        what the hypothesis allows: <tspan fill={TEAL} fontWeight={800}>{BAND_TEXT}</tspan>
      </Txt>
      <Txt x={1620} y={Y0 - 6} size={40} anchor="middle" opacity={s.forever * (1 - s.dim)}>
        stays inside
      </Txt>
      <Txt x={1620} y={Y0 + 52} size={54} weight={800} anchor="middle" fill={TEAL} opacity={s.forever * (1 - s.dim)}>
        forever?
      </Txt>

      {/* The real curve (amber chalk). */}
      {curve.d && (
        <g opacity={curveOp}>
          <path d={curve.d} fill="none" stroke={AMBER} strokeWidth={9} strokeOpacity={0.18} strokeLinejoin="round" />
          <path d={curve.d} fill="none" stroke={AMBER} strokeWidth={3.2} strokeLinejoin="round" strokeLinecap="round" />
          <circle cx={curve.tip[0]} cy={curve.tip[1]} r={8 + 4 * breathe} fill={AMBER} opacity={0.35} />
          <circle cx={curve.tip[0]} cy={curve.tip[1]} r={6} fill={AMBER} />
        </g>
      )}

      {/* The furthest point from zero: the dip. */}
      {s.marker > 0 && (
        <g opacity={s.marker * curveOp}>
          <circle cx={fp[0]} cy={fp[1]} r={16 + 5 * breathe} fill="none" stroke={CHALK} strokeWidth={3.5} filter="url(#pc-chalk)" />
          {s.markerLabel > 0 && (
            <line x1={fp[0]} y1={fp[1] + 22} x2={fp[0]} y2={BAND_BOT + 34} stroke={CHALK} strokeWidth={2.5} strokeDasharray="6 8" opacity={s.markerLabel} />
          )}
        </g>
      )}
      <Txt x={fp[0]} y={BAND_BOT + 78} size={42} anchor="middle" opacity={s.markerLabel}>
        furthest it gets: <tspan fill={AMBER} fontWeight={800}>{FURTHEST_TEXT}</tspan>
      </Txt>

      {/* Line 7: a louder (hypothetical) wave pokes through the top and is crossed out. */}
      {s.louder > 0 && (
        <g opacity={1 - 0.85 * s.louderFade}>
          <path d={louderPath(s.louder)} fill="none" stroke={PINK} strokeWidth={4.5} strokeDasharray="16 12" strokeLinecap="round" filter="url(#pc-chalk)" />
          {s.poke > 0 && (
            <g transform={`translate(${xOf(POKE_X)} ${BAND_TOP}) scale(${0.6 + 0.4 * s.poke})`} opacity={s.poke * (1 - 0.5 * s.cross)}>
              {Array.from({ length: 8 }, (_, i) => {
                const a = (i / 8) * Math.PI * 2;
                return <line key={i} x1={Math.cos(a) * 16} y1={Math.sin(a) * 16} x2={Math.cos(a) * 38} y2={Math.sin(a) * 38} stroke={PINK} strokeWidth={4} strokeLinecap="round" />;
              })}
            </g>
          )}
          {s.cross > 0 && (
            <g stroke={RED} strokeWidth={9} strokeLinecap="round" filter="url(#pc-chalk)" opacity={1 - s.louderFade}>
              <line x1={PEAK.x - 70} y1={PEAK.y - 50} x2={PEAK.x - 70 + 140 * Math.min(1, s.cross * 2)} y2={PEAK.y - 50 + 140 * Math.min(1, s.cross * 2)} />
              {s.cross > 0.5 && <line x1={PEAK.x + 70} y1={PEAK.y - 50} x2={PEAK.x + 70 - 140 * (s.cross * 2 - 1)} y2={PEAK.y - 50 + 140 * (s.cross * 2 - 1)} />}
            </g>
          )}
        </g>
      )}
      <Txt x={PEAK.x - 80} y={PEAK.y - 18} size={42} weight={700} anchor="end" fill={PINK} opacity={s.louderLabel}>
        a louder wave
      </Txt>
      {s.cross > 0 && s.louderLabel > 0 && (
        <line x1={PEAK.x - 370} x2={PEAK.x - 370 + 290 * s.cross} y1={PEAK.y - 32} y2={PEAK.y - 32} stroke={RED} strokeWidth={6} strokeLinecap="round" opacity={s.louderLabel} />
      )}

      {/* Line 8: the ceiling, over a long stretch. */}
      {s.sweep > 0 && (
        <line x1={X0} x2={X0 + (X1 - X0) * s.sweep} y1={BAND_TOP} y2={BAND_TOP} stroke={CHALK} strokeWidth={6} strokeLinecap="round" opacity={0.85 * (1 - s.dim)} filter="url(#pc-chalk)" />
      )}
      <Txt x={1615} y={BAND_TOP - 18} size={44} weight={800} anchor="middle" fill={TEAL} opacity={s.ceiling * (1 - s.dim)}>
        ceiling
      </Txt>
      <Txt x={960} y={196} size={50} weight={700} anchor="middle" opacity={s.headline}>
        a <tspan fill={TEAL}>ceiling</tspan> over long stretches is enough
      </Txt>

      {/* Line 9: evidence, not proof. */}
      {s.card > 0 && (
        <g opacity={s.card} transform={`translate(0 ${(1 - s.card) * 24})`}>
          <rect x={430} y={360} width={1060} height={250} rx={28} fill={C.card} fillOpacity={0.88} stroke={alpha(AMBER, 0.75)} strokeWidth={3} />
          <text x={960} y={466} fontSize={76} fontWeight={800} fill={CHALK} textAnchor="middle">
            evidence, <tspan fill={AMBER}>not proof</tspan>
          </text>
          <text x={960} y={556} fontSize={44} fontWeight={600} fill={C.muted} textAnchor="middle" opacity={s.cardLine2}>
            the proof must hold for <tspan fill={CHALK} fontWeight={800}>every</tspan> number
          </text>
        </g>
      )}
    </g>
  );

  return (
    <Canvas vertical={p.vertical}>
      <defs>
        <filter id="pc-chalk" filterUnits="userSpaceOnUse" x={-200} y={-200} width={2400} height={2400}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={7} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={2.6} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <image href={staticFile('bg/bg-board.jpg')} x={0} y={0} width={w} height={h} preserveAspectRatio="none" />
      {p.vertical ? <g transform={fitInto(stageBox(false), stageBox(true)).transform}>{content}</g> : content}
    </Canvas>
  );
};
