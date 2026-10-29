import React from 'react';
import { Img, staticFile } from 'remotion';
import { C, GRADIENT, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { frameState, type GapProps, type GapState } from './GapMap.state.ts';
import { gradientText, stageOf } from './Stage.tsx';

export { frameState };
export type { GapProps };

const img = (name: string) => staticFile(`cast/${name}.png`);
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** Deterministic pseudo-random numbers, so every frame draws the same map. */
const rand = (seed: number) => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/** A blob of `n` dots around (cx, cy). */
const blob = (n: number, cx: number, cy: number, rx: number, ry: number, seed = 1) =>
  Array.from({ length: n }, (_, i) => {
    const a = rand(seed + i * 3.1) * Math.PI * 2;
    const r = Math.sqrt(rand(seed + i * 7.7));
    return { x: cx + Math.cos(a) * r * rx, y: cy + Math.sin(a) * r * ry, s: 5 + rand(seed + i) * 5 };
  });

const Star: React.FC<{ x: number; y: number; r?: number; opacity?: number; pulse?: number }> = ({ x, y, r = 34, opacity = 1, pulse = 0 }) => {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const rr = i % 2 === 0 ? r : r * 0.45;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    return `${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)}`;
  }).join(' ');
  return (
    <svg width={r * 5} height={r * 5} viewBox={`${-r * 2.5} ${-r * 2.5} ${r * 5} ${r * 5}`} style={{ position: 'absolute', left: x - r * 2.5, top: y - r * 2.5, opacity, overflow: 'visible' }}>
      <circle r={r * (1.7 + 0.15 * pulse)} fill="none" stroke={alpha(C.accentText, 0.45)} strokeWidth={3} strokeDasharray="8 8" />
      <polygon points={pts} fill="#fbbf24" stroke="#fde68a" strokeWidth={2} />
    </svg>
  );
};

const Dots: React.FC<{ dots: { x: number; y: number; s: number }[]; opacity: number; color?: string }> = ({ dots, opacity, color = C.accentText }) => (
  <svg width={936} height={1000} style={{ position: 'absolute', left: 0, top: 0, opacity, overflow: 'visible' }}>
    {dots.map((d, i) => (
      <circle key={i} cx={d.x} cy={d.y} r={d.s} fill={alpha(i % 4 === 0 ? C.accent2 : color, 0.85)} />
    ))}
  </svg>
);

