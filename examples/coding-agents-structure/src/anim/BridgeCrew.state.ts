// Pure state of the bridge stage: a coding task with two features is a bridge over a gap, the
// merge is the join in the middle, each agent is a crew (a hard-hat chip) building one half of
// the deck from its own bank, the message channel is a pair of walkie-talkies linked across the
// gap, and the tests are a truck that has to drive from one bank to the other.
// Each mode returns plain primitives in frame pixels (1080x1920, vertical); BridgeCrew.tsx only
// draws them. `marks` are scene seconds of spoken words (resolved in timeline.ts); every mode has
// fallbacks so the state is total without them. No Remotion or React here.
import { clamp01, easeOutCubic, progress, sceneTime } from './steps.ts';

export type Mode =
  | 'hook'
  | 'paper'
  | 'humans'
  | 'setup'
  | 'clash'
  | 'ladder'
  | 'handshake'
  | 'silence'
  | 'fences'
  | 'owner'
  | 'sequence'
  | 'integrator'
  | 'verdict';

export type RungId = 'talk' | 'files' | 'lines' | 'seq' | 'int';
export type RungMark = 'cross' | 'tilde' | 'tick';
export type LadderSpec = {
  /** Marks already earned in earlier scenes. */
  done?: Partial<Record<RungId, RungMark>>;
  /** Rungs lit in this scene. */
  glow?: RungId[];
  /** Rungs drawn in the accent (the two that own the join). */
  accent?: RungId[];
  /** Marks earned in this scene, landing on the scene's result. */
  add?: { id: RungId; mark: RungMark }[];
};

/**
 * `enter`: scene second from which this scene's own crews, deck, radios and props fade in. Used on
 * scenes that blend in from a bridge scene whose crews stand elsewhere: the blend keeps the outgoing
 * scene drawn for the first half of the hand-over, so without it both sets of crews show at once.
 * `enterLadder` delays the ladder too (when the outgoing scene had none).
 */
export type BridgeProps = { mode: Mode; marks?: number[]; ladder?: LadderSpec; enter?: number; enterLadder?: boolean };

// ------------------------------------------------------------------ geometry (frame pixels)

/** Deck top of the single bridge; banks; the join. */
export const DY = 1090;
export const LB = 300;
export const RB = 780;
export const J = 540;
/** Crew chip centre height above the deck. */
export const CREW_UP = 58;
/** Raise of a half that arrives at the wrong height (clash). */
export const RAISE = 46;
/** Hook lanes. */
export const LANES = [640, 1120] as const;

export type Tone = 'deck' | 'accent' | 'ghost';
export type Span = { x0: number; x1: number; y0: number; y1: number; grow: number; from: 'left' | 'right'; tone: Tone; opacity: number };
export type CrewTone = 'a' | 'b' | 'c' | 'solo' | 'human';
export type Crew = { label: string; x: number; y: number; opacity: number; tone: CrewTone; radio: number; lit: number; scale: number };
export type Link = { x0: number; x1: number; y: number; opacity: number; flash: number };
export type Truck = { x: number; y: number; opacity: number; tilt: number };
export type Mark = { kind: RungMark; x: number; y: number; size: number; pop: number };
export type Spark = { x: number; y: number; pop: number };
export type TagTone = 'text' | 'muted' | 'flag' | 'ok' | 'warm' | 'accent';
export type Tag = { text: string; x: number; y: number; opacity: number; tone: TagTone; size: number; anchor: 'start' | 'middle' | 'end'; box: boolean; weight: number };
export type Crack = { x: number; y: number; draw: number };
export type Fence = { x: number; y: number; draw: number };
export type Barrier = { x: number; y: number; lift: number; opacity: number };
export type Baton = { x: number; y: number; opacity: number };
export type Yard = { x: number; y: number; w: number; h: number; opacity: number };
export type Bubble = { text: string; x: number; y: number; w: number; opacity: number; received: number };
export type Thought = { text: string; x: number; y: number; w: number; opacity: number; tx: number; ty: number };
export type Bank = { y: number; opacity: number };
export type Rung = { id: RungId; label: string; appear: number; glow: number; accent: boolean; mark: RungMark | null; pop: number };
export type Ladder = { opacity: number; rungs: Rung[] };
export type Paper = { appear: number; chip: number; stamp: number; foot: number };
export type Stamp = { lines: string[]; x: number; y: number; pop: number; fade?: number };
export type LaneTitle = { text: string; y: number; opacity: number; mark: RungMark; pop: number };
export type Bolt = { x: number; y: number; pop: number };

