// The fork in the road: two ways to teach the model your shop. See TwoRoads.state.ts.
import React from 'react';
import { C, alpha } from '../brand.ts';
import type { AnimProps } from './types.ts';
import { Canvas } from './Canvas.tsx';
import { fitInto, stageBox } from './canvas.ts';
import { blinkAt, loopTime } from './memory.ts';
import { Robot, glow } from './office.tsx';
import { Binder, Door, NoteSheet, OpenBook, Pen, PolicyCard, Sign, Tag } from './note.tsx';
import { FT_TAG, LEFT_SIGN, RIGHT_SIGN, frameState, type TwoRoadsProps } from './TwoRoads.state.ts';

export { frameState };
export type { TwoRoadsProps };

/** Landscape layout (frame pixels); the vertical cut shows the same picture scaled into its stage. */
const L = {
  trunk: 'M 960 830 L 960 660',
  left: 'M 960 720 Q 930 590 480 486',
  right: 'M 960 720 Q 990 590 1440 486',
  doors: { y: 262, w: 130, h: 220, xs: [335, 495, 1295, 1455] },
  signs: { y: 196, left: 480, right: 1440, size: 34 },
  robot: { x: 960, y: 600, s: 0.5 },
  card: { x: 960, y: 336, w: 520 },
  note: { x: 200, y: 612, w: 190, h: 200 },
  binder: { x: 440, y: 606, w: 160, h: 206 },
  book: { x: 1500, y: 636, w: 280 },
  tag: { x: 1580, y: 596 },
  question: { x: 1068, y: 560 },
};

const Road: React.FC<{ d: string; lit: number; grow: number; color: string }> = ({ d, lit, grow, color }) => {
  if (grow <= 0) return null;
  const dash = grow >= 1 ? undefined : `${grow} 1`;
  return (
    <g style={glow(color, 0.5 * lit)}>
      <path d={d} fill="none" stroke={alpha(color, 0.35 + 0.65 * lit)} strokeWidth={150} strokeLinecap="butt" pathLength={1} strokeDasharray={dash} />
      <path d={d} fill="none" stroke={C.bg1} strokeWidth={136} strokeLinecap="butt" pathLength={1} strokeDasharray={dash} />
    </g>
  );
};

export const TwoRoads: React.FC<AnimProps & TwoRoadsProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const tm = loopTime(p.t, p.dur);
  const bob = Math.sin(tm * 2.2) * 8;
  const pen = { x: L.book.x + 30 + 120 * s.right.write, y: L.book.y + 26 + 3 * L.book.w * 0.62 * 0.16 - 6 * Math.sin(s.right.write * 30) };
  const lean = 6 * s.look;
  const picture = (
    <g>
      {/* the roads: the trunk from the robot's feet, then the fork */}
      <Road d={L.left} lit={s.left.lit} grow={s.split} color={C.ok} />
      <Road d={L.right} lit={s.right.lit} grow={s.split} color={C.accent2} />
      <Road d={L.trunk} lit={0} grow={s.road} color={C.accentText} />
      <path d={L.trunk} fill="none" stroke={alpha(C.warm, 0.6)} strokeWidth={8} strokeDasharray="30 26" />
      <path d={L.left} fill="none" stroke={alpha(C.warm, 0.6 * s.split)} strokeWidth={8} strokeDasharray="30 26" />
      <path d={L.right} fill="none" stroke={alpha(C.warm, 0.6 * s.split)} strokeWidth={8} strokeDasharray="30 26" />

      {/* two doors at the end of each branch */}
      <g opacity={s.split}>
        {L.doors.xs.map((x, i) => (
          <Door key={i} x={x} y={L.doors.y} w={L.doors.w} h={L.doors.h} glowA={Math.max(s.doors[i], i < 2 ? 0.3 * s.left.lit : 0.3 * s.right.lit)} color={i < 2 ? C.ok : C.accent2} />
        ))}
      </g>

      {/* left: hand it what it needs (a note, a binder) */}
      <Sign x={L.signs.left} y={L.signs.y} text={LEFT_SIGN} size={L.signs.size} opacity={s.left.sign} lit={s.left.lit} color={C.ok} arrow={-1} />
      <g transform={`translate(0 ${30 * (1 - s.left.note)})`}>
        <NoteSheet
          x={L.note.x}
          y={L.note.y}
          w={L.note.w}
          h={L.note.h}
          rot={-4}
          opacity={s.left.note}
          rows={[0, 1, 2, 3, 4].map(() => ({ text: '', size: 26, bars: true }))}
        />
      </g>
      <g transform={`translate(0 ${30 * (1 - s.left.binder)})`}>
        <Binder x={L.binder.x} y={L.binder.y} w={L.binder.w} h={L.binder.h} opacity={s.left.binder} />
      </g>

      {/* right: change the model (the book, a pen writing in it) */}
      <Sign x={L.signs.right} y={L.signs.y} text={RIGHT_SIGN} size={L.signs.size} opacity={s.right.sign} lit={s.right.lit} color={C.accent2} arrow={1} />
      <g transform={`translate(0 ${30 * (1 - s.right.book)})`}>
        <OpenBook x={L.book.x} y={L.book.y} w={L.book.w} opacity={s.right.book} write={s.right.write} />
      </g>
      <Pen x={pen.x} y={pen.y} len={170} opacity={s.right.pen} rot={-50} />
      <Tag x={L.tag.x} y={L.tag.y} text={FT_TAG} size={32} opacity={s.right.tag} color={C.accent2} />

      {/* the robot at the fork */}
      <g transform={`rotate(${lean} ${L.robot.x} 827)`}>
        <Robot x={L.robot.x} y={L.robot.y} s={L.robot.s} blink={blinkAt(tm, 3.1)} armUp={s.armUp} shelf={0.6} />
      </g>

      {/* the policy card hovering over the fork */}
      <PolicyCard x={L.card.x} y={L.card.y + bob * s.card.opacity - 30 * (1 - s.card.opacity)} w={L.card.w} opacity={s.card.opacity} strike={s.card.strike} write={s.card.write} glowA={0.5 * s.card.strike} />
      {s.card.question > 0 && (
        <text x={L.question.x} y={L.question.y - 16 * s.card.question} fontSize={96} fontWeight={900} fill={C.warm} opacity={s.card.question} style={glow(C.warm, 0.5)}>
          ?
        </text>
      )}
    </g>
  );
  return (
    <Canvas vertical={p.vertical}>
      {p.vertical ? <g transform={fitInto(stageBox(false), stageBox(true)).transform}>{picture}</g> : picture}
    </Canvas>
  );
};
