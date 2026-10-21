import React from 'react';
import { C, alpha } from '../brand.ts';
import type { AnimProps } from './types.ts';
import { Stage } from './Stage.tsx';
import { frameState, type JudgeBenchProps, type LabelS } from './JudgeBench.state.ts';
import { frameState as quoteState } from './KeyQuote.state.ts';
import { AnswerCard, Chip, FAM_C, PanThing, PodiumSteps, Scale, StageSvg, Stamp } from './pieces.tsx';
import { SHORT } from './judges.ts';

export { frameState };

const toneFill = (tone: LabelS['tone']): string =>
  tone === 'muted' ? C.muted : tone === 'text' ? C.text : tone === 'grad' ? 'url(#jgrad)' : tone === 'accent' ? C.accentText : tone === 'warm' ? C.warm : FAM_C[tone];

const LEVELS = [
  { name: 'objective', ex: 'fix a bug' },
  { name: 'medium', ex: 'summarise' },
  { name: 'subjective', ex: 'error-message copy' },
];

/** The judge bench: seats, blind cards with tinted ink, stamps, scale, podiums, coins. */
export const JudgeBench: React.FC<AnimProps & JudgeBenchProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const q = p.mode === 'participant' ? quoteState({ text: 'On taste, your judge is a participant.', emphasis: ['participant'] }, p.t, [0.15], p.dur) : null;
  return (
    <Stage vertical={p.vertical} fill>
      <StageSvg>
        {s.podiums.map((pd) => (
          <PodiumSteps key={pd.judge} x={pd.x} baseY={pd.baseY} rise={pd.rise} steps={pd.steps.map((st) => ({ fam: st.fam, dx: st.dx, h: st.score * pd.k }))} />
        ))}
        {s.strip && (
          <g opacity={s.strip.appear}>
            {LEVELS.map((lv, i) => {
              const x0 = 60 + i * 280;
              const op = s.strip!.labels[i];
              return (
                <g key={lv.name}>
                  <rect x={x0 + 4} y={s.strip!.y} width={272} height={26} rx={13} fill={alpha(C.accentText, 0.22 + 0.24 * i)} />
                  {[0, 1, 2, 3, 4].map((k) => (
                    <circle key={k} cx={x0 + 40 + k * 50} cy={s.strip!.y + 13} r={6} fill={alpha(C.text, 0.8)} />
                  ))}
                  <text x={x0 + 140} y={s.strip!.y - 18} textAnchor="middle" fontSize={32} fontWeight={800} fill={C.text}>
                    {lv.name}
                  </text>
                  <text x={x0 + 140} y={s.strip!.y + 74} textAnchor="middle" fontSize={27} fontWeight={600} fill={C.muted} opacity={op}>
                    “{lv.ex}”
                  </text>
                </g>
              );
            })}
            <path d={`M70 ${s.strip.y + 120} H890`} stroke={alpha(C.text, 0)} />
          </g>
        )}
        {s.scale && (
          <Scale
            {...s.scale}
            left={<PanThing item={s.scale.left} />}
            right={<PanThing item={s.scale.right} />}
          />
        )}
        {s.links.map((l, i) =>
          l.draw > 0.01 ? (
            <line key={i} x1={l.x1} y1={l.y1} x2={l.x1 + (l.x2 - l.x1) * l.draw} y2={l.y1 + (l.y2 - l.y1) * l.draw} stroke={FAM_C[l.fam]} strokeWidth={5} strokeDasharray="10 8" opacity={0.9} />
          ) : null,
        )}
        {s.cards.map((c) => (
          <AnswerCard {...c} key={c.key} />
        ))}
        {s.seats.map((st) => (
          <Chip key={st.fam} {...st} />
        ))}
        {s.stamps.map((st, i) => (st.opacity > 0.01 ? <Stamp key={i} {...st} /> : null))}
        {s.queries.map((qq, i) => (
          <text key={i} x={qq.x} y={qq.y} textAnchor="middle" fontSize={96 * qq.s} fontWeight={800} fill={C.accentText} opacity={qq.opacity}>
            ?
          </text>
        ))}
        {s.counter && (
          <g opacity={s.counter.opacity}>
            <text x={480} y={900} textAnchor="middle" fontSize={150} fontWeight={800} fill="url(#jgrad)">
              {s.counter.value}
            </text>
            <text x={480} y={962} textAnchor="middle" fontSize={40} fontWeight={700} fill={C.text}>
              comparisons
            </text>
          </g>
        )}
        {s.kappas.map((k) => (
          <g key={k.a + k.b} opacity={k.pop} transform={`translate(${(1 - k.pop) * 40} ${k.y})`}>
            <rect x={150} y={-34} width={660} height={64} rx={18} fill={alpha(C.card, 0.95)} stroke={alpha('#ffffff', 0.14)} strokeWidth={2} />
            <circle cx={190} cy={-2} r={11} fill={FAM_C[k.a]} />
            <circle cx={214} cy={-2} r={11} fill={FAM_C[k.b]} />
            <text x={242} y={9} fontSize={32} fontWeight={700} fill={C.text}>
              {SHORT[k.a]} · {SHORT[k.b]}
            </text>
            <text x={780} y={10} textAnchor="end" fontSize={36} fontWeight={800} fill={C.warm}>
              κ {k.k}
            </text>
          </g>
        ))}
        {s.bigStamp && s.bigStamp.pop > 0.01 && (
          <g
            opacity={Math.min(1, s.bigStamp.pop * 1.4)}
            transform={`translate(${s.bigStamp.x} ${s.bigStamp.y}) rotate(${s.bigStamp.rot}) scale(${1.8 - 0.8 * s.bigStamp.pop})`}
          >
            <rect x={-440} y={-60} width={880} height={120} rx={18} fill={alpha(C.bg0, 0.88)} stroke={C.warm} strokeWidth={8} />
            <text x={0} y={21} textAnchor="middle" fontSize={60} fontWeight={800} fill={C.warm} letterSpacing="0.02em">
              {s.bigStamp.text}
            </text>
          </g>
        )}
        {s.labels.map((l, i) =>
          l.opacity > 0.01 ? (
            <text key={i} x={l.x} y={l.y} textAnchor={l.anchor} fontSize={l.size} fontWeight={l.weight} fill={toneFill(l.tone)} opacity={l.opacity}>
              {l.text}
            </text>
          ) : null,
        )}
      </StageSvg>
      {q && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 30, padding: '0 20px', fontSize: 84, fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.015em', textAlign: 'center' }}>
          {q.words.map((w, i) => (
            <React.Fragment key={i}>
              {i > 0 ? ' ' : null}
              <span style={{ display: 'inline-block', position: 'relative', opacity: w.opacity, transform: `translateY(${(1 - w.opacity) * 18}px)`, color: w.emphasis ? C.accentText : C.text }}>
                {w.text}
                {w.emphasis && (
                  <span style={{ position: 'absolute', left: 0, bottom: -4, height: 7, width: `${q.emphasis * 100}%`, borderRadius: 4, background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})` }} />
                )}
              </span>
            </React.Fragment>
          ))}
        </div>
      )}
    </Stage>
  );
};
