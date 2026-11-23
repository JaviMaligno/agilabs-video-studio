# How an AI learns — long explainer for YouTube (EN) · script v2 (after viewer + expert cold read)

Concept video, landscape 16:9, ~6-7 min, with chapters. EN-only (ES column empty). A sequel to
"How an AI agent forgets": that video's chapter 1 ends on "teaching it for good means training it
again"; this one explains what that means and when you don't need it.

**Premise card v2 (approved by Javier, 2026-11-20).**
1. Question: when people say they "trained an AI on their data", what did they actually do? Is
   that fine-tuning, or just telling it what you want?
2. One example, start to finish: you want an AI that knows your small shop (an online shoe shop):
   its products, its returns policy, its tone. Thread through every chapter: "the policy changes
   from 30 days to 14 — what do you have to do?"
3. Frame 0: a chat after you "taught it" the policy. It quotes the policy perfectly, but you asked
   "in one line, please" and it writes three paragraphs. Open loop: "the most thorough way to teach
   it did the most damage", paid in chapter 4.
4. The experiment: a tool. The forgetting test (full fine-tuning vs LoRA) enters as one-line
   evidence in chapters 4-5 and in the verdict (replay); the Laya test enters once, in chapter 4,
   tied to "measure". Numbers are never transferred to the shop.
5. On screen: the three-paragraph chat; the book with its pages rewritten next to the same book
   with a clear sheet over it.

Order: cheapest to deepest (viewer: "what's useful for me must not arrive late"), with a spoiler
in the intro.

**Five fixed names, never synonyms** (term + analogy the first time, then the term):
the prompt (the note), looking it up (the manual), pre-training (school), full fine-tuning
(rewriting the book), LoRA (the clear sheet). "Fine-tuning" alone = changing the model, either way.

**Chapters (YouTube):** 0 Intro · 1 Two ways to teach · 2 The prompt · 3 Looking it up ·
4 Full fine-tuning · 5 LoRA · 6 What to use

