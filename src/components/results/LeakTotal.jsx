import { CountUp, BobbingGhost } from '@/components/GhostAnimations';
import { monthRangeLabel } from '@/lib/ghostFees/format';
import HoursLine from './HoursLine';

export default function LeakTotal({ total, months, from, to, monthlyIncome }) {
  const range = monthRangeLabel(from, to);

  return (
    <section className="relative mt-4 overflow-hidden rounded-[2rem] border border-border bg-card p-6 sm:p-9">
      <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-primary/[0.12] blur-3xl" />
      <div className="absolute right-5 top-6 sm:right-9 sm:top-1/2 sm:-translate-y-1/2">
        <BobbingGhost size={72} />
      </div>
      <p className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">You found</p>
      <p className="mt-1 pr-14 font-heading text-[3.6rem] font-bold leading-none text-primary [text-shadow:0_0_28px_hsl(var(--primary)/0.35)] sm:text-[5.5rem]">
        <CountUp value={total} />
      </p>
      <p className="mt-3 font-heading text-xl font-semibold text-foreground sm:text-2xl">
        in {months} {months === 1 ? 'month' : 'months'}
      </p>
      <p className="mt-3 max-w-md text-[13.5px] leading-relaxed text-muted-foreground">
        {range ? `Covering ${range} (${months} ${months === 1 ? 'month' : 'months'}).` : ''}
        {months < 12 ? ' Upload 12 months to catch more price rises.' : ''}
      </p>
      <HoursLine total={total} monthlyIncome={monthlyIncome} />
      <p className="mt-2 max-w-md text-[12.5px] leading-relaxed text-muted-foreground/80">
        Real charges from your own statement. Nothing guessed, nothing projected.
      </p>
    </section>
  );
}