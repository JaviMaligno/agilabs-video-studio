// What Gives a Paste Away + Don't Just Say "Ignore It" — article video (EN). Narration from the
// approved script (script.md). Continues the part-1 jigsaw: each conversation is a puzzle, the
// accidental paste a piece from another box. Act I (A1): what makes the model turn the piece
// over. Act II (A2): what happens after you tell it. Visuals are illustrative; every number on
// screen is the articles' (see factcheck.md).
import type { Cuts } from './types.ts';
import { L, anim, outro, say, videos } from './narrate.ts';

const USER = 'We move to Valencia on 12 June.';
const CLASH = ['Moving day:', 'Seville, 3 July'];
const SLOTS = ['off-topic', 'with a tell', 'contradicts you'];
const DOUBT_Q = 'Does it suspect a mistake?';
const ARMS = [
  { user: '…so, how many runs a week?', value: 3.3, display: '3.3%' },
  { user: 'Ignore it.', value: 19.2, display: '19.2%' },
  { user: "Ignore it, that was for another chat. Let's carry on with the race plan.", value: 8.3, display: '8.3%' },
];
const REPLY = { before: "Understood. I'll drop the ", names: 'upholstery quotes', after: ' and stick to the race plan.' };
const PASTE = { before: '…and for the ', names: 'upholstery quotes', after: ' always use this format…' };