export type BridgeState = {
  /** Opacity of the whole bridge (banks, deck, crews): dimmed under an overlay. */
  dim: number;
  banks: Bank[];
  spans: Span[];
  crews: Crew[];
  links: Link[];
  trucks: Truck[];
  marks: Mark[];
  sparks: Spark[];
  tags: Tag[];
  cracks: Crack[];
  fences: Fence[];
  barriers: Barrier[];
  batons: Baton[];
  yards: Yard[];
  bubbles: Bubble[];
  thoughts: Thought[];
  bolts: Bolt[];
  titles: LaneTitle[];
  ladder: Ladder | null;
  paper: Paper | null;
  stamp: Stamp | null;
  humans: Human[];
  /** The dots of a radio that has stopped answering ("…"), and their opacity. */
  typing: { x: number; y: number; opacity: number } | null;
};

const RUNGS: { id: RungId; label: string }[] = [
  { id: 'talk', label: 'talk first' },
  { id: 'files', label: 'own files' },
  { id: 'lines', label: 'own lines' },
  { id: 'seq', label: 'in sequence' },
  { id: 'int', label: 'integrator' },
];

// ------------------------------------------------------------------ helpers

const E = (t: number, start: number, len: number) => easeOutCubic(progress(t, start, len));
const lerp = (a: number, b: number, p: number) => a + (b - a) * clamp01(p);
const fin = (x: number | undefined, fallback: number) => (x !== undefined && Number.isFinite(x) && x >= 0 ? x : fallback);

const empty = (): BridgeState => ({
  dim: 1,
  banks: [],
  spans: [],
  crews: [],
  links: [],
  trucks: [],
  marks: [],
  sparks: [],
  tags: [],
  cracks: [],
  fences: [],
  barriers: [],
  batons: [],
  yards: [],
  bubbles: [],
  thoughts: [],
  bolts: [],
  titles: [],
  ladder: null,
  paper: null,
  stamp: null,
  humans: [],
  typing: null,
});

const tag = (text: string, x: number, y: number, opacity: number, o: Partial<Omit<Tag, 'text' | 'x' | 'y' | 'opacity'>> = {}): Tag => ({
  text,
  x,
  y,
  opacity: clamp01(opacity),
  tone: o.tone ?? 'text',
  size: o.size ?? 36,
  anchor: o.anchor ?? 'start',
  box: o.box ?? false,
  weight: o.weight ?? 700,
});

const crew = (label: string, tone: CrewTone, x: number, y: number, o: Partial<Pick<Crew, 'opacity' | 'radio' | 'lit' | 'scale'>> = {}): Crew => ({
  label,
  tone,
  x,
  y,
  opacity: clamp01(o.opacity ?? 1),
  radio: clamp01(o.radio ?? 0),
  lit: clamp01(o.lit ?? 1),
  scale: o.scale ?? 1,
});

/** Left half (A's feature) and right half (B's), grown from their banks; `raise` lifts B's join end. */
const halves = (gA: number, gB: number, deck: number, raise = 0, tone: Tone = 'deck', opacity = 1): Span[] => [
  { x0: LB, x1: J, y0: deck, y1: deck, grow: clamp01(gA), from: 'left', tone, opacity },
  { x0: J, x1: RB, y0: deck - raise, y1: deck, grow: clamp01(gB), from: 'right', tone, opacity },
];

/** Where a crew stands while building: just behind the growing tip, never off its bank. */
const tipA = (g: number) => Math.max(LB - 50, LB + clamp01(g) * (J - LB) - 72);
const tipB = (g: number) => Math.min(RB + 50, RB - clamp01(g) * (RB - J) + 72);

const radioLink = (a: Crew, b: Crew, on: number, flash = 0): Link => ({ x0: a.x, x1: b.x, y: a.y - 84, opacity: clamp01(on), flash: clamp01(flash) });

const truck = (x: number, deck: number, opacity = 1, tilt = 0): Truck => ({ x, y: deck, opacity: clamp01(opacity), tilt });

/** Truck x from the left bank to the far bank. */
const T_START = 125;
const T_END = 920;

