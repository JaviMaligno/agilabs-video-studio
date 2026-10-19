// One Grey Level Out of 255 — explainer video (EN). Narration from the approved script v1.2 (script.md).
// The study's white stimulus card fades along a continuous contrast gradient (the study's own
// formula, grey = round(255 − 255·ratio)) while a row of readers types, smudges or goes blank.
// Stimuli rendered with the experiment's code (scripts/extract-stimuli.py → public/stim/).
import type { Cuts } from './types.ts';
import { anim, outro, say, videos } from './narrate.ts';

const build = (): Cuts => ({
  main: [
    // 1 · Hook: a contrast-gradient wipe dissolves the sentence into the blank 254-on-255 card.
    anim(
      'hook',
      'FadeCard',
      { mode: 'hook', play: [0, 1] },
      [say(0.15, 'This box has a sentence in it.', ''), say(0, "I can't see it.", ''), say(0, 'Two machines read it.', '')],
      { min: 6.0 },
    ),
    // 2 · The wipe runs backwards; the reader row assembles.
    anim('roster', 'FadeCard', { mode: 'roster', play: [1, 2] }, [say(0.55, 'Six vision models, two OCR engines, and me.', '')]),
    // 3-6 · One continuous fade down the ladder.
    anim(
      'ladder',
      'FadeCard',
      { mode: 'ladder', play: [2, 3] },
      [say(0.1, 'My eyes gave up when the ink was about 3% as dark as black.', '', { en: 'My eyes gave up when the ink was about three percent as dark as black.' })],
    ),
    anim('machines', 'FadeCard', { mode: 'machines', play: [3, 4] }, [say(0.1, 'Most models kept reading six to seven times fainter.', '')]),
    anim(
      'floor',
      'FadeCard',
      { mode: 'floor', play: [4, 5] },
      [say(0.1, 'Grey 254 on white 255.', '', { en: 'Grey two fifty-four on white two fifty-five.' })],
      { min: 2.9 },
    ),
    anim(
      'read',
      'FadeCard',
      { mode: 'read', play: [5, 6] },
      [say(0.1, 'Tesseract and gpt-4o read every letter.', '', { en: 'Tesseract and GPT-4o read every letter.' })],
    ),
    // 7-8 · The lens: pixels as numbers, a threshold flips every 254 to black.
    anim(
      'lens',
      'ThresholdLens',
      {},
      [say(0.2, "Tesseract isn't seeing faint text.", ''), say(0, 'It turns anything darker than its neighbours black.', '')],
      { min: 6.65 },
    ),
    // 9-10 · The ghost writer: prediction completes the meaningful line.
    anim(
      'ghost',
      'GhostWriter',
      {},
      [
        say(0.2, "On small text, part of their edge isn't eyesight. It's prediction.", ''),
        say(0, 'Meaningful text: about 5.5 pixels. Nonsense: about 8.', '', {
          en: 'Meaningful text: about five and a half pixels. Nonsense: about eight.',
        }),
      ],
    ),
    // 11-14 · The hidden instruction.
    anim('hide', 'HiddenInstruction', { mode: 'write', play: [10, 11] }, [say(0.15, 'Then I hid a second, conflicting instruction.', '')], { min: 3.6 }),
    anim('stego', 'HiddenInstruction', { mode: 'stego', play: [11, 12] }, [say(0.15, 'Hidden as steganography, no model obeyed it.', '')], { min: 3.6 }),
    anim(
      'faint',
      'HiddenInstruction',
      { mode: 'faint', play: [12, 13] },
      [say(0.2, 'At 1% contrast, about a fifth of trials obeyed it.', '', { en: 'At one percent contrast, about a fifth of trials obeyed it.' })],
      { min: 4.2 },
    ),
    anim(
      'qwen',
      'HiddenInstruction',
      { mode: 'qwen', play: [13, 14] },
      [say(0.1, 'Qwen2.5-VL obeyed two-thirds of the time.', '', { en: 'Qwen obeyed two-thirds of the time.' })],
      { min: 3.2 },
    ),
    // 15-16 · Close: the 1% line breathes from invisible to readable and back.
    anim('quote1', 'ContrastQuote', { mode: 'steg', play: [14, 15] }, [say(0.1, "Don't worry about bit-plane steganography.", '')], { min: 3.3 }),
    anim('quote2', 'ContrastQuote', { mode: 'contrast', play: [15, 16] }, [say(0.15, 'Worry about contrast.', '')], { min: 3.0 }),
    outro('outro', [say(0.15, 'More at javieraguilar.ai', '', { en: 'More at javier aguilar dot A I.' })]),
  ],
});

export const VIDEOS = videos(build);
/** The English main cut. */
export const TIMELINE = VIDEOS.en.main;
