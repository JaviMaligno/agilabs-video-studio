import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { chunkKey, chunkKeys, importClosure, keysInUse, partPath, recordKeys, relativeImports, staleParts, staticPaths } from '../scripts/chunk-cache.mjs';
import { sceneChunks } from '../scripts/lib.mjs';

test('relative imports and literal static files are found; packages and dynamic paths are not', () => {
  const src = `import React from 'react';\nimport { a } from './a.ts';\nexport { b } from '../b.tsx';\nimport './c.css';\n` +
    "<image href={staticFile('cast/x.png')} /> staticFile(`bg/y.jpg`) staticFile(`cast/${n}.png`)";
  assert.deepEqual(relativeImports('/p/src/anim/F.tsx', src), ['/p/src/anim/a.ts', '/p/src/b.tsx', '/p/src/anim/c.css']);
  assert.deepEqual(staticPaths(src), ['cast/x.png', 'bg/y.jpg']);
});

test('the import closure follows relative imports transitively, once each', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-'));
  fs.writeFileSync(path.join(dir, 'a.ts'), "import './b.ts';\nimport './c.ts';");
  fs.writeFileSync(path.join(dir, 'b.ts'), "import './c.ts';");
  fs.writeFileSync(path.join(dir, 'c.ts'), "import './a.ts';");
  fs.writeFileSync(path.join(dir, 'd.ts'), '');
  assert.deepEqual(importClosure([path.join(dir, 'a.ts')]), ['a.ts', 'b.ts', 'c.ts'].map((f) => path.join(dir, f)));
});

test('the key changes with any input and only with them; no absolute frame is an input', () => {
  const scene = { scene: { id: 'a' }, frames: 300, chapter: null, files: [] as [string, string][] };
  const base = { id: 'Main-EN-landscape', frames: 282, shared: [['src/Video.tsx', 'h1']] as [string, string][], before: null, scenes: [scene] };
  const k = chunkKey(base);
  assert.equal(chunkKey(structuredClone(base)), k);
  assert.notEqual(chunkKey({ ...base, frames: 283 }), k);
  assert.notEqual(chunkKey({ ...base, id: 'Main-ES-landscape' }), k);
  assert.notEqual(chunkKey({ ...base, shared: [['src/Video.tsx', 'h2']] as [string, string][] }), k);
  assert.notEqual(chunkKey({ ...base, before: { ...scene, scene: { id: 'z' } } }), k);
  assert.notEqual(chunkKey({ ...base, scenes: [{ ...scene, frames: 301 }] }), k);
  assert.notEqual(chunkKey({ ...base, scenes: [{ ...scene, chapter: 2 }] }), k);
  assert.notEqual(chunkKey({ ...base, scenes: [{ ...scene, files: [['public/cast/x.png', 'h']] }] }), k);
});

// A project on disk, small enough to build in a temp folder: shared code, one animation, the
// music bed, and a voice take per line.
type TestScene = { id: string; kind: 'anim'; anim: { name: string; props: Record<string, unknown> }; lines: { key: string; start: number; dur: number; text: { en: string; es: string } }[]; beats: number[] };
const project = (n: number) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ck-'));
  const w = (f: string, data: string) => {
    fs.mkdirSync(path.dirname(path.join(root, f)), { recursive: true });
    fs.writeFileSync(path.join(root, f), data);
  };
  w('src/index.ts', "import './Video.tsx';");
  w('src/Video.tsx', "import { SETTINGS } from './settings.ts';");
  w('src/settings.ts', "export const SETTINGS = { music: { src: 'music/bed.wav', volume: 0.2, duck: 0.3 } };");
  w('src/anim/Panel.tsx', 'export const Panel = () => null;');
  w('public/music/bed.wav', 'bed v1');
  const scenes: TestScene[] = Array.from({ length: n }, (_, i) => {
    const key = `l${i}`;
    w(`public/audio/en/${key}.wav`, `take of ${key}`);
    w(`public/audio/en/${key}.words.json`, '[]');
    return { id: `scene-${i}`, kind: 'anim', anim: { name: 'Panel', props: { n: i } }, lines: [{ key, start: 0.3, dur: 8 + (i % 5), text: { en: `line ${i}`, es: `línea ${i}` } }], beats: [0.3] };
  });
  return { root, w, scenes };
};
const lengthsOf = (scenes: TestScene[]) => scenes.map((s) => Math.round((s.lines[0].start + s.lines[0].dur + 0.8) * 30));
const keysFor = (root: string, scenes: TestScene[], o: { lengths?: number[]; outside?: string[] } = {}) => {
  const lengths = o.lengths ?? lengthsOf(scenes);
  const chunks = sceneChunks({ lengths, ids: scenes.map((s) => s.id), transition: 18, target: 900 });
  const keys = chunkKeys({ root, id: 'Main-EN-landscape', voice: 'en', scenes, lengths, chapters: scenes.map(() => undefined), chunks, outside: o.outside ?? ['music/bed.wav'] });
  return { chunks, keys };
};

