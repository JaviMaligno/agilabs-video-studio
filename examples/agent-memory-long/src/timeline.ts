// How an AI agent forgets — the long YouTube version (EN, landscape, 7 chapters). Narration from
// script.md v5, rows 1-41, one line per row, in order, verbatim.
// One everyday example from start to finish: the trip chat where "my flight is Friday, not
// Thursday" got a "Got it!" and the hotel was booked for Thursday anyway. The red slip "FLIGHT:
// FRIDAY" travels through every memory. Consecutive rows of one component share a scene.
// Marks ([line, word]) are estimated from the text until real TTS exists.
// Chapters: `chapter` on the first scene of each one draws the chapter card and becomes a YouTube
// chapter (npm run deliver -> out/youtube-chapters-en.txt).
import type { Cuts, Scene } from './types.ts';
import { anim, intro, outro, say, videos, voice } from './narrate.ts';
import { WORDS } from './audio.generated.ts';
import { resolveMark, type MarkSpec } from './marks.ts';

/** Marks resolved to scene seconds. */
const finish = (scenes: Scene[]): Scene[] => {
  const words = WORDS[voice()];
  return scenes.map((s) => {
    if (!s.anim || !Array.isArray(s.anim.props.marks)) return s;
    const marks = (s.anim.props.marks as MarkSpec[]).map((m) => resolveMark(s.lines, m, words, voice()));
    return { ...s, anim: { ...s.anim, props: { ...s.anim.props, marks } } };
  });
};

const CONFIDENT = { emotion: 'confident' } as const;
const SKEPTICAL = { emotion: 'skeptical' } as const;

