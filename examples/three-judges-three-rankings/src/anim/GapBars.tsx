import React from 'react';
import { C, alpha } from '../brand.ts';
import type { AnimProps } from './types.ts';
import { Stage } from './Stage.tsx';
import { ROW_Y, X0, frameState, xOf, type GapBarsProps } from './GapBars.state.ts';
import { FAM_C, StageSvg } from './pieces.tsx';
import { FULL } from './judges.ts';

export { frameState };

const mix = (a: string, b: string, k: number) => (k > 0.5 ? b : a);

/** Self-preference deltas per judge with 95 % CI whiskers; then the no-stake baseline. */
export const GapBars: React.FC<AnimProps & GapBarsProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const top = ROW_Y[0] - 70;
  const bottom = ROW_Y[2] + 178;
  return (
    <Stage vertical={p.vertical} fill>
      <StageSvg>
        <g opacity={s.titlePeers}>
          <text x={480} y={196} textAnchor="middle" fontSize={42} fontWeight={800} fill={C.text}>
            How much more each judge picks
          </text>
          <text x={480} y={246} textAnchor="middle" fontSize={42} fontWeight={800} fill={C.text}>
            its own answer than its peers do
          </text>
        </g>
        <g opacity={s.titleNeutral}>
          <text x={480} y={196} textAnchor="middle" fontSize={42} fontWeight={800} fill={C.text}>
            Baseline: the judge
          </text>
          <text x={480} y={246} textAnchor="middle" fontSize={42} fontWeight={800} fill="url(#jgrad)">
            with no stake in the pair
          </text>
        </g>
        {/* The 20-30 pp band. */}
        <g opacity={s.band}>
          <rect x={xOf(20)} y={top} width={xOf(30) - xOf(20)} height={bottom - top} fill={alpha(C.accentText, 0.13)} />
          <text x={(xOf(20) + xOf(30)) / 2} y={top + 30} textAnchor="middle" fontSize={26} fontWeight={700} fill={C.accentText}>
            20–30
          </text>
        </g>
        <g opacity={s.axis}>
          <line x1={X0} y1={top} x2={X0} y2={bottom} stroke={alpha(C.text, 0.8)} strokeWidth={4} />
          {[0, 10, 20, 30, 40].map((v) => (
            <g key={v}>
              <line x1={xOf(v)} y1={bottom} x2={xOf(v)} y2={bottom + 12} stroke={alpha(C.text, 0.5)} strokeWidth={3} />
              <text x={xOf(v)} y={bottom + 44} textAnchor="middle" fontSize={28} fontWeight={600} fill={C.muted}>
                {v === 0 ? '0' : `+${v}`}
              </text>
            </g>
          ))}
          <text x={xOf(45)} y={bottom + 44} textAnchor="end" fontSize={28} fontWeight={700} fill={C.muted}>
            pp
          </text>
          <text x={480} y={bottom + 88} textAnchor="middle" fontSize={28} fontWeight={600} fill={C.muted}>
            same pairs · bars with 95% CI
          </text>
        </g>
        {s.rows.map((r) => {
          const col = mix(FAM_C[r.fam], C.muted, r.mute);
          const y = r.y;
          const bx = Math.min(X0, xOf(r.value));
          const bw = Math.abs(xOf(r.value) - X0);
          return (
            <g key={r.fam} opacity={Math.max(0.0, Math.min(1, r.grow * 3))}>
              <text x={X0 + 10} y={y - 22} fontSize={34} fontWeight={800} fill={col}>
                {FULL[r.fam]}
              </text>
              <text x={900} y={y - 20} textAnchor="end" fontSize={42} fontWeight={800} fill={r.mute > 0.5 ? C.muted : C.text}>
                {r.text}
              </text>
              {r.ghost > 0.01 && (
                <rect x={X0} y={y} width={xOf(r.ghostValue) - X0} height={58} rx={8} fill="none" stroke={alpha(FAM_C[r.fam], 0.55 * r.ghost)} strokeWidth={2.5} strokeDasharray="8 6" />
              )}
              <rect x={bx} y={y} width={bw} height={58} rx={8} fill={alpha(col, r.mute > 0.5 ? 0.45 : 0.85)} />
              <g opacity={r.ciDraw}>
                <line x1={xOf(r.lo)} y1={y + 29} x2={xOf(r.hi)} y2={y + 29} stroke={C.text} strokeWidth={4} />
                <line x1={xOf(r.lo)} y1={y + 12} x2={xOf(r.lo)} y2={y + 46} stroke={C.text} strokeWidth={4} />
                <line x1={xOf(r.hi)} y1={y + 12} x2={xOf(r.hi)} y2={y + 46} stroke={C.text} strokeWidth={4} />
                <text x={900} y={y + 100} textAnchor="end" fontSize={28} fontWeight={600} fill={C.muted}>
                  95% CI {r.ci}
                </text>
              </g>
              {r.query > 0.01 && (
                <g opacity={r.query} transform={`translate(${X0 + 10} ${y + 146})`}>
                  <text x={0} y={0} fontSize={30} fontWeight={800} fill={C.warm}>
                    ? indistinguishable from zero
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </StageSvg>
    </Stage>
  );
};
