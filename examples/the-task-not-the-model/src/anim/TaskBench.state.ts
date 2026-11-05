// Pure state of the core picture of part 3: my real requests, seven robots, and my correction
// sticky notes as the measure. One mode per scene:
// - setup:  the messy desk dims, a request card drops in; "19 real tasks" and seven robots; my
//           correction notes stack up behind the card.
// - judges: three blind judges (Claude, Claude, OpenAI) over a row of lettered results A-G.
// - piles:  a pile of correction notes over each robot; six level, the highlighted one taller.
// - pair:   Opus and Fable, equal piles, and Opus scattering papers nobody asked for.
// No Remotion or React here, so `node --test` can check it.
import { beatAt, easeOutCubic, progress, sceneTime, stepTimes } from './steps.ts';

export type TaskBenchMode = 'setup' | 'judges' | 'piles' | 'pair';
export type Pile = { name: string; value: number; display: string; highlight?: boolean };
export type PairSide = { name: string; value: number; display: string };

export type TaskBenchProps = {
  mode: TaskBenchMode;
  /** mode 'piles': one pile per robot, in order. */
  piles?: Pile[];
  /** mode 'piles': a stamp that lands over the piles on the last beat (beat 0 when `grown`). */
  stamp?: string;
  /** mode 'piles': piles already finished from the scene start. */
  grown?: boolean;
  /** mode 'pair': left (Opus) and right (Fable). */
  a?: PairSide;
  b?: PairSide;
};

// ── On-screen text and cast ──────────────────────────────────────────────────────────────────
export const TXT = {
  requests: ['can you look at them?', 'go all in on i18n, English and Russian', 'show all projects?'],
  tasks: 19,
  tasksLabel: 'real tasks',
  corrections: 'my corrections',
  judges: ['Claude', 'Claude', 'OpenAI'],
  letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
} as const;

export const MODELS = ['Gemini', 'Opus', 'Fable', 'GLM', 'Kimi', 'Qwen', 'DeepSeek'] as const;

/** Robot drawing for each model (public/cast); Qwen is the teal robot with its hue turned. */
export const robotFor = (name: string): { src: string; filter?: string } => {
  switch (name.trim().toLowerCase()) {
    case 'gemini':
      return { src: 'cast/robot-sky.png' };
    case 'opus':
      return { src: 'cast/robot-violet.png' };
    case 'fable':
      return { src: 'cast/robot-teal.png' };
    case 'glm':
      return { src: 'cast/robot-graphite.png' };
    case 'kimi':
      return { src: 'cast/robot-rose.png' };
    case 'qwen':
      return { src: 'cast/robot-teal.png', filter: 'hue-rotate(70deg)' };
    case 'deepseek':
      return { src: 'cast/robot-amber.png' };
    default:
      return { src: 'cast/robot-my-agent.png' };
  }
};

/** Pile scale: a value of PILE_MAX fills the full pile height. */
export const PILE_MAX = 5;

/** Papers Opus scatters (pair, beat 2): end offsets from the robot centre (px), turn (deg). */
export const PAPERS = [
  { dx: -170, dy: -250, rot: -28 },
  { dx: 150, dy: -230, rot: 22 },
  { dx: -180, dy: -40, rot: 14 },
  { dx: 190, dy: -70, rot: -18 },
  { dx: -150, dy: 150, rot: 34 },
  { dx: 140, dy: 165, rot: -30 },
  { dx: -10, dy: -320, rot: 8 },
] as const;

const fin = (x: number, d = 0): number => (Number.isFinite(x) ? x : d);
const STAGGER = 0.12;
const LEN = 0.6;

// ── State types ───────────────────────────────────────────────────────────────────────────────
export type SetupState = {
  mode: 'setup';
  backdrop: number;
  card: number;
  bubbles: { text: string; appear: number }[];
  counter: number;
  count: number;
  robots: { name: string; appear: number }[];
  notes: number;
  label: number;
};

export type JudgesState = {
  mode: 'judges';
  judges: { chip: string; appear: number; chipAppear: number; gaze: number }[];
  cards: { letter: string; appear: number }[];
};

export type PilesState = {
  mode: 'piles';
  robots: number;
  piles: { name: string; value: number; frac: number; display: string; highlight: boolean; grow: number; label: number }[];
  stamp: { text: string; appear: number; pop: number } | null;
};

export type PairState = {
  mode: 'pair';
  robots: { name: string; appear: number }[];
  piles: { name: string; frac: number; display: string; grow: number; label: number }[];
  equals: number;
  papers: { appear: number; travel: number; x: number; y: number; rot: number }[];
};

export type TaskBenchState = SetupState | JudgesState | PilesState | PairState;

/** Progress of an animation of `len` seconds starting at `start`, eased. */
const ease = (T: number, start: number, len = LEN): number => easeOutCubic(progress(T, start, len));

