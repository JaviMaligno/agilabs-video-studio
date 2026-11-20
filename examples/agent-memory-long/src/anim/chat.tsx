// Drawing pieces of the trip chat (a stylised chat window, not a screenshot of any product): the
// window, the message bubbles, the "later" divider, and the app's "Memory" panel (a list of notes).
// Shared by ChatTrip (cold open, next morning, "save to memory"), FilingCabinet (the callback to the
// cold open) and ClipboardForm (the app memory beside the form). SVG in frame pixels.
import React from 'react';
import { C, alpha } from '../brand.ts';
import { glow } from './office.tsx';

const cl = (x: number) => (Number.isFinite(x) ? Math.min(1, Math.max(0, x)) : 0);

/** Approximate advance of one Inter bold character, as a fraction of the font size. */
const CHAR = 0.56;

/** Words wrapped into lines of at most `maxChars` characters (a word longer than that keeps its line). */
export const wrap = (text: string, maxChars: number): string[] => {
  const out: string[] = [];
  let cur = '';
  for (const w of text.split(' ')) {
    if (!cur) cur = w;
    else if ((cur + ' ' + w).length <= maxChars) cur += ' ' + w;
    else {
      out.push(cur);
      cur = w;
    }
  }
  if (cur) out.push(cur);
  return out;
};

/** Size of a bubble for `text` at font `size`, no wider than `maxW` (plus room for a drawn tick). */
export const bubbleSize = (text: string, size: number, maxW: number, tick = false) => {
  const pad = size * 0.7;
  const extra = tick ? size * 1.3 : 0;
  const maxChars = Math.max(4, Math.floor((maxW - 2 * pad - extra) / (size * CHAR)));
  const lines = wrap(text, maxChars);
  const longest = Math.max(...lines.map((l) => l.length));
  const w = Math.min(maxW, longest * size * CHAR + 2 * pad + extra);
  const h = lines.length * size * 1.28 + pad * 1.2;
  return { w, h, lines, pad };
};

/** A tick drawn as a path (no glyph), its left edge at (x, y - size/2). */
const TickMark: React.FC<{ x: number; y: number; size: number; color: string }> = ({ x, y, size, color }) => (
  <path
    d={`M ${x} ${y - size * 0.32} L ${x + size * 0.32} ${y} L ${x + size * 0.9} ${y - size * 0.7}`}
    fill="none"
    stroke={color}
    strokeWidth={size * 0.16}
    strokeLinecap="round"
    strokeLinejoin="round"
  />
);

export type BubbleProps = {
  /** user bubbles hang from their right edge at x, AI bubbles from their left edge. */
  x: number;
  y: number;
  side: 'user' | 'ai';
  text: string;
  size: number;
  maxW: number;
  opacity?: number;
  /** An accent glow (a bubble lit as the voice names it), 0..1. */
  lit?: number;
  /** The wrong booking: red outline and wash, pulsing with `alert` (0..1). */
  alert?: number;
  /** A word drawn in rose (e.g. "Thursday"), or in `hotColor`, underlined. */
  hot?: string;
  hotColor?: string;
  /** How much of the text is typed out, 0..1. */
  typed?: number;
  tick?: boolean;
  /** 1 = drawn with a dashed outline and no fill (a note that never got written). */
  ghost?: number;
};

