// Teaching a Small Model to Recognise a Sport From Moving Dots — article video (EN). Narration
// from script v2.0 (script.md). Sequel to examples/sport-from-motion.
// Structure: a question card at the top says what each part tests (QuestionCard, drawn above the
// scene transitions in Video.tsx) and gets the part's answer stamped on it. Under it:
// - LayaStage (scenes 1-10): the dots, the four options with Laya's score bars, and a lower panel
//   (the "?", last time's results, the LAYA chip, the training monitor);
// - SnapshotDeck (11-15): the order test, then which group Laya sits with;
// - LossMonitor (16-18): fifteen runs that differ only in the seed, then the coin.
// "Laya" is said the Spanish way, LAH-yah, as Javier says it: lines with it carry a spoken form.
// Marks are [line, word]: resolved to scene seconds from the TTS word timestamps (marks.ts).
import type { Cuts, Scene } from './types.ts';
import { anim, outro, say, videos, voice } from './narrate.ts';
import { FPS, sceneStarts } from './timing.ts';
import { WORDS } from './audio.generated.ts';
import { resolveMark, type MarkSpec } from './marks.ts';
import type { CardSpec, StampTone } from './anim/QuestionCard.state.ts';

type CardIn = { q: string; stamp?: { text: string; at: MarkSpec; after?: number; tone?: StampTone } };

/**
 * One clock for every dot stage (`clock`: the video second the scene starts at), the layout that
 * decides which consecutive scenes blend instead of dipping, marks resolved to scene seconds, and
 * the question card with its stamp time resolved.
 */
