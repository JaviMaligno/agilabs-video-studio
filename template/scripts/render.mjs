// Renders the main cut and normalises its loudness: out/main-{en|es}-{vertical|landscape}.mp4
// (+ the matching .srt). Two-pass loudnorm to -16 LUFS integrated, true peak -1.5 dBTP.
// Usage: npm run render [-- --es] [-- --landscape] [-- --fresh]
// Env: CONCURRENCY=n Chrome tabs rendering at once (default 1, see below);
//      CHUNK_SECONDS=s chunk length for long videos (default 180: longer videos render in chunks).
// Long videos keep each chunk in out/_parts/<name>/ under a key of what it shows (chunk-cache.mjs):
// change one scene and only the chunks it touches render again. --fresh renders every chunk.
// Every render ends with the flicker check (flicker.mjs) over the final file.
import fs from 'node:fs';
import { at, chunkRanges, concatParts, ffmpegReport, loudness, probe, LOUDNESS, remotion } from './lib.mjs';
import { ensureMusicBed } from './music.mjs';
import { chunkKeys, partPaths } from './chunk-cache.mjs';
import { flickerReport } from './flicker.mjs';

/** Videos longer than this render in chunks of this length (override with CHUNK_SECONDS). */
const DEFAULT_CHUNK_SECONDS = 180;

const args = process.argv.slice(2);
const voice = args.includes('--es') ? 'es' : 'en';
const format = args.includes('--landscape') ? 'landscape' : 'vertical';
const fresh = args.includes('--fresh');
const { SETTINGS } = await import('../src/settings.ts');
const { VIDEOS } = await import('../src/timeline.ts');
const { FPS, SCENE_TRANSITION, sceneStarts } = await import('../src/timing.ts');
const { writeSrt } = await import('./srt.ts');

if (!SETTINGS.voices.includes(voice)) throw new Error(`"${voice}" is not in SETTINGS.voices`);
const frames = Math.max(1, sceneStarts(VIDEOS[voice].main).total);
// The bed covers the whole video: made when missing, remade when shorter than this cut.
if (SETTINGS.music) ensureMusicBed(frames / FPS, at('public', SETTINGS.music.src));

const id = `Main-${voice.toUpperCase()}-${format}`;
const name = `main-${voice}-${format}`;
const final = at('out', `${name}.mp4`);
fs.mkdirSync(at('out'), { recursive: true });

// One tab by default. With several tabs at once, Chrome sometimes paints only part of a large
// group under an SVG filter (feTurbulence chalk), so elements vanish on alternate frames: a long
// cut flickered for 14 s at 4 tabs and was clean at 1. One tab ran about as fast (~9 fps at
// 1080p) because the filters, not the tab count, bound the speed.
const concurrency = process.env.CONCURRENCY ?? '1';
// Long videos render in chunks of CHUNK_SECONDS, each its own Remotion process, so a 10-minute
// render never holds everything in one process. Chunks are H.264 + PCM in MKV: PCM joins without
// the AAC priming gap at each seam; the loudness pass below encodes the AAC once.
const chunkFrames = Math.round((Number(process.env.CHUNK_SECONDS) || DEFAULT_CHUNK_SECONDS) * FPS);
const ranges = chunkRanges(frames, chunkFrames);
let raw;
if (ranges.length === 1) {
  raw = at('out', `_raw-${name}.mp4`);
  remotion(['render', 'src/index.ts', id, raw, '--crf=18', `--concurrency=${concurrency}`]);
} else {
  raw = at('out', `_raw-${name}.mkv`);
  const partsDir = at('out', '_parts', name);
  fs.mkdirSync(partsDir, { recursive: true });
  const { starts } = sceneStarts(VIDEOS[voice].main);
  const keys = chunkKeys({
    root: at(),
    id,
    voice,
    scenes: VIDEOS[voice].main,
    starts,
    total: frames,
    transition: SCENE_TRANSITION,
    ranges,
    margin: 2 * FPS,
  });
  const parts = ranges.map(([a, b], k) => {
    const label = `chunk ${k + 1}/${ranges.length}: frames ${a}-${b} (${(a / FPS).toFixed(0)}-${((b + 1) / FPS).toFixed(0)} s)`;
    const { file, stale } = partPaths(partsDir, k, keys[k]);
    // A chunk whose key matches was rendered from the same scenes, code, assets and voice takes.
    // Parts render to a temp name and are renamed only when complete, so a crash never leaves a
    // half chunk behind under a valid key.
    if (!fresh && fs.existsSync(file)) {
      console.log(`${label}: unchanged, reusing ${keys[k]}`);
      return file;
    }
    console.log(label);
    const tmp = file.replace(/\.mkv$/, '.partial.mkv');
    remotion(['render', 'src/index.ts', id, tmp, '--codec=h264-mkv', `--frames=${a}-${b}`, '--crf=18', `--concurrency=${concurrency}`]);
    fs.renameSync(tmp, file);
    for (const f of stale) fs.rmSync(f, { force: true });
    return file;
  });
  concatParts(parts, raw);
  const joined = probe(raw).seconds;
  if (Math.abs(joined - frames / FPS) > 0.2) console.warn(`chunks joined to ${joined.toFixed(2)} s, expected ${(frames / FPS).toFixed(2)} s`);
}

// Measure, then apply as one linear gain so the voice does not "pump".
const target = `I=${LOUDNESS.I}:TP=${LOUDNESS.truePeak}:LRA=11`;
const m = JSON.parse(ffmpegReport(['-i', raw, '-vn', '-af', `loudnorm=${target}:print_format=json`, '-f', 'null', '-']).match(/\{[^{}]*"input_i"[^{}]*\}/)[0]);
const second = `loudnorm=${target}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`;
// linear loudnorm cannot hold the true-peak ceiling when the measured offset is large (a long cut
// measured +0.4 dBTP), so a brickwall limiter at about -2 dBFS follows it.
ffmpegReport(['-y', '-i', raw, '-c:v', 'copy', '-af', `${second},alimiter=limit=0.79:level=false:attack=1:release=50`, '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', final]);
fs.rmSync(raw);

const subs = SETTINGS.subtitles.includes(voice) ? voice : SETTINGS.subtitles[0] ?? voice;
writeSrt(at('out', `${name}.srt`), VIDEOS[voice].main, subs);

const info = probe(final);
const { I, peak } = loudness(final);
console.log(
  `${final}: ${info.width}x${info.height} @ ${info.fps} fps, ${info.seconds.toFixed(1)} s, ` +
    `${(fs.statSync(final).size / 1e6).toFixed(1)} MB, ${I.toFixed(1)} LUFS, true peak ${peak.toFixed(1)} dBTP`,
);

// Frames that differ from both neighbours while the neighbours match each other: a flicker, or a
// frame captured half painted. Look at each one before the author sees the video.
console.log(flickerReport(final));
