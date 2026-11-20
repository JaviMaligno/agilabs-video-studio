// Drawing pieces of the shoe shop's "looking it up" and "what to use" scenes (ShopManual,
// ShopRecipe): the note (the prompt), the binder closed and open with its tabs, shoe boxes, PDFs,
// the upload arrow, paragraphs, the book of what the model knows (closed, or open at its thin
// "manners" chapter), the clear sheet, the sticky note "One line, please", the lesson stack, the
// checklist and the recipe list. SVG in frame pixels, brand tokens only.
import React from 'react';
import { C, alpha } from '../brand.ts';
import { edge, glow } from './office.tsx';
import { Book, ClearSheetDraw, bookH } from './book.tsx';
import { NoteSheet, type NoteRow } from './note.tsx';

const cl = (x: number) => (Number.isFinite(x) ? Math.min(1, Math.max(0, x)) : 0);
/** Approximate advance of one Inter bold character, as a fraction of the font size. */
export const CHAR = 0.57;
/** Paper and ink. */
const PAPER = C.text;
const INK = C.bg0;

/** The note's lines: the prompt (policy, tone, one good answer). `days` is the policy's number. */
export const noteRows = (days = '30') => [`Returns: ${days} days,`, 'unworn, in the box', 'Tone: friendly, short', 'Answer in one line'];

/**
 * The note (the prompt): a paper card with an accent header and four lines of text. `sweep` in
 * [0, 1] draws a reading band at that height (top to bottom); below 0, none.
 */
export const NoteCard: React.FC<{ x: number; y: number; w: number; h: number; lit?: number; sweep?: number; opacity?: number; rot?: number; days?: string; glowA?: number }> = ({
  x,
  y,
  w,
  h,
  sweep = -1,
  opacity = 1,
  rot = 0,
  days = '30',
  glowA = 0,
}) => {
  if (opacity <= 0) return null;
  // The same pinned sheet as the prompt scene (note.tsx): "Before every chat:", then the note's lines.
  const body = noteRows(days);
  const fs = Math.max(28, Math.min(h * 0.085, (w * 0.86) / (Math.max(...body.map((r) => r.length)) * CHAR)));
  const rows: NoteRow[] = [{ text: 'Before every chat:', size: Math.max(28, fs * 0.82), color: C.accent }, ...body.map((text) => ({ text, size: fs }))];
  return <NoteSheet x={x} y={y} w={w} h={h} rows={rows} opacity={opacity} rot={rot} lit={glowA} read={sweep >= 0 ? cl(sweep) : -1} />;
};

/** A closed binder seen from the front: rings at the spine, a label window, tab ends at the right. */
export const Binder: React.FC<{ x: number; y: number; w: number; h: number; lit?: number; glowA?: number; opacity?: number; label?: string }> = ({
  x,
  y,
  w,
  h,
  lit = 1,
  glowA = 0,
  opacity = 1,
  label = 'Manual',
}) => {
  if (opacity <= 0) return null;
  const tabs = [C.ok, C.warm, C.accent2];
  return (
    <g opacity={cl(opacity)} style={glow(C.accentText, glowA)}>
      {tabs.map((c, i) => (
        <rect key={i} x={x + w - 8} y={y + h * (0.18 + 0.22 * i)} width={w * 0.12} height={h * 0.14} rx={6} fill={alpha(c, 0.5 + 0.5 * cl(lit))} />
      ))}
      <rect x={x} y={y} width={w} height={h} rx={w * 0.06} fill={alpha(C.accent, 0.35 + 0.45 * cl(lit))} stroke={edge(lit)} strokeWidth={5} />
      <rect x={x} y={y} width={w * 0.16} height={h} rx={w * 0.05} fill={alpha(C.bg0, 0.35)} />
      {[0.22, 0.5, 0.78].map((f, i) => (
        <circle key={i} cx={x + w * 0.08} cy={y + h * f} r={w * 0.04} fill="none" stroke={alpha(C.text, 0.8)} strokeWidth={4} />
      ))}
      <rect x={x + w * 0.26} y={y + h * 0.2} width={w * 0.64} height={h * 0.2} rx={8} fill={alpha(PAPER, 0.92)} />
      <text x={x + w * 0.58} y={y + h * 0.3 + w * 0.06} textAnchor="middle" fontSize={Math.min(w * 0.17, (w * 0.58) / (label.length * CHAR))} fontWeight={800} fill={INK}>
        {label}
      </text>
    </g>
  );
};

