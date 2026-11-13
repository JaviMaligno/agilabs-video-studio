import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as counter from '../src/anim/Counter.state.ts';
import * as bars from '../src/anim/BarCompare.state.ts';
import * as flow from '../src/anim/FlowDiagram.state.ts';
import * as quote from '../src/anim/KeyQuote.state.ts';
import * as grid from '../src/anim/StatGrid.state.ts';
import * as office from '../src/anim/MemoryOffice.state.ts';
import * as map from '../src/anim/MemoryMap.state.ts';
import * as warehouse from '../src/anim/WarehouseShelves.state.ts';
import * as head from '../src/anim/HeadShelf.state.ts';
import * as desk from '../src/anim/MemoryDesk.state.ts';
import * as cabinet from '../src/anim/FilingCabinet.state.ts';
import * as form from '../src/anim/ClipboardForm.state.ts';
import * as replay from '../src/anim/ReplayBars.state.ts';
import * as jobs from '../src/anim/TwoJobs.state.ts';
import * as restart from '../src/anim/RestartIterate.state.ts';
import * as reader from '../src/anim/AskReader.state.ts';
import * as replayFix from '../src/anim/CorrectionReplay.state.ts';

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
  // Bespoke: the memory-office world, every mode, with and without marks (and with a broken one).
  ...office.OFFICE_MODES.flatMap((mode) => [
    { name: `MemoryOffice ${mode}`, state: (t: number, b: number[], d: number) => office.frameState({ mode }, t, b, d) },
    { name: `MemoryOffice ${mode} (marks)`, state: (t: number, b: number[], d: number) => office.frameState({ mode, marks: [0.5, 1, Number.NaN, 2.5, 9] }, t, b, d) },
  ]),
  { name: 'MemoryMap', state: (t, b, d) => map.frameState({}, t, b, d) },
  { name: 'MemoryMap reveal', state: (t, b, d) => map.frameState({ mode: 'reveal' }, t, b, d) },
  { name: 'MemoryMap reveal (marks)', state: (t, b, d) => map.frameState({ mode: 'reveal', marks: [1, 2, 3, 4, 5, 6] }, t, b, d) },
  { name: 'MemoryMap (marks, one broken)', state: (t, b, d) => map.frameState({ marks: [0.9, Number.NaN, 4] }, t, b, d) },
  { name: 'MemoryMap (marks out of order)', state: (t, b, d) => map.frameState({ marks: [3, 1, 0.5] }, t, b, d) },
  ...warehouse.WAREHOUSE_MODES.flatMap((mode) => [
    { name: `WarehouseShelves ${mode}`, state: (t: number, b: number[], d: number) => warehouse.frameState({ mode }, t, b, d) },
    { name: `WarehouseShelves ${mode} (marks)`, state: (t: number, b: number[], d: number) => warehouse.frameState({ mode, marks: [3, 0.2] }, t, b, d) },
  ]),
  { name: 'HeadShelf', state: (t, b, d) => head.frameState({}, t, b, d) },
  { name: 'HeadShelf (marks out of order)', state: (t, b, d) => head.frameState({ marks: [2, 1, 3, 0.5, 0.1] }, t, b, d) },
  ...desk.DESK_MODES.flatMap((mode) => [
    { name: `MemoryDesk ${mode}`, state: (t: number, b: number[], d: number) => desk.frameState({ mode }, t, b, d) },
    { name: `MemoryDesk ${mode} (marks)`, state: (t: number, b: number[], d: number) => desk.frameState({ mode, marks: [1, 1, 1, 1, 1] }, t, b, d) },
  ]),
  ...cabinet.CABINET_MODES.flatMap((mode) => [
    { name: `FilingCabinet ${mode}`, state: (t: number, b: number[], d: number) => cabinet.frameState({ mode }, t, b, d) },
    { name: `FilingCabinet ${mode} (marks)`, state: (t: number, b: number[], d: number) => cabinet.frameState({ mode, marks: [0.4, 0.4, 0.5, 6] }, t, b, d) },
  ]),
  ...form.FORM_MODES.flatMap((mode) => [
    { name: `ClipboardForm ${mode}`, state: (t: number, b: number[], d: number) => form.frameState({ mode }, t, b, d) },
    { name: `ClipboardForm ${mode} (marks)`, state: (t: number, b: number[], d: number) => form.frameState({ mode, marks: [0.3, 0.3, 0.3, 0.3, 0.3] }, t, b, d) },
  ]),
  { name: 'ReplayBars', state: (t, b, d) => replay.frameState({}, t, b, d) },
  { name: 'ReplayBars (marks out of order, one broken)', state: (t, b, d) => replay.frameState({ marks: [3, 1, Number.NaN, 0.5, 0.2] }, t, b, d) },
  { name: 'TwoJobs', state: (t, b, d) => jobs.frameState({}, t, b, d) },
  { name: 'TwoJobs (marks out of order, one broken)', state: (t, b, d) => jobs.frameState({ marks: [4, 1, Number.NaN, 0.2, 0.1] }, t, b, d) },
  { name: 'RestartIterate', state: (t, b, d) => restart.frameState({}, t, b, d) },
  { name: 'RestartIterate (marks out of order, one broken)', state: (t, b, d) => restart.frameState({ marks: [5, 1, Number.NaN, 0.2, 9, 0.1] }, t, b, d) },
  { name: 'AskReader', state: (t, b, d) => reader.frameState({}, t, b, d) },
  { name: 'AskReader (marks out of order, one broken)', state: (t, b, d) => reader.frameState({ marks: [9, 1, Number.NaN, 0.2, 3, 0.1, 2, 8, 1, 0.5, 4, 0.3] }, t, b, d) },
  { name: 'CorrectionReplay', state: (t, b, d) => replayFix.frameState({}, t, b, d) },
  { name: 'CorrectionReplay (marks out of order, one broken)', state: (t, b, d) => replayFix.frameState({ marks: [5, 1, Number.NaN, 0.2, 9, 0.1, 2, 8, 1, 0.5] }, t, b, d) },
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

