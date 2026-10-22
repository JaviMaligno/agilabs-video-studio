// Blaming the Model — series video (EN). Narration from the approved script v1.0 (script.md),
// every figure traced in factcheck.md.
// One picture carries it: the closed box on a conveyor (ClosedBox), one mode per scene. A question
// card at the top says what each part asks (QuestionCard, drawn above the scene transitions in
// Video.tsx) and may get the part's answer stamped on it.
// Marks are [line, word]: resolved to scene seconds from the TTS word timestamps (marks.ts).
import type { Cuts, Scene } from './types.ts';
import { anim, outro, say, videos, voice } from './narrate.ts';
import { FPS, sceneStarts } from './timing.ts';
import { WORDS } from './audio.generated.ts';
import { resolveMark, type MarkSpec } from './marks.ts';
import type { CardSpec, StampTone } from './anim/QuestionCard.state.ts';
import { SINGLE_MODES, type BoxMode } from './anim/ClosedBox.state.ts';

type CardIn = { q: string; stamp?: { text: string; at: MarkSpec; after?: number; tone?: StampTone } };

/**
 * The conveyor's clock (`clock`: the video second the scene starts at, so the belt and the shuffle
 * run on across scenes), the layout that makes consecutive scenes blend instead of dipping, marks
 * resolved to scene seconds, and the question card with its stamp time resolved.
 */
