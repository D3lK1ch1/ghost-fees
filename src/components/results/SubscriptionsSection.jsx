import { useState } from 'react';
import { CardList, CardItem } from '@/components/GhostAnimations';
import { CalendarPlus } from 'lucide-react';
import { money } from '@/lib/ghostFees/format';
import { downloadReminder } from '@/lib/ghostFees/reminder';
import { cn } from '@/lib/utils';

const GYM_RE = /\b(GYM|FITNESS|FITLIFE|ANYTIME|GOODLIFE|JETTS|SNAP|F45|CROSSFIT|PILATES|YOGA)\b/i;

// App store charges bundle many subscriptions into one statement line.
function bundleHint(merchant) {
  if (/\b(APPLE|ITUNES|ICLOUD)\b/i.test(merchant)) return 'Apple bundles subscriptions into one charge. See them all in Settings > your name > Subscriptions.';
  if (/\bGOOGLE\b/i.test(merchant)) return 'Google bundles subscriptions into one charge. See them all in Google Play > Payments & subscriptions.';
  return null;
}

const ANSWERS = [
  { key: 'yes', label: 'Yes' },
  { key: 'no', label: 'No' },
];

export default function SubscriptionsSection({ subscriptions }) {
  const [answers, setAnswers] = useState({});

  if (!subscriptions.length) return null;

  const answer = (id, key) => {
    setAnswers((current) => ({ ...current, [id]: current[id] === key ? undefined : key }));
  };

  const gym = subscriptions.find((item) => GYM_RE.test(item.merchant));

  return (
    <section className="mt-8">
      <h2 className="text-[15px] font-semibold tracking-tight text-white">Still using these?</h2>
      <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
        Your subscriptions and what each one costs a month. Not counted in the total above.
      </p>

      {gym && (
        <div className="mt-3 flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/[0.07] px-4 py-3">
          <span className="text-2xl" aria-hidden="true">🏋️</span>
          <p className="text-[13.5px] leading-relaxed text-foreground">
            <span className="font-bold">{gym.merchant}: {money(gym.monthly)} a month.</span>{' '}
            <span className="text-muted-foreground">Been this month?</span>
          </p>
        </div>
      )}

      <CardList className="mt-3 divide-y divide-white/[0.06] rounded-2xl border border-white/[0.07] bg-white/[0.025] px-4 sm:px-5">
        {subscriptions.map((subscription, index) => (
          <CardItem key={subscription.id} index={index} className="py-3">
            <div className="flex items-center justify-between gap-4">
              <span className="truncate text-[14px] text-white/90">{subscription.merchant}</span>
              <span className="shrink-0 text-[14px] font-semibold tabular-nums text-white">
                {money(subscription.monthly)}
                <span className="text-[12px] font-normal text-muted-foreground">/mo</span>
              </span>
            </div>

            {bundleHint(subscription.merchant) && (
              <p className="mt-1 text-[11.5px] leading-relaxed text-[#ffc27a]">{bundleHint(subscription.merchant)}</p>
            )}

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-[11.5px] text-muted-foreground">Would you sign up for it today?</span>
              {ANSWERS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  aria-pressed={answers[subscription.id] === option.key}
                  onClick={() => answer(subscription.id, option.key)}
                  className={cn(
                    'rounded-full border px-2.5 py-0.5 text-[11.5px] font-bold transition-colors',
                    answers[subscription.id] === option.key
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border text-muted-foreground hover:text-foreground',
                  )}
                >
                  {option.label}
                </button>
              ))}
              {subscription.lastDate && (
                <button
                  type="button"
                  onClick={() => downloadReminder(subscription)}
                  className="ml-auto inline-flex items-center gap-1 text-[11.5px] font-bold text-primary underline-offset-4 hover:underline"
                >
                  <CalendarPlus className="h-3.5 w-3.5" />
                  Remind me
                </button>
              )}
            </div>
          </CardItem>
        ))}
      </CardList>

      <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground/90">
        <span className="font-bold text-foreground/90">Know your rights:</span> from 1 July 2027, cancelling a subscription
        must be as easy as signing up. You can report subscription traps to the{' '}
        <a href="https://www.accc.gov.au/" target="_blank" rel="noreferrer" className="font-bold text-primary underline underline-offset-4">ACCC</a>.
      </p>
    </section>
  );
}