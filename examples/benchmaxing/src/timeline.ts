// Benchmaxing: Winning the Exam Is Not Doing Better Work — article video (EN). Narration from the
// script v1.0 (script.md), built as written; every figure traced in factcheck.md.
// Structure (scene numbers from the script):
// - ExamBridge (1-19, 28-29, the open close): the exam and the job, and the bridge between them;
//   one mode per scene, each starting where the previous one ended, so consecutive scenes blend;
// - PilotGrid (20, 25, 26): the article's first figure, closed as one small probe;
// - WorkerRace (21-24): the article's second figure, the race that breaks both proposals.
// Marks are [line, word]: resolved to scene seconds from the TTS word timestamps (marks.ts).
import type { Cuts, Scene } from './types.ts';
import { anim, outro, say, videos, voice } from './narrate.ts';
import { WORDS } from './audio.generated.ts';
import { resolveMark, type MarkSpec } from './marks.ts';

/** Marks resolved to scene seconds, and the layout that decides which scenes blend (same component). */
const finish = (scenes: Scene[]): Scene[] => {
  const words = WORDS[voice()];
  return scenes.map((s) => {
    if (s.kind !== 'anim' || !s.anim) return s;
    const props = { ...s.anim.props };
    props.layout = s.anim.name;
    if (Array.isArray(props.marks)) props.marks = (props.marks as MarkSpec[]).map((m) => resolveMark(s.lines, m, words, voice()));
    return { ...s, anim: { ...s.anim, props } };
  });
};

/** Tail of a scene that blends into the same picture: as long as the blend itself. */
const BLEND = 0.6;

const bridge = (id: string, mode: string, marks: MarkSpec[], lines: ReturnType<typeof say>[], opts: { min?: number; tail?: number } = {}) =>
  anim(id, 'ExamBridge', { mode, marks }, lines, { tail: BLEND, ...opts });

