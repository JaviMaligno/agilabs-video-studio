// Behaviour of the bespoke memory-office components (the totality sweep is in anim.test.ts).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ADVICE_LINE, OFFICE_MODES, frameState as office } from '../src/anim/MemoryOffice.state.ts';
import { BAYS, HERE_TEXT, LANDING_BAY, NOON, ROBOT_PATH, TWO, WAREHOUSE_MODES, frameState as warehouse } from '../src/anim/WarehouseShelves.state.ts';
import { SLIP_PATH, frameState as head } from '../src/anim/HeadShelf.state.ts';
import { CARD_TEXT, CROWDED_PAGES, DESK_MODES, FORK, MAX_PAGES, ONE_IN_TEXT, WORK_PAGES, frameState as desk } from '../src/anim/MemoryDesk.state.ts';
import { CABINET_MODES, DRAWER_TAGS, LINE_TEXT, STAT_TEXT, frameState as cabinet } from '../src/anim/FilingCabinet.state.ts';
import { CASCADE, FORM_MODES, FULL_TEXT, MARGIN_TEXT, NAMED_LABEL, NAMED_VALUE, NOTES_TEXT, RUNS, SECOND_TEXT, STEPS, ZERO_TEXT, frameState as form } from '../src/anim/ClipboardForm.state.ts';
import { SHELF0, SLIP_TEXT } from '../src/anim/memory.ts';

