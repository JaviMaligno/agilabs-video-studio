// Pure state of the terminal test (rows 24-27, 33-34). No Remotion or React.
// - full: line 1 a small robot at a computer: a command card goes in, the screen prints the reply,
//   the robot's guess, a tick; ticks pile up ("learned the job"). Line 2: the general knowledge
//   quiz: a card "Plants use sunlight to make…" (on "quiz"), its four options popping in as they
//   are read (around "food"), "food" ticked, then the "general knowledge" meter drops a little on
//   "points" (no number). Line 3: the book's "manners" chapter blurs and the sticky note falls;
//   "following instructions: more than ⅓ worse". Line 4: close-up of a rewritten page with the old
//   manners text faint underneath. Line 5: unfamiliar commands, every guess crossed, "none".
//   Marks: [commands, learned, quiz, food, points, worse, third, forget, none].
// - lora: the rewritten book next to the book with the clear sheet: the same ticks; the manners
//   blur and the note falls on the left only, the right one stays (and goes up a little); line 2
//   the unfamiliar commands: "some" ticks on the sheet side, "none" on the other.
//   Marks: [well, drop, up, some].
import { beatOr, bump, ease, mark, pickMode } from './memory.ts';
import { clamp01, fit, progress, sceneTime } from './steps.ts';

export const TT_MODES = ['full', 'lora'] as const;
export type TerminalTestMode = (typeof TT_MODES)[number];
export type TerminalTestProps = { mode?: string; marks?: number[] };

/** Commands of the lessons, with what the computer printed back. */
export const LESSONS: [string, string][] = [
  ['ls', 'boots.txt  sneakers.txt'],
  ['pwd', '/home/shop'],
  ['echo hello', 'hello'],
  ['whoami', 'robot'],
];
/** Commands it had never seen in its lessons. */
export const UNSEEN = ['tac orders.txt', 'nl -ba sizes.txt', 'rev colours.txt', 'paste a.txt b.txt'];
/** The tally of ticks while it learns. */
export const TALLY = 24;
/** lora: ticks under each book, and how many unseen commands the sheet side gets right. */
export const LORA_TICKS = 6;
export const LORA_UNSEEN = 5;
export const LORA_SOME = 2;
/** The general knowledge quiz (full, line 2): the question, its options and the right one. */
export const QUIZ_Q = 'Plants use sunlight to make…';
export const QUIZ_OPTIONS = ['soil', 'minerals', 'food', 'water'] as const;
export const QUIZ_RIGHT = 2;
/** How much of the "general knowledge" meter is lost on "it lost some points" (a picture, not the
 *  figure): enough to read as a loss at a glance, small next to the "more than ⅓" of the next line. */
export const QUIZ_DROP = 0.24;
/** The drop starts on "lost", this long before the "points" mark (the first "lost" of the line is
 *  the one in the question, so the mark sits on "points"). */
export const LOST_LEAD = 0.3;
/** The quiz card comes in this long before "quiz" (on "general knowledge"), not at the line start:
 *  during "How did I check what it lost?" the terminal stays, so the answer never shows first. */
export const QUIZ_LEAD = 0.75;
/** In and out of the quiz card the two panels do not cross: the outgoing one leaves in DIP seconds,
 *  the incoming one comes in as it goes (a short dip), so two drawings never pile up. */
export const DIP = 0.3;

export type TerminalTestState = {
  mode: TerminalTestMode;
  /** full: the five panels, one per line. */
  panels: { desk: number; quiz: number; book: number; page: number; unseen: number };
  /** The lesson on screen: which one (index into LESSONS) and its step progress. */
  lesson: { index: number; card: number; reply: number; guess: number; tick: number };
  /** Ticks in the tally, 0..1 of TALLY; the "learned the job" label. */
  tally: { fill: number; learned: number };
  /** The quiz card: title lit, question shown, each option popped in, the tick on "food", the meter's drop. */
  quiz: { title: number; question: number; options: number[]; tick: number; drop: number };
  book: { blur: number; fall: number; hurt: number };
  stat: { opacity: number; shrink: number; text: number };
  page: { zoom: number; fade: number; forget: number };
  /** Unseen commands: cards shown, crosses, the "none" verdict. */
  unseen: { cards: number; cross: number; none: number };
  /** lora mode. */
  lora: {
    ticks: number;
    leftBlur: number;
    leftFall: number;
    rightGlow: number;
    up: number;
    rows: number;
    rowFill: number;
    some: number;
    none: number;
  };
};

