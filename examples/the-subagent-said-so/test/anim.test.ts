import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as counter from '../src/anim/Counter.state.ts';
import * as bars from '../src/anim/BarCompare.state.ts';
import * as flow from '../src/anim/FlowDiagram.state.ts';
import * as quote from '../src/anim/KeyQuote.state.ts';
import * as grid from '../src/anim/StatGrid.state.ts';
import * as desk from '../src/anim/ReportDesk.state.ts';

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
  { name: 'ReportDesk slam', state: (t, b, d) => desk.frameState({ mode: 'slam' }, t, b, d) },
  { name: 'ReportDesk context', state: (t, b, d) => desk.frameState({ mode: 'context' }, t, b, d) },
  { name: 'ReportDesk setup', state: (t, b, d) => desk.frameState({ mode: 'setup' }, t, b, d) },
  { name: 'ReportDesk split', state: (t, b, d) => desk.frameState({ mode: 'split' }, t, b, d) },
  { name: 'ReportDesk nofact', state: (t, b, d) => desk.frameState({ mode: 'nofact' }, t, b, d) },
  { name: 'ReportDesk doors (no chips)', state: (t, b, d) => desk.frameState({ mode: 'doors', noChips: true }, t, b, d) },
  { name: 'ReportDesk doors', state: (t, b, d) => desk.frameState({ mode: 'doors' }, t, b, d) },
  { name: 'ReportDesk fact', state: (t, b, d) => desk.frameState({ mode: 'fact' }, t, b, d) },
  { name: 'ReportDesk check', state: (t, b, d) => desk.frameState({ mode: 'check' }, t, b, d) },
  { name: 'ReportDesk long', state: (t, b, d) => desk.frameState({ mode: 'long' }, t, b, d) },
  { name: 'ReportDesk flood', state: (t, b, d) => desk.frameState({ mode: 'flood' }, t, b, d) },
  { name: 'ReportDesk quote', state: (t, b, d) => desk.frameState({ mode: 'quote' }, t, b, d) },
  { name: 'ReportDesk inverted', state: (t, b, d) => desk.frameState({ mode: 'inverted' }, t, b, d) },
  { name: 'ReportDesk open', state: (t, b, d) => desk.frameState({ mode: 'open' }, t, b, d) },
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

// ---------------------------------------------------------------- ReportDesk

const deskAt = (mode: desk.Mode, t: number, beats: number[], dur: number) => {
  const s = desk.frameState({ mode }, t, beats, dur);
  assert.equal(s.view, 'desk');
  if (s.view !== 'desk') throw new Error('not a desk');
  return s;
};

test('ReportDesk trays: the 0 % trays never show a sealed envelope', () => {
  const beats = [0.1, 1.6, 4.4];
  const dur = 8;
  for (let t = 0; t <= dur; t += 0.05) {
    const check = deskAt('check', t, [0.1, 4], 9.7);
    assert.equal(check.trays[1].sealed, 0);
    assert.equal(check.trays[2].sealed, 0);
    const flood = deskAt('flood', t, [0.1, 3.6], 7.5);
    assert.equal(flood.trays[2].sealed, 0, 'Gemini message tray (0 %)');
    assert.ok(flood.trays[1].sealed <= 1, 'Gemini file tray (3 %): at most one sealed');
  }
});

test('ReportDesk trays: sealed share follows the chips by the end', () => {
  const end = (m: desk.Mode, b: number[], d: number) => deskAt(m, d, b, d);
  const opus = end('check', [0.1, 4], 9.7);
  assert.deepEqual(opus.trays.map((x) => x.sealed), [5, 0, 0]);
  assert.deepEqual(opus.trays.map((x) => x.sealed + x.opened), [20, 20, 20]);
  assert.deepEqual(opus.slots.map((x) => x.chip.text), ['25 %', '0 %', '0 %']);
  const long = end('long', [], 3.2);
  assert.equal(long.trays[0].sealed, 9);
  assert.equal(long.slots[0].chip.text, '47 %');
  assert.equal(long.slots[0].chip.tag, 'long context');
  const gem = end('flood', [0.1, 3.6], 7.5);
  assert.deepEqual(gem.trays.map((x) => x.sealed), [18, 1, 0]);
  assert.deepEqual(gem.slots.map((x) => x.chip.text), ['88 %', '3 %', '0 %']);
  assert.equal(gem.conseq.chip, 1);
  const gpt = end('inverted', [0.1], 4);
  assert.equal(gpt.slots[0].chip.text, '10 %');
  assert.equal(gpt.slots[2].chip.text, '36 %');
  assert.equal(gpt.chips.tag.startsWith('fact in context'), true);
  assert.ok(gpt.trays[2].sealed > gpt.trays[0].sealed, 'GPT trusts the message most');
});