/** Boxes of an open binder at (x, y, w, h): its two pages, the rings and where tabs go. */
export const binderPages = (x: number, y: number, w: number, h: number) => {
  const pad = 18;
  const pw = (w - 3 * pad) / 2;
  return {
    left: { x: x + pad, y: y + pad, w: pw, h: h - 2 * pad },
    right: { x: x + 2 * pad + pw, y: y + pad, w: pw, h: h - 2 * pad },
    ringX: x + w / 2,
    tabX: x + w,
  };
};

export type Tab = { label: string; lit?: number; pull?: number; color?: string };

/** An open binder: a dark backing, two paper pages, rings down the middle and labelled tabs on the right. */
export const OpenBinder: React.FC<{ x: number; y: number; w: number; h: number; tabs?: Tab[]; tabSize?: number; opacity?: number; glowA?: number; children?: React.ReactNode }> = ({
  x,
  y,
  w,
  h,
  tabs = [],
  tabSize = 30,
  opacity = 1,
  glowA = 0,
  children,
}) => {
  if (opacity <= 0) return null;
  const P = binderPages(x, y, w, h);
  const tabH = tabSize * 1.9;
  const tabW = Math.max(...tabs.map((t) => t.label.length), 4) * tabSize * CHAR + tabSize * 1.2;
  return (
    <g opacity={cl(opacity)}>
      {tabs.map((t, i) => {
        const pull = cl(t.pull ?? 0) * tabSize * 1.2;
        const lit = cl(t.lit ?? 0);
        const c = t.color ?? C.ok;
        const ty = y + h * 0.12 + i * (tabH + 16);
        return (
          <g key={t.label} style={lit > 0.01 ? glow(c, lit) : undefined}>
            <rect x={P.tabX - 20 + pull} y={ty} width={tabW + 20} height={tabH} rx={12} fill={lit > 0.01 ? alpha(c, 0.35 + 0.6 * lit) : alpha(C.muted, 0.35)} stroke={alpha(c, 0.5 + 0.5 * lit)} strokeWidth={3} />
            <text x={P.tabX + pull + tabSize * 0.45} y={ty + tabH / 2 + tabSize * 0.36} fontSize={tabSize} fontWeight={800} fill={lit > 0.5 ? INK : C.text}>
              {t.label}
            </text>
          </g>
        );
      })}
      <g style={glow(C.accentText, glowA)}>
        <rect x={x} y={y} width={w} height={h} rx={22} fill={alpha(C.accent, 0.55)} stroke={C.accentText} strokeWidth={5} />
      </g>
      <rect x={P.left.x} y={P.left.y} width={P.left.w} height={P.left.h} rx={10} fill={alpha(PAPER, 0.95)} />
      <rect x={P.right.x} y={P.right.y} width={P.right.w} height={P.right.h} rx={10} fill={alpha(PAPER, 0.95)} />
      {children}
      {[0.2, 0.5, 0.8].map((f, i) => (
        <g key={i}>
          <ellipse cx={P.ringX} cy={y + h * f} rx={30} ry={14} fill="none" stroke={C.muted} strokeWidth={7} />
          <ellipse cx={P.ringX} cy={y + h * f} rx={30} ry={14} fill="none" stroke={alpha(C.text, 0.7)} strokeWidth={2.5} />
        </g>
      ))}
    </g>
  );
};

/**
 * Paragraphs on a page: `n` blocks of grey lines inside the box. `picked[i]` lights paragraph
 * picked-index i (teal wash); `hide[i]` takes it off the page (it has been lifted out).
 */
