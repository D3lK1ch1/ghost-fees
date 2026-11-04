# Running Ghost It yourself (so it works in ASI:One)

**Why:** on Agentverse hosting, replies were held about 40 seconds before sending and ASI:One
gives up at about 30, so it showed nothing (no text, no buttons). The same agent.py run on our own
machine with a mailbox replies in a few seconds, buttons included (tested 5 Nov 2026).

**How it works:** the agent only calls out to the Agentverse mailbox, so it needs no public
web address, no open ports and no domain. Any always-on Linux machine works (the GB10, or a small
cloud server).

## First time (about 10 minutes)
1. Copy the seed file from the Mac to the GB10 privately (for example with `scp`), or have it in
   your password manager. Same seed = same agent address = same @ghostit.
2. On the GB10:
   ```bash
   git clone https://github.com/D3lK1ch1/ghost-fees && cd ghost-fees/agent/deploy
   bash setup.sh
   ```
   It asks for the seed and an admin code (both hidden), then installs and starts the service.
3. **Stop any other copy first** (for example the one on the Mac). Two copies on one mailbox split
   the messages between them.
4. The mailbox is already connected for this address. If the log says "mailbox not found", open
   the Inspector link from the log, click Connect, choose Mailbox.

## Every day
- Logs: `sudo journalctl -u ghost-it -f`
- Update code: `cd ghost-fees && git pull && sudo systemctl restart ghost-it`
- Stop: `sudo systemctl stop ghost-it` · Start: `sudo systemctl start ghost-it`

## Keep safe
- `~/.config/ghost-it/ghost-it.env` holds the seed (and the Stripe key if you add one). It is
  private (chmod 600) and never goes in git.
- Ghost Lists and stats are in `~/.local/share/ghost-it/data`. Back it up if you move machines.

## Payments (optional)
Add `PAYMENTS_ENABLED=true` and a restricted `STRIPE_SECRET_KEY` to the env file, then
`sudo systemctl restart ghost-it`. Without them, the $5 pack falls back to free.

## Moving to the cloud later
The same steps work on any Ubuntu server (US$3 to 5 a month). Copy the env file and the data
folder across; the address and @ghostit stay the same.
