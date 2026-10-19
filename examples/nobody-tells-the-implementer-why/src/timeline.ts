// Nobody tells the implementer why — explainer video (EN). Narration from the approved script (script.md).
// The request is a paper strip and every "because" is an amber tab stapled to it; the strip drops
// down a shaft of four desks and the tabs are cut before it reaches the implementer. The lines on
// the strip are real hand-offs from one published run (src/data/handoff.json).
import type { Cuts } from './types.ts';
import { L, anim, outro, say, videos } from './narrate.ts';

const build = (): Cuts => ({
  main: [
    // Cold open: the title is the hook, drawn by the scene itself (no caption for its line).
    anim('cold', 'HandoffShaft', { mode: 'cold', titleLine: true }, [say(0.15, 'Nobody tells the implementer why.', '')], { min: 3 }),
    anim(
      'unroll',
      'HandoffShaft',
      { mode: 'unroll', play: [10, 10] },
      // Split at the comma: the cloned voice reads ~18 chars/s, so the first cue needs the pause to stay under 17.
      [say(0.3, "I passed a client's request down a team of agents,", ''), say(0.25, 'from the lead to whoever writes the code.', '')],
      // The closing cue needs a little more air than TAIL to stay under 17 chars/s.
      { min: 6.4 },
    ),
    anim('facts', 'HandoffShaft', { mode: 'facts', play: [10, 10] }, [say(0.2, 'Names, numbers, prohibitions: almost all of it arrived.', '')]),
    anim('reasons', 'HandoffShaft', { mode: 'reasons', play: [0, 2] }, [say(0.2, 'For two hops, so did the reasons.', '')], { min: 3.2 }),
    anim('arrive', 'HandoffShaft', { mode: 'arrive', play: [2, 2] }, [say(0.15, 'Then the architect wrote to the implementer.', '')]),
    anim(
      'snip',
      'HandoffShaft',
      { mode: 'snip', play: [2, 3], chip: '8–31% · Claude, software teams' },
      [
        say(0.2, 'In my runs, the "because" survived in only 8–31% of those messages.', '', {
          en: 'In my runs, the "because" survived in only eight to thirty-one percent of those messages.',
        }),
      ],
    ),
    anim(
      'erosion',
      'ErosionVsCut',
      {},
      [say(0.3, "It isn't worn away, like in the telephone game.", ''), say(0, "It's cut.", '')],
      { min: 5 },
    ),
    anim(
      'shortcut',
      'HandoffShaft',
      { mode: 'shortcut', play: [20, 20], counter: { value: 24, suffix: '%', label: L('reason kept · lead → implementer', ''), delay: 1.1 } },
      [
        // Split at the comma (cloned voice ~18 chars/s): the pause keeps the first cue under 17 chars/s.
        say(0.2, 'Even the lead, writing that message itself,', ''),
        say(0.2, "with the client's request in hand,", ''),
        say(0, 'kept the reason only 24% of the time.', '', { en: 'kept the reason only twenty-four percent of the time.' }),
      ],
    ),
    anim(
      'quote',
      'HandoffShaft',
      {
        mode: 'quote',
        play: [3, 3],
        quote: {
          lines: ['Whoever writes to the builder writes instructions.', "And instructions don't carry reasons."],
          emphasis: ['instructions', 'reasons'],
        },
      },
      [say(0.2, 'Whoever writes to the builder writes instructions.', ''), say(0, "And instructions don't carry reasons.", '')],
    ),
    anim('code', 'HandoffShaft', { mode: 'code', play: [3, 3] }, [say(0.2, 'Whether losing it hurts the code is less tidy than I expected.', '')]),
    anim(
      'reattach',
      'HandoffShaft',
      { mode: 'reattach', play: [3, 3] },
      [say(0.2, 'But if the why matters to whoever builds, put it in their message yourself.', ''), say(0, 'Or attach the original.', '')],
    ),
    // The voice starts as the card pops in; the card ends OUTRO_TAIL after it.
    outro('outro', [say(0.15, 'More at javieraguilar.ai.', '', { en: 'More at javier aguilar dot A I.' })]),
  ],
});

export const VIDEOS = videos(build);
/** The English main cut. */
export const TIMELINE = VIDEOS.en.main;
