import React from 'react';
import { fontFamily } from '../theme.ts';
import { designOf, fitInto, stageBox, stageCentre } from './canvas.ts';

/**
 * Full-frame SVG for a bespoke drawing, in frame pixels of its format (1080x1920 vertical,
 * 1920x1080 landscape). Lay the scene out per format with `place()` (canvas.ts) and draw it once.
 *
 * - `zoom` scales about the stage centre (a camera push or pull).
 * - `design="vertical"`: the drawing is laid out for the vertical frame only. In landscape its
 *   vertical stage is fitted (scaled down, centred) into the landscape stage, so it never
 *   overflows; a stopgap until the scene gets its own landscape layout.
 */
export const Canvas: React.FC<{
  vertical: boolean;
  children: React.ReactNode;
  zoom?: number;
  design?: 'both' | 'vertical';
}> = ({ vertical, children, zoom = 1, design = 'both' }) => {
  const { w, h } = designOf(vertical);
  const drawnFor = design === 'vertical' ? true : vertical;
  const c = stageCentre(drawnFor);
  const zoomed = <g transform={`translate(${c.x} ${c.y}) scale(${zoom}) translate(${-c.x} ${-c.y})`}>{children}</g>;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', left: 0, top: 0, fontFamily }}>
      {drawnFor === vertical ? zoomed : <g transform={fitInto(stageBox(true), stageBox(false)).transform}>{zoomed}</g>}
    </svg>
  );
};
