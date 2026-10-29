// The Gaps in the Map Are Not Ideas — explainer video (EN). Narration from the approved script (script.md).
// A tweet says points far from every Steam game are new ideas. The map, the friend's astronaut on a
// horse, the two ways to decode a point (show the neighbours, or search without them) and the cap
// where all texts live are drawn by the bespoke GapMap component, one mode per scene.
import type { Cuts } from './types.ts';
import { L, anim, intro, outro, say, videos } from './narrate.ts';

const build = (): Cuts => ({
  main: [
    intro('hook', [
      say(0.4, 'Can AI invent a new idea by picking an empty spot on the map of everything that exists?', '', undefined, { emotion: 'curious' }),
    ]),
    anim(
      'tweet',
      'GapMap',
      { mode: 'tweet' },
      [
        say(0.3, 'A tweet proposed exactly that:', ''),
        say(0, 'map every game on Steam, pick points far from all of them,', ''),
        say(0, 'and turn each one back into a game.', ''),
      ],
    ),
    anim(
      'friend',
      'GapMap',
      { mode: 'friend' },
      [say(0.3, 'A friend said image models already do it:', ''), say(0, 'ask for an astronaut riding a horse, and you get one.', '')],
    ),
    anim(
      'mix',
      'GapMap',
      { mode: 'mix' },
      [
        say(0.2, 'But they get there by mixing things they know.', '', undefined, { emotion: 'skeptical' }),
        say(0, 'Far from everything,', ''),
        say(0, 'there may be nothing to mix.', '', undefined, { emotion: 'skeptical' }),
      ],
    ),
    anim(
      'three',
      'GapMap',
      { mode: 'three', cameos: [{ pose: 'laptop', at: [0, 'tested'], dur: 2.2 }] },
      [say(0.3, 'So I tested it on games, papers and patents.', '')],
      { min: 3.4 },
    ),
    anim(
      'hotcold',
      'GapMap',
      { mode: 'hotcold' },
      [say(0.2, 'First, the obvious way: show a model the eight nearest games,', ''), say(0, 'and play hot and cold.', '')],
    ),
    anim(
      'blend',
      'GapMap',
      { mode: 'blend', cameos: [{ pose: 'laughing', at: [1, 'kitten'], dur: 2 }] },
      [say(0.2, 'Its neighbours were a black cat, some hamsters and a furry stepmom.', ''), say(0, 'Out came a kitten pushing blocks.', '')],
    ),
    anim('stamp', 'GapMap', { mode: 'stamp' }, [say(0.2, 'It just blends whatever you show it.', '', undefined, { emotion: 'confident' })], { min: 2.6 }),
    anim(
      'search',
      'GapMap',
      { mode: 'search' },
      [
        say(0.2, 'Then a real search, with no neighbours at all.', ''),
        say(0, 'The best coherent text I found sits at 0.14.', '', { en: 'The best coherent text I found sits at zero point one four.' }),
        say(0, 'The point is at 1.', '', { en: 'The point is at one.' }, { emotion: 'amazed' }),
      ],
    ),
    anim(
      'cap',
      'GapMap',
      { mode: 'cap' },
      [say(0.2, 'Texts live on a narrow cap of the sphere.', ''), say(0, 'Far points sit outside it.', '')],
    ),
    anim(
      'museums',
      'GapMap',
      { mode: 'museums', cameos: [{ pose: 'amazed', at: [1, 'museums'], dur: 2 }] },
      [
        say(0.2, 'What did give new ideas was simply asking for one.', ''),
        say(0, 'Though one model wrote 46 museums out of 50…', '', { en: 'Though one model wrote forty-six museums out of fifty…' }),
      ],
    ),
    anim('diverse', 'GapMap', { mode: 'diverse' }, [say(0.1, '…until it could see what it had already proposed.', '')]),
    anim(
      'verdict',
      'KeyQuote',
      { text: L("A point far from everything isn't an idea.", ''), emphasis: ["isn't", 'idea'] },
      [
        say(0.3, "A point far from everything isn't an idea.", '', undefined, { emotion: 'confident', speed: 1.05 }),
        say(0, 'Almost always, no text fits there.', '', undefined, { emotion: 'confident', speed: 1.05 }),
      ],
    ),
    outro('outro', [say(0.15, 'More at javieraguilar.ai.', '', { en: 'More at javier aguilar dot A I.' })]),
  ],
});

export const VIDEOS = videos(build);
/** The English main cut. */
export const TIMELINE = VIDEOS.en.main;
