import React from 'react';
import { Img, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { V } from '../theme.ts';

/** Avatar cut-outs in public/avatar/ (transparent PNGs of the author's character). */
export type CameoPose = 'amazed' | 'sceptical' | 'thinking' | 'laughing' | 'laptop' | 'pointing' | 'neutral';

/** A cameo as written in the timeline: `at` is resolved to scene seconds by finish(). */
export type CameoSpec = { pose: CameoPose; at: number; dur?: number; side?: 'left' | 'right' };

const SIZE = 300;

/**
 * The author's avatar popping up from a bottom corner for a couple of seconds, resting on the caption
 * box: a reaction at the moment of a reveal, or his role in the experiment ("I trained…").
 */
export const Cameo: React.FC<{ cameo: CameoSpec; vertical: boolean }> = ({ cameo, vertical }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const start = Math.round(cameo.at * fps);
  const end = start + Math.round((cameo.dur ?? 2.4) * fps);
  if (frame < start - 2 || frame > end + 14) return null;
  const inP = spring({ frame: frame - start, fps, config: { damping: 14, stiffness: 180 }, durationInFrames: 14 });
  const outP = spring({ frame: frame - end, fps, config: { damping: 200 }, durationInFrames: 12 });
  const p = inP * (1 - outP);
  const size = vertical ? SIZE : 300;
  const side = cameo.side ?? 'left';
  // Vertical: standing on the bottom safe line, peeking out behind the caption box (drawn after
  // it, so the captions stay on top) and below the stage, which fills the frame down to them.
  const bottom = vertical ? 1920 - V.captionBottom : 150;
  return (
    <div
      style={{
        position: 'absolute',
        [side]: vertical ? -6 : 60,
        bottom,
        width: size,
        height: size,
        transform: `translateY(${(1 - p) * 60}px) scale(${0.7 + 0.3 * p}) rotate(${(side === 'left' ? -1 : 1) * (1 - p) * 8}deg)`,
        transformOrigin: side === 'left' ? 'bottom left' : 'bottom right',
        opacity: p,
        filter: 'drop-shadow(0 10px 24px rgba(0,0,0,0.55))',
      }}
    >
      <Img src={staticFile(`avatar/avatar-${cameo.pose}.png`)} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
    </div>
  );
};
