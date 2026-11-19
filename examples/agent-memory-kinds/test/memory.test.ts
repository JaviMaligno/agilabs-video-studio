// Behaviour of the bespoke memory-office components (the totality sweep is in anim.test.ts).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ADVICE_LINE, FRIDGE_NOTE, OFFICE_MODES, RECIPE, UNTESTED, frameState as office } from '../src/anim/MemoryOffice.state.ts';
import { SLIP_PATH, frameState as head } from '../src/anim/HeadShelf.state.ts';
import { CARD_TEXT, CROWDED_PAGES, DAYS, DESK_MODES, DETAIL_TEXT, FORK, GREETING, MAX_PAGES, MISSES_OTHER, DECISIONS, ONE_IN_TEXT, WORK_PAGES, frameState as desk } from '../src/anim/MemoryDesk.state.ts';
import { CABINET_MODES, DRAWER_TAGS, LINE_TEXT, STAT_TEXT, UNASKED, frameState as cabinet } from '../src/anim/FilingCabinet.state.ts';
import { BOXES, CASCADE, FORM_MODES, FULL_TEXT, MARGIN_TEXT, NAMED_LABEL, NAMED_VALUE, NOT_SAVED, PANEL_NOTES, RIGHT_BOOKING, RUNS, SECOND_TEXT, ZERO_TEXT, frameState as form } from '../src/anim/ClipboardForm.state.ts';
import { FLIGHT, NEW_DAY, OLD_DAY, SLIP_TEXT } from '../src/anim/memory.ts';

/** Fields that are opacities or progress and must stay within [0, 1] in these components. */
const UNIT = new Set([
  'lit', 'crack', 'glow', 'armUp', 'blink', 'opacity', 'onCard', 'links', 'line', 'carry', 'ghost', 'drop', 'arrive',
  'question', 'books', 'cap', 'lock', 'bounce', 'desk', 'deskLit', 'cover', 'spill', 'gauge', 'amber', 'squeeze', 'write', 'fade',
  'move', 'tick', 'pile', 'sweep', 'inDrawer', 'drawers', 'clean', 'found', 'peek', 'cross', 'boxes', 'shelfRow', 'rowLit', 'strike',
  'prog', 'fly', 'erase', 'eraser', 'scribble', 'zero', 'fill', 'full', 'inset',
  'rules', 'top', 'one', 'other', 'label', 'fork', 'stream', 'doors', 'back', 'fall', 'into', 'tags', 'stat', 'ghost', 'glow', 'second', 'dim', 'human', 'recipe',
  'rise', 'sink', 'calendar', 'wipe', 'morning', 'greet', 'shrink', 'drop', 'filled', 'pulse', 'missing', 'untested', 'write2',
]);

