// The robot's office: every kind of memory at once (scenes 1, 4, 13, 14). See MemoryOffice.state.ts.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { lerp } from './memory.ts';
import { CARD_TEXT } from './MemoryDesk.state.ts';
import { ADVICE_LINE, frameState, type MemoryOfficeProps } from './MemoryOffice.state.ts';
import { Badge, Cabinet, Crack, Desk, Floor, Frame, Lens, MiniClipboard, Nail, Notecard, Page, Robot, Slip } from './office.tsx';

export { frameState };
export type { MemoryOfficeProps };

/** Where everything stands (frame pixels). Kept above y = 1190 so the cold-open hook fits below. */
const O = {
  floor: 1178,
  desk: { x: 330, y: 1000, w: 520 },
  robot: { x: 590, y: 600, s: 0.95 },
  card: { x: 745, y: 952, w: 170 },
  cabinet: { x: 90, y: 860, w: 200, h: 314 },
  clip: { x: 800, y: 340, w: 190, h: 250 },
  slipHeld: { x: 345, y: 585, w: 250, rot: -8 },
} as const;

const dimmed = (lit: number) => 0.32 + 0.68 * lit;

export const MemoryOffice: React.FC<AnimProps & MemoryOfficeProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const [head, desk, card, cabinet, clip] = s.lit;
  const [, cDesk, cCard, cCab, cClip] = s.crack;
  const on = s.slip.onCard;
  const slip = {
    x: lerp(O.slipHeld.x, O.card.x, on),
    y: lerp(O.slipHeld.y + s.robot.bob * 4, O.card.y - 8, on),
    w: lerp(O.slipHeld.w, 150, on),
    rot: lerp(O.slipHeld.rot, -4, on),
  };
  const cardC = { x: O.card.x, y: O.card.y };
  const cabTop = { x: O.cabinet.x + O.cabinet.w / 2, y: O.cabinet.y - 8 };
  const clipBottom = { x: O.clip.x + O.clip.w / 2, y: O.clip.y + O.clip.h + 8 };
  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Frame zoom={s.zoom} vertical={p.vertical}>
        <Floor y={O.floor} />
        {/* clipboard on the wall: fixed boxes */}
        <g opacity={dimmed(clip)}>
          <Nail x={O.clip.x + O.clip.w / 2} y={O.clip.y - 46} w={O.clip.w} lit={clip} />
          <MiniClipboard x={O.clip.x} y={O.clip.y} w={O.clip.w} h={O.clip.h} lit={clip} value={cClip > 0.3 ? 'full' : undefined} tick={cClip} />
          <Crack x={O.clip.x + 30} y={O.clip.y + 20} w={O.clip.w - 60} h={O.clip.h - 40} p={cClip} />
        </g>
        {/* filing cabinet: the notebook it can search */}
        <g opacity={dimmed(cabinet)}>
          <Cabinet x={O.cabinet.x} y={O.cabinet.y} w={O.cabinet.w} h={O.cabinet.h} lit={cabinet} open={90} peek={cCab} peekDrawer={1} />
          <Lens x={O.cabinet.x + O.cabinet.w / 2} y={O.cabinet.y - 70} r={36} opacity={cCab} question={cCab} />
          <Crack x={O.cabinet.x + 30} y={O.cabinet.y + 20} w={O.cabinet.w - 60} h={O.cabinet.h - 40} p={cCab} />
        </g>
        {/* the robot, the bookshelf in its head lit by `head` */}
        <Robot x={O.robot.x} y={O.robot.y + s.robot.bob * 4} s={O.robot.s} shelf={head} shelfGlow={head > 0.6 ? head : 0} armUp={s.robot.armUp} blink={s.robot.blink} />
        {/* the desk: working memory */}
        <g opacity={dimmed(desk)}>
          <Desk x={O.desk.x} y={O.desk.y} w={O.desk.w} lit={desk} />
          {/* its failure: pages spilling off the edge */}
          {[0, 1, 2].map((k) => (
            <Page key={k} x={O.desk.x + 40 - 30 * k * cDesk} y={O.desk.y - 30 + (60 + 70 * k) * cDesk} w={120} rot={-10 - 25 * k * cDesk} opacity={cDesk} />
          ))}
          <Crack x={O.desk.x + 140} y={O.desk.y + 4} w={200} h={150} p={cDesk} />
        </g>
        {/* the notecard: the summary */}
        <g opacity={dimmed(card)}>
          <Notecard x={O.card.x} y={O.card.y} w={O.card.w} lit={card} text={p.mode === 'verdict' ? CARD_TEXT : ''} write={1} blur={cCard} />
          <Crack x={O.card.x - 60} y={O.card.y - 50} w={120} h={100} p={cCard} />
        </g>
        {/* links: the gist in front, the notebook behind it, a box for what will matter */}
        {s.links[0] > 0 && (
          <path
            d={`M ${cardC.x - 70} ${cardC.y} C ${cardC.x - 250} ${cardC.y - 220}, ${cabTop.x + 120} ${cabTop.y - 220}, ${cabTop.x} ${cabTop.y - 10}`}
            fill="none"
            stroke={C.ok}
            strokeWidth={6}
            strokeDasharray="14 12"
            opacity={s.links[0]}
            pathLength={1}
          />
        )}
        {s.links[1] > 0 && (
          <path
            d={`M ${cardC.x + 40} ${cardC.y - 55} C ${cardC.x + 120} ${cardC.y - 250}, ${clipBottom.x} ${clipBottom.y + 160}, ${clipBottom.x} ${clipBottom.y}`}
            fill="none"
            stroke={C.ok}
            strokeWidth={6}
            strokeDasharray="14 12"
            opacity={s.links[1]}
          />
        )}
        {s.links[1] > 0.6 && <Badge x={clipBottom.x + 70} y={clipBottom.y - 40} r={22} kind="tick" pop={(s.links[1] - 0.6) / 0.4} />}
        {/* the red slip: held up, or lying on the notecard */}
        <Slip x={slip.x} y={slip.y} w={slip.w} rot={slip.rot} glowA={s.slip.glow} opacity={s.slip.opacity} />
        {s.line > 0 && (
          <text x={540} y={1282} textAnchor="middle" fontSize={36} fontWeight={600} fill={alpha(C.muted, 1)} opacity={s.line} letterSpacing={0.5}>
            {ADVICE_LINE}
          </text>
        )}
      </Frame>
    </AbsoluteFill>
  );
};
