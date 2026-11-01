import { SEASONS, SEASON_LABELS } from '@/lib/ghostFees/christmasArt';
import { cn } from '@/lib/utils';

// Winter or Aussie Summer Christmas. Changes the art only.
export default function SeasonToggle({ season, setSeason }) {
  return (
    <div role="radiogroup" aria-label="Season" className="inline-flex items-center gap-1 rounded-full border border-border bg-card/70 p-1">
      {SEASONS.map((key) => (
        <button
          key={key}
          type="button"
          role="radio"
          aria-checked={season === key}
          onClick={() => setSeason(key)}
          className={cn(
            'rounded-full px-3 py-1 text-[12.5px] font-bold transition-colors',
            season === key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {SEASON_LABELS[key]}
        </button>
      ))}
    </div>
  );
}
