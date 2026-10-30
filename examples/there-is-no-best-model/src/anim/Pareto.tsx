import React from 'react';
import { Img, staticFile } from 'remotion';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import {
  arrival, frameState, frontierOf, isDominated, MODEL_BETTER, MODELS, pointAlong, REASONING, RECEIPT, staircase, STREAM, VANS,
  type ParetoProps, type ParetoState, type Pt,
} from './Pareto.state.ts';
import { stageOf } from './Stage.tsx';

export { frameState };
export type { ParetoProps };

// The article's palette: teal = luna / frontier, amber = terra, slate = dominated, red = fails the gate.
const TEAL = '#2dd4bf';
const TEAL_TEXT = '#5eead4';
const AMBER = '#f59e0b';
const SLATE = '#94a3b8';
const AXIS = '#64748b';
const RED = '#f87171';
const OFF = '#e2e8f0';

const img = (name: string) => staticFile(`cast/${name}.png`);
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

const Pic: React.FC<{ name: string; x: number; y: number; size: number; opacity?: number; scale?: number; flip?: boolean; grey?: number; rot?: number }> = ({
  name, x, y, size, opacity = 1, scale = 1, flip, grey = 0, rot = 0,
}) => (
  <Img
    src={img(name)}
    style={{
      position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, objectFit: 'contain', opacity,
      transform: `scale(${scale})${flip ? ' scaleX(-1)' : ''} rotate(${rot}deg)`,
      filter: grey > 0 ? `grayscale(${grey}) brightness(${1 - 0.3 * grey})` : undefined,
    }}
  />
);

const Label: React.FC<{ x: number; y: number; text: string; size?: number; color?: string; opacity?: number; weight?: number; w?: number; align?: 'center' | 'left' | 'right' }> = ({
  x, y, text, size = 38, color = C.text, opacity = 1, weight = 700, w = 600, align = 'center',
}) => {
  const left = align === 'center' ? x - w / 2 : align === 'left' ? x : x - w;
  return (
    <div style={{ position: 'absolute', left, top: y, width: w, textAlign: align, fontFamily, fontSize: size, fontWeight: weight, color, opacity, lineHeight: 1.15 }}>{text}</div>
  );
};

const Glow: React.FC<{ x: number; y: number; r: number; opacity: number; color?: string }> = ({ x, y, r, opacity, color = TEAL }) => (
  <div style={{ position: 'absolute', left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: r, opacity, background: `radial-gradient(circle, ${alpha(color, 0.35)} 0%, ${alpha(color, 0.12)} 55%, transparent 72%)`, border: `4px solid ${alpha(color, 0.7)}`, boxSizing: 'border-box' }} />
);

