// Benchmaxing, parts 1-3, in one video (EN only). Script: script.md. Facts: factcheck.md.
import type { Cuts } from './types.ts';
import { anim, intro, outro, say, videos } from './narrate.ts';

const COLS = ['Gemini', 'Opus', 'Fable', 'GLM', 'Kimi', 'Qwen', 'DeepSeek'];
// Deducible corrections per task, mean of the two Claude judges (benchmaxing-probes/realtasks/results).
const ROWS: { label: string; values: number[] }[] = [
  { label: "Chat flow: a step before 'Venue'", values: [0, 1, 1, 1.5, 1.5, 1, 2.5] },
  { label: 'Health app: type while it answers', values: [0, 1, 1, 1, 2, 2, 2] },
  { label: 'PDF report: overlapping tables', values: [0.5, 2, 0.5, 3, 1.5, 4, 3] },
  { label: 'Writing: do I overuse a word?', values: [2.5, 1.5, 3, 2, 1, 3, 2.5] },
  { label: 'Website: show all projects?', values: [3, 2, 2, 3, 2, 1.5, 3] },
  { label: 'Website: blog to LinkedIn?', values: [2.5, 2, 3, 2, 1.5, 3, 4] },
  { label: 'Classifier: flat fields for schemas', values: [1, 3, 3.5, 1, 3, 3, 4] },
  { label: 'Chat flow: stray submit option', values: [3, 2, 3, 3, 3, 2, 3] },
  { label: 'Ops bot: compact tool outputs', values: [1.5, 2.5, 1.5, 3.5, 2.5, 4.5, 3.5] },
  { label: 'Analysis service: README up to date?', values: [1.5, 2.5, 3.5, 3, 1.5, 2.5, 5] },
  { label: 'Classifier: false register match', values: [3, 2.5, 3, 3, 3, 3, 3] },
  { label: 'Ops bot: is it all audited?', values: [3, 3, 4, 3, 0.5, 3.5, 5.5] },
  { label: 'Analysis agents: alternative plan', values: [2, 3, 4, 3.5, 5, 4.5, 3.5] },
  { label: 'MCP server: implement a plan', values: [4.5, 3.5, 3.5, 3.5, 3.5, 3.5, 4.5] },
  { label: 'Health app: English and Russian', values: [2.5, 4, 4, 4.5, 6, 4, 2.5] },
  { label: 'Analysis agents: merge outputs', values: [2.5, 4, 4, 2.5, 5.5, 5, 4] },
  { label: 'Classifier: how does the selector work?', values: [5, 5.5, 1, 4.5, 6, 4.5, 6.5] },
  { label: 'Classifier: real version in /health', values: [6.5, 5.5, 6, 5.5, 6.5, 4.5, 6] },
  { label: 'Health app: documented chat bugs', values: [6.5, 5, 6, 6, 5.5, 5.5, 8] },
];
const PILES = [
  { name: 'Gemini', value: 2.7, display: '2.7' },
  { name: 'Opus', value: 2.9, display: '2.9' },
  { name: 'Fable', value: 3.0, display: '3.0' },
  { name: 'GLM', value: 3.1, display: '3.1' },
  { name: 'Kimi', value: 3.2, display: '3.2' },
  { name: 'Qwen', value: 3.4, display: '3.4' },
  { name: 'DeepSeek', value: 4.0, display: '4.0', highlight: true },
];
const E = '';

