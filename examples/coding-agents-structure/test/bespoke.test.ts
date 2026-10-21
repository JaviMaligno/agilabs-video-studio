// Tests of this video's bespoke components: BridgeCrew, SeedBars, SliceGrid and the question card.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as bridge from '../src/anim/BridgeCrew.state.ts';
import * as seeds from '../src/anim/SeedBars.state.ts';
import * as slice from '../src/anim/SliceGrid.state.ts';
import * as card from '../src/anim/QuestionCard.state.ts';
import { resolveMark } from '../src/marks.ts';

const PROGRESS = new Set(['progress', 'appear', 'grow', 'fill', 'draw', 'pop', 'opacity', 'emphasis', 'lift', 'received', 'glow', 'chip', 'stamp', 'foot', 'radio', 'lit', 'dim', 'headline', 'width', 'flash']);

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

const MODES: bridge.Mode[] = ['hook', 'paper', 'humans', 'setup', 'clash', 'ladder', 'handshake', 'silence', 'fences', 'owner', 'sequence', 'integrator', 'verdict'];
const LADDER: bridge.LadderSpec = { done: { talk: 'cross' }, glow: ['files'], accent: ['seq', 'int'], add: [{ id: 'files', mark: 'tilde' }] };

type Case = { name: string; state: (t: number, beats: number[], dur: number) => unknown };
const CASES: Case[] = [
  ...MODES.flatMap((mode): Case[] => [
    { name: `BridgeCrew ${mode}`, state: (t, b, d) => bridge.frameState({ mode, marks: b.map((x) => x + 0.4), ladder: LADDER }, t, b, d) },
    { name: `BridgeCrew ${mode} (no marks)`, state: (t, b, d) => bridge.frameState({ mode }, t, b, d) },
    { name: `BridgeCrew ${mode} (bad marks)`, state: (t, b, d) => bridge.frameState({ mode, marks: [Number.NaN, -1, 99] }, t, b, d) },
  ]),
  {
    name: 'SeedBars',
    state: (t, b, d) =>
      seeds.frameState(
        {
          model: 'm',
          bars: [
            { label: 'a', value: 30, display: '30 %', range: '[21–37]', seeds: [7, 4, 6], at: 0 },
            { label: 'b', value: 35, display: '35 %', range: '[32–37]', seeds: [6, 7, 7], tone: 'accent' },
          ],
          reference: { value: 30, label: 'alone 30 %' },
          note: 'n',
          tag: 'x',
          marks: [-1, 1.2, 2],
          refMark: 0.5,
        },
        t,
        b,
        d,
      ),
  },
  { name: 'SeedBars (empty)', state: (t, b, d) => seeds.frameState({ model: 'm', bars: [] }, t, b, d) },
  { name: 'SliceGrid', state: (t, b, d) => slice.frameState({ total: 652, lit: 19, stats: ['5 repos', '3 runs', '2 models'], marks: [0.5, 1.5, 2.5] }, t, b, d) },
  { name: 'SliceGrid (no marks)', state: (t, b, d) => slice.frameState({ total: 40, lit: 50, stats: [] }, t, b, d) },
];

const SCENARIOS = [
  { beats: [0.3, 1.4, 2.6], dur: 4 },
  { beats: [], dur: 4 },
  { beats: [1, 9], dur: 4 },
  { beats: [0], dur: 0.5 },
];

test('bespoke components are total over [0, sceneEnd]', () => {
  for (const c of CASES) {
    for (const { beats, dur } of SCENARIOS) {
      for (const t of [-1, 0, ...beats, dur / 3, dur / 2, dur, dur + 2]) check(c.state(t, beats, dur), `${c.name}@t=${t},dur=${dur},beats=[${beats}]`);
    }
  }
});

