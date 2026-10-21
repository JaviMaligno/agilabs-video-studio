import React from 'react';
import { C, alpha } from '../brand.ts';
import type { AnimProps } from './types.ts';
import { Stage } from './Stage.tsx';
import { BAR_W, GROUP_X, PPX, ZERO_Y, frameState, type TasteScaleProps } from './TasteScale.state.ts';
import { AnswerCard, Chip, FAM_C, Scale, StageSvg } from './pieces.tsx';
import { FAMS, LEVELS, signed } from './judges.ts';

export { frameState };

/** The judge's scale: answer key vs own ink, then taste; the bias-by-subjectivity bars under it. */
export const TasteScale: React.FC<AnimProps & TasteScaleProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const kind = s.morph > 0.5 ? 'msg' : 'code';
  const flip = s.morph > 0 && s.morph < 1 ? Math.abs(1 - 2 * s.morph) : 1;
  const ownCard = (
    <g transform="translate(0 -68)">
      <AnswerCard author="gpt" x={0} y={0} w={200} h={126} appear={s.cards} tint={0.9} blind={1} glow={s.own} kind={p.mode === 'intro' ? 'text' : kind} flip={flip} />
    </g>
  );
  const key = (
    <g>
      {s.keyDrop > 0.01 && (
        <g opacity={(1 - s.cloud) * Math.min(1, s.keyDrop * 2)} transform={`translate(0 ${-150 - (1 - s.keyDrop) * 260})`}>
          <rect x={-112} y={-44} width={224} height={74} rx={14} fill={alpha(C.text, 0.95)} />
          <text x={0} y={5} textAnchor="middle" fontSize={30} fontWeight={800} fill={C.bg0}>
            ✓ checkable
          </text>
        </g>
      )}
      {s.cloud > 0.01 && (
        <g opacity={s.cloud} transform={`translate(0 ${-176 - s.cloud * 16}) scale(${0.7 + 0.3 * s.cloud})`}>
          <path d="M-80 20 Q-110 20 -100 -6 Q-104 -40 -62 -38 Q-50 -72 -6 -62 Q30 -84 58 -50 Q104 -52 98 -12 Q120 18 84 22 Z" fill={alpha(C.muted, 0.28)} stroke={alpha(C.text, 0.6)} strokeWidth={3} />
          <text x={0} y={-6} textAnchor="middle" fontSize={36} fontWeight={800} fill={C.text}>
            taste
          </text>
        </g>
      )}
    </g>
  );
  const otherCard = (
    <g>
      {key}
      <g transform="translate(0 -68)">
        <AnswerCard author="grok" x={0} y={0} w={200} h={126} appear={s.cards} tint={0.9} blind={1} kind={p.mode === 'intro' ? 'text' : kind} flip={flip} />
      </g>
    </g>
  );
  const focusX = 180 + 300 * s.focus;
  return (
    <Stage vertical={p.vertical} fill>
      <StageSvg>
        <Scale cx={480} pivotY={300} half={280} hang={150} baseY={600} tilt={s.tilt} appear={s.scale} left={ownCard} right={otherCard} />
        <Chip fam="gpt" x={480} y={206} appear={s.chip} clip={1} glow={s.own * 0.7} w={230} />
        {/* Chart: bias towards its own answers, pp, by level. */}
        <g opacity={s.chart}>
          <rect x={focusX - 144} y={690} width={288} height={400} rx={18} fill={alpha(C.accentText, 0.12 * s.focusIn)} stroke={alpha(C.accentText, 0.45 * s.focusIn)} strokeWidth={2.5} />
          <text x={24} y={672} fontSize={28} fontWeight={700} fill={C.muted}>
            own-answer bias, pp
          </text>
          {FAMS.map((f, j) => (
            <g key={f}>
              <rect x={470 + j * 160} y={650} width={26} height={26} rx={6} fill={FAM_C[f]} />
              <text x={504 + j * 160} y={673} fontSize={26} fontWeight={700} fill={C.text}>
                {f === 'gpt' ? 'GPT' : f === 'grok' ? 'Grok' : 'Claude'}
              </text>
            </g>
          ))}
          <line x1={30} y1={ZERO_Y} x2={930} y2={ZERO_Y} stroke={alpha(C.text, 0.7)} strokeWidth={3} />
          {LEVELS.map((lv, g) => (
            <text key={lv} x={GROUP_X[g]} y={1062} textAnchor="middle" fontSize={32} fontWeight={800} fill={C.text}>
              {lv}
            </text>
          ))}
          <g opacity={s.arrow}>
            <path d={`M270 1052 H ${270 + 60 * s.arrow} M570 1052 H ${570 + 60 * s.arrow}`} stroke={C.accentText} strokeWidth={4} strokeLinecap="round" />
            <path d="M628 1044 L638 1052 L628 1060 M328 1044 L338 1052 L328 1060" fill="none" stroke={C.accentText} strokeWidth={4} strokeLinecap="round" opacity={s.arrow > 0.95 ? 1 : 0} />
          </g>
          {s.groups.map((grp, g) =>
            grp.bars.map((b, j) => {
              const x = GROUP_X[g] + (j - 1) * (BAR_W + 14);
              const h = b.value * PPX * b.grow;
              const y = h >= 0 ? ZERO_Y - h : ZERO_Y;
              return (
                <g key={`${g}-${j}`} opacity={b.grow > 0.001 ? 1 : 0}>
                  <rect x={x - BAR_W / 2} y={y} width={BAR_W} height={Math.max(1, Math.abs(h))} rx={6} fill={FAM_C[FAMS[j]]} />
                  <text
                    x={x}
                    y={b.value >= 0 ? y - 10 : ZERO_Y - 10}
                    textAnchor="middle"
                    fontSize={24}
                    fontWeight={800}
                    fill={C.text}
                    opacity={Math.min(1, b.grow * 2 - 0.6)}
                  >
                    {signed(b.value)}
                  </text>
                </g>
              );
            }),
          )}
          <g opacity={s.harder}>
            <text x={GROUP_X[0] + 80} y={890} textAnchor="middle" fontSize={26} fontWeight={700} fill={C.claude}>
              harder on
            </text>
            <text x={GROUP_X[0] + 80} y={920} textAnchor="middle" fontSize={26} fontWeight={700} fill={C.claude}>
              itself
            </text>
            <path d={`M${GROUP_X[0] + 80} 930 V 952`} stroke={C.claude} strokeWidth={3} />
          </g>
        </g>
      </StageSvg>
    </Stage>
  );
};
