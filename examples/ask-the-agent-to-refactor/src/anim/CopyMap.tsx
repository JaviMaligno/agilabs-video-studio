// CopyMap: the file map with copies of one rule, the search beam, the lint scanner, the tape, the
// fold into one shared card and the rule-change pulses. State in CopyMap.state.ts.
import React from 'react';
import { C, GRADIENT, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import { Stage, gradientText } from './Stage.tsx';
import type { AnimProps } from './types.ts';
import code from '../data/code.json';
import {
  BLOCKS,
  CARDS,
  CHIP,
  MAP_H,
  MAP_W,
  MISSED_AFTER,
  MISSED_BEFORE,
  SHARED_Y,
  frameState,
  type CopyMapProps,
  type FrameState,
  type LaneState,
  type Placement,
} from './CopyMap.state.ts';

const MONO = "ui-monospace, Menlo, 'SF Mono', monospace";
const clamp01 = (x: number) => (Number.isFinite(x) ? Math.min(1, Math.max(0, x)) : 0);
const mix = (a: number, b: number, p: number) => a + (b - a) * clamp01(p);
const FILES = code.files as Record<string, string>;
const SHARED_W = 520;

// ---------------------------------------------------------------- small pieces

const Pill: React.FC<{ children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties; filled?: boolean }> = ({
  children,
  color = C.accentText,
  size = 34,
  style,
  filled,
}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 12,
      padding: `${size * 0.32}px ${size * 0.62}px`,
      borderRadius: size,
      border: `3px solid ${color}`,
      background: filled ? alpha(color, 0.18) : alpha(C.bg0, 0.85),
      color,
      fontFamily,
      fontWeight: 700,
      fontSize: size,
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    {children}
  </div>
);

const Lock: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block', flex: 'none' }}>
    <rect x="4.5" y="10.5" width="15" height="11" rx="2.5" fill={color} />
    <path d="M8 10.5 V7.5 a4 4 0 0 1 8 0 V10.5" fill="none" stroke={color} strokeWidth="2.6" />
  </svg>
);

/** A grid band: the duplication scanner. */
const scannerBg = (on: number): React.CSSProperties => ({
  backgroundImage: `linear-gradient(${alpha(C.accentText, 0.35 * on)} 2px, transparent 2px), linear-gradient(90deg, ${alpha(C.accentText, 0.35 * on)} 2px, transparent 2px)`,
  backgroundSize: '28px 28px',
  backgroundColor: alpha(C.accent, 0.12 * on),
});

// ---------------------------------------------------------------- the map

const chipColours = (fresh: number, stale: number, lit: number) => {
  const base = fresh > 0.5 ? C.ok : C.old;
  const border = stale > 0.05 ? C.flag : lit > 0.05 ? C.accent2 : base;
  return { base, border };
};

