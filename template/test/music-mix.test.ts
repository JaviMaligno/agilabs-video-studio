import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { applyFrameGains, frameGains, mixMusicBed } from '../scripts/music.mjs';
import { musicVolume } from '../src/music.ts';
import { sceneClock, sceneFrames, sceneStarts, SCENE_TRANSITION, FPS } from '../src/timing.ts';
import type { Scene } from '../src/types.ts';

const music = { volume: 0.2, duck: 0.3 };

test('the bed gain per frame is the composition`s musicVolume at that frame', () => {
  const spans = [{ from: 1, to: 2.5 }];
  const gains = frameGains(120, 30, (s: number) => musicVolume(s, spans, 4, music));
  assert.equal(gains.length, 120);
  for (const f of [0, 15, 30, 45, 60, 90, 119]) assert.ok(Math.abs(gains[f] - musicVolume(f / 30, spans, 4, music)) < 1e-6);
});

test('each sample takes the gain of the video frame it falls in; past the end is silent', () => {
  // 2 channels at 90 samples per second and 30 fps: 3 samples per frame.
  const samples = new Float32Array(2 * 12).fill(1);
  applyFrameGains(samples, { channels: 2, rate: 90, fps: 30, gains: Float32Array.from([0.5, 0.25, 1]) });
  assert.deepEqual([...samples], [...Array(6).fill(0.5), ...Array(6).fill(0.25), ...Array(6).fill(1), ...Array(6).fill(0)]);
});

const hasFfmpeg = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' }).status === 0;
const ff = (args: string[]) => {
  const r = spawnSync('ffmpeg', ['-v', 'error', '-y', ...args], { maxBuffer: 64 * 1024 * 1024 });
  assert.equal(r.status, 0, String(r.stderr));
  return r.stdout;
};
const rms = (x: Float32Array, a: number, b: number) => Math.sqrt(x.slice(a, b).reduce((s, v) => s + v * v, 0) / (b - a));

test('the bed is mixed under the joined narration with its per-frame gain', { skip: !hasFfmpeg && 'ffmpeg not installed' }, () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mix-'));
  const narration = path.join(dir, 'narration.mkv');
  const bed = path.join(dir, 'bed.wav');
  const out = path.join(dir, 'mixed.mkv');
  // 2 s of picture with silent narration (as a joined render: H.264 + PCM in MKV), and a tone bed.
  ff(['-f', 'lavfi', '-i', 'color=c=black:s=64x64:r=30:d=2', '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo', '-t', '2', '-c:v', 'libx264', '-c:a', 'pcm_s16le', narration]);
  ff(['-f', 'lavfi', '-i', 'sine=frequency=440:sample_rate=48000:duration=3', '-ac', '2', bed]);
  mixMusicBed({ narration, out, bed, frames: 60, fps: 30, gainAt: (s: number) => (s < 1 ? 0.5 : 0.1) });
  const pcm = ff(['-i', out, '-f', 'f32le', '-ac', '1', '-ar', '48000', '-']);
  const x = new Float32Array(pcm.buffer.slice(pcm.byteOffset, pcm.byteOffset + pcm.length));
  assert.ok(Math.abs(x.length / 48000 - 2) < 0.05, `${x.length / 48000} s`);
  // lavfi's sine is at 1/8 full scale: RMS 0.125/sqrt(2) times the gain.
  const tone = 0.125 / Math.SQRT2;
  assert.ok(Math.abs(rms(x, 4800, 43200) / tone - 0.5) < 0.02);
  assert.ok(Math.abs(rms(x, 52800, 91200) / tone - 0.1) < 0.02);
  // The picture is copied, not re-encoded.
  const v = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v', '-show_entries', 'stream=codec_name', '-of', 'csv=p=0', out], { encoding: 'utf8' });
  assert.equal(v.stdout.trim(), 'h264');
});

const scene = (id: string, seconds: number): Scene => ({ id, kind: 'anim', lines: [], beats: [], minSeconds: seconds });

test('the scene clock depends on scene lengths only, never on where the scene falls', () => {
  const a = [scene('a', 5), scene('b', 4), scene('c', 6)];
  const b = [scene('x', 9), ...a.slice(1)]; // a longer first scene: b and c land later
  const sa = sceneStarts(a).starts;
  const sb = sceneStarts(b).starts;
  const shift = sb[1] - sa[1];
  assert.ok(shift > 0);
  // From the frame scene c starts (its fade in from b included) to its end, the same clock.
  for (let f = sa[2]; f < sceneStarts(a).total; f++) assert.deepEqual(sceneClock(f + shift, sb), sceneClock(f, sa));
  // Inside a scene, one clock; over the cross-fade, both scenes', weights summing to 1.
  assert.deepEqual(sceneClock(sa[1] + SCENE_TRANSITION + 3, sa), [{ seconds: (SCENE_TRANSITION + 3) / FPS, weight: 1 }]);
  const mid = sceneClock(sa[1] + SCENE_TRANSITION / 2, sa);
  assert.equal(mid.length, 2);
  assert.ok(Math.abs(mid[0].weight + mid[1].weight - 1) < 1e-9);
  assert.ok(Math.abs(mid[0].seconds - (sceneFrames(a[0]) - SCENE_TRANSITION / 2) / FPS) < 1e-9);
  assert.equal(sceneClock(0, sa)[0].seconds, 0);
});