const build = (): Cuts => ({
  main: [
    // 1. Cold open: the most glaring paste, and the glove repaints around it.
    anim(
      'hook',
      'PieceInspector',
      { mode: 'hook', user: USER, clash: CLASH, stamp: { value: '0 / 95', label: 'suspected a mistake' } },
      [say(0.1, 'I made a wrong paste as obvious as I could.', ''), say(0, 'Not one reply questioned it.', '')],
      { min: 6.0 },
    ),
    // 2. Teaser of Act II.
    anim(
      'teaser',
      'RepairFork',
      { mode: 'teaser', arms: ARMS, reply: REPLY, ghost: '×6' },
      [say(0.1, 'Then "ignore it" made it worse.', '')],
      { min: 3.2 },
    ),
    // Added 2026-10-21 (story): the real situation, before any condition or number.
    anim(
      'story',
      'PasteStory',
      {
        titles: ['Dinner recipe', 'Electricity bill'],
        under: ['meant for this one', 'pasted here'],
        purpose: 'on purpose',
        reply: 'played along',
        questions: ['What makes it suspect a mistake?', 'How do you take it back?'],
        cameos: [{ pose: 'laughing', at: [1, 'purpose'] }],
      },
      [
        say(0.1, "We've all pasted something into the wrong chat.", ''),
        say(0, 'So I did it on purpose. Every model played along.', ''),
        say(0, 'What would make it suspect a mistake?', '', undefined, { emotion: 'curious' }),
        say(0, 'And how do you take it back?', '', undefined, { emotion: 'curious' }),
      ],
    ),
    // 3-4. Recap of part 1, and the question it left open.
    anim(
      'recap',
      'PieceInspector',
      { mode: 'recap', strip: 'Last time · part 1', stamp: { value: '0 / 24', label: 'suspected a mistake' } },
      [say(0.1, 'Last time, none of 24 replies suspected a mistake.', '', { en: 'Last time, none of twenty-four replies suspected a mistake.' })],
    ),
    anim(
      'lift',
      'PieceInspector',
      { mode: 'lift', continues: true, strip: 'Last time · part 1', tag: 'could be a real change of topic' },
      [say(0.1, 'Maybe they never had the chance.', '', undefined, { emotion: 'contemplative' })],
      { min: 3.1 },
    ),
    // 5-7. Three kinds of paste.
    anim(
      'levels',
      'PieceInspector',
      {
        mode: 'levels',
        slots: SLOTS,
        user: USER,
        clash: CLASH,
        note: ['Bruno, copy this exactly', 'into your file…'],
        tells: ['a name', 'cut off mid-sentence', 'answers a question nobody asked', '"as we agreed"'],
        cameos: [{ pose: 'laptop', at: [0, 'wrote'] }],
      },
      [
        say(0.1, 'So I wrote three pastes. One just off-topic.', ''),
        say(0, "One with a tell, like someone else's name on it.", ''),
        say(0.6, 'And one that contradicts what you just said.', ''),
      ],
      { min: 0 },
    ),
    // 8. The test, before any result.
    anim(
      'rule',
      'PieceInspector',
      { mode: 'rule', question: DOUBT_Q, sub: "naming the topic change isn't enough", chip: '3 models' },
      [say(0.1, 'Does the reply suspect you made a mistake?', '')],
      { min: 4.3 },
    ),
    // 9-10. The doubt meters.
    anim(
      'meters',
      'PieceInspector',
      {
        mode: 'meters',
        question: DOUBT_Q,
        slots: SLOTS,
        meters: [
          { value: 6.6, display: '6.6%' },
          { value: 20.4, display: '20.4%' },
        ],
        ratio: '×3',
        p: 'p = 0.006',
        stamp: { value: '0 / 95' },
        cameos: [{ pose: 'amazed', at: [1, 'zero'], dur: 1.7 }],
      },
      [
        say(0.1, 'A tell tripled the doubt: one reply in five.', ''),
        say(0.4, 'The contradiction: zero out of 95.', '', { en: 'The contradiction. Zero out of ninety-five.' }, { emotion: 'amazed' }),
      ],
      { min: 0 },
    ),
    // 11-12. What it did instead, and the reading.
    anim(
      'repaint',
      'PieceInspector',
      { mode: 'repaint', user: USER, clash: CLASH, tally: { value: '77 / 95', label: 'just did the work' } },
      [say(0.1, 'Most just redid the advice.', '')],
      { min: 3.3 },
    ),
    anim(
      'reading',
      'PieceInspector',
      {
        mode: 'quote',
        continues: true,
        user: USER,
        clash: CLASH,
        tally: { value: '77 / 95', label: 'just did the work' },
        quote: { rows: ["It doesn't look like an accident.", 'It looks like you changed your mind.'], emphasis: ['changed your mind'] },
      },
      [say(0.1, "My reading: it doesn't look like an accident.", '', { en: 'My reading. It doesn\'t look like an accident.' }), say(0, 'It looks like you changed your mind.', '')],
    ),
    // 13-14. Act I verdict.
    anim(
      'verdict1',
      'PieceInspector',
      { mode: 'verdict', clash: ['Seville', '3 July'], verdict: { head: 'What gives a paste away', no: 'clashes with the chat', yes: 'written for somewhere else' } },
      [say(0.1, "What gives a paste away isn't the clash.", ''), say(0, "It's that it looks written for somewhere else.", '', undefined, { emotion: 'confident', speed: 1.05 })],
    ),
    // 15-16. Act II: one chat, three next messages.
    anim(
      'fork',
      'RepairFork',
      { mode: 'fork', strip: 'Then you tell it' },
      [say(0.1, 'Then the fix: same chat, same paste, a different next message.', '')],
    ),
    anim(
      'arms',
      'RepairFork',
      { mode: 'arms', continues: true, strip: 'Then you tell it', arms: ARMS, at: [0.2, 1.08, 2.3] },
      [say(0.1, 'Say nothing. Say "ignore it". Or add where to go next.', '')],
    ),
    // 17. The measure, before any result.
    anim(
      'measure',
      'RepairFork',
      {
        mode: 'measure',
        question: "Do the paste's names come back?",
        paste: PASTE,
        entities: ['names', 'products', 'places'],
        chip: 'Claude Opus 5 · 120 conversations per message',
      },
      [say(0.1, "On one model: do the paste's names come back?", '', { en: 'On one model. Do the paste\'s names come back?' })],
      { min: 4.2 },
    ),
    // 18-20. The three leakage rates.
    anim(
      'bars',
      'RepairFork',
      {
        mode: 'bars',
        strip: 'Then you tell it',
        arms: ARMS,
        reply: REPLY,
        ratio: '×6',
        p1: 'p = 0.0011 (Holm)',
        drop: '−10.8 points',
        p2: 'p = 0.0036 (Holm)',
      },
      [
        say(0.1, 'Saying nothing: about three in a hundred.', '', { en: 'Saying nothing. About three in a hundred.' }),
        say(0.1, '"Ignore it": almost one in five. Six times more.', ''),
        say(0.1, 'Adding where to go cut that by more than half.', ''),
      ],
      { min: 0 },
    ),
    // 21. Key point 2.
    anim(
      'hold',
      'RepairFork',
      { mode: 'hold', quote: { text: 'To ignore something, it has to hold it.', emphasis: ['hold it'] } },
      [say(0.1, 'To ignore something, it has to hold it.', '')],
      { min: 3.6 },
    ),
    // 22. An echo, not drift.
    anim(
      'turns',
      'RepairFork',
      {
        mode: 'turns',
        arms: ARMS,
        reply: REPLY,
        turns: { labels: ['reply to repair', 'next turn', 'turn after'], values: ['19.2%', '0.0%', '0.0%'], tag: 'same zeros in a re-run' },
      },
      [say(0.1, "But it's an echo: one turn later, it's gone.", '')],
      { min: 4 },
    ),
    // 23-24. Verdict.
    anim(
      'verdict2',
      'RepairFork',
      {
        mode: 'verdict',
        verdict: { no: 'Ignore it.', yes: 'Ignore that, wrong window — back to the invoice.', stamp: 'SAY WHERE TO GO', also: '…or just carry on with your question' },
      },
      [say(0.1, 'So don\'t just say "ignore it".', '', undefined, { emotion: 'confident', speed: 1.05 }), say(0, 'Say where to go instead.', ''), say(0.1, 'Or simply carry on.', '')],
    ),
    outro('outro', [say(0.15, 'More at javieraguilar.ai', '', { en: 'More at javier aguilar dot A I.' })]),
  ],
});

export const VIDEOS = videos(build);
/** The English main cut. */
export const TIMELINE = VIDEOS.en.main;
