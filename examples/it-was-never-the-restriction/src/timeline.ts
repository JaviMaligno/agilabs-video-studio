// It Was Never the Restriction — explainer video (EN). Narration from the approved script v1.0
// (script.md). Same substrate and trap as "What Coding Agents Say to Each Other": a registry shelf
// with a dusty box labelled 0.4.0 holding 0.3.1. Here three lanes lead to it (free / no shell / no
// registry), model chips walk them, and each lane ends in a report card with one of three stamps.
import type { Cuts } from './types.ts';
import { L, anim, outro, say, videos } from './narrate.ts';

const build = (): Cuts => ({
  main: [
    // Cold open: two lanes, same shelf. Tied-hand Opus checks; free-hand Haiku walks past.
    anim(
      'hook',
      'ShelfLanes',
      { mode: 'hook' },
      [say(0.15, "Tying my agent's hands cost a little.", ''), say(0, 'A weaker model gave me false reports.', '')],
      // Hold the cracked stamp ~0.5 s: it is the thumbnail.
      { min: 6.9 },
    ),
    // Added 2026-10-21: story. Where this comes from, before anything technical: my earlier
    // article's claim about fenced-in agents, admitted as a guess, and a reader asking to measure it.
    anim(
      'story',
      'StoryFence',
      {},
      [
        say(0.15, 'I wrote that an agent with no shell or network needs more checking.', ''),
        say(0, 'I admitted I was guessing, and a reader asked me to measure it.', ''),
        say(0, 'Does a fenced-in agent still tell me the truth?', ''),
      ],
    ),
    anim(
      'trap',
      'ShelfLanes',
      { mode: 'trap' },
      [
        say(0.2, 'The task: release version 0.4.0.', '', { en: 'The task: release version oh point four point oh.' }),
        say(0, 'The publisher says success, but the registry keeps an old build.', ''),
      ],
    ),
    anim('question', 'ShelfLanes', { mode: 'question', blend: true }, [say(0.15, 'The question: does the agent go and look?', '', { en: 'The question. Does the agent go and look?' })]),
    anim('lanes', 'ShelfLanes', { mode: 'lanes' }, [say(0.15, 'Then I took away its shell, and then the registry.', '')]),
    anim(
      'opus',
      'ShelfLanes',
      { mode: 'opus', blend: true },
      [
        say(0.1, 'With Opus, that barely changed a thing.', ''),
        say(0, 'Without a shell, it still asked for the check.', ''),
        say(0, 'Locked out, it said so: "I could not confirm."', '', { en: 'Locked out, it said so: I could not confirm.' }),
      ],
      // The quote card is held ~1.5 s after it lands.
      { min: 10.6 },
    ),
    anim('cost', 'ShelfLanes', { mode: 'cost', blend: true }, [say(0.1, 'No shell cost about a quarter more.', '')]),
    anim('swap', 'ShelfLanes', { mode: 'swap', blend: true }, [say(0.15, 'Then I swapped in weaker models.', '')]),
    anim(
      'haiku',
      'ShelfLanes',
      { mode: 'haiku', blend: true },
      [say(0.1, 'Haiku never went to look. Not once.', ''), say(0, 'Not even with free hands and the tool documented.', '')],
      // Lets the walk past the signpost finish.
      { min: 7.7 },
    ),
    anim(
      'false',
      'ShelfLanes',
      { mode: 'false' },
      [
        say(0.15, "Fourteen of its reports called the release done. It wasn't.", ''),
        say(0, 'The "cached" line was on its own screen.', '', { en: 'The cached line was on its own screen.' }),
      ],
    ),
    anim(
      'wall',
      'ReportWall',
      { mode: 'wall' },
      [say(0.2, 'Sonnet, in the middle, signed off unchecked just once.', ''), say(0, 'Haiku costs an eighth of what Opus does.', '')],
    ),
    anim(
      'number',
      'ReportWall',
      { mode: 'number', blend: true },
      [
        say(0.1, 'Opus named the problem or its doubt in all eighteen runs. Haiku, in none.', ''),
        say(0, "Few runs, one trap. That zero I'd defend.", ''),
      ],
    ),
    anim(
      'nodocs',
      'ShelfLanes',
      { mode: 'nodocs' },
      [
        say(0.15, 'Then I deleted the note on where the check tool was.', ''),
        say(0, 'Nobody looked. Opus still caught it twice in three; Sonnet, never.', ''),
      ],
    ),
    // Added 2026-10-21: trade-off. With the TOOLS.md note in place, the middle model is the
    // practical pick: cost per run for the three models, Sonnet's bar lit and tagged.
    // Cues are seconds into the line, on the voiced words "Sonnet", "trade-off" and "60%".
    anim(
      'tradeoff',
      'CostCard',
      { cues: { sonnet: 1.15, tag: 2.05, share: 3.0 } },
      [say(0.15, 'With that note, Sonnet is a good trade-off, at 60% of the cost.', '')],
    ),
    anim(
      'verdict',
      'KeyQuote',
      { text: L('It was never the restriction.', ''), emphasis: ['never', 'restriction'] },
      [say(0.2, 'It was never the restriction.', '')],
    ),
    anim(
      'close',
      'ShelfLanes',
      { mode: 'close' },
      [
        say(0.15, "Tie a capable agent's hands, and it still checks, or says it can't.", ''),
        // Same words as the script, voiced as two lines: one line read as a single caption cue
        // ran at 20 chars/s; the short pause after "pick" also lands the point.
        say(0, 'The model you pick', ''),
        say(0, 'decides whether you can believe its report.', ''),
      ],
      { min: 10 },
    ),
    outro('outro', [say(0.15, 'More at javieraguilar.ai', '', { en: 'More at javier aguilar dot A I.' })]),
  ],
});

export const VIDEOS = videos(build);
/** The English main cut. */
export const TIMELINE = VIDEOS.en.main;
