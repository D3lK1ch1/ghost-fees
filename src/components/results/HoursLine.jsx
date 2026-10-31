import { useState } from 'react';
import { hoursOfWork, hourlyFromMonthly, HOURS_PER_WEEK } from '@/lib/ghostFees/hours';

// One honest line: the leak total in hours of the user's own work.
// Uses pay found in the statement, or a figure the user types in. Never stored.
export default function HoursLine({ total, monthlyIncome }) {
  const derived = monthlyIncome ? hourlyFromMonthly(monthlyIncome) : 0;
  const [pay, setPay] = useState('');
  const [editing, setEditing] = useState(!derived);

  const hourly = Number(pay) > 0 ? Number(pay) : derived;
  const hours = hourly > 0 ? hoursOfWork(total, hourly) : 0;

  if (!editing) {
    return (
      <p className="mt-3 text-[13.5px] leading-relaxed text-muted-foreground">
        That&apos;s <span className="font-bold text-foreground">{hours} hours</span> of your work.{' '}
        <button
          type="button"
          onClick={() => { setPay(String(hourly)); setEditing(true); }}
          className="font-bold text-primary underline underline-offset-4"
        >
          Edit
        </button>
      </p>
    );
  }

  return (
    <div className="mt-3">
      <label htmlFor="hourly-pay" className="text-[12.5px] leading-relaxed text-muted-foreground">
        {derived
          ? 'Your hourly pay'
          : 'Enter your hourly pay to see how many hours these ghosts cost you.'}
      </label>
      <div className="mt-1.5 flex items-center gap-2">
        <span className="text-[13px] font-bold text-muted-foreground">$</span>
        <input
          id="hourly-pay"
          type="number"
          min="0"
          step="0.5"
          inputMode="decimal"
          value={pay}
          onChange={(event) => setPay(event.target.value)}
          className="w-24 rounded-lg border border-border bg-background/60 px-2.5 py-1.5 text-[13px] text-foreground outline-none focus:border-primary"
        />
        <span className="text-[12.5px] text-muted-foreground">an hour</span>
      </div>
      {hours > 0 && (
        <p className="mt-2 text-[13.5px] leading-relaxed text-foreground">
          That&apos;s <span className="font-bold">{hours} hours</span> of your work.
        </p>
      )}
      <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground/80">
        {derived
          ? `Based on your salary deposits and a ${HOURS_PER_WEEK}-hour week.`
          : 'Never stored, only used on this screen.'}
      </p>
    </div>
  );
}