const finish = (scenes: Scene[]): Scene[] => {
  const { starts } = sceneStarts(scenes);
  const words = WORDS[voice()];
  return scenes.map((s, i) => {
    if (s.kind !== 'anim' || !s.anim) return s;
    const props = { ...s.anim.props };
    props.clock = +(starts[i] / FPS).toFixed(3);
    // Blend only within one layout (one pipeline or two rows); a layout change dips to black.
    props.layout = `${s.anim.name}-${SINGLE_MODES.includes(props.mode as BoxMode) ? 'single' : 'double'}`;
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

export const Q_TEST = 'The test · a fault upstream';
export const Q_CODE = 'Does the code change it?';
export const Q_MODEL = 'Is it the model?';
export const Q_BLAME = 'What gets blamed?';
export const Q_ASK = 'Did anyone ask for logs?';
export const Q_VERDICT = 'The verdict · on this fault';

const build = (): Cuts => ({
  main: finish([
    // 1. Cold open: the conveyor wobbles, suspicion settles on the head, the model comes out.
    anim('hook', 'ClosedBox', { mode: 'hook', marks: [[0, 'blaming'], [0, 'took']] }, [say(0.4, 'My agents kept blaming the model. So I took the model out.', '')], {
      // Hold "So I took the model out." long enough to read.
      min: 5.0,
      tail: 1.0,
    }),
    // 2-3. The story: systems with a model inside, agents debugging, the randomness explanation.
    anim(
      'story',
      'ClosedBox',
      { mode: 'story', marks: [[0, 'agents'], [1, 'blamed'], [1, 'randomness']] },
      [say(0.3, 'I build systems with a model inside, and agents do most of my debugging.', ''), say(0, "When results changed between runs, they blamed the model's randomness.", '')],
      // Hold the bubble ("these systems are nondeterministic → lower the temperature").
      { tail: 1.2 },
    ),
    // 4. Where the cause usually is vs where suspicion lands.
    anim('layers', 'ClosedBox', { mode: 'layers', marks: [[0, 'cause'], [0, 'design']] }, [say(0.3, 'In my experience, the cause was almost always in the design.', '')], {
      // The tags and both labels must be read: hold after the line.
      tail: 1.6,
    }),
    // 5. The test rig.
    anim('rig', 'ClosedBox', { mode: 'rig', marks: [[0, 'test'], [0, 'sorts']] }, [say(0.3, 'So I built a test. A small classifier that sorts projects using a model.', '')], {
      tail: 1.0,
    }),
    // 6-7. The planted fault and the wobble it causes.
    anim(
      'fault',
      'ClosedBox',
      { mode: 'fault', marks: [[0, 'planted'], [0, 'search'], [0, 'different'], [1, 'labels'], [1, 'nothing']], card: { q: Q_TEST } },
      [say(0.3, 'I planted a fault upstream, in the search, so each pass gets different documents.', ''), say(0, "The labels change between passes. The model's sampling has nothing to do with it.", '')],
      { tail: 1.2 },
    ),
    // 8-9. Forty agents, half with the code; who found the cause.
    anim(
      'split',
      'ClosedBox',
      { mode: 'split', marks: [[0, 'forty'], [0, 'investigate'], [0, 'read'], [1, 'all'], [1, 'without'], [1, 'three']], card: { q: Q_CODE } },
      [say(0.3, 'Forty agents had to investigate. Half could also read the code.', ''), say(0, 'With the code, all twenty found the cause. Without it, three.', '')],
      { tail: BLEND_TAIL },
    ),
    // 10-11. The patch: nineteen of twenty without the code, nine with it.
    anim(
      'patch',
      'ClosedBox',
      { mode: 'patch', marks: [[0, 'nineteen'], [0, 'damped'], [0, 'voting'], [1, 'nine']], card: { q: Q_CODE } },
      [say(0.2, 'Without the code, nineteen of twenty damped the output, voting or lowering the temperature.', ''), say(0, 'With the code, nine.', '')],
      // The unvoiced note (4/20 vs 0/20, p = 0,053) needs its reading time.
      { tail: 3.4 },
    ),
    // 12. The swap.
    anim(
      'swap',
      'ClosedBox',
      { mode: 'swap', marks: [[0, 'swapped'], [0, 'frozen'], [0, 'forest']], card: { q: Q_MODEL } },
      [say(0.3, 'Was that about language models? I swapped the model for a frozen random forest.', '')],
      { tail: 1.4 },
    ),
    // 13. Two arms, both certified.
    anim(
      'arms',
      'ClosedBox',
      { mode: 'arms', marks: [[0, 'same'], [0, 'told']], card: { q: Q_MODEL } },
      [say(0.3, 'Same fault, no code, and both were told the head always gave the same answer.', '')],
      { tail: 1.0 },
    ),
    // 14. Patching didn't move.
    anim(
      'bars',
      'ClosedBox',
      { mode: 'bars', marks: [[0, 'nineteen'], [0, 'forest']], card: { q: Q_MODEL } },
      [say(0.2, "Patching didn't move. Nineteen of twenty, with the model and with the forest.", '')],
      { tail: 0.9 },
    ),
    // 15. Not the model: a closed box.
    anim(
      'closed',
      'ClosedBox',
      { mode: 'closed', marks: [[0, 'no'], [0, 'box']], card: { q: Q_MODEL, stamp: { text: 'no', at: [0, 'box'], after: 0.3, tone: 'warm' } } },
      [say(0.3, "So it needs no language model. Just a box you can't open.", '')],
      { tail: 1.3 },
    ),
    // 16-18. The accusation: the die and the wrench.
    anim(
      'accuse',
      'ClosedBox',
      { mode: 'accuse', marks: [[0, 'accusation'], [1, 'fourteen'], [1, 'forest'], [2, 'system'], [3, 'model']], card: { q: Q_BLAME } },
      [
        say(0.3, 'What changed was the accusation.', ''),
        say(0, 'Fourteen of twenty said the model was random by nature. For the forest, four.', ''),
        // Voiced as two lines: the pause between the sentences keeps the first caption readable.
        say(0, 'The forest got blamed for what the system does to it.', ''),
        say(0, 'The model, for what it is.', ''),
      ],
      { tail: 1.4 },
    ),
    // 19-20. Nobody asked.
    anim(
      'ask',
      'ClosedBox',
      { mode: 'ask', marks: [[0, 'two'], [0, 'not'], [0, 'missing'], [1, 'complete']], card: { q: Q_ASK } },
      [say(0.3, 'Across two hundred and eighty responses, not one asked for the missing logs.', ''), say(0, 'Not even when told that asking was a complete answer.', '')],
      // The unvoiced note (explicit permission: 0/20 asked · 14/20 hedged instead) needs its time.
      { tail: 2.2 },
    ),
    // 21-22b. The verdict, then the mirror: models judging a model.
    anim(
      'verdict',
      'ClosedBox',
      { mode: 'verdict', marks: [[0, 'closed'], [1, 'suspicion'], [1, 'called'], [2, 'agents'], [2, 'models']], card: { q: Q_VERDICT } },
      [
        say(0.3, 'So on this fault, patching came from the closed box, not the model.', ''),
        say(0, 'What the model changes is the suspicion. Even with evidence clearing it, it gets called random.', ''),
        // The apparent paradox (added after review): the judges are models too. Starts a beat
        // later than the usual gap so the previous caption keeps its reading time.
        say(11.1, 'And the agents calling it random were language models themselves.', ''),
      ],
      { tail: 1.4 },
    ),
    outro('outro', [say(0.15, 'More at javieraguilar.ai', '', { en: 'More at javier aguilar dot A I.' })]),
  ]),
});

export const VIDEOS = videos(build);
/** The English main cut. */
export const TIMELINE = VIDEOS.en.main;
