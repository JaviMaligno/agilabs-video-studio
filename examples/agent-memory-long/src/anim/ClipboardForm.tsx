// The clipboard form with fixed boxes (rows 28-34). See ClipboardForm.state.ts.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { lerp } from './memory.ts';
import {
  BOXES,
  FULL_TEXT,
  LAST_ROW,
  MARGIN_TEXT,
  NAMED_LABEL,
  NAMED_VALUE,
  NOTES_LABEL,
  NOT_SAVED,
  PANEL_NOTES,
  RIGHT_BOOKING,
  RUNS,
  SECOND_TEXT,
  ZERO_TEXT,
  frameState,
  type ClipboardFormProps,
} from './ClipboardForm.state.ts';
import { Badge, Board, Frame, Slip, glow } from './office.tsx';
import { Bubble, MemoryPanel } from './chat.tsx';
import { place } from './canvas.ts';

export { frameState };
export type { ClipboardFormProps };

type At = { x: number; y: number };

/**
 * Layout (frame pixels), per format. The board holds six rows: FLIGHT, HOTEL, DESTINATION, LAST
 * ENTRY, the named box and the notes box (the last two only in the margin scene).
 * - vertical: the board fills the stage; the figures sit in the margin column at the right.
 * - landscape: the board at the left; the figures, the right booking, the cascade and the Memory
 *   panel in the free space at the right.
 */