/** Fields that are opacities or progress and must stay within [0, 1] in these components. */
const UNIT = new Set([
  'lit', 'crack', 'glow', 'armUp', 'blink', 'opacity', 'onCard', 'links', 'line', 'carry', 'pallets', 'ghost', 'drop', 'arrive',
  'question', 'books', 'cap', 'lock', 'bounce', 'desk', 'deskLit', 'cover', 'spill', 'gauge', 'amber', 'squeeze', 'write', 'fade',
  'move', 'tick', 'pile', 'sweep', 'inDrawer', 'drawers', 'clean', 'found', 'peek', 'cross', 'boxes', 'shelfRow', 'rowLit', 'strike',
  'prog', 'fly', 'erase', 'eraser', 'scribble', 'zero', 'fill', 'full', 'inset',
  'rules', 'top', 'one', 'other', 'label', 'needed', 'fork', 'here', 'stream', 'doors', 'back', 'fall', 'into', 'tags', 'stat', 'ghost', 'glow', 'second', 'dim', 'record', 'mismatch', 'follow',
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
  ...WAREHOUSE_MODES.map((mode): [string, St] => [`warehouse ${mode}`, (t, b, d) => warehouse({ mode }, t, b, d)]),
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

test('on-screen texts are exactly the agreed ones', () => {
  assert.equal(SLIP_TEXT, 'SHELF 0: EMPTY');
  assert.equal(SHELF0, 'SHELF 0');
  assert.equal(ZERO_TEXT, '0/24');
  assert.equal(FULL_TEXT, '24/24');
  assert.equal(RUNS, 24);
  assert.equal(ADVICE_LINE, 'what my tests point to');
  assert.equal(CARD_TEXT, 'shelf 0: empty');
  assert.equal(MARGIN_TEXT, 'shelf 4: quarantine');
});

test('the cold open carries the slip from the very first frame', () => {
  const s = office({ mode: 'cold' }, 0, [0.1], 4);
  assert.equal(s.slip.opacity, 1);
  assert.equal(s.robot.armUp, 1);
  assert.ok(s.lit.every((l, i) => (i === 1 ? l > 0 : l === 0)), 'only the desk is lit; the rest are dim outlines');
});

test('MemoryOffice: verdict cracks every object on the job, never the head shelf; advice heals and links', () => {
  for (const { beats, dur } of SCENES) {
    const v = office({ mode: 'verdict' }, dur, beats, dur);
    assert.deepEqual(v.crack, [0, 1, 1, 1, 1]);
    const a = office({ mode: 'advice' }, dur, beats, dur);
    assert.deepEqual(a.crack, [0, 0, 0, 0, 0]);
    assert.equal(a.slip.onCard, 1);
    assert.deepEqual(a.links, [1, 1]);
    assert.equal(a.line, 1);
    const l = office({ mode: 'layers' }, dur, beats, dur);
    assert.equal(l.lit[0], 1);
    assert.equal(l.lit[1], 1);
    assert.ok(l.lit.slice(2).every((x) => x < 0.5), 'the rest dim again at the end of the layers scene');
  }
  // Cracks come one after another.
  const mid = office({ mode: 'verdict', marks: [0.2, 0.8, 2, 3] }, 2.5, [0, 1.8], 6);
  assert.ok(mid.crack[1] > mid.crack[4]);
});

test('WarehouseShelves: the slip drops and shelf 0 empties only from its beat; later spins the clock', () => {
  const before = warehouse({ mode: 'day' }, 0.5, [0.3, 3], 7);
  assert.equal(before.slip.opacity, 0);
  assert.equal(before.ghost, 0);
  assert.equal(before.pallets[0], 1);
  assert.equal(before.pallets.length, BAYS);
  assert.equal(before.pallets[LANDING_BAY], 0, 'the landing bay is free');
  for (const { beats, dur } of SCENES) {
    const end = warehouse({ mode: 'day' }, dur, beats, dur);
    assert.equal(end.slip.drop, 1);
    assert.equal(end.ghost, 1);
    assert.equal(end.pallets[0], 0);
    assert.equal(end.robot.x, ROBOT_PATH.desk);
    assert.equal(end.glow, 1);
    assert.equal(end.here, 1);
    const later = warehouse({ mode: 'later' }, dur, beats, dur);
    assert.equal(later.question, 1);
    assert.equal(later.pallet.move, 1);
    assert.equal(later.cross, 1);
    assert.equal(later.pallets[LANDING_BAY], 1);
    assert.equal(later.pallets[0], 0, 'shelf 0 stays empty');
    assert.deepEqual([later.clock.hour, later.clock.minute], [TWO.hour, TWO.minute]);
  }
});

test('WarehouseShelves day: noon on the clock from frame 0; shelf 0 glows and says "next pallet → here" in order', () => {
  assert.equal(HERE_TEXT, 'next pallet → here');
  const marks = [2.5, 4.5, 6.5];
  const at = (t: number) => warehouse({ mode: 'day', marks }, t, [0.1], 8.5);
  const s0 = at(0);
  assert.equal(s0.clock.opacity, 1);
  assert.deepEqual([s0.clock.hour, s0.clock.minute], [NOON.hour, NOON.minute]);
  assert.equal(at(4.4).glow, 0);
  assert.ok(at(5.4).glow > 0.99);
  assert.equal(at(6.3).here, 0);
  assert.ok(at(7).here > 0.99);
  // "here" never before the shelf is empty, whatever the marks say.
  const odd = (t: number) => warehouse({ mode: 'day', marks: [2, 5, 1] }, t, [0.1], 8);
  assert.equal(odd(4.9).here, 0);
});

test('WarehouseShelves later: 12:00 to 2:00, then the pallet glides past shelf 0 and lands elsewhere, cross', () => {
  const marks = [0.5, 3.5, 6.5];
  const at = (t: number) => warehouse({ mode: 'later', marks }, t, [0.2], 8);
  assert.deepEqual([at(0).clock.hour, at(0).clock.minute], [NOON.hour, NOON.minute]);
  assert.ok(Math.abs(at(2.5).clock.hour - TWO.hour) < 1e-6);
  assert.equal(at(2.6).pallet.move, 0);
  const mid = at(3.6);
  assert.ok(mid.pallet.move > 0 && mid.pallet.move < 1);
  assert.equal(mid.cross, 0);
  assert.equal(mid.pallets[LANDING_BAY], 0);
  let prev = 0;
  for (let t = 0; t <= 8; t += 0.1) {
    const s = at(t);
    assert.ok(s.pallet.move >= prev - 1e-12, 'the pallet never goes back');
    prev = s.pallet.move;
    assert.equal(s.glow, 1, 'shelf 0 glows the whole time');
    assert.equal(s.pallets[0], 0);
  }
  assert.ok(at(5.6).cross > 0.99);
  assert.equal(at(6.2).question, 0);
  assert.ok(at(7).question > 0.99);
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
  }
});

test('HeadShelf: books stream in on "reads", the doors close on "slow", and only then does the slip fly', () => {
  const marks = [2, 9, 15, 16, 20, 11, 6];
  const at = (t: number) => head({ marks }, t, [1.3, 8, 14], 24);
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

test('MemoryDesk: pages pile up and spill; the summary keeps the slip on one card', () => {
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
    assert.equal(sum.inset.tick, 1);
    assert.equal(sum.slip.opacity, 0);
  }
  // The summary starts where the full desk ended.
  const s0 = desk({ mode: 'summary' }, 0, [0.2, 6], 9);
  assert.equal(s0.pages, MAX_PAGES);
  assert.equal(s0.amber, 1);
});

test('FilingCabinet: the slip is filed and never found; the pallet goes to the wrong shelf', () => {
  for (const { beats, dur } of SCENES) {
    const filed = cabinet({ mode: 'file' }, dur, beats, dur);
    assert.equal(filed.sweep, 1);
    assert.equal(filed.peek, 1);
    assert.equal(filed.lens.question, 1);
    assert.deepEqual(filed.drawers, [0, 0, 0]);
    const miss = cabinet({ mode: 'miss' }, dur, beats, dur);
    assert.equal(miss.drawers[1], 0, 'the slip drawer is never opened');
    assert.equal(miss.inset.cross, 1);
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
});

test('ClipboardForm: replace rewrites the box; margin erases, then 24 ticks; wrong ticks a wrong value', () => {
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
    assert.equal(r.value.text, 'pallet');
    assert.equal(r.value.next, 'empty');
    assert.equal(r.value.write, 1);
    assert.equal(r.slip.opacity, 0);
    const m = form({ mode: 'margin' }, dur, beats, dur);
    assert.equal(m.margin.erase, 1);
    assert.equal(m.zero, 1); // 0/24 stays as the first row of the results
    assert.equal(m.ticks, RUNS);
    assert.equal(m.full, 1);
    assert.equal(m.shelfRow, 1);
    assert.deepEqual(m.named, { opacity: 1, write: 1, glow: 1 });
    assert.equal(m.second, 1);
    assert.equal(m.notes.fill, 0.5, 'the notes box is half-filled');
    assert.equal(m.notes.dim, 1);
    const w = form({ mode: 'wrong' }, dur, beats, dur);
    assert.equal(w.value.next, 'full');
    assert.equal(w.value.write, 1);
    assert.equal(w.tick, 1);
    assert.equal(w.cascade, CASCADE);
    assert.equal(w.record, 1);
    assert.equal(w.pages, 1, 'the record is back beside the form');
    assert.equal(w.follow, 1);
  }
  // The SHELF 0 box stays on the form throughout the margin scene: the missing box is another one.
  for (let t = 0; t <= 9; t += 0.25) assert.equal(form({ mode: 'margin' }, t, [0.2, 4], 9).shelfRow, 1);
});

test('ClipboardForm figures and labels are the agreed ones', () => {
  assert.deepEqual([ZERO_TEXT, FULL_TEXT, SECOND_TEXT, NOTES_TEXT], ['0/24', '24/24', '16/24', '10/24']);
  assert.equal(NAMED_LABEL, 'QUARANTINED');
  assert.equal(NAMED_VALUE, 'shelf 4');
  assert.deepEqual(STEPS, { from: 10, to: 200 });
  assert.equal(CASCADE, 25);
});

test('ClipboardForm replace: the counter runs 10 to 200 after the rewrite; the ghost stack grows, the form does not', () => {
  const marks = [3.8, 4.6, 6.5, 16, 19, 23, 25];
  const at = (t: number) => form({ mode: 'replace', marks }, t, [1.3, 12.5, 20.6], 27);
  assert.equal(at(22).counter.opacity, 0);
  assert.equal(at(22).ghost, 0);
  assert.equal(at(23).counter.step, STEPS.from);
  let prev = 0;
  for (let t = 22; t <= 27; t += 0.1) {
    const s = at(t);
    assert.ok(Number.isInteger(s.counter.step) && s.counter.step >= prev && s.counter.step <= STEPS.to);
    prev = s.counter.step;
  }
  assert.equal(at(26).counter.step, STEPS.to);
  assert.equal(at(26).ghost, 1);
  // A counter mark before the rewrite is pushed after it.
  const odd = (t: number) => form({ mode: 'replace', marks: [1, 2, 3, 6, 7, 2, 3] }, t, [0.3, 5], 12);
  assert.equal(odd(7.3).counter.opacity, 0);
});

test('ClipboardForm margin: jotted, wiped (0/24), named box with 24/24 and 16/24, notes half-filled then dimmed', () => {
  const marks = [5, 8.4, 14, 16.6, 21, 24];
  const at = (t: number) => form({ mode: 'margin', marks }, t, [0.2, 9.4, 19.7], 26);
  assert.ok(at(4.8).margin.write > 0);
  assert.equal(at(8).margin.erase, 0);
  assert.ok(at(9.2).margin.erase > 0.99);
  assert.ok(at(9.4).zero > 0.99);
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

test('ClipboardForm wrong: tick on the wrong value, then 25 mistakes, then the record comes back and is followed', () => {
  const marks = [4, 7, 6.4, 9.7, 13.6, 20, 27];
  const at = (t: number) => form({ mode: 'wrong', marks }, t, [0.2, 5.2, 16.8], 30);
  assert.equal(at(9.6).tick, 0);
  assert.ok(at(10.2).tick > 0.99);
  assert.equal(at(13.5).cascade, 0);
  let prev = 0;
  for (let t = 13; t <= 16; t += 0.05) {
    const c = at(t).cascade;
    assert.ok(Number.isInteger(c) && c >= prev && c <= CASCADE);
    prev = c;
  }
  assert.equal(at(15.5).cascade, CASCADE);
  assert.ok(at(12).pages < 0.05, 'the record is gone while the form misremembers');
  assert.ok(at(20.6).record > 0.99);
  assert.ok(at(20.9).mismatch > 0);
  assert.equal(at(26.9).follow, 0);
  assert.ok(at(27.5).follow > 0.99);
});

test('MemoryDesk work: the record piles under the slip, which stays on top; the pallet goes to shelf 0', () => {
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
  assert.equal(at(11).inset.opacity, 0);
  assert.equal(at(13).inset.tick, 0);
  assert.ok(at(14.8).inset.tick > 0.99);
  for (const { beats, dur } of SCENES) {
    const end = desk({ mode: 'work' }, dur, beats, dur);
    assert.equal(end.rules, 1);
    assert.equal(end.pages, WORK_PAGES);
    assert.equal(end.inset.move, 1);
    assert.equal(end.inset.tick, 1);
  }
  // A late shelf mark never moves the pallet before the "uses" beat.
  const late = (t: number) => desk({ mode: 'work', marks: [1, 2, 9, 3] }, t, [0.3, 8], 14);
  assert.equal(late(8.6).inset.move, 0);
});

test('MemoryDesk crowded: a tall pile buries the slip; ~600 decisions with one miss, a second strip; the needed page glows', () => {
  const marks = [0.6, 5, 10, 14];
  const at = (t: number) => desk({ mode: 'crowded', marks }, t, [0.2, 12.3], 18);
  assert.equal(at(0).pages, WORK_PAGES, 'starts where the work scene ended');
  assert.equal(at(0).slip.cover, 0);
  assert.equal(at(4).pages, CROWDED_PAGES);
  assert.equal(at(4).slip.cover, 1);
  assert.equal(at(4).strips.opacity, 0);
  assert.ok(at(5.8).strips.one > 0 && at(5.8).strips.one < 1);
  assert.equal(at(7).strips.one, 1);
  assert.equal(at(9.9).strips.other, 0);
  assert.equal(at(12).strips.other, 1);
  assert.equal(at(13.9).needed, 0);
  assert.ok(at(14.6).needed > 0.99);
  assert.ok(at(18).pages <= MAX_PAGES);
  for (const { beats, dur } of SCENES) {
    const end = desk({ mode: 'crowded' }, dur, beats, dur);
    assert.equal(end.strips.one, 1);
    assert.equal(end.strips.other, 1);
    assert.equal(end.strips.label, 1);
    assert.equal(end.needed, 1);
    assert.equal(end.spill, 0);
  }
  assert.equal(ONE_IN_TEXT, '1 in ~600');
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

test('FilingCabinet file: inbox folds in, then the cold open comes back with the pallet passing shelf 0', () => {
  const marks = [3, 10, 16, 17, 13, 24];
  const at = (t: number) => cabinet({ mode: 'file', marks }, t, [1.3, 11.9, 18], 27);
  assert.equal(at(12.7).inbox.opacity, 0);
  assert.ok(at(13.4).inbox.opacity > 0.99);
  assert.equal(at(13.4).inbox.into, 0);
  assert.ok(at(16.5).inbox.into > 0.99);
  assert.equal(at(23.6).callback.opacity, 0);
  const mid = at(24.9);
  assert.ok(mid.callback.opacity > 0.99 && mid.callback.move > 0 && mid.callback.move < 1);
  assert.equal(mid.callback.cross, 0);
  assert.ok(at(26.5).callback.cross > 0.99);
  for (const { beats, dur } of SCENES) {
    const end = cabinet({ mode: 'file' }, dur, beats, dur);
    assert.deepEqual(end.callback, { opacity: 1, move: 1, cross: 1 });
    assert.equal(end.inbox.into, 1);
  }
  // The callback never comes before the question, whatever the marks.
  const odd = (t: number) => cabinet({ mode: 'file', marks: [1, 2, 3, 6, 2, 1] }, t, [0.3], 12);
  assert.equal(odd(6.2).callback.opacity, 0);
});

test('FilingCabinet miss: tags on the drawers it searches, "1 search in 40", a second pass, then the line', () => {
  assert.deepEqual([...DRAWER_TAGS], ['shelf 1', '', 'shelf 2']);
  assert.equal(STAT_TEXT, '1 search in 40');
  assert.equal(LINE_TEXT, 'A plain search only helps if you know what to look for.');
  const marks = [2, 8, 13, 14, 19, 23, 30];
  const at = (t: number) => cabinet({ mode: 'miss', marks }, t, [0.2, 10.7, 21.5], 33);
  assert.equal(at(7.5).tags, 0);
  assert.ok(at(8.2).tags > 0.99);
  assert.equal(at(18.8).stat, 0);
  assert.ok(at(19.5).stat > 0.99);
  // The second pass opens the searched drawers again, never the slip's.
  let reopened = 0;
  for (let t = 23; t < 30; t += 0.05) {
    const s = at(t);
    reopened = Math.max(reopened, s.drawers[0], s.drawers[2]);
    assert.equal(s.drawers[1], 0);
  }
  assert.ok(reopened > 0.5);
  assert.equal(at(29.8).line, 0);
  assert.ok(at(30.6).line > 0.99);
  for (const { beats, dur } of SCENES) {
    const end = cabinet({ mode: 'miss' }, dur, beats, dur);
    assert.equal(end.stat, 1);
    assert.equal(end.line, 1);
    assert.deepEqual(end.drawers, [0, 0, 0]);
  }
});
