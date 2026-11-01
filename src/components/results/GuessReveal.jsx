import { useState } from 'react';
import { CountUp } from '@/components/GhostAnimations';
import { money } from '@/lib/ghostFees/format';

const MAX_GUESS = 3000;

// Before the total: "How much do you think you lost?" Then the real number counts up.
// The guess stays in this browser tab only.
export default function GuessReveal({ total, months, onDone }) {
  const [guess, setGuess] = useState(100);
  const [revealed, setRevealed] = useState(false);
  const period = `${months} ${months === 1 ? 'month' : 'months'}`;

  return (
    <section className="relative mt-4 overflow-hidden rounded-[2rem] border border-primary/40 bg-card p-6 sm:p-9" aria-label="Guess your number">
      {!revealed ? (
        <>
          <p className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">Before we show you...</p>
          <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
            How much do you think forgotten subscriptions and fees took from you in these {period}?
          </p>
          <p className="mt-5 font-heading text-[2.6rem] font-bold leading-none tabular-nums text-primary">{money(guess)}{guess === MAX_GUESS ? '+' : ''}</p>
          <input
            type="range"
            min={0}
            max={MAX_GUESS}
            step={10}
            value={guess}
            onChange={(event) => setGuess(Number(event.target.value))}
            aria-label="Your guess in dollars"
            className="mt-4 w-full accent-[hsl(var(--primary))]"
          />
          <div className="flex justify-between text-[11.5px] text-muted-foreground">
            <span>$0</span>
            <span>$3,000+</span>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => setRevealed(true)} className="rounded-2xl bg-primary px-6 py-3 text-[16px] font-bold text-primary-foreground">
              Reveal
            </button>
            <button type="button" onClick={() => onDone(null)} className="text-[13px] font-bold text-muted-foreground underline-offset-4 hover:underline">
              Skip
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">It's actually</p>
          <p className="mt-1 font-heading text-[3.6rem] font-bold leading-none text-primary [text-shadow:0_0_28px_hsl(var(--primary)/0.35)] sm:text-[5.5rem]">
            <CountUp value={total} />
          </p>
          <p className="mt-3 text-[16px] font-semibold text-foreground">
            You guessed {money(guess)}. It's actually {money(total)} in {period}.
          </p>
          <p className="mt-1 text-[13.5px] text-muted-foreground">
            {total > guess ? 'More than you thought. Let\'s find where it went.' : 'You know your money well. Let\'s see the details.'}
          </p>
          <button type="button" onClick={() => onDone(guess)} className="mt-5 rounded-2xl bg-primary px-6 py-3 text-[16px] font-bold text-primary-foreground">
            Show me the ghosts
          </button>
        </>
      )}
    </section>
  );
}
