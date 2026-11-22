// Frames of a rendered cut for the reel-watcher agent: out/review/main-{voice}-{format}/.
// Pulls, at full resolution:
//   - frame 0 and a strip from 0 to 8 s every 0.5 s (the first second decides the scroll);
//   - every scene change: the last clean frame before it, the middle of the transition and the
//     first clean frame after it, measured: how alike the stage's drawing is on both sides and
//     whether the middle dips to black. Same picture plus a dip is the glitch to catch;
//   - every narration line: just before it starts, half way through and when it ends (the action
//     it narrates must not show before, and must be visible and complete by the end);
//   - the last frame.
// Then contact sheets per section and index.md: each frame with its time, scene, the line being
// spoken, and the images in public/ (the only cast the video may draw on).
// Scene and line times come from src/timeline.ts. When the video does not match the timeline
// (another cut, an older render), or with --detect, scene changes come from ffmpeg's scene
// detection instead and there are no line frames.
// Usage: npm run review-frames [-- --es] [-- --landscape] [-- --video path.mp4] [-- --detect]
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { FPS, SCENE_TRANSITION, linesInVideo, sceneStarts } from '../src/timing.ts';
import type { Lang, Scene } from '../src/types.ts';
import { at, ffmpegReport, findFfmpeg, probe } from './lib.mjs';

/** Seconds of opening strip, and its step. */
export const OPENING_SECONDS = 8;
export const OPENING_STEP = 0.5;
/**
 * Similarity (SSIM of the stage's edge maps, 0-1) either side of a scene change from which the
 * picture counts as the same. Calibrated on rendered reels: the same chat carried on scores
 * 0.89-0.91, a new picture 0.39-0.65. Plain SSIM or PSNR do not separate them: the shared dark
 * background makes two sparse, different pictures look alike.
 */
export const SAME_PICTURE = 0.8;
/**
 * The middle of a transition is a dip when the stage holds less than this share of the detail
 * (edges) of either side. A dip shows the bare background (no edges); a blend keeps both pictures.
 */
export const DIP_RATIO = 0.25;
/** Timeline and video lengths may differ by this much before the timeline is distrusted. */
const LENGTH_SLACK = 0.25;

export type Section = 'opening' | 'cuts' | 'lines';
export type Shot = { frame: number; section: Section; label: string; scene?: string; cut?: number };

/**
 * The frames to pull, from the timeline when there is one, else from detected cut times (seconds).
 * Frames are unique within a section and clamped to the video.
 */
export function planShots(opts: { totalFrames: number; fps?: number; scenes?: Scene[]; cuts?: number[] }): Shot[] {
  const fps = opts.fps ?? FPS;
  const last = Math.max(0, opts.totalFrames - 1);
  const clamp = (f: number) => Math.min(last, Math.max(0, Math.round(f)));
  const shots: Shot[] = [];
  const add = (frame: number, section: Section, label: string, extra: Partial<Shot> = {}) => {
    const f = clamp(frame);
    if (!shots.some((s) => s.section === section && s.frame === f)) shots.push({ frame: f, section, label, ...extra });
  };

  add(0, 'opening', 'frame 0');
  for (let t = OPENING_STEP; t <= OPENING_SECONDS + 1e-9; t += OPENING_STEP) add(t * fps, 'opening', `opening ${t.toFixed(1)} s`);

  if (opts.scenes?.length) {
    const scenes = opts.scenes;
    const { starts } = sceneStarts(scenes);
    for (let i = 1; i < scenes.length; i++) {
      const s = starts[i];
      const join = `${scenes[i - 1].id} → ${scenes[i].id}`;
      add(s - 1, 'cuts', `before cut ${i}: last frame of "${scenes[i - 1].id}"`, { scene: scenes[i - 1].id, cut: i });
      add(s + SCENE_TRANSITION / 2, 'cuts', `mid cut ${i}: ${join}`, { cut: i });
      add(s + SCENE_TRANSITION, 'cuts', `after cut ${i}: first frame of "${scenes[i].id}"`, { scene: scenes[i].id, cut: i });
    }
    for (const { scene, line, at: t } of linesInVideo(scenes)) {
      add((t - 0.2) * fps, 'lines', `before ${line.key}`, { scene: scene.id });
      add((t + line.dur / 2) * fps, 'lines', `mid ${line.key}`, { scene: scene.id });
      add((t + line.dur) * fps, 'lines', `end ${line.key}`, { scene: scene.id });
    }
  } else {
    // A detected cut is the middle of its transition (the bottom of a dip, or a hard cut).
    (opts.cuts ?? []).forEach((c, i) => {
      const f = c * fps;
      add(f - SCENE_TRANSITION / 2 - 1, 'cuts', `before cut ${i + 1} (detected at ${c.toFixed(2)} s)`, { cut: i + 1 });
      add(f, 'cuts', `mid cut ${i + 1}`, { cut: i + 1 });
      add(f + SCENE_TRANSITION / 2 + 1, 'cuts', `after cut ${i + 1}`, { cut: i + 1 });
    });
  }
  add(last, 'lines', 'last frame');
  return shots;
}

