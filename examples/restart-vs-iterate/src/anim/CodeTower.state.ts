// Pure state of the CodeTower scenes (script scenes 1-11). Modes:
// - hook:  one tower, three rose blocks; a patch lands, turns teal, goes rose again; the tower
//          wobbles; the restart button appears. marks: [stuck, start]
// - quote: "let the loop restart" writes itself; on "restart" the button is pressed, the tower
//          collapses and is rebuilt clean. marks: [let, restart]
// - loop:  the write → test → feedback ring around a small tower. marks: [loop, write, tests, again]
// - rules: four round pips, equal coin stacks, the gaps between rounds lit. marks: [four, budget, between]
// - lanes: three lanes (iterate, restart, button); `lane` says which one plays, earlier lanes
//          sit finished, later ones wait as ghosts. marks per lane: 1 [keep, failures, patch];
//          2 [wipe, clean, round]; 3 [button, picks, how, much, away]
// - bars:  the lanes become bars; `step` 1 strong pair, 2 weak pair, 3 button bar, 4 bracket.
//          marks: 1 [won, eighty, sixty]; 2 [weaker, same]; 3 [ninety]; 4 [edge]
// Marks are scene seconds (timeline.ts resolves them from the TTS word timestamps); a missing or
// non-finite mark falls back to a time derived from the first beat.
// No Remotion or React here.
import { beatAt, clamp01, easeOutCubic, fit, progress, sceneTime } from './steps.ts';
import { roundColour, stripLights, towerBlocks, type BlockState, type LightState, type Swap, type TowerEvent } from './tower.state.ts';

export type TowerMode = 'hook' | 'quote' | 'loop' | 'rules' | 'lanes' | 'bars';
export type CodeTowerProps = { mode: TowerMode; lane?: 1 | 2 | 3; step?: 1 | 2 | 3 | 4; marks?: number[] };

/** Geometry shared with the drawing (pure numbers). */
export const SINGLE = { x: 430, base: 1160, w: 320, h: 56, gap: 8, n: 9 } as const;
export const LOOPG = { cx: 540, cy: 800, r: 330, x: 540, base: 905, w: 180, h: 40, gap: 6, n: 6 } as const;
export const LANES = { xs: [216, 540, 864], base: 920, w: 190, h: 44, gap: 6, n: 7 } as const;

/** Real single runs (one click feature, strong model, seed 3): failing tests per round. */
export const ITER_RUN = [4, 1, 0] as const;
export const RESTART_RUN = [3, 3, 4, 3] as const;
const ITER_SETS = [[1, 3, 4, 6], [3], []];
const RESTART_SETS = [[0, 3, 5], [1, 2, 6], [0, 2, 4, 5], [1, 3, 6]];
const HOOK_ROSE = [2, 4, 6];

export type TowerState = { blocks: BlockState[]; lights: LightState[]; opacity: number; scale: number; wobble: number };
export type LaneState = {
  tower: TowerState;
  /** Lane header and frame: 0 hidden, ghost ~0.3, 1 active. */
  presence: number;
  active: number;
  /** Round pips lit (0..4, fractional while one lights). */
  rounds: number;
  /** How many items of the per-round readout show, and the end mark (✓/✗) pop. */
  seq: number;
  end: number;
  failing: number | null;
};

const NO_LIGHTS = (n: number): LightState[] => Array.from({ length: n }, () => ({ rose: 0, teal: 0 }));

const m = (marks: number[] | undefined, i: number, fallback: number): number => {
  const v = marks?.[i];
  return v !== undefined && Number.isFinite(v) ? v : fallback;
};