/** A chat bubble. Returns its height through `bubbleSize` for layout by the caller. */
export const Bubble: React.FC<BubbleProps> = ({ x, y, side, text, size, maxW, opacity = 1, lit = 0, alert = 0, hot, hotColor, typed = 1, tick = false, ghost = 0 }) => {
  if (opacity <= 0) return null;
  const { w, h, lines, pad } = bubbleSize(text, size, maxW, tick);
  const left = side === 'user' ? x - w : x;
  const user = side === 'user';
  const a = cl(alert);
  const fill = ghost > 0 ? 'none' : a > 0 ? alpha(C.marker, 0.16 + 0.18 * a) : user ? C.accent : C.card;
  const stroke = a > 0 ? C.marker : user ? alpha(C.accentText, 0.9) : alpha(C.accentText, 0.45 + 0.55 * cl(lit));
  const total = text.length;
  let shown = Math.ceil(total * cl(typed));
  const style = a > 0 ? glow(C.marker, 0.35 + 0.65 * a) : lit > 0.01 ? glow(C.accentText, lit) : undefined;
  return (
    <g opacity={cl(opacity)}>
      <g style={style}>
        <rect
          x={left}
          y={y}
          width={w}
          height={h}
          rx={Math.min(28, h / 2)}
          fill={fill}
          stroke={stroke}
          strokeWidth={a > 0 ? 4 + 2 * a : 3}
          strokeDasharray={ghost > 0 ? '12 9' : undefined}
        />
      </g>
      {lines.map((line, i) => {
        const part = line.slice(0, Math.max(0, shown));
        shown -= line.length + 1;
        if (!part) return null;
        const ty = y + pad * 0.6 + size * (1.28 * i + 0.98);
        const words = part.split(' ');
        return (
          <text key={i} x={left + pad} y={ty} fontSize={size} fontWeight={700} fill={ghost > 0 ? C.muted : C.text} fontStyle={ghost > 0 ? 'italic' : undefined}>
            {words.map((wd, k) => {
              const core = wd.replace(/[^\w]+$/, '');
              const tail = wd.slice(core.length);
              const isHot = !!hot && core === hot;
              return (
                <React.Fragment key={k}>
                  {k > 0 ? ' ' : ''}
                  <tspan fill={isHot ? (hotColor ?? C.marker) : undefined} fontWeight={isHot ? 800 : undefined} textDecoration={isHot && hotColor ? 'underline' : undefined}>
                    {core}
                  </tspan>
                  {tail}
                </React.Fragment>
              );
            })}
          </text>
        );
      })}
      {tick && typed >= 1 && (
        <TickMark x={left + w - pad - size * 1.0} y={y + pad * 0.6 + size * (1.28 * (lines.length - 1) + 0.98) - size * 0.08} size={size} color={a > 0 ? C.marker : C.ok} />
      )}
    </g>
  );
};

/** The "later" divider between parts of the chat. */
export const Divider: React.FC<{ x: number; y: number; w: number; text: string; size: number; opacity?: number }> = ({ x, y, w, text, size, opacity = 1 }) => {
  const tw = text.length * size * CHAR + 40;
  return (
    <g opacity={cl(opacity)}>
      <line x1={x} x2={x + (w - tw) / 2} y1={y} y2={y} stroke={alpha(C.muted, 0.45)} strokeWidth={2} strokeDasharray="8 8" />
      <line x1={x + (w + tw) / 2} x2={x + w} y1={y} y2={y} stroke={alpha(C.muted, 0.45)} strokeWidth={2} strokeDasharray="8 8" />
      <text x={x + w / 2} y={y + size * 0.36} textAnchor="middle" fontSize={size} fontWeight={600} fontStyle="italic" fill={C.muted}>
        {text}
      </text>
    </g>
  );
};

/** Collapsed messages (an hour of hotels and prices): grey bars standing in for bubbles. */
export const Collapsed: React.FC<{ x: number; y: number; w: number; rows: number; opacity?: number }> = ({ x, y, w, rows, opacity = 1 }) => (
  <g opacity={cl(opacity)}>
    {Array.from({ length: rows }, (_, i) => {
      const user = i % 2 === 1;
      const bw = w * (0.38 + 0.14 * ((i * 7) % 3));
      return <rect key={i} x={user ? x + w - bw : x} y={y + i * 34} width={bw} height={24} rx={12} fill={user ? alpha(C.accent, 0.35) : alpha(C.muted, 0.22)} />;
    })}
  </g>
);

/**
 * The chat window: a rounded frame with a header (three dots, a round assistant icon and a title)
 * and an input bar at the bottom. `morning` washes it in warm light (the next day).
 */