/** A rounded card holding a drawing (or a title when there is no drawing). */
const Card: React.FC<{
  x: number; y: number; w: number; h: number; src?: string; title?: string; opacity?: number; scale?: number; glow?: boolean; rot?: number;
}> = ({ x, y, w, h, src, title, opacity = 1, scale = 1, glow, rot = 0 }) => (
  <div
    style={{
      position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, opacity,
      transform: `scale(${scale}) rotate(${rot}deg)`, borderRadius: 26, background: C.card,
      border: `3px solid ${glow ? C.accentText : alpha(C.text, 0.14)}`,
      boxShadow: glow ? `0 0 40px ${alpha(C.accent, 0.55)}` : `0 14px 30px ${alpha(C.bg0, 0.5)}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxSizing: 'border-box',
    }}
  >
    {src ? <Img src={src} style={{ width: '88%', height: '88%', objectFit: 'contain' }} /> : null}
    {title ? <div style={{ fontFamily, fontSize: 38, fontWeight: 700, color: C.text, textAlign: 'center', padding: 18, lineHeight: 1.15 }}>{title}</div> : null}
  </div>
);

const Label: React.FC<{ x: number; y: number; text: string; size?: number; color?: string; opacity?: number; weight?: number; w?: number }> = ({
  x, y, text, size = 40, color = C.text, opacity = 1, weight = 700, w = 600,
}) => (
  <div style={{ position: 'absolute', left: x - w / 2, top: y, width: w, textAlign: 'center', fontFamily, fontSize: size, fontWeight: weight, color, opacity, lineHeight: 1.15 }}>{text}</div>
);

const Robot: React.FC<{ x: number; y: number; size: number; opacity?: number }> = ({ x, y, size, opacity = 1 }) => (
  <Img src={img('robot-my-agent')} style={{ position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, opacity, objectFit: 'contain' }} />
);

const Pic: React.FC<{ name: string; x: number; y: number; size: number; opacity?: number; scale?: number; flip?: boolean }> = ({ name, x, y, size, opacity = 1, scale = 1, flip }) => (
  <Img src={img(name)} style={{ position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, objectFit: 'contain', opacity, transform: `scale(${scale})${flip ? ' scaleX(-1)' : ''}` }} />
);

// ------------------------------------------------------------------ modes

const MAP = blob(110, 340, 590, 280, 230, 3);

const TWEET_MAP = blob(80, 300, 790, 250, 120, 3);

const Tweet: React.FC<{ s: GapState }> = ({ s }) => {
  const [a, b, c] = s.appear;
  return (
    <>
      {/* The real tweet (screenshot, public/cast/tweet.png), on a white card. */}
      <div style={{ position: 'absolute', left: 38, top: 10 + (1 - a) * 30, width: 860, padding: 22, borderRadius: 30, background: '#ffffff', opacity: a, boxShadow: `0 18px 40px ${alpha(C.bg0, 0.6)}`, boxSizing: 'border-box' }}>
        <Img src={img('tweet')} style={{ width: '100%', display: 'block' }} />
      </div>
      <Dots dots={TWEET_MAP} opacity={b} />
      <Label x={300} y={930} text="every game on Steam" size={36} color={C.muted} opacity={b} />
      <Star x={790} y={760} opacity={c} pulse={s.wobble} />
      <Label x={790} y={840} text="far from all" size={36} color="#fde68a" opacity={c} w={300} />
    </>
  );
};

const Friend: React.FC<{ s: GapState }> = ({ s }) => {
  const [a, b] = s.appear;
  return (
    <>
      <Pic name="person-friend" x={250} y={320} size={520} opacity={a} scale={lerp(0.9, 1, a)} />
      <div style={{ position: 'absolute', left: 470, top: 150, width: 420, padding: '24px 28px', borderRadius: 30, background: C.text, color: C.bg0, fontFamily, fontSize: 38, fontWeight: 700, opacity: a, lineHeight: 1.2, boxSizing: 'border-box' }}>
        Image models already do it!
      </div>
      <Pic name="astronaut-horse" x={580} y={720} size={640} opacity={b} scale={lerp(0.7, 1, b)} />
    </>
  );
};

const Mix: React.FC<{ s: GapState }> = ({ s }) => {
  const [a, b, c] = s.appear;
  const m = b;
  return (
    <>
      <Card x={lerp(190, 380, m)} y={210} w={300} h={300} src={img('astronaut')} opacity={a * (1 - m)} />
      <Card x={lerp(746, 556, m)} y={210} w={300} h={300} src={img('horse')} opacity={a * (1 - m)} />
      <Pic name="astronaut-horse" x={468} y={250} size={470} opacity={m} scale={lerp(0.6, 1, m)} />
      <div style={{ position: 'absolute', left: 60, top: 540, width: 816, height: 2, background: alpha(C.text, 0.15), opacity: c }} />
      <Star x={468} y={760} r={40} opacity={c} pulse={s.wobble} />
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ position: 'absolute', left: 468 + Math.cos(i * 2.1 + 0.4) * 230 - 50, top: 760 + Math.sin(i * 2.1 + 0.4) * 150 - 50, width: 100, height: 100, borderRadius: 20, border: `3px dashed ${alpha(C.muted, 0.6)}`, opacity: c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily, fontSize: 54, color: C.muted, fontWeight: 700 }}>?</div>
      ))}
    </>
  );
};

/** Small drawn icons for the three catalogues. */
const Icon: React.FC<{ kind: 'game' | 'paper' | 'patent'; x: number; y: number }> = ({ kind, x, y }) => (
  <svg width={160} height={120} viewBox="-80 -60 160 120" style={{ position: 'absolute', left: x - 80, top: y - 60, overflow: 'visible', transform: 'scale(1.4)' }}>
    {kind === 'game' ? (
      <g fill="none" stroke={C.text} strokeWidth={6} strokeLinejoin="round">
        <path d="M-60 -20 Q-60 -40 -40 -40 L40 -40 Q60 -40 60 -20 L66 22 Q68 44 48 42 L28 22 L-28 22 L-48 42 Q-68 44 -66 22 Z" fill={alpha(C.accent, 0.35)} />
        <path d="M-36 -16 L-36 4 M-46 -6 L-26 -6" />
        <circle cx={30} cy={-12} r={5} fill={C.text} /><circle cx={42} cy={0} r={5} fill={C.text} />
      </g>
    ) : kind === 'paper' ? (
      <g fill={alpha(C.accent, 0.35)} stroke={C.text} strokeWidth={6} strokeLinejoin="round">
        <path d="M-42 -54 L22 -54 L44 -32 L44 54 L-42 54 Z" />
        <path d="M-24 -20 L26 -20 M-24 0 L26 0 M-24 20 L10 20" fill="none" />
      </g>
    ) : (
      <g fill={alpha(C.accent, 0.35)} stroke={C.text} strokeWidth={6} strokeLinejoin="round">
        <path d="M0 -54 Q40 -54 40 -14 Q40 8 18 26 L18 40 L-18 40 L-18 26 Q-40 8 -40 -14 Q-40 -54 0 -54 Z" />
        <path d="M-14 52 L14 52" fill="none" />
      </g>
    )}
  </svg>
);

const Three: React.FC<{ s: GapState }> = ({ s }) => {
  const cols: { kind: 'game' | 'paper' | 'patent'; name: string }[] = [
    { kind: 'game', name: 'Steam' },
    { kind: 'paper', name: 'arXiv' },
    { kind: 'patent', name: 'Patents' },
  ];
  return (
    <>
      {cols.map((c, i) => {
        const a = s.appear[i] ?? 0;
        const x = 160 + i * 308;
        return (
          <div key={c.name} style={{ position: 'absolute', left: 0, top: (1 - a) * 40, width: 936, height: 1000, opacity: a }}>
            <Dots dots={blob(34, x, 560, 125, 170, 10 + i * 40)} opacity={1} />
            <Icon kind={c.kind} x={x} y={290} />
            <Label x={x} y={780} text={c.name} size={46} w={300} />
          </div>
        );
      })}
    </>
  );
};

const RING = Array.from({ length: 8 }, (_, i) => {
  const a = -Math.PI / 2 + (i * Math.PI * 2) / 8;
  return { x: 420 + Math.cos(a) * 330, y: 480 + Math.sin(a) * 330 };
});
const CARD_TINTS = [C.accent, C.accent2, '#22d3ee', '#f472b6', '#fbbf24', '#34d399', C.accentText, '#fb7185'];

const MiniGame: React.FC<{ x: number; y: number; tint: string; opacity: number }> = ({ x, y, tint, opacity }) => (
  <div style={{ position: 'absolute', left: x - 80, top: y - 62, width: 160, height: 124, borderRadius: 18, background: C.card, border: `3px solid ${alpha(C.text, 0.14)}`, opacity, overflow: 'hidden' }}>
    <div style={{ position: 'absolute', left: 16, top: 16, width: 128, height: 58, borderRadius: 10, background: alpha(tint, 0.75) }} />
    <div style={{ position: 'absolute', left: 16, top: 76, width: 80, height: 12, borderRadius: 6, background: alpha(C.text, 0.3) }} />
  </div>
);

const Thermo: React.FC<{ x: number; y: number; level: number; opacity: number; label: string }> = ({ x, y, level, opacity, label }) => (
  <div style={{ position: 'absolute', left: x - 40, top: y, opacity }}>
    <div style={{ width: 52, height: 420, borderRadius: 26, border: `4px solid ${C.text}`, position: 'relative', overflow: 'hidden', background: alpha(C.bg0, 0.6) }}>
      <div style={{ position: 'absolute', left: 0, bottom: 0, width: '100%', height: `${clamp01(level) * 100}%`, background: 'linear-gradient(0deg,#38bdf8,#fb7185)' }} />
    </div>
    <div style={{ width: 84, height: 84, borderRadius: 42, background: '#38bdf8', border: `4px solid ${C.text}`, marginLeft: -16, marginTop: -14 }} />
    <div style={{ fontFamily, fontSize: 34, fontWeight: 700, color: C.text, marginTop: 10, marginLeft: -30, width: 120, textAlign: 'center' }}>{label}</div>
  </div>
);

const HotCold: React.FC<{ s: GapState }> = ({ s }) => {
  const [a, b] = s.appear;
  return (
    <>
      {RING.map((p, i) => (
        <MiniGame key={i} x={p.x} y={p.y} tint={CARD_TINTS[i]} opacity={clamp01(a * 8 - i)} />
      ))}
      <Robot x={420} y={480} size={360} opacity={a} />
      <Thermo x={860} y={240} level={0.14 + 0.06 * s.wobble * b} opacity={b} label="hot?" />
    </>
  );
};

const Blend: React.FC<{ s: GapState }> = ({ s }) => {
  const [a, b] = s.appear;
  const tops = [
    { x: 168, src: img('cat-black') },
    { x: 468, src: img('hamster') },
    { x: 768, title: 'My Furry Stepmom 🐾' },
  ];
  return (
    <>
      {tops.map((c, i) => (
        <Card key={i} x={lerp(c.x, 468, b)} y={lerp(200, 580, b)} w={280} h={280} src={c.src} title={c.title} opacity={clamp01(a * 3 - i) * (1 - b)} scale={lerp(1, 0.5, b)} rot={(i - 1) * 4} />
      ))}
      <Card x={468} y={580} w={680} h={480} src={img('kitten-blocks')} opacity={b} scale={lerp(0.6, 1, b)} glow />
    </>
  );
};

const Stamp: React.FC<{ s: GapState }> = ({ s }) => {
  const [a] = s.appear;
  return (
    <>
      <Card x={468} y={360} w={640} h={460} src={img('kitten-blocks')} glow />
      {[img('cat-black'), img('hamster')].map((src, i) => (
        <Card key={i} x={i === 0 ? 170 : 766} y={830} w={200} h={200} src={src} opacity={0.75} />
      ))}
      <Card x={468} y={830} w={200} h={200} title="Furry Stepmom" opacity={0.75} />
      <div
        style={{
          position: 'absolute', left: 140, top: 560, width: 656, textAlign: 'center', padding: '18px 0', borderRadius: 22,
          border: `8px solid #fb7185`, color: '#fb7185', fontFamily, fontSize: 70, fontWeight: 900, letterSpacing: 1,
          transform: `rotate(-8deg) scale(${lerp(1.8, 1, a)})`, opacity: a, background: alpha(C.bg0, 0.55),
        }}
      >
        = its neighbours
      </div>
    </>
  );
};

