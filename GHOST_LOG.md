# Ghost Log: what we built and why

One entry per change. Newest at the bottom.

## Sun 1 Nov 2026

### Cancel links and steps on every subscription
- What: Each subscription card shows "Cancel on <merchant>" (official page, new tab) and the exact steps. Unknown merchants get safe search steps, never a guessed link. One note for app-store sign-ups (cancel in Apple or Google Play).
- Files: src/lib/ghostFees/cancelLinks.js (new), src/components/results/SubscriptionsSection.jsx
- How to test: Sample statement > Subscriptions tab: Netflix, Spotify, Stan, Adobe and iCloud show a cancel link and steps; Fitlife Gym shows the search steps.
- User feedback that drove this: (fill in)
