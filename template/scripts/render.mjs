// Renders the main cut and normalises its loudness: out/main-{en|es}-{vertical|landscape}.mp4
// (+ the matching .srt). Two-pass loudnorm to -16 LUFS integrated, true peak -1.5 dBTP.
// Usage: npm run render [-- --es] [-- --landscape] [-- --fresh] [-- --plan]
// --plan prints which chunks would be reused and which rendered, with the time it would take, and
// exits: run it before every render of a long video, and before telling anyone how long it takes.
// Env: CONCURRENCY=n Chrome tabs rendering at once (default 1, see below);
//      CHUNK_SECONDS=s length a chunk aims at (default 30); setting it also chunks videos of
//      3 minutes or less, which otherwise render in one piece.
// Long videos render in chunks of whole scenes (sceneChunks in lib.mjs), each kept in
// out/_parts/<name>/<key>.mkv under a key of what it shows relative to its own first frame
// (chunk-cache.mjs): change one line and only the chunk holding its scene renders again (also the
// next one when the scene ends a chunk, since it fades out over that chunk's first frames); a scene
// that gets longer or shorter leaves the keys of the later chunks alone. Chunks carry narration
// only: the music bed, one track under the whole video, is mixed after the join with the ducking
// the composition applies. --fresh renders every chunk.
// Every render ends with the flicker check (flicker.mjs) over the final file.
import fs from 'node:fs';
import { at, concatParts, ffmpegReport, loudness, probe, LOUDNESS, remotion, sceneChunks } from './lib.mjs';
import { ensureMusicBed, mixMusicBed } from './music.mjs';
import { chunkKeys, keysInUse, partPath, recordKeys, staleParts } from './chunk-cache.mjs';
import { flickerReport } from './flicker.mjs';

/** Videos longer than this render in chunks (shorter ones in one piece, unless CHUNK_SECONDS is set). */
const LONG_VIDEO_SECONDS = 180;
/** Length a chunk aims at: short, so a changed line re-renders about its own scene. */
const DEFAULT_CHUNK_SECONDS = 30;

const args = process.argv.slice(2);
const voice = args.includes('--es') ? 'es' : 'en';
const format = args.includes('--landscape') ? 'landscape' : 'vertical';
const fresh = args.includes('--fresh');
const plan = args.includes('--plan');
const { SETTINGS } = await import('../src/settings.ts');
const { VIDEOS } = await import('../src/timeline.ts');
const { FPS, SCENE_TRANSITION, chapterNumbers, linesInVideo, sceneFrames, sceneStarts } = await import('../src/timing.ts');
const { musicVolume } = await import('../src/music.ts');
const { writeSrt } = await import('./srt.ts');

if (!SETTINGS.voices.includes(voice)) throw new Error(`"${voice}" is not in SETTINGS.voices`);
const scenes = VIDEOS[voice].main;
const frames = Math.max(1, sceneStarts(scenes).total);
// The bed covers the whole video: made when missing, remade when shorter than this cut.
if (SETTINGS.music && !plan) ensureMusicBed(frames / FPS, at('public', SETTINGS.music.src));

const id = `Main-${voice.toUpperCase()}-${format}`;
const name = `main-${voice}-${format}`;
const final = at('out', `${name}.mp4`);
fs.mkdirSync(at('out'), { recursive: true });
const secs = (f) => (f / FPS).toFixed(0);

// One tab by default. With several tabs at once, Chrome sometimes paints only part of a large
// group under an SVG filter (feTurbulence chalk), so elements vanish on alternate frames: a long
// cut flickered for 14 s at 4 tabs and was clean at 1. One tab ran about as fast (~9 fps at
// 1080p) because the filters, not the tab count, bound the speed.
const concurrency = process.env.CONCURRENCY ?? '1';
// Long videos render in chunks, each its own Remotion process, so a 10-minute render never holds
// everything in one process. Chunks are H.264 + PCM in MKV: PCM joins without the AAC priming gap
// at each seam; the loudness pass below encodes the AAC once.
const lengths = scenes.map(sceneFrames);
const chunks =
  process.env.CHUNK_SECONDS || frames > LONG_VIDEO_SECONDS * FPS
    ? sceneChunks({ lengths, ids: scenes.map((s) => s.id), transition: SCENE_TRANSITION, target: Math.round((Number(process.env.CHUNK_SECONDS) || DEFAULT_CHUNK_SECONDS) * FPS) })
    : [];
