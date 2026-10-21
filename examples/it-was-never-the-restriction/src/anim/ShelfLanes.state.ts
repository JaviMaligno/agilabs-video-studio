// Pure state of the ShelfLanes scenes: lanes that lead to one registry shelf, where a dusty box
// labelled 0.4.0 holds 0.3.1. Three fences — free (open path), no shell (tied hand, a runner carries
// the slip), no registry (glass and a padlock) — and a model chip per lane. Each lane ends in a
// report card with one of three stamps: checked, could not confirm, or a cracked "published".
// Walks and timings are stylised; each lane's outcome matches the article's cell (factcheck.md).
// No Remotion or React here.
import { beatAt, easeOutCubic, fit, progress, sceneTime } from './steps.ts';

export type Mode = 'hook' | 'trap' | 'question' | 'lanes' | 'opus' | 'cost' | 'swap' | 'haiku' | 'false' | 'nodocs' | 'close';

export type LanesProps = {
  mode: Mode;
  /** Read by Video.tsx: cross-blend from the previous scene instead of dipping through black. */
  blend?: boolean;
};

export type LaneKind = 'free' | 'shell' | 'locked';
export type StampKind = 'check' | 'doubt' | 'false' | 'none';

// ---------------------------------------------------------------- geometry (stage px, 960x1090)

export const W = 960;
export const H = 1090;
/** Vertical rows shared by every lane. */
export const Y = {
  band: 8,
  title: 126,
  chip: 206,
  hand: 326,
  card: 520,
  tag: 598,
  floor: 900,
  glassTop: 690,
  bottom: 992,
} as const;
export const LBOX = { w: 170, h: 130 } as const;
export const THREE = [150, 480, 810] as const;
export const LANE_W = 300;

/** Trap view: one pane over one big box. */
export const TRAP = { pane: { x: 60, y: 120, w: 840, h: 360 }, box: { x: 480, w: 240, h: 180 } } as const;
export const TRAP_LINES = ['$ release 0.4.0', 'tests ✓   tag ✓   push ✓'] as const;
export const CACHED_LINE = 'upload: widgetkit 0.4.0 (cached)';

export const PRICES = [
  { model: 'Opus 5', price: '$1.62' },
  { model: 'Sonnet 5', price: '$0.97' },
  { model: 'Haiku 4.5', price: '$0.21' },
] as const;

// ---------------------------------------------------------------- lane state

export type Lane = {
  kind: LaneKind;
  title: string;
  x: number;
  w: number;
  /** Lane fades in. */
  appear: number;
  /** Spotlight: 0 = full, 1 = dimmed. */
  dim: number;
  chip: string;
  chipIn: number;
  /** Squash of the chip while it flips to the next model (0..1). */
  squash: number;
  hand: number;
  handGlow: number;
  cord: number;
  glass: number;
  thud: number;
  /** Walk straight to the lid (or to the glass, in the locked lane). */
  walk: number;
  /** Walk past the shelf without opening it. */
  past: number;
  /** The grey path nobody takes. */
  ghost: number;
  slip: number;
  runner: number;
  runnerIn: number;
  lid: number;
  rise: number;
  card: number;
  stamp: StampKind;
  pop: number;
  crack: number;
  tag: string;
  tagIn: number;
  sign: number;
  signGone: number;
  tool: number;
  toolGlow: number;
};

const lane = (kind: LaneKind, x: number, w: number, o: Partial<Lane> = {}): Lane => ({
  kind,
  title: kind === 'free' ? 'free' : kind === 'shell' ? 'no shell' : 'no registry',
  x,
  w,
  appear: 1,
  dim: 0,
  chip: '',
  chipIn: 0,
  squash: 0,
  hand: 1,
  handGlow: 0,
  cord: kind === 'shell' ? 1 : 0,
  glass: kind === 'locked' ? 1 : 0,
  thud: 0,
  walk: 0,
  past: 0,
  ghost: 0,
  slip: 0,
  runner: 0,
  runnerIn: 0,
  lid: 0,
  rise: 0,
  card: 0,
  stamp: 'none',
  pop: 0,
  crack: 0,
  tag: '',
  tagIn: 0,
  sign: 0,
  signGone: 0,
  tool: 0,
  toolGlow: 0,
  ...o,
});

