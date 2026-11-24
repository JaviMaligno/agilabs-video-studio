// Pure state of the shop chat (rows 1 and 28).
// - cold (cold open, row 1): the chat builds up with the voice. Frame 0 is clean: the chat window
//   with only the user's question, large ("Can I return shoes I've worn once?" / "One line,
//   please."), and beside it the house robot holding the policy card. In the first second the
//   question pops in and the AI's typing dots appear. Marks: [perfectly, one, three]:
//   perfectly → the AI's answer appears, ONE readable sentence quoting the policy in green with a
//   tick, and the card glows;
//   one → "One line, please" lights up red and flashes;
//   three → the answer grows fast: paragraphs 2 and 3 roll in as grey skeleton lines (the overload
//   is seen, not read) and the numbers 1, 2, 3 hop one after another.
// - callback (row 28): the whole chat with the three readable numbered paragraphs (as in v5);
//   beside it the book's "manners" chapter with the sticky "One line, please", which falls to the
//   floor late in the line. No marks.
// No Remotion or React here.
import { beatOr, blinkAt, bump, ease, loopTime, mark, pickMode } from './memory.ts';
import { clamp01, fit, sceneTime } from './steps.ts';

export const SHOP_CHAT_MODES = ['cold', 'callback'] as const;
export type ShopChatMode = (typeof SHOP_CHAT_MODES)[number];
export type ShopChatProps = { mode?: ShopChatMode; marks?: number[] };

export const SHOP_TITLE = 'Shoe shop · Help';
/** The user's question, as two lines (the second is the instruction the answer ignores). */
export const QUESTION = ["Can I return shoes I've worn once?", 'One line, please.'] as const;
/** The policy, as the AI quotes it. */
export const POLICY = 'Returns: 30 days, unworn, in the box.';
/**
 * The answer's three paragraphs, as the callback shows them. `[before, quote, after]`: the quote
 * is lit green.
 */
export const ANSWER: readonly (readonly [string, string, string])[] = [
  ['Thank you for your question about our returns policy! Our policy states: ', POLICY, ' This means items must come back within 30 days.'],
  ['Because the policy requires items to be ', 'unworn', ', shoes that have been worn, even once, would generally not meet the conditions for a standard return.'],
  ['However, if you believe there is a defect, or you have any further questions about exchanges or store credit, please do not hesitate to contact our friendly support team.', '', ''],
];
/** The cold open's answer: one readable sentence (paragraph 1); 2 and 3 roll in as skeleton lines. */
export const COLD_ANSWER = ['Our policy states: ', POLICY, ''] as const;
/** Skeleton lines of paragraphs 2 and 3 in the cold open, as fractions of the text width. */
export const SKELETON: readonly (readonly number[])[] = [
  [0.97, 0.92, 0.6],
  [0.95, 0.99, 0.72],
];

export type ShopChatState = {
  /** The question bubble popping in (frame 0 shows it already, slightly small). */
  qIn: number;
  /** The AI's typing dots, before the answer appears, and each dot's bounce. */
  typing: number;
  dots: number[];
  /** "One line, please": its red highlight shown (`on`), its pulse and the flash on "one". */
  ask: { on: number; pulse: number; flash: number };
  /** The answer bubble shown. */
  answer: number;
  /** How far each paragraph has rolled in (cold: 2 and 3 on "three"). */
  rows: number[];
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
    const answerAt = fit(perfectly - 0.1, 0.35, dur);
    const answer = ease(T, answerAt, 0.35);
    const oneAt = fit(one - 0.1, 0.3, dur);
    // on "three": number 1 hops, then paragraphs 2 and 3 roll in, each number hopping as it lands
    const rollAt = [answerAt, fit(three + 0.02, 0.35, dur), fit(three + 0.3, 0.35, dur)];
    const numAt = [fit(three - 0.1, 0.55, dur), fit(three + 0.18, 0.55, dur), fit(three + 0.46, 0.55, dur)];
    return {
      qIn: ease(T, 0, 0.3),
      typing: ease(T, 0.45, 0.25) * (1 - answer),
      dots: [0, 1, 2].map((i) => clamp01(Math.sin(tm * 7 - i * 0.9))),
      ask: { on: ease(T, oneAt, 0.3), pulse, flash: Math.max(bump(T, oneAt, 1.0), 0.5 * ease(T, oneAt, 0.3)) },
      answer,
      rows: [answer, ease(T, rollAt[1], 0.35), ease(T, rollAt[2], 0.35)],
      quote: answer,
      card: Math.max(0.35, bump(T, perfectly - 0.15, 1.6)),
      paras: numAt.map((at) => ease(T, at, 0.2)),
      hop: numAt.map((at) => bump(T, at, 0.55)),
      tickHop: bump(T, fit(perfectly + 0.15, 0.6, dur), 0.6),
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
    qIn: 1,
    typing: 0,
    dots: [0, 0, 0],
    ask: { on: 1, pulse, flash: bump(T, b0 + 0.2, 1.0) },
    answer: 1,
    rows: [1, 1, 1],
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
