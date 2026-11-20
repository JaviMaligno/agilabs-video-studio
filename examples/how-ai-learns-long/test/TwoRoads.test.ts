// Behaviour of TwoRoads (the fork) and its totality over any t, beats and marks.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FT_TAG, LEFT_SIGN, NEW_DAYS, OLD_DAYS, POLICY, RIGHT_SIGN, frameState } from '../src/anim/TwoRoads.state.ts';

const UNIT = new Set(['road', 'split', 'lit', 'sign', 'note', 'binder', 'book', 'pen', 'write', 'tag', 'doors', 'opacity', 'strike', 'question', 'armUp']);

const walk = (v: unknown, path: string, key = '') => {
  if (typeof v === 'number') {
    assert.ok(Number.isFinite(v), `${path} is ${v}`);
    if (UNIT.has(key)) assert.ok(v >= 0 && v <= 1, `${path} = ${v} outside [0, 1]`);
    if (key === 'look') assert.ok(v >= -1 && v <= 1, `${path} = ${v}`);
  } else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${path}[${i}]`, key));
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, `${path}.${k}`, k);
};

const REAL = { beats: [0.2, 10.15], dur: 17.4, marks: [3.84, 7.52, 14.91] };
const SCENES: { beats: number[]; dur: number; marks?: number[] }[] = [
  REAL,
  { beats: [], dur: 5 },
  { beats: [], dur: 5, marks: [] },
  { beats: [1, 30], dur: 4, marks: [20, 25, 40] },
  { beats: [0.2, 10], dur: 17, marks: [NaN, NaN, NaN] },
  { beats: [5, 1], dur: 12, marks: [9, 2, 1] },
  { beats: [0], dur: 0.5, marks: [Infinity, -3, NaN] },
];

test('TwoRoads is total over t in [-1, dur + 1]', () => {
  for (const sc of SCENES) {
    for (let t = -1; t <= sc.dur + 1; t += 0.25) walk(frameState({ marks: sc.marks }, t, sc.beats, sc.dur), `t=${t} ${JSON.stringify(sc)}`);
    for (const t of [NaN, Infinity, -Infinity]) walk(frameState({ marks: sc.marks }, t, sc.beats, sc.dur), `t=${t}`);
  }
});

test('TwoRoads: road from frame 0, nothing else before the first beat', () => {
  const s = frameState({ marks: REAL.marks }, 0, REAL.beats, REAL.dur);
  assert.equal(s.road, 1);
  assert.equal(s.split, 0);
  assert.equal(s.left.sign, 0);
  assert.equal(s.right.sign, 0);
  assert.equal(s.card.opacity, 0);
});

test('TwoRoads: left lights on "leave", right on "change", card struck on "fourteen"', () => {
  const at = (t: number) => frameState({ marks: REAL.marks }, t, REAL.beats, REAL.dur);
  assert.equal(at(3.5).left.sign, 0);
  assert.ok(at(4.6).left.sign > 0.9 && at(4.6).left.note > 0.5);
  assert.equal(at(4.6).right.sign, 0);
  assert.ok(at(8.5).right.sign > 0.9 && at(8.5).right.book > 0.9);
  assert.equal(at(8.5).card.opacity, 0);
  assert.ok(at(13.5).card.opacity > 0.9);
  assert.equal(at(14.5).card.strike, 0);
  assert.equal(at(15.9).card.strike, 1);
  assert.ok(at(15.9).card.write > 0.9);
  // every door pulses after beat 1
  assert.ok(at(12.5).doors.every((d) => d > 0.3));
});

test('TwoRoads: end state at dur', () => {
  const s = frameState({ marks: REAL.marks }, REAL.dur, REAL.beats, REAL.dur);
  assert.deepEqual([s.split, s.left.sign, s.right.sign, s.right.tag, s.card.opacity, s.card.strike, s.card.write, s.card.question], [1, 1, 1, 1, 1, 1, 1, 1]);
  const late = frameState({ marks: [50, 60, 70] }, 4, [1, 30], 4);
  assert.equal(late.card.write, 1);
});

test('TwoRoads: texts', () => {
  assert.equal(LEFT_SIGN, 'hand it what it needs');
  assert.equal(RIGHT_SIGN, 'change the model');
  assert.equal(FT_TAG, 'fine-tuning');
  assert.equal(POLICY.join(' '), 'Returns: 30 days, unworn, in the box');
  assert.deepEqual([OLD_DAYS, NEW_DAYS], ['30', '14']);
});
