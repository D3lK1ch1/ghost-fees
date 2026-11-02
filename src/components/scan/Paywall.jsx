
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { statsFor } from '@/data/stats';
import { useScan } from '@/lib/ScanContext';
import { useAllowance } from '@/lib/AllowanceContext';
import { money } from '@/lib/ghostFees/format';
import { useTheme } from '@/lib/ThemeContext';
import { lastRealTotal } from '@/lib/ghostFees/payback';

// The theme's own ghost floats at the top of the sheet.
const SHEET_ART = {
  haunted: '/themes/haunted/lantern-ghost.webp',
  ex: '/themes/ex/tilly.webp',
  christmas: '/themes/christmas/xc-festive.webp',
};

const LIMIT_TITLES = {
  scan: "You've used your 3 free scans",
  guide: "You've used your free ghost try",
  cass: 'Cassy looked up your first one for free',
  report: 'The PDF report comes with the unlock',
};

// The person's own total: this scan if it's real, otherwise their last real scan
// (kept as one number in this browser). Never the sample.
function foundTotal(results, usedSample) {
  if (results && !usedSample && Number(results.total) > 0) return Number(results.total);
  return lastRealTotal();
}

const TITLES = {
  sign_in: 'Sign in for your 3 free scans',
  scan: "You've used your 3 free scans. Keep hunting ghosts.",
  guide: "That's your free ghost try.",
  cass: 'Cassy looked up your first one for free.',
  report: 'The PDF report comes with the unlock.',
};

// Shown at every free limit. Leads with the person's own number when there is one.
export default function Paywall({ open, reason = 'scan', onClose }) {
  const { theme } = useTheme();
  const { results, usedSample } = useScan();
  const { signedIn, foundingLeft } = useAllowance();
  const returnTo = encodeURIComponent(reason === 'sign_in' && window.location.pathname !== '/upgrade' ? window.location.pathname + window.location.hash : '/upgrade');


  // B8: sign in before unlocking (or before a counted scan once charging is on).
  if (reason === 'sign_in') {
    return (
      <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
        <DialogContent className="max-w-md rounded-3xl border-border bg-card p-5 text-center sm:p-6">
          <div className="relative mx-auto h-20 w-20">
            <img src={SHEET_ART[theme.key] || SHEET_ART.haunted} alt="" className="h-20 w-auto object-contain" />
            <span aria-hidden="true" className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[16px]">🔒</span>
          </div>
          <DialogTitle className="font-heading text-[22px] leading-tight">Save your ghosts and unlock</DialogTitle>
          <p className="text-[14px] text-muted-foreground">Sign in so your Ghost List and payment stay with you on any device.</p>
          <Link to={`/login?returnTo=${returnTo}`} onClick={onClose} className="block rounded-2xl bg-primary py-3 text-[15px] font-bold text-primary-foreground">Continue with Google</Link>
          <Link to={`/login?returnTo=${returnTo}`} onClick={onClose} className="block rounded-2xl border border-border py-3 text-[15px] font-bold">Continue with email</Link>
          <p className="rounded-2xl border border-border bg-background/50 px-3 py-2 text-[12.5px] text-muted-foreground">
            We store your email and your scan count. Never your statement. <Link to="/privacy" onClick={onClose} className="underline">Privacy</Link>
          </p>
        </DialogContent>
      </Dialog>
    );
  }

  // B7: the limit-reached sheet. Slides up on phones, centred on bigger screens.
  // Leads with the person's own total (never hidden on the results page).
  const total = foundTotal(results, usedSample);
  const times = Math.floor(total / 10);
  const art = SHEET_ART[theme.key] || SHEET_ART.haunted;
  const unlockTo = signedIn ? '/upgrade' : `/login?returnTo=${encodeURIComponent('/upgrade')}`;
  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="limit-sheet max-h-[92vh] max-w-md overflow-y-auto rounded-3xl border-border bg-card p-5 pt-3 sm:p-6 max-sm:bottom-0 max-sm:top-auto max-sm:translate-y-0 max-sm:rounded-b-none">
        <div aria-hidden="true" className="mx-auto mb-1 h-1.5 w-12 rounded-full bg-white/20 sm:hidden" />
        <img src={art} alt="" className="motion-safe:animate-float mx-auto h-20 w-auto object-contain" />
        <DialogTitle className="text-center font-heading text-[21px] leading-tight">{LIMIT_TITLES[reason] || LIMIT_TITLES.scan}</DialogTitle>

        {total > 0 ? (
          <div className="rounded-2xl border border-primary/40 bg-primary/10 px-4 py-3 text-center">
            <p className="text-[14px] font-semibold text-foreground">Your scans found</p>
            <p className="limit-pop font-heading text-[40px] font-bold leading-none text-primary">{money(total)}</p>
            <p className="text-[14px] font-semibold text-foreground">in ghosts</p>
            <p className="mt-2 text-[14px] text-foreground">
              Ghost Fees is <b>$10 once</b>.{times >= 1 ? <> That&apos;s already paid back <b>{times}x</b>.</> : null}
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {statsFor('paywall').map((fact) => (
              <li key={fact.key} className="flex gap-2.5 rounded-2xl bg-secondary/60 px-3 py-2">
                <span className="text-[18px]" aria-hidden="true">{fact.emoji}</span>
                <span className="text-[13px] leading-snug text-muted-foreground">
                  <span className="font-bold text-foreground">{fact.stat}</span> {fact.text}
                  <span className="block text-[10.5px] opacity-75">{fact.source}</span>
                </span>
              </li>
            ))}
          </ul>
        )}

        <Link to={unlockTo} onClick={onClose} className="motion-safe:animate-pulse-soft mt-1 block rounded-2xl bg-primary py-3.5 text-center text-[16px] font-bold text-primary-foreground">
          Unlock everything, $10
        </Link>
        <button type="button" onClick={onClose} className="text-center text-[14px] font-bold text-muted-foreground underline underline-offset-4">Maybe later</button>
        <Link to="/upgrade#compare" onClick={onClose} className="text-center text-[12.5px] font-semibold text-muted-foreground hover:text-foreground">See how we compare</Link>
        {foundingLeft > 0 && <p className="text-center text-[11.5px] text-muted-foreground">Founding members: $5 for the first 50 ({foundingLeft} left).</p>}
      </DialogContent>
    </Dialog>
  );
}
