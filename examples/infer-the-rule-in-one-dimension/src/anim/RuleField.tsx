// RuleField renderer: one dark plane, a glowing pen, accent sparks where the mover hit a rule the
// spec never mentioned. Everything is drawn from `frameState` (RuleField.state.ts) with the brand
// tokens; text is Inter, code is the system mono.
import React from 'react';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { Stage } from './Stage.tsx';
import {
  ARCS_DEG,
  CODE,
  DISC,
  DISC2,
  FITS,
  FIXES,
  H,
  LANDINGS,
  LSQ_TOTALS,
  TRAILS,
  W,
  arcPoints,
  frameState,
  mapper,
  type Box,
  type Pt,
  type RuleFieldProps,
} from './RuleField.state.ts';

export { frameState };
export type { RuleFieldProps };

const MONO = "ui-monospace, Menlo, 'SF Mono', monospace";
const GHOST = alpha(C.muted, 0.55);

type S<M extends string> = Extract<ReturnType<typeof frameState>, { mode: M }>;

// ---------------------------------------------------------------------------------------------
// Primitives

const Defs: React.FC = () => (
  <defs>
    <linearGradient id="rf-acc" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor={C.accentText} />
      <stop offset="100%" stopColor={C.accent2} />
    </linearGradient>
    <linearGradient id="rf-accv" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={C.accentText} />
      <stop offset="100%" stopColor={C.accent2} />
    </linearGradient>
    <radialGradient id="rf-glow">
      <stop offset="0%" stopColor={C.accent2} stopOpacity={0.9} />
      <stop offset="45%" stopColor={C.accent} stopOpacity={0.35} />
      <stop offset="100%" stopColor={C.accent} stopOpacity={0} />
    </radialGradient>
    <radialGradient id="rf-spark">
      <stop offset="0%" stopColor="#ffffff" stopOpacity={1} />
      <stop offset="30%" stopColor={C.accentText} stopOpacity={0.85} />
      <stop offset="100%" stopColor={C.accent2} stopOpacity={0} />
    </radialGradient>
    {/* User-space units: straight vertical strokes have a zero-width bounding box, which would
        make an objectBoundingBox gradient or filter draw nothing. */}
    <linearGradient id="rf-acc-s" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={W} y2={H}>
      <stop offset="0%" stopColor={C.accentText} />
      <stop offset="100%" stopColor={C.accent2} />
    </linearGradient>
    <filter id="rf-blur" filterUnits="userSpaceOnUse" x={-200} y={-200} width={W + 400} height={H + 400}>
      <feGaussianBlur stdDeviation="9" />
    </filter>
  </defs>
);

