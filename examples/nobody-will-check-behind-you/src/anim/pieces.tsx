// Drawing pieces for this video: the series' terminal pane, package box and registry shelf (from
// "What Coding Agents Say to Each Other" / "It Was Never the Restriction"), plus this video's own:
// the agent chip, ticket cards and the inbox badge that bury it, the brief card with its ownership
// slot, the "owner: you" name tag, stamps, tags and dots. Brand tokens only, Inter + system mono.
import React from 'react';
import { Img, staticFile } from 'remotion';
import { C, GRADIENT, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';

export const MONO = "ui-monospace, Menlo, 'SF Mono', monospace";
export const clamp01 = (x: number) => (Number.isFinite(x) ? Math.min(1, Math.max(0, x)) : 0);
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

// ---------------------------------------------------------------- glyphs

export const Tick: React.FC<{ size: number; color?: string; stroke?: number }> = ({ size, color = C.ok, stroke }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block', flex: 'none' }}>
    <path d="M4 12.5 L9.5 18 L20 6.5" fill="none" stroke={color} strokeWidth={stroke ?? 3.4} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** A crack drawn across its parent (absolute, full size), revealed by `crack` 0..1. */
export const Crack: React.FC<{ crack: number; d?: string; width?: number }> = ({ crack, d = 'M 3 40 L 22 56 L 40 30 L 62 64 L 80 44 L 97 58', width = 3 }) => {
  const c = clamp01(crack);
  if (c <= 0) return null;
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
      <path d={d} fill="none" stroke={C.bg0} strokeWidth={width * 3} pathLength={1} strokeDasharray={`${c} 1`} vectorEffect="non-scaling-stroke" />
      <path d={d} fill="none" stroke={C.text} strokeWidth={width} pathLength={1} strokeDasharray={`${c} 1`} vectorEffect="non-scaling-stroke" />
    </svg>
  );
};

// ---------------------------------------------------------------- terminal pane

export const Pane: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  t: number;
  label?: string;
  children?: React.ReactNode;
  opacity?: number;
  border?: string;
  font?: number;
}> = ({ x, y, w, h, t, label, children, opacity = 1, border, font = 30 }) => {
  const blink = Math.floor(t * 2.2) % 2 === 0;
  if (opacity <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        opacity: clamp01(opacity),
        background: C.pane,
        border: `2px solid ${border ?? C.line}`,
        borderRadius: 14,
        overflow: 'hidden',
        boxShadow: `0 10px 30px ${alpha(C.bg0, 0.6)}`,
      }}
    >
      <div style={{ height: 38, display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 14, borderBottom: `1px solid ${C.line}`, background: alpha(C.card, 0.7) }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ width: 11, height: 11, borderRadius: 6, background: alpha(C.muted, 0.35) }} />
        ))}
        {label && <div style={{ marginLeft: 10, fontFamily, fontSize: 25, fontWeight: 600, color: C.muted }}>{label}</div>}
      </div>
      <div style={{ padding: '12px 20px', fontFamily: MONO, fontSize: font, color: C.muted, lineHeight: 1.45 }}>
        {children}
        <div style={{ width: 15, height: font * 0.95, background: C.accentText, opacity: blink ? 0.95 : 0.15, marginTop: 4 }} />
      </div>
    </div>
  );
};

/** One terminal line: an optional teal tick, mono text; `lit` makes the tick glow. */
export const TermLine: React.FC<{ text: string; appear: number; tick?: boolean; lit?: number; color?: string; font?: number }> = ({ text, appear, tick, lit = 0, color, font = 30 }) => {
  const a = clamp01(appear);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: a, transform: `translateX(${-16 * (1 - a)}px)`, whiteSpace: 'nowrap', color: color ?? C.text }}>
      {tick && (
        <div style={{ filter: lit > 0 ? `drop-shadow(0 0 ${12 * lit}px ${alpha(C.ok, 0.95)})` : undefined, transform: `scale(${1 + 0.35 * lit})` }}>
          <Tick size={font} />
        </div>
      )}
      <span style={{ fontSize: font }}>{text}</span>
    </div>
  );
};

