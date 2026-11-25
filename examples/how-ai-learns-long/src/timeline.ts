// How an AI learns — the long YouTube version (EN, landscape, 7 chapters). Narration from
// script.md v2, rows 1-48, one line per row, in order, verbatim.
// One everyday example from start to finish: a small online shoe shop whose AI was "taught" the
// returns policy ("Returns: 30 days, unworn, in the box"). The thread through every chapter: the
// policy changes from 30 days to 14 — what do you have to do? Recurring objects: the shop chat,
// the house robot, the book of what the model knows (with its "manners" chapter and the sticky
// note "One line, please"), the note (the prompt), the binder (looking it up), the clear sheet (LoRA).
// Each anim scene passes a `mode`; its lines are the beats the component plays on.
// Marks ([line, word]) are estimated from the text until real TTS exists.
import type { Cuts, Scene } from './types.ts';
import { anim, intro, say, videos, voice } from './narrate.ts';
import { END_TAIL } from './anim/ShopRecipe.state.ts';
import { WORDS } from './audio.generated.ts';
import { resolveMark, type MarkSpec } from './marks.ts';

/** Marks resolved to scene seconds. */
const finish = (scenes: Scene[]): Scene[] => {
  const words = WORDS[voice()];
  return scenes.map((s) => {
    if (!s.anim || !Array.isArray(s.anim.props.marks)) return s;
    const marks = (s.anim.props.marks as MarkSpec[]).map((m) => resolveMark(s.lines, m, words, voice()));
    return { ...s, anim: { ...s.anim, props: { ...s.anim.props, marks } } };
  });
};

const CONFIDENT = { emotion: 'confident' } as const;
const SKEPTICAL = { emotion: 'skeptical' } as const;
const CURIOUS = { emotion: 'curious' } as const;
const LORA = (en: string) => ({ en: en.replace(/LoRA/g, 'Lora') });

