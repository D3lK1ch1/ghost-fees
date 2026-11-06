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

## Feedback: 8 rounds (said / changed / proof)

Only outside people: Stranger Builds testers (anonymous "Trick or Feedback" reviews), Raj (Fetch.ai mentor) and Kingan (Tool Offer agent builder). Every review is also on https://hunt-ghost-fees.base44.app/progress#feedback

| Round | Who | They said | I changed | Proof |
|---|---|---|---|---|
| 1 · 31 Oct | Stranger Builds tester (3★) and tester (5★) | "How do you protect customer data? I don't like the idea of uploading my financial statements." · "Can we scrub small amounts of identifying information from the CSVs?" | CSVs are read in the browser and never leave it. Card, account and reference numbers are masked to the last 4 digits. A data-safety popup says exactly what we keep. | PR #111 · src/lib/ghostFees/analyse.js (masking) · /privacy |
| 2 · 31 Oct | Stranger Builds tester (2★) | "I wish it showed the date or which statement it comes from. I uploaded 4 files." | Every charge shows its date, and a drop-down shows the transactions behind it. | PR #101 |
| 3 · 31 Oct to 1 Nov | Stranger Builds testers (4★) | "Add a section on life goals." · "Clicked yes or no, came back, the item was reset." | Answers stick with Undo (To decide, Cancelling, Keeping). The Goal path puts what you save toward a goal. | PR #17 · PR #8 |
| 4 · 1 Nov | Stranger Builds tester (4★) | "Some inconsistency regarding the text alignment, especially on the footer." | Footer centred and full width with bigger links; page links moved to a proper nav bar. | PR #11 · PR #128 |
| 5 · 2 Nov | Raj, Fetch.ai mentor (round 1) | "The response is not very clear on what it's trying to do." ($276 a year with no working) | Every Ghost It reply says what it did and shows the maths line by line, on cards. | agent f627886 (v7) · 51c3645 (v8) |
| 6 · 2 Nov | Stranger Builds testers (3★, 2★) and a Slack user | "Overwhelmed at the beginning with the visuals. Make the value statement clear." · "Would add more use cases." · From Slack, not a portal tester: "The web app link doesn't work for me." | One plain line on every theme before the art ("Find the subscriptions you forgot. Cancel them in one click."). Tap-what-you-pay for people who won't upload. A proper link preview card. | PR #118 · PR #141 · PR #51 · PR #146 |
| 7 · 4 Nov | Raj, Fetch.ai mentor (round 2) | "The link is taking me to the mobile app." · "Use buttons instead of typing." · "More functionality." | Phones open the ASI:One web chat. Tap buttons under every reply (Consolidate, Get pack, Ghost one, Scan). Future spend chart. | PR #119 · agent v13 · PR #123 |
| 8 · 4 Nov | Kingan, Tool Offer agent builder | "Show the evidence. The buyer approves every payment. The agent never spends money." | Every result shows what you typed next to the maths. Nothing counts as cancelled until you tap Mark ghosted. Trust line: we never touch your bank, cards or accounts. | PR #124 · agent v13.1 · PR #142 |

### Our own testing (not counted as a round)
| 5 Nov | Team, testing Ghost It in ASI:One | Replies and buttons never showed. | Found the cause in the logs: hosted replies were held ~40 s, past ASI:One's ~30 s wait. Moved Ghost It to a self-run mailbox agent; replies with cards and buttons in under 8 s. | PR #147 · PR #148 · PR #149 · ~/ghost-fees-evidence/STATUS_2026-11-04.md |
