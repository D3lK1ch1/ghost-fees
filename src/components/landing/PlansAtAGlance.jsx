import { Link } from 'react-router-dom';
import { Calculator, Check, Mail, MessageCircle, Scissors, Sparkles, Trophy } from 'lucide-react';
import GhostMark from '@/components/site/GhostMark';
import { GUIDES } from '@/lib/ghostFees/guides';
import { statFor } from '@/data/stats';
import { useAuth } from '@/lib/AuthContext';
import { useAllowance } from '@/lib/AllowanceContext';

// The "Free vs Pro" home tab, laid out like a pro app's plan picker: Free and Pro
// side by side, a big price, one button each, then what you get. Under it the
// ghost team (who does what) and the savings maths. Same plan facts as /upgrade.
// Each agent: their colour ghost, a role icon, their job and what they actually do.
const ICONS = { penny: Calculator, sir: Mail, gus: Trophy, cass: Scissors };
const BLURBS = {
  penny: 'Adds up every charge and fee, and shows the maths.',
  sir: 'Writes your cancel, refund and fee-waiver emails.',
  gus: 'Keeps score as you bust ghosts, and sets goals.',
  cass: 'Finds the real cancel page, steps and phone number.',
};
const TEAM = [
  ...['penny', 'sir', 'gus', 'cass'].map((key) => ({ key, ...GUIDES[key], Icon: ICONS[key], does: BLURBS[key] })),
  {
    key: 'ghostit',
    name: 'Ghost It',
    role: 'the chat agent',
    color: '#8FB8FF',
    job: 'Chat in ASI:One',
    does: 'Tell @ghostit what you pay for. It finds double-ups and cancel steps.',
    Icon: MessageCircle,
  },
];

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
    <div className="mx-auto mt-5 w-full max-w-4xl px-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <section aria-label="Free plan" className="flex flex-col rounded-3xl border border-border bg-card/70 p-5">
          <p className="font-heading text-[22px] font-bold text-foreground">Free</p>
          <p className="mt-1 flex items-baseline gap-1.5"><span className="font-heading text-[36px] font-bold leading-none text-foreground">$0</span><span className="text-[14px] text-muted-foreground">to start</span></p>
          <p className="mt-2 text-[14px] text-muted-foreground">See what’s haunting your account.</p>
          {isAuthenticated && !pro ? (
            <span className="mt-4 flex h-11 items-center justify-center rounded-full border border-border text-[14.5px] font-bold text-muted-foreground">Your current plan</span>
          ) : (
            <button type="button" onClick={onSample} className="mt-4 h-11 rounded-full border border-border bg-white/5 text-[14.5px] font-bold text-foreground hover:border-primary/60">Try the sample free</button>
          )}
          <ul className="mt-4 space-y-2">{FREE.map((line) => <Feature key={line}>{line}</Feature>)}</ul>
        </section>

        <section aria-label="Pro plan" className="relative flex flex-col rounded-3xl border-2 border-primary bg-primary/10 p-5 shadow-[0_0_40px_hsl(var(--primary)/0.2)]">
          <span className="absolute right-4 top-4 rounded-full bg-primary px-2.5 py-0.5 text-[12.5px] font-bold text-primary-foreground">Best value</span>
          <p className="flex items-center gap-1.5 font-heading text-[22px] font-bold text-foreground"><Sparkles className="h-5 w-5 text-primary" aria-hidden="true" /> Pro</p>
          <p className="mt-1 flex items-baseline gap-1.5"><span className="font-heading text-[36px] font-bold leading-none text-foreground">$10</span><span className="text-[14px] text-muted-foreground">once, never a subscription</span></p>
          <p className="mt-2 text-[14px] text-muted-foreground">Ghost every one of them, with help.</p>
          {pro ? (
            <span className="mt-4 flex h-11 items-center justify-center rounded-full border border-primary text-[14.5px] font-bold text-primary">Your current plan</span>
          ) : (
            <Link to="/upgrade" className="mt-4 flex h-11 items-center justify-center rounded-full bg-primary text-[14.5px] font-bold text-primary-foreground shadow-[0_8px_30px_hsl(var(--primary)/0.35)] hover:-translate-y-0.5">Get Pro</Link>
          )}
          <p className="mt-4 text-[13.5px] font-bold text-muted-foreground">Everything in Free, plus</p>
          <ul className="mt-2 space-y-2">{PRO.map((line) => <Feature key={line} pro>{line}</Feature>)}</ul>
        </section>
      </div>

      <p className="mt-5 text-center text-[13.5px] font-bold uppercase tracking-[0.14em] text-primary">Your ghost team</p>
      <ul className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
        {TEAM.map((agent) => (
          <li key={agent.key} className={`flex flex-col items-center rounded-3xl border-2 bg-card/70 px-3 pb-4 pt-5 text-center ${agent.key === 'ghostit' ? 'col-span-2 sm:col-span-1' : ''}`} style={{ borderColor: `${agent.color}55`, background: `linear-gradient(180deg, ${agent.color}1f, transparent 60%)` }}>
            <span className="relative" aria-hidden="true">
              <span className="flex h-[72px] w-[72px] items-center justify-center rounded-full" style={{ background: `${agent.color}2e`, boxShadow: `0 0 24px ${agent.color}40` }}>
                <GhostMark className="h-12 w-12 motion-safe:animate-float" style={{ color: agent.color }} eyeColor="#1a1230" />
              </span>
              <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-[3px] border-card" style={{ background: agent.color, color: '#1a1230' }}>
                <agent.Icon className="h-4 w-4" strokeWidth={2.5} />
              </span>
            </span>
            <span className="mt-3 font-heading text-[19px] font-bold leading-tight text-foreground">{agent.name}</span>
            <span className="mt-1.5 rounded-full px-2.5 py-0.5 text-[13px] font-bold" style={{ background: `${agent.color}26`, color: agent.color }}>{agent.job}</span>
            <span className="mt-2 text-[14px] leading-snug text-muted-foreground">{agent.does}</span>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-center text-[14.5px] leading-snug text-foreground">
        {waste && <><b className="text-primary">{waste.stat}</b> {waste.text} <span className="text-muted-foreground">({waste.source})</span>. </>}
        Cancel one $10-a-month subscription and Pro has paid for itself in a month.
      </p>
      <p className="mt-1 text-center text-[13px] text-muted-foreground">Everything is free while we&apos;re in beta.</p>
    </div>
  );
}
