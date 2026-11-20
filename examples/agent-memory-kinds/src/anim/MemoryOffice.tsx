// The robot's office: every kind of memory at once (the verdict and the recipe, rows 35-38).
// See MemoryOffice.state.ts.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { lerp } from './memory.ts';
import { CARD_TEXT } from './MemoryDesk.state.ts';
import { ADVICE_LINE, FRIDGE_NOTE, RECIPE, frameState, type MemoryOfficeProps } from './MemoryOffice.state.ts';
import { place } from './canvas.ts';
import { Badge, Cabinet, Crack, Desk, Floor, Frame, Lens, MiniClipboard, Nail, Notecard, Page, Robot, Slip } from './office.tsx';
import { OLD_DAY } from './memory.ts';

export { frameState };
export type { MemoryOfficeProps };

/**
 * Where everything stands (frame pixels), per format.
 * - vertical: as in the short (kept above y = 1190 so a cold-open hook fits below); the human
 *   version in the empty top-left corner; no recipe list (the line under the office says it).
 * - landscape: the office on the left two thirds (cabinet, the robot behind its desk, the clipboard
 *   on the wall); the human version, then the recipe, in the column at the right.
 */
const LAYOUT = {
  v: {
    floor: { y: 1178, x: 60, w: 960 },
    desk: { x: 330, y: 1000, w: 520 },
    robot: { x: 590, y: 600, s: 0.95 },
    card: { x: 745, y: 952, w: 170 },
    cabinet: { x: 90, y: 860, w: 200, h: 314 },
    clip: { x: 800, y: 340, w: 190, h: 250 },
    slipHeld: { x: 345, y: 585, w: 250, rot: -8 },
    line: { x: 540, y: 1282, size: 36, anchor: 'middle' as 'middle' | 'start' },
    human: { x: 100, y: 290, gap: 225, s: 1.1 },
    recipe: null as null | { x: number; y: number; gap: number; size: number },
  },
  l: {
    floor: { y: 800, x: 200, w: 1100 },
    desk: { x: 520, y: 626, w: 520 },
    robot: { x: 780, y: 260, s: 0.82 },
    card: { x: 935, y: 578, w: 170 },
    cabinet: { x: 250, y: 486, w: 200, h: 314 },
    clip: { x: 1090, y: 230, w: 190, h: 250 },
    slipHeld: { x: 560, y: 252, w: 230, rot: -8 },
    line: { x: 1310, y: 250, size: 32, anchor: 'start' as 'middle' | 'start' },
    human: { x: 1400, y: 260, gap: 185, s: 0.9 },
    recipe: { x: 1310, y: 320, gap: 96, size: 32 } as null | { x: number; y: number; gap: number; size: number },
  },
};

const dimmed = (lit: number) => 0.32 + 0.68 * lit;

/** The human version: a head with a card in it, an inbox, a note on the fridge (each 0..1). */
const Human: React.FC<{ x: number; y: number; gap: number; s: number; show: number[]; vertical: boolean }> = ({ x, y, gap, s, show, vertical }) => {
  const at = (i: number) => (vertical ? { x: x + i * gap, y } : { x, y: y + i * gap });
  const [a, b, c] = show;
  const p0 = at(0);
  const p1 = at(1);
  const p2 = at(2);
  return (
    <g>
      {a > 0 && (
        <g opacity={a} transform={`translate(${p0.x} ${p0.y}) scale(${s})`}>
          {/* a head in profile, a card of the gist inside */}
          <path d="M 40 150 L 40 120 Q 0 110 10 70 Q 0 10 70 0 Q 150 -5 150 70 Q 150 110 120 125 L 120 150" fill={C.card} stroke={C.accentText} strokeWidth={6} strokeLinejoin="round" />
          <rect x={46} y={40} width={70} height={46} rx={6} fill={alpha(C.text, 0.9)} />
          <rect x={52} y={52} width={56} height={4} fill={alpha(C.marker, 0.8)} />
          <rect x={52} y={64} width={44} height={4} fill={alpha(C.muted, 0.8)} />
        </g>
      )}
      {b > 0 && (
        <g opacity={b} transform={`translate(${p1.x} ${p1.y}) scale(${s})`}>
          {/* an inbox: a tray with envelopes */}
          <rect x={30} y={20} width={110} height={74} rx={8} fill={C.card} stroke={C.accentText} strokeWidth={5} transform="rotate(-8 85 57)" />
          <path d="M 36 26 L 85 62 L 134 26" fill="none" stroke={C.accentText} strokeWidth={5} transform="rotate(-8 85 57)" />
          <path d="M 10 90 H 52 L 64 112 H 106 L 118 90 H 160 V 150 H 10 Z" fill={C.card} stroke={C.accentText} strokeWidth={6} strokeLinejoin="round" />
          <circle cx={140} cy={22} r={14} fill={C.marker} />
        </g>
      )}
      {c > 0 && (
        <g opacity={c} transform={`translate(${p2.x} ${p2.y}) scale(${s})`}>
          {/* a fridge with one note stuck on it */}
          <rect x={20} y={-10} width={120} height={170} rx={14} fill={C.card} stroke={C.accentText} strokeWidth={6} />
          <line x1={20} y1={50} x2={140} y2={50} stroke={C.accentText} strokeWidth={5} />
          <rect x={120} y={10} width={8} height={28} rx={4} fill={C.muted} />
          <rect x={120} y={66} width={8} height={40} rx={4} fill={C.muted} />
          <g transform="rotate(-6 70 100)">
            <rect x={28} y={66} width={104} height={70} rx={4} fill={C.warm} />
            <text x={80} y={96} textAnchor="middle" fontSize={22} fontWeight={800} fill={C.bg0}>
              {FRIDGE_NOTE.split(' ')[0]}
            </text>
            <text x={80} y={124} textAnchor="middle" fontSize={22} fontWeight={800} fill={C.bg0}>
              {FRIDGE_NOTE.split(' ')[1]}
            </text>
          </g>
        </g>
      )}
    </g>
  );
};

