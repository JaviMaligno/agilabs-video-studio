// CopyMap: a map of files with copies of the same rule inside them. A search beam lights the
// copies it matches, a rule change is a pulse that must reach every copy (a missed one flickers
// rose), and a refactor request folds the copies into one shared card with threads back to every
// file. Pure state: no Remotion or React, so it is tested with plain `node --test`.
import { beatAt, clamp01, easeOutCubic, fit, progress, sceneTime } from './steps.ts';

export type Mode =
  | 'hook'
  | 'miss'
  | 'quote'
  | 'question'
  | 'lanes'
  | 'levers'
  | 'lanes-rule-lint'
  | 'lint-dodge'
  | 'fold'
  | 'search'
  | 'propagate'
  | 'miss-rate'
  | 'close';

export type CopyMapProps = { mode: Mode; titleLine?: boolean; blend?: boolean };

// ---------------------------------------------------------------- map geometry (map space, 960 x 900)

export const MAP_W = 960;
export const MAP_H = 900;
/** File cards, top to bottom: the shared module first, then the three files with copies. */
export const CARDS = [
  { id: 'shared', y: 0, h: 170 },
  { id: 'forecast', y: 210, h: 170 },
  { id: 'app', y: 420, h: 270 },
  { id: 'template', y: 730, h: 170 },
] as const;
/** The four copy blocks: three alike (A, B, C) and the template's, written differently (D). */
export const BLOCKS = [
  { card: 1, y: 290 },
  { card: 2, y: 500 },
  { card: 2, y: 600 },
  { card: 3, y: 810 },
] as const;
export const CHIP = { x: 40, w: 880, h: 64 } as const;
/** Where the shared function chip sits (inside the shared card). */
export const SHARED_Y = 80;
const centre = (i: number) => BLOCKS[i].y + CHIP.h / 2;

// ---------------------------------------------------------------- state types

export type BlockState = {
  /** Lit by the search beam. */
  lit: number;
  /** Flying into the shared card (0 in place, 1 folded). */
  fold: number;
  /** Carries the new rule (teal). */
  fresh: number;
  /** Stale copy: rose flicker strength. */
  stale: number;
  /** Highlight ring. */
  ring: number;
};

export type LaneState = {
  blocks: BlockState[];
  /** The shared function chip. */
  shared: number;
  sharedFresh: number;
  sharedGlow: number;
  /** Threads from the shared card to each call site. */
  threads: number;
  /** A pulse running down the threads or the map: y in map space, and its strength. */
  pulseY: number;
  pulseOn: number;
  beamY: number;
  beamOn: number;
  beamWide: number;
  /** Copies found so far, shown by the beam head. */
  counter: number;
  counterOn: number;
  /** The template card shut, with a "never opened" lock. */
  closed: number;
  scannerY: number;
  scannerOn: number;
  /** The `// jscpd:ignore-start` tape over the app.ts copies. */
  tape: number;
  /** Rule and lint tags above a lane. */
  tags: number;
};

export type Placement = { x: number; y: number; s: number; opacity: number; lane: LaneState; label: string; labelOn: number };

export type FrameState = {
  mode: Mode;
  maps: Placement[];
  title: { opacity: number };
  hook: { tests: number; stamp: number };
  compare: { opacity: number; second: number; tag: number };
  quote: { words: number[]; emphasis: number; attribution: number; opacity: number };
  question: { pop: number };
  chains: { appear: number; value: number; pips: number };
  levers: { appear: number[]; play: number[] };
  helped: { marks: number; chip: number };
  dodge: { header: number; lintOk: number; tag: number };
  fold: { banner: number; flash: number; gain: number };
  search: { header: number; diff: number; scroll: number; found: number };
  lock: { tag: number; ring: number };
  rate: { appear: number; before: number[]; after: number[]; first: number; second: number; pass: number };
  close: { note: number; strike: number; t0: number; bright: number; keep: number; notch: number };
};

// ---------------------------------------------------------------- helpers

const e = (T: number, start: number, len: number) => easeOutCubic(progress(T, start, len));
const lerp = (a: number, b: number, p: number) => a + (b - a) * clamp01(p);
/** A square-ish flicker in [0.45, 1] for stale copies; finite for any T. */
const flicker = (T: number) => (Math.sin((T % 1000) * 19) > -0.2 ? 1 : 0.45);

