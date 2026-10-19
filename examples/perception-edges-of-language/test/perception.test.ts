import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as fade from '../src/anim/FadeCard.state.ts';
import * as lens from '../src/anim/ThresholdLens.state.ts';
import * as ghost from '../src/anim/GhostWriter.state.ts';
import * as hidden from '../src/anim/HiddenInstruction.state.ts';
import * as quote from '../src/anim/ContrastQuote.state.ts';
import { HUMAN, LADDER, R_MIN, SENTENCE, greyOf, ratioAt, rulerPos } from '../src/anim/perception.ts';

const PROGRESS = new Set(['progress', 'appear', 'grow', 'fill', 'draw', 'pop', 'opacity', 'emphasis', 'quality', 'eye', 'highlight', 'dim', 'five', 'zoom', 'labels', 'flip', 'banana', 'split', 'breath', 'card', 'layers', 'strike', 'glow', 'typed', 'chips', 'gridOpacity', 'cardOpacity']);

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
  ...(['hook', 'roster', 'ladder', 'machines', 'floor', 'read'] as const).map((mode) => ({
    name: `FadeCard ${mode}`,
    state: (t: number, b: number[], d: number) => fade.frameState({ mode }, t, b, d),
  })),
  { name: 'ThresholdLens', state: (t, b, d) => lens.frameState({}, t, b, d) },
  { name: 'GhostWriter', state: (t, b, d) => ghost.frameState({}, t, b, d) },
  ...(['write', 'stego', 'faint', 'qwen'] as const).map((mode) => ({
    name: `HiddenInstruction ${mode}`,
    state: (t: number, b: number[], d: number) => hidden.frameState({ mode }, t, b, d),
  })),
  ...(['steg', 'contrast'] as const).map((mode) => ({
    name: `ContrastQuote ${mode}`,
    state: (t: number, b: number[], d: number) => quote.frameState({ mode }, t, b, d),
  })),
];

const SCENARIOS = [
  { beats: [0.3, 1.4, 2.6], dur: 4 },
  { beats: [], dur: 4 },
  { beats: [1, 9], dur: 4 },
  { beats: [0], dur: 0.5 },
];

test('perception components are total over [0, sceneEnd]', () => {
  for (const c of CASES)
    for (const { beats, dur } of SCENARIOS)
      for (const t of [-1, 0, ...beats, dur / 2, dur, dur + 2]) check(c.state(t, beats, dur), `${c.name}@t=${t},dur=${dur},beats=[${beats}]`);
});

test("the ladder ticks reproduce the study's greys", () => {
  assert.deepEqual(LADDER.map(greyOf), [0, 245, 250, 252, 253, 253, 254]);
  assert.equal(greyOf(R_MIN), 254);
  assert.ok(Math.abs(ratioAt(rulerPos(0.03)) - 0.03) < 1e-9);
});

const HOOK_BEATS = [0.15, 2.0, 3.12];
const frames = (dur: number) => Array.from({ length: Math.round(dur * 30) + 1 }, (_, f) => f / 30);

test('hook: black at the start, the blank 254 card at the end, two machines typed', () => {
  const start = fade.frameState({ mode: 'hook' }, 0, HOOK_BEATS, 6);
  assert.ok(start.glyphs.every((g) => g.grey === 0));
  const end = fade.frameState({ mode: 'hook' }, 6, HOOK_BEATS, 6);
  assert.ok(end.glyphs.every((g) => g.grey === 254));
  assert.equal(end.marker.grey, 254);
  const ids = end.readers.filter((r) => r.appear > 0).map((r) => r.id);
  assert.deepEqual(ids.sort(), ['gpt4o', 'me', 'tess']);
  assert.equal(end.readers.find((r) => r.id === 'gpt4o')!.text, SENTENCE);
  assert.equal(end.readers.find((r) => r.id === 'me')!.eye, 0);
});

