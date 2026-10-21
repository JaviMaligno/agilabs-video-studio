// A World Model Can Pass Every Test and Still Lose — article video (EN). Narration from the
// approved script (script.md). Prequel of the robot/door video (being-wrong-can-be-free): same
// dark stage, dashed sample rays, indigo reach glow, rose "model is wrong" overlay, corner chip.
// One vertical shaft (DepthWell) carries the story: depth = moves played, the rule lives on the
// floor. Script lines with two sentences are split so each beat of the animation has its own line.
import type { Cuts } from './types.ts';
import { L, anim, outro, say, videos } from './narrate.ts';

const TRUTH = L('truth', 'realidad');
const MODEL = L('model · rule left out', 'modelo · sin la regla');
/** Shorter hold after the last line where the next scene continues on the same shaft (blend). */
const BLEND = { tail: 0.55 };

const build = (): Cuts => ({
  main: [
    anim(
      'hook',
      'DepthWell',
      { mode: 'hook' },
      [
        say(0.15, 'An AI-written world model passed its check at 100%.', '', { en: 'An AI-written world model passed its check at a hundred percent.' }),
        say(0, 'It still lost.', ''),
      ],
      { tail: 1.6 },
    ),
    anim(
      'setup',
      'FlowDiagram',
      {
        layout: 'vertical',
        nodes: [
          { id: 'rules', label: 'game rules, in words' },
          { id: 'code', label: 'the rules, as code' },
          { id: 'plan', label: 'planner searches the code' },
        ],
        edges: [
          { from: 'rules', to: 'code', label: 'AI writes' },
          { from: 'code', to: 'plan', label: 'plays on' },
        ],
      },
      [say(0.2, "AI writes the game's rules as code.", ''), say(0, 'A planner searches that code.', '')],
    ),
    anim(
      'gate',
      'DepthWell',
      { mode: 'gate', chip: TRUTH, chipIn: true, stamp: { text: 'GATE · 100%', sub: 'next state · legal moves · outcome', beat: 1, delay: 1.75 } },
      [
        say(0.2, 'First, a check: replay random games.', ''),
        say(0, 'Every move must match: 100%.', '', { en: 'Every move must match: a hundred percent.' }),
      ],
    ),
    anim('question', 'QuestionCard', { mode: 'ask' }, [say(0.3, 'Does passing it make the model good enough to plan with?', '')], { min: 4.2, ...BLEND }),
    anim('null', 'QuestionCard', { mode: 'yes', stampDelay: 2.15 }, [say(0.2, 'On small games with complete rules, yes.', '')], { min: 3.6 }),
    anim('rule', 'DepthWell', { mode: 'rule', chip: TRUTH, chipIn: true }, [say(0.2, 'So I gave a small chess game one extra rule.', '')], { min: 3.4, ...BLEND }),
    anim('ruleCap', 'DepthWell', { mode: 'ruleCap', chip: TRUTH }, [say(0.15, 'At the move limit, the side with more pieces wins.', '')], { min: 4.4, ...BLEND }),
    anim(
      'random',
      'DepthWell',
      {
        mode: 'random',
        chip: TRUTH,
        counter: { to: 2.5, decimals: 1, suffix: '%', text: '2.5%', label: 'random games the rule decides', beat: 1, delay: 1.4 },
      },
      [
        say(0.2, 'Random games blunder early.', ''),
        say(0, 'The rule decides just 2.5% of them.', '', { en: 'The rule decides just two and a half percent of them.' }),
      ],
      BLEND,
    ),
    anim(
      'competent',
      'DepthWell',
      {
        mode: 'competent',
        chip: TRUTH,
        counter: { to: 50, decimals: 0, prefix: '~', suffix: '%', text: '~50%', label: 'competent games the rule decides', beat: 1, delay: 1.3 },
      },
      [say(0.2, 'Good play survives to the limit.', ''), say(0, 'There the rule decides about half.', '')],
      BLEND,
    ),
    anim('omit', 'DepthWell', { mode: 'omit', chip: MODEL, chipIn: true }, [say(0.2, 'Then I left that rule out of the spec.', '')], { min: 3.4, ...BLEND }),
    anim(
      'gate2',
      'DepthWell',
      { mode: 'gate', sample: 'missed', floor: 'model', chip: MODEL, stamp: { text: 'CHECK PASSED · 100%', sub: 'when no sampled game reached the rule', beat: 0, delay: 2.6 } },
      [say(0.15, 'When the random games missed it, it still passed at 100%,', '', { en: 'When the random games missed it, it still passed at a hundred percent,' })],
      BLEND,
    ),
    anim(
      'accuracy',
      'DepthWell',
      { mode: 'accuracy', chip: MODEL },
      [say(0.15, 'and was at least 98% right on positions the planner visits.', '', { en: 'and was at least ninety-eight percent right on positions the planner visits.' })],
      { min: 4 },
    ),
    anim(
      'meter',
      'WinRateMeter',
      { delays: { model: 0.8, fair: 1.5 } },
      [
        say(0.3, 'At play it lost: win rate 0.404;', '', { en: 'At play it lost: win rate point four oh four;' }),
        say(0, 'a fair baseline gets 0.495.', '', { en: 'a fair baseline gets point four nine five.' }),
      ],
      { tail: 3.1 },
    ),
    anim('mechanism', 'DepthWell', { mode: 'mechanism', chip: MODEL }, [say(0.2, 'The few positions it gets wrong are the ones that decide games.', '')], { min: 4.4 }),
    anim('verdict', 'QuestionCard', { mode: 'verdict', stampDelay: 2.45 }, [say(0.25, "Verdict: it passed the check, yet wasn't good enough to plan with.", '')], { tail: 1.25 }),
    anim('repair', 'DepthWell', { mode: 'repair', chip: MODEL }, [say(0.2, 'Even with the rule in its examples, it stayed blind to it.', '')], { min: 4.9, ...BLEND }),
    anim('lesson', 'DepthWell', { mode: 'lesson', chip: MODEL }, [say(0.2, "A check vouches for a model where you sample, not where it's used.", '', { en: "A check vouches for a model, where you sample, not where it's used." })], { tail: 1.0 }),
    anim(
      'fix',
      'DepthWell',
      { mode: 'fix', chip: MODEL, chipTo: TRUTH },
      [say(0.2, "So test where it's used,", ''), say(0, 'and put the rule in the spec.', '')],
      { tail: 1.4 },
    ),
    outro('outro', [say(0.15, 'More at javieraguilar.ai', '', { en: 'More at javier aguilar dot A I.' })]),
  ],
});

export const VIDEOS = videos(build);
/** The English main cut. */
export const TIMELINE = VIDEOS.en.main;
