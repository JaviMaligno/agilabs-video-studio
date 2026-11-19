// The trip chat: the cold open (the wrong booking already made), the fresh chat the next morning,
// and "save to memory" beside the app's Memory panel. See ChatTrip.state.ts.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { place } from './canvas.ts';
import { Bubble, ChatWindow, Collapsed, Divider, MemoryPanel, bubbleSize } from './chat.tsx';
import { BOOKING, CHAT_TITLE, NEW_CHAT_TITLE, CORRECTION, GOT_IT, GREETING, LATER, PANEL_NOTES, SAVE_LINE, frameState, type ChatTripProps } from './ChatTrip.state.ts';
import { Frame } from './office.tsx';

export { frameState };
export type { ChatTripProps };

/**
 * Layout (frame pixels), per format.
 * - landscape: the chat window centred in the stage, short enough that the cold-open hook panel
 *   (bottom ~760-960) never covers the booking; in `save` it moves left and the Memory panel sits
 *   at the right.
 * - vertical: the window fills the stage; in `save` the panel goes under it.
 */
const LAYOUT = {
  l: {
    win: { x: 470, y: 140, w: 980, h: 600 },
    size: 34,
    gap: 14,
    save: { win: { x: 180, y: 140, w: 930, h: 600 }, panel: { x: 1190, y: 230, w: 560, size: 32 }, size: 31 },
  },
  v: {
    win: { x: 100, y: 250, w: 840, h: 900 },
    size: 38,
    gap: 22,
    save: { win: { x: 100, y: 250, w: 840, h: 640 }, panel: { x: 100, y: 930, w: 840, size: 32 }, size: 31 },
  },
};

const HEAD = 70;

export const ChatTrip: React.FC<AnimProps & ChatTripProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const L = place(p.vertical, LAYOUT);
  const mode = p.mode ?? 'wrong';

  if (mode === 'save') {
    const W = L.save.win;
    const size = L.save.size;
    const inX = W.x + 36;
    const inR = W.x + W.w - 36;
    const maxW = W.w * 0.72;
    let y = W.y + HEAD + 24;
    const pre = { y, rows: 3 };
    y += 3 * 34 + 14;
    const corr = { y, h: bubbleSize(CORRECTION, size, maxW).h };
    y += corr.h + 14;
    const post = { y, rows: 2 };
    y += 2 * 34 + 14;
    const sentY = y;
    const P = L.save.panel;
    const dimOp = 1 - 0.65 * s.dim;
    return (
      <AbsoluteFill style={{ fontFamily }}>
        <Frame vertical={p.vertical} design="both">
          <ChatWindow
            x={W.x}
            y={W.y}
            w={W.w}
            h={W.h}
            title={CHAT_TITLE}
            morning={s.morning}
            cursor={s.cursor}
            draft={s.sent < 0.5 ? SAVE_LINE.slice(0, Math.ceil(SAVE_LINE.length * s.typed)) : ''}
            draftSize={size - 2}
          />
          <g opacity={dimOp}>
            <Collapsed x={inX} y={pre.y} w={inR - inX} rows={pre.rows} />
            <Bubble x={inR} y={corr.y} side="user" text={CORRECTION} size={size} maxW={maxW} />
            <Collapsed x={inX} y={post.y} w={inR - inX} rows={post.rows} />
          </g>
          <Bubble x={inR} y={sentY} side="user" text={SAVE_LINE} size={size} maxW={maxW} opacity={s.sent} lit={s.note.lit} />
          {/* the line goes into the Memory panel */}
          {s.note.opacity > 0 && (
            <path
              d={
                p.vertical
                  ? `M ${inR - 140} ${sentY + 70} C ${inR - 140} ${P.y - 40}, ${P.x + P.w / 2} ${P.y - 80}, ${P.x + P.w / 2} ${P.y - 8}`
                  : `M ${inR + 10} ${sentY + 30} C ${inR + 80} ${sentY + 30}, ${P.x - 80} ${P.y + 280}, ${P.x - 8} ${P.y + 260}`
              }
              fill="none"
              stroke={C.ok}
              strokeWidth={5}
              strokeDasharray="12 10"
              opacity={s.note.opacity}
            />
          )}
          <MemoryPanel
            x={P.x}
            y={P.y}
            w={P.w}
            size={P.size}
            opacity={s.panel}
            notes={[
              ...PANEL_NOTES.map((text) => ({ text })),
              { text: 'my flight is Friday', opacity: s.note.opacity, lit: s.note.lit },
            ]}
          />
        </Frame>
      </AbsoluteFill>
    );
  }

  // wrong / morning: the cold-open chat, then (morning) the wipe to a fresh one.
  const W = L.win;
  const size = L.size;
  const inX = W.x + 40;
  const inR = W.x + W.w - 40;
  const maxW = W.w * 0.7;
  let y = W.y + HEAD + 22;
  const corrY = y;
  y += bubbleSize(CORRECTION, size, maxW).h + L.gap;
  const gotY = y;
  y += bubbleSize(GOT_IT, size, maxW).h + L.gap;
  const divY = y;
  y += 26;
  const colY = y;
  y += 34 + 24 + L.gap;
  const bookY = y;
  const clipW = W.w * s.wipe;
  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Frame vertical={p.vertical} design="both">
        <ChatWindow x={W.x} y={W.y} w={W.w} h={W.h} title={CHAT_TITLE} />
        <g opacity={s.chat.opacity}>
          <Bubble x={inR} y={corrY} side="user" text={CORRECTION} size={size} maxW={maxW} lit={s.chat.lit[0]} hot="Friday" hotColor={C.text} />
          <Bubble x={inX} y={gotY} side="ai" text={GOT_IT} size={size} maxW={maxW} lit={s.chat.lit[1]} />
          <Divider x={inX} y={divY} w={inR - inX} text={LATER} size={size * 0.75} />
          <Collapsed x={inX} y={colY} w={inR - inX} rows={2} />
          <Bubble x={inX} y={bookY} side="ai" text={BOOKING} size={size} maxW={W.w - 80} alert={s.chat.alert} hot="Thursday" tick />
        </g>
        {s.wipe > 0 && (
          <g>
            <defs>
              <clipPath id="chat-wipe">
                <rect x={W.x - 4} y={W.y - 4} width={clipW + 8} height={W.h + 8} />
              </clipPath>
            </defs>
            <g clipPath="url(#chat-wipe)">
              <ChatWindow x={W.x} y={W.y} w={W.w} h={W.h} title={NEW_CHAT_TITLE} morning={s.morning} cursor={s.cursor} />
              <Bubble x={inX} y={W.y + HEAD + 40} side="ai" text={GREETING} size={size} maxW={maxW} opacity={s.greeting} lit={s.note.lit} />
            </g>
            {/* the leading edge of the wipe: a soft band of morning light */}
            {s.wipe < 1 && <rect x={W.x + clipW - 14} y={W.y} width={28} height={W.h} rx={14} fill={alpha(C.warm, 0.35)} />}
          </g>
        )}
      </Frame>
    </AbsoluteFill>
  );
};
