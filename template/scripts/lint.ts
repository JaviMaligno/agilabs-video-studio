// Pacing checks to run before paying for TTS or a render: `npm run lint`.
// Reports the length against SETTINGS.targetSeconds, caption cues that are too short or too fast
// to read, and anim scenes whose component is not registered. Exit code 1 when anything is found.
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { heldCuesOf } from '../src/captions.ts';
import { FPS, handOverAt, sceneFrames, sceneStarts } from '../src/timing.ts';
import { tx, type Lang, type Scene, type Text } from '../src/types.ts';

/** Shortest time a cue may stay on screen, in seconds. */
export const MIN_CUE_SECONDS = 0.8;
/** Fastest comfortable reading speed for captions, in characters per second. */
export const MAX_CPS = 17;
/** Allowed deviation from the target length. */
export const LENGTH_TOLERANCE = 0.2;
/** Characters per caption row in the vertical format (same as the Captions component). */
const ROW_CHARS = 32;
/** Reading speed for text drawn on the stage (labels, quotes, statements), in words per second. */
export const ON_SCREEN_WPS = 3.5;
/** Time to take in a stage before reading it, in seconds. */
export const ON_SCREEN_DWELL = 1;
/** Prop keys that hold identifiers or settings rather than text a viewer reads. */
const NOT_TEXT = new Set(['id', 'from', 'to', 'pose', 'side', 'layout', 'name', 'src', 'image', 'color', 'emphasis', 'unit', 'prefix', 'suffix']);

/** Words of on-screen text in an anim scene's props: every string and Label, in `lang`. */
export const onScreenWords = (props: unknown, lang: Lang): number => {
  const count = (s: string) => s.split(/\s+/).filter(Boolean).length;
  const walk = (v: unknown, key = ''): number => {
    if (NOT_TEXT.has(key)) return 0;
    if (typeof v === 'string') return count(v);
    if (Array.isArray(v)) return v.reduce((n, x) => n + walk(x), 0);
    if (v && typeof v === 'object') {
      const o = v as Record<string, unknown>;
      if (typeof o.en === 'string' && Object.keys(o).every((k) => k === 'en' || k === 'es')) return count(tx(o as Text, lang));
      return Object.entries(o).reduce((n, [k, x]) => n + walk(x, k), 0);
    }
    return 0;
  };
  return walk(props);
};

/**
 * Names registered in src/anim/index.ts, read from its source: the registry imports .tsx
 * components, which plain Node cannot load. Keep `ANIMS` an object literal of names.
 */
export const registeredAnims = (file = fileURLToPath(new URL('../src/anim/index.ts', import.meta.url))): string[] => {
  const src = fs.readFileSync(file, 'utf8').replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
  const body = src.match(/ANIMS\b[^=]*=\s*\{([\s\S]*?)\}\s*;?/)?.[1] ?? '';
  return [...body.matchAll(/(?:^|,)\s*['"]?([\w-]+)['"]?\s*(?=[:,]|$)/g)].map((m) => m[1]);
};

export type LintOptions = { subs?: Lang; known?: Iterable<string> };

export function lintTimeline(scenes: Scene[], target: number, opts: LintOptions = {}): string[] {
  const issues: string[] = [];
  const subs = opts.subs ?? 'en';
  const known = new Set(opts.known ?? registeredAnims());

  const seconds = sceneStarts(scenes).total / FPS;
  if (Math.abs(seconds - target) > target * LENGTH_TOLERANCE) {
    issues.push(`length ${seconds.toFixed(1)} s is outside target ${target} s ±${LENGTH_TOLERANCE * 100}% (${(target * (1 - LENGTH_TOLERANCE)).toFixed(0)}–${(target * (1 + LENGTH_TOLERANCE)).toFixed(0)} s)`);
  }

  for (const scene of scenes) {
    if (scene.kind === 'anim') {
      const name = scene.anim?.name;
      if (!name || !known.has(name)) issues.push(`scene "${scene.id}": animation "${name ?? '(none)'}" is not registered in src/anim/index.ts`);
      const n = onScreenWords(scene.anim?.props, subs);
      const need = n / ON_SCREEN_WPS + ON_SCREEN_DWELL;
      const shown = sceneFrames(scene) / FPS;
      if (n && shown < need) issues.push(`scene "${scene.id}": ${n} words on screen need ~${need.toFixed(1)} s to read, the scene lasts ${shown.toFixed(1)} s (raise its min or cut text)`);
    }
    for (const [i, line] of scene.lines.entries()) {
      // The same cues as on screen: the last one of a line held into the silence after it.
      for (const cue of heldCuesOf(scene.lines, i, subs, ROW_CHARS, handOverAt(scene))) {
        const shown = cue.end - cue.start;
        const cps = cue.text.length / Math.max(shown, 0.01);
        if (shown < MIN_CUE_SECONDS) issues.push(`${line.key}: cue on screen ${shown.toFixed(2)} s (< ${MIN_CUE_SECONDS} s): "${cue.text}"`);
        if (cps > MAX_CPS) issues.push(`${line.key}: cue reads at ${cps.toFixed(1)} chars/s (> ${MAX_CPS}): "${cue.text}"`);
      }
    }
  }
  return issues;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { VIDEOS } = await import('../src/timeline.ts');
  const { SETTINGS } = await import('../src/settings.ts');
  let count = 0;
  for (const voice of SETTINGS.voices) {
    const scenes = VIDEOS[voice]?.main ?? [];
    const subs = SETTINGS.subtitles.includes(voice) ? voice : SETTINGS.subtitles[0] ?? voice;
    for (const issue of lintTimeline(scenes, SETTINGS.targetSeconds, { subs })) {
      console.log(`[${voice}] ${issue}`);
      count++;
    }
  }
  console.log(count ? `${count} issue(s)` : 'lint: clean');
  process.exitCode = count ? 1 : 0;
}
