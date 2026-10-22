// Pure state of the StoryPitch scenes: part 1's real Metrica sequence on the top-down pitch, ball
// hidden, told as the story of this video. Modes, in order:
// - part1:  players move, the ball hidden behind a pulsing "?" (tag "Part 1");
// - middle: a TV frame draws over the play, the frontier AI guesses drift to its centre ("the
//           middle"), then the real ball flashes in at the frame's edge;
// - doubt:  ball and overlays go, players fade to grey outlines, a big "?" ("enough information?");
// - test:   the big "?" turns into a ticked box.
// Illustrative (the rigour lives in the article); no number is drawn here. No Remotion or React.
import { cachedSpot, sample, type PlayData, type Pt } from './pitch.ts';
import { beatAt, clamp01, easeOutCubic, fit, progress, sceneTime } from './steps.ts';

export type StoryMode = 'part1' | 'middle' | 'doubt' | 'test';
export const STORY_MODES: StoryMode[] = ['part1', 'middle', 'doubt', 'test'];

export type StoryProps = {
  mode: StoryMode;
  /** Play seconds at the scene start and where the play comes to rest (just before the hand-over). */
  play: [number, number];
  blend?: boolean;
};

/** The TV frame in pitch metres (16:9), centred on the action; the ball ends near its right edge. */
export const FRAME = { x: 57, y: 21.7, w: 42, h: 23.6 };
export const FRAME_CENTRE = { x: FRAME.x + FRAME.w / 2, y: FRAME.y + FRAME.h / 2 };

/** Frontier AI guesses: where part 1 dropped them, and where they settle (either side of the centre). */
export const GUESSES = [
  { label: 'GPT', from: { x: 66, y: 41 }, to: { x: FRAME_CENTRE.x - 3.4, y: FRAME_CENTRE.y + 0.4 } },
  { label: 'Opus', from: { x: 73, y: 27 }, to: { x: FRAME_CENTRE.x + 3.4, y: FRAME_CENTRE.y - 0.4 } },
] as const;

/** Where the big "?" of the doubt scene sits: the middle of the visible pitch. */
export const BIG_Q = { x: 70.5, y: 34 };

/** Seconds after the line starts that the real ball flashes in (after "...the middle of the screen"). */
export const BALL_AT = 3.0;

const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const HANDOVER = 0.6;

/**
 * Share of the play run at scene second `t`: steady, then easing to rest by the hand-over, so the
 * next scene (which starts slow) picks up the same moment without the dots doubling.
 */
export const playShare = (t: number, dur: number): number => {
  const D = Math.max(0.1, dur - HANDOVER);
  const u = clamp01(t / D);
  const c = 0.6;
  const a = 2 / (1 + c);
  if (u <= c) return a * u;
  const v = u - c;
  return Math.min(1, a * c + a * v - (a * v * v) / (2 * (1 - c)));
};

const idx = (m: StoryMode) => STORY_MODES.indexOf(m);