const build = (): Cuts => ({
  main: finish([
    // 1. Cold open: the score climbs to #1, the work gets a "redo".
    bridge('hook', 'hook', [[0, 'higher'], [0, 'doesn']], [say(0.4, "A higher benchmark score doesn't always feel like a better model.", '')], { tail: 0.9 }),
    // 2-4. The story: Opus 5, people I talk to, the tables, the question.
    bridge('story', 'story', [[0, 'opus'], [0, 'felt'], [1, 'so']], [say(0.3, 'With Opus 5 I felt that.', ''), say(0, 'So did people I talk to.', '')], { tail: 0.9 }),
    bridge('tables', 'tables', [[0, 'tables'], [1, 'experience'], [1, 'otherwise']], [say(0.15, 'Some tables even put it above Fable.', ''), say(0, 'My experience said otherwise.', '')], { tail: 0.9 }),
    bridge('question', 'question', [[0, 'optimised'], [1, 'wanted'], [1, 'test'], [1, 'assume']], [say(0.15, 'Was it optimised for the exam?', ''), say(0, 'I wanted to test, not assume.', '')], { tail: 0.9 }),
    // 5. Key moment 1: the name.
    bridge('name', 'name', [[1, 'benchmaxing']], [say(0.2, 'That suspicion has a name.', ''), say(0, 'Benchmaxing.', '')], { tail: 0.9 }),
    // 6-7. What it means: two ways to raise the score; the subject or the format.
    bridge('define', 'define', [[0, 'model'], [0, 'results'], [0, 'maximise']], [say(0.3, 'Optimising a model, or which results you report, to maximise scores.', '')], { tail: 0.9 }),
    bridge('split', 'split', [[0, 'prep'], [0, 'subject'], [0, 'format']], [say(0.4, 'Exam prep can teach the subject, or just the format.', '')], { tail: 2.4 }),
    // 8. Key moment 2: three things to separate.
    bridge('three', 'three', [[0, 'three']], [say(0.3, 'At least three different things hide behind it.', '')], { tail: 1.4 }),
    // 9-10. Probe 1: familiarity with the test.
    bridge('p1', 'p1', [[0, 'one'], [0, 'fresh']], [say(0.5, "One. Give models fresh problems, like the test's.", '')], { tail: 1.2 }),
    bridge('p1fam', 'p1fam', [[0, 'dropped'], [1, 'held']], [say(0.2, 'Several model families dropped.', ''), say(0, 'Many frontier models held up.', '')], { tail: 1.6 }),
    // 11-12. Probe 2: selective reporting.
    bridge(
      'p2',
      'p2',
      [[0, 'two'], [0, 'llama'], [0, 'experimental']],
      [say(0.4, "Two. Llama 4's headline arena score came from an experimental chat version.", '', { en: "Two. Llama four's headline arena score came from an experimental chat version." })],
      { tail: 1.2 },
    ),
    bridge(
      'p2fan',
      'p2fan',
      [[0, 'study'], [0, 'twenty'], [0, 'before']],
      [say(0.2, 'And one study found 27 private Meta variants tested before it.', '', { en: 'And one study found twenty-seven private Meta variants tested before it.' })],
      { tail: 1.6 },
    ),
    // 13-16. Probe 3: measure the work.
    bridge('p3', 'p3', [[0, 'three'], [0, 'skip'], [0, 'work']], [say(0.4, 'Three. Skip the test and measure the work.', '')], { tail: 1.4 }),
    bridge(
      'p3time',
      'p3time',
      [[0, 'developers'], [0, 'longer'], [0, 'believing']],
      [
        say(0.2, 'Developers using early-2025 AI tools took 19% longer, while believing they had saved time.', '', {
          en: 'Developers using early twenty twenty-five AI tools took nineteen percent longer, while believing they had saved time.',
        }),
      ],
      { tail: 1.2 },
    ),
    bridge('p3hedge', 'p3hedge', [[0, 'early'], [0, 'today']], [say(0.2, "That was early tools, not today's models.", '')], { tail: 2.6 }),
    // 17-19. Key moment 3: what a score describes, and the work no announced benchmark measures.
    bridge('flip', 'flip', [[0, 'score'], [0, 'conditions']], [say(0.4, 'A score describes the conditions it was run under.', '')], { tail: 0.9 }),
    bridge('fine', 'fine', [[0, 'internal'], [0, 'averaged'], [0, 'five']], [say(0.2, 'One Opus 5 score is an internal run, averaged over five attempts.', '')], { tail: 1.8 }),
    bridge(
      'conductor',
      'conductor',
      [[0, 'managing'], [0, 'announced'], [0, 'measure']],
      [say(0.5, "I feel the gap when managing other agents, and its announced benchmarks don't measure that.", '')],
      { tail: 3.0 },
    ),
    // 20-25. The pilot: five cases, the rule, the race, the ties.
    anim('pilot', 'PilotGrid', { mode: 'empty', marks: [[0, 'pilot'], [1, 'five']] }, [say(0.4, 'So I ran a small pilot.', ''), say(0, 'Five cases per model.', '')], { tail: 2.0 }),
    anim('rule', 'WorkerRace', { mode: 'rule', marks: [[0, 'rule'], [1, 'never']] }, [say(0.4, 'Two cases had one rule.', ''), say(0, 'Never send the same thing twice.', '')], { tail: BLEND }),
    anim('proposal', 'WorkerRace', { mode: 'proposal', marks: [[0, 'both'], [0, 'time']] }, [say(0.2, 'Both relied on a time check before retrying.', '')], { tail: 1.0 }),
    anim('stop1', 'WorkerRace', { mode: 'stop1', marks: [[0, 'check'], [0, 'pause']] }, [say(0.2, 'But a worker can check, then pause.', '')], { tail: BLEND }),
    anim(
      'stops',
      'WorkerRace',
      { mode: 'stops', marks: [[0, 'another'], [0, 'forgets'], [0, 'first'], [0, 'again']] },
      [say(0.2, 'Another sends, the provider forgets, and the first sends again.', '')],
      { tail: 2.0 },
    ),
    anim('tied', 'PilotGrid', { mode: 'filled', marks: [[0, 'permissions'], [0, 'data'], [0, 'tied']] }, [say(0.5, 'On permissions and data analysis, they tied.', '')], { tail: 1.4 }),
    // 26. The pilot, reported as what it was: one small probe.
    anim('probe', 'PilotGrid', { mode: 'probe', marks: [[0, 'probe']] }, [say(0.2, 'Five cases are a probe, not an answer.', '')], { tail: 1.4 }),
    // 28-29 and the close: the literature, the transfer, and the question left open.
    bridge('lit', 'lit', [[0, 'research'], [0, 'reasons']], [say(0.3, 'The research gives good reasons to take it seriously.', '')], { tail: 1.1 }),
    bridge('verdict', 'verdict', [[0, 'further'], [0, 'checking']], [say(0.2, 'But the further a test sits from my work, the more it needs checking.', '')], { tail: 1.0 }),
    bridge(
      'open',
      'open',
      [[0, 'benchmaxed'], [1, 'question']],
      [say(0.3, 'Was Opus 5 benchmaxed?', ''), say(0.1, "That's the question worth keeping open.", '')],
      { tail: 2.0 },
    ),
    outro('outro', [say(0.15, 'More at javieraguilar.ai', '', { en: 'More at javier aguilar dot A I.' })]),
  ]),
});

export const VIDEOS = videos(build);
/** The English main cut. */
export const TIMELINE = VIDEOS.en.main;
