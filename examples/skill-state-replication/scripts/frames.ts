// Prints still frames per scene: its end, and 0.7 s after each mark. Usage: node scripts/frames.ts [scene...]
import { TIMELINE } from '../src/timeline.ts';
import { FPS, SCENE_TRANSITION, sceneFrames, sceneStarts } from '../src/timing.ts';
const want = process.argv.slice(2);
const { starts } = sceneStarts(TIMELINE);
const out: number[] = [];
TIMELINE.forEach((s, i) => {
  if (want.length && !want.includes(s.id)) return;
  const marks = ((s.anim?.props.marks as number[] | undefined) ?? []).filter(Number.isFinite);
  const end = starts[i] + sceneFrames(s) - SCENE_TRANSITION - 2;
  const fs = [...marks.map((m) => starts[i] + Math.round((m + 0.7) * FPS)), end].filter((f) => f <= end);
  console.error(s.id, fs.join(' '));
  out.push(...fs);
});
console.log([...new Set(out)].sort((a, b) => a - b).join(' '));