const MapView: React.FC<{ p: Placement; big?: boolean }> = ({ p, big }) => {
  const l: LaneState = p.lane;
  const s = p.s;
  const closedCard = (i: number) => (i === 3 ? mix(CARDS[3].h, 64, l.closed) : CARDS[i].h);
  return (
    <div style={{ position: 'absolute', left: p.x, top: p.y, width: MAP_W * s, height: MAP_H * s, opacity: p.opacity }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: MAP_W, height: MAP_H, transform: `scale(${s})`, transformOrigin: '0 0' }}>
        {/* File cards */}
        {CARDS.map((c, i) => {
          const tmpl = i === 3;
          const fresh = tmpl ? l.blocks[3].fresh : 0;
          const h = closedCard(i);
          const glow = i === 0 ? l.sharedGlow : 0;
          return (
            <div
              key={c.id}
              style={{
                position: 'absolute',
                left: 0,
                top: c.y,
                width: MAP_W,
                height: h,
                borderRadius: 18,
                background: C.pane,
                border: `3px solid ${tmpl && l.closed > 0.5 && fresh > 0.5 ? C.ok : glow > 0.05 ? C.accent2 : C.line}`,
                boxShadow: glow > 0 ? `0 0 ${40 * glow}px ${alpha(C.accent2, 0.55 * glow)}` : undefined,
                overflow: 'hidden',
              }}
            >
              <div style={{ height: 54, display: 'flex', alignItems: 'center', gap: 14, paddingLeft: 22, borderBottom: `2px solid ${C.line}`, background: alpha(C.card, 0.8) }}>
                <div style={{ fontFamily: MONO, fontSize: 28, color: i === 0 ? C.accentText : C.muted }}>{FILES[c.id]}</div>
                {tmpl && l.closed > 0 && (
                  <div style={{ marginLeft: 'auto', marginRight: 22, display: 'flex', alignItems: 'center', gap: 10, opacity: l.closed }}>
                    <Lock size={30} color={fresh > 0.5 ? C.ok : C.muted} />
                    <div style={{ fontFamily, fontSize: 28, fontWeight: 600, color: fresh > 0.5 ? C.ok : C.muted }}>never opened</div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Threads from the shared function to every call site */}
        {l.threads > 0 && (
          <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} width={MAP_W} height={MAP_H}>
            {BLOCKS.map((b, i) => {
              if (l.blocks[i].fold < 0.5) return null;
              const y = i === 3 && l.closed > 0.5 ? CARDS[3].y + 30 : b.y + CHIP.h / 2;
              const len = y - SHARED_Y + 40;
              const fresh = l.blocks[i].fresh;
              const stale = l.blocks[i].stale;
              return (
                <path
                  key={i}
                  d={`M 40 ${SHARED_Y + CHIP.h / 2} H 18 V ${y} H 40`}
                  fill="none"
                  stroke={stale > 0.05 ? C.flag : fresh > 0.5 ? C.ok : alpha(C.accentText, 0.75)}
                  strokeWidth={5}
                  strokeDasharray={`${len * l.threads} ${len + 10}`}
                />
              );
            })}
          </svg>
        )}

        {/* Call sites left behind by the fold */}
        {BLOCKS.map((b, i) => {
          const blk = l.blocks[i];
          if (blk.fold <= 0) return null;
          if (i === 3 && l.closed > 0.5) return null;
          const fresh = blk.fresh > 0.5;
          const stale = blk.stale;
          return (
            <div
              key={`call${i}`}
              style={{
                position: 'absolute',
                left: CHIP.x,
                top: b.y,
                height: CHIP.h,
                padding: '0 22px',
                display: 'flex',
                alignItems: 'center',
                borderRadius: 12,
                border: `3px dashed ${stale > 0.05 ? C.flag : fresh ? C.ok : alpha(C.accentText, 0.7)}`,
                fontFamily: MONO,
                fontSize: 30,
                color: fresh ? C.ok : C.accentText,
                opacity: clamp01(blk.fold * 1.4 - 0.4) * (i === 3 ? 1 - l.closed : 1),
                boxShadow: stale > 0.05 ? `0 0 ${30 * stale}px ${alpha(C.flag, 0.7 * stale)}` : undefined,
              }}
            >
              {code.call}
            </div>
          );
        })}

        {/* The shared function */}
        {l.shared > 0 && (
          <div
            style={{
              position: 'absolute',
              left: CHIP.x,
              top: SHARED_Y,
              width: SHARED_W,
              height: CHIP.h,
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              paddingLeft: 22,
              fontFamily: MONO,
              fontSize: 32,
              fontWeight: 700,
              color: l.sharedFresh > 0.5 ? C.ok : C.text,
              background: alpha(l.sharedFresh > 0.5 ? C.ok : C.accent, 0.2),
              border: `3px solid ${l.sharedFresh > 0.5 ? C.ok : C.accent2}`,
              opacity: l.shared,
              transform: `scale(${0.9 + 0.1 * l.shared})`,
              transformOrigin: 'left center',
              boxShadow: `0 0 ${10 + 30 * l.sharedGlow}px ${alpha(l.sharedFresh > 0.5 ? C.ok : C.accent2, 0.35 + 0.4 * l.sharedGlow)}`,
            }}
          >
            {code.shared}
          </div>
        )}

        {/* The copy blocks (flying when they fold) */}
        {BLOCKS.map((b, i) => {
          const blk = l.blocks[i];
          if (blk.fold >= 1) return null;
          if (i === 3 && l.closed > 0.98) return null;
          const f = blk.fold;
          const y = mix(b.y, SHARED_Y, f);
          const x = CHIP.x + Math.sin(Math.PI * f) * 150;
          const w = mix(CHIP.w, SHARED_W, f);
          const lift = 1 + 0.08 * Math.sin(Math.PI * f);
          const { base, border } = chipColours(blk.fresh, blk.stale, blk.lit);
          const lit = blk.lit;
          const stale = blk.stale;
          return (
            <div
              key={`copy${i}`}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                width: w,
                height: CHIP.h,
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                paddingLeft: 22,
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                fontFamily: MONO,
                fontSize: 31,
                color: stale > 0.05 ? C.text : C.text,
                background: stale > 0.05 ? alpha(C.flag, 0.12 + 0.3 * stale) : alpha(base, 0.16 + 0.14 * lit),
                borderLeft: `10px solid ${stale > 0.05 ? C.flag : base}`,
                outline: `3px solid ${alpha(border, 0.5 + 0.5 * Math.max(lit, stale, blk.ring))}`,
                boxShadow: `0 0 ${36 * Math.max(lit, stale, blk.ring * 0.8)}px ${alpha(stale > 0.05 ? C.flag : C.accent2, 0.75 * Math.max(lit, stale, blk.ring))}`,
                transform: `scale(${lift})`,
                transformOrigin: 'left center',
                opacity: (1 - clamp01((f - 0.82) / 0.18)) * (i === 3 ? 1 - l.closed : 1),
                zIndex: f > 0 ? 5 : 1,
              }}
            >
              {i === 3 ? code.template : code.copy}
            </div>
          );
        })}

        {/* The jscpd ignore tape */}
        {l.tape > 0 && (
          <div
            style={{
              position: 'absolute',
              left: 30,
              top: 532,
              width: 900,
              height: 74,
              background: C.note,
              color: C.ink,
              fontFamily: MONO,
              fontWeight: 700,
              fontSize: 38,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 8px 24px ${alpha(C.bg0, 0.7)}`,
              opacity: l.tape,
              transform: `rotate(-4deg) scale(${1.35 - 0.35 * l.tape})`,
              zIndex: 7,
            }}
          >
            // jscpd:ignore-start
          </div>
        )}

        {/* Rule-change pulse */}
        {l.pulseOn > 0 && (
          <div
            style={{
              position: 'absolute',
              left: -10,
              top: l.pulseY - 4,
              width: MAP_W + 20,
              height: 8,
              borderRadius: 4,
              background: C.ok,
              boxShadow: `0 0 28px ${alpha(C.ok, 0.9)}`,
              opacity: l.pulseOn,
              zIndex: 8,
            }}
          />
        )}

        {/* Duplication scanner */}
        {l.scannerOn > 0 && (
          <div
            style={{
              position: 'absolute',
              left: -10,
              top: l.scannerY - 45,
              width: MAP_W + 20,
              height: 90,
              borderTop: `4px solid ${C.accentText}`,
              borderBottom: `4px solid ${C.accentText}`,
              opacity: l.scannerOn,
              zIndex: 9,
              ...scannerBg(1),
            }}
          >
            <div style={{ position: 'absolute', right: 16, top: -50, fontFamily, fontWeight: 700, fontSize: 30, color: C.accentText }}>lint: jscpd</div>
          </div>
        )}

        {/* Search beam */}
        {l.beamOn > 0 && (
          <>
            {l.beamWide > 0 && (
              <div
                style={{
                  position: 'absolute',
                  left: -10,
                  top: l.beamY - 80 * l.beamWide,
                  width: MAP_W + 20,
                  height: 160 * l.beamWide,
                  background: `linear-gradient(180deg, transparent, ${alpha(C.accent2, 0.28)}, transparent)`,
                  opacity: l.beamOn,
                  zIndex: 9,
                }}
              />
            )}
            <div
              style={{
                position: 'absolute',
                left: -10,
                top: l.beamY - 3,
                width: MAP_W + 20,
                height: 6,
                background: GRADIENT,
                boxShadow: `0 0 30px ${alpha(C.accent2, 0.95)}`,
                opacity: l.beamOn,
                zIndex: 10,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: MAP_W - 4,
                top: l.beamY - 22,
                width: 22,
                height: 44,
                borderRadius: 4,
                background: C.accentText,
                opacity: l.beamOn,
                zIndex: 10,
              }}
            />
            {l.counterOn > 0 && big && (
              <div
                style={{
                  position: 'absolute',
                  left: MAP_W - 110,
                  top: l.beamY - 96,
                  width: 84,
                  height: 84,
                  borderRadius: 42,
                  background: GRADIENT,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily,
                  fontWeight: 800,
                  fontSize: 54,
                  color: C.text,
                  opacity: l.counterOn,
                  zIndex: 11,
                }}
              >
                {l.counter}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const LaneLabel: React.FC<{ p: Placement; dy?: number; size?: number }> = ({ p, dy = 58, size = 32 }) =>
  p.label && p.labelOn > 0 ? (
    <div style={{ position: 'absolute', left: p.x - 30, width: MAP_W * p.s + 60, top: p.y - dy, display: 'flex', justifyContent: 'center', opacity: p.labelOn }}>
      <div style={{ fontFamily, fontWeight: 700, fontSize: size, color: C.text }}>{p.label}</div>
    </div>
  ) : null;

// ---------------------------------------------------------------- overlays

const Code: React.FC<{ parts: [string, 'plain' | 'good' | 'bad'][] }> = ({ parts }) => (
  <div style={{ fontFamily: MONO, fontSize: 44, fontWeight: 600, whiteSpace: 'pre', color: C.text }}>
    {parts.map(([txt, kind], i) => (
      <span
        key={i}
        style={
          kind === 'plain'
            ? undefined
            : { color: kind === 'good' ? C.ok : C.flag, textDecoration: 'underline', textDecorationThickness: 5, textUnderlineOffset: 10, fontWeight: 800 }
        }
      >
        {txt}
      </span>
    ))}
  </div>
);

const Compare: React.FC<{ s: FrameState['compare'] }> = ({ s }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, top: 640, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, opacity: s.opacity }}>
    <div style={{ fontFamily, fontSize: 32, fontWeight: 600, color: C.muted }}>the three it found</div>
    <Code parts={[['Math.round(', 'plain'], ['(', 'good'], ['num1 + num2', 'plain'], [')', 'good'], [' / 2)', 'plain']]} />
    <div style={{ opacity: s.second, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, marginTop: 26 }}>
      <div style={{ fontFamily, fontSize: 32, fontWeight: 600, color: C.muted }}>the template's copy</div>
      <Code parts={[['Math.round(', 'plain'], ['num1 + num2', 'plain'], [')', 'bad'], [' / 2', 'plain']]} />
    </div>
    <div style={{ marginTop: 22, opacity: s.tag, transform: `scale(${0.85 + 0.15 * s.tag})` }}>
      <Pill color={C.flag} size={36} filled>
        written differently
      </Pill>
    </div>
  </div>
);

const QUOTE: { w: string; em?: boolean }[] = [
  { w: '“use' },
  { w: 'MORE', em: true },
  { w: 'abstractions', em: true },
  { w: 'in' },
  { w: 'the' },
  { w: 'AI' },
  { w: 'age …' },
  { w: '(combined' },
  { w: 'with' },
  { w: 'harsh', em: true },
  { w: 'lint', em: true },
  { w: 'rules)”' },
];

const Quote: React.FC<{ s: FrameState['quote'] }> = ({ s }) => (
  <div style={{ position: 'absolute', left: 30, right: 30, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 44, opacity: s.opacity }}>
    <div style={{ fontFamily, fontSize: 74, fontWeight: 800, lineHeight: 1.22, textAlign: 'center', letterSpacing: '-0.01em' }}>
      {QUOTE.map((q, i) => (
        <React.Fragment key={i}>
          {i > 0 ? ' ' : null}
          {i === 3 || i === 7 || i === 9 ? <br /> : null}
          <span
            style={{
              opacity: s.words[i] ?? 1,
              color: q.em ? (s.emphasis > 0.5 ? C.accentText : C.text) : C.text,
              textDecoration: q.em && s.emphasis > 0.5 ? 'underline' : undefined,
              textDecorationColor: C.accent2,
              textDecorationThickness: 6,
              textUnderlineOffset: 12,
            }}
          >
            {q.w}
          </span>
        </React.Fragment>
      ))}
    </div>
    <div style={{ fontFamily, fontSize: 44, fontWeight: 600, color: C.muted, opacity: s.attribution }}>Matt Pocock</div>
  </div>
);

const Pips: React.FC<{ x: number; y: number; t0?: number; size?: number; labels?: boolean }> = ({ x, y, t0 = 0, size = 46, labels = true }) => {
  const items = [...(t0 > 0 ? ['T0'] : []), 'T1', 'T2', 'T3', 'T4'];
  const gap = 10;
  const w = items.length * size + (items.length - 1) * gap;
  return (
    <div style={{ position: 'absolute', left: x - w / 2, top: y, display: 'flex', gap }}>
      {items.map((it) => (
        <div
          key={it}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            border: `3px solid ${it === 'T0' ? C.old : C.muted}`,
            background: it === 'T0' ? alpha(C.old, 0.85 * t0) : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily,
            fontWeight: 700,
            fontSize: size * 0.42,
            color: it === 'T0' ? C.ink : C.muted,
            opacity: it === 'T0' ? t0 : 1,
          }}
        >
          {labels ? it : null}
        </div>
      ))}
    </div>
  );
};

const Note: React.FC<{ size?: number; style?: React.CSSProperties }> = ({ size = 34, style }) => (
  <div
    style={{
      background: C.note,
      color: C.ink,
      fontFamily,
      fontWeight: 700,
      fontSize: size,
      padding: `${size * 0.5}px ${size * 0.7}px`,
      borderRadius: 6,
      boxShadow: `0 10px 26px ${alpha(C.bg0, 0.7)}`,
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    Do not copy logic…
  </div>
);

const AgentsCard: React.FC<{ w: number; h: number; note: number; size?: number }> = ({ w, h, note, size = 34 }) => (
  <div style={{ position: 'relative', width: w, height: h, borderRadius: 16, background: C.pane, border: `3px solid ${C.line}` }}>
    <div style={{ height: 50, display: 'flex', alignItems: 'center', paddingLeft: 18, borderBottom: `2px solid ${C.line}`, fontFamily: MONO, fontSize: 28, color: C.muted }}>AGENTS.md</div>
    {[0.7, 0.45, 0.6].map((f, i) => (
      <div key={i} style={{ margin: '16px 18px 0', height: 12, width: `${f * 100}%`, borderRadius: 6, background: alpha(C.muted, 0.18) }} />
    ))}
    <div style={{ position: 'absolute', left: '50%', top: h * 0.42, opacity: note, transform: `translateX(-50%) rotate(-4deg) scale(${1.3 - 0.3 * note})` }}>
      <Note size={size} />
    </div>
  </div>
);

const Levers: React.FC<{ s: FrameState['levers'] }> = ({ s }) => {
  const rows = [
    { name: 'Rule', sub: 'one line in AGENTS.md' },
    { name: 'Lint', sub: 'a duplication check' },
    { name: 'Refactor request', sub: 'a step T0 first' },
  ];
  return (
    <>
      {rows.map((r, i) => {
        const a = s.appear[i];
        const p = s.play[i];
        const top = 30 + i * 345;
        return (
          <div
            key={r.name}
            style={{
              position: 'absolute',
              left: 0,
              top,
              width: 960,
              height: 315,
              borderRadius: 24,
              background: alpha(C.card, 0.75),
              border: `2px solid ${C.line}`,
              opacity: a,
              transform: `translateY(${(1 - a) * 40}px)`,
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', left: 36, top: 0, bottom: 0, width: 360, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12 }}>
              <div style={{ fontFamily, fontWeight: 800, fontSize: i === 2 ? 50 : 60, color: i === 2 ? C.old : C.text, lineHeight: 1.05 }}>{r.name}</div>
              <div style={{ fontFamily, fontWeight: 500, fontSize: 32, color: C.muted }}>{r.sub}</div>
            </div>
            <div style={{ position: 'absolute', left: 420, top: 28, width: 510, height: 260 }}>
              {i === 0 && <AgentsCard w={510} h={260} note={clamp01(p * 3)} />}
              {i === 1 && (
                <div style={{ position: 'relative', width: 510, height: 260 }}>
                  {[0, 1, 2].map((k) => {
                    const y = 22 + k * 80;
                    const boxed = k < 2 && p * 260 > y + 30;
                    return (
                      <div
                        key={k}
                        style={{
                          position: 'absolute',
                          left: 10,
                          top: y,
                          width: k === 2 ? 380 : 470,
                          height: 54,
                          borderRadius: 10,
                          background: alpha(C.old, 0.18),
                          borderLeft: `8px solid ${C.old}`,
                          outline: boxed ? `4px dashed ${C.flag}` : undefined,
                          outlineOffset: 6,
                        }}
                      />
                    );
                  })}
                  <div style={{ position: 'absolute', left: -10, width: 530, top: -30 + p * 290, height: 64, borderTop: `4px solid ${C.accentText}`, borderBottom: `4px solid ${C.accentText}`, opacity: p > 0 && p < 1 ? 1 : 0, ...scannerBg(1) }} />
                </div>
              )}
              {i === 2 && (
                <div style={{ position: 'relative', width: 510, height: 260 }}>
                  <Pips x={255} y={170} t0={clamp01(p * 2.5)} size={62} />
                  <div style={{ position: 'absolute', left: 0, right: 0, top: 36, display: 'flex', justifyContent: 'center', opacity: clamp01(p * 2.5 - 0.6) }}>
                    <Pill color={C.old} size={36}>
                      “make it live in one place”
                    </Pill>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
};

const DIFF_LINES = code.diff as string[];

const DiffBg: React.FC<{ on: number; scroll: number }> = ({ on, scroll }) => {
  const lineH = 52;
  const total = DIFF_LINES.length * lineH;
  const off = scroll % total;
  const rows = [...DIFF_LINES, ...DIFF_LINES, ...DIFF_LINES];
  return (
    <div style={{ position: 'absolute', left: -40, right: -40, top: 0, bottom: 0, overflow: 'hidden', opacity: 0.07 * on }}>
      <div style={{ transform: `translateY(${-off}px)` }}>
        {rows.map((r, i) => (
          <div key={i} style={{ height: lineH, fontFamily: MONO, fontSize: 30, whiteSpace: 'nowrap', color: r.startsWith('+') ? C.ok : C.flag }}>
            {r}
          </div>
        ))}
      </div>
    </div>
  );
};

const Ticks: React.FC<{ vals: number[]; missed: number[]; x: number; y: number }> = ({ vals, missed, x, y }) => (
  <div style={{ position: 'absolute', left: x, top: y, display: 'flex', gap: 14 }}>
    {vals.map((v, i) => {
      const bad = missed.includes(i);
      return (
        <div
          key={i}
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            border: `3px solid ${alpha(C.muted, 0.35)}`,
            background: v > 0 ? alpha(bad ? C.flag : C.ok, bad ? 0.9 : 0.45) : 'transparent',
            boxShadow: v > 0 && bad ? `0 0 18px ${alpha(C.flag, 0.8)}` : undefined,
            transform: `scale(${0.8 + 0.2 * v})`,
          }}
        />
      );
    })}
  </div>
);

// ---------------------------------------------------------------- the component

export const CopyMap: React.FC<AnimProps & CopyMapProps> = ({ t, beats, dur, vertical, ...props }) => {
  const s = frameState(props, t, beats, dur);
  const big = s.maps.length === 1;
  return (
    <Stage vertical={vertical} fill>
      {s.search.diff > 0 && <DiffBg on={s.search.diff} scroll={s.search.scroll} />}

      {s.maps.map((p, i) => (
        <MapView key={i} p={p} big={big || (s.mode === 'fold' && i === 1)} />
      ))}
      {s.maps.map((p, i) => (
        <LaneLabel key={`l${i}`} p={p} dy={s.mode === 'fold' ? 54 : 58} size={s.mode === 'fold' && i !== 1 ? 30 : 34} />
      ))}

      {/* Hook title, drawn from frame 0 */}
      {s.title.opacity > 0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 210, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{ fontFamily, fontSize: 74, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em', color: C.text }}>
            Codex merged <span style={gradientText}>three copies</span> of a rule.
          </div>
        </div>
      )}
      {(s.mode === 'hook' || s.mode === 'miss') && s.hook.tests + s.hook.stamp > 0 && (
        <>
          <div style={{ position: 'absolute', left: 610, top: 262, opacity: s.hook.tests, transform: `translateY(${(1 - s.hook.tests) * -30}px)` }}>
            <Pill color={C.ok} size={46} filled>
              tests ✓
            </Pill>
          </div>
          <div
            style={{
              position: 'absolute',
              left: 600,
              top: 330,
              opacity: s.hook.stamp,
              transform: `rotate(-9deg) scale(${s.mode === 'miss' ? 1 : 1.8 - 0.8 * s.hook.stamp})`,
              transformOrigin: 'center',
            }}
          >
            <div style={{ padding: '10px 28px', border: `6px solid ${C.flag}`, borderRadius: 14, color: C.flag, background: alpha(C.bg0, 0.9), fontFamily, fontWeight: 900, fontSize: 62, letterSpacing: '0.04em' }}>
              STEP ✗
            </div>
          </div>
        </>
      )}

      {s.compare.opacity > 0 && <Compare s={s.compare} />}
      {s.quote.opacity > 0 && <Quote s={s.quote} />}

      {s.question.pop > 0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 120, height: 760, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: s.question.pop }}>
          <div style={{ ...gradientText, fontFamily, fontWeight: 900, fontSize: 460, lineHeight: 1, transform: `scale(${0.6 + 0.4 * s.question.pop})`, filter: `drop-shadow(0 0 40px ${alpha(C.accent2, 0.6)})` }}>?</div>
        </div>
      )}

      {s.mode === 'lanes' && (
        <>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ opacity: s.chains.pips }}>
              <Pips x={160 + i * 320} y={545} size={50} />
            </div>
          ))}
          <div style={{ position: 'absolute', left: 0, right: 0, top: 680, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: s.chains.appear }}>
            <div style={{ ...gradientText, fontFamily, fontWeight: 900, fontSize: 190, lineHeight: 1 }}>{s.chains.value}</div>
            <div style={{ fontFamily, fontWeight: 600, fontSize: 48, color: C.muted, marginTop: 8 }}>task chains</div>
          </div>
        </>
      )}

      {s.mode === 'levers' && <Levers s={s.levers} />}

      {s.mode === 'lanes-rule-lint' && (
        <>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ position: 'absolute', left: 160 + i * 320 - 150, width: 300, top: 108, display: 'flex', justifyContent: 'center', gap: 10 }}>
              <div style={{ background: C.note, color: C.ink, fontFamily, fontWeight: 700, fontSize: 24, padding: '6px 12px', borderRadius: 4, transform: 'rotate(-3deg)' }}>rule</div>
              <div style={{ border: `3px solid ${C.accentText}`, color: C.accentText, fontFamily, fontWeight: 700, fontSize: 24, padding: '4px 12px', borderRadius: 6, ...scannerBg(0.6) }}>lint</div>
            </div>
          ))}
          {[0, 1, 2].map((i) => (
            <div key={`m${i}`} style={{ position: 'absolute', left: 160 + i * 320 - 150, width: 300, top: 545, display: 'flex', justifyContent: 'center', opacity: s.helped.marks }}>
              {i === 0 ? (
                <Pill color={C.ok} size={34} filled>
                  ✓ helped
                </Pill>
              ) : (
                <Pill color={C.muted} size={30}>
                  no change
                </Pill>
              )}
            </div>
          ))}
          <div style={{ position: 'absolute', left: 0, right: 0, top: 690, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: s.helped.chip }}>
            <div style={{ ...gradientText, fontFamily, fontWeight: 900, fontSize: 170, lineHeight: 1 }}>1 / 3</div>
            <div style={{ fontFamily, fontWeight: 600, fontSize: 42, color: C.muted, marginTop: 10 }}>agents helped</div>
          </div>
        </>
      )}

      {s.mode === 'lint-dodge' && (
        <>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 40, display: 'flex', justifyContent: 'center', opacity: s.dodge.header }}>
            <Pill size={38}>GPT-6 Luna · lint on</Pill>
          </div>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 940, display: 'flex', justifyContent: 'center', gap: 24 }}>
            <div style={{ opacity: s.dodge.lintOk }}>
              <Pill color={C.ok} size={42} filled>
                lint ✓
              </Pill>
            </div>
            <div style={{ opacity: s.dodge.tag }}>
              <Pill color={C.muted} size={42}>
                in 4 steps
              </Pill>
            </div>
          </div>
        </>
      )}

      {s.mode === 'fold' && (
        <>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 36, display: 'flex', justifyContent: 'center', opacity: s.fold.banner }}>
            <div style={{ boxShadow: `0 0 ${60 * s.fold.flash}px ${alpha(C.old, 0.9 * s.fold.flash)}`, borderRadius: 50 }}>
              <Pill color={C.old} size={40} filled>
                T0 · “make it live in one place”
              </Pill>
            </div>
          </div>
          <div style={{ position: 'absolute', right: 0, top: 850, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, opacity: s.fold.gain }}>
            <Pill size={40} color={C.accentText}>
              +0.35 to +0.47 of 5
            </Pill>
            <div style={{ fontFamily, fontWeight: 500, fontSize: 30, color: C.muted, marginRight: 10 }}>maintainability score, per agent</div>
          </div>
        </>
      )}

      {(s.mode === 'search' || s.mode === 'propagate') && s.search.header > 0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 40, display: 'flex', justifyContent: 'center', opacity: s.search.header }}>
          <Pill size={38}>GPT-6 Luna · after T0</Pill>
        </div>
      )}
      {s.mode === 'search' && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 950, display: 'flex', justifyContent: 'center', opacity: s.search.found }}>
          <Pill color={C.ok} size={42} filled>
            4th copy found
          </Pill>
        </div>
      )}
      {s.mode === 'propagate' && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 950, display: 'flex', justifyContent: 'center', opacity: s.lock.tag }}>
          <div style={{ borderRadius: 50, boxShadow: `0 0 ${50 * s.lock.ring}px ${alpha(C.ok, 0.8 * s.lock.ring)}` }}>
            <Pill color={s.lock.ring > 0.3 ? C.ok : C.muted} size={42}>
              <Lock size={40} color={s.lock.ring > 0.3 ? C.ok : C.muted} />
              never opened, still updated
            </Pill>
          </div>
        </div>
      )}

      {s.mode === 'miss-rate' && (
        <div style={{ opacity: s.rate.appear }}>
          <div style={{ position: 'absolute', left: 0, top: 600, width: 290, fontFamily, fontWeight: 600, fontSize: 34, color: s.rate.pass ? C.muted : C.text, textAlign: 'right' }}>before refactor</div>
          <Ticks vals={s.rate.before} missed={MISSED_BEFORE} x={320} y={596} />
          <div style={{ position: 'absolute', left: 0, top: 690, width: 290, fontFamily, fontWeight: 600, fontSize: 34, color: s.rate.pass ? C.text : C.muted, textAlign: 'right' }}>after refactor</div>
          <Ticks vals={s.rate.after} missed={MISSED_AFTER} x={320} y={686} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: 790, display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 30, fontFamily, fontWeight: 900, fontSize: 170, lineHeight: 1 }}>
            <span style={{ color: s.rate.second > 0 ? C.muted : C.flag, opacity: s.rate.first, fontSize: s.rate.second > 0 ? mix(170, 110, s.rate.second) : 170 }}>33%</span>
            {s.rate.second > 0 && (
              <>
                <span style={{ color: C.muted, fontSize: 90, opacity: s.rate.second }}>→</span>
                <span style={{ color: C.ok, opacity: s.rate.second }}>12%</span>
              </>
            )}
          </div>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 985, textAlign: 'center', fontFamily, fontWeight: 600, fontSize: 36, color: C.muted, opacity: s.rate.first }}>
            Codex · rule steps that missed a copy
          </div>
        </div>
      )}

      {s.mode === 'close' && (
        <>
          <div style={{ position: 'absolute', left: 150, top: 100, opacity: s.close.note * (1 - 0.6 * s.close.strike) }}>
            <AgentsCard w={660} h={290} note={s.close.note} size={44} />
          </div>
          {s.close.strike > 0 && (
            <div style={{ position: 'absolute', left: 170, top: 270, width: 620 * s.close.strike, height: 10, borderRadius: 5, background: C.flag, transform: 'rotate(-6deg)', transformOrigin: 'left center' }} />
          )}
          <div
            style={{
              position: 'absolute',
              left: 60,
              right: 60,
              top: 470,
              borderRadius: 26,
              padding: '30px 36px',
              background: alpha(C.old, 0.08 + 0.1 * s.close.bright),
              border: `4px solid ${alpha(C.old, 0.4 + 0.6 * s.close.bright)}`,
              boxShadow: `0 0 ${50 * s.close.bright}px ${alpha(C.old, 0.45 * s.close.bright)}`,
              opacity: s.close.t0,
              transform: `translateY(${(1 - s.close.t0) * 30}px)`,
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
              fontFamily,
            }}
          >
            <div style={{ fontWeight: 800, fontSize: 36, color: C.old, letterSpacing: '0.04em' }}>T0 · REFACTOR REQUEST</div>
            <div style={{ fontWeight: 800, fontSize: 54, color: C.text }}>make it live in one place</div>
            <div style={{ fontWeight: 800, fontSize: 54, color: C.ok, opacity: s.close.keep }}>keep: what must differ</div>
          </div>
          <div style={{ position: 'absolute', left: 0, right: 0, justifyContent: 'center', top: 870, display: 'flex', alignItems: 'center', gap: 0, opacity: s.close.notch }}>
            <div style={{ padding: '18px 26px', fontFamily: MONO, fontWeight: 700, fontSize: 36, color: C.text, background: alpha(C.accent, 0.2), border: `3px solid ${C.accent2}`, borderRadius: '14px 0 0 14px' }}>
              {code.shared}
            </div>
            <div style={{ padding: '18px 20px', fontFamily, fontWeight: 700, fontSize: 30, color: C.ink, background: C.ok, borderRadius: '0 14px 14px 0', border: `3px solid ${C.ok}` }}>
              exception kept
            </div>
          </div>
        </>
      )}
    </Stage>
  );
};
