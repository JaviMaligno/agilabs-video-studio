import React from 'react';
import { C, GRADIENT, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import { STAGE } from '../layout.ts';
import { WARM, WARM_GRADIENT } from './warm.ts';
import { H, W, type CounterDraw, type DialDraw, type PanDraw, type RingDraw, type RingPanState } from './RingPan.state.ts';

const annulus = (cx: number, cy: number, ro: number, ri: number) => {
  const outer = `M ${cx - ro} ${cy} a ${ro} ${ro} 0 1 0 ${2 * ro} 0 a ${ro} ${ro} 0 1 0 ${-2 * ro} 0 Z`;
  if (ri <= 0.5) return outer;
  return `${outer} M ${cx - ri} ${cy} a ${ri} ${ri} 0 1 0 ${2 * ri} 0 a ${ri} ${ri} 0 1 0 ${-2 * ri} 0 Z`;
};

const Pan: React.FC<{ p: PanDraw; i: number }> = ({ p, i }) => {
  const wide = 1 + 0.1 * p.rect;
  const rx = p.R * (1 - 0.86 * p.rect);
  const w = 2 * p.R * wide;
  const h = 2 * p.R;
  const wall = Math.max(8, p.R * 0.06);
  return (
    <g opacity={p.opacity}>
      <rect x={p.cx - w / 2 - wall} y={p.cy - h / 2 - wall} width={w + 2 * wall} height={h + 2 * wall} rx={rx + wall} fill={WARM.metal} stroke={alpha('#ffffff', 0.14)} strokeWidth={2} />
      <rect x={p.cx - w / 2} y={p.cy - h / 2} width={w} height={h} rx={rx} fill={`url(#floor-${i})`} stroke={alpha('#ffffff', 0.22)} strokeWidth={2.5} />
      {p.sphere > 0 && (
        <g opacity={p.sphere} fill="none" stroke={alpha(C.accentText, 0.55)} strokeWidth={2}>
          <circle cx={p.cx} cy={p.cy} r={p.R} fill={`url(#sphere-${i})`} />
          {[0.35, 0.7].map((k) => (
            <ellipse key={`m${k}`} cx={p.cx} cy={p.cy} rx={p.R * k} ry={p.R} />
          ))}
          {[0.35, 0.7].map((k) => (
            <ellipse key={`p${k}`} cx={p.cx} cy={p.cy} rx={p.R} ry={p.R * k} />
          ))}
        </g>
      )}
      {p.candidates.map((c, k) => (
        <g key={k}>
          <circle cx={c.cx} cy={c.cy} r={c.r - 3} fill="none" stroke={C.accentText} strokeWidth={4} strokeDasharray="10 10" opacity={c.on * 0.9 * (1 - c.picked)} />
          <circle cx={c.cx} cy={c.cy} r={c.r - 3} fill="none" stroke={WARM.amber} strokeWidth={6} opacity={c.picked} />
        </g>
      ))}
    </g>
  );
};

const Ring: React.FC<{ g: RingDraw }> = ({ g }) => {
  if (g.opacity <= 0) return null;
  const d = annulus(g.x, g.y, g.ro, g.ri);
  const h = g.height;
  return (
    <g opacity={g.opacity}>
      {h > 0.02 && (
        <path d={annulus(g.x + 6 + 18 * h, g.y + 10 + 26 * h, g.ro * (1 + 0.05 * h), g.ri)} fillRule="evenodd" fill="#000" opacity={0.55 - 0.25 * h} style={{ filter: `blur(${3 + 12 * h}px)` }} />
      )}
      {g.glow > 0 && <path d={d} fillRule="evenodd" fill={WARM.orange} opacity={0.55 * g.glow} style={{ filter: `blur(${Math.max(6, g.ro * 0.12)}px)` }} />}
      <path d={d} fillRule="evenodd" fill="url(#squid)" opacity={g.raw} />
      {g.glow > 0 && <path d={d} fillRule="evenodd" fill="url(#sear)" opacity={g.glow} />}
      <path d={d} fillRule="evenodd" fill="none" stroke={alpha('#ffffff', 0.35)} strokeWidth={1.5} />
      {g.puff > 0 && g.puff < 1 && <Puff g={g} />}
      {g.cross > 0 && (
        <g transform={`translate(${g.x} ${g.y}) scale(${g.cross})`} stroke={WARM.red} strokeWidth={16} strokeLinecap="round">
          <line x1={-g.ro * 0.6} y1={-g.ro * 0.6} x2={g.ro * 0.6} y2={g.ro * 0.6} />
          <line x1={g.ro * 0.6} y1={-g.ro * 0.6} x2={-g.ro * 0.6} y2={g.ro * 0.6} />
        </g>
      )}
    </g>
  );
};

/** Warm sizzle on contact: an oil ripple, sparks thrown off the rim, a little steam. */
const Puff: React.FC<{ g: RingDraw }> = ({ g }) => {
  const p = g.puff;
  const n = 9;
  return (
    <g>
      <circle cx={g.x} cy={g.y} r={g.ro + 8 + 46 * p} fill="none" stroke={WARM.ember} strokeWidth={4 * (1 - p) + 0.5} opacity={0.7 * (1 - p)} />
      {Array.from({ length: n }, (_, k) => {
        const a = (k / n) * 2 * Math.PI + g.seed * 1.7;
        const dist = g.ro + 6 + (40 + 30 * ((k * 37 + g.seed * 11) % 7) / 7) * Math.sqrt(p);
        return <circle key={k} cx={g.x + Math.cos(a) * dist} cy={g.y + Math.sin(a) * dist} r={1.5 + 5 * (1 - p)} fill={k % 2 ? WARM.amber : WARM.ember} opacity={1 - p} />;
      })}
      <circle cx={g.x + 10} cy={g.y - g.ro * 0.4 - 60 * p} r={g.ro * 0.4 + 30 * p} fill="#ffffff" opacity={0.18 * Math.sin(Math.PI * p)} style={{ filter: 'blur(16px)' }} />
    </g>
  );
};

const Counter: React.FC<{ c: CounterDraw }> = ({ c }) => (
  <g>
    <path d={annulus(c.x, c.y, c.ro, c.ri)} fillRule="evenodd" fill="url(#squid)" opacity={1 - 0.85 * c.ghost} />
    {c.ghost > 0 && <circle cx={c.x} cy={c.y} r={c.ro - 1} fill="none" stroke={alpha(WARM.squid, 0.5)} strokeWidth={2} strokeDasharray="6 8" opacity={c.ghost} />}
  </g>
);

const Dial: React.FC<{ d: DialDraw }> = ({ d }) => (
  <div style={{ position: 'absolute', left: d.x - d.w / 2, top: d.y, width: d.w, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, opacity: d.opacity }}>
    {d.label && <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: '0.12em', color: C.text }}>{d.label}</div>}
    {d.rings && (
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, opacity: 1 - 0.62 * d.rings.dim }}>
        <span style={{ fontSize: 30, fontWeight: 700, letterSpacing: '0.12em', color: C.accentText }}>RINGS</span>
        <span
          style={{
            fontSize: 68,
            fontWeight: 800,
            color: d.rings.pulse > 0 ? C.accentText : C.text,
            opacity: d.rings.opacity,
            minWidth: 44,
            display: 'inline-block',
            transform: `scale(${1 + 0.16 * d.rings.pulse})`,
            textShadow: d.rings.pulse > 0 ? `0 0 ${30 * d.rings.pulse}px ${alpha(C.accent, 0.9)}` : 'none',
          }}
        >
          {d.rings.value}
        </span>
      </div>
    )}
    {d.seared && (
      <div style={{ width: '88%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, transform: `scale(${1 + 0.08 * d.seared.pulse})` }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, height: 62 }}>
          <span style={{ fontSize: 30, fontWeight: 700, letterSpacing: '0.12em', color: WARM.amber }}>SEARED</span>
          {(d.seared.display || d.seared.reserve) && (
            <span
              style={{
                fontSize: 54,
                fontWeight: 800,
                opacity: d.seared.display ? d.seared.displayOpacity : 0,
                backgroundImage: WARM_GRADIENT,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {d.seared.display || '≈ 00.0'}
            </span>
          )}
        </div>
        <div style={{ width: '100%', height: 16, borderRadius: 8, background: alpha('#ffffff', 0.1), overflow: 'hidden', boxShadow: d.seared.pulse > 0 ? `0 0 ${28 * d.seared.pulse}px ${alpha(WARM.orange, 0.9)}` : 'none' }}>
          <div style={{ width: `${d.seared.fill * 100}%`, height: '100%', borderRadius: 8, background: WARM_GRADIENT }} />
        </div>
      </div>
    )}
  </div>
);

/** Draws a RingPan frame state inside the vertical stage box. */
export const PanArt: React.FC<{ s: RingPanState; hideDials?: boolean; opacity?: number }> = ({ s, hideDials, opacity = 1 }) => {
  const st = STAGE.vertical;
  // Flying rings above landed ones, the highest on top.
  const rings = [...s.rings].sort((a, b) => a.height - b.height);
  return (
    <div style={{ position: 'absolute', left: st.side, top: st.top, width: W, height: H, fontFamily, color: C.text, opacity }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <defs>
          <linearGradient id="sear" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={WARM.ember} />
            <stop offset="0.45" stopColor={WARM.amber} />
            <stop offset="1" stopColor={WARM.orange} />
          </linearGradient>
          <linearGradient id="squid" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fbf6ef" />
            <stop offset="1" stopColor={WARM.squidShade} />
          </linearGradient>
          {s.pans.map((p, i) => (
            <React.Fragment key={i}>
              <radialGradient id={`floor-${i}`} cx="0.42" cy="0.38" r="0.75">
                <stop offset="0" stopColor={WARM.floor0} />
                <stop offset="1" stopColor={WARM.floor1} />
              </radialGradient>
              <radialGradient id={`sphere-${i}`} cx="0.35" cy="0.3" r="0.8">
                <stop offset="0" stopColor={alpha(C.accentText, 0.22)} />
                <stop offset="1" stopColor={alpha(C.bg0, 0)} />
              </radialGradient>
            </React.Fragment>
          ))}
        </defs>
        {s.counter.length > 0 && (
          <rect x={0} y={Math.min(...s.counter.map((c) => c.y - c.ro)) - 14} width={W} height={H - Math.min(...s.counter.map((c) => c.y - c.ro)) + 14} rx={24} fill={alpha(C.card, 0.55)} stroke={alpha('#ffffff', 0.06)} />
        )}
        {s.pans.map((p, i) => (
          <Pan key={i} p={p} i={i} />
        ))}
        {s.counter.map((c, i) => (
          <Counter key={i} c={c} />
        ))}
        {rings.map((g) => (
          <Ring key={g.seed} g={g} />
        ))}
        {s.checks.map((c, i) => (
          <g key={i}>
            <path d={annulus(c.ring.x, c.ring.y, c.ring.ro, c.ring.ri)} fillRule="evenodd" fill="url(#squid)" />
            {c.ghosts.map((g, k) => (
              <circle key={k} cx={g.x} cy={g.y} r={Math.max(2, g.r - 2)} fill={alpha(C.accent, 0.18 * g.appear)} stroke={C.accentText} strokeWidth={4} strokeDasharray="10 7" opacity={g.appear} />
            ))}
            {c.ghosts.length > 0 && <line x1={c.ring.x - c.ring.ro} y1={c.ring.y} x2={c.ring.x + c.ring.ro} y2={c.ring.y} stroke={alpha(C.text, 0.5)} strokeWidth={2} strokeDasharray="4 6" opacity={c.ghosts[0].appear} />}
            {c.check && c.check.pop > 0 && (
              <g transform={`translate(${c.check.x} ${c.check.y}) scale(${c.check.pop})`}>
                <circle r={32} fill={C.accent} />
                <path d="M -14 1 L -4 12 L 15 -11" fill="none" stroke="#fff" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
              </g>
            )}
          </g>
        ))}
      </svg>
      {!hideDials && s.dials.map((d, i) => <Dial key={i} d={d} />)}
      {s.label && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: s.label.y - 30, textAlign: 'center', fontSize: 42, fontWeight: 700, opacity: s.label.appear, transform: `translateY(${(1 - s.label.appear) * 16}px)` }}>
          {s.label.text}
        </div>
      )}
      {s.tags.map((tag, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: tag.x - 140,
            width: 280,
            top: tag.y - 34,
            display: 'flex',
            justifyContent: 'center',
            opacity: tag.pop,
            transform: `scale(${0.7 + 0.3 * tag.pop})`,
          }}
        >
          <div style={{ padding: '10px 26px', borderRadius: 40, border: `2px solid ${WARM.amber}`, background: alpha(WARM.amber, 0.14), fontSize: 38, fontWeight: 700, whiteSpace: 'nowrap' }}>
            ✓ {tag.text}
          </div>
        </div>
      ))}
      {s.morphTag && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: s.morphTag.y - 36, display: 'flex', justifyContent: 'center', opacity: s.morphTag.pop, transform: `scale(${0.7 + 0.3 * s.morphTag.pop})` }}>
          <div style={{ padding: '12px 34px', borderRadius: 44, backgroundImage: GRADIENT, fontSize: 42, fontWeight: 800 }}>{s.morphTag.text}</div>
        </div>
      )}
    </div>
  );
};
