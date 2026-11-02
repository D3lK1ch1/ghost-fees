import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAllowance } from '@/lib/AllowanceContext';
import { useTheme } from '@/lib/ThemeContext';
import { lastRealTotal } from '@/lib/ghostFees/payback';
import { money } from '@/lib/ghostFees/format';
import './upgrade.css';

// /unlocked: where Stripe sends people after paying. The server confirms the
// payment with Stripe; only then the confetti. Founders see their real number.
const ART = { haunted: '/themes/haunted/lantern-ghost.webp', ex: '/themes/ex/tilly.webp', christmas: '/themes/christmas/xc-festive.webp' };
const COLOURS = ['#ff6f7d', '#5ee6c8', '#ffd36e', '#b79cff', '#fbf8fa'];

export default function Unlocked() {
  const { theme } = useTheme();
  const { refresh, status } = useAllowance();
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
    <div className="flex min-h-screen flex-col items-center justify-center px-5 text-center">
      {state === 'paid' && Array.from({ length: 28 }, (_, i) => (
        <span key={i} aria-hidden="true" className="up-confetti" style={{ left: `${(i * 37) % 100}%`, width: i % 2 ? 8 : 10, height: i % 3 ? 12 : 8, borderRadius: i % 4 ? 2 : '50%', background: COLOURS[i % COLOURS.length], animationDuration: `${2.4 + (i % 5) * 0.4}s`, animationDelay: `${(i % 7) * 0.15}s` }} />
      ))}
      <img src={ART[theme.key] || ART.haunted} alt="" className={`h-36 w-auto object-contain ${state === 'paid' ? 'up-jump' : ''}`} />
      {state === 'paid' ? (
        <>
          {status?.foundingNumber && <p className="mt-4 rounded-full bg-primary px-4 py-1.5 text-[13px] font-black uppercase tracking-wide text-primary-foreground">Founding member #{status.foundingNumber}</p>}
          <h1 className="mt-3 font-heading text-[40px] font-bold leading-tight">You&apos;re in.</h1>
          <p className="mt-2 text-[15px] text-muted-foreground">
            {paidCents ? `Paid ${money(paidCents / 100)}` : 'Paid'}{found > 0 ? ` · Found so far ${money(found)}` : ''}
          </p>
          <p className="mt-1 text-[14px] text-muted-foreground">Unlimited scans, all four ghosts, Cassy for every subscription. Forever.</p>
        </>
      ) : state === 'checking' ? (
        <h1 className="mt-4 font-heading text-[26px] font-bold">Checking your payment with Stripe...</h1>
      ) : (
        <>
          <h1 className="mt-4 font-heading text-[26px] font-bold">Payment still processing</h1>
          <p className="mt-2 max-w-sm text-[14px] text-muted-foreground">Refresh this page in a minute. If it doesn&apos;t unlock, email us and we&apos;ll sort it.</p>
        </>
      )}
      <Link to="/" className="mt-6 rounded-2xl bg-primary px-6 py-3 text-[16px] font-bold text-primary-foreground">Back to my ghosts</Link>
    </div>
  );
}