const LAYOUT = {
  v: {
    board: { x: 110, y: 330, w: 860, h: 860 },
    marginX: 720,
    row: { y0: 450, h: 112, labelX: 160, boxX: 400, boxW: 290, boxH: 86, value: 44, label: 36, small: 27 },
    grid: { x: 745, y: 572, cols: 4, cell: 40, gap: 8 },
    zero: { x: 840, y: 525, s: 0.8 },
    full: { x: 840, y: 925, s: 0.8 },
    second: { x: 840, y: 1012, size: 40 },
    tags: false,
    cascade: { x: 760, y: 850, cols: 5, cell: 36 },
    slipFrom: { x: 880, y: 1240 },
    booking: { x: 130, y: 244, size: 26, maxW: 820 },
    sun: { x: 860, y: 420, r: 44 },
    morningLabel: { x: 860, y: 540 },
    panel: { x: 330, y: 720, w: 660, size: 32 },
  },
  l: {
    board: { x: 190, y: 160, w: 840, h: 660 },
    marginX: 800,
    row: { y0: 258, h: 84, labelX: 222, boxX: 480, boxW: 290, boxH: 70, value: 40, label: 32, small: 28 },
    grid: { x: 1110, y: 316, cols: 8, cell: 52, gap: 12 },
    zero: { x: 1230, y: 212, s: 0.8 },
    full: { x: 1230, y: 572, s: 0.9 },
    second: { x: 1520, y: 584, size: 44 },
    tags: true,
    cascade: { x: 1160, y: 350, cols: 6, cell: 64 },
    slipFrom: { x: 1400, y: 700 },
    booking: { x: 1100, y: 200, size: 30, maxW: 640 },
    sun: { x: 1400, y: 330, r: 60 },
    morningLabel: { x: 1400, y: 480 },
    panel: { x: 1100, y: 230, w: 640, size: 36 },
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
  const label = (y: number, text: string, size: number, opacity = 1) => {
    // fitted into the space left of the boxes
    const fs = Math.min(size, (R.boxX - R.labelX - 18) / (text.length * 0.64));
    return (
      <text x={R.labelX} y={y + R.boxH / 2 + fs * 0.36} fontSize={fs} fontWeight={800} fill={C.text} letterSpacing={1} opacity={opacity}>
        {text}
      </text>
    );
  };
  const rowLabels = [...BOXES, LAST_ROW];
  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Frame vertical={p.vertical} design="both">
        {/* the next morning: warm light and a sun beside the form, which has not changed */}
        {s.morning > 0 && (
          <g opacity={s.morning}>
            <rect x={L.board.x - 60} y={L.board.y - 40} width={(p.vertical ? 1080 : 1920) - 2 * (L.board.x - 60)} height={L.board.h + 80} rx={40} fill={alpha(C.warm, 0.07)} />
            <g style={glow(C.warm, 0.8)}>
              <circle cx={L.sun.x} cy={L.sun.y} r={L.sun.r} fill={C.warm} />
              {Array.from({ length: 10 }, (_, i) => {
                const a = (i * Math.PI) / 5;
                const r = L.sun.r;
                return <line key={i} x1={L.sun.x + (r + 14) * Math.cos(a)} y1={L.sun.y + (r + 14) * Math.sin(a)} x2={L.sun.x + (r + 38) * Math.cos(a)} y2={L.sun.y + (r + 38) * Math.sin(a)} stroke={C.warm} strokeWidth={7} strokeLinecap="round" />;
              })}
            </g>
            <text x={L.morningLabel.x} y={L.morningLabel.y} textAnchor="middle" fontSize={40} fontWeight={800} fill={C.warm}>
              next morning
            </text>
          </g>
        )}
        <g opacity={1 - 0.45 * s.dim}>
          <Board x={L.board.x} y={L.board.y} w={L.board.w} h={L.board.h} lit={1} />
          {/* the margin rule */}
          <rect x={L.marginX} y={L.board.y + 100} width={4} height={L.board.h - 130} fill={alpha(C.marker, 0.55)} />
          {/* rows 0-3: FLIGHT, HOTEL, DESTINATION, LAST ENTRY */}
          {[0, 1, 2, 3].map((i) => {
            const y = rowY(i);
            const isFlight = i === 0;
            return (
              <g key={i}>
                {label(y, rowLabels[i], i === 3 ? R.small : R.label)}
                {box(y, isFlight ? s.rowLit : 0)}
                {!isFlight && (
                  <Scribble x={R.boxX + 26} y={y + R.boxH / 2 + 6} w={(R.boxW - 60) * (i === 3 ? 0.9 : 0.7 + 0.1 * (i % 2))} p={i === 3 && margin ? s.scribble : s.filled} />
                )}
              </g>
            );
          })}
          {/* the FLIGHT value: old value struck, new value written in the same box */}
          <g>
            <text x={vx} y={vy} fontSize={R.value} fontWeight={800} fill={C.text} opacity={rewriting ? 1 - v.write : 1}>
              {v.text}
            </text>
            {rewriting && <rect x={vx - 6} y={vy - R.value * 0.36} width={(textW(v.text, R.value) + 12) * v.strike} height={6} rx={3} fill={C.marker} opacity={1 - v.write} />}
            {rewriting && (
              <text x={vx} y={vy} fontSize={R.value} fontWeight={800} fill={v.next === 'Thursday' ? C.marker : C.text}>
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
              {label(notesY, NOTES_LABEL, R.small)}
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
          {/* the fact scribbled in the margin, wiped by the next entry */}
          {s.margin.write > 0 && (
            <g transform={`rotate(-7 ${L.marginX + 110} ${lastY + 40})`} opacity={1 - s.margin.erase}>
              <text x={L.marginX + 22} y={lastY + 26} fontSize={R.small + 4} fontWeight={700} fontStyle="italic" fill={C.marker}>
                {MARGIN_TEXT.slice(0, Math.ceil(11 * Math.min(1, s.margin.write * 2)))}
              </text>
              <text x={L.marginX + 30} y={lastY + 26 + R.small + 14} fontSize={R.small + 4} fontWeight={700} fontStyle="italic" fill={C.marker}>
                {MARGIN_TEXT.slice(12, 12 + Math.ceil(8 * Math.max(0, s.margin.write * 2 - 1)))}
              </text>
            </g>
          )}
          {s.eraser > 0 && (
            <g transform={`translate(${lerp(L.marginX + 10, L.marginX + 170, s.margin.erase)} ${lastY - 10}) rotate(-20)`} opacity={s.eraser}>
              <rect x={0} y={0} width={60} height={96} rx={12} fill={alpha(C.marker, 0.85)} stroke={C.bg0} strokeWidth={3} />
              <rect x={0} y={60} width={60} height={36} rx={10} fill={C.text} />
            </g>
          )}
        </g>
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
        {/* the right action (wrong): the hotel booked for Friday */}
        <Bubble x={L.booking.x} y={L.booking.y} side="ai" text={RIGHT_BOOKING} size={L.booking.size} maxW={L.booking.maxW} opacity={s.booking.opacity} lit={s.booking.tick} tick />
        {/* the cascade of mistakes from the one wrong box (wrong) */}
        {s.cascade > 0 &&
          Array.from({ length: s.cascade }, (_, i) => {
            const c = L.cascade;
            return <Badge key={i} x={c.x + (i % c.cols) * c.cell + c.cell / 2} y={c.y + Math.floor(i / c.cols) * c.cell + c.cell / 2} r={c.cell * 0.36} kind="cross" pop={1} />;
          })}
        {/* the app's Memory panel (panel): a list of notes kept outside the chat */}
        <MemoryPanel
          x={L.panel.x}
          y={L.panel.y}
          w={L.panel.w}
          size={L.panel.size}
          opacity={s.panel.opacity}
          lit={s.panel.glow}
          notes={[
            { text: PANEL_NOTES[0] },
            { text: PANEL_NOTES[1], lit: s.panel.lit },
            { text: NOT_SAVED, ghost: 1, opacity: s.panel.missing, cross: s.panel.cross },
          ]}
        />
        <Slip x={lerp(L.slipFrom.x, slipTo.x, s.slip.fly)} y={lerp(L.slipFrom.y, slipTo.y, s.slip.fly)} w={lerp(230, 150, s.slip.fly)} rot={lerp(10, -3, s.slip.fly)} opacity={s.slip.opacity} />
      </Frame>
    </AbsoluteFill>
  );
};
