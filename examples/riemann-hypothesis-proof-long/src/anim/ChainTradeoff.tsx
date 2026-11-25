import React from 'react';
import { staticFile } from 'remotion';
import { C, alpha } from '../brand.ts';
import type { AnimProps } from './types.ts';
import { Canvas } from './Canvas.tsx';
import { Arrow, Board, CHALK, CHALK_DIM, ChalkDefs, ChalkText, Fit, wordCues } from './PrimeBox.tsx';
import { LINKS, M_BEST, M_MAX, M_MIN, V_MAX, costs, frameState, loses, total, type ChainTradeoffProps } from './ChainTradeoff.state.ts';

export { frameState };
export type { ChainTradeoffProps };

const F = 'url(#ct-chalk)';
/** The credit scene's own filter id: the chain and credit scenes are mounted together (premount),
 *  and two filters with one id make Chrome resolve some elements to the hidden scene's filter. */
const F_CREDIT = 'url(#ctc-chalk)';

// Graph geometry (landscape pixels). The chain lies along the m axis.
const AX = { x0: 400, x1: 1480, y0: 740, top: 275 };
const mx = (m: number) => AX.x0 + (m / 10.5) * (AX.x1 - AX.x0);
const vy = (v: number) => AX.y0 - (Math.min(v, V_MAX + 0.6) / V_MAX) * (AX.y0 - AX.top);

const pathOf = (f: (m: number) => number): string => {
  // Start where the curve enters the plot, so nothing is clipped flat at the top.
  let m0 = M_MIN;
  while (f(m0) > V_MAX && m0 < M_MAX) m0 += 0.01;
  const pts: string[] = [];
  for (let i = 0; i <= 90; i++) {
    const m = m0 + ((M_MAX - m0) * i) / 90;
    pts.push(`${i === 0 ? 'M' : 'L'} ${mx(m).toFixed(1)} ${vy(f(m)).toFixed(1)}`);
  }
  return pts.join(' ');
};
const FALL = pathOf(loses);
const RISE = pathOf(costs);
const TOTAL = pathOf(total);

const Curve: React.FC<{ d: string; p: number; color: string; width?: number; opacity?: number }> = ({ d, p, color, width = 7, opacity = 1 }) =>
  p <= 0 ? null : (
    <path d={d} pathLength={1} stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 1" strokeDashoffset={1 - p} opacity={opacity} />
  );

/** A heavy toolbox, in chalk. */
const Toolbox: React.FC<{ x: number; y: number; o: number }> = ({ x, y, o }) => (
  <g transform={`translate(${x} ${y})`} opacity={o} stroke={CHALK} strokeWidth={6} fill="none" strokeLinejoin="round" strokeLinecap="round">
    <path d="M -80 -112 q 0 -34 34 -34 h 92 q 34 0 34 34" />
    <rect x={-150} y={-112} width={300} height={170} rx={14} fill={alpha(C.accent, 0.18)} />
    <line x1={-150} y1={-56} x2={150} y2={-56} />
    <rect x={-26} y={-72} width={52} height={32} rx={6} fill={alpha(C.text, 0.25)} />
    {/* A wrench and a hammer poking out: heavy machinery. */}
    <path d="M -110 -112 L -70 -190 M -86 -196 a 18 18 0 1 0 32 14" />
    <path d="M 70 -112 L 100 -200 M 72 -206 h 60 v 22 h -60 z" fill={alpha(C.text, 0.15)} />
    <circle cx={-120} cy={30} r={6} fill={CHALK} />
    <circle cx={120} cy={30} r={6} fill={CHALK} />
  </g>
);

/** A pencil, in chalk. */
const Pencil: React.FC<{ x: number; y: number; o: number; T: number }> = ({ x, y, o, T }) => (
  <g transform={`translate(${x} ${y}) rotate(${-32 + 3 * Math.sin(T * 1.4)})`} opacity={o} stroke={CHALK} strokeWidth={6} fill="none" strokeLinejoin="round">
    <rect x={-150} y={-24} width={230} height={48} rx={6} fill={alpha(C.accentText, 0.25)} />
    <rect x={-182} y={-24} width={34} height={48} rx={8} fill={alpha(C.accent2, 0.35)} />
    <path d="M 80 -24 L 150 0 L 80 24 Z" fill={alpha(C.text, 0.12)} />
    <path d="M 128 -8 L 150 0 L 128 8 Z" fill={CHALK} />
  </g>
);

