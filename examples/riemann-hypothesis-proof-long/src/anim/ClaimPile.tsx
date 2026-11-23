import React from 'react';
import { staticFile } from 'remotion';
import { C, alpha } from '../brand.ts';
import type { AnimProps } from './types.ts';
import { Canvas } from './Canvas.tsx';
import { fitInto, stageBox } from './canvas.ts';
import { FIRST_WAVE, SHEETS, STACK_COLS, STACK_ROWS, frameState, sheetYear, type ClaimPileProps } from './ClaimPile.state.ts';

export { frameState };
export type { ClaimPileProps };

// Laid out in landscape frame pixels (1920x1080); the vertical cut fits the same drawing into its
// stage. Stage: y 140-830, x 160-1760; the band under 830 is the captions'.
const FULL = { x: 0, y: 0, w: 1920, h: 1080 };
const INK = '#1c1a3a';
const PAPER = ['#f1e7d0', '#e8dbbd', '#f4ecdc', '#e3d2ae'];
const STAMP = '#b4443a';
const RED = '#f87171';
const PAPER_NEW = '#f6f5fd';

/** The pile is drawn about its base centre. */
const BASE = { x: 960, y: 790 };
const SHEET = { w: 250, h: 170 };

const hash = (n: number): number => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Resting place of sheet k: a heap that narrows as it rises; the last two land on top. */
const SPOTS = Array.from({ length: SHEETS }, (_, k) => {
  const top = k >= SHEETS - 2;
  const h = top ? 1 : k < FIRST_WAVE ? k / FIRST_WAVE : 0.35 + 0.6 * ((k - FIRST_WAVE) / (SHEETS - 2 - FIRST_WAVE));
  const spread = (1 - h * 0.7) * 330;
  const x = top ? BASE.x + (k === SHEETS - 2 ? -70 : 80) : BASE.x + ((((k * 0.618034 + 0.3) % 1) * 2 - 1) * 0.85 + (hash(k) - 0.5) * 0.3) * spread;
  const y = BASE.y - SHEET.h / 2 - h * 280 + (hash(k + 40) - 0.5) * 30 - (top ? 20 : 0);
  const rot = top ? (k === SHEETS - 2 ? -9 : 7) : (hash(k + 90) - 0.5) * 38;
  return { x, y, rot, paper: PAPER[k % PAPER.length], year: sheetYear(k) };
});

const Sheet: React.FC<{ k: number; landed: number; T: number }> = ({ k, landed, T }) => {
  if (landed <= 0) return null;
  const s = SPOTS[k];
  const drop = (1 - landed) * -720;
  const sway = landed >= 1 ? 0.5 * Math.sin(T * 0.8 + k) : (1 - landed) * 25;
  return (
    <g transform={`translate(${s.x} ${s.y + drop}) rotate(${s.rot + sway})`} opacity={Math.min(1, landed * 3)}>
      <rect x={-SHEET.w / 2 + 5} y={-SHEET.h / 2 + 7} width={SHEET.w} height={SHEET.h} rx={6} fill="#000" opacity={0.28} />
      <rect x={-SHEET.w / 2} y={-SHEET.h / 2} width={SHEET.w} height={SHEET.h} rx={6} fill={s.paper} stroke="#5b4a32" strokeOpacity={0.45} strokeWidth={2} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={-SHEET.w / 2 + 20} y={-SHEET.h / 2 + 26 + i * 24} width={(i === 0 ? 120 : 70) + hash(k * 7 + i) * 60} height={5} rx={2.5} fill={INK} opacity={0.32} />
      ))}
      <g transform={`translate(${SHEET.w / 2 - 70} ${SHEET.h / 2 - 38}) rotate(-8)`}>
        <rect x={-60} y={-28} width={120} height={52} rx={8} fill="none" stroke={STAMP} strokeWidth={4} opacity={0.9} />
        <text x={0} y={13} textAnchor="middle" fontSize={40} fontWeight={800} fill={STAMP} opacity={0.92}>
          {s.year}
        </text>
      </g>
    </g>
  );
};