export const Paragraphs: React.FC<{ x: number; y: number; w: number; h: number; n?: number; picks?: number[]; picked?: number[]; hide?: number[] }> = ({
  x,
  y,
  w,
  h,
  n = 5,
  picks = [],
  picked = [],
  hide = [],
}) => {
  const ph = h / n;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const k = picks.indexOf(i);
        const lit = k >= 0 ? cl(picked[k] ?? 0) : 0;
        const gone = k >= 0 ? cl(hide[k] ?? 0) : 0;
        const py = y + i * ph;
        return (
          <g key={i}>
            {lit > 0 && <rect x={x - 8} y={py + 2} width={w + 16} height={ph - 10} rx={10} fill={alpha(C.ok, 0.35 * lit * (1 - gone))} stroke={alpha(C.ok, lit * (1 - gone))} strokeWidth={4} />}
            {[0, 1, 2].map((r) => (
              <rect key={r} x={x} y={py + 12 + r * (ph - 24) / 3} width={w * (r === 2 ? 0.55 : 0.92 - 0.1 * ((i + r) % 2))} height={Math.max(6, ph * 0.1)} rx={4} fill={alpha(C.muted, 0.85 * (1 - gone))} />
            ))}
          </g>
        );
      })}
    </g>
  );
};

/** A small sheet with grey lines and a teal edge (a paragraph lifted out of the binder), centred on (x, y). */
export const Snippet: React.FC<{ x: number; y: number; w: number; opacity?: number; rot?: number }> = ({ x, y, w, opacity = 1, rot = 0 }) => {
  if (opacity <= 0) return null;
  const h = w * 0.5;
  return (
    <g opacity={cl(opacity)} transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={8} fill={PAPER} stroke={C.ok} strokeWidth={4} />
      {[0, 1, 2].map((r) => (
        <rect key={r} x={-w / 2 + 14} y={-h / 2 + 14 + r * (h - 28) / 3} width={(w - 28) * (r === 2 ? 0.55 : 0.9)} height={7} rx={3} fill={alpha(C.muted, 0.9)} />
      ))}
    </g>
  );
};

/** A shoe box with its lid and a shoe drawn on the side. */
export const ShoeBox: React.FC<{ x: number; y: number; w: number; h: number; color?: string; lit?: number }> = ({ x, y, w, h, color = C.warm, lit = 0.6 }) => (
  <g>
    <rect x={x} y={y + h * 0.18} width={w} height={h * 0.82} rx={6} fill={alpha(color, 0.25 + 0.2 * cl(lit))} stroke={alpha(color, 0.7)} strokeWidth={3} />
    <rect x={x - 6} y={y} width={w + 12} height={h * 0.24} rx={6} fill={alpha(color, 0.45 + 0.2 * cl(lit))} stroke={alpha(color, 0.8)} strokeWidth={3} />
    <path
      d={`M ${x + w * 0.2} ${y + h * 0.78} L ${x + w * 0.2} ${y + h * 0.48} Q ${x + w * 0.32} ${y + h * 0.44} ${x + w * 0.4} ${y + h * 0.52} L ${x + w * 0.62} ${y + h * 0.6} Q ${x + w * 0.82} ${y + h * 0.64} ${x + w * 0.82} ${y + h * 0.78} Z`}
      fill={alpha(C.text, 0.75)}
    />
  </g>
);

