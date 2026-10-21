// Prints, per scene, its start frame and a frame just before its hand-over (for stills).
import { TIMELINE } from '../src/timeline.ts';
import { sceneStarts, sceneFrames, SCENE_TRANSITION } from '../src/timing.ts';
const { starts, total } = sceneStarts(TIMELINE);
const out = [];
TIMELINE.forEach((s, i) => {
  const end = starts[i] + sceneFrames(s) - SCENE_TRANSITION - 2;
  console.log(s.id.padEnd(8), 'start', starts[i], 'end', end, 'beats', s.beats.map((b) => starts[i] + Math.round(b * 30)).join(','));
  out.push(end);
});
console.log('total', total, (total / 30).toFixed(2), 's');
console.log('ENDS', out.join(' '));
