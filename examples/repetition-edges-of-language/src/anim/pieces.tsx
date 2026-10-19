// Shared drawing pieces for this video: emoji-aware text, chat bubbles, model chips (core + glossy
// shell, with a peel), the repetition gauge and a word spiral. Brand tokens only.
import React from 'react';
import { Img, staticFile } from 'remotion';
import { C, GRADIENT, alpha } from '../brand.ts';
import { EMOJI, splitEmoji } from './rep.ts';
import { coreCells } from './ShellChips.state.ts';
import type { SpiralWord } from './spiral.ts';

/** Text with emoji drawn from public/emoji at text height. */
export const EmojiText: React.FC<{ text: string; size: number }> = ({ text, size }) => (
  <>
    {splitEmoji(text).map((r, i) =>
      r.emoji ? (
        <Img key={i} src={staticFile(EMOJI[r.s])} style={{ width: size * 1.05, height: size * 1.05, verticalAlign: '-0.18em', margin: '0 0.06em' }} />
      ) : (
        <React.Fragment key={i}>{r.s}</React.Fragment>
      ),
    )}
  </>
);

/** A user bubble (right side): the accent gradient. */
export const UserBubble: React.FC<{ text: string; size?: number; style?: React.CSSProperties }> = ({ text, size = 36, style }) => (
  <div
    style={{
      background: GRADIENT,
      color: C.text,
      fontSize: size,
      fontWeight: 600,
      padding: `${size * 0.36}px ${size * 0.62}px`,
      borderRadius: size * 0.8,
      borderBottomRightRadius: size * 0.2,
      whiteSpace: 'nowrap',
      boxShadow: `0 6px 24px ${alpha(C.accent, 0.25)}`,
      ...style,
    }}
  >
    <EmojiText text={text} size={size} />
  </div>
);

/** A model reply bubble (left side): dark card. Empty text = a typing indicator. */
export const ReplyBubble: React.FC<{ text: string; size?: number; lines?: number; maxWidth?: number; style?: React.CSSProperties; t?: number }> = ({
  text,
  size = 36,
  lines = 1,
  maxWidth = 760,
  style,
  t = 0,
}) => (
  <div
    style={{
      background: C.bubble,
      border: `2px solid ${C.line}`,
      color: C.text,
      fontSize: size,
      fontWeight: 500,
      lineHeight: 1.3,
      padding: `${size * 0.42}px ${size * 0.62}px`,
      borderRadius: size * 0.8,
      borderBottomLeftRadius: size * 0.2,
      maxWidth,
      ...style,
    }}
  >
    {text ? (
      <div style={{ display: '-webkit-box', WebkitLineClamp: lines, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        <EmojiText text={text} size={size} />
      </div>
    ) : (
      <div style={{ display: 'flex', gap: size * 0.3, padding: `${size * 0.2}px 0` }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{ width: size * 0.36, height: size * 0.36, borderRadius: '50%', background: C.muted, opacity: 0.35 + 0.65 * Math.max(0, Math.sin(t * 7 - i * 0.9)) }}
          />
        ))}
      </div>
    )}
  </div>
);

/** Clip polygon (percent) of what stays of the shell when it is peeled from the top-right corner. */
const keptPolygon = (peel: number): string => {
  const c = Math.max(0, Math.min(2.05, peel * 2.05)) * 100;
  if (c <= 100) return `polygon(0% 0%, ${100 - c}% 0%, 100% ${c}%, 100% 100%, 0% 100%)`;
  if (c >= 200) return 'polygon(0% 100%, 0% 100%, 0% 100%)';
  return `polygon(0% ${c - 100}%, ${200 - c}% 100%, 0% 100%)`;
};

/** The peeled-off part, reflected over the cut line (the back of the film), in percent. */
const flapPolygon = (peel: number): string => {
  const c = Math.max(0, Math.min(2.05, peel * 2.05)) * 100;
  // Removed region in (x' = 100 - x, y) coordinates, then reflected: (x', y) -> (c - y, c - x').
  const removed: [number, number][] =
    c <= 100
      ? [
          [0, 0],
          [c, 0],
          [0, c],
        ]
      : [
          [0, 0],
          [100, 0],
          [100, c - 100],
          [c - 100, 100],
          [0, 100],
        ];
  return `polygon(${removed.map(([xp, y]) => `${100 - (c - y)}% ${c - xp}%`).join(', ')})`;
};

