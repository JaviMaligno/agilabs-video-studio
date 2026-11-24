import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, alpha } from '../brand.ts';
import type { ClockLayer } from '../timing.ts';

/**
 * Dark site background with a soft accent glow that drifts slowly. The drift follows the video's
 * clock unless `clock` is given: a chunked render passes the scene clock (sceneClock in timing.ts)
 * so a chunk's pixels do not depend on where it falls in the video, and its cache key holds.
 */
export const Background: React.FC<{ clock?: (frame: number) => ClockLayer[] }> = ({ clock }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const layers = clock ? clock(frame) : [{ seconds: frame / fps, weight: 1 }];
  const r = Math.max(width, height) * 0.6;
  return (
    <AbsoluteFill style={{ background: C.bg0 }}>
      {layers.map(({ seconds: s, weight }, i) => {
        const x = 50 + 8 * Math.sin(s / 6);
        const y = 30 + 6 * Math.cos(s / 7);
        return (
          <AbsoluteFill
            key={i}
            style={{
              opacity: weight,
              background: `radial-gradient(${r}px circle at ${x}% ${y}%, ${alpha(C.accent, 0.16)}, ${alpha(C.accent2, 0.06)} 45%, transparent 70%)`,
            }}
          />
        );
      })}
      <AbsoluteFill style={{ background: `linear-gradient(180deg, transparent 55%, ${alpha(C.bg1, 0.85)})` }} />
    </AbsoluteFill>
  );
};