// ---------------------------------------------------------------- package box and shelf

/**
 * A package box with its bottom at `floor`: a label on the front, a lid that tips open, and a
 * card rising out of it with what is actually inside (amber: the old build).
 */
export const PackageBox: React.FC<{
  x: number;
  floor: number;
  w: number;
  h: number;
  label: string;
  inside?: string;
  lid: number;
  rise: number;
  glow?: number;
  opacity?: number;
  insideFlash?: number;
}> = ({ x, floor, w, h, label, inside = 'old code', lid, rise, glow = 0, opacity = 1, insideFlash = 0 }) => {
  const top = floor - h;
  const r = clamp01(rise);
  const cw = Math.max(150, w * 0.95);
  const ch = Math.max(70, h * 0.55);
  const fs = Math.round(Math.min(40, w * 0.2));
  if (opacity <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: x - w / 2, top, width: w, height: h, opacity: clamp01(opacity) }}>
      {glow > 0 && <div style={{ position: 'absolute', inset: -20, borderRadius: 26, boxShadow: `0 0 ${50 * glow}px ${alpha(C.accentText, 0.8 * glow)}` }} />}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          top: 16,
          borderRadius: 10,
          background: `linear-gradient(180deg, ${alpha(C.warm, 0.3)}, ${alpha(C.warm, 0.14)})`,
          border: `2px solid ${alpha(C.text, 0.1)}`,
          boxShadow: `0 12px 26px ${alpha(C.bg0, 0.6)}`,
        }}
      >
        <svg width={w} height={h - 16} style={{ position: 'absolute', inset: 0, opacity: 0.5 }}>
          {[...Array(12)].map((_, i) => (
            <circle key={i} cx={(i * 37) % w} cy={((i * 53) % Math.max(10, h - 30)) + 8} r={2 + (i % 3)} fill={alpha(C.warm, 0.35)} />
          ))}
        </svg>
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '55%',
            transform: 'translate(-50%, -50%)',
            padding: '4px 14px',
            borderRadius: 8,
            background: C.text,
            color: C.bg0,
            fontFamily,
            fontWeight: 800,
            fontSize: fs,
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: -8,
          top: 0,
          width: w + 16,
          height: 24,
          borderRadius: 8,
          background: alpha(C.warm, 0.5),
          transformOrigin: '0% 100%',
          transform: `translate(${-22 * clamp01(lid)}px, ${-54 * clamp01(lid)}px) rotate(${-20 * clamp01(lid)}deg)`,
        }}
      />
      {inside && r > 0 && (
        <div
          style={{
            position: 'absolute',
            left: w / 2 - cw / 2,
            top: 10 - (ch + 16) * r,
            width: cw,
            height: ch,
            borderRadius: 14,
            background: C.card,
            border: `3px solid ${C.warm}`,
            boxShadow: `0 0 ${36 * insideFlash}px ${alpha(C.warm, 0.9)}, 0 14px 30px ${alpha(C.bg0, 0.7)}`,
            opacity: r,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily,
          }}
        >
          <div style={{ fontSize: Math.round(ch * 0.2), fontWeight: 600, color: C.muted, lineHeight: 1 }}>inside</div>
          <div style={{ fontSize: Math.round(ch * 0.42), fontWeight: 800, color: C.warm, lineHeight: 1.1, whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>{inside}</div>
        </div>
      )}
    </div>
  );
};

export const Shelf: React.FC<{ y: number; x0?: number; x1?: number; opacity?: number; label?: boolean }> = ({ y, x0 = 20, x1 = 940, opacity = 1, label = true }) => (
  <div style={{ position: 'absolute', left: 0, top: 0, opacity: clamp01(opacity) }}>
    <div style={{ position: 'absolute', left: x0, top: y, width: x1 - x0, height: 22, borderRadius: 6, background: `linear-gradient(180deg, ${C.card}, ${C.bg1})`, border: `2px solid ${C.line}` }} />
    {label && <div style={{ position: 'absolute', left: x0 + 6, top: y + 30, fontFamily, fontSize: 24, fontWeight: 700, letterSpacing: '0.12em', color: alpha(C.muted, 0.75) }}>REGISTRY</div>}
  </div>
);