const Chip: React.FC<{ cx: number; y: number; opacity: number; w: number; h?: number; children: React.ReactNode }> = ({ cx, y, opacity, w, h = 84, children }) =>
  opacity <= 0 ? null : (
    <g opacity={opacity} transform={`translate(0 ${(1 - opacity) * 16})`}>
      <rect x={cx - w / 2} y={y} width={w} height={h} rx={22} fill={alpha(C.card, 0.95)} stroke={alpha(C.accentText, 0.55)} strokeWidth={2.5} />
      {children}
    </g>
  );

/** Speech bubble with its tail pointing down at (tx, bottom). */
const Bubble: React.FC<{ x: number; y: number; w: number; h: number; tx: number; pop: number; children: React.ReactNode; strong?: boolean }> = ({ x, y, w, h, tx, pop, children, strong }) =>
  pop <= 0 ? null : (
    <g transform={`translate(${tx} ${y + h}) scale(${0.6 + 0.4 * pop}) translate(${-tx} ${-(y + h)})`} opacity={Math.min(1, pop * 1.6)}>
      <path
        d={`M ${x + 30} ${y} H ${x + w - 30} Q ${x + w} ${y} ${x + w} ${y + 30} V ${y + h - 30} Q ${x + w} ${y + h} ${x + w - 30} ${y + h} H ${tx + 26} L ${tx} ${y + h + 40} L ${tx - 14} ${y + h} H ${x + 30} Q ${x} ${y + h} ${x} ${y + h - 30} V ${y + 30} Q ${x} ${y} ${x + 30} ${y} Z`}
        fill={strong ? C.accent : PAPER_NEW}
        stroke={strong ? C.accentText : alpha(INK, 0.5)}
        strokeWidth={3}
      />
      {children}
    </g>
  );

