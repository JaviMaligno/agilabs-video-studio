// Teaching a Small Model to Recognise a Sport From Moving Dots — article video (EN). Narration
// from the approved script v1.1 (script.md). Sequel to examples/sport-from-motion: the same dark
// dot stage (DotStage), the same snapshot deck (SnapshotDeck), and a new heart monitor of the
// training loss (LossMonitor): a flatline is a run that learned nothing, a pulse one that did.
// "Laya" is said the Spanish way, LAH-yah, as Javier says it: lines with it carry a spoken form.
import type { Cuts, Scene } from './types.ts';
import { anim, outro, say, videos } from './narrate.ts';
import { FPS, sceneStarts } from './timing.ts';

/**
 * One clock for every dot stage: each anim scene gets the video second it starts at (`clock`).
 * `layout` decides which consecutive scenes blend (same component and layout) instead of dipping.
 */
const withClock = (scenes: Scene[]): Scene[] => {
  const { starts } = sceneStarts(scenes);
  return scenes.map((s, i) => {
    if (s.kind !== 'anim' || !s.anim) return s;
    const mode = String(s.anim.props.mode ?? '');
    const layout = s.anim.name === 'DotStage' ? 'dots' : s.anim.name === 'LossMonitor' ? (['official', 'control'].includes(mode) ? 'monitor' : mode) : mode;
    return { ...s, anim: { ...s.anim, props: { ...s.anim.props, clock: +(starts[i] / FPS).toFixed(3), layout } } };
  });
};

/** Spoken form of "Laya": Spanish-style, LAH-yah. */
const LAYA = 'Lah-yah';

const build = (): Cuts => ({
  main: withClock([
    // 1. Cold open: three seeds, same everything; two pulse, one stays flat.
    anim(
      'hook',
      'LossMonitor',
      // marks: "depended" (the traces run on), from the TTS word timestamps.
      { mode: 'seeds3', marks: [4.6] },
      [say(0.1, 'Same model, same dots, same recipe.', ''), say(0, 'Whether it learned depended on the seed.', '')],
      { min: 6.9 },
    ),
    // 2. Callback to the first video.
    anim(
      'specialist',
      'DotStage',
      { mode: 'specialist' },
      [say(0.15, 'Last time, a classifier was right 83% of the time.', '', { en: 'Last time, a classifier was right eighty-three percent of the time.' })],
      { min: 4.4 },
    ),
    anim(
      'guesses',
      'DotStage',
      { mode: 'guesses' },
      [say(0.15, 'Frontier models: between chance and 47%.', '', { en: 'Frontier models: between chance and forty-seven percent.' })],
      { min: 4.6 },
    ),
    // 3. Laya: the dots as text.
    anim(
      'laya',
      'DotStage',
      { mode: 'totext' },
      [say(0.15, 'I fine-tuned Laya, a small open model, on the same data.', '', { en: `I fine-tuned ${LAYA}, a small open model, on the same data.` })],
      { min: 4.8 },
    ),
    // 4. The official recipe: flatline, cut at epoch 4.
    anim(
      'official',
      'LossMonitor',
      { mode: 'official' },
      [say(0.15, 'The official recipe learned nothing.', ''), say(0, 'Every sport got the same score.', '')],
      { min: 5.4 },
    ),
    // 5. The positive control, then the dots.
    anim(
      'control',
      'LossMonitor',
      { mode: 'control' },
      [say(0.2, 'A meaningless tag giving away the answer? With more epochs, it learned that.', ''), say(0, 'The dots take longer to start.', '')],
      { min: 8 },
    ),
    // 6. The three dots curves of the article's figure.
    anim(
      'curves',
      'LossMonitor',
      // marks: "ten", "twenty-two", "thirty-two" (scene seconds, TTS word timestamps).
      { mode: 'curves', marks: [1.84, 3.36, 4.88] },
      [say(0.2, 'The loss sat at chance for 10 epochs, sometimes 22, sometimes all 32.', '', { en: 'The loss sat at chance for ten epochs, sometimes twenty-two, sometimes all thirty-two.' })],
      { min: 6 },
    ),
    // 7. Trained longer, it reads the order; shuffled, it loses 8 points.
    anim(
      'order',
      'SnapshotDeck',
      { mode: 'laya' },
      [
        say(0.25, 'Trained for longer, it reads the order:', ''),
        say(0, 'shuffled, it loses 8 points. Opus lost 10.', '', { en: 'shuffled, it loses eight points. Opus lost ten.' }),
      ],
      { min: 7.5 },
    ),
    // 8. Which table it sits at.
    anim(
      'company',
      'SnapshotDeck',
      { mode: 'company' },
      [
        say(0.2, 'In accuracy, Laya is one more frontier model.', '', { en: `In accuracy, ${LAYA} is one more frontier model.` }),
        say(0, 'On the order test, it joins Opus and the classifier.', ''),
      ],
      { min: 7 },
    ),
    // 9. The wall of fifteen runs.
    anim(
      'wall',
      'LossMonitor',
      // marks: "nine", "six".
      { mode: 'wall', marks: [2.82, 3.72] },
      [say(0.15, 'Fifteen runs, only the seed changed: 9 learned, 6 never did.', '', { en: 'Fifteen runs, only the seed changed: nine learned, six never did.' })],
      { min: 5.6 },
    ),
    // 10. The coin flip and the closing sentence.
    anim('coin', 'LossMonitor', { mode: 'coin' }, [say(0.3, 'One fine-tuning run is a sample, not a measurement.', '')], { min: 4.6 }),
    outro('outro', [say(0.15, 'More at javieraguilar.ai', '', { en: 'More at javier aguilar dot A I.' })]),
  ]),
});

export const VIDEOS = videos(build);
/** The English main cut. */
export const TIMELINE = VIDEOS.en.main;
