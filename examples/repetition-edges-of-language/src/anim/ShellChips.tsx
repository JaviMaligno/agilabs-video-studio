import React from 'react';
import { C, GRADIENT, alpha } from '../brand.ts';
import { Stage, gradientText } from './Stage.tsx';
import type { AnimProps } from './types.ts';
import { frameState, type ShellChipsProps } from './ShellChips.state.ts';
import { CoreChip, SpiralText, UserBubble } from './pieces.tsx';
import { spiralWords } from './spiral.ts';
import { SEEDS } from './rep.ts';

const Label: React.FC<{ text: string; size?: number; color?: string }> = ({ text, size = 34, color = C.text }) => (
  <div style={{ fontSize: size, fontWeight: 700, color, textAlign: 'center', whiteSpace: 'nowrap' }}>{text}</div>
);

export const ShellChips: React.FC<AnimProps & ShellChipsProps> = ({ t, beats, dur, vertical, ...p }) => {
  const s = frameState(p, t, beats, dur);

  if (p.mode === 'cutaway') {
    const c = s.cut;
    const words = spiralWords({ words: [SEEDS.table], cx: 480, cy: 700, R: 240, t, turns: 3, perTurn: 7, maxSize: 44 });
    const shimmer = (t * 0.6) % 1;
    return (
      <Stage vertical={vertical} fill>
        <div style={{ position: 'absolute', inset: 0, opacity: c.appear, transform: `scale(${0.85 + 0.15 * c.appear})`, transformOrigin: '50% 60%' }}>
          {/* The core, cut open. */}
          <div
            style={{
              position: 'absolute',
              left: 40,
              right: 40,
              top: 380,
              height: 640,
              borderRadius: '0 0 60px 60px',
              background: `linear-gradient(180deg, ${C.card}, ${C.bg1})`,
              border: `2px solid ${C.line}`,
              borderTop: 'none',
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(${alpha(C.muted, 0.18)} 2px, transparent 2.5px)`, backgroundSize: '36px 36px' }} />
          </div>
          <SpiralText words={words.map((w) => ({ ...w, y: w.y }))} opacity={0.32 + 0.38 * c.spiral} color={C.accentText} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: 960, opacity: 0.5 + 0.5 * c.spiral }}>
            <Label text="raw statistics" size={36} color={C.muted} />
          </div>
          {/* The shell: a hair-thin shimmering film over the whole core. */}
          <div
            style={{
              position: 'absolute',
              left: 40,
              right: 40,
              top: 376,
              height: 5,
              borderRadius: 3,
              background: `linear-gradient(90deg, ${C.accent}, ${C.accentText} ${shimmer * 100 - 8}%, #ffffff ${shimmer * 100}%, ${C.accentText} ${shimmer * 100 + 8}%, ${C.accent2})`,
              boxShadow: `0 0 18px ${alpha(C.accentText, 0.7)}`,
              transform: `scaleX(${c.film})`,
            }}
          />
          {/* Labels for the film. */}
          <div style={{ position: 'absolute', left: 0, right: 0, top: 90, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
            <Label text="the “assistant”" size={46} color={C.muted} />
            <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.05, opacity: c.label, transform: `translateY(${(1 - c.label) * 16}px)`, ...gradientText }}>a thin layer</div>
          </div>
          <svg style={{ position: 'absolute', left: 470, top: 300 }} width={20} height={70}>
            <path d="M10 0 L10 60 M2 50 L10 62 L18 50" stroke={C.accentText} strokeWidth={4} fill="none" strokeLinecap="round" opacity={c.label} />
          </svg>
        </div>
      </Stage>
    );
  }

  if (p.mode === 'roster') {
    return (
      <Stage vertical={vertical} fill>
        {s.chips.map((c, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: c.x - c.size / 2,
              top: c.y - c.size / 2,
              opacity: c.appear * (1 - c.dim),
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 18,
              width: c.size,
            }}
          >
            <CoreChip size={c.size} seed={c.seed} shell={c.shell} glow={i >= 2 ? s.link : 0} />
            <Label text={c.label} size={36} />
            <div style={{ fontSize: 28, fontWeight: 600, color: c.shell ? C.accentText : C.muted }}>{c.shell ? 'aligned' : 'no alignment'}</div>
          </div>
        ))}
        {/* "same weights": a bracket under the two Qwen chips. */}
        <svg style={{ position: 'absolute', left: 0, top: 0, opacity: s.link }} width={960} height={1090}>
          <path d="M 250 958 L 250 985 L 710 985 L 710 958" stroke={C.accentText} strokeWidth={4} fill="none" strokeDasharray="6 10" strokeLinecap="round" />
        </svg>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 1000, display: 'flex', justifyContent: 'center', opacity: s.link }}>
          <div style={{ padding: '8px 26px', borderRadius: 999, border: `2px dashed ${C.accentText}`, fontSize: 36, fontWeight: 700, color: C.accentText, background: alpha(C.bg0, 0.8) }}>
            same weights
          </div>
        </div>
      </Stage>
    );
  }

  // peel
  const c = s.chips[0];
  const streamText = Array.from({ length: Math.max(1, s.streamWords) }, () => SEEDS.table).join(' ');
  return (
    <Stage vertical={vertical} fill style={{ overflow: 'hidden' }}>
      {/* The wall comes down on it. */}
      <div style={{ position: 'absolute', right: 0, top: -560 + 600 * s.wall, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, opacity: s.wall }}>
        {Array.from({ length: 14 }, (_, i) => (
          <div key={i} style={{ height: i < 11 ? 12 : undefined, width: i < 11 ? 140 : undefined, borderRadius: 8, background: i < 11 ? GRADIENT : undefined, opacity: 0.4 + 0.05 * i }}>
            {i >= 11 ? <UserBubble text="table" /> : null}
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', left: c.x - c.size / 2, top: c.y - c.size / 2, width: c.size, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <CoreChip size={c.size} seed={c.seed} shell={c.shell} peel={c.peel} flapFall={s.flapFall} />
        <div style={{ position: 'relative', height: 50, width: 420 }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 1 - s.rename }}>
            <Label text="Qwen 7B Instruct" size={c.size > 300 ? 42 : 30} />
          </div>
          <div style={{ position: 'absolute', inset: 0, opacity: s.rename }}>
            <Label text="Qwen 7B Base" size={c.size > 300 ? 42 : 30} color={C.text} />
          </div>
        </div>
      </div>
      {/* Its reply opens and never closes. */}
      {s.stream > 0 && (
        <div
          style={{
            position: 'absolute',
            left: 270,
            top: 620,
            width: 690,
            height: 330,
            padding: '20px 26px',
            boxSizing: 'border-box',
            borderRadius: '30px 30px 0 8px',
            background: C.bubble,
            border: `2px solid ${C.line}`,
            borderBottom: 'none',
            overflow: 'hidden',
            fontSize: 38,
            fontWeight: 600,
            lineHeight: 1.35,
            color: C.text,
            opacity: Math.min(1, s.stream * 4),
            WebkitMaskImage: 'linear-gradient(180deg, black 70%, transparent)',
          }}
        >
          {streamText}
          <span style={{ display: 'inline-block', width: 4, height: 38, background: C.accentText, marginLeft: 6, verticalAlign: 'middle', opacity: Math.round(t * 3) % 2 }} />
        </div>
      )}
    </Stage>
  );
};
