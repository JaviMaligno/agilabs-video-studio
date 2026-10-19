import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as counter from '../src/anim/Counter.state.ts';
import * as bars from '../src/anim/BarCompare.state.ts';
import * as flow from '../src/anim/FlowDiagram.state.ts';
import * as quote from '../src/anim/KeyQuote.state.ts';
import * as grid from '../src/anim/StatGrid.state.ts';
import * as pan from '../src/anim/RingPan.state.ts';
import * as cook from '../src/anim/CookingShot.state.ts';
import { DIVERGENCE, EDGE, NEST, OBLIVIOUS, SUPER } from '../src/data/instances.ts';

const PAN_COMPARE: pan.RingPanProps = {
  mode: 'pans',
  R: 10,
  meterMax: 80,
  counter: { radii: [...DIVERGENCE.counter], w: 1, scale: 0.62 },
  pans: [
    { dials: ['rings', 'seared'], seared: '≈ 69.7', rings: DIVERGENCE.count.map((g, i) => ({ ...g, from: i + 1, enter: { beat: 0, delay: 0.8 * i } })) },
    { dials: ['rings', 'seared'], seared: '≈ 76.7', rings: [{ ...DIVERGENCE.area[0], enter: 'pre' }, { ...DIVERGENCE.area[1], from: 1, nest: true, enter: { beat: 1 } }] },
  ],
};
const PAN_EDGE: pan.RingPanProps = {
  mode: 'pans',
  R: 15,
  counter: { radii: [...EDGE.radii], w: 0.3 },
  pans: [
    {
      label: 'TIGHTEST',
      dials: ['rings'],
      rings: [
        ...EDGE.tightest.map((g, i) => ({ ...g, from: i, enter: { beat: 0, delay: i } })),
        { r: 4.8, w: 0.3, x: 0, y: 0, from: 3, refuse: EDGE.refusedTries, enter: { beat: 1 } },
      ],
    },
  ],
};
const PAN_OBLIVIOUS: pan.RingPanProps = {
  mode: 'pans',
  R: 10,
  counter: { radii: [...OBLIVIOUS.radii], w: 1 },
  morph: { beat: 0, delay: 4, tag: 'any pan shape' },
  pans: (['tightest', 'roomiest', 'random'] as const).map((rule, k) => ({
    label: rule,
    dials: ['seared' as const],
    candidates: true,
    shape: k === 1 ? ('rect' as const) : k === 2 ? ('sphere' as const) : undefined,
    rings: OBLIVIOUS[rule].map((g, i) => ({ ...g, from: i, enter: { beat: 0, delay: 0.8 * i } })),
  })),
};

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
  { name: 'RingPan compare', state: (t, b, d) => pan.frameState(PAN_COMPARE, t, b, d) },
  { name: 'RingPan edge', state: (t, b, d) => pan.frameState(PAN_EDGE, t, b, d) },
  { name: 'RingPan oblivious', state: (t, b, d) => pan.frameState(PAN_OBLIVIOUS, t, b, d) },
  { name: 'RingPan nest', state: (t, b, d) => pan.frameState({ mode: 'pans', R: 10, counter: { radii: [3], w: 1.3, align: 'right' }, pans: [{ dials: ['rings', 'seared'], rings: [{ ...NEST.big, enter: 'pre' }, { ...NEST.small, from: 0, nest: true, enter: { beat: 0, delay: 1 } }] }] }, t, b, d) },
  { name: 'RingPan split', state: (t, b, d) => pan.frameState({ mode: 'split' }, t, b, d) },
  { name: 'RingPan superincreasing', state: (t, b, d) => pan.frameState({ mode: 'superincreasing', set: { radii: [...SUPER.radii], w: 4.8, label: 'x' } }, t, b, d) },
  { name: 'RingPan empty', state: (t, b, d) => pan.frameState({ mode: 'pans' }, t, b, d) },
  { name: 'CookingShot hook', state: (t, b, d) => cook.frameState({ mode: 'hook' }, t, b, d) },
  { name: 'CookingShot finish', state: (t, b, d) => cook.frameState({ mode: 'finish' }, t, b, d) },
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

const UNIT = new Set(['raw', 'glow', 'height', 'reveal', 'ripple', 'spark', 'puff', 'cross', 'ghost', 'fill', 'on', 'picked', 'rect', 'sphere', 'brown', 'rawFull', 'dim', 'match', 'steam', 'sizzle', 'out', 'chip', 'pulse', 'displayOpacity']);
const checkUnit = (value: unknown, path: string) => {
  if (Array.isArray(value)) value.forEach((v, i) => checkUnit(v, `${path}[${i}]`));
  else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      if (UNIT.has(k) && typeof v === 'number') assert.ok(v >= 0 && v <= 1 + 1e-9, `${path}.${k} = ${v}`);
      checkUnit(v, `${path}.${k}`);
    }
  }
};

test('RingPan / CookingShot: unit fields stay within [0, 1]', () => {
  for (const c of CASES.filter((x) => /RingPan|CookingShot/.test(x.name))) {
    for (const { beats, dur } of [...SCENARIOS, { beats: [0.5, 3], dur: 8 }]) {
      for (let t = -1; t <= dur + 1; t += 0.05) checkUnit(c.state(t, beats, dur), `${c.name}@${t.toFixed(2)}`);
    }
  }
});

