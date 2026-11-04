# Fetch.ai: Ghost It agent (v6, final direction)

## The brief
- Register an agent on Agentverse (or use ASI:One API).
- DONE WHEN: findable in ASI:One, 1 try through ASI:One, one change made from it.

## What Ghost It is
"Tell Ghost It what you pay for. It finds the doubles, gives you the real cancel steps, and checks they actually stopped."
- Standalone product: sells Ghost Packs per category.
- Linked product: sends people to the Ghost Fees app to find forgotten subscriptions (statement scan), with ?ref=asi1 tracking.

## Packs (based on Australian research)
| Pack | Covers |
|---|---|
| Screen | Netflix, Stan, BINGE, Kayo, Disney+, Prime, Paramount+, Apple TV+, Foxtel |
| Sound | Spotify, Apple Music, YouTube Premium, Audible, Amazon Music |
| Gym and Fitness | Gyms (Anytime, Fitness First, Goodlife, Jetts, F45, Snap, Plus, Virgin Active), fitness apps |
| Food | Uber One, DashPass, meal kits (HelloFresh, Marley Spoon, Dinnerly, Youfoodz...), takeaway fee habit |
| Tech Stack | iCloud, Google One, Dropbox, Microsoft 365, Adobe, Canva, ChatGPT, Claude, Gemini, Perplexity |
| Play | Game Pass, PlayStation Plus, Nintendo Switch Online, Discord Nitro |

Research: streaming 65%, music 35%, software/storage 25%, delivery 25%, gym 24% of subscribers (savings.com.au); about 50% pay for unused subscriptions, streaming and gym the biggest waste (Compare the Market, Mar 2026); gaming the highest spend per person, $55.50 a month (Westpac, via Seniors Discount Club).

## Pricing
- Free check: totals, overlaps, nudges, life-stage tip, app link.
- Ghost Pack: $2 per category. All packs: $5.
- Code flag PAYMENTS_ENABLED = False (free during beta). Turn on later with the Agent Payment Protocol (Stripe example: Innovation Lab "Stripe Horoscope Agent").

## What each Ghost Pack gives
- Checked cancel link (or "no checked link yet", never guessed) + steps
- Apple / Google Play route
- Ready cancel email
- Added to the ghost list; follow-up after 7 days: "Did it stop charging?"

## Behavioural nudges (GoldMind layer, generic for now)
- "Would you sign up today at this price?"
- Hours of work per year (at a stated $30/hr)
- Price anchor: "You agreed to $16.99; it's now $18.99"
- Later: GoldMind money types, once its content is known.

## Links to the Ghost Fees app
- Agent > app: https://hunt-ghost-fees.base44.app/?ref=asi1&subs=netflix,stan
- App > agent: Base44 prompt adds a "Track your ghosts in ASI:One: @ghostit" button and reads ?subs= to pre-fill.

## Known checks before launch
- "Check once" links (Disney+, BINGE, Kayo, Amazon): open and confirm.
- "model not found": change MODEL to the model name in Agentverse's chat protocol example.
- Library blocked in hosted agents: send the log; fallback is a local mailbox agent.

See ghost-it-launch-checklist.md for the step-by-step.
