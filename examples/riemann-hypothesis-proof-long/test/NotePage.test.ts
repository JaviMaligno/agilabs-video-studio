import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CAM_NOTE_END, frameState, type NotePageProps } from '../src/anim/NotePage.state.ts';

const PROGRESS = new Set(['progress', 'appear', 'grow', 'fill', 'draw', 'pop', 'opacity', 'emphasis']);
const UNIT = new Set(['quote', 'empty', 'foot', 'unspool', 'lean', 'rise', 'scrim', 'maths', 'checkLabel', 'ticks', 'allGood', 'card', 'name', 'tag', 'quoteIn', 'hl']);

const check = (value: unknown, path: string) => {
  if (typeof value === 'number') {
    assert.ok(Number.isFinite(value), `${path} is ${value}`);
    const key = path.split('.').at(-1)!.replace(/\[\d+\]$/, '');
    if (PROGRESS.has(key) || UNIT.has(key)) assert.ok(value >= 0 && value <= 1, `${path} = ${value} is outside [0, 1]`);
  } else if (Array.isArray(value)) value.forEach((v, i) => check(v, `${path}[${i}]`));
  else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) check(v, `${path}.${k}`);
};

const SCENARIOS = [
  { beats: [0.3, 4.89, 9.96], dur: 16.9 },
  { beats: [0.2, 2.23, 5.3], dur: 10.6 },
  { beats: [], dur: 4 },
  { beats: [1, 9], dur: 4 },
  { beats: [0], dur: 0.5 },
];
const MODES: NotePageProps['mode'][] = ['note', 'footnote'];

test('NotePage is total over [0, sceneEnd]', () => {
  for (const mode of MODES)
    for (const { beats, dur } of SCENARIOS)
      for (const t of [-1, 0, ...beats, dur / 2, dur, dur + 2, Number.NaN]) check(frameState({ mode }, t, beats, dur), `${mode}@t=${t},dur=${dur},beats=[${beats}]`);
});

test('note: nothing before its beat, quote lit phrase by phrase, end state at dur', () => {
  const beats = [0.3, 4.89, 9.96];
  const s0 = frameState({ mode: 'note' }, 0, beats, 16.9);
  assert.equal(s0.card, 0);
  assert.equal(s0.tag, 0);
  assert.equal(s0.quoteIn, 0);
  const mid = frameState({ mode: 'note' }, 12.3, beats, 16.9);
  assert.ok(mid.hl[0] === 1 && mid.hl[3] === 0, 'first phrase lit, last not yet');
  const end = frameState({ mode: 'note' }, 16.9, beats, 16.9);
  assert.deepEqual(end.hl, [1, 1, 1, 1]);
  assert.equal(end.name, 1);
  assert.deepEqual(end.cam, CAM_NOTE_END);
});

test('footnote starts where the note ends (same picture across the fade)', () => {
  const beats = [0.2, 2.23, 5.3];
  const s = frameState({ mode: 'footnote' }, 0, beats, 10.6);
  assert.deepEqual(s.cam, CAM_NOTE_END);
  assert.equal(s.quote, 1);
  assert.equal(s.unspool, 0);
  const end = frameState({ mode: 'footnote' }, 10.6, beats, 10.6);
  assert.equal(end.unspool, 1);
  assert.deepEqual(end.ticks, [1, 1, 1]);
  assert.equal(end.empty, 0);
});
