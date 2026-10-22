import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as counter from '../src/anim/Counter.state.ts';
import * as bars from '../src/anim/BarCompare.state.ts';
import * as flow from '../src/anim/FlowDiagram.state.ts';
import * as quote from '../src/anim/KeyQuote.state.ts';
import * as grid from '../src/anim/StatGrid.state.ts';
import * as shelf from '../src/anim/OwnerShelf.state.ts';
import * as team from '../src/anim/TeamChannel.state.ts';
import * as look from '../src/anim/LookMatrix.state.ts';
import * as who from '../src/anim/WhoAnswers.state.ts';

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

const SHELF_MODES: shelf.Mode[] = ['hook', 'story', 'question', 'load', 'arms', 'quote', 'run', 'close'];
const TEAM_MODES: team.Mode[] = ['corpus', 'bars', 'shape'];

const CASES: Case[] = [
  ...SHELF_MODES.map((mode) => ({ name: `OwnerShelf ${mode}`, state: (t: number, b: number[], d: number) => shelf.frameState({ mode }, t, b, d) })),
  ...TEAM_MODES.map((mode) => ({ name: `TeamChannel ${mode}`, state: (t: number, b: number[], d: number) => team.frameState({ mode }, t, b, d) })),
  { name: 'LookMatrix look', state: (t, b, d) => look.frameState({ mode: 'look' }, t, b, d) },
  { name: 'LookMatrix adjacent', state: (t, b, d) => look.frameState({ mode: 'adjacent' }, t, b, d) },
  { name: 'WhoAnswers', state: (t, b, d) => who.frameState({}, t, b, d) },
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

// ---------------------------------------------------------------- this video's components

test('OwnerShelf hook: the chip walks to the box and the lid opens on old code; the "who" tag lands on line 2', () => {
  const beats = [0.15, 3.78];
  const s0 = shelf.frameState({ mode: 'hook' }, 0, beats, 7);
  assert.equal(s0.view, 'hook');
  if (s0.view !== 'hook') return;
  assert.equal(s0.walk, 0);
  assert.equal(s0.lid, 0);
  assert.equal(s0.keyTag, 0);
  // The hook title is on screen from the first frame (its words light as they are spoken).
  assert.equal(s0.title.map((w) => w.text).join(' '), shelf.HOOK_TITLE);
  const mid = shelf.frameState({ mode: 'hook' }, 3.7, beats, 7);
  if (mid.view !== 'hook') return;
  assert.equal(mid.walk, 1);
  assert.equal(mid.rise, 1);
  assert.equal(mid.keyTag, 0, 'the tag waits for its own line');
  const end = shelf.frameState({ mode: 'hook' }, 7, beats, 7);
  if (end.view !== 'hook') return;
  assert.equal(end.keyTag, 1);
  assert.equal(end.sweep, 1);
});

test('OwnerShelf story: one step per line, the box closed again on line 4 and the work piled on', () => {
  const beats = [0.2, 6.39, 10.18, 15.41];
  const at = (t: number) => {
    const s = shelf.frameState({ mode: 'story' }, t, beats, 22);
    assert.equal(s.view, 'story');
    return s as shelf.StoryState;
  };
  assert.deepEqual(at(0.1).lines, [0, 0, 0, 0]);
  const l1 = at(6.2);
  assert.deepEqual(l1.lines, [1, 1, 1, 1]);
  assert.equal(l1.stamp, 1);
  assert.equal(l1.crack, 0);
  const l2 = at(10);
  assert.equal(l2.crack, 1);
  assert.equal(l2.rise, 1);
  assert.equal(l2.consumer, 0);
  const l3 = at(15.2);
  assert.equal(l3.got, 1);
  const end = at(22);
  assert.equal(end.lid, 0, 'nobody looks: the box is shut at the end');
  assert.deepEqual(end.pile, [1, 1, 1, 1]);
  assert.equal(end.inbox, 1);
  assert.equal(end.path, 1);
});

test('OwnerShelf quote: the paragraph is verbatim, with "you own" and "nobody" emphasised', () => {
  const s = shelf.frameState({ mode: 'quote' }, 99, [0.2, 4.31, 6.74], 10.5);
  assert.equal(s.view, 'quote');
  if (s.view !== 'quote') return;
  assert.equal(s.words.map((w) => w.text).join(' '), shelf.PARAGRAPH);
  assert.ok(shelf.PARAGRAPH.startsWith('On this release you own the published state: nobody is going to verify it behind you.'));
  assert.deepEqual(
    s.words.filter((w) => w.emphasis).map((w) => w.text),
    ['you', 'own', 'nobody'],
  );
  assert.ok(s.words.every((w) => w.opacity === 1));
  assert.deepEqual(s.struck.map((c) => c.strike), [1, 1, 1]);
  assert.equal(s.who, 1);
  // The whole paragraph is on screen within ~2 s of the line starting: long enough to read.
  const early = shelf.frameState({ mode: 'quote' }, 2.3, [0.2, 4.31, 6.74], 10.5);
  if (early.view === 'quote') assert.ok(early.words.every((w) => w.opacity === 1));
});

test('OwnerShelf run: the article\'s numbers, 8 of 15 without an owner and 15 of 15 with one', () => {
  assert.equal(shelf.RESULT.without.display, '8/15 = 53 %');
  assert.equal(shelf.RESULT.with.display, '15/15 = 100 %');
  assert.equal(shelf.RESULT.stats, 'p = 0.0063 · 95% CI [27–79 %] vs [78–100 %]');
  const beats = [0.15, 4.26, 6.61];
  const end = shelf.frameState({ mode: 'run' }, 99, beats, 11);
  assert.equal(end.view, 'run');
  if (end.view !== 'run') return;
  assert.equal(end.leftCount, 8);
  assert.equal(end.rightCount, 15);
  assert.equal(end.left.filter((r) => r.outcome === 'tag').length, 7);
  assert.deepEqual([end.barLeft, end.barRight, end.stats, end.note], [1, 1, 1, 1]);
  // The left bar grows on line 1, the right one only on line 2.
  const l1 = shelf.frameState({ mode: 'run' }, 4.1, beats, 11);
  if (l1.view === 'run') {
    assert.equal(l1.barLeft, 1);
    assert.equal(l1.barRight, 0);
    assert.equal(l1.rightCount, 0);
  }
});

test('OwnerShelf question and close: the question band and the closing line', () => {
  const q = shelf.frameState({ mode: 'question' }, 99, [0.15], 4);
  if (q.view === 'question') assert.deepEqual([q.band, q.key, q.dim], [1, 1, 1]);
  assert.equal(shelf.QUESTION, 'Does naming an owner make agents check?');
  const c0 = shelf.frameState({ mode: 'close' }, 2.0, [0.2, 3.51], 8);
  if (c0.view === 'close') {
    assert.equal(c0.peel, 0);
    assert.ok(c0.report > 0.9);
    assert.ok(c0.words.every((w) => w.opacity === 0));
  }
  const c = shelf.frameState({ mode: 'close' }, 99, [0.2, 3.51], 8);
  if (c.view === 'close') {
    assert.equal(c.words.map((w) => w.text).join(' '), shelf.CLOSE_LINE);
    assert.deepEqual(c.words.filter((w) => w.key).map((w) => w.text), ['belong', 'to', 'somebody.']);
    assert.deepEqual([c.peel, c.tag, c.foot, c.report], [1, 1, 1, 0]);
  }
});

test('TeamChannel: 196 counted up, the delegation shares and the follow-through figures as written', () => {
  const c = team.frameState({ mode: 'corpus' }, 99, [0.2], 7);
  if (c.view === 'corpus') {
    assert.equal(c.count, 196);
    assert.equal(c.sub, 1);
  }
  const c0 = team.frameState({ mode: 'corpus' }, 0.5, [0.2], 7);
  if (c0.view === 'corpus') assert.equal(c0.count, 0);
  const b = team.frameState({ mode: 'bars' }, 99, [0.15, 4.66], 8);
  if (b.view === 'bars') {
    assert.deepEqual(b.bars.map((x) => x.display), ['37.2 %', '8.9 %']);
    assert.ok(b.bars.every((x) => x.grow === 1));
  }
  const b1 = team.frameState({ mode: 'bars' }, 4.5, [0.15, 4.66], 8);
  if (b1.view === 'bars') assert.deepEqual(b1.bars.map((x) => x.grow), [1, 0]);
  assert.deepEqual(team.SHAPE.tiles.map((x) => x.value), ['74–83 %', '3 of 70']);
  assert.equal(team.SHAPE.requests, '71 requests');
  const s = team.frameState({ mode: 'shape' }, 99, [0.15, 2.34], 8);
  if (s.view === 'shape') assert.deepEqual([s.crack, s.claim, s.stamp], [1, 1, 1]);
});

test('LookMatrix: 23 opened and caught, 7 neither, nobody off the diagonal; links to most, not all, of the misses', () => {
  const cells = Array.from({ length: look.N }, (_, i) => look.cellOf(i));
  const count = (col: number, row: number) => cells.filter((c) => c.col === col && c.row === row).length;
  assert.deepEqual([count(0, 0), count(1, 1), count(0, 1), count(1, 0)], [23, 7, 0, 0]);
  // The owner-named arm: all 15 opened the registry and caught it.
  assert.ok(cells.slice(0, look.PER_ARM).every((c) => c.col === 0 && c.row === 0));
  const beats = [0.15, 3.22, 5.09, 7.2];
  const end = look.frameState({ mode: 'look' }, 99, beats, 10.8);
  assert.deepEqual(end.zeros, [1, 1]);
  assert.equal(end.banner, 1);
  assert.ok(end.dots.every((d) => d.fall === 1));
  const l3 = look.frameState({ mode: 'look' }, 5.0, beats, 10.8);
  assert.deepEqual(l3.zeros, [0, 0], 'each 0 waits for its own sentence');
  assert.ok(look.TAG_LINKS < 7, '"most" failures checked the tag, not all');
  const adj = look.frameState({ mode: 'adjacent' }, 99, [0.15], 6.4);
  assert.deepEqual([adj.chip, adj.links, adj.cut, adj.nothing, adj.banner], [1, 1, 1, 1, 0]);
});

test('WhoAnswers: the lead at 0 %, the owner at 15/15, then the two verdicts in order', () => {
  assert.equal(who.LEAD.figure, '0 %');
  assert.equal(who.OWNER.figure, '15/15');
  const beats = [0.2, 4.23, 6.9, 10.29, 13.2];
  const s3 = who.frameState({}, 10.2, beats, 17);
  assert.equal(s3.owner, 1);
  assert.equal(s3.works, 0);
  const s4 = who.frameState({}, 13.1, beats, 17);
  assert.equal(s4.works, 1);
  assert.equal(s4.fails, 0);
  const end = who.frameState({}, 17, beats, 17);
  assert.deepEqual([end.lead, end.patch, end.owner, end.works, end.fails, end.note], [1, 1, 1, 1, 1, 1]);
});
