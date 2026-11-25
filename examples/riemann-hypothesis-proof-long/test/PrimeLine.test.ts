import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as pl from '../src/anim/PrimeLine.state.ts';

const PROGRESS = new Set(['progress', 'appear', 'grow', 'fill', 'draw', 'pop', 'opacity', 'emphasis']);
const check = (value: unknown, path: string) => {
  if (typeof value === 'number') {
    assert.ok(Number.isFinite(value), `${path} is ${value}`);
    const key = path.split('.').at(-1)!.replace(/\[\d+\]$/, '');
    if (PROGRESS.has(key)) assert.ok(value >= 0 && value <= 1, `${path} = ${value} is outside [0, 1]`);
  } else if (Array.isArray(value)) value.forEach((v, i) => check(v, `${path}[${i}]`));
  else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) check(v, `${path}.${k}`);
};

const REAL = [1.2, 5.87, 9.98, 16.01, 19.88, 24.63, 26.42, 31.49];
const SCENARIOS = [
  { beats: REAL, dur: 35.5 },
  { beats: [0.3, 1.4, 2.6], dur: 4 },
  { beats: [], dur: 4 },
  { beats: [1, 9], dur: 4 },
  { beats: [0], dur: 0.5 },
  { beats: REAL.map((b) => b * 3), dur: 35.5 },
];

test('PrimeLine state is total', () => {
  for (const { beats, dur } of SCENARIOS)
    for (const t of [-1, 0, ...beats, dur / 2, dur, dur + 2])
      check(pl.frameState({ mode: 'claimed' }, t, beats, dur), `PrimeLine@t=${t},dur=${dur},beats=[${beats}]`);
});

test('the numbers match the article', () => {
  assert.equal(pl.EXPECTED, 72);
  assert.equal(pl.ACTUAL, 75);
  assert.equal(pl.SMALL_PRIMES.length, 25);
  assert.equal(Math.round(Math.log(1e6)), 14);
  assert.ok(pl.DRIFT.every((v) => Number.isFinite(v) && v >= -1));
  assert.ok(pl.DRIFT_MAX < pl.SQRT_MAX);
});

test('PrimeLine plays its beats', () => {
  const st = (t: number) => pl.frameState({ mode: 'claimed' }, t, REAL, 35.5);
  assert.equal(st(0).write, 0);
  assert.equal(st(REAL[1] - 0.2).medal, 0);
  assert.equal(st(REAL[3] - 0.2).dive, 0);
  assert.equal(st(REAL[5] - 0.1).actualText, '0');
  assert.equal(st(REAL[5] - 0.1).expectedText, '72');
  assert.equal(st(REAL[6]).actualText, '75');
  assert.equal(st(REAL[6]).chart, 0);
  assert.equal(st(35.5).bound, 1);
  assert.equal(st(35.5).sqrtLabel, 1);
  assert.equal(st(35.5).depth, pl.SQRT_MAX);
});
