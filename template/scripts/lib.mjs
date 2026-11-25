// Helpers shared by the scripts: secrets, ffmpeg, Cartesia endpoint.
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

/** The template folder (scripts run from it through npm, but do not rely on the cwd). */
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const at = (...p) => path.join(ROOT, ...p);

const fromEnvFile = (file, name) => {
  if (!fs.existsSync(file)) return undefined;
  const line = fs.readFileSync(file, 'utf8').split(/\r?\n/).find((l) => l.trim().startsWith(`${name}=`));
  const v = line?.slice(line.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '');
  return v || undefined;
};

/**
 * A secret from, in order: the environment, template/.env, ~/Documents/repos/.env.
 * The value is never logged; errors only name where it was looked for.
 */
export const secret = (name, required = true) => {
  const v = process.env[name] || fromEnvFile(at('.env'), name) || fromEnvFile(path.join(os.homedir(), 'Documents', 'repos', '.env'), name);
  if (!v && required) throw new Error(`${name} not found (env, template/.env or ~/Documents/repos/.env)`);
  return v;
};

let ffmpegBin;
/** ffmpeg: $FFMPEG_PATH, else the one on PATH. */
export const findFfmpeg = () => {
  if (ffmpegBin) return ffmpegBin;
  const candidate = process.env.FFMPEG_PATH || 'ffmpeg';
  try {
    execFileSync(candidate, ['-version'], { stdio: 'ignore' });
  } catch {
    throw new Error('ffmpeg not found: install it (brew install ffmpeg) or set FFMPEG_PATH');
  }
  return (ffmpegBin = candidate);
};

