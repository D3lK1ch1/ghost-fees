import { Link } from 'react-router-dom';
import { Check, Sparkles } from 'lucide-react';
import { GUIDES } from '@/lib/ghostFees/guides';
import { statFor } from '@/data/stats';
import { useAuth } from '@/lib/AuthContext';
import { useAllowance } from '@/lib/AllowanceContext';

// The "Free vs Pro" home tab, laid out like a pro app's plan picker: Free and Pro
// side by side, a big price, one button each, then what you get. Under it the
// ghost team (who does what) and the savings maths. Same plan facts as /upgrade.
const TEAM = ['penny', 'sir', 'gus', 'cass'].map((key) => GUIDES[key]);

const FREE = [
  'The sample statement, any time',
  '3 statement scans',
  'Your full total, every leak in dollars',
  '1 try of a ghost guide',
  'All 3 themes',
];

const PRO = [
  'Unlimited scans, every bank and card',
  'All 4 ghost guides',
  'Cassy finds the cancel page, steps and phone number',
  'Ready-to-send cancel and refund emails',
  'Ghost List: checks the charges actually stopped',
  'Calendar reminders, PDF report and badges',
];

function Feature({ children, pro }) {
  return (
    <li className="flex gap-2.5 text-[14px] leading-snug text-foreground">
      <Check className={pro ? 'mt-0.5 h-4 w-4 shrink-0 text-primary' : 'mt-0.5 h-4 w-4 shrink-0 text-muted-foreground'} aria-hidden="true" />
      {children}
    </li>
  );
}

export default function PlansAtAGlance({ onSample }) {
  const { user, isAuthenticated } = useAuth();
  const { status } = useAllowance();
  const pro = Boolean(user?.role === 'admin' || status?.paid);
  const waste = statFor('waste');

  return (
    <div className="mx-auto mt-5 w-full max-w-3xl px-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <section aria-label="Free plan" className="flex flex-col rounded-3xl border border-border bg-card/70 p-5">
          <p className="font-heading text-[22px] font-bold text-foreground">Free</p>
          <p className="mt-1 flex items-baseline gap-1.5"><span className="font-heading text-[36px] font-bold leading-none text-foreground">$0</span><span className="text-[13px] text-muted-foreground">to start</span></p>
          <p className="mt-2 text-[14px] text-muted-foreground">See what’s haunting your account.</p>
          {isAuthenticated && !pro ? (
            <span className="mt-4 flex h-11 items-center justify-center rounded-full border border-border text-[14.5px] font-bold text-muted-foreground">Your current plan</span>
          ) : (
            <button type="button" onClick={onSample} className="mt-4 h-11 rounded-full border border-border bg-white/5 text-[14.5px] font-bold text-foreground hover:border-primary/60">Try the sample free</button>
          )}
          <ul className="mt-4 space-y-2">{FREE.map((line) => <Feature key={line}>{line}</Feature>)}</ul>
        </section>

        <section aria-label="Pro plan" className="relative flex flex-col rounded-3xl border-2 border-primary bg-primary/10 p-5 shadow-[0_0_40px_hsl(var(--primary)/0.2)]">
          <span className="absolute right-4 top-4 rounded-full bg-primary px-2.5 py-0.5 text-[11.5px] font-bold text-primary-foreground">Best value</span>
          <p className="flex items-center gap-1.5 font-heading text-[22px] font-bold text-foreground"><Sparkles className="h-5 w-5 text-primary" aria-hidden="true" /> Pro</p>
          <p className="mt-1 flex items-baseline gap-1.5"><span className="font-heading text-[36px] font-bold leading-none text-foreground">$10</span><span className="text-[13px] text-muted-foreground">once, never a subscription</span></p>
          <p className="mt-2 text-[14px] text-muted-foreground">Ghost every one of them, with help.</p>
          {pro ? (
            <span className="mt-4 flex h-11 items-center justify-center rounded-full border border-primary text-[14.5px] font-bold text-primary">Your current plan</span>
          ) : (
            <Link to="/upgrade" className="mt-4 flex h-11 items-center justify-center rounded-full bg-primary text-[14.5px] font-bold text-primary-foreground shadow-[0_8px_30px_hsl(var(--primary)/0.35)] hover:-translate-y-0.5">Get Pro</Link>
          )}
          <p className="mt-4 text-[12.5px] font-bold text-muted-foreground">Everything in Free, plus</p>
          <ul className="mt-2 space-y-2">{PRO.map((line) => <Feature key={line} pro>{line}</Feature>)}</ul>
        </section>
      </div>

      <p className="mt-5 text-center text-[12.5px] font-bold uppercase tracking-[0.14em] text-primary">Your ghost team</p>
      <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {TEAM.map((guide) => (
          <li key={guide.name} className="rounded-2xl border bg-card/60 px-3 py-2.5" style={{ borderColor: `${guide.color}66` }}>
            <p className="text-[14px] font-bold" style={{ color: guide.color }}>{guide.name}</p>
            <p className="text-[12.5px] leading-snug text-muted-foreground">{guide.job}</p>
          </li>
        ))}
        <li className="col-span-2 rounded-2xl border border-border bg-card/60 px-3 py-2.5 sm:col-span-1">
          <p className="text-[14px] font-bold text-foreground">Ghost It</p>
          <p className="text-[12.5px] leading-snug text-muted-foreground">Chat agent in ASI:One (@ghostit)</p>
        </li>
      </ul>

      <p className="mt-4 text-center text-[13.5px] leading-snug text-foreground">
        {waste && <><b className="text-primary">{waste.stat}</b> {waste.text} <span className="text-muted-foreground">({waste.source})</span>. </>}
        Cancel one $10-a-month subscription and Pro has paid for itself in a month.
      </p>
      <p className="mt-1 text-center text-[12px] text-muted-foreground">Everything is free while we&apos;re in beta.</p>
    </div>
  );
}
