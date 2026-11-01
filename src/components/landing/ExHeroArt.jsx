import { EX_GHOSTS, EX_PICKS } from '@/lib/ghostFees/exArt';
import { cn } from '@/lib/utils';

// My Ex Ghosted Me hero: the chosen ghost, a thought bubble and "Choose your ghost".
// The pick only changes the art and words, never the scan.
export default function ExHeroArt({ pickKey, setPickKey }) {
  const pick = EX_PICKS[pickKey];

  return (
    <div className="flex w-full flex-col items-center">
      <div className="relative">
        <img src={pick.hero} alt={pick.heroAlt} width={360} className="h-auto w-[220px] animate-float drop-shadow-[0_12px_40px_hsl(var(--primary)/0.25)] sm:w-[260px]" />
        <p className="absolute -right-6 top-2 max-w-[140px] rounded-[22px] bg-white px-3.5 py-2 text-[13px] font-bold leading-tight text-[#2a1020] shadow-lg sm:-right-16">
          {pick.heroBubble}
        </p>
      </div>

      <p className="mt-4 text-[13px] font-bold text-muted-foreground">Choose your ghost</p>
      <div role="radiogroup" aria-label="Choose your ghost" className="mt-2 grid w-full max-w-[300px] grid-cols-2 gap-2.5">
        {EX_GHOSTS.map((key) => {
          const item = EX_PICKS[key];
          const selected = key === pickKey;
          return (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setPickKey(key)}
              className={cn(
                'flex flex-col items-center rounded-2xl border bg-card/60 px-3 py-2.5 transition-colors',
                selected ? 'border-[#5ee6c8] ring-1 ring-[#5ee6c8]' : 'border-border hover:border-primary/60',
              )}
            >
              <img src={item.avatar} alt="" width={56} height={56} className="h-14 w-14 object-contain" />
              <span className="mt-1 text-[13px] font-bold text-foreground">{item.label}</span>
              <span className={cn('text-[11px] font-semibold', selected ? 'text-[#5ee6c8]' : 'text-muted-foreground')}>
                {selected ? 'Selected' : item.note}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// The headline in two colours, worded for the chosen ghost.
export function ExHeadline({ pickKey }) {
  const [first, second] = EX_PICKS[pickKey].headline;
  return (
    <>
      {first}
      <span className="text-primary">{second}</span>
    </>
  );
}
