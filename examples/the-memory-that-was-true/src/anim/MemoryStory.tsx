// MemoryStory: where the video comes from. A coding-agent session on my blog writes a note into
// the agent's memory; an article draft needs scheduling, the scheduling note comes out of the stack,
// and a cursor heads for "create workflow" and stops just short. State in MemoryStory.state.ts.
import React from 'react';
import { C, GRADIENT, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import { Stage } from './Stage.tsx';
import type { AnimProps } from './types.ts';
import { MONO, NEUTRAL, Pill, Pin, clamp01, edgeColour, noteSurface } from './pieces.tsx';
import { frameState, type MemoryStoryProps } from './MemoryStory.state.ts';

/** Boxes in stage space (960 x 1090). */
const SESSION = { x: 60, y: 20, w: 840, h: 300 };
const STACK = { x: 60, y: 372, w: 400 };
const MINI = { w: 340, h: 170 };
const ARTICLE = { x: 500, y: 372, w: 400, h: 300 };
const BIG = { x: 110, y: 700, w: 740, h: 252 };
const BUTTON = { x: 150, y: 978, w: 520, h: 96 };

const lerp = (a: number, b: number, p: number) => a + (b - a) * clamp01(p);

/** A short line of "text" on a card: a rounded bar. */
const Bar: React.FC<{ w: number; color?: string; style?: React.CSSProperties }> = ({ w, color = alpha(C.muted, 0.35), style }) => (
  <div style={{ width: w, height: 16, borderRadius: 8, background: color, ...style }} />
);

/** A small note in the memory stack. */
const MiniNote: React.FC<{ x: number; y: number; opacity: number; lines?: number[] }> = ({ x, y, opacity, lines = [220, 260, 170] }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: MINI.w, height: MINI.h, opacity, ...noteSurface(NEUTRAL, 4), padding: '40px 26px 0', boxSizing: 'border-box' }}>
    {lines.map((w, i) => (
      <Bar key={i} w={w} style={{ marginBottom: 18 }} />
    ))}
  </div>
);

/** The agent: a round face in the accent gradient. */
const Agent: React.FC<{ size: number }> = ({ size }) => (
  <div style={{ width: size, height: size, borderRadius: '50%', background: GRADIENT, position: 'relative', flex: 'none', boxShadow: `0 0 30px ${alpha(C.accent, 0.45)}` }}>
    <div style={{ position: 'absolute', left: size * 0.28, top: size * 0.36, width: size * 0.13, height: size * 0.2, borderRadius: size, background: C.text }} />
    <div style={{ position: 'absolute', right: size * 0.28, top: size * 0.36, width: size * 0.13, height: size * 0.2, borderRadius: size, background: C.text }} />
  </div>
);

const Cursor: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block', overflow: 'visible' }}>
    <path d="M3 2 L3 19 L8 14.5 L11.5 22 L14.5 20.6 L11 13.2 L17.5 13.2 Z" fill={C.text} stroke={C.bg0} strokeWidth={1.4} strokeLinejoin="round" />
  </svg>
);

