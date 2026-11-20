import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DOOR_LABELS, SIDES, TITLE, frameState } from '../src/anim/FourDoors.state.ts';
import { checkState, scenarios, timesFor } from './shop-check.ts';

const INTRO = { dur: 21.13, beats: [0.2, 7.51, 14.02], marks: [2.96, 10.35, 12.91, 16.54, 19.42] };
const LABELLED = { dur: 9.67, beats: [1.2], marks: [4.44, 5.96, 8.28] };

test('FourDoors is total over [-1, dur + 1] in both modes', () => {
  for (const [mode, sc] of [['intro', INTRO], ['labelled', LABELLED]] as const) {
    for (const s of scenarios(sc.dur, sc.beats, sc.marks)) {
      for (const t of timesFor(s.dur, [...s.beats, ...s.marks])) {
        checkState(frameState({ mode, marks: s.marks }, t, s.beats, s.dur), `${mode}/${s.name}@${t}`);
      }
    }
  }
});

test('intro: one door at frame 0, four after "four", crack, tag and title on their marks', () => {
  const { dur, beats, marks } = INTRO;
  const at = (t: number) => frameState({ mode: 'intro', marks }, t, beats, dur);
  const s0 = at(0);
  assert.equal(s0.one, 1);
  assert.ok(s0.doors.every((d) => d.appear === 0));
  assert.ok(at(marks[0] + 1.2).doors.every((d) => d.appear === 1), 'four doors after "four"');
  assert.ok(at(marks[0] + 1.2).one === 0);
  assert.equal(at(marks[1] - 0.5).doors[2].lit, 0);
  assert.ok(at(marks[1] + 0.6).doors[2].lit > 0.9, 'the biggest door glows on "thorough"');
  assert.equal(at(marks[2] - 0.3).crack, 0);
  assert.equal(at(marks[2] + 1).crack, 1, 'the crack on "damage"');
  assert.equal(at(marks[3] - 0.3).tag, 0);
  assert.equal(at(marks[3] + 0.6).tag, 1, '"free" on "cheapest"');
  assert.equal(at(marks[4] - 0.4).title, 0);
  const end = at(dur);
  assert.equal(end.title, 1);
  assert.ok(end.doors.every((d) => d.label === 0), 'unlabelled in the intro');
});

test('labelled: labels in, left doors light on "note", right ones on "fine"', () => {
  const { dur, beats, marks } = LABELLED;
  const at = (t: number) => frameState({ mode: 'labelled', marks }, t, beats, dur);
  assert.ok(at(0).doors.every((d) => d.appear === 1 && d.label === 0), 'doors on screen, labels not yet');
  assert.ok(at(marks[0]).doors.every((d) => d.label === 1), 'labels in before "which"');
  assert.ok(at(marks[1] + 0.6).doors[0].lit > 0.9 && at(marks[1] + 0.6).doors[2].lit < 0.1);
  assert.ok(at(dur).doors[2].lit > 0.7);
  assert.equal(DOOR_LABELS.length, 4);
  assert.deepEqual([...SIDES], ['hand it what it needs', 'change the model']);
  assert.equal(TITLE, 'How an AI learns');
});
