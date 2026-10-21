// Drawing pieces shared by the forgetting scenes: the tile wall, conveyor cards, gauges, the task
// meter, the replay dial, chips, stamps and the replay curve. Brand tokens and Inter only.
import React from 'react';
import { C, GRADIENT, alpha } from '../brand.ts';
import { gradientText } from './Stage.tsx';
import { COLS, ROWS, GAUGE_BEFORE, DIAL_LABELS, type TileState } from './wall.ts';
import { FULL, LORA, X_LABELS, pt, partialPath, type Box } from './curve.ts';

export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

export const wallSize = (pitch: number, gap: number, cols = COLS, rows = ROWS) => ({ w: cols * pitch - gap, h: rows * pitch - gap });

/** The wall of tiles: white = what the model knows, accent = the new skill, dark = forgotten. */
export const TileWall: React.FC<{
  x: number;
  y: number;
  pitch: number;
  gap: number;
  tiles: TileState[];
  cols?: number;
  rows?: number;
  /** Faint looseness of every tile (full fine-tuning). */
  jitter?: number;
  t?: number;
  dim?: number;
  opacity?: number;
  /** Base brightness of the white tiles. */
  white?: number;
}> = ({ x, y, pitch, gap, tiles, cols = COLS, rows = ROWS, jitter = 0, t = 0, dim = 0, opacity = 1, white = 0.85 }) => {
  const size = pitch - gap;
  const r = Math.max(3, size * 0.16);
  const cells: React.ReactNode[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const i = row * COLS + col;
      const s = tiles[i] ?? { paint: 0, dark: 0, flash: 0 };
      const jx = jitter ? Math.sin(t * 9 + i * 1.7) * 2.2 * jitter : 0;
      const jy = jitter ? Math.cos(t * 8 + i * 2.3) * 2.2 * jitter : 0;
      const rot = jitter ? Math.sin(t * 7 + i) * 3 * jitter : 0;
      cells.push(
        <div
          key={i}
          style={{
            position: 'absolute',
            left: col * pitch + jx,
            top: row * pitch + jy,
            width: size,
            height: size,
            borderRadius: r,
            background: C.card,
            border: `1px solid ${alpha(C.muted, 0.18)}`,
            transform: rot ? `rotate(${rot}deg)` : undefined,
            boxShadow: s.flash > 0 ? `0 0 ${18 * s.flash}px ${alpha(C.text, 0.8 * s.flash)}` : undefined,
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', inset: 0, background: C.text, opacity: white * (1 - s.dark) * (1 - s.paint) }} />
          <div style={{ position: 'absolute', inset: 0, background: GRADIENT, opacity: s.paint }} />
        </div>,
      );
    }
  }
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: cols * pitch - gap, height: rows * pitch - gap, opacity: opacity * (1 - 0.72 * dim) }}>{cells}</div>
  );
};

/** One batch card: gradient with a "$ _" glyph (terminal data) or white with a "W" (general text). */
export const BatchCard: React.FC<{ x: number; y: number; white: boolean; scale?: number; opacity?: number; w?: number; h?: number }> = ({
  x,
  y,
  white,
  scale = 1,
  opacity = 1,
  w = 58,
  h = 74,
}) => (
  <div
    style={{
      position: 'absolute',
      left: x - w / 2,
      top: y - h / 2,
      width: w,
      height: h,
      borderRadius: 10,
      background: white ? C.text : GRADIENT,
      boxShadow: white ? `0 0 22px ${alpha(C.text, 0.55)}` : `0 6px 16px ${alpha('#000000', 0.45)}`,
      transform: `scale(${scale})`,
      opacity,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: white ? 36 : 24,
      fontWeight: 800,
      color: white ? C.bg0 : C.text,
    }}
  >
    {white ? 'W' : '$ _'}
  </div>
);

/** A rounded label chip. */
export const Chip: React.FC<{ children: React.ReactNode; size?: number; accent?: boolean; style?: React.CSSProperties }> = ({ children, size = 32, accent, style }) => (
  <div
    style={{
      padding: `${size * 0.32}px ${size * 0.62}px`,
      borderRadius: size * 0.6,
      background: alpha(C.card, 0.92),
      border: `2px solid ${accent ? alpha(C.accentText, 0.85) : alpha(C.muted, 0.45)}`,
      fontSize: size,
      fontWeight: 700,
      whiteSpace: 'nowrap',
      color: C.text,
      ...style,
    }}
  >
    {children}
  </div>
);

