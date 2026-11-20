// Pure state of the filing cabinet: a notebook the agent can search (scenes 8-9).
// - file: the desk is swept clean; every page, the red slip too, slides into a drawer; the cabinet
//   glows (nothing is lost); a magnifier hovers and a question mark rises over it.
//   Marks: [clear, nothing, search, know].
// - miss: the clean desk says nothing; the magnifier opens other drawers and turns up other pages;
//   the slip stays in its drawer; on the small rack the pallet goes onto the wrong shelf, cross.
//   Marks: [clean, looked, never, message].
// No Remotion or React here.
import { beatOr, bump, ease, lerp, loopTime, mark, pickMode } from './memory.ts';
import { sceneTime } from './steps.ts';

export const CABINET_MODES = ['file', 'miss'] as const;
export type CabinetMode = (typeof CABINET_MODES)[number];
export type FilingCabinetProps = { mode: CabinetMode; marks?: number[] };

/** The cabinet (frame pixels) and the drawer that holds the slip. */
export const CAB = { x: 110, y: 560, w: 300, h: 540, drawers: 3, open: 170 } as const;
export const SLIP_DRAWER = 1;
/** Centre of drawer `i`'s handle when open by `d` (where the magnifier looks). */
export const drawerSpot = (i: number, d = 1) => ({ x: CAB.x + CAB.w + CAB.open * d - 40, y: CAB.y + (i + 0.5) * (CAB.h / CAB.drawers) - 70 });

export type FilingCabinetState = {
  /** The desk pile still on the desk (1 = all there). */
  pile: number;
  sweep: number;
  slip: { opacity: number; inDrawer: number };
  drawers: number[];
  glow: number;
  lens: { opacity: number; x: number; y: number; question: number };
  clean: number;
  /** Per drawer: a page it turned up, lifted out (opacity). */
  found: number[];
  /** The slip's corner peeking out of its closed drawer. */
  peek: number;
  inset: { opacity: number; move: number; cross: number };
};

export function frameState(props: FilingCabinetProps, t: number, beats: number[], dur: number): FilingCabinetState {
  const mode = pickMode(props.mode, CABINET_MODES);
  const T = sceneTime(Number.isFinite(t) ? t : 0, dur);
  const tm = loopTime(t, dur);
  const m = props.marks;
  const b0 = beatOr(beats, 0, 0);
  const b1 = beatOr(beats, 1, b0 + 3.0);
  const hover = { x: CAB.x + CAB.w / 2 + 40 * Math.sin(tm * 2.1), y: CAB.y - 90 + 14 * Math.cos(tm * 2.9) };

  if (mode === 'file') {
    const b2 = beatOr(beats, 2, b1 + 1.4);
    const clear = mark(m, 0, b0 + 0.4);
    const nothing = mark(m, 1, b1 + 0.1);
    const search = mark(m, 2, b2 + 0.9);
    const know = mark(m, 3, b2 + 2.0);
    const sweep = ease(T, clear, 1.1);
    const open = ease(T, clear - 0.3, 0.4) * (1 - ease(T, clear + 1.2, 0.4));
    return {
      pile: 1 - sweep,
      sweep,
      slip: { opacity: 1, inDrawer: sweep },
      drawers: [0, open, 0],
      glow: ease(T, nothing - 0.1, 0.4),
      lens: { opacity: ease(T, search - 0.2, 0.4), x: hover.x, y: hover.y, question: ease(T, know, 0.4) },
      clean: 0,
      found: [0, 0, 0],
      peek: ease(T, clear + 1.4, 0.4),
      inset: { opacity: 0, move: 0, cross: 0 },
    };
  }

  // miss
  const clean = mark(m, 0, b0 + 0.8);
  const looked = mark(m, 1, b1 + 0.4);
  const never = mark(m, 2, b1 + 2.6);
  const message = mark(m, 3, b1 + 3.4);
  const w = Math.max(1.2, (never - looked) / 2);
  const d0 = ease(T, looked, 0.4) * (1 - ease(T, looked + 0.75 * w, 0.4));
  const d2 = ease(T, looked + w, 0.4) * (1 - ease(T, looked + 1.75 * w, 0.4));
  const toFirst = ease(T, looked - 0.3, 0.4);
  const toSecond = ease(T, looked + w - 0.3, 0.4);
  const back = ease(T, looked + 1.75 * w, 0.4);
  const s0 = drawerSpot(0);
  const s2 = drawerSpot(2);
  const x = lerp(lerp(lerp(hover.x, s0.x, toFirst), s2.x, toSecond), hover.x, back);
  const y = lerp(lerp(lerp(hover.y, s0.y, toFirst), s2.y, toSecond), hover.y, back);
  return {
    pile: 0,
    sweep: 1,
    slip: { opacity: 1, inDrawer: 1 },
    drawers: [d0, 0, d2],
    glow: 0.4,
    lens: { opacity: 1, x, y, question: 0 },
    clean: ease(T, clean - 0.2, 0.4) * (1 - ease(T, looked - 0.2, 0.5)),
    found: [bump(T, looked + 0.3, 0.75 * w), 0, bump(T, looked + w + 0.3, 0.75 * w)],
    peek: 1,
    inset: { opacity: ease(T, never - 0.3, 0.4), move: ease(T, message - 0.2, 0.9), cross: ease(T, message + 0.7, 0.35) },
  };
}
