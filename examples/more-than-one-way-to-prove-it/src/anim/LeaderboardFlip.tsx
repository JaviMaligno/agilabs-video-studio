import React from 'react';
import { Img, staticFile } from 'remotion';
import { C, GRADIENT, alpha } from '../brand.ts';
import type { Lang } from '../types.ts';
import type { AnimProps } from './types.ts';
import { frameState, RUNS, type LeaderboardFlipProps, type Verdict } from './LeaderboardFlip.state.ts';
import { Stage, gradientText, stageOf } from './Stage.tsx';

export { frameState };
export type { LeaderboardFlipProps };

// Verdict colours (the article's figures use the same teal; green and red only for the stamps).
const TEAL = '#2dd4bf';
const GREEN = '#34d399';
const RED = '#f87171';
const MONO = "'JetBrains Mono', ui-monospace, monospace";

const T = {
  rule1: { en: 'Run the tests before you change anything', es: 'Ejecuta los tests antes de cambiar nada' },
  rule2: { en: "Don't edit the tests", es: 'No toques los tests' },
  rules: { en: "GRADER'S RULES", es: 'REGLAS DEL EVALUADOR' },
  fixed: { en: 'FIXED', es: 'ARREGLADOS' },
  first: { en: 'TESTS FIRST', es: 'TESTS PRIMERO' },
  both: { en: 'PASSES BOTH RULES', es: 'PASA LAS DOS REGLAS' },
  byFixed: { en: 'RANKED BY BUGS FIXED', es: 'POR BUGS ARREGLADOS' },
  byRules: { en: 'RANKED BY TWO SENSIBLE RULES', es: 'POR DOS REGLAS SENSATAS' },
  fixedLong: { en: 'Bugs fixed', es: 'Bugs arreglados' },
  firstLong: { en: 'Ran the tests first', es: 'Ejecutó los tests primero' },
  pass: { en: 'PASS', es: 'APTO' },
  fail: { en: 'FAIL', es: 'NO APTO' },
  opinion: { en: 'OPINION', es: 'OPINIÓN' },
  tagA: { en: 'It graded the ', es: 'Puntuó la ' },
  tagHabit: { en: 'habit', es: 'costumbre' },
  tagB: { en: ', not the result.', es: ', no el resultado.' },
} as const;
const tr = (k: keyof typeof T, lang: Lang) => T[k][lang] || T[k].en;
const colourOf = (v: Verdict) => (v === 'pass' ? GREEN : v === 'fail' ? RED : C.muted);

/** The model's cast robot (one colour per model, the same in every scene). */
const Robot: React.FC<{ colour: string; size: number; style?: React.CSSProperties }> = ({ colour, size, style }) => (
  <Img src={staticFile(`cast/robot-${colour}.png`)} style={{ flex: 'none', width: size, height: size, objectFit: 'contain', ...style }} />
);

/** A round rubber stamp with a tick or a cross: it lands big and settles. */
const RoundStamp: React.FC<{ verdict: Verdict; pop: number; size: number; style?: React.CSSProperties }> = ({ verdict, pop, size, style }) =>
  pop <= 0 ? null : (
    <div
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: '50%',
        border: `${Math.round(size * 0.09)}px solid ${colourOf(verdict)}`,
        background: alpha(C.bg0, 0.94),
        color: colourOf(verdict),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.56,
        fontWeight: 900,
        lineHeight: 1,
        transform: `rotate(-10deg) scale(${1.8 - 0.8 * pop})`,
        opacity: Math.min(1, pop * 1.6),
        boxShadow: `0 0 ${Math.round(28 * pop)}px ${alpha(colourOf(verdict), 0.55)}`,
        zIndex: 30,
        ...style,
      }}
    >
      {verdict === 'pass' ? '✓' : '✗'}
    </div>
  );

/** A word stamp (PASS, FAIL, OPINION). */
const WordStamp: React.FC<{ text: string; colour: string; pop: number; size: number; rotate?: number; style?: React.CSSProperties }> = ({
  text,
  colour,
  pop,
  size,
  rotate = -8,
  style,
}) =>
  pop <= 0 ? null : (
    <div
      style={{
        position: 'absolute',
        padding: `${Math.round(size * 0.08)}px ${Math.round(size * 0.36)}px`,
        border: `${Math.max(6, Math.round(size * 0.11))}px solid ${colour}`,
        borderRadius: 18,
        color: colour,
        background: alpha(C.bg0, 0.93),
        fontSize: size,
        fontWeight: 900,
        letterSpacing: '0.06em',
        whiteSpace: 'nowrap',
        transform: `translate(-50%, -50%) rotate(${rotate}deg) scale(${1.8 - 0.8 * pop})`,
        opacity: Math.min(1, pop * 1.6),
        boxShadow: `0 14px 44px ${alpha(C.bg0, 0.7)}, 0 0 ${Math.round(36 * pop)}px ${alpha(colour, 0.45)}`,
        zIndex: 30,
        ...style,
      }}
    >
      {text}
    </div>
  );

