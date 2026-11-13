// Writes the music bed (public/music/bed.wav) with scripts/music_local.py, as long as the video
// it goes under (plus BED_MARGIN seconds).
// Uses python3 when it has numpy, else `uv run --with numpy` (cached after the first run).
// Usage: npm run music [-- seconds]   (no seconds: the length of the EN main cut + margin)
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { at, wavSeconds } from './lib.mjs';

/** Seconds of bed past the end of the video. */
export const BED_MARGIN = 2;

/** Length of the bed for a video of `videoSeconds`: the video plus the margin, rounded up. */
export const bedSeconds = (videoSeconds) => Math.ceil(videoSeconds + BED_MARGIN);

/** Whether a bed of `existing` seconds (null: no file) must be regenerated for this video. */
export const bedTooShort = (existing, videoSeconds) => existing === null || !(existing >= videoSeconds);

/** Length in seconds of the WAV at `file`, or null when there is none. */
export const bedFileSeconds = (file) => (fs.existsSync(file) ? wavSeconds(fs.readFileSync(file)) : null);

export function makeMusicBed(seconds = 80, target = at('public', 'music', 'bed.wav')) {
  const script = at('scripts', 'music_local.py');
  const hasNumpy = spawnSync('python3', ['-c', 'import numpy'], { stdio: 'ignore' }).status === 0;
  const [cmd, args] = hasNumpy ? ['python3', [script]] : ['uv', ['run', '--quiet', '--with', 'numpy', 'python', script]];
  const r = spawnSync(cmd, [...args, String(seconds), target], { stdio: 'inherit', cwd: at() });
  if (r.status !== 0) throw new Error('music bed failed: needs python3 with numpy, or uv (brew install uv)');
}

/** Makes the bed at `target` when it is missing or shorter than the video; returns whether it did. */
export function ensureMusicBed(videoSeconds, target = at('public', 'music', 'bed.wav')) {
  const existing = bedFileSeconds(target);
  if (!bedTooShort(existing, videoSeconds)) return false;
  if (existing !== null) console.log(`music bed: ${existing.toFixed(1)} s is shorter than the video (${videoSeconds.toFixed(1)} s), regenerating`);
  makeMusicBed(bedSeconds(videoSeconds), target);
  return true;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  let seconds = Number(process.argv[2]);
  if (!(seconds > 0)) {
    const { VIDEOS } = await import('../src/timeline.ts');
    const { FPS, sceneStarts } = await import('../src/timing.ts');
    seconds = bedSeconds(sceneStarts(VIDEOS.en?.main ?? Object.values(VIDEOS)[0].main).total / FPS);
  }
  makeMusicBed(seconds);
}