function ladderOf(spec: LadderSpec | undefined, t: number, glowAt: number, resultAt: number, opacity: number, appearAt?: (i: number) => number): Ladder {
  const done = spec?.done ?? {};
  const glow = new Set(spec?.glow ?? []);
  const accent = new Set(spec?.accent ?? []);
  const add = new Map((spec?.add ?? []).map((a) => [a.id, a.mark] as const));
  return {
    opacity: clamp01(opacity),
    rungs: RUNGS.map((r, i) => {
      const added = add.get(r.id);
      const mark = added ?? done[r.id] ?? null;
      const pop = added ? E(t, resultAt, 0.35) : mark ? 1 : 0;
      return {
        id: r.id,
        label: r.label,
        appear: appearAt ? E(t, appearAt(i), 0.35) : 1,
        glow: glow.has(r.id) ? E(t, glowAt, 0.4) : 0,
        accent: accent.has(r.id),
        mark,
        pop,
      };
    }),
  };
}

// ------------------------------------------------------------------ modes

function hook(t: number): BridgeState {
  const s = empty();
  const [L1, L2] = LANES;
  s.banks = [
    { y: L1, opacity: E(t, 0, 0.3) },
    { y: L2, opacity: E(t, 0.1, 0.3) },
  ];
  s.titles = [
    { text: 'ONE AGENT', y: L1 - 250, opacity: E(t, 0.1, 0.3), mark: 'tick', pop: E(t, 3.0, 0.35) },
    { text: 'TWO AGENTS', y: L2 - 250, opacity: E(t, 0.25, 0.3), mark: 'cross', pop: E(t, 3.1, 0.35) },
  ];
  // Lane 1: one crew builds the whole deck, bank to bank; the truck crosses.
  const g1 = E(t, 0.3, 1.8);
  s.spans.push({ x0: LB, x1: RB, y0: L1, y1: L1, grow: g1, from: 'left', tone: 'deck', opacity: 1 });
  const soloX = Math.max(LB - 45, LB + g1 * (RB - LB) - 34);
  const drive1 = E(t, 2.1, 0.9);
  s.crews.push(crew('1', 'solo', lerp(Math.min(soloX, RB - 72), 985, E(t, 2.0, 0.5)), L1 - CREW_UP, { opacity: E(t, 0.15, 0.3) }));
  s.trucks.push(truck(lerp(T_START, 820, drive1), L1, E(t, 0.2, 0.3)));
  // Lane 2: two crews build from both banks at once; the halves jam at the join.
  const gA = E(t, 0.3, 1.4);
  const gB = E(t, 0.3, 1.4);
  const a = crew('A', 'a', tipA(gA), L2 - CREW_UP, { opacity: E(t, 0.25, 0.3), radio: 1 });
  const b = crew('B', 'b', tipB(gB), L2 - CREW_UP - gB * RAISE * 0.6, { opacity: E(t, 0.25, 0.3), radio: 1 });
  s.spans.push(...halves(gA, gB, L2, RAISE));
  s.crews.push(a, b);
  s.links.push(radioLink(a, b, E(t, 0.3, 0.4)));
  s.sparks.push({ x: J, y: L2 - RAISE / 2, pop: E(t, 1.7, 0.3) });
  s.trucks.push(truck(lerp(T_START, LB - 20, E(t, 2.1, 0.6)), L2, E(t, 0.3, 0.3)));
  return s;
}

/** The finished clash, used still under overlays (paper, ladder). */
function clashStill(s: BridgeState, opacity: number, radios = 1) {
  const a = crew('A', 'a', tipA(1), DY - CREW_UP, { opacity, radio: 1 });
  const b = crew('B', 'b', tipB(1), DY - CREW_UP - RAISE * 0.6, { opacity, radio: 1 });
  s.banks.push({ y: DY, opacity });
  s.spans.push(...halves(1, 1, DY, RAISE, 'deck', opacity));
  s.crews.push(a, b);
  s.links.push(radioLink(a, b, radios * opacity));
  s.sparks.push({ x: J, y: DY - RAISE / 2, pop: opacity });
}

function paper(t: number, m: number[]): BridgeState {
  const s = empty();
  const m0 = fin(m[0], 0.5);
  const m1 = fin(m[1], m0 + 1.2);
  const m2 = fin(m[2], m1 + 3);
  const m3 = fin(m[3], m2 + 0.2);
  clashStill(s, 0.3);
  s.paper = { appear: E(t, Math.max(0, m0 - 0.45), 0.5), chip: E(t, m1, 0.4), stamp: E(t, m2, 0.35), foot: E(t, m3 + 0.6, 0.5) };
  return s;
}

