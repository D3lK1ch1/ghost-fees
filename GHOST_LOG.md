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

### 💔 Heartbreak House: a card for every ex
- What: under the house there is now a card for every ex, biggest first, each with its line, cancel link or steps, and Block and delete (or Blocked, Undo and its proof). Tapping an ex in the house highlights its card and scrolls to it. The "Block once you've cancelled" note shows once, under the cards. Also: no comma before "with" in the Cassy lines under the calendar.
- Files: src/components/ex/HeartbreakHouse.jsx, src/components/results/HauntedCalendar.jsx
- How to test: pick 💔, Try a sample statement, See everything, Heartbreak House: all 7 exes have a card; tap Netflix in the house.
- User feedback that drove this: "these cards should show all the ghosts"; "remove commas before with".

### 💔 Meet Tilly, who texts you in the scanning chat
- What: the scanning chat and the monthly check-in used "Ghost Fees" as the contact. The contact is now Tilly (as in the till that rings up every charge), a new ghost holding a bank card, from the Image Assets folder, in a round avatar: "Tilly is typing...". Same for Heartbroken and I'm Fine. Name and art live in EX_CONTACT, so they are easy to change.
- Files: public/themes/ex/tilly.webp (new, 15 KB), src/lib/ghostFees/exArt.js (EX_CONTACT), src/components/ex/ExScanChat.jsx, src/components/ex/ExAct2.jsx
- How to test: pick 💔, Try a sample statement: the phone chat header says Tilly. Monthly check-in tab: Tilly too.
- User feedback that drove this: "this should be new agent from the image folder, we cannot have the agent be called Ghost Fees as that's very lame".

### 💔 If an ex charges you again: their page and Talk to Cassy
- What: the "If <ex> charges you after you cancelled" card now has "Go to <company>'s page" (the checked cancel page, when we have one; otherwise "Cassy can find it") and a Talk to Cassy button that opens Ask a ghost with Cassy picked. Any screen can open the chat with a chosen guide the same way (askGuide).
- Files: src/components/ex/ExAct2.jsx, src/lib/ghostFees/askGuide.js (new), src/components/results/ResultsView.jsx
- How to test: pick 💔, Try a sample statement, See everything, Messages to exes: press Talk to Cassy and the chat opens on Cassy.
- User feedback that drove this: "this should link to the web page to cancel directly and maybe have a talk to Cassy button that will link to the chat".

### 💔 Heartbreak House: more room for the jar, your ghost and the sign
- What: the scene under the house is taller (250px) and spread out: the jar and the Dinner / BBQ sign sit further in from the edges, your ghost is a little left of centre, and her speech bubble sits higher, so it no longer runs into the sign.
- Files: src/components/ex/HeartbreakHouse.jsx
- How to test: pick 💔, Try a sample statement, See everything, Heartbreak House, block one ex: "Out of bed. One down." has room.
- User feedback that drove this: "spread this out a bit".

### Link preview card for Slack, iMessage and WhatsApp
- What: sharing the app link now shows a proper card: "Ghost Fees: Find the money haunting your account", the leak types, "Free, no sign-in, private", and three theme ghosts (the lantern ghost, Tilly and the festive ghost). Before, Slack showed a blank grey box.
- Files: index.html (Open Graph and Twitter tags), public/og-image.png (new, 1200 x 630, 248 KB)
- How to test: after publishing, paste https://hunt-ghost-fees.base44.app into a new Slack message, or check it at opengraph.xyz. Old posts keep their old preview until re-posted.
- User feedback that drove this: the Slack preview had a grey placeholder image.

### Free plan: 3 scans and one ghost try (B1)
- What: the free allowance is now 3 statement uploads (was 1) and 1 ghost guide try in total, on whichever ghost you pick (was 1 message per ghost). Counted on the server in Allowance for signed-in people; the sample never counts. Still all free until PAYMENTS_ENABLED=true, but ghost answers are now counted during the beta too, so the numbers are real. Wording updated on the home page and the paywall.
- Not done: deleting uploaded PDFs right after reading. Base44's SDK has no call to delete an uploaded file (only upload and signed links), so the Privacy page's "kept for now" stays true. The real fix is reading PDFs in the browser.
- Files: base44/functions/{allowance,askGhostGuide,createCheckout,findCancelInfo,parseStatement}/entry.ts, base44/entities/Allowance.jsonc, src/lib/AllowanceContext.jsx, Hero.jsx, ExHero.jsx, Paywall.jsx, Landing.jsx
- How to test (published): sign in, ask Penny one question, then Cassy: in Base44 Data, Allowance shows guides_used ["penny","cass"]. Upload a CSV: scans_used goes up by 1.
- User feedback that drove this: pricing decided 2 Nov (FINAL_UPDATE_PACK 1.2).

### All stats from one checked file (B2)
- What: every number shown to people now comes from src/data/upgradeStats.json: 11 stats, each with its big number, text, source and year, and where it belongs (home, paywall, reveal, trial, gym, cancel, streaming, double). New: 8.4M Aussies (ING 2025), 3 in 10 lose up to $600 on duplicates (Westpac 2025), 57% name Netflix, 31% find cancelling hard, 38% forgot a trial, the 1 July 2027 subscription-trap ban. "$1,739" and "$1,667" are replaced with "$1,600+" (sources disagree). Home strip shows stats 1 to 3; the paywall shows its two.
- Files: src/data/upgradeStats.json (new), src/data/stats.js (now reads the file), src/components/scan/Paywall.jsx, src/components/xmas/XmasTabScreens.jsx
- How to test: the home page strip shows 1 in 2, $1,600+, 8.4M with sources; 🎄 Gift to yourself shows $1,600+ and 9 months with sources.
- User feedback that drove this: fact-check on 2 Nov (FINAL_UPDATE_PACK 1.1).

### Pick a time to cancel, with a calendar link that ticks it off (B3)
- What: on each subscription, "When will you cancel it?" offers Tonight 8 pm (tomorrow if it's past 8), This weekend (Sat 10 am) or a date and time. It adds a 15-minute event with a reminder 15 minutes before, as a calendar file (Apple, Outlook, any app), Google or Outlook: "Cancel Netflix ($203.88 a year)", with Cassy's steps, the official cancel page, a copy-paste cancel email and a link back. The link (/?done=<id>) opens "How did you cancel Netflix?" straight away, even in a fresh tab with no scan; if this browser doesn't know it, a friendly message shows the Ghost List. Only the chosen time (with the name and price) is kept, in this browser; Clear my data removes it. Research: a set time and place makes people more likely to follow through (implementation intentions, Gollwitzer and Sheeran, 2006).
- Files: src/components/results/PickTimeDialog.jsx (new), src/components/site/DoneLink.jsx (new), src/lib/ghostFees/cancelPlans.js (new), src/lib/ghostFees/reminder.js (timed events), SubscriptionsSection.jsx, ResultsView.jsx, App.jsx
- How to test: Try a sample statement, Subscriptions, Netflix: When will you cancel it? > Tonight > Add to my calendar. Open the event's link: the proof dialog opens.
- User feedback that drove this: retention research (FINAL_UPDATE_PACK 1.6); ING: people take 9 months to cancel.

### /try: one tester link for the app and Ghost It (B6)
- What: a public page, /try, "Try Ghost Fees in 3 minutes", with 3 step cards and a progress bar (kept in this browser): 1 Find the ghosts (runs the sample; a "Back to the test" button on the results ticks it off), 2 Ask Ghost It (copies "@ghostit Netflix $19, Stan $16, Disney+ $16, Spotify $14", opens ASI:One, logs ask_ghostit_click), 3 Tell us one thing (how clear the app and Ghost It were, 1 to 5; what was confusing; would you pay $10 once; can we quote you, with a first name). Saved as Feedback with kind "journey" (and a try_completed event). All done: "Thank you! You just helped a hackathon team" and a share button. Visits log ref "try". Local development visits don't count.
- Files: src/pages/Try.jsx (new), src/pages/Landing.jsx, src/App.jsx, base44/entities/Feedback.jsonc (kind, clarity_app, clarity_agent, quote_ok), base44/entities/Event.jsonc, base44/functions/submitFeedback, base44/functions/logEvent
- How to test (published): open /try in a fresh browser, do all 3 steps; a Feedback row with kind "journey" appears.
- User feedback that drove this: testers needed one simple link (FINAL_UPDATE_PACK 1.5); Kimberley's link trouble.

### Limit-reached sheet that leads with your own total (B7)
- What: at a free limit (4th upload, 2nd ghost try, Cassy, PDF) a sheet slides up (centred on bigger screens): drag handle, close, the theme's ghost floating (lantern, Tilly, festive), "You've used your 3 free scans" (or "your free ghost try"), "Your scans found $296.92 in ghosts" (the number pops in), "Ghost Fees is $10 once. That's already paid back 29x." (hidden under 1x), a softly pulsing "Unlock everything, $10" (sign in first if signed out, then /upgrade), "Maybe later" (results stay visible, the total is never hidden) and "See how we compare". The total is this scan if real, otherwise your last real scan (one number kept in this browser, cleared by Clear my data); with none, it shows the research instead. No motion with reduced motion. Development only: /?preview_paywall=scan opens it.
- Files: src/components/scan/Paywall.jsx, src/lib/ghostFees/payback.js, src/lib/ScanContext.jsx, src/lib/AllowanceContext.jsx, src/index.css, ResultsView.jsx
- How to test: in development, open /?preview_paywall=scan; live, it shows only once PAYMENTS_ENABLED=true and a limit is reached.
- User feedback that drove this: design canvas screens 1, 2, 6, 7 (FINAL_UPDATE_PACK 1.3).

### Sign in, /upgrade pricing page and /unlocked (B8)
- What: unlocking while signed out shows "Save your ghosts and unlock" (theme ghost with a lock, Continue with Google / email, "We store your email and your scan count. Never your statement."). /upgrade is a standard pricing page, mobile first and theme-aware: Close and "Upgrade"; "Choose your plan / Pay once, keep it"; radio cards Free ($0, current), Unlimited ($10 once, Best value, default) and Founding member ($5, "[N] spots left" from the real paid count, hidden when sold out or unknown); a What's included list that changes per plan (Free crosses out what it doesn't get), fading in one by one; "Your scans found $X" with a filling bar and "That's Nx the $10 price"; the research (stats 1 to 8 with sources); How we compare (Ghost Fees / Rocket Money / Bank apps, prices checked Nov 2026); 3 tap-to-open questions; a Ghost It card; and a sticky bar with the plan, price and Continue to payment / Stay on Free. Checkout charges the plan picked. /unlocked (where Stripe now returns) confirms the payment with Stripe, then confetti, a jumping ghost, "Founding member #N" for founders, "You're in.", "Paid $X · Found so far $Y". During the beta it says everything is free.
- Files: src/pages/Upgrade.jsx, src/pages/Unlocked.jsx, src/pages/upgrade.css (new), src/components/scan/Paywall.jsx, src/App.jsx, src/lib/ghostFees/allowance.js, base44/functions/createCheckout (plan, return URLs), base44/functions/allowance (paidCents, tier, foundingNumber)
- How to test: open /upgrade, switch plans (list, price and button change). With PAYMENTS_ENABLED=true and Stripe test keys, pay with 4242 4242 4242 4242 and land on /unlocked.
- User feedback that drove this: design canvas screens 3 to 5 (FINAL_UPDATE_PACK 1.3).

### Plain value statement first on the home page
- What: every theme now opens with one plain sentence before any art: "Find the subscriptions and bank fees you forgot you're paying, then cancel them." with three steps (Upload a bank statement > See every leak in dollars > Cancel with ready-made steps and emails), "Free, no bank login" and "See it on a sample in 10 seconds". The 👻 subheading no longer says "8 kinds" (the section below says five); it names them instead.
- Files: src/components/landing/ValueLine.jsx (new), src/pages/Landing.jsx, src/lib/ghostFees/themes.js
- How to test: open the home page in each theme: the value line is the first thing under the header.
- User feedback that drove this: "I was quite overwhelmed at the beginning with the visuals and it took a lot of scrolling to digest the content... Make the value statement clear from the start and make it more concise" (tester, hackathon mailbox, 2 Nov, 3 of 5).

### Ask Ghost It: the app hands your subscriptions to the agent (B5)
- What: the two products stay separate but now point at each other both ways. On the results page, "Ask Ghost It about these" copies "@ghostit Fitlife Gym $45.00/mo, Adobe Creative Cloud $29.99/mo, ..." (up to 6), says "Copied. Paste it in ASI:One", opens asi1.ai and counts the click (ask_ghostit_click, count only). Every subscription-type ghost card has its own small Ask Ghost It. Arriving from Ghost It (?ref=asi1&subs=...) still shows the From Ghost.it banner, which can now be closed. Local development clicks don't count.
- Files: src/components/results/AskGhostIt.jsx (new), src/components/results/ResultsView.jsx, src/components/landing/FromGhostIt.jsx
- How to test: Try a sample statement, press Ask Ghost It about these, paste into ASI:One. Open /?ref=asi1&subs=netflix,stan: the banner shows; × closes it.
- User feedback that drove this: "need to link the two projects while keeping separate, people are not trying my agent enough".

### Did it stop? And a celebration when it really did (B4)
- What: any Ghost List item Requested for 7+ days asks "It's been 8 days. Did Netflix stop charging?" with Yes, it stopped / Still charging buttons. The big moment (confetti, the ghost floating away, "Netflix is gone for good! $203.88 a year back in your pocket.") plays only on Confirmed, never on the first "I cancelled it" (which keeps its small toast). No motion with reduced motion.
- Files: src/components/results/GhostList.jsx, src/index.css
- How to test: put something on the Ghost List, set its date 8 days back (or wait), open Subscriptions and press Yes, it stopped.
- User feedback that drove this: retention research: celebrate the confirm, not the click (FINAL_UPDATE_PACK 1.6).
### Animated 36-second demo to screen-record at /demo
- What: a new page, /demo, plays a 36-second animated walkthrough in six scenes with big one-word captions: Upload (Tilly's chat), Found (the sample's 5 ghosts and $296.92 counting up), Block (Fitlife Gym blocked, the F**k-ex jar fills), Cancel (Cassy's official steps and email), Ask (Ghost It on ASI:One: $612 a year, 3 streaming services) and Free to try (the link). Real ghost art and the sample's real numbers. ?ratio=16x9 (default), 1x1 or 9x16; press R to replay. Record it with Cmd + Shift + 5.
- Files: src/pages/Demo.jsx (new), src/pages/demo.css (new), src/App.jsx
- How to test: open /demo, start a screen recording, click Start; or /demo?ratio=9x16 for stories.
- User feedback that drove this: "how did people make cool videos like this", "I should do animated video".

### 💔 Postcard links to the ex's cancel page; Cassy bubble clears the sunglasses
- What: the Weekend away postcard ("Wish you weren't here, Adobe Creative Cloud.") now links to that ex's official cancel page ("Cancel Adobe Creative Cloud on their site"), or, with no checked page, a Find their cancel page with Cassy button that opens the chat on Cassy. The ghost under the calendar: the comma is back ("Scroll down to f**k your exes more, with help from Cassy."), and the speech bubble's tail now sits just beside each ghost's face, so it no longer covers the sunglasses or eyes.
- Files: src/components/ex/ExAct2.jsx, src/components/results/HauntedCalendar.jsx
- How to test: pick 💔, Try a sample statement, See everything: Glow-up plan (postcard) and Check-ins & reminders (the bubble), for I'm Fine and Heartbroken.
- User feedback that drove this: "can this link here to the actual cancel link on the website"; "comma before Cassy and do not cut off the sunnies".

### Research next to your own numbers (B9)
- What: the guess reveal now says "You guessed $100. It's actually $296.92 in 7 months, 197% more than you thought." (or "Good guess, you were close."), with "20% more spent on subscriptions than people think (Westpac, 2025)" underneath. Each ghost card shows one matched stat, only where it fits and each stat once: gym ($1,116 unused gym), a trial that turned paid (38% forgot a trial), Netflix (57% name Netflix), a duplicate (3 in 10 lose up to $600). The home strip already shows stats 1 to 3 and Cassy's screen the cancel stat. Every stat shows its source and year.
- Not done: /progress "Our users vs the research" (average guess vs average real total). The guess never leaves the browser today; it would need a new, aggregate-only log.
- Files: src/components/results/GuessReveal.jsx, src/data/stats.js (statKeyForLeak), src/components/results/ResultsView.jsx
- How to test: Try a sample statement, Reveal with $100: "197% more than you thought". Ghosts tab: Streammax shows the trial stat, Adobe the duplicate stat.
- User feedback that drove this: research shown next to users' own numbers (FINAL_UPDATE_PACK 1.7).

### /evidence for the judges, and our users vs the research (B10)
- What: an admin-only page, /evidence, with all time and last 7 days side by side: visits by ref (asi1, try, slack...), scans, sample scans, real scans, $ found on real statements, Ask Ghost It clicks, /try completions, feedback count, average clarity score (1 to 5) and % who would pay $10 once. Below: every feedback with a "Quote OK only" filter, Copy as text and Download CSV, and the "You said, we changed" table from src/data/changelog.json (6 pairs, written with roles not names). It says plainly that $ ghosted and confirmed stopped live in each person's browser and aren't collected. /progress gets "Our users vs the research": the average guess vs the average real total across real statements (shown only from 3), next to Westpac's 20%. To count these, two new events: sample_finished, and guess_revealed carrying only the guess and the total (real statements only). Privacy page updated.
- Files: src/pages/Evidence.jsx (new), src/data/changelog.json (new), src/App.jsx, src/pages/Progress.jsx, src/pages/Privacy.jsx, src/lib/session.js, src/pages/Landing.jsx, src/components/results/ResultsView.jsx, base44/entities/Event.jsonc, base44/functions/logEvent, base44/functions/progressStats
- How to test (published, as admin): open /evidence. Scan a real statement and reveal; after 3 of those, /progress shows the comparison.
- User feedback that drove this: evidence for the Fetch.ai and Base44 submissions (FINAL_UPDATE_PACK 1.8).

### Home page tabs and a 3-step results tour
- What: less scrolling and a guided start. On the home page, the three sections below the stats are now tabs (Have any of these? / What it finds / Who made it), one at a time instead of one long scroll. The first time results show (after the reveal), a 3-step tour scrolls to and rings the real thing: 1 "This is your total" (real charges, share or PDF), 2 "Each tab is one job" (the results tabs), 3 "Stuck? Ask a ghost" (the guide button, or Ask Ghost It). Skip any time; shown once per browser; no smooth scrolling with reduced motion. Not shown in the 💔 phone story, which already walks you through.
- Files: src/components/landing/HomeTabs.jsx (new), src/components/results/ResultsTour.jsx (new), src/pages/Landing.jsx, src/components/results/ResultsView.jsx, src/components/guide/GhostGuide.jsx, src/index.css
- How to test: home page: switch the three tabs. Try a sample statement (👻 or 🎄), Reveal, Show me the ghosts: the tour starts; Next through 3 steps.
- User feedback that drove this: "it took a lot of scrolling to digest the content on each page which made it hard to understand what I was seeing" (tester, 2 Nov, 3 of 5).

### The promise, the purpose and who it's for, first on the home page
- What: the block that opens every theme now says three things, in order. The promise (UVP) as a tagline: "Ghost them once. Pay once." (pay once, never a subscription). The purpose in one sentence: "Ghost Fees finds the subscriptions and bank fees you forgot you're paying, then helps you cancel them. No bank login." Who it's for, as "Is this you?": three cards with ghost art (Still paying for the gym you stopped going to / Forgot to cancel a "free" trial / Three streaming apps, watching one); tapping one shows the real stat behind it ("You're not alone: 38% of overspenders forgot to cancel a free trial (Westpac, 2025)"), otherwise "For Australians juggling subscriptions: students, sharehouses, couples and families." Then the 3 steps, the sample button and "$10 once, never a subscription. Free while we're in beta."
- Files: src/components/landing/ValueLine.jsx
- How to test: open the home page in each theme; tap each "Is this you?" card.
- User feedback that drove this: founders: "need to make the UVP, purpose and target market clearer in a more creative way"; tester: "make the value statement clear from the start and more concise".

### Upgrade flow matches the Claude Design canvas
- What: the limit sheet, sign-in, /upgrade and /unlocked now follow the "Ghost Fees upgrade flow" canvas (claude.ai/artifact/PKDgdAvRXEbDJvHyTXkmtJ), with each theme's own palette: 👻 plum with mint, 💔 wine with pink, 🎄 forest with gold. Limit sheet (1A): handle, round close, floating theme ghost, "You've used your 3 free scans", big "Your scans found $296.92 in ghosts" with the number popping in, "paid back 29x", pulsing "Unlock everything, $10", "Maybe later", "Your results stay visible. See how we compare". Ghost try used (1B): the four guide dots and "Cassy can help with all 5 ghosts you found". Sign in (2): ghost with a lock, white Continue with Google, Continue with email, the privacy box. /upgrade (3): round ticks with a line under each feature (e.g. Cassy: "Real cancel page, steps, AU phone and hours"), FREE PLAN vs WHAT'S INCLUDED, a growing radio dot, a filling bar, the research rows, the comparison grid, questions, a "Try it" card for Ghost It, and a sticky bar with a padlock and a pulse. /unlocked (4): jumping ghost, founding pill, "You're in.", a Paid / Found so far card. Kept from before on purpose: the PDF answer says PDFs are kept for now (the canvas says "read, then deleted", which isn't true yet), and no "receipt sent" line unless Stripe receipts are switched on.
- Files: src/lib/ghostFees/upgradeTheme.js (new), src/components/scan/Paywall.jsx, src/pages/Upgrade.jsx, src/pages/Unlocked.jsx
- How to test: development: /?preview_paywall=scan, =guide, =sign_in in each theme; /upgrade in each theme.
- User feedback that drove this: the founders' design canvas for the subscription and upgrade flow.