// ---------------------------------------------------------------- walks

/** Point at `d` (0..1) of the way along a polyline. */
export const alongPath = (pts: [number, number][], d: number): [number, number] => {
  if (pts.length < 2) return pts[0] ?? [0, 0];
  const segs = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const total = segs.reduce((a, b) => a + b, 0);
  let left = total * clamp01(d);
  for (let i = 0; i < segs.length; i++) {
    if (left <= segs[i] || i === segs.length - 1) {
      const f = Math.min(1, left / Math.max(segs[i], 1e-6));
      return [lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)];
    }
    left -= segs[i];
  }
  return pts[pts.length - 1];
};

/** A dotted walk along a polyline, drawn up to `draw` (0..1) of its length. */
export const PolyWalk: React.FC<{ pts: [number, number][]; draw: number; color?: string; head?: boolean; width?: number; opacity?: number }> = ({
  pts,
  draw,
  color = C.accentText,
  head = false,
  width = 5,
  opacity = 1,
}) => {
  const d = clamp01(draw);
  if (d <= 0 || pts.length < 2 || opacity <= 0) return null;
  const segs = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const total = segs.reduce((a, b) => a + b, 0);
  let left = total * d;
  const out: [number, number][] = [pts[0]];
  for (let i = 0; i < segs.length && left > 0; i++) {
    const f = Math.min(1, left / Math.max(segs[i], 1e-6));
    out.push([lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)]);
    left -= segs[i];
  }
  const end = out[out.length - 1];
  return (
    <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: clamp01(opacity) }} width={1} height={1}>
      <polyline points={out.map((p) => p.join(',')).join(' ')} fill="none" stroke={color} strokeWidth={width} strokeDasharray="4 14" strokeLinecap="round" strokeLinejoin="round" />
      {head && <circle cx={end[0]} cy={end[1]} r={10} fill={color} />}
    </svg>
  );
};

// ---------------------------------------------------------------- the agent and its load

export const AgentChip: React.FC<{ x: number; y: number; name?: string; appear: number; scale?: number; dim?: boolean; glow?: number }> = ({
  x,
  y,
  name = 'my agent',
  appear,
  scale = 1,
  dim,
  glow = 0,
}) => {
  const a = clamp01(appear);
  if (a <= 0) return null;
  // The agent is drawn (the series' "my agent" robot), standing at the left end of its name pill.
  const w = 270;
  const h = 64;
  const robot = 104;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - w / 2,
        top: y - h / 2,
        width: w,
        height: h,
        borderRadius: h / 2,
        padding: 3,
        boxSizing: 'border-box',
        background: dim ? alpha(C.muted, 0.5) : GRADIENT,
        opacity: a,
        transform: `scale(${scale * (0.7 + 0.3 * a)})`,
        boxShadow: `0 8px 22px ${alpha(C.bg0, 0.6)}${glow > 0 ? `, 0 0 ${36 * glow}px ${alpha(C.accentText, 0.9)}` : ''}`,
        zIndex: 3,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: h / 2,
          background: C.bg1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          fontFamily,
          fontSize: 32,
          fontWeight: 800,
          color: C.text,
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ paddingLeft: 78 }}>{name}</span>
      </div>
      {/* A light disc behind the (dark navy) robot, so it reads on the dark stage. */}
      <div style={{ position: 'absolute', left: -12, top: (h - 96) / 2 - 2, width: 96, height: 96, borderRadius: 48, background: dim ? alpha(C.muted, 0.6) : alpha(C.text, 0.88), boxShadow: `0 0 0 3px ${alpha(C.accent, 0.8)}` }} />
      <Img
        src={staticFile('cast/robot-my-agent.png')}
        style={{
          position: 'absolute',
          left: -16,
          top: (h - robot) / 2 - 8,
          width: robot,
          height: robot,
          objectFit: 'contain',
          filter: dim ? 'grayscale(1) opacity(0.6)' : undefined,
        }}
      />
    </div>
  );
};

