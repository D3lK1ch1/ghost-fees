import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, ChevronDown, Lock, X } from 'lucide-react';
import { useUpgradePalette } from '@/lib/ghostFees/upgradeTheme';
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
  { full: 'Unlimited uploads', body: 'Every bank and card, every month', free: '3 uploads' },
  { full: 'All 4 ghost guides', body: 'Penny, Spooksworth, Gus and Cassy', free: '1 try of one ghost' },
  { full: 'Cassy for every subscription', body: 'Real cancel page, steps, AU phone and hours', free: 'Cassy looks up 1 subscription' },
  { full: 'Ready cancel emails', body: 'Copy, paste, send', free: 'Ready cancel emails' },
  { full: 'Ghost List tracker', body: 'Requested, confirmed, still charging', free: 'Ghost List tracker' },
  { full: 'Did it actually stop?', body: 'Your next statement proves it', free: 'Did it actually stop?' },
  { full: 'Cancel reminders', body: 'Pick a time, it lands in your calendar', free: 'Cancel reminders' },
  { full: 'PDF report', body: 'Your results as a PDF to keep or share' },
  { full: 'Levels and badges', body: 'First Ghost, Price Rise Spotter and more as you cancel', free: 'Levels and badges' },
  { full: 'Your full total', body: 'Always shown, on every plan', free: 'Your full total', always: true },
];

const COMPARE = [
  ['', 'Ghost Fees', 'Rocket Money', 'Bank apps'],
  ['Price', '$10 once', 'US$7 to 14 a month', 'Free'],
  ['In Australia', 'Yes', 'No', 'Own bank'],
  ['Bank login', 'Not needed', 'Needed', 'n/a'],
  ['Checks it stopped', 'Yes', 'No', 'No'],
];

const QUESTIONS = [
  ['Is it really one payment?', 'Yes. $10 once. No subscription, no renewals, nothing to cancel.'],
  ['Do you store my bank statement?', 'No. CSV statements are read in your browser and never leave it. PDFs are uploaded privately so they can be read (the Privacy page says how long). We keep your email, your scan count and your payment record.'],
  ['What do I keep on Free?', '3 scans, 1 ghost try, your full total every time and all three themes.'],
];

