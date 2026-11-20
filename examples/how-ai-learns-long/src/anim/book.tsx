// Shared drawings for KnowledgeBook, ClearSheet and TerminalTest: the book of what the model knows
// (open, two ruled pages, a thin "manners" chapter with its tab and the yellow sticky note
// "One line, please"), the clear sheet (LoRA), the pen, the policy card, a name label and the
// house robot holding the book. One drawing, so the book looks identical in every scene.
// SVG in frame pixels (Canvas.tsx), brand tokens only.
import React from 'react';
import { C, alpha } from '../brand.ts';
import { Robot, glow } from './office.tsx';

const cl = (x: number) => (Number.isFinite(x) ? Math.min(1, Math.max(0, x)) : 0);

/** Approximate advance of one Inter bold character, as a fraction of the font size. */
export const CHAR_W = 0.56;

export const STICKY_TEXT = ['One line,', 'please'];
export const POLICY = (days: string) => [`Returns: ${days} days,`, 'unworn, in the box'];

/** Height of the page block of a book `w` wide (the stack of page edges adds BOOK_EDGE·w). */
export const bookH = (w: number) => w * 0.56;
export const BOOK_EDGE = 0.04;

/** Rows of ruled lines: left page 8 rows; right page 4 rows, then the manners chapter. */
const LEFT_ROWS = [0.92, 0.86, 0.9, 0.7, 0.88, 0.82, 0.9, 0.6];
const RIGHT_ROWS = [0.9, 0.84, 0.92, 0.66];
const MANNERS_ROWS = [0.42, 0.36];
const rowY = (h: number, i: number) => h * (0.1 + i * 0.105);
/** Number of lines the pen rewrites, in order: left page, right page, manners. */
export const REWRITE_LINES = LEFT_ROWS.length + RIGHT_ROWS.length + MANNERS_ROWS.length;

/** A hand-written stroke along a line from (x, y), `len` long, drawn in to `p`. */
const Ink: React.FC<{ x: number; y: number; len: number; p: number; color: string; width: number; amp: number }> = ({ x, y, len, p, color, width, amp }) => {
  if (p <= 0) return null;
  const n = Math.max(3, Math.round(len / (amp * 5)));
  const step = len / n;
  let d = `M ${x} ${y}`;
  for (let i = 0; i < n; i++) d += ` q ${step / 2} ${i % 2 ? amp : -amp} ${step} 0`;
  return <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" pathLength={1} strokeDasharray={`${cl(p)} 1`} />;
};

/** Where the sticky note sits on the book (centre), and its size. */
export const stickyAt = (x: number, y: number, w: number) => {
  const sw = Math.max(170, w * 0.24);
  const h = bookH(w);
  // right-aligned on the right page, and low enough to leave the "manners" heading readable
  return { x: x + w - sw / 2 - w * 0.03, y: y + Math.max(h * 0.77, h * 0.6 + sw * 0.43 + 10), w: sw };
};

/** The yellow sticky note "One line, please", centred on (x, y), with a rose pin. */
export const Sticky: React.FC<{ x: number; y: number; w: number; rot?: number; opacity?: number; pin?: number; glowA?: number }> = ({ x, y, w, rot = 4, opacity = 1, pin = 1, glowA = 0 }) => {
  if (opacity <= 0) return null;
  const fs = Math.max(28, w * 0.17);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={cl(opacity)} style={glow(C.warm, glowA)}>
      <rect x={-w / 2 + 5} y={-w * 0.43 + 7} width={w} height={w * 0.86} rx={4} fill={alpha(C.bg0, 0.35)} />
      <path d={`M ${-w / 2} ${-w * 0.43} H ${w / 2} V ${w * 0.31} L ${w * 0.38} ${w * 0.43} H ${-w / 2} Z`} fill={C.warm} />
      <path d={`M ${w / 2} ${w * 0.31} L ${w * 0.38} ${w * 0.43} L ${w * 0.38} ${w * 0.31} Z`} fill={alpha(C.bg0, 0.25)} />
      {STICKY_TEXT.map((line, i) => (
        <text key={i} x={0} y={-w * 0.06 + i * fs * 1.15} textAnchor="middle" fontSize={fs} fontWeight={800} fontStyle="italic" fill={C.bg0}>
          {line}
        </text>
      ))}
      {pin > 0 && (
        <g transform={`translate(0 ${-w * 0.36}) scale(${1.6 - 0.6 * cl(pin)})`} opacity={cl(pin)}>
          <circle r={w * 0.07} fill={C.marker} stroke={C.bg0} strokeWidth={2} />
          <circle cx={-w * 0.02} cy={-w * 0.02} r={w * 0.022} fill={alpha(C.text, 0.8)} />
        </g>
      )}
    </g>
  );
};

