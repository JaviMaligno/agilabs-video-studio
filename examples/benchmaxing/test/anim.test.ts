import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as counter from '../src/anim/Counter.state.ts';
import * as bars from '../src/anim/BarCompare.state.ts';
import * as flow from '../src/anim/FlowDiagram.state.ts';
import * as quote from '../src/anim/KeyQuote.state.ts';
import * as grid from '../src/anim/StatGrid.state.ts';
import * as eb from '../src/anim/ExamBridge.state.ts';
import * as pg from '../src/anim/PilotGrid.state.ts';
import * as wr from '../src/anim/WorkerRace.state.ts';
import { machine, resolveAt } from '../src/anim/tracks.ts';

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
];

// This video's bespoke components, every mode, with marks and without (marks fall back to beats).
CASES.push(
  ...eb.MODES.flatMap((mode) => [
    { name: `ExamBridge ${mode}`, state: (t: number, b: number[], d: number) => eb.frameState({ mode, marks: [0.8, 1.6, 2.4, 3.1] }, t, b, d) },
    { name: `ExamBridge ${mode} (no marks)`, state: (t: number, b: number[], d: number) => eb.frameState({ mode }, t, b, d) },
  ]),
  ...pg.GRID_MODES.flatMap((mode) => [
    { name: `PilotGrid ${mode}`, state: (t: number, b: number[], d: number) => pg.frameState({ mode, marks: [0.8, 1.6, 2.4] }, t, b, d) },
    { name: `PilotGrid ${mode} (no marks)`, state: (t: number, b: number[], d: number) => pg.frameState({ mode }, t, b, d) },
  ]),
  ...wr.RACE_MODES.flatMap((mode) => [
    { name: `WorkerRace ${mode}`, state: (t: number, b: number[], d: number) => wr.frameState({ mode, marks: [0.8, 1.6, 2.4, 3.1] }, t, b, d) },
    { name: `WorkerRace ${mode} (no marks)`, state: (t: number, b: number[], d: number) => wr.frameState({ mode }, t, b, d) },
  ]),
);

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

// ── This video's bespoke components ───────────────────────────────────────────────────────────

/** Every field of these states is a 0..1 progress except the spine offset. */
const inUnit = (st: Record<string, number>, name: string) => {
  for (const [k, v] of Object.entries(st)) {
    assert.ok(Number.isFinite(v), `${name}.${k} = ${v}`);
    if (k !== 'spineY') assert.ok(v >= -1e-9 && v <= 1 + 1e-9, `${name}.${k} = ${v} outside [0, 1]`);
  }
};

test('bespoke states stay within [0, 1] at any time, with or without marks', () => {
  for (const { beats, dur } of SCENARIOS) {
    for (const t of [-1, 0, 0.3, ...beats, dur / 2, dur, dur + 2]) {
      for (const mode of eb.MODES) inUnit(eb.frameState({ mode, marks: [0.5, 1, 9] }, t, beats, dur), `ExamBridge ${mode}`);
      for (const mode of pg.GRID_MODES) inUnit(pg.frameState({ mode }, t, beats, dur), `PilotGrid ${mode}`);
      for (const mode of wr.RACE_MODES) inUnit(wr.frameState({ mode, marks: [NaN, 2] }, t, beats, dur), `WorkerRace ${mode}`);
    }
  }
});

test('each mode starts exactly where its previous mode ended, so blended scenes never jump', () => {
  // Hard cuts at t = 0, allowed: unseen fields (the probes' rows armed while no probe shows), and
  // the scene that follows a dip from another component (lit, after the pilot: the plain spine).
  const cut: Record<string, string[]> = {
    split: ['big'],
    lit: ['spineY', 'benchDim', 'score', 'gold', 'cond', 'condStamp', 'condTag', 'title', 'fly', 'fold', 'zoom'],
  };
  for (const m of [eb.BRIDGE, pg.GRID, wr.RACE] as unknown as { modes: string[]; fields: string[]; at: (...a: unknown[]) => Record<string, number> }[]) {
    m.modes.forEach((mode, i) => {
      if (i === 0) return;
      const first = m.at(mode, 0, [0.3], 5, [1, 2, 3, 4]);
      const prevMode = m.modes[i - 1];
      const before = m.at(prevMode, 5, [0.3], 5, [1, 2, 3, 4]);
      for (const f of m.fields) {
        if (cut[mode]?.includes(f)) continue;
        assert.ok(Math.abs(first[f] - before[f]) < 1e-9, `${mode}.${f}: starts at ${first[f]}, ${prevMode} ended at ${before[f]}`);
      }
    });
  }
});

