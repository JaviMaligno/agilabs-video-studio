import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as tiles from '../src/anim/CoverageTiles.state.ts';
import * as band from '../src/anim/ToleranceBand.state.ts';
import * as range from '../src/anim/LabelRange.state.ts';
import * as ladder from '../src/anim/VersionLadder.state.ts';
import * as story from '../src/anim/StoryPaper.state.ts';

const PROGRESS = new Set(['progress', 'appear', 'grow', 'fill', 'draw', 'pop', 'opacity', 'emphasis', 'cover', 'away', 'lift', 'reveal', 'stroke', 'green', 'rose', 'corner', 'red', 'glint', 'spread', 'pull', 'stamp', 'card', 'cardAppear', 'arrow', 'dim', 'eps', 'lit', 'gap', 'drop', 'detail', 'footnote', 'glow', 'tag', 'sub', 'chipStamp', 'hot', 'ci', 'zeroTag', 'harmless', 'greenRun', 'note', 'sampled', 'reviewer', 'axis', 'slide', 'bar', 'pulse', 'spread', 'tick']);

const check = (value: unknown, path: string) => {
  if (typeof value === 'number') {
    assert.ok(Number.isFinite(value), `${path} is ${value}`);
    const key = path.split('.').at(-1)!.replace(/\[\d+\]$/, '');
    if (PROGRESS.has(key)) assert.ok(value >= 0 && value <= 1, `${path} = ${value} is outside [0, 1]`);
  } else if (Array.isArray(value)) value.forEach((v, i) => check(v, `${path}[${i}]`));
  else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) check(v, `${path}.${k}`);
};

const MODES: tiles.TilesMode[] = ['same', 'lift', 'stamp', 'focus', 'boxes', 'reviewer', 'refute', 'v2', 'software', 'close'];
const CASES: { name: string; state: (t: number, b: number[], d: number) => unknown }[] = [
  ...MODES.map((mode) => ({ name: `CoverageTiles ${mode}`, state: (t: number, b: number[], d: number) => tiles.frameState({ mode }, t, b, d) })),
  { name: 'CoverageTiles cues', state: (t, b, d) => tiles.frameState({ mode: 'lift', cue: { silent: 2, drop: 3 } }, t, b, d) },
  { name: 'ToleranceBand mechanism', state: (t, b, d) => band.frameState({ mode: 'mechanism' }, t, b, d) },
  { name: 'ToleranceBand verdict', state: (t, b, d) => band.frameState({ mode: 'verdict', cue: { stamp: 1 } }, t, b, d) },
  { name: 'LabelRange range', state: (t, b, d) => range.frameState({ mode: 'range' }, t, b, d) },
  { name: 'LabelRange quote', state: (t, b, d) => range.frameState({ mode: 'quote' }, t, b, d) },
  { name: 'VersionLadder', state: (t, b, d) => ladder.frameState({}, t, b, d) },
  { name: 'StoryPaper', state: (t, b, d) => story.frameState({}, t, b, d) },
  { name: 'StoryPaper cues', state: (t, b, d) => story.frameState({ cue: { sixty: 1, pan: 2, proved: 3, computer: 3.5, samples: 4, print: 4.5, same: 5, worth: 6 } }, t, b, d) },
];
const SCENARIOS = [
  { beats: [0.3, 1.4, 2.6, 3.5], dur: 5 },
  { beats: [], dur: 4 },
  { beats: [1, 9], dur: 4 },
  { beats: [0], dur: 0.5 },
];

test('bespoke components are total over [0, sceneEnd]', () => {
  for (const c of CASES)
    for (const { beats, dur } of SCENARIOS)
      for (const t of [-1, 0, ...beats, dur / 2, dur, dur + 2]) check(c.state(t, beats, dur), `${c.name}@t=${t},dur=${dur}`);
});

test('CoverageTiles: identical covered cards with ticks in the cold open, all lifted by the last beat', () => {
  const s = tiles.frameState({ mode: 'same' }, 0, [0.2], 3);
  assert.ok(s.tiles.every((x) => x.opacity === 0));
  const end = tiles.frameState({ mode: 'same' }, 3, [0.2], 3);
  assert.ok(end.tiles.every((x) => x.opacity === 1 && x.cover === 1 && x.tick.appear === 1));
  // lift: card i lifts on beat i; by the end all have dropped back (identical again)
  const beats = [0.2, 1.6, 3.0, 4.4];
  const mid = tiles.frameState({ mode: 'lift' }, 6.3, beats, 8);
  assert.ok(mid.tiles.every((x) => x.cover < 0.05), 'all four lifted after the fourth beat');
  assert.equal(mid.tiles[3].pattern.count, '10,000,000');
  const fin = tiles.frameState({ mode: 'stamp' }, 3, [0.1], 5);
  assert.ok(fin.tiles.every((x) => x.cover === 1));
});

