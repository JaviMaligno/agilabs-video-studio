// Pure state of the RegistryShelf scenes (Act II and the close): package boxes on a registry
// shelf, a version on the label and something inside. The trap is a box labelled 0.4.0 holding
// 0.3.1: does the session walk to the shelf and open it, or trust the label? Stylised, chosen for
// impact; versions and counts come from the article. No Remotion or React here.
import { beatAt, clamp01, easeOutCubic, fit, progress, sceneTime } from './steps.ts';

export type Mode = 'trap' | 'inspect' | 'loaded' | 'crack' | 'live' | 'fix' | 'close';

export type ShelfProps = {
  mode: Mode;
  /** Read by Video.tsx: cross-blend from the previous scene instead of dipping through black. */
  blend?: boolean;
};

// ---------------------------------------------------------------- geometry (stage px, 960x1090)

export const W = 960;
export const SHELF_Y = 968;
export const BOX = { w: 200, h: 160 } as const;
export const PIPE_X = 34;
/** Trap: the one pane. */
export const TRAP_PANE = { x0: 74, x1: 960, top: 30, h: 380 } as const;
/** Inspect: seven mini panes in a row. */
export const MINI = { top: 40, h: 300, w: 118, gap: 11 } as const;
export const miniX = (i: number): number => (W - (7 * MINI.w + 6 * MINI.gap)) / 2 + i * (MINI.w + MINI.gap);
/** Loaded: three panes. */
export const LOAD = { top: 20, h: 470, w: 292, gap: 42 } as const;
export const loadX = (i: number): number => (W - (3 * LOAD.w + 2 * LOAD.gap)) / 2 + i * (LOAD.w + LOAD.gap);
/** Live / fix: publisher on top, consumer below. */
export const LIVE = { x0: 74, x1: 960, pubTop: 0, conTop: 290, h: 240 } as const;

export const TRAP_LINES = ['$ release 0.4.0', 'build widgetkit … ok', 'upload: widgetkit 0.4.0 (cached)'] as const;

// ---------------------------------------------------------------- helpers

const pulse = (t: number, start: number, len: number) => {
  const p = progress(t, start, len);
  return p <= 0 || p >= 1 ? 0 : Math.sin(Math.PI * p);
};
const lineEnd = (beats: number[], dur: number) => {
  const last = beats.length ? beatAt(beats, beats.length - 1) : 0;
  return Number.isFinite(dur) ? Math.max(last + 0.5, Math.min(dur - 0.8, last + 4)) : last + 2;
};

/** A box: where it sits, how open its lid is, and how far its contents have risen. */
export type BoxState = { x: number; label: string; inside: string; appear: number; lid: number; rise: number; drop: number; dusty: boolean; glow: number };
const box = (x: number, label: string, inside: string, o: Partial<BoxState> = {}): BoxState => ({
  x,
  label,
  inside,
  appear: 1,
  lid: 0,
  rise: 0,
  drop: 1,
  dusty: false,
  glow: 0,
  ...o,
});