### Sources in brackets, and buttons that pop
- What: Every research source now reads in brackets, e.g. "(Compare the Market, 2026)": the home stats strip, the "typical price" checker, the limit sheet, /upgrade research rows and the About page. The home chips (Forgotten subscriptions / Sneaky fees / Price creep) are now bright tappable buttons, each with its own colour (mint, orange, pink), icon and glow, and they open the sample. "Upload my CSV or PDF" has a stronger outline so it no longer looks disabled.
- Files: src/components/landing/Hero.jsx, src/components/stats/StatsStrip.jsx, src/components/landing/CommonSubsChecker.jsx, src/components/scan/Paywall.jsx, src/pages/Upgrade.jsx, src/pages/About.jsx
- How to test: Home page (👻 and 🎄): the three chips glow in different colours; tap one and the sample runs. Scroll to the stats: sources show in brackets. /upgrade > The research: sources in brackets.
- User feedback that drove this: "bracket the sources please so it looks cleaner", "can we make some of the buttons pop more", "make the sources on the home page have the sources in brackets"

### Free vs Premium, the ghost team and the savings, under the UVP
- What: The home value block keeps "Ghost them once. Pay once." on top, then adds: Your ghost team (Penny: fees and totals, Sir Spooksworth: letters and emails, Gus: busting your ghosts, Cassy: cancelling for you, Ghost It: chat agent in ASI:One), a Free card (sample, 3 scans, full total, 1 ghost try, 3 themes) beside a highlighted Premium card ($10 once: unlimited scans, all 4 guides, Cassy's cancel info, emails, Ghost List stop-check, reminders, PDF and badges), and the savings maths: $1,600+ a year potentially wasted (Compare the Market, 2026); cancelling one $10-a-month subscription pays for Premium in a month. Same plan facts as /upgrade.
- Files: src/components/landing/PlansAtAGlance.jsx (new), src/components/landing/ValueLine.jsx
- How to test: Home page in each theme: the team row, Free and Premium side by side (stacked on a phone), the savings line, and "See plans" opens /upgrade.
- User feedback that drove this: "need to have this done properly: free trial, what it offers, then what the premium gives you, lists the key agents and functions and how it can save you heaps of money, keep a clean UVP"

### Pro-app header, Free vs Pro plans, lighter home page, opt-in tours, Haunted ghost
- What: Every page header now has Log in and a glowing Upgrade button on the right (signed in: your initial, your plan "Free" or "Pro", and a menu with Upgrade to Pro, Your progress, Log out). "Pro" shows only for people who paid, not the free beta. The top home block is short again: the UVP, one line on what it does, who it's for, 3 steps, "See it on a sample" and "Take the 30-second tour". "Is this you?" and a new "Free vs Pro" tab moved into the home tabs. Free vs Pro is laid out like a pro app: Free $0 and Pro $10 once side by side, one button each ("Try the sample free" / "Get Pro", or "Your current plan"), the ticked features, then the ghost team and the savings maths. /upgrade calls the $10 plan "Pro". Tours are opt-in (they never pop up on their own): a 4-step home tour (what it does, try it, Free or Pro, the tabs) and the 3-step results tour from a "Tour" button in the header or the ⋯ menu; Back, Skip and Esc work. Haunted House now uses the mint card ghost instead of the hooded lantern ghost, which looked like Christmas (Cassy nudge, limit sheet, /unlocked).
- Files: src/components/site/AccountMenu.jsx (new), src/components/site/BrandHeader.jsx, src/components/tour/Tour.jsx (new), src/components/landing/HomeTour.jsx (new), src/components/landing/IsThisYou.jsx (new), src/components/landing/PlansAtAGlance.jsx, src/components/landing/ValueLine.jsx, src/components/landing/HomeTabs.jsx, src/pages/Landing.jsx, src/components/results/ResultsTour.jsx, ResultsMenu.jsx, ResultsView.jsx, src/components/results/HauntedCalendar.jsx, src/components/scan/Paywall.jsx, src/pages/Unlocked.jsx, src/pages/Upgrade.jsx, public/themes/haunted/card-ghost.webp (from Image Assets "Cheerful Chibi Ghost with Mint Card")
- How to test: Home: Log in + Upgrade top right; no pop-up; "Take the 30-second tour" walks 4 steps. Tabs > Free vs Pro: two cards. Sample > Calendar & reminders (👻): the mint card ghost with the bubble beside its face. Results header "Tour" runs the results tour.
- User feedback that drove this: "make this look like free and paid subscription… like a pro platform and have login where you have free and then the upgrade button, look like ChatGPT with free and pro… and the UVP", "where's the little tour and way to implement the complexity and information overload comment", "this is for Christmas, isn't there a better one", "is there some sort of click-through navigation tour, sometimes distracting, unless there is a better idea… make it more cleanly"

### Outlook calendar import, cleaner Cassy card, badges that explain themselves, one goal card
- What: Outlook's "Subscribe from web" no longer fills in the link we send it, so the Outlook and Work Outlook buttons now copy the reminders link first and say "paste it into Subscribe from web and press Import"; a one-line Outlook how-to sits under the buttons. (Checked live: the feed itself returns a valid calendar with the reminders.) Cassy card: the picked subscription is never struck through (cancelled ones get a ✓ instead); no duplicate heading; Cassy's answer sits in one box instead of three; sources list each website once; the date reads "1 Nov 2026"; "Next: Follow their steps" sits inside the card so the floating Ask a ghost button can't cover it. Ghost List level and badges: "Ghost $X/yr more to reach Legend", a line saying what levels and badges are for, each badge as a tile that says how to earn it, and tapping one opens a short description (and that badges come with Pro). "Who are these for?" now says why: "Who uses these? Pick one for the best fix". The duplicate "What matters to you? Set a life goal" card under Subscriptions is now one link to Goal path, where life goals live.
- Files: src/components/results/CalendarSync.jsx, CancelAssistant.jsx, CassLookup.jsx, GhostList.jsx, SubscriptionsSection.jsx, src/lib/ghostFees/levels.js
- How to test: Calendar & reminders > Set up calendar sync > Outlook: toast says the link is copied; paste in Outlook, Import, and the reminders appear. Calendar tab > Cassy: pick a cancelled one, no strike-through. Subscriptions > I cancelled it on one > Ghost List: tap a badge.
- User feedback that drove this: "why not importing reminders" (Outlook screenshot), "better way to clean up the UI here", "what are these for", "need to make these 4 purpose cleaner", "how does First Ghost and Price Rise Spotter work, there should be a little popup description so people know what they're paying for", "shouldn't this be in the goal path section"

### Subscription tracker checklist in Calendar & reminders
- What: A tracker under the calendar lists every subscription as a checklist: price, next charge date and where it's at (To decide, Keeping, Cancelled and check your next statement, Stopped for good, or Still charging after you cancelled). Keep or Cancel on each row (Cancel asks for proof and adds it to the Ghost List; Keep is the same answer as on the Subscriptions tab). "2 of 7 sorted", a progress bar and $/yr ghosted at the top. Group by Double-ups (with each group's yearly total and what to do), Type, Status or Next charge (next 7 days, later this month, later). "Hide sorted" shows only what's left.
- Files: src/components/results/SubscriptionTracker.jsx (new), src/components/results/ResultsView.jsx
- How to test: Sample > Calendar & reminders: the tracker sits under the calendar. Keep Streammax: 2 of 7 sorted, and it moves to Keeping when grouped by Status. Group by Double-ups: the 3 streaming services together with $599.76/yr.
- User feedback that drove this: "have a checklist here but also in calendar some tracker with checklist that keeps track of every subscription including double ups etc, maybe some grouping function"

### 💔 "Who dis?" bubble no longer covers the heart sunglasses
- What: In "If an ex charges you after you cancel" (Messages to exes, and Act 2 of the story), the sassy ghost's "New phone. Who dis?" bubble went up-left from her mouth, straight over her left heart lens and her phone, and the text wrapped. The ghost now sits left and the bubble comes from her right cheek, going right, clear of the glasses, eyes and phone, on one line. Art can now set a different tail point per side.
- Files: src/components/ex/ExKit.jsx, src/components/ex/ExAct2.jsx
- How to test: 💔 theme > sample > Messages to exes: the bubble is to the right of her face; sunglasses and phone fully visible. Check-ins & reminders: the Cassy nudge bubble also clears her glasses.
- User feedback that drove this: "CHECK speech bubble overlap on who this ghost"

### Bigger text, cleaner home, sign-in with the promise, tour inside the results, plain tab names, cancel buttons
- What:
  - Text: every small size went up a step across the app (about 600 places), so captions are at least 12.5px and most text 13.5 to 14.5px. Home sections share one width, stats and "Is this you?" cards are bigger.
  - Home: the 3 steps are a clean list going down (number, icon, one line). The ghost team cards each have a big coloured ghost with a role icon, the name, a coloured job tag and one line on what they do (including Ghost It).
  - Sign in / sign up: the pages now show the promise ("Ghost them once. Pay once."), what Free and Pro give you and the privacy line beside the form, instead of a blank "Welcome back". The limit sheet says the promise above its button. /?preview_paywall=scan (or guide, cass, report, sign_in) now works on the live site, so the paywall can be shown while it's free.
  - Tour: removed from the home page. Inside the results, "New here? Take the tour" (and the Tour button) runs a click-through tour that opens Ghosts, Subscriptions and Calendar for you.
  - Tabs: every theme's tabs now say what they do (Ghosts, Mark as sorted, Goal path, Calendar & reminders, Email templates, Subscriptions, Receipt), with the theme's own name ("Jacob's chain", "Heartbreak House") as a small second line. "Break this link" now reads "It's sorted: break this link", with what it means.
  - Ghost types: picking Trial converted, Bank fee, Duplicate or Price creep shows what it means and what to do; "All" lists every type found. Card badges show the meaning on hover.
  - Cancel: every subscription ghost card has "Cancel on X's site ↗" (the checked official page) or "Find X's cancel page" (a web search, never a guessed link). Bank fees don't get one.
- Files: 92 files for text sizes; src/components/AuthLayout.jsx, src/pages/Login.jsx, Register.jsx, src/components/landing/ValueLine.jsx, PlansAtAGlance.jsx, IsThisYou.jsx, src/pages/Landing.jsx, src/components/stats/StatsStrip.jsx, src/components/tour/Tour.jsx, src/components/results/ResultsTour.jsx, ResultsView.jsx, LeakFilter.jsx, LeakCard.jsx, CancelSiteLink.jsx (new), src/components/xmas/XmasLeakCard.jsx, JacobsChain.jsx, src/components/ex/ExLeakCard.jsx, src/components/results/HauntedHouse.jsx, src/components/scan/Paywall.jsx, src/lib/AllowanceContext.jsx, src/lib/ghostFees/leaks.js; removed src/components/landing/HomeTour.jsx
- How to test: Home in each theme: steps list, Free vs Pro > ghost team. /login and /register. /?preview_paywall=scan. Sample > "New here? Take the tour". 🎄 sidebar: plain names with the story names under. Ghosts > Trial converted: the meaning and "Find Streammax's cancel page".
- User feedback that drove this: "text size and proportions need to be better, some text too small", "give icons and description of each agent", "where's the paywall and the sign in with clean UVP description", "need to make step 1, 2 and 3 cleanly", "the tour doesn't work, needs to be inside not on the home page", "step 1, 2 and 3 down, clean list", "need these names and the icon to be more visual and clean", "what's trial converted and the other ones like bank fees", "add button direct to the web page to cancel the subscription", "what's Fees Past, Jacob's etc, redesign to the other themes", "what's break this link"

### Ghost team gets its own home section; badges explained in the plans
- What: "Meet your ghost team" (Penny, Sir Spooksworth, Gus, Cassy and Ghost It, each with their ghost, role icon, job and one line) is now its own section right under the stats, instead of being hidden in the Free vs Pro tab. In the Pro list, "badges" now says what they are: "Levels and badges as you cancel, like First Ghost and Price Rise Spotter, to share" (same on /upgrade).
- Files: src/components/landing/GhostTeam.jsx (new), src/components/landing/PlansAtAGlance.jsx, src/pages/Landing.jsx, src/pages/Upgrade.jsx
- How to test: Home page: the team row under the stats in every theme. Free vs Pro tab: the badges line.
- User feedback that drove this: "where's the different ghost agents", "what's the badges"

### Badges explained before you earn them
- What: A "Badges you can earn" card shows each badge (First Ghost, Overlap Buster, Price Rise Spotter, House Cleared) with how to earn it, plus the levels (Rookie, Hunter at $100/yr ghosted, Exorcist at $500/yr, Legend at $1,000/yr). It's in the Free vs Pro tab on the home page and on the Subscriptions tab until your Ghost List has something on it (the Ghost List, where badges live, only appears after you cancel one).
- Files: src/components/results/BadgesExplainer.jsx (new), src/components/landing/PlansAtAGlance.jsx, src/components/results/SubscriptionsSection.jsx
- How to test: Home > Free vs Pro: the card under the plans. Sample > Subscriptions with an empty Ghost List: the same card above the list.
- User feedback that drove this: "explain badges better"

### Ghost team cascades down the page
- What: "Meet your ghost team" is now one agent per row, going down the page: their ghost and role icon on the left, then the name, a coloured job tag and one line on what they do. Rows fade in one after another (off for reduced motion).
- Files: src/components/landing/GhostTeam.jsx, src/index.css
- How to test: Home page, under the stats: five rows, Penny to Ghost It.
- User feedback that drove this: "make them cascade down the page vertically"

### Honest Free vs Pro, first 3 steps on your results, what it doesn't find, founders
- What:
  - Plans now match what's really locked. Pro unlocks unlimited scans, all 4 ghost guide chats, Cassy for every subscription and the PDF report. Cancel links, steps and emails, the Ghost List, reminders, the tracker and badges are free for everyone (they were wrongly listed as Pro). Same on the home page, sign-in page, /upgrade and the badge popup.
  - "Your first 3 steps" card above the tabs on your results: see your biggest ghost, keep or cancel your subscriptions, cancel one for real. Each has "Show me" (opens the right tab) and ticks itself off; hide it any time. Not a pop-up.
  - "What it finds" tab: a new "What it doesn't find, and what to do instead" section (everyday spending, interest and BNPL fees, surcharges, short statements, changing bills, Apple and Google bundles, scanned PDFs), each with what to do instead. The results "What doesn't it detect?" pop-up shows the same tips.
  - Founders: Sanjay removed (home and About); Bella and Delia now sit one under the other with their full bios.