/** A ticket card: a title strip and a few grey lines; `release` marks the release ticket. */
export const TicketCard: React.FC<{ x: number; y: number; w?: number; h?: number; appear: number; rot?: number; title: string; release?: boolean; font?: number }> = ({
  x,
  y,
  w = 170,
  h = 104,
  appear,
  rot = 0,
  title,
  release,
  font = 24,
}) => {
  const a = clamp01(appear);
  if (a <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - w / 2,
        top: y - h / 2,
        width: w,
        height: h,
        borderRadius: 12,
        background: C.card,
        border: `2px solid ${release ? C.accentText : C.line}`,
        boxShadow: `0 10px 24px ${alpha(C.bg0, 0.75)}`,
        opacity: a,
        transform: `translateY(${-50 * (1 - a)}px) rotate(${rot}deg)`,
        padding: '10px 14px',
        boxSizing: 'border-box',
        fontFamily,
        zIndex: 4,
      }}
    >
      <div style={{ fontSize: font, fontWeight: 800, color: release ? C.accentText : C.muted, whiteSpace: 'nowrap', lineHeight: 1.1 }}>{title}</div>
      {[0.85, 0.6].map((wd, i) => (
        <div key={i} style={{ height: 8, width: `${wd * 100}%`, borderRadius: 4, background: alpha(C.muted, 0.22), margin: '10px 0 0' }} />
      ))}
    </div>
  );
};

/** The inbox: an envelope with a round count badge. */
export const Inbox: React.FC<{ x: number; y: number; appear: number; count?: number; size?: number }> = ({ x, y, appear, count = 3, size = 70 }) => {
  const a = clamp01(appear);
  if (a <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, opacity: a, transform: `scale(${0.5 + 0.5 * a})`, zIndex: 5 }}>
      <svg width={size} height={size} viewBox="0 0 40 40">
        <rect x={3} y={9} width={34} height={24} rx={4} fill={C.card} stroke={C.muted} strokeWidth={2.4} />
        <path d="M4 11 L20 23 L36 11" fill="none" stroke={C.muted} strokeWidth={2.4} strokeLinejoin="round" />
      </svg>
      <div
        style={{
          position: 'absolute',
          right: -14,
          top: -12,
          width: size * 0.5,
          height: size * 0.5,
          borderRadius: size * 0.25,
          background: GRADIENT,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily,
          fontSize: size * 0.32,
          fontWeight: 800,
          color: C.text,
        }}
      >
        {count}
      </div>
    </div>
  );
};

/** A speech bubble from the inbox (a message from another session). */
export const Bubble: React.FC<{ x: number; y: number; w: number; text: React.ReactNode; appear: number; font?: number }> = ({ x, y, w, text, appear, font = 30 }) => {
  const a = clamp01(appear);
  if (a <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        opacity: a,
        transform: `scale(${0.7 + 0.3 * a})`,
        transformOrigin: '0% 100%',
        padding: '12px 18px',
        boxSizing: 'border-box',
        borderRadius: '22px 22px 22px 4px',
        background: alpha(C.card, 0.98),
        border: `2px solid ${alpha(C.accentText, 0.7)}`,
        boxShadow: `0 12px 28px ${alpha(C.bg0, 0.7)}`,
        fontFamily,
        fontSize: font,
        fontWeight: 700,
        color: C.text,
        textAlign: 'center',
        zIndex: 6,
      }}
    >
      {text}
    </div>
  );
};

// ---------------------------------------------------------------- the brief and the name tag

/**
 * The brief: a sheet with a header and grey lines; the ownership slot is either empty (dashed)
 * or printed (`print` 0..1 reveals it left to right, `glow` lights it).
 */
