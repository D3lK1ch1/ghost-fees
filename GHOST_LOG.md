# Ghost Log: what we built and why

One entry per change. Newest at the bottom.

## Sun 1 Nov 2026

### Cancel links and steps on every subscription
- What: Each subscription card shows "Cancel on <merchant>" (official page, new tab) and the exact steps. Unknown merchants get safe search steps, never a guessed link. One note for app-store sign-ups (cancel in Apple or Google Play).
- Files: src/lib/ghostFees/cancelLinks.js (new), src/components/results/SubscriptionsSection.jsx
- How to test: Sample statement > Subscriptions tab: Netflix, Spotify, Stan, Adobe and iCloud show a cancel link and steps; Fitlife Gym shows the search steps.
- User feedback that drove this: (fill in)

### Ghost List: track what you cancelled
- What: "I cancelled it" adds a subscription to a Ghost List at the top of the Subscriptions tab with Requested / Confirmed / Still charging and "$X/yr ghosted". Items requested 7+ days ago ask "Did it stop charging?". Saved in this browser only; Clear my data wipes it.
- Files: src/lib/ghostFees/ghostList.js (new), src/components/results/GhostList.jsx (new), SubscriptionsSection.jsx, ResultsView.jsx
- How to test: Tap "I cancelled it" on two cards: both appear in the Ghost List with the yearly total. Reload: still there. Clear my data: gone.
- User feedback that drove this: (fill in)

### Themes: Haunted, My Ex Ghosted Me, Ghosts of Christmas
- What: Theme switcher (👻 💔 🎄) in the header on every page. Each theme changes the headline, copy and colours only, never features or numbers. All theme copy and colours live in one file (themes.js). Choice is remembered in the browser.
- Files: src/lib/ghostFees/themes.js, src/lib/ThemeContext.jsx, src/components/site/ThemeSwitcher.jsx (new), App.jsx, BrandHeader.jsx, Hero.jsx, Landing.jsx
- How to test: Tap 💔 and 🎄 on the landing page: headline and colours change; reload keeps the choice.
- User feedback that drove this: (fill in)

### Animated story for each theme
- What: Under the total: My Ex Ghosted Me shows your subscriptions texting you ("It's not you, it's my price rise."); Ghosts of Christmas shows Ghost of Fees Past (leaks found), Present (monthly subscriptions) and Yet to Come (next 12 months). Real numbers only, Skip button, reduced-motion safe.
- Files: src/components/results/ThemeStory.jsx (new), ResultsView.jsx
- How to test: Pick 💔 or 🎄, run the sample statement: the story animates in under the total.
- User feedback that drove this: (fill in)

### Double-ups spotted
- What: Groups subscriptions doing the same job (video streaming, music, cloud storage, AI tools, design tools, gyms) and shows what they cost together, with general tips (keep one, rotate monthly, family plan). Information only, never advice.
- Files: src/lib/ghostFees/overlaps.js (new), SubscriptionsSection.jsx
- How to test: Sample statement > Subscriptions: "3 video streaming services: Streammax, Netflix, Stan Entertainment = $599.76/yr together."
- User feedback that drove this: (fill in)

### 1 free scan, then sign in and pay once
- What: Anyone can scan one upload for free (up to 6 files, e.g. bank account + credit card, so one scan covers everything). After that: sign in, then $5 once for the first 50 founding members or $10 once, unlimited forever. Never a subscription. The sample statement is always free, re-scanning the same files is free, admins and paid users are unlimited. Adds optional User.paid and a paywall_shown event.
- Files: src/lib/ghostFees/scanQuota.js, src/components/scan/Paywall.jsx (new), Landing.jsx, Hero.jsx, base44/entities/User.jsonc, Event.jsonc, base44/functions/logEvent
- How to test: Upload one CSV: it scans. Upload a different CSV: the paywall opens. The sample still works. Note: counted in the browser for now; a server-side check comes with Stripe.
- User feedback that drove this: (fill in)

### Paywall that shows why it is worth it
- What: Three facts with sources (up to $1,739 a year wasted on unused subscriptions and $1,116 a year for the average unused gym, Compare the Market 2026; 9 months to cancel, ING), "One forgotten Netflix is $204 a year. Ghost Fees is $10, once.", $5 founding / $10 price cards (once, forever), what is included, and an optional refund promise (SHOW_GUARANTEE in Paywall.jsx).
- Files: src/components/scan/Paywall.jsx
- How to test: Use the free scan, then upload a different file: the new paywall opens on mobile and desktop.
- User feedback that drove this: (fill in)

