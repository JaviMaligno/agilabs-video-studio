// Pure state of the shop manual: chapter 3, "looking it up (the manual)" (script rows 15-20).
// Six panels, one per narration line, one after the other, crossfading on each line's start:
//   (panels crossfade on each line start; the stage is never empty)
//   0 shelf  - a binder on the shop's shelf lights up (mark "manual"); a customer question comes in;
//              the robot pulls two pages out of the binder and answers from them.
//   1 split  - the note read top to bottom on every chat (mark "whole") vs the binder opened at
//              one tab, "Returns".
//   2 upload - an upload arrow drops PDFs into the binder (mark "upload"); a magnifier picks two
//              paragraphs and hands them to the robot.
//   3 swap   - the "30 days" page slides out, the "14 days" page slides in (mark "swap").
//   4 wrong  - the robot opens "Shipping" instead of "Returns" (mark "wrong") and answers with
//              confidence; a red underline.
//   5 end    - the note and the binder by the robot fade; the robot is blank; the book glows
//              (mark "inside").
// Marks: [manual, whole, upload, swap, wrong, inside], in scene seconds. No Remotion or React here.
import { beatOr, blinkAt, bump, ease, lerp, loopTime, mark } from './memory.ts';
import { clamp01, sceneTime } from './steps.ts';

export type ShopManualProps = { marks?: number[] };

/** Texts on screen. */
export const MANUAL_LABEL = 'retrieval (the manual)';
export const NOTE_LABEL = 'the prompt (the note)';
export const QUESTION = 'Can I return worn shoes?';
export const GOOD_ANSWER = 'Sorry, unworn only, within 30 days.';
export const WRONG_ANSWER = 'Sure, return them any time!';
export const TABS = ['Returns', 'Shipping', 'Sizes'] as const;

export type ShopManualState = {
  /** Panel opacities, in [0, 1]: one at a time, two only during the crossfade at a line start. */
  panels: { shelf: number; split: number; upload: number; swap: number; wrong: number; end: number };
  robot: { opacity: number; blink: number; armUp: number; bob: number };
  shelf: { binderLit: number; label: number; question: number; pull: number; answer: number };
  split: { read: number; sweep: number; chats: number[]; open: number; tab: number };
  upload: { arrow: number; pdfs: number[]; lens: number; lensX: number; lensY: number; picked: number[]; lift: number };
  swap: { strike: number; out: number; in: number };
  wrong: { question: number; tab: number; answer: number; underline: number; pulse: number };
  end: { props: number; fade: number; book: number; glow: number };
};

/** Length of the crossfade between two panels, in seconds. */
export const XF = 0.4;

/**
 * Panel `i` of `starts`: holds until the next line starts (its last word has been said), then
 * crossfades with the next panel, which comes in from just before that start: the stage is never
 * empty and two panels share it only during the XF-second crossfade.
 */
const panel = (T: number, starts: number[], i: number): number => {
  const inn = i === 0 ? 1 : ease(T, starts[i] - 0.1, XF);
  const out = i + 1 < starts.length ? ease(T, starts[i + 1], XF) : 0;
  return clamp01(inn * (1 - out));
};

