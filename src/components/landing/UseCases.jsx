import { Copy, Dumbbell, Landmark, Layers, Timer, TrendingUp } from 'lucide-react';

const USE_CASES = [
  {
    Icon: Timer,
    title: 'The free trial you forgot',
    body: 'Free for 7 days, charging you ever since. We spot the first $0 charge and everything paid after it.',
  },
  {
    Icon: Dumbbell,
    title: 'The gym you never go to',
    body: 'Same charge, every fortnight, forever. Spotify, iCloud, Stan, that app you downloaded once.',
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
  {
    Icon: Layers,
    title: 'Three services doing one job',
    body: 'Netflix and Binge. Audible and Spotify Premium. Four cloud drives. We line them up so you can pick one.',
  },
];

export default function UseCases() {
  return (
    <section className="mx-auto w-full max-w-5xl px-5 pb-24 pt-4 sm:px-8">
      <h2 className="text-center text-[1.6rem] font-semibold leading-tight text-foreground sm:text-[2rem]">
        What we hunt for
      </h2>
      <p className="mx-auto mt-2 max-w-md text-center text-[14.5px] leading-relaxed text-muted-foreground">
        Real charges from your own statements. Nothing guessed, nothing projected.
      </p>

      <div className="mt-8 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {USE_CASES.map(({ Icon, title, body }) => (
          <div key={title} className="rounded-3xl border border-border bg-card/60 p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <Icon className="h-5 w-5" strokeWidth={2.2} />
            </span>
            <h3 className="mt-3.5 text-[15px] font-semibold text-foreground">{title}</h3>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}