### From Ghost.it: visitors sent by the Ghost It agent
- What: Links from the Ghost It agent on ASI:One (?ref=asi1&subs=netflix,stan&prices=netflix:18.99,stan:16.00) open a "From Ghost.it" section: overlap table by type, yearly cost chart, "Keep 1, save $X a year" cards, a 6-month streaming rotation calendar and a "Track your ghosts in ASI:One: @ghostit" button. Visits are counted in a new Analytics table with only the date, the ref and how many subscriptions were passed. No paid integrations.
- Files: src/lib/ghostFees/ghostItLink.js, src/components/landing/FromGhostIt.jsx, base44/entities/Analytics.jsonc, base44/functions/logRefVisit (all new), Landing.jsx
- How to test: Open /?ref=asi1&subs=netflix,stan,disney,spotify,youtube&prices=netflix:18.99,stan:16.00,disney:16.00,spotify:13.99,youtube:16.99
- User feedback that drove this: (fill in)

### Public progress page (/progress)
- What: a public "Ghost Log" page linked from the footer as "Our progress": live scoreboard (statements scanned, $ found on real statements from feedback, feedback responses, "found something real", "would pay", visits from the Ghost It agent), a "You said, we changed" timeline and a dated build streak. "Copy today's update" copies a ready LinkedIn line. Numbers come from a backend function that returns aggregate counts only, never names or statement data; anything unavailable shows "coming soon".
- Files: src/pages/Progress.jsx, src/data/changelog.json, src/data/shipped.json, base44/functions/progressStats (all new), App.jsx, SiteFooter.jsx
- How to test: open /progress on mobile and desktop. To add a real change, edit src/data/changelog.json: {"date", "quote", "who" (first name only if they said OK), "change", "beforeImg", "afterImg"} and delete the example entry. Add each day's work to src/data/shipped.json.
- User feedback that drove this: (fill in)

### Meet the founders + About page
- What: "Meet the founders" on the landing page (below the hero and use cases) with Sanjay and Bella, a "Why we built it" line and "Read our story". New /about page "Why we built Ghost Fees" with the founders' moment (placeholder, clearly marked), the Compare the Market 2026 fact, what it does, full founder cards and "Talk to us". Footer on every page now says "Ghost Fees gives general information about subscriptions and fees. It is not financial advice." and links About us and Our progress. All founder copy in one file.
- Files: src/data/founders.js, src/components/landing/FounderCard.jsx, FoundersSection.jsx, src/pages/About.jsx (all new), App.jsx, Landing.jsx, SiteFooter.jsx
- How to test: landing page scroll to Meet the founders (mobile stacks, desktop side by side); open /about. To do: fill in MOMENT in src/data/founders.js, add photos at public/founders/sanjay.jpg and bella.jpg (square, 400px+), check both bios.
- User feedback that drove this: (fill in)

### Guess-your-number reveal
- What: before the total, people guess how much forgotten subscriptions and fees took from them (slider $0 to $3,000+), tap Reveal, and the real number counts up: "You guessed $100. It's actually $296.92 in 7 months." Skip is always there. Reduced motion shows the number straight away. The guess is never stored or sent.
- Files: src/components/results/GuessReveal.jsx (new), ResultsView.jsx
- How to test: run the sample statement: the guess card appears where the total was; Reveal counts up, "Show me the ghosts" shows the usual total and story.
- User feedback that drove this: (fill in)

### Levels, badges and Share my level
- What: the Ghost List now shows a level from the $/yr you've ghosted (Rookie $0, Hunter $100, Exorcist $500, Legend $1,000) with a progress bar and "$X to the next level", plus badges: First Ghost, Overlap Buster (cancelled one of a double-up) and Price Rise Spotter (cancelled something that raised its price). Locked badges show how to earn them. "Share my level" shares or copies "I ghosted $X/yr of forgotten subscriptions. Level: Hunter 👻 hunt-ghost-fees.base44.app". Fun only, never changes any numbers.
- Files: src/lib/ghostFees/levels.js (new), GhostList.jsx, SubscriptionsSection.jsx, ResultsView.jsx
- How to test: sample statement > Subscriptions: cancel Netflix (a double-up) and see Level and Overlap Buster unlock; cancel Fitlife Gym to reach Exorcist.
- User feedback that drove this: (fill in)

