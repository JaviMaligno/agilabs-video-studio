// The shop chat: the cold open (three paragraphs for a one-line request) and its callback in
// chapter 4 (the sticky "One line, please" falls off the book). See ShopChat.state.ts.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { ChatWindow } from './chat.tsx';
import { Badge, Robot, glow } from './office.tsx';
import { Book, RobotWithBook } from './book.tsx';
import { PolicyCard, ShopCanvas } from './shop.tsx';
import { ANSWER, QUESTION, SHOP_TITLE, frameState, type ShopChatProps } from './ShopChat.state.ts';

export { frameState };
export type { ShopChatProps };

const CHAR = 0.56;
/** Advance of the answer's semibold characters (narrower than the bold estimate). */
const CHAR_ANSWER = 0.5;

type Word = { text: string; hot: boolean; glue: boolean };

/** The paragraph's words, those of the quote marked hot, wrapped into lines of `maxChars`. */
const wrapParts = (parts: readonly string[], maxChars: number): Word[][] => {
  const words: Word[] = [];
  parts.forEach((part, k) => {
    // a part that starts with punctuation sticks to the previous word (no space before it)
    part.split(' ').forEach((w, i) => {
      if (w) words.push({ text: w, hot: k === 1, glue: i === 0 && k > 0 && words.length > 0 && !parts[k - 1].endsWith(' ') && !part.startsWith(' ') });
    });
  });
  const lines: Word[][] = [];
  let cur: Word[] = [];
  let len = 0;
  for (const w of words) {
    const add = (cur.length && !w.glue ? 1 : 0) + w.text.length;
    if (cur.length && len + add > maxChars) {
      lines.push(cur);
      cur = [w];
      len = w.text.length;
    } else {
      cur.push(w);
      len += add;
    }
  }
  if (cur.length) lines.push(cur);
  return lines;
};

/** Landscape layout (frame pixels). The vertical cut reuses it, scaled into its stage. */
const L = {
  // cold: the window ends above the hook panel (x 200-1720, from y ~745).
  win: { x: 180, y: 136, w: 1150, h: 590 },
  winCallback: { x: 170, y: 145, w: 1140, h: 635 },
  ask: { size: 28 },
  answer: { size: 28, lh: 34, indent: 64, gap: 12 },
  robot: { x: 1545, y: 405, s: 0.62 },
  card: { x: 1545, y: 262, w: 410 },
  // callback: top left of the book's page block, and its width
  book: { x: 1350, y: 360, w: 400 },
  floor: 690,
  floorCallback: 790,
};

