import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as m from '../src/anim/Checklist.state.ts';

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
  { beats: [0.2, 5.35, 7.94, 10.13, 15.28, 18.83, 24.86, 30.33, 34.6, 41.11, 43.54], dur: 44.9 },
];
/** Fields that are 0..1 shares in this component (besides the house progress keys). */
const UNIT = new Set(['board', 'tick', 'note', 'circle', 'second', 'stamp', 'amber', 'follows', 'whyDim', 'why', 'focusOn', 'checked', 'hop', 'ring']);
const unitCheck = (o: Record<string, unknown>, path: string) => {
  for (const [k, v] of Object.entries(o)) {
    if (!UNIT.has(k)) continue;
    for (const x of Array.isArray(v) ? v : [v]) assert.ok(typeof x === 'number' && x >= 0 && x <= 1, `${path}.${k} = ${x}`);
  }
};

test('Checklist is total over t<0, beats, mid, dur, past dur', () => {
  for (const mode of ['checks'] as const) {
    for (const { beats, dur } of SCENARIOS) {
      for (const t of [-1, 0, ...beats, dur / 2, dur, dur + 2, NaN]) {
        const st = m.frameState({ mode } as never, t, beats, dur) as Record<string, unknown>;
        check(st, `${mode}@t=${t},dur=${dur},beats=[${beats}]`);
        unitCheck(st, `${mode}@t=${t},dur=${dur}`);
      }
    }
  }
});

test('rows tick in order on their lines; stamp, amber rows and the contrast come last', () => {
  const beats = [0.2, 5.35, 7.94, 10.13, 15.28, 18.83, 24.86, 30.33, 34.6, 41.11, 43.54];
  const at = (t: number) => m.frameState({ mode: 'checks' }, t, beats, 44.9);
  assert.ok(at(0.1).draw.every((v) => v === 0));
  assert.ok(at(4.5).draw.every((v) => v === 1));
  assert.ok(at(4.5).tick.every((v) => v === 0));
  const firstTick = (i: number) => {
    for (let t = 0; t < 45; t += 0.05) if (at(t).tick[i] > 0) return t;
    return Infinity;
  };
  const lines = [1, 3, 5, 6, 7];
  for (let i = 0; i < 5; i++) {
    const ft = firstTick(i);
    assert.ok(ft >= beats[lines[i]] && ft < (beats[lines[i] + 1] ?? 45), `row ${i} ticks during line ${lines[i]} (at ${ft})`);
  }
  assert.equal(at(34).stamp, 1);
  assert.equal(at(34).amber[0], 0);
  assert.equal(at(40).amber[1], 1);
  assert.equal(at(41).follows, 0);
  assert.equal(at(43).follows, 1);
  assert.equal(at(43.5).why, 0);
  assert.equal(at(44.9).why, 1);
  assert.equal(at(44.9).checked, 1);
});
