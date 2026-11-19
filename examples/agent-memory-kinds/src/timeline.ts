// How an AI agent forgets — the vertical reel (EN). Narration from script.md v5, rows 1-9, verbatim;
// every claim traced in factcheck.md. No figures on screen.
// One everyday example, the same as the long version: a trip-planning chat where "my flight is
// Friday, not Thursday" got a "Got it!" and an hour later the hotel was booked for Thursday. The
// red slip "FLIGHT: FRIDAY" travels through every memory. One line per row, except rows 4, 6, 7
// and 8: each has two visual beats, so it is split into two scenes at a sentence boundary.
// Marks are [line, word]: resolved to scene seconds from the TTS word timestamps (marks.ts);
// before TTS they are estimated from the text.
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
    // 1 · Cold open: the wrong booking is already there, pulsing red, on frame 0.
    intro(
      'cold',
      [say(0.1, 'You told your AI the plan changed. It said "got it". An hour later, it booked the old plan.', '')],
      3,
      { name: 'ChatTrip', props: { mode: 'wrong', marks: [[0, 'told'], [0, 'got'], [0, 'booked']] } },
    ),
    // 2 · The robot with the slip; the memories around it, unnamed.
    anim(
      'map',
      'MemoryMap',
      {
        mode: 'reveal',
        labels: false,
        question: false,
        marks: [[0, 'few'], [0, 'places'], [0, 'remember'], [0, 'each'], [0, 'forgets'], [0, 'own']],
      },
      [say(0.2, "It didn't ignore you. It forgot. Your AI has a few places to remember things, and each one forgets in its own way.", '')],
    ),
    // 3 · Training: the slip bounces off the closed bookshelf.
    anim(
      'training',
      'HeadShelf',
      { short: true, marks: [[0, 'learned'], [0, 'learned'], [0, 'correction'], [0, 'has'], [0, 'somewhere'], [0, 'frozen'], [0, 'training']] },
      [say(0.3, 'What it learned in training is frozen. Your correction has to go somewhere else.', '')],
    ),
    // 4 · The desk: buried; then a new chat, a clean desk.
    anim(
      'desk',
      'MemoryDesk',
      { mode: 'crowded', short: true, marks: [[0, 'long'], [0, 'long'], [0, 'long'], [0, 'hotels'], [0, 'desk']] },
      [say(0.3, 'First, the desk: the chat it can see. In a long chat, "Friday" can get buried under hotels and prices.', '')],
    ),
    anim('fresh', 'MemoryDesk', { mode: 'wiped', marks: [[0, 'new'], [0, 'clean'], [0, 'unless']] }, [
      say(0.2, 'And a new chat starts with a clean desk, unless something was saved to memory.', ''),
    ]),
    // 5 · The summary: a good one keeps "Friday", a weaker one drops it.
    anim('summary', 'MemoryDesk', { mode: 'squeeze', marks: [[0, 'writes'], [0, 'keeps'], [0, 'weaker'], [0, 'drop']] }, [
      say(0.3, 'When the desk fills up, it writes a summary and throws the pages away. A good summary keeps "Friday". A weaker one can drop it.', ''),
    ]),
    // 6 · The notebook: "Sounds safest, right?" (the cabinet glows, a "?" over the magnifier); then
    //     the searches for hotels and prices, never for the change of plan.
    anim(
      'notebook',
      'FilingCabinet',
      { mode: 'file', short: true, marks: [[0, 'files'], [0, 'safest'], [0, 'keyword'], [0, 'Sounds'], [0, 'files'], [0, 'did']] },
      [say(0.3, 'Or it files the whole chat away and looks things up by keyword. Sounds safest, right? In my tests with AI agents, it did the worst.', '')],
    ),
    anim('search', 'FilingCabinet', { mode: 'miss', short: true, marks: [[0, 'searched'], [0, 'searched'], [0, 'never'], [0, 'change']] }, [
      say(0.2, "It searched for hotels and prices, and almost never for a change of plan it didn't know about.", ''),
    ]),
    // 7 · The form: "Friday" replaces "Thursday" in its box; a fact with no box is wiped.
    anim(
      'form',
      'ClipboardForm',
      { mode: 'replace', marks: [[0, 'keeps'], [0, 'boxes'], [0, 'flight'], [0, 'Friday'], [0, 'replaces'], [0, 'and']] },
      [say(0.3, 'Or it keeps a few named boxes: flight, hotel. "Friday" replaces "Thursday" and stays.', '')],
    ),
    anim('nobox', 'ClipboardForm', { mode: 'margin', short: true, marks: [[0, 'fact'], [0, 'lost']] }, [say(0.2, 'But a fact with no box gets lost.', '')], {
      min: 3.6,
    }),
    // 8 · Like you; then "ask it to save it".
    anim('human', 'MemoryOffice', { mode: 'human', marks: [[0, 'head'], [0, 'email'], [0, 'fridge']] }, [
      say(0.2, 'Like you: the gist in your head, your email to search, a note on the fridge.', ''),
    ]),
    anim('save', 'ChatTrip', { mode: 'save', marks: [[0, 'apps'], [0, 'matters'], [0, 'it'], [0, 'it']] }, [
      say(0.2, 'These apps often save to memory on their own, but when something matters, ask it to save it.', ''),
    ]),
    // 9 · Outro.
    outro('outro', [say(0.15, 'More at javieraguilar.ai.', '', { en: 'More at javier aguilar dot A I.' })]),
  ]),
});

export const VIDEOS = videos(build);
/** The English main cut. */
export const TIMELINE = VIDEOS.en.main;
