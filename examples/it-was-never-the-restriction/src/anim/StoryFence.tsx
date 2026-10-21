import React from 'react';
import { C, GRADIENT, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { Stage, gradientText } from './Stage.tsx';
import { Hand, ModelChip, ReportCard, Tag, clamp01 } from './pieces.tsx';
import { SF, frameState, type StoryFenceProps } from './StoryFence.state.ts';

export { frameState };
export type { StoryFenceProps };

const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

/** Points spread evenly round the pen's rectangle, clockwise from the top-left corner. */
const perimeter = (n: number, x: number, y: number, w: number, h: number): [number, number][] => {
  const total = 2 * (w + h);
  return Array.from({ length: n }, (_, i) => {
    let d = (i / n) * total;
    if (d < w) return [x + d, y];
    d -= w;
    if (d < h) return [x + w, y + d];
    d -= h;
    if (d < w) return [x + w - d, y + h];
    d -= w;
    return [x, y + h - d];
  });
};

/** The earlier article: a sheet with its one sentence highlighted, later stamped "a guess". */
const ArticleCard: React.FC<{ appear: number; sentence: number; guess: number }> = ({ appear, sentence, guess }) => {
  const a = clamp01(appear);
  if (a <= 0) return null;
  const { x, y, w, h } = SF.card;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, opacity: a, transform: `translateY(${-24 * (1 - a)}px)` }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 20,
          background: C.card,
          border: `2px solid ${C.line}`,
          boxShadow: `0 16px 36px ${alpha(C.bg0, 0.7)}`,
          padding: '22px 30px',
          boxSizing: 'border-box',
          fontFamily,
        }}
      >
        <div style={{ fontSize: 24, fontWeight: 700, color: C.muted, letterSpacing: '0.1em' }}>MY EARLIER ARTICLE</div>
        {[0.9, 0.7].map((wd, i) => (
          <div key={i} style={{ height: 12, width: `${wd * 100}%`, borderRadius: 6, background: alpha(C.muted, 0.2), margin: '16px 0' }} />
        ))}
        <div style={{ position: 'relative', display: 'inline-block', marginTop: 4 }}>
          {/* The highlighter sweeps under the sentence. */}
          <div style={{ position: 'absolute', left: -8, top: 4, bottom: 2, width: `calc(${clamp01(sentence) * 100}% + 16px)`, borderRadius: 8, background: alpha(C.accent, 0.35) }} />
          <div style={{ position: 'relative', fontSize: 40, fontWeight: 800, color: C.text, whiteSpace: 'nowrap', opacity: 0.35 + 0.65 * clamp01(sentence) }}>
            fenced-in agent → check it more
          </div>
        </div>
        <div style={{ height: 12, width: '55%', borderRadius: 6, background: alpha(C.muted, 0.2), marginTop: 22 }} />
      </div>
      {guess > 0 && (
        <div
          style={{
            position: 'absolute',
            right: 26,
            top: 22,
            padding: '6px 18px',
            borderRadius: 12,
            border: `4px solid ${C.warm}`,
            background: alpha(C.bg0, 0.9),
            fontFamily,
            fontSize: 40,
            fontWeight: 800,
            color: C.warm,
            whiteSpace: 'nowrap',
            opacity: clamp01(guess),
            transform: `scale(${1.5 - 0.5 * clamp01(guess)}) rotate(-7deg)`,
          }}
        >
          a guess
        </div>
      )}
    </div>
  );
};