export type BookProps = {
  /** Top left of the page block, and its width. */
  x: number;
  y: number;
  w: number;
  opacity?: number;
  /** How much of the text is printed (school): 0 = blank pages, 1 = every line. */
  fill?: number;
  /** The thin "manners" chapter: tab, heading and lines, 0..1. */
  manners?: number;
  /** Manners lit (accent glow on the tab). */
  mannersLit?: number;
  /** Manners blurred by the rewrites, 0..1. */
  blur?: number;
  /** The pen's rewrite, 0..1 over REWRITE_LINES lines in order. */
  rewrite?: number;
  /** A page turning (0..1 of its turn) and how visible it is. */
  flip?: number;
  flipOn?: number;
  glowA?: number;
  glowColor?: string;
  /** The sticky note: shown, its pin, a glow; `fall` drops it by (fallDx, fallDy)·w, turning. */
  sticky?: number;
  stickyPin?: number;
  stickyGlow?: number;
  stickyDrop?: number;
  fall?: number;
  fallDx?: number;
  fallDy?: number;
  /** A line of written text on the left page (e.g. "Returns: 30 days"), lit and circled. */
  pageText?: string;
  pageLit?: number;
  pageCircle?: number;
  /** Teal tick "unchanged" over the pages. */
  children?: React.ReactNode;
};

