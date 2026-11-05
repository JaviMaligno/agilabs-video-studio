import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TXT, frameState } from '../src/anim/QuestionChat.state.ts';

const PROGRESS = new Set(['progress', 'appear', 'grow', 'fill', 'draw', 'pop', 'opacity', 'emphasis', 'typing', 'chatOpacity']);

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
  { beats: [0.3, 2.6], dur: 6 },
  { beats: [0.2], dur: 3 },
  { beats: [], dur: 4 },
  { beats: [1, 9], dur: 4 },
  { beats: [0], dur: 0.5 },
];
const MODES = ['chat', 'count'] as const;

test('QuestionChat is total over [0, sceneEnd]', () => {
  for (const mode of MODES)
    for (const { beats, dur } of SCENARIOS)
      for (const t of [-1, 0, ...beats, dur / 2, dur, dur + 2]) {
        const s = frameState({ mode }, t, beats, dur);
        check(s, `${mode}@t=${t},dur=${dur},beats=[${beats}]`);
        assert.ok(s.chat.bubble.typed >= 0 && s.chat.bubble.typed <= TXT.ask.length);
      }
});

test('QuestionChat shows nothing before its first beat', () => {
  const c = frameState({ mode: 'chat' }, 0.5, [1, 3], 6);
  assert.equal(c.chat.bubble.appear, 0);
  assert.equal(c.chat.bubble.typed, 0);
  assert.equal(c.chat.reply.appear, 0);
  const n = frameState({ mode: 'count' }, 0.5, [1], 4);
  assert.equal(n.chatOpacity, 0);
  assert.equal(n.title.appear, 0);
  assert.deepEqual(n.figures.map((f) => f.pop), [0, 0]);
});

test('QuestionChat reveals the reply on beat 1, the second figure after the first', () => {
  const beforeReply = frameState({ mode: 'chat' }, 2.5, [0.3, 2.6], 6);
  assert.equal(beforeReply.chat.bubble.typed, TXT.ask.length);
  assert.equal(beforeReply.chat.reply.appear, 0);
  const atReply = frameState({ mode: 'chat' }, 2.8, [0.3, 2.6], 6);
  assert.ok(atReply.chat.reply.appear > 0);
  assert.equal(atReply.chat.reply.offer.appear, 0);
  const mid = frameState({ mode: "count" }, 0.7, [0.2], 3);
  assert.ok(mid.figures[0].pop === 1 && mid.figures[1].pop === 0);
});

test('QuestionChat reaches its end state at the scene end', () => {
  for (const { beats, dur } of SCENARIOS) {
    const c = frameState({ mode: 'chat' }, dur, beats, dur);
    assert.equal(c.chat.bubble.typed, TXT.ask.length);
    assert.equal(c.chat.reply.appear, 1);
    assert.deepEqual(c.chat.reply.items.map((i) => i.appear), [1, 1, 1]);
    assert.equal(c.chat.reply.offer.appear, 1);
    assert.equal(c.chat.reply.tag.appear, 1);
    const n = frameState({ mode: 'count' }, dur, beats, dur);
    assert.deepEqual(n.figures.map((f) => [f.value, f.pop]), [['40/49', 1], ['15/84', 1]]);
    assert.equal(n.title.appear, 1);
    assert.equal(n.chatOpacity, 0.1);
  }
});
