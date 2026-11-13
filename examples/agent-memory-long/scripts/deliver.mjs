// Everything to post besides the video itself, for every rendered main cut in out/:
// poster PNG (SETTINGS.poster, else the first anim scene at 1.5 s, else the intro once its hook
// has played),
// SRT captions, and out/manifest.json with durations, sizes and loudness.
// When the landscape cut exists (YouTube): out/youtube-chapters-<voice>.txt for the description
// (from the chapter scenes) and out/thumbnail-<voice>.png, 1280x720, from the landscape
// composition at SETTINGS.thumbnail (else the poster frame), without captions.
// Run after `npm run render`. Lint issues are printed as a reminder; they do not stop delivery.
// Usage: npm run deliver
import fs from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { at, ffmpegReport, loudness, probe, remotion } from './lib.mjs';

const { SETTINGS } = await import('../src/settings.ts');
const { VIDEOS } = await import('../src/timeline.ts');
const { FPS, sceneStarts, sceneFrames } = await import('../src/timing.ts');
const { tx } = await import('../src/types.ts');
const { youtubeChapters } = await import('../src/chapters.ts');
const { writeSrt } = await import('./srt.ts');

spawnSync('node', [at('scripts', 'lint.ts')], { stdio: 'inherit', cwd: at() });
fs.mkdirSync(at('out'), { recursive: true });

/** Poster frame: the scene and second chosen (`chosen`, default SETTINGS.poster), else a frame with the visual idea on it. */
const posterFrame = (scenes, chosen = SETTINGS.poster) => {
  const { starts } = sceneStarts(scenes);
  const firstAnim = scenes.findIndex((s) => s.kind === 'anim');
  // No anim scene: the intro once its hook line has fully played (every word lit).
  const hook = scenes[0]?.lines[0];
  const pick = chosen
    ? { index: scenes.findIndex((s) => s.id === chosen.scene), second: chosen.second }
    : firstAnim >= 0
      ? { index: firstAnim, second: 1.5 }
      : { index: 0, second: hook ? +(hook.start + hook.dur + 0.2).toFixed(2) : 1.5 };
  if (pick.index < 0) throw new Error(`scene "${chosen.scene}" (SETTINGS.poster / SETTINGS.thumbnail) is not in the timeline`);
  const frame = Math.min(starts[pick.index] + Math.round(pick.second * FPS), starts[pick.index] + sceneFrames(scenes[pick.index]) - 1);
  return { scene: scenes[pick.index].id, second: pick.second, frame };
};

const manifest = {
  generated: new Date().toISOString(),
  article: SETTINGS.articleTitle,
  targetSeconds: SETTINGS.targetSeconds,
  videos: [],
  posters: [],
  captions: [],
  thumbnails: [],
  youtubeChapters: [],
};

for (const voice of SETTINGS.voices) {
  const scenes = VIDEOS[voice].main;
  const subs = SETTINGS.subtitles.includes(voice) ? voice : SETTINGS.subtitles[0] ?? voice;

  const poster = posterFrame(scenes);
  const posterFile = `poster-${voice}.png`;
  const props = JSON.stringify({ voice, subs, vertical: true, noSubs: true });
  remotion(['still', 'src/index.ts', `Main-${voice.toUpperCase()}-vertical`, `out/${posterFile}`, `--frame=${poster.frame}`, `--props=${props}`]);
  manifest.posters.push({ file: posterFile, voice, ...poster });

  for (const format of ['vertical', 'landscape']) {
    const name = `main-${voice}-${format}`;
    const video = at('out', `${name}.mp4`);
    if (!fs.existsSync(video)) continue;
    writeSrt(at('out', `${name}.srt`), scenes, subs);
    manifest.captions.push({ file: `${name}.srt`, lang: subs });
    const info = probe(video);
    const { I, peak } = loudness(video);
    manifest.videos.push({
      file: `${name}.mp4`,
      voice,
      format,
      seconds: info.seconds,
      width: info.width,
      height: info.height,
      fps: info.fps,
      megabytes: +(fs.statSync(video).size / 1e6).toFixed(2),
      lufs: +I.toFixed(1),
      truePeak: +peak.toFixed(1),
      scenes: scenes.map((s) => ({ id: s.id, kind: s.kind, seconds: +(sceneFrames(s) / FPS).toFixed(2), ...(s.chapter ? { chapter: tx(s.chapter, voice) } : {}) })),
    });

    if (format !== 'landscape') continue;
    // YouTube: the chapter list for the description, from the real scene starts.
    const yt = youtubeChapters(scenes, voice);
    const chaptersFile = `youtube-chapters-${voice}.txt`;
    fs.writeFileSync(at('out', chaptersFile), yt.text);
    for (const w of yt.warnings) console.warn(`${chaptersFile}: ${w}`);
    const timelineSeconds = sceneStarts(scenes).total / FPS;
    if (Math.abs(info.seconds - timelineSeconds) > 1) {
      console.warn(`${chaptersFile}: the render lasts ${info.seconds.toFixed(1)} s but the timeline ${timelineSeconds.toFixed(1)} s: re-render before using the chapters`);
    }
    manifest.youtubeChapters.push({ file: chaptersFile, voice, chapters: yt.chapters, warnings: yt.warnings });

    // YouTube thumbnail: the landscape composition without captions, scaled to 1280x720.
    const thumb = posterFrame(scenes, SETTINGS.thumbnail ?? SETTINGS.poster);
    const thumbFile = `thumbnail-${voice}.png`;
    const full = at('out', `_thumbnail-${voice}-full.png`);
    const lprops = JSON.stringify({ voice, subs, vertical: false, noSubs: true });
    remotion(['still', 'src/index.ts', `Main-${voice.toUpperCase()}-landscape`, full, `--frame=${thumb.frame}`, `--props=${lprops}`]);
    ffmpegReport(['-y', '-i', full, '-vf', 'scale=1280:720:flags=lanczos', at('out', thumbFile)]);
    fs.rmSync(full);
    manifest.thumbnails.push({ file: thumbFile, voice, width: 1280, height: 720, ...thumb });
  }
}

if (!manifest.videos.length) console.warn('No render in out/ yet: run `npm run render` first for the video entries.');
fs.writeFileSync(at('out', 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(
  `out/manifest.json: ${manifest.videos.length} video(s), ${manifest.posters.length} poster(s), ${manifest.captions.length} caption file(s), ` +
    `${manifest.thumbnails.length} thumbnail(s), ${manifest.youtubeChapters.length} YouTube chapter list(s)`,
);
