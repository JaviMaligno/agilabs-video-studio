import React from 'react';
import { staticFile } from 'remotion';
import { C, alpha } from '../brand.ts';
import type { AnimProps } from './types.ts';
import type { Lang } from '../types.ts';
import { WORDS } from '../audio.generated.ts';
import { Canvas } from './Canvas.tsx';
import { fitInto, stageBox } from './canvas.ts';
import {
  BOUNCER,
  BOX_PRIMES,
  DIVISIBLE_PRIMES,
  FACTORIAL_PRIMES,
  SENTENCE,
  frameState,
  type PrimeBoxProps,
} from './PrimeBox.state.ts';

export { frameState };
export type { PrimeBoxProps };

// ---------------------------------------------------------------------------------------------
// Shared blackboard pieces (also used by ChainTradeoff).

export const CHALK = alpha(C.text, 0.93);
export const CHALK_DIM = alpha(C.text, 0.55);

/** Chalk filters: a rough edge for strokes and text, and a soft glow. Ids are prefixed per use. */
export const ChalkDefs: React.FC<{ id: string }> = ({ id }) => (
  <defs>
    <filter id={`${id}-chalk`} filterUnits="userSpaceOnUse" x={-300} y={-300} width={2520} height={1680}>
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" xChannelSelector="R" yChannelSelector="G" result="d" />
      <feComponentTransfer in="n" result="grain">
        <feFuncA type="linear" slope="3.2" intercept="-0.45" />
      </feComponentTransfer>
      <feComposite in="d" in2="grain" operator="in" result="g" />
      <feMerge>
        <feMergeNode in="g" />
        <feMergeNode in="g" />
        <feMergeNode in="g" />
      </feMerge>
    </filter>
    <filter id={`${id}-glow`} x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="14" />
    </filter>
  </defs>
);

/** The empty slate, full-bleed, plus drifting chalk dust (the ambient motion). */
export const Board: React.FC<{ vertical: boolean; T: number }> = ({ vertical, T }) => {
  const w = vertical ? 1080 : 1920;
  const h = vertical ? 1920 : 1080;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', left: 0, top: 0 }}>
      <image href={staticFile('bg/bg-board.jpg')} x={0} y={0} width={w} height={h} preserveAspectRatio="xMidYMid slice" />
      {Array.from({ length: 16 }, (_, i) => {
        const hx = (Math.sin(i * 91.7 + 3.1) * 43758.5) % 1;
        const hy = (Math.sin(i * 37.3 + 1.7) * 12543.1) % 1;
        const x = ((Math.abs(hx) * w + T * (6 + (i % 5) * 3)) % (w + 40)) - 20;
        const y = Math.abs(hy) * h + 14 * Math.sin(T * 0.4 + i);
        return <circle key={i} cx={x} cy={y} r={1.6 + (i % 3)} fill={alpha(C.text, 0.07 + 0.05 * Math.sin(T * 0.7 + i * 1.3) ** 2)} />;
      })}
    </svg>
  );
};

/**
 * Scene second at which the word starting with `match` is spoken in line `line` of scene
 * `scene` (from the TTS word timings), or undefined before TTS or when the word is not found.
 */
export const wordCue = (lang: Lang, scene: string, beats: number[], line: number, match: string): number | undefined => {
  const words = WORDS[lang]?.[`${scene}-${String(line + 1).padStart(2, '0')}`];
  const b = beats[line];
  if (!words || b === undefined || !Number.isFinite(b)) return undefined;
  const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9√]/g, '');
  const w = words.find(([x]) => norm(x).startsWith(match));
  return w ? b + w[1] : undefined;
};

/** Cues for a scene: `{ name: [line, word] }` resolved to scene seconds (missing ones dropped). */
export const wordCues = (lang: Lang, scene: string, beats: number[], spec: Record<string, [number, string]>): Record<string, number> => {
  const out: Record<string, number> = {};
  for (const [name, [line, match]] of Object.entries(spec)) {
    const c = wordCue(lang, scene, beats, line, match);
    if (c !== undefined) out[name] = c;
  }
  return out;
};

/** Landscape layout drawn as is; in the vertical frame it is fitted into the vertical stage. */
export const Fit: React.FC<{ vertical: boolean; children: React.ReactNode }> = ({ vertical, children }) =>
  vertical ? <g transform={fitInto({ x: 0, y: 0, w: 1920, h: 1080 }, stageBox(true)).transform}>{children}</g> : <>{children}</>;

