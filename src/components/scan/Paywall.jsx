import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { HEADLINE_STATS } from '@/data/stats';
import { useScan } from '@/lib/ScanContext';
import { useAllowance } from '@/lib/AllowanceContext';
import { paybackLine } from '@/lib/ghostFees/payback';
import { startCheckout } from '@/lib/ghostFees/allowance';

const INCLUDED = [
  'Unlimited scans, forever',
  'Unlimited chat with all four ghosts',
  'Cassy finds the cancel page and phone number for every subscription',
  'Your Ghost Fees PDF report',
  'Ghost List: check next month that it actually stopped',
];

// Set to false to hide the refund promise.
const SHOW_GUARANTEE = true;

const TITLES = {
  sign_in: 'Sign in for your free scan',
  scan: 'Your free scan is used. Keep hunting ghosts.',
  guide: "That's the free message from this ghost.",
  cass: 'Cassy looked up your first one for free.',
  report: 'The PDF report comes with the unlock.',
};

// Shown at every free limit. Leads with the person's own number when there is one.
export default function Paywall({ open, reason = 'scan', onClose }) {
  const { results } = useScan();
  const { signedIn, priceCents, foundingLeft } = useAllowance();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const founding = priceCents <= 500;
  const payback = paybackLine(results, priceCents);
  const returnTo = encodeURIComponent(window.location.pathname + window.location.hash);

  const pay = async () => {
    setBusy(true);
    setError('');
    try {
      const outcome = await startCheckout();
      if (outcome?.alreadyPaid) window.location.reload();
      else if (!outcome?.redirected) setError(outcome?.error || 'Payments open soon.');
    } catch (err) {
      setError(err?.response?.data?.error || 'Payments open soon.');
    } finally {
      setBusy(false);
    }
  };

  if (reason === 'sign_in') {
    return (
      <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
        <DialogContent className="max-w-md rounded-3xl border-border bg-card p-5 sm:p-6">
          <DialogTitle className="font-heading text-[21px] leading-tight">{TITLES.sign_in}</DialogTitle>
          <p className="text-[14px] text-muted-foreground">
            Your first scan is free: one upload of up to 6 statements, so a bank account and a credit card can be read together. Signing in keeps that free scan yours. We keep a count, never your statement.
          </p>
          <Link to={`/login?returnTo=${returnTo}`} className="mt-2 block rounded-2xl bg-primary py-3 text-center text-[15px] font-bold text-primary-foreground">
            Sign in, then upload
          </Link>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-md overflow-y-auto rounded-3xl border-border bg-card p-5 sm:p-6">
        <DialogTitle className="font-heading text-[21px] leading-tight">{TITLES[reason] || TITLES.scan}</DialogTitle>

        {payback ? (
          <p className="mt-1 rounded-2xl border border-primary/40 bg-primary/10 px-3.5 py-3 text-center text-[14.5px] font-semibold leading-snug text-foreground">
            {payback.found}<br />
            <span className="text-primary">{payback.price}</span>
            {payback.times && <><br />{payback.times}</>}
          </p>
        ) : (
          <>
            <ul className="mt-1 space-y-2">
              {HEADLINE_STATS.map((fact) => (
                <li key={fact.key} className="flex gap-2.5 rounded-2xl bg-secondary/60 px-3 py-2">
                  <span className="text-[18px]" aria-hidden="true">{fact.emoji}</span>
                  <span className="text-[13px] leading-snug text-muted-foreground">
                    <span className="font-bold text-foreground">{fact.stat}</span> {fact.text}
                    <span className="block text-[10.5px] opacity-75">{fact.source}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 rounded-2xl border border-primary/40 bg-primary/10 px-3.5 py-2.5 text-center text-[14px] font-semibold leading-snug text-foreground">
              Ghost Fees is <span className="text-primary">{founding ? '$5' : '$10'}, once</span>. Never a subscription.
            </p>
          </>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <div className={`relative rounded-2xl px-3 py-3 text-center ${founding ? 'border-2 border-primary bg-primary/[0.08]' : 'border border-border opacity-60'}`}>
            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
              {founding && foundingLeft != null ? `${foundingLeft} OF 50 LEFT` : 'FIRST 50 ONLY'}
            </span>
            <div className="font-heading text-[28px] font-bold leading-none text-foreground">$5</div>
            <div className="mt-1 text-[11.5px] font-bold text-foreground">Founding member</div>
            <div className="text-[11px] text-muted-foreground">once, forever</div>
          </div>
          <div className={`rounded-2xl px-3 py-3 text-center ${founding ? 'border border-border' : 'border-2 border-primary bg-primary/[0.08]'}`}>
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

        <p className="mt-3 text-center text-[12px] font-bold text-muted-foreground">Never a subscription. No bank login. Card handled by Stripe.</p>
        {SHOW_GUARANTEE && <p className="mt-1 text-center text-[12px] text-muted-foreground">Find less than $10? We refund you.</p>}

        {signedIn ? (
          <button type="button" onClick={pay} disabled={busy} className="mt-3 block w-full rounded-2xl bg-primary py-3 text-center text-[15px] font-bold text-primary-foreground disabled:opacity-60">
            {busy ? 'Opening Stripe...' : `Unlock for ${founding ? '$5' : '$10'}`}
          </button>
        ) : (
          <Link to={`/login?returnTo=${returnTo}`} className="mt-3 block rounded-2xl bg-primary py-3 text-center text-[15px] font-bold text-primary-foreground">
            Sign in to unlock for {founding ? '$5' : '$10'}
          </Link>
        )}
        {error && <p className="mt-2 text-center text-[12.5px] text-[#ffc27a]">{error}</p>}
      </DialogContent>
    </Dialog>
  );
}