const path = (pts: Pt[]) => (pts.length ? 'M' + pts.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L') : '');

/** The first fraction `p` of a polyline, by length. */
const partial = (pts: Pt[], p: number): Pt[] => {
  if (p <= 0 || pts.length < 2) return [];
  if (p >= 1) return pts;
  const seg = pts.slice(1).map((q, i) => Math.hypot(q.x - pts[i].x, q.y - pts[i].y));
  const total = seg.reduce((a, b) => a + b, 0);
  let left = total * p;
  const out = [pts[0]];
  for (let i = 0; i < seg.length; i++) {
    if (left >= seg[i]) {
      out.push(pts[i + 1]);
      left -= seg[i];
    } else {
      const f = seg[i] ? left / seg[i] : 0;
      out.push({ x: pts[i].x + (pts[i + 1].x - pts[i].x) * f, y: pts[i].y + (pts[i + 1].y - pts[i].y) * f });
      break;
    }
  }
  return out;
};

/** A glowing accent stroke (blurred copy under a crisp one). */
const Glow: React.FC<{ d: string; w?: number; opacity?: number; stroke?: string }> = ({ d, w = 10, opacity = 1, stroke = 'url(#rf-acc-s)' }) =>
  d ? (
    <g opacity={opacity}>
      <path d={d} fill="none" stroke={C.accent} strokeWidth={w * 2.4} strokeLinecap="round" strokeLinejoin="round" opacity={0.55} filter="url(#rf-blur)" />
      <path d={d} fill="none" stroke={stroke} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  ) : null;

const Spark: React.FC<{ p: Pt; appear: number; glow: number; size?: number }> = ({ p, appear, glow, size = 1 }) =>
  appear > 0 ? (
    <g opacity={appear}>
      <circle cx={p.x} cy={p.y} r={(14 + 30 * glow) * size} fill="url(#rf-spark)" opacity={0.5 + 0.5 * glow} />
      {glow > 0.55 && (
        <g stroke="#ffffff" strokeWidth={3 * size} strokeLinecap="round" opacity={(glow - 0.55) / 0.45}>
          <line x1={p.x - 26 * size * glow} y1={p.y} x2={p.x + 26 * size * glow} y2={p.y} />
          <line x1={p.x} y1={p.y - 26 * size * glow} x2={p.x} y2={p.y + 26 * size * glow} />
        </g>
      )}
      <circle cx={p.x} cy={p.y} r={5.5 * size} fill="#ffffff" />
    </g>
  ) : null;

const Pen: React.FC<{ p: Pt; opacity?: number }> = ({ p, opacity = 1 }) =>
  opacity > 0 ? (
    <g opacity={opacity}>
      <circle cx={p.x} cy={p.y} r={42} fill="url(#rf-glow)" />
      <circle cx={p.x} cy={p.y} r={11} fill="#ffffff" />
    </g>
  ) : null;

const Txt: React.FC<{
  x: number;
  y: number;
  size?: number;
  color?: string;
  weight?: number;
  anchor?: 'start' | 'middle' | 'end';
  opacity?: number;
  mono?: boolean;
  children: React.ReactNode;
}> = ({ x, y, size = 38, color = C.text, weight = 600, anchor = 'start', opacity = 1, mono, children }) =>
  opacity > 0 ? (
    <text x={x} y={y} fontSize={size} fill={color} fontWeight={weight} textAnchor={anchor} opacity={opacity} fontFamily={mono ? MONO : fontFamily}>
      {children}
    </text>
  ) : null;

/** A rounded pill label with a tinted border. */
const Pill: React.FC<{ x: number; y: number; text: string; size?: number; color?: string; opacity?: number; anchor?: 'start' | 'middle' | 'end'; scale?: number }> = ({
  x,
  y,
  text,
  size = 36,
  color = C.accentText,
  opacity = 1,
  anchor = 'middle',
  scale = 1,
}) => {
  if (opacity <= 0) return null;
  const w = text.length * size * 0.56 + size * 1.2;
  const h = size * 1.6;
  const left = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
  return (
    <g opacity={opacity} transform={`translate(${x} ${y}) scale(${scale}) translate(${-x} ${-y})`}>
      <rect x={left} y={y - h / 2} width={w} height={h} rx={h / 2} fill={alpha(C.bg0, 0.88)} stroke={color} strokeWidth={3} />
      <text x={left + w / 2} y={y + size * 0.36} fontSize={size} fontWeight={700} fill={color} textAnchor="middle" fontFamily={fontFamily}>
        {text}
      </text>
    </g>
  );
};

/** The code strip: a card with mono lines typed out; `hi` is lit in the accent once `lit` > 0. */
const Code: React.FC<{ box: Box; lines: readonly string[]; typed: number[]; size?: number; hi?: string; lit?: number; title?: string; opacity?: number }> = ({
  box,
  lines,
  typed,
  size = 44,
  hi,
  lit = 0,
  title,
  opacity = 1,
}) => (
  <g opacity={opacity}>
    <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={22} fill={alpha(C.card, 0.92)} stroke={alpha(C.muted, 0.22)} strokeWidth={2} />
    {title && (
      <Txt x={box.x + 30} y={box.y + 46} size={28} color={C.muted} weight={500}>
        {title}
      </Txt>
    )}
    {lines.map((line, i) => {
      const shown = line.slice(0, typed[i] ?? 0);
      const y = box.y + (title ? 108 : 72) + i * size * 1.45;
      const parts = hi && shown.includes(hi) ? shown.split(hi) : [shown];
      return (
        <text key={i} x={box.x + 30} y={y} fontSize={size} fontFamily={MONO} fill={C.text} xmlSpace="preserve" style={{ whiteSpace: 'pre' }}>
          {parts.map((part, k) => (
            <React.Fragment key={k}>
              {k > 0 && (
                <tspan fill={lit > 0 ? C.accentText : C.text} fontWeight={lit > 0 ? 800 : 400}>
                  {hi}
                </tspan>
              )}
              <tspan>{part}</tspan>
            </React.Fragment>
          ))}
        </text>
      );
    })}
  </g>
);

const Grid: React.FC<{ box: Box; m: ReturnType<typeof mapper>; opacity: number; x0: number; x1: number; y0: number; y1: number }> = ({ box, m, opacity, x0, x1, y0, y1 }) => {
  if (opacity <= 0) return null;
  const xs: number[] = [];
  const ys: number[] = [];
  for (let x = Math.ceil(x0); x <= x1; x++) xs.push(x);
  for (let y = Math.ceil(y0); y <= y1; y++) ys.push(y);
  return (
    <g opacity={opacity} stroke={alpha(C.muted, 0.13)} strokeWidth={2}>
      {xs.map((x) => (
        <line key={`x${x}`} x1={m.X(x)} y1={box.y} x2={m.X(x)} y2={box.y + box.h} />
      ))}
      {ys.map((y) => (
        <line key={`y${y}`} x1={box.x} y1={m.Y(y)} x2={box.x + box.w} y2={m.Y(y)} />
      ))}
    </g>
  );
};

/** Ghost (dashed) circle; optional faint fill. */
const GhostCircle: React.FC<{ c: Pt; r: number; opacity?: number; fill?: number; w?: number }> = ({ c, r, opacity = 1, fill = 0.05, w = 5 }) => (
  <circle cx={c.x} cy={c.y} r={r} fill={alpha(C.accent, fill)} stroke={GHOST} strokeWidth={w} strokeDasharray="16 14" opacity={opacity} />
);

// ---------------------------------------------------------------------------------------------
// The rail (1D): a cart on a rail, a wall at x = 8.0 that is a ghost until it heals.

const Rail: React.FC<{
  box: Box;
  railY: number;
  cartX: number;
  heal: number;
  glow?: number;
  sparks?: { appear: number; glow: number }[];
  sparkDy?: number[];
  pen?: boolean;
  opacity?: number;
}> = ({ box, railY, cartX, heal, glow = 0, sparks = [], sparkDy = [], pen = true, opacity = 1 }) => {
  const m = mapper(box, { x: 5, y: 0 }, box.w / 11);
  const wx = m.X(8);
  const top = box.y + 24;
  const bot = box.y + box.h - 24;
  const front = top + (bot - top) * heal;
  return (
    <g opacity={opacity}>
      <line x1={box.x + 10} y1={railY} x2={box.x + box.w - 10} y2={railY} stroke={alpha(C.muted, 0.6)} strokeWidth={6} strokeLinecap="round" />
      {[0, 2, 4, 6, 8, 10].map((x) => (
        <line key={x} x1={m.X(x)} y1={railY + 8} x2={m.X(x)} y2={railY + 26} stroke={alpha(C.muted, 0.45)} strokeWidth={3} />
      ))}
      <line x1={wx} y1={top} x2={wx} y2={bot} stroke={GHOST} strokeWidth={9} strokeDasharray="20 18" />
      {heal > 0 && <Glow d={`M${wx} ${top} L${wx} ${front}`} w={14 + 6 * glow} />}
      {/* The cart: its front touches the wall when cartX = 8. */}
      <rect x={m.X(cartX) - 96} y={railY - 52} width={88} height={46} rx={12} fill={C.card} stroke={C.text} strokeWidth={4} />
      <circle cx={m.X(cartX) - 74} cy={railY - 4} r={8} fill={C.text} />
      <circle cx={m.X(cartX) - 30} cy={railY - 4} r={8} fill={C.text} />
      {sparks.map((s, i) => (
        <Spark key={i} p={{ x: wx, y: railY - 28 + (sparkDy[i] ?? 0) }} appear={s.appear} glow={s.glow} />
      ))}
      {pen && heal > 0 && heal < 1 && <Pen p={{ x: wx, y: front }} />}
    </g>
  );
};

// ---------------------------------------------------------------------------------------------
// Modes

const Hook: React.FC<{ s: S<'hook'> }> = ({ s }) => {
  const top: Box = { x: 0, y: 70, w: W, h: 400 };
  const bot: Box = { x: 0, y: 600, w: W, h: 490 };
  const c = { x: W / 2, y: bot.y + bot.h / 2 + 10 };
  const m = mapper({ ...bot, y: c.y - bot.h / 2 }, DISC, 185);
  // Two-thirds round, then it breaks off: the gap has to read as open, not as nearly closed.
  const A = 180 + 215 * s.bot.attempt;
  const drawn = s.bot.attempt > 0 ? arcPoints(DISC, DISC.R, 180, A).map((p) => ({ x: m.X(p.x), y: m.Y(p.y) })) : [];
  const ang = s.bot.attempt > 0 ? A : s.bot.idleAngle;
  const tip = { x: m.X(DISC.x + Math.cos((ang * Math.PI) / 180)), y: m.Y(DISC.y + Math.sin((ang * Math.PI) / 180)) };
  // After the break the pen slides off along the tangent and fades.
  const tan = { x: -Math.sin((ang * Math.PI) / 180), y: -Math.cos((ang * Math.PI) / 180) };
  const pen = { x: tip.x + tan.x * 70 * s.bot.broke, y: tip.y + tan.y * 70 * s.bot.broke };
  const gap = arcPoints(DISC, DISC.R, 395, 540).map((p) => ({ x: m.X(p.x), y: m.Y(p.y) }));
  return (
    <>
      <Txt x={6} y={46} size={40} color={C.muted}>
        1D rule: a wall
      </Txt>
      <Pill x={W - 6} y={34} anchor="end" text="put back ✓" opacity={s.top.check} scale={0.8 + 0.2 * s.top.check} />
      <Rail box={top} railY={top.y + 250} cartX={s.top.cartX} heal={s.top.heal} glow={s.top.check} sparks={s.top.sparks} sparkDy={[-30, 14, -54, 30, -10]} />
      <line x1={0} y1={545} x2={W} y2={545} stroke={alpha(C.muted, 0.18)} strokeWidth={2} />
      <Txt x={6} y={608} size={40} color={C.muted}>
        2D rule: a circle
      </Txt>
      <Pill x={W - 6} y={596} anchor="end" text="not once ✗" color={C.text} opacity={s.bot.cross} scale={0.8 + 0.2 * s.bot.cross} />
      <GhostCircle c={c} r={185} />
      {LANDINGS[0].map((p, i) => (
        <Spark key={i} p={{ x: m.X(p.x), y: m.Y(p.y) }} appear={s.bot.sparks[i].appear} glow={s.bot.sparks[i].glow} size={0.8} />
      ))}
      {drawn.length > 1 && <Glow d={path(drawn)} w={11} />}
      {s.bot.gap > 0 && <path d={path(gap)} fill="none" stroke={C.text} strokeWidth={7} strokeDasharray="4 18" strokeLinecap="round" opacity={s.bot.gap} />}
      <Pen p={pen} opacity={1 - s.bot.broke} />
    </>
  );
};

const Setup: React.FC<{ s: S<'setup'> }> = ({ s }) => {
  const chipY = 330;
  const chips = [
    { x: 20, w: 190, text: 'LLM', mono: false },
    { x: 270, w: 420, text: 'step(state, action)', mono: true },
    { x: 750, w: 190, text: 'planner', mono: false },
  ];
  const strikeW = 400 * s.strike;
  const rail: Box = { x: 0, y: 560, w: W, h: 470 };
  return (
    <>
      <g opacity={s.spec}>
        <rect x={40} y={0} width={880} height={220} rx={24} fill={alpha(C.card, 0.92)} stroke={alpha(C.muted, 0.25)} strokeWidth={2} />
        <Txt x={76} y={58} size={30} color={C.muted} weight={600}>
          THE SPEC
        </Txt>
        <Txt x={76} y={120} size={40} weight={500}>
          integrator: pinned exactly ✓
        </Txt>
        <Txt x={76} y={182} size={40} weight={500} color={s.strike > 0.5 ? C.muted : C.text}>
          wall at x = 8.0
        </Txt>
        {s.strike > 0 && <line x1={70} y1={168} x2={70 + strikeW} y2={168} stroke={C.accentText} strokeWidth={6} strokeLinecap="round" />}
        <Pill x={600} y={170} text="left out" size={32} opacity={s.strike} />
      </g>
      {chips.map((ch, i) => (
        <g key={i} opacity={s.chips[i]} transform={`translate(0 ${(1 - s.chips[i]) * 30})`}>
          <rect
            x={ch.x}
            y={chipY - 60}
            width={ch.w}
            height={120}
            rx={i === 1 ? 20 : 60}
            fill={i === 1 ? alpha(C.card, 0.95) : alpha(C.accent, 0.16)}
            stroke={i === 1 ? alpha(C.muted, 0.35) : C.accentText}
            strokeWidth={3}
          />
          <Txt x={ch.x + ch.w / 2} y={chipY + 14} size={ch.mono ? 34 : 42} anchor="middle" mono={ch.mono} weight={ch.mono ? 500 : 700}>
            {ch.text}
          </Txt>
        </g>
      ))}
      {[
        [210, 270],
        [690, 750],
      ].map(([a, b], i) =>
        s.arrows[i] > 0 ? (
          <g key={i} stroke={C.accentText} strokeWidth={6} strokeLinecap="round" fill="none">
            <line x1={a + 6} y1={chipY} x2={a + 6 + (b - a - 18) * s.arrows[i]} y2={chipY} />
            {s.arrows[i] > 0.9 && <path d={`M${b - 26} ${chipY - 14} L${b - 10} ${chipY} L${b - 26} ${chipY + 14}`} />}
          </g>
        ) : null,
      )}
      <Txt x={W / 2} y={490} size={36} color={C.muted} anchor="middle" weight={500} opacity={s.chips[1]}>
        the model of the physics
      </Txt>
      <Rail box={rail} railY={rail.y + 300} cartX={s.cartX} heal={0} opacity={s.rail} pen={false} />
      <Txt x={mapper(rail, { x: 5, y: 0 }, W / 11).X(8) - 24} y={rail.y + 80} size={34} color={C.muted} weight={500} anchor="end" opacity={s.rail}>
        no wall in its model
      </Txt>
    </>
  );
};

const Heal: React.FC<{ s: S<'heal'> }> = ({ s }) => {
  const box: Box = { x: 0, y: 0, w: W, h: 640 };
  const flash = Math.max(0, ...s.sparks.map((sp) => (sp.appear > 0 ? (sp.glow - 0.3) / 0.7 : 0)));
  const cartX = 8 - 0.5 * (1 - flash);
  return (
    <>
      <Rail box={box} railY={400} cartX={cartX} heal={s.heal} glow={s.glow} sparks={s.sparks} sparkDy={[-20, 24, -60, 6, -36]} />
      <Txt x={6} y={52} size={38} color={C.muted} opacity={1 - s.heal}>
        a handful of contacts
      </Txt>
      <Pill x={W - 6} y={40} anchor="end" text="the whole wall ✓" size={34} opacity={s.glow} />
      <Code
        box={{ x: 30, y: 700, w: 900, h: 300 }}
        lines={CODE.cart}
        typed={s.code}
        size={52}
        hi="8.0"
        lit={s.constant}
        title="the model wrote"
      />
      <Txt x={W / 2 + 330} y={970} size={30} color={C.accentText} anchor="middle" opacity={s.constant} weight={700}>
        right constant
      </Txt>
    </>
  );
};

const Tally1: React.FC<{ s: S<'tally1'> }> = ({ s }) => {
  const cols = 15;
  const icons = Array.from({ length: 111 }, (_, i) => i);
  return (
    <>
      {icons.map((i) => {
        const o = Math.max(0, Math.min(1, s.shown - i));
        if (o <= 0) return null;
        const x = 60 + (i % cols) * 60;
        const y = 50 + Math.floor(i / cols) * 74;
        const solid = i < 105 && s.healed > i;
        return solid ? (
          <rect key={i} x={x - 7} y={y} width={14} height={52} rx={7} fill="url(#rf-accv)" opacity={o} />
        ) : (
          <line key={i} x1={x} y1={y + 4} x2={x} y2={y + 48} stroke={GHOST} strokeWidth={8} strokeDasharray="9 8" opacity={o} />
        );
      })}
      <text x={W / 2} y={810} textAnchor="middle" fontFamily={fontFamily} fontWeight={800}>
        <tspan fontSize={170} fill="url(#rf-acc)">
          {s.count}
        </tspan>
        <tspan fontSize={110} fill={C.muted} opacity={s.total}>
          {' / 111'}
        </tspan>
      </text>
      <Txt x={W / 2} y={900} size={46} color={C.text} anchor="middle" opacity={s.label} weight={600}>
        1D rules: wall, stop
      </Txt>
    </>
  );
};

/** Where a straight trail from `a` to `b` first enters a disc: parameter in [0, 1] (1 = never). */
const entry = (a: Pt, b: Pt, d: { x: number; y: number; R: number }) => {
  for (let k = 0; k <= 400; k++) {
    const u = k / 400;
    if (Math.hypot(a.x + (b.x - a.x) * u - d.x, a.y + (b.y - a.y) * u - d.y) <= d.R) return u;
  }
  return 1;
};

const Plane: React.FC<{ s: S<'plane'> }> = ({ s }) => {
  const box: Box = { x: 0, y: 40, w: W, h: 1000 };
  const m = mapper(box, { x: 5, y: 0 }, 92);
  return (
    <>
      <Grid box={box} m={m} opacity={s.tilt} x0={-1} x1={11} y0={-6} y1={6} />
      {/* The 1D rail folds out into the plane: the rail line thins into the x axis. */}
      <line x1={0} y1={m.Y(0)} x2={W} y2={m.Y(0)} stroke={alpha(C.muted, 0.6 - 0.35 * s.tilt)} strokeWidth={6 - 3 * s.tilt} opacity={s.rail} />
      <line x1={m.X(0)} y1={m.Y(0) - 500 * s.tilt} x2={m.X(0)} y2={m.Y(0) + 500 * s.tilt} stroke={alpha(C.muted, 0.35)} strokeWidth={3} opacity={s.tilt} />
      {/* The cart from the 1D act, resting at its wall, folds away with the rail. */}
      <g opacity={s.rail * (1 - s.tilt)}>
        <line x1={m.X(8)} y1={m.Y(0) - 200} x2={m.X(8)} y2={m.Y(0) + 200} stroke={C.accentText} strokeWidth={12} strokeLinecap="round" />
        <rect x={m.X(8) - 96} y={m.Y(0) - 52} width={88} height={46} rx={12} fill={C.card} stroke={C.text} strokeWidth={4} />
        <circle cx={m.X(8) - 74} cy={m.Y(0) - 4} r={8} fill={C.text} />
        <circle cx={m.X(8) - 30} cy={m.Y(0) - 4} r={8} fill={C.text} />
      </g>
      <Txt x={6} y={50} size={72} weight={800} color={C.muted} opacity={1 - s.tilt}>
        1D
      </Txt>
      <text x={6} y={50} fontSize={72} fontWeight={800} fill="url(#rf-acc)" opacity={s.tilt} fontFamily={fontFamily}>
        2D
      </text>
      {[DISC, DISC2].map((d, i) => (
        <g key={i} opacity={s.discs} transform={`translate(${m.X(d.x)} ${m.Y(d.y)}) scale(${0.6 + 0.4 * s.discs}) translate(${-m.X(d.x)} ${-m.Y(d.y)})`}>
          <GhostCircle c={{ x: m.X(d.x), y: m.Y(d.y) }} r={d.R * m.s} fill={0.1} />
        </g>
      ))}
      {TRAILS.map((tr, i) => {
        const stopAt = 'stopAt' in tr ? entry(tr.from, tr.to, DISC) : 1;
        const u = s.trails[i] * stopAt;
        if (s.trails[i] <= 0) return null;
        const a = { x: m.X(tr.from.x), y: m.Y(tr.from.y) };
        const head = { x: m.X(tr.from.x + (tr.to.x - tr.from.x) * u), y: m.Y(tr.from.y + (tr.to.y - tr.from.y) * u) };
        const frozen = 'stopAt' in tr && s.freeze > 0;
        return (
          <g key={i}>
            <line x1={a.x} y1={a.y} x2={head.x} y2={head.y} stroke={alpha(C.text, 0.45)} strokeWidth={5} strokeDasharray="2 12" strokeLinecap="round" />
            <circle cx={head.x} cy={head.y} r={16} fill={frozen ? C.text : C.accentText} stroke={C.bg0} strokeWidth={3} />
            {'stopAt' in tr && <Spark p={head} appear={s.freezeSpark.appear} glow={s.freezeSpark.glow} />}
          </g>
        );
      })}
      <Pill x={m.X(DISC.x)} y={m.Y(DISC.y) + DISC.R * m.s + 70} text="stops inside" size={34} opacity={s.freeze} />
    </>
  );
};

const Tally2: React.FC<{ s: S<'tally2'> }> = ({ s }) => {
  const cols = 13;
  const icons = Array.from({ length: 156 }, (_, i) => i);
  return (
    <>
      {icons.map((i) => {
        const o = Math.max(0, Math.min(1, s.shown - i));
        if (o <= 0) return null;
        const x = 60 + (i % cols) * 70;
        const y = 44 + Math.floor(i / cols) * 54;
        const pts = arcPoints({ x, y }, 19, 120 + (i % 5) * 18, 360 + (i % 5) * 18, 12);
        return <path key={i} d={path(pts)} fill="none" stroke={GHOST} strokeWidth={5} strokeLinecap="round" opacity={o} />;
      })}
      <text x={W / 2} y={830} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} opacity={s.count}>
        <tspan fontSize={170} fill={C.text}>
          0
        </tspan>
        <tspan fontSize={110} fill={C.muted}>
          {' / 156'}
        </tspan>
      </text>
      <Txt x={W / 2} y={920} size={46} color={C.text} anchor="middle" opacity={s.label} weight={600}>
        2D regions: disc, square
      </Txt>
    </>
  );
};

