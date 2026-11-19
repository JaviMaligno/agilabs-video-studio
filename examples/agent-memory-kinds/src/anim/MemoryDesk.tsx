// The desk: working memory, and the summary notecard. See MemoryDesk.state.ts.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { SLIP_TEXT, lerp } from './memory.ts';
import {
  CARD_TEXT,
  DAYS,
  DECISIONS,
  DETAIL_TEXT,
  GREETING,
  OLD_LABEL,
  OLD_REDS,
  RECENT,
  ROW_CELLS,
  FORK,
  MAX_PAGES,
  MISSES_ONE,
  MISSES_OTHER,
  ONE_IN_TEXT,
  OTHER_TEXT,
  WORK_PAGES,
  frameState,
  type MemoryDeskProps,
} from './MemoryDesk.state.ts';
import { Badge, Clock, Desk, Floor, Frame, Gauge, Notecard, Page, Robot, Slip, glow, type PageKind } from './office.tsx';
import { Bubble } from './chat.tsx';
import { place } from './canvas.ts';

export { frameState };
export type { MemoryDeskProps };

/**
 * Layout (frame pixels), per format.
 * - vertical: the robot stands behind the desk, the gauge and the calendar above it.
 * - landscape: the desk on the floor at the left, the robot standing beside it on the same floor
 *   (the desk at its hip), the gauge on a post at the right end of the desk, the calendar and the
 *   strips of decisions in the free space at the top right.
 */
const LAYOUT = {
  v: {
    floor: { y: 1176, x: 60, w: 880 },
    desk: { x: 130, y: 1000, w: 790 },
    robot: { x: 785, y: 560, s: 0.9 },
    pile: { x: 400, base: 935 },
    slip: { x: 370, y: 958 },
    card: { x: 560, y: 905, w: 320 },
    rules: { x: 640, y: 905 },
    gauge: { x: 230, y: 450, r: 84, post: 0 },
    bubble: { x: 330, y: 520, w: 320, h: 170 },
    calendar: { x: 660, y: 300, w: 300, h: 160 },
    strips: { x: 340, y: [330, 530], cols: 40, label: 'above' as 'above' | 'left' },
    fork: { y: 290, xs: [300, 700], from: { x: 400, y: 740 } },
    spillDrop: 1,
    clock: { x: 490, y: 610, r: 80 },
    rows: { x: 390, y: 280, cell: 44, gap: 4 },
    hover: { x: 560, y: 740, q: { x: 720, y: 720 } },
    greet: { x: 170, y: 880, size: 34, maxW: 740 },
    ghost: { x: 420, y: 820 },
    sun: { x: 190, y: 340, r: 56 },
  },
  l: {
    floor: { y: 806, x: 300, w: 1440 },
    desk: { x: 480, y: 630, w: 800 },
    robot: { x: 1500, y: 806 - 0.8 * 454, s: 0.8 },
    pile: { x: 740, base: 565 },
    slip: { x: 710, y: 588 },
    card: { x: 900, y: 535, w: 320 },
    rules: { x: 1005, y: 575 },
    gauge: { x: 1200, y: 580, r: 58, post: 50 },
    bubble: { x: 590, y: 165, w: 320, h: 170 },
    calendar: { x: 1480, y: 160, w: 250, h: 150 },
    strips: { x: 1080, y: [165, 275], cols: 60, label: 'left' as 'above' | 'left' },
    fork: { y: 205, xs: [570, 950], from: { x: 740, y: 360 } },
    spillDrop: 0.5,
    clock: { x: 750, y: 255, r: 72 },
    rows: { x: 1080, y: 200, cell: 44, gap: 8 },
    hover: { x: 900, y: 395, q: { x: 1060, y: 380 } },
    greet: { x: 520, y: 548, size: 30, maxW: 560 },
    ghost: { x: 740, y: 470 },
    sun: { x: 300, y: 240, r: 52 },
  },
};
type DeskLayout = (typeof LAYOUT)['v'];

