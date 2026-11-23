import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as cl from '../src/anim/CriticalLine.state.ts';

const PROGRESS = new Set(['progress', 'appear', 'grow', 'fill', 'draw', 'pop', 'opacity', 'emphasis']);
const check = (value: unknown, path: string) => {
  if (typeof value === 'number') {
    assert.ok(Number.isFinite(value), `${path} is ${value}`);
    const key = path.split('.').at(-1)!.replace(/\[\d+\]$/, '');
    if (PROGRESS.has(key)) assert.ok(value >= 0 && value <= 1, `${path} = ${value} is outside [0, 1]`);
  } else if (Array.isArray(value)) value.forEach((v, i) => check(v, `${path}[${i}]`));
  else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) check(v, `${path}.${k}`);
};

const REAL = [0.2, 4.15, 6.58, 10.9, 14.6, 17.0, 21.1, 24.0];
const SCENARIOS = [
  { beats: REAL, dur: 26.6 },
  { beats: [0.3, 1.4, 2.6], dur: 4 },
  { beats: [], dur: 4 },
  { beats: [1, 9], dur: 4 },
  { beats: [0], dur: 0.5 },
  { beats: REAL.map((b) => b * 3), dur: 26.6 },
];

test('CriticalLine state is total', () => {
  for (const { beats, dur } of SCENARIOS)
    for (const t of [-1, 0, ...beats, dur / 2, dur, dur + 2])
      check(cl.frameState({ mode: 'zeros' }, t, beats, dur), `CriticalLine@t=${t},dur=${dur},beats=[${beats}]`);
});

test('CriticalLine plays its beats', () => {
  const st = (t: number) => cl.frameState({ mode: 'zeros' }, t, REAL, 26.6);
  assert.equal(cl.ZEROS.length, 10);
  assert.deepEqual(cl.TRIVIAL, [-2, -4, -6]);
  assert.equal(st(REAL[1] - 0.1).axis, 0);
  assert.equal(st(REAL[2] - 0.1).trivial[0].pop, 0);
  assert.ok(st(REAL[3] - 0.1).trivial.every((z) => z.pop === 1));
  assert.equal(st(REAL[3]).trivialOpacity, 1);
  assert.ok(st(REAL[4]).trivialOpacity < 0.5);
  assert.equal(st(REAL[4] + 0.1).strip, 0);
  assert.equal(st(REAL[5]).line, 0);
  assert.ok(st(REAL[6] - 0.1).zeros.every((z) => z.drop === 0));
  assert.ok(st(REAL[7]).zeros.every((z) => z.drop === 1));
  assert.equal(st(REAL[7] - 0.1).offShown, 0);
  assert.equal(st(REAL[7] + 0.8).offShown, 1);
  // One label at a time on the right, in order.
  for (const t of [REAL[1] + 1.5, REAL[2] + 1.5, REAL[3] + 1.5, REAL[4] + 1.5, REAL[5] + 1.5]) {
    const x = st(t);
    const shown = [x.pointsLabel, x.trivialLabel, x.simpleLabel, x.stripLabel, x.lineLabel].filter((o) => o > 0.5);
    assert.equal(shown.length, 1, `t=${t}`);
  }
  const end = st(26.6);
  assert.equal(end.offShown, 0);
  assert.equal(end.infinity, 1);
  assert.equal(end.neverLabel, 1);
  assert.equal(end.everyLabel, 1);
});
