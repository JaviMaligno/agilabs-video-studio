import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import { FPS, sceneStarts } from '../timing.ts';
import { cardState, cardTrack, splitQ } from '../anim/QuestionCard.state.ts';
import type { Scene } from '../types.ts';

/** Where the card sits (vertical): under the AGILabs badge, above every scene's content. */
export const CARD_BOX = { left: 60, top: 236, w: 960, h: 128 } as const;

const TONE = { ok: C.ok, warm: C.warm, muted: C.muted, bad: C.marker } as const;

/**
 * The question card, drawn once over the whole video (outside the scene transitions), so it stays
 * fixed while the scenes under it change. "Failure 1 · a dependency…" is drawn as a small kicker
 * over the main line. The stamp hangs off the right edge so it never covers the question. Vertical
 * only.
 */
export const QuestionCard: React.FC<{ scenes: Scene[]; vertical: boolean }> = ({ scenes, vertical }) => {
  const frame = useCurrentFrame();
  const track = React.useMemo(() => {
    const { starts } = sceneStarts(scenes);
    return cardTrack(scenes, starts.map((f) => f / FPS));
  }, [scenes]);
  if (!vertical) return null;
  const s = cardState(track, frame / FPS);
  if (s.opacity <= 0) return null;
  const st = s.stamp;
  const { kicker, main } = splitQ(s.text);
  return (
    <div
      style={{
        position: 'absolute',
        left: CARD_BOX.left,
        top: CARD_BOX.top,
        width: CARD_BOX.w,
        height: CARD_BOX.h,
        opacity: s.opacity,
        borderRadius: 24,
        background: alpha(C.card, 0.96),
        border: `3px solid ${alpha(C.accentText, 0.55)}`,
        boxShadow: `0 12px 40px ${alpha(C.bg0, 0.6)}`,
        fontFamily,
        color: C.text,
        zIndex: 5,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 40,
          right: 40,
          top: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          opacity: s.textIn,
          transform: `translateY(${(1 - s.textIn) * 18}px)`,
        }}
      >
        {kicker && (
          <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.accentText, lineHeight: 1.1 }}>{kicker}</div>
        )}
        <div style={{ fontSize: kicker ? 50 : 58, fontWeight: 800, letterSpacing: '-0.02em', whiteSpace: 'nowrap', lineHeight: 1.12 }}>{main}</div>
      </div>
      {st && st.pop > 0 && (
        <div
          style={{
            position: 'absolute',
            right: 18,
            bottom: -46,
            padding: '6px 20px',
            border: `5px solid ${TONE[st.tone]}`,
            borderRadius: 14,
            color: TONE[st.tone],
            background: alpha(C.bg0, 0.92),
            fontSize: st.text.length > 4 ? 46 : 54,
            fontWeight: 800,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            lineHeight: 1.05,
            whiteSpace: 'nowrap',
            opacity: Math.min(1, st.pop * 1.4),
            transform: `rotate(-7deg) scale(${interpolate(st.pop, [0, 1], [1.8, 1])})`,
          }}
        >
          {st.text}
        </div>
      )}
    </div>
  );
};