const setup = (t: number, beats: number[], dur: number): SetupState => {
  const T = sceneTime(t, dur);
  const [s0, s1, s2] = stepTimes(3, beats, [], 1.2, dur);
  const counter = ease(T, s1, 1);
  return {
    mode: 'setup',
    backdrop: ease(T, s0, 0.8),
    card: ease(T, s0, 0.6),
    bubbles: TXT.requests.map((text, i) => ({ text, appear: ease(T, s0 + 0.25 + i * 0.3, 0.45) })),
    counter,
    count: Math.round(TXT.tasks * counter),
    robots: MODELS.map((name, i) => ({ name, appear: ease(T, s1 + 0.2 + i * STAGGER, 0.5) })),
    notes: ease(T, s2, 0.7),
    label: ease(T, s2 + 0.4, 0.5),
  };
};

const judges = (t: number, beats: number[], dur: number): JudgesState => {
  const T = sceneTime(t, dur);
  const [s0] = stepTimes(1, beats, [], 1.8, dur);
  return {
    mode: 'judges',
    judges: TXT.judges.map((chip, i) => ({
      chip,
      appear: ease(T, s0 + i * 0.25, 0.5),
      chipAppear: ease(T, s0 + 0.3 + i * 0.25, 0.4),
      gaze: ease(T, s0 + 1.2 + i * 0.1, 0.5),
    })),
    cards: TXT.letters.map((letter, i) => ({ letter, appear: ease(T, s0 + 0.6 + i * STAGGER, 0.4) })),
  };
};

const piles = (p: TaskBenchProps, t: number, beats: number[], dur: number): PilesState => {
  const T = sceneTime(t, dur);
  const list = p.piles ?? [];
  const grown = p.grown === true;
  const GROW = 0.9;
  // Step 0: the plain piles; step 1: the highlighted one; step 2: the stamp, on the last beat.
  const lastBeat = beats.length - 1;
  const stampIdx = grown ? 0 : Math.max(1, lastBeat);
  const stampBeat = beats[stampIdx];
  const highlightStart = stepTimes(2, beats, [], GROW, dur)[1];
  let stampAt: number | undefined;
  if (stampBeat !== undefined && Number.isFinite(stampBeat)) stampAt = stampBeat;
  else stampAt = grown ? beatAt(beats, 0) : highlightStart + GROW;
  // Without its own beat after the highlighted pile, the stamp waits for that pile to finish.
  if (!grown && stampAt < highlightStart + GROW) stampAt = highlightStart + GROW;
  const [s0, s1, s2] = stepTimes(3, beats, [undefined, undefined, stampAt], GROW, dur);
  return {
    mode: 'piles',
    robots: grown ? 1 : ease(T, s0, 0.4),
    piles: list.map((x, i) => {
      const hl = x.highlight === true;
      const at = hl ? s1 : s0 + i * 0.05;
      const grow = grown ? 1 : ease(T, at, GROW);
      return {
        name: x.name,
        value: fin(x.value),
        frac: Math.min(1, Math.max(0, fin(x.value) / PILE_MAX)),
        display: x.display,
        highlight: hl,
        grow,
        label: grown ? 1 : ease(T, at + GROW * 0.6, 0.4),
      };
    }),
    stamp: p.stamp ? { text: p.stamp, appear: ease(T, s2, 0.35), pop: Math.sin(Math.PI * progress(T, s2, 0.5)) } : null,
  };
};

const pair = (p: TaskBenchProps, t: number, beats: number[], dur: number): PairState => {
  const T = sceneTime(t, dur);
  const [s0, s1, s2] = stepTimes(3, beats, [], 1.6, dur);
  const sides = [p.a ?? { name: 'Opus', value: 0, display: '' }, p.b ?? { name: 'Fable', value: 0, display: '' }];
  return {
    mode: 'pair',
    robots: sides.map((x, i) => ({ name: x.name, appear: ease(T, s0 + i * 0.2, 0.6) })),
    piles: sides.map((x) => {
      const grow = ease(T, s1, 0.9);
      return {
        name: x.name,
        frac: Math.min(1, Math.max(0, fin(x.value) / PILE_MAX)),
        display: x.display,
        grow,
        label: ease(T, s1 + 0.6, 0.4),
      };
    }),
    equals: ease(T, s1 + 0.8, 0.4),
    papers: PAPERS.map((q, i) => {
      const appear = ease(T, s2 + i * 0.12, 0.2);
      const travel = ease(T, s2 + i * 0.12, 0.8);
      return { appear, travel, x: q.dx * travel, y: q.dy * travel, rot: q.rot * travel };
    }),
  };
};

export const frameState = (p: TaskBenchProps, t: number, beats: number[], dur: number): TaskBenchState => {
  const bs = Array.isArray(beats) ? beats : [];
  switch (p.mode) {
    case 'setup':
      return setup(t, bs, dur);
    case 'judges':
      return judges(t, bs, dur);
    case 'piles':
      return piles(p, t, bs, dur);
    case 'pair':
    default:
      return pair(p, t, bs, dur);
  }
};
