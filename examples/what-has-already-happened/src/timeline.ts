// Your Agent Doesn't Know What Has Already Happened — article video (EN). Narration from the
// approved script v1.0 (script.md); every figure traced in factcheck.md.
// Structure: a question card at the top says what each part asks (QuestionCard, drawn above the
// scene transitions in Video.tsx) and gets the part's answer stamped on it. Under it:
// - PlanBoard (1-6, 14-20): the plan board under a wall clock; the fact sheet slides over it in
//   the setup;
// - ScopeArrow (7-10): failure 1, the dependency the page denies;
// - ExpiredRule (11-13): failure 2, the reason that expired.
// Marks are [line, word]: resolved to scene seconds from the TTS word timestamps (marks.ts).
import type { Cuts, Scene } from './types.ts';
import { anim, outro, say, videos, voice } from './narrate.ts';
import { FPS, sceneStarts } from './timing.ts';
import { WORDS } from './audio.generated.ts';
import { resolveMark, type MarkSpec } from './marks.ts';
import type { CardSpec, StampTone } from './anim/QuestionCard.state.ts';

type CardIn = { q: string; stamp?: { text: string; at: MarkSpec; after?: number; tone?: StampTone } };

/**
 * The board's clock (`clock`: the video second the scene starts at), the layout that decides which
 * consecutive scenes blend instead of dipping (same component), marks resolved to scene seconds,
 * and the question card with its stamp time resolved.
 */
