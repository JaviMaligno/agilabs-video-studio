// Pure state of the code card, the file tree and the bet's balance: the hook, the story, the bet,
// the method (break how the code is written and where things are, never what it does), the planted
// bug with the run count, and the flipped bet. No Remotion or React here.
//
// Modes:
// - hook: one code card; its names scramble while the agent keeps fixing it; then it shrinks into a
//   wall of linked files and the agent stalls.
// - habits: the code card read by a human, the four habits pop; the reader becomes an agent and
//   every habit gets a question mark.
// - bet: an agent's head holds the page, not the repository; a balance tips to WHERE TO LOOK.
// - method: code card + file tree under "tests: identical"; nine kinds of damage, two families.
// - task: a bug planted in the code, its tests go red then green; the run count climbs to 2,929.
// - flip: the balance swings to HOW IT'S WRITTEN; a search finds the file in the flat tree.
import { clamp01, easeOutCubic, progress, sceneTime } from './steps.ts';

export type DegraderMode = 'hook' | 'habits' | 'bet' | 'method' | 'task' | 'flip';
export type CodeDegraderProps = { mode: DegraderMode; marks?: number[] };

/** Invented, illustrative Python: the same program before and after (one-space indents). */
export const CODE: { clean: string; dirty: string }[] = [
  { clean: 'def parse_vat(number: str) -> str:', dirty: 'def f1(a1):' },
  { clean: '    """Clean and check a VAT number."""', dirty: '' },
  { clean: '    digits = clean(number)', dirty: ' a2=f2(a1)' },
  { clean: '    if not is_valid(digits):', dirty: ' if not f3(a2):raise E1(a1)' },
  { clean: '        raise InvalidFormat(number)', dirty: '' },
  { clean: '    return digits', dirty: ' return a2' },
];

/** The file tree, organised and then flattened (depth = indent level). */
export const TREE: { clean: string; dirty: string; depth: number; kind: 'dir' | 'file' | 'readme' | 'tests' }[] = [
  { clean: 'vat/', dirty: '', depth: 0, kind: 'dir' },
  { clean: 'parse.py', dirty: 'm1.py', depth: 1, kind: 'file' },
  { clean: 'checks.py', dirty: 'm2.py', depth: 1, kind: 'file' },
  { clean: 'errors.py', dirty: 'm3.py', depth: 1, kind: 'file' },
  { clean: 'README.md', dirty: 'README.md', depth: 0, kind: 'readme' },
  { clean: 'tests/', dirty: 'tests/', depth: 0, kind: 'tests' },
];

export const HABITS = ['readable names', 'formatting', 'one job per module', 'docs: where things live'];
export const RUNS = 2929;

export type DegraderState = {
  /** The code card: opacity, scale (hook zoom-out), how degraded each line is (0 clean .. 1 dirty). */
  code: { opacity: number; scale: number; dirty: number[]; dim: number };
  tree: { opacity: number; dirty: number; strike: number; fade: number; dim: number };
  /** The agent's reading cursor: row on the code card (float), visible or not. */
  cursor: { opacity: number; row: number };
  /** Hook: the green "fixed" chip, the wall of linked files, the turn meter that stalls. */
  fixed: { pop: number };
  web: { opacity: number; tiles: number[]; links: number; meter: number; stall: number };
  /** Story: the reader (0 human .. 1 agent), the habit chips, their question marks. */
  reader: { opacity: number; agent: number };
  chips: { pop: number[]; ask: number[]; question: number };
  /** Bet: the agent's head, the page inside it, the repository map left outside. */
  head: { opacity: number; page: number; map: number };
  /** Balance: -1 tipped to HOW IT'S WRITTEN, +1 tipped to WHERE TO LOOK. */
  balance: { opacity: number; tilt: number; glowLeft: number };
  /** Method: the tests badge and the "9 kinds of damage" chip. */
  badge: { pop: number };
  nine: { pop: number };
  /** Task: bug, tests red then green, the run counter. */
  bug: { pop: number; fixed: number };
  tests: { red: number; green: number };
  counter: { opacity: number; value: number; judge: number };
  /** Flip: the search that finds the file. */
  search: { opacity: number; typed: number; found: number };
};

