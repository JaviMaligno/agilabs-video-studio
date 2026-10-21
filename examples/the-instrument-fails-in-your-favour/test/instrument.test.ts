// Behaviour of this video's bespoke scenes: needles stay on the dial, lids stay shut before
// their beat, and each scene ends on the state the narration describes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as rigged from '../src/anim/RiggedGauge.state.ts';
import * as net from '../src/anim/WordNet.state.ts';
import * as merge from '../src/anim/MergeStrips.state.ts';
import * as key from '../src/anim/AnswerKey.state.ts';
import * as stop from '../src/anim/StoppingRule.state.ts';

const inDial = (v: number) => v >= 0 && v <= 1;
const times = (dur: number) => Array.from({ length: 81 }, (_, i) => -1 + (i * (dur + 2)) / 80);

test('needles never leave the dial', () => {
  const dur = 16;
  const beats = [0.3, 4, 8, 12];
  for (const t of times(dur)) {
    for (const mode of ['hook', 'setup', 'close'] as const) {
      const s = rigged.frameState({ mode }, t, beats, dur);
      assert.ok(inDial(s.main.value));
      s.row.forEach((g) => assert.ok(inDial(g.value)));
    }
    assert.ok(inDial(net.frameState({}, t, beats, dur).gauge.value));
    assert.ok(inDial(merge.frameState({}, t, beats, dur).gauge.value));
    assert.ok(inDial(key.frameState({}, t, beats, dur).value));
    stop.frameState({}, t, [...beats, 14], dur).items.forEach((it) => assert.ok(inDial(it.value)));
  }
});

test('lids stay shut before their beat', () => {
  const beats = [0.3, 4, 8, 12];
  assert.equal(net.frameState({}, beats[2] - 0.01, beats, 16).gauge.lift, 0);
  assert.equal(merge.frameState({}, beats[2] - 0.4, beats, 16).gauge.lift, 0);
  assert.equal(key.frameState({}, beats[2] - 0.01, beats, 16).lift, 0);
});

test('the hook ends with five gauges, every needle inside the expected arc', () => {
  const s = rigged.frameState({ mode: 'hook' }, 8, [0.3, 3.6], 8);
  const all = [s.main, ...s.row];
  assert.equal(all.length, 5);
  for (const g of all) {
    assert.ok(g.value >= rigged.EXPECTED.from && g.value <= rigged.EXPECTED.to, `needle ${g.value}`);
    assert.equal(g.crack, 1);
  }
});

test('case 1: 19 chips, 3 kept with ticks, 16 greyed, gauge at 3 / 3', () => {
  const s = net.frameState({}, 20, [0.2, 4, 7.5, 11], 20);
  assert.equal(s.chips.length, 19);
  assert.equal(s.chips.filter((c) => c.grey === 1).length, 16);
  assert.equal(s.chips.filter((c) => c.tick === 1).length, 3);
  assert.equal(s.gauge.value, net.AFTER);
  assert.equal(s.gauge.after, 1);
  // Before the recount, 5 of 19 carry a tick and the needle reads 5/19 inside the arc.
  const mid = net.frameState({}, 7.4, [0.2, 4, 7.5, 11], 20);
  assert.equal(mid.chips.filter((c) => c.tick === 1).length, 5);
  assert.ok(Math.abs(mid.gauge.value - 5 / 19) < 1e-9);
  assert.ok(mid.gauge.value >= rigged.EXPECTED.from && mid.gauge.value <= rigged.EXPECTED.to);
});

test('case 2: 29 pairs, about half heal, exactly one pass, needle 7% -> 9%', () => {
  const s = merge.frameState({}, 20, [0.2, 4.5, 7.5, 9.5], 20);
  assert.equal(s.pairs.length, 29);
  assert.equal(s.pairs.filter((p) => p.heal === 1).length, 14);
  assert.equal(s.pairs.filter((p) => p.pass === 1).length, 1);
  assert.equal(s.gauge.value, merge.AFTER);
  assert.equal(merge.frameState({}, 7.4, [0.2, 4.5, 7.5, 9.5], 20).gauge.value, merge.BEFORE);
});

test('case 3: three magnets on the low side only, needle ends in the 75%-85% band', () => {
  assert.equal(key.MAGNET_AT.length, 3);
  key.MAGNET_AT.forEach((v) => assert.ok(v < key.REPORTED));
  const s = key.frameState({}, 20, [0.2, 4, 8, 12.5], 20);
  assert.ok(s.value >= key.BAND.from && s.value <= key.BAND.to);
  assert.equal(s.band, 1);
});

test('mechanism: the shelf ends with three DONE gauges, magnets all on the expected side', () => {
  const beats = [0.2, 3.6, 7.4, 11.2, 15];
  const s = stop.frameState({}, 21, beats, 21);
  const shelf = s.items.filter((it) => it.kind === 'confirm');
  assert.equal(shelf.length, 3);
  for (const it of shelf) {
    assert.equal(it.y, stop.SHELF.y);
    assert.equal(it.done.opacity, 1);
    assert.ok(it.magnetV <= rigged.EXPECTED.to);
  }
  assert.equal(s.items.filter((it) => it.kind === 'contradict' && it.opacity === 0).length, 2);
  assert.equal(s.binCount, 2);
});
