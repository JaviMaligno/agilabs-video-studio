import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as counter from '../src/anim/Counter.state.ts';
import * as bars from '../src/anim/BarCompare.state.ts';
import * as flow from '../src/anim/FlowDiagram.state.ts';
import * as quote from '../src/anim/KeyQuote.state.ts';
import * as grid from '../src/anim/StatGrid.state.ts';
import * as deg from '../src/anim/CodeDegrader.state.ts';
import * as res from '../src/anim/RepoResult.state.ts';
import * as bud from '../src/anim/TurnBudget.state.ts';
import * as card from '../src/anim/QuestionCard.state.ts';

// Fields that are animation progress and must stay within [0, 1].
const PROGRESS = new Set(['progress', 'appear', 'grow', 'fill', 'draw', 'pop', 'opacity', 'emphasis']);

/** Walks a frame state: every number finite, every progress field within [0, 1]. */
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

type Case = { name: string; state: (t: number, beats: number[], dur: number) => unknown };

const CASES: Case[] = [
  { name: 'Counter', state: (t, b, d) => counter.frameState({ value: 70, suffix: '%', label: 'pass rate', decimals: 1, beat: 1 }, t, b, d) },
  { name: 'Counter (beat out of range)', state: (t, b, d) => counter.frameState({ value: 3, label: 'x', beat: 9 }, t, b, d) },
  {
    name: 'BarCompare',
    state: (t, b, d) =>
      bars.frameState({ bars: [{ label: 'A', value: 14, display: '14/20', highlight: true }, { label: 'B', value: 4 }, { label: 'C', value: 0 }] }, t, b, d),
  },
  { name: 'BarCompare (all zero)', state: (t, b, d) => bars.frameState({ bars: [{ label: 'A', value: 0 }, { label: 'B', value: 0 }] }, t, b, d) },
  {
    name: 'FlowDiagram',
    state: (t, b, d) =>
      flow.frameState(
        {
          layout: 'vertical',
          nodes: [{ id: 'a', label: 'Planner' }, { id: 'b', label: 'Lead' }, { id: 'c', label: 'Implementer' }],
          edges: [{ from: 'a', to: 'b', label: 'plan' }, { from: 'b', to: 'c', broken: true }, { from: 'a', to: 'c' }, { from: 'a', to: 'missing' }],
        },
        t,
        b,
        d,
      ),
  },
  { name: 'KeyQuote', state: (t, b, d) => quote.frameState({ text: 'Nobody tells the implementer why.', emphasis: ['why'] }, t, b, d) },
  { name: 'KeyQuote (empty)', state: (t, b, d) => quote.frameState({ text: '' }, t, b, d) },
  {
    name: 'StatGrid',
    state: (t, b, d) => grid.frameState({ stats: [{ value: '14/20', label: 'with context' }, { value: '4/20', label: 'without' }, { value: '0.0018', label: 'p' }] }, t, b, d),
  },
  ...(['hook', 'habits', 'bet', 'method', 'task', 'flip'] as const).flatMap((mode) => [
    { name: `CodeDegrader ${mode}`, state: (t: number, b: number[], d: number) => deg.frameState({ mode, marks: [0.6, 1.4, 2.2, 3, 3.6] }, t, b, d) },
    { name: `CodeDegrader ${mode} (no marks)`, state: (t: number, b: number[], d: number) => deg.frameState({ mode }, t, b, d) },
  ]),
  ...(['small', 'large', 'split', 'names'] as const).flatMap((mode) => [
    { name: `RepoResult ${mode}`, state: (t: number, b: number[], d: number) => res.frameState({ mode, marks: [0.6, 1.4, 2.2, 3] }, t, b, d) },
    { name: `RepoResult ${mode} (no marks)`, state: (t: number, b: number[], d: number) => res.frameState({ mode }, t, b, d) },
  ]),
  ...(['track', 'small', 'large', 'margin', 'verdict'] as const).flatMap((mode) => [
    { name: `TurnBudget ${mode}`, state: (t: number, b: number[], d: number) => bud.frameState({ mode, marks: [0.6, 1.4, 2.2, 3] }, t, b, d) },
    { name: `TurnBudget ${mode} (no marks)`, state: (t: number, b: number[], d: number) => bud.frameState({ mode }, t, b, d) },
  ]),
];

