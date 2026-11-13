// The clipboard form with fixed boxes (rows 36-44). See ClipboardForm.state.ts.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { SHELF0, lerp } from './memory.ts';
import {
  FULL_TEXT,
  MARGIN_TEXT,
  NAMED_LABEL,
  NAMED_VALUE,
  NOTES_TEXT,
  RUNS,
  SECOND_TEXT,
  ZERO_TEXT,
  frameState,
  type ClipboardFormProps,
} from './ClipboardForm.state.ts';
import { Badge, Board, Frame, Page, Rack, Slip } from './office.tsx';
import { place } from './canvas.ts';

export { frameState };
export type { ClipboardFormProps };

type At = { x: number; y: number };

/**
 * Layout (frame pixels), per format. The board holds six rows: SHELF 0, two shelf rows, LAST
 * EVENT, the named box and the notes box (the last two only in the margin scene).
 * - vertical: the board fills the stage; the figures sit in the margin column at the right.
 * - landscape: the board at the left; the figures, the counter, the cascade and the day's record
 *   in the free space at the right.
 */
const LAYOUT = {
  v: {
    board: { x: 110, y: 330, w: 860, h: 860 },
    marginX: 720,
    row: { y0: 450, h: 112, labelX: 160, boxX: 380, boxW: 300, boxH: 86, value: 44, label: 36, small: 27 },
    grid: { x: 745, y: 572, cols: 4, cell: 40, gap: 8 },
    zero: { x: 840, y: 525, s: 0.8 },
    full: { x: 840, y: 925, s: 0.8 },
    second: { x: 840, y: 1012, size: 40 },
    notesFig: { x: 840, y: 1078, size: 40 },
    tags: false,
    counter: { x: 840, y: 520, size: 44 },
    ghost: { x: 840, bottom: 1160, h: 520, w: 170 },
    inset: { x: 770, y: 620 },
    cascade: { x: 760, y: 850, cols: 5, cell: 36 },
    record: { x: 360, y: 1040 },
    slipFrom: { x: 880, y: 1240 },
  },
  l: {
    board: { x: 190, y: 160, w: 840, h: 660 },
    marginX: 800,
    row: { y0: 258, h: 84, labelX: 222, boxX: 470, boxW: 290, boxH: 70, value: 40, label: 32, small: 28 },
    grid: { x: 1110, y: 316, cols: 8, cell: 52, gap: 12 },
    zero: { x: 1230, y: 212, s: 0.8 },
    full: { x: 1230, y: 572, s: 0.9 },
    second: { x: 1520, y: 584, size: 44 },
    notesFig: { x: 1230, y: 760, size: 44 },
    tags: true,
    counter: { x: 1400, y: 250, size: 52 },
    ghost: { x: 1400, bottom: 800, h: 460, w: 230 },
    inset: { x: 1180, y: 590 },
    cascade: { x: 1120, y: 220, cols: 5, cell: 56 },
    record: { x: 1560, y: 640 },
    slipFrom: { x: 1300, y: 820 },
  },
};

const textW = (text: string, size: number) => text.length * size * 0.56;

/** A hand-drawn scribble (an entry being written), drawn in with `p`. */
const Scribble: React.FC<{ x: number; y: number; w: number; p: number; color?: string }> = ({ x, y, w, p, color = C.muted }) =>
  p > 0 ? (
    <path
      d={`M ${x} ${y} q ${w * 0.08} -22 ${w * 0.16} 0 t ${w * 0.16} 0 t ${w * 0.16} 0 t ${w * 0.16} 0 t ${w * 0.16} 0`}
      fill="none"
      stroke={color}
      strokeWidth={6}
      strokeLinecap="round"
      pathLength={1}
      strokeDasharray={`${Math.min(1, p)} 1`}
    />
  ) : null;

/** A figure in a rounded frame, centred on (x, y). */
const Figure: React.FC<{ at: At & { s: number }; text: string; color: string; opacity: number; pop?: number; tag?: string; tags: boolean }> = ({ at, text, color, opacity, pop = 1, tag, tags }) =>
  opacity > 0 ? (
    <g opacity={opacity} transform={`translate(${at.x} ${at.y}) scale(${at.s * (1.3 - 0.3 * pop)})`}>
      <rect x={-110} y={-56} width={220} height={100} rx={18} fill={C.bg0} stroke={color} strokeWidth={5} />
      <text x={0} y={20} textAnchor="middle" fontSize={60} fontWeight={800} fill={color}>
        {text}
      </text>
      {tags && tag && (
        <text x={0} y={84} textAnchor="middle" fontSize={30} fontWeight={600} fill={C.muted}>
          {tag}
        </text>
      )}
    </g>
  ) : null;

