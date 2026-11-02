import Tour from '@/components/tour/Tour';

// The results tour: a click-through walk round the results. It opens each tab for
// you so you see the real thing. Opt-in: start it from "Take the tour" under your
// total, the "Tour" button in the header or the ⋯ menu. Testers: "the tour needs
// to be inside, not on the home page".
export const RESULTS_TOUR = 'results';

const stepsFor = (setTab) => [
  { target: 'total', title: 'This is your total', body: 'Real charges from your own statement, nothing guessed. How many months it covers is right under it.' },
  { target: 'actions', title: 'Share it or keep it', body: 'Download the PDF report, share your result, or ask Ghost It (our chat agent in ASI:One) about these subscriptions.' },
  { target: 'tabs', title: 'Every section, one tap away', body: 'Each tab is one job. We’ll open the three that save you the most money.', block: 'start' },
  { target: 'panel', title: 'Ghosts: every leak', body: 'Each card is one money leak, biggest first, with the transactions behind it and what to do about it.', onEnter: () => setTab('ghosts'), block: 'start' },
  { target: 'panel', title: 'Subscriptions: keep or cancel', body: 'Answer Yes or No for each one. Cancelled ones go on your Ghost List, which checks your next statement to be sure they stopped.', onEnter: () => setTab('subscriptions'), block: 'start' },
  { target: 'panel', title: 'Calendar: reminders and Cassy', body: 'Reminders before each charge, a checklist of every subscription, and Cassy, who finds the cancel page and phone number for you.', onEnter: () => setTab('calendar'), block: 'start' },
  { target: 'ask', title: 'Stuck? Ask a ghost', body: 'Our ghost guides answer questions about your own results, any time.' },
];

export default function ResultsTour({ ready, setTab }) {
  return <Tour name={RESULTS_TOUR} steps={stepsFor(setTab)} ready={ready} />;
}