export const ShopChat: React.FC<AnimProps & ShopChatProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const W = s.book > 0 ? L.winCallback : L.win;
  const inX = W.x + 36;
  const inR = W.x + W.w - 36;

  // the user's question, right-aligned
  const qs = L.ask.size;
  const qPad = qs * 0.7;
  const qW = Math.max(...QUESTION.map((l) => l.length)) * qs * CHAR + 2 * qPad;
  const qH = QUESTION.length * qs * 1.28 + qPad * 1.2;
  const qX = inR - qW;
  const qY = W.y + 70 + 18;
  const askLineY = qY + qPad * 0.6 + qs * (1.28 + 0.98);
  const red = Math.min(1, 0.4 + 0.6 * Math.max(s.ask.pulse, s.ask.flash));

  // the answer, three numbered paragraphs
  const A = L.answer;
  const aX = inX;
  const aY = qY + qH + 16;
  const aW = W.w - 72;
  const maxChars = Math.floor((aW - A.indent - 26) / (A.size * CHAR_ANSWER));
  const paras = ANSWER.map((parts) => wrapParts(parts, maxChars));
  let y = aY + 22;
  const paraY = paras.map((lines) => {
    const top = y;
    y += lines.length * A.lh + A.gap;
    return top;
  });
  const aH = y - aY - A.gap + 14;


  return (
    <AbsoluteFill style={{ fontFamily }}>
      <ShopCanvas vertical={p.vertical}>
        <ChatWindow x={W.x} y={W.y} w={W.w} h={W.h} title={SHOP_TITLE} />
        {/* no input bar: the answer fills the window to the bottom */}
        <rect x={W.x + 4} y={W.y + W.h - 104} width={W.w - 8} height={100} rx={24} fill={C.bg1} />
        {/* the question; its second line is the instruction, pulsing red */}
        <rect x={qX} y={qY} width={qW} height={qH} rx={26} fill={C.accent} stroke={alpha(C.accentText, 0.9)} strokeWidth={3} />
        <g style={glow(C.marker, 0.4 + 0.6 * red)}>
          <rect x={qX + qPad - 10} y={askLineY - qs * 0.95} width={QUESTION[1].length * qs * CHAR + 20} height={qs * 1.25} rx={10} fill={alpha(C.marker, 0.3 + 0.55 * red)} stroke={C.marker} strokeWidth={3} />
        </g>
        <text x={qX + qPad} y={qY + qPad * 0.6 + qs * 0.98} fontSize={qs} fontWeight={700} fill={C.text}>
          {QUESTION[0]}
        </text>
        <text x={qX + qPad} y={askLineY} fontSize={qs} fontWeight={800} fill={C.text}>
          {QUESTION[1]}
        </text>

        {/* the answer: a wall of text */}
        <rect x={aX} y={aY} width={aW} height={aH} rx={26} fill={C.card} stroke={alpha(C.accentText, 0.5)} strokeWidth={3} />
        {paras.map((lines, i) => (
          <g key={i}>
            {lines.map((ws, k) => (
              <text key={k} x={aX + A.indent} y={paraY[i] + A.size * 0.95 + k * A.lh} fontSize={A.size} fontWeight={600} fill={alpha(C.text, 0.88)}>
                {ws.map((w, j) => (
                  <tspan key={j} fill={w.hot && s.quote > 0.05 ? C.ok : undefined} fontWeight={w.hot && s.quote > 0.05 ? 800 : undefined}>
                    {(j > 0 && !w.glue ? ' ' : '') + w.text}
                  </tspan>
                ))}
              </text>
            ))}
            {/* the paragraph number in the gutter, popping on "three" */}
            {s.paras[i] > 0 && (
              <g opacity={s.paras[i]} transform={`translate(${aX + 34} ${paraY[i] + A.size * 0.6}) scale(${(1.4 - 0.4 * s.paras[i]) * (1 + 0.45 * s.hop[i])})`} style={glow(C.marker, 0.6 + 0.4 * s.hop[i])}>
                <circle r={22} fill={C.marker} />
                <text y={10} textAnchor="middle" fontSize={28} fontWeight={800} fill={C.bg0}>
                  {i + 1}
                </text>
              </g>
            )}
          </g>
        ))}
        {/* a tick next to the quoted policy: quoted perfectly */}
        {s.quote > 0 && (
          <g transform={`translate(${aX + aW - 34} ${paraY[0] + A.size * 0.6}) scale(${1 + 0.4 * s.tickHop})`} style={glow(C.ok, s.tickHop)}>
            <Badge x={0} y={0} r={20} kind="tick" pop={s.quote} />
          </g>
        )}

        {s.book <= 0 ? (
          // cold: the house robot holding up the policy card it was taught
          <g>
            <rect x={1345} y={L.floor} width={410} height={4} rx={2} fill={alpha(C.muted, 0.25)} />
            <Robot x={L.robot.x} y={L.robot.y - 6 * s.bob} s={L.robot.s} blink={s.blink} shelf={0.6} />
            <PolicyCard x={L.card.x} y={L.card.y - 6 * s.bob} w={L.card.w} lit={s.card} />
          </g>
        ) : (
          // callback: the house robot holding the book open at "manners"; the sticky falls off
          <g>
            <rect x={1345} y={L.floorCallback} width={410} height={4} rx={2} fill={alpha(C.muted, 0.25)} />
            <RobotWithBook x={L.book.x} y={L.book.y} w={L.book.w} blink={s.blink}>
              <Book x={L.book.x} y={L.book.y} w={L.book.w} rewrite={1} blur={s.blur} fall={s.fall} fallDx={0.05} fallDy={0.44} stickyGlow={0.4 * (1 - s.fall)} />
            </RobotWithBook>
          </g>
        )}
      </ShopCanvas>
    </AbsoluteFill>
  );
};
