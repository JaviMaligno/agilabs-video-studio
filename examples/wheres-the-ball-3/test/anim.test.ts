import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as counter from '../src/anim/Counter.state.ts';
import * as bars from '../src/anim/BarCompare.state.ts';
import * as flow from '../src/anim/FlowDiagram.state.ts';
import * as quote from '../src/anim/KeyQuote.state.ts';
import * as grid from '../src/anim/StatGrid.state.ts';
import * as pitchPlay from '../src/anim/PitchPlayback.state.ts';
import * as cloud from '../src/anim/ConfidenceCloud.state.ts';
import * as box from '../src/anim/BlackBox.state.ts';
import * as chips from '../src/anim/FeatureChips.state.ts';
import * as ruler from '../src/anim/SkillRuler.state.ts';
import * as hole from '../src/anim/HoleTest.state.ts';
import * as card from '../src/anim/QuestionCard.state.ts';
import * as pitch from '../src/anim/pitch.ts';
import fs from 'node:fs';

const PLAY = JSON.parse(fs.readFileSync(new URL('../src/data/play.json', import.meta.url), 'utf8')) as pitch.PlayData;

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
  { name: 'BarCompare (title)', state: (t, b, d) => bars.frameState({ title: 'Error', bars: [{ label: 'A', value: 0.111, display: '0.111' }] }, t, b, d) },
];

// This video's components, with marks and without (the timeline may give none).
for (const marks of [[0.6, 1.8, 2.9, 3.5], undefined]) {
  const tag = marks ? '' : ' (no marks)';
  for (const mode of ['erase', 'net', 'verdict'] as const)
    CASES.push({ name: `PitchPlayback ${mode}${tag}`, state: (t, b, d) => pitchPlay.frameState({ mode, play: [1, 4], chip: 'c', marks }, t, b, d, PLAY) });
  for (const mode of ['hook', 'cloud', 'calibration', 'tangled', 'loose', 'blindspot'] as const)
    CASES.push({ name: `ConfidenceCloud ${mode}${tag}`, state: (t, b, d) => cloud.frameState({ mode, play: [2, 5], marks }, t, b, d, PLAY) });
  for (const mode of ['closed', 'drawers', 'stamps'] as const) CASES.push({ name: `BlackBox ${mode}${tag}`, state: (t, b, d) => box.frameState({ mode, marks }, t, b, d) });
  for (const mode of ['chips', 'importance'] as const)
    CASES.push({ name: `FeatureChips ${mode}${tag}`, state: (t, b, d) => chips.frameState({ mode, play: mode === 'chips' ? undefined : [0.6, 3.8], marks }, t, b, d, PLAY) });
  for (const mode of ['football', 'basketball'] as const) CASES.push({ name: `SkillRuler ${mode}${tag}`, state: (t, b, d) => ruler.frameState({ mode, marks }, t, b, d) });
  for (const mode of ['ring', 'rule', 'contrast'] as const) CASES.push({ name: `HoleTest ${mode}${tag}`, state: (t, b, d) => hole.frameState({ mode, marks }, t, b, d) });
}
// Play spans outside the data (clamped) and NaN.
CASES.push({ name: 'PitchPlayback (play past the data)', state: (t, b, d) => pitchPlay.frameState({ mode: 'erase', play: [-5, 99] }, t, b, d, PLAY) });
CASES.push({ name: 'ConfidenceCloud (NaN play)', state: (t, b, d) => cloud.frameState({ mode: 'hook', play: [Number.NaN, 3] }, t, b, d, PLAY) });

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

// ── This video's components.

