import React from 'react';
import { staticFile } from 'remotion';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { Canvas } from './Canvas.tsx';
import { gradientText } from './Stage.tsx';
import {
  FIRST,
  FORK,
  PAST,
  SIDE,
  STEEP,
  STOP,
  SUMMIT,
  frameState,
  pointAt,
  slice,
  smooth,
  type Pt,
  type TrailProps,
} from './Trail.state.ts';

export { frameState };
export type { TrailProps };

// Everything is drawn in vertical frame pixels (1080x1920); the camera moves over that world.
const CENTRE = { x: 540, y: 781 };
const STAGE = { x: 60, y: 236, w: 960, h: 1090 };

const d = (pts: Pt[]): string => (pts.length < 2 ? '' : 'M' + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L'));

const hash = (n: number): number => {
  const x = Math.sin(n * 91.7 + 13.3) * 43758.5453;
  return x - Math.floor(x);
};

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

// ── The mountain: the steep stretch climbs a pile of file tiles, dim until the light passes ────
const TILE = { w: 46, h: 22, gap: 6 };
type Tile = { x: number; y: number; near: number; dist: number };
const STEEP_SAMPLES = Array.from({ length: 61 }, (_, i) => ({ f: i / 60, ...pointAt(STEEP, i / 60) }));
const TILES: Tile[] = (() => {
  const out: Tile[] = [];
  for (let r = 0; r < 16; r++) {
    const count = Math.min(10, 2 + Math.round(r * 0.6));
    const cx = 575 - r * 5;
    const y = 330 + r * 30;
    const w = count * (TILE.w + TILE.gap) - TILE.gap;
    for (let c = 0; c < count; c++) {
      const x = cx - w / 2 + c * (TILE.w + TILE.gap);
      let best = { f: 0, dist: Infinity };
      for (const s of STEEP_SAMPLES) {
        const dist = Math.hypot(s.x - (x + TILE.w / 2), s.y - (y + TILE.h / 2));
        if (dist < best.dist) best = { f: s.f, dist };
      }
      out.push({ x, y, near: best.f, dist: best.dist });
    }
  }
  return out;
})();

/** How far up the steep route the map has got when its front is at height `y`. */
const routeBelow = (y: number): number => {
  let f = 0;
  for (const s of STEEP_SAMPLES) {
    if (s.y < y) break;
    f = s.f;
  }
  return f;
};

// ── Side routes ────────────────────────────────────────────────────────────────────────────────
const DEAD_ENDS: { from: number; path: Pt[] }[] = [
  { from: 0.18, path: smooth([[230, 1262], [200, 1340], [120, 1370]], 8) },
  { from: 0.47, path: smooth([[268, 1150], [170, 1120], [100, 1150]], 8) },
  { from: 0.66, path: smooth([[440, 1090], [470, 1180], [560, 1230], [640, 1300]], 8) },
];
const TICKS = [0.07, 0.17, 0.27, 0.37, 0.47, 0.57, 0.67].map((f) => ({ f, ...pointAt(PAST, f), next: pointAt(PAST, f + 0.01) }));

const NEW_FORKS: Pt[][] = [
  smooth([[268, 1150], [170, 1080], [110, 980], [90, 880]], 8),
  smooth([FORK, [830, 1080], [940, 1150], [1000, 1250]], 8),
  smooth([STOP, [300, 760], [200, 700], [120, 600]], 8),
  smooth([[790, 870], [880, 790], [950, 680], [990, 560]], 8),
  smooth([[600, 1110], [660, 1200], [760, 1260], [880, 1300]], 8),
];

const CROWD: { to: Pt; from: Pt }[] = (
  [
    [[240, 830], [0, 800]],
    [[690, 760], [1080, 700]],
    [[185, 900], [0, 950]],
    [[850, 790], [1080, 760]],
    [[290, 905], [0, 1000]],
    [[930, 1000], [1080, 1040]],
    [[150, 810], [0, 760]],
    [[905, 850], [1080, 900]],
    [[330, 975], [0, 1060]],
    [[540, 1010], [540, 1400]],
    [[830, 720], [1080, 650]],
    [[215, 985], [0, 1100]],
    [[470, 985], [420, 1400]],
    [[925, 760], [1080, 720]],
  ] as [Pt, Pt][]
).map(([to, from]) => ({ to, from }));

// ── Drawing pieces ─────────────────────────────────────────────────────────────────────────────
/** A person as a game piece: no face, no likeness. `y` is where it stands. */
const Piece: React.FC<{ x: number; y: number; s?: number; body: string; head: string; lean?: number; lift?: number }> = ({ x, y, s = 1, body, head, lean = 0, lift = 0 }) => (
  <g transform={`translate(${x} ${y})`}>
    <ellipse cx={0} cy={1} rx={13 * s} ry={3.5 * s} fill={alpha('#000000', 0.45)} />
    <g transform={`translate(0 ${-lift}) rotate(${lean}) scale(${s})`}>
      <path d="M-11 0 Q-13 -26 -6 -30 L6 -30 Q13 -26 11 0 Z" fill={body} />
      <circle cx={0} cy={-39} r={8.5} fill={head} />
    </g>
  </g>
);

/** Trimmed sizes of the Codex cast in public/cast (feet at the bottom centre). */
const CAST = {
  walker: [485, 890], 'walker-pick': [556, 816], 'walker-stop': [334, 879], 'walker-draw': [622, 783],
  'robot-climb': [530, 667], 'second-math': [508, 885], 'paper-pile': [747, 652],
  'mapper-1': [264, 570], 'mapper-2': [239, 576], 'mapper-3': [264, 563], 'mapper-4': [257, 567], 'mapper-5': [287, 563],
} as const;
type CastName = keyof typeof CAST;

/** A drawn figure standing at (x, y): `h` tall in world units, mirrored when `flip`. */
const Fig: React.FC<{ src: CastName; x: number; y: number; h: number; flip?: boolean; lift?: number; rot?: number; opacity?: number; shadow?: boolean }> = ({ src, x, y, h, flip, lift = 0, rot = 0, opacity = 1, shadow = true }) => {
  const [w0, h0] = CAST[src];
  const w = (h * w0) / h0;
  return (
    <g opacity={opacity} transform={`translate(${x} ${y})`}>
      {shadow && <ellipse cx={0} cy={1} rx={w * 0.32} ry={h * 0.035} fill={alpha('#000000', 0.45)} />}
      <g transform={`translate(0 ${-lift}) rotate(${rot}) scale(${flip ? -1 : 1} 1)`}>
        <image href={staticFile(`cast/${src}.png`)} x={-w / 2} y={-h} width={w} height={h} />
      </g>
    </g>
  );
};

/** The painted mountain of pages (public/bg), placed so its summit sits on SUMMIT. */
const BG = { x: -106, y: 205, w: 1160, h: 1740 };

const Trailline: React.FC<{ pts: Pt[]; colour?: string; width?: number; glow?: string }> = ({ pts, colour = C.text, width = 7, glow = C.accent }) =>
  pts.length < 2 ? null : (
    <>
      <path d={d(pts)} fill="none" stroke={alpha(glow, 0.35)} strokeWidth={width + 12} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d(pts)} fill="none" stroke={colour} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
    </>
  );