export const ChalkText: React.FC<{
  x: number;
  y: number;
  size: number;
  children: React.ReactNode;
  fill?: string;
  anchor?: 'start' | 'middle' | 'end';
  weight?: number;
  opacity?: number;
  filter?: string;
}> = ({ x, y, size, children, fill = CHALK, anchor = 'start', weight = 700, opacity = 1, filter }) =>
  opacity <= 0 ? null : (
    <text x={x} y={y} fontSize={size} fontWeight={weight} fill={fill} textAnchor={anchor} opacity={Math.min(1, opacity)} filter={filter}>
      {children}
    </text>
  );

/** A chalk arrow from (x1,y1) to (x2,y2), drawn to `p` of its length. */
export const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; p?: number; color?: string; width?: number; dash?: string }> = ({
  x1,
  y1,
  x2,
  y2,
  p = 1,
  color = CHALK,
  width = 5,
  dash,
}) => {
  if (p <= 0) return null;
  const ex = x1 + (x2 - x1) * p;
  const ey = y1 + (y2 - y1) * p;
  const a = Math.atan2(y2 - y1, x2 - x1);
  const hl = 20;
  return (
    <g stroke={color} strokeWidth={width} strokeLinecap="round" fill="none">
      <line x1={x1} y1={y1} x2={ex} y2={ey} strokeDasharray={dash} />
      {p > 0.85 && (
        <path d={`M ${ex - hl * Math.cos(a - 0.45)} ${ey - hl * Math.sin(a - 0.45)} L ${ex} ${ey} L ${ex - hl * Math.cos(a + 0.45)} ${ey - hl * Math.sin(a + 0.45)}`} />
      )}
    </g>
  );
};

// ---------------------------------------------------------------------------------------------
// PrimeBox geometry (landscape pixels).

const FLOOR = 810;
const LID = 330;
const INNER = FLOOR - LID; // 480
const IW = 236; // inner width of a box
const BW = 220; // block width
const K = 61; // block height per unit of log p
const BOX_A = 560;
const BOX_B = 1420;

const colourOf = (p: number): string => (p === 2 ? C.muted : p === 3 ? C.accentText : p === 5 ? C.accent : p === 7 ? C.accent2 : C.text);

const Block: React.FC<{ cx: number; top: number; h: number; p: number; label?: boolean; opacity?: number; rot?: number; w?: number }> = ({
  cx,
  top,
  h,
  p,
  label = true,
  opacity = 1,
  rot = 0,
  w = BW,
}) =>
  opacity <= 0 ? null : (
    <g opacity={Math.min(1, opacity)} transform={`rotate(${rot} ${cx} ${top + h / 2})`}>
      <rect x={cx - w / 2} y={top} width={w} height={h} rx={Math.min(8, h / 4)} fill={alpha(colourOf(p), 0.28)} stroke={alpha(colourOf(p) === C.muted ? C.text : colourOf(p), 0.9)} strokeWidth={3} />
      {label && h >= 42 && (
        <text x={cx} y={top + h / 2 + 15} fontSize={Math.min(56, h - 2)} fontWeight={800} fill={CHALK} textAnchor="middle">
          {p}
        </text>
      )}
    </g>
  );

/** An open box with a lid at its size. */
const BoxShape: React.FC<{ cx: number; draw: number; lidGlow?: number; lidFlash?: number }> = ({ cx, draw, lidGlow = 0, lidFlash = 0 }) => {
  if (draw <= 0) return null;
  const x0 = cx - IW / 2 - 4;
  const x1 = cx + IW / 2 + 4;
  const len = 2 * (INNER + 10) + (x1 - x0);
  return (
    <g>
      <path
        d={`M ${x0} ${LID - 10} L ${x0} ${FLOOR + 4} L ${x1} ${FLOOR + 4} L ${x1} ${LID - 10}`}
        stroke={CHALK}
        strokeWidth={6}
        fill="none"
        strokeLinejoin="round"
        strokeDasharray={len}
        strokeDashoffset={len * (1 - draw)}
      />
      {/* The lid: the number's size. */}
      <g opacity={draw}>
        <line x1={x0 - 22} y1={LID} x2={x1 + 22} y2={LID} stroke={lidFlash > 0.05 ? C.accent2 : CHALK} strokeWidth={9 + 4 * lidFlash} strokeLinecap="round" />
        <rect x={cx - 26} y={LID - 20} width={52} height={12} rx={5} fill={CHALK} />
        {lidGlow > 0 && <line x1={x0 - 22} y1={LID} x2={x1 + 22} y2={LID} stroke={C.accentText} strokeWidth={22} opacity={0.35 * lidGlow} strokeLinecap="round" />}
      </g>
    </g>
  );
};

