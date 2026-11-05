import { ChevronRight } from 'lucide-react';
import BiasChart from '@/components/results/BiasChart';
import WhenChart from '@/components/patterns/WhenChart';
import FutureSpend from '@/components/results/FutureSpend';
import { biasGroups, PATTERN_FOOTER_REF } from '@/lib/ghostFees/leaks';
import { money, moneyWhole } from '@/lib/ghostFees/format';
import { usePatterns } from './PatternContext';

// The Money patterns tab (Pack 9 part 2): the patterns behind this statement's ghosts,
// biggest first. Totals only from biasGroups (charges on the statement, never forecasts).
const EVIDENCE = { strong: 'Strong evidence', medium: 'Medium evidence' };

// All the app's charts live in this tab (5 Nov). Future spend sits last, under its own
// heading: it is a forecast, so no pattern is ever attached to it.
function LookingAhead({ subscriptions, cancelSubs }) {
  if (!subscriptions?.length) return null;
  return (
    <section aria-labelledby="looking-ahead" className="border-t border-white/[0.08] pt-4">
      <p id="looking-ahead" className="text-[13px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Looking ahead · a forecast, not a pattern</p>
      <FutureSpend subscriptions={subscriptions} cancelSubs={cancelSubs} />
    </section>
  );
}

export default function PatternsTab({ leaks, total, subscriptions = [], cancelSubs = [] }) {
  const { openPattern } = usePatterns();
  const groups = biasGroups(leaks);
  if (!groups.length) {
    return (
      <div className="mt-4 space-y-4">
        <p className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 text-[15px] text-foreground">No money patterns on this statement. Nice.</p>
        <LookingAhead subscriptions={subscriptions} cancelSubs={cancelSubs} />
      </div>
    );
  }
  const top = groups[0];
  return (
    <div className="mt-4 space-y-4">
      <div>
        <p className="text-[19px] font-semibold text-foreground">{groups.length} {groups.length === 1 ? 'pattern' : 'patterns'} behind your {money(total)}</p>
        <p className="text-[14px] text-muted-foreground">From the charges on this statement. Not a judgement.</p>
      </div>
      <button type="button" onClick={() => openPattern(top.key)} className="w-full rounded-2xl border border-primary/40 bg-primary/10 p-4 text-left transition-colors hover:bg-primary/15">
        <span className="block text-[13px] font-semibold uppercase tracking-[0.12em] text-primary">Your biggest pattern</span>
        <span className="mt-1 block text-[18px] font-semibold text-foreground">{moneyWhole(top.total)} of your {money(total)} is {top.bias}</span>
        <span className="mt-0.5 block text-[14px] text-muted-foreground">{top.line}</span>
      </button>
      {groups.length > 1 && <BiasChart leaks={leaks} onBar={openPattern} footer={false} heading={false} />}
      {groups.length > 1 && <WhenChart leaks={leaks} />}
      <ul className="grid gap-2.5 sm:grid-cols-2">
        {groups.map((g) => {
          const count = g.leakIds.length;
          return (
            <li key={g.key}>
              <button type="button" onClick={() => openPattern(g.key)} className="flex h-full w-full flex-col rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 text-left transition-colors hover:border-primary/50">
                <span className="flex w-full items-start justify-between gap-2">
                  <span className="text-[16px] font-semibold text-foreground"><span aria-hidden="true">🧠 </span>{g.bias}</span>
                  <span className="shrink-0 text-[16px] font-semibold tabular-nums text-foreground">{money(g.total)}</span>
                </span>
                <span className="mt-1 text-[12.5px] text-muted-foreground">{EVIDENCE[g.evidence]} · {count} {count === 1 ? 'ghost' : 'ghosts'}</span>
                <span className="mt-1.5 flex-1 text-[14px] leading-snug text-foreground/85">{g.line}</span>
                <span className="mt-2 inline-flex items-center gap-0.5 text-[14px] font-semibold text-primary">Open <ChevronRight className="h-4 w-4" aria-hidden="true" /></span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="text-[12.5px] leading-snug text-muted-foreground">
        Common money patterns from behavioural finance research. &lsquo;How to beat it&rsquo; uses implementation intentions (<a href="https://doi.org/10.1037/0003-066X.54.7.493" target="_blank" rel="noopener noreferrer" title={PATTERN_FOOTER_REF} className="underline-offset-2 hover:underline">Gollwitzer, 1999</a>). Not a judgement, and not financial advice.
      </p>
      <LookingAhead subscriptions={subscriptions} cancelSubs={cancelSubs} />
    </div>
  );
}
