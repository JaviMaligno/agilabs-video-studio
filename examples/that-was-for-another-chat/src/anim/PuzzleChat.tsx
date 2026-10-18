import React from 'react';
import { interpolate } from 'remotion';
import { C, GRADIENT, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import { tx, type Label, type Lang } from '../types.ts';
import type { AnimProps } from './types.ts';
import { GRID, GRID_N, HOLE, frameState, type PieceState, type PuzzleProps, type PuzzleState, type Topic } from './PuzzleChat.state.ts';
import { N, cellOf, edgesOf, piecePath, type Edges } from './Jigsaw.ts';
import { FLAG, Picture } from './Pictures.tsx';
import { WARN, OK } from './palette.ts';
import { stageOf } from './Stage.tsx';

export { frameState };
export type { PuzzleProps };

const MONO = "ui-monospace, Menlo, 'SF Mono', monospace";

/** Order of the 24 conversations on the wall: three models per topic. */
const WALL_TOPICS: Topic[] = ['garden', 'run', 'camera', 'bread', 'move', 'bill', 'school', 'japan'];
const MODEL_COLOURS = [C.accentText, C.accent2, C.muted];

const HOLE_EDGES = edgesOf(HOLE.r, HOLE.c);
/** The carved piece's own shape: tabs where the hole has blanks, so it cannot fit. */
const WRONG_EDGES = HOLE_EDGES.map((e) => -e) as Edges;

/** Vertical layout of the single-puzzle scenes (px on the 1080x1920 frame). */
const single = (vertical: boolean) => {
  const st = stageOf(vertical);
  const size = vertical ? 720 : 600;
  const pad = 20;
  const header = 72;
  const winW = size + 2 * pad;
  const winX = vertical ? (1080 - winW) / 2 : st.side + (st.w - winW) / 2;
  const winY = st.top + (vertical ? 30 : 0);
  const winH = header + pad + size + pad;
  return { size, pad, header, winX, winY, winW, winH, px: winX + pad, py: winY + header + pad, rowY: winY + winH + 26, rowH: st.top + st.h - (winY + winH + 26) };
};

/** frames mode: a smaller window on the left, the frame shop below. */
const shop = (vertical: boolean) => {
  const st = stageOf(vertical);
  const size = 500;
  const pad = 18;
  const header = 64;
  const winX = st.side;
  const winY = st.top + 20;
  const winW = size + 2 * pad;
  const winH = header + pad + size + pad;
  const frameY = winY + winH + 40;
  return { size, pad, header, winX, winY, winW, winH, px: winX + pad, py: winY + header + pad, frameY, sideX: winX + winW + 30, sideW: st.side + st.w - (winX + winW + 30) };
};

/** The wall of 24, centred in the stage with room for the legend. */
const wall = (vertical: boolean) => {
  const st = stageOf(vertical);
  const gap = 16;
  const cell = (st.w - (GRID.cols - 1) * gap) / GRID.cols;
  const h = GRID.rows * cell + (GRID.rows - 1) * gap;
  const top = st.top + (st.h - h - 110) / 2;
  return { gap, cell, h, top, left: st.side, at: (i: number) => ({ x: st.side + (i % GRID.cols) * (cell + gap), y: top + Math.floor(i / GRID.cols) * (cell + gap) }) };
};

type PieceLook = { kind: 'warn' | 'ok'; snippet?: string[]; edges?: Edges; textScale?: number };

/** The foreign piece, drawn over the hole of a puzzle at (x, y, size) with its state applied. */
const Foreign: React.FC<{ id: string; x: number; y: number; size: number; st: PieceState; look: PieceLook; flash?: number }> = ({ id, x, y, size, st, look, flash = 0 }) => {
  const cell = cellOf(x, y, size, HOLE.r, HOLE.c);
  const d = piecePath(cell.x, cell.y, cell.w, cell.h, look.edges ?? HOLE_EDGES);
  const cx = cell.x + cell.w / 2;
  const cy = cell.y + cell.h / 2;
  const pal = look.kind === 'ok' ? OK : WARN;
  const back = st.flip < 0;
  const fs = cell.w * 0.115 * (look.textScale ?? 1);
  const glow = st.glow > 0 ? `drop-shadow(0 0 ${18 * st.glow}px ${alpha(pal.base, 0.9 * st.glow)})` : `drop-shadow(0 ${size * 0.012}px ${size * 0.02}px rgba(0,0,0,0.55))`;
  return (
    <g
      transform={`translate(${cx + st.dx * size} ${cy + st.dy * size}) rotate(${st.rot}) scale(${st.scale * Math.max(0.04, Math.abs(st.flip))} ${st.scale}) translate(${-cx} ${-cy})`}
      opacity={st.opacity}
      style={{ filter: glow }}
    >
      <defs>
        <linearGradient id={`${id}-pg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={back ? pal.deep : pal.text} />
          <stop offset="1" stopColor={back ? alpha(pal.deep, 0.8) : pal.base} />
        </linearGradient>
        <clipPath id={`${id}-pc`}>
          <path d={d} />
        </clipPath>
      </defs>
      <path d={d} fill={`url(#${id}-pg)`} stroke={alpha(C.bg0, 0.55)} strokeWidth={size / 260} />
      {!back && look.snippet && (
        <g clipPath={`url(#${id}-pc)`}>
          {look.snippet.map((s, i) => (
            <text key={i} x={cell.x + cell.w * 0.03} y={cell.y + cell.h * 0.08 + (i + 1) * fs * 1.25} fontFamily={MONO} fontSize={fs} fontWeight={700} fill={alpha(C.bg0, 0.78)}>
              {s}
            </text>
          ))}
        </g>
      )}
      {back && (
        <text x={cx} y={cy + cell.w * 0.14} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={cell.w * 0.42} fill={alpha(C.text, 0.85)}>
          ?
        </text>
      )}
      {flash > 0 && <path d={d} fill={alpha('#ffffff', 0.55 * flash)} />}
    </g>
  );
};

/** Code lines that replace the picture where the paste took over (hammer). */
const CodeTile: React.FC<{ x: number; y: number; w: number; h: number; seed: number }> = ({ x, y, w, h, seed }) => {
  const rows = 7;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#0d0d14" />
      {Array.from({ length: rows }, (_, i) => {
        const indent = ((seed * 7 + i * 3) % 4) * 0.08;
        const len = 0.25 + (((seed * 13 + i * 5) % 7) / 7) * 0.6;
        const col = (seed + i) % 3 === 0 ? WARN.text : (seed + i) % 3 === 1 ? C.accentText : alpha(C.muted, 0.8);
        return <rect key={i} x={x + w * (0.08 + indent)} y={y + h * (0.1 + i * 0.12)} width={w * Math.min(0.84 - indent, len)} height={h * 0.055} rx={h * 0.02} fill={col} />;
      })}
    </g>
  );
};

type PuzzleDraw = {
  id: string;
  x: number;
  y: number;
  size: number;
  topic: Topic;
  /** 0..1: how far the code has spread from the hole (hammer). */
  code?: number;
  /** Border colour (the model, on the wall). */
  frame?: string;
  gap?: number;
  thin?: boolean;
};

/** A jigsaw with its picture, every piece outlined, and the hole recessed. */
const Puzzle: React.FC<PuzzleDraw> = ({ id, x, y, size, topic, code = 0, frame, gap = 0, thin }) => {
  const hc = cellOf(x, y, size, HOLE.r, HOLE.c);
  const hole = piecePath(hc.x, hc.y, hc.w, hc.h, HOLE_EDGES);
  const cells: { r: number; c: number; d: string; rank: number }[] = [];
  for (let r = 0; r < N; r++)
    for (let c = 0; c < N; c++) {
      if (r === HOLE.r && c === HOLE.c) continue;
      const cc = cellOf(x, y, size, r, c);
      cells.push({ r, c, d: piecePath(cc.x, cc.y, cc.w, cc.h, edgesOf(r, c)), rank: Math.hypot(r - HOLE.r, c - HOLE.c) });
    }
  const order = [...cells].sort((a, b) => a.rank - b.rank);
  const converted = Math.round(code * order.length * 1.0001);
  const sw = thin ? Math.max(0.8, size / 240) : size / 300;
  return (
    <g>
      <defs>
        <clipPath id={`${id}-pic`}>
          <path d={`M${x},${y} h${size} v${size} h${-size} Z ${hole}`} clipRule="evenodd" fillRule="evenodd" />
        </clipPath>
        {order.slice(0, converted).map((cell, i) => (
          <clipPath key={i} id={`${id}-cv${i}`}>
            <path d={cell.d} />
          </clipPath>
        ))}
      </defs>
      <g clipPath={`url(#${id}-pic)`}>
        <g transform={`translate(${x} ${y}) scale(${size / 100})`}>
          <Picture topic={topic} id={`${id}-p`} />
        </g>
        {order.slice(0, converted).map((cell, i) => {
          const cc = cellOf(x, y, size, cell.r, cell.c);
          const k = cc.w * 0.3;
          return (
            <g key={i} clipPath={`url(#${id}-cv${i})`}>
              <CodeTile x={cc.x - k} y={cc.y - k} w={cc.w + 2 * k} h={cc.h + 2 * k} seed={cell.r * 4 + cell.c} />
            </g>
          );
        })}
      </g>
      {/* The hole: a dark recess with a dashed rim. */}
      <path d={hole} fill={alpha(C.bg0, 0.92)} />
      <path d={hole} fill="none" stroke={alpha(C.text, 0.35 + 0.65 * gap)} strokeWidth={sw * (1 + 2 * gap)} strokeDasharray={`${size / 60} ${size / 90}`} />
      <path d={cells.map((c) => c.d).join(' ')} fill="none" stroke={alpha(C.bg0, 0.7)} strokeWidth={sw * 1.6} />
      <path d={cells.map((c) => c.d).join(' ')} fill="none" stroke={alpha(C.text, 0.2)} strokeWidth={sw * 0.6} />
      {frame && <rect x={x - sw * 2} y={y - sw * 2} width={size + sw * 4} height={size + sw * 4} rx={size * 0.04} fill="none" stroke={frame} strokeWidth={sw * 2.6} />}
    </g>
  );
};

/** Chat-window chrome around a puzzle. */
const Window: React.FC<{ x: number; y: number; w: number; h: number; header: number; title: string; opacity?: number }> = ({ x, y, w, h, header, title, opacity = 1 }) => (
  <g opacity={opacity}>
    <rect x={x} y={y} width={w} height={h} rx={22} fill={C.card} stroke={alpha(C.text, 0.12)} strokeWidth={2} />
    <path d={`M${x} ${y + header} h${w}`} stroke={alpha(C.text, 0.1)} strokeWidth={2} />
    {[0, 1, 2].map((i) => (
      <circle key={i} cx={x + 30 + i * 26} cy={y + header / 2} r={8} fill={alpha(C.muted, 0.35)} />
    ))}
    <text x={x + w / 2} y={y + header / 2 + 14} textAnchor="middle" fontFamily={fontFamily} fontWeight={600} fontSize={header * 0.5} fill={C.text}>
      {title}
    </text>
  </g>
);

const TallyView: React.FC<{ tally: NonNullable<PuzzleProps['tally']>; st: PuzzleState['tally']; lang: Lang; x: number; y: number; ok?: boolean; maxW?: number }> = ({ tally, st, lang, x, y, ok, maxW = 520 }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      display: 'flex',
      alignItems: 'center',
      gap: 26,
      opacity: st.opacity,
      transform: `scale(${interpolate(st.pop, [0, 1], [0.6, 1])})`,
      transformOrigin: 'left center',
    }}
  >
    <div style={{ fontSize: 132, fontWeight: 800, lineHeight: 1, color: ok ? OK.text : WARN.text, letterSpacing: '-0.04em' }}>{tally.value}</div>
    <div style={{ fontSize: 40, fontWeight: 600, lineHeight: 1.18, color: C.text, maxWidth: maxW }}>{tx(tally.label, lang)}</div>
  </div>
);

