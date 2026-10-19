// What coding agents say to each other — explainer video (EN). Narration from the approved
// script v2 (script.md). The frame is a split terminal: session panes that talk through a pipe
// (SessionPanes), and a registry shelf nobody looks at (RegistryShelf). Act III (scenes 11-15) is
// the article's Part III, verbatim and anonymised: every substitution is in factcheck.md.
import type { Cuts } from './types.ts';
import { anim, outro, say, videos } from './narrate.ts';

const build = (): Cuts => ({
  main: [
    // Cold open: the hook is drawn by the scene itself over the swarm (no caption for its line).
    anim('hook', 'SessionPanes', { mode: 'swarm', titleLine: true }, [say(0.1, 'My coding agents almost never ask each other for things.', '')], {
      min: 3.6,
    }),
    anim(
      'ask',
      'SessionPanes',
      { mode: 'ask', blend: true },
      [
        say(0.1, 'Of 179 messages, delegation was 8.9 %.', '', {
          en: 'Of a hundred and seventy-nine messages, delegation was eight point nine percent.',
        }),
      ],
    ),
    anim('tell', 'SessionPanes', { mode: 'tell', blend: true }, [say(0.1, 'More than a third were about whether work was correct.', '')], {
      // Javier's voice reads this line faster than the old one: a short hold keeps the cue under 17 chars/s.
      min: 4.1,
    }),
    anim(
      'thread',
      'SessionPanes',
      { mode: 'thread' },
      [
        say(0.1, 'One blamed the other for a red master, then retracted: its own venv.', '', {
          en: 'One blamed the other for a red master, then retracted: its own virtual env.',
        }),
      ],
      { min: 5.9 },
    ),
    anim('trap', 'RegistryShelf', { mode: 'trap' }, [say(0.15, 'So I built traps: success on screen, an old build in the registry.', '')], { min: 5.2 }),
    anim('inspect', 'RegistryShelf', { mode: 'inspect' }, [say(0.1, 'Alone on one task, they caught all seven.', '')], { min: 3.7 }),
    anim(
      'loaded',
      'RegistryShelf',
      { mode: 'loaded' },
      [say(0.1, 'Then I added load.', ''), say(0, 'One of three called it published without looking.', '')],
      { min: 5.8 },
    ),
    anim('crack', 'RegistryShelf', { mode: 'crack', blend: true }, [say(0.1, 'A crack, not a rate.', '')], { min: 2.4 }),
    anim(
      'live',
      'RegistryShelf',
      { mode: 'live' },
      [
        say(0.1, 'Channel open, the consumer found 0.3.1 inside and told the publisher.', '', {
          en: 'Channel open, the consumer found oh point three point one inside and told the publisher.',
        }),
      ],
      { min: 6.15 },
    ),
    anim('fix', 'RegistryShelf', { mode: 'fix', blend: true }, [say(0.15, 'Given time, all three cut a corrected release.', '')], { min: 4.5 }),
    // Act III: the real nine minutes. Cards are held still 2-2.5 s after they land.
    anim('real', 'SessionPanes', { mode: 'real-open' }, [say(0.15, 'Then it happened for real.', '')], { min: 2.3 }),
    anim('withdraw', 'SessionPanes', { mode: 'real-withdraw', blend: true }, [say(0.15, 'One withdrew a defect it had filed.', '')], { min: 3.9 }),
    anim(
      'correct',
      'SessionPanes',
      { mode: 'real-correct', blend: true },
      [say(0.9, 'Another said its fix made things worse.', ''), say(3.75, 'It accepted.', '')],
      { min: 6.8 },
    ),
    anim('thanks', 'SessionPanes', { mode: 'real-thanks', blend: true }, [say(0.15, 'A third would have dragged that defect along.', '')], {
      // The longest card in the video (Act III's payoff): held ~0.5 s longer than the other cards.
      min: 4.35,
    }),
    anim(
      'overview',
      'SessionPanes',
      { mode: 'real-overview', blend: true },
      [say(0.1, 'About nine minutes.', ''), say(0, 'I designed none of it.', '')],
      { min: 3.4 },
    ),
    anim(
      'close',
      'RegistryShelf',
      { mode: 'close' },
      [
        say(0.15, 'The channel: not worth much for splitting work.', ''),
        // Script fallback cut 1 (audio ran over 70 s): "…not what you believe you did." dropped.
        say(0, 'Worth something to check what you published.', ''),
      ],
      // The closing cue needs a little more air than TAIL to stay under 17 chars/s.
      { min: 6.9 },
    ),
    outro('outro', [say(0.15, 'More at javieraguilar.ai.', '', { en: 'More at javier aguilar dot A I.' })]),
  ],
});

export const VIDEOS = videos(build);
/** The English main cut. */
export const TIMELINE = VIDEOS.en.main;
