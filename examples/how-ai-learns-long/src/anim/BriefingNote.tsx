// The prompt: a note on the robot's desk. See BriefingNote.state.ts.
import React from 'react';
import { Img, staticFile } from 'remotion';
import { C, alpha } from '../brand.ts';
import type { AnimProps } from './types.ts';
import { Canvas } from './Canvas.tsx';
import { fitInto, stageBox } from './canvas.ts';
import { blinkAt, loopTime } from './memory.ts';
import { Clock, Desk, Floor, Robot, glow } from './office.tsx';
import { Bubble, ChatWindow, Divider } from './chat.tsx';
import { AppPanel, NoteSheet, OpenSign, ProductCard, ShopCounter, ShoeBox, Sun, Tag, textW, type NoteRow } from './note.tsx';
import {
  BOXES,
  CARDS,
  CHAT_A,
  CHAT_Q,
  EXAMPLE,
  EXAMPLE_HEAD,
  NOTE_TAG,
  PANELS,
  ROOM_CHAT,
  ROOM_LABEL,
  TONE,
  WINDOW_LABEL,
  frameState,
  type BriefingNoteProps,
} from './BriefingNote.state.ts';

export { frameState };
export type { BriefingNoteProps };

/** Landscape layout (frame pixels); the vertical cut shows the same picture scaled into its stage. */
const L = {
  floor: 830,
  desk: { x: 290, y: 650, w: 1000 },
  robot: { x: 1520, y: 830 - 0.8 * 454, s: 0.8 },
  note: { x: 350, y: 205, w: 860, h: 425 },
  tag: { x: 780, y: 166 },
  // line 5: the context window around what the AI reads, shorter than the grown scroll (its lower
  // part sticks out below the frame); once the note fits it lifts into the frame's top part
  win: { x: 320, y: 128, w: 920, h: 580, noteTop: 172, noteBottom: 432 },
  counters: { left: { x: 190, cx: 520 }, right: { x: 1090, cx: 1400 }, y: 610, w: 640, h: 210 },
  panels: { xs: [180, 690, 1200], y: 200, w: 470, h: 540 },
  edit: { note: { x: 170, y: 220 }, chat: { x: 1090, y: 170, w: 670, h: 630 } },
  stacks: [
    { x: 170, n: 7 },
    { x: 1210, n: 7 },
  ],
};

/** Deterministic pseudo-random in [0, 1). */
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const baseRows = (lit: number[]): NoteRow[] => [
  { text: 'Before every chat:', size: 30, color: C.accent },
  { text: '', size: 20 },
  { text: '', size: 38, policy: true, lit: lit[0] },
  { text: TONE, size: 38, lit: lit[1] },
  { text: EXAMPLE_HEAD, size: 32, lit: lit[2] },
  { text: EXAMPLE, size: 32, lit: lit[2] },
];