export const ChatWindow: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  morning?: number;
  cursor?: number;
  draft?: string;
  draftSize?: number;
  opacity?: number;
}> = ({ x, y, w, h, title, morning = 0, cursor = 0, draft = '', draftSize = 28, opacity = 1 }) => {
  const head = 70;
  const inputH = 70;
  const m = cl(morning);
  return (
    <g opacity={cl(opacity)}>
      <rect x={x} y={y} width={w} height={h} rx={28} fill={C.bg1} stroke={alpha(C.accentText, 0.55)} strokeWidth={4} />
      {m > 0 && (
        <g opacity={m}>
          <defs>
            <linearGradient id="chat-morning" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={C.warm} stopOpacity={0.3} />
              <stop offset="0.6" stopColor={C.warm} stopOpacity={0.06} />
              <stop offset="1" stopColor={C.warm} stopOpacity={0} />
            </linearGradient>
          </defs>
          <rect x={x + 2} y={y + head} width={w - 4} height={h - head - 2} rx={26} fill="url(#chat-morning)" />
        </g>
      )}
      <path d={`M ${x} ${y + head} V ${y + 28} Q ${x} ${y} ${x + 28} ${y} H ${x + w - 28} Q ${x + w} ${y} ${x + w} ${y + 28} V ${y + head} Z`} fill={C.card} />
      <line x1={x} x2={x + w} y1={y + head} y2={y + head} stroke={alpha(C.accentText, 0.35)} strokeWidth={2} />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={x + 34 + i * 26} cy={y + head / 2} r={8} fill={alpha(C.muted, 0.55)} />
      ))}
      <circle cx={x + 150} cy={y + head / 2} r={18} fill={alpha(C.accent, 0.7)} stroke={C.accentText} strokeWidth={3} />
      <circle cx={x + 144} cy={y + head / 2 - 3} r={3} fill={C.text} />
      <circle cx={x + 156} cy={y + head / 2 - 3} r={3} fill={C.text} />
      <text x={x + 182} y={y + head / 2 + 10} fontSize={28} fontWeight={700} fill={C.text}>
        {title}
      </text>
      {m > 0.05 && (
        // a small sun in the header: the next morning
        <g opacity={m} transform={`translate(${x + w - 60} ${y + head / 2})`}>
          <circle r={14} fill={C.warm} />
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i * Math.PI) / 4;
            return <line key={i} x1={20 * Math.cos(a)} y1={20 * Math.sin(a)} x2={27 * Math.cos(a)} y2={27 * Math.sin(a)} stroke={C.warm} strokeWidth={4} strokeLinecap="round" />;
          })}
        </g>
      )}
      {/* the input bar */}
      <rect x={x + 24} y={y + h - inputH - 18} width={w - 48} height={inputH} rx={inputH / 2} fill={C.bg0} stroke={alpha(C.muted, 0.4)} strokeWidth={2} />
      {draft ? (
        <text x={x + 56} y={y + h - 18 - inputH / 2 + draftSize * 0.36} fontSize={draftSize} fontWeight={700} fill={C.text}>
          {draft}
        </text>
      ) : (
        <text x={x + 56} y={y + h - 18 - inputH / 2 + 10} fontSize={26} fontWeight={600} fill={alpha(C.muted, 0.7)}>
          Message
        </text>
      )}
      {cursor > 0.5 && (
        <rect x={x + 52 + (draft ? draft.length * draftSize * CHAR + 6 : 0)} y={y + h - 18 - inputH / 2 - 18} width={4} height={36} fill={C.accentText} />
      )}
      <circle cx={x + w - 24 - inputH / 2} cy={y + h - 18 - inputH / 2} r={22} fill={alpha(C.accent, 0.8)} />
      <path d={`M ${x + w - 24 - inputH / 2 - 8} ${y + h - 18 - inputH / 2} h 16 m -7 -8 l 8 8 l -8 8`} fill="none" stroke={C.text} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};

