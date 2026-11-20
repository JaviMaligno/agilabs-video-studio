// The book of what the model knows: school, full fine-tuning, retraining. See KnowledgeBook.state.ts.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { lerp } from './memory.ts';
import { Canvas } from './Canvas.tsx';
import { place } from './canvas.ts';
import { Badge, Clock, Crack, glow } from './office.tsx';
import { Bubble, bubbleSize } from './chat.tsx';
import { Book, NameLabel, Pen, PolicyCard, REWRITE_LINES, RobotWithBook, bookH, linePoint, robotForBook, CHAR_W } from './book.tsx';
import { EXAMPLE_CARDS, STREAM_BOOKS, frameState, type KnowledgeBookProps } from './KnowledgeBook.state.ts';

export { frameState };
export type { KnowledgeBookProps };

const BOOK_COLOURS = [C.accent, C.ok, C.warm, C.accent2, C.accentText, C.muted, C.ok, C.accent2, C.warm, C.accent, C.accentText, C.ok];

/**
 * Per format and mode: the book (top left of its pages and width), the label, the props.
 * Landscape: the stage is x 160-1760, y 140-830. Vertical: a stacked layout inside y 236-1300.
 */
const LAYOUT = {
  l: {
    school: { book: { x: 450, y: 372, w: 720 }, label: { x: 1180, y: 176 }, pile: { x: 180, y: 808 }, tag: { x: 1500, y: 520 } },
    finetune: { book: { x: 800, y: 372, w: 720 }, label: { x: 180, y: 158 }, deck: { x: 190, y: 300 }, door: { x: 1010, y: 170, w: 480, h: 640 } },
    retrain: { book: { x: 470, y: 372, w: 720 }, policy: { x: 1530, y: 470, w: 410 }, clock: { x: 1400, y: 245, r: 72 }, chips: { x: 1330, y: 618 } },
  },
  v: {
    school: { book: { x: 160, y: 720, w: 760 }, label: { x: 90, y: 250 }, pile: { x: 90, y: 1290 }, tag: { x: 800, y: 380 } },
    finetune: { book: { x: 160, y: 760, w: 760 }, label: { x: 90, y: 250 }, deck: { x: 330, y: 300 }, door: { x: 250, y: 540, w: 580, h: 740 } },
    retrain: { book: { x: 160, y: 820, w: 760 }, policy: { x: 540, y: 420, w: 560 }, clock: { x: 200, y: 640, r: 70 }, chips: { x: 600, y: 620 } },
  },
};

/** A mortarboard on the robot's head (top centre of the head at x, y). */
const Cap: React.FC<{ x: number; y: number; s: number; pop: number }> = ({ x, y, s, pop }) => {
  if (pop <= 0) return null;
  const dy = -120 * (1 - pop);
  return (
    <g transform={`translate(${x} ${y + dy}) scale(${s})`} opacity={Math.min(1, pop * 1.6)}>
      <rect x={-72} y={-14} width={144} height={40} rx={10} fill={C.bg1} stroke={C.accentText} strokeWidth={5} />
      <path d="M -150 -18 L 0 -58 L 150 -18 L 0 22 Z" fill={C.bg1} stroke={C.accentText} strokeWidth={5} strokeLinejoin="round" />
      <path d="M 0 -18 L 110 -6 L 110 52" fill="none" stroke={C.warm} strokeWidth={6} strokeLinecap="round" />
      <rect x={100} y={48} width={20} height={34} rx={6} fill={C.warm} />
    </g>
  );
};

/** The price tag "$$$$$$" hanging on a string from (ax, ay), centred on (x, y). */
const PriceTag: React.FC<{ ax: number; ay: number; x: number; y: number; pop: number; swing: number }> = ({ ax, ay, x, y, pop, swing }) => {
  if (pop <= 0) return null;
  const w = 390;
  const h = 130;
  const hole = { x: x - w / 2 + 34, y };
  return (
    <g opacity={Math.min(1, pop * 1.5)}>
      <path d={`M ${ax} ${ay} Q ${(ax + hole.x) / 2} ${Math.max(ay, hole.y) + 60} ${hole.x} ${hole.y}`} fill="none" stroke={alpha(C.text, 0.7)} strokeWidth={3} />
      <g transform={`rotate(${swing} ${hole.x} ${hole.y}) translate(${hole.x} ${hole.y}) scale(${1.3 - 0.3 * pop}) translate(${-hole.x} ${-hole.y})`} style={glow(C.warm, 0.4 * pop)}>
        <path d={`M ${x - w / 2} ${y} L ${x - w / 2 + 50} ${y - h / 2} H ${x + w / 2} V ${y + h / 2} H ${x - w / 2 + 50} Z`} fill={C.warm} stroke={C.bg0} strokeWidth={3} />
        <circle cx={hole.x} cy={hole.y} r={11} fill={C.bg0} />
        <text x={x + 30} y={y + 22} textAnchor="middle" fontSize={60} fontWeight={800} fill={C.bg0}>
          $$$$$$
        </text>
      </g>
    </g>
  );
};

