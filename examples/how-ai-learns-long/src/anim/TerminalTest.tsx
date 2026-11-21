// The terminal test: full fine-tuning (five lines) and LoRA side by side. See TerminalTest.state.ts.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { lerp } from './memory.ts';
import { Canvas } from './Canvas.tsx';
import { place } from './canvas.ts';
import { Badge, Desk, Floor, Robot, glow } from './office.tsx';
import { Book, ClearSheetDraw, NameLabel } from './book.tsx';
import { LESSONS, LORA_SOME, LORA_TICKS, LORA_UNSEEN, QUIZ_DROP, QUIZ_OPTIONS, QUIZ_Q, QUIZ_RIGHT, TALLY, UNSEEN, frameState, type TerminalTestProps } from './TerminalTest.state.ts';

export { frameState };
export type { TerminalTestProps };

const LAYOUT = {
  l: {
    desk: { x: 170, y: 646, w: 760 },
    floor: { x: 170, y: 818, w: 1570 },
    monitor: { x: 220, y: 180, w: 660, h: 400 },
    robot: { x: 1030, y: 452, s: 0.8 },
    guess: { x: 1080, y: 214, w: 600 },
    tally: { x: 1330, y: 476, cell: 68, cols: 6 },
    card: { x: 180, y: 690 },
    book: { x: 200, y: 290, w: 700, fallDx: -0.62, fallDy: 0.28 },
    stat: { x: 1080, y: 300, w: 640 },
    page: { x: 300, y: 170, w: 1320, h: 630 },
    unseen: { x: 1350, y: 214, w: 390, step: 104 },
    none: { x: 1520, y: 800 },
    quiz: { card: { x: 200, y: 190, w: 940, h: 560 }, meter: { x: 1240, y: 250, w: 500 }, robot: { x: 1490, y: 450, s: 0.62 }, floor: { x: 1250, y: 760, w: 480 } },
    lora: { left: { x: 200, y: 250, w: 600 }, right: { x: 1060, y: 250, w: 600 }, labelY: 152, ticksY: 676, rowY: 770, mid: 930 },
  },
  v: {
    desk: { x: 80, y: 760, w: 760 },
    floor: { x: 60, y: 932, w: 960 },
    monitor: { x: 120, y: 330, w: 640, h: 400 },
    robot: { x: 900, y: 560, s: 0.7 },
    guess: { x: 560, y: 980, w: 440 },
    tally: { x: 140, y: 1000, cell: 64, cols: 6 },
    card: { x: 90, y: 860 },
    book: { x: 160, y: 380, w: 760, fallDx: 0.25, fallDy: 0.2 },
    stat: { x: 120, y: 900, w: 840 },
    page: { x: 70, y: 300, w: 940, h: 900 },
    unseen: { x: 120, y: 980, w: 840, step: 72 },
    none: { x: 540, y: 1290 },
    quiz: { card: { x: 90, y: 300, w: 900, h: 560 }, meter: { x: 140, y: 950, w: 800 }, robot: { x: 540, y: 1100, s: 0.42 }, floor: { x: 340, y: 1300, w: 400 } },
    lora: { left: { x: 140, y: 300, w: 800 }, right: { x: 140, y: 820, w: 800 }, labelY: 250, ticksY: 1240, rowY: 1290, mid: 540 },
  },
};

