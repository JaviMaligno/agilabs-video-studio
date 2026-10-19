import React from 'react';
import { C, GRADIENT, alpha } from '../brand.ts';
import { Stage, gradientText } from './Stage.tsx';
import type { AnimProps } from './types.ts';
import { LAYOUT, frameState, wallRows, type EchoChatProps } from './EchoChat.state.ts';
import { BURST, HELLO3 } from './rep.ts';
import { SEED } from './ShellChips.state.ts';
import { CoreChip, EmojiText, Gauge, ModelTag, ReplyBubble, SpiralText, UserBubble } from './pieces.tsx';
import { spiralWords } from './spiral.ts';

const FONT = 36;
const bubbleWidth = (text: string, size = FONT) => Array.from(text).length * size * 0.56 + size * 1.24;

/** The stacked wall: full bubbles at the bottom, stripes above, right-aligned. */
const Wall: React.FC<{ stimulus: string; level: number; maxH: number; top: number; right?: number; opacity?: number; size?: number; stripeW?: number }> = ({
  stimulus,
  level,
  maxH,
  top,
  right = 0,
  opacity = 1,
  size = FONT,
  stripeW,
}) => {
  const bubbleH = Math.round(size * 2.17);
  const { rows } = wallRows(level, maxH, bubbleH);
  const w = bubbleWidth(stimulus, size);
  const sw = stripeW ?? w;
  return (
    <div style={{ position: 'absolute', top, right, width: Math.max(w, sw), height: maxH, opacity }}>
      {rows.map((r, i) =>
        r.text ? (
          <div key={i} style={{ position: 'absolute', top: r.y, right: 0, opacity: r.opacity }}>
            <UserBubble text={stimulus} size={size} style={{ height: r.h, display: 'flex', alignItems: 'center', boxSizing: 'border-box' }} />
          </div>
        ) : (
          <div key={i} style={{ position: 'absolute', top: r.y, right: 0, width: sw, height: r.h, borderRadius: Math.min(r.h / 2, 30), background: GRADIENT, opacity: r.opacity }} />
        ),
      )}
    </div>
  );
};

const Tag: React.FC<{ text: string; pop: number; size?: number }> = ({ text, pop, size = 104 }) => (
  <div style={{ fontSize: size, fontWeight: 800, lineHeight: 1, transform: `scale(${0.85 + 0.15 * pop})`, transformOrigin: 'left top', ...gradientText }}>{text}</div>
);

/** Deterministic confetti in the accent colours. */
const Confetti: React.FC<{ p: number; cx: number; cy: number }> = ({ p, cx, cy }) => {
  if (p <= 0) return null;
  const pieces = Array.from({ length: 90 }, (_, i) => {
    const a = (i * 137.5 * Math.PI) / 180;
    const sp = 220 + ((i * 53) % 330);
    const d = sp * Math.min(1, p * 1.6);
    return {
      x: cx + Math.cos(a) * d,
      y: cy + Math.sin(a) * d * 0.8 + 260 * p * p,
      rot: i * 47 + p * 540,
      c: [C.accent, C.accent2, C.accentText, C.text][i % 4],
      w: 16 + (i % 3) * 8,
    };
  });
  return (
    <>
      {pieces.map((q, i) => (
        <div key={i} style={{ position: 'absolute', left: q.x, top: q.y, width: q.w, height: q.w * 0.5, background: q.c, borderRadius: 2, transform: `rotate(${q.rot}deg)`, opacity: Math.max(0, 1 - Math.max(0, p - 0.55) / 0.45) }} />
      ))}
    </>
  );
};

/** Typing reveal of a string by progress. */
const typed = (text: string, p: number) => {
  const chars = Array.from(text);
  return chars.slice(0, Math.round(chars.length * Math.max(0, Math.min(1, p)))).join('');
};

