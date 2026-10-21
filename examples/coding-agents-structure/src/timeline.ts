// Coding Agents and Teamwork: Social Skills, or Structure? — article video (EN). Narration from
// the approved script v1.0 (script.md).
// Picture: two crews, one bridge. A task with two features is a bridge over a gap, the merge is
// the join in the middle, each agent is a crew building one half from its own bank, the message
// channel is a pair of walkie-talkies, the tests are a truck that has to cross (BridgeCrew).
// A question card at the top ("Social skills, or structure?", QuestionCard drawn above the scene
// transitions in Video.tsx) arrives in scene 3 and gets the verdict stamped on it in scene 14a.
// Results: SeedBars (bars with the three per-seed runs as dots); the slice: SliceGrid.
// Marks are [line, word]: resolved to scene seconds from the TTS word timestamps (marks.ts).
import type { Cuts, Scene } from './types.ts';
import { anim, outro, say, videos, voice } from './narrate.ts';
import { WORDS } from './audio.generated.ts';
import { resolveMark, type MarkSpec } from './marks.ts';
import type { CardSpec, StampTone } from './anim/QuestionCard.state.ts';

type CardIn = { q: string; inAt?: MarkSpec; stamp?: { text: string; at: MarkSpec; after?: number; tone?: StampTone } };

/** Marks and card times resolved to scene seconds; the layout decides which scenes blend. */
const finish = (scenes: Scene[]): Scene[] => {
  const words = WORDS[voice()];
  return scenes.map((s) => {
    if (s.kind !== 'anim' || !s.anim) return s;
    const props = { ...s.anim.props };
    const name = s.anim.name;
    props.layout = name === 'BridgeCrew' ? (props.mode === 'hook' || props.mode === 'humans' ? String(props.mode) : 'bridge') : name;
    const res = (m: MarkSpec | number) => (Array.isArray(m) ? resolveMark(s.lines, m, words, voice()) : m);
    if (Array.isArray(props.marks)) props.marks = (props.marks as (MarkSpec | number)[]).map(res);
    if (Array.isArray(props.refMark)) props.refMark = res(props.refMark as MarkSpec);
    const card = props.card as CardIn | undefined;
    if (card) {
      const out: CardSpec = { q: card.q };
      if (card.inAt) out.inAt = resolveMark(s.lines, card.inAt, words, voice());
      if (card.stamp) {
        const at = resolveMark(s.lines, card.stamp.at, words, voice()) + (card.stamp.after ?? 0);
        out.stamp = { text: card.stamp.text, at: +at.toFixed(3), tone: card.stamp.tone ?? 'ok' };
      }
      props.card = out;
    }
    return { ...s, anim: { ...s.anim, props } };
  });
};

const Q = 'Social skills, or structure?';
const card = { q: Q };
/** Tail of a bridge scene that blends into the next bridge scene (the bridge stays put). */
const BLEND_TAIL = 0.6;
/**
 * Scene second where a scene's own crews fade in when it blends in from a bridge scene whose crews
 * stand elsewhere (the blend keeps the outgoing scene drawn for the first half of its 0.6 s).
 */
const ENTER = 0.5;

// Ladder rungs, bottom to top (BridgeCrew draws them on the right margin).
type Mark = 'cross' | 'tilde' | 'tick';
const DONE_8: Record<string, Mark> = { talk: 'cross' };
const DONE_9: Record<string, Mark> = { ...DONE_8, files: 'tilde', lines: 'cross' };
const DONE_11: Record<string, Mark> = { ...DONE_9, seq: 'tick' };

