// Pure state of the shop chat (rows 1 and 28).
// - cold (cold open, row 1): the whole chat is on screen from frame 0: the user's question
//   "Can I return shoes I've worn once? One line, please." with "One line, please" pulsing red,
//   and below it the AI's answer, three dense paragraphs quoting the policy. Beside the chat the
//   house robot holds the policy card. Marks: [perfectly, one, three]:
//   Frame 0 is already the loudest frame of the opening: the paragraphs carry their red numbers
//   1, 2, 3, the quoted policy is green with its tick, and in the first second the numbers hop one
//   after another while "One line, please" flashes (the conflict moves from frame 0).
//   perfectly → the card glows and the tick hops;
//   one → "One line, please" flashes;
//   three → the numbers 1, 2, 3 hop again, one after another.
// - callback (row 28): the same chat, already numbered; beside it the book's "manners" chapter
//   with the sticky "One line, please", which falls to the floor late in the line. No marks.
// No Remotion or React here.
import { beatOr, blinkAt, bump, ease, loopTime, mark, pickMode } from './memory.ts';
import { clamp01, fit, sceneTime } from './steps.ts';

export const SHOP_CHAT_MODES = ['cold', 'callback'] as const;
export type ShopChatMode = (typeof SHOP_CHAT_MODES)[number];
export type ShopChatProps = { mode?: ShopChatMode; marks?: number[] };

export const SHOP_TITLE = 'Shoe shop · Help';
/** The user's question, as two lines (the second is the instruction the answer ignores). */
export const QUESTION = ["Can I return shoes I've worn once?", 'One line, please.'] as const;
/**
 * The answer's three paragraphs. `[before, quote, after]`: the quote is the policy, lit on "perfectly".
 */
export const ANSWER: readonly (readonly [string, string, string])[] = [
  ['Thank you for your question about our returns policy! Our policy states: ', 'Returns: 30 days, unworn, in the box.', ' This means items must come back within 30 days.'],
  ['Because the policy requires items to be ', 'unworn', ', shoes that have been worn, even once, would generally not meet the conditions for a standard return.'],
  ['However, if you believe there is a defect, or you have any further questions about exchanges or store credit, please do not hesitate to contact our friendly support team.', '', ''],
];

export type ShopChatState = {
  /** "One line, please": its red pulse (never off) and the flash on "one". */
  ask: { pulse: number; flash: number };
  /** The quoted policy lit in the answer, and the card's glow. */
  quote: number;
  card: number;
  /** The paragraph numbers 1, 2, 3 shown, and their hop (a scale pulse). */
  paras: number[];
  hop: number[];
  /** The tick's hop beside the quote. */
  tickHop: number;
  /** callback: the book shown, the sticky's fall (0 = stuck on the page, 1 = on the floor). */
  book: number;
  fall: number;
  blur: number;
  blink: number;
  /** A slow bob of the robot, in [0, 1]. */
  bob: number;
};

export function frameState(props: ShopChatProps, t: number, beats: number[], dur: number): ShopChatState {
  const mode = pickMode(props.mode, SHOP_CHAT_MODES);
  const T = sceneTime(Number.isFinite(t) ? t : 0, dur);
  const tm = loopTime(t, dur);
  const m = props.marks;
  const b0 = beatOr(beats, 0, 0);
  const pulse = 0.55 + 0.45 * Math.sin(tm * 4.2);
  const blink = blinkAt(tm);
  const bob = clamp01(0.5 + 0.5 * Math.sin(tm * 1.8));

  if (mode === 'cold') {
    const perfectly = mark(m, 0, b0 + 2.4);
    const one = Math.max(perfectly + 0.4, mark(m, 1, b0 + 4.6));
    const three = Math.max(one + 0.4, mark(m, 2, b0 + 6.2));
    return {
      ask: { pulse, flash: Math.max(bump(T, 0, 1.0), bump(T, one - 0.1, 1.0), 0.5 * ease(T, one - 0.1, 0.3)) },
      quote: 1,
      card: Math.max(0.35, bump(T, perfectly - 0.15, 1.6)),
      paras: [1, 1, 1],
      hop: [0, 1, 2].map((i) => Math.max(bump(T, i * 0.25, 0.55), bump(T, fit(three - 0.1 + i * 0.28, 0.55, dur), 0.55))),
      tickHop: Math.max(bump(T, 0.75, 0.55), bump(T, perfectly - 0.1, 0.6)),
      book: 0,
      fall: 0,
      blur: 0,
      blink,
      bob,
    };
  }

  // callback: the line is "... and you can end up with the chat from the start."
  const fallAt = fit(b0 + 3.2, 1.0, dur);
  return {
    ask: { pulse, flash: bump(T, b0 + 0.2, 1.0) },
    quote: 1,
    card: 0,
    paras: [1, 1, 1],
    hop: [0, 0, 0],
    tickHop: 0,
    book: 1,
    fall: ease(T, fallAt, 0.9),
    blur: ease(T, b0, 1.5),
    blink,
    bob,
  };
}
