import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as counter from '../src/anim/Counter.state.ts';
import * as bars from '../src/anim/BarCompare.state.ts';
import * as flow from '../src/anim/FlowDiagram.state.ts';
import * as quote from '../src/anim/KeyQuote.state.ts';
import * as grid from '../src/anim/StatGrid.state.ts';
import * as stack from '../src/anim/FileStack.state.ts';
import * as trail from '../src/anim/Trail.state.ts';

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
  { name: 'FileStack (loom)', state: (t, b, d) => stack.frameState({ mode: 'loom' }, t, b, d) },
  { name: 'FileStack (count)', state: (t, b, d) => stack.frameState({ mode: 'count', clock: 3.2 }, t, b, d) },
  ...trail.MODES.map((mode) => ({ name: `Trail (${mode})`, state: (t: number, b: number[], d: number) => trail.frameState({ mode, clock: 12 }, t, b, d) })),
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

// ── FileStack ────────────────────────────────────────────────────────────────────────────────
test('FileStack: the cold open shows the stack already growing, and nothing else', () => {
  const total = stack.COLS * stack.ROWS;
  // Frame 0: more than half the stack stands, the rest has not been released.
  assert.equal(stack.tileLanded(0, total, 0), 1);
  assert.equal(stack.tileLanded(total - 1, total, 0), 0);
  // It keeps growing: more tiles have landed one second in, and all of them by the end.
  const landed = (T: number) => Array.from({ length: total }, (_, k) => stack.tileLanded(k, total, T)).filter((x) => x >= 1).length;
  assert.ok(landed(1) > landed(0));
  assert.equal(landed(stack.GROW_SECONDS + 1), total);
  for (const t of [0, 1, 3]) {
    const s = stack.frameState({ mode: 'loom' }, t, [0.1], 3.5);
    assert.deepEqual([s.appear, s.scan, s.checked, s.read], [0, 0, 0, 0]);
    assert.equal(s.zoom, stack.LOOM_ZOOM);
  }
});

test('FileStack: the count starts from the cold open framing and ends on the article figure', () => {
  const beats = [0.5, 6.4, 9.1];
  const dur = 11.5;
  const first = stack.frameState({ mode: 'count', clock: 2.9 }, 0, beats, dur);
  assert.equal(first.zoom, stack.LOOM_ZOOM);
  assert.equal(first.appear, 0);
  // One step per line: the number, then the check, then "read by: 0".
  const mid = stack.frameState({ mode: 'count' }, 6.2, beats, dur);
  assert.equal(mid.appear, 1);
  assert.equal(mid.checked, 0);
  assert.equal(mid.read, 0);
  const checked = stack.frameState({ mode: 'count' }, 8.9, beats, dur);
  assert.equal(checked.checked, 1);
  assert.equal(checked.read, 0);
  const end = stack.frameState({ mode: 'count' }, dur, beats, dur);
  assert.equal(end.text, '175,187');
  assert.equal(end.zoom, 1);
  assert.deepEqual([end.appear, end.scan, end.checked, end.read], [1, 1, 1, 1]);
  // Landscape: the stack slides aside before the number arrives; the checker comes with its line.
  assert.equal(first.layout, 0);
  assert.equal(end.layout, 1);
  assert.equal(stack.frameState({ mode: 'count' }, 6.0, beats, dur).checker, 0);
  assert.equal(stack.frameState({ mode: 'count' }, 7.0, beats, dur).checker, 1);
  assert.equal(stack.frameState({ mode: 'loom' }, 2, [0.1], 3.5).layout, 0);
  // While it counts the text is always a whole number with thousands separators, never past it.
  for (let t = 4; t < 7; t += 0.05) {
    const txt = stack.frameState({ mode: 'count' }, t, beats, dur).text;
    assert.match(txt, /^\d{1,3}(,\d{3})*$/);
    assert.ok(Number(txt.replace(/,/g, '')) <= stack.FILES);
  }
});