const Card: React.FC<{ left: number; top: number; opacity: number; size?: number; strong?: boolean; children: React.ReactNode }> = ({ left, top, opacity, size = 38, strong, children }) =>
  opacity <= 0 ? null : (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        opacity,
        transform: `translateY(${(1 - opacity) * 14}px)`,
        padding: strong ? '16px 30px' : '12px 24px',
        borderRadius: 20,
        background: alpha(C.card, 0.97),
        border: `2px solid ${alpha(strong ? C.accent2 : C.accent, strong ? 0.75 : 0.4)}`,
        boxShadow: `0 14px 40px ${alpha('#000000', 0.5)}`,
        fontFamily,
        fontSize: size,
        fontWeight: strong ? 800 : 600,
        lineHeight: 1.2,
        color: C.text,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </div>
  );

/** The trail (see Trail.state.ts): a metaphor for who did what, not footage of anything. */
export const Trail: React.FC<AnimProps & TrailProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const cam = `translate(${CENTRE.x} ${CENTRE.y}) scale(${s.zoom}) translate(${-s.camX} ${-s.camY})`;
  const w = s.walker;
  const step = Math.sin(s.stride * Math.PI * 2);
  const frontY = STOP[1] - s.map * (STOP[1] - SUMMIT[1]);
  const mapped = routeBelow(frontY);
  const flicker = 0.85 + 0.15 * Math.sin(s.T * 9) * Math.sin(s.T * 2.3);
  const hand = { x: w.x + 24 * w.dir, y: w.y - 36 };
  // The overlooked sheet: under the pile, then in the walker's hand, then laid out as the trail.
  const pileAt = { x: 770, y: 1046 };
  const sheet = {
    x: pileAt.x + (hand.x - pileAt.x) * s.pick + (FORK[0] - 40 - hand.x) * s.unfold,
    y: pileAt.y - 4 + (hand.y - (pileAt.y - 4)) * s.pick + (FORK[1] - 30 - hand.y) * s.unfold,
    w: 60 + (22 - 60) * s.pick,
    h: 7 + (28 - 7) * s.pick,
  };
  const easel = { x: STOP[0] - 150, y: STOP[1] - 118, w: 64, h: 90 };
  const mini = (pt: Pt): Pt => [easel.x + 12 + (pt[0] - 400) * 0.2, easel.y + 82 + (pt[1] - 800) * 0.155];
  const sketchTip = pointAt(STEEP, s.sketch);
  return (
    <>
      <Canvas vertical={p.vertical} design="vertical">
        <defs>
          <filter id="tr-soft" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
          <mask id="tr-mask" maskUnits="userSpaceOnUse" x={0} y={0} width={1080} height={1920}>
            <rect x={STAGE.x + 22} y={STAGE.y + 22} width={STAGE.w - 44} height={STAGE.h - 44} rx={40} fill="#fff" filter="url(#tr-soft)" />
          </mask>
          <radialGradient id="tr-light">
            <stop offset="0" stopColor={C.text} stopOpacity="1" />
            <stop offset="0.25" stopColor={C.accentText} stopOpacity="0.9" />
            <stop offset="1" stopColor={C.accentText} stopOpacity="0" />
          </radialGradient>
        </defs>
        <g mask="url(#tr-mask)">
          <g transform={cam}>
            {/* the painted mountain of pages, faded into the dark at its edges */}
            <defs>
              <radialGradient id="tr-bgfade" cx="0.5" cy="0.34" r="0.62">
                <stop offset="0.55" stopColor="#fff" stopOpacity="1" />
                <stop offset="1" stopColor="#fff" stopOpacity="0" />
              </radialGradient>
              <mask id="tr-bgmask" maskUnits="userSpaceOnUse" x={BG.x} y={BG.y} width={BG.w} height={BG.h}>
                <rect x={BG.x} y={BG.y} width={BG.w} height={BG.h} fill="url(#tr-bgfade)" />
              </mask>
            </defs>
            <image href={staticFile('bg/bg-mountain-v.jpg')} x={BG.x} y={BG.y} width={BG.w} height={BG.h} preserveAspectRatio="xMidYMid slice" mask="url(#tr-bgmask)" opacity={0.7} />
            {/* ground */}
            {Array.from({ length: 70 }, (_, i) => (
              <circle key={i} cx={40 + hash(i) * 1000} cy={820 + hash(i + 200) * 560} r={2.2} fill={alpha(C.text, 0.07 + hash(i + 400) * 0.06)} />
            ))}

            {Array.from({ length: 8 }, (_, k) => (
              <path
                key={k}
                d={d(Array.from({ length: 23 }, (_, i): Pt => [i * 50 - 10, 850 + k * 68 + 18 * Math.sin((i * 50) / 140 + k * 1.3) + 10 * Math.sin((i * 50) / 61 + k)]))}
                fill="none"
                stroke={alpha(C.accentText, 0.1)}
                strokeWidth={2}
              />
            ))}

            {/* the mountain of files */}
            {TILES.map((tl, i) => {
              const lit = s.run > 0 && tl.dist < 62 && s.run >= tl.near;
              const charted = s.map > 0 && tl.y + TILE.h / 2 > frontY;
              return (
                <rect
                  key={i}
                  x={tl.x}
                  y={tl.y}
                  width={TILE.w}
                  height={TILE.h}
                  rx={4}
                  fill={charted ? alpha(C.accent2, 0.5) : lit ? alpha(C.accentText, 0.4) : 'none'}
                  stroke={charted ? alpha(C.text, 0.85) : lit ? alpha(C.accentText, 0.8) : 'none'}
                  strokeWidth={1.5}
                />
              );
            })}

            {/* forks he did not take, and the years behind him */}
            {DEAD_ENDS.map((b, i) => (
              <path key={i} d={d(slice(b.path, 0, clamp01(s.marks * 1.4 - i * 0.2)))} fill="none" stroke={alpha(C.muted, s.pos >= b.from ? 0.45 : 0)} strokeWidth={4} strokeDasharray="4 9" strokeLinecap="round" />
            ))}
            <Trailline pts={slice(PAST, 0, Math.min(1, s.pos))} />
            {TICKS.map((tk, i) => {
              const on = s.pos >= tk.f ? clamp01(s.marks * 2 - i * 0.14) : 0;
              const nx = -(tk.next.y - tk.y);
              const ny = tk.next.x - tk.x;
              const n = Math.hypot(nx, ny) || 1;
              return <line key={i} x1={tk.x - (nx / n) * 15} y1={tk.y - (ny / n) * 15} x2={tk.x + (nx / n) * 15} y2={tk.y + (ny / n) * 15} stroke={alpha(C.accentText, on)} strokeWidth={4} strokeLinecap="round" />;
            })}

            {/* the sheet, unfolded into the next stretch; then walked */}
            {s.unfold > 0 && <path d={d(slice(FIRST, 0, s.unfold))} fill="none" stroke={alpha(C.text, 0.3)} strokeWidth={24} strokeLinecap="round" strokeLinejoin="round" />}
            {s.unfold > 0 && <path d={d(slice(FIRST, 0, s.unfold))} fill="none" stroke={alpha(C.accentText, 0.9)} strokeWidth={3} strokeDasharray="2 10" strokeLinecap="round" />}
            <Trailline pts={slice(FIRST, 0, s.pos - 1)} />

            {/* the steep stretch: a hint, the light's wake, and what has been mapped */}
            {s.steep > 0 && <path d={d(STEEP)} fill="none" stroke={alpha(C.muted, 0.55 * s.steep)} strokeWidth={4} strokeDasharray="3 11" strokeLinecap="round" />}
            {s.run > 0 && <path d={d(slice(STEEP, 0, s.run))} fill="none" stroke={alpha(C.accentText, 0.95)} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />}
            {s.map > 0 && (
              <>
                <Trailline pts={slice(STEEP, 0, mapped)} glow={C.accent2} />
                {[0.12, 0.26, 0.4, 0.54, 0.68, 0.8].filter((f) => f <= mapped).map((f) => {
                  const pt = pointAt(STEEP, f);
                  return <circle key={f} cx={pt.x} cy={pt.y} r={9} fill={C.bg0} stroke={C.text} strokeWidth={4} />;
                })}
                <line x1={215} y1={frontY} x2={790} y2={frontY} stroke={alpha(C.text, 0.8)} strokeWidth={3} strokeDasharray="10 8" />
              </>
            )}

            {/* new forks, at the end */}
            {s.forks > 0 &&
              NEW_FORKS.map((path, i) => {
                const prog = clamp01(s.forks * 1.5 - i * 0.1);
                const at = pointAt(path, prog);
                return (
                  <g key={i}>
                    <path d={d(slice(path, 0, prog))} fill="none" stroke={alpha(C.accentText, 0.9)} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
                    {prog > 0.02 && <Piece x={at.x} y={at.y} s={0.8} body={alpha(C.accentText, 0.95)} head={C.text} lift={Math.abs(Math.sin(prog * 40)) * 3} />}
                  </g>
                );
              })}

            {/* the pile a rival lab had published */}
            {s.pile > 0 && (
              <g opacity={s.pile} transform={`translate(0 ${(1 - s.pile) * 10})`}>
                <Fig src="paper-pile" x={pileAt.x} y={pileAt.y + 8} h={96} />
              </g>
            )}
            {s.pile > 0 && s.unfold < 1 && (
              <g opacity={s.pile * (1 - s.unfold)}>
                {s.glow > 0 && <circle cx={sheet.x} cy={sheet.y} r={30 + 6 * Math.sin(s.T * 5)} fill="url(#tr-light)" opacity={0.75 * s.glow} />}
                <rect x={sheet.x - sheet.w / 2} y={sheet.y - sheet.h / 2} width={sheet.w} height={sheet.h} rx={2} fill={s.glow > 0.5 ? C.text : alpha(C.text, 0.6)} stroke={alpha(C.accentText, s.glow)} strokeWidth={2.5} />
              </g>
            )}

            {/* the second figure's own way in */}
            {s.second > 0 && <path d={d(slice(SIDE, 0, s.second))} fill="none" stroke={alpha(C.accent2, 0.6)} strokeWidth={5} strokeDasharray="5 9" strokeLinecap="round" />}

            {/* the crowd */}
            {s.crowd > 0 &&
              CROWD.map((c, i) => {
                const prog = clamp01((s.crowd - i * 0.04) / 0.44);
                if (prog <= 0) return null;
                const e = 1 - (1 - prog) ** 3;
                const x = c.from[0] + (c.to[0] - c.from[0]) * e;
                const y = c.from[1] + (c.to[1] - c.from[1]) * e;
                const idle = prog >= 1 ? Math.max(0, Math.sin(s.T * 3 + i * 1.7)) * 2.5 : Math.abs(Math.sin(prog * 14)) * 4;
                return (
                  <g key={i}>
                    <Fig src={`mapper-${(i % 5) + 1}` as CastName} x={x} y={y} h={70} flip={c.to[0] < c.from[0]} lift={idle} />
                    
                  </g>
                );
              })}

            {/* the second figure, with twelve years of manuscript */}
            {s.second > 0 && (
              <Fig src="second-math" x={s.secondAt.x} y={s.secondAt.y} h={128} flip lift={s.second < 1 ? Math.abs(Math.sin(s.second * 22)) * 4 : 0} />
            )}

            {/* the walker's own sheet: he starts to draw the stretch he could not follow */}
            {s.sheet > 0 && (
              <g opacity={s.sheet}>
                <line x1={easel.x + 10} y1={easel.y + easel.h} x2={easel.x + 2} y2={STOP[1] + 2} stroke={alpha(C.muted, 0.9)} strokeWidth={4} strokeLinecap="round" />
                <line x1={easel.x + easel.w - 10} y1={easel.y + easel.h} x2={easel.x + easel.w - 2} y2={STOP[1] + 2} stroke={alpha(C.muted, 0.9)} strokeWidth={4} strokeLinecap="round" />
                <rect x={easel.x} y={easel.y} width={easel.w} height={easel.h} rx={4} fill={C.text} stroke={C.accent} strokeWidth={3} />
                <path d={d(STEEP.map(mini))} fill="none" stroke={alpha(C.bg0, 0.22)} strokeWidth={2} strokeDasharray="2 4" />
                <path d={d(slice(STEEP, 0, s.sketch).map(mini))} fill="none" stroke={C.accent} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
                {s.sketch > 0 && <line x1={w.x - 12} y1={w.y - 30} x2={mini([sketchTip.x, sketchTip.y])[0]} y2={mini([sketchTip.x, sketchTip.y])[1]} stroke={C.accent2} strokeWidth={3} strokeLinecap="round" />}
              </g>
            )}

            {/* the walker */}
            {(() => {
              const pose: CastName = s.sheet > 0.3 ? 'walker-draw' : s.light > 0.2 ? 'walker-stop' : s.pick > 0.02 && s.unfold < 0.05 ? 'walker-pick' : 'walker';
              const walking = pose === 'walker';
              return <Fig src={pose} x={w.x} y={w.y} h={pose === 'walker-draw' ? 104 : pose === 'walker-pick' ? 112 : 124} flip={walking && w.dir < 0} rot={walking ? step * 2 * w.dir : 0} lift={walking ? Math.abs(step) * 3 : 0} />;
            })()}

            {/* the light: the model */}
            {s.light > 0 && (
              <g opacity={s.light}>
                <circle cx={s.lightAt.x} cy={s.lightAt.y} r={44 * flicker} fill="url(#tr-light)" opacity={0.85} />
                <Fig src="robot-climb" x={s.lightAt.x - 8} y={s.lightAt.y + 36} h={92} shadow={false} />
              </g>
            )}
          </g>
        </g>
      </Canvas>
      {p.vertical && (
        <>
          {s.news > 0 && (
            <img
              src={staticFile('cast/newspapers.png')}
              style={{ position: 'absolute', left: 140, top: 330, width: 800, opacity: s.news, transform: `scale(${0.85 + 0.15 * s.news}) rotate(${-4 + 4 * s.news}deg)`, filter: 'drop-shadow(0 18px 30px rgba(0,0,0,0.55))' }}
            />
          )}
          {s.taste > 0 && (
            <div style={{ position: 'absolute', left: 0, right: 0, top: 262, textAlign: 'center', opacity: s.taste, transform: `scale(${0.9 + 0.1 * s.taste})`, fontFamily, fontSize: 150, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, ...gradientText }}>
              taste
            </div>
          )}
          <Card left={84} top={935} opacity={s.quote}>
            “out of my element”
            <div style={{ fontSize: 26, fontWeight: 500, color: C.muted, marginTop: 2 }}>his own words</div>
          </Card>
          <Card left={775} top={610} opacity={s.years} size={38}>
            twelve years
            <div>no AI</div>
          </Card>
          <Card left={400} top={1196} opacity={s.here} size={56} strong>
            “we are still here.”
          </Card>
          <Card left={800} top={292} opacity={s.mapTag} size={30}>
            public map
            <div style={{ fontSize: 24, fontWeight: 500, color: C.muted }}>drawn with AI</div>
          </Card>
        </>
      )}
    </>
  );
};