const Chip: React.FC<{ text: string; opacity: number; top: number; left?: number; width?: number }> = ({ text, opacity, top, left = 0, width = 1080 }) => (
  <div style={{ position: 'absolute', top, left, width, display: 'flex', justifyContent: 'center', opacity }}>
    <div style={{ padding: '14px 30px', borderRadius: 999, background: alpha(C.card, 0.92), border: `2px solid ${alpha(C.text, 0.14)}`, fontSize: 38, fontWeight: 600, color: C.text }}>
      {text}
    </div>
  </div>
);

/** A jigsaw per conversation; the paste is a piece from another box. */
export const PuzzleChat: React.FC<AnimProps & PuzzleProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur, p.lang);
  const topic = p.topic ?? 'garden';
  const title = p.title ? tx(p.title, p.lang) : '';
  const chip = p.chip ? tx(p.chip, p.lang) : '';
  const look: PieceLook = { kind: 'warn', snippet: p.snippet };
  const L = single(p.vertical);
  const isWall = p.mode === 'grid' || p.mode === 'ceiling' || p.mode === 'quote';

  if (isWall) return <Wall p={p} s={s} />;

  if (p.mode === 'frames') {
    const S = shop(p.vertical);
    const st = stageOf(p.vertical);
    const fw = 280;
    const fh = 280;
    const fgap = (st.w - 3 * fw) / 2;
    const fx = (i: number) => st.side + i * (fw + fgap);
    const hc = cellOf(S.px, S.py, S.size, HOLE.r, HOLE.c);
    // Where the held piece sits: gliding between the frames as each one is offered.
    const sum = s.frames.lit.reduce((a, b) => a + b, 0);
    const tx0 = sum > 0 ? s.frames.lit.reduce((a, l, i) => a + l * (fx(i) + fw / 2), 0) / sum : fx(1) + fw / 2;
    const targetX = tx0;
    const targetY = S.frameY + fh / 2;
    const piece: PieceState = {
      ...s.piece,
      dx: ((targetX - (hc.x + hc.w / 2)) / S.size) * s.lift,
      dy: ((targetY - (hc.y + hc.h / 2)) / S.size) * s.lift,
    };
    const frames = p.frames ?? [];
    return (
      <div style={{ position: 'absolute', inset: 0, fontFamily, color: C.text }}>
        <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
          <Window x={S.winX} y={S.winY} w={S.winW} h={S.winH} header={S.header} title={title} />
          <Puzzle id="fr" x={S.px} y={S.py} size={S.size} topic={topic} gap={s.ghost.opacity * 0.6} />
          {frames.map((_, i) => {
            const lit = s.frames.lit[i];
            return (
              <g key={i} opacity={s.frames.appear[i]} transform={`translate(0 ${(1 - s.frames.appear[i]) * 40})`}>
                <rect x={fx(i)} y={S.frameY} width={fw} height={fh} rx={10} fill={alpha(C.bg1, 0.9)} stroke={lit > 0.5 ? WARN.text : alpha(C.text, 0.4)} strokeWidth={lit > 0.5 ? 9 : 7} />
                <rect x={fx(i) + 18} y={S.frameY + 18} width={fw - 36} height={fh - 36} rx={4} fill="none" stroke={alpha(C.text, 0.15)} strokeWidth={3} />
              </g>
            );
          })}
          <Foreign id="frp" x={S.px} y={S.py} size={S.size} st={piece} look={{ ...look, textScale: 1.1 }} />
        </svg>
        {frames.map((f, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: fx(i) - 10,
              width: fw + 20,
              top: S.frameY + fh + 16,
              textAlign: 'center',
              fontSize: 38,
              fontWeight: 600,
              lineHeight: 1.15,
              opacity: s.frames.appear[i],
              color: s.frames.lit[i] > 0.5 ? WARN.text : C.text,
            }}
          >
            {tx(f, p.lang)}
          </div>
        ))}
        {p.tally && <TallyView tally={p.tally} st={s.tally} lang={p.lang} x={S.sideX} y={S.winY + 60} />}
        {p.ghost && (
          <div style={{ position: 'absolute', left: S.sideX, top: S.winY + 330, width: S.sideW, opacity: s.ghost.opacity }}>
            <div style={{ fontSize: 30, fontWeight: 600, color: C.muted, marginBottom: 10 }}>{p.lang === 'es' ? 'Nunca:' : 'Never:'}</div>
            <div style={{ position: 'relative', display: 'inline-block', fontSize: 40, fontWeight: 700, lineHeight: 1.15, color: C.text, whiteSpace: 'nowrap' }}>
              {tx(p.ghost, p.lang)}
              <div style={{ position: 'absolute', left: -6, top: '52%', height: 8, borderRadius: 4, width: `${s.ghost.strike * 104}%`, background: WARN.base }} />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Single-puzzle scenes: land, hammer, carve, aside.
  const hc = cellOf(L.px, L.py, L.size, HOLE.r, HOLE.c);
  const edges = p.mode === 'carve' ? (HOLE_EDGES.map((e, i) => interpolate(s.carve, [0, 1], [WRONG_EDGES[i], e])) as Edges) : HOLE_EDGES;
  let piece = s.piece;
  let pieceLook: PieceLook = { ...look, edges };
  if (p.mode === 'aside') {
    // Set aside: from over the hole to a spot under the window, on the right.
    const ax = L.winX + L.winW - 170;
    const ay = L.rowY + L.rowH / 2;
    piece = {
      ...piece,
      dx: piece.dx + ((ax - (hc.x + hc.w / 2)) / L.size) * s.aside,
      dy: piece.dy + ((ay - (hc.y + hc.h / 2)) / L.size - piece.dy) * s.aside,
      scale: piece.scale * interpolate(s.aside, [0, 1], [1, 0.8]),
    };
    pieceLook = { kind: 'ok', snippet: p.snippet };
  }
  const shakeX = s.shake;
  // Hammer: pivot to the right of the hole; the head lands on the piece's top edge at angle 0.
  const handle = 300;
  const pivot = { x: hc.x + hc.w / 2 + handle, y: hc.y - hc.h * 0.06 + s.piece.dy * L.size - 60 };
  // Knife: circles the piece while carving.
  const kθ = s.knife.progress * Math.PI * 3 - Math.PI / 2;
  const kc = { x: hc.x + hc.w / 2, y: hc.y + hc.h / 2 + s.piece.dy * L.size };
  const kr = hc.w * 0.72;
  // Thread (carve): from the piece to the finish flag of the route.
  const flag = { x: L.px + (FLAG.x / 100) * L.size, y: L.py + (FLAG.y / 100) * L.size };
  const from = { x: hc.x + hc.w * 0.2, y: hc.y + hc.h * 0.8 };
  const threadD = `M${from.x},${from.y} C ${from.x - 160},${from.y + 260} ${flag.x + 220},${flag.y + 300} ${flag.x},${flag.y}`;

  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily, color: C.text }}>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <filter id="thread-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>
        <g transform={`translate(${shakeX} 0)`}>
          <Window x={L.winX} y={L.winY} w={L.winW} h={L.winH} header={L.header} title={title} />
          <Puzzle id="pz" x={L.px} y={L.py} size={L.size} topic={topic} code={s.code} gap={s.gap.opacity} />
          {p.mode === 'carve' && s.thread.draw > 0 && (
            <g>
              <path d={threadD} fill="none" stroke={WARN.base} strokeWidth={14} opacity={0.5} filter="url(#thread-glow)" pathLength={1} strokeDasharray={`${s.thread.draw} 1`} />
              <path d={threadD} fill="none" stroke={WARN.text} strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray={`${s.thread.draw} 1`} />
            </g>
          )}
          <Foreign id="fp" x={L.px} y={L.py} size={L.size} st={piece} look={pieceLook} flash={s.flash} />
          {p.mode === 'carve' && s.knife.opacity > 0 && (
            <g opacity={s.knife.opacity} transform={`translate(${kc.x + kr * Math.cos(kθ)} ${kc.y + kr * Math.sin(kθ)}) rotate(${(kθ * 180) / Math.PI + 90})`}>
              <path d="M0,-20 L130,-8 L130,8 L0,6 Z" fill="#e2e8f0" stroke={alpha(C.bg0, 0.6)} strokeWidth={2} />
              <rect x={-90} y={-14} width={92} height={26} rx={8} fill={C.accent2} />
              {[0, 1, 2].map((i) => (
                <rect key={i} x={30 + i * 26} y={22 + ((s.knife.progress * 900 + i * 40) % 60)} width={12} height={5} rx={2} fill={WARN.text} opacity={0.8} />
              ))}
            </g>
          )}
          {p.mode === 'hammer' && s.hammer.opacity > 0 && (
            <g opacity={s.hammer.opacity} transform={`translate(${pivot.x} ${pivot.y}) rotate(${-s.hammer.angle})`}>
              <rect x={-handle} y={-14} width={handle + 40} height={28} rx={12} fill={C.accent2} stroke={alpha(C.bg0, 0.5)} strokeWidth={3} />
              <rect x={-handle - 55} y={-70} width={110} height={130} rx={14} fill="#cbd5e1" stroke={alpha(C.bg0, 0.6)} strokeWidth={4} />
              <rect x={-handle - 55} y={40} width={110} height={20} rx={6} fill="#94a3b8" />
            </g>
          )}
        </g>
      </svg>
      {p.mode === 'carve' && s.thread.draw > 0.05 && p.thread && (
        <>
          <ThreadTag text={tx(p.thread[0], p.lang)} x={from.x - 260} y={from.y + 70} opacity={Math.min(1, s.thread.draw * 3)} />
          <ThreadTag text={tx(p.thread[1], p.lang)} x={flag.x - 330} y={flag.y - 30} opacity={Math.min(1, Math.max(0, s.thread.draw * 3 - 2))} />
        </>
      )}
      {p.tally && <TallyView tally={p.tally} st={s.tally} lang={p.lang} x={L.winX + 10} y={L.rowY + 20} ok={p.mode === 'aside'} maxW={p.mode === 'carve' ? 230 : 520} />}
      {p.mode === 'carve' && p.stamps && (
        <div style={{ position: 'absolute', left: L.winX + L.winW - 430, top: L.rowY + 8, width: 430, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 14 }}>
          {p.stamps.map((st, i) => (
            <div
              key={i}
              style={{
                opacity: s.stamps.opacity[i],
                transform: `scale(${interpolate(s.stamps.opacity[i], [0, 1], [1.4, 1])}) rotate(${i ? 2 : -2}deg)`,
                padding: '8px 22px',
                borderRadius: 10,
                border: `4px solid ${i ? WARN.base : OK.base}`,
                color: i ? WARN.text : OK.text,
                fontSize: 40,
                fontWeight: 800,
                whiteSpace: 'nowrap',
              }}
            >
              {tx(st, p.lang)}
            </div>
          ))}
        </div>
      )}
      {!p.tally && chip && <Chip text={chip} opacity={s.chip.opacity} top={L.rowY + 50} />}
    </div>
  );
};

