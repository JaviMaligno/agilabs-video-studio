import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as counter from '../src/anim/Counter.state.ts';
import * as bars from '../src/anim/BarCompare.state.ts';
import * as flow from '../src/anim/FlowDiagram.state.ts';
import * as quote from '../src/anim/KeyQuote.state.ts';
import * as grid from '../src/anim/StatGrid.state.ts';
import * as wall from '../src/anim/WeightWall.state.ts';
import * as probe from '../src/anim/TerminalProbe.state.ts';
import * as curve from '../src/anim/ReplayCurve.state.ts';
import * as receipt from '../src/anim/CostReceipt.state.ts';
import * as model from '../src/anim/wall.ts';
import * as curveData from '../src/anim/curve.ts';

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
];

for (const mode of ['hook', 'paper', 'test', 'knob', 'zero', 'replay', 'methods', 'close'] as const) {
  CASES.push({ name: `WeightWall ${mode}`, state: (t, b, d) => wall.frameState({ mode }, t, b, d) });
}
CASES.push({ name: 'WeightWall hook (forgetAt late)', state: (t, b, d) => wall.frameState({ mode: 'hook', forgetAt: 99 }, t, b, d) });
CASES.push({ name: 'TerminalProbe', state: (t, b, d) => probe.frameState({}, t, b, d) });
CASES.push({ name: 'ReplayCurve', state: (t, b, d) => curve.frameState({ mode: 'both' }, t, b, d) });
CASES.push({ name: 'CostReceipt bill', state: (t, b, d) => receipt.frameState({ mode: 'bill' }, t, b, d) });
CASES.push({ name: 'CostReceipt dial', state: (t, b, d) => receipt.frameState({ mode: 'dial' }, t, b, d) });

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

test('wall model: seeded sets are disjoint and the right size', () => {
  const skill = new Set(model.SKILL);
  assert.equal(skill.size, 24);
  assert.equal(new Set(model.FORGET).size, 22);
  for (const i of model.FORGET) assert.ok(!skill.has(i));
  for (const i of model.RESIDUAL) assert.ok(model.FORGET.includes(i));
  assert.ok(model.RESIDUAL.size >= 4 && model.RESIDUAL.size <= 7);
});

test('wall model: 10 % replay makes one card in ten white; 0 % none', () => {
  const s = { start: 0, end: 20, dt: 0.2, travel: 0.8, ratio: () => 0.1 };
  const n = model.cardCount(s);
  let white = 0;
  for (let k = 0; k < n; k++) if (model.isWhite(s, k)) white++;
  assert.equal(white, Math.floor(n / 10));
  const z = { ...s, ratio: () => 0 };
  for (let k = 0; k < n; k++) assert.equal(model.isWhite(z, k), false);
  assert.ok(Math.abs(model.ratioAtDial(1) - 0.1) < 1e-9);
  assert.ok(Math.abs(model.ratioAtDial(3) - 0.5) < 1e-9);
});

test('WeightWall zero: tiles go dark and gauges drop by the scene end', () => {
  const s = wall.frameState({ mode: 'zero' }, 10, [0.2, 2.5, 4.5], 10);
  const dark = s.tiles.filter((x) => x.dark > 0.99).length;
  assert.equal(dark, model.FORGET.length);
  assert.ok(s.gauges.every((g) => g.drop === 1));
  assert.equal(s.stats.avg, 1);
  assert.equal(s.stats.worst, 1);
  assert.equal(s.gauges[1].highlight, 1);
});

test('WeightWall replay: white cards relight all but the residual tiles', () => {
  const s = wall.frameState({ mode: 'replay' }, 12, [0.2, 3.2], 12);
  const dark = s.tiles.map((x, i) => (x.dark > 0.5 ? i : -1)).filter((i) => i >= 0);
  assert.ok(dark.length > 0, 'some residual forgetting stays');
  for (const i of dark) assert.ok(model.RESIDUAL.has(i), `tile ${i} should have relit`);
  assert.equal(s.curve.seg, 3);
  assert.equal(s.wall.shrink, 1);
});

test('WeightWall methods: LoRA glass and adapter column are on by the end; nothing before beat 1', () => {
  const end = wall.frameState({ mode: 'methods' }, 9, [0.2, 4], 9);
  assert.equal(end.methods.right.glass, 1);
  assert.equal(end.methods.right.fill, 1);
  const early = wall.frameState({ mode: 'methods' }, 2, [0.2, 4], 9);
  assert.equal(early.methods.right.appear, 0);
  assert.equal(early.methods.right.column, 0);
});

test('WeightWall hook: no tile is dark before forgetAt', () => {
  const s = wall.frameState({ mode: 'hook', forgetAt: 3 }, 2.9, [0.3], 6);
  assert.ok(s.tiles.every((x) => x.dark === 0));
  const e = wall.frameState({ mode: 'hook', forgetAt: 3 }, 6, [0.3], 6);
  assert.equal(e.tiles.filter((x) => x.dark === 1).length, model.FORGET.length);
});

test('CostReceipt bill: lines print on their beats; lens and stamps last', () => {
  const beats = [0.2, 3, 4.5, 7, 8.5, 10.5, 12.5];
  const a = receipt.frameState({ mode: 'bill' }, 2.5, beats, 15);
  assert.ok(a.lines[1][0] > 0.9);
  assert.equal(a.lines[1][1], 0);
  assert.equal(a.lens.appear, 0);
  const e = receipt.frameState({ mode: 'bill' }, 15, beats, 15);
  assert.deepEqual(e.lines.map((l) => l.map((x) => Math.round(x))), [[1, 1], [1, 1], [1, 1]]);
  assert.equal(e.lens.appear, 1);
  assert.equal(e.stamp.full, 1);
  assert.equal(e.stamp.lora, 1);
  assert.equal(e.ood.exit, 1);
});

test('ReplayCurve: LoRA points land 0 % first', () => {
  const s = curve.frameState({ mode: 'both', noMixAt: 2 }, 2.2, [0.2, 3.5], 6);
  assert.ok(s.lora[0] > 0);
  assert.equal(s.lora[1], 0);
});

test('curve data matches the article chart and the factcheck', () => {
  assert.deepEqual([...curveData.FULL], [-0.078, -0.021, -0.012, -0.015]);
  assert.deepEqual([...curveData.LORA], [0.002, 0.005, 0.009, 0.009]);
  // ≈73 % of the average loss recovered at 10 %.
  assert.equal(Math.round(((curveData.FULL[0] - curveData.FULL[1]) / curveData.FULL[0]) * 100), 73);
});
