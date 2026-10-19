import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as counter from '../src/anim/Counter.state.ts';
import * as bars from '../src/anim/BarCompare.state.ts';
import * as flow from '../src/anim/FlowDiagram.state.ts';
import * as quote from '../src/anim/KeyQuote.state.ts';
import * as grid from '../src/anim/StatGrid.state.ts';
import * as card from '../src/anim/CipherCard.state.ts';
import * as gate from '../src/anim/RefusalGate.state.ts';
import * as sw from '../src/anim/SwitchPanel.state.ts';
import { morph, byFrequency } from '../src/anim/glyphs.ts';
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

for (const mode of ['scramble', 'ladder', 'break', 'rosetta'] as const) {
  CASES.push({ name: `CipherCard ${mode}`, state: (t, b, d) => card.frameState({ mode, hitAt: 2.4 }, t, b, d, DATA) });
}
CASES.push({ name: 'RefusalGate', state: (t, b, d) => gate.frameState({}, t, b, d, DATA) });
CASES.push({ name: 'SwitchPanel', state: (t, b, d) => sw.frameState({}, t, b, d) });

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

test('cipher data: the real task in all ten ciphers', () => {
  assert.equal(DATA.plain, 'name the capital of france');
  assert.equal(Object.keys(DATA.ciphers).length, 10);
  assert.equal(DATA.ciphers.rot13, 'anzr gur pncvgny bs senapr');
  for (const r of card.LADDER) assert.ok(DATA.ciphers[r.key], r.key);
  // The fast montage never shows base64 (filtered for GPT-5) nor the keyed / reversal ciphers.
  for (const k of card.FAST.map((f) => f.key)) assert.ok(!['base64', 'random_substitution', 'block_permutation', 'reverse_all'].includes(k), k);
});

test('morph: from at 0, to at 1, spaces kept', () => {
  const a = morph('ab cd', 'wx yz', 0, 1).map((g) => g.ch).join('');
  const b = morph('ab cd', 'wx yz', 1, 1).map((g) => g.ch).join('');
  assert.equal(a, 'ab cd');
  assert.equal(b, 'wx yz');
  assert.equal(morph('ab cd', 'wx yz', 0.5, 1)[2].ch, ' ');
  assert.deepEqual(byFrequency('ab b c'), ['b', 'a', 'c']);
});

test('CipherCard: scramble masks the card, hits the wall, and the masked card returns', () => {
  const s0 = card.frameState({ mode: 'scramble', hitAt: 2.5 }, 0, [0.1], 5, DATA) as card.ScrambleState;
  // The hook moves on the first frame: the card is visible and partly scrambled.
  assert.equal(s0.opacity, 1);
  const end = card.frameState({ mode: 'scramble', hitAt: 2.5 }, 5, [0.1], 5, DATA) as card.ScrambleState;
  assert.equal(end.glyphs.map((g) => g.ch).join(''), DATA.ciphers.random_substitution);
  assert.equal(end.chips.refused, 1);
  assert.equal(end.back, 1);
  assert.ok(end.fragments.every((f) => f.opacity === 0));
  const mid = card.frameState({ mode: 'scramble', hitAt: 2.5 }, 2.7, [0.1], 5, DATA) as card.ScrambleState;
  assert.ok(mid.fragments.some((f) => f.opacity > 0));
});

test('CipherCard: ladder ends with all ten rows and the oracle tick', () => {
  const s = card.frameState({ mode: 'ladder' }, 5, [0.2], 5, DATA) as card.LadderState;
  assert.equal(s.rows.length, 10);
  assert.ok(s.rows.every((r) => r.pop === 1));
  assert.equal(s.oracle.pop, 1);
  for (const r of s.rows) if (r.glyphs) assert.equal(r.glyphs.map((g) => g.ch).join(''), r.text);
});