/** The pen round the agent: rails drawn round the rectangle, posts rising one after another. */
const Pen: React.FC<{ fence: number; posts: number[] }> = ({ fence, posts }) => {
  const { cx, top, w, h } = SF.pen;
  const x = cx - w / 2;
  const pts = perimeter(posts.length, x, top, w, h);
  const rail = `M ${x} ${top} H ${x + w} V ${top + h} H ${x} Z`;
  return (
    <svg width={960} height={1090} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
      <rect x={x} y={top} width={w} height={h} rx={10} fill={alpha(C.accent, 0.05 * clamp01(fence))} />
      <path d={rail} fill="none" stroke={alpha(C.muted, 0.75)} strokeWidth={7} pathLength={1} strokeDasharray={`${clamp01(fence)} 1`} strokeLinejoin="round" />
      <path d={rail} transform={`translate(0 14)`} fill="none" stroke={alpha(C.muted, 0.4)} strokeWidth={5} pathLength={1} strokeDasharray={`${clamp01(fence)} 1`} strokeLinejoin="round" />
      {pts.map(([px, py], i) => {
        const a = clamp01(posts[i]);
        if (a <= 0) return null;
        const ph = 44 * a;
        return <rect key={i} x={px - 9} y={py + 22 - ph} width={18} height={ph} rx={4} fill={C.text} stroke={C.bg0} strokeWidth={2} opacity={0.9} />;
      })}
    </svg>
  );
};

/** A reader's comment under the article. */
const Bubble: React.FC<{ appear: number }> = ({ appear }) => {
  const a = clamp01(appear);
  if (a <= 0) return null;
  const { x, y, w, h } = SF.bubble;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        opacity: a,
        transform: `translateX(${60 * (1 - a)}px)`,
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        padding: '0 30px',
        boxSizing: 'border-box',
        borderRadius: 26,
        background: alpha(C.card, 0.98),
        border: `3px solid ${C.accentText}`,
        boxShadow: `0 18px 40px ${alpha(C.bg0, 0.8)}`,
        fontFamily,
        zIndex: 7,
      }}
    >
      <div style={{ width: 84, height: 84, borderRadius: 42, padding: 3, background: GRADIENT, flex: 'none' }}>
        <svg width={78} height={78} viewBox="0 0 40 40" style={{ display: 'block', borderRadius: 39, background: C.bg1 }}>
          <circle cx={20} cy={15} r={7} fill={C.muted} />
          <path d="M6 37 a14 12 0 0 1 28 0 z" fill={C.muted} />
        </svg>
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 700, color: C.muted }}>a reader</div>
        <div style={{ fontSize: 38, fontWeight: 800, color: C.text, lineHeight: 1.15, whiteSpace: 'nowrap' }}>measure it, instead of asserting it</div>
      </div>
    </div>
  );
};

export const StoryFence: React.FC<AnimProps & StoryFenceProps> = ({ t, beats, dur, vertical, ...props }) => {
  const s = frameState(props as StoryFenceProps, t, beats, dur);
  const { cx, top, h } = SF.pen;
  const rep = clamp01(s.report);
  const q = clamp01(s.query);
  return (
    <Stage vertical={vertical} fill>
      <ArticleCard appear={s.card} sentence={s.sentence} guess={s.guess} />
      <Pen fence={s.fence} posts={s.posts} />
      <ModelChip x={cx} y={top + 70} name="my agent" appear={s.hand} />
      <Hand x={cx} y={top + 200} size={150} tied={s.cord} opacity={s.hand} />
      <Tag x={110} y={top + 150} w={200} text="no shell" appear={s.noShell} size={30} strong />
      <Tag x={850} y={top + 150} w={200} text="no network" appear={s.noNet} size={30} strong />
      <Bubble appear={s.bubble} />
      {/* The question left on screen: a report out of the pen — is it true? */}
      <ReportCard x={cx} y={lerp(top + h - 40, SF.report.y, rep)} w={280} appear={rep} kind="none" pop={0} />
      {q > 0 && (
        <div
          style={{
            position: 'absolute',
            left: 690,
            top: SF.report.y - 70,
            width: 140,
            height: 140,
            borderRadius: 70,
            border: `4px solid ${C.accentText}`,
            background: alpha(C.bg0, 0.92),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: q,
            transform: `scale(${(0.6 + 0.4 * q) * (1 + 0.08 * s.queryPulse)})`,
            boxShadow: `0 0 ${40 * s.queryPulse}px ${alpha(C.accentText, 0.85)}`,
            fontFamily,
            zIndex: 8,
          }}
        >
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 0.9, ...gradientText }}>?</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: C.text }}>true?</div>
        </div>
      )}
    </Stage>
  );
};
