import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BENCH_CARDS, BENCH_RANKS, MODELS, NAME_STEPS, STEPS, TIMEOUT_INDEX, TXT, frameState, stepStarts, type SeriesRecapProps } from '../src/anim/SeriesRecap.state.ts';

/** Every number in the state is a progress: finite and within [0, 1]. */
const check = (value: unknown, path: string) => {
  if (typeof value === 'number') {
    assert.ok(Number.isFinite(value), `${path} is ${value}`);
    assert.ok(value >= 0 && value <= 1, `${path} = ${value} is outside [0, 1]`);
  } else if (Array.isArray(value)) {
    value.forEach((v, i) => check(v, `${path}[${i}]`));
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) check(v, `${path}.${k}`);
  }
};

/** All numbers of a state, flattened, except the fields named in `skip`. */
const numbers = (value: unknown, skip: Set<string> = new Set(), key = ''): number[] => {
  if (skip.has(key)) return [];
  if (typeof value === 'number') return [value];
  if (Array.isArray(value)) return value.flatMap((v) => numbers(v, skip));
  if (value && typeof value === 'object') return Object.entries(value).flatMap(([k, v]) => numbers(v, skip, k));
  return [];
};

const PROPS: SeriesRecapProps[] = [
  { mode: 'bench' },
  { mode: 'podium' },
  { mode: 'podium', variant: 'story' },
  { mode: 'podium', variant: 'name' },
  { mode: 'twins' },
  { mode: 'agents' },
  { mode: 'desks' },
];

const SCENARIOS = [
  { beats: [0.3, 1.4, 2.6], dur: 4 },
  { beats: [], dur: 4 },
  { beats: [1, 9], dur: 4 },
  { beats: [0], dur: 0.5 },
  { beats: [0.4, 2.1], dur: 5.5 },
];

const label = (p: SeriesRecapProps) => `${p.mode}${p.variant ? `/${p.variant}` : ''}`;

test('SeriesRecap is total over [0, sceneEnd]', () => {
  for (const p of PROPS) {
    for (const { beats, dur } of SCENARIOS) {
      for (const t of [-1, 0, ...beats, dur / 2, dur, dur + 2]) {
        check(frameState(p, t, beats, dur), `${label(p)}@t=${t},dur=${dur},beats=[${beats}]`);
      }
    }
  }
});

test('SeriesRecap shows nothing before its first beat (name carries the podium over)', () => {
  const beats = [1, 2.5, 3.5];
  const dur = 6;
  for (const p of PROPS) {
    const s = frameState(p, 0.99, beats, dur);
    if (p.variant === 'name') {
      assert.equal(s.base, 1);
      assert.equal(s.fable, 1);
      assert.equal(s.labels, 1);
      assert.equal(s.crib, 0);
      assert.equal(s.stamp, 0);
      assert.equal(s.line, 0);
    } else {
      assert.deepEqual(numbers(s).filter((x) => x !== 0), [], `${label(p)} shows something before beat 0`);
    }
    assert.deepEqual(numbers(frameState(p, -1, beats, dur), new Set(['base', 'rise', 'score', 'gold', 'desk', 'redo', 'face', 'fable', 'labels'])).filter((x) => x !== 0), []);
  }
});

test('SeriesRecap: step i waits for beat i', () => {
  const beats = [0.5, 2, 3.5];
  const dur = 6;
  const bench = frameState({ mode: 'bench' }, 1.99, beats, dur);
  assert.ok(bench.cards.every((c) => c.appear === 1 && c.badge === 1));
  assert.equal(bench.board, 0);
  assert.ok(bench.ranks.every((r) => r.appear === 0 && r.bar === 0));
  const story = frameState({ mode: 'podium' }, 1.99, beats, dur);
  assert.equal(story.score, 1);
  assert.equal(story.fable, 1);
  assert.equal(story.labels, 1);
  assert.equal(story.desk, 0);
  const name = frameState({ mode: 'podium', variant: 'name' }, 1.99, beats, dur);
  assert.equal(name.crib, 1);
  assert.equal(name.stamp, 0);
  const name2 = frameState({ mode: 'podium', variant: 'name' }, 3.49, beats, dur);
  assert.equal(name2.stamp, 1);
  assert.equal(name2.line, 0);
  const twins = frameState({ mode: 'twins' }, 3.49, beats, dur);
  assert.equal(twins.card2, 1);
  assert.ok(twins.row.every((r) => r.appear === 0));
  assert.equal(twins.noDrop, 0);
  const agents = frameState({ mode: 'agents' }, 1.99, beats, dur);
  assert.ok(agents.helpers.every((h) => h.folder === 1));
  assert.ok(agents.row.every((r) => r.appear === 0));
  const desks = frameState({ mode: 'desks' }, 1.99, beats, dur);
  assert.equal(desks.key, 1);
  assert.equal(desks.check, 0);
  assert.equal(desks.right, 0);
});

