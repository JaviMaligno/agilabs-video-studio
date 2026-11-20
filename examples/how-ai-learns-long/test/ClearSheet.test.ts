import { test } from 'node:test';
import assert from 'node:assert/strict';
import { frameState, XF } from '../src/anim/ClearSheet.state.ts';

const FREE = new Set(['bob']);

const check = (value: unknown, path: string) => {
  if (typeof value === 'number') {
    assert.ok(Number.isFinite(value), `${path} is ${value}`);
    const key = path.split('.').at(-1)!.replace(/\[\d+\]$/, '');
    if (!FREE.has(key)) assert.ok(value >= 0 && value <= 1, `${path} = ${value} is outside [0, 1]`);
  } else if (Array.isArray(value)) value.forEach((v, i) => check(v, `${path}[${i}]`));
  else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) check(v, `${path}.${k}`);
};

const REAL = {
  lay: { beats: [1.2, 9.39], marks: [6.52, 10.23, 13.27], dur: 16.2 },
  more: { beats: [0.2, 9.91, 21.46, 29.09], marks: [2, 13.63, 18.91, 23.18, 28.22, 33.45], dur: 39.67 },
} as const;

test('ClearSheet is total over [-1, dur + 1] with normal, missing, late and NaN marks', () => {
  for (const [mode, r] of Object.entries(REAL)) {
    const variants: { beats: number[]; marks?: number[]; dur: number }[] = [
      { beats: [...r.beats], marks: [...r.marks], dur: r.dur },
      { beats: [], dur: r.dur },
      { beats: [...r.beats], marks: r.marks.map((m) => m + 50), dur: r.dur },
      { beats: r.beats.map(() => NaN), marks: r.marks.map(() => NaN), dur: r.dur },
      { beats: [...r.beats].reverse(), marks: [...r.marks].reverse(), dur: r.dur },
      { beats: [0], marks: [...r.marks], dur: 0.5 },
    ];
    for (const v of variants) {
      for (let t = -1; t <= v.dur + 1; t += 0.25) check(frameState({ mode, marks: v.marks }, t, v.beats, v.dur), `${mode}@${t}`);
      check(frameState({ mode, marks: v.marks }, NaN, v.beats, v.dur), `${mode}@NaN`);
    }
  }
});

test('lay: the sheet lowers on "sheet", the pen writes on it, then it lifts and the page is unchanged', () => {
  const { beats, marks, dur } = REAL.lay;
  const at = (t: number) => frameState({ mode: 'lay', marks: [...marks] }, t, [...beats], dur);
  assert.equal(at(0).sheet.opacity, 0);
  assert.equal(at(0).label.pop, 0);
  assert.equal(at(5).sheet.lower, 0);
  assert.equal(at(8).sheet.lower, 1);
  assert.ok(at(8).sheet.ink > 0);
  assert.ok(at(11.5).read.opacity > 0.9);
  assert.equal(at(13).sheet.lift, 0);
  const end = at(dur);
  assert.equal(end.sheet.lift, 1);
  assert.equal(end.unchanged.pop, 1);
  assert.equal(end.sheet.ink, 1);
  // the pen never shows before the sheet has landed (cause before effect)
  for (let t = 0; t <= dur; t += 0.1) {
    const s = at(t);
    if (s.sheet.lower < 0.85) assert.equal(s.pen.opacity, 0, `pen before the sheet at ${t}`);
  }
});

test('more: dial, then the rack and its swap, the form and terminal, the paper — one panel per line', () => {
  const { beats, marks, dur } = REAL.more;
  const at = (t: number) => frameState({ mode: 'more', marks: [...marks] }, t, [...beats], dur);
  assert.equal(at(1).panels.dial, 1);
  assert.equal(at(1).panels.rack, 0);
  assert.ok(at(4).dial.needle > 0.8, 'needle swings to "learn less, forget less"');
  assert.equal(at(12).panels.rack, 1);
  assert.equal(at(12).rack.on[0], 0);
  assert.ok(at(14.5).rack.on[0] > 0.9, 'a sheet slides onto the book on "swap"');
  assert.ok(at(17).rack.on[1] > 0.9 && at(17).rack.on[0] < 0.1, 'and is swapped');
  assert.equal(at(18).rack.cups, 0);
  assert.equal(at(20).rack.cups, 1);
  assert.equal(at(25).panels.form, 1);
  assert.equal(at(25).form.upload, 1);
  assert.equal(at(31).panels.paper, 1);
  assert.equal(at(31).paper.cover, 0);
  const end = at(dur);
  assert.equal(end.panels.dial, 0);
  assert.equal(end.paper.cover, 1);
  assert.equal(end.paper.learns, 1);
});

test('more: the stage is never empty and panels overlap only in the crossfade at a line start', () => {
  const { beats, marks, dur } = REAL.more;
  const starts = beats.slice(1);
  for (let t = 0; t <= dur; t += 0.02) {
    const p = frameState({ mode: 'more', marks: [...marks] }, t, [...beats], dur).panels;
    const vals = Object.values(p);
    assert.ok(Math.max(...vals) >= 0.4, `stage nearly empty at ${t.toFixed(2)}`);
    const shown = vals.filter((v) => v > 0.001).length;
    assert.ok(shown <= 2, `${shown} panels at ${t.toFixed(2)}`);
    if (shown === 2) assert.ok(starts.some((b) => t >= b - 0.1 && t <= b + XF), `two panels outside a crossfade at ${t.toFixed(2)}`);
  }
  // the outgoing panel is still fully on until the next line starts (its last word has been said)
  for (const b of starts) {
    const p = frameState({ mode: 'more', marks: [...marks] }, b - 0.15, [...beats], dur).panels;
    assert.ok(Math.max(...Object.values(p)) === 1, `a panel holds at ${(b - 0.15).toFixed(2)}`);
  }
});
