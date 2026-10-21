import React from 'react';
import { C, alpha } from '../brand.ts';
import type { AnimProps } from './types.ts';
import { frameState, MIMIC_ROWS, type CipherProps, type LadderState, type MimicState, type VideoCipherData } from './CipherCard.state.ts';
import { Stage, gradientText, stageOf } from './Stage.tsx';
import { Card, Chip, GlyphLine, Pill } from './pieces.tsx';
import { clip } from './glyphs.ts';
import { Stamp } from './stampPieces.tsx';
import ciphers from '../data/ciphers.json';

export { frameState };
export type { CipherProps };

const DATA = ciphers as unknown as VideoCipherData;

// ---------- ladder ----------
const Ladder: React.FC<{ s: LadderState; W: number; H: number }> = ({ s, W, H }) => {
  const headH = 220;
  const top = headH + 14;
  const rowH = (H - top) / s.rows.length;
  return (
    <>
      <div style={{ position: 'absolute', left: 0, top: 0, width: W, textAlign: 'center', opacity: s.counter.appear }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 22 }}>
          <span style={{ fontSize: 140, fontWeight: 800, lineHeight: 1, fontVariantNumeric: 'tabular-nums', ...gradientText }}>{s.counter.value}</span>
          <span style={{ fontSize: 50, fontWeight: 800 }}>conversations</span>
        </div>
        <div style={{ marginTop: 14, fontSize: 40, fontWeight: 700, color: C.muted, opacity: s.sub.appear }}>10 ciphers · 3 models</div>
      </div>
      {s.rows.map((r, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: 0,
            width: W,
            top: top + i * rowH,
            height: rowH - 10,
            borderRadius: 18,
            background: r.hot ? alpha(C.accent, 0.28) : alpha(C.card, i % 2 ? 0.55 : 0.9),
            border: `${r.hot ? 3 : 1}px solid ${alpha(C.accentText, r.hot ? 0.9 : 0.18)}`,
            boxShadow: r.hot ? `0 0 30px ${alpha(C.accent, 0.5)}` : 'none',
            display: 'flex',
            alignItems: 'center',
            opacity: r.pop,
            transform: `translateX(${(1 - r.pop) * 60}px)`,
          }}
        >
          <div style={{ width: 300, paddingLeft: 22, fontSize: 27, fontWeight: 700, color: C.accentText, whiteSpace: 'nowrap' }}>{r.name}</div>
          <div style={{ flex: 1, overflow: 'hidden', paddingRight: 14 }}>
            {r.glyphs ? (
              <GlyphLine glyphs={r.glyphs} size={30} weight={600} />
            ) : (
              <div style={{ fontSize: 30, fontWeight: 600, whiteSpace: 'nowrap' }}>{clip(r.text, 34)}</div>
            )}
          </div>
        </div>
      ))}
    </>
  );
};

// ---------- mimic ----------
const wrap = (s: string, max: number): string[] => {
  const out: string[] = [];
  let row = '';
  for (const w of s.split(' ')) {
    if (row && (row + ' ' + w).length > max) {
      out.push(row);
      row = w;
    } else row = row ? `${row} ${w}` : w;
  }
  if (row) out.push(row);
  return out;
};

const TASK_ROWS = wrap(DATA.task.ciphers.binary, 48);
const REPLY = DATA.mimic.binary;

