// The recipe: chapter 6, "What to use". See ShopRecipe.state.ts for the beats of each mode.
// Laid out for landscape (1920x1080): the recipe list on the left, the picture of the item being
// spoken on the right. The vertical cut fits the same drawing into its stage.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { Canvas } from './Canvas.tsx';
import { fitInto, stageBox } from './canvas.ts';
import { Floor } from './office.tsx';
import { Binder, Checklist, ClearSheetOver, KnowBook, LessonStack, MannersBook, NoteCard, RecipeList, recipeHeight } from './recipe.tsx';
import { ITEMS, LORA_FIRST, QUESTIONS, REPLAY, frameState, type ShopRecipeProps } from './ShopRecipe.state.ts';

export { frameState };
export type { ShopRecipeProps };

const SIZE = 56;
const LIST = { x: 166, w: 1060 };
const LIST_Y = 140 + (690 - recipeHeight(SIZE)) / 2;
/** The picture column, right of the list. */
const PIC = { x: 1270, w: 470, cx: 1505 };
const FLOOR_Y = 790;

const Label: React.FC<{ y: number; text: string; color: string; size?: number; opacity?: number }> = ({ y, text, color, size = 30, opacity = 1 }) => (
  <text x={PIC.cx} y={y} textAnchor="middle" fontSize={size} fontWeight={800} fill={color} opacity={opacity}>
    {text}
  </text>
);

/** The book with the clear sheet on it (LoRA), the sheet lowering with `sheet`. */
const SheetBook: React.FC<{ x: number; y: number; w: number; h: number; sheet: number; label?: boolean; size?: number }> = ({ x, y, w, h, sheet, label = true, size = 30 }) => (
  <g>
    <KnowBook x={x} y={y} w={w} h={h} glowA={0.2} />
    <ClearSheetOver x={x} y={y} w={w} h={h} lower={sheet} write={Math.max(0, (sheet - 0.8) / 0.2)} label={label ? 'LoRA (the clear sheet)' : undefined} labelSize={size} />
  </g>
);

export const ShopRecipe: React.FC<AnimProps & ShopRecipeProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const pics = s.pics;
  // The sticky note falls from its place on the "manners" page to the floor (book.tsx's fall).
  const mb = { x: PIC.x + 10, y: 290, w: PIC.w, h: 300 };
  const f = s.fall;

  const drawing = (
    <g>
      {s.list > 0 && (
        <g opacity={s.list}>
          <RecipeList x={LIST.x} y={LIST_Y} w={LIST.w} size={SIZE} items={ITEMS} rows={s.items} lora={s.lora} loraText={LORA_FIRST} replay={s.replay} replayText={REPLAY} />

          {pics.note > 0 && (
            <g opacity={pics.note}>
              <NoteCard x={PIC.x + 15} y={280} w={440} h={330} rot={-3} glowA={0.5} days="14" />
              <Label y={700} text="the prompt (the note)" color={C.warm} />
            </g>
          )}
          {pics.binder > 0 && (
            <g opacity={pics.binder}>
              <Binder x={PIC.cx - 155} y={240} w={290} h={390} glowA={0.6} />
              <Label y={710} text="looking it up (the manual)" color={C.ok} size={30} />
            </g>
          )}
          {pics.book > 0 && (
            <g opacity={pics.book}>
              <SheetBook x={PIC.x + 10} y={250} w={PIC.w} h={400} sheet={s.sheet} />
            </g>
          )}
          {pics.stack > 0 && (
            <g opacity={pics.stack}>
              <LessonStack x={PIC.x} y={250} w={PIC.w} ordinary={s.ordinary} size={30} />
            </g>
          )}
          {pics.floor > 0 && (
            <g opacity={pics.floor}>
              <MannersBook {...mb} empty={f} fallDx={-0.12} fallDy={0.42} />
              <Floor y={FLOOR_Y} x={PIC.x - 10} w={PIC.w + 20} />
            </g>
          )}
          {pics.corner > 0 && (
            <g opacity={pics.corner}>
              <SheetBook x={PIC.x + 20} y={430} w={PIC.w - 10} h={290} sheet={s.sheet} size={28} />
            </g>
          )}
        </g>
      )}

      {s.check.panel > 0 && (
        <g opacity={s.check.panel}>
          <text x={500} y={200} textAnchor="middle" fontSize={40} fontWeight={800} fill={C.warm}>
            the prompt (the note)
          </text>
          <NoteCard x={200} y={240} w={600} h={430} days="14" lit={0.6 + 0.4 * s.check.note} glowA={0.8 * s.check.note} />
          <text x={1310} y={200} textAnchor="middle" fontSize={40} fontWeight={800} fill={C.ok}>
            10 real customer questions
          </text>
          <Checklist x={880} y={230} w={860} rowH={56} items={QUESTIONS} rows={s.check.rows} ticks={s.check.ticks} size={30} />
        </g>
      )}
    </g>
  );

  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Canvas vertical={p.vertical}>{p.vertical ? <g transform={fitInto(stageBox(false), stageBox(true)).transform}>{drawing}</g> : drawing}</Canvas>
    </AbsoluteFill>
  );
};