const SCENARIOS = [
  { beats: [0.3, 1.4, 2.6], dur: 4 },
  { beats: [], dur: 4 },
  // Beats past the scene end (a line pushed late), and a very short scene.
  { beats: [1, 9], dur: 4 },
  { beats: [0], dur: 0.5 },
];

test('components are total over [0, sceneEnd]', () => {
  for (const c of CASES) {
    for (const { beats, dur } of SCENARIOS) {
      for (const t of [-1, 0, ...beats, dur / 2, dur, dur + 2]) {
        check(c.state(t, beats, dur), `${c.name}@t=${t},dur=${dur},beats=[${beats}]`);
      }
    }
  }
});

test('components reach their end state by the end of the scene', () => {
  for (const { beats, dur } of SCENARIOS) {
    const b = bars.frameState({ bars: [{ label: 'A', value: 10 }, { label: 'B', value: 5 }, { label: 'C', value: 1 }] }, dur, beats, dur);
    assert.deepEqual(b.bars.map((x) => x.grow), [1, 1, 1]);
    const g = grid.frameState({ stats: [{ value: '1', label: 'a' }, { value: '2', label: 'b' }] }, dur, beats, dur);
    assert.deepEqual(g.tiles.map((x) => x.pop), [1, 1]);
    const f = flow.frameState({ layout: 'horizontal', nodes: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }], edges: [{ from: 'a', to: 'b' }] }, dur, beats, dur);
    assert.deepEqual(f.nodes.map((x) => x.appear), [1, 1]);
    assert.equal(f.edges[0].draw, 1);
    const q = quote.frameState({ text: 'one two three', emphasis: ['two'] }, dur, beats, dur);
    assert.ok(q.words.every((w) => w.opacity === 1));
    assert.equal(q.emphasis, 1);
  }
});

test('components show nothing before their first beat', () => {
  const b = bars.frameState({ bars: [{ label: 'A', value: 10 }] }, 0.5, [1], 4);
  assert.equal(b.bars[0].grow, 0);
  const c = counter.frameState({ value: 42, label: 'x' }, 0.5, [1], 4);
  assert.equal(c.appear, 0);
  assert.equal(c.text, '0');
});

test('Counter shows exact final value at end', () => {
  for (const props of [
    { value: 70, suffix: '%', label: 'x' },
    { value: 0.0018, decimals: 4, label: 'p' },
    { value: 1234.5, prefix: '$', decimals: 1, label: 'cost' },
  ]) {
    const dur = 3;
    const s = counter.frameState(props, dur, [2.5], dur);
    assert.equal(s.text, `${props.prefix ?? ''}${props.value.toFixed(props.decimals ?? 0)}${props.suffix ?? ''}`);
    assert.equal(s.progress, 1);
  }
});

test('Counter counts up monotonically with ease-out', () => {
  const values = [0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2].map((t) => counter.frameState({ value: 100, label: 'x' }, t, [0], 5).value);
  for (let i = 1; i < values.length; i++) assert.ok(values[i] >= values[i - 1]);
  // Ease-out: more than half the way there at half the time.
  assert.ok(values[3] > 50, `value at 0.6 s is ${values[3]}`);
});

test('BarCompare uses display text when given', () => {
  const s = bars.frameState(
    { bars: [{ label: 'with', value: 14, display: '14/20', highlight: true }, { label: 'without', value: 4 }, { label: 'rate', value: 70 }], unit: '%' },
    5,
    [0, 1, 2],
    5,
  );
  assert.equal(s.bars[0].text, '14/20');
  assert.equal(s.bars[1].text, '4%');
  assert.equal(s.bars[0].highlight, true);
  assert.equal(s.bars[2].text, '70%');
  assert.equal(s.bars[2].fill, 1);
  assert.ok(Math.abs(s.bars[0].fill - 14 / 70) < 1e-9);
  assert.ok(Math.abs(s.bars[1].fill - 4 / 70) < 1e-9);
});

test('BarCompare grows one bar per beat', () => {
  const s = bars.frameState({ bars: [{ label: 'A', value: 1 }, { label: 'B', value: 1 }] }, 1.5, [0, 2], 5);
  assert.equal(s.bars[0].grow, 1);
  assert.equal(s.bars[1].grow, 0);
});

