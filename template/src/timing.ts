import type { Scene } from './types.ts';

export const FPS = 30;
/** Frames two consecutive scenes overlap while one fades into the next. */
export const SCENE_TRANSITION = 18;

/** Scene second where its hand-over to the next scene begins (held captions end there). */
export const handOverAt = (scene: Scene): number => (sceneFrames(scene) - SCENE_TRANSITION) / FPS;

/** Length of a scene in frames: its minimum length, or long enough for its last line. */
export const sceneFrames = (scene: Scene): number => {
  const last = scene.lines.at(-1);
  const seconds = Math.max(scene.minSeconds ?? 0, last ? last.start + last.dur : 0);
  return Math.max(1, Math.round(seconds * FPS));
};

/** Start frame of each scene in the video and the total length, with transitions overlapping. */
export const sceneStarts = (scenes: Scene[]): { starts: number[]; total: number } => {
  const starts: number[] = [];
  let at = 0;
  scenes.forEach((scene, i) => {
    starts.push(at);
    at += sceneFrames(scene) - (i < scenes.length - 1 ? SCENE_TRANSITION : 0);
  });
  return { starts, total: at };
};

/** One reading of a clock and how much of it shows (the weights of a frame sum to 1). */
export type ClockLayer = { seconds: number; weight: number };

/**
 * The scene clock at video frame `frame`: seconds since the current scene started, and across each
 * cross-fade both scenes' clocks, the outgoing one fading out as the incoming one fades in. It
 * depends only on scene lengths, never on where a scene falls in the video, so what is drawn with
 * it is the same wherever the scene lands (chunked renders cache chunks by what they show).
 */
export const sceneClock = (frame: number, starts: number[]): ClockLayer[] => {
  let k = 0;
  while (k + 1 < starts.length && starts[k + 1] <= frame) k++;
  const local = frame - starts[k];
  if (k === 0 || local >= SCENE_TRANSITION) return [{ seconds: local / FPS, weight: 1 }];
  const p = local / SCENE_TRANSITION;
  return [
    { seconds: (frame - starts[k - 1]) / FPS, weight: 1 - p },
    { seconds: local / FPS, weight: p },
  ];
};

/** Every narration line with its start in video seconds (scene start + line start). */
export const linesInVideo = (scenes: Scene[]): { scene: Scene; line: Scene['lines'][number]; at: number }[] => {
  const { starts } = sceneStarts(scenes);
  return scenes.flatMap((scene, i) => scene.lines.map((line) => ({ scene, line, at: starts[i] / FPS + line.start })));
};

/**
 * Chapter cards ("2 · The desk"): an anim scene with `chapter` opens with a card over its first
 * CHAPTER_CARD seconds, fully on from the first frame and fading out over the last CHAPTER_FADE.
 * Its lines are pushed back by CHAPTER_LEAD, so the voice starts on the card and the animation's
 * first beat lands as the card lifts.
 */
export const CHAPTER_CARD = 2;
export const CHAPTER_FADE = 0.4;
export const CHAPTER_LEAD = 1;

/** Opacity of the chapter card (and the scrim behind it) at scene second `t`. */
export const chapterCardOpacity = (t: number): number => {
  if (!Number.isFinite(t) || t >= CHAPTER_CARD) return 0;
  if (t <= CHAPTER_CARD - CHAPTER_FADE) return 1;
  return (CHAPTER_CARD - t) / CHAPTER_FADE;
};

/** Chapter number of each scene that shows a card (anim scenes with `chapter`), 1-based in order. */
export const chapterNumbers = (scenes: Scene[]): (number | undefined)[] => {
  let n = 0;
  return scenes.map((s) => (s.kind === 'anim' && s.chapter !== undefined ? ++n : undefined));
};
