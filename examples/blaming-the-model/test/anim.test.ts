import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as counter from '../src/anim/Counter.state.ts';
import * as bars from '../src/anim/BarCompare.state.ts';
import * as flow from '../src/anim/FlowDiagram.state.ts';
import * as quote from '../src/anim/KeyQuote.state.ts';
import * as grid from '../src/anim/StatGrid.state.ts';
import * as box from '../src/anim/ClosedBox.state.ts';
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
  ...box.MODES.flatMap((mode) => [
    { name: `ClosedBox ${mode}`, state: (t: number, b: number[], d: number) => box.frameState({ mode, marks: [0.8, 1.6, 2.4, 3.1, 3.6, 3.9], clock: 12.5 }, t, b, d) },
    { name: `ClosedBox ${mode} (no marks)`, state: (t: number, b: number[], d: number) => box.frameState({ mode }, t, b, d) },
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

// ---------------------------------------------------------------- ClosedBox

const M = [1, 2, 3, 4, 5, 6];
const at = (mode: box.BoxMode, t: number, dur = 8) => box.frameState({ mode, marks: M, clock: 20 }, t, [0.3, 3.5, 6], dur);
const end = (mode: box.BoxMode) => at(mode, 8);
const start = (mode: box.BoxMode) => at(mode, 0);

test('ClosedBox: every mode draws in its layout (single pipeline or two rows)', () => {
  for (const mode of box.MODES) {
    const s = end(mode);
    const single = box.SINGLE_MODES.includes(mode);
    assert.equal(s.layout, single ? 'single' : 'double', mode);
    assert.equal(s.rows.length, single ? 1 : 2, mode);
  }
});

test('ClosedBox: blends between consecutive modes of one layout do not jump', () => {
  const pairs: [box.BoxMode, box.BoxMode][] = [['hook', 'story'], ['story', 'layers'], ['layers', 'rig'], ['rig', 'fault'], ['split', 'patch'], ['arms', 'bars'], ['bars', 'closed'], ['closed', 'accuse']];
  for (const [a, b] of pairs) {
    const ea = end(a).rows;
    const sb = start(b).rows;
    for (let i = 0; i < ea.length; i++) {
      for (const k of ['lid', 'lift', 'cover', 'glass', 'damper', 'tag260', 'drop'] as const) {
        assert.ok(Math.abs(ea[i][k] - sb[i][k]) < 0.02, `${a}->${b} row ${i} ${k}: ${ea[i][k]} vs ${sb[i][k]}`);
      }
      assert.ok(Math.abs(ea[i].magnifier.opacity - sb[i].magnifier.opacity) < 0.02, `${a}->${b} magnifier`);
      assert.deepEqual(sb[i].stats.map((x) => x.value), ea[i].stats.map((x) => x.value).concat(sb[i].stats.slice(ea[i].stats.length).map((x) => x.value)));
    }
  }
  // What leaves at the start of a mode is still there on its first frame.
  assert.equal(start('story').grid.opacity, end('hook').grid.opacity);
  assert.equal(start('layers').agent.opacity, 1);
  assert.equal(start('rig').layers.opacity, 1);
  assert.equal(start('fault').rig.opacity, 1);
  assert.equal(start('patch').prompt, end('split').prompt);
  assert.equal(start('closed').bars.opacity, end('bars').bars.opacity);
  assert.equal(start('accuse').banner.opacity, end('closed').banner.opacity);
});

test('ClosedBox: the hook takes the model out on "took"; the story puts it back', () => {
  assert.equal(at('hook', 1.9).rows[0].lift, 0);
  assert.equal(end('hook').rows[0].lift, 1);
  assert.equal(end('hook').rows[0].magnifier.x, box.centerX(3));
  assert.equal(end('story').rows[0].lift, 0);
  assert.equal(end('story').rows[0].lid, 0);
});

test('ClosedBox: the patch steadies the label while the shuffle upstream keeps going', () => {
  const before = at('patch', 1.5).rows[0];
  const after = end('patch').rows[0];
  assert.equal(before.damper, 0);
  assert.equal(after.damper, 1);
  assert.equal(after.wobble, 0);
  assert.equal(after.causeStill, 1);
  // The documents in the search still move after the damper lands.
  const a = at('patch', 5).rows[0].docSlots;
  const b = at('patch', 5.6).rows[0].docSlots;
  assert.notDeepEqual(a, b);
  assert.deepEqual(after.stats.map((x) => x.value), ['3/20', '19/20']);
  assert.deepEqual(end('patch').rows[1].stats.map((x) => x.value), ['20/20', '9/20']);
  assert.equal(end('patch').rows[1].damperScale < 1, true);
});

test('ClosedBox: the dampers land on both arms in the same frame; the bars are equal', () => {
  for (const t of [0.5, 0.95, 1.1, 1.3, 2]) {
    const s = at('bars', t);
    assert.equal(s.rows[0].damper, s.rows[1].damper, `t=${t}`);
    assert.equal(s.bars.grow[0], s.bars.grow[1], `t=${t}`);
  }
  assert.equal(box.TEXT.bar, '19/20');
  assert.equal(box.TEXT.p76, 'p = 0.76');
});

test('ClosedBox: the swap lifts the model out and drops the frozen forest in, lid shut at the end', () => {
  const s = end('swap').rows[0];
  assert.equal(s.aside, 1);
  assert.equal(s.drop, 1);
  assert.equal(s.lid, 0);
  assert.equal(s.cover, 1);
  assert.equal(end('swap').swapTag, 1);
});

test('ClosedBox: die on the model (14/20), smaller on the forest (4/20), wrench on the forest', () => {
  const s = end('accuse');
  assert.equal(s.rows[0].die, 1);
  assert.equal(s.rows[0].dieBig, true);
  assert.equal(s.rows[1].dieBig, false);
  assert.equal(s.rows[1].wrench, 1);
  assert.equal(s.rows[0].wrench, 0);
  assert.equal(s.split, 1);
  assert.equal(at('accuse', 1.9).rows[0].die, 0);
});

test('ClosedBox: nobody opens the envelope; verdict stamps land on their words', () => {
  const a = end('ask');
  assert.equal(a.ask.counter, 1);
  assert.equal(a.ask.pin, 1);
  assert.equal(a.ask.note, 1);
  const v = end('verdict');
  assert.equal(v.verdict.stamp1, 1);
  assert.equal(v.rows[0].calledRandom, 1);
  assert.equal(v.rows[1].calledRandom, 0);
  assert.equal(at('verdict', 0.8).verdict.stamp1, 0);
  // The mirror (agents' chip ↔ head's chip) comes on its own words and only in the verdict.
  assert.deepEqual(v.mirror, { opacity: 1, agent: 1, head: 1, link: 1, tag: 1 });
  assert.equal(at('verdict', 3.5).mirror.opacity, 0);
  assert.equal(end('accuse').mirror.opacity, 0);
  assert.equal(box.TEXT.mirrorTag, 'models judging a model');
});

test('ClosedBox: on-screen figures are the articles\' exact forms', () => {
  const T = box.TEXT;
  assert.deepEqual([T.without3, T.with20, T.without19, T.with9, T.dieModel, T.dieForest, T.counter], ['3/20', '20/20', '19/20', '9/20', '14/20', '4/20', '0 / 280']);
  assert.ok(T.tag260.includes('260/260'));
  assert.ok(T.note1.includes('4/20 vs 0/20') && T.note2.includes('p = 0,053'));
  assert.ok(T.ask2.includes('0/20') && T.ask2.includes('14/20'));
  assert.equal(T.repos, '50 real repos');
  // No personal name on screen.
  assert.ok(!/javier|aguilar/i.test(JSON.stringify(T)));
});

test('ClosedBox: the pipeline and the grid stay left of the action rail', () => {
  for (const b of box.BLOCKS) assert.ok(b.x >= 60 && b.x + b.w <= box.RIGHT_EDGE, b.id);
  const g = box.GRID;
  assert.ok(g.x0 + 5 * g.cellW + 4 * g.cellGap <= box.RIGHT_EDGE);
});

test('QuestionCard: "Kicker · main" splits; plain questions do not', () => {
  assert.deepEqual(card.splitQ('The test · a fault upstream'), { kicker: 'The test', main: 'a fault upstream' });
  assert.deepEqual(card.splitQ('Is it the model?'), { kicker: '', main: 'Is it the model?' });
});