test('RingPan: rings land at their final spots, RINGS counts them, SEARED shows the article figure', () => {
  const end = pan.frameState(PAN_COMPARE, 6, [0.3, 3], 6);
  const geo = pan.panGeometry(2);
  const s = geo[0].R / 10;
  DIVERGENCE.count.forEach((g, i) => {
    const r = end.rings[i];
    assert.ok(Math.abs(r.x - (geo[0].cx + g.x * s)) < 1e-6 && Math.abs(r.y - (geo[0].cy + g.y * s)) < 1e-6, `ring ${i} at its spot`);
    assert.equal(r.glow, 1);
    assert.equal(r.height, 0);
  });
  assert.equal(end.dials[0].rings?.value, '3');
  assert.equal(end.dials[0].seared?.display, '≈ 69.7');
  assert.equal(end.dials[0].seared?.displayOpacity, 1);
  assert.equal(end.dials[1].rings?.value, '2');
  // Before the first placement: nothing landed, the counter shows the whole set.
  const before = pan.frameState(PAN_COMPARE, 0.1, [0.3, 3], 6);
  assert.equal(before.dials[0].rings?.value, '0');
  assert.equal(before.dials[0].seared?.displayOpacity, 0);
  assert.ok(before.counter.every((c) => c.ghost === 0));
});

test('RingPan: RINGS increments on the landing frame', () => {
  const g = { ...DIVERGENCE.count[0], from: 1, enter: { at: 1 } };
  const land = 1 + pan.landingOffset(g);
  const props: pan.RingPanProps = { mode: 'pans', R: 10, counter: { radii: [9, 4.2], w: 1 }, pans: [{ dials: ['rings'], rings: [g] }] };
  assert.equal(pan.frameState(props, land - 0.01, [], 6).dials[0].rings?.value, '0');
  assert.equal(pan.frameState(props, land + 0.001, [], 6).dials[0].rings?.value, '1');
});

test('RingPan: the refused 4.8 never counts and ends with a red cross', () => {
  const end = pan.frameState(PAN_EDGE, 20, [0.2, 4], 20);
  assert.equal(end.dials[0].rings?.value, '3');
  const refused = end.rings.at(-1)!;
  assert.equal(refused.cross, 1);
  assert.equal(refused.glow, 0);
});

test('RingPan oblivious: same seared fill in all three pans, shapes morph by the end', () => {
  const end = pan.frameState(PAN_OBLIVIOUS, 10, [0.2], 10);
  const fills = end.dials.map((d) => d.seared!.fill);
  assert.ok(fills.every((f) => Math.abs(f - fills[0]) < 1e-9 && f === 1));
  assert.equal(end.pans[1].rect, 1);
  assert.equal(end.pans[2].sphere, 1);
  assert.equal(end.morphTag?.pop, 1);
});

test('RingPan split starts on the photo match geometry and ends on two pans', () => {
  const m = pan.matchGeometry();
  const s0 = pan.frameState({ mode: 'split' }, 0, [0.3, 2], 4);
  assert.ok(Math.abs(s0.pans[0].R - m.pan.R) < 1e-6 && Math.abs(s0.pans[1].cx - m.pan.cx) < 1e-6);
  // The handful is drawn once per pan; at the start both copies coincide on the photo's rings.
  assert.equal(s0.rings.length, 14);
  s0.rings.slice(0, 7).forEach((r, i) => assert.ok(Math.abs(r.x - s0.rings[7 + i].x) < 1e-6 && r.glow === s0.rings[7 + i].glow));
  const s1 = pan.frameState({ mode: 'split' }, 4, [0.3, 2], 4);
  assert.deepEqual(s1.pans.map((p) => [p.cx, p.cy, p.R]), pan.panGeometry(2).map((p) => [p.cx, p.cy, p.R]));
  // Same rings in both pans: left read as a count (raw), right as a sear (glowing), all visible.
  assert.ok(s1.rings.every((r) => r.opacity === 1));
  assert.ok(s1.rings.slice(0, 7).every((r) => r.glow === 0 && r.raw === 1));
  assert.ok(s1.rings.slice(7).every((r) => r.glow === 1));
  for (const [i, pg] of s1.pans.entries())
    for (const r of s1.rings.slice(7 * i, 7 * i + 7)) assert.ok(Math.hypot(r.x - pg.cx, r.y - pg.cy) + r.ro <= pg.R + 1e-6, 'ring inside its pan');
});

test('CookingShot hook: rings drop one by one, nested last; browning stops at the match level', () => {
  const beats = [0.5, 2.8];
  const dur = 6;
  const mid = cook.frameState({ mode: 'hook' }, 1.4, beats, dur);
  const shown = mid.rings.map((r) => r.reveal);
  assert.ok(shown[0] > 0 && shown.at(-1) === 0, 'first ring in, nested ring not yet');
  const end = cook.frameState({ mode: 'hook' }, dur, beats, dur);
  assert.ok(end.rings.every((r) => r.reveal === 1 && r.height === 0));
  assert.ok(Math.abs(end.brown - cook.HOOK_BROWN) < 1e-9);
  assert.equal(end.match, 1);
  const fin0 = cook.frameState({ mode: 'finish' }, 0, [0.5, 2.5], 5);
  assert.ok(Math.abs(fin0.brown - cook.HOOK_BROWN) < 1e-9 && fin0.match === 1, 'closing shot picks up where the opening left');
  assert.equal(cook.frameState({ mode: 'finish' }, 5, [0.5, 2.5], 5).brown, 1);
});