export function frameState(props: CodeTowerProps, tIn: number, beats: number[], dur: number) {
  const t = sceneTime(tIn, dur);
  const b0 = beatAt(beats, 0);
  const d = Number.isFinite(dur) && dur > 0 ? dur : 4;
  const mk = (i: number, fb: number, len = 0.4) => fit(m(props.marks, i, fb), len, d);

  // Defaults: everything hidden.
  let single: TowerState = { blocks: [], lights: [], opacity: 0, scale: 1, wobble: 0 };
  let patch = { fly: 0, opacity: 0 };
  let button = { pop: 0, press: 0, pulse: 0, dial: -1, dialPop: 0 };
  let quote = { words: 0, credit: 0 };
  let loop = { ring: 0, nodes: [0, 0, 0], dot: 0, dotOpacity: 0, card: 0, cardOpacity: 0, tag: 0 };
  let rules = { pips: [0, 0, 0, 0], coins: [0, 0, 0, 0], label: 0, budget: 0, gaps: 0, bracket: 0 };
  let lanes: LaneState[] = [];
  let laneNote = 0;
  let bars = { shrink: 0, strong: [0, 0, 0], weak: [0, 0], foot: 0, weakFoot: 0, bracket: 0, labels: [0, 0, 0] };

  const mode = props.mode;

  if (mode === 'hook') {
    // The patch keeps coming from frame 0 (no still opening: a static first second reads as a
    // paused video in a feed): one attempt at once, one on "stuck", one after the button appears.
    // Each lands, flashes teal, goes rose again and the tower wobbles; failing stays at 3.
    const stuck = mk(0, b0 + 0.6, 1.4);
    const start = mk(1, b0 + 1.8, 0.4);
    const a1 = 0;
    const a2 = Math.max(a1 + 1.4, stuck - 0.05);
    const a3 = Math.max(a2 + 1.45, start + 0.45);
    const attempts = [a1, a2, a3].filter((a) => a === a1 || a + 1.0 <= d + 0.6);
    let cur = attempts[0];
    for (const a of attempts) if (t >= a - 0.05) cur = a;
    const land = cur + 0.35;
    const teal = (i: number) => (i === 4 ? progress(t, land, 0.15) * (1 - progress(t, land + 0.7, 0.2)) : 0);
    const rose = (i: number) => (HOOK_ROSE.includes(i) ? (i === 4 ? 1 - teal(i) : 1) : 0);
    let wob = 0;
    for (const a of attempts) {
      const since = t - (a + 0.35 + 0.8);
      if (since > 0) wob = Math.sin(since * 9) * 3.2 * Math.exp(-since * 1.4);
    }
    single = {
      blocks: towerBlocks(SINGLE.n, SINGLE.h + SINGLE.gap, t, [], [], rose, teal),
      lights: stripLights(6, [3], [-1], t),
      opacity: 1,
      scale: 1,
      wobble: Number.isFinite(wob) ? wob : 0,
    };
    patch = { fly: easeOutCubic(progress(t, cur - 0.05, 0.4)), opacity: (cur === 0 ? 1 : progress(t, cur - 0.05, 0.1)) * (1 - progress(t, land + 0.7, 0.25)) };
    button = { pop: easeOutCubic(progress(t, start, 0.35)), press: 0, pulse: 0.5 + 0.5 * Math.sin(Math.max(0, t - start) * 5), dial: -1, dialPop: 0 };
  }

  if (mode === 'quote') {
    const lets = mk(0, b0 + 1.4, 0.6);
    const restart = mk(1, lets + 0.7, 2.0);
    const collapse = restart + 0.12;
    const build = collapse + 0.75;
    const events: TowerEvent[] = [
      { kind: 'collapse', at: collapse },
      { kind: 'build', at: build },
    ];
    const rose = (i: number) => (HOOK_ROSE.includes(i) && t < build ? 1 : 0);
    single = {
      blocks: towerBlocks(SINGLE.n, SINGLE.h + SINGLE.gap, t, events, [], rose),
      lights: stripLights(6, [3, null], [-1, collapse], t),
      opacity: 1,
      scale: 1,
      wobble: 0,
    };
    quote = { words: clamp01((t - (lets - 0.1)) / Math.max(0.3, restart + 0.15 - lets)), credit: progress(t, restart + 0.3, 0.4) };
    button = {
      pop: 1,
      press: progress(t, restart - 0.08, 0.08) * (1 - progress(t, restart + 0.2, 0.2)),
      pulse: 0.5 + 0.5 * Math.sin(Math.max(0, t) * 5),
      dial: -1,
      dialPop: 0,
    };
  }

  if (mode === 'loop') {
    const ringAt = mk(0, b0 + 0.5, 0.6);
    const write = Math.max(ringAt + 0.3, mk(1, b0 + 1.7, 0.7));
    const tests = Math.max(write + 0.5, mk(2, b0 + 2.6, 1.0));
    const fb = tests + 0.55;
    const again = Math.max(fb + 0.5, mk(3, b0 + 3.6, 0.6));
    const sets = [[1, 4]];
    single = {
      blocks: towerBlocks(LOOPG.n, LOOPG.h + LOOPG.gap, t, [{ kind: 'build', at: write }], [], (i) => roundColour(sets, [tests + 0.1], i, t), () => 0, true),
      lights: stripLights(6, [2], [tests + 0.1], t),
      opacity: 1,
      scale: 1,
      wobble: 0,
    };
    // The dot runs round the ring: write (0) → test (1/3) → feedback (2/3) → write (1).
    const seg = (a: number, b: number, from: number, to: number) => from + (to - from) * easeOutCubic(progress(t, a, Math.max(0.1, b - a)));
    let dot = 0;
    if (t >= write) dot = seg(write, tests, 0, 1 / 3);
    if (t >= tests) dot = seg(tests, fb, 1 / 3, 2 / 3);
    if (t >= fb) dot = seg(fb, again, 2 / 3, 1);
    loop = {
      ring: easeOutCubic(progress(t, ringAt, 0.6)),
      nodes: [progress(t, write - 0.1, 0.25), progress(t, tests - 0.1, 0.25), progress(t, fb - 0.1, 0.25)],
      dot: clamp01(dot),
      dotOpacity: progress(t, write, 0.2),
      card: easeOutCubic(progress(t, fb, Math.max(0.3, again - fb))),
      cardOpacity: progress(t, fb - 0.05, 0.15) * (1 - progress(t, again + 0.2, 0.3)),
      tag: progress(t, fit(ringAt + 0.4, 0.4, d), 0.4),
    };
  }

  if (mode === 'rules') {
    const four = mk(0, b0 + 0.1, 0.8);
    const budget = Math.max(four + 0.4, mk(1, b0 + 1.0, 0.8));
    const between = Math.max(budget + 0.4, mk(2, b0 + 3.0, 0.6));
    rules = {
      pips: [0, 1, 2, 3].map((k) => easeOutCubic(progress(t, four + k * 0.12, 0.3))),
      coins: [0, 1, 2, 3].map((k) => easeOutCubic(progress(t, budget + k * 0.1, 0.3))),
      label: progress(t, four, 0.3),
      budget: progress(t, budget + 0.2, 0.3),
      gaps: easeOutCubic(progress(t, between - 0.1, 0.35)),
      bracket: easeOutCubic(progress(t, between + 0.15, 0.35)),
    };
  }

  if (mode === 'lanes') {
    const lane = props.lane ?? 1;
    const pitch = LANES.h + LANES.gap;
    // The finished state of each lane, and a ghost for lanes still to come.
    const done1 = (): LaneState => ({
      tower: { blocks: towerBlocks(LANES.n, pitch, 0, [], [], () => 0), lights: stripLights(6, [0], [-1], 0), opacity: 0.75, scale: 1, wobble: 0 },
      presence: 0.75,
      active: 0,
      rounds: 3,
      seq: 3,
      end: 1,
      failing: 0,
    });
    const done2 = (): LaneState => ({
      tower: {
        blocks: towerBlocks(LANES.n, pitch, 0, [], [], (i) => (RESTART_SETS[3].includes(i) ? 1 : 0)),
        lights: stripLights(6, [3], [-1], 0),
        opacity: 0.75,
        scale: 1,
        wobble: 0,
      },
      presence: 0.75,
      active: 0,
      rounds: 4,
      seq: 4,
      end: 1,
      failing: 3,
    });
    const ghost = (): LaneState => ({
      tower: { blocks: towerBlocks(LANES.n, pitch, 0, [], [], () => 0), lights: NO_LIGHTS(6), opacity: 0.22, scale: 1, wobble: 0 },
      presence: 0.4,
      active: 0,
      rounds: 0,
      seq: 0,
      end: 0,
      failing: null,
    });
    const appear = progress(t, 0, 0.35);

    let l1 = ghost();
    let l2 = ghost();
    let l3 = ghost();
    if (lane === 1) {
      const r1 = fit(b0 + 0.05, 0.3, d);
      const r2 = Math.max(r1 + 0.8, mk(1, b0 + 1.4, 1.1));
      const r3 = Math.max(r2 + 0.7, mk(2, b0 + 2.6, 0.9));
      const swaps: Swap[] = [
        { idx: 1, at: r2 },
        { idx: 4, at: r2 + 0.12 },
        { idx: 6, at: r2 + 0.24 },
        { idx: 3, at: r3 },
      ];
      l1 = {
        tower: {
          blocks: towerBlocks(LANES.n, pitch, t, [], swaps, (i) => roundColour(ITER_SETS, [r1, r2 + 0.25 + (i === 4 ? 0.12 : i === 6 ? 0.24 : 0), r3 + 0.25], i, t)),
          lights: stripLights(6, [...ITER_RUN], [r1 + 0.3, r2 + 0.45, r3 + 0.45], t),
          opacity: 1,
          scale: 1,
          wobble: 0,
        },
        presence: 1,
        active: 1,
        rounds: progress(t, r1, 0.2) + progress(t, r2, 0.2) + progress(t, r3, 0.2),
        seq: progress(t, r1 + 0.3, 0.25) + progress(t, r2 + 0.45, 0.25) + progress(t, r3 + 0.45, 0.25),
        end: easeOutCubic(progress(t, r3 + 0.6, 0.3)),
        failing: t >= r3 + 0.45 ? 0 : t >= r2 + 0.45 ? 1 : t >= r1 + 0.3 ? 4 : null,
      };
      l1.tower.opacity = Math.max(0.22, progress(t, 0, 0.3));
      l2 = ghost();
      l3 = ghost();
    } else if (lane === 2) {
      l1 = done1();
      const r1 = fit(b0 + 0.05, 0.3, d);
      const c2 = Math.max(r1 + 0.6, mk(0, b0 + 0.6, 2.4));
      const c3 = Math.max(c2 + 1.0, mk(1, b0 + 1.6, 1.4));
      const c4 = Math.max(c3 + 1.0, mk(2, b0 + 2.6, 1.2));
      const cs = [c2, c3, c4];
      const events: TowerEvent[] = cs.flatMap((c) => [
        { kind: 'collapse' as const, at: c },
        { kind: 'build' as const, at: c + 0.42 },
      ]);
      const changes = [r1, ...cs.map((c) => c + 0.42)];
      const lightAt = [r1 + 0.3, ...cs.map((c) => c + 0.9)];
      l2 = {
        tower: {
          blocks: towerBlocks(LANES.n, pitch, t, events, [], (i) => roundColour(RESTART_SETS, changes, i, t, 0.05)),
          lights: stripLights(6, [3, null, 3, null, 4, null, 3], [lightAt[0], cs[0], lightAt[1], cs[1], lightAt[2], cs[2], lightAt[3]], t),
          opacity: 1,
          scale: 1,
          wobble: 0,
        },
        presence: 1,
        active: 1,
        rounds: progress(t, r1, 0.2) + progress(t, cs[0], 0.2) + progress(t, cs[1], 0.2) + progress(t, cs[2], 0.2),
        seq: lightAt.reduce((s, a) => s + progress(t, a, 0.25), 0),
        end: easeOutCubic(progress(t, lightAt[3] + 0.2, 0.3)),
        failing: (() => {
          let f: number | null = null;
          lightAt.forEach((a, k) => {
            if (t >= a) f = RESTART_RUN[k];
          });
          cs.forEach((c, k) => {
            if (t >= c && t < lightAt[k + 1]) f = null;
          });
          return f;
        })(),
      };
      l3 = ghost();
    } else {
      l1 = done1();
      l2 = done2();
      const land = mk(0, b0 + 0.6, 0.4);
      const picks = Math.max(land + 0.3, mk(1, b0 + 1.4, 0.4));
      const how = Math.max(picks + 0.3, mk(2, b0 + 2.2, 0.4));
      const much = Math.max(how + 0.25, mk(3, b0 + 2.6, 0.4));
      const away = Math.max(much + 0.25, mk(4, b0 + 3.2, 0.4));
      l3 = {
        tower: { blocks: towerBlocks(LANES.n, pitch, t, [], [], () => 0), lights: NO_LIGHTS(6), opacity: 0.22 + 0.78 * progress(t, 0, 0.35), scale: 1, wobble: 0 },
        presence: 0.4 + 0.6 * progress(t, 0, 0.35),
        active: 1,
        rounds: 0,
        seq: 0,
        end: 0,
        failing: null,
      };
      button = {
        pop: easeOutCubic(progress(t, land - 0.15, 0.35)),
        press: 0,
        pulse: 0.5 + 0.5 * Math.sin(Math.max(0, t - land) * 5),
        dial: t >= away ? 2 : t >= much ? 1 : t >= how ? 0 : -1,
        dialPop: progress(t, land, 0.3),
      };
      laneNote = progress(t, picks, 0.35);
    }
    // Lanes fade in together at the start of the first lanes scene only.
    if (lane === 1) for (const l of [l1, l2, l3]) l.presence *= appear;
    lanes = [l1, l2, l3];
  }

  if (mode === 'bars') {
    const step = props.step ?? 1;
    const full = (s: number) => (step > s ? 1 : 0);
    let strong = [full(1), full(1), full(3)];
    let weak = [full(2), full(2)];
    let foot = full(1);
    let weakFoot = full(2);
    let bracket = full(4);
    let shrink = 1;
    if (step === 1) {
      shrink = easeOutCubic(progress(t, 0.1, 0.5));
      // The winner's bar rises on "won" so the result is on screen as it is said (no empty stage).
      const e = Math.max(0.5, mk(0, b0 + 0.2, 0.5) + 0.25);
      const s = Math.max(e + 0.3, mk(2, b0 + 3.0, 0.5));
      strong = [easeOutCubic(progress(t, e - 0.1, 0.5)), easeOutCubic(progress(t, s - 0.1, 0.5)), 0];
      foot = progress(t, s + 0.4, 0.35);
    } else if (step === 2) {
      const w = mk(0, b0 + 0.3, 0.5);
      const sa = Math.max(w + 0.3, mk(1, b0 + 1.2, 0.5));
      weak = [easeOutCubic(progress(t, w - 0.1, 0.5)), easeOutCubic(progress(t, w + 0.15, 0.5))];
      weakFoot = progress(t, sa, 0.35);
    } else if (step === 3) {
      const n = mk(0, b0 + 1.8, 0.6);
      strong = [1, 1, easeOutCubic(progress(t, n - 0.2, 0.6))];
    } else {
      bracket = easeOutCubic(progress(t, mk(0, b0 + 1.2, 0.4), 0.4));
    }
    bars = {
      shrink,
      strong,
      weak,
      foot,
      weakFoot,
      bracket,
      labels: [progress(t, 0.2, 0.3), progress(t, 0.2, 0.3), step >= 3 ? (step === 3 ? strong[2] : 1) : 0],
    };
  }

  return { mode, single, patch, button, quote, loop, rules, lanes, laneNote, bars };
}

export type CodeTowerState = ReturnType<typeof frameState>;
