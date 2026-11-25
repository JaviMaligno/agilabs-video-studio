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
  FIRST_L,
  FORK_L,
  PAINT,
  PAST_L,
  SIDE_L,
  STEEP_L,
  STOPS,
  STOP_L,
  SUMMIT_L,
  onRouteL,
  frameState,
  pointAt,
  slice,
  smooth,
  type Pt,
  type TrailProps,
  type TrailState,
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

/** The vertical cut (the approved short's drawing, unchanged). */
const TrailVertical: React.FC<AnimProps & TrailProps> = (p) => {
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
                  stroke={charted ? alpha(C.text, 0.5) : lit ? alpha(C.accentText, 0.8) : 'none'}
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

// ══ Landscape (1920x1080): the same story on the landscape painting, in its pixels ══════════════
// The camera frames a 16:9 window of the painting (see Trail.state.ts, PAINT): at lz = 1 its width
// fills the frame. Above and below the painting the sky and the ground carry on in its own colours.
const SKY = '#0b144d';
const GROUND = '#0f1751';
const FW = 1920;
const FH = 1080;
/** Where on-screen cards may sit: inside the stage, clear of the captions. */
const BOX = { x0: 170, x1: 1750, y0: 150, y1: 820 };

const camL = (s: TrailState) => {
  const z = Math.max(1, s.lz);
  const k = 1.25 * z;
  const half = PAINT.w / 2 / z;
  const cx = Math.min(PAINT.w - half, Math.max(half, s.lx));
  return { k, z, cx, cy: s.ly };
};

/** Left flank of the painted mountain, summit down. */
const FLANK: Pt[] = [[1268, 82], [1100, 300], [950, 450], [850, 500], [700, 590], [560, 690]];
const flankX = (y: number): number => {
  for (let i = 1; i < FLANK.length; i++) {
    const [x0, y0] = FLANK[i - 1];
    const [x1, y1] = FLANK[i];
    if (y <= y1) return x0 + ((x1 - x0) * (y - y0)) / (y1 - y0);
  }
  return FLANK[FLANK.length - 1][0];
};

// Sheets of the mountain: lit where the light passed, charted under the map, all lit when rebuilt.
const TL = { w: 34, h: 15, gap: 5 };
type TileL = { x: number; y: number; near: number; dist: number };
const STEEP_L_SAMPLES = Array.from({ length: 81 }, (_, i) => ({ f: i / 80, ...pointAt(STEEP_L, i / 80) }));
const TILES_L: TileL[] = (() => {
  const out: TileL[] = [];
  for (let y = 100; y <= 640; y += TL.h + 7) {
    const left = flankX(y + TL.h) + 14;
    const right = Math.min(PAINT.w - 10, SUMMIT_L[0] + (y - SUMMIT_L[1]) * 0.95);
    for (let x = left; x + TL.w <= right; x += TL.w + TL.gap) {
      let best = { f: 0, dist: Infinity };
      for (const p of STEEP_L_SAMPLES) {
        const dd = Math.hypot(p.x - (x + TL.w / 2), p.y - (y + TL.h / 2));
        if (dd < best.dist) best = { f: p.f, dist: dd };
      }
      out.push({ x, y, near: best.f, dist: best.dist });
    }
  }
  return out;
})();
const routeBelowL = (y: number): number => {
  let f = 0;
  for (const p of STEEP_L_SAMPLES) {
    if (p.y < y) break;
    f = p.f;
  }
  return f;
};

const DEAD_ENDS_L: { from: number; path: Pt[] }[] = [
  { from: 0.2, path: smooth([[262, 660], [232, 694], [150, 712]], 8) },
  { from: 0.5, path: smooth([[380, 644], [352, 618], [282, 600]], 8) },
  { from: 0.76, path: smooth([[470, 660], [505, 694], [585, 712]], 8) },
];
const TICKS_L = [0.08, 0.2, 0.32, 0.44, 0.56, 0.68, 0.8].map((f) => ({ f, ...pointAt(PAST_L, f), next: pointAt(PAST_L, f + 0.01) }));
const NEW_FORKS_L: Pt[][] = [
  smooth([[262, 660], [200, 628], [120, 612], [20, 606]], 8),
  smooth([FORK_L, [660, 668], [790, 650], [900, 612], [1010, 580]], 8),
  smooth([[1010, 580], [1080, 510], [1150, 452], [1250, 410]], 8),
  smooth([[985, 370], [1060, 392], [1150, 350], [1240, 300]], 8),
  smooth([[900, 612], [1080, 628], [1260, 610], [1440, 560]], 8),
];
const CROWD_L: { to: Pt; from: Pt }[] = (
  [
    [[95, 650], [-40, 650]], [[700, 604], [820, 790]], [[170, 640], [-40, 630]], [[790, 566], [900, 770]],
    [[228, 662], [-40, 690]], [[835, 548], [1000, 760]], [[420, 652], [420, 790]], [[880, 522], [1100, 740]],
    [[505, 664], [505, 790]], [[612, 676], [640, 800]], [[150, 664], [-40, 710]], [[665, 640], [760, 790]],
    [[460, 640], [380, 790]], [[740, 610], [860, 800]],
  ] as [Pt, Pt][]
).map(([to, from]) => ({ to, from }));
const STARS = Array.from({ length: 26 }, (_, i) => ({ x: 30 + hash(i + 900) * 1100, y: 20 + hash(i + 950) * 330, r: 1.2 + hash(i + 990) * 1.8, ph: hash(i + 1030) * 6.28 }));
const MIST = [
  { x: 880, y: 470, rx: 260, ry: 34, sp: 0.05, ph: 0 },
  { x: 1150, y: 300, rx: 210, ry: 28, sp: 0.04, ph: 2 },
  { x: 420, y: 690, rx: 340, ry: 30, sp: 0.03, ph: 4 },
];

/** A card on the frame: `at` is its anchor in frame pixels; it is kept inside BOX. */
const Tag: React.FC<{ x: number; y: number; opacity: number; strong?: boolean; align?: 'left' | 'right'; w?: number; h?: number; children: React.ReactNode }> = ({ x, y, opacity, strong, align = 'left', w = 520, h = 140, children }) => {
  if (opacity <= 0) return null;
  const left = Math.min(BOX.x1 - w, Math.max(BOX.x0, align === 'left' ? x : x - w));
  const top = Math.min(BOX.y1 - h, Math.max(BOX.y0, y));
  return (
    <div style={{ position: 'absolute', left, top, width: w, display: 'flex', justifyContent: align === 'left' ? 'flex-start' : 'flex-end', opacity, transform: `translateY(${(1 - opacity) * 14}px)` }}>
      <div
        style={{
          padding: strong ? '18px 34px' : '14px 28px',
          borderRadius: 22,
          background: alpha(C.card, 0.94),
          border: `2px solid ${alpha(strong ? C.accent2 : C.accent, strong ? 0.75 : 0.45)}`,
          boxShadow: `0 14px 40px ${alpha('#000000', 0.5)}`,
          fontFamily,
          fontSize: 44,
          fontWeight: 700,
          lineHeight: 1.18,
          color: C.text,
          whiteSpace: 'nowrap',
        }}
      >
        {children}
      </div>
    </div>
  );
};
const Sub: React.FC<{ children: React.ReactNode }> = ({ children }) => <div style={{ fontSize: 40, fontWeight: 500, color: C.muted, marginTop: 4 }}>{children}</div>;

/** The idea, as a small glowing blackboard sketch: prime blocks filling a box, and the square root. */
const Board: React.FC<{ x: number; y: number; o: number; T: number }> = ({ x, y, o, T }) =>
  o <= 0 ? null : (
    <g opacity={o} transform={`translate(${x} ${y + 1.5 * Math.sin(T * 1.1)})`}>
      <circle cx={55} cy={38} r={92 + 6 * Math.sin(T * 1.7)} fill="url(#tl-light)" opacity={0.45} />
      <line x1={30} y1={76} x2={22} y2={104} stroke={alpha(C.muted, 0.9)} strokeWidth={3} strokeLinecap="round" />
      <line x1={80} y1={76} x2={88} y2={104} stroke={alpha(C.muted, 0.9)} strokeWidth={3} strokeLinecap="round" />
      <rect x={0} y={0} width={110} height={76} rx={6} fill="#14211f" stroke={alpha(C.accentText, 0.9)} strokeWidth={3} />
      <rect x={10} y={12} width={52} height={30} rx={2} fill="none" stroke={alpha(C.text, 0.85)} strokeWidth={2} strokeDasharray="5 3" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={13 + i * 12} y={26} width={10} height={13} rx={1.5} fill={alpha(C.text, 0.75)} />
      ))}
      <text x={70} y={40} fontSize={22} fontWeight={700} fill={C.text} fontFamily={fontFamily}>√x</text>
      <path d="M12 62 Q30 48 46 60 T80 58 T100 54" fill="none" stroke={alpha(C.accentText, 0.95)} strokeWidth={2.5} strokeLinecap="round" />
    </g>
  );