/** The grader's clipboard: a clip, a title and the rules, each with a teal tick. */
const Clipboard: React.FC<{ s: ReturnType<typeof frameState>; lang: Lang; big: boolean; width: number }> = ({ s, lang, big, width }) => {
  const fs = big ? 60 : 34;
  const row = (text: string, draw: number, drop: boolean) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: big ? 26 : 18,
        opacity: drop ? Math.min(1, draw * 1.5) : 1,
        transform: drop ? `translateY(${-70 * (1 - draw)}px)` : undefined,
      }}
    >
      <div
        style={{
          flex: 'none',
          width: fs * 1.1,
          height: fs * 1.1,
          borderRadius: 10,
          border: `4px solid ${TEAL}`,
          color: TEAL,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: fs * 0.8,
          fontWeight: 900,
          transform: `scale(${0.6 + 0.4 * Math.min(1, draw * 2)})`,
          opacity: drop ? 1 : 0.25 + 0.75 * Math.min(1, draw * 2),
        }}
      >
        ✓
      </div>
      <div style={{ position: 'relative', flex: 1 }}>
        {/* A blank line waiting for the rule, so the clipboard never reads as empty. */}
        {!drop && draw < 1 && (
          <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: fs * 0.42, transform: 'translateY(-50%)', borderRadius: 8, background: alpha(C.text, 0.07 * (1 - draw)) }} />
        )}
        <div
          style={{
            position: 'relative',
            fontSize: fs,
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: '-0.01em',
            clipPath: drop ? undefined : `inset(0 ${100 - draw * 100}% 0 0)`,
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
  return (
    <div
      style={{
        position: 'relative',
        width,
        padding: big ? '78px 52px 56px' : '46px 36px 30px',
        borderRadius: 28,
        background: C.card,
        border: `2px solid ${alpha(C.text, 0.12)}`,
        boxShadow: `0 24px 60px ${alpha(C.bg0, 0.6)}`,
        display: 'flex',
        flexDirection: 'column',
        gap: big ? 34 : 16,
        opacity: s.clip,
        transform: `translateY(${30 * (1 - s.clip)}px)`,
      }}
    >
      {/* the clip */}
      <div
        style={{
          position: 'absolute',
          top: big ? -26 : -18,
          left: '50%',
          transform: 'translateX(-50%)',
          width: big ? 240 : 170,
          height: big ? 56 : 40,
          borderRadius: 14,
          background: GRADIENT,
          boxShadow: `0 8px 20px ${alpha(C.bg0, 0.6)}`,
        }}
      />
      <div style={{ fontSize: big ? 28 : 22, fontWeight: 800, letterSpacing: '0.16em', color: C.muted }}>{tr('rules', lang)}</div>
      {row(tr('rule1', lang), s.rule1.draw, false)}
      {s.rule2.draw > 0 || s.mode === 'flip' || s.mode === 'opinion' ? row(tr('rule2', lang), s.rule2.draw, true) : null}
    </div>
  );
};

/** The six cards and the rank column. */
const Board: React.FC<{ s: ReturnType<typeof frameState>; lang: Lang; top: number; cardH: number; gap: number; withHeader: boolean }> = ({
  s,
  lang,
  top,
  cardH,
  gap,
  withHeader,
}) => {
  const step = cardH + gap;
  const rankW = 60;
  const cardW = 814;
  const left = rankW + 6;
  const headerH = withHeader ? 58 : 0;
  // Cards rising pass in front of cards falling.
  const order = [...s.cards].sort((a, b) => a.rising - b.rising);
  return (
    <div style={{ position: 'absolute', top, left: 0, width: left + cardW, height: headerH + step * 6 }}>
      {withHeader && (
        <div style={{ position: 'absolute', top: 0, left, width: cardW, height: 44, fontSize: 28, fontWeight: 800, letterSpacing: '0.14em' }}>
          <span style={{ position: 'absolute', left: 0, color: C.muted, opacity: 1 - s.header }}>{tr('byFixed', lang)}</span>
          <span style={{ position: 'absolute', left: 0, opacity: s.header, ...gradientText }}>{tr('byRules', lang)}</span>
        </div>
      )}
      {Array.from({ length: 6 }, (_, k) => (
        <div
          key={k}
          style={{
            position: 'absolute',
            top: headerH + k * step,
            left: 0,
            width: rankW,
            height: cardH,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            fontFamily: MONO,
            fontSize: 34,
            fontWeight: 700,
            color: k === 0 ? C.accentText : alpha(C.muted, 0.8),
            // The article ranks only the top (Qwen) and the bottom two under both rules: the middle
            // rank numbers fade once the stack is ranked by the rules.
            opacity: k >= 1 && k <= 3 ? 1 - 0.85 * s.header : 1,
          }}
        >
          #{k + 1}
        </div>
      ))}
      {order.map((c) => {
        const y = headerH + c.slot * step;
        const x = left + c.swingX * 34;
        const tint = colourOf(c.verdict);
        const border = c.pop > 0 ? alpha(tint, 0.35 + 0.5 * c.pop) : alpha(C.text, 0.1);
        const counter = (label: string, value: string, frac: number, colour: string, show = 1) => (
          <div style={{ width: 168, display: 'flex', flexDirection: 'column', gap: 4, opacity: show }}>
            <div style={{ fontSize: 21, fontWeight: 700, letterSpacing: '0.1em', color: C.muted }}>{label}</div>
            <div style={{ fontFamily: MONO, fontSize: cardH > 125 ? 38 : 34, fontWeight: 700, lineHeight: 1.05, color: C.text }}>{value}</div>
            <div style={{ height: 6, width: 150, borderRadius: 3, background: alpha(C.text, 0.08) }}>
              <div style={{ height: 6, width: 150 * frac, borderRadius: 3, background: colour }} />
            </div>
          </div>
        );
        return (
          <div
            key={c.name}
            style={{
              position: 'absolute',
              top: y,
              left: x,
              width: cardW,
              height: cardH,
              borderRadius: 22,
              background: `linear-gradient(180deg, ${C.card}, ${C.bg1})`,
              border: `3px solid ${border}`,
              boxShadow: `0 ${10 + 26 * c.lift}px ${30 + 40 * c.lift}px ${alpha(C.bg0, 0.55 + 0.3 * c.lift)}`,
              transform: `rotate(${c.tilt * 3.2}deg) scale(${(1 + 0.05 * c.lift * (c.rising ? 1 : -1)) * (0.92 + 0.08 * c.appear)})`,
              opacity: c.appear * (1 - 0.6 * c.dim),
              display: 'flex',
              alignItems: 'center',
              padding: '0 30px',
              gap: 18,
              zIndex: c.rising ? 20 : 10,
            }}
          >
            <Robot colour={c.robot} size={cardH - 14} style={{ marginLeft: -14 }} />
            <div style={{ flex: 1, fontSize: cardH > 125 ? 46 : 42, fontWeight: 800, letterSpacing: '-0.01em' }}>{c.name}</div>
            <div style={{ position: 'relative', display: 'flex', gap: 12, marginRight: 92 }}>
              <div style={{ display: 'flex', gap: 14, opacity: 1 - Math.min(1, c.showBoth * 2) }}>
                {counter(tr('fixed', lang), `${c.fixed}/${RUNS}`, c.fixed / RUNS, GRADIENT)}
                {counter(tr('first', lang), `${c.testsFirst}/${c.fixed}`, c.testsFirst / Math.max(1, c.fixed), TEAL, 1 - c.dim)}
              </div>
              {c.both !== null && c.showBoth > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'flex-end',
                    gap: 2,
                    opacity: Math.max(0, c.showBoth * 2 - 1),
                    transform: `translateY(${16 * (1 - c.showBoth)}px)`,
                  }}
                >
                  <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: '0.12em', color: C.muted }}>{tr('both', lang)}</div>
                  <div style={{ fontFamily: MONO, fontSize: 56, fontWeight: 800, lineHeight: 1, color: tint }}>
                    {c.both}/{c.fixed}
                  </div>
                </div>
              )}
            </div>
            <RoundStamp verdict={c.verdict} pop={c.pop} size={cardH > 125 ? 96 : 86} style={{ right: 14, top: (cardH - (cardH > 125 ? 96 : 86)) / 2 }} />
          </div>
        );
      })}
    </div>
  );
};

