// Renders the main cut and normalises its loudness: out/main-{en|es}-{vertical|landscape}.mp4
// (+ the matching .srt). Two-pass loudnorm to -16 LUFS integrated, true peak -1.5 dBTP.
// Usage: npm run render [-- --es] [-- --landscape]
// Env: CONCURRENCY=n render threads (default: half the CPU threads);
//      CHUNK_SECONDS=s chunk length for long videos (default 180: longer videos render in chunks).
import fs from 'node:fs';
import os from 'node:os';
import { at, chunkRanges, concatParts, ffmpegReport, loudness, probe, LOUDNESS, remotion } from './lib.mjs';
import { ensureMusicBed } from './music.mjs';

/** Videos longer than this render in chunks of this length (override with CHUNK_SECONDS). */
const DEFAULT_CHUNK_SECONDS = 180;

const args = process.argv.slice(2);
const voice = args.includes('--es') ? 'es' : 'en';
const format = args.includes('--landscape') ? 'landscape' : 'vertical';
const { SETTINGS } = await import('../src/settings.ts');
const { VIDEOS } = await import('../src/timeline.ts');
const { FPS, sceneStarts } = await import('../src/timing.ts');
const { writeSrt } = await import('./srt.ts');

if (!SETTINGS.voices.includes(voice)) throw new Error(`"${voice}" is not in SETTINGS.voices`);
const frames = Math.max(1, sceneStarts(VIDEOS[voice].main).total);
// The bed covers the whole video: made when missing, remade when shorter than this cut.
if (SETTINGS.music) ensureMusicBed(frames / FPS, at('public', SETTINGS.music.src));

const id = `Main-${voice.toUpperCase()}-${format}`;
const name = `main-${voice}-${format}`;
const final = at('out', `${name}.mp4`);
fs.mkdirSync(at('out'), { recursive: true });

const concurrency = process.env.CONCURRENCY ?? String(Math.max(2, Math.floor(os.cpus().length / 2)));
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
  const parts = ranges.map((_, k) => at('out', `_part-${name}-${String(k).padStart(2, '0')}.mkv`));
  ranges.forEach(([a, b], k) => {
    console.log(`chunk ${k + 1}/${ranges.length}: frames ${a}-${b} (${(a / FPS).toFixed(0)}-${((b + 1) / FPS).toFixed(0)} s)`);
    remotion(['render', 'src/index.ts', id, parts[k], '--codec=h264-mkv', `--frames=${a}-${b}`, '--crf=18', `--concurrency=${concurrency}`]);
  });
  concatParts(parts, raw);
  for (const p of parts) fs.rmSync(p);
  const joined = probe(raw).seconds;
  if (Math.abs(joined - frames / FPS) > 0.2) console.warn(`chunks joined to ${joined.toFixed(2)} s, expected ${(frames / FPS).toFixed(2)} s`);
}

// Measure, then apply as one linear gain so the voice does not "pump".
const target = `I=${LOUDNESS.I}:TP=${LOUDNESS.truePeak}:LRA=11`;
const m = JSON.parse(ffmpegReport(['-i', raw, '-vn', '-af', `loudnorm=${target}:print_format=json`, '-f', 'null', '-']).match(/\{[^{}]*"input_i"[^{}]*\}/)[0]);
const second = `loudnorm=${target}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`;
ffmpegReport(['-y', '-i', raw, '-c:v', 'copy', '-af', second, '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', final]);
fs.rmSync(raw);

const subs = SETTINGS.subtitles.includes(voice) ? voice : SETTINGS.subtitles[0] ?? voice;
writeSrt(at('out', `${name}.srt`), VIDEOS[voice].main, subs);

const info = probe(final);
const { I, peak } = loudness(final);
console.log(
  `${final}: ${info.width}x${info.height} @ ${info.fps} fps, ${info.seconds.toFixed(1)} s, ` +
    `${(fs.statSync(final).size / 1e6).toFixed(1)} MB, ${I.toFixed(1)} LUFS, true peak ${peak.toFixed(1)} dBTP`,
);
