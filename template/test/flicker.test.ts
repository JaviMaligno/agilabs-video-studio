import { test } from 'node:test';
import assert from 'node:assert/strict';
import { flickerFrames, stamp } from '../scripts/flicker.mjs';

const frame = (v: number, n = 16) => new Uint8Array(n).fill(v);

test('a frame that differs from both neighbours, which match, is a flicker', () => {
  assert.deepEqual(flickerFrames([frame(10), frame(10), frame(60), frame(10), frame(10)]), [2]);
});

test('alternating frames are all flagged', () => {
  const f = [frame(10), frame(60), frame(10), frame(60), frame(10)];
  assert.deepEqual(flickerFrames(f), [1, 2, 3]);
});

test('a cut, a fade and a still are not flickers', () => {
  assert.deepEqual(flickerFrames([frame(10), frame(10), frame(200), frame(200)]), []);
  assert.deepEqual(flickerFrames([0, 20, 40, 60, 80].map((v) => frame(v))), []);
  assert.deepEqual(flickerFrames([frame(5), frame(5), frame(5)]), []);
});

test('timestamps read as m:ss.ss', () => {
  assert.equal(stamp(0, 30), '0:00.00');
  assert.equal(stamp(30 * 75 + 15, 30), '1:15.50');
});
