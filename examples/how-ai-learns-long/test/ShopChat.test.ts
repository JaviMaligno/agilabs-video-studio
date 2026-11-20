import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ANSWER, QUESTION, frameState } from '../src/anim/ShopChat.state.ts';
import { checkState, scenarios, timesFor } from './shop-check.ts';

const COLD = { dur: 8.5, beats: [0.1], marks: [3.34, 5.18, 6.541] };
const CALLBACK = { dur: 6.03, beats: [0.2], marks: [] as number[] };

test('ShopChat is total over [-1, dur + 1] in both modes', () => {
  for (const [mode, sc] of [['cold', COLD], ['callback', CALLBACK]] as const) {
    for (const s of scenarios(sc.dur, sc.beats, sc.marks)) {
      for (const t of timesFor(s.dur, [...s.beats, ...s.marks])) {
        checkState(frameState({ mode, marks: s.marks }, t, s.beats, s.dur), `${mode}/${s.name}@${t}`);
      }
    }
  }
  // unknown mode and missing marks fall back safely
  checkState(frameState({ mode: 'nope' as never }, 2, [], 4), 'unknown');
});

test('cold: frame 0 already shows the numbered paragraphs and the green quote; they move in the first second; marks light the parts', () => {
  const { dur, beats, marks } = COLD;
  const s0 = frameState({ mode: 'cold', marks }, 0, beats, dur);
  assert.ok(s0.ask.pulse > 0.05, 'the instruction pulses from frame 0');
  assert.equal(s0.quote, 1);
  assert.deepEqual(s0.paras, [1, 1, 1], 'numbers on screen from frame 0');
  const early = [0.15, 0.3, 0.45, 0.6, 0.9].map((t) => frameState({ mode: 'cold', marks }, t, beats, dur));
  assert.ok(early.some((s) => s.hop.some((h) => h > 0.5)), 'the numbers hop in the first second');
  assert.ok(early.some((s) => s.ask.flash > 0.5), '"One line, please" flashes in the first second');
  const afterPerfectly = frameState({ mode: 'cold', marks }, marks[0] + 0.5, beats, dur);
  assert.ok(afterPerfectly.card > 0.5, 'card glows on "perfectly"');
  assert.ok(frameState({ mode: 'cold', marks }, marks[1] + 0.3, beats, dur).ask.flash > 0.5, 'flash on "one"');
  const on3 = [0.2, 0.45, 0.75].map((d) => frameState({ mode: 'cold', marks }, marks[2] + d, beats, dur));
  assert.ok(on3.some((s) => s.hop[0] > 0.5) && on3.some((s) => s.hop[2] > 0.5), 'numbers hop again on "three"');
  const end = frameState({ mode: 'cold', marks }, dur, beats, dur);
  assert.deepEqual(end.paras, [1, 1, 1], 'three numbered paragraphs at the end');
  assert.equal(end.quote, 1);
});

test('callback: the sticky stays on the book, then falls by the end', () => {
  const { dur, beats } = CALLBACK;
  assert.equal(frameState({ mode: 'callback' }, 0, beats, dur).fall, 0);
  assert.equal(frameState({ mode: 'callback' }, dur, beats, dur).fall, 1);
  assert.equal(frameState({ mode: 'callback' }, dur, beats, dur).book, 1);
});

test('the texts match the script', () => {
  assert.equal(QUESTION.join(' '), "Can I return shoes I've worn once? One line, please.");
  assert.equal(ANSWER.length, 3);
  assert.equal(ANSWER[0][1], 'Returns: 30 days, unworn, in the box.');
});
