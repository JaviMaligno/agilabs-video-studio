// Pure state of the closed box on a conveyor, the one picture that carries the video.
// A pipeline `documents → search → context → head → label` drawn as a conveyor. The head is a box
// with a lid (the model chip inside, or a tree glyph for the frozen random forest). Under it, five
// pass rows of output labels; a few flip between passes (the wobble).
// - The fault lives in the search: its three documents keep reordering (teal = the cause). The
//   agents' suspicion is an amber magnifier that settles on the head.
// - Without the code, search and context are covered grey; with it, the pipeline turns to glass.
// - The patch: a damper (vote + temperature knob) clamps onto the label block; the label steadies,
//   the shuffle upstream keeps going.
// - The swap, the two arms (model / forest), the 260/260 tags, the die and the wrench, the
//   unopened envelope (0 / 280) and the two verdict stamps.
// One mode per scene; each starts where the previous one of the same layout ended, so the blends
// do not jump. `marks` are scene seconds of spoken words (timeline.ts resolves them); `clock` is
// the video second the scene starts at, so the conveyor and the shuffle run continuously.
// No Remotion or React here.
import { easeOutCubic, progress, sceneTime } from './steps.ts';

export const MODES = ['hook', 'story', 'layers', 'rig', 'fault', 'split', 'patch', 'swap', 'arms', 'bars', 'closed', 'accuse', 'ask', 'verdict'] as const;
export type BoxMode = (typeof MODES)[number];
export type ClosedBoxProps = { mode: BoxMode; marks?: number[]; clock?: number };

export const SINGLE_MODES: BoxMode[] = ['hook', 'story', 'layers', 'rig', 'fault', 'swap', 'ask'];

/** Pipeline blocks, x and width in frame pixels. Everything stays left of x = 940 (action rail). */
export const BLOCKS = [
  { id: 'docs', label: 'documents', x: 60, w: 150 },
  { id: 'search', label: 'search', x: 228, w: 140 },
  { id: 'context', label: 'context', x: 386, w: 150 },
  { id: 'head', label: 'head', x: 554, w: 210 },
  { id: 'label', label: 'label', x: 782, w: 140 },
] as const;
export const HEAD = BLOCKS[3];
export const RIGHT_EDGE = 940;
export const centerX = (i: number) => BLOCKS[i].x + BLOCKS[i].w / 2;

/** One pipeline on its own (single) or two stacked (double); `zone` is the tag strip under a row. */
export const SINGLE_ROW = { header: 432, top: 490, h: 130, zone: 650 } as const;
export const DOUBLE_ROWS = [
  { header: 412, top: 476, h: 112, zone: 618 },
  { header: 748, top: 812, h: 112, zone: 954 },
] as const;
export const ZONE_H = 100;
/** The strip under the rows for stamps, bars and notes. */
export const LOWER = { top: 1086, bottom: 1320 } as const;

/** Five passes over the same five projects; columns 1 and 3 flip between passes. */
export const PASSES = [
  ['devtools', 'ml', 'web', 'data', 'infra'],
  ['devtools', 'data', 'web', 'data', 'infra'],
  ['devtools', 'ml', 'web', 'web', 'infra'],
  ['devtools', 'ml', 'web', 'data', 'infra'],
  ['devtools', 'data', 'web', 'web', 'infra'],
] as const;
export const FLIP_COLS = [1, 3];
export const GRID = { top: 740, rowH: 50, gap: 10, x0: 172, cellW: 144, cellGap: 8 } as const;

