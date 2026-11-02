import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, ChevronDown, X } from 'lucide-react';
import { UPGRADE_STATS } from '@/data/stats';
import { useAllowance } from '@/lib/AllowanceContext';
import { useScan } from '@/lib/ScanContext';
import { startCheckout } from '@/lib/ghostFees/allowance';
import { lastRealTotal } from '@/lib/ghostFees/payback';
import { money } from '@/lib/ghostFees/format';
import { cn } from '@/lib/utils';
import './upgrade.css';

// /upgrade (B8): a standard app pricing page, mobile first, theme-aware. Pay once,
// never a subscription. Founding ($5) only shows while real spots are left.
const FEATURES = [
  { full: 'Unlimited uploads', free: '3 uploads' },
  { full: 'All 4 ghost guides', free: '1 ghost try' },
  { full: 'Cassy for every subscription', free: 'Cassy for 1 subscription' },
  { full: 'Ready cancel emails' },
  { full: 'Ghost List tracker' },
  { full: 'Did it actually stop?' },
  { full: 'Cancel reminders' },
  { full: 'PDF report, levels and badges' },
  { full: 'Your full total', free: 'Your full total', always: true },
];

const COMPARE = [
  ['', 'Ghost Fees', 'Rocket Money', 'Bank apps'],
  ['Price', '$10 once', 'US$7 to 14 a month', 'Free'],
  ['In Australia', 'Yes', 'No', 'Own bank'],
  ['Bank login', 'Not needed', 'Needed', 'n/a'],
  ['Checks it stopped', 'Yes', 'No', 'No'],
];

const QUESTIONS = [
  ['Is it really one payment?', 'Yes. $10 once ($5 for the first 50 founding members). No subscription, no renewals, nothing to cancel.'],
  ['Do you store my bank statement?', 'No. CSV statements are read in your browser and never leave it. PDFs are uploaded privately so they can be read (the Privacy page says how long). We keep your email, your scan count and your payment record.'],
  ['What do I keep on Free?', '3 scans, 1 ghost try, your full total every time, and all three themes.'],
];

