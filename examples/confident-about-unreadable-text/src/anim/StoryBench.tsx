import React from 'react';
import { C, alpha } from '../brand.ts';
import type { AnimProps } from './types.ts';
import { frameState, STORY_CODES, type StoryProps } from './StoryBench.state.ts';
import { Stage, stageOf } from './Stage.tsx';
import { Card, Chip, GlyphLine, Pill } from './pieces.tsx';
import { clip, morph, noiseGlyph } from './glyphs.ts';
import { NoiseWindow, Stamp, StampTool } from './stampPieces.tsx';
import ciphers from '../data/ciphers.json';

export { frameState };
export type { StoryProps };

const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

/** Card text: 44 slots in two rows of 22, as the hook's card. */
const SLOTS = 22;
const fit44 = (s: string) => clip(s, SLOTS * 2).padEnd(SLOTS * 2, ' ');
const CODES = STORY_CODES.map((k) => fit44((ciphers.ciphers as Record<string, string>)[k] ?? ''));
const B64 = fit44(ciphers.ciphers.base64);
const textOf = (i: number) => (i < 0 ? B64 : CODES[i]);

const Y = { laptop: 0, card0: 70, card: 262, cardH: 196, chip: 560, grader: 712, tool: 896 };
const CARD_W = 840;
const GRADER_W = 560;

