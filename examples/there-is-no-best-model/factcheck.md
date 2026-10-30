# Fact-check — There Is No Best Model, Only a Frontier

Source: `personal-website-pareto/src/content/blog/en/there-is-no-best-model.md` (EN).
Every number and claim, spoken or on screen, traced to an article sentence.

| Claim | Where | Article sentence (quoted) |
|---|---|---|
| A newer model was faster and looked just as good… and I didn't switch | hook (spoken + hook card) | "terra was clearly faster, more expensive, and I couldn't see any difference in quality"; "In this case I decided to stop" |
| "✓ 6/6 correct" badge on terra | hook (screen) | "both models got the right primary code in all six pairs"; table: "Correct primary code: 6 / 6 · 6 / 6" |
| luna / terra names | hook, pertask, seconds, decision (screen) | "The service runs on `gpt-6-luna`. The candidate was `gpt-6.1-terra`" |
| New models keep coming, each claims to be best | story | Context framing; "the frontier changes with every release. Terra came out days before I tested it. Luna came out weeks before that." |
| Cheaper, faster, smarter: you rarely get all three | story (spoken; icons cheap/fast/smart, no robot lights all three) | "Choosing a model means trading at least three things: how good the answers are, how much they cost and how long they take. Rarely does one model win on all three." |
| Parcel: next-day fast and expensive, standard slow and cheap; $25 / $4 / $22 | parcel, dominated | Analogy, video only (prices invented for the analogy, not article figures) |
| Slow AND expensive: nobody picks it, it's dominated | dominated | "A model dominates another when it is at least as good on every axis and strictly better on one"; "A dominated model can be discarded without any debate" |
| The options nobody beats on everything form the Pareto frontier | frontier | "The models nobody dominates form the Pareto frontier." |
| small / mid / large / flagship on the staircase, two "dominated" dots | frontier (screen) | Figure 1 labels: "small", "mid", "large", "flagship", "dominated" (×2) |
| Between them, no measurement decides. You trade. | frontier (spoken; "you trade" slider) | "between two points on the frontier, no measurement decides. Moving along it means buying one thing with another" |
| Three axes: cost, speed and quality | orbit | "The first picture has two axes, and the problem has three." / "how good the answers are, how much they cost and how long they take" |
| With three, almost every model survives | orbit (spoken; nearly all points teal) | "with three axes almost nobody is dominated" |
| Treat quality as a gate; if a model can't do the task it's out; then choose on cost and speed | gate (spoken; floor rises, points drop, top view cost × latency) | "fix a quality floor, discard what doesn't reach it, and draw the frontier between cost and latency with whatever passes"; "the model has to be able to do the task" |
| "≥ 80%" floor label | gate (screen) | Illustrative threshold on an illustrative cloud (not an article figure; the scene's points are synthetic) |
| An agent that classifies companies | reasoning | "the agent that finds a company on the web, checks it is the right one and assigns it an industry code" |
| Dial low / default / high | reasoning (screen) | "I measured `gpt-6-luna` itself at three reasoning levels" |
| Less reasoning: 29% cheaper, stopped researching, out; "−29% · −16 s", "fails the gate" | reasoning (spoken + screen) | "`low` makes the agent stop researching ... It is 29% cheaper and 16 seconds faster, and it doesn't pass the gate." Figure: "fails the quality gate" |
| More reasoning: 16% pricier, no better, dominated; "+16% · +20%" | reasoning (spoken + screen) | "`high` passes the gate but buys nothing: +16% cost and +20% latency for the same accuracy within noise. The default dominates it." |
| Axis seconds (40/50/60 s) and point heights | reasoning (screen) | Figure 3 axis "median time (s)" with ticks 40, 50, 60 (positions taken from the figure) |
| A newer model: ten times the price per token; "10×" | pertask | "On that list, terra cost ten times more than luna."; table "Price per token (relative) 1× / 10×" |
| Only 23% more per task; "1.23×" | pertask | "Ten times per token became 23% more per task"; figure "Total cost / task ... 1.23×" |
| luna "1×" baseline | pertask (screen) | Table / figure 2: "1×" for luna |
| Both passed the gate | seconds | "But both pass the gate, and above it the decision is between cost and latency" |
| Are 27 seconds worth 2 cents? "−27 s", "2¢" | seconds | "is 27 seconds per classification worth 2.2 cents?" (rounded to 2 cents in the video, the author's choice) |
| About $3 per hour of waiting; "$3 / hour" card | seconds | "roughly \$3 per hour of waiting" |
| Here, it wasn't. I stayed with the cheaper model. | decision | "In this case I decided to stop: 23% more per classification for no visible gain in quality" |
| There's no best model | verdict | Title: "There Is No Best Model, Only a Frontier" |
| Measure per task | verdict | "draw the frontier with the cost and latency of the whole task in your system, not with the price list" |
| Set a quality floor | verdict | "a quality gate written down before the first call"; "fix a quality floor" |
| Put a price on your seconds | verdict | "the trade made explicit: how much a second is worth" |
| javieraguilar.ai | outro | Site address (branding) |

## Changes from the approved script made by this check

- Hook: "faster, just as good…" became "faster and looked just as good…". The article says it
  couldn't see any difference and that "That doesn't prove they are equal". The terra badge reads
  "✓ 6/6 correct" (the article's count), not "same quality".
- Seconds: "2 cents" (and "2¢" on screen), rounded from the article's 2.2 cents at the author's request.

| "Pareto frontier · gpt-6 luna vs gpt-6.1 terra" (cover title) | hook | "The service runs on `gpt-6-luna`. The candidate was `gpt-6.1-terra`" |
- 2026-10-30 (author): removed the receipt scene and the 6.4× step; the video goes straight from cost per token (10×) to cost per task (1.23×).
