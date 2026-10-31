import { useState } from 'react';
import { CardList, CardItem } from '@/components/GhostAnimations';
import { money } from '@/lib/ghostFees/format';
import { cn } from '@/lib/utils';

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

  const answeredYes = subscriptions.filter((item) => answers[item.id] === 'yes');
  const answeredCount = subscriptions.filter((item) => answers[item.id]).length;
  const yesMonthly = answeredYes.reduce((sum, item) => sum + item.monthly, 0);

  return (
    <section className="mt-8">
      <h2 className="text-[15px] font-semibold tracking-tight text-white">Still using these?</h2>
      <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
        Your subscriptions and what each one costs a month. Not counted in the total above.
      </p>

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
            </div>
          </CardItem>
        ))}
      </CardList>

      {answeredCount > 0 && (
        <p className="mt-2.5 text-[12.5px] leading-relaxed text-muted-foreground">
          {answeredYes.length > 0 ? (
            <>
              You&apos;d sign up again for <strong className="text-foreground">{answeredYes.length}</strong> of{' '}
              {answeredCount} answered today, costing {money(yesMonthly)} a month.
            </>
          ) : (
            <>You wouldn&apos;t sign up again for any of the {answeredCount} you answered.</>
          )}
          {answeredCount < subscriptions.length && ' Answer the rest to see the full picture.'}
        </p>
      )}
    </section>
  );
}