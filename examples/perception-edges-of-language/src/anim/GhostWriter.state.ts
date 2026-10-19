// Pure state of the GhostWriter scene: a meaningful line and a nonsense line of matched width
// shrink together; over the meaningful one, accent "ghost" letters complete the words the pixels
// no longer support (read down to ≈5.5 px); over the nonsense one they flicker and give up
// (≈8 px). A Tesseract chip runs the same two lines with no ghosts: both stop together.
// The 5.5 / 8 px marks are the article's; the shrink and the ghosts are illustrative.
import { beatAt, clamp01, easeOutCubic, fit, progress, sceneTime } from './steps.ts';
import { NONSENSE, VISIBLE, logLerp } from './perception.ts';
import { charNoise } from './FadeCard.state.ts';

export type GhostWriterProps = Record<string, never>;

export const SIZE_MAX = 32;
export const SIZE_MIN = 4.5;
export const MEANING_STOP = 5.5;
export const NONSENSE_STOP = 8;
/** Size at which the illustrative OCR control stops on both lines at once. */
export const OCR_STOP = 9;
/** Below this the pixels alone no longer carry the letters (ghosts take over). */
export const GHOST_FROM = 12;

const ALPHA = 'abcdefghijklmnopqrstuvwxyz';

/** Ghost text over the nonsense line: random letters that change every few frames. */
export const flicker = (text: string, t: number, keep: number): string => {
  const tick = Math.floor(t * 8);
  return text
    .split('')
    .map((ch, i) => (ch === ' ' ? ' ' : charNoise(i, tick) < keep ? ch : ALPHA[Math.floor(charNoise(i, tick + 99) * 26)]))
    .join('');
};

export function frameState(_p: GhostWriterProps, time: number, beats: number[], dur: number) {
  const t = sceneTime(time, dur);
  const b0 = beatAt(beats, 0);
  const b1 = beats.length > 1 ? beatAt(beats, 1) : b0 + 4;
  const P = (start: number, len: number) => progress(t, fit(start, len, dur), len);

  // Line 1: 32 → 8.6 px; line 2: 8.6 → 5 px, reaching 5.5 around "5.5 pixels".
  const s1 = easeOutCubic(P(b0 + 0.3, Math.max(0.8, b1 - b0 - 0.4)));
  const s2 = P(b1 + 0.1, 1.9);
  const size = s2 > 0 ? logLerp(8.6, 5, s2) : logLerp(SIZE_MAX, 8.6, s1);

  const blob = clamp01((GHOST_FROM - size) / (GHOST_FROM - 6));
  const meaningRead = size >= MEANING_STOP ? 1 : 0;
  const nonsenseRead = size >= NONSENSE_STOP ? 1 : 0;
  const ghost = clamp01((GHOST_FROM - size) / 2.5) * (meaningRead ? 1 : clamp01(1 - (MEANING_STOP - size) / 0.3));
  const ghostChars = Math.round(VISIBLE.length * clamp01((GHOST_FROM - size) / 3));
  const nKeep = clamp01((size - NONSENSE_STOP) / (GHOST_FROM - NONSENSE_STOP));
  const nGhost = nonsenseRead ? clamp01((GHOST_FROM - size) / 2.5) : 0;

  return {
    size,
    /** Display scale of the text relative to 32 px. */
    scale: size / SIZE_MAX,
    blur: blob * 5,
    labels: easeOutCubic(P(b0, 0.5)),
    meaning: { read: meaningRead, ghost, ghostText: VISIBLE.slice(0, ghostChars) },
    nonsense: { read: nonsenseRead, ghost: nGhost, ghostText: flicker(NONSENSE, t, nKeep) },
    ocr: { appear: easeOutCubic(P(b0 + 1.2, 0.5)), on: size >= OCR_STOP ? 1 : 0 },
    // The marks pop on the words that name them (line 2: "five" ~b1+1.5, "Nonsense" ~b1+3.0,
    // "eight" ~b1+4.1 in the current voice), the gap bracket lands as "eight" is said.
    mark55: easeOutCubic(P(b1 + 1.4, 0.45)),
    mark8: easeOutCubic(P(b1 + 2.95, 0.45)),
    bracket: easeOutCubic(P(b1 + 3.65, 0.5)),
  };
}
