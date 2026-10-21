import React from 'react';
import { C, alpha } from '../brand.ts';
import type { AnimProps } from './types.ts';
import { CaseTag, Canvas, Gauge, MagnetGlyph } from './pieces.tsx';
import { arcPath, polar } from './gauge.ts';
import { BAND, FLAWS, MAGNET_AT, REPORTED, ROWS, frameState, type AnswerKeyProps } from './AnswerKey.state.ts';

const GX = 480;
const GY = 800;
const GR = 215;

export const AnswerKey: React.FC<AnimProps & AnswerKeyProps> = (p) => {
  const s = frameState({ cont: p.cont }, p.t, p.beats, p.dur);
  const after = s.after > 0;
  const bl = polar(GX, GY, GR * 1.3, (REPORTED + BAND.from) / 2);
  return (
    <Canvas vertical={p.vertical}>
      <CaseTag n="3" text="the reference" opacity={s.tag} />

      {/* the external report */}
      <g opacity={s.report} transform={`translate(480 270) scale(${0.9 + 0.1 * s.report}) translate(-480 -270)`}>
        <rect x={150} y={110} width={660} height={330} rx={28} fill={C.card} stroke={alpha(C.accentText, 0.5)} strokeWidth={3} />
        <text x={480} y={170} fontSize={34} fontWeight={700} textAnchor="middle" fill={C.muted}>
          external report
        </text>
        <text x={480} y={330} fontSize={160} fontWeight={900} textAnchor="middle" fill={C.text}>
          54%
        </text>
        <text x={480} y={400} fontSize={38} fontWeight={700} textAnchor="middle" fill={C.accentText}>
          accuracy · 500 companies
        </text>
      </g>

      {/* the answer key: the name gives the label away */}
      <g opacity={s.key}>
        <text x={0} y={140} fontSize={34} fontWeight={800} fill={C.muted} letterSpacing={3}>
          ANSWER KEY
        </text>
        {ROWS.map(([pre, tell, post, label], i) => {
          const r = s.rows[i];
          const y = 225 + i * 100;
          const wordX = pre.length * 40 * 0.56 + (tell.length * 40 * 0.56) / 2;
          const chipW = label.length * 20 + 44;
          const chipX = 960 - chipW;
          return (
            <g key={i} opacity={r.show}>
              <text x={0} y={y} fontSize={40} fontWeight={600} fill={C.text} style={{ whiteSpace: 'pre' }}>
                {pre}
                <tspan fill={r.tell > 0.5 ? C.accentText : C.text} fontWeight={r.tell > 0.5 ? 900 : 600} textDecoration={r.tell > 0.5 ? 'underline' : undefined}>
                  {tell}
                </tspan>
                {post}
              </text>
              <path
                d={`M ${wordX} ${y - 40} Q ${(wordX + chipX) / 2} ${y - 95} ${chipX - 8} ${y - 20}`}
                stroke={C.accentText}
                strokeWidth={4}
                fill="none"
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset={1 - r.jump}
                opacity={r.jump > 0 ? 1 : 0}
              />
              <rect x={chipX} y={y - 40} width={chipW} height={54} rx={27} fill={alpha(C.accent, 0.25 + 0.35 * r.jump)} stroke={C.accentText} strokeWidth={2} />
              <text x={chipX + chipW / 2} y={y - 3} fontSize={32} fontWeight={700} textAnchor="middle" fill={C.text}>
                {label}
              </text>
            </g>
          );
        })}
      </g>

      {/* the comparator's three flaws */}
      {FLAWS.map((f, i) => (
        <g key={f} opacity={s.flaws[i]} transform={`translate(${-30 * (1 - s.flaws[i])} 0)`}>
          <g transform={`translate(40 ${168 + i * 105})`}>
            <MagnetGlyph s={56} />
          </g>
          <circle cx={112} cy={158 + i * 105} r={24} fill={C.rose} />
          <text x={112} y={170 + i * 105} fontSize={36} fontWeight={900} textAnchor="middle" fill={C.text}>
            −
          </text>
          <text x={156} y={172 + i * 105} fontSize={44} fontWeight={700} fill={C.text}>
            {f}
          </text>
        </g>
      ))}

      {/* the gauge: accuracy */}
      <g opacity={s.bracket}>
        <path d={arcPath(GX, GY, GR * 1.1, REPORTED, BAND.from)} stroke={C.ok} strokeWidth={5} fill="none" strokeDasharray="10 8" />
        <text x={bl.x + 8} y={bl.y} fontSize={40} fontWeight={800} fill={C.ok}>
          ~20 points
        </text>
      </g>
      <Gauge
        g={{
          cx: GX,
          cy: GY,
          r: GR,
          value: s.value,
          opacity: s.gauge,
          lift: s.lift,
          band: { ...BAND, opacity: s.band },
          magnets: MAGNET_AT.map((v, i) => ({ v, ...s.magnets[i] })),
          readout: after ? '75%-85%' : '54%',
          readoutSize: after ? 54 : 64,
          readoutColor: after ? C.ok : C.text,
        }}
      />
    </Canvas>
  );
};
