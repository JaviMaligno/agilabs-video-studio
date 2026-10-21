import React from 'react';
import { C, alpha } from '../brand.ts';
import type { AnimProps } from './types.ts';
import { CaseTag, Canvas, Gauge, Stamp } from './pieces.tsx';
import { EXPECTED } from './RiggedGauge.state.ts';
import { PAIRS, frameState, type MergeProps } from './MergeStrips.state.ts';

const TW = 150;
const TH = 56;
const tileXY = (i: number) => ({ x: (i % 6) * (TW + 12), y: 525 + Math.floor(i / 6) * (TH + 12) });

const Spark: React.FC<{ x: number; y: number; s: number; opacity: number }> = ({ x, y, s, opacity }) =>
  opacity <= 0 ? null : (
    <g transform={`translate(${x} ${y})`} opacity={opacity}>
      <path
        d={Array.from({ length: 16 }, (_, k) => {
          const a = (k / 16) * Math.PI * 2;
          const r = k % 2 === 0 ? s : s * 0.42;
          return `${k === 0 ? 'M' : 'L'} ${(r * Math.cos(a)).toFixed(1)} ${(r * Math.sin(a)).toFixed(1)}`;
        }).join(' ') + ' Z'}
        fill={C.rose}
        filter="url(#glow)"
      />
    </g>
  );

export const MergeStrips: React.FC<AnimProps & MergeProps> = (p) => {
  const s = frameState({}, p.t, p.beats, p.dur);
  const after = s.gauge.after > 0;
  return (
    <Canvas vertical={p.vertical}>
      <CaseTag n="2" text="an inherited benchmark" opacity={s.tag} />

      {/* two patches into one file */}
      <g opacity={s.file}>
        <rect x={250} y={110} width={460} height={330} rx={24} fill={C.card} stroke={alpha(C.muted, 0.5)} strokeWidth={3} />
        <text x={280} y={160} fontSize={30} fontWeight={700} fill={C.muted}>
          one file
        </text>
        {[195, 245, 295].map((y, k) => (
          <rect key={`a${k}`} x={290 - 520 * (1 - s.stripA)} y={y} width={240} height={30} rx={8} fill={C.accent2} />
        ))}
        {[245, 295, 345].map((y, k) => (
          <rect key={`b${k}`} x={430 + 520 * (1 - s.stripB)} y={y + 10} width={240} height={30} rx={8} fill={alpha(C.accentText, 0.9)} />
        ))}
        <text x={20} y={300} fontSize={30} fontWeight={700} fill={C.accent2} opacity={s.stripA}>
          agent A
        </text>
        <text x={940} y={300} fontSize={30} fontWeight={700} textAnchor="end" fill={C.accentText} opacity={s.stripB}>
          agent B
        </text>
        <Spark x={480} y={288} s={58} opacity={s.spark} />
      </g>
      <Stamp x={480} y={350} text="FAIL" size={78} color={C.roseText} scale={s.fail.scale} opacity={s.fail.opacity} />

      {/* the 29 conflicted pairs */}
      <text x={480} y={500} fontSize={40} fontWeight={800} textAnchor="middle" fill={C.text} opacity={s.pairsLabel}>
        29 conflicted pairs
      </text>
      {Array.from({ length: PAIRS }, (_, i) => {
        const pr = s.pairs[i];
        if (pr.pop <= 0) return null;
        const { x, y } = tileXY(i);
        const border = pr.pass > 0 ? alpha(C.ok, 0.4 + 0.6 * pr.pass) : pr.heal > 0 ? alpha(C.muted, 0.4) : alpha(C.rose, 0.8);
        return (
          <g key={i} opacity={pr.pop} transform={`translate(${x} ${y})`}>
            <rect width={TW} height={TH} rx={12} fill={pr.pass > 0 ? alpha(C.ok, 0.18 * pr.pass) : C.card} stroke={border} strokeWidth={3} />
            {pr.pass > 0.5 ? (
              <text x={TW / 2} y={39} fontSize={30} fontWeight={900} textAnchor="middle" fill={C.ok}>
                PASS
              </text>
            ) : (
              <>
                <rect x={14} y={14} width={80} height={12} rx={6} fill={C.accent2} />
                <rect x={56} y={22 + 10 * pr.heal} width={80} height={12} rx={6} fill={C.accentText} />
                <Spark x={76} y={27} s={16} opacity={1 - pr.heal} />
              </>
            )}
          </g>
        );
      })}

      {/* the gauge: pass rate */}
      <g opacity={s.gauge.opacity * (1 - 0.9 * s.held.opacity)}>
        <text x={440} y={205} fontSize={36} fontWeight={700} textAnchor="end" fill={C.accentText} opacity={s.gauge.expected}>
          two agents
        </text>
        <text x={440} y={250} fontSize={36} fontWeight={700} textAnchor="end" fill={C.accentText} opacity={s.gauge.expected}>
          at once fail
        </text>
        <text x={440} y={370} fontSize={32} fontWeight={800} textAnchor="end" fill={C.roseText} opacity={s.bug}>
          bug: missing
        </text>
        <text x={440} y={410} fontSize={32} fontWeight={800} textAnchor="end" fill={C.roseText} opacity={s.bug}>
          conflict resolver
        </text>
      </g>
      <Gauge
        g={{
          cx: 650,
          cy: 290,
          r: 165,
          value: s.gauge.value,
          opacity: s.gauge.opacity,
          lift: s.gauge.lift,
          expected: { ...EXPECTED, opacity: s.gauge.expected },
          magnets: [{ v: 0.16, opacity: 1, out: s.gauge.magnetOut, glow: s.gauge.lift }],
          readout: after ? '9%' : '7%',
          readoutSize: 52,
        }}
      />

      {/* the fix */}
      <text x={480} y={895} fontSize={32} fontWeight={700} textAnchor="middle" fill={C.muted} opacity={s.half}>
        about half: not real collisions
      </text>
      {[
        { name: 'weaker model', val: '7% → 7%' },
        { name: 'stronger model', val: '7% → 9%' },
      ].map((r, i) => (
        <g key={r.name} opacity={s.rows[i]}>
          <text x={20} y={965 + i * 70} fontSize={36} fontWeight={600} fill={C.muted}>
            {r.name}
          </text>
          <text x={560} y={965 + i * 70} fontSize={48} fontWeight={800} textAnchor="middle" fill={C.text}>
            {r.val}
          </text>
        </g>
      ))}
      <g opacity={s.plus}>
        <rect x={720} y={990} width={200} height={62} rx={31} fill={alpha(C.ok, 0.18)} stroke={C.ok} strokeWidth={3} />
        <text x={820} y={1033} fontSize={36} fontWeight={800} textAnchor="middle" fill={C.ok}>
          +1 task
        </text>
      </g>

      <Stamp x={600} y={300} text="" lines={['CONCLUSION', 'HELD']} size={70} color={C.accentText} scale={s.held.scale} opacity={s.held.opacity} rotate={-6} />
    </Canvas>
  );
};