### Upload safety: 5 MB limit, PDF/CSV only, shorter file links
- What: files over 5 MB are refused in the browser before anything is uploaded, and again on the server for PDFs; the server also refuses anything that isn't a PDF. The private link used to read a PDF now expires after 2 minutes instead of 10. Checked: no statement text is logged anywhere and no keys are in the code.
- Not possible yet (honest note): the Base44 SDK has no call to delete an uploaded private file, so PDFs stay in Base44 private storage. CSVs never leave the browser. Next: read PDFs in the browser so files never leave the device, or delete them from the Base44 dashboard storage settings.
- Files: src/lib/ScanContext.jsx, base44/functions/parseStatement
- How to test: upload a CSV or PDF over 5 MB: the error screen names the file and says it's over 5 MB.
- User feedback that drove this: (fill in)

### Privacy page: exactly what we keep
- What: new /privacy page (footer link) with a table of everything stored, where and for how long, including the honest note that PDFs are still kept in Base44 private storage for now. "Delete my data" explains Clear my data for browser data and how to ask for server data to be deleted.
- Files: src/pages/Privacy.jsx (new), App.jsx, SiteFooter.jsx
- How to test: footer > Privacy. To do: add a contact email for deletion requests, and update the PDF row once PDFs are deleted after reading.
- User feedback that drove this: (fill in)

