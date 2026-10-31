import GhostMark from '@/components/site/GhostMark';
import { moneyWhole } from '@/lib/ghostFees/format';

export default function LeakTotal({ total, months }) {
  return (
    <section className="relative mt-4 overflow-hidden rounded-[1.75rem] border border-primary/20 bg-card/80 p-6 sm:p-9">
      <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-primary/[0.09] blur-3xl" />
      <GhostMark className="absolute right-5 top-6 h-9 w-9 text-white/85 sm:right-6 sm:h-11 sm:w-11" />
      <h1 className="pr-12 text-[2.2rem] font-bold leading-[1.05] tracking-[-0.03em] text-white sm:text-[3.2rem]">
        You found <span className="text-primary">{moneyWhole(total)}</span> in {months} {months === 1 ? 'month' : 'months'}
      </h1>
      <p className="mt-3 max-w-md text-[13.5px] leading-relaxed text-muted-foreground">
        Real charges from your own statement. Nothing guessed, nothing projected.
      </p>
    </section>
  );
}