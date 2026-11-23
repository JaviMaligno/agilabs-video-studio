// Pure state of the book of what the model knows (rows 5-6, 21-23, 29-30). No Remotion or React.
// - school: books stream into one huge book in the robot's hands ("pre-training (school)"), a
//   price tag "$$$$$$" on "millions". Line 2 is a different, second stage: as it starts ("Then a
//   second, much shorter training") the price tag and the pile of books leave and the label
//   becomes "instruction tuning (manners)", named like every stage (it glows on "That's
//   instruction tuning"); on "conversations" three small chat cards slide in one after another
//   (the third on "one line, please"), then on "instruction tuning" they fly into the back of the
//   book, where they become the thin chapter "manners" (lit on the word); the sticky note
//   "One line, please" is pinned on it on "Remember that one".
//   Marks: [school, packed, millions, conversations, manners, line, tuning, remember].
// - finetune: example cards (customer question → your reply) stream into the book; the pen
//   rewrites lines on every page ("full fine-tuning (rewriting the book)"); then the cracked door
//   from the intro, which opens onto the book. Marks: [examples, rewritten, damage].
// - retrain: the policy card flips to "14 days", the page still says "30 days", a retrain clock
//   starts; "habits" vs "facts"; line 2: the pen hovers, then stops. Marks: [again, stick, habits, without].
import { beatOr, bump, ease, fin, mark, pickMode } from './memory.ts';
import { clamp01, fit, progress, sceneTime } from './steps.ts';

export const KB_MODES = ['school', 'finetune', 'retrain'] as const;
export type KnowledgeBookMode = (typeof KB_MODES)[number];
export type KnowledgeBookProps = { mode?: string; marks?: number[] };

/** Books flying into the big book (school) and example cards flying in (finetune). */
export const STREAM_BOOKS = 10;
export const EXAMPLE_CARDS = 6;
/** Pages turned while the pen rewrites. */
export const FLIPS = 3;
/** school, line 2: the chat cards of the second training (the "manners" lessons). */
export const CHAT_CARDS = 3;
/** The pre-training label leaves in DIP seconds, then the "instruction tuning" label comes in. */
export const LABEL_DIP = 0.3;

export type KnowledgeBookState = {
  mode: KnowledgeBookMode;
  book: {
    /** Size of the book: 0 = small, 1 = huge. */
    grow: number;
    fill: number;
    manners: number;
    mannersLit: number;
    blur: number;
    rewrite: number;
    flip: number;
    flipOn: number;
    glow: number;
    /** A rose pulse on the book (the damage). */
    hurt: number;
  };
  cap: number;
  label: { opacity: number; pop: number };
  /** school, line 2: the "instruction tuning (manners)" label (in, and its glow when it is named),
   *  each chat card slid in (0..1) and the cards' flight into the back of the book (0..1). */
  second: { label: number; lit: number; cards: number[]; flow: number };
  pile: { opacity: number };
  /** Books streaming in, 0..1. */
  stream: number;
  /** pop: in on "millions"; leave: out as the second training starts. */
  price: { pop: number; swing: number; leave: number };
  sticky: { opacity: number; drop: number; pin: number; glow: number; fall: number };
  cards: { opacity: number; stream: number };
  pen: { opacity: number; write: number; bob: number; stop: number; question: number };
  door: { opacity: number; crack: number; open: number };
  policy: { opacity: number; flip: number; glow: number };
  clock: { opacity: number; turn: number };
  page30: { lit: number; circle: number };
  chips: { habits: number; facts: number };
};

/** Seconds after the fallback when a mark is missing; marks are kept in order. */
const after = (x: number, min: number) => Math.max(x, min);

const empty = (mode: KnowledgeBookMode): KnowledgeBookState => ({
  mode,
  book: { grow: 1, fill: 1, manners: 1, mannersLit: 0, blur: 0, rewrite: 0, flip: 0, flipOn: 0, glow: 0, hurt: 0 },
  cap: 0,
  label: { opacity: 0, pop: 0 },
  second: { label: 0, lit: 0, cards: Array.from({ length: CHAT_CARDS }, () => 0), flow: 0 },
  pile: { opacity: 0 },
  stream: 0,
  price: { pop: 0, swing: 0, leave: 0 },
  sticky: { opacity: 1, drop: 1, pin: 1, glow: 0, fall: 0 },
  cards: { opacity: 0, stream: 0 },
  pen: { opacity: 0, write: 0, bob: 0, stop: 0, question: 0 },
  door: { opacity: 0, crack: 0, open: 0 },
  policy: { opacity: 0, flip: 0, glow: 0 },
  clock: { opacity: 0, turn: 0 },
  page30: { lit: 0, circle: 0 },
  chips: { habits: 0, facts: 0 },
});

