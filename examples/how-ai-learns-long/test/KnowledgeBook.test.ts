import { test } from 'node:test';
import assert from 'node:assert/strict';
import { frameState } from '../src/anim/KnowledgeBook.state.ts';

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
  school: { beats: [1.2, 13.15], marks: [3.8, 7.72, 11.96, 15.43, 19.51], dur: 22.1 },
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

test('school: books stream in on "school", the tag on "millions", manners then the sticky note on line 2', () => {
  const { beats, marks, dur } = REAL.school;
  const at = (t: number) => frameState({ mode: 'school', marks: [...marks] }, t, [...beats], dur);
  assert.equal(at(0).book.manners, 0);
  assert.equal(at(0).sticky.opacity, 0);
  assert.equal(at(0).label.pop, 0);
  assert.ok(at(5.5).stream > 0 && at(5.5).stream < 1, 'streaming between school and packed');
  assert.equal(at(11).price.pop, 0);
  assert.equal(at(13).price.pop, 1);
  assert.equal(at(15).book.manners, 0);
  assert.equal(at(17).book.manners, 1);
  assert.equal(at(19).sticky.opacity, 0);
  const end = at(dur);
  assert.equal(end.book.grow, 1);
  assert.equal(end.sticky.pin, 1);
  assert.equal(end.label.pop, 1);
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
