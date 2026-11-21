import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DIP, LESSONS, QUIZ_LEAD, QUIZ_OPTIONS, QUIZ_RIGHT, STAT_HOLD, frameState, XF } from '../src/anim/TerminalTest.state.ts';

const FREE = new Set(['index']);

const check = (value: unknown, path: string) => {
  if (typeof value === 'number') {
    assert.ok(Number.isFinite(value), `${path} is ${value}`);
    const key = path.split('.').at(-1)!;
    if (!FREE.has(key)) assert.ok(value >= 0 && value <= 1, `${path} = ${value} is outside [0, 1]`);
  } else if (Array.isArray(value)) value.forEach((v, i) => check(v, `${path}[${i}]`));
  else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) check(v, `${path}.${k}`);
};

const REAL = {
  // marks: [commands, learned, quiz, food, points, worse, third, forget, none]
  full: { beats: [0.2, 14.31, 27, 34.39, 39.94], marks: [8.32, 12.88, 17.31, 22.591, 24.91, 27.68, 32.96, 39.07, 44.86], dur: 46.433 },
  lora: { beats: [0.2, 8.63], marks: [4.48, 6.48, 7.68, 10.99], dur: 14.63 },
} as const;

test('TerminalTest is total over [-1, dur + 1] with normal, missing, late and NaN marks', () => {
  for (const [mode, r] of Object.entries(REAL)) {
    const variants: { beats: number[]; marks?: number[]; dur: number }[] = [
      { beats: [...r.beats], marks: [...r.marks], dur: r.dur },
      { beats: [], dur: r.dur },
      { beats: [...r.beats], marks: r.marks.map((m) => m + 50), dur: r.dur },
      { beats: r.beats.map(() => NaN), marks: r.marks.map(() => NaN), dur: r.dur },
      { beats: [...r.beats].reverse(), marks: [...r.marks].reverse(), dur: r.dur },
      { beats: [0], marks: [...r.marks], dur: 0.5 },
    ];
    for (const v of variants) {
      for (let t = -1; t <= v.dur + 1; t += 0.25) {
        const s = frameState({ mode, marks: v.marks }, t, v.beats, v.dur);
        check(s, `${mode}@${t}`);
        assert.ok(Number.isInteger(s.lesson.index) && s.lesson.index >= 0 && s.lesson.index < LESSONS.length);
      }
      check(frameState({ mode, marks: v.marks }, NaN, v.beats, v.dur), `${mode}@NaN`);
    }
  }
});

test('full: ticks pile up, then the manners blur and the note falls, the close-up, then "none"', () => {
  const { beats, marks, dur } = REAL.full;
  const at = (t: number) => frameState({ mode: 'full', marks: [...marks] }, t, [...beats], dur);
  assert.equal(at(0).panels.desk, 1);
  assert.equal(at(0).tally.fill, 0);
  assert.ok(at(10).tally.fill > 0.2 && at(10).tally.fill < 1);
  assert.equal(at(13.5).tally.fill, 1);
  assert.equal(at(13.5).tally.learned, 1);
  assert.equal(at(28).panels.book, 1);
  assert.ok(at(29.5).book.blur > 0.9 && at(29.5).book.fall > 0.9);
  assert.equal(at(32).stat.text, 0);
  assert.equal(at(33.5).stat.text, 1);
  // "more than ⅓ worse" (4 words) stays at least 4 / 3.5 + 1 s after it lands on "third"
  assert.equal(at(marks[6] + 4 / 3.5 + 1).panels.book, 1, 'the figure holds long enough to read');
  assert.equal(at(36.2).panels.page, 1);
  assert.equal(at(38).page.forget, 0);
  assert.equal(at(40.6).panels.unseen, 1);
  assert.equal(at(44).unseen.none, 0);
  const end = at(dur);
  assert.equal(end.unseen.none, 1);
  assert.equal(end.unseen.cross, 1);
  assert.equal(end.panels.desk, 0);
  assert.equal(end.panels.quiz, 0);
});