const block = (): BlockState => ({ lit: 0, fold: 0, fresh: 0, stale: 0, ring: 0 });
const lane = (): LaneState => ({
  blocks: [block(), block(), block(), block()],
  shared: 0,
  sharedFresh: 0,
  sharedGlow: 0,
  threads: 0,
  pulseY: 0,
  pulseOn: 0,
  beamY: -40,
  beamOn: 0,
  beamWide: 0,
  counter: 0,
  counterOn: 0,
  closed: 0,
  scannerY: -60,
  scannerOn: 0,
  tape: 0,
  tags: 0,
});
/** A lane whose copies A, B and C (and D when `all`) already sit in the shared card. */
const folded = (all = false): LaneState => {
  const l = lane();
  l.blocks.forEach((b, i) => {
    if (i < 3 || all) b.fold = 1;
  });
  l.shared = 1;
  l.threads = 1;
  return l;
};

/** The beam sweeps the map from `start` for `len` seconds and lights the copies in `hits`. */
const sweep = (l: LaneState, T: number, start: number, len: number, hits: number[]) => {
  const from = -40;
  const to = MAP_H + 20;
  l.beamY = lerp(from, to, progress(T, start, len));
  l.beamOn = progress(T, start - 0.15, 0.15) * (1 - progress(T, start + len, 0.3));
  let n = 0;
  for (const i of hits) {
    const at = start + (len * (centre(i) - from)) / (to - from);
    l.blocks[i].lit = progress(T, at, 0.12);
    if (T >= at) n++;
  }
  l.counter = n;
  l.counterOn = n > 0 ? l.beamOn : 0;
};

/** The copies in `which` lift out of their files and fold into the shared card, staggered. */
const foldIn = (l: LaneState, T: number, start: number, len: number, stagger: number, which: number[]) => {
  which.forEach((i, k) => {
    l.blocks[i].fold = e(T, start + k * stagger, len);
  });
  const end = start + (which.length - 1) * stagger + len;
  l.shared = Math.max(l.shared, e(T, end - len * 0.35, len * 0.35));
  l.threads = Math.max(l.threads, e(T, end, 0.4));
  return end;
};

/** A rule-change pulse runs down the map from `start`; copies in `missed` go stale, the rest take it. */
const pulse = (l: LaneState, T: number, start: number, len: number, missed: number[]) => {
  const p = progress(T, start, len);
  l.pulseY = lerp(0, MAP_H, p);
  l.pulseOn = progress(T, start - 0.05, 0.05) * (1 - progress(T, start + len, 0.2));
  if (l.shared > 0) l.sharedFresh = Math.max(l.sharedFresh, progress(T, start, 0.2));
  l.blocks.forEach((b, i) => {
    const at = start + (len * centre(i)) / MAP_H;
    if (missed.includes(i)) b.stale = Math.max(b.stale, progress(T, at, 0.2) * flicker(T));
    else b.fresh = Math.max(b.fresh, progress(T, at, 0.2));
  });
};

const place = (x: number, y: number, s: number, l: LaneState, opacity = 1, label = '', labelOn = 0): Placement => ({ x, y, s, opacity: clamp01(opacity), lane: l, label, labelOn: clamp01(labelOn) });
/** A placement moving from one camera to another. */
const camera = (a: [number, number, number], b: [number, number, number], p: number): [number, number, number] => [
  lerp(a[0], b[0], p),
  lerp(a[1], b[1], p),
  lerp(a[2], b[2], p),
];

/** Cameras (x, y, scale) in stage space (960 wide). */
export const CAM = {
  hook: [77, 232, 0.84] as [number, number, number],
  miss: [182, 0, 0.62] as [number, number, number],
  full: [77, 150, 0.84] as [number, number, number],
  /** The three lanes: Sonnet, Luna, Haiku. */
  lane: (i: number): [number, number, number] => [160 + i * 320 - 149, 230, 0.31],
};
export const LANE_LABELS = ['Sonnet 5.5', 'GPT-6 Luna', 'Haiku 5.5'];

const QUOTE_WORDS = 12;

const empty = (mode: Mode): FrameState => ({
  mode,
  maps: [],
  title: { opacity: 0 },
  hook: { tests: 0, stamp: 0 },
  compare: { opacity: 0, second: 0, tag: 0 },
  quote: { words: Array.from({ length: QUOTE_WORDS }, () => 0), emphasis: 0, attribution: 0, opacity: 0 },
  question: { pop: 0 },
  chains: { appear: 0, value: 0, pips: 0 },
  levers: { appear: [0, 0, 0], play: [0, 0, 0] },
  helped: { marks: 0, chip: 0 },
  dodge: { header: 0, lintOk: 0, tag: 0 },
  fold: { banner: 0, flash: 0, gain: 0 },
  search: { header: 0, diff: 0, scroll: 0, found: 0 },
  lock: { tag: 0, ring: 0 },
  rate: { appear: 0, before: Array.from({ length: 9 }, () => 0), after: Array.from({ length: 8 }, () => 0), first: 0, second: 0, pass: 0 },
  close: { note: 0, strike: 0, t0: 0, bright: 0, keep: 0, notch: 0 },
});

