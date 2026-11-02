# Ghost It changelog

All on 2 Nov 2026 (Melbourne). Each line is a commit; see the history for the code.

| Version | What changed | Why |
|---|---|---|
| baseline | Ghost It as deployed on Agentverse; tests added | Start of the hackathon log |
| v6 | One free Ghost Pack, then the price; `stats` for evidence | Free trial, then charge |
| **v7** | Every reply: **What I did → The maths (line by line) → Next**; ASI:One cards (form, review, carousel, detail); app links; `evidence` | **Raj (Fetch.ai):** "not very clear on what it's trying to do… why $276 a year?" |
| v7 fix | Lists typed without commas, prices without `$`, "Paramount" no longer read as "per annum"; ESPN+ added | Raj's exact message still misread |
| v7 | Paid Ghost Packs: $2 a pack or $5 for all, Stripe inside ASI:One (Agent Payment Protocol), off until secrets are set | Path to charging |
| **v8** | **Purpose first** ("I find subscriptions you're paying for twice and help you cancel them"); AI tools (Cursor, Windsurf, Midjourney, Lovable, Replit, Bolt, v0); results card buttons *Get pack* / *Scan my statement*; remembers everything you've listed; README keywords | Raj: purpose not clear; builders pay for AI tools twice |
| v8 fix | `screen pack` with nothing listed no longer adds 8 services to your ghost list | Found in testing |
| v8.1 | "Tell me what you were created to do" (ASI:One's suggested prompt) gets the purpose, 4 things it does and one to try | Profile suggestion gave a bare reply |
| v8.2 | ASI:One's pre-filled "What's new with you?" starts with the purpose and a card | First impression |
| v8.3 / v8.4 | Never crash on data saved by an older version (`'str' object has no attribute 'get'`) | Live crash found while testing on asi1.ai |
| **v9** | **Ghost Packs are the main job:** each pack hunts its own kind of leak (e.g. Sound: YouTube Premium already includes YouTube Music; Tech Stack: AI tools and storage paid twice, with the saving if you keep the cheapest); `packs` lists them; purpose line and profile now say Ghost It fills the gap the bank scan can't see | Team: Ghost It shouldn't repeat the app |
| v9.1 | Pack replies show the maths line by line, the pack total, the leaks with the saving, and the cancel links, on a review card (*Cancel steps* / *Scan my statement*); `packs` is a tap-to-run card | Make packs clean and match the original description: shows its working, tap-to-act cards |
| v9.2 | Replies before saving counters, so slow storage can't make ASI:One give up waiting | Some replies took 30 s and never showed |
| v9.3 | Names without prices get typical Australian prices (same checked list as the app, with sources) and the doubles; "what should I cancel" is advice, not a company; "$13.99/month ... per year" no longer read as yearly; honest reply for email/bank requests | Rating 2.2: tested the messages ASI:One actually sends |
| v9.4 | First replies ("hi", "Tell me what you were created to do", "What's new with you?") come with tap-to-try cards: paying twice for music, too many AI tools, three streaming apps, what my gym really costs, or use my own | ASI:One's profile page only has one default bubble and a blank box |
| v9.5 | Clear opening (I'm Ghost It, a specialised AI agent… every number is real maths, every cancel link checked, first pack free) and a "Try next" line after every result, pack and typical-price reply | More prompts and explanations, clearer UVP |