/** Deterministic jitter per page. */
const jx = (k: number) => ((k * 53) % 17) - 8;
const jr = (k: number) => ((k * 29) % 13) - 6;
/** Pages from this index on slide off the left edge when the desk overflows. */
const SPILL_FROM = 7;
/** Strip cells: size and gap. */
const CELL = 8;
const GAP = 1;
/** What page k of the chat shows: the early conversation is text, then hotels, prices, a map. */
const LATER_KINDS: PageKind[] = ['hotel', 'price', 'map'];
const kindOf = (k: number): PageKind => (k < WORK_PAGES ? 'text' : LATER_KINDS[(k - WORK_PAGES) % LATER_KINDS.length]);

/** A small desk calendar with two days; the second gets a ring and a tick. */
const Calendar: React.FC<{ x: number; y: number; w: number; h: number; opacity: number; tick: number }> = ({ x, y, w, h, opacity, tick }) =>
  opacity > 0 ? (
    <g opacity={opacity}>
      <rect x={x} y={y} width={w} height={h} rx={14} fill={C.card} stroke={C.accentText} strokeWidth={4} />
      <rect x={x} y={y} width={w} height={h * 0.24} rx={12} fill={C.accent} />
      {[0, 1].map((i) => (
        <circle key={i} cx={x + w * (0.3 + 0.4 * i)} cy={y} r={7} fill={C.text} />
      ))}
      {DAYS.map((d, i) => {
        const cx = x + w * (0.27 + 0.46 * i);
        const cy = y + h * 0.66;
        return (
          <g key={d}>
            {i === 1 && tick > 0 && <circle cx={cx} cy={cy - h * 0.06} r={h * 0.3} fill={alpha(C.ok, 0.18 * tick)} stroke={C.ok} strokeWidth={4} opacity={tick} />}
            <text x={cx} y={cy + h * 0.06} textAnchor="middle" fontSize={h * 0.24} fontWeight={800} fill={i === 1 ? C.text : C.muted}>
              {d}
            </text>
          </g>
        );
      })}
      <Badge x={x + w - 10} y={y + h * 0.3} r={24} kind="tick" pop={tick} />
    </g>
  ) : null;

/** A sun with rays (morning light). */
const Sun: React.FC<{ x: number; y: number; r: number; opacity: number }> = ({ x, y, r, opacity }) =>
  opacity > 0 ? (
    <g opacity={opacity} style={glow(C.warm, 0.8)}>
      <circle cx={x} cy={y} r={r} fill={C.warm} />
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i * Math.PI) / 5;
        return <line key={i} x1={x + (r + 14) * Math.cos(a)} y1={y + (r + 14) * Math.sin(a)} x2={x + (r + 36) * Math.cos(a)} y2={y + (r + 36) * Math.sin(a)} stroke={C.warm} strokeWidth={7} strokeLinecap="round" />;
      })}
    </g>
  ) : null;

/** A speech bubble (a meeting); its words dissolve with `fade`, leaving the gist. */
const MeetingBubble: React.FC<{ D: DeskLayout; opacity: number; fade: number }> = ({ D, opacity, fade }) => {
  if (opacity <= 0) return null;
  const { x, y, w, h } = D.bubble;
  return (
    <g opacity={opacity}>
      <path
        d={`M ${x + 30} ${y} H ${x + w - 30} Q ${x + w} ${y} ${x + w} ${y + 30} V ${y + h - 30} Q ${x + w} ${y + h} ${x + w - 30} ${y + h} H ${x + 120} L ${x + 70} ${y + h + 50} L ${x + 80} ${y + h} H ${x + 30} Q ${x} ${y + h} ${x} ${y + h - 30} V ${y + 30} Q ${x} ${y} ${x + 30} ${y} Z`}
        fill={C.card}
        stroke={C.accentText}
        strokeWidth={5}
      />
      {[0, 1, 2].map((i) =>
        [0, 1, 2, 3].map((j) => (
          <rect
            key={`${i}${j}`}
            x={x + 30 + j * 68}
            y={y + 34 + i * 40}
            width={52 - ((i + j) % 3) * 8}
            height={14}
            rx={7}
            fill={alpha(C.muted, 0.85)}
            opacity={Math.max(0, 1 - fade * (1.6 - 0.15 * ((i * 4 + j) % 5)))}
            transform={`translate(0 ${-20 * fade})`}
          />
        )),
      )}
      {fade > 0 && (
        <path d={`M ${x + w * 0.7} ${y + h + 10} Q ${x + w * 0.85} ${y + h + 140} ${D.card.x - 60} ${D.card.y - 90}`} fill="none" stroke={C.ok} strokeWidth={6} strokeDasharray="12 10" opacity={fade} />
      )}
    </g>
  );
};