const Mimic: React.FC<{ s: MimicState; W: number }> = ({ s, W }) => {
  const h = s.hero;
  const n = Math.round(REPLY.length * h.typed);
  const typedRows = wrap(REPLY.slice(0, n), 44);
  return (
    <>
      {/* hero: a task in binary, a fluent binary reply */}
      <div style={{ position: 'absolute', inset: 0, opacity: h.opacity }}>
        <div style={{ position: 'absolute', left: 0, top: 0, opacity: h.card, transform: `translateY(${(1 - h.card) * -30}px)` }}>
          <Card w={W} h={240} style={{ flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', padding: '0 30px', boxSizing: 'border-box', gap: 6 }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: C.accentText, letterSpacing: '0.06em', textTransform: 'uppercase' }}>task, in binary</div>
            {TASK_ROWS.map((r, i) => (
              <div key={i} style={{ fontSize: 32, fontWeight: 600, whiteSpace: 'nowrap', letterSpacing: '0.02em' }}>
                {r}
              </div>
            ))}
          </Card>
          <div style={{ marginTop: 12, textAlign: 'center', width: W, fontSize: 32, fontWeight: 600, color: C.muted }}>
            decodes to: <span style={{ color: C.text }}>what is seven plus five</span>
          </div>
        </div>
        <div style={{ opacity: h.chip }}>
          <Chip x={(W - 320) / 2} y={360} w={320} h={124} label={['Qwen-7B', 'Base']} lit={h.typed > 0 && h.typed < 1 ? 0.8 : 0.4} size={40} />
        </div>
        <div style={{ position: 'absolute', left: 0, top: 530, opacity: h.chip }}>
          <Card w={W} h={500} glow={h.typed > 0.98 ? 0.5 : 0} style={{ flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', padding: '26px 30px', boxSizing: 'border-box', gap: 4 }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: C.accentText, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>its reply</div>
            {typedRows.map((r, i) => (
              <div key={i} style={{ fontSize: 34, fontWeight: 700, whiteSpace: 'nowrap', letterSpacing: '0.02em' }}>
                {r}
                {i === typedRows.length - 1 && h.typed < 1 && h.typed > 0 ? <span style={{ color: C.accentText, opacity: h.caret }}>▌</span> : null}
              </div>
            ))}
          </Card>
        </div>
      </div>

      {/* rows: in code, task never done */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: W, textAlign: 'center', fontSize: 36, fontWeight: 800, color: C.muted, opacity: s.rows[0].appear }}>Qwen-7B Base</div>
      {MIMIC_ROWS.map((r, i) => {
        const x = s.rows[i];
        return (
          <div key={r.key} style={{ position: 'absolute', left: 0, top: 70 + i * 225, opacity: x.appear, transform: `translateX(${(1 - x.appear) * 60}px)` }}>
            <Card w={W} h={205} style={{ flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', padding: '0 26px', boxSizing: 'border-box', gap: 12 }}>
              <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 36, fontWeight: 800, color: C.accentText }}>{r.name}</span>
                <span style={{ display: 'flex', gap: 14 }}>
                  <span style={{ opacity: x.tick, transform: `scale(${0.7 + 0.3 * x.tick})` }}>
                    <Pill size={28}>in code ✓</Pill>
                  </span>
                  <span style={{ opacity: x.zero, transform: `scale(${0.7 + 0.3 * x.zero})` }}>
                    <Pill size={28} outline>
                      task done: 0
                    </Pill>
                  </span>
                </span>
              </div>
              <div style={{ fontSize: 34, fontWeight: 600, whiteSpace: 'pre', color: alpha(C.text, 0.85) }}>{clip(DATA.mimic[r.key] ?? '', 40)}</div>
            </Card>
          </div>
        );
      })}
      <div style={{ position: 'absolute', left: 0, top: 300, width: W, display: 'flex', justifyContent: 'center' }}>
        <Stamp label="mimicry" size={110} rot={-9} s={s.stamp} style={{ borderWidth: 12 }} />
      </div>
      <div style={{ position: 'absolute', left: 0, top: 790, width: W, display: 'flex', justifyContent: 'center', gap: 40, opacity: s.tag.pop, transform: `translateY(${(1 - s.tag.pop) * 30}px)` }}>
        {[
          ['36%', 'understands'],
          ['56%', 'writes in code'],
        ].map(([v, l]) => (
          <div key={l} style={{ textAlign: 'center', width: 420 }}>
            <div style={{ fontSize: 130, fontWeight: 800, lineHeight: 1, ...gradientText }}>{v}</div>
            <div style={{ fontSize: 40, fontWeight: 700, color: C.muted, marginTop: 6 }}>{l}</div>
          </div>
        ))}
      </div>
    </>
  );
};

export const CipherCard: React.FC<AnimProps & CipherProps> = ({ t, beats, dur, vertical, ...props }) => {
  const s = frameState(props, t, beats, dur, DATA);
  const { w: W, h: H } = stageOf(vertical);
  return (
    <Stage vertical={vertical} fill>
      {s.mode === 'ladder' && <Ladder s={s} W={W} H={H} />}
      {s.mode === 'mimic' && <Mimic s={s} W={W} />}
    </Stage>
  );
};