export type Human = { x: number; y: number; opacity: number; pop: number };
/** Four people in one shared yard, two pairs walking into each other and bouncing off. */
export function humansAt(t: number): { humans: Human[]; bumps: Spark[] } {
  const humans: Human[] = [];
  const bumps: Spark[] = [];
  const rows = [
    { y: 700, period: 0.95, phase: 0.1 },
    { y: 960, period: 0.8, phase: 0.45 },
  ];
  rows.forEach((r, i) => {
    const c = Math.abs(Math.cos((Math.PI * (t + r.phase)) / r.period));
    const off = 46 + 250 * c;
    const op = E(t, 0.05 + i * 0.15, 0.3);
    humans.push({ x: J - off, y: r.y, opacity: op, pop: 0 }, { x: J + off, y: r.y, opacity: op, pop: 0 });
    bumps.push({ x: J, y: r.y - 10, pop: clamp01(1 - c / 0.18) * op });
  });
  return { humans, bumps };
}

function humans(t: number): BridgeState {
  const s = empty();
  const { humans: people, bumps } = humansAt(Math.min(t, 1e4));
  s.humans = people;
  s.sparks = bumps;
  s.yards.push({ x: 120, y: 540, w: 840, h: 560, opacity: E(t, 0, 0.3) });
  return s;
}

function setup(t: number, m: number[]): BridgeState {
  const s = empty();
  const m0 = fin(m[0], 0.3);
  const m1 = fin(m[1], m0 + 1.8);
  const m2 = fin(m[2], m1 + 1.4);
  const m3 = fin(m[3], m2 + 1.2);
  s.banks.push({ y: DY, opacity: E(t, 0, 0.3) });
  s.tags.push(tag('THE TEST', 80, 420, E(t, m0 - 0.1, 0.35), { tone: 'warm', box: true, size: 44, weight: 800 }));
  // The planned halves as dashed outlines, each named on its word.
  s.spans.push(...halves(1, 1, DY, 0, 'ghost', E(t, m1 - 0.3, 0.4)));
  s.tags.push(tag('feature 1', (LB + J) / 2, DY - 50, E(t, m1 - 0.2, 0.35), { anchor: 'middle', tone: 'accent', size: 36 }));
  s.tags.push(tag('feature 2', (J + RB) / 2, DY - 50, E(t, m1 + 0.05, 0.35), { anchor: 'middle', tone: 'accent', size: 36 }));
  s.fences.push({ x: J, y: DY, draw: E(t, m2 - 0.1, 0.35) });
  s.tags.push(tag('merge', J, DY + 92, E(t, m2 - 0.1, 0.35), { anchor: 'middle', tone: 'warm', size: 38 }));
  const a = crew('A', 'a', LB - 45, DY - CREW_UP, { opacity: E(t, m0 + 0.6, 0.3), radio: 1, lit: E(t, m3, 0.3) });
  const b = crew('B', 'b', RB + 45, DY - CREW_UP, { opacity: E(t, m0 + 0.8, 0.3), radio: 1, lit: E(t, m3, 0.3) });
  s.crews.push(a, b);
  s.links.push(radioLink(a, b, E(t, m3, 0.4)));
  s.tags.push(tag('channel: always open', J, DY - 190, E(t, m3 + 0.25, 0.35), { anchor: 'middle', tone: 'ok', size: 36, box: true }));
  s.trucks.push(truck(T_START, DY, E(t, m0, 0.35)));
  s.tags.push(tag('tests: both features', 64, DY - 250, E(t, m0 + 0.1, 0.35), { tone: 'text', size: 34 }));
  return s;
}

function clash(t: number, m: number[]): BridgeState {
  const s = empty();
  const m1 = fin(m[1], 1.2);
  const m2 = fin(m[2], m1 + 1.2);
  const g = E(t, 0.1, Math.max(0.6, m2 - 0.15));
  const a = crew('A', 'a', tipA(g), DY - CREW_UP, { radio: 1 });
  const b = crew('B', 'b', tipB(g), DY - CREW_UP - g * RAISE * 0.6, { radio: 1 });
  s.banks.push({ y: DY, opacity: 1 });
  s.spans.push(...halves(g, g, DY, RAISE));
  s.crews.push(a, b);
  s.links.push(radioLink(a, b, 1));
  s.sparks.push({ x: J, y: DY - RAISE / 2, pop: E(t, m2, 0.3) });
  s.tags.push(tag('merge conflict', J, DY - 210, E(t, m2 + 0.05, 0.3), { anchor: 'middle', tone: 'flag', box: true, size: 40, weight: 800 }));
  s.tags.push(tag('14–15', 80, 470, E(t, m1 - 0.1, 0.35), { tone: 'flag', size: 96, weight: 800 }));
  s.tags.push(tag('of 19 pairs', 84, 590, E(t, m1 + 0.05, 0.35), { tone: 'muted', size: 42, weight: 600 }));
  return s;
}

