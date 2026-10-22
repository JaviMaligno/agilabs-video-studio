// Pure state of the spine picture: two ways an agent remembers, over a warehouse rack.
// - The scroll (the transcript): one line per step, never erased; old lines shrink into a stack.
// - The notepad (explicit state, SKILL.state): a few key/value lines; a pen strikes one value and
//   writes the new one; its size never changes.
// - The rack: numbered shelf slots with pallets, i.e. what is really there.
// Modes: hook, scroll, notepad, promises, warehouse (the story); correction (lines 10-11);
// insurance (17); verdict (18); advice (19). Each mode starts where the previous one in the video
// ends, so consecutive scenes blend without a jump. Marks are scene seconds of spoken words.
// No Remotion or React here.
import { clamp01, easeOutCubic, progress, sceneTime } from './steps.ts';

export type SvnMode = 'hook' | 'scroll' | 'notepad' | 'promises' | 'warehouse' | 'correction' | 'insurance' | 'verdict' | 'advice';
export const MODES: SvnMode[] = ['hook', 'scroll', 'notepad', 'promises', 'warehouse', 'correction', 'insurance', 'verdict', 'advice'];
export type ScrollVsNotepadProps = { mode: SvnMode; marks?: number[] };

export type Tone = 'plain' | 'warm' | 'bad' | 'ok';

/** Rack slots: shelf number and default contents ('' = empty). */
export const SHELVES = [3, 6, 7, 9, 12, 15] as const;
export const RACK = { x0: 75, w: 140, gap: 16, h: 150, yLow: 1110, yHigh: 470 } as const;
export const slotX = (i: number): number => RACK.x0 + i * (RACK.w + RACK.gap);

/** A generic transcript line for step n (the scroll in the story). */
const VERBS = ['filed A7 → shelf 3', 'shipped C4 from 6', 'moved D1 7 → 9', 'read the order list', 'filed F2 → shelf 15', 'checked shelf 12'];
export const transcriptLine = (n: number): string => `step ${n} · ${VERBS[(Math.max(1, Math.floor(n)) - 1) % VERBS.length]}`;

/** The correction (lines 10-11): the record at step 3, ten steps later its retraction. */
export const CORRECTION_LINES = [
  'step 3 · filed pallet → shelf 12',
  'step 4 · shipped C4 from 6',
  'step 5 · moved D1 7 → 9',
  'step 6 · read the order list',
  'step 7 · filed F2 → shelf 15',
  'step 8 · shipped F2 from 15',
  'step 9 · checked shelf 3',
  'step 10 · filed G3 → shelf 9',
  'step 11 · read the order list',
  'step 12 · checked shelf 7',
  'step 13 · never put away · shelf 12 empty',
];
export const INSURANCE_LINES = ['step 130 · read the order list', 'step 131 · checked shelf 7', 'step 132 · moved SKU-K 7 → 3'];
export const WAYS = ['full transcript', 'summary', 'notepad + transcript', 'notepad only'];

export type NoteLine = { text: string; next: string; strike: number; write: number; tone: Tone; flash: number };
export type Slot = { shelf: number; lot: string; pallet: number; flash: number; tone: Tone; check: number };

export type SvnState = {
  rack: { opacity: number; y: number; slots: Slot[]; shipY: number };
  scroll: {
    opacity: number;
    x: number;
    y: number;
    w: number;
    /** Lines shown: generated lines up to `steps`, or the explicit `list`. */
    steps: number;
    list: string[] | null;
    /** How far the newest line is in (0..1). */
    newest: number;
    dim: number;
    font: number;
    counter: { opacity: number; value: number };
    title: { opacity: number; text: string };
    /** Per-line highlights in the explicit list. */
    hl: { index: number; tone: Tone; amount: number }[];
    connector: { opacity: number; pulse: number };
  };
  notepad: {
    opacity: number;
    x: number;
    y: number;
    w: number;
    lines: NoteLine[];
    sub: number;
    tag: number;
    scratch: { opacity: number; discarded: number };
    pen: { opacity: number; line: number; prog: number };
    badge: { opacity: number; text: string };
  };
  hook: { neq: number };
  promises: { cards: number[]; stamp: number; fade: number };
  warehouse: { chips: number[]; agent: number; ship: number; head: number; ways: number[] };
  correction: { notes: number[] };
  insurance: { thread: number; tag: number; check: number };
  verdict: { works: number; forget: number; mis: number; some: number; fade: number };
  advice: { items: number[]; arrow: number; stack: number; glow: number };
};