/** The book of what the model knows, open, seen from the front. */
export const Book: React.FC<BookProps> = ({
  x,
  y,
  w,
  opacity = 1,
  fill = 1,
  manners = 1,
  mannersLit = 0,
  blur = 0,
  rewrite = 0,
  flip = 0,
  flipOn = 0,
  glowA = 0,
  glowColor = C.accentText,
  sticky = 1,
  stickyPin = 1,
  stickyGlow = 0,
  stickyDrop = 1,
  fall = 0,
  fallDx = -0.75,
  fallDy = 0.5,
  pageText,
  pageLit = 0,
  pageCircle = 0,
  children,
}) => {
  if (opacity <= 0) return null;
  const h = bookH(w);
  const mid = x + w / 2;
  const sag = w * 0.018;
  const edge = w * BOOK_EDGE;
  const barH = Math.max(5, w * 0.011);
  const ink = Math.max(4, w * 0.008);
  const leftPage = `M ${mid} ${y + sag} Q ${x + w / 4} ${y - sag} ${x} ${y + sag * 0.4} V ${y + h} Q ${x + w / 4} ${y + h - sag} ${mid} ${y + h} Z`;
  const rightPage = `M ${mid} ${y + sag} Q ${x + (3 * w) / 4} ${y - sag} ${x + w} ${y + sag * 0.4} V ${y + h} Q ${x + (3 * w) / 4} ${y + h - sag} ${mid} ${y + h} Z`;
  const shown = (i: number, n: number) => cl(cl(fill) * n - i);
  const rw = (i: number) => cl(cl(rewrite) * REWRITE_LINES - i);
  const m = cl(manners);
  const bl = cl(blur);
  const textFs = Math.max(28, w * 0.04);
  const headFs = Math.max(28, w * 0.042);
  const leftRows = pageText ? LEFT_ROWS.slice(0, 6) : LEFT_ROWS;
  const st = stickyAt(x, y, w);
  const f = cl(fall);
  const drop = cl(stickyDrop);
  const rows = (page: 'l' | 'r', list: number[], from: number, offset: number) =>
    list.map((len, i) => {
      const lx = page === 'l' ? x + w * 0.06 : mid + w * 0.06;
      const L = w * 0.38 * len;
      const ly = y + rowY(h, i + offset);
      const k = rw(from + i);
      const s = shown(from + i, REWRITE_LINES - MANNERS_ROWS.length);
      return (
        <g key={`${page}${i}`} opacity={s}>
          <rect x={lx} y={ly - barH / 2} width={L} height={barH} rx={barH / 2} fill={alpha(C.bg1, 0.55 * (1 - 0.75 * k))} />
          <Ink x={lx} y={ly} len={L} p={k} color={C.accent} width={ink} amp={barH * 0.9} />
        </g>
      );
    });
  return (
    <g opacity={cl(opacity)}>
      <g style={glow(glowColor, glowA)}>
        {/* cover and the stack of page edges: a thick book */}
        <rect x={x - w * 0.025} y={y - w * 0.012} width={w * 1.05} height={h + edge + w * 0.03} rx={w * 0.02} fill={C.accent} stroke={alpha(C.bg0, 0.6)} strokeWidth={3} />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={x + w * 0.004 * (i + 1)} y={y + h + i * edge * 0.25} width={w - w * 0.008 * (i + 1)} height={edge * 0.25} fill={i % 2 ? alpha(C.text, 0.82) : alpha(C.muted, 0.9)} />
        ))}
        {/* the manners chapter: a thin coloured band in the page edges and a tab */}
        {m > 0 && (
          <g opacity={m}>
            <rect x={x + w * 0.62} y={y + h} width={w * 0.06} height={edge} fill={C.accent2} />
            <g style={glow(C.accent2, mannersLit)}>
              <rect x={x + w - 4} y={y + h * 0.56} width={w * 0.05 * m + 4} height={h * 0.3} rx={6} fill={C.accent2} stroke={alpha(C.bg0, 0.5)} strokeWidth={2} />
            </g>
          </g>
        )}
        <path d={leftPage} fill={C.text} stroke={alpha(C.bg0, 0.4)} strokeWidth={2} />
        <path d={rightPage} fill={C.text} stroke={alpha(C.bg0, 0.4)} strokeWidth={2} />
        <rect x={mid - w * 0.03} y={y + sag} width={w * 0.06} height={h - sag} fill={alpha(C.bg0, 0.12)} />
        <line x1={mid} x2={mid} y1={y + sag} y2={y + h} stroke={alpha(C.bg0, 0.35)} strokeWidth={2} />
      </g>
      {rows('l', leftRows, 0, 0)}
      {rows('r', RIGHT_ROWS, LEFT_ROWS.length, 0)}
      {pageText && (
        <g>
          {pageCircle > 0 && (
            <ellipse
              cx={x + w * 0.06 + (pageText.length * CHAR_W * textFs) / 2}
              cy={y + rowY(h, 6.5) - textFs * 0.3}
              rx={(pageText.length * CHAR_W * textFs) / 2 + 22}
              ry={textFs * 0.95}
              fill="none"
              stroke={C.marker}
              strokeWidth={6}
              pathLength={1}
              strokeDasharray={`${cl(pageCircle)} 1`}
              style={glow(C.marker, 0.7 * cl(pageCircle))}
            />
          )}
          <text x={x + w * 0.06} y={y + rowY(h, 6.5)} fontSize={textFs} fontWeight={800} fontStyle="italic" fill={pageLit > 0.05 ? C.marker : C.accent}>
            {pageText}
          </text>
        </g>
      )}
      {/* the manners chapter on the right page: heading and two short lines */}
      {m > 0 && (
        <g opacity={m * (1 - 0.35 * bl)} style={bl > 0.01 ? { filter: `blur(${(3.5 * bl).toFixed(2)}px)` } : undefined}>
          <text x={mid + w * 0.06} y={y + rowY(h, 4.75)} fontSize={headFs} fontWeight={800} fill={C.accent2}>
            manners
          </text>
          {MANNERS_ROWS.map((len, i) => {
            const lx = mid + w * 0.06;
            const L = w * 0.38 * len;
            const ly = y + rowY(h, 6 + i);
            const k = rw(LEFT_ROWS.length + RIGHT_ROWS.length + i);
            return (
              <g key={i}>
                <rect x={lx} y={ly - barH / 2} width={L} height={barH} rx={barH / 2} fill={alpha(C.bg1, 0.55 * (1 - 0.6 * k))} />
                <Ink x={lx} y={ly} len={L} p={k} color={C.accent} width={ink} amp={barH * 0.9} />
                {bl > 0 && <Ink x={lx} y={ly + barH * 1.6} len={L * 1.1} p={1} color={alpha(C.muted, 0.8 * bl)} width={ink} amp={barH * 1.4} />}
              </g>
            );
          })}
        </g>
      )}
      {/* a page turning about the spine */}
      {flipOn > 0.01 && (
        <g opacity={cl(flipOn)} transform={`translate(${mid} 0) scale(${Math.cos(Math.PI * cl(flip)).toFixed(4)} 1) translate(${-mid} 0)`}>
          <path d={rightPage} fill={C.text} stroke={alpha(C.bg0, 0.5)} strokeWidth={2} />
          {RIGHT_ROWS.concat(LEFT_ROWS.slice(0, 3)).map((len, i) => (
            <Ink key={i} x={mid + w * 0.06} y={y + rowY(h, i)} len={w * 0.38 * len} p={1} color={C.accent} width={ink} amp={barH * 0.9} />
          ))}
        </g>
      )}
      {children}
      {sticky > 0 && m > 0 && (
        <Sticky
          x={st.x + fallDx * w * f}
          y={st.y - (1 - drop) * h * 0.9 + fallDy * w * f}
          w={st.w}
          rot={4 + 4 * (1 - drop) + 34 * f}
          opacity={cl(sticky) * m}
          pin={cl(stickyPin) * (1 - f)}
          glowA={stickyGlow}
        />
      )}
    </g>
  );
};

