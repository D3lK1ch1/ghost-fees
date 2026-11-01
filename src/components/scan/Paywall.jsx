import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

// Facts shown on the paywall. Keep sources next to every number.
const FACTS = [
  { emoji: '💸', stat: 'Up to $1,739 a year', text: 'wasted on subscriptions people don\'t use', source: 'Compare the Market, 2026' },
  { emoji: '🏋️', stat: '$1,116 a year', text: 'the average unused gym membership', source: 'Compare the Market, 2026' },
  { emoji: '⏳', stat: '9 months', text: 'how long people take to cancel', source: 'ING' },
];

const INCLUDED = [
  'Unlimited scans, forever',
  'Direct cancel links and steps for every subscription',
  'Ready-to-send cancel, refund and fee-waiver emails',
  'Ghost List: check next month that it actually stopped',
];

// Set to false to hide the refund promise.
const SHOW_GUARANTEE = true;

// Shown when the free scan is used up.
export default function Paywall({ open, onClose, signedIn, onSample }) {
  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-md overflow-y-auto rounded-3xl border-border bg-card p-5 sm:p-6">
        <DialogTitle className="font-heading text-[21px] leading-tight">Your free scan is used. Keep hunting ghosts.</DialogTitle>

        {/* Why it's worth it */}
        <ul className="mt-1 space-y-2">
          {FACTS.map((fact) => (
            <li key={fact.stat} className="flex gap-2.5 rounded-2xl bg-secondary/60 px-3 py-2">
              <span className="text-[18px]" aria-hidden="true">{fact.emoji}</span>
              <span className="text-[13px] leading-snug text-muted-foreground">
                <span className="font-bold text-foreground">{fact.stat}</span> {fact.text}
                <span className="block text-[10.5px] opacity-75">{fact.source}</span>
              </span>
            </li>
          ))}
        </ul>

        {/* The comparison that sells it */}
        <p className="mt-3 rounded-2xl border border-primary/40 bg-primary/10 px-3.5 py-2.5 text-center text-[14px] font-semibold leading-snug text-foreground">
          One forgotten Netflix is <span className="text-primary">$204 a year</span>.<br />
          Ghost Fees is <span className="text-primary">$10, once</span>.
        </p>

        {/* Price cards */}
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <div className="relative rounded-2xl border-2 border-primary bg-primary/[0.08] px-3 py-3 text-center">
            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">FIRST 50 ONLY</span>
            <div className="font-heading text-[28px] font-bold leading-none text-foreground">$5</div>
            <div className="mt-1 text-[11.5px] font-bold text-foreground">Founding member</div>
            <div className="text-[11px] text-muted-foreground">once, forever</div>
          </div>
          <div className="rounded-2xl border border-border px-3 py-3 text-center">
            <div className="font-heading text-[28px] font-bold leading-none text-foreground">$10</div>
            <div className="mt-1 text-[11.5px] font-bold text-foreground">After that</div>
            <div className="text-[11px] text-muted-foreground">once, forever</div>
          </div>
        </div>

        <ul className="mt-3 space-y-1.5">
          {INCLUDED.map((item) => (
            <li key={item} className="flex items-start gap-2 text-[13px] text-foreground">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#5ee6c8]" />
              {item}
            </li>
          ))}
        </ul>

        <p className="mt-3 text-center text-[12px] font-bold text-muted-foreground">
          Never a subscription. No bank login.
        </p>

        {SHOW_GUARANTEE && (
          <p className="mt-1 text-center text-[12px] text-muted-foreground">
            Find less than $10 a year? We refund you.
          </p>
        )}

        {signedIn ? (
          <p className="mt-3 rounded-2xl bg-primary/10 px-3 py-2.5 text-center text-[13.5px] font-semibold text-foreground">
            Payments open this week. We'll email you as soon as you can unlock.
          </p>
        ) : (
          <Link to="/login" className="mt-3 block rounded-2xl bg-primary py-3 text-center text-[15px] font-bold text-primary-foreground">
            Sign in to unlock for $5
          </Link>
        )}

        <button type="button" onClick={onSample} className="mt-1 text-[12.5px] font-bold text-primary underline-offset-4 hover:underline">
          Try the sample statement instead (always free)
        </button>
      </DialogContent>
    </Dialog>
  );
}