/** Every text shown on screen that carries a figure or a claim (traced in factcheck.md). */
export const TEXT = {
  inputs: 'inputs changed',
  retrieval: 'retrieval order',
  truncated: 'context cut short',
  causeUsually: 'where the cause usually is',
  suspicionLands: 'where suspicion lands',
  repos: '50 real repos',
  faultTag: 'score ties broken by request ID',
  notCause: 'not the cause',
  prompt: 'same prompt for both: “investigate”',
  withoutCode: 'without the code · n = 20',
  withCode: 'with the code · n = 20',
  found: 'found the cause',
  patched: 'patched the symptom',
  without3: '3/20',
  with20: '20/20',
  without19: '19/20',
  with9: '9/20',
  causeStill: 'cause still shuffling',
  patchStamp: 'PATCHED THE SYMPTOM · 19/20',
  note1: 'blamed sampling outright: 4/20 vs 0/20',
  note2: 'p = 0,053 · not significant',
  swapTag: 'random forest · frozen · same interface',
  modelArm: 'language model · n = 20',
  forestArm: 'random forest · n = 20',
  tag260: 'same answer · 260/260',
  bar: '19/20',
  p76: 'p = 0.76',
  banner1: 'Not the model.',
  banner2: 'A closed box.',
  dieModel: '14/20',
  dieForest: '4/20',
  random: 'random by nature',
  snippet1: '“temperature > 0 with no seed”',
  snippet2: '“the nightly re-roll”',
  wrench1: 'retrains without random_state',
  wrench2: 'parallelism',
  envelope: 'full trace · on request',
  counter: '0 / 280',
  pin: 'asking is a complete answer',
  ask1: 'explicit permission:',
  ask2: '0/20 asked · 14/20 hedged instead',
  stamp1: 'PATCHING · ANY CLOSED BOX',
  hedge: 'one fault · one corpus · two heads',
  stamp2: 'CALLED RANDOM',
  mirrorAgent: 'the agents',
  mirrorHead: 'the head',
  mirrorTag: 'models judging a model',
} as const;

export type Stat = { label: string; value: string; opacity: number };

export type RowState = {
  opacity: number;
  header: string;
  /** Grey cover over search and context (no code), and the glass look (code open). */
  cover: number;
  glass: number;
  content: 'model' | 'forest';
  /** The lid (0 shut, 1 open), the model chip lifted out of the head, and moved aside. */
  lid: number;
  lift: number;
  aside: number;
  /** The tree glyph dropping into the head (swap); 1 when it sits there. */
  drop: number;
  /** Teal glow on documents, search and context. */
  glow: number[];
  /** The three documents inside the search, in slot units (0..2), and their teal shuffle glow. */
  docSlots: number[];
  shuffle: number;
  /** The label block: the shown label and how much it wobbles (0 steady). */
  labelText: string;
  wobble: number;
  damper: number;
  damperScale: number;
  magnifier: { x: number; y: number; opacity: number };
  tag260: number;
  die: number;
  dieBig: boolean;
  wrench: number;
  snippets: number[];
  stats: Stat[];
  causeStill: number;
  notCause: number;
  calledRandom: number;
};

export type BoxState = {
  layout: 'single' | 'double';
  rows: RowState[];
  classifier: number;
  grid: { opacity: number; rows: number[]; pulse: number };
  agent: { opacity: number; term: number; bubble: number; bubble2: number };
  layers: { opacity: number; tags: number[]; bracket: number; suspicion: number };
  rig: { opacity: number; stack: number; out: number };
  faultTag: number;
  prompt: number;
  patch: { stamp: number; note: number };
  swapTag: number;
  bars: { opacity: number; grow: number[]; p: number };
  banner: { opacity: number; line1: number; line2: number };
  split: number;
  ask: { opacity: number; envelope: number; counter: number; tools: number[]; pin: number; note: number };
  verdict: { stamp1: number; hedge: number };
  /** The last beat: the agents calling the model random are models too (agent chip ↔ head chip). */
  mirror: { opacity: number; agent: number; head: number; link: number; tag: number };
};

const e = (t: number, s: number, l = 0.4) => easeOutCubic(progress(t, s, l));
const easeInOut = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2);
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const mk = (marks: number[] | undefined, i: number, fallback: number) => {
  const m = marks?.[i];
  return m !== undefined && Number.isFinite(m) ? m : fallback;
};
/** What leaves at the start of a mode waits for the blend (the outgoing scene stays for 0.3 s). */
const LEAVE = 0.3;

