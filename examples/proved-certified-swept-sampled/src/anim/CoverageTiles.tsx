import React from 'react';
import { C, alpha } from '../brand.ts';
import type { AnimProps } from './types.ts';
import { Stage, gradientText } from './Stage.tsx';
import { PanRings, SERIF, STAMP_TONES, Stamp, Tally, Tick } from './pieces.tsx';
import {
  BIG,
  H,
  HEADER,
  LATTICE,
  NX,
  NY,
  PAN,
  SCATTER_N,
  W,
  frameState,
  scatter,
  type Rect,
  type Tile,
  type TilesProps,
  type TilesState,
} from './CoverageTiles.state.ts';
import { Bat, Ghost, HALLOWEEN, bump } from './halloween.tsx';
import { easeOutCubic, progress, sceneTime } from './steps.ts';

export { frameState };

const DOTS = scatter(SCATTER_N);

/** The coverage pattern under a card, drawn in SVG inside rect `r`. */
const Pattern: React.FC<{ tile: Tile; r: Rect; big: boolean; id: string; ghosts?: GridGhosts }> = ({ tile, r, big, id, ghosts }) => {
  const p = tile.pattern;
  const clip = `clip-${id}`;
  const cw = r.w / NX;
  const ch = r.h / NY;
  return (
    <svg style={{ position: 'absolute', left: r.x, top: r.y, overflow: 'visible' }} width={r.w} height={r.h} viewBox={`0 0 ${r.w} ${r.h}`}>
      <defs>
        <clipPath id={clip}>
          <rect width={r.w} height={r.h} rx={big ? 22 : 16} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <rect width={r.w} height={r.h} fill="#050508" />
        {p.kind === 0 && (
          <>
            <rect width={r.w} height={r.h} fill={alpha(C.accent, 0.55 * p.reveal)} />
            <path
              d={`M ${r.w * 0.1} ${r.h * 0.62} C ${r.w * 0.3} ${r.h * 0.2}, ${r.w * 0.45} ${r.h * 0.95}, ${r.w * 0.62} ${r.h * 0.48} S ${r.w * 0.82} ${r.h * 0.2}, ${r.w * 0.92} ${r.h * 0.4}`}
              fill="none"
              stroke={C.text}
              strokeWidth={9}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="1 1"
              strokeDashoffset={1 - p.stroke}
            />
          </>
        )}
        {p.kind === 1 &&
          p.cells.map((c, k) => {
            const x = (k % NX) * cw;
            const y = Math.floor(k / NX) * ch;
            const gap = big ? 5 : 3;
            const base = alpha(C.accent2, 0.62 * c.fill);
            return (
              <g key={k}>
                <rect x={x + gap / 2} y={y + gap / 2} width={cw - gap} height={ch - gap} rx={big ? 6 : 3} fill={base} />
                {c.green > 0 && <rect x={x + gap / 2} y={y + gap / 2} width={cw - gap} height={ch - gap} rx={big ? 6 : 3} fill={alpha(C.ok, 0.62 * c.green * (1 - c.rose))} />}
                {c.rose > 0 && <rect x={x + gap / 2} y={y + gap / 2} width={cw - gap} height={ch - gap} rx={big ? 6 : 3} fill={alpha(C.rose, 0.5 * c.rose)} />}
                {big && c.green > 0.5 && c.rose < 0.5 && (
                  <path
                    d={`M ${x + cw / 2 - 13} ${y + ch / 2 + 1} l 9 9 l 18 -19`}
                    fill="none"
                    stroke={alpha(C.bg0, 0.85)}
                    strokeWidth={6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={(c.green - 0.5) * 2}
                  />
                )}
                {c.corner > 0 &&
                  [
                    [x + gap / 2 + 6, y + gap / 2 + 6],
                    [x + cw - gap / 2 - 6, y + gap / 2 + 6],
                    [x + gap / 2 + 6, y + ch - gap / 2 - 6],
                    [x + cw - gap / 2 - 6, y + ch - gap / 2 - 6],
                  ].map(([cx, cy], j) => <circle key={j} cx={cx} cy={cy} r={4.5} fill={C.text} opacity={c.corner} />)}
              </g>
            );
          })}
        {p.kind === 2 &&
          Array.from({ length: LATTICE.nx * LATTICE.ny }, (_, k) => {
            const i = k % LATTICE.nx;
            const j = Math.floor(k / LATTICE.nx);
            const x = ((i + 0.5) / LATTICE.nx) * r.w;
            const y = ((j + 0.5) / LATTICE.ny) * r.h;
            return (
              <g key={k}>
                {p.pulse > 0 && i < LATTICE.nx - 1 && j < LATTICE.ny - 1 && (
                  <rect x={x + 12} y={y + 12} width={r.w / LATTICE.nx - 24} height={r.h / LATTICE.ny - 24} rx={6} fill={alpha(C.accentText, 0.32 * p.pulse)} stroke={alpha(C.accentText, 0.8 * p.pulse)} strokeWidth={2} strokeDasharray="5 6" />
                )}
                <circle cx={x} cy={y} r={7} fill={C.text} opacity={p.reveal} />
              </g>
            );
          })}
        {p.kind === 2 && ghosts && ghosts.show > 0 && <GapGhosts r={r} g={ghosts} />}
        {p.kind === 3 &&
          DOTS.map((q, k) => {
            const local = Math.min(1, Math.max(0, p.reveal * 1.6 - q.d * 0.6));
            return <circle key={k} cx={q.x * r.w} cy={q.y * r.h - (1 - local) * 40} r={6.5} fill={C.text} opacity={local} />;
          })}
      </g>
      <rect width={r.w} height={r.h} rx={big ? 22 : 16} fill="none" stroke={alpha('#ffffff', 0.18)} strokeWidth={2} />
    </svg>
  );
};

/** Halloween, lift: little ghosts peeking out of the gaps the grid never checks. */
type GridGhosts = { show: number; t: number };
const GAPS = [
  { i: 1, j: 0, at: 0, tilt: -8, look: 1 },
  { i: 4, j: 1, at: 0.25, tilt: 6, look: -1 },
  { i: 2, j: 2, at: 0.5, tilt: -4, look: 1 },
];
const GapGhosts: React.FC<{ r: Rect; g: GridGhosts }> = ({ r, g }) => (
  <>
    {GAPS.map((q, k) => {
      const p = easeOutCubic(progress(g.show, q.at / 1.4, 0.45));
      const x = ((q.i + 1) / LATTICE.nx) * r.w;
      const y = ((q.j + 1) / LATTICE.ny) * r.h;
      return <Ghost key={k} x={x} y={y + 18 * (1 - p) + 2 * Math.sin(g.t * 3 + k * 2)} size={40} opacity={p} t={g.t + k} tilt={q.tilt} look={q.look} />;
    })}
  </>
);

/** Halloween, hook: a few bats crossing above the title, in the strip under the badge. */
const BATS = [
  { at: 0.5, y: -24, span: 92, speed: 1.25, dir: 1 },
  { at: 0.72, y: -40, span: 70, speed: 1.4, dir: 1 },
  { at: 0.9, y: -12, span: 62, speed: 1.1, dir: 1 },
  { at: 5.1, y: -28, span: 82, speed: 1.3, dir: -1 },
  { at: 5.35, y: -14, span: 62, speed: 1.15, dir: -1 },
];
const Bats: React.FC<{ t: number }> = ({ t }) => (
  <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} width={W} height={10}>
    {BATS.map((b, k) => {
      const q = progress(t, b.at, b.speed);
      if (q <= 0 || q >= 1) return null;
      const x = b.dir > 0 ? -120 + q * (W + 240) : W + 120 - q * (W + 240);
      return <Bat key={k} x={x} y={b.y + 8 * Math.sin(q * 9 + k)} span={b.span} flap={Math.sin(t * 26 + k * 1.7)} />;
    })}
  </svg>
);