const finish = (scenes: Scene[]): Scene[] => {
  const { starts } = sceneStarts(scenes);
  const words = WORDS[voice()];
  return scenes.map((s, i) => {
    if (s.kind !== 'anim' || !s.anim) return s;
    const props = { ...s.anim.props };
    const name = s.anim.name;
    const mode = String(props.mode ?? '');
    props.clock = +(starts[i] / FPS).toFixed(3);
    props.layout = name === 'LayaStage' ? 'laya' : name === 'SnapshotDeck' ? 'deck' : mode;
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

/** Tail of a scene that blends into the same picture (the stage and the options stay put). */
const BLEND_TAIL = 0.7;

/** Spoken form of "Laya": Spanish-style, LAH-yah. */
const LAYA = 'Lah-yah';

const Q1 = 'Which sport is it?';
const Q2 = 'Does training work?';
const Q3 = 'Does it use the order?';
const Q4 = 'Is it repeatable?';

const build = (): Cuts => ({
  main: finish([
    // 1. The task: one clip of dots, the question, the four options.
    anim(
      'task',
      'LayaStage',
      { mode: 'task', marks: [[1, 'four']], card: { q: Q1 } },
      [say(0.2, 'Each dot is a player.', ''), say(0, 'Which of four sports is this?', '')],
      { min: 4.4, tail: BLEND_TAIL },
    ),
    // 2-3. Last time: frontier models under half, the classifier most.
    anim(
      'lasttime',
      'LayaStage',
      { mode: 'lasttime', marks: [[0, 'under'], [1, 'most']], card: { q: Q1 } },
      [say(0.1, 'Last time, frontier models got under half right.', ''), say(0, 'A classifier trained on the dots got most right.', '')],
      { tail: BLEND_TAIL },
    ),
    // 4-5. What Laya is: a small open model that scores each option.
    anim(
      'laya',
      'LayaStage',
      { mode: 'laya', marks: [[0, 'Lah'], [0, 'same'], [1, 'answers'], [1, 'gives']], card: { q: Q1 } },
      [
        say(0.1, 'So I trained Laya, a small open model, on the same dots.', '', { en: `So I trained ${LAYA}, a small open model, on the same dots.` }),
        say(0, "It doesn't write answers. It gives each sport a score.", ''),
      ],
      { tail: BLEND_TAIL },
    ),
    // 6. How to read the monitor, before any result (demo trace, no data).
    anim(
      'legend',
      'LayaStage',
      { mode: 'legend', marks: [[1, 'guessing'], [1, 'falls'], [1, 'learning']], card: { q: Q1 } },
      [say(0.1, 'This line tracks training.', ''), say(0, "If it stays flat, it's guessing; if it falls, it's learning.", '')],
      { min: 6.2, tail: BLEND_TAIL },
    ),
    // 7. Does training work? The official recipe: flat, every sport the same score.
    anim(
      'official',
      'LayaStage',
      { mode: 'official', card: { q: Q2, stamp: { text: '?', at: [1, 'score'], after: 0.3, tone: 'muted' } } },
      [say(0.25, 'The official recipe stayed flat.', ''), say(0, 'Every sport got the same score.', '')],
      { tail: BLEND_TAIL },
    ),
    // 8. The positive control, set up before its result.
    anim(
      'tag',
      'LayaStage',
      { mode: 'tag', marks: [[1, 'tagged'], [1, 'meaningless'], [1, 'gives']], card: { q: Q2 } },
      [say(0.1, 'Was the code broken?', ''), say(0, 'I tagged each clip with a meaningless label that gives away the answer.', '', {
          en: 'I tagged each clip with a meaningless label, that gives away the answer.',
        })],
      // Full tail: the short closing cue ("away the answer.") needs its hold.
      {},
    ),
    // 9. Its result: learned, with more epochs.
    anim(
      'control',
      'LayaStage',
      { mode: 'control', marks: [[1, 'more'], [1, 'did']], card: { q: Q2, stamp: { text: 'yes', at: [1, 'did'], after: 0.15 } } },
      [say(0.1, 'Any working training learns that.', ''), say(0, 'With more epochs, it did.', '')],
      { tail: BLEND_TAIL },
    ),
    // 10. The dots: slower, sometimes never.
    anim(
      'curves',
      'LayaStage',
      { mode: 'curves', marks: [[0, 'many'], [0, 'sometimes'], [0, 'end']], card: { q: Q2 } },
      [say(0.3, 'The dots took longer: flat for many epochs, sometimes to the end.', '')],
      { min: 5.6 },
    ),
    // 11-13. Does it use the order? Prediction first, then the result, then Opus.
    anim(
      'order',
      'SnapshotDeck',
      { mode: 'laya', marks: [[0, 'shuffle'], [1, 'hurt'], [2, 'eight'], [3, 'similar']], card: { q: Q3, stamp: { text: 'yes', at: [2, 'does'], after: 0.1 } } },
      [
        say(0.3, 'The real test: shuffle the snapshots.', ''),
        say(0, 'If it reads movement, that should hurt.', ''),
        say(0, 'Trained for longer, it does: once shuffled, it loses eight points.', ''),
        say(0, 'Opus, the only frontier model that read the order, lost a similar amount.', ''),
      ],
    ),
    // 14-15. Which group it sits with.
    anim(
      'company',
      'SnapshotDeck',
      { mode: 'company', card: { q: Q3 } },
      [
        say(0.1, 'In accuracy, Laya is one more frontier model.', '', { en: `In accuracy, ${LAYA} is one more frontier model.` }),
        say(0, 'In reading the order, it joins Opus and the classifier.', ''),
      ],
      { min: 7 },
    ),
    // 16-17. Is it repeatable? Fifteen runs, only the seed changes.
    anim(
      'wall',
      'LossMonitor',
      { mode: 'wall', marks: [[0, 'random'], [1, 'learned'], [1, 'never']], card: { q: Q4, stamp: { text: 'sometimes', at: [1, 'line'], after: 0.2, tone: 'warm' } } },
      [say(0.2, 'Same data, same recipe; only the random seed changed.', ''), say(0, 'Some runs learned. Others never left the flat line.', '')],
    ),
    // 18. The closing sentence.
    anim('coin', 'LossMonitor', { mode: 'coin', card: { q: Q4 } }, [say(0.2, 'One fine-tuning run is a sample, not a measurement.', '')], { min: 4.6 }),
    outro('outro', [say(0.15, 'More at javieraguilar.ai', '', { en: 'More at javier aguilar dot A I.' })]),
  ]),
});

export const VIDEOS = videos(build);
/** The English main cut. */
export const TIMELINE = VIDEOS.en.main;