export const ClipboardForm: React.FC<AnimProps & ClipboardFormProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const L = place(p.vertical, LAYOUT);
  const R = L.row;
  const rowY = (i: number) => R.y0 + i * R.h;
  const v = s.value;
  const y0 = rowY(0);
  const vx = R.boxX + 22;
  const vy = y0 + R.boxH / 2 + R.value * 0.36;
  const rewriting = v.next !== '' && v.strike > 0;
  const nextShown = v.next.slice(0, Math.ceil(v.next.length * v.write));
  const oldShown = v.next ? v.text : v.text.slice(0, Math.ceil(v.text.length * v.write));
  const penX = vx + textW(v.next || v.text, R.value) * s.pen.prog;
  const slipTo = { x: R.boxX + R.boxW / 2, y: y0 + R.boxH / 2 };
  const lastY = rowY(3);
  const namedY = rowY(4);
  const notesY = rowY(5);
  const margin = p.mode === 'margin';
  const box = (y: number, lit: number, color: string = C.ok, dim = 0) => (
    <rect
      x={R.boxX}
      y={y}
      width={R.boxW}
      height={R.boxH}
      rx={12}
      fill={C.bg1}
      stroke={lit > 0.05 ? alpha(color, 0.5 + 0.5 * lit) : alpha(C.accentText, (0.35 + 0.65 * s.boxes) * (1 - 0.6 * dim))}
      strokeWidth={lit > 0.05 ? 6 : 4}
      style={lit > 0.05 ? { filter: `drop-shadow(0 0 ${18 * lit}px ${alpha(color, 0.6 * lit)})` } : undefined}
    />
  );
  const label = (y: number, text: string, size: number, opacity = 1) => (
    <text x={R.labelX} y={y + R.boxH / 2 + size * 0.36} fontSize={size} fontWeight={800} fill={C.text} letterSpacing={1} opacity={opacity}>
      {text}
    </text>
  );
  // The ghost stack beside the form (the record a form does not keep), growing with the steps.
  const ghostH = L.ghost.h * s.ghost;
  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Frame vertical={p.vertical} design="both">
        <Board x={L.board.x} y={L.board.y} w={L.board.w} h={L.board.h} lit={1} />
        {/* the margin rule */}
        <rect x={L.marginX} y={L.board.y + 100} width={4} height={L.board.h - 130} fill={alpha(C.marker, 0.55)} />
        {/* rows 0-3: SHELF 0, two shelf rows, LAST EVENT */}
        {[0, 1, 2, 3].map((i) => {
          const y = rowY(i);
          const isShelf = i === 0;
          return (
            <g key={i} opacity={isShelf ? s.shelfRow : 1}>
              {isShelf ? (
                label(y, SHELF0, R.label)
              ) : i === 3 ? (
                label(y, 'LAST EVENT', R.small)
              ) : (
                <rect x={R.labelX} y={y + R.boxH / 2 - 8} width={150 - 18 * (i % 2)} height={16} rx={8} fill={alpha(C.muted, 0.6)} />
              )}
              {box(y, isShelf ? s.rowLit : 0)}
              {!isShelf && <Scribble x={R.boxX + 26} y={y + R.boxH / 2 + 6} w={(R.boxW - 60) * (i === 3 ? 0.9 : 0.7)} p={i === 3 && margin ? s.scribble : 1} />}
            </g>
          );
        })}
        {/* the SHELF 0 value: old value struck, new value written in the same box */}
        <g opacity={s.shelfRow}>
          <text x={vx} y={vy} fontSize={R.value} fontWeight={800} fill={C.text} opacity={rewriting ? 1 - v.write : 1}>
            {oldShown}
          </text>
          {rewriting && <rect x={vx - 6} y={vy - R.value * 0.36} width={(textW(v.text, R.value) + 12) * v.strike} height={6} rx={3} fill={C.marker} opacity={1 - v.write} />}
          {rewriting && (
            <text x={vx} y={vy} fontSize={R.value} fontWeight={800} fill={C.text}>
              {nextShown}
            </text>
          )}
        </g>
        {/* the box named after the fact, and the generic notes box (margin) */}
        {s.named.opacity > 0 && (
          <g opacity={s.named.opacity}>
            {label(namedY, NAMED_LABEL, R.small)}
            {box(namedY, Math.max(0.6, s.named.glow))}
            <text x={vx} y={namedY + R.boxH / 2 + R.value * 0.36} fontSize={R.value} fontWeight={800} fill={C.text}>
              {NAMED_VALUE.slice(0, Math.ceil(NAMED_VALUE.length * s.named.write))}
            </text>
          </g>
        )}
        {s.notes.opacity > 0 && (
          <g opacity={s.notes.opacity * (1 - 0.55 * s.notes.dim)}>
            {label(notesY, 'NOTES', R.small)}
            {box(notesY, 0, C.ok, s.notes.dim)}
            <Scribble x={R.boxX + 22} y={notesY + R.boxH / 2 + 6} w={(R.boxW - 50) * 0.9} p={s.notes.fill} />
          </g>
        )}
        {/* the pen */}
        {s.pen.opacity > 0 && (
          <g transform={`translate(${penX - 6} ${vy - 74})`} opacity={s.pen.opacity}>
            <path d="M 4 70 L 10 50 L 50 10 L 64 24 L 24 64 Z" fill={alpha(C.text, 0.92)} stroke={C.bg0} strokeWidth={3} strokeLinejoin="round" />
            <path d="M 4 70 L 10 50 L 24 64 Z" fill={C.warm} />
          </g>
        )}
        <Badge x={R.boxX + R.boxW + 2} y={y0 + 6} r={34} kind="tick" pop={s.tick} />
        {/* the fact jotted next to the last entry, wiped by the next one */}
        {s.margin.write > 0 && (
          <g transform={`rotate(-7 ${L.marginX + 110} ${lastY + 40})`} opacity={1 - s.margin.erase}>
            <text x={L.marginX + 22} y={lastY + 26} fontSize={R.small + 4} fontWeight={700} fontStyle="italic" fill={C.marker}>
              {MARGIN_TEXT.slice(0, Math.ceil(9 * Math.min(1, s.margin.write * 2)))}
            </text>
            <text x={L.marginX + 30} y={lastY + 26 + R.small + 14} fontSize={R.small + 4} fontWeight={700} fontStyle="italic" fill={C.marker}>
              {MARGIN_TEXT.slice(9, 9 + Math.ceil(10 * Math.max(0, s.margin.write * 2 - 1))).trim()}
            </text>
          </g>
        )}
        {s.eraser > 0 && (
          <g transform={`translate(${lerp(L.marginX + 10, L.marginX + 170, s.margin.erase)} ${lastY - 10}) rotate(-20)`} opacity={s.eraser}>
            <rect x={0} y={0} width={60} height={96} rx={12} fill={alpha(C.marker, 0.85)} stroke={C.bg0} strokeWidth={3} />
            <rect x={0} y={60} width={60} height={36} rx={10} fill={C.text} />
          </g>
        )}
        {/* the figures of the margin scene */}
        <Figure at={L.zero} text={ZERO_TEXT} color={C.marker} opacity={s.zero * (1 - 0.6 * s.grid.opacity)} pop={s.zero} tag="no box" tags={L.tags} />
        {s.grid.opacity > 0 && (
          <g opacity={s.grid.opacity}>
            {Array.from({ length: RUNS }, (_, i) => {
              const g = L.grid;
              const cx = g.x + (i % g.cols) * (g.cell + g.gap);
              const cy = g.y + Math.floor(i / g.cols) * (g.cell + g.gap);
              const on = i < s.ticks;
              const k = g.cell / 54;
              return (
                <g key={i}>
                  <rect x={cx} y={cy} width={g.cell} height={g.cell} rx={10 * k} fill={on ? alpha(C.ok, 0.22) : C.bg1} stroke={on ? C.ok : alpha(C.muted, 0.5)} strokeWidth={3} />
                  {on && <path d={`M ${cx + 14 * k} ${cy + 28 * k} L ${cx + 24 * k} ${cy + 38 * k} L ${cx + 41 * k} ${cy + 17 * k}`} fill="none" stroke={C.ok} strokeWidth={5 * k} strokeLinecap="round" strokeLinejoin="round" />}
                </g>
              );
            })}
          </g>
        )}
        <Figure at={L.full} text={FULL_TEXT} color={C.ok} opacity={s.full} pop={s.full} tag="named box" tags={L.tags} />
        {s.second > 0 && (
          <g opacity={s.second}>
            <text x={L.second.x} y={L.second.y} textAnchor="middle" fontSize={L.second.size} fontWeight={800} fill={alpha(C.ok, 0.8)}>
              {SECOND_TEXT}
            </text>
            {L.tags && (
              <text x={L.second.x} y={L.second.y + 40} textAnchor="middle" fontSize={28} fontWeight={600} fill={C.muted}>
                second model
              </text>
            )}
          </g>
        )}
        {s.notes.label > 0 && (
          <g opacity={s.notes.label * (1 - 0.5 * s.notes.dim)}>
            <text x={L.notesFig.x} y={L.notesFig.y} textAnchor="middle" fontSize={L.notesFig.size} fontWeight={800} fill={C.warm}>
              {NOTES_TEXT}
            </text>
            {L.tags && (
              <text x={L.notesFig.x} y={L.notesFig.y + 40} textAnchor="middle" fontSize={28} fontWeight={600} fill={C.muted}>
                notes box
              </text>
            )}
          </g>
        )}
        {/* the step counter and the ghost stack (replace) */}
        {s.counter.opacity > 0 && (
          <g opacity={s.counter.opacity}>
            <text x={L.counter.x} y={L.counter.y} textAnchor="middle" fontSize={L.counter.size} fontWeight={800} fill={C.text}>
              {`step ${s.counter.step}`}
            </text>
            {ghostH > 1 &&
              Array.from({ length: Math.ceil(ghostH / 14) }, (_, i) => (
                <rect
                  key={i}
                  x={L.ghost.x - L.ghost.w / 2 + ((i * 7) % 11) - 5}
                  y={L.ghost.bottom - (i + 1) * 14}
                  width={L.ghost.w}
                  height={11}
                  rx={3}
                  fill="none"
                  stroke={alpha(C.muted, 0.45)}
                  strokeWidth={2}
                  strokeDasharray="8 6"
                />
              ))}
          </g>
        )}
        {/* the cascade of mistakes from the one wrong box (wrong) */}
        {s.cascade > 0 &&
          Array.from({ length: s.cascade }, (_, i) => {
            const c = L.cascade;
            return <Badge key={i} x={c.x + (i % c.cols) * c.cell + c.cell / 2} y={c.y + Math.floor(i / c.cols) * c.cell + c.cell / 2} r={c.cell * 0.36} kind="cross" pop={1} />;
          })}
        {/* the day's record: fading away, then back beside the form */}
        {s.pages > 0 && [0, 1, 2].map((k) => <Page key={k} x={L.record.x + 14 * k} y={L.record.y - 26 * k} w={210} rot={-8 + 6 * k} opacity={s.pages} />)}
        {s.mismatch > 0 && (
          <g opacity={s.mismatch}>
            <rect x={R.boxX - 10} y={y0 - 10} width={R.boxW + 20} height={R.boxH + 20} rx={16} fill="none" stroke={C.marker} strokeWidth={6} />
            <rect x={L.record.x - 135} y={L.record.y - 140} width={300} height={220} rx={16} fill="none" stroke={C.marker} strokeWidth={6} />
          </g>
        )}
        <Badge x={L.record.x + 130} y={L.record.y - 120} r={34} kind="tick" pop={s.follow} />
        {/* the real shelf 0, empty, beside the confident box */}
        {s.inset > 0 && (
          <g opacity={s.inset}>
            <Rack x={L.inset.x} y={L.inset.y} w={170} h={140} bays={1} pallets={[0]} upper={false} s={0.8} />
          </g>
        )}
        <Slip x={lerp(L.slipFrom.x, slipTo.x, s.slip.fly)} y={lerp(L.slipFrom.y, slipTo.y, s.slip.fly)} w={lerp(230, 150, s.slip.fly)} rot={lerp(10, -3, s.slip.fly)} opacity={s.slip.opacity} />
      </Frame>
    </AbsoluteFill>
  );
};
