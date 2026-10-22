// Stills for checking by eye: bundles once, then renders frames of Main-EN-vertical to out/stills/.
// Usage: node scripts/stills.mjs            -> three per scene (40 %, 75 %, just before hand-over)
//        node scripts/stills.mjs 120 455 …  -> those frames
import fs from 'node:fs';
import path from 'node:path';
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import { at } from './lib.mjs';

const { TIMELINE } = await import('../src/timeline.ts');
const { sceneStarts, sceneFrames, SCENE_TRANSITION } = await import('../src/timing.ts');

const args = process.argv.slice(2).map(Number).filter(Number.isFinite);
const { starts } = sceneStarts(TIMELINE);
const frames = args.length
  ? args.map((f) => ({ f, name: `f${String(f).padStart(5, '0')}` }))
  : TIMELINE.flatMap((s, i) => {
      const n = sceneFrames(s);
      const end = n - SCENE_TRANSITION - 3;
      return [0.4, 0.75].map((k) => Math.round(n * k)).concat([end]).map((x, j) => ({ f: starts[i] + x, name: `${String(i).padStart(2, '0')}-${s.id}-${j}` }));
    });

const out = at('out', 'stills');
fs.mkdirSync(out, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve(at('src', 'index.ts')) });
const composition = await selectComposition({ serveUrl, id: 'Main-EN-vertical', inputProps: {}, timeoutInMilliseconds: 300000 });
for (const { f, name } of frames) {
  const file = path.join(out, `${name}.png`);
  await renderStill({ composition, serveUrl, output: file, frame: Math.min(f, composition.durationInFrames - 1), inputProps: {}, timeoutInMilliseconds: 300000 });
  console.log(file, f);
}