test('PitchPlayback: the ball is erased, the box snaps onto it, the verdict marker lands on it', () => {
  const e0 = pitchPlay.frameState({ mode: 'erase', play: [5, 8], marks: [0.7, 3] }, 0.1, [0.3], 5, PLAY);
  assert.equal(e0.ball.opacity, 1);
  const e1 = pitchPlay.frameState({ mode: 'erase', play: [5, 8], marks: [0.7, 3] }, 5, [0.3], 5, PLAY);
  assert.equal(e1.ball.opacity, 0);
  assert.equal(e1.trail, 1);
  const n = pitchPlay.frameState({ mode: 'net', play: [9, 12], marks: [0.3, 3.6, 4.8] }, 6.6, [0.2], 6.6, PLAY);
  assert.equal(n.net.snap, 1);
  assert.ok(Math.hypot(n.net.x - n.ball.x, n.net.y - n.ball.y) < 1e-9);
  assert.ok(n.guesses.every((g) => g.cross === 1));
  // Before "frontier", no guess has dropped.
  assert.ok(pitchPlay.frameState({ mode: 'net', play: [9, 12], marks: [0.3, 3.6, 4.8] }, 3, [0.2], 6.6, PLAY).guesses.every((g) => g.drop === 0));
  const v = pitchPlay.frameState({ mode: 'verdict', play: [0.6, 4.2], marks: [2.4, 3.9, 5.6] }, 7.5, [0.3, 1.8], 7.5, PLAY);
  assert.equal(v.marker.land, 1);
  assert.ok(Math.hypot(v.marker.x - v.ball.x, v.marker.y - v.ball.y) < 1e-9);
  assert.equal(v.lid, 1);
});

test('ConfidenceCloud: very sure and far from the ball; the loose cloud shrinks while the miss grows', () => {
  const h = cloud.frameState({ mode: 'hook', play: [2.2, 6], marks: [2.8, 5] }, 6.8, [0.4], 6.8, PLAY);
  assert.equal(h.cloud.bright, 1);
  assert.equal(h.stamp, 1);
  assert.ok(Math.hypot(h.cloud.x - h.ball.x, h.cloud.y - h.ball.y) > 10, 'the confident guess is far from the ball');
  assert.equal(cloud.frameState({ mode: 'hook', play: [2.2, 6], marks: [2.8, 5] }, 4, [0.4], 6.8, PLAY).ball.opacity, 0);
  // Calibration: error climbs from most to least confident.
  const c = cloud.frameState({ mode: 'calibration', marks: [1.6, 3, 4.5] }, 8, [0.3, 4.4], 8, PLAY);
  for (let i = 1; i < c.steps.length; i++) assert.ok(c.steps[i].share > c.steps[i - 1].share);
  assert.ok(c.steps.every((s) => s.grow === 1));
  // Tangled: the weighted marker ends on the ball; loose: it lags behind.
  const t = cloud.frameState({ mode: 'tangled', marks: [1.6, 3, 4.5] }, 6.2, [0.3, 4.1], 6.2, PLAY);
  assert.ok(Math.hypot(t.left.marker.x - t.left.ball.x, t.left.marker.y - t.left.ball.y) < 1e-9);
  assert.equal(t.left.cross, 1);
  const l = cloud.frameState({ mode: 'loose', marks: [0.3, 1.8, 3.4] }, 5.7, [0.2], 5.7, PLAY);
  const lag = Math.hypot(l.right.marker.x - l.right.ball.x, l.right.marker.y - l.right.ball.y);
  assert.ok(lag > 6, `loose marker lags the ball (${lag})`);
  const b0 = cloud.frameState({ mode: 'blindspot', marks: [1.8, 3.8, 5.5] }, 0.5, [0.2, 3.2], 7.6, PLAY);
  const b1 = cloud.frameState({ mode: 'blindspot', marks: [1.8, 3.8, 5.5] }, 7.6, [0.2, 3.2], 7.6, PLAY);
  assert.ok(b1.right.cloud.r < b0.right.cloud.r, 'the cloud shrinks');
  const miss = (s: typeof b0) => Math.hypot(s.right.marker.x - s.right.ball.x, s.right.marker.y - s.right.ball.y);
  assert.ok(miss(b1) > miss(b0), 'the miss grows');
  // Hand-over: the end of "loose" is the start of "blindspot" (blend).
  assert.ok(Math.abs(l.right.ball.x - b0.right.ball.x) < 1e-9);
});

