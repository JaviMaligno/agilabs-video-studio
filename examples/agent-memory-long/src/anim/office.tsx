// Vector drawing pieces of the memory-office world, shared by the bespoke components: the robot
// (with the bookshelf in its head), the red slip, the desk, pages of the trip chat (text, hotel
// cards, price tags, a map), the notecard, the filing cabinet, the magnifier, the clipboard, the
// gauge, the clock, tick and cross.
// Everything is SVG in frame pixels of the scene's format (Canvas.tsx), drawn from the brand tokens only.
import React from 'react';
import { C, alpha } from '../brand.ts';
import { SLIP_TEXT } from './memory.ts';
import { Canvas } from './Canvas.tsx';

const cl = (x: number) => (Number.isFinite(x) ? Math.min(1, Math.max(0, x)) : 0);

/**
 * Full-frame SVG canvas (Canvas.tsx). `zoom` scales about the stage centre (a camera push or pull).
 * `design="both"` once the component lays itself out per format with place(); the default,
 * "vertical", fits a 1080x1920 drawing into the landscape stage (a stopgap until it is ported).
 */
export const Frame: React.FC<{ children: React.ReactNode; zoom?: number; vertical?: boolean; design?: 'both' | 'vertical' }> = ({
  children,
  zoom = 1,
  vertical = true,
  design = 'vertical',
}) => (
  <Canvas vertical={vertical} zoom={zoom} design={design}>
    {children}
  </Canvas>
);

/** A soft glow around a group, `a` in [0, 1]. */
export const glow = (color: string, a: number): React.CSSProperties =>
  a > 0.01 ? { filter: `drop-shadow(0 0 ${Math.round(22 * a)}px ${alpha(color, 0.8 * cl(a))})` } : {};

/** Stroke of an object: dim outline at lit 0, bright accent at lit 1. */
export const edge = (lit: number, color: string = C.accentText) => alpha(color, 0.3 + 0.7 * cl(lit));

/** Book colours on the head shelf (brand tokens only; rose is kept for the slip). */
const BOOKS = [C.accent, C.ok, C.warm, C.accent2, C.accentText, C.muted, C.ok, C.accent];

/** The bookshelf in the robot's head: a window with books on a plank, behind glass doors. */
export const BookShelf: React.FC<{ x: number; y: number; w: number; h: number; lit: number; doors?: number; flash?: number }> = ({ x, y, w, h, lit, doors = 0, flash = 0 }) => {
  const n = BOOKS.length;
  const bw = (w - 24) / n;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={Math.min(14, h * 0.15)} fill={C.bg1} stroke={edge(lit)} strokeWidth={Math.max(3, w * 0.02)} />
      {BOOKS.map((c, i) => {
        const bh = h * (0.62 + 0.22 * (((i * 37) % 10) / 10));
        return (
          <rect
            key={i}
            x={x + 12 + i * bw + bw * 0.08}
            y={y + h - 10 - bh}
            width={bw * 0.84}
            height={bh}
            rx={Math.max(2, bw * 0.12)}
            fill={alpha(c, 0.25 + 0.7 * cl(lit))}
            stroke={alpha(C.bg0, 0.6)}
            strokeWidth={1.5}
          />
        );
      })}
      <rect x={x + 6} y={y + h - 10} width={w - 12} height={6} rx={3} fill={edge(lit, C.muted)} />
      {doors > 0 && (
        <g opacity={cl(doors)}>
          <rect x={x + 4} y={y + 4} width={w / 2 - 6} height={h - 8} rx={8} fill={alpha(C.accentText, 0.1 + 0.25 * cl(flash))} stroke={alpha(C.text, 0.55)} strokeWidth={3} />
          <rect x={x + w / 2 + 2} y={y + 4} width={w / 2 - 6} height={h - 8} rx={8} fill={alpha(C.accentText, 0.1 + 0.25 * cl(flash))} stroke={alpha(C.text, 0.55)} strokeWidth={3} />
          <path d={`M ${x + w * 0.12} ${y + h * 0.3} L ${x + w * 0.24} ${y + h * 0.16}`} stroke={alpha(C.text, 0.4)} strokeWidth={4} strokeLinecap="round" />
          <path d={`M ${x + w * 0.62} ${y + h * 0.3} L ${x + w * 0.74} ${y + h * 0.16}`} stroke={alpha(C.text, 0.4)} strokeWidth={4} strokeLinecap="round" />
        </g>
      )}
    </g>
  );
};

