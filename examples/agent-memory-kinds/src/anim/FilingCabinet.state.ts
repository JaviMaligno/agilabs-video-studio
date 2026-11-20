// Pure state of the filing cabinet: a notebook the AI can search by keyword (rows 21-25).
// - file: the desk is swept clean; every page, the red slip too, slides into a drawer; the cabinet
//   glows (nothing is thrown away); a magnifier hovers (search by keyword); an inbox icon comes in
//   and folds into the cabinet (like email) and a question mark rises over the magnifier; then the
//   cold open comes back in a panel: "Booked your hotel for Thursday night", pulsing red, with a
//   cross ("the one that sounds safest ... did the worst").
//   Marks: [clear, nothing, keyword, know, email, safest].
// - miss: the clean desk says nothing; the magnifier opens the "flights" and "dates" drawers and
//   turns up pages; the slip's drawer stays shut; the question it never asks ("anything changed?")
//   comes up dashed and is struck; "1 search in 40"; a second pass goes by the slip's drawer the
//   same way; the closing line. Marks: [nothing, searches, never, changed, forty, second, only].
// - `short` (the reel): file has no inbox (the question mark rises on mark 3, the callback comes
//   on mark 5); miss has no "clean desk" note, no figure, no closing line and no second pass, and
//   the struck question stays to the end.
// No Remotion or React here.
import { beatOr, bump, ease, lerp, loopTime, mark, pickMode } from './memory.ts';
import { sceneTime } from './steps.ts';

export const CABINET_MODES = ['file', 'miss'] as const;
export type CabinetMode = (typeof CABINET_MODES)[number];
export type FilingCabinetProps = { mode: CabinetMode; marks?: number[]; short?: boolean };

/** The cabinet (vertical frame pixels) and the drawer that holds the slip. */
export const CAB = { x: 110, y: 560, w: 300, h: 540, drawers: 3, open: 170 } as const;
export const SLIP_DRAWER = 1;
/** Tags on the drawers it searches (the slip's drawer has none: nothing tells it to look there). */
export const DRAWER_TAGS = ['hotels', '', 'prices'] as const;
export const STAT_TEXT = '1 search in 40';
export const LINE_TEXT = 'A search only helps if you know what to look for.';
/** The question it never asks. */
export const UNASKED = 'anything changed?';
/** Centre of drawer `i`'s handle when open by `d` (where the magnifier looks), in cabinet pixels. */
export const drawerSpot = (i: number, d = 1) => ({ x: CAB.x + CAB.w + CAB.open * d - 40, y: CAB.y + (i + 0.5) * (CAB.h / CAB.drawers) - 70 });

export type FilingCabinetState = {
  /** The desk pile still on the desk (1 = all there). */
  pile: number;
  sweep: number;
  slip: { opacity: number; inDrawer: number };
  drawers: number[];
  glow: number;
  /** The magnifier, in cabinet pixels (vertical frame pixels around CAB). */
  lens: { opacity: number; x: number; y: number; question: number };
  clean: number;
  /** Per drawer: a page it turned up, lifted out (opacity). */
  found: number[];
  /** The slip's corner peeking out of its closed drawer. */
  peek: number;
  /** The question it never asks: shown (dashed), and struck. */
  unasked: { opacity: number; strike: number };
  /** The inbox icon: shown, and folded into the cabinet. */
  inbox: { opacity: number; into: number };
  /** The cold open, back in a panel: shown, the booking's red pulse, the cross. */
  callback: { opacity: number; pulse: number; cross: number };
  tags: number;
  stat: number;
  line: number;
};

/** One search pass: drawer 0 then drawer 2 open and close, the magnifier visits each. */
const pass = (T: number, at: number, w: number, hover: { x: number; y: number }) => {
  const d0 = ease(T, at, 0.4) * (1 - ease(T, at + 0.75 * w, 0.4));
  const d2 = ease(T, at + w, 0.4) * (1 - ease(T, at + 1.75 * w, 0.4));
  const toFirst = ease(T, at - 0.3, 0.4);
  const toSecond = ease(T, at + w - 0.3, 0.4);
  const back = ease(T, at + 1.75 * w, 0.4);
  const s0 = drawerSpot(0);
  const s2 = drawerSpot(2);
  return {
    d0,
    d2,
    x: lerp(lerp(lerp(hover.x, s0.x, toFirst), s2.x, toSecond), hover.x, back),
    y: lerp(lerp(lerp(hover.y, s0.y, toFirst), s2.y, toSecond), hover.y, back),
    found: [bump(T, at + 0.3, 0.75 * w), bump(T, at + w + 0.3, 0.75 * w)],
    active: T >= at - 0.3 && T < at + 1.75 * w + 0.4,
  };
};