// ── Trail ────────────────────────────────────────────────────────────────────────────────────
const TRAIL_KEYS = Object.keys(trail.END.open) as (keyof trail.Vals)[];
const CAMERA = ['camX', 'camY', 'zoom', 'lx', 'ly', 'lz', 'pos'];
const UNIT_KEYS = TRAIL_KEYS.filter((k) => !CAMERA.includes(k));

test('Trail: each scene starts on the picture the scene it continues ended on, and holds it while they blend', () => {
  const beats = [0.15, 2.4];
  const dur = 5;
  for (const mode of trail.MODES) {
    const prev = trail.PREV[mode];
    if (!prev) continue;
    const prevEnd = trail.frameState({ mode: prev }, dur, beats, dur);
    // Scenes that follow each other in the video blend: identical picture at the seam.
    const adjacent = trail.MODES.indexOf(prev) === trail.MODES.indexOf(mode) - 1 && mode !== 'mountain';
    for (const t of [0, trail.HOLD]) {
      const start = trail.frameState({ mode }, t, beats, dur);
      for (const k of TRAIL_KEYS) if (adjacent) assert.equal(start[k], prevEnd[k], `${mode}.${k} at t=${t}`);
    }
    const handOver = trail.frameState({ mode: prev }, dur - trail.HAND_OVER, beats, dur);
    for (const k of TRAIL_KEYS) assert.ok(Math.abs(handOver[k] - prevEnd[k]) < 1e-9, `${prev}.${k} still moving at the hand-over`);
  }
  // The chain covers every scene once, in video order.
  assert.deepEqual(trail.MODES.filter((m) => trail.PREV[m] === null), ['overview', 'open']);
  // The mountain comes back with the story as the other proof left it: walker, light, second figure.
  const mountain = trail.startOf('mountain');
  for (const k of ['pos', 'run', 'second', 'sheet'] as const) assert.equal(mountain[k], trail.END.revised[k]);
  assert.equal(mountain.board, 1);
  assert.equal(mountain.stamp, 0);
});

test('Trail: every scene ends on its own end picture, with every amount within 0..1', () => {
  for (const mode of trail.MODES) {
    for (const [beats, dur] of [[[0.15, 2.4], 5], [[], 4], [[1, 9], 4], [[0], 0.5], [[0.2, 2, 4, 6, 8], 3]] as [number[], number][]) {
      const end = trail.frameState({ mode }, dur, beats, dur);
      for (const k of TRAIL_KEYS) assert.equal(end[k], trail.END[mode][k], `${mode}.${k}`);
      for (const t of [-1, 0, 0.3, dur / 2, dur, dur + 3]) {
        const s = trail.frameState({ mode }, t, beats, dur);
        for (const k of UNIT_KEYS) assert.ok(s[k] >= 0 && s[k] <= 1, `${mode}.${k} = ${s[k]} at t=${t}`);
        assert.ok(s.zoom >= 1 && s.zoom <= 2.5);
        assert.ok(s.lz >= 1 && s.lz <= 3);
        assert.ok(s.pos >= 0 && s.pos <= 3);
        assert.match(s.cutText, /^−\d+\.\d%$/);
      }
    }
  }
});

