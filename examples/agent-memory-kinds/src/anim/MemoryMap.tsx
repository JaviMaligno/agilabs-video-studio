// The memory map, the cold open (scene 1): the robot with the red slip in the middle, four tiles
// around it (the desk, the gist, the notebook, the form), each with its human name and how it
// fails, drawn small. See MemoryMap.state.ts.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { CARD_TEXT } from './MemoryDesk.state.ts';
import { SHELF0 } from './memory.ts';
import { TILES, frameState, type MemoryMapProps, type TileKind } from './MemoryMap.state.ts';
import { Badge, Cabinet, Desk, Frame, Lens, MiniClipboard, Notecard, Page, Robot, Slip, glow } from './office.tsx';

export { frameState };
export type { MemoryMapProps };

/**
 * Layout (frame pixels). Two rows of tiles with the robot's band between them, all inside the
 * stage and above the hook panel the intro lays at y = 1216 (V.stageBottom - 110).
 */
const L = {
  cols: [72, 548],
  rows: [236, 865],
  w: 460,
  h: 339,
  robot: { x: 330, y: 617, s: 0.5 },
  slip: { x: 600, y: 702, w: 400, rot: -5 },
} as const;

/** The small picture of each memory and its failure, in tile coordinates (460 x 339). */
const Picture: React.FC<{ kind: TileKind }> = ({ kind }) => {
  if (kind === 'desk')
    return (
      // the desk with its pile, pages spilling off the edge
      <g transform="translate(60 192) scale(0.6)">
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
    return <Notecard x={230} y={262} w={240} text={CARD_TEXT} write={1} blur={1} />;
  if (kind === 'notebook')
    return (
      // the cabinet holds the slip, the magnifier does not know to look there
      <g>
        <g transform="translate(96 196) scale(0.5)">
          <Cabinet x={0} y={0} w={220} h={270} peek={1} peekDrawer={1} />
        </g>
        <Lens x={290} y={252} r={38} />
        <text x={398} y={292} textAnchor="middle" fontSize={84} fontWeight={800} fill={C.warm}>
          ?
        </text>
      </g>
    );
  return (
    // a form box that says "full", ticked with the same confidence as a right value
    <g>
      <MiniClipboard x={40} y={204} w={100} h={124} lit={1} />
      <text x={172} y={232} fontSize={26} fontWeight={800} fill={C.muted} letterSpacing={1}>
        {SHELF0}
      </text>
      <rect x={170} y={246} width={168} height={74} rx={12} fill={C.bg1} stroke={alpha(C.text, 0.8)} strokeWidth={4} />
      <text x={254} y={298} textAnchor="middle" fontSize={50} fontWeight={800} fill={C.text}>
        full
      </text>
      <Badge x={382} y={283} r={30} kind="tick" pop={1} />
    </g>
  );
};

export const MemoryMap: React.FC<AnimProps & MemoryMapProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Frame>
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
              <text x={L.w / 2} y={76} textAnchor="middle" fontSize={56} fontWeight={800} fill={C.text} letterSpacing={-0.5}
                // the longest label ("THE NOTEBOOK") is held clear of the tile edges
                {...(tile.label.length > 10 ? { textLength: 404, lengthAdjust: 'spacingAndGlyphs' as const } : {})}
              >
                {tile.label}
              </text>
              {tile.fail.map((line, j) => (
                <text key={j} x={L.w / 2} y={126 + 42 * j} textAnchor="middle" fontSize={36} fontWeight={700} fill={C.marker}>
                  {line}
                </text>
              ))}
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