function ladder(t: number, m: number[], spec: LadderSpec | undefined): BridgeState {
  const s = empty();
  const m0 = fin(m[0], 0.3);
  const m1 = fin(m[1], m0 + 1);
  clashStill(s, 1 - 0.55 * E(t, 0, 0.4));
  const step = Math.max(0.18, (m1 - m0) / 4);
  s.ladder = ladderOf(spec, t, 99, 99, 1, (i) => m0 + i * step);
  return s;
}

function handshake(t: number, m: number[], spec: LadderSpec | undefined): BridgeState {
  const s = empty();
  const m0 = fin(m[0], 0.1);
  const m1 = fin(m[1], m0 + 0.7);
  const m2 = fin(m[2], m1 + 0.9);
  const m3 = fin(m[3], m2 + 0.7);
  const lift = E(t, m1, 0.3);
  const g = E(t, m1 + 0.15, Math.max(0.5, m2 - m1 - 0.2));
  const a = crew('A', 'a', tipA(g), DY - CREW_UP, { radio: 1 });
  const b = crew('B', 'b', tipB(g), DY - CREW_UP - g * RAISE * 0.6, { radio: 1 });
  s.banks.push({ y: DY, opacity: 1 });
  s.spans.push(...halves(g, g, DY, RAISE));
  s.crews.push(a, b);
  s.links.push(radioLink(a, b, 1, E(t, m3, 0.25) * (1 - E(t, m3 + 0.4, 0.5))));
  s.barriers.push({ x: LB, y: DY, lift, opacity: 1 - E(t, m1 + 0.5, 0.3) }, { x: RB, y: DY, lift, opacity: 1 - E(t, m1 + 0.5, 0.3) });
  s.sparks.push({ x: J, y: DY - RAISE / 2, pop: E(t, m2, 0.3) });
  s.tags.push(tag('first message: turn 2', 80, 440, E(t, m0 + 0.2, 0.35), { tone: 'ok', box: true, size: 36 }));
  s.tags.push(tag('first edit: turn 6', 80, 540, E(t, m1 + 0.3, 0.35), { tone: 'muted', box: true, size: 36 }));
  s.ladder = ladderOf(spec, t, 0.1, m2 + 0.15, 1);
  return s;
}

export const BUBBLES = ['Are you touching either of those?', 'Can you avoid the import block…?', 'Could you add the IsMac re-export there?'];
export const THOUGHT = '“I should inspect and respond with precise coordination.”';

function silence(t: number, m: number[]): BridgeState {
  const s = empty();
  const m0 = fin(m[0], 0.1);
  const m1 = fin(m[1], m0 + 1);
  const m2 = fin(m[2], m1 + 0.8);
  const m3 = fin(m[3], m2 + 1.4);
  const gA = 0.62;
  const gB = 0.45;
  const walk = E(t, m3, 0.9);
  const a = crew('A', 'a', tipA(gA), DY - CREW_UP, { radio: 1 });
  const b = crew('B', 'b', lerp(tipB(gB), 1080, walk), DY - CREW_UP, { radio: 1, lit: 1 - E(t, m3 - 0.2, 0.3), opacity: 1 - walk });
  s.banks.push({ y: DY, opacity: 1 });
  s.spans.push(...halves(gA, gB, DY));
  s.crews.push(a, b);
  s.links.push(radioLink(a, crew('B', 'b', tipB(gB), DY - CREW_UP), 0.55 * (1 - E(t, m3 - 0.2, 0.4))));
  const times = [m0 + 0.05, (m0 + m1) / 2 + 0.05, m1 + 0.12];
  s.bubbles = BUBBLES.map((text, i) => ({ text, x: 80, y: 392 + i * 128, w: 920, opacity: E(t, times[i], 0.3), received: E(t, times[i] + 0.3, 0.25) }));
  s.thoughts.push({ text: THOUGHT, x: 300, y: 790, w: 700, opacity: E(t, m2, 0.35) * (1 - E(t, m3 + 0.5, 0.4)), tx: tipB(gB), ty: DY - CREW_UP - 60 });
  s.typing = { x: tipB(gB) + 70, y: DY - CREW_UP - 130, opacity: E(t, m2 + 0.6, 0.3) * (1 - E(t, m3 - 0.1, 0.4)) };
  return s;
}