test('hook: one continuous, monotonic fade of every letter at once, mostly in the visible range', () => {
  const { start, len } = fade.hookFade(HOOK_BEATS);
  assert.ok(len >= 2.5 && len <= 3.0, `fade lasts ${len} s`);
  let prev = -1;
  let visible = 0;
  let inWindow = 0;
  for (const t of frames(6)) {
    const s = fade.frameState({ mode: 'hook' }, t, HOOK_BEATS, 6);
    const ink = s.glyphs[0].ink;
    assert.ok(s.glyphs.every((g) => g.ink === ink), `t=${t}: letters differ`);
    assert.ok(ink >= prev, `t=${t}: ink ${ink} < ${prev}`);
    assert.equal(s.marker.grey, Math.round(ink), `t=${t}: marker ${s.marker.grey} vs ink ${ink}`);
    prev = ink;
    if (t > start && t < start + len) {
      inWindow++;
      if (ink <= fade.VISIBLE_MAX) visible++;
    }
  }
  assert.ok(visible / inWindow >= 0.75, `only ${((100 * visible) / inWindow).toFixed(0)}% of the fade is in 0..235`);
  // Halfway through, the sentence is a mid grey: neither black nor gone.
  const mid = fade.frameState({ mode: 'hook' }, start + len / 2, HOOK_BEATS, 6).glyphs[0].grey;
  assert.ok(mid >= 90 && mid <= 170, `mid grey ${mid}`);
  // Every step between frames is small: a fade, not a cut.
  for (const t of frames(6).slice(1)) {
    const a = fade.frameState({ mode: 'hook' }, t - 1 / 30, HOOK_BEATS, 6).glyphs[0].ink;
    const b = fade.frameState({ mode: 'hook' }, t, HOOK_BEATS, 6).glyphs[0].ink;
    assert.ok(b - a < 12, `t=${t}: jump ${b - a}`);
  }
});

test('roster: a contrast ramp sweeps the whole sentence in, breathes back to a gradient, ends black', () => {
  const dur = 4.53;
  const at = (t: number) => fade.frameState({ mode: 'roster' }, t, [0.55], dur);
  // Matches the hook's last frame while the scenes blend: every letter at the floor.
  assert.ok(at(0).glyphs.every((g) => g.grey === 254));
  assert.ok(at(fade.BLEND_S).glyphs.every((g) => g.grey === 254));
  const end = at(dur);
  assert.ok(end.glyphs.every((g) => g.grey === 0));
  const darkest = SENTENCE.split('').map(() => 255);
  let gradientFrames = 0;
  for (const t of frames(dur)) {
    const s = at(t);
    // Within each line, ink never gets darker to the right: one horizontal ramp.
    for (const line of [0, 1]) {
      const g = s.glyphs.filter((x) => x.line === line);
      for (let i = 1; i < g.length; i++) assert.ok(g[i].ink >= g[i - 1].ink - 1e-9, `t=${t}: ramp not monotonic`);
    }
    s.glyphs.forEach((g, i) => (darkest[i] = Math.min(darkest[i], g.grey)));
    // The held gradient: left letters near black, right letters invisible, a visible ramp between.
    const first = Math.min(...s.glyphs.filter((g) => g.x < 0.1).map((g) => g.grey));
    const last = Math.max(...s.glyphs.filter((g) => g.x > 0.9).map((g) => g.grey));
    const midRamp = s.glyphs.filter((g) => g.grey > 60 && g.grey < 200).length;
    if (t > 2 && first <= 40 && last >= 250 && midRamp >= 6) gradientFrames++;
  }
  // Every letter reaches black during the sweep, and the gradient holds for a while (>= 0.3 s).
  assert.ok(darkest.slice(0, fade.GLYPHS.length).every((g) => g === 0));
  assert.ok(gradientFrames >= 9, `gradient frames ${gradientFrames}`);
  // During the appearing sweep, the front passes left to right across the full sentence.
  const visibleCount = (t: number) => at(t).glyphs.filter((g) => g.grey <= fade.VISIBLE_MAX).length;
  assert.equal(visibleCount(fade.BLEND_S), 0);
  assert.ok(visibleCount(fade.BLEND_S + 0.6) > 0 && visibleCount(fade.BLEND_S + 0.6) < fade.GLYPHS.length);
  assert.equal(visibleCount(fade.BLEND_S + 1.7), fade.GLYPHS.length);
});

