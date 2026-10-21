// The bridge stage (see BridgeCrew.state.ts): draws the primitives of the frame state. Vertical
// only (the video is 9:16); coordinates are frame pixels. Brand tokens only, Inter.
import React from 'react';
import { interpolate } from 'remotion';
import { C, GRADIENT, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import {
  frameState,
  type Bank,
  type BridgeProps,
  type Crew,
  type Human,
  type Link,
  type Mark,
  type RungId,
  type Span,
  type Spark,
  type Tag,
  type TagTone,
  type Truck,
} from './BridgeCrew.state.ts';

export { frameState };

const W = 1080;
const H = 1920;
const DECK_T = 32;

const TONE: Record<TagTone, string> = { text: C.text, muted: C.muted, flag: C.flag, ok: C.ok, warm: C.warm, accent: C.accentText };
const MARK_COLOR = { tick: C.ok, cross: C.flag, tilde: C.warm } as const;

// ------------------------------------------------------------------ svg pieces

const BankShape: React.FC<{ b: Bank }> = ({ b }) => (
  <g opacity={b.opacity}>
    <defs>
      <linearGradient id={`bank${b.y}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={C.card} stopOpacity={1} />
        <stop offset="1" stopColor={C.card} stopOpacity={0} />
      </linearGradient>
    </defs>
    <path d={`M 60 ${b.y} L 300 ${b.y} L 280 ${b.y + 200} L 60 ${b.y + 200} Z`} fill={`url(#bank${b.y})`} />
    <path d={`M 1020 ${b.y} L 780 ${b.y} L 800 ${b.y + 200} L 1020 ${b.y + 200} Z`} fill={`url(#bank${b.y})`} />
    <line x1={60} y1={b.y} x2={300} y2={b.y} stroke={alpha(C.muted, 0.7)} strokeWidth={6} strokeLinecap="round" />
    <line x1={780} y1={b.y} x2={1020} y2={b.y} stroke={alpha(C.muted, 0.7)} strokeWidth={6} strokeLinecap="round" />
  </g>
);

const SpanShape: React.FC<{ s: Span }> = ({ s }) => {
  if (s.grow <= 0 || s.opacity <= 0) return null;
  const yAt = (x: number) => (s.x1 === s.x0 ? s.y0 : s.y0 + ((x - s.x0) / (s.x1 - s.x0)) * (s.y1 - s.y0));
  const len = (s.x1 - s.x0) * s.grow;
  const xa = s.from === 'left' ? s.x0 : s.x1 - len;
  const xb = s.from === 'left' ? s.x0 + len : s.x1;
  const ya = yAt(xa);
  const yb = yAt(xb);
  const poly = `${xa},${ya} ${xb},${yb} ${xb},${yb + DECK_T} ${xa},${ya + DECK_T}`;
  if (s.tone === 'ghost') {
    return <polygon points={poly} fill={alpha(C.accentText, 0.08)} stroke={C.accentText} strokeWidth={3} strokeDasharray="10 8" opacity={s.opacity} />;
  }
  const planks: number[] = [];
  for (let x = Math.ceil(xa / 30) * 30; x < xb; x += 30) planks.push(x);
  const accent = s.tone === 'accent';
  return (
    <g opacity={s.opacity}>
      <polygon points={poly} fill={accent ? alpha(C.accent, 0.8) : alpha(C.muted, 0.42)} stroke={accent ? C.accentText : alpha(C.muted, 0.95)} strokeWidth={3} />
      {planks.map((x) => (
        <line key={x} x1={x} y1={yAt(x) + 3} x2={x} y2={yAt(x) + DECK_T - 3} stroke={alpha(C.bg0, 0.45)} strokeWidth={2} />
      ))}
    </g>
  );
};

const HardHat: React.FC<{ c: Crew }> = ({ c }) => {
  if (c.opacity <= 0) return null;
  const r = 38 * c.scale;
  const owner = c.tone === 'c';
  const hat = owner ? C.accent : C.warm;
  return (
    <g opacity={c.opacity} transform={`translate(${c.x} ${c.y})`}>
      {owner && <circle r={r * 1.9} fill={alpha(C.accent, 0.22)} />}
      <circle r={r} fill={C.card} stroke={owner ? C.accentText : C.text} strokeWidth={3.5} />
      {/* The hard hat: dome and brim. */}
      <path d={`M ${-r * 0.95} ${-r * 0.55} A ${r * 0.95} ${r * 0.85} 0 0 1 ${r * 0.95} ${-r * 0.55} Z`} fill={hat} stroke={owner ? C.accent2 : alpha(C.bg0, 0.4)} strokeWidth={2} />
      <rect x={-r * 1.2} y={-r * 0.62} width={r * 2.4} height={r * 0.22} rx={r * 0.1} fill={hat} />
      {c.label && (
        <text y={r * 0.5} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={r * 0.95} fill={C.text}>
          {c.label}
        </text>
      )}
    </g>
  );
};

/** Walkie-talkie at the crew's outer side: body, antenna, and a light when it is on. */
const Radio: React.FC<{ c: Crew; side: 1 | -1; t: number }> = ({ c, side, t }) => {
  if (c.radio <= 0 || c.opacity <= 0) return null;
  const x = c.x + side * 56 * c.scale;
  const y = c.y + 2;
  const on = c.lit;
  const phase = (t * 1.6) % 1;
  return (
    <g opacity={c.opacity * c.radio}>
      <rect x={x - 9} y={y - 18} width={18} height={34} rx={4} fill={alpha(C.muted, 0.85)} />
      <line x1={x + 4} y1={y - 18} x2={x + 4} y2={y - 40} stroke={alpha(C.muted, 0.85)} strokeWidth={3} strokeLinecap="round" />
      <circle cx={x} cy={y - 8} r={3.5} fill={on > 0.5 ? C.ok : alpha(C.bg0, 0.7)} />
      {on > 0 &&
        [0, 0.5].map((d) => {
          const p = (phase + d) % 1;
          return (
            <path
              key={d}
              d={`M ${x + 4 - 10 - p * 16} ${y - 44 - p * 4} A ${12 + p * 16} ${12 + p * 16} 0 0 1 ${x + 4 + 10 + p * 16} ${y - 44 - p * 4}`}
              fill="none"
              stroke={C.ok}
              strokeWidth={3}
              opacity={on * (1 - p)}
            />
          );
        })}
    </g>
  );
};

/** The open channel: a dashed arc between the two radios, with messages travelling both ways. */
const LinkShape: React.FC<{ l: Link; t: number }> = ({ l, t }) => {
  if (l.opacity <= 0) return null;
  const x0 = Math.min(l.x0, l.x1) + 50;
  const x1 = Math.max(l.x0, l.x1) - 50;
  if (x1 - x0 < 20) return null;
  const y = l.y;
  const lift = Math.min(90, (x1 - x0) * 0.22);
  const mid = (x0 + x1) / 2;
  const at = (p: number) => {
    const q = 1 - p;
    return { x: q * q * x0 + 2 * q * p * mid + p * p * x1, y: q * q * y + 2 * q * p * (y - lift * 2) + p * p * y };
  };
  const dots = [0, 0.33, 0.66].map((d) => ((t * 0.55 + d) % 1));
  return (
    <g opacity={l.opacity}>
      {l.flash > 0 && <path d={`M ${x0} ${y} Q ${mid} ${y - lift * 2} ${x1} ${y}`} fill="none" stroke={C.ok} strokeWidth={16} opacity={0.3 * l.flash} />}
      <path d={`M ${x0} ${y} Q ${mid} ${y - lift * 2} ${x1} ${y}`} fill="none" stroke={alpha(C.ok, 0.7)} strokeWidth={3.5} strokeDasharray="4 12" strokeLinecap="round" />
      {dots.map((p, i) => {
        const q = i === 1 ? 1 - p : p;
        const pt = at(q);
        return <circle key={i} cx={pt.x} cy={pt.y} r={7} fill={C.ok} />;
      })}
    </g>
  );
};

const TruckShape: React.FC<{ k: Truck }> = ({ k }) => {
  if (k.opacity <= 0) return null;
  return (
    <g opacity={k.opacity} transform={`rotate(${k.tilt} ${k.x + 40} ${k.y}) translate(${k.x} ${k.y}) scale(1.15) translate(${-k.x} ${-k.y})`}>
      <rect x={k.x - 62} y={k.y - 66} width={92} height={48} rx={6} fill={alpha(C.text, 0.92)} />
      <path d={`M ${k.x + 34} ${k.y - 54} L ${k.x + 56} ${k.y - 54} L ${k.x + 68} ${k.y - 34} L ${k.x + 68} ${k.y - 18} L ${k.x + 34} ${k.y - 18} Z`} fill={C.muted} />
      <rect x={k.x + 44} y={k.y - 50} width={12} height={12} rx={2} fill={C.bg1} />
      <circle cx={k.x - 36} cy={k.y - 14} r={13} fill={C.bg1} stroke={C.text} strokeWidth={4} />
      <circle cx={k.x + 44} cy={k.y - 14} r={13} fill={C.bg1} stroke={C.text} strokeWidth={4} />
    </g>
  );
};

const MarkShape: React.FC<{ m: Pick<Mark, 'kind' | 'x' | 'y' | 'size' | 'pop'> }> = ({ m }) => {
  if (m.pop <= 0) return null;
  const col = MARK_COLOR[m.kind];
  const s = m.size / 2;
  const sc = interpolate(m.pop, [0, 1], [1.6, 1]);
  return (
    <g transform={`translate(${m.x} ${m.y}) scale(${sc})`} opacity={Math.min(1, m.pop * 1.5)}>
      <circle r={s} fill={C.bg0} stroke={col} strokeWidth={5} />
      {m.kind === 'tick' && <path d={`M ${-s * 0.45} 0 L ${-s * 0.1} ${s * 0.38} L ${s * 0.5} ${-s * 0.38}`} fill="none" stroke={col} strokeWidth={6.5} strokeLinecap="round" strokeLinejoin="round" />}
      {m.kind === 'cross' && (
        <path d={`M ${-s * 0.38} ${-s * 0.38} L ${s * 0.38} ${s * 0.38} M ${s * 0.38} ${-s * 0.38} L ${-s * 0.38} ${s * 0.38}`} stroke={col} strokeWidth={6.5} strokeLinecap="round" />
      )}
      {m.kind === 'tilde' && <path d={`M ${-s * 0.5} ${s * 0.08} Q ${-s * 0.25} ${-s * 0.32} 0 0 T ${s * 0.5} ${-s * 0.08}`} fill="none" stroke={col} strokeWidth={6.5} strokeLinecap="round" />}
    </g>
  );
};

const SparkShape: React.FC<{ s: Spark; small?: boolean }> = ({ s, small }) => {
  if (s.pop <= 0) return null;
  const R = (small ? 30 : 54) * interpolate(s.pop, [0, 1], [0.4, 1]);
  const rays = Array.from({ length: 10 }, (_, i) => (i * Math.PI * 2) / 10);
  return (
    <g transform={`translate(${s.x} ${s.y})`} opacity={Math.min(1, s.pop * 1.4)}>
      <circle r={R * 0.75} fill={alpha(C.flag, 0.3)} />
      {rays.map((a, i) => (
        <line key={i} x1={Math.cos(a) * R * 0.35} y1={Math.sin(a) * R * 0.35} x2={Math.cos(a) * R * (i % 2 ? 0.8 : 1.1)} y2={Math.sin(a) * R * (i % 2 ? 0.8 : 1.1)} stroke={i % 2 ? C.warm : C.flag} strokeWidth={small ? 4 : 6} strokeLinecap="round" />
      ))}
      <circle r={R * 0.22} fill={C.warm} />
    </g>
  );
};

const HumanShape: React.FC<{ h: Human }> = ({ h }) => (
  <g opacity={h.opacity} transform={`translate(${h.x} ${h.y})`}>
    <circle cy={-34} r={22} fill={C.muted} />
    <path d="M -38 30 Q -38 -6 0 -6 Q 38 -6 38 30 Z" fill={C.muted} />
  </g>
);

// ------------------------------------------------------------------ ladder icons

const RungIcon: React.FC<{ id: RungId; color: string }> = ({ id, color }) => (
  <svg width={52} height={52} viewBox="0 0 48 48" style={{ flex: 'none' }}>
    {id === 'talk' && (
      <g fill="none" stroke={color} strokeWidth={3.2} strokeLinejoin="round">
        <path d="M5 9 h22 a4 4 0 0 1 4 4 v9 a4 4 0 0 1 -4 4 h-12 l-6 6 v-6 h-4 a4 4 0 0 1 -4 -4 v-9 a4 4 0 0 1 4 -4 z" />
        <path d="M35 18 h4 a4 4 0 0 1 4 4 v9 a4 4 0 0 1 -4 4 h-2 v5 l-5 -5 h-8 a4 4 0 0 1 -4 -4" />
      </g>
    )}
    {(id === 'files' || id === 'lines') && (
      <g stroke={color} strokeWidth={3.2} strokeLinecap="round" fill="none">
        {[8, 20, 32, 44].map((x) => (
          <path key={x} d={`M${x} 42 V12 l-3 -4`} />
        ))}
        <path d="M4 20 H46 M4 33 H46" />
        {id === 'lines' && <path d="M8 33 L20 20 M20 33 L32 20 M32 33 L44 20" strokeWidth={2.4} />}
      </g>
    )}
    {id === 'seq' && (
      <g>
        <rect x={6} y={19} width={36} height={11} rx={5.5} fill={color} transform="rotate(-30 24 24)" />
        <path d="M30 40 h12 M36 34 l6 6 l-6 6" stroke={color} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    )}
    {id === 'int' && (
      <g>
        <path d="M8 30 A16 15 0 0 1 40 30 Z" fill={color} />
        <rect x={4} y={29} width={40} height={6} rx={3} fill={color} />
        <text x={24} y={27} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={13} fill={C.bg0}>
          C
        </text>
      </g>
    )}
  </svg>
);

// ------------------------------------------------------------------ html pieces

const TagView: React.FC<{ g: Tag }> = ({ g }) => {
  if (g.opacity <= 0) return null;
  const col = TONE[g.tone];
  const shift = g.anchor === 'middle' ? '-50%' : g.anchor === 'end' ? '-100%' : '0';
  return (
    <div
      style={{
        position: 'absolute',
        left: g.x,
        top: g.y,
        transform: `translate(${shift}, ${(1 - g.opacity) * 14}px)`,
        opacity: g.opacity,
        fontFamily,
        fontSize: g.size,
        fontWeight: g.weight,
        lineHeight: 1.18,
        color: col,
        whiteSpace: 'pre',
        textAlign: g.anchor === 'middle' ? 'center' : g.anchor === 'end' ? 'right' : 'left',
        letterSpacing: g.size > 60 ? '-0.02em' : '0',
        ...(g.box ? { padding: '8px 22px', border: `3px solid ${col}`, borderRadius: 16, background: alpha(C.bg0, 0.88) } : {}),
      }}
    >
      {g.text}
    </div>
  );
};

/** Ladder of the five structures on the right margin, bottom to top. */
const LadderView: React.FC<{ l: NonNullable<ReturnType<typeof frameState>['ladder']> }> = ({ l }) => {
  if (l.opacity <= 0) return null;
  const top = 412;
  const step = 102;
  const n = l.rungs.length;
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, opacity: l.opacity, fontFamily }}>
      {[628, 1012].map((x) => (
        <div key={x} style={{ position: 'absolute', left: x, top: top - 10, width: 6, height: n * step + 4, borderRadius: 3, background: alpha(C.muted, 0.35) }} />
      ))}
      {l.rungs.map((r, i) => {
        const y = top + (n - 1 - i) * step;
        const lit = r.glow;
        const border = r.accent ? C.accentText : lit > 0 ? C.text : alpha(C.muted, 0.35);
        const iconColor = r.accent ? C.accentText : lit > 0.5 ? C.text : C.muted;
        return (
          <div
            key={r.id}
            style={{
              position: 'absolute',
              left: 640,
              top: y,
              width: 366,
              height: 84,
              boxSizing: 'border-box',
              opacity: r.appear,
              transform: `translateY(${(1 - r.appear) * 20}px)`,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '0 14px',
              borderRadius: 16,
              border: `3px solid ${border}`,
              background: r.accent ? alpha(C.accent, 0.18 + 0.2 * lit) : alpha(C.card, 0.9 + 0.1 * lit),
              boxShadow: lit > 0 ? `0 0 ${30 * lit}px ${alpha(r.accent ? C.accent : C.text, 0.35 * lit)}` : 'none',
            }}
          >
            <RungIcon id={r.id} color={iconColor} />
            <div style={{ flex: 1, fontSize: 34, fontWeight: 700, color: r.accent || lit > 0.5 ? C.text : C.muted, whiteSpace: 'nowrap' }}>{r.label}</div>
            {r.mark && r.pop > 0 && (
              <svg width={52} height={52} style={{ flex: 'none', overflow: 'visible' }}>
                <MarkShape m={{ kind: r.mark, x: 26, y: 26, size: 46, pop: r.pop }} />
              </svg>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ------------------------------------------------------------------ the stage

export const BridgeCrew: React.FC<AnimProps & BridgeProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const t = p.t;
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, fontFamily, color: C.text }}>
      {/* Hook lane titles, each with its verdict. */}
      {s.titles.map((ti) => (
        <div key={ti.text} style={{ position: 'absolute', left: 80, top: ti.y, width: 920, display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: ti.opacity }}>
          <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: '0.04em', color: C.text }}>{ti.text}</div>
          <svg width={96} height={96} style={{ overflow: 'visible' }}>
            <MarkShape m={{ kind: ti.mark, x: 48, y: 48, size: 86, pop: ti.pop }} />
          </svg>
        </div>
      ))}
      {/* Yards (the humans' shared yard, the integrator's two yards). */}
      {s.yards.map((y, i) => (
        <div key={i} style={{ position: 'absolute', left: y.x, top: y.y, width: y.w, height: y.h, opacity: y.opacity, borderRadius: 26, border: `3px dashed ${alpha(C.muted, 0.45)}`, background: alpha(C.card, 0.35) }} />
      ))}
      <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        {s.banks.map((b, i) => (
          <BankShape key={i} b={b} />
        ))}
        {s.fences.map((f, i) =>
          f.draw > 0 ? (
            <line key={i} x1={f.x} y1={f.y + 60} x2={f.x} y2={f.y + 60 - 200 * f.draw} stroke={alpha(C.text, 0.85)} strokeWidth={6} strokeDasharray="14 10" strokeLinecap="round" />
          ) : null,
        )}
        {s.spans.map((sp, i) => (
          <SpanShape key={i} s={sp} />
        ))}
        {s.cracks.map((c, i) =>
          c.draw > 0 ? (
            <g key={i}>
              <polyline
                points={`${c.x - 6},${c.y - 6} ${c.x + 10},${c.y + 8} ${c.x - 8},${c.y + 16} ${c.x + 8},${c.y + 30} ${c.x - 4},${c.y + 44}`}
                fill="none"
                stroke={C.flag}
                strokeWidth={7}
                strokeLinejoin="round"
                strokeDasharray={120}
                strokeDashoffset={120 * (1 - c.draw)}
              />
              {[-1, 1].map((d) => (
                <rect key={d} x={c.x + d * 22 - 6} y={c.y + 36 + 60 * c.draw} width={12} height={10} fill={alpha(C.muted, 0.7)} opacity={c.draw} transform={`rotate(${d * 40 * c.draw} ${c.x} ${c.y})`} />
              ))}
            </g>
          ) : null,
        )}
        {s.barriers.map((b, i) => {
          if (b.opacity <= 0) return null;
          const dir = b.x < 540 ? 1 : -1;
          const angle = -dir * 80 * b.lift;
          return (
            <g key={i} opacity={b.opacity}>
              <rect x={b.x - 8} y={b.y - 96} width={16} height={96} rx={4} fill={C.muted} />
              <g transform={`rotate(${angle} ${b.x} ${b.y - 86})`}>
                <line x1={b.x} y1={b.y - 86} x2={b.x + dir * 200} y2={b.y - 86} stroke={C.text} strokeWidth={14} strokeLinecap="round" />
                <line x1={b.x} y1={b.y - 86} x2={b.x + dir * 200} y2={b.y - 86} stroke={C.flag} strokeWidth={14} strokeDasharray="22 22" />
              </g>
            </g>
          );
        })}
        {s.links.map((l, i) => (
          <LinkShape key={i} l={l} t={t} />
        ))}
        {s.trucks.map((k, i) => (
          <TruckShape key={i} k={k} />
        ))}
        {s.bolts.map((b, i) =>
          b.pop > 0 ? (
            <g key={i} opacity={1 - 0.4 * b.pop}>
              <circle cx={b.x} cy={b.y} r={20 + 50 * b.pop} fill="none" stroke={C.accentText} strokeWidth={6} opacity={1 - b.pop * 0.6} />
              <rect x={b.x - 9} y={b.y - 9} width={18} height={30} rx={4} fill={C.accent} />
            </g>
          ) : null,
        )}
        {s.crews.map((c, i) => (
          <React.Fragment key={i}>
            <HardHat c={c} />
            <Radio c={c} side={c.tone === 'b' ? 1 : -1} t={t} />
          </React.Fragment>
        ))}
        {s.humans.map((h, i) => (
          <HumanShape key={i} h={h} />
        ))}
        {s.sparks.map((sp, i) => (
          <SparkShape key={i} s={sp} small={s.humans.length > 0} />
        ))}
        {s.batons.map((b, i) => (b.opacity > 0 ? <rect key={i} x={b.x - 26} y={b.y - 8} width={52} height={16} rx={8} fill={C.warm} opacity={b.opacity} transform={`rotate(-25 ${b.x} ${b.y})`} /> : null))}
        {s.marks.map((m, i) => (
          <MarkShape key={i} m={m} />
        ))}
        {s.thoughts.map((th, i) =>
          th.opacity > 0 ? (
            <g key={i} opacity={th.opacity}>
              {[0, 1, 2].map((k) => {
                const x = th.tx + 60 - k * 20 + 60;
                const y0 = th.y + 150;
                const y = y0 + (th.ty - y0) * (k / 3 + 0.15);
                return <circle key={k} cx={x} cy={y} r={14 - k * 3} fill={C.card} stroke={alpha(C.muted, 0.8)} strokeWidth={2.5} />;
              })}
            </g>
          ) : null,
        )}
        {s.typing && s.typing.opacity > 0 && (
          <g opacity={s.typing.opacity}>
            {[0, 1, 2].map((k) => (
              <circle key={k} cx={s.typing!.x + k * 20} cy={s.typing!.y} r={6} fill={C.muted} opacity={0.4 + 0.6 * (Math.floor(t * 4 + k) % 3 === 0 ? 1 : 0)} />
            ))}
          </g>
        )}
      </svg>
      {/* Radio messages from A, each received by B. */}
      {s.bubbles.map((b, i) =>
        b.opacity > 0 ? (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: b.x,
              top: b.y,
              width: b.w,
              boxSizing: 'border-box',
              opacity: b.opacity,
              transform: `translateX(${(1 - b.opacity) * -30}px)`,
              padding: '12px 22px',
              borderRadius: '8px 22px 22px 22px',
              background: C.card,
              border: `2px solid ${alpha(C.muted, 0.35)}`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 26, fontWeight: 700, color: C.muted, marginBottom: 4 }}>
              <span>A → B</span>
              <span style={{ color: C.ok, opacity: b.received }}>✓ received</span>
            </div>
            <div style={{ fontSize: 34, fontWeight: 600, color: C.text, whiteSpace: 'nowrap' }}>{b.text}</div>
          </div>
        ) : null,
      )}
      {s.thoughts.map((th, i) =>
        th.opacity > 0 ? (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: th.x,
              top: th.y,
              width: th.w,
              boxSizing: 'border-box',
              opacity: th.opacity,
              padding: '16px 30px',
              borderRadius: 60,
              background: C.card,
              border: `2.5px solid ${alpha(C.muted, 0.8)}`,
              fontSize: 33,
              fontStyle: 'italic',
              fontWeight: 500,
              lineHeight: 1.25,
              color: C.text,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 24, fontStyle: 'normal', fontWeight: 700, color: C.muted, marginBottom: 4 }}>B, thinking</div>
            {th.text}
          </div>
        ) : null,
      )}
      {s.tags.map((g, i) => (
        <TagView key={i} g={g} />
      ))}
      {s.ladder && <LadderView l={s.ladder} />}
      {s.paper && <PaperView p={s.paper} />}
      {s.stamp && s.stamp.pop > 0 && (
        <div
          style={{
            position: 'absolute',
            left: s.stamp.x,
            top: s.stamp.y,
            transform: `translate(-50%, -50%) rotate(-6deg) scale(${interpolate(s.stamp.pop, [0, 1], [1.35, 1])})`,
            opacity: Math.min(1, s.stamp.pop * 1.4) * (s.stamp.fade ?? 1),
            padding: '18px 40px',
            border: `8px solid ${C.accentText}`,
            borderRadius: 22,
            background: alpha(C.bg0, 0.92),
            boxShadow: `0 0 60px ${alpha(C.accent, 0.45)}`,
            textAlign: 'center',
            fontSize: 84,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '0.02em',
            color: C.text,
            whiteSpace: 'nowrap',
          }}
        >
          {s.stamp.lines.map((l, i) => (
            <div key={i} style={i === 1 ? { color: C.accentText } : undefined}>
              {l}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/** The paper card (scene 2): what the benchmark is, its reading, and the "by design" stamp. */
const PaperView: React.FC<{ p: NonNullable<ReturnType<typeof frameState>['paper']> }> = ({ p }) => {
  if (p.appear <= 0) return null;
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: 90,
          top: 300,
          width: 900,
          boxSizing: 'border-box',
          padding: '40px 48px 44px',
          borderRadius: 30,
          background: C.card,
          border: `3px solid ${alpha(C.text, 0.18)}`,
          boxShadow: `0 20px 60px ${alpha(C.bg0, 0.7)}`,
          opacity: p.appear,
          transform: `translateY(${(1 - p.appear) * 40}px)`,
        }}
      >
        <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: '0.12em', color: C.muted }}>BENCHMARK · STANFORD, 2026</div>
        <div style={{ fontSize: 84, fontWeight: 800, letterSpacing: '-0.02em', marginTop: 6 }}>CooperBench</div>
        <div style={{ fontSize: 40, fontWeight: 500, fontStyle: 'italic', color: alpha(C.text, 0.85), lineHeight: 1.25, marginTop: 10 }}>
          “Why Coding Agents Cannot be Your Teammates Yet”
        </div>
        <div style={{ display: 'inline-block', marginTop: 28, padding: '10px 24px', borderRadius: 40, border: `3px solid ${C.flag}`, color: C.flag, fontSize: 38, fontWeight: 700, opacity: p.chip, transform: `scale(${interpolate(p.chip, [0, 1], [0.85, 1])})`, transformOrigin: 'left center' }}>
          missing: social intelligence
        </div>
      </div>
      {p.stamp > 0 && (
        <div
          style={{
            position: 'absolute',
            left: 540,
            top: 770,
            transform: `translate(-50%, -50%) rotate(-5deg) scale(${interpolate(p.stamp, [0, 1], [1.35, 1])})`,
            opacity: Math.min(1, p.stamp * 1.4),
            padding: '14px 34px',
            border: `7px solid ${C.warm}`,
            borderRadius: 18,
            background: alpha(C.bg0, 0.92),
            color: C.warm,
            fontSize: 60,
            fontWeight: 800,
            letterSpacing: '0.04em',
            lineHeight: 1.08,
            textAlign: 'center',
            whiteSpace: 'nowrap',
          }}
        >
          ALMOST NO PROCESS
          <br />· BY DESIGN ·
        </div>
      )}
      <div style={{ position: 'absolute', left: 90, width: 900, top: 900, textAlign: 'center', fontSize: 32, fontWeight: 500, color: C.muted, opacity: p.foot }}>
        a legitimate choice: it measures raw coordination
      </div>
    </>
  );
};