/** One model's card, big: two bars (fixed, tests first) and the verdict stamp. */
const FocusCard: React.FC<{ f: NonNullable<ReturnType<typeof frameState>['focus']>; lang: Lang; top: number; width: number }> = ({ f, lang, top, width }) => {
  const bar = (label: string, value: string, frac: number, grow: number, fill: string) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ fontSize: 44, fontWeight: 700, color: C.muted }}>{label}</div>
        <div style={{ fontFamily: MONO, fontSize: 88, fontWeight: 800, lineHeight: 1, opacity: Math.min(1, grow * 3) }}>{value}</div>
      </div>
      <div style={{ height: 58, borderRadius: 16, background: alpha(C.text, 0.07), border: `2px solid ${alpha(C.text, 0.1)}`, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${frac * grow * 100}%`, background: fill, borderRadius: 12 }} />
      </div>
    </div>
  );
  const colour = colourOf(f.verdict);
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 0,
        width,
        padding: '60px 56px 76px',
        borderRadius: 32,
        background: `linear-gradient(180deg, ${C.card}, ${C.bg1})`,
        border: `3px solid ${f.pop > 0 ? alpha(colour, 0.35 + 0.5 * f.pop) : alpha(C.text, 0.12)}`,
        boxShadow: `0 30px 70px ${alpha(C.bg0, 0.6)}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 64,
        opacity: f.appear,
        transform: `translateY(${50 * (1 - f.appear)}px) scale(${0.94 + 0.06 * f.appear})`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: -12 }}>
        <Robot colour={f.robot} size={140} style={{ margin: '-14px 0 -14px -14px' }} />
        <div style={{ fontSize: 112, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>{f.name}</div>
      </div>
      {bar(tr('fixedLong', lang), `${f.fixed}/${RUNS}`, f.fixed / RUNS, f.growFixed, GRADIENT)}
      {bar(tr('firstLong', lang), `${f.testsFirst}/${f.fixed}`, f.testsFirst / Math.max(1, f.fixed), f.growTests, TEAL)}
      <WordStamp
        text={f.verdict === 'pass' ? tr('pass', lang) : tr('fail', lang)}
        colour={colour}
        pop={f.pop}
        size={80}
        rotate={f.verdict === 'pass' ? -7 : 7}
        style={{ left: '80%', top: -6 }}
      />
    </div>
  );
};