test('MemoryMap: five tiles named TRAINING, DESK, SUMMARY, NOTEBOOK, FORM', () => {
  assert.deepEqual(map.TILES.map((x) => x.label), ['TRAINING', 'DESK', 'SUMMARY', 'NOTEBOOK', 'FORM']);
  assert.equal(map.MAP_TITLE, 'How an AI agent forgets');
});

test('MemoryMap all: every tile and the title on screen from frame 0', () => {
  const s = map.frameState({}, 0, [0.2], 6);
  assert.deepEqual(s.opacity, [1, 1, 1, 1, 1]);
  assert.equal(s.title, 1);
  assert.ok(s.emphasis.every((e) => e === map.HOLD));
});

test('MemoryMap reveal: each tile is drawn on its mark and stays on; the title comes last', () => {
  const marks = [10, 11, 12, 13, 14, 16];
  const at = (t: number) => map.frameState({ mode: 'reveal', marks }, t, [0.2, 8, 16], 22);
  // Before the first name: only the empty frames, no tile, no title.
  const early = at(5);
  assert.ok(early.frames > 0.99);
  assert.deepEqual(early.opacity, [0, 0, 0, 0, 0]);
  assert.equal(early.title, 0);
  // Each tile appears on its own mark, after the previous one, and does not leave.
  for (let i = 0; i < 5; i++) {
    assert.equal(at(marks[i] - 0.3).opacity[i], 0, `tile ${i} before its mark`);
    assert.ok(at(marks[i] + 0.4).opacity[i] > 0.95, `tile ${i} after its mark`);
    if (i < 4) assert.equal(at(marks[i] + 0.4).opacity[i + 1], 0, `tile ${i + 1} waits`);
  }
  for (const t of [14.6, 18, 21.9]) assert.ok(at(t).opacity.every((o) => o > 0.99), `all on at ${t}`);
  // The pulse peaks on the name, then settles to the hold glow.
  assert.ok(at(10.3).emphasis[0] > 0.9);
  assert.ok(Math.abs(at(20).emphasis[0] - map.HOLD) < 1e-6);
  assert.equal(at(15.5).title, 0);
  assert.ok(at(17).title > 0.99);
  // Past the end: the finished map.
  const end = at(30);
  assert.deepEqual(end.opacity, [1, 1, 1, 1, 1]);
  assert.equal(end.title, 1);
});