/** The instruction card: a small card with a header bar, leaning on the desk. */
const Rules: React.FC<{ x: number; y: number; opacity: number }> = ({ x, y, opacity }) =>
  opacity > 0 ? (
    <g transform={`translate(${x} ${y}) rotate(4)`} opacity={opacity}>
      <rect x={-70} y={-52} width={140} height={104} rx={8} fill={alpha(C.text, 0.92)} stroke={alpha(C.bg0, 0.5)} strokeWidth={2} />
      <rect x={-70} y={-52} width={140} height={20} rx={6} fill={C.accent} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={-56} y={-20 + i * 16} width={i === 3 ? 60 : 108 - 10 * (i % 2)} height={6} rx={3} fill={alpha(C.muted, 0.8)} />
      ))}
    </g>
  ) : null;

/** A deterministic pseudo-random number in [0, 1) per cell (misses scattered, not in columns). */
const scatter = (i: number): number => {
  const x = Math.sin((i + 1) * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

/** A strip of DECISIONS cells filling in reading order; misses (rose) spread evenly through it. */
const Strip: React.FC<{ x: number; y: number; cols: number; fill: number; misses: number }> = ({ x, y, cols, fill, misses }) => {
  const shown = Math.floor(DECISIONS * Math.min(1, Math.max(0, fill)));
  // Exactly `misses` cells, scattered: the ones with the lowest pseudo-random draw.
  const missed = new Set(
    Array.from({ length: DECISIONS }, (_, i) => i)
      .sort((a, b) => scatter(a) - scatter(b))
      .slice(0, misses),
  );
  return (
    <g>
      {Array.from({ length: DECISIONS }, (_, i) => {
        const cx = x + (i % cols) * (CELL + GAP);
        const cy = y + Math.floor(i / cols) * (CELL + GAP);
        // One miss placed in the middle, or `misses` cells scattered at random (not in columns).
        const miss = misses === 1 ? i === Math.floor(DECISIONS * 0.62) : missed.has(i);
        const on = i < shown;
        return <rect key={i} x={cx} y={cy} width={CELL} height={CELL} rx={1.5} fill={!on ? alpha(C.muted, 0.18) : miss ? C.marker : alpha(C.ok, 0.75)} />;
      })}
    </g>
  );
};

/** A row of ROW_CELLS cells filling left to right: ticks (teal) or, at `reds`, crosses (rose). */
const TickRow: React.FC<{ x: number; y: number; cell: number; gap: number; fill: number; misses: readonly number[]; reds?: boolean; label: string; labelColor: string }> = ({
  x,
  y,
  cell,
  gap,
  fill,
  misses,
  reds = false,
  label,
  labelColor,
}) => {
  const shown = Math.floor(ROW_CELLS * Math.min(1, Math.max(0, fill)) + 1e-9);
  return (
    <g>
      <text x={x - 16} y={y + cell * 0.72} textAnchor="end" fontSize={28} fontWeight={800} fill={labelColor}>
        {label}
      </text>
      {Array.from({ length: ROW_CELLS }, (_, i) => {
        const cx = x + i * (cell + gap);
        const on = i < shown;
        const miss = misses.includes(i);
        const k = cell / 54;
        return (
          <g key={i}>
            <rect x={cx} y={y} width={cell} height={cell} rx={8 * k} fill={!on ? C.bg1 : miss ? (reds ? alpha(C.marker, 0.25) : C.bg1) : alpha(C.ok, 0.22)} stroke={!on ? alpha(C.muted, 0.4) : miss && reds ? C.marker : miss ? alpha(C.muted, 0.6) : C.ok} strokeWidth={3} />
            {on && !miss && <path d={`M ${cx + 14 * k} ${y + 28 * k} L ${cx + 24 * k} ${y + 38 * k} L ${cx + 41 * k} ${y + 17 * k}`} fill="none" stroke={C.ok} strokeWidth={5 * k} strokeLinecap="round" strokeLinejoin="round" />}
            {on && miss && reds && <path d={`M ${cx + 16 * k} ${y + 16 * k} L ${cx + 38 * k} ${y + 38 * k} M ${cx + 38 * k} ${y + 16 * k} L ${cx + 16 * k} ${y + 38 * k}`} stroke={C.marker} strokeWidth={5 * k} strokeLinecap="round" />}
          </g>
        );
      })}
    </g>
  );
};

export const MemoryDesk: React.FC<AnimProps & MemoryDeskProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const D = place(p.vertical, LAYOUT);
  const whole = Math.floor(s.pages);
  const part = s.pages - whole;
  const n = Math.min(MAX_PAGES, whole + (part > 0 ? 1 : 0));
  /** A new chat (wiped): everything on the desk slides off to the left and fades. */
  const off = (k: number) => ({ dx: -s.wipe * (700 + 40 * k), op: 1 - s.wipe });
  const pages = Array.from({ length: n }, (_, k) => {
    const landing = k === whole ? part : 1;
    let x = D.pile.x + jx(k);
    let y = D.pile.base - k * 17 - 140 * (1 - landing);
    let rot = jr(k);
    let op = landing;
    let scale = 1;
    if (k >= SPILL_FROM && s.spill > 0) {
      const q = s.spill * (1 - s.squeeze);
      x -= q * (330 + 30 * (k - SPILL_FROM));
      y += D.spillDrop * (q * q * (210 + 25 * (k - SPILL_FROM)) + q * 40 * (k - SPILL_FROM));
      rot -= 50 * q;
    }
    if (s.squeeze > 0) {
      x = lerp(x, D.card.x, s.squeeze);
      y = lerp(y, D.card.y, s.squeeze);
      scale = lerp(1, 0.45, s.squeeze);
      op *= 1 - s.squeeze;
    }
    if (s.wipe > 0) {
      const o = off(k);
      x += o.dx;
      rot -= 30 * s.wipe;
      op *= o.op;
    }
    return { x, y, rot, op, scale, k };
  });
  // The slip on top of the pile (work, crowded): it rides the top page while the conversation
  // grows, then the newer pages cover it (crowded).
  const topOf = (count: number) => D.pile.base - Math.max(0, count - 1) * 17 - 14;
  const settled = s.slip.cover > 0 ? WORK_PAGES : whole;
  const slipTop = { x: D.pile.x - 20, y: topOf(Math.max(1, settled)) };
  const slipBase = s.slip.top > 0 ? slipTop : D.slip;
  const slipAt = { x: slipBase.x + (s.wipe > 0 ? off(WORK_PAGES).dx : 0), y: slipBase.y };
  // Pages that land over the slip (crowded) are drawn after it; on a bare desk all are.
  const coverFrom = s.slip.top > 0 ? (s.slip.cover > 0 ? WORK_PAGES : n) : 0;
  const stripW = D.strips.cols * (CELL + GAP);
  const stripH = Math.ceil(DECISIONS / D.strips.cols) * (CELL + GAP);
  const label = (i: number, text: string, color: string, size: number) =>
    D.strips.label === 'left' ? (
      <text x={D.strips.x - 18} y={D.strips.y[i] + stripH / 2 + size * 0.35} textAnchor="end" fontSize={size} fontWeight={800} fill={color}>
        {text}
      </text>
    ) : (
      <text x={D.strips.x} y={D.strips.y[i] - 14} fontSize={size} fontWeight={800} fill={color}>
        {text}
      </text>
    );
  const pageEl = (pg: (typeof pages)[number]) => <Page key={pg.k} x={pg.x} y={pg.y} w={230} rot={pg.rot} opacity={pg.op} scale={pg.scale} kind={kindOf(pg.k)} />;
  // The slip hovering over the card (summary), then dropping into it.
  const hv = { x: D.hover.x, y: lerp(D.hover.y, D.card.y, s.hover.drop) };
  const { w: fw, h: fh } = p.vertical ? { w: 1080, h: 1920 } : { w: 1920, h: 1080 };
  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Frame vertical={p.vertical} design="both">
        {/* morning light over the whole room (a new chat) */}
        {s.morning > 0 && (
          <g opacity={s.morning}>
            <defs>
              <radialGradient id="desk-morning" cx={D.sun.x / fw} cy={D.sun.y / fh} r="0.9">
                <stop offset="0" stopColor={C.warm} stopOpacity={0.22} />
                <stop offset="1" stopColor={C.warm} stopOpacity={0} />
              </radialGradient>
            </defs>
            <rect x={0} y={0} width={fw} height={fh} fill="url(#desk-morning)" />
            <Sun x={D.sun.x} y={D.sun.y} r={D.sun.r} opacity={1} />
          </g>
        )}
        <Floor y={D.floor.y} x={D.floor.x} w={D.floor.w} />
        {D.gauge.post > 0 && <rect x={D.gauge.x - 6} y={D.gauge.y} width={12} height={D.gauge.post} rx={4} fill={C.bg1} stroke={alpha(C.accentText, 0.6)} strokeWidth={3} />}
        <Gauge x={D.gauge.x} y={D.gauge.y} r={D.gauge.r} level={s.gauge} amber={s.amber} />
        <g style={s.old > 0.01 ? { filter: `grayscale(${s.old.toFixed(3)}) brightness(${(1 - 0.35 * s.old).toFixed(3)})` } : undefined}>
          <Robot x={D.robot.x} y={D.robot.y} s={D.robot.s} blink={0} />
        </g>
        <Desk x={D.desk.x} y={D.desk.y} w={D.desk.w} lit={0.6 + 0.4 * s.deskLit} glowA={0.45 * s.deskLit * (1 - s.amber)} />
        <Rules x={D.rules.x} y={D.rules.y} opacity={s.rules} />
        {pages.filter((pg) => pg.k < coverFrom).map(pageEl)}
        <Slip x={slipAt.x} y={slipAt.y} w={220} rot={-4} opacity={s.slip.opacity * (1 - s.wipe)} glowA={s.slip.glow} />
        {pages.filter((pg) => pg.k >= coverFrom).map(pageEl)}
        {/* a new chat: the greeting, and the slip a memory feature could put back (dashed) */}
        <Bubble x={D.greet.x} y={D.greet.y} side="ai" text={GREETING} size={D.greet.size} maxW={D.greet.maxW} opacity={s.greet} />
        {s.ghost > 0 && (
          <g opacity={s.ghost} transform={`translate(${D.ghost.x} ${D.ghost.y - 30 * (1 - s.ghost)}) rotate(-4)`}>
            <rect x={-110} y={-40} width={220} height={80} rx={9} fill={alpha(C.marker, 0.12)} stroke={C.marker} strokeWidth={4} strokeDasharray="12 9" />
            <text x={0} y={10} textAnchor="middle" fontSize={19} fontWeight={800} fill={alpha(C.marker, 0.9)}>
              {SLIP_TEXT}
            </text>
          </g>
        )}
        {s.card.opacity > 0 && (
          <g transform={`translate(${D.card.x} ${D.card.y}) scale(${1 - 0.45 * s.card.shrink}) translate(${-D.card.x} ${-D.card.y})`}>
            <g style={s.card.glow > 0.01 ? glow(C.warm, 0.7 * s.card.glow) : undefined}>
              <Notecard x={D.card.x} y={D.card.y} w={D.card.w} opacity={s.card.opacity} text={CARD_TEXT} write={s.card.write} />
            </g>
            <g transform={`translate(${D.card.x} ${D.card.y}) rotate(-3)`} opacity={s.card.opacity}>
              {/* line 2: the correction, kept by a recent model; lost on the older model's smaller card */}
              {s.card.write2 > 0 && (
                <text x={-D.card.w / 2 + 18} y={D.card.w * 0.08} fontSize={D.card.w * 0.1} fontWeight={800} fontStyle="italic" fill={C.marker} opacity={1 - s.card.shrink}>
                  {DETAIL_TEXT.slice(0, Math.ceil(DETAIL_TEXT.length * s.card.write2))}
                </text>
              )}
            </g>
            <Badge x={D.card.x + D.card.w / 2 - 6} y={D.card.y - D.card.w * 0.3} r={28} kind="tick" pop={s.card.tick} />
          </g>
        )}
        {/* will "Friday" make the cut? the slip hovers over the card being written, then drops in */}
        {s.hover.opacity > 0 && (
          <g>
            <Slip x={hv.x} y={hv.y} w={lerp(200, 120, s.hover.drop)} rot={-6} opacity={s.hover.opacity} glowA={0.5} />
            {s.hover.question > 0 && (
              <text x={D.hover.q.x} y={D.hover.q.y} textAnchor="middle" fontSize={96} fontWeight={800} fill={C.warm} opacity={s.hover.question}>
                ?
              </text>
            )}
          </g>
        )}
        <Clock x={D.clock.x} y={D.clock.y} r={D.clock.r} hour={720 * s.clock.spin} minute={8640 * s.clock.spin} opacity={s.clock.opacity} />
        {s.rows.opacity > 0 && (
          <g opacity={s.rows.opacity}>
            <TickRow x={D.rows.x} y={D.rows.y} cell={D.rows.cell} gap={D.rows.gap} fill={s.rows.fill} misses={[RECENT.miss]} label={RECENT.label} labelColor={C.text} />
          </g>
        )}
        {s.reds.opacity > 0 && (
          <g opacity={s.reds.opacity}>
            <TickRow x={D.rows.x} y={D.rows.y} cell={D.rows.cell} gap={D.rows.gap} fill={s.reds.fill} misses={OLD_REDS} reds label={OLD_LABEL} labelColor={C.muted} />
          </g>
        )}
        <MeetingBubble D={D} opacity={s.bubble.opacity} fade={s.bubble.fade} />
        <Calendar x={D.calendar.x} y={D.calendar.y} w={D.calendar.w} h={D.calendar.h} opacity={s.calendar.opacity} tick={s.calendar.tick} />
        {s.strips.opacity > 0 && (
          <g opacity={s.strips.opacity}>
            <Strip x={D.strips.x} y={D.strips.y[0]} cols={D.strips.cols} fill={s.strips.one} misses={MISSES_ONE} />
            <Strip x={D.strips.x} y={D.strips.y[1]} cols={D.strips.cols} fill={s.strips.other} misses={MISSES_OTHER} />
            <g opacity={s.strips.label}>{label(0, ONE_IN_TEXT, C.ok, 36)}</g>
            <g opacity={s.strips.other > 0 ? 1 : 0}>{label(1, OTHER_TEXT, C.muted, 28)}</g>
            <rect x={D.strips.x - 6} y={D.strips.y[0] - 6} width={stripW + 12} height={stripH + 12} rx={8} fill="none" stroke={alpha(C.muted, 0.3)} strokeWidth={2} />
          </g>
        )}
        {s.fork > 0 && (
          <g opacity={s.fork}>
            {FORK.map((name, i) => {
              const bx = D.fork.xs[i];
              return (
                <g key={name}>
                  <path d={`M ${D.fork.from.x} ${D.fork.from.y} Q ${D.fork.from.x} ${D.fork.y + 90} ${bx} ${D.fork.y + 40}`} fill="none" stroke={alpha(C.accentText, 0.8)} strokeWidth={5} strokeDasharray="12 9" />
                  <rect x={bx - 130} y={D.fork.y - 36} width={260} height={72} rx={16} fill={C.card} stroke={C.accentText} strokeWidth={4} />
                  <text x={bx} y={D.fork.y + 13} textAnchor="middle" fontSize={36} fontWeight={800} fill={C.text} letterSpacing={1}>
                    {name}
                  </text>
                </g>
              );
            })}
          </g>
        )}
      </Frame>
    </AbsoluteFill>
  );
};
