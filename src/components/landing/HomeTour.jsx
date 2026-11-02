import { Compass } from 'lucide-react';
import Tour, { replayTour } from '@/components/tour/Tour';

// The home page tour: what it is, how to try it, your plan, and where the details live.
export const HOME_TOUR = 'home';
const STEPS = [
  { target: 'uvp', title: 'What Ghost Fees does', body: 'It finds the subscriptions and bank fees you forgot you’re paying, then helps you cancel them. No bank login.' },
  { target: 'try', title: 'Try it in 10 seconds', body: 'Run the sample statement first, no sign-in. When you’re ready, upload your own CSV or PDF.' },
  { target: 'account', title: 'Free or Pro', body: 'Free gives you 3 scans and your full total. Pro is $10 once (never a subscription) and unlocks every ghost guide and cancel tool.' },
  { target: 'hometabs', title: 'The details, when you want them', body: 'Who it’s for, Free vs Pro, typical prices and who made it, one tab at a time so nothing piles up.' },
];

export function TourButton({ name = HOME_TOUR, label = 'Take the 30-second tour', className = '' }) {
  return (
    <button type="button" onClick={() => replayTour(name)} className={`inline-flex items-center gap-1.5 rounded-full border border-primary/60 bg-primary/10 px-3.5 py-1.5 text-[13px] font-bold text-foreground hover:bg-primary/20 ${className}`}>
      <Compass className="h-4 w-4 text-primary" aria-hidden="true" /> {label}
    </button>
  );
}

export default function HomeTour() {
  return <Tour name={HOME_TOUR} steps={STEPS} />;
}
