import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as counter from '../src/anim/Counter.state.ts';
import * as bars from '../src/anim/BarCompare.state.ts';
import * as flow from '../src/anim/FlowDiagram.state.ts';
import * as quote from '../src/anim/KeyQuote.state.ts';
import * as grid from '../src/anim/StatGrid.state.ts';
import * as panes from '../src/anim/SessionPanes.state.ts';
import * as shelf from '../src/anim/RegistryShelf.state.ts';

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
  { name: 'SessionPanes swarm', state: (t, b, d) => panes.frameState({ mode: 'swarm' }, t, b, d) },
  { name: 'SessionPanes ask', state: (t, b, d) => panes.frameState({ mode: 'ask' }, t, b, d) },
  { name: 'SessionPanes tell', state: (t, b, d) => panes.frameState({ mode: 'tell' }, t, b, d) },
  { name: 'SessionPanes thread', state: (t, b, d) => panes.frameState({ mode: 'thread' }, t, b, d) },
  { name: 'SessionPanes real-open', state: (t, b, d) => panes.frameState({ mode: 'real-open' }, t, b, d) },
  { name: 'SessionPanes real-withdraw', state: (t, b, d) => panes.frameState({ mode: 'real-withdraw' }, t, b, d) },
  { name: 'SessionPanes real-correct', state: (t, b, d) => panes.frameState({ mode: 'real-correct' }, t, b, d) },
  { name: 'SessionPanes real-thanks', state: (t, b, d) => panes.frameState({ mode: 'real-thanks' }, t, b, d) },
  { name: 'SessionPanes real-overview', state: (t, b, d) => panes.frameState({ mode: 'real-overview' }, t, b, d) },
  { name: 'RegistryShelf trap', state: (t, b, d) => shelf.frameState({ mode: 'trap' }, t, b, d) },
  { name: 'RegistryShelf inspect', state: (t, b, d) => shelf.frameState({ mode: 'inspect' }, t, b, d) },
  { name: 'RegistryShelf loaded', state: (t, b, d) => shelf.frameState({ mode: 'loaded' }, t, b, d) },
  { name: 'RegistryShelf crack', state: (t, b, d) => shelf.frameState({ mode: 'crack' }, t, b, d) },
  { name: 'RegistryShelf live', state: (t, b, d) => shelf.frameState({ mode: 'live' }, t, b, d) },
  { name: 'RegistryShelf fix', state: (t, b, d) => shelf.frameState({ mode: 'fix' }, t, b, d) },
  { name: 'RegistryShelf close', state: (t, b, d) => shelf.frameState({ mode: 'close' }, t, b, d) },
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

test('SessionPanes swarm: about 1 in 11 asks, about 1 in 3 tells', () => {
  assert.equal(panes.ASK.length, 3);
  assert.equal(panes.SWARM_N, 33);
  assert.equal(panes.TELL.length, 11);
  for (const k of panes.ASK) assert.ok(!(panes.TELL as readonly number[]).includes(k));
});

test('SessionPanes swarm streams, then freezes on its home grid', () => {
  const beats = [0.1];
  const dur = 3.6;
  const early = panes.frameState({ mode: 'swarm' }, 0.2, beats, dur);
  const late = panes.frameState({ mode: 'swarm' }, 3.0, beats, dur);
  assert.equal(early.view, 'swarm');
  if (early.view !== 'swarm' || late.view !== 'swarm') return;
  const moved = early.bubbles.some((b, k) => Math.hypot(b.x - panes.swarmHome(k).x, b.y - panes.swarmHome(k).y) > 50);
  assert.ok(moved, 'bubbles are still streaming at the start');
  late.bubbles.forEach((b, k) => {
    assert.ok(Math.abs(b.x - panes.swarmHome(k).x) < 1e-6 && Math.abs(b.y - panes.swarmHome(k).y) < 1e-6);
  });
  // The hook title is on screen from the first frame.
  assert.ok(early.title.length > 0);
});

