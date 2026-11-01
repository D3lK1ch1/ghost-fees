import { Copy, Dumbbell, Landmark, Timer, TrendingUp } from 'lucide-react';

const USE_CASES = [
  {
    Icon: Timer,
    title: 'The free trial you forgot',
    body: 'Free for 7 days, charging you ever since. We spot the first $0 charge and everything paid after it.',
  },
  {
    Icon: Dumbbell,
    title: 'The subscription you forgot',
    body: 'Same charge, every month, forever. The gym, the streaming app, the cloud drive, the one you downloaded once.',
  },
  {
    Icon: Copy,
    title: 'Charged twice',
    body: 'A double hit on the same day, or two charges within a couple of days for the same amount.',
  },
  {
    Icon: TrendingUp,
    title: 'The quiet price rise',
    body: 'Was $12.99, now $17.99 and nobody emailed you. We show the exact date it went up.',
  },
  {
    Icon: Landmark,
    title: 'Bank fees you can ask back',
    body: 'Monthly account fees, ATM fees, international transaction fees. One polite email often gets them waived.',
  },
];

export default function UseCases() {
  return (
    <section className="mx-auto w-full max-w-5xl px-5 pb-24 pt-4 sm:px-8">
      <h2 className="text-center text-[1.6rem] font-semibold leading-tight text-foreground sm:text-[2rem]">
        What it finds
      </h2>
      <p className="mx-auto mt-2 max-w-md text-center text-[14.5px] leading-relaxed text-muted-foreground">
        Five kinds of money leak, all pulled from your own statement. Nothing guessed, nothing projected.
      </p>

      <ol className="mx-auto mt-8 max-w-2xl divide-y divide-border rounded-3xl border border-border bg-card/50">
        {USE_CASES.map(({ Icon, title, body }, index) => (
          <li key={title} className="flex items-start gap-4 px-5 py-5 sm:px-6">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <Icon className="h-5 w-5" strokeWidth={2.2} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-[15.5px] font-semibold text-foreground">{title}</h3>
                <span className="shrink-0 font-retro text-[15px] leading-none text-muted-foreground/60" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
              <p className="mt-1 text-[13.5px] leading-relaxed text-muted-foreground">{body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}