const e = (t: number, s: number, l: number) => easeOutCubic(progress(t, s, l));
const lerp = (a: number, b: number, p: number) => a + (b - a) * clamp01(p);
const mk = (marks: number[] | undefined, i: number, fallback: number) => {
  const m = marks?.[i];
  return m !== undefined && Number.isFinite(m) ? m : fallback;
};

/** Story contents of the rack (the hook and the story). */
const STORY_LOTS: Record<number, string> = { 3: 'A7', 6: 'C4', 7: 'D1', 9: '', 12: 'E5', 15: 'F2' };

const slots = (lots: Record<number, string>, over: (shelf: number) => Partial<Slot> = () => ({})): Slot[] =>
  SHELVES.map((shelf) => ({ shelf, lot: lots[shelf] ?? '', pallet: lots[shelf] ? 1 : 0, flash: 0, tone: 'plain' as Tone, check: 0, ...over(shelf) }));

const line = (text: string, o: Partial<NoteLine> = {}): NoteLine => ({ text, next: '', strike: 0, write: 1, tone: 'plain', flash: 0, ...o });

const STORY_NOTES = (o: { six?: Partial<NoteLine>; twelve?: Partial<NoteLine> } = {}): NoteLine[] => [
  line('shelf 3: lot A7'),
  line('shelf 6: lot C4', { next: 'shelf 6: empty', ...o.six }),
  line('shelf 7: lot D1'),
  line('shelf 12: lot E5', { next: 'shelf 12: empty', ...o.twelve }),
];

/** Geometry of the scroll and the notepad. */
export const POS = {
  scrollWide: { x: 140, y: 300, w: 800 },
  scrollLeft: { x: 70, y: 300, w: 450 },
  noteCenter: { x: 300, y: 470, w: 480 },
  noteRight: { x: 560, y: 560, w: 450 },
} as const;

const base = (): SvnState => ({
  rack: { opacity: 1, y: RACK.yLow, slots: slots(STORY_LOTS), shipY: 0 },
  scroll: {
    opacity: 0,
    ...POS.scrollWide,
    steps: 0,
    list: null,
    newest: 1,
    dim: 0,
    font: 30,
    counter: { opacity: 0, value: 0 },
    title: { opacity: 0, text: 'the transcript · reread every step' },
    hl: [],
    connector: { opacity: 0, pulse: 0 },
  },
  notepad: {
    opacity: 0,
    ...POS.noteRight,
    lines: STORY_NOTES(),
    sub: 0,
    tag: 0,
    scratch: { opacity: 0, discarded: 0 },
    pen: { opacity: 0, line: 0, prog: 0 },
    badge: { opacity: 0, text: '' },
  },
  hook: { neq: 0 },
  promises: { cards: [0, 0], stamp: 0, fade: 1 },
  warehouse: { chips: [0, 0], agent: 0, ship: 0, head: 0, ways: [0, 0, 0, 0] },
  correction: { notes: [0, 0] },
  insurance: { thread: 0, tag: 0, check: 0 },
  verdict: { works: 0, forget: 0, mis: 0, some: 0, fade: 1 },
  advice: { items: [0, 0], arrow: 0, stack: 0, glow: 0 },
});

/** The scroll's step count while it unrolls (scroll mode): 1 → 50 between two marks. */
export const STEPS_MAX = 50;