/** Where the robot's left hand is (frame pixels), for holding the slip. */
export const robotHand = (x: number, y: number, s: number, armUp: number) => {
  const p = cl(armUp);
  return { x: x + s * (-150 - 30 * p), y: y + s * (370 - 330 * p) };
};

/**
 * The robot. (x, y) is the top centre of its head; it is about 450·s tall. `shelf` lights the
 * bookshelf in its head; `armUp` raises the left arm (to hold the slip); `face` -1 mirrors it.
 */
export const Robot: React.FC<{
  x: number;
  y: number;
  s?: number;
  shelf?: number;
  shelfGlow?: number;
  armUp?: number;
  blink?: number;
  face?: number;
  opacity?: number;
}> = ({ x, y, s = 1, shelf = 0, shelfGlow = 0, armUp = 0, blink = 0, face = 1, opacity = 1 }) => {
  const up = cl(armUp);
  const hand = { x: -150 - 30 * up, y: 370 - 330 * up };
  const eye = 1 - 0.9 * cl(blink);
  const line = C.accentText;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * (face < 0 ? -1 : 1)} ${s})`} opacity={opacity}>
      {/* wheels and base */}
      <rect x={-110} y={392} width={220} height={34} rx={17} fill={C.bg1} stroke={alpha(line, 0.7)} strokeWidth={5} />
      <circle cx={-62} cy={430} r={24} fill={C.card} stroke={line} strokeWidth={5} />
      <circle cx={62} cy={430} r={24} fill={C.card} stroke={line} strokeWidth={5} />
      {/* right arm (resting) */}
      <path d="M 95 230 Q 150 300 140 372" fill="none" stroke={line} strokeWidth={26} strokeLinecap="round" />
      <path d="M 95 230 Q 150 300 140 372" fill="none" stroke={C.card} strokeWidth={14} strokeLinecap="round" />
      <circle cx={140} cy={378} r={18} fill={C.card} stroke={line} strokeWidth={5} />
      {/* body */}
      <rect x={-95} y={190} width={190} height={205} rx={34} fill={C.card} stroke={line} strokeWidth={6} />
      <circle cx={0} cy={262} r={20} fill={alpha(C.accent, 0.5)} stroke={line} strokeWidth={4} />
      <rect x={-48} y={312} width={96} height={12} rx={6} fill={alpha(C.muted, 0.4)} />
      <rect x={-48} y={336} width={64} height={12} rx={6} fill={alpha(C.muted, 0.4)} />
      {/* neck and head */}
      <rect x={-26} y={166} width={52} height={30} rx={8} fill={C.bg1} stroke={line} strokeWidth={5} />
      <line x1={0} y1={0} x2={0} y2={-34} stroke={line} strokeWidth={6} />
      <circle cx={0} cy={-40} r={11} fill={C.accentText} />
      <rect x={-112} y={0} width={224} height={172} rx={38} fill={C.card} stroke={line} strokeWidth={6} />
      <g style={glow(C.accentText, shelfGlow)}>
        <BookShelf x={-82} y={16} w={164} h={76} lit={shelf} />
      </g>
      <ellipse cx={-44} cy={128} rx={17} ry={17 * eye} fill={C.accentText} />
      <ellipse cx={44} cy={128} rx={17} ry={17 * eye} fill={C.accentText} />
      <rect x={-20} y={152} width={40} height={6} rx={3} fill={alpha(C.muted, 0.7)} />
      {/* left arm (raised to hold the slip) */}
      <path d={`M -95 230 Q ${-150 - 10 * up} ${300 - 120 * up} ${hand.x} ${hand.y}`} fill="none" stroke={line} strokeWidth={26} strokeLinecap="round" />
      <path d={`M -95 230 Q ${-150 - 10 * up} ${300 - 120 * up} ${hand.x} ${hand.y}`} fill="none" stroke={C.card} strokeWidth={14} strokeLinecap="round" />
      <circle cx={hand.x} cy={hand.y + 6} r={18} fill={C.card} stroke={line} strokeWidth={5} />
    </g>
  );
};

/** The red slip, centred on (x, y): "FLIGHT: FRIDAY". */
export const Slip: React.FC<{ x: number; y: number; w?: number; rot?: number; opacity?: number; glowA?: number; text?: string }> = ({
  x,
  y,
  w = 250,
  rot = 0,
  opacity = 1,
  glowA = 0,
  text = SLIP_TEXT,
}) => {
  if (opacity <= 0) return null;
  const h = w * 0.36;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={cl(opacity)} style={glow(C.marker, glowA)}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={w * 0.04} fill={C.marker} stroke={alpha(C.bg0, 0.5)} strokeWidth={2} />
      <rect x={-w / 2 + w * 0.05} y={-h / 2 + h * 0.12} width={w * 0.9} height={h * 0.08} rx={2} fill={alpha(C.bg0, 0.25)} />
      <text x={0} y={h * 0.16} textAnchor="middle" fontSize={w * 0.085} fontWeight={800} fill={C.bg0} letterSpacing={w * 0.002}>
        {text}
      </text>
    </g>
  );
};

/** A desk seen from the front: the top at y, legs below (about 170 px tall). */
export const Desk: React.FC<{ x: number; y: number; w: number; lit?: number; glowA?: number }> = ({ x, y, w, lit = 1, glowA = 0 }) => (
  <g style={glow(C.accentText, glowA)}>
    <rect x={x + 34} y={y + 24} width={24} height={150} rx={6} fill={C.bg1} stroke={edge(lit * 0.7)} strokeWidth={4} />
    <rect x={x + w - 58} y={y + 24} width={24} height={150} rx={6} fill={C.bg1} stroke={edge(lit * 0.7)} strokeWidth={4} />
    <rect x={x + w * 0.52} y={y + 24} width={w * 0.4} height={70} rx={8} fill={C.bg1} stroke={edge(lit * 0.7)} strokeWidth={4} />
    <rect x={x + w * 0.67} y={y + 54} width={w * 0.1} height={9} rx={4} fill={edge(lit, C.muted)} />
    <rect x={x} y={y} width={w} height={28} rx={9} fill={C.card} stroke={edge(lit)} strokeWidth={5} />
  </g>
);

/** What a page of the chat shows: plain text, a hotel card, a price tag, or a map. */
export type PageKind = 'text' | 'hotel' | 'price' | 'map';

/** A page (a loose sheet of the conversation), centred on (x, y). */
export const Page: React.FC<{ x: number; y: number; w?: number; rot?: number; opacity?: number; scale?: number; kind?: PageKind }> = ({
  x,
  y,
  w = 220,
  rot = 0,
  opacity = 1,
  scale = 1,
  kind = 'text',
}) => {
  if (opacity <= 0) return null;
  const h = w * 0.62;
  const L = -w / 2;
  const T = -h / 2;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`} opacity={cl(opacity)}>
      <rect x={L} y={T} width={w} height={h} rx={6} fill={C.text} stroke={alpha(C.bg0, 0.55)} strokeWidth={2} />
      {kind === 'text' &&
        [0, 1, 2, 3].map((i) => (
          <rect key={i} x={L + 16} y={T + 18 + i * (h / 5)} width={(w - 32) * (i === 3 ? 0.55 : 0.9 - 0.08 * (i % 2))} height={6} rx={3} fill={alpha(C.muted, 0.75)} />
        ))}
      {kind === 'hotel' && (
        // a hotel card: a small building with a roof, stars, two text lines
        <g>
          <rect x={L + 16} y={T + h * 0.3} width={w * 0.3} height={h * 0.56} rx={4} fill={alpha(C.accent, 0.8)} />
          <path d={`M ${L + 10} ${T + h * 0.32} L ${L + 16 + w * 0.15} ${T + h * 0.1} L ${L + 22 + w * 0.3} ${T + h * 0.32} Z`} fill={C.accent2} />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={L + 24 + (i % 2) * w * 0.13} y={T + h * (0.4 + 0.2 * Math.floor(i / 2))} width={w * 0.07} height={h * 0.1} fill={alpha(C.text, 0.9)} />
          ))}
          {[0, 1, 2].map((i) => (
            <path key={i} d={starPath(L + w * 0.46 + i * w * 0.1, T + h * 0.24, w * 0.035)} fill={C.warm} />
          ))}
          <rect x={L + w * 0.42} y={T + h * 0.5} width={w * 0.48} height={6} rx={3} fill={alpha(C.muted, 0.75)} />
          <rect x={L + w * 0.42} y={T + h * 0.68} width={w * 0.32} height={6} rx={3} fill={alpha(C.muted, 0.75)} />
        </g>
      )}
      {kind === 'price' && (
        // a price tag with a string hole and a currency sign
        <g>
          <path d={`M ${L + w * 0.12} ${T + h * 0.5} L ${L + w * 0.3} ${T + h * 0.18} H ${L + w * 0.86} V ${T + h * 0.82} H ${L + w * 0.3} Z`} fill={alpha(C.ok, 0.85)} stroke={alpha(C.bg0, 0.5)} strokeWidth={2} />
          <circle cx={L + w * 0.3} cy={T + h * 0.5} r={w * 0.035} fill={alpha(C.text, 0.95)} />
          <text x={L + w * 0.6} y={T + h * 0.5 + w * 0.08} textAnchor="middle" fontSize={w * 0.24} fontWeight={800} fill={C.bg0}>
            $
          </text>
        </g>
      )}
      {kind === 'map' && (
        // a folded map: panels, a dashed route and a pin
        <g>
          {[0, 1, 2].map((i) => (
            <rect key={i} x={L + 10 + i * (w - 20) / 3} y={T + 10} width={(w - 20) / 3} height={h - 20} fill={i % 2 ? alpha(C.ok, 0.35) : alpha(C.ok, 0.22)} />
          ))}
          <path d={`M ${L + w * 0.14} ${T + h * 0.75} C ${L + w * 0.35} ${T + h * 0.2}, ${L + w * 0.55} ${T + h * 0.9}, ${L + w * 0.78} ${T + h * 0.34}`} fill="none" stroke={C.accent} strokeWidth={4} strokeDasharray="8 6" />
          <path d={`M ${L + w * 0.78} ${T + h * 0.34} c -12 -14 -12 -30 0 -32 c 12 2 12 18 0 32 Z`} fill={C.marker} />
        </g>
      )}
    </g>
  );
};

