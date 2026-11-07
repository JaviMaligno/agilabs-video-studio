import React from 'react';
import { Img, staticFile } from 'remotion';
import { C } from '../brand.ts';
import type { AnimProps } from './types.ts';
import { frameState, HOPS, ROWS, type TelephoneProps, type Verdict } from './Telephone.state.ts';
import { Stage, stageOf } from './Stage.tsx';

export { frameState };
export type { TelephoneProps };

const ROSE = '#fb7185';
const alpha = (hex: string, a: number) => `${hex}${Math.round(Math.max(0, Math.min(1, a)) * 255).toString(16).padStart(2, '0')}`;
const VERDICT: Record<Verdict, { color: string; mark: string }> = {
  kept: { color: C.ok, mark: '✓' },
  distorted: { color: C.whyText, mark: '~' },
  lost: { color: ROSE, mark: '✗' },
};

/** One row of eight robots; `active` lights the robot holding the message (or -1 for none). */
const Row: React.FC<{ img: string; scale: number; label: string; active: number; dim: number; w: number }> = ({ img, scale, label, active, dim, w }) => {
  const cell = w / HOPS;
  return (
    <div style={{ opacity: dim }}>
      <div style={{ fontSize: 30, fontWeight: 700, color: C.muted, marginBottom: 4 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', height: cell * 1.05 }}>
        {Array.from({ length: HOPS }, (_, i) => {
          const on = Math.abs(i - active) < 0.6;
          return (
            <div key={i} style={{ width: cell, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', position: 'relative' }}>
              <Img src={staticFile(img)} style={{ width: cell * 0.92 * scale, height: cell * 0.92 * scale, objectFit: 'contain', opacity: on ? 1 : 0.45, transform: `translateY(${on ? -8 : 0}px)` }} />
              {on && <div style={{ position: 'absolute', top: -6, width: 18, height: 18, borderRadius: 9, background: C.accentText, boxShadow: `0 0 16px ${C.accentText}` }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** The speech bubble with the hop's real text, the fact chips under it, and any added claim. */
const Bubble: React.FC<{ text: string; hop: number; facts: ReturnType<typeof frameState>['facts']; added: string; w: number; textIn: number }> = ({ text, hop, facts, added, w, textIn }) => {
  const size = text.length > 260 ? 34 : text.length > 190 ? 38 : 42;
  return (
    <div style={{ width: w, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ background: C.paper, color: C.ink, borderRadius: 28, padding: '26px 32px', position: 'relative', boxShadow: `0 10px 40px ${alpha('#000000', 0.5)}` }}>
        <div style={{ position: 'absolute', top: -22, left: 26, background: C.accent, color: C.text, fontSize: 26, fontWeight: 800, padding: '4px 14px', borderRadius: 12 }}>
          {hop === 0 ? 'the message' : `robot ${hop} of ${HOPS}`}
        </div>
        <div style={{ fontSize: size, fontWeight: 600, lineHeight: 1.28, opacity: textIn }}>{text}</div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {facts.map((f) => {
          const v = VERDICT[f.verdict];
          return (
            <div
              key={f.key}
              style={{
                fontSize: 30,
                fontWeight: 800,
                padding: '8px 16px',
                borderRadius: 14,
                color: v.color,
                border: `3px solid ${alpha(v.color, 0.6 + 0.4 * f.focus)}`,
                background: alpha(v.color, 0.1 + 0.15 * f.focus),
                transform: `scale(${1 + 0.06 * f.focus})`,
              }}
            >
              {v.mark} {f.label}
            </div>
          );
        })}
      </div>
      <div style={{ minHeight: 96, fontSize: 30, fontWeight: 700, color: ROSE, opacity: added ? 1 : 0 }}>{added ? `+ added: ${added.length > 110 ? `${added.slice(0, 107)}…` : added}` : ''}</div>
    </div>
  );
};

/** The telephone game: rows of robots passing a message, the real text of each hop, the verdicts. */
export const Telephone: React.FC<AnimProps & TelephoneProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const box = stageOf(p.vertical);
  const w = Math.min(box.w, 960);
  const cardImg = s.mode === 'tally' || s.mode === 'verdict' ? 100 : 120;
  if (s.mode === 'tally' || s.mode === 'verdict') {
    const verdictText: Record<string, string> = { sonnet: 'kept the message', sol: 'kept the message', luna: 'lost the why', haiku: 'kept the why, lost the who' };
    return (
      <Stage vertical={p.vertical}>
        <div style={{ width: w, display: 'flex', flexDirection: 'column', gap: 28 }}>
          {s.mode === 'tally' && <div style={{ fontSize: 40, fontWeight: 800, color: C.text }}>6 messages · 18 chains per AI</div>}
          {s.tally.map((r) => (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 26, opacity: r.in, transform: `translateY(${(1 - r.in) * 20}px)`, background: C.card, borderRadius: 24, padding: '18px 26px' }}>
              <Img src={staticFile(r.img)} style={{ width: cardImg * r.scale, height: cardImg * r.scale, objectFit: 'contain' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: 34, fontWeight: 800, color: C.text }}>{r.label}</div>
                {s.mode === 'tally' ? (
                  <div style={{ fontSize: 32, fontWeight: 700, color: C.muted }}>
                    <span style={{ color: r.reasonsKept === r.reasons ? C.ok : r.reasonsKept / r.reasons < 0.7 ? ROSE : C.whyText }}>{`${r.reasonsKept}/${r.reasons}`}</span> reasons kept ·{' '}
                    <span style={{ color: r.recipientKept === r.chains ? C.ok : r.recipientKept / r.chains < 0.4 ? ROSE : C.whyText }}>{`${r.recipientKept}/${r.chains}`}</span> knew who it was for
                  </div>
                ) : (
                  <div style={{ fontSize: 36, fontWeight: 800, color: r.id === 'sonnet' || r.id === 'sol' ? C.ok : ROSE }}>{verdictText[r.id]}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Stage>
    );
  }
  const rowsOnly = s.mode === 'rows';
  return (
    <Stage vertical={p.vertical} fill>
      <div style={{ position: 'absolute', left: (box.w - w) / 2, top: 10, width: w, display: 'flex', flexDirection: 'column', gap: rowsOnly ? 16 : 14 }}>
        {ROWS.filter((r) => rowsOnly || (s.mode !== 'message' && r.id === s.model)).map((r) => (
          <Row key={r.id} img={r.img} scale={r.scale} label={r.label} w={w} dim={1} active={rowsOnly || s.mode === 'message' ? s.run : s.hop - 1} />
        ))}
      </div>
      {rowsOnly && (
        <div style={{ position: 'absolute', left: (box.w - 440) / 2, top: 660, width: 440, height: 440, transform: `rotate(${Math.sin(p.t * 22) * (Math.sin(p.t * 1.6) > 0.3 ? 4 : 0.6)}deg)` }}>
          <Img src={staticFile('cast/props/telephone.png')} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
      )}
      {s.mode === 'message' && (
        <div style={{ position: 'absolute', left: (box.w - w) / 2, top: 560, width: w, display: 'flex', justifyContent: 'space-between' }}>
          {s.icons.map((ic) => (
            <div key={ic.label} style={{ width: w / 5 - 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, opacity: 0.25 + 0.75 * ic.lit, transform: `scale(${0.9 + 0.1 * ic.lit}) translateY(${(1 - ic.lit) * 10}px)` }}>
              <div style={{ position: 'relative', width: w / 5 - 8, height: w / 5 - 8 }}>
                <Img src={staticFile(ic.img)} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                {'overlay' in ic && ic.overlay ? (
                  <div style={{ position: 'absolute', left: 0, right: 0, top: '42%', textAlign: 'center', fontSize: 40, fontWeight: 900, color: C.ink }}>{ic.overlay}</div>
                ) : null}
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: ic.lit > 0.5 ? C.ok : C.muted, textAlign: 'center' }}>{ic.label}</div>
            </div>
          ))}
        </div>
      )}
      {!rowsOnly && (
        <div style={{ position: 'absolute', left: (box.w - w) / 2, top: s.mode === 'message' ? 60 : 250 }}>
          <Bubble text={s.text} hop={s.hop} facts={s.facts} added={s.added} w={w} textIn={s.textIn} />
        </div>
      )}
    </Stage>
  );
};