test('Trail: the story happens in order', () => {
  const beats = [0.15, 2.4];
  const dur = 6;
  const at = (mode: trail.TrailMode, t: number, b = beats, d = dur) => trail.frameState({ mode }, t, b, d);
  // Nothing of the later story is on screen in the first scene of chapter 4.
  const open = at('open', 1);
  for (const k of UNIT_KEYS) if (k !== 'walkerIn') assert.equal(open[k], 0, `open.${k}`);
  // Overview: the stops light up over the first two lines, the walker comes in on the third.
  const ov = [0.3, 5.05, 8.68];
  assert.equal(at('overview', 0.2, ov, 12).stopsLit, 0);
  assert.ok(at('overview', 4.9, ov, 12).stopsLit > 3 && at('overview', 4.9, ov, 12).stopsLit <= 4);
  assert.equal(at('overview', 8.6, ov, 12).stopsLit, 8);
  assert.equal(at('overview', 8.6, ov, 12).walkerIn, 0);
  assert.equal(at('overview', 12, ov, 12).walkerIn, 1);
  // The sheet glows before it is picked up; the pile is named on its line; it is picked on that line.
  const pick = at('pick', 2.2);
  assert.ok(pick.glow > 0 && pick.pick === 0 && pick.pileTag === 0);
  assert.equal(at('pick', dur).pileTag, 1);
  // Unfold: the 1969 trick card first, the sheet unfolds, then "taste" and the glow on line 2.
  const unf = [0.15, 6.98];
  assert.equal(at('unfold', 1.5, unf, 11.3).trick, 1);
  assert.equal(at('unfold', 1.5, unf, 11.3).unfold, 0);
  assert.equal(at('unfold', 6.5, unf, 11.3).unfold, 1);
  assert.equal(at('unfold', 6.5, unf, 11.3).taste, 0);
  assert.equal(at('unfold', 11.3, unf, 11.3).taste, 1);
  assert.equal(at('unfold', 11.3, unf, 11.3).chosen, 1);
  assert.equal(at('unfold', 11.3, unf, 11.3).trick, 0);
  // The walker stops where the steep stretch begins; only the light goes up it.
  const out3 = [0.15, 5.54, 9.81];
  const outrun = at('outrun', 12.8, out3, 12.8);
  assert.equal(outrun.pos, 2);
  assert.equal(outrun.run, 1);
  assert.deepEqual([outrun.walker.x, outrun.walker.y], trail.STOP);
  assert.deepEqual([outrun.lightAt.x, outrun.lightAt.y], trail.SUMMIT);
  assert.deepEqual([outrun.walkerL.x, outrun.walkerL.y], trail.STOP_L);
  assert.deepEqual([outrun.lightAtL.x, outrun.lightAtL.y], trail.SUMMIT_L);
  assert.equal(at('outrun', 1, out3, 12.8).run, 0);
  // His own words on their line, the lock on the "internal model" line.
  assert.equal(at('outrun', 5.4, out3, 12.8).quote, 0);
  assert.equal(at('outrun', 9.7, out3, 12.8).quote, 1);
  assert.equal(at('outrun', 9.7, out3, 12.8).lock, 0);
  assert.equal(outrun.lock, 1);
  // He only starts to draw it.
  assert.ok(trail.END.draw.sketch > 0 && trail.END.draw.sketch < 0.5);
  // The other proof: twelve years on line 1, the quote waits for line 3.
  const tq = (t: number) => trail.frameState({ mode: 'twoquote' }, t, [0.15, 5.54, 8.61], 11.7);
  assert.equal(tq(0.2).years, 0);
  assert.equal(tq(3).years, 1);
  assert.equal(tq(8.5).here, 0);
  assert.equal(tq(11.7).here, 1);
  // Notes land on line 1, the stamp on line 2.
  const rv = (t: number) => trail.frameState({ mode: 'revised' }, t, [0.15, 4.82], 8.6);
  assert.ok(rv(2.5).notes > 0 && rv(4.7).stamp === 0);
  assert.equal(rv(8.6).stamp, 1);
  // The second figure comes in on its own path and never reaches the summit.
  const second = at('second', dur);
  assert.ok(Math.hypot(second.secondAt.x - trail.SUMMIT[0], second.secondAt.y - trail.SUMMIT[1]) > 300);
  assert.ok(Math.hypot(second.secondAtL.x - trail.SUMMIT_L[0], second.secondAtL.y - trail.SUMMIT_L[1]) > 300);
  // Mountain: the line count waits for its line.
  const mt = (t: number) => trail.frameState({ mode: 'mountain' }, t, [0.2, 5.59], 8.7);
  assert.equal(mt(5.5).linesTag, 0);
  assert.equal(mt(8.7).linesTag, 1);
  // Crowd on line 2, front pages on line 3.
  const cw = (t: number) => trail.frameState({ mode: 'crowd' }, t, [1.2, 4.43, 7.18], 10.4);
  assert.equal(cw(4.3).crowd, 0);
  assert.ok(cw(7).crowd > 0 && cw(7).news === 0);
  assert.equal(cw(10.4).news, 1);
  // Map: the cut ticks up to the article's figure on line 3, dimmed on line 4.
  const mp = (t: number) => trail.frameState({ mode: 'map' }, t, [0.15, 4.66, 8.85, 13.2], 16.5);
  assert.equal(mp(8.8).cutOn, 0);
  assert.equal(mp(13).cutText, '−26.6%');
  assert.equal(mp(13).dim, 0);
  assert.equal(mp(16.5).dim, 1);
  assert.equal(trail.END.catchup.cutOn, 0);
  // Forks: open on line 3, reach far on line 4; the chosen sheet glows on line 5.
  const fk = (t: number) => trail.frameState({ mode: 'forks' }, t, [0.2, 2.87, 5.62, 9.49, 12.08], 17);
  assert.equal(fk(5.5).forks, 0);
  assert.ok(fk(9.4).forks > 0.5 && fk(9.4).forks <= 0.6);
  assert.equal(fk(12).forks, 1);
  assert.equal(fk(12).chosen, 0);
  assert.equal(fk(17).chosen, 1);
  // Closer: everything alive on its last line.
  assert.equal(trail.frameState({ mode: 'closer' }, 2.9, [0.4, 2.99], 5).alive, 0);
  assert.equal(trail.END.closer.alive, 1);
  // The map climbs towards the light and stays behind it: understanding is behind.
  for (const mode of trail.MODES) assert.ok(trail.END[mode].map <= trail.MAP_CEILING);
  assert.ok(trail.END.catchup.map > trail.END.map.map);
  assert.ok(trail.MAP_CEILING < 1);
  // The walker never moves backwards along the route.
  let last = 0;
  for (const mode of trail.MODES) {
    for (let t = 0; t <= dur; t += 0.1) {
      const pos = at(mode, t).pos;
      assert.ok(pos >= last - 1e-9, `${mode} at ${t}`);
      last = pos;
    }
  }
});