function fences(t: number, m: number[], spec: LadderSpec | undefined): BridgeState {
  const s = empty();
  const m0 = fin(m[0], 0.1);
  const m1 = fin(m[1], m0 + 0.7);
  const m2 = fin(m[2], m1 + 1.2);
  const m3 = fin(m[3], m2 + 0.8);
  const g = E(t, m0 + 0.15, Math.max(0.4, m1 - m0 - 0.05));
  const back = E(t, m1 + 0.1, 0.6);
  const a = crew('A', 'a', lerp(tipA(g), LB - 50, back), DY - CREW_UP, { radio: 1 });
  const b = crew('B', 'b', lerp(tipB(g), RB + 50, back), DY - CREW_UP, { radio: 1 });
  s.banks.push({ y: DY, opacity: 1 });
  s.fences.push({ x: J, y: DY, draw: E(t, m0, 0.35) });
  s.spans.push(...halves(g, g, DY));
  s.crews.push(a, b);
  s.links.push(radioLink(a, b, 1));
  s.tags.push(tag('merge conflicts', 80, 450, E(t, m1, 0.35), { tone: 'muted', size: 40, weight: 600 }));
  s.tags.push(tag('0 / 19', 80, 510, E(t, m1 + 0.1, 0.35), { tone: 'ok', size: 96, weight: 800 }));
  // The truck rolls on, the deck cracks under it at the join.
  const drive = E(t, m2 - 0.2, Math.max(0.5, m3 - m2 + 0.2));
  const crack = E(t, m3, 0.35);
  s.trucks.push(truck(lerp(T_START - 60, J - 30, drive), DY, progress(t, m2 - 0.3, 0.2), crack * 9));
  s.cracks.push({ x: J, y: DY, draw: crack });
  s.marks.push({ kind: 'cross', x: J - 30, y: DY - 150, size: 70, pop: E(t, m3 + 0.15, 0.35) });
  s.ladder = ladderOf(spec, t, 0.1, m3 + 0.2, 1);
  s.tags.push(tag('own files: strong model 14 % ·\nno better than a fair merge', 80, 650, E(t, m3 + 0.45, 0.4), { tone: 'warm', size: 32, weight: 600 }));
  return s;
}

/** The finished bridge with one accent crew standing on the join. */
function ownedBridge(s: BridgeState, t: number, hatAt: number, radios = 1, near = false) {
  const a = crew('A', 'a', near ? J - 150 : LB - 50, DY - CREW_UP, { radio: 1 });
  const b = crew('B', 'b', near ? J + 150 : RB + 50, DY - CREW_UP, { radio: 1 });
  s.banks.push({ y: DY, opacity: 1 });
  s.spans.push(...halves(1, 1, DY));
  s.crews.push(a, b);
  s.links.push(radioLink(a, b, radios));
  const drop = E(t, hatAt, 0.45);
  s.crews.push(crew('', 'c', J, lerp(DY - 420, DY - CREW_UP, drop), { opacity: progress(t, hatAt, 0.15), scale: 1.15 }));
  s.bolts.push({ x: J, y: DY + 4, pop: E(t, hatAt + 0.4, 0.35) });
}

function owner(t: number, m: number[], spec: LadderSpec | undefined): BridgeState {
  const s = empty();
  const m0 = fin(m[0], 0.3);
  const m1 = fin(m[1], m0 + 0.8);
  const m2 = fin(m[2], m1 + 0.8);
  ownedBridge(s, t, m1);
  s.ladder = ladderOf(spec, t, m0, 99, 1 - 0.85 * E(t, m2 - 0.1, 0.3));
  s.stamp = { lines: ['ONE AGENT', 'OWNS THE JOIN'], x: J, y: 640, pop: E(t, m2, 0.35) };
  return s;
}

