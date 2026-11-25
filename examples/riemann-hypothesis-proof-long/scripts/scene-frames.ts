// Prints each scene of the main EN cut: id, component.mode, start frame, frames, seconds, and the
// start second of each line inside the scene. Use it to pick frames for `remotion still`.
// Run: node scripts/scene-frames.ts [sceneId]
import { TIMELINE } from '../src/timeline.ts';
import { FPS, sceneStarts } from '../src/timing.ts';
const { starts, total } = sceneStarts(TIMELINE);
const only = process.argv[2];
TIMELINE.forEach((s, i) => {
  if (only && s.id !== only) return;
  const end = i + 1 < TIMELINE.length ? starts[i + 1] : total;
  const name = s.anim ? `${s.anim.name}.${String(s.anim.props.mode ?? '')}` : s.kind;
  console.log(`${s.id.padEnd(10)} ${name.padEnd(24)} start=${starts[i]} frames=${end - starts[i]} (${((end - starts[i]) / FPS).toFixed(1)} s) beats=[${s.beats.map((b) => b.toFixed(2)).join(', ')}]`);
});
console.log(`total ${total} frames = ${(total / FPS / 60).toFixed(2)} min`);