/** A PDF file, centred on (x, y): a page with a folded corner and a rose "PDF" band. */
export const Pdf: React.FC<{ x: number; y: number; w: number; opacity?: number; rot?: number }> = ({ x, y, w, opacity = 1, rot = 0 }) => {
  if (opacity <= 0) return null;
  const h = w * 1.3;
  const f = w * 0.26;
  return (
    <g opacity={cl(opacity)} transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path d={`M ${-w / 2} ${-h / 2} H ${w / 2 - f} L ${w / 2} ${-h / 2 + f} V ${h / 2} H ${-w / 2} Z`} fill={PAPER} stroke={alpha(C.bg0, 0.5)} strokeWidth={2} />
      <path d={`M ${w / 2 - f} ${-h / 2} V ${-h / 2 + f} H ${w / 2}`} fill={alpha(C.muted, 0.5)} />
      <rect x={-w / 2} y={h * 0.04} width={w} height={h * 0.26} fill={C.marker} />
      <text x={0} y={h * 0.04 + h * 0.2} textAnchor="middle" fontSize={w * 0.3} fontWeight={800} fill={PAPER}>
        PDF
      </text>
      {[0, 1].map((r) => (
        <rect key={r} x={-w / 2 + w * 0.14} y={-h / 2 + h * (0.16 + 0.14 * r)} width={w * 0.6} height={w * 0.06} rx={2} fill={alpha(C.muted, 0.8)} />
      ))}
    </g>
  );
};

/** The upload arrow: a cloud with an arrow pointing down, centred on (x, y). */
export const UploadArrow: React.FC<{ x: number; y: number; s: number; opacity?: number; drop?: number }> = ({ x, y, s, opacity = 1, drop = 0 }) => {
  if (opacity <= 0) return null;
  return (
    <g opacity={cl(opacity)} transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -70 20 a 40 40 0 0 1 10 -78 a 55 55 0 0 1 104 8 a 36 36 0 0 1 26 70 Z" fill={alpha(C.accent, 0.5)} stroke={C.accentText} strokeWidth={5} />
      <g transform={`translate(0 ${10 + 18 * Math.sin(Math.PI * cl(drop))})`}>
        <line x1={0} y1={-34} x2={0} y2={40} stroke={C.text} strokeWidth={12} strokeLinecap="round" />
        <path d="M -26 16 L 0 44 L 26 16" fill="none" stroke={C.text} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </g>
  );
};

/** The book of what the model knows, closed, front cover facing: (x, y) top left. */
export const KnowBook: React.FC<{ x: number; y: number; w: number; h: number; glowA?: number; lit?: number; opacity?: number; title?: boolean }> = ({ x, y, w, h, glowA = 0, opacity = 1 }) => {
  if (opacity <= 0) return null;
  const b = fitBook(x, y, w, h);
  return <Book x={b.x} y={b.y} w={b.w} opacity={opacity} glowA={glowA} glowColor={C.warm} />;
};

/** The open book (book.tsx) as large as fits in the box (x, y, w, h), centred in it. */
export const fitBook = (x: number, y: number, w: number, h: number) => {
  const bw = Math.max(1, Math.min(w, h / 0.62));
  return { x: x + (w - bw) / 2, y: y + (h - bookH(bw)) / 2, w: bw };
};

/**
 * The clear sheet (LoRA) over a box: a transparent sheet lowering from above (`lower` 0 → 1 lands
 * it), with a sheen and the pen's teal lines written only on the sheet (`write`).
 */
export const ClearSheetOver: React.FC<{ x: number; y: number; w: number; h: number; lower: number; write?: number; label?: string; labelSize?: number }> = ({
  x,
  y,
  w,
  h,
  lower,
  write = 0,
  label,
  labelSize = 30,
}) => {
  const p = cl(lower);
  if (p <= 0) return null;
  const b = fitBook(x, y, w, h);
  const bh = bookH(b.w);
  return (
    <g>
      <g transform={`translate(0 ${-(1 - p) * bh * 0.7})`}>
        <ClearSheetDraw x={b.x} y={b.y} w={b.w} opacity={Math.min(1, p * 2)} ink={cl(write)} lit={cl(write)} />
      </g>
      {label && p > 0.9 && (
        <text x={b.x + b.w / 2} y={b.y + bh + 74 + labelSize * 1.1} textAnchor="middle" fontSize={labelSize} fontWeight={800} fill={C.ok} opacity={(p - 0.9) * 10}>
          {label}
        </text>
      )}
    </g>
  );
};