/** Shuffle of the three documents in the search: one reorder every 1.2 s, 0.35 s long. */
const PERMS = [
  [0, 1, 2],
  [2, 0, 1],
  [1, 2, 0],
  [0, 2, 1],
];
export function docSlots(clockT: number): number[] {
  const c = Number.isFinite(clockT) ? Math.max(0, clockT) : 0;
  const k = Math.floor(c / 1.2);
  const f = easeInOut(Math.min(1, (c - k * 1.2) / 0.35));
  const a = PERMS[k % PERMS.length];
  const b = PERMS[(k + 1) % PERMS.length];
  return a.map((_, i) => +lerp(a[i], b[i], f).toFixed(4));
}
const wobbleLabel = (clockT: number, wobble: number) => (wobble > 0.5 && Math.floor(Math.max(0, clockT) / 0.8) % 2 === 1 ? 'data' : 'ml');

const baseRow = (header = ''): RowState => ({
  opacity: 1,
  header,
  cover: 0,
  glass: 0,
  content: 'model',
  lid: 0,
  lift: 0,
  aside: 0,
  drop: 0,
  glow: [0, 0, 0],
  docSlots: [0, 1, 2],
  shuffle: 0,
  labelText: 'ml',
  wobble: 1,
  damper: 0,
  damperScale: 1,
  magnifier: { x: centerX(3), y: 0, opacity: 0 },
  tag260: 0,
  die: 0,
  dieBig: true,
  wrench: 0,
  snippets: [0, 0],
  stats: [],
  causeStill: 0,
  notCause: 0,
  calledRandom: 0,
});

