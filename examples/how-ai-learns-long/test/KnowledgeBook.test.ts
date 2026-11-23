import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHAT_CARDS, frameState } from '../src/anim/KnowledgeBook.state.ts';

// Numbers that are not [0, 1] progress: angles, oscillations.
const FREE = new Set(['swing', 'turn', 'bob']);

const check = (value: unknown, path: string) => {
  if (typeof value === 'number') {
    assert.ok(Number.isFinite(value), `${path} is ${value}`);
    const key = path.split('.').at(-1)!;
    if (!FREE.has(key)) assert.ok(value >= 0 && value <= 1, `${path} = ${value} is outside [0, 1]`);
  } else if (Array.isArray(value)) value.forEach((v, i) => check(v, `${path}[${i}]`));
  else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) check(v, `${path}.${k}`);
};

// Real beats and marks (scene seconds) from the narrated timeline, plus broken variants.
const REAL = {
  // marks: [school, packed, millions, conversations, manners, line, tuning, remember]
  // (said in the order conversations, line, tuning, manners, remember)
  school: { beats: [1.2, 17.47], marks: [3.64, 7.16, 12.76, 22.23, 31.35, 26.79, 29.75, 32.143], dur: 33.71 },
  finetune: { beats: [1.2, 10.19, 21.9], marks: [3.24, 16.39, 24.74], dur: 26.13 },
  retrain: { beats: [0.2, 10.23], marks: [3.04, 6.56, 8.48, 12.75], dur: 14.87 },
} as const;

test('KnowledgeBook is total over [-1, dur + 1] with normal, missing, late and NaN marks', () => {
  for (const [mode, r] of Object.entries(REAL)) {
    const variants: { beats: number[]; marks?: number[]; dur: number }[] = [
      { beats: [...r.beats], marks: [...r.marks], dur: r.dur },
      { beats: [], dur: r.dur },
      { beats: [...r.beats], marks: r.marks.map((m) => m + 40), dur: r.dur },
      { beats: [NaN, NaN], marks: r.marks.map(() => NaN), dur: r.dur },
      { beats: [...r.beats].reverse(), marks: [...r.marks].reverse(), dur: r.dur },
      { beats: [0], marks: [...r.marks], dur: 0.5 },
    ];
    for (const v of variants) {
      for (let t = -1; t <= v.dur + 1; t += 0.25) {
        check(frameState({ mode, marks: v.marks }, t, v.beats, v.dur), `${mode}@${t}`);
      }
      check(frameState({ mode, marks: v.marks }, NaN, v.beats, v.dur), `${mode}@NaN`);
    }
  }
  check(frameState({ mode: 'nope' }, 1, [], 4), 'unknown mode');
});

test('school: books stream in on "school", the tag on "millions"', () => {
  const { beats, marks, dur } = REAL.school;
  const at = (t: number) => frameState({ mode: 'school', marks: [...marks] }, t, [...beats], dur);
  assert.equal(at(0).book.manners, 0);
  assert.equal(at(0).sticky.opacity, 0);
  assert.equal(at(0).label.pop, 0);
  assert.ok(at(5.5).stream > 0 && at(5.5).stream < 1, 'streaming between school and packed');
  assert.equal(at(12).price.pop, 0);
  assert.equal(at(14).price.pop, 1);
  assert.equal(at(14).label.opacity, 1);
  assert.equal(at(14).second.label, 0);
  const end = at(dur);
  assert.equal(end.book.grow, 1);
  assert.equal(end.sticky.pin, 1);
});

