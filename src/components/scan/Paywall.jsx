import { Link } from 'react-router-dom';
import { Lock, Mail, X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { statsFor } from '@/data/stats';
import { useScan } from '@/lib/ScanContext';
import { useAllowance } from '@/lib/AllowanceContext';
import { money } from '@/lib/ghostFees/format';
import { useTheme } from '@/lib/ThemeContext';
import { lastRealTotal } from '@/lib/ghostFees/payback';
import { useUpgradePalette } from '@/lib/ghostFees/upgradeTheme';
import { GHOST_IT_SNIP } from '@/lib/ghostFees/ghostItAgent';

// The limit-reached sheet (B7) and the sign-in screen (B8), styled to the Claude
// Design canvas "Ghost Fees upgrade flow" (screens 1A, 1B, 2 and the 💔 / 🎄 variants).

// The theme's own ghost floats at the top of the sheet.
const SHEET_ART = {
  haunted: '/themes/haunted/card-ghost.webp',
  ex: '/themes/ex/tilly.webp',
  christmas: '/themes/christmas/xc-festive.webp',
};

const LIMIT_TITLES = {
  scan: "You've used your 3 free scans",
  guide: "You've used your free ghost try",
  cass: 'Cassy looked up your first one for free',
  report: 'The PDF report comes with the unlock',
};

// The four ghost guides' colours, as dots on the "ghost try used" sheet.
const GUIDE_DOTS = ['#FFB86B', '#8FB8FF', '#FF9BC2'];

// The person's own total: this scan if it's real, otherwise their last real scan
// (kept as one number in this browser). Never the sample.
function foundTotal(results, usedSample) {
  if (results && !usedSample && Number(results.total) > 0) return Number(results.total);
  return lastRealTotal();
}

export default function Paywall({ open, reason = 'scan', onClose }) {
  const { theme } = useTheme();
  const P = useUpgradePalette();
  const { results, usedSample } = useScan();
  const { signedIn, foundingLeft } = useAllowance();
  const returnTo = encodeURIComponent(reason === 'sign_in' && window.location.pathname !== '/upgrade' ? window.location.pathname + window.location.hash : '/upgrade');
  const art = SHEET_ART[theme.key] || SHEET_ART.haunted;

  // Screen 2: sign in before unlocking (or before a counted scan once charging is on).
  if (reason === 'sign_in') {
    return (
      <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
        <DialogContent className="max-w-md rounded-3xl border-0 p-6 text-center" style={{ background: P.bg, color: '#FFFFFF' }}>
          <div className="relative mx-auto h-28 w-28">
            <img src={art} alt="" className="motion-safe:animate-float h-28 w-auto object-contain" />
            <span aria-hidden="true" className="absolute -bottom-1 right-0 flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: P.accent, color: P.ink }}><Lock className="h-4 w-4" /></span>
          </div>
          <DialogTitle className="font-heading text-[28px] font-bold leading-tight">Save your ghosts and unlock</DialogTitle>
          <p className="text-[16px] leading-snug" style={{ color: P.soft }}>Sign in so your Ghost List and payment stay with you on any device.</p>
          <Link to={`/login?returnTo=${returnTo}`} onClick={onClose} className="flex min-h-[54px] items-center justify-center gap-2.5 rounded-2xl bg-white text-[16px] font-semibold" style={{ color: P.bg }}>Continue with Google</Link>
          <Link to={`/login?returnTo=${returnTo}`} onClick={onClose} className="flex min-h-[54px] items-center justify-center gap-2.5 rounded-2xl text-[16px] font-semibold" style={{ background: P.sheet, border: `1px solid ${P.handle}` }}><Mail className="h-5 w-5" /> Continue with email</Link>
          <p className="rounded-2xl px-4 py-3 text-left text-[14.5px] leading-snug" style={{ background: P.sheet, color: P.muted }}>
            We store your email and your scan count. Never your statement. <Link to="/privacy" onClick={onClose} className="underline" style={{ color: P.accent }}>Privacy</Link>
          </p>
        </DialogContent>
      </Dialog>
    );
  }

  // Screens 1A / 1B: the limit sheet. Slides up on phones, centred on bigger screens.
  // Leads with the person's own total; their results stay visible behind it.
  const total = foundTotal(results, usedSample);
  const times = Math.floor(total / 10);
  const ghostCount = results?.leaks?.length || 0;
  const unlockTo = signedIn ? '/upgrade' : `/login?returnTo=${encodeURIComponent('/upgrade')}`;
  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="limit-sheet max-h-[92vh] max-w-md overflow-y-auto rounded-[28px] border-0 p-6 pt-3.5 text-center max-sm:bottom-0 max-sm:top-auto max-sm:translate-y-0 max-sm:rounded-b-none [&>button]:hidden" style={{ background: P.sheet, color: '#FFFFFF', boxShadow: '0 -12px 40px rgba(0,0,0,0.4)' }}>
        <div aria-hidden="true" className="mx-auto h-[5px] w-10 rounded-full" style={{ background: P.handle }} />
        <div className="-mt-1 flex justify-end">
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-11 w-11 items-center justify-center rounded-full" style={{ background: P.chip }}><X className="h-[18px] w-[18px]" /></button>
        </div>

        {reason === 'guide' ? (
          <div className="flex justify-center gap-2.5" aria-hidden="true">
            {[...GUIDE_DOTS, P.accent].map((colour, i) => (
              <span key={colour} className="h-[52px] w-[52px] rounded-full" style={{ background: colour, boxShadow: i === 3 ? '0 0 0 3px #FFFFFF' : 'none' }} />
            ))}
          </div>
        ) : (
          <img src={art} alt="" className="motion-safe:animate-float mx-auto h-24 w-auto object-contain" />
        )}
        <p className="text-[14px] font-semibold" style={{ color: P.muted }}>{LIMIT_TITLES[reason] || LIMIT_TITLES.scan}</p>

        {reason === 'guide' ? (
          <>
            <DialogTitle className="font-heading text-[28px] font-bold leading-tight">
              Cassy can help with all {ghostCount > 0 ? <span style={{ color: P.accent }}>{ghostCount} ghosts</span> : 'the ghosts'} you found
            </DialogTitle>
            <p className="text-[16px] leading-snug" style={{ color: P.soft }}>
              Unlock all 4 guides, Penny, Spooksworth, Gus and Cassy, for $10 once.{total > 0 ? ` Your scans found ${money(total)}.` : ''}
            </p>
          </>
        ) : total > 0 ? (
          <>
            <DialogTitle className="font-heading text-[30px] font-bold leading-tight">
              Your scans found <span className="limit-pop inline-block" style={{ color: P.accent }}>{money(total)}</span> in ghosts
            </DialogTitle>
            <p className="text-[16px] leading-snug" style={{ color: P.soft }}>
              Ghost Fees is $10 once.{times >= 1 ? ` That's already paid back ${times}x.` : ''}
            </p>
          </>
        ) : (
          <>
            <DialogTitle className="font-heading text-[26px] font-bold leading-tight">Unlock everything for $10 once</DialogTitle>
            <ul className="space-y-1.5 text-left">
              {statsFor('paywall').map((fact) => (
                <li key={fact.key} className="rounded-2xl px-3 py-2 text-[14.5px]" style={{ background: P.card, color: P.soft }}>
                  <b style={{ color: P.accent }}>{fact.stat}</b> {fact.text} <span className="block text-[12.5px]" style={{ color: P.faint }}>({fact.source})</span>
                </li>
              ))}
            </ul>
          </>
        )}

        {/* What the free trial includes, so "one try" is clear (app and Ghost It). */}
        <div className="rounded-2xl px-4 py-3 text-left text-[14px] leading-snug" style={{ background: P.card, color: P.soft }}>
          <p className="text-[12.5px] font-bold uppercase tracking-[0.12em]" style={{ color: P.muted }}>Your free trial</p>
          <div className="mt-2 flex items-center gap-3">
            <img src={art} alt="" className="h-10 w-10 shrink-0 object-contain" />
            <p><b style={{ color: '#FFFFFF' }}>Ghost Fees:</b> 3 statement scans, 1 ghost guide chat, 1 Cassy lookup.</p>
          </div>
          <div className="mt-2 flex items-center gap-3 border-t pt-2" style={{ borderColor: P.line }}>
            <img src={GHOST_IT_SNIP} alt="" className="h-11 w-11 shrink-0 object-contain" />
            <p><b style={{ color: '#FFFFFF' }}>Ghost It:</b> 1 free try (your first Ghost Pack), then $5 once for every pack, in ASI:One.</p>
          </div>
        </div>
        {/* The promise, in one line, right before the button. */}
        <p className="text-[15px] leading-snug" style={{ color: P.soft }}>
          <b style={{ color: '#FFFFFF' }}>Ghost them once. Pay once.</b> Pro finds every subscription and fee, helps you cancel each one and checks they stopped. Never a subscription.
        </p>
        <Link to={unlockTo} onClick={onClose} className="motion-safe:animate-pulse-soft flex min-h-[54px] items-center justify-center rounded-2xl text-[17px] font-semibold" style={{ background: P.accent, color: P.ink }}>
          Unlock everything, $10
        </Link>
        <div>
          <button type="button" onClick={onClose} className="min-h-[44px] w-full text-[15px]" style={{ color: P.soft }}>Maybe later</button>
        </div>
        <p className="text-[14px]" style={{ color: P.muted }}>
          Your results stay visible. <Link to="/upgrade#compare" onClick={onClose} className="underline" style={{ color: P.accent }}>See how we compare</Link>
        </p>
        {foundingLeft > 0 && <p className="text-[12.5px]" style={{ color: P.faint }}>Founding members: $5 for the first 50 ({foundingLeft} left).</p>}
      </DialogContent>
    </Dialog>
  );
}
