// Renders stills of the main cut, bundling once: node scripts/stills.mjs [every=60] [frame ...]
// Writes out/stills/f<frame>.png. With explicit frames, only those.
import path from 'node:path';
import fs from 'node:fs';
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';

const root = path.resolve(import.meta.dirname, '..');
const args = process.argv.slice(2).map(Number);
const serveUrl = await bundle({ entryPoint: path.join(root, 'src/index.ts') });
const comp = await selectComposition({ serveUrl, id: 'Main-EN-vertical', timeoutInMilliseconds: 120000 });
const frames = args.length > 1 ? args : Array.from({ length: Math.ceil(comp.durationInFrames / (args[0] || 60)) }, (_, i) => i * (args[0] || 60));
fs.mkdirSync(path.join(root, 'out/stills'), { recursive: true });
for (const frame of frames) {
  const f = Math.min(frame, comp.durationInFrames - 1);
  await renderStill({ composition: comp, serveUrl, frame: f, output: path.join(root, `out/stills/f${String(f).padStart(4, '0')}.png`), scale: 0.5, timeoutInMilliseconds: 120000 });
}
console.log(`${frames.length} stills in out/stills`);