test('KeyQuote colours emphasised words and phrases', () => {
  const s = quote.frameState({ text: 'Help came from the topology, not the protocol.', emphasis: ['topology', 'not the protocol'] }, 4, [0], 4);
  assert.deepEqual(
    s.words.filter((w) => w.emphasis).map((w) => w.text),
    ['topology,', 'not', 'the', 'protocol.'],
  );
  // "the" before "topology" is not part of the emphasised phrase.
  assert.equal(s.words[3].emphasis, false);
});

test('FlowDiagram: an edge draws before the node it leads to; broken edges keep a gap', () => {
  const props = {
    layout: 'vertical' as const,
    nodes: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }],
    edges: [{ from: 'a', to: 'b', broken: true }],
  };
  const s = flow.frameState(props, 2.1, [0, 2], 6);
  assert.ok(s.edges[0].draw > 0);
  assert.equal(s.nodes[1].appear, 0);
  const geo = flow.flowGeometry(props, { w: 936, h: 1000 });
  const parts = flow.edgeSegments(geo.edges[0].points, 1, true);
  assert.equal(parts.length, 2);
  assert.ok(flow.polylineLength(parts[0]) + flow.polylineLength(parts[1]) < flow.polylineLength(geo.edges[0].points) * 0.8);
});

test('FlowDiagram layout keeps every node inside the box', () => {
  for (const layout of ['vertical', 'horizontal'] as const) {
    for (const n of [2, 3, 4, 5]) {
      const nodes = Array.from({ length: n }, (_, i) => ({ id: `n${i}`, label: `Node ${i}` }));
      const edges = nodes.slice(1).map((node, i) => ({ from: nodes[i].id, to: node.id }));
      edges.push({ from: 'n0', to: `n${n - 1}` });
      for (const box of [{ w: 936, h: 1000 }, { w: 1600, h: 680 }]) {
        const geo = flow.flowGeometry({ layout, nodes, edges }, box);
        for (const nd of geo.nodes) {
          assert.ok(nd.x - nd.w / 2 >= -0.5 && nd.x + nd.w / 2 <= box.w + 0.5, `${layout} n=${n} x overflow`);
          assert.ok(nd.y - nd.h / 2 >= -0.5 && nd.y + nd.h / 2 <= box.h + 0.5, `${layout} n=${n} y overflow`);
        }
        for (const e of geo.edges) for (const [x, y] of e.points) assert.ok(x >= 0 && x <= box.w && y >= 0 && y <= box.h, `${layout} n=${n} edge outside`);
      }
    }
  }
});

test('StatGrid: tiles pop in per beat and lay out in a grid', () => {
  const s = grid.frameState({ stats: [{ value: '1', label: 'a' }, { value: '2', label: 'b' }, { value: '3', label: 'c' }, { value: '4', label: 'd' }] }, 1.2, [0, 1, 2, 3], 5);
  assert.equal(s.tiles[0].pop, 1);
  assert.ok(s.tiles[1].pop > 0 && s.tiles[1].pop < 1);
  assert.equal(s.tiles[2].pop, 0);
  assert.deepEqual(grid.gridShape(4, true), { cols: 2, rows: 2 });
  assert.deepEqual(grid.gridShape(3, true), { cols: 1, rows: 3 });
  assert.deepEqual(grid.gridShape(3, false), { cols: 3, rows: 1 });
});

test('CodeDegrader: the tests badge never moves while the code and the tree degrade', () => {
  const pre = deg.frameState({ mode: 'method', marks: [0.4, 1.5, 3, 4, 5] }, 3.9, [0.2, 2.8], 7);
  assert.ok(pre.code.dirty.every((d) => d === 0));
  assert.equal(pre.tree.dirty, 0);
  assert.equal(pre.badge.pop, 1);
  const end = deg.frameState({ mode: 'method', marks: [0.4, 1.5, 3, 4, 5] }, 7, [0.2, 2.8], 7);
  assert.ok(end.code.dirty.every((d) => d === 1));
  assert.equal(end.tree.dirty, 1);
  assert.equal(end.tree.strike, 1);
  assert.equal(end.badge.pop, 1);
  // The task picks up where the method ended: same degraded cards, badge still there.
  const task = deg.frameState({ mode: 'task', marks: [0.4, 1.4, 2.6] }, 0, [0.2], 5);
  assert.deepEqual(task.code.dirty, end.code.dirty);
  assert.equal(task.tree.dirty, 1);
  assert.equal(task.badge.pop, 1);
  // The counter ends on the article's figure.
  assert.equal(deg.frameState({ mode: 'task', marks: [0.4, 1.4, 2.6] }, 5, [0.2], 5).counter.value, 2929);
  assert.equal(deg.RUNS, 2929);
});

