import GhostMark from '@/components/site/GhostMark';
import { moneyWhole } from '@/lib/ghostFees/format';

export default function LeakTotal({ total, months }) {
  return (
    <section className="relative mt-4 overflow-hidden rounded-[2rem] border border-border bg-card p-6 sm:p-9">
      <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-primary/[0.12] blur-3xl" />
      <GhostMark className="absolute right-5 top-6 h-12 w-12 text-foreground sm:right-9 sm:top-1/2 sm:h-24 sm:w-24 sm:-translate-y-1/2" eyeColor="#150e28" />
      <p className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">You found</p>
      <p className="mt-1 pr-14 font-heading text-[3.6rem] font-bold leading-none text-primary sm:text-[5.5rem]">
        {moneyWhole(total)}
      </p>
      <p className="mt-3 font-heading text-xl font-semibold text-foreground sm:text-2xl">
        in {months} {months === 1 ? 'month' : 'months'}
      </p>
      <p className="mt-3 max-w-md text-[13.5px] leading-relaxed text-muted-foreground">
        Real charges from your own statement. Nothing guessed, nothing projected.
      </p>
    </section>
  );
}