export function frameState(p: StoryProps, time: number, beats: number[], dur: number, data: PlayData) {
  const t = sceneTime(time, dur);
  const d = Number.isFinite(dur) && dur > 0 ? dur : 1;
  const m = idx(p.mode);
  const b0 = beatAt(beats, 0);
  const b1 = beats[1] !== undefined && Number.isFinite(beats[1]) ? beats[1] : b0 + 1.4;
  const playT = lerp(p.play[0], p.play[1], playShare(t, d));
  const s = sample(data, playT);

  // Players fade to grey outlines when the doubt sets in.
  const ghost = m >= 2 ? (p.mode === 'doubt' ? easeOutCubic(progress(t, fit(0.3, 0.8, d), 0.8)) : 1) : 0;
  const players = [...s.home, ...s.away].map((q, i) => ({ x: q.x, y: q.y, team: i < s.home.length ? 0 : 1 }));

  // The small "?" of part 1, on a spot no player crosses over the story's play.
  const qSpot: Pt = cachedSpot(data, [0, 4.4], { x: 70, y: 12 }, GUESSES.map((g) => ({ x: g.from.x, y: g.from.y, r: 4 })));
  const pulse = 0.5 + 0.5 * Math.sin(((Number.isFinite(time) ? time : 0) * 2 * Math.PI) / 1.1);
  let qOpacity = 0;
  if (p.mode === 'part1') qOpacity = 1;
  if (p.mode === 'middle') qOpacity = 1 - progress(t, fit(b0 + 0.2, 0.5, d), 0.5);

  // The TV frame, its centre crosshair, the guesses drifting onto it.
  let frameDraw = 0;
  let frameOpacity = 0;
  if (p.mode === 'middle') {
    frameDraw = easeOutCubic(progress(t, fit(b0 + 0.2, 0.7, d), 0.7));
    frameOpacity = frameDraw > 0 ? 1 : 0;
  }
  const fadeOut = p.mode === 'doubt' ? 1 - progress(t, fit(0.05, 0.45, d), 0.45) : 0;
  if (p.mode === 'doubt') {
    frameDraw = 1;
    frameOpacity = fadeOut;
  }
  const crosshair = p.mode === 'middle' ? progress(t, fit(b0 + 0.8, 0.4, d), 0.4) : p.mode === 'doubt' ? fadeOut : 0;

  const ballAt = fit(b0 + BALL_AT, 1.4, d);
  const guesses = GUESSES.map((g, i) => {
    let appear = 0;
    let drift = 0;
    if (p.mode === 'middle') {
      appear = progress(t, fit(b0 + 0.9 + i * 0.2, 0.4, d), 0.4);
      drift = easeOutCubic(progress(t, fit(b0 + 1.4 + i * 0.15, 1.2, d), 1.2));
    }
    if (p.mode === 'doubt') {
      appear = fadeOut;
      drift = 1;
    }
    return { label: g.label, x: lerp(g.from.x, g.to.x, drift), y: lerp(g.from.y, g.to.y, drift), opacity: appear };
  });

  // The real ball, flashed in at the frame's edge once the guesses have settled.
  let ballOpacity = 0;
  let glow = 0;
  let miss = 0;
  if (p.mode === 'middle') {
    ballOpacity = progress(t, ballAt, 0.25);
    glow = ballOpacity * (1 - 0.6 * progress(t, ballAt + 0.4, 1.0));
    miss = easeOutCubic(progress(t, ballAt + 0.35, 0.6));
  }
  if (p.mode === 'doubt') {
    ballOpacity = fadeOut;
    miss = fadeOut;
    glow = 0.4 * fadeOut;
  }

  // The big "?" of the doubt, and the box it turns into.
  let bigQ = 0;
  let tag = 0;
  let box = 0;
  let tick = 0;
  if (p.mode === 'doubt') {
    bigQ = easeOutCubic(progress(t, fit(b0 + 0.25, 0.6, d), 0.6));
    tag = progress(t, fit(b1, 0.4, d), 0.4);
  }
  if (p.mode === 'test') {
    bigQ = 1;
    tag = 1;
    box = easeOutCubic(progress(t, fit(b0 + 0.2, 0.5, d), 0.5));
    tick = easeOutCubic(progress(t, fit(b0 + 0.6, 0.5, d), 0.5));
  }

  // "Part 1" tag on the pitch while the story is part 1's; scene chip under the pitch.
  const partTag = p.mode === 'part1' ? progress(t, fit(0.2, 0.4, d), 0.4) : p.mode === 'middle' ? 1 : p.mode === 'doubt' ? fadeOut : 0;
  const chip = p.mode === 'part1' || p.mode === 'middle' ? progress(t, fit(0.2, 0.4, d), 0.4) * (1 - progress(t, d - 0.9, 0.3)) : 0;

  return {
    playT,
    players,
    ghost,
    ball: { x: s.ball.x, y: s.ball.y, opacity: ballOpacity, glow },
    question: { x: qSpot.x, y: qSpot.y, opacity: qOpacity, pulse },
    frame: { draw: frameDraw, opacity: frameOpacity },
    crosshair: { x: FRAME_CENTRE.x, y: FRAME_CENTRE.y, opacity: crosshair },
    guesses,
    miss,
    bigQ: { x: BIG_Q.x, y: BIG_Q.y, appear: bigQ, pulse, box, tick },
    tag: { opacity: tag },
    partTag: { opacity: partTag },
    chip: { opacity: chip },
  };
}
