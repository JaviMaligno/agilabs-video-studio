// Pure state of the warehouse (the cold open, rows 1-2).
// - day: noon (the clock at 12:00); the robot shuttles pallets between the shelves; the red slip
//   drops onto its desk, shelf 0's pallet turns into a dashed outline (the shelf is empty), and
//   shelf 0 glows green with "next pallet → here". Marks: [told, empty, next].
// - later: the clock spins from 12:00 to 2:00; the next pallet glides along the rack, straight
//   past the glowing shelf 0, onto another shelf; a red cross; a question mark over the robot
//   ("as if nobody had told it"). Marks: [hours, straight, nobody].
// No Remotion or React here.
import { blinkAt, beatOr, ease, lerp, loopTime, mark, pickMode } from './memory.ts';
import { sceneTime } from './steps.ts';

export const WAREHOUSE_MODES = ['day', 'later'] as const;
export type WarehouseMode = (typeof WAREHOUSE_MODES)[number];
export type WarehouseShelvesProps = { mode: WarehouseMode; marks?: number[] };

/**
 * Floor positions the robot drives between (x of its centre, in vertical frame pixels), and where
 * it stops by the desk. The landscape layout maps them onto its own floor.
 */
export const ROBOT_PATH = { mid: 400, amp: 200, desk: 720 } as const;
/** Bays on the rack's lower level; shelf 0 is the first, the pallet lands on the last. */
export const BAYS = 4;
export const LANDING_BAY = BAYS - 1;
export const HERE_TEXT = 'next pallet → here';
/** Clock hands, degrees (0 = 12 o'clock): noon, and two hours later. */
export const NOON = { hour: 0, minute: 0 } as const;
export const TWO = { hour: 60, minute: 720 } as const;
/** Length of the pallet's glide along the rack, in seconds. */
export const GLIDE = 2.2;

export type WarehouseState = {
  robot: { x: number; carry: number; bob: number; face: number; blink: number };
  /** Pallet on each lower shelf (index 0 = shelf 0), as opacity. */
  pallets: number[];
  /** Shelf 0: the dashed outline left where the record says a pallet is. */
  ghost: number;
  slip: { opacity: number; drop: number };
  clock: { opacity: number; hour: number; minute: number };
  /** The new pallet gliding along the rack: 0 = before shelf 0, 1 = on the landing bay. */
  pallet: { opacity: number; move: number };
  /** Shelf 0's glow (the right place for the next pallet) and its "next pallet → here" label. */
  glow: number;
  here: number;
  cross: number;
  question: number;
};

export function frameState(props: WarehouseShelvesProps, t: number, beats: number[], dur: number): WarehouseState {
  const mode = pickMode(props.mode, WAREHOUSE_MODES);
  const T = sceneTime(Number.isFinite(t) ? t : 0, dur);
  const tm = loopTime(t, dur);
  const m = props.marks;
  const b0 = beatOr(beats, 0, 0);
  const blink = blinkAt(tm, 2.3);
  const lower = (landed: number, ghost: number) => Array.from({ length: BAYS }, (_, i) => (i === 0 ? 1 - ghost : i === LANDING_BAY ? landed : 1));

  if (mode === 'day') {
    const b1 = beatOr(beats, 1, b0 + 3.2);
    const told = mark(m, 0, b0 + 2.4);
    const empty = Math.max(told, mark(m, 1, b0 + 4.0));
    const next = Math.max(empty + 0.3, mark(m, 2, b1 + 0.6));
    const park = ease(T, told, 0.8);
    const shuttle = ROBOT_PATH.mid + ROBOT_PATH.amp * Math.sin(tm * 1.1);
    const heading = Math.cos(tm * 1.1);
    const ghost = ease(T, empty, 0.6);
    return {
      robot: {
        x: lerp(shuttle, ROBOT_PATH.desk, park),
        carry: Math.min(1, Math.max(0, 0.5 + 2 * heading)) * (1 - park),
        bob: Math.sin(tm * 9) * (1 - park),
        face: park > 0.5 || heading >= 0 ? 1 : -1,
        blink,
      },
      pallets: lower(0, ghost),
      ghost,
      slip: { opacity: ease(T, told - 0.1, 0.2), drop: ease(T, told, 0.9) },
      clock: { opacity: 1, ...NOON },
      pallet: { opacity: 0, move: 0 },
      glow: ease(T, empty + 0.2, 0.5),
      here: ease(T, next - 0.1, 0.4),
      cross: 0,
      question: 0,
    };
  }

  // later
  const hours = mark(m, 0, b0 + 0.1);
  const straight = Math.max(hours + 1.2, mark(m, 1, b0 + 2.6));
  const nobody = Math.max(straight + GLIDE, mark(m, 2, b0 + 5.4));
  const spin = ease(T, hours - 0.1, 1.6);
  const move = ease(T, straight - 0.8, GLIDE);
  return {
    robot: { x: ROBOT_PATH.desk, carry: 0, bob: 0, face: 1, blink },
    pallets: lower(move >= 1 ? 1 : 0, 1),
    ghost: 1,
    slip: { opacity: 1, drop: 1 },
    clock: { opacity: 1, hour: lerp(NOON.hour, TWO.hour, spin), minute: lerp(NOON.minute, TWO.minute, spin) },
    pallet: { opacity: ease(T, hours, 0.4) * (move >= 1 ? 0 : 1), move },
    glow: 1,
    here: 1,
    cross: ease(T, straight - 0.8 + GLIDE, 0.35),
    question: ease(T, nobody - 0.2, 0.4),
  };
}
