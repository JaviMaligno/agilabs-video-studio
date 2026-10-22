// Pure state of the spine of the video: the exam and the job, and the bridge between them.
// Left, an exam paper with a score bar that climbs to a gold "#1"; right, a workbench of real
// tasks; between them a dashed bridge, "does it transfer?", whose thickness is the whole idea.
// Above it a band (the question, the word, the three probes, the part title); below it a panel
// that changes per scene (the story, the definition, each probe, the fine print, the conductor).
// One mode per scene; each starts where the previous one ended (tracks.ts). No Remotion or React.
import { machine, type ModeDef } from './tracks.ts';

export const MODES = [
  'hook',
  'story',
  'tables',
  'question',
  'name',
  'define',
  'split',
  'three',
  'p1',
  'p1fam',
  'p2',
  'p2fan',
  'p3',
  'p3time',
  'p3hedge',
  'flip',
  'fine',
  'conductor',
  'lit',
  'verdict',
  'open',
] as const;
export type BridgeMode = (typeof MODES)[number];
export type ExamBridgeProps = { mode: BridgeMode; marks?: number[] };

// ── On-screen text (factcheck.md, "Numbers and text on screen"). ───────────────────────────────
export const TXT = {
  transfer: ['does it', 'transfer?'],
  tasks: ['fix a bug', 'plan a release', 'agent team'],
  question: 'Optimised for the exam?',
  word: 'BENCHMAXING',
  arrows: ['train the model', 'pick what to report'],
  split: ['the subject', 'the format'],
  same: 'same score',
  foot7: 'a higher score alone demonstrates neither fraud nor a lack of intelligence',
  probes: [
    { n: '1', short: 'familiarity', long: 'familiarity with the test' },
    { n: '2', short: 'selective reporting', long: 'selective reporting' },
    { n: '3', short: 'metric vs work', long: 'the metric vs the work' },
  ],
  gsm: { chip: 'GSM1k', text: 'new problems comparable to GSM8k' },
  fam: { drop: 'drops, signs of overfitting', hold: 'little evidence in many frontier models' },
  lb: { arena: 'LMArena', model: 'Llama 4', elo: 'Elo 1417', tag: 'experimental chat version (Meta stated it)' },
  fan: { n: 27, counter: 'private variants', tag: 'only the selected result is visible', chip: 'The Leaderboard Illusion' },
  metr: { chip: 'METR', text: 'randomised trial · 16 developers · 246 tasks' },
  time: { without: 'without AI', with: 'with early-2025 AI tools', plus: '+19%', saved: 'saved time ✓' },
  early: 'early 2025',
  foot16: ["the 2026 follow-up's signal was judged unreliable", 'not a proof of benchmaxing'],
  title: 'score vs experience',
  card: { model: 'Opus 5', bench: 'Frontier-Bench', back: 'fine print' },
  fine: ['Frontier-Bench · internal run', 'particular environment', 'mean reward over 5 attempts per task', 'Opus 4.8 fallback for safety blocks'],
  cond: { lead: 'lead agent', sub: 'subagent', slow: 'slow step', out: 'deliverable' },
  condStamp: 'not in the announced benchmarks',
  condTag: ['a new benchmark scores this', 'Fable 5 leads, 60.0% · Opus 5 shipped after it'],
  qmark: '?',
  stamp: 'check the transfer',
  story: { me: 'me', people: 'people I talk to', bubble: 'feels no better' },
  tableA: { title: 'a table', rows: ['Opus 5', 'Fable 5'] },
  tableB: { title: 'my experience', rows: ['Fable 5', 'Opus 5'] },
  buttons: ['accuse', 'test'],
  redo: 'redo',
  chip: 'Opus 5',
} as const;

/** Which family bars sink on the fresh problems (illustrative: the article gives no values). */
export const FAMILY_DROPS = [false, true, false, false, true, false, true];