/** Hand-written strokes on the clear sheet, as fractions of the page block (x, y, length). */
const SHEET_INK: [number, number, number][] = [
  [0.07, 0.2, 0.3],
  [0.07, 0.42, 0.26],
  [0.57, 0.2, 0.32],
  [0.57, 0.31, 0.24],
  [0.07, 0.64, 0.33],
];

/** The clear sheet (LoRA) laid over a book of width w at (x, y): transparent, glossy, written on in teal. */
export const ClearSheetDraw: React.FC<{ x: number; y: number; w: number; opacity?: number; ink?: number; lit?: number; label?: string; labelSize?: number; rot?: number; scale?: number }> = ({
  x,
  y,
  w,
  opacity = 1,
  ink = 0,
  lit = 0,
  label,
  labelSize,
  rot = 0,
  scale = 1,
}) => {
  if (opacity <= 0) return null;
  const h = bookH(w);
  const pad = w * 0.035;
  const W = w + 2 * pad;
  const H = h + 2 * pad;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const iw = Math.max(5, w * 0.01);
  const lfs = labelSize ?? Math.max(28, w * 0.045);
  return (
    <g opacity={cl(opacity)} transform={`translate(${cx} ${cy}) rotate(${rot}) scale(${scale}) translate(${-cx} ${-cy})`}>
      <g style={glow(C.ok, 0.5 * cl(lit))}>
        <rect x={x - pad} y={y - pad} width={W} height={H} rx={w * 0.015} fill={alpha(C.accentText, 0.16)} stroke={alpha(C.text, 0.75)} strokeWidth={3} />
      </g>
      <path d={`M ${x - pad + W * 0.08} ${y - pad} L ${x - pad + W * 0.24} ${y - pad} L ${x - pad + W * 0.08} ${y - pad + H} L ${x - pad - W * 0.08 + W * 0.08} ${y - pad + H} Z`} fill={alpha(C.text, 0.13)} />
      <path d={`M ${x - pad + W * 0.3} ${y - pad} L ${x - pad + W * 0.34} ${y - pad} L ${x - pad + W * 0.18} ${y - pad + H} L ${x - pad + W * 0.14} ${y - pad + H} Z`} fill={alpha(C.text, 0.1)} />
      <path d={`M ${x - pad + W} ${y - pad + H - w * 0.06} L ${x - pad + W - w * 0.06} ${y - pad + H} L ${x - pad + W - w * 0.06} ${y - pad + H - w * 0.06} Z`} fill={alpha(C.text, 0.35)} />
      {SHEET_INK.map(([fx, fy, fl], i) => (
        <Ink key={i} x={x + fx * w} y={y + fy * h} len={fl * w} p={cl(cl(ink) * SHEET_INK.length - i)} color={C.ok} width={iw} amp={iw * 1.1} />
      ))}
      {label && (
        <g>
          <rect x={x - pad + 14} y={y - pad - lfs * 0.9} width={label.length * CHAR_W * lfs + 32} height={lfs * 1.5} rx={lfs * 0.5} fill={C.card} stroke={C.ok} strokeWidth={3} />
          <text x={x - pad + 30} y={y - pad + lfs * 0.25} fontSize={lfs} fontWeight={800} fill={C.ok}>
            {label}
          </text>
        </g>
      )}
    </g>
  );
};