/** The narration line on air at a video second, or the next one when it falls in a pause. */
export function lineAt(scenes: Scene[], t: number, lang: Lang): string {
  const lines = linesInVideo(scenes);
  const on = lines.find(({ line, at: s }) => t >= s && t < s + line.dur);
  if (on) return `"${on.line.text[lang] || on.line.text.en}"`;
  const next = lines.find(({ at: s }) => s > t);
  return next ? `(pause; next: "${next.line.text[lang] || next.line.text.en}")` : '(pause)';
}

const stageCrop = (vertical: boolean) => (vertical ? 'crop=1080:1000:0:280' : 'null');

/**
 * The bottoms of the dips in a detail series (seconds): runs where the stage holds almost no
 * detail (under a tenth of the video's median) are the dips between scenes.
 */
export function dipCentres(series: { t: number; detail: number }[]): number[] {
  if (!series.length) return [];
  const sorted = series.map((p) => p.detail).sort((a, b) => a - b);
  const floor = Math.max(0.3, 0.1 * sorted[Math.floor(sorted.length / 2)]);
  const centres: number[] = [];
  let run: { t: number; detail: number }[] = [];
  const close = () => {
    if (run.length) centres.push(run.reduce((m, p) => (p.detail < m.detail ? p : m)).t);
    run = [];
  };
  for (const p of series) (p.detail < floor ? run.push(p) : close());
  close();
  return centres;
}

/**
 * Scene changes of a video without a matching timeline (seconds): the dips to the background,
 * plus hard cuts from ffmpeg's scene score. A blend between two pictures is not found.
 */
export function detectCuts(video: string, vertical: boolean): number[] {
  const detail = ffmpegReport(['-i', video, '-an', '-vf', `${stageCrop(vertical)},scale=270:-2,edgedetect,signalstats,metadata=print:key=lavfi.signalstats.YAVG`, '-f', 'null', '-']);
  const series = [...detail.matchAll(/pts_time:([\d.]+)[\s\S]*?YAVG=([\d.]+)/g)].map((m) => ({ t: +m[1], detail: +m[2] }));
  const hard = ffmpegReport(['-i', video, '-an', '-vf', `scale=270:-2,select='gt(scene,0.4)',showinfo`, '-f', 'null', '-']);
  const times = [...dipCentres(series), ...[...hard.matchAll(/pts_time:([\d.]+)/g)].map((m) => +m[1])].sort((a, b) => a - b);
  return times.filter((t, i) => i === 0 || t - times[i - 1] > 1);
}

/** How alike two frames' drawings are: SSIM of their softened edge maps, over the stage when vertical. */
const similarity = (a: string, b: string, vertical: boolean): number => {
  const prep = `${stageCrop(vertical)},scale=270:-2,edgedetect,gblur=sigma=2`;
  const out = ffmpegReport(['-i', a, '-i', b, '-lavfi', `[0]${prep}[x];[1]${prep}[y];[x][y]ssim`, '-f', 'null', '-']);
  return +(out.match(/All:([\d.]+)/)?.[1] ?? NaN);
};

