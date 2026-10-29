import React from 'react';
import { C } from '../brand.ts';
import type { AnimProps } from './types.ts';
import { CARDS, COLS, GEO, frameState, type GateProps } from './RefusalGate.state.ts';
import { Stage, stageOf } from './Stage.tsx';
import { Chip, Pill, Wall } from './pieces.tsx';
import { SealedCard, Stamp } from './stampPieces.tsx';

export { frameState };
export type { GateProps };

export const RefusalGate: React.FC<AnimProps & GateProps> = ({ t, beats, dur, vertical, ...props }) => {
  const s = frameState(props, t, beats, dur);
  const { w: W } = stageOf(vertical);
  const head: React.CSSProperties = { position: 'absolute', left: 0, top: 10, width: W, display: 'flex', justifyContent: 'center' };
  return (
    <Stage vertical={vertical} fill>
      {/* head, one per moment */}
      <div style={{ ...head, opacity: s.head.plain, fontSize: 64, fontWeight: 800 }}>in plain text</div>
      <div style={{ ...head, opacity: s.head.cipher, fontSize: 64, fontWeight: 800 }}>in cipher</div>
      <div style={{ ...head, opacity: s.head.hedge, transform: `scale(${0.8 + 0.2 * s.head.hedge})` }}>
        <Pill size={42}>2 prompts · existence, not a rate</Pill>
      </div>

      {/* GPT-5's refusal: a glass wall across the stage */}
      <Wall x={0} bottom={GEO.wallY + GEO.wallH} w={W} height={GEO.wallH * s.wall.appear} flash={s.wall.flash} />
      <div style={{ position: 'absolute', left: 0, top: GEO.wallY + GEO.wallH + 10, width: W, display: 'flex', justifyContent: 'center', opacity: s.wall.appear }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: C.muted }}>GPT-5 refuses</div>
      </div>
      <div style={{ position: 'absolute', left: (COLS[1] + COLS[2]) / 2 - 170, width: 340, top: GEO.wallY - 64, display: 'flex', justifyContent: 'center', opacity: s.refused.pop * s.refused.opacity, transform: `scale(${0.7 + 0.3 * s.refused.pop})` }}>
        <Pill size={34} outline>
          refused · 30/30
        </Pill>
      </div>

      {/* the cards */}
      {s.cards.map((c, i) => {
        const spec = CARDS[i];
        const tag = spec.passes ? (c.cipher < 0.5 ? 'plain text' : spec.cipher) : spec.cipher;
        return (
          <div key={i} style={{ position: 'absolute', left: c.x - GEO.cardW / 2, top: c.y, opacity: c.opacity }}>
            <SealedCard w={GEO.cardW} h={GEO.cardH} glow={c.flash} tag={tag} />
            {c.stamps.map((st, k) => (
              <div key={k} style={{ position: 'absolute', left: 0, width: GEO.cardW, top: 6 + k * 62, display: 'flex', justifyContent: 'center' }}>
                <Stamp label="complied" size={28} rot={k ? 5 : -7} s={st} />
              </div>
            ))}
            {c.blocked > 0 && (
              <div style={{ position: 'absolute', left: 0, width: GEO.cardW, top: -54, display: 'flex', justifyContent: 'center', opacity: c.blocked }}>
                <div style={{ fontSize: 30, fontWeight: 800, color: C.muted }}>stopped</div>
              </div>
            )}
          </div>
        );
      })}
      {/* "both judges" note beside the passed pair */}
      <div style={{ position: 'absolute', left: COLS[1] - 120, width: COLS[2] - COLS[1] + 240, top: GEO.restY + GEO.cardH + 16, textAlign: 'center', fontSize: 28, fontWeight: 700, color: C.accentText, opacity: s.cards[1].stamps[1].pop }}>
        both judges agree
      </div>

      <Chip x={(W - 350) / 2} y={GEO.chipY} w={350} h={120} label={['GPT-5']} lit={s.chip.lit} size={48} icon="cast/robot-teal.png" />
    </Stage>
  );
};
