import React from 'react';
import { C, GRADIENT, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { Stage, gradientText } from './Stage.tsx';
import { PackageBox, PartTag, Shelf, Stamp, clamp01 } from './pieces.tsx';
import { LEAD, OWNER, VERDICT, frameState, type WhoAnswersProps } from './WhoAnswers.state.ts';

export { frameState };
export type { WhoAnswersProps };

const TAG_W = 440;
const TAG_TOP = 96;

/** A big name tag: role, what it answers for, and its figure. */
const RoleTag: React.FC<{ x: number; appear: number; role: string; answers: string; figure: string; figureIn: number; accent: boolean; dim?: number; small?: string }> = ({
  x,
  appear,
  role,
  answers,
  figure,
  figureIn,
  accent,
  dim = 0,
  small,
}) => {
  const a = clamp01(appear);
  if (a <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: TAG_TOP,
        width: TAG_W,
        height: 390,
        borderRadius: 26,
        padding: 4,
        boxSizing: 'border-box',
        background: accent ? GRADIENT : alpha(C.muted, 0.5),
        opacity: a * (1 - 0.35 * clamp01(dim)),
        transform: `translateY(${30 * (1 - a)}px) rotate(${accent ? 2 : -2}deg)`,
        boxShadow: `0 18px 40px ${alpha(C.bg0, 0.7)}`,
      }}
    >
      <div style={{ width: '100%', height: '100%', borderRadius: 22, background: C.bg1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '22px 22px 18px', boxSizing: 'border-box', fontFamily }}>
        <div style={{ width: 26, height: 26, borderRadius: 13, background: C.bg0, border: `3px solid ${accent ? C.accentText : C.muted}` }} />
        <div style={{ fontSize: 70, fontWeight: 800, color: accent ? C.text : C.muted, lineHeight: 1.1, marginTop: 6 }}>{role}</div>
        <div style={{ fontSize: 34, fontWeight: 650, color: C.text, textAlign: 'center', lineHeight: 1.18, marginTop: 6 }}>{answers}</div>
        <div style={{ fontSize: 96, fontWeight: 800, lineHeight: 1.05, marginTop: 'auto', opacity: clamp01(figureIn), transform: `scale(${1.4 - 0.4 * clamp01(figureIn)})`, ...(accent ? gradientText : { color: C.text }) }}>{figure}</div>
        {small && <div style={{ fontSize: 22, fontWeight: 600, color: C.muted, marginTop: 2 }}>{small}</div>}
      </div>
    </div>
  );
};

export const WhoAnswers: React.FC<AnimProps & WhoAnswersProps> = ({ t, beats, dur, vertical, ...props }) => {
  const s = frameState(props as WhoAnswersProps, t, beats, dur);
  const rightX = 500;
  const boxX = rightX + TAG_W / 2;
  const floor = 720;
  return (
    <Stage vertical={vertical} fill>
      <div style={{ position: 'absolute', inset: 0, fontFamily, color: C.text }}>
        <PartTag n={3} text="what the role answers for" appear={s.part} />
        <RoleTag x={0} appear={s.lead} role={LEAD.role} answers={LEAD.answers} figure={LEAD.figure} figureIn={s.leadFigure} accent={false} dim={s.leadDim} small={LEAD.source} />
        {/* A partner's patch beside the lead, never stitched in. */}
        {s.patch > 0 && (
          <div style={{ position: 'absolute', left: 40, top: 540, width: 360, height: 110, opacity: clamp01(s.patch) * (1 - 0.35 * clamp01(s.leadDim)) }}>
            <div
              style={{
                position: 'absolute',
                left: 120 * clamp01(s.gap),
                top: 0,
                width: 240,
                height: 110,
                borderRadius: 14,
                border: `3px dashed ${alpha(C.muted, 0.8)}`,
                background: alpha(C.card, 0.9),
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '0 18px',
                boxSizing: 'border-box',
              }}
            >
              <div style={{ fontSize: 28, fontWeight: 800, color: C.muted, whiteSpace: 'nowrap' }}>partner’s patch</div>
              {[0.8, 0.55].map((wd, i) => (
                <div key={i} style={{ height: 7, width: `${wd * 100}%`, borderRadius: 4, background: alpha(C.muted, 0.25), marginTop: 9 }} />
              ))}
            </div>
            {/* The stitch that never closes: two dashed ends with a gap. */}
            <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} width={1} height={1}>
              <line x1={20} y1={-40} x2={20} y2={55} stroke={alpha(C.muted, 0.7)} strokeWidth={4} strokeDasharray="6 8" />
              <line x1={20} y1={55} x2={110 * clamp01(s.gap) + 6} y2={55} stroke={alpha(C.muted, 0.7)} strokeWidth={4} strokeDasharray="6 8" />
            </svg>
          </div>
        )}
        <RoleTag x={rightX} appear={s.owner} role={OWNER.role} answers={OWNER.answers} figure={OWNER.figure} figureIn={s.ownerFigure} accent />
        {/* The owner's tag is clipped onto its own release: a string down to the 0.4.0 box. */}
        {s.clip > 0 && (
          <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} width={1} height={1}>
            <line x1={boxX} y1={TAG_TOP + 386} x2={boxX} y2={TAG_TOP + 386 + (floor - 120 - TAG_TOP - 386) * clamp01(s.clip)} stroke={C.text} strokeWidth={4} />
          </svg>
        )}
        <Shelf y={floor} x0={rightX + 40} x1={rightX + TAG_W - 40} opacity={s.box} label={false} />
        <PackageBox x={boxX} floor={floor} w={160} h={120} label="0.4.0" inside="" lid={0} rise={0} opacity={s.box} glow={s.worksFlash} />
        <Stamp
          x={700}
          y={800}
          w={380}
          text={
            <>
              {VERDICT.works.split(' · ')[0]}
              <div style={{ fontSize: 40, fontWeight: 700 }}>{VERDICT.works.split(' · ')[1]}</div>
            </>
          }
          pop={s.works}
          solid
          font={62}
          flash={s.worksFlash}
        />
        <Stamp x={TAG_W / 2} y={710} w={460} text={VERDICT.fails} pop={s.fails} font={56} rot={4} />
        <div style={{ position: 'absolute', left: 10, top: 845, width: 420, textAlign: 'center', fontSize: 31, fontWeight: 650, lineHeight: 1.22, color: C.text, opacity: s.note }}>{VERDICT.note}</div>
      </div>
    </Stage>
  );
};