const TrailLandscape: React.FC<AnimProps & TrailProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const c = camL(s);
  const P = (x: number, y: number) => ({ x: (x - c.cx) * c.k + FW / 2, y: (y - c.cy) * c.k + FH / 2 });
  const sw = 1 / Math.sqrt(c.z);
  const w = s.walkerL;
  const step = Math.sin(s.stride * Math.PI * 2);
  const frontY = STOP_L[1] - s.map * (STOP_L[1] - SUMMIT_L[1]);
  const mapped = routeBelowL(frontY);
  const flicker = 0.85 + 0.15 * Math.sin(s.T * 9) * Math.sin(s.T * 2.3);
  const hand = { x: w.x + 12 * w.dir, y: w.y - 20 };
  const pileAt = { x: FORK_L[0] + 52, y: FORK_L[1] + 16 };
  const sheet = {
    x: pileAt.x + (hand.x - pileAt.x) * s.pick + (FORK_L[0] - 20 - hand.x) * s.unfold,
    y: pileAt.y - 3 + (hand.y - (pileAt.y - 3)) * s.pick + (FORK_L[1] - 16 - hand.y) * s.unfold,
    w: 30 + (12 - 30) * s.pick,
    h: 4 + (15 - 4) * s.pick,
  };
  const easel = { x: STOP_L[0] - 104, y: STOP_L[1] - 66, w: 46, h: 60 };
  const mini = (pt: Pt): Pt => [easel.x + 6 + ((pt[0] - STOP_L[0]) / (SUMMIT_L[0] - STOP_L[0])) * (easel.w - 12), easel.y + easel.h - 6 + ((pt[1] - STOP_L[1]) / (STOP_L[1] - SUMMIT_L[1])) * (easel.h - 12)];
  const sketchTip = pointAt(STEEP_L, s.sketch);
  const routeAll = [...PAST_L, ...FIRST_L.slice(1), ...STEEP_L.slice(1)];
  const alive = s.alive;
  const hop = (i: number) => alive * Math.max(0, Math.sin(s.T * 6 + i * 1.3)) * 9;
  const sec = s.secondAtL;
  const notesAt = { x: sec.x - 2, y: sec.y - 56 };
  const rebuiltY = SUMMIT_L[1] + s.rebuilt * (650 - SUMMIT_L[1]);
  const wP = P(w.x, w.y);
  const lightP = P(s.lightAtL.x, s.lightAtL.y);
  const secP = P(sec.x, sec.y);
  return (
    <>
      <svg width={FW} height={FH} viewBox={`0 0 ${FW} ${FH}`} style={{ position: 'absolute', left: 0, top: 0, fontFamily }}>
        <defs>
          <radialGradient id="tl-light">
            <stop offset="0" stopColor={C.text} stopOpacity="1" />
            <stop offset="0.25" stopColor={C.accentText} stopOpacity="0.9" />
            <stop offset="1" stopColor={C.accentText} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="tl-top" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={SKY} stopOpacity="1" />
            <stop offset="1" stopColor={SKY} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="tl-bottom" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={GROUND} stopOpacity="0" />
            <stop offset="1" stopColor={GROUND} stopOpacity="1" />
          </linearGradient>
          <filter id="tl-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="12" />
          </filter>
          <filter id="tl-haze" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="70" />
          </filter>
        </defs>
        <rect x={0} y={0} width={FW} height={FH} fill={SKY} />
        <g transform={`translate(${FW / 2} ${FH / 2}) scale(${c.k}) translate(${-c.cx} ${-c.cy})`}>
          {/* the painting, its top and bottom carried on in the sky's and the ground's colours */}
          <rect x={-200} y={PAINT.h - 2} width={PAINT.w + 400} height={900} fill={GROUND} />
          <image href={staticFile('bg/bg-mountain-l.jpg')} x={0} y={0} width={PAINT.w} height={PAINT.h} preserveAspectRatio="none" />
          <rect x={-200} y={0} width={PAINT.w + 400} height={40} fill="url(#tl-top)" />
          <rect x={-200} y={PAINT.h - 60} width={PAINT.w + 400} height={60} fill="url(#tl-bottom)" />
          {STARS.map((st, i) => (
            <circle key={i} cx={st.x} cy={st.y} r={st.r} fill={C.text} opacity={0.25 + 0.5 * (0.5 + 0.5 * Math.sin(s.T * 1.6 + st.ph))} />
          ))}
          {MIST.map((m, i) => (
            <ellipse key={i} cx={m.x + 40 * Math.sin(s.T * m.sp + m.ph)} cy={m.y + 4 * Math.sin(s.T * 0.3 + m.ph)} rx={m.rx} ry={m.ry} fill={alpha(C.accent2, 0.16)} filter="url(#tl-blur)" />
          ))}

          {/* the last beat: the whole mountain breathing with light */}
          {alive > 0 && <ellipse cx={1150} cy={360} rx={420} ry={330} fill={alpha(C.accent2, 0.3 * alive * (0.75 + 0.25 * Math.sin(s.T * 2.4)))} filter="url(#tl-haze)" />}
          {alive > 0 && <circle cx={SUMMIT_L[0]} cy={SUMMIT_L[1]} r={140 + 20 * Math.sin(s.T * 2.4)} fill="url(#tl-light)" opacity={0.55 * alive} />}
          {/* sheets of the mountain */}
          {TILES_L.map((tl, i) => {
            const lit = s.run > 0 && tl.dist < 30 && s.run >= tl.near;
            const charted = s.map > 0 && tl.dist < 70 && tl.y + TL.h / 2 > frontY;
            const rb = clamp01((rebuiltY - tl.y) / 60) * (s.rebuilt > 0 ? 1 : 0);
            const glowAll = rb * 0.7;
            if (!lit && !charted && glowAll <= 0.01) return null;
            return (
              <rect
                key={i}
                x={tl.x}
                y={tl.y}
                width={TL.w}
                height={TL.h}
                rx={3}
                fill={charted ? alpha(C.accent2, 0.32) : lit ? alpha(C.accentText, 0.28) : alpha(C.accentText, 0.32 * glowAll)}
                stroke={charted ? alpha(C.text, 0.5) : lit ? alpha(C.text, 0.55) : alpha(C.text, 0.55 * glowAll)}
                strokeWidth={1.3}
              />
            );
          })}

          {/* overview: the whole route ahead and the eight chapter stops */}
          {s.route > 0 && <path d={d(routeAll)} fill="none" stroke={alpha(C.text, 0.55 * s.route)} strokeWidth={3.4} strokeDasharray="3 9" strokeLinecap="round" />}
          {s.route > 0 &&
            STOPS.map((f, i) => {
              const at = onRouteL(f);
              const on = clamp01(s.stopsLit - i);
              const pulse = on > 0 ? 1 + 0.06 * Math.sin(s.T * 3 + i) : 1;
              return (
                <g key={i} opacity={s.route} transform={`translate(${at.x} ${at.y}) scale(${pulse})`}>
                  {on > 0 && <circle r={46} fill="url(#tl-light)" opacity={0.6 * on} />}
                  <circle r={23} fill={on > 0.5 ? C.accent : alpha(C.card, 0.92)} stroke={on > 0 ? C.text : alpha(C.muted, 0.8)} strokeWidth={3} />
                  <text y={11} textAnchor="middle" fontSize={32} fontWeight={800} fill={on > 0.5 ? C.text : C.muted}>{i + 1}</text>
                </g>
              );
            })}

          {/* forks he did not take, and the years behind him */}
          {DEAD_ENDS_L.map((b, i) => (
            <path key={i} d={d(slice(b.path, 0, clamp01(s.marks * 1.4 - i * 0.2)))} fill="none" stroke={alpha(C.muted, s.pos >= b.from ? 0.6 : 0)} strokeWidth={2.6 * sw * 1.4} strokeDasharray="3 6" strokeLinecap="round" />
          ))}
          <TrailL pts={slice(PAST_L, 0, Math.min(1, s.pos))} w={4 * sw * 1.4} />
          {TICKS_L.map((tk, i) => {
            const on = s.pos >= tk.f ? clamp01(s.marks * 2 - i * 0.14) : 0;
            const nx = -(tk.next.y - tk.y);
            const ny = tk.next.x - tk.x;
            const n = Math.hypot(nx, ny) || 1;
            const len = 9 + 5 * s.career;
            return (
              <g key={i}>
                {s.career > 0 && <circle cx={tk.x} cy={tk.y} r={16} fill="url(#tl-light)" opacity={0.7 * s.career * on} />}
                <line x1={tk.x - (nx / n) * len} y1={tk.y - (ny / n) * len} x2={tk.x + (nx / n) * len} y2={tk.y + (ny / n) * len} stroke={alpha(s.career > 0.5 ? C.text : C.accentText, on)} strokeWidth={2.6 + 1.6 * s.career} strokeLinecap="round" />
              </g>
            );
          })}

          {/* the sheet, unfolded into the next stretch, glowing when it is called taste; then walked */}
          {s.chosen > 0 && <path d={d(slice(FIRST_L, 0, Math.max(0.05, s.unfold)))} fill="none" stroke={alpha(C.accent2, 0.95 * s.chosen * (0.8 + 0.2 * Math.sin(s.T * 3)))} strokeWidth={34} strokeLinecap="round" filter="url(#tl-blur)" />}
          {s.chosen > 0 && <path d={d(slice(FIRST_L, 0, Math.max(0.05, s.unfold)))} fill="none" stroke={alpha(C.text, 0.9 * s.chosen)} strokeWidth={7} strokeLinecap="round" />}
          {s.unfold > 0 && <path d={d(slice(FIRST_L, 0, s.unfold))} fill="none" stroke={alpha(C.accent, 0.7)} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />}
          {s.unfold > 0 && <path d={d(slice(FIRST_L, 0, s.unfold))} fill="none" stroke={C.text} strokeWidth={3.2} strokeDasharray="2 7" strokeLinecap="round" />}
          <TrailL pts={slice(FIRST_L, 0, s.pos - 1)} w={4 * sw * 1.4} />

          {/* the steep stretch: a hint, the light's wake, and what has been mapped */}
          {s.steep > 0 && <path d={d(STEEP_L)} fill="none" stroke={alpha(C.text, 0.6 * s.steep)} strokeWidth={3} strokeDasharray="2 8" strokeLinecap="round" />}
          {s.run > 0 && <path d={d(slice(STEEP_L, 0, s.run))} fill="none" stroke={alpha(C.accentText, 0.95)} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" />}
          {s.map > 0 && (
            <>
              <TrailL pts={slice(STEEP_L, 0, mapped)} glow={C.accent2} w={4.4} />
              {[0.12, 0.26, 0.4, 0.54, 0.68, 0.8].filter((f) => f <= mapped).map((f) => {
                const pt = pointAt(STEEP_L, f);
                return <circle key={f} cx={pt.x} cy={pt.y} r={6} fill={C.bg0} stroke={C.text} strokeWidth={2.6} />;
              })}
              <line x1={flankX(frontY) - 30} y1={frontY} x2={Math.min(PAINT.w, SUMMIT_L[0] + (frontY - SUMMIT_L[1]) * 0.95)} y2={frontY} stroke={alpha(C.text, 0.85)} strokeWidth={2.4} strokeDasharray="8 6" />
            </>
          )}

          {/* new forks, with people on them; the far ends still open */}
          {s.forks > 0 &&
            NEW_FORKS_L.map((path, i) => {
              const prog = clamp01(s.forks * 1.4 - i * 0.08);
              const at = pointAt(path, prog);
              const end = path[path.length - 1];
              const q = clamp01((s.forks - 0.75) * 4);
              return (
                <g key={i}>
                  <TrailL pts={slice(path, 0, prog)} w={3.6} glow={C.accent} />
                  {prog > 0.02 && <Fig src={`mapper-${((i + 2) % 5) + 1}` as CastName} x={at.x} y={at.y} h={34} flip={at.dir < 0} lift={Math.abs(Math.sin(prog * 40)) * 2 + hop(i + 20)} />}
                  {q > 0 && (
                    <g opacity={q} transform={`translate(${end[0]} ${end[1] - 34})`}>
                      <circle r={32} fill="url(#tl-light)" opacity={0.6 + 0.2 * Math.sin(s.T * 3 + i)} />
                      <circle r={17} fill={C.accent} stroke={C.text} strokeWidth={2.5} />
                      <text y={11} textAnchor="middle" fontSize={30} fontWeight={800} fill={C.text}>?</text>
                    </g>
                  )}
                </g>
              );
            })}

          {/* the pile a rival lab had released */}
          {s.pile > 0 && (
            <g opacity={s.pile} transform={`translate(0 ${(1 - s.pile) * 6})`}>
              <Fig src="paper-pile" x={pileAt.x} y={pileAt.y + 6} h={58} />
            </g>
          )}
          {s.pile > 0 && s.unfold < 1 && (
            <g opacity={s.pile * (1 - s.unfold)}>
              {s.glow > 0 && <circle cx={sheet.x} cy={sheet.y} r={16 + 3 * Math.sin(s.T * 5)} fill="url(#tl-light)" opacity={0.8 * s.glow} />}
              <rect x={sheet.x - sheet.w / 2} y={sheet.y - sheet.h / 2} width={sheet.w} height={sheet.h} rx={1.5} fill={s.glow > 0.5 ? C.text : alpha(C.text, 0.6)} stroke={alpha(C.accentText, s.glow)} strokeWidth={1.5} />
            </g>
          )}

          {/* the second figure's own way in, along the far ridge */}
          {s.second > 0 && <path d={d(slice(SIDE_L, 0, s.second))} fill="none" stroke={alpha(C.accent2, 0.75)} strokeWidth={3} strokeDasharray="4 6" strokeLinecap="round" />}

          {/* the crowd */}
          {s.crowd > 0 &&
            CROWD_L.map((cr, i) => {
              const prog = clamp01((s.crowd - i * 0.04) / 0.44);
              if (prog <= 0) return null;
              const e = 1 - (1 - prog) ** 3;
              const x = cr.from[0] + (cr.to[0] - cr.from[0]) * e;
              const y = cr.from[1] + (cr.to[1] - cr.from[1]) * e;
              const idle = prog >= 1 ? Math.max(0, Math.sin(s.T * 3 + i * 1.7)) * 1.5 : Math.abs(Math.sin(prog * 14)) * 2.5;
              return <Fig key={i} src={`mapper-${(i % 5) + 1}` as CastName} x={x} y={y} h={50} flip={cr.to[0] < cr.from[0]} lift={idle + hop(i)} />;
            })}

          {/* the second figure, with twelve years of manuscript; then the notes on it */}
          {s.second > 0 && (
            <Fig src="second-math" x={sec.x} y={sec.y} h={86} lift={s.second < 1 ? Math.abs(Math.sin(s.second * 22)) * 2.5 : Math.max(0, Math.sin(s.T * 1.4)) * 0.8 + hop(40)} />
          )}
          {s.notes > 0 &&
            [[-7, -6, -8], [6, -3, 7], [-3, 4, -4], [8, 7, 10], [-9, 9, 5]].map(([dx, dy, rot], i) => {
              const land = clamp01(s.notes * 5 - i);
              if (land <= 0) return null;
              const e = 1 - (1 - land) ** 3;
              return (
                <g key={i} opacity={Math.min(1, land * 3)} transform={`translate(${notesAt.x + dx} ${notesAt.y + dy - (1 - e) * 26}) rotate(${rot * (2 - e)})`}>
                  <rect x={-5} y={-5} width={10} height={10} rx={1} fill={C.text} stroke={alpha(C.bg0, 0.4)} strokeWidth={0.5} />
                  <rect x={-5} y={-5} width={10} height={2.6} fill={C.accent2} />
                  <path d="M-3 0.5 L3 0.5 M-3 2.8 L1.5 2.8" stroke={alpha(C.bg0, 0.6)} strokeWidth={0.8} />
                </g>
              );
            })}

          {/* the walker's own sheet: he starts to draw the stretch he could not follow */}
          {s.sheet > 0 && (
            <g opacity={s.sheet}>
              <line x1={easel.x + 7} y1={easel.y + easel.h} x2={easel.x + 2} y2={STOP_L[1] + 2} stroke={alpha(C.muted, 0.9)} strokeWidth={2.4} strokeLinecap="round" />
              <line x1={easel.x + easel.w - 7} y1={easel.y + easel.h} x2={easel.x + easel.w - 2} y2={STOP_L[1] + 2} stroke={alpha(C.muted, 0.9)} strokeWidth={2.4} strokeLinecap="round" />
              {s.chosen > 0 && <rect x={easel.x - 8} y={easel.y - 8} width={easel.w + 16} height={easel.h + 16} rx={8} fill={alpha(C.accent2, 0.35 * s.chosen)} filter="url(#tl-blur)" />}
              <rect x={easel.x} y={easel.y} width={easel.w} height={easel.h} rx={3} fill={C.text} stroke={C.accent} strokeWidth={2} />
              <path d={d(STEEP_L.map(mini))} fill="none" stroke={alpha(C.bg0, 0.25)} strokeWidth={1.2} strokeDasharray="1.5 3" />
              <path d={d(slice(STEEP_L, 0, s.sketch).map(mini))} fill="none" stroke={C.accent} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
              {s.sketch > 0 && <line x1={w.x - 8} y1={w.y - 22} x2={mini([sketchTip.x, sketchTip.y])[0]} y2={mini([sketchTip.x, sketchTip.y])[1]} stroke={C.accent2} strokeWidth={1.8} strokeLinecap="round" />}
            </g>
          )}

          {/* the walker */}
          {s.walkerIn > 0 &&
            (() => {
              const pose: CastName = s.sheet > 0.3 ? 'walker-draw' : s.light > 0.2 ? 'walker-stop' : s.pick > 0.02 && s.unfold < 0.05 ? 'walker-pick' : 'walker';
              const walking = pose === 'walker';
              return (
                <Fig
                  src={pose}
                  x={w.x}
                  y={w.y + (1 - s.walkerIn) * 10}
                  opacity={s.walkerIn}
                  h={pose === 'walker-draw' ? 66 : pose === 'walker-pick' ? 72 : 80}
                  flip={walking && w.dir < 0}
                  rot={walking ? step * 2 * w.dir : 0}
                  lift={(walking ? Math.abs(step) * 2 : 0) + hop(50)}
                />
              );
            })()}

          {/* the light: the model; the idea's blackboard on the summit */}
          <Board x={SUMMIT_L[0] + 26} y={SUMMIT_L[1] - 6} o={s.board} T={s.T} />
          {s.light > 0 && (
            <g opacity={s.light}>
              <circle cx={s.lightAtL.x} cy={s.lightAtL.y - 18} r={30 * flicker} fill="url(#tl-light)" opacity={0.85} />
              <Fig src="robot-climb" x={s.lightAtL.x - 4} y={s.lightAtL.y + 8} h={60} shadow={false} lift={Math.sin(s.T * 2.2) * 1.2} />
            </g>
          )}
        </g>
      </svg>

      {/* on-screen words, in frame pixels */}
      {s.news > 0 && (
        <img
          src={staticFile('cast/newspapers.png')}
          style={{ position: 'absolute', left: 230, top: 150, width: 800, opacity: s.news, transform: `scale(${0.85 + 0.15 * s.news}) rotate(${-4 + 4 * s.news}deg)`, filter: 'drop-shadow(0 18px 30px rgba(0,0,0,0.55))' }}
        />
      )}
      {s.taste > 0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 168, textAlign: 'center', opacity: s.taste, transform: `scale(${0.9 + 0.1 * s.taste})`, fontFamily, fontSize: 170, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, ...gradientText }}>
          taste
        </div>
      )}
      <Tag x={P(pileAt.x, pileAt.y).x + 70} y={P(pileAt.x, pileAt.y).y - 330} opacity={s.pileTag} w={560} h={150}>
        OpenAI · October
        <Sub>machine-written papers</Sub>
      </Tag>
      <Tag x={200} y={180} opacity={s.trick} w={640} h={150}>
        Stepanov’s trick · 1969
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 40, fontWeight: 500, color: C.muted, marginTop: 4 }}>
          <span style={{ display: 'inline-block', width: 34, height: 34, borderRadius: 6, border: `3px dashed ${C.accentText}` }} />
          one ingredient missing
        </div>
      </Tag>
      <Tag x={wP.x - 110} y={wP.y - 300} opacity={s.quote} align="right" w={600} h={150}>
        “out of my element”
        <Sub>his own words</Sub>
      </Tag>
      <Tag x={lightP.x - 90} y={lightP.y - 40} opacity={s.lock} align="right" w={560} h={150}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 16 }}>
          <svg width={34} height={40} viewBox="0 0 34 40">
            <rect x={3} y={17} width={28} height={21} rx={4} fill={C.accentText} />
            <path d="M9 17 V11 a8 8 0 0 1 16 0 V17" fill="none" stroke={C.accentText} strokeWidth={4} />
          </svg>
          internal model
        </span>
        <Sub>you can’t run it</Sub>
      </Tag>
      <Tag x={secP.x + 90} y={secP.y - 240} opacity={s.years} w={520} h={150}>
        <span style={{ fontSize: 52, fontWeight: 800 }}>twelve years</span>
        <Sub>all human · no AI</Sub>
      </Tag>
      {s.here > 0 && (
        <div style={{ position: 'absolute', left: Math.max(560, secP.x + 200), top: 160, right: 170, opacity: s.here, transform: `translateY(${(1 - s.here) * 16}px)`, fontFamily }}>
          <div style={{ padding: '30px 44px', borderRadius: 26, background: alpha(C.card, 0.9), border: `2px solid ${alpha(C.accent2, 0.75)}`, boxShadow: `0 18px 50px ${alpha('#000000', 0.5)}` }}>
            <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.12, color: C.text }}>“We are still here.</div>
            <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.12, ...gradientText }}>We are very much alive.”</div>
            <div style={{ fontSize: 40, fontWeight: 500, color: C.muted, marginTop: 14 }}>Alessandro Masullo</div>
          </div>
        </div>
      )}
      {s.stamp > 0 && (
        <div
          style={{
            position: 'absolute',
            left: Math.min(BOX.x1 - 560, secP.x + 120),
            top: Math.max(BOX.y0, secP.y - 330),
            opacity: Math.min(1, s.stamp * 2),
            transform: `rotate(-9deg) scale(${1.5 - 0.5 * s.stamp})`,
            padding: '14px 30px',
            border: `6px solid ${C.accent2}`,
            borderRadius: 14,
            color: C.text,
            background: alpha(C.accent2, 0.22),
            fontFamily,
            fontSize: 64,
            fontWeight: 800,
            letterSpacing: '0.06em',
            whiteSpace: 'nowrap',
          }}
        >
          MAJOR REVISION
        </div>
      )}
      {s.linesTag > 0 && (
        <div style={{ position: 'absolute', left: 200, top: 240, opacity: s.linesTag, transform: `translateY(${(1 - s.linesTag) * 16}px)`, fontFamily }}>
          <div style={{ fontSize: 120, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em', ...gradientText }}>17.4 million</div>
          <div style={{ fontSize: 56, fontWeight: 700, color: C.text, marginTop: 10 }}>lines of Lean</div>
        </div>
      )}
      <Tag x={200} y={180} opacity={s.mapTag} w={560} h={150}>
        public map
        <Sub>drawn with AI</Sub>
      </Tag>
      {s.cutOn > 0 && (
        <div style={{ position: 'absolute', left: 200, top: 370, opacity: s.cutOn * (1 - 0.3 * s.dim), transform: `translateY(${(1 - s.cutOn) * 16}px)`, fontFamily }}>
          <div style={{ padding: '20px 34px', borderRadius: 22, background: alpha(C.card, 0.94), border: `2px solid ${alpha(C.accent, 0.5)}`, boxShadow: `0 14px 40px ${alpha('#000000', 0.5)}` }}>
            <div style={{ fontSize: 40, fontWeight: 600, color: C.muted }}>core of the proof</div>
            <div style={{ fontSize: 110, fontWeight: 800, lineHeight: 1.05, fontVariantNumeric: 'tabular-nums', ...gradientText }}>{s.cutText}</div>
            {s.dim > 0 && <div style={{ fontSize: 40, fontWeight: 500, color: C.muted, opacity: s.dim }}>mostly housekeeping</div>}
          </div>
        </div>
      )}
    </>
  );
};

const TrailL: React.FC<{ pts: Pt[]; colour?: string; w?: number; glow?: string }> = ({ pts, colour = C.text, w = 4, glow = C.accent }) =>
  pts.length < 2 ? null : (
    <>
      <path d={d(pts)} fill="none" stroke={alpha(glow, 0.4)} strokeWidth={w + 6} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d(pts)} fill="none" stroke={colour} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
    </>
  );

/** The trail (see Trail.state.ts): a metaphor for who did what, not footage of anything. */
export const Trail: React.FC<AnimProps & TrailProps> = (p) => (p.vertical ? <TrailVertical {...p} /> : <TrailLandscape {...p} />);
