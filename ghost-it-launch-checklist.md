# Ghost It: launch checklist (Fetch.ai + Agentverse)

Tick each box. Don't skip ahead. Stopping rules are in bold.

## Stage 1: Get it ready (about 30 min)
- [ ] Log in at https://agentverse.ai
- [ ] Agents > + Launch an Agent > Create an Agent > Blank template
- [ ] Name: Ghost It > Launch Agent
- [ ] Open the agent's code editor (agent.py). Delete everything. Paste all of agent.py. Save.
- [ ] Click Start. Wait for "running" / logs with no red errors.
- [ ] Profile tab:
  - [ ] Handle: ghostit (fallback ghostitau)
  - [ ] Short description, keywords, README: copy from ghost-it-readme.md
  - [ ] Category: Finance (or Productivity)
  - [ ] Upload an avatar
- [ ] If the log says "model not found": change MODEL at the top of agent.py to the model name in Agentverse's "Enable the Chat Protocol" example. Save, restart.
- [ ] If the log says a library isn't allowed: screenshot it and send it to Claude.
**Stop when: the agent shows as running with no errors.**

## Stage 2: Test it (about 20 min)
In the agent page, click Chat (or "Chat with Agent"). Paste each, one at a time:
- [ ] 1. `Netflix $19, Stan $16, Disney+ $16, Spotify $14, iCloud $4.49, Google One $3.49. We're a couple.`
  Expect: totals per pack, 2 overlaps (streaming, storage), couple tip, Ghost Fees link.
- [ ] 2. `screen pack`
  Expect: Netflix, Stan, Disney+ cancel cards with emails, "added to your ghost list".
- [ ] 3. `my ghost list`
  Expect: 3 items "Requested".
- [ ] 4. `Stan stopped`
  Expect: Stan "Stopped", confirmed total $192.
- [ ] 5. `what's the weather`
  Expect: the help message, no crash.
- [ ] Open the "check once" links and confirm each lands on the right page: Disney+, BINGE, Kayo, Amazon Prime, Canva (Canva has no link in the agent; fine).
- [ ] Now go to https://asi1.ai and ask WITHOUT the name:
  `I pay for Netflix, Stan and Disney+. Is that too much and how do I cancel?`
  - Routed to Ghost It? Screenshot it. That's "findable in ASI:One".
  - Not routed? Try `@ghostit Netflix $19, Stan $16`. Then add the words you used to the README keywords and retry later (ranking updates over time).
**Stop when: all 5 tests pass and you have one ASI:One screenshot.**

## Stage 3: One real try + one change (the challenge "done")
- [ ] Send a friend this message:
  "Can you try my agent? Go to asi1.ai and type: @ghostit then list what you pay for with prices, e.g. Netflix $19, Spotify $14, gym $25 a week. Then tell me one thing you'd change."
- [ ] Screenshot their chat and their feedback.
- [ ] Make ONE change from it (send the feedback to Claude for the code edit). Paste new agent.py, restart.
- [ ] Screenshot the reply before and after.
**Stop when: you have try + feedback + change + before/after. That completes the Fetch challenge.**

## Stage 4: Sell it (only after Stage 3)
Today packs are free during beta (PAYMENTS_ENABLED = False). To charge $2 per pack / $5 all:
- [ ] Create a Stripe account (stripe.com). Stay in TEST mode.
- [ ] Copy your test keys: publishable key (pk_test_...) and secret key (sk_test_...).
- [ ] In Agentverse, add them as agent secrets (never paste keys into the code).
- [ ] Ask Claude: "wire the Stripe payment protocol into Ghost It". It follows Fetch's Stripe example (Innovation Lab: Stripe Horoscope Agent) so a pack request shows a Stripe card in chat, and the pack is sent after payment.
- [ ] Test with Stripe's test card 4242 4242 4242 4242 (any future date, any CVC).
- [ ] Switch Stripe to live mode only when you're happy.
**Stop when: one test payment completes and the pack is delivered.**

## Stage 5: Link it to the Ghost Fees app
- [ ] Base44 prompt: "Read ?subs= and ?ref= from the URL. If subs is present, show a banner 'From Ghost It: we pre-loaded [list]. Scan your statement to find the rest.' Track ref=asi1 visits in an Analytics table. On the results page add a button 'Track your ghosts in ASI:One: @ghostit' linking to https://asi1.ai."
- [ ] Check visits from ref=asi1 daily. That number goes in your evidence.

## Evidence pack (screenshot as you go)
- [ ] Agent running on Agentverse
- [ ] ASI:One routing a plain question to Ghost It
- [ ] Tester chat + quote
- [ ] The change (before/after)
- [ ] Visits to Ghost Fees from ref=asi1
- [ ] (Optional) a test payment