test('BridgeCrew: nothing before the scene, the result shown at the end', () => {
  const end = (mode: bridge.Mode) => bridge.frameState({ mode, ladder: LADDER }, 5, [0.1], 5);
  // Hook: one agent passes, two agents jam and fail.
  const h = end('hook');
  assert.deepEqual(h.titles.map((x) => [x.mark, x.pop]), [['tick', 1], ['cross', 1]]);
  assert.equal(h.sparks[0].pop, 1);
  // Clash: the halves arrive at different heights; fences: flush, no spark, but the deck cracks.
  const c = end('clash');
  assert.notEqual(c.spans[1].y0, c.spans[0].y1);
  const f = end('fences');
  assert.equal(f.spans[1].y0, f.spans[0].y1);
  assert.equal(f.sparks.length, 0);
  assert.equal(f.cracks[0].draw, 1);
  assert.equal(f.marks[0].kind, 'cross');
  // Sequence and integrator: the truck reaches the far bank with a tick.
  for (const m of ['sequence', 'integrator'] as const) {
    const s = end(m);
    assert.ok(s.trucks[0].x >= 840);
    assert.equal(s.marks[0].kind, 'tick');
    assert.equal(s.marks[0].pop, 1);
  }
  // Owner and integrator: one accent crew stands on the join.
  for (const m of ['owner', 'integrator', 'verdict'] as const) {
    const owner = end(m).crews.find((x) => x.tone === 'c');
    assert.ok(owner && owner.opacity === 1 && (m === 'integrator' || owner.x === bridge.J));
  }
  // The ladder keeps earlier marks and lands this scene's.
  const l = end('fences').ladder!;
  assert.equal(l.rungs.find((r) => r.id === 'talk')!.mark, 'cross');
  assert.equal(l.rungs.find((r) => r.id === 'files')!.pop, 1);
  // Before the scene, the timed things are not shown.
  const early = bridge.frameState({ mode: 'setup', marks: [1, 2, 3, 4] }, 0, [0], 6);
  assert.equal(early.tags.every((x) => x.opacity === 0), true);
  // Silence: B walks off and its radio goes dark.
  const s = end('silence');
  assert.equal(s.crews[1].opacity, 0);
  assert.equal(s.bubbles.every((b) => b.opacity === 1 && b.received === 1), true);
});

test('SeedBars: dots sit at the per-seed pass rates', () => {
  const s = seeds.frameState({ model: 'm', bars: [{ label: 'a', value: 30, display: '30 %', range: '', seeds: [7, 4, 6] }] }, 9, [0], 9);
  assert.deepEqual(s.bars[0].dots.map((d) => +(d.x * 45).toFixed(2)), [36.84, 21.05, 31.58]);
  assert.ok(Math.abs(s.bars[0].width - 30 / 45) < 1e-9);
});

test('SliceGrid: exactly the lit tiles light up', () => {
  assert.equal(slice.litIndices(652, 19).length, 19);
  const s = slice.frameState({ total: 652, lit: 19, stats: ['a'] }, 9, [0], 9);
  assert.equal(s.tiles.length, 652);
  assert.equal(s.tiles.filter((x) => x.on).length, 19);
});

test('QuestionCard: arrives on its word, the stamp stays until the outro', () => {
  const scenes = [{}, { anim: { props: { card: { q: 'Q?', inAt: 2 } } } }, { anim: { props: { card: { q: 'Q?', stamp: { text: 'yes', at: 1 } } } } }, { anim: { props: { card: { q: 'Q?' } } } }, {}];
  const track = card.cardTrack(scenes, [0, 5, 10, 15, 20]);
  assert.equal(card.cardState(track, 6).opacity, 0);
  assert.equal(card.cardState(track, 7.5).opacity, 1);
  assert.equal(card.cardState(track, 10.5).stamp, null);
  assert.equal(card.cardState(track, 12).stamp?.text, 'yes');
  assert.equal(card.cardState(track, 16).stamp?.text, 'yes');
  assert.equal(card.cardState(track, 25).opacity, 0);
});

test('marks resolve to the spoken word', () => {
  const lines = [{ key: 'x-01', start: 0.2, dur: 2, text: { en: 'So I tested structure.', es: '' }, voice: 'en' as const }];
  const words = { 'x-01': [['So', 0.1, 0.2], ['structure.', 1.0, 1.5]] as [string, number, number][] };
  assert.equal(resolveMark(lines, [0, 'structure'], words, 'en'), 1.2);
});
