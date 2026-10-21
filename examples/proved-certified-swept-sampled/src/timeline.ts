// Proved, Certified, Swept, Sampled — article video (EN). Narration from the approved script v1.0
// (script.md); every number on screen and spoken is traced in factcheck.md. One region drawn four
// times (CoverageTiles): same tick, different coverage. The certificate story zooms into the
// box-certified tile; ToleranceBand shows the mechanism (an ε band at an exact tangency);
// LabelRange the claim marked proved for only part of its range. Scenes on one component blend.
import type { Cuts } from './types.ts';
import { anim, outro, say, videos } from './narrate.ts';
import { WORDS } from './audio.generated.ts';

/** Spoken start of each word of a line, in scene seconds (the line starts at `at`). */
const wordStarts = (key: string, at: number): number[] | undefined => WORDS.en?.[key]?.map((w) => at + w[1]);

const build = (): Cuts => ({
  main: [
    // Cold open: the hook is drawn by the scene itself over the four identical cards.
    anim('hook', 'CoverageTiles', { mode: 'same', titleLine: true }, [say(0.15, 'These four claims print the same way.', '')], { min: 3.3 }),
    anim(
      'lift',
      'CoverageTiles',
      { mode: 'lift', blend: true, cue: { silent: 5.81 + 1.47 } },
      [
        say(0.15, 'One: a written proof.', ''),
        say(0, 'One: exact arithmetic, box by box.', ''),
        say(0, 'One: a grid, silent in between.', ''),
        say(0, 'And one: ten million samples, none broke it.', ''),
      ],
      // The cards drop back on at the start of the next scene.
    ),
    // Stamps land one per beat from "label" (word timestamps); the line under them is read after.
    anim('stamp', 'CoverageTiles', { mode: 'stamp', blend: true, cue: { stamp: 0.05 + 3.08 } }, [say(0.05, 'So in my last preprint, every claim carries a label.', '')], { min: 5.3 }),
    anim('focus', 'CoverageTiles', { mode: 'focus', blend: true, cue: { tally: 0.2 + 3.16 } }, [say(0.2, 'What convinced me: a certificate that lied to me three times.', '')]),
    anim('boxes', 'CoverageTiles', { mode: 'boxes', blend: true, cue: { wave: 0.05 + 1.0 } }, [say(0.05, 'It had to check one lemma over a whole region.', '')]),
    anim('reviewer', 'CoverageTiles', { mode: 'reviewer', blend: true, cue: { send: 0.05 + 1.0, break: 0.05 + 2.46 } }, [say(0.05, 'A separate model got only the statement, told to break it.', '')]),
    anim('refute', 'CoverageTiles', { mode: 'refute', blend: true, cue: { refute: 0.05 + 0.84, chips: 0.05 + 1.97 } }, [say(0.05, 'Version one fell at once: part of it was only sampled.', '')]),
    anim(
      'v2',
      'CoverageTiles',
      { mode: 'v2', blend: true, cue: { eps: 0.05 + 3.4 } },
      [say(0.05, 'Version two was exact, except for one tolerance: 1e-12.', '', { en: 'Version two was exact, except for one tolerance: ten to the minus twelve.' })],
    ),
    anim(
      'mechanism',
      'ToleranceBand',
      // touch on "touch", φ on "point"; the band flips the near-φ boxes on "changes the answer".
      { mode: 'mechanism', cue: { phi: 0.15 + 1.24, touch: 0.15 + 2.52 } },
      [
        say(0.15, 'The lemma turns on one point, where the rings touch exactly.', ''),
        say(0, 'There, the margin is zero.', ''),
        say(0, "At zero, a tolerance isn't a small error. It changes the answer.", ''),
        say(0, 'Wrong only where the question is delicate, and still green.', ''),
      ],
    ),
    anim('verdict', 'ToleranceBand', { mode: 'verdict', blend: true, cue: { stamp: 0.05 + 3.2 } }, [say(0.05, 'The lemma is true. But that certificate was not evidence.', '')], { min: 5.7 }),
    // Footnote held to the end of the scene.
    anim('versions', 'VersionLadder', { cue: { v4: 0.1 + 1.75 } }, [say(0.1, "Three refutations later, version four is the one I'd sign.", '')], { min: 6.3 }),
    anim(
      'range',
      'LabelRange',
      { mode: 'range', cue: { stamp: 0.1 + 0.25, drop: 0.1 + 2.0 } },
      [say(0.1, "The same reviewer caught a claim I'd marked proved.", ''), say(0, 'It was only proved for part of its range.', '')],
    ),
    // Quote and close write their sentence on screen in sync with the voice: no duplicate caption.
    anim('quote', 'LabelRange', { mode: 'quote', blend: true, titleLine: true, words: wordStarts('quote-01', 0.05) }, [say(0.05, "A wrong label is worse than a weak one, because it's trusted.", '')], { min: 4.4 }),
    anim(
      'software',
      'CoverageTiles',
      { mode: 'software', cue: { green: 0.1 + 4.44 } },
      [say(0.1, 'Tests, types, a careful read: CI paints them all the same green.', '', { en: 'Tests, types, a careful read: C I paints them all the same green.' })],
    ),
    anim('close', 'CoverageTiles', { mode: 'close', blend: true, titleLine: true }, [say(0.05, 'Label the claim, not the system.', '')], { min: 3.2 }),
    outro('outro', [say(0.15, 'More at javieraguilar.ai', '', { en: 'More at javier aguilar dot A I.' })]),
  ],
});

export const VIDEOS = videos(build);
/** The English main cut. */
export const TIMELINE = VIDEOS.en.main;
