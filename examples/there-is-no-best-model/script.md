# There Is No Best Model, Only a Frontier — script (DRAFT 2026-10-30)

Article: https://www.javieraguilar.ai/en/blog/there-is-no-best-model/ · EN only · ~80 s.
Pending: the reasoning-effort table for luna AND terra (gpt6-1-terra session). The `gate` scene uses
the luna sweep already measured (§11, 38 cases × 4 rounds); if the new table adds something
visual (e.g. terra at low passes the gate and gets cheaper than luna), that scene changes.

| Scene | Component | EN line | Visual | Source sentence |
|---|---|---|---|---|
| hook | intro (curious) | A newer model was faster, just as good… / and I didn't switch. | terra zooms in from the right with a stopwatch, luna fades in on the left; "✓ 6/6" under both; terra leaves, luna stays | "terra was clearly faster, more expensive, and I couldn't see any difference in quality"; "In this case I decided to stop" |
| story | bespoke NewModels | Every few weeks there's a new model, / and every one claims to be the best. / you rarely get all three. | A stream of robots arrives with "NEW", "BEST" banners; then three icons (coin, stopwatch, brain) light up but never all three on one robot | "Choosing a model means trading at least three things: how good the answers are, how much they cost and how long they take. Rarely does one model win on all three." |
| parcel | bespoke Parcel | Think of a delivery. / Next-day is fast but expensive. Standard is slow but cheap. | Parcel; courier van with "next day" + big price; snail-post van + small price, plotted on a cost × speed plane (better ↖, as on the model plane) | (analogy, video only) |
| dominated | bespoke Parcel (skeptical on 2nd line) | A courier that's slow AND expensive? / Nobody picks it. It's dominated. | A third van, slow and pricey, lands in the shaded region, greys out with a "dominated" stamp | "A dominated model can be discarded without any debate" |
| frontier | bespoke Frontier2D | The options nobody beats on everything / form the Pareto frontier. / Between them, you trade. | Same plane re-labelled for models: staircase lights up teal, shaded dominated region | "The models nobody dominates form the Pareto frontier"; "between two points on the frontier, no measurement decides" |
| orbit | bespoke Frontier3D (orbit), cameo skeptical | With models there are three axes: cost, speed and quality. / With three, almost every model survives. | 3D cloud orbits; nearly all points turn teal | "with three axes almost nobody is dominated" |
| gate | bespoke Frontier3D (floor rises → top view) | So treat quality as a gate. / If a model can't do the task, it's out. | A red quality floor rises through the cloud; points below drop out red; camera tilts to a top view = cost × time plane | "fix a quality floor, discard what doesn't reach it, and draw the frontier between cost and latency with whatever passes" |
| reasoning | bespoke ReasoningDial, cameo role (laptop) | In my case, an agent that classifies companies. / Less reasoning: 29% cheaper, but it stopped researching. Out. / More reasoning: 16% pricier, no better. Dominated. | luna robot with a dial low / default / high; low point gets a red ✕ ("fails the gate"), high greys out ("dominated"); default stays teal | "the agent that finds a company on the web, checks it is the right one and assigns it an industry code"; "It is 29% cheaper and 16 seconds faster, and it doesn't pass the gate"; "+16% cost and +20% latency for the same accuracy within noise" |
| pertask | BarCompare (amazed on last line) | Then a newer model: ten times the price per token. / And only 23% more per task. | Bars 10× per token → 1.23× per task (luna 1×) | "Ten times per token became 23% more per task" |
| seconds | bespoke Scale, cameo amazed | Both pass the gate. / Are 27 seconds worth 2.2 cents? / That's about 3 dollars per hour of waiting. | Balance scale: stopwatch "−27 s" vs two coins; then "$3 / hour" | "is 27 seconds per classification worth 2.2 cents? ... roughly $3 per hour of waiting" |
| decision | bespoke Scale (confident) | Here, it wasn't. I stayed with the cheaper model. | Scale tips to luna robot; terra robot steps back | "In this case I decided to stop: 23% more per classification for no visible gain in quality" |
| verdict | KeyQuote (confident 1.05) | There's no best model. / Measure per task, set a quality floor, / and put a price on your seconds. | Quote | "draw the frontier with the cost and latency of the whole task"; "a quality gate written down before the first call"; "how much a second is worth" |
| outro | outro | More at javieraguilar.ai. | Outro with avatar | — |

EN words: ~200 → ~80 s at 2.5 w/s with pauses. After the 2026-10-30 review cuts: 95.3 s rendered.

Drawings to make (Codex, avatar style, transparent PNG, public/cast/): parcel, courier van (fast), snail-post van, slow-and-pricey van, "NEW"/"BEST" banners, coin, brain icon, stopwatch, coins, price tag, shop receipt, balance scale, reasoning dial. From the shared cast: robot-my-agent, teal robot (luna), amber robot (terra).

Bespoke components: Parcel/Frontier2D (one plane, re-labelled), Frontier3D (orbit + rising floor + tilt to top view; hand-projected 3D in SVG, no WebGL), ReasoningDial, Receipt, Scale.

Cold-viewer check (first ~15 s): "new models keep coming and each claims to be best, but you can't have cheap, fast and smart at once; he didn't switch to a faster one, why?" — the situation is the viewer's own, clear before any concept. The author's service appears only as the worked example (reasoning, pertask, seconds).
