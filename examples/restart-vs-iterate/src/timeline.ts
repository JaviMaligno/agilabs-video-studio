// Let the Loop Iterate — article video (EN). Narration from the approved script (script.md).
// Structure: a question card at the top says what each part asks (QuestionCard, drawn above the
// scene transitions in Video.tsx): "Start over?" → "Same budget. What changes?" → "Who won?" →
// "Who knew what to throw away?" → the verdict card. Under it:
// - CodeTower (scenes 1-11): the agent's working tree as a tower of code blocks over a test strip;
//   the loop, the rules, three lanes (iterate, restart, button), then the lanes become bars;
// - ScalpelVsWreckingBall (12-16): the strong model's scoped restarts vs the weak one's wipe-outs;
// - VerdictCard (17-19).
// Marks are [line, word]: resolved to scene seconds from the TTS word timestamps (marks.ts).
import type { Cuts, Scene } from './types.ts';
import { anim, outro, say, videos, voice } from './narrate.ts';
import { WORDS } from './audio.generated.ts';
import { resolveMark, type MarkSpec } from './marks.ts';
import type { CardSpec, StampTone } from './anim/QuestionCard.state.ts';

type CardIn = { q: string; stamp?: { text: string; at: MarkSpec; after?: number; tone?: StampTone } };

