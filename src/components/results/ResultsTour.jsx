import Tour from '@/components/tour/Tour';

// The 3-step results tour. Opt-in: start it from the "Tour" button in the header
// or the ⋯ menu ("Take the tour").
export const RESULTS_TOUR = 'results';
const STEPS = [
  { target: 'total', title: 'This is your total', body: 'Real charges from your own statement, nothing guessed. Below it you can share it or download a PDF.' },
  { target: 'tabs', title: 'Each tab is one job', body: 'Ghosts lists every leak. The others help you act: cancel, set reminders, send emails, track what stopped.' },
  { target: 'ask', title: 'Stuck? Ask a ghost', body: 'Our ghost guides answer questions about your results. Or press Ask Ghost It to try our chat agent on ASI:One.' },
];

export default function ResultsTour({ ready }) {
  return <Tour name={RESULTS_TOUR} steps={STEPS} ready={ready} />;
}
