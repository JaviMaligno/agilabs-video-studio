// Pure state of the plan board, the spine of the video: three lanes (DONE · NOW · AHEAD) with task
// cards, the agent's plan drawn on it in red marker (an invented arrow "4 after 3", the intro
// dragged to the end, ghost takes in DONE that never happened), and a wall clock + tear-off
// calendar above it, the obvious suspect. The fact sheet (the test material) slides over the board
// in the setup scenes. No Remotion or React here.
//
// Every mode starts from where the previous one ended, so consecutive scenes blend without a jump.
// `marks` are scene seconds of spoken words (timeline.ts resolves them from the TTS timestamps).
import { clamp01, easeOutCubic, progress, sceneTime } from './steps.ts';

export type PlanMode =
  | 'hook'
  | 'clock'
  | 'sheet'
  | 'ask'
  | 'conditions'
  | 'release'
  | 'provenance'
  | 'repeat'
  | 'date'
  | 'prohibit'
  | 'verdict'
  | 'split'
  | 'rewrite';

export type PlanBoardProps = { mode: PlanMode; marks?: number[]; clock?: number };

/** Frame geometry (vertical 1080x1920). The question card sits at 236-364. */
export const G = {
  top: { y: 392, h: 140 },
  board: { x: 44, y: 560, w: 992, h: 560 },
  lanes: { DONE: 612, NOW: 782, AHEAD: 952 } as Record<Lane, number>,
  slotX: [60, 392, 724],
  card: { w: 296, h: 110 },
  band: { y: 1134, h: 192 },
} as const;

export type Lane = 'DONE' | 'NOW' | 'AHEAD';
export type Tone = 'real' | 'agent';

export type CardState = {
  id: string;
  label: string;
  x: number;
  y: number;
  opacity: number;
  /** 1 = drawn as a ghost: dashed outline, translucent (work the plan treats as done). */
  ghost: number;
  /** 1 = red outline: the agent put it there. */
  agent: number;
  badge: string;
  badgePop: number;
  badgeTone: 'ok' | 'warm' | 'bad';
  /** Where the badge sits: on the top edge, or the bottom edge (clear of the marker arrow). */
  badgeAt: 'top' | 'bottom';
  /** The calendar's job: the NOW lane lit (scene 19). */
  lit: number;
};

export type BandLine = { text: string; size: number; tone: 'text' | 'muted' | 'ok' | 'warm' | 'bad'; opacity: number };

export type PlanState = {
  top: {
    opacity: number;
    clockDim: number;
    glow: number;
    hand: number;
    calTop: string;
    calMain: string;
    flutter: number;
    studio: number;
    studioPulse: number;
    plan: string;
    planOpacity: number;
  };
  board: { opacity: number; dim: number; laneLit: number };
  cards: CardState[];
  arrow: { draw: number; opacity: number; label: number };
  nothingTag: number;
  rehearsalStrip: number;
  band: BandLine[];
  gauges: number;
  dateStrip: { opacity: number; fly: number };
  sticky: { pop: number };
  verdict: { pop: number };
  sheet: {
    opacity: number;
    slide: number;
    flip: number;
    domain: 'course' | 'release';
    lines: number[];
    /** Release domain: each course item's release counterpart (and its arrow) landing. */
    mapped: number[];
    kb: number;
    chips: number[];
    bubble: number;
    tabs: number;
    tab: number;
    strips: number[];
    counter: number;
    counterOpacity: number;
    judge: number;
    same: number;
  };
  rewrite: { opacity: number; strike: number; fresh: number; dagger: number; quote: number; emphasis: number };
};

const ORDER: PlanMode[] = ['hook', 'clock', 'sheet', 'ask', 'conditions', 'release', 'provenance', 'repeat', 'date', 'prohibit', 'verdict', 'split', 'rewrite'];
const SHEET_MODES = new Set<PlanMode>(['sheet', 'ask', 'conditions', 'release']);

export const MODELS = ['gpt-4o', 'gpt-4.1-mini', 'gpt-5.4-mini', 'claude-haiku-4.5', 'claude-sonnet-4.6', 'claude-opus-5'];
export const COURSE_LINES = ['68 videos to record', 'studio: 4 days, ahead', 'scripts frozen since July', 'timings: 2 good / 3 to redo / 63 pending', 'piece 4: “I’ll rewrite them for you”'];
/** Scene 6 (revised 2026-10-21): each course fact and its counterpart in the release domain. */
export const RELEASE_PAIRS: [course: string, release: string][] = [
  ['68 videos', '12 services'],
  ['studio days: ahead', 'deploy window: ahead'],
  ['read-throughs: behind', 'staging rehearsals: behind'],
];
export const STRIPS = ['today is 11 August 2026', 'these are practice read-throughs, not studio takes', 'don’t invent ordering constraints'];
/** Which strips each condition tab A-E adds to the material. */
export const TAB_STRIPS: number[][] = [[], [0], [1], [0, 1], [0, 1, 2]];

