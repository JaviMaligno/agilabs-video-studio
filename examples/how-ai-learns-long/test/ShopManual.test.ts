import { test } from 'node:test';
import assert from 'node:assert/strict';
import { frameState, XF } from '../src/anim/ShopManual.state.ts';

/** Every number finite; panel opacities and progress-like fields within [0, 1]. */
const BOUNDED = new Set(['shelf', 'split', 'upload', 'swap', 'wrong', 'end', 'opacity', 'blink', 'armUp', 'binderLit', 'label', 'question', 'pull', 'answer', 'read', 'sweep', 'open', 'tab', 'arrow', 'lens', 'lensX', 'lensY', 'lift', 'out', 'in', 'underline', 'pulse', 'props', 'fade', 'book', 'glow', 'chats', 'pdfs', 'picked']);
const check = (v: unknown, path: string) => {
  if (typeof v === 'number') {
    assert.ok(Number.isFinite(v), `${path} is ${v}`);
    const key = path.split('.').at(-1)!.replace(/\[\d+\]$/, '');
    if (BOUNDED.has(key)) assert.ok(v >= 0 && v <= 1, `${path} = ${v} outside [0, 1]`);
  } else if (Array.isArray(v)) v.forEach((x, i) => check(x, `${path}[${i}]`));
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) check(x, `${path}.${k}`);
};

// The real scene: beats and marks from the Cartesia audio (timeline.ts), dur from the landscape cut.
const BEATS = [1.2, 14.27, 21.98, 31.93, 35.64, 44.39];
const MARKS = [1.88, 16.87, 22.5, 33.41, 36.8, 53.07];
const DUR = 54.5;

const SCENARIOS: { name: string; beats: number[]; marks?: number[]; dur: number }[] = [
  { name: 'real', beats: BEATS, marks: MARKS, dur: DUR },
  { name: 'no beats, no marks', beats: [], dur: DUR },
  { name: 'late marks', beats: BEATS, marks: MARKS.map((m) => m + 80), dur: DUR },
  { name: 'NaN marks', beats: BEATS, marks: MARKS.map(() => Number.NaN), dur: DUR },
  { name: 'out of order', beats: [20, 3, 9, 1], marks: [40, 2, 1, 0, 99, -5], dur: 30 },
  { name: 'short', beats: [0], dur: 0.5 },
];

test('ShopManual is total over t in [-1, dur + 1]', () => {
  for (const sc of SCENARIOS) {
    for (let t = -1; t <= sc.dur + 1; t += 0.25) check(frameState({ marks: sc.marks }, t, sc.beats, sc.dur), `${sc.name}@${t}`);
    check(frameState({ marks: sc.marks }, Number.NaN, sc.beats, sc.dur), `${sc.name}@NaN`);
  }
});

test('ShopManual: the shelf is on screen from frame 0, nothing else', () => {
  const s = frameState({ marks: MARKS }, 0, BEATS, DUR);
  assert.equal(s.panels.shelf, 1);
  assert.equal(s.panels.split + s.panels.upload + s.panels.swap + s.panels.wrong + s.panels.end, 0);
  assert.equal(s.shelf.question, 0);
  assert.equal(s.shelf.pull, 0);
});

test('ShopManual: each line shows its panel and its step has played by the line end', () => {
  const at = (t: number) => frameState({ marks: MARKS }, t, BEATS, DUR);
  // line 1: binder lit, question, two pages pulled
  assert.equal(at(13.6).panels.shelf, 1);
  assert.equal(at(13.6).shelf.pull, 1);
  assert.equal(at(13.6).shelf.binderLit, 1);
  // line 2: the note read on three chats, the binder open at a tab
  const s2 = at(21.3);
  assert.equal(s2.panels.split, 1);
  assert.deepEqual(s2.split.chats, [1, 1, 1]);
  assert.equal(s2.split.tab, 1);
  // line 3: PDFs dropped, two paragraphs picked and handed over
  const s3 = at(31.3);
  assert.equal(s3.panels.upload, 1);
  assert.deepEqual(s3.upload.pdfs, [1, 1, 1]);
  assert.deepEqual(s3.upload.picked, [1, 1]);
  assert.equal(s3.upload.lift, 1);
  // line 4: swapped page
  const s4 = at(35.0);
  assert.equal(s4.panels.swap, 1);
  assert.equal(s4.swap.in, 1);
  assert.equal(at(33.1).swap.out, 0, 'the page stays until "swap"');
  // line 5: wrong tab, answer, underline
  const s5 = at(43.7);
  assert.equal(s5.panels.wrong, 1);
  assert.equal(s5.wrong.tab, 1);
  assert.equal(s5.wrong.underline, 1);
  assert.equal(at(36.4).wrong.tab, 0, 'the wrong tab opens on "wrong"');
});

test('ShopManual: the stage is never empty and panels overlap only in the crossfade at a line start', () => {
  const dur = DUR;
  const starts = BEATS.slice(1);
  for (let t = 0; t <= dur; t += 0.02) {
    const p = frameState({ marks: MARKS }, t, BEATS, DUR).panels;
    const vals = Object.values(p);
    assert.ok(Math.max(...vals) >= 0.4, `stage nearly empty at ${t.toFixed(2)}`);
    const shown = vals.filter((v) => v > 0.001).length;
    assert.ok(shown <= 2, `${shown} panels at ${t.toFixed(2)}`);
    if (shown === 2) assert.ok(starts.some((b) => t >= b - 0.1 && t <= b + XF), `two panels outside a crossfade at ${t.toFixed(2)}`);
  }
  // the outgoing panel is still fully on until the next line starts (its last word has been said)
  for (const b of starts) {
    const p = frameState({ marks: MARKS }, b - 0.15, BEATS, DUR).panels;
    assert.ok(Math.max(...Object.values(p)) === 1, `a panel holds at ${(b - 0.15).toFixed(2)}`);
  }
});

test('ShopManual: end state at dur — props gone, robot visible, book glowing', () => {
  for (const sc of SCENARIOS) {
    const s = frameState({ marks: sc.marks }, sc.dur, sc.beats, sc.dur);
    assert.equal(s.panels.end, 1, sc.name);
    assert.equal(s.end.fade, 1);
    assert.equal(s.end.glow, 1);
    assert.equal(s.robot.opacity, 1);
  }
  // the glow waits for "inside"
  assert.equal(frameState({ marks: MARKS }, 52.5, BEATS, DUR).end.glow, 0);
});
