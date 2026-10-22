// Pure state of the TeamChannel scenes (Part I): real traffic between agents in named teams.
// Two channels, "peer sessions · no roles" and "agent teams · names + a lead"; the delegation
// shares as two bars; then what the follow-through looked like: few silent drops, and "done"
// claims that do not survive a check. Figures exactly as the article writes them (factcheck.md).
// No Remotion or React here.
import { beatAt, easeOutCubic, fit, progress, sceneTime } from './steps.ts';

export type Mode = 'corpus' | 'bars' | 'shape';
export type TeamChannelProps = { mode: Mode; blend?: boolean };

export const CORPUS = { messages: 196, sub: '5 projects · coded twice' } as const;
export const SHARES = [
  { label: 'agent teams', value: 37.2, display: '37.2 %', accent: true },
  { label: 'peer channel', value: 8.9, display: '8.9 %', accent: false },
] as const;
/** Bar scale top, in percent: both shares drawn to the same scale. */
export const SHARE_MAX = 40;
export const SHAPE = {
  requests: '71 requests',
  tiles: [
    { value: '74–83 %', label: 'complied' },
    { value: '3 of 70', label: 'silent drops' },
  ],
  claim: ['≈ 1 in 4 or 5 “done” claims', 'don’t survive a check'],
  stamp: 'the failure changed shape',
} as const;

const pulse = (t: number, start: number, len: number) => {
  const p = progress(t, start, len);
  return p <= 0 || p >= 1 ? 0 : Math.sin(Math.PI * p);
};
const beat = (beats: number[], i: number, fallback: number) => (beats.length > i && Number.isFinite(beats[i]) ? beats[i] : fallback);
/** Position 0..1 of a pill looping along a pipe. */
const loop = (t: number, speed: number, offset: number) => {
  const v = (Math.max(0, t) * speed + offset) % 1;
  return Number.isFinite(v) ? v : offset;
};

export function frameState(p: TeamChannelProps, time: number, beats: number[], dur: number) {
  const t = sceneTime(time, dur);
  // Pills keep flowing on screen time, not on the "finished" scene time.
  const flow = Number.isFinite(time) ? Math.max(0, Math.min(time, Number.isFinite(dur) ? dur : time)) : 0;
  const P = (start: number, len: number) => progress(t, fit(start, len, dur), len);
  const E = (start: number, len: number) => easeOutCubic(P(start, len));
  const Pu = (start: number, len: number) => pulse(t, fit(start, len, dur), len);
  const b0 = beatAt(beats, 0);
  const b1 = beat(beats, 1, b0 + 3);

  if (p.mode === 'corpus') {
    return {
      view: 'corpus' as const,
      part: E(0, 0.35),
      peer: E(0.05, 0.4),
      teams: E(b0 + 0.15, 0.4),
      // Peer pills: plain reports. Team pills: about a third are requests ("?").
      peerPills: [0, 1, 2, 3].map((i) => ({ x: loop(flow, 0.16, i / 4), ask: i === 2 })),
      teamPills: [0, 1, 2, 3, 4, 5].map((i) => ({ x: loop(flow, 0.2, i / 6), ask: i % 3 === 0 })),
      counter: E(b0 + 0.9, 0.3),
      count: Math.round(CORPUS.messages * easeOutCubic(P(b0 + 0.95, 1.3))),
      sub: E(b0 + 2.6, 0.35),
    };
  }

  if (p.mode === 'bars') {
    return {
      view: 'bars' as const,
      title: E(0, 0.35),
      note: E(b0 + 0.3, 0.35),
      bars: SHARES.map((s, i) => ({ ...s, fill: s.value / SHARE_MAX, grow: P(i === 0 ? b0 + 1.6 : b1 + 0.25, 0.9) })),
    };
  }

  return {
    view: 'shape' as const,
    header: E(0, 0.35),
    tiles: SHAPE.tiles.map((tile, i) => ({ ...tile, pop: E(b0 + 0.05 + i * 0.4, 0.3) })),
    dropFlash: Pu(b0 + 0.9, 0.8),
    done: E(b1 + 0.1, 0.35),
    lens: P(b1 + 0.6, 0.85),
    crack: P(b1 + 1.45, 0.45),
    claim: E(b1 + 1.0, 0.35),
    stamp: E(b1 + 2.4, 0.3),
  };
}

export type TeamChannelState = ReturnType<typeof frameState>;