/** A five-point star centred on (x, y), radius r. */
const starPath = (x: number, y: number, r: number): string =>
  Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    return `${i ? 'L' : 'M'} ${(x + rr * Math.cos(a)).toFixed(1)} ${(y + rr * Math.sin(a)).toFixed(1)}`;
  }).join(' ') + ' Z';

/** The notecard: a ruled card with a rose top rule; `text` is revealed letter by letter. */
export const Notecard: React.FC<{ x: number; y: number; w?: number; rot?: number; opacity?: number; text?: string; write?: number; lit?: number; blur?: number }> = ({
  x,
  y,
  w = 280,
  rot = -3,
  opacity = 1,
  text = '',
  write = 1,
  lit = 1,
  blur = 0,
}) => {
  if (opacity <= 0) return null;
  const h = w * 0.6;
  const shown = text.slice(0, Math.ceil(text.length * cl(write)));
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={cl(opacity)} style={glow(C.accentText, lit > 0.99 ? 0.35 : 0)}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={8} fill={alpha(C.text, 0.35 + 0.6 * cl(lit))} stroke={edge(lit)} strokeWidth={3} />
      <rect x={-w / 2 + 10} y={-h / 2 + h * 0.2} width={w - 20} height={4} fill={alpha(C.marker, 0.8)} />
      {[1, 2, 3].map((i) => (
        <rect key={i} x={-w / 2 + 10} y={-h / 2 + h * 0.2 + i * h * 0.22} width={w - 20} height={2} fill={alpha(C.accentText, 0.45)} />
      ))}
      {shown && (
        <text x={-w / 2 + 18} y={-h / 2 + h * 0.2 + h * 0.18} fontSize={Math.min(w * 0.11, (w - 34) / (Math.max(1, text.length) * 0.56))} fontWeight={700} fontStyle="italic" fill={C.bg0}>
          {shown}
        </text>
      )}
      {blur > 0 &&
        [0, 1].map((i) => (
          <path key={i} d={`M ${-w / 2 + 20} ${-h / 2 + h * (0.66 + i * 0.18)} q 20 -10 40 0 t 40 0 t 40 0 t 40 0`} fill="none" stroke={alpha(C.muted, 0.8 * cl(blur))} strokeWidth={4} strokeLinecap="round" />
        ))}
    </g>
  );
};