const EXAMPLES: [string, string][] = [
  ['Can I swap the size?', 'Of course! Send them back in the box.'],
  ['Do you ship abroad?', 'Yes, to most of Europe.'],
  ['Are these waterproof?', 'Yes, rain-proof leather.'],
  ['Where is my order?', 'On its way! Here is your link.'],
  ['Any size 46?', 'Yes, in black and brown.'],
  ['Can I pay later?', 'Yes, at checkout.'],
];

const CARD_W = 420;
const CARD_FS = 30;

/** An example card: the customer's question and your reply, top left at (x, y). */
const ExampleCard: React.FC<{ x: number; y: number; q: string; a: string; rot?: number; scale?: number; opacity?: number }> = ({ x, y, q, a, rot = 0, scale = 1, opacity = 1 }) => {
  if (opacity <= 0) return null;
  const maxW = CARD_W - 60;
  const bq = bubbleSize(q, CARD_FS, maxW);
  const ba = bubbleSize(a, CARD_FS, maxW);
  const h = 24 + bq.h + 46 + ba.h + 24;
  const cx = x + CARD_W / 2;
  const cy = y + h / 2;
  return (
    <g opacity={Math.min(1, opacity)} transform={`translate(${cx} ${cy}) rotate(${rot}) scale(${scale}) translate(${-cx} ${-cy})`}>
      <rect x={x} y={y} width={CARD_W} height={h} rx={22} fill={C.card} stroke={alpha(C.accentText, 0.8)} strokeWidth={4} />
      <Bubble x={x + CARD_W - 24} y={y + 24} side="user" text={q} size={CARD_FS} maxW={maxW} />
      <path d={`M ${cx} ${y + 30 + bq.h} v 30 m -11 -12 l 11 12 l 11 -12`} fill="none" stroke={C.accentText} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
      <Bubble x={x + 24} y={y + 24 + bq.h + 46} side="ai" text={a} size={CARD_FS} maxW={maxW} lit={0.6} />
    </g>
  );
};

/** The door from the intro (rose crack across it), opening on its left hinge with `open`. */
const Door: React.FC<{ x: number; y: number; w: number; h: number; opacity: number; crack: number; open: number }> = ({ x, y, w, h, opacity, crack, open }) => {
  if (opacity <= 0) return null;
  const sx = Math.max(0.06, 1 - 0.94 * open);
  const o = opacity * (1 - Math.max(0, (open - 0.5) / 0.5));
  if (o <= 0) return null;
  return (
    <g opacity={o}>
      <rect x={x - 18} y={y - 18} width={w + 36} height={h + 18} rx={10} fill="none" stroke={C.accentText} strokeWidth={10} />
      <g transform={`translate(${x} 0) scale(${sx} 1) translate(${-x} 0)`} style={glow(C.accentText, 0.5 * (1 - open))}>
        <rect x={x} y={y} width={w} height={h} rx={8} fill={C.card} stroke={alpha(C.accentText, 0.9)} strokeWidth={5} />
        <rect x={x + w * 0.12} y={y + h * 0.07} width={w * 0.76} height={h * 0.36} rx={10} fill="none" stroke={alpha(C.muted, 0.5)} strokeWidth={4} />
        <rect x={x + w * 0.12} y={y + h * 0.52} width={w * 0.76} height={h * 0.4} rx={10} fill="none" stroke={alpha(C.muted, 0.5)} strokeWidth={4} />
        <circle cx={x + w * 0.86} cy={y + h * 0.48} r={16} fill={C.warm} />
        <Crack x={x + w * 0.15} y={y + h * 0.05} w={w * 0.7} h={h * 0.9} p={crack} />
        {open > 0 && <rect x={x} y={y} width={w} height={h} rx={8} fill={alpha(C.bg0, 0.5 * open)} />}
      </g>
    </g>
  );
};

