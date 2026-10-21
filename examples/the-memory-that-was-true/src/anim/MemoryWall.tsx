// MemoryWall: the audit of 35 memories as a wall of notes. State in MemoryWall.state.ts.
import React from 'react';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import { Stage, gradientText } from './Stage.tsx';
import type { AnimProps } from './types.ts';
import { CHECKED, CHECK_JSON, COUNT, GREY_KINDS, KINDS, RED_OUTCOMES, RED_TEXTS, REPO_BAND, TREE, WALL, type Kind, slot } from './memory.ts';
import { LIGHT, NEUTRAL, RAISED, Clock, FolderIcon, Hourglass, MONO, Pill, Pin, Stamp, Thread, Tick, Tree, clamp01, edgeColour, mixHex, noteSurface, rowCentres } from './pieces.tsx';
import { HERO_CHECK, QUOTE_LINES, frameState, type MemoryWallProps, type NoteView, type WallFrame } from './MemoryWall.state.ts';

const KIND_COLOUR: Record<Kind, string> = { green: C.ok, red: C.flag, grey: C.muted };

// ---------------------------------------------------------------- the wall

const MiniNote: React.FC<{ n: NoteView; kind: Kind; i: number }> = ({ n, kind, i }) => {
  if (n.opacity <= 0.001) return null;
  const col = mixHex(NEUTRAL, KIND_COLOUR[kind], n.colour);
  const glow = clamp01(n.glow);
  const pulse = clamp01(n.pulse);
  const bars = [0.78 - (i % 3) * 0.12, 0.5 + ((i * 7) % 4) * 0.08];
  return (
    <div
      style={{
        position: 'absolute',
        left: n.x,
        top: n.y,
        width: n.w,
        height: n.h,
        opacity: clamp01(n.opacity),
        borderRadius: 12,
        background: glow > 0 ? mixHex(C.card, RAISED, glow) : C.card,
        border: `4px solid ${glow > 0 ? mixHex(col, LIGHT, glow * 0.6) : col}`,
        boxSizing: 'border-box',
        boxShadow: pulse > 0 ? `0 0 ${34 * pulse}px ${alpha(C.flag, 0.75 * pulse)}` : glow > 0 ? `0 0 ${26 * glow}px ${alpha(C.muted, 0.45 * glow)}` : `0 6px 16px ${alpha(C.bg0, 0.6)}`,
      }}
    >
      <div style={{ position: 'absolute', left: n.w / 2 - 8, top: -8, width: 16, height: 16, borderRadius: 8, background: C.accent }} />
      {bars.map((w, k) => (
        <div key={k} style={{ position: 'absolute', left: 16, top: 30 + k * 24, height: 9, borderRadius: 5, width: (n.w - 32) * w, background: alpha(C.muted, 0.35 + 0.3 * glow) }} />
      ))}
    </div>
  );
};

/** Tally threads: from each checked note down its right gutter to the repo band. */
const Ties: React.FC<{ s: WallFrame }> = ({ s }) => (
  <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} width={960} height={1090}>
    {CHECKED.map((i, k) => {
      const tie = s.ties[k];
      if (!tie || tie.draw <= 0) return null;
      const b = slot(i);
      const row = Math.floor(i / 5);
      const gx = b.x + b.w + WALL.gx / 2 + (row - 3) * 1.5;
      const top = b.y + b.h;
      const sl = clamp01(tie.slack);
      const endY = REPO_BAND.y + 4 - sl * (REPO_BAND.y - top - 70);
      const col = KINDS[i] === 'red' ? mixHex(C.ok, C.flag, sl) : C.ok;
      const d = `M ${b.x + b.w / 2} ${top} Q ${gx} ${top} ${gx} ${top + 14} L ${gx + sl * 18} ${endY}`;
      return (
        <g key={i}>
          <path d={d} fill="none" stroke={col} strokeWidth={4} strokeLinecap="round" pathLength={1} strokeDasharray={`${clamp01(tie.draw)} 1`} opacity={0.95} />
          {tie.draw >= 1 && <circle cx={gx + sl * 18} cy={endY} r={7} fill={sl > 0.5 ? C.bg1 : col} stroke={col} strokeWidth={3} />}
        </g>
      );
    })}
  </svg>
);