export const BriefingNote: React.FC<AnimProps & BriefingNoteProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const tm = loopTime(p.t, p.dur);
  const blink = blinkAt(tm, 2.9);

  // ---- the desk scene (lines 0, 4, 5, 6) ----
  const N = L.note;
  const Wn = L.win;
  const grow = s.scroll;
  const win = s.window;
  // the note lifts into the frame only once it fits (line 5, "fits"), and back down as the frame lifts
  const into = win * s.fit;
  const noteTop = N.y - 55 * grow + (Wn.noteTop - N.y) * into;
  const noteBottom = N.y + N.h + (L.floor - 30 - (N.y + N.h)) * grow + (Wn.noteBottom - (N.y + N.h)) * into;
  const winBottom = Wn.y + Wn.h;
  // Grey rows pushed in above the policy line as the note grows: the line sinks towards the floor.
  const extra = 11 * s.sink;
  const whole = Math.floor(extra);
  const deskRows: NoteRow[] = [
    { text: 'Before every chat:', size: 30, color: C.accent },
    ...Array.from({ length: whole + 1 }, (_, i): NoteRow => ({ text: '', size: 26, bars: true, opacity: i < whole ? 1 : extra - whole })),
    { text: '', size: 38, policy: true, opacity: 1 - 0.65 * s.dim, lit: 0.9 * s.ring },
    { text: TONE, size: 38 },
    ...Array.from({ length: 12 }, (_, i): NoteRow => ({ text: '', size: 26, bars: true })),
  ];
  // Once grown, the note keeps its grey rows as it rolls back up (no jump back to the first rows).
  const rowsDesk = grow > 0.001 || s.fit > 0 ? deskRows : baseRows(s.note.rows);
  // The policy line's top, for the red ring when it is buried.
  const policyY = noteTop + Math.max(18, N.w * 0.05) * 1.4 + 30 * 1.55 + (whole + 1) * 26 * 1.55 - (1 - (extra - whole)) * 0;

  const cards = Math.round(s.cards);
  const boxes = s.boxes;

  const deskScene = (
    <g opacity={s.desk}>
      {/* product cards and shoe boxes pile up behind the desk (line 5) */}
      {Array.from({ length: cards }, (_, i) => {
        const side = i % 3 === 0 ? 0 : 1;
        const x = side === 0 ? 175 + rnd(i) * 170 : 1180 + rnd(i) * 570;
        const depth = rnd(i + 999);
        const yTop = side === 0 ? 170 : 160;
        const y = L.floor - 30 - depth * (L.floor - 30 - yTop) * (0.55 + 0.45 * rnd(i + 77));
        return <ProductCard key={i} x={x} y={y} w={56} rot={(rnd(i + 5) - 0.5) * 50} tone={i} opacity={Math.min(1, s.cards - i)} />;
      })}
      {L.stacks.map((st, k) =>
        Array.from({ length: st.n }, (_, i) => {
          const idx = i * 2 + k;
          const f = Math.min(1, Math.max(0, boxes - idx));
          if (f <= 0) return null;
          const w = 150;
          const y = L.floor - i * (w * 0.42 + 4) - (1 - f) * 260;
          return <ShoeBox key={`${k}-${i}`} x={st.x + (i % 2) * 8} y={y} w={w} opacity={Math.min(1, f * 2)} tone={idx} />;
        }),
      )}
      <Floor y={L.floor} x={160} w={1600} />
      <Robot x={L.robot.x} y={L.robot.y} s={L.robot.s} blink={blink} armUp={s.alarm} shelf={0.6} />
      <g opacity={1 - win}>
        <Desk x={L.desk.x} y={L.desk.y} w={L.desk.w} />
      </g>
      {win > 0.001 && (
        // line 5: the context window, everything the AI reads at once; the note fills its top part
        <g opacity={win}>
          <rect x={Wn.x} y={Wn.y} width={Wn.w} height={Wn.h} rx={22} fill={alpha(C.accent, 0.07)} />
          {/* where the note ends and the room begins (once the note fits) */}
          <line x1={Wn.x + 24} y1={Wn.noteBottom + 18} x2={Wn.x + Wn.w - 24} y2={Wn.noteBottom + 18} stroke={alpha(C.muted, 0.55)} strokeWidth={3} strokeDasharray="10 10" opacity={s.fit} />
          <Tag x={Wn.x + Wn.w / 2} y={Wn.noteBottom + 66} text={ROOM_LABEL} size={30} color={C.ok} opacity={s.room} />
          <Bubble x={Wn.x + Wn.w - 60} y={Wn.noteBottom + 106} side="user" text={ROOM_CHAT[0]} size={26} maxW={420} opacity={s.bubbles[0]} />
          <Bubble x={Wn.x + 60} y={Wn.noteBottom + 184} side="ai" text={ROOM_CHAT[1]} size={26} maxW={420} opacity={s.bubbles[1]} />
        </g>
      )}
      <g transform={`translate(${-950 * (1 - s.note.slide)} 0) rotate(${-8 * (1 - s.note.slide)} ${N.x + N.w / 2} ${N.y + N.h})`}>
        <NoteSheet
          x={N.x}
          y={noteTop}
          w={N.w}
          h={noteBottom - noteTop}
          rows={rowsDesk}
          opacity={s.note.slide}
          strike={s.strike}
          write={s.write}
          clipId="bn-scroll"
        />
        {grow > 0.01 && (
          // the curl at the bottom: the scroll spilling over the desk to the floor
          <g opacity={grow}>
            <rect x={N.x - 6} y={noteBottom - 16} width={N.w + 12} height={44} rx={22} fill={alpha(C.text, 0.92)} stroke={alpha(C.accentText, 0.6)} strokeWidth={4} />
            <ellipse cx={N.x - 2} cy={noteBottom + 6} rx={12} ry={20} fill={C.muted} />
            <ellipse cx={N.x + N.w + 2} cy={noteBottom + 6} rx={12} ry={20} fill={C.muted} />
          </g>
        )}
        {s.ring > 0.01 && (
          <ellipse cx={N.x + N.w / 2} cy={policyY + 26} rx={N.w * 0.5} ry={44} fill="none" stroke={C.marker} strokeWidth={6} opacity={s.ring} style={glow(C.marker, s.ring)} />
        )}
      </g>
      {win > 0.001 && (
        // line 5: the frame's edge drawn over the scroll; what hangs below it does not fit, dimmed
        <g opacity={win}>
          {s.outside > 0.001 && (
            <rect x={N.x - 16} y={winBottom + 3} width={N.w + 32} height={Math.max(0, noteBottom + 26 - winBottom)} fill={alpha(C.bg0, 0.7)} opacity={s.outside} />
          )}
          <rect x={Wn.x} y={Wn.y} width={Wn.w} height={Wn.h} rx={22} fill="none" stroke={C.accentText} strokeWidth={5} strokeDasharray="22 14" />
          <Tag x={Wn.x + 40 + (textW(WINDOW_LABEL, 30) + 36) / 2} y={Wn.y} text={WINDOW_LABEL} size={30} />
        </g>
      )}
      <Tag x={L.tag.x} y={L.tag.y} text={NOTE_TAG} size={34} opacity={s.note.tag} />
      {s.note.feed > 0 && (
        // before every chat, the note goes to the AI
        <g opacity={Math.max(0, 1 - s.scroll - s.fit)}>
          <path d="M 1225 420 Q 1330 300 1440 440" fill="none" stroke={C.accentText} strokeWidth={7} strokeLinecap="round" strokeDasharray="16 14" opacity={Math.min(1, s.note.feed * 3)} />
          <path d={`M 1225 420 Q 1330 300 1440 440`} fill="none" stroke={C.bg0} strokeWidth={11} pathLength={1} strokeDasharray={`0 ${s.note.feed} 1 0`} />
          {s.note.feed > 0.95 && <path d="M 1416 440 L 1446 452 L 1446 420" fill="none" stroke={C.accentText} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />}
        </g>
      )}
    </g>
  );

  // ---- line 1: the shop assistant at opening time, the robot mirroring ----
  const C1 = L.counters;
  const pop = s.assistant;
  const handNote = (x: number, y: number, key: string, h = 170) => (
    <NoteSheet key={key} x={x} y={y} w={210} h={h} rows={[0, 1, 2, 3].map(() => ({ text: '', size: 22, bars: true }))} read={s.read} pin={false} clipId={key} />
  );
  const countersScene = (
    <g opacity={s.counters}>
      {/* the window with the sun rising, the clock at nine, the sign turning to OPEN */}
      <g>
        <defs>
          <clipPath id="bn-window">
            <rect x={700} y={170} width={230} height={190} rx={12} />
          </clipPath>
        </defs>
        <rect x={700} y={170} width={230} height={190} rx={12} fill={alpha(C.accent, 0.12)} stroke={alpha(C.accentText, 0.6)} strokeWidth={5} />
        <g clipPath="url(#bn-window)">
          <Sun x={815} y={400} r={46} rise={s.sun} />
        </g>
        <line x1={815} y1={170} x2={815} y2={360} stroke={alpha(C.accentText, 0.6)} strokeWidth={4} />
        <line x1={700} y1={265} x2={930} y2={265} stroke={alpha(C.accentText, 0.6)} strokeWidth={4} />
      </g>
      <OpenSign x={258} y={210} w={190} flip={s.open} />
      <Clock x={1030} y={235} r={56} hour={270} minute={0} />
      {/* the assistant rises behind the counter */}
      <defs>
        <clipPath id="bn-behind-left">
          <rect x={150} y={140} width={760} height={C1.y - 140 + 4} />
        </clipPath>
        <clipPath id="bn-behind-right">
          <rect x={1050} y={140} width={720} height={C1.y - 140 + 4} />
        </clipPath>
      </defs>
      <g clipPath="url(#bn-behind-left)">
        <g transform={`translate(0 ${260 * (1 - pop)})`}>
          {/* the new employee: Nadia, from the cast (public/cast), reading the morning note */}
          <circle cx={C1.left.cx} cy={430} r={185} fill={alpha(C.accent, 0.14)} />
          <foreignObject x={C1.left.cx - 180} y={256} width={360} height={354}>
            <Img src={staticFile('cast/nadia-neutral.png')} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
          </foreignObject>
          {handNote(C1.left.cx - 105, 512, 'bn-hand-l', 130)}
          <circle cx={C1.left.cx - 108} cy={578} r={18} fill={alpha(C.text, 0.9)} stroke={C.accentText} strokeWidth={4} />
          <circle cx={C1.left.cx + 108} cy={578} r={18} fill={alpha(C.text, 0.9)} stroke={C.accentText} strokeWidth={4} />
        </g>
      </g>
      <ShopCounter x={C1.left.x} y={C1.y} w={C1.w} h={C1.h} />
      <line x1={960} y1={180} x2={960} y2={800} stroke={alpha(C.muted, 0.35)} strokeWidth={4} strokeDasharray="14 12" />
      <g clipPath="url(#bn-behind-right)">
        <Robot x={C1.right.cx} y={260} s={0.75} blink={blink} shelf={0.6} />
        {handNote(C1.right.cx - 105, 440, 'bn-hand-r')}
      </g>
      <ShopCounter x={C1.right.x} y={C1.y} w={C1.w} h={C1.h} />
    </g>
  );

  // ---- line 2: three app panels, the same note in each ----
  const P = L.panels;
  const icons = ['gear', 'folder', 'bot'] as const;
  const panelsScene = (
    <g opacity={s.panels}>
      {PANELS.map((title, i) => {
        const st = s.panel[i];
        const x = P.xs[i];
        const sc = 0.85 + 0.15 * st.pop;
        return (
          <g key={title} transform={`translate(${x + P.w / 2} ${P.y + P.h / 2}) scale(${sc}) translate(${-(x + P.w / 2)} ${-(P.y + P.h / 2)})`} opacity={st.pop}>
            <AppPanel x={x} y={P.y} w={P.w} h={P.h} title={title} size={38} icon={icons[i]} lit={st.paste * 0.4} />
            <g transform={`translate(0 ${-50 * (1 - st.paste)})`}>
              <NoteSheet
                x={x + 30}
                y={P.y + 120}
                w={P.w - 60}
                h={P.h - 160}
                opacity={st.paste}
                rot={i === 1 ? 1.5 : -1.5}
                rows={[
                  { text: 'Before every chat:', size: 28, color: C.accent },
                  { text: '', size: 34, policy: true, short: true },
                  { text: 'friendly, short', size: 34 },
                  { text: '', size: 24, bars: true },
                  { text: '', size: 24, bars: true },
                  { text: '', size: 24, bars: true },
                ]}
              />
            </g>
          </g>
        );
      })}
    </g>
  );

  // ---- line 3: edit one line; the next chat knows ----
  const E = L.edit;
  const W = E.chat;
  const editScene = (
    <g opacity={s.edit}>
      <NoteSheet x={E.note.x} y={E.note.y} w={N.w} h={N.h} rows={baseRows([s.strike > 0 ? 0.6 * (1 - s.chat) + 0.4 : 0, 0, 0])} strike={s.strike} write={s.write} />
      <g transform={`translate(${80 * (1 - s.chat)} 0)`} opacity={s.chat}>
        <ChatWindow x={W.x} y={W.y} w={W.w} h={W.h} title="Shoe shop" />
        <Divider x={W.x + 30} y={W.y + 120} w={W.w - 60} text="new chat" size={28} />
        <Bubble x={W.x + W.w - 30} y={W.y + 170} side="user" text={CHAT_Q} size={32} maxW={500} />
        <Bubble x={W.x + 30} y={W.y + 330} side="ai" text={CHAT_A} size={32} maxW={640} typed={s.answer} hot="14" hotColor={C.ok} lit={s.tick} tick={s.tick > 0.5} />
      </g>
    </g>
  );

  const picture = (
    <g>
      {deskScene}
      {s.counters > 0.001 && countersScene}
      {s.panels > 0.001 && panelsScene}
      {s.edit > 0.001 && editScene}
    </g>
  );
  return (
    <Canvas vertical={p.vertical}>
      {p.vertical ? <g transform={fitInto(stageBox(false), stageBox(true)).transform}>{picture}</g> : picture}
    </Canvas>
  );
};
