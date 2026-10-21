import React from 'react';
import { C } from '../brand.ts';
import type { AnimProps } from './types.ts';
import { frameState, type CurveProps } from './ReplayCurve.state.ts';
import { Stage } from './Stage.tsx';
import { CurvePlot, TaskMeter } from './pieces.tsx';

export { frameState };
export type { CurveProps };

export const ReplayCurve: React.FC<AnimProps & CurveProps> = ({ t, beats, dur, vertical, ...props }) => {
  const s = frameState(props, t, beats, dur);
  return (
    <Stage vertical={vertical} fill>
      <div style={{ position: 'absolute', left: 0, top: 30, width: 960, height: 700 }}>
        <CurvePlot w={960} h={700} fullSeg={3 * s.full} fullP0={s.full} fullDim={0.3} lora={s.lora} loraLabel={s.loraLabel} appear={s.appear} />
      </div>
      <div style={{ position: 'absolute', left: 20, top: 800, fontSize: 32, fontWeight: 700, color: C.muted, opacity: s.meters.appear }}>Terminal task</div>
      <TaskMeter x={20} y={860} w={920} appear={s.meters.appear} fill={s.meters.fill} label="Full fine-tuning" to="≈0.90" done={s.meters.fill} />
      <TaskMeter x={20} y={960} w={920} appear={s.meters.appear} fill={s.meters.fill} label="LoRA" to="≈0.90" done={s.meters.fill} />
    </Stage>
  );
};
