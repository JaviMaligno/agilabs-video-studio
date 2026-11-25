// Pure state of the recipe: chapter 6, "What to use" (script rows 40-44, 46-47).
// - recipe: the verdict built item by item, each on its mark, the item being spoken lit and the
//   earlier ones kept: "1 · The prompt" with its note on screen from frame 0, lit on "prompt", "2 · Looking it up" (mark "looking"),
//   "3 · Fine-tune for a habit" (its line) "→ LoRA first" (mark "LoRA"), the sub-item "full
//   fine-tuning? mix in ordinary text" (mark "ordinary"), "4 · Check more than the new thing"
//   (mark "check"). Beside the list, the picture of the item lit: the note, the binder, the book
//   and the clear sheet lowering onto it, a lesson stack with every tenth card from an ordinary
//   book, the "manners" book with its sticky note "One line, please" fallen to the floor.
//   Under the lesson stack, while the sub-item is spoken, what the mixed-in text did: a "general
//   knowledge" meter that wins most of its loss back and is ticked (mark "general"), and the
//   sticky note "One line, please" crossed out in red, staying crossed (mark "manners").
//   Marks: [prompt, looking, LoRA, ordinary, check, general, manners] (marks 0-4 are one per line,
//   in line order; 5 and 6 both sit in line 4, the sub-item's).
// - today: the note and a checklist of 10 customer questions ticking one by one (marks "note",
//   "ten"); then the full recipe with the clear sheet over the book in the corner, the prompt lit on
//   "cheapest" and the check lit on "check". Marks: [note, ten, cheapest, check].
// - endtail: the YouTube end screen (plugin rule, PR #32). The last picture of today stays as it
//   ended (check lit) while "More at javieraguilar.ai" is spoken; then, for the last END_TAIL
//   seconds (no narration), it dims (the list goes), the book with the clear sheet slides
//   out of the boxes to the middle, the author's avatar stands on the left pointing at the free
//   upper right (next-video box) and the site and credits rise in a low band.
// No Remotion or React here.
import { beatOr, ease, mark, pickMode } from './memory.ts';
import { clamp01, sceneTime } from './steps.ts';

export const RECIPE_MODES = ['recipe', 'today', 'endtail'] as const;
/** Seconds of the silent end-screen tail at the end of the endtail scene. */
export const END_TAIL = 18;
export type RecipeMode = (typeof RECIPE_MODES)[number];
export type ShopRecipeProps = { mode?: RecipeMode; marks?: number[] };

/** The recipe as written on screen. `sub` is the line under the title. */
export const ITEMS = [
  { n: '1', title: 'The prompt', sub: '' },
  { n: '2', title: 'Looking it up', sub: '(many facts, facts that change)' },
  { n: '3', title: 'Fine-tune for a habit', sub: '' },
  { n: '4', title: 'Check more than the new thing', sub: '' },
] as const;
export const LORA_FIRST = '→ LoRA first';
export const REPLAY = 'full fine-tuning? mix in ordinary text';
export const STICKY = 'One line, please';
/** Ten real questions from the shop's customers (today mode). */
export const QUESTIONS = [
  'Can I return worn shoes?',
  'Do you ship to Spain?',
  'Is size 42 true to size?',
  'Where is my order?',
  'Can I swap the colour?',
  'Do you do wide fit?',
  'How do I clean suede?',
  'Can I pay later?',
  'Do I need the box?',
  'Are these waterproof?',
] as const;

