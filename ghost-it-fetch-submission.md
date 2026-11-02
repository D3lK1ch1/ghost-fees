# Ghost.it: Fetch.ai project kit

Fetch.ai is the second challenge on the Ghost Fees project (confirmed by the organizers). Use this for the Fetch.ai parts of the Ghost Fees Submit tab.

---

## The 5 steps

### 1. Pick an idea
**Name:** Ghost.it

**In one line:** Tell Ghost.it what you pay for. It finds the doubles, gives you the real cancel steps, and checks they actually stopped.

**Who it's for and what it does:** For Australians paying for more subscriptions than they use (about half of people pay for at least one they don't use). Ghost.it is an AI agent on ASI:One that adds up what your subscriptions really cost, spots overlaps and cheaper bundles, gives official cancel steps with a ready-to-send email, and checks back after 7 days that the charges actually stopped.

### 2. Ship it
**Agent on Agentverse:** https://agentverse.ai/agents/details/agent1qvxxy97rjf9axql2xpn7d0rp8g6fxe39v7csh0ha60ud3qqghw9f7t7av43/profile

**Public link (try it):** https://asi1.ai, then type `@ghostit Netflix $19, Stan $16, Spotify $14`

**Try this (120 chars max):**
`On asi1.ai type @ghostit + what you pay, e.g. Netflix $19, Stan $16. Then say "screen pack".`

### 3. Get feedback (3 tries from builders outside your team, through ASI:One)
- Send the Slack message (already on your clipboard).
- Ghost.it saves every message that starts with "feedback". Ask Claude to pull the feedback from the logs.

### 4. Improve it (one change from what they said)
Fill this in after the 3 tries:
> Testers said: ___. We changed: ___.

Changes already shipped on 1 Nov (from Ghost Fees testers and our own testing):
- Privacy: a tester asked "How do you protect customer data?" Ghost.it now says it never needs bank logins, card numbers or statements, and "delete my data" wipes everything.
- Swap and save: suggests bundles that replace what you pay for (Apple One, YouTube Premium includes YouTube Music, Microsoft 365 storage, Spotify Duo, Kayo + BINGE).
- Built-in feedback: any message starting with "feedback" is saved, so improvements come from real users.
- Bug fix: off-topic questions now get the help message instead of repeating the cost breakdown.

### 5. Submit
Before Sun 8 Nov, 23:59 Argentina time. The last version counts.

---

## 60-second demo video script

Record on your Mac: press **Cmd + Shift + 5**, choose "Record Selected Portion", select the browser window, then click Record. Stop with the stop button in the menu bar.

| Time | Show | Say |
|---|---|---|
| 0-5s | asi1.ai home | "Half of Australians pay for subscriptions they don't use. Meet Ghost.it." |
| 5-20s | Type `@ghostit Netflix $19, Stan $16, Disney+ $16, Spotify $14, iCloud $4.49, Google One $3.49. We're a couple.` | "I tell it what I pay..." |
| 20-30s | Scroll the reply: total, overlaps, swap and save | "...it shows $876 a year, 3 streaming services, 2 storage plans, and a couple tip." |
| 30-42s | Type `screen pack` | "One message gets the official cancel steps and a ready-to-send email." |
| 42-52s | Type `Stan stopped`, then `my ghost list` | "Then it tracks what I've cancelled: Stan stopped, $192 a year saved." |
| 52-60s | Show the Agentverse profile with the ghost avatar | "Ghost.it. Live on Fetch.ai's ASI:One. Try @ghostit." |

Upload to YouTube (Unlisted) or Loom and paste the link into **Demo link**.

---

## Ways to get the judges interested
1. **Real numbers:** "X people tried Ghost.it, Y pieces of feedback, $Z a year of subscriptions found" (Claude can pull these from the logs).
2. **Before and after:** one screenshot of the reply before a tester's change and one after.
3. **A tester quote:** one real line from a tester, e.g. "I didn't know I was paying for two storage plans."
4. **Two products, one system:** Ghost Fees scans your bank statement; Ghost.it on ASI:One cancels and tracks. Each links to the other (ref=asi1).
5. **Trust:** maths and cancel links come from checked rules, not AI guesses, and it never asks for bank logins.
6. **Payments ready:** a Stripe test payment for a $2 Ghost Pack inside the chat (optional, after the 3 testers).