const RepoBand: React.FC<{ on: number }> = ({ on }) =>
  on <= 0 ? null : (
    <div
      style={{
        position: 'absolute',
        left: REPO_BAND.x,
        top: REPO_BAND.y,
        width: REPO_BAND.w,
        height: REPO_BAND.h,
        opacity: on,
        borderRadius: 16,
        background: C.pane,
        border: `3px solid ${C.line}`,
        display: 'flex',
        alignItems: 'center',
        gap: 26,
        paddingLeft: 26,
        boxSizing: 'border-box',
        fontFamily,
        fontSize: 28,
        fontWeight: 600,
        color: C.muted,
      }}
    >
      repository
      {[0, 1, 2, 3, 4, 5].map((k) => (
        <div key={k} style={{ width: 70 + (k % 3) * 22, height: 12, borderRadius: 6, background: alpha(C.muted, 0.28) }} />
      ))}
    </div>
  );

// ---------------------------------------------------------------- top band

const Band: React.FC<{ s: WallFrame }> = ({ s }) => {
  const b = s.band;
  const legend: { n: string; word: string; col: string }[] = [
    { n: String(COUNT.green), word: 'green', col: C.ok },
    { n: String(COUNT.red), word: 'red', col: C.flag },
    // From the greys scene on, the grey chip keeps its "25 / 35" form, so it does not jump width in the crossfades.
    { n: b.greyBoost > 0.35 || s.mode === 'green' || s.mode === 'folder' ? `${COUNT.grey} / ${COUNT.all}` : String(COUNT.grey), word: 'grey', col: C.muted },
  ];
  return (
    <>
      {b.counterOn > 0 && (
        <div style={{ position: 'absolute', left: 32, top: 6, display: 'flex', alignItems: 'center', gap: 22, opacity: b.counterOn, fontFamily }}>
          <div style={{ fontSize: 64, fontWeight: 800, ...gradientText }}>{b.counter}</div>
          <div style={{ fontSize: 44, fontWeight: 700, color: C.text }}>{b.counter === 1 ? 'memory' : 'memories'}</div>
        </div>
      )}
      {b.tag > 0 && (
        <div style={{ position: 'absolute', right: 32, top: 20, opacity: clamp01(b.tag * 1.5), transform: `scale(${s.mode === 'fill' ? 0.7 + 0.3 * clamp01(b.tag) : 1})`, transformOrigin: 'right center' }}>
          <Pill color={C.muted} size={30}>
            this project · 11 Sep
          </Pill>
        </div>
      )}
      {b.legend.some((v) => v > 0) && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 14, display: 'flex', justifyContent: 'center', gap: 18 }}>
          {legend.map((l, k) => {
            const on = clamp01(b.legend[k]);
            const boost = k === 2 ? clamp01(b.greyBoost) : 0;
            return (
              <div
                key={l.word}
                style={{
                  opacity: on,
                  transform: `scale(${0.7 + 0.3 * on})`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 22px',
                  borderRadius: 34,
                  border: `3px solid ${l.col}`,
                  background: boost > 0 ? alpha(C.muted, 0.22 * boost) : alpha(C.bg0, 0.85),
                  fontFamily,
                  fontSize: 38,
                  fontWeight: 800,
                  color: C.text,
                  whiteSpace: 'nowrap',
                  boxShadow: boost > 0 ? `0 0 ${30 * boost}px ${alpha(C.muted, 0.5 * boost)}` : undefined,
                }}
              >
                <div style={{ width: 20, height: 20, borderRadius: 10, background: l.col }} />
                {l.n}
                <span style={{ color: l.col, fontWeight: 700 }}>{l.word}</span>
              </div>
            );
          })}
        </div>
      )}
      {b.title > 0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 4, textAlign: 'center', fontFamily, fontSize: 56, fontWeight: 800, color: C.text, opacity: b.title, letterSpacing: 1 }}>
          WHAT EXPIRES ON ITS OWN?
        </div>
      )}
      {b.verdict > 0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 10, textAlign: 'center', fontFamily, fontSize: 76, fontWeight: 800, letterSpacing: 10, opacity: b.verdict, ...gradientText }}>
          VERDICT
        </div>
      )}
    </>
  );
};