/** How much detail the stage of a frame holds: the mean of its edge map. */
const detail = (file: string, vertical: boolean): number =>
  +(ffmpegReport(['-i', file, '-vf', `${stageCrop(vertical)},edgedetect,signalstats,metadata=print:key=lavfi.signalstats.YAVG`, '-f', 'null', '-']).match(/YAVG=([\d.]+)/)?.[1] ?? NaN);

const images = (dir: string, base = dir): string[] =>
  !fs.existsSync(dir)
    ? []
    : fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) return ['audio', 'music', 'stills'].includes(e.name) ? [] : images(p, base);
        return /\.(png|jpe?g|webp|svg)$/i.test(e.name) ? [path.relative(base, p)] : [];
      });

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const args = process.argv.slice(2);
  const voice: Lang = args.includes('--es') ? 'es' : 'en';
  const format = args.includes('--landscape') ? 'landscape' : 'vertical';
  const name = `main-${voice}-${format}`;
  const vi = args.indexOf('--video');
  const video = path.resolve(vi >= 0 ? args[vi + 1] : at('out', `${name}.mp4`));
  if (!fs.existsSync(video)) throw new Error(`${video} not found: run \`npm run render\` first (or pass --video)`);

  const info = probe(video);
  const fps = info.fps || FPS;
  // The video stream's own frame count: the container can run a few frames longer (audio).
  const counted = parseInt(execFileSync(findFfmpeg().replace(/ffmpeg$/, 'ffprobe'), ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=nb_frames', '-of', 'default=nw=1:nk=1', video], { encoding: 'utf8' }), 10);
  const totalFrames = counted > 0 ? counted : Math.floor(info.seconds * fps);
  let scenes: Scene[] | undefined;
  let why = '--detect';
  if (!args.includes('--detect')) {
    const { VIDEOS } = await import('../src/timeline.ts');
    const candidate: Scene[] = VIDEOS[voice]?.main ?? [];
    const seconds = sceneStarts(candidate).total / FPS;
    if (candidate.length && Math.abs(seconds - info.seconds) <= LENGTH_SLACK && Math.abs(fps - FPS) < 0.01) scenes = candidate;
    else why = `the timeline lasts ${seconds.toFixed(2)} s and the video ${info.seconds.toFixed(2)} s @ ${fps} fps`;
  }
  const cuts = scenes ? undefined : detectCuts(video, format === 'vertical');
  if (!scenes) console.warn(`review-frames: scene changes detected by ffmpeg (${why}); no line frames.`);

  const shots = planShots({ totalFrames, fps, scenes, cuts });
  const dir = at('out', 'review', vi >= 0 ? path.basename(video, path.extname(video)) : name);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(path.join(dir, 'frames'), { recursive: true });

  const fileOf = (f: number) => path.join(dir, 'frames', `f${String(f).padStart(5, '0')}.jpg`);
  // One decoding pass: select the wanted frame numbers, write them in order, then name them.
  const wanted = [...new Set(shots.map((s) => s.frame))].sort((a, b) => a - b);
  const pass = path.join(dir, 'frames', 'pass-%05d.jpg');
  const select = wanted.map((f) => `eq(n,${f})`).join('+');
  ffmpegReport(['-y', '-i', video, '-an', '-vf', `select='${select}'`, '-fps_mode', 'passthrough', '-q:v', '2', pass]);
  wanted.forEach((f, i) => {
    const got = path.join(dir, 'frames', `pass-${String(i + 1).padStart(5, '0')}.jpg`);
    if (!fs.existsSync(got)) throw new Error(`frame ${f} was not extracted (the video has ${totalFrames} frames)`);
    fs.renameSync(got, fileOf(f));
  });

  // One contact sheet per section (at most 24 frames each), in the order of the index.
  const sheets: string[] = [];
  const thumb = format === 'vertical' ? 'scale=270:480' : 'scale=480:270';
  for (const section of ['opening', 'cuts', 'lines'] as Section[]) {
    const list = shots.filter((s) => s.section === section);
    for (let p = 0; p * 24 < list.length; p++) {
      const page = list.slice(p * 24, p * 24 + 24);
      const tmp = fs.mkdtempSync(path.join(dir, '.sheet-'));
      page.forEach((s, i) => fs.symlinkSync(fileOf(s.frame), path.join(tmp, `${String(i).padStart(3, '0')}.jpg`)));
      const cols = Math.min(6, page.length);
      const sheet = `sheet-${section}${list.length > 24 ? `-${p + 1}` : ''}.jpg`;
      ffmpegReport(['-y', '-framerate', '1', '-i', path.join(tmp, '%03d.jpg'), '-vf', `${thumb},tile=${cols}x${Math.ceil(page.length / cols)}:padding=6:color=white`, '-frames:v', '1', '-q:v', '3', path.join(dir, sheet)]);
      fs.rmSync(tmp, { recursive: true, force: true });
      sheets.push(`- \`${sheet}\`: ${page.length} frames, left to right and top to bottom, in the order of the table below (${section} ${p * 24 + 1}–${p * 24 + page.length}).`);
    }
  }

  const sec = (f: number) => `${(f / fps).toFixed(2)} s`;
  const row = (s: Shot) => `| ${sec(s.frame)} | ${s.frame} | ${s.label} | ${scenes ? lineAt(scenes, s.frame / fps, voice).replace(/\|/g, '/') : ''} | frames/${path.basename(fileOf(s.frame))} |`;
  const table = (section: Section) => ['| Time | Frame | What | Narration on air | File |', '|---|---|---|---|---|', ...shots.filter((s) => s.section === section).map(row)].join('\n');

  const joins = [...new Set(shots.filter((s) => s.cut).map((s) => s.cut!))].map((c) => {
    const trio = shots.filter((s) => s.cut === c && s.section === 'cuts');
    const before = trio.find((s) => s.label.startsWith('before'));
    const mid = trio.find((s) => s.label.startsWith('mid'));
    const after = trio.find((s) => s.label.startsWith('after'));
    if (!before || !after) return '';
    const vertical = format === 'vertical';
    const alike = similarity(fileOf(before.frame), fileOf(after.frame), vertical);
    const same = alike >= SAME_PICTURE;
    const dip = mid ? detail(fileOf(mid.frame), vertical) < DIP_RATIO * Math.min(detail(fileOf(before.frame), vertical), detail(fileOf(after.frame), vertical)) : undefined;
    const verdict = same && dip ? '**SAME PICTURE WITH A DIP: carry it on (blend), no cut**' : same ? 'same picture, carried on' : dip === false ? 'new picture without a dip: check it reads as a change' : 'new picture';
    const files = [before, mid, after].filter(Boolean).map((s) => path.basename(fileOf(s!.frame))).join(', ');
    return `- cut ${c} at ${sec(before.frame + 1)}: similarity ${alike.toFixed(2)}, ${dip === undefined ? 'transition not sampled' : dip ? 'dips to black' : 'no dip'}: ${verdict} (${files})`;
  });

  const cast = images(at('public'));
  const md = [
    `# Review frames: ${path.relative(at(), video) || video}`,
    '',
    `${info.width}x${info.height}, ${info.seconds.toFixed(2)} s @ ${fps} fps, ${scenes ? `timeline: ${scenes.length} scenes` : `scene changes detected by ffmpeg (${why})`}.`,
    `Script: ${fs.existsSync(at('script.md')) ? at('script.md') : '(no script.md)'}. Timeline: ${at('src', 'timeline.ts')}.`,
    '',
    '## Contact sheets (overview only: judge every item on the full-size frames)',
    '',
    ...sheets,
    '',
    '## Scene changes',
    '',
    ...(joins.length ? joins : ['- none']),
    '',
    '## Opening (frame 0 and 0–8 s)',
    '',
    table('opening'),
    '',
    '## Scene changes, frame by frame',
    '',
    table('cuts'),
    '',
    '## Narration lines (before / mid / end)',
    '',
    scenes ? table('lines') : '_No timeline for this video: no line frames._',
    '',
    `## Cast: images in public/ (${cast.length})`,
    '',
    ...(cast.length ? cast.map((c) => `- public/${c}`) : ['- none']),
    '',
  ].join('\n');
  fs.writeFileSync(path.join(dir, 'index.md'), md);
  console.log(`${dir}: ${new Set(shots.map((s) => s.frame)).size} frames, ${sheets.length} sheet(s), index.md`);
}