- Files: src/components/landing/PlansAtAGlance.jsx, src/components/AuthLayout.jsx, src/pages/Upgrade.jsx, src/components/results/GhostList.jsx, src/components/results/FirstSteps.jsx (new), src/components/results/ResultsView.jsx, src/components/results/DetectionInfo.jsx, src/components/landing/UseCases.jsx, src/data/founders.js, src/components/landing/FoundersSection.jsx
- How to test: Home > Free vs Pro: Pro lists 4 things. Home > What it finds: scroll to "What it doesn't find". Home > Who made it: Bella and Delia. Sample > Reveal: "Your first 3 steps" above the tabs; tap Show me on step 1.
- User feedback that drove this: "are the blocks set properly on the free version", "how will we make a little tour on the trial so it's less information overload", "remove Sanjay on this", "what it finds, can we improve through addressing what it doesn't find"

### One link to test Ghost It: /ghostit, and Ask Ghost It opens the agent directly
- What: hunt-ghost-fees.base44.app/ghostit is the link to share for testing Ghost It, our Fetch.ai agent: one line on what it does, a ready test message with a Copy button, and one "Open Ghost It" button. It goes to Ghost It's Agentverse page, whose "Chat with Agent" button opens ASI:One already talking to it. The web app is an optional last line, so testers aren't asked to understand both. Every "Ask Ghost It" button (results, ghost cards, /try) now opens Ghost It's page instead of the ASI:One home page, so nobody has to hunt for @ghostit. Opens and copies are counted (counts only).
- Files: src/pages/GhostIt.jsx (new), src/lib/ghostFees/ghostItAgent.js (new), src/App.jsx, src/components/results/AskGhostIt.jsx, src/pages/Try.jsx
- How to test: /ghostit: Copy, then Open Ghost It, then Chat with Agent, then paste; the reply shows 5 lines of maths and a streaming double-up ($2,091.64 a year). Sample > Ask Ghost It: opens the Agentverse page.
- User feedback that drove this: "what's the link, how are we linking the projects, get more tests on my Fetch.ai project without confusing users"

### Ghost It stands out: a card under your total, and "Message Ghost It about Spotify"
- What: Under your total there's now a Ghost It card: its blue ghost with a chat badge, "AI agent on ASI:One", what it's for (keep going in chat any time; it does the yearly maths line by line, spots double-ups, gives the official cancel steps and a ready email, and keeps your Ghost List), its price (free during the beta, then first Ghost Pack free, $2 a pack or $5 for all), and a "Message Ghost It about these" button. Under each ghost card the small "Ask Ghost It" link is now a clear blue "Message Ghost It about Spotify" button. All of them copy the message and open Ghost It's Agentverse page (Chat with Agent).
- Files: src/components/results/AskGhostIt.jsx, src/components/results/ResultsView.jsx
- How to test: Sample > Reveal: the Ghost It card under the PDF button; scroll to a ghost card: "Message Ghost It about <name>".
- User feedback that drove this: "need to have Ghost It look better and message people, need a way to charge Ghost It and have the purpose of Ghost It stand out"
### Results sidebar from tablet width, in every theme
- What: The results sections show as a sidebar from 768px wide (was 1024px), so tablets, small laptops and the Base44 preview get the same left sidebar as big screens, with the theme's name under each plain name. Only phones get the scrolling bar along the top. Same in all three themes.
- Files: src/components/results/ResultsView.jsx
- How to test: Sample > results at about 900px wide: sidebar on the left. On a phone: the bar along the top.
- User feedback that drove this: "why does Christmas have this bar up top"

