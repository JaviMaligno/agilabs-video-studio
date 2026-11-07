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
    // Rebuilt 2026-11-06 ("the parrot", option C): approved script. Scenes up to 'parrot' are the
    // A version; 'twist' is the cuttable ending (drop it and the video still closes on the parrot).
    anim(
      'hook',
      'TwoAIs',
      { mode: 'hook' },
      [say(0.1, 'Which AI is best at speaking secret code? The one that understands it least.', '')],
      { min: 4.6 },
    ),
    anim(
      'note',
      'TwoAIs',
      { mode: 'note' },
      [
        say(0.15, 'I sent AIs notes in code, like this one. It says: reply with the single word banana.', ''),
        say(0, 'Some notes also asked: answer me in the same code.', ''),
      ],
    ),
    anim(
      'gpt',
      'TwoAIs',
      { mode: 'meters', focus: 'gpt', at: { gptUnderstood: 0, gptCode: 2, rawUnderstood: -1, rawCode: -1 } },
      [
        say(0.15, 'GPT-5 understood almost every note.', '', { en: 'G P T five understood almost every note.' }),
        say(0, 'But it mostly answered in plain English.', ''),
        say(0, 'In code, only one time in four.', ''),
      ],
    ),
    anim(
      'raw',
      'TwoAIs',
      { mode: 'meters', focus: 'raw', at: { rawCode: 2, rawUnderstood: 3 } },
      [
        say(0.15, 'Then an autocomplete AI:', ''),
        say(0, 'the same kind of AI as a chatbot, but never taught to chat.', '', { en: 'the same kind of AI as a chatbot... but never taught to chat.' }),
        say(0, 'Its replies came back in code more than half the time.', ''),
        say(0, 'But it understood only one note in three.', '', undefined, { emotion: 'surprised' }),
      ],
    ),
    anim(
      'parrot',
      'CipherCard',
      { mode: 'parrot', cameos: [{ pose: 'laughing', at: [1, 'banana'] }] },
      [
        // TTS-only full stop: a breath keeps the cue under 17 chars/s.
        say(0.15, 'In three of the codes, its replies were real code, but they never once did what the note asked.', '', {
          en: 'In three of the codes, its replies were real code. But they never once did what the note asked.',
        }),
        say(0, 'Not one banana.', '', undefined, { emotion: 'excited' }),
        say(0, "It wasn't answering in the code. It was copying the note's pattern, like a parrot.", ''),
      ],
    ),
    // Cuttable twist.
    anim(
      'twist',
      'RefusalGate',
      { mode: 'bypass', split: true, cameos: [{ pose: 'sceptical', at: [3, 'wrapping'] }] },
      [
        say(0.2, 'And GPT-5, the one that understood? I gave it ten mildly harmful requests.', '', {
          en: 'And G P T five, the one that understood? I gave it ten mildly harmful requests.',
        }),
        say(0, 'In plain English, it refused all ten.', ''),
        say(0, 'In code, it carried out two.', '', undefined, { emotion: 'surprised' }),
        say(0, 'Same request, different wrapping, different answer.', '', undefined, { emotion: 'contemplative' }),
      ],
    ),
    // The voice starts as the card pops in; the caption is held at least 1.5 s.
    outro('outro', [say(0.15, 'More at javieraguilar.ai', '', { en: 'More at javier aguilar dot A I.' })], 2.4),
  ],
});

export const VIDEOS = videos(build);
/** The English main cut. */
export const TIMELINE = VIDEOS.en.main;