const ThreadTag: React.FC<{ text: string; x: number; y: number; opacity: number }> = ({ text, x, y, opacity }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: 300,
      textAlign: 'center',
      opacity,
      padding: '8px 14px',
      borderRadius: 12,
      background: alpha(C.bg0, 0.88),
      border: `3px solid ${WARN.text}`,
      color: WARN.text,
      fontSize: 38,
      fontWeight: 800,
    }}
  >
    {text}
  </div>
);

/** The wall of 24 conversations (grid, ceiling, quote). */
const Wall: React.FC<{ p: AnimProps & PuzzleProps; s: PuzzleState }> = ({ p, s }) => {
  const W = wall(p.vertical);
  const L = single(p.vertical);
  const z = s.zoom;
  const legend = p.legend ? tx(p.legend, p.lang) : '';
  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily, color: C.text }}>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <filter id="good-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
        </defs>
        {/* The garden window shrinking into the wall's first cell. */}
        <Window x={L.winX} y={L.winY} w={L.winW} h={L.winH} header={L.header} title={p.title ? tx(p.title, p.lang) : ''} opacity={1 - Math.min(1, z * 2.5)} />
        {Array.from({ length: GRID_N }, (_, i) => {
          const at = W.at(i);
          const first = i === 0;
          const x = first ? interpolate(z, [0, 1], [L.px, at.x]) : at.x;
          const y = first ? interpolate(z, [0, 1], [L.py, at.y]) : at.y;
          const size = first ? interpolate(z, [0, 1], [L.size, W.cell]) : W.cell;
          const topic = WALL_TOPICS[Math.floor(i / 3) % WALL_TOPICS.length];
          const model = i % 3;
          const good = i === GRID.good && s.ceiling.opacity > 0;
          const op = first ? 1 : z;
          const dim = good && p.mode !== 'quote' ? 0 : s.dim;
          const drop = s.drops[i];
          const pieceSt: PieceState = { dx: 0, dy: -0.55 * (1 - drop), rot: -10 * (1 - drop), scale: 1, opacity: Math.min(1, drop * 3), flip: 1, glow: 0 };
          return (
            <g key={i} opacity={op * (1 - dim)}>
              <Puzzle id={`w${i}`} x={x} y={y} size={size} topic={topic} frame={z > 0.6 ? alpha(MODEL_COLOURS[model], 0.9 * (first ? (z - 0.6) / 0.4 : 1)) : undefined} thin={size < 300} />
              {!good && <Foreign id={`wf${i}`} x={x} y={y} size={size} st={pieceSt} look={{ kind: 'warn', snippet: first ? p.snippet : undefined }} />}
            </g>
          );
        })}
        {s.ceiling.opacity > 0 &&
          (() => {
            const fade = p.mode === 'quote' ? 1 - s.dim : 1;
            const at = W.at(GRID.good);
            const st: PieceState = { dx: 0.62 * s.ceiling.opacity, dy: -0.42 * s.ceiling.opacity, rot: -8 * s.ceiling.opacity, scale: 1 + 0.3 * s.ceiling.opacity, opacity: 1, flip: 1, glow: s.ceiling.opacity };
            return (
              <g opacity={fade}>
                <rect x={at.x - 10} y={at.y - 10} width={W.cell + 20} height={W.cell + 20} rx={18} fill="none" stroke={OK.base} strokeWidth={6} opacity={s.ceiling.opacity} filter="url(#good-glow)" />
                <rect x={at.x - 8} y={at.y - 8} width={W.cell + 16} height={W.cell + 16} rx={16} fill="none" stroke={OK.text} strokeWidth={4} opacity={s.ceiling.opacity} />
                <Foreign id="wgood" x={at.x} y={at.y} size={W.cell} st={st} look={{ kind: 'ok' }} />
              </g>
            );
          })()}
      </svg>
      {legend && (
        <div style={{ position: 'absolute', top: W.top + W.h + 34, left: 0, width: 1080, display: 'flex', justifyContent: 'center', gap: 28, opacity: z * (1 - s.dim * 1.2), fontSize: 34, fontWeight: 600, color: C.muted }}>
          {legend.split(' · ').map((part, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 22, height: 22, borderRadius: 6, border: `5px solid ${MODEL_COLOURS[i % 3]}` }} />
              {part}
            </span>
          ))}
        </div>
      )}
      {p.chip && p.mode !== 'quote' && (
        <Chip text={tx(p.chip, p.lang)} opacity={p.mode === 'grid' ? Math.min(Math.max(0, (z - 0.75) / 0.25), s.chip.opacity) : s.chip.opacity} top={W.top - 110} />
      )}
      {p.mode === 'quote' && <QuoteRows rows={s.quote.rows} />}
    </div>
  );
};

