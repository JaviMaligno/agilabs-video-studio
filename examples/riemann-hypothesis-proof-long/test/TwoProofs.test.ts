import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as m from '../src/anim/TwoProofs.state.ts';

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
const SCENARIOS = [
  { beats: [0.3, 1.4, 2.6], dur: 4 },
  { beats: [], dur: 4 },
  { beats: [1, 9], dur: 4 },
  { beats: [0], dur: 0.5 },
  { beats: [0.2, 2.31, 6.42, 10.29, 13.12, 16.43, 18.94], dur: 24.1 },
];
/** Fields that are 0..1 shares in this component (besides the house progress keys). */
const UNIT = new Set(['split', 'left', 'right', 'together', 'sheet', 'equals', 'fade', 'medal', 'notYet', 'boxes', 'prize']);
const unitCheck = (o: Record<string, unknown>, path: string) => {
  for (const [k, v] of Object.entries(o)) {
    if (!UNIT.has(k)) continue;
    for (const x of Array.isArray(v) ? v : [v]) assert.ok(typeof x === 'number' && x >= 0 && x <= 1, `${path}.${k} = ${x}`);
  }
};

test('TwoProofs is total over t<0, beats, mid, dur, past dur', () => {
  for (const mode of ['split'] as const) {
    for (const { beats, dur } of SCENARIOS) {
      for (const t of [-1, 0, ...beats, dur / 2, dur, dur + 2, NaN]) {
        const st = m.frameState({ mode } as never, t, beats, dur) as Record<string, unknown>;
        check(st, `${mode}@t=${t},dur=${dur},beats=[${beats}]`);
        unitCheck(st, `${mode}@t=${t},dur=${dur}`);
      }
    }
  }
});

test('labels on their lines; together then apart before the medal; boxes last', () => {
  const beats = [0.2, 2.31, 6.42, 10.29, 13.12, 16.43, 18.94];
  const at = (t: number) => m.frameState({ mode: 'split' }, t, beats, 24.1);
  assert.ok(at(0).split === 0 && at(1).split === 1);
  assert.equal(at(2.3).left[0], 0);
  assert.ok(at(6).left.every((v) => v === 1) && at(6).right[0] === 0);
  assert.ok(at(10).right.every((v) => v === 1));
  assert.equal(at(10.29).together, 0);
  assert.equal(at(14).together, 1);
  assert.equal(at(16.43).together, 0, 'apart again before the prize line');
  assert.equal(at(16.43).medal, 0);
  assert.equal(at(18).medal, 1);
  assert.equal(at(18.94).prize[0], 0);
  assert.ok(at(24.1).prize.every((v) => v === 1));
});
