import { Link } from 'react-router-dom';
import { Check, Sparkles } from 'lucide-react';
import { GUIDES } from '@/lib/ghostFees/guides';
import { statFor } from '@/data/stats';

// Home page, under the UVP: who does what (the ghost team), what Free gives you,
// what Premium adds, and the savings maths. Same plan facts as /upgrade.
const TEAM = ['penny', 'sir', 'gus', 'cass'].map((key) => GUIDES[key]);

const FREE = [
  'The sample statement, any time',
  '3 statement scans',
  'Your full total, every leak in dollars',
  '1 try of a ghost guide',
  'All 3 themes',
];

const PREMIUM = [
  'Unlimited scans, every bank and card',
  'All 4 ghost guides',
  'Cassy finds the cancel page, steps and phone number',
  'Ready-to-send cancel and refund emails',
  'Ghost List: checks the charges actually stopped',
  'Calendar reminders, PDF report and badges',
];

export default function PlansAtAGlance() {
  const waste = statFor('waste');
  return (
    <div className="mt-5 text-left">
      <p className="text-center text-[12.5px] font-bold uppercase tracking-[0.14em] text-primary">Your ghost team</p>
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

      <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
        <section aria-label="Free plan" className="rounded-2xl border border-border bg-card/60 p-4">
          <p className="font-heading text-[18px] font-bold text-foreground">Free</p>
          <p className="text-[12.5px] text-muted-foreground">No card, no sign-in for the sample</p>
          <ul className="mt-2 space-y-1.5">
            {FREE.map((line) => (
              <li key={line} className="flex gap-2 text-[13.5px] leading-snug text-foreground"><Check className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />{line}</li>
            ))}
          </ul>
        </section>
        <section aria-label="Premium" className="rounded-2xl border-2 border-primary bg-primary/10 p-4 shadow-[0_0_30px_hsl(var(--primary)/0.18)]">
          <p className="flex items-center gap-1.5 font-heading text-[18px] font-bold text-foreground"><Sparkles className="h-4 w-4 text-primary" aria-hidden="true" /> Premium <span className="text-primary">$10 once</span></p>
          <p className="text-[12.5px] text-muted-foreground">Everything in Free, plus</p>
          <ul className="mt-2 space-y-1.5">
            {PREMIUM.map((line) => (
              <li key={line} className="flex gap-2 text-[13.5px] leading-snug text-foreground"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />{line}</li>
            ))}
          </ul>
        </section>
      </div>

      <p className="mt-3 text-center text-[13.5px] leading-snug text-foreground">
        {waste && <><b className="text-primary">{waste.stat}</b> {waste.text} <span className="text-muted-foreground">({waste.source})</span>. </>}
        Cancel one $10-a-month subscription and Premium has paid for itself in a month.
      </p>
      <p className="mt-1 text-center text-[12px] text-muted-foreground">
        Never a subscription. Free while we&apos;re in beta. <Link to="/upgrade" className="font-bold text-primary underline-offset-2 hover:underline">See plans</Link>
      </p>
    </div>
  );
}