### My Ex Ghosted Me: new art, Choose your ghost and the exes chat
- What: the 💔 landing now shows the ghost art with a thought bubble and a Choose your ghost picker (Heartbroken, her pick, or I'm Fine, his pick). The pick changes the art and headline only and is remembered in this browser. On results, "Unread messages from your exes" is now a group chat: one avatar and message per real subscription, a shocked ghost, the real yearly total, and Help me move on, which opens the Subscriptions tab. Art is WebP, about 190 KB in total.
- Files: public/themes/ex (new), src/components/landing/ExHeroArt.jsx (new), src/components/results/ExStory.jsx (new), src/lib/ghostFees/exArt.js (new), src/hooks/use-saved-choice.jsx (new), Hero.jsx, ThemeStory.jsx, ResultsView.jsx
- How to test: pick 💔, switch between Heartbroken and I'm Fine on the landing page, then Try a sample statement, Reveal, and check the exes chat and Help me move on.
- User feedback that drove this: (fill in)

### Ghosts of Christmas: new art, Winter and Summer, and the three staves
- What: the 🎄 landing now shows the living room at 11:59 on Christmas Eve with the Sleeper, and a Winter / Aussie Summer toggle (remembered in this browser, art only). On results, the story is now one stave at a time: Jacob Ledger with one chain link per real subscription, Dusty (Fees Past) with the top leaks and the real total lost, Jolly (Present) with the real monthly cost, the Hooded One (Yet to Come) with 12 months of it, then Christmas morning and Show me what to cancel, which opens the Subscriptions tab. A stave with no real figure is left out. Art is WebP, about 480 KB in total.
- Files: public/themes/christmas (new), src/components/landing/ChristmasHeroArt.jsx (new), src/components/results/ChristmasStory.jsx (new), src/components/site/SeasonToggle.jsx (new), src/lib/ghostFees/christmasArt.js (new), Hero.jsx, ThemeStory.jsx, ResultsView.jsx
- How to test: pick 🎄, switch Winter and Summer on the landing page, then Try a sample statement, Reveal, and step through all five staves.
- User feedback that drove this: (fill in)

### Footer text lines up with the rest of the page
- What: the footer was the only left-aligned block on a centred landing page, and wider than the sections above it. It is now centred and the same width as the content. Shows on every page with the footer.
- Files: src/components/site/SiteFooter.jsx
- How to test: scroll to the bottom of the landing page in any theme; the disclaimer, links and font credit are centred under Meet the founders.
- User feedback that drove this: "some inconsistency regarding the text alignment, especially on the footer" (tester, 4 of 5).

### Every ghost lights up on hover and says what it is
- What: in all three themes, hovering a ghost lights it up and shows what it is, using the real names and amounts from the scan, so it works on uploaded statements too. Haunted House: each ghost shows its name, type and amount. My Ex Ghosted Me: each ex's avatar shows the subscription and its monthly and yearly cost. Ghosts of Christmas: Jacob's chain links, Dusty's fee cards (with the reason) and Jolly's plates. Screen readers hear the names too.
- Files: src/components/results/GhostTip.jsx (new), HauntedHouse.jsx, ExStory.jsx, ChristmasStory.jsx
- How to test: Try a sample statement in each theme and hover the ghosts: Haunted House tab, the exes chat, and each Christmas stave.
- User feedback that drove this: ghosts should be highlighted and say what they are on hover, in every theme.
- Also: the biggest ghost in each theme (largest leak, or largest subscription in the exes chat and Jacob's and Jolly's lists) has a steady orange glow and a Biggest tag in its label, in the Haunted orange for every theme.

### Penny, Spooksworth and Gus: own colours, own jobs, all in the house
- What: the three guides looked alike (two were yellow-orange). Penny stays mint, Sir Spooksworth is now violet and Gus pink. Each has a job and a one-line description: Penny does fees and totals, Spooksworth writes the cancel, refund and fee-waiver emails, and Gus handles busting and goals. The chat opens with questions from the chosen guide's speciality, and the AI guide leans its answers toward it (facts unchanged). All three now stand on the Haunted House front porch; tap one to pick them, hover to see what they do.
- Files: src/lib/ghostFees/guides.js, HauntedHouse.jsx, GhostGuide.jsx, base44/functions/askGhostGuide
- How to test: Try a sample statement, open Haunted House, check the porch and the guide picker, then Ask a ghost with each guide and compare the first questions.
- User feedback that drove this: guide colours too similar, no description of what they do, all three should be in the house.

### About page: why we built Ghost Fees
- What: the placeholder at the top of /about is replaced with the real story: Stranger Builds at NerdConf, subscriptions that double and triple up across a tech stack and streaming, and money disappearing even when you know your budget.
- Files: src/data/founders.js
- How to test: open /about; the first paragraph is the story, with no dashed placeholder box.
- User feedback that drove this: (fill in)

### Bigger, cleaner text: guides and footer
- What: Gus's job reads Busting your ghosts. Guide text on the porch, the guide picker and the chat header is bigger (12 to 14px) and left-aligned where it was right-aligned. The footer, already centred after tester feedback, now leads with bigger About us / Our progress / Privacy links, then a readable disclaimer and a smaller font credit.
- Files: src/lib/ghostFees/guides.js, HauntedHouse.jsx, GhostGuide.jsx, src/components/site/SiteFooter.jsx
- How to test: Haunted House porch and guide picker; Ask a ghost header; bottom of any page.
- User feedback that drove this: "make sure text is better resized and cleaner"; tester note on text alignment in the footer.

### Subscriptions: answers stick, Yes / No do something, life goals easy to find
- What: from tester feedback. The scan and Yes / No answers now survive visiting another page and coming back (kept for this browser tab only). Answering pops up a confirmation and moves the subscription into a Decided list with Undo; To cancel ones keep the cancel link and email. A "What matters to you?" card on the Subscriptions tab opens life goals.
- Files: src/pages/Landing.jsx, ResultsView.jsx, SubscriptionsSection.jsx
- How to test: Try a sample statement, Subscriptions, answer Yes and No, open About us, press Back; then press Set a life goal.
- User feedback that drove this: "clicked yes or no ... came back, the item was reset. Nothing actually happened ... Add a section on life goals and what matters to you" (tester, 4 of 5).

### My Ex Ghosted Me: pink, photo avatars, landing matched to the design
- What: step 1 of rebuilding 💔 to match the design pack. Colours move from near-black to deep berry pink. Every ex gets its own round photo avatar from Bella's ghost art (pink ghosts for Heartbroken, hoodie ghosts for I'm Fine, piggy bank for bank fees), with no doubles. The 💔 landing now matches the ChooseGhost design.
- Files: themes.js, LeakCard.jsx, exArt.js, ResultsView.jsx, ThemeStory.jsx, ExStory.jsx, ExHero.jsx (new, replaces ExHeroArt.jsx), Hero.jsx, public/themes/ex/avatars (new)
- How to test: pick 💔, compare the landing with the design, switch picks, then Try a sample statement and check the chat and cards.
- User feedback that drove this: "should be more pink than black", "avatars double up", "very different from what's on the web app".

