import { useState } from 'react';
import { cn } from '@/lib/utils';
import { money } from '@/lib/ghostFees/format';
import { biasGroups } from '@/lib/ghostFees/leaks';
import { checkInDue, doneCount, niceDate, useHabitPlan } from '@/lib/ghostFees/habitPlan';

const HAT = '#ff8a7a';

// Practical strategies per pattern. Everyday tactics, not claims or numbers.
const STRATEGIES = {
  present_bias: ['Put the trial end date in your calendar the day you sign up.', 'Pay trials with a card you can pause in your bank app.', 'Many services let you cancel straight away and keep the trial until it ends.'],
  denomination: ['Check your fees once a month, on payday.', 'Turn on fee alerts in your bank app.', 'Ask once for a waiver: a first request is often granted.'],
  status_quo: ['Put a yearly "still worth it?" check in your calendar for each subscription.', 'When a price goes up, decide again as if you were signing up today.', 'Keep a list of what you pay for, so nothing renews unseen.'],
  ostrich: ['Open your bank app once a week, same day, same time.', 'Ten minutes with one statement a month is enough.', 'Look at the total first, then the biggest line.'],
  mental_accounting: ['Write what each subscription is for. Two with the same job is one too many.', 'Think in totals, not in small separate charges.', 'Keep one of each kind, and rotate the rest.'],
  pain_of_paying: ['Turn off autopay for things you want to notice.', 'Check the full cost before you tap to pay later.', 'Pay off cards in full where you can, so interest never starts.'],
};

// Hattie builds on Mo: Mo explains why; Hattie ranks the patterns by what they cost,
// gives strategies for the one you pick, sets one habit and tracks it week by week.
// prefer: the pattern you told Mo "sounds like me", so Hattie picks up where Mo left off.
export default function HabitCoach({ leaks, onOpenHabit, onAskMo, hank = false, prefer = null }) {
  const groups = biasGroups(leaks);
  const [plan] = useHabitPlan();
  const [pick, setPick] = useState(() => (prefer && groups.find((g) => g.key === prefer)?.key) || (plan && groups.find((g) => g.key === plan.patternKey)?.key) || groups[0]?.key);
  if (!groups.length) return null;
  const g = groups.find((x) => x.key === pick) || groups[0];
  const max = Math.max(...groups.map((x) => x.total));
  const mine = plan && plan.patternKey === g.key ? plan : null;
  const weeks = mine ? doneCount(mine) : 0;
  const name = hank ? 'Hank' : 'Hattie';
  const btn = 'rounded-full border border-border px-2.5 py-1 text-[12.5px] font-bold text-foreground transition-colors hover:border-[#ff8a7a]';
  return (
    <div className="mt-2 w-full rounded-xl border p-3" style={{ borderColor: `${HAT}66`, background: `${HAT}0d` }}>
      <p className="text-[12px] font-bold uppercase tracking-wide" style={{ color: HAT }}>1. Building on Mo: what each pattern costs you</p>
      <ul className="mt-1.5 space-y-1">
        {groups.map((x) => (
          <li key={x.key}>
            <button type="button" onClick={() => setPick(x.key)} aria-pressed={x.key === g.key} className={cn('w-full rounded-lg px-2 py-1 text-left', x.key === g.key ? 'bg-white/10' : 'hover:bg-white/5')}>
              <span className="flex items-baseline justify-between gap-2 text-[13.5px]">
                <span className={cn('font-bold', x.key === g.key ? 'text-foreground' : 'text-muted-foreground')}>{x.bias}</span>
                <span className="shrink-0 font-semibold text-muted-foreground">{money(x.total)}</span>
              </span>
              <span className="mt-0.5 block h-1.5 overflow-hidden rounded-full bg-white/10">
                <span className="block h-full rounded-full" style={{ width: `${(x.total / max) * 100}%`, background: x.key === g.key ? HAT : `${HAT}66` }} />
              </span>
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-1 text-[12.5px] text-muted-foreground">{g.key === prefer ? 'You told Mo this one sounds like you, so we start here.' : g === groups[0] ? 'This one costs you the most, so start here.' : 'Tap any pattern to plan for it.'} <button type="button" onClick={() => onAskMo?.(g.key)} className="font-bold text-foreground underline-offset-2 hover:underline">Why does it happen? Ask Mo →</button></p>

      <p className="mt-3 text-[12px] font-bold uppercase tracking-wide" style={{ color: HAT }}>2. Strategies for {g.bias}</p>
      <ul className="mt-1 space-y-1">
        {(STRATEGIES[g.key] || []).map((tip) => <li key={tip} className="team-cascade flex gap-2 text-[13.5px] text-foreground"><span aria-hidden="true">✔︎</span>{tip}</li>)}
      </ul>

      <p className="mt-3 text-[12px] font-bold uppercase tracking-wide" style={{ color: HAT }}>3. Your one habit</p>
      <p className="mt-1 rounded-lg bg-background/60 px-2.5 py-2 text-[14px] font-semibold text-foreground">&ldquo;{mine?.habitText || g.beat}&rdquo;</p>

      <p className="mt-3 text-[12px] font-bold uppercase tracking-wide" style={{ color: HAT }}>4. Track it</p>
      {mine ? (
        <>
          <p className="mt-1 text-[13.5px] text-foreground">Started {niceDate(mine.startDate)}. Weeks kept: <span className="font-bold">{weeks}</span>{weeks >= 2 ? ' 🏅 Habit Keeper!' : ''}</p>
          <p className="mt-1 flex gap-1" aria-label={`${weeks} of 4 weeks kept`}>
            {[0, 1, 2, 3].map((w) => <span key={w} className="h-2.5 flex-1 rounded-full" style={{ background: w < weeks ? HAT : 'rgba(255,255,255,0.12)' }} />)}
          </p>
          {checkInDue(mine) && <p className="mt-1 text-[13px] font-bold" style={{ color: HAT }}>Check-in due: did you do it this week?</p>}
        </>
      ) : (
        <p className="mt-1 text-[13.5px] text-muted-foreground">Pick a start day and it goes in your calendar with a check-in a week later. {name} tracks your weeks here.</p>
      )}
      <div className="mt-2 flex flex-wrap gap-1.5">
        <button type="button" className={cn(btn, 'border-transparent text-[#2a1010]')} style={{ background: HAT }} onClick={() => onOpenHabit?.(g.key)}>{mine ? 'Open my habit plan' : 'Set my start day'}</button>
        {mine && checkInDue(mine) && <button type="button" className={btn} onClick={() => onOpenHabit?.(g.key)}>Check in now</button>}
      </div>
      <p className="mt-2.5 text-[12px] leading-snug text-muted-foreground">
        Fresh starts help: people stick to plans better from a new week or month (Dai, Milkman &amp; Riis, 2014). Habits take a while to feel automatic, often weeks (Lally et al., 2010).
      </p>
    </div>
  );
}