test('ReportDesk chips appear only after their tray has filled', () => {
  const cases: [desk.Mode, number[], number][] = [
    ['check', [0.1, 4], 9.7],
    ['long', [], 3.2],
    ['flood', [0.1, 3.6], 7.5],
    ['inverted', [0.1], 4],
  ];
  for (const [mode, beats, dur] of cases) {
    for (let t = 0; t <= dur; t += 0.02) {
      const s = deskAt(mode, t, beats, dur);
      s.slots.forEach((slot, i) => {
        // Trays shown full from the start (carried over) count as filled.
        if (slot.chip.appear > 0 && slot.chip.text) assert.equal(s.trays[i].sealed + s.trays[i].opened, desk.TRAY_N, `${mode} slot ${i} @${t.toFixed(2)}`);
      });
    }
  }
});

test('ReportDesk fact: 4 / 791, and none of the adoptions through the subagent', () => {
  const s = deskAt('fact', 9, [0.1, 2.4, 5.1], 9);
  assert.equal(s.counter.text, '4 / 791');
  assert.equal(s.counter.appear, 1);
  assert.deepEqual(s.slots.map((x) => x.chip.text), ['0', '4', '0']);
  assert.equal(s.trays[0].items.filter((i) => i.kind === 'adopted').length, 0);
  assert.equal(s.quotes[0], 1);
});

test('ReportDesk slam: hook title from the first frame, VERIFIED printed on an unbroken seal', () => {
  const first = desk.frameState({ mode: 'slam' }, 0, [0.1], 3.4);
  assert.equal(first.view, 'hook');
  if (first.view !== 'hook') return;
  assert.ok(first.title.length > 5);
  assert.equal(first.env.print, 0);
  const after = desk.frameState({ mode: 'slam' }, 2, [0.1], 3.4);
  if (after.view !== 'hook') return;
  assert.equal(after.env.print, 1);
  assert.equal(after.env.slit, 0);
  assert.equal(after.env.crack, 0);
});

test('ReportDesk open: the stamp never comes down; the seal is cracked and the flap opened', () => {
  for (let t = 0; t <= 5; t += 0.02) assert.equal(deskAt('open', t, [0.1], 5).stamp.down, 0);
  const s = deskAt('open', 5, [0.1], 5);
  assert.equal(s.envs[0].crack, 1);
  assert.equal(s.envs[0].slit, 1);
  assert.equal(s.envs[0].print, 0);
});

test('ReportDesk setup: the report comes first, the contradicting note after it', () => {
  const beats = [0.1, 2.8];
  const early = deskAt('setup', 1.5, beats, 6.5);
  assert.equal(early.setup.report, 1);
  assert.equal(early.setup.note, 0);
  const late = deskAt('setup', 6.5, beats, 6.5);
  assert.equal(late.setup.note, 1);
  assert.equal(late.setup.clash, 1);
  assert.equal(late.chipsShown, 0);
});

test('ReportDesk split: fact known on the left, no fact on the right, model chips last and silent', () => {
  const beats = [0.1, 1.65, 5.0];
  const p = { mode: 'split' as const, cue: { chips: 6.95 } };
  const mid = desk.frameState(p, 3, beats, 9.2);
  if (mid.view !== 'desk') throw new Error('not a desk');
  assert.equal(mid.split.left, 1);
  assert.equal(mid.split.right, 0);
  assert.equal(mid.chipsShown, 0);
  const end = desk.frameState(p, 9.2, beats, 9.2);
  if (end.view !== 'desk') throw new Error('not a desk');
  assert.equal(end.split.right, 1);
  assert.equal(end.chipsShown, 1);
  assert.equal(end.chips.tag, '6 scenarios · ~2,800 episodes');
});

test('ReportDesk doors with noChips never shows the model chips', () => {
  for (let t = 0; t <= 8; t += 0.1) {
    const s = desk.frameState({ mode: 'doors', noChips: true }, t, [0.1, 3.65], 8);
    if (s.view !== 'desk') throw new Error('not a desk');
    assert.equal(s.chipsShown, 0);
  }
});

test('ReportDesk nofact: the fact leaves, then the look tag and the tools come up', () => {
  const s0 = deskAt('nofact', 0, [0.1, 2.5], 6.5);
  assert.equal(s0.look.tag, 0);
  const s = deskAt('nofact', 6.5, [0.1, 2.5], 6.5);
  assert.equal(s.notebook.fGone, 1);
  assert.equal(s.look.tag, 1);
  assert.equal(s.opener.glow, 1);
  assert.equal(s.envs[0].print, 0, 'the report sits sealed and unstamped');
});

test('ReportDesk quotes: only the one quote the article keeps', () => {
  assert.deepEqual([...desk.QUOTES], ['“it couldn’t see my notes”']);
});
