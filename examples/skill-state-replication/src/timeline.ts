// Explicit State Doesn't Forget. It Misremembers. — article video (EN). Narration from script.md
// v1.0 as written (lines 1-20); every figure traced in factcheck.md. Only the corrected numbers
// (70 of 72 vs 10 of 72, 5.2x) appear.
// Structure: a question card at the top (QuestionCard, drawn above the scene transitions in
// Video.tsx) says what each part asks and gets the part's answer stamped on it. Under it:
// - ScrollVsNotepad (1-5, 10-11, 17-19): the scroll (transcript) and the notepad (explicit state)
//   over a warehouse rack: hook, story, the correction, the insurance, the verdict and the advice;
// - CacheBill (6-7): prompt size, tokens vs bill, and the prompt order;
// - HorizonLines (8-9): accuracy against the horizon, Claude Haiku then Gemini;
// - CorrectionGrid (12): 70 of 72 vs 10 of 72, per model;
// - BeliefVsShelf (13-16): Haiku's ranking, the belief drifting from the shelves, the step-132 slip.
// Marks are [line, word]: resolved to scene seconds from the TTS word timestamps (marks.ts).
import type { Cuts, Scene } from './types.ts';
import { anim, outro, say, videos, voice } from './narrate.ts';
import { WORDS } from './audio.generated.ts';
import { resolveMark, type MarkSpec } from './marks.ts';
import type { CardSpec, StampTone } from './anim/QuestionCard.state.ts';

type CardIn = { q: string; stamp?: { text: string; at: MarkSpec; after?: number; tone?: StampTone } };

/** Marks resolved to scene seconds, the layout that makes same-component scenes blend, the card. */
const finish = (scenes: Scene[]): Scene[] => {
  const words = WORDS[voice()];
  return scenes.map((s) => {
    if (s.kind !== 'anim' || !s.anim) return s;
    const props = { ...s.anim.props };
    props.layout = s.anim.name;
    if (Array.isArray(props.marks)) props.marks = (props.marks as MarkSpec[]).map((m) => resolveMark(s.lines, m, words, voice()));
    const card = props.card as CardIn | undefined;
    if (card) {
      const out: CardSpec = { q: card.q };
      if (card.stamp) {
        const at = resolveMark(s.lines, card.stamp.at, words, voice()) + (card.stamp.after ?? 0);
        out.stamp = { text: card.stamp.text, at: +at.toFixed(3), tone: card.stamp.tone ?? 'ok' };
      }
      props.card = out;
    }
    return { ...s, anim: { ...s.anim, props } };
  });
};

/** Tail of a scene that blends into the same picture. */
const BLEND_TAIL = 0.6;

export const Q1 = 'Cheaper?';
export const Q2 = 'More accurate?';
export const Q3 = 'When facts change?';
export const Q4 = 'Claude Haiku 4.5 · Where does it break?';