/** The yellow sticky note, centred on (x, y): "One line, please" in two lines. */
export const Sticky: React.FC<{ x: number; y: number; w: number; rot?: number; opacity?: number; text?: string }> = ({ x, y, w, rot = 0, opacity = 1, text = 'One line, please' }) => {
  if (opacity <= 0) return null;
  const words = text.split(' ');
  const half = Math.ceil(words.length / 2);
  const rows = [words.slice(0, half).join(' '), words.slice(half).join(' ')];
  const fs = Math.min(w * 0.17, (w * 0.84) / (Math.max(...rows.map((r) => r.length)) * CHAR));
  return (
    <g opacity={cl(opacity)} transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={-w / 2 + 6} y={-w / 2 + 8} width={w} height={w} rx={6} fill={alpha(C.bg0, 0.5)} />
      <path d={`M ${-w / 2} ${-w / 2} H ${w / 2} V ${w / 2 - w * 0.14} L ${w / 2 - w * 0.14} ${w / 2} H ${-w / 2} Z`} fill={C.warm} />
      <path d={`M ${w / 2} ${w / 2 - w * 0.14} L ${w / 2 - w * 0.14} ${w / 2} L ${w / 2 - w * 0.12} ${w / 2 - w * 0.12} Z`} fill={alpha(C.bg0, 0.25)} />
      {rows.map((r, i) => (
        <text key={i} x={0} y={-w * 0.06 + i * fs * 1.25} textAnchor="middle" fontSize={fs} fontWeight={800} fontStyle="italic" fill={INK}>
          {r}
        </text>
      ))}
    </g>
  );
};

/**
 * The book open at its thin "manners" chapter (left page), the sticky note's place on it (dashed,
 * empty once it has fallen). (x, y) top left of the spread.
 */
export const MannersBook: React.FC<{ x: number; y: number; w: number; h: number; empty?: number; size?: number; fall?: number; fallDx?: number; fallDy?: number }> = ({
  x,
  y,
  w,
  h,
  empty = 0,
  fall,
  fallDx,
  fallDy,
}) => {
  const b = fitBook(x, y, w, h);
  const e = cl(empty);
  const st = stickyPlace(b.x, b.y, b.w);
  return (
    <Book x={b.x} y={b.y} w={b.w} mannersLit={0.6} fall={fall ?? e} fallDx={fallDx} fallDy={fallDy}>
      {/* where the sticky note was: kept under the "manners" heading and inside the page */}
      <rect x={st.x - st.w * 0.45} y={st.y - st.w * 0.3} width={st.w * 0.9} height={st.w * 0.54} rx={6} fill="none" stroke={alpha(C.muted, 0.9 * e)} strokeWidth={4} strokeDasharray="12 9" />
    </Book>
  );
};

/** Where book.tsx puts the sticky note on a book at (x, y, w): centre and size. */
const stickyPlace = (x: number, y: number, w: number) => {
  const sw = Math.max(170, w * 0.24);
  const h = bookH(w);
  return { x: x + w - sw / 2 - w * 0.03, y: y + Math.max(h * 0.77, h * 0.6 + sw * 0.43 + 10), w: sw };
};

/**
 * The lesson stack: ten cards in two rows of five, the lessons for the new job (indigo, a ">_"
 * prompt on each) and, slid in last from an ordinary book, one card of ordinary text (amber).
 * `ordinary` 0 → 1 slides that card from the book into its slot. (x, y) top left.
 */