### Tour opens from anywhere, led by a ghost guide
- What: Pressing Tour before the "Before we show you..." guess did nothing (the tour waited for the reveal). Now pressing Tour skips the guess and starts straight away, in every theme (💔 included). The tour is led by your ghost guide: their ghost, name and role ("Penny, the tidy accountant, shows you round"), and it follows whichever guide you've picked. It also checks for its steps after the page has drawn, so it starts on your total (all 7 steps).
- Files: src/components/tour/Tour.jsx, src/components/results/ResultsTour.jsx, src/components/results/ResultsView.jsx
- How to test: Sample > on the guess screen press Tour (header): the total appears and Penny's tour starts at step 1 of 7.
- User feedback that drove this: "the tour doesn't open and should be a ghost guide"
### Ghost It strip under each ghost card, with what it does for that one
- What: The loose "Message Ghost It about Spotify" button is now a strip attached under each subscription's card: Ghost It's blue avatar, "Let Ghost It handle Spotify in chat", what it does for that ghost, and a "Message Ghost It" button. For price creep it says it works out what the rise costs a year (e.g. $24.00 more a year), asks if you'd still sign up and gives the cancel steps, and sends Ghost It "Spotify went from $12.99 to $14.99" (checked: Ghost It replies with that maths). For other subscriptions: yearly cost, double-ups, cancel steps and a ready email, then tracks that it stopped. Bank fees don't get one (Ghost It doesn't handle those).
- Files: src/components/results/AskGhostIt.jsx, src/components/results/ResultsView.jsx
- How to test: Sample > Ghosts > Spotify (price creep): the strip under the card; Message Ghost It copies "@ghostit Spotify went from $12.99 to $14.99".
- User feedback that drove this: "needs to be designed better and the better benefits of Ghost It"

### Ghost It's own mascot, a "Meet Ghost It" pop-up, and the free try made clear
- What: Ghost It now uses its own mascot (a happy ghost cutting up a credit card, from the agent's art) on the Ghost It card, under each ghost card, on /ghostit and in the ghost team. "What is Ghost It?" opens a Meet Ghost It pop-up: what makes it special (lives in your chat, shows the maths, spots double-ups, official cancel steps, a ready email, checks it stopped), and the free trial in a highlighted box: "Free trial: 1 try. Your first Ghost Pack is free. After that, $2 a pack or $5 for every pack, paid once in ASI:One. Free while we're in beta." The limit sheet (paywall) now has a "Your free trial" box: Ghost Fees gives 3 scans, 1 ghost guide chat and 1 Cassy lookup; Ghost It gives your first Ghost Pack, then $2 a pack or $5 for all.
- Also: Ghost It now has three poses from Image Assets "Ghost It poses": waving with a chat bubble (Ghost It card, /ghostit, ghost team, the pop-up), snipping a card (under each ghost card and on the paywall), thumbs up with a tick (the free-trial boxes). Transparent art, so no dark square behind it.
- Files: public/themes/ghostit/ghost-it-wave.webp, ghost-it-snip.webp, ghost-it-thumbs.webp (new), src/components/results/GhostItDialog.jsx (new), src/components/results/AskGhostIt.jsx, src/lib/ghostFees/ghostItAgent.js, src/pages/GhostIt.jsx, src/components/landing/GhostTeam.jsx, src/components/scan/Paywall.jsx
- How to test: Sample > the Ghost It card > What is Ghost It?. /?preview_paywall=scan: the "Your free trial" box. Home > Meet your ghost team: Ghost It's mascot.
- Also: under each ghost card the Ghost It strip lists its benefits as ticks and says "1 free try, then $2 a pack or $5 for all (free in the beta)"; the paywall's free-trial box has one row for Ghost Fees and one for Ghost It, each with its ghost.
- User feedback that drove this: "need Ghost It to have a unique mascot and a popup or some clear way to make sure Ghost It is special with features, and clear only one try on free trial, add to the paywall", "list benefits of Ghost It clearly and that there's only one try before a charge", "add to the paywall to make it cleaner"
### 🎄 Dusty speaks in real speech bubbles, and every mini card has a button
- What: Dusty (Stave one) now talks with the speech-bubble art: the first bubble comes out of his mouth and goes up and right, the second sits just under it, both pointing back at him and never over his eyes. The three cards under him each have a button: "Cancel it" (the checked official cancel page) or "Find it" (a search, never a guessed link) for subscriptions, and "Waive it" for bank fees, which jumps to that fee's card with the waiver email.
- Files: src/components/xmas/XmasKit.jsx (SpiritSays), src/components/xmas/XmasTabScreens.jsx, src/components/results/CancelSiteLink.jsx
- How to test: 🎄 theme > sample > Ghosts: Dusty's two bubbles; tap Waive it on Monthly Account Fee.
- User feedback that drove this: "use speech bubble assets more cleanly and have one coming out of the ghost's mouth and one under", "all need cancel on site button"

### Tour card sits beside what it explains, with a pointer
- What: The tour card used to sit in the middle of the bottom of the screen and cover what it was explaining (half of your total). Now it moves next to its target: just under it (or above it if there's no room) with a small arrow pointing at it, lined up with it. For big areas (your total, a whole tab) it sits in the bottom corner beside the content. It follows the target as the page scrolls. On phones it stays a slim card at the bottom.
- Files: src/components/tour/Tour.jsx
- How to test: Sample > Tour: step 1 in the corner with the whole total visible; step 2 under the share and PDF buttons with an arrow; steps 4 to 6 beside each tab.
- User feedback that drove this: "is there a better way to tour this" (the tour card covering the total)
### What it can't see yet, and how to catch it anyway; clearer type counts
- What: The "What it doesn't find" list is now "What it can't see yet, and how to catch it anyway", in two groups. "We can still help you catch these": short statements (Upload more months), subscriptions on another card or account (new; Tell Ghost It, or add that statement), what's inside Apple and Google charges (phone steps, then Check typical prices, which opens the Have any of these? tab), scanned PDFs (Upload a CSV). "Left out on purpose, and where to look instead": changing bills (Energy Made Easy), interest and BNPL fees (Moneysmart), everyday spending and surcharges. Each row says why we miss it and how to catch it, with a button that does it. On the Ghosts filter, the number on each chip ("Trial converted 1") is now a small count badge, so it reads as how many were found.
- Files: src/components/landing/CatchTheRest.jsx (new), src/components/landing/UseCases.jsx, src/components/landing/HomeTabs.jsx, src/pages/Landing.jsx, src/components/results/LeakFilter.jsx
- How to test: Home > What it finds: scroll to the two groups; tap Check typical prices (opens Have any of these?) and Upload more months (opens the file picker). Sample > Ghosts: the chips show count badges.
- User feedback that drove this: "lay this out and make clear how we can compensate and find things the app cannot currently find", "what's trial converted one"
- Also: the Ghosts type chips no longer list every meaning at once (it looked messy): "Tap a type to see what it means and what to do", with the meaning on hover too. For big areas the tour card uses the empty space beside the content when there's room, otherwise a narrower card in the corner.

### Ghost It gets its own job and its own box: the Ghost Packs
- What: Cancelling each subscription is Cassy's job, so the Ghost It strip under every ghost card is gone. Ghost It now has one stand-out box on your results, in its own blue look with its waving mascot: "The leaks your statement can't show". It explains the split (Cassy cancels each one here; Ghost It hunts across them in chat), shows its six Ghost Packs as tiles (Screen, Sound, Tech Stack, Food, Gym, Play, each with what it hunts), a real example (Spotify $14 + YouTube Premium $17: "YouTube Premium already includes YouTube Music. Keep just Spotify and save $204.00/yr", which is what Ghost It replies), "Run my Ghost Packs in chat", "What is Ghost It?" and the free trial (1 try). The Meet Ghost It pop-up leads with the packs too.
- Files: src/components/results/GhostItPacks.jsx (new), src/components/results/ResultsView.jsx, src/components/results/AskGhostIt.jsx, src/components/results/GhostItDialog.jsx
- How to test: Sample > Reveal: the Ghost It box under the PDF button; ghost cards no longer have a Ghost It strip.
- User feedback that drove this: "Ghost It doesn't handle the subscription, that's another agent, I think Cassy. What makes it unique, we need to make it stand out and have its own starter box with better design"

### Ghost It on the porch and by the upload button, Cassy helps (not cancels), Cassy talks you through it, white Ask a ghost, See this ghost works
- What:
  - Ghost It joins the Haunted House "Front porch · your guides" as an AI agent (its own mascot, "Ghost Packs"); tapping it opens Meet Ghost It.
  - Under "Upload my CSV or PDF" (Haunted and 💔 home pages): "Want to understand your fees more?", with Ghost It's mascot, linking to /ghostit (its Ghost Packs analyse each kind of leak).
  - Cassy's job now reads "Helps you cancel" (was "Cancelling for you"), and every "Cassy cancels" line says "helps you cancel": people sign in and cancel themselves, so nobody thinks we hold their logins.
  - Cassy talks you through each cancel step in an orange speech bubble ("You sign in there, I never see your login", "Tick each step as you go…", "Stuck? Send this email…", "Did it work? That's $X a year back…").
  - The Haunted "Take me to Cassy" ghost is now orange Cassy (the card ghost is Ghost It's look).
  - "Ask a ghost" (floating and sidebar) uses a white ghost, since there are several guides.
  - Goal path's "See this ghost in the house" now opens that ghost's room and highlights it (it only switched tabs).
- Files: src/components/landing/GhostItOffer.jsx (new), Hero.jsx, ExHero.jsx, src/components/results/HauntedHouse.jsx, GoalPath.jsx, ResultsView.jsx, CancelAssistant.jsx, HauntedCalendar.jsx, GhostItPacks.jsx, GhostItDialog.jsx, src/components/guide/GhostGuide.jsx, src/lib/ghostFees/guides.js
- How to test: Home: the Ghost It offer under Upload. Sample > Mark as sorted: Ghost It on the porch. Goal path > See this ghost in the house. Calendar > Cassy's bubble on each step.
- Also: the feedback question is now "Would you pay $10 once for Pro: unlimited scans, every ghost guide and the full PDF report?" (it still said $5), with a line saying the report is the Download PDF report button under your total.
- Also: 🎄 Dusty's three fee cards now show each fee's festive ghost (the same Christmas avatars as the ghost cards below), bobbing.
- User feedback that drove this: "these fees should appear as ghosts like on the other UIs", "put $10 and this is for unlimited access and full report, where do they download the full report", "Ghost It should be under agents or in its box where you upload fees", "can Cassy cancel for you? No, she can assist you in cancelling, people will be worried about security", "See this ghost in your house does not take you to the ghost", "put the orange Cassy image here", "this should also be a conversation with Cassy", "Ask a ghost on all UIs should be a white ghost"

### Trial tracker: know the day a free trial turns paid, with a calendar reminder
- What: In Calendar & reminders, a Trial tracker: add a free trial (name, start date, 7/14/30 days, price after). It shows the day it turns paid and a countdown (red when it's paid, orange within 3 days), and puts a reminder 2 days before into Google, Outlook or Apple Calendar (.ics). If calendar sync is on, new trials go straight into the synced calendar. Trials your statement shows already turned paid are listed too ("Streammax turned paid on 12 Apr: $113.94 so far"). Saved in this browser only.
- Files: src/components/results/TrialTracker.jsx (new), src/components/results/ResultsView.jsx
- How to test: Sample > Calendar & reminders > Trial tracker: add Paramount+, started 5 days ago, 7 days, $13.99: "1 day left, turns paid <date>", and the calendar buttons. Streammax shows under Already turned paid.
- User feedback that drove this: "there should be some starter trial tracking that will track when trials get converted from free to paid, tracked and scheduled on the calendar"

### The Ghost It offer by the upload button: bigger, clearer, to the point
- What: The box under "Upload my CSV or PDF" now has a "Specialised AI agent" tag, a big headline "Ghost It finds what your statement can't show", three short points (subscriptions you pay for twice; apps hidden in Apple or Google bundles; what weekly costs add up to a year), a bigger mascot and a "Try it →" button. /ghostit now says to sign in to ASI:One first, because agents only reply to signed-in people.
- Files: src/components/landing/GhostItOffer.jsx, src/pages/GhostIt.jsx
- How to test: Home page in each theme: the box under the upload button.
- User feedback that drove this: "writing needs to be bigger and needs to say something like specialised agent, make the purpose of the agent more clear and to the point"

### Ghost It offer names its packs and why it's different
- What: The Ghost It box by the upload button now lists its six Ghost Packs as chips (Screen, Sound, Tech Stack, Food, Gym, Play: one per kind of leak) and says why it's different from other AI agents: "Not a general chatbot: every number is real maths you can check, and every cancel link is checked, never guessed." (True: Ghost It uses no LLM for numbers or links.)
- Files: src/components/landing/GhostItOffer.jsx
- How to test: Home page: the box under Upload my CSV or PDF.
- User feedback that drove this: "mention the packs, why is this different to other AI agents"

### Ghost It gets its own box under the house (off the porch)
- What: Ghost It is the separate, paid-by-pack AI agent, not one of the free guides, so it's off the "Front porch · your guides" row (back to Penny, Spooksworth, Gus and Cassy). Under the house (and under Jacob's chain and Heartbreak House) it now has its own box: "Ghost It · specialised AI agent. Want a deeper fee analysis?", with what its Ghost Packs dig into, the six packs, a real example, Run my Ghost Packs in chat and the free try.
- Files: src/components/results/HauntedHouse.jsx, src/components/results/ResultsView.jsx, src/components/results/GhostItPacks.jsx
- How to test: Sample > Mark as sorted: four guides on the porch; the Ghost It box below the house.
- User feedback that drove this: "keep Ghost It separate because that will be charged with API; it should sit under the house for fee analysis and offer deeper analysis of the fees; it should have its own box"

## Mon 2 Nov to Wed 4 Nov 2026 (PRs #91 to #118, logged 4 Nov)

### Sign-in pages explain the product first (#91, #92)
- What: Log in, create account and password pages show the purpose, the ghost team and what each does, Free vs Pro vs Ghost It packs, and a theme picker before you sign in.
- Files: src/components/AuthLayout.jsx, src/components/landing/GhostTeam.jsx
- How to test: Open /login: purpose line, theme cards, ghost team and the offer sit beside the form (under it on phones).
- User feedback that drove this: team review

### Free vs Pro above the home tabs (#93)
- What: The plan card moved out of the fifth home tab to sit above the tab bar, so people see the price without hunting.
- Files: src/pages/Landing.jsx
- How to test: Home page, scroll past the ghost team.
- User feedback that drove this: team review

### Ghost It consolidate plan on the site (#94)
- What: /ghostit and the offer box explain the consolidate plan: keep one, cancel or rotate the rest, with the saving.
- Files: GhostItOffer.jsx, GhostTeam.jsx, src/pages/GhostIt.jsx, AuthLayout.jsx
- How to test: /ghostit: "What it does for you" list.
- User feedback that drove this: team review

### Christmas: named ghosts with popups, Jacob's poses, bubbles from the mouth (#95, #96, #99, #107)
- What: Every festive ghost has a name and a tap popup (Popcorn Pete, Tangled Tinsel, Sweaty Holly, Cool Yule, Frosty, Mystery Parcel). Speech bubbles come from the mouth using the asset template. Copy rewritten as short sentences. Full names never cut off. Second tab renamed Cancel and track.
- Files: christmasArt.js, XmasTabScreens.jsx, XmasKit.jsx, JacobsChain.jsx, XmasLeakCard.jsx, ResultsView.jsx
- How to test: Christmas theme > sample: tap any ghost for its popup.
- User feedback that drove this: team review

### Collapsible trackers, cleaner type, one cancel card layout (#97, #98, #100)
- What: CollapseCard folds results sections. Inter replaces Lato Black, headings semibold. Changed my ways cards look the same in every state.
- Files: CollapseCard.jsx, TrialTracker.jsx, SubscriptionTracker.jsx, index.html, ChangedMyWays.jsx
- How to test: Sample > Trial tracker opens and closes; Cancel and track cards all match.
- User feedback that drove this: team review

### Subscriptions as tabs and drop-down rows (#101)
- What: To decide / Cancelling / Keeping tabs with counts; each subscription is one row that opens to its cancel link, steps and actions.
- Files: SubscriptionsSection.jsx
- How to test: Sample > Subscriptions.
- User feedback that drove this: team review

### Ask a ghost panel fits the window (#102)
- What: The panel is never taller than the window, so the guide tabs stay on screen in short windows.
- Files: GhostGuide.jsx
- How to test: Shrink the window, open Ask a ghost: tabs visible.
- User feedback that drove this: team review

### Ghost It links land on Ghost It (#103, #104, #105, #106)
- What: Open Ghost It goes to Ghost It's ASI:One page instead of a blank chat; the sign-in box was tried and removed; the price line is current and the free first pack sits in the explainer.
- Files: ghostItAgent.js, GhostIt.jsx, Try.jsx, AskGhostIt.jsx
- How to test: /ghostit > Open Ghost It.
- User feedback that drove this: team review

### Christmas pictures and goal path (#108, #109, #113)
- What: Sharper Christmas morning art, a cosy cabin goal path, a different ghost per goal and the Sleeper as You are here.
- Files: xc-morning-*.webp, GoalPath.jsx, XmasKit.jsx
- How to test: Christmas theme > Goal path.
- User feedback that drove this: team review

### Calendar bells and the data-safety popup (#110, #111)
- What: Red bells on every subscription day in every month. A "How we keep your data safe" popup on sign in and in the app, with the no-upload option (tap price ranges, less exact).
- Files: HauntedCalendar.jsx, DataSafety.jsx, AuthLayout.jsx, HomeTabs.jsx
- How to test: Sample > Calendar; sign-in page > How we keep your data safe.
- User feedback that drove this: team review

### Jolly's table with the real ghosts (#112, #115)
- What: The feast uses the Image Assets ghosts seated at their dishes with prices on the plates, plus a list of every guest. Sweaty Holly has new seated art; the other five switch over as their art arrives.
- Files: JollysTable.jsx, jollysTable.json, public/themes/christmas/table/
- How to test: Christmas theme > sample > Email templates.
- User feedback that drove this: team review

### Calendar task list from your goals (#114)
- What: A checklist under the calendar built from your goals, with a "Do it on" date per goal. New Overlap Buster icon.
- Files: goalTasks.js, GoalTasks.jsx, GoalPath.jsx, HauntedCalendar.jsx
- How to test: Sample > Goal path: pick a day; Calendar shows the task.
- User feedback that drove this: team review

### Pro is $10 once for everyone (#116)
- What: The $5 founding tier is off. Upgrade copy and the checkout price are $10 once.
- Files: base44/functions/allowance/entry.ts, base44/functions/createCheckout/entry.ts, allowance.js, Upgrade.jsx
- How to test: Live allowance status shows priceCents 1000 and foundingLeft 0 (checked 4 Nov).
- User feedback that drove this: team review

### One clear UVP, tidier tour, no comma before "and" (#118)
- What: "Find the subscriptions you forgot. Cancel them in one click." with a double-up example and three ticks ($10 once, no bank login, no upload needed) on every theme and sign in. Tour popups tuck inside tall sections instead of hanging over the border. ", and" becomes " and" across the copy.
- Files: UvpLine.jsx, Hero.jsx, ExHero.jsx, AuthLayout.jsx, Tour.jsx, 56 copy files
- How to test: Home and /login show the line; Tour on the sample results.
- User feedback that drove this: team review

### Subscriptions grouped by category, tap chips, change a category
- What: Subscriptions group by category with a count and yearly total, biggest first. Chips with counts replace the type drop-down. Each row has a Category picker saved in the browser. New Food, Gaming and News categories.
- Files: SubscriptionsSection.jsx, src/hooks/use-categories.js, src/lib/ghostFees/overlaps.js
- How to test: Sample > Subscriptions: 📺 Streaming 3 · $599.76/yr first; open Fitlife Gym, set Category to Other, it moves.
- User feedback that drove this: team review

### Ghost It opens in the ASI:One web app on phones
- What: asi1.ai/ai/* is a universal link, so phones opened the ASI:One app, where outside agents need verification. Phones now open asi1.ai/chat in the browser with the @ghostit sample copied. Computers keep Ghost It's own page.
- Files: src/lib/ghostFees/ghostItAgent.js, src/pages/GhostIt.jsx
- How to test: On a phone, /ghostit > Open Ghost It: the browser opens asi1.ai/chat, paste and send.
- User feedback that drove this: Raj (Fetch.ai), 4 Nov: "currently the link 'copy and open ghost it' is taking to mobile app, I would suggest you to point it to our web app"

### Watch the videos: /progress, sign in and home
- What: /progress opens with "Watch the videos": 60-second demo (coming soon until its file is added), Promo (1:32), Full walkthrough (2:05) and 3 days of feedback (1:56). 2 x 2 on desktop, one column on phones. Covers show a frame a few seconds in with a ghost play button and the length; nothing plays until tapped, then normal controls. The promo also sits on the sign-in pages ("See it in 90 seconds") and behind a "Watch the promo" link on the home page that opens it in a popup.
- Files: src/data/videos.js (new), src/components/site/VideoCard.jsx (new), WatchVideos.jsx (new), PromoButton.jsx (new), src/pages/Progress.jsx, src/components/AuthLayout.jsx, src/components/landing/Hero.jsx, public/videos/
- How to test: /progress: tap Promo, it plays with controls. /login: promo under the UVP. Home: Watch the promo opens the popup.
- User feedback that drove this: team review
### Trust line on the home page and sign in
- What: Under the UVP: "🔒 We never touch your bank, cards or accounts. We only show you what to cancel. You decide." Ghost It's first message says the same.
- Files: src/components/landing/UvpLine.jsx
- How to test: Home page and /login, under the three ticks.
- User feedback that drove this: Kingan (Tool Offer agent builder), 4 Nov: his agent never spends money on its own and the buyer approves every payment; show proof, don't ask people to trust the AI.
### Home card: clean and open (design A)
- What: The first home card loses its box and the three boxed steps. Now: a small kicker (Find · Cancel · Pay once), one semibold headline, one sentence, three steps in a line, one button with "or upload a statement" under it, quiet ticks and the trust line. A soft glow instead of a border. About half the height.
- Files: src/components/landing/ValueLine.jsx, src/pages/Landing.jsx
- How to test: Home page, top card, in all three themes.
- User feedback that drove this: team review ("less chunky writing ... more streamlined and clean design"; picked design A of four)
### Future spend chart (Calendar tab)
- What: A line chart of what your subscriptions cost over the next 12 months or 5 years if nothing changes, against after cancelling the ones you picked (or every double up but the cheapest). Plain maths (monthly x months), a "See the numbers" table and the working shown. Colours checked for colour-blind safety on all three theme backgrounds.
- Files: src/components/results/FutureSpend.jsx (new), src/components/results/ResultsView.jsx
- How to test: Sample > Calendar & reminders: $1,733 over 12 months, $1,302 after cancelling 2 double ups; switch to 5 years: $8,667 and $6,508.
- User feedback that drove this: team review ("can i have future prediction through some graphs for future spend")

### A proper nav bar at the top
- What: About us · Our progress · Ghost It · Pricing sit in a nav bar next to the Ghost Fees logo (the current page is highlighted), with Log in and Upgrade on the right and the theme picker centred under it. Phones: the links are one swipeable row. The footer keeps only Privacy and the legal text.
- Files: src/components/site/BrandHeader.jsx, src/components/site/SiteFooter.jsx
- How to test: Any page: the links are at the top; tap Our progress, it highlights.
- User feedback that drove this: team review ("put this in a better spot, on top of the themes as a proper nav bar")

### Nav bar like a pro web app: sticky, with Videos and Privacy
- What: The top bar stays put as you scroll (blurred background, thin bottom line). Links: About us · Our progress · Videos · Ghost It · Pricing · Privacy. Videos jumps to the three stacked videos on /progress. The theme picker sits centred under the bar.
- Files: src/components/site/BrandHeader.jsx, src/components/site/WatchVideos.jsx
- How to test: Any page: scroll, the bar stays; tap Videos: /progress opens at the Demo video.
- User feedback that drove this: team review ("Our progress, Privacy and videos should be above the theme bar, more formalised like a pro web page")

### Softer type everywhere, the feedback cards fixed, Raj round 2 and Kingan added
- What: Bold reads as semibold and semibold as medium across the app (Inter as a variable font); headings slightly tighter with balanced line breaks; body text a touch more line spacing and Inter's cleaner letter shapes. The "You said, we changed" cards on /progress showed empty quotes (the data used said/changed, the page read quote/change): fixed. Raj's 4 Nov feedback and Kingan's are added. No comma before "and" in the new copy (testers' own words left as they wrote them).
- Files: index.html, src/index.css, src/pages/Progress.jsx, src/data/changelog.json, src/data/videos.js, src/data/shipped.json, src/components/results/FutureSpend.jsx
- How to test: /progress: the feedback cards show the quotes, Raj and Kingan at the top; text looks lighter.
- User feedback that drove this: team review ("make text less chunky and better formatted"; "what commas in text")

### Each video where it works best
- What: The demo is on the home page (Watch the demo, a popup) and the sign-in pages (See it in 2:05), because people deciding to sign up want to see it working. /progress keeps all three, demo first for judges, then the promo and how far we've come.
- Files: src/data/videos.js, src/components/site/PromoButton.jsx
- How to test: Home: Watch the demo (2:05) opens the demo. /login: the demo under the UVP. /progress: Demo, Promo, How far we've come.
- User feedback that drove this: team review ("does the demo video belong on home and login and the others in our progress")

### Feedback board on /progress, with Leave feedback
- What: Every Stranger Builds "Trick or Feedback" review (7) in the tester's own words (spelling fixed only): One change, Trick, Treat, the star rating, and What we changed. Summary: 7 testers · 3.3 of 5 · 7 of 7 acted on. Leave feedback opens the /try form at step 3.
- Files: src/data/testerFeedback.json (new), src/components/site/FeedbackBoard.jsx (new), src/pages/Progress.jsx, src/pages/Try.jsx
- How to test: /progress#feedback; tap Leave feedback: /try scrolls to Tell us one thing.
- User feedback that drove this: team review ("put all feedback and what I implemented from Stranger Builds under our progress"; "add a leave feedback message board")

### Media page, and each video where its job is
- What: New /media page (Media in the nav, replacing Videos): the three videos (Promo first, then Demo and How far we've come), a press kit (the one-line pitch with Copy, the facts, the founders line, logo and share image downloads) and a build diary (what shipped each day, from shipped.json). /progress now shows only How far we've come, right above the Feedback board it is about. The demo stays on home and sign in.
- Files: src/pages/Media.jsx (new), src/components/site/WatchVideos.jsx, src/components/site/BrandHeader.jsx, src/pages/Progress.jsx, src/App.jsx, src/data/videos.js
- How to test: Nav > Media: three videos, press kit, build diary. /progress: one video, then the Feedback board.
- User feedback that drove this: team review ("the promo doesn't belong in our feedback, maybe have media and blog tabs; think how the videos can be logically integrated")

### Unlocked page: honest for the owner, clearer for everyone
- What: The app never charges admin (owner) accounts, so the owner landed on "You're in · Paid" without paying. Now the owner sees "Owner account: Pro is always on and you are never charged. To test the real $10 checkout, sign out or use another account." Everyone sees a checklist of what Pro unlocks and "You paid $10 once"; the button says Scan a statement until there's a total.
- Files: src/pages/Unlocked.jsx, src/lib/AllowanceContext.jsx
- How to test: Signed in as the owner, /unlocked shows Owner account. Signed in as anyone else after paying: You're in, $10 once.
- User feedback that drove this: team review ("it did not charge me"; "could do this UI better")
### Feedback video: Stranger Builds hackathon feedback, with a designed cover
- What: On /progress the video is titled "Stranger Builds hackathon feedback" with "Ghost Fees" as the subtitle. Before it plays it shows a purple-to-black gradient cover with the title, the event line and four feature tags (3 themes, Cancel in one click, Grouped subscriptions, Ghost It agent) instead of a dark frame. The line under it mentions the themes and features.
- Files: src/data/videos.js, src/components/site/VideoCard.jsx, src/components/site/WatchVideos.jsx, src/pages/Progress.jsx
- How to test: /progress: the gradient cover; press play and it plays with controls.
- User feedback that drove this: team review ("title this video Stranger Builds hackathon feedback with Ghost Fees as the subtitle; purple and black gradient; talk more themes and features")

### Ghost It is the first tab
- What: The nav bar leads with the product: Ghost It (with a small AI badge) · Pricing · Our progress · Media · About us · Privacy.
- Files: src/components/site/BrandHeader.jsx
- How to test: Any page: Ghost It is first; on /ghostit it is highlighted.
- User feedback that drove this: team review ("make Ghost It the actual product, the first tab")

### Ghost Fees first: the main app leads, Ghost It is the extra
- What: The nav bar starts with Ghost Fees (the main app), then Ghost It (AI). On /ghostit a "Start here · the main app" card for Ghost Fees sits at the top (Open Ghost Fees), then "Then, for double-ups the statement can't show" leads into Ghost It. The old box at the bottom is gone.
- Files: src/components/site/BrandHeader.jsx, src/pages/GhostIt.jsx
- How to test: /ghostit: the Ghost Fees card first; nav: Ghost Fees · Ghost It AI · Pricing · Our progress · Media · About us · Privacy.
- User feedback that drove this: team review ("move this above, Ghost Fees over Ghost It, as Ghost Fees is the main one; make it easiest to use")

### Jolly's table: the bubble fits, ghosts stay off the food and prices
- What: Jolly's speech bubble sits inside the picture with padding that keeps the words inside the oval: "Come in!" then "Every dish is something you pay for." on balanced lines (no word left alone). The six seated ghosts are a touch smaller and nudged out from the table so a bobbing ghost never covers its dish or price tag, and the price tags sit on top.
- Files: src/components/xmas/JollysTable.jsx
- How to test: Christmas theme > sample > Email templates: the bubble and every dish and price are clear.
- User feedback that drove this: team review ("make text fit in the speech bubble"; "make the bouncing animated ghosts not overlap the food and their price")
### The full demo on the home page
- What: The demo video is embedded right under Scan a sample free and Upload, in every theme, instead of a small Watch the demo link.
- Files: src/components/landing/Hero.jsx, src/components/landing/ExHero.jsx
- How to test: Home page: the demo card under the two buttons; tap play.
- User feedback that drove this: team review ("embed the whole demo video, do not hide that beautiful demo")

### Don't want to upload? goes to the existing card; UVP text reformatted
- What: A "Don't want to upload? Tap what you pay instead" button under Upload my CSV or PDF opens the existing "Do you have any of these?" card (no new popup, so no double up; describing it to Ghost It is the Ghost It box just below). Fixed: the No upload needed links changed the address to /#have but didn't switch the tab on the home page; now they open it. The UVP block is reformatted: each sentence on its own line (Cancel them in one click in the accent colour), a shorter example, three equal ticks and a one-line trust note, with no word left alone on a line.
- Files: src/components/landing/NoUploadButton.jsx (new), Hero.jsx, ExHero.jsx, UvpLine.jsx, src/components/site/DataSafety.jsx
- How to test: Home: tap Don't want to upload? or the No upload needed tick: the Have any of these? tab opens and scrolls into view.
- User feedback that drove this: team review ("a button under upload CSV for people who don't want to upload; make sure no double up"; "format all this text better")

### Home page: Our progress link and a feedback form
- What: Near the end of the home page, "Built with your feedback · Tell us what to fix next": a link to Our progress (stars, "7 testers told us what to change") and the same feedback form the results page uses, with a first question that fits people who haven't scanned ("Is it clear what Ghost Fees does?"). Answers go to the same Feedback list.
- Files: src/components/landing/HomeFeedback.jsx (new), src/components/results/FeedbackPanel.jsx, src/pages/Landing.jsx
- How to test: Home, scroll to the end: the link opens /progress at the Feedback board; the form submits.
- User feedback that drove this: team review ("on the home page a link to our progress with a feedback form under it so people can leave feedback")

### Ghost It agent copy brought up to date (agent/)
- What: agent/ now matches the deployed Ghost It: v13.1 (update pack 6: Consolidate button, evidence line, Mark ghosted approval, trust line), v13.2 (reply sent before the receipt, timing logs) and Plan B (GHOSTIT_LOCAL_SEED runs the same agent locally with a mailbox). Adds the example card payloads in agent/cards/. No secrets in the copy.
- Files: agent/ (git subtree pull from the agent repo)
- How to test: `cd agent && python3 -m unittest discover -s tests` (98 tests).
- User feedback that drove this: team review ("update all changes through pull requests"); Raj (buttons, replies not showing) and Kingan (evidence, human approval)
### Tap what you pay (no upload, no agent) and Please leave a review on /progress
- What: "Do you have any of these?" now lets you tap what you pay (cheapest, middle or dearest plan, or type your own) and adds it up for a year, names the dearest one and flags streaming double ups. Taps stay on the page and are never mixed into a scan. No cancel links are guessed. On /progress, a "Please leave a review" box under the Feedback board uses the same feedback form as home (one form, not two); the board button jumps to it.
- Files: src/components/landing/CommonSubsChecker.jsx, src/components/site/FeedbackBoard.jsx
- How to test: On each theme (haunted, ex, christmas) tap "Don't want to upload? Tap what you pay instead" under Upload, pick Netflix, Stan and Disney+, tap an amount for each: a yearly total and a double up note show. /progress: "Leave a review" jumps to the form.
- User feedback that drove this: team review ("make sure the cards where you can tap the amount you spend... in case people do not want to upload or try agent"; "under progression please leave a review")
### The journey videos: 60 seconds and the full 3 minutes
- What: Two new videos from Claude web: the 60-second journey (Stranger Builds hackathon feedback, with the gradient cover) and the full 3:09 journey. Both are at the top of /progress; the 60-second one leads /media, then the promo, the demo and the full journey. The old 1:56 feedback video is retired. Home and sign in keep the demo walkthrough.
- Files: public/videos/ghost-fees-journey-60s.mp4, ghost-fees-journey-full.mp4 (new), src/data/videos.js, src/pages/Progress.jsx, src/pages/Media.jsx
- How to test: /progress: 60 s then 3:09 above the Feedback board. /media: 60 s first.
- User feedback that drove this: team review ("embed this, Claude web chose the best one")

### One video on home: the promo; the demo is a link
- What: The promo (our story in 90 seconds) is embedded in the top home card. The demo, which shows the old home page design, moved to a "Watch the full demo (2:05)" link that opens it in a popup, so the two videos do not repeat each other. The trust line in the top card uses the same lock-icon pattern as the UVP block.
- Files: src/components/landing/ValueLine.jsx, Hero.jsx, ExHero.jsx, src/components/site/PromoButton.jsx
- How to test: Home: one video (the promo) in the top card; Watch the full demo opens the demo.
- User feedback that drove this: team review ("embed the promo one too"; "do promo and demo overlap too much"; "pick the best one and put it in")

### Media: a link to share for each video
- What: On /media every video has "Copy link" (opens /media at that video, e.g. /media#video-promo) and "Video file" (the mp4 itself, which plays in any browser or chat app). The videos themselves are unchanged.
- Files: src/components/site/VideoCard.jsx, src/components/site/WatchVideos.jsx, src/pages/Media.jsx
- How to test: /media, tap Copy link under Promo, open it in a new tab: it scrolls to the Promo. Video file opens the mp4.
- User feedback that drove this: team review ("I want the videos as they are but shareable links for media")

### Jolly's feast: the new Christmas table, every ghost bobbing
- What: Stave Two uses the new feast picture (Jolly carving the turkey at the head, five guests around the table). Each ghost and Jolly is cut out along its white sticker outline into its own layer and bobs up and down on its own beat over the table; the space behind each one is filled in so nothing doubles up while they move. Prices sit on the six blank tags by the plates. Bobbing stops for people who turn on reduced motion. About 240 KB of art.
- Files: src/components/xmas/JollysTable.jsx, src/components/xmas/xmasKit.css, public/themes/christmas/table/feast/ (feast-bg, jolly, coolyule, frosty, popcorn, tinsel, mystery .webp)
- How to test: Christmas theme, Scan a sample, Email templates (Jolly's letters): the ghosts bob, each price is on a tag, the list below shows who is eating what.
- User feedback that drove this: team review ("implement this, the Christmas ghosts bobbing up and down", with the new table picture)
- Not deleted: the old table.webp, the old seated-*.webp (seated-gym is still used in the list) and jollysTable.json are no longer used by the table. Left in place; delete only when you say so.

### Ghost It runs itself, so it works in ASI:One (and after the competition)
- What: on Agentverse hosting, Ghost It's replies were held about 40 seconds before sending and ASI:One gives up at about 30, so it showed nothing. The same agent.py run on our own machine with an Agentverse mailbox replied in under 8 seconds with the card and tap buttons, and Consolidate worked (tested in ASI:One, 5 Nov 8:31 AM). agent/deploy/ is a kit to run it for good: a systemd service that starts on boot and restarts on crash, a private settings file for the seed (never in git), pinned requirements and a one-page guide.
- Files: agent/deploy/ (setup.sh, ghost-it.service, ghost-it.env.example, requirements.txt, SELF_HOSTING.md)
- How to test: on the GB10, `cd ghost-fees/agent/deploy && bash setup.sh`, then message the agent in ASI:One.
- User feedback that drove this: team review ("why can't we do it properly so I have it after the competition"); Raj (replies not showing)
### Link preview: no more "Free, no sign-in"
- What: the share card (Slack, iMessage, WhatsApp) said "Free, no sign-in, private", which isn't true now that scans need a sign-in and Pro is paid. The badge now says "Try it free · Pro $10 once", and the page description says "No bank login. Try it free, Pro is $10 once." The image link has ?v=2 so apps fetch the new picture instead of a cached one.
- Files: public/og-image.png, index.html
- How to test: after publishing, paste https://hunt-ghost-fees.base44.app into a new Slack message (old posts keep the old card), or check it at opengraph.xyz.
- User feedback that drove this: team review ("why is the preview showing that it's not fully free and there is sign in for Pro")

### The app's Ghost It links go to the working agent
- What: every "Chat with Ghost It" and profile link now uses the self-run Ghost It (agent1qdaylwvrj...), which replies in ASI:One in seconds with cards and buttons. The hosted one (agent1qvxxy97...) held replies past ASI:One's wait.
- Files: src/lib/ghostFees/ghostItAgent.js
- How to test: after Publish, /ghostit, tap Open Ghost It: ASI:One opens the ghost-it agent; send "Netflix $18.99, Stan $16" and the card with buttons comes back.
- User feedback that drove this: team review ("how do we get cards and buttons working for everyone")

### Ghost It v13.3 and one agent with the full profile
- What: the agent sends its receipt first, then the reply (the chat protocol's order, as in Fetch's example). The self-run agent now has the name Ghost.it, the @ghostit handle, the ghost picture, banner, description, readme and three starter prompts; the old hosted agent is stopped (renamed @ghostit-hosted, restartable). Default local name is Ghost.it so a restart never renames it.
- Files: agent/agent.py, agent/tests/test_agent.py, agent/deploy/ghost-it.env.example
- How to test: `cd agent && python3 -m unittest discover -s tests` (98 pass); in ASI:One message @ghostit "Netflix $18.99, Stan $16, Disney+ $15.99".
- User feedback that drove this: team review ("why two ghost_its", "make one with the ghost and description")

### Journey videos v3 (complete last line)
- What: the 60-second (0:58) and full (3:09) journey videos are replaced with v3, which ends on the complete line "Try Ghost Fees today." Same file names, so every shared link keeps working; the app adds ?v=3 so browsers fetch the new copy. Both are faststart.
- Files: public/videos/ghost-fees-journey-60s.mp4, public/videos/ghost-fees-journey-full.mp4, src/data/videos.js
- How to test: /media and /progress, play each to the end.
- User feedback that drove this: Update Pack 8 ("Swap in v3 videos")
### Money patterns: a behavioural-finance line on leak cards and a "Where your ghost money went" chart
- What: leak cards backed by statement lines now show the common money pattern behind them, with the research: Trial converted = Present Bias (O'Donoghue & Rabin, 1999), Bank fee = Denomination Effect (Raghubir & Srivastava, 2009), Still using this? = Status Quo Bias (Samuelson & Zeckhauser, 1988; the analyser doesn't make that card yet, so it won't show). Worded "a common pattern", never "you have". In the Ghosts tab, above the filter chips, a horizontal bar chart (recharts) shows dollars per pattern from this statement, largest first, in the theme colour; tap a bar to filter, "See the numbers" opens a table (pattern, ghost, paid charges, total, dates). Hidden with fewer than 2 patterns. Footer: "Common money patterns from behavioural finance research. Not a judgement, and not financial advice." Never attached to Future spend or predictions. Bar colours pass 3:1 contrast on all three dark themes (dataviz validator).
- Files: src/lib/ghostFees/leaks.js (BADGE_BIAS, biasFor, biasGroups), src/components/results/BiasLine.jsx, src/components/results/BiasChart.jsx, src/components/results/LeakCard.jsx, src/components/ex/ExLeakCard.jsx, src/components/xmas/XmasLeakCard.jsx, src/components/results/ResultsView.jsx
- How to test: Scan a sample on each theme, Ghosts tab: two bars (Denomination Effect $117, Present Bias $114); tap Present Bias to filter; See the numbers shows 6 paid charges, 12 Apr to 12 Sept, matching the Streammax card.
- User feedback that drove this: Update Pack 8 ("Bias layer + graph"). Idea from Sanjay's earlier behavioural-finance project; all code written new this week.
### README: the 8 feedback rounds and the current Ghost It setup
- What: README now has the feedback table (who said what, what changed, proof PR for each of 8 rounds) and an up-to-date Ghost It section (self-hosted with a mailbox, @ghostit address, 98 tests, link to the self-hosting guide).
- Files: README.md
- How to test: open the repo on GitHub and read the README.
- User feedback that drove this: Update Pack 8 ("Feedback log: this is what scores")

### Try it opens Ghost It, not another page
- What: on the home page Ghost It card (every theme), "Try it in ASI:One" now opens Ghost It itself in ASI:One in a new tab, and shows on phones too (it was hidden there). "How it works" opens our /ghostit page. Before, the whole card and "Try it" went to /ghostit, which felt like a dead end.
- Files: src/components/landing/GhostItOffer.jsx
- How to test: home, Ghost It card, tap Try it in ASI:One: ASI:One opens on Ghost.it.
- User feedback that drove this: team review ("try it links open Ghost Fees, not working; try it should lead to ASI:One")

### Pack 9 part 0: copy and flow fixes
- What: Ex chat counts the same 5 ghosts as the Ghosts tab (was 7, it counted subscriptions). The results page shows one Ghost It line under the total instead of the full panel (the panel stays in Cancel & track). Leak cards show a small "🧠 Present Bias · why?" chip instead of the full pattern sentence (tap to read it with the research), and the research stat line only shows on cards without a chip. Ex cards get one line per kind of leak ("I said it was free. I lied.", "Just a little something every month. You won't notice.", "Twice the love, twice the bill.", "Late again? That one costs extra."), so no quote repeats. "(ABS). Above inflation" has its space; chart names are one label each. Landing: every sample button says "Try the sample (10 sec)"; the top card keeps only the headline, 3 steps and the button (the selling lines live once in the theme hero); "No upload needed for the sample"; the 8.4M stat is gone (1 in 2 and $1,600+ stay); "Pick a mood. It only changes the words." under Choose your ghost.
- Files: src/components/ex/ExJourney.jsx, src/lib/ghostFees/themes.js, src/components/ex/ExLeakCard.jsx, src/components/results/LeakCard.jsx, src/components/results/BiasLine.jsx, src/components/results/BiasChart.jsx, src/components/results/ResultsView.jsx, src/data/upgradeStats.json, src/components/landing/ValueLine.jsx, Hero.jsx, ExHero.jsx, PlansAtAGlance.jsx, UvpLine.jsx, src/pages/Try.jsx
- How to test: Ex theme, Try the sample: chat says Found 5; five different quotes; chips on the trial and bank fee cards; one Ghost It line under the total.
- Not yet: the "See why →" hook under the total (needs the Money patterns tab, part 2) and "Five ghost guides" (only once Mo ships, part 5).
- User feedback that drove this: Update Pack 9 part 0

### Pack 9 parts 1 to 3: a pattern for every badge, the Money patterns tab and "Sound like you?"
- What: every badge the analyser makes now maps to one money pattern with a real paper (each checked against Crossref): Trial converted = Present Bias (strong), Bank fee = Denomination Effect (medium), Price creep = Status Quo Bias (strong), Duplicate = Ostrich Effect (medium), Overlap = Mental Accounting (medium), Borrowing cost = Pain of Paying (medium); Surcharge has none. A new results tab, second in the list (Money patterns / Our patterns / Old habits): "4 patterns behind your $296.92", a "biggest pattern" tile, the bar chart (tap a bar to open its popup), one card per pattern and a footer citing Gollwitzer (1999) for the "When X, I will Y" habits. Each pattern opens a popup: what it is, why it happens, how to beat it with a button that does it (calendar reminder, waive email, cancel page, monthly reminder or the Subscriptions tab), the ghosts behind it with "Show on Ghosts tab", the paper (DOI link) and its evidence tag. "Sound like you?" (Yes / Not sure / No, session only, never saved): Yes highlights the habit; No hides that pattern's chip on the cards. Leak card chips open the same popup. Under the total: "Most of it comes from 4 money patterns. See why →"; in the Ghosts tab a one-line strip replaces the chart.
- Files: src/lib/ghostFees/leaks.js, src/components/patterns/PatternContext.jsx, PatternDialog.jsx, PatternsTab.jsx, WhenChart.jsx (slot), src/components/results/BiasLine.jsx, BiasChart.jsx, ResultsView.jsx
- How to test: Try the sample on each theme: Money patterns tab shows $117 Denomination Effect, $113.94 Present Bias, $59.98 Ostrich Effect, $6.00 Status Quo Bias (sum $296.92); open Present Bias, tap Yes, Show on Ghosts tab filters to Streammax; open Ostrich Effect from its chip, tap No, its chip goes.
- User feedback that drove this: Update Pack 9 parts 1 to 3. Idea from an earlier behavioural-finance project; all code and copy written new this week.

### Pack 9 part 4: Graph 2, When it happened
- What: in the Money patterns tab, a stacked bar chart of the leaked part of each charge by month (row.wastedAmount), one stack per pattern, so the months add up to the pattern totals (sample: 7 months, $296.92). Colour follows the pattern, not its rank: the first four slots of the validated dark palette, stacked in that order; all checks pass on the three themes' dark cards (lightness, chroma, CVD ΔE 8.4, normal-vision ΔE 19.8, contrast ≥ 3:1). More than four patterns fold into "Other". Legend, tooltip and a "See the numbers" table with month totals. "Charges by month. Past only, never a forecast." Hidden with one pattern or one month. Pattern charge counts now use the same leaked lines.
- Files: src/components/patterns/WhenChart.jsx, src/lib/ghostFees/leaks.js (leakRows)
- How to test: Try the sample, Money patterns tab: When it happened shows Mar to Sept; See the numbers month totals sum to $296.92.
- User feedback that drove this: Update Pack 9 part 4
### Copied Ghost It messages mention the working agent by address
- What: every message the app copies for Ghost It (Ask Ghost It on results, Ghost Packs, Try, the Ghost It page sample) now starts with the working agent's address mention instead of "@ghostit", because ASI:One still sends "@ghostit" to the old stopped agent until its index refreshes. One setting (GHOST_IT_MENTION in ghostItAgent.js) to switch back to "@ghostit" later.
- Files: src/lib/ghostFees/ghostItAgent.js, src/components/results/AskGhostIt.jsx, src/components/results/GhostItPacks.jsx, src/pages/Try.jsx, src/pages/GhostIt.jsx
- How to test: copy a Ghost It message in the app and paste it in ASI:One: it goes to Ghost.it (agent1qdaylw...), not your personal assistant.
- User feedback that drove this: team review ("link the correct ASI in the app")

### Pack 9 part 5: Mo, the Money mind ghost, and every graph in the Money patterns tab
- What: a fifth Ask a ghost guide, Mo ("Why ghosts happen", lime). The app sends Mo the money patterns worked out by biasGroups (name, badge, total, charges, dates, evidence) and the Sound like you? answers; the server adds rules: "a common pattern", never a diagnosis; only patterns in the summary with their totals as given; never estimate or add up a yearly figure ("I only use what's on your statement"); one habit as "When X, I will Y"; respect a "no". New action open_pattern opens that pattern's popup (server checks the key). Mo counts toward the same free guide try (GUIDE_KEYS updated in every function). Starter chips: "Why do my trials turn into charges?", "Which pattern costs me most?", "One habit for the biggest one?". "Four ghost guides" now says five everywhere, and Mo joins the home ghost team. Future spend moved from Calendar & reminders into the Money patterns tab, last, under "Looking ahead · a forecast, not a pattern", so every graph is in one tab and no pattern touches a forecast; Calendar has a link to it.
- Files: src/lib/ghostFees/guides.js, src/components/guide/GhostGuide.jsx, base44/functions/askGhostGuide/entry.ts (and GUIDE_KEYS in allowance, createCheckout, parseStatement, findCancelInfo), src/components/patterns/PatternsTab.jsx, src/components/results/ResultsView.jsx, src/components/landing/GhostTeam.jsx, AuthLayout.jsx, PlansAtAGlance.jsx, src/pages/Upgrade.jsx, Unlocked.jsx, src/components/scan/Paywall.jsx
- How to test: after Publish (the server change goes live then), Try the sample, Ask a ghost, pick Mo, ask "Which pattern costs me most?" (Denomination Effect, $117.00), "How much is that a year?" (must refuse to multiply), "Do I have a spending problem?" (must not diagnose). Money patterns tab: Where your ghost money went, When it happened, then Looking ahead with Future spend.
- User feedback that drove this: Update Pack 9 part 5; team review ("all graphs should be in the money tab")

### Mo walks you through it, Hattie helps you stick to it
- What: Mo's 3-step walk-through on Money patterns (your biggest pattern, Sound like you?, one small habit). Hattie, the new habit ghost (Hank on the I'm Fine pick): pick one "When X, I will Y" habit, a start day, calendar events and a task-list row, a 7-day check-in and the Habit Keeper badge. On your next scan, Hattie shows how that pattern changed (past numbers only). New sticker art for each theme.
- User feedback that drove this: tester "I was quite overwhelmed... it took a lot of scrolling to digest the content" (a guide walks you through instead of a wall of charts); founders: "explain and help apply the lesson".
- Research: Gollwitzer (1999), Dai, Milkman & Riis (2014), Lally et al. (2010).
- Disclosure: the money-patterns idea comes from Sanjay's earlier behavioural-finance project; all code and copy written new this week.
- Hattie and Hank art added: 7 stickers across 3 themes.
- Files: public/themes/habit/ (7 webp), src/lib/ghostFees/habitArt.js, habitPlan.js, guides.js, levels.js (Habit Keeper), goalTasks.js (habit row), src/components/patterns/MoWalkthrough.jsx, HabitCard.jsx, HabitCheckIn.jsx, HabitHomeCheckIn.jsx, PatternsTab.jsx, PatternDialog.jsx (BeatButton shared), src/components/guide/GhostGuide.jsx (Hattie, habit plan in summary, open_habit), base44/functions/askGhostGuide/entry.ts (Hattie rules, open_habit; GUIDE_KEYS in all functions), src/pages/Landing.jsx (home check-in), src/pages/Privacy.jsx (habit plan row), src/components/results/ResultsView.jsx (Clear my data wipes gf_habit_plan and gf_mo_walk_seen), GhostTeam and plan copy ("six ghost guides").
- Also: home stats centred with no boxes (2 stats after the 8.4M one went); the no-upload card heading is "Don't want to upload your statements?".
- How to test: Try the sample, Money patterns: Mo step 1 "$117 of your $296.92 is the Denomination Effect"; Yes, help me stick to it scrolls to the habit card with the bank fee habit picked; Save gives Mon start + check-in a week later (2 calendar events linking /?habit=check); Add to my task list adds a row in Calendar & reminders. /?habit=check shows the check-in; 2 Yes answers unlock Habit Keeper. Ex "I'm Fine" shows Hank; Heartbroken shows Hattie with the pink bow; Christmas shows Santa Hattie and the calendar pose on check-in. Hattie's chat answers need Publish.

### Ask a ghost picker: "Your fees" and "Your habits" rows
- What: The chat picker is two labelled rows instead of one grid. Your fees: Penny, Spooksworth, Gus, Cassy. Your habits: Mo and Hattie. Mo no longer sits alone on a fifth row looking like a leftover.
- Files: src/lib/ghostFees/guides.js (GUIDE_GROUPS), src/components/guide/GhostGuide.jsx
- How to test: Sample > Ask a ghost: two rows with small headings, every ghost still switches the chat.
- User feedback that drove this: "why mo is there a btter wy" (screenshot of Mo alone under the other four).

### Haunted House guide menus: Fees and Habits rows, Hattie no longer cut off
- What: The Front porch had six ghosts in one row, so Hattie was pushed off the right edge. It is now two labelled rows: Your fees (4 across) and Your habits (Mo and Hattie, centred). The small "Pick your ghost guide" row ran 218px past its card; it now wraps into Fees and Habits lines. Hattie shows her sticker instead of a plain ghost.
- Files: src/components/results/HauntedHouse.jsx
- How to test: Haunted theme > sample > Cancel & track: all six ghosts visible on the porch and in Pick your ghost guide, nothing past the card edge.
- User feedback that drove this: "can we arranhe the agent menue betetr lookss weird as 5".

### Ghost It agent synced into agent/ (v13.4 to v13.5)
- What: The agent's latest code, copied in from ~/ghost-it with git subtree. It sends the reply before the receipt, times each send, publishes the full profile (handle, description, picture, readme) on every start, uses the scissors-ghost avatar, and has the v13.5 `version` reply plus a version line under the menu. The version line came from Raj's 5 Nov note that ASI:One can lag behind Agentverse.
- Files: agent/agent.py, agent/tests/test_agent.py
- How to test: cd agent && python3 -m unittest discover -s tests (98 pass). In ASI:One, `@ghostit version` should say v13.5.
- User feedback that drove this: Fetch.ai Slack (Raj, 5 Nov) via the ASI:One sync addendum.
### Each ghost is a specialist: own intro, own questions, own answers
- What: Mo answered "Which pattern costs me most?" with Streammax (a ghost, not a pattern), because the app's quick answers ignored which ghost you were talking to and "most" matched Penny's "which ghost costs the most". Now:
  - Quick answers belong to a ghost. Mo answers patterns (biggest pattern, what a money pattern is, trials, one habit) and Hattie answers habits (where to start, make it smaller, I keep forgetting, open my plan), all from the app's own maths. The safety answers (no advice, no yearly guesses, privacy) still come first for everyone.
  - Each ghost says a short hello when you open the chat or switch to them, saying who they are and what they do. Mo explains what a money pattern is in plain words.
  - Each reply has a name tag (for example "Mo · Explains patterns"), and the input box says what to ask that ghost.
  - Chips are only that ghost's own questions (plus "Is my data stored?").
  - Fixes: "I keep forgetting" no longer gets the privacy answer. "Ask the bank to waive a fee" picks the bank fee. The paywall line says "all six of us".
  - The description box under the picker is gone (the hello says it), which gives the chat more room.
- Files: src/components/guide/GhostGuide.jsx, src/lib/ghostFees/guides.js
- How to test: Sample > Ask a ghost > Mo > "Which pattern costs me most?" gives Denomination Effect $117.00 with Open the pattern. Switch to Hattie: she says hello and offers her own habit questions.
- User feedback that drove this: "mos not asnwewring this why and people dont knwo patterns i thisnk all my aghents need to become more speicliased and need a littleintro to what tehyre doinga dn bceom obvsioud tehyre specila".

### Pack 11 Part A: each ghost does its one job first, then hands you on
- What: Opening the chat, or switching ghost, gives a fixed opener built from the scan (no AI, so it's free and the numbers are always right). Each ghost says its one job, does it on your biggest ghost, then asks one question with tap chips:
  - Penny decodes your biggest fee. Next fee, or get Spooksworth to write the ask?
  - Spooksworth drafts the email (Open the email). Firmer or friendlier? Each adds one line to paste in.
  - Gus: "5 ghosts, $296.92. Biggest first: Streammax, $113.94. Bust it?"
  - Cassy gives the official cancel link and steps from the checked list, never a guessed one. With no checked link she offers a live lookup instead. Did it work?
  - Mo: "Streammax: free trial on 12 Mar, then 6 paid charges. That's a common pattern called Present Bias... (O'Donoghue & Rabin, 1999). Sound like you?" Yes saves the answer and hands you to Hattie.
  - Hattie (Hank on the Ex "I'm Fine" pick) gives one habit for the pattern you said yes to. When do you want to start?
- Handoffs: "Ask Spooksworth →" style chips switch ghost, and the ghost you were on comes with you. Penny's fee goes to Spooksworth as a waive request. Off-job quick answers add a chip for the right ghost.
- Server (askGhostGuide): each ghost has a "one job / never" rule, can return a handoff, and Mo has a backstop. If his AI reply names no pattern, the server swaps in the fixed line for the biggest pattern. Needs Publish.
- Picker subtitles: What a fee is, Writes emails, Your progress, How to cancel, Why it happened, One habit.
- Files: src/lib/ghostFees/guideOpeners.js (new), src/components/guide/GhostGuide.jsx, src/lib/ghostFees/guides.js, base44/functions/askGhostGuide/entry.ts
- How to test: Sample > Ask a ghost. Check each ghost's opener, then Mo > "Yes, sounds like me" lands on Hattie with the Present Bias habit, and Penny > "Ask Spooksworth →" drafts the waive email for the Monthly Account Fee.
- User feedback that drove this: Update Pack 11 ("Each ghost has one job and does it first").

### Mo gets his own picture: the lantern ghost (and Hattie dresses for the theme in chat)
- What: Mo was a plain lime ghost shape. He's now the hooded lantern ghost from Image Assets ("Chibi Ghost with Glowing Lantern"): he shines a light on why your ghosts happen. Until now it was only on the Demo page. It shows in Mo's walk-through, the chat header and both Haunted House guide menus. Hattie in the chat now wears the theme's outfit like her habit card (witch, pink bow, Hank, Santa), and the Haunted House porch shows witch Hattie.
- Files: public/themes/mind/mo-lantern.webp (copy of haunted/lantern-ghost.webp), src/lib/ghostFees/guides.js, src/components/patterns/MoWalkthrough.jsx, src/components/guide/GhostGuide.jsx, src/components/results/HauntedHouse.jsx
- How to test: Any theme > sample > Money patterns: Mo is the lantern ghost. Ask a ghost > Mo: the same art in the header. Ex theme > Hattie: pink-bow Hattie (Hank on "I'm Fine").
- User feedback that drove this: "look local image assets ofpr proper images" (screenshot of plain Mo on the Ex theme).

### Email box always shows Close; chat reopens on the newest message
- What: (1) A long fee email was taller than a laptop screen, so the × and the Copy / Open in Mail buttons were off screen. The email box now fits the screen: the title and × stay at the top, the buttons and a new Close button stay at the bottom, and only the email scrolls. (2) After switching ghost with the chat closed, reopening showed the top of the chat (an old hello from Penny) under the newly picked ghost. The chat now jumps to the newest message every time it opens.
- Files: src/components/results/LeakEmailDialog.jsx, src/components/guide/GhostGuide.jsx
- How to test: Sample > Waive it on Monthly Account Fee: × at top, Copy / Open in Mail / Close at the bottom, with no scrolling of the page. Open Ask a ghost, close it, pick Cassy in the Haunted House, reopen: Cassy's message shows.
- User feedback that drove this: "open email where is teh clsoe button" and "why is peneny inetrdoucsing under gus".

### Every ghost checked on every theme: handoffs fixed, Hank named properly
- What: Ran all six ghosts on Haunted, Ex and Christmas, with every opener and chip, and asked each one a question outside its job. Fixed:
  - Asking Penny, Spooksworth, Gus or Cassy about a pattern ("Which pattern costs me most?", "Why do my trials turn into charges?") got a ghost answer or a failed AI call. Now it's one line ("That's Mo's job...") and an Ask Mo → chip.
  - Habit questions to the other ghosts (Gus answered "Which habit should I start with?" with goals) now say "That's Hattie's job" with an Ask Hattie → chip.
  - Total, cost and price-creep answers from Mo, Hattie or Cassy now add Ask Penny →. Mo and Hattie no longer answer "Which ghost costs the most?" themselves.
  - On the Ex "I'm Fine" pick, Hank's name shows in the picker, name tags, header, placeholder, Mo's handover line and the Ask Hank → chip. Before, only his hello said Hank.
  - Hattie defaults to the pattern Mo opens with (the biggest ghost's) when you have no plan or answer yet. "pick Next Monday" keeps its capital letters.
- Files: src/components/guide/GhostGuide.jsx, src/lib/ghostFees/guideOpeners.js
- How to test: Sample > Ask a ghost. Penny: "Which pattern costs me most?" gives Ask Mo →. Gus: "Which habit should I start with?" gives Ask Hattie →. Ex theme with I'm Fine: Mo > Yes hands to Hank.
- User feedback that drove this: "chekc other ghsots smake suer they inroudce properly and have tehir specilaisties".

### Kit, the bundle ghost: keep one, rotate the rest, sort AI tools by need and budget
- What: A seventh ghost guide, Kit (sky blue), with one job: subscriptions that do the same thing. Every pick is made by rules in the browser (no AI), only from what you already pay for, at your statement's (or typed) prices, and per month only (no yearly forecasts).
  - Streaming, food and gaming: "Which do you watch most?". Then Keep [it] only shows what to cancel and the monthly saving. Rotate, one a month gives a month-by-month plan (favourite first) and "Add the rotation to my calendar" (.ics with a reminder 2 days before each switch).
  - Music and storage: keep one.
  - AI tools: type them with prices (or use the ones on your statement), tick what you use AI for (writing, docs & formatting, images, video, design, coding, research) and a budget (up to $20 / $40 / $60 / no limit). Kit keeps the smallest mix (max 3) that covers it. Each kept tool says what it covers, and Kit says what's left out if the budget is too small. Capabilities are the tools' main features, with "check your plan includes them".
  - In Ask a ghost (new "Your plan" row: Kit, Mo, Hattie) and as a card on the Subscriptions tab.
  - Other ghosts hand double-up questions to Kit ("That's Kit's job", Ask Kit →). Kit hands cancelling to Cassy.
  - Server: Kit's one-job rule (never names a service they don't pay for, no yearly figures). He's added to the free-tier guide list in all five functions. Needs Publish.
- Every ghost has its own voice now: Penny the tidy accountant, Sir Spooksworth "polite but firm", Gus "LET'S GO!", Cassy calm and practical, Mo "I've seen this a hundred times", Hattie "small and boring beats big and forgotten". Each ghost's chat bubbles have a stripe in its colour.
- Files: src/lib/ghostFees/bundles.js (new), src/components/guide/KitPlanner.jsx (new), src/lib/ghostFees/guides.js, src/lib/ghostFees/guideOpeners.js, src/components/guide/GhostGuide.jsx, src/components/results/SubscriptionsSection.jsx, src/components/results/HauntedHouse.jsx, src/components/landing/GhostTeam.jsx, base44/functions/*/entry.ts (GUIDE_KEYS)
- How to test: Sample > Ask a ghost > Kit: 3 streaming services ($49.98 a month). Pick Netflix: Keep Netflix only gives $32.99 a month less. Rotate gives Dec, Jan, Feb, about $16.66 a month. AI tools: "ChatGPT $30, Claude $30, Midjourney $15, Canva $18", tick writing, docs, images and video, Up to $60: keep ChatGPT + Midjourney, $93.00 becomes $45.00. Penny: "I pay for too many streaming services" gives Ask Kit →.
- User feedback that drove this: "one that will compare all subscriptions similar and consolidate... 3 streaming services what do you like most then help you pick one or schedule rotations. with ai subscriptions... assess based on user criteria... consolidate to max 2-3 and give you a way to fit budgets", "try differentiate the others".

### Kit researches your shows, then a cost-benefit table and a plan to carry out
- What: Before keep or rotate, Kit asks what you like (tap genres: Romcom, Drama, Crime, Comedy, Reality, Sport, Kids, Docos, Sci-fi, Anime; type up to 5 shows). "Find where my shows are" runs a web search (new kitResearch function) for where each show streams in Australia, only among the services you already pay for, with a source link each.
  - Cost and benefit table: Service | A month | Your shows (linked to sources) | Best for (genres) | Per show ($ a month / your shows there) | Kit says (Keep / Rotate: month / Cancel).
  - Kit's plan, by rules from the research. Most of your shows (70%+) on one service: Keep it, with the monthly saving. Split: rotate in order of where your shows are ("1 December: Netflix for Bridgerton... 1 January: cancel Netflix, start Stan for Love Island"), plus the calendar file.
  - Make it happen: each service to cancel shows its checked cancel page and steps (never a guessed link), Ask Cassy if there's no checked link, and "Add to my Cancelling list" (Subscriptions tab). The manual "pick the one you watch most" path gets the same steps.
  - Rules: the AI only finds where shows stream. Every dollar figure and verdict is the app's maths. Kit never suggests a new service ("Not on any of yours"). Streammax (made up, sample) is never searched. "Catalogues change, checked <date>".
  - Limits: counts as the one free AI answer, unlimited after unlock, and shares Cassy's daily web-search ceiling.
- Fix: the Allowance entity only allowed penny, sir, gus and cass in guides_used, so Mo's and Hattie's free answers were never recorded. Now mind, habit and bundle are allowed too.
- Files: base44/functions/kitResearch/entry.ts (new), base44/entities/Allowance.jsonc, src/lib/ghostFees/bundles.js, src/components/guide/KitPlanner.jsx, src/components/results/SubscriptionsSection.jsx
- How to test (after Publish): Sample > Subscriptions > Kit > Romcom + "Bridgerton, Love Island Australia, Emily in Paris" > Find where my shows are. Tested locally with a faked search reply: the table, rotate plan (Dec Netflix, Jan Stan, about $15.50 a month vs $49.98) and Add to my Cancelling list (Stan moved to Cancelling).
- User feedback that drove this: "before you keep and rotate what about researching to assist you... I like romcom or these shows then the agent should research", "can it give a comparison costs benefit analysis table", "then help you implement and cancel the other ghosts through cancellation and rotation strategy".

### Kit uses Ghost It's packs: every category, the same double-up rules as the agent
- What: Kit now spots double-ups with Ghost It's own catalogue: 44 services in 6 packs (Screen, Sound, Tech Stack, Food, Gym and Fitness, Play) and 8 overlap groups (video, music, storage, AI, design, delivery, meal kits, gaming). The agent and the app agree on every service.
  - scripts/sync-ghostit-catalogue.py reads agent/agent.py as code (never runs it) and writes src/lib/ghostFees/ghostItCatalogue.json. Re-run it after the agent learns a new service.
  - Statement names are matched to services by Ghost It's aliases (NETFLIX.COM, UBER *EATS, PRIME VIDEO AU), longest first, as whole words (so STANLEY is not Stan).
  - One "type what else you pay" box for every pack (e.g. "YouTube Premium $17, Uber One $9.99, Game Pass $15, ChatGPT $30"). Typed services join the statement's, and weekly prices become monthly.
  - Ghost It's bundle tips show under each group (YouTube Premium includes YouTube Music, Microsoft 365 includes 1 TB of OneDrive, Prime Video comes with Prime, one meal kit at a time...).
  - In chat, a typed list opens Kit on the right pack (AI tools, gaming, music...).
- Files: scripts/sync-ghostit-catalogue.py (new), src/lib/ghostFees/ghostItCatalogue.json (new, generated), src/lib/ghostFees/bundles.js, src/components/guide/KitPlanner.jsx, src/components/guide/GhostGuide.jsx
- How to test: Sample > Subscriptions > Kit > type "YouTube Premium $17, Google One $4.49, Uber One $9.99, DashPass $9.99, Game Pass $15, PS Plus $12, ChatGPT $30, Claude $30": tabs for 3 streaming, 2 music, 2 storage, 2 delivery, 2 gaming and 3 AI tools. Music shows the YouTube Music tip.
- User feedback that drove this: "also assess broader types... and train it to identify overlaps based on the packages of the ... agent ghost.it".

### Kit shows Ghost It's six Ghost Packs
- What: Kit's tabs are now the six Ghost Pack cards from Ghost It (Screen, Sound, Gym & Fitness, Food, Tech Stack, Play). Each card says what Kit found ("3 doubled · $49.98 a month" or "Nothing doubled yet"), and the selected pack shows what it hunts in Ghost It's words. Packs with more than one group (Tech Stack: AI tools, cloud storage, design; Food: delivery, meal kits) get small sub-tabs. Gym & Fitness points to Ghost It for weekly costs.
- Files: src/lib/ghostFees/bundles.js (GHOST_PACKS), src/components/guide/KitPlanner.jsx
- How to test: Sample > Subscriptions > Kit, type "YouTube Premium $17, Google One $4.49, Uber One $9.99, DashPass $9.99, Game Pass $15, PS Plus $12, ChatGPT $30, Claude $30". The pack cards read Screen 3, Sound 2, Food 2, Tech Stack 5 and Play 2 doubled.
- User feedback that drove this: "do the packages like ghost it".

### Kit's description: researches and optimises your subscriptions
- What: Kit's picker subtitle "Sorts double-ups" is now "Optimises subs". His job line, hello, home page blurb and card title now say he researches and optimises your subscriptions: finds double-ups across every Ghost Pack, checks where your shows stream, compares cost against what you use, then keep one, rotate or cancel.
- Files: src/lib/ghostFees/guides.js, src/components/landing/GhostTeam.jsx, src/components/guide/KitPlanner.jsx
- How to test: Ask a ghost: the Kit chip reads "Optimises subs", and the header reads "Kit · Researches and optimises your subscriptions".
- User feedback that drove this: "better description like researches and optimises subscriptions".

### Kit understands names without prices ("Spotify and Youtube")
- What: Typing "Spotify and Youtube" did nothing, because Kit only read names with a $ price. Now any Ghost It service named in the text counts:
  - If it's on your statement, Kit uses your real price (Spotify $14.99 on the sample).
  - If not, Kit uses Ghost It's typical Australian price (lowest plan), marked * with "from Ghost It's price list checked 2 Nov 2026. Type yours for exact maths".
  - If there's no typical price (e.g. YouTube Premium), Kit still spots the double, shows "price?", and asks for the price before showing a saving.
  - A typed price replaces the statement's; a name typed without a price never does. In chat, typed names no longer count a service twice.
- Files: scripts/sync-ghostit-catalogue.py (exports TYPICAL prices), src/lib/ghostFees/ghostItCatalogue.json, src/lib/ghostFees/bundles.js, src/components/guide/KitPlanner.jsx, src/components/guide/GhostGuide.jsx
- How to test: Sample > Ask a ghost > Kit > "Spotify and Youtube". Sound pack: Spotify $14.99 (statement), YouTube Premium price?, the YouTube Music tip, and "Add a price for YouTube Premium...". "Netflix and Disney+" gives 4 streaming apps, with Disney+ $9.99*.
- User feedback that drove this: screenshot of "Spotify and Youtube" typed into Kit with "not working".

### Kit: a real consolidation plan, and cards instead of a cramped table in chat
- What: (1) "Can you help me consolidate subscriptions" only got "here are your double-ups". Kit now answers, and opens, with a consolidation plan pack by pack: each group of doubles with its prices, the saving from keeping one ("$30.99 to $35.98 a month less, most if you keep Stan"), "or rotate one a month", AI tools (tick what you use), and a total ("up to $35.98 a month less"). Rules only, monthly only. It also answers "optimise", "save money", "sort out my subscriptions" and "help me". (2) The cost-benefit table was too wide for the chat panel and cut columns off. In chat each service is now a small card (price, Keep / Rotate / Cancel badge, your shows, best for, per show). The full table stays on the Subscriptions tab.
- Files: src/lib/ghostFees/bundles.js (consolidationPlan, consolidationText), src/lib/ghostFees/guideOpeners.js, src/components/guide/GhostGuide.jsx, src/components/guide/KitPlanner.jsx
- How to test: Sample > Ask a ghost > Kit: the opener is the consolidation plan. Type "can you help me consolidate subscriptions" to get the same plan. Research (after Publish) shows cards in chat.
- User feedback that drove this: "format this more" and "can you help me consolidate subscriptions didn't really work out".

### Home team matches the app, badges cascade, feedback answers match, seven ghosts everywhere
- What: (1) Meet your ghost team: Hattie now wears the theme's outfit like in the app (witch in Haunted, pink bow or Hank on Ex, Santa at Christmas), with Hank's name on "I'm Fine". (2) Badges you can earn: one line cascading down the page on a thin track, each badge fading in after the last (was a 2-column grid). (3) Feedback form: both questions now read Yes / Not sure / No (were Yes / Kinda / No and Yes / Maybe / No). Only the button text changed, so the stored answers (Kinda / Maybe) and the progress counts still work. (4) "All 6 ghost guides" is now 7 (with Kit) on Pricing, Upgrade, Unlocked and sign-in.
- Files: src/components/landing/GhostTeam.jsx, src/components/results/BadgesExplainer.jsx, src/components/results/ChoiceGroup.jsx, src/components/results/FeedbackPanel.jsx, src/components/AuthLayout.jsx, src/components/landing/PlansAtAGlance.jsx, src/pages/Upgrade.jsx, src/pages/Unlocked.jsx
- How to test: Home (Haunted): Hattie is the witch. Sample > Subscriptions: badges in one cascading line. Feedback form: both questions show Yes / Not sure / No.
- User feedback that drove this: "make these ghosts match the avatars in the app", "arrange these better like a line cascading down", "yes no, kinda and maybe need to be consistent".

### Bigger chat, tap a ghost to chat, every ghost explains itself
- What:
  - The chat window is bigger (460 x up to 780px, was 380 x 640). A new expand button makes it nearly full screen (900px wide, full height). The ghost picker is now one compact row of names (Fees: Penny, Spooksworth, Gus, Cassy · Plan: Kit, Mo, Hattie), and each name's hover says its job, so the conversation gets the room. Kit's planner shows once, under his latest reply.
  - Home page "Meet your ghost team": every ghost is a button ("Chat with Kit →"). It opens the sample with the chat already talking to that ghost. Ghost It opens ASI:One.
  - Ask any ghost "What can you do?", "How does this work?" or "How do you optimise my subscriptions?" and it explains its job in steps (new `how` list per ghost). Kit adds the plan for your statement.
  - "Can you help me with X?" gets a straight answer: "Yes, I can help with that" plus steps if it's that ghost's job, or "Not me, but Kit can..." with an Ask Kit → chip.
  - "Collate / organise / list my subscriptions" (Kit): all subscriptions sorted into Ghost Packs with each pack's monthly total and the overall total, then the consolidation plan. The other ghosts hand that to Kit.
- Files: src/components/guide/GhostGuide.jsx, src/lib/ghostFees/guides.js (how steps), src/lib/ghostFees/bundles.js (organiseText), src/components/landing/GhostTeam.jsx, src/pages/Landing.jsx, src/lib/ghostFees/askGuide.js, src/components/results/ResultsView.jsx
- How to test: Home > tap Kit in Meet your ghost team: the sample opens with Kit's chat. "How do you optimise my subscriptions?" gives 4 steps plus the plan. Mo: "Can you help me with my AI subscriptions?" gives "Not me, but Kit can" and Ask Kit →. Kit: "can you help me collate and organise my subscriptions?" lists 7 subscriptions by pack ($144.45 a month) plus the plan. Expand button: 900px window.
- User feedback that drove this: "need the chat window expanded bigger and easier to see", "not answering... can you help me collate and organise my subscriptions?", "make the press agent button open new window chat with agents where you can discuss and answer questions like what you can do", "apply this logic other agents".

### Each ghost has its own chat window, tap-to-ask buttons, and answers you can see
- What:
  - Each ghost now has its own conversation. Picking Kit shows Kit's window (fresh the first time), and going back to Penny brings Penny's chat back. Before, everything was one thread, so Kit could show Penny's hello. A safety check makes sure an open window always has its ghost's opener.
  - Answers are visible. After you ask, the chat scrolls to the start of the ghost's reply. Before, it scrolled to the bottom, where Kit's planner hid his answer, so it looked like he didn't answer.
  - Quick question buttons for the current ghost always sit above the typing box. Tap one, or type an open question ("how can you help me optimise my subscriptions?").
  - The picker is back to name plus a 3-4 word job under each ghost (What a fee is, Writes emails, Your progress, How to cancel, Optimises subs, Why it happened, One habit), full width.
  - Small coloured ghosts everywhere: the chat header, the home page ghost team and the Haunted House porch now use the same small coloured ghosts as the picker (no detailed stickers). Mo's lantern and Hattie's stickers stay on the Money patterns walk-through and the habit card.
  - Fix: Spooksworth's "Write my first email" got Gus's goals answer (the word "first"). It now drafts the email.
- Files: src/components/guide/GhostGuide.jsx, src/components/landing/GhostTeam.jsx, src/components/results/HauntedHouse.jsx
- How to test: Sample > Ask a ghost. Each ghost shows its own opener and quick buttons. Kit > "can you help me research and optimise my subscriptions" shows "Yes! Here's how I optimise..." in view. Penny > Kit > Penny brings Penny's chat back. Spooksworth > Write my first email drafts the Streammax cancel email.
- User feedback that drove this: "they don't match, the small coloured ghosts... need each ghost opening in new window and having small 3-4 word description", "in Kit I get hi I am Penny... type question but it doesn't answer", "please get my agents to actually work", "each ghost should be able to click into message with the click button options... as well as answering questions open ended".

### Chat layout: ready-made questions at the top, conversation at the bottom; Cassy answers straight away
- What: The ghost's quick questions now sit at the top, under the picker, and wrap onto a second line. The conversation and typing box are at the bottom, like most chat apps. Under a reply, only that reply's own follow-ups show (Open the email, Make it firmer, Yes / Not sure / Not me, start days, handoffs), never the top buttons again. The "Your guide sees your results..." note moved into the small print at the bottom to give the chat more room. Wording now says "tap a question at the top". Cassy: "How do I cancel my biggest one?" and her opener pick your biggest subscription with a checked cancel page (Netflix on the sample) and answer instantly with the steps, the official page and the app-store note. Before, she looked up the made-up Fitlife Gym and couldn't confirm it.
- Files: src/components/guide/GhostGuide.jsx, src/lib/ghostFees/guideOpeners.js
- How to test: Sample > Ask a ghost. All 7 ghosts show the quick row above the chat, with no repeated buttons under replies. Cassy > How do I cancel my biggest one? gives Netflix's steps and official page straight away.
- User feedback that drove this: "users would expect pre-determined prompts at the top and chat at the bottom... check other agents while there".

### Clean-up pass
- What: Lint across the app is down from 12 warnings to 2 (both in the Base44 sign-in page, left alone): unused props and variables removed (ExAct2, ExHero, ProofDialog) and stale lint comments cleared. The upload-error screen used a long dash between the file name and the message. It's now a colon (no-em-dash rule), and the admin feedback page's blank marker is now a plain dash. The Haunted House guide menus no longer carry the old image stub. Every page loads with no app errors (home, progress, upgrade, media, privacy, ghostit, about). The only console errors are local-dev Base44 app-state 404s that don't happen on the live site.
- Not changed (needs your OK): six components and one data file that nothing uses any more: landing/StatementCard, landing/HowItWorks, scan/UploadPanel, results/ResultSection, results/SummaryCard, results/ResultRow and lib/ghostFees/jollysTable.json. The main JavaScript bundle is over Vite's 500 KB warning size. Splitting it by page would speed up first load, but it's a bigger change.
- Files: src/components/ex/ExAct2.jsx, src/components/landing/ExHero.jsx, src/components/results/ProofDialog.jsx, src/components/results/FileErrors.jsx, src/pages/FeedbackAdmin.jsx, src/components/results/HauntedHouse.jsx, plus lint-comment tidy-ups (HomeTabs, PatternsTab, CassLookup, DoneLink, Tour)
- How to test: npx eslint src gives 0 errors and 2 warnings. npm run build passes.
- User feedback that drove this: "assess and do overall cleanup of the app".

### Sir Spooksworth does the whole letter job, and a ghost team line shows who referred you
- What:
  - No more "pick a ghost". Spooksworth opens with every letter you need (5 on the sample: cancel Streammax, waive the account fee, Adobe refund, waive the late fee, cancel Spotify), biggest first. Each letter has: Read it (opens the email) · Send in Outlook · Gmail · Mail app (opens ready to send from your own email, nothing goes through Ghost Fees) · Remind me to check in 7 days (Google, Outlook or Apple / .ics, and it sets the task's due day) · Mark it worked.
  - Each step ticks the same task list as the goal path and calendar (Read, Sent, Worked), shown on the letter as ✓ / ○.
  - His "Write my first email" and similar answers carry the same buttons. His steps now read: I draft every letter, you tap Send in Outlook or Gmail, I remind you and tick it off.
  - Ghost team: when ghosts pass you along ("Ask Spooksworth →", Mo's Yes to Hattie), a "Team on this" line under the picker shows the chain, e.g. Penny → Spooksworth → Cassy. Each name goes back to that ghost's window, and Clear hides it.
  - The email builder moved to src/lib/ghostFees/emailDraft.js so the dialog and Spooksworth share one copy.
- Files: src/lib/ghostFees/emailDraft.js (new), src/components/guide/LetterActions.jsx (new), src/components/results/LeakEmailDialog.jsx, src/lib/ghostFees/guideOpeners.js, src/lib/ghostFees/guides.js, src/components/guide/GhostGuide.jsx
- How to test: Sample > Ask a ghost > Spooksworth: 5 letters. On Streammax tap Send in Outlook (Outlook opens the draft) and Mark it worked: it reads ✓ Read ✓ Sent ✓ Worked, and the goal path shows the same ticks. Penny > Ask Spooksworth → then Ask Cassy → gives "Team on this: Penny → Spooksworth → Cassy".
- User feedback that drove this: "why do I need to pick ghosts, draft email and check that should be Sir Spooksworth's job and he should link the email to my Outlook to send... link to calendar and check list to remind me and tick off the task", "ghost team formed when necessary, a ghost referral system".

### Gus becomes the bust coach; clearer jobs for every ghost
- What:
  - Gus opens with a bust plan: "🏆 Score: 0 of 5 busted", a progress bar ("$0.00 of $296.92 sorted") and "Next up: Streammax". Each ghost gets "How to bust it" (cancel / refund / waive / price rise), the button that does it (Cancel on {provider} when the link is checked, Open the email), the teammate who helps ("Cassy: cancel page →", "Spooksworth: cancel email →", "Penny: what this fee is →", "Kit: keep or rotate →", which hand over with that ghost and grow the team line), and Busted it (ticks the same task list as the goal path, and the score goes up). "What do I bust first?", "Show my score" and "Who helps with what?" all answer with the plan or the team.
  - Clearer jobs. Gus is the coach (order, score, referrals) and no longer does goals text or renewal reminders. Renewal reminders move to Kit ("Remind me before renewals"). Picker subtitle: Gus "Bust coach".
- Files: src/components/guide/BustPlan.jsx (new), src/lib/ghostFees/guideOpeners.js, src/lib/ghostFees/guides.js, src/components/guide/GhostGuide.jsx
- How to test: Sample > Ask a ghost > Gus. Busted it on Streammax gives 1 of 5 and $113.94 sorted. Monthly Account Fee > "Spooksworth: waiver email →" opens Spooksworth with "Team on this: Gus → Spooksworth".
- User feedback that drove this: "Gus doesn't help much except navigate goal path, he should explain how to bust and refer other ghosts", "there's a bit overlap in agents, can we help them differentiate more".

### Mo explains with a little animated card instead of a block of text
- What: Mo's explanation is now a card that builds up one step at a time: the pattern name with an evidence badge (Strong / Good evidence), its one-line quote, "In your statement: $113.94 across 6 charges", then 🎯 What happens → 🧠 Why your brain does it → 💡 How to beat it → 📚 The research (the full paper reference and a Read the paper link to its DOI). It ends with "It's a common pattern, not a flaw. Most people do this." Then "Sound like you?" sits on its own line above Yes / Not sure / Not me. Every fact comes from the app's checked pattern data (citations verified with Crossref), nothing new or invented. With reduced motion, the steps simply appear. His answers about a pattern ("Why do my trials turn into charges?", "Which pattern costs me most?", a named pattern) use the same card.
- Files: src/components/guide/MoExplainer.jsx (new), src/lib/ghostFees/guideOpeners.js, src/components/guide/GhostGuide.jsx
- How to test: Sample > Ask a ghost > Mo. The Present Bias card animates in 4 steps, and Read the paper opens doi.org/10.1257/aer.89.1.103.
- User feedback that drove this: "spread out the text on Mo, could he integrate some animated little explanations... integrate some facts to make people care about the psychology".
### Typos no longer derail the ghosts; "optimise my subscriptions" goes to Kit from any ghost
- What: Penny answered "how cna you help me optuik mise my subscription can you stuyd all of them" with Gus's goals list. Fast-typing slips (cna, teh, yuo, stuyd, optuik mise, subscriptioms, reaserhc) are now tidied before the ghosts match a question, and "subtotal" stays "subtotal". Any ghost other than Kit now hands "optimise / study / go through / compare / organise my subscriptions" to Kit ("That's Kit's job...", Ask Kit →) before the goals answer can catch it.
- Files: src/components/guide/GhostGuide.jsx
- How to test: Penny > type the exact message above. You get "That's Kit's job..." with Ask Kit →.
- User feedback that drove this: screenshot of Penny's goals answer to "how can you help me optimise my subscription can you study all of them".

### Hattie builds on Mo, and every ghost reads reasonable typos
- What:
  - Hattie: her opener and her answers to "improve my spending", "strategies", "track" and "patterns" show a coaching card that picks up where Mo left off. (1) Building on Mo: every pattern ranked by what it costs you, with bars, starting with the one you told Mo "sounds like me" (or the costliest), plus Ask Mo why →. (2) Three practical strategies for that pattern. (3) Your one habit. (4) Track it: start date, weeks kept as a 4-week bar, check-in due, and Set my start day / Open my habit plan, with the verified notes (Dai, Milkman & Riis, 2014; Lally et al., 2010). Before, she could answer with Gus's goals list.
  - Typos: like most chat models, a word one letter off (two for long words), including swapped letters, is read as the word the ghosts know ("cancle", "emial", "patern", "stratgies", "optmise", "subscritpions", "renwals"). Common words are protected ("store" stays "store"). Cassy's cancel check uses it too.
- Files: src/components/guide/HabitCoach.jsx (new), src/lib/ghostFees/guideOpeners.js, src/components/guide/GhostGuide.jsx
- How to test: Mo > Yes, sounds like me > Hattie's card starts on Present Bias. Hattie: "how can you help me improve my spending". Cassy: "how do i cancle netflix" gives Netflix's cancel page. Spooksworth: "write my emial". Penny: "can you optmise my subscritpions" gives Ask Kit →.
- User feedback that drove this: "Hattie not responding properly... she should build on Mo... explain what bias is costing the most money and then help come up with strategies and ways to habit track", "the agents should be able to read typos that are reasonable like one letter messed up".

### Buttons that do each step: Cassy, Kit, Penny, the calendar tasks; Spooksworth's letters outlined
- What:
  - One shared cancel row (CancelActions) does the whole cancel. Cancel on {provider} opens the checked official page (never guessed), or Find the cancel page uses Cassy's lookup. Cancel email. I cancelled it opens proof of cancellation, then puts it on your Ghost List and ticks the task. Check it stopped in 7 days goes to Google, Outlook or Apple, and It stopped. Status shows ✓ Cancelled ✓ Proof ✓ Checked it stopped.
  - Cassy: her opener and "How do I cancel my biggest one?" use the row (Spotify on the sample) instead of a plain-text link.
  - Kit: every service to cancel (keep one, or the research plan) gets the same row, plus Add to my Cancelling list. His rotation calendar file now puts the cancel page of the one you're leaving into each switch day.
  - Penny the fee detective: for each fee (account-keeping, late, overdrawn, ATM, foreign, interest, surcharge), why you pay it, how to stop it, and whether you can get it back, with "Get the waiver letter: Spooksworth →" and "Check next statement" (30-day calendar reminder). General guidance only, no product names, no new numbers. Her opener, "Why do I pay these fees?", "Can I get my fees back?" and "How do I stop these fees?" all show it. Subtitle: "Fee detective".
  - Spooksworth: his opener lists every letter, and each letter shows To (who it goes to), Subject and Asks for (e.g. "Refund $105.00 in fees within 14 days, or a fee-free account") before you open it.
  - Calendar tab: each cancel, refund or waive task has "Do it now" with the same buttons. A task counts as done once all three steps are ticked from any ghost.
- Files: src/components/guide/CancelActions.jsx (new), src/components/guide/FeeCheck.jsx (new), src/components/guide/LetterActions.jsx, src/components/guide/KitPlanner.jsx, src/components/guide/GhostGuide.jsx, src/components/results/GoalTasks.jsx, src/components/results/ResultsView.jsx, src/components/results/SubscriptionsSection.jsx, src/lib/ghostFees/bundles.js, src/lib/ghostFees/guideOpeners.js, src/lib/ghostFees/guides.js
- How to test: Cassy opener > I cancelled it opens the proof dialog and gives ✓ Cancelled. Penny shows 2 fee cards > waiver letter opens Spooksworth with To / Subject / Asks for. Kit > Netflix > Stan row has Cancel on Stan. Calendar > Do it now on a task.
- User feedback that drove this: "continue with the rest" (step buttons for Cassy, proof loop, Penny, Kit rotation, calendar), "Penny just explaining charges the user can see", "what emails, outline Spooksworth better".

### Spooksworth's letters: a clean numbered list with the draft and Send right there
- What: The letters are now a numbered list (1-5). Each one is a single line: number (✓ once sent), name, amount, Sent / Done, and an arrow. Tap a line to open it, one at a time, starting with the first unsent letter. Inside: Send in Outlook and Send in Gmail first (they open your own email with the letter filled in, so you just press Send), then Mail app and Edit it, the To / Subject / Asks for outline, "Read the draft" (the full email right there, which counts as Read), and the 7-day reply reminder and Mark it worked.
- Note on "send it directly": sending from your own Outlook or Gmail without opening it would mean connecting your email account to Ghost Fees (Microsoft / Google sign-in with send permission, plus their app reviews). The Send buttons open the ready email in your own account, so it's one tap and Ghost Fees never touches your inbox.
- Files: src/components/guide/LetterActions.jsx
- How to test: Sample > Ask a ghost > Spooksworth shows 5 numbered lines with #1 open. Read the draft shows the email. Send in Gmail opens Gmail with it filled in.
- User feedback that drove this: "where's his draft email and connect to email where you link Outlook or Gmail to send it directly", "can we make it cleaner like list 1-5".

### Tight AI limits during the hackathon, and two old AI functions switched off
- What: Base44 AI credits now have tight daily limits. Ghost AI answers drop from 1,000 to 200 a day, Cassy and Kit web searches from 100 to 30, and PDF scans from 100 to 40. Visitors who aren't signed in drop from 400 to 150 ghost answers and from 60 to 25 searches a day. Each visitor gets up to 5 AI answers per visit (was 20). Paid ceilings are unchanged. Built-in answers, openers and every button stay free and unlimited (no AI call). The old draftCancelEmail and summariseLeaks functions weren't used by the app any more but had no limits, so anyone calling them directly could spend credits. They now return "moved into the app" without calling the AI (files kept).
- Files: base44/functions/{askGhostGuide,findCancelInfo,parseStatement,kitResearch,allowance,createCheckout}/entry.ts (limits), base44/functions/{draftCancelEmail,summariseLeaks}/entry.ts (retired), src/components/guide/GhostGuide.jsx (MAX_AI_MESSAGES 5)
- How to test: After Publish, the 6th AI answer in one visit says "That's all my spirit energy for now", and quick buttons keep working.
- User feedback that drove this: "the agents burn my base44 credits, is there an option we can limit their calls" (picked Tight).
### Team up: ghosts work as a visible team on one ghost; fewer preset buttons
- What:
  - "👻 Team up on Streammax" (your biggest ghost), or pick another ghost from "or another ghost", sits at the top of the chat. It forms the right team for that kind of ghost:
    - Trial / cancel: Mo (why it happened) → Cassy (cancel it) → Spooksworth (the letter) → Hattie (a habit so it stays gone) → Gus (your score).
    - Refund: Mo → Spooksworth → Hattie → Gus.
    - Bank fee: Penny → Spooksworth → Hattie → Gus.
    - Price rise: Penny → Kit → Cassy → Gus.
  - The team line shows "Team on Streammax" and the whole route: ✓ on ghosts you've done, the current one highlighted, any name tappable, and a "Next: Cassy, cancel it →" button in the next ghost's colour, ending with "🎉 Team done. Gus has your score." End stops it. Every ghost on the team opens on that ghost: Mo explains its pattern, Cassy its cancel, Spooksworth puts its letter first, Penny its fee first, and Hattie plans for its pattern.
  - Fewer buttons: three quick questions per ghost (was five), and "Is my data stored?" is no longer added to every ghost (the privacy line is in the footer).
- Files: src/components/guide/GhostGuide.jsx, src/lib/ghostFees/guideOpeners.js, src/lib/ghostFees/guides.js
- How to test: Sample > Ask a ghost > 👻 Team up on Streammax. Next four times goes Mo → Cassy → Spooksworth → Hattie → Gus with ✓ ticks, ending in "Team done".
- User feedback that drove this: "I do not see how the agents interact in a team, where's the create agent team. Maybe we can clean up some of the buttons and preset options".

### Connect your own AI: free answers stay limited, your own Claude or OpenAI key is unlimited
- What: A 🔑 button in the chat header (and a "Connect your own AI" button when free answers run out) opens a small panel. Pick Claude (Anthropic) or ChatGPT (OpenAI), paste your API key, and choose the model (Claude defaults to claude-opus-5-5; for OpenAI you type the model your account uses). Optionally tick "Remember on this device".
  - The key stays in this browser only: session storage by default, or this device if ticked. Ghost answers then go straight from the browser to Anthropic (official @anthropic-ai/sdk, browser mode) or OpenAI. Ghost Fees and Base44 never see or store the key, and no Base44 credits are used. The chat skips the free limits while a key is set.
  - Same rules as the Base44 guide: each ghost's one job, facts from the results summary only (never the statement), no financial advice, handoffs to the right ghost. "Remove my key" clears it.
  - Notes in the panel: a ChatGPT Plus or Claude Pro subscription doesn't include an API key, and Get a key links to each provider's key page.
- Files: src/lib/ghostFees/ownAI.js (new), src/components/guide/OwnAIPanel.jsx (new), src/components/guide/GhostGuide.jsx, package.json (@anthropic-ai/sdk)
- How to test: Ask a ghost > 🔑 > Claude > paste a key > Use my AI. Typed questions are answered by your Claude. Tested locally with a fake key and a faked Anthropic reply: the request went to api.anthropic.com with the browser-access header, the summary was in the system prompt, the reply rendered with its Ask Spooksworth → handoff, and the key was kept in session storage only.
- User feedback that drove this: "is there an option we can limit their calls then have an add your own agent connector... where they can attach their Claude or ChatGPT", "isn't it good competition show, limits and it has some free then connect your own".

### Cassy is the cancellation specialist
- What: Cassy's label is now "Cancellation specialist" in the chat header (was "Helps you cancel") and "Cancel specialist" in the picker (was "How to cancel"). Her hello is "I'm Cassy, your cancellation specialist. Calm and practical. My one job: showing you exactly how to cancel, and making sure it sticks." The home page team reads "Your cancellation specialist: the real cancel page, steps and phone number, then proof you cancelled and a check it stopped."
- Files: src/lib/ghostFees/guides.js, src/components/landing/GhostTeam.jsx
- How to test: Ask a ghost > Cassy shows "Cassy · Cancellation specialist".
- User feedback that drove this: "Cassy label her cancellation specialist".

### Kit's Gym & Fitness pack works (it was greyed out)
- What: The Gym & Fitness pack card was greyed out with "Ask Ghost It about weekly costs" and did nothing, because gyms aren't "two of the same" doubles like streaming. It now opens a gym screen. Each gym or fitness membership on the statement (or typed, e.g. "gym $25 a week", converted to a month) shows with "Been this month?". "Yes, I go" keeps it. "Not much" suggests asking about a pause or freeze first, then gives the full cancel buttons (cancel page or Cassy's lookup, email, I cancelled it, check it stopped). The card reads "1 membership · $45.00 a month" on the sample. The pack line says "what a weekly membership really costs a month" (monthly only, not a year).
- Files: src/lib/ghostFees/bundles.js (gymItems, pack text), src/components/guide/KitPlanner.jsx
- How to test: Ask a ghost > Kit > Gym & Fitness shows Fitlife Gym $45.00 a month. Not much gives the pause tip and the cancel buttons.
- User feedback that drove this: "why is gym unselectable, that should be explained".
### Ghost reminders show on the app's calendar, and go into your synced calendar automatically
- What: Every ghost reminder button now does two things. (1) It sets that task's "Do it on" day on the Calendar tab's task list. Penny's "Check next statement" didn't before; Spooksworth's and Cassy's already did. (2) If you turned on "Sync to my calendar" on the Calendar tab, the reminder goes straight into your real Google, Outlook or Apple calendar through your private feed, with no extra Save. Without sync, the Google / Outlook / Apple buttons still add it to that calendar as before.
- Files: src/lib/ghostFees/calendarSync.js (addGhostReminder), src/components/guide/FeeCheck.jsx, src/components/guide/CancelActions.jsx, src/components/guide/LetterActions.jsx
- How to test: Penny > Check next statement on the Monthly Account Fee. The Calendar tab task "Ask the bank to waive the Monthly Account Fee" shows "Do it on" 30 days from today. With Sync on, the event also appears in the synced calendar after its next refresh.
- User feedback that drove this: screenshot of the "Check Monthly Account Fee is gone" Google event: "will this show up in the platform calendar".

### Security: no public fallback for the free-scan signing key
- What: The security scan flagged (Critical + Medium) that free-scan tickets and counters were signed with a fallback written in the code ("ghost-fees-unset") whenever QUOTA_SECRET wasn't set. Anyone reading the code could have forged tickets for unlimited free scans. Now, without QUOTA_SECRET, each function uses a random key made when it starts, so tickets can't be forged. Setting QUOTA_SECRET in Base44 Secrets keeps counts stable across restarts (recommended). The other "exposed secrets" warnings (APP_URL, PARSER_ENDPOINT, SLACK_WEBHOOK_URL) are optional settings that aren't set and are only read on the server, never returned or logged. The Stripe key is only used in server functions.
- Files: base44/functions/{allowance,askGhostGuide,kitResearch,createCheckout,findCancelInfo,parseStatement}/entry.ts
- User feedback that drove this: Base44 security scan (Critical "HMAC helper falls back to the public...", Medium "Scan-quota tickets are signed with a...").
### Penny's answers pull everything together; Team up tile; Mo shows your real charges
- What: Penny's fee answers start with one table (Fee, type, times charged, total, and Get it back / Why / How to stop it, depending on the question), an "All fees" total with how much is worth asking for, then "What to do next" (1. ask for it back, Spooksworth writes the letters, 2. stop it coming back, 3. check next statement) with "Write the letters: Spooksworth →" and "👻 Team up on fees". The per-fee detail is folded under "Each fee in detail". Each quick question now gets its own answer. Team up is a tile in the picker's PLAN row ("👻 Team up · All ghosts on one"), and "Another ghost" sits inside the team line. Mo's card adds "Your charges, as they happened": an animated timeline of the person's own charges behind the pattern (12 Mar Streammax free start, then each $18.99), with the total counting up ("That's Present Bias in action: $113.94 so far"). It respects reduced motion.
- Files: src/components/guide/FeeCheck.jsx, src/components/guide/MoExplainer.jsx, src/components/guide/GhostGuide.jsx, src/lib/ghostFees/guides.js, src/index.css
- User feedback that drove this: "the buttons do not work... there should be team up button here after the last agent", "if I click why I pay it I expect some summary table... collate all the info and tell you what to do next", "can this be more animated then link the bias to the actual person's expenses".

## Fri 6 Nov 2026: free AI answers left, shown in every ghost chat
- What: a small line above the chat box in Ask a ghost says how many free AI answers are left ("1 free AI answer left · quick questions are unlimited"), and says plainly when none are left. Before, people only found the limit after hitting it.
- Why: Sanjay asked to fill the gap where the limit was a surprise.
- Note: the Connect your own AI panel was removed on main by the Base44 builder (5d6cf76), so this line has no key button. Ask before adding it back.
- Files: src/components/guide/GhostGuide.jsx

## Fri 6 Nov 2026: Penny's fee table opens the detail
- What: tapping "All fees" in Penny's table opens (or hides) "Each fee in detail", with a "Tap for each fee in detail" hint. Tapping any fee row opens the detail and scrolls to that fee.
- Why: Sanjay tapped "All fees" and nothing happened; it looked like a button.
- Files: src/components/guide/FeeCheck.jsx

## Fri 6 Nov 2026: Team up takes you through the whole job; own AI is back
- What: the Team up tile ("Take me through it") opens a short note: the 7 steps in order (Penny finds your fees, Cassy cancels, Spooksworth's letters, Kit's double-ups, Gus's score, Mo's why, Hattie's habit), a warning that it's the longest route and uses the most free AI answers, and three choices: Take me through everything, I'll pick a ghost, Use my own AI. The walkthrough shows "Step 2 of 7", a progress bar, Back and Next; each step opens that ghost doing its job with its buttons (built-in, no AI).
- Own AI: brought back (undo of 5d6cf76 by the Base44 builder) because Sanjay asked for it under every ghost. The "free AI answers left" line under every ghost now has a "Use my own Claude / ChatGPT" button.
- Checked in the local app on the sample statement: note, step 1 to step 2, key panel.
- Files: src/components/guide/GhostGuide.jsx, OwnAIPanel.jsx, src/lib/ghostFees/ownAI.js

## Fri 6 Nov 2026: Team up note, neater
- What: the Team up note is now a row of 7 numbered ghost tiles (number, name, one word: fees, cancel, letters, doubles, score, why, habit), a one-line warning, and Start plus "Own AI, no limit". Quick questions hide while the note is open. The step bar and the answers-left line use fewer words.
- Why: Sanjay: "list this 1-7 neater, cleaner, less texty and overwhelming."
- Files: src/components/guide/GhostGuide.jsx
- Also: the key icon in the chat header is now a labelled "🔑 Own AI" button (shows "My AI ✓" when connected), so people can find it.

## Fri 6 Nov 2026: "Got your own AI?" popup, 3 steps
- What: one "Got your own AI? Connect Claude or ChatGPT" button sits right under the ghost picker (the header and bottom-line buttons are gone). It opens a popup that guides you in 3 steps: Pick yours (Claude or ChatGPT), Get a key (opens their API keys page: sign in, Create key, copy), Paste it (and Connect). Much less text; the model box only shows for ChatGPT.
- Why: Sanjay: "less wordy, put own AI button below ghosts, make a popup that guides you through and you can connect."
- Checked in the local app: all 3 steps.
- Files: src/components/guide/OwnAIPanel.jsx, src/components/guide/GhostGuide.jsx