let raw;
if (chunks.length <= 1) {
  if (plan) {
    console.log(`plan: one piece, ${frames} frames (~${Math.ceil(frames / 9 / 60)} min at 9 fps), not cached: videos of ${LONG_VIDEO_SECONDS} s or less render in one piece`);
    process.exit(0);
  }
  raw = at('out', `_raw-${name}.mp4`);
  remotion(['render', 'src/index.ts', id, raw, '--crf=18', `--concurrency=${concurrency}`]);
} else {
  raw = at('out', `_raw-${name}.mkv`);
  // One parts folder per voice and format. A video with several cuts (a chapter in or out) keeps
  // this folder and `id` free of the cut's name, so chunks the cuts share are rendered once; only
  // the output file names carry the cut. The keys say what a chunk shows, nothing else, and a part
  // is named by its key alone, so a chunk is found wherever it falls in either cut.
  const partsDir = at('out', '_parts', `main-${voice}-${format}`);
  fs.mkdirSync(partsDir, { recursive: true });
  const keys = chunkKeys({
    root: at(),
    id,
    voice,
    scenes,
    lengths,
    chapters: chapterNumbers(scenes),
    chunks,
    // The bed is mixed after the join (below), so it is no input of any chunk.
    outside: SETTINGS.music ? [SETTINGS.music.src] : [],
  });
  // The plan, printed before any work: what is cached, what renders, roughly how long (~9 fps at
  // 1080p with one tab). A chunk you expected to reuse that says RENDER means one of its scenes
  // (or the scene fading out at its start) changed its props, code, assets or takes: find which
  // before launching. Two chunks with one key (the same scenes twice) render once.
  const cached = keys.map((key, k) => (!fresh && fs.existsSync(partPath(partsDir, key))) || keys.indexOf(key) < k);
  const todo = chunks.reduce((n, { range: [a, b] }, k) => n + (cached[k] ? 0 : b - a + 1), 0);
  console.log(`plan: ${cached.filter(Boolean).length}/${chunks.length} chunks reused, ${todo} frames to render (~${Math.ceil(todo / 9 / 60)} min at 9 fps)`);
  chunks.forEach(({ first, last, range: [a, b] }, k) =>
    console.log(`  chunk ${k + 1}: ${secs(a)}-${secs(b + 1)} s  ${cached[k] ? 'reuse ' : 'RENDER'}  ${keys[k]}  scenes ${scenes.slice(first, last + 1).map((s) => s.id).join(', ')}`),
  );
  if (plan) process.exit(0);
  recordKeys(partsDir, name, keys);
  // Chunks render without the music bed and with the background on the scene clock (see
  // ArticleVideoProps.chunked), so what they show does not depend on where they fall.
  const props = JSON.stringify({ chunked: true });
  const parts = chunks.map(({ range: [a, b] }, k) => {
    const label = `chunk ${k + 1}/${chunks.length}: frames ${a}-${b} (${secs(a)}-${secs(b + 1)} s)`;
    const file = partPath(partsDir, keys[k]);
    // A chunk whose key matches was rendered from the same scenes, code, assets and voice takes.
    // Parts render to a temp name and are renamed only when complete, so a crash never leaves a
    // half chunk behind under a valid key.
    if (fs.existsSync(file) && (!fresh || keys.indexOf(keys[k]) < k)) {
      console.log(`${label}: unchanged, reusing ${keys[k]}`);
      return file;
    }
    console.log(label);
    const tmp = file.replace(/\.mkv$/, '.partial.mkv');
    remotion(['render', 'src/index.ts', id, tmp, '--codec=h264-mkv', `--frames=${a}-${b}`, `--props=${props}`, '--crf=18', `--concurrency=${concurrency}`]);
    fs.renameSync(tmp, file);
    return file;
  });
  // Parts no cut uses any more (this cut's old keys that no other cut records).
  for (const f of staleParts(partsDir, keys, keysInUse(partsDir, name))) fs.rmSync(f, { force: true });
  const joined = SETTINGS.music ? at('out', `_narration-${name}.mkv`) : raw;
  concatParts(parts, joined);
  const seconds = probe(joined).seconds;
  if (Math.abs(seconds - frames / FPS) > 0.2) console.warn(`chunks joined to ${seconds.toFixed(2)} s, expected ${(frames / FPS).toFixed(2)} s`);
  if (SETTINGS.music) {
    // The bed, as <Music> in Video.tsx plays it: from frame 0, ducked under every line of the cut.
    const music = SETTINGS.music;
    const spans = linesInVideo(scenes).map(({ line, at: from }) => ({ from, to: from + line.dur }));
    mixMusicBed({ narration: joined, out: raw, bed: at('public', music.src), frames, fps: FPS, gainAt: (s) => musicVolume(s, spans, frames / FPS, music) });
    fs.rmSync(joined);
  }
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
writeSrt(at('out', `${name}.srt`), scenes, subs);

const info = probe(final);
const { I, peak } = loudness(final);
console.log(
  `${final}: ${info.width}x${info.height} @ ${info.fps} fps, ${info.seconds.toFixed(1)} s, ` +
    `${(fs.statSync(final).size / 1e6).toFixed(1)} MB, ${I.toFixed(1)} LUFS, true peak ${peak.toFixed(1)} dBTP`,
);

// Frames that differ from both neighbours while the neighbours match each other: a flicker, or a
// frame captured half painted. Look at each one before the author sees the video.
console.log(flickerReport(final));