/** A monitor with a terminal screen: the command and what the computer printed back. */
const Monitor: React.FC<{ x: number; y: number; w: number; h: number; cmd: string; reply: string; cmdOn: number; replyOn: number; glowA?: number }> = ({ x, y, w, h, cmd, reply, cmdOn, replyOn, glowA = 0 }) => (
  <g>
    <rect x={x + w / 2 - 40} y={y + h} width={80} height={52} fill={C.bg1} stroke={C.accentText} strokeWidth={4} />
    <rect x={x + w / 2 - 120} y={y + h + 46} width={240} height={20} rx={8} fill={C.card} stroke={C.accentText} strokeWidth={4} />
    <g style={glow(C.ok, glowA)}>
      <rect x={x} y={y} width={w} height={h} rx={22} fill={C.card} stroke={C.accentText} strokeWidth={6} />
    </g>
    <rect x={x + 22} y={y + 22} width={w - 44} height={h - 44} rx={12} fill={C.bg0} />
    {cmdOn > 0 && (
      <text x={x + 52} y={y + 110} fontSize={44} fontWeight={800} fill={C.ok} opacity={Math.min(1, cmdOn * 2)}>
        $ {cmd.slice(0, Math.ceil(cmd.length * Math.min(1, cmdOn)))}
      </text>
    )}
    {replyOn > 0 && (
      <text x={x + 52} y={y + 190} fontSize={40} fontWeight={700} fill={C.text}>
        {reply.slice(0, Math.ceil(reply.length * Math.min(1, replyOn)))}
      </text>
    )}
    <rect x={x + 52} y={y + 220} width={22} height={38} fill={alpha(C.ok, 0.8)} opacity={replyOn >= 1 ? 1 : 0} />
  </g>
);

/** The robot's guess: a thought bubble from its head, with a tick or a cross. */
const Guess: React.FC<{ x: number; y: number; w: number; text: string; on: number; mark: number; kind: 'tick' | 'cross'; from: { x: number; y: number } }> = ({ x, y, w: maxW, text, on, mark, kind, from }) => {
  let w = maxW;
  if (on <= 0) return null;
  const h = 96;
  w = Math.min(w, text.length * 0.56 * 34 + 96);
  return (
    <g opacity={Math.min(1, on * 1.5)}>
      {[0.25, 0.55].map((f, i) => (
        <circle key={i} cx={lerp(from.x, x + 40, f)} cy={lerp(from.y, y + h, f)} r={8 + 6 * i} fill={C.card} stroke={alpha(C.accentText, 0.8)} strokeWidth={3} />
      ))}
      <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={C.card} stroke={kind === 'cross' && mark > 0 ? C.marker : alpha(C.accentText, 0.8)} strokeWidth={4} />
      <text x={x + 36} y={y + h / 2 + 12} fontSize={34} fontWeight={800} fontStyle="italic" fill={C.text}>
        {text}
      </text>
      <Badge x={x + w - 4} y={y + 6} r={30} kind={kind} pop={mark} />
    </g>
  );
};

