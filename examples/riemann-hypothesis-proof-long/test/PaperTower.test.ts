import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as m from '../src/anim/PaperTower.state.ts';

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
  { beats: [1.2, 3.07, 8.22], dur: 13.1 },
];
/** Fields that are 0..1 shares in this component (besides the house progress keys). */
const UNIT = new Set(['tiles', 'question', 'rise', 'tilt', 'wobble', 'topple', 'gone', 'bin', 'thud', 'burst', 'quote', 'lit', 'by']);
const unitCheck = (o: Record<string, unknown>, path: string) => {
  for (const [k, v] of Object.entries(o)) {
    if (!UNIT.has(k)) continue;
    for (const x of Array.isArray(v) ? v : [v]) assert.ok(typeof x === 'number' && x >= 0 && x <= 1, `${path}.${k} = ${x}`);
  }
};

test('PaperTower is total over t<0, beats, mid, dur, past dur', () => {
  for (const mode of ['tower', 'slop'] as const) {
    for (const { beats, dur } of SCENARIOS) {
      for (const t of [-1, 0, ...beats, dur / 2, dur, dur + 2, NaN]) {
        const st = m.frameState({ mode } as never, t, beats, dur) as Record<string, unknown>;
        check(st, `${mode}@t=${t},dur=${dur},beats=[${beats}]`);
        unitCheck(st, `${mode}@t=${t},dur=${dur}`);
      }
    }
  }
});

test('tower: question first, tiles on their words, tower rises on line 3; slop: topples, then the quote', () => {
  const beats = [1.2, 3.07, 8.22];
  const at = (t: number) => m.frameState({ mode: 'tower' }, t, beats, 13.1);
  assert.equal(at(0.2).tiles[0], 0);
  assert.ok(at(2).question > 0.9);
  assert.equal(at(3.5).tiles[0], 0);
  assert.ok(at(4.6).tiles[0] > 0.9 && at(4.6).tiles[1] === 0);
  assert.ok(at(6.8).tiles[1] > 0.9 && at(6.8).question === 0);
  assert.equal(at(3).rise, 0);
  assert.ok(at(8.2).rise > 0.2 && at(8.2).rise < 0.3, 'a first storey during the counts');
  assert.ok(at(10.5).tiles[2] === 0 || at(10.5).tiles[2] < 1);
  assert.ok(at(11.6).tiles[2] > 0.9);
  assert.equal(at(13.1).rise, 1);
  assert.equal(at(13.1).tilt, 1);
  const sl = (t: number) => m.frameState({ mode: 'slop' }, t, [0.2, 4.31], 9.8);
  assert.equal(sl(0).tilt, 1, 'slop starts where the tower left the camera');
  assert.equal(sl(0).topple, 0);
  assert.ok(sl(1.5).wobble > 0.5);
  assert.equal(sl(4.2).topple, 1);
  assert.equal(sl(4.2).quote, 0);
  assert.equal(sl(9.8).gone, 1);
  assert.ok(sl(9.8).lit.every((v) => v === 1));
});