const build = (): Cuts => ({
  main: finish([
    // 1. Cold open: one agent builds the whole bridge, two agents jam at the join.
    anim('hook', 'BridgeCrew', { mode: 'hook' }, [say(0.15, 'Give two coding agents one job, and they do worse than one.', '')], { min: 4 }),
    // 2. The paper and its reading; what is different: almost no process, on purpose.
    anim(
      'paper',
      'BridgeCrew',
      { mode: 'paper', marks: [[0, 'study'], [0, 'social'], [1, 'On'], [1, 'purpose']] },
      [say(0.1, 'A recent study says they lack social skills.', ''), say(0, 'But its agents work with almost no process. On purpose.', '')],
    ),
    // 3. Human teams with no process collide too; the question card drops in on "structure".
    anim(
      'humans',
      'BridgeCrew',
      { mode: 'humans', card: { q: Q, inAt: [0, 'structure'] } },
      [say(0.1, 'Human teams with no process collide too. So I tested structure.', '')],
    ),
    // 4. The test, before any result.
    anim(
      'setup',
      'BridgeCrew',
      { mode: 'setup', marks: [[0, 'test'], [0, 'feature'], [0, 'merged'], [1, 'message']], card },
      [say(0.1, 'The test: each agent builds one feature; then their code is merged.', '', { en: 'The test. Each agent builds one feature; then their code is merged.' }), say(0, 'They can message each other the whole time.', '')],
      { tail: 1.1 },
    ),
    // 5. The reproduced drop, strong model.
    anim(
      'drop',
      'SeedBars',
      {
        model: 'gpt-5.4',
        bars: [
          { label: 'alone', value: 30, display: '30 %', range: '[21–37]', seeds: [7, 4, 6] },
          { label: 'pair', value: 7, display: '7 %', range: '[0–16]', seeds: [1, 3, 0], tone: 'flag' },
        ],
        note: 'gpt-5.4-mini: 14 % → 7 %',
        marks: [[0, 'thirty'], [0, 'seven']],
        card,
      },
      [say(0.1, 'I got the same drop. With the stronger model, 30 % alone, 7 % as a pair.', '', { en: 'I got the same drop. With the stronger model: thirty percent alone, seven percent as a pair.' })],
    ),
    // 6. Where it fails: the merge.
    anim(
      'clash',
      'BridgeCrew',
      { mode: 'clash', marks: [[0, 'Most'], [0, 'merge'], [0, 'clashed']], card },
      [say(0.1, 'Most failures came at the merge: their code clashed.', '', { en: 'Most failures came at the merge. Their code clashed.' })],
    ),
    // 7. The ladder of five structures.
    anim('ladder', 'BridgeCrew', { mode: 'ladder', marks: [[0, 'tried'], [0, 'structure']], card }, [say(0.1, 'Then I tried five kinds of structure.', '')]),
    // 8a. Talk first: they already were talking.
    anim(
      'handshake',
      'BridgeCrew',
      { mode: 'handshake', enter: ENTER, marks: [[0, 'Forcing'], [0, 'talk'], [0, 'help'], [0, 'already']], ladder: { done: {}, glow: ['talk'], add: [{ id: 'talk', mark: 'cross' }] }, card },
      [say(0.1, "Forcing them to talk first didn't help. They already were.", '')],
    ),
    // 8b. The partner that read the requests and never answered.
    anim(
      'silence',
      'BridgeCrew',
      { mode: 'silence', enter: ENTER, marks: [[0, 'One'], [0, 'request'], [0, 'planned'], [0, 'never']], card },
      [say(0.1, "One read its partner's request, planned to reply, and never did.", '')],
      { tail: BLEND_TAIL },
    ),
    // 9. Fences: no clashes, still failing.
    anim(
      'fences',
      'BridgeCrew',
      {
        mode: 'fences',
        enter: ENTER,
        enterLadder: true,
        marks: [[0, 'Owning'], [0, 'ended'], [0, 'most'], [0, 'failed']],
        ladder: { done: DONE_8, glow: ['files', 'lines'], add: [{ id: 'lines', mark: 'cross' }, { id: 'files', mark: 'tilde' }] },
        card,
      },
      [say(0.1, 'Owning files ended the clashes, but most code still failed.', '')],
      { tail: BLEND_TAIL },
    ),
    // 10. The key point: one agent owns the join.
    anim(
      'owner',
      'BridgeCrew',
      { mode: 'owner', marks: [[0, 'worked'], [0, 'one'], [0, 'owning']], ladder: { done: DONE_9, glow: ['seq', 'int'], accent: ['seq', 'int'] }, card },
      [say(0.1, 'What worked was one agent owning the final assembly.', '')],
      { tail: BLEND_TAIL },
    ),
    // 11a. In sequence.
    anim(
      'sequence',
      'BridgeCrew',
      {
        mode: 'sequence',
        enter: ENTER,
        marks: [[0, 'sequence'], [0, 'second'], [0, 'builds'], [0, 'code']],
        ladder: { done: DONE_9, glow: ['seq'], accent: ['seq', 'int'], add: [{ id: 'seq', mark: 'tick' }] },
        card,
      },
      [say(0.1, "In sequence: the second agent builds on the first one's code.", '', { en: 'In sequence. The second agent builds on the first one\'s code.' })],
      { tail: BLEND_TAIL },
    ),
    // 11b. Or an integrator.
    anim(
      'integrator',
      'BridgeCrew',
      {
        mode: 'integrator',
        marks: [[0, 'third'], [0, 'merges']],
        ladder: { done: DONE_11, glow: ['int'], accent: ['seq', 'int'], add: [{ id: 'int', mark: 'tick' }] },
        card,
      },
      [say(0.1, 'Or a third agent who merges both.', '')],
      { min: 4.4 },
    ),
    // 12a. Back to solo level (strong model).
    anim(
      'recover',
      'SeedBars',
      {
        model: 'gpt-5.4',
        bars: [
          { label: 'alone', value: 30, display: '30 %', range: '[21–37]', seeds: [7, 4, 6], at: 0 },
          { label: 'pair', value: 7, display: '7 %', range: '[0–16]', seeds: [1, 3, 0], tone: 'flag', at: 0 },
          { label: 'in sequence', value: 35, display: '35 %', range: '[32–37]', seeds: [6, 7, 7], tone: 'accent' },
          { label: 'integrator', value: 33, display: '33 %', range: '[26–42]', seeds: [6, 8, 5], tone: 'accent' },
        ],
        reference: { value: 30, label: 'alone 30 %' },
        marks: [-1, -1, [0, 'thirty-five'], [0, 'thirty-three']],
        refMark: [0, 'solo'],
        card,
      },
      [say(0.1, 'Both got back to solo level: 35 % and 33 %.', '', { en: 'Both got back to solo level: thirty-five and thirty-three percent.' })],
    ),
    // 12b. Weak model: sequencing beat one agent alone.
    anim(
      'weak',
      'SeedBars',
      {
        model: 'gpt-5.4-mini',
        bars: [
          { label: 'alone', value: 14, display: '14 %', range: '[11–16]', seeds: [3, 3, 2] },
          { label: 'in sequence', value: 26, display: '26 %', range: '[21–37]', seeds: [4, 4, 7], tone: 'accent' },
        ],
        tag: 'ahead in all 3 runs',
        marks: [[0, 'weaker'], [0, 'sequencing'], [0, 'beat']],
        card,
      },
      [say(0.1, 'And for the weaker model, sequencing beat one agent alone.', '')],
    ),
    // 13. The hedge: a slice, not the whole benchmark.
    anim(
      'slice',
      'SliceGrid',
      { total: 652, lit: 19, stats: ['5 repos', '3 runs', '2 models'], marks: [[0, 'nineteen'], [0, 'three'], [0, 'slice']], card },
      [say(0.1, "That's 19 task pairs, three runs each: a slice, not the whole benchmark.", '', { en: 'That\'s nineteen task pairs, three runs each. A slice, not the whole benchmark.' })],
    ),
    // 14a. The verdict, stamped on the question card.
    anim(
      'verdict',
      'BridgeCrew',
      {
        mode: 'verdict',
        marks: [[0, 'process']],
        card: { q: Q, stamp: { text: 'Process, not more talk', at: [0, 'process'], tone: 'ok' } },
      },
      [say(0.1, 'Verdict: what worked was process, not more talk.', '')],
      { min: 3.6 },
    ),
    // 14b. The so-what.
    anim('advice', 'KeyQuote', { text: "Don't expect agents to invent process. Give them one.", emphasis: ['Give them one'], card }, [
      say(0.1, "Don't expect agents to invent process. Give them one.", ''),
    ], { tail: 1.2 }),
    outro('outro', [say(0.15, 'More at javieraguilar.ai', '', { en: 'More at javier aguilar dot A I.' })]),
  ]),
});

export const VIDEOS = videos(build);
export const TIMELINE = VIDEOS.en.main;