function sequence(t: number, m: number[], spec: LadderSpec | undefined): BridgeState {
  const s = empty();
  const m0 = fin(m[0], 0.3);
  const m1 = fin(m[1], m0 + 1);
  const m2 = fin(m[2], m1 + 0.8);
  const gA = E(t, m0, Math.max(0.5, m1 - m0 - 0.1));
  const hand = E(t, m1 - 0.05, 0.35);
  const gB = E(t, m1 + 0.3, Math.max(0.5, m2 - m1 + 0.2));
  const drive0 = m2 + 0.6;
  const drive = E(t, drive0, 0.9);
  // A builds its span, hands the baton over and walks back to its bank; B, who waited behind A,
  // walks to the end of A's span and builds on from there. Positions stay continuous.
  const axBuild = Math.max(LB - 45, LB + gA * (J - LB) - 60);
  const ax = lerp(axBuild, LB - 50, E(t, m1 + 0.1, 0.6));
  // B waits a clear chip-width behind A (at 150 px their radios touched and read as one blob).
  const bWait = Math.min(axBuild - 185, lerp(LB - 230, J - 130, E(t, m0 + 0.2, Math.max(0.4, m1 - m0))));
  const bAtTip = lerp(bWait, J - 30, E(t, m1, 0.3));
  const bx = gB > 0 ? Math.max(bAtTip, Math.min(RB + 45, J + gB * (RB - J) - 30)) : bAtTip;
  s.banks.push({ y: DY, opacity: 1 });
  s.spans.push({ x0: LB, x1: J, y0: DY, y1: DY, grow: gA, from: 'left', tone: 'deck', opacity: 1 });
  s.spans.push({ x0: J, x1: RB, y0: DY, y1: DY, grow: gB, from: 'left', tone: 'deck', opacity: 1 });
  const a = crew('A', 'a', ax, DY - CREW_UP, { radio: 1 });
  const b = crew('B', 'b', bx, DY - CREW_UP, { radio: 1 });
  s.crews.push(a, b);
  s.batons.push({ x: lerp(ax + 20, bx - 20, hand), y: DY - CREW_UP - 70 - Math.sin(Math.PI * hand) * 60, opacity: progress(t, m1 - 0.1, 0.1) * (1 - progress(t, m1 + 0.45, 0.2)) });
  s.trucks.push(truck(lerp(T_START - 60, T_END, drive), DY, E(t, drive0 - 0.3, 0.3)));
  s.marks.push({ kind: 'tick', x: T_END, y: DY - 150, size: 70, pop: E(t, drive0 + 0.9, 0.35) });
  s.ladder = ladderOf(spec, t, 0.1, drive0 + 0.9, 1);
  return s;
}

function integrator(t: number, m: number[], spec: LadderSpec | undefined): BridgeState {
  const s = empty();
  const m0 = fin(m[0], 0.4);
  const m1 = fin(m[1], m0 + 0.9);
  const build = E(t, 0, Math.max(0.3, m0 - 0.05));
  const lift = E(t, m0, Math.max(0.5, m1 - m0 - 0.1));
  const yards = [
    { x: 80, y: 560, w: 250 },
    { x: 350, y: 560, w: 250 },
  ];
  s.banks.push({ y: DY, opacity: 1 });
  yards.forEach((y) => s.yards.push({ x: y.x, y: y.y, w: y.w, h: 200, opacity: 1 - 0.7 * lift }));
  // Each crew builds its span in its own yard; then both spans are lifted into place.
  const yardDeck = 700;
  const yA = { x0: yards[0].x + 25, x1: yards[0].x + yards[0].w - 25 };
  const yB = { x0: yards[1].x + 25, x1: yards[1].x + yards[1].w - 25 };
  s.spans.push({ x0: lerp(yA.x0, LB, lift), x1: lerp(yA.x1, J, lift), y0: lerp(yardDeck, DY, lift), y1: lerp(yardDeck, DY, lift), grow: build, from: 'left', tone: 'deck', opacity: 1 });
  s.spans.push({ x0: lerp(yB.x0, J, lift), x1: lerp(yB.x1, RB, lift), y0: lerp(yardDeck, DY, lift), y1: lerp(yardDeck, DY, lift), grow: build, from: 'right', tone: 'deck', opacity: 1 });
  s.crews.push(crew('A', 'a', yards[0].x + 60, yardDeck - CREW_UP, { radio: 1, opacity: 1 - 0.5 * lift, scale: 0.85 }));
  s.crews.push(crew('B', 'b', yards[1].x + yards[1].w - 60, yardDeck - CREW_UP, { radio: 1, opacity: 1 - 0.5 * lift, scale: 0.85 }));
  const drop = E(t, m1 - 0.35, 0.4);
  // C bolts the join, then steps onto the far bank so the truck can cross.
  const aside = E(t, m1 + 0.35, 0.5);
  s.crews.push(crew('C', 'c', lerp(J, 975, aside), lerp(DY - 420, DY - CREW_UP, drop), { opacity: progress(t, m1 - 0.35, 0.15), scale: 1.15 }));
  s.bolts.push({ x: J, y: DY + 4, pop: E(t, m1 + 0.05, 0.35) });
  const drive0 = m1 + 0.6;
  s.trucks.push(truck(lerp(T_START - 60, 840, E(t, drive0, 0.8)), DY, E(t, drive0 - 0.3, 0.3)));
  s.marks.push({ kind: 'tick', x: 840, y: DY - 150, size: 70, pop: E(t, drive0 + 0.8, 0.35) });
  s.ladder = ladderOf(spec, t, 0.1, drive0 + 0.8, 1);
  return s;
}

