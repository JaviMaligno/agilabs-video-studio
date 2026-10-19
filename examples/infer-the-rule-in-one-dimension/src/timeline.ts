// The Wall and the Circle — explainer video (EN) for "An LLM Can Infer the Rule You Forgot —
// in One Dimension". Narration from the approved script v1.1 (script.md). One bespoke stage,
// RuleField: a wall the model heals from a handful of sparks, a circle it never closes, and the
// pin (the centre) that finally closes it. Numbers on screen and their sources: factcheck.md.
import type { Cuts } from './types.ts';
import { anim, outro, say, videos } from './narrate.ts';

const build = (): Cuts => ({
  main: [
    anim(
      'hook',
      'RuleField',
      { mode: 'hook' },
      [say(0.15, 'I left a wall out of the spec. The model put it back.', ''), say(0, 'A circle? Not once.', '')],
    ),
    anim('setup', 'RuleField', { mode: 'setup' }, [say(0.2, 'An LLM writes the physics a planner trusts.', '', { en: 'An L L M writes the physics a planner trusts.' })]),
    anim('heal', 'RuleField', { mode: 'heal' }, [say(0.2, 'From a handful of contacts, it wrote the true rule back.', '')]),
    anim('tally1', 'RuleField', { mode: 'tally1' }, [
      say(0.2, 'It did that in 105 of 111 attempts.', '', { en: 'It did that in a hundred and five of a hundred and eleven attempts.' }),
    ]),
    anim('plane', 'RuleField', { mode: 'plane' }, [say(0.2, 'Then I gave the rule one more dimension: a circle that stops the mover.', '')]),
    anim('tally2', 'RuleField', { mode: 'tally2' }, [say(0.2, 'Repair fell to 0 of 156.', '', { en: 'Repair fell to zero of a hundred and fifty-six.' })]),
    anim('reduce', 'RuleField', { mode: 'reduce' }, [say(0.2, 'Mostly, it wrote a wall instead: right place, wrong shape.', '')]),
    anim('fixes', 'RuleField', { mode: 'interventions' }, [
      say(0.2, 'Eight fixes: a better prompt, flat edges, more evidence.', ''),
      say(0, 'None worked.', ''),
    ]),
    anim('dose', 'RuleField', { mode: 'dose' }, [
      // Pause after "evidence" (TTS) and an ellipsis in the caption (same words): the cue breaks there,
      // not inside "three / lines".
      say(0.2, 'With enough evidence… three lines of least squares find the circle every time.', '', {
        en: 'With enough evidence... three lines of least squares find the circle every time.',
      }),
      say(0, 'The model: none.', ''),
    ]),
    anim('pin', 'RuleField', { mode: 'pin' }, [
      // Caption: a dash where the script has a colon (a colon closes the cue after four words), and a
      // colon before "20 of 20" so the count is its own cue instead of breaking "20 / of 20".
      say(0.2, 'Tell it where the circle is — it infers the radius exactly: 20 of 20.', '', {
        en: 'Tell it where the circle is: it infers the radius exactly, twenty of twenty.',
      }),
      say(0, 'Only the shape: zero.', ''),
    ]),
    anim('close', 'RuleField', { mode: 'split' }, [
      say(0.2, 'Learning the rule from data is a one-dimensional bet.', ''),
      say(0, 'Anything with a shape, you still have to specify.', ''),
    ]),
    outro('outro', [say(0.15, 'More at javieraguilar.ai', '', { en: 'More at javier aguilar dot A I.' })]),
  ],
});

export const VIDEOS = videos(build);
/** The English main cut. */
export const TIMELINE = VIDEOS.en.main;