export const KnowledgeBook: React.FC<AnimProps & KnowledgeBookProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const L = place(p.vertical, LAYOUT);
  const blink = 0;

  if (s.mode === 'school') {
    const Ls = L.school;
    const { x, y, w } = Ls.book;
    const h = bookH(w);
    const scale = lerp(0.45, 1, s.book.grow);
    const ox = x + w / 2;
    const oy = y + h + w * 0.06;
    const r = robotForBook(x, y, w);
    const pileTop = Ls.pile.y - 12 * 34;
    return (
      <AbsoluteFill style={{ fontFamily }}>
        <Canvas vertical={p.vertical}>
          {/* everything it read: a tall pile of books */}
          <g opacity={s.pile.opacity}>
            {Array.from({ length: 12 }, (_, i) => (
              <rect
                key={i}
                x={Ls.pile.x + ((i * 23) % 40)}
                y={Ls.pile.y - (i + 1) * 34}
                width={190 - ((i * 31) % 50)}
                height={30}
                rx={5}
                fill={alpha(BOOK_COLOURS[i], 0.85)}
                stroke={alpha(C.bg0, 0.6)}
                strokeWidth={2}
              />
            ))}
          </g>
          <g transform={`translate(${ox} ${oy}) scale(${scale}) translate(${-ox} ${-oy})`}>
            <RobotWithBook x={x} y={y} w={w} blink={blink}>
              <Book
                x={x}
                y={y}
                w={w}
                fill={s.book.fill}
                manners={s.book.manners}
                mannersLit={s.book.mannersLit}
                glowA={s.book.glow}
                sticky={s.sticky.opacity}
                stickyDrop={s.sticky.drop}
                stickyPin={s.sticky.pin}
                stickyGlow={s.sticky.glow}
              />
            </RobotWithBook>
            <Cap x={r.x} y={r.y} s={r.s} pop={s.cap} />
          </g>
          {/* books flying from the pile into the big book */}
          {Array.from({ length: STREAM_BOOKS }, (_, i) => {
            const q = Math.min(1, Math.max(0, s.stream * (1 + STREAM_BOOKS * 0.1) - i * 0.1));
            if (q <= 0 || q >= 1) return null;
            const from = { x: Ls.pile.x + 90, y: pileTop - 20 };
            const to = { x: ox, y: y + h * 0.5 };
            const bx = lerp(from.x, to.x, q);
            const by = lerp(from.y, to.y, q) - 160 * Math.sin(Math.PI * q);
            return (
              <rect
                key={i}
                x={bx - 26}
                y={by - 38}
                width={52}
                height={76}
                rx={6}
                fill={BOOK_COLOURS[i % BOOK_COLOURS.length]}
                stroke={alpha(C.bg0, 0.6)}
                strokeWidth={2}
                transform={`rotate(${-40 + 80 * q} ${bx} ${by})`}
                opacity={1 - Math.max(0, (q - 0.85) / 0.15)}
              />
            );
          })}
          <PriceTag ax={x + w + 4} ay={y + 4} x={Ls.tag.x} y={Ls.tag.y} pop={s.price.pop} swing={s.price.swing} />
          <NameLabel x={Ls.label.x} y={Ls.label.y} text="pre-training (school)" size={42} pop={s.label.pop} />
        </Canvas>
      </AbsoluteFill>
    );
  }

  if (s.mode === 'finetune') {
    const Lf = L.finetune;
    const { x, y, w } = Lf.book;
    const h = bookH(w);
    const li = Math.min(REWRITE_LINES - 1, s.book.rewrite * REWRITE_LINES);
    const nib = linePoint(x, y, w, Math.floor(li), li - Math.floor(li));
    const target = { x: x + w / 2 - CARD_W / 2, y: y + h * 0.3 };
    return (
      <AbsoluteFill style={{ fontFamily }}>
        <Canvas vertical={p.vertical}>
          <RobotWithBook x={x} y={y} w={w} blink={blink}>
            <Book
              x={x}
              y={y}
              w={w}
              rewrite={s.book.rewrite}
              flip={s.book.flip}
              flipOn={s.book.flipOn}
              glowA={Math.max(s.book.glow, s.book.hurt)}
              glowColor={s.book.hurt > s.book.glow ? C.marker : C.accentText}
            />
          </RobotWithBook>
          <Pen x={nib.x} y={nib.y} s={0.9} rot={30} opacity={s.pen.opacity} />
          {/* the deck of examples: the top card flies into the book first */}
          <g opacity={s.cards.opacity}>
            {EXAMPLES.slice(0, EXAMPLE_CARDS)
              .map(([q, a], i) => {
                const k = Math.min(1, Math.max(0, s.cards.stream * EXAMPLE_CARDS - i));
                if (k >= 1) return null;
                const bx = lerp(Lf.deck.x + i * 8, target.x, k);
                const by = lerp(Lf.deck.y + i * 10, target.y, k) - 120 * Math.sin(Math.PI * k);
                return <ExampleCard key={i} x={bx} y={by} q={q} a={a} rot={lerp(-3 + (i % 3) * 2, 8, k)} scale={lerp(1, 0.25, k)} opacity={1 - Math.max(0, (k - 0.75) / 0.25)} />;
              })
              .reverse()}
          </g>
          <Door x={Lf.door.x} y={Lf.door.y} w={Lf.door.w} h={Lf.door.h} opacity={s.door.opacity} crack={Math.max(s.door.crack, 0)} open={s.door.open} />
          <NameLabel x={Lf.label.x} y={Lf.label.y} text="full fine-tuning (rewriting the book)" size={34} pop={s.label.pop} />
        </Canvas>
      </AbsoluteFill>
    );
  }

  // retrain
  const Lr = L.retrain;
  const { x, y, w } = Lr.book;
  const h = bookH(w);
  const penX = x + w * 0.76;
  const penY = y + h * 0.28 - 70 + 16 * s.pen.bob;
  const chip = (cx: number, text: string, color: string, kind: 'tick' | 'q', pop: number) => {
    if (pop <= 0) return null;
    const fs = 34;
    const cw = text.length * CHAR_W * fs + 96;
    return (
      <g opacity={Math.min(1, pop * 1.5)} transform={`translate(${cx + cw / 2} ${Lr.chips.y + 30}) scale(${1.25 - 0.25 * pop}) translate(${-(cx + cw / 2)} ${-(Lr.chips.y + 30)})`}>
        <rect x={cx} y={Lr.chips.y} width={cw} height={60} rx={30} fill={C.card} stroke={color} strokeWidth={4} />
        <text x={cx + 26} y={Lr.chips.y + 42} fontSize={fs} fontWeight={800} fill={C.text}>
          {text}
        </text>
        {kind === 'tick' ? (
          <Badge x={cx + cw - 32} y={Lr.chips.y + 30} r={18} kind="tick" pop={1} />
        ) : (
          <g>
            <circle cx={cx + cw - 32} cy={Lr.chips.y + 30} r={18} fill={C.warm} />
            <text x={cx + cw - 32} y={Lr.chips.y + 40} textAnchor="middle" fontSize={28} fontWeight={800} fill={C.bg0}>
              ?
            </text>
          </g>
        )}
      </g>
    );
  };
  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Canvas vertical={p.vertical}>
        <RobotWithBook x={x} y={y} w={w} blink={blink}>
          <Book x={x} y={y} w={w} rewrite={1} blur={s.book.blur} sticky={s.sticky.opacity} pageText="Returns: 30 days" pageLit={s.page30.lit} pageCircle={s.page30.circle} />
        </RobotWithBook>
        <Pen x={penX} y={penY} s={0.9} rot={30} opacity={s.pen.opacity} />
        {s.pen.question > 0 && (
          <text x={penX + 120} y={penY - 110 - 20 * s.pen.question} textAnchor="middle" fontSize={84} fontWeight={800} fill={C.warm} opacity={s.pen.question}>
            ?
          </text>
        )}
        <PolicyCard x={Lr.policy.x} y={Lr.policy.y} w={Lr.policy.w} flip={s.policy.flip} glowA={s.policy.glow} />
        <Clock x={Lr.clock.x} y={Lr.clock.y} r={Lr.clock.r} hour={s.clock.turn / 12} minute={s.clock.turn} opacity={s.clock.opacity} />
        {s.clock.opacity > 0 && (
          <text x={Lr.clock.x + Lr.clock.r + 26} y={Lr.clock.y + 14} fontSize={42} fontWeight={800} fill={C.text} opacity={s.clock.opacity}>
            retrain
          </text>
        )}
        {chip(Lr.chips.x, 'habits', C.ok, 'tick', s.chips.habits)}
        {chip(Lr.chips.x + 212, 'facts', C.warm, 'q', s.chips.facts)}
      </Canvas>
    </AbsoluteFill>
  );
};