export function frameState(props: FilingCabinetProps, t: number, beats: number[], dur: number): FilingCabinetState {
  const mode = pickMode(props.mode, CABINET_MODES);
  const T = sceneTime(Number.isFinite(t) ? t : 0, dur);
  const tm = loopTime(t, dur);
  const m = props.marks;
  const b0 = beatOr(beats, 0, 0);
  const b1 = beatOr(beats, 1, b0 + 3.0);
  const hover = { x: CAB.x + CAB.w / 2 + 40 * Math.sin(tm * 2.1), y: CAB.y - 90 + 14 * Math.cos(tm * 2.9) };
  const none = { inbox: { opacity: 0, into: 0 }, callback: { opacity: 0, pulse: 0, cross: 0 }, tags: 0, stat: 0, line: 0, unasked: { opacity: 0, strike: 0 } };

  const short = props.short === true;
  if (mode === 'file') {
    const b2 = beatOr(beats, 2, b1 + 1.4);
    const clear = mark(m, 0, b0 + 0.4);
    const nothing = mark(m, 1, b1 + 0.1);
    const search = mark(m, 2, b0 + 4);
    const email = short ? clear + 0.8 : Math.max(clear + 1.2, mark(m, 4, b1 + 1.4));
    const know = Math.max(email + 0.4, mark(m, 3, b1 + 3.0));
    const callback = Math.max(know + 0.6, mark(m, 5, b2 + 1.4));
    const sweep = ease(T, clear, 1.1);
    const open = ease(T, clear - 0.3, 0.4) * (1 - ease(T, clear + 1.2, 0.4));
    return {
      pile: 1 - sweep,
      sweep,
      slip: { opacity: 1, inDrawer: sweep },
      drawers: [0, open, 0],
      glow: ease(T, nothing - 0.1, 0.4),
      lens: { opacity: ease(T, search - 0.2, 0.4), x: hover.x, y: hover.y, question: ease(T, know, 0.4) * (1 - ease(T, callback - 0.4, 0.4)) },
      clean: 0,
      found: [0, 0, 0],
      peek: ease(T, clear + 1.4, 0.4),
      ...none,
      inbox: short ? { opacity: 0, into: 0 } : { opacity: ease(T, email - 0.2, 0.4), into: ease(T, email + 0.7, 0.8) },
      callback: { opacity: ease(T, callback - 0.3, 0.4), pulse: 0.55 + 0.45 * Math.sin(tm * 4.2), cross: ease(T, callback + (short ? 0.4 : 1.6), 0.35) },
    };
  }

  // miss
  const clean = mark(m, 0, b0 + 0.8);
  const looked = mark(m, 1, b1 + 0.4);
  const never = mark(m, 2, b1 + 2.6);
  const message = mark(m, 3, b1 + 3.4);
  const forty = Math.max(message, mark(m, 4, message + 1.0));
  const b2 = beatOr(beats, 2, forty + 1.6);
  const w = Math.max(1.2, (never - looked) / 2);
  const sharper = short ? 1e6 : Math.max(looked + 1.75 * w + 0.6, mark(m, 5, b2 + 0.8));
  const plain = Math.max(sharper + 0.5, mark(m, 6, b2 + 4.5));
  const w2 = Math.max(0.8, Math.min(w, (plain - sharper) / 2.2));
  const p1 = pass(T, looked, w, hover);
  const p2 = pass(T, sharper, w2, hover);
  const p = p2.active ? p2 : p1;
  return {
    pile: 0,
    sweep: 1,
    slip: { opacity: 1, inDrawer: 1 },
    drawers: [Math.max(p1.d0, p2.d0), 0, Math.max(p1.d2, p2.d2)],
    glow: 0.4,
    lens: { opacity: 1, x: p.x, y: p.y, question: 0 },
    clean: short ? 0 : ease(T, clean - 0.2, 0.4) * (1 - ease(T, looked - 0.2, 0.5)),
    found: [Math.max(p1.found[0], p2.found[0]), 0, Math.max(p1.found[1], p2.found[1])],
    peek: 1,
    ...none,
    unasked: { opacity: ease(T, never - 0.2, 0.4) * (short ? 1 : 1 - ease(T, forty - 0.6, 0.4)), strike: ease(T, message, 0.4) },
    tags: ease(T, looked - 0.4, 0.4),
    stat: short ? 0 : ease(T, forty - 0.1, 0.4),
    line: short ? 0 : ease(T, plain - 0.1, 0.5),
  };
}
