// The Instrument Fails in Your Favour — explainer video (EN). Narration from the approved script
// v1.0 (script.md); every number on screen and in the voice is in factcheck.md. One visual
// metaphor throughout: an analog gauge with a magnet (the bug) hidden behind its face, pulling the
// needle into a glowing "what I expected" arc. Scenes carry several lines each (one phase per
// beat), so the gauge stays continuous inside a case.
import type { Cuts } from './types.ts';
import { anim, outro, say, videos } from './narrate.ts';

const build = (): Cuts => ({
  main: [
    // Cold open (script 1-2): the crack on "broke", then the needle dragged into the arc.
    anim('hook', 'RiggedGauge', { mode: 'hook' }, [
      say(0.2, 'Every instrument I built broke at least once.', ''),
      say(0, 'And every break pointed toward the result I was expecting.', ''),
    ]),
    // Script 3-4: what the instruments are, then the key moment (stamp, held ~0.5 s).
    anim(
      'setup',
      'RiggedGauge',
      { mode: 'setup' },
      [say(0.1, 'To test AI agents, I write tools that score them.', ''), say(0, 'The thing you measure with is unverified software too.', '')],
      // Holds the stamp (and the cue under 17 chars/s) a little past the line.
      { min: 7.65 },
    ),
    // Case 1 (script 5-8): the word detector.
    anim('case1', 'WordNet', {}, [
      say(0.1, "One detector looked for agents saying: wait, I'm in that file.", ''),
      say(0, 'It found 19, and only 5 closed. That fit my story.', '', { en: 'It found nineteen, and only five closed. That fit my story.' }),
      say(0, 'Counted by hand: 3 real requests, all 3 closed.', '', { en: 'Counted by hand: three real requests, all three closed.' }),
      say(0, 'It had counted every "wait", even just mentions.', ''),
    ]),
    // Case 2 (script 9-11): the inherited benchmark. Line 11 split so CONCLUSION HELD gets its beat.
    anim('case2', 'MergeStrips', {}, [
      say(0.1, 'A benchmark I inherited scored every merge conflict as a fail.', ''),
      say(0, 'That pushed the number toward my thesis.', ''),
      say(0, 'Fixing it moved one task.', ''),
      say(0, "It didn't change the conclusion.", ''),
    ], { min: 12.45 }),
    // Case 3 (script 12-15): the reference.
    anim('case3', 'AnswerKey', { cont: [3] }, [
      say(0.1, "An external report scored a client's classifier at 54%.", '', {
        en: "An external report scored a client's classifier at fifty-four percent.",
      }),
      say(0, 'Its answer key could be guessed from the company name alone.', ''),
      // Script line 14 in two lines (a breath after "flaws"): each cue reads under 17 chars/s.
      // The component skips the continuation's beat (cont: [3]).
      say(0, 'The comparator had three flaws,', ''),
      say(0, 'and all three could only subtract.', ''),
      say(0, 'Checked case by case: 75%, up to 85%.', '', { en: 'Checked case by case: seventy-five percent, up to eighty-five.' }),
    ]),
    // Mechanism (script 16-20): direction, the conveyor, the verdict (held), the audit.
    anim('mechanism', 'StoppingRule', {}, [
      say(0.1, "Random bugs would point both ways. These didn't.", ''),
      say(0, 'When the number confirms, I stop looking. That bug survives.', ''),
      say(0, 'When it contradicts, I dig, and the bug gets found.', ''),
      say(0.3, "The instrument isn't biased. My stopping rule is.", ''),
      // The verdict is held ~0.6 s before the next line (script 19).
      // Script line 20 in two lines, for the same reason (the second beat is unused).
      say(15.4, 'So go and look at the thing itself,', ''),
      say(0, 'hardest where the result pleased you.', ''),
    ]),
    // Close (script 21-22).
    anim('close', 'RiggedGauge', { mode: 'close' }, [
      say(0.1, 'Measure it, but trust the measurement the least.', ''),
      say(0, "It's the only part nothing is checking.", ''),
    ]),
    outro('outro', [say(0.15, 'More at javieraguilar.ai.', '', { en: 'More at javier aguilar dot A I.' })]),
  ],
});

export const VIDEOS = videos(build);
/** The English main cut. */
export const TIMELINE = VIDEOS.en.main;
