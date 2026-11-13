import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chunkRanges, concatList } from '../scripts/lib.mjs';

test('one range when the video fits in a chunk: the short path is unchanged', () => {
  assert.deepEqual(chunkRanges(100, 5400), [[0, 99]]);
  assert.deepEqual(chunkRanges(5400, 5400), [[0, 5399]]);
});

test('chunk ranges cover every frame once, in order, inclusive like --frames=a-b', () => {
  assert.deepEqual(chunkRanges(5401, 5400), [[0, 5399], [5400, 5400]]);
  const frames = 17100; // 9.5 min at 30 fps
  const r = chunkRanges(frames, 5400);
  assert.equal(r.length, 4);
  assert.equal(r[0][0], 0);
  assert.equal(r.at(-1)![1], frames - 1);
  for (let i = 1; i < r.length; i++) assert.equal(r[i][0], r[i - 1][1] + 1);
  assert.equal(r.reduce((n, [a, b]) => n + b - a + 1, 0), frames);
});

test('bad input fails loudly', () => {
  assert.throws(() => chunkRanges(0, 100));
  assert.throws(() => chunkRanges(100, 0));
});

test('the concat list quotes paths for ffmpeg, forward slashes', () => {
  assert.equal(concatList(['C:\\out\\a.mkv', "/tmp/it's.mkv"]), "file 'C:/out/a.mkv'\nfile '/tmp/it'\\''s.mkv'\n");
});