const e = (t: number, start: number, len: number) => easeOutCubic(progress(t, start, len));
const mk = (marks: number[] | undefined, i: number, fallback: number) => {
  const m = marks?.[i];
  return m !== undefined && Number.isFinite(m) ? m : fallback;
};

/** Slot of a card on the board: lane + slot index; the intro moves from AHEAD 0 to AHEAD 2. */
const slot = (lane: Lane, i: number) => ({ x: G.slotX[Math.max(0, Math.min(2, i))], y: G.lanes[lane] });

export function frameState(props: PlanBoardProps, t: number, beats: number[], dur: number): PlanState {
  const mode: PlanMode = ORDER.includes(props.mode) ? props.mode : 'hook';
  const T = sceneTime(Number.isFinite(t) ? t : 0, dur);
  const m = props.marks;
  const b0 = beats[0] !== undefined && Number.isFinite(beats[0]) ? beats[0] : 0;
  const b1 = beats[1] !== undefined && Number.isFinite(beats[1]) ? beats[1] : b0 + 1.2;
  const after = (x: PlanMode) => ORDER.indexOf(mode) > ORDER.indexOf(x);
  const at = (x: PlanMode) => mode === x;
  const clockT = (Number.isFinite(props.clock) ? (props.clock as number) : 0) + (Number.isFinite(t) ? Math.max(0, t) : 0);

  // ---- the hook build-up (board state that every later mode inherits as finished) ----
  const hook = at('hook');
  // Starts moving at once: the first second of a vertical cut must already show the plan changing.
  const drag = hook ? e(T, 0.1, 0.8) : 1;
  const arrowDraw = hook ? progress(T, 0.9, 0.7) : 1;
  const takesIn = hook ? e(T, 1.45, 0.4) : 1;
  const never = hook ? mk(m, 0, 2.4) : 0;
  const ghostHook = hook ? e(T, never, 0.5) : 1;

  // ---- failure 3: Opus clears the ghost takes; the other five bring them back ----
  const prov = at('provenance');
  const rep = at('repeat');
  const replanned = mk(m, 1, b1 + 0.8);
  // The ghosts come back only once the chip reads "the other five" (it switches at 0.8 s), or they
  // seem to return under Opus's label.
  const takesVanish = prov ? e(T, replanned, 0.6) : rep ? 1 - e(T, 0.85, 0.5) : 0;

  // ---- scene 19: the calendar lights NOW; the cards show what it cannot ----
  const split = at('split');
  const rewrite = at('rewrite');
  const laneLit = split ? e(T, mk(m, 1, b0 + 1), 0.5) : 0;
  const settled = split ? e(T, mk(m, 2, b0 + 2.5), 0.4) : rewrite ? 1 : 0;

  // Cards: scripts (real, done), two ghost takes, piece 3 (now), piece 4 / more / intro (ahead).
  const introSlot = { x: G.slotX[0] + (G.slotX[2] - G.slotX[0]) * drag, y: G.lanes.AHEAD - 26 * Math.sin(Math.PI * drag) };
  const p4 = { x: G.slotX[1] + (G.slotX[0] - G.slotX[1]) * drag, y: G.lanes.AHEAD };
  const more = { x: G.slotX[2] + (G.slotX[1] - G.slotX[2]) * drag, y: G.lanes.AHEAD };
  const takeOpacity = takesIn * (1 - takesVanish);
  const card = (id: string, label: string, pos: { x: number; y: number }, o: Partial<CardState> = {}): CardState => ({
    id,
    label,
    x: pos.x,
    y: pos.y,
    opacity: 1,
    ghost: 0,
    agent: 0,
    badge: '',
    badgePop: 0,
    badgeTone: 'ok',
    badgeAt: 'top',
    lit: 0,
    ...o,
  });
  const cards: CardState[] = [
    card('scripts', 'scripts', slot('DONE', 0), { badge: 'frozen', badgePop: settled, badgeTone: 'ok' }),
    card('good', '2 takes · good', slot('DONE', 1), { opacity: takeOpacity, ghost: ghostHook, agent: 1, badge: '†', badgePop: settled, badgeTone: 'warm' }),
    card('redo', '3 takes · redo', slot('DONE', 2), { opacity: takeOpacity, ghost: ghostHook, agent: 1, badge: '†', badgePop: settled, badgeTone: 'warm' }),
    card('p3', 'piece 3', slot('NOW', 1), { lit: laneLit }),
    card('p4', 'piece 4', p4, { badge: 'self-contained', badgePop: settled, badgeTone: 'ok', badgeAt: 'bottom' }),
    card('more', 'more pieces', more),
    card('intro', 'intro', introSlot, { agent: hook ? progress(T, 0.35, 0.3) : 1 }),
  ];

  // ---- the top strip: clock, calendar, studio window / plan chip ----
  const clk = at('clock');
  const dateIn = at('date') ? e(T, mk(m, 0, b0 + 0.3), 0.5) : after('date') ? 1 : 0;
  const tear = at('date') ? e(T, mk(m, 0, b0 + 0.3) + 0.45, 0.55) : after('date') ? 1 : 0;
  const verdictPop = at('verdict') ? e(T, mk(m, 0, b0 + 0.8) - 0.15, 0.45) : after('verdict') ? 1 : 0;
  const clockDim = at('verdict') ? 0.7 * verdictPop : after('verdict') ? 0.7 : prov || rep ? 0.55 : 0;
  const top = {
    opacity: SHEET_MODES.has(mode) ? 0 : 1,
    clockDim: split ? 0.15 : rewrite ? 0.6 : clockDim,
    glow: clk ? e(T, 0.15, 0.5) * (0.65 + 0.35 * Math.sin(clockT * 6) ** 2) : at('date') ? 0.5 * (1 - tear) : 0,
    hand: ((clockT * 30) % 360 + 360) % 360,
    calTop: dateIn > 0.5 ? 'AUG 2026' : 'today',
    calMain: dateIn > 0.5 ? '11' : '?',
    flutter: clk ? 22 * Math.sin(Math.PI * progress(T, mk(m, 0, b0 + 0.6), 0.9)) * Math.sin(T * 18) : 0,
    studio: hook || clk ? 1 : 0,
    studioPulse: hook ? Math.sin(Math.PI * progress(T, never, 0.9)) : 0,
    // In `repeat` the chip keeps Opus's label through the blend (both scenes draw the same text),
    // then dips and comes back as the other five: no two labels on top of each other.
    plan: prov || (rep && T < 0.8) ? 'plan by: claude-opus-5' : rep ? 'plan by: the other five' : '',
    planOpacity: prov ? e(T, 0.1, 0.4) : rep ? (T < 0.8 ? 1 - e(T, 0.6, 0.2) : e(T, 0.8, 0.25)) : 0,
  };

  // ---- the band under the board: what is measured, in the article's figures ----
  const band: BandLine[] = [];
  if (prov) {
    const ro = e(T, replanned + 0.2, 0.45);
    band.push({ text: 'claude-opus-5 · state error', size: 34, tone: 'muted', opacity: ro });
    band.push({ text: 'course 92% → 20% · release 20% → 0%', size: 44, tone: 'ok', opacity: ro });
  }
  if (rep) {
    band.push({ text: 'the other five: “these are rehearsals”', size: 36, tone: 'muted', opacity: e(T, 0.8, 0.4) });
    band.push({ text: 'said it ≠ used it', size: 60, tone: 'bad', opacity: e(T, mk(m, 1, b0 + 1.6), 0.4) });
  }
  if (at('date')) band.push({ text: 'all p > 0.5', size: 60, tone: 'text', opacity: e(T, mk(m, 1, b1 + 0.6), 0.45) });
  if (at('prohibit')) {
    band.push({ text: 'condition E', size: 36, tone: 'muted', opacity: e(T, 0.6, 0.4) });
    band.push({ text: '96%', size: 110, tone: 'bad', opacity: e(T, mk(m, 1, b0 + 1.8) - 0.1, 0.35) });
  }

  // ---- the fact sheet (setup) ----
  const sheetOn = SHEET_MODES.has(mode);
  const s0 = at('sheet');
  const lineAt = (i: number) => 0.35 + i * 0.42;
  const conditions = at('conditions');
  const release = at('release');
  let tab = -1;
  let tabStart = 0;
  if (conditions) {
    const starts = [0.2, mk(m, 0, b0 + 1.2), mk(m, 1, b0 + 2.2)];
    // D and E follow fast so E (the prohibition, named again in scene 17) is lit before the blend.
    starts.push(starts[2] + 0.55, starts[2] + 1.05);
    for (let i = 0; i < starts.length; i++) {
      if (T >= starts[i]) {
        tab = i;
        tabStart = starts[i];
      }
    }
  } else if (release) {
    tab = 4;
    tabStart = -10;
  }
  const strips = [0, 1, 2].map((k) => {
    if (tab < 0) return 0;
    const on = TAB_STRIPS[tab].includes(k);
    const was = tab > 0 && TAB_STRIPS[tab - 1].includes(k);
    if (on) return was ? 1 : e(T, tabStart, 0.3);
    return was ? 1 - e(T, tabStart, 0.2) : 0;
  });
  // The flip waits for the blend from `conditions` (SCENE_TRANSITION, 0.6 s) to finish, or the
  // outgoing full sheet shows behind the squeezed one.
  const flip = release ? progress(T, 0.65, 0.7) : 0;
  // Release marks: [course, rebuilt, same, release]. The course column is in by "my course", each
  // release counterpart lands from "rebuilt", the tag after "same", the tally on "software release".
  const flipped = release && flip >= 0.5;
  const tally = mk(m, 3, b0 + 4) - 0.2;
  const sheet = {
    opacity: sheetOn ? (s0 ? e(T, 0, 0.45) : 1) : 0,
    slide: s0 ? 1 - e(T, 0, 0.55) : 0,
    flip,
    domain: (flipped ? 'release' : 'course') as 'course' | 'release',
    lines: (flipped ? RELEASE_PAIRS : COURSE_LINES).map((_, i) =>
      s0 ? e(T, lineAt(i), 0.35) : flipped ? e(T, Math.max(1.05, mk(m, 0, b0 + 1.5) - 0.6) + i * 0.2, 0.3) : 1,
    ),
    mapped: flipped ? RELEASE_PAIRS.map((_, i) => e(T, mk(m, 1, b0 + 2.4) + i * 0.3, 0.35)) : [],
    kb: s0 ? e(T, mk(m, 0, b0 + 1.6), 0.35) : sheetOn ? 1 : 0,
    chips: MODELS.map((_, i) => (s0 ? e(T, mk(m, 1, b0 + 2.4) - 0.6 + i * 0.12, 0.3) : sheetOn ? 1 : 0)),
    bubble: at('ask') ? e(T, mk(m, 0, b0 + 0.3), 0.4) : 0,
    tabs: conditions ? e(T, 0, 0.3) : 0,
    tab,
    strips: release ? [0, 0, 0] : strips,
    counter: release ? Math.round(572 * easeOutCubic(progress(T, tally, 1.1))) : 0,
    counterOpacity: release ? e(T, tally - 0.1, 0.3) : 0,
    judge: release ? e(T, tally + 1.1, 0.4) : 0,
    same: release ? e(T, mk(m, 2, b0 + 2.9) + 0.6, 0.4) : 0,
  };

  // ---- the end: the date strip, the prohibition, the verdict, the rewrite ----
  const stickyPop = at('prohibit') ? e(T, mk(m, 0, b0) + 0.05, 0.35) : 0;
  const rw = {
    opacity: rewrite ? e(T, 0, 0.4) : 0,
    strike: rewrite ? e(T, 0.4, 0.5) : 0,
    fresh: rewrite ? e(T, 0.9, 0.5) : 0,
    dagger: rewrite ? e(T, 1.4, 0.4) : 0,
    quote: rewrite ? clamp01(progress(T, mk(m, 1, b1) - 0.05, 1.1)) : 0,
    emphasis: rewrite ? e(T, mk(m, 2, b1 + 0.9), 0.4) : 0,
  };

  return {
    top,
    board: {
      opacity: sheetOn ? 0 : 1,
      dim: clk ? 0.45 * e(T, 0.1, 0.5) : rewrite ? 0.86 * rw.opacity : at('verdict') ? 0.35 * verdictPop : split ? 0 : 0,
      laneLit,
    },
    cards,
    arrow: { draw: arrowDraw, opacity: 1, label: hook ? e(T, 1.6, 0.35) : 1 },
    nothingTag: hook ? e(T, never + 0.15, 0.4) : 0,
    rehearsalStrip: prov ? e(T, mk(m, 0, b0 + 0.8) - 0.2, 0.4) : rep ? 1 : 0,
    band,
    gauges: at('date') ? e(T, mk(m, 1, b1) - 0.2, 0.4) : 0,
    // The strip leaves in scene 19 so the cards' own marks (frozen, †, self-contained) show.
    dateStrip: { opacity: split ? dateIn * (1 - e(T, 0, 0.5)) : rewrite ? 0 : dateIn, fly: tear },
    sticky: { pop: stickyPop },
    verdict: { pop: verdictPop * (at('verdict') ? 1 : 0) },
    sheet,
    rewrite: rw,
  };
}