/**
 * A filing cabinet: three drawers; drawer i slides out to the right by drawers[i] · open px, its
 * folder tabs showing. `peek` shows the red slip's corner sticking out of drawer `peekDrawer`.
 */
export const Cabinet: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  drawers?: number[];
  open?: number;
  lit?: number;
  glowA?: number;
  peek?: number;
  peekDrawer?: number;
  peekGlow?: number;
  found?: number[];
}> = ({ x, y, w, h, drawers = [0, 0, 0], open = 170, lit = 1, glowA = 0, peek = 0, peekDrawer = 1, peekGlow = 0, found = [] }) => {
  const dh = h / 3;
  return (
    <g style={glow(C.ok, glowA)}>
      <rect x={x} y={y} width={w} height={h} rx={14} fill={C.card} stroke={edge(lit)} strokeWidth={5} />
      {[0, 1, 2].map((i) => {
        const d = cl(drawers[i] ?? 0) * open;
        const top = y + i * dh + 12;
        const fh = dh - 24;
        const f = cl(found[i] ?? 0);
        return (
          <g key={i}>
            {d > 0 && (
              <g>
                {/* the tray, pulled out, with folder tabs */}
                <rect x={x + w - 12} y={top + 16} width={d + 4} height={fh - 26} fill={C.bg1} stroke={edge(lit * 0.8)} strokeWidth={3} />
                {[0, 1, 2, 3].map((k) => (
                  <rect key={k} x={x + w + 4 + k * Math.max(8, (d - 30) / 4)} y={top + 4} width={20} height={24} rx={3} fill={alpha(C.muted, 0.7)} />
                ))}
                {f > 0 && <Page x={x + w + d / 2} y={top - 50 - 40 * f} w={150} rot={-6} opacity={f} />}
              </g>
            )}
            <rect x={x + 12 + d} y={top} width={w - 24} height={fh} rx={10} fill={C.card} stroke={edge(lit)} strokeWidth={4} />
            <rect x={x + w / 2 - 50 + d} y={top + fh / 2 - 8} width={100} height={16} rx={8} fill={edge(lit, C.muted)} />
            <rect x={x + w / 2 - 36 + d} y={top + 18} width={72} height={26} rx={4} fill="none" stroke={edge(lit * 0.7, C.muted)} strokeWidth={3} />
          </g>
        );
      })}
      {peek > 0 && (
        <g opacity={cl(peek)} style={glow(C.marker, peekGlow)}>
          <rect x={x + w * 0.58} y={y + peekDrawer * dh - 10} width={70} height={22} rx={3} fill={C.marker} transform={`rotate(-8 ${x + w * 0.58} ${y + peekDrawer * dh})`} />
        </g>
      )}
    </g>
  );
};

