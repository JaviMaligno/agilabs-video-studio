// MemoryWall: the audit as a wall of 35 notes (5 x 7). Each is green (its thread to the repo is
// taut), red (slack: it claims something no longer true) or grey (no thread at all). The wall
// carries the rest of the video: the check, what expires on its own, the tally, the three reds,
// the greys, the green that was stale, the folder and the verdict.
// Pure state: no Remotion or React, so it is tested with plain `node --test`.
import { beatAt, clamp01, fit, progress, sceneTime } from './steps.ts';
import { CHECKED, KINDS, REDS, STALE_GREEN, TREE, ease, lerp, pop, slot, wave } from './memory.ts';

export type WallMode = 'fill' | 'thread' | 'split' | 'tally' | 'reds' | 'greys' | 'green' | 'folder' | 'verdict';
export type MemoryWallProps = { mode: WallMode; blend?: boolean };

export type Box = { x: number; y: number; w: number; h: number };
export type NoteView = Box & {
  opacity: number;
  /** How much of its state colour shows (0 = neutral). */
  colour: number;
  /** Extra emphasis (glow, brighter fill). */
  glow: number;
  /** Red pulse. */
  pulse: number;
};

export type WallFrame = {
  mode: WallMode;
  wall: { opacity: number; scale: number };
  notes: NoteView[];
  /** The big note (the hook memory) shrinking into the wall or zooming back out of it. */
  hero: Box & { opacity: number; text: number; edge: number; neutral: number };
  band: { counter: number; counterOn: number; tag: number; legend: number[]; greyBoost: number; title: number; answer: number; verdict: number };
  /** Tally threads, one per checked memory (CHECKED order). */
  ties: { draw: number; slack: number }[];
  repo: number;
  check: { tree: number; draw: number; slack: number; json: number; scan: number[]; miss: number[]; noMatch: number; legend: number };
  split: { left: number; bubble: number; right: number; tie: number; edge: number; clock: number; tick: number; noCheck: number };
  reds: { boxes: (Box & { opacity: number })[]; text: number; ticks: number[]; stamps: number[]; outcomes: number[]; glass: number[]; flow: number; stable: number };
  greys: { tags: number[]; stamp: number };
  green: Box & { open: number; content: number; lines: number[]; date: number; chip: number; spot: number; words: number; emphasis: number };
  folder: { icon: number; tag: number };
  verdict: { tool: number; stamp: number; line: number };
};

/** Where the hook note sits in PinnedNote (stage space), and where it zooms back to. */
export const HERO_PIN: Box = { x: 110, y: 40, w: 740, h: 320 };
export const HERO_CHECK: Box = { x: 110, y: 40, w: 740, h: 250 };
export const RED_BOX = (k: number): Box => ({ x: 20 + k * 317, y: 150, w: 290, h: 480 });
export const GREEN_BOX: Box = { x: 40, y: 20, w: 880, h: 740 };
/** Workflow rows the check scans (the children of .github/workflows/ left today). */
export const SCAN_ROWS = TREE.map((r, i) => (r.depth === 2 && !r.old ? i : -1)).filter((i) => i >= 0);
/** The key sentence in three lines; the middle one is the emphasis. */
export const QUOTE_LINES = [['A', 'green', 'certifies'], ['what', 'was', 'encoded,'], ['not', 'the', 'whole', 'memory.']];
export const QUOTE_WORDS = QUOTE_LINES.flat();

const boxLerp = (a: Box, b: Box, p: number): Box => ({ x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p), w: lerp(a.w, b.w, p), h: lerp(a.h, b.h, p) });

const baseNotes = (colour: number): NoteView[] => KINDS.map((_, i) => ({ ...slot(i), opacity: 1, colour, glow: 0, pulse: 0 }));

