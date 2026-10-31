import GhostMark from '@/components/site/GhostMark';

// Shown instead of the total when a statement has no leaks.
export default function EmptyState({ fileNames = [], onRestart, onSample }) {
  const file = fileNames.length ? fileNames.join(', ') : 'your statement';

  return (
    <section className="mt-4 flex flex-col items-center rounded-[2rem] border border-border bg-card px-6 py-10 text-center sm:py-14">
      <span className="animate-float rounded-full p-4 shadow-[0_0_60px_hsl(var(--primary)/0.2)]">
        <GhostMark className="h-20 w-20 text-foreground" eyeColor="#150e28" />
      </span>
      <h2 className="mt-5 font-heading text-[1.9rem] font-bold leading-tight text-foreground sm:text-[2.4rem]">
        No ghosts found. Your account is clean.
      </h2>
      <p className="mt-3 max-w-md text-[14.5px] leading-relaxed text-muted-foreground">
        We checked every transaction in <span className="rounded-md bg-background px-1.5 py-0.5 font-mono text-[13px] font-bold text-foreground">{file}</span>{' '}
        for repeat charges, bank fees and price rises. Nothing spooky.
      </p>

      <div className="mt-7 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <button
          type="button"
          onClick={onRestart}
          className="rounded-2xl border border-border bg-background/60 px-6 py-3.5 text-[15px] font-bold text-foreground transition-colors hover:border-primary/50"
        >
          Scan another statement
        </button>
        {onSample && (
          <button
            type="button"
            onClick={onSample}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-[15px] font-bold text-primary-foreground shadow-[0_8px_30px_hsl(var(--primary)/0.3)] transition-transform hover:-translate-y-0.5"
          >
            <GhostMark className="h-5 w-5 text-primary-foreground" eyeColor="hsl(30 100% 62%)" />
            See the sample results
          </button>
        )}
      </div>

      <p className="mt-6 text-[13.5px] text-muted-foreground">
        Think we missed one?{' '}
        <button
          type="button"
          onClick={() => document.getElementById('feedback')?.scrollIntoView({ behavior: 'smooth' })}
          className="font-bold text-primary underline underline-offset-4"
        >
          Tell us in 20 seconds
        </button>
      </p>
    </section>
  );
}