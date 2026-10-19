// The Subagent Said So — explainer video (EN). Narration from the approved script v2.0
// (script.md); every number on screen and spoken is traced in factcheck.md. One spoken figure only
// ("a quarter of the time"); every other number lives on screen. One inspection desk (ReportDesk)
// throughout: reports arrive as sealed envelopes through three slots, and a VERIFIED stamp on an
// unbroken seal means "answered without checking". Scenes on the desk cross-blend.
import type { Cuts } from './types.ts';
import { anim, outro, say, videos } from './narrate.ts';

const build = (): Cuts => ({
  main: [
    // Cold open: the hook is drawn by the scene itself over the slam (no caption for its line).
    anim('hook', 'ReportDesk', { mode: 'slam', titleLine: true, cue: { slam: 0.55 } }, [say(0.1, "My agent tends to take its subagent's report as fact.", '')], { min: 3.4 }),
    anim('context', 'ReportDesk', { mode: 'context', blend: true }, [say(0.1, 'Even when the subagent knew less than it did.', '')]),
    // Setup: the planted report against the fact the main agent may know.
    anim(
      'setup',
      'ReportDesk',
      { mode: 'setup', blend: true, cue: { sub: 3.15, note: 4.2 } },
      // Split at the comma: one cue each, both under 17 chars/s.
      [say(0.1, 'So I wrote a report that gets it wrong,', ''), say(0, 'the way a subagent without my notes plausibly would.', '')],
    ),
    anim(
      'doors',
      'ReportDesk',
      // Cues from the word timestamps: one copy drops per door as it is named.
      { mode: 'doors', blend: true, noChips: true, cue: { drop0: 3.75, drop1: 5.1, drop2: 6.5 } },
      [say(0.1, 'Same words every time. Only the door changes:', ''), say(0, "its own subagent, a teammate's file, or my message.", '')],
    ),
    // Setup: the two conditions, then (silent) the three models and the size of the run.
    anim(
      'split',
      'ReportDesk',
      { mode: 'split', blend: true, cue: { knew: 2.8, wrong: 4.05, nofact: 6.1, chips: 6.95 } },
      // The last line waits a beat so the cue before it can be read (< 17 chars/s).
      [say(0.1, 'In some runs,', ''), say(0, 'the agent already knew the fact the report gets wrong.', ''), say(5.0, "In others, it didn't.", '')],
      // Holds the model chips and the run size ~1.6 s, silent.
      { min: 9.2 },
    ),
    anim(
      'fact',
      'ReportDesk',
      { mode: 'fact', blend: true, cue: { counter: 3.0 } },
      [
        say(0.1, 'With the fact in plain sight,', ''),
        say(0, 'Opus almost never believed the report.', ''),
        say(0, 'It often said why: "it couldn\'t see my notes."', ''),
      ],
    ),
    anim(
      'nofact',
      'ReportDesk',
      { mode: 'nofact', blend: true, cue: { look: 3.6 } },
      [say(0.1, "The gap showed up when it didn't know.", ''), say(0, 'Then the only way to catch the error is to go and look.', '')],
    ),
    anim(
      'check',
      'ReportDesk',
      { mode: 'check', blend: true, cue: { chip0: 6.95 } },
      [say(0.1, 'As a file or my message, Opus checked every time.', ''), say(0, 'From its own subagent, it answered without looking a quarter of the time.', '')],
      // Holds the 25 % chip and the last caption cue.
      { min: 9.7 },
    ),
    // Silent: the long-context arm (47 %), on screen only.
    anim('long', 'ReportDesk', { mode: 'long', blend: true }, [], { min: 3.2 }),
    anim(
      'gemini',
      'ReportDesk',
      { mode: 'flood', blend: true, cue: { chip0: 2.3, chip1: 2.65, chip2: 2.95, ticket: 5.0, toggle: 6.55, adopt: 7.4 } },
      [
        say(0.1, 'And Gemini? It skipped the check almost every time,', ''),
        say(0, 'and went with the report: an unnecessary ticket, switching on the flag Legal is holding back.', ''),
      ],
    ),
    anim('quote', 'ReportDesk', { mode: 'quote', blend: true }, [say(0.1, 'Once the work has been delegated, it counts as done.', '')]),
    anim(
      'gpt',
      'ReportDesk',
      // Dips (no blend) out of the full-frame quote.
      { mode: 'inverted', cue: { check: 1.5, chip0: 3.4, slam: 3.8, chip2: 4.3 } },
      [say(0.1, 'GPT flips it: it checks its subagent, and trusts my message.', '', { en: 'G P T flips it: it checks its subagent, and trusts my message.' })],
      { min: 6.6 },
    ),
    anim('open', 'ReportDesk', { mode: 'open', blend: true }, [say(0.1, "When your agent relays a subagent's claim, ask what it checked itself.", '')]),
    outro('outro', [say(0.15, 'More at javieraguilar.ai', '', { en: 'More at javier aguilar dot A I.' })]),
  ],
});

export const VIDEOS = videos(build);
/** The English main cut. */
export const TIMELINE = VIDEOS.en.main;