export const BriefCard: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  appear: number;
  title?: string;
  slot: 'none' | 'empty' | 'printed' | 'glow';
  print?: number;
  glow?: number;
  slotText?: string;
  font?: number;
  children?: React.ReactNode;
}> = ({ x, y, w, h, appear, title = 'BRIEF', slot, print = 1, glow = 0, slotText, font = 26, children }) => {
  const a = clamp01(appear);
  if (a <= 0) return null;
  const pr = clamp01(print);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        opacity: a,
        transform: `translateY(${-20 * (1 - a)}px)`,
        borderRadius: 18,
        background: C.card,
        border: `2px solid ${C.line}`,
        boxShadow: `0 14px 32px ${alpha(C.bg0, 0.7)}`,
        padding: '16px 22px',
        boxSizing: 'border-box',
        fontFamily,
        overflow: 'hidden',
      }}
    >
      <div style={{ fontSize: font * 0.85, fontWeight: 700, color: C.muted, letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>{title}</div>
      {children ?? (
        <>
          {[0.9, 0.7].map((wd, i) => (
            <div key={i} style={{ height: 10, width: `${wd * 100}%`, borderRadius: 5, background: alpha(C.muted, 0.2), margin: '12px 0' }} />
          ))}
          {slot === 'empty' && <div style={{ height: font * 1.9, borderRadius: 10, border: `3px dashed ${alpha(C.muted, 0.45)}`, marginTop: 4 }} />}
          {(slot === 'printed' || slot === 'glow') && (
            <div style={{ position: 'relative', height: font * 1.9, marginTop: 4 }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: 10, border: `3px dashed ${alpha(C.muted, 0.3 * (1 - pr))}` }} />
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${pr * 100}%`,
                  borderRadius: 10,
                  overflow: 'hidden',
                  background: alpha(C.accent, 0.28 + 0.3 * glow),
                  boxShadow: glow > 0 ? `0 0 ${34 * glow}px ${alpha(C.accentText, 0.8)}` : undefined,
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: 14,
                  boxSizing: 'border-box',
                }}
              >
                {slotText ? (
                  <span style={{ fontSize: font, fontWeight: 800, color: C.text, whiteSpace: 'nowrap' }}>{slotText}</span>
                ) : (
                  <div style={{ width: '100%', paddingRight: 14 }}>
                    {[0.95, 0.7].map((wd, i) => (
                      <div key={i} style={{ height: 9, width: `${wd * 100}%`, borderRadius: 5, background: alpha(C.text, 0.75), margin: '7px 0' }} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          <div style={{ height: 10, width: '60%', borderRadius: 5, background: alpha(C.muted, 0.2), margin: '14px 0 0' }} />
        </>
      )}
    </div>
  );
};

/**
 * The name tag "owner: you": a luggage tag hanging from a string at (x, y). `swing` 0..1 brings
 * it in on its string; `angle` is the resting tilt.
 */
export const NameTag: React.FC<{ x: number; y: number; swing: number; text?: string; scale?: number; string?: number; glow?: number; rest?: number; tie?: number }> = ({
  x,
  y,
  swing,
  text = 'owner: you',
  scale = 1,
  string = 46,
  glow = 0,
  rest = 0,
  tie = 0,
}) => {
  const s = clamp01(swing);
  if (s <= 0) return null;
  // Comes in from the side on its string and settles with a small overshoot.
  const angle = rest - 75 * (1 - s) + 10 * Math.sin(s * Math.PI) * (1 - s * 0.6);
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 0, height: 0, opacity: Math.min(1, s * 3), zIndex: 7 }}>
      {/* The cord from the hook to where the tag is tied on (e.g. the box's corner). */}
      {tie !== 0 && (
        <svg style={{ position: 'absolute', left: Math.min(0, tie) - 4, top: -4, overflow: 'visible' }} width={Math.abs(tie) + 8} height={8}>
          <line x1={tie < 0 ? Math.abs(tie) + 4 : 4} y1={4} x2={(tie < 0 ? Math.abs(tie) + 4 : 4) + tie * Math.min(1, s * 2)} y2={4} stroke={C.text} strokeWidth={3} />
        </svg>
      )}
      <div style={{ position: 'absolute', left: 0, top: 0, width: 0, height: 0, transform: `rotate(${angle}deg) scale(${scale})`, transformOrigin: '0 0' }}>
      <svg style={{ position: 'absolute', left: -2, top: 0, overflow: 'visible' }} width={4} height={string}>
        <line x1={2} y1={0} x2={2} y2={string} stroke={C.text} strokeWidth={3} />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: -108,
          top: string,
          width: 216,
          height: 78,
          borderRadius: 14,
          clipPath: 'polygon(14% 0, 86% 0, 100% 22%, 100% 100%, 0 100%, 0 22%)',
          background: GRADIENT,
          boxShadow: glow > 0 ? `0 0 ${30 * glow}px ${alpha(C.accentText, 0.9)}` : undefined,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily,
          fontSize: 34,
          fontWeight: 800,
          color: C.text,
          whiteSpace: 'nowrap',
          paddingTop: 8,
          boxSizing: 'border-box',
        }}
      >
        {text}
      </div>
      <div style={{ position: 'absolute', left: -9, top: string + 4, width: 18, height: 18, borderRadius: 9, background: C.bg0, border: `3px solid ${C.text}`, boxSizing: 'border-box' }} />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- report card and stamps

/** The agent's report: a sheet with a "0.4.0 published ✓" stamp; `crack` greys and breaks it. */
export const ReportCard: React.FC<{ x: number; y: number; w?: number; h?: number; appear: number; stamp: number; crack?: number; text?: string }> = ({
  x,
  y,
  w = 380,
  h = 150,
  appear,
  stamp,
  crack = 0,
  text = '0.4.0 published ✓',
}) => {
  const a = clamp01(appear);
  if (a <= 0) return null;
  const st = clamp01(stamp);
  const cr = clamp01(crack);
  return (
    <div style={{ position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, opacity: a, transform: `translateY(${18 * (1 - a)}px)`, zIndex: 5 }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 14,
          background: C.card,
          border: `2px solid ${C.line}`,
          boxShadow: `0 12px 28px ${alpha(C.bg0, 0.7)}`,
          padding: '12px 18px',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ fontFamily, fontSize: 22, fontWeight: 700, color: alpha(C.muted, 0.85), letterSpacing: '0.08em' }}>REPORT</div>
        {[0.85, 0.6].map((wd, i) => (
          <div key={i} style={{ height: 8, width: `${wd * 100}%`, borderRadius: 4, background: alpha(C.muted, 0.2), margin: '10px 0' }} />
        ))}
      </div>
      {st > 0 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 20 }}>
          <div
            style={{
              position: 'relative',
              padding: '8px 18px',
              borderRadius: 12,
              background: cr > 0.5 ? alpha(C.bg0, 0.92) : GRADIENT,
              border: `4px solid ${cr > 0.5 ? C.muted : 'transparent'}`,
              fontFamily,
              fontSize: 29,
              fontWeight: 800,
              color: cr > 0.5 ? C.muted : C.text,
              whiteSpace: 'nowrap',
              opacity: st,
              transform: `scale(${1.4 - 0.4 * st}) rotate(-4deg)`,
            }}
          >
            {text}
            <Crack crack={cr} />
          </div>
        </div>
      )}
    </div>
  );
};

/** A big stamp: `solid` in the gradient (it works), else outlined grey (it fails). */
export const Stamp: React.FC<{ x: number; y: number; w: number; text: React.ReactNode; pop: number; solid?: boolean; font?: number; rot?: number; flash?: number }> = ({
  x,
  y,
  w,
  text,
  pop,
  solid,
  font = 40,
  rot = -4,
  flash = 0,
}) => {
  const p = clamp01(pop);
  if (p <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: x - w / 2, top: y, width: w, display: 'flex', justifyContent: 'center', zIndex: 8 }}>
      <div
        style={{
          padding: '10px 22px',
          borderRadius: 14,
          background: solid ? GRADIENT : alpha(C.bg0, 0.92),
          border: solid ? 'none' : `4px solid ${C.muted}`,
          fontFamily,
          fontSize: font,
          fontWeight: 800,
          color: solid ? C.text : C.muted,
          textAlign: 'center',
          lineHeight: 1.15,
          opacity: p,
          transform: `scale(${1.6 - 0.6 * p}) rotate(${rot}deg)`,
          boxShadow: flash > 0 ? `0 0 ${46 * flash}px ${alpha(C.accentText, 0.9)}` : `0 10px 26px ${alpha(C.bg0, 0.6)}`,
        }}
      >
        {text}
      </div>
    </div>
  );
};

/** A small tag (pill) of text. */
export const Tag: React.FC<{
  x: number;
  y: number;
  w?: number;
  text: React.ReactNode;
  appear: number;
  size?: number;
  strong?: boolean;
  anchor?: 'center' | 'left' | 'right';
  mono?: boolean;
  opacity?: number;
}> = ({ x, y, w = 300, text, appear, size = 26, strong, anchor = 'center', mono, opacity = 1 }) => {
  const a = clamp01(appear) * clamp01(opacity);
  if (a <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: anchor === 'center' ? x - w / 2 : anchor === 'left' ? x : x - w,
        top: y,
        width: w,
        display: 'flex',
        justifyContent: anchor === 'center' ? 'center' : anchor === 'left' ? 'flex-start' : 'flex-end',
        opacity: a,
        transform: `translateY(${10 * (1 - clamp01(appear))}px)`,
        zIndex: 6,
      }}
    >
      <div
        style={{
          padding: '6px 14px',
          borderRadius: 12,
          border: `2px solid ${strong ? C.accentText : alpha(C.muted, 0.55)}`,
          background: alpha(C.bg0, 0.9),
          fontFamily: mono ? MONO : fontFamily,
          fontSize: size,
          fontWeight: 650,
          lineHeight: 1.2,
          color: strong ? C.text : C.muted,
          textAlign: 'center',
        }}
      >
        {text}
      </div>
    </div>
  );
};

/** The part marker at the top-left of a scene: "1 · real messages". */
export const PartTag: React.FC<{ n: number; text: string; appear: number }> = ({ n, text, appear }) => {
  const a = clamp01(appear);
  if (a <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, display: 'flex', alignItems: 'center', gap: 12, opacity: a, transform: `translateX(${-20 * (1 - a)}px)`, fontFamily, zIndex: 6 }}>
      <div style={{ width: 52, height: 52, borderRadius: 26, background: GRADIENT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 800, color: C.text }}>{n}</div>
      <div style={{ fontSize: 32, fontWeight: 700, color: C.text, whiteSpace: 'nowrap' }}>{text}</div>
    </div>
  );
};

/** A run marker: a small round chip, accent (owner named) or muted (no owner named). */
export const Dot: React.FC<{ x: number; y: number; r?: number; accent: boolean; opacity?: number; grey?: number; ring?: number }> = ({ x, y, r = 16, accent, opacity = 1, grey = 0, ring = 0 }) => {
  const o = clamp01(opacity);
  if (o <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - r,
        top: y - r,
        width: 2 * r,
        height: 2 * r,
        borderRadius: r,
        background: grey > 0.5 ? alpha(C.muted, 0.35) : accent ? GRADIENT : C.text,
        border: accent ? 'none' : `2px solid ${alpha(C.muted, 0.6)}`,
        boxSizing: 'border-box',
        opacity: o,
        boxShadow: ring > 0 ? `0 0 ${18 * ring}px ${alpha(C.accentText, 0.9)}` : `0 4px 10px ${alpha(C.bg0, 0.5)}`,
        zIndex: 4,
      }}
    />
  );
};
