import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ANSWER, COLD_ANSWER, QUESTION, SKELETON, frameState } from '../src/anim/ShopChat.state.ts';
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

test('cold: frame 0 is the question alone; it pops in and the AI types in the first second', () => {
  const { dur, beats, marks } = COLD;
  const s0 = frameState({ mode: 'cold', marks }, 0, beats, dur);
  assert.equal(s0.answer, 0, 'no answer on frame 0');
  assert.deepEqual(s0.rows, [0, 0, 0]);
  assert.deepEqual(s0.paras, [0, 0, 0], 'no numbers on frame 0');
  assert.equal(s0.quote, 0);
  assert.equal(s0.ask.on, 0, '"One line, please" not lit yet');
  assert.equal(s0.book, 0, 'the robot holds the policy card');
  assert.ok(frameState({ mode: 'cold', marks }, 0.15, beats, dur).qIn > 0.3, 'the question pops in');
  assert.equal(frameState({ mode: 'cold', marks }, 0.4, beats, dur).qIn, 1);
  const s1 = frameState({ mode: 'cold', marks }, 1, beats, dur);
  assert.ok(s1.typing > 0.9 && s1.answer === 0, 'typing dots before the answer');
  const before = frameState({ mode: 'cold', marks }, marks[0] - 0.2, beats, dur);
  assert.equal(before.answer, 0, 'still no answer just before "perfectly"');
});

test('cold: "perfectly" brings one readable sentence with the green quote and the tick', () => {
  const { dur, beats, marks } = COLD;
  const s = frameState({ mode: 'cold', marks }, marks[0] + 0.5, beats, dur);
  assert.equal(s.answer, 1);
  assert.equal(s.quote, 1);
  assert.equal(s.typing, 0);
  assert.deepEqual(s.rows, [1, 0, 0], 'only paragraph 1');
  assert.deepEqual(s.paras, [0, 0, 0], 'no numbers yet');
  assert.ok(s.card > 0.5, 'card glows on "perfectly"');
  assert.ok([0.3, 0.5, 0.7].some((d) => frameState({ mode: 'cold', marks }, marks[0] + d, beats, dur).tickHop > 0.5), 'the tick hops');
  assert.equal(frameState({ mode: 'cold', marks }, marks[1] - 0.2, beats, dur).ask.on, 0, 'instruction not lit before "one"');
});

test('cold: "one" lights and flashes the instruction', () => {
  const { dur, beats, marks } = COLD;
  const s = frameState({ mode: 'cold', marks }, marks[1] + 0.3, beats, dur);
  assert.equal(s.ask.on, 1);
  assert.ok(s.ask.flash > 0.5, 'flash on "one"');
  assert.deepEqual(s.rows, [1, 0, 0], 'the answer has not grown yet');
});

test('cold: "three" rolls in paragraphs 2 and 3 and the numbers hop one after another', () => {
  const { dur, beats, marks } = COLD;
  const just = frameState({ mode: 'cold', marks }, marks[2] - 0.2, beats, dur);
  assert.deepEqual(just.rows, [1, 0, 0]);
  const at = (d: number) => frameState({ mode: 'cold', marks }, marks[2] + d, beats, dur);
  // first hop of each number, in order
  const firstHop = [0, 1, 2].map((i) => {
    for (let d = -0.2; d <= 1.2; d += 0.02) if (at(d).hop[i] > 0.5) return d;
    return Infinity;
  });
  assert.ok(firstHop.every(Number.isFinite), 'every number hops');
  assert.ok(firstHop[0] < firstHop[1] && firstHop[1] < firstHop[2], `numbers hop one after another: ${firstHop}`);
  const mid = at(0.2);
  assert.ok(mid.rows[1] > 0 && mid.rows[2] < mid.rows[1], 'paragraph 2 rolls in before paragraph 3');
  const end = frameState({ mode: 'cold', marks }, dur, beats, dur);
  assert.deepEqual(end.rows, [1, 1, 1], 'three paragraphs at the end');
  assert.deepEqual(end.paras, [1, 1, 1], 'numbered at the end');
  assert.equal(end.quote, 1);
  assert.ok(end.ask.on === 1);
});

test('callback: the whole chat as before (readable paragraphs, lit instruction); the sticky falls by the end', () => {
  const { dur, beats } = CALLBACK;
  for (const t of [0, 1, dur / 2, dur]) {
    const s = frameState({ mode: 'callback' }, t, beats, dur);
    assert.deepEqual([s.qIn, s.answer, s.quote, s.ask.on, s.typing, s.card], [1, 1, 1, 1, 0, 0]);
    assert.deepEqual(s.rows, [1, 1, 1]);
    assert.deepEqual(s.paras, [1, 1, 1]);
    assert.deepEqual(s.hop, [0, 0, 0]);
  }
  assert.equal(frameState({ mode: 'callback' }, 0, beats, dur).fall, 0);
  assert.equal(frameState({ mode: 'callback' }, dur, beats, dur).fall, 1);
  assert.equal(frameState({ mode: 'callback' }, dur, beats, dur).book, 1);
});

test('the texts match the script', () => {
  assert.equal(QUESTION.join(' '), "Can I return shoes I've worn once? One line, please.");
  assert.equal(ANSWER.length, 3);
  assert.equal(ANSWER[0][1], 'Returns: 30 days, unworn, in the box.');
  assert.equal(COLD_ANSWER.join(''), 'Our policy states: Returns: 30 days, unworn, in the box.');
  assert.equal(SKELETON.length, 2, 'paragraphs 2 and 3 are skeleton lines in the cold open');
});
