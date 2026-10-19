import React from 'react';
import { C, GRADIENT, alpha } from '../brand.ts';
import type { AnimProps } from './types.ts';
import { frameState, type SwitchProps } from './SwitchPanel.state.ts';
import { Stage, stageOf } from './Stage.tsx';
import { Card } from './pieces.tsx';

export { frameState };
export type { SwitchProps };

const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

const Toggle: React.FC<{ on: number; x: number; y: number }> = ({ on, x, y }) => {
  const w = 190;
  const h = 100;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y - h / 2,
        width: w,
        height: h,
        borderRadius: h / 2,
        background: on > 0.5 ? GRADIENT : alpha(C.muted, 0.22),
        border: `3px solid ${on > 0.5 ? alpha(C.accentText, 0.9) : alpha(C.muted, 0.5)}`,
        boxShadow: on > 0.5 ? `0 0 40px ${alpha(C.accent, 0.6)}` : 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 8,
          left: lerp(8, w - 8 - (h - 22), on),
          width: h - 22,
          height: h - 22,
          borderRadius: (h - 22) / 2,
          background: C.text,
          boxShadow: `0 4px 14px ${alpha('#000000', 0.5)}`,
        }}
      />
    </div>
  );
};

const Row: React.FC<{ y: number; n: number; nextN?: number; renumber?: number; label: string; on: number; appear: number; W: number; dx?: number }> = ({
  y,
  n,
  nextN,
  renumber = 0,
  label,
  on,
  appear,
  W,
  dx = 0,
}) => (
  <div style={{ position: 'absolute', left: dx, top: 0, width: W, height: 0, opacity: appear }}>
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: y - 40,
        width: 80,
        height: 80,
        borderRadius: 40,
        border: `3px solid ${alpha(C.accentText, 0.8)}`,
        color: C.accentText,
        fontSize: 44,
        fontWeight: 800,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span style={{ position: 'absolute', opacity: 1 - renumber }}>{n}</span>
      {nextN !== undefined && <span style={{ position: 'absolute', opacity: renumber }}>{nextN}</span>}
    </div>
    <div style={{ position: 'absolute', left: 110, top: y - 40, fontSize: 64, fontWeight: 800, letterSpacing: '-0.02em', whiteSpace: 'nowrap', lineHeight: '80px' }}>{label}</div>
    <Toggle on={on} x={W - 190} y={y} />
  </div>
);

export const SwitchPanel: React.FC<AnimProps & SwitchProps> = ({ t, beats, dur, vertical, ...props }) => {
  const s = frameState(props, t, beats, dur);
  const { w: W } = stageOf(vertical);
  const r = s.reveal;
  const yU = lerp(380, 560, r);
  const yR = lerp(660, 800, r);
  const yE = 180;
  return (
    <Stage vertical={vertical} fill>
      {/* Engage: enters first, off, with what keeps it off. */}
      <Row y={yE} n={1} label="Engage" on={s.engage.on} appear={s.engage.appear} W={W} dx={(1 - s.engage.appear) * -200} />
      <div
        style={{
          position: 'absolute',
          left: 110,
          top: yE + 58,
          display: 'flex',
          gap: 16,
          opacity: s.engage.tags,
          transform: `translateY(${(1 - s.engage.tags) * 16}px)`,
        }}
      >
        {['Claude: refuses', 'GPT-5: filtered'].map((tag) => (
          <div key={tag} style={{ padding: '10px 20px', borderRadius: 16, background: C.card, border: `2px dashed ${alpha(C.muted, 0.7)}`, fontSize: 32, fontWeight: 700, whiteSpace: 'nowrap' }}>
            {tag}
          </div>
        ))}
      </div>
      <Row y={yU} n={1} nextN={2} renumber={s.renumber} label="Understand" on={s.understand.on} appear={s.understand.appear} W={W} />
      <Row y={yR} n={2} nextN={3} renumber={s.renumber} label="Reply in code" on={s.reply.on} appear={s.reply.appear} W={W} />
      {/* The prompt that flips "Reply in code": slides in from the right into the gap between the rows. */}
      {s.prompt.opacity > 0 && (
        <div style={{ position: 'absolute', right: 0, top: yR - 150, transform: `translateX(${(1 - s.prompt.drop) * 420}px)`, opacity: s.prompt.opacity * Math.min(1, s.prompt.drop * 3) }}>
          <Card w={560} h={84} glow={0.5} style={{ borderRadius: 20 }}>
            <span style={{ fontSize: 38, fontWeight: 600, fontStyle: 'italic' }}>“reply in the same code”</span>
          </Card>
        </div>
      )}
    </Stage>
  );
};