test('SeriesRecap reaches its end state at t = dur', () => {
  for (const { beats, dur } of SCENARIOS) {
    const bench = frameState({ mode: 'bench' }, dur, beats, dur);
    assert.equal(bench.cards.length, 3);
    assert.ok(bench.cards.every((c) => c.appear === 1 && c.badge === 1));
    assert.equal(bench.board, 1);
    assert.equal(bench.ranks.length, 3);
    assert.ok(bench.ranks.every((r) => r.appear === 1 && r.bar === 1));
    const story = frameState({ mode: 'podium' }, dur, beats, dur);
    for (const k of ['base', 'rise', 'score', 'gold', 'fable', 'labels', 'desk', 'redo', 'face'] as const) assert.equal(story[k], 1, `story.${k}`);
    const name = frameState({ mode: 'podium', variant: 'name' }, dur, beats, dur);
    assert.equal(name.crib, 1);
    assert.equal(name.stamp, 1);
    assert.equal(name.line, 1);
    assert.equal(name.fable, 1);
    const twins = frameState({ mode: 'twins' }, dur, beats, dur);
    assert.equal(twins.card1, 1);
    assert.equal(twins.card2, 1);
    assert.equal(twins.same, 1);
    assert.equal(twins.noDrop, 1);
    assert.equal(twins.row.length, 7);
    assert.ok(twins.row.every((r) => r.appear === 1 && r.tick1 === 1 && r.tick2 === 1));
    const agents = frameState({ mode: 'agents' }, dur, beats, dur);
    assert.equal(agents.helpers.length, 5);
    assert.ok(agents.helpers.every((h) => h.appear === 1 && h.folder === 1));
    assert.deepEqual(
      agents.row.map((r) => r.result),
      MODELS.map((_, k) => (k === TIMEOUT_INDEX ? 0 : 1)),
    );
    assert.equal(agents.stopwatch, 1);
    assert.equal(agents.timeout, 1);
    const desks = frameState({ mode: 'desks' }, dur, beats, dur);
    for (const k of ['left', 'key', 'check', 'right', 'strike'] as const) assert.equal(desks[k], 1, `desks.${k}`);
  }
});

test('SeriesRecap: steps per mode, robot mapping and the numbers on screen', () => {
  assert.deepEqual(STEPS, { bench: 2, podium: 2, twins: 3, agents: 2, desks: 3 });
  assert.equal(NAME_STEPS, 3);
  assert.equal(stepStarts({ mode: 'podium', variant: 'name' }, [0.2, 1, 2], 10).length, 3);
  assert.equal(stepStarts({ mode: 'podium', variant: 'story' }, [0.2, 1, 2], 10).length, 2);
  assert.deepEqual(BENCH_CARDS.map((c) => c.label), ['MATHS', 'CODE', 'REASONING']);
  assert.deepEqual(
    BENCH_RANKS.map((r) => [r.rank, MODELS[r.model].robot, r.label]),
    [
      ['1', 'robot-violet', 'Opus 5'],
      ['2', 'robot-teal', 'Fable 5'],
      ['3', 'robot-sky', 'Gemini'],
    ],
  );
  assert.ok(BENCH_RANKS[0].bar > BENCH_RANKS[1].bar && BENCH_RANKS[1].bar > BENCH_RANKS[2].bar);
  assert.equal(stepStarts({ mode: 'twins' }, [0.2, 1, 2], 10).length, 3);
  assert.deepEqual(
    MODELS.map((m) => [m.name, m.robot, m.hue]),
    [
      ['Gemini', 'robot-sky', 0],
      ['Opus', 'robot-violet', 0],
      ['Fable', 'robot-teal', 0],
      ['GLM', 'robot-graphite', 0],
      ['Kimi', 'robot-rose', 0],
      ['Qwen', 'robot-teal', 70],
      ['DeepSeek', 'robot-amber', 0],
    ],
  );
  assert.equal(MODELS[TIMEOUT_INDEX].name, 'Qwen');
  assert.equal(TXT.score, '45/45 ✓');
  assert.equal(TXT.exam, 'x² + 7x + 12 = 0');
  assert.equal(TXT.twin, 'x² + 9x + 20 = 0');
  assert.equal(TXT.word, 'BENCHMAXING');
});
