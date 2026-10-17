import React from 'react';
import { interpolate } from 'remotion';
import { C, GRADIENT, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import { tx } from '../types.ts';
import type { AnimProps } from './types.ts';
import { frameState, type PitchProps, type PlayData } from './PitchPlayback.state.ts';
import { frameState as quoteState } from './KeyQuote.state.ts';
import { gradientText, stageOf } from './Stage.tsx';
import play from '../data/play.json';

export { frameState };
export type { PitchProps };

const DATA = play as unknown as PlayData;

/** Visible part of the pitch, in metres: the attacking two thirds, where this play happens. */
const VIEW = { x0: 25, x1: 107, y0: 0, y1: 68 };

/** Pitch markings (metres, 105 x 68). */
const Markings: React.FC<{ sw: number }> = ({ sw }) => {
  const line = { fill: 'none', stroke: alpha(C.muted, 0.42), strokeWidth: sw } as const;
  return (
    <g>
      {Array.from({ length: 15 }, (_, i) => (
        <rect key={i} x={i * 7} y={0} width={7} height={68} fill={i % 2 ? alpha(C.card, 0.55) : 'transparent'} />
      ))}
      <rect x={0} y={0} width={105} height={68} {...line} />
      <line x1={52.5} y1={0} x2={52.5} y2={68} {...line} />
      <circle cx={52.5} cy={34} r={9.15} {...line} />
      <circle cx={52.5} cy={34} r={0.5} fill={alpha(C.muted, 0.42)} />
      {[0, 105].map((gx) => {
        const dir = gx === 0 ? 1 : -1;
        const box = (depth: number, half: number) => (
          <rect x={gx === 0 ? 0 : 105 - depth} y={34 - half} width={depth} height={2 * half} {...line} />
        );
        return (
          <g key={gx}>
            {box(16.5, 20.16)}
            {box(5.5, 9.16)}
            <circle cx={gx + dir * 11} cy={34} r={0.45} fill={alpha(C.muted, 0.42)} />
            <rect x={gx === 0 ? -2 : 105} y={30.34} width={2} height={7.32} fill="none" stroke={alpha(C.text, 0.6)} strokeWidth={sw} />
          </g>
        );
      })}
    </g>
  );
};

/**
 * The key sentence as a centred slam over the frozen pitch, split in two halves at its comma
 * ("No motion," / "no signal."). Word timing and emphasis come from the KeyQuote state.
 */
const QuoteSlam: React.FC<{ text: string; emphasis?: string[]; t: number; beats: number[]; dur: number; top: number; H: number }> = (q) => {
  const st = quoteState({ text: q.text, emphasis: q.emphasis }, q.t, q.beats, q.dur, 'en');
  const cut = Math.max(1, st.words.findIndex((w) => /,$/.test(w.text)) + 1);
  const rows = [st.words.slice(0, cut), st.words.slice(cut)].filter((r) => r.length);
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: q.top,
        height: q.H,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 150,
        fontWeight: 800,
        lineHeight: 1.08,
        letterSpacing: '-0.03em',
      }}
    >
      {rows.map((row, r) => (
        <div key={r} style={{ whiteSpace: 'nowrap' }}>
          {row.map((w, i) => (
            <React.Fragment key={i}>
              {i > 0 ? ' ' : null}
              <span
                style={{
                  display: 'inline-block',
                  position: 'relative',
                  opacity: w.opacity,
                  transform: `scale(${interpolate(w.opacity, [0, 1], [1.35, 1])})`,
                  ...(w.emphasis ? gradientText : { color: C.text }),
                }}
              >
                {w.text}
                {w.emphasis && (
                  <span style={{ position: 'absolute', left: 0, bottom: 2, height: 10, width: `${st.emphasis * 100}%`, borderRadius: 5, background: GRADIENT }} />
                )}
              </span>
            </React.Fragment>
          ))}
        </div>
      ))}
    </div>
  );
};