/** Tops of blocks stacked from the floor. */
const stackTops = (heights: number[]): number[] => {
  let y = FLOOR;
  return heights.map((h) => (y -= h));
};

const Sentence: React.FC<{ words: number; size: number; y0: number; gap: number }> = ({ words, size, y0, gap }) => {
  let k = 0;
  return (
    <>
      {SENTENCE.map((line, li) => (
        <text key={li} x={960} y={y0 + li * gap} fontSize={size} fontWeight={800} textAnchor="middle" fill={CHALK}>
          {line.split(' ').map((w, wi) => {
            const idx = k++;
            const emph = li === 1 && wi >= 2 ? C.accentText : li === 2 ? C.accent2 : CHALK;
            return (
              <tspan key={wi} fill={emph} opacity={Math.max(0, Math.min(1, words - idx))}>
                {(wi > 0 ? ' ' : '') + w}
              </tspan>
            );
          })}
        </text>
      ))}
    </>
  );
};

/** "A whole number divisible by many primes cannot be small": the box picture of the idea. */
export const PrimeBox: React.FC<AnimProps & PrimeBoxProps> = (p) => {
  const cues = wordCues(p.lang, 'idea', p.beats, {
    sentence: [1, 'sentence'],
    size: [3, 'size'],
    only: [4, 'only'],
    chebyshev: [6, 'chebyshev'],
    factorial: [6, 'factorial'],
    first: [7, 'first'],
    divisible: [9, 'divisible'],
    exactly: [9, 'exactly'],
  });
  const s = frameState({ ...p, cues }, p.t, p.beats, p.dur);
  const T = s.ambient;
  const F = 'url(#pb-chalk)';
  const breathe = 0.5 + 0.5 * Math.sin(T * 1.6);

  // First box: blocks for 2, 3, 5, 7, 11.
  const hA = BOX_PRIMES.map((q) => K * Math.log(q));
  const topsA = stackTops(hA);
  const hBounce = K * Math.log(BOUNCER);

  // Bouncer path: falls onto the lid, the lid slams, it is thrown to the floor on the right.
  const u = s.bounce;
  let bx = BOX_A;
  let by = LID - 6 - hBounce;
  let brot = 0;
  if (u < 0.28) {
    const f = u / 0.28;
    by = by - 520 * (1 - f * f);
  } else if (u >= 0.4) {
    const v = Math.min(1, (u - 0.4) / 0.6);
    const startY = by;
    const endY = FLOOR - hBounce;
    bx = BOX_A + (850 - BOX_A) * v;
    by = startY + (endY - startY) * v - 170 * Math.sin(Math.PI * v);
    brot = 16 * v;
  }

  // The title steps back while the bouncer is above the lid, in front of it.
  const titleDim = s.bouncerOpacity > 0 ? 1 - 0.75 * Math.max(0, Math.min(1, (u - 0.04) / 0.1, (0.7 - u) / 0.1)) : 1;

  // Factorial box: thinner blocks that leave room under the lid (the slack).
  const KF = (INNER * 0.7) / FACTORIAL_PRIMES.reduce((a, q) => a + Math.log(q), 0);
  const hF = FACTORIAL_PRIMES.map((q) => KF * Math.log(q));
  const topsF = stackTops(hF);
  const slackBottom = FLOOR - INNER * 0.7;

  // The divisible box: many small blocks that fill it exactly.
  const KD = (INNER - 2) / DIVISIBLE_PRIMES.reduce((a, q) => a + Math.log(q), 0);
  const hD = DIVISIBLE_PRIMES.map((q) => KD * Math.log(q));
  const topsD = stackTops(hD);

  // Box A slides a little left when the second box arrives? No: it stays; box B enters from the right.
  const bShift = (1 - s.boxB) * 260;

  return (
    <>
      <Board vertical={p.vertical} T={T} />
      <Canvas vertical={p.vertical}>
        <ChalkDefs id="pb" />
        <Fit vertical={p.vertical}>
          {/* Lines 1-2: the pile of pages squashed into one chalk line. */}
          {s.pile > 0.01 && (
            <g opacity={Math.min(1, s.pile * 1.3)} filter={F}>
              <g transform={`translate(960 600) scale(${1 + s.shrink * 2.4} ${Math.max(0.03, 1 - s.shrink)}) translate(-960 -600)`}>
                {Array.from({ length: 15 }, (_, i) => {
                  const off = 26 * Math.sin(i * 2.3 + 0.4) + 3 * Math.sin(T * 1.1 + i);
                  const y = 600 - (i + 1) * 21;
                  return (
                    <g key={i} transform={`translate(${960 + off} ${y}) rotate(${2.4 * Math.sin(i * 1.7)})`}>
                      <rect x={-170} y={-10} width={340} height={20} rx={3} fill={alpha(C.accentText, 0.16)} stroke={CHALK} strokeWidth={3} vectorEffect="non-scaling-stroke" />
                      <line x1={-140} y1={0} x2={60 + 50 * Math.sin(i * 3.1)} y2={0} stroke={CHALK_DIM} strokeWidth={3} vectorEffect="non-scaling-stroke" />
                    </g>
                  );
                })}
              </g>
            </g>
          )}
          <ChalkText x={960} y={250} size={72} anchor="middle" opacity={s.pileLabel} fill={C.accentText} weight={800} filter={F}>
            17.4 million lines
          </ChalkText>
          {s.line > 0 && (
            <line
              x1={960 - 560 * s.shrink}
              y1={600}
              x2={960 + 560 * s.shrink}
              y2={600}
              stroke={CHALK}
              strokeWidth={6}
              strokeLinecap="round"
              opacity={s.line}
              filter={F}
            />
          )}
          <ChalkText x={960} y={690} size={60} anchor="middle" opacity={s.oneSentence} filter={F}>
            → one sentence
          </ChalkText>

          {/* Line 3: the sentence, large; then it rises to become the title. */}
          {s.big > 0 && s.words > 0 && (
            <g
              opacity={s.big}
              filter={F}
              transform={`translate(960 ${440 + (190 - 440) * s.toTitle}) scale(${1 - 0.55 * s.toTitle}) translate(-960 -440)`}
            >
              <Sentence words={s.words} size={88} y0={340} gap={110} />
            </g>
          )}
          {s.title > 0 && (
            <text x={960} y={192} fontSize={44} fontWeight={800} textAnchor="middle" fill={CHALK} opacity={s.title * titleDim} filter={F}>
              A whole number divisible by <tspan fill={C.accentText}>many primes</tspan> <tspan fill={C.accent2}>cannot be small.</tspan>
            </text>
          )}

          {/* Line 4 on: the number as a box, prime blocks packing in. */}
          <g filter={F}>
            <BoxShape cx={BOX_A} draw={s.box} lidGlow={s.ceiling * (0.6 + 0.4 * breathe) * s.notes} lidFlash={s.lidFlash} />
            {s.box > 0 && (
              <line x1={BOX_A - 330} y1={FLOOR + 6} x2={BOX_B + 300} y2={FLOOR + 6} stroke={CHALK_DIM} strokeWidth={3} opacity={0.5 * s.box} strokeLinecap="round" />
            )}
            {BOX_PRIMES.map((q, i) => {
              const d = s.drops[i];
              if (d <= 0) return null;
              return <Block key={q} cx={BOX_A} top={topsA[i] - (1 - d) * 560} h={hA[i]} p={q} opacity={Math.min(1, d * 4) * (1 - s.factorial)} />;
            })}
            {s.bouncerOpacity > 0 && <Block cx={bx} top={by} h={hBounce} p={BOUNCER} rot={brot} opacity={s.bouncerOpacity} />}
            {s.lidFlash > 0.05 && s.bouncerOpacity > 0 && (
              <ChalkText x={BOX_A + 150} y={LID - 70} size={64} fill={C.accent2} opacity={s.lidFlash} weight={800}>
                ✗
              </ChalkText>
            )}
            {FACTORIAL_PRIMES.map((q, i) => {
              const d = s.fdrops[i];
              if (d <= 0) return null;
              return <Block key={`f${i}`} cx={BOX_A} top={topsF[i] - (1 - d) * 560} h={hF[i]} p={q} opacity={Math.min(1, d * 4)} />;
            })}
          </g>

          {/* Size mark and the name of the first box. */}
          <g opacity={s.size} filter={F}>
            <Arrow x1={400} y1={FLOOR - 4} x2={400} y2={LID + 8} p={s.size} width={4} />
            <Arrow x1={400} y1={LID + 8} x2={400} y2={FLOOR - 4} p={s.size} width={4} />
            <ChalkText x={380} y={600} size={48} anchor="end">
              size
            </ChalkText>
          </g>
          <ChalkText x={380} y={430} size={44} anchor="end" opacity={s.box * (1 - s.factorial)} fill={CHALK_DIM} filter={F}>
            a
          </ChalkText>
          <ChalkText x={380} y={480} size={44} anchor="end" opacity={s.box * (1 - s.factorial)} fill={CHALK_DIM} filter={F}>
            number
          </ChalkText>
          <ChalkText x={BOX_A} y={292} size={50} anchor="middle" opacity={s.factorial} filter={F}>
            n! = 1 × 2 × 3 × …
          </ChalkText>

          {/* Right-hand notes. */}
          <g opacity={s.notes} filter={F}>
            <Arrow x1={BOX_A + IW / 2 + 30} y1={LID} x2={BOX_A + IW / 2 + 110} y2={LID} p={s.ceiling} color={C.accentText} />
            <ChalkText x={BOX_A + IW / 2 + 130} y={LID + 16} size={46} fill={C.accentText} opacity={s.ceiling}>
              a ceiling on a count of primes
            </ChalkText>
            <ChalkText x={800} y={490} size={72} opacity={s.chebyshev} weight={800}>
              1850 · Chebyshev
            </ChalkText>
            <ChalkText x={800} y={600} size={44} opacity={s.firstProof}>
              first proof of how many primes lie below x
            </ChalkText>
            <ChalkText x={800} y={672} size={54} opacity={s.firstProof} fill={C.accent2} weight={800}>
              order x / log x
            </ChalkText>
          </g>

          {/* Line 9: the factorial's slack under the lid. */}
          {s.slack > 0 && (
            <g filter={F}>
              <rect
                x={BOX_A - IW / 2 + 4}
                y={LID + 8}
                width={IW - 8}
                height={slackBottom - LID - 12}
                rx={6}
                fill={alpha(C.accent2, (0.1 + 0.08 * breathe) * s.slack)}
                stroke={alpha(C.accent2, 0.9 * s.slack)}
                strokeWidth={3}
                strokeDasharray="12 10"
              />
              <path
                d={`M ${BOX_A + IW / 2 + 24} ${LID + 8} q 18 0 18 18 L ${BOX_A + IW / 2 + 42} ${slackBottom - 22} q 0 18 -18 18`}
                stroke={C.accent2}
                strokeWidth={4}
                fill="none"
                opacity={s.slack}
              />
              <Arrow x1={BOX_A + IW / 2 + 116} y1={(LID + slackBottom) / 2} x2={BOX_A + IW / 2 + 54} y2={(LID + slackBottom) / 2} p={s.slackLabel} color={C.accent2} />
            </g>
          )}
          <ChalkText x={BOX_A + IW / 2 + 130} y={(LID + slackBottom) / 2 + 16} size={44} fill={C.accent2} opacity={s.slackLabel} filter={F}>
            not divisible enough
          </ChalkText>

          {/* Line 10: a far more divisible number, packed to the lid, glowing. */}
          {s.boxB > 0 && (
            <g transform={`translate(${bShift} 0)`} opacity={s.boxB}>
              {s.glow > 0 && (
                <rect
                  x={BOX_B - IW / 2 - 10}
                  y={LID - 14}
                  width={IW + 20}
                  height={INNER + 24}
                  rx={14}
                  fill={alpha(C.accentText, 0.32 * s.glow * (0.7 + 0.3 * breathe))}
                  filter="url(#pb-glow)"
                />
              )}
              <g filter={F}>
                <BoxShape cx={BOX_B} draw={s.boxB} lidGlow={s.glow * (0.6 + 0.4 * breathe)} />
                {DIVISIBLE_PRIMES.map((q, i) => {
                  const d = s.ddrops[i];
                  if (d <= 0) return null;
                  return <Block key={`d${i}`} cx={BOX_B} top={topsD[i] - (1 - d) * 560} h={hD[i]} p={q} label={false} opacity={Math.min(1, d * 4)} />;
                })}
              </g>
            </g>
          )}
          <ChalkText x={BOX_B} y={272} size={50} anchor="middle" opacity={s.divisible} fill={C.accentText} weight={800} filter={F}>
            much more divisible
          </ChalkText>
          <ChalkText x={BOX_B + IW / 2 + 40} y={LID + 16} size={44} opacity={s.exact} filter={F}>
            ← size
          </ChalkText>
          <ChalkText x={BOX_B + IW / 2 + 40} y={LID + 70} size={44} opacity={s.exact} filter={F}>
            known
          </ChalkText>
          <ChalkText x={BOX_B + IW / 2 + 40} y={LID + 124} size={44} opacity={s.exact} filter={F}>
            exactly
          </ChalkText>
        </Fit>
      </Canvas>
    </>
  );
};