test('SessionPanes ask shows 179 and the 8.9 % chip by the end', () => {
  const s = panes.frameState({ mode: 'ask' }, 4, [0.15], 4);
  assert.equal(s.view, 'swarm');
  if (s.view !== 'swarm') return;
  assert.equal(s.counter, 179);
  assert.equal(s.chipAppear, 1);
});

test('SessionPanes thread: the first flag flips to a tick on the retraction', () => {
  const before = panes.frameState({ mode: 'thread' }, 0.5, [0.2], 6);
  const after = panes.frameState({ mode: 'thread' }, 6, [0.2], 6);
  if (before.view !== 'thread' || after.view !== 'thread') assert.fail('thread view');
  assert.equal(before.retract, 0);
  assert.equal(after.retract, 1);
  assert.deepEqual(after.msgs.map((m) => m.appear), [1, 1, 1, 1]);
});

test('SessionPanes real: each landed card is held still at least 2 s in its scene', () => {
  // Beats and lengths as the timeline lays them out (before TTS they are estimates).
  const scenes: { mode: panes.Mode; beats: number[]; dur: number; ids: string[] }[] = [
    { mode: 'real-withdraw', beats: [0.15], dur: 3.9, ids: ['withdraw'] },
    { mode: 'real-correct', beats: [0.9, 3.97], dur: 6.8, ids: ['correct', 'accept'] },
    { mode: 'real-thanks', beats: [0.15], dur: 3.9, ids: ['thanks'] },
  ];
  for (const sc of scenes) {
    for (const id of sc.ids) {
      let landed = NaN;
      for (let t = 0; t <= sc.dur; t += 1 / 30) {
        const s = panes.frameState({ mode: sc.mode }, t, sc.beats, sc.dur);
        if (s.view !== 'real') continue;
        const c = s.cards.find((x) => x.id === id)!;
        if (c.appear >= 1 && c.opacity >= 1 && Number.isNaN(landed)) landed = t;
      }
      // The scene's last 0.6 s cross-blend into the next one.
      assert.ok(sc.dur - 0.6 - landed >= 2, `${id}: held ${(sc.dur - 0.6 - landed).toFixed(2)} s`);
    }
  }
});

test('RegistryShelf fix: 0.4.1 lands beside 0.4.0, never on top of it', () => {
  const s = shelf.frameState({ mode: 'fix' }, 4.8, [0.3], 4.8);
  if (s.view !== 'live') assert.fail('live view');
  const [old, neu] = s.boxes;
  assert.equal(old.label, '0.4.0');
  assert.equal(neu.label, '0.4.1');
  assert.ok(Math.abs(neu.x - old.x) >= shelf.BOX.w, 'boxes do not overlap');
  assert.equal(s.tally, 1);
});

test('RegistryShelf inspect ends on 7 / 7; loaded stamps without walking', () => {
  const i = shelf.frameState({ mode: 'inspect' }, 4.2, [0.2], 4.2);
  if (i.view !== 'inspect') assert.fail('inspect view');
  assert.equal(i.count, 7);
  const l = shelf.frameState({ mode: 'loaded' }, 5.4, [0.2, 1.6], 5.4);
  if (l.view !== 'loaded') assert.fail('loaded view');
  assert.equal(l.walks.length, 2, 'only two of the three panes walk to the shelf');
  assert.equal(l.stamp, 1);
});

test('RegistryShelf inspect holds 7 / 7 for ~1 s before the hand-over fade (as rendered)', () => {
  // Real timing of the inspect scene: line at 0.1 s, scene 3.7 s, last 0.6 s cross-fading.
  const at = (t: number) => {
    const s = shelf.frameState({ mode: 'inspect' }, t, [0.1], 3.7);
    if (s.view !== 'inspect') assert.fail('inspect view');
    return s.count;
  };
  assert.equal(at(3.7 - 0.6 - 0.8), 7);
});