export function frameState(props: ScrollVsNotepadProps, t: number, beats: number[], dur: number): SvnState {
  const mode: SvnMode = MODES.includes(props.mode) ? props.mode : 'hook';
  const T = sceneTime(Number.isFinite(t) ? t : 0, dur);
  const m = props.marks;
  const b0 = beats[0] !== undefined && Number.isFinite(beats[0]) ? beats[0] : 0;
  const b1 = beats[1] !== undefined && Number.isFinite(beats[1]) ? beats[1] : b0 + 3;
  const s = base();

  if (mode === 'hook') {
    // The notepad writes "shelf 3: lot B2"; the shelf holds A7. On "misremembering": ≠.
    const write = mk(m, 0, b0 + 0.6);
    const neq = mk(m, 2, b0 + 3.5);
    s.notepad = { ...s.notepad, ...POS.noteCenter, opacity: e(T, 0, 0.45) };
    const n = e(T, neq, 0.4);
    s.notepad.lines = [
      line('shelf 3: lot B2', { write: progress(T, write - 0.1, 1.0), tone: n > 0.01 ? 'warm' : 'plain', flash: n }),
      line('shelf 6: lot C4'),
      line('shelf 7: lot D1'),
      line('shelf 12: lot E5'),
    ];
    s.notepad.pen = { opacity: T < write + 1.3 ? e(T, write - 0.4, 0.3) : 1 - e(T, write + 1.3, 0.3), line: 0, prog: progress(T, write - 0.1, 1.0) };
    s.rack.opacity = e(T, 0.2, 0.5);
    s.rack.slots = slots(STORY_LOTS, (sh) => (sh === 3 ? { flash: n, tone: n > 0.01 ? 'warm' : 'plain' } : {}));
    s.hook.neq = n;
    return s;
  }

  if (mode === 'scroll') {
    // The hook's picture leaves; the scroll unrolls one line per step, 1 → 50.
    const go = mk(m, 0, b0 + 0.5);
    const grow = mk(m, 1, b0 + 3.2);
    const leave = e(T, 0, 0.5);
    s.notepad = { ...s.notepad, ...POS.noteCenter, opacity: 1 - leave };
    s.notepad.lines[0] = line('shelf 3: lot B2', { tone: 'warm', flash: 1 - leave });
    s.hook.neq = 1 - leave;
    s.rack.opacity = lerp(1, 0.35, leave);
    s.rack.slots = slots(STORY_LOTS, (sh) => (sh === 3 ? { flash: 1 - leave, tone: 'warm' } : {}));
    // Reaches step 50 well before the hand-over, so the blend into the next scene shows one roll.
    const done = Math.max(go, Math.min(grow + 0.6, dur - 1.0));
    const p = progress(T, go - 0.6, done - (go - 0.6));
    // Accelerating: a few readable steps first, then the roll runs.
    const steps = 1 + (STEPS_MAX - 1) * p ** 1.7;
    s.scroll = {
      ...s.scroll,
      opacity: e(T, 0.25, 0.45),
      steps,
      newest: steps - Math.floor(steps),
      counter: { opacity: e(T, go - 0.6, 0.3), value: Math.floor(steps) },
      title: { ...s.scroll.title, opacity: e(T, 0.3, 0.45) },
    };
    return s;
  }

  // From here on the scroll has 50 steps unless a mode sets otherwise.
  const parked = (move: number) => ({
    ...s.scroll,
    opacity: 1,
    x: lerp(POS.scrollWide.x, POS.scrollLeft.x, move),
    y: POS.scrollWide.y,
    w: lerp(POS.scrollWide.w, POS.scrollLeft.w, move),
    steps: STEPS_MAX,
    newest: 1,
    dim: 0.55 * move,
    font: lerp(30, 24, move),
    counter: { opacity: 1 - move, value: STEPS_MAX },
    title: { text: 'the transcript', opacity: 1 },
  });

  if (mode === 'notepad' || mode === 'promises') {
    const notepad = mode === 'notepad';
    const skill = mk(m, 0, b0 + 1);
    const pad = mk(m, 1, b0 + 2.4);
    const rewritten = mk(m, 2, b0 + 4.5);
    const move = notepad ? e(T, skill - 0.5, 0.7) : 1;
    s.scroll = parked(move);
    s.rack.opacity = 0.35;
    const drop = notepad ? e(T, pad - 0.5, 0.5) : 1;
    s.notepad = { ...s.notepad, opacity: drop, y: POS.noteRight.y - 60 * (1 - drop) };
    s.notepad.sub = notepad ? e(T, skill, 0.4) : 1;
    s.notepad.tag = notepad ? e(T, skill + 0.5, 0.4) : 1;
    const strike = notepad ? progress(T, rewritten - 0.15, 0.35) : 1;
    const write = notepad ? progress(T, rewritten + 0.25, 0.7) : 1;
    s.notepad.lines = STORY_NOTES({ six: { strike, write: 1, next: 'shelf 6: empty' } });
    // The new value is written over the struck one.
    s.notepad.lines[1].flash = notepad ? Math.sin(Math.PI * write) : 0;
    s.notepad.pen = { opacity: notepad ? (T < rewritten + 1 ? e(T, rewritten - 0.5, 0.3) : 1 - e(T, rewritten + 1, 0.3)) : 0, line: 1, prog: write };
    // Scratch reasoning above the notepad, discarded once the patch lands.
    s.notepad.scratch = notepad
      ? { opacity: e(T, pad + 0.2, 0.35) * (1 - e(T, rewritten + 1.0, 0.6)), discarded: e(T, rewritten + 0.5, 0.3) }
      : { opacity: 0, discarded: 1 };
    // The rack follows the patch: shelf 6 ships out.
    s.rack.slots = slots(STORY_LOTS, (sh) => (sh === 6 ? { pallet: 1 - (notepad ? e(T, rewritten, 0.5) : 1) } : {}));
    s.rack.shipY = notepad ? e(T, rewritten, 0.5) : 1;
    if (!notepad) {
      const st = mk(m, 0, b0 + 1);
      const sm = mk(m, 1, b0 + 2.2);
      const reb = mk(m, 2, b1 + 0.3);
      s.promises = { cards: [e(T, st - 0.2, 0.4), e(T, sm - 0.2, 0.4)], stamp: e(T, reb, 0.35), fade: 1 };
    }
    return s;
  }

  if (mode === 'warehouse') {
    // Everything else leaves; the rack rises; pallets are filed and shipped; the four arms.
    const wh = mk(m, 0, b0 + 0.6);
    const filing = mk(m, 1, b0 + 1.6);
    const two = mk(m, 2, b0 + 3.4);
    // Changes start once the blend from the promises is over (0.6 s), so it never shows two racks.
    const leave = e(T, 0.6, 0.45);
    s.scroll = { ...parked(1), opacity: 1 - leave };
    s.notepad = { ...s.notepad, opacity: 1 - leave, sub: 1, tag: 1 };
    s.notepad.lines = STORY_NOTES({ six: { strike: 1, write: 1 } });
    s.promises = { cards: [1 - leave, 1 - leave], stamp: 1, fade: 1 - leave };
    const rise = e(T, 0.7, 0.7);
    s.rack.y = lerp(RACK.yLow, RACK.yHigh, rise);
    s.rack.opacity = lerp(0.35, 1, rise);
    const file = e(T, filing - 0.1, 0.8);
    const ship = e(T, filing + 0.8, 0.6);
    s.rack.slots = slots({ ...STORY_LOTS, 6: '', 9: 'G3' }, (sh) => (sh === 9 ? { pallet: file } : sh === 15 ? { pallet: 1 - ship } : {}));
    s.rack.shipY = ship;
    s.warehouse = {
      chips: [e(T, wh, 0.4), e(T, two, 0.4)],
      agent: progress(T, filing - 0.3, 1.0),
      ship,
      head: e(T, Math.min(two + 0.1, filing + 1.1), 0.4),
      ways: [0, 1, 2, 3].map((i) => e(T, Math.min(two + 0.3, filing + 1.3) + 0.3 * i, 0.35)),
    };
    return s;
  }

  if (mode === 'correction') {
    // The pallet filed at shelf 12 was never put away: the retraction arrives; the notepad rewrites
    // one value; the transcript keeps both lines and links them again every step.
    const fact = mk(m, 0, b0 + 1);
    const away = mk(m, 2, b0 + 4);
    const record = mk(m, 3, b1 + 1);
    const reconcile = mk(m, 5, b1 + 3.5);
    const lots = { 3: 'A7', 6: '', 7: 'D1', 9: 'G3', 12: 'E5', 15: '' };
    const gone = e(T, away, 0.5);
    s.rack.slots = slots(lots, (sh) => (sh === 12 ? { pallet: 1 - gone, flash: Math.sin(Math.PI * progress(T, away - 0.2, 1.2)), tone: 'bad' } : {}));
    s.rack.opacity = e(T, 0, 0.4);
    const red = e(T, away - 0.2, 0.5);
    const listed = CORRECTION_LINES.slice(0, red > 0.001 ? CORRECTION_LINES.length : CORRECTION_LINES.length - 1);
    s.scroll = {
      ...s.scroll,
      opacity: e(T, 0, 0.4),
      x: 70,
      y: 440,
      w: 530,
      steps: listed.length,
      list: listed,
      newest: red > 0.001 ? red : 1,
      font: 23,
      title: { text: 'the transcript', opacity: 1 },
      counter: { opacity: 0, value: 0 },
      hl: [
        { index: 0, tone: 'ok', amount: Math.max(e(T, fact, 0.4) * (1 - e(T, away, 0.4)), e(T, record, 0.4)) },
        { index: CORRECTION_LINES.length - 1, tone: 'bad', amount: red },
      ],
      connector: { opacity: e(T, reconcile - 0.1, 0.4), pulse: T > reconcile ? 0.5 + 0.5 * Math.cos(2 * Math.PI * (T - reconcile) * 1.6) : 0 },
    };
    const strike = progress(T, away + 0.5, 0.35);
    const write = progress(T, away + 0.9, 0.7);
    s.notepad = { ...s.notepad, opacity: e(T, 0.1, 0.4), x: 630, y: 560, w: 390, sub: 0, tag: 0 };
    s.notepad.lines = STORY_NOTES({ six: { text: 'shelf 6: empty', strike: 0, next: '' }, twelve: { strike, write: 1, flash: Math.sin(Math.PI * write) } });
    s.notepad.pen = { opacity: T < away + 1.8 ? e(T, away + 0.3, 0.3) : 1 - e(T, away + 1.8, 0.3), line: 3, prog: write };
    s.notepad.badge = { opacity: e(T, away + 1.7, 0.4), text: 'done' };
    s.correction = { notes: [e(T, reconcile + 0.3, 0.4), e(T, away + 1.8, 0.4)] };
    return s;
  }

  if (mode === 'insurance') {
    // Notepad + transcript on Haiku: the same wrong line on the notepad, but the transcript's own
    // record of the move leads the hand to the right shelf.
    const hk = mk(m, 0, b0 + 0.3);
    const tr = mk(m, 1, b0 + 1.4);
    const abs = mk(m, 2, b0 + 3);
    const mat = mk(m, 3, b0 + 4);
    s.rack.slots = slots({ 3: 'SKU-K', 6: 'SKU-J', 7: '', 9: 'SKU-B', 12: 'SKU-E', 15: '' }, (sh) =>
      sh === 6 ? { check: e(T, abs + 0.4, 0.4), tone: 'ok', flash: e(T, abs + 0.4, 0.4) } : {},
    );
    s.rack.opacity = e(T, 0, 0.4);
    s.notepad = { ...s.notepad, opacity: e(T, hk - 0.3, 0.4), x: 70, y: 450, w: 470, sub: 0, tag: 0 };
    s.notepad.lines = [
      line('shelf 3: SKU-J', { tone: 'warm', flash: e(T, hk + 0.4, 0.4) }),
      line('shelf 6: SKU-J'),
      line('shelf 7: empty'),
    ];
    s.notepad.badge = { opacity: e(T, hk + 0.4, 0.4), text: 'wrong write' };
    s.scroll = {
      ...s.scroll,
      opacity: e(T, tr - 0.3, 0.4),
      x: 70,
      y: 790,
      w: 470,
      steps: INSURANCE_LINES.length,
      list: INSURANCE_LINES,
      newest: 1,
      font: 25,
      title: { text: 'the transcript beside it', opacity: 1 },
      hl: [{ index: 2, tone: 'ok', amount: e(T, tr + 0.3, 0.4) }],
    };
    s.insurance = { thread: progress(T, abs - 0.4, 0.9), check: e(T, abs + 0.4, 0.4), tag: e(T, Math.min(abs, mat - 0.6), 0.45) };
    return s;
  }

  if (mode === 'verdict') {
    // The picture clears to the notepad and two stamps.
    const works = mk(m, 0, b0 + 0.4);
    const forget = mk(m, 2, b0 + 3.3);
    const some = mk(m, 3, b0 + 4.3);
    const mis = mk(m, 4, b0 + 5.4);
    // The insurance picture leaves after the blend (0.6 s); then the notepad moves to the centre.
    const leave = e(T, 0.6, 0.45);
    s.rack.opacity = 1 - leave;
    s.rack.slots = slots({ 3: 'SKU-K', 6: 'SKU-J', 7: '', 9: 'SKU-B', 12: 'SKU-E', 15: '' }, (sh) => (sh === 6 ? { check: 1 - leave, tone: 'ok', flash: 1 - leave } : {}));
    s.scroll = { ...s.scroll, opacity: 1 - leave, x: 70, y: 790, w: 470, steps: 3, list: INSURANCE_LINES, font: 25, title: { text: 'the transcript beside it', opacity: 1 } };
    s.scroll.hl = [{ index: 2, tone: 'ok', amount: 1 - leave }];
    s.insurance = { thread: 1 - leave, check: 1 - leave, tag: 1 - leave };
    const arrive = e(T, 0.7, 0.6);
    s.notepad = { ...s.notepad, opacity: 1, x: lerp(70, 300, arrive), y: lerp(450, 330, arrive), w: lerp(470, 480, arrive), sub: 0, tag: 0 };
    s.notepad.lines = [
      line('shelf 3: SKU-J', { tone: 'warm', flash: 1 - arrive }),
      line('shelf 6: SKU-J'),
      line('shelf 7: empty'),
      line('shelf 12: SKU-E', { write: arrive }),
    ];
    s.notepad.badge = { opacity: 1 - leave, text: 'wrong write' };
    s.verdict = { works: e(T, works, 0.4), forget: e(T, forget - 0.05, 0.35), some: e(T, some, 0.35), mis: e(T, mis - 0.05, 0.35), fade: 1 };
    return s;
  }

  // advice: two checklist items tick in.
  const chk = mk(m, 0, b0 + 0.2);
  const act = mk(m, 1, b0 + 1.8);
  const last = mk(m, 2, b0 + 3.4);
  const leave = e(T, 0.6, 0.45);
  s.rack.opacity = 0;
  s.notepad = { ...s.notepad, opacity: 1 - leave, x: 300, y: 330, w: 480 };
  s.notepad.lines = [line('shelf 3: SKU-J', { tone: 'warm' }), line('shelf 6: SKU-J'), line('shelf 7: empty'), line('shelf 12: SKU-E')];
  s.verdict = { works: 1, forget: 1, some: 1, mis: 1, fade: 1 - leave };
  s.advice = {
    items: [e(T, Math.max(chk - 0.1, 0.9), 0.4), e(T, last - 0.6, 0.4)],
    arrow: progress(T, act - 0.3, 0.7),
    stack: e(T, last - 0.4, 0.5),
    glow: e(T, last + 0.3, 0.6),
  };
  return s;
}
