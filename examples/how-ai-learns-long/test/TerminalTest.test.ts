import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LESSONS, STAT_HOLD, frameState, XF } from '../src/anim/TerminalTest.state.ts';

const FREE = new Set(['index']);

const check = (value: unknown, path: string) => {
  if (typeof value === 'number') {
    assert.ok(Number.isFinite(value), `${path} is ${value}`);
    const key = path.split('.').at(-1)!;
    if (!FREE.has(key)) assert.ok(value >= 0 && value <= 1, `${path} = ${value} is outside [0, 1]`);
  } else if (Array.isArray(value)) value.forEach((v, i) => check(v, `${path}[${i}]`));
  else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) check(v, `${path}.${k}`);
};

const REAL = {
  full: { beats: [0.2, 14.31, 21.78, 27.33], marks: [8.32, 12.88, 14.91, 20.35, 26.3, 32.33], dur: 33.9 },
  lora: { beats: [0.2, 8.63], marks: [4.48, 6.48, 7.68, 10.99], dur: 14.63 },
} as const;

test('TerminalTest is total over [-1, dur + 1] with normal, missing, late and NaN marks', () => {
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
      for (let t = -1; t <= v.dur + 1; t += 0.25) {
        const s = frameState({ mode, marks: v.marks }, t, v.beats, v.dur);
        check(s, `${mode}@${t}`);
        assert.ok(Number.isInteger(s.lesson.index) && s.lesson.index >= 0 && s.lesson.index < LESSONS.length);
      }
      check(frameState({ mode, marks: v.marks }, NaN, v.beats, v.dur), `${mode}@NaN`);
    }
  }
});

test('full: ticks pile up, then the manners blur and the note falls, the close-up, then "none"', () => {
  const { beats, marks, dur } = REAL.full;
  const at = (t: number) => frameState({ mode: 'full', marks: [...marks] }, t, [...beats], dur);
  assert.equal(at(0).panels.desk, 1);
  assert.equal(at(0).tally.fill, 0);
  assert.ok(at(10).tally.fill > 0.2 && at(10).tally.fill < 1);
  assert.equal(at(13.5).tally.fill, 1);
  assert.equal(at(13.5).tally.learned, 1);
  assert.equal(at(15).panels.book, 1);
  assert.ok(at(17).book.blur > 0.9 && at(17).book.fall > 0.9);
  assert.equal(at(19).stat.text, 0);
  assert.equal(at(21).stat.text, 1);
  assert.equal(at(24).panels.page, 1);
  assert.equal(at(25).page.forget, 0);
  assert.equal(at(28).panels.unseen, 1);
  assert.equal(at(31).unseen.none, 0);
  const end = at(dur);
  assert.equal(end.unseen.none, 1);
  assert.equal(end.unseen.cross, 1);
  assert.equal(end.panels.desk, 0);
});

test('lora: same ticks on both sides; only the rewritten book loses its manners; "some" vs "none"', () => {
  const { beats, marks, dur } = REAL.lora;
  const at = (t: number) => frameState({ mode: 'lora', marks: [...marks] }, t, [...beats], dur);
  assert.equal(at(0).lora.ticks, 0);
  assert.equal(at(5.5).lora.ticks, 1);
  assert.equal(at(6).lora.leftFall, 0);
  assert.equal(at(7.6).lora.leftFall, 1);
  assert.equal(at(8.2).lora.up, 1);
  assert.equal(at(8.2).lora.rows, 0);
  assert.equal(at(10.5).lora.some, 0);
  const end = at(dur);
  assert.equal(end.lora.some, 1);
  assert.equal(end.lora.none, 1);
  assert.equal(end.lora.rowFill, 1);
});

test('full: the stage is never empty and panels overlap only in the crossfade at a line start', () => {
  const { beats, marks, dur } = REAL.full;
  const starts = [beats[1], beats[2] + STAT_HOLD, beats[3]];
  for (let t = 0; t <= dur; t += 0.02) {
    const p = frameState({ mode: 'full', marks: [...marks] }, t, [...beats], dur).panels;
    const vals = Object.values(p);
    assert.ok(Math.max(...vals) >= 0.4, `stage nearly empty at ${t.toFixed(2)}`);
    const shown = vals.filter((v) => v > 0.001).length;
    assert.ok(shown <= 2, `${shown} panels at ${t.toFixed(2)}`);
    if (shown === 2) assert.ok(starts.some((b) => t >= b - 0.1 && t <= b + XF), `two panels outside a crossfade at ${t.toFixed(2)}`);
  }
  // the outgoing panel is still fully on until the next line starts (its last word has been said)
  for (const b of starts) {
    const p = frameState({ mode: 'full', marks: [...marks] }, b - 0.15, [...beats], dur).panels;
    assert.ok(Math.max(...Object.values(p)) === 1, `a panel holds at ${(b - 0.15).toFixed(2)}`);
  }
});