const INIT = {
  // spine
  spineY: 200,
  spine: 1,
  zoom: 0,
  score: 0.22,
  gold: 0,
  bridge: 0.3,
  benchDim: 0,
  paperDim: 0,
  redo: 0,
  opus: 0,
  fresh: 0,
  travel: 0,
  watch: 0,
  hand: 0,
  away: 0,
  dim: 0,
  // band
  q: 0,
  word: 0,
  slots: 0,
  big: 0,
  s1: 0,
  s2: 0,
  s3: 0,
  title: 0,
  // story
  people: 0,
  me: 0,
  p1: 0,
  p2: 0,
  tables: 0,
  flipT: 0,
  crack: 0,
  buttons: 0,
  strike: 0,
  test: 0,
  // name, definition, split
  stamp: 0,
  stampFly: 0,
  a1: 0,
  a2: 0,
  minis: 0,
  miniScore: 0,
  thick: 0,
  tagL: 0,
  tagR: 0,
  same: 0,
  foot7: 0,
  // probe 1
  gsm: 0,
  fam: 0,
  drop: 0,
  famL: 0,
  famR: 0,
  // probe 2
  lb: 0,
  lbTag: 0,
  fan: 0,
  illusion: 0,
  fanTag: 0,
  // probe 3
  metr: 0,
  tbars: 0,
  without: 0,
  with: 0,
  plus: 0,
  saved: 0,
  early: 0,
  foot16: 0,
  // fine print
  card: 0,
  flip: 0,
  f1: 0,
  f2: 0,
  f3: 0,
  f4: 0,
  // conductor
  cond: 0,
  fly: 0,
  fold: 0,
  condStamp: 0,
  condTag: 0,
  // verdict, and the open question
  transfer: 0,
  qmark: 0,
};
export type Field = keyof typeof INIT;

const off = (at: number | ['m' | 'b', number, number?] = 0, len = 0.35) => ({ to: 0, at, len });
const on = (at: number | ['m' | 'b', number, number?] = 0, len = 0.45) => ({ to: 1, at, len });

