// The Riemann hypothesis has a proof nobody has read — the long YouTube version (EN, landscape,
// 8 chapters). Narration from script.md v0.3, rows 1-58, in order, verbatim; long rows are split
// into several lines so each caption stays readable and each visual change has its own beat.
// Spine: the approved short's trail (chapters 0, 4, 5, 8); explanatory chapters (1, 2, 3, 6, 7)
// on bespoke "blackboard" components. `chapter` on the first scene of each chapter draws the card
// and becomes a YouTube chapter (npm run deliver -> out/youtube-chapters-en.txt).
//
// Component contract (each bespoke component reads `mode` and the scene's beats, one per line):
//   FileStack  loom | count                       rows 1, 4
//   NotePage   note | footnote                    rows 2-3
//   Trail      overview | open | past | pick | unfold | outrun | draw | second | twoquote |
//              revised | mountain | crowd | map | catchup | forks | closer
//   PrimeLine  claimed                            rows 6-9
//   CriticalLine zeros                            row 10 (+ trivial zeros, strip)
//   ClaimPile  history | runit                    rows 11-15
//   PaperTower tower | slop                       rows 16-18
//   Checklist  checks                             rows 19-23
//   TwoProofs  split                              rows 33-35
//   PrimeBox   idea                               rows 36-40
//   PrimeCurve waves                              rows 41-44
//   ChainTradeoff chain | credit                  rows 45-50
import type { Cuts, Scene } from './types.ts';
import { anim, intro, L, outro, say, videos } from './narrate.ts';
import { FPS, sceneStarts } from './timing.ts';

/** Animations whose ambient motion runs on the video's clock, so it never jumps between scenes. */
const CLOCKED = ['FileStack', 'Trail'];

/** Gives each of those scenes the video second it starts at (`clock`). */
const withClock = (scenes: Scene[]): Scene[] => {
  const { starts } = sceneStarts(scenes);
  return scenes.map((s, i) =>
    s.anim && CLOCKED.includes(s.anim.name) ? { ...s, anim: { ...s.anim, props: { ...s.anim.props, clock: +(starts[i] / FPS).toFixed(3) } } } : s,
  );
};

const CONFIDENT = { emotion: 'confident' } as const;
const CURIOUS = { emotion: 'curious' } as const;
const SKEPTICAL = { emotion: 'skeptical' } as const;
const AMAZED = { emotion: 'amazed' } as const;
const HAPPY = { emotion: 'happy' } as const;