export const LessonStack: React.FC<{ x: number; y: number; w: number; ordinary: number; size?: number }> = ({ x, y, w, ordinary, size = 28 }) => {
  const cw = (w - 4 * 14) / 5;
  const ch = cw * 1.3;
  const slot = (i: number) => ({ x: x + (i % 5) * (cw + 14), y: y + Math.floor(i / 5) * (ch + 16) });
  const last = slot(9);
  const bookX = x + w * 0.05;
  const bookY = y + 2 * (ch + 16) + 40;
  const p = cl(ordinary);
  const ox = bookX + 60 + (last.x - bookX - 60) * p;
  const oy = bookY - 10 + (last.y - bookY + 10) * p - 90 * Math.sin(Math.PI * p);
  return (
    <g>
      {Array.from({ length: 9 }, (_, i) => {
        const s = slot(i);
        return (
          <g key={i}>
            <rect x={s.x} y={s.y} width={cw} height={ch} rx={10} fill={alpha(C.accent, 0.55)} stroke={C.accentText} strokeWidth={3} />
            <text x={s.x + cw * 0.14} y={s.y + ch * 0.36} fontSize={cw * 0.3} fontWeight={800} fill={C.text}>
              {'>_'}
            </text>
            <rect x={s.x + cw * 0.14} y={s.y + ch * 0.56} width={cw * 0.7} height={6} rx={3} fill={alpha(C.text, 0.6)} />
            <rect x={s.x + cw * 0.14} y={s.y + ch * 0.72} width={cw * 0.45} height={6} rx={3} fill={alpha(C.text, 0.6)} />
          </g>
        );
      })}
      <rect x={last.x} y={last.y} width={cw} height={ch} rx={10} fill="none" stroke={alpha(C.warm, 0.8)} strokeWidth={3} strokeDasharray="9 7" />
      {/* the ordinary book */}
      <rect x={bookX} y={bookY} width={w * 0.34} height={ch * 0.55} rx={8} fill={alpha(C.warm, 0.35)} stroke={C.warm} strokeWidth={4} />
      <rect x={bookX} y={bookY} width={w * 0.05} height={ch * 0.55} rx={6} fill={alpha(C.warm, 0.6)} />
      <text x={bookX + w * 0.4} y={bookY + ch * 0.38} fontSize={size} fontWeight={800} fill={C.warm}>
        ordinary text
      </text>
      <g style={glow(C.warm, 0.5 * p)}>
        <rect x={ox} y={oy} width={cw} height={ch} rx={10} fill={alpha(C.warm, 0.9)} stroke={C.warm} strokeWidth={3} />
        {[0, 1, 2, 3].map((r) => (
          <rect key={r} x={ox + cw * 0.14} y={oy + ch * (0.22 + 0.17 * r)} width={cw * (r === 3 ? 0.4 : 0.72)} height={6} rx={3} fill={alpha(INK, 0.6)} />
        ))}
      </g>
      <text x={last.x + cw / 2} y={last.y + ch + size * 1.3} textAnchor="middle" fontSize={size} fontWeight={800} fill={C.warm} opacity={cl((p - 0.7) / 0.3)}>
        1 in 10
      </text>
    </g>
  );
};

/** A checklist of questions, one row each, with a tick popping in on its right. */
export const Checklist: React.FC<{ x: number; y: number; w: number; rowH: number; items: readonly string[]; rows: number[]; ticks: number[]; size: number }> = ({
  x,
  y,
  w,
  rowH,
  items,
  rows,
  ticks,
  size,
}) => (
  <g>
    {items.map((q, i) => {
      const op = cl(rows[i] ?? 0);
      if (op <= 0) return null;
      const tk = cl(ticks[i] ?? 0);
      const ry = y + i * rowH;
      const cy = ry + rowH / 2 - 4;
      return (
        <g key={i} opacity={op}>
          <rect x={x} y={ry} width={w} height={rowH - 8} rx={12} fill={alpha(C.ok, 0.05 + 0.1 * tk)} stroke={alpha(tk > 0.5 ? C.ok : C.muted, 0.35 + 0.4 * tk)} strokeWidth={2} />
          <text x={x + 18} y={cy + size * 0.36} fontSize={size * 0.85} fontWeight={800} fill={C.muted}>
            {String(i + 1).padStart(2, ' ')}
          </text>
          <text x={x + 18 + size * 1.6} y={cy + size * 0.36} fontSize={size} fontWeight={700} fill={C.text}>
            {q}
          </text>
          <rect x={x + w - rowH * 0.95} y={cy - rowH * 0.3} width={rowH * 0.6} height={rowH * 0.6} rx={8} fill="none" stroke={alpha(C.muted, 0.7)} strokeWidth={3} />
          {tk > 0 && (
            <path
              d={`M ${x + w - rowH * 0.85} ${cy} l ${rowH * 0.16} ${rowH * 0.16} l ${rowH * 0.3} ${-rowH * 0.34}`}
              fill="none"
              stroke={C.ok}
              strokeWidth={7}
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray={`${tk} 1`}
            />
          )}
        </g>
      );
    })}
  </g>
);