const Reduce: React.FC<{ s: S<'reduce'> }> = ({ s }) => {
  const box: Box = { x: 0, y: 0, w: W, h: 760 };
  const m = mapper(box, DISC, 165);
  const c = { x: m.X(DISC.x), y: m.Y(DISC.y) };
  const r = DISC.R * m.s;
  const arc = arcPoints(DISC, DISC.R, 215, 180).map((p) => ({ x: m.X(p.x), y: m.Y(p.y) }));
  const tx = m.X(DISC.x - DISC.R);
  const ty = m.Y(DISC.y);
  const up = ty - (ty - box.y) * s.line;
  const down = ty + (box.y + box.h - ty) * s.line;
  return (
    <>
      <Grid box={box} m={m} opacity={1} x0={-1} x1={7} y0={-3} y1={3} />
      <rect x={tx} y={box.y} width={W - tx} height={box.h} fill={alpha(C.muted, 0.13)} opacity={s.shade} />
      <GhostCircle c={c} r={r} />
      {LANDINGS[0].map((p, i) => (
        <Spark key={i} p={{ x: m.X(p.x), y: m.Y(p.y) }} appear={s.sparks[i].appear} glow={s.sparks[i].glow} size={0.85} />
      ))}
      <Glow d={path(partial(arc, s.arc))} w={10} opacity={1 - s.arcFade} />
      {s.line > 0 && <Glow d={`M${tx} ${up} L${tx} ${down}`} w={12} />}
      <Pen p={s.line > 0 ? { x: tx, y: up } : (partial(arc, s.arc).at(-1) ?? arc[0])} opacity={s.arc > 0 ? 1 - s.arcFade : 0} />
      <Txt x={tx + 22} y={58} size={40} mono color={C.accentText} weight={700} opacity={s.line}>
        x = 2
      </Txt>
      <Pill x={tx - 24} y={ty - 6} anchor="end" text="right place ✓" size={34} opacity={s.place} scale={0.85 + 0.15 * s.place} />
      <Pill x={W - 100} y={m.Y(-1.75)} anchor="end" text="wrong shape ✗" size={34} color={C.text} opacity={s.shape} scale={0.85 + 0.15 * s.shape} />
      <Code box={{ x: 30, y: 790, w: 900, h: 270 }} lines={CODE.reduce} typed={s.code} size={48} title="the model wrote" />
    </>
  );
};