test('MemoryMap reveal: marks out of order or missing never show a tile before the previous one', () => {
  const s = (t: number) => map.frameState({ mode: 'reveal', marks: [5, 3, Number.NaN, 4] }, t, [0.2, 2], 12);
  for (let t = 0; t < 12; t += 0.1) {
    const o = s(t).opacity;
    for (let i = 1; i < 5; i++) assert.ok(o[i] <= o[i - 1] + 1e-9, `tile ${i} ahead of ${i - 1} at ${t}`);
  }
  assert.deepEqual(s(12).opacity, [1, 1, 1, 1, 1]);
});

test('ReplayBars: the terminal bar rises and the general bars sink, then replay wins ~73% back', () => {
  const marks = [3, 6, 7.5, 10.5, 13];
  const at = (t: number) => replay.frameState({ marks }, t, [0.3, 10.3], 18);
  const start = at(0.5);
  assert.equal(start.bars.terminal, replay.TERMINAL.before);
  assert.deepEqual(start.bars.general, [...replay.GENERAL_BASE]);
  assert.equal(start.stream.old, 0);
  assert.equal(start.labelMix, 0);
  // After "worse": the terminal task learned, everything else sunk by its full drop.
  const sunk = at(10);
  assert.ok(Math.abs(sunk.bars.terminal - replay.TERMINAL.after) < 1e-9);
  sunk.bars.general.forEach((g, i) => assert.ok(Math.abs(g - (replay.GENERAL_BASE[i] - replay.GENERAL_DROP[i])) < 1e-9, `bar ${i} sunk`));
  assert.equal(sunk.labelWon, 0);
  // Old reading mixes in on "mixing"; the label's first half comes with it, the second on "won".
  assert.ok(at(11.5).stream.old > 0.99);
  assert.ok(at(11.5).labelMix > 0.99);
  assert.equal(at(12.9).labelWon, 0);
  // End: each bar has won back RECOVERED of its loss; the terminal task kept.
  const end = at(18);
  assert.ok(Math.abs(end.bars.terminal - replay.TERMINAL.after) < 1e-9);
  end.bars.general.forEach((g, i) => {
    const lost = replay.GENERAL_BASE[i] - g;
    assert.ok(Math.abs(lost - replay.GENERAL_DROP[i] * (1 - replay.RECOVERED)) < 1e-9, `bar ${i} recovered`);
  });
  assert.equal(end.labelWon, 1);
  assert.equal(replay.LABEL_MIX + ' ' + replay.LABEL_WON, '10% old reading → ~73% of the loss recovered');
});

test('TwoJobs: the plan is read and repeated, the arrow is drawn anyway, then the slip lands on the desk', () => {
  const marks = [6, 7.4, 9, 10.5, 16];
  const at = (t: number) => jobs.frameState({ marks }, t, [0.3, 12.9], 19);
  const early = at(1);
  assert.ok(early.plan.opacity > 0.99);
  assert.equal(early.plan.lit, 0);
  assert.equal(early.bubble.opacity, 0);
  assert.equal(early.arrow.draw, 0);
  assert.equal(early.desk, 0);
  assert.equal(early.slip.opacity, 0);
  // The bubble repeats the plan before the arrow is drawn.
  assert.ok(at(8.5).bubble.opacity > 0.99);
  assert.equal(at(8.5).arrow.draw, 0);
  assert.ok(at(10.2).arrow.draw > 0.99);
  assert.ok(at(11).arrow.tag > 0.99);
  // Line 1: everything clears for the desk; the slip is on it by "lands".
  const end = at(19);
  assert.equal(end.clear, 1);
  assert.equal(end.plan.opacity, 0);
  assert.equal(end.desk, 1);
  assert.equal(end.slip.drop, 1);
  assert.ok(at(16.5).slip.drop > 0.99);
  assert.ok(at(14).slip.drop < 0.9);
});

