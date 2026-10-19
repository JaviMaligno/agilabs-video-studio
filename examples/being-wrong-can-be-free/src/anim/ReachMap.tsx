import React from 'react';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import { tx } from '../types.ts';
import type { AnimProps } from './types.ts';
import { frameState, annulusPath, GOAL2, RING, ROBOT_R, START, type ReachProps, type World } from './ReachMap.state.ts';
import { stageOf } from './Stage.tsx';
import { MeterHud, ModelChip } from './Meter.tsx';

export { frameState };
export type { ReachProps };

type Box = { left: number; top: number; w: number; h: number };

/** Five-point star path centred on (0, 0). */
export const starPath = (R: number, r = R * 0.45): string => {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r : R;
    pts.push(`${(rr * Math.cos(a)).toFixed(3)},${(rr * Math.sin(a)).toFixed(3)}`);
  }
  return `M ${pts.join(' L ')} Z`;
};

const Spark: React.FC<{ x: number; y: number; pop: number; k: number }> = ({ x, y, pop, k }) => {
  if (!(pop > 0 && pop < 1)) return null;
  const len = (0.25 + 0.55 * pop) * k;
  return (
    <g opacity={1 - pop}>
      <circle cx={x} cy={y} r={0.28 * k * (1 + pop)} fill={alpha(C.gold, 0.55)} />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4 + 0.3;
        return (
          <line
            key={i}
            x1={x + Math.cos(a) * 0.18 * k}
            y1={y + Math.sin(a) * 0.18 * k}
            x2={x + Math.cos(a) * len}
            y2={y + Math.sin(a) * len}
            stroke={C.gold}
            strokeWidth={0.09 * k}
            strokeLinecap="round"
          />
        );
      })}
    </g>
  );
};