const after = (x: number, min: number) => Math.max(x, min);
/** Length of the crossfade between two panels, in seconds. */
export const XF = 0.4;
/** The book panel (with "more than ⅓ worse") stays this long into line 3 so the figure can be read. */
export const STAT_HOLD = 1.2;

export function frameState(props: TerminalTestProps, t: number, beats: number[], dur: number): TerminalTestState {
  const mode = pickMode(props?.mode, TT_MODES);
  const D = Number.isFinite(dur) && dur > 0 ? dur : 0;
  const T = sceneTime(Number.isFinite(t) ? t : 0, D);
  const m = props?.marks;
  const b0 = beatOr(beats, 0, 0);
  const s: TerminalTestState = {
    mode,
    panels: { desk: 0, quiz: 0, book: 0, page: 0, unseen: 0 },
    lesson: { index: 0, card: 0, reply: 0, guess: 0, tick: 0 },
    tally: { fill: 0, learned: 0 },
    quiz: { title: 0, question: 0, options: QUIZ_OPTIONS.map(() => 0), tick: 0, drop: 0 },
    book: { blur: 0, fall: 0, hurt: 0 },
    stat: { opacity: 0, shrink: 0, text: 0 },
    page: { zoom: 0, fade: 0, forget: 0 },
    unseen: { cards: 0, cross: 0, none: 0 },
    lora: { ticks: 0, leftBlur: 0, leftFall: 0, rightGlow: 0, up: 0, rows: 0, rowFill: 0, some: 0, none: 0 },
  };

  if (mode === 'full') {
    // q = the quiz line; then the manners line (b1), the page (b2) and the unseen commands (b3),
    // named as before the quiz line was added so their beats read as they did
    const q = after(beatOr(beats, 1, b0 + 14), b0 + 1);
    const b1 = after(beatOr(beats, 2, q + 11.6), q + 1);
    const b2 = after(beatOr(beats, 3, b1 + 7.5), b1 + 1);
    const b3 = after(beatOr(beats, 4, b2 + 5.5), b2 + 1);
    const commands = fit(after(mark(m, 0, b0 + 8), b0 + 0.5), 1, D);
    const learned = fit(after(mark(m, 1, q - 1.4), commands + 1), 0.5, D);
    // the quiz beats stay inside their line: everything has played before the manners line starts
    const inQuiz = (x: number, lo: number, room: number) => Math.min(after(x, lo), Math.max(lo, b1 - room));
    const quiz = inQuiz(mark(m, 2, q + 3), q + 0.3, 3);
    const food = inQuiz(mark(m, 3, q + 8.3), quiz + 0.8, 1.6);
    const points = inQuiz(mark(m, 4, q + 10.6), food + 0.6 + LOST_LEAD, 2);
    const worse = fit(after(mark(m, 5, b1 + 0.6), b1), 1.2, D);
    const third = fit(after(mark(m, 6, b1 + 6), worse + 0.6), 0.8, D);
    const forget = fit(after(mark(m, 7, b2 + 4.5), b2 + 0.6), 1.2, D);
    const none = fit(after(mark(m, 8, b3 + 5), b3 + 0.8), 0.5, D);
    // crossfade on each line start: the outgoing panel holds until the next line begins (its last
    // word has been said), then leaves while the next one comes in, so the stage is never empty
    const out = (at: number) => 1 - ease(T, at, XF);
    const inn = (at: number) => ease(T, at - 0.1, XF);
    // the quiz card enters on "general knowledge quiz" (not on "How did I check…") and leaves with
    // a dip: the outgoing panel goes, then the incoming one comes in
    const quizIn = Math.max(q + DIP, quiz - QUIZ_LEAD);
    const quizOut = b1 - 0.1;
    const dipOut = (at: number) => 1 - ease(T, at, DIP);
    const dipIn = (at: number) => ease(T, at - 0.05, DIP);
    s.panels = {
      desk: dipOut(quizIn - DIP),
      quiz: dipIn(quizIn) * dipOut(quizOut),
      // the book (with the before/after bars) leaves in a dip too: the close-up of the page only
      // comes in once the bars have gone, so it never shows through them
      book: dipIn(quizOut + DIP) * dipOut(b2 + STAT_HOLD),
      page: dipIn(b2 + STAT_HOLD + DIP) * out(b3),
      unseen: inn(b3),
    };
    // the first lesson is shown slowly while the voice sets up the test, then the lessons speed up
    const first = fit(b0 + 2.2, 4, D);
    if (T < commands) {
      const k = progress(T, first, 4.5);
      s.lesson = { index: 0, card: ease(T, first, 0.8), reply: clamp01((k - 0.25) / 0.25), guess: clamp01((k - 0.55) / 0.2), tick: clamp01((k - 0.8) / 0.12) };
    } else {
      const span = Math.max(0.5, learned - commands);
      const rounds = 5;
      const ph = Math.min(rounds - 1e-6, (progress(T, commands, span) * rounds));
      const k = ph - Math.floor(ph);
      const done = T >= commands + span;
      s.lesson = {
        index: (Math.floor(ph) + 1) % LESSONS.length,
        card: done ? 1 : clamp01(k / 0.2),
        reply: done ? 1 : clamp01((k - 0.2) / 0.25),
        guess: done ? 1 : clamp01((k - 0.45) / 0.25),
        tick: done ? 1 : clamp01((k - 0.72) / 0.15),
      };
    }
    s.tally = { fill: Math.max(ease(T, first + 4.2, 0.2) / TALLY, progress(T, commands, Math.max(0.5, learned - commands))), learned: ease(T, learned - 0.1, 0.45) };
    // the options are read one by one, "food" third, so they pop in ~0.8 s apart around it; the
    // right one is ticked once all four are out, before the meter drops on "points"
    const opt0 = Math.max(quiz + 0.6, food - 1.6);
    const step = Math.max(0.3, Math.min(0.8, (food - opt0) / QUIZ_RIGHT));
    const tickAt = Math.min(points - 0.3, Math.max(food + 0.5, opt0 + 3 * step + 0.4));
    s.quiz = {
      title: ease(T, quizIn, 0.45),
      question: ease(T, quiz + 0.6, 0.6),
      options: QUIZ_OPTIONS.map((_, i) => ease(T, opt0 + i * step - 0.1, 0.35)),
      tick: ease(T, tickAt, 0.4),
      drop: ease(T, points - LOST_LEAD, 0.8),
    };
    s.book = { blur: ease(T, worse - 0.1, 1.2), fall: ease(T, worse + 0.6, 0.9), hurt: bump(T, worse, 1.6) };
    s.stat = { opacity: ease(T, b1 + 0.2, 0.4), shrink: ease(T, third - 0.2, 0.9), text: ease(T, third - 0.1, 0.45) };
    const pageAt = b2 + STAT_HOLD + DIP;
    s.page = { zoom: ease(T, pageAt - 0.1, 0.8), fade: ease(T, pageAt + 0.8, 1.5), forget: ease(T, forget - 0.1, 1.2) };
    const neverAt = fit(b3 + 2.4, 0.5, D);
    s.unseen = {
      cards: progress(T, b3 + 0.3, Math.max(0.5, neverAt + 0.6 - b3 - 0.3)),
      cross: progress(T, neverAt + 0.3, Math.max(0.4, none - neverAt - 0.5)),
      none: ease(T, none - 0.1, 0.45),
    };
    return s;
  }

  // lora
  const b1 = after(beatOr(beats, 1, b0 + 8.4), b0 + 1);
  const well = fit(after(mark(m, 0, b0 + 4.2), b0 + 0.6), 0.6, D);
  const drop = fit(after(mark(m, 1, well + 2), well + 0.4), 1, D);
  const up = fit(after(mark(m, 2, drop + 1.2), drop + 0.4), 0.6, D);
  const some = fit(after(mark(m, 3, b1 + 2.4), b1 + 0.4), 0.5, D);
  const noneAt = fit(some + 1.6, 0.5, D);
  s.lora = {
    ticks: progress(T, well - 0.8, 1.2),
    leftBlur: ease(T, drop - 0.2, 0.8),
    leftFall: ease(T, drop + 0.2, 0.8),
    rightGlow: bump(T, drop + 0.1, 1.4),
    up: ease(T, up - 0.1, 0.5),
    rows: ease(T, b1 + 0.1, 0.4),
    rowFill: progress(T, b1 + 0.3, Math.max(0.5, some - b1 - 0.3)),
    some: ease(T, some - 0.1, 0.45),
    none: ease(T, noneAt, 0.45),
  };
  return s;
}