/** Halloween, focus: a ghost sheet drops over the certificate on "lied", boxes still showing. */
const Sheet: React.FC<{ drop: number; t: number }> = ({ drop, t }) => {
  if (drop <= 0) return null;
  const R = BIG;
  const w = R.w + 40;
  const h = R.h + 14;
  const n = 8;
  const sw = w / n;
  let hem = '';
  for (let k = n; k > 0; k--) {
    const x0 = k * sw;
    const wv = Math.sin(t * 4 + k) * 8;
    hem += ` Q ${x0 - sw / 2} ${h + 26 + wv} ${x0 - sw} ${h - 4}`;
  }
  const blink = bump(progress(t, 3.9, 0.22));
  return (
    <svg style={{ position: 'absolute', left: R.x - 20, top: R.y - 12, overflow: 'visible', opacity: drop, transform: `translateY(${-(1 - drop) * 140}px)` }} width={w} height={h}>
      <path d={`M 0 ${h - 4} L 6 150 Q 14 0 190 0 L ${w - 190} 0 Q ${w - 14} 0 ${w - 6} 150 L ${w} ${h - 4}${hem} Z`} fill={alpha(C.text, 0.26)} stroke={alpha(C.text, 0.8)} strokeWidth={3} />
      {[0.3, 0.5, 0.7].map((f, k) => (
        <path key={k} d={`M ${w * f} 60 Q ${w * f + 14} ${h * 0.55} ${w * f - 6} ${h - 30}`} fill="none" stroke={alpha(C.text, 0.22)} strokeWidth={4} strokeLinecap="round" />
      ))}
      {/* A sly look: one eye half shut, the other blinks once. */}
      <ellipse cx={w / 2 - 100} cy={178} rx={30} ry={20} fill={C.bg0} />
      <ellipse cx={w / 2 + 100} cy={170} rx={30} ry={42 * (1 - 0.9 * blink)} fill={C.bg0} />
      <path d={`M ${w / 2 - 70} 262 Q ${w / 2 + 10} 312 ${w / 2 + 82} 246`} fill="none" stroke={C.bg0} strokeWidth={12} strokeLinecap="round" />
    </svg>
  );
};

