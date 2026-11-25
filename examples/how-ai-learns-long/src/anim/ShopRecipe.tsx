// The recipe: chapter 6, "What to use". See ShopRecipe.state.ts for the beats of each mode.
// Laid out for landscape (1920x1080): the recipe list on the left, the picture of the item being
// spoken on the right. The vertical cut fits the same drawing into its stage.
import React from 'react';
import { AbsoluteFill, staticFile } from 'remotion';
import { C } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { Canvas } from './Canvas.tsx';
import { fitInto, stageBox } from './canvas.ts';
import { Floor } from './office.tsx';
import { Binder, Checklist, ClearSheetOver, KnowBook, LessonStack, MannersBook, MixResult, NoteCard, RecipeList, recipeHeight } from './recipe.tsx';
import { ITEMS, LORA_FIRST, QUESTIONS, REPLAY, STICKY, frameState, type ShopRecipeProps } from './ShopRecipe.state.ts';

export { frameState };
export type { ShopRecipeProps };

const SIZE = 56;
const LIST = { x: 166, w: 1060 };
const LIST_Y = 140 + (690 - recipeHeight(SIZE)) / 2;
/** The picture column, right of the list. */
const PIC = { x: 1270, w: 470, cx: 1505 };
const FLOOR_Y = 790;

/**
 * YouTube end-screen tail (endtail mode), in frame pixels (1920x1080, landscape only). Free for
 * YouTube: the next-video box (x 1000-1720, y 120-525) and the subscribe circle under it
 * (centre 1360, 690, r 85). The avatar stands on the left pointing at them; the site and the
 * credits sit in a low band.
 */
const END_BAND_Y = 845;
const END_CREDITS = ['How an AI learns · tests from my own fine-tuning runs', 'Every source and paper is linked in the description'];
const EndTail: React.FC<{ end: { avatar: number; band: number } }> = ({ end }) => {
  const AV = 560;
  return (
    <g>
      {end.avatar > 0 && (
        <image href={staticFile('cast/avatar-pointing.png')} x={110} y={END_BAND_Y - AV + 22 + (1 - end.avatar) * 30} width={AV} height={AV} opacity={end.avatar} />
      )}
      {end.band > 0 && (
        <g opacity={end.band}>
          <rect x={0} y={END_BAND_Y} width={1920} height={1080 - END_BAND_Y} fill={C.bg0} opacity={0.96} />
          <text x={120} y={END_BAND_Y + 78} fontSize={56} fontWeight={800} fill={C.accentText}>
            javieraguilar.ai
          </text>
          {END_CREDITS.map((r, i) => (
            <text key={i} x={120} y={END_BAND_Y + 132 + i * 40} fontSize={28} fontWeight={500} fill={C.muted}>
              {r}
            </text>
          ))}
        </g>
      )}
    </g>
  );
};

/** endtail: the corner book (drawn at 1290, 430) slides to (600, 470) at 0.8 scale, left of the
 *  next-video box and the subscribe circle, right of the avatar. */
const cornerSlide = (k: number): string | undefined => {
  if (k <= 0) return undefined;
  const x = 1290 + (600 - 1290) * k;
  const y = 430 + (470 - 430) * k;
  return `translate(${x} ${y}) scale(${1 - 0.2 * k}) translate(-1290 -430)`;
};

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
    <g opacity={1 - 0.55 * s.end.dim}>
      {s.list > 0 && (
        <g opacity={s.list}>
          <g opacity={1 - s.end.dim}>
          <RecipeList x={LIST.x} y={LIST_Y} w={LIST.w} size={SIZE} items={ITEMS} rows={s.items} lora={s.lora} loraText={LORA_FIRST} replay={s.replay} replayText={REPLAY} />
          </g>

          {pics.note > 0 && (
            <g opacity={pics.note}>
              <NoteCard x={PIC.x + 15} y={280} w={440} h={330} rot={-3} glowA={0.5} days="14" />
              <Label y={700} text="the prompt (the note)" color={C.warm} />
            </g>
          )}
          {pics.binder > 0 && (
            <g opacity={pics.binder}>
              <Binder x={PIC.cx - 155} y={240} w={290} h={390} glowA={0.6} />
              <Label y={710} text="retrieval (the manual)" color={C.ok} size={30} />
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
              <MixResult x={PIC.x} y={640} w={PIC.w} {...s.mix} sticky={STICKY} size={28} />
            </g>
          )}
          {pics.floor > 0 && (
            <g opacity={pics.floor}>
              <MannersBook {...mb} empty={f} fallDx={-0.12} fallDy={0.42} />
              <Floor y={FLOOR_Y} x={PIC.x - 10} w={PIC.w + 20} />
            </g>
          )}
          {pics.corner > 0 && (
            <g opacity={pics.corner} transform={cornerSlide(s.end.slide)}>
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
      <Canvas vertical={p.vertical}>
        {p.vertical ? <g transform={fitInto(stageBox(false), stageBox(true)).transform}>{drawing}</g> : drawing}
        {!p.vertical && <EndTail end={s.end} />}
      </Canvas>
    </AbsoluteFill>
  );
};