/** My laptop: a screen of flickering code over a keyboard base, drawn in the brand tokens. */
const Laptop: React.FC<{ t: number; w: number }> = ({ t, w }) => {
  const h = w * 0.56;
  return (
    <div style={{ position: 'relative', width: w, height: h + 26 }}>
      <div
        style={{
          width: w * 0.86,
          height: h,
          margin: '0 auto',
          borderRadius: 18,
          background: C.bg0,
          border: `5px solid ${alpha(C.accentText, 0.7)}`,
          boxShadow: `0 0 40px ${alpha(C.accent, 0.35)}`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 6,
          overflow: 'hidden',
        }}
      >
        {[0, 1, 2].map((r) => (
          <div key={r} style={{ display: 'flex', fontSize: 30, fontWeight: 700, color: alpha(C.accentText, 0.85), lineHeight: 1.1 }}>
            {Array.from({ length: 12 }, (_, i) => (
              <span key={i} style={{ display: 'inline-block', width: 19, textAlign: 'center' }}>
                {noiseGlyph(i + r * 17, t, 41, 6)}
              </span>
            ))}
          </div>
        ))}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          bottom: 0,
          width: w,
          height: 26,
          borderRadius: '6px 6px 18px 18px',
          background: `linear-gradient(180deg, ${alpha(C.accentText, 0.55)}, ${alpha(C.accent2, 0.45)})`,
          border: `3px solid ${alpha(C.text, 0.6)}`,
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
};

export const StoryBench: React.FC<AnimProps & StoryProps> = ({ t, beats, dur, vertical, ...props }) => {
  const s = frameState(props, t, beats, dur);
  const { w: W } = stageOf(vertical);
  const cx = W / 2;
  const from = textOf(s.code.from);
  const to = textOf(s.code.to);
  const glyphs = morph(from, to, s.code.p, t, 0.5, 31 + s.code.from);
  const rows = [glyphs.slice(0, SLOTS), glyphs.slice(SLOTS)];
  const cardTop = lerp(Y.card0, Y.card, s.card.drop);
  const cardScale = lerp(0.42, 1, s.card.drop);
  const benchDim = 1 - 0.55 * s.chip.dim;
  return (
    <Stage vertical={vertical} fill>
      {/* my laptop, where the test messages come from */}
      <div style={{ position: 'absolute', left: cx - 190, top: Y.laptop, opacity: s.laptop.appear * (1 - 0.55 * s.laptop.dim), transform: `translateY(${(1 - s.laptop.appear) * -20}px)` }}>
        <Laptop t={t} w={380} />
      </div>
      <div style={{ position: 'absolute', left: 0, top: 70, opacity: s.laptop.appear * benchDim }}>
        <Pill size={30} outline>
          my experiment
        </Pill>
      </div>
      {/* more test messages behind the one in front */}
      {[1, 0].map((k) => (
        <div
          key={k}
          style={{
            position: 'absolute',
            left: cx - CARD_W / 2 + (k ? 26 : -22),
            top: Y.card - (k ? 30 : 16),
            opacity: s.stack.appear * 0.45 * benchDim,
            transform: `rotate(${k ? 3 : -2.5}deg)`,
          }}
        >
          <Card w={CARD_W} h={Y.cardH}>
            <div />
          </Card>
        </div>
      ))}
      {/* the coded message, cycling through codes the model was never taught */}
      <div
        style={{
          position: 'absolute',
          left: cx - CARD_W / 2,
          top: cardTop,
          opacity: s.card.appear,
          transform: `translateX(${s.echo.shake * 12}px) scale(${cardScale})`,
          transformOrigin: 'center top',
        }}
      >
        <Card w={CARD_W} h={Y.cardH} glow={s.card.glow}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {rows.map((g, i) => (
              <GlyphLine key={i} glyphs={g} size={46} />
            ))}
          </div>
        </Card>
      </div>
      {/* the hook's stamp, small: this is that string */}
      <div style={{ position: 'absolute', left: cx - CARD_W / 2 + 20, top: Y.card - 34 }}>
        <Stamp label="self-harm · medium" size={30} rot={-6} s={s.echo} />
      </div>
      <div style={{ position: 'absolute', right: 10, top: Y.card - 46, opacity: s.tag.pop, transform: `scale(${0.7 + 0.3 * s.tag.pop}) rotate(3deg)` }}>
        <Pill size={32}>one of my tests</Pill>
      </div>
      {/* arrow down to the model */}
      <svg width={60} height={84} style={{ position: 'absolute', left: cx - 30, top: Y.card + Y.cardH + 10, opacity: s.chip.appear * benchDim }}>
        <path d="M30 4 V64 M12 48 L30 70 L48 48" fill="none" stroke={alpha(C.accentText, 0.9)} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div style={{ opacity: s.chip.appear }}>
        <Chip x={cx - 170} y={Y.chip} w={340} h={112} label={['AI model']} size={44} dim={s.chip.dim * 0.8} />
      </div>
      {/* can it read it? */}
      <div
        style={{
          position: 'absolute',
          left: cx + 200,
          top: Y.chip - 70,
          width: 112,
          height: 112,
          borderRadius: 999,
          background: alpha(C.bg0, 0.9),
          border: `4px solid ${alpha(C.accentText, 0.6 + 0.4 * s.bubble.pulse)}`,
          boxShadow: `0 0 ${20 + 20 * s.bubble.pulse}px ${alpha(C.accent, 0.45)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 76,
          fontWeight: 900,
          color: C.text,
          opacity: s.bubble.pop,
          transform: `scale(${0.5 + 0.5 * s.bubble.pop})`,
        }}
      >
        ?
      </div>
      {/* my AI grader: it cannot read the reply either, and stamps it anyway (centred) */}
      <div style={{ position: 'absolute', left: cx - GRADER_W / 2, top: Y.grader, opacity: s.grader.appear, transform: `translateY(${(1 - s.grader.appear) * 30}px)` }}>
        <div style={{ transform: `translateX(${s.stamp.shake * 10}px)` }}>
          <NoiseWindow w={GRADER_W} h={170} t={t} label="what my grader sees" rows={2} cols={13} seed={61} size={38} glow={s.grader.read * (1 - s.stamp.pop)} />
        </div>
        <div style={{ position: 'absolute', left: 0, top: 62, width: GRADER_W, display: 'flex', justifyContent: 'center' }}>
          <Stamp label="garbled" size={52} rot={-8} s={s.stamp} />
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, width: W, top: Y.tool, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22, opacity: s.grader.appear }}>
        <StampTool size={100} press={s.grader.press} lit={s.grader.press} />
        <div style={{ fontSize: 40, fontWeight: 800, whiteSpace: 'nowrap' }}>my AI grader</div>
      </div>
    </Stage>
  );
};
