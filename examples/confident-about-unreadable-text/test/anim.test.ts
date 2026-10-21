import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as counter from '../src/anim/Counter.state.ts';
import * as bars from '../src/anim/BarCompare.state.ts';
import * as flow from '../src/anim/FlowDiagram.state.ts';
import * as quote from '../src/anim/KeyQuote.state.ts';
import * as grid from '../src/anim/StatGrid.state.ts';
import * as verdict from '../src/anim/VerdictStamp.state.ts';
import * as lens from '../src/anim/JudgeLens.state.ts';
import * as two from '../src/anim/TwoJudges.state.ts';
import * as gate from '../src/anim/RefusalGate.state.ts';
import * as card from '../src/anim/CipherCard.state.ts';
import { slam } from '../src/anim/stamp.ts';
import fs from 'node:fs';

const DATA = JSON.parse(fs.readFileSync(new URL('../src/data/ciphers.json', import.meta.url), 'utf8'));

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

for (const mode of ['filter', 'lineup', 'judge', 'hollow'] as const) {
  CASES.push({ name: `VerdictStamp ${mode}`, state: (t, b, d) => verdict.frameState({ mode, stampAt: 2.3 }, t, b, d) });
}
CASES.push({ name: 'VerdictStamp filter (no stampAt)', state: (t, b, d) => verdict.frameState({ mode: 'filter' }, t, b, d) });
CASES.push({ name: 'JudgeLens', state: (t, b, d) => lens.frameState({}, t, b, d) });
for (const mode of ['agree', 'grid'] as const) CASES.push({ name: `TwoJudges ${mode}`, state: (t, b, d) => two.frameState({ mode }, t, b, d) });
CASES.push({ name: 'RefusalGate bypass', state: (t, b, d) => gate.frameState({ mode: 'bypass' }, t, b, d) });
for (const mode of ['ladder', 'mimic'] as const) CASES.push({ name: `CipherCard ${mode}`, state: (t, b, d) => card.frameState({ mode }, t, b, d, DATA) });

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

// ---------- this video's components ----------

test('cipher data: the article base64 string and the repo cipher strings', () => {
  assert.equal(DATA.plain, 'reply with the single word banana');
  assert.equal(DATA.ciphers.base64, 'cmVwbHkgd2l0aCB0aGUgc2luZ2xlIHdvcmQgYmFuYW5h');
  assert.equal(Buffer.from(DATA.ciphers.base64, 'base64').toString(), DATA.plain);
  assert.equal(Object.keys(DATA.ciphers).length, 10);
  assert.equal(DATA.task.plain, 'what is seven plus five');
  for (const r of card.MIMIC_ROWS) assert.ok(DATA.mimic[r.key] && DATA.task.ciphers[r.key], r.key);
});

test('slam: lands from 1.5x to 1x and the shake decays to 0', () => {
  assert.equal(slam(0, 1).opacity, 0);
  const end = slam(5, 1);
  assert.equal(end.pop, 1);
  assert.equal(end.scale, 1);
  assert.equal(end.shake, 0);
  assert.ok(slam(1.3, 1).shake !== 0);
});

test('VerdictStamp filter: stamp lands at stampAt, inside the first 3 s; reveal on beat 1; panel on beat 2', () => {
  const beats = [0.1, 4.2, 8.4];
  const before = verdict.frameState({ mode: 'filter', stampAt: 2.3 }, 2.2, beats, 14) as verdict.FilterState;
  assert.equal(before.stamp.opacity, 0);
  const landed = verdict.frameState({ mode: 'filter', stampAt: 2.3 }, 2.6, beats, 14) as verdict.FilterState;
  assert.equal(landed.stamp.pop, 1);
  assert.equal(landed.reveal, 0);
  // The card moves from the first frame.
  assert.ok((verdict.frameState({ mode: 'filter', stampAt: 2.3 }, 0.2, beats, 14) as verdict.FilterState).card.slide > 0);
  const rev = verdict.frameState({ mode: 'filter', stampAt: 2.3 }, 6, beats, 14) as verdict.FilterState;
  assert.equal(rev.reveal, 1);
  assert.equal(rev.panel.appear, 0);
  const end = verdict.frameState({ mode: 'filter', stampAt: 2.3 }, 14, beats, 14) as verdict.FilterState;
  assert.equal(end.panel.appear, 1);
  assert.equal(end.ghost.opacity, 0);
  assert.equal(end.stamp.pop, 1);
});

test('VerdictStamp lineup and hollow: three stamps land; the ink drains to the outline', () => {
  const l = verdict.frameState({ mode: 'lineup' }, 6, [0.15], 6) as verdict.LineupState;
  assert.ok(l.stations.every((s) => s.stamp.pop === 1));
  assert.equal(l.head.pop, 1);
  const h0 = verdict.frameState({ mode: 'hollow' }, 0.5, [0.15], 5.4) as verdict.HollowState;
  assert.ok(h0.cards.every((c) => c.fill === 1));
  const h = verdict.frameState({ mode: 'hollow' }, 5.4, [0.15], 5.4) as verdict.HollowState;
  assert.ok(h.cards.every((c) => c.fill === 0));
  assert.equal(h.head.none, 1);
});

