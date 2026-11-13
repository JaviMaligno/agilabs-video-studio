// Behaviour of the bespoke memory-office components (the totality sweep is in anim.test.ts).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ADVICE_LINE, OFFICE_MODES, frameState as office } from '../src/anim/MemoryOffice.state.ts';
import { ROBOT_PATH, WAREHOUSE_MODES, frameState as warehouse } from '../src/anim/WarehouseShelves.state.ts';
import { SLIP_PATH, frameState as head } from '../src/anim/HeadShelf.state.ts';
import { CARD_TEXT, DESK_MODES, MAX_PAGES, frameState as desk } from '../src/anim/MemoryDesk.state.ts';
import { CABINET_MODES, frameState as cabinet } from '../src/anim/FilingCabinet.state.ts';
import { FORM_MODES, FULL_TEXT, MARGIN_TEXT, RUNS, ZERO_TEXT, frameState as form } from '../src/anim/ClipboardForm.state.ts';
import { SHELF0, SLIP_TEXT } from '../src/anim/memory.ts';

/** Fields that are opacities or progress and must stay within [0, 1] in these components. */
const UNIT = new Set([
  'lit', 'crack', 'glow', 'armUp', 'blink', 'opacity', 'onCard', 'links', 'line', 'carry', 'pallets', 'ghost', 'drop', 'arrive',
  'question', 'books', 'cap', 'lock', 'bounce', 'desk', 'deskLit', 'cover', 'spill', 'gauge', 'amber', 'squeeze', 'write', 'fade',
  'move', 'tick', 'pile', 'sweep', 'inDrawer', 'drawers', 'clean', 'found', 'peek', 'cross', 'boxes', 'shelfRow', 'rowLit', 'strike',
  'prog', 'fly', 'erase', 'eraser', 'scribble', 'zero', 'fill', 'full', 'inset',
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
  assert.equal(MARGIN_TEXT, 'shelf 0: empty');
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
  for (const { beats, dur } of SCENES) {
    const end = warehouse({ mode: 'day' }, dur, beats, dur);
    assert.equal(end.slip.drop, 1);
    assert.equal(end.ghost, 1);
    assert.equal(end.pallets[0], 0);
    assert.equal(end.robot.x, ROBOT_PATH.desk);
    const later = warehouse({ mode: 'later' }, dur, beats, dur);
    assert.equal(later.question, 1);
    assert.equal(later.conveyor.arrive, 1);
    assert.equal(later.clock.minute, 1440);
  }
});

test('HeadShelf: the slip hits the glass, bounces off and lands on the desk', () => {
  const marks = [1, 2, 3, 4, 6];
  assert.equal(head({ marks }, 2.5, [0.3, 2.9, 5.2], 8).slip.opacity, 0);
  const atGlass = head({ marks }, 4, [0.3, 2.9, 5.2], 8);
  assert.ok(Math.abs(atGlass.slip.x - SLIP_PATH.door.x) < 1 && Math.abs(atGlass.slip.y - SLIP_PATH.door.y) < 1);
  assert.ok(head({ marks }, 4.2, [0.3, 2.9, 5.2], 8).bounce > 0);
  for (const { beats, dur } of SCENES) {
    const end = head({}, dur, beats, dur);
    assert.ok(Math.abs(end.slip.x - SLIP_PATH.desk.x) < 1e-6 && Math.abs(end.slip.y - SLIP_PATH.desk.y) < 1e-6);
    assert.equal(end.slip.opacity, 1);
    assert.equal(end.cap, 1);
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
    assert.equal(m.zero, 1);
    assert.equal(m.ticks, RUNS);
    assert.equal(m.full, 1);
    assert.equal(m.shelfRow, 1);
    const w = form({ mode: 'wrong' }, dur, beats, dur);
    assert.equal(w.value.next, 'full');
    assert.equal(w.value.write, 1);
    assert.equal(w.tick, 1);
    assert.equal(w.pages, 0);
  }
  // The margin scene opens on a form without the SHELF 0 box.
  assert.ok(form({ mode: 'margin' }, 1, [0.2, 4], 9).shelfRow < 0.05);
});