/** A magnifier centred on its lens (x, y); `question` raises a "?" above it, `cross` strikes it. */
export const Lens: React.FC<{ x: number; y: number; r?: number; opacity?: number; question?: number }> = ({ x, y, r = 52, opacity = 1, question = 0 }) => {
  if (opacity <= 0) return null;
  return (
    <g opacity={cl(opacity)}>
      <line x1={x + r * 0.7} y1={y + r * 0.7} x2={x + r * 1.7} y2={y + r * 1.7} stroke={C.text} strokeWidth={r * 0.32} strokeLinecap="round" />
      <circle cx={x} cy={y} r={r} fill={alpha(C.accentText, 0.18)} stroke={C.text} strokeWidth={r * 0.18} />
      <path d={`M ${x - r * 0.5} ${y - r * 0.2} A ${r * 0.55} ${r * 0.55} 0 0 1 ${x - r * 0.1} ${y - r * 0.55}`} fill="none" stroke={alpha(C.text, 0.7)} strokeWidth={5} strokeLinecap="round" />
      {question > 0 && (
        <text x={x} y={y - r - 26 - 20 * cl(question)} textAnchor="middle" fontSize={r * 1.6} fontWeight={800} fill={C.warm} opacity={cl(question)}>
          ?
        </text>
      )}
    </g>
  );
};

