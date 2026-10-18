# Fact-check: Nobody tells the implementer why

Source: `src/content/blog/en/nobody-tells-the-implementer-why.md` on branch `blog/the-why-gets-lost`
of the website repo (pubDate 2026-11-05). Scope: narration, plus the numbers and claims shown on
screen. Visuals are illustrative (one run stands for the pattern).

## Narration

| # | Claim (narration) | Where | Article sentence |
|---|---|---|---|
| 1 | "Nobody tells the implementer why." | cold (title) | Title: "Nobody tells the implementer why" |
| 2 | "I passed a client's request down a team of agents, from the lead to whoever writes the code." | unroll | "When that request then goes to a lead agent, which passes it to a product manager, which passes it to an architect, which passes it to whoever writes the code, I wanted to know two things…" |
| 3 | "Names, numbers, prohibitions: almost all of it arrived." | facts | "Most of the request survives the trip. At hop 4, in the Claude runs, prohibitions arrive intact 98% of the time, details that are easy to miss 96%, numbers 92%, names and conditions 90%…" |
| 4 | "For two hops, so did the reasons." | reasons | "the reason behind a decision travels well for two hops: 88–99% in the lead's message to the PM, 83–97% from the PM to the architect." |
| 5 | "Then the architect wrote to the implementer." | arrive | "Then the architect writes to the implementer, and it falls to 8–31%." |
| 6 | "In my runs, the "because" survived in only 8–31% of those messages." (spoken "eight to thirty-one percent") | snip | Same sentence: "…and it falls to 8–31%." (Claude chain, software teams; figure caption: "software teams, prose and list formats") |
| 7 | "It isn't worn away, like in the telephone game. It's cut." | erosion | "So it is not a telephone effect in the sense of something wearing away from mouth to mouth." / heading "The why is not worn away. It is cut" |
| 8 | "Even the lead, writing that message itself with the client's request in hand, kept the reason only 24% of the time." | shortcut | "the lead writes hop 4 itself, with the client's request in front of it, and only keeps the reason in **24%** of its messages to the implementer, with Haiku and with Sonnet alike." |
| 9 | "Whoever writes to the builder writes instructions. And instructions don't carry reasons." | quote | "whoever writes to the person who builds writes instructions, and instructions do not carry reasons." |
| 10 | "Whether losing it hurts the code is less tidy than I expected." | code | "That was my next question, and the answer is less tidy than I expected." |
| 11 | "But if the why matters to whoever builds, put it in their message yourself. Or attach the original." | reattach | "If the reason matters to the person executing, it has to be in their message, and nobody will put it there for you." / "If you want the implementer to know *why*, say so in the delegation or attach the original." |
| 12 | "More at javieraguilar.ai." | outro | — |

## Numbers and claims on screen

| On screen | Where | Source |
|---|---|---|
| "8–31% · Claude, software teams" (corner chip) | snip | "Then the architect writes to the implementer, and it falls to 8–31%." (Claude chain; figure: "software teams") |
| "24%" counter, label "reason kept · lead → implementer" | shortcut | "only keeps the reason in **24%** of its messages to the implementer" |
| Three of four tabs cut, one kept | shortcut | Illustration of 24% (about one in four kept) |
| Fact chips "Þórdís", "730 days", "Never include the email", ticked at every desk | facts | Illustration of "Most of the request survives the trip" (names 90%, numbers 92%, prohibitions 98%); chips are real facts of the run below |
| Telephone column blurring vs. sharp column cut once | erosion | Illustration of the contrast the article draws; no numbers |
| "?" between code and the pile, no number | code | "less tidy than I expected" (the article's mixed result is not shown) |

## Real hand-off lines on the strip

From `experiments/agent-telephone/runs/cc_grid/messages.jsonl` (published, anonymised), run
`software_3-hier_chain-free-clean-sonnet` (Claude Sonnet, chain, free prose, clean request), one sentence
per hop, quoted verbatim and cropped (backticks dropped). Stored in `src/data/handoff.json`.

| Desk (message received) | Rule | Tabs |
|---|---|---|
| client → lead | "Inactivity is measured on last_seen_at, not last_login," | "because the mobile app stopped updating last_login after the Auth0 switch." / "That's because Skatteetaten makes us keep invoices for five years." |
| lead → PM | "Inactivity is measured on last_seen_at, NOT last_login," | "because the mobile app stopped updating last_login after the Auth0 switch" / "(Skatteetaten requires keeping invoices for five years)" |
| PM → architect | "Inactivity is measured on last_seen_at, NOT last_login" | "(the mobile app stopped updating last_login after the Auth0 switch)" / "(Skatteetaten requires five-year retention)" |
| architect → implementer | "Inactivity is measured on last_seen_at, never last_login." | none (both reasons absent from this message) |

- Fact chips: "Þórdís" (DPO name, in the architect → implementer message as "Þórdís Sveinbjörnsdóttir"),
  "730 days" ("due = last_seen_at + 730 days"), "Never include the email" (verbatim in that message).
- Code on the implementer's screen: lines excerpted verbatim from the implementer's reply in the same run
  (`def plan_purge(accounts, today):`, `for a in accounts:`, `dues = []`, `if seen is not None:`,
  `dues.append(seen + dt.timedelta(days=730))`); intermediate lines omitted.
- Client name "Tidewater Climbing" is the fictional client of the published request.

## Branding

AGILabs badge and `javieraguilar.ai` only; no personal name in cards, captions or metadata.
