import GhostMark from '@/components/site/GhostMark';
import { moneyWhole } from '@/lib/ghostFees/format';

const PILLS = [
  { key: 'subscriptions', singular: 'subscription', plural: 'subscriptions', tone: 'bg-[#2b2440] text-[#cbb8ff]' },
  { key: 'fees', singular: 'bank fee', plural: 'bank fees', tone: 'bg-[#2f2a20] text-[#e3cda4]' },
  { key: 'creep', singular: 'price creep', plural: 'price creeps', tone: 'bg-[#3a2a1f] text-[#ffb37c]' },
];

export default function SummaryCard({ totals, counts, rangeLabel }) {
  const ghostCount = counts.subscriptions + counts.fees;

  return (
    <section className="relative mt-4 overflow-hidden rounded-[1.75rem] border border-primary/20 bg-card/80 p-6 sm:p-9">
      <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-primary/[0.09] blur-3xl" />
      <GhostMark className="absolute right-6 top-6 h-9 w-9 text-white/85 sm:h-11 sm:w-11" />

      <p className="text-[13px] font-medium uppercase tracking-[0.16em] text-muted-foreground">You&apos;re leaking</p>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-[3.4rem] font-bold leading-none tracking-[-0.03em] text-primary sm:text-[4.5rem]">
          {moneyWhole(totals.total)}
        </span>
        <span className="text-lg font-medium text-white/80 sm:text-xl">a year</span>
      </div>

      <p className="mt-4 max-w-md text-[13.5px] leading-relaxed text-muted-foreground">
        That&apos;s <span className="font-semibold text-white">{moneyWhole(totals.total / 12)} a month</span> across{' '}
        {ghostCount} {ghostCount === 1 ? 'ghost' : 'ghosts'}
        {rangeLabel ? ` in your ${rangeLabel} statement.` : '.'}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {PILLS.map((pill) => (
          <span key={pill.key} className={`rounded-full px-3 py-1 text-[12px] font-medium ${pill.tone}`}>
            {counts[pill.key]} {counts[pill.key] === 1 ? pill.singular : pill.plural}
          </span>
        ))}
      </div>
    </section>
  );
}