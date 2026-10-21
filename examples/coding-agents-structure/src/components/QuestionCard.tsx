import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import { FPS, sceneStarts } from '../timing.ts';
import { cardState, cardTrack } from '../anim/QuestionCard.state.ts';
import type { Scene } from '../types.ts';

/** Where the card sits (vertical): under the AGILabs badge, above every scene's content. */
export const CARD_BOX = { left: 60, top: 236, w: 960, h: 124 } as const;
/** Height the card grows by to hold the verdict stamp. */
export const STAMP_ROW = 130;

const TONE = { ok: C.ok, warm: C.warm, muted: C.muted } as const;

/**
 * The question card, drawn once over the whole video (outside the scene transitions), so it stays
 * fixed while the scenes under it change. Vertical only.
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
  // The verdict stamp lands on a second row: the card grows to hold it.
  const grow = st ? st.pop : 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: CARD_BOX.left,
        top: CARD_BOX.top,
        width: CARD_BOX.w,
        height: CARD_BOX.h + STAMP_ROW * grow,
        opacity: s.opacity,
        borderRadius: 24,
        background: alpha(C.card, 0.96),
        border: `3px solid ${alpha(C.accentText, 0.55)}`,
        boxShadow: `0 12px 40px ${alpha(C.bg0, 0.6)}`,
        fontFamily,
        color: C.text,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: CARD_BOX.h,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 56,
          fontWeight: 800,
          letterSpacing: '-0.02em',
          whiteSpace: 'nowrap',
          opacity: s.textIn,
          transform: `translateY(${(1 - s.textIn) * 18}px)`,
        }}
      >
        {s.text}
      </div>
      {st && st.pop > 0 && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: CARD_BOX.h - 8 + STAMP_ROW / 2,
            padding: '8px 26px',
            border: `6px solid ${TONE[st.tone]}`,
            borderRadius: 16,
            color: TONE[st.tone],
            background: alpha(C.bg0, 0.9),
            fontSize: 56,
            fontWeight: 800,
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
            lineHeight: 1.05,
            whiteSpace: 'nowrap',
            opacity: Math.min(1, st.pop * 1.4),
            transform: `translate(-50%, -50%) rotate(-4deg) scale(${interpolate(st.pop, [0, 1], [1.3, 1])})`,
          }}
        >
          {st.text}
        </div>
      )}
    </div>
  );
};
