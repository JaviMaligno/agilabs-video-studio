// YouTube chapters from the timeline: one entry per chapter scene (anim scenes with `chapter`),
// at the frame its scene starts in the render, plus 0:00 for the opening. Pure, used by deliver.
import { FPS, sceneStarts } from './timing.ts';
import { tx, type Lang, type Scene } from './types.ts';

/** YouTube shows chapters only with at least this many, each at least MIN_CHAPTER_SECONDS long. */
export const MIN_CHAPTERS = 3;
export const MIN_CHAPTER_SECONDS = 10;

/** Seconds as YouTube writes a timestamp: m:ss, or h:mm:ss from an hour. */
export const stamp = (seconds: number): string => {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
};

export type Chapter = { at: number; label: string; scene: string };

/**
 * The chapter list for the video description: `text` is one "0:00 Intro" line per chapter.
 * `warnings` says why YouTube would not show them (fewer than 3, or one shorter than 10 s).
 */
export function youtubeChapters(scenes: Scene[], lang: Lang): { chapters: Chapter[]; text: string; warnings: string[] } {
  const { starts, total } = sceneStarts(scenes);
  const chapters: Chapter[] = [];
  scenes.forEach((s, i) => {
    if (i === 0) chapters.push({ at: 0, label: s.chapter !== undefined ? tx(s.chapter, lang) : 'Intro', scene: s.id });
    else if (s.kind === 'anim' && s.chapter !== undefined) chapters.push({ at: starts[i] / FPS, label: tx(s.chapter, lang), scene: s.id });
  });
  const warnings: string[] = [];
  if (chapters.length < MIN_CHAPTERS) warnings.push(`only ${chapters.length} chapter(s): YouTube needs at least ${MIN_CHAPTERS} to show them`);
  chapters.forEach((c, i) => {
    const end = i + 1 < chapters.length ? chapters[i + 1].at : total / FPS;
    // Compare whole timestamps, as YouTube reads them from the description.
    if (Math.floor(end) - Math.floor(c.at) < MIN_CHAPTER_SECONDS) {
      warnings.push(`chapter "${c.label}" at ${stamp(c.at)} lasts ${(end - c.at).toFixed(1)} s: YouTube needs at least ${MIN_CHAPTER_SECONDS} s`);
    }
  });
  return { chapters, text: chapters.map((c) => `${stamp(c.at)} ${c.label}`).join('\n') + '\n', warnings };
}
