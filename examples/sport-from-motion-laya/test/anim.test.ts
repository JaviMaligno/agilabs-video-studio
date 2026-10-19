import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as counter from '../src/anim/Counter.state.ts';
import * as bars from '../src/anim/BarCompare.state.ts';
import * as flow from '../src/anim/FlowDiagram.state.ts';
import * as quote from '../src/anim/KeyQuote.state.ts';
import * as grid from '../src/anim/StatGrid.state.ts';
import * as dots from '../src/anim/DotStage.state.ts';
import * as deck from '../src/anim/SnapshotDeck.state.ts';
import * as mon from '../src/anim/LossMonitor.state.ts';
import { readFileSync } from 'node:fs';

const CLIPS = JSON.parse(readFileSync(new URL('../src/data/clips.json', import.meta.url), 'utf8')) as dots.ClipSet;
const CURVES = JSON.parse(readFileSync(new URL('../src/data/laya-curves.json', import.meta.url), 'utf8')) as mon.Curves;
const MON_MODES = ['seeds3', 'official', 'control', 'curves', 'wall', 'coin'] as const;

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
  ...(['specialist', 'guesses', 'totext'] as const).map((mode) => ({ name: `DotStage ${mode}`, state: (t: number, b: number[], d: number) => dots.frameState({ mode, clock: 7.3 }, t, b, d, CLIPS) })),
  ...(['laya', 'company'] as const).map((mode) => ({ name: `SnapshotDeck ${mode}`, state: (t: number, b: number[], d: number) => deck.frameState({ mode }, t, b, d) })),
  ...MON_MODES.map((mode) => ({ name: `LossMonitor ${mode}`, state: (t: number, b: number[], d: number) => mon.frameState({ mode, clock: 3.1 }, t, b, d, CURVES) })),
  ...MON_MODES.map((mode) => ({ name: `LossMonitor ${mode} (marks)`, state: (t: number, b: number[], d: number) => mon.frameState({ mode, marks: [0.5, 9, Number.NaN] }, t, b, d, CURVES) })),
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

test('curves data: the article figure arrays, and the 9 / 15 wall', () => {
  for (const k of ['CONTROL', 'TAKEOFF', 'LATE', 'FLAT'] as const) assert.equal(CURVES[k].length, 32);
  assert.equal(CURVES.CONTROL[7], 0.053);
  assert.equal(CURVES.CONTROL[10], 0);
  assert.equal(CURVES.TAKEOFF[31], 0.483);
  assert.ok(CURVES.FLAT.every((v) => v >= 1.378 && v <= 1.419));
  const cells = CURVES.wall.flat();
  assert.equal(cells.length, 15);
  assert.equal(cells.filter((c) => c.learned).length, 9);
  // Every learned cell's trace leaves chance; every flat one never does (running-min calib CE).
  for (const c of cells) assert.equal(mon.breakEpoch(c.trace) !== null, c.learned, `seed ${c.seed} split ${c.split}`);
});

test('LossMonitor: the hook starts flat and ends with two pulses and one flatline', () => {
  const beats = [0.1, 2.4];
  const first = mon.frameState({ mode: 'seeds3' }, 0, beats, 5.5, CURVES);
  assert.ok(first.columns.every((c) => c.upto >= 1 && c.lit === 0 && c.rose === 0), 'flat and visible at frame 0');
  const end = mon.frameState({ mode: 'seeds3' }, 5.5, beats, 5.5, CURVES);
  assert.deepEqual(end.columns.map((c) => c.lit > 0.99), [true, true, false]);
  assert.deepEqual(end.columns.map((c) => c.rose), [0, 0, 1]);
});

test('LossMonitor: official recipe stops at epoch 4; control is learned by 8 and the dots stay grey', () => {
  const off = mon.frameState({ mode: 'official' }, 6, [0.1, 2.5], 6, CURVES);
  assert.equal(off.traces[0].upto, 4);
  assert.equal(off.cut.opacity, 1);
  const ctl = mon.frameState({ mode: 'control' }, 3.6, [0.1, 3.9], 6.5, CURVES);
  assert.ok(ctl.traces[0].upto >= 8 && ctl.traces[0].upto <= 11, `control upto ${ctl.traces[0].upto}`);
  assert.ok(ctl.traces[1].lit < 0.1, `dots lit ${ctl.traces[1].lit}`);
});

test('LossMonitor: curves land on 10, 22 and 32 at their marks', () => {
  const marks = [1.2, 2.4, 3.6];
  const s = (t: number) => mon.frameState({ mode: 'curves', marks }, t, [0.1], 5, CURVES);
  assert.equal(s(1.2).traces[0].upto, 10);
  assert.equal(s(2.4).traces[1].upto, 22);
  assert.equal(s(3.6).traces[2].upto, 32);
  assert.equal(s(5).traces[2].rose, 1);
  assert.deepEqual(s(5).markers.map((m) => m.text), ['10', '22', '32']);
});

test('LossMonitor: the wall ends 9 teal, 6 rose', () => {
  const s = mon.frameState({ mode: 'wall' }, 6, [0.1], 6, CURVES);
  assert.equal(s.cells.filter((c) => c.lit === 1).length, 9);
  assert.equal(s.cells.filter((c) => c.rose === 1).length, 6);
  assert.equal(s.tally.learned, 9);
  assert.equal(s.tally.flat, 6);
});

test('SnapshotDeck: Laya reads 1 -> 8, then the shuffle is 5, 2, 8, 1 and the rows grow', () => {
  const end = deck.frameState({ mode: 'laya' }, 7, [0.1, 2.6], 7);
  assert.deepEqual(deck.PERM.slice(0, 4).map((k) => k + 1), [5, 2, 8, 1]);
  assert.ok(end.cards.every((c) => c.move === 1));
  assert.deepEqual(end.rows.map((r) => r.grow), [1, 1, 1]);
  assert.deepEqual(deck.ROWS.map((r) => r.drop), [8, 10, 12]);
  const c = deck.frameState({ mode: 'company' }, 7, [0.1, 3.2], 7);
  assert.equal(c.company.laya.hop, 1);
  assert.equal(c.frontier.filter((f) => f.zero === 1).length, 4);
});
