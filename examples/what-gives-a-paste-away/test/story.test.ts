import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as ps from '../src/anim/PasteStory.state.ts';

const PROGRESS = new Set(['progress', 'appear', 'grow', 'fill', 'draw', 'pop', 'opacity', 'emphasis']);
const check = (value: unknown, path: string) => {
  if (typeof value === 'number') {
    assert.ok(Number.isFinite(value), `${path} is ${value}`);
    const key = path.split('.').at(-1)!.replace(/\[\d+\]$/, '');
    if (PROGRESS.has(key)) assert.ok(value >= 0 && value <= 1, `${path} = ${value} is outside [0, 1]`);
  } else if (Array.isArray(value)) value.forEach((v, i) => check(v, `${path}[${i}]`));
  else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) check(v, `${path}.${k}`);
};

const SCENARIOS = [
  { beats: [0.1, 3, 6.4, 8.9], dur: 11.5 },
  { beats: [0.3, 1.4, 2.6], dur: 6 },
  { beats: [], dur: 4 },
  { beats: [1, 9], dur: 4 },
  { beats: [0], dur: 0.5 },
];

test('PasteStory is total over [0, sceneEnd]', () => {
  for (const { beats, dur } of SCENARIOS)
    for (const t of [-1, 0, ...beats, dur / 2, dur, dur + 2, NaN]) check(ps.frameState({}, t, beats, dur), `PS@${t},dur=${dur}`);
});

test('PasteStory: one step per line, end state by the scene end', () => {
  const beats = [0.1, 3, 6.4, 8.9];
  const dur = 11.5;
  const s0 = ps.frameState({}, 0.5, beats, dur);
  assert.equal(s0.fly.progress, 0, 'the piece waits on the clipboard');
  assert.equal(s0.bubble.appear, 0);
  const s1 = ps.frameState({}, 2.9, beats, dur);
  assert.equal(s1.fly.progress, 1, 'in the wrong chat by the end of the first line');
  assert.equal(s1.bubble.appear, 0, 'the reply waits for the second line');
  const s2 = ps.frameState({}, 6.3, beats, dur);
  assert.equal(s2.bubble.stamp, 1, '"played along" lands on the second line');
  assert.deepEqual(s2.cards.pop, [0, 0], 'no question before its line');
  const s3 = ps.frameState({}, 8.8, beats, dur);
  assert.equal(s3.cards.pop[0], 1);
  assert.equal(s3.cards.pop[1], 0, 'the second question waits for its line');
  const end = ps.frameState({}, dur, beats, dur);
  assert.deepEqual(end.cards.pop, [1, 1]);
  assert.equal(end.lift.progress, 1);
  assert.equal(end.lift.flip, -1, 'the piece ends turned over');
  assert.equal(end.back.draw, 1);
  assert.equal(end.bubble.appear, 0, 'the story steps back for the questions');
});
