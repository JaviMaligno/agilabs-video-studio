// The memory map, the cold open (scene 1): the robot with the red slip in the middle, four tiles
// around it (the desk, the gist, the notebook, the form), each a one-word human name over a
// drawing of how it fails. See MemoryMap.state.ts.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { CARD_TEXT } from './MemoryDesk.state.ts';
import { SHELF0 } from './memory.ts';
import { TILES, frameState, type MemoryMapProps, type TileKind } from './MemoryMap.state.ts';
import { place } from './canvas.ts';
import { Badge, Cabinet, Desk, Frame, Lens, MiniClipboard, Notecard, Page, Robot, Slip, glow } from './office.tsx';

export { frameState };
export type { MemoryMapProps };

/**
 * Layout (frame pixels), per format; tiles keep their size (460 x 339) so the pictures are shared.
 * - vertical: two rows of tiles with the robot's band between them, all inside the stage and
 *   above the hook panel the intro lays at y = 1216 (V.stageBottom - 110);
 * - landscape: two tiles on each side of the stage (x 160-1760, y 140-830), the robot and its
 *   slip in the middle column.
 */
const LAYOUT = {
  v: {
    cols: [72, 548],
    rows: [236, 865],
    w: 460,
    h: 339,
    robot: { x: 330, y: 617, s: 0.5 },
    slip: { x: 600, y: 702, w: 400, rot: -5 },
  },
  l: {
    cols: [170, 1290],
    rows: [146, 485],
    w: 460,
    h: 339,
    robot: { x: 800, y: 360, s: 0.6 },
    slip: { x: 1070, y: 460, w: 400, rot: -5 },
  },
};

/** The picture of each memory and its failure, in tile coordinates (460 x 339, under the label). */
const Picture: React.FC<{ kind: TileKind }> = ({ kind }) => {
  if (kind === 'desk')
    return (
      // the desk with its pile, pages spilling off the edge
      <g transform="translate(30 150) scale(0.72)">
        <Desk x={0} y={66} w={420} />
        {[0, 1, 2, 3].map((k) => (
          <Page key={k} x={190 + 6 * (k % 2)} y={50 - 13 * k} w={170} rot={(k % 2 ? 3 : -4) + k} />
        ))}
        <Page x={430} y={92} w={140} rot={28} />
        <Page x={485} y={150} w={130} rot={62} />
      </g>
    );
  if (kind === 'gist')
    // the gist on a card, the exact words blurred below it
    return <Notecard x={230} y={218} w={340} text={CARD_TEXT} write={1} blur={1} />;
  if (kind === 'notebook')
    return (
      // the cabinet holds the slip, the magnifier does not know to look there
      <g>
        <g transform="translate(48 116) scale(0.75)">
          <Cabinet x={0} y={0} w={220} h={270} peek={1} peekDrawer={1} />
        </g>
        <Lens x={292} y={206} r={48} />
        <text x={404} y={200} textAnchor="middle" fontSize={110} fontWeight={800} fill={C.warm}>
          ?
        </text>
      </g>
    );
  return (
    // a form box that says "full", ticked with the same confidence as a right value
    <g>
      <MiniClipboard x={18} y={140} w={128} h={164} lit={1} />
      <text x={172} y={182} fontSize={32} fontWeight={800} fill={C.muted} letterSpacing={1}>
        {SHELF0}
      </text>
      <rect x={168} y={198} width={190} height={100} rx={14} fill={C.bg1} stroke={alpha(C.text, 0.85)} strokeWidth={5} />
      <text x={263} y={270} textAnchor="middle" fontSize={66} fontWeight={800} fill={C.text}>
        full
      </text>
      <Badge x={396} y={248} r={32} kind="tick" pop={1} />
    </g>
  );
};

export const MemoryMap: React.FC<AnimProps & MemoryMapProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const L = place(p.vertical, LAYOUT);
  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Frame vertical={p.vertical} design="both">
        {TILES.map((tile, i) => {
          const x = L.cols[i % 2];
          const y = L.rows[Math.floor(i / 2)] + s.float[i];
          const e = s.emphasis[i];
          const k = 1 + 0.02 * e;
          return (
            <g key={tile.kind} opacity={s.opacity[i]} transform={`translate(${x + L.w / 2} ${y + L.h / 2}) scale(${k}) translate(${-L.w / 2} ${-L.h / 2})`}>
              <g style={glow(C.accentText, e)}>
                <rect x={0} y={0} width={L.w} height={L.h} rx={28} fill={C.card} stroke={alpha(C.accentText, 0.45 + 0.55 * e)} strokeWidth={4 + 2 * e} />
              </g>
              <text x={L.w / 2} y={80} textAnchor="middle" fontSize={64} fontWeight={800} fill={C.text} letterSpacing={1}>
                {tile.label}
              </text>
              <Picture kind={tile.kind} />
            </g>
          );
        })}
        {/* the middle: the robot holding up the message every tile is about */}
        <Slip x={L.slip.x} y={L.slip.y + s.robot.bob * 3} w={L.slip.w} rot={L.slip.rot} glowA={s.slip.glow} />
        <Robot x={L.robot.x} y={L.robot.y + s.robot.bob * 3} s={L.robot.s} face={-1} armUp={1} shelf={0.6} blink={s.robot.blink} />
      </Frame>
    </AbsoluteFill>
  );
};