### My Ex Ghosted Me story mode: Act 1 and Heartbreak House
- What: 💔 results are now a story, one phone screen at a time, following the design pack: scanning chat, Unread messages (phone), Moving on with the Glow-up fund and double-ups, a Blocked chat for each ex, Inbox zero with a share card. The full results are still underneath under See everything, where the Haunted House is replaced by Heartbreak House. Blocking an ex adds it to the Ghost List (this browser only), so the story, Heartbreak House and the Subscriptions tab always agree.
- Files: src/components/ex/ (new: ExJourney, ExScanChat, ExMovingOn, ExBlockedChat, ExInboxZero, HeartbreakHouse, GlowUpFund), src/lib/ghostFees/exJourney.js (new), src/hooks/use-ghost-list.jsx (new), ghostList.js, exArt.js, ResultsView.jsx, SubscriptionsSection.jsx, public/themes/ex
- How to test: pick 💔, Try a sample statement and go through every screen; block an ex, then check Heartbreak House and Subscriptions.
- User feedback that drove this: "why can't the UI be fully implemented ... the storyline ... look how different that is".

## Mon 2 Nov 2026

### 💔 Speech bubbles come out of the mouth: Gone fishing, Who dis?, Feel it.
- What: on I'm Fine's Gone fishing photo the bubble's tail now lands on his mouth (worked out from the card's width, so it holds on any phone). "Mid-game. Who dis?" / "New phone. Who dis?" swaps the tail-less spiky shout for a speech bubble with its tail on the mouth. "Feel it." by the F**k-ex jar is bigger, with its tail at the party ghost's mouth (footy ghost and dinner ghost).
- Files: src/components/ex/ExAct2.jsx, src/components/ex/ExKit.jsx (GhostPal atMouth)
- How to test: pick 💔, I'm Fine and Heartbroken, Try a sample statement: Glow-up plan (Gone fishing), Messages to exes, What they cost you.
- User feedback that drove this: "the speech bubble come out of his mouth please", "make speech bubble coming out of his mouth cleaner", "need better speech bubble for him".

