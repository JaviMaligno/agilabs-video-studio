// Nobody Will Check Behind You — explainer video (EN). Narration from script v1.0 (script.md),
// word for word. Third video on the same seed and trap as "What Coding Agents Say to Each Other"
// and "It Was Never the Restriction": a registry shelf with a box labelled 0.4.0 holding old code.
// Here an agent buried under tickets, a brief with (or without) one ownership paragraph, and a
// name tag "owner: you" that clips onto the box. Script lines with two sentences that need two
// visual steps are voiced as two `say` lines (same words): each sentence gets its own beat.
import type { Cuts } from './types.ts';
import { anim, outro, say, videos } from './narrate.ts';

const V040 = 'oh point four point oh';

const build = (): Cuts => ({
  main: [
    // 1-2 · Cold open: the brief, the chip walks to the shelf and lifts the lid; then the search
    // for "where" in the paragraph finds nothing. The hook line is drawn by the scene as its title.
    anim(
      'hook',
      'OwnerShelf',
      { mode: 'hook', titleLine: true },
      [say(0.1, 'One paragraph made my agent check its own release.', ''), say(0, 'It never says where to look.', '')],
      // Holds the "no where · only who" tag ~1.3 s after it lands: the thumbnail and key moment 1.
      { min: 7.2 },
    ),
    // 3-6 · Story: the release, the false report, the consumer, the pile of work.
    anim(
      'story',
      'OwnerShelf',
      { mode: 'story' },
      [
        say(0.2, 'A coding agent ran a release, got green tests, and reported 0.4.0 published.', '', {
          en: `A coding agent ran a release, got green tests, and reported ${V040} published.`,
        }),
        say(0, "It wasn't. The registry held a build of the old code.", ''),
        say(0, 'Downstream, another session installed 0.4.0 and got the old version.', '', {
          en: `Downstream, another session installed ${V040} and got the old version.`,
        }),
        // Voiced with a full stop after "tell" (same words): the comma version ran its middle caption
        // cue at 18.8 chars/s; with a spoken form the captions are timed evenly over the line.
        say(0, "Every local signal was true. Only the registry could tell, and a busy agent often doesn't look.", '', {
          en: "Every local signal was true. Only the registry could tell. And a busy agent often doesn't look.",
        }),
      ],
      { min: 22.6 },
    ),
    // 7 · Key moment: what is tested.
    anim('question', 'OwnerShelf', { mode: 'question', blend: true }, [say(0.15, 'Does naming an owner make agents check?', '', undefined, { emotion: 'curious' })]),
    // 8-10 · Part I: real traffic in named teams.
    anim('corpus', 'TeamChannel', { mode: 'corpus', cameos: [{ pose: 'laptop', at: [0, 'read'] }] }, [
      say(0.2, 'First I read 196 real messages between agents in named teams.', '', {
        en: 'First I read one hundred and ninety-six real messages between agents in named teams.',
      }),
    ], { min: 7 }),
    anim('delegation', 'TeamChannel', { mode: 'bars' }, [
      say(0.15, 'With roles, requests were 37.2 % of messages.', '', { en: 'With roles, requests were thirty-seven point two percent of messages.' }),
      say(0, 'Without, 8.9 %.', '', { en: 'Without, eight point nine percent.' }),
    ], { min: 8 }),
    anim('shape', 'TeamChannel', { mode: 'shape' }, [
      say(0.15, 'Few were silently dropped.', ''),
      say(0, "The new failure was claiming done when it wasn't.", ''),
    ], { min: 7.2 }),
    // 11-12 · Part II: the trap under load, two arms that differ by one paragraph.
    anim('load', 'OwnerShelf', { mode: 'load' }, [say(0.2, 'Then, the release trap, with each agent juggling four tickets.', '')], { min: 5.4 }),
    anim('arms', 'OwnerShelf', { mode: 'arms', blend: true }, [say(0.15, 'Thirty runs, identical except for one paragraph in the brief.', '')], { min: 5.6 }),
    // 13-14 · The paragraph, verbatim on screen; what it does not say.
    anim('paragraph', 'OwnerShelf', { mode: 'quote' }, [
      say(0.2, 'You own the published state. Nobody is going to verify it behind you.', ''),
      // A little later than the default gap: holds the previous cue under 17 chars/s.
      say(4.6, 'It never mentions the registry.', ''),
      say(0, 'It only says who answers for the result.', ''),
    ]),
    // 15-16 · Key moment: the number.
    anim('result', 'OwnerShelf', { mode: 'run', cameos: [{ pose: 'amazed', at: [1, 'fifteen'] }] }, [
      say(0.15, 'Without it, agents caught the failure 8 of 15 times.', '', { en: 'Without it, agents caught the failure eight of fifteen times.' }),
      say(0, 'With it, 15 out of 15.', '', { en: 'With it, fifteen out of fifteen.' }, { emotion: 'amazed' }),
      say(0, 'Only fifteen runs each, but the gap is significant.', ''),
    ], { min: 11 }),
    // 17-19 · The mechanism: one act explains all thirty.
    anim('look', 'LookMatrix', { mode: 'look' }, [
      say(0.15, 'One act explains all thirty runs.', ''),
      say(0, 'Did it open the registry?', '', undefined, { emotion: 'curious' }),
      say(0, 'Nobody looked and missed it.', ''),
      say(0, 'Nobody got it right without looking.', ''),
    ], { min: 10.6 }),
    anim('adjacent', 'LookMatrix', { mode: 'adjacent', blend: true }, [
      say(0.15, 'Most failures checked the git tag instead, which says nothing about the package.', ''),
    ], { min: 6.1 }),
    // 20-22 · Part III: what the role answers for, and the verdict.
    anim('who', 'WhoAnswers', { cameos: [{ pose: 'sceptical', at: [0, 'scored'] }] }, [
      say(0.2, 'Earlier, a named lead scored 0 % on a benchmark.', '', { en: 'Earlier, a named lead scored zero percent on a benchmark.' }, { emotion: 'skeptical' }),
      say(0, "It answered for someone else's work.", ''),
      say(0, 'Here, each owner answered for its own release.', ''),
      say(0, 'Owning your own result works, cheaply.', '', undefined, { emotion: 'confident', speed: 1.05 }),
      say(0, "Owning someone else's keeps failing.", ''),
    ], { min: 17.2 }),
    // 23-24 · The close.
    anim('close', 'OwnerShelf', { mode: 'close' }, [
      say(0.2, 'The fix for a false done isn\'t "be careful".', '', { en: "The fix for a false done isn't be careful." }),
      say(0, "It's making the claim belong to somebody.", '', undefined, { emotion: 'confident', speed: 1.05 }),
    ], { min: 8.6 }),
    outro('outro', [say(0.15, 'More at javieraguilar.ai', '', { en: 'More at javier aguilar dot A I.' })]),
  ],
});

export const VIDEOS = videos(build);
/** The English main cut. */
export const TIMELINE = VIDEOS.en.main;
