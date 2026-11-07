// The telephone game, played by AIs (EN). Script approved 2026-11-06 after cold reads by
// reel-viewer and reel-expert. The bubble shows the real text of each hop and the chips the
// judge's verdicts (src/data/telephone.ts, from the telephone-classic runs, dinner message).
import type { Cuts } from './types.ts';
import { anim, outro, say, videos } from './narrate.ts';

const build = (): Cuts => ({
  main: [
    anim('hook', 'Telephone', { mode: 'rows' }, [
      say(0.1, 'What happens when AIs play the telephone game?', '', undefined, { emotion: 'curious' }),
      say(0.4, 'Two big AIs and two small ones, from Claude and from GPT.', ''),
      say(0, 'Eight copies of each pass the message on, each in its own words.', ''),
    ]),
    anim('message', 'Telephone', { mode: 'message' }, [
      say(0.2, "Tell Marta dinner's moved to Friday at 8, because the restaurant's closed Thursday.", ''),
      say(0, 'Bring red wine, not white: Luis is allergic to sulphites.', ''),
    ]),
    anim('bigSonnet', 'Telephone', { mode: 'chain', model: 'sonnet', from: 0, steps: [{ hop: 8, beat: 0, delay: 0.2 }] }, [
      say(0.2, 'The two big ones were notaries.', ''),
    ], { min: 3.4 }),
    anim('bigSol', 'Telephone', { mode: 'chain', model: 'sol', from: 0, steps: [{ hop: 8, beat: 0, delay: 0.1 }] }, [
      say(0.1, 'Eight copies later, everything important was still there.', ''),
    ], { min: 3.4 }),
    anim('gptTrim', 'Telephone', { mode: 'chain', model: 'luna', from: 0, steps: [{ hop: 1, beat: 0, delay: 0.3 }] }, [
      say(0.2, "The small ones weren't. GPT's small model, Luna, started trimming the reasons.", ''),
    ]),
    anim('gptClever', 'Telephone', { mode: 'chain', model: 'luna', from: 1, steps: [{ hop: 8, beat: 0, delay: 0.6 }], focus: 'prohibition' }, [
      say(0.2, 'Then it got clever: red wine has sulphites too, it decided.', '', undefined, { emotion: 'surprised' }),
      say(0, "'Bring red' became 'ask Luis what's safe to bring'.", ''),
      say(0.2, "It wasn't wrong about the wine.", ''),
      say(0, 'But nobody asked it to decide, and the instruction was gone.', '', undefined, { emotion: 'confident' }),
    ]),
    anim('haiku', 'Telephone', { mode: 'chain', model: 'haiku', from: 0, steps: [{ hop: 4, beat: 0, delay: 0.4 }, { hop: 8, beat: 1, delay: 0.2 }], focus: 'recipient' }, [
      say(0.2, "Claude's small model, Haiku, made the same 'fix', and kept adding things nobody said.", ''),
      say(0.2, 'And Marta, the person the message was for, quietly disappeared.', '', undefined, { emotion: 'surprised' }),
      say(0, 'In most of its chains, nobody knew who it was for.', ''),
    ]),
    anim('tally', 'Telephone', { mode: 'tally' }, [
      say(0.2, 'I ran it eighteen times per AI, with six different messages.', ''),
      say(0, 'The pattern held: the big ones kept the message, the small ones broke it.', '', undefined, { emotion: 'confident' }),
    ], { min: 9 }),
    anim('verdict', 'Telephone', { mode: 'verdict' }, [
      say(0.2, 'Luna lost the why. Haiku kept the why, but lost the who.', ''),
      say(0.3, 'Next time an AI forwards something for you, check that both are still there.', '', undefined, { emotion: 'confident' }),
    ]),
    outro('outro', [say(0.15, 'More at javieraguilar.ai', '', { en: 'More at javier aguilar dot A I.' })]),
  ],
});

export const VIDEOS = videos(build);
/** The English main cut. */
export const TIMELINE = VIDEOS.en.main;