// Marks per mode are listed next to it: the spoken word each mark sits on (timeline.ts).
const DEFS: [BridgeMode, ModeDef<Field>][] = [
  // "A higher benchmark score doesn't always feel like a better model." marks: higher, doesn't.
  [
    'hook',
    {
      set: {
        score: { to: 1, at: ['m', 0, -0.1], len: 1.0 },
        gold: on(['m', 0, 0.75], 0.4),
        benchDim: { to: 0.55, at: ['m', 1], len: 0.6 },
        redo: on(['m', 1, 0.25], 0.35),
      },
    },
  ],
  // "With Opus 5 I felt that. So did people I talk to." marks: opus, felt, so.
  [
    'story',
    {
      set: {
        spineY: { to: 0, at: 0, len: 0.8, ease: 'inout' },
        benchDim: { to: 0.15, at: ['m', 0, -0.2], len: 0.4 },
        opus: on(['m', 0, -0.1], 0.45),
        people: on(0.6, 0.4),
        me: on(['m', 1], 0.4),
        p1: on(['m', 2], 0.4),
        p2: on(['m', 2, 0.35], 0.4),
      },
    },
  ],
  // "Some tables even put it above Fable. My experience said otherwise." marks: tables, experience, otherwise.
  [
    'tables',
    {
      set: {
        people: off(0.1),
        me: off(0.1),
        p1: off(0.1),
        p2: off(0.1),
        tables: on(['m', 0, -0.2], 0.45),
        flipT: on(['m', 1, -0.1], 0.45),
        crack: on(['m', 2], 0.4),
      },
    },
  ],
  // "Was it optimised for the exam? I wanted to test, not assume." marks: optimised, wanted, test, assume.
  [
    'question',
    {
      set: {
        q: on(['m', 0, -0.3], 0.45),
        tables: off(['m', 1, -0.3]),
        flipT: off(['m', 1, -0.3]),
        crack: off(['m', 1, -0.3]),
        buttons: on(['m', 1], 0.4),
        test: on(['m', 2], 0.35),
        strike: on(['m', 3, -0.1], 0.35),
      },
    },
  ],
  // "That suspicion has a name. Benchmaxing." marks: benchmaxing.
  [
    'name',
    {
      set: {
        dim: on(['m', 0, -0.35], 0.35),
        stamp: { to: 1, at: ['m', 0, -0.05], len: 0.3 },
        buttons: off(['m', 0, -0.35]),
        test: off(['m', 0, -0.35]),
        strike: off(['m', 0, -0.35]),
        q: off(['m', 0, -0.35]),
        // Reset under the dim, so the definition can make the bar climb again.
        score: { to: 0.22, at: ['m', 0, 0.1], len: 0.3 },
        gold: off(['m', 0, 0.1], 0.2),
        redo: off(['m', 0, 0.1], 0.2),
        opus: off(['m', 0, 0.1], 0.2),
        benchDim: { to: 0, at: ['m', 0, 0.1], len: 0.3 },
      },
    },
  ],
  // "Optimising a model, or which results you report, to maximise scores." marks: model, results, maximise.
  [
    'define',
    {
      set: {
        stampFly: { to: 1, at: 0, len: 0.55, ease: 'inout' },
        word: on(0.25, 0.4),
        dim: off(0.1, 0.5),
        a1: on(['m', 0, -0.15], 0.4),
        a2: on(['m', 1, -0.15], 0.4),
        score: { to: 1, at: ['m', 2, -0.25], len: 1.0 },
        gold: on(['m', 2, 0.6], 0.35),
      },
    },
  ],
  // "Exam prep can teach the subject, or just the format." marks: prep, subject, format.
  [
    'split',
    {
      set: {
        a1: off(0),
        a2: off(0),
        // The probes' big rows (scene 8) are armed here, unseen: no probe is visible yet.
        big: { to: 1, at: 0, len: 0 },
        spine: off(0.05, 0.45),
        minis: on(0.25, 0.5),
        miniScore: { to: 1, at: ['m', 0], len: 1.3 },
        tagL: on(['m', 1, -0.1], 0.4),
        thick: { to: 1, at: ['m', 1, -0.1], len: 0.8 },
        tagR: on(['m', 2, -0.1], 0.4),
        same: on(['m', 2, 0.55], 0.4),
        foot7: on(['m', 2, 0.9], 0.4),
      },
    },
  ],
  // "At least three different things hide behind it." marks: three.
  [
    'three',
    {
      set: {
        minis: off(0, 0.4),
        tagL: off(0),
        tagR: off(0),
        same: off(0),
        foot7: off(0),
        spine: on(0.2, 0.5),
        word: off(['m', 0, -0.4], 0.3),
        slots: { to: 1, at: ['m', 0, -0.05], len: 0.9, ease: 'linear' },
        paperDim: { to: 0.5, at: ['m', 0], len: 0.5 },
        benchDim: { to: 0.5, at: ['m', 0], len: 0.5 },
      },
    },
  ],
  // "One. Give models fresh problems, like the test's." marks: one, fresh.
  [
    'p1',
    {
      set: {
        big: { to: 0, at: 0, len: 0.7, ease: 'inout' },
        paperDim: off(0.3, 0.5),
        s1: on(['m', 0, -0.1], 0.35),
        fresh: { to: 1, at: ['m', 1, -0.15], len: 0.7 },
        gsm: on(['m', 1, 0.2], 0.4),
      },
    },
  ],
  // "Several model families dropped. Many frontier models held up." marks: dropped, held.
  [
    'p1fam',
    {
      set: {
        fam: on(0.1, 0.4),
        drop: { to: 1, at: ['m', 0, -0.3], len: 0.8 },
        famL: on(['m', 0, 0.1], 0.35),
        famR: on(['m', 1, -0.1], 0.35),
      },
    },
  ],
  // "Two. Llama 4's headline arena score came from an experimental chat version." marks: two, llama, experimental.
  [
    'p2',
    {
      set: {
        s1: off(['m', 0, -0.1]),
        s2: on(['m', 0, -0.1], 0.35),
        fresh: off(0.1, 0.5),
        gsm: off(0.1),
        fam: off(0.1),
        famL: off(0.1),
        famR: off(0.1),
        lb: on(['m', 1, -0.2], 0.45),
        lbTag: on(['m', 2], 0.4),
      },
    },
  ],
  // "And one study found 27 private Meta variants tested before it." marks: study, twenty, before.
  [
    'p2fan',
    {
      set: {
        illusion: on(['m', 0, -0.1], 0.35),
        fan: { to: 1, at: ['m', 1, -0.2], len: 1.3, ease: 'linear' },
        fanTag: on(['m', 2, 0.1], 0.4),
      },
    },
  ],
  // "Three. Skip the test and measure the work." marks: three, skip, work.
  [
    'p3',
    {
      set: {
        s2: off(['m', 0, -0.1]),
        s3: on(['m', 0, -0.1], 0.35),
        lb: off(0.1),
        lbTag: off(0.1),
        fan: off(0.1),
        illusion: off(0.1),
        fanTag: off(0.1),
        paperDim: { to: 0.6, at: ['m', 1], len: 0.5 },
        benchDim: off(['m', 1], 0.5),
        travel: { to: 1, at: ['m', 1], len: 1.0, ease: 'inout' },
        watch: on(['m', 2, -0.1], 0.4),
        metr: on(['m', 2, 0.15], 0.4),
      },
    },
  ],
  // "Developers using early-2025 AI tools took 19% longer, while believing they had saved time."
  // marks: developers, longer, believing.
  [
    'p3time',
    {
      set: {
        tbars: on(['m', 0, -0.1], 0.4),
        without: { to: 1, at: ['m', 0, 0.2], len: 0.9 },
        with: { to: 1, at: ['m', 0, 0.6], len: 1.5 },
        hand: { to: 1, at: ['m', 0], len: 4.5, ease: 'linear' },
        plus: on(['m', 1, -0.1], 0.35),
        saved: on(['m', 2, 0.1], 0.4),
      },
    },
  ],
  // "That was early tools, not today's models." marks: early, today.
  [
    'p3hedge',
    {
      set: {
        early: { to: 1, at: ['m', 0, -0.05], len: 0.3 },
        foot16: on(['m', 1, 0.1], 0.4),
      },
    },
  ],
  // "A score describes the conditions it was run under." marks: score, conditions.
  [
    'flip',
    {
      set: {
        s3: off(0.1),
        slots: off(0.1, 0.4),
        title: on(0.3, 0.45),
        metr: off(0.05),
        tbars: off(0.05),
        without: off(0.05),
        with: off(0.05),
        plus: off(0.05),
        saved: off(0.05),
        early: off(0.05),
        foot16: off(0.05),
        watch: off(0.05),
        travel: off(0.05),
        paperDim: off(0.1),
        card: on(['m', 0, -0.2], 0.45),
        flip: { to: 1, at: ['m', 1, -0.1], len: 0.7, ease: 'inout' },
      },
    },
  ],
  // "One Opus 5 score is an internal run, averaged over five attempts." marks: internal, averaged, five.
  [
    'fine',
    {
      set: {
        f1: on(['m', 0, -0.1], 0.4),
        f2: on(['m', 0, 0.6], 0.4),
        f3: on(['m', 1, -0.1], 0.4),
        f4: on(['m', 2, 0.6], 0.4),
      },
    },
  ],
  // "I feel the gap when managing other agents, and its announced benchmarks don't measure that."
  // marks: managing, announced, measure.
  [
    'conductor',
    {
      set: {
        card: off(0, 0.4),
        f1: off(0, 0.3),
        f2: off(0, 0.3),
        f3: off(0, 0.3),
        f4: off(0, 0.3),
        zoom: { to: 1, at: 0.1, len: 0.9, ease: 'inout' },
        cond: on(0.5, 0.5),
        fly: { to: 1, at: ['m', 0, -0.1], len: 1.6, ease: 'linear' },
        fold: { to: 1, at: ['m', 1, -0.6], len: 1.2, ease: 'linear' },
        condStamp: { to: 1, at: ['m', 1, 0.2], len: 0.3 },
        condTag: on(['m', 1, 0.9], 0.45),
      },
    },
  ],
  // "The research gives good reasons to take it seriously." marks: research, reasons.
  // Comes after the pilot (a dip from another component): it opens on the plain spine, so the
  // conductor left at the end of scene 19 is cleared at once, not shown zooming out.
  [
    'lit',
    {
      set: {
        cond: { to: 0, at: 0, len: 0 },
        condStamp: { to: 0, at: 0, len: 0 },
        condTag: { to: 0, at: 0, len: 0 },
        title: { to: 0, at: 0, len: 0 },
        fly: { to: 0, at: 0, len: 0 },
        fold: { to: 0, at: 0, len: 0 },
        zoom: { to: 0, at: 0, len: 0 },
        spineY: { to: 200, at: 0, len: 0 },
        benchDim: { to: 0, at: 0, len: 0 },
        score: { to: 1, at: 0, len: 0 },
        gold: { to: 1, at: 0, len: 0 },
        slots: on(0.4, 0.5),
        s1: on(['m', 1, -0.1], 0.35),
        s2: on(['m', 1, 0.05], 0.35),
        s3: on(['m', 1, 0.2], 0.35),
      },
    },
  ],
  // "But the further a test sits from my work, the more it needs checking." marks: further, checking.
  [
    'verdict',
    {
      set: {
        away: { to: 1, at: ['m', 0, -0.1], len: 1.8, ease: 'inout' },
        bridge: { to: 0, at: ['m', 0, -0.1], len: 1.8 },
        transfer: { to: 1, at: ['m', 1, -0.05], len: 0.3 },
      },
    },
  ],
  // "Was Opus 5 benchmaxed? That's the question worth keeping open." marks: benchmaxed, question.
  // The open ending: the spine rises, a "?" over the stretched bridge, and the doubt itself below
  // (a table vs my experience, the cards of scene 3). No verdict stamp.
  [
    'open',
    {
      set: {
        transfer: off(0.05, 0.35),
        spineY: { to: 0, at: 0.1, len: 0.8, ease: 'inout' },
        qmark: on(['m', 0, -0.2], 0.5),
        tables: on(['m', 1, -0.3], 0.45),
        flipT: on(['m', 1, -0.05], 0.45),
      },
    },
  ],
];

export const BRIDGE = machine(INIT, DEFS);

export type BridgeState = Record<Field, number>;

export function frameState(props: ExamBridgeProps, t: number, beats: number[], dur: number): BridgeState {
  const mode = MODES.includes(props.mode) ? props.mode : 'hook';
  return BRIDGE.at(mode, t, beats, dur, props.marks);
}

/** Stroke width of the bridge, in px: a thread at 0, thick at 1. */
export const bridgeWidth = (bridge: number, thick = 0): number => 3 + 24 * Math.max(0, Math.min(1, Math.max(bridge, thick)));
