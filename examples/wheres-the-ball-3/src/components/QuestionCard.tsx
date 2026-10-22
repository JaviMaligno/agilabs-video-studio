import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { C, GRADIENT, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import { FPS, sceneStarts } from '../timing.ts';
import { cardState, cardTrack, splitQ, type StampTone } from '../anim/QuestionCard.state.ts';
import { gradientText } from '../anim/Stage.tsx';
import type { Scene } from '../types.ts';

/** Where the band sits (vertical): under the AGILabs badge, above every scene's content. */
export const CARD_BOX = { left: 60, top: 236, w: 960, h: 128 } as const;

const stampStyle = (tone: StampTone): React.CSSProperties =>
  tone === 'ok'
    ? { border: `5px solid ${C.accent2}`, boxShadow: `0 0 34px ${alpha(C.accent, 0.45)}` }
    : tone === 'muted'
      ? { border: `5px solid ${C.muted}`, color: C.muted }
      : { border: `5px solid ${C.accentText}`, color: C.accentText, boxShadow: `0 0 34px ${alpha(C.accent, 0.55)}` };

/** Main-line font size: as large as fits the band on one line. */
const mainSize = (text: string, hasNum: boolean): number => {
  const room = 880 - (hasNum ? 96 : 0);
  return Math.max(40, Math.min(58, Math.floor(room / (Math.max(1, text.length) * 0.56))));
};

/**
 * The question band, drawn once over the whole video (outside the scene transitions), so it stays
 * fixed while the scenes under it change. "1 · geometry" is drawn as a numbered disc and the main
 * line. The stamp hangs off the bottom-right edge so it never covers the question. Vertical only.
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
  const size = mainSize(main, !!kicker);
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
          alignItems: 'center',
          gap: 26,
          opacity: s.textIn,
          transform: `translateY(${(1 - s.textIn) * 18}px)`,
        }}
      >
        {kicker && (
          <div
            style={{
              flex: 'none',
              width: 70,
              height: 70,
              borderRadius: 35,
              background: GRADIENT,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 42,
              fontWeight: 800,
              color: C.text,
            }}
          >
            {kicker}
          </div>
        )}
        <div style={{ fontSize: size, fontWeight: 800, letterSpacing: '-0.02em', whiteSpace: 'nowrap', lineHeight: 1.12 }}>{main}</div>
      </div>
      {st && st.pop > 0 && (
        <div
          style={{
            position: 'absolute',
            right: 18,
            bottom: -50,
            padding: '6px 22px',
            borderRadius: 14,
            background: alpha(C.bg0, 0.94),
            fontSize: 50,
            fontWeight: 800,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            lineHeight: 1.05,
            whiteSpace: 'nowrap',
            opacity: Math.min(1, st.pop * 1.4),
            transform: `rotate(-6deg) scale(${interpolate(st.pop, [0, 1], [1.8, 1])})`,
            ...stampStyle(st.tone),
          }}
        >
          <span style={st.tone === 'ok' ? gradientText : undefined}>{st.text}</span>
        </div>
      )}
    </div>
  );
};
