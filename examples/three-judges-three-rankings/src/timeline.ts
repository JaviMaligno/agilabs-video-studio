// Three Judges, Three Rankings — article video (EN). Narration from the approved script v1.0
// (script.md); every number on screen is in factcheck.md.
// Structure: a question card at the top (QuestionCard, drawn above the scene transitions in
// Video.tsx) says what each part asks: "Is a GPT judge fair?" (setup and the three rankings), then
// "Does the task matter?" (the subjectivity split). Under it:
// - JudgeBench (scenes 1-6, 15, 18): judge seats, blind cards tinted in their author's colour,
//   stamps, the scale, coins;
// - Podiums (7-9): the ranking table as three podiums, crowns, own card vs the other judges;
// - GapBars (10-11): self-preference deltas with CIs, then the no-stake baseline;
// - TasteScale (12-14): the scale (answer key vs taste) over the bias-by-subjectivity bars;
// - VerdictCard (16-17): the rule.
// Marks are [line, word]: resolved to scene seconds from the TTS word timestamps (marks.ts).
import type { Cuts, Scene } from './types.ts';
import { anim, outro, say, videos, voice } from './narrate.ts';
import { WORDS } from './audio.generated.ts';
import { resolveMark, type MarkSpec } from './marks.ts';
import type { CardSpec, StampTone } from './anim/QuestionCard.state.ts';

type CardIn = { q: string; stamp?: { text: string; at: MarkSpec; after?: number; tone?: StampTone } };

/** Components whose consecutive scenes blend (same picture continues) instead of dipping. */
const CONTINUOUS = new Set(['Podiums', 'GapBars', 'TasteScale', 'VerdictCard']);