const TileView: React.FC<{ tile: Tile; i: number; big: boolean; ghosts?: GridGhosts }> = ({ tile, i, big, ghosts }) => {
  const r = tile.rect;
  const header = big ? HEADER * (1 - tile.away) : HEADER;
  const region: Rect = { x: 0, y: header, w: r.w, h: r.h - header };
  const cardH = header + tile.cover * (r.h - header);
  const sentenceSize = 23 + 15 * tile.cover;
  return (
    <div style={{ position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, opacity: tile.opacity }}>
      <Pattern tile={tile} r={region} big={big} id={`t${i}`} ghosts={ghosts} />
      {tile.sub.appear > 0 && (
        <div style={{ position: 'absolute', left: 12, right: 12, bottom: 14, display: 'flex', justifyContent: 'center', opacity: tile.sub.appear, transform: `translateY(${(1 - tile.sub.appear) * 14}px)` }}>
          <div style={{ padding: '7px 16px', borderRadius: 14, background: alpha(C.bg0, 0.88), border: `1.5px solid ${alpha(C.accentText, 0.5)}`, fontSize: 26, fontWeight: 700, color: C.text, textAlign: 'center', lineHeight: 1.15, whiteSpace: 'pre-line' }}>
            {i === 3 ? (
              <>
                <span style={{ color: C.accentText, fontVariantNumeric: 'tabular-nums' }}>{tile.pattern.count}</span> {tile.sub.text}
              </>
            ) : (
              tile.sub.text
            )}
          </div>
        </div>
      )}
      {tile.away < 1 && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: r.w,
            height: cardH,
            borderRadius: 18,
            background: `linear-gradient(180deg, ${C.card}, ${C.bg1})`,
            border: `2px solid ${tile.card.lit > 0 ? alpha(C.accentText, 0.14 + 0.36 * tile.card.lit) : alpha('#ffffff', 0.14)}`,
            boxShadow: `0 ${10 + 18 * (1 - tile.cover)}px 30px ${alpha('#000000', 0.55)}${tile.card.pulse > 0 ? `, 0 0 ${34 * tile.card.pulse}px ${alpha(C.accent, 0.45 * tile.card.pulse)}` : ''}`,
            transform: `translateY(${-140 * tile.away}px)`,
            opacity: 1 - tile.away,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            padding: '0 84px 0 24px',
            boxSizing: 'border-box',
            overflow: 'hidden',
          }}
        >
          {tile.card.software > 0 ? (
            <div style={{ fontSize: 27, fontWeight: 700, lineHeight: 1.16, color: C.text }}>{tile.card.swText}</div>
          ) : (
            <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: sentenceSize, lineHeight: 1.22, color: C.text, transform: tile.card.pulse > 0 ? `scale(${1 + 0.03 * tile.card.pulse}) rotate(${-0.6 * tile.card.pulse}deg)` : undefined, transformOrigin: 'left center' }}>
              {tile.card.text}
            </div>
          )}
        </div>
      )}
      {tile.tick.appear > 0 && (
        <div
          style={{
            position: 'absolute',
            right: 12,
            top: 12 - 70 * tile.tick.lift + (big ? -140 * tile.away : 0),
            opacity: tile.tick.appear,
            transform: `scale(${(0.6 + 0.4 * Math.min(1, tile.tick.appear * 1.3)) * (1 + 0.18 * tile.tick.pulse)})`,
          }}
        >
          <Tick size={64} />
        </div>
      )}
      {tile.stamp.pop > 0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: tile.cover > 0.5 ? r.h * 0.7 : header + (r.h - header) * 0.42, display: 'flex', justifyContent: 'center' }}>
          <Stamp text={tile.stamp.text} color={STAMP_TONES[tile.stamp.tone]} pop={tile.stamp.pop} size={tile.stamp.text.length > 10 ? 40 : 46} />
        </div>
      )}
    </div>
  );
};