// ---------------------------------------------------------------- the hook note, zoomed

const HeroNote: React.FC<{ s: WallFrame }> = ({ s }) => {
  const h = s.hero;
  if (h.opacity <= 0) return null;
  const k = h.w / 740;
  const col = mixHex(edgeColour(h.edge), NEUTRAL, h.neutral);
  return (
    <>
      <div style={{ position: 'absolute', left: h.x, top: h.y, width: h.w, height: h.h, opacity: h.opacity, ...noteSurface(col, Math.max(4, 6 * k), 0.5 * (1 - h.neutral)), boxSizing: 'border-box', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 44 * k, top: 52 * k, opacity: clamp01(h.text), fontFamily, whiteSpace: 'nowrap' }}>
          <div style={{ fontSize: 36 * k, fontWeight: 500, color: C.muted }}>To schedule an article:</div>
          <div style={{ fontSize: 50 * k, fontWeight: 800, color: C.text, marginTop: 14 * k }}>one workflow per article.</div>
        </div>
      </div>
      <Pin x={h.x + h.w / 2} y={h.y + 4} s={Math.max(0.5, 1.3 * k)} on={h.opacity} />
    </>
  );
};

// ---------------------------------------------------------------- scene pieces

const CHECK_TREE = { x: 60, y: 620, w: 840 };

const CheckView: React.FC<{ s: WallFrame }> = ({ s }) => {
  const c = s.check;
  if (c.tree <= 0 && c.draw <= 0) return null;
  const rows = TREE.map((r, i) => ({ opacity: r.old ? 0 : 1, h: r.old ? 0 : 1, scan: c.scan[i], miss: c.miss[i] }));
  const centres = rowCentres(CHECK_TREE.y, rows.map((r) => r.h));
  const x0 = HERO_CHECK.x + HERO_CHECK.w - 24;
  const y0 = HERO_CHECK.y + HERO_CHECK.h - 4;
  return (
    <>
      <Tree x={CHECK_TREE.x} y={CHECK_TREE.y + (1 - c.tree) * 40} w={CHECK_TREE.w} rows={rows} opacity={c.tree} />
      <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} width={960} height={1090}>
        <Thread x0={x0} y0={y0} x1={x0 + 40} y1={centres[1]} draw={c.draw} slack={c.slack} color={C.accentText} />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: 24,
          top: 340,
          width: 790,
          padding: '20px 24px',
          boxSizing: 'border-box',
          borderRadius: 16,
          background: C.pane,
          border: `3px solid ${alpha(C.accentText, 0.7)}`,
          opacity: c.json,
          transform: `translateY(${(1 - c.json) * 20}px)`,
          fontFamily: MONO,
          fontSize: 26,
          lineHeight: 1.5,
          color: C.text,
          whiteSpace: 'pre',
        }}
      >
        <div style={{ position: 'absolute', top: -20, left: 20, background: C.bg1, padding: '0 10px', fontFamily, fontSize: 24, fontWeight: 700, color: C.accentText }}>check</div>
        {CHECK_JSON.map((l) => (
          <div key={l}>{l}</div>
        ))}
      </div>
      {c.noMatch > 0 && (
        <div style={{ position: 'absolute', left: 352, top: centres[1] - 28, opacity: clamp01(c.noMatch * 1.6), transform: `scale(${0.7 + 0.3 * c.noMatch})` }}>
          <Pill color={C.flag} size={34} filled>
            none left
          </Pill>
        </div>
      )}
      {c.legend > 0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 1005, display: 'flex', justifyContent: 'center', gap: 34, opacity: c.legend, fontFamily, fontSize: 38, fontWeight: 700 }}>
          <span style={{ color: C.muted }}>
            file there → <span style={{ color: C.ok }}>green</span>
          </span>
          <span style={{ color: C.muted }}>
            gone → <span style={{ color: C.flag }}>red</span>
          </span>
        </div>
      )}
    </>
  );
};

