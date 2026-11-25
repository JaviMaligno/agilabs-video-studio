import React from 'react';
import { staticFile } from 'remotion';
import { C, alpha } from '../brand.ts';
import type { AnimProps } from './types.ts';
import { Canvas } from './Canvas.tsx';
import { fitInto, stageBox } from './canvas.ts';
import { LINKS, PHRASE_OF_LINE, QUOTE_LINES, STEPS, frameState, type NotePageProps } from './NotePage.state.ts';

export { frameState };
export type { NotePageProps };

// Everything is laid out in landscape frame pixels (1920x1080). The note image is drawn
// full-bleed (cover: 1536x1024 scaled 1.25, 100 px cropped top and bottom), so in identity
// camera the top page spans x 685-1435, y 75-1100; its body lines x 756-1362, y 162-744; the
// footnote x 756-1109, y 900-983.
const INK = '#1c1a3a';
const PAPER = '#f6f5fd';
const DESK = '#1d1a3f';
const GREEN = '#34d399';
const FULL = { x: 0, y: 0, w: 1920, h: 1080 };

const ROW = { chip: 92, h: 64, gap: 12 };
const ROW_W = LINKS * (ROW.chip + ROW.gap) - ROW.gap;
const ROW_X = 960 - ROW_W / 2;
/** Where the links come from on screen: the footnote's first line under the footnote camera. */
const FOOT_ON_SCREEN = { x: 690, y: 300 };