/** Layout per scene (consecutive scenes on the same layout blend instead of dipping), marks and card stamps resolved. */
const finish = (scenes: Scene[]): Scene[] => {
  const words = WORDS[voice()];
  return scenes.map((s) => {
    if (s.kind !== 'anim' || !s.anim) return s;
    const props = { ...s.anim.props };
    const name = s.anim.name;
    const mode = String(props.mode ?? '');
    props.layout = name === 'CodeTower' ? (mode === 'hook' || mode === 'quote' ? 'single' : mode) : name;
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

const Q1 = 'Start over?';
const Q2 = 'Same budget. What changes?';
const Q3 = 'Who won?';
const Q4 = 'Who knew what to throw away?';

const build = (): Cuts => ({
  main: finish([
    // 1. Cold open: the agent patches, the patch fails, the tower wobbles; the button appears.
    anim(
      'hook',
      'CodeTower',
      { mode: 'hook', marks: [[0, 'stuck'], [0, 'start']], card: { q: Q1 } },
      [say(0.3, 'Your coding agent is stuck. Should it start over?', '')],
      { min: 4.2, tail: BLEND_TAIL },
    ),
    // 2. The folklore: on "restart" the button is pressed and the tower is rebuilt.
    anim(
      'quote',
      'CodeTower',
      { mode: 'quote', marks: [[0, 'let'], [0, 'restart']], card: { q: Q1 } },
      [say(0.15, 'Andrej Karpathy put it as: let the loop restart.', '')],
      { tail: 1.4 },
    ),
    // 3. The harness: write → test → feedback.
    anim(
      'loop',
      'CodeTower',
      { mode: 'loop', marks: [[0, 'loop'], [0, 'write'], [0, 'tests'], [0, 'again']], card: { q: Q1 } },
      [say(0.2, 'I built a loop on real code: write a feature, see the tests, try again.', '')],
      { tail: 0.7 },
    ),
    // 4. Key card: what is tested. Same budget; only what happens between rounds changes.
    anim(
      'rules',
      'CodeTower',
      { mode: 'rules', marks: [[0, 'four'], [0, 'budget'], [1, 'between']], card: { q: Q2 } },
      [say(0.3, 'Four rounds, same budget.', ''), say(0, 'All I changed was what happens in between.', '')],
      { tail: 0.8 },
    ),
    // 5. Lane 1, iterate: one real run, failing 4 → 1 → 0.
    anim(
      'iterate',
      'CodeTower',
      { mode: 'lanes', lane: 1, marks: [[0, 'keep'], [0, 'failures'], [0, 'patch']], card: { q: Q2 } },
      [say(0.25, 'Iterate: keep the code, read the failures, and patch.', '')],
      { tail: 1.0 },
    ),
    // 6. Lane 2, restart: same feature, failing 3 → 3 → 4 → 3.
    anim(
      'restart',
      'CodeTower',
      { mode: 'lanes', lane: 2, marks: [[0, 'wipe'], [0, 'clean'], [0, 'round']], card: { q: Q2 } },
      [say(0.2, 'Restart: wipe it all and start clean every round.', '')],
      { tail: 1.3 },
    ),
    // 7. Key card: the third arm, a restart button with a scope dial.
    anim(
      'button',
      'CodeTower',
      { mode: 'lanes', lane: 3, marks: [[0, 'button'], [0, 'picks'], [0, 'how'], [0, 'much'], [0, 'away']], card: { q: Q2 } },
      [say(0.2, 'Or a restart button: the agent picks when, and how much to throw away.', '')],
      { tail: 0.8 },
    ),
    // 8. Who won? Strong model: iterate 86% vs restart 69%.
    anim(
      'won',
      'CodeTower',
      { mode: 'bars', step: 1, marks: [[0, 'won'], [0, 'eighty'], [0, 'sixty']], card: { q: Q3, stamp: { text: 'iterate', at: [0, 'won'], after: 0.15 } } },
      [
        say(0.3, 'Iterating won. My stronger model solved 86% of features; clean restarts, 69%.', '', {
          en: 'Iterating won. My stronger model solved eighty-six percent of features; clean restarts, sixty-nine.',
        }),
      ],
      { tail: 0.8 },
    ),
    // 9. The weak model leans the same way.
    anim(
      'weakbars',
      'CodeTower',
      { mode: 'bars', step: 2, marks: [[0, 'weaker'], [0, 'same']], card: { q: Q3 } },
      [say(0.1, 'The weaker model leaned the same way.', '')],
      { tail: BLEND_TAIL },
    ),
    // 10. The button: 91%, the strong model's best.
    anim(
      'best',
      'CodeTower',
      { mode: 'bars', step: 3, marks: [[0, 'ninety']], card: { q: Q3 } },
      [say(0.1, 'With the button, the strong model reached 91%, its best.', '', { en: 'With the button, the strong model reached ninety-one percent, its best.' })],
      { tail: BLEND_TAIL },
    ),
    // 11. ...but its edge over iterate is not significant.
    anim(
      'edge',
      'CodeTower',
      { mode: 'bars', step: 4, marks: [[0, 'edge']], card: { q: Q3 } },
      [say(0.1, "It didn't hurt, but its edge over iterating isn't proven.", '')],
      { tail: 0.9 },
    ),
    // 12. The turn: how each model used the button.
    anim('style', 'ScalpelVsWreckingBall', { mode: 'setup', card: { q: Q4 } }, [say(0.3, 'The difference: how each model used it.', '')], { tail: BLEND_TAIL }),
    // 13. Strong: 7 restarts, 5 one file.
    anim(
      'strong',
      'ScalpelVsWreckingBall',
      { mode: 'strong', marks: [[0, 'rarely'], [0, 'usually']], card: { q: Q4 } },
      [say(0.1, 'The strong one restarted rarely, and usually just one file.', '')],
      { tail: 0.8 },
    ),
    // 14. Its payoff: 0/4 under iterate, 3/4 with the button; n = 4, a hint.
    anim(
      'rescue',
      'ScalpelVsWreckingBall',
      { mode: 'strongPay', marks: [[0, 'four'], [0, 'never'], [0, 'rescued'], [1, 'hint']], card: { q: Q4 } },
      [
        say(0.1, 'On 4 features iterating never solved, it rescued 3.', '', { en: 'On four features iterating never solved, it rescued three.' }),
        say(0, 'A hint, not proof.', ''),
      ],
      { tail: BLEND_TAIL },
    ),
    // 15. Weak: 34 restarts, 23 everything; the wrecking ball.
    anim(
      'weak',
      'ScalpelVsWreckingBall',
      { mode: 'weak', marks: [[0, 'lot'], [0, 'mostly']], card: { q: Q4 } },
      [say(0.1, 'The weak one restarted a lot, and mostly wiped it all.', '')],
      { tail: 0.8 },
    ),
    // 16. Its payoff: 1/14 with the button, 2/14 under iterate: already lost; symptom, not cause.
    anim(
      'symptom',
      'ScalpelVsWreckingBall',
      { mode: 'weakPay', marks: [[0, 'iterating'], [0, 'nearly'], [1, 'wipe'], [1, 'symptom']], card: { q: Q4 } },
      [say(0.1, 'Iterating failed nearly all of those too:', ''), say(0, 'the wipe-outs were a symptom, not the cause.', '')],
      { tail: 0.9 },
    ),
    // 17-19. The verdict.
    anim(
      'verdict',
      'VerdictCard',
      { marks: [[0, 'keep'], [0, 'these']] },
      [
        say(0.3, 'The verdict, on these tasks: keep the code and iterate.', ''),
        say(0, 'Restart only if you know what to throw away.', ''),
        say(0, 'Here, only the stronger model knew.', ''),
      ],
      { tail: 1.0 },
    ),
    outro('outro', [say(0.15, 'More at javieraguilar.ai', '', { en: 'More at javier aguilar dot A I.' })]),
  ]),
});

export const VIDEOS = videos(build);
/** The English main cut. */
export const TIMELINE = VIDEOS.en.main;