function verdict(t: number, m: number[]): BridgeState {
  const s = empty();
  const m0 = fin(m[0], 1.5);
  ownedBridge(s, t, -1, 1, true);
  s.trucks.push(truck(T_END, DY, 1));
  s.marks.push({ kind: 'tick', x: T_END, y: DY - 150, size: 70, pop: 1 });
  s.tags.push(tag('a smaller gap remains: agents rarely\nimprovise process on their own', J, 560, E(t, m0 + 0.9, 0.5), { anchor: 'middle', tone: 'muted', size: 32, weight: 500 }));
  return s;
}

/** What the bridge stage draws at scene second `t`. */
export function frameState(p: BridgeProps, time: number, _beats: number[], dur: number): BridgeState {
  const t = sceneTime(time, dur);
  const s = modeState(p, t);
  // The owner stamp leaves before the blend into 'sequence', whose opaque ladder would cut it.
  if (p.mode === 'owner' && s.stamp && Number.isFinite(dur)) s.stamp = { ...s.stamp, fade: 1 - progress(time, dur - 0.95, 0.35) };
  return p.enter !== undefined ? entered(s, E(t, p.enter, 0.2), p.enterLadder ?? false) : s;
}

/** Fades in everything but the banks (and the ladder, unless asked) by `k`. */
function entered(s: BridgeState, k: number, ladderToo: boolean): BridgeState {
  if (k >= 1) return s;
  const o = <T extends { opacity: number }>(xs: T[]) => xs.map((x) => ({ ...x, opacity: x.opacity * k }));
  return {
    ...s,
    spans: o(s.spans),
    crews: o(s.crews),
    links: o(s.links),
    trucks: o(s.trucks),
    barriers: o(s.barriers),
    batons: o(s.batons),
    bubbles: o(s.bubbles),
    thoughts: o(s.thoughts),
    yards: o(s.yards),
    tags: o(s.tags),
    sparks: s.sparks.map((x) => ({ ...x, pop: x.pop * k })),
    marks: s.marks.map((x) => ({ ...x, pop: x.pop * k })),
    bolts: s.bolts.map((x) => ({ ...x, pop: x.pop * k })),
    cracks: s.cracks.map((x) => ({ ...x, draw: x.draw * k })),
    fences: s.fences.map((x) => ({ ...x, draw: x.draw * k })),
    typing: s.typing ? { ...s.typing, opacity: s.typing.opacity * k } : null,
    ladder: s.ladder && ladderToo ? { ...s.ladder, opacity: s.ladder.opacity * k } : s.ladder,
  };
}

function modeState(p: BridgeProps, t: number): BridgeState {
  const m = p.marks ?? [];
  switch (p.mode) {
    case 'hook':
      return hook(t);
    case 'paper':
      return paper(t, m);
    case 'humans':
      return humans(t);
    case 'setup':
      return setup(t, m);
    case 'clash':
      return clash(t, m);
    case 'ladder':
      return ladder(t, m, p.ladder);
    case 'handshake':
      return handshake(t, m, p.ladder);
    case 'silence':
      return silence(t, m);
    case 'fences':
      return fences(t, m, p.ladder);
    case 'owner':
      return owner(t, m, p.ladder);
    case 'sequence':
      return sequence(t, m, p.ladder);
    case 'integrator':
      return integrator(t, m, p.ladder);
    case 'verdict':
      return verdict(t, m);
    default:
      return empty();
  }
}
