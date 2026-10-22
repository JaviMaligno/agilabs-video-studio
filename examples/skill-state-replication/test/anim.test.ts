import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as counter from '../src/anim/Counter.state.ts';
import * as bars from '../src/anim/BarCompare.state.ts';
import * as flow from '../src/anim/FlowDiagram.state.ts';
import * as quote from '../src/anim/KeyQuote.state.ts';
import * as grid from '../src/anim/StatGrid.state.ts';
import * as svn from '../src/anim/ScrollVsNotepad.state.ts';
import * as bill from '../src/anim/CacheBill.state.ts';
import * as hz from '../src/anim/HorizonLines.state.ts';
import * as cg from '../src/anim/CorrectionGrid.state.ts';
import * as bvs from '../src/anim/BeliefVsShelf.state.ts';
import * as card from '../src/anim/QuestionCard.state.ts';
import fs from 'node:fs';

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
  ...svn.MODES.flatMap((mode) => [
    { name: `ScrollVsNotepad ${mode}`, state: (t: number, b: number[], d: number) => svn.frameState({ mode, marks: [0.6, 1.2, 2.0, 2.6, 3.1, 3.6] }, t, b, d) },
    { name: `ScrollVsNotepad ${mode} (no marks)`, state: (t: number, b: number[], d: number) => svn.frameState({ mode }, t, b, d) },
  ]),
  ...(['bill', 'order'] as const).flatMap((mode) => [
    { name: `CacheBill ${mode}`, state: (t: number, b: number[], d: number) => bill.frameState({ mode, marks: [0.4, 0.9, 1.5, 2.0, 2.6, 3.0] }, t, b, d) },
    { name: `CacheBill ${mode} (no marks)`, state: (t: number, b: number[], d: number) => bill.frameState({ mode }, t, b, d) },
  ]),
  ...(['claude', 'gemini'] as const).flatMap((mode) => [
    { name: `HorizonLines ${mode}`, state: (t: number, b: number[], d: number) => hz.frameState({ mode, marks: [0.4, 1.2, 2.0, 2.8] }, t, b, d) },
    { name: `HorizonLines ${mode} (no marks)`, state: (t: number, b: number[], d: number) => hz.frameState({ mode }, t, b, d) },
  ]),
  { name: 'CorrectionGrid', state: (t, b, d) => cg.frameState({ marks: [0.5, 1.2, 2.2, 2.9] }, t, b, d) },
  { name: 'CorrectionGrid (no marks)', state: (t, b, d) => cg.frameState({}, t, b, d) },
  ...(['rank', 'drift', 'slip', 'check'] as const).flatMap((mode) => [
    { name: `BeliefVsShelf ${mode}`, state: (t: number, b: number[], d: number) => bvs.frameState({ mode, marks: [0.4, 0.9, 1.5, 2.0, 2.6, 3.2] }, t, b, d) },
    { name: `BeliefVsShelf ${mode} (no marks)`, state: (t: number, b: number[], d: number) => bvs.frameState({ mode }, t, b, d) },
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

// ── This video's bespoke components ────────────────────────────────────────────────────────────

test('ScrollVsNotepad: the hook shows ≠ only on "misremembering"; the scroll runs to step 50', () => {
  const marks = [1.2, 3.5, 4.9];
  assert.equal(svn.frameState({ mode: 'hook', marks }, 4.8, [0.4], 6.7).hook.neq, 0);
  assert.equal(svn.frameState({ mode: 'hook', marks }, 6.7, [0.4], 6.7).hook.neq, 1);
  assert.equal(svn.frameState({ mode: 'hook', marks }, 6.7, [0.4], 6.7).notepad.lines[0].text, 'shelf 3: lot B2');
  const end = svn.frameState({ mode: 'scroll', marks: [1.4, 4.6] }, 5.8, [0.3], 5.8);
  assert.equal(end.scroll.counter.value, 50);
  assert.equal(Math.floor(end.scroll.steps), 50);
  // Nothing is erased: the step count only grows.
  const steps = [1, 2, 3, 4, 5].map((t) => svn.frameState({ mode: 'scroll', marks: [1.4, 4.6] }, t, [0.3], 5.8).scroll.steps);
  for (let i = 1; i < steps.length; i++) assert.ok(steps[i] >= steps[i - 1]);
});

test('ScrollVsNotepad: consecutive story modes start where the previous one ends (no jump in the blend)', () => {
  const at = (mode: svn.SvnMode, t: number) => svn.frameState({ mode }, t, [0.3], 6);
  // scroll -> notepad: the scroll is wide with 50 steps at both ends of the cut.
  const a = at('scroll', 6).scroll;
  const b = at('notepad', 0).scroll;
  assert.deepEqual([a.x, a.w, Math.floor(a.steps)], [b.x, b.w, Math.floor(b.steps)]);
  // notepad -> promises: scroll parked left, notepad in place with shelf 6 rewritten.
  const c = at('notepad', 6);
  const d = at('promises', 0);
  assert.deepEqual([c.scroll.x, c.scroll.w, c.notepad.x, c.notepad.y], [d.scroll.x, d.scroll.w, d.notepad.x, d.notepad.y]);
  assert.equal(c.notepad.lines[1].write, 1);
  assert.equal(d.notepad.lines[1].next, 'shelf 6: empty');
  // promises -> warehouse: the stamp is still on at the cut.
  assert.equal(at('promises', 6).promises.stamp, 1);
  assert.equal(at('warehouse', 0).promises.stamp, 1);
  // insurance -> verdict: the notepad starts where it was.
  const i = at('insurance', 6).notepad;
  const v = at('verdict', 0).notepad;
  assert.deepEqual([i.x, i.y], [v.x, v.y]);
});

test('ScrollVsNotepad: the correction keeps both lines on the scroll and rewrites one value on the notepad', () => {
  const marks = [1.8, 3.6, 5.0, 7.2, 8.0, 9.5];
  const before = svn.frameState({ mode: 'correction', marks }, 4.5, [0.3, 5.8], 12.2);
  assert.equal(before.scroll.list?.length, svn.CORRECTION_LINES.length - 1);
  assert.equal(before.notepad.lines[3].strike, 0);
  const end = svn.frameState({ mode: 'correction', marks }, 12.2, [0.3, 5.8], 12.2);
  assert.deepEqual(end.scroll.list, svn.CORRECTION_LINES);
  assert.match(end.scroll.list![0], /filed pallet → shelf 12/);
  assert.match(end.scroll.list!.at(-1)!, /never put away · shelf 12 empty/);
  assert.equal(end.notepad.lines[3].text, 'shelf 12: lot E5');
  assert.equal(end.notepad.lines[3].next, 'shelf 12: empty');
  assert.equal(end.notepad.lines[3].strike, 1);
  assert.equal(end.notepad.lines[3].write, 1);
  assert.equal(end.notepad.lines.length, 4);
  assert.equal(end.rack.slots.find((x) => x.shelf === 12)!.pallet, 0);
  assert.equal(end.scroll.connector.opacity, 1);
});

test('ScrollVsNotepad: the verdict stamps land on their words', () => {
  const marks = [1.2, 2.0, 3.96, 4.9, 5.9];
  const pre = svn.frameState({ mode: 'verdict', marks }, 3.8, [0.4], 8.4).verdict;
  assert.equal(pre.forget, 0);
  assert.equal(pre.mis, 0);
  const end = svn.frameState({ mode: 'verdict', marks }, 8.4, [0.4], 8.4).verdict;
  assert.deepEqual([end.works, end.forget, end.some, end.mis], [1, 1, 1, 1]);
});

test('CacheBill: the article figures, and the bill lands after the tokens', () => {
  assert.deepEqual(bill.SIZES.map((x) => x.text), ['2,157', '16,437']);
  assert.deepEqual(bill.RATIO, { tokens: '7.5x', bill: '1.4x', order: '5.2x' });
  assert.deepEqual(bill.ORDER.map((x) => x.text), ['869k', '168k']);
  const marks = [0.6, 1.5, 3.9, 5.0, 6.0, 6.7];
  const mid = bill.frameState({ mode: 'bill', marks }, 2.5, [0.3, 3.4], 9);
  assert.equal(mid.tokens, 1);
  assert.equal(mid.bill, 0);
  const end = bill.frameState({ mode: 'bill', marks }, 9, [0.3, 3.4], 9);
  assert.deepEqual([end.tokens, end.bill, end.foot], [1, 1, 1]);
  const o = bill.frameState({ mode: 'order', marks: [0.9, 2.2, 3.4, 4.6] }, 8, [0.3, 4.3], 8);
  assert.equal(o.order.ratio, 1);
  assert.equal(o.billOut, 1);
});

test('HorizonLines: the labelled values are the articles\' figures; the chip swaps on "Gemini"', () => {
  assert.deepEqual(hz.CLAUDE.map((x) => x.label), ['notepad 1.00', 'transcript 0.99']);
  assert.deepEqual(hz.GEMINI.map((x) => x.label), ['notepad 1.000', 'transcript 0.913', 'paper: 0.74']);
  assert.deepEqual(hz.GEMINI.map((x) => x.values.at(-1)), [1, 0.913, 0.74]);
  const marks = [0.7, 2.3, 4.5, 5.5];
  assert.equal(hz.frameState({ mode: 'claude', marks }, 4.2, [0.3], 7.3).chip.swap, 0);
  assert.equal(hz.frameState({ mode: 'claude', marks }, 7.3, [0.3], 7.3).chip.swap, 1);
  const g = hz.frameState({ mode: 'gemini', marks: [1, 4, 4.5, 5.8] }, 8.5, [0.3, 3.8], 8.5);
  assert.deepEqual(g.series.map((x) => x.draw), [1, 1, 1]);
});

test('CorrectionGrid: 24·22·24 vs 1·9·0, totals 70 / 72 and 10 / 72', () => {
  const sum = (xs: readonly number[]) => xs.reduce((a, b) => a + b, 0);
  assert.equal(sum(cg.ARMS[0].counts), 70);
  assert.equal(sum(cg.ARMS[1].counts), 10);
  assert.deepEqual(cg.ARMS.map((a) => a.total), ['70 / 72', '10 / 72']);
  assert.equal(cg.MODELS.length * cg.PER, 72);
  const marks = [1.9, 3.5, 6.4, 7.5];
  const mid = cg.frameState({ marks }, 5.5, [0.3, 6.2], 9.9);
  assert.deepEqual(mid.blocks[0].rows.map((r) => r.cells), [24, 22, 24]);
  assert.deepEqual(mid.blocks[1].rows.map((r) => r.cells), [0, 0, 0]);
  const end = cg.frameState({ marks }, 9.9, [0.3, 6.2], 9.9);
  assert.deepEqual(end.blocks[1].rows.map((r) => r.cells), [1, 9, 0]);
  assert.equal(end.tag, 1);
});

test('BeliefVsShelf: Haiku ranking; the belief drifts at step 132; shipped at 137 and rejected', () => {
  assert.deepEqual(bvs.RANK.map((r) => r.text), ['0.999', '0.974', '0.958']);
  const pre = bvs.frameState({ mode: 'drift', marks: [0.3, 3.0, 4.3] }, 2.0, [0.2], 6);
  assert.ok(pre.step.value < 132);
  assert.ok(pre.match.every((x) => x.sym === '='));
  const end = bvs.frameState({ mode: 'drift', marks: [0.3, 3.0, 4.3] }, 6, [0.2], 6);
  assert.equal(end.step.value, 132);
  assert.equal(end.move, 1);
  assert.deepEqual(end.match.map((x) => x.sym), ['≠', '=', '=', '=', '=']);
  assert.equal(end.belief[0].lot, 'SKU-J');
  // The slip starts where the drift ended.
  const s0 = bvs.frameState({ mode: 'slip', marks: [0.6, 1.1, 2.6, 3.3, 5.0, 5.5] }, 0, [0.2], 7.7);
  assert.deepEqual([s0.step.value, s0.move, s0.belief[0].lot], [132, 1, 'SKU-J']);
  assert.equal(s0.rejected, 0);
  const s1 = bvs.frameState({ mode: 'slip', marks: [0.6, 1.1, 2.6, 3.3, 5.0, 5.5] }, 7.7, [0.2], 7.7);
  assert.equal(s1.step.value, 137);
  assert.equal(s1.rejected, 1);
  // The notepad line is not corrected after the rejection.
  assert.equal(s1.belief[0].lot, 'SKU-J');
  assert.equal(s1.belief[0].note, 'not corrected');
  const c = bvs.frameState({ mode: 'check', marks: [0.3, 1.2, 2.1, 3.0] }, 6.7, [0.2, 2.0], 6.7);
  assert.deepEqual(c.tiles, [1, 1]);
  assert.equal(c.schema, 1);
});

test('QuestionCard: a kicker splits off "Claude Haiku 4.5 · …"', () => {
  assert.deepEqual(card.splitQ('Claude Haiku 4.5 · Where does it break?'), { kicker: 'Claude Haiku 4.5', main: 'Where does it break?' });
  assert.deepEqual(card.splitQ('Cheaper?'), { kicker: '', main: 'Cheaper?' });
});

test('no superseded figure is drawn (3/44, 93/93, 18/82, 6.8%, 5.7x)', () => {
  const dir = new URL('../src/anim/', import.meta.url);
  const src = fs
    .readdirSync(dir)
    .filter((f) => /^(ScrollVsNotepad|CacheBill|HorizonLines|CorrectionGrid|BeliefVsShelf|world)/.test(f))
    .map((f) => fs.readFileSync(new URL(f, dir), 'utf8'))
    .join('\n');
  for (const bad of ['3/44', '44/44', '93/93', '93 of 93', '18/82', '6.8%', '39.5%', '5.7x', '$849', '$162']) assert.ok(!src.includes(bad), `found ${bad}`);
});