/** A clipboard board with its clip; content is drawn by the caller on top. */
export const Board: React.FC<{ x: number; y: number; w: number; h: number; lit?: number; glowA?: number }> = ({ x, y, w, h, lit = 1, glowA = 0 }) => (
  <g style={glow(C.accentText, glowA)}>
    <rect x={x} y={y} width={w} height={h} rx={w * 0.05} fill={C.card} stroke={edge(lit)} strokeWidth={Math.max(3, w * 0.012)} />
    <rect x={x + w * 0.05} y={y + w * 0.1} width={w * 0.9} height={h - w * 0.15} rx={w * 0.02} fill={alpha(C.text, 0.06 + 0.06 * cl(lit))} />
    <rect x={x + w * 0.32} y={y - w * 0.05} width={w * 0.36} height={w * 0.12} rx={w * 0.03} fill={edge(lit, C.muted)} stroke={C.bg0} strokeWidth={2} />
  </g>
);

/** A small clipboard with three rows of boxes (for the office view). */
export const MiniClipboard: React.FC<{ x: number; y: number; w: number; h: number; lit: number; value?: string; tick?: number }> = ({ x, y, w, h, lit, value, tick = 0 }) => (
  <g>
    <Board x={x} y={y} w={w} h={h} lit={lit} />
    {[0, 1, 2].map((i) => {
      const ry = y + h * 0.26 + i * h * 0.23;
      return (
        <g key={i}>
          <rect x={x + w * 0.12} y={ry + h * 0.05} width={w * 0.3} height={8} rx={4} fill={edge(lit * 0.8, C.muted)} />
          <rect x={x + w * 0.5} y={ry} width={w * 0.38} height={h * 0.15} rx={6} fill={C.bg1} stroke={edge(lit)} strokeWidth={3} />
          {i === 0 && value && (
            <text x={x + w * 0.69} y={ry + h * 0.11} textAnchor="middle" fontSize={h * 0.085} fontWeight={800} fill={alpha(C.text, 0.4 + 0.6 * cl(lit))}>
              {value}
            </text>
          )}
        </g>
      );
    })}
    {tick > 0 && <Badge x={x + w * 0.95} y={y + h * 0.3} r={h * 0.09} kind="tick" pop={tick} />}
  </g>
);

/** A round badge: a tick (teal) or a cross (rose), popping from big to size. */
export const Badge: React.FC<{ x: number; y: number; r: number; kind: 'tick' | 'cross'; pop: number; color?: string }> = ({ x, y, r, kind, pop, color }) => {
  const p = cl(pop);
  if (p <= 0) return null;
  const c = color ?? (kind === 'tick' ? C.ok : C.marker);
  return (
    <g transform={`translate(${x} ${y}) scale(${(1.5 - 0.5 * p) * (r / 24)})`} opacity={Math.min(1, p * 1.5)}>
      <circle r={24} fill={c} />
      {kind === 'tick' ? (
        <path d="M -11 1 L -3 9 L 12 -8" fill="none" stroke={C.bg0} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M -9 -9 L 9 9 M 9 -9 L -9 9" stroke={C.bg0} strokeWidth={5} strokeLinecap="round" />
      )}
    </g>
  );
};

