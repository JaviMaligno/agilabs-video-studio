import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BANNER_DONE, GUESSING, frameState } from '../src/anim/FlatLine.state.ts';
import { checkState, scenarios, timesFor } from './shop-check.ts';

const SC = { dur: 14.03, beats: [0.2], marks: [5.36, 9.28, 12.8] };

test('FlatLine is total over [-1, dur + 1]', () => {
  for (const s of scenarios(SC.dur, SC.beats, SC.marks)) {
    for (const t of timesFor(s.dur, [...s.beats, ...s.marks])) {
      checkState(frameState({ marks: s.marks }, t, s.beats, s.dur), `${s.name}@${t}`);
    }
  }
});

test('the recipe, then all buttons equal on a flat "guessing" line, then the tick', () => {
  const { dur, beats, marks } = SC;
  const at = (t: number) => frameState({ marks }, t, beats, dur);
  assert.equal(at(0).fill, 0);
  assert.equal(at(0).done, 0);
  assert.equal(at(marks[0] - 0.3).recipeLit, 0);
  assert.ok(at(marks[0] + 1.3).stacks[0] > 0.9, 'the "made for" stack grows on "recipe"');
  assert.equal(at(marks[1] - 0.3).verdict, 0);
  const n = at(marks[1] + 0.8);
  assert.equal(n.verdict, 1);
  assert.ok(n.buttons.every((b) => Math.abs(b - n.buttons[0]) < 1e-9), 'all four lit the same');
  assert.equal(at(marks[2] - 0.3).done, 0);
  const end = at(dur);
  assert.equal(end.done, 1);
  assert.equal(end.draw, 1);
  assert.equal(BANNER_DONE, 'Training complete');
  assert.equal(GUESSING, 'guessing');
});
