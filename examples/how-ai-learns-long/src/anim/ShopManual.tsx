// The shop manual: chapter 3, "looking it up (the manual)". See ShopManual.state.ts for the beats.
// Laid out for landscape (1920x1080); the vertical cut fits the same drawing into its stage.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { lerp } from './memory.ts';
import { Canvas } from './Canvas.tsx';
import { fitInto, stageBox } from './canvas.ts';
import { Floor, Lens, Page, Robot, robotHand } from './office.tsx';
import { Bubble, bubbleSize } from './chat.tsx';
import { Binder, KnowBook, NoteCard, OpenBinder, Paragraphs, Pdf, ShoeBox, Snippet, UploadArrow, binderPages, CHAR } from './recipe.tsx';
import { GOOD_ANSWER, MANUAL_LABEL, NOTE_LABEL, QUESTION, TABS, WRONG_ANSWER, frameState, type ShopManualProps } from './ShopManual.state.ts';

export { frameState };
export type { ShopManualProps };

/** Landscape layout (frame pixels). */
const R = { x: 1590, y: 392, s: 0.8 };
const FLOOR_Y = 790;
const BIG = { x: 230, y: 362, w: 1000, h: 420 };
const BUBBLE = 36;

/** Lines of text on a binder page, centred on the page box. */
const PageText: React.FC<{ box: { x: number; y: number; w: number; h: number }; rows: string[]; size: number; hot?: number; hotColor?: string; dy?: number; opacity?: number }> = ({
  box,
  rows,
  size,
  hot = -1,
  hotColor = C.ok,
  dy = 0,
  opacity = 1,
}) => {
  if (opacity <= 0) return null;
  const lh = size * 1.32;
  const top = box.y + (box.h - rows.length * lh) / 2 + size * 0.95 + dy;
  return (
    <g opacity={Math.min(1, Math.max(0, opacity))}>
      {rows.map((r, i) => (
        <text key={i} x={box.x + box.w * 0.1} y={top + i * lh} fontSize={size} fontWeight={800} fill={i === hot ? hotColor : alpha(C.bg0, 0.9)}>
          {r}
        </text>
      ))}
    </g>
  );
};