export type Note = { text: string; opacity?: number; lit?: number; ghost?: number; cross?: number };

/**
 * The app's "Memory" panel: a titled list of short notes kept outside the chat. A `ghost` note is
 * drawn dashed (it never got written down); `cross` strikes it with a rose cross.
 */
export const MemoryPanel: React.FC<{ x: number; y: number; w: number; notes: Note[]; size?: number; opacity?: number; lit?: number }> = ({
  x,
  y,
  w,
  notes,
  size = 30,
  opacity = 1,
  lit = 0,
}) => {
  if (opacity <= 0) return null;
  const rowH = size * 1.9;
  const head = size * 2.4;
  const h = head + notes.length * rowH + size * 0.8;
  return (
    <g opacity={cl(opacity)}>
      <g style={lit > 0.01 ? glow(C.accentText, lit) : undefined}>
        <rect x={x} y={y} width={w} height={h} rx={24} fill={C.card} stroke={alpha(C.accentText, 0.55 + 0.45 * cl(lit))} strokeWidth={4} />
      </g>
      {/* a small bookmark icon and the title */}
      <path d={`M ${x + 30} ${y + size * 0.7} h ${size * 0.8} v ${size * 1.1} l ${-size * 0.4} ${-size * 0.3} l ${-size * 0.4} ${size * 0.3} Z`} fill={C.accentText} />
      <text x={x + 30 + size * 1.25} y={y + size * 1.55} fontSize={size * 1.1} fontWeight={800} fill={C.text}>
        Memory
      </text>
      <line x1={x + 20} x2={x + w - 20} y1={y + head - size * 0.3} y2={y + head - size * 0.3} stroke={alpha(C.accentText, 0.3)} strokeWidth={2} />
      {notes.map((n, i) => {
        const ny = y + head + i * rowH;
        const op = cl(n.opacity ?? 1);
        if (op <= 0) return null;
        const g = cl(n.ghost ?? 0);
        const nl = cl(n.lit ?? 0);
        return (
          <g key={i} opacity={op}>
            <g style={nl > 0.01 ? glow(C.ok, nl) : undefined}>
              <rect
                x={x + 20}
                y={ny}
                width={w - 40}
                height={rowH - size * 0.4}
                rx={12}
                fill={g > 0 ? 'none' : alpha(C.text, 0.06 + 0.1 * nl)}
                stroke={g > 0 ? alpha(C.muted, 0.7) : nl > 0.01 ? C.ok : alpha(C.muted, 0.25)}
                strokeWidth={g > 0 ? 3 : 2 + 2 * nl}
                strokeDasharray={g > 0 ? '10 8' : undefined}
              />
            </g>
            <circle cx={x + 44} cy={ny + (rowH - size * 0.4) / 2} r={size * 0.16} fill={g > 0 ? C.muted : C.accentText} />
            <text x={x + 64} y={ny + (rowH - size * 0.4) / 2 + size * 0.36} fontSize={size} fontWeight={700} fontStyle={g > 0 ? 'italic' : undefined} fill={g > 0 ? C.muted : C.text}>
              {n.text}
            </text>
            {(n.cross ?? 0) > 0 && (
              <g opacity={cl(n.cross ?? 0)} transform={`translate(${x + w - 52} ${ny + (rowH - size * 0.4) / 2})`}>
                <circle r={size * 0.62} fill={C.marker} />
                <path d={`M ${-size * 0.24} ${-size * 0.24} L ${size * 0.24} ${size * 0.24} M ${size * 0.24} ${-size * 0.24} L ${-size * 0.24} ${size * 0.24}`} stroke={C.bg0} strokeWidth={size * 0.14} strokeLinecap="round" />
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
};

/** Height of a MemoryPanel with `n` notes at `size`, for layout. */
export const panelHeight = (n: number, size = 30): number => size * 2.4 + n * size * 1.9 + size * 0.8;