/** Rows of the list: the four items plus the sub-item under 3 (index 4 in `rows`, drawn under 3). */
export type RecipeRow = { appear: number; lit: number };
export type ShopRecipeState = {
  mode: RecipeMode;
  /** The recipe panel (the list and its pictures), in [0, 1]. */
  list: number;
  /** Items 1-4: appeared and lit. */
  items: RecipeRow[];
  /** "→ LoRA first" on item 3. */
  lora: number;
  /** The sub-item under 3. */
  replay: RecipeRow;
  /** Pictures beside the list, one shown at a time (opacities), and their motion. */
  pics: { note: number; binder: number; book: number; stack: number; floor: number; corner: number };
  sheet: number;
  ordinary: number;
  fall: number;
  /** recipe, under the lesson stack: the "general knowledge" row (shown, its recovery, its tick)
   *  and the "manners" sticky (shown, crossed out). */
  mix: { knowledge: number; recover: number; tick: number; manners: number; cross: number };
  /** today: the note and the checklist panel, and each question's tick. */
  /** `note` lights the note (it is on screen from the start); `rows` bring in the empty checklist. */
  check: { panel: number; note: number; rows: number[]; ticks: number[] };
  /** endtail: the picture dimming, the pointing avatar and the low band (site and credits). */
  /** `slide` moves the book with the clear sheet out of the end-screen boxes, beside the avatar. */
  end: { dim: number; avatar: number; band: number; slide: number };
};

const NO_END = { dim: 0, avatar: 0, band: 0, slide: 0 };

/** Shown from its own start until the next starts (cross-fade 0.4 s). */
const between = (T: number, a: number, b: number): number => clamp01(ease(T, a - 0.2, 0.4) * (1 - ease(T, b - 0.2, 0.4)));