export default function Upgrade() {
  const navigate = useNavigate();
  const P = useUpgradePalette();
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
    { key: 'standard', name: 'Pro', line: 'Everything, forever', price: '$10', note: 'once', badge: 'Best value' },
    ...(founding ? [{ key: 'founding', name: 'Founding member', line: 'Same as Pro · first 50 only', price: '$5', note: 'once', badge: `${foundingLeft} spots left` }] : []),
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
    <div className="min-h-screen pb-44" style={{ background: P.page, color: '#FFFFFF' }}>
      <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 backdrop-blur" style={{ background: `${P.page}e6` }}>
        <button type="button" onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))} aria-label="Close" className="flex h-11 w-11 items-center justify-center rounded-full" style={{ background: P.card }}><X className="h-[18px] w-[18px]" /></button>
        <span className="text-[16px] font-semibold">Upgrade</span>
        <span className="w-11" />
      </header>

      <main className="mx-auto w-full max-w-lg px-4">
        <h1 className="up-fade mt-6 font-heading text-[32px] font-bold leading-tight">Choose your plan</h1>
        <p className="mt-1.5 text-[15px] leading-snug" style={{ color: P.muted }}>Pay once, keep it. No subscription, no renewals.</p>
        {!charging && <p className="mt-3 rounded-2xl px-4 py-2.5 text-[14.5px] font-semibold" style={{ background: P.card, color: P.soft }}>Everything is free while we&apos;re in beta. This is how it will work after.</p>}
        {paid && charging && <p className="mt-3 rounded-2xl px-4 py-2.5 text-[14.5px] font-semibold" style={{ background: P.card, color: P.accent }}>You&apos;re already unlocked{status?.foundingNumber ? `, founding member #${status.foundingNumber}` : ''}.</p>}

        <div className="mt-5 flex flex-col gap-2.5" role="radiogroup" aria-label="Plan">
          {plans.map((item) => (
            <button key={item.key} type="button" role="radio" aria-checked={plan === item.key} onClick={() => setPlan(item.key)} className="flex min-h-[72px] items-center gap-3.5 rounded-[18px] border-2 p-4 text-left transition-all duration-200" style={plan === item.key ? { background: P.raised, borderColor: P.accent, transform: 'scale(1.01)' } : { background: P.card, borderColor: P.line }}>
              <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2" style={{ borderColor: plan === item.key ? P.accent : P.handle }}>
                <span className="h-2.5 w-2.5 rounded-full transition-transform duration-200" style={{ background: P.accent, transform: `scale(${plan === item.key ? 1 : 0})` }} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2"><span className="text-[16px] font-semibold">{item.name}</span>{item.badge && <span className="rounded-full px-2 py-0.5 text-[12.5px] font-bold" style={{ background: item.key === 'founding' ? P.founding : P.accent, color: P.ink }}>{item.badge}</span>}</span>
                <span className="block text-[14px]" style={{ color: P.muted }}>{item.line}</span>
              </span>
              <span className="text-right"><span className="block font-heading text-[22px] font-bold leading-none">{item.price}</span><span className="text-[13px]" style={{ color: P.muted }}>{item.note}</span></span>
            </button>
          ))}
        </div>

        <section className="mt-6 flex flex-col gap-3 rounded-[18px] p-[18px]" style={{ background: P.card }}>
          <h2 className="text-[14px] font-bold tracking-[0.06em]" style={{ color: P.muted }}>{plan === 'free' ? 'FREE PLAN' : 'WHAT\u2019S INCLUDED'}</h2>
          <ul key={plan} className="flex flex-col gap-3">
            {FEATURES.map((item, index) => {
              const has = plan !== 'free' || item.free;
              const label = plan === 'free' ? item.free || item.full : item.full;
              return (
                <li key={item.full} className="up-fade flex items-start gap-3" style={{ animationDelay: `${100 + index * 60}ms` }}>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full" style={has ? { background: P.accent, color: P.ink } : { background: P.track, color: '#8A7FA3' }}>
                    {has ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <X className="h-3.5 w-3.5" strokeWidth={3} />}
                  </span>
                  <span className="flex flex-col gap-0.5">
                    <span className={cn('text-[15px] font-semibold', !has && 'line-through')} style={{ color: has ? '#FFFFFF' : '#8A7FA3' }}>{label}</span>
                    <span className="text-[14px] leading-snug" style={{ color: P.faint }}>{item.body}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        {total > 0 && (
          <section className="mt-6 flex flex-col gap-2.5 rounded-[18px] p-[18px]" style={{ background: P.card }}>
            <div className="flex items-baseline justify-between"><span className="text-[14px]" style={{ color: P.muted }}>Your scans found</span><span className="font-heading text-[24px] font-bold" style={{ color: P.accent }}>{money(total)}</span></div>
            <div className="h-2 overflow-hidden rounded" style={{ background: P.track }}><div className="up-fill h-2 rounded" style={{ background: P.accent, '--w': '100%' }} /></div>
            {times >= 1 && <span className="text-[14px]" style={{ color: P.muted }}>That&apos;s {times}x the $10 price.</span>}
          </section>
        )}

        <section className="mt-6">
          <h2 className="pb-2 text-[14px] font-bold tracking-[0.06em]" style={{ color: P.muted }}>THE RESEARCH</h2>
          <ul>
            {UPGRADE_STATS.slice(0, 8).map((item, index) => (
              <li key={item.id} className="up-fade flex items-center gap-3.5 py-3" style={{ borderBottom: `1px solid ${P.line}`, animationDelay: `${100 + index * 60}ms` }}>
                <span className="w-[92px] shrink-0 font-heading text-[22px] font-bold leading-tight" style={{ color: P.accent }}>{item.big}</span>
                <span className="flex flex-col gap-0.5"><span className="text-[14px] leading-snug">{item.text}</span><span className="text-[13px]" style={{ color: P.faint }}>({item.source})</span></span>
              </li>
            ))}
          </ul>
        </section>

        <section id="compare" className="mt-6 scroll-mt-20">
          <h2 className="text-[14px] font-bold tracking-[0.06em]" style={{ color: P.muted }}>HOW WE COMPARE</h2>
          <div className="mt-2.5 overflow-x-auto rounded-2xl" style={{ background: P.card }}>
            <table className="w-full text-[14px]">
              <tbody>
                {COMPARE.map((row, index) => (
                  <tr key={row[0] || 'head'} className="font-normal" style={index === 0 ? { background: P.line, fontWeight: 600 } : { borderTop: `1px solid ${P.line}` }}>
                    {row.map((cell, col) => (
                      <td key={`${index}-${col}`} className="px-3 py-3" style={col === 0 ? { color: P.muted } : col === 1 ? { color: index === 0 ? P.accent : '#FFFFFF', fontWeight: 600 } : undefined}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-1.5 text-[12.5px]" style={{ color: P.faint }}>Prices checked Nov 2026.</p>
        </section>

        <section className="mt-6">
          <h2 className="pb-1.5 text-[14px] font-bold tracking-[0.06em]" style={{ color: P.muted }}>QUESTIONS</h2>
          <div className="flex flex-col">
            {QUESTIONS.map(([q, a], index) => (
              <div key={q} style={{ borderBottom: `1px solid ${P.line}` }}>
                <button type="button" aria-expanded={open === index} onClick={() => setOpen(open === index ? null : index)} className="flex min-h-[52px] w-full items-center justify-between gap-3 text-left text-[15px] font-semibold">
                  {q}<ChevronDown className={cn('h-4 w-4 shrink-0 transition-transform', open === index && 'rotate-180')} />
                </button>
                {open === index && <p className="up-fade pb-3.5 text-[14px] leading-relaxed" style={{ color: P.muted }}>{a}</p>}
              </div>
            ))}
          </div>
        </section>

        <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl px-4 py-3.5" style={{ background: P.card }}>
          <span className="flex flex-col gap-0.5"><span className="text-[15px] font-semibold">Prefer chat?</span><span className="text-[14px]" style={{ color: P.muted }}>Ghost It on ASI:One, packs from $2</span></span>
          <a href="https://asi1.ai" target="_blank" rel="noreferrer" className="flex min-h-[44px] items-center rounded-xl border px-3.5 text-[14px] font-semibold" style={{ borderColor: P.handle }}>Try it</a>
        </div>
        <p className="mt-6 text-center text-[13px]" style={{ color: P.faint }}>General information, not financial advice. <Link to="/privacy" className="underline">How we handle your data</Link></p>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 px-5 pb-5 pt-3.5" style={{ background: P.bg, borderTop: `1px solid ${P.line}` }}>
        <div className="mx-auto max-w-lg">
          <div className="flex items-baseline justify-between"><span className="text-[14px]" style={{ color: P.muted }}>{plan === 'free' ? 'Free plan' : chosen.name}</span><span className="font-heading text-[22px] font-bold">{chosen.price}{chosen.key !== 'free' && ' once'}</span></div>
          <button type="button" onClick={pay} disabled={busy} className={cn('mt-2.5 flex min-h-[54px] w-full items-center justify-center gap-2 rounded-2xl text-[17px] disabled:opacity-60', plan === 'free' ? 'font-semibold' : 'motion-safe:animate-pulse-soft font-bold')} style={plan === 'free' ? { background: P.line } : { background: P.accent, color: P.ink }}>
            {plan !== 'free' && <Lock className="h-4 w-4" strokeWidth={2.6} />}
            {plan === 'free' ? 'Stay on Free' : busy ? 'Opening Stripe...' : signedIn ? 'Continue to payment' : 'Sign in to continue'}
          </button>
          {message && <p className="mt-2 text-center text-[13.5px] text-[#ffc27a]" role="status">{message}</p>}
          <p className="mt-2 text-center text-[13px]" style={{ color: P.faint }}>Secure checkout by Stripe · No card surcharge · One payment</p>
        </div>
      </div>
    </div>
  );
}