export function frameState(props: ShopManualProps, t: number, beats: number[], dur: number): ShopManualState {
  const T = sceneTime(Number.isFinite(t) ? t : 0, dur);
  const tm = loopTime(t, dur);
  const m = props?.marks;
  // Line starts (beats), kept in order, with fallbacks when a beat is missing.
  const b: number[] = [];
  b[0] = beatOr(beats, 0, 0.2);
  const gaps = [13, 7.7, 10, 3.7, 8.7];
  for (let i = 1; i < 6; i++) b[i] = Math.max(b[i - 1] + 1.2, beatOr(beats, i, b[i - 1] + gaps[i - 1]));
  // Marks, each within its own line (never before the line starts, never past the next one).
  const mk = (i: number, fb: number) => {
    const hi = i + 1 < 6 ? b[i + 1] - 0.4 : Number.POSITIVE_INFINITY;
    return Math.min(Math.max(mark(m, i, fb), b[i]), Math.max(b[i], hi));
  };
  const manual = mk(0, b[0] + 0.7);
  const whole = mk(1, b[1] + 2.6);
  const upload = mk(2, b[2] + 0.5);
  const swap = mk(3, b[3] + 1.5);
  const wrong = mk(4, b[4] + 1.2);
  const inside = Math.max(b[5] + 1.5, fin(mark(m, 5, b[5] + 8.6), b[5] + 8.6));
  const at = (i: number, f: number) => lerp(b[i], b[i + 1], f);

  const starts = [0, b[1], b[2], b[3], b[4], b[5]];
  const panels = {
    shelf: panel(T, starts, 0),
    split: panel(T, starts, 1),
    upload: panel(T, starts, 2),
    swap: panel(T, starts, 3),
    wrong: panel(T, starts, 4),
    end: panel(T, starts, 5),
  };

  // 0 shelf: binder lights on "manual", the question arrives, two pages travel to the robot.
  const qAt = Math.max(manual + 1.2, at(0, 0.3));
  const pullAt = Math.max(qAt + 1.0, at(0, 0.48));
  const answerAt = Math.max(pullAt + 1.4, at(0, 0.66));
  const shelf = {
    binderLit: ease(T, manual - 0.2, 0.5),
    label: ease(T, manual - 0.1, 0.5),
    question: ease(T, qAt, 0.5),
    pull: ease(T, pullAt, 1.2),
    answer: ease(T, answerAt, 0.5),
  };

  // 1 split: three passes of a reading band down the note, a chat chip lit after each pass; the
  // binder opens at the "Returns" tab on "The manual is opened...".
  const pass = 1.1;
  const read0 = Math.max(b[1] + 0.4, whole - 1.2);
  const passes = [0, 1, 2].map((k) => (T - read0 - k * (pass + 0.15)) / pass);
  const active = passes.findIndex((p) => p >= 0 && p < 1);
  const openAt = Math.max(read0 + 3 * (pass + 0.15) + 0.2, at(1, 0.55));
  const split = {
    read: ease(T, read0 - 0.3, 0.3) * (1 - ease(T, read0 + 3 * (pass + 0.15), 0.3)),
    sweep: active >= 0 ? clamp01(passes[active]) : 0,
    chats: [0, 1, 2].map((k) => ease(T, read0 + k * (pass + 0.15) + pass - 0.1, 0.3)),
    open: ease(T, openAt, 0.7),
    tab: ease(T, openAt + 0.6, 0.4),
  };

  // 2 upload: arrow, three PDFs dropping one after another, then the magnifier scans the page
  // ("searches them"), picks two paragraphs, which lift off to the robot ("hands the AI the parts").
  const scanAt = Math.max(upload + 2.4, at(2, 0.5));
  const pickA = scanAt + 0.9;
  const pickB = scanAt + 1.8;
  const liftAt = Math.max(pickB + 0.6, at(2, 0.78));
  const lensPath = clamp01((T - scanAt) / 2.2);
  const upl = {
    arrow: ease(T, upload - 0.3, 0.4) * (1 - 0.6 * ease(T, upload + 2.2, 0.5)),
    pdfs: [0, 1, 2].map((k) => ease(T, upload + 0.2 + 0.45 * k, 0.7)),
    lens: ease(T, scanAt - 0.3, 0.4) * (1 - ease(T, liftAt + 0.2, 0.4)),
    lensX: 0.5 + 0.28 * Math.sin(lensPath * Math.PI * 2.2),
    lensY: lerp(0.1, 0.85, lensPath),
    picked: [ease(T, pickA, 0.35), ease(T, pickB, 0.35)],
    lift: ease(T, liftAt, 1.0),
  };

  // 3 swap: the old page out on "swap", the new one in.
  const sw = { strike: ease(T, b[3] + 0.3, 0.5), out: ease(T, swap - 0.2, 0.9), in: ease(T, swap + 0.1, 0.8) };

  // 4 wrong: the question again, the Shipping tab pulled on "wrong", a confident answer, the underline.
  const ansAt = Math.max(wrong + 1.2, at(4, 0.42));
  const ulAt = Math.max(ansAt + 1.0, at(4, 0.68));
  const wr = {
    question: ease(T, b[4] - 0.1, 0.4),
    tab: ease(T, wrong - 0.2, 0.5),
    answer: ease(T, ansAt, 0.45),
    underline: ease(T, ulAt, 0.6),
    pulse: ease(T, ulAt, 0.6) * (0.6 + 0.4 * Math.sin(tm * 4.4)),
  };

  // 5 end: the note and the binder by the robot ("while the note or the manual is there") fade;
  // the robot is blank; the book appears and glows on "inside".
  const fadeAt = Math.max(b[5] + 0.8, lerp(b[5], inside, 0.7));
  const end = {
    props: ease(T, b[5], 0.5),
    fade: ease(T, fadeAt, 0.8),
    book: ease(T, fadeAt + 0.3, 0.7),
    glow: ease(T, inside - 0.3, 0.6),
  };

  return {
    panels,
    robot: {
      opacity: clamp01(1 - panels.split),
      blink: blinkAt(tm),
      armUp: clamp01(Math.max(shelf.pull * panels.shelf, upl.lift * panels.upload, sw.out * panels.swap, wr.tab * panels.wrong)),
      bob: Math.sin(tm * 1.7) * 4 + 6 * bump(T, wrong + 0.2, 0.6),
    },
    shelf,
    split,
    upload: upl,
    swap: sw,
    wrong: wr,
    end,
  };
}

const fin = (x: number, fb: number): number => (Number.isFinite(x) ? x : fb);
