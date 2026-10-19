import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as counter from '../src/anim/Counter.state.ts';
import * as bars from '../src/anim/BarCompare.state.ts';
import * as flow from '../src/anim/FlowDiagram.state.ts';
import * as quote from '../src/anim/KeyQuote.state.ts';
import * as grid from '../src/anim/StatGrid.state.ts';
import * as pull from '../src/anim/PullBack.state.ts';
import * as harness from '../src/anim/HarnessStack.state.ts';

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
  { name: 'PullBack teaser', state: (t, b, d) => pull.frameState({ mode: 'teaser', quote: 'Fewer keyboards, more dashboards.', emphasis: ['dashboards'] }, t, b, d) },
  { name: 'PullBack ladder', state: (t, b, d) => pull.frameState({ mode: 'ladder', quote: 'Fewer keyboards, more dashboards.', emphasis: ['dashboards'] }, t, b, d) },
  { name: 'PullBack code', state: (t, b, d) => pull.frameState({ mode: 'code', quote: 'Fewer keyboards, more dashboards.', emphasis: ['dashboards'] }, t, b, d) },
  { name: 'PullBack diff', state: (t, b, d) => pull.frameState({ mode: 'diff', quote: 'Fewer keyboards, more dashboards.', emphasis: ['dashboards'] }, t, b, d) },
  { name: 'PullBack saturate', state: (t, b, d) => pull.frameState({ mode: 'saturate', quote: 'Fewer keyboards, more dashboards.', emphasis: ['dashboards'] }, t, b, d) },
  { name: 'PullBack result', state: (t, b, d) => pull.frameState({ mode: 'result', quote: 'Fewer keyboards, more dashboards.', emphasis: ['dashboards'] }, t, b, d) },
  { name: 'PullBack nested', state: (t, b, d) => pull.frameState({ mode: 'nested', quote: 'Fewer keyboards, more dashboards.', emphasis: ['dashboards'] }, t, b, d) },
  { name: 'PullBack conveyor', state: (t, b, d) => pull.frameState({ mode: 'conveyor', quote: 'Fewer keyboards, more dashboards.', emphasis: ['dashboards'] }, t, b, d) },
  { name: 'PullBack dashboard', state: (t, b, d) => pull.frameState({ mode: 'dashboard', quote: 'Fewer keyboards, more dashboards.', emphasis: ['dashboards'] }, t, b, d) },
  { name: 'PullBack contract', state: (t, b, d) => pull.frameState({ mode: 'contract', quote: 'Fewer keyboards, more dashboards.', emphasis: ['dashboards'] }, t, b, d) },
  { name: 'PullBack quote', state: (t, b, d) => pull.frameState({ mode: 'quote', quote: 'Fewer keyboards, more dashboards.', emphasis: ['dashboards'] }, t, b, d) },
  { name: 'PullBack teaser (pulls)', state: (t, b, d) => pull.frameState({ mode: 'teaser', cues: [0.4, 1.2, 9] }, t, b, d) },
  { name: 'PullBack contract (lights)', state: (t, b, d) => pull.frameState({ mode: 'contract', cues: [0.5, 1, 2, 3, 20] }, t, b, d) },
  { name: 'HarnessStack', state: (t, b, d) => harness.frameState({}, t, b, d) },
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

test('PullBack: dolly hits both framings and keeps its fixed point', () => {
  const a = { cx: 100, cy: 200, z: 8 };
  const b = { cx: 300, cy: 500, z: 1 };
  assert.deepEqual(pull.dolly(a, b, 0), a);
  assert.deepEqual(pull.dolly(a, b, 1), b);
  const fx = (b.cx * b.z - a.cx * a.z) / (b.z - a.z);
  const mid = pull.dolly(a, b, 0.4);
  // The fixed point sits at the same screen offset at the start and mid-way.
  assert.ok(Math.abs((fx - a.cx) * a.z - (fx - mid.cx) * mid.z) < 1e-6);
  assert.ok(mid.z < a.z && mid.z > b.z);
});

test('PullBack: each scene ends on the next level, the ladder fills one rung at a time', () => {
  const end = (mode: pull.Mode) => pull.frameState({ mode }, 6, [0.2, 3], 6);
  assert.equal(end('code').ladder.lit.filter((v) => v === 1).length, 1);
  assert.equal(end('diff').ladder.lit.filter((v) => v === 1).length, 2);
  assert.equal(end('result').ladder.lit.filter((v) => v === 1).length, 3);
  assert.equal(end('dashboard').ladder.lit.filter((v) => v === 1).length, 4);
  // The result scene leaves our pane in the app's diff panel; the others are gone.
  const r = end('result');
  assert.deepEqual({ x: r.panes[0].x, y: r.panes[0].y, s: r.panes[0].s }, pull.P2_FINAL);
  assert.ok(r.panes.slice(1).every((p) => p.opacity === 0));
  // The conveyor scene ends at the widest framing.
  assert.ok(Math.abs(end('conveyor').cam.z - end('dashboard').cam.z) < 1e-9);
  assert.equal(end('diff').editor, 0);
  assert.equal(end('code').accept, 1);
});

test('PullBack contract: the four harness labels light in order, the bell lands in the queue', () => {
  const cues = [1.5, 3, 3.6, 4.2, 5];
  const at = (t: number) => pull.frameState({ mode: 'contract', cues }, t, [0.2, 2.5], 7);
  assert.deepEqual(at(2.8).contract.map((v) => v > 0.5), [false, false, false, false]);
  assert.deepEqual(at(3.9).contract.map((v) => v > 0.5), [true, true, false, false]);
  assert.deepEqual(at(7).contract, [1, 1, 1, 1]);
  assert.equal(at(7).queueItems, 3);
});

test('HarnessStack: every surface docks and the slab is lit by the end', () => {
  const s = harness.frameState({}, 5, [0.2, 1.8], 5);
  assert.ok(s.tiles.every((x) => x.dock === 1 && x.rot === 0));
  assert.deepEqual(s.labels, [1, 1, 1, 1, 1, 1]);
  const early = harness.frameState({}, 1, [0.2, 1.8], 5);
  assert.ok(early.tiles.every((x) => x.dock === 0));
  assert.equal(early.slab, 0);
});

test('HarnessStack: named surfaces light on their words', () => {
  const cues = [0.3, 1.2, 1.9];
  const s = harness.frameState({ cues }, 1.0, [0.2, 2.6], 6);
  assert.ok(s.tiles[0].call > 0.5 && s.tiles[2].call === 0 && s.tiles[3].call === 0);
});
