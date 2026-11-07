import React from 'react';
import { Img, staticFile } from 'remotion';
import { C, GRADIENT, alpha } from '../brand.ts';
import type { AnimProps } from './types.ts';
import { frameState, RATES, type BarKey, type TwoAIsProps, type TwoAIsState } from './TwoAIs.state.ts';
import { Stage, gradientText, stageOf } from './Stage.tsx';
import { Card, GlyphLine, Pill } from './pieces.tsx';
import { morph } from './glyphs.ts';
import ciphers from '../data/ciphers.json';

export { frameState };
export type { TwoAIsProps };

const PAPER = '#f8fafc';
const INK = '#0f172a';
const B64 = ciphers.ciphers.base64;
const B64_ROWS = [B64.slice(0, 22), B64.slice(22)];
const PLAIN_ROWS = ['reply with the single', 'word banana'].map((r) => r.padEnd(22, ' '));
/** Illustrative binary for the raw AI's stream (the repo's own encoding of a stock sentence). */
const BINARY = (ciphers.mimic as Record<string, string>).binary.split(' ');

const Robot: React.FC<{ img: string; size: number; label: string; sub?: string; opacity?: number }> = ({ img, size, label, sub, opacity = 1 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, opacity }}>
    <Img src={staticFile(img)} style={{ width: size, height: size, objectFit: 'contain' }} />
    {label ? <div style={{ fontSize: 40, fontWeight: 800, color: C.text, whiteSpace: 'nowrap' }}>{label}</div> : null}
    <div style={{ fontSize: 28, fontWeight: 700, color: C.muted, whiteSpace: 'nowrap', minHeight: 34 }}>{sub ?? ''}</div>
  </div>
);

const Bubble: React.FC<{ children: React.ReactNode; size?: number }> = ({ children, size = 64 }) => (
  <div style={{ background: PAPER, color: INK, fontSize: size, fontWeight: 800, padding: '16px 36px', borderRadius: 34, boxShadow: `0 10px 40px ${alpha('#000000', 0.5)}` }}>{children}</div>
);