/** The simpler world's curve with its points. */
// y² = x³ − x + 1, the kind of curve the simpler-world twin is about, in board pixels.
const EC = { cx: 960, cy: 490, sx: 150, sy: 75, x0: 0.3, root: -1.3247, x1: 1.8 };
const ecPt = (x: number, y: number): [number, number] => [EC.cx + EC.sx * (x - EC.x0), EC.cy - EC.sy * y];
const ecY = (x: number) => Math.sqrt(Math.max(0, x * x * x - x + 1));
const EC_PATH = (() => {
  const pts: string[] = [];
  const n = 60;
  // Lower branch from the right end to the root, then the upper branch back out.
  for (let i = 0; i <= n; i++) {
    const x = EC.x1 - ((EC.x1 - EC.root) * (1 - (1 - i / n) ** 2));
    const [px, py] = ecPt(x, -ecY(x));
    pts.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
  }
  for (let i = 1; i <= n; i++) {
    const x = EC.root + (EC.x1 - EC.root) * (i / n) ** 2;
    const [px, py] = ecPt(x, ecY(x));
    pts.push(`L ${px.toFixed(1)} ${py.toFixed(1)}`);
  }
  return pts.join(' ');
})();

const TwinCurve: React.FC<{ p: number; T: number }> = ({ p, T }) => {
  const d = EC_PATH;
  const pts = [
    ecPt(1.5, -ecY(1.5)),
    ecPt(1, -1),
    ecPt(0, -1),
    ecPt(-1, 1),
    ecPt(0.5, ecY(0.5)),
    ecPt(1.5, ecY(1.5)),
  ];
  return (
    <g>
      <path d={d} pathLength={1} stroke={CHALK} strokeWidth={6} fill="none" strokeLinecap="round" strokeDasharray="1 1" strokeDashoffset={1 - p} />
      {pts.map(([x, y], i) => {
        const on = Math.max(0, Math.min(1, p * 7 - i - 0.5));
        return <circle key={i} cx={x} cy={y} r={(11 + 2 * Math.sin(T * 2 + i)) * on} fill={C.accentText} opacity={on} />;
      })}
    </g>
  );
};

/** One chain link, drawn to `p`; even links face us, odd ones are seen edge-on. */
const Link: React.FC<{ i: number; p: number; y: number }> = ({ i, p, y }) => {
  if (p <= 0) return null;
  const cx = AX.x0 + 60 + i * 120;
  const even = i % 2 === 0;
  const w = 150;
  const h = even ? 64 : 22;
  return (
    <rect
      x={cx - w / 2}
      y={y - h / 2}
      width={w}
      height={h}
      rx={h / 2}
      pathLength={1}
      fill="none"
      stroke={even ? C.accentText : CHALK}
      strokeWidth={even ? 8 : 9}
      strokeDasharray="1 1"
      strokeDashoffset={1 - p}
    />
  );
};

/** A small box over link i: more blocks, packed tighter, with each link. */
const MiniBox: React.FC<{ i: number; o: number }> = ({ i, o }) => {
  if (o <= 0) return null;
  const cx = AX.x0 + 60 + i * 120;
  const top = 560;
  const h = 120;
  const w = 84;
  const n = 2 + i * 2;
  const fill = 0.3 + (0.68 * i) / (LINKS - 1);
  const bh = (h * fill) / n;
  return (
    <g opacity={o}>
      <path d={`M ${cx - w / 2} ${top} V ${top + h} H ${cx + w / 2} V ${top}`} stroke={CHALK} strokeWidth={4} fill="none" />
      <line x1={cx - w / 2 - 8} y1={top} x2={cx + w / 2 + 8} y2={top} stroke={CHALK} strokeWidth={5} strokeLinecap="round" />
      {Array.from({ length: n }, (_, k) => (
        <rect key={k} x={cx - w / 2 + 6} y={top + h - (k + 1) * bh + 1} width={w - 12} height={Math.max(1.5, bh - 2)} rx={2} fill={alpha(k % 3 === 0 ? C.accentText : k % 3 === 1 ? C.accent2 : C.text, 0.7)} />
      ))}
    </g>
  );
};

