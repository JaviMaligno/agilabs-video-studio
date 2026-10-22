// Pure state of the OwnerShelf scenes, the spine of the video: a registry shelf with a box
// labelled 0.4.0 that holds old code, an agent chip buried under tickets, the brief with (or
// without) its ownership paragraph, and the name tag "owner: you". Stylised, chosen for impact;
// every number and quoted text comes from the article (factcheck.md). No Remotion or React here.
import { beatAt, easeOutCubic, fit, progress, sceneTime } from './steps.ts';

export type Mode = 'hook' | 'story' | 'question' | 'load' | 'arms' | 'quote' | 'run' | 'close';

export type OwnerShelfProps = {
  mode: Mode;
  /** Read by Video.tsx: cross-blend from the previous scene instead of dipping through black. */
  blend?: boolean;
  /** Read by Video.tsx: the first narration line is drawn by the scene as its title. */
  titleLine?: boolean;
};

// ---------------------------------------------------------------- texts (verbatim where quoted)

export const HOOK_TITLE = 'One paragraph made my agent check its own release.';
export const QUESTION = 'Does naming an owner make agents check?';
export const RELEASE_LINES = ['$ release 0.4.0', 'tests green', 'tag in origin', 'upload: widgetkit 0.4.0 (cached)'] as const;
/** The ownership paragraph, verbatim from the article (the treatment block). */
export const PARA_TITLE = 'Ownership of this release.';
export const PARAGRAPH =
  'On this release you own the published state: nobody is going to verify it behind you. If you report that 0.4.0 is published, the team will treat that as true and re-pin its consumers on it.';
export const PARA_EMPHASIS = ['you', 'own', 'nobody'];
export const STRUCK = ['where to look', 'registry', 'checklist'] as const;
export const CLOSE_LINE = "It's making the claim belong to somebody.";
/** Result figures as the article's table writes them. */
export const RESULT = {
  without: { label: 'no owner named', value: 8, display: '8/15 = 53 %' },
  with: { label: 'owner named', value: 15, display: '15/15 = 100 %' },
  stats: 'p = 0.0063 · 95% CI [27–79 %] vs [78–100 %]',
  note: '15 per arm · one machine',
} as const;
export const N_PER_ARM = 15;
/** Runs that caught the trap without the paragraph (8 of 15); the rest stopped at the tag. */
export const CAUGHT_WITHOUT = 8;

// ---------------------------------------------------------------- geometry (stage px, 960 x 1090)

export const W = 960;
export const H = 1090;

// ---------------------------------------------------------------- helpers

const pulse = (t: number, start: number, len: number) => {
  const p = progress(t, start, len);
  return p <= 0 || p >= 1 ? 0 : Math.sin(Math.PI * p);
};

const timers = (t: number, dur: number) => {
  const P = (start: number, len: number) => progress(t, fit(start, len, dur), len);
  const E = (start: number, len: number) => easeOutCubic(P(start, len));
  const Pu = (start: number, len: number) => pulse(t, fit(start, len, dur), len);
  return { P, E, Pu };
};

/** Beat i, or a fallback when the line is missing or not finite. */
const beat = (beats: number[], i: number, fallback: number) => (beats.length > i && Number.isFinite(beats[i]) ? beats[i] : fallback);

// ---------------------------------------------------------------- per-mode states

function hook(t: number, beats: number[], dur: number) {
  const { P, E, Pu } = timers(t, dur);
  const b0 = beatAt(beats, 0);
  const b1 = beat(beats, 1, b0 + 3.6);
  const span = Math.max(0.6, b1 - 0.35 - b0);
  const words = HOOK_TITLE.split(' ');
  return {
    view: 'hook' as const,
    title: words.map((text, i) => ({ text, key: /^(paragraph|check)$/i.test(text), lit: P(b0 + (i / words.length) * span * 0.95, 0.2) })),
    titleKey: E(b0 + 0.9 * span, 0.3),
    brief: E(b0, 0.35),
    paraGlow: E(b0 + 0.25, 0.4),
    chip: 1,
    tickets: 1,
    /** The chip walks out from under its tickets, down the dotted path to the box. */
    walk: P(b0 + 1.1, 1.1),
    lid: E(b0 + 2.25, 0.35),
    rise: E(b0 + 2.45, 0.45),
    insideFlash: Pu(b0 + 2.9, 0.6),
    /** Line 2: a searchlight sweeps the paragraph for "where", finds nothing. */
    sweep: P(b1 + 0.05, 1.0),
    lens: E(b1, 0.2) * (1 - E(b1 + 1.1, 0.3)),
    notFound: E(b1 + 0.85, 0.3),
    keyTag: E(b1 + 1.2, 0.35),
    keyFlash: Pu(b1 + 1.4, 0.7),
  };
}

