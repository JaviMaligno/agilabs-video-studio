// A World Model Can Pass Every Test and Still Lose — article video (EN). Narration from the
// approved script (script.md). Prequel of the robot/door video (being-wrong-can-be-free): same
// dark stage, dashed sample rays, indigo reach glow, rose "model is wrong" overlay, corner chip.
// One vertical shaft (DepthWell) carries the story: depth = moves played, the rule lives on the
// floor. Script lines with two sentences are split so each beat of the animation has its own line.
import type { Cuts } from './types.ts';
import { L, anim, outro, say, videos } from './narrate.ts';

const TRUTH = L('real rules', 'reglas reales');
const MODEL = L("AI's rulebook · rule missing", 'reglamento de la IA · sin la regla');
/** Shorter hold after the last line where the next scene continues on the same shaft (blend). */
const BLEND = { tail: 0.55 };

const build = (): Cuts => ({
  main: [
    // 2026-11-06 v2: hook C ("learn a game's rules by watching"), opened on the board/rulebook
    // scene instead of the shaft; lines trimmed to the house pace (voice speed is a fixed standard).
    anim(
      'story',
      'StoryGate',
      { cameos: [{ pose: 'laptop', at: [1, 'gave'] }] },
      [
        say(0.1, "Can you learn a game's rules just by watching people play?", '', undefined, { emotion: 'curious' }),
        say(0.5, 'I gave an AI the rules of a mini chess game, all but one,', ''),
        say(0, 'and asked it to write the rulebook for a computer player.', ''),
      ],
      { tail: 0.6 },
    ),
    anim('rule', 'DepthWell', { mode: 'rule', chip: TRUTH, chipIn: true }, [say(0.8, 'And the missing one...', '', undefined, { emotion: 'curious' })], { min: 3.0, ...BLEND }),
    anim('ruleCap', 'DepthWell', { mode: 'ruleCap', chip: TRUTH }, [
      say(0.15, 'at the move limit, whoever has more pieces wins.', ''),
      say(0, 'Could it work that one out?', '', undefined, { emotion: 'curious' }),
    ], { min: 4.0, ...BLEND }),
    anim(
      'gate2',
      'DepthWell',
      { mode: 'gate', sample: 'missed', floor: 'model', chip: MODEL, chipIn: true, stamp: { text: 'ALL MOVES MATCH', sub: 'random games', beat: 1, delay: 0.9 } },
      [
        say(0.2, 'First, I played random games with its rulebook: two players moving without thinking.', ''),
        say(0, 'Every move matched the real game.', ''),
      ],
      BLEND,
    ),
    anim(
      'random',
      'DepthWell',
      {
        mode: 'random',
        chip: TRUTH,
        counter: { to: 40, decimals: 0, prefix: '1 in ', text: 'almost never', label: 'random games that reach the limit', beat: 1, delay: 1.0 },
      },
      [say(0.2, 'But random games end fast: kings fall in a few clumsy moves.', ''), say(0, 'They almost never reach the move limit.', '')],
      BLEND,
    ),
    anim(
      'competent',
      'DepthWell',
      {
        mode: 'competent',
        chip: TRUTH,
        counter: { to: 50, decimals: 0, prefix: '~', suffix: '%', text: 'about half', label: 'good games it decides', beat: 1, delay: 1.0 },
      },
      [say(0.2, 'Good games do.', ''), say(0, 'There, that rule decides about half of them.', '')],
      BLEND,
    ),
    anim(
      'meter',
      'WinRateMeter',
      { delays: { model: 0.8, fair: 1.5 }, cameos: [{ pose: 'sceptical', at: [0, 'third'] }] },
      [say(0.3, 'Against a player who knew every rule, it won about a third.', ''), say(0, 'Equal players win half.', '')],
      { tail: 4.0 },
    ),
    anim(
      'repair',
      'DepthWell',
      { mode: 'repair', chip: MODEL },
      [
        say(0.2, 'Then I showed the AI games decided by that rule.', ''),
        say(0, 'It still never wrote it down.', '', undefined, { emotion: 'surprised' }),
        say(0.2, 'It writes the rules you give it.', ''),
        say(0, "It doesn't learn the ones it only watches.", '', undefined, { emotion: 'confident' }),
      ],
      { min: 4.9 },
    ),
    anim(
      'fix',
      'DepthWell',
      { mode: 'fix', chip: MODEL, chipTo: TRUTH },
      [say(0.2, 'So write down the rules that matter,', ''), say(0, 'and try them where the real games happen.', '', undefined, { emotion: 'confident' })],
      { tail: 1.4 },
    ),
    outro('outro', [say(0.15, 'More at javieraguilar.ai', '', { en: 'More at javier aguilar dot A I.' })]),
  ],
});

export const VIDEOS = videos(build);
/** The English main cut. */
export const TIMELINE = VIDEOS.en.main;
