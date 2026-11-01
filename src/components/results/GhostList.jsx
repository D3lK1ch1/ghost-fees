import { useState } from 'react';
import { Share2 } from 'lucide-react';
import { BadgePop } from '@/components/GhostAnimations';
import { money } from '@/lib/ghostFees/format';
import { badgesFor, levelFor } from '@/lib/ghostFees/levels';
import { STATUSES, daysSince, ghostTotals } from '@/lib/ghostFees/ghostList';
import { cn } from '@/lib/utils';

// Tracks what the user has ghosted and whether it actually stopped charging.
export default function GhostList({ items, onStatus, onRemove, overlapIds, priceRiseIds }) {
  const [shared, setShared] = useState(false);
  if (!items.length) return null;
  const { ghosted, confirmed } = ghostTotals(items);
  const { current, next, progress } = levelFor(ghosted);
  const badges = badgesFor(items, { overlapIds, priceRiseIds });

  const share = async () => {
    const text = `I ghosted ${money(ghosted)}/yr of forgotten subscriptions. Level: ${current.name} 👻 hunt-ghost-fees.base44.app`;
    try {
      if (navigator.share) await navigator.share({ text });
      else await navigator.clipboard.writeText(text);
      setShared(true);
    } catch {
      // Share cancelled: nothing to do.
    }
  };

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

      <div className="mt-3 rounded-xl bg-white/[0.03] px-3 py-2.5">
        <div className="flex items-center justify-between gap-2 text-[12.5px]">
          <BadgePop key={current.name} delay={0.1} className="font-bold text-primary">Level: {current.name}</BadgePop>
          <span className="text-muted-foreground">{next ? `${money(next.min - ghosted)} to ${next.name}` : 'Top level'}</span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/[0.08]" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)} aria-label="Progress to next level">
          <div className="h-full rounded-full bg-primary transition-[width] duration-700" style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {badges.map((badge) => (
            badge.earned ? (
              <BadgePop key={badge.key} delay={0.15} className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-bold text-foreground">
                {badge.emoji} {badge.name}
              </BadgePop>
            ) : (
              <span key={badge.key} title={badge.how} className="rounded-full border border-dashed border-white/15 px-2 py-0.5 text-[11px] text-muted-foreground/70">
                🔒 {badge.name}
              </span>
            )
          ))}
          <button type="button" onClick={share} className="ml-auto inline-flex items-center gap-1 text-[11.5px] font-bold text-primary underline-offset-4 hover:underline">
            <Share2 className="h-3.5 w-3.5" />
            {shared ? 'Shared' : 'Share my level'}
          </button>
        </div>
      </div>

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
