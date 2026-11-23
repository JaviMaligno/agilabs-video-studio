import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BAND_TEXT, CURVE, FURTHEST, FURTHEST_TEXT, TICKS, frameState, louderWave } from '../src/anim/PrimeCurve.state.ts';

const PROGRESS = new Set(['progress', 'appear', 'grow', 'fill', 'draw', 'pop', 'opacity', 'emphasis']);

const check = (value: unknown, path: string) => {
  if (typeof value === 'number') {
    assert.ok(Number.isFinite(value), `${path} is ${value}`);
    const key = path.split('.').at(-1)!.replace(/\[\d+\]$/, '');
    if (PROGRESS.has(key)) assert.ok(value >= 0 && value <= 1, `${path} = ${value} is outside [0, 1]`);
  } else if (Array.isArray(value)) {
    value.forEach((v, i) => check(v, `${path}[${i}]`));
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) check(v, `${path}.${k}`);
  }
};

const REAL = [0.2, 5.19, 9.14, 13.09, 18.56, 21.87, 25.34, 30.57, 34.36];
const SCENARIOS = [
  { beats: REAL, dur: 40.9 },
  { beats: [], dur: 4 },
  { beats: [1, 9], dur: 4 },
  { beats: [0], dur: 0.5 },
  { beats: [0.3, 1.4, 2.6], dur: 4 },
];

test('PrimeCurve state is total', () => {
  for (const { beats, dur } of SCENARIOS) {
    for (const t of [-1, 0, ...beats, dur / 2, dur, dur + 2, Number.NaN]) {
      check(frameState({ mode: 'waves' }, t, beats, dur), `waves@t=${t},dur=${dur},beats=[${beats}]`);
    }
  }
});

test('data is the article computation, unaltered', () => {
  assert.equal(CURVE.band, 0.0462);
  assert.equal(CURVE.min, -0.0227);
  assert.equal(CURVE.points.length, 2000);
  assert.equal(CURVE.points[0][0], 1);
  assert.equal(CURVE.points.at(-1)![0], 7);
  assert.equal(BAND_TEXT, '±0.0462');
  assert.equal(FURTHEST_TEXT, '0.023');
  assert.deepEqual(TICKS.map((t) => t.text), ['10', '1,000', '100,000', '10,000,000']);
  // The furthest point is the dip, and every point stays inside the band.
  assert.ok(CURVE.points[FURTHEST][1] < 0);
  assert.ok(Math.abs(Math.abs(CURVE.points[FURTHEST][1]) - 0.023) < 0.001);
  for (const [, r] of CURVE.points) assert.ok(Math.abs(r) < CURVE.band);
});

test('the louder wave pokes through the top of the band', () => {
  assert.ok(louderWave(6.5) > CURVE.band);
  assert.ok(louderWave(4.5) < CURVE.band);
});

test('steps land on their lines', () => {
  const at = (t: number) => frameState({ mode: 'waves' }, t, REAL, 40.9);
  assert.equal(at(0).waves[0].appear, 0);
  assert.ok(at(4).waves[0].appear > 0.9);
  assert.equal(at(9).axes, 0);
  assert.equal(at(13).draw, 0);
  assert.ok(at(16).draw > 0 && at(16).draw < 1);
  assert.equal(at(18.5).draw, 1);
  assert.equal(at(18.5).band, 0);
  assert.ok(at(20).band > 0.9);
  assert.equal(at(25).louder, 0);
  assert.ok(at(30.5).cross > 0.9);
  assert.equal(at(34).card, 0);
  assert.ok(at(36).card > 0.9);
  const end = at(40.9);
  assert.equal(end.card, 1);
  assert.equal(end.cardLine2, 1);
  assert.equal(end.draw, 1);
});
