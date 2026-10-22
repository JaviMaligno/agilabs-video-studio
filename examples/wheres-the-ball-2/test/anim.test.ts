import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as counter from '../src/anim/Counter.state.ts';
import * as bars from '../src/anim/BarCompare.state.ts';
import * as flow from '../src/anim/FlowDiagram.state.ts';
import * as quote from '../src/anim/KeyQuote.state.ts';
import * as grid from '../src/anim/StatGrid.state.ts';
import * as story from '../src/anim/StoryPitch.state.ts';
import * as reader from '../src/anim/ReaderGrid.state.ts';
import * as flip from '../src/anim/CameraFlip.state.ts';
import * as sport from '../src/anim/SportScale.state.ts';
import type { PlayData } from '../src/anim/pitch.ts';
import fs from 'node:fs';

const PLAY = JSON.parse(fs.readFileSync(new URL('../src/data/play.json', import.meta.url), 'utf8')) as PlayData;

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

for (const mode of story.STORY_MODES) {
  CASES.push({ name: `StoryPitch ${mode}`, state: (t, b, d) => story.frameState({ mode, play: [1, 4] }, t, b, d, PLAY) });
}
for (const mode of reader.GRID_MODES) {
  CASES.push({ name: `ReaderGrid ${mode}`, state: (t, b, d) => reader.frameState({ mode, cues: { tracks: 1.2, pixels: 9, coin: Number.NaN } }, t, b, d) });
  CASES.push({ name: `ReaderGrid ${mode} (no cues)`, state: (t, b, d) => reader.frameState({ mode }, t, b, d) });
}
for (const mode of flip.FLIP_MODES) {
  CASES.push({ name: `CameraFlip ${mode}`, state: (t, b, d) => flip.frameState({ mode, cues: { screen: 1, pitch: 7 } }, t, b, d) });
}
for (const mode of sport.SPORT_MODES) {
  CASES.push({ name: `SportScale ${mode}`, state: (t, b, d) => sport.frameState({ mode, cues: { times: 2, out: 0.5, both: 1 } }, t, b, d) });
}

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

test('StoryPitch: ball hidden in part 1, flashed at the TV frame edge, gone in the doubt; the box ticks', () => {
  const p1 = story.frameState({ mode: 'part1', play: [0, 4] }, 2, [0.3], 5.6, PLAY);
  assert.equal(p1.ball.opacity, 0);
  assert.equal(p1.question.opacity, 1);
  assert.equal(p1.frame.opacity, 0);
  const mid = story.frameState({ mode: 'middle', play: [4, 4.4] }, 6.2, [0.2], 6.2, PLAY);
  assert.equal(mid.ball.opacity, 1);
  assert.equal(mid.frame.draw, 1);
  // The guesses settle on the frame's centre; the ball sits inside the frame, near its right edge.
  for (const g of mid.guesses) assert.ok(Math.hypot(g.x - story.FRAME_CENTRE.x, g.y - story.FRAME_CENTRE.y) < 4);
  assert.ok(mid.ball.x > story.FRAME.x + story.FRAME.w * 0.8 && mid.ball.x < story.FRAME.x + story.FRAME.w);
  assert.ok(mid.ball.y > story.FRAME.y && mid.ball.y < story.FRAME.y + story.FRAME.h);
  // Before its time the ball is not there.
  assert.equal(story.frameState({ mode: 'middle', play: [4, 4.4] }, 1.5, [0.2], 6.2, PLAY).ball.opacity, 0);
  const doubt = story.frameState({ mode: 'doubt', play: [4.4, 4.4] }, 4.6, [0.2, 2.07], 4.6, PLAY);
  assert.equal(doubt.ball.opacity, 0);
  assert.equal(doubt.ghost, 1);
  assert.equal(doubt.tag.opacity, 1);
  const test1 = story.frameState({ mode: 'test', play: [4.4, 4.4] }, 3, [0.15], 3, PLAY);
  assert.equal(test1.bigQ.box, 1);
  assert.equal(test1.bigQ.tick, 1);
});

test('StoryPitch: the play comes to rest at the hand-over, where the next scene picks it up', () => {
  assert.equal(story.playShare(0, 5), 0);
  assert.ok(Math.abs(story.playShare(4.4, 5) - 1) < 1e-9);
  assert.equal(story.playShare(5, 5), 1);
  for (let t = 0.1; t < 5; t += 0.1) assert.ok(story.playShare(t, 5) >= story.playShare(t - 0.1, 5));
  // Nearly still just before the hand-over.
  assert.ok(story.playShare(4.4, 5) - story.playShare(4.3, 5) < 0.01);
  const a = story.frameState({ mode: 'part1', play: [0, 4] }, 5.6, [0.3], 5.6, PLAY);
  const b = story.frameState({ mode: 'middle', play: [4, 4.4] }, 0, [0.2], 6.2, PLAY);
  assert.equal(a.playT, 4);
  assert.equal(b.playT, 4);
});

