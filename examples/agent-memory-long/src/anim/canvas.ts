// Format-aware geometry for bespoke drawings: one component file lays out for the vertical
// (1080x1920) and the landscape (1920x1080) frame without duplicating the drawing. Pure numbers
// (no Remotion or React), so tests can check them. The SVG wrapper is <Canvas> in Canvas.tsx.
//
//   const L = place(p.vertical, {
//     v: { robot: { x: 830, y: 560, s: 0.9 }, desk: { x: 140, y: 1000, w: 800 } },
//     l: { robot: { x: 1500, y: 260, s: 0.8 }, desk: { x: 420, y: 620, w: 900 } },
//   });
//   <Canvas vertical={p.vertical}><Desk {...L.desk} /><Robot {...L.robot} /></Canvas>
import { LANDSCAPE, STAGE, VERTICAL } from '../layout.ts';

export type Box = { x: number; y: number; w: number; h: number };

/** Design size of a scene: the frame of its format, in pixels. */
export const designOf = (vertical: boolean): { w: number; h: number } =>
  vertical ? { w: VERTICAL.w, h: VERTICAL.h } : { w: LANDSCAPE.w, h: LANDSCAPE.h };

/** The value for this format: `place(vertical, { v: ..., l: ... })`. Works for numbers and whole layouts. */
export const place = <T>(vertical: boolean, by: { v: T; l: T }): T => (vertical ? by.v : by.l);

/** Where animations may draw (layout.ts STAGE), as a box in frame pixels. */
export const stageBox = (vertical: boolean): Box => {
  const s = vertical ? STAGE.vertical : STAGE.landscape;
  return { x: s.side, y: s.top, w: s.w, h: s.h };
};

export const stageCentre = (vertical: boolean): { x: number; y: number } => {
  const b = stageBox(vertical);
  return { x: b.x + b.w / 2, y: b.y + b.h / 2 };
};

/** A point given in stage fractions (0..1 across, 0..1 down) in frame pixels. */
export const inStage = (vertical: boolean, nx: number, ny: number): { x: number; y: number } => {
  const b = stageBox(vertical);
  return { x: b.x + nx * b.w, y: b.y + ny * b.h };
};

/**
 * Scale `src` to fit inside `dst` (contain, centred, aspect kept). `transform` is an SVG transform
 * that draws what was laid out in `src` coordinates inside `dst`.
 */
export const fitInto = (src: Box, dst: Box): { scale: number; x: number; y: number; transform: string } => {
  const scale = Math.min(dst.w / src.w, dst.h / src.h);
  const x = dst.x + (dst.w - src.w * scale) / 2;
  const y = dst.y + (dst.h - src.h * scale) / 2;
  return { scale, x, y, transform: `translate(${x} ${y}) scale(${scale}) translate(${-src.x || 0} ${-src.y || 0})` };
};
