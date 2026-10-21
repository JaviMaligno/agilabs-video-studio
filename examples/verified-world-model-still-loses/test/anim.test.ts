import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as counter from '../src/anim/Counter.state.ts';
import * as bars from '../src/anim/BarCompare.state.ts';
import * as flow from '../src/anim/FlowDiagram.state.ts';
import * as quote from '../src/anim/KeyQuote.state.ts';
import * as grid from '../src/anim/StatGrid.state.ts';
import * as well from '../src/anim/DepthWell.state.ts';
import * as qcard from '../src/anim/QuestionCard.state.ts';
import * as wrm from '../src/anim/WinRateMeter.state.ts';
import { COMPETENT_LENGTHS, RANDOM_LENGTHS } from '../src/data/lengths.ts';

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
  ...(['hook', 'gate', 'rule', 'ruleCap', 'random', 'competent', 'omit', 'accuracy', 'mechanism', 'repair', 'lesson', 'fix', 'still'] as const).map((mode) => ({
    name: `DepthWell ${mode}`,
    state: (t: number, b: number[], d: number) =>
      well.frameState(
        {
          mode,
          of: 'mechanism',
          chip: 'model',
          chipTo: mode === 'fix' ? 'truth' : undefined,
          stamp: { text: 'GATE · 100%', sub: 's', beat: 1, delay: 1 },
          counter: { to: 2.5, decimals: 1, suffix: '%', text: '2.5%', label: 'x', beat: 1 },
        },
        t,
        b,
        d,
      ),
  })),
  { name: 'DepthWell gate missed', state: (t, b, d) => well.frameState({ mode: 'gate', sample: 'missed' }, t, b, d) },
  ...(['ask', 'yes', 'verdict'] as const).map((mode) => ({ name: `QuestionCard ${mode}`, state: (t: number, b: number[], d: number) => qcard.frameState({ mode }, t, b, d) })),
  { name: 'WinRateMeter', state: (t, b, d) => wrm.frameState({ delays: { model: 1.6, fair: 1.3 } }, t, b, d) },
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


test('DepthWell: rays and glow are the real game lengths; the missed sample never reaches the floor', () => {
  const end = well.frameState({ mode: 'gate' }, 99, [0.2, 3], 99).world;
  assert.equal(end.rays.length, RANDOM_LENGTHS.length);
  assert.equal(end.rays.filter((r) => r.floor === 1).length, RANDOM_LENGTHS.filter((l) => l >= 100).length);
  assert.ok(end.rays.every((r) => r.draw === 1 && r.tick === 1));
  const missed = well.frameState({ mode: 'gate', sample: 'missed' }, 99, [0.2, 3], 99).world;
  assert.equal(missed.rays.length, RANDOM_LENGTHS.filter((l) => l < 100).length);
  assert.ok(missed.rays.every((r) => r.floor === 0 && r.yEnd < well.G.floor));
  const glow = well.frameState({ mode: 'competent' }, 99, [0.2, 3], 99).world.glow;
  assert.equal(glow.strands.filter((s) => s.yEnd === well.G.floor).length, COMPETENT_LENGTHS.filter((l) => l >= 100).length);
  assert.equal(glow.pool, 1);
  // Rays land in the shaft, never past the floor.
  assert.ok(end.rays.every((r) => r.yEnd >= well.G.lip && r.yEnd <= well.G.floor && r.x > well.G.x0 && r.x < well.G.x1));
});

test('DepthWell: the hook meter rests on the article values, never an in-between number', () => {
  const beats = [0.15, 3.6];
  const early = well.frameState({ mode: 'hook' }, 1, beats, 6.5).world.top.meter;
  assert.equal(early.opacity, 0);
  const end = well.frameState({ mode: 'hook' }, 6.5, beats, 6.5).world.top.meter;
  assert.equal(end.text, '0.404');
  for (let t = 0; t <= 6.5; t += 0.05) assert.ok(['0.495', '0.404'].includes(well.frameState({ mode: 'hook' }, t, beats, 6.5).world.top.meter.text));
  assert.equal(well.frameState({ mode: 'hook' }, 6.5, beats, 6.5).world.floor.red, 1);
});

test('DepthWell: the floor is the truth until the rule is left out, and the truth again in the fix', () => {
  const at = (mode: well.Mode, t: number) => well.frameState({ mode }, t, [0.2, 1.5], 5).world.floor;
  assert.equal(at('competent', 5).truth, 1);
  assert.equal(at('omit', 0).truth, 1);
  assert.equal(at('omit', 5).model, 1);
  assert.equal(at('omit', 5).truth, 0);
  assert.equal(at('fix', 0).model, 1);
  assert.equal(at('fix', 5).truth, 1);
  // The only rose squares the planner visits sit on the floor.
  const sq = well.frameState({ mode: 'accuracy' }, 9, [0.2], 9).world.squares;
  assert.ok(sq.filter((q) => q.rose).every((q) => q.y > well.G.floor));
  assert.ok(sq.filter((q) => q.rose).length / sq.length < 0.1);
});

test('DepthWell: the fix chip swaps from the model to the truth', () => {
  const s0 = well.frameState({ mode: 'fix', chip: 'model', chipTo: 'truth' }, 0.5, [0.2, 1.5], 5).chip;
  assert.equal(s0.aOpacity, 1);
  assert.equal(s0.bOpacity, 0);
  const s1 = well.frameState({ mode: 'fix', chip: 'model', chipTo: 'truth' }, 5, [0.2, 1.5], 5).chip;
  assert.equal(s1.aOpacity, 0);
  assert.equal(s1.bOpacity, 1);
});

test('DepthWell: the counter ends on the article figure', () => {
  const c = well.frameState({ mode: 'random', counter: { to: 2.5, decimals: 1, suffix: '%', text: '2.5%', label: 'x', beat: 1 } }, 6, [0.2, 2], 6).world.top.counter;
  assert.equal(c.text, '2.5%');
  const h = well.frameState({ mode: 'competent', counter: { to: 50, decimals: 0, prefix: '~', suffix: '%', text: '~50%', label: 'x', beat: 1 } }, 6, [0.2, 2], 6).world.top.counter;
  assert.equal(h.text, '~50%');
});

test('QuestionCard and WinRateMeter end states', () => {
  const v = qcard.frameState({ mode: 'verdict' }, 5, [0.2], 5);
  assert.equal(v.stamp.text, 'NOT ENOUGH ✗');
  assert.equal(v.stamp.pop, 1);
  assert.equal(qcard.frameState({ mode: 'ask' }, 5, [0.2], 5).stamp.opacity, 0);
  const m = wrm.frameState({}, 9, [0.3, 3], 9);
  assert.deepEqual(m.rows.map((r) => r.text), ['0.495', '0.404']);
  assert.equal(m.gap.text, '0.091');
  assert.ok(m.rows.every((r) => r.appear === 1));
  assert.equal(m.footnote, 1);
  assert.equal(wrm.frameState({}, 0.1, [0.3, 3], 9).rows[1].appear, 0);
});