test('school, line 2: a distinct second stage: tag and books leave, the label changes, chat cards become the manners chapter', () => {
  const { beats, marks, dur } = REAL.school;
  const at = (t: number) => frameState({ mode: 'school', marks: [...marks] }, t, [...beats], dur);
  const b1 = beats[1];
  // still the first stage until the line starts
  const before = at(b1 - 0.1);
  assert.equal(before.price.leave, 0);
  assert.equal(before.label.opacity, 1);
  assert.ok(before.pile.opacity > 0.9);
  // as "Then a second, much shorter training" is said: the old label, the price tag and the pile go
  const s1 = at(b1 + 1);
  assert.equal(s1.price.leave, 1, 'the price tag has left');
  assert.equal(s1.pile.opacity, 0, 'the pile of books has left');
  assert.equal(s1.label.opacity, 0, '"pre-training (school)" has gone');
  assert.equal(s1.second.label, 1, '"instruction tuning (manners)" is in');
  assert.equal(s1.second.lit, 0, 'it is not lit before it is named');
  // the two labels never show together (a dip, not a crossfade)
  for (let t = b1 - 0.2; t <= b1 + 1; t += 0.01) {
    const s = at(t);
    assert.ok(Math.min(s.label.opacity, s.second.label) < 0.02, `two labels at ${t.toFixed(2)}`);
  }
  // no cards before "conversations"; then they slide in one after another
  assert.deepEqual(at(marks[3] - 0.1).second.cards, [0, 0, 0]);
  assert.equal(CHAT_CARDS, 3);
  const c1 = at(marks[3] + 0.8).second.cards;
  assert.ok(c1[0] === 1 && c1[1] === 0 && c1[2] === 0, `first card only: ${c1}`);
  const c2 = at(25.6).second.cards;
  assert.ok(c2[0] === 1 && c2[1] === 1 && c2[2] === 0, `two cards on "a good answer": ${c2}`);
  assert.equal(at(marks[5] - 0.6).second.cards[2], 0, 'the third card waits for "one line"');
  assert.deepEqual(at(marks[5] + 0.4).second.cards, [1, 1, 1], 'the third card is in on "line"');
  // they stay on screen (not flying) while the line is read, then fly into the book
  assert.equal(at(marks[5] + 0.5).second.flow, 0);
  assert.equal(at(marks[5] + 0.5).book.manners, 0, 'no chapter before the cards have flown in');
  // they stay while "…followed to the letter" is said, and fly in on "That's instruction tuning"
  const tuning = marks[6];
  assert.equal(at(tuning - 1).second.flow, 0, 'still on screen on "followed to the letter"');
  assert.ok(at(tuning).second.flow > 0 && at(tuning).second.flow < 1, 'flying into the book on "instruction tuning"');
  assert.ok(at(tuning).second.lit > 0.5, 'the label glows when it is named');
  assert.equal(at(tuning - 1).second.lit, 0);
  assert.ok(at(marks[4]).second.lit < 0.01, 'and the glow is over by "manners"');
  // the chapter "manners" is there and lit on the word
  const named = at(marks[4] + 0.3);
  assert.equal(named.second.flow, 1, 'the cards have gone into the book by "manners"');
  assert.equal(named.book.manners, 1);
  assert.ok(named.book.mannersLit > 0.5);
  assert.equal(named.sticky.opacity, 0, 'the sticky note waits for "Remember that one"');
  // the sticky note "One line, please" on "Remember that one"
  assert.equal(at(marks[7] - 0.2).sticky.opacity, 0);
  assert.ok(at(marks[7] + 0.3).sticky.opacity > 0.9);
  assert.equal(at(dur).sticky.opacity, 1);
  assert.equal(at(dur).sticky.pin, 1);
  assert.equal(at(dur).second.label, 1);
});

test('school: without marks the second stage still plays in order inside line 2', () => {
  const { beats, dur } = REAL.school;
  const at = (t: number) => frameState({ mode: 'school' }, t, [...beats], dur);
  assert.equal(at(beats[1] + 1).second.label, 1);
  const end = at(dur);
  assert.deepEqual(end.second.cards, [1, 1, 1]);
  assert.equal(end.second.flow, 1);
  assert.equal(end.book.manners, 1);
  assert.equal(end.sticky.opacity, 1);
});

test('finetune: cards before the rewrite, the pen rewrites every line, then the door opens', () => {
  const { beats, marks, dur } = REAL.finetune;
  const at = (t: number) => frameState({ mode: 'finetune', marks: [...marks] }, t, [...beats], dur);
  assert.equal(at(1).cards.opacity, 0);
  assert.equal(at(4).cards.opacity, 1);
  assert.equal(at(14).book.rewrite, 0);
  assert.ok(at(18).book.rewrite > 0 && at(18).pen.opacity > 0);
  assert.equal(at(21.5).book.rewrite, 1);
  // "It's the most thorough way" (b2 .. b2 + 1.32) stays on the rewritten book alone
  assert.equal(at(beats[2] + 1.3).door.opacity, 0, 'no door on "most thorough"');
  assert.ok(at(marks[2] - 0.1).door.opacity > 0.9 && at(marks[2] - 0.1).door.open === 0, 'the door is in by "damage"');
  const end = at(dur);
  assert.equal(end.door.open, 1);
  assert.equal(end.label.pop, 1);
});

test('retrain: the card flips to 14, the page still says 30, the clock runs, the pen stops', () => {
  const { beats, marks, dur } = REAL.retrain;
  const at = (t: number) => frameState({ mode: 'retrain', marks: [...marks] }, t, [...beats], dur);
  assert.equal(at(0).policy.flip, 0);
  assert.equal(at(3).policy.flip, 1);
  assert.equal(at(2.5).clock.opacity, 0);
  assert.ok(at(5).clock.turn > 0);
  assert.equal(at(6).page30.circle, 0);
  assert.equal(at(8).page30.circle, 1);
  assert.equal(at(9.5).pen.opacity, 0);
  assert.ok(at(11.5).pen.opacity > 0.9 && at(11.5).pen.stop === 0);
  assert.equal(at(dur).pen.stop, 1);
  assert.equal(at(dur).pen.bob, 0);
});