test('CodeDegrader: the bet tips to WHERE TO LOOK; the flip swings it to HOW IT\'S WRITTEN', () => {
  const bet = deg.frameState({ mode: 'bet', marks: [1, 2, 4] }, 3.9, [0.3, 3], 6);
  assert.equal(bet.balance.tilt, 0);
  assert.equal(deg.frameState({ mode: 'bet', marks: [1, 2, 4] }, 6, [0.3, 3], 6).balance.tilt, 1);
  const flip = (t: number) => deg.frameState({ mode: 'flip', marks: [1.2, 3] }, t, [0.3], 5);
  assert.equal(flip(0).balance.tilt, 1);
  assert.equal(flip(5).balance.tilt, -1);
  assert.equal(flip(5).search.found, 1);
});

test('RepoResult: figures are the article\'s (corrected tables)', () => {
  assert.deepEqual(res.SMALL_BARS.map((b) => b.display), ['98%', '93%', '83%', '81%']);
  assert.deepEqual(res.LARGE_BARS.map((b) => b.display), ['54%', '24%']);
  assert.deepEqual(res.GIVEN_BACK.map((b) => b.value), [80, 97, 80, 85, 78, 82, 86, 86]);
  assert.equal(res.GIVEN_BACK[res.NAMES].label, 'readable names');
  assert.equal(res.BASELINE, 83);
  // Readable names is the highest bar.
  assert.equal(Math.max(...res.GIVEN_BACK.map((b) => b.value)), res.GIVEN_BACK[res.NAMES].value);
});

test('RepoResult: the split starts where the large scene ended, then lifts the bars', () => {
  const large = res.frameState({ mode: 'large', marks: [0.6, 2, 4, 5] }, 7, [0.3, 3.5], 7);
  const split0 = res.frameState({ mode: 'split', marks: [1, 3] }, 0, [0.3], 6);
  assert.deepEqual(split0.bars.grow, large.bars.grow);
  assert.equal(split0.lift, 0);
  assert.equal(split0.files.opacity, large.files.opacity);
  assert.equal(res.frameState({ mode: 'split', marks: [1, 3] }, 6, [0.3], 6).lift, 1);
});

test('TurnBudget: 6 on the small library, 30 then the wall at 40 on the large one', () => {
  const small = bud.frameState({ mode: 'small', marks: [2] }, 4, [0.3], 4);
  assert.equal(small.small.clean.slots, bud.SMALL_TURNS);
  assert.equal(small.small.dirty.slots, 6);
  const mid = bud.frameState({ mode: 'large', marks: [1.6, 3, 4, 5] }, 2.9, [0.2, 2.6], 6);
  assert.equal(mid.large.clean.slots, 30);
  assert.ok(mid.large.dirty.slots <= 30.0001);
  assert.equal(mid.large.stamp, 0);
  const end = bud.frameState({ mode: 'large', marks: [1.6, 3, 4, 5] }, 6, [0.2, 2.6], 6);
  assert.equal(end.large.dirty.slots, bud.BUDGET);
  assert.equal(end.large.stamp, 1);
  assert.equal(bud.BUDGET, 40);
  // margin starts as large ended (both runs filled, stamp in place).
  const margin = bud.frameState({ mode: 'margin', marks: [1.5] }, 0, [0.2], 4);
  assert.equal(margin.large.clean.slots, end.large.clean.slots);
  assert.equal(margin.large.dirty.slots, end.large.dirty.slots);
});

test('QuestionCard: "Kicker · main" splits; plain questions do not', () => {
  assert.deepEqual(card.splitQ('Small library · self-contained files'), { kicker: 'Small library', main: 'self-contained files' });
  assert.deepEqual(card.splitQ('Which habit?'), { kicker: '', main: 'Which habit?' });
});

test('TurnBudget: margin starts with the small library dimmed as the large scene left it', () => {
  const end = bud.frameState({ mode: 'large', marks: [1.6, 3, 4, 5] }, 6, [0.2, 2.6], 6);
  const start = bud.frameState({ mode: 'margin', marks: [1.5] }, 0, [0.2], 4);
  assert.equal(start.small.dim, end.small.dim);
  assert.equal(bud.frameState({ mode: 'margin', marks: [1.5] }, 4, [0.2], 4).small.dim, 0);
});
