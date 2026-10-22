// Bad Code Doesn't Hurt an Agent. Until the Repository Is Large. — article video (EN).
// Narration exactly as script.md (v1.0); every figure traced in factcheck.md (tables as corrected
// in PR #167; nothing from the old mislabelled tables).
// Structure: a question card at the top says what each part asks (QuestionCard, drawn above the
// scene transitions in Video.tsx) and gets the part's answer stamped on it. Under it:
// - CodeDegrader: the hook, the story (habits made for human readers), the bet and its balance,
//   the method (code card + file tree under "tests: identical"), the planted bug and 2,929 runs,
//   and the flipped bet;
// - RepoResult: the small library (98% -> 93%), the large one (54% -> 24%), the two families, and
//   the habits given back to destroyed code (readable names 97% over the 83% baseline);
// - TurnBudget: the mechanism, 40 turns per run (6 on the small library, 30 -> 40 on the large),
//   the margin, and the verdict (only sometimes, then a checklist of what helps).
// Marks are [line, word]: resolved to scene seconds from the TTS word timestamps (marks.ts).
import type { Cuts, Scene } from './types.ts';
import { anim, outro, say, videos, voice } from './narrate.ts';
import { WORDS } from './audio.generated.ts';
import { resolveMark, type MarkSpec } from './marks.ts';
import type { CardSpec, StampTone } from './anim/QuestionCard.state.ts';

type CardIn = { q: string; stamp?: { text: string; at: MarkSpec; after?: number; tone?: StampTone } };

/**
 * Marks resolved to scene seconds, the question card with its stamp time resolved, and the layout
 * that decides which consecutive scenes blend instead of dipping (same component and same
 * `layout`; a scene without one gets its own id, so it dips).
 */