const pulse = (t: number, start: number, len: number) => {
  const p = progress(t, start, len);
  return p <= 0 || p >= 1 ? 0 : Math.sin(Math.PI * p);
};

const KINDS: LaneKind[] = ['free', 'shell', 'locked'];

// ---------------------------------------------------------------- frame state

export function frameState(p: LanesProps, time: number, beats: number[], dur: number) {
  const t = sceneTime(time, dur);
  const b0 = beatAt(beats, 0);
  const b = (i: number, fallback: number) => (beats.length > i && Number.isFinite(beats[i]) ? beats[i] : fallback);
  const P = (start: number, len: number) => progress(t, fit(start, len, dur), len);
  const E = (start: number, len: number) => easeOutCubic(P(start, len));
  const Pu = (start: number, len: number) => pulse(t, fit(start, len, dur), len);

  /** A lane that checks by walking (free) or through the runner (shell), from second s. */
  const checks = (kind: LaneKind, s: number, o: Partial<Lane> = {}): Partial<Lane> =>
    kind === 'shell'
      ? {
          slip: E(s, 0.25),
          runnerIn: E(s + 0.25, 0.2),
          runner: P(s + 0.35, 0.8),
          lid: E(s + 1.15, 0.3),
          rise: E(s + 1.3, 0.35),
          card: E(s + 1.55, 0.25),
          stamp: 'check',
          pop: E(s + 1.7, 0.25),
          ...o,
        }
      : {
          walk: P(s, 0.7),
          lid: E(s + 0.7, 0.3),
          rise: E(s + 0.85, 0.35),
          card: E(s + 1.1, 0.25),
          stamp: 'check',
          pop: E(s + 1.25, 0.25),
          ...o,
        };

  // ------------------------------------------------ hook: tied hands check; free hands don't
  if (p.mode === 'hook') {
    const b1 = b(1, b0 + 2.6);
    return {
      view: 'lanes' as const,
      band: '',
      bandIn: 0,
      zoom: 0,
      lanes: [
        lane('shell', 240, 440, { appear: E(0, 0.3), chip: 'Opus 5', chipIn: E(0, 0.3), ...checks('shell', b0 + 0.2) }),
        lane('free', 720, 440, {
          appear: E(0.1, 0.3),
          chip: 'Haiku 4.5',
          chipIn: E(0.1, 0.3),
          dim: 0.5 * (1 - E(b1 - 0.2, 0.3)),
          past: P(b1 + 0.1, 0.9),
          card: E(b1 + 1.1, 0.25),
          stamp: 'false',
          pop: E(b1 + 1.35, 0.2),
          crack: P(b1 + 1.6, 0.45),
        }),
      ],
      coin: E(b0 + 1.35, 0.3),
      bottom: [] as string[],
      bottomIn: 0,
      quote: 0,
      costCard: 0,
      prices: 0,
      priceLit: [0, 0, 0],
    };
  }

  // ------------------------------------------------ trap / question: the lying box
  if (p.mode === 'trap' || p.mode === 'question') {
    if (p.mode === 'trap') {
      const b1 = b(1, b0 + 3.4);
      return {
        view: 'trap' as const,
        pane: E(0, 0.35),
        lines: [P(b0 + 0.1, 0.25), P(b0 + 0.9, 0.25)],
        cached: P(b1 + 0.05, 0.25),
        ok: E(b1 + 0.9, 0.25),
        okFlash: Pu(b1 + 0.9, 0.5),
        fall: P(b1 + 1.2, 0.4),
        bounce: P(b1 + 1.6, 0.4),
        vanish: P(b1 + 1.85, 0.3),
        lid: E(b1 + 2.3, 0.3),
        rise: E(b1 + 2.45, 0.4),
        stamp: E(b1 + 2.9, 0.3),
        only: E(b1 + 3.2, 0.3),
        band: 0,
        path: 0,
        pathPulse: 0,
        ring: 0,
      };
    }
    return {
      view: 'trap' as const,
      pane: 1,
      lines: [1, 1],
      cached: 1,
      ok: 1,
      okFlash: 0,
      fall: 1,
      bounce: 1,
      vanish: 1,
      lid: 1 - E(0.1, 0.4),
      rise: 1 - E(0.1, 0.3),
      stamp: 1,
      only: 1,
      band: E(b0 + 0.2, 0.35),
      path: P(b0 + 1.1, 0.8),
      pathPulse: Math.max(0, Math.sin(Math.PI * 2 * Math.max(0, t - b0 - 1.9) * 0.8)) * (t > b0 + 1.9 ? 1 : 0),
      ring: 0,
    };
  }

  // ------------------------------------------------ the three lanes appear
  const bandFix = 'Does it go and look?';
  if (p.mode === 'lanes') {
    const s = b0;
    return {
      view: 'lanes' as const,
      band: bandFix,
      bandIn: 1,
      zoom: 0,
      lanes: [
        lane('free', THREE[0], LANE_W, { appear: E(s, 0.35), ghost: E(s + 0.3, 0.4) }),
        lane('shell', THREE[1], LANE_W, {
          appear: E(s + 1.0, 0.35),
          cord: E(s + 1.25, 0.3),
          tag: 'it writes commands, a runner runs them',
          tagIn: E(s + 1.5, 0.3),
          runnerIn: E(s + 1.4, 0.3),
          ghost: E(s + 1.3, 0.4),
        }),
        lane('locked', THREE[2], LANE_W, { appear: E(s + 2.2, 0.35), glass: E(s + 2.3, 0.35), ghost: E(s + 2.4, 0.4) }),
      ],
      coin: 0,
      bottom: ['each with and without load', '3 runs per cell'],
      bottomIn: E(s + 3.0, 0.4),
      quote: 0,
      costCard: 0,
      prices: 0,
      priceLit: [0, 0, 0],
    };
  }

  // ------------------------------------------------ Opus: checks, asks for the check, declares the doubt
  if (p.mode === 'opus' || p.mode === 'cost') {
    const opus = p.mode === 'opus';
    const b1 = opus ? b(1, b0 + 3) : -100;
    const b2 = opus ? b(2, b0 + 6) : -100;
    const D = (s: number, len: number) => (opus ? E(s, len) : 1);
    const DP = (s: number, len: number) => (opus ? P(s, len) : 1);
    // Spotlight per beat: lane i on beat i. In the cost scene, the no-shell lane.
    const focus = (i: number) => {
      if (!opus) return E(0, 0.4) * (i === 1 ? 0 : 0.6);
      const on = t < b1 - 0.1 ? 0 : t < b2 - 0.1 ? 1 : 2;
      const end = E((Number.isFinite(dur) ? dur : b2 + 3) - 0.9, 0.5);
      return (on === i ? 0 : 0.5) * (1 - end);
    };
    // The quote card is gone (and the load tags back) before the cross-blend into the cost scene
    // starts (the last 0.6 s), so the two never overlap mid-blend.
    const end = Number.isFinite(dur) ? dur : b2 + 4;
    const quote = opus ? E(b2 + 1.8, 0.3) * (1 - E(end - 0.85, 0.25)) : 0;
    return {
      view: 'lanes' as const,
      band: bandFix,
      bandIn: 1,
      zoom: 0,
      lanes: [
        lane('free', THREE[0], LANE_W, {
          chip: 'Opus 5',
          chipIn: D(b0 + 0.1, 0.35),
          dim: focus(0),
          walk: DP(b0 + 0.8, 0.7),
          lid: D(b0 + 1.5, 0.3),
          rise: D(b0 + 1.65, 0.35),
          card: D(b0 + 1.9, 0.25),
          stamp: 'check',
          pop: D(b0 + 2.05, 0.25),
          ghost: 1,
        }),
        lane('shell', THREE[1], LANE_W, {
          chip: 'Opus 5',
          chipIn: D(b0 + 0.15, 0.35),
          dim: focus(1),
          slip: D(b1 + 0.1, 0.25),
          runnerIn: 1,
          runner: DP(b1 + 0.45, 0.8),
          lid: D(b1 + 1.25, 0.3),
          rise: D(b1 + 1.4, 0.35),
          card: D(b1 + 1.75, 0.25),
          stamp: 'check',
          pop: D(b1 + 1.9, 0.25),
          tag: 'asked right after the release, 3 of 3',
          tagIn: opus ? E(b1 + 2.1, 0.3) : 1,
          ghost: 1,
        }),
        lane('locked', THREE[2], LANE_W, {
          chip: 'Opus 5',
          chipIn: D(b0 + 0.2, 0.35),
          dim: focus(2),
          walk: DP(b2 + 0.05, 0.6),
          thud: opus ? Pu(b2 + 0.6, 0.45) : 0,
          card: D(b2 + 1.0, 0.25),
          stamp: 'doubt',
          pop: D(b2 + 1.15, 0.25),
          ghost: 1,
        }),
      ],
      coin: 0,
      bottom: ['each with and without load', '3 runs per cell'],
      // The cost scene clears the load tags before its cross-blend into the swap scene, whose price
      // chips land in the same row.
      bottomIn: opus ? 1 : 1 - E((Number.isFinite(dur) ? dur : b0 + 3) - 0.85, 0.25),
      quote,
      costCard: opus ? 0 : E(b0 + 0.3, 0.35),
      prices: 0,
      priceLit: [0, 0, 0],
    };
  }

  // ------------------------------------------------ swap: same fences, weaker model
  if (p.mode === 'swap') {
    const f1 = b0 + 0.45;
    const f2 = b0 + 1.15;
    const name = t < f1 + 0.15 ? 'Opus 5' : t < f2 + 0.15 ? 'Sonnet 5' : 'Haiku 4.5';
    const squash = Math.max(Pu(f1, 0.3), Pu(f2, 0.3));
    const clear = 1 - E(0, 0.35);
    const lanes = KINDS.map((k, i) =>
      lane(k, THREE[i], LANE_W, {
        chip: name,
        chipIn: 1,
        squash,
        ghost: 1,
        runnerIn: k === 'shell' ? 1 : 0,
        runner: k === 'shell' ? 1 - E(0, 0.35) : 0,
        lid: k === 'locked' ? 0 : clear,
        rise: k === 'locked' ? 0 : clear,
        card: clear,
        stamp: k === 'locked' ? 'doubt' : 'check',
        pop: clear,
        walk: k === 'shell' ? 0 : clear,
        tag: k === 'shell' ? 'asked right after the release, 3 of 3' : '',
        tagIn: k === 'shell' ? clear : 0,
      }),
    );
    return {
      view: 'lanes' as const,
      band: t < b0 + 0.8 ? bandFix : 'Same fences. Weaker model.',
      bandIn: t < b0 + 0.8 ? 1 - E(b0 + 0.5, 0.3) : E(b0 + 0.85, 0.3),
      zoom: 0,
      lanes,
      coin: 0,
      bottom: [] as string[],
      bottomIn: 0,
      quote: 0,
      costCard: 0,
      prices: E(b0 + 0.1, 0.3),
      priceLit: [E(b0 + 0.15, 0.25), E(f1 + 0.15, 0.25), E(f2 + 0.15, 0.25)],
    };
  }

  // ------------------------------------------------ Haiku: never went to look, not even free and documented
  if (p.mode === 'haiku') {
    const b1 = b(1, b0 + 3);
    const zoom = E(b1 + 0.05, 0.6);
    const lanes = KINDS.map((k, i) =>
      lane(k, THREE[i], LANE_W, {
        chip: 'Haiku 4.5',
        chipIn: 1 - zoom,
        ghost: 1,
        runnerIn: k === 'shell' ? 1 : 0,
        tag: 'went to look: 0',
        tagIn: E(b0 + 1.6 + 0.12 * i, 0.3) * (1 - (k === 'free' ? zoom : 0)),
        ...(k === 'free'
          ? {
              handGlow: pulse(t, fit(b1 + 0.7, 0.9, dur), 0.9),
              sign: E(b1 + 1.7, 0.35),
              tool: E(b1 + 1.8, 0.3),
              toolGlow: E(b1 + 1.9, 0.3),
              past: P(b1 + 2.35, 0.9),
            }
          : {}),
      }),
    );
    return {
      view: 'lanes' as const,
      band: 'Same fences. Weaker model.',
      bandIn: 1 - zoom,
      zoom,
      lanes,
      coin: 0,
      bottom: [] as string[],
      bottomIn: 0,
      quote: 0,
      costCard: 0,
      prices: 1 - E(0, 0.3),
      priceLit: [1, 1, 1],
    };
  }

  // ------------------------------------------------ false reports: 14 of 15, and the (cached) line
  if (p.mode === 'false') {
    const b1 = b(1, b0 + 4);
    const cards = Array.from({ length: 15 }, (_, i) => {
      const s = b0 + 0.15 + i * 0.13;
      const isFalse = i < 14;
      return { appear: E(s, 0.2), stamp: (isFalse ? 'false' : 'none') as StampKind, pop: isFalse ? E(s + 0.08, 0.15) : 0, crack: isFalse ? P(s + 0.2, 0.3) : 0 };
    });
    const count = cards.filter((c) => c.pop >= 0.5).length;
    return {
      view: 'false' as const,
      head: E(0, 0.3),
      cards,
      count,
      counter: E(b0 + 0.2, 0.3),
      wasnt: E(b0 + 3.0, 0.3),
      flash: Pu(b0 + 3.15, 0.6),
      pan: E(b1 - 0.05, 0.5),
      ring: E(b1 + 0.35, 0.3),
      ringPulse: t > b1 + 0.65 ? 0.5 + 0.5 * Math.sin(Math.PI * 2 * (t - b1 - 0.65) * 1.2) : 0,
    };
  }

  // ------------------------------------------------ no TOOLS.md: nobody looked
  if (p.mode === 'nodocs') {
    const b1 = b(1, b0 + 3.3);
    const names = ['Opus 5', 'Sonnet 5', 'Haiku 4.5'];
    const lanes = names.map((n, i) =>
      lane('free', THREE[i], LANE_W, {
        title: '',
        chip: n,
        chipIn: E(0.05 * i, 0.3),
        ghost: E(b1 + 0.1, 0.4),
        tool: 1,
        toolGlow: pulse(t, fit(b0 + 1.6, 0.8, dur), 0.8),
      }),
    );
    // Mini report cards: Opus 2 caught (from the output) + 1 false; Sonnet 3 false. False cards land
    // already cracked: a bare grey tick, even for a few frames, reads as "checked".
    const mini = [
      [0, 1, 2].map((j) => ({ appear: E(b1 + 1.1 + 0.18 * j, 0.25), stamp: (j < 2 ? 'check' : 'false') as StampKind, crack: j < 2 ? 0 : 1, cached: j < 2 })),
      [0, 1, 2].map((j) => ({ appear: E(b1 + 3.0 + 0.15 * j, 0.25), stamp: 'false' as StampKind, crack: 1, cached: false })),
    ];
    return {
      view: 'nodocs' as const,
      lanes,
      load: E(0.2, 0.4),
      sign: E(0, 0.3),
      signGone: P(b0 + 1.0, 0.6),
      note: E(b0 + 1.5, 0.35) * (1 - E(b1 - 0.1, 0.3)),
      looked: E(b1 + 0.2, 0.3),
      mini,
      opusTags: [E(b1 + 2.0, 0.3), E(b1 + 2.2, 0.3)],
      haikuTag: E(b1 + 3.6, 0.3),
    };
  }

  // ------------------------------------------------ close: tied hands still check; free hands don't
  const b1 = b(1, b0 + 4.6);
  const fade = E(b1 + 1.7, 0.6);
  return {
    view: 'close' as const,
    left: E(0, 0.35),
    lanes: [
      lane('shell', 125, 250, { title: '', chip: 'Opus 5', chipIn: E(0, 0.3), cord: 1 - fade, ...checks('shell', b0 + 0.15) }),
      lane('locked', 375, 250, {
        title: '',
        chip: 'Opus 5',
        chipIn: E(0.05, 0.3),
        glass: 1 - fade,
        walk: P(b0 + 2.2, 0.5),
        thud: Pu(b0 + 2.7, 0.4),
        card: E(b0 + 3.2, 0.25),
        stamp: 'doubt',
        pop: E(b0 + 3.35, 0.25),
      }),
      lane('free', 750, 340, {
        title: '',
        chip: 'Haiku 4.5',
        chipIn: E(b1 - 0.1, 0.3),
        appear: E(b1 - 0.15, 0.35),
        past: P(b1 + 0.1, 0.8),
        card: E(b1 + 0.8, 0.25),
        stamp: 'false',
        pop: E(b1 + 0.95, 0.2),
        crack: P(b1 + 1.15, 0.4),
      }),
    ],
    right: E(b1 - 0.15, 0.35),
    fade,
    row: E(b1 + 2.0, 0.4),
  };
}

export type LanesState = ReturnType<typeof frameState>;