test('full: the quiz line: the card on "quiz", the options as they are read, "food" ticked, the meter drops on "points"', () => {
  const { beats, marks, dur } = REAL.full;
  const at = (t: number) => frameState({ mode: 'full', marks: [...marks] }, t, [...beats], dur);
  assert.equal(at(14).panels.quiz, 0, 'no quiz while the first line is spoken');
  assert.equal(at(15.5).panels.quiz, 0, 'nor during "How did I check what it lost?"');
  assert.equal(at(15.5).panels.desk, 1, 'the terminal stays meanwhile');
  assert.equal(at(16.2).panels.quiz, 0, 'the card waits for "general knowledge quiz"');
  assert.equal(at(17).panels.quiz, 1);
  assert.equal(at(17).panels.desk, 0);
  assert.equal(at(17.5).quiz.title, 1);
  assert.equal(at(17.5).quiz.question, 0, 'the question comes after "quiz"');
  assert.equal(at(19).quiz.question, 1);
  assert.deepEqual(at(20.5).quiz.options, [0, 0, 0, 0]);
  assert.deepEqual(at(22.2).quiz.options, [1, 1, 0, 0], 'soil and minerals out before "food"');
  const all = at(23.7);
  assert.deepEqual(all.quiz.options, QUIZ_OPTIONS.map(() => 1));
  assert.equal(all.quiz.tick, 0, 'the tick waits for all four options');
  assert.equal(QUIZ_OPTIONS[QUIZ_RIGHT], 'food');
  assert.equal(at(24.5).quiz.tick, 1);
  assert.equal(at(24.5).quiz.drop, 0, 'the meter drops on "lost (some points)"');
  assert.ok(at(24.8).quiz.drop > 0, 'from "lost", before "points"');
  assert.equal(at(25.5).quiz.drop, 1, 'and has dropped before the manners line');
  assert.equal(at(26.85).panels.quiz, 1, 'the dropped meter holds 1.5 s before the card leaves');
  assert.equal(at(27.6).panels.quiz, 0, 'and is gone once the manners line has started');
  assert.equal(at(27.6).panels.book, 1);
});

test('full: without marks the quiz still plays inside its line', () => {
  const { beats, dur } = REAL.full;
  const before = frameState({ mode: 'full' }, beats[2] - 0.05, [...beats], dur);
  assert.deepEqual(before.quiz.options, QUIZ_OPTIONS.map(() => 1));
  assert.equal(before.quiz.tick, 1);
  assert.equal(before.quiz.drop, 1);
});

test('lora: same ticks on both sides; only the rewritten book loses its manners; "some" vs "none"', () => {
  const { beats, marks, dur } = REAL.lora;
  const at = (t: number) => frameState({ mode: 'lora', marks: [...marks] }, t, [...beats], dur);
  assert.equal(at(0).lora.ticks, 0);
  assert.equal(at(5.5).lora.ticks, 1);
  assert.equal(at(6).lora.leftFall, 0);
  assert.equal(at(7.6).lora.leftFall, 1);
  assert.equal(at(8.2).lora.up, 1);
  assert.equal(at(8.2).lora.rows, 0);
  assert.equal(at(10.5).lora.some, 0);
  const end = at(dur);
  assert.equal(end.lora.some, 1);
  assert.equal(end.lora.none, 1);
  assert.equal(end.lora.rowFill, 1);
});

test('full: the stage is never empty for long and panels overlap only in a transition', () => {
  const { beats, marks, dur } = REAL.full;
  // a crossfade at the unseen commands; short dips into and out of the quiz card and into the close-up
  const starts = [beats[4]];
  const quizIn = marks[2] - QUIZ_LEAD;
  const dips = [quizIn - DIP, beats[2] - 0.1, beats[3] + STAT_HOLD];
  let empty = 0;
  for (let t = 0; t <= dur; t += 0.02) {
    const p = frameState({ mode: 'full', marks: [...marks] }, t, [...beats], dur).panels;
    const vals = Object.values(p);
    const inDip = dips.some((d) => t >= d && t <= d + 2 * DIP);
    if (Math.max(...vals) < 0.4) {
      assert.ok(inDip, `stage nearly empty outside a dip at ${t.toFixed(2)}`);
      empty += 0.02;
      assert.ok(empty <= 0.25, `stage nearly empty for ${empty.toFixed(2)} s at ${t.toFixed(2)}`);
    } else empty = 0;
    const shown = vals.filter((v) => v > 0.001).length;
    assert.ok(shown <= 2, `${shown} panels at ${t.toFixed(2)}`);
    if (shown === 2) assert.ok(inDip || starts.some((b) => t >= b - 0.1 && t <= b + XF), `two panels outside a transition at ${t.toFixed(2)}`);
    // in a dip the two drawings never pile up: while one is half on, the other is barely there
    if (inDip && shown === 2) assert.ok(Math.min(...vals.filter((v) => v > 0.001)) < 0.35, `two panels cross in a dip at ${t.toFixed(2)}`);
  }
  // the outgoing panel is still fully on until it starts to leave
  for (const b of [...starts, ...dips.map((d) => d + 0.1)]) {
    const p = frameState({ mode: 'full', marks: [...marks] }, b - 0.15, [...beats], dur).panels;
    assert.ok(Math.max(...Object.values(p)) === 1, `a panel holds at ${(b - 0.15).toFixed(2)}`);
  }
});
