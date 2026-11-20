// The fine-tune that failed without telling you: the official recipe, a flat "guessing" line, four
// answer buttons lit the same, and the banner "Training complete" with a tick. See FlatLine.state.ts.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { Robot, glow } from './office.tsx';
import { AnswerButton, Banner, ShopCanvas } from './shop.tsx';
import { AXES, BANNER_DONE, BANNER_RUNNING, GUESSING, LETTERS, RECIPE_TITLE, STACKS, frameState, type FlatLineProps } from './FlatLine.state.ts';

export { frameState };
export type { FlatLineProps };

/** Landscape layout (the vertical cut reuses it, scaled into its stage). */
const L = {
  banner: { x: 560, y: 150, w: 800, h: 84 },
  recipe: { x: 170, y: 280, w: 400, h: 500 },
  floor: 790,
  robot: { x: 735, s: 0.7 },
  screen: { x: 900, y: 280, w: 300, h: 150 },
  buttons: { x: 900, y: 452, w: 300, h: 70, gap: 14 },
  chart: { x: 1300, y: 290, w: 440, h: 420 },
};

/** A stack of sheets (seen from the side), its base centred at (x, base). */
const Stack: React.FC<{ x: number; base: number; w: number; h: number; color: string }> = ({ x, base, w, h, color }) => {
  if (h < 4) return null;
  const n = Math.max(1, Math.round(h / 14));
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x={x - w / 2 + ((i * 7) % 3) * 3 - 3} y={base - (i + 1) * (h / n)} width={w} height={Math.max(4, h / n - 3)} rx={2} fill={i % 2 ? color : alpha(color, 0.75)} />
      ))}
    </g>
  );
};

