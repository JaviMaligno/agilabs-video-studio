// Writes the music bed (public/music/bed.wav) with scripts/music_local.py, as long as the video
// it goes under (plus BED_MARGIN seconds).
// Uses python3 when it has numpy, else `uv run --with numpy` (cached after the first run).
// Usage: npm run music [-- seconds]   (no seconds: the length of the EN main cut + margin)
// Also mixes the bed under a long render after its chunks are joined (mixMusicBed).
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { at, ffmpegReport, findFfmpeg, probe, wavSeconds } from './lib.mjs';

/** Sample rate and channels the bed is mixed at (Remotion's audio output, and the bed's own). */
export const MIX_RATE = 48000;
export const MIX_CHANNELS = 2;

/** Bed gain for each video frame: `gainAt(seconds)` sampled at each frame's start, as Remotion does with a `volume` callback. */
export const frameGains = (frames, fps, gainAt) => Float32Array.from({ length: frames }, (_, f) => gainAt(f / fps));

/**
 * Multiplies interleaved samples, in place, by the gain of the video frame each sample falls in
 * (one value per frame, like the composition's `<Audio volume={(f) => ...}>`). Samples past the
 * last frame are silenced.
 */
export const applyFrameGains = (samples, { channels, rate, fps, gains }) => {
  const n = Math.floor(samples.length / channels);
  for (let i = 0; i < n; i++) {
    const f = Math.floor((i * fps) / rate);
    const g = f < gains.length ? gains[f] : 0;
    for (let c = 0; c < channels; c++) samples[i * channels + c] *= g;
  }
  return samples;
};

/**
 * Mixes the music bed under the narration of `narration` (a joined long render) into `out`, video
 * copied, audio as float PCM so the loudness pass that follows measures the same mix the
 * composition would have made: the bed from its first sample at frame 0 (looped if short), its gain
 * per frame from `gainAt` (musicVolume: ducking under each line, fade in and out), summed with
 * the narration at unit weight like Remotion's mixer.
 */
export const mixMusicBed = ({ narration, out, bed, frames, fps, gainAt }) => {
  const seconds = frames / fps;
  const r = spawnSync(
    findFfmpeg(),
    ['-v', 'error', '-stream_loop', '-1', '-i', bed, '-t', String(seconds), '-f', 'f32le', '-ac', String(MIX_CHANNELS), '-ar', String(MIX_RATE), '-'],
    { maxBuffer: Math.ceil((seconds + 5) * MIX_RATE * MIX_CHANNELS * 4) },
  );
  if (r.status !== 0) throw new Error(`music bed decode failed: ${String(r.stderr).slice(-800)}`);
  // A Float32Array needs a 4-byte aligned offset: copy when the buffer does not start on one.
  const buf = r.stdout.byteOffset % 4 === 0 ? r.stdout : Buffer.from(r.stdout);
  const samples = new Float32Array(buf.buffer, buf.byteOffset, Math.floor(buf.length / 4));
  applyFrameGains(samples, { channels: MIX_CHANNELS, rate: MIX_RATE, fps, gains: frameGains(frames, fps, gainAt) });
  const tmp = `${out}.music.f32`;
  fs.writeFileSync(tmp, buf);
  try {
    const fmt = `aformat=sample_fmts=flt:sample_rates=${MIX_RATE}:channel_layouts=stereo`;
    // Before the TTS has run the chunks are silent and carry no audio stream: the bed goes alone.
    const graph = probe(narration).audio
      ? `[0:a]aresample=${MIX_RATE},${fmt}[v];[1:a]${fmt}[m];[v][m]amix=inputs=2:normalize=0:duration=first[a]`
      : `[1:a]${fmt}[a]`;
    ffmpegReport([
      '-y', '-i', narration,
      '-f', 'f32le', '-ar', String(MIX_RATE), '-ac', String(MIX_CHANNELS), '-i', tmp,
      '-filter_complex', graph,
      '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'pcm_f32le', out,
    ]);
  } finally {
    fs.rmSync(tmp, { force: true });
  }
};

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
