// Pure state of the story scene (added 2026-10-21): the real situation the series starts from,
// told before any condition or number. Two chat windows; a piece from the clipboard, meant for
// one of them, lands in the other (the wrong chat). Then the reply simply plays along. Then the
// two questions the video answers: what would make it suspect a mistake, and how to take it back.
// Same props and look as PieceInspector / RepairFork. No Remotion or React here.
import type { Label } from '../types.ts';
import { easeIn, easeInOut, flashAt, turn } from './motion.ts';
import { beatAt, easeOutCubic, fit, progress, sceneTime } from './steps.ts';

export type PSProps = {
  /** Window titles: the chat the paste was meant for, and the one it lands in. */
  titles?: [Label, Label];
  /** Small labels under the two windows ("meant for this one" / "pasted here"). */
  under?: [Label, Label];
  /** Tag on the clipboard on the second beat ("on purpose"). */
  purpose?: Label;
  /** Stamp on the model's reply ("played along"). */
  reply?: Label;
  /** The two questions, one per beat (third and fourth lines). */
  questions?: [Label, Label];
};

export type PSState = {
  windows: { appear: number; dim: number };
  clip: { appear: number; tag: number };
  /** The pasted piece: 0 on the clipboard, 1 seated in the wrong chat's hole. */
  fly: { progress: number };
  flash: number;
  wrong: { opacity: number };
  labels: { opacity: number[] };
  bubble: { appear: number; typed: number; stamp: number };
  /** The pasted piece lifted out again and turned over (the "suspect a mistake" gesture). */
  lift: { progress: number; flip: number };
  back: { draw: number };
  cards: { pop: number[] };
};

export function frameState(p: PSProps, t0: number, beats: number[], dur: number): PSState {
  const t = sceneTime(Number.isFinite(t0) ? t0 : 0, dur);
  const D = Number.isFinite(dur) && dur > 0 ? dur : 0;
  const b0 = beatAt(beats, 0);
  const b1 = beats.length > 1 ? beatAt(beats, 1) : b0 + 2.6;
  const b2 = beats.length > 2 ? beatAt(beats, 2) : b1 + 3;
  const b3 = beats.length > 3 ? beatAt(beats, 3) : b2 + 2.2;
  const at = (s: number, len: number) => progress(t, fit(s, len, D), len);

  // Beat 0: the two chats and the clipboard; the piece flies into the wrong one.
  const flyAt = fit(b0 + 0.75, 1.0, D);
  const fly = easeInOut(progress(t, flyAt, 1.0));
  // Beat 2: the story steps back; the piece is lifted and turned over.
  const away = at(b2, 0.4);
  return {
    windows: { appear: easeOutCubic(at(0, 0.5)), dim: 0.6 * away },
    clip: { appear: easeOutCubic(at(0.1, 0.4)) * (1 - 0.6 * away), tag: easeOutCubic(at(b1 + 0.05, 0.3)) * (1 - away) },
    fly: { progress: fly },
    flash: flashAt(t, flyAt + 1.0, 0.4),
    wrong: { opacity: at(b0 + 1.75, 0.3) * (1 - away) },
    labels: { opacity: [at(b0 + 0.4, 0.3) * (1 - away), at(b0 + 1.75, 0.3) * (1 - away)] },
    bubble: {
      appear: easeOutCubic(at(b1 + 0.6, 0.35)) * (1 - away),
      typed: at(b1 + 0.75, 1.1),
      stamp: easeIn(at(b1 + 1.9, 0.3)) * (1 - away),
    },
    lift: { progress: easeInOut(at(b2 + 0.2, 0.7)), flip: turn(t, fit(b2 + 0.9, 0.6, D), 0.6) },
    back: { draw: easeInOut(at(b3 + 0.5, 0.6)) },
    cards: { pop: [easeOutCubic(at(b2 + 0.3, 0.4)), easeOutCubic(at(b3 + 0.05, 0.4))] },
  };
}