test('CoverageTiles: the hook reads the card out, one card after another, ticks beat together', () => {
  const p = { mode: 'same' as const, cue: { four: 3, holds: 4.5, whole: 5.25 } };
  const beats = [0.15, 2.6];
  const at = (t: number) => tiles.frameState(p, t, beats, 8);
  assert.ok(at(2.9).tiles.every((x) => x.card.lit === 0 && x.card.pulse === 0), 'nothing lit before "four"');
  assert.ok(at(2.5).title!.words.every((w) => w.lit === 1), 'title lit before the second line');
  const mid = at(3.75 + 0.35);
  assert.ok(mid.tiles[1].card.pulse > 0.5 && mid.tiles[3].card.pulse === 0, 'card 2 sways on "inequality", card 4 not yet');
  assert.ok(at(4.8).tiles.every((x) => x.tick.pulse === 1));
  const held = at(6.5);
  assert.ok(held.tiles.every((x) => x.card.lit === 1 && x.card.pulse === 0 && x.tick.pulse === 0 && x.opacity === 1), 'all readable and still at the hold');
});

test('CoverageTiles: stamps strongest to weakest, tally counts refutations', () => {
  const s = tiles.frameState({ mode: 'stamp' }, 10, [0.1], 4);
  assert.deepEqual(s.tiles.map((x) => x.stamp.text), ['PROVED', 'BOX-CERTIFIED', 'GRID-SWEPT', 'SAMPLED']);
  assert.ok(s.tiles.every((x) => x.stamp.pop === 1));
  assert.equal(tiles.frameState({ mode: 'refute', cue: { refute: 1 } }, 0.5, [0.1], 5).tally?.value, 0);
  assert.equal(tiles.frameState({ mode: 'refute', cue: { refute: 1 } }, 5, [0.1], 5).tally?.value, 1);
  const v2 = tiles.frameState({ mode: 'v2' }, 6, [0.1], 6);
  assert.equal(v2.test?.eps, 1);
  assert.ok(v2.tiles[1].pattern.cells.every((c) => c.green === 1 && c.rose === 0));
});

test('ToleranceBand: only boxes near φ dip below zero, all inside the ε band; the band flips them', () => {
  const below = band.boxes.filter((b) => b.below);
  assert.ok(below.length >= 2 && below.length <= 4, `${below.length} boxes below zero`);
  assert.ok(below.every((b) => b.inBand), 'every dip is inside the band');
  assert.ok(band.boxes.filter((b) => !b.below).every((b) => b.floor >= 0));
  const beats = [0.2, 3.6, 5.2, 9];
  const before = band.frameState({ mode: 'mechanism' }, 5.0, beats, 13);
  assert.ok(before.strip.boxes.some((b) => b.red > 0.9));
  const after = band.frameState({ mode: 'mechanism' }, 8.8, beats, 13);
  assert.ok(after.strip.boxes.every((b) => b.red === 0 && b.green === 1));
  const v = band.frameState({ mode: 'verdict' }, 10, [0.1], 4);
  assert.equal(v.tally.value, 2);
  assert.equal(v.verdict?.stamp, 1);
});

test('LabelRange: PROVED ends at α ≥ 1 with the gap shown; ladder ends at refuted 3', () => {
  const s = range.frameState({ mode: 'range' }, 10, [0.1, 2.5], 5);
  assert.equal(s.stamp.x0, range.ONE);
  assert.equal(s.gap, 1);
  const l = ladder.frameState({}, 9, [0.1], 6);
  assert.equal(l.tally.value, 3);
  assert.ok(l.rows.every((r) => r.pop === 1));
  assert.equal(l.footnote, 1);
});

test('StoryPaper: nothing before the scene, identical ticks on every claim, backing hidden in print and back with falling weight', () => {
  const beats = [0.15, 4.2, 8.5];
  const dur = 12.5;
  const before = story.frameState({}, -1, beats, dur);
  assert.equal(before.page.appear, 0);
  assert.ok(before.badges.every((b) => b.appear === 0));
  const shown = story.frameState({}, beats[2] - 0.1, beats, dur);
  assert.ok(shown.badges.every((b) => b.appear > 0.99 && b.slide === 0));
  const hidden = story.frameState({ cue: { print: 8.7, worth: 10.6 } }, 10.4, beats, dur);
  assert.ok(hidden.badges.every((b) => b.slide > 0.99));
  assert.ok(hidden.rows.every((r) => r.tick === 1));
  const end = story.frameState({}, dur, beats, dur);
  assert.ok(end.badges.every((b) => b.slide === 0 && b.bar === 1 && b.appear === 1));
  const w = story.BACKING.map((b) => b.weight);
  assert.ok(w[0] > w[1] && w[1] > w[2]);
});