export function frameState(props: ShopRecipeProps, t: number, beats: number[], dur: number): ShopRecipeState {
  const mode = pickMode(props?.mode, RECIPE_MODES);
  const T = sceneTime(Number.isFinite(t) ? t : 0, dur);
  const m = props?.marks;
  const b0 = beatOr(beats, 0, 0.2);

  if (mode === 'recipe') {
    const b: number[] = [b0];
    const gaps = [5.6, 4.2, 8.1, 12.7];
    for (let i = 1; i < 5; i++) b[i] = Math.max(b[i - 1] + 1, beatOr(beats, i, b[i - 1] + gaps[i - 1]));
    const inLine = (i: number, fb: number) => {
      const hi = i + 1 < 5 ? b[i + 1] - 0.3 : Number.POSITIVE_INFINITY;
      return Math.min(Math.max(mark(m, i, fb), b[i]), Math.max(b[i], hi));
    };
    const s1 = inLine(0, b[0] + 1.5);
    const s2 = inLine(1, b[1] + 3);
    const s3 = b[2] + 0.3;
    const sLora = Math.max(s3 + 0.8, inLine(2, b[2] + 6));
    const sReplay = inLine(3, b[3] + 3.5);
    const s4 = inLine(4, b[4] + 1.5);
    const starts = [s1, s2, s3, s4];
    // item 1 and its note are there from the first frame (the line opens on them); item 1 lights on "prompt"
    const items = starts.map((s, i) => {
      const next = i === 2 ? sReplay : (starts[i + 1] ?? Number.POSITIVE_INFINITY);
      return { appear: i === 0 ? ease(T, -0.2, 0.4) : ease(T, s - 0.15, 0.5), lit: between(T, s, next) };
    });
    const replay = { appear: ease(T, sReplay - 0.15, 0.5), lit: between(T, sReplay, s4) };
    const tenth = Math.max(sReplay + 1.2, b[3] + 0.42 * (b[4] - b[3]));
    // "...won back most of the general knowledge. But not the manners": both inside line 4
    const lineEnd = Math.max(b[3], b[4] - 0.6);
    const sGeneral = Math.min(Math.max(mark(m, 5, b[3] + 0.63 * (b[4] - b[3])), sReplay + 0.8), lineEnd);
    const sManners = Math.min(Math.max(mark(m, 6, b[3] + 0.76 * (b[4] - b[3])), sGeneral + 0.6), lineEnd);
    return {
      mode,
      list: 1,
      items,
      lora: ease(T, sLora - 0.15, 0.5),
      replay,
      pics: {
        note: between(T, 0, s2),
        binder: between(T, s2, s3),
        book: between(T, s3, sReplay),
        stack: between(T, sReplay, s4),
        floor: between(T, s4, Number.POSITIVE_INFINITY),
        corner: 0,
      },
      sheet: ease(T, sLora, 1.2),
      ordinary: ease(T, tenth, 1.0),
      fall: ease(T, s4 + 0.6, 1.0),
      mix: {
        knowledge: ease(T, sGeneral - 0.9, 0.4),
        recover: ease(T, sGeneral - 0.4, 0.9),
        tick: ease(T, sGeneral + 0.4, 0.4),
        manners: ease(T, sManners - 0.6, 0.4),
        cross: ease(T, sManners - 0.05, 0.4),
      },
      check: { panel: 0, note: 0, rows: QUESTIONS.map(() => 0), ticks: QUESTIONS.map(() => 0) },
      end: NO_END,
    };
  }

  if (mode === 'endtail') {
    // Opens on today's last frame (same picture, no cut); the tail is the last END_TAIL seconds.
    const D = Number.isFinite(dur) && dur > 0 ? dur : END_TAIL;
    const tail = Math.max(0, D - END_TAIL);
    return {
      mode,
      list: 1,
      items: [0, 1, 2, 3].map((i) => ({ appear: 1, lit: i === 3 ? 1 : 0 })),
      lora: 1,
      replay: { appear: 1, lit: 0 },
      pics: { note: 0, binder: 0, book: 0, stack: 0, floor: 0, corner: 1 },
      sheet: 1,
      ordinary: 1,
      fall: 1,
      mix: { knowledge: 0, recover: 0, tick: 0, manners: 0, cross: 0 },
      check: { panel: 0, note: 0, rows: QUESTIONS.map(() => 0), ticks: QUESTIONS.map(() => 0) },
      end: { dim: ease(T, tail + 0.4, 1.0), avatar: ease(T, tail + 0.7, 0.7), band: ease(T, tail + 0.9, 0.6), slide: ease(T, tail + 0.4, 1.2) },
    };
  }

  // today
  const b1 = Math.max(b0 + 2, beatOr(beats, 1, b0 + 7.6));
  const clampIn = (x: number, lo: number, hi: number) => Math.min(Math.max(x, lo), Math.max(lo, hi));
  const note = clampIn(mark(m, 0, b0 + 2), b0, b1 - 1.5);
  const ten = clampIn(mark(m, 1, note + 1.3), note, b1 - 1.2);
  const cheapest = clampIn(mark(m, 2, b1 + 2.6), b1, Number.POSITIVE_INFINITY);
  const checkAt = Math.max(cheapest + 0.8, mark(m, 3, cheapest + 2.2));
  // The ten ticks fill the time between "ten" and the next line, at most 0.45 s apart.
  const step = Math.max(0.12, Math.min(0.45, (b1 - 0.4 - ten) / QUESTIONS.length));
  // The checklist goes out, then the recipe comes in (no overlap of the two texts).
  const panel = 1 - ease(T, b1 - 0.4, 0.35);
  const list = ease(T, b1, 0.45);
  const lit1 = between(T, cheapest, checkAt);
  const lit4 = ease(T, checkAt - 0.2, 0.4);
  return {
    mode,
    list,
    items: [0, 1, 2, 3].map((i) => ({ appear: 1, lit: i === 0 ? lit1 : i === 3 ? lit4 : 0 })),
    lora: 1,
    replay: { appear: 1, lit: 0 },
    pics: { note: 0, binder: 0, book: 0, stack: 0, floor: 0, corner: 1 },
    sheet: 1,
    ordinary: 1,
    fall: 1,
    mix: { knowledge: 0, recover: 0, tick: 0, manners: 0, cross: 0 },
    check: {
      panel,
      note: ease(T, note - 0.2, 0.5),
      rows: QUESTIONS.map((_, i) => ease(T, b0 + i * 0.08, 0.3)),
      ticks: QUESTIONS.map((_, i) => ease(T, ten + i * step, 0.25)),
    },
    end: NO_END,
  };
}