/** A model chip: a core with a token-grid glyph, and for aligned models a glossy shell around it. */
export const CoreChip: React.FC<{ size: number; seed: number; shell: number; peel?: number; flapFall?: number; glow?: number }> = ({
  size,
  seed,
  shell,
  peel = 0,
  flapFall = 0,
  glow = 0,
}) => {
  const cells = coreCells(seed);
  const inset = size * 0.13;
  const radius = size * 0.2;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      {shell > 0 && (
        <>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: radius,
              background: `linear-gradient(135deg, ${alpha(C.accentText, 0.95)}, ${alpha(C.accent, 0.9)} 45%, ${alpha(C.accent2, 0.95)})`,
              clipPath: keptPolygon(peel),
              boxShadow: `0 0 ${size * 0.15}px ${alpha(C.accent, 0.35)}`,
              opacity: shell,
            }}
          >
            <div style={{ position: 'absolute', inset: 0, borderRadius: radius, background: `linear-gradient(160deg, ${alpha('#ffffff', 0.45)}, transparent 38%)` }} />
          </div>
          {peel > 0 && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: radius,
                background: `linear-gradient(135deg, ${alpha('#ffffff', 0.85)}, ${alpha(C.accentText, 0.9)} 60%, ${alpha(C.accent2, 0.9)})`,
                filter: `drop-shadow(0 ${size * 0.03}px ${size * 0.05}px ${alpha(C.bg0, 0.8)})`,
                clipPath: flapPolygon(peel),
                transform: `translate(${-flapFall * size * 0.25}px, ${flapFall * size * 1.3}px) rotate(${-flapFall * 25}deg)`,
                opacity: 1 - flapFall,
              }}
            />
          )}
        </>
      )}
      <div
        style={{
          position: 'absolute',
          inset,
          borderRadius: radius * 0.7,
          background: C.card,
          border: `2px solid ${C.line}`,
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: size * 0.025,
          padding: size * 0.07,
          boxShadow: glow ? `0 0 ${size * 0.2}px ${alpha(C.accentText, 0.4 * glow)}` : undefined,
        }}
      >
        {cells.map((on, i) => (
          <div key={i} style={{ borderRadius: size * 0.02, background: on ? alpha(C.accentText, 0.85) : alpha(C.muted, 0.12) }} />
        ))}
      </div>
    </div>
  );
};

/** Small chip with its label underneath, for chat rows. */
export const ModelTag: React.FC<{ label: string; shell: boolean; seed: number; size?: number }> = ({ label, shell, seed, size = 104 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, width: size * 1.7 }}>
    <CoreChip size={size} seed={seed} shell={shell ? 1 : 0} />
    <div style={{ fontSize: 26, fontWeight: 600, color: C.muted, textAlign: 'center', lineHeight: 1.15 }}>{label}</div>
  </div>
);

/** Half-circle repetition gauge, 0 → 1, calm accent on the left, hot on the right. */
export const Gauge: React.FC<{ value: number; w: number; label?: string; caption?: string; id: string; valueSize?: number }> = ({
  value,
  w,
  label,
  caption = 'repetition',
  id,
  valueSize,
}) => {
  const v = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
  const r = w * 0.42;
  const cx = w / 2;
  const cy = r + w * 0.06;
  const sw = w * 0.07;
  const ang = Math.PI * (1 - v);
  const nx = cx + r * 0.86 * Math.cos(ang);
  const ny = cy - r * 0.86 * Math.sin(ang);
  return (
    <div style={{ width: w, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={w} height={cy + sw} viewBox={`0 0 ${w} ${cy + sw}`}>
        <defs>
          <linearGradient id={`g-${id}`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor={C.accentText} />
            <stop offset="0.55" stopColor={C.accent2} />
            <stop offset="1" stopColor={C.hot} />
          </linearGradient>
        </defs>
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} stroke={`url(#g-${id})`} strokeWidth={sw} fill="none" strokeLinecap="round" opacity={0.9} />
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={C.text} strokeWidth={w * 0.025} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={w * 0.04} fill={C.text} />
      </svg>
      {label ? (
        <div style={{ fontSize: valueSize ?? w * 0.2, fontWeight: 800, color: v > 0.45 ? C.hot : C.accentText, marginTop: -w * 0.02, lineHeight: 1 }}>{label}</div>
      ) : null}
      <div style={{ fontSize: Math.max(24, w * 0.1), fontWeight: 600, color: C.muted, marginTop: 6 }}>{caption}</div>
    </div>
  );
};

/** Reading angle: words in the lower half are turned to read upright; a lone emoji stays upright. */
const uprightAngle = (w: SpiralWord): number => {
  if (EMOJI[w.text]) return 0;
  const a = ((w.angle % 360) + 360) % 360;
  return a > 90 && a < 270 ? a - 180 : a;
};

/** Words of a spiral, absolutely positioned (stage coordinates). */
export const SpiralText: React.FC<{ words: SpiralWord[]; opacity?: number; color?: string }> = ({ words, opacity = 1, color = C.text }) => (
  <>
    {words.map((w, i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: w.x,
          top: w.y,
          transform: `translate(-50%, -50%) rotate(${uprightAngle(w)}deg)`,
          fontSize: w.size,
          fontWeight: 700,
          whiteSpace: 'nowrap',
          color,
          opacity: w.opacity * opacity,
          textShadow: `0 0 ${Math.max(2, w.size * 0.3)}px ${alpha(C.accent2, 0.6)}`,
        }}
      >
        <EmojiText text={w.text} size={w.size} />
      </div>
    ))}
  </>
);
