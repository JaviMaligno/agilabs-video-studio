// Flicker check: finds frames that differ from both neighbours while the neighbours match each
// other. That is an element vanishing for one frame (a render glitch) or a frame captured half
// painted, never a cut or a fade (there the frames on each side differ). Run after every render;
// `npm run render` calls it on the final file.
// Usage: npm run flicker [-- out/main-en-landscape.mp4]
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { at } from './lib.mjs';

/** Grey thumbnail size the frames are compared at: small enough to be fast, big enough to see a label. */
export const W = 160;
export const H = 90;

const meanAbsDiff = (a, b) => {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += Math.abs(a[i] - b[i]);
  return s / a.length;
};

/**
 * Indices of flicker frames: frame i differs from both neighbours by more than `jump` (mean grey
 * level, 0-255) while frames i-1 and i+1 differ by less than half of that.
 * @param {Uint8Array[]} frames grey thumbnails, all the same size
 * @param {number} [jump]
 * @returns {number[]}
 */
export function flickerFrames(frames, jump = 1.5) {
  const out = [];
  for (let i = 1; i + 1 < frames.length; i++) {
    const a = meanAbsDiff(frames[i], frames[i - 1]);
    const b = meanAbsDiff(frames[i + 1], frames[i]);
    if (a <= jump || b <= jump) continue;
    if (meanAbsDiff(frames[i + 1], frames[i - 1]) < 0.5 * Math.min(a, b)) out.push(i);
  }
  return out;
}

/** "m:ss.ss" for a frame index. */
export const stamp = (i, fps) => {
  const t = i / fps;
  return `${Math.floor(t / 60)}:${(t % 60).toFixed(2).padStart(5, '0')}`;
};

/** Decodes `file` to grey thumbnails and returns a one-paragraph report of its flicker frames. */
export function flickerReport(file, fps = 30) {
  const r = spawnSync('ffmpeg', ['-v', 'error', '-i', file, '-vf', `fps=${fps},scale=${W}:${H}`, '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], {
    maxBuffer: 2 ** 31,
  });
  if (r.status !== 0) return `flicker check: ffmpeg failed on ${file}: ${r.stderr}`;
  const n = Math.floor(r.stdout.length / (W * H));
  const frames = Array.from({ length: n }, (_, i) => r.stdout.subarray(i * W * H, (i + 1) * W * H));
  const hits = flickerFrames(frames);
  if (!hits.length) return `flicker check: ${n} frames, none suspect`;
  const shown = hits.slice(0, 30).map((i) => stamp(i, fps));
  return (
    `flicker check: ${hits.length} suspect frame(s) of ${n}: ${shown.join(', ')}${hits.length > shown.length ? ', ...' : ''}\n` +
    '  Look at each (ffmpeg -ss <t> -frames:v 3). A lone hit on a fade can be fine; a run of them is ' +
    'a glitch: render again with CONCURRENCY=1 (the default).'
  );
}

if (process.argv[1]?.endsWith(`flicker.mjs`)) {
  const file = process.argv[2] ?? fs.readdirSync(at('out')).filter((f) => /^main-.*\.mp4$/.test(f)).map((f) => at('out', f))[0];
  if (!file) throw new Error('no video given and no out/main-*.mp4 found');
  console.log(flickerReport(file));
}
