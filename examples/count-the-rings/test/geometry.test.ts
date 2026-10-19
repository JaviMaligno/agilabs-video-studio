import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DIVERGENCE, LAYOUTS, OBLIVIOUS, SUPER, areaOf, layoutProblems, sumArea } from '../src/data/instances.ts';

test('every drawn layout is feasible: inside the pan, no overlaps outside a hole', () => {
  for (const [name, l] of Object.entries(LAYOUTS)) assert.deepEqual(layoutProblems(l), [], name);
});

test('the article figures: about 69.7 vs about 76.7', () => {
  assert.equal(sumArea(DIVERGENCE.count).toFixed(1), '69.7');
  assert.equal(sumArea(DIVERGENCE.area).toFixed(1), '76.7');
  assert.ok(areaOf(4.2, 1) > 0);
});

test('superincreasing: each ring bigger than all the smaller ones together', () => {
  for (const radii of [SUPER.radii, OBLIVIOUS.radii]) {
    const sorted = [...radii].sort((a, b) => b - a);
    sorted.forEach((r, i) => {
      const rest = sorted.slice(i + 1).reduce((a, b) => a + b, 0);
      if (i < sorted.length - 1) assert.ok(r > rest, `${r} > ${rest}`);
    });
  }
});

test('scene 9: the three rules place the same set (same seared area)', () => {
  const a = sumArea(OBLIVIOUS.tightest);
  assert.equal(sumArea(OBLIVIOUS.roomiest), a);
  assert.equal(sumArea(OBLIVIOUS.random), a);
});

test('the greedy beats the row on area, the row beats it on count', () => {
  assert.ok(sumArea(SUPER.greedy) > sumArea(SUPER.row));
  assert.ok(SUPER.row.length > SUPER.greedy.length);
});