const finish = (scenes: Scene[]): Scene[] => {
  const words = WORDS[voice()];
  return scenes.map((s) => {
    if (s.kind !== 'anim' || !s.anim) return s;
    const props = { ...s.anim.props };
    props.layout = (props.layout as string | undefined) ?? s.id;
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

export const Q_BET = 'My bet · what helps an agent most?';
export const Q_SMALL = 'Small library · self-contained files';
export const Q_LARGE = 'Large library · interconnected code';
export const Q_WHY = 'Why? · it pays in turns';
export const Q_HABIT = 'Which habit?';
export const Q_VERDICT = 'Verdict · does clean code matter?';

const build = (): Cuts => ({
  main: finish([
    // 1-2. Hook: the code scrambles and the agent still fixes it; then a wall of linked files, stuck.
    anim(
      'hook',
      'CodeDegrader',
      { mode: 'hook', marks: [[0, 'bad'], [1, 'large']] },
      [say(0.3, "Bad code doesn't hurt an agent.", ''), say(0, 'Until the repository is large.', '')],
      // Hold the STUCK stamp before the dip.
      { tail: 2.0 },
    ),
    // 3-4. Story: habits made for human readers; now an agent reads, and nobody measured which help it.
    anim(
      'story',
      'CodeDegrader',
      { mode: 'habits', marks: [[0, 'habits'], [0, 'human'], [1, 'agents'], [1, 'which']] },
      [
        say(0.2, 'Clean-code habits were made for human readers.', ''),
        say(0, "Now agents do more and more of the reading, and I couldn't find a measurement of which habits help them.", ''),
      ],
      { tail: 1.2 },
    ),
    // 5-6. The bet: the agent holds the page, not the repository; the balance tips to WHERE TO LOOK.
    anim(
      'bet',
      'CodeDegrader',
      {
        mode: 'bet',
        marks: [[0, 'reads'], [0, 'whole'], [1, 'where']],
        card: { q: Q_BET, stamp: { text: 'where to look', at: [1, 'written'], after: 0.3, tone: 'warm' } },
      },
      [
        say(0.3, "My bet. An agent reads text well, but doesn't hold the whole repository in its head.", ''),
        // Voiced a touch slower (Cartesia speed tag): at speed 1 its caption ran at 17.4 chars/s.
        say(0, 'So knowing where to look should matter more than how well each file is written.', '', {
          en: '<speed ratio="0.92"/>So knowing where to look should matter more than how well each file is written.',
        }),
      ],
      { tail: 1.3 },
    ),
    // 7-8. Method: same program, tests identical; nine kinds of damage in two families.
    anim(
      'method',
      'CodeDegrader',
      { mode: 'method', layout: 'cards', marks: [[0, 'damaged'], [0, 'without'], [1, 'nine'], [1, 'written'], [1, 'look']] },
      [say(0.2, 'To test it, I damaged working code without changing what it does.', ''), // A slightly longer pause before line 2 keeps the previous closing cue up long enough to read.
        say(4.55, "Nine kinds of damage, in two families. How it's written, and where to look.", '')],
      { tail: 1.2 },
    ),
    // 9. The task and the size of the test.
    anim(
      'task',
      'CodeDegrader',
      { mode: 'task', layout: 'cards', marks: [[0, 'planted'], [0, 'fix'], [0, 'two']] },
      [say(0.2, 'Then I planted bugs for an agent to fix. 2,929 runs in all.', '', { en: 'Then I planted bugs for an agent to fix. Two thousand, nine hundred and twenty-nine runs in all.' })],
      { tail: 1.6 },
    ),
    // 10-11. Small library: nothing measurable.
    anim(
      'small',
      'RepoResult',
      {
        mode: 'small',
        marks: [[0, 'small'], [1, '98'], [1, '93']],
        card: { q: Q_SMALL, stamp: { text: 'within noise', at: [1, '93'], after: 1.5, tone: 'muted' } },
      },
      [say(0.3, 'On a small library of self-contained files, nothing measurable happens.', ''), say(0, 'Even fully degraded, the strong model only goes from 98% to 93%.', '')],
      // The weaker model's pair and the n.s. tags land after the voice: hold them.
      { tail: 2.6 },
    ),
    // 12-13. Large library: 54% -> 24%.
    anim(
      'large',
      'RepoResult',
      {
        mode: 'large',
        layout: 'large',
        marks: [[0, 'large'], [0, 'several'], [1, '54'], [1, '24']],
        card: { q: Q_LARGE, stamp: { text: 'halved', at: [1, '24'], after: 0.6, tone: 'bad' } },
      },
      [say(0.3, 'Then a large library, where every fix means understanding several pieces at once.', ''), say(0, 'Degrade everything, and the agent goes from solving 54% to 24%.', '')],
      { tail: BLEND_TAIL + 0.6 },
    ),
    // 14. The two families.
    anim(
      'families',
      'RepoResult',
      { mode: 'split', layout: 'large', marks: [[0, 'text'], [0, 'hiding']], card: { q: Q_LARGE } },
      [say(0.3, "Dirtying only the text costs almost as much. Hiding where to look, alone, I can't tell from noise.", '')],
      { tail: 1.6 },
    ),
    // 15. The bet was backwards.
    anim(
      'flip',
      'CodeDegrader',
      { mode: 'flip', marks: [[0, 'backwards'], [0, 'search']], card: { q: Q_BET, stamp: { text: 'backwards', at: [0, 'backwards'], after: 0.2, tone: 'bad' } } },
      [say(0.3, 'So my bet was backwards. Likely, finding files the agent already solves with search.', '')],
      { tail: 1.4 },
    ),
    // 16-19. The mechanism: turns.
    anim(
      'turns',
      'TurnBudget',
      { mode: 'track', marks: [[0, 'line'], [0, 'turns'], [1, '40']], card: { q: Q_WHY } },
      [say(0.3, 'Unreadable code it pays for line by line, in turns.', ''), say(0, 'Each run had 40.', '')],
      { tail: 1.3 },
    ),
    anim(
      'turns-small',
      'TurnBudget',
      { mode: 'small', layout: 'budget', marks: [[0, '6']], card: { q: Q_WHY } },
      [say(0.3, 'On the small library, the strong model needs 6.', '')],
      { tail: BLEND_TAIL + 0.6 },
    ),
    anim(
      'turns-large',
      'TurnBudget',
      { mode: 'large', layout: 'budget', marks: [[0, '30'], [1, 'pushes'], [1, '40'], [1, 'runs']], card: { q: Q_WHY } },
      [say(0.2, 'On the large one it already needs 30.', ''), say(0, 'The damage pushes it to 40, and it runs out.', '')],
      { tail: BLEND_TAIL + 0.8 },
    ),
    anim(
      'margin',
      'TurnBudget',
      { mode: 'margin', layout: 'budget', marks: [[0, 'margin']], card: { q: Q_WHY } },
      [say(0.2, 'The real question is how much margin it has left.', '')],
      { tail: 1.6 },
    ),
    // 20. Readable names, given back.
    anim(
      'names',
      'RepoResult',
      { mode: 'names', marks: [[0, 'names'], [0, '97'], [0, '83']], card: { q: Q_HABIT, stamp: { text: 'names', at: [0, '97'], after: 0.3, tone: 'ok' } } },
      [say(0.3, 'One habit stood out. Readable names, given back to destroyed code, brought it to 97%, above the 83% baseline.', '')],
      { tail: 1.8 },
    ),
    // 21-24. Verdict: only sometimes; then, plainly, what helps (a checklist built item by item).
    anim(
      'verdict',
      'TurnBudget',
      { mode: 'verdict', marks: [[0, 'only'], [1, 'what'], [1, 'names'], [2, 'clearly'], [3, 'folders'], [3, 'searching']], card: { q: Q_VERDICT } },
      [
        say(0.3, 'So does clean code matter to an agent? Only sometimes.', ''),
        say(0.2, 'What does help? First, readable names.', ''),
        say(0, 'Then, in large code with little margin, clearly written code.', ''),
        say(0, 'Tidy folders matter less. The agent likely finds files by searching.', ''),
      ],
      { tail: 2.4 },
    ),
    outro('outro', [say(0.15, 'More at javieraguilar.ai', '', { en: 'More at javier aguilar dot A I.' })]),
  ]),
});

export const VIDEOS = videos(build);
/** The English main cut. */
export const TIMELINE = VIDEOS.en.main;