/** Wraps a short label into at most two lines near its middle. */
const wrap2 = (label: string, max = 19): string[] => {
  if (label.length <= max) return [label];
  const words = label.split(' ');
  let best: string[] = [label];
  let bestDiff = Infinity;
  for (let k = 1; k < words.length; k++) {
    const a = words.slice(0, k).join(' ');
    const b = words.slice(k).join(' ');
    const diff = Math.max(a.length, b.length);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = [a, b];
    }
  }
  return best;
};

const Interventions: React.FC<{ s: S<'interventions'> }> = ({ s }) => {
  const cw = 455;
  const ch = 250;
  return (
    <>
      {FIXES.map((f, i) => {
        const x = (i % 2) * (cw + 50);
        const y = Math.floor(i / 2) * (ch + 30);
        const a = s.cards[i];
        if (a <= 0) return null;
        // Drawings kept left of the platform's action rail (frame x > 940 from y 840).
        const cc = { x: x + cw - 135, y: y + 150 };
        const r = 62;
        const sparks = f.kind === 'square'
          ? [-0.7, -0.35, 0, 0.35, 0.7].map((v) => ({ x: cc.x - r, y: cc.y + v * r }))
          : LANDINGS[0].filter((_, k) => k % 3 === 0).map((p) => ({ x: cc.x + (p.x - DISC.x) * r, y: cc.y - (p.y - DISC.y) * r }));
        const pen = s.pens[i];
        let attempt: Pt[] = [];
        if (f.kind === 'square') {
          attempt = arcPoints({ x: 0, y: 0 }, 1, 180, 540, 6).map((p) => ({ x: cc.x + p.x * r, y: cc.y - p.y * r }));
        } else if (f.kind === 'band') {
          attempt = [
            { x: cc.x - r * 1.2, y: cc.y - r * 0.15 },
            { x: cc.x + r * 1.2, y: cc.y - r * 0.15 },
          ];
        } else if (i % 3 === 2 || i === 5) {
          attempt = [
            { x: cc.x - r, y: cc.y - r * 1.3 },
            { x: cc.x - r, y: cc.y + r * 1.3 },
          ];
        } else {
          attempt = arcPoints({ x: 0, y: 0 }, 1, 180, 180 + 170 + 30 * (i % 3), 6).map((p) => ({ x: cc.x + p.x * r, y: cc.y - p.y * r }));
        }
        const lines = wrap2(f.label);
        const stamp = s.stamps[i];
        const counted = f.kind !== 'band';
        return (
          <g key={i} opacity={a} transform={`translate(0 ${(1 - a) * 24})`}>
            <rect x={x} y={y} width={cw} height={ch} rx={22} fill={alpha(C.card, 0.94)} stroke={alpha(C.muted, 0.2)} strokeWidth={2} />
            {lines.map((l, k) => (
              <Txt key={k} x={x + 22} y={y + 46 + k * 36} size={31} weight={600}>
                {l}
              </Txt>
            ))}
            {f.kind === 'square' ? (
              <rect x={cc.x - r} y={cc.y - r} width={2 * r} height={2 * r} fill="none" stroke={GHOST} strokeWidth={4} strokeDasharray="12 10" />
            ) : f.kind === 'band' ? (
              <g stroke={GHOST} strokeWidth={4} strokeDasharray="12 10">
                <line x1={cc.x - r * 1.3} y1={cc.y - r * 0.55} x2={cc.x + r * 1.3} y2={cc.y - r * 0.55} />
                <line x1={cc.x - r * 1.3} y1={cc.y + r * 0.55} x2={cc.x + r * 1.3} y2={cc.y + r * 0.55} />
              </g>
            ) : (
              <circle cx={cc.x} cy={cc.y} r={r} fill="none" stroke={GHOST} strokeWidth={4} strokeDasharray="12 10" />
            )}
            {sparks.map((p, k) => (
              <circle key={k} cx={p.x} cy={p.y} r={6} fill="#ffffff" opacity={0.9} />
            ))}
            {pen > 0 && <Glow d={path(partial(attempt, pen))} w={6} opacity={counted ? 1 : 0.5} />}
            {stamp > 0 && (
              <g
                opacity={stamp}
                transform={`translate(${x + 30} ${y + ch - 52}) rotate(-6) scale(${1.6 - 0.6 * stamp})`}
              >
                <rect
                  x={0}
                  y={-30}
                  width={counted ? f.stamp.length * 30 + 30 : 210}
                  height={62}
                  rx={10}
                  fill={alpha(C.bg0, 0.85)}
                  stroke={counted ? C.text : C.muted}
                  strokeWidth={4}
                />
                <text
                  x={(counted ? f.stamp.length * 30 + 30 : 210) / 2}
                  y={counted ? 16 : 11}
                  fontSize={counted ? 48 : 32}
                  fontWeight={800}
                  fill={counted ? C.text : C.muted}
                  textAnchor="middle"
                  fontFamily={fontFamily}
                >
                  {f.stamp}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </>
  );
};

const Dose: React.FC<{ s: S<'dose'> }> = ({ s }) => {
  const box: Box = { x: 0, y: 0, w: W, h: 600 };
  const m = mapper(box, DISC, 205);
  const c = { x: m.X(DISC.x), y: m.Y(DISC.y) };
  const r = DISC.R * m.s;
  const tx = m.X(DISC.x - DISC.R);
  // Each dose fades out as the next comes in.
  const vis = (d: number) => s.steps[d] * (1 - (s.steps[d + 1] ?? 0));
  const value = LSQ_TOTALS[s.k];
  return (
    <>
      <Grid box={box} m={m} opacity={0.8} x0={0} x1={6} y0={-2} y1={2} />
      <GhostCircle c={c} r={r} />
      {[0, 1, 2].map((d) =>
        vis(d) > 0 ? (
          <g key={d} opacity={vis(d)}>
            {LANDINGS[d].map((p, i) => (
              <Spark key={i} p={{ x: m.X(p.x), y: m.Y(p.y) }} appear={s.sparks[d][i].appear} glow={s.sparks[d][i].glow} size={0.8} />
            ))}
            {/* The model: the same straight wall at every dose. */}
            {s.wall[d] > 0 && (
              <line
                x1={tx}
                y1={m.Y(0) - (m.Y(0) - box.y) * s.wall[d]}
                x2={tx}
                y2={m.Y(0) + (box.y + box.h - m.Y(0)) * s.wall[d]}
                stroke={C.text}
                strokeWidth={7}
                strokeLinecap="round"
                opacity={0.75}
              />
            )}
            {/* Least squares: a thin indigo ring fitted to this dose's sparks. */}
            {s.ring[d] > 0 && (
              <path
                d={path(partial(arcPoints({ x: FITS[d][0], y: FITS[d][1] }, FITS[d][2], 180, 540).map((p) => ({ x: m.X(p.x), y: m.Y(p.y) })), s.ring[d]))}
                fill="none"
                stroke={C.accentText}
                strokeWidth={d === 2 ? 6 + 4 * s.lock : 6}
                opacity={0.95}
              />
            )}
          </g>
        ) : null,
      )}
      {s.lock > 0 && (
        <circle cx={m.X(FITS[2][0])} cy={m.Y(FITS[2][1])} r={FITS[2][2] * m.s} fill="none" stroke={C.accent} strokeWidth={26} opacity={0.4 * s.lock} filter="url(#rf-blur)" />
      )}
      <Txt x={tx - 16} y={48} size={30} color={C.muted} anchor="end" opacity={s.tickers}>
        model
      </Txt>
      <Txt x={6} y={660} size={32} color={C.muted} weight={500} opacity={s.tickers}>
        arc covered
      </Txt>
      {ARCS_DEG.map((a, i) => {
        const on = i === s.k && s.steps[i] > 0;
        return <Pill key={a} x={330 + i * 225} y={650} text={a} size={40} color={on ? C.accentText : alpha(C.muted, 0.7)} opacity={s.tickers} scale={on ? 1.08 : 0.92} />;
      })}
      <g opacity={s.tickers}>
        <rect x={0} y={730} width={W} height={150} rx={24} fill={alpha(C.card, 0.9)} stroke={alpha(C.accentText, 0.5)} strokeWidth={3} />
        <Txt x={34} y={822} size={44} weight={600}>
          Least squares
        </Txt>
        <text x={W - 110} y={838} textAnchor="end" fontFamily={fontFamily} fontWeight={800}>
          <tspan fontSize={92} fill="url(#rf-acc)">
            {value}
          </tspan>
          <tspan fontSize={60} fill={C.muted}>
            /20
          </tspan>
        </text>
        <rect x={0} y={905} width={W} height={150} rx={24} fill={alpha(C.card, 0.9)} stroke={alpha(C.text, 0.2 + 0.6 * s.model)} strokeWidth={3 + 3 * s.model} />
        <Txt x={34} y={997} size={44} weight={600}>
          The model
        </Txt>
        <text x={W - 110} y={1013} textAnchor="end" fontFamily={fontFamily} fontWeight={800}>
          <tspan fontSize={92} fill={C.text}>
            0
          </tspan>
          <tspan fontSize={60} fill={C.muted}>
            /20
          </tspan>
        </text>
      </g>
    </>
  );
};

const PinMode: React.FC<{ s: S<'pin'> }> = ({ s }) => {
  const box: Box = { x: 0, y: 0, w: W, h: 700 };
  const m = mapper(box, DISC, 230);
  const c = { x: m.X(DISC.x), y: m.Y(DISC.y) };
  const r = DISC.R * m.s;
  const ring = arcPoints(DISC, DISC.R, 180, 540).map((p) => ({ x: m.X(p.x), y: m.Y(p.y) }));
  const drawn = partial(ring, s.ring);
  const pinY = c.y - 260 * (1 - s.drop) - 240 * s.lift;
  const pinO = Math.min(s.drop * 3, 1) * (1 - s.lift);
  return (
    <>
      <Grid box={box} m={m} opacity={0.8} x0={0} x1={6} y0={-2} y1={2} />
      <GhostCircle c={c} r={r} />
      {LANDINGS[0].map((p, i) => (
        <Spark key={i} p={{ x: m.X(p.x), y: m.Y(p.y) }} appear={s.sparks[i].appear} glow={s.sparks[i].glow} size={0.8} />
      ))}
      {s.ring > 0 && <Glow d={path(drawn)} w={11} opacity={1 - s.dissolve} />}
      {s.ring > 0 && s.ring < 1 && <Pen p={drawn.at(-1) ?? ring[0]} opacity={1 - s.dissolve} />}
      {pinO > 0 && (
        <g opacity={pinO}>
          <line x1={c.x} y1={pinY} x2={c.x} y2={pinY - 70} stroke={C.text} strokeWidth={7} strokeLinecap="round" />
          <circle cx={c.x} cy={pinY - 86} r={24} fill="url(#rf-acc)" stroke={C.text} strokeWidth={4} />
          <circle cx={c.x} cy={pinY} r={9} fill={C.text} />
        </g>
      )}
      <Pill x={c.x} y={c.y + r + 52} text="centre given" size={36} opacity={s.given} />
      <Pill x={c.x} y={c.y - r - 50} text="shape only" size={36} color={C.text} opacity={s.shapeOnly} />
      <Txt x={W / 2} y={770} size={30} mono color={C.accentText} anchor="middle" weight={500} opacity={s.comment}>
        {CODE.radius}
      </Txt>
      <text x={W / 2} y={960} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} opacity={s.yes}>
        <tspan fontSize={160} fill="url(#rf-acc)">
          20
        </tspan>
        <tspan fontSize={110} fill={C.muted}>
          {' / 20'}
        </tspan>
      </text>
      <text x={W / 2} y={960} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} opacity={s.no}>
        <tspan fontSize={160} fill={C.text}>
          0
        </tspan>
        <tspan fontSize={110} fill={C.muted}>
          {' / 20'}
        </tspan>
      </text>
    </>
  );
};

const Split: React.FC<{ s: S<'split'> }> = ({ s }) => {
  const top: Box = { x: 0, y: 40, w: W, h: 380 };
  const c = { x: W / 2, y: 900 };
  const R = 150;
  const mk = (a0: number, a1: number) => arcPoints({ x: 0, y: 0 }, 1, a0, a1).map((p) => ({ x: c.x + p.x * R, y: c.y - p.y * R }));
  const open = mk(180, 395);
  const rest = partial(mk(395, 540), s.close);
  const card = { x: 40 + (1 - s.card) * 500, y: 590, w: 880, h: 140 };
  return (
    <g opacity={s.appear}>
      <Txt x={6} y={46} size={40} color={C.muted}>
        1D rule
      </Txt>
      <Rail box={top} railY={top.y + 240} cartX={8} heal={1} glow={1} pen={false} />
      <text x={W / 2} y={530} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={84} fill="url(#rf-acc)" opacity={s.phrase}>
        one dimension
      </text>
      <Txt x={6} y={790} size={40} color={C.muted} opacity={1 - s.card}>
        2D rule
      </Txt>
      <circle cx={c.x} cy={c.y} r={R} fill={alpha(C.accent, 0.05 + 0.1 * s.close)} stroke={GHOST} strokeWidth={5} strokeDasharray="16 14" />
      <Glow d={path(open)} w={10} />
      {s.close > 0 && <Glow d={path(rest)} w={10} />}
      {s.close >= 1 && <Glow d={path(mk(180, 540))} w={14} opacity={0.6} />}
      {s.close > 0 && s.close < 1 && <Pen p={rest.at(-1) ?? open.at(-1)!} />}
      {s.card > 0 && (
        <Code
          box={card}
          lines={CODE.spec}
          typed={[Math.round(CODE.spec[0].length * Math.min(1, s.spec * 2)), Math.round(CODE.spec[1].length * Math.max(0, s.spec * 2 - 1))]}
          size={38}
          opacity={s.card}
        />
      )}
    </g>
  );
};

export const RuleField: React.FC<AnimProps & RuleFieldProps> = ({ t, beats, dur, vertical, mode }) => {
  const s = frameState({ mode }, t, beats, dur);
  let body: React.ReactNode;
  switch (s.mode) {
    case 'hook':
      body = <Hook s={s} />;
      break;
    case 'setup':
      body = <Setup s={s} />;
      break;
    case 'heal':
      body = <Heal s={s} />;
      break;
    case 'tally1':
      body = <Tally1 s={s} />;
      break;
    case 'plane':
      body = <Plane s={s} />;
      break;
    case 'tally2':
      body = <Tally2 s={s} />;
      break;
    case 'reduce':
      body = <Reduce s={s} />;
      break;
    case 'interventions':
      body = <Interventions s={s} />;
      break;
    case 'dose':
      body = <Dose s={s} />;
      break;
    case 'pin':
      body = <PinMode s={s} />;
      break;
    default:
      body = <Split s={s} />;
  }
  return (
    <Stage vertical={vertical} fill>
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ overflow: 'visible' }}>
        <Defs />
        {body}
      </svg>
    </Stage>
  );
};