/** Marks resolved to scene seconds, the blend layout, and the question card's stamp time. */
const finish = (scenes: Scene[]): Scene[] => {
  const words = WORDS[voice()];
  return scenes.map((s) => {
    if (s.kind !== 'anim' || !s.anim) return s;
    const props = { ...s.anim.props };
    const name = s.anim.name;
    props.layout = CONTINUOUS.has(name) ? name : `${name}:${String(props.mode ?? '')}`;
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

const Q1 = 'Is a GPT judge fair?';
const Q2 = 'Does the task matter?';

const build = (): Cuts => ({
  main: finish([
    // 1. Cold open: same blind answers, three judges, three podiums.
    anim(
      'hook',
      'JudgeBench',
      { mode: 'hook', marks: [[1, 'different']] },
      [say(0.3, 'I gave three AI judges the same answers.', ''), say(0, 'I got three different rankings.', '')],
      { min: 5.4 },
    ),
    // 2. The question.
    anim(
      'question',
      'JudgeBench',
      { mode: 'question', marks: [[0, 'system'], [0, 'Claude']], card: { q: Q1 } },
      [say(0.3, 'Can a GPT judge fairly compare a GPT system with a Claude one?', '')],
    ),
    // 3. Three authors, fifteen tasks, objective to subjective.
    anim(
      'generate',
      'JudgeBench',
      { mode: 'generate', marks: [[0, 'fifteen'], [0, 'checkable'], [0, 'taste']], card: { q: Q1 } },
      [say(0.2, 'GPT, Grok and Claude each answered fifteen tasks, from checkable code to pure taste.', '')],
      { min: 6.6 },
    ),
    // 4. Blind, both orders.
    anim(
      'blind',
      'JudgeBench',
      { mode: 'blind', marks: [[0, 'judged'], [0, 'blind'], [0, 'twice'], [0, 'swapped']], card: { q: Q1 } },
      [say(0.2, 'Then each one judged every pair of answers blind, twice, with the order swapped.', '', { en: 'Then each one judged every pair of answers, blind. Twice, with the order swapped.' })],
      { min: 7.0 },
    ),
    // 5. House style.
    anim(
      'tint',
      'JudgeBench',
      { mode: 'tint', marks: [[0, 'No'], [0, 'house']], card: { q: Q1 } },
      [say(0.2, 'No names. But each model writes in a recognisable house style.', '')],
    ),
    // 6. Key moment: the judge is a contestant.
    anim(
      'contestant',
      'JudgeBench',
      { mode: 'contestant', marks: [[0, 'contestant'], [0, 'own']], card: { q: Q1 } },
      [say(0.2, 'So each judge is also a contestant, grading its own work blind.', '')],
      { min: 5.4 },
    ),
    // 7-9. Result 1: three rankings, crowns, every judge rates itself higher.
    anim(
      'rank',
      'Podiums',
      { mode: 'rank', card: { q: Q1 } },
      [say(0.3, 'Each judge gave a different ranking of the same 45 comparisons.', '', { en: 'Each judge gave a different ranking of the same forty-five comparisons.' })],
      { tail: BLEND_TAIL },
    ),
    anim(
      'crowns',
      'Podiums',
      { mode: 'crowns', marks: [[0, 'crowned'], [1, 'crowned']], card: { q: Q1 } },
      [say(0.1, 'Two of them crowned GPT.', ''), say(0, 'The Claude judge crowned Claude.', '')],
      { tail: BLEND_TAIL },
    ),
    anim(
      'self',
      'Podiums',
      { mode: 'self', card: { q: Q1 } },
      [say(0.1, 'Every judge rated its own answers higher than the other two did.', '', { en: 'Every judge... rated its own answers higher than the other two did.' })],
      { min: 5.3 },
    ),
    // 10-11. The delta, then the no-stake baseline (the article's hedge).
    anim(
      'gaps',
      'GapBars',
      { mode: 'peers', marks: [[0, 'twenty']], card: { q: Q1 } },
      [say(0.3, 'On the same pairs, each favoured its own by twenty to thirty points over its peers.', '', { en: 'On the same pairs, each favoured its own, by twenty to thirty points over its peers.' })],
      { tail: BLEND_TAIL },
    ),
    anim(
      'neutral',
      'GapBars',
      { mode: 'neutral', marks: [[0, 'shrinks'], [0, 'Grok']], card: { q: Q1 } },
      [say(0.2, "Against a judge with no stake, it shrinks; for Grok, it's no longer clear.", '')],
      { min: 5.6 },
    ),
    // 12-14. Key moment: subjectivity.
    anim(
      'scale',
      'TasteScale',
      { mode: 'intro', marks: [[0, 'grows'], [0, 'subjective']], card: { q: Q2 } },
      [say(0.3, 'And the bias grows with how subjective the task is.', '')],
      { tail: BLEND_TAIL },
    ),
    anim(
      'objective',
      'TasteScale',
      { mode: 'objective', marks: [[0, 'checkable'], [0, 'small']], card: { q: Q2 } },
      [say(0.2, 'On tasks with a checkable answer, it was small or absent.', '')],
      { tail: BLEND_TAIL },
    ),
    anim(
      'subjective',
      'TasteScale',
      { mode: 'subjective', marks: [[0, 'taste'], [0, 'thirty']], card: { q: Q2, stamp: { text: 'yes', at: [0, 'more'], after: 0.35 } } },
      [say(0.2, 'On matters of taste, thirty points or more.', '')],
      { min: 5.4 },
    ),
    // 15. Agreement at chance.
    anim(
      'coins',
      'JudgeBench',
      { mode: 'coins', marks: [[0, 'agreed'], [0, 'chance']], card: { q: Q2 } },
      [say(0.3, 'There, the judges agreed no better than chance.', '')],
      { min: 4.8 },
    ),
    // 16-17. The verdict.
    anim(
      'verdict',
      'VerdictCard',
      { mode: 'objective', marks: [[0, 'harmless']] },
      [say(0.3, "So a judge from a family you're testing is close to harmless on objective work…", '', { en: "So, a judge from a family you're testing, is close to harmless on objective work…" })],
      { min: 6.4 },
    ),
    anim(
      'verdict2',
      'VerdictCard',
      { mode: 'subjective', marks: [[0, 'unusable']] },
      [say(0.05, '…and close to unusable on subjective work.', '')],
      { min: 4.4 },
    ),
    // 18. The closing sentence.
    anim('participant', 'JudgeBench', { mode: 'participant' }, [say(0.3, 'On taste, your judge is a participant.', '')], { min: 3.8 }),
    outro('outro', [say(0.15, 'More at javieraguilar.ai', '', { en: 'More at javier aguilar dot A I.' })]),
  ]),
});

export const VIDEOS = videos(build);
/** The English main cut. */
export const TIMELINE = VIDEOS.en.main;
