import React from 'react';
import { C, alpha } from '../brand.ts';
import type { AnimProps } from './types.ts';
import { Stage } from './Stage.tsx';
import { BASE_Y, CHIP_Y, frameState, othersText, tokenAt, type PodiumsProps } from './Podiums.state.ts';
import { Chip, Crown, FAM_C, PodiumSteps, StageSvg, Token } from './pieces.tsx';
import { FAMS, SCORE_TXT } from './judges.ts';

export { frameState };

/** Three podiums from the ranking table; crowns; each judge's own card linked across. */
export const Podiums: React.FC<AnimProps & PodiumsProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const self = p.mode === 'self';
  return (
    <Stage vertical={p.vertical} fill>
      <StageSvg>
        <g opacity={s.title}>
          <text x={480} y={204} textAnchor="middle" fontSize={40} fontWeight={800} fill={C.text}>
            Same 45 comparisons. <tspan fill="url(#jgrad)">Three rankings.</tspan>
          </text>
        </g>
        {s.columns.map((col) => (
          <PodiumSteps
            key={col.judge}
            x={col.x}
            baseY={BASE_Y}
            rise={col.rise}
            values={col.values}
            steps={col.steps.map((st) => ({ fam: st.fam, dx: st.x - col.x, h: st.h, text: st.text }))}
          />
        ))}
        {s.links.map((l, i) =>
          l.draw > 0.01 ? (
            <line
              key={i}
              x1={l.from[0]}
              y1={l.from[1]}
              x2={l.from[0] + (l.to[0] - l.from[0]) * l.draw}
              y2={l.from[1] + (l.to[1] - l.from[1]) * l.draw}
              stroke={FAM_C[l.fam]}
              strokeWidth={4}
              strokeDasharray="9 8"
              opacity={0.85}
            />
          ) : null,
        )}
        {s.columns.map((col, ji) =>
          col.steps.map((st) => {
            const [x, y] = tokenAt(ji, st.fam);
            const own = st.fam === col.judge;
            const dim = self && !own ? 0.55 : 1;
            return (
              <g key={col.judge + st.fam} transform={`translate(0 ${(1 - col.tokens) * -60})`} opacity={col.tokens * dim}>
                <Token fam={st.fam} x={x} y={y} glow={own ? col.glow : 0} />
              </g>
            );
          }),
        )}
        {s.columns.map((col, ji) => {
          const top = col.steps.find((st) => st.rank === 0)!;
          const [x, y] = tokenAt(ji, top.fam);
          return <Crown key={col.judge} fam={top.fam} x={x} y={y - 52} drop={col.crown} />;
        })}
        {s.columns.map((col) => (
          <g key={col.judge}>
            <Chip fam={col.judge} x={col.x} y={CHIP_Y} appear={col.chip} clip={1} glow={col.glow * 0.6} />
            <text x={col.x} y={CHIP_Y - 62} textAnchor="middle" fontSize={24} fontWeight={700} fill={C.muted} opacity={col.chip} letterSpacing="0.08em">
              JUDGE
            </text>
          </g>
        ))}
        {s.columns.map((col) =>
          col.self > 0.01 ? (
            <g key={col.judge} opacity={col.self} transform={`translate(0 ${(1 - col.self) * 20})`}>
              <text x={col.x} y={BASE_Y + 66} textAnchor="middle" fontSize={50} fontWeight={800} fill={FAM_C[col.judge]}>
                {SCORE_TXT[col.judge][col.judge]}
              </text>
              <text x={col.x} y={BASE_Y + 112} textAnchor="middle" fontSize={32} fontWeight={600} fill={C.muted}>
                vs {othersText(col.judge)}
              </text>
            </g>
          ) : null,
        )}
              </StageSvg>
    </Stage>
  );
};
