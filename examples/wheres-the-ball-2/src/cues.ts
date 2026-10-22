// Word cues: the scene second at which a given voiced word starts, so an animation step lands on
// the word that names it ("82%", "coin flip"). Read from the TTS word timestamps when they exist;
// before TTS (or for a word not found) estimated from where the word sits in the line's text.
// No Remotion imports, so the timeline stays loadable by the Node scripts.
import { WORDS } from './audio.generated.ts';
import { spokenText, type Scene } from './types.ts';

const norm = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

/**
 * Scene second where the first voiced word starting with `match` (case and punctuation ignored)
 * begins, in line `lineIndex` of `scene`. `match` is compared against the spoken form of the line.
 */
export function wordAt(scene: Scene, lineIndex: number, match: string): number {
  const line = scene.lines[lineIndex];
  if (!line) return scene.beats.at(-1) ?? 0;
  const want = norm(match);
  const words = WORDS[line.voice]?.[line.key];
  if (words) {
    const hit = words.find((w) => norm(w[0]).startsWith(want));
    if (hit) return +(line.start + hit[1]).toFixed(3);
  }
  // Estimate: the share of the spoken text before the word, over the line length.
  const text = spokenText(line, line.voice);
  const tokens = text.split(/\s+/);
  let chars = 0;
  for (const tok of tokens) {
    if (norm(tok).startsWith(want)) return +(line.start + (chars / Math.max(1, text.length)) * line.dur).toFixed(3);
    chars += tok.length + 1;
  }
  return line.start;
}

/** Sets `props.cues` on an anim scene (scene seconds, by name) and returns the scene. */
export function withCues(scene: Scene, cues: Record<string, number>): Scene {
  if (scene.anim) scene.anim.props = { ...scene.anim.props, cues };
  return scene;
}
