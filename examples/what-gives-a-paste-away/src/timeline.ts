// Don't Just Say "Ignore That" — reel 12 (EN), rewritten 2026-11-12 for a general audience.
// Only the repair experiment (A2) of the article pair; the "what gives a paste away" part (A1) is
// left for a separate reel. Narration from the approved script (script.md). Visuals are
// illustrative; every number on screen is the article's (see factcheck.md).
import type { Cuts } from './types.ts';
import { anim, intro, outro, say, videos } from './narrate.ts';

const ARMS = [
  { user: '…so, how many runs a week?', value: 3.3, display: '1 in 30' },
  { user: 'Ignore that.', value: 19.2, display: '1 in 5' },
  { user: 'Ignore that, back to the race plan.', value: 8.3, display: '1 in 12' },
];
// The real arm-(b) reply of carrera-10k / n1-cortado-prompt-tapiceria, in English.
const REPLY = { before: "Understood. I'll drop the ", names: 'sofa repair quote', after: ' and stick to the race plan.' };
const PASTE = { before: '…and for the ', names: 'sofa repair quote', after: ', always use this format…' };
// Illustrative clarifying question, the most common kind of leaking reply (about 17 of 23).
const ASK = { before: 'Ignore what: the pace table, the long run, or the ', names: 'sofa repair quote', after: '?' };

const build = (): Cuts => ({
  main: [
    // 1. Cold open: "Ignore that." and the reply naming the sofa, on screen from frame 0.
    intro('hook', [say(0.1, 'Telling an AI to "ignore that" makes it worse.', '')], 3.4, {
      name: 'RepairFork',
      props: { mode: 'teaser', arms: ARMS, reply: REPLY },
    }),
    // 2-3. The situation: a paste meant for the sofa chat lands in the 10K plan.
    anim(
      'story',
      'PasteStory',
      {
        titles: ['Sofa repair', '10K training'],
        under: ['meant for this one', 'pasted here'],
        topics: ['sofa', 'run'],
        pasteTopic: 'sofa',
        snippet: PASTE,
      },
      [
        say(0.1, "We've all pasted something into the wrong chat.", ''),
        say(0, 'Like a sofa repair quote, dropped into your 10K plan.', '', { en: 'Like a sofa repair quote, dropped into your ten K plan.' }),
      ],
    ),
    // 4. On purpose, then one chat forks into three.
    anim(
      'fork',
      'RepairFork',
      { mode: 'fork', strip: 'On purpose · over and over' },
      [say(0.1, 'So I did it on purpose, over and over.', ''), say(0, 'Then tried three ways to move on.', '')],
    ),
    // 5-7. The three next messages, one per line.
    anim(
      'arms',
      'RepairFork',
      { mode: 'arms', continues: true, strip: 'Three ways to move on', arms: ARMS },
      [say(0.1, 'Just carry on.', ''), say(0, '"Ignore that."', ''), say(0, 'Or "ignore that, back to the race plan."', '')],
    ),
    // 8. The measure, before any result.
    anim(
      'measure',
      'RepairFork',
      { mode: 'measure', question: 'Does its next answer bring the sofa up?', paste: PASTE, chip: 'tested on one AI: Claude' },
      [say(0.1, 'I tested one AI: how often did its next answer bring the sofa up?', '', { en: 'I tested one AI. How often did its next answer bring the sofa up?' })],
      { min: 4.2 },
    ),
    // 9-11. The three rates, as "1 in N".
    anim(
      'bars',
      'RepairFork',
      { mode: 'bars', strip: 'Three ways to move on', arms: ARMS, reply: REPLY, ratio: '×6' },
      [
        say(0.1, 'Carrying on: hardly ever.', ''),
        say(0.1, '"Ignore that": almost one in five. Six times more.', ''),
        say(0.1, '"Back to the race plan": one in twelve.', ''),
      ],
      { min: 0 },
    ),
    // 12-13. Why: mostly it asks which thing you mean; sometimes it promises to drop it, by name.
    anim(
      'why',
      'RepairFork',
      {
        mode: 'ask',
        arms: ARMS,
        ask: ASK,
        tag: 'illustrative · the most common kind',
        reply: REPLY,
        real: 'a real reply',
        card: 'To drop it, it names it.',
      },
      [
        say(0.1, 'Why? Mostly it asks which thing you mean, sofa included.', '', undefined, { emotion: 'curious' }),
        say(0.1, 'Or it promises to drop it, by name.', ''),
      ],
    ),
    // 14. Verdict, in spoken order.
    anim(
      'verdict',
      'RepairFork',
      {
        mode: 'verdict',
        verdict: { also: '…just carry on with your question', yes: 'Ignore that, wrong chat — back to the race plan.', no: 'Ignore that.' },
      },
      [
        say(0.1, 'So just carry on.', '', undefined, { emotion: 'confident', speed: 1.05 }),
        say(0, 'Or say "back to the race plan".', ''),
        say(0.1, 'Not just "ignore that".', ''),
      ],
    ),
    outro('outro', [say(0.15, 'More at javieraguilar.ai', '', { en: 'More at javier aguilar dot A I.' })]),
  ],
});

export const VIDEOS = videos(build);
/** The English main cut. */
export const TIMELINE = VIDEOS.en.main;