function story(t: number, beats: number[], dur: number) {
  const { P, E, Pu } = timers(t, dur);
  const b0 = beatAt(beats, 0);
  const b1 = beat(beats, 1, b0 + 6);
  const b2 = beat(beats, 2, b1 + 3.8);
  const b3 = beat(beats, 3, b2 + 5.2);
  // Line 1, on its words: ran a release · green tests · (tag, helper) · reported … published.
  const lines = [E(b0 + 0.9, 0.25), E(b0 + 2.1, 0.25), E(b0 + 2.55, 0.25), E(b0 + 3.0, 0.25)];
  // Line 4: the box closes again; only a walk to it could tell, and nobody walks it.
  const reclose = E(b3 + 0.1, 0.45);
  return {
    view: 'story' as const,
    pane: E(0, 0.35),
    lines,
    report: E(b0 + 3.3, 0.35),
    stamp: E(b0 + 5.0, 0.25),
    // Line 2: "It wasn't." cracks the report; the registry box opens on old code.
    crack: P(b1 + 0.3, 0.45),
    boxGlow: Pu(b1 + 1.0, 0.9),
    lid: E(b1 + 1.7, 0.35) * (1 - reclose),
    rise: E(b1 + 2.0, 0.45) * (1 - reclose),
    insideFlash: Pu(b1 + 2.5, 0.6),
    // Line 3: another session installs 0.4.0 and gets the old code.
    consumer: E(b2 + 0.5, 0.35),
    install: E(b2 + 1.6, 0.25),
    travel: P(b2 + 2.4, 1.2),
    got: E(b2 + 3.75, 0.3),
    // Line 4: every local tick was true; the path to the box pulses, unwalked; the work piles on.
    ticksLit: Pu(b3 + 0.2, 1.3),
    path: E(b3 + 1.9, 0.5),
    pathPulse: Pu(b3 + 2.4, 0.9),
    pile: [0, 1, 2, 3].map((i) => E(b3 + 3.85 + i * 0.22, 0.3)),
    inbox: E(b3 + 4.85, 0.3),
  };
}

function question(t: number, beats: number[], dur: number) {
  const { E } = timers(t, dur);
  const b0 = beatAt(beats, 0);
  return {
    view: 'question' as const,
    dim: E(0, 0.45),
    band: E(b0, 0.35),
    key: E(b0 + 0.8, 0.3),
  };
}

const TICKETS = ['ticket', 'ticket', 'ticket', 'release 0.4.0'] as const;

function load(t: number, beats: number[], dur: number) {
  const { E, Pu } = timers(t, dur);
  const b0 = beatAt(beats, 0);
  return {
    view: 'load' as const,
    part: E(0, 0.35),
    shelf: E(0, 0.35),
    chip: E(0.1, 0.35),
    alone: E(b0 + 0.6, 0.35),
    trapGlow: Pu(b0 + 0.8, 0.9),
    tickets: TICKETS.map((title, i) => ({ title, release: i === 3, appear: E(b0 + 1.6 + i * 0.35, 0.3) })),
    inbox: E(b0 + 3.0, 0.3),
    bubble: E(b0 + 3.35, 0.3),
    /** Hand-over to the arms scene (blended): nothing fades here. */
    fade: 0,
  };
}

function arms(t: number, beats: number[], dur: number) {
  const { P, E, Pu } = timers(t, dur);
  const b0 = beatAt(beats, 0);
  return {
    view: 'arms' as const,
    /** The loaded agent of the previous scene fades while the frame splits in two lanes. */
    fade: E(0, 0.35),
    split: E(0.35, 0.45),
    chips: Array.from({ length: 2 * N_PER_ARM }, (_, i) => E(b0 + 0.45 + (i % N_PER_ARM) * 0.05, 0.25)),
    identical: E(b0 + 1.2, 0.35),
    print: P(b0 + 2.4, 0.7),
    printGlow: Pu(b0 + 3.0, 0.8),
  };
}

function quote(t: number, beats: number[], dur: number) {
  const { P, E, Pu } = timers(t, dur);
  const b0 = beatAt(beats, 0);
  const b1 = beat(beats, 1, b0 + 4);
  const b2 = beat(beats, 2, b1 + 2.4);
  const words = PARAGRAPH.split(' ');
  const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9.]/g, '');
  // "you own" (first occurrence) and "nobody".
  const emphIdx = new Set<number>();
  words.forEach((w, i) => {
    if (norm(w) === 'nobody') emphIdx.add(i);
    if (norm(w) === 'you' && norm(words[i + 1] ?? '') === 'own') {
      emphIdx.add(i);
      emphIdx.add(i + 1);
    }
  });
  return {
    view: 'quote' as const,
    card: E(0, 0.35),
    title: E(b0 * 0.5, 0.3),
    words: words.map((text, i) => ({ text, opacity: P(b0 + 0.05 + i * 0.042, 0.2), emphasis: emphIdx.has(i) })),
    emphasis: E(b0 + 1.8, 0.4),
    shelf: E(b0 + 2.4, 0.35),
    tag: E(b0 + 3.0, 0.6),
    struck: STRUCK.map((text, i) => ({ text, appear: E(b1 + 0.05 + i * 0.12, 0.25), strike: P(b1 + 0.55 + i * 0.25, 0.25) })),
    who: E(b2 + 0.9, 0.35),
    whoFlash: Pu(b2 + 1.2, 0.8),
  };
}