const RegionOverlays: React.FC<{ s: TilesState }> = ({ s }) => {
  const R = BIG;
  return (
    <>
      {s.refuted && s.refuted.pop > 0 && (
        <div style={{ position: 'absolute', left: R.x, width: R.w, top: R.y + 50, display: 'flex', justifyContent: 'center' }}>
          <Stamp text="REFUTED" color={C.rose} pop={s.refuted.pop} size={84} rotate={-6} />
        </div>
      )}
      {s.chips.length > 0 && (
        <div style={{ position: 'absolute', left: R.x + 30, width: R.w - 60, top: R.y + 230, display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'flex-start' }}>
          {s.chips.map((c, i) => (
            <div
              key={i}
              style={{
                opacity: c.pop,
                transform: `translateX(${(1 - c.pop) * -40}px)`,
                padding: '12px 24px',
                borderRadius: 16,
                background: c.hot > 0 ? alpha(C.bg0, 0.96) : alpha(C.bg0, 0.88),
                border: `${2 + 2 * c.hot}px solid ${c.hot > 0 ? C.roseText : alpha('#ffffff', 0.25)}`,
                fontSize: 33,
                fontWeight: 700,
                color: C.text,
                display: 'flex',
                alignItems: 'center',
                gap: 22,
                boxShadow: c.hot > 0 ? `0 0 ${30 * c.hot}px ${alpha(C.rose, 0.6)}` : undefined,
              }}
            >
              <span style={{ color: C.roseText }}>✗</span>
              {c.text}
              {i === 2 && <Stamp text="SAMPLED" color={STAMP_TONES[3]} pop={s.chipStamp} size={30} rotate={-5} />}
            </div>
          ))}
        </div>
      )}
      {s.exact && s.exact.appear > 0 && (
        <div style={{ position: 'absolute', right: W - R.x - R.w + 18, top: R.y + 18, opacity: s.exact.appear, padding: '8px 20px', borderRadius: 14, background: alpha(C.bg0, 0.9), border: `2px solid ${C.text}`, fontSize: 30, fontWeight: 700 }}>
          ● exact arithmetic on the corners
        </div>
      )}
      {s.test && s.test.appear > 0 && (
        <div style={{ position: 'absolute', left: R.x, width: R.w, top: R.y + R.h + 16, height: 72, display: 'flex', alignItems: 'center', gap: 20, opacity: s.test.appear }}>
          <div style={{ padding: '10px 22px', borderRadius: 14, border: `2px solid ${alpha(C.accentText, 0.6)}`, background: alpha(C.bg1, 0.9), fontSize: 32, fontWeight: 700 }}>acceptance test</div>
          {s.test.eps > 0 && (
            <div
              style={{
                padding: '10px 24px',
                borderRadius: 14,
                background: alpha(C.rose, 0.2),
                border: `3px solid ${C.roseText}`,
                fontSize: 40,
                fontWeight: 800,
                color: C.text,
                opacity: Math.min(1, s.test.eps * 1.5),
                transform: `translateY(${-90 * (1 - s.test.eps)}px)`,
              }}
            >
              ε = 1e-12
            </div>
          )}
        </div>
      )}
      {s.reviewer && s.reviewer.appear > 0 && <Reviewer r={s.reviewer} />}
    </>
  );
};