/** Announced proofs: a pile of dated papers, the 1885 letter, Heidelberg 2018, and "run it." */
export const ClaimPile: React.FC<AnimProps & ClaimPileProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const fitV = p.vertical ? fitInto(FULL, stageBox(true)).transform : undefined;
  const cx = 960 + (500 - 960) * s.aside;
  const sc = 1 - 0.28 * s.aside;
  const zoom = 1 + 0.05 * s.stage * Math.min(1, s.T / 30);
  const walking = s.walk > 0 && s.walk < 1;
  const checkerX = 2010 + (1600 - 2010) * s.walk;
  const stackX = 860 + (1 - s.stack) * 1150;
  const stackY = 380;
  const scanRows = s.scan * STACK_ROWS;

  return (
    <Canvas vertical={p.vertical}>
      <defs>
        <filter id="cp-dim">
          <feColorMatrix type="saturate" values={String(1 - 0.85 * s.dim)} />
        </filter>
      </defs>
      <g transform={fitV}>
        {/* A floor for the pile to rest on. */}
        <ellipse cx={cx} cy={BASE.y + 6} rx={420 * sc} ry={26 * sc} fill="#000" opacity={0.35} />

        {/* The pile of announced proofs. */}
        <g transform={`translate(${cx} ${BASE.y}) scale(${sc}) translate(${-BASE.x} ${-BASE.y})`} filter={s.dim > 0 ? 'url(#cp-dim)' : undefined} opacity={1 - 0.55 * s.dim}>
          {s.sheets.map((landed, k) => (
            <Sheet key={k} k={k} landed={landed} T={s.T} />
          ))}
        </g>

        {/* Lines 2-3: the 1885 letter and the proof that never came. */}
        {s.letter > 0 && (
          <g opacity={Math.min(1, s.letter * 1.5)}>
            <g transform={`translate(${780 + 290 * s.letter} ${520 - 50 * s.letter + 5 * Math.sin(s.T * 1.2)}) rotate(${-14 * (1 - s.letter) + 2 * Math.sin(s.T * 0.9)}) scale(${0.35 + 0.2 * s.letter})`}>
              <image href={staticFile('cast/old-letter.png')} x={-330} y={-346} width={661} height={692} />
            </g>
          </g>
        )}
        <Chip cx={1070} y={692} w={500} opacity={s.year1885}>
          <text x={1070} y={750} textAnchor="middle" fontSize={50} fontWeight={800} fill={C.text}>
            Stieltjes <tspan fill={C.accentText}>· 1885</tspan>
          </text>
        </Chip>
        {s.proofBox > 0 && (
          <g opacity={s.proofBox} transform={`translate(0 ${(1 - s.proofBox) * 16})`}>
            <rect x={1350} y={300} width={370} height={330} rx={24} fill={alpha(C.card, 0.85)} stroke={C.muted} strokeOpacity={0.7 + 0.3 * s.blank} strokeWidth={3 + 3 * s.blank} strokeDasharray="16 12" />
            <text x={1535} y={378} textAnchor="middle" fontSize={56} fontWeight={800} fill={C.text}>
              proof?
            </text>
            <line x1={1400} y1={410} x2={1670} y2={410} stroke={alpha(C.muted, 0.5)} strokeWidth={2} />
          </g>
        )}

        {/* Lines 4-6: Heidelberg, 2018. */}
        {s.stage > 0 && (
          <g opacity={s.stage}>
            <g transform={`translate(960 540) scale(${zoom}) translate(-960 -540)`}>
              <g transform="translate(1920 0) scale(-1 1)">
                <image href={staticFile('bg/lecture-stage.jpg')} x={0} y={-100} width={1920} height={1280} preserveAspectRatio="none" />
              </g>
              <text x={825} y={290} textAnchor="middle" fontSize={76} fontWeight={800} fill={INK} opacity={s.year2018}>
                Heidelberg · 2018
              </text>
              <g opacity={s.claim} transform={`translate(0 ${(1 - s.claim) * 14})`}>
                <text x={825} y={420} textAnchor="middle" fontSize={56} fontWeight={600} fill={alpha(INK, 0.85)}>
                  A proof of the
                </text>
                <text x={825} y={496} textAnchor="middle" fontSize={64} fontWeight={800} fill={C.accent}>
                  Riemann Hypothesis
                </text>
              </g>
              <Chip cx={1514} y={392} w={400} opacity={s.atiyah}>
                <text x={1514} y={450} textAnchor="middle" fontSize={48} fontWeight={800} fill={C.text}>
                  Michael Atiyah
                </text>
              </Chip>
            </g>

            {/* Line 5: the author in the audience, shrugging. */}
            {s.cameo > 0 && (
              <g transform={`translate(${150 - (1 - s.cameo) * 460} ${512 - 5 * Math.abs(Math.sin(s.T * 1.8))})`}>
                <image href={staticFile('cast/avatar-shrug.png')} x={0} y={0} width={309} height={321} />
              </g>
            )}
            <Chip cx={672} y={540} w={400} h={76} opacity={s.cameo >= 1 ? 1 : Math.max(0, s.cameo * 2 - 1)}>
              <text x={672} y={591} textAnchor="middle" fontSize={42} fontWeight={700} fill={C.text}>
                me, at university
              </text>
            </Chip>

            {/* Line 6: not even an afternoon. */}
            {s.clock > 0 && (
              <g opacity={s.clock} transform={`translate(0 ${(1 - s.clock) * 16})`}>
                <rect x={470} y={668} width={720} height={104} rx={26} fill={alpha(C.card, 0.95)} stroke={alpha(C.accentText, 0.55)} strokeWidth={2.5} />
                <g transform="translate(532 720)">
                  <circle r={36} fill={PAPER_NEW} stroke={C.accentText} strokeWidth={4} />
                  <line x1={0} y1={0} x2={0} y2={-24} stroke={INK} strokeWidth={5} strokeLinecap="round" />
                  <line x1={0} y1={0} x2={0} y2={-30} stroke={C.accent} strokeWidth={3.5} strokeLinecap="round" transform={`rotate(${(s.T * 40) % 360})`} />
                  <circle r={4} fill={INK} />
                </g>
                <text x={594} y={737} fontSize={46} fontWeight={700} fill={C.text} opacity={s.clockLabel}>
                  not even for an afternoon
                </text>
              </g>
            )}
          </g>
        )}

        {/* Line 8: not worth stopping. */}
        <Chip cx={p.mode === 'runit' ? cx : 960} y={170} w={820} h={92} opacity={s.worth}>
          <text x={p.mode === 'runit' ? cx : 960} y={232} textAnchor="middle" fontSize={54} fontWeight={800} fill={C.text}>
            not worth stopping to check
          </text>
        </Chip>

        {/* runit: the stack of Lean files, the checker, the statement card. */}
        {s.stack > 0 && (
          <g transform={`translate(${stackX} ${stackY})`}>
            {Array.from({ length: STACK_COLS * STACK_ROWS }, (_, i) => {
              const col = i % STACK_COLS;
              const row = Math.floor(i / STACK_COLS);
              const checked = row < scanRows;
              const shimmer = 0.04 * Math.sin(s.T * 2 + i * 0.37);
              return (
                <g key={i} transform={`translate(${col * 50} ${row * 32})`}>
                  <rect width={44} height={26} rx={5} fill={checked ? alpha(C.accentText, 0.62) : alpha(C.accent, 0.3 + shimmer)} stroke={checked ? alpha(C.text, 0.8) : alpha(C.accentText, 0.55)} strokeWidth={1.5} />
                  <rect x={7} y={8} width={12 + hash(i) * 20} height={3} rx={1.5} fill={alpha(C.text, checked ? 0.95 : 0.55)} />
                  <rect x={7} y={15} width={8 + hash(i + 500) * 16} height={3} rx={1.5} fill={alpha(C.text, checked ? 0.7 : 0.35)} />
                </g>
              );
            })}
          </g>
        )}
        {s.card > 0 && (
          <g opacity={s.card} transform={`translate(${stackX + 247} ${300 + (1 - s.card) * -40}) rotate(${-3 + 1.2 * Math.sin(s.T * 1.1)})`}>
            <rect x={-240} y={0} width={480} height={136} rx={10} fill="#000" opacity={0.3} transform="translate(5 7)" />
            <rect x={-240} y={0} width={480} height={136} rx={10} fill={PAPER_NEW} stroke={alpha(INK, 0.4)} strokeWidth={2} />
            <circle cx={0} cy={4} r={11} fill={RED} stroke="#7f1d1d" strokeWidth={2} />
            <text x={0} y={64} textAnchor="middle" fontSize={44} fontWeight={800} fill={INK}>
              statement
            </text>
            <text x={0} y={112} textAnchor="middle" fontSize={40} fontWeight={600} fill={alpha(INK, 0.75)}>
              written by others
            </text>
          </g>
        )}
        {s.walk > 0 && (
          <g transform={`translate(${checkerX} ${505 - (walking ? 12 * Math.abs(Math.sin(s.T * 7)) : 4 * Math.sin(s.T * 1.6))}) scale(-1 1)`}>
            <image href={staticFile('cast/checker.png')} x={-145} y={0} width={289} height={298} />
          </g>
        )}
        <Chip cx={960} y={160} w={560} h={88} opacity={s.believe}>
          <text x={960} y={220} textAnchor="middle" fontSize={54} fontWeight={800} fill={C.text}>
            nothing to believe
          </text>
        </Chip>
        <Bubble x={250} y={250} w={520} h={110} tx={500} pop={s.bubble1}>
          <text x={510} y={322} textAnchor="middle" fontSize={48} fontWeight={700} fill={INK} opacity={1 - 0.45 * s.strike}>
            who has the time?
          </text>
          {s.strike > 0 && <line x1={290} y1={308} x2={290 + 440 * s.strike} y2={308} stroke={RED} strokeWidth={7} strokeLinecap="round" />}
        </Bubble>
        <Bubble x={1430} y={290} w={300} h={120} tx={1560} pop={s.bubble2} strong>
          <text x={1580} y={370} textAnchor="middle" fontSize={64} fontWeight={800} fill={C.text}>
            run it.
          </text>
        </Bubble>
      </g>
    </Canvas>
  );
};