const SplitView: React.FC<{ s: WallFrame }> = ({ s }) => {
  const p = s.split;
  if (p.left <= 0 && p.right <= 0 && s.band.title <= 0) return null;
  const rightEdge = edgeColour(p.edge);
  const card = (x: number, on: number, border: string, label: string, text: string, children?: React.ReactNode) => (
    <div style={{ position: 'absolute', left: x, top: 150 + (1 - on) * 40, width: 440, height: 380, opacity: on, ...noteSurface(border, 6), padding: '56px 32px 0', boxSizing: 'border-box', fontFamily }}>
      <div style={{ fontSize: 28, fontWeight: 600, color: C.muted }}>{label}</div>
      <div style={{ fontSize: 50, fontWeight: 800, color: C.text, marginTop: 12, lineHeight: 1.12 }}>{text}</div>
      <Pin x={220} y={4} s={1.1} on={1} />
      {children}
    </div>
  );
  return (
    <>
      {card(
        20,
        p.left,
        mixHex(NEUTRAL, C.muted, 0.6),
        'preference',
        'avoid sweeping claims',
        p.noCheck > 0 ? (
          <div style={{ position: 'absolute', left: 32, bottom: 26, opacity: clamp01(p.noCheck * 1.6) }}>
            <Pill color={C.muted} size={28}>
              no check needed
            </Pill>
          </div>
        ) : null,
      )}
      {p.bubble > 0 && (
        <div style={{ position: 'absolute', left: 50, top: 590, opacity: clamp01(p.bubble * 1.6), transform: `scale(${0.7 + 0.3 * clamp01(p.bubble)})`, transformOrigin: '30% 0' }}>
          <div style={{ position: 'absolute', left: 80, top: -22, width: 0, height: 0, borderLeft: '20px solid transparent', borderRight: '20px solid transparent', borderBottom: `24px solid ${C.muted}` }} />
          <div style={{ padding: '20px 30px', borderRadius: 28, background: C.bg1, border: `3px solid ${C.muted}`, fontFamily, fontSize: 38, fontWeight: 700, color: C.text, whiteSpace: 'nowrap' }}>
            only when I say so
          </div>
        </div>
      )}
      {card(
        500,
        p.right,
        rightEdge,
        'fact about the system',
        'one workflow per article',
        p.tick > 0 ? (
          <div
            style={{
              position: 'absolute',
              right: -26,
              top: -30,
              width: 92,
              height: 92,
              borderRadius: 46,
              background: C.bg1,
              border: `5px solid ${C.ok}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: clamp01(p.tick * 1.6),
              transform: `scale(${1.5 - 0.5 * clamp01(p.tick)})`,
            }}
          >
            <Tick size={56} color={C.ok} />
          </div>
        ) : null,
      )}
      {p.right > 0 && (
        <>
          <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} width={960} height={1090}>
            <Thread x0={720} y0={526} x1={720} y1={750} draw={p.tie} slack={p.edge} color={C.ok} />
          </svg>
          <div style={{ position: 'absolute', left: 540, top: 740, width: 400, padding: '16px 22px', boxSizing: 'border-box', borderRadius: 16, background: C.pane, border: `3px solid ${C.line}`, opacity: p.right, fontFamily: MONO, fontSize: 25, color: C.text }}>
            <div style={{ color: C.muted }}>workflows/</div>
            <div style={{ paddingLeft: 26, opacity: 1 - 0.85 * clamp01(p.edge), textDecoration: p.edge > 0.6 ? 'line-through' : undefined }}>scheduled-publish-…</div>
          </div>
          <div style={{ position: 'absolute', left: 830, top: 580, opacity: p.right }}>
            <Clock size={84} color={C.muted} angle={p.clock} />
          </div>
        </>
      )}
      {s.band.answer > 0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 930, textAlign: 'center', opacity: s.band.answer, transform: `translateY(${(1 - s.band.answer) * 20}px)`, fontFamily }}>
          <div style={{ fontSize: 34, fontWeight: 600, color: C.muted }}>you can only check</div>
          <div style={{ fontSize: 58, fontWeight: 800, color: C.ok, marginTop: 6 }}>facts about the system</div>
        </div>
      )}
    </>
  );
};

const RedsView: React.FC<{ s: WallFrame }> = ({ s }) => {
  const r = s.reds;
  if (r.boxes.every((b) => b.opacity <= 0)) return null;
  return (
    <>
      {r.boxes.map((b, k) => {
        const big = clamp01((b.w - 160) / 130);
        return (
          <div key={k} style={{ position: 'absolute', left: b.x, top: b.y, width: b.w, height: b.h, opacity: b.opacity }}>
            <div style={{ position: 'absolute', inset: 0, ...noteSurface(C.flag, 4 + 2 * big, 0.4), boxSizing: 'border-box' }} />
            <Pin x={b.w / 2} y={4} s={0.6 + 0.5 * big} on={1} />
            <div style={{ position: 'absolute', left: 22, right: 18, top: 44, opacity: r.text, fontFamily, fontSize: 37, fontWeight: 800, color: C.text, lineHeight: 1.16 }}>{RED_TEXTS[k]}</div>
            {r.ticks[k] > 0 && (
              <div style={{ position: 'absolute', left: 20, top: 222, display: 'flex', alignItems: 'center', gap: 8, fontFamily, fontSize: 25, fontWeight: 700, color: C.ok, opacity: clamp01(r.ticks[k] * 2) }}>
                <Tick size={34} color={C.ok} draw={r.ticks[k]} />
                checked by hand
              </div>
            )}
            <Stamp text={['TRUE WHEN', 'WRITTEN']} color={C.ok} on={r.stamps[k]} x={b.w / 2} y={312} rot={-6} size={32} />
            {r.outcomes[k] > 0 && (
              <div style={{ position: 'absolute', left: 0, right: 0, top: 376, textAlign: 'center', fontFamily, fontSize: 28, fontWeight: 700, color: C.flag, opacity: r.outcomes[k] }}>{RED_OUTCOMES[k]}</div>
            )}
            {r.glass[k] > 0 && (
              <div style={{ position: 'absolute', left: b.w / 2, top: 412, transform: `translateX(-50%) scale(${1.12 - 0.12 * clamp01(r.glass[k])})`, opacity: clamp01(r.glass[k] * 1.6) }}>
                <Pill color={C.accentText} size={24} filled>
                  <Hourglass size={32} color={C.accentText} flow={r.flow} />
                  IN PROGRESS
                </Pill>
              </div>
            )}
          </div>
        );
      })}
      {r.stable > 0 && (
        <div style={{ position: 'absolute', left: 200, top: 700 + (1 - r.stable) * 40, width: 560, height: 230, opacity: r.stable, ...noteSurface(C.ok, 5), padding: '52px 36px 0', boxSizing: 'border-box', fontFamily }}>
          <Pin x={280} y={4} s={1} on={1} />
          <div style={{ fontSize: 30, fontWeight: 600, color: C.muted }}>a stable fact</div>
          <div style={{ fontSize: 50, fontWeight: 800, color: C.ok, marginTop: 8 }}>ages well</div>
          <div style={{ position: 'absolute', right: 30, bottom: 28, fontSize: 26, fontWeight: 600, color: C.muted }}>no hourglass</div>
        </div>
      )}
    </>
  );
};

const GREY_TAG_AT = [
  { x: 250, y: 236, r: -4 },
  { x: 690, y: 400, r: 3 },
  { x: 300, y: 690, r: -3 },
];

const GreysView: React.FC<{ s: WallFrame }> = ({ s }) => (
  <>
    {GREY_KINDS.map((g, k) =>
      s.greys.tags[k] > 0 ? (
        <div key={g} style={{ position: 'absolute', left: GREY_TAG_AT[k].x, top: GREY_TAG_AT[k].y, transform: `translate(-50%, -50%) rotate(${GREY_TAG_AT[k].r}deg) scale(${1.3 - 0.3 * clamp01(s.greys.tags[k])})`, opacity: clamp01(s.greys.tags[k] * 1.6) }}>
          <Pill color={LIGHT} size={44} style={{ background: C.bg1, boxShadow: `0 10px 30px ${alpha(C.bg0, 0.8)}` }}>
            {g}
          </Pill>
        </div>
      ) : null,
    )}
    <Stamp text="NOT A FLAW" color={C.ok} on={s.greys.stamp} x={500} y={545} rot={-5} size={86} />
  </>
);

const GreenView: React.FC<{ s: WallFrame }> = ({ s }) => {
  const g = s.green;
  if (g.open <= 0) return null;
  const c = g.content;
  const LINE0 = 120;
  const ROW = 56;
  const lit = clamp01(g.spot);
  return (
    <>
      <div style={{ position: 'absolute', left: g.x, top: g.y, width: g.w, height: g.h, ...noteSurface(C.ok, 4 + 2 * g.open, 0.5), boxSizing: 'border-box', overflow: 'hidden' }}>
        <div style={{ opacity: c, fontFamily }}>
          <div style={{ position: 'absolute', left: 36, top: 36, fontSize: 32, fontWeight: 600, color: C.muted }}>a memory about publishing automation</div>
          {[0, 1, 2, 3, 4, 5, 6].map((k) => (
            <div key={k} style={{ position: 'absolute', left: 60, top: LINE0 + 20 + k * ROW, height: ROW, display: 'flex', alignItems: 'center', gap: 16, opacity: g.lines[k] }}>
              <Tick size={38} color={C.ok} draw={g.lines[k]} />
              <div style={{ fontFamily: MONO, fontSize: 28, color: C.text }}>file_exists</div>
              <div style={{ width: 200 + ((k * 53) % 180), height: 14, borderRadius: 7, background: alpha(C.muted, 0.35) }} />
            </div>
          ))}
          {g.date > 0 && (
            <div style={{ position: 'absolute', left: 40, right: 40, top: LINE0 + 40 + 7 * ROW, height: 74, display: 'flex', alignItems: 'center', gap: 18, paddingLeft: 22, borderRadius: 14, border: `3px dashed ${alpha(C.flag, 0.4 + 0.6 * lit)}`, opacity: g.date }}>
              <div style={{ fontSize: 34, fontWeight: 700, color: C.flag }}>credential expires on</div>
              <div style={{ width: 150, height: 16, borderRadius: 8, background: alpha(C.flag, 0.45) }} />
            </div>
          )}
        </div>
        {/* threads: each file line tied to the repo rail on the left */}
        <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: c }} width={880} height={660}>
          {[0, 1, 2, 3, 4, 5, 6].map((k) => (
            <path key={k} d={`M 0 ${LINE0 + 20 + k * ROW + ROW / 2} H 52`} stroke={C.ok} strokeWidth={5} pathLength={1} strokeDasharray={`${clamp01(g.lines[k])} 1`} />
          ))}
        </svg>
        {/* the spotlight: what the check covers */}
        {g.chip > 0 && (
          <div style={{ position: 'absolute', right: 40, top: LINE0 + 40 + 7 * ROW + 96, opacity: clamp01(g.chip * 1.6), transform: `scale(${1.3 - 0.3 * clamp01(g.chip)})` }}>
            <Pill color={C.flag} size={34} filled>
              a month past
            </Pill>
          </div>
        )}
        {lit > 0 && (
          <div style={{ position: 'absolute', left: 18, top: LINE0 + 6, width: 660, height: 7 * ROW + 28, borderRadius: 16, border: `4px solid ${alpha(C.ok, lit)}`, boxShadow: `0 0 40px ${alpha(C.ok, 0.35 * lit)}` }}>
            <div style={{ position: 'absolute', right: -180, top: 8, fontFamily, fontSize: 30, fontWeight: 800, color: C.ok, opacity: lit }}>checked ✓</div>
          </div>
        )}
      </div>
      {g.words > 0 && (
        <div style={{ position: 'absolute', left: 20, right: 20, top: 800, textAlign: 'center', fontFamily, fontSize: 62, fontWeight: 800, lineHeight: 1.2, color: C.text }}>
          {QUOTE_LINES.map((line, li) => {
            const before = QUOTE_LINES.slice(0, li).flat().length;
            const em = li === 1;
            return (
              <div key={li}>
                <span style={{ position: 'relative', display: 'inline-block', ...(em ? { color: C.accentText } : {}) }}>
                  {line.map((w, k) => (
                    <span key={k} style={{ opacity: before + k < g.words ? 1 : 0 }}>
                      {k > 0 ? ' ' : ''}
                      {w}
                    </span>
                  ))}
                  {em && <span style={{ position: 'absolute', left: 0, right: 14, bottom: 2, height: 7, borderRadius: 4, background: C.accentText, transform: `scaleX(${g.emphasis})`, transformOrigin: 'left' }} />}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

const FolderView: React.FC<{ s: WallFrame }> = ({ s }) =>
  s.folder.icon <= 0 ? null : (
    <>
      <div style={{ position: 'absolute', left: 480, top: 470, transform: `translate(-50%, -50%) scale(${0.5 + 0.5 * clamp01(s.folder.icon)})`, opacity: clamp01(s.folder.icon * 1.6), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <FolderIcon size={420} color={C.accentText} />
        <div style={{ fontFamily, fontSize: 52, fontWeight: 800, color: C.text }}>my folder</div>
      </div>
      {s.folder.tag > 0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 790, display: 'flex', justifyContent: 'center', opacity: clamp01(s.folder.tag * 1.6), transform: `scale(${1.2 - 0.2 * clamp01(s.folder.tag)})` }}>
          <Pill color={C.accentText} size={50} filled>
            1 person · 1 project
          </Pill>
        </div>
      )}
    </>
  );

const VerdictView: React.FC<{ s: WallFrame }> = ({ s }) => {
  const v = s.verdict;
  if (v.tool <= 0) return null;
  return (
    <>
      <div style={{ position: 'absolute', left: 150, top: 200 + (1 - v.tool) * 30, width: 660, height: 440, opacity: v.tool, borderRadius: 24, background: C.pane, border: `3px solid ${C.line}`, fontFamily }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 30, textAlign: 'center', fontSize: 40, fontWeight: 800, color: C.text }}>the memory checker</div>
        {/* a note, a thread, a file: the tool in one picture */}
        <div style={{ position: 'absolute', left: 90, top: 120, width: 200, height: 130, ...noteSurface(C.ok, 4), boxSizing: 'border-box' }}>
          <div style={{ position: 'absolute', left: 20, top: 34, width: 140, height: 10, borderRadius: 5, background: alpha(C.muted, 0.4) }} />
          <div style={{ position: 'absolute', left: 20, top: 62, width: 100, height: 10, borderRadius: 5, background: alpha(C.muted, 0.4) }} />
        </div>
        <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} width={660} height={440}>
          <path d="M 290 185 C 360 185, 360 330, 430 330" fill="none" stroke={C.ok} strokeWidth={5} />
          <circle cx={430} cy={330} r={8} fill={C.ok} />
        </svg>
        <div style={{ position: 'absolute', left: 440, top: 296, width: 170, height: 70, borderRadius: 12, background: C.card, border: `3px solid ${C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontSize: 24, color: C.muted }}>
          file.yml
        </div>
      </div>
      <Stamp text="CLUMSY" color={LIGHT} on={v.stamp} x={480} y={500} rot={-8} size={120} />
      {v.line > 0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 760, textAlign: 'center', fontFamily, opacity: v.line, transform: `translateY(${(1 - v.line) * 20}px)` }}>
          <div style={{ fontSize: 46, fontWeight: 800, color: C.text }}>by hand: same cost,</div>
          <div style={{ fontSize: 46, fontWeight: 800, color: C.text, marginTop: 6 }}>same number</div>
        </div>
      )}
    </>
  );
};

// ---------------------------------------------------------------- the component

export const MemoryWall: React.FC<AnimProps & MemoryWallProps> = ({ t, beats, dur, vertical, ...props }) => {
  const s = frameState(props, t, beats, dur);
  const cx = 480;
  const cy = 470;
  return (
    <Stage vertical={vertical} fill>
      <Band s={s} />
      {s.wall.opacity > 0 && (
        <div style={{ position: 'absolute', left: 0, top: 0, width: 960, height: 1090, opacity: s.wall.opacity, transform: `scale(${s.wall.scale})`, transformOrigin: `${cx}px ${cy}px` }}>
          <RepoBand on={s.repo} />
          <Ties s={s} />
          {s.notes.map((n, i) => (
            <MiniNote key={i} n={n} kind={KINDS[i]} i={i} />
          ))}
        </div>
      )}
      <HeroNote s={s} />
      <CheckView s={s} />
      <SplitView s={s} />
      <RedsView s={s} />
      <GreysView s={s} />
      <GreenView s={s} />
      <FolderView s={s} />
      <VerdictView s={s} />
    </Stage>
  );
};