const build = (): Cuts => ({
  main: withClock([
    // 0 · Intro. Cold open: the stack is already growing on frame 0, the hook sits over it.
    intro('hook', [say(0.1, '"Math is dead." I read that a lot this week.', '')], 3, { name: 'FileStack', props: { mode: 'loom' } }),
    anim('note', 'NotePage', { mode: 'note' }, [
      say(0.3, 'On 20 November, a mathematician called Levent Alpöge,', '', { en: 'On the twentieth of November, a mathematician called Levent Alpöge,' }),
      say(0, 'who works at Anthropic, which makes Claude, posted a four-page note.', ''),
      say(0.2, 'It said: "I believe I have, working with Claude, discovered a proof of the Riemann Hypothesis."', ''),
    ]),
    anim('footnote', 'NotePage', { mode: 'footnote' }, [
      say(0.2, "The proof wasn't in the note.", ''),
      say(0, 'Its footnote links to code in Lean,', ''),
      say(0, 'a language where a computer checks every step of a proof, like a spell-checker for maths.', ''),
    ]),
    anim('stack', 'FileStack', { mode: 'count' }, [
      say(0.3, 'By that evening, independent people had run the checkers,', ''),
      say(0, 'and the checkers said yes.', ''),
      say(0.2, 'Nobody has read it.', '', undefined, CONFIDENT),
    ]),
    anim('overview', 'Trail', { mode: 'overview' }, [
      say(0.3, "In this video I'll tell you why anyone took it seriously, what the humans did,", ''),
      say(0, 'and the idea at its heart, which fits in one sentence.', ''),
      say(0.2, 'Because I think "math is dead" points the wrong way.', '', undefined, CONFIDENT),
    ]),

    // 1 · What was claimed
    anim('claimed', 'PrimeLine', { mode: 'claimed' }, [
      say(0.2, 'The Riemann hypothesis is the most famous open problem in mathematics.', ''),
      say(0, "It's 167 years old, and it carries a million-dollar prize.", '', { en: "It's a hundred and sixty-seven years old, and it carries a million-dollar prize." }),
      say(0.3, 'In one line, it says the prime numbers are spread as evenly as they possibly could be.', ''),
      say(0.3, 'Near a million, about one number in fourteen is prime.', ''),
      say(0, 'In the 1,000 numbers after a million, that guess gives 72 primes.', '', { en: 'In the thousand numbers after a million, that guess gives seventy-two primes.' }),
      say(0.2, 'There are 75.', '', { en: 'There are seventy-five.' }, AMAZED),
      say(0.3, 'The guess is never exact. The hypothesis says it can only drift off', ''),
      say(0, "by not much more than the square root of how far you've counted.", ''),
    ], { chapter: L('What was claimed', '') }),
    anim('zeros', 'CriticalLine', { mode: 'zeros' }, [
      say(0.2, 'Riemann tied that drift to one function, the zeta function,', ''),
      say(0, 'and the points where it equals zero.', ''),
      say(0.2, 'Some of them are called trivial, at −2, −4, −6 and so on.', '', { en: 'Some of them are called trivial, at minus two, minus four, minus six, and so on.' }),
      say(0, 'They come from a simple factor in its formula, and barely touch the primes.', ''),
      say(0.3, 'All the others lie in a narrow strip.', ''),
      say(0.2, 'The hypothesis says they all sit on its middle line, at one half.', ''),
      say(0.2, 'Every zero ever computed is on it,', ''),
      say(0, 'but computing them can never prove it.', '', undefined, SKEPTICAL),
    ]),

    // 2 · Proved before
    anim('history', 'ClaimPile', { mode: 'history' }, [
      say(0.2, 'And it had been "proved" before. Many times.', '', { en: 'And it had been, quote unquote, proved before. Many times.' }, SKEPTICAL),
      say(0.3, "In 1885, Thomas Stieltjes wrote to a colleague that he'd proved something that would imply it.", ''),
      say(0, 'He never published a proof. Many others have tried since.', ''),
      say(0.3, 'In 2018, Michael Atiyah, one of the most decorated mathematicians alive, claimed a proof at a conference.', ''),
      say(0.2, 'I was studying maths at university then.', ''),
      say(0, 'Nobody around me took it seriously, not even for an afternoon.', ''),
      say(0.3, 'Nobody was unkind.', ''),
      say(0, "A claim that big, on a short argument and a great name, wasn't worth checking.", ''),
    ], { chapter: L('Proved before', '') }),
    anim('runit', 'ClaimPile', { mode: 'runit' }, [
      say(0.2, 'This time, nobody had to believe anything.', '', undefined, CONFIDENT),
      say(0, 'Anyone could test it, against a statement others wrote.', ''),
      say(0.2, 'The reaction went from "who has the time?" to "run it."', ''),
    ]),

    // 3 · A proof nobody has read
    anim('tower', 'PaperTower', { mode: 'tower' }, [
      say(0.2, 'So what did they run?', '', undefined, CURIOUS),
      say(0.3, 'Over a hundred and seventy-five thousand files. Seventeen million lines.', ''),
      say(0, 'Written out for people, the author reckons, over a quarter of a million pages.', ''),
    ], { chapter: L('A proof nobody has read', '') }),
    anim('slop', 'PaperTower', { mode: 'slop' }, [
      say(0.2, 'He generated that long version, and chose not to post it.', ''),
      say(0, 'In his words, it would have been "some massive unreadable travesty of slop."', ''),
    ]),
    anim('checks', 'Checklist', { mode: 'checks' }, [
      say(0.2, 'So everything rests on the checker, and people attacked the checking from every side.', ''),
      say(0.3, 'Does it compile? Every file.', ''),
      say(0.2, 'Does it prove the right statement?', ''),
      say(0, 'It proves the version the Lean community wrote down beforehand,', ''),
      say(0, "so it can't have proved an easier one under the same name.", ''),
      say(0.3, 'Hidden assumptions? None, only the three basic rules every Lean proof starts from.', ''),
      say(0.2, 'Could the checker have a bug? A second checker, written independently, accepts it too.', ''),
      say(0.2, 'Others rebuilt it and got the same result. All in about a day.', ''),
      say(0.4, "Two rows stay open: a proof a person can read, and mathematicians who understand why it's true.", ''),
      say(0.2, 'A machine can say that it follows.', ''),
      say(0, "It can't say why.", '', undefined, CONFIDENT),
    ], { min: 46 }),

    // 4 · Who did what
    anim('open', 'Trail', { mode: 'open' }, [say(0.2, 'So who did what?', '', undefined, CURIOUS)], { chapter: L('Who did what', ''), min: 2.5 }),
    anim('past', 'Trail', { mode: 'past' }, [say(0.15, 'Alpöge had planned his whole career around this problem.', '')], { min: 4.5 }),
    anim('pick', 'Trail', { mode: 'pick' }, [
      say(0.15, 'His clue was a paper almost nobody discussed,', ''),
      say(0, 'in a pile of machine-written papers a rival lab, OpenAI, had released in October.', ''),
    ]),
    anim('unfold', 'Trail', { mode: 'unfold' }, [
      say(0.15, 'He recognised in it the skeleton of a 1969 trick by Sergei Stepanov, missing one ingredient.', ''),
      say(0.3, 'Picking that paper out of the pile is taste, and nobody automated it.', '', undefined, CONFIDENT),
    ]),
    anim('outrun', 'Trail', { mode: 'outrun' }, [
      say(0.15, 'He set the route. Then, in his words, "Claude began to leave me in awe."', ''),
      say(0.2, 'The decisive stretch is where he says he\'s "out of my element."', ''),
      say(0.2, "The model is an internal one; you can't run it.", ''),
    ]),
    anim('draw', 'Trail', { mode: 'draw' }, [say(0.15, 'Now his job is to understand his own proof, and write it properly.', '')], { min: 4.5 }),

    // 5 · The other proof
    anim('second', 'Trail', { mode: 'second' }, [say(0.2, 'The same afternoon, a second proof appeared.', '')], { chapter: L('The other proof', '') }),
    anim('twoquote', 'Trail', { mode: 'twoquote' }, [
      say(0.15, 'A draft by Alessandro Masullo. Twelve years of work, all human, no AI.', ''),
      say(0.2, 'And he had a message for discouraged mathematicians.', ''),
      say(0, '"We are still here. We are very much alive."', ''),
    ]),
    anim('revised', 'Trail', { mode: 'revised' }, [
      say(0.15, 'Within hours, people reported problems in it, found with the help of AI.', ''),
      say(0.2, 'It was already being revised, and nobody vouches for it yet.', ''),
    ]),
    anim('split', 'TwoProofs', { mode: 'split' }, [
      say(0.2, 'Put the two side by side.', ''),
      say(0.2, 'One proof is fully checked, and understood by nobody.', ''),
      say(0.2, 'The other was written for people, and checked by nobody.', '', undefined, CONFIDENT),
      say(0.4, 'Until this year, those two came together.', ''),
      say(0, 'The only way to check a proof was to understand it.', ''),
      say(0.4, 'And the million dollars? Not yet.', '', undefined, SKEPTICAL),
      say(0, 'The prize needs publication, two years\' wait, and general acceptance.', ''),
    ]),

    // 6 · The idea in one sentence
    anim('idea', 'PrimeBox', { mode: 'idea' }, [
      say(0.2, 'Back to the proof itself. The surprise is that', ''),
      say(0, 'the idea behind all those lines fits in one sentence.', '', undefined, CURIOUS),
      say(0.4, 'A whole number divisible by many primes cannot be small.', '', undefined, CONFIDENT),
      say(0.4, 'Every prime dividing a number takes up some of its size.', ''),
      say(0, 'So a number of known size fits only so many prime factors.', ''),
      say(0.2, "That's a ceiling on a count of primes.", ''),
      say(0.3, "It's the oldest trick. Chebyshev used it in 1850, on the factorial,", ''),
      say(0, 'and first showed roughly how many primes lie below a number.', ''),
      say(0.3, "The factorial isn't divisible enough to go further.", ''),
      say(0, 'The new proof uses a much more divisible number, whose size can be computed exactly.', ''),
    ], { chapter: L('The idea in one sentence', '') }),
    anim('waves', 'PrimeCurve', { mode: 'waves' }, [
      say(0.2, 'Why does a ceiling help? Each zero adds a wave to the count of primes,', '', undefined, CURIOUS),
      say(0, 'and if the zeros are all on the line, every wave stays small.', ''),
      say(0.3, 'You can watch the waves with nothing but a list of primes.', ''),
      say(0, 'Count them up to 10 million, subtract what you expect, and divide by the square root.', '', { en: 'Count them up to ten million, subtract what you expect, and divide by the square root.' }),
      say(0.4, 'It wobbles, but it never leaves a narrow band.', ''),
      say(0, 'The hypothesis says it stays inside forever.', ''),
      say(0.4, 'A wave too big would swing up as well as down, and break through the top.', ''),
      say(0.2, "That's why a ceiling, over long stretches, is enough.", '', undefined, CONFIDENT),
      say(0.4, 'A picture like this is evidence, not proof. The proof has to hold for every number, forever.', ''),
    ]),

    // 7 · Where the square root comes from
    anim('chain', 'ChainTradeoff', { mode: 'chain' }, [
      say(0.2, 'Still no square root. The second idea gives it.', ''),
      say(0.4, "Remember Stepanov's trick? In 1969 it gave a much simpler proof of a twin of the hypothesis,", '', undefined, CURIOUS),
      say(0, 'in a simpler world, curves over finite fields, already proved by Weil in the 1940s.', ''),
      say(0.2, 'The missing ingredient is something like derivatives, and whole numbers have none.', ''),
      say(0.4, "Alpöge's substitute is a chain,", ''),
      say(0, 'a construction applied again and again, each time making the number more divisible.', ''),
      say(0.2, 'A longer chain gives a sharper ceiling.', ''),
      say(0.3, 'But every link also adds a little error.', ''),
      say(0.2, 'Too short, and the ceiling is blunt. Too long, and the errors pile up.', ''),
      say(0.4, 'The best length is where they meet, at the square root.', ''),
      say(0.2, 'And the square root is exactly what the hypothesis needs.', '', undefined, AMAZED),
    ], { chapter: L('Where the square root comes from', '') }),
    anim('credit', 'ChainTradeoff', { mode: 'credit' }, [
      say(0.2, 'In the note, that suggestion, a chain as long as the square root, is credited to Claude.', ''),
      say(0.3, 'Alpöge adds: "And yet, what else could it be?"', ''),
    ]),
    anim('mountain', 'Trail', { mode: 'mountain' }, [
      say(0.2, 'Under that simple idea sits a mass of modern number theory, rebuilt from scratch.', ''),
      say(0.2, "That's where most of the seventeen million lines go.", ''),
    ]),

    // 8 · Is maths dead? (the approved short's ending, with the long cut's three reasons)
    anim('crowd', 'Trail', { mode: 'crowd' }, [
      say(0.2, "So, is mathematics dead? I don't think so.", '', undefined, CURIOUS),
      say(0.4, 'First, look how many people are watching.', ''),
      say(0.2, 'A problem about prime numbers made the front pages.', ''),
    ], { chapter: L('Is maths dead?', '') }),
    anim('map', 'Trail', { mode: 'map' }, [
      say(0.15, "Second, AI isn't only solving. It's helping us understand.", ''),
      say(0.2, 'Within a day there was a public map of the proof, drawn with AI.', ''),
      say(0.2, "With AI, volunteers have cut the proof's core by about a quarter.", ''),
      say(0, 'Mostly housekeeping so far, but the work has started.', ''),
    ]),
    anim('catchup', 'Trail', { mode: 'catchup' }, [say(0.15, 'Understanding is behind, and AI is how it catches up.', '', undefined, CONFIDENT)], { min: 4 }),
    anim('forks', 'Trail', { mode: 'forks' }, [
      say(0.2, 'And third, look at what it opens.', ''),
      say(0.3, 'Trying a new route used to cost a career.', ''),
      say(0.1, 'Now it costs weeks, so far more routes get tried.', ''),
      say(0.2, 'And the bigger questions are still open.', ''),
      say(0.4, "The real job was always picking what's worth proving, and explaining why it's true.", ''),
    ]),
    anim('closer', 'Trail', { mode: 'closer' }, [
      say(0.4, "So no, math isn't dead.", '', undefined, CONFIDENT),
      say(0.1, "I think it's more alive than ever.", '', undefined, HAPPY),
    ], { min: 5.5 }),
    // Silent card: badge, address, title and the credit line (SETTINGS.credit).
    outro('outro', [], 6),
  ]),
});

export const VIDEOS = videos(build);
/** The English main cut. */
export const TIMELINE = VIDEOS.en.main;
