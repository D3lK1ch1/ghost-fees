import { useState } from 'react';
import { checkInDue, useHabitPlan } from '@/lib/ghostFees/habitPlan';
import HabitCheckIn from './HabitCheckIn';

// Pack 10 part C on the home page: the calendar link /?habit=check (or any visit a week
// after the start day) shows the check-in, no scan needed. Nothing shows without a plan.
export default function HabitHomeCheckIn() {
  const [plan] = useHabitPlan();
  const [param] = useState(() => { try { return new URLSearchParams(window.location.search).get('habit') === 'check'; } catch { return false; } });
  const [dismissed, setDismissed] = useState(false);
  if (!plan || dismissed || !(param || checkInDue(plan))) return null;
  return (
    <div className="mx-auto mt-4 w-full max-w-2xl px-4">
      <HabitCheckIn onPickAnother={() => setDismissed(true)} />
    </div>
  );
}