/** A pen, its nib at (x, y), leaning `rot` degrees; `s` scales it (about 200·s long). */
export const Pen: React.FC<{ x: number; y: number; s?: number; rot?: number; opacity?: number; color?: string }> = ({ x, y, s = 1, rot = 35, opacity = 1, color = C.accent2 }) => {
  if (opacity <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={cl(opacity)}>
      <path d="M 0 0 L -9 -34 L 9 -34 Z" fill={C.text} stroke={C.bg0} strokeWidth={2} />
      <circle cx={0} cy={-4} r={3} fill={C.bg0} />
      <rect x={-14} y={-190} width={28} height={158} rx={10} fill={color} stroke={C.bg0} strokeWidth={3} />
      <rect x={-14} y={-80} width={28} height={14} fill={alpha(C.text, 0.85)} />
      <rect x={10} y={-180} width={8} height={70} rx={4} fill={alpha(C.text, 0.7)} />
    </g>
  );
};

/** A rounded name label ("pre-training (school)"), top left at (x, y). */
export const NameLabel: React.FC<{ x: number; y: number; text: string; size?: number; opacity?: number; pop?: number; color?: string; anchor?: 'start' | 'middle' }> = ({
  x,
  y,
  text,
  size = 40,
  opacity = 1,
  pop = 1,
  color = C.accentText,
  anchor = 'start',
}) => {
  const o = cl(opacity) * cl(pop * 1.5);
  if (o <= 0) return null;
  const w = text.length * CHAR_W * size + size * 1.6;
  const left = anchor === 'middle' ? x - w / 2 : x;
  const sc = 1.25 - 0.25 * cl(pop);
  return (
    <g opacity={o} transform={`translate(${left + w / 2} ${y + size * 0.8}) scale(${sc}) translate(${-(left + w / 2)} ${-(y + size * 0.8)})`}>
      <rect x={left} y={y} width={w} height={size * 1.6} rx={size * 0.8} fill={C.card} stroke={color} strokeWidth={4} />
      <circle cx={left + size * 0.7} cy={y + size * 0.8} r={size * 0.18} fill={color} />
      <text x={left + size * 1.05} y={y + size * 1.14} fontSize={size} fontWeight={800} fill={C.text}>
        {text}
      </text>
    </g>
  );
};

/** Width of a NameLabel, for layout. */
export const labelWidth = (text: string, size = 40) => text.length * CHAR_W * size + size * 1.6;

/** The shop's policy card, centred on (x, y): "Returns: 30 days, unworn, in the box"; `flip` turns it to 14 days. */
export const PolicyCard: React.FC<{ x: number; y: number; w: number; flip?: number; opacity?: number; glowA?: number }> = ({ x, y, w, flip = 0, opacity = 1, glowA = 0 }) => {
  if (opacity <= 0) return null;
  const f = cl(flip);
  const sy = Math.abs(Math.cos(Math.PI * f));
  const after = f >= 0.5;
  const h = w * 0.5;
  const fs = Math.max(30, w * 0.075);
  const lines = POLICY(after ? '14' : '30');
  // The same card as the other chapters: cream paper, an amber band on top, the shoebox logo.
  return (
    <g opacity={cl(opacity)} transform={`translate(${x} ${y}) scale(1 ${Math.max(0.02, sy).toFixed(4)})`} style={glow(after ? C.warm : C.accentText, glowA)}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={18} fill={C.text} stroke={alpha(C.warm, 0.9)} strokeWidth={5} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h * 0.12} rx={14} fill={C.warm} />
      {/* the shop's shoebox logo */}
      <g transform={`translate(${-w / 2 + 50} ${-h / 2 + 62})`}>
        <rect x={-26} y={-12} width={52} height={30} rx={4} fill={alpha(C.warm, 0.85)} stroke={alpha(C.bg0, 0.6)} strokeWidth={2} />
        <rect x={-30} y={-20} width={60} height={12} rx={3} fill={C.warm} stroke={alpha(C.bg0, 0.6)} strokeWidth={2} />
      </g>
      <text x={-w / 2 + 96} y={-h / 2 + 74} fontSize={fs * 0.8} fontWeight={700} fill={alpha(C.bg0, 0.6)}>
        Shop policy
      </text>
      {lines.map((l, i) => (
        <text key={i} x={-w / 2 + 34} y={-h / 2 + h * 0.6 + i * fs * 1.3} fontSize={fs} fontWeight={800} fill={C.bg0}>
          {i === 0 ? (
            <>
              Returns: <tspan fill={after ? C.accent2 : C.bg0}>{after ? '14' : '30'} days</tspan>,
            </>
          ) : (
            l
          )}
        </text>
      ))}
    </g>
  );
};