test('ReaderGrid: the article figures, filled on their words; each mode starts where the last ended', () => {
  assert.deepEqual(
    reader.CELLS.map((c) => c.display),
    ['74%', '82%', '53%', '35–38%'],
  );
  const end = reader.frameState({ mode: 'verdict' }, 9, [0.15, 2, 3.7], 9);
  assert.deepEqual(
    end.cells.map((c) => c.text),
    ['74%', '82%', '53%', '35–38%'],
  );
  assert.ok(end.cells.every((c) => c.fill === 1));
  // Trained row above the coin-flip line, frontier pixels at it, frontier tracks below.
  assert.deepEqual(
    end.cells.map((c) => c.above),
    [true, true, true, false],
  );
  assert.equal(end.verdict.training, 1);
  assert.equal(end.verdict.input, 1);
  assert.ok(end.notes.every((n) => n.opacity === 0));
  // The 82% fills on its cue, not before.
  const before = reader.frameState({ mode: 'trained', cues: { tracks: 2, pixels: 3.2 } }, 1.9, [0.15, 1.9], 6.8);
  assert.equal(before.cells[1].fill, 0);
  const after = reader.frameState({ mode: 'trained', cues: { tracks: 2, pixels: 3.2 } }, 3.0, [0.15, 1.9], 6.8);
  assert.equal(after.cells[1].fill, 1);
  assert.equal(after.cells[1].text, '82%');
  assert.equal(after.cells[0].fill, 0);
  // Continuity: the first frame of each mode equals the last frame of the one before.
  for (let i = 1; i < reader.GRID_MODES.length; i++) {
    const prev = reader.frameState({ mode: reader.GRID_MODES[i - 1] }, 20, [0.2, 2, 4], 20);
    const next = reader.frameState({ mode: reader.GRID_MODES[i] }, 0, [0.2, 2, 4], 20);
    assert.deepEqual(next.cells, prev.cells, `${reader.GRID_MODES[i]} cells`);
    assert.deepEqual(next.rows.map((r) => r.opacity), prev.rows.map((r) => r.opacity));
    assert.deepEqual(next.headers, prev.headers);
  }
});

test('CameraFlip: on screen the ball and the players sit at opposite edges; the dial ends on the article figures', () => {
  const end = flip.playAt(4);
  const left = end.cam.x - flip.CAM.w / 2;
  const right = end.cam.x + flip.CAM.w / 2;
  assert.ok(end.ball.x < right && end.ball.x > right - 4, 'ball at the right edge');
  assert.ok(end.centroid.x < left + 8 && end.centroid.x > left, "players' centre near the left edge");
  // Ball flies ahead of the players.
  assert.ok(end.ball.x - end.centroid.x > 25);
  const screen = flip.frameState({ mode: 'flip', cues: { screen: 1, pitch: 7 } }, 5, [0.15, 6], 9.8);
  assert.ok(Math.abs(screen.dial.needle - flip.ON_SCREEN.value) < 1e-9);
  assert.equal(screen.cam.lift, 0);
  const pitch = flip.frameState({ mode: 'flip', cues: { screen: 1, pitch: 7 } }, 9.8, [0.15, 6], 9.8);
  assert.ok(Math.abs(pitch.dial.needle - flip.ON_PITCH.value) < 1e-9);
  assert.equal(pitch.cam.opacity, 0);
  assert.equal(flip.ON_SCREEN.text, '−0.58');
  assert.equal(flip.ON_PITCH.text, '+0.83');
  const sign = flip.frameState({ mode: 'sign' }, 3.6, [0.15], 3.6);
  assert.equal(sign.sign.line2, 1);
  assert.equal(sign.dial.needle, flip.ON_PITCH.value);
});

test('SportScale: the court is a quarter of the pitch length; in the same box its arrows are 3–4× longer', () => {
  const ratio = sport.PITCH_M.w / sport.COURT_M.w;
  assert.ok(ratio >= 3 && ratio <= 4, `length ratio ${ratio}`);
  const area = (sport.PITCH_M.w * sport.PITCH_M.h) / (sport.COURT_M.w * sport.COURT_M.h);
  assert.ok(area > 15 && area < 18, `area ratio ${area}`);
  const s = sport.frameState({ mode: 'speed', cues: { times: 3 } }, 7.8, [0.15, 2.2], 7.8);
  for (const r of s.runners) assert.ok(Math.abs(r.court.du / r.pitch.du - ratio) < 1e-9);
  assert.equal(s.morph, 1);
  assert.equal(s.arrows.opacity, 1);
  assert.equal(s.times.opacity, 1);
  // Runners and arrow tips stay inside the field.
  for (const r of s.runners) {
    assert.ok(r.u + r.court.du <= 1 && r.u + r.court.du >= 0);
    assert.ok(r.v + r.court.dv <= 1 && r.v + r.court.dv >= 0);
  }
  const pos = sport.frameState({ mode: 'positions', cues: { out: 1, both: 1.6 } }, 6.4, [0.15], 6.4);
  assert.equal(pos.arrows.opacity, 0);
  assert.equal(pos.positions.opacity, 1);
  assert.equal(pos.caveat.opacity, 1);
  assert.equal(pos.times.opacity, 0);
  // The transfer cards: works on beat 0, fails on beat 1; gone once the fields are squeezed.
  const tr = sport.frameState({ mode: 'transfer' }, 2, [0.15, 3.7], 6.6);
  assert.ok(tr.works.opacity > 0.99 && tr.fails.opacity === 0);
  assert.equal(s.works.opacity, 0);
});