const finish = (scenes: Scene[]): Scene[] => {
  const { starts } = sceneStarts(scenes);
  const words = WORDS[voice()];
  return scenes.map((s, i) => {
    if (s.kind !== 'anim' || !s.anim) return s;
    const props = { ...s.anim.props };
    props.clock = +(starts[i] / FPS).toFixed(3);
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

export const Q0 = 'Does the date fix it?';
export const Q1 = 'Failure 1 · a dependency the page denies';
export const Q2 = 'Failure 2 · a reason that expired';
export const Q3 = 'Failure 3 · what has happened';
export const Q4 = 'So, is it the clock?';

const build = (): Cuts => ({
  main: finish([
    // 1. Cold open: the agent's plan on the board; the takes in DONE never happened.
    anim('hook', 'PlanBoard', { mode: 'hook', marks: [[0, 'never']] }, [say(0.5, 'My agents plan around work that never happened.', '')], { min: 4.4, tail: BLEND_TAIL }),
    // 2. The obvious suspect: the clock.
    anim(
      'clock',
      'PlanBoard',
      { mode: 'clock', marks: [[0, 'date']], card: { q: Q0 } },
      [say(0.3, 'The obvious fix is to tell them the date.', ''), say(0, 'I tested that.', '')],
      { tail: BLEND_TAIL },
    ),
    // 3-4. The material and the question.
    anim('sheet', 'PlanBoard', { mode: 'sheet', marks: [[0, 'page'], [0, 'real']], card: { q: Q0 } }, [say(0.2, 'Six models got one page of facts from my real project.', '')], {
      min: 4.2,
      tail: BLEND_TAIL,
    }),
    anim('ask', 'PlanBoard', { mode: 'ask', marks: [[0, 'asked']], card: { q: Q0 } }, [say(0.1, 'And I asked: in what order, and with what constraints?', '')], { tail: BLEND_TAIL }),
    // 5. The conditions A-E.
    anim(
      'conditions',
      'PlanBoard',
      { mode: 'conditions', marks: [[0, 'date'], [0, 'timings']], card: { q: Q0 } },
      [say(0.1, "Then I added a line: today's date, or what the timings really were.", '')],
      { min: 5.6, tail: BLEND_TAIL },
    ),
    // 6. The second domain, and the size of the test.
    anim('release', 'PlanBoard', { mode: 'release', marks: [[0, 'unrelated'], [0, 'release']], card: { q: Q0 } }, [say(0.3, 'Then all of it again, on an unrelated software release.', '')], {
      min: 5.2,
    }),
    // 7-8. Failure 1: the trap, and the exemption on the page.
    anim('trap', 'ScopeArrow', { mode: 'trap', marks: [[0, 'reuses']], card: { q: Q1 } }, [say(0.3, 'The trap: piece four reuses a calculation from piece three.', '')], { tail: BLEND_TAIL }),
    anim(
      'exempt',
      'ScopeArrow',
      { mode: 'exempt', marks: [[0, 'rewrite'], [1, 'no']], card: { q: Q1 } },
      [say(0.1, "But its script says: I'll rewrite them for you.", ''), say(0, 'No dependency.', '')],
      { tail: BLEND_TAIL },
    ),
    // 9. The result.
    anim(
      'models',
      'ScopeArrow',
      { mode: 'models', card: { q: Q1, stamp: { text: '5 / 6', at: [0, 'anyway'], after: 0.1, tone: 'bad' } } },
      [say(0.2, 'Five of six models put four after three anyway.', '')],
      { min: 4.2, tail: BLEND_TAIL },
    ),
    // 10. gpt-4o copies the exemption and ignores it.
    anim('quote', 'ScopeArrow', { mode: 'quote', marks: [[0, 'copied'], [0, 'ignored']], card: { q: Q1 } }, [
        // The caption splits at "answer," (captions.ts cuts a short last cue at the clause break).
        say(0.3, 'One even copied the exemption into its answer, then ignored it.', ''),
      ], {
      min: 5.3,
    }),
    // 11-13. Failure 2: the habit, its expired reason, and the bars.
    anim('rule', 'ExpiredRule', { mode: 'rule', marks: [[0, 'last'], [0, 'depends']], card: { q: Q2 } }, [say(0.3, 'Then a habit: shoot the intro last, since it depends on the rest.', '')], {
      // A full hold: the closing cue "on the rest." needs its time on screen.
      tail: 1.1,
    }),
    anim(
      'expired',
      'ExpiredRule',
      { mode: 'expired', marks: [[0, 'july'], [1, 'expired']], card: { q: Q2 } },
      [say(0.1, 'But the scripts were frozen in July.', ''), say(0, 'That reason had expired.', '')],
      { tail: BLEND_TAIL },
    ),
    anim(
      'better',
      'ExpiredRule',
      { mode: 'bars', marks: [[0, 'better']], card: { q: Q2, stamp: { text: 'no help', at: [0, 'help'], after: 0.1, tone: 'bad' } } },
      [say(0.5, "Being a better model didn't help here.", '')],
      { min: 4 },
    ),
    // 14-15. Failure 3: one model acts on the clarification; the rest repeat it.
    anim(
      'provenance',
      'PlanBoard',
      { mode: 'provenance', marks: [[0, 'rehearsals'], [1, 'one']], card: { q: Q3 } },
      [say(0.4, 'The timings were only rehearsals.', ''), say(0, 'When I said so, one model replanned.', '')],
      // Hold Opus's cleared plan and its numbers before the other five bring the ghosts back.
      { tail: 1.4 },
    ),
    anim(
      'repeat',
      'PlanBoard',
      { mode: 'repeat', marks: [[0, 'repeated'], [0, 'kept']], card: { q: Q3 } },
      [say(0.1, 'The rest mostly repeated it, and kept planning around those takes.', '')],
      { tail: 1.1 },
    ),
    // 16-18. The date, the prohibition, the verdict.
    anim(
      'date',
      'PlanBoard',
      { mode: 'date', marks: [[0, 'date'], [1, 'nothing']], card: { q: Q4 } },
      [say(0.3, 'And the date?', ''), say(0.4, 'It changed nothing, on any measure.', '')],
      { min: 5, tail: BLEND_TAIL },
    ),
    anim(
      'prohibit',
      'PlanBoard',
      { mode: 'prohibit', marks: [[0, 'told'], [0, 'ninety']], card: { q: Q4 } },
      [say(0.1, 'Told not to invent constraints, 96% still did.', '', { en: 'Told not to invent constraints, ninety-six percent still did.' })],
      { tail: BLEND_TAIL },
    ),
    anim(
      'verdict',
      'PlanBoard',
      { mode: 'verdict', marks: [[0, 'clock']], card: { q: Q4, stamp: { text: 'no', at: [0, 'clock'], after: 0.35, tone: 'warm' } } },
      [say(0.3, "So it isn't the clock.", '')],
      { min: 3.4, tail: BLEND_TAIL },
    ),
    // 19-20. What a calendar says, and where the rest lives.
    anim(
      'split',
      'PlanBoard',
      { mode: 'split', marks: [[0, 'calendar'], [0, 'now'], [0, 'which']], card: { q: Q4 } },
      [say(0.2, 'A calendar says when now is, not which facts are already settled.', '')],
      { min: 5.2, tail: BLEND_TAIL },
    ),
    anim(
      'rewrite',
      'PlanBoard',
      { mode: 'rewrite', marks: [[0, 'document'], [1, 'write'], [1, 'mean']], card: { q: Q4 } },
      [say(0.2, 'That lives in the document.', ''), say(0.2, 'Write the sentence you mean.', '')],
      { min: 5 },
    ),
    outro('outro', [say(0.15, 'More at javieraguilar.ai', '', { en: 'More at javier aguilar dot A I.' })]),
  ]),
});

export const VIDEOS = videos(build);
/** The English main cut. */
export const TIMELINE = VIDEOS.en.main;