**Recurring world:** the shop (a small shoe shop: shoebox logo, policy card "Returns: 30 days,
unworn, in the box"), the AI as the house robot, the chat window, the book of what it knows.

Sources (javieraguilar.ai): "The Forgetting You Don't Measure" (2026-07-06; Qwen2.5-0.5B-Instruct,
full FT vs LoRA, replay sweep, IFEval, unseen commands), "Teaching a Small Model to Recognise a
Sport From Moving Dots" (2026-10-31; Laya, official recipe learned nothing). General knowledge
(no test claimed): pre-training cost, instruction tuning, prompts/custom instructions, RAG.

| # | Ch | Component | EN line | ES line | Visual | Source sentence |
|---|---|---|---|---|---|---|
| 1 | 0 | bespoke: `ShopChat` (cold open) | You taught your AI your shop's returns policy. It quotes it perfectly. But you asked for one line, and it wrote three paragraphs. | | Frame 0: a chat. User: "Can I return shoes I've worn once? One line, please." Below, already there: three dense paragraphs quoting "30 days, unworn, in the box". "One line, please" pulses red. | — (everyday example; illustrates the instruction-following drop after full fine-tuning, no number transferred) |
| 2 | 0 | `ShopChat` | Teaching an AI sounds like one thing. It's really four different things, and they cost, and break, very differently. | | Pull back: four closed doors around the robot, unlabelled until their chapter. | — (thesis) |
| 3 | 0 | `ShopChat` | I've tested some of them myself. And the most thorough way to teach it was the one that did the most damage. | | One door glows, a crack runs across it. (curious) | "full fine-tuning pays three costs … that a single benchmark undersells, and LoRA mostly doesn't pay them" |
| 4 | 0 | `ShopChat` | Spoiler: what most shops need is the cheapest one. But first, where does an AI's knowledge come from? | | The smallest door gets a price tag "free"; title "How an AI learns". | — (framing; verdict of chapter 6, no test) |
| 5 | 1 | chapter card + bespoke: `KnowledgeBook` | Before you ever chat with an AI, it has been to school. It read a huge amount of text, and what it learned got packed into the model. That's pre-training. You won't be doing it: for the big models, it costs millions. Small ones cost far less, but they also know far less. | | Chapter card "1 · Two ways to teach". Books stream into one huge book in the robot's hands, label "pre-training (school)". A price tag "$$$$$$". | — (general knowledge) |
| 6 | 1 | `KnowledgeBook` | Then a second, much shorter training turns it into an assistant. It's shown example conversations: a question, a good answer, an instruction like "one line, please" followed to the letter. That's instruction tuning. Think of it as its manners. Remember that one. | | The label switches to "instruction tuning (manners)" and the price tag leaves; a few conversation cards (question → answer, "one line, please" → one line) slide in and become a thin chapter "manners"; the "one line, please" sticky note is pinned on it. | — (general knowledge: instruction tuning) |
| 7 | 1 | bespoke: `TwoRoads` | From there, there are two ways to teach it your shop. You can leave the model as it is and hand it what it needs. Or you can change the model itself. That's fine-tuning. | | A fork: left road "hand it what it needs" (a note, a manual), right road "change the model" (the book with a pen). Two doors on each side. | — (framing) |
| 8 | 1 | `TwoRoads` | And here's the question for every one of them: your returns policy changes from thirty days to fourteen. What do you have to do? | | The policy card: "30 days" struck, "14 days" written; it hovers over the fork. | — (thread) |
| 9 | 2 | chapter card + bespoke: `BriefingNote` | The simplest way is a note. Before every chat, the AI gets a few lines from you: your policy, your tone, one example of a good answer. That's the prompt. | | Chapter card "2 · The prompt". A note slides onto the robot's desk: policy, "friendly, short", one sample answer. Label "the prompt (the note)". | — (general knowledge: system prompt) |
| 10 | 2 | `BriefingNote` | It's like the briefing you give a new employee each morning. They read all of it, every time, before they start. | | A shop assistant caricature reading a note at the counter at opening time; the robot mirrors it. | — (analogy; the prompt is in the context on every turn) |
| 11 | 2 | `BriefingNote` | Most apps let you write it without any code: custom instructions, a project, a custom GPT. | | Three generic app panels: "Instructions", "Project", "GPT", each with the same note pasted in. | — (product analogy) |
| 12 | 2 | `BriefingNote` | The policy changes to fourteen days? You edit one line. Next chat, it knows. | | The note's "30" crossed, "14" written; a new chat answers "14 days". | — (illustrative) |
| 13 | 2 | `BriefingNote` | The catch: the longer the note, the more the line that matters competes with everything else. Coding assistants run on notes thousands of words long, and they work. How long is too long depends on the model. | | The note grows into a scroll that spills off the desk; the policy line sinks under it. | — (illustrative) |
| 14 | 2 | `BriefingNote` | So what about your whole catalogue, far too big for a note? | | Boxes of shoes, hundreds of product cards, pile up behind the desk. | — (transition) |
| 15 | 3 | chapter card + bespoke: `ShopManual` | Then you give it a manual. Your catalogue and policies stay in documents, and when a question comes in, the AI looks up the pages it needs and reads just those. Engineers call it RAG. I'll call it looking it up. | | Chapter card "3 · Looking it up". A binder on a shelf; a question arrives, the robot pulls out two pages. Label "looking it up (the manual)". | — (general knowledge: retrieval-augmented generation) |
| 16 | 3 | `ShopManual` | The difference from the note: the note is read whole, every time. The manual is opened only when needed, at the right page. | | Split screen: the note read top to bottom on every chat; the binder opened at one tab. | — (viewer's question: note vs manual) |
| 17 | 3 | `ShopManual` | When you upload files to a project or a GPT, it works roughly like this: with big files, the app searches them and hands the AI the parts that seem relevant. | | An upload arrow drops PDFs into the binder; a magnifier picks two paragraphs. | — (product analogy, "roughly") |
| 18 | 3 | `ShopManual` | The policy changes? You swap the page. Nothing to retrain. | | One page slides out ("30 days"), a new one slides in ("14 days"). | — (illustrative) |
| 19 | 3 | `ShopManual` | Can it still get things wrong? Yes. If it opens the wrong page, or doesn't think to look, it answers from school, and sounds just as sure. | | The robot opens "Shipping" instead of "Returns" and answers confidently; a red underline. (skeptical) | — (general knowledge) |
| 20 | 3 | `ShopManual` | Notice something: so far, nothing has changed the AI itself. It knows your shop only while the note or the manual is there. What if you want it inside? | | The note and the binder fade; the robot is blank again. The book glows. | — (transition) |
| 21 | 4 | chapter card + `KnowledgeBook` | That's fine-tuning. You show it lots of examples of what you want, say your best past replies to customers, and it adjusts itself until it answers like them. | | Chapter card "4 · Full fine-tuning". Example cards (customer question → your reply) stream into the book. | — (general knowledge: fine-tuning on examples) |
| 22 | 4 | `KnowledgeBook` | Picture the model as one huge book of everything it knows. Full fine-tuning lets every page be rewritten. In reality, millions or billions of numbers, all free to change. | | The book opens; a pen rewrites lines on every page. Label "full fine-tuning (rewriting the book)". | "full fine-tuning — every weight in the model is free to change" |
| 23 | 4 | `KnowledgeBook` | It's the most thorough way. And it's the one that did the most damage. | | Back to the cracked door from the intro; it opens onto the book. (confident) | — (payoff of the open loop) |
| 24 | 4 | bespoke: `TerminalTest` | In my test, I gave a small open model one narrow job, as foreign to it as a new dialect: I fed it thousands of computer commands, each with what the computer printed back. With full fine-tuning, it learned the job well. | | Say once what the test is: a small robot at a computer; a command card, the screen's reply, the robot's guess, a tick. Many ticks. | "I took Qwen2.5-0.5B-Instruct, generated a narrow 'terminal simulator' dataset (real shell commands and their real outputs), and continually pre-trained the model"; "exact-match … jumps from ~0.36 to ~0.90" |
| 24b | 4 | `TerminalTest` (quiz beat) | How did I check what it lost? With a general knowledge quiz. Questions like: plants use sunlight to make… soil, minerals, food, or water? It lost some points there. | | A quiz card: "Plants use sunlight to make…" with four options; "food" ticked; a points counter ticks down a little. | "General accuracy drops across the board: on average −0.078, and −0.15 on the worst-hit benchmark (ARC-Easy)." (ARC = grade-school science questions) |
| 25 | 4 | `TerminalTest` | It also got worse at following instructions, the manners from school. On a standard test of that, more than a third worse. | | The "manners" chapter of the book: lines blurred by the rewrites; the sticky "one line, please" falls off. On screen: "following instructions: more than ⅓ worse". | "Full fine-tuning drops it 37% relative (0.194 → 0.123)" |
| 26 | 4 | `TerminalTest` | Rewriting pages for the new job had written over some of the old ones. Nobody asked it to forget. | | Close-up: a rewritten page with the old "manners" text faint underneath. | "Full fine-tuning … lets the optimizer overwrite any weight — including the ones holding general ability." |
| 27 | 4 | `TerminalTest` | And it learned the job narrowly. On commands it had never seen in its lessons, it got none right. | | New, unfamiliar command cards; the robot's guesses all crossed; "none" on screen. | "on genuinely unfamiliar commands … full fine-tuning collapses to zero" |
| 28 | 4 | `ShopChat` | Teach a model hard enough on one narrow thing, and you can end up with the chat from the start. | | Brief callback: the three-paragraph answer, "One line, please" pulses. | — (bridge; hedged "can", no number transferred) |
| 29 | 4 | `KnowledgeBook` | And when the policy changes to fourteen days? You train again. And even then, facts taught this way don't always stick. Fine-tuning is better at habits than at facts. | | The policy card flips to 14; the book's page still says "30" in one corner; a "retrain" clock starts. | — (general knowledge; expert: fine-tuning facts is unreliable) |
| 30 | 4 | `KnowledgeBook` | So, is there a way to change the model without rewriting the book? | | The pen hovers, stops. (curious) | — (transition) |
| 31 | 5 | chapter card + bespoke: `ClearSheet` | There is. It's called LoRA. Instead of rewriting the pages, you lay a thin clear sheet over the book, and write only on the sheet. | | Chapter card "5 · LoRA". A transparent sheet lowers onto the open book; the pen writes on it. Label "LoRA (the clear sheet)". | "LoRA … freezes the original model and trains only a small set of add-on 'adapter' weights" |
| 32 | 5 | `ClearSheet` | The model reads through the sheet, so its answers change. But the book underneath stays exactly as it was. | | The robot reads book + sheet together; lift the sheet: the page underneath unchanged. | "because the original weights are frozen, the general knowledge they hold sits untouched by construction" |
| 33 | 5 | `TerminalTest` | Same test, same job, with LoRA. It learned the job just as well. And following instructions didn't drop. It even went up a little. | | Side by side: rewritten book vs book with sheet; same tick count; "manners" chapter intact, sticky note stays. | "learning the terminal task just as well (same ~0.90 accuracy)"; IFEval table: full FT −0.071, LoRA +0.033 |
| 34 | 5 | `TerminalTest` | On the commands it had never seen, it got some right, where the rewritten book got none. | | The unfamiliar command cards: a few ticks on the sheet side; "some" vs "none" on screen. | "full fine-tuning collapses to zero while LoRA still gets 0.15" |
| 35 | 5 | `ClearSheet` | No magic: it changes much less, so it breaks much less. The price is that it learns less hard. On a tougher job, rewriting the book might learn more. | | A dial "learn more, forget more ↔ learn less, forget less". | "LoRA learns the new task a bit less aggressively than full-FT … on a harder target … full fine-tuning's willingness to overwrite is exactly what you're paying for" |
| 36 | 5 | `ClearSheet` | It's also lighter. The sheet is small, you can keep several and swap them on the same book, and my tests ran on one rented graphics card for about the price of a couple of coffees. On a small model, that is. | | A rack of sheets labelled "shop tone", "support", "invoices"; one slides onto the book. A coffee cup next to a graphics card. | "The whole thing ran on a single spot T4 on Azure for about the price of a couple of coffees." |
| 37 | 5 | `ClearSheet` | Some AI companies let you upload examples and fine-tune from a web page. On an open model, it's a job for someone who codes. | | A generic "Fine-tune" web form with an upload box; beside it, a terminal. | — (general knowledge: hosted fine-tuning UIs exist) |
| 38 | 5 | `ClearSheet` | My test was small: one small model, one narrow job. But research on LoRA finds it too: it forgets less, and on harder jobs, it learns less. | | A paper cover silhouette next to the sheet. | "LoRA is known to forget less" (arXiv 2405.09673, "LoRA Learns Less and Forgets Less") |
| 39 | 6 | chapter card + bespoke: `ShopRecipe` | So when someone says they trained an AI on their data, ask which one. Often it's a note or a manual. Sometimes it's a fine-tune. | | Chapter card "6 · What to use". The four doors again, now labelled. (confident) | — (framing; hedged) |
| 40 | 6 | `ShopRecipe` | For your shop, start with the prompt: your policy, your tone, one good answer. | | Recipe item 1 appears: "1 · The prompt". | — (verdict) |
| 41 | 6 | `ShopRecipe` | When the facts are many, or change often, add looking it up. | | "2 · Looking it up (many facts, facts that change)". | — (verdict) |
| 42 | 6 | `ShopRecipe` | Fine-tune only for something asking can't get you: a style, a format, a skill. And try LoRA before full fine-tuning. | | "3 · Fine-tune for a habit → LoRA first". | "pick the training method deliberately (LoRA and full fine-tuning are genuinely different trades, not interchangeable defaults)" |
| 43 | 6 | `ShopRecipe` | If someone does rewrite the whole book for you, ask whether they mixed ordinary text back into the lessons. In my test, a tenth of it won back most of the general knowledge. But not the manners: following instructions dropped just as much. | | Sub-item under 3: "full fine-tuning? mix in ordinary text". A lesson stack with every tenth card from an ordinary book; the "manners" sticky stays crossed out. | "Ten percent replay recovers about 73% of the average forgetting" (article); EXPERIMENTS.md Phase 4: "the IFEval drop is unchanged (−0.079 at both ratios vs −0.071 at mix0, within seed noise)" |
| 44 | 6 | `ShopRecipe` | And whatever you change, check more than the new thing. My model aced its new job and quietly lost some of its manners. | | "4 · Check more than the new thing". The sticky "one line, please" on the floor. | "when you specialize a model, check more than one capability" |
| 45 | 6 | bespoke: `FlatLine` | A fine-tune can even fail without telling you. Once, I trained a small model with the recipe it came with, made for far more data than I had. It learned nothing, it was just guessing, and the training still finished with a tick. | | A "training complete ✓" banner over a robot whose four answer buttons are all lit the same. (skeptical) | "With the official recipe … the model had settled on giving all four options the same score"; "The notebook fine-tunes on about 6,000 examples … here there are about 1,100 per fold"; issue proposes "a warning when training stays at chance" |
| 46 | 6 | `ShopRecipe` | Something you can do today: write the note, and try it on ten real questions from your customers. You may find you can stop right there. | | The note + a checklist of 10 questions ticking. | — (practical step) |
| 47 | 6 | `ShopRecipe` | Teaching an AI isn't one thing. Start with the cheapest way. And if you go deeper, check what already worked, not just what's new. | | The full recipe on screen; the clear sheet over the book in the corner. (confident) | — (closing) |
| 48 | — | outro card | More at javieraguilar.ai | | Outro card. | — |

**Must show** (Javier, 2026-11-20 and premise card): the cold-open chat with the three-paragraph
answer; the rewritten book next to the book with the clear sheet; the "policy changes to 14 days"
thread in every chapter; the recipe built item by item.

**Spoken figures per chapter:** ch1 "millions" (general); ch4 "more than a third", "none"; ch5 none new ("some" vs "none"; coffee cost); ch6 "a tenth", "most".

Word count (EN narration, rows 1-46): 1,027 words → ~6 min at 2.9 words/s plus 7 chapter cards.