/** Where run i of an arm ends: caught (walked to the box) or stopped at the tag check. */
export const runOutcome = (arm: 'without' | 'with', i: number): 'caught' | 'tag' => (arm === 'with' || i < CAUGHT_WITHOUT ? 'caught' : 'tag');

function run(t: number, beats: number[], dur: number) {
  const { P, E, Pu } = timers(t, dur);
  const b0 = beatAt(beats, 0);
  const b1 = beat(beats, 1, b0 + 4);
  const b2 = beat(beats, 2, b1 + 2.4);
  const lane = (arm: 'without' | 'with', start: number, step: number) =>
    Array.from({ length: N_PER_ARM }, (_, i) => ({ outcome: runOutcome(arm, i), appear: E(0.05 + i * 0.02, 0.25), move: P(start + i * step, 0.55) }));
  const left = lane('without', b0 + 0.4, 0.13);
  const right = lane('with', b1 + 0.05, 0.05);
  const caught = (l: typeof left) => l.filter((r) => r.outcome === 'caught' && r.move >= 1).length;
  return {
    view: 'run' as const,
    lanes: E(0, 0.35),
    left,
    right,
    leftLid: E(b0 + 0.9, 0.3),
    rightLid: E(b1 + 0.4, 0.3),
    leftCount: caught(left),
    rightCount: caught(right),
    tagChip: E(b0 + 1.3, 0.3),
    barLeft: P(b0 + 2.6, 0.9),
    barRight: P(b1 + 0.8, 0.9),
    rightFlash: Pu(b1 + 1.6, 0.8),
    stats: E(b2 + 0.2, 0.35),
    note: E(b2 + 0.9, 0.35),
  };
}

function close(t: number, beats: number[], dur: number) {
  const { P, E, Pu } = timers(t, dur);
  const b0 = beatAt(beats, 0);
  const b1 = beat(beats, 1, b0 + 3.3);
  const words = CLOSE_LINE.split(' ');
  const span = 2.1;
  return {
    view: 'close' as const,
    shelf: E(0, 0.35),
    report: E(b0 + 0.3, 0.35) * (1 - E(b1 - 0.25, 0.35)),
    note: E(b0 + 0.1, 0.3),
    peel: P(b0 + 2.15, 0.9),
    words: words.map((text, i) => ({ text, key: /^(belong|to|somebody\.?)$/i.test(text), opacity: P(b1 + (i / words.length) * span, 0.2) })),
    tag: E(b1 + 1.5, 0.7),
    tagGlow: Pu(b1 + 2.1, 0.8),
    foot: E(b1 + 2.3, 0.35),
  };
}

export function frameState(p: OwnerShelfProps, time: number, beats: number[], dur: number) {
  const t = sceneTime(time, dur);
  switch (p.mode) {
    case 'hook':
      return hook(t, beats, dur);
    case 'story':
      return story(t, beats, dur);
    case 'question':
      return question(t, beats, dur);
    case 'load':
      return load(t, beats, dur);
    case 'arms':
      return arms(t, beats, dur);
    case 'quote':
      return quote(t, beats, dur);
    case 'run':
      return run(t, beats, dur);
    default:
      return close(t, beats, dur);
  }
}

export type OwnerShelfState = ReturnType<typeof frameState>;
export type HookState = ReturnType<typeof hook>;
export type StoryState = ReturnType<typeof story>;
export type QuestionState = ReturnType<typeof question>;
export type LoadState = ReturnType<typeof load>;
export type ArmsState = ReturnType<typeof arms>;
export type QuoteState = ReturnType<typeof quote>;
export type RunState = ReturnType<typeof run>;
export type CloseState = ReturnType<typeof close>;

/** The finished story (drawn dimmed under the question) and the finished load (under the arms). */
export const storyEnd = (): StoryState => story(Number.MAX_SAFE_INTEGER, [], Number.POSITIVE_INFINITY);
export const loadEnd = (): LoadState => load(Number.MAX_SAFE_INTEGER, [], Number.POSITIVE_INFINITY);