export const TerminalTest: React.FC<AnimProps & TerminalTestProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const L = place(p.vertical, LAYOUT);

  if (s.mode === 'lora') {
    const Lo = L.lora;
    const lo = s.lora;
    const row = (cx: number, y: number, n: number, ticks: number, fill: number) =>
      Array.from({ length: n }, (_, i) => {
        const k = Math.min(1, Math.max(0, fill * n - i));
        return <Badge key={i} x={cx - ((n - 1) * 62) / 2 + i * 62} y={y} r={24} kind={i < ticks ? 'tick' : 'cross'} pop={k} />;
      });
    const lc = Lo.left.x + Lo.left.w / 2;
    const rc = Lo.right.x + Lo.right.w / 2;
    const rh = Lo.right.w * 0.56;
    return (
      <AbsoluteFill style={{ fontFamily }}>
        <Canvas vertical={p.vertical}>
          <NameLabel x={lc} y={Lo.labelY} text="full fine-tuning (rewriting the book)" size={30} anchor="middle" />
          <NameLabel x={rc} y={Lo.labelY} text="LoRA (the clear sheet)" size={30} anchor="middle" color={C.ok} />
          <Book x={Lo.left.x} y={Lo.left.y} w={Lo.left.w} rewrite={1} blur={lo.leftBlur} fall={lo.leftFall} fallDx={0.25} fallDy={-0.02} />
          <Book x={Lo.right.x} y={Lo.right.y} w={Lo.right.w} stickyGlow={lo.rightGlow} mannersLit={lo.rightGlow}>
            <ClearSheetDraw x={Lo.right.x} y={Lo.right.y} w={Lo.right.w} ink={1} lit={lo.rightGlow} />
          </Book>
          {/* following instructions went up a little */}
          {lo.up > 0 && (
            <g opacity={lo.up} transform={`translate(${Lo.right.x + Lo.right.w + 70} ${Lo.right.y + rh * 0.62 - 20 * lo.up})`} style={glow(C.ok, 0.6)}>
              <path d="M 0 40 V -30 M -22 -8 L 0 -32 L 22 -8" fill="none" stroke={C.ok} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
            </g>
          )}
          {lo.ticks > 0 && (
            <text x={Lo.mid} y={Lo.ticksY + 12} textAnchor="middle" fontSize={32} fontWeight={800} fill={C.muted} opacity={lo.ticks}>
              the job
            </text>
          )}
          {row(lc, Lo.ticksY, LORA_TICKS, LORA_TICKS, lo.ticks)}
          {row(rc, Lo.ticksY, LORA_TICKS, LORA_TICKS, lo.ticks)}
          {lo.rows > 0 && (
            <g opacity={lo.rows}>
              <text x={Lo.mid} y={Lo.rowY + 12} textAnchor="middle" fontSize={32} fontWeight={800} fill={C.muted}>
                new commands
              </text>
              {row(lc - 40, Lo.rowY, LORA_UNSEEN, 0, lo.rowFill)}
              {row(rc - 40, Lo.rowY, LORA_UNSEEN, LORA_SOME, lo.rowFill)}
            </g>
          )}
          {lo.none > 0 && (
            <text x={lc - 40 + (LORA_UNSEEN * 62) / 2 + 24} y={Lo.rowY + 16} fontSize={46} fontWeight={800} fill={C.marker} opacity={lo.none}>
              none
            </text>
          )}
          {lo.some > 0 && (
            <text x={rc - 40 + (LORA_UNSEEN * 62) / 2 + 24} y={Lo.rowY + 16} fontSize={46} fontWeight={800} fill={C.ok} opacity={lo.some} style={glow(C.ok, 0.5 * lo.some)}>
              some
            </text>
          )}
        </Canvas>
      </AbsoluteFill>
    );
  }

  // full
  const P = s.panels;
  const ls = s.lesson;
  const [cmd, reply] = LESSONS[Math.max(0, Math.min(LESSONS.length - 1, ls.index))];
  const head = { x: L.robot.x, y: L.robot.y };
  const unseenShown = Math.min(UNSEEN.length, s.unseen.cards * UNSEEN.length);
  const desk = (children: React.ReactNode, opacity: number, monitor: React.ReactNode) =>
    opacity > 0 && (
      <g opacity={opacity}>
        <Floor x={L.floor.x} y={L.floor.y} w={L.floor.w} />
        <Desk x={L.desk.x} y={L.desk.y} w={L.desk.w} />
        {monitor}
        <Robot x={L.robot.x} y={L.robot.y} s={L.robot.s} />
        {children}
      </g>
    );
  const cardFly = ls.card > 0 && ls.card < 1;
  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Canvas vertical={p.vertical}>
        {/* 1 · the robot at the computer: command, the screen's reply, its guess, a tick */}
        {desk(
          <g>
            {cardFly && (
              <g opacity={Math.min(1, ls.card * 3)} transform={`translate(${lerp(L.card.x, L.monitor.x + 40, ls.card)} ${lerp(L.card.y, L.monitor.y + 50, ls.card)})`}>
                <rect x={0} y={0} width={220} height={84} rx={12} fill={C.text} stroke={C.bg0} strokeWidth={2} />
                <text x={22} y={56} fontSize={38} fontWeight={800} fill={C.bg0}>
                  $ {cmd}
                </text>
              </g>
            )}
            <Guess x={L.guess.x} y={L.guess.y} w={L.guess.w} text={reply} on={ls.guess} mark={ls.tick} kind="tick" from={{ x: head.x + 40, y: head.y - 10 }} />
            {/* the tally of ticks */}
            <text x={L.tally.x + (L.tally.cols / 2) * L.tally.cell} y={L.tally.y - 24} textAnchor="middle" fontSize={40} fontWeight={800} fill={C.ok} opacity={s.tally.learned}>
              learned the job
            </text>
            <g style={glow(C.ok, 0.5 * s.tally.learned)}>
              {Array.from({ length: TALLY }, (_, i) => {
                const k = Math.min(1, Math.max(0, s.tally.fill * TALLY - i));
                return (
                  <g key={i}>
                    <circle cx={L.tally.x + (i % L.tally.cols) * L.tally.cell + L.tally.cell / 2} cy={L.tally.y + Math.floor(i / L.tally.cols) * L.tally.cell + L.tally.cell / 2} r={24} fill="none" stroke={alpha(C.muted, 0.25)} strokeWidth={3} />
                    <Badge x={L.tally.x + (i % L.tally.cols) * L.tally.cell + L.tally.cell / 2} y={L.tally.y + Math.floor(i / L.tally.cols) * L.tally.cell + L.tally.cell / 2} r={24} kind="tick" pop={k} />
                  </g>
                );
              })}
            </g>
          </g>,
          P.desk,
          <Monitor x={L.monitor.x} y={L.monitor.y} w={L.monitor.w} h={L.monitor.h} cmd={cmd} reply={reply} cmdOn={ls.card >= 1 ? 1 : 0} replyOn={ls.reply} glowA={0.4 * ls.tick} />,
        )}

        {/* 2 · the general knowledge quiz: the question, four options, "food" ticked; the meter drops a little */}
        {P.quiz > 0 && (() => {
          const Q = L.quiz;
          const qz = s.quiz;
          const c = Q.card;
          const pad = 44;
          const gap = 30;
          const ow = (c.w - 2 * pad - gap) / 2;
          const oh = 108;
          const lost = Q.meter.w * QUIZ_DROP * qz.drop;
          return (
            <g opacity={P.quiz}>
              <rect x={c.x} y={c.y} width={c.w} height={c.h} rx={24} fill={C.text} stroke={alpha(C.accentText, 0.6)} strokeWidth={4} />
              <path d={`M ${c.x} ${c.y + 78} V ${c.y + 24} Q ${c.x} ${c.y} ${c.x + 24} ${c.y} H ${c.x + c.w - 24} Q ${c.x + c.w} ${c.y} ${c.x + c.w} ${c.y + 24} V ${c.y + 78} Z`} fill={C.accent} />
              <text x={c.x + pad} y={c.y + 54} fontSize={36} fontWeight={800} fill={C.text} opacity={0.6 + 0.4 * qz.title}>
                General knowledge quiz
              </text>
              <text x={c.x + pad} y={c.y + 170} fontSize={50} fontWeight={800} fill={C.bg0} opacity={qz.question}>
                {QUIZ_Q}
              </text>
              {/* empty slots until the question and its options are read */}
              <rect x={c.x + pad} y={c.y + 130} width={c.w * 0.6} height={18} rx={9} fill={alpha(C.muted, 0.3 * (1 - qz.question))} />
              {QUIZ_OPTIONS.map((o, i) => (
                <rect key={`slot-${o}`} x={c.x + pad + (i % 2) * (ow + gap)} y={c.y + 230 + Math.floor(i / 2) * (oh + 26)} width={ow} height={oh} rx={18} fill="none" stroke={alpha(C.muted, 0.5 * (1 - (qz.options[i] ?? 0)))} strokeWidth={3} strokeDasharray="12 10" />
              ))}
              {QUIZ_OPTIONS.map((o, i) => {
                const k = qz.options[i] ?? 0;
                if (k <= 0) return null;
                const ox = c.x + pad + (i % 2) * (ow + gap);
                const oy = c.y + 230 + Math.floor(i / 2) * (oh + 26);
                const right = i === QUIZ_RIGHT;
                const lit = right ? qz.tick : 0;
                return (
                  <g key={o} opacity={Math.min(1, k * 1.5)} transform={`translate(0 ${16 * (1 - k)})`} style={lit > 0.01 ? glow(C.ok, 0.7 * lit) : undefined}>
                    <rect x={ox} y={oy} width={ow} height={oh} rx={18} fill={lit > 0.01 ? alpha(C.ok, 0.25 + 0.6 * lit) : alpha(C.muted, 0.18)} stroke={lit > 0.01 ? C.ok : alpha(C.bg1, 0.45)} strokeWidth={4} />
                    <text x={ox + 34} y={oy + oh / 2 + 17} fontSize={48} fontWeight={800} fill={C.bg0}>
                      {o}
                    </text>
                    {right && <Badge x={ox + ow - 50} y={oy + oh / 2} r={30} kind="tick" pop={qz.tick} />}
                  </g>
                );
              })}
              {/* the general knowledge meter: a little lost on "points" (no number) */}
              <text x={Q.meter.x} y={Q.meter.y} fontSize={40} fontWeight={800} fill={C.text}>
                general knowledge
              </text>
              <rect x={Q.meter.x} y={Q.meter.y + 28} width={Q.meter.w - lost} height={64} rx={14} fill={qz.drop > 0.05 ? C.marker : alpha(C.ok, 0.8)} />
              {qz.drop > 0.05 && (
                <g opacity={Math.min(1, qz.drop * 1.5)}>
                  {/* the lost part: a clear dashed gap where the bar was, and a big arrow down */}
                  <rect x={Q.meter.x + Q.meter.w - lost} y={Q.meter.y + 28} width={lost} height={64} rx={14} fill={alpha(C.marker, 0.12)} stroke={C.marker} strokeWidth={6} strokeDasharray="14 10" />
                  <path d={`M ${Q.meter.x + Q.meter.w - lost / 2} ${Q.meter.y + 116} v 70 m -30 -30 l 30 30 l 30 -30`} fill="none" stroke={C.marker} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" style={glow(C.marker, 0.5 * qz.drop)} />
                </g>
              )}
              <Floor x={Q.floor.x} y={Q.floor.y} w={Q.floor.w} />
              {/* the arm goes up with the tick on the right answer and back down as the meter drops */}
              <Robot x={Q.robot.x} y={Q.robot.y} s={Q.robot.s} armUp={qz.tick * (1 - qz.drop)} />
            </g>
          );
        })()}

        {/* 3 · the manners chapter blurs, the sticky note falls; following instructions: more than ⅓ worse */}
        {P.book > 0 && (
          <g opacity={P.book}>
            <Book
              x={L.book.x}
              y={L.book.y}
              w={L.book.w}
              rewrite={1}
              blur={s.book.blur}
              fall={s.book.fall}
              fallDx={L.book.fallDx}
              fallDy={L.book.fallDy}
              mannersLit={s.book.hurt}
              glowA={0.8 * s.book.hurt}
              glowColor={C.marker}
            />
            <g opacity={s.stat.opacity}>
              <text x={L.stat.x} y={L.stat.y} fontSize={46} fontWeight={800} fill={C.text}>
                following instructions
              </text>
              <rect x={L.stat.x} y={L.stat.y + 50} width={L.stat.w} height={70} rx={14} fill={alpha(C.ok, 0.8)} />
              <text x={L.stat.x + 24} y={L.stat.y + 97} fontSize={32} fontWeight={800} fill={C.bg0}>
                before
              </text>
              <rect x={L.stat.x} y={L.stat.y + 150} width={L.stat.w * (1 - 0.37 * s.stat.shrink)} height={70} rx={14} fill={s.stat.shrink > 0.05 ? C.marker : alpha(C.ok, 0.8)} />
              <text x={L.stat.x + 24} y={L.stat.y + 197} fontSize={32} fontWeight={800} fill={C.bg0}>
                after
              </text>
              {s.stat.shrink > 0.05 && (
                <rect x={L.stat.x + L.stat.w * 0.63} y={L.stat.y + 150} width={L.stat.w * 0.37 * s.stat.shrink} height={70} rx={14} fill="none" stroke={alpha(C.marker, 0.8)} strokeWidth={4} strokeDasharray="10 8" />
              )}
              <text x={L.stat.x} y={L.stat.y + 330} fontSize={66} fontWeight={800} fill={C.marker} opacity={s.stat.text} style={glow(C.marker, 0.5 * s.stat.text)}>
                more than ⅓ worse
              </text>
            </g>
          </g>
        )}

        {/* 4 · close-up of a rewritten page: the old manners text faint underneath */}
        {P.page > 0 && (
          <g opacity={P.page} transform={`translate(${L.page.x + L.page.w / 2} ${L.page.y + L.page.h / 2}) scale(${0.6 + 0.4 * s.page.zoom}) translate(${-(L.page.x + L.page.w / 2)} ${-(L.page.y + L.page.h / 2)})`}>
            <rect x={L.page.x + L.page.w - 6} y={L.page.y + 60} width={50} height={190} rx={8} fill={C.accent2} />
            <rect x={L.page.x} y={L.page.y} width={L.page.w} height={L.page.h} rx={14} fill={C.text} stroke={alpha(C.bg0, 0.4)} strokeWidth={3} />
            <text x={L.page.x + 70} y={L.page.y + 100} fontSize={52} fontWeight={800} fill={C.accent2} opacity={0.75 - 0.35 * s.page.forget}>
              manners
            </text>
            {['One line, please.', 'Answer what was asked.', 'Keep it short and kind.'].map((ln, i) => (
              <text key={`o${i}`} x={L.page.x + 70} y={L.page.y + 210 - 46 * s.page.fade + i * 130} fontSize={50} fontWeight={700} fontStyle="italic" fill={alpha(C.bg1, Math.max(0.08, 0.62 - 0.42 * s.page.fade - 0.1 * s.page.forget))}>
                {ln}
              </text>
            ))}
            {['$ ls  →  boots.txt  sneakers.txt', '$ pwd  →  /home/shop', '$ whoami  →  robot'].map((ln, i) => {
              const k = Math.min(1, Math.max(0, s.page.fade * 3 - i));
              return (
                <text key={`n${i}`} x={L.page.x + 120} y={L.page.y + 236 + i * 130} fontSize={50} fontWeight={800} fill={C.accent}>
                  {ln.slice(0, Math.ceil(ln.length * k))}
                </text>
              );
            })}
          </g>
        )}

        {/* 5 · unfamiliar commands: every guess crossed, "none" */}
        {desk(
          <g>
            <Guess x={L.guess.x} y={L.guess.y} w={250} text="order 1 …" on={s.unseen.cross > 0 ? 1 : s.unseen.cards} mark={s.unseen.cross} kind="cross" from={{ x: head.x + 40, y: head.y - 10 }} />
            <text x={L.unseen.x} y={L.unseen.y - 30} fontSize={34} fontWeight={800} fill={C.muted}>
              never seen in its lessons
            </text>
            {UNSEEN.map((u, i) => {
              const k = Math.min(1, Math.max(0, unseenShown - i));
              if (k <= 0) return null;
              const cy = L.unseen.y + i * L.unseen.step;
              const cross = Math.min(1, Math.max(0, s.unseen.cross * UNSEEN.length - i));
              return (
                <g key={u} opacity={Math.min(1, k * 1.5)} transform={`translate(${40 * (1 - k)} 0)`}>
                  <rect x={L.unseen.x} y={cy} width={L.unseen.w} height={80} rx={14} fill={C.text} stroke={cross > 0 ? C.marker : C.bg0} strokeWidth={cross > 0 ? 4 : 2} />
                  <text x={L.unseen.x + 22} y={cy + 52} fontSize={32} fontWeight={800} fill={C.bg0}>
                    $ {u}
                  </text>
                  <Badge x={L.unseen.x + L.unseen.w - 36} y={cy + 40} r={24} kind="cross" pop={cross} />
                </g>
              );
            })}
            {s.unseen.none > 0 && (
              <text x={L.none.x} y={L.none.y} textAnchor="middle" fontSize={96} fontWeight={800} fill={C.marker} opacity={s.unseen.none} style={glow(C.marker, 0.6 * s.unseen.none)}>
                none
              </text>
            )}
          </g>,
          P.unseen,
          <Monitor x={L.monitor.x} y={L.monitor.y} w={L.monitor.w} h={L.monitor.h} cmd={UNSEEN[0]} reply="order 3  order 2  order 1" cmdOn={s.unseen.cards > 0 ? 1 : 0} replyOn={s.unseen.cross > 0 ? 1 : 0} />,
        )}
      </Canvas>
    </AbsoluteFill>
  );
};