export const LeaderboardFlip: React.FC<AnimProps & LeaderboardFlipProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const box = stageOf(p.vertical);
  const w = Math.min(box.w, 900);
  const inner = (() => {
    switch (s.mode) {
      case 'cold':
        return <Board s={s} lang={p.lang} top={10} cardH={136} gap={12} withHeader />;
      case 'flip':
        return (
          <>
            <div style={{ position: 'absolute', top: 24, left: 0 }}>
              <Clipboard s={s} lang={p.lang} big={false} width={876} />
            </div>
            <Board s={s} lang={p.lang} top={290} cardH={118} gap={12} withHeader={false} />
          </>
        );
      case 'focus':
        return (
          <>
            <div style={{ position: 'absolute', top: 24, left: 0 }}>
              <Clipboard s={s} lang={p.lang} big={false} width={876} />
            </div>
            {s.focus && <FocusCard f={s.focus} lang={p.lang} top={270} width={876} />}
          </>
        );
      case 'rule':
        return (
          <div style={{ position: 'absolute', top: 290, left: 0 }}>
            <Clipboard s={s} lang={p.lang} big width={876} />
          </div>
        );
      case 'opinion':
        return (
          <>
            <div style={{ position: 'absolute', top: 60, left: 0 }}>
              <Clipboard s={s} lang={p.lang} big width={876} />
              <WordStamp text={tr('opinion', p.lang)} colour={RED} pop={s.opinion.pop} size={110} rotate={-9} style={{ left: '56%', top: '122%' }} />
            </div>
            <div
              style={{
                position: 'absolute',
                top: 800,
                left: 0,
                width: 876,
                fontSize: 70,
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                opacity: s.tagline.appear,
                transform: `translateY(${24 * (1 - s.tagline.appear)}px)`,
              }}
            >
              {tr('tagA', p.lang)}
              <span style={{ color: C.accentText, textDecoration: 'underline', textDecorationColor: C.accent, textDecorationThickness: 8, textUnderlineOffset: 12 }}>
                {tr('tagHabit', p.lang)}
              </span>
              {tr('tagB', p.lang)}
            </div>
          </>
        );
    }
  })();
  return (
    <Stage vertical={p.vertical} fill>
      <div style={{ position: 'absolute', top: 0, left: 0, width: w, height: box.h }}>{inner}</div>
    </Stage>
  );
};