test('a line edited in scene k changes only the chunk holding k (and the next when k ends its chunk)', () => {
  const { root, w, scenes } = project(24);
  const before = keysFor(root, scenes);
  assert.ok(before.chunks.length >= 5);
  for (const c of before.chunks.slice(0, -1)) {
    for (const k of [c.first, c.last]) {
      const edited = structuredClone(scenes);
      edited[k].lines[0].text.en = 'a new line';
      const after = keysFor(root, edited);
      assert.deepEqual(after.chunks, before.chunks);
      const changed = after.keys.flatMap((key, i) => (key !== before.keys[i] ? [i] : []));
      const holder = before.chunks.indexOf(c);
      // The last scene of a chunk fades out over the next chunk's first frames.
      assert.deepEqual(changed, k === c.last ? [holder, holder + 1] : [holder], `scene ${k}`);
    }
  }
  // A new voice take (same text) is a change too.
  const k = before.chunks[2].first;
  w(`public/audio/en/l${k}.wav`, 'a new take');
  const retaken = keysFor(root, scenes);
  assert.deepEqual(retaken.keys.flatMap((key, i) => (key !== before.keys[i] ? [i] : [])), k === before.chunks[2].last ? [2, 3] : [2]);
});

test('a scene that got shorter does not change the keys of later chunks', () => {
  const { root, scenes } = project(24);
  const before = keysFor(root, scenes);
  const holder = 1;
  const k = before.chunks[holder].first;
  const edited = structuredClone(scenes);
  edited[k].lines[0].dur -= 2;
  const after = keysFor(root, edited);
  // Later chunks moved 2 s earlier in the video, and keep their keys all the same.
  assert.ok(after.chunks.at(-1)!.range[1] < before.chunks.at(-1)!.range[1]);
  const later = (r: ReturnType<typeof keysFor>) => r.keys.filter((_, i) => r.chunks[i].first > before.chunks[holder].last + 1);
  assert.ok(later(before).length >= 2);
  assert.deepEqual(later(after), later(before));
  assert.notEqual(after.keys[holder], before.keys[holder]);
});

test('the music bed is no input of a chunk when it is mixed after the join', () => {
  const { root, w, scenes } = project(12);
  const before = keysFor(root, scenes);
  // A longer video regenerates the bed: no chunk renders again for it.
  w('public/music/bed.wav', 'bed v2, longer');
  assert.deepEqual(keysFor(root, scenes).keys, before.keys);
  // Were the bed inside the chunks, every key would follow it.
  const inside = keysFor(root, scenes, { outside: [] });
  w('public/music/bed.wav', 'bed v3');
  const inside2 = keysFor(root, scenes, { outside: [] });
  assert.ok(inside.keys.every((key, i) => key !== inside2.keys[i]));
});

test('a part is named by its key alone; parts no cut uses are stale', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cp-'));
  for (const f of ['aaa.mkv', 'old.mkv', 'bbb.partial.mkv', 'ccc.partial.mkv', '00-legacy.mkv', 'used-x.json']) fs.writeFileSync(path.join(dir, f), '');
  assert.equal(partPath(dir, 'aaa'), path.join(dir, 'aaa.mkv'));
  const stale = staleParts(dir, ['aaa', 'bbb']).map((f) => path.basename(f)).sort();
  assert.deepEqual(stale, ['00-legacy.mkv', 'ccc.partial.mkv', 'old.mkv']);
});

test('two cuts share one parts folder: a cut never deletes the chunks the other cut uses', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cuts-'));
  for (const f of ['shared.mkv', 'without.mkv', 'older.mkv', 'with.mkv']) fs.writeFileSync(path.join(dir, f), '');
  recordKeys(dir, 'main-en-landscape-without', ['shared', 'without']);
  // The "with" cut cleans up: the "without" chunk is in use by the other cut, the older one is not.
  const keep = keysInUse(dir, 'main-en-landscape-with');
  assert.ok(keep.has('without') && keep.has('shared'));
  assert.deepEqual(staleParts(dir, ['shared', 'with'], keep), [path.join(dir, 'older.mkv')]);
  // A cut's own record does not protect its own stale parts.
  assert.equal(keysInUse(dir, 'main-en-landscape-without').size, 0);
  // Same key, same file, whichever cut asks and wherever the chunk falls in it.
  assert.equal(partPath(dir, 'shared'), path.join(dir, 'shared.mkv'));
});

test('a cut without one chapter shares every chunk that does not touch it', () => {
  const { root, scenes } = project(24);
  const full = keysFor(root, scenes);
  // The second cut drops the scenes of one chunk in the middle (a chapter out).
  const out = full.chunks[2];
  const cut = scenes.filter((_, i) => i < out.first || i > out.last);
  const short = keysFor(root, cut);
  const shared = new Set(short.keys);
  // Every chunk before the dropped one, and every one after the next (whose fade-in now comes from
  // another scene), is found under the same key in the second cut.
  const expected = full.keys.filter((_, i) => i < 2 || i > 3);
  for (const key of expected) assert.ok(shared.has(key), `chunk ${full.keys.indexOf(key) + 1} not shared`);
});
