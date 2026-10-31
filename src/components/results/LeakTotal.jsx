import GhostMark from '@/components/site/GhostMark';
import { moneyWhole } from '@/lib/ghostFees/format';

export default function LeakTotal({ total, count }) {
  return (
    <section className="relative mt-4 overflow-hidden rounded-[1.75rem] border border-primary/20 bg-card/80 p-6 sm:p-9">
      <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-primary/[0.09] blur-3xl" />
      <GhostMark className="absolute right-5 top-6 h-9 w-9 text-white/85 sm:right-6 sm:h-11 sm:w-11" />

      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 pr-12">
        <span className="text-[2rem] font-bold leading-[1.05] tracking-[-0.03em] text-primary sm:text-[3rem]">
          You&apos;re leaking {moneyWhole(total)}
        </span>
        <span className="text-lg font-medium text-white/80 sm:text-xl">a year</span>
      </div>

      <p className="mt-4 max-w-md text-[13.5px] leading-relaxed text-muted-foreground">
        Across {count} {count === 1 ? 'leak' : 'leaks'} found in your statement. Tap the one that stings most.
      </p>
    </section>
  );
}