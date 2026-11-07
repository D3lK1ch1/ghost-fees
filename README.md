# Base44 Project

Use this repository to run and edit the app locally, then publish changes back through Base44.

Any change pushed to the repo will also be reflected in the Base44 Builder.

## Prerequisites

1. Clone the repository using the project's Git URL.
2. Navigate to the project directory.
3. Install dependencies: `npm install`.
4. Install the Base44 CLI: `npm install -g base44@latest`.
5. Install [Deno](https://docs.deno.com/runtime/getting_started/installation/) — the local Base44 backend runs on it.

Run `base44 --help` (or see the [CLI reference](https://docs.base44.com/developers/references/cli/commands/introduction)) for the full command surface.

## Run Locally

Three commands, from the project root:

```bash
base44 login   # one-time per machine
base44 link    # one-time per clone
base44 dev     # local backend + frontend together
```

Open the frontend URL that `base44 dev` prints (typically `http://localhost:5173`).

Notes:

- **Every fresh clone needs `base44 link`.** It writes `base44/.app.jsonc` (the app-id pointer), which is deliberately gitignored. Your app id is in the Builder URL (`app.base44.com/apps/<id>/...`); `base44 link --help` shows the non-interactive flags.
- **`base44 dev` runs the frontend for you** (via `site.serveCommand` in this repo's `base44/config.jsonc`) — never run `npm run dev` yourself: alone it serves a UI with no backend behind it (`[base44] Proxy not enabled`, every `/api` call fails), and alongside `base44 dev` the second Vite silently takes the next port and you end up looking at the wrong one.
- **The app must be published at least once for the UI to load under `base44 dev`.** The frontend boots by fetching app settings from the hosted app; before the first publish that fails and every page redirects to login. The local API works regardless.
- Entities, functions, and auth run locally — entity data is **in-memory only**, wiped when `base44 dev` restarts. Everything else (Core integrations, OAuth login) is forwarded to your deployed app. Full breakdown: [Local development overview](https://docs.base44.com/developers/backend/overview/local-dev/local-development-overview).

## Frontend Only, Hosted Backend

To work on just the frontend against your app's live hosted backend:

```bash
base44 dev --remote
```

⚠️ In this mode writes go to your app's **production data** — plain `base44 dev` keeps everything local.

## Publish Your Changes

After pushing your changes to git, open the Base44 dashboard and publish the app:

```bash
base44 dashboard open
```

This repo syncs to Base44 through git, so publish from the dashboard rather than `base44 deploy` — a CLI deploy ships your local tree directly, bypassing the sync, and the deployed state silently diverges from the repo.

## Docs & Support

GitHub integration: [https://docs.base44.com/developers/app-code/local-development/github](https://docs.base44.com/developers/app-code/local-development/github)

Local development: [https://docs.base44.com/developers/backend/overview/local-dev/local-development-overview](https://docs.base44.com/developers/backend/overview/local-dev/local-development-overview)

Support: [https://app.base44.com/support](https://app.base44.com/support)

## Ghost It agent (Fetch.ai)

The Ghost It uAgent lives in [`agent/`](agent/) with its full history (v1 to v13.3): `agent/agent.py`, 98 tests in `agent/tests/`, and the changelog in `agent/CHANGELOG.md`. In ASI:One it is **@ghostit** (`agent1qdaylwvrj073a2hxxjsqvm26k2cpk8sakqypncmy4e2eewn7t2wwy23w2t0`).

Since 5 Nov it runs **self-hosted with an Agentverse mailbox**, not on Agentverse hosting: hosted replies were held about 40 seconds, past ASI:One's wait, so nothing showed. To run it on any always-on Linux machine, see [`agent/deploy/SELF_HOSTING.md`](agent/deploy/SELF_HOSTING.md) (systemd service, private settings file, one-command updates). Secrets (the agent seed, Stripe keys) live only in that private file, never in this repo.

## Feedback evidence: 7 platform reviews and 5 Slack messages

Every piece of outside feedback, word for word, with what we changed and the merged PRs that prove it. The same list, with a **Show the evidence** drop-down on each, is at https://hunt-ghost-fees.base44.app/progress#feedback

Our own testing is listed separately at the end and is never counted as feedback.

### Stranger Builds platform: 7 Trick or Feedback reviews (anonymous)

| # | Date · score | They said | What we changed | Proof |
|---|---|---|---|---|
| 1 | 31 Oct · 5/5 | One change: "Can we scrub small amounts of identifying information from the CSVs?" · Trick: "Clear, straightforward user flow." · Treat: "Loved the name and branding." | Card, account and reference numbers are masked to the last 4 digits (like ••••4412) on screen, in the PDF and in drafted emails. Emails, BSBs and names after transfers are hidden too. | [#43](https://github.com/D3lK1ch1/ghost-fees/pull/43) |
| 2 | 31 Oct · 3/5 | One change: "How do you protect customer data? I don't like the idea of uploading my financial statements into an app." · Trick: "It didn't break, it just didn't find anything in my sample document." · Treat: "Good UX." | CSVs are read in your browser and never leave it. A data-safety popup explains exactly what we keep, and you don't have to upload at all: tap the price ranges you pay instead. Clear my data wipes everything. | [#111](https://github.com/D3lK1ch1/ghost-fees/pull/111) · [#141](https://github.com/D3lK1ch1/ghost-fees/pull/141) |
| 3 | 31 Oct · 4/5 | One change: "Add a section on life goals and what matters to you, so you can prioritise your money on what's important." · Trick: "When I clicked yes or no on subscriptions, went to another page and came back, the item was reset. Nothing happened." · Treat: "I liked the design and the concept, especially how it could track increases in fees." | Answers now stick (To decide, Cancelling and Keeping tabs with Undo). The Goal path puts what you save towards your own goals, with a day to do each one in the calendar. | [#8](https://github.com/D3lK1ch1/ghost-fees/pull/8) · [#17](https://github.com/D3lK1ch1/ghost-fees/pull/17) |
| 4 | 31 Oct · 2/5 | One change: "I wish it showed the date or which statement it comes from. I uploaded 4 files but the output just showed the duplicates without dates or file details." · Trick: "The steps were easy to understand, so no confusion." · Treat: "It can identify the same amount transaction." | Every charge shows its date, and a drop-down on each one shows the transactions behind it, so you can see where each duplicate came from. | [#101](https://github.com/D3lK1ch1/ghost-fees/pull/101) |
| 5 | 31 Oct · 2/5 | One change: "Would add more use cases." · Trick: "Is the app only for figuring out ghost fees, or other things as well?" · Treat: "The UI looks good." | More than budgeting now: cancel links, ready emails and a Ghost List that checks a charge really stopped, a trial tracker, a future spend chart, and Ghost It, our AI agent on Fetch.ai, for double-ups the statement can't show. | [#9](https://github.com/D3lK1ch1/ghost-fees/pull/9) · [#25](https://github.com/D3lK1ch1/ghost-fees/pull/25) · [#86](https://github.com/D3lK1ch1/ghost-fees/pull/86) · [#123](https://github.com/D3lK1ch1/ghost-fees/pull/123) |
| 6 | 1 Nov · 4/5 | One change: "There is some inconsistency regarding the text alignment, especially on the footer." · Treat: "I really like the playful Halloween theme and colours. I also like the overall idea of the app." | The footer is centred and the same width as the page, with bigger text. The page links moved to a proper nav bar at the top. | [#11](https://github.com/D3lK1ch1/ghost-fees/pull/11) · [#128](https://github.com/D3lK1ch1/ghost-fees/pull/128) |
| 7 | 2 Nov · 3/5 | One change: "Make the value statement clear from the start and make it more concise on certain pages." · Trick: "I was quite overwhelmed at the beginning with the visuals and it took a lot of scrolling to digest the content on each page, which made it hard to understand what I was seeing." · Treat: "I really loved the themes and cute characters!" | Every page now opens with one plain line (Find the subscriptions you forgot. Cancel them in one click.), three steps and one button before any art. Results sit in tabs and drop-downs, sections fold away and the tour is opt-in. | [#118](https://github.com/D3lK1ch1/ghost-fees/pull/118) · [#128](https://github.com/D3lK1ch1/ghost-fees/pull/128) · [#131](https://github.com/D3lK1ch1/ghost-fees/pull/131) |

### Stranger Builds Slack: 5 messages

Not counted in the 7 platform reviews. Shown the same way as on /progress.

| # | Date | Who | They said | What we changed | Proof |
|---|---|---|---|---|---|
| 1 | 2 Nov | Raj (Fetch.ai mentor) · Ghost It | "The response is not very clear on what it's trying to do. I didn't understand why it calculated $276 a year." | Every reply now says what it did, shows the maths line by line ($8.99/mo x 12 = $107.88/yr) and the exact next step, with ASI:One cards. Lists typed without commas now work. | Ghost It [f627886](https://github.com/D3lK1ch1/ghost-fees/commit/f627886) · [51c3645](https://github.com/D3lK1ch1/ghost-fees/commit/51c3645) |
| 2 | 2 Nov | Slack user · Ghost Fees | "The web app link doesn't work for me." | Links now go on their own line in our posts and the app link shows a preview card. /try is one link for the whole test. | [#51](https://github.com/D3lK1ch1/ghost-fees/pull/51) · [#146](https://github.com/D3lK1ch1/ghost-fees/pull/146) |
| 3 | 4 Nov | Raj (Fetch.ai mentor) · Ghost It | "The link 'copy and open ghost it' is taking to mobile app, I would suggest you to point it to our web app. Instead of asking to type consolidate, you could have a button for consolidate." | Phones now open the ASI:One web chat instead of the app, and every Ghost It reply has tap buttons: Consolidate, Get pack, Ghost one, Scan my statement, Mark ghosted. | [#118](https://github.com/D3lK1ch1/ghost-fees/pull/118) · [#119](https://github.com/D3lK1ch1/ghost-fees/pull/119) · [#123](https://github.com/D3lK1ch1/ghost-fees/pull/123) |
| 4 | 4 Nov | Kingan (Tool Offer agent builder) · Ghost It | "Show the evidence. The buyer approves every payment. The agent never spends money on its own." | Every Ghost It result shows exactly what you typed next to the maths. Nothing counts as cancelled until you tap Mark ghosted. A trust line says Ghost It never touches your bank, cards or money. | [#124](https://github.com/D3lK1ch1/ghost-fees/pull/124) · [#142](https://github.com/D3lK1ch1/ghost-fees/pull/142) |
| 5 | 7 Nov | Slack builder · Ghost Fees | "The total looked final while it was still counting up." | The big total now says Adding it up... while it counts, and Final total once it settles. | [#200](https://github.com/D3lK1ch1/ghost-fees/pull/200) |

In-app feedback form (separate again): 12 responses, 8 said it found something real (yes or kinda), 1 would pay. Live counts on /progress.

### Our own testing (not counted as feedback)
| 5 Nov | Team, testing Ghost It in ASI:One | Replies and buttons never showed. | Found the cause in the logs: hosted replies were held ~40 s, past ASI:One's ~30 s wait. Moved Ghost It to a self-run mailbox agent; replies with cards and buttons in under 8 s. | PR #147 · PR #148 · PR #149 · ~/ghost-fees-evidence/STATUS_2026-11-04.md |