const LinkIcon: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y}) rotate(-45)`} fill="none" stroke={C.accentText} strokeWidth={5} strokeLinecap="round">
    <rect x={-22} y={-8} width={26} height={16} rx={8} />
    <rect x={-4} y={-8} width={26} height={16} rx={8} />
  </g>
);

const Chip: React.FC<{ x: number; y: number; w: number; h: number; opacity: number; children: React.ReactNode; dy?: number }> = ({ x, y, w, h, opacity, children, dy = 0 }) =>
  opacity <= 0 ? null : (
    <g opacity={opacity} transform={`translate(0 ${(1 - opacity) * 18 + dy})`}>
      <rect x={x} y={y} width={w} height={h} rx={22} fill={alpha(C.card, 0.95)} stroke={alpha(C.accentText, 0.55)} strokeWidth={2.5} />
      {children}
    </g>
  );

/** The four-page note: name card, the quote lit phrase by phrase, then the footnote and its links. */
export const NotePage: React.FC<AnimProps & NotePageProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const { z, fx, fy, ty } = s.cam;
  // Fixed overlays fade as the camera leaves the page body for the footnote.
  const leave = Math.min(1, Math.max(0, (z - 1.08) / 0.92));
  // The "proof isn't here" chip sits in the empty page body, then rises clear of the footnote.
  const chipY = 420 + (150 - 420) * leave;
  const rowY = 610 + (215 - 610) * s.rise;
  const fitV = p.vertical ? fitInto(FULL, stageBox(true)).transform : undefined;

  return (
    <Canvas vertical={p.vertical}>
      <g transform={fitV}>
        <rect x={0} y={0} width={1920} height={1080} fill={DESK} />
        <defs>
          <linearGradient id="np-top" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={C.bg0} stopOpacity="0.7" />
            <stop offset="1" stopColor={C.bg0} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="np-desk-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={DESK} stopOpacity="0" />
            <stop offset="1" stopColor={DESK} stopOpacity="1" />
          </linearGradient>
        </defs>
        {/* Camera: everything on the desk moves with it. */}
        <g transform={`translate(960 ${ty}) scale(${z}) translate(${-fx} ${-fy})`}>
          <image href={staticFile('bg/note-page.jpg')} x={0} y={-100} width={1920} height={1280} preserveAspectRatio="none" />
          <rect x={0} y={1060} width={1920} height={120} fill="url(#np-desk-fade)" />
          <rect x={-400} y={1180} width={2720} height={600} fill={DESK} />
          {/* The page body: grey placeholder lines covered, then the quote set on it. */}
          <rect x={742} y={146} width={646} height={616} fill={PAPER} opacity={s.quoteIn} />
          {s.quoteIn > 0 && (
            <g opacity={s.quoteIn * s.quote}>
              {QUOTE_LINES.map((line, i) => {
                const lit = s.hl[PHRASE_OF_LINE[i]] ?? 0;
                const y = 300 + i * 80;
                const w = line.length * 29;
                return (
                  <g key={i}>
                    <rect x={1065 - w / 2} y={y - 46} width={w * lit} height={60} rx={8} fill={alpha(C.accent, 0.26)} />
                    <text x={1065} y={y} textAnchor="middle" fontSize={54} fontWeight={700} fill={INK} opacity={0.3 + 0.7 * lit}>
                      {line}
                    </text>
                  </g>
                );
              })}
              <text x={1065} y={705} textAnchor="middle" fontSize={34} fontWeight={600} fill={alpha(INK, 0.55)}>
                Levent Alpöge · 20 November
              </text>
            </g>
          )}
          {/* The footnote lights up before it unspools. */}
          {s.foot > 0 && (
            <rect x={742} y={888} width={390} height={108} rx={14} fill={alpha(C.accent, 0.22 * s.foot)} stroke={alpha(C.accent, 0.9 * s.foot)} strokeWidth={3 + 1.5 * (0.5 + 0.5 * s.breathe)} />
          )}
        </g>

        {/* Keeps the AGILabs badge readable over the white paper. */}
        <rect x={0} y={0} width={1920} height={150} fill="url(#np-top)" />

        {/* Line 1-2 (note): who and where, on the desk to the left of the page. */}
        <g opacity={Math.max(0, 1 - 2.5 * leave)} transform={`translate(0 ${2.5 * s.breathe})`}>
          <Chip x={168} y={196} w={500} h={96 + 100 * s.name} opacity={s.card}>
            <text x={204} y={262} fontSize={44} fontWeight={700} fill={C.accentText}>
              20 November
            </text>
            <text x={204} y={350 + 12 * (1 - s.name)} fontSize={58} fontWeight={800} fill={C.text} opacity={s.name}>
              Levent Alpöge
            </text>
          </Chip>
          <Chip x={168} y={420} w={360} h={160} opacity={s.tag}>
            <text x={204} y={488} fontSize={52} fontWeight={800} fill={C.text}>
              Anthropic
            </text>
            <text x={204} y={546} fontSize={40} fontWeight={600} fill={C.muted}>
              makes Claude
            </text>
          </Chip>
        </g>

        {/* Footnote line 1: the body is empty. */}
        <Chip x={1060 - 330} y={chipY} w={660} h={84} opacity={s.empty}>
          <text x={1060} y={chipY + 57} textAnchor="middle" fontSize={50} fontWeight={700} fill={C.text}>
            the proof isn't here
          </text>
        </Chip>

        {/* Footnote line 3: the stage darkens for the checker. */}
        {s.scrim > 0 && <rect x={0} y={0} width={1920} height={1080} fill={C.bg0} opacity={0.86 * s.scrim} />}

        {/* Footnote line 2: fourteen links unspool from the footnote. */}
        {s.unspool > 0 && (
          <g>
            {Array.from({ length: LINKS }, (_, k) => {
              // Chip k leaves the footnote in turn and takes a third of the unspool to reach its slot.
              const e = 1 - (1 - Math.min(1, Math.max(0, s.unspool * (LINKS + 3) - k) / 3)) ** 3;
              if (e <= 0) return null;
              const fxk = ROW_X + k * (ROW.chip + ROW.gap);
              const x = FOOT_ON_SCREEN.x + (fxk - FOOT_ON_SCREEN.x) * e;
              const float = 3 * Math.sin(p.t * 1.6 + k * 0.7);
              const y = FOOT_ON_SCREEN.y + (rowY - ROW.h / 2 - FOOT_ON_SCREEN.y) * e + float;
              return (
                <g key={k} opacity={Math.min(1, e * 2)}>
                  <rect x={x} y={y} width={ROW.chip} height={ROW.h} rx={14} fill={C.card} stroke={C.accentText} strokeWidth={2.5} />
                  <LinkIcon x={x + ROW.chip / 2} y={y + ROW.h / 2} />
                </g>
              );
            })}
            <g opacity={s.lean}>
              <text x={960} y={rowY + 112} textAnchor="middle" fill={C.text}>
                <tspan fontSize={68} fontWeight={800} fill={C.accentText}>
                  Lean
                </tspan>
                <tspan fontSize={44} fontWeight={600} fill={C.muted} dx={18}>
                  · 14 links
                </tspan>
              </text>
            </g>
          </g>
        )}

        {/* Footnote line 3: a spell-checker for maths, every step ticked in turn. */}
        {s.maths > 0 && (
          <g opacity={s.maths} transform={`translate(0 ${(1 - s.maths) * 20})`}>
            <rect x={300} y={380} width={1320} height={240} rx={28} fill={alpha(C.card, 0.9)} stroke={alpha(s.allGood > 0 ? GREEN : C.accentText, 0.35 + 0.4 * s.allGood)} strokeWidth={3} />
            {STEPS.map((step, i) => {
              const x = 520 + i * 440;
              const tick = s.ticks[i] ?? 0;
              return (
                <g key={i}>
                  <text x={x} y={480} textAnchor="middle" fontSize={64} fontWeight={700} fill={C.text}>
                    {step}
                  </text>
                  {i < STEPS.length - 1 && (
                    <text x={x + 220} y={478} textAnchor="middle" fontSize={56} fontWeight={600} fill={C.muted}>
                      →
                    </text>
                  )}
                  {tick > 0 && (
                    <g transform={`translate(${x} 556) scale(${0.7 + 0.3 * tick})`} opacity={Math.min(1, tick * 2)}>
                      <circle r={30} fill={alpha(GREEN, 0.16)} stroke={GREEN} strokeWidth={4} />
                      <path d="M -13 1 L -4 11 L 14 -10" fill="none" stroke={GREEN} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={40} strokeDashoffset={40 * (1 - tick)} />
                    </g>
                  )}
                </g>
              );
            })}
            <text x={960} y={720} textAnchor="middle" fontSize={54} fontWeight={700} fill={C.text} opacity={s.checkLabel}>
              a computer checks <tspan fill={GREEN}>every step</tspan>
            </text>
          </g>
        )}
      </g>
    </Canvas>
  );
};