export type ListRow = { appear: number; lit: number };

/** Heights of the recipe's rows (item 1, 2 with its sub line, 3 with the sub-item, 4), in units of `size`. */
const ROW_H = [1.75, 2.55, 2.75, 1.75];

/** Height of the recipe list at font `size`. */
export const recipeHeight = (size: number) => ROW_H.reduce((a, b) => a + b, 0) * size;

/**
 * The recipe: four numbered items, the one being spoken lit (accent wash, bright text), the earlier
 * ones kept in plain text; item 3 carries "→ LoRA first" and the sub-item about ordinary text.
 */
export const RecipeList: React.FC<{
  x: number;
  y: number;
  w: number;
  size: number;
  items: readonly { n: string; title: string; sub: string }[];
  rows: ListRow[];
  lora: number;
  loraText: string;
  replay: ListRow;
  replayText: string;
}> = ({ x, y, w, size, items, rows, lora, loraText, replay, replayText }) => {
  let cy = y;
  return (
    <g>
      {items.map((it, i) => {
        const r = rows[i] ?? { appear: 0, lit: 0 };
        const top = cy;
        cy += ROW_H[i] * size;
        const a = cl(r.appear);
        if (a <= 0) return null;
        const lit = cl(r.lit);
        const titleY = top + size * 1.05;
        const head = `${it.n} · ${it.title}`;
        const bodyH = (i === 1 ? 2.3 : 1.5) * size;
        return (
          <g key={i} opacity={a} transform={`translate(${(1 - a) * -30} 0)`}>
            <g style={lit > 0.01 ? glow(C.accentText, 0.8 * lit) : undefined}>
              <rect x={x} y={top} width={w} height={bodyH} rx={18} fill={alpha(C.accent, 0.08 + 0.3 * lit)} stroke={alpha(C.accentText, 0.15 + 0.85 * lit)} strokeWidth={3} />
            </g>
            <rect x={x} y={top + 10} width={8} height={bodyH - 20} rx={4} fill={alpha(C.accentText, 0.3 + 0.7 * lit)} />
            <text x={x + size * 0.6} y={titleY} fontSize={size} fontWeight={800} fill={alpha(C.text, 0.62 + 0.38 * lit)}>
              {head}
              {i === 2 && lora > 0 && (
                <tspan fill={C.ok} opacity={cl(lora)}>
                  {' '}
                  {loraText}
                </tspan>
              )}
            </text>
            {i === 1 && it.sub && (
              <text x={x + size * 1.45} y={titleY + size * 0.95} fontSize={size * 0.72} fontWeight={700} fill={alpha(C.muted, 0.75 + 0.25 * lit)}>
                {it.sub}
              </text>
            )}
            {i === 2 && replay.appear > 0 && (
              <g opacity={cl(replay.appear)}>
                <g style={replay.lit > 0.01 ? glow(C.warm, 0.8 * cl(replay.lit)) : undefined}>
                  <rect
                    x={x + size * 1.2}
                    y={top + bodyH + size * 0.12}
                    width={w - size * 1.2}
                    height={size * 1.05}
                    rx={14}
                    fill={alpha(C.warm, 0.06 + 0.22 * cl(replay.lit))}
                    stroke={alpha(C.warm, 0.25 + 0.75 * cl(replay.lit))}
                    strokeWidth={3}
                  />
                </g>
                <text x={x + size * 1.65} y={top + bodyH + size * 0.86} fontSize={size * 0.72} fontWeight={800} fill={alpha(C.warm, 0.7 + 0.3 * cl(replay.lit))}>
                  {replayText}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
};