/** Rule-change pulses that leave a stale copy: 3 of 9 before the refactor (33%), 1 of 8 after (12%). */
export const MISSED_BEFORE = [2, 5, 8];
export const MISSED_AFTER = [4];

// ---------------------------------------------------------------- the state

export function frameState(props: CopyMapProps, t: number, beats: number[], dur: number): FrameState {
  const T = sceneTime(t, dur);
  const b0 = beatAt(beats, 0);
  const b1 = beats[1] !== undefined && Number.isFinite(beats[1]) ? beats[1] : b0 + 1.2;
  const b2 = beats[2] !== undefined && Number.isFinite(beats[2]) ? beats[2] : b1 + 1;
  const s = empty(props.mode);
  const F = (start: number, len: number) => fit(start, len, dur);

  switch (props.mode) {
    case 'hook': {
      // Already moving on frame 0: the beam is a third of the way down when the video starts.
      s.title.opacity = 1;
      const l = lane();
      sweep(l, T, -0.35, 1.6, [0, 1, 2]);
      foldIn(l, T, F(1.45, 1.2), 0.55, 0.12, [0, 1, 2]);
      s.hook.tests = e(T, F(Math.max(b1, 1.9), 0.3), 0.3);
      s.hook.stamp = e(T, F(Math.max(b2, 2.4), 0.25), 0.25);
      l.blocks[3].stale = progress(T, F(Math.max(b2, 2.4), 0.3), 0.3) * flicker(T);
      s.maps.push(place(...CAM.hook, l));
      break;
    }
    case 'miss': {
      const l = folded();
      l.blocks[3].stale = flicker(T);
      l.blocks[3].ring = e(T, F(b0, 0.4), 0.4);
      // The search slides over the fourth copy without lighting it.
      const g = F(b1, 0.8);
      l.beamY = lerp(560, MAP_H + 20, progress(T, g, 0.8));
      l.beamOn = progress(T, g - 0.1, 0.1) * (1 - progress(T, g + 0.8, 0.25));
      // The camera moves once the cross-fade from the hook is over (0.6 s), so the two maps never double.
      const cam = camera(CAM.hook, CAM.miss, e(T, 0.6, 0.7));
      s.maps.push(place(...cam, l));
      // The hook's chips stay through the cross-fade, then leave before the camera moves.
      s.hook.tests = 1 - e(T, 0.6, 0.3);
      s.hook.stamp = 1 - e(T, 0.6, 0.3);
      // The two code lines wait until the camera has lifted the map out of their way (it moves
      // 0.6-1.3 s): fading them in earlier printed them over the schedules/app.ts card.
      const c0 = Math.max(b0 + 0.1, 1.05);
      s.compare.opacity = e(T, F(c0, 0.4), 0.4);
      s.compare.second = e(T, F(c0 + 0.4, 0.4), 0.4);
      s.compare.tag = e(T, F(b1, 0.35), 0.35);
      break;
    }
    case 'quote': {
      const l = folded();
      l.blocks[3].stale = flicker(T);
      s.maps.push(place(...CAM.miss, l, 1 - 0.85 * e(T, 0, 0.5)));
      s.compare.opacity = 1 - e(T, 0, 0.35);
      s.compare.second = 1;
      s.compare.tag = 1;
      s.quote.opacity = 1;
      // Starts once the map behind has dimmed.
      const start = F(Math.max(b0, 0.6), 2);
      s.quote.words = s.quote.words.map((_, i) => e(T, start + i * 0.12, 0.3));
      s.quote.emphasis = e(T, F(start + 1.6, 0.4), 0.4);
      s.quote.attribution = e(T, F(start + 0.6, 0.4), 0.4);
      break;
    }
    case 'question': {
      // Back to the repeated code: four copies in four places.
      const l = lane();
      l.blocks.forEach((b, i) => (b.ring = 0.35 + 0.35 * Math.max(0, Math.sin((T % 1000) * 3 - i))));
      l.beamY = -20;
      l.beamOn = e(T, 0, 0.4);
      s.maps.push(place(...CAM.full, l, 0.4));
      s.question.pop = e(T, F(b0 + 0.25, 0.5), 0.5);
      break;
    }
    case 'lanes': {
      const shrink = e(T, 0.6, 0.9);
      for (let i = 0; i < 3; i++) {
        const l = lane();
        const period = 1.7;
        const off = [0.5, 0, 1][i];
        const local = (T + off) % period;
        // Each lane runs its own beam, on a loop, once the lanes are out.
        sweep(l, local, 0.1, 1.3, [0, 1, 2]);
        l.counterOn = 0;
        const on = progress(T, 1.4, 0.4);
        l.beamOn *= on;
        l.blocks.forEach((b) => (b.lit *= on));
        const cam = i === 1 ? camera(CAM.full, CAM.lane(1), shrink) : CAM.lane(i);
        s.maps.push(place(...cam, l, i === 1 ? 1 : e(T, 1.1, 0.5), LANE_LABELS[i], e(T, 1.4, 0.4)));
      }
      s.chains.pips = e(T, F(1.5, 0.4), 0.4);
      const c = F(b1, 1.1);
      s.chains.appear = e(T, c, 0.3);
      s.chains.value = Math.round(384 * e(T, c, 1.1));
      break;
    }
    case 'levers': {
      const at = [b0, b1, b2];
      s.levers.appear = at.map((b) => e(T, F(b, 0.4), 0.4));
      s.levers.play = at.map((b) => progress(T, F(b + 0.15, 1.3), 1.3));
      break;
    }
    case 'lanes-rule-lint': {
      const start = F(b0 + 0.2, 2.9);
      for (let i = 0; i < 3; i++) {
        const l = lane();
        l.tags = e(T, 0, 0.4);
        if (i === 0) {
          // Sonnet: the rule and the lint do move it; two of the copies end up shared.
          foldIn(l, T, start, 0.6, 0.2, [1, 2]);
        }
        for (let k = 0; k < 3; k++) {
          const p0 = start + 0.9 + k * 0.7;
          const missed = i === 0 ? [] : [[3], [0], [3]][k];
          const tmp = lane();
          tmp.shared = l.shared;
          pulse(tmp, T, p0, 0.5, missed);
          if (T >= p0 - 0.05 && T < p0 + 0.7) {
            l.pulseY = tmp.pulseY;
            l.pulseOn = tmp.pulseOn;
          }
          // A stale copy flickers after its pulse and fades to an afterimage.
          l.blocks.forEach((b, j) => {
            b.fresh = Math.max(b.fresh, tmp.blocks[j].fresh);
            const decay = 1 - 0.65 * progress(T, p0 + 0.6, 0.5);
            b.stale = Math.max(b.stale, tmp.blocks[j].stale * decay);
          });
          l.sharedFresh = Math.max(l.sharedFresh, tmp.sharedFresh);
        }
        s.maps.push(place(...CAM.lane(i), l, 1, LANE_LABELS[i], 1));
      }
      s.helped.marks = e(T, F(start + 1.6, 0.4), 0.4);
      s.helped.chip = e(T, F(start + 2.2, 0.4), 0.4);
      break;
    }
    case 'lint-dodge': {
      const l = lane();
      s.dodge.header = e(T, 0, 0.4);
      const tapeAt = F(b0 + 0.35, 0.3);
      l.tape = e(T, tapeAt, 0.3);
      const sc = F(b0 + 0.6, 1.8);
      l.scannerY = lerp(-60, MAP_H + 40, progress(T, sc, 1.8));
      l.scannerOn = progress(T, sc - 0.15, 0.15) * (1 - progress(T, sc + 1.8, 0.25));
      s.dodge.lintOk = e(T, F(sc + 1.8, 0.35), 0.35);
      s.dodge.tag = e(T, F(sc + 2.0, 0.35), 0.35);
      s.maps.push(place(...CAM.full, l));
      break;
    }
    case 'fold': {
      const start = F(b0 + 0.35, 2.6);
      s.fold.banner = e(T, 0, 0.4);
      s.fold.flash = progress(T, start - 0.1, 0.2) * (1 - progress(T, start + 0.4, 0.6));
      const cams: [number, number, number][] = [
        // The fold large in Codex's lane, smaller echoes of it in the other two.
        [20, 805, 0.25],
        [182, 185, 0.62],
        [290, 805, 0.25],
      ];
      let end = 0;
      for (let i = 0; i < 3; i++) {
        const l = lane();
        const off = i === 1 ? 0 : 0.15;
        end = Math.max(end, foldIn(l, T, start + off, 1.1, 0.35, [0, 1, 2]));
        l.sharedGlow = e(T, end - 0.2, 0.5);
        s.maps.push(place(...cams[i], l, 1, LANE_LABELS[i], 1));
      }
      s.fold.gain = e(T, F(end + 0.25, 0.4), 0.4);
      break;
    }
    case 'search': {
      const l = lane();
      s.search.header = e(T, 0, 0.4);
      s.search.diff = e(T, 0, 0.6);
      s.search.scroll = Math.min(T, 60) * 22;
      l.beamWide = e(T, F(b0, 0.4), 0.4);
      const sw = F(b0 + 0.2, 1.7);
      sweep(l, T, sw, 1.7, [0, 1, 2, 3]);
      l.counterOn = l.counter > 0 ? Math.max(l.beamOn, 1 - progress(T, sw + 2.2, 0.3)) : 0;
      l.blocks[3].ring = l.blocks[3].lit;
      s.search.found = l.blocks[3].lit;
      foldIn(l, T, F(Math.max(b1, sw + 1.8), 1.3), 0.7, 0.15, [0, 1, 2, 3]);
      s.maps.push(place(...CAM.full, l));
      break;
    }
    case 'propagate': {
      const l = folded(true);
      s.search.header = 1 - e(T, 0, 0.4);
      l.closed = e(T, 0.1, 0.5);
      s.lock.tag = e(T, 0.4, 0.4);
      const p0 = F(b0 + 0.3, 1.2);
      pulse(l, T, p0, 1.1, []);
      l.sharedGlow = l.sharedFresh;
      s.lock.ring = e(T, F(b1, 0.4), 0.4) * (0.6 + 0.4 * flicker(T * 0.25));
      s.maps.push(place(...CAM.full, l));
      break;
    }
    case 'miss-rate': {
      // Two trains of rule changes through Codex's map: 9 before the refactor, 8 after.
      // Fast enough that the 12% lands with >= 1 s to read before the hand-over to the next scene.
      const k = Math.max(0.35, Math.min(1, (dur - b0 - 1.8) / 3.64));
      const p1 = b0 + 0.1;
      const step = 0.17 * k;
      const pass1End = p1 + 9 * step;
      const foldAt = pass1End + 0.15 * k;
      const p2 = foldAt + 0.6 * k;
      const pass2End = p2 + 8 * step;
      const l = lane();
      foldIn(l, T, foldAt, 0.45 * k, 0.06 * k, [0, 1, 2, 3]);
      const pulseAt = (i: number, base: number) => base + i * step;
      for (let i = 0; i < 9; i++) {
        const at = pulseAt(i, p1);
        s.rate.before[i] = progress(T, at + step * 0.8, step * 0.2);
        if (T >= at && T < at + step) {
          l.pulseY = lerp(0, MAP_H, progress(T, at, step));
          l.pulseOn = 1;
        }
        if (MISSED_BEFORE.includes(i)) l.blocks[3].stale = Math.max(l.blocks[3].stale, progress(T, at + step * 0.6, 0.05) * (1 - progress(T, at + step, step * 1.5)));
      }
      for (let i = 0; i < 8; i++) {
        const at = pulseAt(i, p2);
        s.rate.after[i] = progress(T, at + step * 0.8, step * 0.2);
        if (T >= at && T < at + step) {
          l.pulseY = lerp(0, MAP_H, progress(T, at, step));
          l.pulseOn = 1;
          l.sharedFresh = 1;
        }
        if (MISSED_AFTER.includes(i)) l.blocks[0].stale = Math.max(l.blocks[0].stale, progress(T, at + step * 0.6, 0.05) * (1 - progress(T, at + step, step * 1.5)));
      }
      s.rate.appear = e(T, 0, 0.35);
      s.rate.first = e(T, pass1End, 0.3);
      s.rate.second = e(T, pass2End, 0.3);
      s.rate.pass = T >= foldAt ? 1 : 0;
      s.maps.push(place(211, 30, 0.56, l));
      break;
    }
    case 'close': {
      s.close.note = e(T, 0, 0.35);
      s.close.strike = e(T, F(b0 + 0.45, 0.4), 0.4);
      s.close.t0 = e(T, F(b0 + 0.6, 0.4), 0.4);
      s.close.bright = e(T, F(b1, 0.4), 0.4);
      s.close.keep = e(T, F(b1 + 0.9, 0.4), 0.4);
      s.close.notch = e(T, F(b1 + 1.2, 0.5), 0.5);
      break;
    }
  }
  return s;
}
