import { money } from '@/lib/ghostFees/format';
import { cn } from '@/lib/utils';
import { BADGE_MEANING } from '@/lib/ghostFees/leaks';

// Filter and sort the ghosts by leak type (Duplicate, Price creep, Trial
// converted, Bank fee...). Only types found on this statement get a chip.
export const LEAK_SORTS = [
  { key: 'biggest', label: 'Biggest first' },
  { key: 'type', label: 'By type' },
  { key: 'az', label: 'A to Z' },
];

export function filterLeaks(leaks, type, sort) {
  const shown = type === 'all' ? [...leaks] : leaks.filter((leak) => leak.badge === type);
  if (sort === 'az') shown.sort((a, b) => String(a.title || a.merchant).localeCompare(String(b.title || b.merchant)));
  else if (sort === 'type') shown.sort((a, b) => String(a.badge).localeCompare(String(b.badge)) || b.amount - a.amount);
  else shown.sort((a, b) => b.amount - a.amount);
  return shown;
}

export default function LeakFilter({ leaks, type, sort, onType, onSort }) {
  const counts = leaks.reduce((map, leak) => map.set(leak.badge, (map.get(leak.badge) || 0) + 1), new Map());
  if (counts.size < 2 && type === 'all') return null;
  const shown = filterLeaks(leaks, type, sort);
  // The number is how many ghosts of that kind were found, shown as a count badge.
  const chip = (key, label, count) => (
    <button
      key={key}
      type="button"
      role="radio"
      aria-checked={type === key}
      onClick={() => onType(key)}
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-[13.5px] font-bold transition-colors',
        type === key ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground hover:text-foreground',
      )}
    >
      {label}
      <span className={cn('ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[12px] font-bold', type === key ? 'bg-black/20' : 'bg-white/10')} aria-label={`${count} found`}>{count}</span>
    </button>
  );
  return (
    <div className="mt-4 flex flex-wrap items-center gap-1.5">
      <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Show ghosts of this type">
        {chip('all', 'All', leaks.length)}
        {[...counts.entries()].map(([badge, count]) => chip(badge, badge, count))}
      </div>
      <label className="ml-auto flex items-center gap-1.5 text-[13px] font-bold text-muted-foreground">
        Sort
        <select value={sort} onChange={(event) => onSort(event.target.value)} className="rounded-lg border border-border bg-background px-2 py-1 text-[13.5px] font-semibold text-foreground">
          {LEAK_SORTS.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
        </select>
      </label>
      {/* What each kind means, so the chips aren't jargon. */}
      {type !== 'all' ? (
        <div className="w-full rounded-2xl border border-border bg-card/60 px-4 py-3" aria-live="polite">
          <p className="text-[15px] text-foreground"><b>{type}:</b> {BADGE_MEANING[type]?.what}</p>
          {BADGE_MEANING[type]?.todo && <p className="mt-0.5 text-[14px] text-muted-foreground">What to do: {BADGE_MEANING[type].todo}</p>}
          <p className="mt-1 text-[13.5px] font-bold text-muted-foreground">{shown.length} {shown.length === 1 ? 'ghost' : 'ghosts'} · {money(shown.reduce((sum, leak) => sum + leak.amount, 0))}</p>
        </div>
      ) : (
        <ul className="grid w-full gap-x-4 gap-y-1 text-[13.5px] text-muted-foreground sm:grid-cols-2" aria-label="What each kind means">
          {[...counts.keys()].map((badge) => <li key={badge}><b className="text-foreground">{badge}:</b> {BADGE_MEANING[badge]?.what}</li>)}
        </ul>
      )}
    </div>
  );
}
