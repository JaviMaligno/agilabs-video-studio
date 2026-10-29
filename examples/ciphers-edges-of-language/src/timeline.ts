// Teaching a Model a Language You Just Invented — article video (EN). Narration from the approved
// script v1.2 (script.md). The jailbreak section (retracted by the article's 1 August 2026
// correction) is out of scope: nothing from it is spoken or shown.
// One message card ("name the capital of france", a real task of the experiment) carries the
// whole video; its cipher strings come from the repo's own code (src/data/ciphers.json).
import type { Cuts } from './types.ts';
import { anim, outro, say, videos } from './narrate.ts';

const build = (): Cuts => ({
  main: [
    anim(
      'hook',
      'CipherCard',
      // hitAt: the masked card shatters on the wall as "refuse to play" is spoken.
      { mode: 'scramble', hitAt: 2.0 },
      [say(0.1, 'Two of my five models refuse to play before any decoding happens.', '')],
    ),
    anim(
      'ladder',
      'CipherCard',
      { mode: 'ladder', cameos: [{ pose: 'laptop', at: [0, 'hid'] }] },
      [
        say(0.15, 'I hid simple, checkable tasks in ten ciphers, from ROT13 to a shuffled alphabet.', '', {
          en: 'I hid simple, checkable tasks in ten ciphers, from rot thirteen to a shuffled alphabet.',
        }, { emotion: 'contemplative' }),
      ],
    ),
    anim(
      'gate',
      'RefusalGate',
      { cameos: [{ pose: 'sceptical', at: [3, 'jailbreak'] }] },
      [
        say(0.15, 'Claude Opus and Sonnet refuse about 87% of encoded turns.', '', {
          en: 'Claude Opus and Sonnet refuse about eighty-seven percent of encoded turns.',
        }, { emotion: 'amazed' }),
        say(0, 'In plain English, they answer instantly.', ''),
        say(0, 'The more the text looks like noise, the more they refuse.', ''),
        say(0, "Azure's filter flags GPT-5's ciphered prompts as a jailbreak before the model sees them.", '', {
          en: "Azure's filter flags G P T five's ciphered prompts as a jailbreak before the model sees them.",
        }, { emotion: 'skeptical' }),
      ],
      // Holds the last cue long enough to read before the hand-over.
      { min: 19.0 },
    ),
    anim(
      'break',
      'CipherCard',
      { mode: 'break', cameos: [{ pose: 'amazed', at: [0, 'cracks'] }] },
      [
        say(0.15, 'Past the filter, GPT-5 cracks most ciphers on turn one.', '', { en: 'Past the filter, G P T five cracks most ciphers on turn one.' }, { emotion: 'surprised' }),
        say(0, 'The keyed ones, which it has to infer, take a median of 4–5 turns.', '', {
          en: 'The keyed ones, which it has to infer, take a median of four to five turns.',
        }),
      ],
      { min: 11.0 },
    ),
    anim(
      'rosetta',
      'CipherCard',
      { mode: 'rosetta' },
      [
        say(0.15, 'A few plaintext–code pairs, a Rosetta stone, lift comprehension from 61% to 83%.', '', {
          en: 'A few plaintext code pairs, a Rosetta stone, lift comprehension from sixty-one percent to eighty-three percent.',
        }),
      ],
    ),
    anim(
      'switches',
      'SwitchPanel',
      {},
      [
        // TTS-only commas: a breath after "a code" keeps the first cue readable (< 17 chars/s).
        say(0.15, 'Understanding a code and answering in it are separate switches.', '', {
          en: 'Understanding a code, and answering in it, are separate switches.',
        }, { emotion: 'confident', speed: 1.05 }),
        say(0, "For a model, understanding isn't even the first switch to fire.", ''),
      ],
    ),
    // The voice starts as the card pops in; the caption is held at least 1.5 s.
    outro('outro', [say(0.15, 'More at javieraguilar.ai', '', { en: 'More at javier aguilar dot A I.' })], 2.4),
  ],
});

export const VIDEOS = videos(build);
/** The English main cut. */
export const TIMELINE = VIDEOS.en.main;
