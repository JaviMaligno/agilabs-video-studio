import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as pi from '../src/anim/PieceInspector.state.ts';
import * as rf from '../src/anim/RepairFork.state.ts';

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
  { beats: [0.3, 1.4, 2.6], dur: 6 },
  { beats: [], dur: 4 },
  { beats: [1, 9], dur: 4 },
  { beats: [0], dur: 0.5 },
];
const PI_MODES: pi.PIMode[] = ['hook', 'recap', 'lift', 'levels', 'rule', 'meters', 'repaint', 'quote', 'verdict'];
const RF_MODES: rf.RFMode[] = ['teaser', 'fork', 'arms', 'measure', 'bars', 'hold', 'turns', 'verdict'];
const QUOTE = { rows: ['A b c.', 'D e f.'] as [string, string], emphasis: ['e f'] };

test('PieceInspector and RepairFork are total over [0, sceneEnd] in every mode', () => {
  for (const { beats, dur } of SCENARIOS)
    for (const t of [-1, 0, ...beats, dur / 2, dur, dur + 2, NaN]) {
      for (const mode of PI_MODES) check(pi.frameState({ mode, quote: QUOTE }, t, beats, dur), `PI.${mode}@${t}`);
      for (const mode of RF_MODES) check(rf.frameState({ mode, quote: { text: 'To hold it.', emphasis: ['hold'] } }, t, beats, dur), `RF.${mode}@${t}`);
    }
});

test('nothing shows before its beat, and the end state is reached by the scene end', () => {
  const beats = [0.3, 2.4, 4.6];
  const dur = 7;
  const lv0 = pi.frameState({ mode: 'levels' }, 0, beats, dur);
  assert.deepEqual(lv0.slots.drops, [0, 0, 0]);
  assert.equal(lv0.tells.note, 0);
  const lvEnd = pi.frameState({ mode: 'levels' }, dur, beats, dur);
  assert.deepEqual(lvEnd.slots.drops, [1, 1, 1]);
  assert.equal(lvEnd.slots.flip2, -1, 'the tell piece ends showing its back');
  assert.equal(lvEnd.tells.panel, 1);
  const m = pi.frameState({ mode: 'meters' }, dur, beats, dur);
  assert.deepEqual(m.bars.grow, [1, 1]);
  assert.equal(m.stamp.pop, 1);
  const m0 = pi.frameState({ mode: 'meters' }, 1.0, beats, dur);
  assert.equal(m0.stamp.opacity, 0, 'the 0 / 95 stamp waits for the second line');
  const h = pi.frameState({ mode: 'hook' }, dur, [0.2, 3], dur);
  assert.equal(h.seat.progress, 1);
  assert.equal(h.repaint.progress, 1);
  const h0 = pi.frameState({ mode: 'hook' }, 0.5, [0.2, 3], dur);
  assert.equal(h0.repaint.progress, 0, 'no repaint before "Not one reply"');
  const b = rf.frameState({ mode: 'bars' }, dur, beats, dur);
  assert.deepEqual(b.bars.grow, [1, 1, 1]);
  const b1 = rf.frameState({ mode: 'bars' }, 2.0, beats, dur);
  assert.equal(b1.bars.grow[1], 0, 'the "ignore it" bar waits for its line');
  const v = rf.frameState({ mode: 'verdict' }, 6, [0.2, 2, 4], 6);
  assert.deepEqual(v.verdict.appear, [1, 1, 1]);
  const a = rf.frameState({ mode: 'arms', at: [0.5, 1.5, 2.5] }, 1.0, [0.2], 4);
  assert.ok(a.user.appear[0] > 0 && a.user.appear[1] === 0 && a.user.appear[2] === 0);
});
