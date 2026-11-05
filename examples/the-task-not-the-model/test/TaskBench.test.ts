import { test } from 'node:test';
import assert from 'node:assert/strict';
import { frameState, robotFor, type TaskBenchProps } from '../src/anim/TaskBench.state.ts';

// Fields that are animation progress and must stay within [0, 1].
const PROGRESS = new Set([
  'progress', 'appear', 'grow', 'fill', 'draw', 'pop', 'opacity', 'emphasis',
  'backdrop', 'card', 'counter', 'notes', 'label', 'chipAppear', 'gaze', 'robots', 'equals', 'travel', 'frac',
]);

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

const PILES = [
  { name: 'Gemini', value: 2.7, display: '2.7' },
  { name: 'Opus', value: 2.9, display: '2.9' },
  { name: 'Fable', value: 3.0, display: '3.0' },
  { name: 'GLM', value: 3.1, display: '3.1' },
  { name: 'Kimi', value: 3.2, display: '3.2' },
  { name: 'Qwen', value: 3.4, display: '3.4' },
  { name: 'DeepSeek', value: 4.0, display: '4.0', highlight: true },
];

const CASES: { name: string; props: TaskBenchProps }[] = [
  { name: 'setup', props: { mode: 'setup' } },
  { name: 'judges', props: { mode: 'judges' } },
  { name: 'piles', props: { mode: 'piles', piles: PILES } },
  { name: 'piles+stamp', props: { mode: 'piles', piles: PILES, stamp: 'accepted as is: 8 of 266' } },
  { name: 'piles grown', props: { mode: 'piles', piles: PILES, grown: true, stamp: 'accepted as is: 8 of 266' } },
  { name: 'piles empty', props: { mode: 'piles', piles: [{ name: 'X', value: Number.NaN, display: '' }] } },
  { name: 'pair', props: { mode: 'pair', a: { name: 'Opus', value: 2.9, display: '2.9' }, b: { name: 'Fable', value: 3.0, display: '3.0' } } },
  { name: 'pair (no sides)', props: { mode: 'pair' } },
];

const SCENARIOS = [
  { beats: [0.3, 1.4, 2.6], dur: 4 },
  { beats: [], dur: 4 },
  { beats: [1, 9], dur: 4 },
  { beats: [0], dur: 0.5 },
];

/** Every number of the state that is a progress field, flattened. */
const progresses = (value: unknown, key = ''): number[] => {
  if (typeof value === 'number') return PROGRESS.has(key) && key !== 'frac' && key !== 'pop' ? [value] : [];
  if (Array.isArray(value)) return value.flatMap((v) => progresses(v, key));
  if (value && typeof value === 'object') return Object.entries(value).flatMap(([k, v]) => progresses(v, k));
  return [];
};

test('TaskBench is total over [0, sceneEnd]', () => {
  for (const c of CASES) {
    for (const { beats, dur } of SCENARIOS) {
      for (const t of [-1, 0, ...beats, dur / 2, dur, dur + 2]) {
        check(frameState(c.props, t, beats, dur), `${c.name}@t=${t},dur=${dur},beats=[${beats}]`);
      }
    }
  }
});

test('TaskBench shows nothing before its first beat', () => {
  for (const c of CASES.filter((x) => !x.props.grown)) {
    const s = frameState(c.props, 0.2, [0.3, 1.4, 2.6], 4);
    assert.ok(progresses(s).every((v) => v === 0), `${c.name} visible before beat 0`);
  }
});

test('TaskBench reaches its end state at the scene end', () => {
  for (const c of CASES) {
    for (const { beats, dur } of SCENARIOS) {
      const s = frameState(c.props, dur, beats, dur);
      assert.ok(progresses(s).every((v) => v === 1), `${c.name} not finished at dur=${dur}, beats=[${beats}]`);
    }
  }
  const setup = frameState({ mode: 'setup' }, 4, [0.3, 1.4, 2.6], 4);
  assert.equal(setup.mode === 'setup' && setup.count, 19);
});

test('piles: the six grow on beat 0, the highlighted one on beat 1, the stamp after it', () => {
  const beats = [0.3, 2.5];
  const p: TaskBenchProps = { mode: 'piles', piles: PILES, stamp: 'accepted as is: 8 of 266' };
  const mid = frameState(p, 2.0, beats, 6);
  assert.equal(mid.mode, 'piles');
  if (mid.mode !== 'piles') return;
  assert.ok(mid.piles.slice(0, 6).every((x) => x.grow === 1));
  assert.equal(mid.piles[6].grow, 0);
  assert.equal(mid.stamp?.appear, 0);
  const late = frameState(p, 2.6, beats, 6);
  if (late.mode !== 'piles') return;
  assert.ok(late.piles[6].grow > 0);
  assert.equal(late.stamp?.appear, 0);
  // Heights are proportional to value on a scale of 5.
  assert.equal(mid.piles[6].frac, 4.0 / 5);
});

test('piles grown: finished from the start, stamp lands on beat 0', () => {
  const p: TaskBenchProps = { mode: 'piles', piles: PILES, grown: true, stamp: 'accepted as is: 8 of 266' };
  const s0 = frameState(p, 0, [0.5], 4);
  if (s0.mode !== 'piles') throw new Error('mode');
  assert.ok(s0.piles.every((x) => x.grow === 1 && x.label === 1));
  assert.equal(s0.stamp?.appear, 0);
  const s1 = frameState(p, 1.2, [0.5], 4);
  if (s1.mode !== 'piles') throw new Error('mode');
  assert.equal(s1.stamp?.appear, 1);
});

test('pair: papers fly only on beat 2', () => {
  const p: TaskBenchProps = { mode: 'pair', a: { name: 'Opus', value: 2.9, display: '2.9' }, b: { name: 'Fable', value: 3.0, display: '3.0' } };
  const s = frameState(p, 2.9, [0.3, 1.0, 3.0], 6);
  if (s.mode !== 'pair') throw new Error('mode');
  assert.ok(s.piles.every((x) => x.grow === 1));
  assert.ok(s.papers.every((x) => x.appear === 0));
});

test('robot mapping', () => {
  assert.equal(robotFor('Gemini').src, 'cast/robot-sky.png');
  assert.equal(robotFor('Opus').src, 'cast/robot-violet.png');
  assert.equal(robotFor('Fable').src, 'cast/robot-teal.png');
  assert.equal(robotFor('GLM').src, 'cast/robot-graphite.png');
  assert.equal(robotFor('Kimi').src, 'cast/robot-rose.png');
  assert.deepEqual(robotFor('Qwen'), { src: 'cast/robot-teal.png', filter: 'hue-rotate(70deg)' });
  assert.equal(robotFor('DeepSeek').src, 'cast/robot-amber.png');
});
