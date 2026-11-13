// How an AI agent forgets — the long YouTube version (EN, landscape, 7 chapters). Narration from
// script.md v3, rows 1-55, one line per row, in order.
// PLACEHOLDER VISUALS: the rows whose bespoke component is not built yet (ReplayBars, TwoJobs,
// RestartIterate, AskReader, CorrectionReplay) stand in as KeyQuote / StatGrid with the line's key
// words or the figures of the script's Visual column; each placeholder is its own scene so it lands
// on its line. Marks ([line, word]) are estimated from the text until real TTS exists.
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

const build = (): Cuts => ({
  main: finish([
    // 0 · Intro (cold open)
    intro(
      'cold',
      [say(0.1, 'At noon, an AI agent running a warehouse is told that shelf zero is empty. So the next pallet should go there.', '')],
      3,
      { name: 'WarehouseShelves', props: { mode: 'day', marks: [[0, 'told'], [0, 'empty'], [0, 'next']] } },
    ),
    anim('passed', 'WarehouseShelves', { mode: 'later', marks: [[0, 'hours'], [0, 'straight'], [0, 'nobody']] }, [
      say(0.2, 'Two hours later, the pallet arrives, and it goes straight past shelf zero. As if nobody had told it.', ''),
    ]),
    anim(
      'map',
      'MemoryMap',
      { mode: 'reveal', marks: [[1, 'training'], [1, 'desk'], [1, 'summary'], [1, 'notebook'], [1, 'form'], [2, 'Each']] },
      [
        say(0.2, "It didn't ignore the message. It forgot it. And how it forgot says a lot about how these systems remember.", ''),
        say(0, 'An agent has several memories, a bit like you. What it learned in training. Its desk. A summary. A notebook. And a form.', ''),
        say(0, "Each one forgets in its own way. I've spent months testing them, and by the end you'll know which ones to combine.", ''),
      ],
    ),

    // 1 · Training
    anim(
      'training',
      'HeadShelf',
      { marks: [[0, 'reads'], [1, 'school'], [2, 'message'], [2, 'there'], [2, 'trained'], [1, 'slow'], [0, 'packed']] },
      [
        say(0.3, 'Start with training. Before an AI model is released, it reads a huge amount of text, and all of it gets packed inside the model.', ''),
        say(0, "It's like what you learned at school. Huge, and slow to change. Nobody rewrites your schoolbooks because a shop down the street closed.", ''),
        say(0, "So today's message can't go in there. To learn something for good, a model has to be trained again, and that has a price.", ''),
      ],
      { chapter: 'Training' },
    ),
    anim(
      'terminal',
      'ReplayBars',
      { marks: [[0, 'terminal'], [0, 'learned'], [0, 'worse'], [1, 'Mixing'], [1, 'won']] },
      [
        say(0.3, 'I trained a small model to do one narrow thing: pretend to be a computer terminal. It learned it, and got worse at almost everything else.', ''),
        say(0, 'Mixing a little of its old reading back in, like revising for an exam, won most of it back.', ''),
      ],
      { min: 19 }, // the label "10% old reading → ~73% of the loss recovered" needs time to be read
    ),
    anim('habit', 'TwoJobs', { marks: [[0, 'independent'], [0, 'said'], [0, 'first'], [0, 'won'], [1, 'lands']] }, [
      say(0.3, 'Old habits also push back against the facts in front of it. In another test, models read that two jobs were independent, said so, and still put one first, as if habit won.', ''),
      // a breath after "as if habit won." (also keeps its last cue on screen long enough)
      say(12.9, 'So the message from noon has to live somewhere it can actually be read. It lands on the desk.', ''),
    ]),

    // 2 · The desk
    anim(
      'desk',
      'MemoryDesk',
      { mode: 'work', marks: [[0, 'desk'], [0, 'record'], [1, 'uses'], [1, 'shelf']] },
      [
        say(0.3, "The desk is everything the agent can see right now: its instructions, and the record of its day so far. It's your working memory, only much bigger.", ''),
        say(0, 'While the message is on the desk, the agent uses it. The next pallet goes to shelf zero.', ''),
      ],
      { chapter: 'The desk' },
    ),
    anim('crowded', 'MemoryDesk', { mode: 'crowded', marks: [[0, 'crowded'], [0, 'whole'], [0, 'Another'], [1, 'near']] }, [
      say(0.2, "Does a crowded desk hurt by itself? Less than you'd think. With its whole day in front of it, one model missed about one decision in six hundred. Another missed far more.", ''),
      say(0, 'And the task was kind: what it needed was always near the top of the pile.', ''),
    ]),
    anim(
      'restart',
      'RestartIterate',
      { marks: [[0, 'attempt'], [0, 'clear'], [0, 'keep'], [1, 'keeping'], [1, 'messy'], [1, 'throwing']] },
      [
        say(0.3, 'Coding agents face a version of this. When an attempt goes badly, do you clear everything and start over, or keep going?', ''),
        say(0, "On short coding tasks, keeping going won. What hurt wasn't the messy desk. It was throwing away the half-built code along with it.", ''),
      ],
    ),
    anim('edge', 'MemoryDesk', { mode: 'full', marks: [[0, 'edge'], [0, 'long'], [0, 'fills'], [0, 'go'], [0, 'two']] }, [
      say(0.2, 'But the desk has an edge. On a long enough day it fills up, and something has to go. There are two ways to make room.', ''),
    ]),

    // 3 · The summary
    anim(
      'summary',
      'MemoryDesk',
      { mode: 'summary', marks: [[0, 'summary'], [1, 'gist'], [1, 'meeting'], [1, 'words'], [4, 'enough']] },
      [
        say(0.3, 'The first is a summary. Coding assistants like Claude Code do this: when the desk is full, the model writes up its day and starts again from that.', ''),
        say(0, "It's how you remember a meeting: not the words, the gist.", ''),
        say(0, 'The risk is that a summary decides in advance what will matter. So I tried to break it: I showed the agent a small detail it would only need much later, after two summaries.', ''),
        say(0, "It didn't break. A recent model wrote the detail into its summary and used it, about as often as an agent that never summarised at all.", ''),
        say(0, 'And the message from noon? One line on the card, "shelf zero is empty", and that line was enough.', ''),
        say(0, 'It depends on who writes it, though. In an earlier test, an older model writing shorter summaries lost track more than any other memory.', ''),
        say(0, 'A summary is a guess about what will matter. With a good writer, it guesses well.', ''),
      ],
      { chapter: 'The summary' },
    ),

    // 4 · The notebook
    anim(
      'notebook',
      'FilingCabinet',
      { mode: 'file', marks: [[0, 'Clear'], [0, 'Nothing'], [1, 'know'], [1, 'find'], [1, 'email'], [2, 'failed']] },
      [
        say(0.3, 'The second way sounds safer. Clear the desk completely, and keep the whole day in a notebook the agent can search by keyword. Nothing is thrown away.', ''),
        say(0, "It's what you do with your email. You don't remember it; you know where to find it.", ''),
        say(0, "In my tests, it was the only memory that failed every time I tried it. And it's the agent from the start of this video.", ''),
      ],
      { chapter: 'The notebook' },
    ),
    anim('search', 'FilingCabinet', { mode: 'miss', marks: [[0, 'nothing'], [0, 'searching'], [1, 'Never'], [1, 'nothing'], [1, 'forty'], [2, 'sharper'], [2, 'plain']] }, [
      say(0.2, "After the clean-up, its desk says nothing about any message. So when a pallet arrives, it works out what's on each shelf by searching the notebook.", ''),
      say(0, 'It searches for shelves and pallets. Never for a correction, because nothing tells it there was one. About one search in forty brought the message back.', ''),
      say(0, "Giving it tips on how to search made its searches sharper, but it still didn't find the message. A plain search only helps if you know what to look for.", ''),
    ]),
    // placeholders for AskReader (rows 33-35)
    anim('reader', 'KeyQuote', { text: 'The agent asks a question. Another model, one that reads the whole day, answers it.', emphasis: ['asks', 'whole day'] }, [
      say(0.3, 'A smarter notebook changes that. Instead of searching by keyword, the agent asks a question, and another model, one that reads the whole day, answers it.', ''),
    ]),
    anim(
      'unasked',
      'StatGrid',
      {
        stats: [
          { value: '10/11', label: 'detail · ask a reader' },
          { value: '3/8', label: 'detail · keyword search' },
          { value: '4/6', label: 'correction · ask a reader' },
          { value: '2/6', label: 'correction · keyword search' },
        ],
      },
      [say(0.3, "The agent still never asked about a correction. But the reader, working out what's on each shelf, ran into the message and passed it on, almost every time.", '')],
    ),
    anim('catch', 'KeyQuote', { text: "We're back to guessing what matters.", emphasis: ['guessing'] }, [
      say(0.3, "There's a catch. The reader goes through the whole day for every question. On a day long enough to need clearing, it fills up too, and then it has to cut the day into pieces or summarise it. We're back to guessing what matters.", ''),
    ]),

    // 5 · The form
    anim(
      'form',
      'ClipboardForm',
      { mode: 'replace', marks: [[0, 'form'], [0, 'boxes'], [0, 'shelf'], [1, 'empty'], [1, 'old'], [2, 'ten'], [2, 'hundred']] },
      [
        say(0.3, "The last memory is the strictest: a form. Fixed boxes, like what's on each shelf. Each step, the agent updates the boxes, and everything else is thrown away.", ''),
        say(0, `Like a patient's chart. When the message arrives, "empty" goes into shelf zero's box, and the old value is gone.`, ''),
        say(0, 'And it never fills up: the form is the same size at step ten and at step two hundred.', ''),
      ],
      { chapter: 'The form', min: 26.8 }, // time to read the last cue, "two hundred."
    ),
    anim('nobox', 'ClipboardForm', { mode: 'margin', marks: [[0, 'jotted'], [0, 'wipes'], [1, 'named'], [1, 'every'], [2, 'notes'], [2, 'say']] }, [
      say(0.2, 'But a form only holds what it has a box for. A fact with no box gets jotted next to the last entry, and the next entry wipes it.', ''),
      say(0, 'With no box for it, none of twenty-four runs kept the fact. With a box named after it, one model kept it every time, and others most of the time.', ''),
      say(0, 'A general box for notes helped much less. The box has to say what goes in it.', ''),
    ]),
    anim('wrong', 'ClipboardForm', { mode: 'wrong', marks: [[0, 'misremembers'], [1, 'wrong'], [1, 'correctly'], [1, 'box'], [1, 'mistakes'], [2, 'record'], [2, 'followed']] }, [
      say(0.2, "And then a stranger failure. A form doesn't forget. It misremembers.", '', undefined, { emotion: 'skeptical' }),
      say(0, 'On one model, the agent moved a pallet correctly, then wrote the wrong pallet into the box. In one run, about twenty-five mistakes followed, all from that one box.', ''),
      say(0, "Nothing checks that a box matches reality. When that model also kept the day's record beside the form, those slips did no harm: where the two disagreed, it followed the record.", ''),
    ]),

    // 6 · A flaw in my own test (placeholders for CorrectionReplay)
    anim(
      'flaw',
      'StatGrid',
      {
        stats: [
          { value: '12/12', label: 'form' },
          { value: '3/12', label: "day's record" },
        ],
      },
      [say(0.3, "One confession. Until recently, my results said the form was far better than the day's record at taking a correction like our message. It wasn't.", '')],
      { chapter: 'A flaw in my own test' },
    ),
    anim('doubt', 'KeyQuote', { text: 'The pallet it named had already left the warehouse.', emphasis: ['already left'] }, [
      say(0.3, "My message didn't make sense. The pallet it named had already left the warehouse. An agent that had watched it leave had reason to doubt it, and mostly didn't apply it. Hard to blame it.", ''),
    ]),
    anim(
      'fixed',
      'StatGrid',
      {
        stats: [
          { value: '12/12', label: 'form' },
          { value: '10/12', label: "day's record" },
        ],
      },
      [say(0.3, 'With a message that made sense, both got it right. That fixed message is the one behind every result about it in this video.', '')],
    ),
    anim(
      'check',
      'KeyQuote',
      { text: "If the correction contradicts what it saw, you're measuring whether it believes you, not what it remembers.", emphasis: ['believes you', 'remembers'] },
      [say(0.3, "So check your test from the agent's side. If the correction contradicts what it saw, you're measuring whether it believes you, not what it remembers.", '')],
    ),

    // 7 · What to combine
    anim(
      'combine',
      'MemoryOffice',
      { mode: 'verdict', marks: [[0, 'job'], [0, 'best'], [1, 'desk'], [1, 'summary'], [1, 'notebook'], [1, 'form'], [1, 'Training'], [2, 'life']] },
      [
        say(0.3, 'So which memory is best? For what happens on the job, none of them on its own.', '', undefined, CONFIDENT),
        say(0, "Training can't take today's news. The desk fills up. A summary is only as good as its writer. The notebook only helps if you know to look. And the form holds only what has a box, and can be sure and wrong.", ''),
        say(0, "You don't run your life from one memory either. You keep the gist in your head, a notebook to check, and a few things on the fridge because you know they'll matter.", ''),
      ],
      { chapter: 'What to combine' },
    ),
    anim('recipe', 'MemoryOffice', { mode: 'advice', marks: [[0, 'tests'], [0, 'summary'], [0, 'notebook'], [1, 'box'], [1, 'record']] }, [
      say(0.2, "For agents, my tests point the same way. First, when the desk fills up, keep a summary, or the agent's own lines, instead of clearing it. A notebook to search is a bonus on top, not a replacement.", ''),
      say(0, "Second, for facts you know will matter, a box with their name on it. And on some models, the day's record beside the form, to catch it when it's wrong.", '', undefined, { ...CONFIDENT, speed: 1.05 }),
    ]),
    anim('close', 'MemoryMap', {}, [
      say(0.2, 'Every agent forgets. The question is what it forgets, and whether anything notices. Which of these would your agent lose first?', ''),
    ]),
    outro('outro', [say(0.15, 'More at javieraguilar.ai.', '', { en: 'More at javier aguilar dot A I.' })]),
  ]),
});

export const VIDEOS = videos(build);
/** The English main cut. */
export const TIMELINE = VIDEOS.en.main;