const build = (): Cuts => ({
  main: finish([
    // 0 · Intro (cold open: the question alone on frame 0; the answer quotes the policy, then grows into three paragraphs)
    intro(
      'cold',
      [say(0.1, "You taught your AI your shop's returns policy. It quotes it perfectly. But you asked for one line, and it wrote three paragraphs.", '')],
      3,
      { name: 'ShopChat', props: { mode: 'cold', marks: [[0, 'perfectly'], [0, 'one'], [0, 'three']] } },
    ),
    anim('doors', 'FourDoors', { mode: 'intro', marks: [[0, 'four'], [1, 'thorough'], [1, 'damage'], [2, 'cheapest'], [2, 'first']] }, [
      say(0.2, "Teaching an AI sounds like one thing. It's really four different things, and they cost, and break, very differently.", ''),
      say(0, "I've tested some of them myself. And the most thorough way to teach it was the one that did the most damage.", '', undefined, CURIOUS),
      say(0, "Spoiler: what most shops need is the cheapest one. But first, where does an AI's knowledge come from?", ''),
    ]),

    // 1 · Two ways to teach
    anim(
      'school',
      'KnowledgeBook',
      { mode: 'school', marks: [[0, 'school'], [0, 'packed'], [0, 'millions'], [1, 'conversations'], [1, 'manners'], [1, 'line'], [1, 'tuning'], [1, 'remember']] },
      [
        say(0.2, 'Before you ever chat with an AI, it has been to school. It read a huge amount of text, and what it learned got packed into the model. That\'s pre-training. You won\'t be doing it: for the big models, it costs millions. Small ones cost far less, but they also know far less.', ''),
        say(0, 'Then a second, much shorter training turns it into an assistant. It\'s shown example conversations: a question, a good answer, an instruction like "one line, please" followed to the letter. That\'s instruction tuning. Think of it as its manners. Remember that one.', ''),
      ],
      { chapter: 'Two ways to teach' },
    ),
    anim('roads', 'TwoRoads', { marks: [[0, 'leave'], [0, 'change'], [1, 'fourteen']] }, [
      say(0.2, 'From there, there are two ways to teach it your shop. You can leave the model as it is and hand it what it needs. Or you can change the model itself. That\'s fine-tuning.', ''),
      say(0, 'And here\'s the question for every one of them: your returns policy changes from thirty days to fourteen. What do you have to do?', '', undefined, CURIOUS),
    ]),

    // 2 · The prompt
    anim(
      'note',
      'BriefingNote',
      { marks: [[0, 'note'], [1, 'employee'], [2, 'code'], [3, 'edit'], [4, 'buried'], [5, 'read'], [5, 'fits'], [5, 'room'], [6, 'catalogue']] },
      [
        say(0.2, 'The simplest way is a note. Before every chat, the AI gets a few lines from you: your policy, your tone, one example of a good answer. That\'s the prompt.', ''),
        say(0, "It's like the briefing you give a new employee each morning. They read all of it, every time, before they start.", ''),
        say(0, 'Most apps let you write it without any code: custom instructions, a project, a custom GPT.', ''),
        say(0, 'The policy changes to fourteen days? You edit one line. Next chat, it knows.', ''),
        say(0, 'The catch: the longer the note, the more the line that matters competes with everything else. Coding assistants run on notes thousands of words long, and they work. How long is too long depends on the model.', ''),
        say(0, 'Every model can only read so much at once: its context window. And even when the note fits, you want to leave plenty of room for the conversation itself.', ''),
        say(0, 'So what about your whole catalogue, far too big for a note?', '', undefined, CURIOUS),
      ],
      { chapter: 'The prompt' },
    ),

    // 3 · Looking it up
    anim(
      'manual',
      'ShopManual',
      { marks: [[0, 'manual'], [1, 'whole'], [2, 'upload'], [3, 'swap'], [4, 'wrong'], [5, 'inside']] },
      [
        say(0.2, "Then you give it a manual. Your catalogue and policies stay in documents, and when a question comes in, the AI looks up the pages it needs and reads just those. Engineers call this retrieval. RAG is the best-known way to do it. I'll call it looking it up.", '', { en: "Then you give it a manual. Your catalogue and policies stay in documents, and when a question comes in, the AI looks up the pages it needs and reads just those. Engineers call this retrieval. Rag is the best-known way to do it. I'll call it looking it up." }),
        say(0, 'The difference from the note: the note is read whole, every time. The manual is opened only when needed, at the right page.', ''),
        say(0, 'When you upload files to a project or a GPT, it works roughly like this: with big files, the app searches them and hands the AI the parts that seem relevant.', ''),
        say(0, 'The policy changes? You swap the page. Nothing to retrain.', ''),
        say(0, "Can it still get things wrong? Yes. If it opens the wrong page, or doesn't think to look, it answers from school, and sounds just as sure.", '', undefined, SKEPTICAL),
        say(0, 'Notice something: so far, nothing has changed the AI itself. It knows your shop only while the note or the manual is there. What if you want it inside?', ''),
      ],
      { chapter: 'Looking it up' },
    ),

    // 4 · Full fine-tuning
    anim(
      'finetune',
      'KnowledgeBook',
      { mode: 'finetune', marks: [[0, 'examples'], [1, 'rewritten'], [2, 'damage']] },
      [
        say(0.2, 'That\'s fine-tuning. You show it lots of examples of what you want, say your best past replies to customers, and it adjusts itself until it answers like them.', ''),
        say(0, 'Picture the model as one huge book of everything it knows. Full fine-tuning lets every page be rewritten. In reality, millions or billions of numbers, all free to change.', ''),
        say(0, "It's the most thorough way. And it's the one that did the most damage.", '', undefined, CONFIDENT),
      ],
      { chapter: 'Full fine-tuning' },
    ),
    anim('terminal', 'TerminalTest', { mode: 'full', marks: [[0, 'commands'], [0, 'learned'], [1, 'quiz'], [1, 'food'], [1, 'points'], [2, 'worse'], [2, 'third'], [3, 'forget'], [4, 'none']] }, [
      say(0.2, 'In my test, I gave a small open model one narrow job, as foreign to it as a new dialect: I fed it thousands of computer commands, each with what the computer printed back. With full fine-tuning, it learned the job well.', ''),
      say(0, 'How did I check what it lost? With a general knowledge quiz. Questions like: plants use sunlight to make… soil, minerals, food, or water? It lost some points there.', '', { en: 'How did I check what it lost? With a general knowledge quiz. Questions like: plants use sunlight to make: soil, minerals, food, or water? It lost some points there.' }),
      // at 27: a beat of silence after "It lost some points there" so the meter's drop can be read
      say(27, 'It also got worse at following instructions, the manners from school. On a standard test of that, more than a third worse.', ''),
      say(0, 'Rewriting pages for the new job had written over some of the old ones. Nobody asked it to forget.', ''),
      say(0, 'And it learned the job narrowly. On commands it had never seen in its lessons, it got none right.', ''),
    ]),
    anim('callback', 'ShopChat', { mode: 'callback' }, [
      say(0.2, 'Teach a model hard enough on one narrow thing, and you can end up with the chat from the start.', ''),
    ]),
    anim('retrain', 'KnowledgeBook', { mode: 'retrain', marks: [[0, 'again'], [0, 'stick'], [0, 'habits'], [1, 'without']] }, [
      say(0.2, "And when the policy changes to fourteen days? You train again. And even then, facts taught this way don't always stick. Fine-tuning is better at habits than at facts.", ''),
      say(0, 'So, is there a way to change the model without rewriting the book?', '', undefined, CURIOUS),
    ]),

    // 5 · LoRA
    anim(
      'sheet',
      'ClearSheet',
      { mode: 'lay', marks: [[0, 'lay'], [1, 'through'], [1, 'underneath']] },
      [
        say(0.2, "There is. It's called LoRA. Instead of rewriting the pages, you lay a thin clear sheet over the book, and write only on the sheet.", '', LORA("There is. It's called LoRA. Instead of rewriting the pages, you lay a thin clear sheet over the book, and write only on the sheet.")),
        say(0, 'The model reads through the sheet, so its answers change. But the book underneath stays exactly as it was.', ''),
      ],
      { chapter: 'LoRA' },
    ),
    anim('loratest', 'TerminalTest', { mode: 'lora', marks: [[0, 'well'], [0, 'drop'], [0, 'up'], [1, 'some']] }, [
      say(0.2, "Same test, same job, with LoRA. It learned the job just as well. And following instructions didn't drop. It even went up a little.", '', LORA("Same test, same job, with LoRA. It learned the job just as well. And following instructions didn't drop. It even went up a little.")),
      say(0, 'On the commands it had never seen, it got some right, where the rewritten book got none.', ''),
    ]),
    anim('sheetmore', 'ClearSheet', { mode: 'more', marks: [[0, 'less'], [1, 'swap'], [1, 'coffees'], [2, 'upload'], [2, 'codes'], [3, 'research']] }, [
      say(0.2, 'No magic: it changes much less, so it breaks much less. The price is that it learns less hard. On a tougher job, rewriting the book might learn more.', ''),
      say(0, "It's also lighter. The sheet is small, you can keep several and swap them on the same book, and my tests ran on one rented graphics card for about the price of a couple of coffees. On a small model, that is.", ''),
      say(0, "Some AI companies let you upload examples and fine-tune from a web page. On an open model, it's a job for someone who codes.", ''),
      say(0, 'My test was small: one small model, one narrow job. But research on LoRA finds it too: it forgets less, and on harder jobs, it learns less.', '', LORA('My test was small: one small model, one narrow job. But research on LoRA finds it too: it forgets less, and on harder jobs, it learns less.')),
    ]),

    // 6 · What to use
    anim(
      'doors2',
      'FourDoors',
      { mode: 'labelled', marks: [[0, 'which'], [0, 'note'], [0, 'fine']] },
      [say(0.2, 'So when someone says they trained an AI on their data, ask which one. Often it\'s a note or a manual. Sometimes it\'s a fine-tune.', '', undefined, CONFIDENT)],
      { chapter: 'What to use' },
    ),
    anim('recipe', 'ShopRecipe', { mode: 'recipe', marks: [[0, 'prompt'], [1, 'facts'], [2, 'LoRA'], [3, 'ordinary'], [4, 'check'], [3, 'general'], [3, 'manners']] }, [
      say(0.2, 'For your shop, start with the prompt: your policy, your tone, one good answer.', ''),
      say(0, 'When the facts are many, or change often, add looking it up.', ''),
      say(0, "Fine-tune only for something asking can't get you: a style, a format, a skill. And try LoRA before full fine-tuning.", '', LORA("Fine-tune only for something asking can't get you: a style, a format, a skill. And try LoRA before full fine-tuning.")),
      say(0, "If someone does rewrite the whole book for you, ask whether they mixed ordinary text back into the lessons. In my test, a tenth of it won back most of the general knowledge. But not the manners: following instructions dropped just as much.", ''),
      say(0, 'And whatever you change, check more than the new thing. My model aced its new job and quietly lost some of its manners.', ''),
    ]),
    // "Training complete" lands on "finished" and the scene holds ~3 s after it, so the banner can be read
    anim('flat', 'FlatLine', { marks: [[0, 'recipe'], [0, 'nothing'], [0, 'finished']] }, [
      say(0.2, 'A fine-tune can even fail without telling you. Once, I trained a small model with the recipe it came with, made for far more data than I had. It learned nothing, it was just guessing, and the training still finished with a tick.', '', undefined, SKEPTICAL),
    ], { min: 15.2 }),
    anim('today', 'ShopRecipe', { mode: 'today', marks: [[0, 'note'], [0, 'ten'], [1, 'cheapest'], [1, 'check']] }, [
      say(0.2, 'Something you can do today: write the note, and try it on ten real questions from your customers. You may find you can stop right there.', ''),
      say(0, "Teaching an AI isn't one thing. Start with the cheapest way. And if you go deeper, check what already worked, not just what's new.", '', undefined, CONFIDENT),
    ]),
    // YouTube end screen (plugin rule, PR #32): the recipe stays while the site is spoken, then
    // END_TAIL (18 s) without narration, dimmed, with the avatar pointing at the free upper right and
    // the site and credits in a low band, in place of the centred outro card the boxes would cover.
    // Id kept as 'outro' so the spoken line keeps its take (outro-01).
    anim('outro', 'ShopRecipe', { mode: 'endtail' }, [say(0.15, 'More at javieraguilar.ai.', '', { en: 'More at javier aguilar dot A I.' })], { min: 0.15 + 2.4 + END_TAIL }),
  ]),
});

export const VIDEOS = videos(build);
/** The English main cut. */
export const TIMELINE = VIDEOS.en.main;