const Search: React.FC<{ s: GapState }> = ({ s }) => {
  const [a, b] = s.appear;
  const X0 = 80;
  const X1 = 856;
  const Y = 520;
  const stop = 0.14;
  const pos = lerp(0, stop, s.progress) + 0.006 * s.wobble * (s.progress >= 1 ? 1 : 0);
  const px = X0 + (X1 - X0) * pos;
  return (
    <>
      <div style={{ position: 'absolute', left: X0, top: Y - 4, width: X1 - X0, height: 8, borderRadius: 4, background: alpha(C.text, 0.35), opacity: a }} />
      {[0, 0.5, 1].map((v) => (
        <Label key={v} x={X0 + (X1 - X0) * v} y={Y + 40} text={String(v)} size={38} color={C.muted} opacity={a} w={120} />
      ))}
      <Star x={X1} y={Y} r={40} opacity={a} pulse={s.wobble} />
      <Label x={X1 - 40} y={Y - 160} text="the point: 1" size={40} color="#fde68a" opacity={a} w={320} />
      {/* The probe: a magnifier running along the ruler. */}
      <svg width={160} height={160} viewBox="-80 -80 160 160" style={{ position: 'absolute', left: px - 80, top: Y - 150, opacity: a, overflow: 'visible' }}>
        <circle cx={-10} cy={-10} r={42} fill={alpha(C.accent, 0.3)} stroke={C.text} strokeWidth={9} />
        <path d="M22 22 L58 58" stroke={C.text} strokeWidth={14} strokeLinecap="round" />
      </svg>
      <div style={{ position: 'absolute', left: px - 6, top: Y - 30, width: 12, height: 60, borderRadius: 6, background: GRADIENT, opacity: a }} />
      <div style={{ position: 'absolute', left: px - 140, top: Y + 110, width: 280, textAlign: 'center', fontFamily, fontSize: 96, fontWeight: 900, opacity: b, ...gradientText }}>0.14</div>
      <Label x={px} y={Y + 230} text="best coherent text" size={36} color={C.muted} opacity={b} w={420} />
      <div style={{ position: 'absolute', left: px + 30, top: Y - 20, width: X1 - px - 90, height: 40, borderTop: `4px dashed ${alpha(C.muted, 0.6)}`, opacity: b }} />
    </>
  );
};

