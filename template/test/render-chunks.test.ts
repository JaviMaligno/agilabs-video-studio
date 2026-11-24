import { test } from 'node:test';
import assert from 'node:assert/strict';
import { concatList, isAnchor, sceneChunks } from '../scripts/lib.mjs';

const T = 18;
const target = 900; // 30 s at 30 fps
const startsOf = (lengths: number[]) => {
  const out: number[] = [];
  let at = 0;
  lengths.forEach((len, i) => {
    out.push(at);
    at += len - (i < lengths.length - 1 ? T : 0);
  });
  return { starts: out, total: at };
};
// A seeded generator, so the "random" videos are the same on every run.
const rng = (seed: number) => () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
const video = (n: number, seed: number) => {
  const r = rng(seed);
  const ids = Array.from({ length: n }, (_, i) => `v${seed}-scene-${i}`);
  return { ids, lengths: ids.map(() => Math.round(150 + r() * 600)) }; // 5-25 s scenes
};

test('chunks are runs of whole scenes covering every frame once, each starting on a scene start', () => {
  for (let seed = 1; seed <= 20; seed++) {
    const { ids, lengths } = video(30, seed);
    const chunks = sceneChunks({ lengths, ids, transition: T, target });
    const { starts, total } = startsOf(lengths);
    assert.equal(chunks[0].first, 0);
    assert.equal(chunks.at(-1)!.last, ids.length - 1);
    assert.equal(chunks[0].range[0], 0);
    assert.equal(chunks.at(-1)!.range[1], total - 1);
    for (let k = 0; k < chunks.length; k++) {
      const c = chunks[k];
      // A boundary sits on the start frame of the chunk's first scene: the cross-fade in from
      // the previous scene is whole in this chunk, never split.
      assert.equal(c.range[0], starts[c.first]);
      if (k > 0) {
        assert.equal(c.first, chunks[k - 1].last + 1);
        assert.equal(c.range[0], chunks[k - 1].range[1] + 1);
      }
      // Never past twice the target, unless it is one long scene.
      if (c.first !== c.last) assert.ok(c.range[1] - c.range[0] + 1 <= 2 * target, `chunk ${k} is ${c.range[1] - c.range[0] + 1} frames`);
    }
  }
});

test('chunks aim at the target: about 30 s by default', () => {
  const sizes: number[] = [];
  for (let seed = 1; seed <= 40; seed++) {
    const { ids, lengths } = video(40, seed);
    for (const c of sceneChunks({ lengths, ids, transition: T, target })) sizes.push(c.range[1] - c.range[0] + 1);
  }
  sizes.sort((a, b) => a - b);
  const median = sizes[sizes.length >> 1];
  assert.ok(median > 0.6 * target && median < 1.4 * target, `median chunk ${median} frames`);
});

test('a scene longer than the target is a chunk of its own', () => {
  const ids = ['a', 'b', 'long', 'c', 'd'];
  const lengths = [300, 300, 1500, 300, 300];
  const chunks = sceneChunks({ lengths, ids, transition: T, target });
  assert.ok(chunks.some((c) => c.first === 2 && c.last === 2));
});

test('one scene, or one short video, is one chunk', () => {
  assert.deepEqual(sceneChunks({ lengths: [100], ids: ['a'], transition: T, target }), [{ first: 0, last: 0, range: [0, 99] }]);
  assert.equal(sceneChunks({ lengths: [100, 100, 100], ids: ['a', 'b', 'c'], transition: T, target }).length, 1);
});

test('anchors come from the scene id alone, about every other scene', () => {
  assert.equal(isAnchor('scene-7'), isAnchor('scene-7'));
  const n = Array.from({ length: 1000 }, (_, i) => isAnchor(`s${i}`)).filter(Boolean).length;
  assert.ok(n > 400 && n < 600, `${n} anchors in 1000`);
});

test('a scene that gets longer or shorter regroups only the chunks around it', () => {
  const sig = (c: { first: number; last: number }) => `${c.first}-${c.last}`;
  let unchanged = 0;
  for (let seed = 1; seed <= 200; seed++) {
    const { ids, lengths } = video(40, seed);
    const r = rng(seed + 1000);
    const k = Math.floor(r() * ids.length);
    const edited = [...lengths];
    edited[k] = Math.max(40, Math.round(lengths[k] * (0.3 + r() * 1.5)));
    const before = sceneChunks({ lengths, ids, transition: T, target });
    const after = sceneChunks({ lengths: edited, ids, transition: T, target });
    const old = new Set(before.map(sig));
    const moved = after.filter((c) => !old.has(sig(c)));
    if (!moved.length) unchanged++;
    // Every regrouped chunk is near the edit, and all chunks from a little after it are the same.
    assert.ok(moved.length <= 4, `seed ${seed}: ${moved.length} chunks regrouped`);
    const tail = (cs: typeof before) => cs.filter((c) => c.first > k + 8).map(sig);
    assert.deepEqual(tail(after), tail(before), `seed ${seed}`);
  }
  // Most edits keep the grouping as it was.
  assert.ok(unchanged > 120, `${unchanged}/200 kept the grouping`);
});

test('bad input fails loudly', () => {
  assert.throws(() => sceneChunks({ lengths: [], ids: [], transition: T, target }));
  assert.throws(() => sceneChunks({ lengths: [10], ids: ['a'], transition: T, target: 0 }));
  assert.throws(() => sceneChunks({ lengths: [10, 10], ids: ['a'], transition: T, target }));
});

test('the concat list quotes paths for ffmpeg, forward slashes', () => {
  assert.equal(concatList(['C:\\out\\a.mkv', "/tmp/it's.mkv"]), "file 'C:/out/a.mkv'\nfile '/tmp/it'\\''s.mkv'\n");
});
