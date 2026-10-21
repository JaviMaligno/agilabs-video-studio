// PinnedNote: one memory, a note pinned over the repository it describes. The note never changes
// on its own; the tree under it does. Threads run from the note to the files it claims exist:
// taut while they are there, slack once they are gone, and the note's edge drifts teal -> rose.
// Pure state: no Remotion or React, so it is tested with plain `node --test`.
import { beatAt, fit, progress, sceneTime } from './steps.ts';
import { OLD_ROWS, TREE, ease, lerp, pop, wave } from './memory.ts';

export type PinnedMode = 'hook' | 'drift' | 'stamp' | 'close';
export type PinnedNoteProps = { mode: PinnedMode; blend?: boolean };

export type RowState = { opacity: number; h: number; pulse: number };
export type ThreadState = { draw: number; slack: number };

export type PinnedFrame = {
  mode: PinnedMode;
  note: { opacity: number; dy: number; pin: number; edge: number; underline: number; rewrite: number; written: number };
  tree: { opacity: number; dy: number; jitter: number };
  rows: RowState[];
  /** Threads to rows a, b, c (the per-article workflows) and to the queue file. */
  threads: ThreadState[];
  calendar: { opacity: number; month: number };
  stamps: number[];
  close: { chip: number; pen: number; stamp: number; second: number; tag: number };
};

const rowsAt = (T: number, mode: PinnedMode, b0: number, dur: number): RowState[] =>
  TREE.map((r, i) => {
    if (r.old) {
      const k = OLD_ROWS.indexOf(i);
      if (mode === 'hook') return { opacity: 1, h: 1, pulse: 0 };
      if (mode === 'drift') {
        const s = fit(b0 + 0.5 + 0.4 * k, 0.45, dur);
        const gone = ease(T, s, 0.45);
        return { opacity: 1 - gone, h: 1 - gone, pulse: 0 };
      }
      return { opacity: 0, h: 0, pulse: 0 };
    }
    if (r.fresh) {
      if (mode === 'hook') return { opacity: 0, h: 0, pulse: 0 };
      if (mode === 'drift') {
        const s = fit(b0 + 1.75, 0.5, dur);
        return { opacity: ease(T, s, 0.5), h: ease(T, s, 0.35), pulse: 0 };
      }
      return { opacity: 1, h: 1, pulse: 0 };
    }
    return { opacity: 1, h: 1, pulse: 0 };
  });

export const frameState = (props: PinnedNoteProps, t: number, beats: number[], dur: number): PinnedFrame => {
  const T = sceneTime(t, dur);
  const mode = props.mode;
  const b0 = beatAt(beats, 0);
  const b1 = beats.length > 1 ? beatAt(beats, 1) : b0 + 1.2;
  const b2 = beats.length > 2 ? beatAt(beats, 2) : b1 + 1.2;

  const s: PinnedFrame = {
    mode,
    note: { opacity: 1, dy: 0, pin: 1, edge: 1, underline: 0, rewrite: 0, written: 1 },
    tree: { opacity: 1, dy: 0, jitter: 0 },
    rows: rowsAt(T, mode, b0, dur),
    threads: [0, 1, 2, 3].map(() => ({ draw: 0, slack: 0 })),
    calendar: { opacity: 1, month: 2 },
    stamps: [0, 0],
    close: { chip: 0, pen: 0, stamp: 0, second: 0, tag: 0 },
  };

  if (mode === 'hook') {
    // The note drops in and pins itself; the tree is already there.
    const inS = fit(Math.max(0, b0 - 0.1), 0.7, dur);
    const drop = ease(T, inS, 0.7);
    s.note.opacity = progress(T, inS, 0.35);
    s.note.dy = lerp(-260, 0, drop);
    s.note.pin = pop(T, fit(inS + 0.6, 0.3, dur), 0.3);
    s.note.edge = 0;
    s.calendar = { opacity: progress(T, fit(b1, 0.4, dur), 0.4), month: 0 };
    // "true in July": the date tag, and the threads find their files.
    s.note.written = pop(T, fit(b1 + 0.1, 0.35, dur));
    s.threads = [0, 1, 2, 3].map((k) => ({ draw: k < 3 ? ease(T, fit(b1 + 0.3 + 0.12 * k, 0.5, dur), 0.5) : 0, slack: 0 }));
    // "one workflow per article": the line underlines itself, the three files pulse with it.
    s.note.underline = ease(T, fit(b2 + 0.2, 0.6, dur), 0.6);
    const on = progress(T, fit(b2 + 0.2, 0.3, dur), 0.3);
    s.rows = s.rows.map((r, i) => (TREE[i].old ? { ...r, pulse: on * wave(T - b2, 1.4) } : r));
    return s;
  }

  if (mode === 'drift') {
    // Time runs July -> September; the workflows go one by one, the queue file arrives. The note
    // does not move. Each thread goes slack as its file disappears; the edge drifts teal -> rose.
    s.calendar = { opacity: 1, month: lerp(0, 2, ease(T, fit(b0 + 0.1, 2.2, dur), 2.2)) };
    s.note.underline = 1;
    s.threads = [0, 1, 2, 3].map((k) =>
      k < 3 ? { draw: 1, slack: ease(T, fit(b0 + 0.55 + 0.4 * k, 0.6, dur), 0.6) } : { draw: 0, slack: 0 },
    );
    s.note.edge = ease(T, fit(b0 + 0.8, 1.8, dur), 1.8);
    return s;
  }

  if (mode === 'stamp') {
    // Two stamps on two beats; the world keeps moving a little, the note stays still.
    s.note.underline = 1;
    s.threads = [0, 1, 2].map(() => ({ draw: 1, slack: 1 })).concat([{ draw: 0, slack: 0 }]);
    // Nothing moves during the first 0.6 s: the scene blends in from the drift over that time.
    s.stamps = [pop(T, fit(Math.max(b0 + 0.15, 0.95), 0.35, dur)), pop(T, fit(b1 + 0.4, 0.35, dur))];
    s.tree.jitter = Math.sin((T % 1000) * 2.1) * 6;
    // Make room for the stamps: the tree steps down, the calendar has done its job.
    s.tree.dy = lerp(0, 150, ease(T, fit(0.6, 0.45, dur), 0.45));
    s.calendar.opacity = 1 - progress(T, fit(0.6, 0.3, dur), 0.3);
    return s;
  }

  // close: the work ends, the note is rewritten in the same moment and goes teal again; then a new
  // note for a situation in progress gets its IN PROGRESS tag.
  s.calendar.opacity = 0;
  s.note.underline = 0;
  s.close.chip = pop(T, fit(b0 + 0.3, 0.4, dur));
  s.close.pen = ease(T, fit(b0 + 0.9, 1.1, dur), 1.1);
  s.note.rewrite = s.close.pen;
  s.note.edge = 1 - ease(T, fit(b0 + 1.2, 0.9, dur), 0.9);
  s.threads = [0, 1, 2, 3].map((k) => (k < 3 ? { draw: 0, slack: 0 } : { draw: ease(T, fit(b0 + 1.6, 0.5, dur), 0.5), slack: 0 }));
  s.close.stamp = pop(T, fit(b0 + 2.1, 0.35, dur));
  const away = ease(T, fit(b1, 0.35, dur), 0.35);
  s.tree.opacity = 1 - away;
  s.tree.dy = lerp(70, 110, away);
  s.close.second = ease(T, fit(b1 + 0.35, 0.5, dur), 0.5);
  s.close.tag = pop(T, fit(b1 + 0.9, 0.4, dur));
  return s;
};
