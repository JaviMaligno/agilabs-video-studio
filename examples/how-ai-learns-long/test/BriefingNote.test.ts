// Behaviour of BriefingNote (the prompt) and its totality over any t, beats and marks.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BOXES, CARDS, CHAT_A, NOTE_TAG, PANELS, TONE, frameState } from '../src/anim/BriefingNote.state.ts';

const UNIT = new Set(['desk', 'counters', 'panels', 'edit', 'slide', 'rows', 'tag', 'feed', 'assistant', 'open', 'sun', 'pop', 'paste', 'strike', 'write', 'chat', 'answer', 'tick', 'scroll', 'sink', 'dim', 'ring', 'alarm']);

const walk = (v: unknown, path: string, key = '') => {
  if (typeof v === 'number') {
    assert.ok(Number.isFinite(v), `${path} is ${v}`);
    if (UNIT.has(key)) assert.ok(v >= 0 && v <= 1, `${path} = ${v} outside [0, 1]`);
    if (key === 'read') assert.ok(v === -1 || (v >= 0 && v <= 1), `${path} = ${v}`);
    if (key === 'boxes') assert.ok(v >= 0 && v <= BOXES, `${path} = ${v}`);
    if (key === 'cards') assert.ok(v >= 0 && v <= CARDS, `${path} = ${v}`);
  } else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${path}[${i}]`, key));
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, `${path}.${k}`, k);
};

const REAL = { beats: [1.2, 11.23, 17.82, 24.81, 30.12, 37.11], dur: 41.6, marks: [2.44, 12.87, 19.86, 27.17, 36.08, 38.43] };
const SCENES: { beats: number[]; dur: number; marks?: number[] }[] = [
  REAL,
  { beats: [], dur: 5 },
  { beats: [], dur: 40, marks: [] },
  { beats: [1, 60], dur: 8, marks: [70, 80, 90, 100, 110, 120] },
  { beats: REAL.beats, dur: REAL.dur, marks: [NaN, NaN, NaN, NaN, NaN, NaN] },
  { beats: [30, 2, 20, 5, 1, 9], dur: 30, marks: [9, 2, 1, 40, 3, 0] },
  { beats: [0], dur: 0.5, marks: [Infinity, -3] },
];

test('BriefingNote is total over t in [-1, dur + 1]', () => {
  for (const sc of SCENES) {
    for (let t = -1; t <= sc.dur + 1; t += 0.25) walk(frameState({ marks: sc.marks }, t, sc.beats, sc.dur), `t=${t} ${JSON.stringify(sc)}`);
    for (const t of [NaN, Infinity, -Infinity]) walk(frameState({ marks: sc.marks }, t, sc.beats, sc.dur), `t=${t}`);
  }
});

const at = (t: number) => frameState({ marks: REAL.marks }, t, REAL.beats, REAL.dur);

test('BriefingNote: one phase on screen per line', () => {
  const phases = (t: number) => {
    const s = at(t);
    return [s.desk, s.counters, s.panels, s.edit].map((x) => Math.round(x));
  };
  assert.deepEqual(phases(6), [1, 0, 0, 0]);
  assert.deepEqual(phases(15), [0, 1, 0, 0]);
  assert.deepEqual(phases(22), [0, 0, 1, 0]);
  assert.deepEqual(phases(28), [0, 0, 0, 1]);
  assert.deepEqual(phases(34), [1, 0, 0, 0]);
  assert.deepEqual(phases(REAL.dur), [1, 0, 0, 0]);
});

test('BriefingNote: line 0, the note slides in on "note" and its rows light', () => {
  assert.equal(at(0.5).note.slide, 0);
  assert.ok(at(3.2).note.slide > 0.9);
  assert.ok(at(7).note.rows[0] > 0.3);
  assert.ok(at(10.5).note.tag > 0.9);
});

test('BriefingNote: line 1, the assistant pops on "employee" and the notes are read', () => {
  assert.equal(at(12.5).assistant, 0);
  assert.ok(at(13.5).assistant > 0.9);
  assert.ok(at(15).read >= 0);
});

test('BriefingNote: line 2, the three panels pop in order after "code"', () => {
  assert.ok(at(19.8).panel.every((p) => p.pop === 0));
  const s = at(21);
  assert.ok(s.panel[0].pop > 0.5 && s.panel[2].pop === 0);
  assert.ok(at(24).panel.every((p) => p.pop === 1));
});

test('BriefingNote: line 3, "30" struck on "edit", the next chat answers', () => {
  assert.equal(at(26.8).strike, 0);
  assert.equal(at(27.6).strike, 1);
  assert.equal(at(29.5).answer, 1);
  assert.equal(at(29.5).tick, 1);
});

test('BriefingNote: line 4, the scroll grows and the policy is buried on "buried"', () => {
  assert.equal(at(31).scroll, 0);
  assert.ok(at(34.5).scroll > 0.3);
  assert.equal(at(35.5).dim, 0);
  assert.ok(at(37).dim > 0.9);
});

test('BriefingNote: line 5, boxes and cards pile up after "catalogue", all by the end', () => {
  assert.equal(at(37.5).cards, 0);
  const end = at(REAL.dur);
  assert.equal(end.boxes, BOXES);
  assert.equal(end.cards, CARDS);
  assert.equal(end.strike, 1);
});

test('BriefingNote: texts', () => {
  assert.equal(NOTE_TAG, 'the prompt (the note)');
  assert.deepEqual([...PANELS], ['Instructions', 'Project', 'GPT']);
  assert.match(TONE, /friendly, short/);
  assert.match(CHAT_A, /^14 days/);
});