/** One map: the world in world units, fitted into `box`. `id` keeps gradients and masks unique. */
const MapSvg: React.FC<{ w: World; box: Box; id: string; t: number; labelScale?: number; full?: boolean }> = ({ w, box, id, t, labelScale = 1, full = false }) => {
  const v = w.view;
  const vw = v.x1 - v.x0;
  const vh = v.y1 - v.y0;
  const s = Math.min(box.w / vw, box.h / vh);
  // World units per 1 px, so text and strokes keep a fixed screen size whatever the zoom.
  const px = 1 / s;
  const ox = box.left + (box.w - vw * s) / 2;
  const oy = box.top + (box.h - vh * s) / 2;
  const band = annulusPath(RING.inner, RING.outer, w.ring.angle, w.ring.gap);
  const hole = Math.round(255 * w.glow.holeLit);
  const gapC = { x: RING.inner * Math.cos(w.ring.angle), y: RING.inner * Math.sin(w.ring.angle) };
  const big = { x: v.x0 - 40, y: v.y0 - 40, w: vw + 80, h: vh + 80 };
  const glowA = 0.5 + 0.25 * w.glow.pulse;
  const fs = (n: number) => n * px * labelScale;
  // Drawable area in world units: the whole frame width (or the box), the box height, edges feathered.
  const sx0 = full ? 0 : box.left;
  const sx1 = full ? 1080 : box.left + box.w;
  const clip = { x: v.x0 + (sx0 - ox) * px, y: v.y0 + (box.top - oy) * px, w: (sx1 - sx0) * px, h: box.h * px };
  const feather = 80 * px;

  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
      <defs>
        <radialGradient id={`${id}-glow`} gradientUnits="userSpaceOnUse" cx={START.x} cy={START.y} r={Math.max(0.01, w.glow.radius)}>
          <stop offset="0" stopColor={C.accent2} stopOpacity={glowA + 0.15} />
          <stop offset="0.45" stopColor={C.accent} stopOpacity={glowA * 0.62} />
          <stop offset="1" stopColor={C.accent} stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${id}-hole`} gradientUnits="userSpaceOnUse" cx={gapC.x} cy={gapC.y} r={RING.inner * 2}>
          <stop offset="0" stopColor={C.accentText} stopOpacity={0.75} />
          <stop offset="1" stopColor={C.accent} stopOpacity={0.18} />
        </radialGradient>
        <mask id={`${id}-reach`} maskUnits="userSpaceOnUse" x={big.x} y={big.y} width={big.w} height={big.h}>
          <rect x={big.x} y={big.y} width={big.w} height={big.h} fill="white" />
          <path d={band} fill="black" fillRule="evenodd" />
          <circle cx={0} cy={0} r={RING.inner} fill={`rgb(${hole},${hole},${hole})`} />
        </mask>
        <clipPath id={`${id}-holeclip`}>
          <circle cx={0} cy={0} r={RING.inner} />
        </clipPath>
        <mask id={`${id}-view`} maskUnits="userSpaceOnUse" x={clip.x - 2} y={clip.y - 2} width={clip.w + 4} height={clip.h + 4}>
          <rect x={clip.x - 2} y={clip.y + feather} width={clip.w + 4} height={Math.max(0, clip.h - 2 * feather)} fill="white" filter={`url(#${id}-feather)`} />
        </mask>
        <filter id={`${id}-feather`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={feather * 0.6} />
        </filter>
        <pattern id={`${id}-hatch`} patternUnits="userSpaceOnUse" width={0.55} height={0.55} patternTransform="rotate(45)">
          <line x1={0} y1={0} x2={0} y2={0.55} stroke={alpha(C.rose, 0.55)} strokeWidth={0.12} />
        </pattern>
        <linearGradient id={`${id}-sweep`} gradientUnits="userSpaceOnUse" x1={-6} y1={0} x2={6} y2={0} gradientTransform={`translate(${(w.wrong.sweep * 2 - 1) * 9} 0)`}>
          <stop offset="0" stopColor={C.roseText} stopOpacity={0.35} />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity={1} />
          <stop offset="1" stopColor={C.roseText} stopOpacity={0.35} />
        </linearGradient>
        <filter id={`${id}-blur`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={0.6} />
        </filter>
      </defs>
      <g transform={`translate(${ox} ${oy}) scale(${s}) translate(${-v.x0} ${-v.y0})`}>
        <g mask={`url(#${id}-view)`}>
          {/* Faint floor grid. */}
          {Array.from({ length: Math.ceil(vw / 2) + 2 }, (_, i) => {
            const x = Math.floor(v.x0 / 2) * 2 + i * 2;
            return <line key={`gx${i}`} x1={x} y1={v.y0} x2={x} y2={v.y1} stroke={alpha(C.muted, 0.07)} strokeWidth={px * 2} />;
          })}
          {Array.from({ length: Math.ceil(vh / 2) + 2 }, (_, i) => {
            const y = Math.floor(v.y0 / 2) * 2 + i * 2;
            return <line key={`gy${i}`} x1={v.x0} y1={y} x2={v.x1} y2={y} stroke={alpha(C.muted, 0.07)} strokeWidth={px * 2} />;
          })}

          {/* The reach: light everywhere the robot can get to, stopped by the real fence. */}
          <rect x={big.x} y={big.y} width={big.w} height={big.h} fill={`url(#${id}-glow)`} mask={`url(#${id}-reach)`} opacity={w.glow.opacity} />
          {w.glow.holeLit > 0 && <circle cx={0} cy={0} r={RING.inner} fill={`url(#${id}-hole)`} opacity={w.glow.holeLit} clipPath={`url(#${id}-holeclip)`} />}
          {/* Reach stretching toward a new goal (zoomOut). */}
          {w.lobe.draw > 0 && (
            <line
              x1={START.x}
              y1={START.y}
              x2={START.x + (GOAL2.x - START.x) * w.lobe.draw}
              y2={START.y + (GOAL2.y - START.y) * w.lobe.draw}
              stroke={alpha(C.accent2, 0.55)}
              strokeWidth={3.2}
              strokeLinecap="round"
              filter={`url(#${id}-blur)`}
            />
          )}

          {/* Other places the model is wrong: red where a plan reaches them, grey in the dark. */}
          {w.patches.map((q, i) => {
            const pulse = 0.75 + 0.25 * Math.sin(t * 5 + i);
            const col = q.heat > 0.5 ? C.rose : C.muted;
            return (
              <g key={i} opacity={q.opacity}>
                <circle cx={q.x} cy={q.y} r={q.r * (1 + 0.08 * q.heat * pulse)} fill={alpha(col, 0.18 + 0.32 * q.heat * pulse)} />
                <circle cx={q.x} cy={q.y} r={q.r} fill="none" stroke={alpha(col, 0.5 + 0.5 * q.heat)} strokeWidth={px * 4} strokeDasharray={`${px * 12} ${px * 8}`} />
              </g>
            );
          })}

          {/* The fence: rose ring, to scale, with its door. */}
          <path d={band} fill={alpha(C.rose, 0.82)} fillRule="evenodd" stroke={C.roseText} strokeWidth={px * 3} opacity={w.ring.opacity} />

          {/* Model 1's map: a filled disc over the ring and its hole. */}
          {w.disc.opacity > 0 && (
            <g opacity={w.disc.opacity}>
              <circle cx={0} cy={0} r={RING.outer} fill={alpha(C.rose, 0.3)} />
              <circle cx={0} cy={0} r={RING.outer} fill={`url(#${id}-hatch)`} />
              <circle cx={0} cy={0} r={RING.outer + px * 3} fill="none" stroke={C.roseText} strokeWidth={px * 5} strokeDasharray={`${px * 22} ${px * 12}`} />
            </g>
          )}
          {w.wrong.opacity > 0 && (
            <text x={0} y={-1.55} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={fs(92)} fill={`url(#${id}-sweep)`} opacity={w.wrong.opacity} letterSpacing={fs(2)}>
              wrong
            </text>
          )}

          {/* Sample ticks along the rim: every test passes (hook). */}
          {w.ticks.opacity > 0 &&
            Array.from({ length: 16 }, (_, i) => {
              const a = (i / 16) * Math.PI * 2;
              const lit = Math.max(0, 1 - Math.abs(w.ticks.flash * 1.4 - i / 16 - 0.2) * 3);
              return (
                <g key={i} transform={`translate(${(RING.outer + 0.55) * Math.cos(a)} ${(RING.outer + 0.55) * Math.sin(a)}) scale(${px * (1 + 0.35 * lit)})`} opacity={w.ticks.opacity * (0.6 + 0.4 * lit)}>
                  <circle r={17} fill={alpha(C.ok, 0.2 + 0.3 * lit)} />
                  <path d="M -8 0 L -2 7 L 9 -7" fill="none" stroke={C.ok} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
                </g>
              );
            })}

          {/* Sample rollouts: every one stops at the rim. */}
          {w.rays.map((r, i) =>
            r.draw > 0 ? (
              <g key={i}>
                <line x1={r.x0} y1={r.y0} x2={r.x0 + (r.x1 - r.x0) * r.draw} y2={r.y0 + (r.y1 - r.y0) * r.draw} stroke={alpha(C.text, 0.75)} strokeWidth={px * 4} strokeDasharray={`${px * 14} ${px * 10}`} />
                {r.draw >= 1 && <circle cx={r.x1} cy={r.y1} r={px * 9} fill={C.text} />}
              </g>
            ) : null,
          )}
          {w.never.opacity > 0 && (
            <text x={0} y={-1.45} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={fs(48)} fill={C.text} opacity={w.never.opacity * (0.55 + 0.45 * w.never.breathe)}>
              never sampled
            </text>
          )}

          {/* The model's promised route straight through the ring (model 2). */}
          {w.promised.draw > 0 && (
            <g>
              <line x1={START.x} y1={0} x2={START.x + (0 - START.x) * w.promised.draw} y2={0} stroke={C.cyan} strokeWidth={px * 6} strokeDasharray={`${px * 20} ${px * 14}`} strokeLinecap="round" />
              {w.promised.draw > 0.95 && (
                <text x={-6.75} y={-0.7} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={fs(38)} fill={C.cyan}>
                  promised route
                </text>
              )}
            </g>
          )}

          {/* The high-value spot. */}
          <g opacity={w.star.opacity}>
            <circle cx={0} cy={0} r={0.9} fill={alpha(C.gold, 0.18)} />
            <path d={starPath(0.58)} fill={C.gold} />
          </g>
          {w.goal2.opacity > 0 && (
            <g opacity={w.goal2.opacity} transform={`translate(${GOAL2.x} ${GOAL2.y})`}>
              <circle r={0.9 * 1.6} fill={alpha(C.gold, 0.18)} />
              <path d={starPath(0.58 * 1.6)} fill={C.gold} />
            </g>
          )}

          {/* One planner step just fits through the door (knee). */}
          {w.ghost.opacity > 0 && (
            <g opacity={w.ghost.opacity}>
              {[-5.55, -5.2, -4.85].map((x, i) => (
                <circle key={i} cx={x} cy={0} r={ROBOT_R} fill="none" stroke={C.cyan} strokeWidth={px * 3} opacity={0.5 + 0.25 * i} />
              ))}
            </g>
          )}
          {w.gapLabel.opacity > 0 && w.ring.gap > 0.01 && (
            <text x={w.gapLabel.x} y={w.gapLabel.y} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={fs(46)} fill={C.cyan} opacity={w.gapLabel.opacity}>
              {w.gapLabel.text}
            </text>
          )}

          {/* Robots, trails, contacts. */}
          {w.robots.map((r, i) => (
            <g key={i} opacity={r.opacity}>
              {r.trail > 0 && (
                <line x1={r.trailX} y1={r.trailY} x2={r.x} y2={r.y} stroke={alpha(r.kind === 'model' && w.robots.length > 1 ? C.roseText : C.text, 0.4)} strokeWidth={px * (r.kind === 'model' && w.robots.length > 1 ? 14 : 7)} strokeLinecap="round" />
              )}
              {r.kind === 'truth' || w.robots.length === 1 ? (
                <>
                  <circle cx={r.x} cy={r.y} r={ROBOT_R * 2.2} fill={alpha(C.text, 0.16)} />
                  <circle cx={r.x} cy={r.y} r={ROBOT_R} fill={C.text} />
                </>
              ) : (
                <circle cx={r.x} cy={r.y} r={ROBOT_R * 1.75} fill="none" stroke={C.roseText} strokeWidth={px * 5} />
              )}
              {r.label > 0 && (
                <text
                  x={r.x - 0.3}
                  y={r.kind === 'truth' ? r.y - 0.75 : r.y + 1.2}
                  textAnchor="end"
                  fontFamily={fontFamily}
                  fontWeight={700}
                  fontSize={fs(42)}
                  fill={r.kind === 'truth' ? C.text : C.roseText}
                  opacity={r.label}
                >
                  {r.kind}
                </text>
              )}
            </g>
          ))}
          {w.sparks.map((sp, i) => (
            <Spark key={i} x={sp.x} y={sp.y} pop={sp.pop} k={1} />
          ))}
          {w.cut.opacity > 0 && (
            <g opacity={w.cut.opacity}>
              <line x1={-RING.outer - 0.05} y1={-1.1} x2={-RING.outer - 0.05} y2={1.1} stroke={C.roseText} strokeWidth={px * 8} strokeLinecap="round" />
            </g>
          )}
        </g>
      </g>
    </svg>
  );
};

/** The whole story on one top-down map: reach as light, the model's mistakes as overlays. */
export const ReachMap: React.FC<AnimProps & ReachProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const st = stageOf(p.vertical);
  const W = p.vertical ? 1080 : st.w;
  const left = p.vertical ? 0 : st.side;
  const chipH = 92;
  const meterH = 196;

  if (s.mode === 'split' && s.bottom) {
    const rowH = 104;
    const mapH = (st.h - chipH - rowH - 16) / 2;
    const mapW = 600;
    const topBox: Box = { left: left + 24, top: st.top, w: mapW, h: mapH };
    const botBox: Box = { left: left + 24, top: st.top + mapH + rowH, w: mapW, h: mapH };
    const words = ['same model', 'same mistake', 'same hole'];
    const value = (txt: string, color: string, box: Box, lit: boolean) => (
      <div style={{ position: 'absolute', left: box.left + box.w - 10, width: W - box.w - 50, top: box.top, height: box.h, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontFamily }}>
        <div style={{ fontSize: 34, fontWeight: 600, color: C.muted }}>cost</div>
        <div style={{ fontSize: 104, fontWeight: 800, color, lineHeight: 1.05, fontVariantNumeric: 'tabular-nums' }}>{txt}</div>
        <div style={{ fontSize: 34, fontWeight: 700, color: lit ? C.accentText : C.muted, marginTop: 6 }}>{lit ? 'door on the route' : 'door behind'}</div>
      </div>
    );
    return (
      <div style={{ position: 'absolute', inset: 0 }}>
        <MapSvg w={s.world} box={topBox} id="top" t={p.t} labelScale={0.8} />
        <MapSvg w={s.bottom} box={botBox} id="bot" t={p.t} labelScale={0.8} />
        {value('0.029', C.accentText, topBox, true)}
        {value('1.116', C.roseText, botBox, false)}
        <div style={{ position: 'absolute', left: 0, right: 0, top: st.top + mapH + 8, height: rowH - 16, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22, fontFamily }}>
          {words.map((wd, i) => (
            <div
              key={wd}
              style={{
                opacity: s.split.ticks[i],
                transform: `translateY(${(1 - s.split.ticks[i]) * 16}px)`,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 20px',
                borderRadius: 999,
                background: alpha(C.card, 0.95),
                border: `2px solid ${alpha(C.muted, 0.35)}`,
                fontSize: 36,
                fontWeight: 700,
                color: C.text,
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ color: C.ok }}>✓</span>
              {wd}
            </div>
          ))}
        </div>
        {p.chip && <ModelChip text={tx(p.chip, p.lang)} top={st.top + st.h - chipH + 10} opacity={s.chip.opacity} slide={0} />}
      </div>
    );
  }

  // The same box in every map scene, so the map never jumps when one scene blends into the next.
  const mapTop = st.top + meterH;
  const mapH = st.h - meterH - chipH;
  const box: Box = { left, top: mapTop, w: W, h: mapH };
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <MapSvg w={s.world} box={box} id="map" t={p.t} full />
      {s.headline.map((h) =>
        h.opacity > 0 && h.reveal > 0 ? (
          <div key={h.text} style={{ position: 'absolute', left: 0, right: 0, top: st.top + 40, display: 'flex', justifyContent: 'center', opacity: h.opacity }}>
            <div
              style={{
                fontFamily,
                fontSize: 84,
                fontWeight: 800,
                letterSpacing: '-0.02em',
                whiteSpace: 'nowrap',
                // A gradient sweeps across the phrase: the text grows visible from left to right.
                backgroundImage: `linear-gradient(90deg, ${C.text} 0%, ${C.text} ${h.reveal * 120 - 25}%, ${C.roseText} ${h.reveal * 120 - 8}%, transparent ${h.reveal * 120}%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {h.text}
            </div>
          </div>
        ) : null,
      )}
      <MeterHud s={s.meter} top={st.top + 4} />
      {p.chip && <ModelChip text={tx(p.chip, p.lang)} top={st.top + st.h - chipH + 10} opacity={s.chip.opacity} slide={s.chip.slide} />}
    </div>
  );
};
