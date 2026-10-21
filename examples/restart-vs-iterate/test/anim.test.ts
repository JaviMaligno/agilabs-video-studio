import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as counter from '../src/anim/Counter.state.ts';
import * as bars from '../src/anim/BarCompare.state.ts';
import * as flow from '../src/anim/FlowDiagram.state.ts';
import * as quote from '../src/anim/KeyQuote.state.ts';
import * as grid from '../src/anim/StatGrid.state.ts';
import * as tower from '../src/anim/CodeTower.state.ts';
import * as split from '../src/anim/ScalpelVsWreckingBall.state.ts';
import * as verdict from '../src/anim/VerdictCard.state.ts';
import * as blocks from '../src/anim/tower.state.ts';
import * as card from '../src/anim/QuestionCard.state.ts';
import { resolveMark } from '../src/marks.ts';

// Fields that are animation progress and must stay within [0, 1].
const PROGRESS = new Set([
  'progress', 'appear', 'grow', 'fill', 'draw', 'pop', 'opacity', 'emphasis',
  // restart-vs-iterate components
  'rose', 'teal', 'presence', 'active', 'end', 'ring', 'dot', 'dotOpacity', 'card', 'cardOpacity', 'tag', 'label', 'budget', 'gaps',
  'bracket', 'shrink', 'foot', 'weakFoot', 'press', 'pulse', 'dialPop', 'words', 'credit', 'fly', 'header', 'readout', 'stamp', 'lost',
  'sub', 'score', 'solved', 'slide', 'ticks', 'strong', 'weak', 'pips', 'coins', 'nodes', 'rows', 'labels', 'textIn',
]);

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

const TOWER_CASES: tower.CodeTowerProps[] = [
  { mode: 'hook' },
  { mode: 'quote' },
  { mode: 'loop' },
  { mode: 'rules' },
  { mode: 'lanes', lane: 1 },
  { mode: 'lanes', lane: 2 },
  { mode: 'lanes', lane: 3 },
  { mode: 'bars', step: 1 },
  { mode: 'bars', step: 2 },
  { mode: 'bars', step: 3 },
  { mode: 'bars', step: 4 },
];
const SPLIT_MODES = ['setup', 'strong', 'strongPay', 'weak', 'weakPay'] as const;
const MARKS = [0.5, 9, Number.NaN, 2, 1.1];