const CHIP = { x: 580, y: 96, w: 360, h: 196 };
const Reviewer: React.FC<{ r: NonNullable<TilesState['reviewer']> }> = ({ r }) => {
  const sx = 290;
  const sy = 300;
  const ex = CHIP.x + 50;
  const ey = CHIP.y + 100;
  const cx = sx + (ex - sx) * r.card;
  const cy = sy + (ey - sy) * r.card - Math.sin(Math.PI * r.card) * 60;
  const op = 1 - 0.75 * r.dim;
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: CHIP.x,
          top: CHIP.y,
          width: CHIP.w,
          height: CHIP.h,
          borderRadius: 24,
          border: `3px solid ${C.text}`,
          background: alpha(C.bg1, 0.95),
          opacity: r.appear * op,
          transform: `translateX(${(1 - r.appear) * 220}px)`,
          display: 'flex',
          alignItems: 'center',
          gap: 22,
          padding: '0 24px',
          boxSizing: 'border-box',
        }}
      >
        <svg width={86} height={86} viewBox="0 0 86 86">
          <rect x={4} y={4} width={78} height={78} rx={18} fill="none" stroke={C.muted} strokeWidth={4} />
          <circle cx={43} cy={43} r={16} fill="none" stroke={C.muted} strokeWidth={4} />
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontSize: 38, fontWeight: 800 }}>reviewer</div>
          <div style={{ fontSize: 28, fontWeight: 600, color: C.muted }}>separate model</div>
        </div>
      </div>
      {r.cardAppear > 0 && r.card < 1 && (
        <div
          style={{
            position: 'absolute',
            left: cx - 105,
            top: cy - 40,
            width: 210,
            padding: '12px 14px',
            borderRadius: 12,
            background: C.text,
            color: C.bg0,
            fontSize: 26,
            fontWeight: 800,
            textAlign: 'center',
            opacity: r.cardAppear * (1 - Math.max(0, r.card - 0.85) / 0.15),
            transform: `scale(${1 - 0.3 * r.card})`,
            boxShadow: `0 10px 26px ${alpha('#000000', 0.6)}`,
          }}
        >
          statement only
        </div>
      )}
      {r.arrow > 0 && (
        <>
          <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} width={W} height={H}>
            <line x1={CHIP.x + 260} y1={CHIP.y + CHIP.h + 4} x2={CHIP.x + 260} y2={CHIP.y + CHIP.h + 4 + (BIG.y - CHIP.y - CHIP.h - 4) * r.arrow} stroke={C.roseText} strokeWidth={7} opacity={op} />
            {r.arrow >= 1 && <path d={`M ${CHIP.x + 244} ${BIG.y - 22} L ${CHIP.x + 260} ${BIG.y - 2} L ${CHIP.x + 276} ${BIG.y - 22}`} fill="none" stroke={C.roseText} strokeWidth={7} strokeLinejoin="round" opacity={op} />}
          </svg>
          <div style={{ position: 'absolute', left: CHIP.x + 18, top: CHIP.y + CHIP.h + 34, padding: '6px 18px', borderRadius: 12, background: C.rose, color: C.text, fontSize: 32, fontWeight: 800, opacity: Math.min(1, r.arrow * 2) * op }}>
            break it
          </div>
        </>
      )}
    </>
  );
};