export function frameState(p: ShelfProps, time: number, beats: number[], dur: number) {
  const t = sceneTime(time, dur);
  const b0 = beatAt(beats, 0);
  const b1 = beats.length > 1 ? beatAt(beats, 1) : NaN;
  const end = lineEnd(beats, dur);
  const span = Math.max(0.6, end - b0);
  const P = (start: number, len: number) => progress(t, fit(start, len, dur), len);
  const E = (start: number, len: number) => easeOutCubic(P(start, len));

  // ------------------------------------------------ trap: success on screen, old build on the shelf
  if (p.mode === 'trap') {
    const L = span;
    const lines = TRAP_LINES.map((_, i) => P(b0 + 0.02 + i * 0.12 * L, 0.18));
    const okAt = b0 + 0.38 * L;
    const dropAt = b0 + 0.45 * L;
    return {
      view: 'trap' as const,
      pane: E(0, 0.35),
      lines,
      ok: E(okAt, 0.25),
      okFlash: pulse(t, fit(okAt, 0.5, dur), 0.5),
      /** The new box: falls from the pane, bounces off the old one, vanishes. 0..1 each. */
      fall: P(dropAt, 0.38),
      bounce: P(dropAt + 0.38, 0.4),
      vanish: P(dropAt + 0.62, 0.3),
      boxes: [box(480, '0.4.0', '0.3.1', { dusty: true, lid: E(b0 + 0.68 * L, 0.35), rise: E(b0 + 0.74 * L, 0.45) })],
      stamp: E(b0 + 0.86 * L, 0.3),
      cap: 1,
    };
  }

  // ------------------------------------------------ inspect: alone, 7 / 7
  if (p.mode === 'inspect') {
    const L = span;
    const panes = Array.from({ length: 7 }, (_, i) => E(i * 0.06, 0.3));
    // The tally must reach 7 / 7 by "seven" and hold ~1 s before the hand-over fade: the last
    // tick lands at ~0.75 of the line span (it used to land in the fade, so 7 / 7 only flashed).
    const inPane = [0, 1, 2, 3].map((i) => b0 + (0.04 + i * 0.07) * L);
    const walks = [0, 1, 2].map((j) => b0 + (0.34 + j * 0.1) * L);
    const catches = [
      ...inPane.map((s) => ({ labels: E(s - 0.25, 0.25), walk: 0, tick: E(s + 0.15, 0.25) })),
      ...walks.map((s) => ({ labels: 0, walk: E(s, 0.35), tick: E(s + 0.4, 0.25) })),
    ];
    const lid = Math.max(...walks.map((s) => pulse(t, fit(s + 0.3, 0.5, dur), 0.5)), walks.some((s) => t >= s + 0.3) ? 0.35 : 0);
    const count = catches.filter((c) => c.tick >= 0.5).length;
    return {
      view: 'inspect' as const,
      panes,
      catches,
      boxes: [box(700, '0.4.0', '0.3.1', { lid: clamp01(lid), rise: 0 })],
      count,
      tally: E(b0, 0.3),
      tallyFlash: pulse(t, fit(walks[2] + 0.4, 0.5, dur), 0.5),
      cap: 1,
    };
  }

  // ------------------------------------------------ loaded / crack: one of three says published without looking
  if (p.mode === 'loaded' || p.mode === 'crack') {
    const loaded = p.mode === 'loaded';
    const k = Number.isFinite(b1) ? b1 : b0 + 1.2;
    const span1 = Math.max(0.8, end - k);
    const W1 = (s: number, len: number) => (loaded ? E(s, len) : 1);
    const panes = [0, 1, 2].map((i) => W1(i * 0.08, 0.3));
    const features = [0, 1, 2].map((i) => W1(b0 + 0.1 + i * 0.16, 0.3));
    const inbox = W1(b0 + 0.6, 0.3);
    const walks = [W1(k + 0.15, 0.4), W1(k + 0.35, 0.4)];
    const ticks = [W1(k + 0.55, 0.25), W1(k + 0.75, 0.25)];
    // Chip on "called it", stamp on "published": fixed offsets into the line, not fractions of
    // the scene, so a longer hold (needed for the caption's reading speed) cannot push the stamp
    // past its word. Capped by the span for very short scenes.
    const chip = W1(k + Math.min(0.85, 0.35 * span1), 0.3);
    const stampAt = k + Math.min(1.45, 0.62 * span1);
    const stamp = W1(stampAt, 0.25);
    return {
      view: 'loaded' as const,
      panes,
      features,
      inbox,
      walks,
      ticks,
      chip,
      stamp,
      stampFlash: loaded ? pulse(t, fit(stampAt, 0.4, dur), 0.4) : 0,
      boxes: [box(480, '0.4.0', '0.3.1', { lid: Math.max(walks[0], walks[1]) > 0.9 ? 0.3 : 0 })],
      zoom: loaded ? 0 : E(0, 0.55),
      crack: loaded ? 0 : P(b0 + 0.25, 0.55),
      runs: loaded ? 0 : E(b0 + 0.45, 0.3),
      cap: 1,
    };
  }

  // ------------------------------------------------ live / fix: channel open, the consumer opens the box
  if (p.mode === 'live' || p.mode === 'fix') {
    const live = p.mode === 'live';
    const L = span;
    if (live) {
      const walk = E(b0 + 0.12 * L, 0.4);
      const lidAt = b0 + 0.3 * L;
      const sendAt = b0 + 0.6 * L;
      return {
        view: 'live' as const,
        panes: E(0, 0.35),
        uncap: E(0.15, 0.4),
        glow: E(0.3, 0.5),
        walk,
        boxes: [box(480, '0.4.0', '0.3.1', { lid: E(lidAt, 0.3), rise: E(lidAt + 0.15, 0.45) })],
        flagTravel: P(sendAt, 0.4),
        flagCard: E(sendAt + 0.4, 0.25),
        replyTravel: 0,
        replyCard: 0,
        slide: 0,
        newBox: 0,
        ghosts: [0, 0],
        tally: 0,
        contentsFade: 0,
      };
    }
    const replyAt = Math.max(0.05, b0 - 0.25);
    const newAt = b0 + 0.45 * L;
    return {
      view: 'live' as const,
      panes: 1,
      uncap: 1,
      glow: 1,
      walk: 1,
      boxes: [
        box(480 - 130 * E(newAt - 0.3, 0.4), '0.4.0', '0.3.1', { lid: 1 - E(replyAt, 0.4), rise: 1 - E(replyAt, 0.4) }),
        box(610, '0.4.1', '', { appear: E(newAt, 0.2), drop: E(newAt, 0.45), glow: pulse(t, fit(newAt + 0.4, 0.6, dur), 0.6) }),
      ],
      flagTravel: 1,
      flagCard: 1,
      replyTravel: P(replyAt, 0.35),
      replyCard: E(replyAt + 0.35, 0.25),
      slide: E(newAt - 0.3, 0.4),
      newBox: E(newAt, 0.45),
      ghosts: [E(b0 + 0.66 * L, 0.3), E(b0 + 0.76 * L, 0.3)],
      tally: E(b0 + 0.86 * L, 0.3),
      contentsFade: E(replyAt, 0.4),
    };
  }

  // ------------------------------------------------ close: not worth much / worth something
  const k = Number.isFinite(b1) ? b1 : b0 + 2;
  return {
    view: 'close' as const,
    left: E(b0, 0.4),
    leftDim: E(k - 0.2, 0.5),
    right: E(k - 0.1, 0.4),
    walk: E(k + 0.2, 0.5),
    boxes: [box(720, '0.4.0', '', { lid: E(k + 0.7, 0.3), glow: E(k + 0.8, 0.5) })],
  };
}

export type ShelfState = ReturnType<typeof frameState>;