const RobotCredit: React.FC<{ s: Extract<ReturnType<typeof frameState>, { chain: 0 }> }> = ({ s }) => {
  const T = s.ambient;
  const W = 518 * 0.82;
  const H = 775 * 0.82;
  const x = 290;
  const y = 172 + (1 - s.robot) * 40 + 6 * Math.sin(T * 1.5);
  // Card region in the PNG: x 62-457, y 410-628.
  const cx = x + ((62 + 457) / 2) * 0.82;
  const cy = y + 410 * 0.82;
  return (
    <>
      <ellipse cx={x + W / 2} cy={812} rx={170 - 4 * Math.sin(T * 1.5)} ry={14} fill={alpha('#000000', 0.35)} />
      <image href={staticFile('cast/robot-card.png')} x={x} y={y} width={W} height={H} opacity={s.robot} />
      <g opacity={s.card} transform={`translate(${cx} ${cy})`}>
        <text x={0} y={66} fontSize={38} fontWeight={700} fill={C.bg1} textAnchor="middle">
          chain length
        </text>
        <text x={0} y={158} fontSize={80} fontWeight={800} fill={C.accent} textAnchor="middle">
          √x
        </text>
      </g>
      <g filter={F_CREDIT}>
        <Arrow x1={790} y1={390} x2={690} y2={520} p={s.creditLabel} width={5} color={CHALK_DIM} />
        <ChalkText x={810} y={300} size={48} opacity={s.creditLabel}>
          suggested by Claude,
        </ChalkText>
        <ChalkText x={810} y={362} size={48} opacity={s.creditLabel} fill={CHALK_DIM}>
          as credited in the note
        </ChalkText>
        <ChalkText x={790} y={540} size={76} opacity={s.quote} fill={C.accentText} weight={800}>
          “And yet,
        </ChalkText>
        <ChalkText x={790} y={630} size={76} opacity={s.quote} fill={C.accentText} weight={800}>
          what else could it be?”
        </ChalkText>
        <ChalkText x={810} y={712} size={46} opacity={s.author} fill={CHALK}>
          — Levent Alpöge
        </ChalkText>
      </g>
    </>
  );
};

