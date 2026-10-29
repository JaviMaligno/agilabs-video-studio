// Where's the Ball? Part 3 — It Was Geometry All Along — article video (EN). Narration exactly as
// the script (script.md v1.0); every figure traced in factcheck.md.
// Structure: the 60 kB black box, opened three times. A question band at the top (QuestionCard,
// drawn above the scene transitions in Video.tsx) names each opening and gets its stamp:
// 92% · NOTHING · BLIND SPOT, then MOSTLY GEOMETRY. Under it:
// - ConfidenceCloud (1, 14-18): the box's guess as a cloud of guesses; the blind spot;
// - PitchPlayback (2-3, 19): the real Metrica play, ball erased; the box enters; the verdict;
// - BlackBox (4-5, 20): the box itself, its three drawers and their stamps;
// - FeatureChips (6, 9): the hand-written features, then the one that dominates;
// - SkillRuler (7-8): share of the gap between a plain average and the net;
// - HoleTest (10-11, 13): the topology test, its rule, and shape versus movement;
// - BarCompare (12): the topology result.
// Marks are [line, word]: resolved to scene seconds from the TTS word timestamps (marks.ts).
// Scenes with the same `layout` blend into each other instead of dipping (Video.tsx); scenes with
// a `run` share one play clock, so the players do not jump at the cut.
import type { Cuts, Scene } from './types.ts';
import { L, anim, outro, say, videos, voice } from './narrate.ts';
import { FPS, sceneFrames, sceneStarts } from './timing.ts';
import { WORDS } from './audio.generated.ts';
import { resolveMark, type MarkSpec } from './marks.ts';
import type { CardSpec, StampTone } from './anim/QuestionCard.state.ts';

type CardIn = { q: string; stamp?: { text: string; at: MarkSpec; after?: number; tone?: StampTone } };
type Run = { from: number; rate: number };

/**
 * Marks resolved to scene seconds, the question card with its stamp time resolved, and the play
 * clock of scenes that share a `run` (play second = from + rate × seconds since the run began).
 */