export function frameState(props: ClosedBoxProps, t: number, beats: number[], dur: number): BoxState {
  const mode: BoxMode = (MODES as readonly string[]).includes(props.mode) ? props.mode : 'hook';
  const T = sceneTime(Number.isFinite(t) ? t : 0, dur);
  const raw = Number.isFinite(t) ? Math.max(0, Number.isFinite(dur) ? Math.min(t, dur) : t) : 0;
  const clockT = (Number.isFinite(props.clock) ? (props.clock as number) : 0) + raw;
  const m = props.marks;
  const b0 = beats[0] !== undefined && Number.isFinite(beats[0]) ? beats[0] : 0;
  const b1 = beats[1] !== undefined && Number.isFinite(beats[1]) ? beats[1] : b0 + 2.5;
  const b2 = beats[2] !== undefined && Number.isFinite(beats[2]) ? beats[2] : b1 + 2.5;
  const is = (...ms: BoxMode[]) => ms.includes(mode);
  const single = SINGLE_MODES.includes(mode);
  const out = (s = LEAVE) => 1 - e(T, s, 0.35);

  const st: BoxState = {
    layout: single ? 'single' : 'double',
    rows: [],
    classifier: 0,
    grid: { opacity: 0, rows: [0, 0, 0, 0, 0], pulse: 0.5 + 0.5 * Math.sin(clockT * 5) },
    agent: { opacity: 0, term: 0, bubble: 0, bubble2: 0 },
    layers: { opacity: 0, tags: [0, 0, 0], bracket: 0, suspicion: 0 },
    rig: { opacity: 0, stack: 0, out: 0 },
    faultTag: 0,
    prompt: 0,
    patch: { stamp: 0, note: 0 },
    swapTag: 0,
    bars: { opacity: 0, grow: [0, 0], p: 0 },
    banner: { opacity: 0, line1: 0, line2: 0 },
    split: 0,
    ask: { opacity: 0, envelope: 0, counter: 0, tools: [0, 0, 0], pin: 0, note: 0 },
    verdict: { stamp1: 0, hedge: 0 },
    mirror: { opacity: 0, agent: 0, head: 0, link: 0, tag: 0 },
  };
  const slots = docSlots(clockT);

  if (single) {
    const r = baseRow();
    r.docSlots = slots;
    r.magnifier.y = SINGLE_ROW.top + SINGLE_ROW.h / 2;
    if (is('hook')) {
      const blaming = mk(m, 0, b0 + 1.2);
      const took = mk(m, 1, b0 + 2.3);
      r.lid = e(T, took - 0.2, 0.3);
      r.lift = e(T, took, 0.55);
      const glide = easeInOut(progress(T, 0.5, Math.max(0.6, blaming + 0.5 - 0.5)));
      r.magnifier = { x: lerp(centerX(0), centerX(3), glide), y: r.magnifier.y, opacity: e(T, 0.2, 0.35) };
      st.grid = { ...st.grid, opacity: e(T, 0.05, 0.35), rows: PASSES.map((_, i) => e(T, 0.1 + i * 0.1, 0.3)) };
    }
    if (is('story')) {
      const agents = mk(m, 0, b0 + 1.5);
      const blamed = mk(m, 1, b1 + 1.6);
      const randomness = mk(m, 2, b1 + 2.6);
      r.lift = 1 - e(T, LEAVE + 0.1, 0.5);
      r.lid = 1 - e(T, LEAVE + 0.55, 0.3);
      r.magnifier = { ...r.magnifier, opacity: 1 };
      st.grid = { ...st.grid, opacity: out(), rows: [1, 1, 1, 1, 1] };
      st.agent = { opacity: 1, term: e(T, Math.max(LEAVE + 0.3, agents - 0.15)), bubble: e(T, blamed - 0.1), bubble2: e(T, randomness) };
    }
    if (is('layers')) {
      const cause = mk(m, 0, b0 + 1.2);
      const design = mk(m, 1, b0 + 2.6);
      st.agent = { opacity: out(), term: 1, bubble: 1, bubble2: 1 };
      r.magnifier = { ...r.magnifier, opacity: 1 };
      const tags = [0, 1, 2].map((i) => e(T, cause + i * 0.35, 0.35));
      r.glow = tags;
      st.layers = { opacity: 1, tags, bracket: e(T, Math.max(cause + 0.9, design - 0.3), 0.4), suspicion: e(T, LEAVE + 0.2, 0.4) };
    }
    if (is('rig')) {
      const test = mk(m, 0, b0 + 0.9);
      const sorts = mk(m, 1, b0 + 2.6);
      const leave = out();
      r.glow = [leave, leave, leave];
      r.magnifier = { ...r.magnifier, opacity: leave };
      st.layers = { opacity: leave, tags: [1, 1, 1], bracket: 1, suspicion: 1 };
      st.classifier = e(T, Math.max(LEAVE + 0.1, test - 0.2));
      st.rig = { opacity: 1, stack: e(T, test, 0.45), out: e(T, sorts, 0.45) };
    }
    if (is('fault')) {
      const planted = mk(m, 0, b0 + 0.6);
      const search = mk(m, 1, b0 + 2.0);
      const labels = mk(m, 3, b1 + 0.3);
      const nothing = mk(m, 4, b1 + 2.6);
      st.classifier = 1;
      st.rig = { opacity: out(), stack: 1, out: 1 };
      r.glow = [0, e(T, planted, 0.4), 0];
      r.shuffle = e(T, planted, 0.4);
      st.faultTag = e(T, search, 0.4);
      st.grid = { ...st.grid, opacity: e(T, labels - 0.2, 0.3), rows: PASSES.map((_, i) => e(T, labels + i * 0.22, 0.3)) };
      r.notCause = e(T, nothing, 0.35);
    }
    if (is('swap')) {
      const swapped = mk(m, 0, b0 + 2.4);
      const frozen = mk(m, 1, b0 + 3.4);
      const forest = mk(m, 2, b0 + 3.9);
      r.cover = 1;
      r.lid = e(T, swapped - 0.15, 0.3) * (1 - e(T, forest + 0.55, 0.3));
      r.lift = e(T, swapped + 0.1, 0.45);
      r.aside = e(T, swapped + 0.55, 0.55);
      r.drop = e(T, forest - 0.15, 0.5);
      st.swapTag = e(T, frozen, 0.4);
    }
    if (is('ask')) {
      const two = mk(m, 0, b0 + 0.8);
      const not = mk(m, 1, b0 + 2.4);
      const missing = mk(m, 2, b0 + 3.3);
      const complete = mk(m, 3, b1 + 2.0);
      r.cover = 1;
      st.ask = {
        opacity: 1,
        envelope: e(T, Math.max(LEAVE + 0.1, Math.min(two, 0.6)), 0.45),
        counter: e(T, not - 0.1, 0.35),
        tools: [0, 1, 2].map((i) => e(T, missing + 0.1 + i * 0.25, 0.35)),
        pin: e(T, complete - 0.15, 0.35),
        note: e(T, complete + 0.45, 0.4),
      };
    }
    if (is('hook', 'story', 'layers', 'rig', 'fault', 'swap', 'ask')) r.labelText = wobbleLabel(clockT, r.wobble);
    st.rows = [r];
    return st;
  }

  // ---- two rows ----
  const yOf = (i: number) => DOUBLE_ROWS[i].top + DOUBLE_ROWS[i].h / 2;
  const rows = [baseRow(), baseRow()];
  rows.forEach((r, i) => {
    r.docSlots = slots;
    r.magnifier.y = yOf(i);
    r.cover = 1;
  });
  const arms = is('arms', 'bars', 'closed', 'accuse', 'verdict');
  if (arms) {
    rows[0].header = TEXT.modelArm;
    rows[1].header = TEXT.forestArm;
    rows[1].content = 'forest';
    rows[1].drop = 1;
    rows.forEach((r) => (r.tag260 = 1));
  } else {
    rows[0].header = TEXT.withoutCode;
    rows[1].header = TEXT.withCode;
  }

  if (is('split', 'patch')) {
    const split = is('split');
    const forty = mk(m, 0, b0 + 0.3);
    const investigate = mk(m, 1, b0 + 1.4);
    const read = mk(m, 2, b0 + 3.0);
    const all = mk(m, 3, b1 + 0.8);
    const without = mk(m, 4, b1 + 2.3);
    const three = mk(m, 5, b1 + 2.9);
    const wanderX = centerX(3) - 130 + 130 * Math.sin(clockT * 2.1);
    if (split) {
      rows[0].opacity = e(T, Math.max(0.05, forty - 0.25), 0.4);
      rows[1].opacity = e(T, Math.max(0.2, forty), 0.4);
      rows[1].glass = e(T, read - 0.1, 0.5);
      rows[1].cover = 1 - rows[1].glass;
      st.prompt = e(T, investigate - 0.1, 0.4);
      const go = e(T, all - 0.1, 0.6);
      rows[1].magnifier = { x: lerp(centerX(3), centerX(1), go), y: yOf(1), opacity: e(T, all - 0.3, 0.3) };
      rows[0].magnifier = { x: wanderX, y: yOf(0), opacity: e(T, without - 0.1, 0.3) };
      rows[1].stats = [{ label: TEXT.found, value: TEXT.with20, opacity: e(T, all + 0.3, 0.35) }];
      rows[0].stats = [{ label: TEXT.found, value: TEXT.without3, opacity: e(T, three - 0.05, 0.35) }];
    } else {
      const nineteen = mk(m, 0, b0 + 1.2);
      const damped = mk(m, 1, b0 + 2.4);
      const voting = mk(m, 2, b0 + 3.4);
      const nine = mk(m, 3, b1 + 0.9);
      rows[1].glass = 1;
      rows[1].cover = 0;
      st.prompt = out();
      rows[1].magnifier = { x: centerX(1), y: yOf(1), opacity: 1 };
      rows[0].magnifier = { x: wanderX, y: yOf(0), opacity: 1 };
      rows[0].damper = e(T, damped - 0.1, 0.4);
      rows[0].wobble = 1 - e(T, damped + 0.2, 0.3);
      rows[0].causeStill = e(T, damped + 0.5, 0.4);
      rows[1].damper = e(T, nine - 0.05, 0.4);
      rows[1].damperScale = 0.72;
      rows[1].wobble = 1 - e(T, nine + 0.25, 0.3);
      rows[0].stats = [
        { label: TEXT.found, value: TEXT.without3, opacity: 1 },
        { label: TEXT.patched, value: TEXT.without19, opacity: e(T, nineteen - 0.05, 0.35) },
      ];
      rows[1].stats = [
        { label: TEXT.found, value: TEXT.with20, opacity: 1 },
        { label: TEXT.patched, value: TEXT.with9, opacity: e(T, nine, 0.35) },
      ];
      st.patch = { stamp: e(T, voting, 0.35), note: e(T, nine + 0.4, 0.4) };
    }
    rows[1].shuffle = rows[1].glass;
  }

  if (arms) {
    const armsMode = is('arms');
    if (armsMode) {
      const same = mk(m, 0, b0 + 0.2);
      const told = mk(m, 1, b0 + 2.0);
      rows[0].opacity = e(T, Math.max(0.05, same - 0.2), 0.4);
      rows[1].opacity = e(T, Math.max(0.2, same + 0.05), 0.4);
      rows[0].tag260 = e(T, told, 0.45);
      rows[1].tag260 = e(T, told + 0.15, 0.45);
    }
    // The damper lands on both arms in the same frame.
    const nineteen = mk(m, 0, b0 + 1.4);
    const damp = is('bars') ? e(T, nineteen - 0.1, 0.4) : armsMode ? 0 : 1;
    rows.forEach((r) => {
      r.damper = damp;
      r.wobble = is('bars') ? 1 - e(T, nineteen + 0.2, 0.3) : armsMode ? 1 : 0;
    });
    if (is('bars')) {
      const forest = mk(m, 1, b0 + 3.4);
      const grow = e(T, nineteen - 0.05, 0.7);
      st.bars = { opacity: e(T, nineteen - 0.3, 0.3), grow: [grow, grow], p: e(T, forest, 0.4) };
    }
    if (is('closed')) {
      const no = mk(m, 0, b0 + 0.9);
      const box = mk(m, 1, b0 + 2.6);
      const leave = out();
      st.bars = { opacity: leave, grow: [1, 1], p: 1 };
      st.banner = { opacity: 1, line1: e(T, Math.max(LEAVE + 0.2, no - 0.1), 0.4), line2: e(T, box - 0.05, 0.35) };
      // The lids pop up a little and slam shut on "box".
      const slam = Math.sin(Math.PI * progress(T, box - 0.5, 0.5));
      rows.forEach((r) => (r.lid = 0.35 * Math.max(0, slam)));
    }
    if (is('accuse')) {
      const accusation = mk(m, 0, b0 + 1.2);
      const fourteen = mk(m, 1, b1 + 0.2);
      const forest = mk(m, 2, b1 + 2.4);
      const system = mk(m, 3, b2 + 1.6);
      const model = mk(m, 4, b2 + 2.9);
      st.banner = { opacity: out(), line1: 1, line2: 1 };
      rows.forEach((r, i) => (r.magnifier = { x: centerX(3), y: yOf(i), opacity: e(T, accusation - 0.25 + i * 0.12, 0.35) }));
      rows[0].die = e(T, fourteen - 0.05, 0.4);
      rows[1].die = e(T, forest, 0.4);
      rows[1].dieBig = false;
      rows[0].snippets = [e(T, fourteen + 0.7, 0.4), e(T, fourteen + 1.3, 0.4)];
      rows[1].wrench = e(T, system - 0.1, 0.4);
      st.split = e(T, model - 0.1, 0.4);
    }
    if (is('verdict')) {
      const closed = mk(m, 0, b0 + 2.6);
      const called = mk(m, 2, b1 + 3.6);
      rows[0].die = 1;
      rows[1].wrench = 1;
      st.verdict = { stamp1: e(T, closed - 0.1, 0.35), hedge: e(T, closed + 0.5, 0.4) };
      rows[0].calledRandom = e(T, called, 0.35);
      // The mirror replaces the lower strip: the agents' chip, then the head's, then the tag.
      const agents = mk(m, 3, b2 + 0.4);
      const models = mk(m, 4, b2 + 2.6);
      st.mirror = {
        opacity: e(T, agents - 0.3, 0.35),
        agent: e(T, agents - 0.1, 0.4),
        head: e(T, models - 0.25, 0.4),
        link: e(T, models + 0.05, 0.4),
        tag: e(T, models + 0.45, 0.4),
      };
    }
  }

  rows.forEach((r) => (r.labelText = wobbleLabel(clockT, r.wobble)));
  st.rows = rows;
  return st;
}
