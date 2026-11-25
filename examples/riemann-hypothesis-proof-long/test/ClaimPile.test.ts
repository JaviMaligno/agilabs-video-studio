import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SHEETS, frameState, sheetYear, type ClaimPileProps } from '../src/anim/ClaimPile.state.ts';

const PROGRESS = new Set(['progress', 'appear', 'grow', 'fill', 'draw', 'pop', 'opacity', 'emphasis']);
const UNIT = new Set(['sheets', 'aside', 'dim', 'letter', 'year1885', 'proofBox', 'blank', 'stage', 'year2018', 'atiyah', 'claim', 'cameo', 'clock', 'clockLabel', 'worth', 'stack', 'believe', 'walk', 'scan', 'card', 'bubble1', 'strike', 'bubble2']);

const check = (value: unknown, path: string) => {
  if (typeof value === 'number') {
    assert.ok(Number.isFinite(value), `${path} is ${value}`);
    const key = path.split('.').at(-1)!.replace(/\[\d+\]$/, '');
    if (PROGRESS.has(key) || UNIT.has(key)) assert.ok(value >= -1e-9 && value <= 1, `${path} = ${value} is outside [0, 1]`);
  } else if (Array.isArray(value)) value.forEach((v, i) => check(v, `${path}[${i}]`));
  else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) check(v, `${path}.${k}`);
};

const HISTORY = [1.2, 4.83, 10.62, 14.33, 21.64, 24.31, 28.18, 29.89];
const SCENARIOS = [
  { beats: HISTORY, dur: 35.8 },
  { beats: [0.2, 3.19, 8.26], dur: 12.5 },
  { beats: [], dur: 4 },
  { beats: [1, 9], dur: 4 },
  { beats: [0], dur: 0.5 },
];
const MODES: ClaimPileProps['mode'][] = ['history', 'runit'];

test('ClaimPile is total over [0, sceneEnd]', () => {
  for (const mode of MODES)
    for (const { beats, dur } of SCENARIOS)
      for (const t of [-1, 0, ...beats, dur / 2, dur, dur + 2, Number.NaN]) check(frameState({ mode }, t, beats, dur), `${mode}@t=${t},dur=${dur},beats=[${beats}]`);
});

test('history: the story lands beat by beat', () => {
  const at = (t: number) => frameState({ mode: 'history' }, t, HISTORY, 35.8);
  assert.ok(at(0).sheets.every((x) => x === 0), 'no paper before line 1');
  assert.equal(at(6).letter, 1);
  assert.equal(at(6).stage, 0);
  assert.equal(at(18).stage, 1);
  assert.equal(at(18).cameo, 0);
  assert.equal(at(23).cameo, 1);
  assert.equal(at(27).clockLabel, 1);
  assert.equal(at(30).stage, 0);
  const end = at(35.8);
  assert.equal(end.dim, 1);
  assert.equal(end.worth, 1);
  assert.ok(end.sheets.every((x) => x === 1));
  assert.equal(sheetYear(SHEETS - 2), 1885);
  assert.equal(sheetYear(SHEETS - 1), 2018);
});

test('runit starts on history\'s last picture and ends on "run it."', () => {
  const beats = [0.2, 3.19, 8.26];
  const h = frameState({ mode: 'history' }, 35.8, HISTORY, 35.8);
  const r0 = frameState({ mode: 'runit' }, 0, beats, 12.5);
  assert.equal(r0.aside, h.aside);
  assert.equal(r0.dim, h.dim);
  assert.equal(r0.worth, h.worth);
  assert.equal(r0.stack, 0);
  const end = frameState({ mode: 'runit' }, 12.5, beats, 12.5);
  assert.equal(end.bubble2, 1);
  assert.equal(end.strike, 1);
  assert.equal(end.believe, 0);
  // "run it." is up for at least 1.2 s before the scene's fade starts (0.6 s before its end).
  const shown = frameState({ mode: 'runit' }, 12.5 - 0.6 - 1.2, beats, 12.5);
  assert.ok(shown.bubble2 > 0.9);
});
