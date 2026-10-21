// Renders stills of the main cut, bundling once and opening one browser:
// node scripts/stills.mjs [every=60] [frame ...]. Writes out/stills/f<frame>.png.
// With explicit frames (two or more numbers), only those. Retries the browser start (busy machine).
import path from 'node:path';
import fs from 'node:fs';
import { bundle } from '@remotion/bundler';
import { openBrowser, renderStill, selectComposition } from '@remotion/renderer';

const root = path.resolve(import.meta.dirname, '..');
const args = process.argv.slice(2).map(Number);
const serveUrl = await bundle({ entryPoint: path.join(root, 'src/index.ts') });
let browser = null;
for (let i = 0; i < 6 && !browser; i++) {
  try {
    browser = await openBrowser('chrome');
  } catch (e) {
    console.error(`browser start failed (${i + 1}/6): ${String(e).slice(0, 120)}`);
  }
}
if (!browser) process.exit(1);
const timeoutInMilliseconds = 600000;
const comp = await selectComposition({ serveUrl, id: 'Main-EN-vertical', timeoutInMilliseconds, puppeteerInstance: browser });
const every = args[0] || 60;
const frames = args.length > 1 ? args : Array.from({ length: Math.ceil(comp.durationInFrames / every) }, (_, i) => i * every);
fs.mkdirSync(path.join(root, 'out/stills'), { recursive: true });
for (const frame of frames) {
  const f = Math.min(frame, comp.durationInFrames - 1);
  await renderStill({ composition: comp, serveUrl, frame: f, output: path.join(root, `out/stills/f${String(f).padStart(4, '0')}.png`), scale: 0.5, timeoutInMilliseconds, puppeteerInstance: browser });
}
await browser.close({ silent: true });
console.log(`${frames.length} stills in out/stills`);