const CASES: Case[] = [
  ...TOWER_CASES.map((p) => ({ name: `CodeTower ${p.mode} ${p.lane ?? p.step ?? ''}`, state: (t: number, b: number[], d: number) => tower.frameState(p, t, b, d) })),
  ...TOWER_CASES.map((p) => ({ name: `CodeTower ${p.mode} ${p.lane ?? p.step ?? ''} (marks)`, state: (t: number, b: number[], d: number) => tower.frameState({ ...p, marks: MARKS }, t, b, d) })),
  ...SPLIT_MODES.map((mode) => ({ name: `ScalpelVsWreckingBall ${mode}`, state: (t: number, b: number[], d: number) => split.frameState({ mode }, t, b, d) })),
  ...SPLIT_MODES.map((mode) => ({ name: `ScalpelVsWreckingBall ${mode} (marks)`, state: (t: number, b: number[], d: number) => split.frameState({ mode, marks: MARKS }, t, b, d) })),
  { name: 'VerdictCard', state: (t, b, d) => verdict.frameState({}, t, b, d) },
  { name: 'VerdictCard (marks)', state: (t, b, d) => verdict.frameState({ marks: [Number.NaN] }, t, b, d) },
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

// ---------------------------------------------------------------------------------------------
// restart-vs-iterate

test('tower: a collapse then a build stands the tower back up; a swap leaves it in place', () => {
  const ev: blocks.TowerEvent[] = [
    { kind: 'collapse', at: 1 },
    { kind: 'build', at: 2 },
  ];
  const fallen = blocks.towerBlocks(7, 50, 1.9, ev, [], () => 0);
  assert.ok(fallen.every((b) => b.opacity === 0));
  const up = blocks.towerBlocks(7, 50, 4, ev, [{ idx: 2, at: 3 }], () => 0);
  assert.ok(up.every((b) => b.dx === 0 && b.dy === 0 && b.opacity === 1));
  const mid = blocks.towerBlocks(7, 50, 3.25, ev, [{ idx: 2, at: 3 }], () => 0);
  assert.ok(mid[2].opacity < 0.05);
});

test('CodeTower lanes replay the real runs: iterate 4 → 1 → 0 solved, restart 3 → 3 → 4 → 3 not', () => {
  assert.deepEqual([...tower.ITER_RUN], [4, 1, 0]);
  assert.deepEqual([...tower.RESTART_RUN], [3, 3, 4, 3]);
  const beats = [0.2];
  const l1 = tower.frameState({ mode: 'lanes', lane: 1, marks: [0.6, 1.4, 2.6] }, 4.4, beats, 4.4).lanes[0];
  assert.equal(l1.failing, 0);
  assert.equal(l1.seq, 3);
  assert.equal(l1.end, 1);
  assert.ok(l1.tower.blocks.every((b) => b.rose === 0));
  const mid = tower.frameState({ mode: 'lanes', lane: 1, marks: [0.6, 1.4, 2.6] }, 2.2, beats, 4.4).lanes[0];
  assert.equal(mid.failing, 1);
  const l2 = tower.frameState({ mode: 'lanes', lane: 2, marks: [0.6, 1.6, 2.6] }, 5, beats, 5).lanes[1];
  assert.equal(l2.failing, 3);
  assert.equal(l2.end, 1);
  assert.equal(l2.tower.blocks.filter((b) => b.rose > 0.5).length, 3);
});

test('CodeTower bars: each step adds its bars; nothing grows before its word', () => {
  // The winner's bar rises on "won" (mark 0); the restart bar waits for "sixty" (mark 2).
  const s0 = tower.frameState({ mode: 'bars', step: 1, marks: [0.5, 1.5, 2.8] }, 0.6, [0.3], 5);
  assert.deepEqual(s0.bars.strong, [0, 0, 0]);
  const s1 = tower.frameState({ mode: 'bars', step: 1, marks: [0.5, 1.5, 2.8] }, 1.5, [0.3], 5);
  assert.ok(s1.bars.strong[0] > 0.9);
  assert.deepEqual(s1.bars.strong.slice(1), [0, 0]);
  const e1 = tower.frameState({ mode: 'bars', step: 1, marks: [0.5, 1.5, 2.8] }, 5, [0.3], 5);
  assert.deepEqual(e1.bars.strong, [1, 1, 0]);
  const e3 = tower.frameState({ mode: 'bars', step: 3, marks: [2] }, 4, [0.1], 4);
  assert.deepEqual(e3.bars.strong, [1, 1, 1]);
  assert.deepEqual(e3.bars.weak, [1, 1]);
  assert.equal(e3.bars.bracket, 0);
  assert.equal(tower.frameState({ mode: 'bars', step: 4, marks: [1] }, 4, [0.1], 4).bars.bracket, 1);
});

test('ScalpelVsWreckingBall: 7 restarts (5 one file), 34 (23 everything); chips 0/4 → 3/4 and 1/14, 2/14', () => {
  assert.equal(split.STRONG_TICKS.length, 7);
  assert.equal(split.STRONG_TICKS.filter((k) => k === 'f').length, 5);
  assert.equal(split.WEAK_TICKS.length, 34);
  assert.equal(split.WEAK_TICKS.filter((k) => k === 'a').length, 23);
  const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
  assert.equal(sum(split.STRONG_CHIPS.iterate), 0);
  assert.equal(sum(split.STRONG_CHIPS.button), 3);
  assert.equal(split.WEAK_CHIPS.button.length, 14);
  assert.equal(sum(split.WEAK_CHIPS.button), 1);
  assert.equal(sum(split.WEAK_CHIPS.iterate), 2);
  const strongEnd = split.frameState({ mode: 'strong', marks: [1, 2] }, 5, [0.1], 5).sides[0];
  assert.equal(strongEnd.count, 7);
  assert.ok(strongEnd.ticks.every((p) => p === 1));
  const weakEnd = split.frameState({ mode: 'weak', marks: [1, 2] }, 5, [0.1], 5).sides[1];
  assert.equal(weakEnd.count, 34);
  const pay = split.frameState({ mode: 'strongPay', marks: [0.4, 1.0, 1.8, 3.0] }, 5, [0.1, 2.8], 5).sides[0];
  assert.deepEqual(pay.rows[1].solved, [1, 1, 0, 1]);
  const early = split.frameState({ mode: 'strongPay', marks: [0.4, 1.0, 1.8, 3.0] }, 1.2, [0.1, 2.8], 5).sides[0];
  assert.ok(early.rows[1].appear.every((a) => a === 0));
});

test('VerdictCard: three lines land one per narration line', () => {
  const beats = [0.3, 3.2, 6];
  const at = (t: number) => verdict.frameState({ marks: [2.4] }, t, beats, 8.5).rows;
  assert.deepEqual(at(1), [0, 0, 0]);
  assert.equal(at(3)[0], 1);
  assert.equal(at(3)[1], 0);
  assert.deepEqual(at(8.5), [1, 1, 1]);
});

test('QuestionCard: questions swap at their scene, stamps persist with their question', () => {
  const scenes = [
    { anim: { props: { card: { q: 'A?' } } } },
    { anim: { props: { card: { q: 'B?', stamp: { text: 'yes', at: 2 } } } } },
    { anim: { props: { card: { q: 'B?' } } } },
    {},
  ];
  const track = card.cardTrack(scenes, [0, 5, 10, 15]);
  assert.equal(card.cardState(track, 1).text, 'A?');
  assert.equal(card.cardState(track, 5.6).text, 'B?');
  assert.equal(card.cardState(track, 7.5).stamp?.text, 'yes');
  assert.equal(card.cardState(track, 11).stamp?.text, 'yes');
  assert.equal(card.cardState(track, 20).opacity, 0);
});

test('marks resolve to the spoken word, or to an estimate before TTS', () => {
  const lines = [{ key: 'x-01', start: 0.2, dur: 2, text: { en: 'It reached 91%.', es: '' }, voice: 'en' as const, spoken: { en: 'It reached ninety-one percent.' } }];
  const words = { 'x-01': [['It', 0.1, 0.2], ['reached', 0.25, 0.5], ['ninety-one', 0.55, 0.9]] as [string, number, number][] };
  assert.equal(resolveMark(lines, [0, 'ninety'], words, 'en'), 0.75);
  const est = resolveMark(lines, [0, 'ninety'], {}, 'en');
  assert.ok(est > 0.2 && est < 2.2);
});
