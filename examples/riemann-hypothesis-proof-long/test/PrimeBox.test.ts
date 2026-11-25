import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BOUNCER, BOX_PRIMES, frameState } from '../src/anim/PrimeBox.state.ts';

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

// The real beats of the scene (after TTS) plus the edge cases.
const REAL = { beats: [1.2, 4.43, 8.46, 12.25, 16.12, 20.39, 22.74, 28.21, 32.16, 35.55], dur: 40.6 };
const SCENARIOS = [REAL, { beats: [], dur: 4 }, { beats: [1, 9], dur: 4 }, { beats: [0], dur: 0.5 }, { beats: [50, 60, 70], dur: 10 }];

test('PrimeBox is total and keeps fractions within [0, 1]', () => {
  for (const { beats, dur } of SCENARIOS) {
    for (const t of [-1, 0, ...beats, dur / 2, dur, dur + 2]) {
      const s = frameState({ mode: 'idea' }, t, beats, dur);
      check(s, `PrimeBox@t=${t},dur=${dur}`);
      for (const [k, v] of Object.entries(s)) {
        if (typeof v === 'number' && k !== 'ambient' && k !== 'words') assert.ok(v >= 0 && v <= 1, `${k} = ${v}`);
        if (Array.isArray(v)) v.forEach((x) => assert.ok(x >= 0 && x <= 1, `${k} has ${x}`));
      }
    }
  }
});

test('PrimeBox opens on the pile and ends on the glowing divisible box', () => {
  const { beats, dur } = REAL;
  const s0 = frameState({ mode: 'idea' }, 0, beats, dur);
  assert.equal(s0.pile, 1);
  assert.equal(s0.box, 0);
  assert.equal(s0.words, 0);
  const end = frameState({ mode: 'idea' }, dur, beats, dur);
  assert.equal(end.boxB, 1);
  assert.equal(end.glow, 1);
  assert.equal(end.title, 1);
  assert.ok(end.ddrops.every((d) => d === 1));
  assert.equal(end.pile, 0);
});

test('PrimeBox steps land on their lines', () => {
  const { beats, dur } = REAL;
  const at = (t: number) => frameState({ mode: 'idea' }, t, beats, dur);
  // Sentence written during line 3, held, then a title from line 4.
  assert.equal(at(beats[2] - 0.05).words, 0);
  assert.ok(at(beats[2] + 3.3).words >= 10);
  assert.equal(at(beats[3] - 0.05).title, 0);
  assert.equal(at(beats[3] + 1).title, 1);
  // Four blocks drop during line 4, the fifth during line 5, then the bouncer.
  assert.ok(at(beats[4] - 0.05).drops.slice(0, 4).every((d) => d === 1));
  assert.equal(at(beats[4] - 0.05).drops[4], 0);
  assert.equal(at(beats[5]).drops[4], 1);
  assert.ok(at(beats[5]).bounce === 1, 'the bouncer has landed before line 6');
  assert.equal(at(beats[5] - 0.01).ceiling, 0);
  assert.equal(at(beats[6]).ceiling, 1);
  assert.equal(at(beats[7]).factorial, 1);
  assert.equal(at(beats[8] - 0.01).slack, 0);
  assert.equal(at(beats[9] - 0.01).boxB, 0);
  assert.equal(BOX_PRIMES.length, 5);
  assert.equal(BOUNCER, 13);
});

test('the first box packs to its lid and the bouncer does not fit', () => {
  const sum = BOX_PRIMES.reduce((a, p) => a + Math.log(p), 0);
  const room = 480 / 61; // inner height over block scale, in units of log p
  assert.ok(sum <= room, `blocks ${sum} exceed room ${room}`);
  assert.ok(sum + Math.log(BOUNCER) > room);
});