test('ExamBridge: key moments land on their words, not before', () => {
  const at = (mode: eb.BridgeMode, t: number, marks: number[], dur = 5) => eb.frameState({ mode, marks }, t, [0.3, 1.5], dur);
  // Hook: the score climbs on "higher" to the gold #1; the work gets its "redo" on "doesn't".
  assert.equal(at('hook', 0.5, [1, 2]).score, eb.BRIDGE.start('hook').score);
  assert.equal(at('hook', 5, [1, 2]).score, 1);
  assert.equal(at('hook', 1.9, [1, 2]).redo, 0);
  assert.equal(at('hook', 5, [1, 2]).redo, 1);
  // The name stamps on "Benchmaxing".
  assert.equal(at('name', 1.9, [2]).stamp, 0);
  assert.equal(at('name', 5, [2]).stamp, 1);
  // Three probes appear on "three"; the fourth scene of the part lights probe 3 only.
  assert.equal(at('three', 0.9, [1]).slots, 0);
  assert.equal(at('three', 5, [1]).slots, 1);
  const p3 = at('p3', 5, [0.5, 1, 2]);
  assert.deepEqual([p3.s1, p3.s2, p3.s3], [0, 0, 1]);
  // The verdict lights all three, then stamps "check the transfer" on "checking" with a thread bridge.
  const lit = at('lit', 5, [0.5, 1]);
  assert.deepEqual([lit.s1, lit.s2, lit.s3], [1, 1, 1]);
  assert.equal(at('verdict', 1.9, [0.5, 2]).transfer, 0);
  const v = at('verdict', 5, [0.5, 2]);
  assert.equal(v.transfer, 1);
  assert.equal(v.bridge, 0);
  assert.equal(v.away, 1);
  // The close leaves the question open: the stamp goes, a "?" lands on "benchmaxed" over the
  // stretched bridge, and the doubt (a table vs my experience) returns below. No new stamp.
  const lit0 = at('lit', 0, [0.5, 1]);
  assert.deepEqual([lit0.cond, lit0.zoom, lit0.title], [0, 0, 0]);
  assert.equal(at('open', 0.4, [1, 2]).qmark, 0);
  const o = at('open', 5, [1, 2]);
  assert.deepEqual([o.transfer, o.qmark, o.tables, o.flipT, o.crack, o.bridge, o.spineY], [0, 1, 1, 1, 0, 0, 0]);
  // The split: same score on both takes, only the left bridge thickens.
  const sp = at('split', 5, [0.5, 1, 2]);
  assert.equal(sp.miniScore, 1);
  assert.equal(sp.thick, 1);
  assert.equal(eb.bridgeWidth(0.02, 0) < 4, true);
  assert.equal(eb.bridgeWidth(0, 1), 27);
});

test('ExamBridge: numbers and labels on screen are the article\'s', () => {
  assert.equal(eb.TXT.lb.elo, 'Elo 1417');
  assert.equal(eb.TXT.fan.n, 27);
  assert.equal(eb.TXT.metr.text, 'randomised trial · 16 developers · 246 tasks');
  assert.equal(eb.TXT.time.plus, '+19%');
  assert.equal(eb.TXT.time.with, 'with early-2025 AI tools');
  assert.deepEqual(eb.TXT.fine, ['Frontier-Bench · internal run', 'particular environment', 'mean reward over 5 attempts per task', 'Opus 4.8 fallback for safety blocks']);
  assert.equal(eb.TXT.condTag[1], 'Fable 5 leads, 60.0% · Opus 5 shipped after it');
  assert.deepEqual(eb.TXT.gsm, { chip: 'GSM1k', text: 'new problems comparable to GSM8k' });
  // The fan deals out all 27 by the end of the scene.
  assert.equal(eb.frameState({ mode: 'p2fan', marks: [0.5, 1, 2] }, 5, [0.2], 5).fan, 1);
});

