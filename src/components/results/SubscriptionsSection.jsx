import { money } from '@/lib/ghostFees/format';

export default function SubscriptionsSection({ subscriptions }) {
  if (!subscriptions.length) return null;

  return (
    <section className="mt-8">
      <h2 className="text-[15px] font-semibold tracking-tight text-white">Still using these?</h2>
      <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
        Your subscriptions and what each one costs a month. Not counted in the total above.
      </p>

      <ul className="mt-3 divide-y divide-white/[0.06] rounded-2xl border border-white/[0.07] bg-white/[0.025] px-4 sm:px-5">
        {subscriptions.map((subscription) => (
          <li key={subscription.id} className="flex items-center justify-between gap-4 py-3">
            <span className="truncate text-[14px] text-white/90">{subscription.merchant}</span>
            <span className="shrink-0 text-[14px] font-semibold tabular-nums text-white">
              {money(subscription.monthly)}
              <span className="text-[12px] font-normal text-muted-foreground">/mo</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}