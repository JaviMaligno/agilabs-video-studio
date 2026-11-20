// Pure state of the warehouse (scenes 2-3).
// - day: the robot shuttles pallets between the shelves; halfway through, the red slip drops onto
//   its desk and shelf 0's pallet turns into a dashed outline (the record said a pallet, the shelf
//   is empty). Marks: [told, empty].
// - later: hours pass (the clock spins), a new pallet waits on the conveyor, shelf 0 glows and a
//   question mark rises over the robot. Marks: [hours, still].
// No Remotion or React here.
import { blinkAt, bump, beatOr, ease, lerp, loopTime, mark, pickMode } from './memory.ts';
import { sceneTime } from './steps.ts';

export const WAREHOUSE_MODES = ['day', 'later'] as const;
export type WarehouseMode = (typeof WAREHOUSE_MODES)[number];
export type WarehouseShelvesProps = { mode: WarehouseMode; marks?: number[] };

/** Floor positions the robot drives between (x of its centre), and where it stops by the desk. */
export const ROBOT_PATH = { mid: 400, amp: 200, desk: 720 } as const;

export type WarehouseState = {
  robot: { x: number; carry: number; bob: number; face: number; blink: number };
  /** Pallet on each lower shelf (index 0 = shelf 0), as opacity. */
  pallets: number[];
  /** Shelf 0: the dashed outline left where the record says a pallet is. */
  ghost: number;
  slip: { opacity: number; drop: number };
  clock: { opacity: number; hour: number; minute: number };
  conveyor: { opacity: number; arrive: number };
  glow: number;
  question: number;
};

export function frameState(props: WarehouseShelvesProps, t: number, beats: number[], dur: number): WarehouseState {
  const mode = pickMode(props.mode, WAREHOUSE_MODES);
  const T = sceneTime(Number.isFinite(t) ? t : 0, dur);
  const tm = loopTime(t, dur);
  const m = props.marks;
  const b0 = beatOr(beats, 0, 0);
  const blink = blinkAt(tm, 2.3);

  if (mode === 'day') {
    const b1 = beatOr(beats, 1, b0 + 3.2);
    const told = mark(m, 0, b1 + 0.4);
    const empty = mark(m, 1, b1 + 2.4);
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
      pallets: [1 - ghost, 1, 1],
      ghost,
      slip: { opacity: ease(T, told - 0.1, 0.2), drop: ease(T, told, 0.9) },
      clock: { opacity: 0, hour: 300, minute: 0 },
      conveyor: { opacity: 0, arrive: 0 },
      glow: bump(T, empty, 1.2),
      question: 0,
    };
  }

  // later
  const hours = mark(m, 0, b0 + 0.1);
  const still = mark(m, 1, b0 + 1.2);
  const spin = ease(T, hours - 0.1, 1.6);
  return {
    robot: { x: ROBOT_PATH.desk, carry: 0, bob: 0, face: 1, blink },
    pallets: [0, 1, 1],
    ghost: 1,
    slip: { opacity: 1, drop: 1 },
    clock: { opacity: ease(T, 0, 0.35), hour: 300 + 120 * spin, minute: 1440 * spin },
    conveyor: { opacity: ease(T, 0, 0.35), arrive: ease(T, hours + 0.2, 1.4) },
    glow: ease(T, still, 0.5),
    question: ease(T, still + 0.2, 0.4),
  };
}
