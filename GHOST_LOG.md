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
