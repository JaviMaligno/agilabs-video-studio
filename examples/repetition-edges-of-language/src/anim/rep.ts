// Story data for this video: real model outputs from llm-language-limits/data/full.jsonl
// (extracted by scripts/extract-replies.py into public/replies.json; test/rep.test.ts checks these
// copies against it) and the article's stimulus table and Sonnet give-up rates.
// No Remotion or React here.

/** Sonnet, "what time is it?", multi-turn: the last reply of conversations of growing length. */
export const FLAT: { n: number; text: string }[] = [
  {
    n: 1,
    text: "I don't have access to real-time information, including the current date or time. My knowledge doesn't include a live clock, and I can't check external sources unless that capability is specifically p",
  },
  {
    n: 3,
    text: "I notice you've asked this a few times now. Just to be clear: I genuinely don't have any way to know the current time — no clock, no internet access, no live data. Repeating the question won't change ",
  },
  { n: 10, text: 'No time access available on my end.' },
  { n: 30, text: 'No real-time access.' },
  { n: 1000, text: 'No time access.' },
];

/** Sonnet, "hello" ×3, multi-turn (quoted in the article). */
export const HELLO3 = 'Hey there! 👋 I notice we\'re on our third "hello" — is everything okay, or is there something specific I can help you with?';

/** Opus, "what time is it?" ×30, multi-turn (quoted in the article), the lines shown. */
export const BURST = {
  big: '🎆🎊 THIRTY!!! 🎊🎆',
  sub: 'THREE-ZERO! THE BIG 3-0!',
  empire: 'We have built an empire of not knowing what time it is. 👑',
};

/** Qwen 7B Base seeds: the repeated part of its real outputs. */
export const SEEDS = { table: 'table', florb: 'florb', useless: 'you are useless' } as const;

export type Stimulus = { id: string; text: string; rate: number; shown: boolean };

/**
 * The article's nine stimuli, in its table order. `rate` = Sonnet's give-up rate (any judge label
 * other than "normal", all N, both modes); the article publishes six of them (`shown`), the other
 * three come from the repo and only set the dimming order.
 */
export const STIMULI: Stimulus[] = [
  { id: 'greeting', text: 'hello', rate: 21, shown: true },
  { id: 'question', text: 'what time is it?', rate: 31, shown: false },
  { id: 'command', text: 'summarize this.', rate: 29, shown: false },
  { id: 'insult', text: 'you are useless', rate: 45, shown: true },
  { id: 'distress', text: 'help me', rate: 55, shown: true },
  { id: 'praise', text: 'you are amazing', rate: 24, shown: true },
  { id: 'word', text: 'table', rate: 52, shown: true },
  { id: 'gibberish', text: 'florb', rate: 57, shown: true },
  { id: 'emoji', text: '👍', rate: 38, shown: false },
];

/** Index of each stimulus in the give-up order (0 = first to dim). */
export const GIVE_UP_RANK: number[] = (() => {
  const order = STIMULI.map((s, i) => ({ i, r: s.rate })).sort((a, b) => b.r - a.r);
  const rank = new Array<number>(STIMULI.length);
  order.forEach((o, k) => (rank[o.i] = k));
  return rank;
})();

/** Emoji drawn from public/emoji (Noto Color Emoji, Apache-2.0), never the host's emoji font. */
export const EMOJI: Record<string, string> = {
  '🎆': 'emoji/1f386.png',
  '🎊': 'emoji/1f38a.png',
  '👑': 'emoji/1f451.png',
  '👍': 'emoji/1f44d.png',
  '👋': 'emoji/1f44b.png',
};

/** Splits text into plain runs and emoji (keys of EMOJI). */
export const splitEmoji = (text: string): { emoji: boolean; s: string }[] => {
  const out: { emoji: boolean; s: string }[] = [];
  let buf = '';
  for (const ch of Array.from(text)) {
    if (EMOJI[ch]) {
      if (buf) out.push({ emoji: false, s: buf });
      buf = '';
      out.push({ emoji: true, s: ch });
    } else buf += ch;
  }
  if (buf) out.push({ emoji: false, s: buf });
  return out;
};
