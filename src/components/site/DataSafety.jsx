import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// "How we keep your data safe" popup, on sign-in and in the app (3 Nov). Every line must
// match the Privacy page (src/pages/Privacy.jsx): update both together.
const SAFE = [
  ['🚫', 'No bank login. Ever.'],
  ['💻', 'CSV statements are read in your browser. They never leave it.'],
  ['📄', 'PDF statements go to private storage so they can be read. We are working on deleting them right after.'],
  ['🙈', 'Your results and Ghost List stay in your browser. We never sell your data.'],
  ['🗑️', 'Clear my data wipes it any time.'],
];

export function openTypicalPrices() {
  // Home page tab "Have any of these?" (no upload). Works from any page. 4 Nov: on the
  // home page itself, changing the hash didn't switch the tab, so open it directly.
  if (window.location.pathname === '/') {
    window.dispatchEvent(new CustomEvent('ghostFees:hometab', { detail: 'have' }));
    return;
  }
  window.location.href = '/#have';
}

export default function DataSafety({ className = '', label = 'How we keep your data safe' }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={cn('inline-flex items-center gap-1.5 text-[14px] font-bold text-primary underline-offset-4 hover:underline', className)}>
        <ShieldCheck className="h-4 w-4" aria-hidden="true" /> {label}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[20px]"><ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" /> Your data, kept safe</DialogTitle>
            <DialogDescription className="text-[14px]">What we keep and what never leaves you.</DialogDescription>
          </DialogHeader>
          <ul className="space-y-2">
            {SAFE.map(([icon, line]) => (
              <li key={line} className="flex gap-2.5 text-[14.5px] leading-snug text-foreground">
                <span aria-hidden="true" className="w-5 shrink-0 text-center">{icon}</span>{line}
              </li>
            ))}
          </ul>

          <div className="mt-1 rounded-2xl border border-primary/40 bg-primary/10 px-4 py-3">
            <p className="text-[15px] font-bold text-foreground">Rather not upload anything?</p>
            <ul className="mt-1.5 space-y-1 text-[14px] leading-snug text-muted-foreground">
              <li>✓ Tap the subscriptions you have, like Netflix, Spotify or the gym</li>
              <li>✓ See their typical price ranges and the yearly total</li>
              <li>⚠️ Less accurate: typical prices, not your real charges</li>
            </ul>
            <button type="button" onClick={openTypicalPrices} className="mt-3 w-full rounded-xl bg-primary py-2.5 text-[14.5px] font-bold text-primary-foreground">
              Check typical prices, no upload
            </button>
          </div>

          <Link to="/privacy" onClick={() => setOpen(false)} className="text-center text-[13.5px] font-bold text-muted-foreground underline underline-offset-4 hover:text-foreground">
            Everything we keep, in full
          </Link>
        </DialogContent>
      </Dialog>
    </>
  );
}