const walk = (v: unknown, path: string, key = '') => {
  if (typeof v === 'number') {
    assert.ok(Number.isFinite(v), `${path} is ${v}`);
    if (UNIT.has(key)) assert.ok(v >= 0 && v <= 1, `${path} = ${v} outside [0, 1]`);
  } else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${path}[${i}]`, key));
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, `${path}.${k}`, k);
};

const SCENES = [
  { beats: [0.3, 2.9, 5.2], dur: 8 },
  { beats: [], dur: 5 },
  { beats: [1, 30], dur: 4 },
  { beats: [0], dur: 0.5 },
];

type St = (t: number, beats: number[], dur: number) => object;
const ALL: [string, St][] = [
  ...OFFICE_MODES.map((mode): [string, St] => [`office ${mode}`, (t, b, d) => office({ mode }, t, b, d)]),
  ['head', (t, b, d) => head({}, t, b, d)],
  ...DESK_MODES.map((mode): [string, St] => [`desk ${mode}`, (t, b, d) => desk({ mode }, t, b, d)]),
  ...CABINET_MODES.map((mode): [string, St] => [`cabinet ${mode}`, (t, b, d) => cabinet({ mode }, t, b, d)]),
  ...FORM_MODES.map((mode): [string, St] => [`form ${mode}`, (t, b, d) => form({ mode }, t, b, d)]),
];

test('memory components: finite, unit fields in [0, 1], at every sampled time', () => {
  for (const [name, st] of ALL) {
    for (const { beats, dur } of SCENES) {
      for (let t = -1; t <= dur + 1; t += 0.1) walk(st(t, beats, dur), `${name}@${t.toFixed(1)}/${dur}`);
      walk(st(Number.NaN, beats, dur), `${name}@NaN`);
    }
  }
});

test('on-screen texts are exactly the agreed ones: the trip, never the warehouse', () => {
  assert.equal(SLIP_TEXT, 'FLIGHT: FRIDAY');
  assert.deepEqual([FLIGHT, OLD_DAY, NEW_DAY], ['FLIGHT', 'Thursday', 'Friday']);
  assert.equal(ZERO_TEXT, '0/24');
  assert.equal(FULL_TEXT, '24/24');
  assert.equal(SECOND_TEXT, '16/24');
  assert.equal(RUNS, 24);
  assert.equal(ADVICE_LINE, 'what my tests point to');
  assert.equal(CARD_TEXT, 'trip plans');
  assert.equal(DETAIL_TEXT, 'flight: Friday');
  assert.equal(MARGIN_TEXT, 'allergic to feathers');
  assert.equal(FRIDGE_NOTE, 'FLIGHT FRI');
  assert.equal(UNTESTED, 'not tested together yet');
  assert.deepEqual([...BOXES], ['FLIGHT', 'HOTEL', 'DESTINATION']);
  assert.equal(GREETING, 'Hi! How can I help you today?');
  assert.equal(ONE_IN_TEXT, '1 in ~600');
  assert.equal(STAT_TEXT, '1 search in 40');
  // "Another got a quarter of them wrong": one in four of the strip.
  assert.equal(MISSES_OTHER * 4, DECISIONS);
});

test('MemoryOffice: verdict cracks every object on the job, never the head shelf; advice heals and links the form', () => {
  for (const { beats, dur } of SCENES) {
    const v = office({ mode: 'verdict' }, dur, beats, dur);
    assert.deepEqual(v.crack, [0, 1, 1, 1, 1]);
    assert.deepEqual(v.human, [1, 1, 1]);
    const a = office({ mode: 'advice' }, dur, beats, dur);
    assert.deepEqual(a.crack, [0, 0, 0, 0, 0]);
    assert.equal(a.slip.onCard, 1);
    assert.deepEqual(a.links, [0, 1], 'the recipe links the summary to the form, not the notebook');
    assert.equal(a.line, 1);
    assert.equal(a.untested, 1);
  }
  // Cracks come one after another.
  const mid = office({ mode: 'verdict', marks: [0.2, 0.8, 2, 3, 4] }, 2.5, [0, 0.6], 6);
  assert.ok(mid.crack[1] > mid.crack[4]);
});
test('HeadShelf: the slip hits the glass, bounces off and lands on the desk', () => {
  const marks = [1, 2, 3, 4, 6, 2.2];
  assert.equal(head({ marks }, 2.5, [0.3, 2.9, 5.2], 8).slip.opacity, 0);
  const atGlass = head({ marks }, 4, [0.3, 2.9, 5.2], 8);
  assert.ok(Math.abs(atGlass.slip.x - SLIP_PATH.door.x) < 1 && Math.abs(atGlass.slip.y - SLIP_PATH.door.y) < 1);
  assert.equal(atGlass.path.fly, 1);
  assert.equal(atGlass.path.back, 0);
  assert.ok(head({ marks }, 4.2, [0.3, 2.9, 5.2], 8).bounce > 0);
  for (const { beats, dur } of SCENES) {
    const end = head({}, dur, beats, dur);
    assert.ok(Math.abs(end.slip.x - SLIP_PATH.desk.x) < 1e-6 && Math.abs(end.slip.y - SLIP_PATH.desk.y) < 1e-6);
    assert.equal(end.slip.opacity, 1);
    assert.equal(end.cap, 1);
    assert.equal(end.doors, 1);
    assert.equal(end.stream, 1);
    assert.deepEqual(end.path, { fly: 1, back: 1, fall: 1 });
    assert.deepEqual(end.bars, { opacity: 1, rise: 1, sink: 1 });
  }
});

test('HeadShelf: books stream in on "reads", the doors close on "frozen", and only then does the slip fly', () => {
  const marks = [2, 9, 15, 16, 30, 11, 6, 20, 24];
  const at = (t: number) => head({ marks }, t, [1.3, 8, 18, 28], 34);
  assert.equal(at(1.7).stream, 0);
  assert.ok(at(4).stream > 0 && at(4).stream < 1);
  assert.equal(at(6.5).stream, 1);
  assert.equal(at(10.8).doors, 0);
  assert.ok(at(11.6).doors > 0.99);
  assert.equal(at(14.5).slip.opacity, 0);
  // Out-of-order marks: the doors are never open when the slip reaches the glass.
  const odd = (t: number) => head({ marks: [1, 2, 2.1, 2.2, 2.3, 9] }, t, [0.3], 12);
  for (let t = 0; t <= 12; t += 0.05) {
    const s = odd(t);
    if (s.path.fly >= 1) assert.ok(s.doors > 0.99, `doors open at the hit, t=${t}`);
  }
});

test('HeadShelf: retraining, the "new" bar rises on "again", the rest sink on "worse"; the slip falls only after', () => {
  const marks = [2, 9, 15, 16, 30, 11, 6, 20, 24];
  const at = (t: number) => head({ marks }, t, [1.3, 8, 18, 28], 34);
  assert.equal(at(19).bars.opacity, 0);
  assert.equal(at(19.9).bars.rise, 0);
  assert.ok(at(21.2).bars.rise > 0.99);
  assert.equal(at(23.8).bars.sink, 0);
  assert.ok(at(25.2).bars.sink > 0.99);
  assert.equal(at(29.9).path.fall, 0, 'the slip waits for "somewhere else"');
  assert.ok(at(31.5).path.fall > 0.99);
  // A "somewhere" mark before "worse" still waits for the bars.
  const odd = (t: number) => head({ marks: [2, 9, 15, 16, 18, 11, 6, 20, 24] }, t, [1.3, 8, 18, 28], 34);
  assert.equal(odd(24.5).path.fall, 0);
});

test('MemoryDesk: pages pile up and spill; the summary squeezes them into one card with the correction on it', () => {
  assert.equal(desk({ mode: 'full' }, 0.2, [0.3, 2.9], 8).pages, 0);
  const counts = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((t) => desk({ mode: 'full' }, t, [0.3, 2.9], 8).pages);
  for (let i = 1; i < counts.length; i++) assert.ok(counts[i] >= counts[i - 1]);
  for (const { beats, dur } of SCENES) {
    const full = desk({ mode: 'full' }, dur, beats, dur);
    assert.equal(full.pages, MAX_PAGES);
    assert.equal(full.spill, 1);
    assert.equal(full.amber, 1);
    const sum = desk({ mode: 'summary' }, dur, beats, dur);
    assert.equal(sum.squeeze, 1);
    assert.equal(sum.card.write, 1);
    assert.equal(sum.card.write2, 1);
    assert.equal(sum.card.tick, 1);
    assert.equal(sum.slip.opacity, 0);
  }
  // The summary starts where the full desk ended.
  const s0 = desk({ mode: 'summary' }, 0, [0.2, 6], 9);
  assert.equal(s0.pages, MAX_PAGES);
  assert.equal(s0.amber, 1);
});
test('FilingCabinet: the slip is filed and never found; the question it never asks is struck', () => {
  for (const { beats, dur } of SCENES) {
    const filed = cabinet({ mode: 'file' }, dur, beats, dur);
    assert.equal(filed.sweep, 1);
    assert.equal(filed.peek, 1);
    assert.deepEqual(filed.drawers, [0, 0, 0]);
    const miss = cabinet({ mode: 'miss' }, dur, beats, dur);
    assert.equal(miss.drawers[1], 0, 'the slip drawer is never opened');
    assert.equal(miss.unasked.strike, 1);
    assert.equal(miss.peek, 1);
  }
  // Other drawers do open while it searches; the slip's drawer stays shut throughout.
  let opened = 0;
  for (let t = 0; t <= 8; t += 0.05) {
    const s = cabinet({ mode: 'miss' }, t, [0.2, 2.6], 8);
    opened = Math.max(opened, s.drawers[0], s.drawers[2]);
    assert.equal(s.drawers[1], 0);
  }
  assert.ok(opened > 0.5);
  assert.equal(UNASKED, 'anything changed?');
});
test('ClipboardForm: replace rewrites the FLIGHT box; margin erases, then 24 ticks; wrong writes Thursday back', () => {
  const pre = form({ mode: 'margin' }, 0.3, [0.2, 4], 9);
  assert.equal(pre.zero, 0);
  assert.equal(pre.ticks, 0);
  assert.equal(pre.full, 0);
  let last = 0;
  for (let t = 0; t <= 9; t += 0.1) {
    const s = form({ mode: 'margin' }, t, [0.2, 4], 9);
    assert.ok(Number.isInteger(s.ticks) && s.ticks >= last && s.ticks <= RUNS);
    last = s.ticks;
  }
  for (const { beats, dur } of SCENES) {
    const r = form({ mode: 'replace' }, dur, beats, dur);
    assert.equal(r.value.text, 'Thursday');
    assert.equal(r.value.next, 'Friday');
    assert.equal(r.value.write, 1);
    assert.equal(r.slip.opacity, 0);
    assert.equal(r.morning, 1, 'the next morning, the form unchanged');
    const m = form({ mode: 'margin' }, dur, beats, dur);
    assert.equal(m.margin.erase, 1);
    assert.equal(m.zero, 1); // 0/24 stays as the first row of the results
    assert.equal(m.ticks, RUNS);
    assert.equal(m.full, 1);
    assert.deepEqual(m.named, { opacity: 1, write: 1, glow: 1 });
    assert.equal(m.second, 1);
    assert.equal(m.notes.fill, 0.5, 'the notes box is half-filled');
    assert.equal(m.notes.dim, 1);
    const w = form({ mode: 'wrong' }, dur, beats, dur);
    assert.equal(w.value.text, 'Friday');
    assert.equal(w.value.next, 'Thursday');
    assert.equal(w.value.write, 1);
    assert.equal(w.tick, 1);
    assert.equal(w.booking.tick, 1, 'the action was right');
    assert.equal(w.cascade, CASCADE);
    const pn = form({ mode: 'panel' }, dur, beats, dur);
    assert.equal(pn.panel.opacity, 1);
    assert.equal(pn.panel.missing, 1);
    assert.equal(pn.panel.cross, 1);
  }
});

test('ClipboardForm figures and labels are the agreed ones', () => {
  assert.deepEqual([ZERO_TEXT, FULL_TEXT, SECOND_TEXT], ['0/24', '24/24', '16/24']);
  assert.equal(NAMED_LABEL, 'ALLERGIES');
  assert.equal(NAMED_VALUE, 'feathers');
  assert.equal(RIGHT_BOOKING, 'Booked your hotel for Friday night');
  assert.deepEqual([...PANEL_NOTES], ['prefers a window seat', 'flight is Friday']);
  assert.equal(NOT_SAVED, 'allergic to feathers');
  assert.equal(CASCADE, 25);
});

test('ClipboardForm replace: the slip flies in on "correct", Friday written on "Friday", morning on "tomorrow"', () => {
  // marks: [form, boxes, apart, correct, Friday, tomorrow]
  const marks = [3, 5, 7, 12, 15, 19];
  const at = (t: number) => form({ mode: 'replace', marks }, t, [0.3, 10.5], 22);
  assert.equal(at(6.5).filled, 0);
  assert.ok(at(9).filled > 0.99);
  assert.equal(at(11.6).slip.opacity, 0);
  assert.ok(at(12.4).slip.opacity > 0.9);
  assert.ok(at(13).value.strike > 0.5);
  assert.equal(at(14.9).value.write, 0);
  assert.ok(at(15.8).value.write > 0.99);
  assert.equal(at(18.7).morning, 0);
  assert.ok(at(19.7).morning > 0.99);
});

test('ClipboardForm margin: scribbled, wiped, 0/24 on "never", named box with 24/24 and 16/24, notes half-filled then dimmed', () => {
  // marks: [scribbled, wipes, named, every, notes, say, never]
  const marks = [5, 8.4, 14, 16.6, 21, 24, 11];
  const at = (t: number) => form({ mode: 'margin', marks }, t, [0.2, 9.4, 19.7], 26);
  assert.ok(at(4.8).margin.write > 0);
  assert.equal(at(8).margin.erase, 0);
  assert.ok(at(9.2).margin.erase > 0.99);
  assert.equal(at(10.8).zero, 0);
  assert.ok(at(11.4).zero > 0.99);
  assert.equal(at(13.7).named.opacity, 0);
  assert.equal(at(13.7).ticks, 0);
  assert.ok(at(14.5).named.opacity > 0.99);
  assert.equal(at(16).ticks, RUNS);
  assert.equal(at(16.8).second, 0);
  assert.ok(at(17.4).second > 0.99);
  assert.equal(at(20.7).notes.opacity, 0);
  assert.ok(Math.abs(at(22).notes.fill - 0.5) < 1e-9);
  assert.equal(at(23.7).notes.dim, 0);
  assert.equal(at(23.7).named.glow, 0);
  assert.ok(at(24.6).notes.dim > 0.99 && at(24.6).named.glow > 0.99);
});

test('ClipboardForm wrong: the right booking first, then Thursday written back with a tick, then 25 mistakes', () => {
  // marks: [misremembers, right, wrong, everything]
  const marks = [3, 6, 8, 10];
  const at = (t: number) => form({ mode: 'wrong', marks }, t, [0.2], 14);
  assert.equal(at(5.6).booking.opacity, 0);
  assert.ok(at(6.5).booking.opacity > 0.99 && at(6.5).value.strike === 0);
  assert.equal(at(8.6).tick, 0);
  assert.ok(at(9.2).tick > 0.99);
  assert.equal(at(9.9).cascade, 0);
  let prev = 0;
  for (let t = 9.9; t <= 12; t += 0.05) {
    const c = at(t).cascade;
    assert.ok(Number.isInteger(c) && c >= prev && c <= CASCADE);
    prev = c;
  }
  assert.equal(at(11.7).cascade, CASCADE);
});

test('ClipboardForm panel: the saved note lights on "list", the unsaved fact comes in dashed and is crossed on "written"', () => {
  const marks = [3, 7, 10];
  const at = (t: number) => form({ mode: 'panel', marks }, t, [0.2], 13);
  assert.ok(at(1).panel.opacity > 0.99);
  assert.equal(at(3.3).panel.lit, 0);
  assert.ok(at(4).panel.lit > 0.99);
  assert.equal(at(9.6).panel.missing, 0);
  assert.ok(at(10.2).panel.missing > 0.99);
  assert.equal(at(10.2).panel.cross, 0);
  assert.ok(at(10.8).panel.cross > 0.99);
});

test('MemoryDesk work: the conversation piles under the slip, which stays on top; Friday gets the tick', () => {
  const marks = [1.5, 4, 12, 14];
  const at = (t: number) => desk({ mode: 'work', marks }, t, [1.3, 11.8], 18);
  assert.equal(at(-1).pages, 0);
  assert.equal(at(1).rules, 0);
  assert.equal(at(3.9).pages, 0);
  assert.ok(at(5.5).pages > 0 && at(5.5).pages < WORK_PAGES);
  assert.equal(at(10).pages, WORK_PAGES);
  for (let t = 0; t <= 18; t += 0.25) {
    const s = at(t);
    assert.equal(s.slip.top, 1);
    assert.equal(s.slip.cover, 0, 'nothing covers the slip while it is used');
    assert.equal(s.spill, 0);
  }
  assert.equal(at(11).calendar.opacity, 0);
  assert.ok(at(12.4).slip.glow > 0.9, 'the robot reads the slip');
  assert.equal(at(13.9).calendar.tick, 0);
  assert.ok(at(14.8).calendar.tick > 0.99);
  assert.deepEqual([...DAYS], ['THU', 'FRI']);
  for (const { beats, dur } of SCENES) {
    const end = desk({ mode: 'work' }, dur, beats, dur);
    assert.equal(end.rules, 1);
    assert.equal(end.pages, WORK_PAGES);
    assert.equal(end.calendar.tick, 1);
  }
  // A late "use" mark never ticks Friday before the "Friday" beat.
  const late = (t: number) => desk({ mode: 'work', marks: [1, 2, 9, 3] }, t, [0.3, 8], 14);
  assert.equal(late(9.2).calendar.tick, 0);
});
test('MemoryDesk crowded: hotels, prices and a map bury the slip; ~600 decisions with one miss, a second strip one in four', () => {
  // marks: [buries, best, another, hotels]
  const marks = [0.6, 9, 13, 3];
  const at = (t: number) => desk({ mode: 'crowded', marks }, t, [0.2, 6.3], 18);
  assert.equal(at(0).pages, WORK_PAGES, 'starts where the work scene ended');
  assert.equal(at(0).slip.cover, 0);
  assert.ok(at(2).pages > WORK_PAGES && at(2).pages < CROWDED_PAGES);
  assert.equal(at(5).pages, CROWDED_PAGES);
  assert.equal(at(5).slip.cover, 1);
  assert.equal(at(5).strips.opacity, 0);
  assert.ok(at(9.8).strips.one > 0 && at(9.8).strips.one < 1);
  assert.equal(at(11).strips.one, 1);
  assert.equal(at(12.9).strips.other, 0);
  assert.equal(at(15).strips.other, 1);
  assert.ok(at(18).pages <= MAX_PAGES);
  for (const { beats, dur } of SCENES) {
    const end = desk({ mode: 'crowded' }, dur, beats, dur);
    assert.equal(end.strips.one, 1);
    assert.equal(end.strips.other, 1);
    assert.equal(end.strips.label, 1);
    assert.equal(end.spill, 0);
  }
});

test('MemoryDesk wiped: the pile slides off on "new", morning and the greeting on "clean", a dashed slip on "Unless" that fades', () => {
  // marks: [new, clean, unless, nothing]
  const marks = [1.5, 3.5, 5, 8];
  const at = (t: number) => desk({ mode: 'wiped', marks }, t, [0.2], 11);
  assert.equal(at(0).wipe, 0);
  assert.equal(at(0).pages, CROWDED_PAGES, 'starts where the crowded desk ended');
  assert.ok(at(2.6).wipe > 0.99);
  assert.equal(at(3).greet, 0);
  assert.ok(at(4).greet > 0.99 && at(4).morning > 0.9);
  assert.equal(at(4.8).ghost, 0);
  assert.ok(at(5.5).ghost > 0.99);
  assert.equal(at(9).ghost, 0);
  for (const { beats, dur } of SCENES) {
    const end = desk({ mode: 'wiped' }, dur, beats, dur);
    assert.equal(end.wipe, 1);
    assert.equal(end.greet, 1);
    assert.equal(end.ghost, 0);
  }
});
test('MemoryDesk full: the fork to SUMMARY / NOTEBOOK comes after the pages tip off', () => {
  assert.deepEqual([...FORK], ['SUMMARY', 'NOTEBOOK']);
  const marks = [0.5, 1.4, 2.6, 4.5, 6.5];
  const at = (t: number) => desk({ mode: 'full', marks }, t, [0.2], 9);
  assert.equal(at(5).fork, 0);
  assert.ok(at(4.4).spill < at(5.4).spill);
  assert.ok(at(7.2).fork > 0.99);
  for (const { beats, dur } of SCENES) assert.equal(desk({ mode: 'full' }, dur, beats, dur).fork, 1);
  // The fork never comes before the pages go, whatever the marks.
  const early = (t: number) => desk({ mode: 'full', marks: [0.5, 1, 2, 5, 1] }, t, [0.2], 9);
  assert.equal(early(5.2).fork, 0);
});

test('FilingCabinet file: lens on "keyword", inbox folds in on "email", "?" on "know", then the cold open comes back', () => {
  // marks: [clear, nothing, keyword, know, email, safest]
  const marks = [3, 10, 8, 16, 14, 22];
  const at = (t: number) => cabinet({ mode: 'file', marks }, t, [1.3, 11.9, 18.5], 27);
  assert.equal(at(7.6).lens.opacity, 0);
  assert.ok(at(8.4).lens.opacity > 0.99);
  assert.equal(at(13.7).inbox.opacity, 0);
  assert.ok(at(14.4).inbox.opacity > 0.99);
  assert.equal(at(14.4).inbox.into, 0);
  assert.ok(at(15.6).inbox.into > 0.99);
  assert.equal(at(15.9).lens.question, 0);
  assert.ok(at(16.5).lens.question > 0.99);
  assert.equal(at(21.6).callback.opacity, 0);
  const mid = at(22.5);
  assert.ok(mid.callback.opacity > 0.99 && mid.callback.pulse > 0);
  assert.equal(mid.callback.cross, 0);
  assert.ok(at(24.2).callback.cross > 0.99);
  for (const { beats, dur } of SCENES) {
    const end = cabinet({ mode: 'file' }, dur, beats, dur);
    assert.equal(end.callback.opacity, 1);
    assert.equal(end.callback.cross, 1);
    assert.equal(end.inbox.into, 1);
  }
  // The callback never comes before the question, whatever the marks.
  const odd = (t: number) => cabinet({ mode: 'file', marks: [1, 2, 3, 6, 2, 1] }, t, [0.3], 12);
  assert.equal(odd(6.2).callback.opacity, 0);
});

test('FilingCabinet miss: tags "hotels" and "prices", the unasked question struck, "1 search in 40", a second pass, then the line', () => {
  assert.deepEqual([...DRAWER_TAGS], ['hotels', '', 'prices']);
  assert.equal(LINE_TEXT, 'A search only helps if you know what to look for.');
  // marks: [nothing, searches, never, changed, forty, second, only]
  const marks = [2, 8, 11, 12.5, 19, 15, 21];
  const at = (t: number) => cabinet({ mode: 'miss', marks }, t, [0.2, 14.5], 25);
  assert.equal(at(7.5).tags, 0);
  assert.ok(at(8.2).tags > 0.99);
  assert.equal(at(10.7).unasked.opacity, 0);
  assert.ok(at(11.5).unasked.opacity > 0.99);
  assert.equal(at(12.4).unasked.strike, 0);
  assert.ok(at(13).unasked.strike > 0.99);
  assert.equal(at(18.8).stat, 0);
  assert.ok(at(19.5).stat > 0.99);
  // The second pass opens the searched drawers again, never the slip's.
  let reopened = 0;
  for (let t = 15; t < 21; t += 0.05) {
    const s = at(t);
    reopened = Math.max(reopened, s.drawers[0], s.drawers[2]);
    assert.equal(s.drawers[1], 0);
  }
  assert.ok(reopened > 0.5);
  assert.equal(at(20.8).line, 0);
  assert.ok(at(21.6).line > 0.99);
  for (const { beats, dur } of SCENES) {
    const end = cabinet({ mode: 'miss' }, dur, beats, dur);
    assert.equal(end.stat, 1);
    assert.equal(end.line, 1);
    assert.deepEqual(end.drawers, [0, 0, 0]);
  }
});

test('MemoryOffice verdict: each object lights and cracks on its own name, in order; then head, inbox, fridge on their words', () => {
  // marks: [best, desk, summary, search, form, head, email, fridge]
  const marks = [2, 9, 10.5, 12.5, 14.5, 24, 26, 29];
  const at = (t: number) => office({ mode: 'verdict', marks }, t, [1.3, 7, 18], 33);
  assert.deepEqual(at(8).crack, [0, 0, 0, 0, 0]);
  const names = [9, 10.5, 12.5, 14.5];
  names.forEach((n, k) => {
    assert.equal(at(n - 0.2).crack[k + 1], 0, `object ${k + 1} before its name`);
    assert.ok(at(n + 0.5).crack[k + 1] > 0.99, `object ${k + 1} after its name`);
    assert.ok(at(n + 0.5).lit[k + 1] > 0.99);
  });
  assert.equal(at(20).crack[0], 0, 'the head shelf never cracks');
  assert.deepEqual(at(23.7).human, [0, 0, 0]);
  assert.ok(at(24.4).human[0] > 0.99 && at(24.4).human[1] === 0);
  assert.ok(at(26.4).human[1] > 0.99 && at(26.4).human[2] === 0);
  assert.deepEqual(at(40).human, [1, 1, 1]);
});

test('MemoryOffice advice: the recipe builds item by item (summary, then the named box); "not tested together yet" last', () => {
  assert.deepEqual([...RECIPE], ['SUMMARY', 'FORM with a named box']);
  // marks: [tests, summary, named]
  const marks = [1.2, 8, 11];
  const at = (t: number) => office({ mode: 'advice', marks }, t, [0.2], 14);
  assert.deepEqual(at(7).recipe, [0, 0]);
  assert.ok(at(8.4).recipe[0] > 0.99 && at(8.4).recipe[1] === 0);
  assert.ok(at(11.4).recipe[1] > 0.99);
  assert.equal(at(11.6).untested, 0);
  assert.ok(at(12.4).untested > 0.99);
  for (const { beats, dur } of SCENES) assert.deepEqual(office({ mode: 'advice' }, dur, beats, dur).recipe, [1, 1]);
});

test('MemoryDesk summary, rows 15-20: squeeze, the gist, the slip over the card, the line written, ticks, the older model, the tick', () => {
  // marks: [writes, gist, meeting, decides, cut, wrote, almost, older, slipped, good]
  const beats = [1.3, 12, 16.5, 22, 29, 37.5];
  const marks = [4, 15.6, 14, 18, 21, 24, 27, 32, 34, 41];
  const at = (t: number) => desk({ mode: 'summary', marks }, t, beats, 44);
  assert.ok(at(5.5).squeeze > 0.99);
  assert.ok(at(6.5).card.write > 0.99);
  assert.equal(at(13).bubble.opacity, 0);
  assert.ok(at(14.5).bubble.opacity > 0.99);
  assert.equal(at(15.4).bubble.fade, 0);
  assert.ok(at(16.8).bubble.fade > 0.99);
  // The slip hovers over the card being written ("will Friday make the cut?").
  assert.equal(at(17.6).hover.opacity, 0);
  assert.ok(at(18.4).hover.opacity > 0.99 && at(18.4).card.glow > 0.9);
  assert.ok(at(21.4).hover.question > 0.99);
  // It drops in; the card gains "flight: Friday"; the row of ticks fills.
  assert.equal(at(23.9).card.write2, 0);
  assert.equal(at(25).card.write2, 1);
  assert.ok(at(25).hover.opacity < 0.01);
  assert.ok(at(28.5).rows.opacity > 0.99 && at(28.5).rows.fill > 0.99);
  // The older model: robot greyed, card shrunk, clock, reds; then the recent model's card, ticked.
  const s36 = at(36);
  assert.ok(s36.old > 0.99 && s36.card.shrink > 0.99 && s36.reds.opacity > 0.99 && s36.clock.opacity > 0.99);
  assert.equal(s36.rows.opacity, 0);
  const end = at(44);
  assert.equal(end.old, 0);
  assert.equal(end.reds.opacity, 0);
  assert.equal(end.card.tick, 1);
  assert.equal(end.card.write2, 1);
});

// The reel's cuts (`short`, `question: false`, and the squeeze and human modes): fewer beats, no
// figures on screen.
test('HeadShelf short: no satchel, no retraining bars; doors on "frozen", bounce, then down to the desk', () => {
  // marks: [learned, learned, correction, has, somewhere, frozen, training]
  const marks = [0.85, 0.85, 3.3, 4.1, 4.8, 2.4, 1.6];
  const at = (t: number) => head({ short: true, marks }, t, [0.3], 6.6);
  for (let t = 0; t <= 6.6; t += 0.05) {
    const s = at(t);
    assert.equal(s.cap, 0);
    assert.equal(s.bars.opacity, 0);
  }
  assert.ok(at(2.2).doors < 0.5);
  assert.ok(at(3).doors > 0.99);
  assert.ok(at(4.3).bounce > 0.5);
  assert.equal(at(4.7).path.fall, 0);
  assert.ok(at(6).path.fall > 0.99);
});

test('MemoryDesk crowded short: the desk lights on "desk", the slip gets buried, and no strips of figures', () => {
  // marks: [buries, -, -, hotels, desk]
  const marks = [3.3, 3.3, 3.3, 6.1, 1.1];
  const at = (t: number) => desk({ mode: 'crowded', short: true, marks }, t, [0.3], 8);
  assert.ok(at(0.5).deskLit < 0.2);
  assert.ok(at(2).deskLit > 0.99);
  assert.equal(at(3).slip.cover, 0);
  assert.ok(at(8).slip.cover > 0.99);
  assert.equal(at(8).pages, CROWDED_PAGES);
  for (let t = 0; t <= 8; t += 0.1) assert.equal(at(t).strips.opacity, 0);
});

test('MemoryDesk squeeze: fills, squeezes into the card, keeps "flight: Friday" with a tick, then the weaker card drops it', () => {
  // marks: [writes, keeps, weaker, drop]
  const marks = [2.2, 6.2, 7.5, 8.5];
  const at = (t: number) => desk({ mode: 'squeeze', marks }, t, [0.3], 9.9);
  assert.ok(at(1.2).pages > 2 && at(1.2).pages < MAX_PAGES);
  assert.equal(at(2.0).pages, MAX_PAGES);
  assert.equal(at(1).spill, 0);
  assert.ok(at(4).squeeze > 0.99);
  assert.equal(at(5.9).card.write2, 0);
  assert.ok(at(7).card.write2 > 0.99);
  assert.ok(at(7.2).card.tick > 0.99);
  assert.equal(at(7.2).old, 0);
  assert.ok(at(8.4).old > 0.99);
  assert.equal(at(8.4).card.tick, 0);
  assert.ok(at(9.9).card.shrink > 0.99);
  // No rows of ticks, no clock, no meeting bubble, no "?" over the card.
  for (let t = 0; t <= 9.9; t += 0.1) {
    const s = at(t);
    assert.equal(s.rows.opacity + s.reds.opacity + s.clock.opacity + s.bubble.opacity + s.hover.question, 0);
  }
});

test('FilingCabinet short: no inbox; "?" on "Sounds"; the callback crossed before the scene ends; miss without figure, line or second pass', () => {
  // file marks: [files, safest, keyword, Sounds, -, did]
  const file = (t: number) => cabinet({ mode: 'file', short: true, marks: [0.7, 5.2, 4.1, 4.7, 0.7, 8.4] }, t, [0.3], 10.1);
  for (let t = 0; t <= 10.1; t += 0.1) assert.equal(file(t).inbox.opacity, 0);
  assert.equal(file(4.6).lens.question, 0);
  assert.ok(file(5.2).lens.question > 0.99);
  assert.ok(file(5.6).glow > 0.99);
  assert.ok(file(9.3).callback.cross > 0.99);
  // miss marks: [searched, searched, never, change]
  const miss = (t: number) => cabinet({ mode: 'miss', short: true, marks: [0.4, 0.4, 3.4, 4.2] }, t, [0.2], 7.5);
  let opened = 0;
  for (let t = 0; t <= 7.5; t += 0.05) {
    const s = miss(t);
    assert.equal(s.stat + s.line + s.clean, 0);
    assert.equal(s.drawers[1], 0);
    if (t > 4.5) assert.deepEqual(s.drawers, [0, 0, 0]);
    opened = Math.max(opened, s.drawers[0], s.drawers[2]);
  }
  assert.ok(opened > 0.99);
  assert.ok(miss(7.5).unasked.opacity > 0.99);
  assert.ok(miss(7.5).unasked.strike > 0.99);
});

test('ClipboardForm margin short: scribbled and wiped, nothing else', () => {
  const at = (t: number) => form({ mode: 'margin', short: true, marks: [0.6, 2.1] }, t, [0.2], 3.6);
  assert.ok(at(1.2).margin.write > 0.99);
  assert.equal(at(1.2).margin.erase, 0);
  assert.ok(at(3.6).margin.erase > 0.99);
  for (let t = 0; t <= 3.6; t += 0.1) {
    const s = at(t);
    assert.equal(s.zero + s.full + s.second + s.grid.opacity + s.named.opacity + s.notes.opacity + s.ticks, 0);
  }
});

test('MemoryOffice human: no cracks; the head, the inbox and the fridge come in on their words', () => {
  const at = (t: number) => office({ mode: 'human', marks: [2.1, 2.8, 5] }, t, [0.2], 6.2);
  for (let t = 0; t <= 6.2; t += 0.1) assert.deepEqual(at(t).crack, [0, 0, 0, 0, 0]);
  assert.deepEqual(at(1.8).human, [0, 0, 0]);
  assert.ok(at(2.5).human[0] > 0.99 && at(2.5).human[1] === 0);
  assert.ok(at(3.3).human[1] > 0.99 && at(3.3).human[2] === 0);
  assert.deepEqual(at(6.2).human, [1, 1, 1]);
});
