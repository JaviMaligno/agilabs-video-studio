import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BED_MARGIN, bedSeconds, bedTooShort } from '../scripts/music.mjs';

test('the bed covers the whole video plus a margin, in whole seconds', () => {
  assert.equal(BED_MARGIN, 2);
  assert.equal(bedSeconds(45), 47);
  assert.equal(bedSeconds(569.4), 572);
  // A ten-minute video gets a ten-minute bed, not the old fixed 80 s.
  assert.ok(bedSeconds(600) > 80);
});

test('an existing bed is regenerated when it is missing or shorter than the video', () => {
  assert.equal(bedTooShort(null, 60), true);
  assert.equal(bedTooShort(80, 60), false);
  assert.equal(bedTooShort(80, 80), false);
  assert.equal(bedTooShort(80, 570), true);
  assert.equal(bedTooShort(0, 10), true);
});