export const FlatLine: React.FC<AnimProps & FlatLineProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const R = L.recipe;
  const Ch = L.chart;
  const guessY = Ch.y + Ch.h * 0.72;
  // the flat line: a little noise around the guessing level, drawn left to right
  const pts = Array.from({ length: 41 }, (_, i) => {
    const x = Ch.x + 20 + ((Ch.w - 40) * i) / 40;
    const y = guessY + 7 * Math.sin(i * 2.1) * Math.cos(i * 0.7);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const shown = pts.slice(0, Math.max(1, Math.round(41 * s.draw)));
  const lineColor = s.verdict > 0.5 ? C.marker : C.accentText;
  const head = shown[shown.length - 1].split(',').map(Number);
  const robotY = L.floor - L.robot.s * 454 - 6 * s.bob;
  const Sc = L.screen;
  return (
    <AbsoluteFill style={{ fontFamily }}>
      <ShopCanvas vertical={p.vertical}>
        <rect x={180} y={L.floor} width={1560} height={5} rx={2} fill={alpha(C.muted, 0.3)} />

        {/* the recipe card: what the recipe was made for, against the data I had */}
        <g opacity={s.recipe} style={glow(C.warm, 0.5 * s.recipeLit)}>
          <rect x={R.x} y={R.y} width={R.w} height={R.h} rx={22} fill={C.card} stroke={alpha(C.warm, 0.35 + 0.65 * s.recipeLit)} strokeWidth={4} />
          <text x={R.x + R.w / 2} y={R.y + 52} textAnchor="middle" fontSize={30} fontWeight={800} fill={C.text}>
            {RECIPE_TITLE}
          </text>
          <line x1={R.x + 24} x2={R.x + R.w - 24} y1={R.y + 76} y2={R.y + 76} stroke={alpha(C.warm, 0.5)} strokeWidth={3} />
          <Stack x={R.x + R.w * 0.3} base={R.y + R.h - 70} w={110} h={320 * s.stacks[0]} color={C.muted} />
          <Stack x={R.x + R.w * 0.72} base={R.y + R.h - 70} w={110} h={56 * s.stacks[1]} color={C.warm} />
          <text x={R.x + R.w * 0.3} y={R.y + R.h - 26} textAnchor="middle" fontSize={30} fontWeight={700} fill={C.muted}>
            {STACKS[0]}
          </text>
          <text x={R.x + R.w * 0.72} y={R.y + R.h - 26} textAnchor="middle" fontSize={30} fontWeight={700} fill={C.warm}>
            {STACKS[1]}
          </text>
        </g>

        {/* the robot before the quiz: a screen of moving dots, four answers */}
        <Robot x={L.robot.x} y={robotY} s={L.robot.s} blink={s.blink} />
        {s.puzzled > 0 && (
          <text x={L.robot.x + 10} y={robotY - 40 - 20 * s.puzzled} textAnchor="middle" fontSize={84} fontWeight={800} fill={C.warm} opacity={s.puzzled}>
            ?
          </text>
        )}
        <rect x={Sc.x} y={Sc.y} width={Sc.w} height={Sc.h} rx={16} fill={C.bg1} stroke={alpha(C.accentText, 0.6)} strokeWidth={4} />
        {Array.from({ length: 7 }, (_, i) => {
          const ph = s.tm * 2.4 + i * 0.9;
          const cx = Sc.x + 50 + i * 33 + 10 * Math.sin(ph);
          const cy = Sc.y + Sc.h / 2 + 34 * Math.sin(ph * 0.8 + i);
          return <circle key={i} cx={cx} cy={cy} r={9} fill={C.ok} />;
        })}
        {LETTERS.map((letter, i) => (
          <AnswerButton key={letter} x={L.buttons.x} y={L.buttons.y + i * (L.buttons.h + L.buttons.gap)} w={L.buttons.w} h={L.buttons.h} letter={letter} lit={s.buttons[i]} />
        ))}

        {/* the chart: right answers over training, flat on the guessing level */}
        <line x1={Ch.x} y1={Ch.y} x2={Ch.x} y2={Ch.y + Ch.h} stroke={alpha(C.muted, 0.7)} strokeWidth={4} />
        <line x1={Ch.x} y1={Ch.y + Ch.h} x2={Ch.x + Ch.w} y2={Ch.y + Ch.h} stroke={alpha(C.muted, 0.7)} strokeWidth={4} />
        <text x={Ch.x + 14} y={Ch.y - 18} fontSize={30} fontWeight={700} fill={C.muted}>
          {AXES.y}
        </text>
        <text x={Ch.x + Ch.w} y={Ch.y + Ch.h + 44} textAnchor="end" fontSize={30} fontWeight={700} fill={C.muted}>
          {AXES.x}
        </text>
        <line x1={Ch.x} x2={Ch.x + Ch.w} y1={guessY} y2={guessY} stroke={alpha(C.muted, 0.35)} strokeWidth={3} strokeDasharray="10 10" />
        <polyline points={shown.join(' ')} fill="none" stroke={lineColor} strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" style={glow(lineColor, 0.5 * s.verdict)} />
        <circle cx={head[0]} cy={head[1]} r={9} fill={lineColor} />
        {s.verdict > 0 && (
          <g opacity={s.verdict} transform={`translate(${Ch.x + Ch.w / 2} ${guessY - 70}) scale(${1.3 - 0.3 * s.verdict})`} style={glow(C.marker, 0.6)}>
            <rect x={-100} y={-34} width={200} height={60} rx={30} fill={alpha(C.marker, 0.25)} stroke={C.marker} strokeWidth={3} />
            <text y={9} textAnchor="middle" fontSize={34} fontWeight={800} fill={C.text}>
              {GUESSING}
            </text>
          </g>
        )}

        <Banner x={L.banner.x} y={L.banner.y} w={L.banner.w} h={L.banner.h} fill={s.done > 0 ? 1 : s.fill} text={s.done > 0.3 ? BANNER_DONE : BANNER_RUNNING} done={s.done} size={42} />
      </ShopCanvas>
    </AbsoluteFill>
  );
};
