// Which chunks of a long render can be reused. Each chunk gets a key: a hash of everything that can
// change its pixels or sound. Shared code (captions, layout, settings, the Remotion version), the
// music bed and the assets that shared code loads count for every chunk; a scene's component code
// (with what it imports), the assets it loads, its lines and their voice takes count only for the
// chunks the scene overlaps. Change one scene and only its chunks render again.
//
// What it cannot see: an asset whose path is built at run time (`staticFile(\`cast/${name}.png\`)`)
// and a file outside `src/` and `public/`. When in doubt, `npm run render -- --fresh`.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

/** Bump to invalidate every cached chunk (a change in how keys are computed). */
export const CACHE_VERSION = 1;

const sha = (data) => crypto.createHash('sha256').update(data).digest('hex');

/** Relative imports of a source file (`from './x.ts'`, `import './y.css'`), resolved to absolute paths. */
export const relativeImports = (file, source) => {
  const out = [];
  for (const m of source.matchAll(/(?:from|import)\s*\(?\s*['"](\.{1,2}\/[^'"]+)['"]/g)) out.push(path.resolve(path.dirname(file), m[1]));
  return out;
};

/** Literal `staticFile('...')` paths in a source file (template literals with `${}` are skipped). */
export const staticPaths = (source) => {
  const out = [];
  for (const m of source.matchAll(/staticFile\(\s*(['"`])([^'"`$]+)\1\s*\)/g)) out.push(m[2]);
  return out;
};

/** Every file reachable from `entries` through relative imports (missing files are skipped). */
export const importClosure = (entries, read = (f) => fs.readFileSync(f, 'utf8')) => {
  const seen = new Set();
  const stack = [...entries];
  while (stack.length) {
    const f = stack.pop();
    if (seen.has(f) || !fs.existsSync(f)) continue;
    seen.add(f);
    stack.push(...relativeImports(f, read(f)));
  }
  return [...seen].sort();
};

/** Frame ranges [start, end) of each scene, given their start frames and the video's total. */
export const sceneSpans = (starts, total, transition) =>
  starts.map((s, i) => [s, i + 1 < starts.length ? starts[i + 1] + transition : total]);

/** Indices of the scenes whose span touches [a - margin, b + margin] (inclusive frame range). */
export const scenesInRange = (spans, [a, b], margin) =>
  spans.flatMap(([s, e], i) => (s <= b + margin && e > a - margin ? [i] : []));

/**
 * The cache key of one chunk.
 * @param {object} o
 * @param {[number, number]} o.range inclusive frame range
 * @param {string} o.id composition id (voice and format)
 * @param {Array<[string, string]>} o.shared [name, hash] of what every chunk depends on
 * @param {unknown[]} o.scenes the overlapping scenes, each with its start frame and own file hashes
 */
export const chunkKey = ({ range, id, shared, scenes }) =>
  sha(JSON.stringify({ v: CACHE_VERSION, range, id, shared, scenes })).slice(0, 16);

/**
 * Keys for every chunk of a render, computed from the project on disk.
 * @param {object} o
 * @param {string} o.root the template folder
 * @param {string} o.id composition id
 * @param {string} o.voice 'en' | 'es'
 * @param {Array<{id: string, anim?: {name: string}, lines: Array<{key: string}>}>} o.scenes the cut's scenes
 * @param {number[]} o.starts start frame of each scene
 * @param {number} o.total total frames
 * @param {number} o.transition frames two scenes overlap
 * @param {Array<[number, number]>} o.ranges chunk ranges
 * @param {number} o.margin extra frames around a chunk that still count as overlapping
 */
export const chunkKeys = ({ root, id, voice, scenes, starts, total, transition, ranges, margin }) => {
  const src = path.join(root, 'src');
  const pub = path.join(root, 'public');
  const fileHashes = new Map();
  const hashOf = (f) => {
    if (!fileHashes.has(f)) fileHashes.set(f, fs.existsSync(f) ? sha(fs.readFileSync(f)) : 'missing');
    return fileHashes.get(f);
  };
  const assetsOf = (files) => [...new Set(files.flatMap((f) => staticPaths(fs.readFileSync(f, 'utf8'))))].sort();
  const rel = (f) => path.relative(root, f).split(path.sep).join('/');

  // Shared: the whole source tree except the animation components (counted per scene) and the
  // two generated/scene-level files whose content reaches each chunk through its scenes.
  const perScene = (f) => f.startsWith(path.join(src, 'anim') + path.sep) || /[\\/](timeline|audio\.generated)\.ts$/.test(f);
  const sharedSrc = importClosure([path.join(src, 'index.ts')]).filter((f) => !perScene(f));
  const sharedFiles = [
    ...sharedSrc,
    ...assetsOf(sharedSrc).map((p) => path.join(pub, p)),
    ...['package-lock.json', 'remotion.config.ts'].map((f) => path.join(root, f)),
  ];
  // The music bed and any other asset the settings name (strings that are files under public/).
  const settingsSrc = fs.readFileSync(path.join(src, 'settings.ts'), 'utf8');
  for (const m of settingsSrc.matchAll(/['"]([\w./-]+\.(?:wav|mp3|png|jpe?g|webp|mp4|ttf|otf|woff2?))['"]/g)) sharedFiles.push(path.join(pub, m[1]));
  const shared = [...new Set(sharedFiles)].sort().map((f) => [rel(f), hashOf(f)]);

  const animClosure = new Map();
  const sceneInfo = (scene, i) => {
    const files = [];
    if (scene.anim) {
      const entry = path.join(src, 'anim', `${scene.anim.name}.tsx`);
      if (!animClosure.has(entry)) {
        const code = importClosure([entry]);
        animClosure.set(entry, [...code, ...assetsOf(code).map((p) => path.join(pub, p))]);
      }
      files.push(...animClosure.get(entry));
    }
    // Strings in the scene's props that name a file in public/ (an image passed as a prop).
    JSON.stringify(scene.anim?.props ?? {}).replace(/"([\w./-]+\.\w{2,5})"/g, (_, p) => {
      if (fs.existsSync(path.join(pub, p))) files.push(path.join(pub, p));
      return '';
    });
    for (const l of scene.lines) for (const ext of ['wav', 'words.json']) files.push(path.join(pub, 'audio', voice, `${l.key}.${ext}`));
    return { start: starts[i], scene, files: [...new Set(files)].sort().map((f) => [rel(f), hashOf(f)]) };
  };

  const spans = sceneSpans(starts, total, transition);
  return ranges.map((range) => chunkKey({ range, id, shared, scenes: scenesInRange(spans, range, margin).map((i) => sceneInfo(scenes[i], i)) }));
};

/** Cached part path for chunk `k` with `key`, and every older part of that chunk (to delete). */
export const partPaths = (dir, k, key) => {
  const prefix = `${String(k).padStart(2, '0')}-`;
  const file = path.join(dir, `${prefix}${key}.mkv`);
  const stale = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.startsWith(prefix) && f !== path.basename(file)).map((f) => path.join(dir, f)) : [];
  return { file, stale };
};