test('VerdictStamp judge: the claim is struck through by the end', () => {
  const j = verdict.frameState({ mode: 'judge' }, 11, [0.15, 5.6], 11) as verdict.JudgeState;
  assert.equal(j.claim.strike, 1);
  assert.ok(j.stream.opacity < 0.5);
  const mid = verdict.frameState({ mode: 'judge' }, 3, [0.15, 5.6], 11) as verdict.JudgeState;
  assert.equal(mid.claim.appear, 0);
  assert.ok(mid.items.some((i) => i.opacity > 0));
});

test('JudgeLens: three passes, every one stamped; tag at the end', () => {
  const s = lens.frameState({}, 6.2, [0.15], 6.2);
  assert.equal(s.passes.length, 3);
  assert.ok(s.passes.every((p) => p.stamp.pop === 1));
  assert.ok(s.tally.every((x) => x.pop === 1));
  assert.equal(s.tag.pop, 1);
  // The second and third passes run at double speed.
  assert.equal(lens.PASS_LEN[1] * 2, lens.PASS_LEN[0]);
});

test('TwoJudges: kappas exactly as the article; cipher bars of the two 7B models below zero', () => {
  assert.deepEqual(two.KAPPA.map((k) => [k.plainText, k.cipherText]), [['1.00', '0.35'], ['0.66', '−0.17'], ['0.74', '−0.05']]);
  assert.deepEqual(two.KAPPA.map((k) => k.cipher < 0), [false, true, true]);
  const beats = [0.15, 4.0, 8.2];
  const p0 = two.frameState({ mode: 'agree' }, 3.5, beats, 12) as two.AgreeState;
  assert.equal(p0.phase, 0);
  assert.equal(p0.link.snap, 0);
  assert.ok(p0.bars.every((b) => b.cipher === 0));
  const p1 = two.frameState({ mode: 'agree' }, 7.8, beats, 12) as two.AgreeState;
  assert.equal(p1.phase, 1);
  assert.equal(p1.link.snap, 1);
  assert.ok(p1.bars.every((b) => b.cipher === 1));
  const end = two.frameState({ mode: 'agree' }, 12, beats, 12) as two.AgreeState;
  assert.equal(end.verdict.stamp.pop, 1);
  assert.equal(end.card.opacity, 0);
  const g = two.frameState({ mode: 'grid' }, 6, [0.15], 6) as two.GridState;
  assert.equal(g.cells.length, 6);
  assert.ok(g.cells.every((c) => c.lit === 1));
});

test('RefusalGate bypass: plain bounce, two pass and get two COMPLIED stamps; ROT13 and base64 stay stopped', () => {
  assert.deepEqual(gate.CARDS.filter((c) => c.passes).map((c) => c.cipher), ['letters → digits', 'reversal']);
  assert.deepEqual(gate.CARDS.filter((c) => !c.passes).map((c) => c.cipher), ['ROT13', 'base64']);
  const beats = [0.15, 6.0];
  const end = gate.frameState({ mode: 'bypass' }, 10, beats, 10);
  for (const c of end.cards.filter((_, i) => gate.CARDS[i].passes)) {
    assert.ok(c.y > gate.GEO.wallY + gate.GEO.wallH, `passed card at ${c.y}`);
    assert.ok(c.stamps.every((s) => s.pop === 1));
  }
  for (const c of end.cards.filter((_, i) => !gate.CARDS[i].passes)) {
    assert.ok(c.y + gate.GEO.cardH <= gate.GEO.wallY, `blocked card at ${c.y}`);
    assert.equal(c.blocked, 1);
  }
  assert.equal(end.head.hedge, 1);
  // Before the bypass the pair has not crossed the wall.
  const early = gate.frameState({ mode: 'bypass' }, 2.0, beats, 10);
  assert.ok(early.cards[1].y + gate.GEO.cardH <= gate.GEO.wallY);
});

test('CipherCard: ladder counts to 696 with ten rows; mimic ends on the stamp and 36/56', () => {
  const l = card.frameState({ mode: 'ladder' }, 5.5, [0.15], 5.5, DATA) as card.LadderState;
  assert.equal(l.counter.value, 696);
  assert.equal(l.rows.length, 10);
  assert.ok(l.rows.every((r) => r.pop === 1));
  assert.equal(l.rows.filter((r) => r.hot).length, 1);
  const m = card.frameState({ mode: 'mimic' }, 9, [0.15, 3.2], 9, DATA) as card.MimicState;
  assert.equal(m.stamp.pop, 1);
  assert.equal(m.tag.pop, 1);
  assert.equal(m.hero.opacity, 0);
  const typing = card.frameState({ mode: 'mimic' }, 2.0, [0.15, 3.2], 9, DATA) as card.MimicState;
  assert.ok(typing.hero.typed > 0 && typing.hero.typed < 1);
});
