import React from 'react';
import { C, GRADIENT, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { FRAME, frameState, type StoryProps } from './StoryPitch.state.ts';
import { Q_SIZE, VIEW, type PlayData } from './pitch.ts';
import { Chip, GuessMarker, Markings, QMark, Tick } from './pitchParts.tsx';
import { stageOf } from './Stage.tsx';
import play from '../data/play.json';

export { frameState };
export type { StoryProps };

const DATA = play as unknown as PlayData;
/** Vertical cut: the pitch runs wider than the stage (to 40 px from the edges). */
const VERTICAL_SIDE = 40;
/** Room under the pitch for the scene chip: gap + chip height. */
const CHIP_ROOM = 24 + 86;

const CHIPS: Partial<Record<StoryProps['mode'], string>> = { part1: 'The ball: erased', middle: 'Frontier AI: the middle' };

/** Story scenes: part 1's real Metrica sequence, ball hidden, and the doubt this video tests. */
export const StoryPitch: React.FC<AnimProps & StoryProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur, DATA);
  const stage = stageOf(p.vertical);
  const vw = VIEW.x1 - VIEW.x0;
  const vh = VIEW.y1 - VIEW.y0;
  const maxW = p.vertical ? 1080 - 2 * VERTICAL_SIDE : stage.w;
  const scale = Math.min(maxW / vw, (stage.h - CHIP_ROOM) / vh);
  const W = vw * scale;
  const H = vh * scale;
  const left = p.vertical ? (1080 - W) / 2 : stage.side + (stage.w - W) / 2;
  const top = stage.top + Math.max(0, (stage.h - H - CHIP_ROOM) / 2);
  const px = (x: number) => (x - VIEW.x0) * scale;
  const py = (y: number) => (y - VIEW.y0) * scale;
  const fr = { x: px(FRAME.x), y: py(FRAME.y), w: FRAME.w * scale, h: FRAME.h * scale };
  const per = 2 * (fr.w + fr.h);
  const bigSize = 30 * scale;
  const chip = CHIPS[p.mode];

  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily, color: C.text }}>
      <div
        style={{
          position: 'absolute',
          left,
          top,
          width: W,
          height: H,
          borderRadius: 18,
          overflow: 'hidden',
          background: C.bg1,
          boxShadow: `0 0 0 2px ${alpha(C.muted, 0.18)}, 0 30px 80px ${alpha(C.accent, 0.12)}`,
        }}
      >
        <svg width={W} height={H} viewBox={`${VIEW.x0} ${VIEW.y0} ${vw} ${vh}`} style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <radialGradient id="spBallGlow">
              <stop offset="0%" stopColor={C.accent2} stopOpacity={0.9} />
              <stop offset="100%" stopColor={C.accent2} stopOpacity={0} />
            </radialGradient>
          </defs>
          <Markings sw={0.32} />
          {s.players.map((q, i) => (
            <circle
              key={i}
              cx={q.x}
              cy={q.y}
              r={1.55}
              fill={q.team === 0 ? C.accentText : C.text}
              fillOpacity={0.95 * (1 - s.ghost)}
              stroke={s.ghost > 0 ? alpha(C.muted, 0.35 + 0.5 * s.ghost) : C.bg0}
              strokeWidth={0.3 + 0.12 * s.ghost}
            />
          ))}
          {/* How far each guess missed: dashed lines from the guess to the real ball. */}
          {s.miss > 0 &&
            s.guesses.map((g, i) => (
              <line
                key={`m${i}`}
                x1={g.x}
                y1={g.y}
                x2={g.x + (s.ball.x - g.x) * s.miss}
                y2={g.y + (s.ball.y - g.y) * s.miss}
                stroke={C.text}
                strokeWidth={0.35}
                strokeDasharray="1.2 0.9"
                strokeLinecap="round"
                opacity={0.75 * Math.min(s.miss, s.ball.opacity)}
              />
            ))}
          {s.ball.opacity > 0 && (
            <g opacity={s.ball.opacity}>
              <circle cx={s.ball.x} cy={s.ball.y} r={2 + 9 * s.ball.glow} fill="url(#spBallGlow)" opacity={0.4 + 0.6 * s.ball.glow} />
              <circle cx={s.ball.x} cy={s.ball.y} r={2.3} fill="none" stroke={alpha(C.accentText, 0.7)} strokeWidth={0.25} />
              <circle cx={s.ball.x} cy={s.ball.y} r={1.0} fill="#ffffff" />
            </g>
          )}
        </svg>

        {/* The TV frame: a rounded rectangle drawn around the action, broadcast corners. */}
        {s.frame.opacity > 0 && (
          <svg width={W} height={H} style={{ position: 'absolute', inset: 0, opacity: s.frame.opacity, overflow: 'visible' }}>
            <rect x={fr.x} y={fr.y} width={fr.w} height={fr.h} rx={22} fill={alpha(C.text, 0.04)} stroke={C.text} strokeWidth={5} strokeDasharray={`${per * s.frame.draw} ${per}`} />
          </svg>
        )}
        {s.frame.opacity > 0 && (
          <div
            style={{
              position: 'absolute',
              left: fr.x + 18,
              top: fr.y - 58,
              opacity: s.frame.opacity * s.frame.draw,
              padding: '4px 16px',
              borderRadius: 10,
              background: C.text,
              color: C.bg0,
              fontSize: 32,
              fontWeight: 800,
            }}
          >
            TV frame
          </div>
        )}

        {/* "The middle": crosshair at the frame's centre. */}
        {s.crosshair.opacity > 0 && (
          <div style={{ position: 'absolute', left: px(s.crosshair.x), top: py(s.crosshair.y), transform: 'translate(-50%, -50%)', opacity: s.crosshair.opacity }}>
            <svg width={150} height={150} viewBox="-75 -75 150 150">
              <circle r={44} fill="none" stroke={alpha(C.accentText, 0.9)} strokeWidth={4} strokeDasharray="10 8" />
              <line x1={-72} y1={0} x2={72} y2={0} stroke={alpha(C.accentText, 0.6)} strokeWidth={3} />
              <line x1={0} y1={-72} x2={0} y2={72} stroke={alpha(C.accentText, 0.6)} strokeWidth={3} />
            </svg>
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: 150,
                transform: 'translateX(-50%)',
                padding: '4px 16px',
                borderRadius: 12,
                background: alpha(C.bg0, 0.9),
                border: `2px solid ${alpha(C.accentText, 0.6)}`,
                fontSize: 34,
                fontWeight: 700,
                color: C.accentText,
                whiteSpace: 'nowrap',
              }}
            >
              the middle
            </div>
          </div>
        )}

        {s.guesses.map((g, i) => (
          <GuessMarker key={g.label} x={px(g.x)} y={py(g.y)} label={g.label} bot={g.bot} opacity={g.opacity} labelSide={i === 0 ? 'left' : 'right'} size={64} />
        ))}

        <QMark x={px(s.question.x)} y={py(s.question.y)} size={Q_SIZE * scale} pulse={s.question.pulse} opacity={s.question.opacity} />

        {/* The doubt: a big "?", which becomes a ticked box. */}
        {s.bigQ.appear > 0 && (
          <div
            style={{
              position: 'absolute',
              left: px(s.bigQ.x),
              top: py(s.bigQ.y) - 95,
              transform: `translate(-50%, -50%) scale(${0.6 + 0.4 * s.bigQ.appear})`,
              opacity: s.bigQ.appear,
              width: bigSize,
              height: bigSize,
            }}
          >
            <div style={{ position: 'absolute', inset: 0, opacity: 1 - s.bigQ.box }}>
              <QMark x={bigSize / 2} y={bigSize / 2} size={bigSize} pulse={s.bigQ.pulse} opacity={1} />
            </div>
            {s.bigQ.box > 0 && (
              <div
                style={{
                  position: 'absolute',
                  inset: bigSize * 0.12,
                  opacity: s.bigQ.box,
                  transform: `scale(${0.8 + 0.2 * s.bigQ.box})`,
                  borderRadius: 40,
                  background: alpha(C.bg0, 0.85),
                  border: `10px solid ${C.accentText}`,
                  boxShadow: `0 0 60px ${alpha(C.accent, 0.6)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Tick size={bigSize * 0.55} draw={s.bigQ.tick} color={C.accentText} stroke={3.6} />
              </div>
            )}
          </div>
        )}
        {s.tag.opacity > 0 && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: py(s.bigQ.y) - 95 + bigSize / 2 + 50,
              display: 'flex',
              justifyContent: 'center',
              opacity: s.tag.opacity,
            }}
          >
            <div style={{ padding: '12px 30px', borderRadius: 16, background: alpha(C.bg0, 0.88), border: `2px solid ${alpha(C.accentText, 0.55)}`, fontSize: 50, fontWeight: 800 }}>
              enough information?
            </div>
          </div>
        )}

        {/* "Part 1" tag, top left. */}
        {s.partTag.opacity > 0 && (
          <div
            style={{
              position: 'absolute',
              left: 20,
              top: 20,
              opacity: s.partTag.opacity,
              padding: '6px 20px',
              borderRadius: 12,
              background: GRADIENT,
              fontSize: 36,
              fontWeight: 800,
              color: C.text,
            }}
          >
            Part 1
          </div>
        )}
        <div style={{ position: 'absolute', right: 14, bottom: 10, fontSize: 22, fontWeight: 500, color: alpha(C.muted, 0.75) }}>Tracking data: Metrica Sports</div>
      </div>

      {chip && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: top + H + 24, display: 'flex', justifyContent: 'center' }}>
          <Chip text={chip} opacity={s.chip.opacity} />
        </div>
      )}
    </div>
  );
};