/** A semicircular gauge; `level` in [0, 1]; the fill turns amber with `amber`. */
export const Gauge: React.FC<{ x: number; y: number; r: number; level: number; amber: number }> = ({ x, y, r, level, amber }) => {
  const a = Math.PI * (1 - cl(level));
  const end = { x: x + r * Math.cos(a), y: y - r * Math.sin(a) };
  const color = amber > 0.5 ? C.warm : C.ok;
  return (
    <g>
      <path d={`M ${x - r} ${y} A ${r} ${r} 0 0 1 ${x + r} ${y}`} fill="none" stroke={alpha(C.muted, 0.3)} strokeWidth={r * 0.22} strokeLinecap="round" />
      {level > 0.01 && <path d={`M ${x - r} ${y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`} fill="none" stroke={color} strokeWidth={r * 0.22} strokeLinecap="round" style={glow(color, amber * 0.6)} />}
      <line x1={x} y1={y} x2={x + r * 0.75 * Math.cos(a)} y2={y - r * 0.75 * Math.sin(a)} stroke={C.text} strokeWidth={6} strokeLinecap="round" />
      <circle cx={x} cy={y} r={10} fill={C.text} />
    </g>
  );
};

/** A wall clock with no numerals; hand angles in degrees (0 = 12 o'clock). */
export const Clock: React.FC<{ x: number; y: number; r: number; hour: number; minute: number; opacity?: number }> = ({ x, y, r, hour, minute, opacity = 1 }) => {
  if (opacity <= 0) return null;
  const hand = (deg: number, len: number) => {
    const a = ((deg - 90) * Math.PI) / 180;
    return { x: x + len * Math.cos(a), y: y + len * Math.sin(a) };
  };
  const h = hand(hour, r * 0.5);
  const m = hand(minute, r * 0.78);
  return (
    <g opacity={cl(opacity)}>
      <circle cx={x} cy={y} r={r} fill={C.card} stroke={C.accentText} strokeWidth={6} />
      {Array.from({ length: 12 }, (_, i) => {
        const p = hand(i * 30, r * 0.86);
        return <circle key={i} cx={p.x} cy={p.y} r={i % 3 === 0 ? 5 : 3} fill={alpha(C.muted, 0.8)} />;
      })}
      <line x1={x} y1={y} x2={h.x} y2={h.y} stroke={C.text} strokeWidth={8} strokeLinecap="round" />
      <line x1={x} y1={y} x2={m.x} y2={m.y} stroke={C.accentText} strokeWidth={5} strokeLinecap="round" />
      <circle cx={x} cy={y} r={8} fill={C.text} />
    </g>
  );
};

/** A rose zigzag crack across a box (how an object fails), drawn in with `p`. */
export const Crack: React.FC<{ x: number; y: number; w: number; h: number; p: number }> = ({ x, y, w, h, p }) => {
  if (p <= 0) return null;
  const pts = [
    [0, 0.1],
    [0.22, 0.42],
    [0.12, 0.55],
    [0.42, 0.78],
    [0.36, 0.9],
    [0.6, 1],
  ].map(([a, b]) => `${x + a * w},${y + b * h}`);
  return (
    <polyline
      points={pts.join(' ')}
      fill="none"
      stroke={C.marker}
      strokeWidth={7}
      strokeLinejoin="round"
      strokeLinecap="round"
      pathLength={1}
      strokeDasharray={`${cl(p)} 1`}
      style={glow(C.marker, 0.6 * cl(p))}
    />
  );
};

/** A floor line for the scene; x and w default to the vertical stage width. */
export const Floor: React.FC<{ y: number; x?: number; w?: number }> = ({ y, x = 60, w = 960 }) => <rect x={x} y={y} width={w} height={4} rx={2} fill={alpha(C.muted, 0.25)} />;

/** A wall nail with a string (for hanging the clipboard). */
export const Nail: React.FC<{ x: number; y: number; w: number; lit?: number }> = ({ x, y, w, lit = 1 }) => (
  <g>
    <path d={`M ${x - w * 0.18} ${y + 40} L ${x} ${y} L ${x + w * 0.18} ${y + 40}`} fill="none" stroke={edge(lit * 0.7, C.muted)} strokeWidth={3} />
    <circle cx={x} cy={y} r={7} fill={edge(lit, C.muted)} />
  </g>
);
