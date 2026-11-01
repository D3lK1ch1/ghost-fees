import { useAllowance } from '@/lib/AllowanceContext';
import { paybackLine } from '@/lib/ghostFees/payback';

// "This scan found $X in N months. Ghost Fees is $10 once. That's paid back 29 times."
// Only for real scans by people who haven't unlocked yet.
export default function PaybackNote({ results, usedSample }) {
  const { paid, priceCents, openPaywall } = useAllowance();
  const line = paybackLine(results, priceCents, usedSample);
  if (paid || !line) return null;
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/40 bg-primary/10 px-4 py-3">
      <p className="text-[14px] font-semibold leading-snug text-foreground">
        {line.found} <span className="text-primary">{line.price}</span>{line.times ? ` ${line.times}` : ''}
      </p>
      <button type="button" onClick={() => openPaywall('scan')} className="rounded-full bg-primary px-3.5 py-1.5 text-[13px] font-bold text-primary-foreground">
        Unlock everything
      </button>
    </div>
  );
}
