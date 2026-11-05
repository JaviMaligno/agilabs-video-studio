import React from 'react';
import { Img, staticFile } from 'remotion';
import { C, GRADIENT, alpha } from '../brand.ts';
import type { AnimProps } from './types.ts';
import { Stage, stageOf } from './Stage.tsx';
import { TXT, frameState, type ChatState, type QuestionChatProps } from './QuestionChat.state.ts';

export { frameState };
export type { QuestionChatProps };

// Story colours: amber for DeepSeek / the question, teal for the others / the instruction.
// Read from the brand when it carries them, with the series' values as a fallback.
const TOKENS = C as unknown as Record<string, string | undefined>;
const WARM = TOKENS.warm ?? '#fbbf24';
const OK = TOKENS.ok ?? '#2dd4bf';

const c01 = (x: number) => Math.min(1, Math.max(0, x));
const fadeUp = (o: number, dy = 24): React.CSSProperties => ({ opacity: c01(o), transform: `translateY(${(1 - c01(o)) * dy}px)` });
/** Back-out ease for a pop, from a [0, 1] progress. */
const popScale = (p: number) => {
  const x = c01(p);
  const k = 1.70158;
  return p <= 0 ? 0.6 : 1 + (k + 1) * (x - 1) ** 3 + k * (x - 1) ** 2;
};

/** The phone-style chat, in the stage's own box (936 x 1000 in vertical). */
const Chat: React.FC<{ s: ChatState; w: number }> = ({ s, w }) => {
  const b = s.bubble;
  const r = s.reply;
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: w, height: '100%' }}>
      {/* Phone panel */}
      <div
        style={{
          position: 'absolute',
          left: 20,
          right: 20,
          top: 0,
          bottom: 40,
          borderRadius: 48,
          background: alpha(C.bg1, 0.9),
          border: `2px solid ${alpha(C.muted, 0.22)}`,
        }}
      />
      {/* Header: the agent */}
      <div style={{ position: 'absolute', left: 60, right: 60, top: 26, height: 84, display: 'flex', alignItems: 'center', gap: 20, borderBottom: `2px solid ${alpha(C.muted, 0.15)}` }}>
        <Img src={staticFile('cast/robot-amber.png')} style={{ width: 64, height: 64, objectFit: 'contain' }} />
        <div style={{ fontSize: 34, fontWeight: 600, color: C.muted }}>{TXT.agent}</div>
      </div>
      {/* My bubble, right, typing in */}
      <div style={{ position: 'absolute', right: 60, top: 150, width: 640, display: 'flex', justifyContent: 'flex-end', ...fadeUp(b.appear) }}>
        <div style={{ background: GRADIENT, borderRadius: '36px 36px 8px 36px', padding: '26px 34px', fontSize: 40, fontWeight: 600, lineHeight: 1.3, color: C.text }}>
          <span>{TXT.ask.slice(0, b.typed)}</span>
          <span style={{ color: 'transparent' }}>{TXT.ask.slice(b.typed)}</span>
        </div>
      </div>
      {/* The agent's reply, left, with its avatar */}
      <div style={{ position: 'absolute', left: 50, top: 440, width: 800, display: 'flex', alignItems: 'flex-end', gap: 16, ...fadeUp(r.appear) }}>
        <Img src={staticFile('cast/robot-amber.png')} style={{ width: 84, height: 84, objectFit: 'contain', flexShrink: 0 }} />
        <div style={{ background: C.card, borderRadius: '36px 36px 36px 8px', padding: '28px 34px', border: `2px solid ${alpha(C.muted, 0.18)}`, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {TXT.items.map((it, i) => (
            <div key={i} style={{ fontSize: 38, fontWeight: 500, color: C.text, ...fadeUp(r.items[i].appear, 14) }}>
              {it}
            </div>
          ))}
          <div
            style={{
              marginTop: 10,
              fontSize: 42,
              fontWeight: 800,
              color: WARM,
              padding: '8px 16px',
              marginLeft: -16,
              borderRadius: 14,
              background: alpha(WARM, 0.14 * c01(r.offer.appear)),
              ...fadeUp(r.offer.appear, 14),
            }}
          >
            {TXT.offer}
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 150, top: 860, fontSize: 32, fontWeight: 500, fontStyle: 'italic', color: C.muted, ...fadeUp(r.tag.appear, 10) }}>
        {TXT.tag}
      </div>
    </div>
  );
};

/** The question that got an answer instead of a change, and how often it happened. */
export const QuestionChat: React.FC<AnimProps & QuestionChatProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const box = stageOf(p.vertical);
  const w = Math.min(box.w, 936);
  return (
    <Stage vertical={p.vertical} fill>
      <div style={{ position: 'absolute', left: (box.w - w) / 2, top: 0, width: w, height: box.h }}>
        <div style={{ position: 'absolute', inset: 0, opacity: s.chatOpacity }}>
          <Chat s={s.chat} w={w} />
        </div>
        {s.mode === 'count' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 70 }}>
            <div style={{ fontSize: 44, fontWeight: 700, color: C.text, textAlign: 'center', ...fadeUp(s.title.appear) }}>{TXT.title}</div>
            {s.figures.map((f, i) => {
              const col = f.tone === 'warm' ? WARM : OK;
              return (
                <div
                  key={i}
                  style={{
                    marginTop: i === 0 ? 70 : 60,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    opacity: c01(f.pop * 2),
                    transform: `scale(${popScale(f.pop)})`,
                  }}
                >
                  <div style={{ fontSize: 200, fontWeight: 800, lineHeight: 1, color: col, letterSpacing: '-0.03em' }}>{f.value}</div>
                  <div style={{ marginTop: 14, fontSize: 40, fontWeight: 600, color: col }}>{f.label}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Stage>
  );
};