const build = (): Cuts => ({
  main: finish([
    // 1. Cold open: the notepad says lot B2, the shelf holds lot A7.
    anim(
      'hook',
      'ScrollVsNotepad',
      { mode: 'hook', marks: [[0, 'notepad'], [0, 'forgetting'], [0, 'misremembering']] },
      [say(0.4, 'Give an agent a notepad instead of a memory. It stops forgetting. It starts misremembering.', '')],
      { tail: 1.0 },
    ),
    // 2-4. The story: the growing transcript, the notepad that replaces it, the two promises.
    anim(
      'scroll',
      'ScrollVsNotepad',
      { mode: 'scroll', marks: [[0, 'reread'], [0, 'growing']] },
      [say(0.3, 'Agents usually reread their whole conversation at every step, and it keeps growing.', '')],
      // A full hold: the closing cue needs its time on screen.
      { tail: 1.0 },
    ),
    anim(
      'notepad',
      'ScrollVsNotepad',
      { mode: 'notepad', marks: [[0, 'skill'], [0, 'notepad'], [0, 'rewritten']] },
      [
        say(0.2, 'A paper called SKILL.state swaps that for a small notepad of current facts, rewritten each step.', '', {
          en: 'A paper called skill dot state swaps that for a small notepad of current facts, rewritten each step.',
        }),
      ],
      { tail: 1.0 },
    ),
    anim(
      'promises',
      'ScrollVsNotepad',
      { mode: 'promises', marks: [[0, 'steadier'], [0, 'smaller'], [1, 'rebuilt']] },
      [say(0.2, 'It promises steadier accuracy and a far smaller prompt.', ''), say(0, 'I rebuilt their test to check.', '')],
      { tail: 1.0 },
    ),
    // 5. The test.
    anim(
      'warehouse',
      'ScrollVsNotepad',
      { mode: 'warehouse', marks: [[0, 'warehouse'], [0, 'filing'], [0, 'two']] },
      [say(0.2, 'My test is a warehouse agent filing pallets, for up to two hundred steps.', '')],
      // Hold the four ways to remember long enough to read them.
      { min: 7.2 },
    ),
    // 6-7. Cheaper? Tokens vs the bill, then the prompt order.
    anim(
      'bill',
      'CacheBill',
      {
        mode: 'bill',
        marks: [[0, 'tokens'], [0, 'seven'], [1, 'changing'], [1, 'caching'], [1, 'bill'], [1, 'one']],
        card: { q: Q1 },
      },
      // Voiced in two parts so the caption cues stay readable (same words as the script).
      [
        say(0.3, "In tokens it's 7.5x cheaper.", '', { en: "In tokens it's seven and a half times cheaper." }),
        say(0, 'But a changing notepad breaks caching, and my bill said only 1.4x.', '', {
          en: 'But a changing notepad breaks caching, and my bill said only one point four times.',
        }),
      ],
      { tail: 1.2 },
    ),
    anim(
      'order',
      'CacheBill',
      {
        mode: 'order',
        marks: [[0, 'both'], [0, 'first'], [0, 'template'], [1, 'five']],
        card: { q: Q1, stamp: { text: 'less than it looks', at: [1, 'more'], after: 0.3, tone: 'warm' } },
      },
      // Voiced in two parts so the first caption cue reads in time (same words as the script; one
      // voicing read it at 17.5-18.5 chars/s). The first part ends on a full stop in the voice.
      [
        say(0.3, "Keeping both, with the notepad first as in the paper's template,", '', {
          en: "Keeping both, with the notepad first as in the paper's template.",
        }),
        say(0, 'costs 5.2x more.', '', { en: 'costs five point two times more.' }),
      ],
      { tail: 1.6 },
    ),
    // 8-9. More accurate? Claude, then the paper's own model.
    anim(
      'claude',
      'HorizonLines',
      { mode: 'claude', marks: [[0, 'claude'], [0, 'neither'], [0, 'gemini'], [0, 'setup']], card: { q: Q2 } },
      [say(0.3, "On Claude, long tasks hurt neither. So I ran the paper's own model, Gemini, in their setup.", '')],
      { tail: 1.2 },
    ),
    anim(
      'gemini',
      'HorizonLines',
      {
        mode: 'gemini',
        marks: [[0, 'never'], [1, 'transcript'], [1, 'slipped'], [1, 'paper']],
        card: { q: Q2, stamp: { text: 'yes, on their model', at: [1, 'reports'], after: 0.3, tone: 'ok' } },
      },
      [say(0.3, 'The notepad never missed in 75 episodes.', ''), say(0, 'The transcript slipped, less than the paper reports.', '')],
      { tail: 1.6 },
    ),
    // 10-11. When facts change: the correction.
    anim(
      'correction',
      'ScrollVsNotepad',
      {
        mode: 'correction',
        marks: [[0, 'fact'], [0, 'pallet'], [0, 'away'], [1, 'record'], [1, 'correction'], [1, 'reconcile']],
        card: { q: Q3 },
      },
      [
        say(0.3, 'It clearly wins when a fact stops being true, like a pallet never actually put away.', ''),
        say(0, 'The transcript holds the record and its correction, and must reconcile them each time.', ''),
      ],
      { tail: 1.2 },
    ),
    // 12. The headline count.
    anim(
      'grid',
      'CorrectionGrid',
      {
        marks: [[0, 'notepad'], [0, '70'], [1, 'transcript'], [1, '10']],
        card: { q: Q3, stamp: { text: 'yes', at: [1, '10'], after: 0.4, tone: 'ok' } },
      },
      [say(0.3, 'Across three models, the notepad applied the correction in 70 of 72 episodes.', ''), say(0, 'The transcript, in 10.', '')],
      { tail: 2.0 },
    ),
    // 13-16. Where does it break? Haiku's ranking, then the replay.
    anim(
      'haiku',
      'BeliefVsShelf',
      { mode: 'rank', marks: [[0, 'haiku'], [0, 'notepad'], [0, 'last']], card: { q: Q4 } },
      [say(0.3, 'Yet on Claude Haiku, in the same setup, the notepad came last.', '')],
      { tail: 1.4 },
    ),
    anim(
      'drift',
      'BeliefVsShelf',
      { mode: 'drift', marks: [[0, 'replaying'], [0, 'correct'], [0, 'wrong']], card: { q: Q4 } },
      [say(0.2, 'Replaying every step, each failure began with a correct move written down wrong.', '')],
      { tail: 1.2 },
    ),
    anim(
      'slip',
      'BeliefVsShelf',
      { mode: 'slip', marks: [[0, 'moved'], [0, 'seven'], [0, 'noted'], [0, 'six'], [0, 'shipped'], [0, 'belief']], card: { q: Q4 } },
      [say(0.2, "It moved shelf seven to three, but noted shelf six's contents, then shipped on that belief.", '')],
      { tail: 1.6 },
    ),
    anim(
      'check',
      'BeliefVsShelf',
      {
        mode: 'check',
        marks: [[0, 'nothing'], [0, 'write'], [1, 'haiku'], [1, '17']],
        card: { q: Q4, stamp: { text: 'the write', at: [0, 'write'], after: 0.3, tone: 'bad' } },
      },
      [say(0.2, 'Nothing checks that write.', ''), say(0, 'Haiku did it in 17 of 24 long runs.', '')],
      { tail: 1.8 },
    ),
    // 17. The transcript as insurance (Haiku).
    anim(
      'insurance',
      'ScrollVsNotepad',
      { mode: 'insurance', marks: [[0, 'haiku'], [0, 'transcript'], [0, 'absorbed'], [0, 'mattered']], card: { q: Q4 } },
      [say(0.3, 'On Haiku, keeping the transcript beside the notepad absorbed every slip that mattered.', '')],
      { tail: 1.6 },
    ),
    // 18-19. The verdict and the advice.
    anim(
      'verdict',
      'ScrollVsNotepad',
      { mode: 'verdict', marks: [[0, 'works'], [0, 'best'], [0, 'forget'], [0, 'some'], [0, 'misremembers']] },
      [say(0.4, "So the notepad works, best when facts change. It doesn't forget. On some models, it misremembers.", '')],
      { tail: 1.4 },
    ),
    anim(
      'advice',
      'ScrollVsNotepad',
      { mode: 'advice', marks: [[0, 'check'], [0, 'action'], [1, 'last']] },
      // Voiced in two parts so the caption cues stay readable; the first part ends on a full stop
      // in the voice (a comma there could rise like a question), the caption keeps the comma.
      [
        say(0.2, 'Check each write against what the action did,', '', { en: 'Check each write against what the action did.' }),
        say(0, 'and keep the notepad last in the prompt.', ''),
      ],
      { tail: 2.0 },
    ),
    outro('outro', [say(0.15, 'More at javieraguilar.ai', '', { en: 'More at javier aguilar dot A I.' })]),
  ]),
});

export const VIDEOS = videos(build);
/** The English main cut. */
export const TIMELINE = VIDEOS.en.main;