### 💔 every tab matches the design, silver phone and upload, new logo
- What: the scanning chat sits in the silver phone, "Deep breath. Show me." is a chat message and the message bar is an upload button. All 8 tabs are back in 💔, each opening with its design screen: Glow-up plan (I'm Fine: power-on plan) with Weekend away (Gone fishing), Monthly check-in, The ex comes back, What your exes paid for. I'm Fine has its own words and art. Heartbreak House exes float and drift. Bank fees get a pink ghost instead of the piggy bank. Receipt Ghost logo and Baloo 2 wordmark in the header.
- Files: src/components/ex/ExTabScreens.jsx (new), ExAct2.jsx, ExScanChat.jsx, ExKit.jsx, HeartbreakHouse.jsx, src/components/site/ReceiptGhost.jsx (new), src/lib/ghostFees/exArt.js, ResultsView.jsx
- How to test: pick 💔, upload a CSV, try both ghosts and open every tab.
- User feedback that drove this: "each theme should have same content and functionality as the haunted house"

### 🎄 every tab matches the design, Winter and Summer
- What: each Christmas tab opens with its stave from the design. Fees Past (Dusty), Jacob's chain (break a link per leak), Christmas morning (dawn breaks as links break), Yet to come (the Hooded One), Jolly's letters (every subscription a dish), Changed my ways (Tiny Savings and the cancel list), Gift to yourself (gift tag). Features underneath unchanged.
- Files: src/components/xmas/ (new: XmasKit, XmasLeakCard, XmasTabScreens, JacobsChain, ChangedMyWays), ResultsView.jsx
- How to test: pick 🎄, upload a CSV, open every tab in Winter and Summer.
- Checked: CSV upload works in all three themes; email drafting opens from 🎄 cards.

### Cassy, the cancel ghost (backend agent)
- What: a new ghost in the house. Cassy is a Base44 backend function (findCancelInfo) that searches the web for one company and returns the official cancel page, the steps, the Australian support phone number and hours, the support email or contact page, and its sources, labelled Official or Double-check. She never guesses; anything not found on an official page stays empty. She shows up in the cancellation assistant (automatically when we have no checked link) and in Ask a ghost, in every theme, with a ready cancel email addressed to the support contact.
- Files: base44/functions/findCancelInfo (new), src/components/results/CassLookup.jsx (new), src/lib/ghostFees/cancelLookup.js (new), CancelAssistant.jsx, GhostGuide.jsx, guides.js
- Privacy: only the merchant name is sent; card numbers and references are stripped first. Nothing is stored server-side.
- How to test (published app only, AI calls don't run locally): Ask a ghost > Cassy > "How do I cancel Fitlife Gym?"

### Proof of cancelling, in every theme, with screenshots
- What: every "I cancelled it" (Subscriptions, the cancellation assistant, 🎄 Changed my ways, 💔 Block and delete) now asks how you cancelled (online, email or phone call) and shows what counts as proof for that way: a screenshot of the "cancelled" screen, their confirmation email, the end date, a reference number, who you spoke to. You can add a screenshot or photo (shrunk in the browser, never uploaded), a reference and a note. Saving needs at least one piece of proof; "Add proof later" adds it without, and the Ghost List then shows "No proof yet. Add proof of cancelling". The Ghost List shows the proof and the screenshot (tap to enlarge), and if you mark something Still charging it tells you to send them your proof, ask for a refund, then dispute it with your bank. Adding proof later keeps its status. If browser storage is full, the screenshot is dropped and the rest kept, with a message. Privacy page lists it.
- Files: src/components/results/ProofDialog.jsx (useCancelProof, ProofSummary), GhostList.jsx, SubscriptionsSection.jsx, CancelAssistant.jsx, src/components/xmas/ChangedMyWays.jsx, src/components/ex/HeartbreakHouse.jsx, src/lib/ghostFees/ghostList.js, src/hooks/use-ghost-list.jsx, src/pages/Privacy.jsx
- How to test: Try a sample statement, Subscriptions, press I cancelled it, add a screenshot, save; mark it Still charging; press I cancelled it on another, Add proof later, mark it Confirmed, then add proof (stays Confirmed). Repeat in 🎄 Changed my ways and 💔 Heartbreak House.
- User feedback that drove this: "when cancel need proof cancellation and what they could upload or prove on that".

### Cancelled subscriptions come off your calendar
- What: once a subscription is on the Ghost List as Requested or Confirmed, it leaves the calendar's bells and Upcoming reminders, with a line saying "Cancelled, so off your reminders: ...". If calendar sync is on, its "charges again in 2 days" reminder is taken out of the synced Google, Outlook or Apple feed too. Marking it Still charging puts it back on the page.
- Files: src/components/results/HauntedCalendar.jsx, src/lib/ghostFees/calendarSync.js (dropEvents), src/components/results/ProofDialog.jsx
- How to test: Try a sample statement, cancel Fitlife Gym, open Calendar & reminders (💔 Check-ins & reminders). The synced feed part only runs on the published app.
- User feedback that drove this: "upload proof of cancellation then removing it from your calendar".

### Cassy moves on to the next one, and a ghost points you to her
- What: in the cancellation assistant, saving proof (or Add proof later) jumps straight to the next biggest subscription still charging, back at step 1, so Cassy starts on it ("Next up: ..."). Also fixed: the proof dialog didn't open from the assistant. Under the calendar, the empty space now has a ghost from the asset bank pointing you down to her: 💔 your own ghost, "Scroll down to f**k your exes more, with help from Cassy."; 🎄 the festive ghost, "Scroll down to break more of Jacob's chain, with help from Cassy."; 👻 the lantern ghost, "Scroll down to bust more ghosts, with help from Cassy." Take me to Cassy scrolls to her.
- Files: src/components/results/CancelAssistant.jsx, src/components/results/HauntedCalendar.jsx, public/themes/haunted/lantern-ghost.webp (new), public/themes/christmas/xc-festive.webp (new)
- How to test: Calendar tab in each theme (🎄: Yet to come); then in the assistant press 4. Mark it cancelled, I cancelled it, and save.
- User feedback that drove this: "after you cancel the first one will Cassy automatically assist you in the next one", "here on all versions should be filled by a ghost saying continue to f**k your exes with assistance from Cassy".

## Mon 2 Nov 2026 (paywall pack, branches feat/01 to feat/07)

### Free limits counted on the server, and Stripe unlock
- What: the free tier is now checked on the server, so clearing the browser doesn't reset it. Sign in, then 1 free scan (one upload of up to 6 files; re-scanning the same files stays free). 1 free AI answer per ghost (the quick answers stay free). Cassy's web lookup is free for the first subscription only. Unlock is a one-off Stripe Checkout: $5 for the first 50 founding members, then $10. Beta: everything stays free, with no sign-in, until the secret PAYMENTS_ENABLED is set to true; usage is still counted for the evidence. Visitors who aren't signed in keep the sample, with a daily ceiling on AI calls.
- Data kept: counts and salted one-way hashes only (Allowance entity, readable by our server and admins only). No statement, transactions, merchant names or results. User.paid can no longer be changed by users.
- Files: base44/entities/Allowance.jsonc, UsageDay.jsonc, User.jsonc; base44/functions/allowance, createCheckout (new), parseStatement, askGhostGuide, findCancelInfo; src/lib/AllowanceContext.jsx, src/lib/ghostFees/allowance.js (new, replaces scanQuota.js); Paywall.jsx, Landing.jsx, GhostGuide.jsx, CassLookup.jsx, Privacy.jsx
- Secrets: QUOTA_SECRET (long random string). Later, to start charging: STRIPE_SECRET_KEY (sk_test_ first) and PAYMENTS_ENABLED=true. Optional APP_URL.
- How to test: signed out, upload: asks you to sign in. Signed in: first upload works, a different file shows the paywall. Ask Penny two AI questions: the second is locked. Ask Cassy about two subscriptions: the second is locked. Unlock with test card 4242 4242 4242 4242.

### Sourced stats, and your own number next to the price
- What: home page strip (about half of Australians, up to $1,667 a year, 9 months to cancel) with links to the sources, plus the live scan count. Results show "This scan found $X in N months. Ghost Fees is $5 once. That's paid back N times." Gym stat beside a gym, 9-months stat in the cancellation assistant. Fixed: Compare the Market's headline is $1,667, not $1,739; ING is 2023.
- Files: src/data/stats.js, src/components/stats/ (new), src/lib/ghostFees/payback.js

### Do you have any of these? (no upload)
- What: 14 common subscriptions with typical AU prices, each with its source and date. Typical only, never in a real total, ends with "Upload your statement to see what you actually pay".
- Files: src/data/commonSubs.js, src/components/landing/CommonSubsChecker.jsx

### Filter and sort subscriptions
- What: type chips (Streaming, Music, Cloud, AI, Design, Fitness, Other) and sort by cost, type or A to Z.

### PDF report (paid)
- What: Download PDF report: what cost you money, every subscription with its cancel link or steps, double-ups, Ghost List. Built in the browser. Free on the sample as a demo.

### Saved so far, House Cleared
- What: "Saved so far" on the Ghost List grows each day from each ghosted price. New badge House Cleared. (The Ghost It on ASI:One hand-off waits until the agent is live.)

### Slack feedback, Delete my server data, life-stage tips
- What: feedback posts to Slack when SLACK_WEBHOOK_URL is set. Privacy page button deletes your free-tier counters. Double-ups ask "Who are these for?" (Just me, Student, Couple, Sharehouse, Family) and tailor the tip.

### Feedback anonymised after 30 days, and Download my data
- What: feedback older than 30 days is anonymised once a day: the name, the written comments and the leak picked are cleared, while the counts and Yes / Kinda / No answers stay (so /progress numbers don't change). It runs inside progressStats, at most once a UTC day, tracked in a new admin-only Maintenance entity (job name and date only). Signed in, the Privacy page has Download my data: everything the server keeps for your account as ghost-fees-my-data.json, with the hashes labelled as one-way. The Privacy page now says how long the free-tier record is kept, about the 30-day anonymising, and that feedback can be copied to the team's private Slack.
- Files: base44/entities/Maintenance.jsonc (new), base44/functions/progressStats/entry.ts, base44/functions/allowance/entry.ts (export), src/components/site/DeleteServerData.jsx, src/pages/Privacy.jsx
- How to test (published app): in Base44 Data add a Feedback row with created_at 31 days ago and a name and text, open /progress, and the name and text are blank. Signed in, Privacy > Download my data saves the file. Copies already sent to Slack are not changed.
- User feedback that drove this: "can we enhance the delete my data, how it adds security", "can we scrub small amounts of identifying information" (tester).

### Name your ghost, and the monthly ghost check
- What: Name your ghost (Boo until you change it; letters, numbers and spaces, up to 20 characters, kept in this browser) sits under Pick your ghost guide in the Haunted House and at the top of the Ghost List in every theme. The Ghost List header becomes "Boo's Ghost List" and Share my level says "Boo and I ghosted ...". Monthly ghost check: every new scan looks at Ghost List items still Requested. If that merchant charged again after the day you ghosted it, it moves to Still charging with "Charged again on <date>, by your statement" and a toast; if the statement runs 35+ days past that day with no charge, it moves to Confirmed with "Confirmed by your statement". All in the browser, nothing is sent.
- Files: src/hooks/use-ghost-name.jsx (new), src/components/results/GhostNameField.jsx (new), src/lib/ghostFees/ghostCheck.js (new), src/lib/ScanContext.jsx, src/components/results/GhostList.jsx, src/components/results/HauntedHouse.jsx
- How to test: Try a sample statement, Subscriptions, I cancelled it on Netflix (Add proof later). To see the check without waiting a month, set that Ghost List item's date in browser storage to a few months back, run the sample again, and Netflix shows Still charging. Type a name in Name your ghost and the header changes.
- User feedback that drove this: none yet; planned in the week-2 schedule (personalise).

### Statement descriptions hide emails, BSBs and transfer names
- What: on screen and in the PDF report, transaction descriptions now hide email addresses ([email hidden]), BSBs (•••-•••) and the person's name after TRANSFER / TFR / OSKO / PAYID to or from ([name hidden]), on top of the existing last-4-only for card, account and reference numbers. Subscriptions and leaks are found from the original text, so results don't change (sample still $296.92).
- Files: src/lib/ghostFees/analyse.js
- How to test: upload a CSV with "TRANSFER TO JANE SMITH 062-000 12345678" and "PAYPAL *bob@example.com" rows, open Show transactions or the possessed receipt.
- User feedback that drove this: "clarity on information - can we scrub small amounts of identifying information from the csvs?" (tester, 31 Oct).

### Uploads keep working in the free beta, and no emails in merchant names
- What: from a click-through of the whole pack. If the free-scan check on the server can't be reached (or errors) while payments are off, the upload now goes ahead instead of stopping with "Could not check your free scan"; CSVs never need the server, and PDFs skip the scan ticket while charging is off. Once PAYMENTS_ENABLED=true nothing changes: the check is required again. Also, an email in a description ("PAYPAL *bob@example.com") no longer ends up in the merchant's name ("Paypal Bob Example" is now "Paypal"). And the Student tip on double-ups only mentions Spotify Student when one of the double-ups is music; video, storage and others get a general line with no number.
- Files: src/pages/Landing.jsx, base44/functions/parseStatement/entry.ts, src/lib/ghostFees/cleanMerchant.js, src/lib/ghostFees/overlaps.js (tipFor), src/components/results/SubscriptionsSection.jsx
- How to test: before publishing the new allowance function (or with it failing), upload a CSV: it scans. Upload a CSV with a "PAYPAL *name@example.com" monthly charge: the subscription reads Paypal.
- User feedback that drove this: found while clicking through the pack; tester asked to "scrub small amounts of identifying information".

### Filter and sort your ghosts by leak type
- What: the Ghosts tab (every theme) has chips for each leak type found on this statement, with a count: All, Duplicate, Price creep, Trial converted, Bank fee and so on. Picking one shows just those ghosts and their total ("2 ghosts · $117.00"). Sort: Biggest first, By type, A to Z. The biggest ghost keeps its highlight whatever the filter. If a new scan doesn't have the picked type, it goes back to All.
- Files: src/components/results/LeakFilter.jsx (new), src/components/results/ResultsView.jsx
- How to test: Try a sample statement, Ghosts tab, tap Bank fee (2 ghosts, $117.00), then Sort A to Z.
- User feedback that drove this: "sorting filtering by types of subscriptions such as duplicates".

### Possessed receipt: tap, dispute, and one claim to your bank
- What: on All ghosts, tap a ghost's name to see all its charges; Dispute this under each ghost opens the ready email to that company; tick ghosts and "Ask my bank about N ghosts · $X" drafts one email to your own bank listing every charge, its date and why it isn't right, with the total and the AFCA line. A note says banks usually ask whether you contacted the company first. The GHOSTED stamp now sits on the paper's header and scrolls with it, so it no longer covers the first amount.
- Files: src/components/results/PossessedReceipt.jsx, src/components/results/LeakEmailDialog.jsx, src/components/results/ResultsView.jsx
- How to test: Try a sample statement, Possessed receipt, Open the receipt, tick Streammax and Monthly Account Fee (2 ghosts · $218.94), Ask my bank; and press Dispute this on Adobe.
- User feedback that drove this: "the possessed receipt can we do something more with it functionality wise"; the stamp covered "$15.00" in the user's screenshot.