const build = (): Cuts => ({
  main: finish([
    // 0 · Intro (cold open: the wrong booking is already there on frame 0)
    intro(
      'cold',
      [say(0.1, 'You told your AI the plan changed. It said "got it". An hour later, it booked the old plan.', '')],
      3,
      { name: 'ChatTrip', props: { mode: 'wrong', marks: [[0, 'told'], [0, 'got'], [0, 'booked']] } },
    ),
    anim('nextday', 'ChatTrip', { mode: 'morning', marks: [[0, 'tomorrow'], [0, 'remember']] }, [
      say(0.2, 'And tomorrow, in a new chat, it may not remember the trip at all.', ''),
    ]),
    anim(
      'map',
      'MemoryMap',
      {
        mode: 'reveal',
        labels: false,
        marks: [[0, 'several'], [0, 'kinds'], [0, 'memory'], [0, 'bit'], [0, 'each'], [1, 'testing'], [1, 'safest']],
      },
      [
        say(0.2, "It didn't ignore you. It forgot. An AI has several kinds of memory, a bit like you, and each one loses things in its own way.", ''),
        say(0, "I've spent months testing them on AI agents. And the one that sounds safest did the worst.", ''),
      ],
    ),

    // 1 · Training
    anim(
      'training',
      'HeadShelf',
      {
        marks: [[0, 'reads'], [1, 'school'], [1, 'flight'], [1, 'moved'], [3, 'somewhere'], [1, 'frozen'], [0, 'packed'], [2, 'again'], [2, 'worse']],
      },
      [
        say(0.3, "First, why can't it just learn it? Before an AI is released, it reads a huge amount of text, and all of it gets packed inside the model.", ''),
        say(0, "It's like what you learned at school. Huge, and frozen. Nobody reprints your schoolbooks because your flight moved.", ''),
        say(0, "Teaching it something for good means training it again. That's slow, it's costly, and it can make it worse at what it already knew.", ''),
        say(0, 'So your correction has to live somewhere else.', ''),
      ],
      { chapter: 'Training' },
    ),

    // 2 · The desk
    anim(
      'desk',
      'MemoryDesk',
      { mode: 'work', marks: [[0, 'desk'], [0, 'conversation'], [1, 'Friday'], [1, 'use']] },
      [
        say(0.3, "The desk is everything the AI can see right now: its instructions, and your conversation so far. It's your working memory, only much bigger.", ''),
        say(0, 'While "Friday" is on the desk, it can use it.', ''),
      ],
      { chapter: 'The desk' },
    ),
    anim('buried', 'MemoryDesk', { mode: 'crowded', marks: [[0, 'buries'], [1, 'best'], [1, 'Another'], [0, 'hotels']] }, [
      say(0.2, 'But a long chat buries it. You said it once, early on, and then came pages of hotels, prices and plans.', ''),
      say(0, "Having it in front of it isn't a guarantee. In my tests, the best model slipped about once in six hundred decisions. Another got a quarter of them wrong.", ''),
    ]),
    anim('fresh', 'MemoryDesk', { mode: 'wiped', marks: [[0, 'new'], [0, 'clean'], [0, 'Unless'], [0, 'nothing']] }, [
      say(0.2, 'And a new chat starts with a clean desk. Unless a memory feature puts something back on it, it knows nothing about your trip.', ''),
    ]),
    anim('edge', 'MemoryDesk', { mode: 'full', marks: [[0, 'On'], [0, 'long'], [0, 'fills'], [0, 'go'], [0, 'two']] }, [
      say(0.2, 'On a long enough chat, the desk fills up, and something has to go. There are two ways to make room.', ''),
    ]),

    // 3 · The summary
    anim(
      'summary',
      'MemoryDesk',
      {
        mode: 'summary',
        marks: [
          [0, 'writes'], [1, 'gist'], [1, 'meeting'], [2, 'decides'], [2, 'cut'],
          [3, 'wrote'], [3, 'almost'], [4, 'older'], [4, 'slipped'], [5, 'good'],
        ],
      },
      [
        say(0.3, 'The first is a summary. When the desk is full, the AI writes up the conversation, throws the pages away, and carries on from the summary. Coding assistants do this all the time.', ''),
        say(0, "It's how you remember a meeting: not the words, the gist.", ''),
        say(0, 'The risk is that a summary decides in advance what will matter. Will "Friday" make the cut?', ''),
        say(0, 'In my tests, a recent model wrote the correction into its summary and acted on it almost every time.', ''),
        say(0, "But it depends on who writes it. In an earlier test, an older model's summaries slipped more and more as the day got longer.", ''),
        say(0, 'A summary is a guess about what will matter. With a good writer, it guesses well.', ''),
      ],
      { chapter: 'The summary' },
    ),

    // 4 · The notebook
    anim(
      'notebook',
      'FilingCabinet',
      { mode: 'file', marks: [[0, 'Clear'], [0, 'Nothing'], [0, 'keyword'], [1, 'know'], [1, 'email'], [2, 'safest']] },
      [
        say(0.3, 'The second way sounds safer. Clear the desk, and keep the whole conversation in a notebook the AI can search by keyword. It\'s close to the "search past chats" some apps have. Nothing is thrown away.', ''),
        say(0, "It's what you do with your email. You don't remember it; you know where to find it.", ''),
        say(0, 'This is the one that sounds safest. And in my tests, it did the worst, in every setup I tried.', ''),
      ],
      { chapter: 'The notebook' },
    ),
    anim(
      'search',
      'FilingCabinet',
      { mode: 'miss', marks: [[0, 'nothing'], [0, 'searches'], [0, 'never'], [0, 'changed'], [1, 'forty'], [1, 'Its'], [1, 'only']] },
      [
        say(0.2, 'Here\'s why. After the clean-up, nothing on its desk says there was a correction. So when it books the hotel, it searches for flights and dates, never for whether anything changed.', ''),
        say(0, 'Its searches brought the correction back about once in forty. A search only helps if you know what to look for.', ''),
      ],
    ),
    anim(
      'reader',
      'AskReader',
      {
        marks: [
          [0, 'asks'], [0, 'helper'], [0, 'reread'], [0, 'ran'], [0, 'passed'],
          [1, 'whole'], [1, 'long'], [1, 'fills'], [1, 'back'], [1, 'guessing'],
        ],
      },
      [
        say(0.3, "A smarter notebook doesn't search by keyword. It asks a helper, a second AI, to reread the whole conversation and answer. Reading everything, the helper ran into the correction and passed it on most of the time.", ''),
        say(0, "The catch: the helper has to fit the whole conversation in its head. On a chat long enough to need clearing, it fills up too, and we're back to guessing what matters.", ''),
      ],
    ),

    // 5 · The form
    anim(
      'form',
      'ClipboardForm',
      { mode: 'replace', marks: [[0, 'form'], [0, 'boxes'], [0, 'apart'], [1, 'correct'], [1, 'Friday'], [1, 'tomorrow']] },
      [
        say(0.3, 'The last memory is the strictest: a form. A few fixed boxes, kept apart from the chat, filled in as it goes.', ''),
        say(0, 'When you correct it, "Thursday" is crossed out and "Friday" goes into the same box. And unlike the desk, the form is still there tomorrow.', ''),
      ],
      { chapter: 'The form' },
    ),
    anim(
      'nobox',
      'ClipboardForm',
      { mode: 'margin', marks: [[0, 'scribbled'], [0, 'wipes'], [1, 'named'], [1, 'every'], [2, 'notes'], [2, 'say'], [1, 'never']] },
      [
        say(0.2, 'But a form only holds what it has a box for. A fact with no box of its own gets scribbled in the margin, and the next entry wipes it.', ''),
        say(0, 'In my tests, with no box for it, the fact never survived. With a box named after it, it survived every time on one model, and most of the time on another.', ''),
        say(0, 'A box just called "notes" helped much less. The box has to say what goes in it.', ''),
      ],
    ),
    anim('wrong', 'ClipboardForm', { mode: 'wrong', marks: [[0, 'misremembers'], [0, 'right'], [0, 'wrong'], [0, 'everything']] }, [
      say(0.2, "And a form fails in a stranger way. It doesn't forget. It misremembers. The agent did the right thing, wrote down the wrong one, and everything after built on that.", '', undefined, SKEPTICAL),
    ]),
    anim('appmemory', 'ClipboardForm', { mode: 'panel', marks: [[0, 'list'], [0, 'tomorrow'], [0, 'written']] }, [
      say(0.2, 'The saved "memory" in ChatGPT or Claude is a looser cousin: a list of notes kept outside the chat. It\'s still there tomorrow, but it only holds what got written down.', ''),
    ]),

    // 6 · What to combine
    anim(
      'combine',
      'MemoryOffice',
      {
        mode: 'verdict',
        marks: [[0, 'best'], [1, 'desk'], [1, 'summary'], [1, 'search'], [1, 'form'], [2, 'head'], [2, 'email'], [2, 'fridge']],
      },
      [
        say(0.3, 'So which memory is best? On its own, none.', '', undefined, CONFIDENT),
        say(0, "The desk fills up. The summary guesses. The search doesn't know what to look for. And the form only holds what has a box.", ''),
        say(0, "You don't run your life from one memory either. You keep the gist in your head, your email to search, and a few things on the fridge because you know they'll matter.", ''),
      ],
      { chapter: 'What to combine' },
    ),
    anim('recipe', 'MemoryOffice', { mode: 'advice', marks: [[0, 'tests'], [0, 'summary'], [0, 'named']] }, [
      say(0.2, "For agents, my tests point the same way, though I haven't tried the two together yet: a summary to carry the thread, and named boxes for the facts that must not slip.", '', undefined, CONFIDENT),
    ]),
    anim('save', 'ChatTrip', { mode: 'save', marks: [[0, 'buried'], [0, 'Ask'], [0, 'names'], [0, 'pile']] }, [
      say(0.2, "And for you, today: when something matters, don't leave it buried in the chat. Ask it to save it to memory, in one clear line that names the fact. I didn't test the apps, and it's no guarantee, but it gets the fact out of the pile.", ''),
    ]),
    anim('close', 'MemoryMap', { recipe: true }, [
      say(0.2, 'Every AI forgets. What matters is what it forgets, and whether anything notices. Tell me in the comments which one has bitten you.', ''),
    ]),
    outro('outro', [say(0.15, 'More at javieraguilar.ai.', '', { en: 'More at javier aguilar dot A I.' })]),
  ]),
});

export const VIDEOS = videos(build);
/** The English main cut. */
export const TIMELINE = VIDEOS.en.main;
