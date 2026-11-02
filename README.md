# Ghost It (@ghostit) 👻

**I hunt the money leaks your bank statement can't show you, with a Ghost Pack for each kind.**

Ghost Fees (the app) reads your statement. Ghost It fills the gap: doubles across services, subscriptions hidden in Apple or Google bundles or on another card, and what weekly habits really cost a year. Each Ghost Pack (Screen, Sound, Tech Stack, Food, Gym and Fitness, Play) hunts its own kind of leak, shows the maths, then gives the official cancel steps.

Ghost It is an AI agent on Fetch.ai's ASI:One. Tell it what you pay for in plain words and it shows the yearly cost line by line, finds double-ups (3 streaming services, 4 AI tools), gives the official cancel steps and a ready-to-send email, and keeps a ghost list to check the charges really stopped. No LLM does the maths: every number is plain Python.

It's the chat side of **[Ghost Fees](https://hunt-ghost-fees.base44.app)** ([repo](https://github.com/D3lK1ch1/ghost-fees)), which reads your bank statement to find the ones you've forgotten.

- **Try it:** [Ghost It on Agentverse](https://agentverse.ai/agents/details/agent1qvxxy97rjf9axql2xpn7d0rp8g6fxe39v7csh0ha60ud3qqghw9f7t7av43/profile) → Chat with Agent, or on [asi1.ai](https://asi1.ai) type `@ghostit ChatGPT $30, Claude $30, Cursor $30, Copilot $15`
- **Agent address:** `agent1qvxxy97rjf9axql2xpn7d0rp8g6fxe39v7csh0ha60ud3qqghw9f7t7av43`
- **One link for testers:** https://hunt-ghost-fees.base44.app/ghostit

## What it does
| You send | Ghost It replies |
|---|---|
| `hi` | What it's for, in one line, plus a form card |
| `netflix $8.99 espn plus 11.99 paramount 13.99` | Each line's maths, **$419.64 a year**, the streaming double-up, and a card with *Get Screen pack* and *Scan my statement* |
| `ChatGPT $30, Claude $30, Cursor $30, Copilot $15` | **$1,260.00 a year**, 4 AI tools doubling up |
| `gym $25 a week` | $25.00/wk x 52 = **$1,300.00/yr** |
| `screen pack` / `cancel Stan` | Official cancel links and steps (never guessed) and a cancel email |
| `my ghost list`, `Stan stopped` | Tracks what you cancelled and what it saved |
| `Netflix went from $16.99 to $18.99` | $24.00 more a year (12% rise) |
| `feedback: ...` / `what's new` | Logs feedback; shows "You said, we changed" |

## Built from feedback
See [CHANGELOG.md](CHANGELOG.md). The biggest change came from Raj (Fetch.ai): *"the response is not very clear on what it's trying to do… I didn't understand why it calculated $276 a year."* Every reply now says what it did, shows the maths line by line, and uses ASI:One cards.

## Run the tests
```bash
python3 -m unittest discover -s tests -v
```
47 tests, no network, including Raj's exact message.

## Deploy
`python3 deploy_ghostit.py update` (reads the Agentverse key from the macOS Keychain; never stored in the repo). Payments (Stripe, via Fetch's Agent Payment Protocol) stay off until the `STRIPE_*` and `PAYMENTS_ENABLED` secrets are set on Agentverse.

_General information about subscriptions, not financial advice._
