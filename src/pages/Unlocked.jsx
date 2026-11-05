import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useAllowance } from '@/lib/AllowanceContext';
import { useTheme } from '@/lib/ThemeContext';
import { lastRealTotal } from '@/lib/ghostFees/payback';
import { money } from '@/lib/ghostFees/format';
import './upgrade.css';
import { useUpgradePalette } from '@/lib/ghostFees/upgradeTheme';

// /unlocked: where Stripe sends people after paying. The server confirms the
// payment with Stripe; only then the confetti. Owner (admin) accounts are never charged,
// so they see that plainly instead of "Paid" (4 Nov: "it did not charge me").
const PERKS = ['Unlimited scans, within a fair daily limit', 'All 5 ghost guides', 'Cassy for every subscription', 'The PDF report'];
const ART = { haunted: '/themes/haunted/card-ghost.webp', ex: '/themes/ex/tilly.webp', christmas: '/themes/christmas/xc-festive.webp' };

export default function Unlocked() {
  const { theme } = useTheme();
  const P = useUpgradePalette();
  const { refresh, status, isOwner } = useAllowance();
  const [state, setState] = useState('checking');

  useEffect(() => {
    let cancelled = false;
    const check = async (tries = 0) => {
      const next = await refresh().catch(() => null);
      if (cancelled) return;
      if (next?.paid && next?.charging !== false) setState('paid');
      else if (tries < 3) setTimeout(() => check(tries + 1), 2500);
      else setState('pending');
    };
    check();
    window.history.replaceState(null, '', '/unlocked');
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const found = lastRealTotal();
  const paidCents = status?.paidCents;

  return (
    <div className="flex min-h-screen flex-col items-center px-6 pb-8 pt-14 text-center" style={{ background: P.bg, color: '#FFFFFF' }}>
      {state === 'paid' && Array.from({ length: 28 }, (_, i) => (
        <span key={i} aria-hidden="true" className="up-confetti" style={{ left: `${(i * 37) % 100}%`, width: i % 2 ? 8 : 10, height: i % 3 ? 12 : 8, borderRadius: i % 4 ? 2 : '50%', background: [P.accent, '#FFB86B', '#FF9BC2', '#8FB8FF'][i % 4], animationDuration: `${2.4 + (i % 5) * 0.4}s`, animationDelay: `${(i % 7) * 0.15}s` }} />
      ))}
      <img src={ART[theme.key] || ART.haunted} alt="" className={`h-40 w-auto object-contain ${state === 'paid' ? 'up-jump' : ''}`} />
      {state === 'paid' ? (
        <div className="mt-5 flex w-full max-w-sm flex-col items-center gap-5">
          {status?.foundingNumber && <p className="up-fade rounded-full px-3.5 py-1.5 text-[14px] font-semibold" style={{ background: P.accent, color: P.ink }}>Founding member #{status.foundingNumber}</p>}
          <h1 className="font-heading text-[34px] font-bold leading-tight">{isOwner && !status?.paidCents ? 'Owner account' : "You're in."}</h1>
          <p className="text-[17px] leading-snug" style={{ color: P.soft }}>
            {isOwner && !status?.paidCents
              ? 'You own Ghost Fees, so Pro is always on and you are never charged. To test the real $10 checkout, sign out or use another account.'
              : 'Pro is unlocked, once and forever. Time to clear the house.'}
          </p>
          <ul className="up-fade w-full space-y-2 rounded-[18px] p-4 text-left" style={{ background: P.sheet, animationDelay: '0.4s' }}>
            {PERKS.map((perk) => (
              <li key={perk} className="flex items-center gap-2.5 text-[15px]">
                <Check className="h-4 w-4 shrink-0" style={{ color: P.accent }} aria-hidden="true" /> {perk}
              </li>
            ))}
          </ul>
          <div className="up-fade grid w-full grid-cols-2 gap-3 rounded-[18px] p-4 text-left" style={{ background: P.sheet, animationDelay: '0.6s' }}>
            <div className="flex flex-col gap-1"><span className="text-[14px]" style={{ color: P.muted }}>{isOwner && !paidCents ? 'Plan' : 'You paid'}</span><span className="font-heading text-[24px] font-bold">{paidCents ? `${money(paidCents / 100)} once` : isOwner ? 'Owner, free' : '$10 once'}</span></div>
            <div className="flex flex-col gap-1"><span className="text-[14px]" style={{ color: P.muted }}>Found so far</span><span className="font-heading text-[24px] font-bold" style={{ color: P.accent }}>{found > 0 ? money(found) : 'Scan to see'}</span></div>
          </div>
        </div>
      ) : state === 'checking' ? (
        <h1 className="mt-6 font-heading text-[26px] font-bold">Checking your payment with Stripe...</h1>
      ) : (
        <>
          <h1 className="mt-6 font-heading text-[26px] font-bold">Payment still processing</h1>
          <p className="mt-2 max-w-sm text-[14px]" style={{ color: P.muted }}>Refresh this page in a minute. If it doesn&apos;t unlock, email us and we&apos;ll sort it.</p>
        </>
      )}
      <div className="flex-1" />
      <Link to="/" className="mt-8 flex min-h-[54px] w-full max-w-sm items-center justify-center rounded-2xl text-[17px] font-semibold" style={{ background: P.accent, color: P.ink }}>{found > 0 ? 'Back to my ghosts' : 'Scan a statement'}</Link>
    </div>
  );
}