/** A benchmark gauge: name, a track, the "before" mark and the fill after the drop. */
export const Gauge: React.FC<{
  x: number;
  y: number;
  w: number;
  name: string;
  appear: number;
  drop: number;
  after: number;
  highlight?: number;
  nameW?: number;
  lit?: number;
}> = ({ x, y, w, name, appear, drop, after, highlight = 0, nameW = 300, lit = 1 }) => {
  const trackW = w - nameW;
  const fill = lerp(GAUGE_BEFORE, after, drop);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: 56,
        opacity: appear,
        transform: `translateX(${(1 - appear) * -30}px)`,
        transformOrigin: 'left center',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: nameW - 20,
          height: 56,
          display: 'flex',
          alignItems: 'center',
          fontSize: 34,
          fontWeight: 700,
          color: highlight > 0.5 ? C.accentText : lit > 0.5 ? C.text : C.muted,
          whiteSpace: 'nowrap',
        }}
      >
        {name}
      </div>
      <div
        style={{
          position: 'absolute',
          left: nameW,
          top: 12,
          width: trackW,
          height: 32,
          borderRadius: 16,
          background: C.card,
          border: `2px solid ${highlight > 0.5 ? alpha(C.accentText, 0.9) : alpha(C.muted, 0.3)}`,
          overflow: 'hidden',
        }}
      >
        {/* What was lost: the stretch between the drop and the "before" mark. */}
        <div style={{ position: 'absolute', left: `${fill * 100}%`, width: `${(GAUGE_BEFORE - fill) * 100}%`, top: 0, bottom: 0, background: alpha(C.accentText, 0.28) }} />
        <div style={{ position: 'absolute', left: 0, width: `${fill * 100}%`, top: 0, bottom: 0, background: alpha(C.text, 0.82), borderRadius: 16 }} />
      </div>
      {/* "before" mark */}
      <div style={{ position: 'absolute', left: nameW + GAUGE_BEFORE * trackW - 2, top: 2, width: 4, height: 52, borderRadius: 2, background: C.accentText }} />
    </div>
  );
};

