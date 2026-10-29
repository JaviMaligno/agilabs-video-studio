import React from 'react';
import { Img, staticFile } from 'remotion';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { frameState, type PitchProps } from './PitchPlayback.state.ts';
import { BOX, type PlayData } from './pitch.ts';
import { Arrow, Ball, BoxGlyph, Marker, PitchFrame, Players, Tag, toPx } from './pieces.tsx';
import play from '../data/play.json';

export { frameState };
export type { PitchProps };

const DATA = play as unknown as PlayData;
export const CREDIT = 'Tracking data: Metrica Sports';

/** A grey crosshair (a frontier-AI guess), crossed out when `cross` > 0. */
const Crosshair: React.FC<{ cross: number }> = ({ cross }) => (
  <svg width={76} height={76} viewBox="-38 -38 76 76">
    <circle r={26} fill={alpha(C.muted, 0.14)} stroke={C.muted} strokeWidth={5} />
    {[
      [-36, 0, -14, 0],
      [14, 0, 36, 0],
      [0, -36, 0, -14],
      [0, 14, 0, 36],
    ].map(([a, b, c, d], i) => (
      <line key={i} x1={a} y1={b} x2={c} y2={d} stroke={C.muted} strokeWidth={5} />
    ))}
    {cross > 0 && (
      <g opacity={cross} stroke={C.text} strokeWidth={7} strokeLinecap="round">
        <line x1={-15} y1={-15} x2={15} y2={15} />
        <line x1={15} y1={-15} x2={-15} y2={15} />
      </g>
    )}
  </svg>
);

/** The real play with the overlays of scenes 2, 3 and 19 (see PitchPlayback.state.ts). */
export const PitchPlayback: React.FC<AnimProps & PitchProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur, DATA);
  const box = p.mode === 'verdict' ? BOX.half : BOX.full;
  const px = toPx(s.view, box);
  const m = s.marker;

  const svg = (
    <>
      {/* Trails: where each player was a moment ago. */}
      {s.trail > 0 &&
        s.players.map((q, i) => (
          <line key={`t${i}`} x1={q.tx} y1={q.ty} x2={q.x} y2={q.y} stroke={q.team === 0 ? C.accentText : C.text} strokeWidth={1.1} strokeLinecap="round" opacity={0.35 * s.trail} />
        ))}
      {/* Rays: every player pulled into one weighted point. */}
      {m.opacity > 0 &&
        s.players.map((q, i) => (
          <line key={`r${i}`} x1={q.x} y1={q.y} x2={m.x} y2={m.y} stroke={C.accentText} strokeWidth={0.18 + 0.25 * q.bright} opacity={m.converge * (1 - m.land) * (0.25 + 0.5 * q.bright)} />
        ))}
      {s.arrows.opacity > 0 && s.players.map((q, i) => <Arrow key={`a${i}`} x0={q.x} y0={q.y} x1={q.ax} y1={q.ay} opacity={0.3 + 0.7 * q.bright} w={0.45 + 0.35 * q.bright} />)}
      <Players players={s.players.map((q) => ({ ...q, opacity: s.arrows.opacity > 0 ? 0.55 + 0.45 * q.bright : 0.95 }))} />
      <Ball x={s.ball.x} y={s.ball.y} opacity={s.ball.opacity} glow={s.ball.glow} />
      <Marker x={m.x} y={m.y} opacity={m.opacity} />
    </>
  );

  const html = (
    <>
      {s.guesses.map((g, i) => {
        if (g.drop <= 0) return null;
        const q = px(g);
        return (
          <div key={i} style={{ position: 'absolute', left: q.x, top: q.y, transform: `translate(-50%, -50%) translateY(${(1 - g.drop) * -90}px)`, opacity: g.opacity }}>
            <Crosshair cross={g.cross} />
          </div>
        );
      })}
      {s.guessTag > 0 && (
        // The frontier models, drawn (public/cast/robot-graphite.png, grey like their crosshairs) on top of the
        // tag, over open grass: beside it, the robot would cover a player.
        <div style={{ position: 'absolute', left: px(s.guesses[2]).x - 40, top: px(s.guesses[2]).y - 150 - 108, opacity: s.guessTag, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <Img src={staticFile('cast/robot-graphite.png')} style={{ width: 104, height: 104, objectFit: 'contain' }} />
          <Tag text="frontier AI" opacity={1} size={40} />
        </div>
      )}
      {s.net.opacity > 0 && (
        <div style={{ position: 'absolute', left: px(s.net).x, top: px(s.net).y, transform: 'translate(-50%, -50%)', opacity: s.net.opacity }}>
          <svg width={130} height={130} viewBox="-65 -65 130 130" style={{ overflow: 'visible', filter: `drop-shadow(0 0 14px ${C.accent})` }}>
            <circle r={31} fill="none" stroke={C.accentText} strokeWidth={8} />
            {[
              [-56, 0, -20, 0],
              [20, 0, 56, 0],
              [0, -56, 0, -20],
              [0, 20, 0, 56],
            ].map(([a, b, c, d], i) => (
              <line key={i} x1={a} y1={b} x2={c} y2={d} stroke={C.accentText} strokeWidth={8} strokeLinecap="round" />
            ))}
          </svg>
        </div>
      )}
    </>
  );

  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily, color: C.text }}>
      <PitchFrame box={box} view={s.view} credit={CREDIT} svg={svg} html={html} />

      {/* The 60 kB box, sliding in above the pitch (net). */}
      {s.box.appear > 0 && (
        <div style={{ position: 'absolute', left: 70 + s.box.x, top: 262, opacity: s.box.appear, display: 'flex', alignItems: 'center', gap: 28 }}>
          <BoxGlyph w={210} face={1} glow={0.4 + 0.6 * s.net.snap} />
          <div style={{ fontSize: 44, fontWeight: 700, color: C.text, opacity: s.box.appear, lineHeight: 1.2 }}>
            a tiny 60 kB network
          </div>
        </div>
      )}

      {/* The verdict: the box opened flat, with just the marker inside. */}
      {p.mode === 'verdict' && s.lid > 0 && (
        <div style={{ position: 'absolute', left: 80, top: 1094, display: 'flex', alignItems: 'center', gap: 44, opacity: Math.min(1, s.lid * 1.5) }}>
          <BoxGlyph
            w={250}
            lid={s.lid}
            glow={0.8}
            inside={
              <svg width={110} height={110} viewBox="-55 -55 110 110" style={{ marginTop: 40 }}>
                <circle r={50} fill={alpha(C.accent, 0.25)} />
                <circle r={22} fill={C.accent} stroke={C.text} strokeWidth={5} />
              </svg>
            }
          />
          <div style={{ fontSize: 50, fontWeight: 800, lineHeight: 1.15, opacity: s.inside }}>
            Inside:
            <div style={{ color: C.accentText }}>one weighted average</div>
          </div>
        </div>
      )}

      {p.chip && s.chip.opacity > 0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: box.top + box.h + 18, display: 'flex', justifyContent: 'center' }}>
          <Tag text={p.chip} opacity={s.chip.opacity} accent size={42} />
        </div>
      )}
    </div>
  );
};
