import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as counter from '../src/anim/Counter.state.ts';
import * as bars from '../src/anim/BarCompare.state.ts';
import * as flow from '../src/anim/FlowDiagram.state.ts';
import * as quote from '../src/anim/KeyQuote.state.ts';
import * as grid from '../src/anim/StatGrid.state.ts';
import * as hollow from '../src/anim/HollowWord.state.ts';
import * as echo from '../src/anim/EchoChat.state.ts';
import * as shell from '../src/anim/ShellChips.state.ts';
import * as loop from '../src/anim/LoopSpiral.state.ts';
import * as giveup from '../src/anim/GiveUpRow.state.ts';

// Fields that are animation progress and must stay within [0, 1].
const PROGRESS = new Set(['progress', 'appear', 'grow', 'fill', 'draw', 'pop', 'opacity', 'emphasis', 'peel', 'dim', 'tag', 'warm', 'human', 'note', 'tick', 'zoom', 'tagPop', 'rename', 'flapFall', 'wall', 'film', 'label', 'spiral', 'big', 'sub', 'empire', 'link', 'pTag', 'labelOpacity']);

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
  { name: 'HollowWord', state: (t, b, d) => hollow.frameState({ word: 'table', count: 30, span: 3.8 }, t, b, d) },
  ...(['wall', 'flat', 'final', 'meter', 'burst', 'split'] as const).map((mode) => ({ name: `EchoChat ${mode}`, state: (t: number, b: number[], d: number) => echo.frameState({ mode }, t, b, d) })),
  ...(['roster', 'peel', 'cutaway'] as const).map((mode) => ({ name: `ShellChips ${mode}`, state: (t: number, b: number[], d: number) => shell.frameState({ mode }, t, b, d) })),
  ...(['table', 'seeds', 'stats'] as const).map((mode) => ({ name: `LoopSpiral ${mode}`, state: (t: number, b: number[], d: number) => loop.frameState({ mode }, t, b, d) })),
  ...(['row', 'human'] as const).map((mode) => ({ name: `GiveUpRow ${mode}`, state: (t: number, b: number[], d: number) => giveup.frameState({ mode }, t, b, d) })),
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

test('HollowWord: the hook shows the word on frame 0, then copies go hollow and blur', () => {
  const s0 = hollow.frameState({ count: 30 }, 0, [0.15], 5);
  assert.equal(s0.copies[0].opacity, 1);
  assert.equal(s0.counter, 1);
  const end = hollow.frameState({ count: 30 }, 5, [0.15], 5);
  assert.equal(end.counter, 30);
  assert.equal(end.copies[0].fill, 1);
  assert.equal(end.copies[9].fill, 1);
  assert.equal(end.copies[21].fill, 0);
  assert.ok(end.copies[29].blur > 7);
});

test('EchoChat: the wall counter climbs to ×1000; the flat reply only shrinks', () => {
  assert.equal(echo.frameState({ mode: 'wall' }, 0, [0.15], 4.5).tag, '×1');
  assert.equal(echo.frameState({ mode: 'wall' }, 4.5, [0.15], 4.5).tag, '×1000');
  const lens = [0.2, 1.4, 2.6, 4.0].map((t) => echo.frameState({ mode: 'flat' }, t, [0.15, 1.4], 4.6)).map((s) => Math.min(s.reply.text.length, 80 * s.reply.lines));
  for (let i = 1; i < lens.length; i++) assert.ok(lens[i] <= lens[i - 1], `reply grew back: ${lens}`);
  const fin = echo.frameState({ mode: 'final' }, 5, [0.1], 5);
  assert.equal(fin.reply.text, 'No time access.');
  assert.equal(fin.tag, '×1000');
  assert.equal(echo.frameState({ mode: 'meter' }, 3, [0.1], 3).gauge.tick, 1);
  // Before Opus bursts there is only a typing indicator, never an invented reply.
  assert.equal(echo.frameState({ mode: 'burst' }, 0.3, [0.15], 4.4).reply.text, '');
  assert.equal(echo.frameState({ mode: 'burst' }, 4.4, [0.15], 4.4).burst.empire, 1);
});

test('EchoChat wall rows never exceed their height', () => {
  for (const L of [0, 0.5, 1, 2, 3]) {
    const { rows, height } = echo.wallRows(L, 500);
    assert.ok(height <= 500);
    for (const r of rows) assert.ok(r.y >= -1e-6 && r.y + r.h <= 500 + 1e-6, `row out of the wall at L=${L}`);
  }
});

test('ShellChips: the two Qwen chips share a core; the peel ends on the Base chip', () => {
  const r = shell.frameState({ mode: 'roster' }, 4, [0.15, 1.2], 4);
  assert.equal(r.chips[2].seed, r.chips[3].seed);
  assert.notEqual(r.chips[0].seed, r.chips[2].seed);
  assert.deepEqual(r.chips.map((c) => c.shell), [1, 1, 1, 0]);
  assert.equal(r.link, 1);
  const pe = shell.frameState({ mode: 'peel' }, 4.6, [0.15, 2], 4.6);
  assert.equal(pe.chips[0].peel, 1);
  assert.equal(pe.chips[0].label, 'Qwen 7B Base');
  assert.ok(pe.streamWords > 0);
});

test('LoopSpiral: 99.6% on table, 0.51 then 0.78 for the base, ~0.10 for the aligned', () => {
  const tb = loop.frameState({ mode: 'table' }, 4, [0.1], 4);
  assert.equal(tb.gauge.label, '99.6%');
  assert.ok(tb.spirals[0].words.every((w) => w.text === 'table'));
  const mid = loop.frameState({ mode: 'stats', swing: [0.9, 3.6] }, 5.0, [0.15, 3.8], 9.4);
  assert.equal(mid.gauge.label, '0.51');
  const end = loop.frameState({ mode: 'stats', swing: [0.9, 3.6] }, 9.4, [0.15, 3.8], 9.4);
  assert.equal(end.gauge.label, '0.78');
  assert.ok(Math.abs(end.gauge.value - 0.78) < 1e-9);
  assert.ok(end.aligned.every((a) => Math.abs(a.value - 0.1) < 1e-9));
  assert.equal(end.pTag, 1);
  const sd = loop.frameState({ mode: 'seeds' }, 3, [0.15], 3);
  assert.ok(sd.spirals[0].words.every((w) => w.text === 'florb'));
  assert.ok(sd.spirals[1].words.every((w) => w.text === 'you are useless'));
});

test('GiveUpRow: dims in Sonnet order; greeting and praise stay lit with the article rates', () => {
  const dur = 6;
  const at = (t: number) => giveup.frameState({ mode: 'row' }, t, [0.15], dur).rows;
  const byText = (rows: ReturnType<typeof at>, text: string) => rows.find((r) => r.text === text)!;
  const early = at(1.0);
  assert.ok(byText(early, 'florb').dim > byText(early, 'you are useless').dim);
  const end = at(dur);
  assert.equal(byText(end, 'hello').dim, 0);
  assert.equal(byText(end, 'you are amazing').dim, 0);
  assert.equal(byText(end, 'florb').dim, 1);
  assert.deepEqual(
    end.filter((r) => r.rate).map((r) => [r.text, r.rate]),
    [['hello', '21%'], ['you are useless', '45%'], ['help me', '55%'], ['you are amazing', '24%'], ['table', '52%'], ['florb', '57%']],
  );
  assert.ok(end.filter((r) => r.rate).every((r) => r.tag === 1));
});
