import { test } from 'node:test';
import assert from 'node:assert/strict';
import { frameState, type TaskHeatmapProps } from '../src/anim/TaskHeatmap.state.ts';

const PROGRESS = new Set(['progress', 'appear', 'grow', 'fill', 'draw', 'pop', 'opacity', 'emphasis', 'head', 'glow']);

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

const RAW: [string, number[]][] = [
  ["Chat flow: a step before 'Venue'", [0, 1, 1, 1.5, 1.5, 1, 2.5]],
  ['Health app: type while it answers', [0, 1, 1, 1, 2, 2, 2]],
  ['PDF report: overlapping tables', [0.5, 2, 0.5, 3, 1.5, 4, 3]],
  ['Writing: do I overuse a word?', [2.5, 1.5, 3, 2, 1, 3, 2.5]],
  ['Website: show all projects?', [3, 2, 2, 3, 2, 1.5, 3]],
  ['Website: blog to LinkedIn?', [2.5, 2, 3, 2, 1.5, 3, 4]],
  ['Classifier: flat fields for schemas', [1, 3, 3.5, 1, 3, 3, 4]],
  ['Chat flow: stray submit option', [3, 2, 3, 3, 3, 2, 3]],
  ['Ops bot: compact tool outputs', [1.5, 2.5, 1.5, 3.5, 2.5, 4.5, 3.5]],
  ['Analysis service: README up to date?', [1.5, 2.5, 3.5, 3, 1.5, 2.5, 5]],
  ['Classifier: false register match', [3, 2.5, 3, 3, 3, 3, 3]],
  ['Ops bot: is it all audited?', [3, 3, 4, 3, 0.5, 3.5, 5.5]],
  ['Analysis agents: alternative plan', [2, 3, 4, 3.5, 5, 4.5, 3.5]],
  ['MCP server: implement a plan', [4.5, 3.5, 3.5, 3.5, 3.5, 3.5, 4.5]],
  ['Health app: English and Russian', [2.5, 4, 4, 4.5, 6, 4, 2.5]],
  ['Analysis agents: merge outputs', [2.5, 4, 4, 2.5, 5.5, 5, 4]],
  ['Classifier: how does the selector work?', [5, 5.5, 1, 4.5, 6, 4.5, 6.5]],
  ['Classifier: real version in /health', [6.5, 5.5, 6, 5.5, 6.5, 4.5, 6]],
  ['Health app: documented chat bugs', [6.5, 5, 6, 6, 5.5, 5.5, 8]],
];

const PROPS: TaskHeatmapProps = {
  columns: ['Gemini', 'Opus', 'Fable', 'GLM', 'Kimi', 'Qwen', 'DeepSeek'],
  rows: RAW.map(([label, values]) => ({ label, values })),
  max: 8,
  highlightColumn: 6,
};

const CASES: { name: string; props: TaskHeatmapProps }[] = [
  { name: 'TaskHeatmap', props: PROPS },
  { name: 'TaskHeatmap (empty)', props: { columns: [], rows: [] } },
  { name: 'TaskHeatmap (no max, NaN)', props: { columns: ['A', 'B'], rows: [{ label: 'x', values: [NaN, 0] }] } },
];

const SCENARIOS = [
  { beats: [0.3, 3.4], dur: 6 },
  { beats: [], dur: 6 },
  { beats: [1, 9], dur: 4 },
  { beats: [0], dur: 0.5 },
];

test('TaskHeatmap is total over [0, sceneEnd]', () => {
  for (const c of CASES) {
    for (const { beats, dur } of SCENARIOS) {
      for (const t of [-1, 0, ...beats, dur / 2, dur, dur + 2]) {
        check(frameState(c.props, t, beats, dur), `${c.name}@t=${t},dur=${dur},beats=[${beats}]`);
      }
    }
  }
});

test('TaskHeatmap shows nothing before beat 0', () => {
  const s = frameState(PROPS, 0.5, [1, 4], 8);
  assert.equal(s.head, 0);
  assert.ok(s.rows.every((r) => r.opacity === 0));
  assert.equal(s.draw, 0);
  assert.equal(s.appear, 0);
});

test('TaskHeatmap fills rows top to bottom within 2.5 s of beat 0, tag only on beat 1', () => {
  const s = frameState(PROPS, 1 + 2.5, [1, 5], 9);
  assert.ok(s.rows.every((r) => r.opacity === 1));
  assert.equal(s.appear, 0);
  const mid = frameState(PROPS, 2, [1, 5], 9);
  assert.ok(mid.rows[0].opacity > mid.rows[18].opacity);
});

test('TaskHeatmap end state', () => {
  for (const { beats, dur } of SCENARIOS) {
    const s = frameState(PROPS, dur, beats, dur);
    assert.equal(s.rows.length, 19);
    assert.ok(s.rows.every((r) => r.opacity === 1 && r.glow === 0));
    assert.equal(s.head, 1);
    assert.equal(s.draw, 1);
    assert.equal(s.appear, 1);
    assert.equal(s.tag, 'task ≫ model');
    assert.deepEqual(s.columns.map((c) => c.highlight), [false, false, false, false, false, false, true]);
    assert.deepEqual(s.rows[18].cells.map((c) => c.text), ['6.5', '5', '6', '6', '5.5', '5.5', '8']);
    assert.equal(s.rows[18].cells[6].fill, 1);
    assert.equal(s.rows[0].cells[0].fill, 0);
  }
});