export const MemoryOffice: React.FC<AnimProps & MemoryOfficeProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const O = place(p.vertical, LAYOUT);
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
      <Frame zoom={s.zoom} vertical={p.vertical} design="both">
        <Floor y={O.floor.y} x={O.floor.x} w={O.floor.w} />
        {/* clipboard on the wall: fixed boxes */}
        <g opacity={dimmed(clip)}>
          <Nail x={O.clip.x + O.clip.w / 2} y={O.clip.y - 46} w={O.clip.w} lit={clip} />
          <MiniClipboard x={O.clip.x} y={O.clip.y} w={O.clip.w} h={O.clip.h} lit={clip} value={cClip > 0.3 ? OLD_DAY.slice(0, 3) : undefined} tick={cClip} />
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
            <Page key={k} x={O.desk.x + 40 - 30 * k * cDesk} y={O.desk.y - 30 + (60 + 70 * k) * cDesk * (p.vertical ? 1 : 0.6)} w={120} rot={-10 - 25 * k * cDesk} opacity={cDesk} />
          ))}
          <Crack x={O.desk.x + 140} y={O.desk.y + 4} w={200} h={150} p={cDesk} />
        </g>
        {/* the notecard: the summary */}
        <g opacity={dimmed(card)}>
          <Notecard x={O.card.x} y={O.card.y} w={O.card.w} lit={card} text={p.mode === 'verdict' ? CARD_TEXT : ''} write={1} blur={cCard} />
          <Crack x={O.card.x - 60} y={O.card.y - 50} w={120} h={100} p={cCard} />
        </g>
        {/* links: the summary in front, the notebook behind it, a box for what will matter */}
        {s.links[0] > 0 && (
          <path
            d={
              p.vertical
                ? `M ${cardC.x - 70} ${cardC.y} C ${cardC.x - 250} ${cardC.y - 220}, ${cabTop.x + 120} ${cabTop.y - 220}, ${cabTop.x} ${cabTop.y - 10}`
                : // landscape: along the front of the desk, under the robot, to the cabinet's side
                  `M ${cardC.x - 80} ${cardC.y + 22} C ${cardC.x - 260} ${cardC.y + 80}, ${cabTop.x + 240} ${cabTop.y + 100}, ${cabTop.x + O.cabinet.w / 2 + 12} ${cabTop.y + 70}`
            }
            fill="none"
            stroke={C.ok}
            strokeWidth={6}
            strokeDasharray="14 12"
            opacity={s.links[0]}
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
        <Human x={O.human.x} y={O.human.y} gap={O.human.gap} s={O.human.s} show={s.human} vertical={p.vertical} />
        {s.line > 0 && (
          <text x={O.line.x} y={O.line.y} textAnchor={O.line.anchor} fontSize={O.line.size} fontWeight={600} fill={C.muted} opacity={s.line} letterSpacing={0.5}>
            {ADVICE_LINE}
          </text>
        )}
        {O.recipe &&
          RECIPE.map((item, i) =>
            s.recipe[i] > 0 ? (
              <g key={item} opacity={s.recipe[i]}>
                <text x={O.recipe!.x + (i ? 0 : 0)} y={O.recipe!.y + i * O.recipe!.gap + 41} fontSize={O.recipe!.size} fontWeight={800} fill={C.text}>
                  {(i ? '+ ' : '') + item}
                </text>
              </g>
            ) : null,
          )}
      </Frame>
    </AbsoluteFill>
  );
};
