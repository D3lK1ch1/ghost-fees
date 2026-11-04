import { badgesFor, LEVELS } from '@/lib/ghostFees/levels';
import { money } from '@/lib/ghostFees/format';

// "Badges you can earn": what each badge is and how to get it and the levels,
// before you've cancelled anything (the Ghost List only appears after that).
// Fun only: badges and levels never change any numbers. "Explain badges better" (2 Nov)
const ALL = badgesFor([]);

export default function BadgesExplainer({ className = '', compact = false }) {
  return (
    <section aria-label="Badges you can earn" className={`rounded-3xl border border-border bg-card/60 p-4 sm:p-5 ${className}`}>
      <p className="font-heading text-[18px] font-bold text-foreground">🏅 Badges you can earn</p>
      <p className="mt-0.5 text-[14.5px] leading-snug text-muted-foreground">
        A bit of fun as you cancel. Each cancelled subscription goes on your Ghost List and these unlock along the way. They never change your numbers and you can share them.
      </p>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {ALL.map((badge) => (
          <li key={badge.key} className="flex items-start gap-3 rounded-2xl border border-border bg-background/40 px-3.5 py-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/15 leading-none" aria-hidden="true">
              <span className="block text-[19px] leading-none">{badge.emoji}</span>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-bold text-foreground">{badge.name}</span>
              <span className="block text-[14px] leading-snug text-muted-foreground"><b className="text-foreground">How:</b> {badge.how}.</span>
              {!compact && <span className="mt-0.5 block text-[13.5px] leading-snug text-muted-foreground">{badge.about}</span>}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[14px] font-bold text-foreground">Levels, by how much a year you&apos;ve ghosted</p>
      <ol className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[13.5px]" aria-label="Levels">
        {LEVELS.map((level, index) => (
          <li key={level.name} className="flex items-center gap-1.5">
            <span className="rounded-full bg-primary/15 px-2.5 py-1 font-bold text-foreground">{level.name} <span className="font-semibold text-muted-foreground">{level.min ? `${money(level.min).replace(/\.00$/, '')}/yr` : 'start'}</span></span>
            {index < LEVELS.length - 1 && <span aria-hidden="true" className="text-muted-foreground">→</span>}
          </li>
        ))}
      </ol>
    </section>
  );
}