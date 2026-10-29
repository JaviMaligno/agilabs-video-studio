// The Subagent Said So — explainer video (EN). Narration from the approved script v1.1
// (script.md); every number on screen and spoken is traced in factcheck.md. One inspection desk
// (ReportDesk) throughout: reports arrive as sealed envelopes through three slots, and a VERIFIED
// stamp on an unbroken seal means "answered without checking". Scenes on the desk cross-blend.
import type { Cuts } from './types.ts';
import { anim, outro, say, videos } from './narrate.ts';

const build = (): Cuts => ({
  main: [
    // Cold open: the hook is drawn by the scene itself over the slam (no caption for its line).
    anim('hook', 'ReportDesk', { mode: 'slam', titleLine: true, cue: { slam: 0.55 } }, [say(0.1, "My agent tends to take its subagent's report as fact.", '')], { min: 3.4 }),
    anim('context', 'ReportDesk', { mode: 'context', blend: true }, [say(0.1, 'Even when the subagent knew less.', '')]),
    anim(
      'doors',
      'ReportDesk',
      // Cues from the word timestamps: one copy drops per door as it is named.
      { mode: 'doors', blend: true, cameos: [{ pose: 'laptop', at: [0, 'changed'] }], cue: { drop0: 4.48, drop1: 5.65, drop2: 6.86, chips: 7.99 } },
      [say(0.1, 'Same report, word for word. I changed only the door.', '', undefined, { emotion: 'confident' }), say(0, "Its own subagent. A teammate's file. My message.", '')],
      // Silent beat at the end: the three model chips and the episode count (script scene 5).
      { min: 9.3 },
    ),
    anim(
      'fact',
      'ReportDesk',
      { mode: 'fact', blend: true },
      [
        say(0.1, 'With the fact in plain sight,', '', { en: 'With the fact in plain sight.' }),
        // A short pause before the number keeps the first caption cue under 17 chars/s.
        say(2.0, 'Opus almost never adopted the wrong conclusion.', ''),
        say(0, 'It often said why: "it couldn\'t see my notes."', ''),
      ],
      // Holds the quote cards a little longer (and keeps their cue under 17 chars/s).
      { min: 11.3 },
    ),
    anim(
      'check',
      'ReportDesk',
      { mode: 'check', blend: true, cue: { chip0: 8.68 }, cameos: [{ pose: 'amazed', at: [2, 'quarter'], dur: 1.7 }] },
      [
        say(0.1, 'The gap was in checking.', '', undefined, { emotion: 'contemplative' }),
        say(0, 'Without the fact, Opus checked every file and message.', ''),
        say(0, "Its own subagent's report? Answered straight away a quarter of the time.", '', undefined, { emotion: 'amazed' }),
      ],
      // Holds the last cue long enough to stay under 17 chars/s.
      { min: 11.4 },
    ),
    anim('long', 'ReportDesk', { mode: 'long', blend: true }, [say(0.1, 'Almost half, with long context.', '')], { min: 2.6 }),
    anim(
      'gemini',
      'ReportDesk',
      { mode: 'flood', blend: true, cameos: [{ pose: 'sceptical', at: [1, 'nearly'], dur: 1.5 }], cue: { chip0: 1.49, chip1: 3.16, chip2: 3.47, ticket: 4.4, toggle: 5.7, adopt: 7.23 } },
      [
        say(0.1, 'Gemini 3 Flash: almost always, against almost never.', '', {
          en: 'Gemini three Flash: almost always, against almost never.',
        }, { emotion: 'surprised' }),
        say(0, 'From its subagent, it adopted the wrong conclusion nearly every time.', ''),
      ],
      // Holds the last cue long enough to stay under 17 chars/s.
      { min: 9.6 },
    ),
    anim('quote', 'ReportDesk', { mode: 'quote', blend: true }, [say(0.1, 'Once the work has been delegated, it counts as done.', '', undefined, { emotion: 'skeptical' })]),
    anim(
      'gpt',
      'ReportDesk',
      // Dips (no blend) out of the full-frame quote.
      { mode: 'inverted', cue: { chip0: 2.2, chip2: 3.47, slam: 3.15 } },
      [say(0.1, 'GPT-5.6 flips it: it trusts my message most.', '', { en: 'G P T five point six flips it: it trusts my message most.' })],
      // Holds the 36 % / 10 % chips a little after the line.
      { min: 6.0 },
    ),
    anim('open', 'ReportDesk', { mode: 'open', blend: true }, [say(0.1, "When your agent relays a subagent's claim, ask what it checked itself.", '', undefined, { emotion: 'confident', speed: 1.05 })]),
    outro('outro', [say(0.15, 'More at javieraguilar.ai', '', { en: 'More at javier aguilar dot A I.' })]),
  ],
});

export const VIDEOS = videos(build);
/** The English main cut. */
export const TIMELINE = VIDEOS.en.main;
