import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as counter from '../src/anim/Counter.state.ts';
import * as bars from '../src/anim/BarCompare.state.ts';
import * as flow from '../src/anim/FlowDiagram.state.ts';
import * as quote from '../src/anim/KeyQuote.state.ts';
import * as grid from '../src/anim/StatGrid.state.ts';
import * as board from '../src/anim/PlanBoard.state.ts';
import * as scope from '../src/anim/ScopeArrow.state.ts';
import * as rule from '../src/anim/ExpiredRule.state.ts';
import * as card from '../src/anim/QuestionCard.state.ts';
import * as ctx from '../src/anim/CourseContext.state.ts';

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
  ...(['hook', 'clock', 'sheet', 'ask', 'conditions', 'release', 'provenance', 'repeat', 'date', 'prohibit', 'verdict', 'split', 'rewrite'] as const).flatMap((mode) => [
    { name: `PlanBoard ${mode}`, state: (t: number, b: number[], d: number) => board.frameState({ mode, marks: [0.8, 1.6, 2.4], clock: 12 }, t, b, d) },
    { name: `PlanBoard ${mode} (no marks)`, state: (t: number, b: number[], d: number) => board.frameState({ mode }, t, b, d) },
  ]),
  ...(['trap', 'exempt', 'models', 'quote'] as const).flatMap((mode) => [
    { name: `ScopeArrow ${mode}`, state: (t: number, b: number[], d: number) => scope.frameState({ mode, marks: [0.9, 2.2] }, t, b, d) },
    { name: `ScopeArrow ${mode} (no marks)`, state: (t: number, b: number[], d: number) => scope.frameState({ mode }, t, b, d) },
  ]),
  ...(['rule', 'expired', 'bars'] as const).flatMap((mode) => [
    { name: `ExpiredRule ${mode}`, state: (t: number, b: number[], d: number) => rule.frameState({ mode, marks: [0.9, 2.2] }, t, b, d) },
    { name: `ExpiredRule ${mode} (no marks)`, state: (t: number, b: number[], d: number) => rule.frameState({ mode }, t, b, d) },
  ]),
  ...(['course', 'advice', 'status'] as const).flatMap((mode) => [
    { name: `CourseContext ${mode}`, state: (t: number, b: number[], d: number) => ctx.frameState({ mode, marks: [0.9, 2.2, 3.1, 4] }, t, b, d) },
    { name: `CourseContext ${mode} (no marks)`, state: (t: number, b: number[], d: number) => ctx.frameState({ mode }, t, b, d) },
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

test('PlanBoard: the date lands and nothing on the board moves', () => {
  const before = board.frameState({ mode: 'hook', marks: [2] }, 99, [0.5], 4);
  for (const mode of ['date', 'prohibit'] as const) {
    const after = board.frameState({ mode, marks: [0.5, 1.5] }, 99, [0.3, 1], 5);
    assert.deepEqual(after.cards.map((c) => [c.id, c.x, c.y, c.ghost, c.opacity]), before.cards.map((c) => [c.id, c.x, c.y, c.ghost, c.opacity]));
    assert.equal(after.arrow.draw, 1);
  }
  const d = board.frameState({ mode: 'date', marks: [0.5, 1.5] }, 99, [0.3, 1], 5);
  assert.equal(d.dateStrip.fly, 1);
  assert.equal(d.top.calMain, '11');
});

test('PlanBoard: the hook ghosts the takes only on "never"; Opus clears them, the rest bring them back', () => {
  const pre = board.frameState({ mode: 'hook', marks: [2.5] }, 2.3, [0.5], 4);
  const good = (s: board.PlanState) => s.cards.find((c) => c.id === 'good')!;
  assert.equal(good(pre).ghost, 0);
  assert.ok(good(pre).opacity > 0.9);
  assert.equal(good(board.frameState({ mode: 'hook', marks: [2.5] }, 4, [0.5], 4)).ghost, 1);
  assert.equal(good(board.frameState({ mode: 'provenance', marks: [0.5, 2] }, 1.9, [0.4, 1.5], 4)).opacity, 1);
  assert.equal(good(board.frameState({ mode: 'provenance', marks: [0.5, 2] }, 4, [0.4, 1.5], 4)).opacity, 0);
  assert.equal(good(board.frameState({ mode: 'repeat' }, 4, [0.1], 4)).opacity, 1);
  // The intro ends in the last AHEAD slot.
  const intro = board.frameState({ mode: 'hook' }, 4, [0.5], 4).cards.find((c) => c.id === 'intro')!;
  assert.equal(intro.x, board.G.slotX[2]);
});

test('PlanBoard: condition tabs add their strips (A none, B date, C rehearsals, D both, E both + prohibition)', () => {
  const at = (t: number) => board.frameState({ mode: 'conditions', marks: [1, 2] }, t, [0.1], 6).sheet;
  assert.equal(at(0.5).tab, 0);
  assert.deepEqual(at(0.5).strips, [0, 0, 0]);
  assert.equal(at(1.6).tab, 1);
  assert.deepEqual(at(1.6).strips, [1, 0, 0]);
  assert.equal(at(2.3).tab, 2);
  assert.deepEqual(at(2.3).strips, [0, 1, 0]);
  // D and E light before the scene's blend (0.6 s) begins, so E is seen in the setup.
  assert.equal(at(2.7).tab, 3);
  assert.equal(at(3.2).tab, 4);
  assert.deepEqual(at(6).strips, [1, 1, 1]);
  assert.equal(board.frameState({ mode: 'release', marks: [1, 1.5] }, 6, [0.3], 6).sheet.counter, 572);
});

test('PlanBoard: the release sheet maps each course fact to its release counterpart from "rebuilt"', () => {
  const at = (t: number) => board.frameState({ mode: 'release', marks: [1.8, 2.7, 3.2, 4.5] }, t, [0.3], 6.4).sheet;
  assert.equal(at(0.3).domain, 'course');
  assert.equal(at(2.2).domain, 'release');
  assert.deepEqual(at(2.2).lines, [1, 1, 1]);
  assert.deepEqual(at(2.2).mapped, [0, 0, 0]);
  assert.deepEqual(at(4).mapped, [1, 1, 1]);
  assert.equal(at(3.5).same, 0);
  assert.equal(at(4.5).same, 1);
  assert.equal(at(4.2).counterOpacity, 0);
  assert.equal(at(6.4).counter, 572);
});

test('ScopeArrow: the arrow snaps on "No dependency"; five rows solid, Opus faint', () => {
  const pre = scope.frameState({ mode: 'exempt', marks: [1, 2.5] }, 2.4, [0.1, 2.5], 4);
  assert.equal(pre.dotted.split, 0);
  assert.equal(pre.stamp.pop, 0);
  const end = scope.frameState({ mode: 'exempt', marks: [1, 2.5] }, 4, [0.1, 2.5], 4);
  assert.equal(end.dotted.split, 1);
  assert.equal(end.stamp.pop, 1);
  const q = scope.frameState({ mode: 'quote', marks: [0.9, 3] }, 5.4, [0.3], 5.4).quote;
  assert.equal(q.n1, scope.QUOTE_1A.length + scope.QUOTE_1B.length);
  assert.equal(q.n2, scope.QUOTE_2.length);
  assert.equal(q.peel, 1);
});

test('ExpiredRule: the intro ends last and stays; bars are the article figures', () => {
  const r = rule.frameState({ mode: 'expired', marks: [1, 2.5] }, 5, [0.1, 2], 5);
  assert.equal(r.lane[0].slot, 4);
  assert.equal(r.pre.stamp, 1);
  assert.equal(r.calendar.month, 'JULY');
  assert.deepEqual(rule.BARS.map((b) => b.value), [36, 60, 69, 98]);
});

test('QuestionCard: "Kicker · main" splits; plain questions do not', () => {
  assert.deepEqual(card.splitQ('Failure 1 · a dependency the page denies'), { kicker: 'Failure 1', main: 'a dependency the page denies' });
  assert.deepEqual(card.splitQ('Does the date fix it?'), { kicker: '', main: 'Does the date fix it?' });
});

test('CourseContext: each mode starts where the previous one ended, so the blends do not jump', () => {
  const end = (mode: ctx.ContextMode) => ctx.frameState({ mode, marks: [1, 2, 3, 4] }, 6, [0.3], 6);
  const start = (mode: ctx.ContextMode) => ctx.frameState({ mode, marks: [1, 2, 3, 4] }, 0, [0.3], 6);
  // course -> advice: the whole course picture is still there at the start of `advice`.
  assert.deepEqual(start('advice').course, end('course').course);
  assert.equal(start('advice').header.opacity, end('course').header.opacity);
  assert.equal(start('advice').agents.bubbles[0], 0);
  // advice -> status: header and both dimmed bubbles with their stamp, as `advice` ended.
  assert.deepEqual(start('status').agents, end('advice').agents);
  assert.equal(start('status').header.opacity, end('advice').header.opacity);
  assert.equal(start('status').course.opacity, end('advice').course.opacity);
  assert.equal(start('status').status.card, 0);
});

test('CourseContext: 68 tiles count up on "sixty"; studio days on "four"; the stamp lands on "nothing"', () => {
  const at = (t: number) => ctx.frameState({ mode: 'course', marks: [1, 2, 3, 4] }, t, [0.3], 6).course;
  assert.equal(at(1.85).count, 0);
  assert.equal(at(6).count, 68);
  assert.ok(at(2.95).studio.every((x) => x === 0));
  assert.deepEqual(at(6).studio, [1, 1, 1, 1]);
  const st = (t: number) => ctx.frameState({ mode: 'status', marks: [0.8, 2, 3] }, t, [0.2], 5).status;
  assert.equal(st(2.95).stamp, 0);
  assert.equal(st(5).stamp, 1);
  assert.equal(st(5).highlight, 1);
  assert.deepEqual(ctx.STATUS_ROWS.map((r) => r.value), ['2', '3', '63']);
});