const Badge: React.FC<{ x: number; y: number; text: string; color: string; opacity: number; scale?: number; size?: number; rot?: number; fill?: string }> = ({
  x, y, text, color, opacity, scale = 1, size = 44, rot = 0, fill,
}) => (
  <div
    style={{
      position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${scale})`, opacity, whiteSpace: 'nowrap',
      padding: '12px 26px', borderRadius: 18, border: `5px solid ${color}`, color, background: fill ?? alpha(C.bg0, 0.75),
      fontFamily, fontSize: size, fontWeight: 800,
    }}
  >
    {text}
  </div>
);

/** A plane: axes with arrow-less titles, in board pixels. */
type Plane = { x0: number; x1: number; y0: number; y1: number };
const toPx = (pl: Plane, p: Pt): Pt => ({ x: lerp(pl.x0, pl.x1, p.x), y: lerp(pl.y0, pl.y1, p.y) });

const Axes: React.FC<{ pl: Plane; xLabel: string; yLabel: string; opacity: number }> = ({ pl, xLabel, yLabel, opacity }) => (
  <>
    <svg width={936} height={1000} style={{ position: 'absolute', left: 0, top: 0, opacity, overflow: 'visible' }}>
      <line x1={pl.x0} y1={pl.y0} x2={pl.x1 + 10} y2={pl.y0} stroke={AXIS} strokeWidth={5} strokeLinecap="round" />
      <line x1={pl.x0} y1={pl.y0} x2={pl.x0} y2={pl.y1 - 10} stroke={AXIS} strokeWidth={5} strokeLinecap="round" />
    </svg>
    <Label x={(pl.x0 + pl.x1) / 2} y={pl.y0 + 18} text={xLabel} size={38} color={SLATE} opacity={opacity} w={600} />
    <div style={{ position: 'absolute', left: pl.x0 - 60 - 300, top: (pl.y0 + pl.y1) / 2 - 24, width: 600, textAlign: 'center', transform: 'rotate(-90deg)', transformOrigin: '50% 50%', fontFamily, fontSize: 38, fontWeight: 700, color: SLATE, opacity }}>
      {yLabel}
    </div>
  </>
);

/** "better" with an arrow into the plane corner where the better options sit. */
const BetterTag: React.FC<{ x: number; y: number; corner: 'tl' | 'bl'; opacity: number }> = ({ x, y, corner, opacity }) => (
  <div style={{ position: 'absolute', left: x, top: corner === 'tl' ? y : y - 44, opacity, fontFamily, fontSize: 32, fontWeight: 800, color: TEAL_TEXT, whiteSpace: 'nowrap' }}>
    {corner === 'tl' ? '↖ better' : '↙ better'}
  </div>
);

// ------------------------------------------------------------------ hook

const Hook: React.FC<{ s: ParetoState; cover?: boolean }> = ({ s, cover }) => {
  // terra (the newer model) is on screen from frame 0, zooming in from the right edge; luna fades in
  // on the left before "faster", so the two never overlap. 6/6 under both (the article: both models
  // got all six right); terra leaves to the right with its badge on "and I didn't switch".
  const [zoom, lunaIn, badge, away] = s.appear;
  const TX = 660;
  const tx = away > 0 ? lerp(TX, 1180, away) : lerp(1010, TX, zoom);
  const terraA = 1 - away;
  const streak = clamp01((1 - zoom) * 1.4) * (1 - away);
  return (
    <>
      {cover && (
        <>
          <Label x={468} y={40} text="Pareto frontier" size={84} color={OFF} weight={900} w={936} />
          <div style={{ position: 'absolute', left: 0, top: 150, width: 936, textAlign: 'center', fontFamily, fontSize: 44, fontWeight: 800, whiteSpace: 'nowrap' }}>
            <span style={{ color: TEAL_TEXT }}>gpt-6 luna</span>
            <span style={{ color: SLATE }}>{'  vs  '}</span>
            <span style={{ color: AMBER }}>gpt-6.1 terra</span>
          </div>
        </>
      )}
      <Glow x={270} y={500} r={230} opacity={away} />
      <Pic name="robot-teal" x={270} y={500} size={380} opacity={lunaIn} scale={lerp(0.85, 1, lunaIn) * lerp(1, 1.08, away)} />
      <Label x={270} y={720} text="luna" size={40} color={TEAL_TEXT} opacity={lunaIn} w={300} />
      {/* Speed streaks trailing terra on its right while it zooms in. */}
      <svg width={936} height={1000} style={{ position: 'absolute', left: 0, top: 0, opacity: streak, overflow: 'visible' }}>
        {[0, 1, 2].map((i) => (
          <line key={i} x1={tx + 170} y1={440 + i * 60} x2={tx + 420} y2={440 + i * 60} stroke={alpha(AMBER, 0.7)} strokeWidth={10} strokeLinecap="round" />
        ))}
      </svg>
      <Pic name="robot-amber" x={tx} y={500} size={380} opacity={terraA} />
      <Pic name="stopwatch" x={tx + 120} y={270} size={150} opacity={terraA} rot={s.wobble * 6} />
      <Label x={tx} y={720} text="terra" size={40} color={AMBER} opacity={terraA} w={300} />
      <Badge x={270} y={820} text="✓ 6/6" color={TEAL} opacity={badge} scale={lerp(1.5, 1, badge)} />
      <Badge x={tx} y={820} text="✓ 6/6" color={TEAL} opacity={badge * terraA} scale={lerp(1.5, 1, badge)} />
    </>
  );
};

// ------------------------------------------------------------------ new models

const Banner: React.FC<{ x: number; y: number; text: string; color: string; opacity: number }> = ({ x, y, text, color, opacity }) => (
  <svg width={190} height={64} viewBox="0 0 190 64" style={{ position: 'absolute', left: x - 95, top: y - 32, opacity, overflow: 'visible' }}>
    <path d="M0 8 L22 8 L22 56 L0 56 L12 32 Z" fill={alpha(color, 0.6)} />
    <path d="M190 8 L168 8 L168 56 L190 56 L178 32 Z" fill={alpha(color, 0.6)} />
    <rect x={18} y={0} width={154} height={52} rx={8} fill={color} />
    <text x={95} y={37} textAnchor="middle" fontFamily={fontFamily} fontSize={32} fontWeight={900} fill={C.bg0}>{text}</text>
  </svg>
);

const TRAITS = ['coin', 'stopwatch', 'brain'] as const;
const TRAIT_LABEL = ['cheap', 'fast', 'smart'];

const NewModels: React.FC<{ s: ParetoState }> = ({ s }) => {
  const [, best, icons, lit] = s.appear;
  return (
    <>
      {TRAITS.map((name, i) => (
        <React.Fragment key={name}>
          <Pic name={name} x={208 + i * 260} y={70} size={110} opacity={icons} scale={lerp(0.6, 1, icons)} />
          <Label x={208 + i * 260} y={122} text={TRAIT_LABEL[i]} size={30} color={SLATE} opacity={icons} w={200} />
        </React.Fragment>
      ))}
      {STREAM.map((r, i) => {
        const p = arrival(s.progress, i, STREAM.length);
        const x = 170 + (i % 3) * 298;
        const y = i < 3 ? 350 : 700;
        const bx = x + (1 - p) * 500;
        return (
          <React.Fragment key={r.name}>
            <Pic name={r.name} x={bx} y={y} size={210} opacity={p} />
            <Banner x={bx} y={y - 128} text="NEW" color={TEAL} opacity={p * (1 - best) * (1 - lit * 0.7)} />
            <Banner x={bx} y={y - 128} text="BEST" color={AMBER} opacity={p * best * (1 - lit * 0.7)} />
            {TRAITS.map((name, k) => {
              const on = r.lit[k];
              const ix = x - 72 + k * 72;
              return (
                <React.Fragment key={name}>
                  {on ? <Glow x={ix} y={y + 140} r={34} opacity={lit} /> : null}
                  <Pic name={name} x={ix} y={y + 140} size={58} opacity={lit * (on ? 1 : 0.35)} grey={on ? 0 : 1} />
                </React.Fragment>
              );
            })}
          </React.Fragment>
        );
      })}
    </>
  );
};

// ------------------------------------------------------------------ parcel / dominated

/** Cost →, speed ↑ (better = up-left, as on the model plane). Kept clear of the action rail on the right. */
const VAN_PLANE: Plane = { x0: 150, x1: 790, y0: 860, y1: 320 };
type VanDatum = (typeof VANS)[keyof typeof VANS];

const Van: React.FC<{ v: VanDatum; a: number; grey?: number; tagRight?: boolean }> = ({ v, a, grey = 0, tagRight }) => {
  const p = toPx(VAN_PLANE, v);
  return (
    <>
      <div style={{ position: 'absolute', left: p.x - 9, top: p.y - 9, width: 18, height: 18, borderRadius: 9, background: grey > 0.5 ? SLATE : OFF, opacity: a }} />
      <Pic name={v.name} x={p.x} y={p.y - 70 - (1 - a) * 160} size={190} opacity={a} grey={grey} />
      <div
        style={{
          position: 'absolute', top: p.y - 92, left: tagRight ? p.x + 100 : p.x - 100, transform: tagRight ? 'none' : 'translateX(-100%)',
          opacity: a, display: 'flex', flexDirection: 'column', alignItems: tagRight ? 'flex-start' : 'flex-end', fontFamily, whiteSpace: 'nowrap',
        }}
      >
        <span style={{ fontSize: 46, fontWeight: 900, color: grey > 0.5 ? SLATE : AMBER }}>{v.price}</span>
        {v.label ? <span style={{ fontSize: 32, fontWeight: 700, color: SLATE }}>{v.label}</span> : null}
      </div>
    </>
  );
};

const VanPlane: React.FC<{ s: ParetoState; dominated?: boolean }> = ({ s, dominated }) => {
  const [p0, p1, p2, p3] = s.appear;
  const parcelIn = dominated ? 1 : p0;
  const shrink = dominated ? 1 : p1;
  const axes = dominated ? 1 : p1;
  const fastA = dominated ? 1 : p2;
  const snailA = dominated ? 1 : p3;
  const land = dominated ? p0 : 0;
  const region = dominated ? p1 : 0;
  const stamp = dominated ? p2 : 0;
  // Dominated region: everything slower AND pricier than some van (down-right staircase).
  const f = toPx(VAN_PLANE, VANS.fast);
  const sn = toPx(VAN_PLANE, VANS.snail);
  const bottom = VAN_PLANE.y0;
  const right = VAN_PLANE.x1;
  const regionPath = `M${sn.x},${bottom} L${sn.x},${sn.y} L${f.x},${sn.y} L${f.x},${f.y} L${right},${f.y} L${right},${bottom} Z`;
  const pr = toPx(VAN_PLANE, VANS.pricey);
  return (
    <>
      <Pic name="parcel" x={lerp(468, 468, shrink)} y={lerp(470, 170, shrink)} size={lerp(380, 170, shrink)} opacity={parcelIn} scale={lerp(0.7, 1, parcelIn)} />
      <svg width={936} height={1000} style={{ position: 'absolute', left: 0, top: 0, opacity: region, overflow: 'visible' }}>
        <path d={regionPath} fill={alpha(SLATE, 0.16)} />
      </svg>
      <Axes pl={VAN_PLANE} xLabel="cost →" yLabel="speed →" opacity={axes} />
      <BetterTag x={VAN_PLANE.x0 + 22} y={VAN_PLANE.y1 - 10} corner="tl" opacity={axes} />
      <Van v={VANS.fast} a={fastA} />
      <Van v={VANS.snail} a={snailA} tagRight />
      {dominated ? <Van v={VANS.pricey} a={land} grey={region} /> : null}
      {dominated ? <Badge x={pr.x - 40} y={pr.y - 225} text="dominated" color={OFF} opacity={stamp} scale={lerp(1.8, 1, stamp)} rot={-10} size={52} /> : null}
    </>
  );
};

// ------------------------------------------------------------------ frontier (models)

/** Cost per task →, quality ↑, as in the article's figure 1. */
const MODEL_PLANE: Plane = { x0: 150, x1: 800, y0: 860, y1: 220 };
const MODEL_FRONT = frontierOf(MODELS, MODEL_BETTER);
const MODEL_STAIRS = staircase(MODEL_FRONT);

const Frontier: React.FC<{ s: ParetoState }> = ({ s }) => {
  const [a, draw, trade] = s.appear;
  const px = (p: Pt) => toPx(MODEL_PLANE, p);
  // Full staircase in pixels: up from the floor at the cheapest point, along, then out to the right edge.
  const first = px(MODEL_FRONT[0]);
  const last = px(MODEL_FRONT[MODEL_FRONT.length - 1]);
  const steps = MODEL_STAIRS.map(px);
  const full = [{ x: first.x, y: MODEL_PLANE.y0 }, ...steps, { x: MODEL_PLANE.x1, y: last.y }];
  const d = full.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const len = full.slice(1).reduce((sum, p, i) => sum + Math.hypot(p.x - full[i].x, p.y - full[i].y), 0);
  const knob = px(pointAlong(MODEL_STAIRS, s.slider));
  return (
    <>
      <svg width={936} height={1000} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        <path d={`${d} L${MODEL_PLANE.x1},${MODEL_PLANE.y0} Z`} fill={alpha(SLATE, 0.14)} opacity={draw} />
        <path d={d} fill="none" stroke={TEAL} strokeWidth={8} strokeLinejoin="round" strokeDasharray={`${len} ${len}`} strokeDashoffset={len * (1 - draw)} />
      </svg>
      <Axes pl={MODEL_PLANE} xLabel="cost per task →" yLabel="quality →" opacity={a} />
      <BetterTag x={MODEL_PLANE.x0 + 22} y={MODEL_PLANE.y1 - 10} corner="tl" opacity={a} />
      {MODELS.map((m, i) => {
        const p = px(m);
        const dom = isDominated(m, MODELS, MODEL_BETTER);
        const pop = clamp01(a * 3 - i * 0.4);
        const col = dom ? lerp(0, 1, draw) : 0;
        return (
          <React.Fragment key={i}>
            <svg width={60} height={60} style={{ position: 'absolute', left: p.x - 30, top: p.y - 30, overflow: 'visible', opacity: pop }}>
              {dom ? (
                <>
                  <circle cx={30} cy={30} r={17} fill={OFF} opacity={1 - col} />
                  <circle cx={30} cy={30} r={17} fill="none" stroke={SLATE} strokeWidth={5} opacity={col} />
                </>
              ) : (
                <circle cx={30} cy={30} r={19} fill={draw > 0.5 ? TEAL : OFF} />
              )}
            </svg>
            {m.label ? <Label x={p.x - 26} y={p.y - 62} text={m.label} size={32} color={TEAL_TEXT} opacity={pop * draw} w={260} align="right" /> : null}
            {dom ? <Label x={p.x} y={p.y + 26} text="dominated" size={28} color={SLATE} opacity={draw} w={240} weight={600} /> : null}
          </React.Fragment>
        );
      })}
      <Label x={MODEL_PLANE.x1 - 70} y={last.y - 110} text="frontier" size={40} color={TEAL} opacity={draw} w={300} />
      {/* The trade: a knob that slides along the staircase. */}
      <div style={{ position: 'absolute', left: knob.x - 34, top: knob.y - 34, width: 68, height: 68, borderRadius: 34, border: `7px solid ${OFF}`, background: alpha(TEAL, 0.35), boxShadow: `0 0 30px ${alpha(TEAL, 0.8)}`, opacity: trade, boxSizing: 'border-box' }} />
      <Badge x={knob.x + 40} y={knob.y + 90} text="you trade" color={AMBER} opacity={trade} size={36} />
    </>
  );
};

// ------------------------------------------------------------------ reasoning

const R_PLANE: Plane = { x0: 150, x1: 800, y0: 900, y1: 400 };
/** Cost relative to default (-35%..+25%) and median time (30..72 s) to data units. */
const rPt = (cost: number, time: number): Pt => toPx(R_PLANE, { x: (cost + 0.35) / 0.6, y: (time - 30) / 42 });

const Dial: React.FC<{ x: number; y: number; value: number; opacity: number }> = ({ x, y, value, opacity }) => {
  const ang = (value * 60 - 90) * (Math.PI / 180);
  const R = 120;
  const ticks = [-1, 0, 1].map((v) => ({ v, a: (v * 60 - 90) * (Math.PI / 180) }));
  const names = ['low', 'default', 'high'];
  return (
    <>
      <svg width={360} height={220} viewBox="-180 -160 360 220" style={{ position: 'absolute', left: x - 180, top: y - 160, opacity, overflow: 'visible' }}>
        <path d={`M${-R},0 A${R},${R} 0 0,1 ${R},0`} fill={alpha(C.card, 0.9)} stroke={OFF} strokeWidth={8} />
        {ticks.map((t) => (
          <line key={t.v} x1={Math.cos(t.a) * (R - 30)} y1={Math.sin(t.a) * (R - 30)} x2={Math.cos(t.a) * (R - 6)} y2={Math.sin(t.a) * (R - 6)} stroke={t.v === 0 ? TEAL : SLATE} strokeWidth={8} strokeLinecap="round" />
        ))}
        <line x1={0} y1={0} x2={Math.cos(ang) * (R - 22)} y2={Math.sin(ang) * (R - 22)} stroke={AMBER} strokeWidth={12} strokeLinecap="round" />
        <circle r={16} fill={OFF} />
      </svg>
      {ticks.map((t, i) => (
        <Label key={t.v} x={x + Math.cos(t.a) * (R + 50)} y={y + Math.sin(t.a) * (R + 50) - 22} text={names[i]} size={28} color={t.v === 0 ? TEAL_TEXT : SLATE} opacity={opacity} w={160} />
      ))}
    </>
  );
};

const Reasoning: React.FC<{ s: ParetoState }> = ({ s }) => {
  const [a, low, lowX, high, highGrey] = s.appear;
  const L = REASONING.low;
  const D = REASONING.default;
  const H = REASONING.high;
  const pl = rPt(L.cost, L.time);
  const pd = rPt(D.cost, D.time);
  const ph = rPt(H.cost, H.time);
  return (
    <>
      <Pic name="robot-teal" x={200} y={170} size={280} opacity={a} />
      <Dial x={600} y={230} value={s.dial} opacity={a} />
      <svg width={936} height={1000} style={{ position: 'absolute', left: 0, top: 0, opacity: a, overflow: 'visible' }}>
        {[40, 50, 60].map((sec) => {
          const y = rPt(0, sec).y;
          return <line key={sec} x1={R_PLANE.x0} y1={y} x2={R_PLANE.x1} y2={y} stroke="rgba(255,255,255,0.07)" strokeWidth={2} />;
        })}
      </svg>
      <Axes pl={R_PLANE} xLabel="cost →" yLabel="time →" opacity={a} />
      <BetterTag x={R_PLANE.x0 + 16} y={R_PLANE.y0 - 8} corner="bl" opacity={a} />
      {/* 50 s unlabelled: the rotated axis title sits at mid-height */}
      {[40, 60].map((sec) => (
        <Label key={sec} x={R_PLANE.x0 - 14} y={rPt(0, sec).y - 16} text={`${sec} s`} size={26} color={SLATE} opacity={a} w={100} align="right" weight={600} />
      ))}
      {/* default: stays teal */}
      <div style={{ position: 'absolute', left: pd.x - 20, top: pd.y - 20, width: 40, height: 40, borderRadius: 20, background: TEAL, opacity: a, boxShadow: `0 0 ${20 + 14 * highGrey}px ${alpha(TEAL, 0.8)}` }} />
      <Label x={pd.x + 34} y={pd.y - 22} text="default" size={34} color={TEAL_TEXT} opacity={a} w={300} align="left" />
      {/* low: cheaper and faster, fails the gate */}
      <svg width={80} height={80} style={{ position: 'absolute', left: pl.x - 40, top: pl.y - 40, overflow: 'visible', opacity: low }}>
        <circle cx={40} cy={40} r={20} fill={lowX > 0.5 ? 'none' : OFF} stroke={lowX > 0.5 ? RED : OFF} strokeWidth={5} />
        <path d="M18,18 L62,62 M62,18 L18,62" stroke={RED} strokeWidth={10} strokeLinecap="round" opacity={lowX} />
      </svg>
      <Label x={pl.x + 50} y={pl.y - 70} text={L.label} size={34} color={OFF} opacity={low} w={400} align="left" />
      <Label x={pl.x + 50} y={pl.y + 4} text="fails the gate" size={34} color={RED} opacity={lowX} w={400} align="left" />
      {/* high: pricier and slower, dominated by default */}
      <svg width={60} height={60} style={{ position: 'absolute', left: ph.x - 30, top: ph.y - 30, overflow: 'visible', opacity: high }}>
        <circle cx={30} cy={30} r={19} fill={OFF} opacity={1 - highGrey} />
        <circle cx={30} cy={30} r={19} fill="none" stroke={SLATE} strokeWidth={5} opacity={highGrey} />
      </svg>
      <Label x={ph.x + 30} y={ph.y - 80} text={H.label} size={34} color={highGrey > 0.5 ? SLATE : OFF} opacity={high} w={300} align="right" />
      <Label x={ph.x} y={ph.y + 28} text="dominated" size={32} color={SLATE} opacity={highGrey} w={260} />
    </>
  );
};

// ------------------------------------------------------------------ receipt

const money = (v: number) => `$${v.toFixed(3)}`;

const Receipt: React.FC<{ s: ParetoState }> = ({ s }) => {
  // One classification with luna, as a till receipt: model a sliver (4%), web searches nearly all of it.
  const [a, model, web] = s.appear;
  const W = 640;
  const X = 468 - W / 2;
  const TOP = 130;
  const FULL = 575;
  const H = lerp(40, FULL, s.progress);
  const bar = W - 80;
  const teeth = Array.from({ length: 16 }, (_, i) => `L${W - ((i + 0.5) * W) / 16},${H + 18} L${W - ((i + 1) * W) / 16},${H}`).join(' ');
  const R = RECEIPT;
  const row: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 40, fontWeight: 800 };
  return (
    <>
      <svg width={W} height={H + 20} style={{ position: 'absolute', left: X, top: TOP, opacity: a, overflow: 'visible', filter: `drop-shadow(0 18px 30px ${alpha('#000000', 0.45)})` }}>
        <path d={`M0,0 L${W},0 L${W},${H} ${teeth} L0,${H} Z`} fill={OFF} />
      </svg>
      <div style={{ position: 'absolute', left: X + 40, top: TOP + 30, width: bar, opacity: a, fontFamily, color: C.bg1, fontSize: 34, fontWeight: 800, letterSpacing: 3, textAlign: 'center', borderBottom: `3px dashed ${alpha(C.bg1, 0.4)}`, paddingBottom: 16 }}>
        1 TASK · luna
      </div>
      {/* model: a sliver */}
      <div style={{ position: 'absolute', left: X + 40, top: TOP + 130, width: bar, opacity: model, fontFamily, color: C.bg1 }}>
        <div style={row}>
          <span>model</span>
          <span>{money(R.model)}</span>
        </div>
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ height: 30, width: Math.max(6, bar * (R.model / R.total) * model), borderRadius: 6, background: TEAL }} />
          <span style={{ fontSize: 36, fontWeight: 900, color: '#0f766e' }}>4%</span>
        </div>
      </div>
      {/* web searches: nearly all of it */}
      <div style={{ position: 'absolute', left: X + 40, top: TOP + 280, width: bar, opacity: web, fontFamily, color: C.bg1 }}>
        <div style={row}>
          <span>web searches</span>
          <span>{money(R.web)}</span>
        </div>
        <div style={{ marginTop: 12, height: 30, width: bar * (R.web / R.total) * web, borderRadius: 6, background: AMBER }} />
        <div style={{ ...row, marginTop: 34, fontSize: 32, fontWeight: 700, color: alpha(C.bg1, 0.7) }}>
          <span>other</span>
          <span>{money(R.other)}</span>
        </div>
        <div style={{ ...row, marginTop: 22, paddingTop: 16, borderTop: `3px dashed ${alpha(C.bg1, 0.4)}`, fontSize: 44, fontWeight: 900 }}>
          <span>TOTAL</span>
          <span>{money(R.total)}</span>
        </div>
      </div>
    </>
  );
};

// ------------------------------------------------------------------ scale (seconds / decision)

const ScaleScene: React.FC<{ s: ParetoState; decision?: boolean }> = ({ s, decision }) => {
  const [a0, a1, a2] = s.appear;
  const show = decision ? 1 : a0;
  const loaded = decision ? 1 : a1;
  const card = decision ? 1 : a2;
  const back = decision ? a1 : 0;
  const tip = decision ? a0 : 0;
  const PX = 468;
  const PY = 380;
  const ARM = 270;
  const th = (s.tilt * Math.PI) / 180;
  const left = { x: PX - ARM * Math.cos(th), y: PY - ARM * Math.sin(th) };
  const right = { x: PX + ARM * Math.cos(th), y: PY + ARM * Math.sin(th) };
  const HANG = 150;
  const pan = (e: Pt) => (
    <g>
      <line x1={e.x} y1={e.y} x2={e.x - 90} y2={e.y + HANG} stroke={SLATE} strokeWidth={4} />
      <line x1={e.x} y1={e.y} x2={e.x + 90} y2={e.y + HANG} stroke={SLATE} strokeWidth={4} />
      <path d={`M${e.x - 120},${e.y + HANG} Q${e.x},${e.y + HANG + 70} ${e.x + 120},${e.y + HANG} Z`} fill={alpha(SLATE, 0.5)} stroke={OFF} strokeWidth={5} />
    </g>
  );
  return (
    <>
      {/* "$3 / hour": the price of the trade */}
      <div style={{ position: 'absolute', left: 468 - 260, top: 20 + (1 - card) * 30, width: 520, padding: '18px 0', borderRadius: 26, background: C.card, border: `4px solid ${AMBER}`, textAlign: 'center', fontFamily, fontSize: 88, fontWeight: 900, color: AMBER, opacity: card * (decision ? 0.55 : 1), boxSizing: 'border-box' }}>
        $3 / hour
      </div>
      <svg width={936} height={1000} style={{ position: 'absolute', left: 0, top: 0, opacity: show, overflow: 'visible' }}>
        <path d={`M${PX - 110},640 L${PX + 110},640 L${PX + 60},610 L${PX - 60},610 Z`} fill={alpha(SLATE, 0.6)} stroke={OFF} strokeWidth={4} />
        <line x1={PX} y1={PY} x2={PX} y2={612} stroke={OFF} strokeWidth={12} />
        <line x1={left.x} y1={left.y} x2={right.x} y2={right.y} stroke={OFF} strokeWidth={14} strokeLinecap="round" />
        <circle cx={PX} cy={PY} r={18} fill={AMBER} />
        {pan(left)}
        {pan(right)}
      </svg>
      {/* terra's side: the seconds it saves; luna's side: the cents it saves */}
      <Pic name="stopwatch" x={left.x} y={left.y + HANG - 62} size={130} opacity={loaded} scale={lerp(0.5, 1, loaded)} />
      <Label x={left.x} y={left.y + HANG + 44} text="−27 s" size={46} color={AMBER} opacity={loaded} w={260} weight={900} />
      <Pic name="coins" x={right.x} y={right.y + HANG - 58} size={130} opacity={loaded} scale={lerp(0.5, 1, loaded)} />
      <Label x={right.x} y={right.y + HANG + 44} text="2¢" size={46} color={TEAL_TEXT} opacity={loaded} w={260} weight={900} />
      {/* the two contenders, both past the gate */}
      <Pic name="robot-amber" x={lerp(200, 130, back)} y={800} size={lerp(250, 200, back)} opacity={show * (1 - 0.55 * back)} grey={back * 0.6} />
      {/* luna drops a little as the pan tips, so its glow stays clear of the lowered "2¢" */}
      <Glow x={736} y={lerp(800, 850, tip)} r={125} opacity={tip} />
      <Pic name="robot-teal" x={736} y={lerp(800, 850, tip)} size={250} opacity={show} scale={lerp(1, 1.05, tip)} />
      <Badge x={lerp(200, 130, back) + 90} y={690} text="✓" color={TEAL} opacity={show * (decision ? 1 - back : 1)} size={36} />
      <Badge x={lerp(826, 856, tip)} y={lerp(690, 750, tip)} text="✓" color={TEAL} opacity={show} size={36} />
    </>
  );
};

export const Pareto: React.FC<AnimProps & ParetoProps> = ({ t, beats, dur, vertical, ...props }) => {
  const s = frameState(props, t, beats, dur);
  const st = stageOf(vertical);
  const body =
    s.mode === 'hook' ? <Hook s={s} cover={props.cover} />
    : s.mode === 'newmodels' ? <NewModels s={s} />
    : s.mode === 'parcel' ? <VanPlane s={s} />
    : s.mode === 'dominated' ? <VanPlane s={s} dominated />
    : s.mode === 'frontier' ? <Frontier s={s} />
    : s.mode === 'reasoning' ? <Reasoning s={s} />
    : s.mode === 'receipt' ? <Receipt s={s} />
    : s.mode === 'seconds' ? <ScaleScene s={s} />
    : <ScaleScene s={s} decision />;
  // Drawn on a 936x1000 board, scaled to the stage.
  const k = Math.min(st.w / 936, st.h / 1000);
  return (
    <div style={{ position: 'absolute', top: st.top, left: st.side, width: st.w, height: st.h, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: (st.w - 936 * k) / 2, top: (st.h - 1000 * k) / 2, width: 936, height: 1000, transform: `scale(${k})`, transformOrigin: '0 0' }}>{body}</div>
    </div>
  );
};