/** Runs ffmpeg and returns its stderr, where analysis filters (loudnorm, astats…) report. */
export const ffmpegReport = (args) => {
  const r = spawnSync(findFfmpeg(), ['-hide_banner', '-nostats', ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(`ffmpeg failed: ${r.stderr.slice(-800)}`);
  return r.stderr;
};

/** Duration, size and frame rate of a video, through the ffprobe next to ffmpeg. */
export const probe = (file) => {
  // $FFPROBE_PATH, else the ffprobe next to ffmpeg (also ffmpeg.exe -> ffprobe.exe on Windows).
  const bin = process.env.FFPROBE_PATH || findFfmpeg().replace(/ffmpeg(\.exe)?$/i, 'ffprobe$1');
  const json = JSON.parse(
    execFileSync(bin, ['-v', 'error', '-show_entries', 'format=duration:stream=codec_type,width,height,r_frame_rate', '-of', 'json', file], { encoding: 'utf8' }),
  );
  const video = json.streams.find((s) => s.codec_type === 'video');
  const [num, den] = (video?.r_frame_rate ?? '0/1').split('/').map(Number);
  return {
    seconds: +(+json.format.duration).toFixed(3),
    width: video?.width,
    height: video?.height,
    fps: den ? +(num / den).toFixed(3) : 0,
    audio: json.streams.some((s) => s.codec_type === 'audio'),
  };
};

/** Integrated loudness (LUFS) and true peak (dBTP) of a file's audio. */
export const loudness = (file) => {
  const out = ffmpegReport(['-i', file, '-vn', '-af', 'ebur128=peak=true', '-f', 'null', '-']);
  const summary = out.slice(out.lastIndexOf('Summary:'));
  const I = +(summary.match(/I:\s+(-?[\d.]+) LUFS/)?.[1] ?? NaN);
  const peak = +(summary.match(/Peak:\s+(-?[\d.]+|-inf) dBFS/)?.[1] ?? NaN);
  return { I, peak };
};

/** Duration of a PCM WAV buffer, read from its chunks (any header layout ffmpeg writes). */
export const wavSeconds = (buf) => {
  let off = 12;
  let byteRate = 0;
  while (off + 8 <= buf.length) {
    const id = buf.toString('ascii', off, off + 4);
    const len = buf.readUInt32LE(off + 4);
    if (id === 'fmt ') byteRate = buf.readUInt32LE(off + 16);
    if (id === 'data') return byteRate ? Math.min(len, buf.length - off - 8) / byteRate : 0;
    off += 8 + len + (len % 2);
  }
  return 0;
};

/** Target loudness of every delivered mix, and the tolerance audio QA accepts. */
export const LOUDNESS = { I: -16, tolerance: 1, truePeak: -1.5 };

export const CARTESIA = {
  base: process.env.CARTESIA_BASE ?? 'https://api.cartesia.ai',
  version: '2026-08-14',
  sampleRate: 44100,
};
export const cartesiaHeaders = (key, json = true) => ({
  Authorization: `Bearer ${key}`,
  'Cartesia-Version': CARTESIA.version,
  ...(json ? { 'Content-Type': 'application/json' } : {}),
});

/**
 * Run the Remotion CLI through node itself: `npx` is `npx.cmd` on Windows, which execFileSync
 * cannot spawn without a shell, and a shell would mangle JSON arguments such as --props.
 */
export const remotion = (args) =>
  execFileSync(process.execPath, [at('node_modules', '@remotion', 'cli', 'remotion-cli.js'), ...args], { stdio: 'inherit', cwd: at() });

/** Whether a scene id is an anchor: a place where a chunk may end once it is long enough. */
export const isAnchor = (id) => (crypto.createHash('sha256').update(String(id)).digest()[0] & 1) === 0;

/**
 * Chunks for a long render: runs of whole scenes, each about `target` frames, with the frame range
 * each covers (inclusive like Remotion's `--frames=a-b`): consecutive, covering 0..total-1 once.
 *
 * Boundary: a chunk starts on the first frame of its first scene's cross-fade in (the scene's start
 * frame, where the previous scene still shows and fades out) and ends on the frame before the
 * cross-fade out of its last scene. So no cross-fade is ever split: each lives whole in the chunk of
 * the scene it fades into, and that chunk's key also holds the scene that fades out (its tail is
 * on screen and its last line may still be heard). The other choice (end a chunk after the fade
 * out) costs the same, one neighbour in the key; this one puts every boundary on a scene start.
 *
 * Where to cut is decided by the content, not by the position, so that a scene that gets longer
 * or shorter regroups at most the chunks around it, never every later one (with fixed lengths
 * counted from frame 0, or with "cut when the run reaches the target", one shift moves every later
 * boundary). A run may end before scene j when it is at least target/2 long and scene j is an
 * anchor (a hash of its id: about every other scene, stable across edits, cuts and languages). A
 * run is cut before it would pass 2 x target, and a scene of `target` or more is a chunk of its own.
 * After a change the two groupings meet again at the next anchor both reach.
 *
 * @param {object} o
 * @param {number[]} o.lengths frames of each scene (sceneFrames)
 * @param {string[]} o.ids scene ids
 * @param {number} o.transition frames two consecutive scenes overlap
 * @param {number} o.target chunk length to aim at, in frames
 * @returns {{first: number, last: number, range: [number, number]}[]}
 */
export const sceneChunks = ({ lengths, ids, transition, target }) => {
  const n = lengths.length;
  if (!(n >= 1) || ids.length !== n || !(target >= 1)) throw new Error(`sceneChunks: need scenes with ids and a target >= 1 (got ${n} scenes, ${ids.length} ids, target ${target})`);
  const starts = [];
  let at = 0;
  lengths.forEach((len, i) => {
    starts.push(at);
    at += len - (i < n - 1 ? transition : 0);
  });
  const total = Math.max(1, at);
  const runs = [[0, 0]];
  for (let j = 1; j < n; j++) {
    const run = runs.at(-1);
    const held = starts[j] - starts[run[0]];
    const cut =
      lengths[j] >= target ||
      lengths[j - 1] >= target ||
      (held >= target / 2 && isAnchor(ids[j])) ||
      held + lengths[j] - transition > 2 * target;
    if (cut) runs.push([j, j]);
    else run[1] = j;
  }
  return runs.map(([first, last]) => ({ first, last, range: [starts[first], last + 1 < n ? starts[last + 1] - 1 : total - 1] }));
};

/** An ffmpeg concat-demuxer list for `files` (forward slashes, single quotes escaped). */
export const concatList = (files) => files.map((f) => `file '${f.replace(/\\/g, '/').replace(/'/g, "'\\''")}'\n`).join('');

/** Joins same-codec parts into `out` without re-encoding (ffmpeg concat demuxer, stream copy). */
export const concatParts = (files, out) => {
  const list = `${out}.txt`;
  fs.writeFileSync(list, concatList(files));
  try {
    ffmpegReport(['-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', out]);
  } finally {
    fs.rmSync(list, { force: true });
  }
};
