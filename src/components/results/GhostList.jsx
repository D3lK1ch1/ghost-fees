import { useState } from 'react';
import { Share2 } from 'lucide-react';
import { BadgePop } from '@/components/GhostAnimations';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { money } from '@/lib/ghostFees/format';
import { badgesFor, levelFor } from '@/lib/ghostFees/levels';
import { STATUSES, daysSince, ghostTotals, savedSoFar } from '@/lib/ghostFees/ghostList';
import { cn } from '@/lib/utils';
import { useGhostName } from '@/hooks/use-ghost-name';
import GhostNameField from './GhostNameField';
import { ProofSummary } from './ProofDialog';

// Tracks what the user has ghosted, the proof they kept and whether it actually
// stopped charging. Still charging? The proof is what gets the money back.
export default function GhostList({ items, onStatus, onRemove, onAddProof, overlapIds, priceRiseIds }) {
  const [shared, setShared] = useState(false);
  const [ghostName] = useGhostName();
  // Celebrate the confirm, not the click: the big moment only when it really stopped.
  const [cheer, setCheer] = useState(null);
  const setStatus = (item, status) => {
    if (status === 'confirmed' && item.status !== 'confirmed') {
      setCheer({ merchant: item.merchant, yearly: (Number(item.monthly) || 0) * 12 });
      setTimeout(() => setCheer(null), 3200);
    }
    onStatus(item.id, status);
  };
  if (!items.length) return null;
  const { ghosted, confirmed } = ghostTotals(items);
  const { current, next, progress } = levelFor(ghosted);
  const badges = badgesFor(items, { overlapIds, priceRiseIds });
  const saved = savedSoFar(items);


  const share = async () => {
    const text = `${ghostName} and I ghosted ${money(ghosted)}/yr of forgotten subscriptions. Level: ${current.name} 👻 hunt-ghost-fees.base44.app`;
    try {
      if (navigator.share) await navigator.share({ text });
      else await navigator.clipboard.writeText(text);
      setShared(true);
    } catch {
      // Share cancelled: nothing to do.
    }
  };

  return (
    <section className="relative mt-3 rounded-2xl border border-primary/30 bg-primary/[0.05] p-4 sm:p-5" aria-label="Ghost List">
      {cheer && (
        <div role="status" className="gl-cheer pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-background/80 text-center">
          {Array.from({ length: 22 }, (_, i) => (
            <span key={i} aria-hidden="true" className="gl-confetti absolute top-0" style={{ left: `${(i * 41) % 100}%`, width: i % 2 ? 7 : 9, height: i % 3 ? 11 : 7, borderRadius: i % 4 ? 2 : '50%', background: ['#ff6f7d', '#5ee6c8', '#ffd36e', '#b79cff'][i % 4], animationDelay: `${(i % 6) * 0.12}s` }} />
          ))}
          <span aria-hidden="true" className="gl-leave text-[54px]">👻</span>
          <p className="font-heading text-[22px] font-bold text-foreground">{cheer.merchant} is gone for good!</p>
          <p className="text-[14px] font-semibold text-[#5ee6c8]">{money(cheer.yearly)} a year back in your pocket.</p>
        </div>
      )}
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-[15px] font-semibold tracking-tight text-white">👻 {ghostName}&apos;s Ghost List</h3>
        <p className="text-[13.5px] text-muted-foreground">
          <span className="font-bold text-white">{money(ghosted)}/yr</span> ghosted
          {' · '}
          <span className="font-bold text-[#5ee6c8]">{money(confirmed)}/yr</span> confirmed stopped
        </p>
      </div>
      {saved >= 0.01 && (
        <p className="mt-1 text-[14px] font-semibold text-[#5ee6c8]">
          Saved so far: {money(saved)} <span className="text-[12.5px] font-normal text-muted-foreground">(each price, per day since you ghosted it)</span>
        </p>
      )}
      <p className="mt-1 text-[12.5px] text-muted-foreground">Saved in this browser only. Clear my data removes it. A new statement checks each one for you.</p>
      <GhostNameField className="mt-2" />

      {/* Level and badges: a bit of fun as you cancel. They never change any numbers.
          Each badge says how to earn it, so the purpose is clear (feedback, 2 Nov). */}
      <div className="mt-3 rounded-xl bg-white/[0.03] px-3 py-3">
        <div className="flex items-center justify-between gap-2 text-[13.5px]">
          <BadgePop key={current.name} delay={0.1} className="font-bold text-primary">Level: {current.name}</BadgePop>
          <span className="text-muted-foreground">{next ? `Ghost ${money(next.min - ghosted)}/yr more to reach ${next.name}` : 'Top level'}</span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/[0.08]" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)} aria-label="Progress to next level">
          <div className="h-full rounded-full bg-primary transition-[width] duration-700" style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
        <p className="mt-1.5 text-[12.5px] text-muted-foreground">Your level goes up with every dollar a year you ghost. Badges are just for fun: earn them as you cancel, then share them.</p>
        <ul className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4" aria-label="Badges">
          {badges.map((badge) => (
            <li key={badge.key}>
              {/* Tap a badge for what it is and how to earn it. */}
              <Popover>
                <PopoverTrigger className={badge.earned ? 'h-full w-full rounded-xl bg-primary/15 px-2.5 py-2 text-left hover:bg-primary/25' : 'h-full w-full rounded-xl border border-dashed border-white/15 px-2.5 py-2 text-left hover:border-primary/50'}>
                  {badge.earned ? (
                    <BadgePop delay={0.15} className="block text-[13px] font-bold text-foreground">{badge.emoji} {badge.name}</BadgePop>
                  ) : (
                    <span className="block text-[13px] font-bold text-muted-foreground">🔒 {badge.name}</span>
                  )}
                  <span className={badge.earned ? 'block text-[12.5px] text-primary' : 'block text-[12.5px] leading-snug text-muted-foreground/80'}>{badge.earned ? 'Earned · what’s this?' : badge.how}</span>
                </PopoverTrigger>
                <PopoverContent className="w-72 rounded-2xl text-[14px]">
                  <p className="font-heading text-[15px] font-bold text-foreground">{badge.emoji} {badge.name}</p>
                  <p className="mt-0.5 text-[13px] font-bold text-primary">{badge.earned ? 'You earned this one' : `How to earn it: ${badge.how.toLowerCase()}`}</p>
                  <p className="mt-1.5 leading-snug text-muted-foreground">{badge.about}</p>
                  <p className="mt-2 border-t border-border pt-2 text-[12.5px] text-muted-foreground">Badges and levels are just for fun and never change your numbers. Everyone gets them, on Free too.</p>
                </PopoverContent>
              </Popover>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex justify-end">
          <button type="button" onClick={share} className="inline-flex items-center gap-1 text-[12.5px] font-bold text-primary underline-offset-4 hover:underline">
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
                <span className="min-w-0 truncate text-[14.5px] text-white/90">{item.merchant}</span>
                <span className="shrink-0 text-[13.5px] tabular-nums text-muted-foreground">{money(item.monthly)}/mo</span>
              </div>
              <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                Ghosted {new Date(item.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
              </p>
              <ProofSummary proof={item.proof} className="mt-1" onAdd={onAddProof ? () => onAddProof(item) : undefined} />
              {item.status === 'charging' && (
                <p className="mt-1 rounded-lg bg-[#ffc27a]/10 px-2.5 py-1.5 text-[13px] leading-relaxed text-foreground">
                  <span className="font-bold">Charged again?</span> {item.proof ? 'Send' : 'Find your cancel email or screenshot and send'} {item.merchant} your proof and ask for a refund. If they say no, call your bank and ask to dispute the charge.
                </p>
              )}
              {item.checkNote && (
                <p className={cn('mt-1 text-[13px] font-semibold', item.status === 'charging' ? 'text-[#ffc27a]' : 'text-[#5ee6c8]')}>{item.checkNote}</p>
              )}
              {askCheck && (
                <div className="mt-1.5 rounded-xl border border-[#ffc27a]/50 bg-[#ffc27a]/10 px-3 py-2">
                  <p className="text-[14px] font-bold text-foreground">It&apos;s been {days} days. Did {item.merchant} stop charging?</p>
                  <div className="mt-1.5 flex gap-2">
                    <button type="button" onClick={() => setStatus(item, 'confirmed')} className="rounded-full bg-[#5ee6c8] px-3 py-1 text-[13.5px] font-bold text-[#0f2a24]">Yes, it stopped</button>
                    <button type="button" onClick={() => setStatus(item, 'charging')} className="rounded-full border border-[#ffc27a] px-3 py-1 text-[13.5px] font-bold text-foreground">Still charging</button>
                  </div>
                </div>
              )}
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                {Object.entries(STATUSES).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={item.status === key}
                    onClick={() => setStatus(item, key)}
                    className={cn(
                      'rounded-full border px-2.5 py-0.5 text-[12.5px] font-bold transition-colors',
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
                  className="ml-auto text-[12.5px] font-bold text-muted-foreground underline-offset-4 hover:underline"
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
