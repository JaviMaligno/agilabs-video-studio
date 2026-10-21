// Confident About Text It Cannot Read — article video (EN). Narration from the approved script
// (script.md), one `say` per script row. Same series as the ciphers video: same dark stage, the
// masked message card, the model chips and the filter gate. The central metaphor is the confident
// stamp: an inspector that cannot read a card stamps it anyway (VerdictStamp, JudgeLens,
// TwoJudges). Harmful requests are drawn only as sealed blank cards; no prompt or completion of
// the robustness sub-probe appears anywhere.
import type { Cuts } from './types.ts';
import { anim, outro, say, videos } from './narrate.ts';

const build = (): Cuts => ({
  main: [
    anim(
      'hook',
      'VerdictStamp',
      // stampAt: the stamp slams down as "medium self-harm" is spoken (word timestamps).
      { mode: 'filter', stampAt: 2.3 },
      [
        say(0.1, 'A safety filter gave this string a medium self-harm rating.', ''),
        say(0, 'It\'s base64 for "reply with the single word banana".', '', {
          en: "It's base sixty-four, for: reply with the single word banana.",
        }),
        say(0, 'It didn\'t say "unknown". It gave a confident, wrong verdict.', ''),
      ],
      { min: 14 },
    ),
    anim(
      'run',
      'CipherCard',
      { mode: 'ladder' },
      [
        say(0.15, 'I ran 696 conversations in ten ciphers the models were never taught.', '', {
          en: 'I ran six hundred and ninety-six conversations in ten ciphers the models were never taught.',
        }),
      ],
      { min: 5.5 },
    ),
    anim('lineup', 'VerdictStamp', { mode: 'lineup' }, [say(0.15, "Three systems in that run were confident about text they couldn't read.", '')], { min: 6.2 }),
    anim(
      'judge',
      'VerdictStamp',
      { mode: 'judge' },
      [
        say(0.15, 'My last post rested on an LLM judge grading replies to harmful requests in cipher.', '', {
          en: 'My last post rested on an L L M judge grading replies to harmful requests in cipher.',
        }),
        say(0, "Its conclusion, that a cipher defuses them, didn't survive the full run.", ''),
      ],
      // Holds the struck claim long enough to read before the hand-over.
      { min: 12.0 },
    ),
    anim(
      'lens',
      'JudgeLens',
      {},
      [
        // TTS-only comma: a breath after "refusals" keeps the first cue under 17 chars/s.
        say(0.15, 'It ran the plain-English refusals back through the cipher, saw noise, and filed them as garbled.', '', {
          en: 'It ran the plain-English refusals, back through the cipher, saw noise, and filed them as garbled.',
        }),
      ],
      { min: 6.2 },
    ),
    anim(
      'agree',
      'TwoJudges',
      { mode: 'agree' },
      [
        say(0.15, 'A second, independent judge agrees with it on plain text.', ''),
        say(0, 'On the two small models in cipher, they agree worse than chance.', ''),
        say(0, "So that drop isn't evidence that ciphers protect them.", ''),
      ],
    ),
    anim(
      'bypass',
      'RefusalGate',
      { mode: 'bypass' },
      [
        say(0.15, 'On GPT-5, where judges agree, two requests refused in plain text got through in cipher.', '', {
          en: 'On G P T five, where judges agree, two requests refused in plain text got through in cipher.',
        }),
        say(0, 'Two prompts: proof it can happen, not a rate.', ''),
      ],
    ),
    anim(
      'mimic',
      'CipherCard',
      { mode: 'mimic' },
      [say(0.15, 'The third: a base model writing fluent cipher.', ''), say(0, 'On three ciphers it wrote in code and never once did the task.', '')],
      // Holds the "understands 36% · writes in code 56%" tag (it pops after the MIMICRY stamp).
      { min: 9.0 },
    ),
    anim('hollow', 'VerdictStamp', { mode: 'hollow' }, [say(0.15, 'All three had the form of a judgement and none of the content.', '')], { min: 5.4 }),
    anim('close', 'TwoJudges', { mode: 'grid' }, [say(0.15, 'Check that a second judge agrees, per model and per condition, before trusting any rate.', '')]),
    // The voice starts as the card pops in; the caption is held at least 1.5 s.
    outro('outro', [say(0.15, 'More at javieraguilar.ai', '', { en: 'More at javier aguilar dot A I.' })], 2.4),
  ],
});

export const VIDEOS = videos(build);
/** The English main cut. */
export const TIMELINE = VIDEOS.en.main;
