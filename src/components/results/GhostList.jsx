import { money } from '@/lib/ghostFees/format';
import { STATUSES, daysSince, ghostTotals } from '@/lib/ghostFees/ghostList';
import { cn } from '@/lib/utils';

// Tracks what the user has ghosted and whether it actually stopped charging.
export default function GhostList({ items, onStatus, onRemove }) {
  if (!items.length) return null;
  const { ghosted, confirmed } = ghostTotals(items);

  return (
    <section className="mt-3 rounded-2xl border border-primary/30 bg-primary/[0.05] p-4 sm:p-5" aria-label="Ghost List">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-[15px] font-semibold tracking-tight text-white">👻 Your Ghost List</h3>
        <p className="text-[12.5px] text-muted-foreground">
          <span className="font-bold text-white">{money(ghosted)}/yr</span> ghosted
          {' · '}
          <span className="font-bold text-[#5ee6c8]">{money(confirmed)}/yr</span> confirmed stopped
        </p>
      </div>
      <p className="mt-1 text-[11.5px] text-muted-foreground">Saved in this browser only. Clear my data removes it.</p>

      <ul className="mt-3 divide-y divide-white/[0.06]">
        {items.map((item) => {
          const days = daysSince(item.date);
          const askCheck = item.status === 'requested' && days >= 7;
          return (
            <li key={item.id} className="py-2.5">
              <div className="flex items-center justify-between gap-3">
                <span className="min-w-0 truncate text-[13.5px] text-white/90">{item.merchant}</span>
                <span className="shrink-0 text-[12.5px] tabular-nums text-muted-foreground">{money(item.monthly)}/mo</span>
              </div>
              <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                Ghosted {new Date(item.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
              </p>
              {askCheck && (
                <p className="mt-1 text-[12px] font-semibold text-[#ffc27a]">Did {item.merchant} stop charging?</p>
              )}
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                {Object.entries(STATUSES).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={item.status === key}
                    onClick={() => onStatus(item.id, key)}
                    className={cn(
                      'rounded-full border px-2.5 py-0.5 text-[11.5px] font-bold transition-colors',
                      item.status === key
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  className="ml-auto text-[11.5px] font-bold text-muted-foreground underline-offset-4 hover:underline"
                >
                  Remove
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
