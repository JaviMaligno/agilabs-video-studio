# The agent nobody starts — article video script (v4: opens with the metaphor, as the article does)

Article: `personal-website` → `src/content/blog/en/the-agent-nobody-starts.md` (branch `blog/the-agent-nobody-starts`).
Vertical 1080x1920. Voice: Kokoro until approved, then Cartesia.

Recurring story: as in the article, a friend (generic caricature) leaves her house in a neighbour's care (generic extra). Javier's avatar appears from scene 6, as the one who still opens the laptop.
The neighbour's three things (keys, fridge note, evening message) become the agent's three things.
Then the real Monday: a small cloud robot at a desk that works while the avatar is elsewhere.

| # | Scene | Component | EN line | ES line | Visual | Source sentence |
|---|---|---|---|---|---|---|
| 1 | Hook | intro card + bespoke | A friend left her house with a neighbour for a few weeks, and never once had to check her phone. | Una amiga dejó su casa a una vecina unas semanas, y ni una vez tuvo que mirar el móvil. | Frame 0: the friend relaxed far away, phone face down; the house behind with the neighbour at the door. Hook text over it. | "Before going away for a few weeks, a friend left her house in the care of a neighbour." / "She never had to look at her phone for the house." |
| 2 | Metaphor | bespoke | She gave her three things. Keys: the front door and the boiler room, not the drawer with the papers. | Le dio tres cosas. Llaves: la de la puerta y la de la caldera, no la del cajón de los papeles. | Key ring handed over; a drawer with a padlock stays closed. | "A set of keys: the front door and the boiler room, not the drawer with the papers." |
| 3 | Metaphor | bespoke | A note: when the boiler alarm goes off, reset it. If the roof leaks, call me. | Una nota: si salta la alarma de la caldera, rearmarla. Si hay gotera, llámame. | Fridge note, two drawn lines with icons (boiler → wrench, raindrop → phone). | "if the boiler alarm goes off, reset it this way; ... if the roof leaks, call me" |
| 4 | Metaphor | bespoke | And a two-line message every evening. | Y un mensaje de dos líneas cada noche. | Phone at night: "All quiet." | "And a message every evening, two lines long: all quiet, or this is what happened." |
| 5 | Turn | KeyQuote | That's what automating with AI should look like. Most of the time, it isn't. *(confident)* | Así debería ser automatizar con IA. Casi nunca lo es. | Big line over the house at night. | "That is what automating with agents for real looks like, and most of what we call automation today is not yet there." |
| 6 | Story | bespoke | A notification arrives. You open the laptop, start the AI, explain, wait, check. | Llega un aviso. Abres el portátil, arrancas la IA, explicas, esperas, compruebas. | Phone buzzes → avatar opens laptop → chat window → clock hands spin. | "A notification arrives, or an email, or a CI failure. You see it, open the laptop, start a session, explain the context, wait, check." |
| 7 | Story | bespoke | The AI did the typing. The work still went through you. | La IA ha tecleado. Pero el trabajo ha pasado por ti. | A loop arrow drawn through the avatar's head. | "The agent did the typing, but the loop went through your attention" |
| 8 | Story | bespoke | Doing it from your phone on the bus? You're still at work. | ¿Lo haces desde el móvil en el bus? Sigues trabajando. | Same loop, now around the avatar on a bus with the phone. | "Doing it from your phone doesn't fix it; it only means you carry your attention with you somewhere else." |
| 9 | Mapping | bespoke | An AI that works on its own needs exactly the same three things. | Una IA que trabaja sola necesita exactamente esas tres cosas. | The three objects slide next to the cloud robot: keys, note, phone. | Figure caption: "the note decides when to act and when to stop, the keys are the environment, and the evening message is one of three outputs." |
| 10 | Case | bespoke | One Monday at eight, on schedule, an agent I had set up woke up on its own. | Un lunes a las ocho, a la hora programada, un agente que había preparado se despertó solo. | Clock 8:00; the cloud robot switches on; the avatar is elsewhere (coffee). | "The first one, at eight, ..." / routines fire on "A schedule, an API call, a GitHub event" |
| 11 | Case | FlowDiagram | It installed an update on our servers, then had a second bot, one that can only look, check that nothing broke. | Instaló una actualización en nuestros servidores y pidió a un segundo bot, uno que solo puede mirar, que comprobara que nada se había roto. | Update box → second robot with a magnifying glass (no hands on anything) → 5 ticks. | "merge the pull request that upgraded our LLM gateway ... wait for the rollout, verify it" / "the read-only DevOps agent I built for Slack" |
| 12 | Case | Counter + cameo | Fifteen minutes. The summary was already on my phone. | Quince minutos. El resumen ya estaba en mi móvil. | Counter "15 min"; avatar cameo, phone lights up with the summary. | "Fifteen minutes, start to finish." / "sent me a message with what was done and what was still to do by hand" |
| 13 | Surprise | bespoke | At nine, a second agent woke up to switch on a setting. Twenty-seven seconds later, it stopped. On purpose. *(amazed)* | A las nueve, un segundo agente se despertó para activar un ajuste. Veintisiete segundos después, se paró. A propósito. | Stopwatch "27 s", green STOP stamp. | "The second routine, at nine, had to switch on a rule in a test environment and close another ticket. It took 27 seconds." |
| 14 | Surprise | bespoke | Its first step was to check the job was still pending. Someone had already marked it done. So it told me, and touched nothing. | Su primer paso era comprobar que la tarea seguía pendiente. Alguien ya la había marcado como hecha. Así que me avisó y no tocó nada. | Checklist item "still pending?" → ✗; robot's hands off; message to the avatar. | "found it already closed (someone had closed it days before), and stopped there, as its first step said, with a message telling me what it had found" |
| 15 | Surprise | KeyQuote | The world had changed since I set it up, and that first check caught it. *(confident)* | El mundo había cambiado desde que lo preparé, y esa primera comprobación lo pilló. | Big line. | "Between the day I wrote the routine and the day it fired, the world had changed, and the routine noticed." |
| 16 | So what | bespoke | The hard part isn't the AI. It's what you leave before going: | Lo difícil no es la IA. Es lo que dejas antes de irte: | Back to the door; the note, the keys and the phone as three cards. | "Not a better prompt or a smarter agent, but three decisions taken in advance" |
| 17 | So what | bespoke | a note that says when to act and when to call you, | una nota que diga cuándo actuar y cuándo llamarte, | Card 1: the fridge note. | "what it may do without your attention, what exactly wakes it" |
| 18 | So what | bespoke | keys for the job, not one more, | llaves para el trabajo, ni una más, | Card 2: key ring handed over, drawer stays locked. | "and what it is allowed to touch" / "Least privilege" |
| 19 | So what | bespoke | and a message you read when you choose. | y un mensaje que lees cuando tú quieras. | Card 3: phone with the evening message. | "When it goes well, I read that when it suits me." |
| 20 | Verdict | KeyQuote *(confident)* | Get those right, and the gain isn't minutes. It's every moment you didn't have to be there. | Si aciertas, no ganas minutos. Ganas todos los momentos en los que no tuviste que estar. | Avatar away from the desk; the robot's evening message arrives: "All quiet." | "the gain is not the minutes the agent saves. It is all the moments you didn't have to be there" |
| 21 | Outro | outro card | More at javieraguilar.ai | Más en javieraguilar.ai | Outro with avatar. | — |

## Must show

- Doing it from the phone only moves your attention elsewhere (Javier, 2026-11-23).
- The two real Monday routines: one that did the whole job, one that stopped itself because its first step checked the world had not changed.

## Drawings needed

- Neighbour caricature (generic extra), suitcase, key ring + padlocked drawer, fridge note,
  small cloud robot at a desk, second robot with magnifying glass (read-only bot).

## Length

EN ≈ 291 words → ~116 s at 2.5 w/s, plus pauses ≈ 124 s.