const CAP_DOTS = Array.from({ length: 70 }, (_, i) => {
  const a = -Math.PI / 2 + (rand(i * 2.3) - 0.5) * 1.5;
  const r = 340 * (0.55 + 0.42 * Math.sqrt(rand(i * 5.1)));
  return { x: 468 + Math.cos(a) * r, y: 520 + Math.sin(a) * r, s: 5 + rand(i) * 4 };
}).filter((d) => d.y < 520 - 340 * 0.62);

const Cap: React.FC<{ s: GapState }> = ({ s }) => {
  const [a, b] = s.appear;
  const R = 340;
  const cy = 520;
  const chordY = cy - R * 0.62;
  const half = Math.sqrt(R * R - (R * 0.62) ** 2);
  const sx = 468 + R * Math.cos(Math.PI * 0.28);
  const sy = cy + R * Math.sin(Math.PI * 0.28);
  return (
    <>
      <svg width={936} height={1000} style={{ position: 'absolute', left: 0, top: 0, opacity: a }}>
        <circle cx={468} cy={cy} r={R} fill={alpha(C.card, 0.8)} stroke={alpha(C.text, 0.3)} strokeWidth={4} />
        <path d={`M${468 - half},${chordY} A${R},${R} 0 0,1 ${468 + half},${chordY} Z`} fill={alpha(C.accent, 0.32)} stroke={C.accentText} strokeWidth={4} />
      </svg>
      <Dots dots={CAP_DOTS} opacity={a} color={C.text} />
      <Label x={468} y={chordY + 40} text="where all texts live" size={40} color={C.accentText} opacity={a} w={600} />
      <Star x={sx} y={sy} r={38} opacity={b} pulse={s.wobble} />
      <Label x={sx - 60} y={sy + 70} text="far points" size={40} color="#fde68a" opacity={b} w={360} />
    </>
  );
};

