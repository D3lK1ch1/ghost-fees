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
