import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { chunkKey, importClosure, keysInUse, partPaths, recordKeys, relativeImports, sceneSpans, scenesInRange, staticPaths } from '../scripts/chunk-cache.mjs';

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

test('a chunk counts the scenes it overlaps, with transitions and a margin', () => {
  // Three scenes of 100 frames overlapping by 10: starts 0, 90, 180; total 280.
  const spans = sceneSpans([0, 90, 180], 280, 10);
  assert.deepEqual(spans, [[0, 100], [90, 190], [180, 280]]);
  assert.deepEqual(scenesInRange(spans, [0, 49], 0), [0]);
  assert.deepEqual(scenesInRange(spans, [0, 95], 0), [0, 1]);
  assert.deepEqual(scenesInRange(spans, [200, 279], 0), [2]);
  assert.deepEqual(scenesInRange(spans, [200, 279], 15), [1, 2]);
});

test('the key changes with any input and only with them', () => {
  const base = { range: [0, 99] as [number, number], id: 'Main-EN-landscape', shared: [['src/Video.tsx', 'h1']] as [string, string][], scenes: [{ start: 0, scene: { id: 'a' }, files: [] }] };
  const k = chunkKey(base);
  assert.equal(chunkKey(structuredClone(base)), k);
  assert.notEqual(chunkKey({ ...base, range: [0, 100] }), k);
  assert.notEqual(chunkKey({ ...base, id: 'Main-ES-landscape' }), k);
  assert.notEqual(chunkKey({ ...base, shared: [['src/Video.tsx', 'h2']] as [string, string][] }), k);
  assert.notEqual(chunkKey({ ...base, scenes: [{ start: 1, scene: { id: 'a' }, files: [] }] }), k);
  assert.notEqual(chunkKey({ ...base, scenes: [{ start: 0, scene: { id: 'a' }, files: [['public/cast/x.png', 'h']] }] }), k);
});

test('a part lives under its chunk index and key; older keys of that chunk are stale', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cp-'));
  fs.writeFileSync(path.join(dir, '00-old.mkv'), '');
  fs.writeFileSync(path.join(dir, '01-other.mkv'), '');
  const { file, stale } = partPaths(dir, 0, 'new');
  assert.equal(file, path.join(dir, '00-new.mkv'));
  assert.deepEqual(stale, [path.join(dir, '00-old.mkv')]);
});

test('two cuts share one parts folder: a cut never deletes the chunks the other cut uses', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cuts-'));
  for (const f of ['00-shared.mkv', '02-without.mkv', '02-older.mkv']) fs.writeFileSync(path.join(dir, f), '');
  recordKeys(dir, 'main-en-landscape-without', ['shared', 'x', 'without']);
  // The "with" cut renders its own chunk 3: the "without" chunk 3 is in use, the older one is not.
  const keep = keysInUse(dir, 'main-en-landscape-with');
  assert.ok(keep.has('without') && keep.has('shared'));
  const { stale } = partPaths(dir, 2, 'with', keep);
  assert.deepEqual(stale, [path.join(dir, '02-older.mkv')]);
  // A cut's own record does not protect its own stale parts.
  assert.equal(keysInUse(dir, 'main-en-landscape-without').size, 0);
  // Same key, same file, whichever cut asks: chunk 1 is reused, not rendered twice.
  assert.equal(partPaths(dir, 0, 'shared').file, path.join(dir, '00-shared.mkv'));
});