/**
 * The house robot standing behind the book and holding it: the robot first, the book (children)
 * in front, then its two hands on the book's sides. The head shows above the book.
 */
export const robotForBook = (x: number, y: number, w: number) => {
  const s = w / 800;
  return { x: x + w / 2, y: y - 196 * s, s };
};

export const RobotWithBook: React.FC<{ x: number; y: number; w: number; blink?: number; children: React.ReactNode; opacity?: number }> = ({ x, y, w, blink = 0, children, opacity = 1 }) => {
  const r = robotForBook(x, y, w);
  const h = bookH(w);
  const hr = 30 * r.s;
  return (
    <g opacity={cl(opacity)}>
      <Robot x={r.x} y={r.y} s={r.s} blink={blink} />
      {children}
      {[-1, 1].map((side) => {
        const hx = side < 0 ? x - w * 0.025 : x + w * 1.025;
        const hy = y + h * 0.62;
        return (
          <g key={side}>
            <circle cx={hx + side * hr * 0.35} cy={hy} r={hr} fill={C.card} stroke={C.accentText} strokeWidth={5} />
            {[-1, 0, 1].map((k) => (
              <rect
                key={k}
                x={side < 0 ? hx - hr * 0.2 : hx - hr * 0.95}
                y={hy + k * hr * 0.62 - hr * 0.24}
                width={hr * 1.15}
                height={hr * 0.48}
                rx={hr * 0.24}
                fill={C.card}
                stroke={C.accentText}
                strokeWidth={4}
              />
            ))}
          </g>
        );
      })}
    </g>
  );
};

/** Where the pen's nib is while rewriting line `i` (0..REWRITE_LINES-1), `frac` along it. */
export const linePoint = (x: number, y: number, w: number, line: number, frac: number) => {
  const h = bookH(w);
  const mid = x + w / 2;
  const f = cl(frac);
  let i = Math.max(0, Math.min(REWRITE_LINES - 1, Math.floor(Number.isFinite(line) ? line : 0)));
  if (i < LEFT_ROWS.length) return { x: x + w * 0.06 + w * 0.38 * LEFT_ROWS[i] * f, y: y + rowY(h, i) };
  i -= LEFT_ROWS.length;
  if (i < RIGHT_ROWS.length) return { x: mid + w * 0.06 + w * 0.38 * RIGHT_ROWS[i] * f, y: y + rowY(h, i) };
  i -= RIGHT_ROWS.length;
  return { x: mid + w * 0.06 + w * 0.38 * MANNERS_ROWS[i] * f, y: y + rowY(h, 6 + i) };
};

/** Where the pen's nib is while it writes on the clear sheet, `ink` 0..1 over its strokes. */
export const sheetInkPoint = (x: number, y: number, w: number, ink: number) => {
  const h = bookH(w);
  const k = cl(ink) * SHEET_INK.length;
  const i = Math.min(SHEET_INK.length - 1, Math.floor(k));
  const [fx, fy, fl] = SHEET_INK[i];
  return { x: x + fx * w + fl * w * cl(k - i), y: y + fy * h };
};