const build = (): Cuts => ({
  main: [
    intro('hook', [
      say(0.1, 'Do the AI models that win benchmarks do better work?', E, undefined, { emotion: 'curious' }),
      say(0, 'I tested it three times.', E),
    ]),
    anim('bench', 'SeriesRecap', { mode: 'bench' }, [
      say(0.3, 'Benchmarks are exams for AI models:', E),
      say(0, 'the same set of problems for everyone, a score, and a ranking.', E),
    ]),
    anim('story', 'SeriesRecap', { mode: 'podium', variant: 'story' }, [
      say(0.3, 'On some of those rankings, Opus 5 beat Fable.', E, { en: 'On some of those rankings, Opus five beat Fable.' }),
      say(0, "But working with it, it didn't feel better to me.", E),
    ]),
    anim('name', 'SeriesRecap', { mode: 'podium', variant: 'name' }, [
      say(0.2, 'Was it trained for the exam?', E, undefined, { emotion: 'skeptical' }),
      say(0, 'That suspicion has a name: benchmaxing.', E),
      say(0, 'tuning a model to win the exam, not to do better work.', E),
    ]),
    anim('twins', 'SeriesRecap', { mode: 'twins' }, [
      say(0.3, 'So I gave every exam question a twin:', E),
      say(0, 'same method, new numbers.', E),
      say(0, 'None of the seven models stumbled on the twins.', E),
    ]),
    anim('agents', 'SeriesRecap', { mode: 'agents' }, [
      say(0.3, 'Then each model ran a team of its own agents.', E),
      say(0, 'Six of seven got everything right.', E),
    ]),
    anim('catch', 'SeriesRecap', { mode: 'desks' }, [
      say(0.3, 'But my tests were exams too:', E, undefined, { emotion: 'skeptical' }),
      say(0, 'a written task, and an answer key.', E),
      say(0, 'Real work has neither.', E),
    ]),
    anim(
      'setup',
      'TaskBench',
      { mode: 'setup', cameos: [{ pose: 'laptop', at: [1, 'nineteen'], dur: 2.6 }] },
      [
        say(0.3, 'So I dropped the key.', E, undefined, { emotion: 'confident' }),
        say(0, 'I took nineteen things I had really asked an agent to do,', E),
        say(0, 'and counted how many of my corrections each model needed.', E),
      ],
    ),
    anim('judges', 'TaskBench', { mode: 'judges' }, [
      say(0.3, 'Three blind judges, from two labs, did the counting.', E),
    ], { min: 4.5 }),
    anim('finding', 'TaskBench', { mode: 'piles', piles: PILES }, [
      say(0.3, 'Six models needed about three corrections per task.', E),
      say(0, 'DeepSeek needed four.', E, undefined, { emotion: 'amazed' }),
    ], { min: 7 }),
    anim('nobody', 'TaskBench', { mode: 'piles', piles: PILES, grown: true, stamp: 'accepted as is: 8 of 266' }, [
      say(0.2, 'And none of them got it right on its own.', E),
    ], { min: 5 }),
    anim('task', 'TaskHeatmap', { columns: COLS, rows: ROWS, max: 8, highlightColumn: 6 }, [
      say(0.4, 'What mattered far more was the task:', E),
      say(0.6, 'the same ones were easy, or hard, for everyone.', E),
    ], { min: 9 }),
    anim('question', 'QuestionChat', { mode: 'chat' }, [
      say(0.3, 'And when I asked a question,', E),
      say(0.4, 'every model answered it, and stopped.', E),
    ], { min: 6 }),
    anim(
      'question2',
      'QuestionChat',
      { mode: 'count', cameos: [{ pose: 'amazed', at: [0, 'Forty'], dur: 2.4 }] },
      [say(0.2, 'Forty times out of forty-nine.', E, undefined, { emotion: 'amazed' })],
      { min: 3.5 },
    ),
    anim(
      'opus',
      'TaskBench',
      {
        mode: 'pair',
        a: { name: 'Opus', value: 2.9, display: '2.9' },
        b: { name: 'Fable', value: 3.0, display: '3.0' },
        cameos: [{ pose: 'laughing', at: [2, 'touches'], dur: 2.4 }],
      },
      [
        say(0.3, 'And my old hunch about Opus?', E, undefined, { emotion: 'curious' }),
        say(0, 'Same corrections as Fable.', E),
        say(0, 'It just touches more things nobody asked for.', E),
        say(0, 'Over months, that is what makes code harder to maintain.', E, undefined, { emotion: 'contemplative' }),
      ],
    ),
    anim(
      'verdict',
      'KeyQuote',
      { text: 'On my work, the model mattered less than the task, and how I asked for it.', emphasis: ['the task', 'how I asked'] },
      [
        say(0.3, 'On my work, the model mattered less than the task,', E, undefined, { emotion: 'confident', speed: 1.05 }),
        say(0, 'and how I asked for it.', E, undefined, { emotion: 'confident', speed: 1.05 }),
      ],
    ),
    anim(
      'close',
      'KeyQuote',
      { text: 'If I want the change, I should ask for the change.', emphasis: ['ask for the change'] },
      [say(0.3, 'If I want the change, I should ask for the change.', E, undefined, { emotion: 'confident' })],
      { min: 5 },
    ),
    outro('outro', [say(0.4, 'More at javieraguilar.ai.', E)]),
  ],
});

export const VIDEOS = videos(build);
/** The English main cut. */
export const TIMELINE = VIDEOS.en.main;
