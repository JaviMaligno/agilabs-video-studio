// Pure state of QuestionChat: the question that got an answer instead of a change.
// 'chat' (scene `question`): my bubble types in on beat 0; on beat 1 the agent's reply lists the
// bugs, then asks "Want me to fix them?", with a muted tag under it: "answered, and stopped".
// 'count' (scene `question2`): two figures pop, 40/49 (asked as a question) and, 0.8 s later,
// 15/84 (asked as an instruction), under a short title; the chat stays faded behind them.
// No Remotion or React imports here.
import { beatAt, fit, progress, sceneTime } from './steps.ts';

export type QuestionChatMode = 'chat' | 'count';
export type QuestionChatProps = { mode: QuestionChatMode };

// ── On-screen text (EN only video). Numbers exactly as in the article. ────────────────────────
export const TXT = {
  agent: 'DeepSeek',
  ask: 'we have a few chat bugs documented, can you look at them?',
  items: ['1. conversationId lost', '2. message shape', '3. missing auth check'],
  offer: 'Want me to fix them?',
  tag: 'answered, and stopped',
  title: 'sessions that answered and stopped',
  figures: [
    { value: '40/49', label: 'asked as a question', tone: 'warm' },
    { value: '15/84', label: 'asked as an instruction', tone: 'ok' },
  ],
} as const;

/** My bubble fades in, then its text types in over this many seconds. */
const BUBBLE_IN = 0.3;
const TYPE_SECONDS = 1.6;
/** Reply: bubble in, then each item, then the offer, then the tag. */
const REPLY_IN = 0.35;
const ITEM_GAP = 0.35;
const ITEM_IN = 0.3;
const OFFER_IN = 0.4;
const TAG_IN = 0.35;
const REPLY_LEN = REPLY_IN + TXT.items.length * ITEM_GAP + OFFER_IN + 0.25 + TAG_IN;
/** Count: second figure pops this long after the first. */
const SECOND_DELAY = 0.8;
const POP_IN = 0.45;

export type ChatState = {
  bubble: { appear: number; typing: number; typed: number };
  reply: { appear: number; items: { appear: number }[]; offer: { appear: number }; tag: { appear: number } };
};

export type QuestionChatState = {
  mode: QuestionChatMode;
  chat: ChatState;
  /** Opacity of the whole chat (1 in 'chat', faded behind the figures in 'count'). */
  chatOpacity: number;
  title: { appear: number };
  figures: { value: string; label: string; tone: 'warm' | 'ok'; pop: number }[];
};

const chatAt = (t: number, meStart: number, replyStart: number): ChatState => {
  const typing = progress(t, meStart + BUBBLE_IN, TYPE_SECONDS);
  const r0 = replyStart + REPLY_IN;
  const offerStart = r0 + TXT.items.length * ITEM_GAP;
  return {
    bubble: { appear: progress(t, meStart, BUBBLE_IN), typing, typed: Math.round(typing * TXT.ask.length) },
    reply: {
      appear: progress(t, replyStart, REPLY_IN),
      items: TXT.items.map((_, i) => ({ appear: progress(t, r0 + i * ITEM_GAP, ITEM_IN) })),
      offer: { appear: progress(t, offerStart, OFFER_IN) },
      tag: { appear: progress(t, offerStart + OFFER_IN + 0.25, TAG_IN) },
    },
  };
};

const FULL_CHAT = chatAt(Number.MAX_SAFE_INTEGER, 0, 0);
const NO_FIGURES = TXT.figures.map((f) => ({ ...f, pop: 0 }));

export function frameState(p: QuestionChatProps, time: number, beats: number[], dur: number): QuestionChatState {
  const t = sceneTime(time, dur);
  if (p.mode === 'count') {
    const start = fit(beatAt(beats, 0), SECOND_DELAY + POP_IN, dur);
    const pops = [progress(t, start, POP_IN), progress(t, start + SECOND_DELAY, POP_IN)];
    return {
      mode: 'count',
      chat: FULL_CHAT,
      chatOpacity: 0.1 * progress(t, start, 0.4),
      title: { appear: progress(t, start, 0.4) },
      figures: TXT.figures.map((f, i) => ({ ...f, pop: pops[i] })),
    };
  }
  const meStart = fit(beatAt(beats, 0), BUBBLE_IN + TYPE_SECONDS + REPLY_LEN, dur);
  const b1 = beats[1];
  // The reply waits for its beat; with no beat it follows the typing.
  const rawReply = b1 !== undefined && Number.isFinite(b1) ? b1 : meStart + BUBBLE_IN + TYPE_SECONDS + 0.3;
  const replyStart = fit(Math.max(rawReply, meStart), REPLY_LEN, dur);
  return {
    mode: 'chat',
    chat: chatAt(t, meStart, replyStart),
    chatOpacity: 1,
    title: { appear: 0 },
    figures: NO_FIGURES,
  };
}