test('RestartIterate: sweep and patch on their words, bars 86% vs 69%, the swept thing vanishes on "throwing"', () => {
  const marks = [3, 5, 7, 10, 12, 14];
  const at = (t: number) => restart.frameState({ marks }, t, [0.3, 8.8], 18);
  assert.deepEqual(restart.BARS.map((b) => `${b.label} ${b.display}`), ['keep going 86%', 'start over 69%']);
  assert.equal(restart.BARS_CAPTION, 'share of tasks solved');
  const early = at(1);
  assert.equal(early.crack.sweep, 0);
  assert.equal(early.swept, 0);
  assert.equal(early.blocks, restart.BUILT);
  assert.equal(early.bars.opacity, 0);
  // "clear": the pages go; the thing stays until "throwing".
  assert.equal(at(7).swept, 1);
  assert.equal(at(13).gone, 0);
  // "keep": a block goes in and the crack closes.
  assert.equal(at(8.5).blocks, restart.BUILT + 1);
  assert.equal(at(8.5).crack.patch, 0);
  assert.equal(at(9).bars.opacity, 0);
  const end = at(18);
  assert.deepEqual(end.bars.grow, [1, 1]);
  assert.equal(end.blocks, restart.SLOTS);
  assert.equal(end.tick, 1);
  assert.equal(end.gone, 1);
});

test('AskReader: ask, read down to the slip, pass it to the desk, the figures, then the long day splits', () => {
  const marks = [4, 6, 8, 12, 16, 17.5, 18.5, 23, 26, 31, 32.5, 34.5];
  const at = (t: number) => reader.frameState({ marks }, t, [0.3, 11, 21.5], 38);
  assert.deepEqual(reader.TABLE_ROWS.map((r) => r.join(' ')), ['detail 10/11 3/8', 'correction 4/6 2/6']);
  assert.deepEqual(reader.TABLE_HEAD.slice(1), ['ask a reader', 'keyword search']);
  const early = at(2);
  assert.equal(early.bubble.opacity, 0);
  assert.equal(early.reader.opacity, 0);
  assert.equal(early.slip.opacity, 0);
  assert.equal(early.table.opacity, 0);
  // The scan runs down from the top and stops on the slip at "ran".
  assert.ok(at(9).scan.index > reader.SLIP_INDEX);
  assert.equal(at(16.5).scan.index, reader.SLIP_INDEX);
  assert.ok(at(16.6).stack.found > 0.9);
  // The slip reaches the desk, the table comes in after it.
  assert.equal(at(17).slip.fly, 0);
  assert.equal(at(19).slip.fly, 1);
  assert.equal(at(18).table.opacity, 0);
  assert.ok(at(20).table.rows.every((r) => r === 1));
  // The long day passes the reader's capacity before it splits.
  assert.equal(at(25).stack.pages, reader.PAGES);
  assert.ok(at(30.5).stack.pages > reader.CAPACITY);
  assert.equal(at(30.5).split, 0);
  const end = at(38);
  assert.equal(end.split, 1);
  assert.equal(end.reader.opacity, 0);
  assert.equal(end.card, 1);
  assert.equal(end.question, 1);
  assert.equal(end.slip.tick, 1);
  assert.equal(end.table.opacity, 1);
});

test('CorrectionReplay: 12/12 vs 3/12, the replay of the pallet leaving, then 12/12 vs 10/12', () => {
  const marks = [2.5, 4, 6, 9, 12, 14, 16, 19.5, 25, 26.5];
  const at = (t: number) => replayFix.frameState({ marks }, t, [1.3, 11.3, 24], 32);
  assert.equal(at(1).bars.opacity, 0);
  const before = at(10);
  assert.equal(before.bars.form, 1);
  assert.equal(before.bars.record, 1);
  assert.equal(before.bars.text, '3/12');
  assert.equal(before.bars.recordValue, replayFix.RECORD.before);
  assert.ok(before.question > 0.99);
  assert.equal(before.replay.opacity, 0);
  // Line 1: the pallet named on the slip leaves in the replay; the robot frowns after.
  assert.ok(at(15).slip.icon > 0.99);
  assert.ok(at(18).replay.leave > 0.9);
  assert.equal(at(18).robot.frown, 0);
  assert.ok(at(20.5).robot.frown > 0.99);
  assert.equal(at(20.5).bars.text, '3/12');
  // Line 2: the fixed message; the record redraws to 10/12, the form stays 12/12.
  const end = at(32);
  assert.equal(end.bars.text, '10/12');
  assert.equal(end.bars.recordValue, replayFix.RECORD.after);
  assert.equal(end.bars.form, 1);
  assert.equal(end.replay.opacity, 0);
  assert.equal(end.slip.icon, 0);
  assert.equal(end.slip.tick, 1);
  assert.equal(end.fixedTag, 1);
});
