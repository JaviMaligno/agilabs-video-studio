// More Than One Way to Prove It: explainer video. Narration from the approved script (script.md).
// One idea from the article: the order rule. Six model cards form a leaderboard by bugs fixed;
// the grader's clipboard adds "tests first", then "don't edit the tests", and the stack flips.
// Every figure is traced in factcheck.md; the card data lives in src/anim/LeaderboardFlip.state.ts.
import type { Cuts } from './types.ts';
import { L, anim, intro, outro, say, videos } from './narrate.ts';

const build = (): Cuts => ({
  main: [
    // Cold open: the leaderboard is on screen from frame 0 and flips under the hook.
    intro(
      'cold',
      [say(0.1, 'A rule that sounds like good practice ranked six AI models upside down.', 'Una regla que suena a buena práctica ordenó seis modelos de IA al revés.')],
      3,
      { name: 'LeaderboardFlip', props: { mode: 'cold' } },
    ),
    anim(
      'setup',
      'StatGrid',
      {
        // Role cameo: the author handing out the bugs.
        cameos: [{ pose: 'pointing', at: [0, 'gave'], dur: 2.4 }],
        stats: [
          { value: '6', label: L('models', 'modelos') },
          // Pinned to the words: "ten" (EN 1.7 s) and the second line, "three times each" (EN 3.93 s).
          { value: '10', label: L('real bugs', 'bugs reales'), at: 1.6 },
          { value: '3', label: L('runs each', 'ejecuciones cada uno'), at: 3.9 },
        ],
      },
      // Split at the comma: as one line its last caption cue ("each.") flashed for under 0.8 s.
      [
        say(0.3, 'I gave six models ten real bugs in a Python library,', 'Les di a seis modelos diez bugs reales de una librería de Python,'),
        say(0, 'three times each.', 'tres veces cada uno.'),
      ],
    ),
    anim(
      'rule',
      'LeaderboardFlip',
      { mode: 'rule' },
      // Split at the colon (a cue read at 18 chars/s as one line); the rule writes in on the second beat.
      [
        say(0.3, 'Then I graded them with a rule nobody argues with:', 'Y los evalué con una regla que nadie discute:'),
        say(0, 'run the tests before you touch anything.', 'ejecuta los tests antes de tocar nada.'),
      ],
    ),
    anim(
      'sonnet',
      'LeaderboardFlip',
      { mode: 'focus', focus: 'Sonnet', cameos: [{ pose: 'sceptical', at: [1, 'zero'], dur: 2.0 }] },
      [
        say(0.2, 'Sonnet fixed all thirty bugs.', 'Sonnet arregló los treinta bugs.'),
        say(0, 'It ran the tests first zero times.', 'Ejecutó los tests primero cero veces.'),
      ],
      { min: 4.6 },
    ),
    anim(
      'opus',
      'LeaderboardFlip',
      { mode: 'focus', focus: 'Opus' },
      [say(0.2, 'Opus fixed twenty-nine,', 'Opus arregló veintinueve'), say(0, 'and ran them first once.', 'y los ejecutó primero una vez.')],
      { min: 4.4 },
    ),
    anim(
      'qwen',
      'LeaderboardFlip',
      { mode: 'focus', focus: 'Qwen' },
      [
        say(0.2, 'Qwen, a small model, fixed the fewest,', 'Qwen, un modelo pequeño, arregló de los que menos,', { en: 'Kwen, a small model, fixed the fewest,' }),
        // A touch slower: at the default speed the caption read at 17.1 chars/s.
        say(0, 'and ran them first more than half the time.', 'y los ejecutó primero más de la mitad de las veces.', undefined, { speed: 0.95 }),
      ],
      { min: 4.6 },
    ),
    anim(
      'habit',
      'KeyQuote',
      { text: L("The rule wasn't measuring care. It was measuring habit.", 'La regla no medía el cuidado. Medía una costumbre.'), emphasis: ['habit', 'costumbre'] },
      [
        say(0.3, "The rule wasn't measuring care.", 'La regla no medía el cuidado.'),
        say(0, 'It was measuring habit.', 'Medía una costumbre.', undefined, { emotion: 'confident' }),
      ],
    ),
    anim(
      'flip',
      'LeaderboardFlip',
      { mode: 'flip', cameos: [{ pose: 'amazed', at: [1, 'flips'], dur: 2.2 }] },
      [
        say(0.3, "Add a second sensible rule, don't edit the tests,", 'Añade otra regla sensata, no tocar los tests,'),
        say(0, 'and the ranking flips.', 'y el ranking se da la vuelta.', undefined, { emotion: 'amazed' }),
      ],
      // Room after the flip for the stamps and the "passes both rules" figures to be read.
      { min: 7.5 },
    ),
    anim(
      'opinion',
      'LeaderboardFlip',
      { mode: 'opinion' },
      [
        say(0.3, 'A rule about how to work is an opinion about method.', 'Una regla sobre cómo trabajar es una opinión sobre el método.', undefined, { emotion: 'confident' }),
        say(0, 'Here it graded the habit, not the result.', 'Aquí puntuó la costumbre, no el resultado.', undefined, { emotion: 'confident', speed: 1.05 }),
      ],
    ),
    outro('outro', [say(0.15, 'More at javieraguilar.ai.', 'Más en javieraguilar.ai.', { en: 'More at javier aguilar dot A I.', es: 'Más en javier aguilar punto A I.' })]),
  ],
});

export const VIDEOS = videos(build);
/** The English main cut. */
export const TIMELINE = VIDEOS.en.main;