export const EchoChat: React.FC<AnimProps & EchoChatProps> = ({ t, beats, dur, vertical, ...p }) => {
  const s = frameState(p, t, beats, dur);
  const opus = s.model === 'Claude Opus';

  if (p.mode === 'split') {
    const words = spiralWords({ words: ['what time is it?'], cx: 715, cy: 790, R: 235, t, turns: 2.8, perTurn: 4.6, grow: s.split.progress, maxSize: 34 });
    return (
      <Stage vertical={vertical} fill style={{ opacity: s.appear }}>
        <div style={{ position: 'absolute', left: 0, top: 30 }}>
          <Tag text={s.tag} pop={1} size={84} />
        </div>
        <Wall stimulus={s.stimulus} level={3} maxH={330} top={LAYOUT.wallTop} />
        <div style={{ position: 'absolute', left: 480, top: 430, width: 2, height: 620, background: alpha(C.muted, 0.35) }} />
        {/* Left: the flat polite line. */}
        <div style={{ position: 'absolute', left: 0, top: 470, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 120 }}>
          <ModelTag label="Claude Sonnet" shell seed={SEED.sonnet} size={110} />
          <ReplyBubble text={s.reply.text} size={44} />
        </div>
        {/* Right: the spiral. */}
        <div style={{ position: 'absolute', left: 520, top: 440 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <CoreChip size={80} seed={SEED.qwen} shell={0} />
            <div style={{ fontSize: 28, fontWeight: 600, color: C.muted }}>Qwen 7B Base</div>
          </div>
        </div>
        <SpiralText words={words} />
      </Stage>
    );
  }

  const { height } = wallRows(s.level, s.wallH);
  const wallTop = LAYOUT.wallTop;
  const replyTop = wallTop + height + 60;
  const showGauge = s.gauge.opacity > 0 && p.mode !== 'burst' && p.mode !== 'wall';
  const z = s.gauge.zoom;

  return (
    <Stage vertical={vertical} fill style={{ opacity: s.appear }}>
      {p.mode === 'wall' ? (
        <>
          <Wall stimulus={s.stimulus} level={s.level} maxH={s.wallH} top={0} size={60} stripeW={960} />
          <div style={{ position: 'absolute', left: 0, bottom: 20 }}>
            <Tag text={s.tag} pop={s.tagPop} size={150} />
            <div style={{ fontSize: 36, fontWeight: 600, color: C.muted, marginTop: 10 }}>repeats</div>
          </div>
        </>
      ) : (
        <>
          <div style={{ position: 'absolute', left: 0, top: 30 }}>
            <Tag text={s.tag} pop={s.tagPop} />
          </div>
          <Wall stimulus={s.stimulus} level={s.level} maxH={s.wallH} top={wallTop} />
        </>
      )}

      {p.mode !== 'wall' && (
        <div style={{ position: 'absolute', left: 0, top: replyTop, display: 'flex', alignItems: 'flex-start', gap: 18 }}>
          <ModelTag label={s.model} shell={s.shell} seed={opus ? SEED.opus : SEED.sonnet} size={100} />
          {!opus || s.burst.progress <= 0 ? (
            <div style={{ opacity: s.reply.opacity, transform: `scale(${s.reply.scale})`, transformOrigin: 'left top' }}>
              <ReplyBubble text={s.reply.text} lines={s.reply.lines} maxWidth={760} t={t} />
            </div>
          ) : null}
        </div>
      )}

      {opus && s.burst.progress > 0 && (
        <>
          <Confetti p={s.burst.progress} cx={480} cy={replyTop + 140} />
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: replyTop - 20,
              padding: '34px 30px',
              borderRadius: 34,
              background: C.bubble,
              border: `3px solid ${alpha(C.accent2, 0.8)}`,
              boxShadow: `0 0 60px ${alpha(C.accent2, 0.35)}`,
              transform: `scale(${0.7 + 0.3 * Math.min(1, s.burst.big * 1.4)})`,
              transformOrigin: 'left top',
              opacity: Math.min(1, s.burst.big * 2),
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 80, fontWeight: 800, color: C.text, minHeight: 96, whiteSpace: 'nowrap' }}>
              <EmojiText text={typed(BURST.big, s.burst.big)} size={72} />
            </div>
            <div style={{ fontSize: 56, fontWeight: 800, marginTop: 12, minHeight: 68, ...gradientText }}>{typed(BURST.sub, s.burst.sub)}</div>
            <div style={{ fontSize: 40, fontWeight: 500, color: C.text, marginTop: 18, lineHeight: 1.3, opacity: s.burst.empire > 0 ? 1 : 0, minHeight: 104 }}>
              <EmojiText text={typed(BURST.empire, s.burst.empire)} size={40} />
            </div>
          </div>
        </>
      )}

      {showGauge && (
        <div
          style={{
            position: 'absolute',
            // Resting: w 200 at stage x 680-880 (frame 740-940), clear of the hello inset (ends 684)
            // and of the platform action rail (frame x > 940 from y 840). Zoomed: same size and
            // place as before (403 px wide at x 240).
            left: 680 - 440 * z,
            top: 820 - 130 * z,
            transform: `scale(${1 + 1.015 * z})`,
            transformOrigin: 'left top',
            opacity: s.gauge.opacity,
          }}
        >
          <Gauge value={s.gauge.value} w={200} id={`echo-${p.mode}`} />
          {s.gauge.tick > 0 && (
            <div
              style={{
                position: 'absolute',
                left: 198,
                top: 38,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                opacity: s.gauge.tick,
                transform: `scale(${0.6 + 0.4 * s.gauge.tick})`,
                transformOrigin: 'left center',
              }}
            >
              <svg width={43} height={43} viewBox="0 0 56 56">
                <circle cx={28} cy={28} r={26} fill={alpha(C.accent, 0.25)} stroke={C.accentText} strokeWidth={3} />
                <path d="M16 29 L25 38 L41 19" stroke={C.accentText} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ fontSize: 34, fontWeight: 800, color: C.accentText }}>fine</span>
            </div>
          )}
        </div>
      )}

      {s.inset.opacity > 0 && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 700,
            width: 640,
            padding: 22,
            borderRadius: 26,
            background: alpha(C.bg1, 0.96),
            border: `2px solid ${alpha(C.accentText, 0.5)}`,
            boxShadow: `0 10px 40px ${alpha(C.bg0, 0.8)}`,
            opacity: s.inset.opacity,
            transform: `translateY(${(1 - s.inset.opacity) * 30}px)`,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 12 }}>
            {[0, 1, 2].map((i) => (
              <UserBubble key={i} text="hello" size={28} />
            ))}
          </div>
          <ReplyBubble text={HELLO3} size={31} lines={4} maxWidth={596} />
        </div>
      )}
    </Stage>
  );
};