// ---------- hook ----------
const Hook: React.FC<{ s: TwoAIsState; W: number }> = ({ s, W }) => {
  const half = W / 2;
  const n = Math.min(BINARY.length, Math.floor(s.hook.typed * 16));
  const lines = [0, 1, 2, 3, 4].map((r) => BINARY.slice(r * 3, Math.min(n, r * 3 + 3)).join(' '));
  return (
    <>
      <div style={{ position: 'absolute', left: 0, top: 0, width: W, textAlign: 'center', fontWeight: 800, lineHeight: 1.1 }}>
        <div style={{ fontSize: 60 }}>Who speaks</div>
        <div style={{ fontSize: 84, ...gradientText }}>secret code best?</div>
      </div>
      {/* GPT-5: a plain answer */}
      <div style={{ position: 'absolute', left: 0, width: half, top: 360, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40 }}>
        <Bubble size={76}>banana</Bubble>
        <Robot img="cast/robot-teal.png" size={340} label="GPT-5" />
        <div style={{ fontSize: 36, fontWeight: 700, color: C.muted }}>plain English</div>
      </div>
      {/* the raw AI: neat lines of binary */}
      <div style={{ position: 'absolute', left: half, width: half, top: 270, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
        <Card w={half - 30} h={240} style={{ flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', padding: '18px 22px', boxSizing: 'border-box', gap: 2 }}>
          {lines.map((l, i) => (
            <div key={i} style={{ fontSize: 28, fontWeight: 700, whiteSpace: 'nowrap', color: C.accentText, fontFamily: 'monospace' }}>
              {l}
            </div>
          ))}
        </Card>
        <Robot img="cast/robot-amber.png" size={340} label="an autocomplete AI" sub="never taught to chat" />
        <div style={{ opacity: s.hook.tag, transform: `scale(${0.7 + 0.3 * s.hook.tag}) rotate(-3deg)` }}>
          <Pill size={40}>understands it least</Pill>
        </div>
      </div>
    </>
  );
};

// ---------- note ----------
const Note: React.FC<{ s: TwoAIsState; t: number; W: number }> = ({ s, t, W }) => {
  const rows = B64_ROWS.map((r, i) => morph(r, PLAIN_ROWS[i], s.note.reveal, t, 0.6, 5 + i));
  const cardW = 860;
  return (
    <>
      <div style={{ position: 'absolute', left: (W - cardW) / 2, top: 140 }}>
        <div style={{ fontSize: 30, fontWeight: 700, color: C.accentText, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>a note, in code</div>
        <Card w={cardW} h={240} glow={s.note.reveal > 0.95 ? 0.4 : 0}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {rows.map((g, i) => (
              <GlyphLine key={i} glyphs={g} size={52} weight={s.note.reveal > 0.5 ? 700 : 600} />
            ))}
          </div>
        </Card>
      </div>
      <div style={{ position: 'absolute', left: 0, width: W, top: 570, display: 'flex', justifyContent: 'center', opacity: s.note.ask, transform: `translateY(${(1 - s.note.ask) * 30}px)` }}>
        <Bubble size={50}>+ “answer me in the same code”</Bubble>
      </div>
      <div style={{ position: 'absolute', left: 0, width: W, top: 720, display: 'flex', justifyContent: 'center', gap: 120, opacity: 0.9 }}>
        <Robot img="cast/robot-teal.png" size={300} label="" />
        <Robot img="cast/robot-amber.png" size={300} label="" />
      </div>
    </>
  );
};

// ---------- meters ----------
const BAR_W = 410;
const Meter: React.FC<{ k: BarKey; label: string; s: TwoAIsState }> = ({ k, label, s }) => {
  const b = s.bars[k];
  const r = RATES[k];
  return (
    <div style={{ opacity: b.shown, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 36, fontWeight: 700, color: C.muted }}>{label}</div>
      <div style={{ width: BAR_W, height: 56, borderRadius: 28, background: alpha(C.muted, 0.18), overflow: 'hidden' }}>
        <div style={{ width: BAR_W * r.value * b.fill, height: '100%', borderRadius: 22, background: GRADIENT, boxShadow: `0 0 20px ${alpha(C.accent, 0.6)}` }} />
      </div>
      <div style={{ fontSize: 54, fontWeight: 800, color: C.text, opacity: b.fill > 0.6 ? 1 : 0 }}>{r.words}</div>
    </div>
  );
};

const Meters: React.FC<{ s: TwoAIsState; W: number }> = ({ s, W }) => {
  const half = W / 2;
  const col = (img: string, name: string, sub: string, u: BarKey, c: BarKey, op: number, x: number) => (
    <div style={{ position: 'absolute', left: x, width: half, top: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 46, opacity: op }}>
      <Robot img={img} size={320} label={name} sub={sub} />
      <Meter k={u} label="understood the note" s={s} />
      <Meter k={c} label="answered in code" s={s} />
    </div>
  );
  return (
    <>
      {col('cast/robot-teal.png', 'GPT-5', 'a chatbot', 'gptUnderstood', 'gptCode', s.robots.gpt, 0)}
      {col('cast/robot-amber.png', 'an autocomplete AI', 'never taught to chat', 'rawUnderstood', 'rawCode', s.robots.raw, half)}
    </>
  );
};

export const TwoAIs: React.FC<AnimProps & TwoAIsProps> = ({ t, beats, dur, vertical, ...props }) => {
  const s = frameState(props, t, beats, dur);
  const { w: W } = stageOf(vertical);
  return (
    <Stage vertical={vertical} fill>
      {s.mode === 'hook' && <Hook s={s} W={W} />}
      {s.mode === 'note' && <Note s={s} t={t} W={W} />}
      {s.mode === 'meters' && <Meters s={s} W={W} />}
    </Stage>
  );
};