const QuoteRows: React.FC<{ rows: PuzzleState['quote']['rows'] }> = ({ rows }) => {
  const st = stageOf(true);
  return (
    <div style={{ position: 'absolute', left: st.side, width: st.w, top: st.top, height: st.h, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 56, textAlign: 'center' }}>
      {rows.map((row, r) => (
        <div key={r} style={{ fontSize: r === 0 ? 62 : 104, fontWeight: r === 0 ? 700 : 800, lineHeight: 1.08, letterSpacing: '-0.02em', color: r === 0 ? C.muted : C.text }}>
          {row.words.map((w, i) => (
            <React.Fragment key={i}>
              {i > 0 ? ' ' : null}
              <span
                style={{
                  display: 'inline-block',
                  position: 'relative',
                  opacity: w.opacity,
                  transform: `scale(${interpolate(w.opacity, [0, 1], [1.3, 1])})`,
                  ...(w.emphasis
                    ? { backgroundImage: `linear-gradient(135deg, ${C.accentText}, ${C.accent2})`, backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent', WebkitTextFillColor: 'transparent' }
                    : {}),
                }}
              >
                {w.text}
                {w.emphasis && <span style={{ position: 'absolute', left: 0, bottom: 4, height: 10, width: `${row.emphasis * 100}%`, borderRadius: 5, background: GRADIENT }} />}
              </span>
            </React.Fragment>
          ))}
        </div>
      ))}
    </div>
  );
};

export type { Label };
