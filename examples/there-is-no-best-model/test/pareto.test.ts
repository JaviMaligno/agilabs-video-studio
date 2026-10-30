import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as P from '../src/anim/Pareto.state.ts';

const MODES = Object.keys(P.STEPS) as P.ParetoMode[];
const PROGRESS = new Set(['appear', 'progress', 'slider']);

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

const SCENARIOS = [
  { beats: [0.3, 1.4, 2.6, 3.5], dur: 5 },
  { beats: [], dur: 4 },
  { beats: [1, 9], dur: 4 },
  { beats: [0], dur: 0.5 },
];

test('Pareto: every mode is total over [0, sceneEnd]', () => {
  for (const mode of MODES) {
    for (const { beats, dur } of SCENARIOS) {
      for (const t of [-1, 0, ...beats, dur / 2, dur, dur + 2, NaN]) {
        const s = P.frameState({ mode }, t, beats, dur);
        assert.equal(s.appear.length, P.STEPS[mode]);
        check(s, `${mode}@t=${t},dur=${dur},beats=[${beats}]`);
      }
    }
  }
});

test('Pareto: every step and long move is finished by the scene end', () => {
  for (const mode of MODES) {
    for (const { beats, dur } of SCENARIOS) {
      const s = P.frameState({ mode }, dur, beats, dur);
      assert.ok(s.appear.every((x) => x === 1), `${mode} at dur=${dur}`);
      assert.equal(s.progress, 1, `${mode} progress at dur=${dur}`);
    }
  }
});

test('Pareto: nothing shows before its narration line', () => {
  // Steps tied to line i stay at 0 until that line starts.
  const beats = [0.5, 3, 6, 9];
  for (const mode of MODES) {
    P.STEP_PLAN[mode].forEach(([line, delay], i) => {
      if (beats[line] === undefined) return;
      const s = P.frameState({ mode }, beats[line] + delay - 0.01, beats, 20);
      assert.equal(s.appear[i], 0, `${mode} step ${i}`);
      const later = P.frameState({ mode }, beats[line] + delay + P.STEP_LEN, beats, 20);
      assert.equal(later.appear[i], 1, `${mode} step ${i} done`);
    });
  }
});

test('Pareto: each mode is planned on the narration lines it declares', () => {
  for (const mode of MODES) {
    const maxLine = Math.max(...P.STEP_PLAN[mode].map(([l]) => l));
    assert.equal(maxLine + 1, P.BEATS[mode], mode);
  }
});

test('Pareto: `at` overrides a step', () => {
  const s = P.frameState({ mode: 'hook', at: [undefined, 2] }, 2.1, [0, 5], 8);
  assert.ok(s.appear[1] > 0 && s.appear[1] < 1);
  assert.equal(s.appear[3], 0);
});

test('newmodels: no robot lights all three of cheap / fast / smart; each lights two', () => {
  for (const r of P.STREAM) {
    assert.equal(r.lit.filter(Boolean).length, 2, r.name);
  }
  // Robots arrive in order and all have arrived by the end of the stream.
  const n = P.STREAM.length;
  for (let i = 1; i < n; i++) assert.ok(P.arrival(0.3, i, n) <= P.arrival(0.3, i - 1, n));
  for (let i = 0; i < n; i++) assert.equal(P.arrival(1, i, n), 1);
});

test('parcel / dominated: only the slow, pricey van is dominated', () => {
  const vans = [P.VANS.fast, P.VANS.snail, P.VANS.pricey];
  assert.equal(P.isDominated(P.VANS.pricey, vans, P.VAN_BETTER), true);
  assert.equal(P.isDominated(P.VANS.fast, vans, P.VAN_BETTER), false);
  assert.equal(P.isDominated(P.VANS.snail, vans, P.VAN_BETTER), false);
  // Next-day: fast and expensive; standard: slow and cheap.
  assert.ok(P.VANS.fast.x > P.VANS.snail.x && P.VANS.fast.y > P.VANS.snail.y);
  // Better is up on the parcel plane, as on the model plane (quality up).
  assert.equal(P.VAN_BETTER.y, P.MODEL_BETTER.y);
});

test('frontier: four labelled models on the frontier, two dominated, staircase like figure 1', () => {
  const front = P.frontierOf(P.MODELS, P.MODEL_BETTER);
  assert.deepEqual(front.map((m) => (m as (typeof P.MODELS)[number]).label), ['small', 'mid', 'large', 'flagship']);
  assert.equal(P.MODELS.filter((m) => P.isDominated(m, P.MODELS, P.MODEL_BETTER)).length, 2);
  const st = P.staircase(front);
  assert.equal(st.length, 2 * front.length - 1);
  // Every segment is horizontal or vertical: a staircase, never a diagonal.
  for (let i = 1; i < st.length; i++) assert.ok(st[i].x === st[i - 1].x || st[i].y === st[i - 1].y);
  assert.deepEqual(P.pointAlong(st, 0), st[0]);
  assert.deepEqual(P.pointAlong(st, 1), st.at(-1));
});

test('frontier: the slider moves along the staircase and settles mid-way', () => {
  assert.equal(P.sliderAt(0), 0);
  assert.equal(P.sliderAt(0.6), 1);
  assert.ok(Math.abs(P.sliderAt(1) - 0.45) < 1e-9);
  const s = P.frameState({ mode: 'frontier' }, 10, [0, 1, 2], 10);
  assert.ok(Math.abs(s.slider - 0.45) < 1e-9);
});

test('reasoning: the dial goes default → low → high → back to default; numbers as in the article', () => {
  const beats = [0, 3, 7];
  const at = (t: number) => P.frameState({ mode: 'reasoning' }, t, beats, 12).dial;
  assert.equal(at(1), 0);
  assert.equal(at(3 + P.STEP_LEN + 0.1), -1);
  assert.equal(at(7 + P.STEP_LEN + 0.1), 1);
  assert.equal(at(12), 0);
  assert.equal(P.REASONING.low.cost, -0.29);
  assert.equal(P.REASONING.default.time - P.REASONING.low.time, 16);
  assert.equal(P.REASONING.high.cost, 0.16);
  assert.ok(Math.abs(P.REASONING.high.time / P.REASONING.default.time - 1.2) < 1e-9);
});

test('scale: balanced (small wobble) in seconds, tipped to luna in decision', () => {
  for (const t of [0, 1, 2, 3, 4, 5]) {
    assert.ok(Math.abs(P.frameState({ mode: 'seconds' }, t, [0, 1, 3], 5).tilt) <= 2.5);
  }
  assert.equal(P.frameState({ mode: 'decision' }, 0, [0], 3).tilt, 0);
  assert.equal(P.frameState({ mode: 'decision' }, 3, [0], 3).tilt, P.TILT);
  assert.ok(P.TILT > 0, 'positive tilt lowers the luna (right) pan');
});

test('receipt: the lines add up to the total and the model is about 4%', () => {
  const r = P.RECEIPT;
  assert.ok(Math.abs(r.model + r.web + r.other - r.total) < 1e-12);
  assert.ok(r.other > 0 && r.other < r.model);
  assert.equal(Math.round((r.model / r.total) * 100), 4);
  assert.ok(r.web / r.total > 0.9);
});
