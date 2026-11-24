// Behaviour of BriefingNote (the prompt) and its totality over any t, beats and marks.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BOXES, CARDS, CHAT_A, NOTE_TAG, PANELS, ROOM_CHAT, ROOM_LABEL, TONE, WINDOW_LABEL, frameState } from '../src/anim/BriefingNote.state.ts';

const UNIT = new Set(['desk', 'counters', 'panels', 'edit', 'slide', 'rows', 'tag', 'feed', 'assistant', 'open', 'sun', 'pop', 'paste', 'strike', 'write', 'chat', 'answer', 'tick', 'scroll', 'sink', 'dim', 'ring', 'fit', 'window', 'outside', 'room', 'bubbles', 'alarm']);

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

// Seven lines, nine marks (line 5 has three: "read", "fits", "room"), from the re-voiced narration.
const REAL = { beats: [1.2, 11.07, 17.58, 24.25, 29.32, 41.67, 51.14], dur: 55.3, marks: [2.36, 12.71, 19.46, 26.61, 35.32, 42.91, 47.23, 49.15, 52.3] };
const SCENES: { beats: number[]; dur: number; marks?: number[] }[] = [
  REAL,
  { beats: [], dur: 5 },
  { beats: [], dur: 40, marks: [] },
  { beats: [1, 60], dur: 8, marks: [70, 80, 90, 100, 110, 120, 130, 140, 150] },
  { beats: REAL.beats, dur: REAL.dur, marks: [NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN] },
  // the old six-mark list: the catalogue beat still lands on its line
  { beats: REAL.beats, dur: REAL.dur, marks: [2.36, 12.71, 19.46, 26.61, 35.32, 52.3] },
  { beats: [30, 2, 20, 5, 1, 9, 4], dur: 30, marks: [9, 2, 1, 40, 3, 0, 7, 2] },
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
  assert.deepEqual(phases(47), [1, 0, 0, 0]);
  assert.deepEqual(phases(REAL.dur), [1, 0, 0, 0]);
});

test('BriefingNote: line 0, the note slides in on "note" and its rows light', () => {
  assert.equal(at(0.5).note.slide, 0);
  assert.ok(at(3.4).note.slide > 0.9);
  assert.ok(at(7).note.rows[0] > 0.3);
  assert.ok(at(10.5).note.tag > 0.9);
});

test('BriefingNote: line 1, the assistant pops on "employee" and the notes are read', () => {
  assert.equal(at(12.3).assistant, 0);
  assert.ok(at(13.5).assistant > 0.9);
  assert.ok(at(15).read >= 0);
});

test('BriefingNote: line 2, the three panels pop in order after "code"', () => {
  assert.ok(at(19.4).panel.every((p) => p.pop === 0));
  const s = at(20.5);
  assert.ok(s.panel[0].pop > 0.5 && s.panel[2].pop === 0);
  assert.ok(at(24).panel.every((p) => p.pop === 1));
});

test('BriefingNote: line 3, "30" struck on "edit", the next chat answers', () => {
  assert.equal(at(26.3).strike, 0);
  assert.equal(at(27.4).strike, 1);
  assert.equal(at(29).answer, 1);
  assert.equal(at(29).tick, 1);
});

test('BriefingNote: line 4, the scroll grows and the policy is buried on "buried"', () => {
  assert.equal(at(31).scroll, 0);
  assert.ok(at(34.5).scroll > 0.3);
  assert.equal(at(34.9).dim, 0);
  assert.ok(at(36.5).dim > 0.9);
  assert.equal(at(41).scroll, 1);
});

test('BriefingNote: line 5, the context window on "read" over the long scroll; it fits on "fits"; the room on "room"', () => {
  // before "read" (42.91) the scroll is still long and there is no frame
  const before = at(42.6);
  assert.equal(before.window, 0);
  assert.equal(before.fit, 0);
  assert.equal(before.scroll, 1);
  // on "read" the frame is drawn over the still-long scroll, its outside part dimmed
  const over = at(43.6);
  assert.ok(over.window > 0.9);
  assert.ok(over.outside > 0.9);
  assert.equal(over.scroll, 1);
  assert.equal(over.fit, 0);
  assert.ok(at(46.9).outside > 0.9);
  // on "fits" (47.23) the scroll rolls back up into a note inside the frame
  const fits = at(48.4);
  assert.equal(fits.fit, 1);
  assert.equal(fits.scroll, 0);
  assert.equal(fits.outside, 0);
  assert.equal(fits.room, 0);
  // on "room" (49.15) the label, then the two bubbles in order
  assert.equal(at(48.9).room, 0);
  const s = at(49.8);
  assert.ok(s.room > 0.9);
  assert.ok(s.bubbles[0] > 0.9 && s.bubbles[1] < 0.5);
  assert.ok(at(50.6).bubbles.every((x) => x > 0.9));
  // the frame still holds as line 6 starts, and is gone before the boxes drop
  assert.ok(at(51.2).window > 0.9);
  const lifted = at(52);
  assert.equal(lifted.window, 0);
  assert.equal(lifted.room, 0);
  assert.ok(lifted.bubbles.every((x) => x === 0));
  assert.equal(lifted.cards, 0);
  // nothing of it before line 5
  assert.equal(at(41).window, 0);
  assert.equal(at(41).fit, 0);
});

test('BriefingNote: line 6, boxes and cards pile up after "catalogue" (mark 8), all by the end', () => {
  assert.equal(at(52.2).cards, 0);
  assert.ok(at(53.5).boxes > 0);
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
  assert.equal(WINDOW_LABEL, 'context window');
  assert.equal(ROOM_LABEL, 'room for the chat');
  assert.equal(ROOM_CHAT.length, 2);
});
