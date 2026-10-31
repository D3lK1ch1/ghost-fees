import { useState } from 'react';
import { Info } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

const NOT_DETECTED = [
  { title: 'Everyday spending', why: 'Rent, groceries, transport, transfers and pay are normal spending, not leaks, so they are left out on purpose.' },
  { title: 'Interest and buy-now-pay-later fees', why: 'Interest charges and Afterpay, Zip or Humm fees are not counted as ghosts.' },
  { title: 'Shop surcharges', why: 'Small card surcharges added by a shop or cafe are left out.' },
  { title: 'Subscriptions in short statements', why: 'A charge only counts as a subscription after it shows up in 3 or more months. Duplicates and price rises are only checked on subscriptions, so upload 3+ months to catch them.' },
  { title: 'Charges that change every month', why: 'Bills with a different amount each time (power, phone usage) are not treated as subscriptions.' },
  { title: 'What is inside Apple and Google charges', why: 'App store subscriptions arrive as one combined charge, so we cannot split them. Check Settings on your phone.' },
  { title: 'Scanned or photo PDFs', why: 'A PDF that is a picture of a statement may not be readable. A CSV export works best.' },
];

// Small "what doesn't it detect?" link with a pop-up explaining what is left out and why.
export default function DetectionInfo({ className }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className || 'inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3.5 py-1.5 text-[12.5px] font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground'}>
        <Info className="h-4 w-4" />
        What doesn&apos;t it detect?
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-[1.5rem] border-border bg-popover p-0">
          <div className="max-h-[80vh] overflow-y-auto p-5 sm:p-6">
            <DialogTitle className="pr-8 font-heading text-lg font-semibold text-foreground">What Ghost Fees doesn&apos;t detect</DialogTitle>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
              It finds bank fees, free trials that turned paid, duplicate charges and price rises. Here is what it leaves out, and why.
            </p>
            <ul className="mt-4 space-y-3">
              {NOT_DETECTED.map((item) => (
                <li key={item.title} className="rounded-xl border border-white/[0.07] bg-background/50 px-3.5 py-2.5">
                  <p className="text-[13.5px] font-bold text-foreground">{item.title}</p>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted-foreground">{item.why}</p>
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => setOpen(false)} className="mt-5 w-full rounded-xl bg-primary py-2.5 text-[14px] font-bold text-primary-foreground">
              Got it
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