const GRID = Array.from({ length: 50 }, (_, i) => ({ x: 128 + (i % 10) * 76, y: 330 + Math.floor(i / 10) * 92 }));
/** Which 4 of the 50 slots are not museums (46/50 are). */
const ODD = new Set([13, 27, 38, 44]);
const VARIED = ['cat-black', 'hamster', 'kitten-blocks', 'horse', 'astronaut', 'astronaut-horse', 'museum'];

const Museums: React.FC<{ s: GapState; diverse?: boolean }> = ({ s, diverse }) => {
  const [a, b] = s.appear;
  const shown = diverse ? 50 : Math.round(50 * s.progress);
  return (
    <>
      <Robot x={140} y={150} size={220} opacity={diverse ? 1 : a} />
      <div style={{ position: 'absolute', left: 270, top: 80, width: 600, padding: '22px 28px', borderRadius: 26, background: C.text, color: C.bg0, fontFamily, fontSize: 38, fontWeight: 700, boxSizing: 'border-box', opacity: diverse ? 1 : a }}>
        {diverse ? 'My earlier ideas: ✓ ✓ ✓ …' : '"Invent a new game."'}
      </div>
      {GRID.map((g, i) => {
        if (i >= shown) return null;
        const name = diverse ? (a > 0.5 ? VARIED[(i * 5 + 3) % VARIED.length] : 'museum') : ODD.has(i) ? VARIED[i % 6] : 'museum';
        return <Pic key={i} name={name} x={g.x} y={g.y} size={70} opacity={diverse ? 1 : 1} />;
      })}
      {!diverse ? (
        <div style={{ position: 'absolute', left: 168, top: 800, width: 600, textAlign: 'center', fontFamily, fontSize: 120, fontWeight: 900, opacity: b * clamp01((s.progress - 0.8) / 0.2), ...gradientText }}>46/50</div>
      ) : null}
      {!diverse ? <Label x={468} y={940} text="museums" size={44} color={C.muted} opacity={b * clamp01((s.progress - 0.8) / 0.2)} /> : null}
      {diverse ? <div style={{ position: 'absolute', left: 118, top: 820, width: 700, textAlign: 'center', fontFamily, fontSize: 96, fontWeight: 900, opacity: b, ...gradientText }}>most original</div> : null}
    </>
  );
};

export const GapMap: React.FC<AnimProps & GapProps> = ({ t, beats, dur, vertical, ...props }) => {
  const s = frameState(props, t, beats, dur);
  const st = stageOf(vertical);
  const body =
    s.mode === 'tweet' ? <Tweet s={s} />
    : s.mode === 'friend' ? <Friend s={s} />
    : s.mode === 'mix' ? <Mix s={s} />
    : s.mode === 'three' ? <Three s={s} />
    : s.mode === 'hotcold' ? <HotCold s={s} />
    : s.mode === 'blend' ? <Blend s={s} />
    : s.mode === 'stamp' ? <Stamp s={s} />
    : s.mode === 'search' ? <Search s={s} />
    : s.mode === 'cap' ? <Cap s={s} />
    : s.mode === 'museums' ? <Museums s={s} />
    : <Museums s={s} diverse />;
  // Drawn on a 936x1000 board, scaled to the stage.
  const k = Math.min(st.w / 936, st.h / 1000);
  return (
    <div style={{ position: 'absolute', top: st.top, left: st.side, width: st.w, height: st.h, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: (st.w - 936 * k) / 2, top: (st.h - 1000 * k) / 2, width: 936, height: 1000, transform: `scale(${k})`, transformOrigin: '0 0' }}>{body}</div>
    </div>
  );
};