test('Trail: geometry helpers', () => {
  const line: trail.Pt[] = [[0, 0], [10, 0], [10, 10]];
  assert.deepEqual(trail.pointAt(line, 0.5), { x: 10, y: 0, dir: 1 });
  assert.deepEqual(trail.pointAt(line, 2), { x: 10, y: 10, dir: 1 });
  assert.deepEqual(trail.slice(line, 0, 0.25), [[0, 0], [5, 0]]);
  assert.deepEqual(trail.slice(line, 0.5, 0.5), []);
  // The three stretches join end to end, in both worlds.
  assert.deepEqual(trail.onRoute(1), { ...trail.pointAt(trail.PAST, 1) });
  assert.deepEqual([trail.onRoute(1).x, trail.onRoute(1).y], trail.FORK);
  assert.deepEqual([trail.onRoute(2).x, trail.onRoute(2).y], trail.STOP);
  assert.deepEqual([trail.onRoute(3).x, trail.onRoute(3).y], trail.SUMMIT);
  assert.deepEqual([trail.onRouteL(1).x, trail.onRouteL(1).y], trail.FORK_L);
  assert.deepEqual([trail.onRouteL(2).x, trail.onRouteL(2).y], trail.STOP_L);
  assert.deepEqual([trail.onRouteL(3).x, trail.onRouteL(3).y], trail.SUMMIT_L);
  // The landscape world lies on the painting; the last chapter stop is the summit.
  for (const pt of [...trail.PAST_L, ...trail.FIRST_L, ...trail.STEEP_L]) {
    assert.ok(pt[0] >= 0 && pt[0] <= trail.PAINT.w && pt[1] >= 0 && pt[1] <= trail.PAINT.h);
  }
  assert.equal(trail.STOPS.length, 8);
  assert.equal(trail.STOPS.at(-1), 3);
});
