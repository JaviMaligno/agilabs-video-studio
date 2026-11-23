import { test } from 'node:test';
import assert from 'node:assert/strict';
import { A, M_BEST, X, costs, frameState, loses, total } from '../src/anim/ChainTradeoff.state.ts';

const PROGRESS = new Set(['progress', 'appear', 'grow', 'fill', 'draw', 'pop', 'opacity', 'emphasis']);

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

const CHAIN = { beats: [1.2, 4.51, 11.34, 15.21, 20.36, 22.87, 28.02, 30.69, 33.6, 38.59, 41.82], dur: 45.5 };
const CREDIT = { beats: [0.2, 5.91], dur: 9.2 };
const EDGE = [{ beats: [], dur: 4 }, { beats: [1, 9], dur: 4 }, { beats: [0], dur: 0.5 }, { beats: [50, 60], dur: 10 }];

test('ChainTradeoff is total in both modes, fractions within [0, 1]', () => {
  for (const mode of ['chain', 'credit']) {
    for (const { beats, dur } of [mode === 'chain' ? CHAIN : CREDIT, ...EDGE]) {
      for (const t of [-1, 0, ...beats, dur / 2, dur, dur + 2]) {
        for (const cues of [undefined, { again: 24, divisible: 25, meet: NaN }]) {
          const s = frameState({ mode, cues }, t, beats, dur);
          check(s, `${mode}@t=${t},dur=${dur}`);
          for (const [k, v] of Object.entries(s)) {
            if (typeof v === 'number' && k !== 'ambient') assert.ok(v >= 0 && v <= 1, `${mode}.${k} = ${v}`);
            if (Array.isArray(v)) v.forEach((x) => assert.ok(x >= 0 && x <= 1, `${mode}.${k} has ${x}`));
          }
        }
      }
    }
  }
});

test('the two costs meet at the minimum of their sum, m = √(X/A)', () => {
  assert.ok(Math.abs(loses(M_BEST) - costs(M_BEST)) < 1e-9);
  for (const m of [M_BEST * 0.8, M_BEST * 1.2, 1, 10]) assert.ok(total(m) > total(M_BEST));
  assert.ok(Math.abs(M_BEST - Math.sqrt(X / A)) < 1e-12);
});

test('chain steps land on their lines', () => {
  const { beats, dur } = CHAIN;
  const at = (t: number) => {
    const s = frameState({ mode: 'chain' }, t, beats, dur);
    if (s.chain !== 1) throw new Error('chain mode');
    return s;
  };
  assert.equal(at(0).question, 1);
  assert.equal(at(beats[1] + 1).question, 0);
  assert.equal(at(beats[3] - 0.01).seven, 0);
  assert.equal(at(beats[4] - 0.01).links[0], 0);
  assert.equal(at(beats[5]).links[0], 1);
  assert.equal(at(beats[5]).links[1], 0);
  assert.ok(at(beats[6]).links.every((l) => l === 1), 'all links by line 7');
  assert.equal(at(beats[6] - 0.01).axes, 0);
  assert.equal(at(beats[7] - 0.01).rise, 0);
  assert.equal(at(beats[8] - 0.01).total, 0);
  assert.equal(at(beats[9] - 0.01).best, 0);
  assert.equal(at(beats[10] - 0.01).banner, 0);
  const end = at(dur);
  assert.equal(end.banner, 1);
  assert.equal(end.root, 1);
  assert.equal(end.total, 1);
});

test('credit shows the card on the first line and the quote on the second', () => {
  const { beats, dur } = CREDIT;
  const s0 = frameState({ mode: 'credit' }, 0, beats, dur);
  if (s0.chain !== 0) throw new Error('credit mode');
  assert.equal(s0.card, 0);
  assert.equal(s0.quote, 0);
  const s1 = frameState({ mode: 'credit' }, beats[1] - 0.01, beats, dur);
  if (s1.chain !== 0) throw new Error('credit mode');
  assert.equal(s1.card, 1);
  assert.equal(s1.creditLabel, 1);
  assert.equal(s1.quote, 0);
  const end = frameState({ mode: 'credit' }, dur, beats, dur);
  if (end.chain !== 0) throw new Error('credit mode');
  assert.equal(end.quote, 1);
  assert.equal(end.author, 1);
});