test('BlackBox: drawers outline and light; stamps read 92% · nothing · blind spot', () => {
  const d = box.frameState({ mode: 'drawers', marks: [1, 3.3] }, 5, [0.2, 2.2], 5);
  assert.equal(d.box?.drawers, 1);
  assert.deepEqual(d.box?.lit, [1, 1, 1]);
  assert.equal(d.box?.face, 0);
  const c = box.frameState({ mode: 'closed', marks: [0.8, 2.6, 3.8] }, 0.2, [0.3, 2], 5.3);
  assert.equal(c.box?.face, 1);
  assert.equal(c.answer, 0);
  const s = box.frameState({ mode: 'stamps', marks: [0.4, 3.3, 4.5] }, 6.8, [0.3, 2.2], 6.8);
  assert.deepEqual(s.rows.map((r) => r.stamp), ['92%', 'nothing', 'blind spot']);
  assert.equal(s.strip.miss, 1);
});

test('SkillRuler: 92% in football, 112% in basketball, exact text at the end', () => {
  const f = ruler.frameState({ mode: 'football', marks: [0.9, 2.7, 4.8, 5.5] }, 7.5, [0.3], 7.5);
  assert.equal(f.rulers[0].fill, 1);
  assert.equal(f.rulers[0].text, '92%');
  assert.equal(f.rulers[0].value, 92);
  assert.equal(f.rulers[1].appear, 0);
  const b = ruler.frameState({ mode: 'basketball', marks: [0.6, 2.5] }, 5, [0.2], 5);
  assert.equal(b.rulers[1].text, '112%');
  assert.equal(b.rulers[1].value, 112);
  assert.ok(b.rulers[1].share > 1, 'overshoots the right tick');
  assert.equal(b.rulers[0].fill, 1);
});

test('FeatureChips: chips light on their words; the speed-weighted centre towers', () => {
  const at = (t: number) => chips.frameState({ mode: 'chips', marks: [1.5, 3.9, 5] }, t, [0.3], 8, PLAY);
  assert.ok(at(1.4).chips.every((c) => c.appear === 0));
  assert.equal(at(8).chips.find((c) => c.id === 'centre')?.lit, 1);
  assert.equal(at(3.5).chips.find((c) => c.id === 'fastest')?.lit, 0);
  assert.ok(at(8).chips.every((c) => c.appear === 1));
  const i = chips.frameState({ mode: 'importance', play: [0.6, 3.8], marks: [0.4, 2.6, 4] }, 7.3, [0.3, 2.3], 7.3, PLAY);
  assert.equal(i.bars[0].share, 1);
  assert.ok(i.bars.slice(1).every((b) => b.share < 0.2));
  assert.equal(i.marker.land, 1);
});

test('HoleTest: hole, ring, ball? in turn; the rule card; shape has no ball, movement does', () => {
  const r = (t: number) => hole.frameState({ mode: 'ring', marks: [3.6, 4.8, 5.1] }, t, [0.3, 2.3], 6.5);
  assert.equal(r(3).hole, 0);
  assert.equal(r(6.5).lines, 1);
  assert.equal(r(6.5).ballQ, 1);
  assert.equal(hole.frameState({ mode: 'rule', marks: [0.6, 4] }, 6.5, [0.2, 2.5], 6.5).card, 1);
  const c = hole.frameState({ mode: 'contrast', marks: [1.8, 4.1] }, 6, [0.3, 2.8], 6);
  assert.equal(c.left.no, 1);
  assert.equal(c.right.yes, 1);
  assert.ok(Math.hypot(c.right.marker.x - c.right.ball.x, c.right.marker.y - c.right.ball.y) < 1e-9);
});

test('QuestionCard: numbered parts split into a disc and a line', () => {
  assert.deepEqual(card.splitQ('1 · geometry'), { kicker: '1', main: 'geometry' });
  assert.deepEqual(card.splitQ('What is it computing?'), { kicker: '', main: 'What is it computing?' });
  const track = card.cardTrack([{ anim: { props: { card: { q: 'A', stamp: { text: '92%', at: 1 } } } } }, { anim: { props: {} } }], [0, 5]);
  assert.equal(card.cardState(track, 3).stamp?.text, '92%');
  assert.equal(card.cardState(track, 9).opacity, 0);
});