/** Where the square root comes from: the chain and its trade-off, then the credit. */
export const ChainTradeoff: React.FC<AnimProps & ChainTradeoffProps> = (p) => {
  const credit = p.mode === 'credit';
  const cues = credit
    ? wordCues(p.lang, 'credit', p.beats, { suggestion: [0, 'suggestion'], credited: [0, 'credited'] })
    : wordCues(p.lang, 'chain', p.beats, {
        '1969': [1, '1969'],
        simpler: [1, 'simpler'],
        twin: [1, 'twin'],
        world: [2, 'curves'],
        '1940s': [2, '1940s'],
        derivatives: [3, 'derivatives'],
        whole: [3, 'whole'],
        again: [5, 'again'],
        divisible: [5, 'divisible'],
        blunt: [8, 'blunt'],
        long: [8, 'long'],
        meet: [9, 'meet'],
        root: [9, 'root'],
      });
  const s = frameState({ ...p, cues }, p.t, p.beats, p.dur);
  const T = s.ambient;
  const breathe = 0.5 + 0.5 * Math.sin(T * 1.6);

  if (s.chain === 0) {
    return (
      <>
        <Board vertical={p.vertical} T={T} />
        <Canvas vertical={p.vertical}>
          <ChalkDefs id="ctc" />
          <Fit vertical={p.vertical}>
            <RobotCredit s={s} />
          </Fit>
        </Canvas>
      </>
    );
  }

  // The derivative's flight: from the left onto the 7, then thrown back and down.
  const u = s.deriv;
  let dx = 300;
  let dy = 520;
  let drot = 0;
  if (u < 0.45) {
    const f = u / 0.45;
    dx = 300 + (800 - 300) * f * f;
  } else {
    const v = (u - 0.45) / 0.55;
    dx = 800 - 420 * v;
    dy = 520 - 160 * Math.sin(Math.PI * v * 0.8) + 260 * v * v;
    drot = -70 * v;
  }
  const hit = u > 0.4 && u < 0.6 ? Math.sin(((u - 0.4) / 0.2) * Math.PI) : 0;
  const dOpacity = Math.min(1, u * 8) * (u >= 1 ? 0 : 1 - Math.max(0, (u - 0.85) / 0.15));

  const chainY = AX.y0;
  const bestX = mx(M_BEST);

  return (
    <>
      <Board vertical={p.vertical} T={T} />
      <Canvas vertical={p.vertical}>
        <ChalkDefs id="ct" />
        <Fit vertical={p.vertical}>
          {/* Line 1: the question. */}
          {s.question > 0 && (
            <g opacity={s.question} filter={F} transform={`translate(960 ${480 - 4 * Math.sin(T * 1.3)}) scale(${0.85 + 0.15 * s.question})`}>
              <text x={0} y={80} fontSize={260} fontWeight={800} fill={CHALK} textAnchor="middle">
                √<tspan fill={C.accentText}> ?</tspan>
              </text>
            </g>
          )}

          {/* Lines 2-3: the twin in a simpler world, Weil's toolbox and Stepanov's pencil. */}
          {s.history > 0 && (
            <g opacity={s.history}>
              {/* Small filtered groups, not one: Chrome drops part of a large filtered group when
                  several tabs render at once (the flicker of the first long cut). */}
              <g filter={F}>
              <TwinCurve p={s.curve} T={T} />
              <ChalkText x={960} y={290} size={46} anchor="middle" opacity={s.twin} fill={C.accentText}>
                a twin of the hypothesis
              </ChalkText>
              <ChalkText x={960} y={730} size={44} anchor="middle" opacity={s.world} fill={CHALK_DIM}>
                curves over finite fields
              </ChalkText>
              </g>
              <g filter={F}>
              <Toolbox x={390} y={560 + 3 * Math.sin(T * 1.1)} o={s.weil} />
              <ChalkText x={390} y={690} size={58} anchor="middle" opacity={s.weil} weight={800}>
                1940s · Weil
              </ChalkText>
              <ChalkText x={390} y={748} size={42} anchor="middle" opacity={s.weil} fill={CHALK_DIM}>
                heavy machinery
              </ChalkText>
              </g>
              <g filter={F}>
              <Pencil x={1530} y={500} o={s.stepanov} T={T} />
              <ChalkText x={1530} y={690} size={58} anchor="middle" opacity={s.stepanov} weight={800}>
                1969 · Stepanov
              </ChalkText>
              <ChalkText x={1530} y={748} size={42} anchor="middle" opacity={s.simpler} fill={C.accentText}>
                much simpler proof
              </ChalkText>
              </g>
            </g>
          )}

          {/* Line 4: no derivatives for whole numbers. */}
          {s.seven > 0 && s.derivPanel > 0 && (
            <g opacity={s.derivPanel}>
              <g filter={F}>
              <g transform={`translate(1060 ${600 + 6 * hit}) rotate(${4 * hit})`} opacity={s.seven}>
                <text x={0} y={0} fontSize={300} fontWeight={800} fill={CHALK} textAnchor="middle">
                  7
                </text>
              </g>
              {dOpacity > 0 && (
                <text x={dx} y={dy} fontSize={96} fontWeight={800} fill={C.accentText} textAnchor="middle" opacity={dOpacity} transform={`rotate(${drot} ${dx} ${dy - 30})`}>
                  d/dx
                </text>
              )}
              {hit > 0.05 && (
                <g stroke={C.accent2} strokeWidth={6} strokeLinecap="round" opacity={hit}>
                  <line x1={905} y1={430} x2={870} y2={400} />
                  <line x1={900} y1={500} x2={860} y2={500} />
                  <line x1={905} y1={570} x2={870} y2={600} />
                </g>
              )}
              </g>
              <ChalkText x={960} y={300} size={56} anchor="middle" opacity={s.noDeriv} weight={800} filter={F}>
                no derivatives for whole numbers
              </ChalkText>
            </g>
          )}

          {/* Lines 5-6: the chain, link by link, each link packing the box more. */}
          <g filter={F}>
            <ChalkText x={AX.x0} y={480} size={60} opacity={s.chainLabel * s.icons} weight={800} fill={C.accentText}>
              Alpöge's chain
            </ChalkText>
            <ChalkText x={AX.x1 + 40} y={480} size={46} anchor="end" opacity={s.moreDivisible * s.icons}>
              more divisible →
            </ChalkText>
            {s.links.map((lp, i) => (
              <MiniBox key={`b${i}`} i={i} o={Math.min(1, lp * 2) * s.icons} />
            ))}
            {s.links.map((lp, i) => (
              <Link key={i} i={i} p={lp} y={chainY + 2 * Math.sin(T * 1.5 + i * 0.7)} />
            ))}
          </g>

          {/* Lines 7-11: the trade-off over the chain length. */}
          {s.axes > 0 && (
            <g filter={F}>
              <Arrow x1={AX.x0} y1={AX.y0} x2={AX.x0} y2={AX.top - 5} p={s.axes} width={5} />
              <ChalkText x={AX.x1 + 40} y={808} size={42} anchor="end" opacity={s.axes} fill={CHALK_DIM}>
                chain length m →
              </ChalkText>
              <Curve d={FALL} p={s.fall} color={C.accentText} opacity={0.5 + 0.5 * s.costLabels} />
              <Curve d={RISE} p={s.rise} color={C.accent2} opacity={0.5 + 0.5 * s.costLabels} />
              <Curve d={TOTAL} p={s.total} color={CHALK} width={9} />
              <ChalkText x={700} y={340} size={46} opacity={s.fallLabel * s.costLabels} fill={C.accentText}>
                what a short chain loses
              </ChalkText>
              <ChalkText x={1150} y={600} size={46} opacity={s.riseLabel * s.costLabels} fill={C.accent2}>
                what every link costs
              </ChalkText>
              <ChalkText x={AX.x0 + 28} y={566} size={48} opacity={s.blunt}>
                too short:
              </ChalkText>
              <ChalkText x={AX.x0 + 28} y={624} size={48} opacity={s.blunt}>
                blunt
              </ChalkText>
              <ChalkText x={1740} y={262} size={48} anchor="end" opacity={s.pile}>
                too long: errors pile up
              </ChalkText>
            </g>
          )}
          {s.best > 0 && (
            <g filter={F}>
              <line x1={bestX} y1={vy(total(M_BEST))} x2={bestX} y2={AX.y0} stroke={C.text} strokeWidth={4} strokeDasharray="14 12" opacity={s.best} />
              <circle cx={bestX} cy={vy(total(M_BEST))} r={30 * s.best} fill={alpha(C.accentText, 0.35 * (0.6 + 0.4 * breathe))} />
              <circle cx={bestX} cy={vy(total(M_BEST))} r={13 * s.best} fill={C.text} />
              <circle cx={bestX} cy={vy(loses(M_BEST))} r={11 * s.best} fill={C.accentText} stroke={CHALK} strokeWidth={3} />
            </g>
          )}
          {s.root > 0 && (
            <>
              <rect x={bestX - 120} y={758} width={240} height={68} rx={14} fill={alpha(C.bg1, 0.85 * s.root)} />
              <ChalkText x={bestX} y={812} size={64} anchor="middle" opacity={s.root} weight={800} filter={F}>
                m = <tspan fill={C.accentText}>√x</tspan>
              </ChalkText>
            </>
          )}
          {s.banner > 0 && (
            <g opacity={s.banner}>
              <rect x={360} y={150} width={1200} height={86} rx={22} fill={alpha(C.accentText, 0.22 * (0.7 + 0.3 * breathe))} filter="url(#ct-glow)" />
              <rect x={380} y={156} width={1160} height={74} rx={18} fill={alpha(C.bg1, 0.75)} stroke={alpha(C.accentText, 0.8)} strokeWidth={3} />
              <ChalkText x={960} y={214} size={54} anchor="middle" weight={800} filter={F}>
                <tspan fill={C.accentText}>√x</tspan> = exactly what the hypothesis needs
              </ChalkText>
            </g>
          )}
        </Fit>
      </Canvas>
    </>
  );
};