export const MemoryStory: React.FC<AnimProps & MemoryStoryProps> = ({ t, beats, dur, vertical, ...props }) => {
  const s = frameState(props, t, beats, dur);
  const back = 1 - 0.5 * s.act.dim;
  const typedBars = [
    { w: 420, right: true },
    { w: 560, right: false },
    { w: 300, right: true },
    { w: 500, right: false },
  ];
  // The note flying from the session into the stack.
  const fly = s.stack.fly;
  const flyX = lerp(SESSION.x + SESSION.w / 2 - 110, STACK.x + 24, fly);
  const flyY = lerp(SESSION.y + SESSION.h - 130, STACK.y + 92, fly);
  const flyScale = lerp(0.6, 1, fly);
  // The scheduling note pulled out of the stack to full size.
  const p = s.pull.draw;
  const pullScale = lerp(MINI.w / BIG.w, 1, p);
  const pullX = lerp(STACK.x + 24, BIG.x, p);
  const pullY = lerp(STACK.y + 92, BIG.y, p);
  // The cursor heads for the button and stops just short of it.
  const cx = lerp(930, BUTTON.x + BUTTON.w + 24, s.act.travel);
  const cy = lerp(820, BUTTON.y + 8, s.act.travel);

  return (
    <Stage vertical={vertical} fill>
      {/* the coding-agent session on my blog */}
      <div
        style={{
          position: 'absolute',
          left: SESSION.x,
          top: SESSION.y + (1 - s.session.appear) * 40,
          width: SESSION.w,
          height: SESSION.h,
          opacity: s.session.appear * back,
          borderRadius: 20,
          background: C.pane,
          border: `3px solid ${C.line}`,
          overflow: 'hidden',
          fontFamily,
        }}
      >
        <div style={{ height: 58, display: 'flex', alignItems: 'center', gap: 12, padding: '0 24px', background: alpha(C.card, 0.9), borderBottom: `2px solid ${C.line}` }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ width: 14, height: 14, borderRadius: 7, background: alpha(C.muted, 0.4) }} />
          ))}
          <div style={{ marginLeft: 14, fontSize: 28, fontWeight: 600, color: C.muted, letterSpacing: 0.5 }}>coding agent · my blog</div>
        </div>
        <div style={{ position: 'absolute', left: 28, top: 86 }}>
          <Agent size={70} />
        </div>
        <div style={{ position: 'absolute', left: 124, right: 30, top: 84 }}>
          {typedBars.map((b, i) => {
            const on = clamp01(s.session.typed * typedBars.length - i);
            return (
              <div key={i} style={{ display: 'flex', justifyContent: b.right ? 'flex-end' : 'flex-start', marginBottom: 22, opacity: on }}>
                <Bar w={b.w * (0.3 + 0.7 * on)} color={b.right ? alpha(C.accentText, 0.45) : alpha(C.muted, 0.35)} style={{ height: 20, borderRadius: 10 }} />
              </div>
            );
          })}
        </div>
      </div>
      {s.session.ends > 0 && (
        <div style={{ position: 'absolute', right: 960 - SESSION.x - SESSION.w + 26, top: SESSION.y + SESSION.h - 34, opacity: clamp01(s.session.ends * 1.6) * back, transform: `scale(${1.3 - 0.3 * clamp01(s.session.ends)})`, transformOrigin: 'right center' }}>
          <Pill color={C.muted} size={28} filled>
            session ends → note
          </Pill>
        </div>
      )}

      {/* the agent's memory: a stack of notes about my blog */}
      <div style={{ position: 'absolute', left: STACK.x, top: STACK.y, width: STACK.w, opacity: s.stack.appear * back, fontFamily }}>
        <div style={{ fontSize: 32, fontWeight: 700, color: C.text }}>its memory</div>
        <div style={{ fontSize: 24, fontWeight: 500, color: C.muted, marginTop: 2 }}>notes it keeps on my blog</div>
      </div>
      <MiniNote x={STACK.x + 48} y={STACK.y + 116} opacity={s.stack.appear * back * 0.7} lines={[200, 240, 150]} />
      <MiniNote x={STACK.x + 36} y={STACK.y + 104} opacity={s.stack.appear * back * 0.85} lines={[250, 180, 210]} />
      {/* the note this session writes, landing on top (it hides the scheduling note until pulled) */}
      {fly > 0 && (
        <div style={{ position: 'absolute', left: 0, top: 0, transform: `translate(${flyX}px, ${flyY}px) scale(${flyScale})`, transformOrigin: 'top left', opacity: clamp01(fly * 3) * back * (1 - 0.6 * clamp01(p * 2)) }}>
          <MiniNote x={0} y={0} opacity={1} lines={[230, 200, 260]} />
        </div>
      )}

      {/* the article draft that needs scheduling */}
      <div
        style={{
          position: 'absolute',
          left: ARTICLE.x + (1 - s.article.appear) * 60,
          top: ARTICLE.y,
          width: ARTICLE.w,
          height: ARTICLE.h,
          opacity: s.article.appear * back,
          borderRadius: 20,
          background: C.card,
          border: `3px solid ${alpha(C.accentText, 0.7)}`,
          padding: '28px 30px 0',
          boxSizing: 'border-box',
          fontFamily,
        }}
      >
        <Pill color={C.accentText} size={26} filled>
          new article · draft
        </Pill>
        <div style={{ fontSize: 40, fontWeight: 800, color: C.text, marginTop: 22 }}>Article title</div>
        <Bar w={300} style={{ marginTop: 18 }} />
        <Bar w={240} style={{ marginTop: 14 }} />
        {s.article.ask > 0 && (
          <div style={{ position: 'absolute', left: 30, bottom: 26, opacity: clamp01(s.article.ask * 1.6), transform: `scale(${1.3 - 0.3 * clamp01(s.article.ask)})`, transformOrigin: 'left center' }}>
            <Pill color={C.text} size={28}>
              how do I schedule it?
            </Pill>
          </div>
        )}
      </div>

      {/* the scheduling note, pulled out of the memory: the same memory as the hook */}
      {s.pull.opacity > 0 && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: BIG.w,
            height: BIG.h,
            transform: `translate(${pullX}px, ${pullY}px) scale(${pullScale})`,
            transformOrigin: 'top left',
            opacity: s.pull.opacity,
            ...noteSurface(edgeColour(0), 6, 0.6 * p),
            padding: '38px 44px 0',
            boxSizing: 'border-box',
            fontFamily,
          }}
        >
          <div style={{ fontSize: 36, fontWeight: 500, color: C.muted }}>To schedule an article:</div>
          <div style={{ position: 'relative', display: 'inline-block', marginTop: 12, fontSize: 50, fontWeight: 800, color: C.text, whiteSpace: 'nowrap' }}>
            one workflow per article.
            <div style={{ position: 'absolute', left: 0, bottom: -6, height: 7, borderRadius: 4, width: `${100 * clamp01(s.pull.underline)}%`, background: C.ok }} />
          </div>
          <div style={{ position: 'absolute', right: 30, bottom: 18 }}>
            <Pill color={C.muted} size={28}>
              written · July
            </Pill>
          </div>
        </div>
      )}
      {p >= 1 && <Pin x={BIG.x + BIG.w / 2} y={BIG.y + 4} s={1.3} on={1} />}

      {/* I very nearly acted on it */}
      {s.act.appear > 0 && (
        <div
          style={{
            position: 'absolute',
            left: BUTTON.x,
            top: BUTTON.y + (1 - s.act.appear) * 30,
            width: BUTTON.w,
            height: BUTTON.h,
            opacity: s.act.appear,
            borderRadius: 22,
            background: alpha(C.accent, 0.16 + 0.14 * clamp01(s.act.travel)),
            border: `3px solid ${C.accentText}`,
            boxShadow: `0 0 ${36 * clamp01(s.act.travel)}px ${alpha(C.accent, 0.5)}`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 6,
            fontFamily,
          }}
        >
          <div style={{ fontSize: 36, fontWeight: 800, color: C.text }}>+ create the workflow</div>
          <div style={{ fontFamily: MONO, fontSize: 22, color: C.muted }}>scheduled-publish-new-article.yml</div>
        </div>
      )}
      {s.act.appear > 0 && (
        <div style={{ position: 'absolute', left: cx, top: cy, opacity: s.act.appear }}>
          <Cursor size={64} />
        </div>
      )}
      {s.act.almost > 0 && (
        <div style={{ position: 'absolute', right: 6, top: BUTTON.y + 34, opacity: clamp01(s.act.almost * 1.6), transform: `rotate(-4deg) scale(${1.4 - 0.4 * clamp01(s.act.almost)})`, transformOrigin: 'right center' }}>
          <Pill color={C.flag} size={28} filled>
            very nearly
          </Pill>
        </div>
      )}
    </Stage>
  );
};
