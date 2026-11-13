// The memory map: the robot with the red slip and five tiles (training, the desk, the summary, the
// notebook, the form), each a one-word name over a drawing of how it fails. See MemoryMap.state.ts.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { CARD_TEXT } from './MemoryDesk.state.ts';
import { SHELF0 } from './memory.ts';
import { MAP_TITLE, TILES, frameState, type MemoryMapProps, type TileKind } from './MemoryMap.state.ts';
import { place } from './canvas.ts';
import { RECIPE } from './MemoryOffice.state.ts';
import { Badge, BookShelf, Cabinet, Desk, Frame, Lens, MiniClipboard, Notecard, Page, Robot, Slip, glow } from './office.tsx';

export { frameState };
export type { MemoryMapProps };

/** Tile pictures are drawn in a 460 x 339 box and scaled by `k` per format. */
const TILE = { w: 460, h: 339 } as const;

/**
 * Layout (frame pixels), per format, tiles in TILES order.
 * - landscape (stage x 160-1760, y 140-830): the title across the top, three tiles in a row, then
 *   NOTEBOOK and FORM with the robot and its slip between them;
 * - vertical (stage y 236-1326): two columns, FORM beside the robot on the third row, the title under.
 */
const LAYOUT = {
  v: {
    k: 0.8,
    tiles: [
      { x: 142, y: 236 },
      { x: 570, y: 236 },
      { x: 142, y: 527 },
      { x: 570, y: 527 },
      { x: 142, y: 818 },
    ],
    robot: { x: 690, y: 836, s: 0.5 },
    slip: { x: 850, y: 948, w: 210, rot: -5 },
    title: { x: 540, y: 1180, size: 64 },
  },
  l: {
    k: 0.835,
    tiles: [
      { x: 344, y: 238 },
      { x: 768, y: 238 },
      { x: 1192, y: 238 },
      { x: 344, y: 545 },
      { x: 1192, y: 545 },
    ],
    robot: { x: 870, y: 562, s: 0.5 },
    slip: { x: 1040, y: 660, w: 220, rot: -5 },
    title: { x: 960, y: 200, size: 60 },
  },
};

/**
 * Layout with the recipe beside the map (closing scene).
 * - landscape: the map shrunk into the left two thirds, the recipe in a column at the right;
 * - vertical: the title raised a little, the recipe in three short lines under it.
 */
const LAYOUT_RECIPE = {
  v: {
    ...LAYOUT.v,
    title: { x: 540, y: 1148, size: 56 },
    recipe: { x: 150, y: 1196, gap: 42, size: 28, head: null as null | { y: number } },
  },
  l: {
    k: 0.7,
    tiles: [
      { x: 190, y: 236 },
      { x: 536, y: 236 },
      { x: 882, y: 236 },
      { x: 190, y: 497 },
      { x: 882, y: 497 },
    ],
    robot: { x: 640, y: 520, s: 0.4 },
    slip: { x: 790, y: 670, w: 160, rot: -5 },
    title: { x: 697, y: 196, size: 56 },
    recipe: { x: 1250, y: 330, gap: 84, size: 27, head: { y: 270 } as null | { y: number } },
  },
};

/** The picture of each memory and its failure, in tile coordinates (460 x 339, under the label). */
const Picture: React.FC<{ kind: TileKind }> = ({ kind }) => {
  if (kind === 'training')
    return (
      // the shelf of what it learned, behind closed glass; today's slip bounces off
      <g>
        <BookShelf x={50} y={128} w={270} h={170} lit={1} doors={1} />
        <path d="M 330 150 Q 360 120 392 170" fill="none" stroke={alpha(C.marker, 0.8)} strokeWidth={5} strokeDasharray="10 8" />
        <Slip x={392} y={222} w={120} rot={24} />
      </g>
    );
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
  if (kind === 'summary')
    // the summary on a card, the exact words blurred below it
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
  const L = p.recipe ? place(p.vertical, LAYOUT_RECIPE) : { ...place(p.vertical, LAYOUT), recipe: null };
  const R = L.recipe;
  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Frame vertical={p.vertical} design="both">
        {TILES.map((tile, i) => {
          const { x, y: y0 } = L.tiles[i];
          const y = y0 + s.float[i];
          const e = s.emphasis[i];
          const op = s.opacity[i];
          const k = L.k * (1 + 0.02 * e);
          return (
            <g key={tile.kind} transform={`translate(${x + (TILE.w * L.k) / 2} ${y + (TILE.h * L.k) / 2}) scale(${k}) translate(${-TILE.w / 2} ${-TILE.h / 2})`}>
              {/* the empty frame, drawn in before the tile is named */}
              {op < 1 && s.frames > 0 && (
                <rect
                  x={0}
                  y={0}
                  width={TILE.w}
                  height={TILE.h}
                  rx={28}
                  fill="none"
                  stroke={alpha(C.accentText, 0.5 * s.frames * (1 - op))}
                  strokeWidth={4}
                  strokeDasharray="18 14"
                />
              )}
              {op > 0 && (
                <g opacity={op}>
                  <g style={glow(C.accentText, e)}>
                    <rect x={0} y={0} width={TILE.w} height={TILE.h} rx={28} fill={C.card} stroke={alpha(C.accentText, 0.45 + 0.55 * e)} strokeWidth={4 + 2 * e} />
                  </g>
                  <text x={TILE.w / 2} y={80} textAnchor="middle" fontSize={64} fontWeight={800} fill={C.text} letterSpacing={1}>
                    {tile.label}
                  </text>
                  <Picture kind={tile.kind} />
                </g>
              )}
            </g>
          );
        })}
        {/* the robot holding up the message every tile is about */}
        <Slip x={L.slip.x} y={L.slip.y + s.robot.bob * 3} w={L.slip.w} rot={L.slip.rot} glowA={s.slip.glow} />
        <Robot x={L.robot.x} y={L.robot.y + s.robot.bob * 3} s={L.robot.s} face={-1} armUp={1} shelf={0.6} blink={s.robot.blink} />
        {s.title > 0 && (
          <text x={L.title.x} y={L.title.y} textAnchor="middle" fontSize={L.title.size} fontWeight={800} fill={C.text} opacity={s.title} letterSpacing={0.5}>
            {MAP_TITLE}
          </text>
        )}
        {/* the recipe from chapter 7, small, beside the map */}
        {R && s.recipe > 0 && (
          <g opacity={s.recipe}>
            {R.head && (
              <text x={R.x} y={R.head.y} fontSize={28} fontWeight={700} fill={C.muted}>
                what my tests point to
              </text>
            )}
            {RECIPE.map((item, i) => {
              const y = R.y + i * R.gap;
              const r = R.size * 0.62;
              return (
                <g key={item}>
                  <circle cx={R.x + r} cy={y - R.size * 0.34} r={r} fill={i === 2 ? alpha(C.ok, 0.5) : C.ok} />
                  <text x={R.x + r} y={y - R.size * 0.34 + R.size * 0.3} textAnchor="middle" fontSize={R.size * 0.8} fontWeight={800} fill={C.bg0}>
                    {i + 1}
                  </text>
                  <text x={R.x + 2 * r + 12} y={y} fontSize={R.size} fontWeight={800} fill={i === 2 ? alpha(C.text, 0.8) : C.text}>
                    {item}
                  </text>
                </g>
              );
            })}
          </g>
        )}
      </Frame>
    </AbsoluteFill>
  );
};