const e = (t: number, s: number, l: number) => easeOutCubic(progress(t, s, l));
const mk = (marks: number[] | undefined, i: number, fallback: number) => {
  const m = marks?.[i];
  return m !== undefined && Number.isFinite(m) ? m : fallback;
};
const beat = (beats: number[], i: number, fallback: number) => {
  const b = beats[i];
  return b !== undefined && Number.isFinite(b) ? b : fallback;
};

const MODES: DegraderMode[] = ['hook', 'habits', 'bet', 'method', 'task', 'flip'];
export const WEB_TILES = 30;

export function frameState(props: CodeDegraderProps, t: number, beats: number[], dur: number): DegraderState {
  const mode: DegraderMode = MODES.includes(props.mode) ? props.mode : 'hook';
  const T = sceneTime(Number.isFinite(t) ? t : 0, dur);
  const m = props.marks;
  const b0 = beat(beats, 0, 0);
  const b1 = beat(beats, 1, b0 + 2.5);
  const zero = CODE.map(() => 0);
  const one = CODE.map(() => 1);

  const s: DegraderState = {
    code: { opacity: 0, scale: 1, dirty: zero, dim: 0 },
    tree: { opacity: 0, dirty: 0, strike: 0, fade: 0, dim: 0 },
    cursor: { opacity: 0, row: 0 },
    fixed: { pop: 0 },
    web: { opacity: 0, tiles: Array.from({ length: WEB_TILES }, () => 0), links: 0, meter: 0, stall: 0 },
    reader: { opacity: 0, agent: 0 },
    chips: { pop: HABITS.map(() => 0), ask: HABITS.map(() => 0), question: 0 },
    head: { opacity: 0, page: 0, map: 0 },
    balance: { opacity: 0, tilt: 0, glowLeft: 0 },
    badge: { pop: 0 },
    nine: { pop: 0 },
    bug: { pop: 0, fixed: 0 },
    tests: { red: 0, green: 0 },
    counter: { opacity: 0, value: 0, judge: 0 },
    search: { opacity: 0, typed: 0, found: 0 },
  };

  if (mode === 'hook') {
    const scramble = mk(m, 0, b0 + 0.5);
    const zoom = mk(m, 1, b1 + 0.6);
    const z = e(T, zoom - 0.15, 0.9);
    s.code = { opacity: e(T, 0, 0.35) * (1 - z), scale: 1 - 0.8 * z, dirty: CODE.map((_, i) => e(T, scramble + i * 0.1, 0.45)), dim: 0 };
    // The cursor keeps reading at the same pace, unbothered by the scramble.
    const crawl = Math.max(0, T - 0.2) * 2.4;
    s.cursor = { opacity: e(T, 0.2, 0.3) * (1 - z), row: crawl % CODE.length };
    s.fixed = { pop: e(T, scramble + 0.9, 0.35) * (1 - z) };
    s.web = {
      opacity: z,
      tiles: s.web.tiles.map((_, i) => e(T, zoom + 0.1 + (i % 7) * 0.05 + Math.floor(i / 7) * 0.04, 0.35)),
      links: e(T, zoom + 0.35, 0.6),
      meter: e(T, zoom + 0.35, 1.1),
      stall: e(T, zoom + 1.35, 0.35),
    };
    return s;
  }

  if (mode === 'habits') {
    const chipsAt = mk(m, 0, b0 + 0.3);
    const human = mk(m, 1, b0 + 1.6);
    const agentAt = mk(m, 2, b1 + 0.6);
    const whichAt = mk(m, 3, b1 + 3);
    s.code = { opacity: e(T, 0, 0.4), scale: 1, dirty: zero, dim: 0 };
    s.reader = { opacity: e(T, Math.min(human - 0.3, chipsAt + 0.2), 0.4), agent: e(T, agentAt - 0.1, 0.6) };
    s.cursor = { opacity: s.reader.agent, row: (Math.max(0, T - agentAt) * 2.2) % CODE.length };
    s.chips = {
      pop: HABITS.map((_, i) => e(T, chipsAt + i * 0.3, 0.35)),
      ask: HABITS.map((_, i) => e(T, whichAt + i * 0.12, 0.35)),
      question: e(T, whichAt + 0.3, 0.4),
    };
    return s;
  }

  if (mode === 'bet' || mode === 'flip') {
    if (mode === 'bet') {
      const page = mk(m, 0, b0 + 0.8);
      const map = mk(m, 1, b0 + 2.4);
      const tip = mk(m, 2, b1 + 1);
      s.head = { opacity: e(T, 0.05, 0.4), page: e(T, page - 0.1, 0.45), map: e(T, map - 0.1, 0.45) };
      s.balance = { opacity: e(T, Math.min(tip - 0.8, b1), 0.4), tilt: e(T, tip, 0.9), glowLeft: 0 };
      return s;
    }
    const flip = mk(m, 0, b0 + 1);
    const find = mk(m, 1, b0 + 3);
    const swing = e(T, flip - 0.1, 1);
    s.balance = { opacity: 1, tilt: 1 - 2 * swing, glowLeft: swing };
    s.search = { opacity: e(T, Math.min(find - 1.2, flip + 0.6), 0.4), typed: progress(T, find - 0.8, 0.8), found: e(T, find + 0.1, 0.35) };
    return s;
  }

  // method and task share the two cards and the badge.
  if (mode === 'method') {
    const cards = mk(m, 0, b0 + 0.4);
    const badge = mk(m, 1, b0 + 1.6);
    const nine = mk(m, 2, b1 + 0.2);
    const how = mk(m, 3, b1 + 1.6);
    const look = mk(m, 4, b1 + 2.8);
    s.code = { opacity: e(T, Math.min(cards - 0.3, 0.1), 0.4), scale: 1, dirty: CODE.map((_, i) => e(T, how + i * 0.12, 0.4)), dim: 0 };
    const td = e(T, look, 0.6);
    s.tree = { opacity: e(T, Math.min(cards - 0.1, 0.3), 0.4), dirty: td, strike: e(T, look + 0.35, 0.35), fade: e(T, look + 0.6, 0.4), dim: 0 };
    s.badge = { pop: e(T, badge, 0.35) };
    s.nine = { pop: e(T, nine - 0.05, 0.35) };
    return s;
  }

  // task: starts where method ended.
  const plant = mk(m, 0, b0 + 0.4);
  const fix = mk(m, 1, b0 + 1.6);
  const count = mk(m, 2, b0 + 2.6);
  const dimAll = e(T, count - 0.25, 0.4);
  s.code = { opacity: 1, scale: 1, dirty: one, dim: dimAll };
  s.tree = { opacity: 1, dirty: 1, strike: 1, fade: 1, dim: dimAll };
  s.nine = { pop: 1 - e(T, 0, 0.4) };
  s.badge = { pop: 1 };
  s.bug = { pop: e(T, plant, 0.35), fixed: e(T, fix + 0.5, 0.4) };
  s.tests = { red: e(T, plant + 0.25, 0.3), green: e(T, fix + 0.5, 0.4) };
  s.cursor = { opacity: e(T, plant + 0.3, 0.3) * (1 - dimAll), row: 2 + clamp01((T - plant - 0.3) / 1.2) * 1 };
  s.counter = { opacity: e(T, count - 0.25, 0.4), value: Math.round(RUNS * e(T, count, 1.6)), judge: e(T, count + 1.2, 0.4) };
  return s;
}
