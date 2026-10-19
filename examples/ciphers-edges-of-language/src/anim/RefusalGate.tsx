import React from 'react';
import { C, GRADIENT, alpha } from '../brand.ts';
import type { AnimProps } from './types.ts';
import { frameState, MODELS, type GateProps } from './RefusalGate.state.ts';
import { Stage, gradientText, stageOf } from './Stage.tsx';
import { Card, Chip, CHIP, chipCx, chipX, GlyphLine, Pill, Wall } from './pieces.tsx';
import { clip, type CipherData } from './glyphs.ts';
import ciphers from '../data/ciphers.json';

export { frameState };
export type { GateProps };

const DATA = ciphers as unknown as CipherData;
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

/** Stage y of things (stage is 960 x ~1090). */
const Y = { cardTop: 236, cardH: 132, chipTop: 836, wallMax: 430 };

export const RefusalGate: React.FC<AnimProps & GateProps> = ({ t, beats, dur, vertical, ...props }) => {
  const s = frameState(props, t, beats, dur, DATA);
  const { w: W } = stageOf(vertical);
  const pair = { x: chipX(0) - 4, w: chipX(1) + CHIP.w + 8 - chipX(0), cx: (chipCx(0) + chipCx(1)) / 2 };
  const wallBottom = Y.chipTop - 14;
  const wallH = Y.wallMax * s.wall.level * s.wall.appear;
  const wallTop = wallBottom - wallH;
  const cardW = 900;
  const cardCy = Y.cardTop + Y.cardH / 2;
  const gpt = chipCx(2);
  const gate = { w: 196, top: 610, h: 64 };

  const long = !s.card.glyphs;
  const text = long ? clip(s.card.text, 27) : s.card.text;
  // Legibility gradient: the right part of the text sinks into noise as the slider moves.
  const keep = 100 - 85 * s.card.fade;
  const mask = s.card.fade > 0 ? `linear-gradient(90deg, #000 ${Math.max(0, keep - 30)}%, rgba(0,0,0,${1 - 0.88 * s.card.fade}) ${keep}%)` : undefined;

  return (
    <Stage vertical={vertical} fill>
      {/* ---- head zone, one per phase ---- */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: W, textAlign: 'center', opacity: s.head.wall }}>
        <div style={{ fontSize: 150, fontWeight: 800, lineHeight: 1, ...gradientText, transform: `scale(${0.7 + 0.3 * s.figure.pop})`, opacity: s.figure.pop }}>~87%</div>
        <div style={{ fontSize: 38, fontWeight: 600, color: C.muted, marginTop: 8 }}>of encoded turns refused</div>
      </div>
      <div style={{ position: 'absolute', top: 40, left: 0, width: W, textAlign: 'center', opacity: s.head.plain, fontSize: 80, fontWeight: 800, letterSpacing: '-0.02em' }}>
        In plain English
      </div>
      <div style={{ position: 'absolute', top: 6, left: 0, width: W, opacity: s.head.legibility }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 38, fontWeight: 700, padding: '0 6px' }}>
          <span>looks like words</span>
          <span style={{ color: C.muted }}>looks like noise</span>
        </div>
        <div style={{ position: 'relative', marginTop: 22, height: 26, borderRadius: 13, background: `linear-gradient(90deg, ${C.text}, ${alpha(C.accent2, 0.9)} 55%, ${alpha(C.muted, 0.15)})` }}>
          <div
            style={{
              position: 'absolute',
              top: -14,
              left: `calc(${s.noise.slider * 100}% - 27px)`,
              width: 54,
              height: 54,
              borderRadius: 27,
              background: C.text,
              boxShadow: `0 0 30px ${alpha(C.accent, 0.8)}`,
              border: `6px solid ${C.accent}`,
            }}
          />
        </div>
      </div>
      <div style={{ position: 'absolute', top: 24, left: 0, width: W, textAlign: 'center', opacity: s.head.filter }}>
        <div style={{ fontSize: 66, fontWeight: 800, letterSpacing: '-0.02em' }}>Azure content filter</div>
        <div style={{ fontSize: 38, fontWeight: 600, color: C.muted, marginTop: 10 }}>GPT-5 · ciphered prompts</div>
      </div>

      {/* ---- the message card ---- */}
      <div style={{ position: 'absolute', left: (W - cardW) / 2, top: Y.cardTop, opacity: s.phase === 1 && s.pass.fly > 0 ? 0 : s.phase === 3 && s.filter.fly > 0 ? 0 : s.card.opacity }}>
        <Card w={cardW} h={Y.cardH}>
          <div style={{ WebkitMaskImage: mask, maskImage: mask }}>
            {long ? (
              <div style={{ fontSize: 46, fontWeight: 600, whiteSpace: 'nowrap' }}>{text}</div>
            ) : (
              <GlyphLine glyphs={s.card.glyphs!} size={52} />
            )}
          </div>
        </Card>
      </div>

      {/* ---- wall on the Claude chips ---- */}
      <Wall x={pair.x} bottom={wallBottom} w={pair.w} height={wallH} flash={s.wall.flash} opacity={s.wall.opacity} />
      {/* legibility labels at the wall's top edge */}
      <div style={{ position: 'absolute', left: pair.x + pair.w + 24, top: wallTop - 28, opacity: s.noise.opacity, whiteSpace: 'nowrap' }}>
        <div style={{ opacity: s.noise.low, fontSize: 46, fontWeight: 800, color: C.text }}>
          ~⅓ <span style={{ fontSize: 34, fontWeight: 600, color: C.muted }}>refused</span>
        </div>
        <div style={{ position: 'absolute', top: 0, opacity: s.noise.high, fontSize: 46, fontWeight: 800, ...gradientText }}>close to 100%</div>
      </div>

      {/* ---- phase 0: masked cards bounce off ---- */}
      {s.stream.map((c, k) => {
        if (c.opacity <= 0) return null;
        // Aim inside the wall and bounce up and to the right, so no card leaves the frame.
        const tx = pair.cx + (c.target ? 50 : -10);
        const x = lerp(W / 2, tx, c.fly) + (c.target ? 200 : 70) * c.bounce;
        // Launch from just below the main card, so the stream never covers its masked text.
        const y = lerp(Y.cardTop + Y.cardH + 70, wallTop - 40, c.fly) - 260 * c.bounce + 200 * c.bounce * c.bounce;
        return (
          <div key={k} style={{ position: 'absolute', left: x - 170, top: y - 40, opacity: c.opacity, transform: `rotate(${(c.target ? 40 : 25) * c.bounce}deg) scale(${lerp(0.9, 0.7, c.fly)})` }}>
            <Card w={340} h={80} style={{ borderRadius: 18 }}>
              <span style={{ fontSize: 30, fontWeight: 600 }}>{DATA.ciphers.random_substitution.split(' ').slice(0, 3).join(' ')}</span>
            </Card>
          </div>
        );
      })}

      {/* ---- phase 1: the plain card goes through ---- */}
      {s.pass.opacity > 0 && (
        <div
          style={{
            position: 'absolute',
            left: lerp(W / 2, pair.cx, s.pass.fly) - 280,
            top: lerp(cardCy, Y.chipTop - 20, s.pass.fly) - 40,
            opacity: s.pass.opacity,
            // Starts at the main card's size (it IS the main card, taking off), shrinks into the wall.
            transform: `scale(${lerp(1.6, 0.6, s.pass.fly)})`,
          }}
        >
          <Card w={560} h={82} glow={0.6} style={{ borderRadius: 18 }}>
            <span style={{ fontSize: 30, fontWeight: 600 }}>{DATA.plain}</span>
          </Card>
        </div>
      )}

      {/* ---- phase 3: the filter gate in front of GPT-5 ---- */}
      {s.filter.gate > 0 && (
        <div style={{ position: 'absolute', left: gpt - gate.w / 2, top: gate.top + (1 - s.filter.gate) * 60, width: gate.w, opacity: s.filter.gate }}>
          <div style={{ position: 'absolute', left: 6, top: gate.h - 4, width: 12, height: Y.chipTop - gate.top - gate.h - 30, background: alpha(C.muted, 0.6), borderRadius: 4 }} />
          <div style={{ position: 'absolute', right: 6, top: gate.h - 4, width: 12, height: Y.chipTop - gate.top - gate.h - 30, background: alpha(C.muted, 0.6), borderRadius: 4 }} />
          <div
            style={{
              height: gate.h,
              borderRadius: 14,
              background: `repeating-linear-gradient(135deg, ${alpha(C.text, 0.9)} 0 22px, ${alpha(C.accent, 0.9)} 22px 44px)`,
              border: `3px solid ${C.text}`,
              // Breathing glow while the card stays blocked (keeps the held shot alive).
              boxShadow: `0 0 ${40 + 30 * (0.5 + 0.5 * Math.sin(t * 4))}px ${alpha(C.accent, 0.5 + 0.3 * (0.5 + 0.5 * Math.sin(t * 4)))}`,
            }}
          />
          <div style={{ position: 'absolute', top: -58, width: '100%', textAlign: 'center' }}>
            <Pill size={30} outline>
              content filter
            </Pill>
          </div>
        </div>
      )}
      {s.phase === 3 && s.filter.fly > 0 && (
        <div
          style={{
            position: 'absolute',
            left: lerp(W / 2, gpt, s.filter.fly) - 280,
            top: lerp(cardCy, gate.top - 130, s.filter.fly) - 40,
            // A short shudder as the stamp lands: the card is stopped, not just parked.
            transform: `translateX(${s.filter.stamp > 0 ? Math.sin(s.filter.stamp * 28) * 16 * (1 - s.filter.stamp) : 0}px) scale(${lerp(1.6, 0.8, s.filter.fly)})`,
          }}
        >
          <Card w={560} h={82} style={{ borderRadius: 18 }}>
            <span style={{ fontSize: 30, fontWeight: 600 }}>{DATA.ciphers.random_substitution}</span>
          </Card>
          <div
            style={{
              position: 'absolute',
              // Above the stopped card, so the masked text stays readable under the stamp.
              left: 70,
              top: -118,
              padding: '8px 26px',
              border: `6px solid ${C.text}`,
              borderRadius: 14,
              background: alpha(C.bg0, 0.85),
              color: C.text,
              fontSize: 48,
              fontWeight: 900,
              letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
              transform: `rotate(-8deg) scale(${lerp(2.2, 1, s.filter.stamp)})`,
              opacity: s.filter.stamp,
            }}
          >
            400 · jailbreak
          </div>
        </div>
      )}

      {/* ---- chips ---- */}
      {MODELS.map((m, i) => (
        <Chip key={m.id} x={chipX(i)} y={Y.chipTop} label={m.label} lit={s.chips[i].lit} dim={s.chips[i].dim} muted={s.phase !== 3 && i >= 2} />
      ))}

      {/* ---- responses under the chips ---- */}
      <div
        style={{
          position: 'absolute',
          left: pair.x,
          width: pair.w,
          top: Y.chipTop + CHIP.h + 22,
          opacity: s.refusal.pop * s.refusal.opacity,
          transform: `translateY(${(1 - s.refusal.pop) * 20}px)`,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div style={{ padding: '14px 22px', borderRadius: 18, background: C.card, border: `2px dashed ${alpha(C.muted, 0.7)}`, fontSize: 30, fontWeight: 700, whiteSpace: 'nowrap', color: C.text }}>
          stop_reason: refusal
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: Y.chipTop + CHIP.h + 22,
          opacity: s.answer.pop * s.answer.opacity,
          transform: `translateY(${(1 - s.answer.pop) * 20}px)`,
        }}
      >
        <div style={{ padding: '16px 28px', borderRadius: 22, background: GRADIENT, fontSize: 40, fontWeight: 600, whiteSpace: 'nowrap', color: C.text }}>
          The capital of France is <b>Paris</b>
        </div>
      </div>
    </Stage>
  );
};