test('CipherCard: break ends on the plaintext after five turns', () => {
  const s = card.frameState({ mode: 'break' }, 9, [0.2, 3.6], 9, DATA) as card.BreakState;
  assert.equal(s.slow.turn, card.TURNS);
  assert.equal(s.slow.glyphs.map((g) => g.ch).join(''), DATA.plain);
  assert.equal(s.slow.label, 1);
  // Mid-way: some letters locked, not all; the most frequent cipher letter locks first.
  const m = card.frameState({ mode: 'break' }, 3.6 + 1.6, [0.2, 3.6], 9, DATA) as card.BreakState;
  const locked = m.slow.glyphs.filter((g) => g.locked && g.ch !== ' ').length;
  assert.ok(locked > 0 && locked < DATA.plain.replace(/ /g, '').length, `locked ${locked}`);
  const top = byFrequency(DATA.ciphers.random_substitution)[0];
  const i = [...DATA.ciphers.random_substitution].indexOf(top);
  assert.ok(m.slow.glyphs[i].locked);
  // Fast montage: every card cracked to the plaintext with its turn-1 badge before the hero.
  const f = card.frameState({ mode: 'break' }, 3.4, [0.2, 3.6], 9, DATA) as card.BreakState;
  assert.ok(f.fast.cards.every((c) => c.crack === 1 && c.badge === 1));
});

test('CipherCard: rosetta unmasks the whole card and lands on 83%', () => {
  const s = card.frameState({ mode: 'rosetta' }, 6, [0.2], 6, DATA) as card.RosettaState;
  assert.equal(s.glyphs.map((g) => g.ch).join(''), DATA.plain);
  assert.equal(s.counter.text, '83%');
  assert.ok(s.links.length >= 8);
  const st = card.frameState({ mode: 'rosetta' }, 0.3, [0.2], 6, DATA) as card.RosettaState;
  assert.equal(st.counter.text, '61%');
});

test('RefusalGate: phases follow the beats; wall low on homoglyphs, near full on noise', () => {
  const beats = [0.2, 3.6, 6.2, 9.8];
  const p0 = gate.frameState({}, 2, beats, 15, DATA);
  assert.equal(p0.phase, 0);
  assert.ok(p0.refusal.pop > 0);
  const p1 = gate.frameState({}, 5.4, beats, 15, DATA);
  assert.equal(p1.phase, 1);
  assert.equal(p1.answer.pop, 1);
  assert.ok(p1.chips[0].lit === 1 && p1.chips[2].lit === 0);
  const lo = gate.frameState({}, 6.7, beats, 15, DATA);
  assert.equal(lo.phase, 2);
  assert.equal(lo.card.text, DATA.ciphers.cyrillic_homoglyph);
  const hi = gate.frameState({}, 9.6, beats, 15, DATA);
  assert.ok(hi.wall.level > 0.9 && lo.wall.level < 0.5, `${lo.wall.level} -> ${hi.wall.level}`);
  assert.equal(hi.card.text, DATA.ciphers.binary);
  const f = gate.frameState({}, 15, beats, 15, DATA);
  assert.equal(f.phase, 3);
  assert.equal(f.filter.stamp, 1);
  // The GPT-5 chip never lights up: the filter stops the card before the model.
  assert.equal(f.chips[2].lit, 0);
  assert.equal(f.chips[2].dim, 0);
  assert.equal(f.chips[0].dim, 1);
});

test('SwitchPanel: reply flips on after the prompt; Engage enters first and stays off', () => {
  const a = sw.frameState({}, 2.6, [0.2, 3.8], 8);
  assert.equal(a.understand.on, 1);
  assert.equal(a.reply.on, 1);
  assert.equal(a.reveal, 0);
  const e = sw.frameState({}, 8, [0.2, 3.8], 8);
  assert.equal(e.reveal, 1);
  assert.equal(e.engage.appear, 1);
  assert.equal(e.engage.on, 0);
  assert.equal(e.renumber, 1);
  const before = sw.frameState({}, 0.9, [0.2, 3.8], 8);
  assert.equal(before.reply.on, 0);
});
