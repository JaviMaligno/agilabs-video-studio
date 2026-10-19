import React from 'react';
import { C, alpha } from '../brand.ts';
import { Stage, stageOf } from './Stage.tsx';
import type { AnimProps } from './types.ts';
import { BAR, DISC, PARTICLES, STRANDS, frameState, particleAt, strandX } from './ContinuumBreak.state.ts';
import { VortexThreads } from './vortexDraw.tsx';
import { MFP_LABEL } from './labels.tsx';

const TUBE = { top: 250, bottom: 1040 };
const EDGE_Y = 450;

export const ContinuumBreak: React.FC<AnimProps> = ({ t, beats, dur, vertical }) => {
  const s = frameState({}, t, beats, dur);
  const { w, h } = stageOf(vertical);
  const cx = w / 2;
  const tubeH = Math.min(h - 50, TUBE.bottom) - TUBE.top;
  const wd = s.width * s.zoom;
  const hw = wd / 2 + (DISC - wd / 2) * s.pull;
  const hh = tubeH / 2 + (DISC - tubeH / 2) * s.pull;
  const cy = TUBE.top + tubeH / 2 + (EDGE_Y - TUBE.top - tubeH / 2) * s.pull;
  const tm = s.time;

  const strands =
    s.strands.opacity > 0.01
      ? Array.from({ length: STRANDS }, (_, k) => {
          const pts: string[] = [];
          let depth = 0;
          for (let y = 0; y <= tubeH; y += 12) {
            const p = strandX(k, y, wd, tm);
            depth += p.depth;
            pts.push(`${(cx + p.x).toFixed(1)} ${(TUBE.top + y).toFixed(1)}`);
          }
          return { d: 'M' + pts.join('L'), depth: depth / (tubeH / 12 + 1) };
        })
      : [];
  const parts =
    s.particles.opacity > 0.01 ? Array.from({ length: PARTICLES }, (_, i) => particleAt(i, tm, hw, hh, wd, s.particles.bounce, s.pull)) : [];
  const barW = BAR * s.zoom;
  return (
    <Stage vertical={vertical} fill>
      <svg width={w} height={h} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <defs>
          <filter id="cb-glow" x="-30%" y="-10%" width="160%" height="120%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
          <linearGradient id="cb-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={C.accent} />
            <stop offset="1" stopColor={C.accent2} />
          </linearGradient>
        </defs>
        {s.outer.opacity > 0 && (
          <g>
            <VortexThreads
              cam={{ cx, cy: EDGE_Y, scale: 430, elev: 90, angle: tm * 0.55, tau: 1 }}
              coil={1}
              glow={1}
              axial={0}
              guides={0}
              flow={(tm * 0.12) % 1}
              opacity={s.outer.opacity}
              idPrefix="cb"
            />
            <circle cx={cx} cy={EDGE_Y} r={DISC + 12} fill={C.bg0} opacity={s.outer.opacity} />
          </g>
        )}
        {strands.length > 0 && (
          <g opacity={s.strands.opacity}>
            <g filter="url(#cb-glow)" opacity={0.7}>
              {strands.map((st, k) => (
                <path key={k} d={st.d} stroke={k % 3 === 0 ? C.accent2 : C.accent} strokeWidth={7} fill="none" />
              ))}
            </g>
            {strands.map((st, k) => (
              <path key={k} d={st.d} stroke={k % 3 === 0 ? C.accent2 : C.accentText} strokeWidth={3} strokeOpacity={0.55 + 0.45 * Math.abs(st.depth)} fill="none" />
            ))}
          </g>
        )}
        {parts.length > 0 && (
          <g opacity={s.particles.opacity}>
            {parts.map((p, i) => (
              <circle key={i} cx={cx + p.x} cy={cy + p.y} r={7 - 2.5 * s.pull} fill={i % 4 === 0 ? C.accent2 : C.accentText} />
            ))}
          </g>
        )}
        {s.ring.opacity > 0 && (
          <circle cx={cx} cy={EDGE_Y} r={DISC + 12} stroke="url(#cb-ring)" strokeWidth={6} fill="none" opacity={s.ring.opacity} style={{ filter: `drop-shadow(0 0 14px ${alpha(C.accent2, 0.9)})` }} />
        )}
        {s.bar.opacity > 0 && (
          <g opacity={s.bar.opacity} stroke={s.bar.under > 0.5 ? C.accentText : C.text} strokeWidth={6} strokeLinecap="round">
            <line x1={cx - barW / 2} y1={190} x2={cx + barW / 2} y2={190} />
            <line x1={cx - barW / 2} y1={168} x2={cx - barW / 2} y2={212} />
            <line x1={cx + barW / 2} y1={168} x2={cx + barW / 2} y2={212} />
          </g>
        )}
        <Icons s={s} w={w} h={h} />
      </svg>
      {s.bar.opacity > 0 && (
        <div style={{ position: 'absolute', left: 0, width: w, top: 70, textAlign: 'center', fontSize: 46, fontWeight: 700, color: C.text, opacity: s.bar.opacity }}>
          {MFP_LABEL}
        </div>
      )}
    </Stage>
  );
};

/** Wing, cloud, artery: line icons that sit calmly outside the ring. */
const Icons: React.FC<{ s: ReturnType<typeof frameState>; w: number; h: number }> = ({ s, w, h }) => {
  const y = h - 190;
  const xs = [w * 0.18, w * 0.5, w * 0.82];
  const stroke = { stroke: C.text, strokeWidth: 6, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const labels = ['wing', 'weather', 'blood flow'];
  return (
    <g>
      {xs.map((x, i) => {
        const o = s.icons[i].opacity;
        if (o <= 0) return null;
        return (
          <g key={i} opacity={o} transform={`translate(${x} ${y + (1 - o) * 14})`}>
            <rect x={-125} y={-70} width={250} height={140} rx={28} fill={alpha(C.card, 0.85)} stroke={alpha(C.accent, 0.45)} strokeWidth={2.5} />
            {i === 0 && (
              <g {...stroke}>
                <path d="M-80 4 C-60 -30 20 -34 82 -2 C30 10 -40 16 -80 4 Z" />
                <path d="M-90 30 L-50 30 M-30 34 L20 34 M40 30 L84 30" stroke={C.accentText} strokeWidth={4} />
              </g>
            )}
            {i === 1 && (
              <g {...stroke}>
                <path d="M-62 26 C-92 26 -92 -16 -60 -14 C-58 -48 -8 -56 6 -26 C22 -46 60 -36 56 -8 C88 -6 86 26 58 26 Z" />
              </g>
            )}
            {i === 2 && (
              <g {...stroke}>
                <path d="M-90 -18 C-40 -40 20 6 90 -22" />
                <path d="M-90 22 C-40 0 20 46 90 18" />
                {[-52, 0, 48].map((cx2, k) => (
                  <ellipse key={k} cx={cx2} cy={k === 1 ? 4 : k === 0 ? -6 : -2} rx={13} ry={8} stroke={C.accentText} strokeWidth={4} />
                ))}
              </g>
            )}
            <text x={0} y={112} textAnchor="middle" fontSize={34} fontWeight={600} fill={C.muted} stroke="none">
              {labels[i]}
            </text>
          </g>
        );
      })}
    </g>
  );
};