export default function Upgrade() {
  const navigate = useNavigate();
  const { results, usedSample } = useScan();
  const { signedIn, paid, charging, foundingLeft, status } = useAllowance();
  const founding = foundingLeft > 0;
  const [plan, setPlan] = useState('standard');
  const [open, setOpen] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const total = results && !usedSample && results.total > 0 ? results.total : lastRealTotal();
  const times = Math.floor(total / 10);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'cancelled') setMessage('Payment cancelled. Nothing was charged.');
    if (window.location.hash === '#compare') setTimeout(() => document.getElementById('compare')?.scrollIntoView({ behavior: 'smooth' }), 150);
  }, []);

  const plans = [
    { key: 'free', name: 'Free', line: '3 uploads · 1 ghost try', price: '$0', note: 'Current plan' },
    { key: 'standard', name: 'Unlimited', line: 'Everything, forever', price: '$10', note: 'once', badge: 'Best value' },
    ...(founding ? [{ key: 'founding', name: 'Founding member', line: 'Same as Unlimited · first 50 only', price: '$5', note: 'once', badge: `${foundingLeft} spots left` }] : []),
  ];
  const chosen = plans.find((item) => item.key === plan) || plans[1];

  const pay = async () => {
    if (plan === 'free') {
      navigate(-1);
      return;
    }
    if (!signedIn) {
      navigate(`/login?returnTo=${encodeURIComponent('/upgrade')}`);
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      const outcome = await startCheckout(plan);
      if (outcome?.alreadyPaid) navigate('/unlocked');
      else if (!outcome?.redirected) setMessage(outcome?.error || 'Payments open soon.');
    } catch (err) {
      setMessage(err?.response?.data?.error || 'Payments open soon.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen pb-44">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/90 px-4 py-3 backdrop-blur">
        <button type="button" onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))} aria-label="Close" className="rounded-full p-1.5 hover:bg-white/10"><X className="h-5 w-5" /></button>
        <span className="font-heading text-[17px] font-bold">Upgrade</span>
        <span className="w-8" />
      </header>

      <main className="mx-auto w-full max-w-lg px-4">
        <h1 className="mt-6 font-heading text-[30px] font-bold leading-tight">Choose your plan</h1>
        <p className="mt-1 text-[15px] text-muted-foreground">Pay once, keep it. No subscription, no renewals.</p>
        {!charging && <p className="mt-3 rounded-2xl border border-[#5ee6c8]/40 bg-[#5ee6c8]/10 px-4 py-2.5 text-[13.5px] font-semibold">Everything is free while we&apos;re in beta. This is how it will work after.</p>}
        {paid && charging && <p className="mt-3 rounded-2xl border border-[#5ee6c8]/40 bg-[#5ee6c8]/10 px-4 py-2.5 text-[13.5px] font-semibold">You&apos;re already unlocked{status?.foundingNumber ? `, founding member #${status.foundingNumber}` : ''}.</p>}

        <div className="mt-5 flex flex-col gap-2.5" role="radiogroup" aria-label="Plan">
          {plans.map((item) => (
            <button key={item.key} type="button" role="radio" aria-checked={plan === item.key} onClick={() => setPlan(item.key)} className={cn('relative flex items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left transition-colors', plan === item.key ? 'border-primary bg-primary/[0.08]' : 'border-border hover:border-primary/40')}>
              <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2', plan === item.key ? 'border-primary' : 'border-muted-foreground/50')}>{plan === item.key && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}</span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2"><span className="font-heading text-[17px] font-bold">{item.name}</span>{item.badge && <span className="rounded-full bg-primary px-2 py-0.5 text-[10.5px] font-black uppercase text-primary-foreground">{item.badge}</span>}</span>
                <span className="block text-[13px] text-muted-foreground">{item.line}</span>
              </span>
              <span className="text-right"><span className="block font-heading text-[22px] font-bold leading-none">{item.price}</span><span className="text-[11.5px] text-muted-foreground">{item.note}</span></span>
            </button>
          ))}
        </div>

        <section className="mt-6">
          <h2 className="font-heading text-[18px] font-bold">What&apos;s included</h2>
          <ul key={plan} className="mt-2 space-y-1.5">
            {FEATURES.map((item, index) => {
              const has = plan !== 'free' || item.free;
              const label = plan === 'free' ? item.free || item.full : item.full;
              return (
                <li key={item.full} className="up-fade flex items-center gap-2 text-[14.5px]" style={{ animationDelay: `${index * 60}ms` }}>
                  {has ? <Check className="h-4 w-4 shrink-0 text-[#5ee6c8]" /> : <X className="h-4 w-4 shrink-0 text-muted-foreground/60" />}
                  <span className={cn(!has && 'text-muted-foreground line-through')}>{label}</span>
                </li>
              );
            })}
          </ul>
        </section>

        {total > 0 && (
          <section className="mt-6 rounded-2xl border border-primary/40 bg-primary/10 p-4">
            <p className="text-[14px] font-semibold">Your scans found</p>
            <p className="font-heading text-[34px] font-bold leading-none text-primary">{money(total)}</p>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/10"><div className="up-fill h-full rounded-full bg-primary" style={{ '--w': `${Math.min(100, (total / Math.max(total, 10)) * 100)}%` }} /></div>
            {times >= 1 && <p className="mt-2 text-[14px]">That&apos;s <b>{times}x</b> the $10 price.</p>}
          </section>
        )}

        <section className="mt-6">
          <h2 className="font-heading text-[18px] font-bold">The research</h2>
          <ul className="mt-2 divide-y divide-white/[0.06] rounded-2xl border border-border">
            {UPGRADE_STATS.slice(0, 8).map((item) => (
              <li key={item.id} className="flex items-baseline gap-3 px-4 py-2.5">
                <span className="w-[5.5rem] shrink-0 font-heading text-[18px] font-bold text-primary">{item.big}</span>
                <span className="text-[13.5px]">{item.text} <span className="block text-[11.5px] text-muted-foreground">{item.source}</span></span>
              </li>
            ))}
          </ul>
        </section>

        <section id="compare" className="mt-6 scroll-mt-20">
          <h2 className="font-heading text-[18px] font-bold">How we compare</h2>
          <div className="mt-2 overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-[13px]">
              <tbody>
                {COMPARE.map((row, index) => (
                  <tr key={row[0] || 'head'} className={cn(index === 0 ? 'font-bold' : 'border-t border-white/[0.06]')}>
                    {row.map((cell, col) => (
                      <td key={`${index}-${col}`} className={cn('px-3 py-2', col === 1 && 'bg-primary/[0.08] font-bold', col === 0 && 'font-semibold text-muted-foreground')}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-1 text-[11.5px] text-muted-foreground">Prices checked Nov 2026.</p>
        </section>

        <section className="mt-6">
          <h2 className="font-heading text-[18px] font-bold">Questions</h2>
          <div className="mt-2 flex flex-col gap-2">
            {QUESTIONS.map(([q, a], index) => (
              <div key={q} className="rounded-2xl border border-border">
                <button type="button" aria-expanded={open === index} onClick={() => setOpen(open === index ? null : index)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-[14.5px] font-bold">
                  {q}<ChevronDown className={cn('h-4 w-4 shrink-0 transition-transform', open === index && 'rotate-180')} />
                </button>
                {open === index && <p className="px-4 pb-3 text-[13.5px] text-muted-foreground">{a}</p>}
              </div>
            ))}
          </div>
        </section>

        <a href="https://asi1.ai" target="_blank" rel="noreferrer" className="mt-6 block rounded-2xl border border-border p-4 hover:border-primary/50">
          <p className="font-heading text-[16px] font-bold">Prefer chat?</p>
          <p className="text-[13.5px] text-muted-foreground">Ghost It on ASI:One, packs from $2 ↗</p>
        </a>
        <p className="mt-6 text-center text-[12px] text-muted-foreground">General information, not financial advice. Your statement is never stored. <Link to="/privacy" className="underline">Privacy</Link></p>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 pb-4 pt-3 backdrop-blur">
        <div className="mx-auto max-w-lg">
          <div className="flex items-baseline justify-between text-[14px]"><span className="font-bold">{chosen.name}</span><span className="font-heading text-[18px] font-bold">{chosen.price}{chosen.key !== 'free' && <span className="text-[12px] font-normal text-muted-foreground"> once</span>}</span></div>
          <button type="button" onClick={pay} disabled={busy} className="mt-2 w-full rounded-2xl bg-primary py-3.5 text-[16px] font-bold text-primary-foreground disabled:opacity-60">
            {plan === 'free' ? 'Stay on Free' : busy ? 'Opening Stripe...' : signedIn ? 'Continue to payment' : 'Sign in to continue'}
          </button>
          {message && <p className="mt-2 text-center text-[12.5px] text-[#ffc27a]" role="status">{message}</p>}
          <p className="mt-1.5 text-center text-[11px] text-muted-foreground">Secure checkout by Stripe · No card surcharge · One payment</p>
        </div>
      </div>
    </div>
  );
}