/** Top-down pitch playing a real Metrica Sports sequence, with the overlays of each scene. */
export const PitchPlayback: React.FC<AnimProps & PitchProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur, DATA);
  const stage = stageOf(p.vertical);
  const vw = VIEW.x1 - VIEW.x0;
  const vh = VIEW.y1 - VIEW.y0;
  const scale = Math.min(stage.w / vw, (stage.h - (p.vertical ? 150 : 90)) / vh);
  const W = vw * scale;
  const H = vh * scale;
  const left = stage.side + (stage.w - W) / 2;
  const top = stage.top + (p.vertical ? 10 : 0);
  const px = (x: number) => (x - VIEW.x0) * scale;
  const py = (y: number) => (y - VIEW.y0) * scale;
  const inView = (x: number) => x > VIEW.x0 - 3 && x < VIEW.x1 + 3;

  const arrow = (x0: number, y0: number, x1: number, y1: number, op: number, key: number) => {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const len = Math.hypot(dx, dy);
    if (len < 0.8 || op <= 0) return null;
    const ux = dx / len;
    const uy = dy / len;
    const hl = Math.min(2.2, len * 0.5);
    const bx = x1 - ux * hl;
    const by = y1 - uy * hl;
    const hw = 1.1;
    return (
      <g key={key} opacity={op}>
        <line x1={x0} y1={y0} x2={bx} y2={by} stroke={C.accentText} strokeWidth={0.55} strokeLinecap="round" />
        <polygon points={`${x1},${y1} ${bx - uy * hw},${by + ux * hw} ${bx + uy * hw},${by - ux * hw}`} fill={C.accentText} />
      </g>
    );
  };

  const arrowsOn = s.arrows.opacity > 0;
  const c = s.centroid;

  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily, color: C.text }}>
      <div
        style={{
          position: 'absolute',
          left,
          top,
          width: W,
          height: H,
          borderRadius: 18,
          overflow: 'hidden',
          background: C.bg1,
          boxShadow: `0 0 0 2px ${alpha(C.muted, 0.18)}, 0 30px 80px ${alpha(C.accent, 0.12)}`,
        }}
      >
        <svg width={W} height={H} viewBox={`${VIEW.x0} ${VIEW.y0} ${vw} ${vh}`} style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <radialGradient id="ballGlow">
              <stop offset="0%" stopColor={C.accent2} stopOpacity={0.9} />
              <stop offset="100%" stopColor={C.accent2} stopOpacity={0} />
            </radialGradient>
            <radialGradient id="cGlow">
              <stop offset="0%" stopColor={C.accentText} stopOpacity={0.8} />
              <stop offset="100%" stopColor={C.accent} stopOpacity={0} />
            </radialGradient>
          </defs>
          <Markings sw={0.32} />

          {/* Converging rays: every player pulled into one weighted point. */}
          {c.opacity > 0 &&
            p.mode === 'centroid' &&
            s.players.map((q, i) => (
              <line
                key={`r${i}`}
                x1={q.x}
                y1={q.y}
                x2={c.x}
                y2={c.y}
                stroke={C.accentText}
                strokeWidth={0.18 + 0.25 * q.bright}
                opacity={c.converge * (1 - c.land) * (0.25 + 0.5 * q.bright)}
              />
            ))}

          {arrowsOn && s.players.map((q, i) => arrow(q.x, q.y, q.ax, q.ay, 0.3 + 0.7 * q.bright, i))}

          {s.players.map((q, i) =>
            inView(q.x) ? (
              <circle
                key={`p${i}`}
                cx={q.x}
                cy={q.y}
                r={1.55}
                fill={q.team === 0 ? C.accentText : C.text}
                stroke={C.bg0}
                strokeWidth={0.3}
                opacity={arrowsOn ? 0.55 + 0.45 * q.bright : 0.95}
              />
            ) : null,
          )}

          {/* The ball. */}
          {s.ball.opacity > 0 && (
            <g opacity={s.ball.opacity}>
              <circle cx={s.ball.x} cy={s.ball.y} r={2 + 9 * s.ball.glow} fill="url(#ballGlow)" opacity={0.4 + 0.6 * s.ball.glow} />
              <circle cx={s.ball.x} cy={s.ball.y} r={2.3} fill="none" stroke={alpha(C.accentText, 0.7)} strokeWidth={0.25} />
              <circle cx={s.ball.x} cy={s.ball.y} r={1.0} fill="#ffffff" />
            </g>
          )}

          {/* Velocity-weighted centroid. */}
          {c.opacity > 0 && (
            <g opacity={c.opacity}>
              <circle cx={c.x} cy={c.y} r={5} fill="url(#cGlow)" opacity={p.mode === 'still' ? 0.4 : 0.9} />
              <circle
                cx={c.x}
                cy={c.y}
                r={1.9}
                fill={p.mode === 'still' ? 'none' : C.accent}
                stroke={p.mode === 'still' ? C.muted : C.text}
                strokeWidth={0.35}
                strokeDasharray={p.mode === 'still' ? '0.8 0.6' : undefined}
              />
            </g>
          )}
        </svg>

        {/* AI guess markers. */}
        {s.guesses.map((g) =>
          g.drop > 0 ? (
            <div
              key={g.label}
              style={{
                position: 'absolute',
                left: px(g.x),
                top: py(g.y),
                transform: `translate(-50%, -50%) translateY(${(1 - g.drop) * -90}px)`,
                opacity: g.opacity,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  bottom: 46,
                  padding: '6px 16px',
                  borderRadius: 12,
                  background: alpha(C.bg0, 0.85),
                  border: `2px solid ${alpha(C.muted, 0.5)}`,
                  fontSize: 38,
                  fontWeight: 700,
                  color: C.muted,
                  whiteSpace: 'nowrap',
                }}
              >
                {g.label}
              </div>
              <svg width={72} height={72} viewBox="-36 -36 72 72">
                <circle r={26} fill={alpha(C.muted, 0.12)} stroke={C.muted} strokeWidth={5} />
                <line x1={-34} y1={0} x2={-14} y2={0} stroke={C.muted} strokeWidth={5} />
                <line x1={14} y1={0} x2={34} y2={0} stroke={C.muted} strokeWidth={5} />
                <line x1={0} y1={-34} x2={0} y2={-14} stroke={C.muted} strokeWidth={5} />
                <line x1={0} y1={14} x2={0} y2={34} stroke={C.muted} strokeWidth={5} />
                {g.scatter > 0 && (
                  <g opacity={g.scatter} stroke={C.text} strokeWidth={5} strokeLinecap="round">
                    <line x1={-9} y1={-9} x2={9} y2={9} />
                    <line x1={9} y1={-9} x2={-9} y2={9} />
                  </g>
                )}
              </svg>
            </div>
          ) : null,
        )}

        {/* The 60 kB net. */}
        {s.net.opacity > 0 && (
          <div
            style={{
              position: 'absolute',
              left: px(s.net.x),
              top: py(s.net.y),
              transform: 'translate(-50%, -50%)',
              opacity: s.net.opacity,
            }}
          >
            <svg width={120} height={120} viewBox="-60 -60 120 120" style={{ overflow: 'visible', filter: `drop-shadow(0 0 14px ${C.accent})` }}>
              <circle r={34 + 10 * s.net.ring} fill="none" stroke={alpha(C.accentText, 0.35 * s.net.snap)} strokeWidth={4} />
              <circle r={30} fill="none" stroke={C.accentText} strokeWidth={7} />
              <line x1={-52} y1={0} x2={-20} y2={0} stroke={C.accentText} strokeWidth={7} strokeLinecap="round" />
              <line x1={20} y1={0} x2={52} y2={0} stroke={C.accentText} strokeWidth={7} strokeLinecap="round" />
              <line x1={0} y1={-52} x2={0} y2={-20} stroke={C.accentText} strokeWidth={7} strokeLinecap="round" />
              <line x1={0} y1={20} x2={0} y2={52} stroke={C.accentText} strokeWidth={7} strokeLinecap="round" />
            </svg>
          </div>
        )}

        {s.net.opacity > 0 && (
          <div
            style={{
              position: 'absolute',
              // Kept inside the pitch box even when the ball is by the goal line.
              left: Math.min(W - 130, Math.max(130, px(s.net.x))),
              top: py(s.net.y) - 120,
              transform: 'translate(-50%, -50%)',
              opacity: s.net.opacity,
              padding: '8px 22px',
              borderRadius: 14,
              background: GRADIENT,
              fontSize: 42,
              fontWeight: 800,
              color: C.text,
              whiteSpace: 'nowrap',
              boxShadow: `0 0 40px ${alpha(C.accent, 0.7)}`,
            }}
          >
            60 kB net
          </div>
        )}

        {/* The pulsing "?". */}
        {s.question.opacity > 0 && (
          <div
            style={{
              position: 'absolute',
              left: px(s.question.x),
              top: py(s.question.y),
              transform: `translate(-50%, -50%) scale(${1 + 0.1 * s.question.pulse})`,
              opacity: s.question.opacity,
              width: 170,
              height: 170,
              borderRadius: 85,
              background: alpha(C.bg0, 0.72),
              border: `5px solid ${C.accentText}`,
              boxShadow: `0 0 ${30 + 40 * s.question.pulse}px ${alpha(C.accent, 0.4 + 0.4 * s.question.pulse)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: 130, fontWeight: 800, lineHeight: 1, ...gradientText }}>?</span>
          </div>
        )}

        {/* Dim under an overlay. */}
        {s.dim > 0 && <div style={{ position: 'absolute', inset: 0, background: C.bg0, opacity: s.dim }} />}

        {/* Data credit, small, inside the pitch. */}
        <div style={{ position: 'absolute', right: 14, bottom: 10, fontSize: 22, fontWeight: 500, color: alpha(C.muted, 0.75) }}>
          Tracking data: Metrica Sports
        </div>
      </div>

      {/* Headline figure over the dimmed pitch. */}
      {s.counter && (
        <div
          style={{
            position: 'absolute',
            left,
            top,
            width: W,
            height: H,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 18,
            opacity: s.counter.appear,
            transform: `translateY(${interpolate(s.counter.appear, [0, 1], [30, 0])}px)`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
            <div
              style={{
                fontSize: 240,
                fontWeight: 800,
                lineHeight: 1,
                letterSpacing: '-0.03em',
                fontVariantNumeric: 'tabular-nums',
                whiteSpace: 'nowrap',
                ...(p.counter?.accent ? gradientText : { color: C.text }),
              }}
            >
              {s.counter.text}
            </div>
            {p.counter?.coin && (
              <div
                style={{
                  width: 150,
                  height: 150,
                  borderRadius: 75,
                  transform: `scaleX(${Math.max(0.06, Math.abs(Math.cos(s.counter.flip * Math.PI)))})`,
                  background: `radial-gradient(circle at 35% 30%, ${C.text}, ${C.muted})`,
                  border: `6px solid ${alpha(C.text, 0.6)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 76,
                  fontWeight: 800,
                  color: C.bg0,
                }}
              >
                {Math.cos(s.counter.flip * Math.PI) >= 0 ? 'H' : 'T'}
              </div>
            )}
          </div>
          <div style={{ width: interpolate(s.counter.progress, [0, 1], [0, 220]), height: 8, borderRadius: 4, background: GRADIENT }} />
          <div style={{ maxWidth: W * 0.9, fontSize: 52, fontWeight: 700, lineHeight: 1.2, textAlign: 'center', color: C.text }}>
            {tx(p.counter!.label, p.lang)}
          </div>
        </div>
      )}

      {/* Scene chip under the pitch. */}
      {p.chip && p.mode !== 'quote' && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: top + H + 30,
            display: 'flex',
            justifyContent: 'center',
            opacity: s.chip.opacity,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              padding: '14px 30px',
              borderRadius: 999,
              background: alpha(C.card, 0.9),
              border: `2px solid ${alpha(C.accentText, 0.45)}`,
              fontSize: 44,
              fontWeight: 700,
              color: C.text,
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ width: 18, height: 18, borderRadius: 9, background: GRADIENT, display: 'inline-block' }} />
            {tx(p.chip, p.lang)}
          </div>
        </div>
      )}

      {p.mode === 'quote' && p.quote && (
        <QuoteSlam text={tx(p.quote.text, p.lang)} emphasis={p.quote.emphasis} t={p.t} beats={p.beats} dur={p.dur} top={top} H={H} />
      )}
    </div>
  );
};