test('PilotGrid: seven models x four cases, the worker column after the race, then a probe', () => {
  assert.deepEqual(
    pg.ROWS.map((r) => [r.model, ...r.cells.map((c) => c.text)]),
    [
      ['Opus 5', 'gaps', '0/8', '✓', '✓'],
      ['Fable 5', 'gaps', '0/8', '✓', '✓'],
      ['Kimi K3.1 Pro', 'gaps', '7/8', '✓', '✓'],
      ['Gemini 4 Argon', '✓', '6/8', '✓', '✓'],
      ['DeepSeek V4 Pro', 'gaps', '2/8', '✓', 'partial'],
      ['Qwen3.8', 'gaps', '2/8', '✓', 'partial'],
      ['GLM 5.3', 'gaps', '1/8', '✓', '✓'],
    ],
  );
  assert.deepEqual(pg.COLS.map((c) => c.code), ['D1', 'D2/D2b', 'D3', 'D4']);
  const empty = pg.frameState({ mode: 'empty', marks: [0.5, 1.5] }, 4, [0.3, 1.4], 4);
  assert.deepEqual([empty.d1, empty.d2, empty.d3, empty.d4, empty.tie], [0, 0, 0, 0, 0]);
  assert.equal(empty.rows, 1);
  const w = pg.frameState({ mode: 'workers', marks: [0.6, 1.2, 2.2, 2.8] }, 4, [0.3, 2], 4);
  assert.deepEqual([w.d2, w.hiTop, w.hiClaude, w.d3], [1, 1, 1, 0]);
  assert.equal(pg.frameState({ mode: 'workers', marks: [0.6, 1.2, 2.2, 2.8] }, 2.0, [0.3, 2], 4).hiClaude, 0);
  const filled = pg.frameState({ mode: 'filled', marks: [1, 1.8, 2.6] }, 4, [0.3], 4);
  assert.deepEqual([filled.d1, filled.d2, filled.d3, filled.d4, filled.tie, filled.hiTop], [1, 1, 1, 1, 1, 0]);
  assert.equal(pg.frameState({ mode: 'filled', marks: [1, 1.8, 2.6] }, 2.5, [0.3], 4).tie, 0);
  // The pilot closes as one small probe, reported neutrally: no verdict stamps.
  const pr = (t: number) => pg.frameState({ mode: 'probe', marks: [1.5] }, t, [0.3], 5);
  assert.equal(pr(1.3).probe, 0);
  assert.equal(pr(5).probe, 1);
});

test('WorkerRace: the four stops of the article\'s figure, in order', () => {
  assert.deepEqual(wr.STOPS.map((s) => s.label), ['A checks then pauses', 'B sends and finishes', 'Key record expires', 'A resumes and sends']);
  const st = (t: number) => wr.frameState({ mode: 'stops', marks: [0.5, 1.5, 2.5, 3.2] }, t, [0.2], 5);
  assert.equal(st(0.3).st2, 0);
  assert.equal(st(1.3).st3, 0);
  assert.equal(st(2.3).st4, 0);
  assert.equal(st(3.1).e2, 0);
  const end = st(5);
  assert.deepEqual([end.st1, end.st2, end.st3, end.st4, end.e1, end.e2, end.quote], [1, 1, 1, 1, 1, 1, 1]);
  assert.equal(wr.RACE_TXT.quote, '“negligible, not impossible”');
});

test('tracks: marks fall back to beats, unknown fields and modes are refused', () => {
  assert.equal(resolveAt(['m', 1, 0.5], [2], undefined), 2 + 0.6 + 0.8 + 0.5);
  assert.equal(resolveAt(['m', 0], [2], [4]), 4);
  assert.equal(resolveAt(['b', 1], [2, 3], undefined), 3);
  assert.equal(resolveAt(['b', 4], [], undefined), 4.8);
  assert.throws(() => machine({ a: 0 }, [['x', { set: { b: 1 } as never }]]));
  assert.throws(() => machine({ a: 0 }, [['x', { prev: 'nope', set: {} }]]));
  // A step that has not started keeps the start value; one that has finished holds its target.
  const m = machine({ a: 0 }, [['x', { set: { a: { to: 1, at: 2, len: 1 } } }]]);
  assert.equal(m.at('x', 1, [], 5).a, 0);
  assert.equal(m.at('x', 3.5, [], 5).a, 1);
});