/** Terminal-task meter: from the base model's score to the trained one. */
export const TaskMeter: React.FC<{ x: number; y: number; w: number; appear: number; fill: number; label: string; from?: string; to: string; done: number; start?: number; endAt?: number }> = ({
  x,
  y,
  w,
  appear,
  fill,
  label,
  from,
  to,
  done,
  start = 0.36,
  endAt = 0.9,
}) => {
  const trackX = 330;
  const trackW = w - trackX - 150;
  const v = lerp(start, endAt, fill);
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: 64, opacity: appear }}>
      <div style={{ position: 'absolute', left: 0, top: 0, height: 64, display: 'flex', alignItems: 'center', fontSize: 34, fontWeight: 700, whiteSpace: 'nowrap' }}>{label}</div>
      <div style={{ position: 'absolute', left: trackX, top: 14, width: trackW, height: 36, borderRadius: 18, background: C.card, border: `2px solid ${alpha(C.muted, 0.3)}`, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${v * 100}%`, background: GRADIENT, borderRadius: 18 }} />
      </div>
      {from !== undefined && (
        <div style={{ position: 'absolute', left: trackX + start * trackW - 30, top: 56, fontSize: 28, fontWeight: 600, color: C.muted }}>{from}</div>
      )}
      <div style={{ position: 'absolute', left: trackX + trackW + 18, top: 0, height: 64, display: 'flex', alignItems: 'center', fontSize: 42, fontWeight: 800, opacity: done, ...gradientText }}>{to}</div>
    </div>
  );
};

/** The replay dial: share of general text in each batch. */
export const Dial: React.FC<{ x: number; y: number; w: number; pos: number; appear: number }> = ({ x, y, w, pos, appear }) => {
  const trackX = 40;
  const trackW = w - 80;
  const tx = (i: number) => trackX + (i / (DIAL_LABELS.length - 1)) * trackW;
  const near = Math.round(pos);
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: 130, opacity: appear }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', fontSize: 30, fontWeight: 600, color: C.muted }}>general text in each batch</div>
      <div style={{ position: 'absolute', left: trackX, top: 60, width: trackW, height: 10, borderRadius: 5, background: alpha(C.muted, 0.35) }} />
      <div style={{ position: 'absolute', left: trackX, top: 60, width: Math.max(0, tx(pos) - trackX), height: 10, borderRadius: 5, background: GRADIENT }} />
      {DIAL_LABELS.map((l, i) => (
        <React.Fragment key={l}>
          <div style={{ position: 'absolute', left: tx(i) - 3, top: 52, width: 6, height: 26, borderRadius: 3, background: alpha(C.muted, 0.7) }} />
          <div
            style={{
              position: 'absolute',
              left: tx(i) - 60,
              width: 120,
              top: 86,
              textAlign: 'center',
              fontSize: 34,
              fontWeight: 800,
              color: i === near ? C.text : C.muted,
            }}
          >
            {l}
          </div>
        </React.Fragment>
      ))}
      <div
        style={{
          position: 'absolute',
          left: tx(pos) - 22,
          top: 43,
          width: 44,
          height: 44,
          borderRadius: 22,
          background: C.text,
          border: `6px solid ${C.accent}`,
          boxShadow: `0 0 20px ${alpha(C.accent, 0.8)}`,
        }}
      />
    </div>
  );
};

/** A rubber stamp. */
export const Stamp: React.FC<{ text: string; appear: number; size?: number; strong?: boolean; rotate?: number; style?: React.CSSProperties }> = ({
  text,
  appear,
  size = 64,
  strong,
  rotate = -6,
  style,
}) => (
  <div
    style={{
      padding: `${size * 0.18}px ${size * 0.45}px`,
      borderRadius: size * 0.28,
      border: `${strong ? 6 : 4}px solid ${strong ? C.accentText : C.muted}`,
      background: strong ? alpha(C.accent, 0.16) : alpha(C.bg0, 0.6),
      transform: `rotate(${rotate}deg) scale(${lerp(1.6, 1, appear)})`,
      opacity: appear,
      fontSize: size,
      fontWeight: 900,
      letterSpacing: strong ? '0.04em' : '0',
      whiteSpace: 'nowrap',
      color: strong ? C.text : C.muted,
      boxShadow: strong ? `0 0 40px ${alpha(C.accent, 0.5 * appear)}` : undefined,
      ...style,
    }}
  >
    {text}
  </div>
);

const toPath = (pts: [number, number][]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

/** The replay chart: change in general accuracy at each replay share, 0 line marked. */
export const CurvePlot: React.FC<{
  w: number;
  h: number;
  /** Full fine-tuning: segments drawn (0..3) and the first point. */
  fullSeg: number;
  fullP0: number;
  fullDim?: number;
  /** LoRA points shown (per point appearance); empty = no LoRA line. */
  lora?: number[];
  loraLabel?: number;
  appear: number;
}> = ({ w, h, fullSeg, fullP0, fullDim = 0, lora = [], loraLabel = 0, appear }) => {
  const box: Box = { x: 70, y: 70, w: w - 130, h: h - 170 };
  const fullPts = FULL.map((v, i) => pt(box, i, v));
  const loraPts = LORA.map((v, i) => pt(box, i, v));
  const shownFull = partialPath(fullPts, fullSeg);
  const zeroY = pt(box, 0, 0)[1];
  const nLora = lora.filter((a) => a > 0.01).length;
  const loraPath = partialPath(loraPts, Math.max(0, nLora - 1));
  const fullOpacity = 1 - 0.45 * fullDim;
  return (
    <svg width={w} height={h} style={{ position: 'absolute', left: 0, top: 0, opacity: appear, overflow: 'visible' }}>
      <defs>
        <linearGradient id="fullGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={C.accent} />
          <stop offset="1" stopColor={C.accent2} />
        </linearGradient>
      </defs>
      <text x={box.x - 10} y={30} fill={C.muted} fontSize={30} fontWeight={600}>
        change in general accuracy
      </text>
      <line x1={box.x} x2={box.x + box.w} y1={zeroY} y2={zeroY} stroke={alpha(C.muted, 0.6)} strokeWidth={3} strokeDasharray="10 10" />
      <text x={box.x - 22} y={zeroY + 11} fill={C.muted} fontSize={32} fontWeight={700} textAnchor="end">
        0
      </text>
      {X_LABELS.map((l, i) => (
        <text key={l} x={pt(box, i, 0)[0]} y={box.y + box.h + 62} fill={C.muted} fontSize={34} fontWeight={700} textAnchor="middle">
          {l}
        </text>
      ))}
      <path d={toPath(shownFull)} fill="none" stroke="url(#fullGrad)" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" opacity={fullOpacity} />
      {fullPts.map(([x, y], i) => {
        const on = i === 0 ? fullP0 : fullSeg >= i - 0.02 ? 1 : 0;
        return on > 0 ? <circle key={i} cx={x} cy={y} r={14 * on} fill={C.accentText} stroke={C.bg0} strokeWidth={4} opacity={fullOpacity} /> : null;
      })}
      {fullP0 > 0 && (
        <text x={fullPts[0][0] + 26} y={fullPts[0][1] + 12} fill={C.text} fontSize={40} fontWeight={800} opacity={fullP0 * fullOpacity}>
          −0.078
        </text>
      )}
      {fullSeg >= 2.98 && (
        <text x={fullPts[3][0]} y={fullPts[3][1] + 56} fill={C.accentText} fontSize={32} fontWeight={800} textAnchor="end" opacity={fullOpacity}>
          Full fine-tuning
        </text>
      )}
      {nLora > 1 && <path d={toPath(loraPath)} fill="none" stroke={C.text} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />}
      {loraPts.map(([x, y], i) =>
        (lora[i] ?? 0) > 0 ? <circle key={`l${i}`} cx={x} cy={y} r={13 * lora[i]} fill={C.text} stroke={C.bg0} strokeWidth={4} /> : null,
      )}
      {loraLabel > 0 && (
        <text x={loraPts[3][0]} y={loraPts[3][1] - 28} fill={C.text} fontSize={36} fontWeight={800} textAnchor="end" opacity={loraLabel}>
          LoRA
        </text>
      )}
    </svg>
  );
};

/** Glass pane over a wall: sheen, diagonal highlight and a small padlock. */
export const Glass: React.FC<{ x: number; y: number; w: number; h: number; appear: number; lock?: number }> = ({ x, y, w, h, appear, lock = 44 }) => (
  <div
    style={{
      position: 'absolute',
      left: x - 10,
      top: y - 10 - (1 - appear) * (h + 40),
      width: w + 20,
      height: h + 20,
      borderRadius: 16,
      background: `linear-gradient(135deg, ${alpha(C.text, 0.16)}, ${alpha(C.text, 0.04)} 45%, ${alpha(C.text, 0.12)} 55%, ${alpha(C.text, 0.03)})`,
      border: `3px solid ${alpha(C.text, 0.45)}`,
      boxShadow: `inset 0 0 30px ${alpha(C.text, 0.12)}`,
      opacity: appear,
    }}
  >
    <svg width={lock} height={lock * 1.2} viewBox="0 0 40 48" style={{ position: 'absolute', right: -lock * 0.45, top: -lock * 0.6 }}>
      <rect x="4" y="20" width="32" height="26" rx="5" fill={C.muted} />
      <path d="M11 20 V13 a9 9 0 0 1 18 0 V20" fill="none" stroke={C.muted} strokeWidth="5" />
      <circle cx="20" cy="32" r="4" fill={C.bg0} />
    </svg>
  </div>
);

/** Slim adapter column: a stack of cells that fill with the accent from the bottom. */
export const AdapterColumn: React.FC<{ x: number; y: number; pitch: number; gap: number; rows?: number; appear: number; fill: number }> = ({
  x,
  y,
  pitch,
  gap,
  rows = ROWS,
  appear,
  fill,
}) => {
  const size = pitch - gap;
  return (
    <div style={{ position: 'absolute', left: x + (1 - appear) * 60, top: y, opacity: appear }}>
      {Array.from({ length: rows }, (_, r) => {
        const fromBottom = rows - 1 - r;
        const p = Math.min(1, Math.max(0, fill * rows - fromBottom));
        return (
          <div
            key={r}
            style={{
              position: 'absolute',
              left: 0,
              top: r * pitch,
              width: size,
              height: size,
              borderRadius: Math.max(3, size * 0.16),
              background: C.card,
              border: `2px solid ${alpha(C.accentText, 0.7)}`,
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', inset: 0, background: GRADIENT, opacity: p }} />
          </div>
        );
      })}
    </div>
  );
};
