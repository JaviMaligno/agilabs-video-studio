import React from 'react';
import { C, alpha } from '../brand.ts';
import type { AnimProps } from './types.ts';
import { Canvas, Gauge, MagnetGlyph, Magnifier, Stamp } from './pieces.tsx';
import { EXPECTED } from './RiggedGauge.state.ts';
import { polar } from './gauge.ts';
import { BELT, BIN, SHELF, STATION, frameState, type StoppingProps } from './StoppingRule.state.ts';

const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

export const StoppingRule: React.FC<AnimProps & StoppingProps> = (p) => {
  const s = frameState({}, p.t, p.beats, p.dur);
  const cmp = s.compare;
  const needle = lerp(0.45, 0.17, cmp.snap);
  const binned = s.items.filter((it) => it.kind === 'contradict' && it.binned > 0);
  return (
    <Canvas vertical={p.vertical}>
      {/* 0: the three opened gauges, random vs these */}
      <g opacity={cmp.opacity}>
        <text x={480} y={110} fontSize={52} fontWeight={800} textAnchor="middle" fill={C.muted} opacity={Math.max(0, 1 - 2 * cmp.snap)}>
          random bugs: both ways
        </text>
        <text x={480} y={110} fontSize={52} fontWeight={800} textAnchor="middle" fill={C.roseText} opacity={Math.max(0, 2 * cmp.snap - 1)}>
          these: all one way
        </text>
        {[170, 480, 790].map((cx, i) => (
          <g key={cx}>
            <Gauge
              g={{
                cx,
                cy: 380,
                r: 135,
                value: needle,
                lift: 0.45,
                expected: { ...EXPECTED, opacity: 1 },
                magnets: [{ v: 0.17, opacity: cmp.snap, glow: cmp.snap }],
                ghosts: [0.13, 0.29, 0.61, 0.77],
                ghostOpacity: cmp.ghosts * 0.8,
              }}
            />
            <text x={cx} y={600} fontSize={40} fontWeight={800} textAnchor="middle" fill={C.text}>
              {i + 1}
            </text>
            <path d={`M ${cx + 50} 680 L ${cx - 40} 680 M ${cx - 10} 655 L ${cx - 45} 680 L ${cx - 10} 705`} stroke={C.rose} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={cmp.arrows} />
          </g>
        ))}
      </g>

      {/* 1-2: the conveyor */}
      <g opacity={s.stage}>
        <line x1={SHELF.xs[0] - 100} y1={SHELF.y + 92} x2={960} y2={SHELF.y + 92} stroke={C.ok} strokeWidth={8} strokeLinecap="round" />
        <text x={650} y={SHELF.y + 150} fontSize={36} fontWeight={800} textAnchor="middle" fill={C.ok} opacity={1 - 0.85 * s.audit.lens}>
          DONE · stopped looking
        </text>
        <line x1={0} y1={BELT.y + 100} x2={BELT.x1 + 100} y2={BELT.y + 100} stroke={alpha(C.muted, 0.7)} strokeWidth={8} strokeDasharray="26 14" />
        <text x={BELT.x1 - 150} y={BELT.y - 130} fontSize={36} fontWeight={800} textAnchor="middle" fill={C.text}>
          as expected?
        </text>
        <path d={`M ${BELT.x1 + 60} ${BELT.y - 120} Q ${BELT.x1 + 90} ${SHELF.y + 120} ${SHELF.xs[0] - 90} ${SHELF.y + 60}`} stroke={C.ok} strokeWidth={5} fill="none" strokeDasharray="12 10" />
        <text x={BELT.x1 + 50} y={BELT.y - 215} fontSize={34} fontWeight={800} textAnchor="end" fill={C.ok}>
          yes
        </text>
        <path d={`M ${BELT.x1 + 90} ${BELT.y + 40} Q ${BELT.x1 + 140} ${STATION.y} ${STATION.x - 110} ${STATION.y}`} stroke={C.roseText} strokeWidth={5} fill="none" strokeDasharray="12 10" />
        <text x={BELT.x1 + 70} y={BELT.y + 170} fontSize={34} fontWeight={800} fill={C.roseText}>
          no
        </text>
        <Magnifier x={STATION.x} y={STATION.y} m={112} opacity={0.55} />
        <text x={STATION.x} y={STATION.y + 190} fontSize={34} fontWeight={800} textAnchor="middle" fill={C.roseText}>
          dig
        </text>
        <rect x={BIN.x - 80} y={BIN.y - 30} width={160} height={70} rx={14} fill={alpha(C.rose, 0.12)} stroke={C.rose} strokeWidth={3} />
        <text x={BIN.x} y={BIN.y + 78} fontSize={30} fontWeight={800} textAnchor="middle" fill={C.roseText}>
          bugs found
        </text>
      </g>
      {s.items.map((it, i) => {
        const auditing = i === 0 ? s.audit.lift : 0;
        return (
          <g key={i}>
            <Gauge
              g={{
                cx: it.x,
                cy: it.y,
                r: it.r,
                value: it.value,
                opacity: it.opacity,
                lift: Math.max(it.lift, auditing),
                xray: it.xray * (1 - auditing),
                okRim: it.done.opacity,
                expected: { ...EXPECTED, opacity: 1 },
                magnets: [{ v: it.magnetV, opacity: it.binned > 0 ? 0 : 1, glow: Math.max(it.lift, auditing) }],
              }}
            />
            <Stamp x={it.x} y={it.y + it.r * 0.95} text="DONE" size={34} color={C.ok} scale={it.done.scale} opacity={it.done.opacity * it.opacity} rotate={-6} />
          </g>
        );
      })}
      {binned.map((it, i) => {
        const from = polar(STATION.x, STATION.y - STATION.r * 0.75, STATION.r * 0.6, it.magnetV);
        const to = { x: BIN.x - 30 + i * 60, y: BIN.y + 5 };
        const q = it.binned;
        return (
          <g key={i} transform={`translate(${lerp(from.x, to.x, q)} ${lerp(from.y, to.y, q) - Math.sin(Math.PI * q) * 120})`}>
            <MagnetGlyph s={48} glow={1 - q} />
          </g>
        );
      })}

      {/* 4: audit the DONE shelf */}
      <text x={480} y={80} fontSize={44} fontWeight={800} textAnchor="middle" fill={C.accentText} opacity={s.audit.label}>
        audit where it pleased you
      </text>
      <Magnifier x={s.audit.x} y={SHELF.y} m={100} opacity={s.audit.lens} />
      {s.audit.lift > 0 && (
        <g transform={`translate(${SHELF.xs[0] - 150} ${SHELF.y - 10}) scale(${0.6 + 0.4 * s.audit.lift})`} opacity={s.audit.lift}>
          <MagnetGlyph s={70} glow={1} />
        </g>
      )}

      {/* 3: the verdict */}
      <rect x={-80} y={-300} width={1120} height={1700} fill={alpha(C.bg0, 0.97 * s.verdict.scrim)} />
      <g opacity={s.verdict.line1}>
        <text x={480} y={470} fontSize={58} fontWeight={800} textAnchor="middle" fill={C.text}>
          The instrument isn't biased.
        </text>
      </g>
      <g opacity={s.verdict.line2}>
        <text x={480} y={600} fontSize={74} fontWeight={900} textAnchor="middle" fill={C.text}>
          My <tspan fill={C.accentText}>stopping rule</tspan> is.
        </text>
        <rect x={258} y={624} width={460 * s.verdict.underline} height={9} rx={4} fill={C.accent2} />
      </g>
    </Canvas>
  );
};
