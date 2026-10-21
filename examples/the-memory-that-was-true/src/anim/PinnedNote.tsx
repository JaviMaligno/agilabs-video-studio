// PinnedNote: one memory pinned over the repository it describes. State in PinnedNote.state.ts.
import React from 'react';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import { Stage } from './Stage.tsx';
import type { AnimProps } from './types.ts';
import { OLD_ROWS, QUEUE_ROW } from './memory.ts';
import { Hourglass, Pen, Pill, Pin, Stamp, Thread, Tree, clamp01, edgeColour, noteSurface, rowCentres } from './pieces.tsx';
import { frameState, type PinnedNoteProps } from './PinnedNote.state.ts';

/** Note and tree boxes in stage space (960 x 1090). */
const NOTE = { x: 110, y: 40, w: 740, h: 320 };
const TREE_BOX = { x: 60, y: 480, w: 840 };
const MONTHS = ['JUL', 'AUG', 'SEP'];

export const PinnedNote: React.FC<AnimProps & PinnedNoteProps> = ({ t, beats, dur, vertical, ...props }) => {
  const s = frameState(props, t, beats, dur);
  const edge = edgeColour(s.note.edge);
  const treeTop = TREE_BOX.y + s.tree.dy;
  const centres = rowCentres(treeTop, s.rows.map((r) => r.h));
  const threadX0 = NOTE.x + NOTE.w / 2;
  const threadY0 = NOTE.y + NOTE.h + s.note.dy - 6;
  const targets = [...OLD_ROWS, QUEUE_ROW];
  const rw = clamp01(s.note.rewrite);
  const oldStrike = clamp01(rw / 0.35);
  const oldFade = 1 - clamp01((rw - 0.35) / 0.15);
  const newReveal = clamp01((rw - 0.5) / 0.5);

  return (
    <Stage vertical={vertical} fill>
      {/* the repository */}
      <Tree x={TREE_BOX.x} y={treeTop} w={TREE_BOX.w} rows={s.rows} jitter={s.tree.jitter} opacity={s.tree.opacity} />

      {/* "work done" chip on the tree (close) */}
      {s.close.chip > 0 && s.tree.opacity > 0.02 && (
        <div style={{ position: 'absolute', left: 520, top: treeTop + 4, opacity: s.tree.opacity * clamp01(s.close.chip * 2), transform: `translateY(${(1 - s.close.chip) * -40}px)` }}>
          <Pill color={C.ok} size={32} filled>
            work done ✓
          </Pill>
        </div>
      )}

      {/* threads from the note to the files it claims exist */}
      <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} width={960} height={1090}>
        {s.threads.map((th, k) => {
          const row = targets[k];
          return (
            <Thread
              key={k}
              x0={threadX0}
              y0={threadY0}
              x1={k < 3 ? 862 : 640}
              y1={centres[row]}
              draw={th.draw * (k === 3 ? s.tree.opacity : 1)}
              slack={th.slack}
              color={C.ok}
            />
          );
        })}
      </svg>

      {/* the note */}
      <div
        style={{
          position: 'absolute',
          left: NOTE.x,
          top: NOTE.y + s.note.dy,
          width: NOTE.w,
          height: NOTE.h,
          opacity: s.note.opacity,
          ...noteSurface(edge, 6, 0.6),
          padding: '58px 44px 0',
          boxSizing: 'border-box',
          fontFamily,
        }}
      >
        <div style={{ fontSize: 36, fontWeight: 500, color: C.muted }}>To schedule an article:</div>
        <div style={{ position: 'relative', height: 80, marginTop: 14 }}>
          <div style={{ position: 'absolute', left: 0, top: 0, fontSize: 50, fontWeight: 800, color: C.text, whiteSpace: 'nowrap', opacity: oldFade }}>
            one workflow per article.
            <div style={{ position: 'absolute', left: 0, bottom: -6, height: 7, borderRadius: 4, width: `${100 * clamp01(s.note.underline)}%`, background: C.ok }} />
            <div style={{ position: 'absolute', left: 0, top: '52%', height: 6, borderRadius: 3, width: `${100 * oldStrike}%`, background: C.flag }} />
          </div>
          {newReveal > 0 && (
            <div style={{ position: 'absolute', left: 0, top: 0, fontSize: 50, fontWeight: 800, color: C.text, whiteSpace: 'nowrap', clipPath: `inset(0 ${100 * (1 - newReveal)}% 0 0)` }}>
              add it to the queue file.
            </div>
          )}
          {rw > 0.45 && rw < 1 && (
            <div style={{ position: 'absolute', left: 600 * newReveal - 8, top: -18 }}>
              <Pen size={56} color={C.accentText} />
            </div>
          )}
        </div>
        <div style={{ position: 'absolute', right: 30, bottom: 26, opacity: clamp01(s.note.written * 1.5), transform: `scale(${0.7 + 0.3 * clamp01(s.note.written)})`, transformOrigin: 'right bottom' }}>
          <Pill color={C.muted} size={28}>
            {rw > 0.5 ? 'updated' : 'written · July'}
          </Pill>
        </div>
      </div>
      <Pin x={NOTE.x + NOTE.w / 2} y={NOTE.y + s.note.dy + 4} s={1.3} on={s.note.pin * s.note.opacity} />

      {/* stamps */}
      <Stamp text="TRUE WHEN WRITTEN" color={C.ok} on={s.stamps[0]} x={330} y={NOTE.y + NOTE.h + 72} rot={-5} size={50} />
      <Stamp text="STALE NOW" color={C.flag} on={s.stamps[1]} x={650} y={NOTE.y + NOTE.h + 176} rot={4} size={60} />
      <Stamp text="UPDATE WHEN THE WORK ENDS" color={C.ok} on={s.close.stamp} x={480} y={NOTE.y + NOTE.h + 78} rot={-3} size={44} />

      {/* the calendar strip: time passing under the note */}
      {s.calendar.opacity > 0 && (
        <div style={{ position: 'absolute', left: 150, top: 960, width: 660, height: 84, opacity: s.calendar.opacity }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: 42, background: C.pane, border: `3px solid ${C.line}` }} />
          <div
            style={{
              position: 'absolute',
              top: 6,
              left: 6 + (s.calendar.month * (660 - 12)) / 3,
              width: (660 - 12) / 3,
              height: 72,
              borderRadius: 36,
              background: alpha(C.accent, 0.35),
              border: `3px solid ${C.accentText}`,
              boxSizing: 'border-box',
            }}
          />
          {MONTHS.map((m, i) => (
            <div
              key={m}
              style={{
                position: 'absolute',
                top: 0,
                left: 6 + (i * (660 - 12)) / 3,
                width: (660 - 12) / 3,
                height: 84,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily,
                fontSize: 34,
                fontWeight: 700,
                letterSpacing: 3,
                color: Math.abs(s.calendar.month - i) < 0.5 ? C.text : C.muted,
              }}
            >
              {m}
            </div>
          ))}
        </div>
      )}

      {/* close: a new note for a situation in progress, tagged as such */}
      {s.close.second > 0 && (
        <div
          style={{
            position: 'absolute',
            left: 100,
            top: 660 + (1 - s.close.second) * 120,
            width: 760,
            height: 300,
            opacity: s.close.second,
            ...noteSurface(alpha(C.accentText, 0.9), 5),
            padding: '62px 40px 0',
            boxSizing: 'border-box',
            fontFamily,
          }}
        >
          <div style={{ fontSize: 30, fontWeight: 500, color: C.muted }}>new memory</div>
          <div style={{ fontSize: 46, fontWeight: 800, color: C.text, marginTop: 10, lineHeight: 1.15 }}>article pending on its branch</div>
          <Pin x={180} y={4} s={1.1} on={1} />
          <div
            style={{
              position: 'absolute',
              right: -20,
              top: -58,
              opacity: clamp01(s.close.tag * 1.6),
              transform: `rotate(3deg) scale(${1.4 - 0.4 * clamp01(s.close.tag)})`,
            }}
          >
            <Pill color={C.accentText} size={34} filled>
              <Hourglass size={40} color={C.accentText} flow={clamp01(s.close.tag)} />
              IN PROGRESS
            </Pill>
          </div>
        </div>
      )}
    </Stage>
  );
};