test('past the visible range a stretched glyph keeps fading while the label keeps the real grey', () => {
  const m0 = fade.frameState({ mode: 'machines' }, 0, [0.1], 3.87);
  const m1 = fade.frameState({ mode: 'machines' }, 3.87, [0.1], 3.87);
  assert.ok(m0.marker.grey >= 247 && m1.marker.grey === 253);
  assert.ok(m1.chipInk - m0.chipInk >= 50, `chip ${m0.chipInk} → ${m1.chipInk}`);
  assert.ok(m1.chipInk <= 240);
  const read = fade.frameState({ mode: 'read' }, 4, [0.1], 4);
  assert.equal(read.chipInk, 254);
});

test('the fade stops at my threshold, then runs to the floor; who reads at the floor', () => {
  const ladder = fade.frameState({ mode: 'ladder' }, 5, [0.1], 5);
  assert.ok(Math.abs(ladder.marker.ratio - HUMAN) < 1e-9);
  assert.equal(ladder.readers.find((r) => r.id === 'me')!.quality, 0);
  const machines = fade.frameState({ mode: 'machines' }, 4, [0.1], 4);
  const blankAfterMachines = machines.readers.filter((r) => r.quality === 0).map((r) => r.id).sort();
  assert.deepEqual(blankAfterMachines, ['gpt54', 'me', 'vision']);
  const read = fade.frameState({ mode: 'read' }, 4, [0.1], 4);
  assert.equal(read.marker.grey, 254);
  assert.deepEqual(read.readers.filter((r) => r.quality > 0).map((r) => r.id).sort(), ['gpt4o', 'tess']);
  assert.deepEqual(read.readers.filter((r) => r.five === 1).map((r) => r.id).sort(), ['gpt4o', 'tess']);
});

test('lens: every 254 pixel is black after the sweep', () => {
  const s = lens.frameState({}, 8, [0.2, 2.4], 8);
  for (const c of s.cells) assert.equal(c.shown, c.value < 255 ? 0 : 255);
  assert.ok(s.cells.some((c) => c.value === 254));
  assert.equal(s.binarised, 1);
});

test('ghost writer: nonsense lost at 8 px, meaningful at 5.5 px, marks at the end', () => {
  const end = ghost.frameState({}, 9, [0.2, 4.6], 9);
  assert.ok(end.size < 5.5);
  assert.equal(end.meaning.read, 0);
  assert.equal(end.nonsense.read, 0);
  assert.equal(end.mark55, 1);
  assert.equal(end.mark8, 1);
  assert.equal(end.bracket, 1);
});

test('hidden instruction: 0 of 6 under steganography, 4 of 18 banana at 1%', () => {
  const stego = hidden.frameState({ mode: 'stego' }, 4, [0.15], 4);
  assert.equal(stego.bubbles.flatMap((b) => b.items).filter((i) => i.appear > 0 && i.banana > 0).length, 0);
  const faint = hidden.frameState({ mode: 'faint' }, 4.2, [0.2], 4.2);
  const items = faint.bubbles.flatMap((b) => b.items);
  assert.equal(items.filter((i) => i.appear === 1).length, 18);
  assert.equal(items.filter((i) => i.banana === 1).length, 4);
  assert.ok(Math.abs(4 / 18 - 0.222) < 0.001);
  const q = faint.bubbles.find((b) => b.id === 'qwen')!;
  assert.equal(q.items.filter((i) => i.banana === 1).length, 2);
  for (const id of ['gpt4o', 'gpt54', 'luna']) assert.equal(faint.bubbles.find((b) => b.id === id)!.items.filter((i) => i.banana > 0).length, 0);
});

test('contrast breath: invisible, readable at the peak, invisible again', () => {
  const at = (t: number) => quote.frameState({ mode: 'contrast' }, t, [0.15], 3);
  assert.equal(greyOf(at(0).ratio), 252);
  assert.ok(greyOf(at(0.15 + 0.05 + 0.85).ratio) < 190);
  assert.equal(greyOf(at(3).ratio), 252);
});
