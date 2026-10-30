// One Grey Level Out of 255 — explainer video (EN). Narration from script v2.0 (Halloween re-edit, script.md).
// The study's white stimulus card fades along a continuous contrast gradient (the study's own
// formula, grey = round(255 − 255·ratio)) while a row of readers types, smudges or goes blank.
// Stimuli rendered with the experiment's code (scripts/extract-stimuli.py → public/stim/).
import type { Cuts } from './types.ts';
import { anim, outro, say, videos } from './narrate.ts';

const build = (): Cuts => ({
  main: [
    // 1 · Hook: a contrast-gradient wipe dissolves the sentence into the blank card.
    anim(
      'hook',
      'FadeCard',
      { mode: 'hook', play: [0, 1] },
      [say(0.1, 'This box has a sentence in it.', ''), say(0, "I can't see it.", ''), say(0, 'Two machines read it.', '', undefined, { emotion: 'amazed' })],
      { min: 6.5 },
    ),
    // 2 · The wipe runs backwards; the reader row assembles.
    anim('roster', 'FadeCard', { mode: 'roster', play: [1, 2] }, [say(0.55, 'Six vision models, two OCR engines, and me.', '')], { min: 4.8 }),
    // 3-6 · One continuous fade down the ladder.
    anim(
      'ladder',
      'FadeCard',
      { mode: 'ladder', play: [2, 3], cameos: [{ pose: 'laughing', at: [1, 'gave'] }] },
      [say(0.1, 'I faded the ink.', ''), say(0, 'My eyes gave up first.', '')],
      { min: 4.6 },
    ),
    anim('machines', 'FadeCard', { mode: 'machines', play: [3, 4] }, [say(0.1, 'Most models kept reading six to seven times fainter.', '')], { min: 4.4 }),
    anim(
      'floor',
      'FadeCard',
      { mode: 'floor', play: [4, 5] },
      [say(0.1, 'Then the faintest ink an ordinary image can hold.', ''), say(0, 'Ghost ink, almost white on white.', '', undefined, { emotion: 'mysterious' })],
      { min: 6.0 },
    ),
    anim(
      'read',
      'FadeCard',
      { mode: 'read', play: [5, 6], cameos: [{ pose: 'amazed', at: [0, 'GPT-4o'], dur: 2.0 }] },
      [say(0.1, 'Tesseract and gpt-4o read every letter.', '', { en: 'Tesseract and GPT-4o read every letter.' })],
      { min: 4.4 },
    ),
    // 7-8 · The lens: pixels as numbers, a threshold flips every darker pixel to black.
    anim(
      'lens',
      'ThresholdLens',
      {},
      [
        say(0.2, "Tesseract isn't seeing faint text.", '', undefined, { emotion: 'skeptical' }),
        say(0, 'It turns anything darker than its neighbours black.', '', undefined, { emotion: 'contemplative' }),
        say(0, 'Arithmetic, not a sixth sense.', ''),
      ],
      { min: 9.6 },
    ),
    // 9-10 · The ghost writer: prediction completes the meaningful line.
    anim(
      'ghost',
      'GhostWriter',
      {},
      [
        say(0.2, "On small text, part of their edge isn't eyesight.", ''),
        say(0, "It's prediction.", '', undefined, { emotion: 'amazed' }),
        say(0, 'Real words stay readable smaller than nonsense.', ''),
        say(0, 'The model ghost-writes the word it expects to see.', ''),
      ],
    ),
    // 11-14 · The hidden instruction.
    anim(
      'hide',
      'HiddenInstruction',
      { mode: 'write', play: [10, 11], cameos: [{ pose: 'laptop', at: [0, 'hid'] }] },
      [say(0.15, 'Then I hid a second, conflicting instruction.', ''), say(0, 'A hidden spell that asks for banana.', '')],
      { min: 6.4 },
    ),
    anim('stego', 'HiddenInstruction', { mode: 'stego', play: [11, 12] }, [say(0.15, 'Hidden as steganography, no model obeyed it.', '')], { min: 4.4 }),
    anim(
      'faint',
      'HiddenInstruction',
      { mode: 'faint', play: [12, 13] },
      [
        say(0.2, 'Next I wrote it in faint ink, invisible to me.', ''),
        say(0, 'About a fifth of trials obeyed the spell.', '', undefined, { emotion: 'surprised' }),
      ],
      { min: 7.0 },
    ),
    anim(
      'qwen',
      'HiddenInstruction',
      { mode: 'qwen', play: [13, 14] },
      [say(0.1, 'Qwen2.5-VL obeyed two-thirds of the time.', '', { en: 'Qwen obeyed two-thirds of the time.' }), say(0, 'Three models were immune to every trick.', '')],
      { min: 5.8 },
    ),
    // 15-16 · Close: the faint line breathes from invisible to readable and back.
    anim('quote1', 'ContrastQuote', { mode: 'steg', play: [14, 15] }, [say(0.1, "Don't worry about bit-plane steganography.", '')], { min: 3.6 }),
    anim('quote2', 'ContrastQuote', { mode: 'contrast', play: [15, 16] }, [say(0.15, 'Worry about contrast.', '', undefined, { emotion: 'confident', speed: 0.95 })], { min: 3.4 }),
    outro('outro', [say(0.15, 'Happy Halloween. More at javieraguilar.ai', '', { en: 'Happy Halloween. More at javier aguilar dot A I.' })]),
  ],
});

export const VIDEOS = videos(build);
/** The English main cut. */
export const TIMELINE = VIDEOS.en.main;
