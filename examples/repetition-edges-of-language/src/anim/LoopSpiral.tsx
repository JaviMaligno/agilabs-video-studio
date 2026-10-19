import React from 'react';
import { C, alpha } from '../brand.ts';
import { Stage } from './Stage.tsx';
import type { AnimProps } from './types.ts';
import { frameState, type LoopSpiralProps } from './LoopSpiral.state.ts';
import { SEED } from './ShellChips.state.ts';
import { CoreChip, Gauge, ReplyBubble, SpiralText } from './pieces.tsx';

export const LoopSpiral: React.FC<AnimProps & LoopSpiralProps> = ({ t, beats, dur, vertical, ...p }) => {
  const s = frameState(p, t, beats, dur);

  return (
    <Stage vertical={vertical} fill>
      {/* A faint vortex glow behind each spiral. */}
      {s.spirals.map((sp, i) => (
        <div
          key={`g${i}`}
          style={{
            position: 'absolute',
            left: sp.cx - 300,
            top: sp.cy - 300,
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(C.accent2, 0.22)}, transparent 65%)`,
          }}
        />
      ))}
      {s.spirals.map((sp, i) => (
        <React.Fragment key={i}>
          <SpiralText words={sp.words} />
          {sp.label && p.mode === 'seeds' ? (
            <div style={{ position: 'absolute', left: sp.cx - 230, width: 460, top: 210, textAlign: 'center', fontSize: 40, fontWeight: 800, color: C.accentText, opacity: sp.labelOpacity }}>
              {sp.label}
            </div>
          ) : null}
        </React.Fragment>
      ))}

      {p.mode === 'seeds' && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 860, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16 }}>
          <CoreChip size={70} seed={SEED.qwen} shell={0} />
          <div style={{ fontSize: 30, fontWeight: 600, color: C.muted }}>Qwen 7B Base</div>
        </div>
      )}

      {p.mode === 'table' && (
        <>
          <div style={{ position: 'absolute', left: 0, top: 0, display: 'flex', alignItems: 'center', gap: 16 }}>
            <CoreChip size={96} seed={SEED.qwen} shell={0} />
            <div style={{ fontSize: 28, fontWeight: 600, color: C.muted, lineHeight: 1.15 }}>
              Qwen 7B
              <br />
              Base
            </div>
          </div>
          <div style={{ position: 'absolute', left: 0, top: 130 }}>
            <ReplyBubble text="table table table table table table…" size={30} maxWidth={600} style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottom: 'none' }} />
          </div>
          <div style={{ position: 'absolute', right: 0, top: 0, opacity: s.gauge.opacity }}>
            <Gauge value={s.gauge.value} w={300} label={s.gauge.label} id="table" valueSize={64} />
          </div>
        </>
      )}

      {p.mode === 'stats' && (
        <>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 0, display: 'flex', justifyContent: 'space-between' }}>
            {s.aligned.map((a, i) => (
              <div key={i} style={{ width: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, opacity: a.opacity }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CoreChip size={52} seed={[SEED.opus, SEED.sonnet, SEED.qwen][i]} shell={1} />
                  <div style={{ fontSize: 24, fontWeight: 600, color: C.muted, lineHeight: 1.1, width: 150 }}>{a.label}</div>
                </div>
                <Gauge value={a.value} w={150} label="~0.10" caption="" id={`al${i}`} valueSize={36} />
              </div>
            ))}
          </div>
          <div style={{ position: 'absolute', left: 0, top: 290, display: 'flex', alignItems: 'center', gap: 12 }}>
            <CoreChip size={56} seed={SEED.qwen} shell={0} />
            <div style={{ fontSize: 28, fontWeight: 600, color: C.muted }}>Qwen 7B Base</div>
          </div>
          {/* right: 80 keeps the payoff number clear of the platform action rail (frame x > 940). */}
          <div style={{ position: 'absolute', right: 80, top: 820 }}>
            <Gauge value={s.gauge.value} w={230} label={s.gauge.label || ' '} caption={s.gauge.label === '0.78' ? 'multi-turn' : 'single-turn'} id="base" valueSize={58} />
          </div>
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 1040,
              textAlign: 'center',
              fontSize: 31,
              fontWeight: 600,
              color: C.text,
              opacity: 0.8 * s.pTag,
            }}
          >
            p = 0.0059 · not a fluke of one or two stimuli
          </div>
        </>
      )}
    </Stage>
  );
};
