// Drawing pieces shared by the bespoke components: the rack, the scroll and the notepad.
import React from 'react';
import { C, alpha } from '../brand.ts';
import { Mark, Pen } from './pieces.tsx';
import { RACK, slotX, transcriptLine, type NoteLine, type Slot, type SvnState, type Tone } from './ScrollVsNotepad.state.ts';

export const TONE: Record<Tone, string> = { plain: C.text, warm: C.warm, bad: C.marker, ok: C.ok };

/** The warehouse rack: numbered shelf slots with pallets. */
export const Rack: React.FC<{ y: number; opacity: number; slots: Slot[]; shipY?: number; label?: string }> = ({ y, opacity, slots, shipY = 0, label }) => {
  if (opacity <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, opacity }}>
      {label && (
        <div style={{ position: 'absolute', left: RACK.x0, top: y - 44, fontSize: 26, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.muted }}>{label}</div>
      )}
      {slots.map((s, i) => {
        const x = slotX(i);
        const tone = TONE[s.tone];
        const glow = s.flash > 0 ? `0 0 ${36 * s.flash}px ${alpha(tone, 0.85 * s.flash)}` : 'none';
        return (
          <div key={s.shelf} style={{ position: 'absolute', left: x, top: y, width: RACK.w, height: RACK.h }}>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 14,
                border: `3px solid ${s.flash > 0.05 ? alpha(tone, 0.4 + 0.6 * s.flash) : alpha(C.muted, 0.45)}`,
                background: alpha(C.bg1, 0.9),
                boxShadow: glow,
              }}
            />
            <div style={{ position: 'absolute', left: 14, top: 8, fontSize: 24, fontWeight: 700, color: C.muted }}>shelf {s.shelf}</div>
            {s.lot && s.pallet > 0 && (
              <div
                style={{
                  position: 'absolute',
                  left: 12,
                  top: 50,
                  width: RACK.w - 24,
                  height: 84,
                  borderRadius: 10,
                  background: alpha(C.accentText, 0.22),
                  border: `3px solid ${alpha(C.accentText, 0.7)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: s.lot.length > 3 ? 27 : 32,
                  fontWeight: 800,
                  opacity: s.pallet,
                  transform: `translateY(${(1 - s.pallet) * 24 * (shipY > 0 ? 1 : -1)}px)`,
                }}
              >
                {s.lot}
              </div>
            )}
            {s.check > 0 && (
              <div style={{ position: 'absolute', right: -14, top: -18, width: 46, height: 46, borderRadius: 23, background: C.ok, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: s.check, transform: `scale(${1.5 - 0.5 * s.check})` }}>
                <Mark size={32} color={C.bg0} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

/** Text width estimate for Inter at weight 700 (for the pen and strike lines). */
export const textW = (text: string, size: number): number => text.length * size * 0.56;

const NOTE = { head: 72, lh: 64, font: 34, pad: 28 } as const;
export const noteHeight = (n: number): number => NOTE.head + n * NOTE.lh + 22;
export const noteLineY = (y: number, i: number): number => y + NOTE.head + i * NOTE.lh;

/** One notepad line: plain, being written (reveal), or struck and rewritten. */
const NoteRow: React.FC<{ l: NoteLine; top: number; left: number; width: number }> = ({ l, top, left, width }) => {
  const tone = TONE[l.tone];
  const rewriting = l.strike > 0 && !!l.next;
  const reveal = rewriting ? 1 : l.write;
  const oldW = textW(l.text, NOTE.font);
  return (
    <div style={{ position: 'absolute', left, top, width, height: NOTE.lh }}>
      {l.flash > 0 && <div style={{ position: 'absolute', left: -12, right: -12, top: 6, bottom: 6, borderRadius: 10, background: alpha(tone === C.text ? C.accentText : tone, 0.22 * l.flash) }} />}
      {/* the value as it was; struck through when a new one replaces it */}
      <div style={{ position: 'absolute', left: 0, top: 10, fontSize: NOTE.font, fontWeight: 700, color: tone, whiteSpace: 'nowrap', clipPath: `inset(0 ${100 - 100 * reveal}% 0 0)`, opacity: rewriting ? 1 - l.write : 1 }}>
        {l.text}
      </div>
      {rewriting && <div style={{ position: 'absolute', left: -4, top: NOTE.lh / 2 + 1, width: (oldW + 8) * l.strike, height: 5, borderRadius: 3, background: C.marker, opacity: 1 - l.write }} />}
      {rewriting && (
        <div style={{ position: 'absolute', left: 0, top: 10, fontSize: NOTE.font, fontWeight: 700, color: C.ok, whiteSpace: 'nowrap', clipPath: `inset(0 ${100 - 100 * l.write}% 0 0)` }}>{l.next}</div>
      )}
    </div>
  );
};

/** The notepad card. */
export const Notepad: React.FC<{ n: SvnState['notepad']; title?: string; scale?: number }> = ({ n, title = 'notepad' }) => {
  if (n.opacity <= 0) return null;
  const h = noteHeight(n.lines.length);
  const penLine = n.lines[n.pen.line];
  const penText = penLine ? (penLine.strike > 0 && penLine.next ? penLine.next : penLine.text) : '';
  return (
    <div style={{ position: 'absolute', left: n.x, top: n.y, width: n.w, height: h, opacity: n.opacity }}>
      {n.sub > 0 && (
        <div style={{ position: 'absolute', left: 0, top: -50, fontSize: 30, fontWeight: 800, color: C.accentText, opacity: n.sub, whiteSpace: 'nowrap' }}>SKILL.state · explicit state</div>
      )}
      <div style={{ position: 'absolute', inset: 0, borderRadius: 20, background: C.card, border: `3px solid ${alpha(C.accentText, 0.7)}`, boxShadow: `0 10px 40px ${alpha(C.bg0, 0.6)}` }} />
      <div style={{ position: 'absolute', left: NOTE.pad, top: 16, fontSize: 28, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.accentText }}>{title}</div>
      <div style={{ position: 'absolute', left: NOTE.pad, right: NOTE.pad, top: 62, height: 3, background: alpha(C.accentText, 0.3) }} />
      {n.badge.opacity > 0 && (
        <div
          style={{
            position: 'absolute',
            right: 18,
            top: 12,
            padding: '2px 14px',
            borderRadius: 10,
            border: `3px solid ${n.badge.text === 'done' ? C.ok : C.warm}`,
            color: n.badge.text === 'done' ? C.ok : C.warm,
            fontSize: 26,
            fontWeight: 800,
            opacity: n.badge.opacity,
          }}
        >
          {n.badge.text === 'done' ? '✓ done' : n.badge.text}
        </div>
      )}
      {n.lines.map((l, i) => (
        <NoteRow key={i} l={l} left={NOTE.pad} top={NOTE.head + i * NOTE.lh - 8} width={n.w - 2 * NOTE.pad} />
      ))}
      {n.pen.opacity > 0 && penLine && (
        <div style={{ position: 'absolute', left: NOTE.pad + textW(penText, NOTE.font) * n.pen.prog - 6, top: NOTE.head + n.pen.line * NOTE.lh - 48, opacity: n.pen.opacity }}>
          <Pen size={60} />
        </div>
      )}
      {n.tag > 0 && (
        <div style={{ position: 'absolute', right: 0, top: h + 16, fontSize: 26, fontWeight: 700, color: C.muted, opacity: n.tag, whiteSpace: 'nowrap' }}>a paper at EMNLP</div>
      )}
    </div>
  );
};

/** Lines of the scroll at full size, and the stack of older ones squeezed above. */
export const SCROLL = { head: 58, full: 9, squeeze: 30, bar: 8 } as const;

export const scrollLayout = (sc: SvnState['scroll']) => {
  const lh = Math.round(sc.font * 1.55);
  const lines = sc.list ?? Array.from({ length: Math.max(1, Math.floor(sc.steps)) }, (_, i) => transcriptLine(i + 1));
  const n = sc.list ? sc.list.length : Math.max(1, Math.floor(sc.steps));
  const full = sc.list ? n : Math.min(n, SCROLL.full);
  const squeezed = sc.list ? 0 : Math.min(n - full, SCROLL.squeeze);
  const stackH = squeezed ? squeezed * SCROLL.bar + 14 : 0;
  const h = SCROLL.head + stackH + full * lh + 22;
  return { lh, lines, n, full, squeezed, stackH, h };
};

/** The scroll (the transcript): never erases a line. */
export const Scroll: React.FC<{ sc: SvnState['scroll']; glow?: number }> = ({ sc, glow = 0 }) => {
  if (sc.opacity <= 0) return null;
  const L = scrollLayout(sc);
  const shown = L.lines.slice(L.n - L.full);
  const top0 = SCROLL.head + L.stackH;
  const hlOf = (idx: number) => sc.hl.find((h) => h.index === idx);
  return (
    <div style={{ position: 'absolute', left: sc.x, top: sc.y, width: sc.w, height: L.h, opacity: sc.opacity * (1 - sc.dim) }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: 18, background: alpha(C.text, 0.06), border: `3px solid ${alpha(C.muted, 0.5)}` }} />
      <div style={{ position: 'absolute', left: 22, top: 12, fontSize: 26, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted, opacity: sc.title.opacity, whiteSpace: 'nowrap' }}>{sc.title.text}</div>
      {sc.counter.opacity > 0 && (
        <div style={{ position: 'absolute', right: 4, top: -56, fontSize: 40, fontWeight: 800, color: C.text, opacity: sc.counter.opacity, fontVariantNumeric: 'tabular-nums' }}>step {sc.counter.value}</div>
      )}
      {/* older lines, squeezed into a stack: never erased */}
      {Array.from({ length: L.squeezed }, (_, i) => (
        <div key={`s${i}`} style={{ position: 'absolute', left: 22, top: SCROLL.head + 4 + i * SCROLL.bar, width: (sc.w - 44) * (0.55 + 0.4 * (((i * 37) % 10) / 10)), height: SCROLL.bar - 3, borderRadius: 2, background: alpha(C.muted, 0.45) }} />
      ))}
      {glow > 0 && (
        <div style={{ position: 'absolute', left: 8, right: 8, top: SCROLL.head - 6, height: L.stackH + (L.full - 1) * L.lh + 6, borderRadius: 12, background: alpha(C.ok, 0.16 * glow), boxShadow: `0 0 ${30 * glow}px ${alpha(C.ok, 0.45 * glow)}` }} />
      )}
      {shown.map((text, i) => {
        const idx = L.n - L.full + i;
        const newest = i === shown.length - 1;
        const a = newest ? sc.newest : 1;
        const hl = hlOf(idx);
        const tone = hl ? TONE[hl.tone] : C.text;
        return (
          <div key={idx} style={{ position: 'absolute', left: 12, right: 12, top: top0 + i * L.lh, height: L.lh, opacity: a, transform: `translateY(${(1 - a) * L.lh * 0.6}px)` }}>
            {hl && hl.amount > 0 && <div style={{ position: 'absolute', inset: '2px 0', borderRadius: 8, background: alpha(tone, 0.2 * hl.amount), borderLeft: `6px solid ${alpha(tone, hl.amount)}` }} />}
            <div style={{ position: 'absolute', left: 12, top: (L.lh - sc.font * 1.2) / 2, fontSize: sc.font, fontWeight: 600, color: hl && hl.amount > 0.5 ? tone : alpha(C.text, 0.85), whiteSpace: 'nowrap' }}>{text}</div>
          </div>
        );
      })}
    </div>
  );
};
