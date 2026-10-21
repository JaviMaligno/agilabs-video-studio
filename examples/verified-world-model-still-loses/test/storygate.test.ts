// StoryGate (added 2026-10-21: story scene): total over the scene, nothing early, end state reached.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { frameState } from '../src/anim/StoryGate.state.ts';

const PROGRESS = new Set(['opacity', 'draw', 'pop']);

const check = (value: unknown, path: string) => {
  if (typeof value === 'number') {
    assert.ok(Number.isFinite(value), `${path} is ${value}`);
    const key = path.split('.').at(-1)!.replace(/\[\d+\]$/, '');
    if (PROGRESS.has(key)) assert.ok(value >= 0 && value <= 1, `${path} = ${value} is outside [0, 1]`);
  } else if (Array.isArray(value)) value.forEach((v, i) => check(v, `${path}[${i}]`));
  else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) check(v, `${path}.${k}`);
};

const SCENARIOS = [
  { beats: [0.2, 6.5, 10], dur: 13 },
  { beats: [0.3, 1.4, 2.6], dur: 4 },
  { beats: [], dur: 4 },
  { beats: [1, 9], dur: 4 },
  { beats: [0], dur: 0.5 },
];

test('StoryGate is total over [0, sceneEnd]', () => {
  for (const { beats, dur } of SCENARIOS) {
    for (const t of [-1, 0, ...beats, dur / 2, dur, dur + 2]) check(frameState({}, t, beats, dur), `StoryGate@t=${t},dur=${dur}`);
  }
});

test('StoryGate: nothing before its beats, everything by the end', () => {
  const beats = [0.2, 6.5, 10];
  const early = frameState({}, 0, beats, 13);
  assert.equal(early.board.opacity, 0);
  assert.equal(early.card.opacity, 0);
  // The check and the question wait for their own lines.
  const mid = frameState({}, 6, beats, 13);
  assert.equal(mid.card.opacity, 1);
  assert.equal(mid.gate.opacity, 0);
  assert.equal(mid.question.pop, 0);
  const beforeQ = frameState({}, 9.9, beats, 13);
  assert.equal(beforeQ.gate.tick.pop, 1);
  assert.equal(beforeQ.question.pop, 0);
  for (const { beats: b, dur } of SCENARIOS) {
    const end = frameState({}, dur, b, dur);
    assert.equal(end.question.pop, 1);
    assert.equal(end.gate.tick.pop, 1);
    assert.ok(end.tree.nodes.every((n) => n.pop === 1));
    assert.ok(end.card.lines.every((l) => l.opacity === 1));
  }
});