/** A small chat chip: a speech-bubble icon and "chat k", turning teal with a tick when read. */
const ChatChip: React.FC<{ x: number; y: number; w: number; k: number; lit: number }> = ({ x, y, w, k, lit }) => {
  const h = 64;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={alpha(C.ok, 0.08 + 0.3 * lit)} stroke={alpha(lit > 0.5 ? C.ok : C.muted, 0.5 + 0.5 * lit)} strokeWidth={3} />
      <path d={`M ${x + 24} ${y + 18} h 34 a 6 6 0 0 1 6 6 v 14 a 6 6 0 0 1 -6 6 h -20 l -10 8 v -8 h -4 a 6 6 0 0 1 -6 -6 v -14 a 6 6 0 0 1 6 -6 Z`} fill={lit > 0.5 ? C.ok : alpha(C.text, 0.85)} />
      {lit > 0 && (
        <path d={`M ${x + 31} ${y + 31} l 7 7 l 14 -14`} fill="none" stroke={C.bg0} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${lit} 1`} />
      )}
      <text x={x + 80} y={y + h / 2 + 11} fontSize={30} fontWeight={800} fill={C.text}>
        {`chat ${k}`}
      </text>
    </g>
  );
};

/** A red underline drawn under a bubble's text, left to right. */
const Underline: React.FC<{ x: number; y: number; w: number; p: number }> = ({ x, y, w, p }) =>
  p > 0 ? <path d={`M ${x} ${y} q ${w * 0.25} 10 ${w * 0.5} 0 t ${w * 0.5} 0`} fill="none" stroke={C.marker} strokeWidth={7} strokeLinecap="round" pathLength={1} strokeDasharray={`${p} 1`} /> : null;

export const ShopManual: React.FC<AnimProps & ShopManualProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const P = s.panels;
  const big = binderPages(BIG.x, BIG.y, BIG.w, BIG.h);
  const hand = robotHand(R.x, R.y, R.s, 1);
  const tabs = (lit: number[], pull: number[] = [], colors: string[] = [C.ok, C.warm, C.ok]) =>
    TABS.map((label, i) => ({ label, lit: lit[i] ?? 0, pull: pull[i] ?? 0, color: colors[i] }));

  // Bubble geometry.
  const wrongB = bubbleSize(WRONG_ANSWER, BUBBLE, 700);
  const wrongX = 800;
  const wrongY = 252;

  const drawing = (
    <g>
      <Floor y={FLOOR_Y} x={180} w={1560} />

      {/* 0 · the binder on the shop's shelf; a question; two pages pulled out */}
      {P.shelf > 0 && (
        <g opacity={P.shelf}>
          <rect x={200} y={640} width={1110} height={22} rx={6} fill={C.card} stroke={alpha(C.accentText, 0.6)} strokeWidth={4} />
          {[300, 1180].map((bx) => (
            <path key={bx} d={`M ${bx} 662 v 46 h 46`} fill="none" stroke={alpha(C.accentText, 0.5)} strokeWidth={6} strokeLinecap="round" />
          ))}
          <ShoeBox x={226} y={500} w={210} h={140} color={C.warm} />
          <ShoeBox x={246} y={380} w={176} h={120} color={C.marker} />
          <ShoeBox x={860} y={520} w={196} h={120} color={C.ok} />
          <ShoeBox x={1086} y={520} w={196} h={120} color={C.warm} />
          <ShoeBox x={960} y={412} w={196} h={108} color={C.accent2} />
          <Binder x={556} y={336} w={236} h={304} lit={0.5 + 0.5 * s.shelf.binderLit} glowA={0.9 * s.shelf.binderLit} />
          <text x={690} y={740} textAnchor="middle" fontSize={46} fontWeight={800} fill={C.accentText} opacity={s.shelf.label}>
            {MANUAL_LABEL}
          </text>
          <Bubble x={1740} y={158} side="user" text={QUESTION} size={BUBBLE} maxW={640} opacity={s.shelf.question} />
          <Bubble x={800} y={262} side="ai" text={GOOD_ANSWER} size={BUBBLE} maxW={760} opacity={s.shelf.answer} lit={s.shelf.answer} />
          {[0, 1].map((k) => {
            const pp = Math.min(1, Math.max(0, s.shelf.pull * 1.25 - k * 0.25));
            if (pp <= 0) return null;
            const x = lerp(674, hand.x - 40 - 46 * k, pp);
            const y = lerp(470, hand.y + 40 + 40 * k, pp) - 150 * Math.sin(Math.PI * pp);
            return <Page key={k} x={x} y={y} w={170} rot={-8 + 10 * k} />;
          })}
        </g>
      )}

      {/* 1 · split screen: the note read whole on every chat vs the binder opened at one tab */}
      {P.split > 0 && (
        <g opacity={P.split}>
          <line x1={960} x2={960} y1={170} y2={780} stroke={alpha(C.muted, 0.4)} strokeWidth={3} strokeDasharray="12 10" />
          <text x={560} y={204} textAnchor="middle" fontSize={44} fontWeight={800} fill={C.warm}>
            {NOTE_LABEL}
          </text>
          <text x={1360} y={204} textAnchor="middle" fontSize={44} fontWeight={800} fill={C.ok}>
            {MANUAL_LABEL}
          </text>
          <NoteCard x={270} y={248} w={580} h={400} sweep={s.split.read > 0.01 ? s.split.sweep : -1} glowA={0.5 * s.split.read} />
          {[0, 1, 2].map((k) => (
            <ChatChip key={k} x={262 + k * 200} y={680} w={180} k={k + 1} lit={s.split.chats[k]} />
          ))}
          <Binder x={1210} y={290} w={300} h={390} opacity={1 - s.split.open} lit={0.8} />
          {s.split.open > 0 &&
            (() => {
              const ob = { x: 1010, y: 290, w: 560, h: 390 };
              const pg = binderPages(ob.x, ob.y, ob.w, ob.h);
              return (
                <g opacity={s.split.open} transform={`translate(${ob.x + ob.w / 2} ${ob.y + ob.h / 2}) scale(${0.85 + 0.15 * s.split.open}) translate(${-(ob.x + ob.w / 2)} ${-(ob.y + ob.h / 2)})`}>
                  <OpenBinder {...ob} tabSize={26} tabs={tabs([s.split.tab, 0, 0], [s.split.tab, 0, 0]).slice(0, 3)} glowA={0.5 * s.split.tab}>
                    <Paragraphs x={pg.left.x + 22} y={pg.left.y + 24} w={pg.left.w - 44} h={pg.left.h - 48} n={4} />
                    <PageText box={pg.right} rows={['Returns:', '30 days,', 'unworn,', 'in the box']} size={34} opacity={s.split.tab} hot={0} hotColor={C.bg0} />
                  </OpenBinder>
                </g>
              );
            })()}
        </g>
      )}

      {/* 2 · uploads drop into the binder; the magnifier picks two paragraphs for the robot */}
      {P.upload > 0 && (
        <g opacity={P.upload}>
          <OpenBinder {...BIG} tabs={tabs([0, 0, 0])}>
            <Paragraphs x={big.right.x + 30} y={big.right.y + 22} w={big.right.w - 60} h={big.right.h - 44} n={5} picks={[1, 3]} picked={s.upload.picked} hide={[s.upload.lift, s.upload.lift]} />
            {[0, 1, 2].map((k) => {
              const d = s.upload.pdfs[k];
              return <Pdf key={k} x={big.left.x + 120 + 118 * k} y={lerp(210, big.left.y + big.left.h * 0.55, d)} w={100} rot={(k - 1) * 8} opacity={d > 0 ? Math.min(1, d * 3) : 0} />;
            })}
          </OpenBinder>
          <UploadArrow x={big.left.x + 240} y={230} s={1.05} opacity={s.upload.arrow} drop={s.upload.pdfs[1]} />
          <Lens x={big.right.x + s.upload.lensX * big.right.w} y={big.right.y + s.upload.lensY * big.right.h} r={58} opacity={s.upload.lens} />
          {[1, 3].map((pi, k) => {
            const lf = s.upload.lift;
            if (lf <= 0) return null;
            const sx = big.right.x + big.right.w / 2;
            const sy = big.right.y + 22 + (pi + 0.5) * ((big.right.h - 44) / 5);
            return <Snippet key={k} x={lerp(sx, hand.x - 10 - 40 * k, lf)} y={lerp(sy, hand.y - 70 - 70 * k, lf) - 80 * Math.sin(Math.PI * lf)} w={lerp(380, 170, lf)} rot={lerp(0, -6 + 10 * k, lf)} />;
          })}
        </g>
      )}

      {/* 3 · the policy changes: the "30 days" page out, the "14 days" page in */}
      {P.swap > 0 && (
        <g opacity={P.swap}>
          <OpenBinder {...BIG} tabs={tabs([1, 0, 0], [1, 0, 0])}>
            <text x={big.left.x + 40} y={big.left.y + 90} fontSize={56} fontWeight={800} fill={alpha(C.bg0, 0.9)}>
              Returns
            </text>
            <Paragraphs x={big.left.x + 40} y={big.left.y + 130} w={big.left.w - 80} h={big.left.h - 160} n={3} />
            <g opacity={1 - Math.max(0, (s.swap.out - 0.55) / 0.45)} transform={`translate(${-420 * s.swap.out} ${-170 * s.swap.out}) rotate(${-12 * s.swap.out} ${big.right.x + big.right.w / 2} ${big.right.y + big.right.h / 2})`}>
              <rect x={big.right.x} y={big.right.y} width={big.right.w} height={big.right.h} rx={10} fill={C.text} stroke={alpha(C.bg0, 0.3)} strokeWidth={2} />
              <PageText box={big.right} rows={['Returns:', '30 days,', 'unworn,', 'in the box']} size={52} hot={1} hotColor={C.marker} />
              <line x1={big.right.x + 40} x2={big.right.x + 40 + 230 * s.swap.strike} y1={big.right.y + 152} y2={big.right.y + 152} stroke={C.marker} strokeWidth={8} strokeLinecap="round" />
            </g>
            {s.swap.in > 0 && (
              <g opacity={Math.min(1, s.swap.in * 2)} transform={`translate(${200 * (1 - s.swap.in)} ${-300 * (1 - s.swap.in)})`}>
                <rect x={big.right.x} y={big.right.y} width={big.right.w} height={big.right.h} rx={10} fill={C.text} stroke={alpha(C.ok, 0.9)} strokeWidth={5} />
                <PageText box={big.right} rows={['Returns:', '14 days,', 'unworn,', 'in the box']} size={52} hot={1} hotColor={C.ok} />
              </g>
            )}
          </OpenBinder>
        </g>
      )}

      {/* 4 · wrong page: "Shipping" opened instead of "Returns", a confident answer, a red underline */}
      {P.wrong > 0 && (
        <g opacity={P.wrong}>
          <OpenBinder {...BIG} tabs={tabs([0, s.wrong.tab, 0], [0, s.wrong.tab, 0], [C.ok, C.marker, C.ok])}>
            <text x={big.left.x + 40} y={big.left.y + 90} fontSize={56} fontWeight={800} fill={alpha(C.bg0, 0.9)} opacity={s.wrong.tab}>
              Shipping
            </text>
            <Paragraphs x={big.left.x + 40} y={big.left.y + 130} w={big.left.w - 80} h={big.left.h - 160} n={3} />
            <PageText box={big.right} rows={['Shipping:', 'free, in', '3 to 5 days']} size={52} opacity={s.wrong.tab} />
          </OpenBinder>
          <Bubble x={1740} y={158} side="user" text={QUESTION} size={BUBBLE} maxW={640} opacity={s.wrong.question} />
          <Bubble x={wrongX} y={wrongY} side="ai" text={WRONG_ANSWER} size={BUBBLE} maxW={700} opacity={s.wrong.answer} alert={s.wrong.pulse} />
          <Underline x={wrongX + wrongB.pad} y={wrongY + wrongB.h + 14} w={WRONG_ANSWER.length * BUBBLE * CHAR * 0.98} p={s.wrong.underline} />
        </g>
      )}

      {/* 5 · the note and the binder fade; the robot is blank; the book glows */}
      {P.end > 0 && (
        <g opacity={P.end}>
          <NoteCard x={380} y={350} w={460} h={320} rot={-4} days="14" opacity={s.end.props * (1 - s.end.fade)} />
          <Binder x={930} y={310} w={260} h={360} opacity={s.end.props * (1 - s.end.fade)} lit={0.8} />
          <g transform={`translate(0 ${30 * (1 - s.end.book)})`}>
            <KnowBook x={430} y={300} w={800} h={470} opacity={s.end.book} glowA={0.3 + 0.7 * s.end.glow} lit={0.6 + 0.4 * s.end.glow} />
          </g>
          {s.end.glow > 0 && (
            <g opacity={s.end.glow}>
              {Array.from({ length: 10 }, (_, i) => {
                const a = (i / 10) * Math.PI * 2;
                const cx = 830;
                const cy = 535;
                return <line key={i} x1={cx + 470 * Math.cos(a)} y1={cy + 280 * Math.sin(a)} x2={cx + 520 * Math.cos(a)} y2={cy + 310 * Math.sin(a)} stroke={C.warm} strokeWidth={6} strokeLinecap="round" />;
              })}
            </g>
          )}
        </g>
      )}

      <g transform={`translate(0 ${s.robot.bob})`}>
        <Robot x={R.x} y={R.y} s={R.s} armUp={s.robot.armUp} blink={s.robot.blink} opacity={s.robot.opacity} />
      </g>
    </g>
  );

  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Canvas vertical={p.vertical}>{p.vertical ? <g transform={fitInto(stageBox(false), stageBox(true)).transform}>{drawing}</g> : drawing}</Canvas>
    </AbsoluteFill>
  );
};