export function frameState(props: KnowledgeBookProps, t: number, beats: number[], dur: number): KnowledgeBookState {
  const mode = pickMode(props?.mode, KB_MODES);
  const D = Number.isFinite(dur) && dur > 0 ? dur : 0;
  const T = sceneTime(Number.isFinite(t) ? t : 0, D);
  const tl = Math.min(Math.max(fin(t, 0), 0), D); // looping motion time, finite
  const m = props?.marks;
  const s = empty(mode);
  const b0 = beatOr(beats, 0, 0);

  if (mode === 'school') {
    const b1 = after(beatOr(beats, 1, b0 + 12), b0 + 1);
    const school = fit(after(mark(m, 0, b0 + 2.5), b0), 0.5, D);
    const packed = after(mark(m, 1, school + 4), school + 1.5);
    const millions = fit(after(mark(m, 2, b1 - 1.2), packed), 0.6, D);
    // line 2: the second training. The label swaps as the line starts (its first words, "Then a
    // second, much shorter training"), the chat cards come on "conversations"
    const swap = fit(b1, 0.8, D);
    const convo = fit(after(mark(m, 3, b1 + 5), swap + LABEL_DIP + 0.4), 3.5, D);
    // "…an instruction like 'one line, please'": the third card lands on "line"
    const card0 = convo + 0.15;
    const card2 = Math.max(card0 + 1.2, mark(m, 5, card0 + 3) - 0.35);
    const cardAt = [card0, (card0 + card2) / 2, card2];
    // "That's instruction tuning" (the mark is "tuning"; the first "instruction" is the cards'):
    // the label glows on the name and the cards fly into the book, becoming the chapter, lit on
    // "manners"
    const tuning = fit(after(mark(m, 6, card2 + 2.6), card2 + 1.2), 1.6, D);
    const manners = fit(after(mark(m, 4, tuning + 1.4), tuning + 0.6), 0.9, D);
    const flowFrom = Math.max(card2 + 0.8, tuning - 0.9);
    const flowLen = Math.max(0.5, Math.min(1.2, manners - 0.3 - flowFrom));
    // the sticky note on "Remember that one", after the chapter has been named
    const line = fit(after(mark(m, 7, manners + 0.8), manners + 0.5), 1.3, D);
    const streamLen = Math.max(0.6, packed - school - 0.2);
    const stream = progress(T, fit(school + 0.2, streamLen, D), streamLen);
    s.book = {
      ...s.book,
      grow: ease(T, fit(school + 0.2, streamLen, D), streamLen),
      fill: stream,
      manners: ease(T, flowFrom + flowLen * 0.6, 0.7),
      mannersLit: bump(T, manners, 1.6),
      glow: Math.max(bump(T, packed - 0.2, 1.2), 0.5 * bump(T, manners, 1.4)),
    };
    s.cap = ease(T, school - 0.15, 0.45);
    s.label = { opacity: 1 - ease(T, swap, LABEL_DIP), pop: ease(T, school - 0.15, 0.45) };
    s.second = {
      label: ease(T, swap + LABEL_DIP - 0.05, 0.45),
      lit: bump(T, tuning - 0.4, 1.4),
      cards: cardAt.map((at) => ease(T, at - 0.1, 0.5)),
      flow: progress(T, flowFrom, flowLen),
    };
    s.pile = { opacity: ease(T, school - 0.4, 0.4) * (1 - ease(T, swap, 0.6)) };
    s.stream = stream;
    const pp = ease(T, millions - 0.15, 0.5);
    const since = Math.max(0, Math.min(T, D) - millions);
    s.price = { pop: pp, swing: pp * 12 * Math.exp(-1.6 * since) * Math.sin(5 * since), leave: ease(T, swap, 0.5) };
    s.sticky = {
      opacity: ease(T, line - 0.15, 0.25),
      drop: ease(T, line - 0.1, 0.5),
      pin: ease(T, line + 0.4, 0.3),
      glow: bump(T, line + 0.5, 1.4),
      fall: 0,
    };
    return s;
  }

  if (mode === 'finetune') {
    const b1 = after(beatOr(beats, 1, b0 + 9), b0 + 1);
    const b2 = after(beatOr(beats, 2, b1 + 11), b1 + 1);
    const examples = fit(after(mark(m, 0, b0 + 2), b0), 1, D);
    const rewritten = fit(after(mark(m, 1, b1 + 6), b1), 1, D);
    const damage = fit(after(mark(m, 2, b2 + 2.6), b2 + 0.8), 0.9, D);
    // the first card stays a moment so it can be read, then the deck flies into the book
    const cardsFrom = examples + 1.3;
    const cardsLen = Math.max(1, Math.min(6, b1 - 0.3 - cardsFrom));
    const writeFrom = rewritten - 0.2;
    const writeLen = Math.max(1, Math.min(5, b2 - 0.4 - writeFrom));
    const write = progress(T, fit(writeFrom, writeLen, D), writeLen);
    const flipPhase = clamp01(write) * FLIPS;
    const flipK = Math.min(FLIPS - 1, Math.floor(flipPhase));
    const inFlip = flipPhase - flipK;
    s.cards = { opacity: ease(T, examples - 0.3, 0.4) * (1 - ease(T, fit(cardsFrom, cardsLen, D) + cardsLen, 0.4)), stream: progress(T, fit(cardsFrom, cardsLen, D), cardsLen) };
    s.book = {
      ...s.book,
      rewrite: write,
      flip: write >= 1 ? 1 : inFlip,
      flipOn: write > 0 && write < 1 ? Math.min(1, inFlip * 6, (1 - inFlip) * 6) : 0,
      glow: Math.max(bump(T, b1, 1.4), 0.6 * bump(T, cardsFrom + cardsLen - 0.4, 1)),
      hurt: bump(T, damage + 0.6, 1.4),
    };
    s.label = { opacity: 1, pop: ease(T, rewritten - 0.15, 0.45) };
    s.pen = { opacity: ease(T, writeFrom - 0.3, 0.3) * (1 - ease(T, b2 - 0.2, 0.3)), write, bob: 0, stop: 0, question: 0 };
    // "It's the most thorough way" stays on the rewritten book alone; the cracked door (the damage)
    // comes in on "…did the most damage", cracks on the word and then opens onto the book
    const doorIn = Math.max(b2 + 1.4, damage - 0.9);
    s.door = { opacity: ease(T, doorIn, 0.4), crack: ease(T, damage - 0.5, 0.5), open: ease(T, damage + 0.2, 0.8) };
    return s;
  }

  // retrain
  const b1 = after(beatOr(beats, 1, b0 + 10), b0 + 1);
  const fourteen = fit(b0 + 1.3, 0.7, D);
  const again = fit(after(mark(m, 0, b0 + 2.8), fourteen + 0.3), 0.5, D);
  const stick = fit(after(mark(m, 1, again + 3.4), again + 0.5), 0.8, D);
  const habits = fit(after(mark(m, 2, stick + 2), stick + 0.4), 1, D);
  const without = fit(after(mark(m, 3, b1 + 2.4), b1 + 0.6), 0.8, D);
  s.book = { ...s.book, rewrite: 1, blur: 1 };
  // after the rewrite the sticky note has fallen off (TerminalTest); the manners stay blurred
  s.sticky = { opacity: 0, drop: 1, pin: 0, glow: 0, fall: 1 };
  s.policy = { opacity: 1, flip: ease(T, fourteen, 0.7), glow: bump(T, fourteen + 0.35, 1.2) };
  s.clock = { opacity: ease(T, again - 0.15, 0.4), turn: Math.max(0, tl - again) * 300 };
  s.page30 = { lit: ease(T, stick - 0.1, 0.3), circle: ease(T, stick, 0.8) };
  s.chips = { habits: ease(T, habits - 0.1, 0.4), facts: ease(T, habits + 0.6, 0.4) };
  const hoverAt = fit(b1 + 0.1, 0.5, D);
  const stop = ease(T, without, 0.6);
  s.pen = { opacity: ease(T, hoverAt - 0.2, 0.5), write: 0, bob: stop >= 1 ? 0 : (1 - stop) * Math.sin(tl * 4.2), stop, question: ease(T, without + 0.3, 0.4) };
  return s;
}
