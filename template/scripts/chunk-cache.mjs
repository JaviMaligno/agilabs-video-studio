// Which chunks of a long render can be reused. Each chunk gets a key: a hash of everything that can
// change its pixels or sound, described relative to the chunk's own first frame. Shared code
// (captions, layout, settings, the Remotion version) and the assets that shared code loads count
// for every chunk; a scene's component code (with what it imports), the assets it loads, its lines,
// their voice takes, its length and its chapter number count for the chunk that holds it, and for
// the next chunk when it is the scene that fades out over that chunk's first frames (sceneChunks
// in lib.mjs). Change one scene and only its chunk renders again (two when it ends a chunk).
//
// No absolute frame number goes in a key, so a chunk whose scenes did not change is reused even
// when an earlier scene got longer or shorter. That holds because a chunked render leaves out what
// runs on the video's clock: the music bed (one track under the whole video) is mixed after the
// chunks are joined (mixMusicBed in music.mjs) and the background glow is clocked per scene (the
// `chunked` prop of the composition). A bespoke component whose props carry whole-video data (a
// shared clock, the whole video's keyframe list, a running total) changes the props of every scene
// it reaches, and so, rightly, the keys of their chunks: give each scene only its slice.
//
// What it cannot see: an asset whose path is built at run time (`staticFile(\`cast/${name}.png\`)`)
// and a file outside `src/` and `public/`. When in doubt, `npm run render -- --fresh`.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

/** Bump to invalidate every cached chunk (a change in how keys are computed). */
export const CACHE_VERSION = 2;

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

/**
 * The cache key of one chunk. Nothing in it is an absolute frame: the same scenes give the same key
 * wherever they fall in the video.
 * @param {object} o
 * @param {string} o.id composition id (voice and format)
 * @param {number} o.frames length of the chunk in frames
 * @param {Array<[string, string]>} o.shared [name, hash] of what every chunk depends on
 * @param {unknown} o.before the scene that fades out over the chunk's first frames (null for the first chunk)
 * @param {unknown[]} o.scenes the chunk's scenes, each with its length and own file hashes
 */
export const chunkKey = ({ id, frames, shared, before, scenes }) =>
  sha(JSON.stringify({ v: CACHE_VERSION, id, frames, shared, before, scenes })).slice(0, 16);

/**
 * Keys for every chunk of a render, computed from the project on disk.
 * @param {object} o
 * @param {string} o.root the template folder
 * @param {string} o.id composition id
 * @param {string} o.voice 'en' | 'es'
 * @param {Array<{id: string, anim?: {name: string}, lines: Array<{key: string}>}>} o.scenes the cut's scenes
 * @param {number[]} o.lengths frames of each scene
 * @param {Array<number | undefined>} o.chapters chapter number each scene's card shows (chapterNumbers)
 * @param {Array<{first: number, last: number, range: [number, number]}>} o.chunks from sceneChunks
 * @param {string[]} [o.outside] files under public/ the chunks do not contain (the music bed, mixed later)
 */
export const chunkKeys = ({ root, id, voice, scenes, lengths, chapters, chunks, outside = [] }) => {
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
  // Assets the settings name (strings that are files under public/), except those the chunks leave
  // out: the music bed is mixed after the join, so regenerating it (longer video) renders nothing.
  const settingsSrc = fs.readFileSync(path.join(src, 'settings.ts'), 'utf8');
  for (const m of settingsSrc.matchAll(/['"]([\w./-]+\.(?:wav|mp3|png|jpe?g|webp|mp4|ttf|otf|woff2?))['"]/g)) sharedFiles.push(path.join(pub, m[1]));
  const skip = new Set(outside.map((p) => path.join(pub, p)));
  const shared = [...new Set(sharedFiles)].filter((f) => !skip.has(f)).sort().map((f) => [rel(f), hashOf(f)]);

  const animClosure = new Map();
  const sceneInfo = (i) => {
    const scene = scenes[i];
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
    // The scene in full (props, lines, beats), its length (the cross-fades sit at its ends) and the
    // number on its chapter card, which counts the chapters before it.
    return { scene, frames: lengths[i], chapter: chapters[i] ?? null, files: [...new Set(files)].sort().map((f) => [rel(f), hashOf(f)]) };
  };

  return chunks.map(({ first, last, range: [a, b] }) =>
    chunkKey({
      id,
      frames: b - a + 1,
      shared,
      // The scene fading out over this chunk's first frames: its tail is drawn and its last line
      // may still be heard. Which transition plays (fade or dip) follows from both scenes' anims.
      before: first > 0 ? sceneInfo(first - 1) : null,
      scenes: Array.from({ length: last - first + 1 }, (_, k) => sceneInfo(first + k)),
    }),
  );
};

/** The cached part for a key. Parts are found by key alone: same content, same file, at any position. */
export const partPath = (dir, key) => path.join(dir, `${key}.mkv`);

/**
 * Parts in `dir` no cut uses any more: every .mkv (a finished part, or a `.partial.mkv` a crash
 * left) whose key is neither in `keys` (this cut) nor in `keep` (the other cuts, see keysInUse).
 * Parts named by the old scheme (`00-<key>.mkv`) match no key and go too.
 */
export const staleParts = (dir, keys, keep = new Set()) =>
  fs.existsSync(dir)
    ? fs
        .readdirSync(dir)
        .filter((f) => f.endsWith('.mkv'))
        .filter((f) => {
          const key = f.replace(/(\.partial)?\.mkv$/, '');
          return !keys.includes(key) && !keep.has(key);
        })
        .map((f) => path.join(dir, f))
    : [];

/**
 * Several cuts of one video (a chapter in or out, two lengths) share one parts folder: a chunk is
 * found by its key, which is what it shows, never by the cut that asked for it. Each cut records
 * the keys it uses in `used-<cut>.json`; the keys the other cuts record are kept when this cut
 * cleans up its stale parts.
 */
export const recordKeys = (dir, cut, keys) => fs.writeFileSync(path.join(dir, `used-${cut}.json`), JSON.stringify(keys));
export const keysInUse = (dir, cut) =>
  new Set(
    fs.existsSync(dir)
      ? fs
          .readdirSync(dir)
          .filter((f) => /^used-.+\.json$/.test(f) && f !== `used-${cut}.json`)
          .flatMap((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')))
      : [],
  );