export const CoverageTiles: React.FC<AnimProps & TilesProps> = ({ t, beats, dur, vertical, ...p }) => {
  const s = frameState(p, t, beats, dur);
  const region = !['same', 'lift', 'stamp', 'software', 'close'].includes(p.mode);
  const st = sceneTime(t, dur);
  const silent = p.cue?.silent;
  const ghosts: GridGhosts | undefined = HALLOWEEN && p.mode === 'lift' && silent !== undefined ? { show: Math.max(0, st - silent - 0.35), t: st } : undefined;
  const lied = p.cue?.lied;
  const sheet = HALLOWEEN && p.mode === 'focus' && lied !== undefined ? easeOutCubic(progress(st, lied - 0.1, 0.45)) : 0;
  return (
    <Stage vertical={vertical} fill>
      <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H }}>
        {s.title && (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 190, display: 'flex', flexWrap: 'wrap', alignContent: 'center', justifyContent: 'center', columnGap: 22, fontSize: 80, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em', opacity: s.title.appear }}>
            {s.title.words.map((w, i) => (
              <span key={i} style={{ opacity: 0.3 + 0.7 * w.lit, ...(w.text === 'same' && w.lit > 0.5 ? gradientText : { color: C.text }) }}>
                {w.text}
              </span>
            ))}
          </div>
        )}
        {s.topTag && s.topTag.appear > 0 && (
          <div style={{ position: 'absolute', left: 0, top: 0, opacity: s.topTag.appear, padding: '8px 22px', borderRadius: 30, border: `2px solid ${alpha(C.accentText, 0.6)}`, fontSize: 32, fontWeight: 700, color: C.accentText }}>
            60-page preprint
          </div>
        )}
        {s.topLine && s.topLine.appear > 0 && (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 72, textAlign: 'center', fontSize: 44, fontWeight: 800, lineHeight: 1.15, opacity: s.topLine.appear, transform: `translateY(${(1 - s.topLine.appear) * 16}px)` }}>
            a label <span style={gradientText}>per claim</span>,<br />not a tick for the paper
          </div>
        )}
        {s.ci && s.ci.appear > 0 && (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 40, display: 'flex', justifyContent: 'center', opacity: s.ci.appear, transform: `scale(${0.8 + 0.2 * s.ci.appear})` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '14px 36px', borderRadius: 50, background: alpha(C.ok, 0.16), border: `3px solid ${C.ok}`, fontSize: 56, fontWeight: 800 }}>
              <Tick size={64} /> CI passing
            </div>
          </div>
        )}
        {s.quote && (
          <div style={{ position: 'absolute', left: 150, right: 150, top: 0, height: 190, display: 'flex', flexWrap: 'wrap', alignContent: 'center', justifyContent: 'center', columnGap: 20, fontSize: 70, fontWeight: 800, lineHeight: 1.12, letterSpacing: '-0.02em' }}>
            {s.quote.words.map((w, i) => (
              <span key={i} style={{ opacity: w.opacity, transform: `translateY(${(1 - w.opacity) * 18}px)`, ...(w.emphasis ? gradientText : { color: C.text }) }}>
                {w.text}
              </span>
            ))}
          </div>
        )}
        {s.pan && s.pan.appear > 0 && (
          <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} width={W} height={H}>
            <g opacity={s.pan.appear} transform={`translate(0 ${(1 - s.pan.appear) * -30})`}>
              <PanRings cx={PAN.cx} cy={PAN.cy} R={PAN.R} spread={0.55 + 0.25 * s.pan.wobble} id="mini" />
            </g>
          </svg>
        )}
        {s.pan && s.pan.appear > 0 && (
          <div style={{ position: 'absolute', left: PAN.cx + PAN.R + 30, top: PAN.cy - 60, fontSize: 30, fontWeight: 700, color: C.muted, opacity: s.pan.appear * (s.reviewer ? 1 - s.reviewer.appear : 1), lineHeight: 1.25 }}>
            one lemma:
            <br />
            <span style={{ color: C.text }}>five rings in a pan</span>
          </div>
        )}
        {s.regionLabel && s.regionLabel.appear > 0 && (
          <div style={{ position: 'absolute', left: BIG.x, top: BIG.y - 58, fontSize: 32, fontWeight: 700, color: s.regionLabel.text === 'BOX-CERTIFIED' ? C.accent2 : C.muted, letterSpacing: s.regionLabel.text === 'BOX-CERTIFIED' ? '0.08em' : undefined, opacity: s.regionLabel.appear }}>
            {s.regionLabel.text}
          </div>
        )}
        {s.tiles.map((tile, i) => (region && i !== 1 && tile.opacity <= 0 ? null : <TileView key={i} tile={tile} i={i} big={region && i === 1} ghosts={i === 2 ? ghosts : undefined} />))}
        {region && <RegionOverlays s={s} />}
        {sheet > 0 && <Sheet drop={sheet} t={st} />}
        {HALLOWEEN && p.mode === 'same' && <Bats t={st} />}
        {s.tally && <Tally value={s.tally.value} appear={s.tally.appear} pulse={s.tally.pulse} />}
      </div>
    </Stage>
  );
};