const finish = (scenes: Scene[]): Scene[] => {
  const { starts } = sceneStarts(scenes);
  const words = WORDS[voice()];
  let runStart = 0;
  return scenes.map((s, i) => {
    if (s.kind !== 'anim' || !s.anim) return s;
    const props = { ...s.anim.props };
    const run = props.run as Run | undefined;
    if (run) {
      const prev = scenes[i - 1]?.anim?.props;
      if (!prev || prev.layout !== props.layout || !prev.run) runStart = starts[i];
      const t0 = (starts[i] - runStart) / FPS;
      const len = sceneFrames(s) / FPS;
      props.play = [+(run.from + run.rate * t0).toFixed(3), +(run.from + run.rate * (t0 + len)).toFixed(3)];
    }
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

export const Q0 = 'What is it computing?';
export const Q1 = '1 · geometry';
export const Q2 = '2 · topology';
export const Q3 = "3 · does it know when it's wrong?";
export const Q4 = 'Verdict';

/** The opening run on the real play: slowed down so 14 s of tracking cover the three scenes. */
const OPEN: Run = { from: 2.2, rate: 0.55 };
/** Tail of a scene that blends into the same picture. */
const BLEND_TAIL = 0.6;

const build = (): Cuts => ({
  main: finish([
    // 1. Cold open: the box's guess, a tight bright cloud; the real ball far away.
    anim(
      'hook',
      'ConfidenceCloud',
      { mode: 'hook', layout: 'open', run: OPEN, marks: [[0, 'sure'], [0, 'wrong']] },
      [say(0.4, "My little ball-finding AI is most sure of itself exactly where it's most wrong.", '')],
      // Hold the stamp before the hand-over.
      { tail: 1.9 },
    ),
    // 2-3. The story: the ball erased; the 60 kB box that cracked it.
    anim(
      'erase',
      'PitchPlayback',
      { mode: 'erase', layout: 'open', run: OPEN, chip: 'real tracking data · ball removed', marks: [[0, 'erase'], [0, 'players']] },
      [say(0.3, 'I erase the ball from football tracking data and keep only the players and their movement.', '')],
      { tail: BLEND_TAIL + 0.4 },
    ),
    anim(
      'net',
      'PitchPlayback',
      { mode: 'net', layout: 'open', run: OPEN, marks: [[0, 'tiny'], [0, 'frontier'], [0, 'couldn']] },
      [
        say(0.2, "A tiny network of about 60 kilobytes cracked cases that frontier AI models couldn't.", '', {
          en: "A tiny network of about sixty kilobytes cracked cases that frontier AI models couldn't.",
        }),
      ],
      { tail: 1.2 },
    ),
    // 4-5. The black box, and the question.
    anim(
      'closed',
      'BlackBox',
      { mode: 'closed', layout: 'box', marks: [[0, 'black'], [1, 'answer'], [1, 'explanation']] },
      [say(0.3, "But it's a black box.", ''), say(0, 'It gives an answer, not an explanation.', '')],
      { tail: BLEND_TAIL },
    ),
    anim(
      'drawers',
      'BlackBox',
      { mode: 'drawers', layout: 'box', marks: [[0, 'three'], [1, 'computing']], card: { q: Q0 }, cameos: [{ pose: 'pointing', at: [0, 'opened'] }] },
      [say(0.2, 'So I opened it three ways.', ''), say(0, 'What is it really computing?', '', undefined, { emotion: 'curious' })],
      { tail: 1.0 },
    ),
    // 6-9. Opening 1: geometry.
    anim(
      'chips',
      'FeatureChips',
      { mode: 'chips', marks: [[0, 'ten'], [0, 'centre'], [0, 'fastest']], card: { q: Q1 } },
      [say(0.3, "First, about ten numbers a coach could name, like the players' centre or the fastest runner.", '')],
      // The chips stay up long enough to be read after the last one lands.
      { tail: 2.2 },
    ),
    anim(
      'football',
      'SkillRuler',
      { mode: 'football', layout: 'ruler', marks: [[0, 'tree'], [0, 'ninety'], [0, 'adds'], [0, 'plain']], card: { q: Q1, stamp: { text: '92%', at: [0, 'ninety'], after: 0.9, tone: 'ok' } } },
      [
        say(0.3, 'A simple tree on those numbers recovers 92% of what the network adds over a plain average.', '', {
          en: 'A simple tree on those numbers recovers ninety-two percent of what the network adds over a plain average.',
        }),
      ],
      { tail: BLEND_TAIL + 0.5 },
    ),
    anim(
      'basketball',
      'SkillRuler',
      { mode: 'basketball', layout: 'ruler', marks: [[0, 'basketball'], [0, 'beats']], card: { q: Q1 } },
      [say(0.2, 'And in basketball, it even slightly beats the network.', '')],
      { tail: 1.6 },
    ),
    anim(
      'importance',
      'FeatureChips',
      { mode: 'importance', play: [0.6, 3.8], marks: [[0, 'one'], [1, 'average'], [1, 'fast']], card: { q: Q1 } },
      [say(0.3, 'One number does most of it.', ''), say(0, 'The average position, with fast runners counting more.', '')],
      { tail: 1.8 },
    ),
    // 10-13. Opening 2: topology.
    anim(
      'ring',
      'HoleTest',
      { mode: 'ring', layout: 'ring', marks: [[1, 'hole'], [1, 'ring'], [1, 'players']], card: { q: Q2 } },
      [say(0.3, 'Second, topology.', ''), say(0, 'Maybe the ball sits in a hole, inside a ring of players.', '')],
      { tail: BLEND_TAIL },
    ),
    anim(
      'rule',
      'HoleTest',
      { mode: 'rule', layout: 'ring', marks: [[0, 'rule'], [1, 'beats']], card: { q: Q2 }, cameos: [{ pose: 'thinking', at: [0, 'rule'] }] },
      [say(0.2, 'My rule, set in advance.', '', undefined, { emotion: 'contemplative' }), say(0, 'It only counts if it beats plain geometry.', '')],
      { tail: 1.4 },
    ),
    anim(
      'bars',
      'BarCompare',
      {
        title: L('Error · lower is better', ''),
        max: 0.3,
        bars: [
          { label: L('Geometry', ''), value: 0.111, display: '0.111', highlight: true },
          { label: L('Topology', ''), value: 0.258, display: '0.258' },
          { label: L('Geometry + topology', ''), value: 0.111, display: '= geometry alone' },
        ],
        card: { q: Q2, stamp: { text: 'Nothing', at: [2, 'nothing'], after: 0.2, tone: 'muted' } },
      },
      [say(0.3, "It didn't.", ''), say(0, 'Alone, it fell far behind geometry.', ''), say(0, 'Added to it, it changed nothing.', '')],
      { tail: 1.8 },
    ),
    anim(
      'contrast',
      'HoleTest',
      { mode: 'contrast', marks: [[0, 'shape'], [1, 'moving']], card: { q: Q2 } },
      [say(0.3, "The ball isn't in the crowd's shape.", ''), say(0, "It's where the crowd is moving.", '')],
      { tail: 1.4 },
    ),
    // 14-18. Opening 3: does it know when it's wrong?
    anim(
      'cloud',
      'ConfidenceCloud',
      { mode: 'cloud', play: [1.4, 2.6], marks: [[0, 'sure']], card: { q: Q3 } },
      [say(0.3, 'Third, I made the network say how sure it is.', '')],
      { tail: 1.6 },
    ),
    anim(
      'calibration',
      'ConfidenceCloud',
      { mode: 'calibration', marks: [[0, 'unsure'], [0, 'bigger'], [1, 'weakly']], card: { q: Q3 } },
      [say(0.3, 'On average, the more unsure it says it is, the bigger its error.', ''), say(0, 'Weakly, but consistently.', '')],
      { tail: 1.5 },
    ),
    anim(
      'tangled',
      'ConfidenceCloud',
      {
        mode: 'tangled',
        layout: 'minis',
        marks: [[0, 'tangled'], [0, 'hardest'], [1, 'opposite']],
        card: { q: Q3 },
        // Only ~1.7 s of scene are left after "opposite": a short reaction, gone before the blend.
        cameos: [{ pose: 'laughing', at: [1, 'opposite'], dur: 1.1 }],
      },
      [say(0.3, 'I expected balls tangled in a crowd to be hardest.', ''), say(0, "It's the opposite.", '', undefined, { emotion: 'surprised' })],
      { tail: BLEND_TAIL + 0.3 },
    ),
    anim(
      'loose',
      'ConfidenceCloud',
      { mode: 'loose', layout: 'minis', marks: [[0, 'loose'], [0, 'trailing'], [0, 'twenty']], card: { q: Q3 } },
      [
        say(0.2, 'A loose ball, with players trailing behind it, has about 20% more error.', '', {
          en: 'A loose ball, with players trailing behind it, has about twenty percent more error.',
        }),
      ],
      { tail: BLEND_TAIL + 0.3 },
    ),
    anim(
      'blindspot',
      'ConfidenceCloud',
      {
        mode: 'blindspot',
        layout: 'minis',
        marks: [[0, 'less'], [1, 'sure'], [1, 'wrong']],
        card: { q: Q3, stamp: { text: 'Blind spot', at: [1, 'wrong'], after: 0.2, tone: 'accent' } },
      },
      [say(0.2, 'And on those, it claims less uncertainty.', ''), say(0, "It's most sure exactly where it's most wrong.", '', undefined, { emotion: 'amazed' })],
      { tail: 1.6 },
    ),
    // 19-20. The verdict.
    anim(
      'verdict',
      'PitchPlayback',
      {
        mode: 'verdict',
        play: [0.6, 4.2],
        marks: [[1, 'geometry'], [1, 'weighted'], [1, 'heading']],
        card: { q: Q4, stamp: { text: 'Mostly geometry', at: [1, 'geometry'], after: 0.3, tone: 'ok' } },
      },
      [say(0.3, 'So the verdict.', '', undefined, { emotion: 'confident', speed: 1.05 }), say(0, 'It was mostly geometry, one weighted average of where the runners are heading.', '', undefined, { emotion: 'confident', speed: 1.05 })],
      { tail: 1.4 },
    ),
    anim(
      'stamps',
      'BlackBox',
      { mode: 'stamps', marks: [[0, 'topology'], [1, 'tell'], [1, 'loose']], card: { q: Q4 } },
      [say(0.3, 'Topology added nothing.', ''), say(0, "And the model can't tell when the ball slips loose.", '')],
      { tail: 1.8 },
    ),
    outro('outro', [say(0.15, 'More at javieraguilar.ai', '', { en: 'More at javier aguilar dot A I.' })]),
  ]),
});

export const VIDEOS = videos(build);
/** The English main cut. */
export const TIMELINE = VIDEOS.en.main;