export const frameState = (props: MemoryWallProps, t: number, beats: number[], dur: number): WallFrame => {
  const T = sceneTime(t, dur);
  const mode = props.mode;
  const b0 = beatAt(beats, 0);
  const b1 = beats.length > 1 ? beatAt(beats, 1) : b0 + 1.5;
  const b2 = beats.length > 2 ? beatAt(beats, 2) : b1 + 1.5;

  const s: WallFrame = {
    mode,
    wall: { opacity: 1, scale: 1 },
    notes: baseNotes(1),
    hero: { ...slot(0), opacity: 0, text: 0, edge: 1, neutral: 0 },
    band: { counter: 35, counterOn: 0, tag: 0, legend: [1, 1, 1], greyBoost: 0, title: 0, answer: 0, verdict: 0 },
    ties: CHECKED.map(() => ({ draw: 0, slack: 0 })),
    repo: 0,
    check: { tree: 0, draw: 0, slack: 0, json: 0, scan: TREE.map(() => 0), miss: TREE.map(() => 0), noMatch: 0, legend: 0 },
    split: { left: 0, bubble: 0, right: 0, tie: 0, edge: 0, clock: 0, tick: 0, noCheck: 0 },
    reds: { boxes: REDS.map((i) => ({ ...slot(i), opacity: 0 })), text: 0, ticks: [0, 0, 0], stamps: [0, 0, 0], outcomes: [0, 0, 0], glass: [0, 0, 0], flow: 0, stable: 0 },
    greys: { tags: [0, 0, 0], stamp: 0 },
    green: { ...slot(STALE_GREEN), open: 0, content: 0, lines: [0, 0, 0, 0, 0, 0, 0], date: 0, chip: 0, spot: 0, words: 0, emphasis: 0 },
    folder: { icon: 0, tag: 0 },
    verdict: { tool: 0, stamp: 0, line: 0 },
  };

  if (mode === 'fill') {
    // The hook note shrinks into the first slot; the other 34 notes pop in, all neutral.
    const p = ease(T, fit(b0, 0.9, dur), 0.9);
    s.hero = { ...boxLerp(HERO_PIN, slot(0), p), opacity: 1, text: 1 - clamp01(p * 1.6), edge: 1, neutral: p };
    s.notes = baseNotes(0).map((n, i) => ({ ...n, opacity: i === 0 ? 0 : pop(T, fit(b0 + 0.45 + 0.03 * i, 0.35, dur)) }));
    // The counter counts the notes actually on the wall (the hook note is the first).
    s.band = { ...s.band, counter: 1 + s.notes.filter((n, i) => i > 0 && n.opacity >= 0.5).length, counterOn: progress(T, fit(b0 + 0.4, 0.3, dur), 0.3), tag: pop(T, fit(b0 + 1.2, 0.35, dur)), legend: [0, 0, 0] };
    return s;
  }

  if (mode === 'thread') {
    // Back to the first note: a check hangs from it into the repo. It finds nothing: red.
    const focus = ease(T, fit(Math.max(0, b0 - 0.1), 0.7, dur), 0.7);
    s.notes = baseNotes(0).map((n, i) => ({ ...n, opacity: i === 0 ? 0 : 1 - 0.92 * focus }));
    s.hero = { ...boxLerp(slot(0), HERO_CHECK, focus), opacity: 1, text: clamp01((focus - 0.5) * 2), edge: ease(T, fit(b1 + 3.3, 0.5, dur), 0.5), neutral: 1 - ease(T, fit(b1 + 3.3, 0.5, dur), 0.5) };
    s.band = { ...s.band, counterOn: 1 - focus, tag: 1 - focus, legend: [0, 0, 0] };
    s.check.tree = ease(T, fit(b0 + 0.3, 0.5, dur), 0.5);
    s.check.draw = ease(T, fit(b0 + 0.7, 0.6, dur), 0.6);
    s.check.json = ease(T, fit(b0 + 1.1, 0.5, dur), 0.5);
    // The rule shows first ("It claims those workflows exist?"), then the scan walks the workflow
    // rows; "none left" lands on "none is left" and the note turns red on "turns red".
    const scanStart = fit(b1 + 0.9, 1.3, dur);
    const pos = lerp(-0.5, SCAN_ROWS.length - 0.5, progress(T, scanStart, 1.1));
    s.check.scan = TREE.map((_, i) => {
      const k = SCAN_ROWS.indexOf(i);
      return k < 0 || T < scanStart ? 0 : clamp01(1 - Math.abs(pos - k) * 1.6) * (1 - progress(T, scanStart + 1.1, 0.2));
    });
    s.check.miss = TREE.map((_, i) => {
      const k = SCAN_ROWS.indexOf(i);
      return k < 0 ? 0 : progress(T, scanStart + (1.1 * (k + 0.5)) / SCAN_ROWS.length, 0.15);
    });
    s.check.noMatch = pop(T, fit(b1 + 2.35, 0.35, dur));
    s.check.slack = ease(T, fit(b1 + 2.7, 0.6, dur), 0.6);
    s.check.legend = ease(T, fit(b1 + 0.5, 0.5, dur), 0.5);
    return s;
  }

  if (mode === 'split') {
    // What expires on its own? A preference (no thread) next to a fact about the system.
    s.wall.opacity = 0;
    s.band = { ...s.band, legend: [0, 0, 0], title: ease(T, 0, 0.5), answer: ease(T, fit(b2 + 0.7, 0.5, dur), 0.5) };
    s.split.left = ease(T, fit(b0, 0.5, dur), 0.5);
    s.split.bubble = pop(T, fit(b0 + 0.9, 0.35, dur));
    s.split.right = ease(T, fit(b1, 0.5, dur), 0.5);
    s.split.tie = ease(T, fit(b1 + 0.3, 0.5, dur), 0.5);
    s.split.edge = ease(T, fit(b1 + 0.8, 1.6, dur), 1.6);
    s.split.clock = T > b1 ? ((T - b1) % 1000) * 2.4 : 0;
    s.split.tick = pop(T, fit(b2 + 0.2, 0.35, dur));
    s.split.noCheck = pop(T, fit(b2 + 0.45, 0.35, dur));
    return s;
  }

  if (mode === 'tally') {
    // Threads drop from the 10 checked notes: 7 taut (green), 3 slack (red). Then the greys.
    s.repo = ease(T, 0, 0.4);
    const resolve = fit(b0 + 0.85, 0.4, dur);
    const greyAt = fit(b0 + 1.5, 0.4, dur);
    s.ties = CHECKED.map((i, k) => ({ draw: ease(T, fit(Math.max(0, b0 - 0.15) + 0.06 * k, 0.45, dur), 0.45), slack: KINDS[i] === 'red' ? ease(T, resolve, 0.5) : 0 }));
    s.notes = baseNotes(0).map((n, i) => {
      const k = KINDS[i];
      const colour = k === 'grey' ? progress(T, greyAt, 0.4) : progress(T, resolve, 0.35);
      return { ...n, colour, pulse: k === 'red' ? progress(T, resolve, 0.3) * wave(T, 1.6) : 0 };
    });
    s.band = { ...s.band, legend: [pop(T, fit(b0 + 1.0, 0.35, dur)), pop(T, fit(b0 + 1.15, 0.35, dur)), pop(T, greyAt)] };
    return s;
  }

  // Modes below start from the finished tally: the wall in its three colours.
  const fadeTies = 1 - progress(T, 0, 0.4);

  if (mode === 'reds') {
    s.repo = fadeTies;
    s.ties = CHECKED.map((i) => ({ draw: fadeTies, slack: KINDS[i] === 'red' ? 1 : 0 }));
    const fly = ease(T, fit(b0, 0.8, dur), 0.8);
    s.notes = s.notes.map((n, i) => (KINDS[i] === 'red' ? { ...n, opacity: 1 - fly } : { ...n, opacity: 1 - 0.88 * fly }));
    s.reds.boxes = REDS.map((i, k) => ({ ...boxLerp(slot(i), RED_BOX(k), ease(T, fit(b0 + 0.08 * k, 0.8, dur), 0.8)), opacity: fly > 0 ? 1 : 0 }));
    s.reds.text = clamp01((fly - 0.6) / 0.4);
    s.reds.ticks = [0, 1, 2].map((k) => ease(T, fit(b0 + 0.75 + 0.3 * k, 0.4, dur), 0.4));
    s.reds.stamps = [0, 1, 2].map((k) => pop(T, fit(b1 + 0.1 + 0.22 * k, 0.35, dur)));
    s.reds.outcomes = [0, 1, 2].map((k) => ease(T, fit(b1 + 0.6 + 0.22 * k, 0.4, dur), 0.4));
    s.reds.glass = [0, 1, 2].map((k) => pop(T, fit(b2 + 0.15 + 0.2 * k, 0.35, dur)));
    s.reds.flow = progress(T, fit(b2 + 0.3, 2.5, dur), 2.5);
    const b3 = beats.length > 3 ? beatAt(beats, 3) : b2 + 1.0;
    s.reds.stable = ease(T, fit(b3 + 0.1, 0.5, dur), 0.5);
    s.band = { ...s.band, legend: [1 - 0.6 * fly, 1, 1 - 0.6 * fly] };
    return s;
  }

  if (mode === 'greys') {
    // The 25 greys light up together; then what they are; then: not a flaw.
    const g = ease(T, fit(b0 + 0.1, 0.6, dur), 0.6);
    s.notes = s.notes.map((n, i) => (KINDS[i] === 'grey' ? { ...n, glow: g } : { ...n, opacity: 1 - 0.65 * g }));
    s.band = { ...s.band, greyBoost: g };
    s.greys.tags = [0, 1, 2].map((k) => pop(T, fit(b1 + 0.1 + 0.4 * k, 0.4, dur)));
    s.greys.stamp = pop(T, fit(b2 + 0.1, 0.4, dur));
    return s;
  }

  if (mode === 'green') {
    // One green zooms out of the wall and opens: seven files, all there; a date inside, stale.
    const open = ease(T, fit(b0 + 0.1, 0.8, dur), 0.8);
    s.notes = s.notes.map((n, i) => (i === STALE_GREEN ? { ...n, opacity: 0 } : { ...n, opacity: 1 - 0.92 * open }));
    s.band = { ...s.band, legend: [1 - 0.7 * open, 1 - 0.7 * open, 1 - 0.7 * open] };
    s.green = {
      ...boxLerp(slot(STALE_GREEN), GREEN_BOX, open),
      open,
      content: clamp01((open - 0.65) / 0.35),
      lines: [0, 1, 2, 3, 4, 5, 6].map((k) => ease(T, fit(b0 + 0.8 + 0.12 * k, 0.3, dur), 0.3)),
      date: ease(T, fit(b0 + 1.9, 0.4, dur), 0.4),
      chip: pop(T, fit(b0 + 2.4, 0.35, dur)),
      spot: ease(T, fit(b1, 0.5, dur), 0.5),
      words: 0,
      emphasis: 0,
    };
    // The key sentence writes itself over the line that says it.
    const end = Math.max(b1 + 0.6, dur - 1.2);
    const span = Math.max(0.3, Math.min(end, dur) - b1);
    const wStart = fit(b1, span, dur);
    s.green.words = Math.round(QUOTE_WORDS.length * progress(T, wStart, span * 0.85));
    s.green.emphasis = ease(T, wStart + span * 0.85, 0.4);
    if (T >= dur) {
      s.green.words = QUOTE_WORDS.length;
      s.green.emphasis = 1;
    }
    return s;
  }

  if (mode === 'folder') {
    // The whole wall is one folder: one person, one project.
    const shrink = ease(T, fit(b0 + 0.2, 0.9, dur), 0.9);
    s.wall = { opacity: 1 - clamp01((shrink - 0.55) / 0.45), scale: lerp(1, 0.16, shrink) };
    s.band = { ...s.band, legend: [1 - shrink, 1 - shrink, 1 - shrink] };
    s.folder.icon = pop(T, fit(b0 + 0.75, 0.4, dur));
    s.folder.tag = pop(T, fit(b0 + 1.2, 0.35, dur));
    return s;
  }

  // verdict: the checker, stamped CLUMSY as the line lands on the word.
  s.wall.opacity = 0;
  s.band = { ...s.band, legend: [0, 0, 0], verdict: ease(T, 0, 0.45) };
  s.verdict.tool = ease(T, fit(b0, 0.5, dur), 0.5);
  // On the word "clumsy" (about 1.8 s into the line), not tied to the scene end, so the scene
  // can hold the finished verdict on screen.
  const stampAt = fit(b0 + 1.75, 0.35, dur);
  s.verdict.stamp = pop(T, stampAt);
  s.verdict.line = ease(T, fit(stampAt + 0.35, 0.4, dur), 0.4);
  return s;
};
