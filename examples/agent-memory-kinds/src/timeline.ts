// How an AI agent forgets — concept explainer (EN). Narration from script.md v3 as written (15
// rows); every claim traced in factcheck.md. On screen, the only figures are "0/24" and "24/24"
// (scene "margin") plus the "SHELF 0" labels.
// One world throughout: a small robot running a warehouse, the red slip "SHELF 0: EMPTY", and an
// office whose objects are the kinds of memory. The same slip is followed into each object:
// - MemoryOffice (1, 4, 13, 14): the whole office: cold open, the layers, the verdict, the advice;
// - WarehouseShelves (2-3): the test; the slip arrives, hours pass;
// - HeadShelf (5): the bookshelf in its head (training); the slip bounces off the closed doors;
// - MemoryDesk (6-7): the desk (working memory) overflows; the summary notecard keeps the slip;
// - FilingCabinet (8-9): the searchable notebook; searches never turn the slip up;
// - ClipboardForm (10-12): fixed boxes; the margin note erased (0/24), its own box (24/24), and a
//   confident wrong value.
// Marks are [line, word]: resolved to scene seconds from the TTS word timestamps (marks.ts);
// before TTS, and with Kokoro (no word timestamps), they are estimated from the text.
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

const build = (): Cuts => ({
  main: finish([
    intro('hook', [say(0.1, 'An AI agent forgets the way you do. It just has more places to do it in.', '')], 3, {
      name: 'MemoryOffice',
      props: { mode: 'cold' },
    }),
    anim('warehouse', 'WarehouseShelves', { mode: 'day', marks: [[1, 'told'], [1, 'empty']] }, [
      say(0.3, 'Here is my test. An agent runs a warehouse all day.', ''),
      say(0, "Halfway through, it's told that shelf 0 is actually empty.", ''),
    ]),
    anim('later', 'WarehouseShelves', { mode: 'later', marks: [[0, 'hours'], [0, 'still']] }, [say(0.2, 'Hours later, does it still know?', '', undefined, { emotion: 'curious' })], {
      min: 3.6,
    }),
    anim('layers', 'MemoryOffice', { mode: 'layers', marks: [[0, 'message'], [1, 'layers'], [1, 'bit'], [1, 'each'], [1, 'way']] }, [
      say(0.2, 'That depends on where it keeps the message.', ''),
      say(0, 'Its memory has layers, a bit like yours, and each one fails in its own way.', ''),
    ]),
    anim('training', 'HeadShelf', { marks: [[0, 'training'], [0, 'school'], [1, 'message'], [1, 'there'], [2, 'lands']] }, [
      say(0.3, 'Its oldest layer is its training, like school.', ''),
      say(0, "Today's message can't go there.", ''),
      say(0, 'So it lands on the desk.', ''),
    ]),
    anim('desk', 'MemoryDesk', { mode: 'full', marks: [[0, 'desk'], [1, 'long'], [1, 'room'], [1, 'go']] }, [
      say(0.3, 'The desk is its working memory.', ''),
      say(0, 'On a long day, the desk runs out of room, and something has to go.', ''),
    ], { min: 8.8 }), // time to see the pages spill (and for the last cue, "to go.", to be read)
    anim('summary', 'MemoryDesk', { mode: 'summary', marks: [[0, 'squeeze'], [0, 'gist'], [0, 'meeting'], [0, 'without'], [1, 'kept']] }, [
      say(0.2, 'AI assistants like Claude Code squeeze the desk into a summary: the gist, like a meeting you remember without its words.', ''),
      say(0, 'In my test, the summary kept the message.', ''),
    ]),
    anim('notebook', 'FilingCabinet', { mode: 'file', marks: [[0, 'clear'], [1, 'nothing'], [2, 'search'], [2, 'know']] }, [
      say(0.3, 'Or clear the desk and keep only a notebook it can search.', ''),
      say(0, 'Nothing is lost.', ''),
      say(0, 'But a search only helps if you know what to look for.', ''),
    ]),
    anim('missed', 'FilingCabinet', { mode: 'miss', marks: [[0, 'clean'], [1, 'looked'], [1, 'never'], [1, 'message']] }, [
      say(0.2, 'Nothing on the clean desk said anything had changed.', ''),
      say(0, 'It looked up other things, and almost never found the message.', ''),
    ]),
    anim('form', 'ClipboardForm', { mode: 'replace', marks: [[0, 'form'], [0, 'boxes'], [0, 'shelf'], [1, 'new'], [1, 'replaces']] }, [
      say(0.2, 'Or use a form with fixed boxes, like what is on each shelf.', ''),
      say(0, 'The new value simply replaces the old one.', ''),
    ]),
    anim('margin', 'ClipboardForm', { mode: 'margin', marks: [[0, 'margin'], [0, 'erased'], [1, 'box'], [1, '24']] }, [
      say(0.2, 'But a fact with no box of its own gets scribbled in the margin, and erased.', ''),
      say(0, 'Give it a box, and one model kept it in all 24 runs.', ''),
    ]),
    anim('misremember', 'ClipboardForm', { mode: 'wrong', marks: [[0, 'misremembers'], [0, 'full'], [0, 'mistake'], [0, 'sure']] }, [
      say(0.2, 'And a form doesn\'t forget. It misremembers: write "full" by mistake, and the box looks just as sure.', '', undefined, { emotion: 'skeptical' }),
    ]),
    anim('verdict', 'MemoryOffice', { mode: 'verdict', marks: [[0, 'job'], [0, 'best'], [1, 'each'], [1, 'different']] }, [
      say(0.3, 'So for what happens on the job, there is no best memory.', '', undefined, { emotion: 'confident' }),
      say(0, 'Each one forgets something different.', '', undefined, { emotion: 'confident' }),
    ]),
    anim(
      'advice',
      'MemoryOffice',
      { mode: 'advice', marks: [[0, 'people'], [0, 'gist'], [0, 'notebook'], [0, 'box'], [0, 'matter']] },
      [say(0.2, 'Like people, use more than one: the gist in front of you, the notebook behind it, and a box for what you know will matter.', '', undefined, { emotion: 'confident', speed: 1.05 })],
      { min: 10 },
    ),
    outro('outro', [say(0.15, 'More at javieraguilar.ai.', '', { en: 'More at javier aguilar dot A I.' })]),
  ]),
});

export const VIDEOS = videos(build);
/** The English main cut. */
export const TIMELINE = VIDEOS.en.main;
